/**
 * 🚨 Authing配置问题临时解决方案
 * 由于Authing控制台配置错误导致回调URL被连接成一个字符串
 * 这个脚本将在页面加载时强制修复URL
 */

// 在页面加载时立即执行
(function() {
  'use strict';
  
  console.log('🔧 Authing配置修复脚本启动');
  
  // 检查当前URL是否包含错误的回调URL格式
  function checkAndFixCallback() {
    const currentUrl = window.location.href;
    
    // 检查是否是错误的回调URL（包含多个URL连接）
    if (currentUrl.includes('callback%20%20') || currentUrl.includes('callback ')) {
      console.log('🚨 检测到错误的回调URL格式:', currentUrl);
      
      // 提取授权码和状态参数
      const codeMatch = currentUrl.match(/[?&]code=([^&]+)/);
      const stateMatch = currentUrl.match(/[?&]state=([^&]+)/);
      
      if (codeMatch) {
        const code = decodeURIComponent(codeMatch[1]);
        const state = stateMatch ? decodeURIComponent(stateMatch[1]) : '';
        
        // 构建正确的回调URL
        const correctUrl = `${window.location.origin}/callback?code=${code}${state ? `&state=${state}` : ''}`;
        
        console.log('🔧 修正URL为:', correctUrl);
        
        // 立即跳转到正确的URL
        window.location.replace(correctUrl);
        return true;
      }
    }
    
    return false;
  }
  
  // 立即检查
  if (checkAndFixCallback()) {
    return; // 如果已经修复并跳转，不继续执行
  }
  
  // 监听URL变化（如果是SPA）
  let lastUrl = location.href;
  
  const checkUrlChange = () => {
    const currentUrl = location.href;
    if (currentUrl !== lastUrl) {
      lastUrl = currentUrl;
      checkAndFixCallback();
    }
  };
  
  // 监听popstate事件
  window.addEventListener('popstate', checkUrlChange);
  
  // 监听pushState和replaceState
  const originalPushState = history.pushState;
  const originalReplaceState = history.replaceState;
  
  history.pushState = function() {
    originalPushState.apply(history, arguments);
    setTimeout(checkUrlChange, 0);
  };
  
  history.replaceState = function() {
    originalReplaceState.apply(history, arguments);
    setTimeout(checkUrlChange, 0);
  };
  
  console.log('✅ Authing配置修复脚本已激活');
})();