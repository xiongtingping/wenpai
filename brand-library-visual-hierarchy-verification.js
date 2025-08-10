/**
 * 品牌语料库视觉层次优化验证脚本
 * 验证卡片头部与内容区域的视觉区分度
 */

console.log('🎨 开始验证品牌语料库视觉层次优化...');

function verifyBrandLibraryVisualHierarchy() {
  console.log('\n=== 🔍 1. 查找品牌语料库卡片 ===');
  
  // 查找所有品牌卡片
  const brandCards = document.querySelectorAll('.brand-card-header');
  const brandContents = document.querySelectorAll('.brand-card-content');
  const brandDimensions = document.querySelectorAll('.brand-dimension-item');
  const brandIcons = document.querySelectorAll('.icon-container-brand');
  
  console.log(`找到 ${brandCards.length} 个品牌卡片头部`);
  console.log(`找到 ${brandContents.length} 个品牌卡片内容区`);
  console.log(`找到 ${brandDimensions.length} 个品牌维度项`);
  console.log(`找到 ${brandIcons.length} 个品牌图标容器`);
  
  if (brandCards.length === 0) {
    console.log('❌ 未找到品牌卡片，可能样式未正确应用');
    return;
  }
  
  console.log('\n=== 🎯 2. 验证卡片头部样式 ===');
  
  brandCards.forEach((header, index) => {
    const style = getComputedStyle(header);
    const cardTitle = header.querySelector('[class*="CardTitle"]') || header.querySelector('h3');
    const cardName = cardTitle ? cardTitle.textContent.trim() : `卡片${index + 1}`;
    
    console.log(`\n📋 ${cardName} 头部样式:`);
    console.log(`  背景: ${style.background.substring(0, 50)}...`);
    console.log(`  边框底部: ${style.borderBottom}`);
    console.log(`  内边距: ${style.padding}`);
    console.log(`  边框圆角: ${style.borderRadius}`);
    console.log(`  过渡效果: ${style.transition}`);
    
    // 检查关键样式特征
    const hasGradientBg = style.background.includes('gradient') || style.backgroundImage.includes('gradient');
    const hasThickBorder = style.borderBottomWidth && parseFloat(style.borderBottomWidth) >= 2;
    const hasTopRadius = style.borderRadius.includes('px') || style.borderRadius !== '0px';
    const hasTransition = style.transition !== 'none' && style.transition !== '';
    
    let headerScore = 0;
    if (hasGradientBg) { headerScore++; console.log('  ✅ 渐变背景'); }
    if (hasThickBorder) { headerScore++; console.log('  ✅ 加粗边框'); }
    if (hasTopRadius) { headerScore++; console.log('  ✅ 圆角设计'); }
    if (hasTransition) { headerScore++; console.log('  ✅ 过渡动画'); }
    
    console.log(`  📊 头部样式完整度: ${headerScore}/4 (${(headerScore/4*100).toFixed(0)}%)`);
    
    // 检查伪元素（顶部装饰条）
    const beforeStyle = getComputedStyle(header, '::before');
    if (beforeStyle.height && parseFloat(beforeStyle.height) > 0) {
      console.log('  ✅ 顶部装饰条');
    }
  });
  
  console.log('\n=== 🎨 3. 验证图标容器样式 ===');
  
  brandIcons.forEach((icon, index) => {
    const style = getComputedStyle(icon);
    const parentCard = icon.closest('[class*="Card"]');
    const cardTitle = parentCard?.querySelector('[class*="CardTitle"]');
    const cardName = cardTitle ? cardTitle.textContent.trim() : `图标${index + 1}`;
    
    console.log(`\n🎯 ${cardName} 图标容器:`);
    console.log(`  背景: ${style.background.substring(0, 50)}...`);
    console.log(`  颜色: ${style.color}`);
    console.log(`  边框: ${style.border}`);
    console.log(`  阴影: ${style.boxShadow.substring(0, 40)}...`);
    
    // 检查增强的图标样式
    const hasGradientBg = style.background.includes('gradient') || style.backgroundImage.includes('gradient');
    const hasThickBorder = style.borderWidth && parseFloat(style.borderWidth) >= 2;
    const hasBoxShadow = style.boxShadow !== 'none' && style.boxShadow.includes('px');
    const hasWhiteText = style.color.includes('255') || style.color.includes('white');
    
    let iconScore = 0;
    if (hasGradientBg) { iconScore++; console.log('  ✅ 渐变背景'); }
    if (hasThickBorder) { iconScore++; console.log('  ✅ 加粗边框'); }
    if (hasBoxShadow) { iconScore++; console.log('  ✅ 阴影效果'); }
    if (hasWhiteText) { iconScore++; console.log('  ✅ 对比色文字'); }
    
    console.log(`  📊 图标样式完整度: ${iconScore}/4 (${(iconScore/4*100).toFixed(0)}%)`);
  });
  
  console.log('\n=== 📦 4. 验证内容区域样式 ===');
  
  brandContents.forEach((content, index) => {
    const style = getComputedStyle(content);
    const parentCard = content.closest('[class*="Card"]');
    const cardTitle = parentCard?.querySelector('[class*="CardTitle"]');
    const cardName = cardTitle ? cardTitle.textContent.trim() : `内容${index + 1}`;
    
    console.log(`\n📄 ${cardName} 内容区域:`);
    console.log(`  背景: ${style.backgroundColor}`);
    console.log(`  内边距: ${style.padding}`);
    console.log(`  边框圆角: ${style.borderRadius}`);
    
    // 检查内容区域样式
    const hasCardBg = style.backgroundColor !== 'rgba(0, 0, 0, 0)';
    const hasPadding = style.padding !== '0px';
    const hasBottomRadius = style.borderRadius !== '0px';
    
    let contentScore = 0;
    if (hasCardBg) { contentScore++; console.log('  ✅ 背景色'); }
    if (hasPadding) { contentScore++; console.log('  ✅ 内边距'); }
    if (hasBottomRadius) { contentScore++; console.log('  ✅ 底部圆角'); }
    
    console.log(`  📊 内容样式完整度: ${contentScore}/3 (${(contentScore/3*100).toFixed(0)}%)`);
  });
  
  console.log('\n=== 🔧 5. 验证维度项样式 ===');
  
  if (brandDimensions.length > 0) {
    const sampleDimension = brandDimensions[0];
    const style = getComputedStyle(sampleDimension);
    
    console.log(`\n🎛️  维度项样式（样本）:`);
    console.log(`  背景: ${style.background.substring(0, 50)}...`);
    console.log(`  边框: ${style.border}`);
    console.log(`  内边距: ${style.padding}`);
    console.log(`  过渡: ${style.transition}`);
    
    // 检查维度项样式特征
    const hasGradientBg = style.background.includes('gradient') || style.backgroundImage.includes('gradient');
    const hasBorder = style.border !== 'none' && style.border !== '0px none';
    const hasPadding = style.padding !== '0px';
    const hasTransition = style.transition !== 'none' && style.transition !== '';
    
    let dimensionScore = 0;
    if (hasGradientBg) { dimensionScore++; console.log('  ✅ 渐变背景'); }
    if (hasBorder) { dimensionScore++; console.log('  ✅ 边框样式'); }
    if (hasPadding) { dimensionScore++; console.log('  ✅ 内边距'); }
    if (hasTransition) { dimensionScore++; console.log('  ✅ 过渡动画'); }
    
    console.log(`  📊 维度项样式完整度: ${dimensionScore}/4 (${(dimensionScore/4*100).toFixed(0)}%)`);
    
    // 检查伪元素（左侧装饰条）
    const beforeStyle = getComputedStyle(sampleDimension, '::before');
    if (beforeStyle.width && parseFloat(beforeStyle.width) > 0) {
      console.log('  ✅ 左侧装饰条');
    }
  } else {
    console.log('⚠️  未找到维度项，可能需要添加一些内容');
  }
  
  console.log('\n=== 🖱️  6. 测试交互效果 ===');
  
  // 测试悬停效果
  if (brandCards.length > 0 && brandIcons.length > 0) {
    const testHeader = brandCards[0];
    const testIcon = brandIcons[0];
    
    console.log('🎯 测试卡片头部悬停效果...');
    
    // 获取初始样式
    const initialHeaderStyle = getComputedStyle(testHeader);
    const initialIconStyle = getComputedStyle(testIcon);
    
    console.log('初始状态:');
    console.log(`  头部背景: ${initialHeaderStyle.background.substring(0, 30)}...`);
    console.log(`  图标阴影: ${initialIconStyle.boxShadow.substring(0, 30)}...`);
    
    // 模拟悬停
    testHeader.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
    testIcon.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
    
    setTimeout(() => {
      const hoverHeaderStyle = getComputedStyle(testHeader);
      const hoverIconStyle = getComputedStyle(testIcon);
      
      console.log('悬停状态:');
      console.log(`  头部背景: ${hoverHeaderStyle.background.substring(0, 30)}...`);
      console.log(`  图标阴影: ${hoverIconStyle.boxShadow.substring(0, 30)}...`);
      
      const headerChanged = initialHeaderStyle.background !== hoverHeaderStyle.background;
      const iconChanged = initialIconStyle.boxShadow !== hoverIconStyle.boxShadow;
      
      if (headerChanged || iconChanged) {
        console.log('✅ 悬停效果正常工作');
      } else {
        console.log('⚠️  悬停效果可能未生效');
      }
      
      // 恢复初始状态
      testHeader.dispatchEvent(new MouseEvent('mouseleave', { bubbles: true }));
      testIcon.dispatchEvent(new MouseEvent('mouseleave', { bubbles: true }));
    }, 100);
  }
  
  console.log('\n=== 📊 7. 整体评估 ===');
  
  const expectedCards = 4; // 基础信息、语调风格、品牌身份、内容策略
  const foundCards = brandCards.length;
  const foundContents = brandContents.length;
  const foundIcons = brandIcons.length;
  
  let overallScore = 0;
  let maxScore = 5;
  
  // 1. 卡片头部完整性
  if (foundCards === expectedCards) {
    console.log('✅ 卡片头部: 完整 (+1分)');
    overallScore += 1;
  } else {
    console.log('❌ 卡片头部: 不完整 (+0分)');
  }
  
  // 2. 内容区域完整性
  if (foundContents === expectedCards) {
    console.log('✅ 内容区域: 完整 (+1分)');
    overallScore += 1;
  } else {
    console.log('❌ 内容区域: 不完整 (+0分)');
  }
  
  // 3. 图标容器完整性
  if (foundIcons === expectedCards) {
    console.log('✅ 图标容器: 完整 (+1分)');
    overallScore += 1;
  } else {
    console.log('❌ 图标容器: 不完整 (+0分)');
  }
  
  // 4. 维度项样式应用
  if (brandDimensions.length > 0) {
    console.log('✅ 维度项样式: 已应用 (+1分)');
    overallScore += 1;
  } else {
    console.log('❌ 维度项样式: 未应用 (+0分)');
  }
  
  // 5. 视觉层次区分
  const hasVisualHierarchy = foundCards > 0 && foundContents > 0 && foundIcons > 0;
  if (hasVisualHierarchy) {
    console.log('✅ 视觉层次: 已建立 (+1分)');
    overallScore += 1;
  } else {
    console.log('❌ 视觉层次: 未建立 (+0分)');
  }
  
  const percentage = (overallScore / maxScore * 100).toFixed(0);
  console.log(`\n🏆 总体评分: ${overallScore}/${maxScore} (${percentage}%)`);
  
  if (overallScore === maxScore) {
    console.log('🎉 完美！视觉层次优化已成功应用');
  } else if (overallScore >= 4) {
    console.log('👍 很好！大部分优化已完成');
  } else if (overallScore >= 3) {
    console.log('👌 不错！部分优化已完成');
  } else {
    console.log('⚠️  需要检查样式应用情况');
  }
  
  console.log('\n=== 💡 优化效果总结 ===');
  console.log('🎨 卡片头部：渐变背景 + 顶部装饰条 + 加粗边框');
  console.log('🎯 图标容器：主题色渐变 + 增强阴影 + 悬停动画');
  console.log('📦 内容区域：纯净背景 + 合适内边距');
  console.log('🔧 维度项：微妙渐变 + 左侧装饰条 + 悬停效果');
  console.log('✨ 整体效果：清晰的视觉层次，头部与内容区域区分明显');
  
  return {
    foundCards,
    foundContents,
    foundIcons,
    foundDimensions: brandDimensions.length,
    overallScore,
    maxScore,
    percentage: parseInt(percentage)
  };
}

// 等待页面加载后执行
setTimeout(verifyBrandLibraryVisualHierarchy, 1000);
