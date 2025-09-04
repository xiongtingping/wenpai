/**
 * 内容输入区域组件
 * 负责用户输入内容的管理和展示
 */

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  Sparkles, 
  BookOpen, 
  RotateCcw,
  Copy,
  Trash2,
  Info
} from 'lucide-react';
import { useAdaptPage } from '../../AdaptPageProvider';
import { cn } from '@/lib/utils';

// ========================================================================================
// 组件Props
// ========================================================================================

interface ContentInputProps {
  className?: string;
}

// ========================================================================================
// 主组件
// ========================================================================================

export function ContentInput({ className }: ContentInputProps) {
  const { state, events } = useAdaptPage();

  const {
    inputContent,
    brandLibraryEnabled,
    customPrompt,
    isGenerating,
  } = state;

  const {
    onContentChange,
    onBrandLibraryToggle,
    onCustomPromptChange,
  } = events;

  // 字符统计
  const characterCount = inputContent.length;
  const wordCount = inputContent.trim() ? inputContent.trim().split(/\s+/).length : 0;

  // 内容建议
  const suggestions = [
    '描述您的产品或服务特点',
    '分享您的观点或见解',
    '讲述一个有趣的故事',
    '提供实用的建议或技巧',
  ];

  const handleClearContent = () => {
    onContentChange('');
  };

  const handleCopyContent = async () => {
    try {
      await navigator.clipboard.writeText(inputContent);
      // 这里可以添加toast提示
    } catch (error) {
      console.error('Failed to copy content:', error);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    if (inputContent.trim()) {
      onContentChange(inputContent + '\n\n' + suggestion);
    } else {
      onContentChange(suggestion);
    }
  };

  return (
    <Card className={cn('w-full', className)}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">内容输入</CardTitle>
            <Badge variant="outline" className="text-xs">
              {characterCount} 字符 · {wordCount} 词
            </Badge>
          </div>
          
          <div className="flex items-center gap-2">
            {inputContent && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCopyContent}
                  className="h-8 w-8 p-0"
                  title="复制内容"
                >
                  <Copy className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClearContent}
                  className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                  title="清空内容"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* 主要输入区域 */}
        <div className="space-y-2">
          <Textarea
            placeholder="请输入您想要适配的内容..."
            value={inputContent}
            onChange={(e) => onContentChange(e.target.value)}
            className="min-h-[120px] resize-none"
            disabled={isGenerating}
          />
          
          {/* 内容建议 */}
          {!inputContent && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Sparkles className="h-4 w-4" />
                <span>内容建议：</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {suggestions.map((suggestion, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="h-auto py-1 px-2 text-xs"
                  >
                    {suggestion}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 品牌库开关 */}
        <div className="flex items-center justify-between p-3 bg-accent/50 rounded-lg">
          <div className="flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-primary" />
            <div>
              <Label htmlFor="brand-library" className="text-sm font-medium">
                启用品牌库
              </Label>
              <p className="text-xs text-muted-foreground">
                使用您的品牌信息优化内容生成
              </p>
            </div>
          </div>
          <Switch
            id="brand-library"
            checked={brandLibraryEnabled}
            onCheckedChange={onBrandLibraryToggle}
            disabled={isGenerating}
          />
        </div>

        {/* 自定义提示词 */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Label htmlFor="custom-prompt" className="text-sm font-medium">
              自定义提示词
            </Label>
            <div className="group relative">
              <Info className="h-4 w-4 text-muted-foreground cursor-help" />
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-popover text-popover-foreground text-xs rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                添加特定要求或风格指导
              </div>
            </div>
          </div>
          <Textarea
            id="custom-prompt"
            placeholder="例如：请使用轻松幽默的语调，添加相关的emoji表情..."
            value={customPrompt}
            onChange={(e) => onCustomPromptChange(e.target.value)}
            className="min-h-[60px] resize-none text-sm"
            disabled={isGenerating}
          />
        </div>

        {/* 内容统计和提示 */}
        {inputContent && (
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-4">
              <span>字符数: {characterCount}</span>
              <span>词数: {wordCount}</span>
              {characterCount > 1000 && (
                <Badge variant="secondary" className="text-xs">
                  内容较长
                </Badge>
              )}
            </div>
            
            {characterCount < 10 && (
              <div className="flex items-center gap-1 text-amber-600">
                <Info className="h-3 w-3" />
                <span>内容过短，建议增加更多描述</span>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default ContentInput;
