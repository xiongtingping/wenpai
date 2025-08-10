// 验证字体设计系统统一性的最终脚本
console.log('🎨 开始验证字体设计系统统一性...');

function checkTypographyTokens() {
  console.log('\n🎯 检查字体令牌系统...');
  
  // 检查CSS变量是否正确定义
  const html = document.documentElement;
  const computedStyle = getComputedStyle(html);
  
  const typographyTokens = [
    '--text-primary',
    '--text-secondary', 
    '--text-tertiary',
    '--text-accent',
    '--text-success',
    '--text-warning',
    '--text-error',
    '--font-family-base',
    '--font-family-mono',
    '--font-family-emoji',
    '--text-xs',
    '--text-sm',
    '--text-base',
    '--text-lg',
    '--text-xl',
    '--text-2xl',
    '--font-weight-normal',
    '--font-weight-medium',
    '--font-weight-semibold',
    '--font-weight-bold',
    '--leading-normal',
    '--leading-relaxed',
    '--tracking-normal'
  ];
  
  console.log('📋 检查字体令牌定义:');
  let missingTokens = 0;
  
  typographyTokens.forEach(token => {
    const value = computedStyle.getPropertyValue(token).trim();
    if (value) {
      console.log(`✅ ${token}: ${value}`);
    } else {
      console.log(`❌ ${token}: 未定义`);
      missingTokens++;
    }
  });
  
  if (missingTokens === 0) {
    console.log('🎉 所有字体令牌都已正确定义！');
  } else {
    console.log(`⚠️ 有 ${missingTokens} 个字体令牌未定义`);
  }
  
  return missingTokens === 0;
}

function checkColorConsistency() {
  console.log('\n🌈 检查字体颜色一致性...');
  
  // 检查是否还有硬编码的蓝色文字
  const problematicColors = [
    'rgb(37, 99, 235)',  // text-primary蓝色
    'rgb(59, 130, 246)',  // text-blue-500
    'rgb(29, 78, 216)',   // text-blue-700
    'blue',
    'white',
    'black'
  ];
  
  const allElements = document.querySelectorAll('*');
  const colorIssues = [];
  
  allElements.forEach(element => {
    const computedStyle = getComputedStyle(element);
    const color = computedStyle.color;
    
    problematicColors.forEach(problemColor => {
      if (color.includes(problemColor) || color === problemColor) {
        colorIssues.push({
          element,
          color,
          text: element.textContent?.trim().substring(0, 30),
          classes: element.className
        });
      }
    });
  });
  
  console.log(`📊 发现 ${colorIssues.length} 个颜色问题:`);
  
  if (colorIssues.length > 0) {
    colorIssues.slice(0, 10).forEach((issue, index) => {
      console.log(`${index + 1}. "${issue.text}"`);
      console.log(`   颜色: ${issue.color}`);
      console.log(`   类名: ${issue.classes}`);
      console.log('---');
    });
    
    if (colorIssues.length > 10) {
      console.log(`... 还有 ${colorIssues.length - 10} 个类似问题`);
    }
  } else {
    console.log('✅ 所有文字颜色都使用了统一令牌！');
  }
  
  return colorIssues.length === 0;
}

function checkFontFamilyConsistency() {
  console.log('\n📝 检查字体族一致性...');
  
  const allElements = document.querySelectorAll('*');
  const fontFamilyIssues = [];
  
  allElements.forEach(element => {
    const computedStyle = getComputedStyle(element);
    const fontFamily = computedStyle.fontFamily;
    const classes = element.className;
    
    // 检查是否使用了系统字体栈
    if (fontFamily && 
        !fontFamily.includes('-apple-system') && 
        !fontFamily.includes('system-ui') &&
        fontFamily !== 'inherit' &&
        !classes.includes('font-mono') &&
        !classes.includes('font-emoji') &&
        !fontFamily.includes('Noto Emoji') &&
        !fontFamily.includes('Monaco')) {
      
      fontFamilyIssues.push({
        element,
        fontFamily,
        text: element.textContent?.trim().substring(0, 30),
        classes
      });
    }
  });
  
  console.log(`📊 发现 ${fontFamilyIssues.length} 个字体族问题:`);
  
  if (fontFamilyIssues.length > 0) {
    fontFamilyIssues.slice(0, 5).forEach((issue, index) => {
      console.log(`${index + 1}. "${issue.text}"`);
      console.log(`   字体族: ${issue.fontFamily}`);
      console.log(`   类名: ${issue.classes}`);
      console.log('---');
    });
  } else {
    console.log('✅ 所有元素都使用了统一的字体族！');
  }
  
  return fontFamilyIssues.length === 0;
}

function checkHeadingHierarchy() {
  console.log('\n📚 检查标题层次系统...');
  
  const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
  console.log(`📋 找到 ${headings.length} 个标题`);
  
  const expectedSizes = {
    'h1': ['36px', '48px', '60px'], // text-4xl, text-5xl, text-6xl
    'h2': ['24px', '30px', '36px'], // text-2xl, text-3xl, text-4xl
    'h3': ['20px', '24px', '30px'], // text-xl, text-2xl, text-3xl
    'h4': ['18px', '20px', '24px'], // text-lg, text-xl, text-2xl
    'h5': ['16px', '18px', '20px'], // text-base, text-lg, text-xl
    'h6': ['14px', '16px', '18px']  // text-sm, text-base, text-lg
  };
  
  let hierarchyIssues = 0;
  
  headings.forEach((heading, index) => {
    const computedStyle = getComputedStyle(heading);
    const fontSize = computedStyle.fontSize;
    const fontWeight = computedStyle.fontWeight;
    const color = computedStyle.color;
    const tagName = heading.tagName.toLowerCase();
    const text = heading.textContent?.trim().substring(0, 40);
    
    console.log(`${tagName.toUpperCase()}: "${text}"`);
    console.log(`   字号: ${fontSize}, 字重: ${fontWeight}`);
    
    // 检查字号是否符合层次
    if (!expectedSizes[tagName].includes(fontSize)) {
      console.log(`   ⚠️ 字号不符合层次规范，建议: ${expectedSizes[tagName].join(' 或 ')}`);
      hierarchyIssues++;
    } else {
      console.log('   ✅ 字号符合层次规范');
    }
    
    // 检查字重
    const weightNum = parseInt(fontWeight);
    if (weightNum < 600) {
      console.log(`   ⚠️ 字重偏轻 (${fontWeight})，建议使用 font-semibold 或 font-bold`);
      hierarchyIssues++;
    } else {
      console.log('   ✅ 字重适当');
    }
    
    console.log('---');
  });
  
  if (hierarchyIssues === 0) {
    console.log('✅ 标题层次系统完全符合规范！');
  } else {
    console.log(`⚠️ 发现 ${hierarchyIssues} 个标题层次问题`);
  }
  
  return hierarchyIssues === 0;
}

function checkResponsiveTypography() {
  console.log('\n📱 检查响应式字体...');
  
  // 检查是否有响应式字体类
  const responsiveElements = document.querySelectorAll('[class*="sm:text-"], [class*="md:text-"], [class*="lg:text-"]');
  console.log(`📋 找到 ${responsiveElements.length} 个响应式字体元素`);
  
  if (responsiveElements.length > 0) {
    console.log('✅ 网站使用了响应式字体设计');
    
    // 检查几个关键元素
    responsiveElements.slice(0, 5).forEach((element, index) => {
      const classes = element.className;
      const text = element.textContent?.trim().substring(0, 30);
      console.log(`${index + 1}. "${text}"`);
      console.log(`   响应式类: ${classes.match(/(?:sm:|md:|lg:)text-\w+/g)?.join(', ')}`);
    });
  } else {
    console.log('⚠️ 未发现响应式字体设计');
  }
  
  return responsiveElements.length > 0;
}

function generateTypographyReport() {
  console.log('\n📊 生成字体系统报告...');
  
  // 统计各种字体使用情况
  const allElements = document.querySelectorAll('*');
  const stats = {
    totalElements: allElements.length,
    textElements: 0,
    headings: document.querySelectorAll('h1, h2, h3, h4, h5, h6').length,
    buttons: document.querySelectorAll('button').length,
    links: document.querySelectorAll('a').length,
    tables: document.querySelectorAll('table').length
  };
  
  allElements.forEach(element => {
    if (element.textContent && element.textContent.trim()) {
      stats.textElements++;
    }
  });
  
  console.log('📈 字体系统统计:');
  console.log(`   总元素数: ${stats.totalElements}`);
  console.log(`   文本元素: ${stats.textElements}`);
  console.log(`   标题数量: ${stats.headings}`);
  console.log(`   按钮数量: ${stats.buttons}`);
  console.log(`   链接数量: ${stats.links}`);
  console.log(`   表格数量: ${stats.tables}`);
  
  return stats;
}

// 主验证函数
function verifyTypographySystem() {
  console.log('🚀 开始验证字体设计系统...\n');
  
  const tokensOk = checkTypographyTokens();
  const colorsOk = checkColorConsistency();
  const fontFamilyOk = checkFontFamilyConsistency();
  const hierarchyOk = checkHeadingHierarchy();
  const responsiveOk = checkResponsiveTypography();
  const stats = generateTypographyReport();
  
  console.log('\n📊 最终验证结果:');
  console.log('字体令牌系统:', tokensOk ? '✅' : '❌');
  console.log('颜色一致性:', colorsOk ? '✅' : '❌');
  console.log('字体族统一:', fontFamilyOk ? '✅' : '❌');
  console.log('标题层次:', hierarchyOk ? '✅' : '❌');
  console.log('响应式设计:', responsiveOk ? '✅' : '❌');
  
  const allPassed = tokensOk && colorsOk && fontFamilyOk && hierarchyOk && responsiveOk;
  
  if (allPassed) {
    console.log('\n🎉 字体设计系统完全统一！');
    console.log('✅ 所有文字使用统一的设计令牌');
    console.log('✅ 颜色层次清晰一致');
    console.log('✅ 字体族完全统一');
    console.log('✅ 标题层次规范');
    console.log('✅ 支持响应式设计');
  } else {
    console.log('\n⚠️ 字体系统仍需进一步优化');
  }
  
  return {
    tokensOk,
    colorsOk,
    fontFamilyOk,
    hierarchyOk,
    responsiveOk,
    stats,
    allPassed
  };
}

// 自动运行验证
setTimeout(() => {
  verifyTypographySystem();
}, 2500);

// 导出函数供手动调用
window.verifyTypographySystem = verifyTypographySystem;
window.checkTypographyTokens = checkTypographyTokens;
window.checkColorConsistency = checkColorConsistency;

console.log('✅ 字体系统验证脚本已加载，2.5秒后自动运行');
console.log('💡 可手动调用: verifyTypographySystem()');
