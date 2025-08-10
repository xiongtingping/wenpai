/**
 * 容器高度调试脚本
 * 在浏览器控制台中运行此脚本来检查左右容器的高度对齐
 */

console.log('🔍 开始检查容器高度对齐...');

function debugContainerHeights() {
  // 查找网格容器
  const gridContainer = document.querySelector('.grid.grid-cols-1.lg\\:grid-cols-2');
  
  if (!gridContainer) {
    console.log('❌ 未找到网格容器');
    return;
  }
  
  console.log('✅ 找到网格容器:', gridContainer);
  
  // 查找左右两个子容器
  const containers = Array.from(gridContainer.children);
  
  if (containers.length < 2) {
    console.log('❌ 容器数量不足:', containers.length);
    return;
  }
  
  const leftContainer = containers[0];
  const rightContainer = containers[1];
  
  console.log('\n📏 容器尺寸分析:');
  
  // 获取容器的计算样式
  const leftStyle = getComputedStyle(leftContainer);
  const rightStyle = getComputedStyle(rightContainer);
  
  const leftHeight = leftContainer.getBoundingClientRect().height;
  const rightHeight = rightContainer.getBoundingClientRect().height;
  
  console.log('左侧容器:');
  console.log('  实际高度:', leftHeight + 'px');
  console.log('  最小高度:', leftStyle.minHeight);
  console.log('  display:', leftStyle.display);
  console.log('  flex-direction:', leftStyle.flexDirection);
  
  console.log('\n右侧容器:');
  console.log('  实际高度:', rightHeight + 'px');
  console.log('  最小高度:', rightStyle.minHeight);
  console.log('  display:', rightStyle.display);
  console.log('  flex-direction:', rightStyle.flexDirection);
  
  const heightDiff = Math.abs(leftHeight - rightHeight);
  console.log('\n📊 高度差异:', heightDiff + 'px');
  
  if (heightDiff < 5) {
    console.log('✅ 容器高度基本一致');
  } else if (heightDiff < 20) {
    console.log('⚠️  容器高度略有差异');
  } else {
    console.log('❌ 容器高度差异较大');
  }
  
  // 查找内部的Card组件
  const leftCard = leftContainer.querySelector('[class*="Card"]') || leftContainer.querySelector('.rounded-xl');
  const rightCard = rightContainer.querySelector('[class*="Card"]') || rightContainer.querySelector('.rounded-xl');
  
  if (leftCard && rightCard) {
    const leftCardHeight = leftCard.getBoundingClientRect().height;
    const rightCardHeight = rightCard.getBoundingClientRect().height;
    
    console.log('\n🃏 Card组件高度:');
    console.log('左侧Card:', leftCardHeight + 'px');
    console.log('右侧Card:', rightCardHeight + 'px');
    console.log('Card高度差异:', Math.abs(leftCardHeight - rightCardHeight) + 'px');
  }
  
  // 添加视觉调试边框
  console.log('\n🎨 添加调试边框...');
  
  leftContainer.style.border = '3px solid red';
  leftContainer.style.boxSizing = 'border-box';
  rightContainer.style.border = '3px solid blue';
  rightContainer.style.boxSizing = 'border-box';
  
  // 添加高度标签
  const leftLabel = document.createElement('div');
  leftLabel.textContent = `左侧: ${leftHeight.toFixed(0)}px`;
  leftLabel.style.cssText = `
    position: absolute;
    top: -25px;
    left: 0;
    background: red;
    color: white;
    padding: 2px 8px;
    font-size: 12px;
    font-weight: bold;
    border-radius: 4px;
    z-index: 9999;
  `;
  leftContainer.style.position = 'relative';
  leftContainer.appendChild(leftLabel);
  
  const rightLabel = document.createElement('div');
  rightLabel.textContent = `右侧: ${rightHeight.toFixed(0)}px`;
  rightLabel.style.cssText = `
    position: absolute;
    top: -25px;
    left: 0;
    background: blue;
    color: white;
    padding: 2px 8px;
    font-size: 12px;
    font-weight: bold;
    border-radius: 4px;
    z-index: 9999;
  `;
  rightContainer.style.position = 'relative';
  rightContainer.appendChild(rightLabel);
  
  console.log('✅ 调试边框和标签已添加');
  
  // 提供修复建议
  console.log('\n💡 修复建议:');
  
  if (heightDiff > 20) {
    console.log('1. 检查内容高度差异');
    console.log('2. 考虑使用 min-height 统一最小高度');
    console.log('3. 确保两个容器都使用 flex 布局');
    console.log('4. 检查内部组件的 flex-1 设置');
  }
  
  // 自动修复尝试
  console.log('\n🔧 尝试自动修复...');
  
  const maxHeight = Math.max(leftHeight, rightHeight);
  
  leftContainer.style.minHeight = maxHeight + 'px';
  rightContainer.style.minHeight = maxHeight + 'px';
  
  console.log(`设置两个容器的最小高度为: ${maxHeight}px`);
  
  // 5秒后移除调试边框
  setTimeout(() => {
    leftContainer.style.border = '';
    rightContainer.style.border = '';
    if (leftLabel.parentNode) leftLabel.remove();
    if (rightLabel.parentNode) rightLabel.remove();
    console.log('🧹 调试边框已清除');
  }, 5000);
  
  return {
    leftHeight,
    rightHeight,
    heightDiff,
    maxHeight
  };
}

// 等待页面加载完成后执行
if (document.readyState === 'complete') {
  debugContainerHeights();
} else {
  window.addEventListener('load', debugContainerHeights);
}
