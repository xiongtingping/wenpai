import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-e1 hover:shadow-e2 hover:-translate-y-0.5",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-e1 hover:shadow-e2 hover:-translate-y-0.5",
        outline:
          "border border-input bg-background hover:bg-accent hover:text-accent-foreground shadow-e0 hover:shadow-e1 hover:-translate-y-0.5",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80 shadow-e1 hover:shadow-e2 hover:-translate-y-0.5",
        ghost: "hover:bg-accent hover:text-accent-foreground hover:-translate-y-0.5",
        link: "text-primary underline-offset-4 hover:underline hover:-translate-y-0.5",

        // 🎨 Modern Flat + Soft Neumorphism 新增变体
        soft: "bg-gradient-to-b from-white to-gray-50 border border-gray-200 text-gray-700 shadow-e0 hover:shadow-e1 hover:-translate-y-0.5 [box-shadow:inset_0_1px_0_rgba(255,255,255,0.9)] hover:[box-shadow:var(--shadow-e1),inset_0_1px_0_rgba(255,255,255,0.9)]",
        neumorph: "bg-gradient-to-b from-gray-50 to-gray-100 border border-gray-200 text-gray-700 shadow-e0 hover:shadow-e1 hover:-translate-y-0.5 [box-shadow:inset_0_2px_4px_rgba(0,0,0,0.04),inset_0_1px_0_rgba(255,255,255,0.9)] active:[box-shadow:inset_0_3px_6px_rgba(0,0,0,0.08)]",

        // 统一渐变变体
        gradient: "bg-gradient-to-r from-indigo-600 to-purple-600 text-white border-0 shadow-e1 hover:shadow-glow hover:-translate-y-0.5 hover:from-indigo-700 hover:to-purple-700",
        gradientSecondary: "bg-gradient-to-r from-cyan-500 to-teal-600 text-white border-0 shadow-e1 hover:shadow-glow-secondary hover:-translate-y-0.5 hover:from-cyan-600 hover:to-teal-700",
        gradientAccent: "bg-gradient-to-r from-amber-500 to-orange-600 text-white border-0 shadow-e1 hover:shadow-glow-accent hover:-translate-y-0.5 hover:from-amber-600 hover:to-orange-700",
        gradientSuccess: "bg-gradient-to-r from-emerald-500 to-green-600 text-white border-0 shadow-e1 hover:shadow-glow hover:-translate-y-0.5 hover:from-emerald-600 hover:to-green-700",
        gradientDanger: "bg-gradient-to-r from-red-500 to-rose-600 text-white border-0 shadow-e1 hover:shadow-glow hover:-translate-y-0.5 hover:from-red-600 hover:to-rose-700",

        // 保留原有变体（向后兼容）
        gradientGreen: "bg-gradient-to-r from-green-500 to-emerald-600 text-white border-0 shadow-e1 hover:shadow-glow hover:-translate-y-0.5 hover:from-green-600 hover:to-emerald-700",
        gradientOrange: "bg-gradient-to-r from-orange-500 to-red-600 text-white border-0 shadow-e1 hover:shadow-glow hover:-translate-y-0.5 hover:from-orange-600 hover:to-red-700",
        glass: "bg-white/20 backdrop-blur-md border border-white/30 text-white hover:bg-white/30 shadow-e1 hover:shadow-e2 hover:-translate-y-0.5",
        premium: "bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-0 shadow-e1 hover:shadow-glow hover:-translate-y-0.5 hover:from-yellow-500 hover:to-orange-600 animate-pulse",
        success: "bg-gradient-to-r from-green-500 to-emerald-600 text-white border-0 shadow-e1 hover:shadow-glow hover:-translate-y-0.5 hover:from-green-600 hover:to-emerald-700",
        warning: "bg-gradient-to-r from-yellow-500 to-orange-600 text-white border-0 shadow-e1 hover:shadow-glow hover:-translate-y-0.5 hover:from-yellow-600 hover:to-orange-700",
        info: "bg-gradient-to-r from-blue-500 to-cyan-600 text-white border-0 shadow-e1 hover:shadow-glow hover:-translate-y-0.5 hover:from-blue-600 hover:to-cyan-700",
        neon: "bg-transparent border-2 border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white shadow-e1 hover:shadow-glow hover:-translate-y-0.5",
        neonPurple: "bg-transparent border-2 border-purple-500 text-purple-500 hover:bg-purple-500 hover:text-white shadow-e1 hover:shadow-glow hover:-translate-y-0.5",
        neonGreen: "bg-transparent border-2 border-green-500 text-green-500 hover:bg-green-500 hover:text-white shadow-e1 hover:shadow-glow hover:-translate-y-0.5",
        dark: "bg-gray-900 text-white hover:bg-gray-800 shadow-e1 hover:shadow-e2 hover:-translate-y-0.5",
        light: "bg-gray-100 text-gray-900 hover:bg-gray-200 shadow-e0 hover:shadow-e1 hover:-translate-y-0.5",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        xl: "h-12 rounded-md px-10 text-base",
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
