#!/usr/bin/env node

/**
 * 检查Authing控制台回调URL配置
 */

const https = require('https');

console.log('🔧 检查Authing控制台回调URL配置...\n');

// 模拟检查Authing控制台的回调URL配置
const appId = '687c5c7f4e778a6485a4f0e0';
const host = 'wenpaiai.authing.cn';

console.log('📋 当前配置信息:');
console.log(`   App ID: ${appId}`);
console.log(`   Host: ${host}`);
console.log(`   回调URL: https://wenpai.netlify.app/callback`);
console.log(`   应用类型: OIDC单页web应用`);
console.log('');

console.log('🔍 请在Authing控制台中检查以下设置:');
console.log('');
console.log('1. 登录 https://console.authing.cn');
console.log('2. 进入应用管理 -> 找到应用ID: 687c5c7f4e778a6485a4f0e0');
console.log('3. 点击"配置" -> "登录控制台"');
console.log('4. 检查"回调地址"设置:');
console.log('   ✅ 应该包含: https://wenpai.netlify.app/callback');
console.log('   ❌ 不应该包含: http://localhost:5173/callback');
console.log('   ❌ 不应该包含: http://localhost:5174/callback');
console.log('   ❌ 不应该包含: http://localhost:5175/callback');
console.log('');
console.log('5. 检查"应用类型"设置:');
console.log('   ✅ 应该是: "单页web应用"');
console.log('   ✅ 协议类型: "OIDC"');
console.log('');
console.log('6. 检查"域名白名单"设置:');
console.log('   ✅ 应该包含: wenpai.netlify.app');
console.log('   ❌ 不应该包含: localhost');
console.log('');
console.log('7. 保存设置后，等待1-2分钟生效');
console.log('');

// 测试当前回调URL
const testUrl = `https://${host}/oidc/auth?client_id=${appId}&redirect_uri=${encodeURIComponent('https://wenpai.netlify.app/callback')}&response_type=code&scope=openid+profile+email&state=test-${Date.now()}`;

console.log('🧪 测试当前回调URL配置:');
console.log(`   URL: ${testUrl}`);
console.log('');

console.log('📝 如果仍然出现400错误，请按以下步骤操作:');
console.log('');
console.log('1. 在Authing控制台中删除所有localhost相关的回调地址');
console.log('2. 确保只保留: https://wenpai.netlify.app/callback');
console.log('3. 保存设置');
console.log('4. 等待1-2分钟');
console.log('5. 清除浏览器缓存');
console.log('6. 重新测试登录');
console.log('');

console.log('🔗 直接访问Authing控制台:');
console.log(`   https://console.authing.cn/console/app/${appId}/detail`);
console.log(''); 