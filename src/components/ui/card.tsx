import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const cardVariants = cva(
  "rounded-lg border bg-card text-card-foreground shadow-sm transition-all duration-300",
  {
    variants: {
      variant: {
        default: "border-border bg-card",
        elevated: "border-border bg-card shadow-md hover:shadow-lg transform hover:scale-105",
        outlined: "border-2 border-border bg-transparent",
        glass: "border border-white/20 bg-white/10 backdrop-blur-md",
        gradient: "border-0 bg-gradient-to-br from-blue-50 to-purple-50",
        premium: "border-2 border-yellow-200 bg-gradient-to-br from-yellow-50 to-orange-50 shadow-lg",
        success: "border-2 border-green-200 bg-gradient-to-br from-green-50 to-emerald-50",
        warning: "border-2 border-orange-200 bg-gradient-to-br from-orange-50 to-red-50",
        info: "border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-cyan-50",
        interactive: "border-border bg-card shadow-sm hover:shadow-lg hover:border-primary/50 transform hover:scale-105 cursor-pointer transition-all duration-300",
        floating: "border-border bg-card shadow-lg hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-500",
        neon: "border-2 border-blue-500/50 bg-card shadow-lg hover:shadow-glow hover:border-blue-500 transform hover:scale-105",
        neonPurple: "border-2 border-purple-500/50 bg-card shadow-lg hover:shadow-glow-purple hover:border-purple-500 transform hover:scale-105",
        neonGreen: "border-2 border-green-500/50 bg-card shadow-lg hover:shadow-glow-green hover:border-green-500 transform hover:scale-105",
        soft: "border border-gray-200 bg-white/80 backdrop-blur-sm shadow-sm hover:shadow-md transform hover:scale-105",
        dark: "border border-gray-700 bg-gray-900 text-white shadow-lg hover:shadow-xl transform hover:scale-105",
        light: "border border-gray-200 bg-gray-50 shadow-sm hover:shadow-md transform hover:scale-105",
        glassBlue: "border border-blue-500/20 bg-blue-500/5 backdrop-blur-md shadow-sm hover:shadow-md transform hover:scale-105",
        glassPurple: "border border-purple-500/20 bg-purple-500/5 backdrop-blur-md shadow-sm hover:shadow-md transform hover:scale-105",
        glassGreen: "border border-green-500/20 bg-green-500/5 backdrop-blur-md shadow-sm hover:shadow-md transform hover:scale-105",
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
