/**
 * 品牌语料库卡片样式验证脚本
 * 在浏览器控制台中运行，验证新的设计令牌是否正确应用
 */

console.log('🎨 品牌语料库卡片样式验证开始...');

function verifyBrandCardStyles() {
  console.log('\n=== 🔍 查找品牌语料库卡片 ===');
  
  // 查找所有品牌卡片头部
  const brandCardHeaders = document.querySelectorAll('.brand-card-header');
  const iconContainers = document.querySelectorAll('.icon-container-brand');
  
  console.log(`找到 ${brandCardHeaders.length} 个品牌卡片头部`);
  console.log(`找到 ${iconContainers.length} 个品牌图标容器`);
  
  if (brandCardHeaders.length === 0) {
    console.log('❌ 未找到品牌卡片头部，可能样式未正确应用');
    return;
  }
  
  console.log('\n=== 🎯 验证卡片头部样式 ===');
  
  brandCardHeaders.forEach((header, index) => {
    const style = getComputedStyle(header);
    const cardTitle = header.querySelector('[class*="CardTitle"]') || header.querySelector('h3');
    const cardName = cardTitle ? cardTitle.textContent.trim() : `卡片${index + 1}`;
    
    console.log(`\n📋 ${cardName}:`);
    console.log(`  背景: ${style.background.substring(0, 50)}...`);
    console.log(`  边框: ${style.borderBottom}`);
    console.log(`  过渡: ${style.transition}`);
    
    // 检查是否有渐变背景
    const hasGradient = style.background.includes('gradient') || style.backgroundImage.includes('gradient');
    if (hasGradient) {
      console.log('  ✅ 渐变背景已应用');
    } else {
      console.log('  ⚠️  可能缺少渐变背景');
    }
  });
  
  console.log('\n=== 🎨 验证图标容器样式 ===');
  
  iconContainers.forEach((container, index) => {
    const style = getComputedStyle(container);
    const parentCard = container.closest('[class*="Card"]');
    const cardTitle = parentCard?.querySelector('[class*="CardTitle"]');
    const cardName = cardTitle ? cardTitle.textContent.trim() : `图标${index + 1}`;
    
    console.log(`\n🎯 ${cardName} 图标容器:`);
    console.log(`  背景: ${style.background.substring(0, 50)}...`);
    console.log(`  颜色: ${style.color}`);
    console.log(`  边框: ${style.border}`);
    console.log(`  阴影: ${style.boxShadow.substring(0, 30)}...`);
    console.log(`  过渡: ${style.transition}`);
    
    // 检查关键样式属性
    const hasGradient = style.background.includes('gradient') || style.backgroundImage.includes('gradient');
    const hasBorder = style.border !== 'none' && style.border !== '0px none';
    const hasBoxShadow = style.boxShadow !== 'none';
    const hasTransition = style.transition !== 'none' && style.transition !== '';
    
    let score = 0;
    if (hasGradient) { score++; console.log('  ✅ 渐变背景'); }
    if (hasBorder) { score++; console.log('  ✅ 边框样式'); }
    if (hasBoxShadow) { score++; console.log('  ✅ 阴影效果'); }
    if (hasTransition) { score++; console.log('  ✅ 过渡动画'); }
    
    console.log(`  📊 样式完整度: ${score}/4 (${(score/4*100).toFixed(0)}%)`);
  });
  
  console.log('\n=== 🖱️  测试悬停效果 ===');
  
  // 模拟悬停效果测试
  if (iconContainers.length > 0) {
    const firstContainer = iconContainers[0];
    console.log('🎯 测试第一个图标容器的悬停效果...');
    
    // 获取初始样式
    const initialStyle = getComputedStyle(firstContainer);
    const initialTransform = initialStyle.transform;
    const initialBoxShadow = initialStyle.boxShadow;
    
    console.log('初始状态:');
    console.log(`  transform: ${initialTransform}`);
    console.log(`  box-shadow: ${initialBoxShadow.substring(0, 30)}...`);
    
    // 模拟悬停
    firstContainer.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
    
    setTimeout(() => {
      const hoverStyle = getComputedStyle(firstContainer);
      const hoverTransform = hoverStyle.transform;
      const hoverBoxShadow = hoverStyle.boxShadow;
      
      console.log('悬停状态:');
      console.log(`  transform: ${hoverTransform}`);
      console.log(`  box-shadow: ${hoverBoxShadow.substring(0, 30)}...`);
      
      const transformChanged = initialTransform !== hoverTransform;
      const shadowChanged = initialBoxShadow !== hoverBoxShadow;
      
      if (transformChanged || shadowChanged) {
        console.log('✅ 悬停效果正常工作');
      } else {
        console.log('⚠️  悬停效果可能未生效');
      }
      
      // 恢复初始状态
      firstContainer.dispatchEvent(new MouseEvent('mouseleave', { bubbles: true }));
    }, 100);
  }
  
  console.log('\n=== 🎨 颜色对比度检查 ===');
  
  iconContainers.forEach((container, index) => {
    const style = getComputedStyle(container);
    const parentCard = container.closest('[class*="Card"]');
    const cardTitle = parentCard?.querySelector('[class*="CardTitle"]');
    const cardName = cardTitle ? cardTitle.textContent.trim() : `图标${index + 1}`;
    
    // 简单的颜色对比度检查
    const backgroundColor = style.backgroundColor;
    const color = style.color;
    
    console.log(`\n🎨 ${cardName} 颜色对比:`);
    console.log(`  背景色: ${backgroundColor}`);
    console.log(`  文字色: ${color}`);
    
    // 检查是否使用了CSS变量
    const usesVariables = style.background.includes('var(') || style.color.includes('var(');
    if (usesVariables) {
      console.log('  ✅ 使用了CSS变量（设计令牌）');
    } else {
      console.log('  ⚠️  可能未使用设计令牌');
    }
  });
  
  console.log('\n=== 📊 整体评估 ===');
  
  const totalCards = 4; // 基础信息、语调风格、品牌身份、内容策略
  const foundCards = brandCardHeaders.length;
  const foundIcons = iconContainers.length;
  
  console.log(`预期卡片数量: ${totalCards}`);
  console.log(`找到的卡片头部: ${foundCards}`);
  console.log(`找到的图标容器: ${foundIcons}`);
  
  let overallScore = 0;
  let maxScore = 3;
  
  // 卡片头部完整性
  if (foundCards === totalCards) {
    console.log('✅ 卡片头部: 完整 (+1分)');
    overallScore += 1;
  } else {
    console.log('❌ 卡片头部: 不完整 (+0分)');
  }
  
  // 图标容器完整性
  if (foundIcons === totalCards) {
    console.log('✅ 图标容器: 完整 (+1分)');
    overallScore += 1;
  } else {
    console.log('❌ 图标容器: 不完整 (+0分)');
  }
  
  // 样式应用检查
  const hasNewStyles = foundCards > 0 && foundIcons > 0;
  if (hasNewStyles) {
    console.log('✅ 新样式: 已应用 (+1分)');
    overallScore += 1;
  } else {
    console.log('❌ 新样式: 未应用 (+0分)');
  }
  
  const percentage = (overallScore / maxScore * 100).toFixed(0);
  console.log(`\n🏆 总体评分: ${overallScore}/${maxScore} (${percentage}%)`);
  
  if (overallScore === maxScore) {
    console.log('🎉 完美！新的设计令牌已成功应用');
  } else if (overallScore >= 2) {
    console.log('👍 很好！大部分样式已正确应用');
  } else {
    console.log('⚠️  需要检查样式应用情况');
  }
  
  console.log('\n=== 💡 优化建议 ===');
  
  if (foundCards < totalCards) {
    console.log('- 检查是否所有卡片都使用了 brand-card-header 类');
  }
  
  if (foundIcons < totalCards) {
    console.log('- 检查是否所有图标容器都使用了 icon-container-brand 类');
  }
  
  console.log('- 可以尝试悬停卡片头部和图标容器查看交互效果');
  console.log('- 新的样式使用了渐变背景，比原来的蓝色条更加优雅');
  
  return {
    foundCards,
    foundIcons,
    overallScore,
    maxScore,
    percentage: parseInt(percentage)
  };
}

// 等待页面加载后执行
setTimeout(verifyBrandCardStyles, 1000);
