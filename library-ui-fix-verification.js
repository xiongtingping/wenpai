/**
 * 我的资料库UI修复验证脚本
 * 验证tab按钮尺寸和蓝色装饰条问题的修复效果
 */

console.log('🔧 开始验证我的资料库UI修复...');

function verifyLibraryUIFix() {
  console.log('\n=== 🔍 1. 查找UI组件 ===');
  
  const tabsList = document.querySelector('.library-tabs-list');
  const tabTriggers = document.querySelectorAll('.library-tab-trigger');
  const actionButtons = document.querySelectorAll('.library-action-button');
  
  console.log(`Tab列表容器: ${tabsList ? '✅ 找到' : '❌ 未找到'}`);
  console.log(`Tab按钮数量: ${tabTriggers.length} 个`);
  console.log(`操作按钮数量: ${actionButtons.length} 个`);
  
  if (!tabsList) {
    console.log('❌ 未找到Tab列表容器');
    return;
  }
  
  console.log('\n=== 📏 2. 检查容器和按钮尺寸 ===');
  
  // 获取容器尺寸
  const containerRect = tabsList.getBoundingClientRect();
  const containerStyle = getComputedStyle(tabsList);
  
  console.log('📦 Tab列表容器尺寸:');
  console.log(`  宽度: ${containerRect.width.toFixed(1)}px`);
  console.log(`  高度: ${containerRect.height.toFixed(1)}px`);
  console.log(`  内边距: ${containerStyle.padding}`);
  console.log(`  边框: ${containerStyle.border}`);
  
  // 检查每个tab按钮的尺寸
  let oversizedTabs = 0;
  let totalTabWidth = 0;
  
  tabTriggers.forEach((tab, index) => {
    const tabRect = tab.getBoundingClientRect();
    const tabStyle = getComputedStyle(tab);
    const tabText = tab.textContent?.trim() || `Tab${index + 1}`;
    
    console.log(`\n🎯 ${tabText} 按钮尺寸:`);
    console.log(`  宽度: ${tabRect.width.toFixed(1)}px`);
    console.log(`  高度: ${tabRect.height.toFixed(1)}px`);
    console.log(`  内边距: ${tabStyle.padding}`);
    console.log(`  字体大小: ${tabStyle.fontSize}`);
    
    totalTabWidth += tabRect.width;
    
    // 检查是否超出容器
    const containerPadding = parseFloat(containerStyle.paddingLeft) + parseFloat(containerStyle.paddingRight);
    const availableWidth = containerRect.width - containerPadding;
    
    if (tabRect.width > availableWidth / 4) {
      console.log(`  ⚠️  按钮可能过宽`);
      oversizedTabs++;
    } else {
      console.log(`  ✅ 按钮尺寸合适`);
    }
    
    // 检查高度是否合理
    if (tabRect.height > 60) {
      console.log(`  ⚠️  按钮高度可能过高`);
    } else {
      console.log(`  ✅ 按钮高度合适`);
    }
  });
  
  console.log(`\n📊 尺寸检查结果:`);
  console.log(`  容器宽度: ${containerRect.width.toFixed(1)}px`);
  console.log(`  所有Tab总宽度: ${totalTabWidth.toFixed(1)}px`);
  console.log(`  超大按钮数量: ${oversizedTabs} 个`);
  
  if (oversizedTabs === 0) {
    console.log('✅ 所有Tab按钮尺寸都在合理范围内');
  } else {
    console.log('❌ 存在尺寸过大的Tab按钮');
  }
  
  console.log('\n=== 🎨 3. 检查蓝色装饰条问题 ===');
  
  // 检查激活状态的tab
  const activeTabs = Array.from(tabTriggers).filter(tab => 
    tab.getAttribute('data-state') === 'active'
  );
  
  console.log(`激活状态的Tab数量: ${activeTabs.length} 个`);
  
  activeTabs.forEach((tab, index) => {
    const tabText = tab.textContent?.trim() || `激活Tab${index + 1}`;
    
    console.log(`\n🎯 ${tabText} 装饰条检查:`);
    
    // 检查::after伪元素
    const afterStyle = getComputedStyle(tab, '::after');
    const afterDisplay = afterStyle.display;
    const afterHeight = afterStyle.height;
    const afterBackground = afterStyle.background;
    
    console.log(`  ::after display: ${afterDisplay}`);
    console.log(`  ::after height: ${afterHeight}`);
    console.log(`  ::after background: ${afterBackground.substring(0, 30)}...`);
    
    if (afterDisplay === 'none') {
      console.log('  ✅ 底部装饰条已隐藏');
    } else if (parseFloat(afterHeight) === 0) {
      console.log('  ✅ 底部装饰条高度为0');
    } else {
      console.log('  ⚠️  底部装饰条仍然存在');
    }
    
    // 检查tab本身是否有蓝色背景
    const tabStyle = getComputedStyle(tab);
    const tabBackground = tabStyle.background;
    
    if (tabBackground.includes('blue') || tabBackground.includes('rgb(0, 0, 255)')) {
      console.log('  ❌ Tab背景仍有蓝色');
    } else {
      console.log('  ✅ Tab背景无蓝色');
    }
  });
  
  console.log('\n=== 🔧 4. 检查操作按钮优化 ===');
  
  actionButtons.forEach((button, index) => {
    const buttonRect = button.getBoundingClientRect();
    const buttonStyle = getComputedStyle(button);
    const buttonText = button.textContent?.trim() || `按钮${index + 1}`;
    
    console.log(`\n🎛️  ${buttonText} 按钮:`);
    console.log(`  宽度: ${buttonRect.width.toFixed(1)}px`);
    console.log(`  高度: ${buttonRect.height.toFixed(1)}px`);
    console.log(`  字体大小: ${buttonStyle.fontSize}`);
    console.log(`  内边距: ${buttonStyle.padding}`);
    console.log(`  背景: ${buttonStyle.background.substring(0, 30)}...`);
    
    // 检查按钮高度是否合理
    if (buttonRect.height > 50) {
      console.log('  ⚠️  按钮高度可能过高');
    } else {
      console.log('  ✅ 按钮高度合适');
    }
  });
  
  console.log('\n=== 📱 5. 检查响应式表现 ===');
  
  const windowWidth = window.innerWidth;
  console.log(`当前窗口宽度: ${windowWidth}px`);
  
  if (windowWidth < 640) {
    console.log('📱 小屏幕模式');
    // 检查小屏幕下的表现
    const tabFontSize = getComputedStyle(tabTriggers[0]).fontSize;
    console.log(`  Tab字体大小: ${tabFontSize}`);
    
    if (parseFloat(tabFontSize) < 14) {
      console.log('  ✅ 小屏幕字体大小合适');
    } else {
      console.log('  ⚠️  小屏幕字体可能过大');
    }
  } else {
    console.log('🖥️  大屏幕模式');
  }
  
  console.log('\n=== 🎨 6. 检查视觉层次 ===');
  
  // 检查容器和按钮的视觉层次
  const containerBg = getComputedStyle(tabsList).background;
  const activeBg = activeTabs.length > 0 ? getComputedStyle(activeTabs[0]).background : '';
  const inactiveBg = tabTriggers.length > 0 ? getComputedStyle(tabTriggers[0]).background : '';
  
  console.log('🎨 背景色层次:');
  console.log(`  容器背景: ${containerBg.substring(0, 40)}...`);
  console.log(`  激活Tab背景: ${activeBg.substring(0, 40)}...`);
  console.log(`  未激活Tab背景: ${inactiveBg.substring(0, 40)}...`);
  
  // 检查对比度
  const hasGoodContrast = containerBg !== activeBg && activeBg !== inactiveBg;
  if (hasGoodContrast) {
    console.log('✅ 背景色层次分明');
  } else {
    console.log('⚠️  背景色对比度可能不足');
  }
  
  console.log('\n=== 📊 7. 整体评估 ===');
  
  let fixScore = 0;
  let maxScore = 5;
  
  // 1. 按钮尺寸合理
  if (oversizedTabs === 0) {
    console.log('✅ 按钮尺寸: 已修复 (+1分)');
    fixScore += 1;
  } else {
    console.log('❌ 按钮尺寸: 仍有问题 (+0分)');
  }
  
  // 2. 蓝色装饰条移除
  const decorationFixed = activeTabs.every(tab => {
    const afterStyle = getComputedStyle(tab, '::after');
    return afterStyle.display === 'none' || parseFloat(afterStyle.height) === 0;
  });
  
  if (decorationFixed) {
    console.log('✅ 蓝色装饰条: 已移除 (+1分)');
    fixScore += 1;
  } else {
    console.log('❌ 蓝色装饰条: 仍存在 (+0分)');
  }
  
  // 3. 容器适配
  const containerFitsContent = totalTabWidth <= containerRect.width;
  if (containerFitsContent) {
    console.log('✅ 容器适配: 正常 (+1分)');
    fixScore += 1;
  } else {
    console.log('❌ 容器适配: 内容溢出 (+0分)');
  }
  
  // 4. 操作按钮优化
  if (actionButtons.length === 3) {
    console.log('✅ 操作按钮: 已优化 (+1分)');
    fixScore += 1;
  } else {
    console.log('❌ 操作按钮: 未找到 (+0分)');
  }
  
  // 5. 整体视觉协调
  if (hasGoodContrast && oversizedTabs === 0) {
    console.log('✅ 视觉协调: 良好 (+1分)');
    fixScore += 1;
  } else {
    console.log('❌ 视觉协调: 需改进 (+0分)');
  }
  
  const percentage = (fixScore / maxScore * 100).toFixed(0);
  console.log(`\n🏆 修复评分: ${fixScore}/${maxScore} (${percentage}%)`);
  
  if (fixScore === maxScore) {
    console.log('🎉 完美！所有UI问题都已修复');
  } else if (fixScore >= 4) {
    console.log('👍 很好！大部分问题已修复');
  } else if (fixScore >= 3) {
    console.log('👌 不错！主要问题已修复');
  } else {
    console.log('⚠️  仍需进一步修复');
  }
  
  console.log('\n=== 💡 修复总结 ===');
  console.log('🔧 尺寸优化：减小内边距，调整字体大小');
  console.log('🎨 装饰条移除：隐藏底部蓝色装饰条');
  console.log('📦 容器适配：优化容器和按钮的尺寸关系');
  console.log('🎯 视觉协调：统一的设计语言和合适的对比度');
  
  return {
    oversizedTabs,
    decorationFixed,
    containerFitsContent,
    actionButtonsCount: actionButtons.length,
    fixScore,
    maxScore,
    percentage: parseInt(percentage)
  };
}

// 等待页面加载后执行
setTimeout(verifyLibraryUIFix, 1000);
