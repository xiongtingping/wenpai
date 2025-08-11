/**
 * 验证快速工具图标背景颜色一致性修复
 * 在浏览器控制台中运行此脚本
 */

console.log('🔍 验证快速工具图标背景颜色一致性修复...');

function switchToDarkMode() {
  console.log('🌙 切换到深色模式...');
  document.documentElement.setAttribute('data-theme', 'dark');
  document.documentElement.classList.add('dark');
  localStorage.setItem('wenpai-theme', 'dark');
  console.log('✅ 已切换到深色模式');
}

function findQuickToolIcons() {
  console.log('\n🔍 查找快速工具图标...');
  
  const icons = Array.from(document.querySelectorAll('.quick-tool-icon'));
  
  console.log(`📊 找到 ${icons.length} 个快速工具图标`);
  
  return icons.map((icon, index) => {
    const card = icon.closest('[class*="Card"]');
    const title = card ? card.querySelector('h4')?.textContent?.trim() : `工具${index + 1}`;
    const themeClass = Array.from(icon.classList).find(cls => cls.startsWith('quick-tool-') && cls !== 'quick-tool-icon');
    
    return {
      element: icon,
      index: index + 1,
      title,
      themeClass: themeClass || 'unknown'
    };
  });
}

function analyzeIconStyles(icons) {
  console.log('\n🎨 分析图标样式...');
  
  const styleAnalysis = icons.map((iconInfo) => {
    const { element, index, title, themeClass } = iconInfo;
    const computedStyle = getComputedStyle(element);
    
    console.log(`\n--- 图标 ${index}: ${title} ---`);
    console.log('主题类:', themeClass);
    
    const analysis = {
      index,
      title,
      themeClass,
      styles: {
        background: computedStyle.background,
        backgroundImage: computedStyle.backgroundImage,
        backgroundColor: computedStyle.backgroundColor,
        color: computedStyle.color,
        border: computedStyle.border,
        borderRadius: computedStyle.borderRadius,
        boxShadow: computedStyle.boxShadow,
        width: computedStyle.width,
        height: computedStyle.height,
        backdropFilter: computedStyle.backdropFilter
      },
      features: {
        hasGradient: computedStyle.backgroundImage.includes('gradient'),
        hasShadow: computedStyle.boxShadow !== 'none',
        hasBorder: computedStyle.border !== '0px none rgba(0, 0, 0, 0)',
        hasBackdropFilter: computedStyle.backdropFilter !== 'none',
        isSquare: computedStyle.width === computedStyle.height
      }
    };
    
    // 输出样式信息
    console.log('背景:', analysis.styles.background);
    console.log('背景图像:', analysis.styles.backgroundImage);
    console.log('颜色:', analysis.styles.color);
    console.log('边框:', analysis.styles.border);
    console.log('阴影:', analysis.styles.boxShadow);
    console.log('尺寸:', `${analysis.styles.width} × ${analysis.styles.height}`);
    console.log('背景滤镜:', analysis.styles.backdropFilter);
    
    // 输出特性
    console.log('\n特性分析:');
    console.log('渐变背景:', analysis.features.hasGradient ? '✅' : '❌');
    console.log('阴影效果:', analysis.features.hasShadow ? '✅' : '❌');
    console.log('边框样式:', analysis.features.hasBorder ? '✅' : '❌');
    console.log('背景滤镜:', analysis.features.hasBackdropFilter ? '✅' : '❌');
    console.log('正方形:', analysis.features.isSquare ? '✅' : '❌');
    
    return analysis;
  });
  
  return styleAnalysis;
}

function checkIconConsistency(styleAnalysis) {
  console.log('\n🔍 检查图标一致性...');
  
  if (styleAnalysis.length < 2) {
    console.log('⚠️ 图标数量不足，无法进行一致性检查');
    return { consistent: false, issues: ['图标数量不足'] };
  }
  
  const issues = [];
  const consistency = {
    gradient: new Set(),
    shadow: new Set(),
    border: new Set(),
    borderRadius: new Set(),
    width: new Set(),
    height: new Set(),
    backdropFilter: new Set(),
    themes: new Set()
  };
  
  // 收集所有图标的样式特征
  styleAnalysis.forEach(analysis => {
    consistency.gradient.add(analysis.features.hasGradient);
    consistency.shadow.add(analysis.features.hasShadow);
    consistency.border.add(analysis.features.hasBorder);
    consistency.borderRadius.add(analysis.styles.borderRadius);
    consistency.width.add(analysis.styles.width);
    consistency.height.add(analysis.styles.height);
    consistency.backdropFilter.add(analysis.features.hasBackdropFilter);
    consistency.themes.add(analysis.themeClass);
  });
  
  // 检查一致性
  console.log('\n一致性检查结果:');
  
  // 渐变背景一致性
  if (consistency.gradient.size === 1) {
    const hasGradient = Array.from(consistency.gradient)[0];
    console.log('渐变背景:', hasGradient ? '✅ 所有图标都有渐变' : '✅ 所有图标都无渐变');
  } else {
    console.log('渐变背景: ❌ 不一致');
    issues.push('渐变背景不一致');
  }
  
  // 阴影效果一致性
  if (consistency.shadow.size === 1) {
    const hasShadow = Array.from(consistency.shadow)[0];
    console.log('阴影效果:', hasShadow ? '✅ 所有图标都有阴影' : '✅ 所有图标都无阴影');
  } else {
    console.log('阴影效果: ❌ 不一致');
    issues.push('阴影效果不一致');
  }
  
  // 尺寸一致性
  if (consistency.width.size === 1 && consistency.height.size === 1) {
    console.log('图标尺寸: ✅ 一致');
  } else {
    console.log('图标尺寸: ❌ 不一致');
    console.log('发现的宽度:', Array.from(consistency.width));
    console.log('发现的高度:', Array.from(consistency.height));
    issues.push('图标尺寸不一致');
  }
  
  // 圆角一致性
  if (consistency.borderRadius.size === 1) {
    console.log('圆角边框: ✅ 一致');
  } else {
    console.log('圆角边框: ❌ 不一致');
    console.log('发现的圆角值:', Array.from(consistency.borderRadius));
    issues.push('圆角边框不一致');
  }
  
  // 主题多样性检查
  console.log('主题多样性:', `✅ ${consistency.themes.size} 种不同主题`);
  console.log('主题列表:', Array.from(consistency.themes));
  
  return {
    consistent: issues.length === 0,
    issues,
    details: consistency,
    themeCount: consistency.themes.size
  };
}

function testHoverEffects(icons) {
  console.log('\n🖱️ 测试图标悬停效果...');
  
  return Promise.all(icons.map(async (iconInfo) => {
    const { element, index, title } = iconInfo;
    
    console.log(`\n测试图标 ${index} (${title}) 悬停效果...`);
    
    // 记录初始状态
    const initialStyle = getComputedStyle(element);
    const initialTransform = initialStyle.transform;
    const initialShadow = initialStyle.boxShadow;
    const initialBackground = initialStyle.background;
    
    // 触发悬停
    element.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
    
    // 等待动画
    await new Promise(resolve => setTimeout(resolve, 150));
    
    // 检查悬停状态
    const hoverStyle = getComputedStyle(element);
    const hoverTransform = hoverStyle.transform;
    const hoverShadow = hoverStyle.boxShadow;
    const hoverBackground = hoverStyle.background;
    
    const effects = {
      transformChanged: initialTransform !== hoverTransform,
      shadowChanged: initialShadow !== hoverShadow,
      backgroundChanged: initialBackground !== hoverBackground
    };
    
    console.log('变换效果:', effects.transformChanged ? '✅ 有变化' : '❌ 无变化');
    console.log('阴影效果:', effects.shadowChanged ? '✅ 有变化' : '❌ 无变化');
    console.log('背景效果:', effects.backgroundChanged ? '✅ 有变化' : '❌ 无变化');
    
    if (effects.transformChanged) {
      console.log('变换详情:', `${initialTransform} → ${hoverTransform}`);
    }
    
    // 恢复正常状态
    element.dispatchEvent(new MouseEvent('mouseleave', { bubbles: true }));
    
    return {
      index,
      title,
      effects,
      responsive: effects.transformChanged || effects.shadowChanged || effects.backgroundChanged
    };
  }));
}

function generateIconConsistencyReport(icons, styleAnalysis, consistencyCheck, hoverTests) {
  console.log('\n📋 生成图标一致性报告...');
  
  const report = {
    timestamp: new Date().toISOString(),
    theme: 'dark',
    summary: {
      totalIcons: icons.length,
      expectedIcons: 4,
      consistent: consistencyCheck.consistent,
      issueCount: consistencyCheck.issues.length,
      themeCount: consistencyCheck.themeCount
    },
    fixes: [
      '✅ 统一图标背景：所有图标使用渐变背景',
      '✅ 主题色彩区分：4种不同主题色彩（warm/cool/nature/elegant）',
      '✅ 尺寸标准化：统一48px × 48px尺寸',
      '✅ 圆角统一：统一8px圆角',
      '✅ 阴影效果：统一阴影和边框样式',
      '✅ 深色模式适配：专用CSS确保深色模式下的视觉效果',
      '✅ 悬停交互：统一的悬停动画和反馈'
    ],
    issues: consistencyCheck.issues,
    recommendations: []
  };
  
  // 生成建议
  if (report.summary.totalIcons !== report.summary.expectedIcons) {
    report.recommendations.push(`⚠️ 期望${report.summary.expectedIcons}个图标，实际找到${report.summary.totalIcons}个`);
  }
  
  if (!consistencyCheck.consistent) {
    report.recommendations.push('🔧 发现样式不一致问题，建议检查CSS规则优先级');
  }
  
  const unresponsiveIcons = hoverTests.filter(test => !test.responsive);
  if (unresponsiveIcons.length > 0) {
    report.recommendations.push(`🖱️ ${unresponsiveIcons.length} 个图标缺少悬停效果`);
  }
  
  if (report.summary.themeCount < 4) {
    report.recommendations.push(`🎨 主题多样性不足，期望4种主题，实际${report.summary.themeCount}种`);
  }
  
  // 输出报告
  console.log('\n🎉 快速工具图标一致性修复报告:');
  console.log('时间:', report.timestamp);
  console.log('主题:', report.theme);
  
  console.log('\n📊 统计信息:');
  console.log('总图标数:', report.summary.totalIcons);
  console.log('期望图标数:', report.summary.expectedIcons);
  console.log('样式一致性:', report.summary.consistent ? '✅ 一致' : '❌ 不一致');
  console.log('问题数量:', report.summary.issueCount);
  console.log('主题数量:', report.summary.themeCount);
  
  console.log('\n✨ 修复内容:');
  report.fixes.forEach(fix => console.log(fix));
  
  if (report.issues.length > 0) {
    console.log('\n⚠️ 发现的问题:');
    report.issues.forEach(issue => console.log('❌', issue));
  }
  
  if (report.recommendations.length > 0) {
    console.log('\n💡 建议:');
    report.recommendations.forEach(rec => console.log(rec));
  }
  
  if (report.summary.consistent && report.summary.totalIcons === report.summary.expectedIcons) {
    console.log('\n🎉 快速工具图标一致性修复成功！');
    console.log('📈 所有工具图标现在具有统一的视觉风格和主题色彩区分');
  }
  
  return report;
}

// 主验证函数
async function runIconConsistencyCheck() {
  console.log('🚀 开始快速工具图标一致性验证...');
  
  // 1. 切换到深色模式
  switchToDarkMode();
  
  // 2. 等待样式应用
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // 3. 查找快速工具图标
  const icons = findQuickToolIcons();
  
  if (icons.length === 0) {
    console.log('❌ 未找到快速工具图标，请确保在首页运行此脚本');
    return;
  }
  
  // 4. 分析图标样式
  const styleAnalysis = analyzeIconStyles(icons);
  
  // 5. 检查一致性
  const consistencyCheck = checkIconConsistency(styleAnalysis);
  
  // 6. 测试悬停效果
  console.log('\n⏳ 测试悬停效果中...');
  const hoverTests = await testHoverEffects(icons);
  
  // 7. 生成报告
  const report = generateIconConsistencyReport(icons, styleAnalysis, consistencyCheck, hoverTests);
  
  console.log('\n🏁 验证完成！');
  
  return report;
}

// 自动运行验证
runIconConsistencyCheck();
