/**
 * 🔧 FIXED: 安全的 Slot 组件实现
 * 替代 @radix-ui/react-slot 以解决 forwardRef 兼容性问题
 */

import * as React from "react"

export interface SlotProps extends React.HTMLAttributes<HTMLElement> {
  children?: React.ReactNode
}

/**
 * 安全的 Slot 组件实现
 * 兼容 Radix UI 的 Slot API，但避免了 forwardRef 错误
 */
export const Slot = React.forwardRef<HTMLElement, SlotProps>(
  ({ children, ...props }, ref) => {
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
);

Slot.displayName = "Slot";

export default Slot;
