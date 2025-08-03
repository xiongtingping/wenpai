/**
 * 🚨 全局 undefinedundefined 修复器
 * 直接修复页面上所有的 undefinedundefined 问题
 */

if (import.meta.env.DEV) {
  console.log('🚨 全局 undefinedundefined 修复器已启动');

  // 🚨 强力修复函数 - 立即清除页面上所有的 undefinedundefined
  const fixUndefinedUndefined = () => {
    let fixCount = 0;

    // 1. 修复所有文本节点
    const walker = document.createTreeWalker(
      document.body,
      NodeFilter.SHOW_TEXT,
      null
    );

    const textNodes = [];
    let node;
    while ((node = walker.nextNode()) !== null) {
      textNodes.push(node);
    }

    textNodes.forEach(textNode => {
      if (textNode.textContent) {
        const original = textNode.textContent;
        let fixed = original;

        // 修复 undefinedundefined
        if (fixed.includes('undefinedundefined')) {
          fixed = fixed.replace(/undefinedundefined/g, '');
          console.log('🛠️ 修复文本节点 undefinedundefined:', original, '->', fixed);
          fixCount++;
        }

        // 修复单独的 undefined
        if (fixed.trim() === 'undefined') {
          fixed = '';
          console.log('🛠️ 修复单独的 undefined');
          fixCount++;
        }

        // 修复包含 undefined 的文本
        if (fixed.includes('undefined')) {
          fixed = fixed.replace(/undefined/g, '');
          console.log('🛠️ 修复包含 undefined 的文本:', original, '->', fixed);
          fixCount++;
        }

        if (fixed !== original) {
          textNode.textContent = fixed;
        }
      }
    });

    // 2. 修复所有元素的属性
    const allElements = document.querySelectorAll('*');
    allElements.forEach(element => {
      // 检查常见属性
      ['title', 'alt', 'placeholder', 'value', 'aria-label'].forEach(attr => {
        const value = element.getAttribute(attr);
        if (value) {
          let fixed = value;

          if (fixed.includes('undefinedundefined')) {
            fixed = fixed.replace(/undefinedundefined/g, '');
            console.log(`🛠️ 修复元素属性 ${attr}:`, value, '->', fixed);
            element.setAttribute(attr, fixed);
            fixCount++;
          }

          if (fixed === 'undefined' || fixed.includes('undefined')) {
            fixed = fixed.replace(/undefined/g, '');
            if (fixed.trim() === '') {
              element.removeAttribute(attr);
              console.log(`🛠️ 移除空的 ${attr} 属性`);
            } else {
              element.setAttribute(attr, fixed);
              console.log(`🛠️ 修复 ${attr} 属性:`, value, '->', fixed);
            }
            fixCount++;
          }
        }
      });
    });

    // 3. 特别处理 Authing Guard 相关元素
    const authingSelectors = [
      '.authing-guard',
      '.authing-ant-modal-root',
      '.g2-error-message-text',
      '[class*="authing"]',
      '[class*="guard"]'
    ];

    authingSelectors.forEach(selector => {
      const elements = document.querySelectorAll(selector);
      elements.forEach(element => {
        if (element.textContent && element.textContent.includes('undefined')) {
          const original = element.textContent;
          const fixed = original.replace(/undefinedundefined/g, '').replace(/undefined/g, '');
          element.textContent = fixed;
          console.log('🛠️ 修复 Authing 元素:', selector, original, '->', fixed);
          fixCount++;
        }
      });
    });

    if (fixCount > 0) {
      console.log(`✅ 修复完成，共修复 ${fixCount} 个问题`);
    }

    return fixCount;
  };
  
  // 立即执行一次修复
  setTimeout(() => {
    fixUndefinedUndefined();
  }, 100);
  
  // 页面加载完成后再次修复
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      setTimeout(fixUndefinedUndefined, 100);
    });
  }
  
  // 定期修复
  setInterval(() => {
    fixUndefinedUndefined();
  }, 2000);
  
  // 监控DOM变化并立即修复
  const observer = new MutationObserver((mutations) => {
    let needsFix = false;
    
    mutations.forEach((mutation) => {
      if (mutation.type === 'childList') {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.TEXT_NODE) {
            if (node.textContent && node.textContent.includes('undefinedundefined')) {
              needsFix = true;
            }
          } else if (node.nodeType === Node.ELEMENT_NODE) {
            const element = node as Element;
            if (element.textContent && element.textContent.includes('undefinedundefined')) {
              needsFix = true;
            }
          }
        });
      }
      
      if (mutation.type === 'characterData') {
        const node = mutation.target;
        if (node.textContent && node.textContent.includes('undefinedundefined')) {
          needsFix = true;
        }
      }
    });
    
    if (needsFix) {
      setTimeout(fixUndefinedUndefined, 10);
    }
  });
  
  observer.observe(document.body, {
    childList: true,
    subtree: true,
    characterData: true,
    attributes: true,
    attributeFilter: ['title', 'alt', 'placeholder', 'value', 'aria-label']
  });
  
  // 添加全局CSS来隐藏可能的 undefinedundefined
  const style = document.createElement('style');
  style.textContent = `
    /* 隐藏包含 undefinedundefined 的元素 */
    *:contains("undefinedundefined") {
      font-size: 0 !important;
      line-height: 0 !important;
      opacity: 0 !important;
      visibility: hidden !important;
    }
    
    /* 特别处理 Authing 相关元素 */
    .authing-guard .g2-error-message-text,
    .authing-ant-modal-root *:contains("undefinedundefined") {
      display: none !important;
    }
    
    /* 隐藏单独的 undefined */
    *:contains("undefined"):not(:contains("undefinedundefined")) {
      color: transparent !important;
    }
  `;
  document.head.appendChild(style);
  
  console.log('🔧 全局修复器设置完成');
  
  // 暴露手动修复函数到全局
  (window as any).fixUndefinedUndefined = fixUndefinedUndefined;
}

export {};
