/**
 * Dialog组件严格类型约束
 * 防止Dialog定位问题复发的类型安全保障
 */

import { ReactNode, CSSProperties } from 'react';

// 🚫 禁止的样式属性类型
type ProhibitedStyleProps = 
  | 'position' 
  | 'top' 
  | 'left' 
  | 'right' 
  | 'bottom' 
  | 'transform' 
  | 'translate' 
  | 'zIndex'
  | 'inset'
  | 'margin';

// ✅ 允许的样式属性类型（排除定位相关）
type AllowedStyleProps = Omit<CSSProperties, ProhibitedStyleProps>;

// 🎯 设计令牌类型定义
export type DesignToken = `var(--${string})`;

// 🎯 Dialog尺寸变体
export type DialogSize = 'small' | 'medium' | 'large' | 'fullscreen';

// 🎯 Dialog样式变体
export type DialogVariant = 'default' | 'elevated' | 'minimal';

// 🎯 Dialog动画变体
export type DialogAnimation = 'fade' | 'scale' | 'slide' | 'none';

// 🎯 Dialog位置策略（仅限预定义值）
export type DialogPositionStrategy = 'center' | 'top' | 'bottom';

// 🎯 严格的Dialog Props类型
export interface StrictDialogProps {
  // 基础属性
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: ReactNode;
  
  // 样式变体（仅限预定义值）
  size?: DialogSize;
  variant?: DialogVariant;
  animation?: DialogAnimation;
  position?: DialogPositionStrategy;
  
  // CSS类名（推荐使用）
  className?: string;
  overlayClassName?: string;
  
  // 🚫 严格限制的样式属性（仅允许非定位样式）
  style?: AllowedStyleProps;
  overlayStyle?: AllowedStyleProps;
  
  // 容器和行为
  container?: HTMLElement;
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
  preventScroll?: boolean;
  
  // 无障碍属性
  'aria-label'?: string;
  'aria-labelledby'?: string;
  'aria-describedby'?: string;
  role?: 'dialog' | 'alertdialog';
  
  // 事件处理
  onAnimationEnd?: () => void;
  onFocus?: () => void;
  onBlur?: () => void;
}

// 🎯 Dialog内容区域Props类型
export interface DialogContentProps {
  children: ReactNode;
  className?: string;
  style?: AllowedStyleProps;
}

// 🎯 Dialog头部Props类型
export interface DialogHeaderProps {
  title?: string;
  description?: string;
  showCloseButton?: boolean;
  onClose?: () => void;
  className?: string;
  titleClassName?: string;
  descriptionClassName?: string;
}

// 🎯 Dialog底部Props类型
export interface DialogFooterProps {
  children: ReactNode;
  className?: string;
  align?: 'left' | 'center' | 'right';
}

// 🎯 Dialog配置类型
export interface DialogConfig {
  // 默认设置
  defaultSize: DialogSize;
  defaultVariant: DialogVariant;
  defaultAnimation: DialogAnimation;
  
  // 行为设置
  closeOnOverlayClick: boolean;
  closeOnEscape: boolean;
  preventScroll: boolean;
  
  // 样式设置
  useDesignTokens: boolean;
  enforcePositioning: boolean;
  
  // 调试设置
  enableDebugMode: boolean;
  logPositionChanges: boolean;
}

// 🎯 Dialog状态类型
export interface DialogState {
  isOpen: boolean;
  isAnimating: boolean;
  position: {
    x: number;
    y: number;
  };
  size: {
    width: number;
    height: number;
  };
  zIndex: number;
}

// 🎯 Dialog上下文类型
export interface DialogContextValue {
  config: DialogConfig;
  state: DialogState;
  actions: {
    open: () => void;
    close: () => void;
    updatePosition: (x: number, y: number) => void;
    updateSize: (width: number, height: number) => void;
  };
}

// 🎯 Dialog Hook返回类型
export interface UseDialogReturn {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
  dialogProps: Pick<StrictDialogProps, 'open' | 'onOpenChange'>;
}

// 🎯 Dialog定位验证类型
export interface DialogPositionValidation {
  isCorrectlyCentered: boolean;
  actualPosition: { x: number; y: number };
  expectedPosition: { x: number; y: number };
  deviation: { x: number; y: number };
  isWithinTolerance: boolean;
  tolerance: number;
}

// 🎯 Dialog样式验证类型
export interface DialogStyleValidation {
  hasCorrectPosition: boolean;
  hasCorrectZIndex: boolean;
  hasCorrectTransform: boolean;
  usesDesignTokens: boolean;
  hasConflictingStyles: boolean;
  conflictingProperties: string[];
}

// 🎯 类型守卫函数
export function isValidDialogSize(size: unknown): size is DialogSize {
  return typeof size === 'string' && ['small', 'medium', 'large', 'fullscreen'].includes(size);
}

export function isValidDialogVariant(variant: unknown): variant is DialogVariant {
  return typeof variant === 'string' && ['default', 'elevated', 'minimal'].includes(variant);
}

export function isValidDialogAnimation(animation: unknown): animation is DialogAnimation {
  return typeof animation === 'string' && ['fade', 'scale', 'slide', 'none'].includes(animation);
}

// 🎯 样式属性验证函数
export function validateDialogStyle(style: CSSProperties): {
  isValid: boolean;
  prohibitedProperties: string[];
  suggestions: string[];
} {
  const prohibitedProps: (keyof CSSProperties)[] = [
    'position', 'top', 'left', 'right', 'bottom', 
    'transform', 'translate', 'zIndex', 'inset', 'margin'
  ];
  
  const foundProhibited = prohibitedProps.filter(prop => prop in style);
  
  const suggestions = foundProhibited.map(prop => {
    switch (prop) {
      case 'position':
        return '使用CSS类 .unified-dialog 替代内联position';
      case 'top':
      case 'left':
        return '使用设计令牌 var(--dialog-center-x) 和 var(--dialog-center-y)';
      case 'transform':
        return '使用设计令牌 var(--dialog-transform)';
      case 'zIndex':
        return '使用设计令牌 var(--dialog-z-index)';
      default:
        return `移除 ${prop} 属性，使用CSS类或设计令牌`;
    }
  });
  
  return {
    isValid: foundProhibited.length === 0,
    prohibitedProperties: foundProhibited,
    suggestions
  };
}

// 🎯 Dialog组件工厂类型
export interface DialogComponentFactory {
  createDialog: (props: StrictDialogProps) => JSX.Element;
  createQuickReference: (props: Omit<StrictDialogProps, 'children'>) => JSX.Element;
  createConfirmation: (props: Omit<StrictDialogProps, 'children'> & {
    title: string;
    message: string;
    onConfirm: () => void;
    onCancel: () => void;
  }) => JSX.Element;
}

// 🎯 导出所有类型
export type {
  AllowedStyleProps,
  ProhibitedStyleProps,
  StrictDialogProps as DialogProps,
};
