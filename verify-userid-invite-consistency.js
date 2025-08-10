/**
 * 验证用户ID和邀请链接一致性的脚本
 * 在浏览器控制台中运行
 */

console.log('🔍 开始验证用户ID和邀请链接的一致性...');

function verifyUserIdInviteConsistency() {
  console.log('\n=== 📋 用户ID检查 ===');
  
  // 1. 查找显示的用户ID
  const userIdElement = document.querySelector('*');
  const userIdText = Array.from(document.querySelectorAll('*')).find(el => 
    el.textContent && el.textContent.includes('用户ID')
  );
  
  let displayedUserId = null;
  if (userIdText) {
    const userIdContainer = userIdText.parentElement;
    const userIdValueElement = userIdContainer?.querySelector('.font-mono');
    displayedUserId = userIdValueElement?.textContent?.trim();
    console.log('✅ 找到显示的用户ID:', displayedUserId);
  } else {
    console.log('❌ 未找到用户ID显示元素');
  }
  
  // 2. 查找邀请链接
  console.log('\n=== 🔗 邀请链接检查 ===');
  
  const inviteLinkInput = document.querySelector('input[readonly]');
  let inviteLink = null;
  let inviteLinkUserId = null;
  
  if (inviteLinkInput) {
    inviteLink = inviteLinkInput.value;
    console.log('✅ 找到邀请链接:', inviteLink);
    
    // 提取邀请链接中的用户ID
    const refMatch = inviteLink.match(/\?ref=([^&]+)/);
    if (refMatch) {
      inviteLinkUserId = refMatch[1];
      console.log('✅ 邀请链接中的用户ID:', inviteLinkUserId);
    } else {
      console.log('❌ 无法从邀请链接中提取用户ID');
    }
  } else {
    console.log('❌ 未找到邀请链接输入框');
  }
  
  // 3. 一致性检查
  console.log('\n=== ✅ 一致性验证 ===');
  
  if (displayedUserId && inviteLinkUserId) {
    if (displayedUserId === inviteLinkUserId) {
      console.log('🎉 完美！用户ID和邀请链接完全一致');
      console.log(`  统一的用户ID: ${displayedUserId}`);
    } else {
      console.log('⚠️  警告：用户ID不一致！');
      console.log(`  显示的用户ID: ${displayedUserId}`);
      console.log(`  邀请链接中的用户ID: ${inviteLinkUserId}`);
    }
  } else {
    console.log('❌ 无法进行一致性检查，缺少必要信息');
  }
  
  // 4. 检查用户ID格式
  console.log('\n=== 🔍 用户ID格式分析 ===');
  
  if (displayedUserId) {
    console.log('用户ID格式分析:');
    console.log(`  长度: ${displayedUserId.length} 字符`);
    console.log(`  格式: ${displayedUserId}`);
    
    if (displayedUserId.startsWith('temp_')) {
      console.log('  类型: 临时ID (开发环境)');
    } else if (displayedUserId.startsWith('dev-')) {
      console.log('  类型: 开发用户ID');
    } else if (displayedUserId === 'unknown') {
      console.log('  类型: 未知用户ID (需要修复)');
    } else {
      console.log('  类型: 生产环境用户ID');
    }
  }
  
  // 5. 检查邀请链接格式
  console.log('\n=== 🔗 邀请链接格式分析 ===');
  
  if (inviteLink) {
    console.log('邀请链接格式分析:');
    console.log(`  完整链接: ${inviteLink}`);
    
    const url = new URL(inviteLink);
    console.log(`  域名: ${url.origin}`);
    console.log(`  参数: ${url.search}`);
    
    if (url.searchParams.has('ref')) {
      console.log('  ✅ 使用 ?ref= 参数格式');
    } else if (url.searchParams.has('inviter')) {
      console.log('  ✅ 使用 ?inviter= 参数格式');
    } else {
      console.log('  ❌ 未识别的参数格式');
    }
  }
  
  // 6. 测试复制功能
  console.log('\n=== 📋 复制功能测试 ===');
  
  const copyButton = document.querySelector('button[class*="btn-invite-force"]');
  if (copyButton) {
    console.log('✅ 找到邀请按钮');
    console.log('  按钮文本:', copyButton.textContent?.trim());
  } else {
    console.log('❌ 未找到邀请按钮');
  }
  
  // 查找复制链接按钮
  const copyLinkButton = Array.from(document.querySelectorAll('button')).find(btn => 
    btn.textContent && btn.textContent.includes('复制')
  );
  
  if (copyLinkButton) {
    console.log('✅ 找到复制链接按钮');
  } else {
    console.log('⚠️  未找到专门的复制链接按钮');
  }
  
  // 7. 检查页面标题
  console.log('\n=== 📄 页面标题检查 ===');
  
  const pageTitle = document.querySelector('h1, .text-xl');
  const titleText = Array.from(document.querySelectorAll('*')).find(el => 
    el.textContent && (el.textContent.includes('个人中心') || el.textContent.includes('个人资料'))
  );
  
  if (titleText) {
    const title = titleText.textContent.trim();
    console.log('页面标题:', title);
    
    if (title.includes('个人中心')) {
      console.log('✅ 标题已更新为"个人中心"');
    } else if (title.includes('个人资料')) {
      console.log('⚠️  标题仍为"个人资料"，需要更新');
    }
  } else {
    console.log('❌ 未找到页面标题');
  }
  
  // 8. 总体评估
  console.log('\n=== 🎯 总体评估 ===');
  
  let score = 0;
  let maxScore = 4;
  
  // 用户ID一致性
  if (displayedUserId === inviteLinkUserId && displayedUserId !== 'unknown') {
    console.log('✅ 用户ID一致性: 通过 (+1分)');
    score += 1;
  } else {
    console.log('❌ 用户ID一致性: 失败 (+0分)');
  }
  
  // 邀请链接格式
  if (inviteLink && inviteLink.includes('?ref=')) {
    console.log('✅ 邀请链接格式: 正确 (+1分)');
    score += 1;
  } else {
    console.log('❌ 邀请链接格式: 错误 (+0分)');
  }
  
  // 页面标题
  if (titleText && titleText.textContent.includes('个人中心')) {
    console.log('✅ 页面标题: 已更新 (+1分)');
    score += 1;
  } else {
    console.log('❌ 页面标题: 未更新 (+0分)');
  }
  
  // 功能完整性
  if (copyButton && inviteLinkInput) {
    console.log('✅ 功能完整性: 完整 (+1分)');
    score += 1;
  } else {
    console.log('❌ 功能完整性: 不完整 (+0分)');
  }
  
  console.log(`\n🏆 总体评分: ${score}/${maxScore} (${(score/maxScore*100).toFixed(0)}%)`);
  
  if (score === maxScore) {
    console.log('🎉 完美！所有检查都通过了');
  } else if (score >= maxScore * 0.75) {
    console.log('👍 很好！大部分功能正常');
  } else {
    console.log('⚠️  需要进一步修复');
  }
  
  return {
    displayedUserId,
    inviteLinkUserId,
    inviteLink,
    isConsistent: displayedUserId === inviteLinkUserId,
    score,
    maxScore
  };
}

// 等待页面加载后执行
setTimeout(verifyUserIdInviteConsistency, 1000);
