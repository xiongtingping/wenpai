/**
 * 最终图标可见性测试脚本
 * 在浏览器控制台中运行此脚本来验证所有图标修复效果
 */

function runFinalIconVisibilityTest() {
  console.log('🔍 开始最终图标可见性测试...');
  
  const results = {
    buttonConsistency: testButtonStyleConsistency(),
    iconVisibility: testAllIconVisibility(),
    themeCompatibility: testThemeCompatibility(),
    navigationIcons: testNavigationIcons(),
    platformIcons: testPlatformIcons()
  };
  
  // 输出总结
  console.log('\n📊 测试结果总结:');
  let allPassed = true;
  
  Object.entries(results).forEach(([test, result]) => {
    const status = result.passed ? '✅' : '❌';
    console.log(`${status} ${test}: ${result.message}`);
    if (!result.passed) allPassed = false;
  });
  
  if (allPassed) {
    console.log('\n🎉 所有图标可见性测试通过！修复成功！');
  } else {
    console.log('\n⚠️ 仍有部分问题需要修复');
  }
  
  return results;
}

function testButtonStyleConsistency() {
  console.log('\n🔘 测试按钮样式一致性...');
  
  // 查找"立即邀请好友"和"解锁高级功能"按钮
  const inviteButton = findButtonByText('立即邀请好友');
  const upgradeButton = findButtonByText('解锁高级功能');
  
  if (!inviteButton && !upgradeButton) {
    return {
      passed: true,
      message: '未找到目标按钮（可能未显示）'
    };
  }
  
  if (!inviteButton || !upgradeButton) {
    return {
      passed: true,
      message: '只找到一个按钮（正常情况）'
    };
  }
  
  const inviteStyle = getComputedStyle(inviteButton);
  const upgradeStyle = getComputedStyle(upgradeButton);
  
  // 检查关键样式属性
  const inviteHeight = inviteStyle.height;
  const upgradeHeight = upgradeStyle.height;
  const inviteBg = inviteStyle.backgroundImage || inviteStyle.backgroundColor;
  const upgradeBg = upgradeStyle.backgroundImage || upgradeStyle.backgroundColor;
  
  console.log('立即邀请好友按钮:');
  console.log(`  高度: ${inviteHeight}, 背景: ${inviteBg}`);
  console.log('解锁高级功能按钮:');
  console.log(`  高度: ${upgradeHeight}, 背景: ${upgradeBg}`);
  
  const heightMatch = inviteHeight === upgradeHeight;
  const bgSimilar = inviteBg === upgradeBg || (inviteBg.includes('gradient') && upgradeBg.includes('gradient'));
  
  return {
    passed: heightMatch && bgSimilar,
    message: `高度${heightMatch ? '一致' : '不一致'}, 背景${bgSimilar ? '一致' : '不一致'}`
  };
}

function testAllIconVisibility() {
  console.log('\n🔘 测试所有图标可见性...');
  
  const icons = document.querySelectorAll('svg, .lucide, [class*="icon"]');
  const invisibleIcons = [];
  const lowContrastIcons = [];
  
  icons.forEach((icon, index) => {
    const style = getComputedStyle(icon);
    const color = style.color;
    const opacity = parseFloat(style.opacity);
    const visibility = style.visibility;
    
    // 检查图标是否完全不可见
    if (opacity === 0 || visibility === 'hidden' || 
        color === 'transparent' || color === 'rgba(0, 0, 0, 0)') {
      invisibleIcons.push({
        element: icon,
        index,
        reason: `opacity: ${opacity}, visibility: ${visibility}, color: ${color}`
      });
    }
    
    // 检查低对比度（可能的可见性问题）
    if (color && (color.includes('rgba(') || color.includes('hsla('))) {
      const alphaMatch = color.match(/[rgba|hsla]\([^)]*,\s*([0-9.]+)\)/);
      if (alphaMatch && parseFloat(alphaMatch[1]) < 0.5) {
        lowContrastIcons.push({
          element: icon,
          index,
          color,
          alpha: alphaMatch[1]
        });
      }
    }
  });
  
  console.log(`找到 ${icons.length} 个图标`);
  console.log(`完全不可见图标: ${invisibleIcons.length} 个`);
  console.log(`低对比度图标: ${lowContrastIcons.length} 个`);
  
  if (invisibleIcons.length > 0) {
    console.log('不可见图标详情:', invisibleIcons.slice(0, 3));
  }
  
  if (lowContrastIcons.length > 0) {
    console.log('低对比度图标详情:', lowContrastIcons.slice(0, 3));
  }
  
  return {
    passed: invisibleIcons.length === 0 && lowContrastIcons.length < 5,
    message: `${invisibleIcons.length} 个不可见图标, ${lowContrastIcons.length} 个低对比度图标`
  };
}

function testThemeCompatibility() {
  console.log('\n🌙 测试主题兼容性...');
  
  const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
  console.log(`当前主题: ${currentTheme}`);
  
  // 检查主题切换按钮
  const themeToggle = document.querySelector('[aria-label="切换主题"]') || 
                     document.querySelector('[title="切换主题"]');
  
  if (!themeToggle) {
    return {
      passed: false,
      message: '未找到主题切换按钮'
    };
  }
  
  const toggleStyle = getComputedStyle(themeToggle);
  const icon = themeToggle.querySelector('svg');
  
  if (!icon) {
    return {
      passed: false,
      message: '主题切换按钮中未找到图标'
    };
  }
  
  const iconStyle = getComputedStyle(icon);
  const iconColor = iconStyle.color;
  const buttonBg = toggleStyle.backgroundColor;
  const buttonBorder = toggleStyle.borderColor;
  
  console.log('主题切换按钮:');
  console.log(`  图标颜色: ${iconColor}`);
  console.log(`  按钮背景: ${buttonBg}`);
  console.log(`  按钮边框: ${buttonBorder}`);
  
  // 检查是否有足够的对比度
  const hasVisibleIcon = iconColor !== 'transparent' && iconColor !== 'rgba(0, 0, 0, 0)';
  const hasVisibleBg = buttonBg !== 'transparent' && buttonBg !== 'rgba(0, 0, 0, 0)';
  const hasBorder = buttonBorder !== 'transparent' && buttonBorder !== 'rgba(0, 0, 0, 0)';
  
  return {
    passed: hasVisibleIcon && (hasVisibleBg || hasBorder),
    message: `图标${hasVisibleIcon ? '可见' : '不可见'}, 背景${hasVisibleBg ? '可见' : '不可见'}, 边框${hasBorder ? '可见' : '不可见'}`
  };
}

function testNavigationIcons() {
  console.log('\n🧭 测试导航图标...');
  
  const navIcons = document.querySelectorAll('nav svg, .nav svg, [class*="nav"] svg');
  const problematicIcons = [];
  
  navIcons.forEach((icon, index) => {
    const style = getComputedStyle(icon);
    const color = style.color;
    
    // 检查是否使用了适配的颜色类
    const hasAdaptiveColor = icon.className.includes('text-current') || 
                            icon.className.includes('text-foreground') ||
                            icon.className.includes('text-primary') ||
                            icon.className.includes('text-muted-foreground');
    
    if (!hasAdaptiveColor && color && !color.includes('rgb(')) {
      problematicIcons.push({
        element: icon,
        index,
        color,
        classes: icon.className
      });
    }
  });
  
  console.log(`找到 ${navIcons.length} 个导航图标`);
  console.log(`问题图标: ${problematicIcons.length} 个`);
  
  if (problematicIcons.length > 0) {
    console.log('问题图标详情:', problematicIcons.slice(0, 3));
  }
  
  return {
    passed: problematicIcons.length === 0,
    message: `${problematicIcons.length} 个导航图标可能存在主题适配问题`
  };
}

function testPlatformIcons() {
  console.log('\n🌐 测试平台图标...');
  
  const platformIcons = document.querySelectorAll('[class*="platform"] svg, [data-platform] svg');
  const colorVariety = new Set();
  
  platformIcons.forEach(icon => {
    const style = getComputedStyle(icon);
    const color = style.color;
    if (color) {
      colorVariety.add(color);
    }
  });
  
  console.log(`找到 ${platformIcons.length} 个平台图标`);
  console.log(`颜色种类: ${colorVariety.size}`);
  console.log('颜色列表:', Array.from(colorVariety).slice(0, 5));
  
  return {
    passed: platformIcons.length === 0 || colorVariety.size > 1,
    message: `${platformIcons.length} 个平台图标，使用了 ${colorVariety.size} 种颜色`
  };
}

function findButtonByText(text) {
  const buttons = document.querySelectorAll('button');
  for (let button of buttons) {
    if (button.textContent && button.textContent.includes(text)) {
      return button;
    }
  }
  return null;
}

// 主题切换测试功能
function testWithAllThemes() {
  console.log('\n🎨 测试所有主题下的图标可见性...');
  
  const themes = ['light', 'dark', 'beige'];
  const results = {};
  
  themes.forEach((theme, index) => {
    console.log(`\n🔄 切换到主题: ${theme}`);
    switchTheme(theme);
    
    // 等待主题应用后测试
    setTimeout(() => {
      console.log(`📊 测试主题 ${theme}...`);
      results[theme] = runFinalIconVisibilityTest();
      
      // 如果是最后一个主题，输出汇总
      if (index === themes.length - 1) {
        console.log('\n📈 所有主题测试结果汇总:');
        Object.entries(results).forEach(([themeName, result]) => {
          const allPassed = Object.values(result).every(test => test.passed);
          console.log(`${allPassed ? '✅' : '❌'} ${themeName}: ${allPassed ? '全部通过' : '存在问题'}`);
        });
      }
    }, 1000 * (index + 1));
  });
  
  return results;
}

function switchTheme(theme) {
  const html = document.documentElement;
  html.setAttribute('data-theme', theme);
  console.log(`🔄 已切换到主题: ${theme}`);
}

// 运行完整测试
console.log('🚀 启动最终图标可见性测试...');
const finalResults = runFinalIconVisibilityTest();

// 将结果保存到全局变量供进一步分析
window.finalIconTestResults = finalResults;

// 提供主题切换测试功能
window.testWithAllThemes = testWithAllThemes;
window.switchTheme = switchTheme;

console.log('\n💡 提示: 运行 testWithAllThemes() 来测试所有主题下的图标可见性');
console.log('💡 提示: 运行 switchTheme("dark") 来手动切换主题');
