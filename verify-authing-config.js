/**
 * Authing配置验证脚本
 * 检查Authing配置是否正确
 */

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

// 验证配置
console.log('🔍 Authing配置验证');
console.log('==================================');

const config = getAuthingConfig();

console.log('📋 当前配置:');
console.log(`应用ID: ${config.appId}`);
console.log(`域名: ${config.host}`);
console.log(`回调地址: ${config.redirectUri}`);
console.log(`环境: ${env.DEV ? '开发环境' : '生产环境'}`);

// 构建登录URL
const loginUrl = new URL('/login', `https://${config.host}`);
loginUrl.searchParams.set('app_id', config.appId);
loginUrl.searchParams.set('redirect_uri', config.redirectUri);

console.log('');
console.log('🔗 生成的登录URL:');
console.log(loginUrl.toString());

console.log('');
console.log('✅ 配置验证完成');
console.log('==================================');

// 检查配置是否正确
const issues = [];

if (!config.appId) {
  issues.push('❌ 缺少应用ID');
}

if (!config.host) {
  issues.push('❌ 缺少域名配置');
}

if (!config.redirectUri) {
  issues.push('❌ 缺少回调地址');
}

if (issues.length === 0) {
  console.log('✅ 配置看起来正确');
} else {
  console.log('⚠️  发现以下问题:');
  issues.forEach(issue => console.log(issue));
}

console.log('');
console.log('💡 建议：');
console.log('1. 确保Authing控制台中的回调URL配置正确');
console.log('2. 检查应用ID是否有效');
console.log('3. 确认域名配置是否匹配'); 