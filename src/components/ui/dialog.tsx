"use client"

import * as React from "react"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { X } from "lucide-react"

import { cn } from "@/lib/utils"

const Dialog = DialogPrimitive.Root

const DialogTrigger = DialogPrimitive.Trigger

const DialogPortal = DialogPrimitive.Portal

const DialogClose = DialogPrimitive.Close

const DialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      "fixed inset-0 z-[999998] bg-foreground/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className
    )}
    style={{
      backdropFilter: 'blur(8px) saturate(120%)',
      WebkitBackdropFilter: 'blur(8px) saturate(120%)'
    }}
    {...props}
  />
))
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName

const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, children, ...props }, ref) => {
  // DEV-only: 调试探针，用于定位对话框内容中的 "undefinedundefined" 来源
  const [localNode, setLocalNode] = React.useState<React.ElementRef<typeof DialogPrimitive.Content> | null>(null)
  const setRefs = React.useCallback(
    (node: React.ElementRef<typeof DialogPrimitive.Content> | null) => {
      setLocalNode(node)
      if (typeof ref === 'function') ref(node)
      else if (ref) (ref as any).current = node
    },
    [ref]
  )

  React.useEffect(() => {
    const root = (localNode as unknown as HTMLElement) || null
    if (!root) return

    // 通用清理：始终在 Dialog 子树内移除 "undefinedundefined"，避免用户看到异常文案
    const sanitize = () => {
      try {
        const re = /undefined\s*undefined/gi
        const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT)
        let n: Node | null
        while ((n = walker.nextNode())) {
          const t = n as Text
          if (t.nodeValue && re.test(t.nodeValue)) {
            t.nodeValue = t.nodeValue.replace(re, '')
          }
        }
      } catch {
        // 忽略DOM操作错误
      }
    }

    // DEV 探针：仅在开发环境输出定位信息，辅助根因排查
    let logs = 0
    const MAX_LOGS = 5
    const probe = () => {
      if (!((import.meta as any)?.env?.DEV)) return
      if (logs >= MAX_LOGS) return
      try {
        const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT)
        let n: Node | null
        while ((n = walker.nextNode())) {
          const t = n as Text
          if (t.nodeValue && t.nodeValue.includes('undefinedundefined')) {
            logs++
            const parent = t.parentElement
            console.warn('🔎 DialogContent Probe: 检测到 undefinedundefined', {
              snippet: t.nodeValue,
              parentTag: parent?.tagName,
              parentClass: parent?.className,
              parentId: parent?.id
            })
            if (logs >= MAX_LOGS) break
          }
        }
      } catch {
        // 忽略探针错误
      }
    }

    // 初次与延迟扫描，兼容动画/延迟渲染
    sanitize(); probe()
    const mo = new MutationObserver(() => { sanitize(); probe() })
    mo.observe(root, { subtree: true, childList: true, characterData: true })
    const t1 = setTimeout(() => { sanitize(); probe() }, 0)
    const t2 = setTimeout(() => { sanitize(); probe() }, 200)
    const t3 = setTimeout(() => { sanitize(); probe() }, 800)

    return () => {
      try { mo.disconnect() } catch {
        // 忽略清理错误
      }
      clearTimeout(t1); clearTimeout(t2); clearTimeout(t3)
    }
  }, [])

  return (
    <DialogPortal>
      <DialogOverlay />
      <DialogPrimitive.Content
        ref={setRefs}
        className={cn(
          "fixed left-[50%] top-[50%] z-[999999] grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background/95 p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg",
          className
        )}
        style={{
          backdropFilter: 'blur(12px) saturate(150%)',
          WebkitBackdropFilter: 'blur(12px) saturate(150%)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.1)'
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
  )
})
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
