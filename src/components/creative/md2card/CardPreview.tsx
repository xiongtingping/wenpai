/**
 * 卡片预览组件
 * 提供实时预览、多设备视图和交互功能
 */

import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Monitor, 
  Smartphone, 
  Tablet,
  Maximize,
  Minimize,
  RefreshCw,
  Download,
  Copy,
  Share,
  Eye,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Settings
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ParsedContent } from './MarkdownParser';
import { CardTemplate, CardConfiguration } from '../MD2CardPage';

// 预览模式
export type PreviewMode = 'desktop' | 'tablet' | 'mobile';

// 缩放级别
export type ZoomLevel = 0.5 | 0.75 | 1 | 1.25 | 1.5 | 2;

interface CardPreviewProps {
  parsedContent: ParsedContent | null;
  template: CardTemplate | null;
  configuration: CardConfiguration;
  isGenerating: boolean;
  previewMode: PreviewMode;
  zoomLevel: ZoomLevel;
  onPreviewModeChange: (mode: PreviewMode) => void;
  onZoomChange: (zoom: ZoomLevel) => void;
  onExport?: (format: 'png' | 'jpg' | 'svg') => void;
  onShare?: () => void;
  className?: string;
}

/**
 * 卡片预览主组件
 */
export const CardPreview: React.FC<CardPreviewProps> = ({
  parsedContent,
  template,
  configuration,
  isGenerating,
  previewMode,
  zoomLevel,
  onPreviewModeChange,
  onZoomChange,
  onExport,
  onShare,
  className = ''
}) => {
  const { toast } = useToast();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [renderedCard, setRenderedCard] = useState<string | null>(null);

  // 预览容器尺寸配置
  const getPreviewDimensions = () => {
    if (!template) return { width: 400, height: 300 };

    const baseWidth = template.dimensions.width;
    const baseHeight = template.dimensions.height;
    
    let containerWidth: number;
    let containerHeight: number;

    switch (previewMode) {
      case 'mobile':
        containerWidth = Math.min(320, baseWidth * 0.4);
        containerHeight = (containerWidth / baseWidth) * baseHeight;
        break;
      case 'tablet':
        containerWidth = Math.min(480, baseWidth * 0.6);
        containerHeight = (containerWidth / baseWidth) * baseHeight;
        break;
      case 'desktop':
      default:
        containerWidth = Math.min(600, baseWidth * 0.8);
        containerHeight = (containerWidth / baseWidth) * baseHeight;
        break;
    }

    return {
      width: containerWidth * zoomLevel,
      height: containerHeight * zoomLevel
    };
  };

  // 渲染卡片内容
  useEffect(() => {
    if (!parsedContent || !template || !canvasRef.current) {
      setRenderedCard(null);
      return;
    }

    renderCardToCanvas();
  }, [parsedContent, template, configuration, previewMode, zoomLevel]);

  const renderCardToCanvas = async () => {
    if (!canvasRef.current || !parsedContent || !template) return;

    try {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // 设置画布尺寸
      const { width, height } = getPreviewDimensions();
      canvas.width = template.dimensions.width;
      canvas.height = template.dimensions.height;

      // 清空画布
      ctx.fillStyle = configuration.colors.background;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // 渲染卡片内容
      await renderCardContent(ctx, parsedContent, template, configuration);

      // 生成预览图片
      const dataURL = canvas.toDataURL('image/png');
      setRenderedCard(dataURL);
    } catch (error) {
      console.error('渲染卡片失败:', error);
      toast({
        title: '渲染失败',
        description: '卡片渲染过程中发生错误',
        variant: 'destructive'
      });
    }
  };

  const renderCardContent = async (
    ctx: CanvasRenderingContext2D,
    content: ParsedContent,
    template: CardTemplate,
    config: CardConfiguration
  ) => {
    const padding = config.layout.padding;
    const spacing = config.layout.spacing;
    let yPosition = padding;

    // 设置字体
    const fontSize = getFontSize(config.typography.fontSize);
    ctx.font = `${fontSize}px ${config.typography.primaryFont}, Arial, sans-serif`;
    ctx.fillStyle = config.colors.text;

    // 渲染标题
    if (content.title) {
      ctx.font = `bold ${fontSize * 1.5}px ${config.typography.primaryFont}, Arial, sans-serif`;
      ctx.fillStyle = config.colors.primary;
      yPosition += renderText(ctx, content.title, padding, yPosition, template.dimensions.width - 2 * padding);
      yPosition += spacing * 2;
    }

    // 渲染副标题
    if (content.subtitle) {
      ctx.font = `${fontSize * 1.2}px ${config.typography.primaryFont}, Arial, sans-serif`;
      ctx.fillStyle = config.colors.secondary;
      yPosition += renderText(ctx, content.subtitle, padding, yPosition, template.dimensions.width - 2 * padding);
      yPosition += spacing * 1.5;
    }

    // 渲染内容段落
    ctx.font = `${fontSize}px ${config.typography.primaryFont}, Arial, sans-serif`;
    ctx.fillStyle = config.colors.text;

    for (const section of content.sections) {
      if (yPosition > template.dimensions.height - padding) break;

      switch (section.type) {
        case 'text':
          if (typeof section.content === 'string') {
            yPosition += renderText(ctx, section.content, padding, yPosition, template.dimensions.width - 2 * padding);
          }
          break;
        case 'list':
          if (Array.isArray(section.content)) {
            for (const item of section.content) {
              if (yPosition > template.dimensions.height - padding) break;
              yPosition += renderText(ctx, `• ${item}`, padding + 20, yPosition, template.dimensions.width - 2 * padding - 20);
            }
          }
          break;
        case 'quote':
          if (typeof section.content === 'string') {
            ctx.fillStyle = config.colors.secondary;
            yPosition += renderText(ctx, `"${section.content}"`, padding + 20, yPosition, template.dimensions.width - 2 * padding - 40);
            ctx.fillStyle = config.colors.text;
          }
          break;
      }
      yPosition += spacing;
    }

    // 渲染品牌元素
    if (config.branding.enableBrandLogo) {
      await renderBrandElements(ctx, template, config);
    }
  };

  const renderText = (
    ctx: CanvasRenderingContext2D, 
    text: string, 
    x: number, 
    y: number, 
    maxWidth: number
  ): number => {
    const words = text.split(' ');
    const lineHeight = 1.4;
    const fontSize = parseInt(ctx.font.match(/\d+/)?.[0] || '16');
    let line = '';
    let lineCount = 0;

    for (let i = 0; i < words.length; i++) {
      const testLine = line + words[i] + ' ';
      const metrics = ctx.measureText(testLine);
      
      if (metrics.width > maxWidth && i > 0) {
        ctx.fillText(line, x, y + lineCount * fontSize * lineHeight);
        line = words[i] + ' ';
        lineCount++;
      } else {
        line = testLine;
      }
    }
    
    ctx.fillText(line, x, y + lineCount * fontSize * lineHeight);
    return (lineCount + 1) * fontSize * lineHeight;
  };

  const renderBrandElements = async (
    ctx: CanvasRenderingContext2D,
    template: CardTemplate,
    config: CardConfiguration
  ) => {
    // 渲染水印或Logo
    if (config.branding.watermark) {
      ctx.globalAlpha = 0.3;
      ctx.fillStyle = config.colors.accent;
      ctx.font = 'var(--spacing-3) Arial';
      
      const text = config.branding.watermark;
      const metrics = ctx.measureText(text);
      
      // 根据位置配置放置水印
      let x = 10, y = template.dimensions.height - 10;
      switch (config.branding.logoPosition) {
        case 'top-left':
          x = 10;
          y = 20;
          break;
        case 'top-right':
          x = template.dimensions.width - metrics.width - 10;
          y = 20;
          break;
        case 'bottom-right':
          x = template.dimensions.width - metrics.width - 10;
          y = template.dimensions.height - 10;
          break;
      }
      
      ctx.fillText(text, x, y);
      ctx.globalAlpha = 1;
    }
  };

  const getFontSize = (size: 'small' | 'medium' | 'large'): number => {
    switch (size) {
      case 'small': return 14;
      case 'large': return 20;
      case 'medium':
      default: return 16;
    }
  };

  const handleCopyImage = async () => {
    if (!renderedCard) return;

    try {
      const response = await fetch(renderedCard);
      const blob = await response.blob();
      
      await navigator.clipboard.write([
        new ClipboardItem({
          [blob.type]: blob
        })
      ]);

      toast({
        title: '复制成功',
        description: '卡片图片已复制到剪贴板',
      });
    } catch (error) {
      console.error('复制失败:', error);
      toast({
        title: '复制失败',
        description: '无法复制图片到剪贴板',
        variant: 'destructive'
      });
    }
  };

  const dimensions = getPreviewDimensions();

  return (
    <div className={`flex flex-col h-full ${className}`}>
      {/* 预览工具栏 */}
      <div className="flex items-center justify-between p-3 border-b border-border bg-muted/30">
        <div className="flex items-center gap-2">
          <Eye className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-medium">
            预览 {template ? `(${template.displayName})` : ''}
          </span>
          {isGenerating && (
            <RefreshCw className="w-3 h-3 animate-spin text-muted-foreground ml-2" />
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* 设备预览模式 */}
          <div className="flex items-center gap-1 border border-border rounded-md">
            <Button
              variant={previewMode === 'desktop' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onPreviewModeChange('desktop')}
              className="px-2 py-1"
            >
              <Monitor className="w-3 h-3" />
            </Button>
            <Button
              variant={previewMode === 'tablet' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onPreviewModeChange('tablet')}
              className="px-2 py-1"
            >
              <Tablet className="w-3 h-3" />
            </Button>
            <Button
              variant={previewMode === 'mobile' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onPreviewModeChange('mobile')}
              className="px-2 py-1"
            >
              <Smartphone className="w-3 h-3" />
            </Button>
          </div>

          {/* 缩放控制 */}
          <div className="flex items-center gap-1 border border-border rounded-md">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                const levels: ZoomLevel[] = [0.5, 0.75, 1, 1.25, 1.5, 2];
                const currentIndex = levels.indexOf(zoomLevel);
                if (currentIndex > 0) {
                  onZoomChange(levels[currentIndex - 1]);
                }
              }}
              disabled={zoomLevel <= 0.5}
              className="px-2 py-1"
            >
              <ZoomOut className="w-3 h-3" />
            </Button>
            <span className="px-2 text-xs text-muted-foreground">
              {Math.round(zoomLevel * 100)}%
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                const levels: ZoomLevel[] = [0.5, 0.75, 1, 1.25, 1.5, 2];
                const currentIndex = levels.indexOf(zoomLevel);
                if (currentIndex < levels.length - 1) {
                  onZoomChange(levels[currentIndex + 1]);
                }
              }}
              disabled={zoomLevel >= 2}
              className="px-2 py-1"
            >
              <ZoomIn className="w-3 h-3" />
            </Button>
          </div>

          {/* 操作按钮 */}
          {renderedCard && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyImage}
              >
                <Copy className="w-4 h-4 mr-1" />
                复制
              </Button>
              
              {onExport && (
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => onExport('png')}
                >
                  <Download className="w-4 h-4 mr-1" />
                  下载
                </Button>
              )}
            </>
          )}
        </div>
      </div>

      {/* 预览内容区域 */}
      <div className="flex-1 flex items-center justify-center p-4 bg-muted/20 overflow-auto">
        <div
          className="relative bg-background rounded-lg shadow-lg transition-all duration-200 card-preview-container"
          style={{
            '--card-width': `${dimensions.width}px`,
            '--card-height': `${dimensions.height}px`
          } as React.CSSProperties}
        >
          {/* 隐藏的Canvas用于渲染 */}
          <canvas
            ref={canvasRef}
            className="hidden"
            width={template?.dimensions.width || 800}
            height={template?.dimensions.height || 600}
          />

          {/* 预览内容 */}
          {isGenerating ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center text-muted-foreground">
                <RefreshCw className="w-8 h-8 mx-auto mb-2 animate-spin" />
                <p className="text-sm">正在生成卡片...</p>
              </div>
            </div>
          ) : renderedCard ? (
            <img 
              src={renderedCard} 
              alt="Generated Card Preview" 
              className="w-full h-full object-contain rounded-lg"
            />
          ) : (
            <div className="flex items-center justify-center h-full border-2 border-dashed border-border rounded-lg">
              <div className="text-center text-muted-foreground">
                <Eye className="w-8 h-8 mx-auto mb-2" />
                <p className="text-sm">
                  {parsedContent ? '正在渲染卡片...' : '输入内容开始生成卡片'}
                </p>
              </div>
            </div>
          )}

          {/* 尺寸信息 */}
          {template && (
            <div className="absolute bottom-2 right-2 bg-foreground/75 text-background text-xs px-2 py-1 rounded">
              {template.dimensions.width} × {template.dimensions.height}
            </div>
          )}
        </div>
      </div>

      {/* 预览信息 */}
      <div className="p-3 border-t border-border bg-muted/30">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-4">
            {template && (
              <>
                <span>模板: {template.displayName}</span>
                <span>比例: {template.dimensions.aspectRatio}</span>
                <span>预览: {previewMode}</span>
              </>
            )}
          </div>
          <div className="flex items-center gap-4">
            {parsedContent && (
              <>
                <span>{parsedContent.metadata.wordCount} 字</span>
                <span>{parsedContent.sections.length} 段落</span>
                <span>复杂度: {parsedContent.metadata.complexity}</span>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CardPreview;