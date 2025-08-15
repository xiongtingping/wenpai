/**
 * 🚨 紧急 undefined 拼接检测器
 * 专门用于定位 undefinedundefined 问题的源头
 */

// 🚨 [EMERGENCY_DETECTOR_ENABLED_v2025.08.14] 重新启用紧急检测器
if (true) {
  console.log('🚨 紧急 undefined 拼接检测器已启动');

  // 🚨 [CRITICAL_ERROR_HANDLER_v2025.08.14] 添加全局错误处理
  window.addEventListener('error', (event) => {
    const error = event.error;
    const message = event.message;

    if (message && (message.includes('is not a function') || message.includes('undefined'))) {
      console.group('🚨 检测到可能导致undefinedundefined的错误');
      console.error('错误信息:', message);
      console.error('错误对象:', error);
      console.error('文件:', event.filename);
      console.error('行号:', event.lineno);
      console.error('列号:', event.colno);
      console.trace('调用栈:');
      console.groupEnd();

      // 尝试修复：如果是函数调用错误，可能导致返回undefined
      if (message.includes('is not a function')) {
        console.warn('🛠️ 检测到函数调用错误，这可能导致undefined返回值');
      }
    }
  });

  // 🚨 [FUNCTION_CALL_SAFETY_v2025.08.14] 添加函数调用安全检查
  const originalFunction = Function.prototype.call;
  Function.prototype.call = function(thisArg, ...args) {
    try {
      if (typeof this !== 'function') {
        console.warn('🚨 检测到非函数对象被调用:', this);
        return undefined;
      }
      return originalFunction.apply(this, [thisArg, ...args]);
    } catch (error) {
      console.group('🚨 函数调用错误捕获');
      console.error('函数:', this);
      console.error('参数:', args);
      console.error('错误:', error);
      console.trace('调用栈:');
      console.groupEnd();
      return undefined;
    }
  };

  // 检测所有可能的字符串操作
  let detectionCount = 0;
  const MAX_DETECTIONS = 10;

  // 1. 拦截 String 构造函数
  const originalString = window.String;
  window.String = function(...args: any[]) {
    const result = originalString(...args);
    if (typeof result === 'string' && result.includes('undefinedundefined') && detectionCount < MAX_DETECTIONS) {
      detectionCount++;
      console.group('🚨 String构造函数检测到 undefinedundefined');
      console.warn('参数:', args);
      console.warn('结果:', result);
      console.trace('调用栈:');
      console.groupEnd();
    }
    return result;
  } as any;
  
  // 保持原型链
  Object.setPrototypeOf(window.String, originalString);
  // window.String.prototype = originalString.prototype; // 注释掉只读属性赋值
  
  // 2. 拦截模板字符串（通过重写 toString）
  const originalObjectToString = Object.prototype.toString;
  Object.prototype.toString = function() {
    const result = originalObjectToString.call(this);
    
    // 检查当前对象是否是字符串且包含问题
    if (typeof this === 'string' && this.includes('undefinedundefined') && detectionCount < MAX_DETECTIONS) {
      detectionCount++;
      console.group('🚨 toString检测到 undefinedundefined');
      console.warn('字符串值:', this);
      console.warn('类型:', typeof this);
      console.trace('调用栈:');
      console.groupEnd();
    }
    
    return result;
  };
  
  // 3. 拦截字符串拼接操作
  const originalStringConcat = String.prototype.concat;
  String.prototype.concat = function(...args: any[]) {
    const result = originalStringConcat.apply(this, args);
    if (result.includes('undefinedundefined') && detectionCount < MAX_DETECTIONS) {
      detectionCount++;
      console.group('🚨 String.concat检测到 undefinedundefined');
      console.warn('原始字符串:', this);
      console.warn('拼接参数:', args);
      console.warn('结果:', result);
      console.trace('调用栈:');
      console.groupEnd();
    }
    return result;
  };
  
  // 4. 拦截 + 操作符（通过 valueOf）
  const originalStringValueOf = String.prototype.valueOf;
  String.prototype.valueOf = function() {
    const result = originalStringValueOf.call(this);
    if (typeof result === 'string' && result.includes('undefinedundefined') && detectionCount < MAX_DETECTIONS) {
      detectionCount++;
      console.group('🚨 String.valueOf检测到 undefinedundefined');
      console.warn('字符串值:', result);
      console.trace('调用栈:');
      console.groupEnd();
    }
    return result;
  };
  
  // 5. 监控 DOM 更新
  if (typeof window !== 'undefined' && window.MutationObserver) {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === Node.TEXT_NODE && node.textContent?.includes('undefinedundefined')) {
              if (detectionCount < MAX_DETECTIONS) {
                detectionCount++;
                console.group('🚨 DOM文本节点检测到 undefinedundefined');
                console.warn('文本内容:', node.textContent);
                console.warn('父元素:', node.parentElement);
                console.trace('调用栈:');
                console.groupEnd();
              }
            }
          });
        }
        
        if (mutation.type === 'attributes' && mutation.target) {
          const element = mutation.target as Element;
          const attrValue = element.getAttribute(mutation.attributeName || '');
          if (attrValue?.includes('undefinedundefined')) {
            if (detectionCount < MAX_DETECTIONS) {
              detectionCount++;
              console.group('🚨 DOM属性检测到 undefinedundefined');
              console.warn('属性名:', mutation.attributeName);
              console.warn('属性值:', attrValue);
              console.warn('元素:', element);
              console.trace('调用栈:');
              console.groupEnd();
            }
          }
        }
      });
    });
    
    // 开始观察
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeOldValue: true
    });
    
    console.log('🔍 DOM变化监控已启动');
  }
  
  // 6. 定期检查页面内容
  const checkPageContent = () => {
    if (detectionCount >= MAX_DETECTIONS) return;
    
    const bodyText = document.body.textContent || '';
    if (bodyText.includes('undefinedundefined')) {
      detectionCount++;
      console.group('🚨 页面内容检测到 undefinedundefined');
      console.warn('页面文本包含 undefinedundefined');
      
      // 查找具体的元素
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
          parent: node.parentElement
        });
      }
      
      console.warn('问题节点:', problematicNodes);
      console.groupEnd();
    }
  };
  
  // 每秒检查一次
  setInterval(checkPageContent, 1000);
  
  console.log('🔍 紧急检测器设置完成，最多检测', MAX_DETECTIONS, '次');
}

export {};
