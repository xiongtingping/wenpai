/**
 * Tooltip文案移除验证脚本
 * 在浏览器控制台中运行此脚本来验证文案是否已被移除
 */

console.log('🔍 开始验证Tooltip文案移除...');

// 查找主要按钮
const mainButton = document.querySelector('button[class*="bg-gradient"]');
if (!mainButton) {
  console.log('❌ 未找到主要按钮');
} else {
  console.log('✅ 找到主要按钮');
  
  // 检查title属性
  const titleAttribute = mainButton.getAttribute('title');
  if (titleAttribute) {
    console.log('❌ 按钮仍有title属性:', titleAttribute);
  } else {
    console.log('✅ 按钮title属性已移除');
  }
  
  // 检查是否还有tooltip容器
  const tooltipContainer = document.querySelector('.absolute.-bottom-12');
  if (tooltipContainer) {
    console.log('❌ 仍存在tooltip容器');
    console.log('   内容:', tooltipContainer.textContent.trim());
  } else {
    console.log('✅ Tooltip容器已移除');
  }
  
  // 检查是否有包含目标文案的元素
  const targetText = '支持多平台内容创作';
  const elementsWithText = Array.from(document.querySelectorAll('*')).filter(el => 
    el.textContent && el.textContent.includes(targetText)
  );
  
  if (elementsWithText.length > 0) {
    console.log('❌ 仍有元素包含目标文案:');
    elementsWithText.forEach((el, index) => {
      console.log(`   ${index + 1}. ${el.tagName}: ${el.textContent.trim()}`);
    });
  } else {
    console.log('✅ 页面中已无目标文案');
  }
  
  // 检查按钮功能是否正常
  console.log('\n🔧 按钮功能检查:');
  console.log('  - 按钮文案:', mainButton.textContent.trim());
  console.log('  - 点击事件:', mainButton.onclick ? '✅ 存在' : '❌ 缺失');
  console.log('  - CSS类名:', mainButton.className.includes('bg-gradient') ? '✅ 样式正常' : '❌ 样式异常');
  
  // 检查悬停效果
  const hasHoverEffect = mainButton.className.includes('hover:scale');
  console.log('  - 悬停效果:', hasHoverEffect ? '✅ 正常' : '❌ 缺失');
}

// 检查页面整体状态
console.log('\n📄 页面状态检查:');
console.log('  - 页面标题:', document.title);
console.log('  - 主标题存在:', document.querySelector('h1') ? '✅' : '❌');
console.log('  - 副标题存在:', document.querySelector('.hero-subtitle-container') ? '✅' : '❌');

console.log('\n🎉 Tooltip文案移除验证完成！');
console.log('💡 提示：可以悬停按钮确认不再显示tooltip');
