/**
 * 🚨 紧急认证清理脚本
 * 解决授权码重复使用问题，清理所有认证状态
 */

(function() {
  console.log('🚨 启动紧急认证清理...');

  // 清理所有认证相关的localStorage数据
  function clearAllAuthData() {
    const authKeys = [
      'auth_code_guard',          // Round #2 授权码防护
      'auth_retry_guard',         // Round #1 重试防护
      'pkce_code_verifier',       // PKCE验证码
      'authing_user',             // 用户信息
      'auth_token',               // 认证令牌
      'authing_access_token',     // 访问令牌
      'authing_refresh_token',    // 刷新令牌
      'token_info',               // 令牌信息
      'user_info',                // 用户信息
      '_authing_token',           // Authing令牌
      '_authing_session',         // Authing会话
    ];

    let cleared = 0;
    authKeys.forEach(key => {
      if (localStorage.getItem(key)) {
        localStorage.removeItem(key);
        cleared++;
        console.log(`✅ 清理了: ${key}`);
      }
    });

    // 清理所有以authing开头的键
    const allKeys = Object.keys(localStorage);
    allKeys.forEach(key => {
      if (key.toLowerCase().includes('auth') || key.toLowerCase().includes('token')) {
        localStorage.removeItem(key);
        cleared++;
        console.log(`✅ 清理了额外的认证数据: ${key}`);
      }
    });

    return cleared;
  }

  // 清理sessionStorage
  function clearSessionData() {
    try {
      sessionStorage.clear();
      console.log('✅ 清理了sessionStorage');
    } catch (e) {
      console.log('⚠️ 清理sessionStorage失败:', e.message);
    }
  }

  // 清理当前URL的认证参数
  function clearUrlParams() {
    const url = new URL(window.location.href);
    const authParams = ['code', 'state', 'error', 'error_description'];
    let hasAuthParams = false;

    authParams.forEach(param => {
      if (url.searchParams.has(param)) {
        url.searchParams.delete(param);
        hasAuthParams = true;
      }
    });

    if (hasAuthParams) {
      window.history.replaceState({}, document.title, url.pathname);
      console.log('✅ 清理了URL认证参数');
      return true;
    }
    
    return false;
  }

  // 执行全面清理
  function performEmergencyCleanup() {
    console.log('🧹 开始全面认证清理...');
    
    const clearedLocalStorage = clearAllAuthData();
    clearSessionData();
    const clearedUrl = clearUrlParams();
    
    console.log(`📋 清理完成:`);
    console.log(`   - localStorage项目: ${clearedLocalStorage}个`);
    console.log(`   - sessionStorage: 已清理`);
    console.log(`   - URL参数: ${clearedUrl ? '已清理' : '无需清理'}`);
    
    return {
      localStorageCleared: clearedLocalStorage,
      sessionStorageCleared: true,
      urlParamsCleared: clearedUrl
    };
  }

  // 诊断当前认证状态
  function diagnoseAuthState() {
    console.log('🔍 诊断当前认证状态...');
    
    const currentUrl = window.location.href;
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    
    // 检查授权码防护状态
    let codeGuardStatus = null;
    try {
      const guardData = localStorage.getItem('auth_code_guard');
      if (guardData) {
        const parsed = JSON.parse(guardData);
        codeGuardStatus = {
          totalCodes: parsed.usedCodes?.length || 0,
          hasCurrentCode: code && parsed.usedCodes?.find(([c]) => c === code)
        };
      }
    } catch (e) {
      console.log('⚠️ 无法解析授权码防护数据');
    }

    // 检查重试防护状态  
    let retryGuardStatus = null;
    try {
      const retryData = localStorage.getItem('auth_retry_guard');
      if (retryData) {
        const parsed = JSON.parse(retryData);
        retryGuardStatus = {
          attempts: parsed.attempts?.length || 0,
          inCooldown: parsed.cooldownUntil > Date.now()
        };
      }
    } catch (e) {
      console.log('⚠️ 无法解析重试防护数据');
    }

    console.log('📊 诊断结果:', {
      currentUrl: currentUrl.substring(0, 80) + '...',
      hasAuthCode: !!code,
      authCode: code ? code.substring(0, 10) + '...' : null,
      codeGuardStatus,
      retryGuardStatus
    });

    return {
      hasAuthCode: !!code,
      codeGuardStatus,
      retryGuardStatus
    };
  }

  // 提供用户操作指导
  function showUserGuidance() {
    console.log('');
    console.log('🎯 用户操作指导:');
    console.log('1. 已清理所有认证状态和授权码记录');
    console.log('2. 请刷新页面 (F5 或 Ctrl+R)');
    console.log('3. 重新点击登录按钮开始新的认证流程');
    console.log('4. 如果问题仍然存在，请清理浏览器缓存和Cookie');
    console.log('');
    console.log('💡 预防措施:');
    console.log('- 避免在多个标签页同时进行登录');
    console.log('- 登录过程中不要刷新页面');
    console.log('- 确保网络连接稳定');
  }

  // 主函数
  function main() {
    console.log('');
    console.log('='.repeat(50));
    console.log('🚨 紧急认证清理工具');
    console.log('解决: 授权码重复使用问题');
    console.log('时间:', new Date().toLocaleString());
    console.log('='.repeat(50));

    // 先诊断
    const diagnosis = diagnoseAuthState();
    
    // 执行清理
    const result = performEmergencyCleanup();
    
    // 显示指导
    showUserGuidance();
    
    console.log('='.repeat(50));
    console.log('✅ 紧急清理完成！请刷新页面重试登录。');
    console.log('='.repeat(50));
    console.log('');

    // 返回结果供外部使用
    return {
      diagnosis,
      result,
      success: true,
      message: '认证状态已清理，请刷新页面重新登录'
    };
  }

  // 导出到全局作用域供手动调用
  window.emergencyAuthCleanup = main;
  
  // 如果URL包含认证参数且检测到问题，自动执行
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.has('code')) {
    const guardData = localStorage.getItem('auth_code_guard');
    if (guardData) {
      try {
        const parsed = JSON.parse(guardData);
        const currentCode = urlParams.get('code');
        const isCodeUsed = parsed.usedCodes?.find(([c]) => c === currentCode);
        
        if (isCodeUsed) {
          console.log('🚨 检测到重复使用的授权码，自动启动清理...');
          main();
          
          // 建议用户刷新页面
          if (confirm('检测到授权码重复使用问题，已清理认证状态。是否刷新页面重新开始？')) {
            window.location.reload();
          }
        }
      } catch (e) {
        console.log('⚠️ 解析授权码数据时出错，执行预防性清理');
        main();
      }
    }
  }

})();