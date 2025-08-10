/**
 * 个人中心封装验证脚本
 * 在浏览器控制台中运行，验证所有封装功能的完整性
 */

console.log('🔒 个人中心封装验证开始...');
console.log('📋 验证版本: v1.0.0 - FINAL');
console.log('📅 封装日期: 2025-08-10');

function profileCenterEncapsulationVerification() {
  let totalScore = 0;
  let maxScore = 0;
  const results = [];
  
  console.log('\n=== 🎯 1. 界面功能验证 ===');
  
  // 1.1 页面标题检查
  maxScore += 1;
  const pageTitle = Array.from(document.querySelectorAll('*')).find(el => 
    el.textContent && el.textContent.includes('个人中心')
  );
  
  if (pageTitle) {
    console.log('✅ 页面标题: 显示"个人中心"');
    totalScore += 1;
    results.push({ test: '页面标题', status: 'PASS', score: 1 });
  } else {
    console.log('❌ 页面标题: 未找到"个人中心"');
    results.push({ test: '页面标题', status: 'FAIL', score: 0 });
  }
  
  // 1.2 高度对齐检查
  maxScore += 2;
  const gridContainer = document.querySelector('.profile-grid-equal-height');
  if (gridContainer) {
    const items = Array.from(gridContainer.querySelectorAll('.profile-grid-item'));
    if (items.length >= 2) {
      const leftHeight = items[0].getBoundingClientRect().height;
      const rightHeight = items[1].getBoundingClientRect().height;
      const heightDiff = Math.abs(leftHeight - rightHeight);
      
      if (heightDiff < 10) {
        console.log(`✅ 高度对齐: 差异${heightDiff.toFixed(1)}px (优秀)`);
        totalScore += 2;
        results.push({ test: '高度对齐', status: 'PASS', score: 2 });
      } else if (heightDiff < 20) {
        console.log(`⚠️  高度对齐: 差异${heightDiff.toFixed(1)}px (可接受)`);
        totalScore += 1;
        results.push({ test: '高度对齐', status: 'PARTIAL', score: 1 });
      } else {
        console.log(`❌ 高度对齐: 差异${heightDiff.toFixed(1)}px (需要修复)`);
        results.push({ test: '高度对齐', status: 'FAIL', score: 0 });
      }
    } else {
      console.log('❌ 高度对齐: 容器数量不足');
      results.push({ test: '高度对齐', status: 'FAIL', score: 0 });
    }
  } else {
    console.log('❌ 高度对齐: 未找到网格容器');
    results.push({ test: '高度对齐', status: 'FAIL', score: 0 });
  }
  
  // 1.3 邮箱info图标检查
  maxScore += 1;
  const emailLabel = document.querySelector('label[for="email"]');
  const infoIcon = emailLabel?.querySelector('svg[class*="lucide-info"]');
  
  if (infoIcon) {
    console.log('✅ 邮箱info图标: 存在且可用');
    totalScore += 1;
    results.push({ test: '邮箱info图标', status: 'PASS', score: 1 });
  } else {
    console.log('❌ 邮箱info图标: 未找到');
    results.push({ test: '邮箱info图标', status: 'FAIL', score: 0 });
  }
  
  console.log('\n=== 🆔 2. 用户ID系统验证 ===');
  
  // 2.1 用户ID显示检查
  maxScore += 1;
  const userIdElement = Array.from(document.querySelectorAll('.font-mono')).find(el =>
    el.textContent && el.textContent.length > 5
  );
  
  let displayedUserId = null;
  if (userIdElement) {
    displayedUserId = userIdElement.textContent.trim();
    console.log('✅ 用户ID显示:', displayedUserId);
    totalScore += 1;
    results.push({ test: '用户ID显示', status: 'PASS', score: 1 });
  } else {
    console.log('❌ 用户ID显示: 未找到');
    results.push({ test: '用户ID显示', status: 'FAIL', score: 0 });
  }
  
  // 2.2 邀请链接一致性检查
  maxScore += 2;
  const inviteLinkInput = document.querySelector('input[readonly]');
  if (inviteLinkInput && displayedUserId) {
    const inviteLink = inviteLinkInput.value;
    const refMatch = inviteLink.match(/\?ref=([^&]+)/);
    
    if (refMatch) {
      const inviteLinkUserId = refMatch[1];
      if (displayedUserId === inviteLinkUserId) {
        console.log('✅ 用户ID一致性: 完全一致');
        totalScore += 2;
        results.push({ test: '用户ID一致性', status: 'PASS', score: 2 });
      } else {
        console.log('❌ 用户ID一致性: 不一致');
        console.log(`  显示ID: ${displayedUserId}`);
        console.log(`  链接ID: ${inviteLinkUserId}`);
        results.push({ test: '用户ID一致性', status: 'FAIL', score: 0 });
      }
    } else {
      console.log('❌ 用户ID一致性: 无法提取链接中的ID');
      results.push({ test: '用户ID一致性', status: 'FAIL', score: 0 });
    }
  } else {
    console.log('❌ 用户ID一致性: 缺少必要元素');
    results.push({ test: '用户ID一致性', status: 'FAIL', score: 0 });
  }
  
  console.log('\n=== 🎨 3. 按钮样式验证 ===');
  
  // 3.1 升级按钮检查
  maxScore += 1;
  const upgradeButton = document.querySelector('.btn-upgrade-force');
  if (upgradeButton) {
    const style = getComputedStyle(upgradeButton);
    const hasGradient = style.background.includes('gradient') || style.backgroundImage.includes('gradient');
    
    if (hasGradient) {
      console.log('✅ 升级按钮: 渐变样式正常');
      totalScore += 1;
      results.push({ test: '升级按钮样式', status: 'PASS', score: 1 });
    } else {
      console.log('⚠️  升级按钮: 渐变样式可能异常');
      results.push({ test: '升级按钮样式', status: 'PARTIAL', score: 0.5 });
      totalScore += 0.5;
    }
  } else {
    console.log('❌ 升级按钮: 未找到');
    results.push({ test: '升级按钮样式', status: 'FAIL', score: 0 });
  }
  
  // 3.2 邀请按钮检查
  maxScore += 1;
  const inviteButton = document.querySelector('.btn-invite-force');
  if (inviteButton) {
    const style = getComputedStyle(inviteButton);
    const hasGradient = style.background.includes('gradient') || style.backgroundImage.includes('gradient');
    
    if (hasGradient) {
      console.log('✅ 邀请按钮: 渐变样式正常');
      totalScore += 1;
      results.push({ test: '邀请按钮样式', status: 'PASS', score: 1 });
    } else {
      console.log('⚠️  邀请按钮: 渐变样式可能异常');
      results.push({ test: '邀请按钮样式', status: 'PARTIAL', score: 0.5 });
      totalScore += 0.5;
    }
  } else {
    console.log('❌ 邀请按钮: 未找到');
    results.push({ test: '邀请按钮样式', status: 'FAIL', score: 0 });
  }
  
  console.log('\n=== 🔗 4. 邀请功能验证 ===');
  
  // 4.1 邀请链接格式检查
  maxScore += 1;
  if (inviteLinkInput) {
    const inviteLink = inviteLinkInput.value;
    const isValidFormat = inviteLink.includes('?ref=') && inviteLink.startsWith('http');
    
    if (isValidFormat) {
      console.log('✅ 邀请链接格式: 正确');
      totalScore += 1;
      results.push({ test: '邀请链接格式', status: 'PASS', score: 1 });
    } else {
      console.log('❌ 邀请链接格式: 错误');
      results.push({ test: '邀请链接格式', status: 'FAIL', score: 0 });
    }
  } else {
    console.log('❌ 邀请链接格式: 未找到输入框');
    results.push({ test: '邀请链接格式', status: 'FAIL', score: 0 });
  }
  
  // 4.2 复制按钮检查
  maxScore += 1;
  const copyButtons = Array.from(document.querySelectorAll('button')).filter(btn => {
    const copyIcon = btn.querySelector('svg[class*="lucide-copy"]');
    return copyIcon !== null;
  });
  
  if (copyButtons.length > 0) {
    console.log(`✅ 复制按钮: 找到${copyButtons.length}个`);
    totalScore += 1;
    results.push({ test: '复制按钮', status: 'PASS', score: 1 });
  } else {
    console.log('❌ 复制按钮: 未找到');
    results.push({ test: '复制按钮', status: 'FAIL', score: 0 });
  }
  
  console.log('\n=== 📱 5. 响应式验证 ===');
  
  // 5.1 CSS类检查
  maxScore += 1;
  if (gridContainer) {
    const hasResponsiveClasses = gridContainer.className.includes('profile-grid-equal-height');
    
    if (hasResponsiveClasses) {
      console.log('✅ 响应式CSS: 类名正确');
      totalScore += 1;
      results.push({ test: '响应式CSS', status: 'PASS', score: 1 });
    } else {
      console.log('❌ 响应式CSS: 类名错误');
      results.push({ test: '响应式CSS', status: 'FAIL', score: 0 });
    }
  } else {
    console.log('❌ 响应式CSS: 容器未找到');
    results.push({ test: '响应式CSS', status: 'FAIL', score: 0 });
  }
  
  console.log('\n=== 📊 验证总结 ===');
  
  const percentage = (totalScore / maxScore * 100).toFixed(1);
  console.log(`🏆 总体评分: ${totalScore}/${maxScore} (${percentage}%)`);
  
  // 分类统计
  const passCount = results.filter(r => r.status === 'PASS').length;
  const partialCount = results.filter(r => r.status === 'PARTIAL').length;
  const failCount = results.filter(r => r.status === 'FAIL').length;
  
  console.log(`✅ 通过: ${passCount} 项`);
  console.log(`⚠️  部分通过: ${partialCount} 项`);
  console.log(`❌ 失败: ${failCount} 项`);
  
  // 评级
  if (percentage >= 95) {
    console.log('🎉 封装质量: 优秀 (A+)');
  } else if (percentage >= 85) {
    console.log('👍 封装质量: 良好 (A)');
  } else if (percentage >= 75) {
    console.log('👌 封装质量: 合格 (B)');
  } else {
    console.log('⚠️  封装质量: 需要改进 (C)');
  }
  
  // 详细结果
  console.log('\n=== 📋 详细结果 ===');
  results.forEach((result, index) => {
    const statusIcon = result.status === 'PASS' ? '✅' : 
                      result.status === 'PARTIAL' ? '⚠️' : '❌';
    console.log(`${index + 1}. ${statusIcon} ${result.test}: ${result.status} (${result.score}分)`);
  });
  
  // 建议
  console.log('\n=== 💡 建议 ===');
  
  if (failCount === 0) {
    console.log('🎉 所有功能验证通过，封装质量优秀！');
  } else {
    console.log('⚠️  发现以下问题需要关注：');
    results.filter(r => r.status === 'FAIL').forEach(result => {
      console.log(`  - ${result.test}: 需要修复`);
    });
  }
  
  console.log('\n🔒 封装验证完成！');
  
  return {
    totalScore,
    maxScore,
    percentage: parseFloat(percentage),
    results,
    passCount,
    partialCount,
    failCount
  };
}

// 等待页面加载后执行
setTimeout(profileCenterEncapsulationVerification, 1000);
