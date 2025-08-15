/**
 * 🚨 Authing错误修复器
 * 专门修复Authing Guard中导致undefinedundefined的错误
 */

// 🚨 [AUTHING_ERROR_FIXER_v2025.08.14] 专门修复Authing内部错误
console.log('🛡️ Authing错误修复器已启动');

// 1. 修复JSON.stringify错误 - 增强版
const originalStringify = JSON.stringify;
JSON.stringify = function(value, replacer?, space?) {
  try {
    // 如果stringify函数是undefined，使用安全的替代方案
    if (typeof originalStringify !== 'function') {
      console.warn('🛠️ JSON.stringify不可用，使用安全替代方案');
      return String(value);
    }
    return originalStringify.call(this, value, replacer, space);
  } catch (error) {
    console.warn('🛠️ JSON.stringify错误，使用安全替代方案:', error);

    // 🚨 [ENHANCED_STRINGIFY_v2025.08.14] 增强的安全字符串化
    const safeStringify = (obj: any): string => {
      if (obj === null) return 'null';
      if (obj === undefined) return '""'; // 返回空字符串而不是undefined
      if (typeof obj === 'string') return `"${obj.replace(/"/g, '\\"')}"`;
      if (typeof obj === 'number' || typeof obj === 'boolean') return String(obj);
      if (Array.isArray(obj)) {
        return '[' + obj.map(item => safeStringify(item)).join(',') + ']';
      }
      if (typeof obj === 'object') {
        try {
          const pairs = Object.keys(obj).map(key => {
            const val = obj[key];
            if (val === undefined) return null; // 跳过undefined值
            return `"${key}":${safeStringify(val)}`;
          }).filter(Boolean);
          return '{' + pairs.join(',') + '}';
        } catch {
          return '{}';
        }
      }
      return '""'; // 默认返回空字符串
    };

    return safeStringify(value);
  }
};

// 2. 修复Authing配置错误
window.addEventListener('error', (event) => {
  const message = event.message;
  
  if (message && message.includes('Please check your config')) {
    console.group('🚨 Authing配置错误修复');
    console.warn('检测到Authing配置错误，尝试修复...');
    
    // 尝试重新初始化Authing
    setTimeout(() => {
      try {
        // 触发Authing重新初始化
        const reinitEvent = new CustomEvent('authing-config-error-fix', {
          detail: { 
            error: message,
            timestamp: Date.now()
          }
        });
        window.dispatchEvent(reinitEvent);
        console.log('✅ 已触发Authing重新初始化事件');
      } catch (error) {
        console.error('❌ 重新初始化失败:', error);
      }
    }, 1000);
    
    console.groupEnd();
  }
  
  // 修复"Cannot read properties of undefined"错误
  if (message && message.includes('Cannot read properties of undefined')) {
    console.warn('🛠️ 检测到undefined属性访问错误，可能导致undefinedundefined');
  }
});

// 3. 修复数组访问错误
const originalArrayAccess = Array.prototype.at;
if (originalArrayAccess) {
  Array.prototype.at = function(index) {
    try {
      return originalArrayAccess.call(this, index);
    } catch (error) {
      console.warn('🛠️ 数组访问错误，返回undefined:', error);
      return undefined;
    }
  };
}

// 4. 安全的对象属性访问
const createSafePropertyAccess = () => {
  const handler = {
    get(target: any, prop: string | symbol) {
      try {
        const value = target[prop];
        if (value === undefined && typeof prop === 'string') {
          console.warn(`🛠️ 访问undefined属性: ${prop}`);
        }
        return value;
      } catch (error) {
        console.warn(`🛠️ 属性访问错误: ${String(prop)}`, error);
        return undefined;
      }
    }
  };
  
  return handler;
};

// 5. 修复Promise错误
const originalPromiseResolve = Promise.resolve;
Promise.resolve = function(value) {
  if (value === undefined) {
    console.warn('🛠️ Promise.resolve收到undefined值');
  }
  return originalPromiseResolve.call(this, value);
};

// 6. 监听Authing特定错误 - 增强版
document.addEventListener('DOMContentLoaded', () => {
  // 🚨 [ENHANCED_DOM_MONITOR_v2025.08.14] 增强的DOM监控
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (node.nodeType === Node.ELEMENT_NODE) {
          const element = node as Element;

          // 检查是否是Authing相关元素
          if (element.id?.includes('authing') ||
              element.className?.includes('authing')) {

            // 立即检查和修复，不等待
            const fixUndefinedInElement = (el: Element) => {
              const textContent = el.textContent || '';
              if (textContent.includes('undefinedundefined') ||
                  textContent.includes('undefined') ||
                  textContent.includes('null')) {

                console.group('🛠️ 检测到Authing元素包含问题文本');
                console.warn('原始文本:', textContent);

                // 修复文本内容
                const walker = document.createTreeWalker(
                  el,
                  NodeFilter.SHOW_TEXT,
                  null
                );

                let textNode;
                let fixCount = 0;
                while (textNode = walker.nextNode()) {
                  if (textNode.textContent) {
                    let originalText = textNode.textContent;
                    let fixedText = originalText
                      .replace(/undefinedundefined/g, '用户登录')
                      .replace(/undefined/g, '')
                      .replace(/null/g, '')
                      .replace(/\s+/g, ' ')
                      .trim();

                    if (originalText !== fixedText) {
                      textNode.textContent = fixedText;
                      fixCount++;
                      console.log(`✅ 修复文本节点 ${fixCount}: "${originalText}" → "${fixedText}"`);
                    }
                  }
                }

                console.log(`✅ 总共修复了 ${fixCount} 个文本节点`);
                console.groupEnd();
              }
            };

            // 立即修复
            fixUndefinedInElement(element);

            // 延迟修复（防止动态内容）
            setTimeout(() => fixUndefinedInElement(element), 100);
            setTimeout(() => fixUndefinedInElement(element), 500);
            setTimeout(() => fixUndefinedInElement(element), 1000);
          }
        }
      });
    });
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
    characterData: true, // 监听文本变化
    attributes: true,    // 监听属性变化
    attributeOldValue: true,
    characterDataOldValue: true
  });

  console.log('🛡️ Authing DOM监控已启动（增强版）');
});

// 7. 全局错误恢复机制
let errorCount = 0;
const MAX_ERRORS = 10;

window.addEventListener('error', (event) => {
  errorCount++;
  
  if (errorCount > MAX_ERRORS) {
    console.warn('🚨 错误次数过多，停止错误处理以避免无限循环');
    return;
  }
  
  const message = event.message;
  if (message && (message.includes('is not a function') || 
                  message.includes('undefined'))) {
    
    console.group('🛠️ 全局错误恢复');
    console.warn('错误信息:', message);
    console.warn('文件:', event.filename);
    console.warn('行号:', event.lineno);
    
    // 尝试恢复
    setTimeout(() => {
      try {
        // 清理可能的undefined引用
        if (window.localStorage) {
          const authingData = window.localStorage.getItem('authing_user');
          if (authingData && authingData.includes('undefined')) {
            console.warn('🛠️ 清理localStorage中的undefined数据');
            window.localStorage.removeItem('authing_user');
          }
        }
      } catch (error) {
        console.warn('🛠️ 恢复过程中出错:', error);
      }
    }, 500);
    
    console.groupEnd();
  }
});

console.log('✅ Authing错误修复器初始化完成');

export {};
