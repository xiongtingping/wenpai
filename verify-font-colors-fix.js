// 验证字体颜色修复的最终脚本
console.log('🎨 开始验证字体颜色修复...');

function checkPricingTableColors() {
  console.log('\n💰 检查定价表格颜色...');
  
  // 检查表格中的数字
  const tableNumbers = document.querySelectorAll('.pricing-table-number, td span');
  console.log(`📊 找到 ${tableNumbers.length} 个表格元素`);
  
  let blueTextCount = 0;
  let correctTextCount = 0;
  
  tableNumbers.forEach((element, index) => {
    const color = getComputedStyle(element).color;
    const text = element.textContent?.trim();
    
    // 检查是否是蓝色文字
    if (color.includes('rgb(37, 99, 235)') || // text-primary蓝色
        color.includes('rgb(59, 130, 246)') || // 其他蓝色变体
        color.includes('rgb(29, 78, 216)')) {
      console.log(`❌ 元素${index + 1}仍然是蓝色:`);
      console.log(`   内容: "${text}"`);
      console.log(`   颜色: ${color}`);
      blueTextCount++;
    } else {
      correctTextCount++;
    }
  });
  
  console.log(`📊 表格颜色检查结果:`);
  console.log(`✅ 正确颜色: ${correctTextCount}`);
  console.log(`❌ 蓝色文字: ${blueTextCount}`);
  
  return blueTextCount === 0;
}

function checkHeadingColors() {
  console.log('\n📝 检查标题颜色...');
  
  const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
  console.log(`📋 找到 ${headings.length} 个标题`);
  
  let issueCount = 0;
  
  headings.forEach((heading, index) => {
    const color = getComputedStyle(heading).color;
    const text = heading.textContent?.trim().substring(0, 30);
    
    if (color.includes('rgb(37, 99, 235)') || color.includes('rgb(59, 130, 246)')) {
      console.log(`❌ 标题${index + 1}是蓝色:`);
      console.log(`   内容: "${text}"`);
      console.log(`   颜色: ${color}`);
      issueCount++;
    }
  });
  
  if (issueCount === 0) {
    console.log('✅ 所有标题颜色正常');
  }
  
  return issueCount === 0;
}

function checkButtonColors() {
  console.log('\n🔘 检查按钮颜色...');
  
  const buttons = document.querySelectorAll('button');
  console.log(`📋 找到 ${buttons.length} 个按钮`);
  
  let issueCount = 0;
  
  buttons.forEach((button, index) => {
    const color = getComputedStyle(button).color;
    const bg = getComputedStyle(button).backgroundColor;
    const text = button.textContent?.trim().substring(0, 20);
    
    // 检查是否有不合适的蓝色
    if ((color.includes('rgb(37, 99, 235)') && !bg.includes('rgb(37, 99, 235)')) || // 蓝色文字但非蓝色背景
        (color === 'rgb(255, 255, 255)' && !bg.includes('rgb('))) { // 白色文字但透明背景
      console.log(`⚠️ 按钮${index + 1}颜色可能有问题:`);
      console.log(`   内容: "${text}"`);
      console.log(`   文字色: ${color}`);
      console.log(`   背景色: ${bg}`);
      issueCount++;
    }
  });
  
  if (issueCount === 0) {
    console.log('✅ 所有按钮颜色正常');
  }
  
  return issueCount === 0;
}

function checkOverallConsistency() {
  console.log('\n🌈 检查整体颜色一致性...');
  
  // 获取主题颜色
  const html = document.documentElement;
  const computedStyle = getComputedStyle(html);
  const foreground = computedStyle.getPropertyValue('--foreground').trim();
  const primary = computedStyle.getPropertyValue('--primary').trim();
  
  console.log('🎨 主题颜色:');
  console.log(`   前景色: hsl(${foreground})`);
  console.log(`   主色调: hsl(${primary})`);
  
  // 检查是否有元素使用了错误的颜色类
  const problematicElements = [];
  
  // 检查text-primary类的使用
  const textPrimaryElements = document.querySelectorAll('.text-primary');
  textPrimaryElements.forEach(element => {
    const context = element.closest('button, .badge, .tag');
    if (!context) { // 如果不在按钮、徽章等特殊上下文中
      problematicElements.push({
        element,
        issue: 'text-primary outside of special context',
        text: element.textContent?.trim().substring(0, 30)
      });
    }
  });
  
  // 检查text-blue类的使用
  const textBlueElements = document.querySelectorAll('[class*="text-blue"]');
  textBlueElements.forEach(element => {
    problematicElements.push({
      element,
      issue: 'text-blue class usage',
      text: element.textContent?.trim().substring(0, 30)
    });
  });
  
  if (problematicElements.length > 0) {
    console.log(`⚠️ 发现 ${problematicElements.length} 个可能的问题:`);
    problematicElements.forEach((item, index) => {
      console.log(`${index + 1}. ${item.issue}: "${item.text}"`);
    });
  } else {
    console.log('✅ 颜色使用一致');
  }
  
  return problematicElements.length === 0;
}

function checkSpecificIssues() {
  console.log('\n🎯 检查特定问题...');
  
  // 检查功能对比表
  const comparisonTable = document.querySelector('#pricing table');
  if (comparisonTable) {
    console.log('📊 检查功能对比表...');
    
    const tableCells = comparisonTable.querySelectorAll('td, th');
    let blueTextInTable = 0;
    
    tableCells.forEach(cell => {
      const color = getComputedStyle(cell).color;
      if (color.includes('rgb(37, 99, 235)') || color.includes('rgb(59, 130, 246)')) {
        blueTextInTable++;
      }
    });
    
    if (blueTextInTable > 0) {
      console.log(`❌ 表格中有 ${blueTextInTable} 个蓝色文字`);
    } else {
      console.log('✅ 表格文字颜色统一');
    }
    
    return blueTextInTable === 0;
  }
  
  return true;
}

// 主验证函数
function verifyFontColorsFix() {
  console.log('🚀 开始验证字体颜色修复...\n');
  
  const pricingOk = checkPricingTableColors();
  const headingsOk = checkHeadingColors();
  const buttonsOk = checkButtonColors();
  const consistencyOk = checkOverallConsistency();
  const specificOk = checkSpecificIssues();
  
  console.log('\n📊 最终验证结果:');
  console.log('定价表格:', pricingOk ? '✅' : '❌');
  console.log('标题颜色:', headingsOk ? '✅' : '❌');
  console.log('按钮颜色:', buttonsOk ? '✅' : '❌');
  console.log('整体一致性:', consistencyOk ? '✅' : '❌');
  console.log('特定问题:', specificOk ? '✅' : '❌');
  
  const allPassed = pricingOk && headingsOk && buttonsOk && consistencyOk && specificOk;
  
  if (allPassed) {
    console.log('\n🎉 字体颜色问题已完全修复！');
    console.log('✅ 所有文字使用统一的主题颜色');
    console.log('✅ 没有刺眼的蓝色文字');
    console.log('✅ 颜色层次清晰一致');
  } else {
    console.log('\n⚠️ 仍有部分字体颜色需要调整');
  }
  
  return allPassed;
}

// 自动运行验证
setTimeout(() => {
  verifyFontColorsFix();
}, 2000);

// 导出函数供手动调用
window.verifyFontColorsFix = verifyFontColorsFix;
window.checkPricingTableColors = checkPricingTableColors;

console.log('✅ 字体颜色验证脚本已加载，2秒后自动运行');
console.log('💡 可手动调用: verifyFontColorsFix()');
