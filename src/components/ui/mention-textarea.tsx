/**
 * 文本输入组件
 * 简化的文本输入框，去掉了@引用功能
 */

import React from 'react';
import { Textarea } from "@/components/ui/textarea";

interface MentionTextareaProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  minHeight?: string;
}

export function MentionTextarea({ 
  value, 
  onChange, 
  placeholder = "在此输入内容...",
  className,
  minHeight = "var(--textarea-min-height)"
}: MentionTextareaProps) {
  
  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value);
  };

  return (
    <div className="relative">
      <Textarea
        value={value}
        onChange={handleTextChange}
        placeholder={placeholder}
        className={className}
        className={`mention-textarea ${className}`}
        style={{ '--textarea-min-height': minHeight } as React.CSSProperties}
      />
    </div>
  );
}