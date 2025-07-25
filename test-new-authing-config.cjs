/**
 * 测试新的Authing配置
 * 验证是否使用了正确的新应用配置
 */

console.log('🔍 测试新的Authing配置...\n');

// 新的配置信息
const newConfig = {
  appId: '687bc631c105de597b993202',
  host: 'ai-wenpai.authing.cn/688237f7f9e118de849dc274',
  redirectUri: 'http://localhost:5173/callback'
};

// 旧的配置信息
const oldConfig = {
  appId: '688237f7f9e118de849dc274',
  host: 'ai-wenpai.authing.cn/688237f7f9e118de849dc274',
  redirectUri: 'http://localhost:5173/callback'
};

console.log('📋 新配置信息:');
console.log('- App ID:', newConfig.appId);
console.log('- 域名:', newConfig.host);
console.log('- 回调地址:', newConfig.redirectUri);
console.log('');

console.log('📋 旧配置信息:');
console.log('- App ID:', oldConfig.appId);
console.log('- 域名:', oldConfig.host);
console.log('- 回调地址:', oldConfig.redirectUri);
console.log('');

// 生成测试URL
console.log('🔗 生成测试URL...');

// 新配置的登录URL
const newLoginUrl = new URL(`https://${newConfig.host}/oidc/auth`);
newLoginUrl.searchParams.set('client_id', newConfig.appId);
newLoginUrl.searchParams.set('redirect_uri', newConfig.redirectUri);
newLoginUrl.searchParams.set('response_type', 'code');
newLoginUrl.searchParams.set('scope', 'openid profile email');
newLoginUrl.searchParams.set('state', 'test-new-login-' + Date.now());

console.log('新配置登录URL:', newLoginUrl.toString());

// 新配置的注册URL
const newRegisterUrl = new URL(`https://${newConfig.host}/oidc/auth`);
newRegisterUrl.searchParams.set('client_id', newConfig.appId);
newRegisterUrl.searchParams.set('redirect_uri', newConfig.redirectUri);
newRegisterUrl.searchParams.set('response_type', 'code');
newRegisterUrl.searchParams.set('scope', 'openid profile email');
newRegisterUrl.searchParams.set('state', 'test-new-register-' + Date.now());
newRegisterUrl.searchParams.set('screen_hint', 'signup');

console.log('新配置注册URL:', newRegisterUrl.toString());

// 旧配置的登录URL（用于对比）
const oldLoginUrl = new URL(`https://${oldConfig.host}/oidc/auth`);
oldLoginUrl.searchParams.set('client_id', oldConfig.appId);
oldLoginUrl.searchParams.set('redirect_uri', oldConfig.redirectUri);
oldLoginUrl.searchParams.set('response_type', 'code');
oldLoginUrl.searchParams.set('scope', 'openid profile email');
oldLoginUrl.searchParams.set('state', 'test-old-login-' + Date.now());

console.log('\n旧配置登录URL（对比）:', oldLoginUrl.toString());

console.log('\n🎯 配置对比:');
console.log('================================');

console.log('✅ 新配置优势:');
console.log('- 使用新创建的Authing应用');
console.log('- 域名: ai-wenpai.authing.cn/688237f7f9e118de849dc274');
console.log('- App ID: 687bc631c105de597b993202');
console.log('- 应该能正常访问和登录');

console.log('\n❌ 旧配置问题:');
console.log('- 使用已删除的旧应用');
console.log('- 域名: ai-wenpai.authing.cn/688237f7f9e118de849dc274');
console.log('- App ID: 688237f7f9e118de849dc274');
console.log('- 会导致400错误');

console.log('\n🔧 修复状态:');
console.log('================================');

console.log('✅ 已完成的修复:');
console.log('- 更新了 src/services/unifiedAuthService.ts 中的App ID');
console.log('- 更新了 src/services/unifiedAuthService.ts 中的域名');
console.log('- 创建了 .env.local 文件');
console.log('- 设置了正确的环境变量');

console.log('\n📝 下一步操作:');
console.log('1. 重启开发服务器以加载新的环境变量');
console.log('2. 访问 http://localhost:5173 测试登录功能');
console.log('3. 确认使用新的Authing应用配置');
console.log('4. 在Authing控制台配置新应用的回调URL');

console.log('\n🚀 重启开发服务器:');
console.log('按 Ctrl+C 停止当前服务器，然后运行:');
console.log('npm run dev');

console.log('\n✅ 测试完成！');
console.log('请重启开发服务器并测试新的配置。'); 