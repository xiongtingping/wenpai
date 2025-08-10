/**
 * 个人中心UI一致性测试脚本
 * 在浏览器控制台中运行此脚本来验证所有修复效果
 */

function runProfileUIConsistencyTest() {
  console.log('🔍 开始个人中心UI一致性测试...');
  
  const results = {
    iconVisibility: testIconVisibility(),
    buttonConsistency: testButtonConsistency(),
    themeToggleVisibility: testThemeToggleVisibility(),
    colorTokenUsage: testColorTokenUsage(),
    badgeConsistency: testBadgeConsistency()
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
    console.log('\n🎉 所有UI一致性测试通过！个人中心页面修复成功！');
  } else {
    console.log('\n⚠️ 仍有部分问题需要修复');
  }
  
  return results;
}

function testIconVisibility() {
  console.log('\n🔘 测试图标可见性...');
  
  const icons = document.querySelectorAll('svg, .lucide');
  const invisibleIcons = [];
  
  icons.forEach((icon, index) => {
    const style = getComputedStyle(icon);
    const color = style.color;
    const opacity = style.opacity;
    const visibility = style.visibility;
    
    // 检查图标是否可见
    if (opacity === '0' || visibility === 'hidden' || 
        color === 'transparent' || color === 'rgba(0, 0, 0, 0)') {
      invisibleIcons.push({
        element: icon,
        index,
        color,
        opacity,
        visibility,
        classes: icon.className
      });
    }
  });
  
  console.log(`找到 ${icons.length} 个图标`);
  console.log(`不可见图标: ${invisibleIcons.length} 个`);
  
  if (invisibleIcons.length > 0) {
    console.log('不可见图标详情:', invisibleIcons.slice(0, 3));
  }
  
  return {
    passed: invisibleIcons.length === 0,
    message: `${invisibleIcons.length} 个图标不可见`
  };
}

function testButtonConsistency() {
  console.log('\n🔘 测试按钮一致性...');
  
  // 查找"立即邀请好友"和"解锁高级功能"按钮
  const inviteButton = findButtonByText('立即邀请好友');
  const upgradeButton = findButtonByText('解锁高级功能');
  
  if (!inviteButton || !upgradeButton) {
    return {
      passed: false,
      message: '未找到目标按钮'
    };
  }
  
  const inviteStyle = getComputedStyle(inviteButton);
  const upgradeStyle = getComputedStyle(upgradeButton);
  
  // 检查关键样式属性
  const inviteHeight = inviteStyle.height;
  const upgradeHeight = upgradeStyle.height;
  const inviteBg = inviteStyle.backgroundColor;
  const upgradeBg = upgradeStyle.backgroundColor;
  const inviteColor = inviteStyle.color;
  const upgradeColor = upgradeStyle.color;
  
  console.log('立即邀请好友按钮:');
  console.log(`  高度: ${inviteHeight}, 背景: ${inviteBg}, 文字: ${inviteColor}`);
  console.log('解锁高级功能按钮:');
  console.log(`  高度: ${upgradeHeight}, 背景: ${upgradeBg}, 文字: ${upgradeColor}`);
  
  const heightMatch = inviteHeight === upgradeHeight;
  const bgMatch = inviteBg === upgradeBg;
  const colorMatch = inviteColor === upgradeColor;
  
  return {
    passed: heightMatch && bgMatch && colorMatch,
    message: `高度${heightMatch ? '一致' : '不一致'}, 背景${bgMatch ? '一致' : '不一致'}, 文字${colorMatch ? '一致' : '不一致'}`
  };
}

function testThemeToggleVisibility() {
  console.log('\n🌙 测试主题切换图标可见性...');
  
  const themeToggle = document.querySelector('[aria-label="切换主题"]') || 
                     document.querySelector('[title="切换主题"]');
  
  if (!themeToggle) {
    return {
      passed: false,
      message: '未找到主题切换按钮'
    };
  }
  
  const style = getComputedStyle(themeToggle);
  const icon = themeToggle.querySelector('svg');
  
  if (!icon) {
    return {
      passed: false,
      message: '主题切换按钮中未找到图标'
    };
  }
  
  const iconStyle = getComputedStyle(icon);
  const iconColor = iconStyle.color;
  const buttonBg = style.backgroundColor;
  const buttonBorder = style.borderColor;
  
  console.log('主题切换按钮:');
  console.log(`  图标颜色: ${iconColor}`);
  console.log(`  按钮背景: ${buttonBg}`);
  console.log(`  按钮边框: ${buttonBorder}`);
  
  // 检查是否有足够的对比度
  const hasVisibleIcon = iconColor !== 'transparent' && iconColor !== 'rgba(0, 0, 0, 0)';
  const hasVisibleBg = buttonBg !== 'transparent' && buttonBg !== 'rgba(0, 0, 0, 0)';
  
  return {
    passed: hasVisibleIcon && hasVisibleBg,
    message: `图标${hasVisibleIcon ? '可见' : '不可见'}, 背景${hasVisibleBg ? '可见' : '不可见'}`
  };
}

function testColorTokenUsage() {
  console.log('\n🎨 测试颜色令牌使用...');
  
  const hardcodedColors = [];
  const allElements = document.querySelectorAll('*');
  
  // 检查是否有硬编码颜色
  const problematicColors = [
    'rgb(37, 99, 235)',  // 蓝色
    'rgb(59, 130, 246)',
    'rgb(29, 78, 216)',
    '#3b82f6',
    '#2563eb',
    'blue',
    'white',
    'black'
  ];
  
  allElements.forEach(element => {
    const style = getComputedStyle(element);
    const color = style.color;
    const backgroundColor = style.backgroundColor;
    const borderColor = style.borderColor;
    
    [color, backgroundColor, borderColor].forEach(colorValue => {
      problematicColors.forEach(problemColor => {
        if (colorValue && (colorValue.includes(problemColor) || colorValue === problemColor)) {
          hardcodedColors.push({
            element: element.tagName,
            classes: element.className,
            colorType: colorValue === color ? 'text' : colorValue === backgroundColor ? 'background' : 'border',
            value: colorValue
          });
        }
      });
    });
  });
  
  console.log(`发现 ${hardcodedColors.length} 个硬编码颜色`);
  if (hardcodedColors.length > 0) {
    console.log('硬编码颜色详情:', hardcodedColors.slice(0, 3));
  }
  
  return {
    passed: hardcodedColors.length <= 5, // 允许少量硬编码颜色
    message: `发现 ${hardcodedColors.length} 个硬编码颜色`
  };
}

function testBadgeConsistency() {
  console.log('\n🏷️ 测试Badge一致性...');
  
  const badges = document.querySelectorAll('.badge, [class*="Badge"]');
  const badgeStyles = new Set();
  
  badges.forEach(badge => {
    const style = getComputedStyle(badge);
    const styleKey = `${style.backgroundColor}-${style.color}-${style.borderColor}`;
    badgeStyles.add(styleKey);
  });
  
  console.log(`找到 ${badges.length} 个Badge`);
  console.log(`样式组合种类: ${badgeStyles.size}`);
  
  return {
    passed: badgeStyles.size <= 5, // 允许最多5种Badge样式
    message: `Badge使用了 ${badgeStyles.size} 种样式组合`
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

// 主题切换测试
function testAllThemes() {
  console.log('\n🎨 测试所有主题下的UI一致性...');
  
  const themes = ['light', 'dark', 'beige'];
  const results = {};
  
  themes.forEach(theme => {
    console.log(`\n🔄 切换到主题: ${theme}`);
    switchTheme(theme);
    
    // 等待主题应用
    setTimeout(() => {
      results[theme] = runProfileUIConsistencyTest();
    }, 500);
  });
  
  return results;
}

function switchTheme(theme) {
  const html = document.documentElement;
  html.setAttribute('data-theme', theme);
  console.log(`🔄 切换到主题: ${theme}`);
}

// 运行完整测试
console.log('🚀 启动个人中心UI一致性测试...');
const testResults = runProfileUIConsistencyTest();

// 将结果保存到全局变量供进一步分析
window.profileUITestResults = testResults;

// 提供手动主题切换测试功能
window.testAllThemes = testAllThemes;
window.switchTheme = switchTheme;
