// 测试页面是否还有橙色元素的脚本
console.log('🔍 开始检查页面中的橙色元素...');

// 检查所有元素的计算样式
function checkForOrangeColors() {
  const allElements = document.querySelectorAll('*');
  const orangeElements = [];
  
  allElements.forEach((element, index) => {
    const computedStyle = window.getComputedStyle(element);
    
    // 检查背景色
    const backgroundColor = computedStyle.backgroundColor;
    const backgroundImage = computedStyle.backgroundImage;
    
    // 检查文字颜色
    const color = computedStyle.color;
    
    // 检查边框颜色
    const borderColor = computedStyle.borderColor;
    
    // 橙色相关的RGB值范围
    const isOrangeColor = (colorStr) => {
      if (!colorStr || colorStr === 'none' || colorStr === 'transparent') return false;
      
      // 检查是否包含橙色相关的颜色值
      const orangePatterns = [
        /rgb\(2[4-5][0-9], 1[0-9][0-9], [0-9]{1,2}\)/, // 橙色RGB范围
        /rgb\(2[0-9][0-9], 1[5-9][0-9], [0-9]{1,2}\)/, // 橙色RGB范围
        /#[fF][0-9a-fA-F][0-9a-fA-F][0-9a-fA-F][0-9a-fA-F][0-9a-fA-F]/, // 以F开头的十六进制颜色
        /orange/i,
        /#ea580c/i,
        /#d97706/i,
        /#f59e0b/i,
        /#f97316/i
      ];
      
      return orangePatterns.some(pattern => pattern.test(colorStr));
    };
    
    if (isOrangeColor(backgroundColor) || isOrangeColor(backgroundImage) || 
        isOrangeColor(color) || isOrangeColor(borderColor)) {
      orangeElements.push({
        element: element,
        tagName: element.tagName,
        className: element.className,
        id: element.id,
        backgroundColor: backgroundColor,
        backgroundImage: backgroundImage,
        color: color,
        borderColor: borderColor,
        textContent: element.textContent?.substring(0, 50) + '...'
      });
    }
  });
  
  return orangeElements;
}

// 执行检查
const orangeElements = checkForOrangeColors();

if (orangeElements.length === 0) {
  console.log('✅ 太好了！没有发现橙色元素！');
} else {
  console.log(`❌ 发现 ${orangeElements.length} 个可能的橙色元素:`);
  orangeElements.forEach((item, index) => {
    console.log(`${index + 1}. ${item.tagName}${item.className ? '.' + item.className : ''}${item.id ? '#' + item.id : ''}`);
    console.log(`   文本: ${item.textContent}`);
    console.log(`   背景: ${item.backgroundColor}`);
    console.log(`   背景图: ${item.backgroundImage}`);
    console.log(`   文字色: ${item.color}`);
    console.log(`   边框色: ${item.borderColor}`);
    console.log('---');
  });
}

// 特别检查"解锁高级功能"按钮
const upgradeButtons = Array.from(document.querySelectorAll('button')).filter(btn => 
  btn.textContent.includes('解锁高级功能') || btn.textContent.includes('解锁')
);

console.log(`\n🔍 找到 ${upgradeButtons.length} 个升级按钮:`);
upgradeButtons.forEach((btn, index) => {
  const computedStyle = window.getComputedStyle(btn);
  console.log(`${index + 1}. 按钮文本: "${btn.textContent}"`);
  console.log(`   背景: ${computedStyle.backgroundColor}`);
  console.log(`   背景图: ${computedStyle.backgroundImage}`);
  console.log(`   类名: ${btn.className}`);
  console.log('---');
});

console.log('\n✅ 橙色检查完成！');
