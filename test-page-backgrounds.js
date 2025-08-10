// 测试所有页面背景颜色的脚本
console.log('🎨 开始检查页面背景颜色...');

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
    '--border'
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
  
  mainContainers.forEach((container, index) => {
    const bg = getComputedStyle(container).backgroundColor;
    const classes = container.className;
    console.log(`📦 容器${index + 1}:`);
    console.log(`   类名: ${classes}`);
    console.log(`   背景色: ${bg}`);
    
    // 检查是否使用了正确的背景类
    if (classes.includes('bg-background')) {
      console.log('   ✅ 使用了正确的背景令牌');
    } else if (classes.includes('bg-gradient-primary')) {
      console.log('   ✅ 使用了渐变背景');
    } else {
      console.log('   ⚠️ 可能需要检查背景设置');
    }
  });
}

// 检查卡片背景
function checkCardBackgrounds() {
  console.log('\n🔍 检查卡片背景...');
  
  const cards = document.querySelectorAll('.bg-card, .bg-accent, [class*="bg-"]');
  console.log(`📋 找到 ${cards.length} 个背景元素`);
  
  let correctCount = 0;
  let incorrectCount = 0;
  
  cards.forEach((card, index) => {
    const bg = getComputedStyle(card).backgroundColor;
    const classes = card.className;
    
    // 检查是否是刺眼的蓝色或紫色
    if (bg.includes('240, 248, 255') || bg.includes('rgb(240') || 
        bg.includes('103, 110, 234') || bg.includes('118, 75, 162')) {
      console.log(`❌ 元素${index + 1}仍然是刺眼的蓝色/紫色:`);
      console.log(`   类名: ${classes}`);
      console.log(`   背景色: ${bg}`);
      incorrectCount++;
    } else {
      correctCount++;
    }
  });
  
  console.log(`\n📊 背景检查结果:`);
  console.log(`✅ 正确的背景: ${correctCount}`);
  console.log(`❌ 需要修复的背景: ${incorrectCount}`);
}

// 检查首页特定问题
function checkHomePageIssues() {
  console.log('\n🏠 检查首页特定问题...');
  
  // 检查是否在首页
  const isHomePage = window.location.pathname === '/' || window.location.pathname === '/home';
  if (!isHomePage) {
    console.log('⚠️ 当前不在首页，跳过首页检查');
    return;
  }
  
  // 检查Hero区域
  const heroSection = document.querySelector('section');
  if (heroSection) {
    const heroStyle = getComputedStyle(heroSection);
    console.log('🎯 Hero区域样式:');
    console.log(`   高度: ${heroStyle.height}`);
    console.log(`   最小高度: ${heroStyle.minHeight}`);
    console.log(`   背景: ${heroStyle.backgroundColor}`);
    console.log(`   溢出: ${heroStyle.overflow}`);
  }
  
  // 检查主容器
  const mainContainer = document.querySelector('.min-h-screen');
  if (mainContainer) {
    const containerStyle = getComputedStyle(mainContainer);
    console.log('📦 主容器样式:');
    console.log(`   高度: ${containerStyle.height}`);
    console.log(`   最小高度: ${containerStyle.minHeight}`);
    console.log(`   显示: ${containerStyle.display}`);
    console.log(`   弹性方向: ${containerStyle.flexDirection}`);
  }
  
  // 检查是否有内容被截断
  const body = document.body;
  const html = document.documentElement;
  console.log('📏 页面尺寸:');
  console.log(`   body高度: ${body.scrollHeight}px`);
  console.log(`   视窗高度: ${window.innerHeight}px`);
  console.log(`   是否有滚动: ${body.scrollHeight > window.innerHeight ? '是' : '否'}`);
}

// 主验证函数
function validatePageBackgrounds() {
  console.log('🚀 开始验证页面背景...\n');
  
  const theme = getCurrentTheme();
  checkCSSVariables();
  checkPageContainers();
  checkCardBackgrounds();
  checkHomePageIssues();
  
  console.log('\n🎉 页面背景检查完成！');
}

// 自动运行检查
setTimeout(() => {
  validatePageBackgrounds();
}, 1000);

// 导出函数供手动调用
window.validatePageBackgrounds = validatePageBackgrounds;
window.checkHomePageIssues = checkHomePageIssues;

console.log('✅ 背景检查脚本已加载，1秒后自动运行检查');
console.log('💡 可手动调用: validatePageBackgrounds() 或 checkHomePageIssues()');
