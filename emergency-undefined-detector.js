/**
 * 🚨 紧急undefined拼接检测器
 * 实时监控所有可能的undefined拼接源
 */

(function() {
  console.log('🚨 启动紧急undefined拼接检测器...');
  
  let detectionCount = 0;
  const detectedSources = [];
  
  // 1. 拦截所有字符串操作
  const originalString = String;
  window.String = function(...args) {
    const result = originalString.apply(this, args);
    if (result === 'undefined' || result.includes('undefined')) {
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
  
  // 2. 拦截模板字符串
  const originalValueOf = Object.prototype.valueOf;
  Object.prototype.valueOf = function() {
    const result = originalValueOf.call(this);
    if (this === undefined) {
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
  
  // 3. 拦截toString调用
  const originalToString = Object.prototype.toString;
  Object.prototype.toString = function() {
    if (this === undefined) {
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
  
  // 4. 监控DOM文本变化
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === 'childList') {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.TEXT_NODE) {
            const text = node.textContent || '';
            if (text.includes('undefined')) {
              detectionCount++;
              const detection = {
                type: 'DOM文本',
                text: text,
                element: node.parentElement,
                elementPath: getElementPath(node.parentElement),
                stack: new Error().stack,
                timestamp: Date.now()
              };
              detectedSources.push(detection);
              
              console.group('🚨 DOM文本检测到undefined');
              console.warn('文本:', text);
              console.warn('元素:', node.parentElement);
              console.warn('路径:', getElementPath(node.parentElement));
              console.groupEnd();
            }
          }
        });
      } else if (mutation.type === 'characterData') {
        const text = mutation.target.textContent || '';
        if (text.includes('undefined')) {
          detectionCount++;
          const detection = {
            type: 'DOM文本变化',
            newText: text,
            oldText: mutation.oldValue,
            element: mutation.target.parentElement,
            stack: new Error().stack,
            timestamp: Date.now()
          };
          detectedSources.push(detection);
          
          console.group('🚨 DOM文本变化检测到undefined');
          console.warn('新文本:', text);
          console.warn('旧文本:', mutation.oldValue);
          console.warn('元素:', mutation.target.parentElement);
          console.groupEnd();
        }
      }
    });
  });
  
  observer.observe(document.body, {
    childList: true,
    subtree: true,
    characterData: true,
    characterDataOldValue: true
  });
  
  // 5. 监控属性设置
  const originalSetAttribute = Element.prototype.setAttribute;
  Element.prototype.setAttribute = function(name, value) {
    if (value && value.includes && value.includes('undefined')) {
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
  
  // 6. 监控innerHTML设置
  const originalInnerHTMLSetter = Object.getOwnPropertyDescriptor(Element.prototype, 'innerHTML').set;
  Object.defineProperty(Element.prototype, 'innerHTML', {
    set: function(value) {
      if (value && value.includes && value.includes('undefined')) {
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
  
  // 7. 监控textContent设置
  const originalTextContentSetter = Object.getOwnPropertyDescriptor(Node.prototype, 'textContent').set;
  Object.defineProperty(Node.prototype, 'textContent', {
    set: function(value) {
      if (value && value.includes && value.includes('undefined')) {
        detectionCount++;
        const detection = {
          type: 'textContent设置',
          node: this,
          content: value,
          elementPath: this.parentElement ? getElementPath(this.parentElement) : 'unknown',
          stack: new Error().stack,
          timestamp: Date.now()
        };
        detectedSources.push(detection);
        
        console.group('🚨 textContent设置检测到undefined');
        console.warn('节点:', this);
        console.warn('内容:', value);
        console.warn('路径:', this.parentElement ? getElementPath(this.parentElement) : 'unknown');
        console.groupEnd();
      }
      return originalTextContentSetter.call(this, value);
    },
    get: Object.getOwnPropertyDescriptor(Node.prototype, 'textContent').get
  });
  
  // 8. 监控localStorage操作
  const originalSetItem = Storage.prototype.setItem;
  Storage.prototype.setItem = function(key, value) {
    if ((key && key.includes('undefined')) || (value && value.includes('undefined'))) {
      detectionCount++;
      const detection = {
        type: 'localStorage设置',
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
    return originalSetItem.call(this, key, value);
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
  
  // 暴露检测结果
  window.__emergencyUndefinedDetector = {
    getCount: () => detectionCount,
    getSources: () => detectedSources,
    getReport: () => ({
      count: detectionCount,
      sources: detectedSources,
      timestamp: Date.now()
    }),
    reset: () => {
      detectionCount = 0;
      detectedSources.length = 0;
    },
    stop: () => {
      observer.disconnect();
      console.log('🛡️ 紧急undefined检测器已停止');
    }
  };
  
  console.log('✅ 紧急undefined拼接检测器已启动');
  console.log('💡 使用 window.__emergencyUndefinedDetector.getReport() 查看详细报告');
})();
