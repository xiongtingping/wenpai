/**
 * 测试限时优惠在不同主题下的样式表现
 */

console.log('🎨 开始测试限时优惠主题适配...');

// 获取所有可用主题
const themes = ['default', 'light', 'beige', 'dark', 'rainbow', 'green', 'gold'];

function testPromoStyles() {
  console.log('\n=== 🔥 限时优惠样式测试 ===');
  
  const html = document.documentElement;
  const currentTheme = html.getAttribute('data-theme') || 'default';
  console.log(`📋 当前主题: ${currentTheme}`);
  
  // 检查CSS变量
  const computedStyle = getComputedStyle(html);
  const promoVariables = [
    '--warning',
    '--destructive', 
    '--primary',
    '--accent',
    '--promo-gradient',
    '--promo-bg',
    '--promo-border'
  ];
  
  console.log('\n🎨 限时优惠相关CSS变量:');
  promoVariables.forEach(variable => {
    const value = computedStyle.getPropertyValue(variable).trim();
    console.log(`  ${variable}: ${value || '未定义'}`);
  });
  
  // 检查限时优惠元素
  const promoElements = document.querySelectorAll('.promo-banner, .promo-countdown, .promo-countdown-time');
  console.log(`\n📦 找到 ${promoElements.length} 个限时优惠元素`);
  
  promoElements.forEach((element, index) => {
    const classes = element.className;
    const computedBg = getComputedStyle(element).background;
    const computedColor = getComputedStyle(element).color;
    
    console.log(`\n📄 元素 ${index + 1}:`);
    console.log(`   类名: ${classes}`);
    console.log(`   背景: ${computedBg.substring(0, 100)}${computedBg.length > 100 ? '...' : ''}`);
    console.log(`   文字颜色: ${computedColor}`);
  });
  
  return promoElements.length > 0;
}

function switchThemeAndTest(themeName) {
  console.log(`\n🔄 切换到 ${themeName} 主题...`);
  
  const html = document.documentElement;
  html.setAttribute('data-theme', themeName);
  
  // 等待样式应用
  setTimeout(() => {
    console.log(`\n=== 🎨 ${themeName.toUpperCase()} 主题测试结果 ===`);
    testPromoStyles();
  }, 100);
}

// 测试当前主题
testPromoStyles();

// 提供主题切换功能
console.log('\n🔧 可用命令:');
console.log('- testPromoStyles() - 测试当前主题的限时优惠样式');
themes.forEach(theme => {
  console.log(`- switchThemeAndTest('${theme}') - 切换到${theme}主题并测试`);
});

// 自动测试所有主题
function testAllThemes() {
  console.log('\n🚀 开始自动测试所有主题...');
  
  themes.forEach((theme, index) => {
    setTimeout(() => {
      switchThemeAndTest(theme);
    }, index * 1000);
  });
}

console.log('- testAllThemes() - 自动测试所有主题');

// 暴露到全局
window.testPromoStyles = testPromoStyles;
window.switchThemeAndTest = switchThemeAndTest;
window.testAllThemes = testAllThemes;
