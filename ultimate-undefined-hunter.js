/**
 * 🚨 终极undefined拼接猎手
 * 最强力的实时检测器，捕获所有可能的undefined拼接源
 */

(function() {
  console.log('🚨 启动终极undefined拼接猎手...');
  
  let detectionCount = 0;
  const detectedSources = [];
  const MAX_DETECTIONS = 50;
  
  // 1. 拦截所有可能的字符串转换
  const originalString = String;
  const originalToString = Object.prototype.toString;
  const originalValueOf = Object.prototype.valueOf;
  
  // 重写String构造函数
  window.String = function(...args) {
    const result = originalString.apply(this, args);
    if (result.includes('undefined') && detectionCount < MAX_DETECTIONS) {
      detectionCount++;
      const detection = {
        type: 'String构造',
        args: args,
        result: result,
        stack: new Error().stack,
        timestamp: Date.now()
      };
      detectedSources.push(detection);
      
      console.group('🚨 String构造检测到undefined');
      console.warn('参数:', args);
      console.warn('结果:', result);
      console.trace('调用栈:');
      console.groupEnd();
    }
    return result;
  };
  
  // 重写toString
  Object.prototype.toString = function() {
    if (this === undefined && detectionCount < MAX_DETECTIONS) {
      detectionCount++;
      const detection = {
        type: 'toString调用',
        object: this,
        stack: new Error().stack,
        timestamp: Date.now()
      };
      detectedSources.push(detection);
      
      console.group('🚨 toString检测到undefined');
      console.warn('对象:', this);
      console.trace('调用栈:');
      console.groupEnd();
    }
    return originalToString.call(this);
  };
  
  // 重写valueOf
  Object.prototype.valueOf = function() {
    const result = originalValueOf.call(this);
    if (this === undefined && detectionCount < MAX_DETECTIONS) {
      detectionCount++;
      const detection = {
        type: 'valueOf调用',
        object: this,
        result: result,
        stack: new Error().stack,
        timestamp: Date.now()
      };
      detectedSources.push(detection);
      
      console.group('🚨 valueOf检测到undefined');
      console.warn('对象:', this);
      console.warn('结果:', result);
      console.trace('调用栈:');
      console.groupEnd();
    }
    return result;
  };
  
  // 2. 监控所有DOM操作
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === 'childList') {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.TEXT_NODE) {
            const text = node.textContent || '';
            if (text.includes('undefined') && detectionCount < MAX_DETECTIONS) {
              detectionCount++;
              const detection = {
                type: 'DOM文本节点',
                text: text,
                element: node.parentElement,
                elementPath: getElementPath(node.parentElement),
                stack: new Error().stack,
                timestamp: Date.now()
              };
              detectedSources.push(detection);
              
              console.group('🚨 DOM文本节点检测到undefined');
              console.warn('文本:', text);
              console.warn('元素:', node.parentElement);
              console.warn('路径:', getElementPath(node.parentElement));
              console.groupEnd();
            }
          }
        });
      }
      
      if (mutation.type === 'attributes') {
        const element = mutation.target;
        const attrValue = element.getAttribute(mutation.attributeName);
        if (attrValue && attrValue.includes('undefined') && detectionCount < MAX_DETECTIONS) {
          detectionCount++;
          const detection = {
            type: 'DOM属性变化',
            element: element,
            attributeName: mutation.attributeName,
            attributeValue: attrValue,
            elementPath: getElementPath(element),
            stack: new Error().stack,
            timestamp: Date.now()
          };
          detectedSources.push(detection);
          
          console.group('🚨 DOM属性变化检测到undefined');
          console.warn('元素:', element);
          console.warn('属性名:', mutation.attributeName);
          console.warn('属性值:', attrValue);
          console.warn('路径:', getElementPath(element));
          console.groupEnd();
        }
      }
    });
  });
  
  observer.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeOldValue: true,
    characterData: true,
    characterDataOldValue: true
  });
  
  // 3. 监控所有属性设置
  const originalSetAttribute = Element.prototype.setAttribute;
  Element.prototype.setAttribute = function(name, value) {
    if (value && value.toString().includes('undefined') && detectionCount < MAX_DETECTIONS) {
      detectionCount++;
      const detection = {
        type: '属性设置',
        element: this,
        attributeName: name,
        attributeValue: value,
        elementPath: getElementPath(this),
        stack: new Error().stack,
        timestamp: Date.now()
      };
      detectedSources.push(detection);
      
      console.group('🚨 属性设置检测到undefined');
      console.warn('元素:', this);
      console.warn('属性名:', name);
      console.warn('属性值:', value);
      console.warn('路径:', getElementPath(this));
      console.groupEnd();
    }
    return originalSetAttribute.call(this, name, value);
  };
  
  // 4. 监控innerHTML和textContent
  const originalInnerHTMLSetter = Object.getOwnPropertyDescriptor(Element.prototype, 'innerHTML').set;
  Object.defineProperty(Element.prototype, 'innerHTML', {
    set: function(value) {
      if (value && value.toString().includes('undefined') && detectionCount < MAX_DETECTIONS) {
        detectionCount++;
        const detection = {
          type: 'innerHTML设置',
          element: this,
          content: value,
          elementPath: getElementPath(this),
          stack: new Error().stack,
          timestamp: Date.now()
        };
        detectedSources.push(detection);
        
        console.group('🚨 innerHTML设置检测到undefined');
        console.warn('元素:', this);
        console.warn('内容:', value);
        console.warn('路径:', getElementPath(this));
        console.groupEnd();
      }
      return originalInnerHTMLSetter.call(this, value);
    },
    get: Object.getOwnPropertyDescriptor(Element.prototype, 'innerHTML').get
  });
  
  // 5. 监控console输出
  const originalConsole = {
    log: console.log,
    warn: console.warn,
    error: console.error,
    info: console.info
  };
  
  Object.entries(originalConsole).forEach(([method, original]) => {
    console[method] = function(...args) {
      args.forEach((arg, index) => {
        if (arg && arg.toString && arg.toString().includes('undefined') && detectionCount < MAX_DETECTIONS) {
          // 避免检测自己的输出
          const isOwnOutput = args.some(a => 
            typeof a === 'string' && 
            (a.includes('🚨') || a.includes('终极undefined拼接猎手'))
          );
          
          if (!isOwnOutput) {
            detectionCount++;
            const detection = {
              type: 'Console输出',
              method: method,
              argument: arg,
              argumentIndex: index,
              stack: new Error().stack,
              timestamp: Date.now()
            };
            detectedSources.push(detection);
            
            originalConsole.warn('🚨 Console输出检测到undefined:', arg);
          }
        }
      });
      return original.apply(console, args);
    };
  });
  
  // 6. 监控fetch和XHR
  const originalFetch = window.fetch;
  window.fetch = function(url, options) {
    if (url && url.toString().includes('undefined') && detectionCount < MAX_DETECTIONS) {
      detectionCount++;
      const detection = {
        type: 'Fetch请求',
        url: url,
        options: options,
        stack: new Error().stack,
        timestamp: Date.now()
      };
      detectedSources.push(detection);
      
      console.group('🚨 Fetch请求检测到undefined');
      console.warn('URL:', url);
      console.warn('选项:', options);
      console.trace('调用栈:');
      console.groupEnd();
    }
    return originalFetch.apply(this, arguments);
  };
  
  // 7. 监控localStorage和sessionStorage
  const originalSetItem = Storage.prototype.setItem;
  Storage.prototype.setItem = function(key, value) {
    if ((key && key.toString().includes('undefined')) || 
        (value && value.toString().includes('undefined'))) {
      if (detectionCount < MAX_DETECTIONS) {
        detectionCount++;
        const detection = {
          type: 'Storage操作',
          key: key,
          value: value,
          storageType: this === localStorage ? 'localStorage' : 'sessionStorage',
          stack: new Error().stack,
          timestamp: Date.now()
        };
        detectedSources.push(detection);
        
        console.group('🚨 Storage操作检测到undefined');
        console.warn('类型:', this === localStorage ? 'localStorage' : 'sessionStorage');
        console.warn('键:', key);
        console.warn('值:', value);
        console.trace('调用栈:');
        console.groupEnd();
      }
    }
    return originalSetItem.call(this, key, value);
  };
  
  // 8. 监控URL变化
  const originalPushState = history.pushState;
  const originalReplaceState = history.replaceState;
  
  history.pushState = function(state, title, url) {
    if (url && url.toString().includes('undefined') && detectionCount < MAX_DETECTIONS) {
      detectionCount++;
      const detection = {
        type: 'URL变化',
        method: 'pushState',
        url: url,
        state: state,
        title: title,
        stack: new Error().stack,
        timestamp: Date.now()
      };
      detectedSources.push(detection);
      
      console.group('🚨 URL变化检测到undefined');
      console.warn('方法:', 'pushState');
      console.warn('URL:', url);
      console.warn('状态:', state);
      console.trace('调用栈:');
      console.groupEnd();
    }
    return originalPushState.apply(this, arguments);
  };
  
  // 辅助函数
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
  
  // 定期扫描页面内容
  setInterval(() => {
    const allText = document.body.textContent || '';
    if (allText.includes('undefinedundefined')) {
      console.error('🚨 页面中发现 "undefinedundefined" 字符串！');
      console.log('页面内容片段:', allText.substring(allText.indexOf('undefinedundefined') - 50, allText.indexOf('undefinedundefined') + 100));
    }
  }, 1000);
  
  // 暴露检测结果
  window.__ultimateUndefinedHunter = {
    getCount: () => detectionCount,
    getSources: () => detectedSources,
    getReport: () => ({
      count: detectionCount,
      sources: detectedSources,
      timestamp: Date.now(),
      summary: detectedSources.reduce((acc, source) => {
        acc[source.type] = (acc[source.type] || 0) + 1;
        return acc;
      }, {})
    }),
    reset: () => {
      detectionCount = 0;
      detectedSources.length = 0;
    },
    stop: () => {
      observer.disconnect();
      console.log('🛡️ 终极undefined猎手已停止');
    },
    scanPage: () => {
      const allText = document.body.textContent || '';
      const matches = allText.match(/undefinedundefined/g);
      if (matches) {
        console.error(`🚨 页面中发现 ${matches.length} 个 "undefinedundefined" 字符串！`);
        return matches.length;
      }
      return 0;
    }
  };
  
  console.log('✅ 终极undefined拼接猎手已启动');
  console.log('💡 使用 window.__ultimateUndefinedHunter.getReport() 查看详细报告');
  console.log('🔍 使用 window.__ultimateUndefinedHunter.scanPage() 扫描页面');
})();
