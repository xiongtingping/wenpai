#!/usr/bin/env node

console.log('🔧 修复Authing回调URL配置...');

// 当前配置的回调URL
const redirectUrls = [
  'http://localhost:5173/callback',
  'https://www.wenpai.xyz/callback'
];

console.log('📋 需要在Authing控制台配置的回调URL:');
redirectUrls.forEach((url, index) => {
  console.log(`  ${index + 1}. ${url}`);
});

console.log('\n🔍 检查Authing控制台配置步骤:');
console.log('1. 登录 https://console.authing.cn');
console.log('2. 进入应用: 6867fdc88034eb95ae86167d');
console.log('3. 点击 "应用配置" -> "登录回调 URL"');
console.log('4. 添加以下回调URL:');
redirectUrls.forEach(url => {
  console.log(`   - ${url}`);
});

console.log('\n⚠️  重要提示:');
console.log('- 确保回调URL完全匹配，包括协议、域名、端口和路径');
console.log('- 开发环境: http://localhost:5173/callback');
console.log('- 生产环境: https://www.wenpai.xyz/callback');
console.log('- 不要添加多余的斜杠或空格');

console.log('\n🔗 测试URL:');
const testUrls = [
  'http://localhost:5173/callback',
  'https://localhost:5173/callback',
  'http://www.wenpai.xyz/callback',
  'https://www.wenpai.xyz/callback'
];

testUrls.forEach(url => {
  const encoded = encodeURIComponent(url);
  console.log(`  ${url} -> ${encoded}`);
});

console.log('\n✅ 修复建议:');
console.log('1. 在Authing控制台添加所有回调URL');
console.log('2. 确保没有多余的空格或特殊字符');
console.log('3. 重启开发服务器');
console.log('4. 清除浏览器缓存和localStorage'); 