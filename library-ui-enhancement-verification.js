/**
 * 我的资料库UI增强验证脚本
 * 验证tab按钮和操作按钮的样式优化效果
 */

console.log('🎨 开始验证我的资料库UI增强...');

function verifyLibraryUIEnhancement() {
  console.log('\n=== 🔍 1. 查找UI组件 ===');
  
  // 查找tab相关元素
  const tabsList = document.querySelector('.library-tabs-list');
  const tabTriggers = document.querySelectorAll('.library-tab-trigger');
  const actionButtons = document.querySelectorAll('.library-action-button');
  
  console.log(`Tab列表容器: ${tabsList ? '✅ 找到' : '❌ 未找到'}`);
  console.log(`Tab按钮数量: ${tabTriggers.length} 个`);
  console.log(`操作按钮数量: ${actionButtons.length} 个`);
  
  if (!tabsList && tabTriggers.length === 0 && actionButtons.length === 0) {
    console.log('❌ 未找到任何目标元素，可能样式未正确应用');
    return;
  }
  
  console.log('\n=== 🎯 2. 验证Tab列表容器样式 ===');
  
  if (tabsList) {
    const style = getComputedStyle(tabsList);
    
    console.log('📋 Tab列表容器样式:');
    console.log(`  背景: ${style.background.substring(0, 50)}...`);
    console.log(`  边框: ${style.border}`);
    console.log(`  边框圆角: ${style.borderRadius}`);
    console.log(`  内边距: ${style.padding}`);
    console.log(`  阴影: ${style.boxShadow.substring(0, 30)}...`);
    
    // 检查关键样式特征
    const hasGradientBg = style.background.includes('gradient') || style.backgroundImage.includes('gradient');
    const hasBorder = style.border !== 'none' && style.border !== '0px none';
    const hasBoxShadow = style.boxShadow !== 'none';
    const hasPadding = style.padding !== '0px';
    
    let containerScore = 0;
    if (hasGradientBg) { containerScore++; console.log('  ✅ 渐变背景'); }
    if (hasBorder) { containerScore++; console.log('  ✅ 边框样式'); }
    if (hasBoxShadow) { containerScore++; console.log('  ✅ 阴影效果'); }
    if (hasPadding) { containerScore++; console.log('  ✅ 内边距'); }
    
    console.log(`  📊 容器样式完整度: ${containerScore}/4 (${(containerScore/4*100).toFixed(0)}%)`);
  } else {
    console.log('⚠️  未找到Tab列表容器');
  }
  
  console.log('\n=== 🎨 3. 验证Tab按钮样式 ===');
  
  const expectedTabs = ['全部', '收藏夹', '网络剪藏', '文案管理'];
  
  tabTriggers.forEach((tab, index) => {
    const style = getComputedStyle(tab);
    const tabText = tab.textContent?.trim() || `Tab${index + 1}`;
    const isActive = tab.getAttribute('data-state') === 'active';
    
    console.log(`\n🎯 ${tabText} (${isActive ? '激活' : '未激活'}):`);
    console.log(`  背景: ${style.background.substring(0, 40)}...`);
    console.log(`  颜色: ${style.color}`);
    console.log(`  边框: ${style.border}`);
    console.log(`  字重: ${style.fontWeight}`);
    console.log(`  过渡: ${style.transition}`);
    
    // 检查tab按钮样式特征
    const hasTransition = style.transition !== 'none' && style.transition !== '';
    const hasBorder = style.border !== 'none' && style.border !== '0px none';
    const hasFontWeight = parseInt(style.fontWeight) >= 500;
    const hasProperColor = style.color !== 'rgba(0, 0, 0, 0)';
    
    let tabScore = 0;
    if (hasTransition) { tabScore++; console.log('  ✅ 过渡动画'); }
    if (hasBorder) { tabScore++; console.log('  ✅ 边框样式'); }
    if (hasFontWeight) { tabScore++; console.log('  ✅ 字体加粗'); }
    if (hasProperColor) { tabScore++; console.log('  ✅ 文字颜色'); }
    
    console.log(`  📊 Tab样式完整度: ${tabScore}/4 (${(tabScore/4*100).toFixed(0)}%)`);
    
    // 检查激活状态的特殊样式
    if (isActive) {
      const hasActiveBackground = style.background.includes('gradient') || style.backgroundColor !== 'rgba(0, 0, 0, 0)';
      const hasActiveBoxShadow = style.boxShadow !== 'none';
      
      if (hasActiveBackground) console.log('  ✅ 激活状态背景');
      if (hasActiveBoxShadow) console.log('  ✅ 激活状态阴影');
      
      // 检查伪元素（底部装饰条）
      const afterStyle = getComputedStyle(tab, '::after');
      if (afterStyle.height && parseFloat(afterStyle.height) > 0) {
        console.log('  ✅ 底部装饰条');
      }
    }
  });
  
  console.log('\n=== 🔧 4. 验证操作按钮样式 ===');
  
  const expectedButtons = ['添加收藏', '创建文案', '导出资料'];
  
  actionButtons.forEach((button, index) => {
    const style = getComputedStyle(button);
    const buttonText = button.textContent?.trim() || `按钮${index + 1}`;
    
    console.log(`\n🎛️  ${buttonText}:`);
    console.log(`  背景: ${style.background.substring(0, 40)}...`);
    console.log(`  颜色: ${style.color}`);
    console.log(`  边框: ${style.border}`);
    console.log(`  阴影: ${style.boxShadow.substring(0, 30)}...`);
    console.log(`  过渡: ${style.transition}`);
    
    // 检查操作按钮样式特征
    const hasBackground = style.backgroundColor !== 'rgba(0, 0, 0, 0)' || style.background.includes('hsl');
    const hasBorder = style.border !== 'none' && style.border !== '0px none';
    const hasBoxShadow = style.boxShadow !== 'none';
    const hasTransition = style.transition !== 'none' && style.transition !== '';
    
    let buttonScore = 0;
    if (hasBackground) { buttonScore++; console.log('  ✅ 背景色'); }
    if (hasBorder) { buttonScore++; console.log('  ✅ 边框样式'); }
    if (hasBoxShadow) { buttonScore++; console.log('  ✅ 阴影效果'); }
    if (hasTransition) { buttonScore++; console.log('  ✅ 过渡动画'); }
    
    console.log(`  📊 按钮样式完整度: ${buttonScore}/4 (${(buttonScore/4*100).toFixed(0)}%)`);
  });
  
  console.log('\n=== 🖱️  5. 测试交互效果 ===');
  
  // 测试tab按钮悬停效果
  if (tabTriggers.length > 0) {
    const testTab = Array.from(tabTriggers).find(tab => tab.getAttribute('data-state') !== 'active') || tabTriggers[0];
    
    console.log('🎯 测试Tab按钮悬停效果...');
    
    const initialStyle = getComputedStyle(testTab);
    console.log(`初始背景: ${initialStyle.background.substring(0, 30)}...`);
    
    // 模拟悬停
    testTab.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
    
    setTimeout(() => {
      const hoverStyle = getComputedStyle(testTab);
      console.log(`悬停背景: ${hoverStyle.background.substring(0, 30)}...`);
      
      const backgroundChanged = initialStyle.background !== hoverStyle.background;
      if (backgroundChanged) {
        console.log('✅ Tab悬停效果正常工作');
      } else {
        console.log('⚠️  Tab悬停效果可能未生效');
      }
      
      testTab.dispatchEvent(new MouseEvent('mouseleave', { bubbles: true }));
    }, 100);
  }
  
  // 测试操作按钮悬停效果
  if (actionButtons.length > 0) {
    const testButton = actionButtons[0];
    
    console.log('🎯 测试操作按钮悬停效果...');
    
    const initialStyle = getComputedStyle(testButton);
    console.log(`初始阴影: ${initialStyle.boxShadow.substring(0, 30)}...`);
    
    // 模拟悬停
    testButton.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
    
    setTimeout(() => {
      const hoverStyle = getComputedStyle(testButton);
      console.log(`悬停阴影: ${hoverStyle.boxShadow.substring(0, 30)}...`);
      
      const shadowChanged = initialStyle.boxShadow !== hoverStyle.boxShadow;
      if (shadowChanged) {
        console.log('✅ 按钮悬停效果正常工作');
      } else {
        console.log('⚠️  按钮悬停效果可能未生效');
      }
      
      testButton.dispatchEvent(new MouseEvent('mouseleave', { bubbles: true }));
    }, 100);
  }
  
  console.log('\n=== 🎨 6. 检查颜色一致性 ===');
  
  // 检查操作按钮的颜色是否统一
  const buttonBackgrounds = Array.from(actionButtons).map(btn => {
    const style = getComputedStyle(btn);
    return style.backgroundColor;
  });
  
  const uniqueBackgrounds = [...new Set(buttonBackgrounds)];
  console.log(`操作按钮背景色数量: ${uniqueBackgrounds.length}`);
  
  if (uniqueBackgrounds.length === 1) {
    console.log('✅ 操作按钮背景色统一');
    console.log(`  统一背景色: ${uniqueBackgrounds[0]}`);
  } else {
    console.log('❌ 操作按钮背景色不统一');
    uniqueBackgrounds.forEach((bg, index) => {
      console.log(`  背景色 ${index + 1}: ${bg}`);
    });
  }
  
  console.log('\n=== 📊 7. 整体评估 ===');
  
  let overallScore = 0;
  let maxScore = 5;
  
  // 1. Tab列表容器样式
  if (tabsList) {
    console.log('✅ Tab列表容器: 已应用 (+1分)');
    overallScore += 1;
  } else {
    console.log('❌ Tab列表容器: 未应用 (+0分)');
  }
  
  // 2. Tab按钮数量
  if (tabTriggers.length === 4) {
    console.log('✅ Tab按钮数量: 正确 (+1分)');
    overallScore += 1;
  } else {
    console.log('❌ Tab按钮数量: 不正确 (+0分)');
  }
  
  // 3. 操作按钮数量
  if (actionButtons.length === 3) {
    console.log('✅ 操作按钮数量: 正确 (+1分)');
    overallScore += 1;
  } else {
    console.log('❌ 操作按钮数量: 不正确 (+0分)');
  }
  
  // 4. 按钮颜色统一性
  if (uniqueBackgrounds.length === 1) {
    console.log('✅ 按钮颜色统一: 完成 (+1分)');
    overallScore += 1;
  } else {
    console.log('❌ 按钮颜色统一: 未完成 (+0分)');
  }
  
  // 5. 整体视觉增强
  const hasEnhancedUI = tabsList && tabTriggers.length > 0 && actionButtons.length > 0;
  if (hasEnhancedUI) {
    console.log('✅ 整体UI增强: 已完成 (+1分)');
    overallScore += 1;
  } else {
    console.log('❌ 整体UI增强: 未完成 (+0分)');
  }
  
  const percentage = (overallScore / maxScore * 100).toFixed(0);
  console.log(`\n🏆 总体评分: ${overallScore}/${maxScore} (${percentage}%)`);
  
  if (overallScore === maxScore) {
    console.log('🎉 完美！我的资料库UI增强已成功应用');
  } else if (overallScore >= 4) {
    console.log('👍 很好！大部分UI增强已完成');
  } else if (overallScore >= 3) {
    console.log('👌 不错！部分UI增强已完成');
  } else {
    console.log('⚠️  需要检查UI增强应用情况');
  }
  
  console.log('\n=== 💡 优化效果总结 ===');
  console.log('🎨 Tab按钮：渐变背景 + 增强边框 + 激活状态装饰条');
  console.log('🎯 Tab容器：渐变背景 + 阴影效果 + 圆角设计');
  console.log('🔧 操作按钮：统一背景色 + 悬停动画 + 阴影效果');
  console.log('✨ 整体效果：更明显的视觉层次，统一的设计语言');
  
  return {
    tabsList: !!tabsList,
    tabTriggers: tabTriggers.length,
    actionButtons: actionButtons.length,
    colorUnified: uniqueBackgrounds.length === 1,
    overallScore,
    maxScore,
    percentage: parseInt(percentage)
  };
}

// 等待页面加载后执行
setTimeout(verifyLibraryUIEnhancement, 1000);
