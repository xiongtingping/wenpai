/**
 * 🎪 弹窗滚动问题修复验证脚本
 * 
 * 验证内容：
 * 1. 弹窗打开时页面滚动被正确锁定
 * 2. 弹窗在视口中保持正确居中位置
 * 3. 背景遮罩始终覆盖整个视口
 * 4. 弹窗关闭时页面滚动正确恢复
 * 5. 背景遮罩在弹窗关闭后正确清理
 */

console.log('🎪 开始验证快速引用弹窗滚动修复...');

// 等待页面加载完成
setTimeout(() => {
  // 1. 记录初始页面状态
  const initialScrollY = window.scrollY;
  const initialBodyOverflow = document.body.style.overflow;
  const initialBodyPosition = document.body.style.position;
  
  console.log('📊 初始页面状态:', {
    scrollY: initialScrollY,
    bodyOverflow: initialBodyOverflow,
    bodyPosition: initialBodyPosition
  });
  
  // 2. 查找快速引用按钮
  const quickRefButton = document.querySelector('button[title*="快速引用"], button:has(.lucide-at-sign)');
  
  if (!quickRefButton) {
    console.log('❌ 未找到快速引用按钮');
    return;
  }
  
  console.log('✅ 找到快速引用按钮:', quickRefButton);
  
  // 3. 点击打开弹窗
  quickRefButton.click();
  
  // 4. 等待弹窗出现后测试滚动锁定
  setTimeout(() => {
    const overlay = document.querySelector('div[style*="rgba(0, 0, 0, 0.5)"]');
    const dialog = document.querySelector('div[style*="border: 8px solid #ff0000"]');
    
    if (!overlay || !dialog) {
      console.log('❌ 弹窗未正确渲染');
      return;
    }
    
    console.log('✅ 弹窗已渲染');
    
    // 5. 验证滚动锁定
    const bodyAfterOpen = {
      overflow: document.body.style.overflow,
      position: document.body.style.position,
      top: document.body.style.top
    };
    
    console.log('🔒 弹窗打开后页面状态:', bodyAfterOpen);
    
    if (bodyAfterOpen.overflow === 'hidden' && bodyAfterOpen.position === 'fixed') {
      console.log('✅ 页面滚动锁定成功');
    } else {
      console.log('❌ 页面滚动锁定失败');
    }
    
    // 6. 测试弹窗位置
    const dialogRect = dialog.getBoundingClientRect();
    const viewportCenter = {
      x: window.innerWidth / 2,
      y: window.innerHeight / 2
    };
    const dialogCenter = {
      x: dialogRect.left + dialogRect.width / 2,
      y: dialogRect.top + dialogRect.height / 2
    };
    
    const centerOffset = {
      x: Math.abs(dialogCenter.x - viewportCenter.x),
      y: Math.abs(dialogCenter.y - viewportCenter.y)
    };
    
    console.log('🎯 弹窗位置验证:', {
      viewport: viewportCenter,
      dialog: dialogCenter,
      offset: centerOffset,
      isCentered: centerOffset.x < 5 && centerOffset.y < 5
    });
    
    // 7. 测试背景遮罩覆盖
    const overlayRect = overlay.getBoundingClientRect();
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
    
    // 8. 尝试触发滚动事件
    console.log('📜 测试滚动事件阻止...');
    
    const scrollTest = () => {
      const beforeScroll = window.scrollY;
      
      // 尝试通过JavaScript滚动
      try {
        window.scrollTo(0, 100);
        const afterJSScroll = window.scrollY;
        console.log('📜 JavaScript滚动测试:', { before: beforeScroll, after: afterJSScroll, prevented: afterJSScroll === beforeScroll });
      } catch (e) {
        console.log('📜 JavaScript滚动被阻止:', e.message);
      }
      
      // 尝试触发滚轮事件
      const wheelEvent = new WheelEvent('wheel', {
        deltaY: 100,
        bubbles: true,
        cancelable: true
      });
      
      const wheelPrevented = !document.dispatchEvent(wheelEvent);
      console.log('🎡 滚轮事件测试:', { prevented: wheelPrevented });
    };
    
    scrollTest();
    
    // 9. 测试弹窗关闭和状态恢复
    setTimeout(() => {
      console.log('🚪 测试弹窗关闭...');
      
      // 点击背景关闭弹窗
      overlay.click();
      
      setTimeout(() => {
        const afterCloseOverlay = document.querySelector('div[style*="rgba(0, 0, 0, 0.5)"]');
        const afterCloseDialog = document.querySelector('div[style*="border: 8px solid #ff0000"]');
        
        const bodyAfterClose = {
          overflow: document.body.style.overflow,
          position: document.body.style.position,
          top: document.body.style.top
        };
        
        console.log('🔓 弹窗关闭后页面状态:', bodyAfterClose);
        console.log('🧹 元素清理状态:', {
          overlayExists: !!afterCloseOverlay,
          dialogExists: !!afterCloseDialog
        });
        
        // 验证滚动恢复
        const scrollRecovered = 
          bodyAfterClose.overflow === initialBodyOverflow &&
          bodyAfterClose.position === initialBodyPosition &&
          (!bodyAfterClose.top || bodyAfterClose.top === '');
        
        if (scrollRecovered && !afterCloseOverlay && !afterCloseDialog) {
          console.log('✅ 弹窗关闭和状态恢复完全成功');
        } else {
          console.log('❌ 弹窗关闭或状态恢复存在问题');
        }
        
        // 最终测试页面滚动是否恢复
        setTimeout(() => {
          const testScrollY = window.scrollY;
          window.scrollTo(0, 50);
          
          setTimeout(() => {
            const afterTestScroll = window.scrollY;
            const scrollRestored = afterTestScroll === 50;
            
            console.log('📜 滚动恢复验证:', {
              beforeTest: testScrollY,
              afterTest: afterTestScroll,
              scrollRestored
            });
            
            if (scrollRestored) {
              console.log('✅ 所有滚动功能已恢复正常');
            } else {
              console.log('❌ 滚动功能恢复异常');
            }
            
            // 恢复初始滚动位置
            window.scrollTo(0, initialScrollY);
            console.log('🎯 滚动修复验证完成');
          }, 200);
        }, 200);
        
      }, 500);
    }, 2000);
    
  }, 1000);
  
}, 2000);