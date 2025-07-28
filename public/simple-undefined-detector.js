/**
 * 🚨 简化版undefined拼接实时检测器
 * 专门用于捕获"undefinedundefined"问题
 */

(function() {
  console.log('🚨 启动简化版undefined拼接检测器...');
  
  let detectionCount = 0;
  const detectedSources = [];
  
  // 1. 监控DOM文本变化
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === 'childList') {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.TEXT_NODE) {
            const text = node.textContent || '';
            if (text.includes('undefinedundefined')) {
              detectionCount++;
              const detection = {
                type: 'DOM文本节点',
                text: text,
                element: node.parentElement,
                elementPath: getElementPath(node.parentElement),
                timestamp: Date.now()
              };
              detectedSources.push(detection);
              
              console.group('🚨 发现 "undefinedundefined" 在DOM文本中');
              console.warn('文本内容:', text);
              console.warn('父元素:', node.parentElement);
              console.warn('元素路径:', getElementPath(node.parentElement));
              console.warn('完整文本:', text.substring(text.indexOf('undefinedundefined') - 20, text.indexOf('undefinedundefined') + 40));
              console.groupEnd();
            }
          }
        });
      }
      
      if (mutation.type === 'characterData') {
        const text = mutation.target.textContent || '';
        if (text.includes('undefinedundefined')) {
          detectionCount++;
          const detection = {
            type: 'DOM文本变化',
            newText: text,
            oldText: mutation.oldValue,
            element: mutation.target.parentElement,
            timestamp: Date.now()
          };
          detectedSources.push(detection);
          
          console.group('🚨 发现 "undefinedundefined" 在DOM文本变化中');
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
  
  // 2. 监控属性设置
  const originalSetAttribute = Element.prototype.setAttribute;
  Element.prototype.setAttribute = function(name, value) {
    if (value && value.toString().includes('undefinedundefined')) {
      detectionCount++;
      const detection = {
        type: '属性设置',
        element: this,
        attributeName: name,
        attributeValue: value,
        elementPath: getElementPath(this),
        timestamp: Date.now()
      };
      detectedSources.push(detection);
      
      console.group('🚨 发现 "undefinedundefined" 在属性设置中');
      console.warn('元素:', this);
      console.warn('属性名:', name);
      console.warn('属性值:', value);
      console.warn('路径:', getElementPath(this));
      console.groupEnd();
    }
    return originalSetAttribute.call(this, name, value);
  };
  
  // 3. 监控innerHTML设置
  const originalInnerHTMLSetter = Object.getOwnPropertyDescriptor(Element.prototype, 'innerHTML').set;
  Object.defineProperty(Element.prototype, 'innerHTML', {
    set: function(value) {
      if (value && value.toString().includes('undefinedundefined')) {
        detectionCount++;
        const detection = {
          type: 'innerHTML设置',
          element: this,
          content: value,
          elementPath: getElementPath(this),
          timestamp: Date.now()
        };
        detectedSources.push(detection);
        
        console.group('🚨 发现 "undefinedundefined" 在innerHTML设置中');
        console.warn('元素:', this);
        console.warn('内容:', value);
        console.warn('路径:', getElementPath(this));
        console.groupEnd();
      }
      return originalInnerHTMLSetter.call(this, value);
    },
    get: Object.getOwnPropertyDescriptor(Element.prototype, 'innerHTML').get
  });
  
  // 4. 定期扫描页面内容
  setInterval(() => {
    const allText = document.body.textContent || '';
    const matches = allText.match(/undefinedundefined/g);
    if (matches && matches.length > 0) {
      console.error(`🚨 页面中发现 ${matches.length} 个 "undefinedundefined" 字符串！`);
      
      // 找到具体位置
      let index = allText.indexOf('undefinedundefined');
      while (index !== -1) {
        const context = allText.substring(Math.max(0, index - 50), index + 100);
        console.warn('位置:', index, '上下文:', context);
        index = allText.indexOf('undefinedundefined', index + 1);
      }
      
      // 尝试找到包含该文本的元素
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
        console.warn('包含 "undefinedundefined" 的文本节点:', node);
        console.warn('父元素:', node.parentElement);
        console.warn('元素路径:', getElementPath(node.parentElement));
      }
    }
  }, 2000);
  
  // 5. 监控console输出
  const originalConsoleLog = console.log;
  const originalConsoleWarn = console.warn;
  const originalConsoleError = console.error;
  
  console.log = function(...args) {
    args.forEach(arg => {
      if (arg && arg.toString && arg.toString().includes('undefinedundefined')) {
        console.error('🚨 Console.log 输出包含 "undefinedundefined":', arg);
      }
    });
    return originalConsoleLog.apply(console, args);
  };
  
  console.warn = function(...args) {
    args.forEach(arg => {
      if (arg && arg.toString && arg.toString().includes('undefinedundefined')) {
        console.error('🚨 Console.warn 输出包含 "undefinedundefined":', arg);
      }
    });
    return originalConsoleWarn.apply(console, args);
  };
  
  console.error = function(...args) {
    args.forEach(arg => {
      if (arg && arg.toString && arg.toString().includes('undefinedundefined')) {
        originalConsoleError('🚨 Console.error 输出包含 "undefinedundefined":', arg);
      }
    });
    return originalConsoleError.apply(console, args);
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
  window.__simpleUndefinedDetector = {
    getCount: () => detectionCount,
    getSources: () => detectedSources,
    scanPage: () => {
      const allText = document.body.textContent || '';
      const matches = allText.match(/undefinedundefined/g);
      if (matches) {
        console.error(`🚨 页面扫描发现 ${matches.length} 个 "undefinedundefined" 字符串！`);
        return matches.length;
      } else {
        console.log('✅ 页面扫描未发现 "undefinedundefined" 字符串');
        return 0;
      }
    },
    reset: () => {
      detectionCount = 0;
      detectedSources.length = 0;
    },
    stop: () => {
      observer.disconnect();
      console.log('🛡️ 简化版undefined检测器已停止');
    }
  };
  
  console.log('✅ 简化版undefined拼接检测器已启动');
  console.log('💡 使用 window.__simpleUndefinedDetector.scanPage() 扫描页面');
  console.log('🔍 使用 window.__simpleUndefinedDetector.getCount() 查看检测次数');
  
  // 启动后立即扫描一次
  setTimeout(() => {
    window.__simpleUndefinedDetector.scanPage();
  }, 3000);
})();
