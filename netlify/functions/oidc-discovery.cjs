/**
 * Netlify Function: OIDC Discovery for Authing
 * Try standard and appId-prefixed well-known endpoints and return the discovered endpoints
 */

exports.handler = async (event) => {
  try {
    const qs = event && event.queryStringParameters ? event.queryStringParameters : {};
    const hostFromQs = (qs.host || '').replace(/\/$/, '');
    const appIdFromQs = qs.appId || '';

    const {
      AUTHING_APP_ID,
      AUTHING_HOST,
      VITE_AUTHING_APP_ID,
      VITE_AUTHING_HOST
    } = process.env;

    const appId = appIdFromQs || AUTHING_APP_ID || VITE_AUTHING_APP_ID;
    const host = (hostFromQs || AUTHING_HOST || VITE_AUTHING_HOST || '').replace(/\/$/, '');

    if (!host || !appId) {
      return { statusCode: 500, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ error: 'Missing AUTHING_HOST or APP_ID' }) };
    }

    const candidates = [
      `${host}/.well-known/openid-configuration`,
      `${host}/.well-known/oauth-authorization-server`,
      `${host}/${appId}/.well-known/openid-configuration`,
      `${host}/${appId}/.well-known/oauth-authorization-server`
    ];

    let discovered = null;
    for (const url of candidates) {
      try {
        const resp = await fetch(url);
        if (resp.ok) {
          const json = await resp.json();
          if (json.authorization_endpoint && json.token_endpoint) {
            discovered = { ...json, _source: url };
            break;
          }
        }
      } catch (_) {}
    }

    if (!discovered) {
      return { statusCode: 502, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ error: 'discovery_failed', candidates }) };
    }

    const payload = {
      issuer: discovered.issuer,
      authorization_endpoint: discovered.authorization_endpoint,
      token_endpoint: discovered.token_endpoint,
      _source: discovered._source
    };

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
      body: JSON.stringify(payload)
    };
  } catch (e) {
    return { statusCode: 500, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ error: e.message }) };
  }
};

