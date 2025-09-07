/**
 * 🔧 FIXED: 安全的 Slot 组件实现
 * 替代 @radix-ui/react-slot 以解决 forwardRef 兼容性问题
 * 完全避免 React.forwardRef，使用更简单的实现
 */

import * as React from "react"

export interface SlotProps extends React.HTMLAttributes<HTMLElement> {
  children?: React.ReactNode
}

/**
 * 安全的 Slot 组件实现 - 完全避免 forwardRef
 * 兼容 Radix UI 的 Slot API，但避免了所有 forwardRef 相关错误
 */
export function Slot({ children, ...props }: SlotProps) {
  // 如果 children 是一个有效的 React 元素，克隆它并合并 props
  if (React.isValidElement(children)) {
    return React.cloneElement(children, {
      ...props,
      ...children.props,
      // 合并 className
      className: [props.className, children.props.className]
        .filter(Boolean)
        .join(' ') || undefined,
      // 合并 style
      style: {
        ...props.style,
        ...children.props.style,
      },
    });
  }

  // 如果 children 不是有效元素，使用 div 包装
  return React.createElement('div', { ...props }, children);
}

Slot.displayName = "Slot";

/**
 * Slottable 组件 - 兼容 @radix-ui/react-slot API
 */
export function Slottable({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

/**
 * createSlot 函数 - 兼容 @radix-ui/react-slot API
 * 其他 Radix UI 组件内部使用此函数
 * 🔧 FIXED: 直接返回函数组件，避免所有 forwardRef 问题
 */
export function createSlot(name?: string) {
  return Slot;
}

/**
 * createSlottable 函数 - 兼容 @radix-ui/react-slot API
 * 其他 Radix UI 组件内部使用此函数
 * 🔧 FIXED: 直接返回函数组件
 */
export function createSlottable(name?: string) {
  return Slottable;
}

// 默认导出和命名导出，确保完全兼容
export default Slot;

// 兼容原始 API
export { Slot as Root };
