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
        premium: "border-transparent bg-gradient-to-r from-yellow-400 to-orange-500 text-white shadow-lg",
        success: "border-transparent bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-md",
        warning: "border-transparent bg-gradient-to-r from-yellow-500 to-orange-600 text-white shadow-md",
        info: "border-transparent bg-gradient-to-r from-blue-500 to-cyan-600 text-white shadow-md",
        neon: "border-2 border-blue-500 text-blue-500 bg-transparent shadow-glow",
        neonPurple: "border-2 border-purple-500 text-purple-500 bg-transparent shadow-glow-purple",
        neonGreen: "border-2 border-green-500 text-green-500 bg-transparent shadow-glow-green",
        soft: "border border-gray-200 bg-white/80 backdrop-blur-sm text-gray-700 shadow-sm",
        glass: "border border-white/20 bg-white/10 backdrop-blur-md text-white shadow-sm",
        glassBlue: "border border-blue-500/20 bg-blue-500/5 backdrop-blur-sm text-blue-700 shadow-sm",
        glassPurple: "border border-purple-500/20 bg-purple-500/5 backdrop-blur-sm text-purple-700 shadow-sm",
        glassGreen: "border border-green-500/20 bg-green-500/5 backdrop-blur-sm text-green-700 shadow-sm",
        dark: "border border-gray-700 bg-gray-900 text-white shadow-md",
        light: "border border-gray-200 bg-gray-100 text-gray-900 shadow-sm",
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
