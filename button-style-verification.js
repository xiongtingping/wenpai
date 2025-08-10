/**
 * 按钮样式一致性验证脚本
 * 验证"解锁高级功能"和"立即邀请好友"按钮是否使用统一的设计令牌
 */

console.log('🔍 开始验证按钮样式一致性...');

// 等待页面加载完成
function waitForPageLoad() {
  return new Promise((resolve) => {
    if (document.readyState === 'complete') {
      resolve();
    } else {
      window.addEventListener('load', resolve);
    }
  });
}

// 查找按钮的函数
function findButtonByText(text) {
  const buttons = Array.from(document.querySelectorAll('button'));
  return buttons.find(button => 
    button.textContent && button.textContent.trim().includes(text)
  );
}

// 验证按钮样式
function verifyButtonStyles() {
  console.log('\n📋 查找目标按钮...');
  
  const upgradeButton = findButtonByText('解锁高级功能');
  const inviteButton = findButtonByText('立即邀请好友');
  
  if (!upgradeButton) {
    console.log('❌ 未找到"解锁高级功能"按钮');
    return false;
  }
  
  if (!inviteButton) {
    console.log('❌ 未找到"立即邀请好友"按钮');
    return false;
  }
  
  console.log('✅ 找到两个目标按钮');
  
  // 获取计算样式
  const upgradeStyle = getComputedStyle(upgradeButton);
  const inviteStyle = getComputedStyle(inviteButton);
  
  console.log('\n🎨 验证样式一致性...');
  
  // 验证关键样式属性
  const checks = [
    {
      name: '高度',
      upgrade: upgradeStyle.height,
      invite: inviteStyle.height,
      expected: '56px' // h-14 = 3.5rem = 56px
    },
    {
      name: '圆角',
      upgrade: upgradeStyle.borderRadius,
      invite: inviteStyle.borderRadius,
      expected: '12px' // rounded-xl
    },
    {
      name: '字体粗细',
      upgrade: upgradeStyle.fontWeight,
      invite: inviteStyle.fontWeight,
      expected: '700' // font-bold
    },
    {
      name: '字体大小',
      upgrade: upgradeStyle.fontSize,
      invite: inviteStyle.fontSize,
      expected: '18px' // text-lg
    }
  ];
  
  let allPassed = true;
  
  checks.forEach(check => {
    const upgradeMatch = check.upgrade === check.expected;
    const inviteMatch = check.invite === check.expected;
    const consistent = check.upgrade === check.invite;
    
    console.log(`\n${check.name}:`);
    console.log(`  解锁高级功能: ${check.upgrade} ${upgradeMatch ? '✅' : '❌'}`);
    console.log(`  立即邀请好友: ${check.invite} ${inviteMatch ? '✅' : '❌'}`);
    console.log(`  一致性: ${consistent ? '✅' : '❌'}`);
    
    if (!upgradeMatch || !inviteMatch || !consistent) {
      allPassed = false;
    }
  });
  
  // 验证背景色是否使用主题色
  console.log('\n🎨 验证主题色使用...');
  
  const upgradeBackground = upgradeStyle.backgroundColor;
  const inviteBackground = inviteStyle.backgroundColor;
  
  console.log(`解锁高级功能背景色: ${upgradeBackground}`);
  console.log(`立即邀请好友背景色: ${inviteBackground}`);
  
  const backgroundConsistent = upgradeBackground === inviteBackground;
  console.log(`背景色一致性: ${backgroundConsistent ? '✅' : '❌'}`);
  
  if (!backgroundConsistent) {
    allPassed = false;
  }
  
  // 验证阴影效果
  console.log('\n✨ 验证阴影效果...');
  
  const upgradeBoxShadow = upgradeStyle.boxShadow;
  const inviteBoxShadow = inviteStyle.boxShadow;
  
  console.log(`解锁高级功能阴影: ${upgradeBoxShadow}`);
  console.log(`立即邀请好友阴影: ${inviteBoxShadow}`);
  
  const shadowConsistent = upgradeBoxShadow === inviteBoxShadow;
  console.log(`阴影一致性: ${shadowConsistent ? '✅' : '❌'}`);
  
  if (!shadowConsistent) {
    allPassed = false;
  }
  
  // 验证图标样式
  console.log('\n🔍 验证图标样式...');
  
  const upgradeIcon = upgradeButton.querySelector('svg');
  const inviteIcon = inviteButton.querySelector('svg');
  
  if (upgradeIcon && inviteIcon) {
    const upgradeIconStyle = getComputedStyle(upgradeIcon);
    const inviteIconStyle = getComputedStyle(inviteIcon);
    
    const upgradeIconColor = upgradeIconStyle.color;
    const inviteIconColor = inviteIconStyle.color;
    
    console.log(`解锁高级功能图标颜色: ${upgradeIconColor}`);
    console.log(`立即邀请好友图标颜色: ${inviteIconColor}`);
    
    const iconColorConsistent = upgradeIconColor === inviteIconColor;
    console.log(`图标颜色一致性: ${iconColorConsistent ? '✅' : '❌'}`);
    
    if (!iconColorConsistent) {
      allPassed = false;
    }
  }
  
  console.log('\n📊 验证结果总结:');
  console.log(`整体一致性: ${allPassed ? '✅ 通过' : '❌ 未通过'}`);
  
  if (allPassed) {
    console.log('🎉 恭喜！两个按钮已成功使用统一的设计令牌系统');
  } else {
    console.log('⚠️  发现样式不一致，需要进一步调整');
  }
  
  return allPassed;
}

// 主执行函数
async function main() {
  await waitForPageLoad();
  
  // 等待一段时间确保所有样式都已加载
  setTimeout(() => {
    verifyButtonStyles();
  }, 2000);
}

// 执行验证
main();
