#!/usr/bin/env node

/**
 * Prompt参数修复验证脚本
 * 验证移除prompt=signup参数后的注册URL生成
 */

console.log('🔧 Prompt参数修复验证');
console.log('================================\n');

// 模拟修复后的注册URL生成
function generateFixedRegisterUrl() {
  const config = {
    appId: '68823897631e1ef8ff3720b2',
    host: 'https://rzcswqs4sq0f.authing.cn',
    redirectUri: 'https://www.wenpai.xyz/callback'
  };

  const state = JSON.stringify({
    ts: Date.now(),
    mode: 'register',
    redirectTo: 'https://www.wenpai.xyz/'
  });

  // 生成PKCE参数
  const crypto = require('crypto');
  const codeVerifier = crypto.randomBytes(32).toString('base64url');
  const codeChallenge = crypto.createHash('sha256').update(codeVerifier).digest('base64url');
  const nonce = crypto.randomBytes(16).toString('base64url');

  console.log('📋 修复前的问题参数:');
  console.log('   ❌ prompt=signup (不支持)');
  console.log('   ❌ 导致400错误: prompt 必须为 none、login、consent 之一');
  console.log('');

  console.log('🔧 修复后的参数:');
  
  // 修复后的参数（移除prompt=signup）
  const fixedParams = new URLSearchParams({
    client_id: config.appId,
    redirect_uri: config.redirectUri,
    response_type: 'code',
    scope: 'openid profile email',
    state: encodeURIComponent(state),
    code_challenge: codeChallenge,
    code_challenge_method: 'S256',
    nonce,
    response_mode: 'query',
    screen_hint: 'signup'
    // 注意：移除了 prompt: 'signup'
  });

  const registerUrl = `${config.host}/${config.appId}/register?${fixedParams.toString()}`;
  
  console.log('   ✅ screen_hint=signup (保留)');
  console.log('   ✅ 移除了prompt参数');
  console.log('   ✅ 使用专用注册端点 /register');
  console.log('');

  console.log('🔗 修复后的注册URL:');
  console.log(`   ${registerUrl}`);
  console.log('');

  return registerUrl;
}

// 对比修复前后的差异
function compareBeforeAfter() {
  console.log('📊 修复前后对比:');
  console.log('================================');
  
  console.log('\n❌ 修复前 (导致400错误):');
  console.log('   端点: /oidc/auth');
  console.log('   参数: prompt=signup (不支持)');
  console.log('   错误: invalid_request');
  
  console.log('\n✅ 修复后:');
  console.log('   端点: /register (专用注册端点)');
  console.log('   参数: screen_hint=signup (支持)');
  console.log('   状态: 应该正常工作');
}

// 生成测试建议
function generateTestSuggestions() {
  console.log('\n🧪 测试建议:');
  console.log('================================');
  
  console.log('\n1. 清除浏览器缓存:');
  console.log('   - 清除localStorage');
  console.log('   - 清除sessionStorage');
  console.log('   - 硬刷新页面 (Ctrl+F5)');
  
  console.log('\n2. 测试注册按钮:');
  console.log('   - 访问 https://www.wenpai.xyz/');
  console.log('   - 点击"注册"按钮');
  console.log('   - 观察是否还有400错误');
  
  console.log('\n3. 检查URL参数:');
  console.log('   - 确认URL中没有prompt=signup');
  console.log('   - 确认使用了/register端点');
  console.log('   - 确认screen_hint=signup存在');
  
  console.log('\n4. 验证注册流程:');
  console.log('   - 尝试完成注册');
  console.log('   - 检查回调处理');
  console.log('   - 确认用户创建成功');
}

// 检查Authing支持的参数
function checkAuthingParameters() {
  console.log('\n📋 Authing支持的参数:');
  console.log('================================');
  
  console.log('\n✅ 支持的prompt值:');
  console.log('   - none: 不显示任何UI');
  console.log('   - login: 强制显示登录页面');
  console.log('   - consent: 显示授权同意页面');
  
  console.log('\n✅ 支持的注册相关参数:');
  console.log('   - screen_hint=signup: 提示显示注册页面');
  console.log('   - goto=/register: 跳转到注册页面');
  
  console.log('\n❌ 不支持的参数:');
  console.log('   - prompt=signup: 导致400错误');
  console.log('   - prompt=register: 不是标准OIDC参数');
}

// 主执行函数
function main() {
  generateFixedRegisterUrl();
  compareBeforeAfter();
  checkAuthingParameters();
  generateTestSuggestions();
  
  console.log('\n🎯 总结:');
  console.log('================================');
  console.log('✅ 已移除导致400错误的prompt=signup参数');
  console.log('✅ 保留了screen_hint=signup参数');
  console.log('✅ 使用专用注册端点/register');
  console.log('✅ 修复应该已经生效');
  
  console.log('\n🚀 下一步:');
  console.log('   等待Netlify部署完成后测试注册功能');
  console.log('   如果仍有问题，可能需要检查Authing应用配置');
  
  console.log('\n🎉 修复完成！');
}

main();
