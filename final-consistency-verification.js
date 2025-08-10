/**
 * 最终样式一致性验证脚本
 * 在浏览器控制台中运行此脚本来验证深色模式下的样式修复效果
 */

function runFinalConsistencyCheck() {
  console.log('🔍 开始最终样式一致性验证...');
  
  const results = {
    cardConsistency: checkCardConsistency(),
    iconConsistency: checkIconConsistency(),
    badgeConsistency: checkBadgeConsistency(),
    buttonConsistency: checkButtonConsistency(),
    colorTokenUsage: checkColorTokenUsage()
  };
  
  // 输出总结
  console.log('\n📊 验证结果总结:');
  let allPassed = true;
  
  Object.entries(results).forEach(([test, result]) => {
    const status = result.passed ? '✅' : '❌';
    console.log(`${status} ${test}: ${result.message}`);
    if (!result.passed) allPassed = false;
  });
  
  if (allPassed) {
    console.log('\n🎉 所有样式一致性检查通过！深色模式修复成功！');
  } else {
    console.log('\n⚠️ 仍有部分问题需要修复');
  }
  
  return results;
}

function checkCardConsistency() {
  console.log('\n🃏 检查卡片样式一致性...');
  
  // 查找使用统计和邀请奖励卡片
  const usageCard = findElementByText('使用统计');
  const inviteCard = findElementByText('邀请奖励');
  
  if (!usageCard || !inviteCard) {
    return {
      passed: false,
      message: '未找到使用统计或邀请奖励卡片'
    };
  }
  
  const usageCardElement = usageCard.closest('.card, .rounded-xl');
  const inviteCardElement = inviteCard.closest('.card, .rounded-xl');
  
  if (!usageCardElement || !inviteCardElement) {
    return {
      passed: false,
      message: '无法找到卡片容器元素'
    };
  }
  
  const usageStyle = getComputedStyle(usageCardElement);
  const inviteStyle = getComputedStyle(inviteCardElement);
  
  const borderMatch = usageStyle.borderColor === inviteStyle.borderColor;
  const bgMatch = usageStyle.backgroundColor === inviteStyle.backgroundColor;
  
  console.log(`使用统计卡片 - 边框: ${usageStyle.borderColor}, 背景: ${usageStyle.backgroundColor}`);
  console.log(`邀请奖励卡片 - 边框: ${inviteStyle.borderColor}, 背景: ${inviteStyle.backgroundColor}`);
  
  return {
    passed: borderMatch && bgMatch,
    message: `边框颜色${borderMatch ? '一致' : '不一致'}, 背景颜色${bgMatch ? '一致' : '不一致'}`
  };
}

function checkIconConsistency() {
  console.log('\n🔘 检查图标容器样式一致性...');
  
  const iconContainers = document.querySelectorAll('.w-10.h-10, .w-12.h-12, [class*="w-10 h-10"], [class*="w-12 h-12"]');
  const backgrounds = new Set();
  
  iconContainers.forEach(container => {
    const bg = getComputedStyle(container).backgroundColor;
    if (bg && bg !== 'rgba(0, 0, 0, 0)' && bg !== 'transparent') {
      backgrounds.add(bg);
    }
  });
  
  console.log(`找到 ${iconContainers.length} 个图标容器`);
  console.log(`背景颜色种类: ${backgrounds.size}`);
  console.log('背景颜色:', Array.from(backgrounds));
  
  return {
    passed: backgrounds.size <= 3, // 允许最多3种背景颜色
    message: `图标容器使用了 ${backgrounds.size} 种背景颜色`
  };
}

function checkBadgeConsistency() {
  console.log('\n🏷️ 检查Badge样式一致性...');
  
  const badges = document.querySelectorAll('.badge, [class*="Badge"], [class*="badge"]');
  const styles = new Set();
  
  badges.forEach(badge => {
    const style = getComputedStyle(badge);
    const styleKey = `${style.backgroundColor}-${style.color}-${style.borderColor}`;
    styles.add(styleKey);
  });
  
  console.log(`找到 ${badges.length} 个Badge`);
  console.log(`样式组合种类: ${styles.size}`);
  
  return {
    passed: styles.size <= 5, // 允许最多5种Badge样式组合
    message: `Badge使用了 ${styles.size} 种样式组合`
  };
}

function checkButtonConsistency() {
  console.log('\n🔘 检查按钮样式一致性...');
  
  const buttons = document.querySelectorAll('button, .btn');
  const variants = new Set();
  
  buttons.forEach(button => {
    const classes = button.className;
    // 提取变体相关的类名
    const variantClasses = classes.split(' ').filter(cls => 
      cls.includes('variant-') || 
      cls.includes('gradient') || 
      cls.includes('bg-') ||
      cls.includes('btn-')
    );
    if (variantClasses.length > 0) {
      variants.add(variantClasses.join(' '));
    }
  });
  
  console.log(`找到 ${buttons.length} 个按钮`);
  console.log(`按钮变体种类: ${variants.size}`);
  
  return {
    passed: variants.size <= 10, // 允许最多10种按钮变体
    message: `按钮使用了 ${variants.size} 种变体`
  };
}

function checkColorTokenUsage() {
  console.log('\n🎨 检查颜色令牌使用情况...');
  
  const hardcodedColors = [];
  const allElements = document.querySelectorAll('*');
  
  allElements.forEach(element => {
    const style = getComputedStyle(element);
    const color = style.color;
    const backgroundColor = style.backgroundColor;
    const borderColor = style.borderColor;
    
    // 检查是否有硬编码的颜色值
    [color, backgroundColor, borderColor].forEach(colorValue => {
      if (colorValue && (
        colorValue.includes('rgb(37, 99, 235)') || // 蓝色
        colorValue.includes('rgb(59, 130, 246)') ||
        colorValue.includes('rgb(29, 78, 216)') ||
        colorValue === 'blue' ||
        colorValue === 'white' ||
        colorValue === 'black'
      )) {
        hardcodedColors.push({
          element: element.tagName,
          classes: element.className,
          colorType: colorValue === color ? 'text' : colorValue === backgroundColor ? 'background' : 'border',
          value: colorValue
        });
      }
    });
  });
  
  console.log(`发现 ${hardcodedColors.length} 个硬编码颜色`);
  if (hardcodedColors.length > 0) {
    console.log('硬编码颜色详情:', hardcodedColors.slice(0, 5)); // 只显示前5个
  }
  
  return {
    passed: hardcodedColors.length === 0,
    message: `发现 ${hardcodedColors.length} 个硬编码颜色`
  };
}

function findElementByText(text) {
  const elements = document.querySelectorAll('*');
  for (let element of elements) {
    if (element.textContent && element.textContent.includes(text) && 
        element.children.length === 0) { // 只查找叶子节点
      return element;
    }
  }
  return null;
}

// 检查特定的个人资料页面组件
function checkProfilePageSpecifics() {
  console.log('\n👤 检查个人资料页面特定组件...');
  
  // 检查Token使用量和使用次数卡片
  const tokenCard = findElementByText('Token使用量');
  const usageCard = findElementByText('使用次数');
  
  if (tokenCard && usageCard) {
    const tokenContainer = tokenCard.closest('[class*="bg-accent"]');
    const usageContainer = usageCard.closest('[class*="bg-accent"]');
    
    if (tokenContainer && usageContainer) {
      const tokenStyle = getComputedStyle(tokenContainer);
      const usageStyle = getComputedStyle(usageContainer);
      
      console.log('Token使用量卡片背景:', tokenStyle.backgroundColor);
      console.log('使用次数卡片背景:', usageStyle.backgroundColor);
      
      const match = tokenStyle.backgroundColor === usageStyle.backgroundColor;
      console.log(match ? '✅ 子卡片背景颜色一致' : '❌ 子卡片背景颜色不一致');
    }
  }
  
  // 检查邀请奖励相关组件
  const inviteElements = document.querySelectorAll('[class*="邀请"], *:contains("邀请")');
  console.log(`找到 ${inviteElements.length} 个邀请相关元素`);
}

// 运行完整检查
console.log('🚀 启动最终样式一致性验证...');
const finalResults = runFinalConsistencyCheck();
checkProfilePageSpecifics();

// 将结果保存到全局变量供进一步分析
window.finalConsistencyResults = finalResults;
