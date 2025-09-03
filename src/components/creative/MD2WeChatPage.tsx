/**
 * Markdown转微信公众号排版工具
 * 支持多主题、实时预览、导出等功能
 */

import React, { useState, useCallback, useEffect } from 'react';
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
import { useAuthStore } from '@/store/authStore';
import { useUsageStore } from '@/store/usageStore';
import { PermissionProtectedInput } from '@/components/auth/PermissionProtectedInput';
import { PermissionLockedButton } from '@/components/auth/PermissionLockedButton';
import PageNavigation from '@/components/layout/PageNavigation';
import { RoleBasedUpgradePrompt } from '@/components/ui/RoleBasedUpgradePrompt';
import { Header } from '@/components/landing/Header';
import { MarkdownEditor } from './md2wechat/MarkdownEditor';
import { ThemeSelector } from './md2wechat/ThemeSelector';
import { PreviewPanel } from './md2wechat/PreviewPanel';
import { ExportControls } from './md2wechat/ExportControls';
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
export default function MD2WeChatPage() {
  const { toast } = useToast();
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

  // 文档统计
  const [wordCount, setWordCount] = useState(0);
  const [estimatedReadTime, setEstimatedReadTime] = useState(0);

  // 计算文档统计信息
  useEffect(() => {
    const words = markdownContent.replace(/[#*\-\[\]()]/g, '').split(/\s+/).filter(word => word.length > 0).length;
    setWordCount(words);
    setEstimatedReadTime(Math.ceil(words / 200)); // 假设每分钟阅读200字
  }, [markdownContent]);

  // 实时转换函数 - 优化响应性和体验
  const debouncedConvert = useDebouncedCallback(
    async (content: string, theme: string, size: string) => {
      if (!content.trim()) {
        setPreviewHtml('');
        return;
      }

      // 检查用户是否登录 - 实时预览不需要阻止
      if (!isAuthenticated) {
        // 对于实时预览，不阻止转换，只是不计算使用次数
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
          throw new Error(result.error || '转换失败');
        }
      } catch (error) {
        console.error('转换失败:', error);
        // 实时预览中不显示错误提示，避免干扰用户输入
        // 设置基础的HTML预览
        setPreviewHtml(`<div class="markdown-content">${content.replace(/\n/g, '<br>')}</div>`);
      } finally {
        setIsConverting(false);
      }
    },
    150  // 减少防抖延迟从500ms到150ms
  );

  // 监听内容和主题变化，触发转换
  useEffect(() => {
    debouncedConvert(markdownContent, selectedTheme, fontSize);
  }, [markdownContent, selectedTheme, fontSize, debouncedConvert]);

  // 处理内容变化
  const handleContentChange = useCallback((content: string) => {
    setMarkdownContent(content);
  }, []);

  // 处理主题变化
  const handleThemeChange = useCallback((theme: string) => {
    setSelectedTheme(theme);
    toast({
      title: '主题已切换',
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
        title: '文档导入成功',
        description: `已导入文档: ${file.name}`,
      });
    };
    reader.readAsText(file);
  }, [toast]);

  // 重置内容
  const handleReset = useCallback(() => {
    setMarkdownContent('# 欢迎使用Markdown排版工具\n\n开始你的创作之旅...');
    setSelectedTheme('default');
    setFontSize('medium');
    toast({
      title: '内容已重置',
      description: '编辑器已恢复初始状态',
    });
  }, [toast]);

  return (
    <div className="min-h-screen bg-background">
      {/* 主导航栏 */}
      <Header />

      {/* 页面导航 */}
      <PageNavigation
        title="Markdown排版工具"
        description="专为微信公众号设计的Markdown转换工具，支持多种主题和实时预览"
        showAdaptButton={false}
        showUpgradeButton={false}
        actions={
          <RoleBasedUpgradePrompt
            requiredTier="pro"
            featureName="Markdown排版工具"
            description="解锁高级主题和导出功能"
            mode="compact"
          />
        }
      />
      
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="bg-background">
          {/* 工具栏 */}
          <div className="border-b border-border bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-card/50">
            <div className="container mx-auto px-4 py-3">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                {/* 左侧工具组 */}
                <div className="flex items-center gap-2">
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

                {/* 右侧操作组 */}
                <div className="flex items-center gap-2">
                  {/* 预览切换 */}
                  <div className="flex items-center gap-1 border border-border rounded-md">
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
                    onClick={() => {
                      const input = document.createElement('input');
                      input.type = 'file';
                      input.accept = '.md,.txt';
                      input.onchange = (e) => {
                        const file = (e.target as HTMLInputElement).files?.[0];
                        if (file) handleImportDocument(file);
                      };
                      input.click();
                    }}
                  >
                    <Upload className="w-4 h-4 mr-1" />
                    导入
                  </Button>

                  {/* 重置 */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleReset}
                  >
                    <RotateCcw className="w-4 h-4 mr-1" />
                    重置
                  </Button>

                  {/* 导出控制 */}
                  <PermissionLockedButton
                    requiredTier="pro"
                    featureName="Markdown导出功能"
                    onClick={() => {
                      toast({
                        title: '导出功能',
                        description: '正在准备导出...'
                      });
                    }}
                    className="w-full"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    导出微信格式
                  </PermissionLockedButton>
                </div>
              </div>
            </div>
          </div>

          {/* 主要内容区域 */}
          <div className="flex-1 flex flex-col lg:flex-row overflow-hidden h-[calc(100vh-var(--header-height,64px)-120px)]">
            {/* 编辑器区域 */}
            <div className={`${showPreview ? 'lg:w-1/2' : 'w-full'} flex flex-col h-full ${showPreview ? 'border-r border-border' : ''}`}>
              {/* 主题选择器 */}
              <div className="p-4 border-b border-border bg-muted/30">
                <ThemeSelector
                  selectedTheme={selectedTheme}
                  onThemeChange={handleThemeChange}
                />
              </div>

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
              <div className="flex-1 overflow-hidden">
                <PermissionProtectedInput
                  requiredTier="pro"
                  featureName="Markdown编辑器"
                >
                  <MarkdownEditor
                    content={markdownContent}
                    onChange={handleContentChange}
                    className="h-full overflow-y-auto"
                  />
                </PermissionProtectedInput>
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
                  <PermissionProtectedInput
                    requiredTier="pro"
                    featureName="Markdown预览"
                  >
                    <PreviewPanel
                      htmlContent={previewHtml}
                      theme={selectedTheme}
                      fontSize={fontSize}
                      isMobilePreview={isMobilePreview}
                      isLoading={isConverting}
                    />
                  </PermissionProtectedInput>
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