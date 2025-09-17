/**
 * 🎯 快速引用弹窗修复验证脚本
 * 
 * 验证内容：
 * 1. 弹窗正确居中显示（偏移量<5px）
 * 2. 背景遮罩正确覆盖整个视口
 * 3. JavaScript运行时修复器正常工作
 * 4. CSS双重保护机制生效
 * 5. 滚动锁定功能正常
 */

console.log('🎯 开始验证快速引用弹窗修复...');

// 等待页面加载完成
setTimeout(() => {
  // 1. 查找快速引用按钮
  const quickRefButton = document.querySelector('button[title*="快速引用"], button:has(.lucide-at-sign)');
  
  if (!quickRefButton) {
    console.log('❌ 未找到快速引用按钮');
    return;
  }
  
  console.log('✅ 找到快速引用按钮:', quickRefButton);
  
  // 2. 记录初始状态
  const initialScrollY = window.scrollY;
  const initialBodyOverflow = document.body.style.overflow;
  
  console.log('📊 初始状态:', {
    scrollY: initialScrollY,
    bodyOverflow: initialBodyOverflow,
    viewportSize: { width: window.innerWidth, height: window.innerHeight }
  });
  
  // 3. 点击打开弹窗
  quickRefButton.click();
  
  // 4. 等待弹窗出现后进行详细验证
  setTimeout(() => {
    console.log('🔍 开始验证弹窗状态...');
    
    // 查找Dialog元素
    const dialogElement = document.querySelector('[role="dialog"].quick-reference-dialog') ||
                         document.querySelector('[role="dialog"]') ||
                         document.querySelector('[data-radix-dialog-content].quick-reference-dialog');
    
    const overlayElement = document.querySelector('[data-radix-dialog-overlay]') ||
                          document.querySelector('div[style*="rgba(0, 0, 0, 0.5)"]');
    
    if (!dialogElement || !overlayElement) {
      console.log('❌ 弹窗或背景遮罩未找到', {
        dialog: !!dialogElement,
        overlay: !!overlayElement
      });
      return;
    }
    
    console.log('✅ 找到弹窗和背景遮罩元素');
    
    // 5. 验证Dialog位置
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
    
    console.log('🎯 Dialog位置验证:', {
      viewport: viewportCenter,
      dialog: dialogCenter,
      offset: offset,
      isCentered: isCentered,
      dialogRect: {
        left: dialogRect.left,
        top: dialogRect.top,
        width: dialogRect.width,
        height: dialogRect.height
      }
    });
    
    // 6. 验证CSS样式是否正确应用
    const computedStyle = window.getComputedStyle(dialogElement);
    const cssVerification = {
      position: computedStyle.position,
      top: computedStyle.top,
      left: computedStyle.left,
      transform: computedStyle.transform,
      zIndex: computedStyle.zIndex,
      inset: computedStyle.inset
    };
    
    console.log('🎨 CSS样式验证:', cssVerification);
    
    // 验证CSS是否符合CLAUDE.md规范
    const cssCompliant = 
      computedStyle.position === 'fixed' &&
      (computedStyle.top.includes('50vh') || computedStyle.top === '50%') &&
      (computedStyle.left.includes('50vw') || computedStyle.left === '50%') &&
      computedStyle.transform.includes('translate(-50%, -50%)');
    
    console.log('📋 CSS规范符合性:', cssCompliant ? '✅ 符合' : '❌ 不符合');
    
    // 7. 验证背景遮罩
    const overlayRect = overlayElement.getBoundingClientRect();
    const isOverlayFullscreen = 
      overlayRect.left === 0 && 
      overlayRect.top === 0 && 
      overlayRect.width === window.innerWidth && 
      overlayRect.height === window.innerHeight;
    
    console.log('🌃 背景遮罩验证:', {
      rect: overlayRect,
      viewport: { width: window.innerWidth, height: window.innerHeight },
      isFullscreen: isOverlayFullscreen
    });
    
    // 8. 验证滚动锁定
    const bodyAfterOpen = {
      overflow: document.body.style.overflow,
      position: document.body.style.position,
      top: document.body.style.top
    };
    
    const scrollLocked = 
      bodyAfterOpen.overflow === 'hidden' && 
      bodyAfterOpen.position === 'fixed';
    
    console.log('🔒 滚动锁定验证:', {
      bodyStyles: bodyAfterOpen,
      scrollLocked: scrollLocked
    });
    
    // 9. 测试JavaScript修复器工作状态
    const hasQuickRefClass = dialogElement.classList.contains('quick-reference-dialog');
    const hasRoleDialog = dialogElement.getAttribute('role') === 'dialog';
    
    console.log('⚡ JavaScript修复器验证:', {
      hasQuickRefClass: hasQuickRefClass,
      hasRoleDialog: hasRoleDialog,
      element: dialogElement.outerHTML.substring(0, 200) + '...'
    });
    
    // 10. 综合评估
    const allTestsPassed = 
      isCentered && 
      cssCompliant && 
      isOverlayFullscreen && 
      scrollLocked && 
      hasRoleDialog;
    
    console.log('\n🏆 综合评估结果:');
    console.log('===============================');
    console.log(`🎯 弹窗居中: ${isCentered ? '✅ 通过' : '❌ 失败'}`);
    console.log(`🎨 CSS规范: ${cssCompliant ? '✅ 通过' : '❌ 失败'}`);
    console.log(`🌃 背景遮罩: ${isOverlayFullscreen ? '✅ 通过' : '❌ 失败'}`);
    console.log(`🔒 滚动锁定: ${scrollLocked ? '✅ 通过' : '❌ 失败'}`);
    console.log(`⚡ 修复器状态: ${hasRoleDialog ? '✅ 通过' : '❌ 失败'}`);
    console.log('===============================');
    console.log(`🎉 总体状态: ${allTestsPassed ? '✅ 完全成功' : '❌ 需要修复'}`);
    
    if (allTestsPassed) {
      console.log('🎊 恭喜！快速引用弹窗修复完全符合CLAUDE.md 3.6.2节规范！');
    } else {
      console.log('🚨 发现问题，需要进一步检查和修复。');
    }
    
    // 11. 测试弹窗关闭功能
    setTimeout(() => {
      console.log('🚪 测试弹窗关闭功能...');
      
      // 点击背景关闭弹窗
      overlayElement.click();
      
      setTimeout(() => {
        const afterCloseDialog = document.querySelector('[role="dialog"]');
        const afterCloseOverlay = document.querySelector('[data-radix-dialog-overlay]');
        
        const dialogClosed = !afterCloseDialog;
        const overlayClosed = !afterCloseOverlay;
        
        // 验证滚动恢复
        const bodyAfterClose = {
          overflow: document.body.style.overflow,
          position: document.body.style.position,
          top: document.body.style.top
        };
        
        const scrollRestored = 
          bodyAfterClose.overflow === initialBodyOverflow &&
          (!bodyAfterClose.top || bodyAfterClose.top === '');
        
        console.log('🔚 关闭功能验证:', {
          dialogClosed: dialogClosed,
          overlayClosed: overlayClosed,
          scrollRestored: scrollRestored,
          bodyStyles: bodyAfterClose
        });
        
        if (dialogClosed && overlayClosed && scrollRestored) {
          console.log('✅ 弹窗关闭功能正常，所有状态已恢复');
        } else {
          console.log('❌ 弹窗关闭存在问题');
        }
        
        console.log('🎯 验证完成');
      }, 300);
    }, 2000);
    
  }, 1000);
  
}, 2000);