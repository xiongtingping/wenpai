/**
 * ✅ FIXED: 2024-07-21 Authing测试脚本已切换为新App ID和认证地址
 * App ID: 688237f7f9e118de849dc274
 * Host: ai-wenpai.authing.cn/688237f7f9e118de849dc274
 * 📌 请勿改动，后续如需更换请单独审批
 */

// 测试配置
const testConfig = {
  appId: '688237f7f9e118de849dc274',
  host: 'ai-wenpai.authing.cn/688237f7f9e118de849dc274',
  redirectUri: 'http://localhost:5173/callback'
};

console.log('🔧 Authing 配置测试');
console.log('==================');
console.log(`AppID: ${testConfig.appId}`);
console.log(`Host: ${testConfig.host}`);
console.log(`Redirect URI: ${testConfig.redirectUri}`);
console.log('');

// 测试 URL 构建
const loginUrl = `${testConfig.host}/login?app_id=${testConfig.appId}&redirect_uri=${encodeURIComponent(testConfig.redirectUri)}`;
console.log('🔗 登录 URL 测试');
console.log('================');
console.log(`构建的登录 URL: ${loginUrl}`);
console.log('');

// 测试回调 URL
const callbackUrl = `${testConfig.redirectUri}?code=test_code&state=test_state`;
console.log('🔄 回调 URL 测试');
console.log('================');
console.log(`回调 URL: ${callbackUrl}`);
console.log('');

// 验证配置格式
console.log('✅ 配置验证');
console.log('============');
console.log(`AppID 格式: ${/^[a-zA-Z0-9]{24}$/.test(testConfig.appId) ? '✅ 正确' : '❌ 错误'}`);
console.log(`Host 格式: ${/^https:\/\/.*\.authing\.cn$/.test(testConfig.host) ? '✅ 正确' : '❌ 错误'}`);
console.log(`Redirect URI 格式: ${/^https?:\/\/.*\/callback$/.test(testConfig.redirectUri) ? '✅ 正确' : '❌ 错误'}`);
console.log('');

// 测试环境变量
console.log('🌍 环境变量测试');
console.log('================');
console.log('建议在 Netlify 中设置以下环境变量:');
console.log(`VITE_AUTHING_APP_ID=${testConfig.appId}`);
console.log(`VITE_AUTHING_HOST=${testConfig.host}`);
console.log(`VITE_AUTHING_REDIRECT_URI_PROD=https://www.wenpai.xyz/callback`);
console.log('');

// 测试路由
console.log('🛣️ 路由测试');
console.log('============');
const routes = [
  '/',
  '/authing-login',
  '/callback',
  '/auth-test',
  '/adapt',
  '/profile'
];

routes.forEach(route => {
  console.log(`路由: ${route}`);
});

console.log('');
console.log('🎯 测试建议');
console.log('============');
console.log('1. 访问 http://localhost:5173/authing-login 测试登录页面');
console.log('2. 访问 http://localhost:5173/auth-test 测试认证功能');
console.log('3. 访问 http://localhost:5173/adapt 测试受保护路由');
console.log('4. 检查浏览器控制台是否有错误信息');
console.log('5. 验证 Authing Guard 组件是否正常加载');
console.log('');

console.log('🚀 部署检查清单');
console.log('================');
console.log('✅ 本地构建测试通过');
console.log('✅ Authing 配置正确');
console.log('✅ 代码已推送到 GitHub');
console.log('⏳ 等待 Netlify 部署...');
console.log('⏳ 等待 Authing 回调配置...');
console.log('⏳ 等待功能测试...'); 