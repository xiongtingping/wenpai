#!/usr/bin/env node

/**
 * Authing redirect_uri_mismatch 错误修复指南
 * 解决回调URL不匹配的问题
 */

console.log('🚨 Authing redirect_uri_mismatch 错误修复指南');
console.log('=====================================');

console.log('\n❌ 当前错误：');
console.log('   - 错误类型：redirect_uri_mismatch');
console.log('   - 错误描述：redirect_uri 不在白名单内');
console.log('   - 当前使用的回调URL：https://wenpai.netlify.app/callback');

console.log('\n🔍 问题分析：');
console.log('=====================================');
console.log('Authing控制台中的"登录回调 URL"配置与代码中使用的回调URL不匹配。');
console.log('需要确保Authing控制台中的回调URL白名单包含：https://wenpai.netlify.app/callback');

console.log('\n🔧 修复步骤：');
console.log('=====================================');

console.log('\n步骤1：进入Authing控制台');
console.log('   - 访问：https://console.authing.cn');
console.log('   - 登录您的Authing账户');
console.log('   - 进入"应用" > "自建应用" > "wenpai"');

console.log('\n步骤2：检查应用类型');
console.log('   - 确认应用类型是"OIDC 单页 Web 应用"');
console.log('   - 如果不是，需要重新创建应用');

console.log('\n步骤3：配置登录回调URL');
console.log('   - 点击"认证配置"标签');
console.log('   - 找到"登录回调 URL"字段');
console.log('   - 确保包含：https://wenpai.netlify.app/callback');
console.log('   - 如果有多个URL，用英文逗号分隔');
console.log('   - 删除任何localhost相关的URL');

console.log('\n步骤4：检查域名白名单');
console.log('   - 点击"安全设置"标签');
console.log('   - 找到"域名白名单"字段');
console.log('   - 确保包含：wenpai.netlify.app');
console.log('   - 可以添加：*.netlify.app（如果需要）');

console.log('\n步骤5：保存配置');
console.log('   - 点击"保存"按钮');
console.log('   - 等待配置生效（可能需要几分钟）');

console.log('\n📋 正确的配置示例：');
console.log('=====================================');
console.log('登录回调 URL：');
console.log('   https://wenpai.netlify.app/callback');
console.log('');
console.log('域名白名单：');
console.log('   wenpai.netlify.app');
console.log('   *.netlify.app');

console.log('\n⚠️  重要提醒：');
console.log('=====================================');
console.log('1. 回调URL必须完全匹配，包括协议（https://）');
console.log('2. 不要在回调URL中包含查询参数（如?code=xxx）');
console.log('3. 确保没有多余的空格或特殊字符');
console.log('4. 配置修改后需要等待几分钟才能生效');

console.log('\n🔍 验证步骤：');
console.log('=====================================');
console.log('1. 保存配置后等待5-10分钟');
console.log('2. 清除浏览器缓存');
console.log('3. 重新测试登录流程');
console.log('4. 检查是否还有400错误');

console.log('\n📞 如果问题持续：');
console.log('=====================================');
console.log('1. 检查Authing控制台的错误日志');
console.log('2. 确认应用类型是"OIDC 单页 Web 应用"');
console.log('3. 尝试重新创建应用');
console.log('4. 联系Authing技术支持');

console.log('\n✅ 修复完成后，重新运行测试脚本验证：');
console.log('   node test-authing-oidc-endpoints.cjs');

console.log('\n🎯 预期结果：');
console.log('=====================================');
console.log('修复成功后，授权端点应该返回302重定向，而不是400错误。');
console.log('登录流程应该能够正常完成。'); 