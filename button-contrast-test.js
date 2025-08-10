/**
 * 按钮视觉对比测试脚本
 * 验证两个按钮是否有足够的视觉区分度
 */

function testButtonContrast() {
  console.log('🎨 测试按钮视觉对比...');
  
  const inviteButton = findButtonByText('立即邀请好友');
  const upgradeButton = findButtonByText('解锁高级功能');
  
  if (!inviteButton || !upgradeButton) {
    console.log('❌ 未找到目标按钮');
    return { passed: false, message: '未找到按钮' };
  }
  
  const inviteStyle = getComputedStyle(inviteButton);
  const upgradeStyle = getComputedStyle(upgradeButton);
  
  console.log('\n📊 按钮样式对比:');
  console.log('立即邀请好友按钮 (主要操作):');
  console.log(`  背景色: ${inviteStyle.backgroundColor}`);
  console.log(`  文字色: ${inviteStyle.color}`);
  console.log(`  边框: ${inviteStyle.border}`);
  console.log(`  阴影: ${inviteStyle.boxShadow}`);
  
  console.log('\n解锁高级功能按钮 (次要操作):');
  console.log(`  背景色: ${upgradeStyle.backgroundColor}`);
  console.log(`  文字色: ${upgradeStyle.color}`);
  console.log(`  边框: ${upgradeStyle.border}`);
  console.log(`  阴影: ${upgradeStyle.boxShadow}`);
  
  // 检查视觉对比度
  const backgroundDifferent = inviteStyle.backgroundColor !== upgradeStyle.backgroundColor;
  const textColorDifferent = inviteStyle.color !== upgradeStyle.color;
  const borderDifferent = inviteStyle.border !== upgradeStyle.border;
  
  console.log('\n🔍 对比度分析:');
  console.log(`背景色不同: ${backgroundDifferent ? '✅' : '❌'}`);
  console.log(`文字色不同: ${textColorDifferent ? '✅' : '❌'}`);
  console.log(`边框不同: ${borderDifferent ? '✅' : '❌'}`);
  
  // 检查按钮变体
  const inviteVariant = getButtonVariant(inviteButton);
  const upgradeVariant = getButtonVariant(upgradeButton);
  
  console.log('\n🏷️ 按钮变体:');
  console.log(`立即邀请好友: ${inviteVariant}`);
  console.log(`解锁高级功能: ${upgradeVariant}`);
  
  const variantsDifferent = inviteVariant !== upgradeVariant;
  console.log(`变体不同: ${variantsDifferent ? '✅' : '❌'}`);
  
  // 总体评估
  const hasGoodContrast = backgroundDifferent && variantsDifferent;
  
  if (hasGoodContrast) {
    console.log('\n🎉 按钮具有良好的视觉对比度！');
    console.log('💡 主要操作使用实心按钮，次要操作使用轮廓按钮，符合UI设计最佳实践');
  } else {
    console.log('\n⚠️ 按钮视觉对比度不足');
  }
  
  return {
    passed: hasGoodContrast,
    message: `背景${backgroundDifferent ? '不同' : '相同'}, 变体${variantsDifferent ? '不同' : '相同'}`,
    details: {
      inviteVariant,
      upgradeVariant,
      backgroundDifferent,
      textColorDifferent,
      borderDifferent
    }
  };
}

function getButtonVariant(button) {
  const classes = button.className;
  
  // 检查常见的按钮变体
  const variants = [
    'variant-default',
    'variant-secondary', 
    'variant-outline',
    'variant-ghost',
    'variant-destructive'
  ];
  
  for (let variant of variants) {
    if (classes.includes(variant)) {
      return variant;
    }
  }
  
  // 检查简化的变体名
  if (classes.includes('bg-primary')) return 'default';
  if (classes.includes('bg-secondary')) return 'secondary';
  if (classes.includes('border') && classes.includes('bg-background')) return 'outline';
  if (classes.includes('hover:bg-accent') && !classes.includes('bg-')) return 'ghost';
  
  return 'unknown';
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

// 检查按钮层次结构
function checkButtonHierarchy() {
  console.log('\n📋 检查按钮层次结构...');
  
  const inviteButton = findButtonByText('立即邀请好友');
  const upgradeButton = findButtonByText('解锁高级功能');
  
  if (!inviteButton || !upgradeButton) {
    return { passed: false, message: '未找到按钮' };
  }
  
  const inviteStyle = getComputedStyle(inviteButton);
  const upgradeStyle = getComputedStyle(upgradeButton);
  
  // 检查视觉重量
  const inviteWeight = calculateVisualWeight(inviteStyle);
  const upgradeWeight = calculateVisualWeight(upgradeStyle);
  
  console.log(`立即邀请好友按钮视觉重量: ${inviteWeight}`);
  console.log(`解锁高级功能按钮视觉重量: ${upgradeWeight}`);
  
  const correctHierarchy = inviteWeight > upgradeWeight;
  
  console.log(`层次结构正确: ${correctHierarchy ? '✅' : '❌'}`);
  
  return {
    passed: correctHierarchy,
    message: `邀请按钮权重${inviteWeight}, 升级按钮权重${upgradeWeight}`,
    inviteWeight,
    upgradeWeight
  };
}

function calculateVisualWeight(style) {
  let weight = 0;
  
  // 背景色权重
  if (style.backgroundColor !== 'rgba(0, 0, 0, 0)' && 
      style.backgroundColor !== 'transparent') {
    weight += 3;
  }
  
  // 边框权重
  if (style.borderWidth !== '0px') {
    weight += 1;
  }
  
  // 阴影权重
  if (style.boxShadow !== 'none') {
    weight += 2;
  }
  
  return weight;
}

// 运行测试
console.log('🚀 启动按钮对比度测试...');
const contrastResult = testButtonContrast();
const hierarchyResult = checkButtonHierarchy();

// 保存结果
window.buttonContrastTest = {
  contrast: contrastResult,
  hierarchy: hierarchyResult
};

console.log('\n📊 测试总结:');
console.log(`视觉对比: ${contrastResult.passed ? '✅ 通过' : '❌ 失败'}`);
console.log(`层次结构: ${hierarchyResult.passed ? '✅ 通过' : '❌ 失败'}`);

if (contrastResult.passed && hierarchyResult.passed) {
  console.log('\n🎉 按钮设计完美！具有良好的视觉层次和对比度');
} else {
  console.log('\n⚠️ 按钮设计需要进一步优化');
}
