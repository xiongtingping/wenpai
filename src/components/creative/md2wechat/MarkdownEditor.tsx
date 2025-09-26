/**
 * Markdown编辑器组件
 * 支持语法高亮、实时编辑、快捷操作等功能
 */

import React, { useRef, useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { 
  Bold, 
  Italic, 
  List, 
  ListOrdered, 
  Link, 
  Image, 
  Code, 
  Quote,
  Heading1,
  Heading2,
  Heading3,
  Table,
  Minus
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface MarkdownEditorProps {
  content: string;
  onChange: (content: string) => void;
  className?: string;
  placeholder?: string;
}

/**
 * Markdown编辑器组件
 */
export function MarkdownEditor({ content,
  onChange,
  className,
  placeholder = '在此输入Markdown内容...'
 }: MarkdownEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  console.log('MarkdownEditor rendered with content:', content);

  return (
    <div className={cn('flex flex-col h-full', className)}>
      {/* 工具栏 */}
      <div className="flex flex-wrap gap-1 p-2 border-b border-border bg-muted/20">
        <div className="flex gap-1">
          <Button variant="ghost" size="sm" className="px-2 py-1 h-7">
            <Heading1 className="w-3 h-3" />
          </Button>
          <Button variant="ghost" size="sm" className="px-2 py-1 h-7">
            <Heading2 className="w-3 h-3" />
          </Button>
          <Button variant="ghost" size="sm" className="px-2 py-1 h-7">
            <Bold className="w-3 h-3" />
          </Button>
          <Button variant="ghost" size="sm" className="px-2 py-1 h-7">
            <Italic className="w-3 h-3" />
          </Button>
          <Button variant="ghost" size="sm" className="px-2 py-1 h-7">
            <Code className="w-3 h-3" />
          </Button>
        </div>
      </div>

      {/* 编辑区域 */}
      <div className="flex-1 relative" style={{ minHeight: '300px' }}>
        <textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={cn(
            'w-full h-full p-4 resize-none border-0 outline-0 focus:ring-0',
            'bg-background text-foreground font-mono text-sm leading-6',
            'placeholder:text-muted-foreground',
            'overflow-y-auto'
          )}
          style={{ 
            minHeight: '300px'
          }}
        />
      </div>
    </div>
  );
}