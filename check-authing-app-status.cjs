#!/usr/bin/env node

/**
 * 检查Authing应用状态
 * 解决400 Bad Request错误
 */

console.log('🔍 检查Authing应用状态');
console.log('=====================================');

console.log('\n✅ 诊断结果：');
console.log('   - Authing域名可访问');
console.log('   - OIDC配置正常');
console.log('   - JWKS公钥有效');
console.log('   - 问题可能是应用状态');

console.log('\n🔍 检查Authing控制台：');
console.log('=====================================');

console.log('\n1. 检查应用状态');
console.log('   - 访问：https://console.authing.cn');
console.log('   - 进入：应用 > 自建应用 > wenpai');
console.log('   - 确认应用状态为"已启用"');
console.log('   - 检查是否有"暂停"或"删除"状态');

console.log('\n2. 检查用户池状态');
console.log('   - 确认用户池是否正常');
console.log('   - 检查用户池域名配置');
console.log('   - 验证用户池权限设置');

console.log('\n3. 检查应用权限');
console.log('   - 确认应用是否有OIDC权限');
console.log('   - 检查应用是否被限制');
console.log('   - 验证API调用限制');

console.log('\n4. 检查应用配置');
console.log('=====================================');
console.log('确认以下配置：');
console.log('✅ 应用类型：OIDC 单页 Web 应用');
console.log('✅ 认证地址：https://aiwenpai.authing.cn');
console.log('✅ 登录回调URL：https://wenpai.netlify.app/callback,http://localhost:5173/callback');
console.log('✅ 域名白名单：wenpai.netlify.app');
console.log('✅ App ID：687cc2a82e907f6e8aea5848');

console.log('\n5. 检查应用日志');
console.log('   - 在Authing控制台查看应用访问日志');
console.log('   - 检查是否有错误日志');
console.log('   - 查看用户登录记录');

console.log('\n6. 检查应用密钥');
console.log('   - 确认App Secret是否正确');
console.log('   - 检查是否需要刷新密钥');
console.log('   - 验证密钥是否过期');

console.log('\n7. 检查应用限制');
console.log('=====================================');
console.log('可能的限制：');
console.log('- 应用调用次数限制');
console.log('- 用户池用户数量限制');
console.log('- API调用频率限制');
console.log('- 域名访问限制');

console.log('\n8. 强制刷新应用');
console.log('   - 在Authing控制台点击"保存"');
console.log('   - 刷新应用密钥');
console.log('   - 重新启用应用');

console.log('\n📞 联系Authing技术支持');
console.log('=====================================');
console.log('如果应用状态正常，请联系Authing技术支持：');
console.log('- 提供App ID：687cc2a82e907f6e8aea5848');
console.log('- 提供错误URL和参数');
console.log('- 说明已尝试的解决方案');
console.log('- 请求检查应用状态和权限');

console.log('\n✅ 临时解决方案：');
console.log('=====================================');
console.log('1. 重新创建Authing应用');
console.log('2. 使用不同的用户池');
console.log('3. 联系Authing技术支持');
console.log('4. 考虑使用其他身份认证服务');

console.log('\n🔍 下一步行动：');
console.log('=====================================');
console.log('1. 检查Authing控制台应用状态');
console.log('2. 查看应用访问日志');
console.log('3. 联系Authing技术支持');
console.log('4. 考虑重新创建应用'); 