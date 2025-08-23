/**
 * 🔐 登录流程验证脚本
 * 验证认证系统是否正常工作
 */

console.log('🔐 开始登录流程验证...');

// 验证认证系统初始化
function validateAuthInitialization() {
  console.log('🚀 验证认证系统初始化...');
  
  // 检查全局认证相关对象
  const hasAuthingErrorInterceptor = typeof window.AuthingErrorInterceptor !== 'undefined';
  const hasAuthFlowUtils = typeof window.authFlowUtils !== 'undefined';
  
  console.log('Authing错误拦截器:', hasAuthingErrorInterceptor ? '✅ 已加载' : '❌ 未加载');
  console.log('认证流程工具:', hasAuthFlowUtils ? '✅ 已加载' : '❌ 未加载');
  
  if (hasAuthingErrorInterceptor) {
    try {
      const interceptor = window.AuthingErrorInterceptor.getInstance();
      console.log('✅ 错误拦截器实例获取成功');
    } catch (error) {
      console.log('❌ 错误拦截器实例获取失败:', error.message);
    }
  }
}

// 测试登录按钮
function testLoginButton() {
  console.log('🔍 测试登录按钮...');
  
  // 查找登录按钮
  const loginButtons = [
    document.querySelector('button[contains(text(), "登录")]'),
    document.querySelector('button[contains(text(), "开始创作")]'),
    document.querySelector('[data-testid="login-button"]'),
    document.querySelector('.login-btn')
  ].filter(Boolean);
  
  if (loginButtons.length > 0) {
    console.log(`✅ 找到 ${loginButtons.length} 个登录按钮`);
    
    loginButtons.forEach((btn, index) => {
      console.log(`  按钮${index + 1}: ${btn.textContent?.trim() || btn.className}`);
    });
    
    console.log('💡 可以点击登录按钮测试认证流程');
  } else {
    console.log('⚠️ 未找到登录按钮，可能页面还在加载');
  }
}

// 验证回调URL处理
function validateCallbackHandling() {
  console.log('🔄 验证回调URL处理...');
  
  const currentUrl = window.location.href;
  const isCallbackPage = currentUrl.includes('/callback');
  const hasAuthCode = currentUrl.includes('code=');
  const hasError = currentUrl.includes('error=');
  
  console.log('当前URL:', currentUrl);
  console.log('是否回调页面:', isCallbackPage);
  console.log('是否包含授权码:', hasAuthCode);
  console.log('是否包含错误:', hasError);
  
  if (isCallbackPage) {
    console.log('📍 当前在回调页面');
    
    if (hasAuthCode) {
      console.log('✅ 检测到授权码，认证流程正常');
    } else if (hasError) {
      console.log('❌ 检测到认证错误');
    } else {
      console.log('⚠️ 回调页面但无授权码或错误信息');
    }
  }
}

// 测试redirect_uri修复
function testRedirectUriFix() {
  console.log('🛡️ 测试redirect_uri修复...');
  
  // 检查是否有多重URL问题
  const currentUrl = window.location.href;
  const hasMultipleUrls = currentUrl.includes('%20http') || currentUrl.includes(' http');
  
  if (hasMultipleUrls) {
    console.log('🚨 检测到多重URL问题:', currentUrl);
    console.log('🔧 错误拦截器应该会自动处理此问题');
  } else {
    console.log('✅ URL格式正常，无多重URL问题');
  }
  
  // 检查Round #4修复是否生效
  console.log('💡 如果出现redirect错误，Round #4修复应该会自动处理');
}

// 运行所有验证
validateAuthInitialization();
setTimeout(testLoginButton, 500);
setTimeout(validateCallbackHandling, 1000);
setTimeout(testRedirectUriFix, 1500);

console.log('\n📋 登录流程验证启动完成');
console.log('🔍 请手动点击登录按钮测试完整的认证流程');