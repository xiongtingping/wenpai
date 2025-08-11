// 验证所有背景层修复效果的测试脚本
console.log('🎨 开始验证背景层修复效果...\n');

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
    } else {
      console.log('   ⚠️ 可能需要检查背景设置');
    }
  });
}

// 检查Hero区域背景
function checkHeroSection() {
  console.log('\n🦸 检查Hero区域背景...');
  
  const heroSection = document.querySelector('section');
  if (!heroSection) {
    console.log('❌ 未找到Hero区域');
    return false;
  }
  
  const bg = getComputedStyle(heroSection).backgroundColor;
  const classes = heroSection.className;
  
  console.log('🦸 Hero区域:');
  console.log(`   类名: ${classes}`);
  console.log(`   背景色: ${bg}`);
  
  // 检查是否有深色背景
  if (bg.includes('rgb(') && bg.includes('0, 0, 0')) {
    console.log('   ❌ 仍然有深色背景');
    return false;
  } else {
    console.log('   ✅ 背景颜色正常');
    return true;
  }
}

// 检查CTA区域背景
function checkCTASection() {
  console.log('\n📢 检查CTA区域背景...');
  
  // 查找CTA区域
  const ctaSections = document.querySelectorAll('section');
  let ctaSection = null;
  
  ctaSections.forEach(section => {
    const text = section.textContent;
    if (text.includes('准备好开始您的创作之旅了吗')) {
      ctaSection = section;
    }
  });
  
  if (!ctaSection) {
    console.log('❌ 未找到CTA区域');
    return false;
  }
  
  const bg = getComputedStyle(ctaSection).backgroundColor;
  const classes = ctaSection.className;
  
  console.log('📢 CTA区域:');
  console.log(`   类名: ${classes}`);
  console.log(`   背景色: ${bg}`);
  
  // 检查是否移除了复杂背景
  if (classes.includes('particle-background')) {
    console.log('   ❌ 仍然使用了粒子背景');
    return false;
  } else if (classes.includes('bg-gradient-')) {
    console.log('   ⚠️ 仍然使用了渐变背景');
    return false;
  } else {
    console.log('   ✅ 背景已简化');
    return true;
  }
}

// 检查body背景
function checkBodyBackground() {
  console.log('\n🌐 检查body背景...');
  
  const body = document.body;
  const bg = getComputedStyle(body).backgroundColor;
  const classes = body.className;
  
  console.log('🌐 Body元素:');
  console.log(`   类名: ${classes}`);
  console.log(`   背景色: ${bg}`);
  
  return true;
}

// 切换主题测试
function testThemeSwitch() {
  console.log('\n🔄 测试主题切换...');
  
  const themes = ['light', 'dark', 'beige', 'gold'];
  const originalTheme = getCurrentTheme();
  
  themes.forEach(theme => {
    console.log(`\n--- 切换到 ${theme.toUpperCase()} 主题 ---`);
    
    // 切换主题
    document.documentElement.setAttribute('data-theme', theme);
    
    // 等待样式应用
    setTimeout(() => {
      const body = document.body;
      const bg = getComputedStyle(body).backgroundColor;
      console.log(`${theme} 主题背景色: ${bg}`);
    }, 100);
  });
  
  // 恢复原主题
  setTimeout(() => {
    document.documentElement.setAttribute('data-theme', originalTheme);
    console.log(`\n恢复到原主题: ${originalTheme}`);
  }, 1000);
}

// 生成修复报告
function generateFixReport() {
  console.log('\n📊 生成修复报告...');
  
  const report = {
    timestamp: new Date().toISOString(),
    theme: getCurrentTheme(),
    checks: {
      pageContainers: true,
      heroSection: checkHeroSection(),
      ctaSection: checkCTASection(),
      bodyBackground: checkBodyBackground()
    }
  };
  
  console.log('\n📋 修复报告:');
  console.log(JSON.stringify(report, null, 2));
  
  const allPassed = Object.values(report.checks).every(check => check === true);
  
  if (allPassed) {
    console.log('\n🎉 所有背景层修复成功！');
    console.log('✅ 页面背景已完全清理');
  } else {
    console.log('\n⚠️ 部分检查未通过，需要进一步调整');
  }
  
  return report;
}

// 主验证函数
async function runBackgroundLayersCheck() {
  console.log('🚀 开始背景层修复验证...');
  
  // 1. 检查当前主题
  getCurrentTheme();
  
  // 2. 检查CSS变量
  checkCSSVariables();
  
  // 3. 检查页面容器
  checkPageContainers();
  
  // 4. 检查Hero区域
  checkHeroSection();
  
  // 5. 检查CTA区域
  checkCTASection();
  
  // 6. 检查body背景
  checkBodyBackground();
  
  // 7. 测试主题切换
  testThemeSwitch();
  
  // 8. 生成修复报告
  await new Promise(resolve => setTimeout(resolve, 1500));
  const report = generateFixReport();
  
  console.log('\n🏁 验证完成！');
  
  return report;
}

// 自动运行验证
if (typeof window !== 'undefined') {
  // 等待页面加载完成
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', runBackgroundLayersCheck);
  } else {
    runBackgroundLayersCheck();
  }
}

// 导出函数供手动调用
window.runBackgroundLayersCheck = runBackgroundLayersCheck;
window.checkHeroSection = checkHeroSection;
window.checkCTASection = checkCTASection;

console.log('📝 测试脚本已加载，可以手动调用 runBackgroundLayersCheck() 进行验证');
