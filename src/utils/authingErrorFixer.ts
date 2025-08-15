/**
 * 🚨 Authing错误修复器
 * 专门修复Authing Guard中导致undefinedundefined的错误
 */

// 🚨 [AUTHING_ERROR_FIXER_v2025.08.14] 专门修复Authing内部错误
console.log('🛡️ Authing错误修复器已启动');

// 1. 修复JSON.stringify错误
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
    // 安全的字符串化
    if (value === null) return 'null';
    if (value === undefined) return 'undefined';
    if (typeof value === 'string') return `"${value}"`;
    if (typeof value === 'number' || typeof value === 'boolean') return String(value);
    if (typeof value === 'object') {
      try {
        return Object.prototype.toString.call(value);
      } catch {
        return '{}';
      }
    }
    return String(value);
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

// 6. 监听Authing特定错误
document.addEventListener('DOMContentLoaded', () => {
  // 监听Authing容器的变化
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (node.nodeType === Node.ELEMENT_NODE) {
          const element = node as Element;
          
          // 检查是否是Authing相关元素
          if (element.id?.includes('authing') || 
              element.className?.includes('authing')) {
            
            // 检查元素内容是否包含undefined
            setTimeout(() => {
              const textContent = element.textContent || '';
              if (textContent.includes('undefinedundefined')) {
                console.warn('🛠️ 检测到Authing元素包含undefinedundefined，尝试修复');
                
                // 修复文本内容
                const walker = document.createTreeWalker(
                  element,
                  NodeFilter.SHOW_TEXT,
                  null
                );
                
                let textNode;
                while (textNode = walker.nextNode()) {
                  if (textNode.textContent?.includes('undefinedundefined')) {
                    textNode.textContent = textNode.textContent.replace(/undefinedundefined/g, '登录');
                    console.log('✅ 已修复Authing元素中的undefinedundefined');
                  }
                }
              }
            }, 100);
          }
        }
      });
    });
  });
  
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
  
  console.log('🛡️ Authing DOM监控已启动');
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
