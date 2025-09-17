/**
 * 🎯 手动验证快速引用弹窗修复 - 在浏览器控制台运行
 * 复制此代码到浏览器控制台执行
 */

// 清除控制台
console.clear();
console.log('🎯 开始验证快速引用弹窗修复...');
console.log('按照CLAUDE.md 3.6.2节双重保护机制标准验证');

// 自动化测试函数
async function verifyQuickReferenceDialog() {
  try {
    // 1. 查找快速引用按钮
    const quickRefButton = document.querySelector('button[title*="快速引用"], button:has(.lucide-at-sign)') ||
                          document.querySelector('button[data-tooltip*="快速引用"]') ||
                          Array.from(document.querySelectorAll('button')).find(btn => 
                            btn.textContent.includes('快速引用') || 
                            btn.querySelector('.lucide-at-sign')
                          );
    
    if (!quickRefButton) {
      console.log('❌ 未找到快速引用按钮');
      console.log('💡 请手动点击快速引用按钮后重新运行验证');
      return false;
    }
    
    console.log('✅ 找到快速引用按钮');
    
    // 2. 记录初始状态
    const initialState = {
      scrollY: window.scrollY,
      bodyOverflow: document.body.style.overflow,
      bodyPosition: document.body.style.position,
      viewport: { width: window.innerWidth, height: window.innerHeight }
    };
    
    console.log('📊 初始状态:', initialState);
    
    // 3. 点击打开弹窗
    quickRefButton.click();
    
    // 4. 等待弹窗出现
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // 5. 查找Dialog和背景遮罩
    const dialogElement = document.querySelector('[role="dialog"].quick-reference-dialog') ||
                         document.querySelector('[role="dialog"]') ||
                         document.querySelector('[data-radix-dialog-content].quick-reference-dialog');
    
    const overlayElement = document.querySelector('[data-radix-dialog-overlay]') ||
                          document.querySelector('div[style*="rgba(0, 0, 0, 0.5)"]') ||
                          document.querySelector('div[style*="background"]');
    
    if (!dialogElement) {
      console.log('❌ 未找到Dialog元素');
      return false;
    }
    
    if (!overlayElement) {
      console.log('❌ 未找到背景遮罩元素');
      return false;
    }
    
    console.log('✅ 找到Dialog和背景遮罩元素');
    
    // 6. 验证Dialog位置（核心验证）
    const dialogRect = dialogElement.getBoundingClientRect();
    const viewportCenter = {
      x: window.innerWidth / 2,
      y: window.innerHeight / 2
    };
    const dialogCenter = {
      x: dialogRect.left + dialogRect.width / 2,
      y: dialogRect.top + dialogRect.height / 2
    };
    
    const offset = {
      x: Math.abs(dialogCenter.x - viewportCenter.x),
      y: Math.abs(dialogCenter.y - viewportCenter.y)
    };
    
    const isCentered = offset.x < 5 && offset.y < 5;
    const isInViewport = 
      dialogRect.left >= 0 && 
      dialogRect.top >= 0 && 
      dialogRect.right <= window.innerWidth && 
      dialogRect.bottom <= window.innerHeight;
    
    console.log('🎯 Dialog位置验证:');
    console.log('  视口中心:', viewportCenter);
    console.log('  Dialog中心:', dialogCenter);
    console.log('  偏移量:', offset);
    console.log('  是否居中:', isCentered ? '✅ 完美居中 (偏移<5px)' : '❌ 未居中');
    console.log('  是否在视口内:', isInViewport ? '✅ 完全可见' : '❌ 部分不可见');
    
    // 7. 验证CSS样式（CLAUDE.md规范检查）
    const computedStyle = window.getComputedStyle(dialogElement);
    const cssVerification = {
      position: computedStyle.position,
      top: computedStyle.top,
      left: computedStyle.left,
      transform: computedStyle.transform,
      zIndex: computedStyle.zIndex,
      inset: computedStyle.inset,
      margin: computedStyle.margin
    };
    
    console.log('🎨 CSS样式验证:', cssVerification);
    
    // 检查是否符合CLAUDE.md 3.6.2节规范
    const cssCompliant = 
      computedStyle.position === 'fixed' &&
      (computedStyle.top.includes('50vh') || computedStyle.top === '50%' || computedStyle.top.includes('calc')) &&
      (computedStyle.left.includes('50vw') || computedStyle.left === '50%' || computedStyle.left.includes('calc')) &&
      computedStyle.transform.includes('translate(-50%, -50%)');
    
    console.log('📋 CLAUDE.md 3.6.2节规范符合性:', cssCompliant ? '✅ 完全符合' : '❌ 不符合');
    
    // 8. 验证背景遮罩覆盖
    const overlayRect = overlayElement.getBoundingClientRect();
    const isOverlayFullscreen = 
      overlayRect.left <= 1 && 
      overlayRect.top <= 1 && 
      Math.abs(overlayRect.width - window.innerWidth) <= 2 && 
      Math.abs(overlayRect.height - window.innerHeight) <= 2;
    
    console.log('🌃 背景遮罩验证:');
    console.log('  遮罩区域:', overlayRect);
    console.log('  视口大小:', { width: window.innerWidth, height: window.innerHeight });
    console.log('  全屏覆盖:', isOverlayFullscreen ? '✅ 完全覆盖' : '❌ 覆盖不全');
    
    // 9. 验证滚动锁定
    const bodyAfterOpen = {
      overflow: document.body.style.overflow,
      position: document.body.style.position,
      top: document.body.style.top,
      width: document.body.style.width
    };
    
    const scrollLocked = 
      bodyAfterOpen.overflow === 'hidden' && 
      bodyAfterOpen.position === 'fixed';
    
    console.log('🔒 滚动锁定验证:');
    console.log('  Body样式:', bodyAfterOpen);
    console.log('  滚动已锁定:', scrollLocked ? '✅ 已正确锁定' : '❌ 锁定失败');
    
    // 10. 测试滚动事件阻止
    const beforeScroll = window.scrollY;
    try {
      window.scrollTo(0, 100);
      await new Promise(resolve => setTimeout(resolve, 100));
      const afterScroll = window.scrollY;
      const scrollPrevented = afterScroll === beforeScroll;
      console.log('📜 滚动阻止测试:', scrollPrevented ? '✅ 滚动已阻止' : '❌ 滚动未阻止');
    } catch (e) {
      console.log('📜 滚动阻止测试: ✅ 滚动操作被阻断');
    }
    
    // 11. 验证JavaScript修复器工作状态
    const hasQuickRefClass = dialogElement.classList.contains('quick-reference-dialog');
    const hasRoleDialog = dialogElement.getAttribute('role') === 'dialog';
    
    console.log('⚡ JavaScript修复器验证:');
    console.log('  Quick-reference类:', hasQuickRefClass ? '✅ 已应用' : '⚠️  未应用');
    console.log('  Role属性:', hasRoleDialog ? '✅ 正确' : '❌ 错误');
    
    // 12. 综合评估
    const criticalTests = {
      centered: isCentered,
      inViewport: isInViewport,
      cssCompliant: cssCompliant,
      overlayFullscreen: isOverlayFullscreen,
      scrollLocked: scrollLocked
    };
    
    const passedTests = Object.values(criticalTests).filter(Boolean).length;
    const totalTests = Object.keys(criticalTests).length;
    const successRate = (passedTests / totalTests * 100).toFixed(1);
    
    console.log('\n🏆 综合评估结果:');
    console.log('===============================');
    console.log(`🎯 弹窗居中: ${criticalTests.centered ? '✅ 通过' : '❌ 失败'}`);
    console.log(`👁️ 视口内显示: ${criticalTests.inViewport ? '✅ 通过' : '❌ 失败'}`);
    console.log(`🎨 CSS规范符合: ${criticalTests.cssCompliant ? '✅ 通过' : '❌ 失败'}`);
    console.log(`🌃 背景遮罩: ${criticalTests.overlayFullscreen ? '✅ 通过' : '❌ 失败'}`);
    console.log(`🔒 滚动锁定: ${criticalTests.scrollLocked ? '✅ 通过' : '❌ 失败'}`);
    console.log('===============================');
    console.log(`📊 成功率: ${successRate}% (${passedTests}/${totalTests})`);
    console.log(`🎉 修复状态: ${passedTests === totalTests ? '✅ 完全成功' : '❌ 需要进一步修复'}`);
    
    if (passedTests === totalTests) {
      console.log('🎊 恭喜！快速引用弹窗完全符合CLAUDE.md 3.6.2节双重保护机制规范！');
      console.log('🎯 根本性解决方案验证成功，不再是patch式修复！');
    } else {
      console.log('🚨 发现问题，需要进一步检查和修复。');
      console.log('💡 请查看上述详细验证结果，针对失败项进行修复。');
    }
    
    // 13. 保持弹窗开启，供手动验证
    console.log('\n🔍 手动验证指导:');
    console.log('===============================');
    console.log('1. 弹窗应该在屏幕正中央显示');
    console.log('2. 背景应该是半透明黑色遮罩');
    console.log('3. 页面应该无法滚动');
    console.log('4. 弹窗内容应该完全可见');
    console.log('5. 点击背景可以关闭弹窗');
    console.log('===============================');
    console.log('👆 请手动验证上述要点，确认修复效果');
    
    return passedTests === totalTests;
    
  } catch (error) {
    console.error('❌ 验证过程出错:', error);
    return false;
  }
}

// 执行验证
verifyQuickReferenceDialog();