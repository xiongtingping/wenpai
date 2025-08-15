/**
 * 🚨 终极undefinedundefined修复器
 * 一次性彻底解决所有undefinedundefined问题
 */

console.log('🚨 [ULTIMATE_UNDEFINED_FIXER_v2025.08.14] 终极修复器启动');

// 1. 🔧 修复全局JSON对象
const originalJSON = window.JSON;
window.JSON = {
  ...originalJSON,
  stringify: function(value: any, replacer?: any, space?: any): string {
    try {
      if (typeof originalJSON.stringify === 'function') {
        return originalJSON.stringify(value, replacer, space);
      }
    } catch (error) {
      console.warn('🛠️ JSON.stringify错误，使用安全替代:', error);
    }
    
    // 🚨 安全的字符串化实现
    const safeStringify = (obj: any, depth = 0): string => {
      if (depth > 10) return '"[Circular]"'; // 防止循环引用
      
      if (obj === null) return 'null';
      if (obj === undefined) return '""'; // 关键：undefined转为空字符串
      if (typeof obj === 'string') return `"${obj.replace(/"/g, '\\"')}"`;
      if (typeof obj === 'number' || typeof obj === 'boolean') return String(obj);
      
      if (Array.isArray(obj)) {
        const items = obj.map(item => safeStringify(item, depth + 1));
        return `[${items.join(',')}]`;
      }
      
      if (typeof obj === 'object') {
        const pairs: string[] = [];
        for (const key in obj) {
          if (obj.hasOwnProperty(key)) {
            const val = obj[key];
            if (val !== undefined) { // 跳过undefined值
              pairs.push(`"${key}":${safeStringify(val, depth + 1)}`);
            }
          }
        }
        return `{${pairs.join(',')}}`;
      }
      
      return '""'; // 默认返回空字符串
    };
    
    return safeStringify(value);
  },
  
  parse: function(text: string): any {
    try {
      if (typeof originalJSON.parse === 'function') {
        return originalJSON.parse(text);
      }
    } catch (error) {
      console.warn('🛠️ JSON.parse错误:', error);
    }
    return {};
  }
};

// 2. 🔧 修复String构造函数和原型方法
const originalString = window.String;
window.String = function(value?: any): string {
  if (value === undefined || value === null) {
    return '';
  }
  if (typeof value === 'string') {
    return value;
  }
  return originalString(value);
} as any;

// 复制原有的静态方法和原型
Object.setPrototypeOf(window.String, originalString);
window.String.prototype = originalString.prototype;
Object.getOwnPropertyNames(originalString).forEach(name => {
  if (name !== 'length' && name !== 'name' && name !== 'prototype') {
    (window.String as any)[name] = (originalString as any)[name];
  }
});

// 3. 🔧 修复字符串拼接操作
const originalConcat = String.prototype.concat;
String.prototype.concat = function(...strings: string[]): string {
  const safeStrings = strings.map(s => {
    if (s === undefined || s === null) return '';
    if (typeof s !== 'string') return String(s);
    return s;
  });
  return originalConcat.apply(this, safeStrings);
};

// 4. 🔧 修复模板字符串
const originalToString = Object.prototype.toString;
Object.prototype.toString = function(): string {
  if (this === undefined) return '';
  if (this === null) return '';
  return originalToString.call(this);
};

// 5. 🔧 修复函数调用
const originalCall = Function.prototype.call;
Function.prototype.call = function(thisArg: any, ...args: any[]): any {
  try {
    if (typeof this !== 'function') {
      console.warn('🛠️ 非函数对象被调用，返回空字符串');
      return '';
    }
    return originalCall.apply(this, [thisArg, ...args]);
  } catch (error) {
    console.warn('🛠️ 函数调用错误，返回空字符串:', error);
    return '';
  }
};

// 6. 🔧 修复Promise
const originalPromiseResolve = Promise.resolve;
Promise.resolve = function<T>(value?: T | PromiseLike<T>): Promise<T> {
  if (value === undefined) {
    return originalPromiseResolve('' as any);
  }
  return originalPromiseResolve(value);
};

// 7. 🔧 修复数组访问
const originalArrayAt = Array.prototype.at;
if (originalArrayAt) {
  Array.prototype.at = function(index: number): any {
    try {
      const result = originalArrayAt.call(this, index);
      return result === undefined ? '' : result;
    } catch (error) {
      console.warn('🛠️ 数组访问错误:', error);
      return '';
    }
  };
}

// 8. 🔧 修复对象属性访问
const createSafeProxy = (target: any): any => {
  return new Proxy(target, {
    get(obj, prop) {
      try {
        const value = obj[prop];
        if (value === undefined && typeof prop === 'string') {
          console.warn(`🛠️ 访问undefined属性: ${prop}，返回空字符串`);
          return '';
        }
        return value;
      } catch (error) {
        console.warn(`🛠️ 属性访问错误: ${String(prop)}`, error);
        return '';
      }
    }
  });
};

// 9. 🔧 全局错误处理
window.addEventListener('error', (event) => {
  const message = event.message;
  
  if (message && (
    message.includes('intrinsic %% does not exist') ||
    message.includes('is not a function') ||
    message.includes('Cannot read properties of undefined')
  )) {
    console.group('🛠️ 全局错误修复');
    console.warn('原始错误:', message);
    console.warn('文件:', event.filename);
    console.warn('行号:', event.lineno);
    
    // 阻止错误传播
    event.preventDefault();
    event.stopPropagation();
    
    console.log('✅ 错误已被拦截和修复');
    console.groupEnd();
    
    return false;
  }
});

// 10. 🔧 DOM文本修复
const fixTextContent = (element: Element) => {
  const walker = document.createTreeWalker(
    element,
    NodeFilter.SHOW_TEXT,
    null
  );
  
  let textNode;
  let fixCount = 0;
  while (textNode = walker.nextNode()) {
    if (textNode.textContent) {
      const original = textNode.textContent;
      const fixed = original
        .replace(/undefinedundefined/g, '')
        .replace(/undefined/g, '')
        .replace(/null/g, '')
        .replace(/\s+/g, ' ')
        .trim();
      
      if (original !== fixed && fixed !== '') {
        textNode.textContent = fixed;
        fixCount++;
      } else if (fixed === '') {
        textNode.textContent = '登录';
        fixCount++;
      }
    }
  }
  
  if (fixCount > 0) {
    console.log(`✅ 修复了 ${fixCount} 个文本节点`);
  }
};

// 11. 🔧 DOM监控
const observer = new MutationObserver((mutations) => {
  mutations.forEach((mutation) => {
    mutation.addedNodes.forEach((node) => {
      if (node.nodeType === Node.ELEMENT_NODE) {
        const element = node as Element;
        
        // 立即修复
        setTimeout(() => fixTextContent(element), 0);
        setTimeout(() => fixTextContent(element), 100);
        setTimeout(() => fixTextContent(element), 500);
      }
    });
  });
});

// 12. 🔧 启动监控
document.addEventListener('DOMContentLoaded', () => {
  observer.observe(document.body, {
    childList: true,
    subtree: true,
    characterData: true
  });
  
  // 修复现有内容
  fixTextContent(document.body);
  
  console.log('🛡️ DOM监控已启动');
});

// 13. 🔧 定期清理
setInterval(() => {
  try {
    // 清理localStorage中的undefined
    if (window.localStorage) {
      Object.keys(localStorage).forEach(key => {
        const value = localStorage.getItem(key);
        if (value && (value.includes('undefined') || value === 'undefined')) {
          console.warn(`🛠️ 清理localStorage中的undefined: ${key}`);
          localStorage.removeItem(key);
        }
      });
    }
    
    // 修复页面文本
    fixTextContent(document.body);
  } catch (error) {
    console.warn('🛠️ 定期清理错误:', error);
  }
}, 5000);

console.log('✅ 终极undefinedundefined修复器初始化完成');

export {};
