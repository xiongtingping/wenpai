/**
 * 最终升级界面测试脚本
 * 请在浏览器控制台中运行此脚本
 */

console.log('🔍 最终升级界面测试开始...');

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

async function finalUpgradeTest() {
  await waitForPageLoad();
  
  console.log('\n=== 🎯 步骤1: 查找微信朋友圈文案模板标签 ===');
  
  const wechatTab = Array.from(document.querySelectorAll('button')).find(btn => 
    btn.textContent && btn.textContent.includes('微信朋友圈文案模板')
  );
  
  if (!wechatTab) {
    console.log('❌ 未找到微信朋友圈文案模板标签');
    return;
  }
  
  console.log('✅ 找到微信朋友圈文案模板标签');
  
  console.log('\n=== 🖱️ 步骤2: 点击标签触发权限检查 ===');
  
  // 点击标签
  wechatTab.click();
  
  // 等待界面渲染
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  console.log('\n=== 🔍 步骤3: 检查当前显示的界面 ===');
  
  // 检查是否有"当前版本"、"所需版本"等旧界面文字
  const oldTexts = ['当前版本', '所需版本'];
  let foundOldTexts = [];
  
  oldTexts.forEach(text => {
    const elements = Array.from(document.querySelectorAll('*')).filter(el => 
      el.textContent && el.textContent.includes(text) && 
      el.children.length === 0 && 
      el.offsetParent !== null // 只检查可见元素
    );
    if (elements.length > 0) {
      foundOldTexts.push({ text, count: elements.length });
    }
  });
  
  console.log('📝 旧界面文字检查结果:');
  if (foundOldTexts.length === 0) {
    console.log('✅ 未发现旧界面文字（说明已使用新界面）');
  } else {
    console.log('⚠️ 发现旧界面文字:');
    foundOldTexts.forEach(item => {
      console.log(`  - ${item.text}: ${item.count} 个`);
    });
  }
  
  // 检查升级按钮
  const upgradeButtons = Array.from(document.querySelectorAll('button')).filter(btn => 
    btn.textContent && btn.textContent.includes('查看升级方案') && 
    btn.offsetParent !== null
  );
  
  console.log(`\n🔘 "查看升级方案" 按钮数量: ${upgradeButtons.length}`);
  
  if (upgradeButtons.length > 0) {
    console.log('✅ 发现新的升级按钮');
    
    console.log('\n=== 🖱️ 步骤4: 点击升级按钮测试对话框 ===');
    
    // 点击升级按钮
    upgradeButtons[0].click();
    
    // 等待对话框出现
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const dialogs = document.querySelectorAll('[role="dialog"]');
    console.log(`📋 对话框数量: ${dialogs.length}`);
    
    if (dialogs.length > 0) {
      console.log('✅ 升级对话框已打开');
      
      const dialogContent = dialogs[0].textContent;
      
      // 检查新界面特征
      const newFeatures = [
        '功能升级',
        '选择适合您的订阅计划',
        '体验版',
        '专业版',
        '高级版'
      ];
      
      let foundFeatures = newFeatures.filter(feature => 
        dialogContent.includes(feature)
      );
      
      console.log(`📊 新界面特征覆盖率: ${foundFeatures.length}/${newFeatures.length}`);
      foundFeatures.forEach(feature => {
        console.log(`  ✓ ${feature}`);
      });
      
      // 检查版本对比卡片
      const cards = dialogs[0].querySelectorAll('[class*="Card"], .card, [class*="card"]');
      console.log(`📋 版本对比卡片数量: ${cards.length}`);
      
      // 最终判断
      if (foundFeatures.length >= 3 && cards.length >= 2) {
        console.log('\n🎉 新升级界面测试成功！');
        console.log('✅ 对话框显示完整的版本对比界面');
        console.log('✅ 用户可以清楚看到各版本差异');
        console.log('✅ 界面现代化，用户体验良好');
        
        // 关闭对话框
        const closeButton = dialogs[0].querySelector('button[aria-label="Close"]') || 
                           dialogs[0].querySelector('button:last-child');
        if (closeButton) {
          closeButton.click();
        }
        
        return { success: true, message: '新升级界面已成功实现' };
      } else {
        console.log('\n⚠️ 升级界面可能需要进一步优化');
        return { success: false, message: '界面特征不完整' };
      }
    } else {
      console.log('❌ 升级对话框未打开');
      return { success: false, message: '对话框未打开' };
    }
  } else {
    console.log('❌ 未找到"查看升级方案"按钮');
    
    // 检查是否有其他升级按钮
    const otherUpgradeButtons = Array.from(document.querySelectorAll('button')).filter(btn => 
      btn.textContent && (
        btn.textContent.includes('立即升级') ||
        btn.textContent.includes('升级解锁') ||
        btn.textContent.includes('解锁')
      ) && btn.offsetParent !== null
    );
    
    console.log(`🔘 其他升级按钮数量: ${otherUpgradeButtons.length}`);
    otherUpgradeButtons.forEach((btn, index) => {
      console.log(`  按钮 ${index + 1}: "${btn.textContent.trim()}"`);
    });
    
    return { success: false, message: '未找到升级按钮' };
  }
}

// 运行测试
finalUpgradeTest().then(result => {
  console.log('\n=== 📊 测试结果 ===');
  if (result.success) {
    console.log('🎉 测试通过:', result.message);
  } else {
    console.log('❌ 测试失败:', result.message);
  }
}).catch(error => {
  console.error('❌ 测试出错:', error);
});

console.log('\n=== 📝 使用说明 ===');
console.log('1. 确保已打开创意工作室页面 (http://localhost:5174/creative-studio)');
console.log('2. 此脚本会自动测试升级界面的完整流程');
console.log('3. 如果看到 "🎉 新升级界面测试成功！" 说明更新已生效');
