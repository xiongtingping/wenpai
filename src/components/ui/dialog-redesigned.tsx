"use client"

/**
 * 🏛️ Dialog组件重构版本 - 解决设计缺陷
 * 
 * 重构原因：
 * - 修复职责混淆：内容组件不再使用背景遮罩的定位策略
 * - 消除语义冲突：移除矛盾的CSS类组合
 * - 建立清晰架构：背景遮罩 vs 内容容器职责分离
 */

import * as React from "react"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"
import { safeGetDisplayName } from "@/utils/safeDisplayName"

const Dialog = DialogPrimitive.Root
const DialogTrigger = DialogPrimitive.Trigger
const DialogClose = DialogPrimitive.Close

/**
 * 🎯 背景遮罩组件 - 专注全屏覆盖
 * 职责：提供全屏背景遮罩，处理点击外部关闭
 */
const DialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      // ✅ 职责明确：全屏背景遮罩
      "fixed inset-0",                    // 全屏定位
      "bg-foreground/50 backdrop-blur-sm", // 视觉效果
      "data-[state=open]:animate-in",      // 进场动画
      "data-[state=closed]:animate-out",   // 退场动画
      "data-[state=closed]:fade-out-0",    // 淡出
      "data-[state=open]:fade-in-0",       // 淡入
      "z-50",                             // 层级管理
      className
    )}
    {...props}
  />
))
DialogOverlay.displayName = safeGetDisplayName(DialogPrimitive.Overlay, "DialogOverlay")

/**
 * Portal容器 - 处理渲染层级
 */
const DialogPortal = DialogPrimitive.Portal

/**
 * 🎯 内容容器组件 - 专注居中显示
 * 职责：显示居中的内容，处理焦点管理和键盘事件
 */
const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, children, ...props }, ref) => {
  // 🛡️ 设计完整性检查
  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const checkDesignIntegrity = () => {
      const element = ref && 'current' in ref ? ref.current : null;
      if (!element) return;
      
      const computed = window.getComputedStyle(element);
      
      // 检测设计缺陷
      const hasInsetConflict = 
        computed.inset !== 'auto' && 
        (computed.top !== 'auto' || computed.left !== 'auto');
      
      if (hasInsetConflict) {
        console.warn('🚨 Dialog设计缺陷：detecting到inset与top/leftconflict', {
          inset: computed.inset,
          top: computed.top,
          left: computed.left,
          element: element
        });
      }
    };
    
    // 延迟检查，确保样式已应用
    setTimeout(checkDesignIntegrity, 100);
  }, [ref]);

  return (
    <DialogPortal>
      <DialogOverlay />
      <DialogPrimitive.Content
        ref={ref}
        className={cn(
          // ✅ 职责明确：居中内容容器
          "fixed left-1/2 top-1/2",          // 居中定位 (不使用inset!)
          "-translate-x-1/2 -translate-y-1/2", // 精确居中
          "z-50",                             // 层级管理
          "grid max-w-lg gap-4",              // 内容布局 - 移除语义矛盾
          "border bg-background p-6 shadow-lg", // 视觉样式
          "duration-200",                      // 过渡效果
          "data-[state=open]:animate-in",      // 进场动画
          "data-[state=closed]:animate-out",   // 退场动画
          "data-[state=closed]:fade-out-0",    // 淡出
          "data-[state=open]:fade-in-0",       // 淡入
          "data-[state=closed]:zoom-out-95",   // 缩放退场
          "data-[state=open]:zoom-in-95",      // 缩放进场
          "sm:rounded-lg",                     // 响应式圆角
          className
        )}
        {...props}
      >
        {children}
        <DialogPrimitive.Close className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </DialogPrimitive.Close>
      </DialogPrimitive.Content>
    </DialogPortal>
  );
})
DialogContent.displayName = safeGetDisplayName(DialogPrimitive.Content, "DialogContent")

/**
 * Dialog头部组件
 */
const DialogHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col space-y-1.5 text-center sm:text-left",
      className
    )}
    {...props}
  />
)
DialogHeader.displayName = "DialogHeader"

/**
 * Dialog底部组件
 */
const DialogFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
      className
    )}
    {...props}
  />
)
DialogFooter.displayName = "DialogFooter"

/**
 * Dialog标题组件
 */
const DialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn(
      "text-lg font-semibold leading-none tracking-tight",
      className
    )}
    {...props}
  />
))
DialogTitle.displayName = safeGetDisplayName(DialogPrimitive.Title, "DialogTitle")

/**
 * Dialog描述组件
 */
const DialogDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
DialogDescription.displayName = safeGetDisplayName(DialogPrimitive.Description, "DialogDescription")

export {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
  DialogClose,
}