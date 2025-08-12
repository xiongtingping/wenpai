/**
 * 验证支付中心年付优惠从40%改为17%
 */

console.log('🔍 验证支付中心年付优惠修改...');

function checkPaymentPageDiscount() {
  console.log('\n=== 📋 检查支付页面年付优惠显示 ===');
  
  // 检查页面中是否还有40%的文字
  const bodyText = document.body.textContent || document.body.innerText;
  
  // 检查是否还有40%
  const has40Percent = bodyText.includes('40%') || bodyText.includes('立省40%');
  console.log(`❌ 是否还有40%: ${has40Percent ? '是' : '否'}`);
  
  // 检查是否有17%
  const has17Percent = bodyText.includes('17%') || bodyText.includes('立省17%');
  console.log(`✅ 是否有17%: ${has17Percent ? '是' : '否'}`);
  
  // 查找具体的年付按钮文字
  const yearlyButtons = document.querySelectorAll('button, span, div');
  const yearlyTexts = [];
  
  yearlyButtons.forEach(element => {
    const text = element.textContent || '';
    if (text.includes('按年订阅') || text.includes('年付') || text.includes('立省')) {
      yearlyTexts.push(text.trim());
    }
  });
  
  console.log('\n📝 找到的年付相关文字:');
  yearlyTexts.forEach((text, index) => {
    console.log(`   ${index + 1}. "${text}"`);
  });
  
  // 检查具体的优惠百分比
  const discountMatches = bodyText.match(/立省\s*(\d+)%/g);
  if (discountMatches) {
    console.log('\n💰 找到的优惠百分比:');
    discountMatches.forEach((match, index) => {
      console.log(`   ${index + 1}. ${match}`);
    });
  } else {
    console.log('\n💰 未找到"立省X%"格式的文字');
  }
  
  return {
    has40Percent,
    has17Percent,
    yearlyTexts,
    discountMatches
  };
}

function checkCurrentURL() {
  console.log('\n=== 🌐 检查当前页面 ===');
  console.log(`当前URL: ${window.location.href}`);
  console.log(`页面标题: ${document.title}`);
  
  // 检查是否在支付页面
  const isPaymentPage = window.location.pathname.includes('payment') || 
                       document.title.includes('支付') ||
                       document.body.textContent.includes('支付中心');
  
  console.log(`是否在支付页面: ${isPaymentPage ? '✅ 是' : '❌ 否'}`);
  
  return isPaymentPage;
}

function highlightDiscountText() {
  console.log('\n=== 🎯 高亮显示优惠文字 ===');
  
  // 移除之前的高亮
  document.querySelectorAll('.discount-highlight').forEach(el => {
    el.classList.remove('discount-highlight');
    el.style.background = '';
    el.style.color = '';
    el.style.padding = '';
    el.style.borderRadius = '';
  });
  
  // 查找包含优惠信息的元素
  const allElements = document.querySelectorAll('*');
  let highlightCount = 0;
  
  allElements.forEach(element => {
    const text = element.textContent || '';
    if (text.includes('立省') || text.includes('按年订阅')) {
      // 只高亮直接包含文字的元素，避免高亮父容器
      if (element.children.length === 0 || 
          (element.children.length > 0 && text.length < 100)) {
        element.classList.add('discount-highlight');
        element.style.background = 'yellow';
        element.style.color = 'black';
        element.style.padding = '2px 4px';
        element.style.borderRadius = '3px';
        element.style.fontWeight = 'bold';
        highlightCount++;
      }
    }
  });
  
  console.log(`✅ 已高亮 ${highlightCount} 个优惠相关元素`);
  
  if (highlightCount > 0) {
    console.log('💡 页面中的优惠文字已用黄色背景高亮显示');
  }
}

function runFullCheck() {
  console.log('\n🚀 开始完整检查...');
  
  // 1. 检查当前页面
  const isPaymentPage = checkCurrentURL();
  
  if (!isPaymentPage) {
    console.log('\n⚠️  当前不在支付页面，请先访问支付页面');
    console.log('💡 可以点击导航栏的"升级"按钮或直接访问 /payment');
    return;
  }
  
  // 2. 检查优惠显示
  const result = checkPaymentPageDiscount();
  
  // 3. 高亮显示
  highlightDiscountText();
  
  // 4. 总结
  console.log('\n=== 📊 检查结果总结 ===');
  
  if (!result.has40Percent && result.has17Percent) {
    console.log('✅ 修改成功！年付优惠已从40%改为17%');
  } else if (result.has40Percent && !result.has17Percent) {
    console.log('❌ 修改失败！仍然显示40%，未显示17%');
  } else if (result.has40Percent && result.has17Percent) {
    console.log('⚠️  同时显示40%和17%，可能有遗漏的地方');
  } else {
    console.log('❓ 未找到年付优惠显示，请检查页面是否正确加载');
  }
  
  return result;
}

// 等待页面加载完成后自动运行
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    setTimeout(runFullCheck, 1000);
  });
} else {
  setTimeout(runFullCheck, 1000);
}

// 暴露到全局
window.checkPaymentPageDiscount = checkPaymentPageDiscount;
window.checkCurrentURL = checkCurrentURL;
window.highlightDiscountText = highlightDiscountText;
window.runFullCheck = runFullCheck;

console.log('\n🔧 可用命令:');
console.log('- runFullCheck() - 运行完整检查');
console.log('- checkPaymentPageDiscount() - 检查优惠显示');
console.log('- highlightDiscountText() - 高亮优惠文字');
console.log('- checkCurrentURL() - 检查当前页面');

console.log('\n⚡ 1秒后自动运行检查...');
