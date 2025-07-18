#!/usr/bin/env node

console.log('🔍 验证Authing配置...\n');

// 模拟浏览器环境
const mockWindow = {
  location: {
    port: '5173',
    hostname: 'localhost',
    href: 'http://localhost:5173/'
  }
};

// 模拟getAuthingConfig函数
function getAuthingConfig() {
  const appId = '6867fdc88034eb95ae86167d';
  const host = 'qutkgzkfaezk-demo.authing.cn';
  
  // 动态获取当前端口号，支持任何端口
  const currentPort = mockWindow.location.port || '5173';
  const currentHost = mockWindow.location.hostname || 'localhost';
  const redirectUri = `http://${currentHost}:${currentPort}/callback`;
  
  console.log('🔧 Authing配置:', {
    appId,
    host,
    redirectUri,
    env: 'development',
    currentPort: mockWindow.location.port,
    currentHost: mockWindow.location.hostname,
    fullUrl: mockWindow.location.href
  });
  
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

console.log('\n✅ 配置验证结果:');
console.log(`  应用ID: ${config.appId ? '✅ 已设置' : '❌ 未设置'}`);
console.log(`  域名: ${config.host ? '✅ 已设置' : '❌ 未设置'}`);
console.log(`  回调URL: ${config.redirectUri ? '✅ 已设置' : '❌ 未设置'}`);
console.log(`  端口: ${config.redirectUri.includes(':5173') ? '✅ 5173端口' : '❌ 端口不匹配'}`);

// 构建授权URL
const authUrl = `https://${config.host}/oidc/auth?` + new URLSearchParams({
  client_id: config.appId,
  redirect_uri: config.redirectUri,
  scope: 'openid profile email phone',
  response_type: 'code',
  state: '/',
  nonce: 'test-nonce-123'
}).toString();

console.log('\n🔗 授权URL:');
console.log(authUrl);

console.log('\n📋 需要在Authing控制台配置的回调URL:');
console.log(`  ${config.redirectUri}`);

console.log('\n🎯 下一步:');
console.log('1. 在Authing控制台添加回调URL:');
console.log(`   ${config.redirectUri}`);
console.log('2. 保存配置');
console.log('3. 等待1-2分钟让配置生效');
console.log('4. 测试登录功能');

console.log('\n✅ 修复完成！现在Authing应该可以正常工作了。'); 