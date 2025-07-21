#!/usr/bin/env node

/**
 * 检查Authing域名白名单配置
 * 解决400 Bad Request错误
 */

console.log('🔍 检查Authing域名白名单配置');
console.log('=====================================');

console.log('\n❌ 当前问题：');
console.log('   - 400 Bad Request错误');
console.log('   - Authing控制台回调URL配置正确');
console.log('   - 可能是域名白名单问题');

console.log('\n🔍 检查步骤：');
console.log('=====================================');

console.log('\n步骤1：检查域名白名单');
console.log('   - 访问：https://console.authing.cn');
console.log('   - 进入：应用 > 自建应用 > wenpai');
console.log('   - 找到"安全设置"或"域名白名单"');

console.log('\n步骤2：添加域名白名单');
console.log('   - 添加：wenpai.netlify.app');
console.log('   - 添加：*.netlify.app');
console.log('   - 添加：localhost');
console.log('   - 添加：127.0.0.1');

console.log('\n步骤3：检查应用类型');
console.log('   - 确认应用类型：OIDC 单页 Web 应用');
console.log('   - 不是"Web 应用"或其他类型');

console.log('\n步骤4：检查认证地址');
console.log('   - 认证地址：ai-wenpai.authing.cn/687e0aafee2b84f86685b644');
console.log('   - 确保与代码中的host一致');

console.log('\n步骤5：强制刷新配置');
console.log('=====================================');
console.log('1. 在Authing控制台点击"保存"按钮');
console.log('2. 等待2-3分钟让配置生效');
console.log('3. 清除浏览器缓存');
console.log('4. 使用无痕模式测试');

console.log('\n🔍 详细检查项目：');
console.log('=====================================');
console.log('✅ 应用类型：OIDC 单页 Web 应用');
console.log('✅ 认证地址：ai-wenpai.authing.cn/687e0aafee2b84f86685b644');
console.log('✅ 登录回调URL：https://wenpai.netlify.app/callback,http://localhost:5173/callback');
console.log('✅ 域名白名单：wenpai.netlify.app');
console.log('✅ App ID：687e0aafee2b84f86685b644');

console.log('\n⚠️  重要提醒：');
console.log('=====================================');
console.log('1. 域名白名单必须包含生产环境域名');
console.log('2. 应用类型必须是"OIDC 单页 Web 应用"');
console.log('3. 配置保存后需要等待生效');
console.log('4. 清除浏览器缓存重试');

console.log('\n📞 如果问题持续：');
console.log('=====================================');
console.log('1. 检查Authing控制台所有配置');
console.log('2. 等待5-10分钟让配置完全生效');
console.log('3. 联系Authing技术支持');
console.log('4. 考虑重新创建应用');

console.log('\n✅ 预期结果：');
console.log('=====================================');
console.log('配置完成后，登录流程应该正常：');
console.log('1. 点击登录 → 跳转到Authing登录页面');
console.log('2. 完成登录 → 跳转到 https://wenpai.netlify.app/callback');
console.log('3. 处理回调 → 跳转到应用首页'); 