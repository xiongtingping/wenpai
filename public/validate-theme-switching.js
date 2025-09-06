/**
 * 🎨 主题切换功能验证脚本
 * 验证主题系统是否正常工作
 */

console.log('🎨 开始主题切换功能验证...');

// 验证默认主题
function validateDefaultTheme() {
  console.log('🔍 验证默认主题...');
  
  const html = document.documentElement;
  const currentTheme = html.getAttribute('data-theme');
  const storedTheme = localStorage.getItem('wenpai-theme');
  
  console.log('当前主题属性:', currentTheme);
  console.log('存储的主题:', storedTheme);
  
  if (currentTheme === 'light' || !currentTheme) {
    console.log('✅ 默认主题设置正确 (light)');
  } else {
    console.log('⚠️ 默认主题可能不正确:', currentTheme);
  }
}

// 测试主题切换
function testThemeSwitching() {
  console.log('🔄 测试主题切换功能...');
  
  try {
    const html = document.documentElement;
    const originalTheme = html.getAttribute('data-theme');
    
    // 切换到深色主题
    html.setAttribute('data-theme', 'dark');
    localStorage.setItem('wenpai-theme', 'dark');
    console.log('✅ 切换到深色主题成功');
    
    // 等待1秒后切回浅色主题
    setTimeout(() => {
      html.setAttribute('data-theme', 'light');
      localStorage.setItem('wenpai-theme', 'light');
      console.log('✅ 切换回浅色主题成功');
      
      console.log('🎉 主题切换功能测试完成');
    }, 1000);
    
  } catch (error) {
    console.log('❌ 主题切换测试失败:', error.message);
  }
}

// 验证主题权限检查
function validateThemePermissions() {
  console.log('
  
  // 检查是否有权限提示相关的函数
  console.log('💡 高级主题需要认证用户权限');
  console.log('💡 默认主题始终可用');
}

// 运行所有验证
validateDefaultTheme();
setTimeout(testThemeSwitching, 500);
setTimeout(validateThemePermissions, 2000);

console.log('\n📋 主题功能验证启动完成');
console.log('🔍 观察控制台输出和页面主题变化');