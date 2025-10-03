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

  /**
   * 在光标位置插入文本
   */
  const insertAtCursor = useCallback((before: string, after: string = '', placeholder: string = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);
    const textToInsert = selectedText || placeholder;

    const newContent =
      content.substring(0, start) +
      before + textToInsert + after +
      content.substring(end);

    onChange(newContent);

    // 设置新的光标位置
    setTimeout(() => {
      textarea.focus();
      const newCursorPos = start + before.length + textToInsert.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  }, [content, onChange]);

  /**
   * 在行首插入文本
   */
  const insertAtLineStart = useCallback((prefix: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const lineStart = content.lastIndexOf('\n', start - 1) + 1;

    const newContent =
      content.substring(0, lineStart) +
      prefix +
      content.substring(lineStart);

    onChange(newContent);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, start + prefix.length);
    }, 0);
  }, [content, onChange]);

  console.log('MarkdownEditor rendered with content:', content);

  return (
    <div className={cn('flex flex-col h-full', className)}>
      {/* 工具栏 */}
      <div className="flex flex-wrap gap-1 p-2 border-b border-border bg-muted/20">
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="px-2 py-1 h-7"
            onClick={() => insertAtLineStart('# ')}
            title="标题1"
          >
            <Heading1 className="w-3 h-3" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="px-2 py-1 h-7"
            onClick={() => insertAtLineStart('## ')}
            title="标题2"
          >
            <Heading2 className="w-3 h-3" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="px-2 py-1 h-7"
            onClick={() => insertAtCursor('**', '**', '加粗文本')}
            title="加粗"
          >
            <Bold className="w-3 h-3" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="px-2 py-1 h-7"
            onClick={() => insertAtCursor('*', '*', '斜体文本')}
            title="斜体"
          >
            <Italic className="w-3 h-3" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="px-2 py-1 h-7"
            onClick={() => insertAtCursor('`', '`', '代码')}
            title="行内代码"
          >
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