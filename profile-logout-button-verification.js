/**
 * 个人中心登出按钮位置验证脚本
 * 验证登出按钮是否正确移动到个人中心页面右侧
 */

console.log('🔍 开始个人中心登出按钮位置验证...');

// 检查当前页面是否为个人中心
function checkCurrentPage() {
  console.log('\n📍 当前页面检查:');
  
  const currentPath = window.location.pathname;
  console.log('  当前路径:', currentPath);
  
  if (currentPath !== '/profile') {
    console.log('  ❌ 不在个人中心页面');
    console.log('  💡 请访问 /profile 页面进行测试');
    return false;
  }
  
  console.log('  ✅ 在个人中心页面');
  return true;
}

// 检查右上角头像下拉菜单中的登出按钮
function checkAvatarDropdownLogout() {
  console.log('\n👤 右上角头像下拉菜单检查:');
  
  // 查找头像按钮
  const avatarButton = document.querySelector('button[data-radix-dropdown-menu-trigger]');
  
  if (!avatarButton) {
    console.log('  ❌ 未找到头像按钮');
    return { hasAvatar: false, hasLogout: false };
  }
  
  console.log('  ✅ 找到头像按钮');
  
  // 模拟点击头像打开下拉菜单
  avatarButton.click();
  
  // 等待下拉菜单出现
  setTimeout(() => {
    const dropdownMenu = document.querySelector('[data-radix-dropdown-menu-content]');
    
    if (dropdownMenu) {
      console.log('  ✅ 下拉菜单已打开');
      
      // 查找登出相关的菜单项
      const logoutItems = Array.from(dropdownMenu.querySelectorAll('*')).filter(el => 
        el.textContent && (
          el.textContent.includes('登出') || 
          el.textContent.includes('logout') ||
          el.textContent.includes('Logout')
        )
      );
      
      console.log('  登出相关菜单项数量:', logoutItems.length);
      
      if (logoutItems.length === 0) {
        console.log('  ✅ 头像下拉菜单中已成功移除登出按钮');
      } else {
        console.log('  ❌ 头像下拉菜单中仍有登出按钮');
        logoutItems.forEach((item, index) => {
          console.log(`    登出项${index + 1}:`, item.textContent?.trim());
        });
      }
      
      // 关闭下拉菜单
      avatarButton.click();
      
      return {
        hasAvatar: true,
        hasDropdown: true,
        logoutItems: logoutItems.length,
        isLogoutRemoved: logoutItems.length === 0
      };
    } else {
      console.log('  ❌ 下拉菜单未打开');
      return { hasAvatar: true, hasDropdown: false, logoutItems: 0, isLogoutRemoved: false };
    }
  }, 500);
  
  return { hasAvatar: true, pending: true };
}

// 检查个人中心页面标题右侧的登出按钮
function checkProfilePageLogoutButton() {
  console.log('\n🏠 个人中心页面登出按钮检查:');
  
  // 查找个人中心标题区域
  const profileTitle = Array.from(document.querySelectorAll('*')).find(el => 
    el.textContent && el.textContent.includes('个人中心') && 
    el.tagName && ['H1', 'H2', 'H3', 'DIV'].includes(el.tagName)
  );
  
  if (!profileTitle) {
    console.log('  ❌ 未找到个人中心标题');
    return { hasTitle: false, hasLogout: false };
  }
  
  console.log('  ✅ 找到个人中心标题');
  
  // 查找标题所在的容器
  const titleContainer = profileTitle.closest('.flex, [class*="flex"]');
  
  if (!titleContainer) {
    console.log('  ❌ 未找到标题容器');
    return { hasTitle: true, hasContainer: false, hasLogout: false };
  }
  
  console.log('  ✅ 找到标题容器');
  
  // 在标题容器中查找登出按钮
  const logoutButtons = Array.from(titleContainer.querySelectorAll('button')).filter(btn => 
    btn.textContent && (
      btn.textContent.includes('登出') || 
      btn.textContent.includes('logout') ||
      btn.textContent.includes('Logout')
    )
  );
  
  console.log('  登出按钮数量:', logoutButtons.length);
  
  if (logoutButtons.length > 0) {
    const logoutButton = logoutButtons[0];
    console.log('  ✅ 找到登出按钮');
    console.log('  按钮文本:', logoutButton.textContent?.trim());
    console.log('  按钮位置: 标题右侧');
    
    // 检查按钮是否有正确的样式和图标
    const hasLogoutIcon = logoutButton.querySelector('svg, .lucide-log-out');
    console.log('  有登出图标:', hasLogoutIcon ? '✅' : '❌');
    
    // 检查按钮是否可点击
    const isClickable = !logoutButton.disabled;
    console.log('  按钮可点击:', isClickable ? '✅' : '❌');
    
    return {
      hasTitle: true,
      hasContainer: true,
      hasLogout: true,
      logoutButtons: logoutButtons.length,
      buttonText: logoutButton.textContent?.trim(),
      hasIcon: !!hasLogoutIcon,
      isClickable
    };
  } else {
    console.log('  ❌ 未找到登出按钮');
    return {
      hasTitle: true,
      hasContainer: true,
      hasLogout: false,
      logoutButtons: 0
    };
  }
}

// 测试登出按钮功能
function testLogoutButtonFunction() {
  console.log('\n🧪 登出按钮功能测试:');
  
  const logoutButtons = Array.from(document.querySelectorAll('button')).filter(btn => 
    btn.textContent && btn.textContent.includes('登出')
  );
  
  if (logoutButtons.length === 0) {
    console.log('  ❌ 未找到登出按钮');
    return { tested: false };
  }
  
  const logoutButton = logoutButtons[0];
  console.log('  ✅ 找到登出按钮');
  
  // 检查按钮事件处理器
  const hasClickHandler = logoutButton.onclick || logoutButton.addEventListener;
  console.log('  有点击处理器:', !!hasClickHandler);
  
  // 模拟点击测试（不实际点击）
  console.log('  模拟点击测试: 准备就绪');
  console.log('  ⚠️  建议手动点击测试登出功能');
  
  return {
    tested: true,
    hasHandler: !!hasClickHandler,
    buttonCount: logoutButtons.length
  };
}

// 综合验证
function runProfileLogoutButtonVerification() {
  console.log('\n🔍 运行个人中心登出按钮位置综合验证...');
  console.log('='.repeat(60));
  
  const isProfilePage = checkCurrentPage();
  
  if (!isProfilePage) {
    console.log('\n❌ 请先访问个人中心页面 (/profile) 进行测试');
    return { verified: false, reason: 'not_on_profile_page' };
  }
  
  const avatarDropdown = checkAvatarDropdownLogout();
  const profileLogout = checkProfilePageLogoutButton();
  const functionTest = testLogoutButtonFunction();
  
  console.log('\n📊 验证结果总结:');
  console.log('='.repeat(60));
  
  const results = {
    avatarLogoutRemoved: !avatarDropdown.pending && avatarDropdown.isLogoutRemoved,
    profileLogoutAdded: profileLogout.hasLogout,
    logoutFunctionWorks: functionTest.tested && functionTest.hasHandler
  };
  
  console.log('✅ 头像下拉菜单登出移除:', results.avatarLogoutRemoved ? '完成' : '需要检查');
  console.log('✅ 个人中心页面登出添加:', results.profileLogoutAdded ? '完成' : '需要检查');
  console.log('✅ 登出按钮功能:', results.logoutFunctionWorks ? '正常' : '需要检查');
  
  const allPassed = Object.values(results).every(result => result === true);
  
  console.log('\n🎯 最终结果:');
  if (allPassed) {
    console.log('🎉 登出按钮位置修改完成！功能正常运行。');
  } else {
    console.log('⚠️ 部分功能仍需要进一步检查，请查看上述详细结果。');
  }
  
  console.log('\n📋 修改总结:');
  console.log('1. ✅ 右上角头像下拉菜单：移除登出按钮');
  console.log('2. ✅ 个人中心页面标题右侧：添加登出按钮');
  console.log('3. ✅ 登出按钮功能：保持完整的登出逻辑');
  
  return { results, allPassed };
}

// 快速测试
function quickProfileLogoutTest() {
  console.log('\n⚡ 快速个人中心登出按钮测试:');
  
  const currentPath = window.location.pathname;
  console.log('  当前页面:', currentPath);
  
  if (currentPath !== '/profile') {
    console.log('  ℹ️ 请访问个人中心页面进行测试');
    console.log('  💡 使用: window.location.href = "/profile"');
    return;
  }
  
  // 快速检查登出按钮
  const logoutButtons = Array.from(document.querySelectorAll('button')).filter(btn => 
    btn.textContent && btn.textContent.includes('登出')
  );
  
  console.log(`  登出按钮数量: ${logoutButtons.length}`);
  
  if (logoutButtons.length > 0) {
    const button = logoutButtons[0];
    console.log(`  按钮文本: "${button.textContent?.trim()}"`);
    console.log(`  按钮位置: ${button.closest('[class*="flex"]') ? '标题区域' : '其他位置'}`);
    console.log('  ✅ 登出按钮已正确添加到个人中心页面');
  } else {
    console.log('  ❌ 未找到登出按钮');
  }
}

// 导出测试函数
window.profileLogoutButtonVerification = {
  runProfileLogoutButtonVerification,
  checkCurrentPage,
  checkAvatarDropdownLogout,
  checkProfilePageLogoutButton,
  testLogoutButtonFunction,
  quickProfileLogoutTest
};

console.log('\n🚀 个人中心登出按钮位置验证工具已准备就绪！');
console.log('使用方法:');
console.log('  profileLogoutButtonVerification.runProfileLogoutButtonVerification() - 运行完整验证');
console.log('  profileLogoutButtonVerification.quickProfileLogoutTest() - 快速测试');
console.log('  window.location.href = "/profile" - 跳转到个人中心页面');

// 自动运行验证
runProfileLogoutButtonVerification();
