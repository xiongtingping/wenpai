/**
 * 验证按钮CSS作用域修复效果
 * 检查首页和订阅中心页面的按钮样式是否正确
 */

console.log('🔍 验证按钮CSS作用域修复效果...');

function verifyButtonScoping() {
  console.log('\n=== 📋 按钮样式检查 ===');
  
  // 检查当前页面类型
  const isHomePage = document.querySelector('.homepage-container') !== null;
  const isPaymentPage = document.querySelector('.payment-page') !== null;
  
  console.log('📄 当前页面类型:');
  console.log(`  - 首页: ${isHomePage ? '✅' : '❌'}`);
  console.log(`  - 订阅中心: ${isPaymentPage ? '✅' : '❌'}`);
  
  // 检查所有按钮的transform样式
  const allButtons = document.querySelectorAll('button');
  console.log(`\n🔘 页面按钮总数: ${allButtons.length}`);
  
  let transformedButtons = 0;
  let centeredButtons = 0;
  let normalButtons = 0;
  
  allButtons.forEach((button, index) => {
    const computedStyle = window.getComputedStyle(button);
    const transform = computedStyle.transform;
    const marginLeft = computedStyle.marginLeft;
    const marginRight = computedStyle.marginRight;
    
    // 检查是否有transform
    if (transform && transform !== 'none') {
      transformedButtons++;
      console.log(`🔄 按钮 ${index + 1}: transform = ${transform}`);
    }
    
    // 检查是否居中
    if (marginLeft === 'auto' && marginRight === 'auto') {
      centeredButtons++;
    } else {
      normalButtons++;
    }
  });
  
  console.log('\n📊 按钮样式统计:');
  console.log(`  - 有transform的按钮: ${transformedButtons}`);
  console.log(`  - 居中的按钮: ${centeredButtons}`);
  console.log(`  - 正常的按钮: ${normalButtons}`);
  
  // 如果是首页，检查特定按钮
  if (isHomePage) {
    console.log('\n🏠 首页按钮检查:');
    
    // 检查定价区域按钮
    const pricingButtons = document.querySelectorAll('#pricing button, .pricing-section button');
    console.log(`  - 定价区域按钮数量: ${pricingButtons.length}`);
    
    pricingButtons.forEach((button, index) => {
      const computedStyle = window.getComputedStyle(button);
      const transform = computedStyle.transform;
      const marginLeft = computedStyle.marginLeft;
      const marginRight = computedStyle.marginRight;
      
      console.log(`    按钮 ${index + 1}: transform=${transform}, margin=${marginLeft} ${marginRight}`);
    });
    
    // 检查CTA按钮
    const ctaButtons = document.querySelectorAll('.cta-section button');
    console.log(`  - CTA按钮数量: ${ctaButtons.length}`);
    
    ctaButtons.forEach((button, index) => {
      const computedStyle = window.getComputedStyle(button);
      const transform = computedStyle.transform;
      const marginLeft = computedStyle.marginLeft;
      const marginRight = computedStyle.marginRight;
      
      console.log(`    CTA按钮 ${index + 1}: transform=${transform}, margin=${marginLeft} ${marginRight}`);
    });
  }
  
  // 如果是订阅中心页面，检查特定按钮
  if (isPaymentPage) {
    console.log('\n💳 订阅中心按钮检查:');
    
    // 检查计划选择按钮
    const planButtons = document.querySelectorAll('.payment-page button');
    console.log(`  - 计划按钮数量: ${planButtons.length}`);
    
    planButtons.forEach((button, index) => {
      const computedStyle = window.getComputedStyle(button);
      const transform = computedStyle.transform;
      const marginLeft = computedStyle.marginLeft;
      const marginRight = computedStyle.marginRight;
      
      // 检查按钮文本
      const buttonText = button.textContent?.trim() || '';
      if (buttonText.includes('当前版本') || buttonText.includes('选择此版本') || buttonText.includes('立即升级')) {
        console.log(`    重要按钮 "${buttonText}": transform=${transform}, margin=${marginLeft} ${marginRight}`);
      }
    });
  }
  
  // 检查CSS规则是否正确应用
  console.log('\n🎯 CSS规则验证:');
  
  // 检查首页容器
  const homepageContainer = document.querySelector('.homepage-container');
  if (homepageContainer) {
    console.log('✅ 首页容器类名已应用');
  } else {
    console.log('❌ 首页容器类名缺失');
  }
  
  // 检查订阅中心容器
  const paymentContainer = document.querySelector('.payment-page');
  if (paymentContainer) {
    console.log('✅ 订阅中心容器类名已应用');
  } else {
    console.log('❌ 订阅中心容器类名缺失');
  }
  
  return {
    isHomePage,
    isPaymentPage,
    totalButtons: allButtons.length,
    transformedButtons,
    centeredButtons,
    normalButtons
  };
}

// 执行验证
const result = verifyButtonScoping();

console.log('\n🎉 验证完成!');
console.log('📋 结果摘要:', result);

// 提供修复建议
if (result.isHomePage && result.centeredButtons === 0) {
  console.log('\n⚠️ 首页按钮可能未正确居中，请检查CSS规则');
}

if (result.isPaymentPage && result.transformedButtons > 0) {
  console.log('\n⚠️ 订阅中心页面仍有按钮被transform影响，请检查保护规则');
}
