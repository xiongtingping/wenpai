/**
 * 最终高度对齐检查脚本
 * 在浏览器控制台中运行，验证所有优化后的效果
 */

console.log('🎯 最终高度对齐检查开始...');

function finalHeightAlignmentCheck() {
  console.log('\n=== 📊 容器高度分析 ===');
  
  // 1. 检查网格容器
  const gridContainer = document.querySelector('.profile-grid-equal-height');
  if (!gridContainer) {
    console.log('❌ 未找到网格容器');
    return;
  }
  
  const items = Array.from(gridContainer.querySelectorAll('.profile-grid-item'));
  if (items.length < 2) {
    console.log('❌ 子容器数量不足');
    return;
  }
  
  const leftItem = items[0];
  const rightItem = items[1];
  
  const leftHeight = leftItem.getBoundingClientRect().height;
  const rightHeight = rightItem.getBoundingClientRect().height;
  const heightDiff = Math.abs(leftHeight - rightHeight);
  
  console.log('📏 容器高度对比:');
  console.log(`  左侧容器 (使用统计): ${leftHeight.toFixed(1)}px`);
  console.log(`  右侧容器 (邀请奖励): ${rightHeight.toFixed(1)}px`);
  console.log(`  高度差异: ${heightDiff.toFixed(1)}px`);
  
  // 2. 检查内部Card高度
  console.log('\n=== 🃏 Card组件高度分析 ===');
  
  const leftCard = leftItem.querySelector('[class*="Card"]') || leftItem.querySelector('.rounded-xl');
  const rightCard = rightItem.querySelector('[class*="Card"]') || rightItem.querySelector('.rounded-xl');
  
  if (leftCard && rightCard) {
    const leftCardHeight = leftCard.getBoundingClientRect().height;
    const rightCardHeight = rightCard.getBoundingClientRect().height;
    const cardHeightDiff = Math.abs(leftCardHeight - rightCardHeight);
    
    console.log('📏 Card高度对比:');
    console.log(`  左侧Card: ${leftCardHeight.toFixed(1)}px`);
    console.log(`  右侧Card: ${rightCardHeight.toFixed(1)}px`);
    console.log(`  Card高度差异: ${cardHeightDiff.toFixed(1)}px`);
  }
  
  // 3. 检查按钮对齐
  console.log('\n=== 🔘 按钮对齐分析 ===');
  
  const upgradeButton = leftItem.querySelector('.btn-upgrade-force');
  const inviteButton = rightItem.querySelector('.btn-invite-force');
  
  if (upgradeButton && inviteButton) {
    const upgradeRect = upgradeButton.getBoundingClientRect();
    const inviteRect = inviteButton.getBoundingClientRect();
    
    console.log('📏 按钮位置对比:');
    console.log(`  升级按钮位置: top=${upgradeRect.top.toFixed(1)}, height=${upgradeRect.height.toFixed(1)}`);
    console.log(`  邀请按钮位置: top=${inviteRect.top.toFixed(1)}, height=${inviteRect.height.toFixed(1)}`);
    console.log(`  按钮垂直位置差异: ${Math.abs(upgradeRect.top - inviteRect.top).toFixed(1)}px`);
    
    // 检查按钮样式
    const upgradeStyle = getComputedStyle(upgradeButton);
    const inviteStyle = getComputedStyle(inviteButton);
    
    console.log('🎨 按钮样式对比:');
    console.log(`  升级按钮margin-top: ${upgradeStyle.marginTop}`);
    console.log(`  邀请按钮margin-top: ${inviteStyle.marginTop}`);
  } else {
    console.log('⚠️  未找到对应的按钮元素');
    if (!upgradeButton) console.log('  - 未找到升级按钮');
    if (!inviteButton) console.log('  - 未找到邀请按钮');
  }
  
  // 4. 检查邮箱info图标
  console.log('\n=== ℹ️  邮箱Info图标检查 ===');
  
  const emailLabel = document.querySelector('label[for="email"]');
  const infoIcon = emailLabel?.querySelector('svg[class*="lucide-info"]');
  
  if (infoIcon) {
    console.log('✅ 邮箱info图标存在');
    
    // 检查tooltip功能
    const tooltipTrigger = infoIcon.closest('[data-radix-tooltip-trigger]');
    if (tooltipTrigger) {
      console.log('✅ Tooltip功能已配置');
    } else {
      console.log('⚠️  Tooltip可能未正确配置');
    }
  } else {
    console.log('❌ 邮箱info图标未找到');
  }
  
  // 5. 检查文案更新
  console.log('\n=== 📝 文案检查 ===');
  
  const rewardText = document.querySelector('*');
  const hasUpdatedText = Array.from(document.querySelectorAll('*')).some(el => 
    el.textContent && el.textContent.includes('可累加且永久有效')
  );
  
  if (hasUpdatedText) {
    console.log('✅ 邀请奖励文案已更新为"可累加且永久有效"');
  } else {
    console.log('⚠️  邀请奖励文案可能未正确更新');
  }
  
  // 6. 整体评估
  console.log('\n=== 🎯 整体评估 ===');
  
  let score = 0;
  let maxScore = 5;
  
  // 高度对齐评分
  if (heightDiff < 5) {
    console.log('✅ 容器高度对齐: 优秀 (+2分)');
    score += 2;
  } else if (heightDiff < 15) {
    console.log('✅ 容器高度对齐: 良好 (+1分)');
    score += 1;
  } else {
    console.log('❌ 容器高度对齐: 需要改进 (+0分)');
  }
  
  // 按钮对齐评分
  if (upgradeButton && inviteButton) {
    console.log('✅ 按钮配置: 完整 (+1分)');
    score += 1;
  } else {
    console.log('❌ 按钮配置: 不完整 (+0分)');
  }
  
  // Info图标评分
  if (infoIcon) {
    console.log('✅ Info图标: 已实现 (+1分)');
    score += 1;
  } else {
    console.log('❌ Info图标: 未实现 (+0分)');
  }
  
  // 文案更新评分
  if (hasUpdatedText) {
    console.log('✅ 文案更新: 已完成 (+1分)');
    score += 1;
  } else {
    console.log('❌ 文案更新: 未完成 (+0分)');
  }
  
  console.log(`\n🏆 总体评分: ${score}/${maxScore} (${(score/maxScore*100).toFixed(0)}%)`);
  
  if (score === maxScore) {
    console.log('🎉 完美！所有优化都已成功实现');
  } else if (score >= maxScore * 0.8) {
    console.log('👍 很好！大部分优化已成功实现');
  } else if (score >= maxScore * 0.6) {
    console.log('👌 不错！部分优化已实现，还有改进空间');
  } else {
    console.log('⚠️  需要进一步优化');
  }
  
  // 7. 添加临时视觉标记
  console.log('\n🎨 添加临时视觉标记...');
  
  leftItem.style.outline = '2px solid #22c55e';
  rightItem.style.outline = '2px solid #3b82f6';
  
  // 添加高度标签
  const createHeightLabel = (element, text, color) => {
    const label = document.createElement('div');
    label.textContent = text;
    label.style.cssText = `
      position: absolute;
      top: -30px;
      left: 50%;
      transform: translateX(-50%);
      background: ${color};
      color: white;
      padding: 4px 12px;
      font-size: 12px;
      font-weight: bold;
      border-radius: 6px;
      z-index: 9999;
      box-shadow: 0 2px 8px rgba(0,0,0,0.2);
    `;
    element.style.position = 'relative';
    element.appendChild(label);
    return label;
  };
  
  const leftLabel = createHeightLabel(leftItem, `左侧: ${leftHeight.toFixed(0)}px`, '#22c55e');
  const rightLabel = createHeightLabel(rightItem, `右侧: ${rightHeight.toFixed(0)}px`, '#3b82f6');
  
  // 5秒后清除标记
  setTimeout(() => {
    leftItem.style.outline = '';
    rightItem.style.outline = '';
    if (leftLabel.parentNode) leftLabel.remove();
    if (rightLabel.parentNode) rightLabel.remove();
    console.log('🧹 视觉标记已清除');
  }, 5000);
  
  return {
    leftHeight,
    rightHeight,
    heightDiff,
    score,
    maxScore,
    isWellAligned: heightDiff < 15,
    hasInfoIcon: !!infoIcon,
    hasUpdatedText,
    hasButtons: !!(upgradeButton && inviteButton)
  };
}

// 等待页面加载后执行
setTimeout(finalHeightAlignmentCheck, 1000);
