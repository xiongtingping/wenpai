import * as React from "react"
import * as SeparatorPrimitive from "@radix-ui/react-separator"

import { cn } from "@/lib/utils"
import { safeGetDisplayName } from "@/utils/safeDisplayName"

const Separator = React.forwardRef<
  React.ElementRef<typeof SeparatorPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SeparatorPrimitive.Root>
>(
  (
    { className, orientation = "horizontal", decorative = true, ...props },
    ref
  ) => (
    <SeparatorPrimitive.Root
      ref={ref}
      decorative={decorative}
      orientation={orientation}
      className={cn(
        "shrink-0 bg-border",
        orientation === "horizontal" ? "separator-horizontal w-full" : "h-full separator-vertical",
        className
      )}
      {...props}
    />
  )
)
Separator.displayName = safeGetDisplayName(SeparatorPrimitive.Root, "Separator")

export { Separator }
