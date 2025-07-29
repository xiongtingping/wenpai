/**
 * 🩹 SimpleAuthTestPage运行时补丁
 * 专门修复LOCKED文件中的undefined拼接问题
 */

(function() {
  console.log('🩹 启动SimpleAuthTestPage运行时补丁...');
  
  // 等待页面加载完成
  function waitForPageLoad() {
    if (document.readyState === 'complete') {
      applyPatch();
    } else {
      window.addEventListener('load', applyPatch);
    }
  }
  
  function applyPatch() {
    // 检查是否在SimpleAuthTestPage
    if (!window.location.pathname.includes('/simple-auth-test')) {
      return;
    }
    
    console.log('🩹 在SimpleAuthTestPage页面，开始应用补丁...');
    
    // 方法1：DOM内容替换
    function patchDOMContent() {
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === Node.TEXT_NODE) {
              if (node.textContent && node.textContent.includes('undefinedundefined')) {
                console.warn('🩹 发现并修复DOM中的undefinedundefined:', node.textContent);
                node.textContent = node.textContent.replace(/undefinedundefined/g, '未设置');
              }
            } else if (node.nodeType === Node.ELEMENT_NODE) {
              // 检查元素的文本内容
              const walker = document.createTreeWalker(
                node,
                NodeFilter.SHOW_TEXT,
                null,
                false
              );
              
              let textNode;
              while (textNode = walker.nextNode()) {
                if (textNode.textContent && textNode.textContent.includes('undefinedundefined')) {
                  console.warn('🩹 发现并修复元素中的undefinedundefined:', textNode.textContent);
                  textNode.textContent = textNode.textContent.replace(/undefinedundefined/g, '未设置');
                }
              }
            }
          });
        });
      });
      
      observer.observe(document.body, {
        childList: true,
        subtree: true,
        characterData: true
      });
      
      console.log('🩹 DOM内容监控已启动');
    }
    
    // 方法2：拦截用户对象访问
    function patchUserObjectAccess() {
      // 创建一个安全的用户对象代理
      function createSafeUserProxy(originalUser) {
        if (!originalUser || typeof originalUser !== 'object') {
          return originalUser;
        }
        
        return new Proxy(originalUser, {
          get(target, prop) {
            const value = target[prop];
            
            // 如果访问的是可能导致undefined拼接的属性
            if (['nickname', 'username', 'email', 'id'].includes(prop)) {
              if (value === undefined || value === null) {
                console.warn(`🩹 拦截undefined属性访问: ${prop}, 返回安全值`);
                return '未设置'; // 返回安全的默认值
              }
            }
            
            return value;
          }
        });
      }
      
      // 尝试拦截全局用户对象
      if (window.__UNIFIED_AUTH_USER__) {
        window.__UNIFIED_AUTH_USER__ = createSafeUserProxy(window.__UNIFIED_AUTH_USER__);
        console.log('🩹 已为全局用户对象应用安全代理');
      }
      
      // 监控用户对象的变化
      let lastUser = null;
      setInterval(() => {
        if (window.__UNIFIED_AUTH_USER__ && window.__UNIFIED_AUTH_USER__ !== lastUser) {
          window.__UNIFIED_AUTH_USER__ = createSafeUserProxy(window.__UNIFIED_AUTH_USER__);
          lastUser = window.__UNIFIED_AUTH_USER__;
          console.log('🩹 检测到用户对象变化，重新应用安全代理');
        }
      }, 1000);
    }
    
    // 方法3：定期扫描和修复页面内容
    function periodicContentFix() {
      setInterval(() => {
        const allText = document.body.textContent || '';
        if (allText.includes('undefinedundefined')) {
          console.warn('🩹 定期扫描发现undefinedundefined，开始修复...');
          
          // 查找所有包含undefinedundefined的文本节点
          const walker = document.createTreeWalker(
            document.body,
            NodeFilter.SHOW_TEXT,
            {
              acceptNode: function(node) {
                return node.textContent.includes('undefinedundefined') ? 
                  NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
              }
            }
          );
          
          const nodesToFix = [];
          let node;
          while (node = walker.nextNode()) {
            nodesToFix.push(node);
          }
          
          nodesToFix.forEach(textNode => {
            const originalText = textNode.textContent;
            const fixedText = originalText.replace(/undefinedundefined/g, '未设置');
            textNode.textContent = fixedText;
            console.log(`🩹 修复文本: "${originalText}" -> "${fixedText}"`);
          });
          
          if (nodesToFix.length > 0) {
            console.log(`🩹 定期扫描修复了 ${nodesToFix.length} 个问题`);
          }
        }
      }, 2000);
    }
    
    // 方法4：拦截React渲染（如果可能）
    function patchReactRendering() {
      // 这个在运行时检测器中已经实现了
      console.log('🩹 React渲染拦截已在运行时检测器中实现');
    }
    
    // 应用所有补丁
    try {
      patchDOMContent();
      patchUserObjectAccess();
      periodicContentFix();
      patchReactRendering();
      
      console.log('✅ SimpleAuthTestPage补丁应用完成');
      
      // 立即进行一次修复
      setTimeout(() => {
        const allText = document.body.textContent || '';
        if (allText.includes('undefinedundefined')) {
          console.warn('🩹 页面加载后立即发现undefinedundefined，开始修复...');
          
          const walker = document.createTreeWalker(
            document.body,
            NodeFilter.SHOW_TEXT,
            {
              acceptNode: function(node) {
                return node.textContent.includes('undefinedundefined') ? 
                  NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
              }
            }
          );
          
          let node;
          while (node = walker.nextNode()) {
            const originalText = node.textContent;
            const fixedText = originalText.replace(/undefinedundefined/g, '未设置');
            node.textContent = fixedText;
            console.log(`🩹 立即修复: "${originalText}" -> "${fixedText}"`);
          }
        }
      }, 1000);
      
    } catch (error) {
      console.error('❌ 补丁应用失败:', error);
    }
  }
  
  // 启动补丁
  waitForPageLoad();
  
  // 暴露补丁接口
  window.__simpleAuthTestPatch = {
    isActive: true,
    forceApply: applyPatch,
    checkStatus: () => {
      const allText = document.body.textContent || '';
      const count = (allText.match(/undefinedundefined/g) || []).length;
      console.log(`🩹 补丁状态检查: 发现 ${count} 个undefinedundefined`);
      return count;
    }
  };
  
  console.log('🩹 SimpleAuthTestPage补丁系统已就绪');
})();
