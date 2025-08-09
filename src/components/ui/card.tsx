import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const cardVariants = cva(
  "rounded-lg border bg-card text-card-foreground shadow-sm transition-all duration-300",
  {
    variants: {
      variant: {
        default: "border-border bg-card shadow-e0",
        elevated: "border-border bg-card shadow-e1 hover:shadow-e2 hover:-translate-y-0.5",
        outlined: "border-2 border-border bg-transparent",

        // 🎨 Modern Flat + Soft Neumorphism 新增变体
        soft: "border border-gray-200 bg-gradient-to-b from-white to-gray-50 shadow-e1 hover:shadow-e2 hover:-translate-y-0.5 [box-shadow:var(--shadow-e1),inset_0_1px_0_rgba(255,255,255,0.9)] hover:[box-shadow:var(--shadow-e2),inset_0_1px_0_rgba(255,255,255,0.9)]",
        neumorph: "border border-gray-200 bg-gradient-to-b from-gray-50 to-gray-100 shadow-e1 hover:shadow-e2 hover:-translate-y-0.5 [box-shadow:var(--shadow-e1),inset_0_2px_4px_rgba(0,0,0,0.04),inset_0_1px_0_rgba(255,255,255,0.9)]",

        // 统一渐变变体
        gradient: "border-0 bg-gradient-to-br from-indigo-50 to-purple-50 shadow-e1 hover:shadow-e2 hover:-translate-y-0.5",
        gradientSecondary: "border-0 bg-gradient-to-br from-cyan-50 to-teal-50 shadow-e1 hover:shadow-e2 hover:-translate-y-0.5",
        gradientAccent: "border-0 bg-gradient-to-br from-amber-50 to-orange-50 shadow-e1 hover:shadow-e2 hover:-translate-y-0.5",

        // 玻璃效果变体
        glass: "border border-white/20 bg-white/10 backdrop-blur-md shadow-e1 hover:shadow-e2 hover:-translate-y-0.5",
        glassBlue: "border border-blue-500/20 bg-blue-500/5 backdrop-blur-md shadow-e1 hover:shadow-e2 hover:-translate-y-0.5",
        glassPurple: "border border-purple-500/20 bg-purple-500/5 backdrop-blur-md shadow-e1 hover:shadow-e2 hover:-translate-y-0.5",
        glassGreen: "border border-green-500/20 bg-green-500/5 backdrop-blur-md shadow-e1 hover:shadow-e2 hover:-translate-y-0.5",

        // 语义化变体
        premium: "border-2 border-yellow-200 bg-gradient-to-br from-yellow-50 to-orange-50 shadow-e1 hover:shadow-glow-accent hover:-translate-y-0.5",
        success: "border-2 border-green-200 bg-gradient-to-br from-green-50 to-emerald-50 shadow-e1 hover:shadow-glow hover:-translate-y-0.5",
        warning: "border-2 border-orange-200 bg-gradient-to-br from-orange-50 to-red-50 shadow-e1 hover:shadow-glow-accent hover:-translate-y-0.5",
        info: "border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-cyan-50 shadow-e1 hover:shadow-glow hover:-translate-y-0.5",

        // 交互变体
        interactive: "border-border bg-card shadow-e0 hover:shadow-e2 hover:border-primary/50 hover:-translate-y-0.5 cursor-pointer",
        floating: "border-border bg-card shadow-e1 hover:shadow-e2 hover:-translate-y-1",

        // 发光变体
        neon: "border-2 border-blue-500/50 bg-card shadow-e1 hover:shadow-glow hover:border-blue-500 hover:-translate-y-0.5",
        neonPurple: "border-2 border-purple-500/50 bg-card shadow-e1 hover:shadow-glow hover:border-purple-500 hover:-translate-y-0.5",
        neonGreen: "border-2 border-green-500/50 bg-card shadow-e1 hover:shadow-glow hover:border-green-500 hover:-translate-y-0.5",

        // 主题变体
        dark: "border border-gray-700 bg-gray-900 text-white shadow-e1 hover:shadow-e2 hover:-translate-y-0.5",
        light: "border border-gray-200 bg-gray-50 shadow-e0 hover:shadow-e1 hover:-translate-y-0.5",
      },
      size: {
        default: "p-6",
        sm: "p-4",
        lg: "p-8",
        xl: "p-12",
        compact: "p-3",
        minimal: "p-2",
      },
      animation: {
        none: "",
        fadeIn: "animate-fadeIn",
        slideIn: "animate-slideIn",
        scaleIn: "animate-scaleIn",
        float: "animate-float",
        glow: "animate-glow",
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

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {
  hover?: boolean
  clickable?: boolean
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant, size, animation, hover = false, clickable = false, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        cardVariants({ variant, size, animation }),
        hover && "hover:shadow-lg hover:scale-105 transition-all duration-300",
        clickable && "cursor-pointer hover:shadow-lg hover:scale-105 transition-all duration-300",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
)
Card.displayName = "Card"

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6", className)}
    {...props}
  />
))
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-2xl font-semibold leading-none tracking-tight",
      className
    )}
    {...props}
  />
))
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
CardDescription.displayName = "CardDescription"

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
))
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0", className)}
    {...props}
  />
))
CardFooter.displayName = "CardFooter"

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }
