/**
 * 预览面板组件
 * 实时显示Markdown转换后的微信公众号样式效果
 */

import React, { useRef, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  RefreshCw, 
  Maximize2, 
  Minimize2, 
  Copy,
  Eye,
  AlertCircle,
  Smartphone,
  Monitor
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { THEME_CONFIGS } from './ThemeSelector';

interface PreviewPanelProps {
  htmlContent: string;
  theme: string;
  fontSize: 'small' | 'medium' | 'large';
  isMobilePreview?: boolean;
  isLoading?: boolean;
  className?: string;
}

/**
 * 预览面板组件
 */
export function PreviewPanel({ htmlContent,
  theme,
  fontSize,
  isMobilePreview = false,
  isLoading = false,
  className
 }: PreviewPanelProps) {
  const { toast } = useToast();
  const previewRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);

  // 获取当前主题配置
  const currentTheme = THEME_CONFIGS.find(t => t.id === theme) || THEME_CONFIGS[0];

  // 字体大小映射
  const fontSizeMap = {
    small: 'var(--spacing-3-5)',
    medium: 'var(--spacing-4)',
    large: 'var(--spacing-4-5)'
  };

  // 生成主题样式
  const generateThemeStyles = () => {
    const baseStyles = {
      fontFamily: '-apple-system, BlinkMacSystemFont, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif',
      fontSize: fontSizeMap[fontSize],
      lineHeight: '1.8',
      color: currentTheme.preview.textColor,
      backgroundColor: currentTheme.preview.backgroundColor,
    };

    // 根据主题生成特定样式
    const themeSpecificStyles = getThemeSpecificStyles(theme);
    
    return {
      ...baseStyles,
      ...themeSpecificStyles
    };
  };

  // 获取主题特定样式
  const getThemeSpecificStyles = (themeId: string) => {
    switch (themeId) {
      case 'bytedance':
        return {
          '--primary-color': 'hsl(var(--primary))',
          '--background-color': '#f8fafc',
          '--text-color': '#1e293b',
          '--accent-color': 'hsl(var(--primary))',
          '--border-color': '#e2e8f0'
        };
      case 'apple':
        return {
          '--primary-color': '#007aff',
          '--background-color': 'hsl(var(--background))',
          '--text-color': 'hsl(var(--foreground))',
          '--accent-color': '#5ac8fa',
          '--border-color': '#d1d1d6'
        };
      case 'sports':
        return {
          '--primary-color': 'hsl(var(--warning))',
          '--background-color': '#fef3c7',
          '--text-color': '#92400e',
          '--accent-color': '#fbbf24',
          '--border-color': '#fde68a'
        };
      case 'chinese':
        return {
          '--primary-color': 'hsl(var(--destructive))',
          '--background-color': '#fef2f2',
          '--text-color': '#7f1d1d',
          '--accent-color': 'hsl(var(--destructive))',
          '--border-color': '#fca5a5'
        };
      case 'cyber':
        return {
          '--primary-color': '#8b5cf6',
          '--background-color': '#1e1b4b',
          '--text-color': '#c4b5fd',
          '--accent-color': '#a78bfa',
          '--border-color': '#6366f1'
        };
      default: // default theme
        return {
          '--primary-color': '#ff6b6b',
          '--background-color': 'hsl(var(--background))',
          '--text-color': '#333333',
          '--accent-color': '#ff8787',
          '--border-color': '#eeeeee'
        };
    }
  };

  // 预处理HTML内容
  const processHtmlContent = (html: string) => {
    if (!html) return '';

    try {
      // 添加微信公众号样式类
      const processedHtml = html
        .replace(/<h1>/g, '<h1 class="wechat-h1">')
        .replace(/<h2>/g, '<h2 class="wechat-h2">')
        .replace(/<h3>/g, '<h3 class="wechat-h3">')
        .replace(/<p>/g, '<p class="wechat-p">')
        .replace(/<blockquote>/g, '<blockquote class="wechat-quote">')
        .replace(/<code>/g, '<code class="wechat-code">')
        .replace(/<pre>/g, '<pre class="wechat-pre">')
        .replace(/<ul>/g, '<ul class="wechat-ul">')
        .replace(/<ol>/g, '<ol class="wechat-ol">')
        .replace(/<li>/g, '<li class="wechat-li">')
        .replace(/<table>/g, '<table class="wechat-table">')
        .replace(/<th>/g, '<th class="wechat-th">')
        .replace(/<td>/g, '<td class="wechat-td">');

      return processedHtml;
    } catch (error) {
      setPreviewError(t('components.errors.内容处理失败'));
      return html;
    }
  };

  // 复制预览内容
  const handleCopyPreview = async () => {
    try {
      if (previewRef.current) {
        const htmlContent = previewRef.current.innerHTML;
        await navigator.clipboard.writeText(htmlContent);
        toast({
          title: t('components.labels.复制成功'),
          description: '预览内容已复制到剪贴板',
        });
      }
    } catch (error) {
      toast({
        title: t('components.labels.复制失败'),
        description: '请手动选择内容复制',
        variant: 'destructive'
      });
    }
  };

  // 刷新预览
  const handleRefreshPreview = () => {
    setPreviewError(null);
    // 触发重新渲染
    if (previewRef.current) {
      previewRef.current.scrollTop = 0;
    }
  };

  // 切换全屏模式
  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  // 错误处理
  useEffect(() => {
    if (htmlContent && htmlContent.includes('error')) {
      setPreviewError(t('components.errors.转换过程中出现错误'));
    } else {
      setPreviewError(null);
    }
  }, [htmlContent]);

  // 微信公众号样式
  const wechatStyles = `
    .wechat-container {
      max-width: ${isMobilePreview ? '375px' : '800px'};
      margin: 0 auto;
      padding: var(--spacing-5);
      background: var(--background-color);
      color: var(--text-color);
      font-family: -apple-system, BlinkMacSystemFont, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif;
      line-height: 1.8;
      word-break: break-word;
    }
    
    .wechat-h1 {
      font-size: 1.5em;
      font-weight: bold;
      color: var(--primary-color);
      margin: 1.5em 0 0.8em 0;
      padding-bottom: 0.3em;
      border-bottom: var(--spacing-0-5) solid var(--primary-color);
    }
    
    .wechat-h2 {
      font-size: 1.3em;
      font-weight: bold;
      color: var(--primary-color);
      margin: 1.3em 0 0.6em 0;
      padding-left: 0.5em;
      border-left: var(--spacing-1) solid var(--primary-color);
    }
    
    .wechat-h3 {
      font-size: 1.1em;
      font-weight: bold;
      color: var(--text-color);
      margin: 1.1em 0 0.5em 0;
    }
    
    .wechat-p {
      margin: 0.8em 0;
      text-align: justify;
    }
    
    .wechat-quote {
      margin: 1em 0;
      padding: 0.8em 1em;
      background: color-mix(in srgb, var(--primary-color) 8%, transparent);
      border-left: var(--spacing-1) solid var(--primary-color);
      border-radius: var(--radius-none) var(--spacing-1) var(--spacing-1) 0;
      font-style: italic;
    }
    
    .wechat-code {
      background: color-mix(in srgb, var(--primary-color) 10%, transparent);
      padding: 0.2em 0.4em;
      border-radius: 3px;
      font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
      font-size: 0.9em;
    }
    
    .wechat-pre {
      background: color-mix(in srgb, var(--primary-color) 5%, transparent);
      padding: 1em;
      border-radius: var(--spacing-1-5);
      overflow-x: auto;
      margin: 1em 0;
      border: 1px solid var(--border-color);
    }
    
    .wechat-ul, .wechat-ol {
      margin: 0.8em 0;
      padding-left: 2em;
    }
    
    .wechat-li {
      margin: 0.3em 0;
    }
    
    .wechat-table {
      width: 100%;
      border-collapse: collapse;
      margin: 1em 0;
      border: 1px solid var(--border-color);
    }
    
    .wechat-th, .wechat-td {
      padding: 0.5em 0.8em;
      border: 1px solid var(--border-color);
      text-align: left;
    }
    
    .wechat-th {
      background: color-mix(in srgb, var(--primary-color) 10%, transparent);
      font-weight: bold;
    }
    
    img {
      max-width: 100%;
      height: auto;
      margin: 1em 0;
      border-radius: var(--spacing-1);
    }
    
    a {
      color: var(--primary-color);
      text-decoration: none;
    }
    
    a:hover {
      text-decoration: underline;
    }
    
    strong {
      color: var(--primary-color);
      font-weight: bold;
    }
    
    em {
      color: var(--accent-color);
      font-style: italic;
    }
  `;

  return (
    <div className={cn('flex flex-col h-full', isFullscreen && 'fixed inset-0 z-50 bg-background', className)}>
      {/* 预览工具栏 */}
      <div className="flex items-center justify-between p-2 border-b border-border bg-muted/20">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            {isMobilePreview ? (
              <Smartphone className="w-4 h-4 text-muted-foreground" />
            ) : (
              <Monitor className="w-4 h-4 text-muted-foreground" />
            )}
            <span className="text-sm text-muted-foreground">
              {isMobilePreview ? '移动端' : '桌面端'}预览
            </span>
          </div>
          
          <Badge variant="secondary" className="text-xs">
            {currentTheme.displayName}
          </Badge>
          
          {isLoading && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <RefreshCw className="w-3 h-3 animate-spin" />
              转换中...
            </div>
          )}
        </div>

        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRefreshPreview}
            title={t('components.labels.标题')}
        className="px-2 py-1 h-7"
          >
            <RefreshCw className="w-3 h-3" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCopyPreview}
            title={t('components.labels.标题')}
        className="px-2 py-1 h-7"
          >
            <Copy className="w-3 h-3" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleFullscreen}
            title={isFullscreen ? t('components.labels.退出全屏') : t('components.labels.全屏预览')}
            className="px-2 py-1 h-7"
          >
            {isFullscreen ? <Minimize2 className="w-3 h-3" /> : <Maximize2 className="w-3 h-3" />}
          </Button>
        </div>
      </div>

      {/* 预览内容区域 */}
      <div className="flex-1 overflow-auto bg-muted/10">
        {previewError ? (
          /* 错误状态 */
          <div className="flex flex-col items-center justify-center h-full text-center p-8">
            <AlertCircle className="w-12 h-12 text-destructive mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">预览出错</h3>
            <p className="text-muted-foreground mb-4">{previewError}</p>
            <Button onClick={handleRefreshPreview} variant="outline">
              <RefreshCw className="w-4 h-4 mr-2" />
              重新加载
            </Button>
          </div>
        ) : !htmlContent ? (
          /* 空状态 */
          <div className="flex flex-col items-center justify-center h-full text-center p-8">
            <Eye className="w-12 h-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">等待内容</h3>
            <p className="text-muted-foreground">在左侧编辑器中输入Markdown内容，这里将实时显示预览效果</p>
          </div>
        ) : (
          /* 预览内容 */
          <div className="p-4">
            <style>{wechatStyles}</style>
            <div
              ref={previewRef}
              className="wechat-container"
              style={generateThemeStyles()}
              dangerouslySetInnerHTML={{
                __html: processHtmlContent(htmlContent)
              }}
            />
          </div>
        )}
      </div>

      {/* 全屏模式关闭按钮 */}
      {isFullscreen && (
        <Button
          variant="default"
          onClick={toggleFullscreen}
          className="fixed top-4 right-4 z-60 shadow-lg"
        >
          <Minimize2 className="w-4 h-4 mr-2" />
          退出全屏
        </Button>
      )}
    </div>
  );
}