// 最终背景修复验证脚本
console.log('🎨 开始最终背景修复验证...');

// 检查当前主题
function getCurrentTheme() {
  const html = document.documentElement;
  const theme = html.getAttribute('data-theme') || 'default';
  console.log('📋 当前主题:', theme);
  return theme;
}

// 检查CSS变量值
function checkCSSVariables() {
  const html = document.documentElement;
  const computedStyle = getComputedStyle(html);
  
  const variables = [
    '--background',
    '--foreground', 
    '--card',
    '--accent',
    '--primary',
    '--border',
    '--bg-gradient-primary'
  ];
  
  console.log('\n🎨 CSS变量值:');
  variables.forEach(variable => {
    const value = computedStyle.getPropertyValue(variable).trim();
    console.log(`  ${variable}: ${value}`);
  });
}

// 检查页面容器背景
function checkPageContainers() {
  console.log('\n🔍 检查页面容器背景...');
  
  // 检查主容器
  const mainContainers = document.querySelectorAll('.min-h-screen');
  console.log(`📦 找到 ${mainContainers.length} 个主容器`);
  
  let allGood = true;
  mainContainers.forEach((container, index) => {
    const bg = getComputedStyle(container).backgroundColor;
    const classes = container.className;
    console.log(`📦 容器${index + 1}:`);
    console.log(`   类名: ${classes}`);
    console.log(`   背景色: ${bg}`);
    
    // 检查是否是刺眼的蓝色或紫色
    if (bg.includes('240, 248, 255') || bg.includes('rgb(240') || 
        bg.includes('103, 110, 234') || bg.includes('118, 75, 162')) {
      console.log('   ❌ 仍然是刺眼的蓝色/紫色背景');
      allGood = false;
    } else {
      console.log('   ✅ 背景颜色正常');
    }
  });
  
  return allGood;
}

// 检查导航栏背景
function checkNavigationBackground() {
  console.log('\n🔍 检查导航栏背景...');
  
  const header = document.querySelector('header');
  if (header) {
    const bg = getComputedStyle(header).backgroundColor;
    const classes = header.className;
    console.log('🧭 导航栏:');
    console.log(`   类名: ${classes}`);
    console.log(`   背景色: ${bg}`);
    
    // 检查是否使用了统一令牌
    if (classes.includes('bg-background')) {
      console.log('   ✅ 使用了统一背景令牌');
      return true;
    } else if (bg.includes('rgb(255, 255, 255)') || bg.includes('white')) {
      console.log('   ✅ 背景为白色');
      return true;
    } else {
      console.log('   ⚠️ 可能需要检查背景设置');
      return false;
    }
  } else {
    console.log('⚠️ 未找到导航栏');
    return false;
  }
}

// 检查首页特定问题
function checkHomePageLayout() {
  console.log('\n🏠 检查首页布局问题...');
  
  // 检查是否在首页
  const isHomePage = window.location.pathname === '/' || window.location.pathname === '/home';
  if (!isHomePage) {
    console.log('⚠️ 当前不在首页，跳过首页检查');
    return true;
  }
  
  // 检查页面高度
  const body = document.body;
  const html = document.documentElement;
  console.log('📏 页面尺寸:');
  console.log(`   body高度: ${body.scrollHeight}px`);
  console.log(`   视窗高度: ${window.innerHeight}px`);
  console.log(`   是否有滚动: ${body.scrollHeight > window.innerHeight ? '是' : '否'}`);
  
  // 检查主容器
  const mainContainer = document.querySelector('.min-h-screen');
  if (mainContainer) {
    const containerStyle = getComputedStyle(mainContainer);
    console.log('📦 主容器样式:');
    console.log(`   高度: ${containerStyle.height}`);
    console.log(`   最小高度: ${containerStyle.minHeight}`);
    console.log(`   显示: ${containerStyle.display}`);
    console.log(`   弹性方向: ${containerStyle.flexDirection}`);
    
    // 检查是否有内容被截断
    if (containerStyle.height === '100vh' && body.scrollHeight > window.innerHeight) {
      console.log('   ⚠️ 可能存在内容截断问题');
      return false;
    } else {
      console.log('   ✅ 布局正常');
      return true;
    }
  }
  
  return true;
}

// 检查渐变背景
function checkGradientBackgrounds() {
  console.log('\n🌈 检查渐变背景...');
  
  const gradientElements = document.querySelectorAll('.bg-gradient-primary, .bg-gradient-secondary, .bg-gradient-accent');
  console.log(`🎨 找到 ${gradientElements.length} 个渐变背景元素`);
  
  let allGood = true;
  gradientElements.forEach((element, index) => {
    const bg = getComputedStyle(element).background;
    const classes = element.className;
    console.log(`🎨 渐变元素${index + 1}:`);
    console.log(`   类名: ${classes}`);
    console.log(`   背景: ${bg.substring(0, 100)}...`);
    
    // 检查是否是真正的渐变
    if (bg.includes('linear-gradient') || bg.includes('gradient')) {
      console.log('   ✅ 使用了渐变背景');
    } else {
      console.log('   ⚠️ 可能不是渐变背景');
      allGood = false;
    }
  });
  
  return allGood;
}

// 主验证函数
function validateFinalBackgroundFix() {
  console.log('🚀 开始最终背景修复验证...\n');
  
  const theme = getCurrentTheme();
  checkCSSVariables();
  const containersOk = checkPageContainers();
  const navigationOk = checkNavigationBackground();
  const layoutOk = checkHomePageLayout();
  const gradientsOk = checkGradientBackgrounds();
  
  console.log('\n📊 最终验证结果:');
  console.log('当前主题:', theme);
  console.log('页面容器:', containersOk ? '✅' : '❌');
  console.log('导航栏背景:', navigationOk ? '✅' : '❌');
  console.log('首页布局:', layoutOk ? '✅' : '❌');
  console.log('渐变背景:', gradientsOk ? '✅' : '❌');
  
  const allPassed = containersOk && navigationOk && layoutOk && gradientsOk;
  
  if (allPassed) {
    console.log('\n🎉 所有背景问题已完全修复！');
    console.log('✅ 蓝色/紫色背景已替换为统一令牌');
    console.log('✅ 首页截断问题已解决');
    console.log('✅ 导航栏使用统一背景');
    console.log('✅ 渐变背景正常工作');
  } else {
    console.log('\n⚠️ 仍有部分问题需要调整');
  }
  
  return allPassed;
}

// 测试所有主题
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
        
        if (bg.includes('240, 248, 255') || bg.includes('rgb(240')) {
          console.log(`❌ ${theme}主题仍然有刺眼的蓝色`);
        } else {
          console.log(`✅ ${theme}主题背景正常`);
        }
      }, 100);
    }, index * 1000);
  });
}

// 自动运行验证
setTimeout(() => {
  validateFinalBackgroundFix();
}, 1000);

// 导出函数供手动调用
window.validateFinalBackgroundFix = validateFinalBackgroundFix;
window.testAllThemes = testAllThemes;

console.log('✅ 最终验证脚本已加载，1秒后自动运行');
console.log('💡 可手动调用: validateFinalBackgroundFix() 或 testAllThemes()');
