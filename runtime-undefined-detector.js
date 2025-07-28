/**
 * 🔍 运行时undefined拼接实时检测器
 * 在浏览器控制台中运行此代码来实时监控undefined拼接问题
 */

(function() {
  console.log('🔍 启动运行时undefined拼接检测器...');
  
  let detectionCount = 0;
  const maxDetections = 20;
  const detectedSources = new Set();
  
  // 1. 监控所有字符串操作
  const originalString = String;
  window.String = function(...args) {
    const result = originalString.apply(this, args);
    if (result.includes('undefined') && detectionCount < maxDetections) {
      detectionCount++;
      console.group('🚨 String构造函数检测到undefined');
      console.warn('参数:', args);
      console.warn('结果:', result);
      console.trace('调用栈:');
      console.groupEnd();
    }
    return result;
  };
  
  // 2. 监控模板字符串
  const originalToString = Object.prototype.toString;
  Object.prototype.toString = function() {
    const result = originalToString.call(this);
    if (this === undefined && detectionCount < maxDetections) {
      detectionCount++;
      console.group('🚨 undefined被转换为字符串');
      console.warn('对象:', this);
      console.trace('调用栈:');
      console.groupEnd();
    }
    return result;
  };
  
  // 3. 监控DOM文本内容变化
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === 'childList') {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.TEXT_NODE) {
            const text = node.textContent || '';
            if (text.includes('undefined') && detectionCount < maxDetections) {
              detectionCount++;
              console.group('🚨 DOM文本节点包含undefined');
              console.warn('文本内容:', text);
              console.warn('父元素:', node.parentElement);
              console.warn('完整路径:', getElementPath(node.parentElement));
              console.groupEnd();
            }
          }
        });
      } else if (mutation.type === 'characterData') {
        const text = mutation.target.textContent || '';
        if (text.includes('undefined') && detectionCount < maxDetections) {
          detectionCount++;
          console.group('🚨 DOM文本内容变化包含undefined');
          console.warn('新内容:', text);
          console.warn('旧内容:', mutation.oldValue);
          console.warn('目标元素:', mutation.target.parentElement);
          console.groupEnd();
        }
      }
    });
  });
  
  // 开始观察DOM变化
  observer.observe(document.body, {
    childList: true,
    subtree: true,
    characterData: true,
    characterDataOldValue: true
  });
  
  // 4. 监控React渲染
  if (window.React && window.React.createElement) {
    const originalCreateElement = window.React.createElement;
    window.React.createElement = function(type, props, ...children) {
      // 检查props
      if (props) {
        Object.entries(props).forEach(([key, value]) => {
          if (typeof value === 'string' && value.includes('undefined') && detectionCount < maxDetections) {
            detectionCount++;
            console.group('🚨 React props包含undefined');
            console.warn('组件类型:', type);
            console.warn('属性名:', key);
            console.warn('属性值:', value);
            console.trace('调用栈:');
            console.groupEnd();
          }
        });
      }
      
      // 检查children
      children.forEach((child, index) => {
        if (typeof child === 'string' && child.includes('undefined') && detectionCount < maxDetections) {
          detectionCount++;
          console.group('🚨 React children包含undefined');
          console.warn('组件类型:', type);
          console.warn('子元素索引:', index);
          console.warn('子元素内容:', child);
          console.trace('调用栈:');
          console.groupEnd();
        }
      });
      
      return originalCreateElement.apply(this, [type, props, ...children]);
    };
  }
  
  // 5. 监控fetch和API调用
  const originalFetch = window.fetch;
  window.fetch = function(url, options) {
    if (typeof url === 'string' && url.includes('undefined') && detectionCount < maxDetections) {
      detectionCount++;
      console.group('🚨 Fetch URL包含undefined');
      console.warn('URL:', url);
      console.warn('选项:', options);
      console.trace('调用栈:');
      console.groupEnd();
    }
    return originalFetch.apply(this, arguments);
  };
  
  // 6. 监控localStorage和sessionStorage
  const originalSetItem = Storage.prototype.setItem;
  Storage.prototype.setItem = function(key, value) {
    if ((key && key.includes('undefined')) || (value && value.includes('undefined'))) {
      if (detectionCount < maxDetections) {
        detectionCount++;
        console.group('🚨 Storage操作包含undefined');
        console.warn('存储类型:', this === localStorage ? 'localStorage' : 'sessionStorage');
        console.warn('键:', key);
        console.warn('值:', value);
        console.trace('调用栈:');
        console.groupEnd();
      }
    }
    return originalSetItem.call(this, key, value);
  };
  
  // 7. 监控表单输入
  document.addEventListener('input', function(event) {
    const value = event.target.value;
    if (value && value.includes('undefined') && detectionCount < maxDetections) {
      detectionCount++;
      console.group('🚨 表单输入包含undefined');
      console.warn('输入元素:', event.target);
      console.warn('输入值:', value);
      console.warn('元素路径:', getElementPath(event.target));
      console.groupEnd();
    }
  });
  
  // 8. 监控URL变化
  const originalPushState = history.pushState;
  const originalReplaceState = history.replaceState;
  
  history.pushState = function(state, title, url) {
    if (url && url.includes('undefined') && detectionCount < maxDetections) {
      detectionCount++;
      console.group('🚨 URL变化包含undefined');
      console.warn('新URL:', url);
      console.warn('状态:', state);
      console.trace('调用栈:');
      console.groupEnd();
    }
    return originalPushState.apply(this, arguments);
  };
  
  history.replaceState = function(state, title, url) {
    if (url && url.includes('undefined') && detectionCount < maxDetections) {
      detectionCount++;
      console.group('🚨 URL替换包含undefined');
      console.warn('新URL:', url);
      console.warn('状态:', state);
      console.trace('调用栈:');
      console.groupEnd();
    }
    return originalReplaceState.apply(this, arguments);
  };
  
  // 辅助函数：获取元素路径
  function getElementPath(element) {
    if (!element) return 'unknown';
    
    const path = [];
    while (element && element.nodeType === Node.ELEMENT_NODE) {
      let selector = element.nodeName.toLowerCase();
      if (element.id) {
        selector += '#' + element.id;
      } else if (element.className) {
        selector += '.' + element.className.split(' ').join('.');
      }
      path.unshift(selector);
      element = element.parentElement;
    }
    return path.join(' > ');
  }
  
  // 定期报告
  setInterval(() => {
    if (detectionCount > 0) {
      console.log(`📊 undefined拼接检测报告: 共检测到 ${detectionCount} 次问题`);
    }
  }, 10000);
  
  // 暴露控制接口
  window.__undefinedRuntimeDetector = {
    getCount: () => detectionCount,
    reset: () => { detectionCount = 0; detectedSources.clear(); },
    stop: () => {
      observer.disconnect();
      console.log('🛡️ 运行时undefined检测器已停止');
    }
  };
  
  console.log('✅ 运行时undefined拼接检测器已启动');
  console.log('💡 使用 window.__undefinedRuntimeDetector 查看状态');
})();
