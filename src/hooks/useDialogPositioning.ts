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
   * 应用Dialog定位修复
   */
  const applyDialogPositioning = useCallback((dialogElement: HTMLElement): void => {
    try {
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

      // 应用设计令牌定位
      dialogElement.style.setProperty('position', 'fixed', 'important');
      dialogElement.style.setProperty('top', 'var(--dialog-position-top, 50vh)', 'important');
      dialogElement.style.setProperty('left', 'var(--dialog-position-left, 50vw)', 'important');
      dialogElement.style.setProperty('transform', 'var(--dialog-transform, translate(-50%, -50%))', 'important');
      dialogElement.style.setProperty('z-index', 'var(--dialog-z-index, 1055)', 'important');
      dialogElement.style.setProperty('margin', '0', 'important');

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
