/**
 * 快速引用触发按钮组件
 * 使用设计令牌和主题适配的现代化按钮
 */

import React, { useRef, useState } from 'react';
import { Button } from "@/components/ui/button";
import { AtSign } from "lucide-react";
import { QuickReferenceDialog } from './QuickReferenceDialog';
import { cn } from "@/lib/utils";

interface QuickReferenceTriggerProps {
  onSelect: (content: string) => void;
  multiSelect?: boolean;
  className?: string;
  variant?: 'default' | 'outline' | 'secondary' | 'ghost';
  size?: 'default' | 'sm' | 'lg';
  disabled?: boolean;
}

export function QuickReferenceTrigger({
  onSelect,
  multiSelect = false,
  className,
  variant = 'outline',
  size = 'sm',
  disabled = false
}: QuickReferenceTriggerProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  // ✅ 简化：移除anchor定位逻辑，完全依赖CSS居中系统
  const btnRef = useRef<HTMLButtonElement>(null);


  // 🎯 移除复杂调试代码，保持组件简洁

  const handleSelect = (content: string) => {
    onSelect(content);
    setIsDialogOpen(false);
  };

  // 🎯 简洁组件，移除调试输出

  return (
    <>
      <Button
        ref={btnRef}
        variant={variant}
        size={size}
        disabled={disabled}
        className={cn(
          // 使用设计令牌的主题适配样式
          "bg-background border-border text-foreground",
          "hover:bg-accent hover:text-accent-foreground",
          "focus:ring-2 focus:ring-ring focus:ring-offset-2",
          "transition-all duration-200",
          // 特殊的快速引用按钮样式
          variant === 'outline' && [
            "border-primary/20 text-primary",
            "hover:bg-primary/5 hover:border-primary/30",
            "dark:border-primary/30 dark:text-primary",
            "dark:hover:bg-primary/10"
          ],
          className
        )}
        onClick={() => {
          // ✅ 简洁的点击处理：只处理Dialog打开，定位完全交给CSS
          setIsDialogOpen(true);
        }}
      >
        <AtSign className="h-4 w-4 mr-2" />
        快速引用
      </Button>

      <QuickReferenceDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onSelect={handleSelect}
        multiSelect={multiSelect}
      />
    </>
  );
}
