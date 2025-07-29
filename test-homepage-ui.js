/**
 * 首页UI优化验证脚本
 * 检查关键元素是否正确显示
 */

// 在浏览器控制台中运行此脚本来验证首页优化效果

console.log('🔍 开始验证首页UI优化...');

// 检查主标题
const mainTitle = document.querySelector('h1');
if (mainTitle) {
  console.log('✅ 主标题找到:', mainTitle.textContent.trim());
  
  // 检查是否包含emoji和渐变文字
  const hasEmoji = mainTitle.textContent.includes('🚀');
  const hasGradientText = mainTitle.querySelector('span[class*="bg-gradient"]');
  
  console.log('📝 标题包含火箭emoji:', hasEmoji ? '✅' : '❌');
  console.log('🎨 标题包含渐变效果:', hasGradientText ? '✅' : '❌');
} else {
  console.log('❌ 主标题未找到');
}

// 检查核心价值主张
const valueProposition = document.querySelector('strong[class*="bg-gradient"]');
if (valueProposition) {
  console.log('✅ 核心价值主张找到:', valueProposition.textContent.trim());
} else {
  console.log('❌ 核心价值主张未找到');
}

// 检查特性点
const features = document.querySelectorAll('span[class*="inline-flex items-center gap-2"]');
console.log('📋 特性点数量:', features.length);
features.forEach((feature, index) => {
  console.log(`   ${index + 1}. ${feature.textContent.trim()}`);
});

// 检查主要按钮
const mainButton = document.querySelector('button[class*="bg-gradient"]');
if (mainButton) {
  console.log('✅ 主要按钮找到:', mainButton.textContent.trim());
  
  // 检查按钮文案
  const hasCorrectText = mainButton.textContent.includes('AI 一键创作');
  console.log('📝 按钮文案正确:', hasCorrectText ? '✅' : '❌');
  
  // 检查按钮样式
  const hasGradient = mainButton.className.includes('bg-gradient');
  const hasHoverEffect = mainButton.className.includes('hover:scale');
  
  console.log('🎨 按钮渐变背景:', hasGradient ? '✅' : '❌');
  console.log('✨ 按钮悬停效果:', hasHoverEffect ? '✅' : '❌');
} else {
  console.log('❌ 主要按钮未找到');
}

// 检查tooltip
const tooltip = document.querySelector('div[class*="opacity-0 group-hover:opacity-100"]');
if (tooltip) {
  console.log('✅ Tooltip找到:', tooltip.textContent.trim());
} else {
  console.log('❌ Tooltip未找到');
}

// 检查品牌标识
const brandIcon = document.querySelector('div[class*="w-28 h-28"]');
if (brandIcon) {
  console.log('✅ 品牌标识找到');
  const hasGradient = brandIcon.className.includes('bg-gradient');
  const hasHoverEffect = brandIcon.className.includes('hover:scale');
  
  console.log('🎨 品牌标识渐变:', hasGradient ? '✅' : '❌');
  console.log('✨ 品牌标识悬停:', hasHoverEffect ? '✅' : '❌');
} else {
  console.log('❌ 品牌标识未找到');
}

// 检查核心优势卡片
const advantageCards = document.querySelectorAll('div[class*="bg-gradient-to-br from-"]');
console.log('🏆 核心优势卡片数量:', advantageCards.length);

// 检查响应式设计
const hasResponsiveClasses = document.querySelector('[class*="sm:text-"]');
console.log('📱 响应式设计:', hasResponsiveClasses ? '✅' : '❌');

console.log('\n🎉 首页UI验证完成！');
console.log('💡 提示：在不同屏幕尺寸下测试响应式效果');
