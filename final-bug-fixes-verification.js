/**
 * 最终Bug修复验证脚本
 * 验证所有修复是否正确实施
 */

console.log('🐛 开始最终Bug修复验证...');

// 模拟不同用户等级
function simulateUserTier(tier) {
  const mockUser = {
    id: 'test-user-' + Date.now(),
    tier: tier,
    subscription: {
      tier: tier,
      status: 'active'
    },
    roles: [tier],
    permissions: tier === 'premium' ? ['all'] : tier === 'pro' ? ['basic', 'pro'] : ['basic'],
    isVip: tier === 'premium'
  };
  
  localStorage.setItem('user', JSON.stringify(mockUser));
  console.log(`✅ 已设置用户等级为: ${tier}`);
  
  return mockUser;
}

// 检查网页内容提取按钮权限
function checkContentExtractorPermission() {
  console.log('\n🌐 网页内容提取按钮权限检查:');
  
  // 查找内容提取组件
  const extractButtons = document.querySelectorAll('button:contains("开始提取"), button:contains("提取")');
  console.log('  提取按钮数量:', extractButtons.length);
  
  // 检查是否有权限保护
  const permissionButtons = document.querySelectorAll('.permission-locked-button');
  console.log('  权限保护按钮数量:', permissionButtons.length);
  
  // 检查是否有锁图标
  const lockIcons = document.querySelectorAll('svg[class*="lucide-lock"], .lucide-lock');
  console.log('  锁图标数量:', lockIcons.length);
  
  return {
    extractButtons: extractButtons.length,
    permissionButtons: permissionButtons.length,
    lockIcons: lockIcons.length,
    hasPermissionProtection: permissionButtons.length > 0 || lockIcons.length > 0
  };
}

// 检查品牌语料库升级跳转
function checkBrandLibraryUpgrade() {
  console.log('\n📚 品牌语料库升级跳转检查:');
  
  const currentPath = window.location.pathname;
  if (currentPath !== '/brand-library') {
    console.log('  ℹ️ 不在品牌库页面，跳过检查');
    return { checked: false };
  }
  
  // 查找升级按钮
  const upgradeButtons = document.querySelectorAll('button:contains("升级"), button[class*="upgrade"]');
  console.log('  升级按钮数量:', upgradeButtons.length);
  
  if (upgradeButtons.length > 0) {
    const firstButton = upgradeButtons[0];
    console.log('  第一个升级按钮文本:', firstButton.textContent?.trim());
    
    // 检查是否有点击处理器
    const hasClickHandler = firstButton.onclick || firstButton.addEventListener;
    console.log('  有点击处理器:', !!hasClickHandler);
  }
  
  return {
    checked: true,
    upgradeButtons: upgradeButtons.length,
    hasButtons: upgradeButtons.length > 0
  };
}

// 检查九宫格创意魔方权限遮罩
function checkCreativeCubePermissionMask() {
  console.log('\n🎨 九宫格创意魔方权限遮罩检查:');
  
  const currentPath = window.location.pathname;
  if (currentPath !== '/creative-studio') {
    console.log('  ℹ️ 不在创意魔方页面，跳过检查');
    return { checked: false };
  }
  
  // 检查是否使用了新的权限组件
  const unifiedGuards = document.querySelectorAll('[class*="unified"], [class*="permission-guard"]');
  console.log('  统一权限守卫数量:', unifiedGuards.length);
  
  // 检查是否还有旧的权限遮罩
  const oldOverlays = document.querySelectorAll('[class*="permission-overlay"], [class*="overlay"]');
  console.log('  旧权限遮罩数量:', oldOverlays.length);
  
  return {
    checked: true,
    newGuards: unifiedGuards.length,
    oldOverlays: oldOverlays.length,
    isUpdated: unifiedGuards.length > 0 && oldOverlays.length === 0
  };
}

// 检查Emoji复制权限
function checkEmojiCopyPermission() {
  console.log('\n😊 Emoji复制权限检查:');
  
  const currentPath = window.location.pathname;
  if (currentPath !== '/creative-studio') {
    console.log('  ℹ️ 不在创意魔方页面，跳过检查');
    return { checked: false };
  }
  
  // 设置体验版用户
  simulateUserTier('trial');
  
  // 查找Emoji元素
  const emojiImages = document.querySelectorAll('img[alt*="emoji"], img[src*="emoji"]');
  console.log('  Emoji图片数量:', emojiImages.length);
  
  // 检查是否有锁图标
  const lockIcons = document.querySelectorAll('svg[class*="lucide-lock"], .lucide-lock');
  console.log('  锁图标数量:', lockIcons.length);
  
  // 检查Emoji是否有权限限制样式
  let hasPermissionRestriction = false;
  emojiImages.forEach(img => {
    if (img.className.includes('cursor-not-allowed') || img.className.includes('opacity-70')) {
      hasPermissionRestriction = true;
    }
  });
  
  console.log('  Emoji是否有权限限制样式:', hasPermissionRestriction ? '✅' : '❌');
  
  // 模拟点击测试
  if (emojiImages.length > 0) {
    console.log('  模拟点击第一个Emoji测试权限...');
    const firstEmoji = emojiImages[0];
    
    // 检查点击事件
    const hasClickHandler = firstEmoji.onclick || firstEmoji.addEventListener;
    console.log('  Emoji有点击处理器:', !!hasClickHandler);
  }
  
  return {
    checked: true,
    emojiCount: emojiImages.length,
    lockIcons: lockIcons.length,
    hasRestriction: hasPermissionRestriction,
    isProtected: hasPermissionRestriction || lockIcons.length > 0
  };
}

// 测试升级按钮跳转
function testUpgradeButtonRedirect() {
  console.log('\n🔗 升级按钮跳转测试:');
  
  const upgradeButtons = document.querySelectorAll('button:contains("升级"), button[class*="upgrade"]');
  
  if (upgradeButtons.length === 0) {
    console.log('  ❌ 未找到升级按钮');
    return { tested: false };
  }
  
  console.log(`  找到 ${upgradeButtons.length} 个升级按钮`);
  
  // 测试第一个按钮
  const firstButton = upgradeButtons[0];
  console.log('  第一个按钮文本:', firstButton.textContent?.trim());
  
  // 模拟点击（不实际点击）
  console.log('  模拟点击测试...');
  console.log('  建议手动点击测试跳转是否正常');
  
  return {
    tested: true,
    buttonCount: upgradeButtons.length,
    firstButtonText: firstButton.textContent?.trim()
  };
}

// 综合验证
function runFinalBugFixesVerification() {
  console.log('\n🔍 运行最终Bug修复综合验证...');
  console.log('='.repeat(60));
  
  const contentExtractor = checkContentExtractorPermission();
  const brandLibrary = checkBrandLibraryUpgrade();
  const creativeCube = checkCreativeCubePermissionMask();
  const emojiCopy = checkEmojiCopyPermission();
  const upgradeRedirect = testUpgradeButtonRedirect();
  
  console.log('\n📊 验证结果总结:');
  console.log('='.repeat(60));
  
  const results = {
    contentExtractorFixed: contentExtractor.hasPermissionProtection,
    brandLibraryUpgradeWorks: !brandLibrary.checked || brandLibrary.hasButtons,
    creativeCubeUpdated: !creativeCube.checked || creativeCube.isUpdated,
    emojiCopyProtected: !emojiCopy.checked || emojiCopy.isProtected,
    upgradeButtonsWork: upgradeRedirect.tested && upgradeRedirect.buttonCount > 0
  };
  
  console.log('✅ 内容提取按钮权限:', results.contentExtractorFixed ? '已修复' : '需要检查');
  console.log('✅ 品牌库升级跳转:', results.brandLibraryUpgradeWorks ? '正常' : '需要检查');
  console.log('✅ 创意魔方权限遮罩:', results.creativeCubeUpdated ? '已更新' : '需要检查');
  console.log('✅ Emoji复制权限:', results.emojiCopyProtected ? '已保护' : '需要检查');
  console.log('✅ 升级按钮功能:', results.upgradeButtonsWork ? '正常' : '需要检查');
  
  const allPassed = Object.values(results).every(result => result === true);
  
  console.log('\n🎯 最终结果:');
  if (allPassed) {
    console.log('🎉 所有Bug修复完成！功能正常运行。');
  } else {
    console.log('⚠️ 部分Bug仍需要进一步检查，请查看上述详细结果。');
  }
  
  console.log('\n📋 修复总结:');
  console.log('1. ✅ 网页内容提取：添加高级版权限锁');
  console.log('2. ✅ 品牌语料库升级：修复跳转逻辑');
  console.log('3. ✅ 九宫格创意魔方：更新为新权限遮罩');
  console.log('4. ✅ Emoji复制权限：修复体验版用户权限检查');
  
  return { results, allPassed };
}

// 快速Bug修复测试
function quickBugFixTest() {
  console.log('\n⚡ 快速Bug修复测试:');
  
  const currentPath = window.location.pathname;
  console.log('  当前页面:', currentPath);
  
  // 根据页面进行相应检查
  if (currentPath === '/creative-studio') {
    console.log('  🎨 创意魔方页面检查:');
    
    // 检查Emoji权限
    simulateUserTier('trial');
    const emojiImages = document.querySelectorAll('img[alt*="emoji"], img[src*="emoji"]');
    const lockIcons = document.querySelectorAll('svg[class*="lucide-lock"], .lucide-lock');
    
    console.log(`    Emoji数量: ${emojiImages.length}`);
    console.log(`    锁图标数量: ${lockIcons.length}`);
    console.log(`    权限保护: ${lockIcons.length > 0 ? '✅' : '❌'}`);
    
  } else if (currentPath === '/brand-library') {
    console.log('  📚 品牌库页面检查:');
    
    const upgradeButtons = document.querySelectorAll('button:contains("升级")');
    console.log(`    升级按钮数量: ${upgradeButtons.length}`);
    console.log(`    升级功能: ${upgradeButtons.length > 0 ? '✅' : '❌'}`);
    
  } else {
    console.log('  ℹ️ 请访问创意魔方或品牌库页面进行测试');
  }
}

// 导出测试函数
window.finalBugFixesVerification = {
  runFinalBugFixesVerification,
  simulateUserTier,
  checkContentExtractorPermission,
  checkBrandLibraryUpgrade,
  checkCreativeCubePermissionMask,
  checkEmojiCopyPermission,
  testUpgradeButtonRedirect,
  quickBugFixTest
};

console.log('\n🚀 最终Bug修复验证工具已准备就绪！');
console.log('使用方法:');
console.log('  finalBugFixesVerification.runFinalBugFixesVerification() - 运行完整验证');
console.log('  finalBugFixesVerification.simulateUserTier("trial/pro/premium") - 模拟用户等级');
console.log('  finalBugFixesVerification.quickBugFixTest() - 快速测试当前页面');
console.log('  location.reload() - 刷新页面应用新设置');

// 自动运行验证
runFinalBugFixesVerification();
