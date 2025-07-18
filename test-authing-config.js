#!/usr/bin/env node

// 测试Authing配置
console.log('🔧 测试Authing配置...');

// 模拟环境变量
process.env.VITE_AUTHING_APP_ID = '6867fdc88034eb95ae86167d';
process.env.VITE_AUTHING_HOST = 'https://qutkgzkfaezk-demo.authing.cn';
process.env.VITE_AUTHING_REDIRECT_URI_DEV = 'http://localhost:5173/callback';
process.env.VITE_AUTHING_REDIRECT_URI_PROD = 'https://www.wenpai.xyz/callback';
process.env.MODE = 'development';

// 模拟getAuthingConfig函数
function getAuthingConfig() {
  const appId = process.env.VITE_AUTHING_APP_ID || '';
  const host = (process.env.VITE_AUTHING_HOST || '').replace(/^https?:\/\//, '');
  
  let redirectUri = '';
  if (process.env.MODE === 'development') {
    redirectUri = process.env.VITE_AUTHING_REDIRECT_URI_DEV || 'http://localhost:5173/callback';
  } else {
    redirectUri = process.env.VITE_AUTHING_REDIRECT_URI_PROD || 'https://www.wenpai.xyz/callback';
  }
  
  return {
    appId,
    host,
    redirectUri,
    mode: 'modal',
    defaultScene: 'login',
  };
}

// 测试配置
const config = getAuthingConfig();
console.log('📋 Authing配置:', config);

// 构建授权URL
const authUrl = `https://${config.host}/oidc/auth?` + new URLSearchParams({
  client_id: config.appId,
  redirect_uri: config.redirectUri,
  scope: 'openid profile email phone',
  response_type: 'code',
  state: '/',
  nonce: Math.random().toString(36).substring(2, 15),
}).toString();

console.log('🔗 授权URL:', authUrl);

// 检查URL编码
console.log('🔍 URL编码检查:');
console.log('  redirect_uri (原始):', config.redirectUri);
console.log('  redirect_uri (编码):', encodeURIComponent(config.redirectUri));

// 验证配置
console.log('\n✅ 配置验证:');
console.log('  App ID:', config.appId ? '✅ 已设置' : '❌ 未设置');
console.log('  Host:', config.host ? '✅ 已设置' : '❌ 未设置');
console.log('  Redirect URI:', config.redirectUri ? '✅ 已设置' : '❌ 未设置');
console.log('  Host格式:', config.host.includes('https://') ? '❌ 包含协议前缀' : '✅ 格式正确'); 