/**
 * 首页视觉一致性验证脚本
 * 检查设计系统的应用效果
 */

console.log('🎯 开始首页视觉一致性检查...');

// 1. 检查文字尺寸层级
console.log('\n📝 文字尺寸层级检查:');
const titleMain = document.querySelectorAll('.ds-title-main, h1');
const titleSub = document.querySelectorAll('.ds-title-sub');
const titleSection = document.querySelectorAll('.ds-title-section');
const textBody = document.querySelectorAll('.ds-text-body');
const textHelper = document.querySelectorAll('.ds-text-helper');

console.log(`主标题 (ds-title-main): ${titleMain.length}个`);
console.log(`副标题 (ds-title-sub): ${titleSub.length}个`);
console.log(`区块标题 (ds-title-section): ${titleSection.length}个`);
console.log(`正文 (ds-text-body): ${textBody.length}个`);
console.log(`辅助文字 (ds-text-helper): ${textHelper.length}个`);

// 2. 检查图标容器尺寸
console.log('\n🎨 图标容器尺寸检查:');
const iconMain = document.querySelectorAll('.ds-icon-main');
const iconDecorative = document.querySelectorAll('.ds-icon-decorative');
const iconSmall = document.querySelectorAll('.ds-icon-small');

console.log(`主要图标容器 (48px): ${iconMain.length}个`);
console.log(`装饰图标容器 (32px): ${iconDecorative.length}个`);
console.log(`小图标容器 (24px): ${iconSmall.length}个`);

// 3. 检查按钮居中对齐
console.log('\n🎯 按钮居中对齐检查:');
const buttons = document.querySelectorAll('button, .ds-btn-primary, .ds-btn-secondary, .ds-btn-small');
let centeredButtons = 0;
let offsetButtons = [];

buttons.forEach((btn, index) => {
  const rect = btn.getBoundingClientRect();
  const parentRect = btn.parentElement?.getBoundingClientRect();
  
  if (parentRect) {
    const centerOffset = Math.abs((rect.left + rect.width/2) - (parentRect.left + parentRect.width/2));
    
    if (centerOffset < 5) { // 允许5px的误差
      centeredButtons++;
    } else {
      offsetButtons.push({
        index,
        offset: centerOffset.toFixed(2),
        text: btn.textContent?.slice(0, 20) || '无文字'
      });
    }
  }
});

console.log(`✅ 居中按钮: ${centeredButtons}个`);
console.log(`⚠️ 偏移按钮: ${offsetButtons.length}个`);
offsetButtons.forEach(btn => {
  console.log(`  - 按钮 ${btn.index}: "${btn.text}" 偏移 ${btn.offset}px`);
});

// 4. 检查区块间距一致性
console.log('\n📏 区块间距检查:');
const sections = document.querySelectorAll('section, .ds-section-spacing, .ds-section-spacing-small, .ds-section-spacing-large');
const spacings = [];

sections.forEach((section, index) => {
  const styles = getComputedStyle(section);
  const paddingTop = parseInt(styles.paddingTop);
  const paddingBottom = parseInt(styles.paddingBottom);
  
  spacings.push({
    index,
    paddingTop,
    paddingBottom,
    total: paddingTop + paddingBottom,
    className: section.className
  });
});

console.log('区块间距分布:');
spacings.forEach(spacing => {
  console.log(`  区块 ${spacing.index}: ${spacing.paddingTop}px + ${spacing.paddingBottom}px = ${spacing.total}px`);
});

// 5. 检查HowItWorks区域图标
console.log('\n⚡ HowItWorks区域图标检查:');
const howItWorksIcons = document.querySelectorAll('.how-it-works-icon, .homepage-icon');
let properSizedIcons = 0;

howItWorksIcons.forEach((icon, index) => {
  const rect = icon.getBoundingClientRect();
  const isProperSize = rect.width >= 45 && rect.width <= 55 && rect.height >= 45 && rect.height <= 55; // 48px ± 7px
  
  if (isProperSize) {
    properSizedIcons++;
  }
  
  console.log(`  图标 ${index + 1}: ${rect.width.toFixed(1)}px × ${rect.height.toFixed(1)}px ${isProperSize ? '✅' : '❌'}`);
});

console.log(`✅ 正确尺寸图标: ${properSizedIcons}/${howItWorksIcons.length}`);

// 6. 检查Hero区域优势卡片
console.log('\n🏆 Hero区域优势卡片检查:');
const heroCards = document.querySelectorAll('.enhanced-card');
let properCards = 0;

heroCards.forEach((card, index) => {
  const iconContainer = card.querySelector('.ds-icon-small');
  const title = card.querySelector('.ds-title-section');
  const description = card.querySelector('.ds-text-body');
  
  const hasProperStructure = iconContainer && title && description;
  
  if (hasProperStructure) {
    properCards++;
  }
  
  console.log(`  卡片 ${index + 1}: ${hasProperStructure ? '✅ 结构正确' : '❌ 结构异常'}`);
  
  if (iconContainer) {
    const iconRect = iconContainer.getBoundingClientRect();
    console.log(`    图标容器: ${iconRect.width}px × ${iconRect.height}px`);
  }
});

console.log(`✅ 结构正确的卡片: ${properCards}/${heroCards.length}`);

// 7. 检查Footer重新设计
console.log('\n🦶 Footer重新设计检查:');
const footer = document.querySelector('footer');
if (footer) {
  const contactCards = footer.querySelectorAll('.ds-card');
  const brandSection = footer.querySelector('.ds-text-centered');
  const gridLayouts = footer.querySelectorAll('.ds-grid-2');
  
  console.log(`✅ 联系方式卡片: ${contactCards.length}个`);
  console.log(`✅ 品牌区域: ${brandSection ? '存在' : '缺失'}`);
  console.log(`✅ 网格布局: ${gridLayouts.length}个`);
} else {
  console.log('❌ Footer未找到');
}

// 8. 总体评分
console.log('\n🎉 总体评分:');
const totalScore = Math.round(
  (centeredButtons / Math.max(buttons.length, 1)) * 25 +
  (properSizedIcons / Math.max(howItWorksIcons.length, 1)) * 25 +
  (properCards / Math.max(heroCards.length, 1)) * 25 +
  (offsetButtons.length === 0 ? 25 : Math.max(0, 25 - offsetButtons.length * 5))
);

console.log(`📊 视觉一致性得分: ${totalScore}/100`);

if (totalScore >= 90) {
  console.log('🎊 优秀！视觉一致性非常好');
} else if (totalScore >= 75) {
  console.log('👍 良好！还有小幅优化空间');
} else if (totalScore >= 60) {
  console.log('⚠️ 一般，需要进一步优化');
} else {
  console.log('❌ 需要大幅改进');
}

console.log('\n✅ 首页视觉一致性检查完成！');
