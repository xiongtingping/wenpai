import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const textareaVariants = cva(
  "flex w-full rounded-md border text-base shadow-sm transition-all duration-200 placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm resize-none",
  {
    variants: {
      variant: {
        default: "border-input bg-background hover:bg-muted/50 focus:bg-background",
        filled: "border-border bg-muted hover:bg-muted/80 focus:bg-muted",
        outlined: "border-2 border-border bg-transparent hover:border-border-strong focus:border-primary",
        ghost: "border-transparent bg-transparent hover:bg-muted/30 focus:bg-background focus:border-border",
        enhanced: "border-border bg-background hover:bg-muted/30 focus:bg-background shadow-e0 hover:shadow-e1 focus:shadow-e1",
      },
      size: {
        default: "min-h-[80px] px-3 py-2",
        sm: "min-h-[60px] px-2 py-1 text-sm",
        lg: "min-h-[120px] px-4 py-3",
        xl: "min-h-[160px] px-4 py-4 text-base",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface TextareaProps
  extends React.ComponentProps<"textarea">,
    VariantProps<typeof textareaVariants> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <textarea
        className={cn(textareaVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Textarea.displayName = "Textarea"

export { Textarea, textareaVariants }
