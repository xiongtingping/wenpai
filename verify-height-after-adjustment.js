/**
 * 验证调整后的容器高度对齐效果
 * 在浏览器控制台中运行
 */

console.log('🔍 验证调整后的容器高度对齐...');

function verifyHeightAfterAdjustment() {
  // 查找网格容器
  const gridContainer = document.querySelector('.profile-grid-equal-height');
  
  if (!gridContainer) {
    console.log('❌ 未找到网格容器');
    return;
  }
  
  console.log('✅ 找到网格容器');
  
  // 查找子容器
  const items = Array.from(gridContainer.querySelectorAll('.profile-grid-item'));
  
  if (items.length < 2) {
    console.log('❌ 子容器数量不足:', items.length);
    return;
  }
  
  const leftItem = items[0];
  const rightItem = items[1];
  
  const leftHeight = leftItem.getBoundingClientRect().height;
  const rightHeight = rightItem.getBoundingClientRect().height;
  
  console.log('\n📏 调整后的容器高度:');
  console.log('左侧容器 (使用统计):', leftHeight.toFixed(1) + 'px');
  console.log('右侧容器 (邀请奖励):', rightHeight.toFixed(1) + 'px');
  
  const heightDiff = Math.abs(leftHeight - rightHeight);
  console.log('高度差异:', heightDiff.toFixed(1) + 'px');
  
  // 评估对齐效果
  if (heightDiff < 5) {
    console.log('🎉 优秀！容器高度几乎完美对齐');
  } else if (heightDiff < 15) {
    console.log('✅ 很好！容器高度基本对齐');
  } else if (heightDiff < 30) {
    console.log('⚠️  一般，容器高度有轻微差异');
  } else {
    console.log('❌ 容器高度差异仍然较大');
  }
  
  // 检查邮箱info图标是否存在
  console.log('\n🔍 检查邮箱info图标:');
  const emailLabel = document.querySelector('label[for="email"]');
  const infoIcon = emailLabel?.querySelector('svg[class*="lucide-info"]');
  
  if (infoIcon) {
    console.log('✅ 邮箱info图标已添加');
    
    // 检查tooltip是否工作
    const tooltipTrigger = infoIcon.closest('[data-radix-tooltip-trigger]') || infoIcon.parentElement;
    if (tooltipTrigger) {
      console.log('✅ Tooltip功能已配置');
    } else {
      console.log('⚠️  Tooltip可能未正确配置');
    }
  } else {
    console.log('❌ 未找到邮箱info图标');
  }
  
  // 检查原来的奖励提示框是否已移除
  console.log('\n🗑️  检查原奖励提示框:');
  const giftIcons = document.querySelectorAll('svg[class*="lucide-gift"]');
  const rewardTexts = Array.from(document.querySelectorAll('*')).filter(el => 
    el.textContent && el.textContent.includes('首次验证奖励')
  );
  
  console.log('Gift图标数量:', giftIcons.length);
  console.log('包含"首次验证奖励"的元素数量:', rewardTexts.length);
  
  if (rewardTexts.length === 0) {
    console.log('✅ 原奖励提示框已成功移除');
  } else {
    console.log('⚠️  可能还有残留的奖励提示文本');
    rewardTexts.forEach((el, index) => {
      console.log(`  ${index + 1}. ${el.tagName}: ${el.textContent.substring(0, 50)}...`);
    });
  }
  
  // 计算内容高度变化
  console.log('\n📊 内容分析:');
  
  // 查找左侧TokenUsageSection
  const tokenSection = leftItem.querySelector('[class*="Card"]');
  const tokenHeight = tokenSection ? tokenSection.getBoundingClientRect().height : 0;
  
  // 查找右侧邀请卡片
  const inviteCard = rightItem.querySelector('[class*="Card"]');
  const inviteHeight = inviteCard ? inviteCard.getBoundingClientRect().height : 0;
  
  console.log('左侧内容卡片高度:', tokenHeight.toFixed(1) + 'px');
  console.log('右侧内容卡片高度:', inviteHeight.toFixed(1) + 'px');
  console.log('内容卡片高度差异:', Math.abs(tokenHeight - inviteHeight).toFixed(1) + 'px');
  
  // 提供进一步优化建议
  console.log('\n💡 优化建议:');
  
  if (heightDiff > 20) {
    console.log('1. 考虑进一步调整右侧内容的间距');
    console.log('2. 可以尝试调整卡片内部的padding');
    console.log('3. 检查是否还有其他可以精简的内容');
  } else if (heightDiff > 10) {
    console.log('1. 高度差异在可接受范围内');
    console.log('2. 可以考虑微调内容间距');
  } else {
    console.log('1. 高度对齐效果很好！');
    console.log('2. 当前的调整已经达到了预期效果');
  }
  
  // 添加视觉调试（可选）
  console.log('\n🎨 添加临时调试边框...');
  leftItem.style.outline = '2px solid red';
  rightItem.style.outline = '2px solid blue';
  
  setTimeout(() => {
    leftItem.style.outline = '';
    rightItem.style.outline = '';
    console.log('🧹 调试边框已清除');
  }, 3000);
  
  return {
    leftHeight,
    rightHeight,
    heightDiff,
    isWellAligned: heightDiff < 15,
    hasInfoIcon: !!infoIcon,
    rewardTextRemoved: rewardTexts.length === 0
  };
}

// 等待页面加载后执行
setTimeout(verifyHeightAfterAdjustment, 1000);
