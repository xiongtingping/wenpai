// 全面修复字体设计系统的脚本
console.log('🎨 开始全面修复字体设计系统...');

// 字体颜色映射表
const colorMapping = {
  // 硬编码颜色 -> 主题令牌
  'text-blue-500': 'text-accent',
  'text-blue-600': 'text-accent',
  'text-blue-700': 'text-accent',
  'text-white': 'text-on-primary',
  'text-black': 'text-primary',
  'text-gray-500': 'text-secondary',
  'text-gray-600': 'text-secondary',
  'text-gray-700': 'text-primary',
  'text-gray-800': 'text-primary',
  'text-gray-900': 'text-primary',
  'text-slate-500': 'text-secondary',
  'text-slate-600': 'text-secondary',
  'text-slate-700': 'text-primary',
  'text-muted-foreground': 'text-secondary',
  'text-foreground': 'text-primary'
};

// 字号映射表
const sizeMapping = {
  'text-xs': 'text-xs',      // 12px
  'text-sm': 'text-sm',      // 14px
  'text-base': 'text-base',  // 16px
  'text-lg': 'text-lg',      // 18px
  'text-xl': 'text-xl',      // 20px
  'text-2xl': 'text-2xl',    // 24px
  'text-3xl': 'text-3xl',    // 30px
  'text-4xl': 'text-4xl',    // 36px
  'text-5xl': 'text-5xl',    // 48px
  'text-6xl': 'text-6xl'     // 60px
};

// 字重映射表
const weightMapping = {
  'font-light': 'font-light',
  'font-normal': 'font-normal',
  'font-medium': 'font-medium',
  'font-semibold': 'font-semibold',
  'font-bold': 'font-bold',
  'font-extrabold': 'font-extrabold'
};

function checkTypographyConsistency() {
  console.log('\n🔍 检查字体一致性...');
  
  // 检查所有文本元素
  const allElements = document.querySelectorAll('*');
  const issues = [];
  
  allElements.forEach((element, index) => {
    const classes = element.className;
    const computedStyle = getComputedStyle(element);
    const color = computedStyle.color;
    const fontSize = computedStyle.fontSize;
    const fontWeight = computedStyle.fontWeight;
    const fontFamily = computedStyle.fontFamily;
    
    // 检查硬编码颜色
    if (color.includes('rgb(37, 99, 235)') || // 蓝色
        color.includes('rgb(59, 130, 246)') ||
        color.includes('rgb(29, 78, 216)') ||
        color === 'blue' || color === 'white' || color === 'black') {
      issues.push({
        element,
        type: 'hardcoded-color',
        value: color,
        classes,
        text: element.textContent?.trim().substring(0, 30)
      });
    }
    
    // 检查硬编码字体族
    if (fontFamily && !fontFamily.includes('-apple-system') && 
        !fontFamily.includes('system-ui') && 
        fontFamily !== 'inherit' && 
        !classes.includes('font-mono') && 
        !classes.includes('font-emoji')) {
      issues.push({
        element,
        type: 'hardcoded-font-family',
        value: fontFamily,
        classes,
        text: element.textContent?.trim().substring(0, 30)
      });
    }
    
    // 检查内联样式
    const style = element.getAttribute('style');
    if (style) {
      if (style.includes('color:') || style.includes('font-size:') || 
          style.includes('font-weight:') || style.includes('font-family:')) {
        issues.push({
          element,
          type: 'inline-style',
          value: style,
          classes,
          text: element.textContent?.trim().substring(0, 30)
        });
      }
    }
  });
  
  console.log(`📊 发现 ${issues.length} 个字体问题:`);
  
  // 按类型分组显示
  const groupedIssues = {};
  issues.forEach(issue => {
    if (!groupedIssues[issue.type]) {
      groupedIssues[issue.type] = [];
    }
    groupedIssues[issue.type].push(issue);
  });
  
  Object.keys(groupedIssues).forEach(type => {
    console.log(`\n${type.toUpperCase()}:`);
    groupedIssues[type].slice(0, 5).forEach((issue, index) => {
      console.log(`${index + 1}. "${issue.text}"`);
      console.log(`   值: ${issue.value}`);
      console.log(`   类: ${issue.classes}`);
    });
    if (groupedIssues[type].length > 5) {
      console.log(`   ... 还有 ${groupedIssues[type].length - 5} 个类似问题`);
    }
  });
  
  return issues;
}

function checkHeadingHierarchy() {
  console.log('\n📝 检查标题层次...');
  
  const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
  console.log(`📋 找到 ${headings.length} 个标题`);
  
  const headingIssues = [];
  
  headings.forEach((heading, index) => {
    const computedStyle = getComputedStyle(heading);
    const fontSize = computedStyle.fontSize;
    const fontWeight = computedStyle.fontWeight;
    const color = computedStyle.color;
    const classes = heading.className;
    const tagName = heading.tagName.toLowerCase();
    const text = heading.textContent?.trim().substring(0, 40);
    
    console.log(`${tagName.toUpperCase()}: "${text}"`);
    console.log(`   字号: ${fontSize}, 字重: ${fontWeight}, 颜色: ${color}`);
    console.log(`   类名: ${classes}`);
    
    // 检查是否符合层次规范
    const expectedSizes = {
      'h1': ['48px', '60px', '36px'], // text-4xl, text-6xl, text-3xl
      'h2': ['30px', '36px', '24px'], // text-3xl, text-4xl, text-2xl
      'h3': ['24px', '30px', '20px'], // text-2xl, text-3xl, text-xl
      'h4': ['20px', '24px', '18px'], // text-xl, text-2xl, text-lg
      'h5': ['18px', '20px', '16px'], // text-lg, text-xl, text-base
      'h6': ['16px', '18px', '14px']  // text-base, text-lg, text-sm
    };
    
    if (!expectedSizes[tagName].includes(fontSize)) {
      headingIssues.push({
        element: heading,
        tagName,
        fontSize,
        expectedSizes: expectedSizes[tagName],
        text
      });
    }
    
    console.log('---');
  });
  
  if (headingIssues.length > 0) {
    console.log(`⚠️ 发现 ${headingIssues.length} 个标题层次问题:`);
    headingIssues.forEach((issue, index) => {
      console.log(`${index + 1}. ${issue.tagName}: "${issue.text}"`);
      console.log(`   当前字号: ${issue.fontSize}`);
      console.log(`   建议字号: ${issue.expectedSizes.join(' 或 ')}`);
    });
  } else {
    console.log('✅ 标题层次符合规范');
  }
  
  return headingIssues;
}

function checkButtonTypography() {
  console.log('\n🔘 检查按钮字体...');
  
  const buttons = document.querySelectorAll('button, .btn');
  console.log(`📋 找到 ${buttons.length} 个按钮`);
  
  const buttonIssues = [];
  
  buttons.forEach((button, index) => {
    const computedStyle = getComputedStyle(button);
    const fontSize = computedStyle.fontSize;
    const fontWeight = computedStyle.fontWeight;
    const color = computedStyle.color;
    const classes = button.className;
    const text = button.textContent?.trim().substring(0, 20);
    
    // 检查按钮字体规范
    if (fontSize === '12px' && !classes.includes('text-xs')) {
      buttonIssues.push({
        element: button,
        issue: 'small-button-without-text-xs',
        text,
        fontSize,
        classes
      });
    }
    
    if (parseInt(fontWeight) < 500 && !classes.includes('font-light')) {
      buttonIssues.push({
        element: button,
        issue: 'button-too-light',
        text,
        fontWeight,
        classes
      });
    }
    
    if (color.includes('rgb(37, 99, 235)') && !button.closest('.bg-primary')) {
      buttonIssues.push({
        element: button,
        issue: 'blue-text-without-primary-bg',
        text,
        color,
        classes
      });
    }
  });
  
  if (buttonIssues.length > 0) {
    console.log(`⚠️ 发现 ${buttonIssues.length} 个按钮字体问题:`);
    buttonIssues.forEach((issue, index) => {
      console.log(`${index + 1}. ${issue.issue}: "${issue.text}"`);
      console.log(`   类名: ${issue.classes}`);
    });
  } else {
    console.log('✅ 按钮字体符合规范');
  }
  
  return buttonIssues;
}

function checkTableTypography() {
  console.log('\n📊 检查表格字体...');
  
  const tables = document.querySelectorAll('table');
  console.log(`📋 找到 ${tables.length} 个表格`);
  
  const tableIssues = [];
  
  tables.forEach((table, tableIndex) => {
    const cells = table.querySelectorAll('td, th');
    
    cells.forEach((cell, cellIndex) => {
      const computedStyle = getComputedStyle(cell);
      const color = computedStyle.color;
      const fontSize = computedStyle.fontSize;
      const classes = cell.className;
      const text = cell.textContent?.trim().substring(0, 20);
      
      // 检查表格单元格颜色
      if (color.includes('rgb(37, 99, 235)') || color.includes('rgb(59, 130, 246)')) {
        tableIssues.push({
          element: cell,
          issue: 'blue-text-in-table',
          text,
          color,
          classes
        });
      }
      
      // 检查表格字号
      if (fontSize === '12px' && !classes.includes('text-xs')) {
        tableIssues.push({
          element: cell,
          issue: 'small-text-without-class',
          text,
          fontSize,
          classes
        });
      }
    });
  });
  
  if (tableIssues.length > 0) {
    console.log(`⚠️ 发现 ${tableIssues.length} 个表格字体问题:`);
    tableIssues.forEach((issue, index) => {
      console.log(`${index + 1}. ${issue.issue}: "${issue.text}"`);
      console.log(`   值: ${issue.color || issue.fontSize}`);
      console.log(`   类名: ${issue.classes}`);
    });
  } else {
    console.log('✅ 表格字体符合规范');
  }
  
  return tableIssues;
}

function generateFixSuggestions(issues, headingIssues, buttonIssues, tableIssues) {
  console.log('\n🛠️ 修复建议:');
  
  const suggestions = [];
  
  // 颜色修复建议
  if (issues.some(i => i.type === 'hardcoded-color')) {
    suggestions.push('1. 颜色统一:');
    suggestions.push('   - 将 text-blue-* 改为 text-accent');
    suggestions.push('   - 将 text-white 改为 text-on-primary (仅深色背景)');
    suggestions.push('   - 将 text-black/gray-* 改为 text-primary');
    suggestions.push('   - 将 text-muted-foreground 改为 text-secondary');
  }
  
  // 字号修复建议
  if (headingIssues.length > 0) {
    suggestions.push('2. 标题层次:');
    suggestions.push('   - H1: text-4xl (36px) 或 text-6xl (60px)');
    suggestions.push('   - H2: text-3xl (30px) 或 text-4xl (36px)');
    suggestions.push('   - H3: text-2xl (24px) 或 text-3xl (30px)');
    suggestions.push('   - H4: text-xl (20px) 或 text-2xl (24px)');
    suggestions.push('   - H5: text-lg (18px) 或 text-xl (20px)');
    suggestions.push('   - H6: text-base (16px) 或 text-lg (18px)');
  }
  
  // 字重修复建议
  suggestions.push('3. 字重规范:');
  suggestions.push('   - 标题: font-bold 或 font-semibold');
  suggestions.push('   - 正文: font-normal');
  suggestions.push('   - 强调: font-medium');
  suggestions.push('   - 按钮: font-medium 或 font-semibold');
  
  // 字体族修复建议
  if (issues.some(i => i.type === 'hardcoded-font-family')) {
    suggestions.push('4. 字体族统一:');
    suggestions.push('   - 移除硬编码 font-family');
    suggestions.push('   - 使用系统默认字体栈');
    suggestions.push('   - 代码使用 font-mono');
    suggestions.push('   - Emoji使用 font-emoji');
  }
  
  // 内联样式修复建议
  if (issues.some(i => i.type === 'inline-style')) {
    suggestions.push('5. 移除内联样式:');
    suggestions.push('   - 将 style="color: ..." 改为 Tailwind 类');
    suggestions.push('   - 将 style="font-size: ..." 改为 text-* 类');
    suggestions.push('   - 将 style="font-weight: ..." 改为 font-* 类');
  }
  
  suggestions.forEach(suggestion => {
    console.log(suggestion);
  });
  
  return suggestions;
}

// 主修复函数
function fixTypographySystem() {
  console.log('🚀 开始字体系统修复检查...\n');
  
  const issues = checkTypographyConsistency();
  const headingIssues = checkHeadingHierarchy();
  const buttonIssues = checkButtonTypography();
  const tableIssues = checkTableTypography();
  
  const suggestions = generateFixSuggestions(issues, headingIssues, buttonIssues, tableIssues);
  
  console.log('\n📊 修复检查总结:');
  console.log(`字体一致性问题: ${issues.length}`);
  console.log(`标题层次问题: ${headingIssues.length}`);
  console.log(`按钮字体问题: ${buttonIssues.length}`);
  console.log(`表格字体问题: ${tableIssues.length}`);
  
  const totalIssues = issues.length + headingIssues.length + buttonIssues.length + tableIssues.length;
  
  if (totalIssues === 0) {
    console.log('\n🎉 字体系统完全统一！');
  } else {
    console.log(`\n⚠️ 共发现 ${totalIssues} 个需要修复的问题`);
  }
  
  return {
    issues,
    headingIssues,
    buttonIssues,
    tableIssues,
    suggestions,
    totalIssues
  };
}

// 自动运行检查
setTimeout(() => {
  fixTypographySystem();
}, 2000);

// 导出函数供手动调用
window.fixTypographySystem = fixTypographySystem;
window.checkTypographyConsistency = checkTypographyConsistency;
window.checkHeadingHierarchy = checkHeadingHierarchy;

console.log('✅ 字体系统修复脚本已加载，2秒后自动运行');
console.log('💡 可手动调用: fixTypographySystem()');
