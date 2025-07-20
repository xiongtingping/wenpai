/**
 * 🔍 Authing URL 诊断工具
 * 用于找出 Authing 正在尝试访问哪个 URL
 */

// 拦截 fetch 请求来查看 Authing 的 API 调用
const originalFetch = window.fetch;
window.fetch = function(...args) {
  const url = args[0];
  console.log('🔍 Authing 正在访问:', url);
  
  // 如果是 Authing 相关的请求，记录详细信息
  if (typeof url === 'string' && (url.includes('authing') || url.includes('qutkgzkfaezk'))) {
    console.log('🚨 发现 Authing 请求:', {
      url,
      method: args[1]?.method || 'GET',
      headers: args[1]?.headers,
      body: args[1]?.body
    });
  }
  
  return originalFetch.apply(this, args);
};

// 拦截 XMLHttpRequest
const originalXHROpen = XMLHttpRequest.prototype.open;
XMLHttpRequest.prototype.open = function(method, url, ...args) {
  console.log('🔍 XHR 请求:', method, url);
  
  // 如果是 Authing 相关的请求，记录详细信息
  if (typeof url === 'string' && (url.includes('authing') || url.includes('qutkgzkfaezk'))) {
    console.log('🚨 发现 Authing XHR 请求:', {
      method,
      url,
      args
    });
  }
  
  return originalXHROpen.apply(this, [method, url, ...args]);
};

console.log('✅ Authing URL 诊断工具已启动');
console.log('🔍 现在请尝试登录，我会记录所有 Authing 相关的请求'); 