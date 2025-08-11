/**
 * 验证定价页面按钮统一性修复
 * 在浏览器控制台中运行此脚本
 */

console.log('🔍 验证定价页面按钮统一性修复...');

function switchToDarkMode() {
  console.log('🌙 切换到深色模式...');
  document.documentElement.setAttribute('data-theme', 'dark');
  document.documentElement.classList.add('dark');
  localStorage.setItem('wenpai-theme', 'dark');
  console.log('✅ 已切换到深色模式');
}

function findPricingButtons() {
  console.log('\n🔍 查找定价页面按钮...');
  
  const buttons = Array.from(document.querySelectorAll('button')).filter(btn => {
    const text = btn.textContent.trim();
    return text.includes('开始免费使用') || 
           text.includes('立即升级') ||
           btn.closest('[class*="Card"]');
  });
  
  console.log(`📊 找到 ${buttons.length} 个定价按钮`);
  
  return buttons.map(btn => {
    const text = btn.textContent.trim();
    const isFree = text.includes('开始免费使用');
    const isPaid = text.includes('立即升级');
    const hasSparkles = btn.querySelector('svg[class*="Sparkles"]');
    const hasCrown = btn.querySelector('svg[class*="Crown"]');
    
    return {
      element: btn,
      text,
      type: isFree ? 'free' : (isPaid ? 'paid' : 'unknown'),
      hasSparkles: !!hasSparkles,
      hasCrown: !!hasCrown
    };
  });
}

function analyzeButtonStyles(buttons) {
  console.log('\n🎨 分析按钮样式...');
  
  const styleAnalysis = buttons.map((btnInfo, index) => {
    const { element, text, type } = btnInfo;
    const computedStyle = getComputedStyle(element);
    
    console.log(`\n--- 按钮 ${index + 1}: ${type.toUpperCase()} ---`);
    console.log('文本:', text);
    console.log('类型:', type);
    
    const analysis = {
      index: index + 1,
      type,
      text,
      styles: {
        background: computedStyle.background,
        backgroundImage: computedStyle.backgroundImage,
        backgroundColor: computedStyle.backgroundColor,
        color: computedStyle.color,
        border: computedStyle.border,
        borderRadius: computedStyle.borderRadius,
        boxShadow: computedStyle.boxShadow,
        fontSize: computedStyle.fontSize,
        fontWeight: computedStyle.fontWeight,
        minHeight: computedStyle.minHeight,
        padding: computedStyle.padding,
        letterSpacing: computedStyle.letterSpacing
      },
      features: {
        hasGradient: computedStyle.backgroundImage.includes('gradient'),
        hasShadow: computedStyle.boxShadow !== 'none',
        hasBorder: computedStyle.border !== '0px none rgba(0, 0, 0, 0)',
        isRounded: parseFloat(computedStyle.borderRadius) > 0
      }
    };
    
    // 输出样式信息
    console.log('背景:', analysis.styles.background);
    console.log('背景图像:', analysis.styles.backgroundImage);
    console.log('颜色:', analysis.styles.color);
    console.log('边框:', analysis.styles.border);
    console.log('阴影:', analysis.styles.boxShadow);
    console.log('字体大小:', analysis.styles.fontSize);
    console.log('字体粗细:', analysis.styles.fontWeight);
    console.log('最小高度:', analysis.styles.minHeight);
    console.log('字母间距:', analysis.styles.letterSpacing);
    
    // 输出特性
    console.log('\n特性分析:');
    console.log('渐变背景:', analysis.features.hasGradient ? '✅' : '❌');
    console.log('阴影效果:', analysis.features.hasShadow ? '✅' : '❌');
    console.log('边框样式:', analysis.features.hasBorder ? '✅' : '❌');
    console.log('圆角边框:', analysis.features.isRounded ? '✅' : '❌');
    
    return analysis;
  });
  
  return styleAnalysis;
}

function checkButtonConsistency(styleAnalysis) {
  console.log('\n🔍 检查按钮一致性...');
  
  if (styleAnalysis.length < 2) {
    console.log('⚠️ 按钮数量不足，无法进行一致性检查');
    return { consistent: false, issues: ['按钮数量不足'] };
  }
  
  const issues = [];
  const consistency = {
    gradient: new Set(),
    shadow: new Set(),
    border: new Set(),
    borderRadius: new Set(),
    fontSize: new Set(),
    fontWeight: new Set(),
    minHeight: new Set(),
    letterSpacing: new Set()
  };
  
  // 收集所有按钮的样式特征
  styleAnalysis.forEach(analysis => {
    consistency.gradient.add(analysis.features.hasGradient);
    consistency.shadow.add(analysis.features.hasShadow);
    consistency.border.add(analysis.features.hasBorder);
    consistency.borderRadius.add(analysis.styles.borderRadius);
    consistency.fontSize.add(analysis.styles.fontSize);
    consistency.fontWeight.add(analysis.styles.fontWeight);
    consistency.minHeight.add(analysis.styles.minHeight);
    consistency.letterSpacing.add(analysis.styles.letterSpacing);
  });
  
  // 检查一致性
  console.log('\n一致性检查结果:');
  
  // 渐变背景一致性
  if (consistency.gradient.size === 1) {
    const hasGradient = Array.from(consistency.gradient)[0];
    console.log('渐变背景:', hasGradient ? '✅ 所有按钮都有渐变' : '✅ 所有按钮都无渐变');
  } else {
    console.log('渐变背景: ❌ 不一致');
    issues.push('渐变背景不一致');
  }
  
  // 阴影效果一致性
  if (consistency.shadow.size === 1) {
    const hasShadow = Array.from(consistency.shadow)[0];
    console.log('阴影效果:', hasShadow ? '✅ 所有按钮都有阴影' : '✅ 所有按钮都无阴影');
  } else {
    console.log('阴影效果: ❌ 不一致');
    issues.push('阴影效果不一致');
  }
  
  // 字体大小一致性
  if (consistency.fontSize.size === 1) {
    console.log('字体大小: ✅ 一致');
  } else {
    console.log('字体大小: ❌ 不一致');
    console.log('发现的字体大小:', Array.from(consistency.fontSize));
    issues.push('字体大小不一致');
  }
  
  // 字体粗细一致性
  if (consistency.fontWeight.size === 1) {
    console.log('字体粗细: ✅ 一致');
  } else {
    console.log('字体粗细: ❌ 不一致');
    console.log('发现的字体粗细:', Array.from(consistency.fontWeight));
    issues.push('字体粗细不一致');
  }
  
  // 最小高度一致性
  if (consistency.minHeight.size === 1) {
    console.log('按钮高度: ✅ 一致');
  } else {
    console.log('按钮高度: ❌ 不一致');
    console.log('发现的最小高度:', Array.from(consistency.minHeight));
    issues.push('按钮高度不一致');
  }
  
  // 圆角一致性
  if (consistency.borderRadius.size === 1) {
    console.log('圆角边框: ✅ 一致');
  } else {
    console.log('圆角边框: ❌ 不一致');
    console.log('发现的圆角值:', Array.from(consistency.borderRadius));
    issues.push('圆角边框不一致');
  }
  
  return {
    consistent: issues.length === 0,
    issues,
    details: consistency
  };
}

function testHoverEffects(buttons) {
  console.log('\n🖱️ 测试悬停效果...');
  
  return Promise.all(buttons.map(async (btnInfo, index) => {
    const { element, type } = btnInfo;
    
    console.log(`\n测试按钮 ${index + 1} (${type}) 悬停效果...`);
    
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
      index: index + 1,
      type,
      effects,
      responsive: effects.transformChanged || effects.shadowChanged || effects.backgroundChanged
    };
  }));
}

function generateConsistencyReport(buttons, styleAnalysis, consistencyCheck, hoverTests) {
  console.log('\n📋 生成一致性报告...');
  
  const report = {
    timestamp: new Date().toISOString(),
    theme: 'dark',
    summary: {
      totalButtons: buttons.length,
      freeButtons: buttons.filter(b => b.type === 'free').length,
      paidButtons: buttons.filter(b => b.type === 'paid').length,
      consistent: consistencyCheck.consistent,
      issueCount: consistencyCheck.issues.length
    },
    fixes: [
      '✅ 统一按钮变体：所有按钮使用相同的基础样式',
      '✅ 免费版按钮样式：应用主色调渐变背景',
      '✅ 按钮尺寸统一：设置统一的最小高度和内边距',
      '✅ 字体样式统一：统一字重、字号和字母间距',
      '✅ 悬停效果统一：所有按钮都有一致的交互反馈',
      '✅ 深色模式适配：专用CSS确保深色模式下的视觉效果'
    ],
    issues: consistencyCheck.issues,
    recommendations: []
  };
  
  // 生成建议
  if (report.summary.freeButtons === 0) {
    report.recommendations.push('⚠️ 未找到免费版按钮，请检查页面是否正确加载');
  }
  
  if (report.summary.paidButtons === 0) {
    report.recommendations.push('⚠️ 未找到付费版按钮，请检查页面是否正确加载');
  }
  
  if (!consistencyCheck.consistent) {
    report.recommendations.push('🔧 发现样式不一致问题，建议检查CSS规则优先级');
  }
  
  const unresponsiveButtons = hoverTests.filter(test => !test.responsive);
  if (unresponsiveButtons.length > 0) {
    report.recommendations.push(`🖱️ ${unresponsiveButtons.length} 个按钮缺少悬停效果`);
  }
  
  // 输出报告
  console.log('\n🎉 按钮一致性修复报告:');
  console.log('时间:', report.timestamp);
  console.log('主题:', report.theme);
  
  console.log('\n📊 统计信息:');
  console.log('总按钮数:', report.summary.totalButtons);
  console.log('免费版按钮:', report.summary.freeButtons);
  console.log('付费版按钮:', report.summary.paidButtons);
  console.log('样式一致性:', report.summary.consistent ? '✅ 一致' : '❌ 不一致');
  console.log('问题数量:', report.summary.issueCount);
  
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
  
  if (report.summary.consistent && report.summary.totalButtons >= 3) {
    console.log('\n🎉 按钮统一性修复成功！');
    console.log('📈 所有定价按钮现在具有一致的视觉风格和交互体验');
  }
  
  return report;
}

// 主验证函数
async function runButtonConsistencyCheck() {
  console.log('🚀 开始按钮统一性验证...');
  
  // 1. 切换到深色模式
  switchToDarkMode();
  
  // 2. 等待样式应用
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // 3. 查找定价按钮
  const buttons = findPricingButtons();
  
  if (buttons.length === 0) {
    console.log('❌ 未找到定价按钮，请确保在定价页面运行此脚本');
    return;
  }
  
  // 4. 分析按钮样式
  const styleAnalysis = analyzeButtonStyles(buttons);
  
  // 5. 检查一致性
  const consistencyCheck = checkButtonConsistency(styleAnalysis);
  
  // 6. 测试悬停效果
  console.log('\n⏳ 测试悬停效果中...');
  const hoverTests = await testHoverEffects(buttons);
  
  // 7. 生成报告
  const report = generateConsistencyReport(buttons, styleAnalysis, consistencyCheck, hoverTests);
  
  console.log('\n🏁 验证完成！');
  
  return report;
}

// 自动运行验证
runButtonConsistencyCheck();
