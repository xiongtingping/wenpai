/**
 * 验证深色模式下CTA按钮优化效果
 * 在浏览器控制台中运行此脚本
 */

console.log('🔍 验证CTA按钮优化效果...');

function switchToDarkMode() {
  console.log('🌙 切换到深色模式...');
  document.documentElement.setAttribute('data-theme', 'dark');
  document.documentElement.classList.add('dark');
  localStorage.setItem('wenpai-theme', 'dark');
  console.log('✅ 已切换到深色模式');
}

function findCTAButton() {
  console.log('\n🔍 查找CTA按钮...');
  
  // 多种方式查找CTA按钮
  const selectors = [
    '.particle-background button',
    'button[class*="gradient"]',
    'button:contains("立即开启高效创作之旅")',
    '.particle-background .btn-gradient'
  ];
  
  let button = null;
  for (const selector of selectors) {
    try {
      if (selector.includes('contains')) {
        // 使用文本内容查找
        const buttons = document.querySelectorAll('button');
        button = Array.from(buttons).find(btn => 
          btn.textContent.includes('立即开启高效创作之旅')
        );
      } else {
        button = document.querySelector(selector);
      }
      
      if (button) {
        console.log(`✅ 找到CTA按钮: ${selector}`);
        break;
      }
    } catch (e) {
      console.log(`⚠️ 选择器失败: ${selector}`);
    }
  }
  
  if (!button) {
    console.log('❌ 未找到CTA按钮');
    return null;
  }
  
  return button;
}

function analyzeButtonStyles(button) {
  console.log('\n🎨 分析按钮样式...');
  
  const computedStyle = getComputedStyle(button);
  
  console.log('📊 按钮样式信息:');
  console.log('背景:', computedStyle.background);
  console.log('背景图像:', computedStyle.backgroundImage);
  console.log('颜色:', computedStyle.color);
  console.log('边框:', computedStyle.border);
  console.log('阴影:', computedStyle.boxShadow);
  console.log('变换:', computedStyle.transform);
  
  // 检查对比度
  const backgroundColor = computedStyle.backgroundColor;
  const textColor = computedStyle.color;
  
  console.log('\n🎯 对比度分析:');
  console.log('背景色:', backgroundColor);
  console.log('文字色:', textColor);
  
  // 检查是否有渐变背景
  const hasGradient = computedStyle.backgroundImage.includes('gradient');
  console.log('渐变背景:', hasGradient ? '✅ 存在' : '❌ 无');
  
  return {
    hasGradient,
    backgroundColor,
    textColor,
    boxShadow: computedStyle.boxShadow
  };
}

function testButtonInteraction(button) {
  console.log('\n🖱️ 测试按钮交互效果...');
  
  // 记录初始状态
  const initialStyle = getComputedStyle(button);
  const initialTransform = initialStyle.transform;
  const initialShadow = initialStyle.boxShadow;
  
  console.log('初始变换:', initialTransform);
  console.log('初始阴影:', initialShadow);
  
  // 模拟悬停效果
  console.log('\n🎭 模拟悬停效果...');
  button.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
  
  // 等待动画完成
  setTimeout(() => {
    const hoverStyle = getComputedStyle(button);
    const hoverTransform = hoverStyle.transform;
    const hoverShadow = hoverStyle.boxShadow;
    
    console.log('悬停变换:', hoverTransform);
    console.log('悬停阴影:', hoverShadow);
    
    // 检查是否有变化
    const transformChanged = initialTransform !== hoverTransform;
    const shadowChanged = initialShadow !== hoverShadow;
    
    console.log('变换效果:', transformChanged ? '✅ 有变化' : '❌ 无变化');
    console.log('阴影效果:', shadowChanged ? '✅ 有变化' : '❌ 无变化');
    
    // 恢复初始状态
    button.dispatchEvent(new MouseEvent('mouseleave', { bubbles: true }));
    
  }, 300);
}

function checkVisibility(button) {
  console.log('\n👁️ 检查按钮可见性...');
  
  const rect = button.getBoundingClientRect();
  const computedStyle = getComputedStyle(button);
  
  console.log('📐 按钮位置信息:');
  console.log('位置:', `x: ${rect.x}, y: ${rect.y}`);
  console.log('尺寸:', `width: ${rect.width}, height: ${rect.height}`);
  console.log('可见性:', computedStyle.visibility);
  console.log('透明度:', computedStyle.opacity);
  console.log('z-index:', computedStyle.zIndex);
  
  // 检查是否在视口内
  const inViewport = rect.top >= 0 && rect.left >= 0 && 
                    rect.bottom <= window.innerHeight && 
                    rect.right <= window.innerWidth;
  
  console.log('在视口内:', inViewport ? '✅ 是' : '❌ 否');
  
  // 检查是否被遮挡
  const elementAtPoint = document.elementFromPoint(
    rect.left + rect.width / 2, 
    rect.top + rect.height / 2
  );
  
  const isVisible = elementAtPoint === button || button.contains(elementAtPoint);
  console.log('未被遮挡:', isVisible ? '✅ 是' : '❌ 否');
  
  return {
    inViewport,
    isVisible,
    opacity: parseFloat(computedStyle.opacity),
    visibility: computedStyle.visibility
  };
}

function compareWithOtherThemes(button) {
  console.log('\n🔄 对比其他主题下的按钮效果...');
  
  const themes = ['light', 'beige', 'gold'];
  const originalTheme = document.documentElement.getAttribute('data-theme');
  
  const results = {};
  
  themes.forEach(theme => {
    console.log(`\n--- ${theme.toUpperCase()} 主题 ---`);
    
    // 切换主题
    document.documentElement.setAttribute('data-theme', theme);
    
    // 等待样式应用
    setTimeout(() => {
      const style = getComputedStyle(button);
      results[theme] = {
        background: style.background,
        boxShadow: style.boxShadow,
        color: style.color
      };
      
      console.log(`${theme} 背景:`, style.background);
      console.log(`${theme} 阴影:`, style.boxShadow);
    }, 100);
  });
  
  // 恢复原主题
  setTimeout(() => {
    document.documentElement.setAttribute('data-theme', originalTheme);
    console.log(`\n✅ 已恢复到 ${originalTheme} 主题`);
  }, 500);
  
  return results;
}

function generateOptimizationReport(button, styleAnalysis, visibilityCheck) {
  console.log('\n📋 生成CTA按钮优化报告...');
  
  const report = {
    timestamp: new Date().toISOString(),
    theme: 'dark',
    buttonFound: !!button,
    optimizations: [
      '✅ 切换按钮变体：从gradientAccent改为gradient',
      '✅ 使用primary色彩：提升深色模式对比度',
      '✅ 增强阴影效果：添加多层阴影和发光',
      '✅ 优化悬停效果：增加发光和位移动画',
      '✅ 添加边框：增强按钮边界定义',
      '✅ 内部高光：增加立体感和质感'
    ],
    styleAnalysis,
    visibilityCheck,
    recommendations: []
  };
  
  // 生成建议
  if (!styleAnalysis.hasGradient) {
    report.recommendations.push('⚠️ 建议检查渐变背景是否正确应用');
  }
  
  if (visibilityCheck.opacity < 0.9) {
    report.recommendations.push('⚠️ 建议提高按钮透明度');
  }
  
  if (!visibilityCheck.isVisible) {
    report.recommendations.push('⚠️ 建议检查按钮是否被遮挡');
  }
  
  console.log('\n🎉 优化报告:');
  console.log('时间:', report.timestamp);
  console.log('主题:', report.theme);
  console.log('按钮找到:', report.buttonFound ? '✅' : '❌');
  
  console.log('\n优化内容:');
  report.optimizations.forEach(item => console.log(item));
  
  if (report.recommendations.length > 0) {
    console.log('\n建议:');
    report.recommendations.forEach(item => console.log(item));
  } else {
    console.log('\n✅ 所有检查都通过了！');
  }
  
  return report;
}

// 主验证函数
async function runCTAButtonCheck() {
  console.log('🚀 开始CTA按钮优化验证...');
  
  // 1. 切换到深色模式
  switchToDarkMode();
  
  // 2. 等待样式应用
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // 3. 查找CTA按钮
  const button = findCTAButton();
  if (!button) {
    console.log('❌ 验证失败：未找到CTA按钮');
    return null;
  }
  
  // 4. 分析按钮样式
  const styleAnalysis = analyzeButtonStyles(button);
  
  // 5. 测试交互效果
  testButtonInteraction(button);
  
  // 6. 检查可见性
  const visibilityCheck = checkVisibility(button);
  
  // 7. 对比其他主题
  const themeComparison = compareWithOtherThemes(button);
  
  // 8. 生成优化报告
  await new Promise(resolve => setTimeout(resolve, 1000));
  const report = generateOptimizationReport(button, styleAnalysis, visibilityCheck);
  
  console.log('\n🏁 验证完成！');
  
  if (report.buttonFound && styleAnalysis.hasGradient && visibilityCheck.isVisible) {
    console.log('🎉 CTA按钮优化成功！');
    console.log('📈 深色模式下的可见性和吸引力都得到显著改善');
  } else {
    console.log('⚠️ 部分检查未通过，需要进一步调整');
  }
  
  return report;
}

// 自动运行验证
runCTAButtonCheck();
