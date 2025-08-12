/**
 * 触发限时优惠测试脚本
 * 模拟用户登录并启动限时优惠计时
 */

console.log('🔥 开始触发限时优惠测试...');

// 模拟用户ID
const TEST_USER_ID = 'test_user_123';

function triggerPromo() {
  console.log('\n=== 🎯 触发限时优惠 ===');
  
  // 1. 设置用户访问支付中心的时间（触发优惠计时）
  const accessTimeKey = `payment_center_access_time_${TEST_USER_ID}`;
  const now = Date.now();
  localStorage.setItem(accessTimeKey, now.toString());
  console.log(`✅ 设置支付中心访问时间: ${new Date(now).toLocaleString()}`);
  
  // 2. 验证优惠状态
  const accessTime = localStorage.getItem(accessTimeKey);
  const timeDiff = Date.now() - parseInt(accessTime);
  const isInPromo = timeDiff < (30 * 60 * 1000); // 30分钟
  const remainingTime = Math.max(0, (30 * 60 * 1000) - timeDiff);
  
  console.log(`📊 优惠状态:`);
  console.log(`   访问时间: ${new Date(parseInt(accessTime)).toLocaleString()}`);
  console.log(`   时间差: ${Math.floor(timeDiff / 1000)}秒`);
  console.log(`   是否在优惠期: ${isInPromo ? '✅ 是' : '❌ 否'}`);
  console.log(`   剩余时间: ${formatTime(remainingTime)}`);
  
  return { isInPromo, remainingTime, accessTime };
}

function formatTime(ms) {
  if (ms <= 0) return '已结束';
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

function checkPromoElements() {
  console.log('\n=== 🔍 检查页面优惠元素 ===');
  
  // 检查限时优惠相关元素
  const promoElements = {
    'promo-banner': document.querySelectorAll('.promo-banner'),
    'promo-countdown': document.querySelectorAll('.promo-countdown'),
    'promo-countdown-time': document.querySelectorAll('.promo-countdown-time')
  };
  
  Object.entries(promoElements).forEach(([className, elements]) => {
    console.log(`📦 .${className}: 找到 ${elements.length} 个元素`);
    elements.forEach((el, index) => {
      const styles = getComputedStyle(el);
      console.log(`   元素 ${index + 1}:`);
      console.log(`     背景: ${styles.background.substring(0, 50)}...`);
      console.log(`     颜色: ${styles.color}`);
      console.log(`     显示: ${styles.display}`);
    });
  });
  
  // 检查是否有倒计时文本
  const countdownTexts = document.querySelectorAll('*');
  const countdownElements = Array.from(countdownTexts).filter(el => 
    el.textContent && el.textContent.includes('限时优惠') || 
    el.textContent && el.textContent.match(/\d{2}:\d{2}/)
  );
  
  console.log(`⏰ 找到 ${countdownElements.length} 个包含倒计时的元素`);
  countdownElements.forEach((el, index) => {
    console.log(`   ${index + 1}. ${el.tagName}: "${el.textContent.trim()}"`);
  });
}

function simulateLogin() {
  console.log('\n=== 👤 模拟用户登录 ===');
  
  // 模拟设置用户登录状态
  const mockUser = {
    id: TEST_USER_ID,
    username: 'test_user',
    email: 'test@example.com',
    registrationDate: new Date().toISOString()
  };
  
  // 存储到localStorage（模拟登录状态）
  localStorage.setItem('auth_user', JSON.stringify(mockUser));
  localStorage.setItem('auth_token', 'mock_token_123');
  localStorage.setItem('is_authenticated', 'true');
  
  console.log('✅ 模拟登录成功');
  console.log(`   用户ID: ${mockUser.id}`);
  console.log(`   用户名: ${mockUser.username}`);
  
  return mockUser;
}

function resetPromo() {
  console.log('\n=== 🔄 重置优惠状态 ===');
  
  const accessTimeKey = `payment_center_access_time_${TEST_USER_ID}`;
  localStorage.removeItem(accessTimeKey);
  console.log('✅ 优惠计时已重置');
}

function testThemeAdaptation() {
  console.log('\n=== 🎨 测试主题适配 ===');
  
  const themes = ['default', 'light', 'beige', 'dark', 'rainbow', 'green', 'gold'];
  const html = document.documentElement;
  
  themes.forEach(theme => {
    html.setAttribute('data-theme', theme);
    const computedStyle = getComputedStyle(html);
    
    console.log(`\n🎨 ${theme.toUpperCase()} 主题:`);
    console.log(`   --warning: ${computedStyle.getPropertyValue('--warning').trim()}`);
    console.log(`   --destructive: ${computedStyle.getPropertyValue('--destructive').trim()}`);
    console.log(`   --primary: ${computedStyle.getPropertyValue('--primary').trim()}`);
    console.log(`   --promo-gradient: ${computedStyle.getPropertyValue('--promo-gradient').trim()}`);
  });
  
  // 恢复默认主题
  html.setAttribute('data-theme', 'default');
}

// 主要测试流程
function runFullTest() {
  console.log('\n🚀 开始完整测试流程...');
  
  // 1. 模拟登录
  simulateLogin();
  
  // 2. 触发优惠
  const promoStatus = triggerPromo();
  
  // 3. 检查页面元素
  setTimeout(() => {
    checkPromoElements();
  }, 500);
  
  // 4. 测试主题适配
  setTimeout(() => {
    testThemeAdaptation();
  }, 1000);
  
  return promoStatus;
}

// 暴露到全局
window.triggerPromo = triggerPromo;
window.checkPromoElements = checkPromoElements;
window.simulateLogin = simulateLogin;
window.resetPromo = resetPromo;
window.testThemeAdaptation = testThemeAdaptation;
window.runFullTest = runFullTest;

console.log('\n🔧 可用命令:');
console.log('- triggerPromo() - 触发限时优惠');
console.log('- checkPromoElements() - 检查页面优惠元素');
console.log('- simulateLogin() - 模拟用户登录');
console.log('- resetPromo() - 重置优惠状态');
console.log('- testThemeAdaptation() - 测试主题适配');
console.log('- runFullTest() - 运行完整测试');

// 自动运行测试
console.log('\n⚡ 自动运行测试...');
runFullTest();
