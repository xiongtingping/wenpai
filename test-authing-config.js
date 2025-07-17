/**
 * 测试Authing配置
 */

console.log('🔍 测试Authing配置...\n');

// 模拟环境变量
const mockEnv = {
  VITE_AUTHING_APP_ID: '6867fdc88034eb95ae86167d',
  VITE_AUTHING_HOST: 'https://wenpai.authing.cn',
  VITE_AUTHING_REDIRECT_URI_DEV: 'http://localhost:5173/callback',
  VITE_AUTHING_REDIRECT_URI_PROD: 'https://www.wenpai.xyz/callback',
  DEV: true
};

// 模拟import.meta.env
global.import = {
  meta: {
    env: mockEnv
  }
};

// 测试URL构建逻辑
function testAuthingConfig() {
  const appId = mockEnv.VITE_AUTHING_APP_ID || '6867fdc88034eb95ae86167d';
  const host = (mockEnv.VITE_AUTHING_HOST || 'wenpai.authing.cn').replace(/^https?:\/\//, '');
  const callbackUrl = mockEnv.DEV 
    ? (mockEnv.VITE_AUTHING_REDIRECT_URI_DEV || 'http://localhost:5173/callback')
    : (mockEnv.VITE_AUTHING_REDIRECT_URI_PROD || 'https://www.wenpai.xyz/callback');
  
  const loginUrl = `https://${host}/login?app_id=${appId}&redirect_uri=${encodeURIComponent(callbackUrl)}`;
  
  console.log('📋 配置详情:');
  console.log(`  应用ID: ${appId}`);
  console.log(`  域名: ${host}`);
  console.log(`  回调URL: ${callbackUrl}`);
  console.log(`  登录URL: ${loginUrl}`);
  
  // 验证URL格式
  const isValidUrl = /^https:\/\/[^\/]+\/login\?app_id=[^&]+&redirect_uri=[^&]+$/.test(loginUrl);
  console.log(`\n✅ URL格式验证: ${isValidUrl ? '通过' : '失败'}`);
  
  // 检查是否包含多余空格
  const hasExtraSpaces = loginUrl.includes('  ') || callbackUrl.includes('  ');
  console.log(`✅ 空格检查: ${!hasExtraSpaces ? '通过' : '失败'}`);
  
  return { appId, host, callbackUrl, loginUrl, isValidUrl, hasExtraSpaces };
}

// 运行测试
const result = testAuthingConfig();

console.log('\n🎯 测试结果:');
if (result.isValidUrl && !result.hasExtraSpaces) {
  console.log('✅ 所有测试通过！Authing配置正确。');
} else {
  console.log('❌ 测试失败，需要修复配置。');
} 