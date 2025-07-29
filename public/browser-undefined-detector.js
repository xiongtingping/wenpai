/**
 * 🚨 浏览器内undefined拼接实时检测器
 * 直接在浏览器中运行，捕获所有可能的undefined拼接
 */

(function() {
  console.log('🚫 浏览器内undefined拼接实时检测器已禁用，避免干扰Authing Guard');
  return; // 直接退出，不执行任何检测逻辑
  
  let detectionCount = 0;
  const detectedSources = [];
  
  // 1. 监控所有DOM变化
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      // 检查新增的文本节点
      mutation.addedNodes.forEach((node) => {
        if (node.nodeType === Node.TEXT_NODE) {
          if (node.textContent && node.textContent.includes('undefinedundefined')) {
            console.error('🚨 DOM变化检测到undefinedundefined!');
            console.error('文本节点:', node);
            console.error('内容:', node.textContent);
            console.error('父元素:', node.parentElement);
            console.trace('调用栈:');
            
            detectedSources.push({
              type: 'DOM文本节点',
              content: node.textContent,
              parent: node.parentElement?.tagName,
              timestamp: Date.now()
            });
          }
        }
        
        // 检查元素属性
        if (node.nodeType === Node.ELEMENT_NODE) {
          Array.from(node.attributes || []).forEach(attr => {
            if (attr.value && attr.value.includes('undefinedundefined')) {
              console.error('🚨 元素属性检测到undefinedundefined!');
              console.error('元素:', node);
              console.error('属性:', attr.name);
              console.error('值:', attr.value);
              console.trace('调用栈:');
            }
          });
          
          // 递归检查子元素的文本内容
          const walker = document.createTreeWalker(
            node,
            NodeFilter.SHOW_TEXT,
            null,
            false
          );
          
          let textNode;
          while (textNode = walker.nextNode()) {
            if (textNode.textContent && textNode.textContent.includes('undefinedundefined')) {
              console.error('🚨 子元素文本检测到undefinedundefined!');
              console.error('文本节点:', textNode);
              console.error('内容:', textNode.textContent);
              console.error('父元素:', textNode.parentElement);
              console.trace('调用栈:');
            }
          }
        }
      });
      
      // 检查属性变化
      if (mutation.type === 'attributes') {
        const value = mutation.target.getAttribute(mutation.attributeName);
        if (value && value.includes('undefinedundefined')) {
          console.error('🚨 属性变化检测到undefinedundefined!');
          console.error('元素:', mutation.target);
          console.error('属性:', mutation.attributeName);
          console.error('值:', value);
          console.trace('调用栈:');
        }
      }
    });
  });
  
  // 开始监控
  observer.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeOldValue: true,
    characterData: true,
    characterDataOldValue: true
  });
  
  // 2. 定期全页面扫描
  let scanCount = 0;
  const scanInterval = setInterval(() => {
    scanCount++;
    const allText = document.body.textContent || '';
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
        
        // 尝试找到React组件信息
        let reactElement = node.parentElement;
        while (reactElement) {
          const reactKey = Object.keys(reactElement).find(key => key.startsWith('__reactInternalInstance') || key.startsWith('_reactInternalFiber'));
          if (reactKey) {
            console.error('React组件信息:', reactElement[reactKey]);
            break;
          }
          reactElement = reactElement.parentElement;
        }
        
        console.error('---');
      }
      
      // 立即修复
      while (node = walker.nextNode()) {
        const originalText = node.textContent;
        const fixedText = originalText.replace(/undefinedundefined/g, '未设置');
        node.textContent = fixedText;
        console.warn(`🛠️ 自动修复: "${originalText}" -> "${fixedText}"`);
      }
    }
  }, 2000);
  
  // 3. 拦截console.log来捕获可能的调试信息
  const originalConsoleLog = console.log;
  console.log = function(...args) {
    args.forEach(arg => {
      if (typeof arg === 'string' && arg.includes('undefinedundefined')) {
        console.error('🚨 console.log检测到undefinedundefined!');
        console.error('参数:', arg);
        console.trace('调用栈:');
      }
    });
    return originalConsoleLog.apply(this, args);
  };
  
  // 4. 暴露调试接口
  window.__browserUndefinedDetector = {
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
      observer.disconnect();
      console.log('🛑 停止所有监控');
    },
    startScanning: () => {
      // 重新开始监控
      observer.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeOldValue: true,
        characterData: true,
        characterDataOldValue: true
      });
      console.log('🔍 重新开始监控');
    }
  };
  
  console.log('🚨 浏览器内undefined拼接实时检测器已就绪！');
  console.log('💡 使用 window.__browserUndefinedDetector.forceFullScan() 进行强制扫描');
  console.log('💡 使用 window.__browserUndefinedDetector.getDetectedSources() 查看检测结果');
  
  // 立即执行一次扫描
  setTimeout(() => {
    window.__browserUndefinedDetector.forceFullScan();
  }, 1000);
})();
