/**
 * 检查容器高度对齐的简单脚本
 * 在浏览器控制台中运行
 */

console.log('🔍 检查容器高度对齐...');

function checkHeightAlignment() {
  // 查找使用新CSS类的容器
  const gridContainer = document.querySelector('.profile-grid-equal-height');
  
  if (!gridContainer) {
    console.log('❌ 未找到 .profile-grid-equal-height 容器');
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
  
  console.log('📏 容器高度:');
  console.log('左侧:', leftHeight.toFixed(1) + 'px');
  console.log('右侧:', rightHeight.toFixed(1) + 'px');
  
  const heightDiff = Math.abs(leftHeight - rightHeight);
  console.log('高度差异:', heightDiff.toFixed(1) + 'px');
  
  if (heightDiff < 2) {
    console.log('✅ 容器高度完美对齐！');
  } else if (heightDiff < 10) {
    console.log('✅ 容器高度基本对齐');
  } else {
    console.log('⚠️  容器高度仍有差异');
  }
  
  // 检查CSS类是否正确应用
  const gridStyle = getComputedStyle(gridContainer);
  console.log('\n🎨 CSS检查:');
  console.log('display:', gridStyle.display);
  console.log('grid-template-columns:', gridStyle.gridTemplateColumns);
  console.log('align-items:', gridStyle.alignItems);
  console.log('min-height:', gridStyle.minHeight);
  
  return {
    leftHeight,
    rightHeight,
    heightDiff,
    isAligned: heightDiff < 10
  };
}

// 等待页面加载后执行
setTimeout(checkHeightAlignment, 1000);
