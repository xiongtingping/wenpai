#!/usr/bin/env node

/**
 * 测试浏览器中的环境变量状态
 */

const puppeteer = require('puppeteer');

async function testBrowserEnv() {
  console.log('🔍 测试浏览器中的环境变量状态...\n');
  
  const browser = await puppeteer.launch({ 
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  try {
    const page = await browser.newPage();
    
    // 监听控制台消息
    page.on('console', msg => {
      console.log(`📱 浏览器控制台: ${msg.text()}`);
    });
    
    // 导航到页面
    await page.goto('http://localhost:8888', { 
      waitUntil: 'networkidle0',
      timeout: 30000 
    });
    
    // 等待页面加载完成
    await page.waitForTimeout(3000);
    
    // 检查环境变量
    const envVars = await page.evaluate(() => {
      return {
        runtimeConfig: window.__RUNTIME_CONFIG__ || {},
        hasDetectEnvVars: typeof window.__detectEnvVars__ === 'function',
        hasValidateConfig: typeof window.__validateConfig__ === 'function'
      };
    });
    
    console.log('📋 环境变量状态:');
    console.log('  Runtime Config:', envVars.runtimeConfig);
    console.log('  __detectEnvVars__ 函数:', envVars.hasDetectEnvVars ? '✅ 存在' : '❌ 不存在');
    console.log('  __validateConfig__ 函数:', envVars.hasValidateConfig ? '✅ 存在' : '❌ 不存在');
    
    // 手动调用环境变量检测
    const detectedVars = await page.evaluate(() => {
      if (typeof window.__detectEnvVars__ === 'function') {
        return window.__detectEnvVars__();
      }
      return null;
    });
    
    if (detectedVars) {
      console.log('\n🔍 检测到的环境变量:');
      Object.entries(detectedVars).forEach(([key, value]) => {
        const maskedValue = value && value.length > 8 ? value.substring(0, 8) + '...' : value;
        console.log(`  ${key}: ${maskedValue}`);
      });
    }
    
  } catch (error) {
    console.error('❌ 测试失败:', error.message);
  } finally {
    await browser.close();
  }
}

// 检查是否安装了 puppeteer
try {
  require('puppeteer');
  testBrowserEnv();
} catch (error) {
  console.log('❌ 未安装 puppeteer，跳过浏览器测试');
  console.log('💡 请手动在浏览器中访问 http://localhost:8888 并查看控制台');
} 