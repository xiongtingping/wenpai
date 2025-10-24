/**
 * RSSHub Proxy (Netlify Function)
 * - Solves browser CORS for https://rsshub.app
 * - Supports GET / HEAD / OPTIONS
 * - Whitelists origins and sanitises target path to avoid SSRF
 * - Adds lightweight in-memory caching to mitigate upstream 429
 */

// ⚠️ Ephemeral in-memory cache (per warm function instance)
const CACHE = new Map(); // key -> { body, status, headers, contentType, ts, ttl }
const PENDING = new Map(); // key -> Promise

function getTTL(path) {
  if (path.startsWith('/api/category/popular')) return 5 * 60 * 1000; // 5m
  if (path.startsWith('/api/namespace')) return 10 * 60 * 1000; // 10m
  if (path.includes('/radar/')) return 10 * 60 * 1000; // 10m
  // RSS feeds: cache briefly
  return 60 * 1000; // 1m
}

exports.handler = async (event) => {
  const allowedOrigins = [
    'https://www.wenpai.xyz',
    'https://wenpai.netlify.app',
    'http://localhost:5173',
    'http://localhost:3000'
  ];

  const origin = event.headers.origin || event.headers.Origin || '';
  const isAllowedOrigin = allowedOrigins.includes(origin);
  const corsHeaders = {
    'Access-Control-Allow-Origin': isAllowedOrigin ? origin : allowedOrigins[0],
    'Vary': 'Origin',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, Accept',
    'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
    'Access-Control-Allow-Credentials': 'true'
  };

  // Preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers: {
        ...corsHeaders,
        'Access-Control-Max-Age': '86400'
      },
      body: ''
    };
  }

  try {
    const qs = event.queryStringParameters || {};
    const rawPath = (qs.path || '').toString();
    if (!rawPath) {
      return {
        statusCode: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json; charset=utf-8' },
        body: JSON.stringify({ error: 'Missing required query parameter: path' })
      };
    }

    // Sanitize path to avoid SSRF (only allow paths, no absolute URLs)
    let path = rawPath.trim();
    if (path.startsWith('http://') || path.startsWith('https://')) {
      try {
        const u = new URL(path);
        path = u.pathname + (u.search || '');
      } catch {
        return {
          statusCode: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json; charset=utf-8' },
          body: JSON.stringify({ error: 'Invalid path URL' })
        };
      }
    }
    if (!path.startsWith('/')) path = `/${path}`;

    const base = process.env.RSSHUB_BASE_URL || 'https://rsshub.app';
    const fallbacks = (process.env.RSSHUB_FALLBACK_BASE_URLS || '')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    const bases = [base, ...fallbacks];

    const method = event.httpMethod === 'HEAD' ? 'HEAD' : 'GET';
    const accept = qs.accept || event.headers['accept'] || 'application/json, text/xml, application/rss+xml';

    // cacheKey 不包含 base，跨镜像共享
    const cacheKey = `${method}:${path}:${accept}`;
    const now = Date.now();
    const ttl = getTTL(path);

    // Serve from cache if fresh
    const cached = CACHE.get(cacheKey);
    if (cached && (now - cached.ts) < cached.ttl) {
      return {
        statusCode: cached.status,
        headers: { ...corsHeaders, 'Content-Type': cached.contentType, 'X-Cache': 'HIT' },
        body: cached.body
      };
    }

    // De-duplicate in-flight requests
    if (PENDING.has(cacheKey)) {
      try {
        const result = await PENDING.get(cacheKey);
        return {
          statusCode: result.status,
          headers: { ...corsHeaders, 'Content-Type': result.contentType, 'X-Cache': 'HIT-PENDING' },
          body: result.body
        };
      } catch {
        // fallthrough to fresh fetch
      }
    }

    const fetchOptions = {
      method,
      headers: { 'Accept': accept, 'User-Agent': 'WenPai-Netlify-RSSHub-Proxy/1.0' }
    };

    const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

    const doFetch = async () => {
      const maxRetries = 2;
      for (let attempt = 0; attempt <= maxRetries; attempt++) {
        for (let i = 0; i < bases.length; i++) {
          const targetUrl = `${bases[i]}${path}`;
          const resp = await fetch(targetUrl, fetchOptions);

          const isOk = resp.status >= 200 && resp.status < 400;
          const isRetryable = resp.status === 429 || resp.status >= 500;

        if (method === 'HEAD') {
          if (isOk) {
            const result = { status: resp.status, contentType: 'application/octet-stream', body: '', ttl };
            CACHE.set(cacheKey, { ...result, ts: now });
            return result;
          }
          if (isRetryable) {
            const stale = CACHE.get(cacheKey);
            if (stale) return { status: stale.status, contentType: 'application/octet-stream', body: '', ttl };
            // 尝试下一个镜像
            if (i < bases.length - 1) {
              continue; // next base
            }
            if (attempt < maxRetries) {
              const retryAfter = parseInt(resp.headers.get('retry-after') || '', 10);
              const backoff = retryAfter ? retryAfter * 1000 : Math.min(1000 * Math.pow(2, attempt), 4000);
              await sleep(backoff + Math.floor(Math.random() * 250));
              break; // retry loop
            }
          }
          return { status: resp.status, contentType: 'application/octet-stream', body: '', ttl };
        }

        const contentType = resp.headers.get('content-type') || 'application/octet-stream';
        const isText = /json|xml|text/.test(contentType);
        const body = isText ? await resp.text() : Buffer.from(await resp.arrayBuffer()).toString('base64');

        if (isOk) {
          CACHE.set(cacheKey, { body, status: resp.status, contentType, ts: now, ttl });
          return { status: resp.status, contentType, body, ttl };
        }

        if (isRetryable) {
          const stale = CACHE.get(cacheKey);
          if (stale) return { status: stale.status, contentType: stale.contentType, body: stale.body, ttl };
          // 尝试下一个镜像
          if (i < bases.length - 1) {
            continue; // next base
          }
          if (attempt < maxRetries) {
            const retryAfter = parseInt(resp.headers.get('retry-after') || '', 10);
            const backoff = retryAfter ? retryAfter * 1000 : Math.min(1000 * Math.pow(2, attempt), 4000);
            await sleep(backoff + Math.floor(Math.random() * 250));
            break; // retry loop
          }
        }

        return { status: resp.status, contentType, body, ttl };
      }

      // retry attempt next
      }

      // normally unreachable
      return { status: 502, contentType: 'application/json; charset=utf-8', body: JSON.stringify({ error: 'Upstream unavailable' }), ttl };
    };

    const pendingPromise = doFetch();
    PENDING.set(cacheKey, pendingPromise);
    const result = await pendingPromise.finally(() => PENDING.delete(cacheKey));

    return {
      statusCode: result.status,
      headers: {
        ...corsHeaders,
        'Content-Type': result.contentType,
        ...(result.contentType.match(/json|xml|text/) ? {} : { 'Content-Transfer-Encoding': 'base64' })
      },
      body: result.body
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify({ error: 'Proxy error', message: err.message })
    };
  }
};

