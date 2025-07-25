const puppeteer = require('puppeteer');

async function testAuthingFlow() {
  console.log('🚀 开始Authing登录流程自动化测试...');
  
  const browser = await puppeteer.launch({
    headless: false,
    devtools: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  
  // 监听网络请求
  page.on('request', request => {
    console.log(`📤 请求: ${request.method()} ${request.url()}`);
  });
  
  page.on('response', response => {
    console.log(`📥 响应: ${response.status()} ${response.url()}`);
    if (response.status() >= 400) {
      console.error(`❌ 错误响应: ${response.status()} ${response.url()}`);
    }
  });
  
  // 监听控制台日志
  page.on('console', msg => {
    console.log(`🔍 控制台: ${msg.type()} ${msg.text()}`);
  });
  
  try {
    // 1. 访问测试页面
    console.log('📍 访问测试页面...');
    await page.goto('http://localhost:3001', { waitUntil: 'networkidle0' });
    
    // 2. 等待页面加载完成
    await page.waitForSelector('h1', { timeout: 10000 });
    const title = await page.$eval('h1', el => el.textContent);
    console.log(`✅ 页面标题: ${title}`);
    
    // 3. 检查环境配置显示
    await page.waitForSelector('pre', { timeout: 5000 });
    const configText = await page.$eval('pre', el => el.textContent);
    console.log('🔧 环境配置:', configText);
    
    // 4. 检查登录按钮状态
    const loginButton = await page.$('button[onclick*="handleLogin"]');
    if (loginButton) {
      const isDisabled = await loginButton.evaluate(btn => btn.disabled);
      console.log(`🔐 登录按钮状态: ${isDisabled ? '禁用' : '可用'}`);
      
      if (!isDisabled) {
        // 5. 点击登录按钮
        console.log('🖱️ 点击登录按钮...');
        await loginButton.click();
        
        // 6. 等待重定向或弹窗
        await page.waitForTimeout(3000);
        
        // 检查是否重定向到Authing
        const currentUrl = page.url();
        console.log(`🌐 当前URL: ${currentUrl}`);
        
        if (currentUrl.includes('authing.cn')) {
          console.log('✅ 成功重定向到Authing登录页面');
        } else {
          console.log('⚠️ 未检测到重定向，可能使用弹窗模式');
        }
      }
    }
    
    // 7. 等待用户手动完成登录（在非无头模式下）
    console.log('⏳ 等待用户手动完成登录流程...');
    await page.waitForTimeout(30000); // 等待30秒
    
    // 8. 检查登录后的状态
    const userInfo = await page.$eval('.user-info', el => el.textContent).catch(() => '未找到用户信息');
    console.log('👤 用户信息:', userInfo);
    
  } catch (error) {
    console.error('❌ 测试过程中发生错误:', error.message);
  } finally {
    console.log('🏁 测试完成，保持浏览器打开以供检查');
    // 不关闭浏览器，让用户查看结果
  }
}

testAuthingFlow().catch(console.error); 