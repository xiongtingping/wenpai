/**
 * 验证主要功能区域灰色背景层修复
 * 在浏览器控制台中运行此脚本
 */

console.log('🔍 验证主要功能区域灰色背景层修复...');

function findMainFeatureCards() {
  console.log('\n🔍 查找主要功能卡片...');
  
  // 查找主要功能区域的卡片
  const cards = Array.from(document.querySelectorAll('[class*="Card"]')).filter(card => {
    // 检查是否包含主要功能的特征元素
    const hasFeatureIcon = card.querySelector('.main-feature-icon');
    const hasFeatureTitle = card.querySelector('h4, h3, [class*="CardTitle"]');
    const hasFeatureList = card.querySelector('[class*="CheckCircle"]');
    
    return hasFeatureIcon && hasFeatureTitle && hasFeatureList;
  });
  
  console.log(`📊 找到 ${cards.length} 个主要功能卡片`);
  
  return cards.map((card, index) => {
    const title = card.querySelector('h4, h3, [class*="CardTitle"]')?.textContent?.trim() || `功能${index + 1}`;
    return {
      element: card,
      index: index + 1,
      title
    };
  });
}

function checkBackgroundLayers(cards) {
  console.log('\n🎨 检查卡片背景层...');
  
  const results = cards.map((cardInfo) => {
    const { element, index, title } = cardInfo;
    
    console.log(`\n--- 卡片 ${index}: ${title} ---`);
    
    // 查找所有可能的背景层
    const backgroundLayers = Array.from(element.querySelectorAll('div')).filter(div => {
      const style = getComputedStyle(div);
      const classes = div.className;
      
      // 检查是否是背景装饰层
      const isBackgroundLayer = 
        classes.includes('absolute') ||
        classes.includes('inset-0') ||
        style.position === 'absolute' ||
        (style.backgroundColor && style.backgroundColor !== 'rgba(0, 0, 0, 0)') ||
        (style.background && style.background !== 'none' && !classes.includes('main-feature-icon'));
      
      return isBackgroundLayer;
    });
    
    console.log('背景层数量:', backgroundLayers.length);
    
    backgroundLayers.forEach((layer, idx) => {
      const style = getComputedStyle(layer);
      console.log(`背景层 ${idx + 1}:`);
      console.log('  类名:', layer.className);
      console.log('  背景色:', style.backgroundColor);
      console.log('  背景:', style.background);
      console.log('  位置:', style.position);
      console.log('  透明度:', style.opacity);
    });
    
    // 检查卡片本身的背景
    const cardStyle = getComputedStyle(element);
    console.log('\n卡片本身:');
    console.log('  背景色:', cardStyle.backgroundColor);
    console.log('  背景:', cardStyle.background);
    
    return {
      index,
      title,
      backgroundLayerCount: backgroundLayers.length,
      backgroundLayers: backgroundLayers.map(layer => ({
        className: layer.className,
        backgroundColor: getComputedStyle(layer).backgroundColor,
        background: getComputedStyle(layer).background,
        position: getComputedStyle(layer).position,
        opacity: getComputedStyle(layer).opacity
      })),
      cardBackground: {
        backgroundColor: cardStyle.backgroundColor,
        background: cardStyle.background
      }
    };
  });
  
  return results;
}

function analyzeBackgroundIssues(results) {
  console.log('\n🔍 分析背景问题...');
  
  const issues = [];
  const summary = {
    totalCards: results.length,
    cardsWithBackgroundLayers: 0,
    cardsWithGrayBackground: 0,
    cardsWithUnwantedLayers: 0
  };
  
  results.forEach(result => {
    const { index, title, backgroundLayerCount, backgroundLayers, cardBackground } = result;
    
    // 检查是否有背景层
    if (backgroundLayerCount > 0) {
      summary.cardsWithBackgroundLayers++;
      
      // 检查是否有不需要的背景层
      const unwantedLayers = backgroundLayers.filter(layer => {
        return layer.className.includes('absolute') && 
               layer.className.includes('inset-0') &&
               (layer.backgroundColor.includes('rgb') || layer.background.includes('gradient'));
      });
      
      if (unwantedLayers.length > 0) {
        summary.cardsWithUnwantedLayers++;
        issues.push(`卡片 ${index} (${title}) 存在 ${unwantedLayers.length} 个不需要的背景装饰层`);
      }
    }
    
    // 检查是否有灰色背景
    const hasGrayBackground = 
      cardBackground.backgroundColor.includes('rgb') ||
      cardBackground.background.includes('gray') ||
      cardBackground.background.includes('accent');
    
    if (hasGrayBackground) {
      summary.cardsWithGrayBackground++;
      issues.push(`卡片 ${index} (${title}) 卡片本身有灰色背景`);
    }
  });
  
  console.log('\n📊 分析结果:');
  console.log('总卡片数:', summary.totalCards);
  console.log('有背景层的卡片:', summary.cardsWithBackgroundLayers);
  console.log('有灰色背景的卡片:', summary.cardsWithGrayBackground);
  console.log('有不需要背景层的卡片:', summary.cardsWithUnwantedLayers);
  console.log('发现的问题数:', issues.length);
  
  if (issues.length > 0) {
    console.log('\n⚠️ 发现的问题:');
    issues.forEach(issue => console.log('❌', issue));
  }
  
  return {
    summary,
    issues,
    fixed: issues.length === 0
  };
}

function generateBackgroundFixReport(cards, results, analysis) {
  console.log('\n📋 生成背景修复报告...');
  
  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      totalCards: analysis.summary.totalCards,
      expectedCards: 5, // 主要功能区域应该有5个卡片
      fixed: analysis.fixed,
      issueCount: analysis.issues.length
    },
    fixes: [
      '✅ 移除主要功能卡片的背景装饰层',
      '✅ 移除不必要的absolute定位背景div',
      '✅ 移除opacity控制的灰色背景层',
      '✅ 简化卡片结构，移除z-index层级控制',
      '✅ 保持卡片原生背景，确保文字清晰可读'
    ],
    issues: analysis.issues,
    recommendations: []
  };
  
  // 生成建议
  if (report.summary.totalCards !== report.summary.expectedCards) {
    report.recommendations.push(`⚠️ 期望${report.summary.expectedCards}个卡片，实际找到${report.summary.totalCards}个`);
  }
  
  if (!analysis.fixed) {
    report.recommendations.push('🔧 仍存在背景层问题，建议进一步检查CSS规则');
  }
  
  if (analysis.summary.cardsWithUnwantedLayers > 0) {
    report.recommendations.push(`🗑️ ${analysis.summary.cardsWithUnwantedLayers} 个卡片仍有不需要的背景层`);
  }
  
  // 输出报告
  console.log('\n🎉 主要功能区域背景修复报告:');
  console.log('时间:', report.timestamp);
  
  console.log('\n📊 统计信息:');
  console.log('总卡片数:', report.summary.totalCards);
  console.log('期望卡片数:', report.summary.expectedCards);
  console.log('修复状态:', report.summary.fixed ? '✅ 已修复' : '❌ 未完全修复');
  console.log('问题数量:', report.summary.issueCount);
  
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
  
  if (report.summary.fixed && report.summary.totalCards === report.summary.expectedCards) {
    console.log('\n🎉 背景层修复成功！');
    console.log('📈 主要功能卡片现在没有多余的灰色背景层，文字清晰可读');
  }
  
  return report;
}

// 主验证函数
async function runBackgroundFixCheck() {
  console.log('🚀 开始背景层修复验证...');
  
  // 1. 等待页面加载
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // 2. 查找主要功能卡片
  const cards = findMainFeatureCards();
  
  if (cards.length === 0) {
    console.log('❌ 未找到主要功能卡片，请确保在首页运行此脚本');
    return;
  }
  
  // 3. 检查背景层
  const results = checkBackgroundLayers(cards);
  
  // 4. 分析背景问题
  const analysis = analyzeBackgroundIssues(results);
  
  // 5. 生成报告
  const report = generateBackgroundFixReport(cards, results, analysis);
  
  console.log('\n🏁 验证完成！');
  
  return report;
}

// 自动运行验证
runBackgroundFixCheck();
