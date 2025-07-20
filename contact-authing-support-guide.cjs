#!/usr/bin/env node

/**
 * 联系Authing技术支持指南
 * 解决服务端缓存问题
 */

console.log('📞 联系Authing技术支持指南');
console.log('=====================================');

console.log('\n❌ 问题确认：');
console.log('   - 已重新创建Authing应用');
console.log('   - 客户端配置完全正确');
console.log('   - 使用无痕模式测试');
console.log('   - 重新部署应用');
console.log('   - 但仍然跳转到localhost');
console.log('   - 说明Authing服务端缓存了旧配置');

console.log('\n📋 联系Authing技术支持步骤：');
console.log('=====================================');

console.log('\n步骤1：准备问题描述');
console.log('   - 应用ID：687cc2a82e907f6e8aea5848');
console.log('   - 应用类型：OIDC 单页 Web 应用');
console.log('   - 认证地址：https://aiwenpai.authing.cn');
console.log('   - 回调URL：https://wenpai.netlify.app/callback');

console.log('\n步骤2：联系渠道');
console.log('   - 官网：https://www.authing.cn');
console.log('   - 技术支持：support@authing.cn');
console.log('   - 在线客服：官网右下角');
console.log('   - 技术文档：https://docs.authing.cn');

console.log('\n步骤3：问题描述模板');
console.log('=====================================');
console.log('标题：OIDC应用redirect_uri_mismatch问题 - 服务端缓存');
console.log('');
console.log('问题描述：');
console.log('我创建了一个OIDC单页Web应用，配置如下：');
console.log('- 应用ID：687cc2a82e907f6e8aea5848');
console.log('- 认证地址：https://aiwenpai.authing.cn');
console.log('- 登录回调URL：https://wenpai.netlify.app/callback');
console.log('');
console.log('问题现象：');
console.log('1. 客户端配置完全正确');
console.log('2. 使用无痕模式测试');
console.log('3. 登录成功后仍然跳转到localhost:5177/callback');
console.log('4. 出现ERR_CONNECTION_REFUSED错误');
console.log('');
console.log('已尝试的解决方案：');
console.log('1. 重新创建应用');
console.log('2. 清除浏览器缓存');
console.log('3. 重新部署应用');
console.log('4. 检查所有配置');
console.log('');
console.log('怀疑是Authing服务端缓存了旧的localhost配置，');
console.log('请协助清除服务端缓存或检查应用配置。');

console.log('\n步骤4：提供证据');
console.log('=====================================');
console.log('请提供以下截图：');
console.log('1. Authing控制台应用配置页面');
console.log('2. 浏览器开发者工具控制台输出');
console.log('3. 登录成功后的错误页面');
console.log('4. 网络请求详情');

console.log('\n步骤5：跟进');
console.log('=====================================');
console.log('1. 记录工单号');
console.log('2. 保持沟通');
console.log('3. 提供更多信息');
console.log('4. 等待解决方案');

console.log('\n⚠️  重要提醒：');
console.log('=====================================');
console.log('1. 强调这是服务端缓存问题');
console.log('2. 说明客户端配置完全正确');
console.log('3. 提供详细的测试步骤');
console.log('4. 要求清除服务端缓存');

console.log('\n📞 备用方案：');
console.log('=====================================');
console.log('如果Authing技术支持无法解决：');
console.log('1. 考虑使用其他身份认证服务');
console.log('2. 如Auth0、Okta、Cognito等');
console.log('3. 或者等待Authing服务端缓存自动过期');

console.log('\n✅ 预期结果：');
console.log('=====================================');
console.log('Authing技术支持清除服务端缓存后，');
console.log('登录流程应该完全正常：');
console.log('1. 点击登录 → 跳转到Authing登录页面');
console.log('2. 完成登录 → 跳转到 https://wenpai.netlify.app/callback');
console.log('3. 处理回调 → 跳转到应用首页'); 