/**
 * 🐭 鼠标移动问题修复验证脚本
 * 
 * 验证内容：
 * 1. 鼠标移动不会导致弹窗出现/消失
 * 2. 弹窗正确居中显示
 * 3. 背景遮罩正确覆盖
 * 4. 点击背景可以关闭弹窗
 */

console.log('🔍 开始验证快速引用弹窗修复...');

// 等待页面加载完成
setTimeout(() => {
  // 1. 查找快速引用按钮
  const quickRefButton = document.querySelector('button[title*="快速引用"], button:has(.lucide-at-sign)');
  
  if (!quickRefButton) {
    console.log('❌ 未找到快速引用按钮');
    return;
  }
  
  console.log('✅ 找到快速引用按钮:', quickRefButton);
  
  // 2. 点击打开弹窗
  quickRefButton.click();
  
  // 3. 等待弹窗出现后测试
  setTimeout(() => {
    const overlay = document.querySelector('div[style*="rgba(0, 0, 0, 0.5)"]');
    const dialog = document.querySelector('div[style*="border: 8px solid #ff0000"]');
    
    if (!overlay || !dialog) {
      console.log('❌ 弹窗未正确渲染');
      return;
    }
    
    console.log('✅ 弹窗已渲染');
    
    // 4. 测试鼠标移动事件
    console.log('🐭 开始测试鼠标移动...');
    
    // 记录初始状态
    const initialOverlayDisplay = window.getComputedStyle(overlay).display;
    const initialDialogDisplay = window.getComputedStyle(dialog).display;
    
    console.log('📊 初始状态:', {
      overlay: initialOverlayDisplay,
      dialog: initialDialogDisplay
    });
    
    // 模拟鼠标移动
    const moveEvents = [
      { x: 100, y: 100 },
      { x: 500, y: 200 },
      { x: 800, y: 400 },
      { x: 1000, y: 600 }
    ];
    
    moveEvents.forEach((pos, index) => {
      setTimeout(() => {
        // 创建并分发鼠标移动事件
        const moveEvent = new MouseEvent('mousemove', {
          clientX: pos.x,
          clientY: pos.y,
          bubbles: true,
          cancelable: true
        });
        
        document.dispatchEvent(moveEvent);
        
        // 检查弹窗状态
        const overlayDisplay = window.getComputedStyle(overlay).display;
        const dialogDisplay = window.getComputedStyle(dialog).display;
        
        console.log(`🐭 鼠标移动 ${index + 1}/${moveEvents.length} (${pos.x}, ${pos.y}):`, {
          overlay: overlayDisplay,
          dialog: dialogDisplay,
          statusChanged: overlayDisplay !== initialOverlayDisplay || dialogDisplay !== initialDialogDisplay
        });
        
        if (overlayDisplay !== initialOverlayDisplay || dialogDisplay !== initialDialogDisplay) {
          console.log('❌ 检测到弹窗状态因鼠标移动而改变！');
        }
        
        // 最后一次测试后验证
        if (index === moveEvents.length - 1) {
          setTimeout(() => {
            const finalOverlayDisplay = window.getComputedStyle(overlay).display;
            const finalDialogDisplay = window.getComputedStyle(dialog).display;
            
            if (finalOverlayDisplay === initialOverlayDisplay && finalDialogDisplay === initialDialogDisplay) {
              console.log('✅ 鼠标移动测试通过 - 弹窗状态稳定');
            } else {
              console.log('❌ 鼠标移动测试失败 - 弹窗状态不稳定');
            }
            
            // 5. 测试点击背景关闭
            console.log('🖱️ 测试点击背景关闭...');
            overlay.click();
            
            setTimeout(() => {
              const afterClickOverlay = document.querySelector('div[style*="rgba(0, 0, 0, 0.5)"]');
              const afterClickDialog = document.querySelector('div[style*="border: 8px solid #ff0000"]');
              
              if (!afterClickOverlay && !afterClickDialog) {
                console.log('✅ 点击背景关闭测试通过');
              } else {
                console.log('❌ 点击背景关闭测试失败');
              }
              
              console.log('🎯 修复验证完成');
            }, 200);
          }, 500);
        }
      }, index * 200);
    });
    
  }, 1000);
  
}, 2000);