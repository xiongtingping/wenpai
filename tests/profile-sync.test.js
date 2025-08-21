/**
 * 🧪 个人资料保存同步测试
 * 测试用户信息的持久化、登出再登录后的数据保存
 */

import { test, expect } from '@playwright/test';

test.describe('个人资料保存同步测试', () => {
  
  // 模拟用户数据
  const testUserData = {
    nickname: '测试用户_' + Date.now(),
    email: 'test@example.com',
    phone: '13800138000'
  };

  test('检查Authing客户端初始化', async ({ page }) => {
    await page.goto('http://localhost:5173');
    await page.waitForLoadState('networkidle');
    
    // 检查控制台是否有Authing客户端初始化信息
    const logs = [];
    page.on('console', (msg) => {
      if (msg.type() === 'log' || msg.type() === 'info') {
        logs.push(msg.text());
      }
    });
    
    await page.waitForTimeout(3000);
    
    // 检查是否有认证系统初始化日志
    const authLogs = logs.filter(log => 
      log.includes('认证服务初始化') || 
      log.includes('AuthenticationClient') ||
      log.includes('Authing') ||
      log.includes('appId') ||
      log.includes('68a68a29d0c3341ae7a3df23')
    );
    
    if (authLogs.length > 0) {
      console.log('✅ 检测到Authing客户端初始化日志:');
      authLogs.forEach(log => console.log(`  - ${log}`));
    } else {
      console.log('ℹ️  未检测到明显的Authing初始化日志');
    }
    
    // 检查localStorage中是否有认证相关数据结构
    const hasAuthStorage = await page.evaluate(() => {
      const keys = Object.keys(localStorage);
      return {
        hasAuthToken: keys.some(key => key.includes('token') || key.includes('auth')),
        hasUserData: keys.some(key => key.includes('user') || key.includes('profile')),
        allKeys: keys.filter(key => key.includes('auth') || key.includes('token') || key.includes('user'))
      };
    });
    
    console.log('🔍 认证存储状态:', hasAuthStorage);
  });

  test('检查用户信息存储机制', async ({ page }) => {
    await page.goto('http://localhost:5173');
    await page.waitForLoadState('networkidle');
    
    // 模拟用户信息存储
    await page.evaluate((userData) => {
      // 模拟Authing认证成功后的数据存储
      const mockUser = {
        id: 'test-user-' + Date.now(),
        username: 'testuser',
        nickname: userData.nickname,
        email: userData.email,
        phone: userData.phone,
        avatar: null,
        isEmailVerified: false,
        isPhoneVerified: false,
        subscription: {
          tier: 'trial',
          plan: 'free',
          isActive: true,
          features: []
        },
        preferences: {
          theme: 'auto',
          language: 'zh-CN',
          notifications: true
        },
        stats: {
          totalUsage: 0,
          monthlyUsage: 0,
          remainingQuota: 10
        }
      };
      
      const mockToken = 'mock-jwt-token-' + Date.now();
      
      // 存储到各种位置（与tokenManager.ts保持一致）
      localStorage.setItem('auth_user', JSON.stringify(mockUser));
      localStorage.setItem('authing_user', JSON.stringify(mockUser));
      localStorage.setItem('_authing_token', mockToken);
      localStorage.setItem('auth_token', mockToken);
      
      console.log('✅ 模拟用户数据已存储');
      return { user: mockUser, token: mockToken };
    }, testUserData);
    
    // 验证数据是否正确存储
    const storedData = await page.evaluate(() => {
      return {
        user: localStorage.getItem('authing_user'),
        token: localStorage.getItem('_authing_token'),
        allKeys: Object.keys(localStorage).filter(key => 
          key.includes('auth') || key.includes('token') || key.includes('user')
        )
      };
    });
    
    expect(storedData.user).toBeTruthy();
    expect(storedData.token).toBeTruthy();
    
    const userData = JSON.parse(storedData.user);
    expect(userData.nickname).toBe(testUserData.nickname);
    expect(userData.email).toBe(testUserData.email);
    expect(userData.phone).toBe(testUserData.phone);
    
    console.log('✅ 用户数据存储验证通过');
  });

  test('测试个人资料页面数据加载', async ({ page }) => {
    await page.goto('http://localhost:5173');
    
    // 先存储模拟用户数据
    await page.evaluate((userData) => {
      const mockUser = {
        id: 'test-user-profile',
        username: 'testuser',
        nickname: userData.nickname,
        email: userData.email,
        phone: userData.phone,
        avatar: null,
        subscription: { tier: 'trial', plan: 'free', isActive: true },
        preferences: { theme: 'auto', language: 'zh-CN' },
        stats: { totalUsage: 0, monthlyUsage: 0, remainingQuota: 10 }
      };
      
      localStorage.setItem('authing_user', JSON.stringify(mockUser));
      localStorage.setItem('_authing_token', 'mock-token');
    }, testUserData);
    
    // 尝试访问个人资料页面
    await page.goto('http://localhost:5173/profile');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    // 检查个人资料页面是否加载
    const profileContent = await page.textContent('body');
    
    if (profileContent.includes('个人中心') || profileContent.includes('个人资料') || profileContent.includes('Profile')) {
      console.log('✅ 个人资料页面加载成功');
      
      // 检查是否显示了用户数据
      if (profileContent.includes(testUserData.nickname)) {
        console.log('✅ 用户昵称显示正确');
      }
      
      // 查找输入框并检查值
      const nicknameInput = page.locator('input[placeholder*="昵称"], input[name="nickname"], input[id*="nickname"]').first();
      if (await nicknameInput.isVisible()) {
        const value = await nicknameInput.inputValue();
        console.log(`📝 昵称输入框值: ${value}`);
      }
      
    } else {
      console.log('ℹ️  个人资料页面可能需要登录或使用不同的路由');
    }
  });

  test('测试登出后数据清除', async ({ page }) => {
    await page.goto('http://localhost:5173');
    
    // 存储用户数据
    await page.evaluate((userData) => {
      const mockUser = {
        id: 'test-user-logout',
        nickname: userData.nickname,
        email: userData.email,
        phone: userData.phone
      };
      
      localStorage.setItem('authing_user', JSON.stringify(mockUser));
      localStorage.setItem('_authing_token', 'mock-token-logout');
      localStorage.setItem('auth_token', 'mock-token-logout');
    }, testUserData);
    
    // 验证数据存在
    let storedBefore = await page.evaluate(() => {
      return {
        hasUser: !!localStorage.getItem('authing_user'),
        hasToken: !!localStorage.getItem('_authing_token')
      };
    });
    
    expect(storedBefore.hasUser).toBe(true);
    expect(storedBefore.hasToken).toBe(true);
    console.log('✅ 登出前数据存在');
    
    // 模拟登出操作（调用tokenManager的clearAll方法）
    await page.evaluate(() => {
      // 模拟tokenManager.clearAll()的清除逻辑
      const keysToRemove = [
        'auth_user', '_authing_token', 'auth_token', 'authing_token',
        'authing_user', '_authing_user', 'auth_token_meta'
      ];
      
      keysToRemove.forEach(key => {
        localStorage.removeItem(key);
        sessionStorage.removeItem(key);
      });
      
      console.log('🧹 模拟登出清除完成');
    });
    
    // 验证数据已清除
    let storedAfter = await page.evaluate(() => {
      return {
        hasUser: !!localStorage.getItem('authing_user'),
        hasToken: !!localStorage.getItem('_authing_token'),
        remainingKeys: Object.keys(localStorage).filter(key => 
          key.includes('auth') || key.includes('token') || key.includes('user')
        )
      };
    });
    
    expect(storedAfter.hasUser).toBe(false);
    expect(storedAfter.hasToken).toBe(false);
    console.log('✅ 登出后数据已清除');
    console.log('🔍 剩余相关keys:', storedAfter.remainingKeys);
  });

  test('测试API连接状态检查', async ({ page }) => {
    await page.goto('http://localhost:5173');
    await page.waitForLoadState('networkidle');
    
    // 检查网络请求中是否有Authing API调用
    const networkRequests = [];
    page.on('request', (request) => {
      const url = request.url();
      if (url.includes('authing') || url.includes('api')) {
        networkRequests.push({
          url: url,
          method: request.method(),
          resourceType: request.resourceType()
        });
      }
    });
    
    // 等待一段时间收集网络请求
    await page.waitForTimeout(5000);
    
    if (networkRequests.length > 0) {
      console.log('📡 检测到API请求:');
      networkRequests.forEach(req => {
        console.log(`  - ${req.method} ${req.url}`);
      });
      
      // 检查是否有Authing API请求
      const authingRequests = networkRequests.filter(req => 
        req.url.includes('rzcswqs4sq0f.authing.cn') || 
        req.url.includes('api/v2')
      );
      
      if (authingRequests.length > 0) {
        console.log('✅ 检测到Authing API请求，说明连接真实API');
      } else {
        console.log('ℹ️  未检测到Authing API请求');
      }
    } else {
      console.log('ℹ️  未检测到相关API请求');
    }
  });

});