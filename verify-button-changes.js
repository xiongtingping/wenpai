/**
 * 验证按钮样式修改是否成功应用
 * 在浏览器控制台中运行此脚本
 */

console.log('🔍 开始验证按钮样式修改...');

// 等待页面完全加载
function waitForElements() {
  return new Promise((resolve) => {
    const checkElements = () => {
      const upgradeButton = document.querySelector('button:has(svg):has-text("解锁高级功能")') || 
                           Array.from(document.querySelectorAll('button')).find(btn => 
                             btn.textContent && btn.textContent.includes('解锁高级功能'));
      
      const inviteButton = document.querySelector('button:has(svg):has-text("立即邀请好友")') || 
                          Array.from(document.querySelectorAll('button')).find(btn => 
                            btn.textContent && btn.textContent.includes('立即邀请好友'));
      
      if (upgradeButton && inviteButton) {
        resolve({ upgradeButton, inviteButton });
      } else {
        console.log('⏳ 等待按钮加载...');
        setTimeout(checkElements, 1000);
      }
    };
    checkElements();
  });
}

// 验证按钮样式
async function verifyButtonStyles() {
  try {
    const { upgradeButton, inviteButton } = await waitForElements();
    
    console.log('✅ 找到目标按钮');
    console.log('解锁高级功能按钮:', upgradeButton);
    console.log('立即邀请好友按钮:', inviteButton);
    
    // 获取计算样式
    const upgradeStyle = getComputedStyle(upgradeButton);
    const inviteStyle = getComputedStyle(inviteButton);
    
    console.log('\n📊 样式对比分析:');
    
    // 检查关键样式属性
    const styleChecks = [
      {
        name: '高度 (height)',
        upgrade: upgradeStyle.height,
        invite: inviteStyle.height,
        expected: '56px'
      },
      {
        name: '背景色 (backgroundColor)',
        upgrade: upgradeStyle.backgroundColor,
        invite: inviteStyle.backgroundColor,
        shouldMatch: true
      },
      {
        name: '文字颜色 (color)',
        upgrade: upgradeStyle.color,
        invite: inviteStyle.color,
        shouldMatch: true
      },
      {
        name: '圆角 (borderRadius)',
        upgrade: upgradeStyle.borderRadius,
        invite: inviteStyle.borderRadius,
        expected: '12px'
      },
      {
        name: '字体粗细 (fontWeight)',
        upgrade: upgradeStyle.fontWeight,
        invite: inviteStyle.fontWeight,
        expected: '700'
      },
      {
        name: '字体大小 (fontSize)',
        upgrade: upgradeStyle.fontSize,
        invite: inviteStyle.fontSize,
        expected: '18px'
      },
      {
        name: '阴影 (boxShadow)',
        upgrade: upgradeStyle.boxShadow,
        invite: inviteStyle.boxShadow,
        shouldMatch: true
      }
    ];
    
    let allPassed = true;
    
    styleChecks.forEach(check => {
      console.log(`\n${check.name}:`);
      console.log(`  解锁高级功能: ${check.upgrade}`);
      console.log(`  立即邀请好友: ${check.invite}`);
      
      if (check.expected) {
        const upgradeMatch = check.upgrade === check.expected;
        const inviteMatch = check.invite === check.expected;
        console.log(`  期望值: ${check.expected}`);
        console.log(`  解锁高级功能匹配: ${upgradeMatch ? '✅' : '❌'}`);
        console.log(`  立即邀请好友匹配: ${inviteMatch ? '✅' : '❌'}`);
        
        if (!upgradeMatch || !inviteMatch) {
          allPassed = false;
        }
      }
      
      if (check.shouldMatch) {
        const isMatching = check.upgrade === check.invite;
        console.log(`  一致性: ${isMatching ? '✅' : '❌'}`);
        
        if (!isMatching) {
          allPassed = false;
        }
      }
    });
    
    // 检查类名
    console.log('\n🏷️  CSS类名检查:');
    console.log('解锁高级功能按钮类名:', upgradeButton.className);
    console.log('立即邀请好友按钮类名:', inviteButton.className);
    
    // 检查是否包含统一设计令牌类名
    const expectedClasses = [
      'bg-primary',
      'text-primary-foreground',
      'h-14',
      'rounded-xl',
      'shadow-e1',
      'font-bold',
      'text-lg'
    ];
    
    console.log('\n🎯 设计令牌类名验证:');
    expectedClasses.forEach(className => {
      const upgradeHas = upgradeButton.className.includes(className);
      const inviteHas = inviteButton.className.includes(className);
      
      console.log(`${className}:`);
      console.log(`  解锁高级功能: ${upgradeHas ? '✅' : '❌'}`);
      console.log(`  立即邀请好友: ${inviteHas ? '✅' : '❌'}`);
      
      if (!upgradeHas || !inviteHas) {
        allPassed = false;
      }
    });
    
    // 检查图标样式
    console.log('\n🎨 图标样式检查:');
    const upgradeIcon = upgradeButton.querySelector('svg');
    const inviteIcon = inviteButton.querySelector('svg');
    
    if (upgradeIcon && inviteIcon) {
      const upgradeIconStyle = getComputedStyle(upgradeIcon);
      const inviteIconStyle = getComputedStyle(inviteIcon);
      
      console.log('解锁高级功能图标颜色:', upgradeIconStyle.color);
      console.log('立即邀请好友图标颜色:', inviteIconStyle.color);
      
      const iconColorMatch = upgradeIconStyle.color === inviteIconStyle.color;
      console.log(`图标颜色一致性: ${iconColorMatch ? '✅' : '❌'}`);
      
      if (!iconColorMatch) {
        allPassed = false;
      }
    }
    
    // 最终结果
    console.log('\n🎉 验证结果总结:');
    if (allPassed) {
      console.log('✅ 恭喜！按钮样式已成功统一，使用了统一的设计令牌系统');
      console.log('🎨 主要改进:');
      console.log('  • 移除了自定义渐变背景');
      console.log('  • 使用 bg-primary 和 text-primary-foreground');
      console.log('  • 统一了高度、圆角、阴影等样式');
      console.log('  • 图标颜色使用 text-primary-foreground');
    } else {
      console.log('⚠️  发现一些样式不一致的地方，请检查上述详细信息');
    }
    
    return allPassed;
    
  } catch (error) {
    console.error('❌ 验证过程中出现错误:', error);
    return false;
  }
}

// 自动执行验证
verifyButtonStyles();
