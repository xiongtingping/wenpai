// 验证首页背景修复的脚本
console.log('🏠 开始验证首页背景修复...');

function checkHomepageBackgrounds() {
  console.log('\n🔍 检查首页各区块背景...');
  
  // 检查主容器
  const mainContainer = document.querySelector('.min-h-screen');
  if (mainContainer) {
    const bg = getComputedStyle(mainContainer).backgroundColor;
    console.log('📦 主容器背景:', bg);
    
    if (bg.includes('240, 248, 255') || bg.includes('rgb(240')) {
      console.log('❌ 主容器仍然是刺眼的蓝色');
      return false;
    } else {
      console.log('✅ 主容器背景正常');
    }
  }
  
  // 检查各个section
  const sections = document.querySelectorAll('section');
  console.log(`📋 找到 ${sections.length} 个区块`);
  
  let allGood = true;
  sections.forEach((section, index) => {
    const bg = getComputedStyle(section).backgroundColor;
    const classes = section.className;
    const id = section.id || `section-${index + 1}`;
    
    console.log(`📄 区块 ${id}:`);
    console.log(`   类名: ${classes}`);
    console.log(`   背景色: ${bg}`);
    
    // 检查是否是刺眼的蓝色或紫色
    if (bg.includes('240, 248, 255') || bg.includes('rgb(240') || 
        bg.includes('103, 110, 234') || bg.includes('118, 75, 162')) {
      console.log('   ❌ 仍然是刺眼的蓝色/紫色背景');
      allGood = false;
    } else if (bg === 'rgba(0, 0, 0, 0)' || bg === 'transparent') {
      console.log('   ✅ 透明背景（继承父容器）');
    } else {
      console.log('   ✅ 背景颜色正常');
    }
  });
  
  return allGood;
}

function checkBackgroundTransitions() {
  console.log('\n🌊 检查背景过渡效果...');
  
  // 检查相邻区块的背景是否一致
  const sections = document.querySelectorAll('section');
  const backgrounds = [];
  
  sections.forEach((section, index) => {
    const bg = getComputedStyle(section).backgroundColor;
    backgrounds.push(bg);
  });
  
  console.log('📊 各区块背景颜色:');
  backgrounds.forEach((bg, index) => {
    console.log(`   区块${index + 1}: ${bg}`);
  });
  
  // 检查是否有明显的颜色跳跃
  let hasJumps = false;
  for (let i = 1; i < backgrounds.length; i++) {
    const prev = backgrounds[i - 1];
    const curr = backgrounds[i];
    
    if (prev !== curr && prev !== 'rgba(0, 0, 0, 0)' && curr !== 'rgba(0, 0, 0, 0)') {
      console.log(`⚠️ 区块${i}和区块${i + 1}之间有背景颜色跳跃`);
      console.log(`   从 ${prev} 到 ${curr}`);
      hasJumps = true;
    }
  }
  
  if (!hasJumps) {
    console.log('✅ 背景过渡自然，无明显跳跃');
  }
  
  return !hasJumps;
}

function checkCardBackgrounds() {
  console.log('\n🃏 检查卡片背景...');
  
  const cards = document.querySelectorAll('.bg-card, .bg-accent, [class*="Card"]');
  console.log(`📋 找到 ${cards.length} 个卡片元素`);
  
  let correctCount = 0;
  let incorrectCount = 0;
  
  cards.forEach((card, index) => {
    const bg = getComputedStyle(card).backgroundColor;
    const classes = card.className;
    
    // 检查是否是刺眼的蓝色或紫色
    if (bg.includes('240, 248, 255') || bg.includes('rgb(240') || 
        bg.includes('103, 110, 234') || bg.includes('118, 75, 162')) {
      console.log(`❌ 卡片${index + 1}仍然是刺眼的蓝色/紫色:`);
      console.log(`   类名: ${classes}`);
      console.log(`   背景色: ${bg}`);
      incorrectCount++;
    } else {
      correctCount++;
    }
  });
  
  console.log(`📊 卡片背景检查结果:`);
  console.log(`✅ 正确的背景: ${correctCount}`);
  console.log(`❌ 需要修复的背景: ${incorrectCount}`);
  
  return incorrectCount === 0;
}

function checkOverallLayout() {
  console.log('\n📐 检查整体布局...');
  
  // 检查页面高度
  const body = document.body;
  const html = document.documentElement;
  console.log('📏 页面尺寸:');
  console.log(`   body高度: ${body.scrollHeight}px`);
  console.log(`   视窗高度: ${window.innerHeight}px`);
  console.log(`   是否可滚动: ${body.scrollHeight > window.innerHeight ? '是' : '否'}`);
  
  // 检查是否有内容被截断
  const mainContainer = document.querySelector('.min-h-screen');
  if (mainContainer) {
    const containerStyle = getComputedStyle(mainContainer);
    console.log('📦 主容器样式:');
    console.log(`   高度: ${containerStyle.height}`);
    console.log(`   最小高度: ${containerStyle.minHeight}`);
    console.log(`   显示: ${containerStyle.display}`);
    
    if (containerStyle.height === '100vh' && body.scrollHeight > window.innerHeight) {
      console.log('⚠️ 可能存在内容截断问题');
      return false;
    } else {
      console.log('✅ 布局正常，无截断问题');
      return true;
    }
  }
  
  return true;
}

// 主验证函数
function verifyHomepageFix() {
  console.log('🚀 开始验证首页修复...\n');
  
  const backgroundsOk = checkHomepageBackgrounds();
  const transitionsOk = checkBackgroundTransitions();
  const cardsOk = checkCardBackgrounds();
  const layoutOk = checkOverallLayout();
  
  console.log('\n📊 最终验证结果:');
  console.log('区块背景:', backgroundsOk ? '✅' : '❌');
  console.log('背景过渡:', transitionsOk ? '✅' : '❌');
  console.log('卡片背景:', cardsOk ? '✅' : '❌');
  console.log('整体布局:', layoutOk ? '✅' : '❌');
  
  const allPassed = backgroundsOk && transitionsOk && cardsOk && layoutOk;
  
  if (allPassed) {
    console.log('\n🎉 首页背景问题已完全修复！');
    console.log('✅ 所有区块使用统一背景');
    console.log('✅ 背景过渡自然无跳跃');
    console.log('✅ 卡片背景协调一致');
    console.log('✅ 布局完整无截断');
  } else {
    console.log('\n⚠️ 仍有部分问题需要调整');
  }
  
  return allPassed;
}

// 自动运行验证
setTimeout(() => {
  verifyHomepageFix();
}, 2000);

// 导出函数供手动调用
window.verifyHomepageFix = verifyHomepageFix;
window.checkHomepageBackgrounds = checkHomepageBackgrounds;
window.checkBackgroundTransitions = checkBackgroundTransitions;

console.log('✅ 首页验证脚本已加载，2秒后自动运行');
console.log('💡 可手动调用: verifyHomepageFix()');
