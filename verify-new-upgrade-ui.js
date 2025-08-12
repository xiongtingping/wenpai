/**
 * 验证新升级界面脚本
 * 在浏览器控制台中运行此脚本来检查新的升级界面是否生效
 */

console.log('🔍 开始验证新升级界面...');

function verifyNewUpgradeUI() {
  console.log('\n=== 🎯 1. 检查页面加载状态 ===');
  
  // 等待页面完全加载
  if (document.readyState !== 'complete') {
    console.log('⏳ 页面还在加载中，请稍后再试...');
    return;
  }
  
  console.log('✅ 页面已完全加载');
  
  console.log('\n=== 🔍 2. 查找微信朋友圈文案模板标签 ===');
  
  // 查找微信朋友圈文案模板标签
  const wechatTab = Array.from(document.querySelectorAll('button')).find(btn => 
    btn.textContent && btn.textContent.includes('微信朋友圈文案模板')
  );
  
  if (!wechatTab) {
    console.log('❌ 未找到微信朋友圈文案模板标签');
    return;
  }
  
  console.log('✅ 找到微信朋友圈文案模板标签');
  console.log('📍 标签文本:', wechatTab.textContent.trim());
  
  console.log('\n=== 🖱️ 3. 点击标签触发权限检查 ===');
  
  // 点击标签
  wechatTab.click();
  
  // 等待一下让界面渲染
  setTimeout(() => {
    console.log('\n=== 🔍 4. 检查升级界面元素 ===');
    
    // 检查是否有权限遮罩
    const overlays = document.querySelectorAll('[class*="absolute"][class*="inset-0"]');
    console.log(`📊 权限遮罩数量: ${overlays.length}`);
    
    // 检查升级按钮
    const upgradeButtons = Array.from(document.querySelectorAll('button')).filter(btn => 
      btn.textContent && (
        btn.textContent.includes('查看升级方案') ||
        btn.textContent.includes('立即升级') ||
        btn.textContent.includes('升级解锁')
      )
    );
    
    console.log(`🔘 升级按钮数量: ${upgradeButtons.length}`);
    upgradeButtons.forEach((btn, index) => {
      console.log(`  按钮 ${index + 1}: "${btn.textContent.trim()}"`);
    });
    
    // 检查是否有"解锁"相关文字
    const unlockTexts = Array.from(document.querySelectorAll('*')).filter(el => 
      el.textContent && el.textContent.includes('解锁') && el.children.length === 0
    );
    
    console.log(`🔓 "解锁"文字元素数量: ${unlockTexts.length}`);
    unlockTexts.forEach((el, index) => {
      if (index < 5) { // 只显示前5个
        console.log(`  文字 ${index + 1}: "${el.textContent.trim()}"`);
      }
    });
    
    // 检查是否有版本对比相关文字
    const versionTexts = ['当前版本', '所需版本', '体验版', '专业版'];
    let foundVersionTexts = [];
    
    versionTexts.forEach(text => {
      const elements = Array.from(document.querySelectorAll('*')).filter(el => 
        el.textContent && el.textContent.includes(text) && el.children.length === 0
      );
      if (elements.length > 0) {
        foundVersionTexts.push({ text, count: elements.length });
      }
    });
    
    console.log('\n=== 📋 5. 版本对比文字检查 ===');
    if (foundVersionTexts.length === 0) {
      console.log('✅ 未发现旧的版本对比文字（说明已使用新界面）');
    } else {
      console.log('⚠️ 发现版本对比文字:');
      foundVersionTexts.forEach(item => {
        console.log(`  - ${item.text}: ${item.count} 个`);
      });
    }
    
    console.log('\n=== 🖱️ 6. 尝试点击升级按钮 ===');
    
    if (upgradeButtons.length > 0) {
      console.log('🔘 点击第一个升级按钮...');
      upgradeButtons[0].click();
      
      // 等待对话框出现
      setTimeout(() => {
        const dialogs = document.querySelectorAll('[role="dialog"]');
        console.log(`📋 对话框数量: ${dialogs.length}`);
        
        if (dialogs.length > 0) {
          console.log('✅ 升级对话框已打开');
          
          // 检查对话框内容
          const dialogContent = dialogs[0].textContent;
          if (dialogContent.includes('功能升级') || dialogContent.includes('选择适合您的订阅计划')) {
            console.log('✅ 检测到新的升级对话框界面');
          } else {
            console.log('⚠️ 对话框内容可能还是旧版本');
          }
        } else {
          console.log('❌ 升级对话框未打开');
        }
      }, 1000);
    } else {
      console.log('❌ 未找到升级按钮');
    }
    
  }, 1000);
}

// 立即执行验证
verifyNewUpgradeUI();

console.log('\n=== 📝 使用说明 ===');
console.log('1. 确保已打开创意工作室页面');
console.log('2. 此脚本会自动点击微信朋友圈文案模板标签');
console.log('3. 检查是否显示新的升级界面');
console.log('4. 如果页面还在加载，请等待几秒后重新运行此脚本');
