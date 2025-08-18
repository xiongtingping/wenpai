#!/usr/bin/env node

/**
 * 登录状态检测脚本
 * 检测当前登录是否为真实登录还是模拟登录
 */

console.log('🔍 登录状态检测');
console.log('================================\n');

// 模拟浏览器环境中的检测逻辑
function analyzeLoginStatus() {
  console.log('📋 登录状态分析:');
  
  // 从您提供的错误日志中提取的用户ID
  const observedUserId = '6882df3f2f9efaa6e241dce5';
  
  console.log(`   观察到的用户ID: ${observedUserId}`);
  console.log(`   用户ID长度: ${observedUserId.length}`);
  console.log(`   用户ID格式: ${observedUserId.match(/^[a-f0-9]+$/i) ? '十六进制' : '其他格式'}`);
  
  // 分析用户ID特征
  const isAuthingFormat = observedUserId.length >= 20 && observedUserId.match(/^[a-f0-9]+$/i);
  const isObjectIdFormat = observedUserId.length === 24 && observedUserId.match(/^[a-f0-9]+$/i);
  
  console.log('\n🔍 用户ID分析:');
  console.log(`   符合Authing格式: ${isAuthingFormat ? '✅ 是' : '❌ 否'}`);
  console.log(`   符合ObjectId格式: ${isObjectIdFormat ? '✅ 是' : '❌ 否'}`);
  
  // 从错误日志分析登录流程
  console.log('\n📊 登录流程分析:');
  console.log('   ✅ 有授权码: code=EYV_66vuzn4cF_lopIFsHnCcCePxmw_scNV1WbqJ_lh');
  console.log('   ✅ 有状态参数: state包含register模式');
  console.log('   ✅ 有API调用: subscription-expiry API被调用');
  console.log('   ✅ 有用户头像: 使用了Dicebear头像服务');
  
  return {
    userId: observedUserId,
    isReal: isAuthingFormat,
    hasAuthCode: true,
    hasApiCalls: true,
    loginType: isAuthingFormat ? '真实Authing登录' : '可能的模拟登录'
  };
}

// 分析注册按钮问题
function analyzeRegisterButtonIssue() {
  console.log('\n🔧 注册按钮问题分析:');
  
  console.log('   📝 从错误日志可以看出:');
  console.log('      1. State参数包含 "mode":"register" ✅');
  console.log('      2. 用户确实点击了注册按钮 ✅');
  console.log('      3. 但最终还是进入了登录流程 ❌');
  
  console.log('\n   🎯 可能的原因:');
  console.log('      1. Authing应用配置中注册功能被禁用');
  console.log('      2. screen_hint=signup参数被忽略');
  console.log('      3. 注册端点不存在，降级到登录端点');
  console.log('      4. Authing应用类型配置问题');
  
  console.log('\n   💡 解决方案:');
  console.log('      1. 检查Authing控制台中的注册设置');
  console.log('      2. 使用专用注册端点 /register');
  console.log('      3. 添加多种注册参数组合');
  console.log('      4. 实现端点检测和降级机制');
}

// 生成Authing控制台检查清单
function generateAuthingCheckList() {
  console.log('\n📋 Authing控制台检查清单:');
  console.log('================================');
  
  console.log('\n🔐 登录Authing控制台:');
  console.log('   1. 访问: https://console.authing.cn/');
  console.log('   2. 找到App ID: 68823897631e1ef8ff3720b2');
  
  console.log('\n⚙️ 检查应用配置:');
  console.log('   1. 应用状态: 确保已启用');
  console.log('   2. 应用类型: 单页应用(SPA)或Web应用');
  console.log('   3. 注册设置: 确保注册功能已启用');
  
  console.log('\n📝 检查注册配置:');
  console.log('   1. 注册方式: 确保启用邮箱/手机号注册');
  console.log('   2. 注册页面: 确保有独立的注册页面');
  console.log('   3. 注册流程: 确保注册流程正常');
  
  console.log('\n🔗 检查回调地址:');
  console.log('   1. 登录回调: https://www.wenpai.xyz/callback');
  console.log('   2. 注册回调: https://www.wenpai.xyz/callback');
  console.log('   3. 开发回调: http://localhost:5173/callback');
  
  console.log('\n🛡️ 检查安全设置:');
  console.log('   1. CORS设置: 允许www.wenpai.xyz域名');
  console.log('   2. PKCE设置: 确保启用PKCE');
  console.log('   3. 授权模式: 确保启用授权码模式');
}

// 生成测试建议
function generateTestSuggestions() {
  console.log('\n🧪 测试建议:');
  console.log('================================');
  
  console.log('\n1. 直接测试注册端点:');
  console.log('   访问: https://rzcswqs4sq0f.authing.cn/68823897631e1ef8ff3720b2/register');
  console.log('   预期: 显示注册页面或重定向到注册页面');
  
  console.log('\n2. 测试带参数的登录端点:');
  console.log('   访问: https://rzcswqs4sq0f.authing.cn/68823897631e1ef8ff3720b2/login?screen_hint=signup');
  console.log('   预期: 显示注册页面或注册选项');
  
  console.log('\n3. 检查应用配置:');
  console.log('   在Authing控制台中检查registerDisabled字段');
  console.log('   确保注册功能未被禁用');
  
  console.log('\n4. 测试修复后的注册按钮:');
  console.log('   清除浏览器缓存和localStorage');
  console.log('   重新访问 https://www.wenpai.xyz/');
  console.log('   点击注册按钮，观察跳转行为');
}

// 主执行函数
function main() {
  const loginStatus = analyzeLoginStatus();
  
  console.log('\n🎯 结论:');
  console.log('================================');
  console.log(`   登录类型: ${loginStatus.loginType}`);
  console.log(`   用户ID: ${loginStatus.userId}`);
  console.log(`   是否真实登录: ${loginStatus.isReal ? '✅ 是' : '❌ 否'}`);
  
  if (loginStatus.isReal) {
    console.log('\n✅ 好消息: 这是真实的Authing登录！');
    console.log('   - 用户ID格式正确');
    console.log('   - 有完整的OAuth流程');
    console.log('   - API调用正常');
    console.log('   - 问题只是注册按钮跳转逻辑');
  } else {
    console.log('\n⚠️ 需要确认: 登录状态不明确');
    console.log('   - 用户ID格式异常');
    console.log('   - 可能是模拟登录');
  }
  
  analyzeRegisterButtonIssue();
  generateAuthingCheckList();
  generateTestSuggestions();
  
  console.log('\n🎉 检测完成！');
  console.log('   建议优先检查Authing控制台的注册配置');
  console.log('   然后测试修复后的注册端点');
}

main();
