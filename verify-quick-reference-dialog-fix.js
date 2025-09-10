/**
 * 快速引用弹窗修复验证脚本
 * 验证弹窗的显示、定位、尺寸等问题是否已修复
 */

console.log('🔍 开始验证快速引用弹窗修复效果...');

// 等待页面加载完成
function waitForPageLoad() {
  return new Promise((resolve) => {
    if (document.readyState === 'complete') {
      resolve();
    } else {
      window.addEventListener('load', resolve);
    }
  });
}

// 等待元素出现
function waitForElement(selector, timeout = 10000) {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    
    function check() {
      const element = document.querySelector(selector);
      if (element) {
        resolve(element);
      } else if (Date.now() - startTime > timeout) {
        reject(new Error(`元素 ${selector} 在 ${timeout}ms 内未找到`));
      } else {
        setTimeout(check, 100);
      }
    }
    
    check();
  });
}

// 检查弹窗是否正确居中
function checkDialogCentering(dialog) {
  const rect = dialog.getBoundingClientRect();
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  
  const centerX = viewportWidth / 2;
  const centerY = viewportHeight / 2;
  
  const dialogCenterX = rect.left + rect.width / 2;
  const dialogCenterY = rect.top + rect.height / 2;
  
  const toleranceX = 50; // 允许50px的误差
  const toleranceY = 50;
  
  const isCenteredX = Math.abs(dialogCenterX - centerX) <= toleranceX;
  const isCenteredY = Math.abs(dialogCenterY - centerY) <= toleranceY;
  
  return {
    isCentered: isCenteredX && isCenteredY,
    centerX: dialogCenterX,
    centerY: dialogCenterY,
    expectedCenterX: centerX,
    expectedCenterY: centerY,
    offsetX: dialogCenterX - centerX,
    offsetY: dialogCenterY - centerY
  };
}

// 检查弹窗是否完全可见
function checkDialogVisibility(dialog) {
  const rect = dialog.getBoundingClientRect();
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  
  const isVisible = rect.top >= 0 && 
                   rect.left >= 0 && 
                   rect.bottom <= viewportHeight && 
                   rect.right <= viewportWidth;
  
  return {
    isVisible,
    rect,
    viewport: { width: viewportWidth, height: viewportHeight },
    overflow: {
      top: rect.top < 0 ? Math.abs(rect.top) : 0,
      left: rect.left < 0 ? Math.abs(rect.left) : 0,
      bottom: rect.bottom > viewportHeight ? rect.bottom - viewportHeight : 0,
      right: rect.right > viewportWidth ? rect.right - viewportWidth : 0
    }
  };
}

// 检查弹窗内容是否截断
function checkContentTruncation(dialog) {
  const scrollAreas = dialog.querySelectorAll('[data-radix-scroll-area-viewport]');
  const results = [];
  
  scrollAreas.forEach((area, index) => {
    const hasScrollbar = area.scrollHeight > area.clientHeight;
    const scrollableHeight = area.scrollHeight - area.clientHeight;
    
    results.push({
      index,
      hasScrollbar,
      scrollableHeight,
      clientHeight: area.clientHeight,
      scrollHeight: area.scrollHeight
    });
  });
  
  return results;
}

// 主要测试函数
async function testQuickReferenceDialog() {
  try {
    console.log('📍 等待页面加载...');
    await waitForPageLoad();
    
    console.log('🔍 查找快速引用按钮...');
    
    // 尝试多种可能的选择器
    const buttonSelectors = [
      'button:has-text("快速引用")',
      'button[aria-label*="快速引用"]',
      'button:contains("快速引用")',
      '[data-testid*="quick-reference"]',
      'button:has([data-testid*="quick-reference"])'
    ];
    
    let quickRefButton = null;
    for (const selector of buttonSelectors) {
      try {
        quickRefButton = await waitForElement(selector, 2000);
        if (quickRefButton) {
          console.log(`✅ 找到快速引用按钮: ${selector}`);
          break;
        }
      } catch (e) {
        console.log(`❌ 未找到按钮: ${selector}`);
      }
    }
    
    if (!quickRefButton) {
      // 手动查找包含"快速引用"文本的按钮
      const allButtons = document.querySelectorAll('button');
      for (const button of allButtons) {
        if (button.textContent && button.textContent.includes('快速引用')) {
          quickRefButton = button;
          console.log('✅ 通过文本内容找到快速引用按钮');
          break;
        }
      }
    }
    
    if (!quickRefButton) {
      throw new Error('未找到快速引用按钮');
    }
    
    console.log('🖱️ 点击快速引用按钮...');
    quickRefButton.click();
    
    console.log('⏳ 等待弹窗出现...');
    const dialog = await waitForElement('[role="dialog"], .quick-reference-dialog', 5000);
    
    console.log('✅ 弹窗已出现，开始检查...');
    
    // 检查弹窗居中
    const centeringResult = checkDialogCentering(dialog);
    console.log('📐 弹窗居中检查:', centeringResult);
    
    // 检查弹窗可见性
    const visibilityResult = checkDialogVisibility(dialog);
    console.log('👁️ 弹窗可见性检查:', visibilityResult);
    
    // 检查内容截断
    const truncationResult = checkContentTruncation(dialog);
    console.log('📄 内容截断检查:', truncationResult);
    
    // 检查CSS类名
    const hasQuickRefClass = dialog.classList.contains('quick-reference-dialog');
    console.log('🎨 CSS类名检查:', { hasQuickRefClass, classList: Array.from(dialog.classList) });
    
    // 检查z-index
    const computedStyle = window.getComputedStyle(dialog);
    const zIndex = computedStyle.zIndex;
    console.log('📚 层级检查:', { zIndex, position: computedStyle.position });
    
    // 生成测试报告
    const report = {
      timestamp: new Date().toISOString(),
      viewport: { width: window.innerWidth, height: window.innerHeight },
      centering: centeringResult,
      visibility: visibilityResult,
      truncation: truncationResult,
      styling: {
        hasQuickRefClass,
        classList: Array.from(dialog.classList),
        zIndex,
        position: computedStyle.position
      },
      success: centeringResult.isCentered && visibilityResult.isVisible
    };
    
    console.log('📊 测试报告:', report);
    
    if (report.success) {
      console.log('🎉 快速引用弹窗修复验证成功！');
    } else {
      console.log('⚠️ 快速引用弹窗仍存在问题，需要进一步修复');
    }
    
    return report;
    
  } catch (error) {
    console.error('❌ 测试过程中出现错误:', error);
    return { error: error.message, success: false };
  }
}

// 在不同屏幕尺寸下测试
async function testMultipleScreenSizes() {
  const screenSizes = [
    { width: 1920, height: 1080, name: '桌面大屏' },
    { width: 1366, height: 768, name: '桌面标准' },
    { width: 768, height: 1024, name: '平板竖屏' },
    { width: 375, height: 667, name: '手机' }
  ];
  
  const results = [];
  
  for (const size of screenSizes) {
    console.log(`\n🖥️ 测试屏幕尺寸: ${size.name} (${size.width}x${size.height})`);
    
    // 模拟屏幕尺寸变化
    Object.defineProperty(window, 'innerWidth', { value: size.width, writable: true });
    Object.defineProperty(window, 'innerHeight', { value: size.height, writable: true });
    
    // 触发resize事件
    window.dispatchEvent(new Event('resize'));
    
    // 等待一下让页面适应
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const result = await testQuickReferenceDialog();
    results.push({ ...result, screenSize: size });
    
    // 关闭弹窗（如果存在）
    const closeButton = document.querySelector('[role="dialog"] button[aria-label="Close"], [role="dialog"] .close-button');
    if (closeButton) {
      closeButton.click();
      await new Promise(resolve => setTimeout(resolve, 300));
    }
  }
  
  return results;
}

// 导出测试函数供外部调用
window.testQuickReferenceDialog = testQuickReferenceDialog;
window.testMultipleScreenSizes = testMultipleScreenSizes;

// 自动运行测试（如果在浏览器环境中）
if (typeof window !== 'undefined') {
  // 等待页面加载后自动运行测试
  setTimeout(() => {
    testQuickReferenceDialog();
  }, 2000);
}
