import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"
import { Slot } from "@/components/ui/safe-slot"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        // Tubelight 风格
        tubelight: "bg-background/5 border border-border backdrop-blur-lg text-foreground/90 hover:text-primary rounded-full px-6 py-2 shadow-lg hover:bg-primary/5 transition-colors",
        default: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-e1 hover:shadow-e2 hover:-translate-y-0.5",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-e1 hover:shadow-e2 hover:-translate-y-0.5",
        outline:
          "border border-input bg-background hover:bg-accent hover:text-accent-foreground shadow-e0 hover:shadow-e1 hover:-translate-y-0.5",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80 shadow-e1 hover:shadow-e2 hover:-translate-y-0.5",
        ghost: "hover:bg-accent hover:text-accent-foreground hover:-translate-y-0.5",
        link: "text-primary underline-offset-4 hover:underline hover:-translate-y-0.5",

        // 🎨 Modern Flat + Soft Neumorphism 新增变体（令牌化）
        soft: "bg-card border border-border text-foreground shadow-e0 hover:shadow-e1 hover:-translate-y-0.5 hover:bg-accent",
        neumorph: "bg-card border border-border text-foreground shadow-e0 hover:shadow-e1 hover:-translate-y-0.5 [box-shadow:inset_0_2px_4px_hsl(var(--foreground) / 0.04)] active:[box-shadow:inset_0_3px_6px_hsl(var(--foreground) / 0.08)]",

        // 统一渐变变体（改为简洁样式）
        gradient: "bg-primary text-primary-foreground shadow-sm hover:bg-primary/90 hover:-translate-y-0.5",
        gradientSecondary: "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/90 hover:-translate-y-0.5",
        gradientAccent: "bg-accent text-accent-foreground shadow-sm hover:bg-accent/90 hover:-translate-y-0.5",
        gradientSuccess: "gradient-bg-success text-primary-foreground shadow-e1 hover:shadow-glow hover:-translate-y-0.5",
        gradientDanger: "gradient-bg-danger text-primary-foreground shadow-e1 hover:shadow-glow hover:-translate-y-0.5",

        // 保留原有变体名（令牌化实现）
        gradientGreen: "gradient-bg-success text-primary-foreground shadow-e1 hover:shadow-glow hover:-translate-y-0.5",
        gradientOrange: "gradient-bg-warning text-primary-foreground shadow-e1 hover:shadow-glow-accent hover:-translate-y-0.5",
        glass: "bg-background/20 backdrop-blur-md border border-border/30 text-foreground hover:bg-background/30 shadow-e1 hover:shadow-e2 hover:-translate-y-0.5",
        premium: "bg-primary text-primary-foreground shadow-sm hover:bg-primary/90 hover:-translate-y-0.5 animate-pulse",
        success: "gradient-bg-success text-primary-foreground shadow-e1 hover:shadow-glow hover:-translate-y-0.5",
        warning: "gradient-bg-warning text-primary-foreground shadow-e1 hover:shadow-glow-accent hover:-translate-y-0.5",
        info: "bg-primary/90 text-primary-foreground border-0 shadow-e1 hover:shadow-glow hover:-translate-y-0.5",
        neon: "bg-transparent border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground shadow-e1 hover:shadow-glow hover:-translate-y-0.5",
        neonPurple: "bg-transparent border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground shadow-e1 hover:shadow-glow hover:-translate-y-0.5",
        neonGreen: "bg-transparent border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground shadow-e1 hover:shadow-glow hover:-translate-y-0.5",
        dark: "bg-foreground text-primary-foreground hover:bg-foreground/90 shadow-e1 hover:shadow-e2 hover:-translate-y-0.5",
        light: "bg-muted text-foreground hover:bg-muted/80 shadow-e0 hover:shadow-e1 hover:-translate-y-0.5",

        // 🎨 专用高级按钮变体
        upgradePremium: "btn-upgrade-premium text-white font-bold",
        invitePremium: "btn-invite-premium text-white font-bold",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        xl: "h-12 rounded-md px-10 text-base",
        hero: "h-14 rounded-xl px-8 text-lg font-bold",
        icon: "h-10 w-10",
        iconSm: "h-8 w-8",
        iconLg: "h-12 w-12",
        full: "h-10 w-full px-4 py-2",
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
      variant: "tubelight",
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
