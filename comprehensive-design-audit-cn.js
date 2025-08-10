// 全面设计系统审查脚本 - 中文版
console.log('🎨 开始全面设计系统审查...');

// 硬编码颜色检测模式
const HARDCODED_PATTERNS = {
  textColors: [
    'text-blue-50', 'text-blue-100', 'text-blue-200', 'text-blue-300', 'text-blue-400',
    'text-blue-500', 'text-blue-600', 'text-blue-700', 'text-blue-800', 'text-blue-900',
    'text-white', 'text-black',
    'text-gray-50', 'text-gray-100', 'text-gray-200', 'text-gray-300', 'text-gray-400',
    'text-gray-500', 'text-gray-600', 'text-gray-700', 'text-gray-800', 'text-gray-900',
    'text-slate-50', 'text-slate-100', 'text-slate-200', 'text-slate-300', 'text-slate-400',
    'text-slate-500', 'text-slate-600', 'text-slate-700', 'text-slate-800', 'text-slate-900'
  ],
  backgroundColors: [
    'bg-blue-50', 'bg-blue-100', 'bg-blue-200', 'bg-blue-300', 'bg-blue-400',
    'bg-blue-500', 'bg-blue-600', 'bg-blue-700', 'bg-blue-800', 'bg-blue-900',
    'bg-white', 'bg-black',
    'bg-gray-50', 'bg-gray-100', 'bg-gray-200', 'bg-gray-300', 'bg-gray-400',
    'bg-gray-500', 'bg-gray-600', 'bg-gray-700', 'bg-gray-800', 'bg-gray-900',
    'bg-slate-50', 'bg-slate-100', 'bg-slate-200', 'bg-slate-300', 'bg-slate-400',
    'bg-slate-500', 'bg-slate-600', 'bg-slate-700', 'bg-slate-800', 'bg-slate-900'
  ],
  borderColors: [
    'border-blue-200', 'border-blue-300', 'border-blue-400', 'border-blue-500',
    'border-white', 'border-black',
    'border-gray-200', 'border-gray-300', 'border-gray-400', 'border-gray-500',
    'border-slate-200', 'border-slate-300', 'border-slate-400', 'border-slate-500'
  ]
};

// 正确的设计令牌映射
const DESIGN_TOKEN_MAPPING = {
  // 文字颜色映射
  'text-white': 'text-primary-foreground',
  'text-black': 'text-primary',
  'text-gray-500': 'text-secondary',
  'text-gray-600': 'text-secondary',
  'text-gray-700': 'text-primary',
  'text-gray-800': 'text-primary',
  'text-gray-900': 'text-primary',
  'text-blue-500': 'text-accent',
  'text-blue-600': 'text-accent',
  'text-blue-700': 'text-accent',
  'text-slate-500': 'text-secondary',
  'text-slate-600': 'text-secondary',
  'text-slate-700': 'text-primary',
  'text-muted-foreground': 'text-secondary',
  'text-foreground': 'text-primary',
  
  // 背景颜色映射
  'bg-white': 'bg-background',
  'bg-gray-50': 'bg-background',
  'bg-gray-100': 'bg-accent',
  'bg-gray-200': 'bg-accent',
  'bg-blue-50': 'bg-accent',
  'bg-blue-100': 'bg-accent',
  'bg-blue-500': 'bg-primary',
  'bg-blue-600': 'bg-primary',
  'bg-slate-50': 'bg-background',
  'bg-slate-100': 'bg-accent',
  
  // 边框颜色映射
  'border-white': 'border-border',
  'border-gray-200': 'border-border',
  'border-gray-300': 'border-border',
  'border-blue-200': 'border-border',
  'border-blue-300': 'border-border',
  'border-slate-200': 'border-border'
};

// 主题列表
const THEMES = ['light', 'dark', 'blue', 'beige', 'green'];
let auditResults = {
  totalIssues: 0,
  fixedIssues: 0,
  remainingIssues: 0,
  themeIssues: {},
  componentIssues: {},
  pageIssues: {}
};

function getCurrentTheme() {
  const html = document.documentElement;
  return html.getAttribute('data-theme') || 'beige';
}

function switchTheme(theme) {
  const html = document.documentElement;
  html.setAttribute('data-theme', theme);
  console.log(`🔄 切换到主题: ${theme}`);
  
  // 触发主题变更事件
  window.dispatchEvent(new CustomEvent('themeChanged', { detail: { theme } }));
  
  // 等待主题应用
  return new Promise(resolve => setTimeout(resolve, 300));
}

function scanForHardcodedColors() {
  console.log('\n🔍 第一轮：扫描硬编码颜色...');
  
  const allElements = document.querySelectorAll('*');
  const issues = [];
  
  allElements.forEach((element, index) => {
    const classes = element.className;
    if (!classes || typeof classes !== 'string') return;
    
    const classList = classes.split(' ');
    
    // 检查硬编码文字颜色
    HARDCODED_PATTERNS.textColors.forEach(pattern => {
      if (classList.includes(pattern)) {
        issues.push({
          type: 'hardcoded-text-color',
          element: element,
          current: pattern,
          suggested: DESIGN_TOKEN_MAPPING[pattern] || 'text-primary',
          location: getElementLocation(element),
          severity: 'high'
        });
      }
    });
    
    // 检查硬编码背景颜色
    HARDCODED_PATTERNS.backgroundColors.forEach(pattern => {
      if (classList.includes(pattern)) {
        issues.push({
          type: 'hardcoded-background-color',
          element: element,
          current: pattern,
          suggested: DESIGN_TOKEN_MAPPING[pattern] || 'bg-background',
          location: getElementLocation(element),
          severity: 'high'
        });
      }
    });
    
    // 检查硬编码边框颜色
    HARDCODED_PATTERNS.borderColors.forEach(pattern => {
      if (classList.includes(pattern)) {
        issues.push({
          type: 'hardcoded-border-color',
          element: element,
          current: pattern,
          suggested: DESIGN_TOKEN_MAPPING[pattern] || 'border-border',
          location: getElementLocation(element),
          severity: 'medium'
        });
      }
    });
    
    // 检查内联样式
    const style = element.getAttribute('style');
    if (style) {
      if (style.includes('color:') || style.includes('background-color:') || 
          style.includes('font-size:') || style.includes('font-weight:')) {
        issues.push({
          type: 'inline-styles',
          element: element,
          current: style,
          suggested: '使用Tailwind类替换内联样式',
          location: getElementLocation(element),
          severity: 'medium'
        });
      }
    }
  });
  
  console.log(`📊 发现 ${issues.length} 个硬编码颜色问题`);
  
  // 按类型分组显示
  const groupedIssues = {};
  issues.forEach(issue => {
    if (!groupedIssues[issue.type]) {
      groupedIssues[issue.type] = [];
    }
    groupedIssues[issue.type].push(issue);
  });
  
  Object.keys(groupedIssues).forEach(type => {
    const typeIssues = groupedIssues[type];
    console.log(`\n${type.toUpperCase()}: ${typeIssues.length} 个问题`);
    typeIssues.slice(0, 5).forEach((issue, index) => {
      console.log(`  ${index + 1}. ${issue.location}`);
      console.log(`     当前: ${issue.current}`);
      console.log(`     建议: ${issue.suggested}`);
    });
    if (typeIssues.length > 5) {
      console.log(`     ... 还有 ${typeIssues.length - 5} 个类似问题`);
    }
  });
  
  auditResults.totalIssues += issues.length;
  return issues;
}

function getElementLocation(element) {
  // 尝试获取元素的位置信息
  const tagName = element.tagName.toLowerCase();
  const id = element.id ? `#${element.id}` : '';
  const classes = element.className ? `.${element.className.split(' ').slice(0, 2).join('.')}` : '';
  const text = element.textContent ? element.textContent.trim().substring(0, 30) : '';
  
  return `${tagName}${id}${classes} "${text}${text.length > 30 ? '...' : ''}"`;
}

function checkTypographyConsistency() {
  console.log('\n📝 第二轮：检查字体一致性...');
  
  const issues = [];
  
  // 检查标题层次
  const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
  console.log(`📋 检查 ${headings.length} 个标题元素...`);
  
  headings.forEach((heading, index) => {
    const computedStyle = getComputedStyle(heading);
    const fontSize = computedStyle.fontSize;
    const fontWeight = parseInt(computedStyle.fontWeight);
    const color = computedStyle.color;
    const tagName = heading.tagName.toLowerCase();
    
    // 检查字重
    if (fontWeight < 600) {
      issues.push({
        type: 'heading-font-weight',
        element: heading,
        current: `font-weight: ${fontWeight}`,
        suggested: 'font-semibold 或 font-bold',
        location: getElementLocation(heading),
        severity: 'medium'
      });
    }
    
    // 检查颜色
    if (color.includes('rgb(37, 99, 235)') || color.includes('rgb(59, 130, 246)')) {
      issues.push({
        type: 'heading-hardcoded-color',
        element: heading,
        current: color,
        suggested: 'text-primary',
        location: getElementLocation(heading),
        severity: 'high'
      });
    }
  });
  
  // 检查正文文字
  const paragraphs = document.querySelectorAll('p, span, div');
  let checkedParagraphs = 0;
  
  Array.from(paragraphs).slice(0, 50).forEach(p => {
    const computedStyle = getComputedStyle(p);
    const color = computedStyle.color;
    const fontWeight = parseInt(computedStyle.fontWeight);
    
    if (p.textContent && p.textContent.trim().length > 10) {
      checkedParagraphs++;
      
      // 检查正文字重
      if (fontWeight > 500 && !p.closest('button') && !p.closest('h1, h2, h3, h4, h5, h6')) {
        issues.push({
          type: 'body-text-font-weight',
          element: p,
          current: `font-weight: ${fontWeight}`,
          suggested: 'font-normal',
          location: getElementLocation(p),
          severity: 'low'
        });
      }
      
      // 检查正文颜色
      if (color.includes('rgb(37, 99, 235)') || color.includes('rgb(59, 130, 246)')) {
        issues.push({
          type: 'body-text-hardcoded-color',
          element: p,
          current: color,
          suggested: 'text-primary 或 text-secondary',
          location: getElementLocation(p),
          severity: 'high'
        });
      }
    }
  });
  
  console.log(`📊 检查了 ${checkedParagraphs} 个正文元素，发现 ${issues.length} 个字体问题`);
  
  auditResults.totalIssues += issues.length;
  return issues;
}

function checkUIComponents() {
  console.log('\n🧩 第三轮：检查UI组件...');
  
  const issues = [];
  
  // 检查按钮组件
  const buttons = document.querySelectorAll('button');
  console.log(`🔘 检查 ${buttons.length} 个按钮...`);
  
  buttons.forEach(button => {
    const computedStyle = getComputedStyle(button);
    const fontWeight = parseInt(computedStyle.fontWeight);
    const color = computedStyle.color;
    const backgroundColor = computedStyle.backgroundColor;
    
    // 检查按钮字重
    if (fontWeight < 500) {
      issues.push({
        type: 'button-font-weight',
        element: button,
        current: `font-weight: ${fontWeight}`,
        suggested: 'font-medium 或 font-semibold',
        location: getElementLocation(button),
        severity: 'medium'
      });
    }
    
    // 检查按钮颜色
    if (color.includes('rgb(37, 99, 235)') || backgroundColor.includes('rgb(37, 99, 235)')) {
      issues.push({
        type: 'button-hardcoded-color',
        element: button,
        current: `color: ${color}, bg: ${backgroundColor}`,
        suggested: '使用设计令牌',
        location: getElementLocation(button),
        severity: 'high'
      });
    }
  });
  
  // 检查卡片组件
  const cards = document.querySelectorAll('.card, [class*="Card"], .bg-card');
  console.log(`🃏 检查 ${cards.length} 个卡片...`);
  
  cards.forEach(card => {
    const computedStyle = getComputedStyle(card);
    const backgroundColor = computedStyle.backgroundColor;
    
    if (backgroundColor.includes('rgb(37, 99, 235)') || 
        backgroundColor.includes('rgb(240, 248, 255)')) {
      issues.push({
        type: 'card-hardcoded-background',
        element: card,
        current: backgroundColor,
        suggested: 'bg-card 或 bg-accent',
        location: getElementLocation(card),
        severity: 'high'
      });
    }
  });
  
  // 检查Badge组件
  const badges = document.querySelectorAll('.badge, [class*="Badge"]');
  console.log(`🏷️ 检查 ${badges.length} 个Badge...`);
  
  badges.forEach(badge => {
    const computedStyle = getComputedStyle(badge);
    const color = computedStyle.color;
    const backgroundColor = computedStyle.backgroundColor;
    
    if (color.includes('rgb(37, 99, 235)') || backgroundColor.includes('rgb(37, 99, 235)')) {
      issues.push({
        type: 'badge-hardcoded-color',
        element: badge,
        current: `color: ${color}, bg: ${backgroundColor}`,
        suggested: '使用Badge变体',
        location: getElementLocation(badge),
        severity: 'medium'
      });
    }
  });
  
  console.log(`📊 UI组件检查完成，发现 ${issues.length} 个问题`);
  
  auditResults.totalIssues += issues.length;
  return issues;
}

async function checkMultiThemeCompatibility() {
  console.log('\n🌈 第四轮：检查多主题兼容性...');

  const themeIssues = {};

  for (const theme of THEMES) {
    console.log(`\n🎨 测试主题: ${theme}`);
    await switchTheme(theme);

    const issues = [];

    // 检查主题变量定义
    const html = document.documentElement;
    const computedStyle = getComputedStyle(html);

    const requiredTokens = [
      '--background', '--foreground', '--card', '--card-foreground',
      '--primary', '--primary-foreground', '--secondary', '--secondary-foreground',
      '--muted', '--muted-foreground', '--accent', '--accent-foreground',
      '--destructive', '--destructive-foreground', '--border', '--input', '--ring'
    ];

    let missingTokens = 0;
    requiredTokens.forEach(token => {
      const value = computedStyle.getPropertyValue(token).trim();
      if (!value) {
        missingTokens++;
        issues.push({
          type: 'missing-theme-token',
          token: token,
          theme: theme,
          severity: 'high'
        });
      }
    });

    console.log(`  📊 主题令牌: ${requiredTokens.length - missingTokens}/${requiredTokens.length} 已定义`);

    // 检查颜色对比度
    const textElements = document.querySelectorAll('p, span, h1, h2, h3, button, a');
    let lowContrastCount = 0;

    Array.from(textElements).slice(0, 20).forEach(element => {
      const computedStyle = getComputedStyle(element);
      const color = computedStyle.color;
      const backgroundColor = computedStyle.backgroundColor;

      if (color && backgroundColor &&
          color !== 'rgba(0, 0, 0, 0)' &&
          backgroundColor !== 'rgba(0, 0, 0, 0)') {

        const contrast = calculateColorContrast(color, backgroundColor);
        if (contrast < 4.5) { // WCAG AA标准
          lowContrastCount++;
          issues.push({
            type: 'low-contrast',
            element: element,
            color: color,
            backgroundColor: backgroundColor,
            contrast: contrast,
            theme: theme,
            severity: 'medium'
          });
        }
      }
    });

    console.log(`  ⚠️ 低对比度元素: ${lowContrastCount} 个`);

    themeIssues[theme] = issues;
    auditResults.themeIssues[theme] = issues.length;
  }

  // 切换回默认主题
  await switchTheme('beige');

  const totalThemeIssues = Object.values(themeIssues).reduce((sum, issues) => sum + issues.length, 0);
  console.log(`📊 多主题检查完成，发现 ${totalThemeIssues} 个问题`);

  auditResults.totalIssues += totalThemeIssues;
  return themeIssues;
}

function calculateColorContrast(color1, color2) {
  // 简化的对比度计算
  const rgb1 = parseRGB(color1);
  const rgb2 = parseRGB(color2);

  if (!rgb1 || !rgb2) return 10; // 假设对比度足够

  const l1 = getRelativeLuminance(rgb1);
  const l2 = getRelativeLuminance(rgb2);

  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);

  return (lighter + 0.05) / (darker + 0.05);
}

function parseRGB(colorString) {
  const match = colorString.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
  if (match) {
    return {
      r: parseInt(match[1]),
      g: parseInt(match[2]),
      b: parseInt(match[3])
    };
  }
  return null;
}

function getRelativeLuminance(rgb) {
  const { r, g, b } = rgb;
  const [rs, gs, bs] = [r, g, b].map(c => {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

function checkResponsiveDesign() {
  console.log('\n📱 第五轮：检查响应式设计...');

  const issues = [];

  // 检查响应式类的使用
  const responsiveElements = document.querySelectorAll('[class*="sm:"], [class*="md:"], [class*="lg:"], [class*="xl:"]');
  console.log(`📊 找到 ${responsiveElements.length} 个响应式元素`);

  // 检查固定尺寸元素
  const fixedSizeElements = document.querySelectorAll('[style*="width:"], [style*="height:"]');
  fixedSizeElements.forEach(element => {
    const style = element.getAttribute('style');
    if (style && (style.includes('px') || style.includes('pt'))) {
      issues.push({
        type: 'fixed-size-element',
        element: element,
        current: style,
        suggested: '使用响应式单位(rem, %, vw, vh)',
        location: getElementLocation(element),
        severity: 'low'
      });
    }
  });

  // 检查容器宽度
  const containers = document.querySelectorAll('.container, [class*="container"]');
  console.log(`📦 检查 ${containers.length} 个容器元素`);

  containers.forEach(container => {
    const computedStyle = getComputedStyle(container);
    const maxWidth = computedStyle.maxWidth;

    if (maxWidth === 'none' && !container.classList.contains('w-full')) {
      issues.push({
        type: 'container-no-max-width',
        element: container,
        current: 'max-width: none',
        suggested: '设置合适的最大宽度',
        location: getElementLocation(container),
        severity: 'low'
      });
    }
  });

  console.log(`📊 响应式设计检查完成，发现 ${issues.length} 个问题`);

  auditResults.totalIssues += issues.length;
  return issues;
}

async function runComprehensiveAudit() {
  console.log('🚀 开始全面设计系统审查...\n');
  console.log('=' .repeat(60));

  // 重置审查结果
  auditResults = {
    totalIssues: 0,
    fixedIssues: 0,
    remainingIssues: 0,
    themeIssues: {},
    componentIssues: {},
    pageIssues: {}
  };

  const startTime = Date.now();

  try {
    // 第一轮：硬编码颜色扫描
    const hardcodedIssues = scanForHardcodedColors();

    // 第二轮：字体一致性检查
    const typographyIssues = checkTypographyConsistency();

    // 第三轮：UI组件检查
    const componentIssues = checkUIComponents();

    // 第四轮：多主题兼容性检查
    const themeIssues = await checkMultiThemeCompatibility();

    // 第五轮：响应式设计检查
    const responsiveIssues = checkResponsiveDesign();

    // 生成综合报告
    const endTime = Date.now();
    const duration = (endTime - startTime) / 1000;

    console.log('\n' + '=' .repeat(60));
    console.log('📋 全面审查报告');
    console.log('=' .repeat(60));

    console.log(`\n⏱️ 审查耗时: ${duration.toFixed(2)} 秒`);
    console.log(`📊 总问题数: ${auditResults.totalIssues}`);

    console.log('\n📈 问题分类统计:');
    console.log(`  🎨 硬编码颜色: ${hardcodedIssues.length} 个`);
    console.log(`  📝 字体问题: ${typographyIssues.length} 个`);
    console.log(`  🧩 UI组件问题: ${componentIssues.length} 个`);
    console.log(`  🌈 主题兼容性: ${Object.values(themeIssues).reduce((sum, issues) => sum + issues.length, 0)} 个`);
    console.log(`  📱 响应式问题: ${responsiveIssues.length} 个`);

    console.log('\n🌈 各主题问题统计:');
    THEMES.forEach(theme => {
      const count = auditResults.themeIssues[theme] || 0;
      console.log(`  ${theme}: ${count} 个问题`);
    });

    // 生成修复建议
    generateFixSuggestions(hardcodedIssues, typographyIssues, componentIssues, responsiveIssues);

    return {
      totalIssues: auditResults.totalIssues,
      hardcodedIssues,
      typographyIssues,
      componentIssues,
      themeIssues,
      responsiveIssues,
      duration
    };

  } catch (error) {
    console.error('❌ 审查过程中出现错误:', error);
    return null;
  }
}

function generateFixSuggestions(hardcodedIssues, typographyIssues, componentIssues, responsiveIssues) {
  console.log('\n🛠️ 修复建议:');
  console.log('-' .repeat(40));

  if (hardcodedIssues.length > 0) {
    console.log('\n🔴 高优先级 - 硬编码颜色修复:');
    console.log('  1. 将所有 text-blue-* 替换为 text-accent');
    console.log('  2. 将所有 text-gray-* 替换为 text-primary/text-secondary');
    console.log('  3. 将所有 bg-blue-* 替换为 bg-primary/bg-accent');
    console.log('  4. 将所有 bg-gray-* 替换为 bg-background/bg-accent');
  }

  if (typographyIssues.length > 0) {
    console.log('\n🟡 中优先级 - 字体系统修复:');
    console.log('  1. 标题使用 font-bold 或 font-semibold');
    console.log('  2. 正文使用 font-normal');
    console.log('  3. 按钮使用 font-medium');
    console.log('  4. 统一使用 text-primary/text-secondary');
  }

  if (componentIssues.length > 0) {
    console.log('\n🟠 中优先级 - UI组件修复:');
    console.log('  1. 按钮组件使用统一的变体');
    console.log('  2. 卡片组件使用 bg-card');
    console.log('  3. Badge组件使用预定义变体');
  }

  if (responsiveIssues.length > 0) {
    console.log('\n🟢 低优先级 - 响应式优化:');
    console.log('  1. 移除固定像素尺寸');
    console.log('  2. 使用响应式单位');
    console.log('  3. 添加断点适配');
  }

  console.log('\n📋 下一步行动计划:');
  console.log('  1. 优先修复硬编码颜色问题');
  console.log('  2. 统一字体系统');
  console.log('  3. 优化UI组件');
  console.log('  4. 验证多主题兼容性');
  console.log('  5. 测试响应式设计');
}

// 导出函数
window.runComprehensiveAudit = runComprehensiveAudit;
window.scanForHardcodedColors = scanForHardcodedColors;
window.checkTypographyConsistency = checkTypographyConsistency;
window.checkUIComponents = checkUIComponents;
window.checkMultiThemeCompatibility = checkMultiThemeCompatibility;
window.checkResponsiveDesign = checkResponsiveDesign;
window.switchTheme = switchTheme;

console.log('✅ 全面设计系统审查脚本已加载');
console.log('💡 使用 runComprehensiveAudit() 开始审查');
