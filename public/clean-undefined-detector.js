/**
 * 🧹 干净的undefined拼接检测器
 * 避免递归检测问题，专注于真实的undefined拼接
 */

(function() {
  console.log('🚫 干净的undefined拼接检测器已禁用，避免干扰Authing Guard');
  return; // 直接退出，不执行任何检测逻辑
  
  let detectionCount = 0;
  const detectedSources = [];
  const PROBLEM_STRING = 'undefined' + 'undefined'; // 避免在代码中直接写出问题字符串
  
  // 1. 监控DOM文本内容设置
  const originalTextContent = Object.getOwnPropertyDescriptor(Node.prototype, 'textContent');
  Object.defineProperty(Node.prototype, 'textContent', {
    set: function(value) {
      if (value && value.toString().includes(PROBLEM_STRING)) {
        console.warn('🎯 DOM textContent发现问题字符串!');
        console.warn('元素:', this.tagName);
        console.warn('设置值:', value);
        
        detectedSources.push({
          type: 'DOM textContent',
          element: this.tagName,
          value: value,
          timestamp: Date.now()
        });
        
        // 自动修复
        const fixedValue = value.toString().replace(new RegExp(PROBLEM_STRING, 'g'), '未设置');
        return originalTextContent.set.call(this, fixedValue);
      }
      return originalTextContent.set.call(this, value);
    },
    get: originalTextContent.get
  });
  
  // 2. 监控innerHTML设置
  const originalInnerHTML = Object.getOwnPropertyDescriptor(Element.prototype, 'innerHTML');
  Object.defineProperty(Element.prototype, 'innerHTML', {
    set: function(value) {
      if (value && value.toString().includes(PROBLEM_STRING)) {
        console.warn('🎯 innerHTML发现问题字符串!');
        console.warn('元素:', this.tagName);
        
        detectedSources.push({
          type: 'innerHTML',
          element: this.tagName,
          value: value,
          timestamp: Date.now()
        });
        
        // 自动修复
        const fixedValue = value.toString().replace(new RegExp(PROBLEM_STRING, 'g'), '未设置');
        return originalInnerHTML.set.call(this, fixedValue);
      }
      return originalInnerHTML.set.call(this, value);
    },
    get: originalInnerHTML.get
  });
  
  // 3. 监控属性设置
  const originalSetAttribute = Element.prototype.setAttribute;
  Element.prototype.setAttribute = function(name, value) {
    if (value && value.toString().includes(PROBLEM_STRING)) {
      console.warn('🎯 setAttribute发现问题字符串!');
      console.warn('元素:', this.tagName);
      console.warn('属性:', name);
      console.warn('值:', value);
      
      detectedSources.push({
        type: 'setAttribute',
        element: this.tagName,
        attribute: name,
        value: value,
        timestamp: Date.now()
      });
      
      // 自动修复
      const fixedValue = value.toString().replace(new RegExp(PROBLEM_STRING, 'g'), '未设置');
      return originalSetAttribute.call(this, name, fixedValue);
    }
    return originalSetAttribute.call(this, name, value);
  };
  
  // 4. 监控localStorage设置
  const originalLocalStorageSetItem = localStorage.setItem;
  localStorage.setItem = function(key, value) {
    if (value && value.toString().includes(PROBLEM_STRING)) {
      console.warn('🎯 localStorage.setItem发现问题字符串!');
      console.warn('键:', key);
      console.warn('值:', value);
      
      detectedSources.push({
        type: 'localStorage',
        key: key,
        value: value,
        timestamp: Date.now()
      });
      
      // 自动修复
      const fixedValue = value.toString().replace(new RegExp(PROBLEM_STRING, 'g'), '未设置');
      return originalLocalStorageSetItem.call(this, key, fixedValue);
    }
    return originalLocalStorageSetItem.call(this, key, value);
  };
  
  // 5. 定期页面扫描
  let scanCount = 0;
  const scanInterval = setInterval(() => {
    scanCount++;
    const allText = document.body ? document.body.textContent || '' : '';
    const matches = allText.match(new RegExp(PROBLEM_STRING, 'g'));
    
    if (matches && matches.length > 0) {
      console.warn(`🎯 第${scanCount}次扫描发现 ${matches.length} 个问题字符串!`);
      
      // 找到所有包含问题字符串的元素并修复
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
      let fixedCount = 0;
      while (node = walker.nextNode()) {
        const originalText = node.textContent;
        const fixedText = originalText.replace(new RegExp(PROBLEM_STRING, 'g'), '未设置');
        node.textContent = fixedText;
        fixedCount++;
        
        console.warn(`🛠️ 自动修复 ${fixedCount}: "${originalText}" -> "${fixedText}"`);
      }
      
      if (fixedCount > 0) {
        console.warn(`✅ 定期扫描修复了 ${fixedCount} 个问题`);
      }
    }
  }, 3000);
  
  // 6. 暴露调试接口
  window.__cleanUndefinedDetector = {
    getDetectedSources: () => detectedSources,
    getCount: () => detectedSources.length,
    forceFullScan: () => {
      console.log('🔍 执行强制全页面扫描...');
      const allText = document.body ? document.body.textContent || '' : '';
      const matches = allText.match(new RegExp(PROBLEM_STRING, 'g'));
      const count = matches ? matches.length : 0;
      console.log(`发现 ${count} 个问题字符串`);
      
      if (count > 0) {
        // 显示上下文
        let index = allText.indexOf(PROBLEM_STRING);
        let contextCount = 0;
        while (index !== -1 && contextCount < 5) {
          const context = allText.substring(Math.max(0, index - 50), index + 100);
          console.log(`上下文 ${contextCount + 1}:`, context);
          index = allText.indexOf(PROBLEM_STRING, index + 1);
          contextCount++;
        }
      }
      
      return count;
    },
    stopScanning: () => {
      clearInterval(scanInterval);
      console.log('🛑 停止定期扫描');
    },
    getProblemString: () => PROBLEM_STRING,
    getStats: () => ({
      totalDetections: detectedSources.length,
      domTextContent: detectedSources.filter(s => s.type === 'DOM textContent').length,
      innerHTML: detectedSources.filter(s => s.type === 'innerHTML').length,
      setAttribute: detectedSources.filter(s => s.type === 'setAttribute').length,
      localStorage: detectedSources.filter(s => s.type === 'localStorage').length
    })
  };
  
  console.log('🧹 干净的undefined拼接检测器已就绪！');
  console.log('💡 使用 window.__cleanUndefinedDetector.forceFullScan() 进行强制扫描');
  console.log('💡 使用 window.__cleanUndefinedDetector.getStats() 查看统计信息');
  
  // 立即执行一次扫描
  setTimeout(() => {
    window.__cleanUndefinedDetector.forceFullScan();
  }, 2000);
})();
