/**
 * 权限系统优化验证脚本
 * 验证权限提示UI优化和升级按钮功能
 */

console.log('🔐 开始权限系统优化验证...');

// 检查权限按钮的UI优化
function checkPermissionButtonUI() {
  console.log('\n🎨 权限按钮UI优化检查:');
  
  // 查找所有权限锁定按钮
  const permissionButtons = document.querySelectorAll('.permission-locked-button');
  console.log('  找到权限锁定按钮数量:', permissionButtons.length);
  
  let improvedButtons = 0;
  permissionButtons.forEach((button, index) => {
    const hasUpgradeButton = button.parentElement?.querySelector('button[class*="absolute"]');
    const hasHighlightedBadge = button.querySelector('span[class*="需要"]') || button.textContent.includes('需要');
    
    if (hasUpgradeButton || hasHighlightedBadge) {
      improvedButtons++;
      console.log(`  ✅ 按钮 ${index + 1}: 已优化 (升级按钮: ${!!hasUpgradeButton}, 突出提示: ${!!hasHighlightedBadge})`);
    } else {
      console.log(`  ⚠️ 按钮 ${index + 1}: 需要优化`);
    }
  });
  
  return {
    total: permissionButtons.length,
    improved: improvedButtons,
    percentage: permissionButtons.length > 0 ? (improvedButtons / permissionButtons.length * 100).toFixed(1) : 0
  };
}

// 检查品牌库页面的权限保护
function checkBrandLibraryPermissions() {
  console.log('\n📚 品牌库权限保护检查:');
  
  const isOnBrandLibrary = window.location.pathname === '/brand-library';
  if (!isOnBrandLibrary) {
    console.log('  ℹ️ 不在品牌库页面，跳过检查');
    return { checked: false };
  }
  
  // 检查上传按钮
  const uploadButtons = document.querySelectorAll('button:has(.lucide-file-up), button:has(.lucide-upload)');
  console.log('  上传相关按钮数量:', uploadButtons.length);
  
  // 检查AI分析按钮
  const analysisButtons = document.querySelectorAll('button:has(.lucide-brain), button[class*="分析"]');
  console.log('  AI分析按钮数量:', analysisButtons.length);
  
  // 检查PDF对话按钮
  const pdfChatButtons = document.querySelectorAll('button:has(.lucide-message-square)');
  console.log('  PDF对话按钮数量:', pdfChatButtons.length);
  
  return {
    checked: true,
    uploadButtons: uploadButtons.length,
    analysisButtons: analysisButtons.length,
    pdfChatButtons: pdfChatButtons.length
  };
}

// 检查创意魔方页面的权限保护
function checkCreativeStudioPermissions() {
  console.log('\n🎨 创意魔方权限保护检查:');
  
  const isOnCreativeStudio = window.location.pathname === '/creative-studio';
  if (!isOnCreativeStudio) {
    console.log('  ℹ️ 不在创意魔方页面，跳过检查');
    return { checked: false };
  }
  
  // 检查权限遮罩
  const permissionOverlays = document.querySelectorAll('[class*="permission"], [class*="overlay"]');
  console.log('  权限遮罩元素数量:', permissionOverlays.length);
  
  // 检查升级按钮
  const upgradeButtons = document.querySelectorAll('button:contains("升级"), button[class*="upgrade"]');
  console.log('  升级按钮数量:', upgradeButtons.length);
  
  return {
    checked: true,
    overlays: permissionOverlays.length,
    upgradeButtons: upgradeButtons.length
  };
}

// 测试升级按钮功能
function testUpgradeButtonFunctionality() {
  console.log('\n🚀 升级按钮功能测试:');
  
  // 查找升级按钮
  const upgradeButtons = document.querySelectorAll('button:contains("升级"), button[class*="upgrade"], .permission-locked-button');
  
  if (upgradeButtons.length === 0) {
    console.log('  ❌ 未找到升级按钮');
    return { tested: false };
  }
  
  console.log(`  找到 ${upgradeButtons.length} 个可能的升级按钮`);
  
  // 模拟点击第一个按钮（不实际点击，只检查事件）
  const firstButton = upgradeButtons[0];
  const hasClickHandler = firstButton.onclick || firstButton.addEventListener;
  
  console.log('  第一个按钮有点击处理器:', !!hasClickHandler);
  console.log('  按钮文本:', firstButton.textContent?.trim().substring(0, 50));
  
  return {
    tested: true,
    buttonCount: upgradeButtons.length,
    hasHandler: !!hasClickHandler
  };
}

// 检查权限提示文本优化
function checkPermissionTextOptimization() {
  console.log('\n📝 权限提示文本优化检查:');
  
  const bodyText = document.body.textContent || '';
  
  // 检查是否有突出的权限提示
  const hasHighlightedPermissions = [
    '需要专业版',
    '需要高级版',
    '需要pro',
    '需要premium'
  ].some(text => bodyText.toLowerCase().includes(text.toLowerCase()));
  
  console.log('  是否有突出的权限提示:', hasHighlightedPermissions ? '✅' : '❌');
  
  // 检查是否移除了VIP相关内容
  const hasVipContent = bodyText.includes('VIP') || bodyText.includes('会员中心');
  console.log('  是否还有VIP相关内容:', hasVipContent ? '❌ 需要清理' : '✅ 已清理');
  
  return {
    hasHighlightedPermissions,
    hasVipContent: !hasVipContent // 反转，因为我们希望没有VIP内容
  };
}

// 综合验证
function runComprehensiveVerification() {
  console.log('\n🔍 运行综合权限系统验证...');
  console.log('='.repeat(60));
  
  const buttonUI = checkPermissionButtonUI();
  const brandLibrary = checkBrandLibraryPermissions();
  const creativeStudio = checkCreativeStudioPermissions();
  const upgradeTest = testUpgradeButtonFunctionality();
  const textOptimization = checkPermissionTextOptimization();
  
  console.log('\n📊 验证结果总结:');
  console.log('='.repeat(60));
  
  const results = {
    buttonUIOptimized: buttonUI.percentage >= 80,
    brandLibraryProtected: brandLibrary.checked && (brandLibrary.uploadButtons > 0 || brandLibrary.analysisButtons > 0),
    creativeStudioProtected: creativeStudio.checked && creativeStudio.overlays > 0,
    upgradeButtonsWork: upgradeTest.tested && upgradeTest.buttonCount > 0,
    textOptimized: textOptimization.hasHighlightedPermissions && textOptimization.hasVipContent
  };
  
  console.log('✅ 权限按钮UI优化:', results.buttonUIOptimized ? '通过' : '需要改进', `(${buttonUI.percentage}%)`);
  console.log('✅ 品牌库权限保护:', results.brandLibraryProtected ? '通过' : '需要改进');
  console.log('✅ 创意魔方权限保护:', results.creativeStudioProtected ? '通过' : '需要改进');
  console.log('✅ 升级按钮功能:', results.upgradeButtonsWork ? '通过' : '需要改进');
  console.log('✅ 权限提示优化:', results.textOptimized ? '通过' : '需要改进');
  
  const allPassed = Object.values(results).every(result => result === true);
  
  console.log('\n🎯 最终结果:');
  if (allPassed) {
    console.log('🎉 权限系统优化完成！所有检查都通过了。');
  } else {
    console.log('⚠️ 权限系统仍需要进一步优化，请检查上述结果。');
  }
  
  return { results, allPassed };
}

// 快速检查
function quickPermissionCheck() {
  console.log('\n⚡ 快速权限系统检查...');
  
  const hasPermissionButtons = document.querySelectorAll('.permission-locked-button').length > 0;
  const hasUpgradeButtons = document.querySelectorAll('button:contains("升级")').length > 0;
  const noVipContent = !document.body.textContent.includes('VIP会员中心');
  const hasHighlightedPermissions = document.body.textContent.includes('需要') && 
    (document.body.textContent.includes('专业版') || document.body.textContent.includes('高级版'));
  
  console.log('权限按钮存在:', hasPermissionButtons ? '✅' : '❌');
  console.log('升级按钮存在:', hasUpgradeButtons ? '✅' : '❌');
  console.log('VIP内容已清理:', noVipContent ? '✅' : '❌');
  console.log('权限提示突出:', hasHighlightedPermissions ? '✅' : '❌');
  
  const quickResult = hasPermissionButtons && noVipContent && hasHighlightedPermissions;
  
  if (quickResult) {
    console.log('🎉 快速检查：权限系统优化基本完成！');
  } else {
    console.log('❌ 快速检查：权限系统仍需要优化');
  }
  
  return quickResult;
}

// 导出验证函数
window.permissionVerification = {
  runComprehensiveVerification,
  quickPermissionCheck,
  checkPermissionButtonUI,
  checkBrandLibraryPermissions,
  checkCreativeStudioPermissions,
  testUpgradeButtonFunctionality,
  checkPermissionTextOptimization
};

console.log('\n🚀 权限系统验证工具已准备就绪！');
console.log('使用方法:');
console.log('  permissionVerification.quickPermissionCheck() - 快速检查');
console.log('  permissionVerification.runComprehensiveVerification() - 完整验证');

// 自动运行快速检查
quickPermissionCheck();
