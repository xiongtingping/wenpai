import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "text-foreground",
        premium: "border-transparent btn-gradient-accent text-primary-foreground shadow-lg",
        success: "border-transparent gradient-bg-success text-primary-foreground shadow-md",
        warning: "border-transparent gradient-bg-warning text-primary-foreground shadow-md",
        info: "border-transparent bg-primary/90 text-primary-foreground shadow-md",
        neon: "border-2 border-primary text-primary bg-transparent shadow-glow",
        neonPurple: "border-2 border-primary text-primary bg-transparent shadow-glow",
        neonGreen: "border-2 border-primary text-primary bg-transparent shadow-glow",
        soft: "border border-border bg-card/80 backdrop-blur-sm text-foreground shadow-sm",
        glass: "border border-border/20 bg-background/10 backdrop-blur-md text-foreground shadow-sm",
        glassBlue: "border border-primary/20 bg-primary/5 backdrop-blur-sm text-foreground shadow-sm",
        glassPurple: "border border-primary/20 bg-primary/5 backdrop-blur-sm text-foreground shadow-sm",
        glassGreen: "border border-primary/20 bg-primary/5 backdrop-blur-sm text-foreground shadow-sm",
        dark: "border border-border bg-foreground text-primary-foreground shadow-md",
        light: "border border-border bg-muted text-foreground shadow-sm",
      },
      size: {
        default: "px-2.5 py-0.5 text-xs",
        sm: "px-2 py-0.5 text-xs",
        lg: "px-3 py-1 text-sm",
        xl: "px-4 py-1.5 text-base",
      },
      animation: {
        none: "",
        pulse: "animate-pulse",
        bounce: "animate-bounce",
        glow: "animate-glow",
        wave: "animate-wave",
        float: "animate-float",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      animation: "none",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, size, animation, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant, size, animation }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
