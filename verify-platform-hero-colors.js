/**
 * 验证平台区域和主标题的文字颜色修复
 * 在浏览器控制台中运行此脚本
 */

console.log('🔍 验证平台区域和主标题文字颜色修复...');

function checkPlatformSectionColors() {
  console.log('\n🌐 检查平台支持区域颜色...');
  
  const issues = [];
  const checkResults = [];
  
  // 1. 检查平台名称文字颜色
  const platformNames = Array.from(document.querySelectorAll('span')).filter(span => {
    const text = span.textContent?.trim();
    return text && (
      text.includes('小红书') || text.includes('微信公众号') || text.includes('知乎') ||
      text.includes('抖音') || text.includes('B站') || text.includes('微博') ||
      text.includes('百家号') || text.includes('快手') || text.includes('网易号') ||
      text.includes('头条号') || text.includes('Facebook') || text.includes('Twitter') ||
      text.includes('LinkedIn') || text.includes('Instagram') || text.includes('豆瓣') ||
      text.includes('视频号')
    );
  });
  
  console.log(`📱 找到 ${platformNames.length} 个平台名称`);
  
  platformNames.forEach((nameElement, index) => {
    const style = getComputedStyle(nameElement);
    const color = style.color;
    const classes = nameElement.className;
    const text = nameElement.textContent.trim();
    
    console.log(`平台 ${index + 1}: ${text}`);
    console.log('  颜色:', color);
    console.log('  类名:', classes);
    
    // 检查是否是刺眼的蓝色
    if (color.includes('rgb(37, 99, 235)') || color.includes('rgb(59, 130, 246)')) {
      issues.push(`平台名称 "${text}" 使用了刺眼的蓝色: ${color}`);
    }
    
    checkResults.push({
      area: '平台名称',
      element: nameElement,
      text,
      color,
      classes,
      hasIssue: color.includes('rgb(37, 99, 235)') || color.includes('rgb(59, 130, 246)')
    });
  });
  
  // 2. 检查平台区域标题
  const platformTitle = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6')).find(h => 
    h.textContent && h.textContent.includes('信赖我们的AI，适配您信赖的平台')
  );
  
  if (platformTitle) {
    const style = getComputedStyle(platformTitle);
    const color = style.color;
    const classes = platformTitle.className;
    
    console.log('\n平台区域标题:');
    console.log('  文字:', platformTitle.textContent.trim());
    console.log('  颜色:', color);
    console.log('  类名:', classes);
    
    if (color.includes('rgb(37, 99, 235)') || color.includes('rgb(59, 130, 246)')) {
      issues.push(`平台区域标题使用了刺眼的蓝色: ${color}`);
    }
    
    checkResults.push({
      area: '平台区域标题',
      element: platformTitle,
      text: platformTitle.textContent.trim(),
      color,
      classes,
      hasIssue: color.includes('rgb(37, 99, 235)') || color.includes('rgb(59, 130, 246)')
    });
  }
  
  // 3. 检查平台支持提示文字
  const platformSupportText = Array.from(document.querySelectorAll('*')).find(el => 
    el.textContent && el.textContent.includes('支持14+主流平台')
  );
  
  if (platformSupportText) {
    const style = getComputedStyle(platformSupportText);
    const color = style.color;
    const classes = platformSupportText.className;
    
    console.log('\n平台支持提示:');
    console.log('  文字:', platformSupportText.textContent.trim());
    console.log('  颜色:', color);
    console.log('  类名:', classes);
    
    if (color.includes('rgb(37, 99, 235)') || color.includes('rgb(59, 130, 246)')) {
      issues.push(`平台支持提示使用了刺眼的蓝色: ${color}`);
    }
    
    checkResults.push({
      area: '平台支持提示',
      element: platformSupportText,
      text: platformSupportText.textContent.trim().substring(0, 50),
      color,
      classes,
      hasIssue: color.includes('rgb(37, 99, 235)') || color.includes('rgb(59, 130, 246)')
    });
  }
  
  return { issues, checkResults };
}

function checkHeroSectionColors() {
  console.log('\n🎯 检查主标题区域颜色...');
  
  const issues = [];
  const checkResults = [];
  
  // 1. 检查主标题"文派 AI 智能创作平台"
  const mainTitle = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6')).find(h => 
    h.textContent && h.textContent.includes('文派 AI 智能创作平台')
  );
  
  if (mainTitle) {
    const style = getComputedStyle(mainTitle);
    const color = style.color;
    const classes = mainTitle.className;
    
    console.log('主标题:');
    console.log('  文字:', mainTitle.textContent.trim());
    console.log('  颜色:', color);
    console.log('  类名:', classes);
    
    if (color.includes('rgb(37, 99, 235)') || color.includes('rgb(59, 130, 246)')) {
      issues.push(`主标题使用了刺眼的蓝色: ${color}`);
    }
    
    checkResults.push({
      area: '主标题',
      element: mainTitle,
      text: mainTitle.textContent.trim(),
      color,
      classes,
      hasIssue: color.includes('rgb(37, 99, 235)') || color.includes('rgb(59, 130, 246)')
    });
  }
  
  // 2. 检查核心价值主张文字
  const valueProposition = Array.from(document.querySelectorAll('*')).find(el => 
    el.textContent && el.textContent.includes('让 AI 为您的品牌创作独特内容')
  );
  
  if (valueProposition) {
    const style = getComputedStyle(valueProposition);
    const color = style.color;
    const classes = valueProposition.className;
    
    console.log('\n核心价值主张:');
    console.log('  文字:', valueProposition.textContent.trim());
    console.log('  颜色:', color);
    console.log('  类名:', classes);
    
    if (color.includes('rgb(37, 99, 235)') || color.includes('rgb(59, 130, 246)')) {
      issues.push(`核心价值主张使用了刺眼的蓝色: ${color}`);
    }
    
    checkResults.push({
      area: '核心价值主张',
      element: valueProposition,
      text: valueProposition.textContent.trim(),
      color,
      classes,
      hasIssue: color.includes('rgb(37, 99, 235)') || color.includes('rgb(59, 130, 246)')
    });
  }
  
  // 3. 检查强调文字（如"3秒内"、"内容调性统一"、"节省80%"）
  const emphasisTexts = Array.from(document.querySelectorAll('span')).filter(span => {
    const text = span.textContent?.trim();
    return text && (
      text.includes('3秒内') || 
      text.includes('内容调性统一') || 
      text.includes('节省80%')
    );
  });
  
  console.log(`\n💡 找到 ${emphasisTexts.length} 个强调文字`);
  
  emphasisTexts.forEach((textElement, index) => {
    const style = getComputedStyle(textElement);
    const color = style.color;
    const classes = textElement.className;
    const text = textElement.textContent.trim();
    
    console.log(`强调文字 ${index + 1}: ${text}`);
    console.log('  颜色:', color);
    console.log('  类名:', classes);
    
    if (color.includes('rgb(37, 99, 235)') || color.includes('rgb(59, 130, 246)')) {
      issues.push(`强调文字 "${text}" 使用了刺眼的蓝色: ${color}`);
    }
    
    checkResults.push({
      area: '强调文字',
      element: textElement,
      text,
      color,
      classes,
      hasIssue: color.includes('rgb(37, 99, 235)') || color.includes('rgb(59, 130, 246)')
    });
  });
  
  return { issues, checkResults };
}

function generateFixReport(platformResults, heroResults) {
  console.log('\n📋 生成修复报告...');
  
  const allIssues = [...platformResults.issues, ...heroResults.issues];
  const allResults = [...platformResults.checkResults, ...heroResults.checkResults];
  
  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      totalChecked: allResults.length,
      issuesFound: allIssues.length,
      fixed: allIssues.length === 0,
      platformChecked: platformResults.checkResults.length,
      heroChecked: heroResults.checkResults.length
    },
    fixes: [
      '✅ 修复HeroSection中主标题的蓝色文字问题',
      '✅ 修复核心价值主张的文字颜色',
      '✅ 修复强调文字（3秒内、内容调性统一、节省80%）的颜色',
      '✅ 确保平台名称使用正确的muted-foreground颜色',
      '✅ 统一使用主题颜色系统，提升视觉一致性'
    ],
    issues: allIssues,
    recommendations: []
  };
  
  // 生成建议
  if (!report.summary.fixed) {
    report.recommendations.push('🔧 仍存在文字颜色问题，建议进一步检查CSS类名');
  }
  
  if (report.summary.issuesFound > 0) {
    report.recommendations.push(`🎨 ${report.summary.issuesFound} 个元素仍有颜色问题需要修复`);
  }
  
  // 输出报告
  console.log('\n🎉 平台区域和主标题颜色修复报告:');
  console.log('时间:', report.timestamp);
  
  console.log('\n📊 统计信息:');
  console.log('总检查元素数:', report.summary.totalChecked);
  console.log('平台区域检查数:', report.summary.platformChecked);
  console.log('主标题区域检查数:', report.summary.heroChecked);
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
  
  if (report.summary.fixed) {
    console.log('\n🎉 颜色修复成功！');
    console.log('📈 平台区域和主标题现在都使用了统一的主题颜色系统');
  }
  
  return report;
}

// 主验证函数
async function runPlatformHeroColorCheck() {
  console.log('🚀 开始平台区域和主标题颜色修复验证...');
  
  // 1. 等待页面加载
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // 2. 检查平台区域颜色
  const platformResults = checkPlatformSectionColors();
  
  // 3. 检查主标题区域颜色
  const heroResults = checkHeroSectionColors();
  
  // 4. 生成报告
  const report = generateFixReport(platformResults, heroResults);
  
  console.log('\n🏁 验证完成！');
  
  return report;
}

// 自动运行验证
runPlatformHeroColorCheck();
