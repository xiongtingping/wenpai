#!/usr/bin/env node

/**
 * Authing 回调 URL 修复脚本
 * 用于快速修复回调 URL 配置问题
 */

const https = require('https');
const http = require('http');

console.log('🔧 Authing 回调 URL 修复脚本');
console.log('================================');

// 当前配置
const config = {
  appId: '688237f7f9e118de849dc274',
  host: 'ai-wenpai.authing.cn/688237f7f9e118de849dc274',
  redirectUris: [
    'http://localhost:5173/callback',
    'http://localhost:5174/callback', 
    'http://localhost:5175/callback',
    'https://wenpai.netlify.app/callback'
  ],
  logoutUris: [
    'http://localhost:5173/',
    'http://localhost:5174/',
    'http://localhost:5175/',
    'https://wenpai.netlify.app/'
  ]
};

console.log('📋 当前配置:');
console.log(`   App ID: ${config.appId}`);
console.log(`   Host: ${config.host}`);
console.log('   Redirect URIs:');
config.redirectUris.forEach(uri => console.log(`     - ${uri}`));
console.log('   Logout URIs:');
config.logoutUris.forEach(uri => console.log(`     - ${uri}`));

console.log('\n🔧 请在 Authing 控制台中配置以下内容:');
console.log('================================');

console.log('\n1. 登录回调URL配置 (每行一个):');
config.redirectUris.forEach(uri => console.log(`   ${uri}`));

console.log('\n2. 登出回调URL配置 (每行一个):');
config.logoutUris.forEach(uri => console.log(`   ${uri}`));

console.log('\n3. 应用配置检查:');
console.log('   - 应用类型: OIDC');
console.log('   - 应用状态: 已启用');
console.log('   - 权限范围: openid profile email phone');

console.log('\n4. 测试命令:');
console.log('   node test-authing-connection.cjs');
console.log('   node test-authing-login.cjs');

console.log('\n⚠️  重要提醒:');
console.log('   - 确保没有多余的空格或换行符');
console.log('   - 确保URL格式完全正确');
console.log('   - 配置保存后等待1-2分钟生效');
console.log('   - 测试时使用正确的端口号');

console.log('\n🔗 测试URL:');
const testUrl = `https://${config.host}/oidc/auth?client_id=${config.appId}&redirect_uri=${encodeURIComponent(config.redirectUris[0])}&response_type=code&scope=openid+profile+email&state=test`;
console.log(`   ${testUrl}`);

console.log('\n✅ 配置完成后，Authing SDK 应该能够正常工作！'); 