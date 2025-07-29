/**
 * 🔐 登录undefined拼接测试器
 * 专门测试登录流程中的undefined拼接问题
 */

(function() {
  console.log('🔐 登录undefined拼接测试器启动！');
  
  let loginDetectionCount = 0;
  const loginDetectedSources = [];
  
  // 1. 监控localStorage变化
  const originalSetItem = localStorage.setItem;
  localStorage.setItem = function(key, value) {
    if (key === 'authing_user' && value && value.includes('undefinedundefined')) {
      console.error('🚨 localStorage.setItem检测到undefinedundefined!');
      console.error('键:', key);
      console.error('值:', value);
      console.trace('调用栈:');
      
      loginDetectedSources.push({
        type: 'localStorage',
        key: key,
        value: value,
        timestamp: Date.now()
      });
    }
    return originalSetItem.call(this, key, value);
  };
  
  // 2. 监控JSON.stringify
  const originalStringify = JSON.stringify;
  JSON.stringify = function(value, replacer, space) {
    const result = originalStringify.call(this, value, replacer, space);
    if (result && result.includes('undefinedundefined')) {
      console.error('🚨 JSON.stringify检测到undefinedundefined!');
      console.error('输入值:', value);
      console.error('结果:', result);
      console.trace('调用栈:');
      
      loginDetectedSources.push({
        type: 'JSON.stringify',
        input: value,
        result: result,
        timestamp: Date.now()
      });
    }
    return result;
  };
  
  // 3. 监控用户状态变化
  let lastUserState = null;
  const checkUserState = () => {
    try {
      const userStr = localStorage.getItem('authing_user');
      if (userStr && userStr !== lastUserState) {
        console.log('👤 用户状态变化检测:', userStr);
        
        if (userStr.includes('undefinedundefined')) {
          console.error('🚨 用户状态包含undefinedundefined!');
          console.error('用户数据:', userStr);
          
          // 尝试解析用户数据
          try {
            const userData = JSON.parse(userStr);
            console.error('解析后的用户数据:', userData);
            
            // 检查每个字段
            Object.entries(userData).forEach(([key, value]) => {
              if (value === 'undefined' || String(value).includes('undefined')) {
                console.error(`🎯 字段 "${key}" 包含undefined:`, value);
              }
            });
          } catch (e) {
            console.error('用户数据解析失败:', e);
          }
        }
        
        lastUserState = userStr;
      }
    } catch (error) {
      console.error('检查用户状态失败:', error);
    }
  };
  
  // 定期检查用户状态
  setInterval(checkUserState, 1000);
  
  // 4. 监控React状态更新
  if (window.React) {
    const originalUseState = window.React.useState;
    window.React.useState = function(initialState) {
      const [state, setState] = originalUseState(initialState);
      
      const wrappedSetState = (newState) => {
        if (typeof newState === 'object' && newState && JSON.stringify(newState).includes('undefinedundefined')) {
          console.error('🚨 React setState检测到undefinedundefined!');
          console.error('新状态:', newState);
          console.trace('调用栈:');
        }
        return setState(newState);
      };
      
      return [state, wrappedSetState];
    };
  }
  
  // 5. 监控用户登录事件
  const originalAddEventListener = EventTarget.prototype.addEventListener;
  EventTarget.prototype.addEventListener = function(type, listener, options) {
    if (type === 'login' || type === 'user-login' || type === 'auth-success') {
      const wrappedListener = function(event) {
        console.log('🔐 检测到登录事件:', type, event);
        
        if (event.detail && JSON.stringify(event.detail).includes('undefinedundefined')) {
          console.error('🚨 登录事件数据包含undefinedundefined!');
          console.error('事件详情:', event.detail);
        }
        
        return listener.call(this, event);
      };
      
      return originalAddEventListener.call(this, type, wrappedListener, options);
    }
    
    return originalAddEventListener.call(this, type, listener, options);
  };
  
  // 6. 模拟登录测试
  const simulateLoginTest = () => {
    console.log('🧪 开始模拟登录测试...');
    
    // 测试各种可能的用户数据
    const testUserData = [
      {
        name: '正常用户',
        data: {
          id: 'user123',
          username: 'testuser',
          nickname: 'Test User',
          email: 'test@example.com'
        }
      },
      {
        name: '部分undefined用户',
        data: {
          id: 'user456',
          username: undefined,
          nickname: undefined,
          email: 'test2@example.com'
        }
      },
      {
        name: '全undefined用户',
        data: {
          id: 'user789',
          username: undefined,
          nickname: undefined,
          email: undefined,
          avatar: undefined
        }
      }
    ];
    
    testUserData.forEach((testUser, index) => {
      console.log(`\n🧪 测试用户 ${index + 1}: ${testUser.name}`);
      
      // 模拟登录处理
      try {
        // 模拟UnifiedAuthContext的handleAuthingLogin逻辑
        const safeUserInfo = Object.fromEntries(
          Object.entries(testUser.data || {}).filter(([_, value]) => value !== undefined && value !== null)
        );
        
        const processedUser = {
          id: testUser.data?.id || `user_${Date.now()}`,
          username: testUser.data?.username || testUser.data?.nickname || '用户',
          email: testUser.data?.email || '',
          nickname: testUser.data?.nickname || testUser.data?.username || '用户',
          ...safeUserInfo
        };
        
        console.log('处理后的用户数据:', processedUser);
        
        // 检查是否有undefined拼接
        const userStr = JSON.stringify(processedUser);
        if (userStr.includes('undefinedundefined')) {
          console.error('🚨 处理后的用户数据包含undefinedundefined!');
        } else {
          console.log('✅ 用户数据处理安全');
        }
        
      } catch (error) {
        console.error('模拟登录处理失败:', error);
      }
    });
  };
  
  // 7. 暴露调试接口
  window.__loginUndefinedTester = {
    getDetectedSources: () => loginDetectedSources,
    getCount: () => loginDetectedSources.length,
    simulateLogin: simulateLoginTest,
    checkCurrentUser: () => {
      const userStr = localStorage.getItem('authing_user');
      if (userStr) {
        console.log('当前用户数据:', userStr);
        const count = (userStr.match(/undefinedundefined/g) || []).length;
        console.log(`发现 ${count} 个undefinedundefined`);
        return count;
      } else {
        console.log('当前没有用户数据');
        return 0;
      }
    },
    clearUser: () => {
      localStorage.removeItem('authing_user');
      console.log('已清除用户数据');
    }
  };
  
  console.log('🔐 登录undefined拼接测试器已就绪！');
  console.log('💡 使用 window.__loginUndefinedTester.simulateLogin() 进行模拟测试');
  console.log('💡 使用 window.__loginUndefinedTester.checkCurrentUser() 检查当前用户');
  
  // 立即检查当前用户状态
  setTimeout(() => {
    window.__loginUndefinedTester.checkCurrentUser();
  }, 1000);
})();
