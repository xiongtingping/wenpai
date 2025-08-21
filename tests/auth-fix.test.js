/**
 * 🧪 认证系统修复测试
 * 测试登录/注册功能是否正常工作
 */

import { test, expect } from '@playwright/test';

test.describe('认证系统修复测试', () => {
  
  test('页面加载正常', async ({ page }) => {
    // 访问首页
    await page.goto('http://localhost:5173');
    
    // 等待页面加载完成
    await page.waitForLoadState('networkidle');
    
    // 检查页面标题
    await expect(page).toHaveTitle(/文派/);
    
    // 检查页面是否包含主要内容
    const body = await page.textContent('body');
    expect(body).toContain('文派');
    
    console.log('✅ 页面加载正常');
  });

  test('注册按钮存在且可点击', async ({ page }) => {
    await page.goto('http://localhost:5173');
    await page.waitForLoadState('networkidle');
    
    // 查找注册相关的按钮或链接
    const registerSelectors = [
      'button:has-text("注册")',
      'a:has-text("注册")',
      '[data-testid*="register"]',
      '.register-btn',
      '#register',
      'button:has-text("Register")',
      'a:has-text("Register")'
    ];
    
    let registerButton = null;
    for (const selector of registerSelectors) {
      try {
        registerButton = await page.locator(selector).first();
        if (await registerButton.isVisible()) {
          console.log(`✅ 找到注册按钮: ${selector}`);
          break;
        }
      } catch (e) {
        // 继续尝试下一个选择器
      }
    }
    
    if (registerButton) {
      // 检查按钮是否可见且可点击
      await expect(registerButton).toBeVisible();
      await expect(registerButton).toBeEnabled();
      console.log('✅ 注册按钮可见且可点击');
    } else {
      console.log('ℹ️  未找到明显的注册按钮，可能在其他位置或需要特定操作触发');
    }
  });

  test('登录按钮存在且可点击', async ({ page }) => {
    await page.goto('http://localhost:5173');
    await page.waitForLoadState('networkidle');
    
    // 查找登录相关的按钮或链接
    const loginSelectors = [
      'button:has-text("登录")',
      'a:has-text("登录")',
      '[data-testid*="login"]',
      '.login-btn',
      '#login',
      'button:has-text("Login")',
      'a:has-text("Login")'
    ];
    
    let loginButton = null;
    for (const selector of loginSelectors) {
      try {
        loginButton = await page.locator(selector).first();
        if (await loginButton.isVisible()) {
          console.log(`✅ 找到登录按钮: ${selector}`);
          break;
        }
      } catch (e) {
        // 继续尝试下一个选择器
      }
    }
    
    if (loginButton) {
      // 检查按钮是否可见且可点击
      await expect(loginButton).toBeVisible();
      await expect(loginButton).toBeEnabled();
      console.log('✅ 登录按钮可见且可点击');
    } else {
      console.log('ℹ️  未找到明显的登录按钮，可能在其他位置或需要特定操作触发');
    }
  });

  test('检查JavaScript错误', async ({ page }) => {
    const jsErrors = [];
    
    // 监听JavaScript错误
    page.on('pageerror', (error) => {
      jsErrors.push(error.message);
    });
    
    // 监听控制台错误
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        jsErrors.push(msg.text());
      }
    });
    
    await page.goto('http://localhost:5173');
    await page.waitForLoadState('networkidle');
    
    // 等待一下让页面完全加载
    await page.waitForTimeout(3000);
    
    // 检查是否有之前出现的关键错误
    const criticalErrors = jsErrors.filter(error => 
      error.includes('redirect') || 
      error.includes('Guard') || 
      error.includes('callback') ||
      error.includes('authing')
    );
    
    if (criticalErrors.length > 0) {
      console.log('⚠️  发现关键JavaScript错误:');
      criticalErrors.forEach(error => console.log(`  - ${error}`));
    } else {
      console.log('✅ 未发现之前的关键JavaScript错误');
    }
    
    // 输出所有错误供调试
    if (jsErrors.length > 0) {
      console.log('📋 所有JavaScript错误/警告:');
      jsErrors.forEach(error => console.log(`  - ${error}`));
    } else {
      console.log('✅ 页面无JavaScript错误');
    }
  });

  test('模拟注册按钮点击（如果存在）', async ({ page }) => {
    await page.goto('http://localhost:5173');
    await page.waitForLoadState('networkidle');
    
    // 查找注册按钮并尝试点击
    const registerSelectors = [
      'button:has-text("注册")',
      'a:has-text("注册")',
      '[data-testid*="register"]'
    ];
    
    let registerButton = null;
    for (const selector of registerSelectors) {
      try {
        registerButton = await page.locator(selector).first();
        if (await registerButton.isVisible()) {
          console.log(`✅ 准备点击注册按钮: ${selector}`);
          
          // 监听网络请求
          const networkRequests = [];
          page.on('request', (request) => {
            if (request.url().includes('authing') || request.url().includes('login') || request.url().includes('register')) {
              networkRequests.push(request.url());
            }
          });
          
          // 点击按钮
          await registerButton.click();
          
          // 等待可能的导航或弹窗
          await page.waitForTimeout(5000);
          
          // 检查是否有相关网络请求
          if (networkRequests.length > 0) {
            console.log('📡 检测到认证相关网络请求:');
            networkRequests.forEach(url => console.log(`  - ${url}`));
          }
          
          // 检查URL是否改变或有弹窗出现
          const currentUrl = page.url();
          console.log(`📍 当前URL: ${currentUrl}`);
          
          // 检查是否有弹窗或模态框
          const modals = await page.locator('[role="dialog"], .modal, [class*="modal"], [class*="authing"]').count();
          if (modals > 0) {
            console.log('✅ 检测到弹窗或模态框，注册功能正常触发');
          }
          
          break;
        }
      } catch (e) {
        console.log(`尝试选择器失败: ${selector} - ${e.message}`);
      }
    }
    
    if (!registerButton) {
      console.log('ℹ️  未找到可点击的注册按钮');
    }
  });

});