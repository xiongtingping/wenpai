/**
 * 🛡️ Authing Guard 强制修复器
 * 在Guard初始化前拦截所有可能的undefined拼接操作
 */

(function() {
  console.log('🚫 Authing Guard 强制修复器已禁用，避免干扰弹窗显示');
  return; // 直接退出，不执行任何修复逻辑
  
  const PROBLEM_STRING = 'undefined' + 'undefined';
  let fixCount = 0;
  
  // 1. 强制拦截String.concat
  const originalStringConcat = String.prototype.concat;
  String.prototype.concat = function(...args) {
    const result = originalStringConcat.apply(this, args);
    
    if (result === PROBLEM_STRING) {
      fixCount++;
      console.warn(`🛠️ String.concat修复 #${fixCount}: "${result}" -> "用户"`);
      return '用户';
    }
    
    if (result && result.includes && result.includes(PROBLEM_STRING)) {
      fixCount++;
      const fixedResult = result.replace(new RegExp(PROBLEM_STRING, 'g'), '用户');
      console.warn(`🛠️ String.concat修复 #${fixCount}: "${result}" -> "${fixedResult}"`);
      return fixedResult;
    }
    
    return result;
  };
  
  // 2. 强制拦截String构造函数
  const originalString = String;
  window.String = function(value) {
    const result = originalString(value);
    
    if (result === PROBLEM_STRING) {
      fixCount++;
      console.warn(`🛠️ String()修复 #${fixCount}: "${result}" -> "用户"`);
      return '用户';
    }
    
    if (result && result.includes && result.includes(PROBLEM_STRING)) {
      fixCount++;
      const fixedResult = result.replace(new RegExp(PROBLEM_STRING, 'g'), '用户');
      console.warn(`🛠️ String()修复 #${fixCount}: "${result}" -> "${fixedResult}"`);
      return fixedResult;
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
    
    if (result === PROBLEM_STRING) {
      fixCount++;
      console.warn(`🛠️ toString()修复 #${fixCount}: "${result}" -> "用户"`);
      return '用户';
    }
    
    if (result && result.includes && result.includes(PROBLEM_STRING)) {
      fixCount++;
      const fixedResult = result.replace(new RegExp(PROBLEM_STRING, 'g'), '用户');
      console.warn(`🛠️ toString()修复 #${fixCount}: "${result}" -> "${fixedResult}"`);
      return fixedResult;
    }
    
    return result;
  };
  
  // 4. 拦截所有DOM操作
  const originalInnerHTML = Object.getOwnPropertyDescriptor(Element.prototype, 'innerHTML');
  Object.defineProperty(Element.prototype, 'innerHTML', {
    set: function(value) {
      if (value && value.toString().includes(PROBLEM_STRING)) {
        fixCount++;
        const fixedValue = value.toString().replace(new RegExp(PROBLEM_STRING, 'g'), '用户');
        console.warn(`🛠️ innerHTML修复 #${fixCount}: "${value}" -> "${fixedValue}"`);
        return originalInnerHTML.set.call(this, fixedValue);
      }
      return originalInnerHTML.set.call(this, value);
    },
    get: originalInnerHTML.get
  });
  
  const originalTextContent = Object.getOwnPropertyDescriptor(Node.prototype, 'textContent');
  Object.defineProperty(Node.prototype, 'textContent', {
    set: function(value) {
      if (value && value.toString().includes(PROBLEM_STRING)) {
        fixCount++;
        const fixedValue = value.toString().replace(new RegExp(PROBLEM_STRING, 'g'), '用户');
        console.warn(`🛠️ textContent修复 #${fixCount}: "${value}" -> "${fixedValue}"`);
        return originalTextContent.set.call(this, fixedValue);
      }
      return originalTextContent.set.call(this, value);
    },
    get: originalTextContent.get
  });
  
  // 5. 拦截setAttribute
  const originalSetAttribute = Element.prototype.setAttribute;
  Element.prototype.setAttribute = function(name, value) {
    if (value && value.toString().includes(PROBLEM_STRING)) {
      fixCount++;
      const fixedValue = value.toString().replace(new RegExp(PROBLEM_STRING, 'g'), '用户');
      console.warn(`🛠️ setAttribute修复 #${fixCount}: ${name}="${value}" -> ${name}="${fixedValue}"`);
      return originalSetAttribute.call(this, name, fixedValue);
    }
    return originalSetAttribute.call(this, name, value);
  };
  
  // 6. 拦截React createElement（如果可用）
  if (window.React && window.React.createElement) {
    const originalCreateElement = window.React.createElement;
    window.React.createElement = function(type, props, ...children) {
      // 修复props中的问题字符串
      if (props) {
        Object.keys(props).forEach(key => {
          const value = props[key];
          if (value && typeof value === 'string' && value.includes(PROBLEM_STRING)) {
            fixCount++;
            const fixedValue = value.replace(new RegExp(PROBLEM_STRING, 'g'), '用户');
            console.warn(`🛠️ React props修复 #${fixCount}: ${key}="${value}" -> ${key}="${fixedValue}"`);
            props[key] = fixedValue;
          }
        });
      }
      
      // 修复children中的问题字符串
      const fixedChildren = children.map(child => {
        if (typeof child === 'string' && child.includes(PROBLEM_STRING)) {
          fixCount++;
          const fixedChild = child.replace(new RegExp(PROBLEM_STRING, 'g'), '用户');
          console.warn(`🛠️ React children修复 #${fixCount}: "${child}" -> "${fixedChild}"`);
          return fixedChild;
        }
        return child;
      });
      
      return originalCreateElement.call(this, type, props, ...fixedChildren);
    };
  }
  
  // 7. 定期强制扫描和修复
  let scanCount = 0;
  const forceFixInterval = setInterval(() => {
    scanCount++;
    const allText = document.body ? document.body.textContent || '' : '';
    
    if (allText.includes(PROBLEM_STRING)) {
      console.warn(`🛠️ 第${scanCount}次强制扫描发现问题，开始修复...`);
      
      // 找到所有包含问题字符串的文本节点并修复
      const walker = document.createTreeWalker(
        document.body,
        NodeFilter.SHOW_TEXT,
        {
          acceptNode: function(node) {
            return node.textContent.includes(PROBLEM_STRING) ? 
              NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
          }
        }
      );
      
      let node;
      let nodeFixCount = 0;
      while (node = walker.nextNode()) {
        const originalText = node.textContent;
        const fixedText = originalText.replace(new RegExp(PROBLEM_STRING, 'g'), '用户');
        node.textContent = fixedText;
        nodeFixCount++;
        fixCount++;
        console.warn(`🛠️ 强制修复文本节点 #${nodeFixCount}: "${originalText}" -> "${fixedText}"`);
      }
      
      if (nodeFixCount > 0) {
        console.warn(`✅ 强制扫描修复了 ${nodeFixCount} 个问题`);
      }
    }
  }, 1000);
  
  // 8. 暴露调试接口
  window.__authingGuardFix = {
    getFixCount: () => fixCount,
    forceCheck: () => {
      const allText = document.body ? document.body.textContent || '' : '';
      const matches = allText.match(new RegExp(PROBLEM_STRING, 'g'));
      const count = matches ? matches.length : 0;
      console.log(`🔍 强制检查发现 ${count} 个问题字符串`);
      return count;
    },
    stopScanning: () => {
      clearInterval(forceFixInterval);
      console.log('🛑 停止强制扫描');
    },
    getStats: () => ({
      totalFixes: fixCount,
      scanCount: scanCount,
      isActive: true
    })
  };
  
  console.log('🛡️ Authing Guard 强制修复器已就绪！');
  console.log('💡 使用 window.__authingGuardFix.forceCheck() 进行检查');
  console.log('💡 使用 window.__authingGuardFix.getStats() 查看统计');
  
  // 立即执行一次检查
  setTimeout(() => {
    window.__authingGuardFix.forceCheck();
  }, 500);
})();
