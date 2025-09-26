/**
 * 🎯 Dialog定位Hook
 * 统一的Dialog定位管理，遵循React命名规范
 * 
 * 功能：
 * - 自动修复Dialog定位问题
 * - 使用设计令牌确保一致性
 * - 提供错误处理和日志记录
 * - 支持不同类型的Dialog
 */

import { useEffect, useCallback } from 'react';

export interface DialogPositioningOptions {
  /** Dialog是否打开 */
  open: boolean;
  /** Dialog类型，用于选择器匹配 */
  dialogType: 'quick-reference' | 'history' | 'generic';
  /** 是否启用调试日志 */
  enableDebugLogs?: boolean;
  /** 自定义选择器 */
  customSelectors?: string[];
  /** 修复延迟时间（毫秒） */
  fixDelays?: number[];
}

export interface DialogPositioningResult {
  /** 是否成功应用修复 */
  isFixed: boolean;
  /** 错误信息 */
  error?: string;
  /** 找到的Dialog元素 */
  dialogElement?: HTMLElement;
}

/**
 * Dialog定位修复Hook
 */
export function useDialogPositioning(options: DialogPositioningOptions): DialogPositioningResult {
  const {
    open,
    dialogType,
    enableDebugLogs = false,
    customSelectors = [],
    fixDelays = [0, 100, 300]
  } = options;

  /**
   * 获取Dialog选择器
   */
  const getDialogSelectors = useCallback((): string[] => {
    const baseSelectors = [
      '[role="dialog"]',
      '[data-radix-dialog-content]'
    ];

    const typeSpecificSelectors = {
      'quick-reference': [
        '[role="dialog"][class*="quick-reference-dialog"]',
        '.quick-reference-dialog',
        '.dialog__content--quick-reference'
      ],
      'history': [
        '[role="dialog"][class*="enhanced-history-dialog"]',
        '.enhanced-history-dialog',
        '.dialog__content--history'
      ],
      'generic': []
    };

    return [
      ...typeSpecificSelectors[dialogType],
      ...customSelectors,
      ...baseSelectors
    ];
  }, [dialogType, customSelectors]);

  /**
   * 应用Dialog定位和尺寸修复 - 防闪动加强版
   */
  const applyDialogPositioning = useCallback((dialogElement: HTMLElement): void => {
    try {
      // 🚨 立即锁定Dialog尺寸，防止任何闪动
      if (dialogElement.classList.contains('subscription-dialog-stable')) {
        // 添加订阅和编辑订阅Dialog
        dialogElement.style.setProperty('width', 'min(90vw, 1000px)', 'important');
        dialogElement.style.setProperty('max-width', '1000px', 'important');
        dialogElement.style.setProperty('min-width', '600px', 'important');
        dialogElement.style.setProperty('max-height', '90vh', 'important');
        dialogElement.style.setProperty('min-height', '500px', 'important');
        dialogElement.style.setProperty('height', 'auto', 'important');
      } else if (dialogElement.classList.contains('trend-analysis-dialog-stable')) {
        // 趋势分析Dialog
        dialogElement.style.setProperty('width', 'min(95vw, 1400px)', 'important');
        dialogElement.style.setProperty('max-width', '1400px', 'important');
        dialogElement.style.setProperty('min-width', '900px', 'important');
        dialogElement.style.setProperty('max-height', '95vh', 'important');
        dialogElement.style.setProperty('min-height', '700px', 'important');
        dialogElement.style.setProperty('height', 'auto', 'important');
      }

      // 🚨 完全禁用所有可能的动画和过渡
      dialogElement.style.setProperty('transition', 'none', 'important');
      dialogElement.style.setProperty('animation', 'none', 'important');
      dialogElement.style.setProperty('animation-duration', '0s', 'important');
      dialogElement.style.setProperty('animation-delay', '0s', 'important');
      dialogElement.style.setProperty('transition-duration', '0s', 'important');
      dialogElement.style.setProperty('transition-delay', '0s', 'important');
      
      // 🎯 确保Dialog可以正常关闭
      dialogElement.style.setProperty('pointer-events', 'auto', 'important');

      // 清除可能冲突的inset属性
      const insetProperties = [
        'inset',
        'inset-block',
        'inset-inline',
        'inset-block-start',
        'inset-block-end',
        'inset-inline-start',
        'inset-inline-end'
      ];

      insetProperties.forEach(property => {
        dialogElement.style.removeProperty(property);
      });

      // 🎯 强制设置正确的定位 - 使用视窗单位（CLAUDE.md 3.6.3节）
      dialogElement.style.setProperty('position', 'fixed', 'important');
      dialogElement.style.setProperty('top', '50vh', 'important');  // 🔥 使用vh单位
      dialogElement.style.setProperty('left', '50vw', 'important'); // 🔥 使用vw单位
      dialogElement.style.setProperty('transform', 'translate(-50%, -50%)', 'important');
      dialogElement.style.setProperty('z-index', '1000000', 'important');
      dialogElement.style.setProperty('margin', '0', 'important');
      dialogElement.style.setProperty('right', 'auto', 'important');
      dialogElement.style.setProperty('bottom', 'auto', 'important');

      if (enableDebugLogs) {
        console.log(`🎯 ${dialogType} Dialog定位修复已应用`, {
          element: dialogElement,
          className: dialogElement.className,
          computedStyle: {
            position: getComputedStyle(dialogElement).position,
            top: getComputedStyle(dialogElement).top,
            left: getComputedStyle(dialogElement).left,
            transform: getComputedStyle(dialogElement).transform
          }
        });
      }
    } catch (error) {
      if (enableDebugLogs) {
        console.warn(`⚠️ ${dialogType} Dialog定位修复失败:`, error);
      }
      throw error;
    }
  }, [dialogType, enableDebugLogs]);

  /**
   * 查找并修复Dialog元素
   */
  const findAndFixDialog = useCallback((): DialogPositioningResult => {
    try {
      const selectors = getDialogSelectors();
      let dialogElement: HTMLElement | null = null;

      // 按优先级查找Dialog元素
      for (const selector of selectors) {
        dialogElement = document.querySelector(selector) as HTMLElement;
        if (dialogElement) {
          if (enableDebugLogs) {
            console.log(`✅ 找到Dialog元素: ${selector}`);
          }
          break;
        }
      }

      if (!dialogElement) {
        const error = `未找到${dialogType} Dialog元素`;
        if (enableDebugLogs) {
          console.warn(`❌ ${error}`, { selectors });
        }
        return { isFixed: false, error };
      }

      // 应用定位修复
      applyDialogPositioning(dialogElement);

      return {
        isFixed: true,
        dialogElement
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      if (enableDebugLogs) {
        console.error(`💥 ${dialogType} Dialog修复过程出错:`, error);
      }
      return {
        isFixed: false,
        error: errorMessage
      };
    }
  }, [getDialogSelectors, applyDialogPositioning, dialogType, enableDebugLogs]);

  /**
   * 执行多次修复尝试
   */
  const executeFixWithRetries = useCallback(() => {
    if (!open) return;

    fixDelays.forEach((delay, index) => {
      setTimeout(() => {
        try {
          const result = findAndFixDialog();
          if (enableDebugLogs && result.isFixed) {
            console.log(`🎯 第${index + 1}次修复尝试成功 (延迟${delay}ms)`);
          }
        } catch (error) {
          if (enableDebugLogs) {
            console.warn(`⚠️ 第${index + 1}次修复尝试失败 (延迟${delay}ms):`, error);
          }
        }
      }, delay);
    });
  }, [open, fixDelays, findAndFixDialog, enableDebugLogs]);

  // 当Dialog打开时执行修复
  useEffect(() => {
    executeFixWithRetries();
  }, [executeFixWithRetries]);

  // 返回最新的修复状态
  const currentResult = open ? findAndFixDialog() : { isFixed: false };

  return currentResult;
}

/**
 * 快速引用Dialog定位Hook
 */
export function useQuickReferenceDialogPositioning(open: boolean, enableDebugLogs = false) {
  return useDialogPositioning({
    open,
    dialogType: 'quick-reference',
    enableDebugLogs
  });
}

/**
 * 历史记录Dialog定位Hook
 */
export function useHistoryDialogPositioning(open: boolean, enableDebugLogs = false) {
  return useDialogPositioning({
    open,
    dialogType: 'history',
    enableDebugLogs
  });
}

/**
 * 通用Dialog定位Hook
 */
export function useGenericDialogPositioning(open: boolean, customSelectors?: string[], enableDebugLogs = false) {
  return useDialogPositioning({
    open,
    dialogType: 'generic',
    customSelectors,
    enableDebugLogs
  });
}

/**
 * 订阅Dialog定位Hook - 专门用于HotTopicsPage
 */
export function useSubscriptionDialogPositioning(open: boolean, enableDebugLogs = false) {
  return useDialogPositioning({
    open,
    dialogType: 'generic',
    customSelectors: [
      '[role="dialog"].subscription-dialog-stable',
      '[role="dialog"][class*="subscription-dialog-stable"]',
      '[role="dialog"].trend-analysis-dialog-stable',
      '[role="dialog"][class*="trend-analysis-dialog-stable"]',
      '[role="dialog"].subscription-dialog',
      '[role="dialog"][class*="subscription-dialog"]',
      '[role="dialog"].trend-analysis-dialog',
      '[role="dialog"][class*="trend-analysis-dialog"]'
    ],
    enableDebugLogs
  });
}

/**
 * 🎯 Dialog滚动锁定Hook - 优化版本，防止页面闪动
 * 修复弹窗开关时的页面上下跳跃问题
 * 遵循CLAUDE.md的系统性解决方案
 */
export function useDialogScrollLock(open: boolean) {
  useEffect(() => {
    if (!open) return;

    console.log('🔒 启用优化的滚动锁定 - useDialogScrollLock v2');
    
    // 保存原始状态 - 更全面的状态保存
    const originalScrollY = window.scrollY;
    const originalScrollX = window.scrollX;
    const body = document.body;
    const html = document.documentElement;
    
    const originalBodyStyles = {
      overflow: body.style.overflow,
      overflowX: body.style.overflowX,
      overflowY: body.style.overflowY,
      position: body.style.position,
      top: body.style.top,
      left: body.style.left,
      right: body.style.right,
      width: body.style.width,
      height: body.style.height,
      paddingRight: body.style.paddingRight
    };

    const originalHtmlStyles = {
      overflow: html.style.overflow,
      overflowX: html.style.overflowX,
      overflowY: html.style.overflowY
    };

    console.log('📊 滚动锁定前状态:', {
      scrollY: originalScrollY,
      scrollX: originalScrollX,
      bodyOverflow: originalBodyStyles.overflow,
      bodyPosition: originalBodyStyles.position
    });

    // 🎯 计算滚动条宽度，防止页面宽度跳跃
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    
    // 🔒 应用无闪动的滚动锁定
    // 关键：不使用 position: fixed 和 top 偏移，这是导致闪动的根本原因
    body.style.overflow = 'hidden';
    body.style.overflowY = 'hidden';
    body.style.overflowX = 'hidden';
    
    // 🎯 补偿滚动条宽度，防止页面内容跳跃
    if (scrollbarWidth > 0) {
      body.style.paddingRight = `${scrollbarWidth}px`;
    }
    
    // 🚨 同时锁定html元素，防止双重滚动
    html.style.overflow = 'hidden';
    html.style.overflowY = 'hidden';
    html.style.overflowX = 'hidden';
    
    console.log('✅ 优化的滚动锁定已应用:', {
      bodyOverflow: body.style.overflow,
      scrollbarWidth,
      paddingRight: body.style.paddingRight
    });

    // 🚫 阻止滚动事件 - 更精确的事件处理
    const preventScroll = (e: Event) => {
      // 允许Dialog内部的滚动
      const target = e.target as Element;
      if (target && target.closest('[role="dialog"]')) {
        return; // 不阻止Dialog内部的滚动
      }
      
      e.preventDefault();
      e.stopPropagation();
      return false;
    };

    // 🎯 更温和的滚动阻止策略
    const events = ['wheel', 'touchmove'] as const;
    events.forEach(event => {
      document.addEventListener(event, preventScroll, { passive: false });
    });

    // 🧹 清理函数 - 确保完全恢复原始状态
    return () => {
      console.log('🔓 移除优化的滚动锁定 - useDialogScrollLock v2');
      
      // 移除事件监听器
      events.forEach(event => {
        document.removeEventListener(event, preventScroll);
      });

      // 🎯 恢复body样式 - 精确恢复
      Object.entries(originalBodyStyles).forEach(([property, value]) => {
        if (value) {
          (body.style as any)[property] = value;
        } else {
          body.style.removeProperty(property.replace(/([A-Z])/g, '-$1').toLowerCase());
        }
      });
      
      // 🎯 恢复html样式
      Object.entries(originalHtmlStyles).forEach(([property, value]) => {
        if (value) {
          (html.style as any)[property] = value;
        } else {
          html.style.removeProperty(property.replace(/([A-Z])/g, '-$1').toLowerCase());
        }
      });

      // 🎯 确保滚动位置保持不变 - 使用平滑恢复
      if (window.scrollY !== originalScrollY || window.scrollX !== originalScrollX) {
        window.scrollTo({
          top: originalScrollY,
          left: originalScrollX,
          behavior: 'instant' // 立即恢复，避免动画
        });
      }
      
      console.log('✅ 优化的滚动锁定已移除，无闪动恢复:', {
        originalScrollY,
        originalScrollX,
        currentScrollY: window.scrollY,
        currentScrollX: window.scrollX
      });
    };
  }, [open]);
}
