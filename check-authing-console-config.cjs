#!/usr/bin/env node

/**
 * Authing控制台配置诊断脚本
 * 检查Authing应用的回调URL和应用类型配置
 */

console.log('🔍 Authing控制台配置诊断');
console.log('=====================================');

console.log('\n📋 请检查Authing控制台中的以下配置：');
console.log('=====================================');

console.log('\n1️⃣ 应用基本信息：');
console.log('   - 应用名称：wenpai');
console.log('   - App ID：687c5c7f4e778a6485a4f0e0');
console.log('   - 应用类型：应该是"OIDC 单页 Web 应用"');

console.log('\n2️⃣ 认证配置：');
console.log('   - 认证地址：https://wenpaiai.authing.cn');
console.log('   - 登录回调 URL：https://wenpai.netlify.app/callback');
console.log('   - 登出回调 URL：（可以为空）');

console.log('\n3️⃣ 域名白名单：');
console.log('   - 确保包含：wenpai.netlify.app');
console.log('   - 确保包含：*.netlify.app（如果需要）');

console.log('\n4️⃣ 应用类型检查：');
console.log('   - 应用类型必须是"OIDC 单页 Web 应用"');
console.log('   - 不能是"Web 应用"或其他类型');
console.log('   - 这会影响OIDC端点的可用性');

console.log('\n5️⃣ 回调URL格式检查：');
console.log('   - 当前使用的回调URL：https://wenpai.netlify.app/callback');
console.log('   - 确保Authing控制台中的回调URL完全匹配');
console.log('   - 不要包含查询参数（如?code=xxx&state=xxx）');

console.log('\n🔧 修复步骤：');
console.log('=====================================');

console.log('\n步骤1：检查应用类型');
console.log('   - 进入Authing控制台 > 应用 > wenpai');
console.log('   - 确认应用类型是"OIDC 单页 Web 应用"');
console.log('   - 如果不是，需要重新创建应用');

console.log('\n步骤2：检查回调URL');
console.log('   - 在"认证配置"中检查"登录回调 URL"');
console.log('   - 确保只包含：https://wenpai.netlify.app/callback');
console.log('   - 删除任何包含查询参数的URL');

console.log('\n步骤3：检查域名白名单');
console.log('   - 在"安全设置"中检查"域名白名单"');
console.log('   - 确保包含：wenpai.netlify.app');

console.log('\n步骤4：保存配置');
console.log('   - 点击"保存"按钮');
console.log('   - 等待配置生效（可能需要几分钟）');

console.log('\n🔍 测试URL：');
console.log('=====================================');
console.log('测试登录URL：');
console.log('https://wenpaiai.authing.cn/oidc/auth?client_id=687c5c7f4e778a6485a4f0e0&redirect_uri=https%3A%2F%2Fwenpai.netlify.app%2Fcallback&response_type=code&scope=openid+profile+email&state=test-123');

console.log('\n⚠️  常见问题：');
console.log('=====================================');
console.log('1. 应用类型错误：如果不是OIDC应用，会导致400错误');
console.log('2. 回调URL不匹配：Authing控制台中的URL必须完全匹配');
console.log('3. 域名白名单：确保域名在白名单中');
console.log('4. 配置未保存：修改后必须点击保存');

console.log('\n📞 如果问题持续：');
console.log('=====================================');
console.log('1. 检查Authing控制台的错误日志');
console.log('2. 尝试重新创建应用');
console.log('3. 联系Authing技术支持');

console.log('\n✅ 诊断完成！请按照上述步骤检查Authing控制台配置。'); 