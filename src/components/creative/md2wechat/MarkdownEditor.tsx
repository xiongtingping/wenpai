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
  const [cursorPosition, setCursorPosition] = useState(0);

  // 更新光标位置
  const updateCursorPosition = useCallback(() => {
    if (textareaRef.current) {
      setCursorPosition(textareaRef.current.selectionStart);
    }
  }, []);

  // 插入文本到光标位置
  const insertText = useCallback((insertValue: string, selectStart?: number, selectEnd?: number) => {
    if (!textareaRef.current) return;

    const textarea = textareaRef.current;
    const startPos = textarea.selectionStart;
    const endPos = textarea.selectionEnd;
    const beforeText = content.substring(0, startPos);
    const afterText = content.substring(endPos);
    
    const newContent = beforeText + insertValue + afterText;
    onChange(newContent);

    // 设置新的光标位置
    setTimeout(() => {
      if (textarea && (selectStart !== undefined || selectEnd !== undefined)) {
        const newStart = selectStart !== undefined ? startPos + selectStart : startPos + insertValue.length;
        const newEnd = selectEnd !== undefined ? startPos + selectEnd : newStart;
        textarea.setSelectionRange(newStart, newEnd);
        textarea.focus();
      }
    }, 0);
  }, [content, onChange]);

  // 快捷操作函数
  const insertHeading = useCallback((level: number) => {
    const prefix = '#'.repeat(level) + ' ';
    insertText(prefix);
  }, [insertText]);

  const insertBold = useCallback(() => {
    insertText('**粗体文本**', 2, 6);
  }, [insertText]);

  const insertItalic = useCallback(() => {
    insertText('*斜体文本*', 1, 5);
  }, [insertText]);

  const insertCode = useCallback(() => {
    insertText('代码', 1, 3);
  }, [insertText]);

  const insertLink = useCallback(() => {
    insertText('[链接文本](https://example.com)', 1, 5);
  }, [insertText]);

  const insertImage = useCallback(() => {
    insertText('![图片描述](图片URL)', 1, 5);
  }, [insertText]);

  const insertList = useCallback(() => {
    insertText('\n- 列表项\n- 列表项\n- 列表项');
  }, [insertText]);

  const insertOrderedList = useCallback(() => {
    insertText('\n1. 列表项\n2. 列表项\n3. 列表项');
  }, [insertText]);

  const insertQuote = useCallback(() => {
    insertText('\n> 引用文本\n');
  }, [insertText]);

  const insertTable = useCallback(() => {
    const tableText = '\n| 列1 | 列2 | 列3 |\n|-----|-----|-----|\n| 内容 | 内容 | 内容 |\n| 内容 | 内容 | 内容 |\n';
    insertText(tableText);
  }, [insertText]);

  const insertDivider = useCallback(() => {
    insertText('\n---\n');
  }, [insertText]);

  // 处理键盘快捷键
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.ctrlKey || e.metaKey) {
      switch (e.key) {
        case 'b':
          e.preventDefault();
          insertBold();
          break;
        case 'i':
          e.preventDefault();
          insertItalic();
          break;
        case 'k':
          e.preventDefault();
          insertLink();
          break;
        case '`':
          e.preventDefault();
          insertCode();
          break;
      }
    }
    
    // Tab键缩进
    if (e.key === 'Tab') {
      e.preventDefault();
      insertText('  ');
    }
  }, [insertBold, insertItalic, insertLink, insertCode, insertText]);

  // 自动调整文本域高度
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [content]);

  return (
    <div className={cn('flex flex-col h-full', className)}>
      {/* 工具栏 */}
      <div className="flex flex-wrap gap-1 p-2 border-b border-border bg-muted/20">
        {/* 标题工具 */}
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => insertHeading(1)}
            title="一级标题 (Ctrl+1)"
            className="px-2 py-1 h-7"
          >
            <Heading1 className="w-3 h-3" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => insertHeading(2)}
            title="二级标题 (Ctrl+2)"
            className="px-2 py-1 h-7"
          >
            <Heading2 className="w-3 h-3" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => insertHeading(3)}
            title="三级标题 (Ctrl+3)"
            className="px-2 py-1 h-7"
          >
            <Heading3 className="w-3 h-3" />
          </Button>
        </div>

        <div className="w-px h-6 bg-border mx-1" />

        {/* 格式化工具 */}
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={insertBold}
            title="粗体 (Ctrl+B)"
            className="px-2 py-1 h-7"
          >
            <Bold className="w-3 h-3" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={insertItalic}
            title="斜体 (Ctrl+I)"
            className="px-2 py-1 h-7"
          >
            <Italic className="w-3 h-3" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={insertCode}
            title="代码 (Ctrl+`)"
            className="px-2 py-1 h-7"
          >
            <Code className="w-3 h-3" />
          </Button>
        </div>

        <div className="w-px h-6 bg-border mx-1" />

        {/* 列表和引用 */}
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={insertList}
            title={t('components.labels.标题')}
        className="px-2 py-1 h-7"
          >
            <List className="w-3 h-3" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={insertOrderedList}
            title={t('components.labels.标题')}
        className="px-2 py-1 h-7"
          >
            <ListOrdered className="w-3 h-3" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={insertQuote}
            title={t('components.labels.标题')}
        className="px-2 py-1 h-7"
          >
            <Quote className="w-3 h-3" />
          </Button>
        </div>

        <div className="w-px h-6 bg-border mx-1" />

        {/* 链接和图片 */}
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={insertLink}
            title="链接 (Ctrl+K)"
            className="px-2 py-1 h-7"
          >
            <Link className="w-3 h-3" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={insertImage}
            title={t('components.labels.图片')}
            className="px-2 py-1 h-7"
          >
            <Image className="w-3 h-3" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={insertTable}
            title={t('components.labels.标题')}
        className="px-2 py-1 h-7"
          >
            <Table className="w-3 h-3" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={insertDivider}
            title={t('components.labels.标题')}
            className="px-2 py-1 h-7"
          >
            <Minus className="w-3 h-3" />
          </Button>
        </div>
      </div>

      {/* 编辑区域 */}
      <div className="flex-1 relative">
        <textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onSelect={updateCursorPosition}
          onClick={updateCursorPosition}
          placeholder={placeholder}
          className={cn(
            'w-full h-full p-4 resize-none border-0 outline-0 focus:ring-0',
            'bg-secondary/30 text-foreground font-mono text-sm leading-6 border border-border rounded-lg',
            'placeholder:text-muted-foreground',
            'overflow-y-auto scrollbar-thin scrollbar-thumb-muted-foreground/20 scrollbar-track-transparent',
            'focus:bg-secondary/50 hover:bg-secondary/40 transition-colors'
          )}
          style={{
            minHeight: '400px',
            maxHeight: 'none'
          }}
        />

        {/* 语法提示面板 */}
        <div className="absolute bottom-4 right-4 hidden lg:block">
          <div className="bg-card/80 backdrop-blur border border-border rounded-lg p-3 text-xs space-y-1 shadow-lg max-w-xs">
            <div className="font-medium text-foreground mb-2">快捷键提示</div>
            <div className="space-y-1 text-muted-foreground">
              <div>Ctrl+B: 粗体</div>
              <div>Ctrl+I: 斜体</div>
              <div>Ctrl+K: 链接</div>
              <div>Ctrl+`: 代码</div>
              <div>Tab: 缩进</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}