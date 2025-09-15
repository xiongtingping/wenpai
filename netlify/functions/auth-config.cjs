/**
 * 🌐 认证配置服务端化 - Netlify Function
 * 安全地提供认证配置信息，避免敏感配置在客户端暴露
 * 
 * 功能：
 * - 服务端配置管理
 * - 环境区分配置
 * - 配置缓存和优化
 * - 安全过滤敏感信息
 */

// 配置缓存（避免重复计算）
let configCache = null;
let cacheTime = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5分钟缓存

/**
 * 获取认证配置
 */
const getAuthConfig = (origin = '') => {
  const now = Date.now();
  
  // 使用缓存
  if (configCache && (now - cacheTime) < CACHE_DURATION) {
    console.log('🚀 使用缓存配置');
    return configCache;
  }

  console.log('🔧 生成新配置，来源:', origin);

  // 从环境变量获取配置（服务端安全）
  const {
    AUTHING_APP_ID,
    AUTHING_HOST,
    AUTHING_DOMAIN,
    VITE_AUTHING_APP_ID,
    VITE_AUTHING_HOST,
    VITE_AUTHING_DOMAIN,
    NODE_ENV
  } = process.env;

  // 配置优先级：服务端环境变量 > 客户端构建变量 > 默认值
  const appId = AUTHING_APP_ID || VITE_AUTHING_APP_ID;
  const host = (AUTHING_HOST || VITE_AUTHING_HOST || `https://${AUTHING_DOMAIN || VITE_AUTHING_DOMAIN}`).replace(/\/$/, '');
  const domain = AUTHING_DOMAIN || VITE_AUTHING_DOMAIN;

  // 动态redirect_uri（基于请求来源）
  let redirectUri = 'https://www.wenpai.xyz/callback'; // 默认生产环境

  if (origin) {
    const url = new URL(origin);
    const { hostname, port } = url;
    
    // 本地开发环境
    if (hostname === 'localhost' || hostname === '127.0.0.1' || port === '5173') {
      redirectUri = 'http://localhost:5173/callback';
    }
    // Netlify预览环境
    else if (hostname.includes('--wenpai.netlify.app') || hostname.includes('netlify.app')) {
      redirectUri = `${origin}/callback`;
    }
    // 生产环境保持默认值
  }

  // 构建配置对象（只包含客户端需要的配置）
  const config = {
    appId,
    host,
    domain,
    redirectUri,
    // 客户端SDK配置
    guard: {
      appId,
      domain,
      redirectUri,
      mode: 'modal',
      config: {
        disableAriaHidden: true,
        container: 'authing-guard-container',
        zIndex: 1000,
        accessibility: {
          disableFocusManagement: false,
          preventRootAriaHidden: true
        }
      }
    },
    // Web SDK配置
    webSdk: {
      domain,
      appId,
      redirectUri,
      scope: 'openid profile email phone',
      responseType: 'code',
      state: `state_${Date.now()}`,
      prompt: 'login'
    },
    // 环境信息
    environment: NODE_ENV || 'production',
    features: {
      httpOnlyCookies: true,
      csrfProtection: true,
      tokenEncryption: true
    }
  };

  // 验证配置完整性
  if (!config.appId || !config.domain) {
    throw new Error('认证配置不完整：缺少必需的appId或domain');
  }

  // 缓存配置
  configCache = config;
  cacheTime = now;

  console.log('✅ 认证配置生成完成:', {
    appId: config.appId ? '***' + config.appId.slice(-4) : 'missing',
    domain: config.domain,
    redirectUri: config.redirectUri,
    environment: config.environment
  });

  return config;
};

exports.handler = async (event) => {
  // CORS设置
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
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Credentials': 'true',
    'Content-Type': 'application/json',
    // 缓存控制
    'Cache-Control': 'public, max-age=300, stale-while-revalidate=60' // 5分钟缓存
  };

  // 处理预检请求
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: baseHeaders, body: '' };
  }

  // 只允许GET请求
  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      headers: baseHeaders,
      body: JSON.stringify({ 
        success: false, 
        error: 'Method not allowed',
        message: 'Only GET requests are supported'
      })
    };
  }

  try {
    // 验证请求来源
    if (!isAllowedOrigin) {
      console.log('❌ 非法请求来源:', origin);
      return {
        statusCode: 403,
        headers: baseHeaders,
        body: JSON.stringify({ 
          success: false, 
          error: 'Forbidden',
          message: 'Request origin not allowed'
        })
      };
    }

    // 获取配置
    const config = getAuthConfig(origin);

    return {
      statusCode: 200,
      headers: baseHeaders,
      body: JSON.stringify({
        success: true,
        data: config,
        message: 'Configuration retrieved successfully',
        timestamp: new Date().toISOString(),
        cacheInfo: {
          cached: configCache !== null,
          age: Date.now() - cacheTime
        }
      })
    };

  } catch (error) {
    console.error('❌ 认证配置获取失败:', error);
    
    return {
      statusCode: 500,
      headers: baseHeaders,
      body: JSON.stringify({ 
        success: false, 
        error: 'Internal server error',
        message: 'Failed to retrieve authentication configuration',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      })
    };
  }
};