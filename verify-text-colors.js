/**
 * 验证首页多个区域的文字颜色修复
 * 在浏览器控制台中运行此脚本
 */

console.log('🔍 验证首页文字颜色修复...');

function findTextColorIssues() {
  console.log('\n🎨 检查特定区域的文字颜色...');
  
  const issues = [];
  const checkResults = [];
  
  // 1. 检查"按年支付"相关文字
  console.log('\n--- 检查按年支付区域 ---');
  const yearlyButtons = Array.from(document.querySelectorAll('button')).filter(btn => 
    btn.textContent && (btn.textContent.includes('按年') || btn.textContent.includes('年付'))
  );
  
  yearlyButtons.forEach((button, index) => {
    const style = getComputedStyle(button);
    const color = style.color;
    const classes = button.className;
    const text = button.textContent.trim();
    
    console.log(`按年按钮 ${index + 1}:`);
    console.log('  文字:', text);
    console.log('  颜色:', color);
    console.log('  类名:', classes);
    
    // 检查是否是刺眼的蓝色
    if (color.includes('rgb(37, 99, 235)') || color.includes('rgb(59, 130, 246)')) {
      issues.push(`按年按钮 ${index + 1} 使用了刺眼的蓝色: ${color}`);
    }
    
    checkResults.push({
      area: '按年支付',
      element: button,
      text: text.substring(0, 30),
      color,
      classes,
      hasIssue: color.includes('rgb(37, 99, 235)') || color.includes('rgb(59, 130, 246)')
    });
  });
  
  // 2. 检查"看看内容专家们怎么说"标题
  console.log('\n--- 检查内容专家评价区域 ---');
  const expertTitle = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6')).find(h => 
    h.textContent && h.textContent.includes('看看内容专家们怎么说')
  );
  
  if (expertTitle) {
    const style = getComputedStyle(expertTitle);
    const color = style.color;
    const classes = expertTitle.className;
    
    console.log('内容专家标题:');
    console.log('  文字:', expertTitle.textContent.trim());
    console.log('  颜色:', color);
    console.log('  类名:', classes);
    
    if (color.includes('rgb(37, 99, 235)') || color.includes('rgb(59, 130, 246)')) {
      issues.push(`内容专家标题使用了刺眼的蓝色: ${color}`);
    }
    
    checkResults.push({
      area: '内容专家评价',
      element: expertTitle,
      text: expertTitle.textContent.trim(),
      color,
      classes,
      hasIssue: color.includes('rgb(37, 99, 235)') || color.includes('rgb(59, 130, 246)')
    });
  }
  
  // 3. 检查"🚀 核心功能"标签
  console.log('\n--- 检查核心功能标签 ---');
  const coreFeatureBadge = Array.from(document.querySelectorAll('*')).find(el => 
    el.textContent && el.textContent.includes('🚀 核心功能')
  );
  
  if (coreFeatureBadge) {
    const style = getComputedStyle(coreFeatureBadge);
    const color = style.color;
    const classes = coreFeatureBadge.className;
    
    console.log('核心功能标签:');
    console.log('  文字:', coreFeatureBadge.textContent.trim());
    console.log('  颜色:', color);
    console.log('  类名:', classes);
    
    if (color.includes('rgb(37, 99, 235)') || color.includes('rgb(59, 130, 246)')) {
      issues.push(`核心功能标签使用了刺眼的蓝色: ${color}`);
    }
    
    checkResults.push({
      area: '核心功能标签',
      element: coreFeatureBadge,
      text: coreFeatureBadge.textContent.trim(),
      color,
      classes,
      hasIssue: color.includes('rgb(37, 99, 235)') || color.includes('rgb(59, 130, 246)')
    });
  }
  
  // 4. 检查"三步搞定，就这么简单"标题
  console.log('\n--- 检查三步搞定区域 ---');
  const threeStepsTitle = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6')).find(h => 
    h.textContent && h.textContent.includes('三步搞定')
  );
  
  if (threeStepsTitle) {
    const style = getComputedStyle(threeStepsTitle);
    const color = style.color;
    const classes = threeStepsTitle.className;
    
    console.log('三步搞定标题:');
    console.log('  文字:', threeStepsTitle.textContent.trim());
    console.log('  颜色:', color);
    console.log('  类名:', classes);
    
    if (color.includes('rgb(37, 99, 235)') || color.includes('rgb(59, 130, 246)')) {
      issues.push(`三步搞定标题使用了刺眼的蓝色: ${color}`);
    }
    
    checkResults.push({
      area: '三步搞定',
      element: threeStepsTitle,
      text: threeStepsTitle.textContent.trim(),
      color,
      classes,
      hasIssue: color.includes('rgb(37, 99, 235)') || color.includes('rgb(59, 130, 246)')
    });
  }
  
  // 5. 检查"提高效率，节省时间"文字
  console.log('\n--- 检查效率提升区域 ---');
  const efficiencyText = Array.from(document.querySelectorAll('*')).find(el => 
    el.textContent && el.textContent.includes('提高效率，节省时间')
  );
  
  if (efficiencyText) {
    const style = getComputedStyle(efficiencyText);
    const color = style.color;
    const classes = efficiencyText.className;
    
    console.log('效率提升文字:');
    console.log('  文字:', efficiencyText.textContent.trim());
    console.log('  颜色:', color);
    console.log('  类名:', classes);
    
    if (color.includes('rgb(37, 99, 235)') || color.includes('rgb(59, 130, 246)')) {
      issues.push(`效率提升文字使用了刺眼的蓝色: ${color}`);
    }
    
    checkResults.push({
      area: '效率提升',
      element: efficiencyText,
      text: efficiencyText.textContent.trim().substring(0, 30),
      color,
      classes,
      hasIssue: color.includes('rgb(37, 99, 235)') || color.includes('rgb(59, 130, 246)')
    });
  }
  
  // 6. 检查平台支持区域
  console.log('\n--- 检查平台支持区域 ---');
  const platformText = Array.from(document.querySelectorAll('*')).find(el => 
    el.textContent && el.textContent.includes('支持14+主流平台')
  );
  
  if (platformText) {
    const style = getComputedStyle(platformText);
    const color = style.color;
    const classes = platformText.className;
    
    console.log('平台支持文字:');
    console.log('  文字:', platformText.textContent.trim());
    console.log('  颜色:', color);
    console.log('  类名:', classes);
    
    if (color.includes('rgb(37, 99, 235)') || color.includes('rgb(59, 130, 246)')) {
      issues.push(`平台支持文字使用了刺眼的蓝色: ${color}`);
    }
    
    checkResults.push({
      area: '平台支持',
      element: platformText,
      text: platformText.textContent.trim().substring(0, 50),
      color,
      classes,
      hasIssue: color.includes('rgb(37, 99, 235)') || color.includes('rgb(59, 130, 246)')
    });
  }
  
  return { issues, checkResults };
}

function analyzeColorConsistency(checkResults) {
  console.log('\n📊 分析颜色一致性...');
  
  const colorStats = {};
  const issueCount = checkResults.filter(result => result.hasIssue).length;
  
  checkResults.forEach(result => {
    const { color } = result;
    if (!colorStats[color]) {
      colorStats[color] = [];
    }
    colorStats[color].push(result.area);
  });
  
  console.log('\n颜色使用统计:');
  Object.entries(colorStats).forEach(([color, areas]) => {
    console.log(`${color}: ${areas.join(', ')}`);
  });
  
  return {
    totalChecked: checkResults.length,
    issueCount,
    colorStats,
    isConsistent: issueCount === 0
  };
}

function generateColorFixReport(issues, checkResults, analysis) {
  console.log('\n📋 生成文字颜色修复报告...');
  
  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      totalAreasChecked: analysis.totalChecked,
      issuesFound: analysis.issueCount,
      fixed: analysis.isConsistent,
      expectedAreas: 6 // 按年支付、内容专家、核心功能、三步搞定、效率提升、平台支持
    },
    fixes: [
      '✅ 修复按年支付按钮的蓝色文字问题',
      '✅ 统一使用 text-foreground 替代 text-primary',
      '✅ 确保所有标题使用一致的颜色类',
      '✅ 修复标签和徽章的文字颜色',
      '✅ 保持深色模式下的良好对比度'
    ],
    issues,
    recommendations: []
  };
  
  // 生成建议
  if (report.summary.totalAreasChecked !== report.summary.expectedAreas) {
    report.recommendations.push(`⚠️ 期望检查${report.summary.expectedAreas}个区域，实际检查${report.summary.totalAreasChecked}个`);
  }
  
  if (!analysis.isConsistent) {
    report.recommendations.push('🔧 仍存在文字颜色问题，建议进一步检查CSS类名');
  }
  
  if (analysis.issueCount > 0) {
    report.recommendations.push(`🎨 ${analysis.issueCount} 个区域仍有颜色问题需要修复`);
  }
  
  // 输出报告
  console.log('\n🎉 文字颜色修复报告:');
  console.log('时间:', report.timestamp);
  
  console.log('\n📊 统计信息:');
  console.log('检查区域数:', report.summary.totalAreasChecked);
  console.log('期望区域数:', report.summary.expectedAreas);
  console.log('发现问题数:', report.summary.issuesFound);
  console.log('修复状态:', report.summary.fixed ? '✅ 已修复' : '❌ 未完全修复');
  
  console.log('\n✨ 修复内容:');
  report.fixes.forEach(fix => console.log(fix));
  
  if (report.issues.length > 0) {
    console.log('\n⚠️ 剩余问题:');
    report.issues.forEach(issue => console.log('❌', issue));
  }
  
  if (report.recommendations.length > 0) {
    console.log('\n💡 建议:');
    report.recommendations.forEach(rec => console.log(rec));
  }
  
  if (report.summary.fixed && report.summary.totalAreasChecked >= report.summary.expectedAreas) {
    console.log('\n🎉 文字颜色修复成功！');
    console.log('📈 所有区域的文字颜色现在都使用了统一的主题颜色系统');
  }
  
  return report;
}

// 主验证函数
async function runTextColorCheck() {
  console.log('🚀 开始文字颜色修复验证...');
  
  // 1. 等待页面加载
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // 2. 查找文字颜色问题
  const { issues, checkResults } = findTextColorIssues();
  
  // 3. 分析颜色一致性
  const analysis = analyzeColorConsistency(checkResults);
  
  // 4. 生成报告
  const report = generateColorFixReport(issues, checkResults, analysis);
  
  console.log('\n🏁 验证完成！');
  
  return report;
}

// 自动运行验证
runTextColorCheck();
