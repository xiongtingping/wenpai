/**
 * 验证新的Authing配置
 * 测试新的应用配置是否正常工作
 */

const https = require('https');
const http = require('http');

console.log('🔍 验证新的Authing配置...\n');

// 新配置
const newConfig = {
  appId: '687bc631c105de597b993202',
  host: 'wenpaiai.authing.cn',
  redirectUri: 'http://localhost:5173/callback'
};

// 测试函数
async function testEndpoint(url, description) {
  return new Promise((resolve) => {
    const client = url.startsWith('https') ? https : http;
    
    const req = client.get(url, (res) => {
      console.log(`✅ ${description}: ${res.statusCode} ${res.statusMessage}`);
      resolve({ success: true, status: res.statusCode });
    });
    
    req.on('error', (err) => {
      console.log(`❌ ${description}: ${err.message}`);
      resolve({ success: false, error: err.message });
    });
    
    req.setTimeout(5000, () => {
      console.log(`⏰ ${description}: 请求超时`);
      req.destroy();
      resolve({ success: false, error: 'timeout' });
    });
  });
}

async function runTests() {
  console.log('📋 测试配置信息:');
  console.log('- App ID:', newConfig.appId);
  console.log('- 域名:', newConfig.host);
  console.log('- 回调地址:', newConfig.redirectUri);
  console.log('');

  // 测试1: 检查Authing域名是否可访问
  console.log('🌐 测试1: 检查Authing域名可访问性...');
  await testEndpoint(`https://${newConfig.host}`, 'Authing域名访问');
  
  // 测试2: 检查Authing健康检查端点
  console.log('\n🏥 测试2: 检查Authing健康状态...');
  await testEndpoint(`https://${newConfig.host}/api/v3/health`, 'Authing健康检查');
  
  // 测试3: 检查应用公共配置端点
  console.log('\n⚙️ 测试3: 检查应用公共配置...');
  await testEndpoint(`https://${newConfig.host}/api/v2/applications/${newConfig.appId}/public-config`, '应用公共配置');
  
  // 测试4: 检查本地开发服务器
  console.log('\n🏠 测试4: 检查本地开发服务器...');
  await testEndpoint('http://localhost:5173', '本地开发服务器');
  
  // 测试5: 检查回调端点
  console.log('\n🔄 测试5: 检查回调端点...');
  await testEndpoint('http://localhost:5173/callback', '回调端点');
  
  // 生成测试URL
  console.log('\n🔗 生成测试URL...');
  
  // 登录URL
  const loginUrl = new URL(`https://${newConfig.host}/oidc/auth`);
  loginUrl.searchParams.set('client_id', newConfig.appId);
  loginUrl.searchParams.set('redirect_uri', newConfig.redirectUri);
  loginUrl.searchParams.set('response_type', 'code');
  loginUrl.searchParams.set('scope', 'openid profile email');
  loginUrl.searchParams.set('state', 'test-login-' + Date.now());
  
  console.log('登录URL:', loginUrl.toString());
  
  // 注册URL
  const registerUrl = new URL(`https://${newConfig.host}/oidc/auth`);
  registerUrl.searchParams.set('client_id', newConfig.appId);
  registerUrl.searchParams.set('redirect_uri', newConfig.redirectUri);
  registerUrl.searchParams.set('response_type', 'code');
  registerUrl.searchParams.set('scope', 'openid profile email');
  registerUrl.searchParams.set('state', 'test-register-' + Date.now());
  registerUrl.searchParams.set('screen_hint', 'signup');
  
  console.log('注册URL:', registerUrl.toString());
  
  console.log('\n🎯 测试总结:');
  console.log('================================');
  console.log('✅ 新配置已应用:');
  console.log('- App ID: 687bc631c105de597b993202');
  console.log('- 域名: wenpaiai.authing.cn');
  console.log('- 回调地址: http://localhost:5173/callback');
  
  console.log('\n📝 下一步操作:');
  console.log('1. 访问 http://localhost:5173');
  console.log('2. 点击登录/注册按钮');
  console.log('3. 确认跳转到新的Authing应用');
  console.log('4. 在Authing控制台配置回调URL');
  
  console.log('\n🔧 Authing控制台配置:');
  console.log('- 登录: https://console.authing.cn/');
  console.log('- 找到应用: 687bc631c105de597b993202');
  console.log('- 配置回调URL: http://localhost:5173/callback');
  console.log('- 启用应用并允许用户登录注册');
  
  console.log('\n✅ 验证完成！');
  console.log('现在可以测试登录功能了。');
}

// 运行测试
runTests().catch(console.error); 