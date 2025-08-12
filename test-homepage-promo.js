/**
 * 测试首页限时优惠功能
 * 验证是否正确照搬了支付中心的设计
 */

console.log('🔥 开始测试首页限时优惠功能...');

// 模拟用户ID
const TEST_USER_ID = 'test_user_homepage_123';

function simulateUserLogin() {
  console.log('\n=== 👤 模拟用户登录 ===');
  
  // 模拟设置用户登录状态
  const mockUser = {
    id: TEST_USER_ID,
    username: 'test_homepage_user',
    email: 'test@homepage.com',
    registrationDate: new Date().toISOString()
  };
  
  // 存储到localStorage（模拟登录状态）
  localStorage.setItem('auth_user', JSON.stringify(mockUser));
  localStorage.setItem('auth_token', 'mock_homepage_token_123');
  localStorage.setItem('is_authenticated', 'true');
  
  console.log('✅ 模拟登录成功');
  console.log(`   用户ID: ${mockUser.id}`);
  console.log(`   用户名: ${mockUser.username}`);
  
  return mockUser;
}

function triggerHomepagePromo() {
  console.log('\n=== 🎯 触发首页限时优惠 ===');
  
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
  const hours = Math.floor(ms / 3600000);
  const minutes = Math.floor((ms % 3600000) / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  const centiseconds = Math.floor((ms % 1000) / 10);
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${centiseconds.toString().padStart(2, '0')}`;
}

function checkHomepagePromoElements() {
  console.log('\n=== 🔍 检查首页限时优惠元素 ===');
  
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
      console.log(`     背景: ${styles.background.substring(0, 80)}...`);
      console.log(`     颜色: ${styles.color}`);
      console.log(`     显示: ${styles.display}`);
      console.log(`     位置: ${el.getBoundingClientRect().top > 0 ? '可见' : '不可见'}`);
    });
  });
  
  // 检查是否有倒计时文本
  const allElements = document.querySelectorAll('*');
  const countdownElements = Array.from(allElements).filter(el => 
    el.textContent && (
      el.textContent.includes('限时优惠进行中') || 
      el.textContent.includes('优惠即将结束') ||
      el.textContent.match(/\d{2}:\d{2}:\d{2}\.\d{2}/)
    )
  );
  
  console.log(`⏰ 找到 ${countdownElements.length} 个包含倒计时的元素`);
  countdownElements.forEach((el, index) => {
    console.log(`   ${index + 1}. ${el.tagName}.${el.className}: "${el.textContent.trim().substring(0, 50)}..."`);
  });
  
  // 检查Zap图标
  const zapIcons = document.querySelectorAll('[data-lucide="zap"], .lucide-zap');
  console.log(`⚡ 找到 ${zapIcons.length} 个Zap图标`);
}

function testThemeCompatibility() {
  console.log('\n=== 🎨 测试主题兼容性 ===');
  
  const themes = ['default', 'light', 'beige', 'dark', 'rainbow', 'green', 'gold'];
  const html = document.documentElement;
  const originalTheme = html.getAttribute('data-theme') || 'default';
  
  themes.forEach(theme => {
    html.setAttribute('data-theme', theme);
    const computedStyle = getComputedStyle(html);
    
    console.log(`\n🎨 ${theme.toUpperCase()} 主题:`);
    console.log(`   --warning: ${computedStyle.getPropertyValue('--warning').trim()}`);
    console.log(`   --destructive: ${computedStyle.getPropertyValue('--destructive').trim()}`);
    console.log(`   --primary: ${computedStyle.getPropertyValue('--primary').trim()}`);
    console.log(`   --promo-gradient: ${computedStyle.getPropertyValue('--promo-gradient').trim().substring(0, 50)}...`);
    
    // 检查promo-banner元素在当前主题下的样式
    const promoBanner = document.querySelector('.promo-banner');
    if (promoBanner) {
      const bannerStyles = getComputedStyle(promoBanner);
      console.log(`   Banner背景: ${bannerStyles.background.substring(0, 50)}...`);
    }
  });
  
  // 恢复原主题
  html.setAttribute('data-theme', originalTheme);
}

function scrollToPricingSection() {
  console.log('\n=== 📍 滚动到定价区域 ===');
  
  const pricingSection = document.querySelector('#pricing') || 
                        document.querySelector('[id*="pricing"]') ||
                        document.querySelector('.pricing') ||
                        document.querySelector('section:has(.promo-banner)');
  
  if (pricingSection) {
    pricingSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
    console.log('✅ 已滚动到定价区域');
  } else {
    console.log('❌ 未找到定价区域');
  }
}

// 主要测试流程
function runHomepagePromoTest() {
  console.log('\n🚀 开始首页限时优惠完整测试...');
  
  // 1. 模拟登录
  simulateUserLogin();
  
  // 2. 触发优惠
  const promoStatus = triggerHomepagePromo();
  
  // 3. 滚动到定价区域
  setTimeout(() => {
    scrollToPricingSection();
  }, 500);
  
  // 4. 检查页面元素
  setTimeout(() => {
    checkHomepagePromoElements();
  }, 1000);
  
  // 5. 测试主题兼容性
  setTimeout(() => {
    testThemeCompatibility();
  }, 1500);
  
  return promoStatus;
}

// 重置功能
function resetHomepagePromo() {
  console.log('\n=== 🔄 重置首页优惠状态 ===');
  
  const accessTimeKey = `payment_center_access_time_${TEST_USER_ID}`;
  localStorage.removeItem(accessTimeKey);
  localStorage.removeItem('auth_user');
  localStorage.removeItem('auth_token');
  localStorage.removeItem('is_authenticated');
  console.log('✅ 首页优惠状态已重置');
}

// 暴露到全局
window.simulateUserLogin = simulateUserLogin;
window.triggerHomepagePromo = triggerHomepagePromo;
window.checkHomepagePromoElements = checkHomepagePromoElements;
window.testThemeCompatibility = testThemeCompatibility;
window.scrollToPricingSection = scrollToPricingSection;
window.runHomepagePromoTest = runHomepagePromoTest;
window.resetHomepagePromo = resetHomepagePromo;

console.log('\n🔧 可用命令:');
console.log('- runHomepagePromoTest() - 运行完整测试');
console.log('- simulateUserLogin() - 模拟用户登录');
console.log('- triggerHomepagePromo() - 触发限时优惠');
console.log('- checkHomepagePromoElements() - 检查页面元素');
console.log('- testThemeCompatibility() - 测试主题兼容性');
console.log('- scrollToPricingSection() - 滚动到定价区域');
console.log('- resetHomepagePromo() - 重置优惠状态');

// 自动运行测试
console.log('\n⚡ 自动运行首页限时优惠测试...');
runHomepagePromoTest();
