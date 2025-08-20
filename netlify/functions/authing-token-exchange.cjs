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
      VITE_AUTHING_CLIENT_ID,
      VITE_AUTHING_APP_ID,
      VITE_AUTHING_HOST,
      VITE_AUTHING_REDIRECT_URI_PROD
    } = process.env;

    // 环境变量优先级：服务端专用 > 客户端构建期变量 > 默认值
    // 支持新的 VITE_AUTHING_CLIENT_ID 配置
    const appId = AUTHING_APP_ID || VITE_AUTHING_CLIENT_ID || VITE_AUTHING_APP_ID || '68a58c57614a821a46f264f7';
    const host = (AUTHING_HOST || VITE_AUTHING_HOST || 'https://rzcswqs4sq0f.authing.cn').replace(/\/$/, '');

    // 🔧 SPA模式适配：必须使用实际请求Origin
    // SPA应用对redirect_uri有严格的CORS验证，必须与请求来源完全匹配
    const requestOrigin = event.headers.origin || event.headers.Origin || event.headers.referer;
    let dynamicRedirectUri = 'https://www.wenpai.xyz/callback'; // 默认值

    if (requestOrigin) {
      try {
        const originUrl = new URL(requestOrigin);
        dynamicRedirectUri = `${originUrl.origin}/callback`;
        console.log('✅ SPA模式：使用实际Origin', originUrl.origin);
      } catch (e) {
        console.log('⚠️ 无法解析Origin，使用默认redirectUri');
      }
    }

    // SPA模式：优先使用动态Origin，忽略环境变量配置
    const redirectUri = dynamicRedirectUri;

    // 调试日志：输出配置信息（生产环境下隐藏敏感信息）
    console.log('🔧 Authing配置检查:', {
      appId: appId ? `${appId.substring(0, 8)}...` : 'MISSING',
      host: host || 'MISSING',
      redirectUri: redirectUri || 'MISSING',
      requestOrigin: requestOrigin || 'MISSING',
      dynamicRedirectUri: dynamicRedirectUri || 'MISSING',
      env: process.env.NODE_ENV || 'unknown'
    });

    if (!appId || !host || !redirectUri) {
      const missingFields = [];
      if (!appId) missingFields.push('APP_ID');
      if (!host) missingFields.push('HOST');
      if (!redirectUri) missingFields.push('REDIRECT_URI');

      return {
        statusCode: 500,
        headers: baseHeaders,
        body: JSON.stringify({
          error: `Authing server config missing: require ${missingFields.join(', ')}`,
          debug: {
            available_env_vars: Object.keys(process.env).filter(k => k.includes('AUTHING')),
            missing_fields: missingFields
          }
        })
      };
    }

    const body = event.body ? JSON.parse(event.body) : {};
    const code = body.code;
    const code_verifier = body.code_verifier;
    if (!code || !code_verifier) {
      return { statusCode: 400, headers: baseHeaders, body: JSON.stringify({ error: 'Missing code or code_verifier' }) };
    }

    // 构建token端点URL - 根据Authing的实际端点格式
    // 尝试多种可能的token端点格式，优先使用App ID路径
    const possibleTokenEndpoints = [
      `${host}/${appId}/oidc/token`, // Authing标准格式：带App ID
      `${host}/oidc/token`,
      `${host}/api/v2/oidc/token`,
      `${host}/oauth/token`
    ];

    let tokenEndpoint = possibleTokenEndpoints[0]; // 默认使用第一个（带App ID）

    // 尝试通过 OIDC Discovery 获取正确的 token 端点
    try {
      const q = new URLSearchParams({ host, appId });
      const dResp = await fetch(`${process.env.URL || ''}/.netlify/functions/oidc-discovery?${q.toString()}`).catch(() => null);
      if (dResp && dResp.ok) {
        const d = await dResp.json();
        if (d && d.token_endpoint) {
          tokenEndpoint = d.token_endpoint;
          console.log('🔍 通过OIDC Discovery获取token端点:', tokenEndpoint);
        }
      }
    } catch (_) {
      console.log('⚠️ OIDC Discovery失败，使用默认token端点');
    }

    const form = new URLSearchParams();
    form.set('grant_type', 'authorization_code');
    form.set('code', code);
    form.set('client_id', appId);
    form.set('code_verifier', code_verifier);
    form.set('redirect_uri', redirectUri);

    console.log('🔄 尝试token交换:', {
      endpoint: tokenEndpoint,
      client_id: appId.substring(0, 8) + '...',
      redirect_uri: redirectUri
    });

    let tokenResp = await fetch(tokenEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: form.toString()
    });

    let tokenJson = await tokenResp.json().catch(() => ({}));

    // 如果第一个端点失败，尝试其他可能的端点
    if (!tokenResp.ok && possibleTokenEndpoints.length > 1) {
      console.log(`⚠️ 第一个端点失败 (${tokenResp.status})，尝试其他端点...`);

      for (let i = 1; i < possibleTokenEndpoints.length; i++) {
        const altEndpoint = possibleTokenEndpoints[i];
        console.log(`🔄 尝试备用端点: ${altEndpoint}`);

        try {
          const altResp = await fetch(altEndpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: form.toString()
          });

          if (altResp.ok) {
            tokenResp = altResp;
            tokenJson = await altResp.json().catch(() => ({}));
            console.log(`✅ 备用端点成功: ${altEndpoint}`);
            break;
          }
        } catch (e) {
          console.log(`❌ 备用端点失败: ${altEndpoint} - ${e.message}`);
        }
      }
    }

    if (!tokenResp.ok) {
      console.log('❌ 所有token端点都失败了:', {
        status: tokenResp.status,
        response: tokenJson
      });
      return {
        statusCode: tokenResp.status,
        headers: baseHeaders,
        body: JSON.stringify({
          error: 'token_exchange_failed',
          detail: tokenJson,
          tried_endpoints: possibleTokenEndpoints
        })
      };
    }

    const accessToken = tokenJson.access_token;
    const idToken = tokenJson.id_token;

    // Fetch user info
    let userInfo = null;
    try {
      const meUrl = `${host}/oidc/me`;
      console.log('🔍 获取用户信息:', { meUrl, hasAccessToken: !!accessToken });

      const meResp = await fetch(meUrl, { headers: { Authorization: `Bearer ${accessToken}` } });

      if (!meResp.ok) {
        console.error('❌ 用户信息获取失败:', {
          status: meResp.status,
          statusText: meResp.statusText,
          url: meUrl
        });
        userInfo = null;
      } else {
        userInfo = await meResp.json();
        console.log('✅ 用户信息获取成功:', {
          hasUserInfo: !!userInfo,
          availableFields: userInfo ? Object.keys(userInfo) : [],
          nickname: userInfo?.nickname,
          name: userInfo?.name,
          username: userInfo?.username,
          email: userInfo?.email,
          sub: userInfo?.sub
        });
      }
    } catch (e) {
      console.error('❌ 用户信息获取异常:', e.message);
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

