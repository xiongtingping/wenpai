// 修复所有字体颜色不统一问题的脚本
console.log('🎨 开始修复字体颜色不统一问题...');

function checkTextColors() {
  console.log('\n🔍 检查页面文字颜色...');
  
  // 检查所有文本元素
  const allElements = document.querySelectorAll('*');
  const colorIssues = [];
  
  allElements.forEach((element, index) => {
    const computedStyle = getComputedStyle(element);
    const color = computedStyle.color;
    const classes = element.className;
    const tagName = element.tagName.toLowerCase();
    const textContent = element.textContent?.trim().substring(0, 50);
    
    // 检查是否是不统一的颜色
    if (color) {
      // 检查是否是刺眼的蓝色
      if (color.includes('rgb(37, 99, 235)') || // text-primary蓝色
          color.includes('rgb(59, 130, 246)') || // 其他蓝色
          color.includes('rgb(29, 78, 216)') ||
          color === 'blue' ||
          color === 'white' && tagName !== 'body') {
        
        colorIssues.push({
          element,
          tagName,
          classes,
          color,
          textContent,
          index
        });
      }
    }
  });
  
  console.log(`📊 发现 ${colorIssues.length} 个可能的颜色问题:`);
  
  colorIssues.forEach((issue, i) => {
    console.log(`${i + 1}. ${issue.tagName}${issue.classes ? '.' + issue.classes.split(' ').join('.') : ''}`);
    console.log(`   颜色: ${issue.color}`);
    console.log(`   内容: "${issue.textContent}"`);
    console.log('---');
  });
  
  return colorIssues;
}

function checkSpecificElements() {
  console.log('\n🎯 检查特定元素的颜色...');
  
  // 检查表格中的数字
  const tableNumbers = document.querySelectorAll('.pricing-table-number, [class*="pricing"]');
  console.log(`📋 找到 ${tableNumbers.length} 个定价相关元素`);
  
  tableNumbers.forEach((element, index) => {
    const color = getComputedStyle(element).color;
    const classes = element.className;
    const text = element.textContent?.trim();
    
    console.log(`📊 定价元素${index + 1}:`);
    console.log(`   类名: ${classes}`);
    console.log(`   颜色: ${color}`);
    console.log(`   内容: "${text}"`);
    
    if (color.includes('rgb(37, 99, 235)') || color.includes('rgb(59, 130, 246)')) {
      console.log('   ❌ 发现蓝色文字！');
    } else {
      console.log('   ✅ 颜色正常');
    }
  });
  
  // 检查标题
  const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
  console.log(`\n📝 检查 ${headings.length} 个标题元素:`);
  
  headings.forEach((heading, index) => {
    const color = getComputedStyle(heading).color;
    const classes = heading.className;
    const text = heading.textContent?.trim().substring(0, 30);
    
    if (color.includes('rgb(37, 99, 235)') || color.includes('rgb(59, 130, 246)') || color === 'blue') {
      console.log(`❌ 标题${index + 1}是蓝色:`);
      console.log(`   类名: ${classes}`);
      console.log(`   颜色: ${color}`);
      console.log(`   内容: "${text}"`);
    }
  });
  
  // 检查按钮
  const buttons = document.querySelectorAll('button, .btn');
  console.log(`\n🔘 检查 ${buttons.length} 个按钮元素:`);
  
  let buttonIssues = 0;
  buttons.forEach((button, index) => {
    const color = getComputedStyle(button).color;
    const bg = getComputedStyle(button).backgroundColor;
    const classes = button.className;
    const text = button.textContent?.trim().substring(0, 20);
    
    if (color.includes('rgb(37, 99, 235)') || color.includes('rgb(59, 130, 246)') || 
        bg.includes('rgb(37, 99, 235)') || bg.includes('rgb(59, 130, 246)')) {
      console.log(`❌ 按钮${index + 1}有蓝色:`);
      console.log(`   类名: ${classes}`);
      console.log(`   文字色: ${color}`);
      console.log(`   背景色: ${bg}`);
      console.log(`   内容: "${text}"`);
      buttonIssues++;
    }
  });
  
  if (buttonIssues === 0) {
    console.log('✅ 所有按钮颜色正常');
  }
}

function checkThemeConsistency() {
  console.log('\n🌈 检查主题一致性...');
  
  // 检查当前主题
  const html = document.documentElement;
  const theme = html.getAttribute('data-theme') || 'default';
  console.log('📋 当前主题:', theme);
  
  // 检查CSS变量
  const computedStyle = getComputedStyle(html);
  const foreground = computedStyle.getPropertyValue('--foreground').trim();
  const primary = computedStyle.getPropertyValue('--primary').trim();
  const mutedForeground = computedStyle.getPropertyValue('--muted-foreground').trim();
  
  console.log('🎨 主题颜色变量:');
  console.log(`   --foreground: ${foreground}`);
  console.log(`   --primary: ${primary}`);
  console.log(`   --muted-foreground: ${mutedForeground}`);
  
  // 检查是否有元素没有使用主题变量
  const elementsWithHardcodedColors = [];
  const allElements = document.querySelectorAll('*');
  
  allElements.forEach(element => {
    const style = element.getAttribute('style');
    if (style && (style.includes('color:') || style.includes('color :'))) {
      if (style.includes('rgb(') || style.includes('#') || style.includes('blue') || style.includes('white')) {
        elementsWithHardcodedColors.push({
          element,
          style,
          tagName: element.tagName,
          classes: element.className
        });
      }
    }
  });
  
  if (elementsWithHardcodedColors.length > 0) {
    console.log(`⚠️ 发现 ${elementsWithHardcodedColors.length} 个使用硬编码颜色的元素:`);
    elementsWithHardcodedColors.forEach((item, index) => {
      console.log(`${index + 1}. ${item.tagName}.${item.classes}`);
      console.log(`   样式: ${item.style}`);
    });
  } else {
    console.log('✅ 没有发现硬编码颜色');
  }
}

function suggestFixes() {
  console.log('\n🛠️ 修复建议:');
  
  const suggestions = [
    '1. 将所有 text-primary 改为 text-foreground',
    '2. 将所有 text-blue-* 改为 text-foreground',
    '3. 将所有 text-white 改为 text-primary-foreground（仅在深色背景上）',
    '4. 确保表格数字使用 text-foreground',
    '5. 确保标题使用 text-foreground',
    '6. 移除所有硬编码的颜色值',
    '7. 使用主题令牌系统保持一致性'
  ];
  
  suggestions.forEach(suggestion => {
    console.log(`   ${suggestion}`);
  });
}

// 主修复函数
function fixFontColors() {
  console.log('🚀 开始字体颜色修复检查...\n');
  
  const colorIssues = checkTextColors();
  checkSpecificElements();
  checkThemeConsistency();
  suggestFixes();
  
  console.log('\n📊 修复检查结果:');
  console.log(`发现颜色问题: ${colorIssues.length} 个`);
  
  if (colorIssues.length === 0) {
    console.log('🎉 字体颜色已统一！');
  } else {
    console.log('⚠️ 仍有字体颜色需要调整');
  }
  
  return colorIssues.length === 0;
}

// 自动运行检查
setTimeout(() => {
  fixFontColors();
}, 1500);

// 导出函数供手动调用
window.fixFontColors = fixFontColors;
window.checkTextColors = checkTextColors;
window.checkSpecificElements = checkSpecificElements;

console.log('✅ 字体颜色修复脚本已加载，1.5秒后自动运行');
console.log('💡 可手动调用: fixFontColors()');
