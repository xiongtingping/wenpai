/**
 * Authing SDK测试脚本
 * 验证Authing配置和功能
 */

const { AuthenticationClient } = require('authing-js-sdk');

// 模拟环境变量
const env = {
  VITE_AUTHING_APP_ID: '6867fdc88034eb95ae86167d',
  VITE_AUTHING_HOST: 'https://qutkgzkfaezk-demo.authing.cn',
  VITE_AUTHING_REDIRECT_URI_DEV: 'http://localhost:5173/callback',
  VITE_AUTHING_REDIRECT_URI_PROD: 'https://www.wenpai.xyz/callback',
  DEV: true
};

// 模拟getAuthingConfig函数
function getAuthingConfig() {
  const appId = env.VITE_AUTHING_APP_ID || '';
  const host = (env.VITE_AUTHING_HOST || '').replace(/^https?:\/\//, '');
  
  // 根据环境设置回调地址
  let redirectUri = '';
  if (env.DEV) {
    redirectUri = env.VITE_AUTHING_REDIRECT_URI_DEV || 'http://localhost:5173/callback';
  } else {
    redirectUri = env.VITE_AUTHING_REDIRECT_URI_PROD || 'https://www.wenpai.xyz/callback';
  }
  
  return {
    appId,
    host,
    redirectUri,
    mode: 'modal',
    defaultScene: 'login',
  };
}

// 测试Authing SDK
async function testAuthingSDK() {
  console.log('🧪 Authing SDK测试');
  console.log('==================================');

  const config = getAuthingConfig();
  
  console.log('📋 配置信息:');
  console.log(`应用ID: ${config.appId}`);
  console.log(`域名: ${config.host}`);
  console.log(`回调地址: ${config.redirectUri}`);
  console.log(`环境: ${env.DEV ? '开发环境' : '生产环境'}`);

  try {
    // 创建Authing实例
    const authing = new AuthenticationClient({
      appId: config.appId,
      appHost: config.host,
    });

    console.log('✅ Authing实例创建成功');

    // 构建授权URL
    const authorizeUrl = authing.buildAuthorizeUrl({
      redirectUri: config.redirectUri,
      scope: 'openid profile email phone',
      state: '/creative',
    });

    console.log('');
    console.log('🔗 生成的授权URL:');
    console.log(authorizeUrl);

    console.log('');
    console.log('✅ Authing SDK测试完成');
    console.log('==================================');

    console.log('');
    console.log('💡 使用说明:');
    console.log('1. 复制上面的授权URL到浏览器');
    console.log('2. 完成登录流程');
    console.log('3. 检查是否能正确跳转回应用');
    console.log('4. 验证用户信息是否正确获取');

  } catch (error) {
    console.error('❌ Authing SDK测试失败:', error);
  }
}

// 运行测试
testAuthingSDK(); 