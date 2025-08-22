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
  
  // 3. 重置URL如果有异常格式 - 增强版，处理多重回调URL连接
  function checkAndCleanUrl() {
    const currentUrl = window.location.href;
    
    // 检查多种URL问题格式
    const urlIssues = [
      // authing-fix导致的问题
      currentUrl.includes('callback%20'),
      currentUrl.includes('callback '),
      currentUrl.match(/callback.*?callback/),
      // 多重回调URL连接问题（新增）
      currentUrl.includes('%20%20https'),
      currentUrl.includes('%20%20http'),
      currentUrl.match(/callback[\s%20]+https?:\/\//),
      // URL中包含多个域名
      currentUrl.match(/\/callback.*?(wenpai\.xyz|netlify\.app|localhost).*?(wenpai\.xyz|netlify\.app|localhost)/)
    ];
    
    const hasUrlIssue = urlIssues.some(issue => issue);
    
    if (hasUrlIssue) {
      console.log('🔧 检测到URL格式问题（可能是多重回调URL），尝试修复...');
      console.log('🔍 原始URL:', currentUrl);
      
      // 提取正确的参数
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');
      const state = urlParams.get('state');
      
      // 如果URL中有code参数，构建干净的回调URL
      if (code) {
        // 使用当前域名构建正确的回调URL
        const cleanUrl = `${window.location.origin}/callback?code=${encodeURIComponent(code)}${state ? `&state=${encodeURIComponent(state)}` : ''}`;
        console.log('🔄 重定向到清理后的URL:', cleanUrl);
        window.location.replace(cleanUrl);
        return true;
      }
      
      // 如果没有code参数，但URL明显有问题，跳转到首页
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
  
  // 6. 启动修复
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', onPageReady);
  } else {
    onPageReady();
  }
  
  // 7. 导出清理函数供手动调用
  window.cacheCleanup = {
    cleanUrl: checkAndCleanUrl,
    fixTheme: checkAndFixTheme,
    runFullClean: function() {
      console.log('🧹 手动执行完整清理...');
      checkAndCleanUrl();
      checkAndFixTheme();
      // 强制刷新页面以清除所有缓存
      setTimeout(() => {
        window.location.reload(true);
      }, 1000);
    }
  };
  
})();