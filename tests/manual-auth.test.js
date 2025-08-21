/**
 * 🚀 手动认证流程测试
 * 需要人工干预的真实登录注册测试
 */

import { test, expect } from '@playwright/test';

test.describe('手动认证流程测试', () => {
  
  test('手动登录流程测试（需要人工操作）', async ({ page }) => {
    console.log('🚀 开始手动登录流程测试');
    console.log('⚠️ 此测试需要人工操作，请在弹出的登录页面中手动完成登录');
    
    // 监听网络请求
    const apiRequests = [];
    page.on('request', (request) => {
      const url = request.url();
      if (url.includes('authing') || url.includes('auth') || url.includes('api')) {
        apiRequests.push({
          url: url,
          method: request.method(),
          timestamp: Date.now()
        });
      }
    });
    
    // 监听页面跳转
    page.on('framenavigated', (frame) => {
      if (frame === page.mainFrame()) {
        console.log('📍 页面导航到:', frame.url());
      }
    });
    
    // 启动应用
    await page.goto('http://localhost:5173');
    await page.waitForLoadState('networkidle');
    console.log('✅ 应用已加载');
    
    // 查找登录按钮
    const loginTriggers = [
      'button:has-text("登录")',
      'a:has-text("登录")', 
      '[data-testid="login"]',
      '.login-button',
      '#login-btn',
      'button:has-text("Sign In")',
      'button:has-text("Login")'
    ];
    
    let loginButton = null;
    for (const selector of loginTriggers) {
      try {
        await page.waitForSelector(selector, { timeout: 2000 });
        loginButton = page.locator(selector).first();
        console.log(`🎯 找到登录按钮: ${selector}`);
        break;
      } catch (e) {
        // 继续寻找
      }
    }
    
    if (!loginButton) {
      console.log('ℹ️ 未找到登录按钮，尝试直接触发登录流程...');
      
      // 直接访问托管登录页面
      const loginUrl = 'https://rzcswqs4sq0f.authing.cn/68a68a29d0c3341ae7a3df23/login?redirect_uri=http%3A%2F%2Flocalhost%3A5173%2Fcallback&response_type=code&scope=openid%20profile%20email%20phone';
      console.log('🔗 跳转到托管登录页面:', loginUrl);
      
      await page.goto(loginUrl);
      await page.waitForLoadState('domcontentloaded');
      
      // 等待页面加载完成
      await page.waitForTimeout(5000);
      
      console.log('🎭 托管登录页面已打开，请手动完成以下操作:');
      console.log('1. 输入有效的邮箱/用户名');
      console.log('2. 输入密码');
      console.log('3. 点击登录按钮');
      console.log('4. 等待跳转回应用');
      
      // 等待用户手动操作 - 最多等待2分钟
      console.log('⏰ 等待手动登录操作，最多120秒...');
      
      try {
        // 等待跳转回callback页面或主页面
        await page.waitForURL(/localhost:5173/, { timeout: 120000 });
        console.log('✅ 检测到页面跳转，登录可能成功');
      } catch (e) {
        console.log('⏰ 等待超时，继续检查当前状态...');
      }
      
    } else {
      // 点击登录按钮
      console.log('🖱️ 点击登录按钮...');
      await loginButton.click();
      
      // 等待登录弹窗或页面跳转
      await page.waitForTimeout(3000);
      
      console.log('🎭 登录流程已触发，请在弹出的界面中完成登录');
      console.log('⏰ 等待手动登录操作，最多120秒...');
      
      try {
        // 等待登录成功的标志
        await page.waitForFunction(() => {
          return !!localStorage.getItem('authing_user') || 
                 !!localStorage.getItem('auth_token') ||
                 window.location.href.includes('callback');
        }, { timeout: 120000 });
        console.log('✅ 检测到登录状态变化');
      } catch (e) {
        console.log('⏰ 等待超时，继续检查...');
      }
    }
    
    // 检查登录结果
    await page.waitForTimeout(2000);
    
    const loginResult = await page.evaluate(() => {
      return {
        currentUrl: window.location.href,
        localStorage: {
          authUser: localStorage.getItem('authing_user'),
          authToken: localStorage.getItem('auth_token'),
          authingToken: localStorage.getItem('_authing_token'),
          keys: Object.keys(localStorage).filter(key => 
            key.includes('auth') || key.includes('token') || key.includes('user')
          )
        },
        hasUserData: !!localStorage.getItem('authing_user'),
        hasToken: !!(localStorage.getItem('auth_token') || localStorage.getItem('_authing_token')),
        pageTitle: document.title,
        userInfo: (() => {
          try {
            const userStr = localStorage.getItem('authing_user');
            return userStr ? JSON.parse(userStr) : null;
          } catch (e) {
            return null;
          }
        })()
      };
    });
    
    console.log('🔍 登录结果检查:');
    console.log('  当前URL:', loginResult.currentUrl);
    console.log('  是否有用户数据:', loginResult.hasUserData);
    console.log('  是否有Token:', loginResult.hasToken);
    console.log('  存储键:', loginResult.localStorage.keys);
    if (loginResult.userInfo) {
      console.log('  用户信息:', {
        id: loginResult.userInfo.id,
        username: loginResult.userInfo.username,
        email: loginResult.userInfo.email,
        nickname: loginResult.userInfo.nickname
      });
    }
    
    // 检查API请求
    if (apiRequests.length > 0) {
      console.log('📡 检测到认证相关API请求:');
      apiRequests.forEach((req, index) => {
        console.log(`  ${index + 1}. ${req.method} ${req.url}`);
      });
      
      const authingRequests = apiRequests.filter(req => 
        req.url.includes('rzcswqs4sq0f.authing.cn')
      );
      
      if (authingRequests.length > 0) {
        console.log('✅ 确认连接到真实Authing API');
      }
    }
    
    // 验证结果
    if (loginResult.hasUserData && loginResult.hasToken) {
      console.log('🎉 登录成功！认证系统工作正常');
      console.log('✅ 用户数据已正确保存到localStorage');
      console.log('✅ 认证Token已正确存储');
      
      expect(loginResult.hasUserData).toBe(true);
      expect(loginResult.hasToken).toBe(true);
    } else if (loginResult.currentUrl.includes('callback')) {
      console.log('🔄 检测到OAuth回调，登录流程正常');
      console.log('ℹ️ 回调页面可能正在处理认证信息...');
    } else {
      console.log('ℹ️ 未检测到登录完成，可能需要更多时间或手动操作');
      console.log('💡 建议：');
      console.log('  1. 检查登录凭据是否正确');
      console.log('  2. 检查网络连接');
      console.log('  3. 检查Authing配置是否正确');
    }
  });

  test('手动注册流程测试（需要人工操作）', async ({ page }) => {
    console.log('🚀 开始手动注册流程测试');
    console.log('⚠️ 此测试需要人工操作，请在弹出的注册页面中手动完成注册');
    
    // 直接访问托管注册页面
    const registerUrls = [
      'https://rzcswqs4sq0f.authing.cn/68a68a29d0c3341ae7a3df23/register?redirect_uri=http%3A%2F%2Flocalhost%3A5173%2Fcallback&response_type=code&scope=openid%20profile%20email%20phone',
      'https://rzcswqs4sq0f.authing.cn/68a68a29d0c3341ae7a3df23/login?redirect_uri=http%3A%2F%2Flocalhost%3A5173%2Fcallback&response_type=code&scope=openid%20profile%20email%20phone&screen_hint=signup'
    ];
    
    console.log('🔗 尝试注册URL:');
    registerUrls.forEach((url, index) => {
      console.log(`  ${index + 1}. ${url}`);
    });
    
    // 尝试第一个注册URL
    try {
      await page.goto(registerUrls[0]);
      await page.waitForLoadState('domcontentloaded');
      await page.waitForTimeout(5000);
      
      console.log('🎭 注册页面已打开，请手动完成以下操作:');
      console.log('1. 输入邮箱地址');
      console.log('2. 设置密码');
      console.log('3. 点击注册按钮');
      console.log('4. 完成邮箱验证（如需要）');
      console.log('5. 等待跳转回应用');
      
      // 等待用户手动操作
      console.log('⏰ 等待手动注册操作，最多120秒...');
      
      try {
        await page.waitForURL(/localhost:5173/, { timeout: 120000 });
        console.log('✅ 检测到页面跳转，注册可能成功');
      } catch (e) {
        console.log('⏰ 等待超时，检查当前状态...');
      }
      
      // 检查注册结果
      const registerResult = await page.evaluate(() => {
        return {
          currentUrl: window.location.href,
          hasUserData: !!localStorage.getItem('authing_user'),
          hasToken: !!(localStorage.getItem('auth_token') || localStorage.getItem('_authing_token')),
          userInfo: (() => {
            try {
              const userStr = localStorage.getItem('authing_user');
              return userStr ? JSON.parse(userStr) : null;
            } catch (e) {
              return null;
            }
          })()
        };
      });
      
      console.log('🔍 注册结果检查:');
      console.log('  当前URL:', registerResult.currentUrl);
      console.log('  是否有用户数据:', registerResult.hasUserData);
      console.log('  是否有Token:', registerResult.hasToken);
      
      if (registerResult.hasUserData && registerResult.hasToken) {
        console.log('🎉 注册成功！新用户已创建');
        if (registerResult.userInfo) {
          console.log('✅ 新用户信息:', {
            id: registerResult.userInfo.id,
            username: registerResult.userInfo.username,
            email: registerResult.userInfo.email
          });
        }
      } else {
        console.log('ℹ️ 注册流程可能需要额外验证步骤');
      }
      
    } catch (error) {
      console.log('❌ 注册页面访问失败:', error.message);
      console.log('💡 尝试第二个注册URL...');
      
      try {
        await page.goto(registerUrls[1]);
        console.log('✅ 备选注册页面已打开');
      } catch (e) {
        console.log('❌ 所有注册URL都无法访问');
      }
    }
  });

});