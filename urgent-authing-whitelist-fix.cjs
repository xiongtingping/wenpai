#!/usr/bin/env node

/**
 * 紧急修复Authing白名单问题
 * 解决redirect_uri_mismatch错误
 */

console.log('🚨 紧急修复Authing白名单问题');
console.log('=====================================');

console.log('\n❌ 错误信息：');
console.log('   - error: redirect_uri_mismatch');
console.log('   - error_description: redirect_uri 不在白名单内');
console.log('   - request_id: 83dbd8e88ad98fc238e5cd3774894eff');

console.log('\n🔍 问题根源：');
console.log('   Authing服务端认为回调URL不在白名单内');
console.log('   可能是配置未生效或格式问题');

console.log('\n🚨 立即行动：');
console.log('=====================================');

console.log('\n1. 立即检查Authing控制台');
console.log('   - 访问：https://console.authing.cn');
console.log('   - 进入：应用 > 自建应用 > wenpai');
console.log('   - 点击：应用配置 > 登录回调 URL');

console.log('\n2. 确认回调URL格式');
console.log('=====================================');
console.log('✅ 正确的回调URL格式：');
console.log('   https://wenpai.netlify.app/callback');
console.log('   http://localhost:5173/callback');
console.log('   http://localhost:5174/callback');
console.log('   http://localhost:5175/callback');

console.log('\n3. 检查URL格式问题');
console.log('=====================================');
console.log('❌ 常见格式错误：');
console.log('   - 末尾有多余的斜杠');
console.log('   - 大小写不匹配');
console.log('   - 协议不匹配（http vs https）');
console.log('   - 端口号缺失');

console.log('\n4. 强制保存配置');
console.log('   - 删除所有回调URL');
console.log('   - 重新添加回调URL');
console.log('   - 点击"保存"按钮');
console.log('   - 等待2-3分钟');

console.log('\n5. 检查域名白名单');
console.log('=====================================');
console.log('✅ 确保域名白名单包含：');
console.log('   - wenpai.netlify.app');
console.log('   - localhost');

console.log('\n6. 刷新应用密钥');
console.log('   - 点击"刷新密钥"');
console.log('   - 更新环境变量中的App Secret');
console.log('   - 重新部署应用');

console.log('\n7. 清除缓存');
console.log('=====================================');
console.log('   - 清除浏览器缓存');
console.log('   - 清除Cookie');
console.log('   - 使用无痕模式测试');
console.log('   - 强制刷新Netlify部署');

console.log('\n8. 验证配置');
console.log('=====================================');
console.log('测试URL：');
console.log('   ai-wenpai.authing.cn/687e0aafee2b84f86685b644/oidc/auth?');
console.log('   client_id=687e0aafee2b84f86685b644&');
console.log('   redirect_uri=https%3A%2F%2Fwenpai.netlify.app%2Fcallback&');
console.log('   response_type=code&');
console.log('   scope=openid+profile+email');

console.log('\n📞 如果问题持续');
console.log('=====================================');
console.log('联系Authing技术支持：');
console.log('- 提供request_id: 83dbd8e88ad98fc238e5cd3774894eff');
console.log('- 提供错误截图');
console.log('- 说明已尝试的解决方案');

console.log('\n✅ 临时解决方案：');
console.log('=====================================');
console.log('1. 重新创建Authing应用');
console.log('2. 使用不同的用户池');
console.log('3. 联系Authing技术支持');
console.log('4. 考虑使用其他身份认证服务');

console.log('\n🔍 下一步行动：');
console.log('=====================================');
console.log('1. 立即检查Authing控制台回调URL配置');
console.log('2. 确认URL格式正确');
console.log('3. 强制保存配置');
console.log('4. 清除缓存并测试'); 