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
    
    // 扩展检查：多种可能的错误回调URL格式
    const errorPatterns = [
      /callback%20%20/,                    // callback%20%20
      /callback\s+/,                      // callback 空格
      /callback%20.*?%20.*?callback/,     // 多个callback连接
      /callback.*?https?:\/\/.*?callback/ // 完整URL连接
    ];
    
    const hasError = errorPatterns.some(pattern => pattern.test(currentUrl));
    
    if (hasError) {
      console.log('🚨 检测到错误的回调URL格式:', currentUrl);
      
      // 使用更强大的参数提取方法
      let code = '', state = '';
      
      // 方法1: 标准正则提取
      const codeMatch = currentUrl.match(/[?&]code=([^&\s%]+)/);
      const stateMatch = currentUrl.match(/[?&]state=([^&\s%]+)/);
      
      if (codeMatch) {
        code = decodeURIComponent(codeMatch[1]);
        state = stateMatch ? decodeURIComponent(stateMatch[1]) : '';
      } else {
        // 方法2: 从URL片段中提取（处理复杂情况）
        const urlParts = currentUrl.split(/[?&]/);
        for (const part of urlParts) {
          if (part.startsWith('code=')) {
            code = decodeURIComponent(part.substring(5).split(/[\s&%]/)[0]);
          }
          if (part.startsWith('state=')) {
            state = decodeURIComponent(part.substring(6).split(/[\s&%]/)[0]);
          }
        }
      }
      
      if (code) {
        // 构建正确的回调URL
        const correctUrl = `${window.location.origin}/callback?code=${encodeURIComponent(code)}${state ? `&state=${encodeURIComponent(state)}` : ''}`;
        
        console.log('🔧 修正URL为:', correctUrl);
        
        // 防止循环重定向
        if (currentUrl !== correctUrl) {
          window.location.replace(correctUrl);
          return true;
        }
      } else {
        console.warn('⚠️ 无法从错误URL中提取授权码，跳转到登录页');
        window.location.replace(`${window.location.origin}/`);
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