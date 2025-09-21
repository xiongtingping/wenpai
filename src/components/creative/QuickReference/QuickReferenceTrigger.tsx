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
  const [anchor, setAnchor] = useState<{ x: number; y: number; width: number; height: number } | undefined>(undefined);
  const btnRef = useRef<HTMLButtonElement>(null);
  // 打开期间跟随视口滚动与布局变化，实时更新锚点
  React.useEffect(() => {
    if (!isDialogOpen) return;
    const updateAnchor = () => {
      const rect = btnRef.current?.getBoundingClientRect();
      if (rect) setAnchor({ x: rect.left, y: rect.top, width: rect.width, height: rect.height });
    };
    const raf = requestAnimationFrame(updateAnchor);
    window.addEventListener('scroll', updateAnchor, { passive: true });
    window.addEventListener('resize', updateAnchor);
    const interval = setInterval(updateAnchor, 250); // 轻量兜底，覆盖异步布局
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('scroll', updateAnchor);
      window.removeEventListener('resize', updateAnchor);
      clearInterval(interval);
    };
  }, [isDialogOpen]);


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
        onClick={(e) => {
          // 🎯 记录触发按钮在视口中的位置，作为弹窗锚点；若读取失败则退化到点击点
          const rect = btnRef.current?.getBoundingClientRect();
          if (rect) {
            setAnchor({ x: rect.left, y: rect.top, width: rect.width, height: rect.height });
          } else {
            setAnchor({ x: e.clientX, y: e.clientY, width: 0, height: 0 });
          }

          // 🎯 简洁的点击处理：只处理必要的aria-hidden清理
          const root = document.getElementById('root');
          if (root && root.hasAttribute('aria-hidden')) {
            root.removeAttribute('aria-hidden');
            root.removeAttribute('data-aria-hidden');
          }

          setIsDialogOpen(true);
        }}
      >
        <AtSign className="h-4 w-4 mr-2" />
        快速引用
      </Button>

      <QuickReferenceDialog
        open={isDialogOpen}
        onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) setAnchor(undefined);
        }}
        onSelect={handleSelect}
        multiSelect={multiSelect}
        anchor={undefined}
      />
    </>
  );
}
