/**
 * 统一Tab设计验证脚本
 * 验证所有二级页面的tab UI统一性
 */

console.log('🎨 开始验证统一Tab设计...');

function verifyUnifiedTabsDesign() {
  console.log('\n=== 🔍 1. 查找统一Tab组件 ===');
  
  // 查找统一样式的tab组件
  const unifiedTabsLists = document.querySelectorAll('.unified-tabs-list');
  const unifiedTabTriggers = document.querySelectorAll('.unified-tab-trigger');
  const tabIcons = document.querySelectorAll('.tab-icon');
  const tabTextMobile = document.querySelectorAll('.tab-text-mobile');
  const tabTextDesktop = document.querySelectorAll('.tab-text-desktop');
  
  console.log(`统一Tab列表容器: ${unifiedTabsLists.length} 个`);
  console.log(`统一Tab按钮: ${unifiedTabTriggers.length} 个`);
  console.log(`Tab图标: ${tabIcons.length} 个`);
  console.log(`移动端文字: ${tabTextMobile.length} 个`);
  console.log(`桌面端文字: ${tabTextDesktop.length} 个`);
  
  // 查找旧样式的tab组件（应该被替换）
  const oldTabsLists = document.querySelectorAll('div[class*="TabsList"]:not(.unified-tabs-list)');
  const oldTabTriggers = document.querySelectorAll('button[class*="TabsTrigger"]:not(.unified-tab-trigger)');
  
  console.log(`旧样式Tab列表: ${oldTabsLists.length} 个`);
  console.log(`旧样式Tab按钮: ${oldTabTriggers.length} 个`);
  
  if (unifiedTabsLists.length === 0) {
    console.log('❌ 未找到任何统一Tab组件');
    return;
  }
  
  console.log('\n=== 🎯 2. 验证Tab列表容器统一性 ===');
  
  const containerStyles = [];
  unifiedTabsLists.forEach((container, index) => {
    const style = getComputedStyle(container);
    const containerInfo = {
      index: index + 1,
      background: style.background,
      border: style.border,
      borderRadius: style.borderRadius,
      padding: style.padding,
      boxShadow: style.boxShadow
    };
    
    containerStyles.push(containerInfo);
    
    console.log(`\n📦 容器 ${index + 1}:`);
    console.log(`  背景: ${style.background.substring(0, 40)}...`);
    console.log(`  边框: ${style.border}`);
    console.log(`  圆角: ${style.borderRadius}`);
    console.log(`  内边距: ${style.padding}`);
    console.log(`  阴影: ${style.boxShadow.substring(0, 30)}...`);
  });
  
  // 检查容器样式一致性
  const uniqueBackgrounds = [...new Set(containerStyles.map(s => s.background))];
  const uniqueBorders = [...new Set(containerStyles.map(s => s.border))];
  const uniquePaddings = [...new Set(containerStyles.map(s => s.padding))];
  
  console.log(`\n📊 容器样式一致性:`);
  console.log(`  背景样式数量: ${uniqueBackgrounds.length} (期望: 1)`);
  console.log(`  边框样式数量: ${uniqueBorders.length} (期望: 1)`);
  console.log(`  内边距样式数量: ${uniquePaddings.length} (期望: 1)`);
  
  const containerConsistency = uniqueBackgrounds.length === 1 && uniqueBorders.length === 1 && uniquePaddings.length === 1;
  if (containerConsistency) {
    console.log('✅ 容器样式完全一致');
  } else {
    console.log('❌ 容器样式存在差异');
  }
  
  console.log('\n=== 🎨 3. 验证Tab按钮统一性 ===');
  
  const buttonStyles = [];
  unifiedTabTriggers.forEach((button, index) => {
    const style = getComputedStyle(button);
    const isActive = button.getAttribute('data-state') === 'active';
    const buttonText = button.textContent?.trim() || `按钮${index + 1}`;
    
    const buttonInfo = {
      index: index + 1,
      text: buttonText,
      isActive,
      background: style.background,
      color: style.color,
      padding: style.padding,
      fontSize: style.fontSize,
      fontWeight: style.fontWeight
    };
    
    buttonStyles.push(buttonInfo);
    
    console.log(`\n🎯 ${buttonText} (${isActive ? '激活' : '未激活'}):`);
    console.log(`  背景: ${style.background.substring(0, 30)}...`);
    console.log(`  颜色: ${style.color}`);
    console.log(`  内边距: ${style.padding}`);
    console.log(`  字体大小: ${style.fontSize}`);
    console.log(`  字体粗细: ${style.fontWeight}`);
  });
  
  // 检查按钮样式一致性（分激活和未激活状态）
  const activeButtons = buttonStyles.filter(b => b.isActive);
  const inactiveButtons = buttonStyles.filter(b => !b.isActive);
  
  const uniqueActiveBgs = [...new Set(activeButtons.map(b => b.background))];
  const uniqueInactiveBgs = [...new Set(inactiveButtons.map(b => b.background))];
  const uniqueFontSizes = [...new Set(buttonStyles.map(b => b.fontSize))];
  const uniquePaddings2 = [...new Set(buttonStyles.map(b => b.padding))];
  
  console.log(`\n📊 按钮样式一致性:`);
  console.log(`  激活状态背景数量: ${uniqueActiveBgs.length} (期望: 1)`);
  console.log(`  未激活状态背景数量: ${uniqueInactiveBgs.length} (期望: 1)`);
  console.log(`  字体大小数量: ${uniqueFontSizes.length} (期望: 1)`);
  console.log(`  内边距数量: ${uniquePaddings2.length} (期望: 1)`);
  
  const buttonConsistency = uniqueActiveBgs.length <= 1 && uniqueInactiveBgs.length <= 1 && 
                           uniqueFontSizes.length === 1 && uniquePaddings2.length === 1;
  if (buttonConsistency) {
    console.log('✅ 按钮样式完全一致');
  } else {
    console.log('❌ 按钮样式存在差异');
  }
  
  console.log('\n=== 🔍 4. 验证图标统一性 ===');
  
  tabIcons.forEach((icon, index) => {
    const style = getComputedStyle(icon);
    const parentButton = icon.closest('.unified-tab-trigger');
    const buttonText = parentButton?.textContent?.trim() || `图标${index + 1}`;
    
    console.log(`\n🎨 ${buttonText} 图标:`);
    console.log(`  宽度: ${style.width}`);
    console.log(`  高度: ${style.height}`);
    console.log(`  flex-shrink: ${style.flexShrink}`);
  });
  
  const iconWidths = Array.from(tabIcons).map(icon => getComputedStyle(icon).width);
  const iconHeights = Array.from(tabIcons).map(icon => getComputedStyle(icon).height);
  const uniqueWidths = [...new Set(iconWidths)];
  const uniqueHeights = [...new Set(iconHeights)];
  
  console.log(`\n📊 图标尺寸一致性:`);
  console.log(`  图标宽度数量: ${uniqueWidths.length} (期望: 1-2, 响应式)`);
  console.log(`  图标高度数量: ${uniqueHeights.length} (期望: 1-2, 响应式)`);
  
  const iconConsistency = uniqueWidths.length <= 2 && uniqueHeights.length <= 2;
  if (iconConsistency) {
    console.log('✅ 图标尺寸一致（支持响应式）');
  } else {
    console.log('❌ 图标尺寸不一致');
  }
  
  console.log('\n=== 📱 5. 验证响应式文字显示 ===');
  
  const windowWidth = window.innerWidth;
  const isMobile = windowWidth < 640;
  
  console.log(`当前窗口宽度: ${windowWidth}px (${isMobile ? '移动端' : '桌面端'})`);
  
  tabTextMobile.forEach((text, index) => {
    const style = getComputedStyle(text);
    const isVisible = style.display !== 'none';
    const parentButton = text.closest('.unified-tab-trigger');
    const buttonText = parentButton?.textContent?.trim() || `移动文字${index + 1}`;
    
    console.log(`📱 ${buttonText} 移动端文字: ${isVisible ? '显示' : '隐藏'}`);
  });
  
  tabTextDesktop.forEach((text, index) => {
    const style = getComputedStyle(text);
    const isVisible = style.display !== 'none';
    const parentButton = text.closest('.unified-tab-trigger');
    const buttonText = parentButton?.textContent?.trim() || `桌面文字${index + 1}`;
    
    console.log(`🖥️  ${buttonText} 桌面端文字: ${isVisible ? '显示' : '隐藏'}`);
  });
  
  console.log('\n=== 🖱️  6. 测试交互效果 ===');
  
  if (unifiedTabTriggers.length > 0) {
    const testButton = Array.from(unifiedTabTriggers).find(btn => 
      btn.getAttribute('data-state') !== 'active'
    ) || unifiedTabTriggers[0];
    
    console.log('🎯 测试Tab按钮悬停效果...');
    
    const initialStyle = getComputedStyle(testButton);
    console.log(`初始背景: ${initialStyle.background.substring(0, 30)}...`);
    
    // 模拟悬停
    testButton.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
    
    setTimeout(() => {
      const hoverStyle = getComputedStyle(testButton);
      console.log(`悬停背景: ${hoverStyle.background.substring(0, 30)}...`);
      
      const backgroundChanged = initialStyle.background !== hoverStyle.background;
      if (backgroundChanged) {
        console.log('✅ 悬停效果正常工作');
      } else {
        console.log('⚠️  悬停效果可能未生效');
      }
      
      testButton.dispatchEvent(new MouseEvent('mouseleave', { bubbles: true }));
    }, 100);
  }
  
  console.log('\n=== 📊 7. 整体评估 ===');
  
  let unificationScore = 0;
  let maxScore = 6;
  
  // 1. 统一Tab组件数量
  if (unifiedTabsLists.length > 0) {
    console.log('✅ 统一Tab组件: 已应用 (+1分)');
    unificationScore += 1;
  } else {
    console.log('❌ 统一Tab组件: 未应用 (+0分)');
  }
  
  // 2. 容器样式一致性
  if (containerConsistency) {
    console.log('✅ 容器样式一致性: 完美 (+1分)');
    unificationScore += 1;
  } else {
    console.log('❌ 容器样式一致性: 存在差异 (+0分)');
  }
  
  // 3. 按钮样式一致性
  if (buttonConsistency) {
    console.log('✅ 按钮样式一致性: 完美 (+1分)');
    unificationScore += 1;
  } else {
    console.log('❌ 按钮样式一致性: 存在差异 (+0分)');
  }
  
  // 4. 图标统一性
  if (iconConsistency) {
    console.log('✅ 图标统一性: 完美 (+1分)');
    unificationScore += 1;
  } else {
    console.log('❌ 图标统一性: 存在差异 (+0分)');
  }
  
  // 5. 响应式支持
  const hasResponsiveText = tabTextMobile.length > 0 || tabTextDesktop.length > 0;
  if (hasResponsiveText) {
    console.log('✅ 响应式支持: 已实现 (+1分)');
    unificationScore += 1;
  } else {
    console.log('❌ 响应式支持: 未实现 (+0分)');
  }
  
  // 6. 旧样式清理
  const oldStylesCleared = oldTabsLists.length === 0 && oldTabTriggers.length === 0;
  if (oldStylesCleared) {
    console.log('✅ 旧样式清理: 完成 (+1分)');
    unificationScore += 1;
  } else {
    console.log('❌ 旧样式清理: 未完成 (+0分)');
  }
  
  const percentage = (unificationScore / maxScore * 100).toFixed(0);
  console.log(`\n🏆 统一化评分: ${unificationScore}/${maxScore} (${percentage}%)`);
  
  if (unificationScore === maxScore) {
    console.log('🎉 完美！所有Tab页面已完全统一');
  } else if (unificationScore >= 5) {
    console.log('👍 很好！Tab统一化基本完成');
  } else if (unificationScore >= 4) {
    console.log('👌 不错！大部分Tab已统一');
  } else {
    console.log('⚠️  需要进一步统一Tab设计');
  }
  
  console.log('\n=== 💡 统一化效果总结 ===');
  console.log('🎨 统一容器：渐变背景 + 边框 + 阴影 + 毛玻璃效果');
  console.log('🎯 统一按钮：一致的内边距 + 字体 + 过渡动画');
  console.log('🔍 统一图标：响应式尺寸 + flex布局');
  console.log('📱 响应式文字：移动端简化 + 桌面端完整');
  console.log('✨ 整体效果：所有页面Tab具有一致的视觉语言');
  
  return {
    unifiedContainers: unifiedTabsLists.length,
    unifiedButtons: unifiedTabTriggers.length,
    oldContainers: oldTabsLists.length,
    oldButtons: oldTabTriggers.length,
    containerConsistency,
    buttonConsistency,
    iconConsistency,
    unificationScore,
    maxScore,
    percentage: parseInt(percentage)
  };
}

// 等待页面加载后执行
setTimeout(verifyUnifiedTabsDesign, 1000);
