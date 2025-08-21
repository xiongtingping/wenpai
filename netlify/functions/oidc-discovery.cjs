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

    const appId = appIdFromQs || AUTHING_APP_ID || VITE_AUTHING_APP_ID || '68a58c57614a821a46f264f7';
    const host = (hostFromQs || AUTHING_HOST || VITE_AUTHING_HOST || 'https://rzcswqs4sq0f.authing.cn').replace(/\/$/, '');

    console.log('🔍 OIDC Discovery:', {
      appId: appId.substring(0, 8) + '...',
      host: host,
      fromQuery: !!hostFromQs || !!appIdFromQs
    });

    const candidates = [
      `${host}/.well-known/openid_configuration`,
      `${host}/oidc/.well-known/openid_configuration`,
      `${host}/${appId}/.well-known/openid_configuration`,
      `${host}/${appId}/oidc/.well-known/openid_configuration`,
      `${host}/api/v2/oidc/.well-known/openid_configuration`
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
      console.log('⚠️ OIDC Discovery失败，返回默认配置');
      // 返回默认配置而不是错误
      discovered = {
        issuer: host,
        authorization_endpoint: `${host}/${appId}/login`,
        token_endpoint: `${host}/oidc/token`,
        userinfo_endpoint: `${host}/oidc/me`,
        _source: 'fallback',
        _fallback: true
      };
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

