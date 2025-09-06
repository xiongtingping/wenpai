/**
 * 验证Authing回调URL配置
 */

console.log('🔍 验证Authing回调URL配置...\n');

// 检查环境变量
const devRedirectUri = import.meta.env.VITE_AUTHING_REDIRECT_URI_DEV;
const prodRedirectUri = import.meta.env.VITE_AUTHING_REDIRECT_URI_PROD;

console.log('📋 当前配置:');
console.log(`  开发环境: ${devRedirectUri || '未设置'}`);
console.log(`  生产环境: ${prodRedirectUri || '未设置'}`);

// 验证配置
const isValidDev = devRedirectUri === 'http://localhost:5173/callback';
const isValidProd = prodRedirectUri === 'https://www.wenpai.xyz/callback';

console.log('\n✅ 验证结果:');
console.log(`  开发环境配置: ${isValidDev ? '✅ 正确' : '❌ 错误'}`);
console.log(`  生产环境配置: ${isValidProd ? '✅ 正确' : '❌ 错误'}`);

if (isValidDev && isValidProd) {
  console.log('\n🎉 所有配置都正确！Authing回调URL问题已修复。');
} else {
  console.log('\n⚠️  配置有问题，请检查.env文件。');
}

// 测试Authing配置
import { getAuthingConfig } from './src/config/authing.ts';

try {
  const config = getAuthingConfig();
  console.log('\n🔧 Authing配置测试:');
  console.log(`  应用ID: ${config.appId || '未设置'}`);
  console.log(`  域名: ${config.host || '未设置'}`);
  console.log(`  回调URL: ${config.redirectUri}`);
  console.log(`  模式: ${config.mode}`);
  
  if (config.redirectUri && !config.redirectUri.includes(' ')) {
    console.log('✅ 回调URL格式正确，无多余空格');
  } else {
    console.log('❌ 回调URL格式有问题，包含多余空格或字符');
  }
} catch (error) {
  console.log('❌ Authing配置测试失败:', error.message);
}
