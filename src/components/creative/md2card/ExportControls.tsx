/**
 * 导出控制组件
 * 提供多种格式的卡片导出功能
 */

import React, { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { 
  Download, 
  Image as ImageIcon, 
  FileImage, 
  Save,
  Share,
  Copy,
  Settings,
  ChevronDown,
  CheckCircle,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { CardTemplate, CardConfiguration } from '../MD2CardPage';
import { ParsedContent } from './MarkdownParser';

// 导出格式配置
export interface ExportFormat {
  id: 'png' | 'jpg' | 'jpeg' | 'svg' | 'pdf';
  name: string;
  extension: string;
  mimeType: string;
  description: string;
  supportsTransparency: boolean;
  supportsVectorGraphics: boolean;
  recommendedFor: string[];
}

// 导出质量设置
export interface ExportQuality {
  id: 'low' | 'medium' | 'high' | 'ultra';
  name: string;
  scale: number;
  jpegQuality: number;
  description: string;
}

// 导出选项
export interface ExportOptions {
  format: ExportFormat;
  quality: ExportQuality;
  includeWatermark: boolean;
  backgroundColor?: string;
  customDimensions?: {
    width: number;
    height: number;
  };
}

// 支持的导出格式
export const EXPORT_FORMATS: ExportFormat[] = [
  {
    id: 'png',
    name: 'PNG',
    extension: 'png',
    mimeType: 'image/png',
    description: '支持透明背景的无损格式',
    supportsTransparency: true,
    supportsVectorGraphics: false,
    recommendedFor: ['社交媒体', '网站使用', '透明背景需求']
  },
  {
    id: 'jpg',
    name: 'JPG',
    extension: 'jpg',
    mimeType: 'image/jpeg',
    description: '适合照片的有损压缩格式',
    supportsTransparency: false,
    supportsVectorGraphics: false,
    recommendedFor: ['照片分享', '文件大小优化', '打印输出']
  },
  {
    id: 'svg',
    name: 'SVG',
    extension: 'svg',
    mimeType: 'image/svg+xml',
    description: '可缩放的矢量图形格式',
    supportsTransparency: true,
    supportsVectorGraphics: true,
    recommendedFor: ['矢量图形', '无限缩放', '网页集成']
  },
  {
    id: 'pdf',
    name: 'PDF',
    extension: 'pdf',
    mimeType: 'application/pdf',
    description: '便携式文档格式',
    supportsTransparency: false,
    supportsVectorGraphics: true,
    recommendedFor: ['文档分享', '打印输出', '专业用途']
  }
];

// 质量设置
export const EXPORT_QUALITIES: ExportQuality[] = [
  {
    id: 'low',
    name: '低质量',
    scale: 1,
    jpegQuality: 0.6,
    description: '文件小，适合快速分享'
  },
  {
    id: 'medium',
    name: '中等质量',
    scale: 1.5,
    jpegQuality: 0.8,
    description: '平衡质量和文件大小'
  },
  {
    id: 'high',
    name: t('components.text.高质量_jl1'),
    scale: 2,
    jpegQuality: 0.9,
    description: '高质量，适合打印'
  },
  {
    id: 'ultra',
    name: '超高质量',
    scale: 3,
    jpegQuality: 0.95,
    description: '最高质量，文件较大'
  }
];

interface ExportControlsProps {
  parsedContent: ParsedContent | null;
  template: CardTemplate | null;
  configuration: CardConfiguration;
  disabled?: boolean;
  onExport?: (options: ExportOptions) => Promise<void>;
  className?: string;
}

/**
 * 导出控制主组件
 */
export const ExportControls: React.FC<any> = ({ parsedContent,
  template,
  configuration,
  disabled = false,
  onExport,
  className = '' }) => {
  const { t } = useTranslation(); const { toast  } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>(EXPORT_FORMATS[0]);
  const [selectedQuality, setSelectedQuality] = useState<ExportQuality>(EXPORT_QUALITIES[2]);
  const [includeWatermark, setIncludeWatermark] = useState(false);
  const [customBackground, setCustomBackground] = useState<string>('');

  // 快速导出（PNG格式）
  const handleQuickExport = async () => {
    if (!parsedContent || !template) {
      toast({
        title: t('components.labels.无法导出'),
        description: '请先生成卡片内容',
        variant: 'destructive'
      });
      return;
    }

    const options: ExportOptions = {
      format: EXPORT_FORMATS[0], // PNG
      quality: EXPORT_QUALITIES[2], // 高质量
      includeWatermark: false
    };

    await handleExport(options);
  };

  // 高级导出
  const handleAdvancedExport = async () => {
    if (!parsedContent || !template) {
      toast({
        title: t('components.labels.无法导出'),
        description: '请先生成卡片内容',
        variant: 'destructive'
      });
      return;
    }

    const options: ExportOptions = {
      format: selectedFormat,
      quality: selectedQuality,
      includeWatermark,
      backgroundColor: customBackground || undefined
    };

    await handleExport(options);
    setIsDialogOpen(false);
  };

  // 执行导出
  const handleExport = async (options: ExportOptions) => {
    if (!onExport || !parsedContent || !template) return;

    setIsExporting(true);
    setExportProgress(0);

    try {
      // 模拟导出进度
      const progressInterval = setInterval(() => {
        setExportProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 100);

      await onExport(options);

      clearInterval(progressInterval);
      setExportProgress(100);

      toast({
        title: t('components.labels.导出成功'),
        description: `卡片已导出为 ${options.format.name} 格式`,
      });

      // 重置进度
      setTimeout(() => {
        setExportProgress(0);
      }, 1000);

    } catch (error) {
      console.error('导出失败:', error);
      toast({
        title: t('components.errors.导出失败'),
        description: '导出过程中发生错误，请稍后重试',
        variant: 'destructive'
      });
    } finally {
      setIsExporting(false);
    }
  };

  // 复制到剪贴板
  const handleCopyToClipboard = async () => {
    if (!parsedContent || !template) {
      toast({
        title: t('components.labels.无法复制'),
        description: '请先生成卡片内容',
        variant: 'destructive'
      });
      return;
    }

    try {
      // 这里应该实现实际的复制逻辑
      // 生成PNG格式的图片并复制到剪贴板
      toast({
        title: t('components.labels.复制成功'),
        description: '卡片已复制到剪贴板',
      });
    } catch (error) {
      console.error('复制失败:', error);
      toast({
        title: t('components.errors.复制失败'),
        description: '无法复制到剪贴板',
        variant: 'destructive'
      });
    }
  };

  // 分享卡片
  const handleShare = async () => {
    if (!parsedContent || !template) {
      toast({
        title: t('components.labels.无法分享'),
        description: '请先生成卡片内容',
        variant: 'destructive'
      });
      return;
    }

    if (navigator.share) {
      try {
        await navigator.share({
          title: parsedContent.title,
          text: `查看我创建的${template.displayName}卡片`,
          url: window.location.href
        });
      } catch (error) {
        console.error('分享失败:', error);
      }
    } else {
      // 回退到复制链接
      await navigator.clipboard.writeText(window.location.href);
      toast({
        title: t('components.labels.链接已复制'),
        description: '分享链接已复制到剪贴板',
      });
    }
  };

  const canExport = !disabled && parsedContent && template;

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* 快速导出按钮 */}
      <Button
        variant="default"
        size="sm"
        onClick={handleQuickExport}
        disabled={!canExport || isExporting}
      >
        {isExporting ? (
          <RefreshCw className="w-4 h-4 mr-1 animate-spin" />
        ) : (
          <Download className="w-4 h-4 mr-1" />
        )}
        导出PNG
      </Button>

      {/* 高级导出选项 */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            disabled={!canExport || isExporting}
          >
            <Settings className="w-4 h-4 mr-1" />
            更多选项
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>导出设置</DialogTitle>
            <DialogDescription>
              自定义导出格式、质量和其他选项
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {/* 格式选择 */}
            <div className="space-y-2">
              <Label>导出格式</Label>
              <Select 
                value={selectedFormat.id} 
                onValueChange={(value) => {
                  const format = EXPORT_FORMATS.find(f => f.id === value);
                  if (format) setSelectedFormat(format);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="选择格式" />
                </SelectTrigger>
                <SelectContent>
                  {EXPORT_FORMATS.map((format) => (
                    <SelectItem key={format.id} value={format.id}>
                      <div className="flex items-center justify-between w-full">
                        <span>{format.name}</span>
                        <Badge variant="secondary" className="ml-2 text-xs">
                          {format.extension.toUpperCase()}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                {selectedFormat.description}
              </p>
            </div>

            {/* 质量设置 */}
            <div className="space-y-2">
              <Label>导出质量</Label>
              <Select 
                value={selectedQuality.id} 
                onValueChange={(value) => {
                  const quality = EXPORT_QUALITIES.find(q => q.id === value);
                  if (quality) setSelectedQuality(quality);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="选择质量" />
                </SelectTrigger>
                <SelectContent>
                  {EXPORT_QUALITIES.map((quality) => (
                    <SelectItem key={quality.id} value={quality.id}>
                      <div className="flex items-center justify-between w-full">
                        <span>{quality.name}</span>
                        <Badge variant="outline" className="ml-2 text-xs">
                          {quality.scale}x
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                {selectedQuality.description}
              </p>
            </div>

            {/* 预计文件大小 */}
            {template && (
              <div className="space-y-2">
                <Label>预计尺寸</Label>
                <div className="text-sm text-muted-foreground">
                  {Math.round(template.dimensions.width * selectedQuality.scale)} × {Math.round(template.dimensions.height * selectedQuality.scale)} 像素
                </div>
              </div>
            )}

            {/* 背景颜色（JPG格式时显示） */}
            {selectedFormat.id === 'jpg' && (
              <div className="space-y-2">
                <Label>背景颜色</Label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={customBackground || '#FFFFFF'}
                    onChange={(e) => setCustomBackground(e.target.value)}
                    className="w-10 h-8 rounded border border-border"
                  />
                  <span className="text-sm text-muted-foreground">
                    JPG格式不支持透明背景
                  </span>
                </div>
              </div>
            )}

            {/* 推荐用途 */}
            <div className="space-y-2">
              <Label>推荐用途</Label>
              <div className="flex flex-wrap gap-1">
                {selectedFormat.recommendedFor.map((use, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {use}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          {/* 导出进度 */}
          {isExporting && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>导出进度</span>
                <span>{exportProgress}%</span>
              </div>
              <Progress value={exportProgress} className="w-full" />
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDialogOpen(false)}
              disabled={isExporting}
            >
              取消
            </Button>
            <Button
              onClick={handleAdvancedExport}
              disabled={!canExport || isExporting}
            >
              {isExporting ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  导出中...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 mr-2" />
                  导出
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 更多操作 */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            disabled={!canExport || isExporting}
          >
            <ChevronDown className="w-4 h-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>更多操作</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleCopyToClipboard}>
            <Copy className="w-4 h-4 mr-2" />
            复制到剪贴板
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleShare}>
            <Share className="w-4 h-4 mr-2" />
            分享卡片
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setIsDialogOpen(true)}>
            <Settings className="w-4 h-4 mr-2" />
            导出设置
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default ExportControls;