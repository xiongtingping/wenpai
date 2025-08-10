/**
 * 快速图标可见性测试
 * 在浏览器控制台中运行此脚本来验证修复效果
 */

function quickIconTest() {
  console.log('🔍 快速图标可见性测试...');
  
  // 1. 检查按钮样式一致性
  console.log('\n🔘 检查按钮样式...');
  const inviteButton = findButtonByText('立即邀请好友');
  const upgradeButton = findButtonByText('解锁高级功能');
  
  if (inviteButton && upgradeButton) {
    const inviteStyle = getComputedStyle(inviteButton);
    const upgradeStyle = getComputedStyle(upgradeButton);
    
    console.log('立即邀请好友按钮:');
    console.log(`  背景: ${inviteStyle.backgroundColor}`);
    console.log(`  高度: ${inviteStyle.height}`);
    
    console.log('解锁高级功能按钮:');
    console.log(`  背景: ${upgradeStyle.backgroundColor}`);
    console.log(`  高度: ${upgradeStyle.height}`);
    
    const consistent = inviteStyle.backgroundColor === upgradeStyle.backgroundColor && 
                      inviteStyle.height === upgradeStyle.height;
    console.log(`✅ 按钮样式${consistent ? '一致' : '不一致'}`);
  } else {
    console.log('ℹ️ 未找到目标按钮（可能未显示）');
  }
  
  // 2. 检查图标可见性
  console.log('\n🔘 检查图标可见性...');
  const icons = document.querySelectorAll('svg');
  let visibleIcons = 0;
  let invisibleIcons = 0;
  
  icons.forEach(icon => {
    const style = getComputedStyle(icon);
    const color = style.color;
    const opacity = parseFloat(style.opacity);
    
    if (opacity > 0 && color !== 'transparent' && color !== 'rgba(0, 0, 0, 0)') {
      visibleIcons++;
    } else {
      invisibleIcons++;
    }
  });
  
  console.log(`找到 ${icons.length} 个图标`);
  console.log(`可见图标: ${visibleIcons} 个`);
  console.log(`不可见图标: ${invisibleIcons} 个`);
  
  if (invisibleIcons === 0) {
    console.log('✅ 所有图标都可见');
  } else {
    console.log(`❌ 有 ${invisibleIcons} 个图标不可见`);
  }
  
  // 3. 检查主题切换按钮
  console.log('\n🌙 检查主题切换按钮...');
  const themeToggle = document.querySelector('[aria-label="切换主题"]');
  if (themeToggle) {
    const style = getComputedStyle(themeToggle);
    const icon = themeToggle.querySelector('svg');
    
    if (icon) {
      const iconStyle = getComputedStyle(icon);
      console.log(`主题切换图标颜色: ${iconStyle.color}`);
      console.log(`按钮背景: ${style.backgroundColor}`);
      console.log(`按钮边框: ${style.borderColor}`);
      
      const visible = iconStyle.color !== 'transparent' && iconStyle.color !== 'rgba(0, 0, 0, 0)';
      console.log(`✅ 主题切换图标${visible ? '可见' : '不可见'}`);
    }
  }
  
  // 4. 检查当前主题
  console.log('\n🎨 当前主题信息...');
  const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
  console.log(`当前主题: ${currentTheme}`);
  
  // 5. 总结
  console.log('\n📊 测试总结:');
  const allGood = invisibleIcons === 0;
  if (allGood) {
    console.log('🎉 图标可见性修复成功！');
  } else {
    console.log('⚠️ 仍有图标可见性问题需要修复');
  }
  
  return {
    totalIcons: icons.length,
    visibleIcons,
    invisibleIcons,
    allGood
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
function testThemeSwitch() {
  console.log('\n🔄 测试主题切换...');
  
  const themes = ['light', 'dark', 'beige'];
  let currentIndex = 0;
  
  function switchToNextTheme() {
    const theme = themes[currentIndex];
    document.documentElement.setAttribute('data-theme', theme);
    console.log(`🔄 切换到主题: ${theme}`);
    
    setTimeout(() => {
      console.log(`📊 测试主题 ${theme}:`);
      const result = quickIconTest();
      
      currentIndex++;
      if (currentIndex < themes.length) {
        setTimeout(switchToNextTheme, 2000);
      } else {
        console.log('\n🏁 所有主题测试完成');
      }
    }, 1000);
  }
  
  switchToNextTheme();
}

// 运行测试
console.log('🚀 启动快速图标测试...');
const result = quickIconTest();

// 保存结果到全局变量
window.quickTestResult = result;

// 提供主题切换测试
window.testThemeSwitch = testThemeSwitch;

console.log('\n💡 提示: 运行 testThemeSwitch() 来测试所有主题');
console.log('💡 提示: 运行 quickIconTest() 来重新测试当前主题');
