/**
 * 🚨 运行时undefined拼接实时检测器
 * 专门用于捕获JavaScript执行过程中的"undefinedundefined"问题
 */

(function() {
  console.log('🚫 运行时undefined拼接实时检测器已禁用，避免干扰Authing Guard');
  return; // 直接退出，不执行任何检测逻辑
  
  let detectionCount = 0;
  const MAX_DETECTIONS = 50;
  const detectedSources = [];
  
  // 1. 拦截所有字符串操作
  const originalStringConcat = String.prototype.concat;
  String.prototype.concat = function(...args) {
    const result = originalStringConcat.apply(this, args);
    if (result.includes('undefinedundefined') && detectionCount < MAX_DETECTIONS) {
      detectionCount++;
      console.group('🚨 String.concat检测到undefinedundefined');
      console.warn('原始字符串:', this);
      console.warn('拼接参数:', args);
      console.warn('结果:', result);
      console.trace('调用栈:');
      console.groupEnd();
    }
    return result;
  };
  
  // 2. 拦截模板字符串（通过重写String构造函数）
  const originalString = String;
  window.String = function(value) {
    const result = originalString(value);
    if (result.includes('undefinedundefined') && detectionCount < MAX_DETECTIONS) {
      detectionCount++;
      console.group('🚨 String构造函数检测到undefinedundefined');
      console.warn('输入值:', value);
      console.warn('结果:', result);
      console.trace('调用栈:');
      console.groupEnd();

      // 🛠️ 自动修复：替换undefinedundefined为安全值
      return result.replace(/undefinedundefined/g, '未设置');
    }
    return result;
  };
  
  // 保持原型链
  window.String.prototype = originalString.prototype;
  Object.setPrototypeOf(window.String, originalString);
  
  // 3. 拦截逻辑或运算符（通过Proxy）
  function createUserProxy(user) {
    if (!user || typeof user !== 'object') return user;
    
    return new Proxy(user, {
      get(target, prop) {
        const value = target[prop];
        
        // 如果访问的是用户属性且值为undefined，记录
        if (['nickname', 'username', 'email', 'id', 'avatar', 'photo'].includes(prop) && value === undefined) {
          console.warn(`⚠️ 访问了undefined的用户属性: ${prop}`);
        }
        
        return value;
      }
    });
  }
  
  // 4. 监控React组件渲染
  if (window.React) {
    const originalCreateElement = window.React.createElement;
    window.React.createElement = function(type, props, ...children) {
      // 检查props中是否有undefined拼接
      if (props) {
        Object.keys(props).forEach(key => {
          const value = props[key];
          if (typeof value === 'string' && value.includes('undefinedundefined')) {
            console.group('🚨 React.createElement检测到undefinedundefined');
            console.warn('组件类型:', type);
            console.warn('Props:', props);
            console.warn('问题值:', value);
            console.trace('调用栈:');
            console.groupEnd();

            // 🛠️ 自动修复：替换props中的undefinedundefined
            props[key] = value.replace(/undefinedundefined/g, '未设置');
          }
        });
      }

      // 检查children中是否有undefined拼接
      const fixedChildren = children.map(child => {
        if (typeof child === 'string' && child.includes('undefinedundefined')) {
          console.group('🚨 React children检测到undefinedundefined');
          console.warn('组件类型:', type);
          console.warn('子元素:', child);
          console.trace('调用栈:');
          console.groupEnd();

          // 🛠️ 自动修复：替换children中的undefinedundefined
          return child.replace(/undefinedundefined/g, '未设置');
        }
        return child;
      });

      return originalCreateElement.call(this, type, props, ...fixedChildren);
    };
  }
  
  // 5. 监控DOM操作
  const originalSetTextContent = Object.getOwnPropertyDescriptor(Node.prototype, 'textContent').set;
  Object.defineProperty(Node.prototype, 'textContent', {
    set: function(value) {
      if (value && value.toString().includes('undefinedundefined')) {
        console.group('🚨 textContent设置检测到undefinedundefined');
        console.warn('元素:', this);
        console.warn('设置的值:', value);
        console.trace('调用栈:');
        console.groupEnd();

        // 🛠️ 自动修复：替换undefinedundefined为安全值
        const fixedValue = value.toString().replace(/undefinedundefined/g, '未设置');
        return originalSetTextContent.call(this, fixedValue);
      }
      return originalSetTextContent.call(this, value);
    },
    get: Object.getOwnPropertyDescriptor(Node.prototype, 'textContent').get
  });
  
  // 6. 监控用户状态变化
  let lastUser = null;
  function checkUserChange() {
    // 尝试从常见的全局状态中获取用户信息
    const possibleUsers = [
      window.__UNIFIED_AUTH_USER__,
      window.__USER__,
      localStorage.getItem('user'),
      localStorage.getItem('authing_user')
    ];
    
    possibleUsers.forEach((user, index) => {
      if (user && user !== lastUser) {
        console.log(`👤 检测到用户状态变化 (源${index + 1}):`, user);
        lastUser = user;
        
        // 如果是字符串，尝试解析
        if (typeof user === 'string') {
          try {
            const parsedUser = JSON.parse(user);
            console.log('解析后的用户信息:', parsedUser);
            
            // 检查解析后的用户信息是否有undefined值
            Object.entries(parsedUser).forEach(([key, value]) => {
              if (value === undefined || value === 'undefined') {
                console.warn(`⚠️ 用户属性 ${key} 为undefined`);
              }
            });
          } catch (e) {
            // 忽略解析错误
          }
        }
      }
    });
  }
  
  // 定期检查用户状态
  setInterval(checkUserChange, 1000);
  
  // 7. 监控网络请求响应
  const originalFetch = window.fetch;
  window.fetch = function(...args) {
    return originalFetch.apply(this, args).then(response => {
      const clonedResponse = response.clone();
      clonedResponse.text().then(text => {
        if (text.includes('undefinedundefined')) {
          console.group('🚨 网络请求响应检测到undefinedundefined');
          console.warn('请求URL:', args[0]);
          console.warn('响应内容片段:', text.substring(text.indexOf('undefinedundefined') - 50, text.indexOf('undefinedundefined') + 100));
          console.groupEnd();
        }
      }).catch(() => {
        // 忽略非文本响应
      });
      
      return response;
    });
  };
  
  // 8. 全局错误监听
  window.addEventListener('error', (event) => {
    if (event.message && event.message.includes('undefinedundefined')) {
      console.group('🚨 全局错误检测到undefinedundefined');
      console.warn('错误信息:', event.message);
      console.warn('文件:', event.filename);
      console.warn('行号:', event.lineno);
      console.groupEnd();
    }
  });
  
  // 9. 暴露检测接口
  window.__runtimeUndefinedDetector = {
    getCount: () => detectionCount,
    getSources: () => detectedSources,
    reset: () => {
      detectionCount = 0;
      detectedSources.length = 0;
    },
    forceCheck: () => {
      const allText = document.body.textContent || '';
      const matches = allText.match(/undefinedundefined/g);
      if (matches) {
        console.error(`🚨 强制检查发现 ${matches.length} 个 "undefinedundefined" 字符串！`);
        return matches.length;
      } else {
        console.log('✅ 强制检查未发现 "undefinedundefined" 字符串');
        return 0;
      }
    }
  };
  
  console.log('✅ 运行时undefined拼接实时检测器已启动');
  console.log('💡 使用 window.__runtimeUndefinedDetector.forceCheck() 进行强制检查');
  console.log('🔍 使用 window.__runtimeUndefinedDetector.getCount() 查看检测次数');
  
  // 启动后立即进行一次检查
  setTimeout(() => {
    window.__runtimeUndefinedDetector.forceCheck();
  }, 2000);
})();
