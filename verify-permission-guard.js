/**
 * 权限守卫改进验证脚本
 * 在浏览器控制台中运行此脚本
 */

console.log('🎯 开始验证权限守卫改进效果...');

// 等待页面完全加载
setTimeout(() => {
  console.log('\n📋 检查改进效果...');
  
  // 1. 检查是否有定价卡片网格
  const pricingGrid = document.querySelector('.grid');
  const pricingCards = document.querySelectorAll('.grid .border-2, .grid .border-4, [class*="grid"] [class*="Card"]');
  console.log(`💳 定价卡片网格: ${pricingGrid ? '✅ 找到' : '❌ 未找到'}`);
  console.log(`💳 定价卡片数量: ${pricingCards.length}`);
  
  // 2. 检查"所需版本"标签
  const requiredBadges = Array.from(document.querySelectorAll('*')).filter(el => 
    el.textContent && el.textContent.includes('所需版本')
  );
  console.log(`🏷️ "所需版本"标签: ${requiredBadges.length > 0 ? '✅ 找到' : '❌ 未找到'} (${requiredBadges.length}个)`);
  
  // 3. 检查升级按钮
  const upgradeButtons = Array.from(document.querySelectorAll('button')).filter(btn => 
    btn.textContent && (
      btn.textContent.includes('立即升级') || 
      btn.textContent.includes('选择') ||
      btn.textContent.includes('开始免费使用')
    )
  );
  console.log(`🔄 升级/选择按钮: ${upgradeButtons.length > 0 ? '✅ 找到' : '❌ 未找到'} (${upgradeButtons.length}个)`);
  
  // 4. 检查是否移除了旧的"查看升级方案"按钮
  const oldButtons = Array.from(document.querySelectorAll('button')).filter(btn => 
    btn.textContent && btn.textContent.includes('查看升级方案')
  );
  console.log(`❌ 旧"查看升级方案"按钮: ${oldButtons.length === 0 ? '✅ 已移除' : '❌ 仍存在'} (${oldButtons.length}个)`);
  
  // 5. 检查价格显示
  const priceElements = Array.from(document.querySelectorAll('*')).filter(el => 
    el.textContent && el.textContent.match(/¥\d+/) && el.children.length === 0
  );
  console.log(`💰 价格显示: ${priceElements.length > 0 ? '✅ 找到' : '❌ 未找到'} (${priceElements.length}个)`);
  
  // 6. 检查功能列表
  const featureChecks = document.querySelectorAll('[data-lucide="check"], .lucide-check');
  console.log(`✅ 功能列表项: ${featureChecks.length > 0 ? '✅ 找到' : '❌ 未找到'} (${featureChecks.length}个)`);
  
  // 7. 检查锁定图标
  const lockIcons = document.querySelectorAll('[data-lucide="lock"], .lucide-lock');
  console.log(`
  
  // 8. 检查"解锁"标题
  const unlockTitles = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6')).filter(el => 
    el.textContent && el.textContent.includes('解锁')
  );
  console.log(`
  
  console.log('\n🎯 改进效果评估:');
  
  // 评估改进效果
  let score = 0;
  let maxScore = 8;
  
  if (pricingCards.length >= 3) {
    score++;
    console.log('✅ 定价卡片显示正常 (+1)');
  } else {
    console.log('❌ 定价卡片数量不足 (0)');
  }
  
  if (requiredBadges.length > 0) {
    score++;
    console.log('✅ "所需版本"标签显示正常 (+1)');
  } else {
    console.log('❌ 未找到"所需版本"标签 (0)');
  }
  
  if (upgradeButtons.length > 0) {
    score++;
    console.log('✅ 升级按钮显示正常 (+1)');
  } else {
    console.log('❌ 未找到升级按钮 (0)');
  }
  
  if (oldButtons.length === 0) {
    score++;
    console.log('✅ 旧的"查看升级方案"按钮已移除 (+1)');
  } else {
    console.log('❌ 仍有旧的"查看升级方案"按钮 (0)');
  }
  
  if (priceElements.length > 0) {
    score++;
    console.log('✅ 价格显示正常 (+1)');
  } else {
    console.log('❌ 未找到价格显示 (0)');
  }
  
  if (featureChecks.length > 0) {
    score++;
    console.log('✅ 功能列表显示正常 (+1)');
  } else {
    console.log('❌ 未找到功能列表 (0)');
  }
  
  if (lockIcons.length > 0) {
    score++;
    console.log('✅ 锁定图标显示正常 (+1)');
  } else {
    console.log('❌ 未找到锁定图标 (0)');
  }
  
  if (unlockTitles.length > 0) {
    score++;
    console.log('✅ 解锁标题显示正常 (+1)');
  } else {
    console.log('❌ 未找到解锁标题 (0)');
  }
  
  console.log(`\n📊 总体评分: ${score}/${maxScore} (${Math.round(score/maxScore*100)}%)`);
  
  if (score >= 6) {
    console.log('🎉 改进效果良好！');
  } else if (score >= 4) {
    console.log('⚠️ 改进效果一般，需要进一步优化');
  } else {
    console.log('❌ 改进效果不佳，需要检查实现');
  }
  
  // 9. 测试按钮点击功能
  if (upgradeButtons.length > 0) {
    console.log('\n🖱️ 测试按钮点击功能...');
    
    // 监听页面跳转
    let navigationDetected = false;
    const originalPushState = history.pushState;
    
    history.pushState = function(...args) {
      navigationDetected = true;
      console.log('🔄 检测到页面跳转:', args[2]);
      return originalPushState.apply(this, args);
    };
    
    // 点击第一个升级按钮
    const firstButton = upgradeButtons[0];
    console.log(`点击按钮: "${firstButton.textContent}"`);
    firstButton.click();
    
    setTimeout(() => {
      if (navigationDetected || window.location.pathname.includes('/payment')) {
        console.log('✅ 按钮点击功能正常');
      } else {
        console.log('❌ 按钮点击未触发跳转');
      }
      
      // 恢复原始方法
      history.pushState = originalPushState;
      
      console.log('\n🎯 权限守卫改进验证完成！');
    }, 1000);
  } else {
    console.log('\n🎯 权限守卫改进验证完成！');
  }
  
}, 2000);

console.log('⏳ 等待页面加载完成...');
