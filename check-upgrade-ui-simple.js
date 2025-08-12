/**
 * 简单的升级界面检查脚本
 * 在浏览器控制台中运行
 */

console.log('🔍 检查升级界面更新状态...');

// 检查是否有新的升级对话框组件
const hasPermissionUpgradeDialog = !!window.React && 
  document.querySelector('script[src*="PermissionUpgradeDialog"]') ||
  document.body.innerHTML.includes('PermissionUpgradeDialog');

console.log('📋 PermissionUpgradeDialog 组件:', hasPermissionUpgradeDialog ? '✅ 已加载' : '❌ 未找到');

// 检查是否有"查看升级方案"按钮
const upgradeButtons = Array.from(document.querySelectorAll('button')).filter(btn => 
  btn.textContent && btn.textContent.includes('查看升级方案')
);

console.log('🔘 "查看升级方案" 按钮数量:', upgradeButtons.length);

// 检查是否有旧的版本对比文字
const oldVersionTexts = ['当前版本', '所需版本'];
let foundOldTexts = 0;

oldVersionTexts.forEach(text => {
  const elements = Array.from(document.querySelectorAll('*')).filter(el => 
    el.textContent && el.textContent.includes(text) && el.children.length === 0
  );
  foundOldTexts += elements.length;
});

console.log('📝 旧版本对比文字数量:', foundOldTexts);

// 检查微信朋友圈文案模板标签
const wechatTab = Array.from(document.querySelectorAll('button')).find(btn => 
  btn.textContent && btn.textContent.includes('微信朋友圈文案模板')
);

if (wechatTab) {
  console.log('✅ 找到微信朋友圈文案模板标签');
  console.log('🖱️ 点击标签测试...');
  
  wechatTab.click();
  
  setTimeout(() => {
    // 检查是否有权限遮罩
    const overlays = document.querySelectorAll('[class*="absolute"][class*="inset-0"]');
    console.log('📊 权限遮罩数量:', overlays.length);
    
    // 检查升级按钮
    const newUpgradeButtons = Array.from(document.querySelectorAll('button')).filter(btn => 
      btn.textContent && btn.textContent.includes('查看升级方案')
    );
    
    if (newUpgradeButtons.length > 0) {
      console.log('✅ 发现新的升级按钮，点击测试...');
      newUpgradeButtons[0].click();
      
      setTimeout(() => {
        const dialogs = document.querySelectorAll('[role="dialog"]');
        console.log('📋 对话框数量:', dialogs.length);
        
        if (dialogs.length > 0) {
          const dialogText = dialogs[0].textContent;
          if (dialogText.includes('功能升级') || dialogText.includes('选择适合您的订阅计划')) {
            console.log('🎉 新的升级对话框已成功显示！');
          } else {
            console.log('⚠️ 对话框内容可能还是旧版本');
          }
        }
      }, 500);
    }
  }, 500);
} else {
  console.log('❌ 未找到微信朋友圈文案模板标签');
}

console.log('\n=== 总结 ===');
console.log('如果看到 "🎉 新的升级对话框已成功显示！" 说明更新成功');
console.log('如果没有，请检查页面是否完全加载或刷新页面重试');
