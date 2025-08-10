/**
 * 导航栏升级按钮迁移验证脚本
 * 验证"立即解锁高级功能"按钮是否已正确移到顶部导航栏
 */

console.log('🔍 开始验证导航栏升级按钮迁移...');

function verifyNavigationUpgradeButton() {
  console.log('\n=== 🎯 1. 检查顶部导航栏升级按钮 ===');
  
  // 查找顶部导航栏
  const topNavigation = document.querySelector('header');
  if (!topNavigation) {
    console.log('❌ 未找到顶部导航栏');
    return;
  }
  
  console.log('✅ 找到顶部导航栏');
  
  // 查找导航栏中的升级按钮
  const navUpgradeButton = topNavigation.querySelector('button');
  const navUpgradeButtons = Array.from(topNavigation.querySelectorAll('button')).filter(btn => 
    btn.textContent && btn.textContent.includes('立即解锁高级功能')
  );
  
  console.log(`📊 导航栏中的升级按钮数量: ${navUpgradeButtons.length}`);
  
  if (navUpgradeButtons.length > 0) {
    console.log('✅ 导航栏中找到升级按钮');
    navUpgradeButtons.forEach((btn, index) => {
      console.log(`  按钮 ${index + 1}:`);
      console.log(`    文本: ${btn.textContent.trim()}`);
      console.log(`    类名: ${btn.className}`);
      console.log(`    是否可见: ${btn.offsetParent !== null}`);
    });
  } else {
    console.log('⚠️  导航栏中未找到升级按钮');
  }
  
  console.log('\n=== 🎨 2. 检查主题切换按钮 ===');
  
  // 查找主题切换按钮
  const themeToggleButtons = Array.from(document.querySelectorAll('button')).filter(btn => {
    const hasThemeIcon = btn.querySelector('svg') && (
      btn.querySelector('[class*="sun"]') || 
      btn.querySelector('[class*="moon"]') || 
      btn.querySelector('[class*="palette"]') ||
      btn.getAttribute('aria-label') === '切换主题' ||
      btn.getAttribute('title') === '切换主题'
    );
    return hasThemeIcon;
  });
  
  console.log(`📊 主题切换按钮数量: ${themeToggleButtons.length}`);
  
  if (themeToggleButtons.length > 0) {
    console.log('✅ 找到主题切换按钮');
    themeToggleButtons.forEach((btn, index) => {
      const isInHeader = topNavigation.contains(btn);
      console.log(`  按钮 ${index + 1}:`);
      console.log(`    位置: ${isInHeader ? '导航栏中' : '页面其他位置'}`);
      console.log(`    是否可见: ${btn.offsetParent !== null}`);
    });
  } else {
    console.log('❌ 未找到主题切换按钮');
  }
  
  console.log('\n=== 🗑️  3. 检查页面中的残留升级按钮 ===');
  
  // 查找页面中所有的升级按钮
  const allUpgradeButtons = Array.from(document.querySelectorAll('button')).filter(btn => 
    btn.textContent && (
      btn.textContent.includes('立即解锁高级功能') || 
      btn.textContent.includes('解锁高级功能') ||
      btn.textContent.includes('立即升级')
    )
  );
  
  console.log(`📊 页面中所有升级按钮数量: ${allUpgradeButtons.length}`);
  
  // 分类统计
  let navButtons = 0;
  let pageButtons = 0;
  
  allUpgradeButtons.forEach((btn, index) => {
    const isInNav = topNavigation.contains(btn);
    const buttonRect = btn.getBoundingClientRect();
    const isVisible = btn.offsetParent !== null;
    
    console.log(`  按钮 ${index + 1}:`);
    console.log(`    文本: ${btn.textContent.trim()}`);
    console.log(`    位置: ${isInNav ? '导航栏' : '页面内容区'}`);
    console.log(`    是否可见: ${isVisible}`);
    console.log(`    坐标: top=${buttonRect.top.toFixed(0)}, left=${buttonRect.left.toFixed(0)}`);
    
    if (isInNav) {
      navButtons++;
    } else {
      pageButtons++;
    }
  });
  
  console.log(`\n📈 统计结果:`);
  console.log(`  导航栏中的升级按钮: ${navButtons} 个`);
  console.log(`  页面内容区的升级按钮: ${pageButtons} 个`);
  
  console.log('\n=== 📱 4. 检查响应式显示 ===');
  
  // 检查按钮的响应式类
  if (navUpgradeButtons.length > 0) {
    const btn = navUpgradeButtons[0];
    const hasResponsiveClass = btn.className.includes('hidden') && btn.className.includes('sm:');
    
    console.log('导航栏升级按钮响应式检查:');
    console.log(`  包含响应式类: ${hasResponsiveClass}`);
    console.log(`  完整类名: ${btn.className}`);
    
    if (hasResponsiveClass) {
      console.log('✅ 按钮在小屏幕上会隐藏');
    } else {
      console.log('⚠️  按钮可能在所有屏幕尺寸上都显示');
    }
  }
  
  console.log('\n=== 🎯 5. 检查按钮功能 ===');
  
  // 检查按钮的点击事件
  if (navUpgradeButtons.length > 0) {
    const btn = navUpgradeButtons[0];
    
    console.log('导航栏升级按钮功能检查:');
    console.log(`  有点击事件: ${btn.onclick !== null || btn.addEventListener !== undefined}`);
    console.log(`  包含Crown图标: ${btn.querySelector('svg[class*="crown"]') !== null}`);
    
    // 检查按钮样式
    const style = getComputedStyle(btn);
    const hasGradient = style.background.includes('gradient') || style.backgroundImage.includes('gradient');
    console.log(`  有渐变背景: ${hasGradient}`);
  }
  
  console.log('\n=== 📊 总体评估 ===');
  
  let score = 0;
  let maxScore = 5;
  
  // 1. 导航栏中有升级按钮
  if (navButtons > 0) {
    console.log('✅ 导航栏升级按钮: 存在 (+1分)');
    score += 1;
  } else {
    console.log('❌ 导航栏升级按钮: 缺失 (+0分)');
  }
  
  // 2. 页面内容区没有升级按钮
  if (pageButtons === 0) {
    console.log('✅ 页面升级按钮清理: 完成 (+1分)');
    score += 1;
  } else {
    console.log('❌ 页面升级按钮清理: 未完成 (+0分)');
  }
  
  // 3. 主题切换按钮存在
  if (themeToggleButtons.length > 0) {
    console.log('✅ 主题切换按钮: 存在 (+1分)');
    score += 1;
  } else {
    console.log('❌ 主题切换按钮: 缺失 (+0分)');
  }
  
  // 4. 主题切换按钮在导航栏中
  const themeInNav = themeToggleButtons.some(btn => topNavigation.contains(btn));
  if (themeInNav) {
    console.log('✅ 主题切换位置: 正确 (+1分)');
    score += 1;
  } else {
    console.log('❌ 主题切换位置: 错误 (+0分)');
  }
  
  // 5. 按钮样式正确
  if (navUpgradeButtons.length > 0) {
    const btn = navUpgradeButtons[0];
    const hasCorrectStyle = btn.className.includes('btn-upgrade-gradient');
    if (hasCorrectStyle) {
      console.log('✅ 按钮样式: 正确 (+1分)');
      score += 1;
    } else {
      console.log('❌ 按钮样式: 错误 (+0分)');
    }
  } else {
    console.log('❌ 按钮样式: 无法检查 (+0分)');
  }
  
  const percentage = (score / maxScore * 100).toFixed(0);
  console.log(`\n🏆 总体评分: ${score}/${maxScore} (${percentage}%)`);
  
  if (score === maxScore) {
    console.log('🎉 完美！所有迁移都已成功完成');
  } else if (score >= 4) {
    console.log('👍 很好！大部分迁移已完成');
  } else if (score >= 3) {
    console.log('👌 不错！部分迁移已完成');
  } else {
    console.log('⚠️  需要进一步检查和修复');
  }
  
  console.log('\n=== 💡 建议 ===');
  
  if (navButtons === 0) {
    console.log('- 检查TopNavigation.tsx中的升级按钮是否正确添加');
    console.log('- 确认用户已登录（升级按钮只对已登录用户显示）');
  }
  
  if (pageButtons > 0) {
    console.log('- 检查并移除页面内容区域的升级按钮');
    console.log('- 特别检查TokenUsageSection等组件');
  }
  
  if (themeToggleButtons.length === 0) {
    console.log('- 检查ThemeToggle组件是否正确导入和使用');
  }
  
  return {
    navButtons,
    pageButtons,
    themeButtons: themeToggleButtons.length,
    score,
    maxScore,
    percentage: parseInt(percentage)
  };
}

// 等待页面加载后执行
setTimeout(verifyNavigationUpgradeButton, 1000);
