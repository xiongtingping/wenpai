/**
 * RSSHub Proxy (Netlify Function)
 * - Solves browser CORS for https://rsshub.app
 * - Supports GET / HEAD / OPTIONS
 * - Whitelists origins and sanitises target path to avoid SSRF
 */

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
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
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
    const targetUrl = `${base}${path}`;

    const accept = qs.accept || event.headers['accept'] || 'application/json';

    const fetchOptions = {
      method: event.httpMethod === 'HEAD' ? 'HEAD' : 'GET',
      headers: { 'Accept': accept, 'User-Agent': 'WenPai-Netlify-RSSHub-Proxy/1.0' }
    };

    const resp = await fetch(targetUrl, fetchOptions);

    // For HEAD, return only headers
    if (event.httpMethod === 'HEAD') {
      return {
        statusCode: resp.status,
        headers: { ...corsHeaders },
        body: ''
      };
    }

    const contentType = resp.headers.get('content-type') || 'application/octet-stream';
    const isText = /json|xml|text/.test(contentType);
    const body = isText ? await resp.text() : Buffer.from(await resp.arrayBuffer()).toString('base64');

    return {
      statusCode: resp.status,
      headers: {
        ...corsHeaders,
        'Content-Type': contentType,
        ...(isText ? {} : { 'Content-Transfer-Encoding': 'base64' })
      },
      body
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify({ error: 'Proxy error', message: err.message })
    };
  }
};

