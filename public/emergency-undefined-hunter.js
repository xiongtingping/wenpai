/**
 * 🚨 紧急undefined拼接问题猎手
 * 最强力的实时检测和定位工具
 */

(function() {
  console.log('🚨🚨🚨 紧急undefined拼接问题猎手启动！');
  
  let detectionCount = 0;
  const detectedSources = [];
  
  // 1. 拦截所有可能的字符串操作
  const originalStringConcat = String.prototype.concat;
  String.prototype.concat = function(...args) {
    const result = originalStringConcat.apply(this, args);
    if (result.includes('undefinedundefined')) {
      console.error('🚨 String.concat发现undefinedundefined!');
      console.error('原始:', this);
      console.error('参数:', args);
      console.error('结果:', result);
      console.trace('完整调用栈:');
      detectedSources.push({
        type: 'String.concat',
        original: this,
        args: args,
        result: result,
        stack: new Error().stack
      });
    }
    return result;
  };
  
  // 2. 拦截String构造函数
  const originalString = String;
  window.String = function(value) {
    const result = originalString(value);
    if (result === 'undefinedundefined') {
      console.error('🚨 String()构造发现undefinedundefined!');
      console.error('输入值:', value);
      console.error('结果:', result);
      console.trace('完整调用栈:');
      detectedSources.push({
        type: 'String构造',
        input: value,
        result: result,
        stack: new Error().stack
      });
    }
    return result;
  };
  
  // 保持原型链
  window.String.prototype = originalString.prototype;
  Object.setPrototypeOf(window.String, originalString);
  
  // 3. 拦截模板字符串（通过重写toString）
  const originalToString = Object.prototype.toString;
  Object.prototype.toString = function() {
    const result = originalToString.call(this);
    if (result.includes('undefinedundefined')) {
      console.error('🚨 toString发现undefinedundefined!');
      console.error('对象:', this);
      console.error('结果:', result);
      console.trace('完整调用栈:');
    }
    return result;
  };
  
  // 4. 拦截所有DOM文本设置
  const originalTextContent = Object.getOwnPropertyDescriptor(Node.prototype, 'textContent');
  Object.defineProperty(Node.prototype, 'textContent', {
    set: function(value) {
      if (value && value.toString().includes('undefinedundefined')) {
        console.error('🚨 DOM textContent发现undefinedundefined!');
        console.error('元素:', this);
        console.error('标签:', this.tagName);
        console.error('类名:', this.className);
        console.error('ID:', this.id);
        console.error('设置值:', value);
        console.trace('完整调用栈:');
        
        // 找到父元素路径
        let path = [];
        let current = this;
        while (current && current.tagName) {
          let selector = current.tagName.toLowerCase();
          if (current.id) selector += '#' + current.id;
          if (current.className) selector += '.' + current.className.split(' ').join('.');
          path.unshift(selector);
          current = current.parentElement;
        }
        console.error('元素路径:', path.join(' > '));
        
        detectedSources.push({
          type: 'DOM textContent',
          element: this,
          path: path.join(' > '),
          value: value,
          stack: new Error().stack
        });
      }
      return originalTextContent.set.call(this, value);
    },
    get: originalTextContent.get
  });
  
  // 5. 拦截innerHTML设置
  const originalInnerHTML = Object.getOwnPropertyDescriptor(Element.prototype, 'innerHTML');
  Object.defineProperty(Element.prototype, 'innerHTML', {
    set: function(value) {
      if (value && value.toString().includes('undefinedundefined')) {
        console.error('🚨 innerHTML发现undefinedundefined!');
        console.error('元素:', this);
        console.error('设置值:', value);
        console.trace('完整调用栈:');
      }
      return originalInnerHTML.set.call(this, value);
    },
    get: originalInnerHTML.get
  });
  
  // 6. 拦截React渲染
  if (window.React) {
    const originalCreateElement = window.React.createElement;
    window.React.createElement = function(type, props, ...children) {
      // 检查props
      if (props) {
        Object.entries(props).forEach(([key, value]) => {
          if (typeof value === 'string' && value.includes('undefinedundefined')) {
            console.error('🚨 React props发现undefinedundefined!');
            console.error('组件:', type);
            console.error('属性:', key);
            console.error('值:', value);
            console.trace('完整调用栈:');
          }
        });
      }
      
      // 检查children
      children.forEach((child, index) => {
        if (typeof child === 'string' && child.includes('undefinedundefined')) {
          console.error('🚨 React children发现undefinedundefined!');
          console.error('组件:', type);
          console.error('子元素索引:', index);
          console.error('子元素值:', child);
          console.trace('完整调用栈:');
        }
      });
      
      return originalCreateElement.apply(this, arguments);
    };
  }
  
  // 7. 监控所有变量赋值（通过Proxy）
  const originalSetAttribute = Element.prototype.setAttribute;
  Element.prototype.setAttribute = function(name, value) {
    if (value && value.toString().includes('undefinedundefined')) {
      console.error('🚨 setAttribute发现undefinedundefined!');
      console.error('元素:', this);
      console.error('属性:', name);
      console.error('值:', value);
      console.trace('完整调用栈:');
    }
    return originalSetAttribute.call(this, name, value);
  };
  
  // 8. 定期全页面扫描
  let scanCount = 0;
  const scanInterval = setInterval(() => {
    scanCount++;
    const allText = document.body ? document.body.textContent || '' : '';
    const matches = allText.match(/undefinedundefined/g);
    
    if (matches && matches.length > 0) {
      console.error(`🚨🚨🚨 第${scanCount}次扫描发现 ${matches.length} 个undefinedundefined!`);
      
      // 找到所有包含undefinedundefined的元素
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
      let elementCount = 0;
      while (node = walker.nextNode()) {
        elementCount++;
        console.error(`🎯 问题元素 ${elementCount}:`);
        console.error('文本节点:', node);
        console.error('文本内容:', node.textContent);
        console.error('父元素:', node.parentElement);
        console.error('父元素标签:', node.parentElement?.tagName);
        console.error('父元素类名:', node.parentElement?.className);
        console.error('父元素ID:', node.parentElement?.id);
        
        // 获取完整路径
        let path = [];
        let current = node.parentElement;
        while (current && current.tagName) {
          let selector = current.tagName.toLowerCase();
          if (current.id) selector += '#' + current.id;
          if (current.className) selector += '.' + current.className.split(' ').join('.');
          path.unshift(selector);
          current = current.parentElement;
        }
        console.error('完整路径:', path.join(' > '));
        console.error('---');
      }
    }
  }, 1000);
  
  // 9. 暴露调试接口
  window.__emergencyUndefinedHunter = {
    getDetectedSources: () => detectedSources,
    getCount: () => detectedSources.length,
    forceFullScan: () => {
      console.log('🔍 执行强制全页面扫描...');
      const allText = document.body ? document.body.textContent || '' : '';
      const matches = allText.match(/undefinedundefined/g);
      console.log(`发现 ${matches ? matches.length : 0} 个undefinedundefined`);
      
      if (matches) {
        // 显示上下文
        let index = allText.indexOf('undefinedundefined');
        let contextCount = 0;
        while (index !== -1 && contextCount < 10) {
          const context = allText.substring(Math.max(0, index - 100), index + 150);
          console.log(`上下文 ${contextCount + 1}:`, context);
          index = allText.indexOf('undefinedundefined', index + 1);
          contextCount++;
        }
      }
      
      return matches ? matches.length : 0;
    },
    stopScanning: () => {
      clearInterval(scanInterval);
      console.log('🛑 停止定期扫描');
    }
  };
  
  console.log('🚨 紧急undefined拼接问题猎手已就绪！');
  console.log('💡 使用 window.__emergencyUndefinedHunter.forceFullScan() 进行强制扫描');
  console.log('💡 使用 window.__emergencyUndefinedHunter.getDetectedSources() 查看检测结果');
  
  // 立即执行一次扫描
  setTimeout(() => {
    window.__emergencyUndefinedHunter.forceFullScan();
  }, 2000);
})();
