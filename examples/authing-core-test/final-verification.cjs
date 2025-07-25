const puppeteer = require('puppeteer');

console.log('🎯 Authing 最终验证 - 完整登录流程测试\n');

async function finalVerification() {
  console.log('🚀 启动浏览器进行完整验证...');
  
  const browser = await puppeteer.launch({
    headless: false,
    devtools: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  
  // 设置视口
  await page.setViewport({ width: 1280, height: 720 });
  
  // 监听所有网络请求
  const requests = [];
  const responses = [];
  
  page.on('request', request => {
    requests.push({
      url: request.url(),
      method: request.method(),
      timestamp: Date.now()
    });
  });
  
  page.on('response', response => {
    responses.push({
      url: response.url(),
      status: response.status(),
      timestamp: Date.now()
    });
    
    if (response.status() >= 400) {
      console.error(`❌ 错误响应: ${response.status()} ${response.url()}`);
    }
  });
  
  // 监听控制台日志
  const consoleLogs = [];
  page.on('console', msg => {
    consoleLogs.push({
      type: msg.type(),
      text: msg.text(),
      timestamp: Date.now()
    });
    
    if (msg.type() === 'error') {
      console.error(`🔍 控制台错误: ${msg.text()}`);
    }
  });
  
  try {
    console.log('📍 步骤1: 访问测试页面...');
    await page.goto('http://localhost:3001', { 
      waitUntil: 'networkidle0',
      timeout: 30000 
    });
    
    console.log('✅ 页面加载成功');
    
    // 等待页面完全加载
    await page.waitForSelector('h1', { timeout: 10000 });
    const title = await page.$eval('h1', el => el.textContent);
    console.log(`📋 页面标题: ${title}`);
    
    // 检查环境配置
    await page.waitForSelector('pre', { timeout: 5000 });
    const configText = await page.$eval('pre', el => el.textContent);
    console.log('🔧 环境配置已显示');
    
    // 查找登录按钮
    const buttons = await page.$$('button');
    console.log(`🔍 找到 ${buttons.length} 个按钮`);
    
    let loginButton = null;
    for (let i = 0; i < buttons.length; i++) {
      const text = await buttons[i].evaluate(btn => btn.textContent);
      console.log(`按钮 ${i + 1}: "${text}"`);
      if (text.includes('登录') || text.includes('Login')) {
        loginButton = buttons[i];
        break;
      }
    }
    
    if (!loginButton) {
      console.log('⚠️ 未找到登录按钮，使用第一个按钮');
      loginButton = buttons[0];
    }
    
    // 检查按钮状态
    const isDisabled = await loginButton.evaluate(btn => btn.disabled);
    console.log(`🔐 登录按钮状态: ${isDisabled ? '禁用' : '可用'}`);
    
    if (isDisabled) {
      console.log('❌ 登录按钮被禁用，无法继续测试');
      return;
    }
    
    console.log('🖱️ 步骤2: 点击登录按钮...');
    await loginButton.click();
    
    // 等待重定向或弹窗
    console.log('⏳ 等待重定向...');
    await page.waitForTimeout(5000);
    
    const currentUrl = page.url();
    console.log(`🌐 当前URL: ${currentUrl}`);
    
    if (currentUrl.includes('authing.cn')) {
      console.log('✅ 成功重定向到Authing登录页面');
      console.log('📝 请在Authing页面完成登录...');
      
      // 等待用户完成登录
      console.log('⏳ 等待用户完成登录流程...');
      await page.waitForTimeout(60000); // 等待60秒
      
      // 检查是否回到回调页面
      const finalUrl = page.url();
      console.log(`🌐 最终URL: ${finalUrl}`);
      
      if (finalUrl.includes('callback')) {
        console.log('✅ 成功回到回调页面');
        
        // 等待回调处理完成
        await page.waitForTimeout(5000);
        
        // 检查用户信息
        try {
          const userInfo = await page.$eval('.user-info', el => el.textContent);
          console.log('👤 用户信息:', userInfo);
          console.log('🎉 登录流程验证成功！');
        } catch (error) {
          console.log('⚠️ 未找到用户信息显示');
        }
      } else if (finalUrl.includes('localhost:3001')) {
        console.log('✅ 成功回到主页');
        
        // 检查用户信息
        try {
          const userInfo = await page.$eval('.user-info', el => el.textContent);
          console.log('👤 用户信息:', userInfo);
          console.log('🎉 登录流程验证成功！');
        } catch (error) {
          console.log('⚠️ 未找到用户信息显示');
        }
      } else {
        console.log('❌ 未按预期回到应用页面');
      }
    } else {
      console.log('⚠️ 未检测到重定向到Authing，可能使用弹窗模式');
      console.log('📝 请检查是否有弹窗出现...');
      
      // 等待可能的弹窗
      await page.waitForTimeout(10000);
    }
    
  } catch (error) {
    console.error('❌ 测试过程中发生错误:', error.message);
  } finally {
    console.log('\n📊 测试统计:');
    console.log(`网络请求: ${requests.length} 个`);
    console.log(`网络响应: ${responses.length} 个`);
    console.log(`控制台日志: ${consoleLogs.length} 条`);
    
    const errors = responses.filter(r => r.status >= 400);
    if (errors.length > 0) {
      console.log(`❌ 发现 ${errors.length} 个错误响应:`);
      errors.forEach(error => {
        console.log(`  - ${error.status}: ${error.url}`);
      });
    } else {
      console.log('✅ 无网络错误');
    }
    
    const consoleErrors = consoleLogs.filter(log => log.type === 'error');
    if (consoleErrors.length > 0) {
      console.log(`❌ 发现 ${consoleErrors.length} 个控制台错误`);
    } else {
      console.log('✅ 无控制台错误');
    }
    
    console.log('\n🏁 测试完成，保持浏览器打开以供检查');
    console.log('📖 详细测试指南请参考: manual-test-guide.md');
  }
}

finalVerification().catch(console.error); 