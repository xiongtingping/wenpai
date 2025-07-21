#!/usr/bin/env node

/**
 * 调试Authing回调参数问题
 */

console.log('🔧 调试Authing回调参数问题...\n');

console.log('📋 问题分析:');
console.log('   从截图可以看到，回调页面显示"缺少授权码"');
console.log('   这说明Authing没有正确传递授权码到回调URL');
console.log('');

console.log('🔍 可能的原因:');
console.log('');
console.log('1. Authing控制台配置问题:');
console.log('   - 回调地址配置不正确');
console.log('   - 应用类型配置错误');
console.log('   - 域名白名单配置错误');
console.log('');
console.log('2. Authing服务问题:');
console.log('   - 授权码生成失败');
console.log('   - 回调URL构建错误');
console.log('   - 服务临时故障');
console.log('');
console.log('3. 网络问题:');
console.log('   - 参数在传输过程中丢失');
console.log('   - 重定向过程中参数被截断');
console.log('');

console.log('🔧 立即检查步骤:');
console.log('');
console.log('1. 检查Authing控制台配置:');
console.log('   - 访问: https://console.authing.cn/console/app/687c5c7f4e778a6485a4f0e0/detail');
console.log('   - 确认回调地址: https://wenpai.netlify.app/callback');
console.log('   - 确认应用类型: 单页web应用 (OIDC)');
console.log('   - 确认域名白名单: wenpai.netlify.app');
console.log('');
console.log('2. 检查回调URL格式:');
console.log('   正确的回调URL应该包含:');
console.log('   - code参数 (授权码)');
console.log('   - state参数 (状态码)');
console.log('   例如: https://wenpai.netlify.app/callback?code=xxx&state=xxx');
console.log('');
console.log('3. 测试Authing登录流程:');
console.log('   - 清除浏览器缓存');
console.log('   - 重新访问: https://wenpai.netlify.app');
console.log('   - 点击登录按钮');
console.log('   - 观察浏览器地址栏的变化');
console.log('   - 检查是否包含code参数');
console.log('');

console.log('📝 调试信息收集:');
console.log('');
console.log('请提供以下信息:');
console.log('1. 登录过程中浏览器地址栏的完整URL');
console.log('2. 回调页面的完整URL');
console.log('3. 浏览器开发者工具中的网络请求');
console.log('4. Authing控制台中的错误日志');
console.log('');

console.log('🎯 预期结果:');
console.log('   登录成功后，回调URL应该类似:');
console.log('   https://wenpai.netlify.app/callback?code=abc123&state=login-1234567890');
console.log('');

console.log('🔗 直接测试Authing登录:');
console.log('   ai-wenpai.authing.cn/687e0aafee2b84f86685b644/oidc/auth?client_id=687c5c7f4e778a6485a4f0e0&redirect_uri=https%3A%2F%2Fwenpai.netlify.app%2Fcallback&response_type=code&scope=openid+profile+email&state=test-1752981750826');
console.log(''); 