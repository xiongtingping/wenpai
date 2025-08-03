/**
 * 🚨 激进的 undefinedundefined 检测器
 * 用户报告问题仍然存在，需要更强力的检测
 */

function setupAggressiveUndefinedDetector() {
  // 🚨 DISABLED: 激进检测器已禁用，避免与其他修复器冲突
  if (import.meta.env.DEV) {
    console.log('🚨 激进的 undefinedundefined 检测器已启动');
  
  let detectionCount = 0;
  const MAX_DETECTIONS = 20;
  
  // 1. 拦截所有可能的字符串操作
  const originalStringConstructor = String;
  (window as any).String = function(...args: any[]) {
    const result = originalStringConstructor(...args);
    if (typeof result === 'string' && result.includes('undefinedundefined')) {
      if (detectionCount < MAX_DETECTIONS) {
        detectionCount++;
        console.group('🚨 String构造函数检测到 undefinedundefined');
        console.error('参数:', args);
        console.error('结果:', result);
        console.error('调用栈:');
        console.trace();
        console.groupEnd();
      }
    }
    return result;
  };
  
  // 保持原型链
  Object.setPrototypeOf((window as any).String, originalStringConstructor);
  (window as any).String.prototype = originalStringConstructor.prototype;
  
  // 2. 拦截模板字符串操作
  const originalStringConcat = String.prototype.concat;
  String.prototype.concat = function(...args: any[]) {
    const result = originalStringConcat.apply(this, args);
    if (result.includes('undefinedundefined')) {
      if (detectionCount < MAX_DETECTIONS) {
        detectionCount++;
        console.group('🚨 String.concat检测到 undefinedundefined');
        console.error('原始字符串:', this);
        console.error('拼接参数:', args);
        console.error('结果:', result);
        console.error('调用栈:');
        console.trace();
        console.groupEnd();
      }
    }
    return result;
  };
  
  // 3. 拦截 + 操作符
  const originalValueOf = String.prototype.valueOf;
  String.prototype.valueOf = function() {
    const result = originalValueOf.call(this);
    if (typeof result === 'string' && result.includes('undefinedundefined')) {
      if (detectionCount < MAX_DETECTIONS) {
        detectionCount++;
        console.group('🚨 String.valueOf检测到 undefinedundefined');
        console.error('字符串值:', result);
        console.error('调用栈:');
        console.trace();
        console.groupEnd();
      }
    }
    return result;
  };
  
  // 4. 拦截 toString 方法
  const originalToString = Object.prototype.toString;
  Object.prototype.toString = function() {
    const result = originalToString.call(this);
    if (typeof this === 'string' && this.includes('undefinedundefined')) {
      if (detectionCount < MAX_DETECTIONS) {
        detectionCount++;
        console.group('🚨 toString检测到 undefinedundefined');
        console.error('对象:', this);
        console.error('结果:', result);
        console.error('调用栈:');
        console.trace();
        console.groupEnd();
      }
    }
    return result;
  };
  
  // 5. 监控所有DOM变化
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
              if (detectionCount < MAX_DETECTIONS) {
                console.group('🚨 DOM文本节点检测到 undefinedundefined');
                console.error('文本内容:', text);
                console.error('父元素:', node.parentElement);
                console.error('父元素类名:', node.parentElement?.className);
                console.error('父元素ID:', node.parentElement?.id);
                // 查找React组件信息
                let element = node.parentElement;
                while (element) {
                  const fiberKey = Object.keys(element).find(key => key.startsWith('__reactFiber'));
                  if (fiberKey) {
                    const fiber = (element as any)[fiberKey];
                    console.error('React组件:', {
                      type: fiber.type,
                      elementType: fiber.elementType,
                      key: fiber.key,
                      props: fiber.memoizedProps
                    });
                    break;
                  }
                  element = element.parentElement;
                }
                console.error('调用栈:');
                console.trace();
                console.groupEnd();
                // 立即修复
                node.textContent = text.replace(/undefinedundefined/g, '用户');
                console.log('✅ 已自动修复该文本节点');
              }
            }
          }
          // 检查元素节点
          if (node.nodeType === Node.ELEMENT_NODE) {
            const element = node as Element;
            const text = element.textContent || '';
            if (text.includes('undefinedundefined')) {
              detectionCount++;
              console.group('🚨 DOM元素检测到 undefinedundefined');
              console.error('元素:', element);
              console.error('文本内容:', text);
              console.error('元素类名:', element.className);
              console.error('元素ID:', element.id);
              console.error('调用栈:');
              console.trace();
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
            console.group('🚨 DOM属性检测到 undefinedundefined');
            console.error('属性名:', attrName);
            console.error('属性值:', attrValue);
            console.error('元素:', element);
            console.error('调用栈:');
            console.trace();
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
  } else {
    document.addEventListener('DOMContentLoaded', () => {
      observer.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeOldValue: true,
        characterData: true,
        characterDataOldValue: true
      });
    });
  }
  
  // 6. 立即检查当前页面
  const checkCurrentPage = () => {
    if (detectionCount >= MAX_DETECTIONS) return;
    
    const bodyText = document.body?.textContent || '';
    if (bodyText.includes('undefinedundefined')) {
      detectionCount++;
      console.group('🚨 页面内容检测到 undefinedundefined');
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
      while ((node = walker.nextNode()) !== null) {
        problematicNodes.push({
          text: node.textContent,
          parent: node.parentElement,
          parentClass: node.parentElement?.className,
          parentId: node.parentElement?.id
        });
      }
      
      console.error('问题节点:', problematicNodes);
      console.error('调用栈:');
      console.trace();
      console.groupEnd();
    }
  };
  
  // 7. 定期检查
  const intervalId = setInterval(() => {
    if (detectionCount >= MAX_DETECTIONS) {
      clearInterval(intervalId);
      console.log('🛑 检测器已达到最大检测次数，停止监控');
      return;
    }
    checkCurrentPage();
  }, 1000);
  
  // 8. 页面加载完成后立即检查
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', checkCurrentPage);
  } else {
    setTimeout(checkCurrentPage, 100);
  }
  
  console.log('🔍 激进检测器设置完成，最多检测', MAX_DETECTIONS, '次');
  }
}

// 启动激进检测器
setupAggressiveUndefinedDetector();

export {};
