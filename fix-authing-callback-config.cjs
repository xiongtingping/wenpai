#!/usr/bin/env node

/**
 * 修复Authing控制台回调地址配置
 */

console.log('🔧 修复Authing控制台回调地址配置...\n');

const appId = '687c5c7f4e778a6485a4f0e0';

console.log('📋 问题分析:');
console.log('   从截图可以看到，Authing登录成功，但回调到了localhost:5177');
console.log('   这说明Authing控制台中的回调地址配置包含了本地开发地址');
console.log('');

console.log('🔧 立即修复步骤:');
console.log('');
console.log('1. 访问Authing控制台:');
console.log(`   https://console.authing.cn/console/app/${appId}/detail`);
console.log('');
console.log('2. 进入"配置" → "登录控制台"');
console.log('');
console.log('3. 在"回调地址"设置中:');
console.log('   ❌ 删除所有localhost相关的地址:');
console.log('      - http://localhost:5173/callback');
console.log('      - http://localhost:5174/callback');
console.log('      - http://localhost:5175/callback');
console.log('      - http://localhost:5176/callback');
console.log('      - http://localhost:5177/callback');
console.log('      - http://localhost:8888/callback');
console.log('');
console.log('   ✅ 只保留生产环境地址:');
console.log('      - https://wenpai.netlify.app/callback');
console.log('');
console.log('4. 在"域名白名单"设置中:');
console.log('   ❌ 删除所有localhost相关的域名');
console.log('   ✅ 只保留: wenpai.netlify.app');
console.log('');
console.log('5. 保存设置');
console.log('');
console.log('6. 等待1-2分钟让配置生效');
console.log('');
console.log('7. 清除浏览器缓存');
console.log('');
console.log('8. 重新测试登录');
console.log('');

console.log('🎯 预期结果:');
console.log('   登录成功后应该回调到: https://wenpai.netlify.app/callback');
console.log('   而不是: localhost:5177/callback');
console.log('');

console.log('📝 如果问题仍然存在:');
console.log('   1. 检查是否有多个Authing应用配置');
console.log('   2. 确保使用的是正确的App ID: 687c5c7f4e778a6485a4f0e0');
console.log('   3. 检查是否有浏览器扩展干扰');
console.log('   4. 尝试无痕模式测试');
console.log('');

console.log('🔗 直接访问Authing控制台:');
console.log(`   https://console.authing.cn/console/app/${appId}/detail`);
console.log(''); 