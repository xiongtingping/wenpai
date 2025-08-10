/**
 * 测试邀请功能提示信息的脚本
 * 在浏览器控制台中运行
 */

console.log('🧪 开始测试邀请功能提示信息...');

function testInviteToastMessages() {
  console.log('\n=== 🔍 查找邀请相关按钮 ===');
  
  // 1. 查找立即邀请好友按钮
  const inviteButton = document.querySelector('.btn-invite-force');
  if (inviteButton) {
    console.log('✅ 找到立即邀请好友按钮:', inviteButton.textContent?.trim());
  } else {
    console.log('❌ 未找到立即邀请好友按钮');
  }
  
  // 2. 查找复制链接按钮
  const copyButtons = Array.from(document.querySelectorAll('button')).filter(btn => {
    const copyIcon = btn.querySelector('svg[class*="lucide-copy"]');
    return copyIcon !== null;
  });
  
  console.log(`✅ 找到 ${copyButtons.length} 个复制按钮`);
  copyButtons.forEach((btn, index) => {
    console.log(`  复制按钮 ${index + 1}:`, btn.className);
  });
  
  // 3. 查找邀请链接输入框
  const inviteLinkInput = document.querySelector('input[readonly]');
  if (inviteLinkInput) {
    console.log('✅ 找到邀请链接输入框:', inviteLinkInput.value.substring(0, 50) + '...');
  } else {
    console.log('❌ 未找到邀请链接输入框');
  }
  
  console.log('\n=== 🎯 模拟点击测试 ===');
  
  // 创建一个监听器来捕获toast消息
  let toastMessages = [];
  
  // 监听DOM变化来捕获toast
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (node.nodeType === Node.ELEMENT_NODE) {
          // 查找toast相关的元素
          const toastElements = node.querySelectorAll ? 
            node.querySelectorAll('[data-radix-toast-viewport], [role="status"], .toast') : [];
          
          if (toastElements.length > 0 || 
              (node.textContent && node.textContent.includes('邀请链接已复制'))) {
            toastMessages.push({
              timestamp: new Date().toLocaleTimeString(),
              content: node.textContent || node.innerText || '未知内容',
              element: node
            });
            console.log('📢 检测到Toast消息:', node.textContent?.trim());
          }
        }
      });
    });
  });
  
  // 开始监听
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
  
  console.log('🎧 已开始监听Toast消息...');
  
  // 测试函数
  const testButton = (button, buttonName) => {
    if (!button) {
      console.log(`❌ ${buttonName} 不存在，跳过测试`);
      return;
    }
    
    console.log(`\n🖱️  测试点击 ${buttonName}...`);
    
    try {
      // 模拟点击
      button.click();
      console.log(`✅ ${buttonName} 点击成功`);
      
      // 等待一下看是否有toast出现
      setTimeout(() => {
        const recentMessages = toastMessages.filter(msg => 
          Date.now() - new Date(`1970-01-01 ${msg.timestamp}`).getTime() < 5000
        );
        
        if (recentMessages.length > 0) {
          console.log(`📢 ${buttonName} 触发的Toast消息:`, recentMessages[recentMessages.length - 1].content);
        } else {
          console.log(`⚠️  ${buttonName} 点击后未检测到Toast消息`);
        }
      }, 1000);
      
    } catch (error) {
      console.log(`❌ ${buttonName} 点击失败:`, error.message);
    }
  };
  
  // 测试立即邀请好友按钮
  if (inviteButton) {
    setTimeout(() => testButton(inviteButton, '立即邀请好友按钮'), 500);
  }
  
  // 测试复制按钮
  if (copyButtons.length > 0) {
    copyButtons.forEach((btn, index) => {
      setTimeout(() => testButton(btn, `复制按钮${index + 1}`), 1500 + index * 1000);
    });
  }
  
  // 5秒后停止监听并总结
  setTimeout(() => {
    observer.disconnect();
    console.log('\n=== 📊 测试总结 ===');
    
    console.log(`总共捕获到 ${toastMessages.length} 条Toast消息:`);
    toastMessages.forEach((msg, index) => {
      console.log(`  ${index + 1}. [${msg.timestamp}] ${msg.content.substring(0, 100)}...`);
    });
    
    // 检查是否包含期望的提示信息
    const expectedMessage = "邀请链接已复制，直接去粘贴邀请好友吧！";
    const hasExpectedMessage = toastMessages.some(msg => 
      msg.content.includes(expectedMessage)
    );
    
    if (hasExpectedMessage) {
      console.log('🎉 成功！检测到期望的提示信息');
    } else {
      console.log('⚠️  未检测到期望的提示信息，可能需要手动测试');
    }
    
    // 检查是否有旧的提示信息
    const hasOldMessage = toastMessages.some(msg => 
      msg.content.includes('链接已复制到剪贴板') && 
      !msg.content.includes('直接去粘贴邀请好友吧')
    );
    
    if (hasOldMessage) {
      console.log('⚠️  检测到旧的提示信息，可能需要进一步修改');
    } else {
      console.log('✅ 未检测到旧的提示信息');
    }
    
  }, 6000);
  
  console.log('\n💡 提示：');
  console.log('1. 请手动点击"立即邀请好友"按钮测试');
  console.log('2. 请手动点击复制按钮测试');
  console.log('3. 观察弹出的Toast提示信息是否为："邀请链接已复制，直接去粘贴邀请好友吧！"');
  
  return {
    inviteButton: !!inviteButton,
    copyButtonsCount: copyButtons.length,
    hasInviteLinkInput: !!inviteLinkInput,
    toastMessages
  };
}

// 等待页面加载后执行
setTimeout(testInviteToastMessages, 1000);
