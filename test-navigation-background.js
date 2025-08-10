// 验证顶部导航栏背景修复脚本
console.log('🔍 开始验证顶部导航栏背景修复...\n');

// 检查导航栏背景
function checkNavigationBackground() {
  const header = document.querySelector('header');
  if (!header) {
    console.log('❌ 未找到导航栏元素');
    return false;
  }

  const styles = getComputedStyle(header);
  const backgroundColor = styles.backgroundColor;
  
  console.log('📋 导航栏背景色:', backgroundColor);
  
  // 检查是否为白色或接近白色
  const isWhiteish = backgroundColor.includes('rgb(255, 255, 255)') || 
                     backgroundColor.includes('rgba(255, 255, 255') ||
                     backgroundColor === 'white';
  
  if (isWhiteish) {
    console.log('✅ 导航栏背景已修复为白色');
    return true;
  } else {
    console.log('❌ 导航栏背景仍有问题:', backgroundColor);
    return false;
  }
}

// 检查当前主题
function getCurrentTheme() {
  return document.documentElement.getAttribute('data-theme') || 'default';
}

// 切换到蓝色主题测试
function testBlueTheme() {
  console.log('🔄 切换到蓝色主题测试...');
  document.documentElement.setAttribute('data-theme', 'blue');
  
  setTimeout(() => {
    console.log('当前主题:', getCurrentTheme());
    const navFixed = checkNavigationBackground();
    
    if (navFixed) {
      console.log('🎉 蓝色主题下导航栏背景修复成功！');
    } else {
      console.log('⚠️ 蓝色主题下导航栏背景仍需调整');
    }
  }, 200);
}

// 测试所有主题的导航栏背景
function testAllThemesNavigation() {
  console.log('\n🌈 测试所有主题的导航栏背景...');
  const themes = ['light', 'dark', 'blue', 'beige', 'green'];
  
  themes.forEach((theme, index) => {
    setTimeout(() => {
      console.log(`\n🔄 切换到${theme}主题...`);
      document.documentElement.setAttribute('data-theme', theme);
      
      setTimeout(() => {
        console.log(`📋 ${theme}主题导航栏检查:`);
        checkNavigationBackground();
      }, 100);
    }, index * 1000);
  });
}

// 主验证函数
function validateNavigationFix() {
  console.log('🚀 开始验证导航栏背景修复...\n');
  
  const currentTheme = getCurrentTheme();
  console.log('当前主题:', currentTheme);
  
  const navFixed = checkNavigationBackground();
  
  if (navFixed) {
    console.log('\n🎉 导航栏背景修复验证通过！');
  } else {
    console.log('\n⚠️ 导航栏背景仍需调整');
  }
  
  return navFixed;
}

// 执行验证
validateNavigationFix();

// 延迟测试蓝色主题
setTimeout(testBlueTheme, 1000);

// 延迟测试所有主题
setTimeout(testAllThemesNavigation, 3000);

console.log('\n💡 提示: 可以手动切换主题查看导航栏背景变化');
console.log('💡 在控制台运行 testBlueTheme() 来测试蓝色主题');
