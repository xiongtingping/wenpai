/**
 * Netlify Function: Authing OIDC code -> token exchange and user info fetch
 * Method: POST
 * Body: { code: string }
 */

exports.handler = async (event) => {
  const allowedOrigins = [
    'https://www.wenpai.xyz',
    'https://wenpai.netlify.app',
    'http://localhost:5173'
  ];
  const origin = event.headers.origin || event.headers.Origin || allowedOrigins[0];
  const isAllowedOrigin = allowedOrigins.includes(origin);
  const baseHeaders = {
    'Access-Control-Allow-Origin': isAllowedOrigin ? origin : allowedOrigins[0],
    'Vary': 'Origin',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Credentials': 'true',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: baseHeaders, body: '' };
  }

  try {
    if (event.httpMethod !== 'POST') {
      return { statusCode: 405, headers: baseHeaders, body: JSON.stringify({ error: 'Method Not Allowed' }) };
    }

    const {
      AUTHING_APP_ID,
      AUTHING_HOST,
      AUTHING_REDIRECT_URI,
      VITE_AUTHING_APP_ID,
      VITE_AUTHING_HOST,
      VITE_AUTHING_REDIRECT_URI_PROD
    } = process.env;

    // 对于免费版环境，优先使用前端构建期变量中的非密钥配置
    const appId = AUTHING_APP_ID || VITE_AUTHING_APP_ID;
    const host = (AUTHING_HOST || VITE_AUTHING_HOST || '').replace(/\/$/, '');
    const redirectUri = AUTHING_REDIRECT_URI || VITE_AUTHING_REDIRECT_URI_PROD;

    if (!appId || !host || !redirectUri) {
      return {
        statusCode: 500,
        headers: baseHeaders,
        body: JSON.stringify({ error: 'Authing server config missing: require APP_ID, HOST, REDIRECT_URI' })
      };
    }

    const body = event.body ? JSON.parse(event.body) : {};
    const code = body.code;
    const code_verifier = body.code_verifier;
    if (!code || !code_verifier) {
      return { statusCode: 400, headers: baseHeaders, body: JSON.stringify({ error: 'Missing code or code_verifier' }) };
    }

    // 通过 OIDC Discovery 获取 token 端点
    let tokenEndpoint = `${host}/oidc/token`;
    try {
      const dResp = await fetch(`${process.env.URL || ''}/.netlify/functions/oidc-discovery`).catch(() => null);
      if (dResp && dResp.ok) {
        const d = await dResp.json();
        if (d && d.token_endpoint) tokenEndpoint = d.token_endpoint;
      }
    } catch (_) {}

    const form = new URLSearchParams();
    form.set('grant_type', 'authorization_code');
    form.set('code', code);
    form.set('client_id', appId);
    form.set('code_verifier', code_verifier);
    form.set('redirect_uri', redirectUri);

    const tokenResp = await fetch(tokenEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: form.toString()
    });

    const tokenJson = await tokenResp.json().catch(() => ({}));
    if (!tokenResp.ok) {
      return { statusCode: tokenResp.status, headers: baseHeaders, body: JSON.stringify({ error: 'token_exchange_failed', detail: tokenJson }) };
    }

    const accessToken = tokenJson.access_token;
    const idToken = tokenJson.id_token;

    // Fetch user info
    let userInfo = null;
    try {
      const meUrl = `${host}/oidc/me`;
      const meResp = await fetch(meUrl, { headers: { Authorization: `Bearer ${accessToken}` } });
      userInfo = await meResp.json();
    } catch (e) {
      userInfo = null;
    }

    return {
      statusCode: 200,
      headers: baseHeaders,
      body: JSON.stringify({
        success: true,
        tokens: {
          access_token: accessToken,
          id_token: idToken,
          expires_in: tokenJson.expires_in,
          token_type: tokenJson.token_type,
          scope: tokenJson.scope
        },
        userInfo
      })
    };
  } catch (err) {
    return { statusCode: 500, headers: baseHeaders, body: JSON.stringify({ error: err.message }) };
  }
};

