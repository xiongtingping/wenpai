/**
 * 蓝色背景修复验证脚本
 * 在浏览器控制台中运行此脚本来验证蓝色背景问题的修复效果
 */

console.log('🔍 开始验证蓝色背景修复...');

// 检查当前主题
function getCurrentTheme() {
  const html = document.documentElement;
  const theme = html.getAttribute('data-theme');
  console.log('📋 当前主题:', theme);
  return theme;
}

// 检查背景色
function checkBackgroundColors() {
  const html = document.documentElement;
  const computedStyle = getComputedStyle(html);
  
  // 获取CSS变量值
  const background = computedStyle.getPropertyValue('--background').trim();
  const card = computedStyle.getPropertyValue('--card').trim();
  const accent = computedStyle.getPropertyValue('--accent').trim();
  
  console.log('🎨 CSS变量值:');
  console.log('  --background:', background);
  console.log('  --card:', card);
  console.log('  --accent:', accent);
  
  // 检查实际应用的背景色
  const body = document.body;
  const bodyBg = getComputedStyle(body).backgroundColor;
  console.log('  实际body背景色:', bodyBg);
  
  return { background, card, accent, bodyBg };
}

// 检查页面元素背景
function checkPageElementBackgrounds() {
  console.log('\n🔍 检查页面元素背景...');
  
  // 检查主容器
  const mainContainer = document.querySelector('.min-h-screen');
  if (mainContainer) {
    const bg = getComputedStyle(mainContainer).backgroundColor;
    console.log('📦 主容器背景:', bg);
    
    // 检查是否是刺眼的蓝色
    if (bg.includes('rgb(') && bg.includes('240')) {
      console.log('❌ 仍然是刺眼的蓝色背景');
      return false;
    } else if (bg.includes('rgb(255, 255, 255)') || bg.includes('white')) {
      console.log('✅ 背景已修复为白色');
      return true;
    } else {
      console.log('⚠️ 背景色未知:', bg);
      return false;
    }
  } else {
    console.log('⚠️ 未找到主容器');
    return false;
  }
}

// 检查卡片背景
function checkCardBackgrounds() {
  console.log('\n🔍 检查卡片背景...');
  
  const cards = document.querySelectorAll('.bg-card, [class*="bg-accent"]');
  let allGood = true;
  
  cards.forEach((card, index) => {
    const bg = getComputedStyle(card).backgroundColor;
    console.log(`📋 卡片${index + 1}背景:`, bg);
    
    if (bg.includes('240, 248, 255') || bg.includes('rgb(240')) {
      console.log(`❌ 卡片${index + 1}仍然是刺眼的蓝色`);
      allGood = false;
    }
  });
  
  return allGood;
}

// 主验证函数
function validateBackgroundFix() {
  console.log('🚀 开始验证蓝色背景修复...\n');
  
  const theme = getCurrentTheme();
  const colors = checkBackgroundColors();
  const mainBgFixed = checkPageElementBackgrounds();
  const cardBgFixed = checkCardBackgrounds();
  
  console.log('\n📊 验证结果:');
  console.log('主题:', theme);
  console.log('主容器背景修复:', mainBgFixed ? '✅' : '❌');
  console.log('卡片背景修复:', cardBgFixed ? '✅' : '❌');
  
  if (mainBgFixed && cardBgFixed) {
    console.log('\n🎉 蓝色背景问题已完全修复！');
    return true;
  } else {
    console.log('\n⚠️ 仍有部分背景需要调整');
    return false;
  }
}

// 切换到蓝色主题进行测试
function switchToBlueTheme() {
  console.log('🔄 切换到蓝色主题进行测试...');
  document.documentElement.setAttribute('data-theme', 'blue');
  
  // 等待样式应用
  setTimeout(() => {
    validateBackgroundFix();
  }, 100);
}

// 运行验证
validateBackgroundFix();

// 如果当前不是蓝色主题，切换到蓝色主题测试
const currentTheme = getCurrentTheme();
if (currentTheme !== 'blue') {
  console.log('\n🔄 当前不是蓝色主题，切换到蓝色主题测试...');
  switchToBlueTheme();
}

// 测试所有主题的背景
function testAllThemes() {
  console.log('\n🌈 测试所有主题背景...');
  const themes = ['light', 'dark', 'blue', 'beige', 'green'];

  themes.forEach((theme, index) => {
    setTimeout(() => {
      console.log(`\n🔄 切换到${theme}主题...`);
      document.documentElement.setAttribute('data-theme', theme);

      setTimeout(() => {
        const bg = getComputedStyle(document.querySelector('.min-h-screen') || document.body).backgroundColor;
        console.log(`📋 ${theme}主题背景:`, bg);

        if (theme === 'blue' && (bg.includes('rgb(255, 255, 255)') || bg.includes('white'))) {
          console.log('✅ 蓝色主题背景已修复为白色');
        } else if (theme === 'blue' && bg.includes('240')) {
          console.log('❌ 蓝色主题仍然是刺眼的蓝色');
        }
      }, 100);
    }, index * 1000);
  });
}

console.log('\n💡 提示: 如果需要手动切换主题测试，请在右上角点击主题切换按钮');
console.log('💡 运行 testAllThemes() 可以自动测试所有主题');

// 导出测试函数供手动调用
window.testAllThemes = testAllThemes;
