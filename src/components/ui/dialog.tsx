"use client"

import * as React from "react"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { X } from "lucide-react"

import { cn } from "@/lib/utils"
import { DialogPortal } from "./dialog-portal"

const Dialog = DialogPrimitive.Root
const DialogTrigger = DialogPrimitive.Trigger
const DialogClose = DialogPrimitive.Close

const DialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, style, ...props }, ref) => {
  // 🎯 背景遮罩层JavaScript运行时修复器
  React.useEffect(() => {
    const fixOverlaySize = () => {
      try {
        // 查找所有可能的背景遮罩层元素
        const overlaySelectors = [
          '.dialog-background-overlay',
          '.dialog-overlay-fullscreen',
          '[data-state="open"][class*="fixed"][class*="bg-foreground"]',
          '[data-state="open"][class*="backdrop-blur"]',
          'div[data-aria-hidden="true"][data-state="open"]'
        ];

        overlaySelectors.forEach(selector => {
          const overlays = document.querySelectorAll(selector);
          overlays.forEach((overlay: Element) => {
            const htmlOverlay = overlay as HTMLElement;
            
            // 🔥 获取实际窗口尺寸，而不依赖vh/vw单位
            const windowWidth = window.innerWidth;
            const windowHeight = window.innerHeight;
            const documentHeight = Math.max(
              document.body.scrollHeight,
              document.body.offsetHeight,
              document.documentElement.clientHeight,
              document.documentElement.scrollHeight,
              document.documentElement.offsetHeight,
              windowHeight
            );
            
            // 🚨 使用实际像素值强制设置背景层尺寸
            htmlOverlay.style.setProperty('position', 'fixed', 'important');
            htmlOverlay.style.setProperty('top', '0px', 'important');
            htmlOverlay.style.setProperty('left', '0px', 'important');
            htmlOverlay.style.setProperty('right', '0px', 'important');
            htmlOverlay.style.setProperty('bottom', '0px', 'important');
            htmlOverlay.style.setProperty('width', `${windowWidth}px`, 'important');
            htmlOverlay.style.setProperty('height', `${windowHeight}px`, 'important');
            htmlOverlay.style.setProperty('min-width', `${windowWidth}px`, 'important');
            htmlOverlay.style.setProperty('min-height', `${windowHeight}px`, 'important');
            htmlOverlay.style.setProperty('max-width', `${windowWidth}px`, 'important');
            htmlOverlay.style.setProperty('max-height', `${windowHeight}px`, 'important');
            htmlOverlay.style.setProperty('margin', '0px', 'important');
            htmlOverlay.style.setProperty('padding', '0px', 'important');
            htmlOverlay.style.setProperty('border', 'none', 'important');
            htmlOverlay.style.setProperty('transform', 'none', 'important');
            htmlOverlay.style.setProperty('z-index', '1045', 'important');
            
            // 🚨 额外保险：使用inset覆盖
            htmlOverlay.style.setProperty('inset', '0px', 'important');
            
            // 🚨 强制重绘
            htmlOverlay.style.setProperty('will-change', 'auto');
            htmlOverlay.offsetHeight; // 强制重排
            
            console.log(`🎯 背景遮罩层JavaScript修复已应用 ${selector}: ${windowWidth}x${windowHeight}px`);
          });
        });
      } catch (error) {
        console.warn('⚠️ 背景遮罩层修复器失败:', error);
      }
    };

    // 立即执行一次
    fixOverlaySize();
    
    // 延迟执行多次确保修复生效
    setTimeout(fixOverlaySize, 50);
    setTimeout(fixOverlaySize, 150);
    setTimeout(fixOverlaySize, 300);
    setTimeout(fixOverlaySize, 500);
    setTimeout(fixOverlaySize, 1000);
    
    // 监听窗口大小变化
    const handleResize = () => {
      setTimeout(fixOverlaySize, 100);
    };
    
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <DialogPrimitive.Overlay
      ref={ref}
      className={cn(
        "fixed inset-0 bg-foreground/50 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 dialog-overlay-fullscreen dialog-background-overlay",
        className
      )}
      style={{
        ...style,
        // 🎯 使用实际窗口尺寸而非vh/vw单位
        position: 'fixed',
        top: '0px',
        left: '0px',
        right: '0px',
        bottom: '0px',
        width: `${typeof window !== 'undefined' ? window.innerWidth : 1920}px`,
        height: `${typeof window !== 'undefined' ? window.innerHeight : 1080}px`,
        minWidth: `${typeof window !== 'undefined' ? window.innerWidth : 1920}px`,
        minHeight: `${typeof window !== 'undefined' ? window.innerHeight : 1080}px`,
        zIndex: 1045,
        backgroundColor: 'hsl(var(--foreground) / 0.5)',
        backdropFilter: 'blur(var(--spacing-1))',
        opacity: 1,
        margin: '0px',
        padding: '0px',
        inset: '0px'
      }}
      {...props}
    />
  );
})
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName

const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, style, children, ...props }, ref) => (
  <DialogPortal>
    <DialogOverlay />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        // 🎯 修复定位：确保Dialog正确居中显示 - 移除语义矛盾
        "fixed grid max-w-lg gap-4 border bg-background p-6 shadow-lg duration-200",
        "data-[state=open]:animate-in data-[state=closed]:animate-out",
        "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
        "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
        // 🚨 移除导致定位错误的slide动画类
        // "data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%]",
        // "data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]",
        "sm:rounded-lg",
        className
      )}
      style={{
        ...style,
        // 🎯 关键修复：确保Dialog居中显示在视口中 - 放在最后确保优先级
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 1055,

        // 🎯 重置可能影响定位的属性
        contain: 'none',
        isolation: 'auto',
        clipPath: 'none',
        filter: 'none',
        margin: 0,
        padding: 'var(--spacing-6)',

        // 🎯 强制重置所有可能的定位干扰
        translate: 'none',
        rotate: 'none',
        scale: 'none',
        // 🚨 完全移除inset相关属性，避免干扰top/left
        inset: 'unset',
        insetBlock: 'unset',
        insetInline: 'unset',

        // 🎯 确保可见性
        display: 'flex',
        visibility: 'visible',
        opacity: 1,
        pointerEvents: 'auto'
      }}
      {...props}
    >
      {children}
      <DialogPrimitive.Close className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
        <X className="h-4 w-4" />
        <span className="sr-only">Close</span>
      </DialogPrimitive.Close>
    </DialogPrimitive.Content>
  </DialogPortal>
))
DialogContent.displayName = DialogPrimitive.Content.displayName

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
DialogTitle.displayName = DialogPrimitive.Title.displayName

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
DialogDescription.displayName = DialogPrimitive.Description.displayName

export {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogTrigger,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
}
