/**
 * 副标题排版验证脚本
 * 在浏览器控制台中运行此脚本来验证副标题排版效果
 */

console.log('🔍 开始验证副标题排版...');

// 查找副标题容器
const subtitleContainer = document.querySelector('.max-w-4xl.mx-auto.text-center');
if (!subtitleContainer) {
  console.log('❌ 未找到副标题容器');
} else {
  console.log('✅ 找到副标题容器');
  
  // 检查第一行：核心价值主张
  const firstLine = subtitleContainer.querySelector('p strong');
  if (firstLine) {
    console.log('✅ 找到第一行文案:', firstLine.textContent.trim());
    
    // 检查渐变效果
    const hasGradient = firstLine.className.includes('bg-gradient');
    console.log('🎨 第一行渐变效果:', hasGradient ? '✅' : '❌');
  } else {
    console.log('❌ 未找到第一行文案');
  }
  
  // 检查两行之间的间距
  const firstLineContainer = subtitleContainer.querySelector('.mb-6');
  if (firstLineContainer) {
    console.log('✅ 第一行容器有正确的底部间距 (mb-6)');
  } else {
    console.log('❌ 第一行容器缺少底部间距');
  }
  
  // 检查第二行：四个要点
  const secondLine = subtitleContainer.querySelector('.hero-subtitle-container');
  if (secondLine) {
    console.log('✅ 找到第二行容器');
    
    // 检查四个要点
    const featureItems = secondLine.querySelectorAll('.hero-feature-item');
    console.log('📋 要点数量:', featureItems.length);
    
    if (featureItems.length === 4) {
      console.log('✅ 四个要点数量正确');
      
      featureItems.forEach((item, index) => {
        const separator = item.querySelector('.hero-feature-separator');
        const text = item.querySelector('span:last-child');
        
        if (separator && text) {
          console.log(`  ${index + 1}. ${separator.textContent} ${text.textContent}`);
          
          // 检查分隔符样式
          const separatorColor = window.getComputedStyle(separator).color;
          console.log(`     分隔符颜色: ${separatorColor}`);
          
          // 检查悬停效果
          const hasHoverEffect = item.className.includes('hover:scale-105');
          console.log(`     悬停效果: ${hasHoverEffect ? '✅' : '❌'}`);
        } else {
          console.log(`❌ 要点${index + 1}结构不完整`);
        }
      });
    } else {
      console.log('❌ 要点数量不正确，应该是4个');
    }
  } else {
    console.log('❌ 未找到第二行容器');
  }
}

// 检查整体布局
console.log('\n📐 布局检查:');

// 检查居中对齐
const mainContainer = document.querySelector('.max-w-4xl.mx-auto.text-center');
if (mainContainer) {
  const containerStyles = window.getComputedStyle(mainContainer);
  console.log('📍 容器对齐方式:');
  console.log('  - text-align:', containerStyles.textAlign);
  console.log('  - margin:', containerStyles.margin);
  console.log('  - max-width:', containerStyles.maxWidth);
}

// 检查间距
const firstLineDiv = document.querySelector('.mb-6');
const secondLineDiv = document.querySelector('.hero-subtitle-container');

if (firstLineDiv && secondLineDiv) {
  const firstRect = firstLineDiv.getBoundingClientRect();
  const secondRect = secondLineDiv.getBoundingClientRect();
  const spacing = secondRect.top - firstRect.bottom;
  
  console.log('📏 两行间距:', spacing, 'px');
  
  if (spacing >= 20 && spacing <= 40) {
    console.log('✅ 两行间距合适 (20-40px)');
  } else {
    console.log('❌ 两行间距不合适');
  }
}

// 检查响应式设计
console.log('\n📱 响应式设计检查:');
const viewportWidth = window.innerWidth;
console.log('  - 视口宽度:', viewportWidth, 'px');

const featureContainer = document.querySelector('.flex.flex-wrap.justify-center');
if (featureContainer) {
  const containerStyles = window.getComputedStyle(featureContainer);
  console.log('  - flex布局:', containerStyles.display);
  console.log('  - 换行设置:', containerStyles.flexWrap);
  console.log('  - 对齐方式:', containerStyles.justifyContent);
  
  // 检查gap设置
  const gapClasses = featureContainer.className.match(/gap-[xy]-\d+/g);
  console.log('  - Gap类名:', gapClasses);
}

// 检查字体和颜色
console.log('\n🎨 样式检查:');
const firstLineText = document.querySelector('p strong');
const secondLineText = document.querySelector('.hero-subtitle-container');

if (firstLineText) {
  const firstStyles = window.getComputedStyle(firstLineText);
  console.log('第一行样式:');
  console.log('  - 字体大小:', firstStyles.fontSize);
  console.log('  - 字体粗细:', firstStyles.fontWeight);
  console.log('  - 行高:', firstStyles.lineHeight);
}

if (secondLineText) {
  const secondStyles = window.getComputedStyle(secondLineText);
  console.log('第二行样式:');
  console.log('  - 字体大小:', secondStyles.fontSize);
  console.log('  - 字体粗细:', secondStyles.fontWeight);
  console.log('  - 行高:', secondStyles.lineHeight);
  console.log('  - 颜色:', secondStyles.color);
}

console.log('\n🎉 副标题排版验证完成！');
console.log('💡 提示：调整浏览器窗口大小测试响应式效果');
