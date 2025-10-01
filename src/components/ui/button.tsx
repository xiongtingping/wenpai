import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"
import { Slot } from "@radix-ui/react-slot"

const buttonVariants = cva(
  "btn", // 使用统一设计系统的基础样式
  {
    variants: {
      variant: {
        // 🎯 统一设计系统按钮变体（与CSS文件一致）
        default: "btn-primary", // 对应 .btn-primary
        primary: "btn-primary",
        secondary: "btn-secondary", // 对应 .btn-secondary
        outline: "btn-outline", // 对应 .btn-outline
        ghost: "btn-ghost", // 对应 .btn-ghost
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        link: "text-primary underline-offset-4 hover:underline",
        
        // 🎨 保留关键特殊变体
        success: "bg-[var(--color-success)] text-[var(--color-primary-foreground)] hover:brightness-110",
        warning: "bg-[var(--color-warning)] text-[var(--color-primary-foreground)] hover:brightness-110",
        info: "bg-[var(--color-info)] text-[var(--color-primary-foreground)] hover:brightness-110",
        soft: "bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-foreground)] hover:bg-[var(--color-accent)]",
      },
      size: {
        // 🎯 对应统一设计系统的尺寸（与CSS变量一致）
        sm: "btn-sm", // 对应 .btn-sm
        default: "btn-md", // 对应 .btn-md
        lg: "btn-lg", // 对应 .btn-lg
        icon: "h-[var(--size-md)] w-[var(--size-md)] p-0",
        iconSm: "h-[var(--size-sm)] w-[var(--size-sm)] p-0",
        iconLg: "h-[var(--size-lg)] w-[var(--size-lg)] p-0",
        full: "btn-md w-full",
      },
      animation: {
        none: "",
        bounce: "animate-bounce",
        pulse: "animate-pulse",
        spin: "animate-spin",
        ping: "animate-ping",
        float: "animate-float",
        glow: "animate-glow",
        wave: "animate-wave",
        slideUp: "animate-slideUp",
        slideDown: "animate-slideDown",
        zoomIn: "animate-zoomIn",
        rotateIn: "animate-rotateIn",
        bounceIn: "animate-bounceIn",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      animation: "none",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  loading?: boolean
  icon?: React.ReactNode
  iconPosition?: "left" | "right"
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, animation, asChild = false, loading = false, icon, iconPosition = "left", children, disabled, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, animation, className }))}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
        )}
        {icon && iconPosition === "left" && !loading && (
          <span className="mr-2">{icon}</span>
        )}
        {children}
        {icon && iconPosition === "right" && !loading && (
          <span className="ml-2">{icon}</span>
        )}
      </Comp>
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
