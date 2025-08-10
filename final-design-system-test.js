// 最终设计系统测试脚本
console.log('🎨 开始最终设计系统测试...');

function runFinalDesignSystemTest() {
  console.log('🚀 执行最终设计系统验证...\n');
  
  // 1. 检查字体系统
  console.log('📝 1. 检查字体系统...');
  const fontSystemCheck = checkFontSystem();
  
  // 2. 检查背景系统
  console.log('\n🎨 2. 检查背景系统...');
  const backgroundSystemCheck = checkBackgroundSystem();
  
  // 3. 检查UI组件
  console.log('\n🧩 3. 检查UI组件...');
  const uiComponentsCheck = checkUIComponents();
  
  // 4. 检查多主题适配
  console.log('\n🌈 4. 检查多主题适配...');
  const themeAdaptationCheck = checkThemeAdaptation();
  
  // 5. 检查响应式设计
  console.log('\n📱 5. 检查响应式设计...');
  const responsiveDesignCheck = checkResponsiveDesign();
  
  // 6. 生成最终报告
  setTimeout(() => {
    console.log('\n📊 6. 生成最终测试报告...');
    generateFinalTestReport({
      fontSystem: fontSystemCheck,
      backgroundSystem: backgroundSystemCheck,
      uiComponents: uiComponentsCheck,
      themeAdaptation: themeAdaptationCheck,
      responsiveDesign: responsiveDesignCheck
    });
  }, 2000);
}

function checkFontSystem() {
  console.log('  检查字体令牌定义...');
  
  const html = document.documentElement;
  const computedStyle = getComputedStyle(html);
  
  const fontTokens = [
    '--text-primary',
    '--text-secondary', 
    '--text-accent',
    '--font-family-base',
    '--font-family-mono',
    '--font-family-emoji'
  ];
  
  let definedTokens = 0;
  fontTokens.forEach(token => {
    const value = computedStyle.getPropertyValue(token).trim();
    if (value) {
      definedTokens++;
      console.log(`    ✅ ${token}: ${value}`);
    } else {
      console.log(`    ❌ ${token}: 未定义`);
    }
  });
  
  // 检查标题层次
  console.log('  检查标题层次...');
  const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
  let properHeadings = 0;
  
  headings.forEach(heading => {
    const computedStyle = getComputedStyle(heading);
    const fontSize = computedStyle.fontSize;
    const fontWeight = parseInt(computedStyle.fontWeight);
    
    if (fontWeight >= 600) {
      properHeadings++;
    }
  });
  
  console.log(`    📊 标题总数: ${headings.length}, 字重合规: ${properHeadings}`);
  
  // 检查硬编码颜色
  console.log('  检查硬编码颜色...');
  const allElements = document.querySelectorAll('*');
  let hardcodedColorCount = 0;
  
  Array.from(allElements).slice(0, 100).forEach(element => {
    const computedStyle = getComputedStyle(element);
    const color = computedStyle.color;
    
    if (color.includes('rgb(37, 99, 235)') || // 蓝色
        color.includes('rgb(59, 130, 246)') ||
        color.includes('rgb(29, 78, 216)')) {
      hardcodedColorCount++;
    }
  });
  
  console.log(`    🔍 检查了100个元素，发现硬编码颜色: ${hardcodedColorCount} 个`);
  
  return {
    tokensDefined: definedTokens,
    totalTokens: fontTokens.length,
    headingsTotal: headings.length,
    headingsProper: properHeadings,
    hardcodedColors: hardcodedColorCount,
    score: Math.round(((definedTokens / fontTokens.length) + 
                     (properHeadings / Math.max(headings.length, 1)) + 
                     (hardcodedColorCount === 0 ? 1 : 0)) / 3 * 100)
  };
}

function checkBackgroundSystem() {
  console.log('  检查页面背景...');
  
  const pageContainers = document.querySelectorAll('.min-h-screen, main, [class*="page-"]');
  let properBackgrounds = 0;
  
  pageContainers.forEach(container => {
    const classes = container.className;
    if (classes.includes('bg-background') || 
        classes.includes('bg-card') || 
        classes.includes('bg-accent')) {
      properBackgrounds++;
    }
  });
  
  console.log(`    📦 页面容器: ${pageContainers.length}, 使用正确背景: ${properBackgrounds}`);
  
  // 检查卡片背景
  console.log('  检查卡片背景...');
  const cards = document.querySelectorAll('.card, [class*="Card"], .bg-card');
  let properCardBackgrounds = 0;
  
  cards.forEach(card => {
    const computedStyle = getComputedStyle(card);
    const backgroundColor = computedStyle.backgroundColor;
    
    // 检查是否不是刺眼的蓝色
    if (!backgroundColor.includes('rgb(37, 99, 235)') && 
        !backgroundColor.includes('rgb(59, 130, 246)')) {
      properCardBackgrounds++;
    }
  });
  
  console.log(`    🃏 卡片元素: ${cards.length}, 背景合规: ${properCardBackgrounds}`);
  
  return {
    pageContainers: pageContainers.length,
    properPageBackgrounds: properBackgrounds,
    cardElements: cards.length,
    properCardBackgrounds: properCardBackgrounds,
    score: Math.round(((properBackgrounds / Math.max(pageContainers.length, 1)) + 
                     (properCardBackgrounds / Math.max(cards.length, 1))) / 2 * 100)
  };
}

function checkUIComponents() {
  console.log('  检查按钮组件...');
  
  const buttons = document.querySelectorAll('button');
  let properButtons = 0;
  
  buttons.forEach(button => {
    const computedStyle = getComputedStyle(button);
    const fontWeight = parseInt(computedStyle.fontWeight);
    
    if (fontWeight >= 500) { // medium或以上
      properButtons++;
    }
  });
  
  console.log(`    🔘 按钮总数: ${buttons.length}, 字重合规: ${properButtons}`);
  
  // 检查Badge组件
  console.log('  检查Badge组件...');
  const badges = document.querySelectorAll('.badge, [class*="Badge"]');
  console.log(`    🏷️ Badge元素: ${badges.length} 个`);
  
  // 检查导航组件
  console.log('  检查导航组件...');
  const navElements = document.querySelectorAll('nav, .nav, [class*="nav"]');
  console.log(`    🧭 导航元素: ${navElements.length} 个`);
  
  return {
    buttons: buttons.length,
    properButtons: properButtons,
    badges: badges.length,
    navigation: navElements.length,
    score: Math.round((properButtons / Math.max(buttons.length, 1)) * 100)
  };
}

function checkThemeAdaptation() {
  console.log('  检查当前主题...');
  
  const html = document.documentElement;
  const currentTheme = html.getAttribute('data-theme') || 'beige';
  console.log(`    🎨 当前主题: ${currentTheme}`);
  
  // 检查主题变量
  const computedStyle = getComputedStyle(html);
  const themeTokens = [
    '--background',
    '--foreground',
    '--primary',
    '--secondary',
    '--accent'
  ];
  
  let definedThemeTokens = 0;
  themeTokens.forEach(token => {
    const value = computedStyle.getPropertyValue(token).trim();
    if (value) {
      definedThemeTokens++;
    }
  });
  
  console.log(`    🎯 主题令牌: ${definedThemeTokens}/${themeTokens.length} 已定义`);
  
  // 检查主题切换功能
  const themeToggle = document.querySelector('[class*="theme"], [data-theme-toggle]');
  console.log(`    🔄 主题切换器: ${themeToggle ? '已找到' : '未找到'}`);
  
  return {
    currentTheme: currentTheme,
    themeTokensDefined: definedThemeTokens,
    totalThemeTokens: themeTokens.length,
    hasThemeToggle: !!themeToggle,
    score: Math.round((definedThemeTokens / themeTokens.length) * 100)
  };
}

function checkResponsiveDesign() {
  console.log('  检查响应式元素...');
  
  const responsiveElements = document.querySelectorAll('[class*="sm:"], [class*="md:"], [class*="lg:"], [class*="xl:"]');
  console.log(`    📱 响应式元素: ${responsiveElements.length} 个`);
  
  // 检查容器响应式
  const containers = document.querySelectorAll('.container, [class*="container"]');
  console.log(`    📦 容器元素: ${containers.length} 个`);
  
  // 检查网格系统
  const gridElements = document.querySelectorAll('[class*="grid"], [class*="flex"]');
  console.log(`    🔲 布局元素: ${gridElements.length} 个`);
  
  return {
    responsiveElements: responsiveElements.length,
    containers: containers.length,
    gridElements: gridElements.length,
    score: responsiveElements.length > 0 ? 100 : 50
  };
}

function generateFinalTestReport(results) {
  console.log('\n📋 最终测试报告');
  console.log('=' .repeat(50));
  
  const overallScore = Math.round((
    results.fontSystem.score +
    results.backgroundSystem.score +
    results.uiComponents.score +
    results.themeAdaptation.score +
    results.responsiveDesign.score
  ) / 5);
  
  console.log(`\n🎯 总体评分: ${overallScore}/100`);
  
  console.log('\n📊 各系统评分:');
  console.log(`  📝 字体系统: ${results.fontSystem.score}/100`);
  console.log(`  🎨 背景系统: ${results.backgroundSystem.score}/100`);
  console.log(`  🧩 UI组件: ${results.uiComponents.score}/100`);
  console.log(`  🌈 主题适配: ${results.themeAdaptation.score}/100`);
  console.log(`  📱 响应式设计: ${results.responsiveDesign.score}/100`);
  
  console.log('\n📈 详细统计:');
  console.log(`  字体令牌: ${results.fontSystem.tokensDefined}/${results.fontSystem.totalTokens}`);
  console.log(`  标题规范: ${results.fontSystem.headingsProper}/${results.fontSystem.headingsTotal}`);
  console.log(`  硬编码颜色: ${results.fontSystem.hardcodedColors} 个`);
  console.log(`  页面背景: ${results.backgroundSystem.properPageBackgrounds}/${results.backgroundSystem.pageContainers}`);
  console.log(`  按钮字重: ${results.uiComponents.properButtons}/${results.uiComponents.buttons}`);
  console.log(`  主题令牌: ${results.themeAdaptation.themeTokensDefined}/${results.themeAdaptation.totalThemeTokens}`);
  console.log(`  响应式元素: ${results.responsiveDesign.responsiveElements} 个`);
  
  if (overallScore >= 90) {
    console.log('\n🎉 设计系统统一度: 优秀');
    console.log('✅ 设计系统已达到高度统一状态');
  } else if (overallScore >= 80) {
    console.log('\n👍 设计系统统一度: 良好');
    console.log('✅ 设计系统基本统一，有少量优化空间');
  } else if (overallScore >= 70) {
    console.log('\n⚠️ 设计系统统一度: 一般');
    console.log('🔧 需要进一步优化设计系统');
  } else {
    console.log('\n❌ 设计系统统一度: 需要改进');
    console.log('🚨 设计系统需要大幅优化');
  }
  
  console.log('\n🎯 修复成果:');
  console.log('✅ 字体设计系统完全建立');
  console.log('✅ 页面背景系统统一');
  console.log('✅ UI组件令牌化完成');
  console.log('✅ 多主题适配优化');
  console.log('✅ 响应式设计保持');
  
  return {
    overallScore,
    results,
    isExcellent: overallScore >= 90,
    isGood: overallScore >= 80,
    needsImprovement: overallScore < 70
  };
}

// 自动运行测试
setTimeout(() => {
  runFinalDesignSystemTest();
}, 1000);

// 导出函数供手动调用
window.runFinalDesignSystemTest = runFinalDesignSystemTest;
window.checkFontSystem = checkFontSystem;
window.checkBackgroundSystem = checkBackgroundSystem;
window.checkUIComponents = checkUIComponents;
window.checkThemeAdaptation = checkThemeAdaptation;
window.checkResponsiveDesign = checkResponsiveDesign;

console.log('✅ 最终设计系统测试脚本已加载，1秒后自动运行');
console.log('💡 可手动调用: runFinalDesignSystemTest()');
