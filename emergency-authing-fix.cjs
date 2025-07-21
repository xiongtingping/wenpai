#!/usr/bin/env node

/**
 * Authing 紧急修复脚本
 * 解决 400 错误和回调 URL 配置问题
 */

console.log('🚨 Authing 紧急修复脚本启动...\n');

console.log('📋 问题诊断:');
console.log('   ❌ 400 Bad Request 错误');
console.log('   ❌ redirect_uri_mismatch 错误');
console.log('   ❌ 回调 URL 配置不正确\n');

console.log('🔧 立即修复步骤:\n');

console.log('1️⃣ 登录 Authing 控制台:');
console.log('   https://console.authing.cn/\n');

console.log('2️⃣ 找到应用 "wenpai":');
console.log('   左侧菜单 → 应用 → 自建应用 → wenpai\n');

console.log('3️⃣ 进入应用配置页面:');
console.log('   点击应用卡片进入配置页面\n');

console.log('4️⃣ 配置登录回调 URL:');
console.log('   找到 "登录回调 URL" 字段，添加以下 URL（每行一个）:');
console.log('   ┌─────────────────────────────────────────┐');
console.log('   │ http://localhost:5173/callback          │');
console.log('   │ http://localhost:5174/callback          │');
console.log('   │ http://localhost:5175/callback          │');
console.log('   │ http://localhost:8888/callback          │');
console.log('   │ https://wenpai.netlify.app/callback     │');
console.log('   │ https://www.wenpai.xyz/callback         │');
console.log('   │ https://wenpai.xyz/callback             │');
console.log('   └─────────────────────────────────────────┘\n');

console.log('5️⃣ 配置登出回调 URL:');
console.log('   找到 "登出回调 URL" 字段，添加以下 URL（每行一个）:');
console.log('   ┌─────────────────────────────────────────┐');
console.log('   │ http://localhost:5173/                  │');
console.log('   │ http://localhost:5174/                  │');
console.log('   │ http://localhost:5175/                  │');
console.log('   │ http://localhost:8888/                  │');
console.log('   │ https://wenpai.netlify.app/             │');
console.log('   │ https://www.wenpai.xyz/                 │');
console.log('   │ https://wenpai.xyz/                     │');
console.log('   └─────────────────────────────────────────┘\n');

console.log('6️⃣ 检查授权配置:');
console.log('   确保以下配置正确:');
console.log('   ✅ 授权模式: 开启 "authorization_code"');
console.log('   ✅ 返回类型: 开启 "code"');
console.log('   ✅ 应用类型: "单页 Web 应用"\n');

console.log('7️⃣ 保存配置:');
console.log('   点击页面底部的 "保存" 按钮\n');

console.log('8️⃣ 验证修复:');
console.log('   返回应用重新测试登录功能\n');

console.log('⚠️ 重要注意事项:');
console.log('   • 确保每个 URL 完全匹配，包括协议、端口、路径');
console.log('   • 不要有多余的空格或特殊字符');
console.log('   • 每个 URL 必须单独占一行');
console.log('   • 保存后可能需要等待几分钟才能生效\n');

console.log('🔍 如果问题仍然存在:');
console.log('   1. 检查应用 ID 是否正确: 687e0aafee2b84f86685b644');
console.log('   2. 检查域名是否正确: ai-wenpai.authing.cn/687e0aafee2b84f86685b644');
console.log('   3. 联系 Authing 技术支持');
console.log('   4. 检查应用是否已启用\n');

console.log('📞 技术支持:');
console.log('   Authing 官方文档: https://docs.authing.cn/');
console.log('   Authing 控制台: https://console.authing.cn/');
console.log('   技术支持: https://forum.authing.cn/\n');

console.log('✅ 修复完成后，Authing SDK 将完全可用！'); 