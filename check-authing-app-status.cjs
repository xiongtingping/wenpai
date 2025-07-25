#!/usr/bin/env node

/**
 * 检查 Authing 应用状态
 * 验证应用是否正确配置和启用
 */

console.log('🔍 检查 Authing 应用状态...\n');

console.log('📋 问题分析:');
console.log('   ❌ 所有登录 URL 都返回 400 错误');
console.log('   ❌ 这通常表示应用配置有问题\n');

console.log('🔧 立即检查步骤:\n');

console.log('1️⃣ 登录 Authing 控制台:');
console.log('   https://console.authing.cn/\n');

console.log('2️⃣ 检查应用状态:');
console.log('   左侧菜单 → 应用 → 自建应用 → wenpai\n');

console.log('3️⃣ 验证应用配置:');
console.log('   ✅ 应用状态: 确保应用已启用');
console.log('   ✅ 应用类型: 确保为"单页 Web 应用"');
console.log('   ✅ 认证地址: ai-wenpai.authing.cn/688237f7f9e118de849dc274');
console.log('   ✅ App ID: 688237f7f9e118de849dc274\n');

console.log('4️⃣ 检查授权配置:');
console.log('   点击"授权配置"选项卡，确保:');
console.log('   ✅ 授权模式: 开启 "authorization_code"');
console.log('   ✅ 返回类型: 开启 "code"');
console.log('   ✅ 授权范围: 包含 "openid profile email phone"\n');

console.log('5️⃣ 检查认证配置:');
console.log('   点击"认证配置"选项卡，确保:');
console.log('   ✅ 登录回调 URL 包含: http://localhost:5174/callback');
console.log('   ✅ 登出回调 URL 包含: http://localhost:5174/\n');

console.log('6️⃣ 检查应用权限:');
console.log('   确保应用有正确的权限设置\n');

console.log('⚠️ 如果应用配置看起来正确，可能的问题:');
console.log('   • Authing 服务端临时问题');
console.log('   • 应用需要重新保存配置');
console.log('   • 需要联系 Authing 技术支持\n');

console.log('🔄 尝试的解决方案:');
console.log('   1. 保存应用配置（即使没有修改）');
console.log('   2. 等待 5-10 分钟让配置生效');
console.log('   3. 重新测试登录功能');
console.log('   4. 如果问题持续，联系 Authing 技术支持\n');

console.log('📞 联系 Authing 技术支持:');
console.log('   • 技术支持论坛: https://forum.authing.cn/');
console.log('   • 官方文档: https://docs.authing.cn/');
console.log('   • 提供错误详情: 400 Bad Request on /oidc/auth\n');

console.log('✅ 检查完成后，Authing SDK 应该能正常工作！'); 