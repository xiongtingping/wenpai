/**
 * 导出控制组件
 * 提供复制HTML代码、下载文件等导出功能
 */

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { 
  Download, 
  Copy, 
  FileText, 
  Code, 
  Share2,
  Check,
  ChevronDown,
  ExternalLink,
  Image,
  FileDown
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface ExportControlsProps {
  htmlContent: string;
  markdownContent: string;
  theme: string;
  className?: string;
}

type ExportFormat = 'html' | 'markdown' | 'styled-html' | 'image' | 'pdf';

interface ExportOption {
  id: ExportFormat;
  label: string;
  description: string;
  icon: React.ReactNode;
  action: () => void;
  disabled?: boolean;
}

/**
 * 导出控制组件
 */
export function ExportControls({
  htmlContent,
  markdownContent,
  theme,
  className
}: ExportControlsProps) {
  const { toast } = useToast();
  const [isCodeDialogOpen, setIsCodeDialogOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportFormat, setExportFormat] = useState<ExportFormat>('html');

  // 复制到剪贴板
  const copyToClipboard = async (content: string, label: string) => {
    try {
      await navigator.clipboard.writeText(content);
      toast({
        title: '复制成功',
        description: `${label}已复制到剪贴板`,
      });
      return true;
    } catch (error) {
      toast({
        title: '复制失败',
        description: '请手动选择内容复制',
        variant: 'destructive'
      });
      return false;
    }
  };

  // 下载文件
  const downloadFile = (content: string, filename: string, contentType: string = 'text/plain') => {
    try {
      const blob = new Blob([content], { type: contentType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast({
        title: '下载成功',
        description: `文件 ${filename} 已保存`,
      });
    } catch (error) {
      toast({
        title: '下载失败',
        description: '文件下载时出现错误',
        variant: 'destructive'
      });
    }
  };

  // 生成带样式的完整HTML
  const generateStyledHTML = (): string => {
    const cssStyles = `
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif;
          line-height: 1.8;
          color: #333;
          background: #fff;
          max-width: 800px;
          margin: 0 auto;
          padding: var(--spacing-5);
        }
        h1, h2, h3 { color: #ff6b6b; margin-top: 1.5em; margin-bottom: 0.8em; }
        h1 { font-size: 1.5em; border-bottom: var(--spacing-0-5) solid #ff6b6b; padding-bottom: 0.3em; }
        h2 { font-size: 1.3em; border-left: var(--spacing-1) solid #ff6b6b; padding-left: 0.5em; }
        h3 { font-size: 1.1em; }
        p { margin: 0.8em 0; text-align: justify; }
        blockquote { 
          margin: 1em 0; padding: 0.8em 1em; 
          background: #ffeaea; border-left: var(--spacing-1) solid #ff6b6b; 
          border-radius: var(--radius-none) var(--spacing-1) var(--spacing-1) 0; font-style: italic; 
        }
        code { 
          background: #f5f5f5; padding: 0.2em 0.4em; 
          border-radius: 3px; font-family: 'Monaco', 'Menlo', monospace; 
        }
        pre { 
          background: #f8f8f8; padding: 1em; border-radius: var(--spacing-1-5); 
          overflow-x: auto; margin: 1em 0; border: 1px solid #eee; 
        }
        ul, ol { margin: 0.8em 0; padding-left: 2em; }
        li { margin: 0.3em 0; }
        img { max-width: 100%; height: auto; margin: 1em 0; border-radius: var(--spacing-1); }
        a { color: #ff6b6b; text-decoration: none; }
        a:hover { text-decoration: underline; }
        strong { color: #ff6b6b; }
        em { color: #ff8787; }
      </style>
    `;

    return `
      <!DOCTYPE html>
      <html lang="zh-CN">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>微信公众号文章</title>
        ${cssStyles}
      </head>
      <body>
        ${htmlContent}
      </body>
      </html>
    `;
  };

  // 复制纯HTML代码
  const handleCopyHTML = () => copyToClipboard(htmlContent, 'HTML代码');

  // 复制Markdown代码
  const handleCopyMarkdown = () => copyToClipboard(markdownContent, 'Markdown代码');

  // 复制带样式的HTML
  const handleCopyStyledHTML = () => copyToClipboard(generateStyledHTML(), '完整HTML文档');

  // 下载Markdown文件
  const handleDownloadMarkdown = () => {
    const filename = `article_${new Date().toISOString().split('T')[0]}.md`;
    downloadFile(markdownContent, filename, 'text/markdown');
  };

  // 下载HTML文件
  const handleDownloadHTML = () => {
    const filename = `article_${new Date().toISOString().split('T')[0]}.html`;
    downloadFile(generateStyledHTML(), filename, 'text/html');
  };

  // 导出为图片（模拟功能）
  const handleExportImage = async () => {
    setIsExporting(true);
    try {
      // 这里可以集成html2canvas或类似库
      await new Promise(resolve => setTimeout(resolve, 2000)); // 模拟导出过程
      toast({
        title: '功能开发中',
        description: '图片导出功能即将上线',
      });
    } finally {
      setIsExporting(false);
    }
  };

  // 导出为PDF（模拟功能）
  const handleExportPDF = async () => {
    setIsExporting(true);
    try {
      // 这里可以集成jsPDF或类似库
      await new Promise(resolve => setTimeout(resolve, 2000)); // 模拟导出过程
      toast({
        title: '功能开发中',
        description: 'PDF导出功能即将上线',
      });
    } finally {
      setIsExporting(false);
    }
  };

  // 分享到微信（模拟功能）
  const handleShareToWechat = () => {
    // 显示代码预览对话框
    setExportFormat('html');
    setIsCodeDialogOpen(true);
  };

  // 导出选项配置
  const exportOptions: ExportOption[] = [
    {
      id: 'html',
      label: '复制HTML代码',
      description: '复制纯HTML代码，适合粘贴到编辑器',
      icon: <Code className="w-4 h-4" />,
      action: handleCopyHTML
    },
    {
      id: 'styled-html',
      label: '复制完整HTML',
      description: '包含样式的完整HTML文档',
      icon: <FileText className="w-4 h-4" />,
      action: handleCopyStyledHTML
    },
    {
      id: 'markdown',
      label: '复制Markdown',
      description: '复制原始Markdown代码',
      icon: <FileDown className="w-4 h-4" />,
      action: handleCopyMarkdown
    }
  ];

  const downloadOptions: ExportOption[] = [
    {
      id: 'html',
      label: '下载HTML文件',
      description: '保存为完整的HTML文档',
      icon: <FileText className="w-4 h-4" />,
      action: handleDownloadHTML
    },
    {
      id: 'markdown',
      label: '下载Markdown文件',
      description: '保存为.md格式文件',
      icon: <FileDown className="w-4 h-4" />,
      action: handleDownloadMarkdown
    },
    {
      id: 'image',
      label: '导出为图片',
      description: '生成PNG格式图片',
      icon: <Image className="w-4 h-4" />,
      action: handleExportImage,
      disabled: true
    },
    {
      id: 'pdf',
      label: '导出为PDF',
      description: '生成PDF文档',
      icon: <FileText className="w-4 h-4" />,
      action: handleExportPDF,
      disabled: true
    }
  ];

  return (
    <div className={cn('flex items-center gap-2', className)}>
      {/* 快速复制按钮 */}
      <Button
        onClick={handleCopyHTML}
        size="sm"
        className="flex items-center gap-1"
      >
        <Copy className="w-4 h-4" />
        <span className="hidden sm:inline">复制</span>
      </Button>

      {/* 导出菜单 */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="outline" 
            size="sm"
            disabled={isExporting}
            className="flex items-center gap-1"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">导出</span>
            <ChevronDown className="w-3 h-3" />
          </Button>
        </DropdownMenuTrigger>
        
        <DropdownMenuContent 
          className="w-64"
          align="end"
        >
          {/* 复制选项 */}
          <DropdownMenuLabel>快速复制</DropdownMenuLabel>
          {exportOptions.map((option) => (
            <DropdownMenuItem
              key={option.id}
              onClick={option.action}
              disabled={option.disabled}
              className="flex items-start gap-3 p-3 cursor-pointer"
            >
              <div className="flex-shrink-0 mt-0.5">
                {option.icon}
              </div>
              <div className="flex-1">
                <div className="font-medium text-sm">{option.label}</div>
                <div className="text-xs text-muted-foreground mt-0.5">
                  {option.description}
                </div>
              </div>
            </DropdownMenuItem>
          ))}

          <DropdownMenuSeparator />

          {/* 下载选项 */}
          <DropdownMenuLabel>文件下载</DropdownMenuLabel>
          {downloadOptions.map((option) => (
            <DropdownMenuItem
              key={option.id}
              onClick={option.action}
              disabled={option.disabled || isExporting}
              className="flex items-start gap-3 p-3 cursor-pointer"
            >
              <div className="flex-shrink-0 mt-0.5">
                {option.icon}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm">{option.label}</span>
                  {option.disabled && (
                    <Badge variant="secondary" className="text-xs">
                      即将上线
                    </Badge>
                  )}
                </div>
                <div className="text-xs text-muted-foreground mt-0.5">
                  {option.description}
                </div>
              </div>
            </DropdownMenuItem>
          ))}

          <DropdownMenuSeparator />

          {/* 分享选项 */}
          <DropdownMenuItem
            onClick={handleShareToWechat}
            className="flex items-center gap-3 p-3 cursor-pointer"
          >
            <Share2 className="w-4 h-4" />
            <div>
              <div className="font-medium text-sm">查看代码</div>
              <div className="text-xs text-muted-foreground">预览导出代码</div>
            </div>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* 代码预览对话框 */}
      <Dialog open={isCodeDialogOpen} onOpenChange={setIsCodeDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Code className="w-5 h-5" />
              导出代码预览
            </DialogTitle>
            <DialogDescription>
              复制以下代码到微信公众号编辑器中
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-hidden">
            <Textarea
              value={exportFormat === 'html' ? htmlContent : generateStyledHTML()}
              readOnly
              className="h-full min-h-[400px] font-mono text-sm"
              placeholder="生成的代码将在这里显示..."
            />
          </div>

          <DialogFooter className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge variant="outline">{theme}主题</Badge>
              <span className="text-xs text-muted-foreground">
                {exportFormat === 'html' ? '纯HTML代码' : '完整HTML文档'}
              </span>
            </div>
            
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => copyToClipboard(
                  exportFormat === 'html' ? htmlContent : generateStyledHTML(),
                  '导出代码'
                )}
              >
                <Copy className="w-4 h-4 mr-2" />
                复制代码
              </Button>
              <Button onClick={() => setIsCodeDialogOpen(false)}>
                关闭
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}