/**
 * 验证Hero区域图标和Footer logo修复效果
 */

console.log('🔍 验证Hero区域图标和Footer logo修复效果...');

function verifyHeroFooterFixes() {
  console.log('\n=== 📋 Hero区域优势卡片图标检查 ===');
  
  // 检查Hero区域的优势卡片图标
  const heroIcons = document.querySelectorAll('.homepage-container .ds-icon-decorative');
  console.log(`🎯 Hero优势卡片图标数量: ${heroIcons.length}`);
  
  heroIcons.forEach((icon, index) => {
    const computedStyle = window.getComputedStyle(icon);
    const width = computedStyle.width;
    const height = computedStyle.height;
    
    // 检查图标容器尺寸
    console.log(`  图标容器 ${index + 1}: ${width} × ${height}`);
    
    // 检查内部SVG
    const svg = icon.querySelector('svg');
    if (svg) {
      const svgStyle = window.getComputedStyle(svg);
      const svgWidth = svgStyle.width;
      const svgHeight = svgStyle.height;
      console.log(`    内部SVG: ${svgWidth} × ${svgHeight}`);
    }
  });
  
  // 检查图标容器的类名
  const iconContainers = document.querySelectorAll('.homepage-container .enhanced-card .ds-icon-decorative');
  console.log(`📦 使用ds-icon-decorative的容器数量: ${iconContainers.length}`);
  
  console.log('\n=== 🦶 Footer Logo检查 ===');
  
  // 检查Footer logo
  const footerLogo = document.querySelector('.footer-logo');
  if (footerLogo) {
    console.log('✅ Footer logo元素已找到');
    
    const logoStyle = window.getComputedStyle(footerLogo);
    const logoWidth = logoStyle.width;
    const logoHeight = logoStyle.height;
    const logoFilter = logoStyle.filter;
    const logoMixBlend = logoStyle.mixBlendMode;
    const logoBackground = logoStyle.backgroundColor;
    
    console.log(`📏 Logo尺寸: ${logoWidth} × ${logoHeight}`);
    console.log(`🎨 Logo滤镜: ${logoFilter}`);
    console.log(`🔀 混合模式: ${logoMixBlend}`);
    console.log(`🎨 背景色: ${logoBackground}`);
    
    // 检查当前主题
    const isDarkMode = document.documentElement.classList.contains('dark') || 
                      window.matchMedia('(prefers-color-scheme: dark)').matches;
    console.log(`🌙 当前主题: ${isDarkMode ? '深色' : '浅色'}`);
    
  } else {
    console.log('❌ Footer logo元素未找到');
  }
  
  console.log('\n=== 📊 设计系统类名验证 ===');
  
  // 验证设计系统类名的使用
  const dsIconDecorative = document.querySelectorAll('.ds-icon-decorative');
  const dsIconSmall = document.querySelectorAll('.ds-icon-small');
  const dsIconMain = document.querySelectorAll('.ds-icon-main');
  
  console.log(`🎯 ds-icon-decorative 使用数量: ${dsIconDecorative.length}`);
  console.log(`🎯 ds-icon-small 使用数量: ${dsIconSmall.length}`);
  console.log(`🎯 ds-icon-main 使用数量: ${dsIconMain.length}`);
  
  // 检查Hero区域是否正确使用了ds-icon-decorative
  const heroDecorativeIcons = document.querySelectorAll('.homepage-container .enhanced-card .ds-icon-decorative');
  console.log(`✅ Hero区域正确使用ds-icon-decorative: ${heroDecorativeIcons.length === 3 ? '是' : '否'}`);
  
  console.log('\n=== 🎨 视觉效果评估 ===');
  
  // 评估图标尺寸是否合适
  if (heroIcons.length >= 3) {
    const firstIcon = heroIcons[0];
    const iconStyle = window.getComputedStyle(firstIcon);
    const iconWidth = parseInt(iconStyle.width);
    
    if (iconWidth >= 32) {
      console.log('✅ Hero图标容器尺寸合适 (≥32px)');
    } else if (iconWidth >= 24) {
      console.log('⚠️ Hero图标容器尺寸偏小 (24-31px)');
    } else {
      console.log('❌ Hero图标容器尺寸太小 (<24px)');
    }
  }
  
  // 评估logo主题适配
  if (footerLogo) {
    const logoStyle = window.getComputedStyle(footerLogo);
    const hasFilter = logoStyle.filter !== 'none';
    const hasTransparentBg = logoStyle.backgroundColor === 'rgba(0, 0, 0, 0)' || 
                            logoStyle.backgroundColor === 'transparent';
    
    console.log(`🎨 Logo主题适配: ${hasFilter ? '已应用滤镜' : '无滤镜'}`);
    console.log(`🎨 Logo背景透明: ${hasTransparentBg ? '是' : '否'}`);
  }
  
  return {
    heroIconsCount: heroIcons.length,
    footerLogoFound: !!footerLogo,
    decorativeIconsCount: dsIconDecorative.length,
    heroUsesDecorative: heroDecorativeIcons.length === 3
  };
}

// 执行验证
const result = verifyHeroFooterFixes();

console.log('\n🎉 验证完成!');
console.log('📋 结果摘要:', result);

// 提供修复建议
if (result.heroIconsCount < 3) {
  console.log('\n⚠️ Hero区域图标数量不足，请检查组件结构');
}

if (!result.footerLogoFound) {
  console.log('\n⚠️ Footer logo未找到，请检查类名是否正确应用');
}

if (!result.heroUsesDecorative) {
  console.log('\n⚠️ Hero区域未正确使用ds-icon-decorative类名');
}

// 主题切换测试建议
console.log('\n💡 测试建议:');
console.log('1. 切换到深色主题查看Footer logo是否正确显示');
console.log('2. 检查Hero区域图标是否比之前更突出');
console.log('3. 验证图标与文字的视觉平衡是否改善');
