// 验证页面背景修复效果的测试脚本
console.log('🔍 开始验证页面背景修复效果...\n');

// 检查页面整体背景
function checkPageBackground() {
  console.log('📄 检查页面整体背景...');
  
  const pageContainer = document.querySelector('.min-h-screen');
  if (!pageContainer) {
    console.log('❌ 未找到页面主容器');
    return false;
  }

  const classes = pageContainer.className;
  const styles = getComputedStyle(pageContainer);
  
  console.log(`📋 页面容器类名: ${classes}`);
  console.log(`📋 页面容器背景: ${styles.backgroundColor}`);
  
  // 检查是否使用了粒子背景
  if (classes.includes('particle-background')) {
    console.log('✅ 页面使用了粒子背景效果');
    return true;
  } else {
    console.log('❌ 页面未使用粒子背景效果');
    return false;
  }
}

// 检查各个区块背景
function checkSectionBackgrounds() {
  console.log('\n📄 检查各个区块背景...');
  
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
    
    // 检查是否还有 bg-background 类
    if (classes.includes('bg-background')) {
      console.log('   ❌ 仍然使用了 bg-background 类');
      allGood = false;
    } else if (bg === 'rgba(0, 0, 0, 0)' || bg === 'transparent') {
      console.log('   ✅ 透明背景（继承父容器）');
    } else {
      console.log('   ✅ 背景颜色正常');
    }
  });
  
  return allGood;
}

// 检查背景连续性
function checkBackgroundContinuity() {
  console.log('\n🔄 检查背景连续性...');
  
  const sections = document.querySelectorAll('section');
  let hasJumps = false;
  
  for (let i = 0; i < sections.length - 1; i++) {
    const currentBg = getComputedStyle(sections[i]).backgroundColor;
    const nextBg = getComputedStyle(sections[i + 1]).backgroundColor;
    
    // 如果两个相邻区块的背景色差异很大，可能有跳跃
    if (currentBg !== nextBg && 
        currentBg !== 'rgba(0, 0, 0, 0)' && 
        nextBg !== 'rgba(0, 0, 0, 0)') {
      console.log(`⚠️ 区块${i + 1}到区块${i + 2}背景可能有跳跃:`);
      console.log(`   区块${i + 1}: ${currentBg}`);
      console.log(`   区块${i + 2}: ${nextBg}`);
      hasJumps = true;
    }
  }
  
  if (!hasJumps) {
    console.log('✅ 背景过渡自然，无明显跳跃');
  }
  
  return !hasJumps;
}

// 检查粒子效果是否正常工作
function checkParticleEffect() {
  console.log('\n✨ 检查粒子效果...');
  
  const canvas = document.querySelector('canvas');
  if (canvas) {
    console.log('✅ 找到粒子效果画布');
    
    const rect = canvas.getBoundingClientRect();
    console.log(`📐 画布尺寸: ${rect.width}x${rect.height}`);
    
    if (rect.width > 0 && rect.height > 0) {
      console.log('✅ 粒子效果画布尺寸正常');
      return true;
    } else {
      console.log('❌ 粒子效果画布尺寸异常');
      return false;
    }
  } else {
    console.log('❌ 未找到粒子效果画布');
    return false;
  }
}

// 运行所有检查
function runAllChecks() {
  console.log('🚀 开始全面检查...\n');
  
  const results = {
    pageBackground: checkPageBackground(),
    sectionBackgrounds: checkSectionBackgrounds(),
    backgroundContinuity: checkBackgroundContinuity(),
    particleEffect: checkParticleEffect()
  };
  
  console.log('\n📊 检查结果汇总:');
  console.log(`📄 页面背景: ${results.pageBackground ? '✅' : '❌'}`);
  console.log(`📄 区块背景: ${results.sectionBackgrounds ? '✅' : '❌'}`);
  console.log(`🔄 背景连续性: ${results.backgroundContinuity ? '✅' : '❌'}`);
  console.log(`✨ 粒子效果: ${results.particleEffect ? '✅' : '❌'}`);
  
  const allPassed = Object.values(results).every(result => result);
  
  if (allPassed) {
    console.log('\n🎉 所有检查通过！背景修复成功！');
  } else {
    console.log('\n⚠️ 部分检查未通过，可能需要进一步调整');
  }
  
  return allPassed;
}

// 等待页面加载完成后运行检查
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', runAllChecks);
} else {
  runAllChecks();
}
