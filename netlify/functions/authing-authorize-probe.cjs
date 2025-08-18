/**
 * Netlify Function: Authing authorize endpoint probe
 * Input (query or JSON body): { host, appId, client_id, candidates?: string[] }
 * Output: { authorization_endpoint, redirect_uri, namespace: 'none'|'app', tried }
 */

exports.handler = async (event) => {
  try {
    const method = event.httpMethod || 'GET';
    let payload = {};
    if (method === 'POST' && event.body) {
      try { payload = JSON.parse(event.body); } catch (_) {}
    }
    const qs = event.queryStringParameters || {};

    const host = (payload.host || qs.host || '').replace(/\/$/, '');
    const appId = payload.appId || qs.appId || '';
    const client_id = payload.client_id || qs.client_id || appId || '';

    if (!host || !client_id) {
      return { statusCode: 400, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ error: 'missing host or client_id' }) };
    }

    const baseCandidates = [
      'https://www.wenpai.xyz/callback',
      'https://wenpai.netlify.app/callback',
      'https://preview.wenpai.xyz/callback',
      'http://localhost:5173/callback',
      'https://wenpai.xyz/callback'
    ];
    const withSlash = baseCandidates.map(u => u.endsWith('/') ? u : `${u}/`);
    const withoutSlash = baseCandidates.map(u => u.endsWith('/') ? u.slice(0, -1) : u);
    const defaultCandidates = Array.from(new Set([...withSlash, ...withoutSlash]));
    const candidates = Array.isArray(payload.candidates) ? payload.candidates : defaultCandidates;

    const namespaces = [{ ns: 'none', path: '/oidc/auth' }];
    if (appId) {
      namespaces.push({ ns: 'app', path: `/${appId}` }); // 直接使用 appId 作为端点（后台显示格式）
      namespaces.push({ ns: 'app-oidc', path: `/${appId}/oidc/auth` }); // 带 oidc/auth 后缀
    }

    const tried = [];

    // util: PKCE challenge
    const toBase64Url = (buffer) => Buffer.from(buffer).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    const crypto = require('crypto');

    for (const space of namespaces) {
      const authBase = `${host}${space.path}`;
      for (const redirect_uri of candidates) {
        const verifier = toBase64Url(crypto.randomBytes(32));
        const challenge = toBase64Url(crypto.createHash('sha256').update(verifier).digest());
        const params = new URLSearchParams({
          client_id,
          redirect_uri,
          response_type: 'code',
          scope: 'openid',
          code_challenge: challenge,
          code_challenge_method: 'S256'
        });
        const url = `${authBase}?${params.toString()}`;
        tried.push(url);
        try {
          const resp = await fetch(url, { redirect: 'manual' });
          // Accept if not a 400, typical flows redirect (3xx) or serve login page (200)
          if (resp.status !== 400) {
            return {
              statusCode: 200,
              headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
              body: JSON.stringify({ authorization_endpoint: authBase, redirect_uri, namespace: space.ns, tried })
            };
          }
          // Try to parse body to confirm mismatch
          let text = '';
          try { text = await resp.text(); } catch (_) {}
          if (!/redirect_uri/i.test(text)) {
            // Some providers still use 400 for other reasons; consider next candidate
            continue;
          }
        } catch (_) {}
      }
    }

    return { statusCode: 422, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ error: 'no_acceptable_redirect_uri', tried, host, appId, client_id }) };
  } catch (e) {
    return { statusCode: 500, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ error: e.message }) };
  }
};

