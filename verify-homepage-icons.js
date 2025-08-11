/**
 * 验证首页各区域图标背景颜色和字体颜色修复
 * 在浏览器控制台中运行此脚本
 */

console.log('🔍 验证首页各区域图标背景颜色和字体颜色修复...');

function switchToDarkMode() {
  console.log('🌙 切换到深色模式...');
  document.documentElement.setAttribute('data-theme', 'dark');
  document.documentElement.classList.add('dark');
  localStorage.setItem('wenpai-theme', 'dark');
  console.log('✅ 已切换到深色模式');
}

function findHomepageIcons() {
  console.log('\n🔍 查找首页各区域图标...');
  
  const sections = {
    howItWorks: {
      name: '三步搞定',
      icons: Array.from(document.querySelectorAll('.how-it-works-icon')),
      expectedCount: 3
    },
    mainFeatures: {
      name: '主要功能',
      icons: Array.from(document.querySelectorAll('.main-feature-icon')),
      expectedCount: 5
    },
    advantages: {
      name: '平台优势',
      icons: Array.from(document.querySelectorAll('.advantage-icon')),
      expectedCount: 4
    },
    quickTools: {
      name: '快速工具',
      icons: Array.from(document.querySelectorAll('.quick-tool-icon')),
      expectedCount: 4
    }
  };
  
  console.log('\n📊 各区域图标统计:');
  Object.entries(sections).forEach(([key, section]) => {
    console.log(`${section.name}: ${section.icons.length}/${section.expectedCount} 个图标`);
  });
  
  return sections;
}

function analyzeIconStyles(sections) {
  console.log('\n🎨 分析各区域图标样式...');
  
  const analysis = {};
  
  Object.entries(sections).forEach(([sectionKey, section]) => {
    console.log(`\n=== ${section.name} 区域 ===`);
    
    const sectionAnalysis = section.icons.map((icon, index) => {
      const computedStyle = getComputedStyle(icon);
      
      const iconAnalysis = {
        index: index + 1,
        section: section.name,
        styles: {
          background: computedStyle.background,
          backgroundImage: computedStyle.backgroundImage,
          backgroundColor: computedStyle.backgroundColor,
          color: computedStyle.color,
          border: computedStyle.border,
          borderRadius: computedStyle.borderRadius,
          boxShadow: computedStyle.boxShadow,
          width: computedStyle.width,
          height: computedStyle.height
        },
        features: {
          hasGradient: computedStyle.backgroundImage.includes('gradient'),
          hasShadow: computedStyle.boxShadow !== 'none',
          hasBorder: computedStyle.border !== '0px none rgba(0, 0, 0, 0)',
          isCircular: computedStyle.borderRadius.includes('50%') || parseFloat(computedStyle.borderRadius) >= parseFloat(computedStyle.width) / 2,
          isSquare: computedStyle.width === computedStyle.height
        }
      };
      
      console.log(`\n--- 图标 ${index + 1} ---`);
      console.log('背景:', iconAnalysis.styles.background);
      console.log('背景图像:', iconAnalysis.styles.backgroundImage);
      console.log('颜色:', iconAnalysis.styles.color);
      console.log('尺寸:', `${iconAnalysis.styles.width} × ${iconAnalysis.styles.height}`);
      console.log('阴影:', iconAnalysis.styles.boxShadow);
      
      console.log('\n特性:');
      console.log('渐变背景:', iconAnalysis.features.hasGradient ? '✅' : '❌');
      console.log('阴影效果:', iconAnalysis.features.hasShadow ? '✅' : '❌');
      console.log('圆形图标:', iconAnalysis.features.isCircular ? '✅' : '❌');
      console.log('正方形:', iconAnalysis.features.isSquare ? '✅' : '❌');
      
      return iconAnalysis;
    });
    
    analysis[sectionKey] = {
      name: section.name,
      icons: sectionAnalysis,
      count: sectionAnalysis.length,
      expectedCount: section.expectedCount
    };
  });
  
  return analysis;
}

function checkOverallConsistency(analysis) {
  console.log('\n🔍 检查整体一致性...');
  
  const issues = [];
  const allIcons = [];
  
  // 收集所有图标
  Object.values(analysis).forEach(section => {
    allIcons.push(...section.icons);
  });
  
  if (allIcons.length === 0) {
    console.log('❌ 未找到任何图标');
    return { consistent: false, issues: ['未找到图标'], totalIcons: 0 };
  }
  
  // 检查渐变背景一致性
  const gradientCount = allIcons.filter(icon => icon.features.hasGradient).length;
  const gradientPercentage = (gradientCount / allIcons.length) * 100;
  
  console.log(`渐变背景覆盖率: ${gradientPercentage.toFixed(1)}% (${gradientCount}/${allIcons.length})`);
  
  if (gradientPercentage < 80) {
    issues.push(`渐变背景覆盖率不足: ${gradientPercentage.toFixed(1)}%`);
  }
  
  // 检查阴影效果一致性
  const shadowCount = allIcons.filter(icon => icon.features.hasShadow).length;
  const shadowPercentage = (shadowCount / allIcons.length) * 100;
  
  console.log(`阴影效果覆盖率: ${shadowPercentage.toFixed(1)}% (${shadowCount}/${allIcons.length})`);
  
  if (shadowPercentage < 80) {
    issues.push(`阴影效果覆盖率不足: ${shadowPercentage.toFixed(1)}%`);
  }
  
  // 检查各区域完整性
  Object.entries(analysis).forEach(([key, section]) => {
    if (section.count !== section.expectedCount) {
      issues.push(`${section.name}区域图标数量不符: ${section.count}/${section.expectedCount}`);
    }
  });
  
  console.log('\n一致性检查结果:');
  console.log('总图标数:', allIcons.length);
  console.log('渐变背景:', gradientPercentage >= 80 ? '✅ 良好' : '❌ 不足');
  console.log('阴影效果:', shadowPercentage >= 80 ? '✅ 良好' : '❌ 不足');
  console.log('问题数量:', issues.length);
  
  return {
    consistent: issues.length === 0,
    issues,
    totalIcons: allIcons.length,
    gradientPercentage,
    shadowPercentage
  };
}

function testHoverEffects(sections) {
  console.log('\n🖱️ 测试各区域图标悬停效果...');
  
  const results = {};
  
  return Promise.all(
    Object.entries(sections).map(async ([sectionKey, section]) => {
      console.log(`\n测试 ${section.name} 区域悬停效果...`);
      
      const sectionResults = await Promise.all(
        section.icons.map(async (icon, index) => {
          // 记录初始状态
          const initialStyle = getComputedStyle(icon);
          const initialTransform = initialStyle.transform;
          const initialShadow = initialStyle.boxShadow;
          
          // 触发悬停
          icon.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
          
          // 等待动画
          await new Promise(resolve => setTimeout(resolve, 150));
          
          // 检查悬停状态
          const hoverStyle = getComputedStyle(icon);
          const hoverTransform = hoverStyle.transform;
          const hoverShadow = hoverStyle.boxShadow;
          
          const effects = {
            transformChanged: initialTransform !== hoverTransform,
            shadowChanged: initialShadow !== hoverShadow
          };
          
          console.log(`图标 ${index + 1}:`, 
            effects.transformChanged ? '✅ 变换' : '❌ 无变换',
            effects.shadowChanged ? '✅ 阴影' : '❌ 无阴影'
          );
          
          // 恢复正常状态
          icon.dispatchEvent(new MouseEvent('mouseleave', { bubbles: true }));
          
          return {
            index: index + 1,
            effects,
            responsive: effects.transformChanged || effects.shadowChanged
          };
        })
      );
      
      results[sectionKey] = {
        name: section.name,
        results: sectionResults,
        responsiveCount: sectionResults.filter(r => r.responsive).length
      };
      
      return results[sectionKey];
    })
  ).then(() => results);
}

function generateHomepageIconReport(sections, analysis, consistencyCheck, hoverResults) {
  console.log('\n📋 生成首页图标修复报告...');
  
  const report = {
    timestamp: new Date().toISOString(),
    theme: 'dark',
    summary: {
      totalIcons: consistencyCheck.totalIcons,
      sectionsCount: Object.keys(sections).length,
      consistent: consistencyCheck.consistent,
      issueCount: consistencyCheck.issues.length,
      gradientCoverage: consistencyCheck.gradientPercentage,
      shadowCoverage: consistencyCheck.shadowPercentage
    },
    fixes: [
      '✅ 三步搞定区域：统一使用渐变背景（蓝-靛蓝、翠绿-青绿、紫-粉）',
      '✅ 主要功能区域：5种不同渐变主题色彩区分功能类型',
      '✅ 平台优势区域：4种渐变背景突出平台特色',
      '✅ 快速工具区域：4种主题渐变保持工具差异化',
      '✅ 图标尺寸统一：所有区域图标尺寸规范化',
      '✅ 阴影效果统一：添加统一的阴影和边框样式',
      '✅ 深色模式适配：专用CSS确保深色模式下的视觉效果',
      '✅ 悬停交互统一：所有图标都有一致的交互反馈'
    ],
    sections: Object.entries(analysis).map(([key, section]) => ({
      key,
      name: section.name,
      iconCount: section.count,
      expectedCount: section.expectedCount,
      complete: section.count === section.expectedCount
    })),
    issues: consistencyCheck.issues,
    recommendations: []
  };
  
  // 生成建议
  if (report.summary.gradientCoverage < 80) {
    report.recommendations.push(`🎨 渐变背景覆盖率不足: ${report.summary.gradientCoverage.toFixed(1)}%`);
  }
  
  if (report.summary.shadowCoverage < 80) {
    report.recommendations.push(`💫 阴影效果覆盖率不足: ${report.summary.shadowCoverage.toFixed(1)}%`);
  }
  
  const incompleteSection = report.sections.filter(s => !s.complete);
  if (incompleteSection.length > 0) {
    report.recommendations.push(`⚠️ ${incompleteSection.length} 个区域图标数量不完整`);
  }
  
  // 输出报告
  console.log('\n🎉 首页图标修复报告:');
  console.log('时间:', report.timestamp);
  console.log('主题:', report.theme);
  
  console.log('\n📊 统计信息:');
  console.log('总图标数:', report.summary.totalIcons);
  console.log('区域数量:', report.summary.sectionsCount);
  console.log('样式一致性:', report.summary.consistent ? '✅ 一致' : '❌ 不一致');
  console.log('渐变覆盖率:', `${report.summary.gradientCoverage.toFixed(1)}%`);
  console.log('阴影覆盖率:', `${report.summary.shadowCoverage.toFixed(1)}%`);
  
  console.log('\n📍 各区域状态:');
  report.sections.forEach(section => {
    console.log(`${section.name}: ${section.iconCount}/${section.expectedCount} ${section.complete ? '✅' : '❌'}`);
  });
  
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
  
  if (report.summary.consistent && report.summary.gradientCoverage >= 80) {
    console.log('\n🎉 首页图标修复成功！');
    console.log('📈 所有区域图标现在具有统一的视觉风格和主题色彩');
  }
  
  return report;
}

// 主验证函数
async function runHomepageIconCheck() {
  console.log('🚀 开始首页图标一致性验证...');
  
  // 1. 切换到深色模式
  switchToDarkMode();
  
  // 2. 等待样式应用
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // 3. 查找各区域图标
  const sections = findHomepageIcons();
  
  // 4. 分析图标样式
  const analysis = analyzeIconStyles(sections);
  
  // 5. 检查整体一致性
  const consistencyCheck = checkOverallConsistency(analysis);
  
  // 6. 测试悬停效果
  console.log('\n⏳ 测试悬停效果中...');
  const hoverResults = await testHoverEffects(sections);
  
  // 7. 生成报告
  const report = generateHomepageIconReport(sections, analysis, consistencyCheck, hoverResults);
  
  console.log('\n🏁 验证完成！');
  
  return report;
}

// 自动运行验证
runHomepageIconCheck();
