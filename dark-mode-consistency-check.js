/**
 * 深色模式样式一致性检查脚本
 * 在浏览器控制台中运行此脚本来检查深色模式下的样式一致性
 */

function checkDarkModeConsistency() {
  console.log('🌙 开始检查深色模式样式一致性...');
  
  const issues = [];
  
  // 检查卡片边框颜色一致性
  const cards = document.querySelectorAll('.card, [class*="Card"], .rounded-xl');
  console.log(`🃏 检查 ${cards.length} 个卡片的边框颜色...`);
  
  const borderColors = new Set();
  cards.forEach((card, index) => {
    const computedStyle = getComputedStyle(card);
    const borderColor = computedStyle.borderColor;
    borderColors.add(borderColor);
    
    if (index < 10) { // 只记录前10个卡片的边框颜色
      console.log(`卡片 ${index + 1}: ${borderColor}`);
    }
  });
  
  if (borderColors.size > 3) {
    issues.push({
      type: 'border-color-inconsistency',
      message: `发现 ${borderColors.size} 种不同的边框颜色`,
      colors: Array.from(borderColors)
    });
  }
  
  // 检查背景颜色一致性
  const backgrounds = document.querySelectorAll('.bg-card, .bg-accent, .bg-background');
  console.log(`🎨 检查 ${backgrounds.length} 个背景元素...`);
  
  const bgColors = new Set();
  backgrounds.forEach((bg, index) => {
    const computedStyle = getComputedStyle(bg);
    const backgroundColor = computedStyle.backgroundColor;
    bgColors.add(backgroundColor);
    
    if (index < 10) {
      console.log(`背景 ${index + 1}: ${backgroundColor}`);
    }
  });
  
  // 检查图标容器样式一致性
  const iconContainers = document.querySelectorAll('[class*="w-10 h-10"], [class*="w-12 h-12"]');
  console.log(`🔘 检查 ${iconContainers.length} 个图标容器...`);
  
  const iconBgColors = new Set();
  iconContainers.forEach((container, index) => {
    const computedStyle = getComputedStyle(container);
    const backgroundColor = computedStyle.backgroundColor;
    iconBgColors.add(backgroundColor);
    
    if (index < 10) {
      console.log(`图标容器 ${index + 1}: ${backgroundColor}`);
    }
  });
  
  if (iconBgColors.size > 5) {
    issues.push({
      type: 'icon-background-inconsistency',
      message: `发现 ${iconBgColors.size} 种不同的图标背景颜色`,
      colors: Array.from(iconBgColors)
    });
  }
  
  // 检查文字颜色一致性
  const textElements = document.querySelectorAll('.text-foreground, .text-muted-foreground, .text-primary-foreground');
  console.log(`📝 检查 ${textElements.length} 个文字元素...`);
  
  const textColors = new Set();
  textElements.forEach((text, index) => {
    const computedStyle = getComputedStyle(text);
    const color = computedStyle.color;
    textColors.add(color);
    
    if (index < 10) {
      console.log(`文字 ${index + 1}: ${color}`);
    }
  });
  
  // 检查Badge样式一致性
  const badges = document.querySelectorAll('.badge, [class*="Badge"]');
  console.log(`🏷️ 检查 ${badges.length} 个Badge...`);
  
  badges.forEach((badge, index) => {
    const computedStyle = getComputedStyle(badge);
    const backgroundColor = computedStyle.backgroundColor;
    const color = computedStyle.color;
    
    if (index < 5) {
      console.log(`Badge ${index + 1}: bg=${backgroundColor}, color=${color}`);
    }
  });
  
  // 输出检查结果
  console.log('\n📊 检查结果:');
  console.log(`边框颜色种类: ${borderColors.size}`);
  console.log(`背景颜色种类: ${bgColors.size}`);
  console.log(`图标背景颜色种类: ${iconBgColors.size}`);
  console.log(`文字颜色种类: ${textColors.size}`);
  
  if (issues.length === 0) {
    console.log('✅ 深色模式样式一致性检查通过！');
  } else {
    console.log('⚠️ 发现以下问题:');
    issues.forEach((issue, index) => {
      console.log(`${index + 1}. ${issue.type}: ${issue.message}`);
      if (issue.colors) {
        console.log('   颜色列表:', issue.colors);
      }
    });
  }
  
  return {
    borderColors: Array.from(borderColors),
    bgColors: Array.from(bgColors),
    iconBgColors: Array.from(iconBgColors),
    textColors: Array.from(textColors),
    issues
  };
}

// 检查特定组件的样式一致性
function checkComponentConsistency() {
  console.log('\n🔍 检查特定组件样式一致性...');
  
  // 检查使用统计和邀请奖励卡片
  const usageStatsCard = document.querySelector('[class*="TokenUsageSection"]') || 
                        document.querySelector('h3:contains("Token使用量")')?.closest('.card, .rounded-xl');
  const inviteRewardCard = document.querySelector('h3:contains("邀请奖励")')?.closest('.card, .rounded-xl');
  
  if (usageStatsCard && inviteRewardCard) {
    const usageStyle = getComputedStyle(usageStatsCard);
    const inviteStyle = getComputedStyle(inviteRewardCard);
    
    console.log('使用统计卡片:');
    console.log(`  边框: ${usageStyle.borderColor}`);
    console.log(`  背景: ${usageStyle.backgroundColor}`);
    
    console.log('邀请奖励卡片:');
    console.log(`  边框: ${inviteStyle.borderColor}`);
    console.log(`  背景: ${inviteStyle.backgroundColor}`);
    
    if (usageStyle.borderColor === inviteStyle.borderColor) {
      console.log('✅ 卡片边框颜色一致');
    } else {
      console.log('❌ 卡片边框颜色不一致');
    }
    
    if (usageStyle.backgroundColor === inviteStyle.backgroundColor) {
      console.log('✅ 卡片背景颜色一致');
    } else {
      console.log('❌ 卡片背景颜色不一致');
    }
  } else {
    console.log('⚠️ 未找到使用统计或邀请奖励卡片');
  }
}

// 运行检查
console.log('运行深色模式一致性检查...');
const result = checkDarkModeConsistency();
checkComponentConsistency();

// 返回结果供进一步分析
window.darkModeCheckResult = result;
