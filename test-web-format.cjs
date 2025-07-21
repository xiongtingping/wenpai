#!/usr/bin/env node

const https = require('https');

console.log('🧪 测试Web应用格式...\n');

const appId = '687e0aafee2b84f86685b644';
const host = 'ai-wenpai.authing.cn/687e0aafee2b84f86685b644';
const redirectUri = 'http://localhost:5173/callback';

console.log('📋 配置:');
console.log(`   App ID: ${appId}`);
console.log(`   Host: ${host}`);
console.log(`   Redirect URI: ${redirectUri}`);
console.log('');

// 测试Web应用格式
const webLoginUrl = `https://${host}/login?app_id=${appId}&redirect_uri=${encodeURIComponent(redirectUri)}`;

console.log('🔗 Web应用登录URL:');
console.log(webLoginUrl);
console.log('');

console.log('🔍 测试连接...');
https.get(webLoginUrl, (res) => {
  console.log(`📡 状态码: ${res.statusCode}`);
  
  if (res.statusCode === 302 || res.statusCode === 303) {
    console.log('✅ 成功重定向！');
    console.log(`📍 重定向地址: ${res.headers.location}`);
    console.log('');
    console.log('🎉 Web应用格式工作正常！');
    console.log('现在可以在浏览器中测试登录功能了。');
  } else {
    console.log('❌ 重定向失败');
    console.log(`状态码: ${res.statusCode}`);
  }
}).on('error', (err) => {
  console.log(`❌ 连接错误: ${err.message}`);
}); 