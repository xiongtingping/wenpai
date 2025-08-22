/**
 * Netlify Function: Authing OIDC code -> token exchange and user info fetch
 * Method: POST
 * Body: { code: string }
 */

exports.handler = async (event) => {
  const allowedOrigins = [
    'https://www.wenpai.xyz',
    'https://wenpai.xyz',
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
      AUTHING_CLIENT_SECRET,
      VITE_AUTHING_CLIENT_ID,
      VITE_AUTHING_APP_ID,
      VITE_AUTHING_HOST,
      VITE_AUTHING_REDIRECT_URI_PROD
    } = process.env;

    // 环境变量优先级：服务端专用 > 客户端构建期变量 > 默认值
    // 支持新的 VITE_AUTHING_CLIENT_ID 配置
    const appId = AUTHING_APP_ID || VITE_AUTHING_CLIENT_ID || VITE_AUTHING_APP_ID || '68a68a29d0c3341ae7a3df23';
    const host = (AUTHING_HOST || VITE_AUTHING_HOST || 'https://rzcswqs4sq0f.authing.cn').replace(/\/$/, '');

    // 🔧 修复Netlify预览URL问题：只允许白名单域名
    const requestOrigin = event.headers.origin || event.headers.Origin || event.headers.referer;
    let dynamicRedirectUri = 'https://www.wenpai.xyz/callback'; // 默认值

    if (requestOrigin) {
      try {
        const originUrl = new URL(requestOrigin);
        const hostname = originUrl.hostname;

        // 检查是否为白名单中的生产域名
        const isAllowedDomain = hostname === 'www.wenpai.xyz' ||
                                 hostname === 'wenpai.xyz' ||
                                 hostname === 'wenpai.netlify.app' ||
                                 hostname === 'localhost';

        if (isAllowedDomain) {
          // 对于允许的域名，使用其 origin 回调
          const portSuffix = originUrl.port ? `:${originUrl.port}` : '';
          dynamicRedirectUri = `${originUrl.protocol}//${originUrl.hostname}${portSuffix}/callback`;
          console.log('✅ 使用允许域名Origin:', originUrl.origin);
        } else {
          console.log('⚠️ 非允许域名，使用默认redirectUri:', hostname);
        }
      } catch (e) {
        console.log('⚠️ 无法解析Origin，使用默认redirectUri');
      }
    }

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
    // 允许两种模式：
    // 1) PKCE：提供 code_verifier（公共客户端）
    // 2) 机密客户端：提供 AUTHING_CLIENT_SECRET（无需 code_verifier）
    if (!code) {
      return { statusCode: 400, headers: baseHeaders, body: JSON.stringify({ error: 'Missing code' }) };
    }
    const useClientSecret = !!(process.env.AUTHING_CLIENT_SECRET);
    if (!useClientSecret && !code_verifier) {
      return { statusCode: 400, headers: baseHeaders, body: JSON.stringify({ error: 'Missing code_verifier (PKCE)' }) };
    }

    // 构建token端点URL - 使用标准OIDC端点
    const possibleTokenEndpoints = [
      `${host}/${appId}/oidc/token`, // 标准格式：带App ID
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
    
    // 只有在PKCE模式下才添加code_verifier
    if (code_verifier && !useClientSecret) {
      form.set('code_verifier', code_verifier);
    }
    
    form.set('redirect_uri', redirectUri);
    
    // 机密客户端模式：使用client_secret
    if (useClientSecret && AUTHING_CLIENT_SECRET) {
      form.set('client_secret', AUTHING_CLIENT_SECRET);
      console.log('🔑 使用机密客户端模式（client_secret）');
    } else if (!useClientSecret && code_verifier) {
      console.log('🔐 使用PKCE模式（code_verifier）');
    } else {
      console.warn('⚠️ 缺少认证参数：需要client_secret或code_verifier');
    }

    console.log('🔄 尝试token交换:', {
      endpoint: tokenEndpoint,
      client_id: appId.substring(0, 8) + '...',
      redirect_uri: redirectUri,
      grant_type: 'authorization_code',
      auth_mode: useClientSecret ? 'client_secret' : 'pkce'
    });

    // 添加请求头，提高兼容性
    const headers = {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Accept': 'application/json',
      'User-Agent': 'Wenpai-Auth-Client/1.0'
    };

    // 如果使用机密客户端，可能需要基本认证
    if (useClientSecret && AUTHING_CLIENT_SECRET) {
      const authHeader = Buffer.from(`${appId}:${AUTHING_CLIENT_SECRET}`).toString('base64');
      headers['Authorization'] = `Basic ${authHeader}`;
    }

    let tokenResp, tokenJson;
    
    try {
      tokenResp = await fetch(tokenEndpoint, {
        method: 'POST',
        headers,
        body: form.toString()
      });

      // 尝试解析JSON响应
      const responseText = await tokenResp.text();
      try {
        tokenJson = JSON.parse(responseText);
      } catch (parseError) {
        console.error('❌ JSON解析失败:', { responseText, parseError: parseError.message });
        tokenJson = { error: 'json_parse_failed', raw_response: responseText };
      }
    } catch (fetchError) {
      console.error('❌ 网络请求失败:', fetchError.message);
      return {
        statusCode: 500,
        headers: baseHeaders,
        body: JSON.stringify({ error: 'network_error', detail: fetchError.message })
      };
    }

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

    // Fetch user info - 尝试多个可能的端点
    let userInfo = null;
    const userInfoEndpoints = [
      `${host}/oidc/me`,
      `${host}/api/v2/users/me`,
      `${host}/userinfo`,
      `${host}/oauth/userinfo`
    ];

    for (const meUrl of userInfoEndpoints) {
      try {
        console.log('🔍 尝试获取用户信息:', { meUrl, hasAccessToken: !!accessToken });

        const meResp = await fetch(meUrl, { 
          headers: { 
            Authorization: `Bearer ${accessToken}`,
            'Accept': 'application/json',
            'User-Agent': 'Wenpai-Auth-Client/1.0'
          } 
        });

        if (meResp.ok) {
          const responseText = await meResp.text();
          try {
            userInfo = JSON.parse(responseText);
            console.log('✅ 用户信息获取成功:', {
              endpoint: meUrl,
              hasUserInfo: !!userInfo,
              availableFields: userInfo ? Object.keys(userInfo) : [],
              nickname: userInfo?.nickname,
              name: userInfo?.name,
              username: userInfo?.username,
              email: userInfo?.email,
              sub: userInfo?.sub
            });
            break; // 成功获取，跳出循环
          } catch (parseError) {
            console.warn('⚠️ 用户信息JSON解析失败:', { 
              endpoint: meUrl, 
              responseText: responseText.substring(0, 200),
              error: parseError.message 
            });
          }
        } else {
          console.warn('⚠️ 用户信息端点失败:', {
            endpoint: meUrl,
            status: meResp.status,
            statusText: meResp.statusText
          });
        }
      } catch (e) {
        console.warn('⚠️ 用户信息获取异常:', { endpoint: meUrl, error: e.message });
        continue; // 尝试下一个端点
      }
    }

    if (!userInfo) {
      console.error('❌ 所有用户信息端点都失败了');
      // 不阻止登录流程，只是没有用户信息
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

