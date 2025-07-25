#!/usr/bin/env node

console.log('🔧 更新Authing回调URL配置...\n');

// 检测当前端口
const currentPort = process.env.PORT || '5173';
console.log(`📋 检测到端口: ${currentPort}`);

// 更新后的回调URL
const redirectUrls = [
  `http://localhost:${currentPort}/callback`,
  'https://www.wenpai.xyz/callback'
];

console.log('📋 需要在Authing控制台配置的回调URL:');
redirectUrls.forEach((url, index) => {
  console.log(`  ${index + 1}. ${url}`);
});

console.log('\n🔍 Authing控制台配置步骤:');
console.log('1. 登录 https://console.authing.cn');
console.log('2. 进入应用: 688237f7f9e118de849dc274');
console.log('3. 点击 "应用配置" -> "登录回调 URL"');
console.log('4. 删除所有现有的回调URL');
console.log('5. 添加以下回调URL:');
redirectUrls.forEach(url => {
  console.log(`   - ${url}`);
});
console.log('6. 保存配置');
console.log('7. 等待1-2分钟让配置生效');

console.log('\n⚠️  重要提示:');
console.log(`- 当前开发服务器端口: ${currentPort}`);
console.log('- 确保回调URL完全匹配');
console.log('- 不要添加多余的空格或斜杠');

console.log('\n✅ 修复完成后的测试步骤:');
console.log('1. 在Authing控制台完成配置');
console.log('2. 等待配置生效');
console.log('3. 清除浏览器localStorage: localStorage.clear()');
console.log('4. 刷新页面');
console.log('5. 测试登录功能');

console.log('\n🎯 预期结果:');
console.log('- 登录按钮点击后正常跳转到Authing登录页面');
console.log('- 登录成功后正确回调到应用');
console.log('- 不再出现redirect_uri_mismatch错误'); 