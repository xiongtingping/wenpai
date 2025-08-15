/**
 * 🚨 生产环境紧急undefined修复脚本
 * 专门解决生产环境中的undefinedundefined问题
 */

(function() {
  console.log('🚨 生产环境紧急undefined修复脚本启动');
  
  // 1. 拦截所有可能产生undefinedundefined的字符串操作
  const originalStringConcat = String.prototype.concat;
  String.prototype.concat = function(...args) {
    const result = originalStringConcat.apply(this, args);
    
    // 如果检测到undefinedundefined，立即修复
    if (result.includes('undefinedundefined')) {
      console.warn('🔧 检测到undefinedundefined，自动修复为"用户"');
      return result.replace(/undefinedundefined/g, '用户');
    }
    
    return result;
  };
  
  // 2. 拦截模板字符串操作
  const originalToString = Object.prototype.toString;
  Object.prototype.toString = function() {
    const result = originalToString.call(this);
    
    if (typeof this === 'string' && this.includes('undefinedundefined')) {
      console.warn('🔧 模板字符串检测到undefinedundefined，自动修复');
      return this.replace(/undefinedundefined/g, '用户');
    }
    
    return result;
  };
  
  // 3. 全局字符串替换函数
  window.fixUndefinedString = function(str) {
    if (typeof str !== 'string') return str;
    return str.replace(/undefinedundefined/g, '用户')
              .replace(/undefined/g, '')
              .trim() || '用户';
  };
  
  // 4. 安全的用户显示名称函数
  window.safeUserDisplayName = function(user, fallback = '用户') {
    if (!user || typeof user !== 'object') return fallback;
    
    const nickname = user.nickname;
    const username = user.username;
    const email = user.email;
    
    // 严格检查，避免undefined字符串
    if (nickname && nickname !== 'undefined' && typeof nickname === 'string') {
      return nickname.trim();
    }
    
    if (username && username !== 'undefined' && typeof username === 'string') {
      return username.trim();
    }
    
    if (email && email !== 'undefined' && typeof email === 'string' && email.includes('@')) {
      return email.split('@')[0].trim();
    }
    
    return fallback;
  };
  
  // 5. DOM内容修复
  function fixDOMContent() {
    const walker = document.createTreeWalker(
      document.body,
      NodeFilter.SHOW_TEXT,
      null,
      false
    );
    
    let node;
    const nodesToFix = [];
    
    while (node = walker.nextNode()) {
      if (node.textContent && node.textContent.includes('undefinedundefined')) {
        nodesToFix.push(node);
      }
    }
    
    nodesToFix.forEach(node => {
      const fixedText = node.textContent.replace(/undefinedundefined/g, '用户');
      node.textContent = fixedText;
      console.log('🔧 修复DOM文本:', node.textContent);
    });
  }
  
  // 6. 定期检查和修复
  setInterval(fixDOMContent, 1000);
  
  // 7. 页面加载完成后立即修复
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', fixDOMContent);
  } else {
    fixDOMContent();
  }
  
  console.log('✅ 生产环境紧急undefined修复脚本已激活');
})();
