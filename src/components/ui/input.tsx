import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const inputVariants = cva(
  "flex w-full rounded-md border text-base shadow-sm transition-all duration-200 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
  {
    variants: {
      variant: {
        default: "border-input bg-surface-1 hover:bg-surface-2 focus:bg-surface-2",
        filled: "border-border bg-surface-2 hover:bg-surface-3 focus:bg-surface-3",
        outlined: "border-2 border-border bg-transparent hover:border-border-strong focus:border-primary",
        ghost: "border-transparent bg-transparent hover:bg-surface-1 focus:bg-surface-1 focus:border-border",
        enhanced: "border-border bg-surface-1 hover:bg-surface-2 focus:bg-surface-2 shadow-e0 hover:shadow-e1 focus:shadow-e1",
      },
      size: {
        default: "h-9 px-3 py-1",
        sm: "h-8 px-2 py-1 text-sm",
        lg: "h-11 px-4 py-2",
        xl: "h-12 px-4 py-3 text-base",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface InputProps
  extends Omit<React.ComponentProps<"input">, "size">,
    VariantProps<typeof inputVariants> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, variant, size, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(inputVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input, inputVariants }
