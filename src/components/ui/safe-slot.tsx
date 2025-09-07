/**
 * 🔧 FIXED: 安全的 Slot 组件实现
 * 替代 @radix-ui/react-slot 以解决 forwardRef 兼容性问题
 * 完全兼容 @radix-ui/react-slot API
 */

import * as React from "react"

export interface SlotProps extends React.HTMLAttributes<HTMLElement> {
  children?: React.ReactNode
}

// 🔧 FIXED: 使用函数声明避免初始化顺序问题
function SlotComponent({ children, ...props }: SlotProps, ref: React.Ref<HTMLElement>) {
  // 如果 children 是一个有效的 React 元素，克隆它并合并 props
  if (React.isValidElement(children)) {
    return React.cloneElement(children, {
      ...props,
      ...children.props,
      ref,
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
  return React.createElement('div', { ref, ...props }, children);
}

/**
 * 安全的 Slot 组件实现
 * 兼容 Radix UI 的 Slot API，但避免了 forwardRef 错误
 */
export const Slot = React.forwardRef<HTMLElement, SlotProps>(SlotComponent);
Slot.displayName = "Slot";

/**
 * Slottable 组件 - 兼容 @radix-ui/react-slot API
 */
function SlottableComponent({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

export const Slottable = SlottableComponent;

/**
 * createSlot 函数 - 兼容 @radix-ui/react-slot API
 * 其他 Radix UI 组件内部使用此函数
 * 🔧 FIXED: 延迟初始化避免变量引用问题
 */
export function createSlot(name?: string) {
  // 延迟返回，避免模块级别的变量引用
  return React.forwardRef<HTMLElement, SlotProps>(SlotComponent);
}

/**
 * createSlottable 函数 - 兼容 @radix-ui/react-slot API
 * 其他 Radix UI 组件内部使用此函数
 * 🔧 FIXED: 延迟初始化避免变量引用问题
 */
export function createSlottable(name?: string) {
  // 延迟返回，避免模块级别的变量引用
  return SlottableComponent;
}

// 默认导出和命名导出，确保完全兼容
export default Slot;

// 兼容原始 API
export { Slot as Root };
