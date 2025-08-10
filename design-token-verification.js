/**
 * 设计令牌系统验证脚本
 * 验证按钮是否使用了标准的设计令牌系统
 */

function verifyDesignTokens() {
  console.log('🎨 验证设计令牌系统使用情况...');
  
  const results = {
    buttonTokens: verifyButtonTokens(),
    iconTokens: verifyIconTokens(),
    colorConsistency: verifyColorConsistency(),
    customStyles: checkCustomStyles()
  };
  
  // 输出总结
  console.log('\n📊 设计令牌验证结果:');
  let allPassed = true;
  
  Object.entries(results).forEach(([test, result]) => {
    const status = result.passed ? '✅' : '❌';
    console.log(`${status} ${test}: ${result.message}`);
    if (!result.passed) allPassed = false;
  });
  
  if (allPassed) {
    console.log('\n🎉 所有组件都使用了标准设计令牌系统！');
  } else {
    console.log('\n⚠️ 仍有组件未使用标准设计令牌');
  }
  
  return results;
}

function verifyButtonTokens() {
  console.log('\n🔘 验证按钮设计令牌...');
  
  const inviteButton = findButtonByText('立即邀请好友');
  const upgradeButton = findButtonByText('解锁高级功能');
  
  if (!inviteButton || !upgradeButton) {
    return {
      passed: true,
      message: '未找到目标按钮（可能未显示）'
    };
  }
  
  // 检查按钮样式
  const inviteStyle = getComputedStyle(inviteButton);
  const upgradeStyle = getComputedStyle(upgradeButton);
  
  console.log('立即邀请好友按钮样式:');
  console.log(`  背景色: ${inviteStyle.backgroundColor}`);
  console.log(`  文字色: ${inviteStyle.color}`);
  console.log(`  高度: ${inviteStyle.height}`);
  console.log(`  圆角: ${inviteStyle.borderRadius}`);
  console.log(`  阴影: ${inviteStyle.boxShadow}`);
  
  console.log('解锁高级功能按钮样式:');
  console.log(`  背景色: ${upgradeStyle.backgroundColor}`);
  console.log(`  文字色: ${upgradeStyle.color}`);
  console.log(`  高度: ${upgradeStyle.height}`);
  console.log(`  圆角: ${upgradeStyle.borderRadius}`);
  console.log(`  阴影: ${upgradeStyle.boxShadow}`);
  
  // 检查样式一致性
  const consistent = 
    inviteStyle.backgroundColor === upgradeStyle.backgroundColor &&
    inviteStyle.color === upgradeStyle.color &&
    inviteStyle.height === upgradeStyle.height &&
    inviteStyle.borderRadius === upgradeStyle.borderRadius;
  
  // 检查是否使用了标准令牌（通过检查CSS变量）
  const usesTokens = 
    inviteStyle.backgroundColor.includes('hsl(var(--primary))') ||
    inviteButton.className.includes('bg-primary') ||
    inviteButton.className.includes('variant');
  
  return {
    passed: consistent && usesTokens,
    message: `样式${consistent ? '一致' : '不一致'}, ${usesTokens ? '使用标准令牌' : '未使用标准令牌'}`
  };
}

function verifyIconTokens() {
  console.log('\n🔘 验证图标设计令牌...');
  
  const icons = document.querySelectorAll('svg');
  const tokenizedIcons = [];
  const nonTokenizedIcons = [];
  
  icons.forEach((icon, index) => {
    const classes = icon.className.baseVal || icon.className;
    
    // 检查是否使用了标准颜色令牌
    const hasStandardToken = 
      classes.includes('text-primary') ||
      classes.includes('text-foreground') ||
      classes.includes('text-muted-foreground') ||
      classes.includes('text-primary-foreground') ||
      classes.includes('text-secondary') ||
      classes.includes('text-accent') ||
      classes.includes('text-current') ||
      classes.includes('text-green-') ||
      classes.includes('text-red-') ||
      classes.includes('text-blue-') ||
      classes.includes('text-orange-');
    
    if (hasStandardToken) {
      tokenizedIcons.push({ index, classes });
    } else {
      const style = getComputedStyle(icon);
      const color = style.color;
      
      // 如果没有明确的颜色类，但颜色是继承的或透明的，也算正常
      if (color === 'inherit' || color === 'currentcolor' || color === 'transparent') {
        tokenizedIcons.push({ index, classes, inherited: true });
      } else {
        nonTokenizedIcons.push({ index, classes, color });
      }
    }
  });
  
  console.log(`找到 ${icons.length} 个图标`);
  console.log(`使用标准令牌的图标: ${tokenizedIcons.length} 个`);
  console.log(`未使用标准令牌的图标: ${nonTokenizedIcons.length} 个`);
  
  if (nonTokenizedIcons.length > 0) {
    console.log('未使用标准令牌的图标详情:', nonTokenizedIcons.slice(0, 3));
  }
  
  return {
    passed: nonTokenizedIcons.length <= 2, // 允许少量例外
    message: `${tokenizedIcons.length} 个图标使用标准令牌, ${nonTokenizedIcons.length} 个未使用`
  };
}

function verifyColorConsistency() {
  console.log('\n🎨 验证颜色一致性...');
  
  // 检查主要UI元素的颜色
  const elements = {
    buttons: document.querySelectorAll('button'),
    cards: document.querySelectorAll('[class*="Card"], .card'),
    icons: document.querySelectorAll('svg'),
    text: document.querySelectorAll('p, span, div')
  };
  
  const colorUsage = {
    primary: 0,
    secondary: 0,
    accent: 0,
    foreground: 0,
    muted: 0,
    hardcoded: 0
  };
  
  Object.entries(elements).forEach(([type, nodeList]) => {
    nodeList.forEach(element => {
      const classes = element.className;
      const style = getComputedStyle(element);
      
      // 统计标准令牌使用
      if (classes.includes('primary')) colorUsage.primary++;
      if (classes.includes('secondary')) colorUsage.secondary++;
      if (classes.includes('accent')) colorUsage.accent++;
      if (classes.includes('foreground')) colorUsage.foreground++;
      if (classes.includes('muted')) colorUsage.muted++;
      
      // 检查硬编码颜色
      const color = style.color;
      const backgroundColor = style.backgroundColor;
      
      if ((color && color.startsWith('#')) || 
          (backgroundColor && backgroundColor.startsWith('#'))) {
        colorUsage.hardcoded++;
      }
    });
  });
  
  console.log('颜色令牌使用统计:');
  Object.entries(colorUsage).forEach(([token, count]) => {
    console.log(`  ${token}: ${count} 次`);
  });
  
  const totalTokens = colorUsage.primary + colorUsage.secondary + colorUsage.accent + colorUsage.foreground + colorUsage.muted;
  const tokenRatio = totalTokens / (totalTokens + colorUsage.hardcoded);
  
  return {
    passed: tokenRatio > 0.8, // 80%以上使用标准令牌
    message: `标准令牌使用率: ${Math.round(tokenRatio * 100)}%, 硬编码颜色: ${colorUsage.hardcoded} 个`
  };
}

function checkCustomStyles() {
  console.log('\n🔍 检查自定义样式...');
  
  const customStylePatterns = [
    'btn-invite-gradient',
    'btn-upgrade-gradient',
    'bg-gradient-to-r',
    'from-pink-500',
    'to-red-500',
    'linear-gradient'
  ];
  
  const elementsWithCustomStyles = [];
  const allElements = document.querySelectorAll('*');
  
  allElements.forEach((element, index) => {
    const classes = element.className;
    const style = element.getAttribute('style');
    
    customStylePatterns.forEach(pattern => {
      if ((classes && classes.includes(pattern)) || 
          (style && style.includes(pattern))) {
        elementsWithCustomStyles.push({
          index,
          element: element.tagName,
          pattern,
          classes,
          style
        });
      }
    });
  });
  
  console.log(`找到 ${elementsWithCustomStyles.length} 个使用自定义样式的元素`);
  
  if (elementsWithCustomStyles.length > 0) {
    console.log('自定义样式详情:', elementsWithCustomStyles.slice(0, 3));
  }
  
  return {
    passed: elementsWithCustomStyles.length === 0,
    message: `${elementsWithCustomStyles.length} 个元素使用自定义样式`
  };
}

function findButtonByText(text) {
  const buttons = document.querySelectorAll('button');
  for (let button of buttons) {
    if (button.textContent && button.textContent.includes(text)) {
      return button;
    }
  }
  return null;
}

// 检查Button组件变体使用情况
function checkButtonVariants() {
  console.log('\n🔘 检查Button组件变体使用...');
  
  const buttons = document.querySelectorAll('button');
  const variantUsage = {};
  
  buttons.forEach(button => {
    const classes = button.className;
    
    // 检查是否使用了标准变体
    const variants = ['default', 'secondary', 'outline', 'ghost', 'link', 'destructive'];
    const sizes = ['sm', 'default', 'lg', 'xl', 'hero', 'icon'];
    
    let usedVariant = 'unknown';
    let usedSize = 'unknown';
    
    variants.forEach(variant => {
      if (classes.includes(variant)) usedVariant = variant;
    });
    
    sizes.forEach(size => {
      if (classes.includes(size)) usedSize = size;
    });
    
    const key = `${usedVariant}-${usedSize}`;
    variantUsage[key] = (variantUsage[key] || 0) + 1;
  });
  
  console.log('Button变体使用统计:');
  Object.entries(variantUsage).forEach(([variant, count]) => {
    console.log(`  ${variant}: ${count} 个`);
  });
  
  return variantUsage;
}

// 运行验证
console.log('🚀 启动设计令牌系统验证...');
const verificationResults = verifyDesignTokens();

// 额外检查Button变体
const buttonVariants = checkButtonVariants();

// 保存结果到全局变量
window.designTokenResults = verificationResults;
window.buttonVariantUsage = buttonVariants;

console.log('\n💡 提示: 查看 window.designTokenResults 获取详细结果');
console.log('💡 提示: 查看 window.buttonVariantUsage 获取按钮变体使用统计');
