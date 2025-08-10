/**
 * 调试按钮样式脚本
 * 在浏览器控制台中运行此脚本来检查按钮样式
 */

console.log('🔍 开始调试按钮样式...');

// 等待页面加载
function waitForPageLoad() {
  return new Promise((resolve) => {
    if (document.readyState === 'complete') {
      resolve();
    } else {
      window.addEventListener('load', resolve);
    }
  });
}

// 调试函数
async function debugButtonStyles() {
  await waitForPageLoad();
  
  console.log('\n📋 查找按钮...');
  
  // 查找所有按钮
  const allButtons = Array.from(document.querySelectorAll('button'));
  console.log(`找到 ${allButtons.length} 个按钮`);
  
  // 查找目标按钮
  const upgradeButtons = allButtons.filter(btn => 
    btn.textContent && btn.textContent.includes('解锁高级功能')
  );
  
  const inviteButtons = allButtons.filter(btn => 
    btn.textContent && btn.textContent.includes('立即邀请好友')
  );
  
  console.log(`解锁高级功能按钮: ${upgradeButtons.length} 个`);
  console.log(`立即邀请好友按钮: ${inviteButtons.length} 个`);
  
  // 检查每个按钮的样式
  upgradeButtons.forEach((btn, index) => {
    console.log(`\n🔧 解锁高级功能按钮 ${index + 1}:`);
    console.log('类名:', btn.className);
    console.log('计算样式:');
    const style = getComputedStyle(btn);
    console.log('  背景:', style.background);
    console.log('  背景图片:', style.backgroundImage);
    console.log('  背景色:', style.backgroundColor);
    console.log('  阴影:', style.boxShadow);
    console.log('  颜色:', style.color);
    console.log('  高度:', style.height);
    console.log('  圆角:', style.borderRadius);
  });
  
  inviteButtons.forEach((btn, index) => {
    console.log(`\n👥 立即邀请好友按钮 ${index + 1}:`);
    console.log('类名:', btn.className);
    console.log('计算样式:');
    const style = getComputedStyle(btn);
    console.log('  背景:', style.background);
    console.log('  背景图片:', style.backgroundImage);
    console.log('  背景色:', style.backgroundColor);
    console.log('  阴影:', style.boxShadow);
    console.log('  颜色:', style.color);
    console.log('  高度:', style.height);
    console.log('  圆角:', style.borderRadius);
  });
  
  // 检查CSS变量是否正确定义
  console.log('\n🎨 检查CSS变量:');
  const rootStyle = getComputedStyle(document.documentElement);
  
  const cssVars = [
    '--btn-gradient-upgrade',
    '--btn-gradient-upgrade-hover',
    '--btn-gradient-invite',
    '--btn-gradient-invite-hover',
    '--btn-shadow-upgrade',
    '--btn-shadow-upgrade-hover',
    '--btn-shadow-invite',
    '--btn-shadow-invite-hover'
  ];
  
  cssVars.forEach(varName => {
    const value = rootStyle.getPropertyValue(varName);
    console.log(`${varName}: ${value || '未定义'}`);
  });
  
  // 检查CSS类是否存在
  console.log('\n📝 检查CSS类:');
  const testDiv = document.createElement('div');
  testDiv.className = 'btn-upgrade-premium';
  document.body.appendChild(testDiv);
  
  const testStyle = getComputedStyle(testDiv);
  console.log('btn-upgrade-premium 类的背景:', testStyle.background);
  console.log('btn-upgrade-premium 类的背景图片:', testStyle.backgroundImage);
  
  document.body.removeChild(testDiv);
  
  // 手动应用样式测试
  console.log('\n🧪 手动样式测试:');
  if (upgradeButtons.length > 0) {
    const btn = upgradeButtons[0];
    console.log('应用前的背景:', getComputedStyle(btn).background);
    
    // 手动设置样式
    btn.style.background = 'linear-gradient(135deg, #ff6b35 0%, #f7931e 50%, #ff8c42 100%)';
    btn.style.boxShadow = '0 8px 32px rgba(255, 107, 53, 0.3), 0 4px 16px rgba(255, 107, 53, 0.2)';
    btn.style.color = 'white';
    btn.style.border = 'none';
    
    console.log('手动应用样式后的背景:', getComputedStyle(btn).background);
    console.log('✅ 如果现在按钮有渐变背景，说明CSS变量或类名应用有问题');
  }
}

// 执行调试
debugButtonStyles();
