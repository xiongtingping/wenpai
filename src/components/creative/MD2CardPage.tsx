/**
 * Markdown转卡片生成工具
 * 将Markdown内容转换为精美的社交媒体卡片
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
  RefreshCw,
  Image,
  Square,
  Maximize,
  CreditCard,
  Sparkles,
  Edit3
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuthStore } from '@/store/authStore';
import { useUsageStore } from '@/store/usageStore';
import { PermissionProtectedInput } from '@/components/auth/PermissionProtectedInput';
import { PermissionLockedButton } from '@/components/auth/PermissionLockedButton';
import { Header } from '@/components/landing/Header';
import { RoleBasedUpgradePrompt } from '@/components/ui/RoleBasedUpgradePrompt';
import { useDebouncedCallback } from 'use-debounce';
import { defaultMarkdownParser, ContentAdapter } from './md2card/MarkdownParser';
import { CARD_TEMPLATES } from './md2card/TemplateSelector';
import { generateCard, exportCard } from '@/services/md2cardService';

// 卡片模板配置
export interface CardTemplate {
  id: string;
  name: string;
  displayName: string;
  description: string;
  category: 'knowledge' | 'social' | 'business' | 'education';
  dimensions: {
    width: number;
    height: number;
    aspectRatio: string;
  };
  previewImage: string;
  isCustomizable: boolean;
  isFree: boolean;
}

// 卡片生成配置
export interface CardConfiguration {
  templateId: string;
  branding: {
    enableBrandLogo: boolean;
    logoPosition: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
    brandColors: string[];
    watermark?: string;
  };
  typography: {
    primaryFont: string;
    secondaryFont: string;
    fontSize: 'small' | 'medium' | 'large';
  };
  colors: {
    background: string;
    primary: string;
    secondary: string;
    text: string;
    accent: string;
  };
  layout: {
    padding: number;
    spacing: number;
    alignment: 'left' | 'center' | 'right';
  };
}

// 卡片数据模型
export interface CardData {
  id: string;
  title: string;
  markdownContent: string;
  parsedContent: any;
  configuration: CardConfiguration;
  imageData?: string;
  createdAt: Date;
  updatedAt: Date;
}

// 默认模板
const DEFAULT_TEMPLATES: CardTemplate[] = [
  {
    id: 'knowledge-card',
    name: 'knowledge-card',
    displayName: '知识卡片',
    description: '适合展示学习笔记、知识点总结',
    category: 'knowledge',
    dimensions: { width: 800, height: 600, aspectRatio: '4:3' },
    previewImage: '/templates/knowledge-card.png',
    isCustomizable: true,
    isFree: true
  },
  {
    id: 'social-story',
    name: 'social-story',
    displayName: '社交故事',
    description: 'Instagram Stories风格，9:16竖屏比例',
    category: 'social',
    dimensions: { width: 540, height: 960, aspectRatio: '9:16' },
    previewImage: '/templates/social-story.png',
    isCustomizable: true,
    isFree: false
  },
  {
    id: 'business-info',
    name: 'business-info',
    displayName: '商务信息',
    description: '专业的商务信息展示卡片',
    category: 'business',
    dimensions: { width: 1200, height: 630, aspectRatio: '1.91:1' },
    previewImage: '/templates/business-info.png',
    isCustomizable: true,
    isFree: false
  }
];

/**
 * MD2Card主页面组件
 */
export default function MD2CardPage() {
  const { toast } = useToast();
  const { user, isAuthenticated } = useAuthStore();
  const { recordUsage } = useUsageStore();
  
  // 状态管理
  const [markdownContent, setMarkdownContent] = useState(`# 欢迎使用MD2Card
  
## 功能特点
- 🎨 多种精美模板
- 📱 移动端适配
- 🎯 社交媒体优化
- ⚡ 实时预览效果

## 使用方法
1. 在左侧编辑器中输入Markdown内容
2. 选择合适的卡片模板
3. 自定义样式和配色
4. 导出为图片格式

开始创作你的精美卡片吧！`);

  const [selectedTemplate, setSelectedTemplate] = useState('knowledge-card');
  const [cardConfig, setCardConfig] = useState<CardConfiguration>({
    templateId: 'knowledge-card',
    branding: {
      enableBrandLogo: false,
      logoPosition: 'top-right',
      brandColors: ['#3B82F6', '#8B5CF6'],
      watermark: undefined
    },
    typography: {
      primaryFont: 'Inter',
      secondaryFont: 'Inter',
      fontSize: 'medium'
    },
    colors: {
      background: '#FFFFFF',
      primary: '#3B82F6',
      secondary: '#8B5CF6',
      text: '#1F2937',
      accent: '#F59E0B'
    },
    layout: {
      padding: 32,
      spacing: 16,
      alignment: 'left'
    }
  });

  const [cardData, setCardData] = useState<CardData | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showPreview, setShowPreview] = useState(true);
  const [isMobilePreview, setIsMobilePreview] = useState(false);
  const [activeTab, setActiveTab] = useState('template');

  // 文档统计
  const [wordCount, setWordCount] = useState(0);
  const [estimatedReadTime, setEstimatedReadTime] = useState(0);

  // 计算文档统计信息
  useEffect(() => {
    const words = markdownContent.replace(/[#*\-\[\]()]/g, '').split(/\s+/).filter(word => word.length > 0).length;
    setWordCount(words);
    setEstimatedReadTime(Math.ceil(words / 200));
  }, [markdownContent]);

  // 实时生成函数 - 减少延迟提高响应性
  const debouncedGenerate = useDebouncedCallback(
    async (content: string, templateId: string, config: CardConfiguration) => {
      if (!content.trim()) {
        setCardData(null);
        return;
      }

      // 🔧 FIX: 允许未登录用户进行实时预览，只是显示简化版本
      const allowPreview = isAuthenticated || content.trim().length > 0;

      setIsGenerating(true);
      try {
        // 解析Markdown内容 - 立即更新预览
        const parsedContent = defaultMarkdownParser.parse(content);
        
        // 获取模板 - 如果找不到则使用默认配置
        const template = CARD_TEMPLATES.find(t => t.id === templateId) || {
          id: 'default',
          displayName: '默认模板',
          category: 'knowledge' as const,
          constraints: {
            maxSections: 5,
            maxWordsPerSection: 50,
            allowImages: true,
            allowLists: true
          }
        };

        // 验证内容是否适合模板 - 仅在有完整模板时进行
        if ('name' in template) {
          const validation = ContentAdapter.validateContentForTemplate(
            parsedContent, 
            template.constraints
          );

          if (!validation.isValid) {
            console.warn('内容验证警告:', validation.warnings);
          }
        }

        // 优化内容以适应模板
        const optimizedContent = ContentAdapter.optimizeForTemplate(
          parsedContent,
          template.category
        );
        
        // 立即生成预览卡片 - 显示真实内容
        const title = extractTitleFromMarkdown(content);
        const subtitle = optimizedContent.subtitle || '';
        const firstSection = optimizedContent.sections[0];
        const sectionContent = firstSection ? 
          (typeof firstSection.content === 'string' ? firstSection.content : firstSection.content[0]) 
          : '';
        
        // 创建更丰富的SVG预览（保持现有的简单实现，避免复杂性）
        const svgContent = `<svg width="800" height="600" xmlns="http://www.w3.org/2000/svg" style="font-family: ${config.typography.primaryFont}, Arial, sans-serif">
          <!-- 背景渐变 -->
          <defs>
            <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style="stop-color:${config.colors.background};stop-opacity:1" />
              <stop offset="100%" style="stop-color:${lightenColor(config.colors.background, 0.1)};stop-opacity:1" />
            </linearGradient>
            <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
              <dropShadow dx="4" dy="4" stdDeviation="8" flood-color="rgba(0,0,0,0.1)"/>
            </filter>
          </defs>
          
          <!-- 卡片背景 -->
          <rect width="100%" height="100%" fill="url(#bgGradient)" rx="16" filter="url(#shadow)"/>
          
          <!-- 装饰元素 -->
          <circle cx="100" cy="100" r="40" fill="${config.colors.primary}" opacity="0.1"/>
          <circle cx="700" cy="500" r="60" fill="${config.colors.secondary}" opacity="0.08"/>
          
          <!-- 标题区域 -->
          <rect x="40" y="80" width="720" height="80" fill="${config.colors.primary}" rx="8" opacity="0.05"/>
          <text x="50%" y="130" font-family="${config.typography.primaryFont}, Arial, sans-serif" 
                font-size="32" font-weight="bold" fill="${config.colors.primary}" 
                text-anchor="middle" dominant-baseline="middle">${escapeHTML(title)}</text>
          
          <!-- 副标题 -->
          ${subtitle ? `<text x="50%" y="180" font-family="${config.typography.secondaryFont}, Arial, sans-serif" 
                font-size="20" fill="${config.colors.secondary}" text-anchor="middle" 
                dominant-baseline="middle">${escapeHTML(subtitle)}</text>` : ''}
          
          <!-- 内容区域 -->
          ${renderSVGContent(optimizedContent.sections, config, 220)}
          
          <!-- 底部装饰线 -->
          <line x1="80" y1="520" x2="720" y2="520" stroke="${config.colors.accent}" stroke-width="2" opacity="0.3"/>
          
          <!-- 品牌标识 -->
          <text x="50%" y="560" font-family="Arial, sans-serif" font-size="14" 
                fill="${config.colors.secondary}" text-anchor="middle" opacity="0.7">
            ✨ MD2Card · ${template.displayName}
          </text>
        </svg>`;

        const imageData = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgContent)));

        setCardData({
          id: Date.now().toString(),
          title,
          markdownContent: content,
          parsedContent: optimizedContent,
          configuration: config,
          imageData,
          createdAt: new Date(),
          updatedAt: new Date()
        });
      } catch (error) {
        console.error('卡片生成失败:', error);
        // 实时预览中不显示错误提示，避免干扰用户输入
      } finally {
        setIsGenerating(false);
      }
    },
    50   // 进一步减少防抖延迟到50ms，实现更实时的预览
  );

  // 监听内容和配置变化，触发生成
  useEffect(() => {
    debouncedGenerate(markdownContent, selectedTemplate, cardConfig);
  }, [markdownContent, selectedTemplate, cardConfig, debouncedGenerate]);

  // 处理内容变化
  const handleContentChange = useCallback((content: string) => {
    setMarkdownContent(content);
  }, []);

  // 处理模板变化
  const handleTemplateChange = useCallback((templateId: string) => {
    setSelectedTemplate(templateId);
    setCardConfig(prev => ({ ...prev, templateId }));
    const template = CARD_TEMPLATES.find(t => t.id === templateId);
    toast({
      title: '模板已切换',
      description: `已切换到 ${template?.displayName} 模板`,
    });
  }, [toast]);

  // 处理配置变化
  const handleConfigChange = useCallback((newConfig: Partial<CardConfiguration>) => {
    setCardConfig(prev => ({ ...prev, ...newConfig }));
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
    setMarkdownContent(`# 欢迎使用MD2Card\n\n开始你的卡片创作之旅...`);
    setSelectedTemplate('knowledge-card');
    setCardConfig(prev => ({ ...prev, templateId: 'knowledge-card' }));
    toast({
      title: '内容已重置',
      description: '编辑器已恢复初始状态',
    });
  }, [toast]);

  // 导出卡片
  const handleExportCard = useCallback(async (format: 'png' | 'jpg' | 'svg') => {
    if (!cardData?.imageData) {
      toast({
        title: '无法导出',
        description: '请先生成卡片',
        variant: 'destructive'
      });
      return;
    }

    try {
      // 这里将实现实际的导出逻辑
      const blob = await exportCardAsImage(cardData.imageData, format);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `card-${cardData.id}.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: '导出成功',
        description: `卡片已导出为 ${format.toUpperCase()} 格式`,
      });
    } catch (error) {
      console.error('导出失败:', error);
      toast({
        title: '导出失败',
        description: '导出过程中发生错误，请稍后重试',
        variant: 'destructive'
      });
    }
  }, [cardData, toast]);

  // 辅助方法：颜色变亮
  const lightenColor = (color: string, amount: number): string => {
    const hex = color.replace('#', '');
    const r = Math.min(255, parseInt(hex.substr(0, 2), 16) + Math.round(255 * amount));
    const g = Math.min(255, parseInt(hex.substr(2, 2), 16) + Math.round(255 * amount));
    const b = Math.min(255, parseInt(hex.substr(4, 2), 16) + Math.round(255 * amount));
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  };

  // 辅助方法：HTML转义
  const escapeHTML = (text: string): string => {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  };

  // 渲染SVG内容
  const renderSVGContent = (sections: any[], config: CardConfiguration, startY: number): string => {
    let yPos = startY;
    let svgContent = '';
    
    sections.slice(0, 3).forEach((section, index) => {
      if (section.type === 'text' && typeof section.content === 'string') {
        const content = section.content.slice(0, 100) + (section.content.length > 100 ? '...' : '');
        svgContent += `<text x="60" y="${yPos}" font-family="${config.typography.primaryFont}, Arial, sans-serif" 
          font-size="16" fill="${config.colors.text}" text-anchor="start">
          ${escapeHTML(content)}
        </text>`;
        yPos += 30;
      } else if (section.type === 'list' && Array.isArray(section.content)) {
        section.content.slice(0, 3).forEach((item: string, i: number) => {
          svgContent += `<text x="60" y="${yPos}" font-family="${config.typography.primaryFont}, Arial, sans-serif" 
            font-size="14" fill="${config.colors.text}" text-anchor="start">
            • ${escapeHTML(item.slice(0, 50))}${item.length > 50 ? '...' : ''}
          </text>`;
          yPos += 25;
        });
      }
    });
    
    return svgContent;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* 主导航栏 */}
      <Header />

      
      <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="h-full bg-background">
        {/* 工具栏 */}
        <div className="border-b border-border bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-card/50">
          <div className="container mx-auto px-4 py-3">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              {/* 左侧工具组 */}
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium">MD2Card</span>
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

                {/* 导出按钮组 */}
                <div className="flex items-center gap-1">
                  <PermissionLockedButton
                    requiredTier="pro"
                    featureName="MD2Card导出PNG"
                    variant="default"
                    size="sm"
                    onClick={() => handleExportCard('png')}
                    disabled={!cardData?.imageData}
                  >
                    <Download className="w-4 h-4 mr-1" />
                    PNG
                  </PermissionLockedButton>
                  
                  <PermissionLockedButton
                    requiredTier="pro"
                    featureName="MD2Card导出JPG"
                    variant="outline"
                    size="sm"
                    onClick={() => handleExportCard('jpg')}
                    disabled={!cardData?.imageData}
                  >
                    JPG
                  </PermissionLockedButton>
                  
                  <PermissionLockedButton
                    requiredTier="free"
                    featureName="MD2Card导出SVG"
                    variant="outline"
                    size="sm"
                    onClick={() => handleExportCard('svg')}
                    disabled={!cardData?.imageData}
                  >
                    SVG
                  </PermissionLockedButton>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 主要内容区域 - 修复高度和布局 */}
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden min-h-[calc(100vh-160px)] h-[calc(100vh-160px)]">
          {/* 编辑器和设置区域 - 确保高度与预览区一致 */}
          <div className={`${showPreview ? 'lg:w-1/2' : 'w-full'} flex flex-col border-r border-border h-full min-h-0`}>
            {/* 标签页导航 */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
              <TabsList className="w-full justify-start border-b border-border rounded-none bg-muted/30">
                <TabsTrigger value="template" className="flex items-center gap-2">
                  <Square className="w-4 h-4" />
                  模板
                </TabsTrigger>
                <TabsTrigger value="content" className="flex items-center gap-2">
                  <Edit3 className="w-4 h-4" />
                  内容
                </TabsTrigger>
                <TabsTrigger value="style" className="flex items-center gap-2">
                  <Palette className="w-4 h-4" />
                  样式
                </TabsTrigger>
              </TabsList>

              {/* 模板选择 */}
              <TabsContent value="template" className="flex-1 p-4 overflow-y-auto">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium mb-2">选择模板</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-96 overflow-y-auto">
                      {(CARD_TEMPLATES || DEFAULT_TEMPLATES).slice(0, 6).map((template) => (
                        <Card 
                          key={template.id}
                          className={`cursor-pointer transition-all hover:shadow-md ${
                            selectedTemplate === template.id ? 'ring-2 ring-primary' : ''
                          }`}
                          onClick={() => handleTemplateChange(template.id)}
                        >
                          <CardContent className="p-3">
                            <div className="aspect-video bg-muted rounded mb-2 flex items-center justify-center">
                              <Image className="w-8 h-8 text-muted-foreground" />
                            </div>
                            <div className="space-y-1">
                              <div className="flex items-center justify-between">
                                <h4 className="text-sm font-medium">{template.displayName}</h4>
                              </div>
                              <p className="text-xs text-muted-foreground">{template.description}</p>
                              <p className="text-xs text-muted-foreground">{template.dimensions.aspectRatio}</p>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* 内容编辑 */}
              <TabsContent value="content" className="flex-1 flex flex-col">
                {/* 编辑器头部 */}
                <div className="p-3 border-b border-border bg-muted/30">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm font-medium">Markdown编辑器</span>
                      {isGenerating && (
                        <RefreshCw className="w-3 h-3 animate-spin text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>{wordCount} 字</span>
                      <span>约 {estimatedReadTime} 分钟阅读</span>
                    </div>
                  </div>
                </div>

                {/* 编辑器内容 - 修复高度问题 */}
                <div className="flex-1 p-4 overflow-hidden min-h-0">
                  <PermissionProtectedInput
                    requiredTier="pro"
                    featureName="MD2Card Markdown编辑器"
                  >
                    <textarea
                      value={markdownContent}
                      onChange={(e) => handleContentChange(e.target.value)}
                      className="w-full h-full min-h-[500px] p-3 border border-border rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-primary bg-secondary/30 text-foreground font-mono text-sm transition-colors focus:bg-secondary/50 hover:bg-secondary/40"
                      placeholder="在这里输入Markdown内容..."
                    />
                  </PermissionProtectedInput>
                </div>
              </TabsContent>

              {/* 样式设置 */}
              <TabsContent value="style" className="flex-1 p-4">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium mb-2">字体大小</h3>
                    <div className="flex gap-1 border border-border rounded-md">
                      {(['small', 'medium', 'large'] as const).map((size) => (
                        <Button
                          key={size}
                          variant={cardConfig.typography.fontSize === size ? 'default' : 'ghost'}
                          size="sm"
                          onClick={() => handleConfigChange({
                            typography: { ...cardConfig.typography, fontSize: size }
                          })}
                          className="flex-1 px-2 py-1 text-xs"
                        >
                          {size === 'small' ? '小' : size === 'medium' ? '中' : '大'}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium mb-2">配色方案</h3>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-2">
                        <label className="text-xs text-muted-foreground">主色调</label>
                        <input
                          type="color"
                          value={cardConfig.colors.primary}
                          onChange={(e) => handleConfigChange({
                            colors: { ...cardConfig.colors, primary: e.target.value }
                          })}
                          className="w-full h-8 rounded border border-border"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs text-muted-foreground">背景色</label>
                        <input
                          type="color"
                          value={cardConfig.colors.background}
                          onChange={(e) => handleConfigChange({
                            colors: { ...cardConfig.colors, background: e.target.value }
                          })}
                          className="w-full h-8 rounded border border-border"
                        />
                      </div>
                    </div>
                  </div>

                  {/* 保存按钮 */}
                  <div className="pt-4 border-t border-border">
                    <Button
                      onClick={() => {
                        toast({
                          title: '样式已保存',
                          description: '当前样式配置已应用到卡片预览',
                        });
                      }}
                      className="w-full"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      应用样式
                    </Button>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
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
                      {(CARD_TEMPLATES || DEFAULT_TEMPLATES).find(t => t.id === selectedTemplate)?.displayName}
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
              <div className="flex-1 p-4 bg-muted/20">
                <PermissionProtectedInput
                  requiredTier="pro"
                  featureName="MD2Card 卡片预览"
                >
                  <div className={`mx-auto bg-white rounded-lg shadow-lg ${
                    isMobilePreview ? 'max-w-sm' : 'max-w-2xl'
                  } ${isGenerating ? 'animate-pulse' : ''}`}>
                    {cardData?.imageData ? (
                      <img 
                        src={cardData.imageData} 
                        alt="Generated Card" 
                        className="w-full h-auto rounded-lg"
                      />
                    ) : (
                      <div className="aspect-[4/3] flex items-center justify-center border-2 border-dashed border-border rounded-lg">
                        <div className="text-center text-muted-foreground">
                          {isGenerating ? (
                            <>
                              <RefreshCw className="w-8 h-8 mx-auto mb-2 animate-spin" />
                              <p>正在生成卡片...</p>
                            </>
                          ) : (
                            <>
                              <CreditCard className="w-8 h-8 mx-auto mb-2" />
                              <p>输入内容开始生成卡片</p>
                            </>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
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

// 辅助函数 - 优化为快速响应
async function generateMockCard(params: {
  markdown: string;
  templateId: string;
  configuration: CardConfiguration;
}): Promise<{ success: boolean; parsedContent?: any; imageData?: string; error?: string }> {
  // 实时预览优化 - 减少延迟
  return new Promise((resolve) => {
    setTimeout(() => {
      const title = extractTitleFromMarkdown(params.markdown);
      const svgContent = `<svg width="800" height="600" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="${params.configuration.colors.background}"/>
        <text x="50%" y="30%" font-family="Arial, sans-serif" font-size="32" fill="${params.configuration.colors.text}" text-anchor="middle" dy=".3em">${title}</text>
        <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="16" fill="${params.configuration.colors.primary}" text-anchor="middle" dy=".3em">预览内容</text>
        <text x="50%" y="70%" font-family="Arial, sans-serif" font-size="14" fill="${params.configuration.colors.secondary}" text-anchor="middle" dy=".3em">模板: ${params.templateId}</text>
      </svg>`;
      
      resolve({
        success: true,
        parsedContent: { title, content: params.markdown },
        imageData: 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgContent)))
      });
    }, 100); // 减少延迟到100ms
  });
}

function extractTitleFromMarkdown(markdown: string): string {
  const match = markdown.match(/^#\s+(.+)$/m);
  return match ? match[1] : '未命名卡片';
}

async function exportCardAsImage(imageData: string, format: 'png' | 'jpg' | 'svg'): Promise<Blob> {
  try {
    if (format === 'svg') {
      // SVG格式直接返回
      const svgBlob = new Blob([imageData.replace('data:image/svg+xml;base64,', atob)], {
        type: 'image/svg+xml'
      });
      return svgBlob;
    }
    
    // 对于PNG/JPG，使用Canvas转换以获得更高质量
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
          reject(new Error('无法创建Canvas上下文'));
          return;
        }
        
        // 设置高分辨率画布 (2x for retina displays)
        const scale = 2;
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;
        
        // 缩放上下文并启用平滑渲染
        ctx.scale(scale, scale);
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        
        // 如果是JPG，设置白色背景
        if (format === 'jpg') {
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, img.width, img.height);
        }
        
        // 绘制图像
        ctx.drawImage(img, 0, 0);
        
        // 转换为Blob
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('无法生成图片'));
            }
          },
          format === 'png' ? 'image/png' : 'image/jpeg',
          format === 'jpg' ? 0.95 : undefined // JPG质量设置
        );
      };
      
      img.onerror = () => reject(new Error('图片加载失败'));
      img.src = imageData;
    });
  } catch (error) {
    console.error('图片导出失败:', error);
    throw error;
  }
}