/**
 * 主题切换调试脚本
 * 用于检查主题切换是否正常工作
 */

console.log('🔍 主题切换调试脚本已加载');

// 检查当前主题状态
function checkThemeStatus() {
  const dataTheme = document.documentElement.getAttribute('data-theme');
  const computedStyle = getComputedStyle(document.documentElement);
  
  console.log('📊 当前主题状态:');
  console.log('  data-theme 属性:', dataTheme);
  console.log('  --background:', computedStyle.getPropertyValue('--background'));
  console.log('  --foreground:', computedStyle.getPropertyValue('--foreground'));
  console.log('  --primary:', computedStyle.getPropertyValue('--primary'));
  console.log('  --card:', computedStyle.getPropertyValue('--card'));
  console.log('  --border:', computedStyle.getPropertyValue('--border'));
  
  // 检查localStorage
  const savedTheme = localStorage.getItem('wenpai_theme');
  console.log('  localStorage 中的主题:', savedTheme);
  
  // 检查实际应用的样式
  const bodyStyle = getComputedStyle(document.body);
  console.log('  body 背景色:', bodyStyle.backgroundColor);
  console.log('  body 文字色:', bodyStyle.color);
}

// 监听主题变化
function watchThemeChanges() {
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === 'attributes' && mutation.attributeName === 'data-theme') {
        console.log('🎨 检测到主题变化:', {
          oldValue: mutation.oldValue,
          newValue: document.documentElement.getAttribute('data-theme')
        });
        setTimeout(checkThemeStatus, 100);
      }
    });
  });
  
  observer.observe(document.documentElement, {
    attributes: true,
    attributeOldValue: true,
    attributeFilter: ['data-theme']
  });
  
  console.log('👀 开始监听主题变化');
}

// 手动切换主题进行测试
function testThemeSwitch(theme) {
  console.log(`🧪 测试切换到主题: ${theme}`);
  
  // 模拟useTheme的switchTheme函数
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('wenpai_theme', theme);
  
  setTimeout(() => {
    checkThemeStatus();
  }, 100);
}

// 检查CSS变量是否正确定义
function checkCSSVariables() {
  console.log('🎨 检查CSS变量定义:');
  
  const themes = ['light', 'dark', 'green', 'blue', 'gold'];
  themes.forEach(theme => {
    const testElement = document.createElement('div');
    testElement.setAttribute('data-theme', theme);
    testElement.style.position = 'absolute';
    testElement.style.left = '-9999px';
    document.body.appendChild(testElement);
    
    const style = getComputedStyle(testElement);
    console.log(`  ${theme} 主题:`);
    console.log(`    --background: ${style.getPropertyValue('--background')}`);
    console.log(`    --foreground: ${style.getPropertyValue('--foreground')}`);
    console.log(`    --primary: ${style.getPropertyValue('--primary')}`);
    
    document.body.removeChild(testElement);
  });
}

// 初始化调试
function initDebug() {
  console.log('🚀 主题调试工具初始化');
  
  // 检查初始状态
  checkThemeStatus();
  
  // 检查CSS变量
  checkCSSVariables();
  
  // 开始监听变化
  watchThemeChanges();
  
  // 暴露测试函数到全局
  window.debugTheme = {
    checkStatus: checkThemeStatus,
    testSwitch: testThemeSwitch,
    checkVariables: checkCSSVariables
  };
  
  console.log('✅ 调试工具已就绪，可以使用以下命令:');
  console.log('  debugTheme.checkStatus() - 检查当前主题状态');
  console.log('  debugTheme.testSwitch("dark") - 测试切换到暗色主题');
  console.log('  debugTheme.checkVariables() - 检查CSS变量定义');
}

// 等待DOM加载完成后初始化
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initDebug);
} else {
  initDebug();
} 