#!/usr/bin/env node

/**
 * Authing 配置诊断脚本
 * 检查所有Authing相关配置是否正确
 */

console.log('🔍 Authing 配置诊断开始...\n');

// 1. 检查环境变量
console.log('📋 1. 环境变量检查:');
const envVars = {
  'VITE_AUTHING_APP_ID': process.env.VITE_AUTHING_APP_ID || '未设置',
  'VITE_AUTHING_HOST': process.env.VITE_AUTHING_HOST || '未设置',
  'VITE_AUTHING_REDIRECT_URI_DEV': process.env.VITE_AUTHING_REDIRECT_URI_DEV || '未设置',
  'VITE_AUTHING_REDIRECT_URI_PROD': process.env.VITE_AUTHING_REDIRECT_URI_PROD || '未设置',
  'VITE_AUTHING_APP_TYPE': process.env.VITE_AUTHING_APP_TYPE || '未设置'
};

Object.entries(envVars).forEach(([key, value]) => {
  const status = value !== '未设置' ? '✅' : '❌';
  console.log(`   ${status} ${key}: ${value}`);
});

// 2. 检查当前运行环境
console.log('\n🌐 2. 运行环境检查:');
const currentUrl = process.env.VITE_DEV_SERVER_URL || 'http://localhost:5173';
console.log(`   📍 当前开发服务器: ${currentUrl}`);
console.log(`   🔧 环境模式: ${process.env.NODE_ENV || 'development'}`);

// 3. 检查Authing控制台配置要求
console.log('\n🔧 3. Authing控制台配置要求:');
console.log('   请确保在Authing控制台中配置以下内容:');
console.log(`   📍 应用ID: ${envVars['VITE_AUTHING_APP_ID']}`);
console.log(`   🌐 域名: ${envVars['VITE_AUTHING_HOST']}`);
console.log(`   🔗 登录回调URL: ${envVars['VITE_AUTHING_REDIRECT_URI_DEV']}`);
console.log(`   🔗 登出回调URL: http://localhost:5173/`);

// 4. 生成测试URL
console.log('\n🧪 4. 测试URL生成:');
const appId = envVars['VITE_AUTHING_APP_ID'];
const host = envVars['VITE_AUTHING_HOST'].replace(/^https?:\/\//, '');
const redirectUri = envVars['VITE_AUTHING_REDIRECT_URI_DEV'];

if (appId !== '未设置' && host !== '未设置' && redirectUri !== '未设置') {
  const testUrl = `https://${host}/oidc/auth?client_id=${appId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=openid+profile+email&state=test`;
  console.log(`   🔗 测试认证URL: ${testUrl}`);
} else {
  console.log('   ❌ 无法生成测试URL，配置不完整');
}

// 5. 检查常见问题
console.log('\n⚠️  5. 常见问题检查:');
const issues = [];

if (envVars['VITE_AUTHING_APP_ID'] === '未设置') {
  issues.push('❌ 应用ID未配置');
}

if (envVars['VITE_AUTHING_HOST'] === '未设置') {
  issues.push('❌ Authing域名未配置');
}

if (envVars['VITE_AUTHING_REDIRECT_URI_DEV'] === '未设置') {
  issues.push('❌ 开发环境回调URL未配置');
}

if (envVars['VITE_AUTHING_REDIRECT_URI_DEV'] && !envVars['VITE_AUTHING_REDIRECT_URI_DEV'].includes('localhost:5173')) {
  issues.push('⚠️  开发环境回调URL端口可能不匹配当前运行端口');
}

if (issues.length === 0) {
  console.log('   ✅ 配置检查通过，未发现明显问题');
} else {
  issues.forEach(issue => console.log(`   ${issue}`));
}

// 6. 下一步操作建议
console.log('\n🚀 6. 下一步操作建议:');
console.log('   1. 访问Authing控制台: https://console.authing.cn/');
console.log('   2. 找到应用ID对应的应用');
console.log('   3. 检查登录回调URL配置');
console.log('   4. 确保回调URL与当前配置一致');
console.log('   5. 保存配置并等待生效');
console.log('   6. 重新测试登录功能');

console.log('\n�� Authing 配置诊断完成！'); 