/**
 * 🔧 登录问题诊断和修复脚本
 * 在浏览器控制台中运行，帮助诊断和修复登录按钮无反应的问题
 */

(function() {
  'use strict';
  
  console.log('🔧 登录问题诊断脚本启动...');
  
  // 1. 检查认证状态
  function checkAuthState() {
    console.log('\n📊 认证状态检查:');
    
    // 检查React context（如果可访问）
    try {
      const rootElement = document.getElementById('root');
      if (rootElement && rootElement._reactInternalInstance) {
        console.log('✅ React应用已挂载');
      }
    } catch (error) {
      console.log('⚠️ 无法直接访问React状态');
    }
    
    // 检查localStorage中的认证信息
    const authKeys = Object.keys(localStorage).filter(key => 
      key.includes('auth') || 
      key.includes('token') || 
      key.includes('user') ||
      key.includes('wenpai')
    );
    
    console.log('本地存储的认证相关键:', authKeys);
    
    return { authKeys };
  }
  
  // 2. 检查登录按钮
  function checkLoginButtons() {
    console.log('\n🔘 登录按钮检查:');
    
    const selectors = [
      'button:contains("登录")',
      '[data-testid*="login"]',
      '.login-btn',
      '#login-button',
      'a[href*="login"]'
    ];
    
    const buttons = [];
    
    // 检查所有可能的登录按钮
    document.querySelectorAll('button').forEach((btn, index) => {
      const text = btn.textContent?.trim() || '';
      if (text.includes('登录') || text.includes('Login') || text.includes('login')) {
        buttons.push({
          index,
          text,
          disabled: btn.disabled,
          visible: btn.offsetParent !== null,
          hasClickHandler: !!(btn.onclick || btn.addEventListener),
          element: btn
        });
      }
    });
    
    console.log(`找到 ${buttons.length} 个登录按钮:`);\n    buttons.forEach((btn, i) => {\n      console.log(`  ${i + 1}. "${btn.text}" - ${btn.disabled ? '禁用' : '启用'} - ${btn.visible ? '可见' : '隐藏'}`);\n    });\n    \n    return buttons;\n  }\n  \n  // 3. 模拟登录点击\n  function simulateLoginClick() {\n    console.log('\n🖱️ 模拟登录点击:');\n    \n    const buttons = checkLoginButtons();\n    if (buttons.length === 0) {\n      console.log('❌ 没有找到登录按钮');\n      return false;\n    }\n    \n    const firstButton = buttons[0];\n    if (firstButton.disabled) {\n      console.log('⚠️ 登录按钮被禁用');\n      return false;\n    }\n    \n    console.log('📱 点击第一个登录按钮...');\n    \n    // 创建点击事件\n    const clickEvent = new MouseEvent('click', {\n      bubbles: true,\n      cancelable: true,\n      view: window\n    });\n    \n    firstButton.element.dispatchEvent(clickEvent);\n    \n    setTimeout(() => {\n      console.log('✅ 点击事件已发送，检查是否有响应...');\n    }, 1000);\n    \n    return true;\n  }\n  \n  // 4. 检查网络状态\n  function checkNetworkStatus() {\n    console.log('\n🌐 网络状态检查:');\n    \n    if (navigator.onLine) {\n      console.log('✅ 网络连接正常');\n    } else {\n      console.log('❌ 网络连接异常');\n    }\n    \n    // 检查是否能访问认证服务\n    const authHost = 'https://rzcswqs4sq0f.authing.cn';\n    fetch(authHost, { mode: 'no-cors' })\n      .then(() => {\n        console.log('✅ 认证服务可访问');\n      })\n      .catch(error => {\n        console.log('❌ 认证服务访问失败:', error.message);\n      });\n  }\n  \n  // 5. 强制重置认证状态\n  function forceResetAuth() {\n    console.log('\n🔄 强制重置认证状态...');\n    \n    // 清理localStorage\n    const keysToRemove = Object.keys(localStorage).filter(key => \n      key.includes('auth') || \n      key.includes('token') || \n      key.includes('user') ||\n      key.includes('wenpai')\n    );\n    \n    keysToRemove.forEach(key => {\n      localStorage.removeItem(key);\n      console.log(`  ❌ 已删除: ${key}`);\n    });\n    \n    // 如果有全局重置方法，调用它\n    if (window.authSystem && window.authSystem.forceReset) {\n      window.authSystem.forceReset();\n      console.log('✅ 已调用全局重置方法');\n    }\n    \n    // 建议刷新页面\n    console.log('💡 建议刷新页面以完全重置状态');\n  }\n  \n  // 6. 完整诊断\n  function runFullDiagnosis() {\n    console.log('\\n🚀 开始完整诊断...');\n    console.log('='.repeat(50));\n    \n    const authState = checkAuthState();\n    const loginButtons = checkLoginButtons();\n    checkNetworkStatus();\n    \n    console.log('\\n📋 诊断结果汇总:');\n    console.log('='.repeat(50));\n    \n    if (loginButtons.length === 0) {\n      console.log('❌ 问题：没有找到登录按钮');\n      console.log('💡 建议：检查页面是否正确加载，或刷新页面');\n    } else if (loginButtons.some(btn => btn.disabled)) {\n      console.log('⚠️ 问题：登录按钮被禁用');\n      console.log('💡 建议：检查认证系统初始化状态，可能需要重置');\n    } else {\n      console.log('✅ 登录按钮状态正常');\n    }\n    \n    if (authState.authKeys.length > 0) {\n      console.log('ℹ️ 本地存储中有认证数据，可能是缓存问题');\n    }\n    \n    console.log('\\n🛠️ 可用修复命令:');\n    console.log('  loginDiagnostic.simulateClick() - 模拟点击登录按钮');\n    console.log('  loginDiagnostic.forceReset() - 强制重置认证状态');\n    console.log('  loginDiagnostic.checkButtons() - 重新检查登录按钮');\n  }\n  \n  // 导出诊断功能\n  window.loginDiagnostic = {\n    checkAuth: checkAuthState,\n    checkButtons: checkLoginButtons,\n    simulateClick: simulateLoginClick,\n    checkNetwork: checkNetworkStatus,\n    forceReset: forceResetAuth,\n    runFull: runFullDiagnosis\n  };\n  \n  // 自动运行诊断\n  runFullDiagnosis();\n  \n  console.log('\\n✅ 登录诊断脚本准备就绪！');\n  console.log('💡 使用 loginDiagnostic.runFull() 重新运行完整诊断');\n  \n})();
