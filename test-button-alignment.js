/**
 * 按钮文字居中对齐验证脚本
 * 在浏览器控制台中运行此脚本来验证按钮对齐效果
 */

console.log('🔍 开始验证按钮文字居中对齐...');

// 查找主要按钮
const mainButton = document.querySelector('button[class*="bg-gradient"]');
if (!mainButton) {
  console.log('❌ 未找到主要按钮');
} else {
  console.log('✅ 找到主要按钮:', mainButton);
  
  // 获取按钮的计算样式
  const buttonStyles = window.getComputedStyle(mainButton);
  console.log('📏 按钮样式信息:');
  console.log('  - display:', buttonStyles.display);
  console.log('  - align-items:', buttonStyles.alignItems);
  console.log('  - justify-content:', buttonStyles.justifyContent);
  console.log('  - height:', buttonStyles.height);
  console.log('  - padding:', buttonStyles.padding);
  console.log('  - line-height:', buttonStyles.lineHeight);
  
  // 获取按钮内容容器
  const buttonContent = mainButton.querySelector('.hero-button-content');
  if (buttonContent) {
    console.log('✅ 找到按钮内容容器');
    const contentStyles = window.getComputedStyle(buttonContent);
    console.log('📏 内容容器样式:');
    console.log('  - display:', contentStyles.display);
    console.log('  - align-items:', contentStyles.alignItems);
    console.log('  - justify-content:', contentStyles.justifyContent);
    console.log('  - line-height:', contentStyles.lineHeight);
  } else {
    console.log('❌ 未找到按钮内容容器');
  }
  
  // 获取按钮文字
  const buttonText = mainButton.querySelector('.hero-button-text');
  if (buttonText) {
    console.log('✅ 找到按钮文字元素');
    const textStyles = window.getComputedStyle(buttonText);
    console.log('📏 文字元素样式:');
    console.log('  - display:', textStyles.display);
    console.log('  - line-height:', textStyles.lineHeight);
    console.log('  - vertical-align:', textStyles.verticalAlign);
    console.log('  - margin:', textStyles.margin);
    console.log('  - padding:', textStyles.padding);
  } else {
    console.log('❌ 未找到按钮文字元素');
  }
  
  // 检查按钮尺寸和内容位置
  const buttonRect = mainButton.getBoundingClientRect();
  console.log('📐 按钮尺寸和位置:');
  console.log('  - 宽度:', buttonRect.width);
  console.log('  - 高度:', buttonRect.height);
  console.log('  - 顶部:', buttonRect.top);
  console.log('  - 左侧:', buttonRect.left);
  
  // 检查文字是否居中
  if (buttonText) {
    const textRect = buttonText.getBoundingClientRect();
    const buttonCenterY = buttonRect.top + buttonRect.height / 2;
    const textCenterY = textRect.top + textRect.height / 2;
    const verticalOffset = Math.abs(buttonCenterY - textCenterY);
    
    console.log('🎯 垂直居中检查:');
    console.log('  - 按钮中心Y:', buttonCenterY);
    console.log('  - 文字中心Y:', textCenterY);
    console.log('  - 垂直偏移:', verticalOffset, 'px');
    
    if (verticalOffset <= 2) {
      console.log('✅ 文字垂直居中 (偏移 ≤ 2px)');
    } else {
      console.log('❌ 文字未垂直居中 (偏移 > 2px)');
    }
  }
  
  // 检查图标对齐
  const icons = mainButton.querySelectorAll('svg');
  console.log('🎨 图标检查:');
  console.log('  - 图标数量:', icons.length);
  
  icons.forEach((icon, index) => {
    const iconRect = icon.getBoundingClientRect();
    const iconCenterY = iconRect.top + iconRect.height / 2;
    const buttonCenterY = buttonRect.top + buttonRect.height / 2;
    const iconOffset = Math.abs(buttonCenterY - iconCenterY);
    
    console.log(`  - 图标${index + 1}垂直偏移:`, iconOffset, 'px');
    
    if (iconOffset <= 2) {
      console.log(`    ✅ 图标${index + 1}垂直居中`);
    } else {
      console.log(`    ❌ 图标${index + 1}未垂直居中`);
    }
  });
}

// 检查响应式设计
console.log('\n📱 响应式设计检查:');
const viewportWidth = window.innerWidth;
console.log('  - 视口宽度:', viewportWidth, 'px');

if (viewportWidth < 640) {
  console.log('  - 当前为移动端视图');
} else if (viewportWidth < 1024) {
  console.log('  - 当前为平板端视图');
} else {
  console.log('  - 当前为桌面端视图');
}

console.log('\n🎉 按钮对齐验证完成！');
console.log('💡 提示：调整浏览器窗口大小测试响应式效果');
