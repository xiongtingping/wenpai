/**
 * 输入框主题感知修复验证脚本
 * 在浏览器控制台中运行此脚本来验证输入框在不同主题下的显示效果
 */

console.log('🎨 开始验证输入框主题感知修复...');

// 主题列表
const THEMES = ['light', 'dark', 'beige', 'green', 'gold', 'rainbow'];

// 获取当前主题
function getCurrentTheme() {
  const html = document.documentElement;
  return html.getAttribute('data-theme') || 'beige';
}

// 切换主题
function switchTheme(theme) {
  const html = document.documentElement;
  html.setAttribute('data-theme', theme);
  console.log(`🔄 切换到主题: ${theme}`);
  
  // 触发主题变更事件
  window.dispatchEvent(new CustomEvent('themeChanged', { detail: { theme } }));
  
  // 等待主题应用
  return new Promise(resolve => setTimeout(resolve, 300));
}

// 检查CSS变量值
function checkThemeVariables(theme) {
  const html = document.documentElement;
  const computedStyle = getComputedStyle(html);
  
  const variables = [
    '--background',
    '--foreground',
    '--surface-1',
    '--surface-2',
    '--surface-3',
    '--border',
    '--input'
  ];
  
  console.log(`\n🎨 ${theme}主题CSS变量值:`);
  variables.forEach(variable => {
    const value = computedStyle.getPropertyValue(variable).trim();
    console.log(`  ${variable}: ${value}`);
  });
}

// 检查输入框样式
function checkInputBoxStyles() {
  console.log('\n📝 检查输入框样式...');
  
  // 查找主要的输入框
  const textareas = document.querySelectorAll('textarea');
  const mentionTextarea = document.querySelector('[placeholder*="原始内容"]');
  
  if (mentionTextarea) {
    const computedStyle = getComputedStyle(mentionTextarea);
    const backgroundColor = computedStyle.backgroundColor;
    const borderColor = computedStyle.borderColor;
    const color = computedStyle.color;
    
    console.log('📋 主输入框样式:');
    console.log(`  背景色: ${backgroundColor}`);
    console.log(`  边框色: ${borderColor}`);
    console.log(`  文字色: ${color}`);
    
    // 检查对比度
    const bgLuminance = getLuminance(backgroundColor);
    const textLuminance = getLuminance(color);
    const contrast = getContrastRatio(bgLuminance, textLuminance);
    
    console.log(`  对比度: ${contrast.toFixed(2)} ${contrast >= 4.5 ? '✅' : '❌'}`);
    
    return {
      backgroundColor,
      borderColor,
      color,
      contrast,
      accessible: contrast >= 4.5
    };
  } else {
    console.log('❌ 未找到主输入框');
    return null;
  }
}

// 计算颜色亮度
function getLuminance(color) {
  // 简化的亮度计算，仅用于演示
  const rgb = color.match(/\d+/g);
  if (!rgb) return 0.5;
  
  const [r, g, b] = rgb.map(x => {
    x = parseInt(x) / 255;
    return x <= 0.03928 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4);
  });
  
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

// 计算对比度
function getContrastRatio(lum1, lum2) {
  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);
  return (brightest + 0.05) / (darkest + 0.05);
}

// 测试所有主题
async function testAllThemes() {
  console.log('\n🔄 开始测试所有主题...');
  
  const results = {};
  
  for (const theme of THEMES) {
    console.log(`\n=== 测试 ${theme} 主题 ===`);
    
    await switchTheme(theme);
    checkThemeVariables(theme);
    const inputStyles = checkInputBoxStyles();
    
    results[theme] = inputStyles;
    
    // 等待一下再测试下一个主题
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  // 输出总结
  console.log('\n📊 测试总结:');
  Object.entries(results).forEach(([theme, styles]) => {
    if (styles) {
      const status = styles.accessible ? '✅' : '❌';
      console.log(`  ${theme}: 对比度 ${styles.contrast.toFixed(2)} ${status}`);
    } else {
      console.log(`  ${theme}: ❌ 无法检测`);
    }
  });
  
  return results;
}

// 快速测试当前主题
function quickTest() {
  const currentTheme = getCurrentTheme();
  console.log(`\n🎯 快速测试当前主题: ${currentTheme}`);
  
  checkThemeVariables(currentTheme);
  checkInputBoxStyles();
}

// 修复验证
function verifyFix() {
  console.log('\n🔧 验证修复效果...');
  
  const issues = [];
  
  // 检查深色主题的surface-1变量
  switchTheme('dark');
  const html = document.documentElement;
  const computedStyle = getComputedStyle(html);
  const darkSurface1 = computedStyle.getPropertyValue('--surface-1').trim();
  
  if (darkSurface1.includes('18%')) {
    console.log('✅ 深色主题surface-1已修复 (18%亮度)');
  } else {
    console.log('❌ 深色主题surface-1未修复');
    issues.push('深色主题surface-1');
  }
  
  // 检查绿色主题的surface变量
  switchTheme('green');
  const greenSurface1 = getComputedStyle(html).getPropertyValue('--surface-1').trim();
  
  if (greenSurface1) {
    console.log('✅ 绿色主题surface变量已添加');
  } else {
    console.log('❌ 绿色主题缺少surface变量');
    issues.push('绿色主题surface变量');
  }
  
  // 检查彩虹主题的surface变量
  switchTheme('rainbow');
  const rainbowSurface1 = getComputedStyle(html).getPropertyValue('--surface-1').trim();
  
  if (rainbowSurface1) {
    console.log('✅ 彩虹主题surface变量已添加');
  } else {
    console.log('❌ 彩虹主题缺少surface变量');
    issues.push('彩虹主题surface变量');
  }
  
  if (issues.length === 0) {
    console.log('\n🎉 所有修复都已生效！');
  } else {
    console.log(`\n⚠️ 发现 ${issues.length} 个问题:`, issues);
  }
  
  return issues.length === 0;
}

// 导出函数供手动调用
window.inputThemeTest = {
  quickTest,
  testAllThemes,
  verifyFix,
  switchTheme,
  getCurrentTheme
};

console.log('\n🚀 测试函数已准备就绪！');
console.log('使用方法:');
console.log('  inputThemeTest.quickTest() - 快速测试当前主题');
console.log('  inputThemeTest.testAllThemes() - 测试所有主题');
console.log('  inputThemeTest.verifyFix() - 验证修复效果');
console.log('  inputThemeTest.switchTheme("dark") - 切换到指定主题');

// 自动运行快速测试
quickTest();
