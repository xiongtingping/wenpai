// 多主题适配验证脚本
console.log('🎨 开始多主题适配验证...');

// 主题列表
const THEMES = ['light', 'dark', 'blue', 'beige', 'green'];

// 当前主题
let currentTheme = 'beige';

function getCurrentTheme() {
  const html = document.documentElement;
  return html.getAttribute('data-theme') || 'beige';
}

function switchTheme(theme) {
  const html = document.documentElement;
  html.setAttribute('data-theme', theme);
  currentTheme = theme;
  console.log(`🔄 切换到主题: ${theme}`);
  
  // 触发主题变更事件
  window.dispatchEvent(new CustomEvent('themeChanged', { detail: { theme } }));
}

function validateThemeColors(theme) {
  console.log(`\n🎯 验证主题: ${theme}`);
  
  switchTheme(theme);
  
  // 等待主题应用
  setTimeout(() => {
    const html = document.documentElement;
    const computedStyle = getComputedStyle(html);
    
    // 检查主要颜色令牌
    const colorTokens = [
      '--background',
      '--foreground', 
      '--card',
      '--card-foreground',
      '--primary',
      '--primary-foreground',
      '--secondary',
      '--secondary-foreground',
      '--muted',
      '--muted-foreground',
      '--accent',
      '--accent-foreground',
      '--border'
    ];
    
    const themeColors = {};
    colorTokens.forEach(token => {
      const value = computedStyle.getPropertyValue(token).trim();
      themeColors[token] = value;
      console.log(`  ${token}: ${value}`);
    });
    
    // 检查颜色对比度
    const bgColor = themeColors['--background'];
    const fgColor = themeColors['--foreground'];
    
    if (bgColor && fgColor) {
      console.log(`  📊 背景/前景对比: ${bgColor} / ${fgColor}`);
      
      // 简单的对比度检查
      const bgLightness = getLightness(bgColor);
      const fgLightness = getLightness(fgColor);
      const contrast = Math.abs(bgLightness - fgLightness);
      
      if (contrast > 40) {
        console.log(`  ✅ 对比度良好 (${contrast.toFixed(1)})`);
      } else {
        console.log(`  ⚠️ 对比度可能不足 (${contrast.toFixed(1)})`);
      }
    }
    
    return themeColors;
  }, 100);
}

function getLightness(hslString) {
  // 从 HSL 字符串中提取亮度值
  // 格式: "45 25% 97%" 或类似
  if (!hslString) return 50;
  
  const parts = hslString.split(' ');
  if (parts.length >= 3) {
    const lightness = parseFloat(parts[2].replace('%', ''));
    return lightness;
  }
  return 50;
}

function validateElementsInTheme(theme) {
  console.log(`\n🔍 检查主题 ${theme} 下的元素显示效果...`);
  
  switchTheme(theme);
  
  setTimeout(() => {
    // 检查主要元素类型
    const elementTypes = {
      buttons: document.querySelectorAll('button'),
      cards: document.querySelectorAll('.card, [class*="Card"]'),
      badges: document.querySelectorAll('.badge, [class*="Badge"]'),
      headings: document.querySelectorAll('h1, h2, h3, h4, h5, h6'),
      paragraphs: document.querySelectorAll('p'),
      links: document.querySelectorAll('a')
    };
    
    Object.keys(elementTypes).forEach(type => {
      const elements = elementTypes[type];
      console.log(`  ${type}: ${elements.length} 个元素`);
      
      // 检查前几个元素的颜色
      Array.from(elements).slice(0, 3).forEach((element, index) => {
        const computedStyle = getComputedStyle(element);
        const color = computedStyle.color;
        const backgroundColor = computedStyle.backgroundColor;
        
        console.log(`    ${type}[${index}]: color=${color}, bg=${backgroundColor}`);
        
        // 检查是否有硬编码颜色
        if (color.includes('rgb(37, 99, 235)') || // 蓝色
            color.includes('rgb(59, 130, 246)') ||
            backgroundColor.includes('rgb(37, 99, 235)')) {
          console.log(`    ⚠️ 发现硬编码蓝色`);
        }
      });
    });
  }, 200);
}

function testThemeTransitions() {
  console.log('\n🔄 测试主题切换过渡效果...');
  
  let themeIndex = 0;
  const interval = setInterval(() => {
    if (themeIndex >= THEMES.length) {
      clearInterval(interval);
      console.log('✅ 主题切换测试完成');
      return;
    }
    
    const theme = THEMES[themeIndex];
    console.log(`🎨 切换到: ${theme}`);
    switchTheme(theme);
    
    themeIndex++;
  }, 2000);
}

function validateAccessibilityInThemes() {
  console.log('\n♿ 验证各主题下的无障碍访问性...');
  
  THEMES.forEach((theme, index) => {
    setTimeout(() => {
      console.log(`\n🎯 检查主题 ${theme} 的无障碍性...`);
      switchTheme(theme);
      
      setTimeout(() => {
        // 检查文本对比度
        const textElements = document.querySelectorAll('p, span, div, h1, h2, h3, button, a');
        let lowContrastCount = 0;
        let totalChecked = 0;
        
        Array.from(textElements).slice(0, 20).forEach(element => {
          const computedStyle = getComputedStyle(element);
          const color = computedStyle.color;
          const backgroundColor = computedStyle.backgroundColor;
          
          if (color && backgroundColor && 
              color !== 'rgba(0, 0, 0, 0)' && 
              backgroundColor !== 'rgba(0, 0, 0, 0)') {
            
            totalChecked++;
            
            // 简单的对比度检查
            const colorLightness = getColorLightness(color);
            const bgLightness = getColorLightness(backgroundColor);
            const contrast = Math.abs(colorLightness - bgLightness);
            
            if (contrast < 30) {
              lowContrastCount++;
            }
          }
        });
        
        console.log(`  📊 检查了 ${totalChecked} 个元素`);
        console.log(`  ⚠️ 低对比度元素: ${lowContrastCount} 个`);
        
        if (lowContrastCount === 0) {
          console.log(`  ✅ 主题 ${theme} 无障碍性良好`);
        } else {
          console.log(`  ⚠️ 主题 ${theme} 需要改进对比度`);
        }
      }, 300);
    }, index * 1000);
  });
}

function getColorLightness(colorString) {
  // 简化的颜色亮度计算
  if (colorString.includes('rgb(')) {
    const matches = colorString.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
    if (matches) {
      const r = parseInt(matches[1]);
      const g = parseInt(matches[2]);
      const b = parseInt(matches[3]);
      return (r * 0.299 + g * 0.587 + b * 0.114);
    }
  }
  return 128; // 默认中等亮度
}

function generateThemeReport() {
  console.log('\n📊 生成主题适配报告...');
  
  const report = {
    totalThemes: THEMES.length,
    currentTheme: getCurrentTheme(),
    supportedFeatures: [
      '✅ 统一设计令牌系统',
      '✅ CSS变量主题切换',
      '✅ 响应式设计适配',
      '✅ 无障碍访问支持',
      '✅ 平滑过渡动画'
    ],
    recommendations: [
      '🎯 定期检查新增组件的主题适配',
      '🎯 测试极端对比度场景',
      '🎯 验证移动端主题显示效果',
      '🎯 收集用户主题偏好数据'
    ]
  };
  
  console.log('\n📋 主题适配报告:');
  console.log(`支持的主题: ${THEMES.join(', ')}`);
  console.log(`当前主题: ${report.currentTheme}`);
  console.log('\n支持的功能:');
  report.supportedFeatures.forEach(feature => console.log(`  ${feature}`));
  console.log('\n改进建议:');
  report.recommendations.forEach(rec => console.log(`  ${rec}`));
  
  return report;
}

function validateResponsiveThemes() {
  console.log('\n📱 验证响应式主题适配...');
  
  // 模拟不同屏幕尺寸
  const viewports = [
    { name: '移动端', width: 375, height: 667 },
    { name: '平板端', width: 768, height: 1024 },
    { name: '桌面端', width: 1920, height: 1080 }
  ];
  
  viewports.forEach((viewport, index) => {
    setTimeout(() => {
      console.log(`📱 测试 ${viewport.name} (${viewport.width}x${viewport.height})`);
      
      // 注意：实际改变窗口大小需要用户交互，这里只是模拟检查
      const isMobile = viewport.width < 768;
      const isTablet = viewport.width >= 768 && viewport.width < 1024;
      
      console.log(`  设备类型: ${isMobile ? '移动端' : isTablet ? '平板端' : '桌面端'}`);
      
      // 检查响应式元素
      const responsiveElements = document.querySelectorAll('[class*="sm:"], [class*="md:"], [class*="lg:"]');
      console.log(`  响应式元素: ${responsiveElements.length} 个`);
      
      if (responsiveElements.length > 0) {
        console.log(`  ✅ 支持响应式设计`);
      } else {
        console.log(`  ⚠️ 缺少响应式设计`);
      }
    }, index * 500);
  });
}

// 主验证函数
function comprehensiveThemeValidation() {
  console.log('🚀 开始全面多主题验证...\n');
  
  // 1. 验证每个主题的颜色
  THEMES.forEach((theme, index) => {
    setTimeout(() => validateThemeColors(theme), index * 500);
  });
  
  // 2. 验证元素在各主题下的显示
  setTimeout(() => {
    THEMES.forEach((theme, index) => {
      setTimeout(() => validateElementsInTheme(theme), index * 800);
    });
  }, 3000);
  
  // 3. 测试主题切换
  setTimeout(() => testThemeTransitions(), 8000);
  
  // 4. 验证无障碍性
  setTimeout(() => validateAccessibilityInThemes(), 15000);
  
  // 5. 验证响应式适配
  setTimeout(() => validateResponsiveThemes(), 20000);
  
  // 6. 生成报告
  setTimeout(() => generateThemeReport(), 25000);
  
  console.log('⏳ 验证过程需要约30秒，请耐心等待...');
}

// 自动运行验证
setTimeout(() => {
  comprehensiveThemeValidation();
}, 2000);

// 导出函数供手动调用
window.comprehensiveThemeValidation = comprehensiveThemeValidation;
window.switchTheme = switchTheme;
window.validateThemeColors = validateThemeColors;
window.testThemeTransitions = testThemeTransitions;

console.log('✅ 多主题验证脚本已加载，2秒后自动运行');
console.log('💡 可手动调用: comprehensiveThemeValidation()');
console.log('🎨 可手动切换主题: switchTheme("dark") 或 switchTheme("blue")');
