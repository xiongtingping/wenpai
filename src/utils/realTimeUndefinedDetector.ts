/**
 * 🚨 实时 undefinedundefined 检测器
 * 用户报告问题仍然存在，需要实时监控
 */

if (import.meta.env.DEV) {
  console.log('🚨 实时 undefinedundefined 检测器已启动');
  
  let detectionCount = 0;
  const MAX_DETECTIONS = 5;
  
  // 1. 监控所有DOM变化
  const observer = new MutationObserver((mutations) => {
    if (detectionCount >= MAX_DETECTIONS) return;
    
    mutations.forEach((mutation) => {
      // 检查新增的文本节点
      if (mutation.type === 'childList') {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.TEXT_NODE) {
            const text = node.textContent || '';
            if (text.includes('undefinedundefined')) {
              detectionCount++;
              console.group('🚨 DOM新增文本节点检测到 undefinedundefined');
              console.error('问题文本:', text);
              console.error('父元素:', node.parentElement);
              console.error('父元素类名:', node.parentElement?.className);
              console.error('父元素ID:', node.parentElement?.id);
              console.trace('调用栈:');
              console.groupEnd();
              
              // 立即修复
              if (node.parentElement) {
                node.textContent = text.replace(/undefinedundefined/g, '用户');
                console.log('✅ 已自动修复该文本节点');
              }
            }
          }
          
          // 检查元素节点的文本内容
          if (node.nodeType === Node.ELEMENT_NODE) {
            const element = node as Element;
            const text = element.textContent || '';
            if (text.includes('undefinedundefined')) {
              detectionCount++;
              console.group('🚨 DOM新增元素检测到 undefinedundefined');
              console.error('问题元素:', element);
              console.error('元素文本:', text);
              console.error('元素类名:', element.className);
              console.error('元素ID:', element.id);
              console.trace('调用栈:');
              console.groupEnd();
            }
          }
        });
      }
      
      // 检查属性变化
      if (mutation.type === 'attributes' && mutation.target) {
        const element = mutation.target as Element;
        const attrName = mutation.attributeName;
        if (attrName) {
          const attrValue = element.getAttribute(attrName) || '';
          if (attrValue.includes('undefinedundefined')) {
            detectionCount++;
            console.group('🚨 DOM属性变化检测到 undefinedundefined');
            console.error('属性名:', attrName);
            console.error('属性值:', attrValue);
            console.error('元素:', element);
            console.trace('调用栈:');
            console.groupEnd();
          }
        }
      }
    });
  });
  
  // 开始监控
  if (document.body) {
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeOldValue: true,
      characterData: true,
      characterDataOldValue: true
    });
    console.log('🔍 DOM变化监控已启动');
  } else {
    // 如果body还没准备好，等待
    document.addEventListener('DOMContentLoaded', () => {
      observer.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeOldValue: true,
        characterData: true,
        characterDataOldValue: true
      });
      console.log('🔍 DOM变化监控已启动（延迟）');
    });
  }
  
  // 2. 立即检查当前页面
  const checkCurrentPage = () => {
    if (detectionCount >= MAX_DETECTIONS) return;
    
    const bodyText = document.body?.textContent || '';
    if (bodyText.includes('undefinedundefined')) {
      detectionCount++;
      console.group('🚨 当前页面检测到 undefinedundefined');
      console.error('页面包含 undefinedundefined 文本');
      
      // 查找所有包含问题的文本节点
      const walker = document.createTreeWalker(
        document.body,
        NodeFilter.SHOW_TEXT,
        {
          acceptNode: (node) => {
            return node.textContent?.includes('undefinedundefined') 
              ? NodeFilter.FILTER_ACCEPT 
              : NodeFilter.FILTER_REJECT;
          }
        }
      );
      
      const problematicNodes = [];
      let node;
      while (node = walker.nextNode()) {
        problematicNodes.push({
          text: node.textContent,
          parent: node.parentElement,
          parentClass: node.parentElement?.className,
          parentId: node.parentElement?.id
        });
      }
      
      console.error('问题节点:', problematicNodes);
      console.trace('调用栈:');
      console.groupEnd();
      
      // 自动修复
      problematicNodes.forEach((nodeInfo, index) => {
        const textNode = walker.nextNode();
        if (textNode && textNode.textContent) {
          textNode.textContent = textNode.textContent.replace(/undefinedundefined/g, '用户');
          console.log(`✅ 已自动修复节点 ${index + 1}`);
        }
      });
    }
  };
  
  // 3. 定期检查
  const intervalId = setInterval(() => {
    if (detectionCount >= MAX_DETECTIONS) {
      clearInterval(intervalId);
      console.log('🛑 检测器已达到最大检测次数，停止监控');
      return;
    }
    checkCurrentPage();
  }, 2000);
  
  // 4. 页面加载完成后立即检查
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', checkCurrentPage);
  } else {
    setTimeout(checkCurrentPage, 100);
  }
  
  // 5. 监控React渲染
  if (window.React) {
    console.log('🔍 React环境检测到，启用React渲染监控');
    
    // 拦截React的渲染过程
    const originalCreateElement = window.React.createElement;
    window.React.createElement = function(type, props, ...children) {
      const result = originalCreateElement.apply(this, arguments);
      
      // 检查props中是否有undefinedundefined
      if (props) {
        Object.values(props).forEach(value => {
          if (typeof value === 'string' && value.includes('undefinedundefined')) {
            if (detectionCount < MAX_DETECTIONS) {
              detectionCount++;
              console.group('🚨 React createElement检测到 undefinedundefined');
              console.error('组件类型:', type);
              console.error('问题props:', props);
              console.error('问题值:', value);
              console.trace('调用栈:');
              console.groupEnd();
            }
          }
        });
      }
      
      // 检查children中是否有undefinedundefined
      children.forEach(child => {
        if (typeof child === 'string' && child.includes('undefinedundefined')) {
          if (detectionCount < MAX_DETECTIONS) {
            detectionCount++;
            console.group('🚨 React children检测到 undefinedundefined');
            console.error('组件类型:', type);
            console.error('问题child:', child);
            console.trace('调用栈:');
            console.groupEnd();
          }
        }
      });
      
      return result;
    };
  }
  
  console.log('🔍 实时检测器设置完成，最多检测', MAX_DETECTIONS, '次');
}

export {};
