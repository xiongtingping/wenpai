/**
 * 平台内容卡片组件
 * 用于显示和管理单个平台的发布内容
 */

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Copy,
  ExternalLink,
  Check,
  Eye,
  EyeOff,
  Share2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface PlatformContentCardProps {
  platformId: string;
  platformName: string;
  platformIcon: React.ReactNode;
  platformColor: string;
  title?: string;
  content: string;
  hashtags?: string[];
  publishUrl: string;
  maxLength?: number;
}

export const PlatformContentCard: React.FC<PlatformContentCardProps> = ({
  platformId,
  platformName,
  platformIcon,
  platformColor,
  title,
  content,
  hashtags = [],
  publishUrl,
  maxLength
}) => {
  const { toast } = useToast();
  const [isCopied, setIsCopied] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  // 组装完整内容
  const fullContent = React.useMemo(() => {
    let text = content;
    if (title) {
      text = `${title}\n\n${content}`;
    }
    if (hashtags.length > 0) {
      text += `\n\n${hashtags.join(' ')}`;
    }
    return text;
  }, [title, content, hashtags]);

  // 复制内容到剪贴板
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(fullContent);
      setIsCopied(true);
      toast({
        title: "✅ 内容已复制",
        description: `${platformName}的内容已复制到剪贴板`,
      });
      setTimeout(() => setIsCopied(false), 3000);
    } catch (error) {
      toast({
        title: "复制失败",
        description: "请手动复制内容",
        variant: "destructive",
      });
    }
  };

  // 复制并打开平台
  const handleCopyAndOpen = async () => {
    await handleCopy();
    window.open(publishUrl, `_blank_${platformId}`);
    toast({
      title: "🚀 已打开平台",
      description: `请在${platformName}中粘贴内容并发布`,
      duration: 5000,
    });
  };

  // 计算字符数和状态
  const charCount = fullContent.length;
  const isOverLimit = maxLength ? charCount > maxLength : false;
  const displayContent = isExpanded ? fullContent : fullContent.slice(0, 100);

  return (
    <Card className="border-l-4" style={{ borderLeftColor: platformColor }}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`p-2 rounded ${platformColor} text-primary-foreground`}>
              {platformIcon}
            </div>
            <CardTitle className="text-lg">{platformName}</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={isOverLimit ? "destructive" : "secondary"}>
              {charCount} {maxLength ? `/ ${maxLength}` : ''} 字
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* 标题 */}
        {title && (
          <div>
            <div className="text-xs text-muted-foreground mb-1">标题:</div>
            <div className="font-medium text-foreground">{title}</div>
          </div>
        )}

        {/* 内容预览 */}
        <div>
          <div className="text-xs text-muted-foreground mb-1">内容:</div>
          <div className="text-sm text-foreground whitespace-pre-wrap bg-muted/50 rounded p-2">
            {displayContent}
            {fullContent.length > 100 && !isExpanded && '...'}
          </div>
          {fullContent.length > 100 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="mt-1"
            >
              {isExpanded ? (
                <>
                  <EyeOff className="w-3 h-3 mr-1" />
                  收起
                </>
              ) : (
                <>
                  <Eye className="w-3 h-3 mr-1" />
                  展开全文
                </>
              )}
            </Button>
          )}
        </div>

        {/* 标签 */}
        {hashtags.length > 0 && (
          <div>
            <div className="text-xs text-muted-foreground mb-1">话题标签:</div>
            <div className="flex flex-wrap gap-1">
              {hashtags.map((tag, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* 操作按钮 */}
        <div className="flex gap-2 pt-2">
          <Button
            onClick={handleCopy}
            variant="outline"
            size="sm"
            className="flex-1"
            disabled={isCopied}
          >
            {isCopied ? (
              <>
                <Check className="w-4 h-4 mr-1" />
                已复制
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 mr-1" />
                复制内容
              </>
            )}
          </Button>

          <Button
            onClick={handleCopyAndOpen}
            variant="default"
            size="sm"
            className="flex-1"
          >
            <Share2 className="w-4 h-4 mr-1" />
            复制并发布
          </Button>

          <Button
            onClick={() => window.open(publishUrl, '_blank')}
            variant="ghost"
            size="sm"
          >
            <ExternalLink className="w-4 h-4" />
          </Button>
        </div>

        {/* 超出字数提醒 */}
        {isOverLimit && (
          <div className="text-xs text-destructive bg-destructive/10 rounded p-2">
            ⚠️ 内容超出平台限制 {charCount - (maxLength || 0)} 字，请精简后发布
          </div>
        )}
      </CardContent>
    </Card>
  );
};
