import * as React from "react"
import { Check, ChevronDown, ChevronUp } from "lucide-react"

import { cn } from "@/lib/utils"

// 🔧 CRITICAL FIX: 使用我们的自定义Select组件替代Radix UI
// 这样可以完全避免Portal相关的DOM节点管理问题
export {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  SimpleSelect as default
} from './select/index'

// 为了保持向后兼容，提供一些别名
const SelectGroup = ({ children }: { children: React.ReactNode }) => <>{children}</>
const SelectLabel = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div className={cn("px-2 py-1.5 text-sm font-semibold", className)}>{children}</div>
)
const SelectSeparator = ({ className }: { className?: string }) => (
  <div className={cn("-mx-1 my-1 h-px bg-muted", className)} />
)

// 向后兼容的滚动按钮组件
const SelectScrollUpButton = ({ className }: { className?: string }) => (
  <div className={cn("flex cursor-default items-center justify-center py-1", className)}>
    <ChevronUp className="h-4 w-4" />
  </div>
)

const SelectScrollDownButton = ({ className }: { className?: string }) => (
  <div className={cn("flex cursor-default items-center justify-center py-1", className)}>
    <ChevronDown className="h-4 w-4" />
  </div>
)

// 导出所有组件以保持向后兼容
export {
  SelectGroup,
  SelectLabel,
  SelectSeparator,
  SelectScrollUpButton,
  SelectScrollDownButton,
}
