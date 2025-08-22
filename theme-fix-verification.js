/**
 * 🎨 主题系统修复验证脚本
 * 验证主题权限检查修复的效果
 */

(function() {
  'use strict';
  
  console.log('🎨 主题系统修复验证开始...');
  
  // 检查页面初始主题状态
  function checkInitialTheme() {
    const html = document.documentElement;
    const currentTheme = html.getAttribute('data-theme');
    const haseDarkClass = html.classList.contains('dark');
    
    console.log('📊 初始主题状态检查:');
    console.log(`  当前主题: ${currentTheme}`);
    console.log(`  是否有dark类: ${haseDarkClass}`);
    console.log(`  预期默认主题: light`);
    
    return {
      currentTheme,
      haseDarkClass,
      isDefaultCorrect: currentTheme === 'light'
    };
  }
  
  // 检查是否还有权限不足的日志
  function checkPermissionLogs() {
    console.log('🔍 检查控制台日志...');
    
    // 监听新的日志输出
    const originalLog = console.log;
    let permissionErrorCount = 0;
    
    console.log = function(...args) {
      const message = args.join(' ');
      if (message.includes('主题权限不足') || message.includes('回退到 light')) {
        permissionErrorCount++;
        console.warn(`⚠️ 发现权限回退日志: ${message}`);
      }
      originalLog.apply(console, args);
    };
    
    // 5秒后检查结果
    setTimeout(() => {
      console.log = originalLog;
      console.log(`📈 权限回退日志统计: ${permissionErrorCount} 次`);
      
      if (permissionErrorCount === 0) {
        console.log('✅ 未发现权限回退日志，修复成功！');
      } else {
        console.log('❌ 仍有权限回退问题，需要进一步调查');
      }
    }, 5000);
    
    return permissionErrorCount;
  }
  
  // 检查 authing-fix.js 是否已被移除
  function checkAuthingFix() {
    console.log('🔧 检查 authing-fix.js 状态...');
    
    const scripts = document.querySelectorAll('script[src*="authing-fix"]');
    const hasAuthingFix = scripts.length > 0;
    
    console.log(`  authing-fix.js 脚本数量: ${scripts.length}`);
    console.log(`  是否已移除: ${!hasAuthingFix ? '✅' : '❌'}`);
    
    return {
      scriptCount: scripts.length,
      isRemoved: !hasAuthingFix
    };
  }
  
  // 检查主题配置是否正确
  function checkThemeConfiguration() {
    console.log('⚙️ 检查主题配置...');
    
    // 检查 CSS 变量是否定义
    const style = getComputedStyle(document.documentElement);
    const backgroundVar = style.getPropertyValue('--background');
    const foregroundVar = style.getPropertyValue('--foreground');
    
    console.log(`  --background 变量: ${backgroundVar}`);
    console.log(`  --foreground 变量: ${foregroundVar}`);
    
    const hasValidVars = backgroundVar && foregroundVar;
    console.log(`  主题变量状态: ${hasValidVars ? '✅ 正常' : '❌ 缺失'}`);
    
    return {
      hasValidVars,
      backgroundVar,
      foregroundVar
    };
  }
  
  // 执行完整验证
  function runFullVerification() {
    console.log('\n🚀 开始完整验证...\n');
    
    const themeResult = checkInitialTheme();
    const authingResult = checkAuthingFix();
    const configResult = checkThemeConfiguration();
    const logResult = checkPermissionLogs();
    
    // 综合评估
    setTimeout(() => {
      console.log('\n📋 验证结果汇总:');
      console.log(`  默认主题正确: ${themeResult.isDefaultCorrect ? '✅' : '❌'}`);
      console.log(`  authing-fix已移除: ${authingResult.isRemoved ? '✅' : '❌'}`);
      console.log(`  主题变量正常: ${configResult.hasValidVars ? '✅' : '❌'}`);
      
      const allPassed = themeResult.isDefaultCorrect && 
                       authingResult.isRemoved && 
                       configResult.hasValidVars;
      
      if (allPassed) {
        console.log('\n🎉 主题系统修复验证通过！');
        console.log('✨ 默认主题现在正确设置为 light，不再有不必要的权限检查回退。');
      } else {
        console.log('\n⚠️ 仍有问题需要解决，请检查上述失败项。');
      }
    }, 6000);
  }
  
  // 启动验证
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', runFullVerification);
  } else {
    runFullVerification();
  }
  
  // 导出验证函数供手动调用
  window.themeFixVerification = {
    checkInitialTheme,
    checkPermissionLogs,
    checkAuthingFix,
    checkThemeConfiguration,
    runFullVerification
  };
  
})();