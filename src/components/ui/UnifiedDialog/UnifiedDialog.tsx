/**
 * 统一Dialog基础组件
 * 解决Dialog定位问题的根本性方案
 * 
 * 设计原则：
 * 1. 统一样式系统：仅使用设计令牌，禁止硬编码
 * 2. 强制居中定位：确保在所有情况下都正确居中
 * 3. 多重保护机制：CSS + JavaScript双重保护
 * 4. 类型安全：严格的TypeScript类型约束
 */

import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';

// Dialog变体定义
const dialogVariants = cva(
  // 基础样式：使用设计令牌，确保强制居中
  [
    'unified-dialog',
    'fixed',
    'z-[1100]',
    'flex',
    'flex-col',
    'bg-background',
    'border',
    'border-border',
    'shadow-dialog',
    'focus:outline-none',
    'focus-visible:ring-2',
    'focus-visible:ring-ring',
    'focus-visible:ring-offset-2'
  ],
  {
    variants: {
      size: {
        small: [
          'max-w-sm',
          'max-h-[60vh]',
          'min-w-[320px]',
          'min-h-[200px]'
        ],
        medium: [
          'max-w-lg',
          'max-h-[70vh]',
          'min-w-[400px]',
          'min-h-[250px]'
        ],
        large: [
          'max-w-4xl',
          'max-h-[85vh]',
          'min-w-[600px]',
          'min-h-[400px]'
        ],
        xlarge: [
          'max-w-6xl',
          'max-h-[88vh]',
          'min-w-[800px]',
          'min-h-[420px]'
        ],
        fullscreen: [
          'max-w-[95vw]',
          'max-h-[95vh]',
          'min-w-[90vw]',
          'min-h-[90vh]'
        ]
      },
      variant: {
        default: [
          'rounded-lg',
          'p-6'
        ],
        elevated: [
          'rounded-xl',
          'p-8',
          'shadow-2xl'
        ],
        minimal: [
          'rounded-md',
          'p-4',
          'shadow-sm'
        ]
      },
      animation: {
        fade: [
          'animate-in',
          'fade-in-0',
          'duration-200'
        ],
        scale: [
          'animate-in',
          'fade-in-0',
          'zoom-in-95',
          'duration-200'
        ],
        slide: [
          'animate-in',
          'fade-in-0',
          'slide-in-from-bottom-4',
          'duration-300'
        ]
      }
    },
    defaultVariants: {
      size: 'medium',
      variant: 'default',
      animation: 'scale'
    }
  }
);

// Overlay变体定义
const overlayVariants = cva(
  [
    'unified-dialog-overlay',
    'fixed',
    'inset-0',
    'z-[1080]',
    'bg-foreground/50',
    'animate-in',
    'fade-in-0',
    'duration-200'
  ]
);

export interface UnifiedDialogProps extends VariantProps<typeof dialogVariants> {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
  className?: string;
  overlayClassName?: string;
  container?: HTMLElement;
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
  preventScroll?: boolean;
  'aria-label'?: string;
  'aria-labelledby'?: string;
  'aria-describedby'?: string;
}

export function UnifiedDialog({
  open,
  onOpenChange,
  children,
  size,
  variant,
  animation,
  className,
  overlayClassName,
  container,
  closeOnOverlayClick = true,
  closeOnEscape = true,
  preventScroll = true,
  ...ariaProps
}: UnifiedDialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  // 🎯 强制定位修复器 - 确保Dialog始终正确居中
  useEffect(() => {
    if (!open || !dialogRef.current) return;

    const applyForcedPositioning = () => {
      const dialog = dialogRef.current;
      if (!dialog) return;

      // 清除可能冲突的样式
      dialog.style.removeProperty('top');
      dialog.style.removeProperty('left');
      dialog.style.removeProperty('transform');
      dialog.style.removeProperty('translate');
      dialog.style.removeProperty('inset');

      // 强制应用正确的居中定位
      dialog.style.setProperty('position', 'fixed', 'important');
      dialog.style.setProperty('top', '50%', 'important');
      dialog.style.setProperty('left', '50%', 'important');
      dialog.style.setProperty('transform', 'translate(-50%, -50%)', 'important');
      dialog.style.setProperty('z-index', '1100', 'important');
      dialog.style.setProperty('margin', '0', 'important');

      console.log('🎯 UnifiedDialog定位fixingalready应用');
    };

    // 多时机执行修复，确保在各种情况下都能生效
    applyForcedPositioning();
    const timeouts = [
      setTimeout(applyForcedPositioning, 50),
      setTimeout(applyForcedPositioning, 150),
      setTimeout(applyForcedPositioning, 300)
    ];

    return () => {
      timeouts.forEach(clearTimeout);
    };
  }, [open]);

  // 键盘事件处理
  useEffect(() => {
    if (!open || !closeOnEscape) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onOpenChange(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [open, closeOnEscape, onOpenChange]);

  // 滚动锁定
  useEffect(() => {
    if (!open || !preventScroll) return;

    const originalStyle = window.getComputedStyle(document.body).overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = originalStyle;
    };
  }, [open, preventScroll]);

  // 焦点管理
  useEffect(() => {
    if (!open || !dialogRef.current) return;

    const dialog = dialogRef.current;
    const previousActiveElement = document.activeElement as HTMLElement;

    // 聚焦到Dialog
    dialog.focus();

    return () => {
      // 恢复焦点
      if (previousActiveElement && previousActiveElement.focus) {
        previousActiveElement.focus();
      }
    };
  }, [open]);

  if (!open) return null;

  const dialogContent = (
    <>
      {/* Overlay */}
      <div
        ref={overlayRef}
        className={cn(overlayVariants(), overlayClassName)}
        onClick={closeOnOverlayClick ? () => onOpenChange(false) : undefined}
        aria-hidden="true"
      />
      
      {/* Dialog */}
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        tabIndex={-1}
        className={cn(
          dialogVariants({ size, variant, animation }),
          className
        )}
        onClick={(e) => e.stopPropagation()}
        {...ariaProps}
      >
        {children}
      </div>
    </>
  );

  // 渲染到指定容器或默认Portal
  const portalContainer = container || document.body;
  return createPortal(dialogContent, portalContainer);
}

// 导出类型
export type { VariantProps };
export { dialogVariants, overlayVariants };
