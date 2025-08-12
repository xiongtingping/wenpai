/**
 * 基于角色的UI渲染验证脚本
 * 验证不同用户角色看到的UI状态
 */

console.log('👤 开始基于角色的UI渲染验证...');

// 检查页面标题右侧的升级提示
function checkPageTitleUpgradePrompt() {
  console.log('\n📍 页面标题升级提示检查:');
  
  const currentPath = window.location.pathname;
  console.log('  当前页面:', currentPath);
  
  // 检查是否有升级提示组件
  const upgradePrompts = document.querySelectorAll('[class*="upgrade"], [class*="lock"], [class*="premium"], [class*="pro"]');
  console.log('  找到升级相关元素数量:', upgradePrompts.length);
  
  // 检查是否有锁图标
  const lockIcons = document.querySelectorAll('svg[class*="lucide-lock"], .lucide-lock');
  console.log('  找到锁图标数量:', lockIcons.length);
  
  // 检查是否有版本徽章
  const versionBadges = document.querySelectorAll('[class*="专属"], [class*="badge"]');
  const relevantBadges = Array.from(versionBadges).filter(badge => 
    badge.textContent?.includes('专属') || 
    badge.textContent?.includes('专业版') || 
    badge.textContent?.includes('高级版')
  );
  console.log('  找到版本徽章数量:', relevantBadges.length);
  
  // 检查是否有升级按钮
  const upgradeButtons = document.querySelectorAll('button:contains("升级"), button[class*="upgrade"]');
  console.log('  找到升级按钮数量:', upgradeButtons.length);
  
  return {
    hasUpgradePrompts: upgradePrompts.length > 0,
    hasLockIcons: lockIcons.length > 0,
    hasVersionBadges: relevantBadges.length > 0,
    hasUpgradeButtons: upgradeButtons.length > 0,
    totalElements: upgradePrompts.length + lockIcons.length + relevantBadges.length + upgradeButtons.length
  };
}

// 检查用户角色状态
function checkUserRoleStatus() {
  console.log('\n👤 用户角色状态检查:');
  
  // 尝试从localStorage获取用户信息
  const userInfo = localStorage.getItem('user') || localStorage.getItem('userInfo');
  let user = null;
  
  if (userInfo) {
    try {
      user = JSON.parse(userInfo);
      console.log('  用户信息:', {
        id: user.id,
        tier: user.tier || user.subscription?.tier || 'trial',
        isVip: user.isVip,
        permissions: user.permissions?.length || 0
      });
    } catch (e) {
      console.log('  用户信息解析失败');
    }
  } else {
    console.log('  未找到用户信息，可能是游客状态');
  }
  
  // 检查认证状态
  const isAuthenticated = !!user;
  console.log('  是否已认证:', isAuthenticated ? '✅' : '❌');
  
  return {
    isAuthenticated,
    userTier: user?.tier || user?.subscription?.tier || 'trial',
    isVip: user?.isVip || false,
    user
  };
}

// 模拟不同用户角色
function simulateUserRole(tier) {
  console.log(`\n🎭 模拟用户角色: ${tier}`);
  
  const mockUser = {
    id: 'test-user',
    tier: tier,
    isVip: tier === 'premium',
    permissions: tier === 'premium' ? ['all'] : tier === 'pro' ? ['basic', 'pro'] : ['basic'],
    subscription: {
      tier: tier,
      status: 'active'
    }
  };
  
  // 保存到localStorage
  localStorage.setItem('user', JSON.stringify(mockUser));
  
  console.log('  已设置模拟用户:', mockUser);
  console.log('  请刷新页面查看UI变化');
  
  return mockUser;
}

// 检查特定页面的权限UI
function checkPageSpecificPermissions() {
  console.log('\n🔍 页面特定权限UI检查:');
  
  const currentPath = window.location.pathname;
  
  if (currentPath === '/brand-library') {
    console.log('  品牌语料库页面检查:');
    
    // 检查上传按钮状态
    const uploadButtons = document.querySelectorAll('button:contains("选择文件"), button:contains("上传")');
    console.log('    上传按钮数量:', uploadButtons.length);
    
    // 检查AI分析按钮状态
    const analysisButtons = document.querySelectorAll('button:contains("分析"), button:contains("AI")');
    console.log('    AI分析按钮数量:', analysisButtons.length);
    
    // 检查PDF对话按钮状态
    const pdfButtons = document.querySelectorAll('button:contains("PDF对话"), button:contains("对话")');
    console.log('    PDF对话按钮数量:', pdfButtons.length);
    
    return {
      pageType: 'brand-library',
      uploadButtons: uploadButtons.length,
      analysisButtons: analysisButtons.length,
      pdfButtons: pdfButtons.length
    };
    
  } else if (currentPath === '/creative-studio') {
    console.log('  创意魔方页面检查:');
    
    // 检查创意魔方功能
    const cubeElements = document.querySelectorAll('[class*="cube"], [class*="creative"]');
    console.log('    创意魔方元素数量:', cubeElements.length);
    
    // 检查权限遮罩
    const overlays = document.querySelectorAll('[class*="overlay"], [class*="permission"]');
    console.log('    权限遮罩数量:', overlays.length);
    
    return {
      pageType: 'creative-studio',
      cubeElements: cubeElements.length,
      overlays: overlays.length
    };
  }
  
  return { pageType: 'other' };
}

// 测试升级按钮功能
function testUpgradeButtonFunctionality() {
  console.log('\n🚀 升级按钮功能测试:');
  
  const upgradeButtons = document.querySelectorAll('button:contains("升级"), button[class*="upgrade"]');
  
  if (upgradeButtons.length === 0) {
    console.log('  ❌ 未找到升级按钮');
    return { tested: false };
  }
  
  console.log(`  找到 ${upgradeButtons.length} 个升级按钮`);
  
  // 检查第一个按钮的属性
  const firstButton = upgradeButtons[0];
  console.log('  第一个升级按钮:');
  console.log('    文本内容:', firstButton.textContent?.trim());
  console.log('    是否禁用:', firstButton.disabled);
  console.log('    CSS类名:', firstButton.className);
  
  // 检查是否有点击事件
  const hasClickHandler = firstButton.onclick || firstButton.addEventListener;
  console.log('    有点击处理器:', !!hasClickHandler);
  
  return {
    tested: true,
    buttonCount: upgradeButtons.length,
    firstButtonText: firstButton.textContent?.trim(),
    hasHandler: !!hasClickHandler
  };
}

// 综合验证
function runComprehensiveRoleBasedVerification() {
  console.log('\n🔍 运行综合基于角色的UI验证...');
  console.log('='.repeat(60));
  
  const userStatus = checkUserRoleStatus();
  const titlePrompt = checkPageTitleUpgradePrompt();
  const pagePermissions = checkPageSpecificPermissions();
  const upgradeTest = testUpgradeButtonFunctionality();
  
  console.log('\n📊 验证结果总结:');
  console.log('='.repeat(60));
  
  const results = {
    userAuthenticated: userStatus.isAuthenticated,
    hasUpgradeUI: titlePrompt.totalElements > 0,
    upgradeButtonsWork: upgradeTest.tested && upgradeTest.buttonCount > 0,
    pageSpecificUI: pagePermissions.pageType !== 'other'
  };
  
  console.log('✅ 用户认证状态:', userStatus.isAuthenticated ? `已认证 (${userStatus.userTier})` : '未认证');
  console.log('✅ 升级UI显示:', results.hasUpgradeUI ? '正常' : '缺失');
  console.log('✅ 升级按钮功能:', results.upgradeButtonsWork ? '正常' : '异常');
  console.log('✅ 页面特定UI:', results.pageSpecificUI ? '正常' : '需要检查');
  
  // 根据用户角色给出建议
  if (!userStatus.isAuthenticated) {
    console.log('\n💡 建议: 当前为游客状态，应该看到升级提示');
  } else if (userStatus.userTier === 'trial') {
    console.log('\n💡 建议: 体验版用户，应该看到灰色按钮和锁图标');
  } else {
    console.log('\n💡 建议: 付费用户，不应该看到升级提示');
  }
  
  const allPassed = Object.values(results).every(result => result === true);
  
  console.log('\n🎯 最终结果:');
  if (allPassed) {
    console.log('🎉 基于角色的UI渲染验证通过！');
  } else {
    console.log('⚠️ 基于角色的UI渲染需要进一步优化。');
  }
  
  return { results, allPassed, userStatus };
}

// 角色切换测试
function testRoleSwitching() {
  console.log('\n🔄 角色切换测试:');
  
  console.log('可用的测试命令:');
  console.log('  roleVerification.simulateUserRole("trial") - 模拟体验版用户');
  console.log('  roleVerification.simulateUserRole("pro") - 模拟专业版用户');
  console.log('  roleVerification.simulateUserRole("premium") - 模拟高级版用户');
  console.log('  localStorage.removeItem("user") - 清除用户信息（游客状态）');
  
  return {
    currentRole: checkUserRoleStatus().userTier,
    instructions: '使用上述命令切换角色后刷新页面查看UI变化'
  };
}

// 导出验证函数
window.roleVerification = {
  runComprehensiveRoleBasedVerification,
  checkUserRoleStatus,
  checkPageTitleUpgradePrompt,
  checkPageSpecificPermissions,
  testUpgradeButtonFunctionality,
  simulateUserRole,
  testRoleSwitching
};

console.log('\n🚀 基于角色的UI验证工具已准备就绪！');
console.log('使用方法:');
console.log('  roleVerification.runComprehensiveRoleBasedVerification() - 完整验证');
console.log('  roleVerification.testRoleSwitching() - 角色切换测试');

// 自动运行验证
runComprehensiveRoleBasedVerification();
