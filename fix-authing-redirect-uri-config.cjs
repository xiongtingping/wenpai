#!/usr/bin/env node

/**
 * 修复Authing重定向URI配置
 * 解决redirect_uri_mismatch错误
 */

console.log('🔧 修复Authing重定向URI配置');
console.log('=====================================');

console.log('\n❌ 发现的问题：');
console.log('   - 前端代码动态获取端口');
console.log('   - 当前运行在端口5175');
console.log('   - Authing控制台可能只配置了5173');
console.log('   - 导致redirect_uri_mismatch错误');

console.log('\n🔍 当前配置分析：');
console.log('=====================================');

console.log('\n前端代码配置：');
console.log('✅ 生产环境: https://wenpai.netlify.app/callback');
console.log('⚠️  开发环境: 动态获取端口');
console.log('   - 当前端口: 5175');
console.log('   - 可能的端口: 5173, 5174, 5175, 5176...');

console.log('\nAuthing控制台需要配置：');
console.log('✅ 生产环境: https://wenpai.netlify.app/callback');
console.log('✅ 开发环境: http://localhost:5173/callback');
console.log('✅ 开发环境: http://localhost:5174/callback');
console.log('✅ 开发环境: http://localhost:5175/callback');
console.log('✅ 开发环境: http://localhost:5176/callback');

console.log('\n🚨 立即行动：');
console.log('=====================================');

console.log('\n1. 更新Authing控制台回调URL');
console.log('   - 访问：https://console.authing.cn');
console.log('   - 进入：应用 > 自建应用 > wenpai');
console.log('   - 点击：应用配置 > 登录回调 URL');
console.log('   - 添加以下URL：');

console.log('\n✅ 必须添加的回调URL：');
console.log('   https://wenpai.netlify.app/callback');
console.log('   http://localhost:5173/callback');
console.log('   http://localhost:5174/callback');
console.log('   http://localhost:5175/callback');
console.log('   http://localhost:5176/callback');
console.log('   http://localhost:8888/callback');

console.log('\n2. 更新域名白名单');
console.log('   - 确保包含：wenpai.netlify.app');
console.log('   - 确保包含：localhost');

console.log('\n3. 强制保存配置');
console.log('   - 删除所有现有回调URL');
console.log('   - 重新添加上述URL');
console.log('   - 点击"保存"按钮');
console.log('   - 等待2-3分钟');

console.log('\n4. 清除缓存');
console.log('   - 清除浏览器缓存');
console.log('   - 清除Cookie');
console.log('   - 使用无痕模式测试');

console.log('\n5. 重新部署');
console.log('   - 强制刷新Netlify部署');
console.log('   - 确保环境变量正确');

console.log('\n🔧 代码修复建议：');
console.log('=====================================');

console.log('\n方案1：固定开发环境端口');
console.log('   - 修改vite.config.ts，固定端口为5173');
console.log('   - 避免动态端口分配');

console.log('\n方案2：更新环境变量');
console.log('   - 在.env.local中添加：');
console.log('   VITE_AUTHING_REDIRECT_URI_DEV=http://localhost:5173/callback');

console.log('\n方案3：简化回调地址逻辑');
console.log('   - 开发环境统一使用5173端口');
console.log('   - 生产环境使用Netlify域名');

console.log('\n📞 如果问题持续');
console.log('=====================================');
console.log('联系Authing技术支持：');
console.log('- 提供request_id: 83dbd8e88ad98fc238e5cd3774894eff');
console.log('- 说明端口动态分配问题');
console.log('- 请求检查回调URL配置');

console.log('\n✅ 临时解决方案：');
console.log('=====================================');
console.log('1. 固定使用端口5173进行开发');
console.log('2. 在Authing控制台添加所有可能的端口');
console.log('3. 联系Authing技术支持');
console.log('4. 考虑重新创建应用');

console.log('\n🔍 下一步行动：');
console.log('=====================================');
console.log('1. 立即在Authing控制台添加所有端口');
console.log('2. 固定开发环境端口为5173');
console.log('3. 清除缓存并测试');
console.log('4. 如果问题持续，联系Authing技术支持'); 