/**
 * 🚨 Authing配置问题临时解决方案
 * 由于Authing控制台配置错误导致回调URL被连接成一个字符串
 * 这个脚本将在页面加载时强制修复URL
 */

// 在页面加载时立即执行
(function() {
  'use strict';
  
  console.log('🔧 Authing配置修复脚本启动');
  
  // 🛡️ 强化防重复机制
  let isFixing = false;
  let lastFixedUrl = '';
  let fixAttempts = 0;
  let processedCodes = new Set(); // 记录已处理的授权码
  const MAX_FIX_ATTEMPTS = 1; // 每个授权码最多修复1次
  
  // 检查当前URL是否包含错误的回调URL格式
  function checkAndFixCallback() {
    // 防止并发修复
    if (isFixing) {
      console.log('⏳ URL修复正在进行中，跳过重复处理');
      return false;
    }
    
    const currentUrl = window.location.href;
    
    // 防止重复修复同一个URL
    if (currentUrl === lastFixedUrl) {
      console.log('⏭️ 跳过已修复的URL:', currentUrl);
      return false;
    }
    
    // 🚨 防止过度修复：检查修复次数
    if (fixAttempts >= MAX_FIX_ATTEMPTS) {
      console.log('🛑 已达到最大修复次数，停止修复避免授权码重复使用');
      return false;
    }
    
    // 扩展检查：多种可能的错误回调URL格式
    const errorPatterns = [
      /callback%20%20/,                    // callback%20%20
      /callback\s+/,                      // callback 空格
      /callback%20.*?%20.*?callback/,     // 多个callback连接
      /callback.*?https?:\/\/.*?callback/ // 完整URL连接
    ];
    
    const hasError = errorPatterns.some(pattern => pattern.test(currentUrl));
    
    if (hasError) {
      isFixing = true; // 开始修复
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
        // 🚨 检查授权码是否已被处理过
        if (processedCodes.has(code)) {
          console.log('🛑 授权码已被处理，防止重复使用:', code.substring(0, 10) + '...');
          window.location.replace(`${window.location.origin}/`);
          return true;
        }
        
        // 记录授权码已被处理
        processedCodes.add(code);
        
        // 构建正确的回调URL
        const correctUrl = `${window.location.origin}/callback?code=${encodeURIComponent(code)}${state ? `&state=${encodeURIComponent(state)}` : ''}`;
        
        console.log('🔧 修正URL为:', correctUrl);
        console.log('📝 已记录授权码，防止重复使用');
        
        // 防止循环重定向 & 记录已修复的URL
        if (currentUrl !== correctUrl) {
          lastFixedUrl = correctUrl;
          window.location.replace(correctUrl);
          return true;
        }
      } else {
        console.warn('⚠️ 无法从错误URL中提取授权码，跳转到首页');
        window.location.replace(`${window.location.origin}/`);
        return true;
      }
      
      isFixing = false; // 修复完成
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