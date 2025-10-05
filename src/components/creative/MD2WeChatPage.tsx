/**
 * Markdown转微信公众号排版工具
 * 支持多主题、实时预览、导出等功能
 */

import React, { useState, useCallback, useEffect, ErrorInfo } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  FileText, 
  Download, 
  Copy, 
  Upload, 
  Settings, 
  Eye, 
  EyeOff,
  Smartphone,
  Monitor,
  Save,
  RotateCcw,
  Palette,
  Type,
  RefreshCw
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuthStore } from '@/stores/compatibility-layer';
import { useUsageStore } from '@/stores/compatibility-layer';
import { PermissionProtectedInput } from '@/components/auth/PermissionProtectedInput';
import { PermissionLockedButton } from '@/components/auth/PermissionLockedButton';
import { RoleBasedUpgradePrompt } from '@/components/ui/RoleBasedUpgradePrompt';
// import { Header } from '@/components/landing/Header'; // 移除Header导入，该组件作为Tab内容使用
import { MarkdownEditor } from './md2wechat/MarkdownEditor';
import { ThemeSelector } from './md2wechat/ThemeSelector';
import { PreviewPanel } from './md2wechat/PreviewPanel';
// import { ExportControls } from './md2wechat/ExportControls'; // 模块不存在，暂时注释
import { convertMarkdownToHTML } from '@/services/md2wechatService';
import { useDebouncedCallback } from 'use-debounce';

// 文档数据模型
export interface MarkdownDocument {
  id: string;
  title: string;
  content: string;
  theme: string;
  fontSize: 'small' | 'medium' | 'large';
  createdAt: Date;
  updatedAt: Date;
  wordCount: number;
  estimatedReadTime: number;
}

// 主题配置模型
export interface ThemeConfig {
  id: string;
  name: string;
  displayName: string;
  description: string;
  previewImage?: string;
  isDefault: boolean;
  isFavorite: boolean;
}

/**
 * MD2WeChat主页面组件
 */
export default function MD2WeChatPage() { const { toast  } = useToast();
  const { user, isAuthenticated } = useAuthStore();
  const { recordUsage } = useUsageStore();
  
  // 状态管理
  const [markdownContent, setMarkdownContent] = useState('# 欢迎使用Markdown排版工具\n\n这是一个专为微信公众号设计的Markdown转换工具。\n\n## 功能特点\n\n- 🎨 多种精美主题\n- 📱 移动端适配预览\n- 🚀 一键复制导出\n- ⚡ 实时预览效果\n\n## 使用方法\n\n1. 在左侧编辑器中输入Markdown内容\n2. 选择合适的主题样式\n3. 预览转换效果\n4. 一键复制到微信公众号\n\n开始你的创作之旅吧！');
  const [selectedTheme, setSelectedTheme] = useState('default');
  const [fontSize, setFontSize] = useState<'small' | 'medium' | 'large'>('medium');
  const [previewHtml, setPreviewHtml] = useState('');
  const [isConverting, setIsConverting] = useState(false);
  const [isMobilePreview, setIsMobilePreview] = useState(false);
  const [showPreview, setShowPreview] = useState(true);
  const [hasError, setHasError] = useState(false);

  // 文档统计
  const [wordCount, setWordCount] = useState(0);
  const [estimatedReadTime, setEstimatedReadTime] = useState(0);

  // 计算文档统计信息
  useEffect(() => {
    const words = markdownContent.replace(/[#*\-\[\]()]/g, '').split(/\s+/).filter(word => word.length > 0).length;
    setWordCount(words);
    setEstimatedReadTime(Math.ceil(words / 200)); // 假设每分钟阅读200字
  }, [markdownContent]);

  // 🔧 FIX: 简化转换函数，避免Hook调用问题
  const convertContent = useCallback(async (content: string, theme: string, size: string) => {
    if (!content.trim()) {
      setPreviewHtml('');
      return;
    }

    setIsConverting(true);
    try {
      const result = await convertMarkdownToHTML({
        markdown: content,
        theme,
        fontSize: size as 'small' | 'medium' | 'large'
      });

      if (result.success) {
        setPreviewHtml(result.html);
      } else {
        throw new Error(result.error || t('components.errors.转换失败'));
      }
    } catch (error) {
      console.error('transformfailed:', error);
      // 设置基础的HTML预览
      setPreviewHtml(`<div class="markdown-content">${content.replace(/\n/g, '<br>')}</div>`);
    } finally {
      setIsConverting(false);
    }
  }, []);

  // 使用简单的防抖机制
  const debouncedConvert = useDebouncedCallback(convertContent, 150);

  // 监听内容和主题变化，触发转换
  useEffect(() => {
    debouncedConvert(markdownContent, selectedTheme, fontSize);
  }, [markdownContent, selectedTheme, fontSize]); // 🔧 FIX: 移除debouncedConvert依赖，避免无限循环

  // 组件卸载时的清理
  useEffect(() => {
    return () => {
      // 清理可能存在的动态创建的DOM元素
      try {
        const dynamicInputs = document.querySelectorAll('input[type="file"][style*="display: none"], input[type="file"][style*="position: absolute"]');
        dynamicInputs.forEach(input => {
          try {
            if (input && input.parentNode && input.parentNode.contains(input)) {
              input.parentNode.removeChild(input);
            }
          } catch (error) {
            console.warn('cleaning动态input元素时出错:', error);
          }
        });
      } catch (error) {
        console.warn('componentcleaning时出错:', error);
      }
    };
  }, []);

  // 错误处理
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      if (event.message && event.message.includes('removeChild')) {
        console.warn('捕获到DOM操作error，alreadyprocessing:', event.message);
        setHasError(true);
        // 3秒后重置错误状态
        setTimeout(() => setHasError(false), 3000);
        event.preventDefault();
        return false;
      }
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      if (event.reason && typeof event.reason === 'string' && event.reason.includes('removeChild')) {
        console.warn('捕获到Promise DOMerror，alreadyprocessing:', event.reason);
        setHasError(true);
        setTimeout(() => setHasError(false), 3000);
        event.preventDefault();
      }
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  // 处理内容变化
  const handleContentChange = useCallback((content: string) => {
    setMarkdownContent(content);
  }, []);

  // 处理主题变化
  const handleThemeChange = useCallback((theme: string) => {
    setSelectedTheme(theme);
    toast({
      title: t('components.labels.主题已切换'),
      description: `已切换到 ${theme} 主题`,
    });
  }, [toast]);

  // 处理字体大小变化
  const handleFontSizeChange = useCallback((size: 'small' | 'medium' | 'large') => {
    setFontSize(size);
  }, []);

  // 导入文档
  const handleImportDocument = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setMarkdownContent(content);
      toast({
        title: t('components.labels.文档导入成功'),
        description: `已导入文档: ${file.name}`,
      });
    };
    reader.readAsText(file);
  }, [toast]);

  // 安全的文件选择处理
  const handleFileSelect = useCallback(() => {
    try {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.md,.txt';
      input.style.display = 'none';
      input.style.position = 'absolute';
      input.style.left = '-9999px';

      const cleanup = () => {
        try {
          if (input && input.parentNode) {
            input.parentNode.removeChild(input);
          }
        } catch (cleanupError) {
          console.warn('DOMcleaningwarning:', cleanupError);
        }
      };

      const handleChange = (e: Event) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (file) {
          handleImportDocument(file);
        }

        // 移除事件监听器
        input.removeEventListener('change', handleChange);

        // 延迟清理DOM元素，避免立即操作冲突
        setTimeout(cleanup, 100);
      };

      // 添加错误处理
      const handleError = () => {
        input.removeEventListener('change', handleChange);
        input.removeEventListener('error', handleError);
        setTimeout(cleanup, 100);
      };

      input.addEventListener('change', handleChange);
      input.addEventListener('error', handleError);

      // 安全地添加到DOM
      try {
        document.body.appendChild(input);
        input.click();
      } catch (appendError) {
        console.error('DOM操作failed:', appendError);
        cleanup();
        throw appendError;
      }
    } catch (error) {
      console.error('file选择failed:', error);
      toast({
        title: t('components.errors.文件选择失败'),
        description: '请重试或检查浏览器权限',
        variant: 'destructive'
      });
    }
  }, [handleImportDocument, toast]);

  // 重置内容
  const handleReset = useCallback(() => {
    setMarkdownContent('# 欢迎使用Markdown排版工具\n\n开始你的创作之旅...');
    setSelectedTheme('default');
    setFontSize('medium');
    toast({
      title: t('components.labels.内容已重置'),
      description: '编辑器已恢复初始状态',
    });
  }, [toast]);

  // 如果有错误，显示简化的错误恢复界面
  if (hasError) {
    return (
      <div className="bg-background">
        <div className="w-full max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <RefreshCw className="w-8 h-8 mx-auto mb-4 text-muted-foreground animate-spin" />
              <p className="text-muted-foreground">正在恢复组件状态...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background">
      <div className="w-full max-w-7xl mx-auto">
        <div className="h-full bg-background">
          {/* 工具栏 */}
          <div className="border-b border-border bg-card">
            <div className="px-4 py-3">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                {/* 左侧工具组 */}
                <div className="flex items-center gap-4">
                  {/* 字体调节 */}
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">字体大小:</span>
                    <div className="flex items-center gap-1 border border-border rounded-md">
                      <Button
                        variant={fontSize === 'small' ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => handleFontSizeChange('small')}
                        className="px-2 py-1 text-xs"
                      >
                        小
                      </Button>
                      <Button
                        variant={fontSize === 'medium' ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => handleFontSizeChange('medium')}
                        className="px-2 py-1 text-xs"
                      >
                        中
                      </Button>
                      <Button
                        variant={fontSize === 'large' ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => handleFontSizeChange('large')}
                        className="px-2 py-1 text-xs"
                      >
                        大
                      </Button>
                    </div>
                  </div>
                  
                  {/* 主题样式 */}
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">主题样式:</span>
                    <ThemeSelector
                      selectedTheme={selectedTheme}
                      onThemeChange={handleThemeChange}
                    />
                  </div>
                </div>

                {/* 右侧操作组 */}
                <div className="flex flex-wrap items-center gap-2">
                  {/* 预览切换 */}
                  <div className="flex items-center gap-1 border border-border rounded-md flex-shrink-0">
                    <Button
                      variant={!isMobilePreview ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setIsMobilePreview(false)}
                      className="px-2 py-1"
                    >
                      <Monitor className="w-3 h-3" />
                    </Button>
                    <Button
                      variant={isMobilePreview ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setIsMobilePreview(true)}
                      className="px-2 py-1"
                    >
                      <Smartphone className="w-3 h-3" />
                    </Button>
                  </div>

                  {/* 导入文档 */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleFileSelect}
                    className="flex-shrink-0 flex items-center gap-1"
                  >
                    <Upload className="w-4 h-4" />
                    <span>导入</span>
                  </Button>

                  {/* 重置 */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleReset}
                    className="flex-shrink-0 flex items-center gap-1"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>重置</span>
                  </Button>

                  {/* 导出控制 */}
                  <PermissionLockedButton
                    requiredTier="pro"
                    featureName="Markdown导出功能"
                    onClick={() => {
                      toast({
                        title: t('components.labels.导出功能'),
                        description: '正在准备导出...'
                      });
                    }}
                    className="flex-shrink-0 flex items-center gap-1 whitespace-nowrap"
                    size="sm"
                  >
                    <Download className="w-4 h-4" />
                    <span>导出微信格式</span>
                  </PermissionLockedButton>
                </div>
              </div>
            </div>
          </div>

          {/* 主要内容区域 */}
          <div className="flex-1 flex flex-col lg:flex-row overflow-hidden h-[calc(100vh-120px-96px)]">
            {/* 编辑器区域 */}
            <div className={`${showPreview ? 'lg:w-1/2' : 'w-full'} flex flex-col h-full ${showPreview ? 'border-r border-border' : ''}`}>

              {/* 编辑器头部 */}
              <div className="p-3 border-b border-border bg-muted/30">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Markdown编辑器</span>
                    {isConverting && (
                      <RefreshCw className="w-3 h-3 animate-spin text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span>{wordCount} 字</span>
                    <span>约 {estimatedReadTime} 分钟阅读</span>
                  </div>
                </div>
              </div>

              {/* 编辑器内容 - 固定高度，内部滚动 */}
              <div className="flex-1 overflow-hidden" style={{ minHeight: '400px' }}>
                <MarkdownEditor
                  content={markdownContent}
                  onChange={handleContentChange}
                  className="h-full w-full"
                  style={{ height: '100%', minHeight: '400px' }}
                />
              </div>
            </div>

            {/* 预览区域 */}
            {showPreview && (
              <div className="lg:w-1/2 w-full flex flex-col h-full">
                {/* 预览头部 */}
                <div className="p-3 border-b border-border bg-muted/30">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Eye className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm font-medium">
                        {isMobilePreview ? '移动端预览' : '桌面端预览'}
                      </span>
                      <Badge variant="secondary" className="text-xs">
                        {selectedTheme}
                      </Badge>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowPreview(false)}
                      className="lg:hidden"
                    >
                      <EyeOff className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* 预览内容 */}
                <div className="flex-1 overflow-y-auto">
                  <PreviewPanel
                    htmlContent={previewHtml}
                    theme={selectedTheme}
                    fontSize={fontSize}
                    isMobilePreview={isMobilePreview}
                    isLoading={isConverting}
                  />
                </div>
              </div>
            )}

            {/* 当预览隐藏时显示切换按钮 */}
            {!showPreview && (
              <div className="fixed right-4 bottom-4 lg:top-1/2 lg:bottom-auto lg:transform lg:-translate-y-1/2 z-10">
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => setShowPreview(true)}
                  className="shadow-lg"
                >
                  <Eye className="w-4 h-4 mr-1" />
                  <span className="hidden sm:inline">显示预览</span>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}