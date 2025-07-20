#!/usr/bin/env node

/**
 * 紧急修复localhost重定向问题
 * 解决Authing回调仍然跳转到localhost的问题
 */

console.log('🚨 紧急修复：localhost重定向问题');
console.log('=====================================');

console.log('\n❌ 当前问题：');
console.log('   - 浏览器跳转到：localhost:5177/callback');
console.log('   - 应该跳转到：https://wenpai.netlify.app/callback');
console.log('   - 错误：ERR_CONNECTION_REFUSED');

console.log('\n🔍 问题根源：');
console.log('=====================================');
console.log('Authing控制台中的回调URL配置仍然包含localhost地址，');
console.log('或者Authing服务端缓存了旧的配置。');

console.log('\n🚨 紧急修复步骤：');
console.log('=====================================');

console.log('\n步骤1：立即检查Authing控制台');
console.log('   - 访问：https://console.authing.cn');
console.log('   - 进入应用 > wenpai > 认证配置');
console.log('   - 检查"登录回调 URL"字段');

console.log('\n步骤2：清理回调URL配置');
console.log('   - 删除所有包含localhost的URL');
console.log('   - 删除所有包含127.0.0.1的URL');
console.log('   - 删除所有包含端口号的URL（如:5177）');
console.log('   - 只保留：https://wenpai.netlify.app/callback');

console.log('\n步骤3：检查域名白名单');
console.log('   - 进入"安全设置"');
console.log('   - 删除所有localhost相关域名');
console.log('   - 确保包含：wenpai.netlify.app');

console.log('\n步骤4：强制保存配置');
console.log('   - 点击"保存"按钮');
console.log('   - 等待5-10分钟让配置生效');
console.log('   - 如果可能，尝试"刷新密钥"');

console.log('\n步骤5：清除所有缓存');
console.log('   - 清除浏览器缓存（Ctrl+Shift+Delete）');
console.log('   - 清除浏览器Cookie');
console.log('   - 使用无痕模式测试');

console.log('\n📋 正确的配置应该是：');
console.log('=====================================');
console.log('登录回调 URL：');
console.log('   https://wenpai.netlify.app/callback');
console.log('');
console.log('域名白名单：');
console.log('   wenpai.netlify.app');
console.log('   *.netlify.app');

console.log('\n⚠️  重要检查项：');
console.log('=====================================');
console.log('1. 确保没有多个回调URL（用逗号分隔）');
console.log('2. 确保没有空格或特殊字符');
console.log('3. 确保协议是https://而不是http://');
console.log('4. 确保没有查询参数（如?code=xxx）');

console.log('\n🔧 如果问题持续：');
console.log('=====================================');
console.log('1. 重新创建Authing应用');
console.log('   - 删除当前应用');
console.log('   - 创建新的"OIDC 单页 Web 应用"');
console.log('   - 使用新的App ID');
console.log('');
console.log('2. 更新环境变量');
console.log('   - 更新.env.local中的AUTHING_APP_ID');
console.log('   - 重新部署到Netlify');
console.log('');
console.log('3. 联系Authing技术支持');
console.log('   - 说明redirect_uri_mismatch问题');
console.log('   - 请求清除服务端缓存');

console.log('\n📞 立即行动：');
console.log('=====================================');
console.log('1. 立即进入Authing控制台检查配置');
console.log('2. 删除所有localhost相关的回调URL');
console.log('3. 保存配置并等待生效');
console.log('4. 清除浏览器缓存重新测试');

console.log('\n✅ 修复完成后验证：');
console.log('=====================================');
console.log('1. 访问：https://wenpai.netlify.app');
console.log('2. 点击登录按钮');
console.log('3. 确认跳转到Authing登录页面');
console.log('4. 登录成功后应该跳转到：https://wenpai.netlify.app/callback');

console.log('\n🎯 预期结果：');
console.log('=====================================');
console.log('修复成功后，登录流程应该完全在Netlify域名下进行，');
console.log('不再出现localhost相关的跳转。'); 