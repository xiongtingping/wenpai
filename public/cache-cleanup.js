/**
 * 🧹 缓存清理脚本
 * 彻底清除 authing-fix.js 的缓存影响
 */

(function() {
  'use strict';
  
  console.log('🧹 开始清理缓存和修复问题...');
  
  // 1. 阻止 authing-fix.js 执行
  if (window.location.search.includes('authing-fix')) {
    console.log('🛑 检测到 authing-fix 参数，阻止执行');
    return;
  }
  
  // 2. 清理可能存在的全局变量
  try {
    delete window.authingFixActivated;
    delete window.isFixing;
    delete window.authAttempts;
    delete window.processedCodes;
    console.log('✅ 已清理 authing-fix 相关全局变量');
  } catch (error) {
    console.log('⚠️ 清理全局变量时出错:', error);
  }
  
  // 3. 重置URL如果有异常格式 - 增强版，处理多重回调URL连接 + Round #2授权码防护
  function checkAndCleanUrl() {
    const currentUrl = window.location.href;
    
    // 🛡️ Round #2: 检查授权码重复使用问题
    const urlParams = new URLSearchParams(window.location.search);
    const authCode = urlParams.get('code');
    
    if (authCode) {
      // 检查localStorage中的授权码使用记录
      try {
        const authCodeGuardData = localStorage.getItem('auth_code_guard');
        if (authCodeGuardData) {
          const guardData = JSON.parse(authCodeGuardData);
          const usedCodes = new Map(guardData.usedCodes || []);
          
          if (usedCodes.has(authCode)) {
            console.log('🚫 检测到重复授权码，清理URL并阻止处理');
            // 清理URL，移除授权码参数
            const cleanUrl = window.location.origin + window.location.pathname;
            window.location.replace(cleanUrl);
            return true;
          }
        }
      } catch (e) {
        console.warn('授权码检查失败:', e);
      }
    }
    
    // 检查多种URL问题格式（增强版）
    const urlIssues = [
      // authing-fix导致的问题
      currentUrl.includes('callback%20'),
      currentUrl.includes('callback '),
      currentUrl.match(/callback.*?callback/),
      // 多重回调URL连接问题（增强检测）
      currentUrl.includes('%20%20https'),
      currentUrl.includes('%20%20http'),
      currentUrl.match(/callback[\s%20]+https?:\/\//),
      // URL中包含多个域名（增强检测）
      currentUrl.match(/\/callback.*?(wenpai\.xyz|netlify\.app|localhost).*?(wenpai\.xyz|netlify\.app|localhost)/),
      // 新增：检测空格分隔的多个URL
      currentUrl.match(/https?:\/\/[^\s]+\s+https?:\/\//),
      // 新增：检测编码后的多个URL
      currentUrl.includes('%20http'),
      currentUrl.includes('%20https')
    ];
    
    const hasUrlIssue = urlIssues.some(issue => issue);
    
    if (hasUrlIssue) {
      console.log('🔧 检测到URL格式问题（多重回调URL），尝试修复...');
      console.log('🔍 原始URL:', currentUrl);
      
      // 增强版参数提取 - 处理复杂的URL损坏情况
      let code, state, error, error_description;
      
      // 多种方式尝试提取code参数
      const codeMatches = [
        currentUrl.match(/[?&]code=([^&%\s]+)/),
        currentUrl.match(/code=([a-zA-Z0-9_-]+)/),
        currentUrl.match(/\bcode=([^\s&%]+)/)
      ];
      code = codeMatches.find(match => match)?.[1];
      
      // 多种方式尝试提取state参数
      const stateMatches = [
        currentUrl.match(/[?&]state=([^&%\s]+)/),
        currentUrl.match(/state=([a-zA-Z0-9_-]+)/),
        currentUrl.match(/\bstate=([^\s&%]+)/)
      ];
      state = stateMatches.find(match => match)?.[1];
      
      // 提取错误参数
      const errorMatch = currentUrl.match(/[?&]error=([^&%\s]+)/);
      error = errorMatch?.[1];
      
      const errorDescMatch = currentUrl.match(/[?&]error_description=([^&%\s]+)/);
      error_description = errorDescMatch?.[1];
      
      console.log('📄 提取的参数:', { code: code?.substring(0, 10) + '...', state, error, error_description });
      
      // 获取正确的回调URL基地址
      function getCorrectCallbackUrl() {
        const { hostname, port, protocol } = window.location;
        
        if (hostname === 'localhost' || hostname === '127.0.0.1') {
          const actualPort = port || '5173';
          return `http://localhost:${actualPort}/callback`;
        } else if (hostname === 'wenpai.netlify.app') {
          return 'https://wenpai.netlify.app/callback';
        } else if (hostname === 'wenpai.xyz') {
          return 'https://wenpai.xyz/callback';
        } else {
          return 'https://www.wenpai.xyz/callback';
        }
      }
      
      // 构建干净的URL
      const cleanBaseUrl = getCorrectCallbackUrl();
      const queryParams = new URLSearchParams();
      
      if (code) queryParams.set('code', code);
      if (state) queryParams.set('state', state);
      if (error) queryParams.set('error', error);
      if (error_description) queryParams.set('error_description', error_description);
      
      const queryString = queryParams.toString();
      const cleanUrl = queryString ? `${cleanBaseUrl}?${queryString}` : cleanBaseUrl;
      
      // 如果有有效参数，重定向到干净URL
      if (code || error) {
        console.log('🔄 重定向到规范化的URL:', cleanUrl);
        window.location.replace(cleanUrl);
        return true;
      }
      
      // 如果没有有效参数但URL明显有问题，跳转到首页
      if (currentUrl.includes('callback') && hasUrlIssue) {
        console.log('🏠 URL格式错误且无有效授权码，跳转到首页');
        window.location.replace(window.location.origin);
        return true;
      }
    }
    
    return false;
  }
  
  // 4. 检查并修复主题问题
  function checkAndFixTheme() {
    const html = document.documentElement;
    const currentTheme = html.getAttribute('data-theme');
    
    // 如果没有设置主题或设置错误，强制设为light
    if (!currentTheme || currentTheme === 'undefined') {
      console.log('🎨 修复主题设置为 light');
      html.setAttribute('data-theme', 'light');
      html.classList.remove('dark');
      localStorage.setItem('wenpai-theme', 'light');
    }
  }
  
  // 5. 监听页面加载完成
  function onPageReady() {
    console.log('📱 页面准备就绪，执行修复...');
    
    // 检查URL
    if (checkAndCleanUrl()) {
      return; // 如果需要重定向，停止后续操作
    }
    
    // 修复主题
    checkAndFixTheme();
    
    // 监听可能的错误
    window.addEventListener('error', function(event) {
      const message = event.message || '';
      if (message.includes('authing-fix') || 
          message.includes('AuthingGuard') ||
          message.includes('Receiving end does not exist')) {
        console.log('🛡️ 拦截已知错误:', message);
        event.preventDefault();
        return false;
      }
    });
    
    console.log('✅ 缓存清理和修复完成');
  }
  
  // 6. 启动修复 + Round #2授权码防护
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', onPageReady);
  } else {
    onPageReady();
  }
  
  // 7. 导出清理函数供手动调用 + 授权码重置功能
  window.cacheCleanup = {
    cleanUrl: checkAndCleanUrl,
    fixTheme: checkAndFixTheme,
    resetAuthCodes: function() {
      console.log('🔄 重置所有授权码记录...');
      localStorage.removeItem('auth_code_guard');
      localStorage.removeItem('auth_retry_guard');
      console.log('✅ 授权码记录已清理');
    },
    runFullClean: function() {
      console.log('🧹 手动执行完整清理...');
      checkAndCleanUrl();
      checkAndFixTheme();
      this.resetAuthCodes();
      // 强制刷新页面以清除所有缓存
      setTimeout(() => {
        window.location.reload(true);
      }, 1000);
    }
  };
  
})();