/**
 * 调试注册URL生成问题
 */

// 模拟环境变量
const mockEnv = {
  VITE_AUTHING_APP_ID: '68823897631e1ef8ff3720b2',
  VITE_AUTHING_DOMAIN: 'rzcswqs4sq0f.authing.cn',
  VITE_AUTHING_HOST: 'https://rzcswqs4sq0f.authing.cn'
};

// 模拟getAuthConfig函数
function getAuthConfig() {
  const clientId = mockEnv.VITE_AUTHING_CLIENT_ID;
  const appId = mockEnv.VITE_AUTHING_APP_ID;

  // 🔧 临时修复：强制使用正确的App ID，避免配置不一致问题
  const correctAppId = '68823897631e1ef8ff3720b2';
  const effectiveAppId = correctAppId; // 强制使用正确的App ID

  console.log('🔧 Auth配置检查:', {
    envClientId: clientId,
    envAppId: appId,
    forcedAppId: effectiveAppId,
    source: 'forced-correct-app-id'
  });

  const domain = mockEnv.VITE_AUTHING_DOMAIN;
  const hostFromEnv = mockEnv.VITE_AUTHING_HOST;

  // 规范化 host（必须含 https:// 前缀）
  const host = hostFromEnv
    ? hostFromEnv.replace(/\/$/, '')
    : domain
      ? `https://${domain.replace(/\/$/, '')}`
      : 'https://rzcswqs4sq0f.authing.cn'; // 默认值

  // 选择 redirectUri：非本地环境一律使用生产回调，避免多域导致的校验分歧
  const h = 'www.wenpai.xyz'; // 模拟生产环境
  const redirectUri = (h === 'localhost' || h === '127.0.0.1')
    ? 'http://localhost:5173/callback'
    : 'https://www.wenpai.xyz/callback';

  const config = { appId: effectiveAppId, host, redirectUri };

  console.log('✅ 最终Auth配置:', config);

  return config;
}

// 模拟getRegisterUrlFast函数
function getRegisterUrlFast(config) {
  const { appId, host, redirectUri, state, codeChallenge, nonce } = config;

  const params = new URLSearchParams({
    client_id: appId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'openid profile email',
    state,
    code_challenge: codeChallenge,
    code_challenge_method: 'S256',
    nonce,
    response_mode: 'query',
    // 🔧 注册专用参数
    register: 'true',          // 标记为注册请求
    mode: 'register',          // 模式参数
    action: 'register',        // 动作参数
    ui_locales: 'zh-CN'        // 设置语言
  });

  console.log('🔧 注册URL参数检查:', {
    appId,
    redirectUri,
    state: JSON.parse(state),
    hasCodeChallenge: !!codeChallenge,
    forceAuth: true
  });

  // 🔧 使用Authing的注册端点
  // 尝试多种可能的注册URL格式
  const registerEndpoints = [
    `${host}/${appId}/register`,           // 标准注册端点
    `${host}/${appId}/signup`,             // 备选注册端点
    `${host}/${appId}/login?mode=register`, // 登录页面注册模式
    `${host}/oidc/auth?${params.toString()}&prompt=signup`, // OIDC注册
  ];

  console.log('🔧 尝试注册端点:', registerEndpoints);

  // 优先使用标准注册端点
  return `${host}/${appId}/register?${params.toString()}`;
}

// 测试注册URL生成
function testRegisterUrl() {
  console.log('🧪 测试注册URL生成...\n');
  
  const cfg = getAuthConfig();
  
  // 模拟PKCE参数
  const mockState = JSON.stringify({ redirectTo: '/', timestamp: Date.now() });
  const mockCodeChallenge = 'mock_code_challenge_123';
  const mockNonce = 'mock_nonce_456';
  
  const registerUrl = getRegisterUrlFast({
    appId: cfg.appId,
    host: cfg.host.replace(/\/$/, ''),
    redirectUri: cfg.redirectUri,
    state: mockState,
    codeChallenge: mockCodeChallenge,
    nonce: mockNonce
  });
  
  console.log('\n🎯 生成的注册URL:');
  console.log(registerUrl);
  
  // 检查URL中的App ID
  const urlAppId = registerUrl.match(/\/([a-f0-9]{24})\//)?.[1];
  console.log('\n🔍 URL中的App ID:', urlAppId);
  console.log('🔍 期望的App ID:', cfg.appId);
  console.log('🔍 App ID匹配:', urlAppId === cfg.appId ? '✅' : '❌');
  
  // 检查是否包含错误的App ID
  const hasWrongAppId = registerUrl.includes('688237f8f58e454393add99e');
  console.log('🔍 包含错误App ID:', hasWrongAppId ? '❌' : '✅');
  
  return registerUrl;
}

// 运行测试
testRegisterUrl();
