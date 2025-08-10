/**
 * 验证右上角升级按钮移除脚本
 * 确认除了顶部导航栏外，其他地方的升级按钮都已移除
 */

console.log('🔍 开始验证右上角升级按钮移除...');

function verifyUpgradeButtonRemoval() {
  console.log('\n=== 🎯 1. 查找所有升级按钮 ===');
  
  // 查找所有包含升级相关文字的按钮
  const allButtons = Array.from(document.querySelectorAll('button'));
  const upgradeButtons = allButtons.filter(btn => {
    const text = btn.textContent || '';
    return text.includes('立即解锁高级功能') || 
           text.includes('解锁高级功能') || 
           text.includes('立即升级') ||
           text.includes('升级解锁') ||
           text.includes('立即升级解锁');
  });
  
  console.log(`📊 找到 ${upgradeButtons.length} 个升级按钮`);
  
  if (upgradeButtons.length === 0) {
    console.log('✅ 没有找到任何升级按钮');
    return { success: true, navButtons: 0, pageButtons: 0 };
  }
  
  console.log('\n=== 🔍 2. 分析按钮位置 ===');
  
  // 查找顶部导航栏
  const topNavigation = document.querySelector('header');
  let navButtons = 0;
  let pageButtons = 0;
  
  upgradeButtons.forEach((btn, index) => {
    const isInNav = topNavigation && topNavigation.contains(btn);
    const buttonRect = btn.getBoundingClientRect();
    const isVisible = btn.offsetParent !== null;
    
    console.log(`\n按钮 ${index + 1}:`);
    console.log(`  文本: "${btn.textContent.trim()}"`);
    console.log(`  位置: ${isInNav ? '顶部导航栏' : '页面内容区'}`);
    console.log(`  是否可见: ${isVisible}`);
    console.log(`  坐标: top=${buttonRect.top.toFixed(0)}, left=${buttonRect.left.toFixed(0)}`);
    console.log(`  类名: ${btn.className}`);
    
    // 检查是否在右上角区域
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    const isInTopRight = buttonRect.top < windowHeight * 0.2 && buttonRect.left > windowWidth * 0.7;
    
    if (isInTopRight && !isInNav) {
      console.log(`  ⚠️  位于右上角区域但不在导航栏中`);
    }
    
    if (isInNav) {
      navButtons++;
    } else {
      pageButtons++;
    }
  });
  
  console.log('\n=== 📊 3. 统计结果 ===');
  console.log(`导航栏中的升级按钮: ${navButtons} 个`);
  console.log(`页面内容区的升级按钮: ${pageButtons} 个`);
  
  console.log('\n=== 🎨 4. 检查主题切换按钮 ===');
  
  // 查找主题切换按钮
  const themeButtons = allButtons.filter(btn => {
    const hasThemeIcon = btn.querySelector('svg') && (
      btn.querySelector('[class*="sun"]') || 
      btn.querySelector('[class*="moon"]') || 
      btn.querySelector('[class*="palette"]') ||
      btn.getAttribute('aria-label') === '切换主题' ||
      btn.getAttribute('title') === '切换主题'
    );
    return hasThemeIcon;
  });
  
  console.log(`主题切换按钮数量: ${themeButtons.length}`);
  
  if (themeButtons.length > 0) {
    console.log('✅ 主题切换按钮存在');
    themeButtons.forEach((btn, index) => {
      const isInHeader = topNavigation && topNavigation.contains(btn);
      console.log(`  按钮 ${index + 1}: ${isInHeader ? '在导航栏中' : '在页面其他位置'}`);
    });
  } else {
    console.log('❌ 未找到主题切换按钮');
  }
  
  console.log('\n=== 🔍 5. 检查特定组件 ===');
  
  // 检查可能包含升级按钮的组件
  const components = [
    { name: 'TokenUsageSection', selector: '[class*="TokenUsage"]' },
    { name: 'UsageStats', selector: '[class*="UsageStats"]' },
    { name: 'PremiumFeatureDialog', selector: '[class*="PremiumFeature"]' },
    { name: 'UsageReminderDialog', selector: '[class*="UsageReminder"]' },
    { name: 'PageNavigation', selector: '[class*="PageNavigation"]' }
  ];
  
  components.forEach(component => {
    const elements = document.querySelectorAll(component.selector);
    if (elements.length > 0) {
      console.log(`\n${component.name} 组件:`);
      elements.forEach((el, index) => {
        const componentButtons = el.querySelectorAll('button');
        const componentUpgradeButtons = Array.from(componentButtons).filter(btn => {
          const text = btn.textContent || '';
          return text.includes('升级') || text.includes('解锁');
        });
        
        console.log(`  实例 ${index + 1}: ${componentUpgradeButtons.length} 个升级按钮`);
        if (componentUpgradeButtons.length > 0) {
          componentUpgradeButtons.forEach((btn, btnIndex) => {
            console.log(`    按钮 ${btnIndex + 1}: "${btn.textContent.trim()}"`);
          });
        }
      });
    }
  });
  
  console.log('\n=== 🎯 6. 检查弹窗中的升级按钮 ===');
  
  // 检查弹窗中的升级按钮（这些是允许的）
  const dialogs = document.querySelectorAll('[role="dialog"], .dialog, [class*="Dialog"]');
  let dialogUpgradeButtons = 0;
  
  dialogs.forEach((dialog, index) => {
    const dialogButtons = dialog.querySelectorAll('button');
    const dialogUpgrades = Array.from(dialogButtons).filter(btn => {
      const text = btn.textContent || '';
      return text.includes('升级') || text.includes('解锁');
    });
    
    if (dialogUpgrades.length > 0) {
      console.log(`弹窗 ${index + 1}: ${dialogUpgrades.length} 个升级按钮`);
      dialogUpgradeButtons += dialogUpgrades.length;
    }
  });
  
  console.log(`弹窗中的升级按钮总数: ${dialogUpgradeButtons} 个（这些是允许的）`);
  
  console.log('\n=== 📊 7. 总体评估 ===');
  
  let score = 0;
  let maxScore = 4;
  
  // 1. 导航栏中有升级按钮（期望：1个）
  if (navButtons === 1) {
    console.log('✅ 导航栏升级按钮: 正确 (+1分)');
    score += 1;
  } else if (navButtons === 0) {
    console.log('⚠️  导航栏升级按钮: 缺失 (+0分)');
  } else {
    console.log('❌ 导航栏升级按钮: 过多 (+0分)');
  }
  
  // 2. 页面内容区没有升级按钮（期望：0个）
  if (pageButtons === 0) {
    console.log('✅ 页面升级按钮清理: 完成 (+1分)');
    score += 1;
  } else {
    console.log('❌ 页面升级按钮清理: 未完成 (+0分)');
  }
  
  // 3. 主题切换按钮存在
  if (themeButtons.length > 0) {
    console.log('✅ 主题切换按钮: 存在 (+1分)');
    score += 1;
  } else {
    console.log('❌ 主题切换按钮: 缺失 (+0分)');
  }
  
  // 4. 没有右上角区域的升级按钮
  const rightTopButtons = upgradeButtons.filter(btn => {
    if (topNavigation && topNavigation.contains(btn)) return false; // 排除导航栏
    const rect = btn.getBoundingClientRect();
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    return rect.top < windowHeight * 0.2 && rect.left > windowWidth * 0.7;
  });
  
  if (rightTopButtons.length === 0) {
    console.log('✅ 右上角区域清理: 完成 (+1分)');
    score += 1;
  } else {
    console.log('❌ 右上角区域清理: 未完成 (+0分)');
  }
  
  const percentage = (score / maxScore * 100).toFixed(0);
  console.log(`\n🏆 总体评分: ${score}/${maxScore} (${percentage}%)`);
  
  if (score === maxScore) {
    console.log('🎉 完美！右上角升级按钮已成功移除，只保留导航栏中的按钮');
  } else if (score >= 3) {
    console.log('👍 很好！大部分清理工作已完成');
  } else if (score >= 2) {
    console.log('👌 不错！部分清理工作已完成');
  } else {
    console.log('⚠️  需要进一步清理升级按钮');
  }
  
  console.log('\n=== 💡 建议 ===');
  
  if (navButtons === 0) {
    console.log('- 检查用户是否已登录（导航栏升级按钮只对已登录用户显示）');
    console.log('- 检查TopNavigation.tsx中的升级按钮逻辑');
  }
  
  if (pageButtons > 0) {
    console.log('- 需要移除页面内容区的升级按钮');
    console.log('- 检查以下组件：TokenUsageSection, UsageStats, PageNavigation');
  }
  
  if (rightTopButtons.length > 0) {
    console.log('- 发现右上角区域仍有升级按钮，需要移除');
  }
  
  if (themeButtons.length === 0) {
    console.log('- 检查ThemeToggle组件是否正确导入和使用');
  }
  
  console.log('\n=== 🎯 验证完成 ===');
  console.log('✅ 保留：顶部导航栏中的升级按钮');
  console.log('✅ 移除：所有页面右上角和内容区的升级按钮');
  console.log('✅ 保留：弹窗中的升级按钮（用户主动触发）');
  
  return {
    success: score >= 3,
    navButtons,
    pageButtons,
    themeButtons: themeButtons.length,
    dialogButtons: dialogUpgradeButtons,
    rightTopButtons: rightTopButtons.length,
    score,
    maxScore,
    percentage: parseInt(percentage)
  };
}

// 等待页面加载后执行
setTimeout(verifyUpgradeButtonRemoval, 1000);
