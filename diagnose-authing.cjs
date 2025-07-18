#!/usr/bin/env node

console.log('🔍 Authing redirect_uri_mismatch 错误诊断...\n');

// 错误信息分析
console.log('📋 错误信息:');
console.log('  错误类型: redirect_uri_mismatch');
console.log('  错误描述: redirect_uri 不在白名单内，请前往控制台『应用配置』-『登录回调 URL』进行配置');
console.log('  请求ID: cbf75179a3f3c6a69752a109a65a3f20');

// 可能的原因分析
console.log('\n🔍 可能的原因:');
const possibleCauses = [
  'Authing控制台中的回调URL配置不完整',
  '回调URL格式不匹配（协议、域名、端口、路径）',
  '环境变量配置错误',
  'URL编码问题',
  'Authing应用配置问题'
];

possibleCauses.forEach((cause, index) => {
  console.log(`  ${index + 1}. ${cause}`);
});

// 当前配置检查
console.log('\n📋 当前配置检查:');
const currentConfig = {
  appId: '6867fdc88034eb95ae86167d',
  host: 'qutkgzkfaezk-demo.authing.cn',
  devRedirectUri: 'http://localhost:5173/callback',
  prodRedirectUri: 'https://www.wenpai.xyz/callback'
};

Object.entries(currentConfig).forEach(([key, value]) => {
  console.log(`  ${key}: ${value}`);
});

// 解决方案
console.log('\n✅ 解决方案:');

console.log('\n1. 检查Authing控制台配置:');
console.log('   - 登录: https://console.authing.cn');
console.log('   - 应用ID: 6867fdc88034eb95ae86167d');
console.log('   - 路径: 应用配置 -> 登录回调 URL');
console.log('   - 确保包含以下URL:');
console.log('     * http://localhost:5173/callback');
console.log('     * https://www.wenpai.xyz/callback');

console.log('\n2. 检查URL格式:');
console.log('   - 确保没有多余的空格');
console.log('   - 确保协议正确（http/https）');
console.log('   - 确保端口号正确（5173）');
console.log('   - 确保路径正确（/callback）');

console.log('\n3. 清除缓存和重启:');
console.log('   - 清除浏览器localStorage');
console.log('   - 重启开发服务器');
console.log('   - 清除浏览器缓存');

console.log('\n4. 测试步骤:');
console.log('   - 在Authing控制台添加回调URL');
console.log('   - 保存配置');
console.log('   - 等待1-2分钟让配置生效');
console.log('   - 重新测试登录');

// 调试信息
console.log('\n🔧 调试信息:');
console.log('当前时间:', new Date().toISOString());
console.log('Node版本:', process.version);
console.log('平台:', process.platform);

console.log('\n📞 如果问题仍然存在:');
console.log('1. 检查Authing控制台的应用状态');
console.log('2. 确认应用是否已发布');
console.log('3. 检查网络连接');
console.log('4. 联系Authing技术支持'); 