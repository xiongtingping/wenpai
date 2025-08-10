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

        // 🎨 Modern Flat + Soft Neumorphism 新增变体（令牌化）
        soft: "border border-border bg-card shadow-e1 hover:shadow-e2 hover:-translate-y-0.5",
        neumorph: "border border-border bg-card shadow-e1 hover:shadow-e2 hover:-translate-y-0.5",

        // 统一渐变变体（令牌化到 CSS 变量）
        gradient: "border-0 card-gradient shadow-e1 hover:shadow-e2 hover:-translate-y-0.5",
        gradientSecondary: "border-0 bg-gradient-secondary shadow-e1 hover:shadow-e2 hover:-translate-y-0.5",
        gradientAccent: "border-0 bg-gradient-accent shadow-e1 hover:shadow-e2 hover:-translate-y-0.5",

        // 玻璃效果变体（令牌化）
        glass: "border border-border/20 bg-background/10 backdrop-blur-md shadow-e1 hover:shadow-e2 hover:-translate-y-0.5",
        glassBlue: "border border-primary/20 bg-primary/5 backdrop-blur-md shadow-e1 hover:shadow-e2 hover:-translate-y-0.5",
        glassPurple: "border border-primary/20 bg-primary/5 backdrop-blur-md shadow-e1 hover:shadow-e2 hover:-translate-y-0.5",
        glassGreen: "border border-primary/20 bg-primary/5 backdrop-blur-md shadow-e1 hover:shadow-e2 hover:-translate-y-0.5",

        // 语义化变体（令牌化）
        premium: "border-2 border-strong bg-accent shadow-e1 hover:shadow-glow-accent hover:-translate-y-0.5",
        success: "border-2 border-strong bg-accent shadow-e1 hover:shadow-glow hover:-translate-y-0.5",
        warning: "border-2 border-strong bg-accent shadow-e1 hover:shadow-glow-accent hover:-translate-y-0.5",
        info: "border-2 border-strong bg-accent shadow-e1 hover:shadow-glow hover:-translate-y-0.5",

        // 交互变体
        interactive: "border-border bg-card shadow-e0 hover:shadow-e2 hover:border-primary/50 hover:-translate-y-0.5 cursor-pointer",
        floating: "border-border bg-card shadow-e1 hover:shadow-e2 hover:-translate-y-1",

        // 发光变体（令牌化）
        neon: "border-2 border-primary/50 bg-card shadow-e1 hover:shadow-glow hover:border-primary hover:-translate-y-0.5",
        neonPurple: "border-2 border-primary/50 bg-card shadow-e1 hover:shadow-glow hover:border-primary hover:-translate-y-0.5",
        neonGreen: "border-2 border-primary/50 bg-card shadow-e1 hover:shadow-glow hover:border-primary hover:-translate-y-0.5",

        // 主题变体（令牌化）
        dark: "border border-border bg-foreground text-primary-foreground shadow-e1 hover:shadow-e2 hover:-translate-y-0.5",
        light: "border border-border bg-muted shadow-e0 hover:shadow-e1 hover:-translate-y-0.5",
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
