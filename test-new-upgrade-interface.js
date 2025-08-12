/**
 * 测试新升级界面脚本
 * 在浏览器控制台中运行此脚本来测试新的升级界面
 */

console.log('🚀 开始测试新升级界面...');

function testNewUpgradeInterface() {
  console.log('\n=== 📍 1. 定位微信朋友圈文案模板标签 ===');
  
  // 查找微信朋友圈文案模板标签
  const wechatTab = Array.from(document.querySelectorAll('button')).find(btn => 
    btn.textContent && btn.textContent.includes('微信朋友圈文案模板')
  );
  
  if (!wechatTab) {
    console.log('❌ 未找到微信朋友圈文案模板标签');
    return;
  }
  
  console.log('✅ 找到微信朋友圈文案模板标签');
  
  console.log('\n=== 🖱️ 2. 点击标签触发权限检查 ===');
  
  // 点击标签
  wechatTab.click();
  
  // 等待界面渲染
  setTimeout(() => {
    console.log('\n=== 🔍 3. 检查升级界面状态 ===');
    
    // 检查是否有"查看升级方案"按钮
    const upgradeButtons = Array.from(document.querySelectorAll('button')).filter(btn => 
      btn.textContent && btn.textContent.includes('查看升级方案')
    );
    
    console.log(`🔘 "查看升级方案" 按钮数量: ${upgradeButtons.length}`);
    
    if (upgradeButtons.length > 0) {
      console.log('✅ 发现新的升级按钮');
      
      console.log('\n=== 🖱️ 4. 点击升级按钮测试对话框 ===');
      
      // 点击第一个升级按钮
      upgradeButtons[0].click();
      
      // 等待对话框出现
      setTimeout(() => {
        const dialogs = document.querySelectorAll('[role="dialog"]');
        console.log(`📋 对话框数量: ${dialogs.length}`);
        
        if (dialogs.length > 0) {
          console.log('✅ 升级对话框已打开');
          
          // 检查对话框内容
          const dialogContent = dialogs[0].textContent;
          
          // 检查是否包含新界面的特征文字
          const newInterfaceFeatures = [
            '功能升级',
            '选择适合您的订阅计划',
            '体验版',
            '专业版',
            '高级版'
          ];
          
          let foundFeatures = [];
          newInterfaceFeatures.forEach(feature => {
            if (dialogContent.includes(feature)) {
              foundFeatures.push(feature);
            }
          });
          
          console.log(`📝 对话框包含的新界面特征: ${foundFeatures.length}/${newInterfaceFeatures.length}`);
          foundFeatures.forEach(feature => {
            console.log(`  ✓ ${feature}`);
          });
          
          // 检查是否有版本对比卡片
          const versionCards = dialogs[0].querySelectorAll('[class*="Card"], .card, [class*="card"]');
          console.log(`📊 版本对比卡片数量: ${versionCards.length}`);
          
          // 检查是否有升级按钮
          const dialogUpgradeButtons = dialogs[0].querySelectorAll('button');
          const upgradeButtonsInDialog = Array.from(dialogUpgradeButtons).filter(btn => 
            btn.textContent && (
              btn.textContent.includes('立即升级') ||
              btn.textContent.includes('选择') ||
              btn.textContent.includes('升级')
            )
          );
          
          console.log(`🔘 对话框内升级按钮数量: ${upgradeButtonsInDialog.length}`);
          
          if (foundFeatures.length >= 3 && versionCards.length >= 2) {
            console.log('\n🎉 新的升级界面测试成功！');
            console.log('✅ 对话框包含完整的版本对比界面');
            console.log('✅ 用户可以清楚看到各版本差异');
            console.log('✅ 界面设计现代化，用户体验良好');
          } else {
            console.log('\n⚠️ 升级界面可能还需要优化');
            console.log(`- 特征文字覆盖率: ${foundFeatures.length}/${newInterfaceFeatures.length}`);
            console.log(`- 版本卡片数量: ${versionCards.length}`);
          }
          
        } else {
          console.log('❌ 升级对话框未打开');
        }
      }, 1000);
      
    } else {
      console.log('❌ 未找到"查看升级方案"按钮');
      
      // 检查是否还有旧的升级按钮
      const oldUpgradeButtons = Array.from(document.querySelectorAll('button')).filter(btn => 
        btn.textContent && (
          btn.textContent.includes('立即升级解锁') ||
          btn.textContent.includes('立即解锁') ||
          btn.textContent.includes('解锁高级功能')
        )
      );
      
      console.log(`🔘 旧版升级按钮数量: ${oldUpgradeButtons.length}`);
      
      if (oldUpgradeButtons.length > 0) {
        console.log('⚠️ 发现旧版升级按钮，可能需要清理');
        oldUpgradeButtons.forEach((btn, index) => {
          console.log(`  按钮 ${index + 1}: "${btn.textContent.trim()}"`);
        });
      }
    }
    
  }, 1000);
}

// 等待页面加载完成后执行测试
if (document.readyState === 'complete') {
  testNewUpgradeInterface();
} else {
  window.addEventListener('load', testNewUpgradeInterface);
}

console.log('\n=== 📝 测试说明 ===');
console.log('1. 此脚本会自动点击微信朋友圈文案模板标签');
console.log('2. 检查是否显示新的升级界面');
console.log('3. 测试升级对话框的功能');
console.log('4. 如果看到 "🎉 新的升级界面测试成功！" 说明更新已生效');
