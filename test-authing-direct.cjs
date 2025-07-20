/**
 * 测试直接跳转方式的 Authing 配置
 * 验证新的认证流程是否正常工作
 */

const { execSync } = require('child_process');

console.log('🚀 开始测试直接跳转方式的 Authing 配置...\n');

// 新的配置信息
const config = {
  appId: '687bc631c105de597b993202',
  host: 'wenpaiai.authing.cn',
  redirectUri: 'http://localhost:5173/callback'
};

console.log('📋 当前配置:');
console.log('- App ID:', config.appId);
console.log('- 域名:', config.host);
console.log('- 回调地址:', config.redirectUri);
console.log('');

// 测试开发服务器
console.log('🔍 检查开发服务器状态...');
try {
  const response = execSync('curl -s -o /dev/null -w "%{http_code}" http://localhost:5173', { encoding: 'utf8' });
  if (response.trim() === '200') {
    console.log('✅ 开发服务器正常运行');
  } else {
    console.log('⚠️  开发服务器响应异常:', response.trim());
  }
} catch (error) {
  console.log('❌ 开发服务器未运行或无法访问');
  console.log('请运行: npm run dev');
  process.exit(1);
}

// 测试回调页面
console.log('\n📄 检查回调页面...');
try {
  const callbackResponse = execSync('curl -s -o /dev/null -w "%{http_code}" http://localhost:5173/callback', { encoding: 'utf8' });
  if (callbackResponse.trim() === '200') {
    console.log('✅ 回调页面可访问');
  } else {
    console.log('⚠️  回调页面响应:', callbackResponse.trim());
  }
} catch (error) {
  console.log('❌ 回调页面无法访问');
}

// 生成测试URL
console.log('\n🔗 生成测试URL...');

// 登录URL
const loginUrl = new URL(`https://${config.host}/oidc/auth`);
loginUrl.searchParams.set('client_id', config.appId);
loginUrl.searchParams.set('redirect_uri', config.redirectUri);
loginUrl.searchParams.set('response_type', 'code');
loginUrl.searchParams.set('scope', 'openid profile email');
loginUrl.searchParams.set('state', 'test-login-' + Date.now());

console.log('登录URL:', loginUrl.toString());

// 注册URL
const registerUrl = new URL(`https://${config.host}/oidc/auth`);
registerUrl.searchParams.set('client_id', config.appId);
registerUrl.searchParams.set('redirect_uri', config.redirectUri);
registerUrl.searchParams.set('response_type', 'code');
registerUrl.searchParams.set('scope', 'openid profile email');
registerUrl.searchParams.set('state', 'test-register-' + Date.now());
registerUrl.searchParams.set('screen_hint', 'signup');

console.log('注册URL:', registerUrl.toString());

// 测试Authing端点
console.log('\n🌐 测试 Authing 端点...');
const endpoints = [
  { url: `https://${config.host}/oidc/.well-known/openid-configuration`, name: '服务发现' },
  { url: `https://${config.host}/oidc/.well-known/jwks.json`, name: 'JWKS' }
];

endpoints.forEach(endpoint => {
  try {
    const response = execSync(`curl -s -o /dev/null -w "%{http_code}" ${endpoint.url}`, { encoding: 'utf8' });
    const status = response.trim();
    if (status === '200') {
      console.log(`✅ ${endpoint.name}: 可访问`);
    } else {
      console.log(`⚠️  ${endpoint.name}: 响应 ${status}`);
    }
  } catch (error) {
    console.log(`❌ ${endpoint.name}: 连接失败`);
  }
});

console.log('\n🎯 测试完成！');
console.log('\n📝 下一步操作:');
console.log('1. 在 Authing 控制台更新回调URL为:', config.redirectUri);
console.log('2. 访问 http://localhost:5173 测试登录功能');
console.log('3. 点击登录按钮，将直接跳转到Authing官方页面');
console.log('4. 完成认证后将跳转回应用的回调页面');
console.log('\n🔧 如果遇到问题:');
console.log('- 检查 Authing 控制台配置');
console.log('- 确认回调URL设置正确');
console.log('- 查看浏览器控制台错误信息');
console.log('- 确认网络连接正常'); 