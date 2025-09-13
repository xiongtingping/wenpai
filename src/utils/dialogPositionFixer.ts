/**
 * 🎯 Dialog定位修复器 - 通用工具
 * 解决所有Radix UI Dialog组件定位异常问题的根本性方案
 * 
 * 修复目标：
 * 1. Dialog不居中显示问题
 * 2. Tailwind动画类干扰定位
 * 3. 内联样式被覆盖问题
 * 4. 响应式布局适配问题
 */

export interface DialogFixOptions {
  /** Dialog选择器，默认会尝试多个常见选择器 */
  selector?: string;
  /** 最大宽度，默认 'min(95vw, 1024px)' */
  maxWidth?: string;
  /** 最大高度，默认 '85vh' */
  maxHeight?: string;
  /** z-index，默认 1055 */
  zIndex?: number;
  /** 是否移除动画类，默认 true */
  removeAnimationClasses?: boolean;
  /** 调试模式，默认 false */
  debug?: boolean;
}

/**
 * 强制修复Dialog定位的核心函数
 */
export function fixDialogPosition(options: DialogFixOptions = {}) {
  const {
    selector,
    maxWidth = 'min(95vw, 1024px)',
    maxHeight = '85vh',
    zIndex = 1055,
    removeAnimationClasses = true,
    debug = false
  } = options;

  // 尝试多种选择器查找Dialog元素
  const selectors = selector ? [selector] : [
    '[role="dialog"].enhanced-history-dialog',
    '[role="dialog"].quick-reference-dialog',
    '[role="dialog"]',
    '[data-radix-dialog-content].enhanced-history-dialog',
    '[data-radix-dialog-content].quick-reference-dialog',
    '[data-radix-dialog-content]'
  ];

  let dialogElement: HTMLElement | null = null;
  for (const sel of selectors) {
    dialogElement = document.querySelector(sel) as HTMLElement;
    if (dialogElement) break;
  }

  if (!dialogElement) {
    if (debug) console.warn('❌ Dialog元素未找到');
    return false;
  }

  if (debug) {
    console.log('🔍 找到Dialog元素:', dialogElement);
    console.log('📊 修复前位置:', {
      position: dialogElement.style.position,
      top: dialogElement.style.top,
      left: dialogElement.style.left,
      transform: dialogElement.style.transform
    });
  }

  // 🚨 强制清除可能干扰定位的样式
  dialogElement.style.removeProperty('top');
  dialogElement.style.removeProperty('left');
  dialogElement.style.removeProperty('transform');
  dialogElement.style.removeProperty('inset');

  // 🚨 移除Tailwind动画类（这些类会干扰定位）
  if (removeAnimationClasses) {
    const animationClasses = [
      'slide-in-from-left-1/2',
      'slide-in-from-top-[48%]',
      'slide-out-to-left-1/2',
      'slide-out-to-top-[48%]',
      'data-[state=open]:slide-in-from-left-1/2',
      'data-[state=open]:slide-in-from-top-[48%]',
      'data-[state=closed]:slide-out-to-left-1/2',
      'data-[state=closed]:slide-out-to-top-[48%]'
    ];
    
    animationClasses.forEach(className => {
      dialogElement!.classList.remove(className);
    });
  }

  // 🚨 强制应用正确定位 - 使用!important确保最高优先级
  dialogElement.style.setProperty('position', 'fixed', 'important');
  dialogElement.style.setProperty('top', '50%', 'important');
  dialogElement.style.setProperty('left', '50%', 'important');
  dialogElement.style.setProperty('transform', 'translate(-50%, -50%)', 'important');
  dialogElement.style.setProperty('z-index', zIndex.toString(), 'important');

  // 🚨 确保尺寸正确
  dialogElement.style.setProperty('max-width', maxWidth, 'important');
  dialogElement.style.setProperty('max-height', maxHeight, 'important');
  dialogElement.style.setProperty('width', 'auto', 'important');
  dialogElement.style.setProperty('height', 'auto', 'important');
  dialogElement.style.setProperty('min-width', '320px', 'important');
  dialogElement.style.setProperty('min-height', '200px', 'important');

  // 🚨 确保可见性
  dialogElement.style.setProperty('display', 'flex', 'important');
  dialogElement.style.setProperty('flex-direction', 'column', 'important');
  dialogElement.style.setProperty('visibility', 'visible', 'important');
  dialogElement.style.setProperty('opacity', '1', 'important');
  dialogElement.style.setProperty('pointer-events', 'auto', 'important');

  if (debug) {
    console.log('🎯 Dialog定位修复已应用');
    console.log('📊 修复后位置:', {
      position: dialogElement.style.position,
      top: dialogElement.style.top,
      left: dialogElement.style.left,
      transform: dialogElement.style.transform,
      maxWidth: dialogElement.style.maxWidth,
      maxHeight: dialogElement.style.maxHeight
    });
  }

  return true;
}

/**
 * 自动Dialog定位修复启动器（纯JavaScript版本）
 * 替代React Hook，避免React依赖问题
 */
export function startDialogPositionFix(isOpen: boolean, options: DialogFixOptions = {}): () => void {
  if (!isOpen) return () => {};

  const fix = () => fixDialogPosition(options); // 使用传入的选项，不强制覆盖debug

  // 多时机执行修复，确保在各种情况下都能正确定位
  fix();
  const timer1 = setTimeout(fix, 50);
  const timer2 = setTimeout(fix, 150);
  const timer3 = setTimeout(fix, 300);

  // 监听DOM变化，如果Dialog结构发生变化则重新修复
  // 🔥 紧急修复：非debug模式下禁用MutationObserver，避免无限循环
  let observer: MutationObserver | null = null;
  
  if (options.debug) {
    // 只在debug模式下启用MutationObserver
    let isFixing = false;
    observer = new MutationObserver((mutations) => {
      // 防止修复过程中触发新的修复
      if (isFixing) return;
      
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && (mutation.target as Element).matches('[role="dialog"]')) {
          // 只有在class属性变化时才修复，避免style变化触发循环
          if (mutation.attributeName === 'class') {
            isFixing = true;
            setTimeout(() => {
              fix();
              isFixing = false;
            }, 100); // 防抖延迟
          }
        }
      });
    });

    const dialogElement = document.querySelector('[role="dialog"]');
    if (dialogElement) {
      observer.observe(dialogElement, { attributes: true, attributeFilter: ['class'] }); // 只监听class，不监听style
    }
  }

  // 返回清理函数
  return () => {
    clearTimeout(timer1);
    clearTimeout(timer2);
    clearTimeout(timer3);
    if (observer) {
      observer.disconnect();
    }
  };
}

/**
 * React Hook包装器：在Dialog打开时自动应用定位修复
 * 这个函数应该在React组件中使用，会自动处理React的useEffect
 */
export function useDialogPositionFix(isOpen: boolean, options: DialogFixOptions = {}) {
  // 这里我们依赖于React环境，如果在React组件中调用此函数，
  // React的useEffect应该已经在作用域中了
  if (typeof window === 'undefined') return; // SSR保护
  
  // 延迟执行，避免在模块加载时立即执行
  setTimeout(() => {
    let cleanup: (() => void) | null = null;
    
    const setupFix = () => {
      if (cleanup) cleanup();
      cleanup = startDialogPositionFix(isOpen, options);
    };
    
    const teardownFix = () => {
      if (cleanup) {
        cleanup();
        cleanup = null;
      }
    };
    
    // 当Dialog打开时启动修复，关闭时清理
    if (isOpen) {
      setupFix();
    } else {
      teardownFix();
    }
    
    // 返回一个清理函数供外部调用
    (globalThis as any).__dialogPositionFixCleanup = teardownFix;
  }, 0);
}

/**
 * 自动修复所有Dialog的定位问题（页面级修复）
 */
export function autoFixAllDialogs() {
  // 查找页面上所有的Dialog元素
  const dialogs = document.querySelectorAll('[role="dialog"], [data-radix-dialog-content]');
  
  let fixedCount = 0;
  dialogs.forEach((dialog) => {
    const element = dialog as HTMLElement;
    // 检查是否需要修复（位置不在中心）
    const rect = element.getBoundingClientRect();
    const viewportCenterX = window.innerWidth / 2;
    const viewportCenterY = window.innerHeight / 2;
    const dialogCenterX = rect.left + rect.width / 2;
    const dialogCenterY = rect.top + rect.height / 2;
    
    // 如果Dialog中心点偏离视口中心超过50px，则认为需要修复
    const needsFix = Math.abs(dialogCenterX - viewportCenterX) > 50 || 
                     Math.abs(dialogCenterY - viewportCenterY) > 50;
    
    if (needsFix) {
      const className = element.className;
      let maxWidth = 'min(95vw, 1024px)';
      
      // 根据Dialog类型调整尺寸
      if (className.includes('enhanced-history-dialog')) {
        maxWidth = 'min(95vw, 1024px)';
      } else if (className.includes('quick-reference-dialog')) {
        maxWidth = 'min(95vw, 1024px)';
      }
      
      if (fixDialogPosition({ 
        selector: `[role="dialog"]:nth-child(${Array.from(dialogs).indexOf(dialog) + 1})`,
        maxWidth,
        debug: true 
      })) {
        fixedCount++;
      }
    }
  });
  
  if (fixedCount > 0) {
    console.log(`🎯 自动修复了 ${fixedCount} 个Dialog的定位问题`);
  }
  
  return fixedCount;
}

// 🎯 Dialog定位修复工具已完全解耦，不依赖React环境