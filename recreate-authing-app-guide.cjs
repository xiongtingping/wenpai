#!/usr/bin/env node

/**
 * 重新创建Authing应用指南
 * 解决Authing服务端缓存问题
 */

console.log('🔄 重新创建Authing应用指南');
console.log('=====================================');

console.log('\n❌ 当前问题确认：');
console.log('   - Authing控制台配置正确');
console.log('   - 代码配置正确');
console.log('   - 使用无痕模式测试');
console.log('   - 重新部署应用');
console.log('   - 但仍然跳转到localhost');
console.log('   - 说明Authing服务端缓存了旧配置');

console.log('\n🔧 重新创建Authing应用步骤：');
console.log('=====================================');

console.log('\n步骤1：删除当前Authing应用');
console.log('   - 访问：https://console.authing.cn');
console.log('   - 进入：应用 > 自建应用 > wenpai');
console.log('   - 点击"删除应用"');
console.log('   - 确认删除');

console.log('\n步骤2：创建新的Authing应用');
console.log('   - 点击"创建应用"');
console.log('   - 选择"OIDC 单页 Web 应用"');
console.log('   - 应用名称：wenpai');
console.log('   - 应用描述：文派AI应用');

console.log('\n步骤3：配置新应用');
console.log('   - 认证地址：ai-wenpai.authing.cn/687e0aafee2b84f86685b644');
console.log('   - 登录回调 URL：https://wenpai.netlify.app/callback');
console.log('   - 登出回调 URL：（留空）');

console.log('\n步骤4：配置域名白名单');
console.log('   - 进入：安全设置');
console.log('   - 域名白名单：wenpai.netlify.app');
console.log('   - 可以添加：*.netlify.app');

console.log('\n步骤5：保存配置');
console.log('   - 点击"保存"按钮');
console.log('   - 记录新的App ID');

console.log('\n步骤6：更新环境变量');
console.log('   - 更新.env.local中的AUTHING_APP_ID');
console.log('   - 更新Netlify环境变量');

console.log('\n步骤7：重新部署');
console.log('   - 推送代码到GitHub');
console.log('   - 等待Netlify自动部署');

console.log('\n📋 新应用配置示例：');
console.log('=====================================');
console.log('应用类型：OIDC 单页 Web 应用');
console.log('应用名称：wenpai');
console.log('登录回调 URL：https://wenpai.netlify.app/callback');
console.log('域名白名单：wenpai.netlify.app');

console.log('\n⚠️  重要提醒：');
console.log('=====================================');
console.log('1. 确保选择"OIDC 单页 Web 应用"类型');
console.log('2. 不要选择"Web 应用"或其他类型');
console.log('3. 回调URL必须完全匹配');
console.log('4. 删除所有localhost相关配置');

console.log('\n🔍 验证步骤：');
console.log('=====================================');
console.log('1. 保存新应用配置');
console.log('2. 更新环境变量');
console.log('3. 重新部署应用');
console.log('4. 清除浏览器缓存');
console.log('5. 使用无痕模式测试');

console.log('\n✅ 预期结果：');
console.log('=====================================');
console.log('重新创建应用后，登录流程应该完全正常：');
console.log('1. 点击登录 → 跳转到Authing登录页面');
console.log('2. 完成登录 → 跳转到 https://wenpai.netlify.app/callback');
console.log('3. 处理回调 → 跳转到应用首页');

console.log('\n📞 如果问题持续：');
console.log('=====================================');
console.log('联系Authing技术支持，说明：');
console.log('- redirect_uri_mismatch问题');
console.log('- 服务端缓存问题');
console.log('- 已重新创建应用但问题持续'); 