/**
 * Authing 权限问题诊断脚本
 * 帮助诊断和修复Authing应用权限配置问题
 */

const { execSync } = require('child_process');

console.log('🔍 Authing 权限问题诊断工具');
console.log('================================\n');

// 当前配置信息
const config = {
  appId: '687bc631c105de597b993202',
  host: 'ai-wenpai.authing.cn/687e0aafee2b84f86685b644',
  redirectUri: 'http://localhost:5173/callback'
};

console.log('📋 当前配置信息:');
console.log('- App ID:', config.appId);
console.log('- 域名:', config.host);
console.log('- 回调地址:', config.redirectUri);
console.log('');

// 检查开发服务器
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

// 检查回调页面
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

// 测试Authing端点
console.log('\n🌐 测试 Authing 端点...');
const endpoints = [
  { url: `https://${config.host}/oidc/.well-known/openid-configuration`, name: '服务发现' },
  { url: `https://${config.host}/oidc/.well-known/jwks.json`, name: 'JWKS' },
  { url: `https://${config.host}/login`, name: '登录页面' }
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

console.log('\n🚨 问题诊断结果:');
console.log('================================');

console.log('❌ 发现的问题:');
console.log('1. Authing应用权限配置错误');
console.log('2. 显示"无权限登录此应用"错误');
console.log('3. 登录页面显示异常');
console.log('4. 无注册页面');

console.log('\n🔧 需要修复的配置:');
console.log('================================');

console.log('1️⃣ 应用状态检查:');
console.log('   - 登录Authing控制台: https://console.authing.cn/');
console.log('   - 找到应用ID: 687bc631c105de597b993202');
console.log('   - 确认应用状态为"已启用"');

console.log('\n2️⃣ 权限配置修复:');
console.log('   - 进入"权限管理"标签');
console.log('   - 设置"允许所有用户登录"');
console.log('   - 设置"允许用户注册"');

console.log('\n3️⃣ 回调URL配置:');
console.log('   - 登录回调URL: http://localhost:5173/callback');
console.log('   - 登出回调URL: http://localhost:5173/');

console.log('\n4️⃣ 安全设置配置:');
console.log('   - 允许的Web起源: http://localhost:5173');
console.log('   - 允许的CORS起源: http://localhost:5173');

console.log('\n🎯 修复步骤:');
console.log('================================');

console.log('第1步: 登录Authing控制台');
console.log('第2步: 找到应用配置');
console.log('第3步: 检查应用状态');
console.log('第4步: 配置应用权限');
console.log('第5步: 更新回调URL');
console.log('第6步: 配置安全设置');
console.log('第7步: 保存配置');
console.log('第8步: 测试验证');

console.log('\n📞 如果问题持续:');
console.log('- 检查Authing控制台的所有配置');
console.log('- 查看浏览器控制台错误信息');
console.log('- 确认网络连接正常');
console.log('- 联系Authing技术支持');

console.log('\n✅ 诊断完成！');
console.log('请按照上述步骤修复Authing控制台配置。'); 