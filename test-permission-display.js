/**
 * 测试权限显示逻辑
 * 验证不同用户等级下的权限提示显示是否正确
 */

console.log('🧪 开始测试权限显示逻辑...');

// 模拟不同等级的用户
function simulateUser(tier) {
  const mockUser = {
    id: 'test-user',
    tier: tier,
    subscription: {
      tier: tier,
      status: 'active'
    },
    roles: [tier],
    permissions: tier === 'premium' ? ['all'] : tier === 'pro' ? ['basic', 'pro'] : ['basic']
  };
  
  // 保存到localStorage
  localStorage.setItem('user', JSON.stringify(mockUser));
  
  console.log(`✅ 已设置用户等级为: ${tier}`);
  console.log('用户信息:', mockUser);
  
  return mockUser;
}

// 检查当前用户等级
function checkCurrentUserTier() {
  console.log('\n👤 当前用户等级检查:');
  
  const userInfo = localStorage.getItem('user');
  if (!userInfo) {
    console.log('  ❌ 未找到用户信息');
    return null;
  }
  
  try {
    const user = JSON.parse(userInfo);
    console.log('  用户ID:', user.id);
    console.log('  用户等级:', user.tier);
    console.log('  订阅状态:', user.subscription?.tier);
    console.log('  用户角色:', user.roles);
    
    return user;
  } catch (e) {
    console.log('  ❌ 用户信息解析失败');
    return null;
  }
}

// 检查页面权限提示显示
function checkPermissionPromptDisplay() {
  console.log('\n🔍 权限提示显示检查:');
  
  const currentPath = window.location.pathname;
  console.log('  当前页面:', currentPath);
  
  // 检查升级提示
  const upgradePrompts = document.querySelectorAll('[class*="upgrade"], button:contains("升级")');
  console.log('  升级提示数量:', upgradePrompts.length);
  
  // 检查版本徽章
  const versionBadges = document.querySelectorAll('[class*="专属"], [class*="badge"]');
  const relevantBadges = Array.from(versionBadges).filter(badge => 
    badge.textContent?.includes('专属') || 
    badge.textContent?.includes('专业版') || 
    badge.textContent?.includes('高级版')
  );
  console.log('  版本徽章数量:', relevantBadges.length);
  
  // 检查锁图标
  const lockIcons = document.querySelectorAll('svg[class*="lucide-lock"], .lucide-lock');
  console.log('  锁图标数量:', lockIcons.length);
  
  return {
    upgradePrompts: upgradePrompts.length,
    versionBadges: relevantBadges.length,
    lockIcons: lockIcons.length
  };
}

// 测试不同用户等级的权限显示
function testPermissionDisplayForTier(tier) {
  console.log(`\n🎭 测试 ${tier} 用户的权限显示:`);
  console.log('='.repeat(40));
  
  // 设置用户等级
  simulateUser(tier);
  
  // 检查显示
  const display = checkPermissionPromptDisplay();
  
  // 根据页面和用户等级判断是否应该显示权限提示
  const currentPath = window.location.pathname;
  let shouldShowPrompts = false;
  
  if (currentPath === '/creative-studio') {
    // 创意魔方需要专业版，只有体验版用户应该看到提示
    shouldShowPrompts = tier === 'trial';
  } else if (currentPath === '/brand-library') {
    // 品牌库需要高级版，体验版和专业版用户应该看到提示
    shouldShowPrompts = tier === 'trial' || tier === 'pro';
  }
  
  console.log('  应该显示权限提示:', shouldShowPrompts ? '是' : '否');
  console.log('  实际显示权限提示:', display.upgradePrompts > 0 ? '是' : '否');
  
  const isCorrect = (shouldShowPrompts && display.upgradePrompts > 0) || (!shouldShowPrompts && display.upgradePrompts === 0);
  console.log('  显示是否正确:', isCorrect ? '✅' : '❌');
  
  return {
    tier,
    shouldShow: shouldShowPrompts,
    actualShow: display.upgradePrompts > 0,
    isCorrect
  };
}

// 测试所有用户等级
function testAllUserTiers() {
  console.log('\n🔄 测试所有用户等级的权限显示:');
  console.log('='.repeat(50));
  
  const tiers = ['trial', 'pro', 'premium'];
  const results = [];
  
  for (const tier of tiers) {
    const result = testPermissionDisplayForTier(tier);
    results.push(result);
    
    // 等待一下让页面更新
    setTimeout(() => {
      console.log(`${tier} 测试完成`);
    }, 500);
  }
  
  return results;
}

// 修复权限显示问题
function fixPermissionDisplay() {
  console.log('\n🔧 尝试修复权限显示问题:');
  
  // 强制刷新页面以应用新的用户设置
  console.log('  建议刷新页面以应用新的用户设置');
  console.log('  使用 location.reload() 刷新页面');
  
  // 检查React组件是否正确更新
  const reactRoot = document.querySelector('#root');
  if (reactRoot) {
    console.log('  React根元素存在，组件应该会自动更新');
  }
}

// 快速测试当前页面
function quickTestCurrentPage() {
  console.log('\n⚡ 快速测试当前页面:');
  
  const user = checkCurrentUserTier();
  const display = checkPermissionPromptDisplay();
  
  if (!user) {
    console.log('  ❌ 无用户信息，设置为体验版用户');
    simulateUser('trial');
    return;
  }
  
  const currentPath = window.location.pathname;
  console.log(`  页面: ${currentPath}, 用户: ${user.tier}`);
  
  // 判断是否应该显示权限提示
  let shouldShow = false;
  if (currentPath === '/creative-studio' && user.tier === 'trial') {
    shouldShow = true;
  } else if (currentPath === '/brand-library' && (user.tier === 'trial' || user.tier === 'pro')) {
    shouldShow = true;
  }
  
  console.log(`  应该显示权限提示: ${shouldShow}`);
  console.log(`  实际显示权限提示: ${display.upgradePrompts > 0}`);
  
  if (shouldShow !== (display.upgradePrompts > 0)) {
    console.log('  ❌ 权限显示不正确，建议刷新页面');
  } else {
    console.log('  ✅ 权限显示正确');
  }
}

// 导出测试函数
window.permissionDisplayTest = {
  simulateUser,
  checkCurrentUserTier,
  checkPermissionPromptDisplay,
  testPermissionDisplayForTier,
  testAllUserTiers,
  fixPermissionDisplay,
  quickTestCurrentPage
};

console.log('\n🚀 权限显示测试工具已准备就绪！');
console.log('使用方法:');
console.log('  permissionDisplayTest.simulateUser("trial") - 模拟体验版用户');
console.log('  permissionDisplayTest.simulateUser("pro") - 模拟专业版用户');
console.log('  permissionDisplayTest.simulateUser("premium") - 模拟高级版用户');
console.log('  permissionDisplayTest.quickTestCurrentPage() - 快速测试当前页面');
console.log('  location.reload() - 刷新页面应用新设置');

// 自动运行快速测试
quickTestCurrentPage();
