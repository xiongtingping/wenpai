/**
 * 🎯 快速引用Dialog定位验证脚本
 * 遵循CLAUDE.md第3.6.2节验证标准
 * 
 * 验证标准：
 * - Dialog必须始终显示在浏览器视口的正中央
 * - 背景遮罩必须完全覆盖整个浏览器视口
 * - Dialog打开时控制台显示修复日志
 * - 通过getBoundingClientRect()验证Dialog中心点与视口中心点偏差小于5像素
 * - 在不同屏幕尺寸下都能正确居中显示
 */

function verifyQuickReferenceDialog() {
  console.log('🚨 开始验证快速引用Dialog可见性和定位...');
  
  // 获取视窗尺寸
  const viewport = {
    width: window.innerWidth,
    height: window.innerHeight,
    centerX: window.innerWidth / 2,
    centerY: window.innerHeight / 2
  };
  
  console.log('📱 视窗信息:', viewport);
  
  // 查找Dialog元素
  const dialogElement = 
    document.querySelector('[role="dialog"][class*="quick-reference-dialog"]') ||
    document.querySelector('.quick-reference-dialog') ||
    document.querySelector('[role="dialog"]');
  
  if (!dialogElement) {
    console.warn('⚠️ 未找到快速引用Dialog元素');
    
    // 🔍 检查是否有其他Dialog元素
    const allDialogs = document.querySelectorAll('[role="dialog"]');
    const allDialogContent = document.querySelectorAll('[data-radix-dialog-content]');
    
    console.log('🔍 发现的Dialog元素:', allDialogs);
    console.log('🔍 发现的DialogContent元素:', allDialogContent);
    
    return {
      success: false,
      reason: 'Dialog元素不存在',
      foundDialogs: allDialogs.length,
      foundDialogContent: allDialogContent.length
    };
  }
  
  console.log('✅ 找到Dialog元素:', dialogElement);
  
  // 获取Dialog位置和尺寸
  const rect = dialogElement.getBoundingClientRect();
  const dialogCenter = {
    x: rect.left + rect.width / 2,
    y: rect.top + rect.height / 2
  };
  
  console.log('📐 Dialog位置信息:', {
    left: rect.left,
    top: rect.top,
    width: rect.width,
    height: rect.height,
    center: dialogCenter
  });
  
  // 计算偏移量
  const offset = {
    x: Math.abs(dialogCenter.x - viewport.centerX),
    y: Math.abs(dialogCenter.y - viewport.centerY)
  };
  
  console.log('📏 中心点偏移量:', offset);
  
  // 验证居中效果（偏差小于5像素）
  const isCentered = offset.x < 5 && offset.y < 5;
  const isInViewport = rect.left >= 0 && rect.top >= 0 && 
                       rect.right <= viewport.width && rect.bottom <= viewport.height;
  
  // 🚨 检查可见性关键属性
  const computedStyle = window.getComputedStyle(dialogElement);
  const styleCheck = {
    position: computedStyle.position,
    top: computedStyle.top,
    left: computedStyle.left,
    transform: computedStyle.transform,
    zIndex: computedStyle.zIndex,
    inset: computedStyle.inset,
    // 🚨 可见性检查
    display: computedStyle.display,
    visibility: computedStyle.visibility,
    opacity: computedStyle.opacity,
    pointerEvents: computedStyle.pointerEvents,
    // 🚨 可能隐藏的属性
    clipPath: computedStyle.clipPath,
    filter: computedStyle.filter,
    mask: computedStyle.mask,
    overflow: computedStyle.overflow
  };
  
  console.log('🎨 样式检查 (包含可见性):', styleCheck);
  
  // 🚨 检查是否被隐藏
  const isVisuallyHidden = 
    computedStyle.display === 'none' ||
    computedStyle.visibility === 'hidden' ||
    parseFloat(computedStyle.opacity) === 0 ||
    rect.width === 0 ||
    rect.height === 0;
    
  console.log('👁️ 是否被隐藏:', isVisuallyHidden);
  
  // 检查背景遮罩
  const overlay = document.querySelector('[data-radix-dialog-overlay]') ||
                  document.querySelector('.dialog-overlay');
  
  let overlayCheck = null;
  if (overlay) {
    const overlayRect = overlay.getBoundingClientRect();
    overlayCheck = {
      covers_viewport: overlayRect.width >= viewport.width && overlayRect.height >= viewport.height,
      position: window.getComputedStyle(overlay).position,
      inset: window.getComputedStyle(overlay).inset
    };
    console.log('🖼️ 背景遮罩检查:', overlayCheck);
  }
  
  // 🚨 生成验证报告（增强可见性检查）
  const report = {
    success: isCentered && isInViewport && !isVisuallyHidden,
    timestamp: new Date().toISOString(),
    viewport,
    dialog: {
      rect: {
        left: Math.round(rect.left),
        top: Math.round(rect.top),
        width: Math.round(rect.width),
        height: Math.round(rect.height)
      },
      center: {
        x: Math.round(dialogCenter.x),
        y: Math.round(dialogCenter.y)
      },
      offset: {
        x: Math.round(offset.x * 100) / 100,
        y: Math.round(offset.y * 100) / 100
      }
    },
    validation: {
      isCentered,
      isInViewport,
      isVisible: !isVisuallyHidden,
      centeringAccuracy: isCentered ? '✅ 完美居中' : '❌ 未居中',
      viewportContainment: isInViewport ? '✅ 完全在视窗内' : '❌ 超出视窗',
      visibility: !isVisuallyHidden ? '✅ 可见' : '❌ 被隐藏',
      maxOffset: Math.max(offset.x, offset.y)
    },
    style: styleCheck,
    overlay: overlayCheck,
    recommendations: []
  };
  
  // 🚨 添加建议（增强可见性建议）
  if (isVisuallyHidden) {
    report.recommendations.push('🚨 Dialog被隐藏！检查display、visibility、opacity属性');
    if (computedStyle.display === 'none') {
      report.recommendations.push('🚨 display为none，强制设置为flex');
    }
    if (computedStyle.visibility === 'hidden') {
      report.recommendations.push('🚨 visibility为hidden，强制设置为visible');
    }
    if (parseFloat(computedStyle.opacity) === 0) {
      report.recommendations.push('🚨 opacity为0，强制设置为1');
    }
    if (rect.width === 0 || rect.height === 0) {
      report.recommendations.push('🚨 Dialog尺寸为0，检查width/height设置');
    }
  }
  
  if (!isCentered) {
    report.recommendations.push('建议检查JavaScript运行时修复器是否正常工作');
    report.recommendations.push('建议检查CSS视窗单位是否正确应用');
  }
  
  if (!isInViewport) {
    report.recommendations.push('建议检查Dialog尺寸设置是否合理');
  }
  
  if (styleCheck.position !== 'fixed') {
    report.recommendations.push('建议确保position属性为fixed');
  }
  
  if (!styleCheck.top.includes('vh') && !styleCheck.top.includes('%')) {
    report.recommendations.push('建议使用视窗单位(vh)进行定位');
  }
  
  // 输出结果
  console.log('📊 验证报告:', report);
  
  if (report.success) {
    console.log('🎉 快速引用Dialog定位验证通过！');
  } else {
    console.error('❌ 快速引用Dialog定位验证失败！');
    console.log('💡 修复建议:', report.recommendations);
  }
  
  return report;
}

// 自动验证（如果Dialog已经打开）
if (document.querySelector('[role="dialog"]')) {
  setTimeout(() => {
    verifyQuickReferenceDialog();
  }, 500);
}

// 导出验证函数
window.verifyQuickReferenceDialog = verifyQuickReferenceDialog;

console.log('📋 快速引用Dialog验证脚本已加载');
console.log('🔧 使用方法: 打开快速引用Dialog后运行 verifyQuickReferenceDialog()');