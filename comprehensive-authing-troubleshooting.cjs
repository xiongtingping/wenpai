#!/usr/bin/env node

/**
 * 全面Authing问题排查指南
 * 检查所有可能的原因
 */

console.log('🔍 全面Authing问题排查指南');
console.log('=====================================');

console.log('\n❌ 当前状况：');
console.log('   - 400 Bad Request错误');
console.log('   - Authing控制台配置正确');
console.log('   - 域名白名单配置正确');
console.log('   - 需要检查其他可能原因');

console.log('\n🔍 排查步骤：');
console.log('=====================================');

console.log('\n1. 检查Authing应用状态');
console.log('   - 确认应用是否已启用');
console.log('   - 检查应用是否被暂停或删除');
console.log('   - 验证App Secret是否正确');

console.log('\n2. 检查用户池配置');
console.log('   - 确认用户池是否正常');
console.log('   - 检查用户池域名配置');
console.log('   - 验证用户池权限设置');

console.log('\n3. 检查网络和DNS');
console.log('   - 测试 ai-wenpai.authing.cn/687e0aafee2b84f86685b644 是否可访问');
console.log('   - 检查DNS解析是否正常');
console.log('   - 验证网络连接');

console.log('\n4. 检查OIDC配置');
console.log('   - 验证OIDC端点是否正常');
console.log('   - 检查JWKS公钥是否有效');
console.log('   - 确认OIDC协议版本');

console.log('\n5. 检查时间同步');
console.log('   - 确认系统时间是否正确');
console.log('   - 检查时区设置');
console.log('   - 验证时间戳格式');

console.log('\n6. 检查请求参数');
console.log('=====================================');
console.log('当前请求参数：');
console.log('- client_id: 687e0aafee2b84f86685b644');
console.log('- redirect_uri: https://wenpai.netlify.app/callback');
console.log('- response_type: code');
console.log('- scope: openid+profile+email');
console.log('- state: login-1753010635031');

console.log('\n7. 检查Authing服务状态');
console.log('   - 访问Authing状态页面');
console.log('   - 检查是否有服务维护');
console.log('   - 验证API限制');

console.log('\n8. 检查代码中的配置');
console.log('=====================================');
console.log('验证代码中的配置：');
console.log('- 环境变量是否正确加载');
console.log('- 配置是否与Authing控制台一致');
console.log('- 是否有缓存问题');

console.log('\n9. 检查浏览器问题');
console.log('   - 清除所有缓存和Cookie');
console.log('   - 禁用浏览器扩展');
console.log('   - 尝试不同浏览器');

console.log('\n10. 检查Authing控制台日志');
console.log('=====================================');
console.log('在Authing控制台查看：');
console.log('- 应用访问日志');
console.log('- 错误日志');
console.log('- 用户登录记录');

console.log('\n🔧 诊断命令：');
console.log('=====================================');
console.log('1. 测试Authing域名：');
console.log('   curl -I ai-wenpai.authing.cn/687e0aafee2b84f86685b644');
console.log('');
console.log('2. 测试OIDC配置：');
console.log('   curl ai-wenpai.authing.cn/687e0aafee2b84f86685b644/oidc/.well-known/openid-configuration');
console.log('');
console.log('3. 测试JWKS：');
console.log('   curl ai-wenpai.authing.cn/687e0aafee2b84f86685b644/oidc/.well-known/jwks.json');

console.log('\n📞 联系Authing技术支持');
console.log('=====================================');
console.log('如果以上都正常，请联系Authing技术支持：');
console.log('- 提供详细的错误信息');
console.log('- 提供请求URL和参数');
console.log('- 提供Authing控制台配置截图');
console.log('- 说明已尝试的解决方案');

console.log('\n✅ 临时解决方案：');
console.log('=====================================');
console.log('1. 等待24小时让配置完全生效');
console.log('2. 重新创建Authing应用');
console.log('3. 使用其他身份认证服务');
console.log('4. 联系Authing技术支持');

console.log('\n🔍 下一步行动：');
console.log('=====================================');
console.log('1. 运行诊断命令');
console.log('2. 检查Authing控制台日志');
console.log('3. 联系Authing技术支持');
console.log('4. 考虑重新创建应用'); 