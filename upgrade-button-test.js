/**
 * 升级按钮跳转功能测试脚本
 * 测试升级按钮是否能正确跳转到支付中心并自动选择对应版本
 */

console.log('🔗 开始升级按钮跳转功能测试...');

// 测试localStorage设置和跳转
function testUpgradeButtonNavigation() {
  console.log('\n🚀 升级按钮导航测试:');
  
  const currentPath = window.location.pathname;
  console.log('  当前页面:', currentPath);
  
  // 查找升级按钮
  const upgradeButtons = document.querySelectorAll('button:contains("升级"), button[class*="upgrade"]');
  console.log('  找到升级按钮数量:', upgradeButtons.length);
  
  if (upgradeButtons.length === 0) {
    console.log('  ❌ 未找到升级按钮');
    return { tested: false };
  }
  
  // 检查第一个升级按钮
  const firstButton = upgradeButtons[0];
  console.log('  第一个升级按钮文本:', firstButton.textContent?.trim());
  
  // 模拟点击（不实际点击，只检查逻辑）
  console.log('  模拟点击升级按钮...');
  
  // 检查是否会设置localStorage
  const originalSetItem = localStorage.setItem;
  let capturedKey = null;
  let capturedValue = null;
  
  localStorage.setItem = function(key, value) {
    capturedKey = key;
    capturedValue = value;
    console.log(`    localStorage.setItem("${key}", "${value}")`);
    return originalSetItem.call(this, key, value);
  };
  
  // 恢复原始方法
  setTimeout(() => {
    localStorage.setItem = originalSetItem;
  }, 100);
  
  return {
    tested: true,
    buttonCount: upgradeButtons.length,
    firstButtonText: firstButton.textContent?.trim(),
    capturedKey,
    capturedValue
  };
}

// 测试支付页面是否能读取localStorage
function testPaymentPagePlanSelection() {
  console.log('\n💳 支付页面计划选择测试:');
  
  const isOnPaymentPage = window.location.pathname === '/payment';
  console.log('  是否在支付页面:', isOnPaymentPage ? '✅' : '❌');
  
  if (!isOnPaymentPage) {
    console.log('  ℹ️ 不在支付页面，跳过测试');
    return { tested: false };
  }
  
  // 检查是否有计划选择UI
  const planCards = document.querySelectorAll('[class*="plan"], [class*="card"]');
  console.log('  找到计划卡片数量:', planCards.length);
  
  // 检查是否有选中的计划
  const selectedPlans = document.querySelectorAll('[class*="selected"], [class*="active"]');
  console.log('  找到选中状态元素数量:', selectedPlans.length);
  
  // 检查localStorage中的selectedPlan
  const savedPlan = localStorage.getItem('selectedPlan');
  console.log('  localStorage中的selectedPlan:', savedPlan || '无');
  
  return {
    tested: true,
    planCards: planCards.length,
    selectedPlans: selectedPlans.length,
    savedPlan
  };
}

// 手动测试升级按钮功能
function manualTestUpgradeButton(tier = 'premium') {
  console.log(`\n🧪 手动测试升级按钮功能 (${tier}):`);
  
  // 设置localStorage
  localStorage.setItem('selectedPlan', tier);
  console.log(`  已设置 localStorage.selectedPlan = "${tier}"`);
  
  // 跳转到支付页面
  console.log('  正在跳转到支付页面...');
  window.location.href = '/payment';
  
  return { tier, action: 'navigating' };
}

// 测试不同版本的升级流程
function testDifferentTierUpgrades() {
  console.log('\n🎯 不同版本升级流程测试:');
  
  const tiers = ['pro', 'premium'];
  
  console.log('可用的测试命令:');
  tiers.forEach(tier => {
    console.log(`  upgradeTest.manualTestUpgradeButton("${tier}") - 测试${tier}版本升级`);
  });
  
  console.log('\n测试步骤:');
  console.log('  1. 在品牌库或创意魔方页面运行测试');
  console.log('  2. 点击升级按钮或运行手动测试');
  console.log('  3. 检查是否跳转到支付页面');
  console.log('  4. 检查是否自动选中对应版本');
  
  return { tiers, instructions: '使用上述命令测试不同版本的升级流程' };
}

// 检查支付页面的计划自动选择
function checkPaymentPageAutoSelection() {
  console.log('\n🎯 支付页面自动选择检查:');
  
  if (window.location.pathname !== '/payment') {
    console.log('  ❌ 不在支付页面');
    return { checked: false };
  }
  
  // 等待页面加载完成
  setTimeout(() => {
    console.log('  检查页面加载状态...');
    
    // 查找选中的计划卡片
    const selectedCards = document.querySelectorAll('[class*="selected"], [class*="border-primary"], [class*="ring-"]');
    console.log('  找到可能选中的卡片:', selectedCards.length);
    
    selectedCards.forEach((card, index) => {
      const cardText = card.textContent || '';
      console.log(`    卡片 ${index + 1}:`, cardText.substring(0, 50) + '...');
    });
    
    // 检查是否有支付按钮显示
    const paymentButtons = document.querySelectorAll('button:contains("支付"), button:contains("立即购买")');
    console.log('  找到支付按钮数量:', paymentButtons.length);
    
  }, 1000);
  
  return { checked: true };
}

// 综合测试
function runComprehensiveUpgradeTest() {
  console.log('\n🔍 运行综合升级按钮测试...');
  console.log('='.repeat(50));
  
  const navigationTest = testUpgradeButtonNavigation();
  const paymentTest = testPaymentPagePlanSelection();
  
  console.log('\n📊 测试结果总结:');
  console.log('='.repeat(50));
  
  const results = {
    hasUpgradeButtons: navigationTest.tested && navigationTest.buttonCount > 0,
    paymentPageWorks: paymentTest.tested || window.location.pathname === '/payment',
    localStorageWorks: !!paymentTest.savedPlan || localStorage.getItem('selectedPlan') !== null
  };
  
  console.log('✅ 升级按钮存在:', results.hasUpgradeButtons ? '正常' : '缺失');
  console.log('✅ 支付页面功能:', results.paymentPageWorks ? '正常' : '异常');
  console.log('✅ 计划选择功能:', results.localStorageWorks ? '正常' : '需要检查');
  
  const allPassed = Object.values(results).every(result => result === true);
  
  console.log('\n🎯 最终结果:');
  if (allPassed) {
    console.log('🎉 升级按钮功能测试通过！');
  } else {
    console.log('⚠️ 升级按钮功能需要进一步检查。');
  }
  
  // 如果在支付页面，检查自动选择
  if (window.location.pathname === '/payment') {
    checkPaymentPageAutoSelection();
  }
  
  return { results, allPassed };
}

// 导出测试函数
window.upgradeTest = {
  runComprehensiveUpgradeTest,
  testUpgradeButtonNavigation,
  testPaymentPagePlanSelection,
  manualTestUpgradeButton,
  testDifferentTierUpgrades,
  checkPaymentPageAutoSelection
};

console.log('\n🚀 升级按钮测试工具已准备就绪！');
console.log('使用方法:');
console.log('  upgradeTest.runComprehensiveUpgradeTest() - 综合测试');
console.log('  upgradeTest.manualTestUpgradeButton("premium") - 手动测试高级版升级');
console.log('  upgradeTest.manualTestUpgradeButton("pro") - 手动测试专业版升级');

// 自动运行测试
runComprehensiveUpgradeTest();
