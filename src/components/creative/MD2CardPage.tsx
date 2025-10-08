/**
 * Markdown转卡片生成工具
 * 将Markdown内容转换为精美的社交媒体卡片
 */

import React, { useState, useCallback, useEffect, useRef } from 'react';
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
  RefreshCw,
  Image,
  Square,
  Maximize,
  X,
  CreditCard,
  Sparkles,
  Edit3,
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  List,
  ListOrdered,
  Link,
  Code,
  Quote,
  Heading1,
  Heading2,
  Heading3
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuthStore } from '@/stores/compatibility-layer';
import { useUsageStore } from '@/stores/compatibility-layer';
import { PermissionProtectedInput } from '@/components/auth/PermissionProtectedInput';
import { PermissionLockedButton } from '@/components/auth/PermissionLockedButton';
// import { Header } from '@/components/landing/Header'; // 移除Header导入，该组件作为Tab内容使用
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
  isPopular?: boolean; // 🔧 FIXED: 添加缺失的属性
  isNew?: boolean; // 🔧 FIXED: 添加缺失的属性
  tags: string[]; // 🔧 FIXED: 添加缺失的属性
  constraints: { // 🔧 FIXED: 添加缺失的属性
    maxSections: number;
    maxWordsPerSection: number;
    allowImages: boolean;
    allowLists: boolean;
  };
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

// 默认模板 - 与TemplateSelector中的CARD_TEMPLATES保持同步
const DEFAULT_TEMPLATES: CardTemplate[] = [
  {
    id: 'knowledge-simple',
    name: 'knowledge-simple',
    displayName: '简约知识卡',
    description: '简洁明了的知识点展示，适合学习笔记和要点总结',
    category: 'knowledge',
    dimensions: { width: 800, height: 600, aspectRatio: '4:3' },
    previewImage: '/templates/knowledge-simple.png',
    isCustomizable: true,
    isFree: true,
    isPopular: true,
    tags: ['简约', '知识', '学习'],
    constraints: {
      maxSections: 5,
      maxWordsPerSection: 50,
      allowImages: false,
      allowLists: true
    }
  },
  {
    id: 'social-square',
    name: 'social-square',
    displayName: '社交方图',
    description: '1:1正方形格式，适合各种社交平台',
    category: 'social',
    dimensions: { width: 800, height: 800, aspectRatio: '1:1' },
    previewImage: '/templates/social-square.png',
    isCustomizable: true,
    isFree: true,
    isNew: true,
    tags: ['正方形', '社交', '通用'],
    constraints: {
      maxSections: 4,
      maxWordsPerSection: 40,
      allowImages: true,
      allowLists: true
    }
  },
  {
    id: 'social-story',
    name: 'social-story',
    displayName: 'Stories卡片',
    description: 'Instagram Stories风格，9:16竖屏比例',
    category: 'social',
    dimensions: { width: 540, height: 960, aspectRatio: '9:16' },
    previewImage: '/templates/social-story.png',
    isCustomizable: true,
    isFree: false,
    isPopular: true,
    tags: ['社交', '竖屏', 'Stories'],
    constraints: {
      maxSections: 3,
      maxWordsPerSection: 30,
      allowImages: true,
      allowLists: false
    }
  },
  {
    id: 'business-info',
    name: 'business-info',
    displayName: '商务信息卡',
    description: '专业的商务信息展示，适合产品介绍',
    category: 'business',
    dimensions: { width: 1200, height: 630, aspectRatio: '1.91:1' },
    previewImage: '/templates/business-info.png',
    isCustomizable: true,
    isFree: false,
    tags: ['商务', '专业', '产品'],
    constraints: {
      maxSections: 4,
      maxWordsPerSection: 60,
      allowImages: true,
      allowLists: true
    }
  }
];

/**
 * MD2Card主页面组件
 */
export default function MD2CardPage() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { user, isAuthenticated } = useAuthStore();
  const { recordUsage } = useUsageStore();
  
  // 状态管理
  const textareaRef = useRef<HTMLTextAreaElement>(null);
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

  const [selectedTemplate, setSelectedTemplate] = useState('knowledge-simple');
  const [cardConfig, setCardConfig] = useState<CardConfiguration>({
    templateId: 'knowledge-simple',
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

  // 文本格式化辅助函数
  const insertMarkdown = useCallback((prefix: string, suffix: string = '', defaultText: string = '文本') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = markdownContent.substring(start, end);
    
    let insertText: string;
    if (selectedText) {
      // 如果有选中文本，包装选中的文本
      insertText = `${prefix}${selectedText}${suffix}`;
    } else {
      // 如果没有选中文本，插入默认文本
      insertText = `${prefix}${defaultText}${suffix}`;
    }
    
    const beforeText = markdownContent.substring(0, start);
    const afterText = markdownContent.substring(end);
    const newContent = `${beforeText}${insertText}${afterText}`;
    
    setMarkdownContent(newContent);
    
    // 设置新的光标位置
    setTimeout(() => {
      const newCursorPos = selectedText 
        ? start + insertText.length 
        : start + prefix.length + defaultText.length;
      textarea.focus();
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  }, [markdownContent]);

  const insertLineMarkdown = useCallback((prefix: string, defaultText: string = '内容') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const beforeText = markdownContent.substring(0, start);
    const selectedText = markdownContent.substring(start, end);
    const afterText = markdownContent.substring(end);

    const insertText = selectedText || defaultText;
    const needsNewlineBefore = beforeText.length > 0 && !beforeText.endsWith('\n');
    const needsNewlineAfter = afterText.length > 0 && !afterText.startsWith('\n');

    const newContent = `${beforeText}${needsNewlineBefore ? '\n' : ''}${prefix}${insertText}${needsNewlineAfter ? '\n' : ''}${afterText}`;

    setMarkdownContent(newContent);

    setTimeout(() => {
      textarea.focus();
      const newPos = start + (needsNewlineBefore ? 1 : 0) + prefix.length + insertText.length;
      textarea.setSelectionRange(newPos, newPos);
    }, 0);
  }, [markdownContent]);
  const [isMobilePreview, setIsMobilePreview] = useState(false);
  const [activeTab, setActiveTab] = useState('content');

  // 文档统计
  const [wordCount, setWordCount] = useState(0);
  const [estimatedReadTime, setEstimatedReadTime] = useState(0);
  const [isFullscreenOpen, setIsFullscreenOpen] = useState(false);

  // ESC键关闭全屏
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isFullscreenOpen) {
        setIsFullscreenOpen(false);
      }
    };

    if (isFullscreenOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden'; // 禁止背景滚动
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = ''; // 恢复背景滚动
    };
  }, [isFullscreenOpen]);

  // 计算文档统计信息 - 优化中英文字数统计
  useEffect(() => {
    if (!markdownContent.trim()) {
      setWordCount(0);
      setEstimatedReadTime(0);
      return;
    }

    // 移除Markdown格式符号，保留文本内容
    const cleanText = markdownContent
      // 移除代码块
      .replace(/```[\s\S]*?```/g, '')
      .replace(/`[^`]*`/g, '')
      // 移除链接，保留链接文字
      .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
      // 移除图片
      .replace(/!\[([^\]]*)\]\([^)]*\)/g, '')
      // 移除标题标记
      .replace(/^#{1,6}\s+/gm, '')
      // 移除列表标记
      .replace(/^[\s]*[-*+]\s+/gm, '')
      .replace(/^[\s]*\d+\.\s+/gm, '')
      // 移除引用标记
      .replace(/^>\s*/gm, '')
      // 移除加粗和斜体标记
      .replace(/\*\*([^*]*)\*\*/g, '$1')
      .replace(/\*([^*]*)\*/g, '$1')
      .replace(/__([^_]*)__/g, '$1')
      .replace(/_([^_]*)_/g, '$1')
      // 移除水平线
      .replace(/^[-*_]{3,}$/gm, '')
      // 清理多余的空白字符
      .replace(/\n{3,}/g, '\n\n')
      .trim();

    // 中英文字数统计
    const chineseChars = (cleanText.match(/[\u4e00-\u9fa5]/g) || []).length;
    const englishWords = cleanText
      .replace(/[\u4e00-\u9fa5]/g, '') // 移除中文字符
      .split(/\s+/)
      .filter(word => word.length > 0 && /[a-zA-Z]/.test(word)).length;
    
    // 总字数 = 中文字符数 + 英文单词数
    const totalWords = chineseChars + englishWords;
    
    setWordCount(totalWords);
    
    // 阅读时间计算：中文200字/分钟，英文200词/分钟
    const readingTime = Math.max(1, Math.ceil(totalWords / 200));
    setEstimatedReadTime(readingTime);
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
        
        // 获取模板 - 优先从CARD_TEMPLATES查找，失败时使用DEFAULT_TEMPLATES，最后使用默认配置
        const template = CARD_TEMPLATES.find(t => t.id === templateId) ||
                        DEFAULT_TEMPLATES.find(t => t.id === templateId) || {
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
            console.warn('contentvalidatingwarning:', validation.warnings);
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
        
        // 创建更丰富的SVG预览（使用模板的正确尺寸）
        const templateDimensions = (CARD_TEMPLATES.find(t => t.id === templateId) || 
                                   DEFAULT_TEMPLATES.find(t => t.id === templateId))?.dimensions || {
          width: 800,
          height: 600,
          aspectRatio: '4:3'
        };
        
        // 根据配置计算字体大小倍数 - 与renderSVGContent保持一致
        const fontSizeMultiplier = config.typography.fontSize === 'small' ? 0.75 : 
                                  config.typography.fontSize === 'large' ? 1.4 : 1.0;
        
        const svgContent = generateTemplateSpecificSVG(
          templateId,
          templateDimensions,
          config,
          fontSizeMultiplier,
          title,
          subtitle,
          optimizedContent,
          template
        );

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
        console.error('card生成failed:', error);
        // 实时预览中不显示错误提示，避免干扰用户输入
      } finally {
        setIsGenerating(false);
      }
    },
    200   // 优化防抖延迟到200ms，平衡响应性和性能
  );

  // 监听内容和配置变化，触发生成
  useEffect(() => {
    debouncedGenerate(markdownContent, selectedTemplate, cardConfig);
  }, [markdownContent, selectedTemplate, cardConfig]); // 🔧 FIX: 移除debouncedGenerate依赖，避免无限循环

  // 处理内容变化
  const handleContentChange = useCallback((content: string) => {
    setMarkdownContent(content);
  }, []);

  // 处理模板变化
  const handleTemplateChange = useCallback((templateId: string) => {
    if (import.meta.env.DEV) console.log('🎯 template切换:', templateId);
    setSelectedTemplate(templateId);
    setCardConfig(prev => {
      const updated = { ...prev, templateId };
      if (import.meta.env.DEV) console.log('📋 templateconfigurationupdating:', updated);
      return updated;
    });
    const template = CARD_TEMPLATES.find(t => t.id === templateId) ||
                    DEFAULT_TEMPLATES.find(t => t.id === templateId);
    toast({
      title: '模板已切换',
      description: `已切换到 ${template?.displayName} 模板`,
    });
  }, [toast]);

  // 处理配置变化
  const handleConfigChange = useCallback((newConfig: Partial<CardConfiguration>) => {
    if (import.meta.env.DEV) console.log('🎨 configuration变更:', newConfig);
    setCardConfig(prev => {
      const updated = { ...prev, ...newConfig };
      if (import.meta.env.DEV) console.log('📐 updatingnextconfiguration:', updated);
      return updated;
    });
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

  // 重置内容和配置
  const handleReset = useCallback(() => {
    // 重置内容
    setMarkdownContent(`# 欢迎使用MD2Card
  
## 功能特点
- 🎨 多种精美模板
- 📱 移动端适配
- 🎯 一键导出

## 使用方法
1. 在左侧编辑器中输入Markdown内容
2. 选择合适的卡片模板
3. 自定义样式和配色
4. 导出为图片格式

开始创作你的精美卡片吧！`);

    // 重置模板选择
    setSelectedTemplate('knowledge-simple');
    
    // 完全重置配置到初始状态
    setCardConfig({
      templateId: 'knowledge-simple',
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
    
    // 重置其他状态
    setCardData(null);
    setIsGenerating(false);
    setActiveTab('content');

    toast({
      title: '已完全重置',
      description: '内容、模板和样式配置已恢复初始状态',
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
      if (import.meta.env.DEV) {
        console.log(`🚀 startsexporting ${format.toUpperCase()} 格式`, { 
          cardId: cardData.id,
          imageDataType: cardData.imageData.slice(0, 50) + '...'
        });
      }

      const blob = await exportCardAsImage(cardData.imageData, format);
      if (import.meta.env.DEV) {
        console.log(`✅ Blobcreatingsuccess`, { 
          size: blob.size, 
          type: blob.type,
          format: format
        });
      }
      
      // 验证Blob内容（针对小文件）
      if (blob.size < 10000) {
        if (import.meta.env.DEV) {
          try {
            const text = await blob.text();
            console.log('🔍 Blobcontentpreview:', text.substring(0, 200) + '...');
          } catch (e) {
            console.log('🔍 Blob为二进制content，none法preview文本');
          }
        }
      }
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      // 创建安全的文件名，避免特殊字符
      const safeTitle = cardData.title
        ? cardData.title.replace(/[^\w\u4e00-\u9fa5]/g, '_').substring(0, 50)
        : `card_${cardData.id}`;
      const fileName = `MD2Card_${safeTitle}_${Date.now()}.${format}`;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      if (import.meta.env.DEV) console.log(`📥 filedownloadingtriggeringsuccess: ${a.download}`);

      toast({
        title: '导出成功',
        description: `卡片已导出为 ${format.toUpperCase()} 格式`,
      });
    } catch (error) {
      console.error('❌ exportingfailed:', error);
      toast({
        title: '导出失败',
        description: error instanceof Error ? error.message : '导出过程中发生错误,请稍后重试',
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
  const renderSVGContent = (sections: any[], config: CardConfiguration, startY: number, dimensions: any): string => {
    let yPos = startY;
    let svgContent = '';
    
    // 根据配置的字体大小调整所有字体 - 优化倍数范围
    const fontSizeMultiplier = config.typography.fontSize === 'small' ? 0.75 : 
                              config.typography.fontSize === 'large' ? 1.4 : 1.0;
    
    const baseFontSize = Math.min(dimensions.width, dimensions.height) * 0.02;
    const fontSize = baseFontSize * fontSizeMultiplier;
    const smallFontSize = baseFontSize * 0.875 * fontSizeMultiplier;
    const headerFontSize = baseFontSize * 1.25 * fontSizeMultiplier;
    const xStart = dimensions.width * 0.075;
    
    // 行高应该随字体大小调整 - 优化行高计算
    const baseLineHeight = dimensions.height * 0.04;
    const lineHeight = baseLineHeight * fontSizeMultiplier;
    // 动态调整最大宽度，为大字体预留更多空间
    const maxWidth = dimensions.width * (0.85 - (fontSizeMultiplier - 1) * 0.05);
    
    if (import.meta.env.DEV) {
      console.log('📏 字体和row高info:', {
        fontSizeMultiplier,
        fontSize,
        lineHeight,
        baseLineHeight,
        maxWidth,
        config: config.typography.fontSize
      });
    }
    
    console.log('🎨 渲染SVGcontent:', sections.map(s => `${s.type}: ${typeof s.content === 'string' ? s.content.substring(0, 30) + '...' : s.content}`));
    
    sections.slice(0, 5).forEach((section, index) => {
      console.log(`📝 processingsection ${index}:`, section.type, section.content);
      
      if (section.type === 'text') {
        // 处理段落文本
        const content = typeof section.content === 'string' ? section.content : String(section.content);
        const isEmphasis = section.style === 'emphasis' || section.level;
        const currentFontSize = isEmphasis ? headerFontSize : fontSize;
        const fontWeight = isEmphasis ? 'bold' : 'normal';
        
        // 文本换行处理
        const words = content.split(' ');
        let currentLine = '';
        let lineCount = 0;
        const maxLines = 3;
        
        for (const word of words) {
          const testLine = currentLine ? `${currentLine} ${word}` : word;
          // 更准确的文本宽度估算，根据字体大小调整系数
          const widthFactor = fontSizeMultiplier > 1 ? 0.6 : 0.5;
          const estimatedWidth = testLine.length * currentFontSize * widthFactor;
          
          if (estimatedWidth > maxWidth) {
            if (currentLine) {
              svgContent += `<text x="${xStart}" y="${yPos}" font-family="${config.typography.primaryFont}, Arial, sans-serif" 
                font-size="${currentFontSize}" font-weight="${fontWeight}" fill="${config.colors.text}" text-anchor="start">
                ${escapeHTML(currentLine)}
              </text>`;
              yPos += lineHeight;
              lineCount++;
              if (lineCount >= maxLines) break;
            }
            currentLine = word;
          } else {
            currentLine = testLine;
          }
        }
        
        // 渲染最后一行
        if (currentLine && lineCount < maxLines) {
          const finalLine = lineCount === maxLines - 1 && content.length > currentLine.length 
            ? currentLine + '...' 
            : currentLine;
          svgContent += `<text x="${xStart}" y="${yPos}" font-family="${config.typography.primaryFont}, Arial, sans-serif" 
            font-size="${currentFontSize}" font-weight="${fontWeight}" fill="${config.colors.text}" text-anchor="start">
            ${escapeHTML(finalLine)}
          </text>`;
          yPos += lineHeight;
        }
        
        // 段落间距随字体大小调整
        yPos += lineHeight * (0.3 + (fontSizeMultiplier - 1) * 0.1);
        
      } else if (section.type === 'list' && Array.isArray(section.content)) {
        // 处理列表
        section.content.slice(0, 4).forEach((item: string, i: number) => {
          const listItem = item.length > 60 ? item.slice(0, 60) + '...' : item;
          svgContent += `<text x="${xStart}" y="${yPos}" font-family="${config.typography.primaryFont}, Arial, sans-serif" 
            font-size="${smallFontSize}" fill="${config.colors.text}" text-anchor="start">
            • ${escapeHTML(listItem)}
          </text>`;
          yPos += lineHeight * (0.9 * fontSizeMultiplier);
        });
        // 列表后间距随字体大小调整
        yPos += lineHeight * (0.3 + (fontSizeMultiplier - 1) * 0.05);
        
      } else if (section.type === 'quote') {
        // 处理引用
        const content = typeof section.content === 'string' ? section.content : String(section.content);
        const quoteText = content.length > 80 ? content.slice(0, 80) + '...' : content;
        
        // 引用背景 - 高度随字体大小调整
        const quoteHeight = lineHeight * (1.2 + (fontSizeMultiplier - 1) * 0.1);
        svgContent += `<rect x="${xStart - 10}" y="${yPos - lineHeight * 0.7}" width="${maxWidth + 20}" height="${quoteHeight}" 
          fill="${config.colors.secondary}" opacity="0.1" rx="4"/>`;
        // 引用左边线
        svgContent += `<rect x="${xStart - 10}" y="${yPos - lineHeight * 0.7}" width="4" height="${quoteHeight}" 
          fill="${config.colors.primary}" opacity="0.6"/>`;
        
        svgContent += `<text x="${xStart + 10}" y="${yPos}" font-family="${config.typography.primaryFont}, Arial, sans-serif" 
          font-size="${smallFontSize}" font-style="italic" fill="${config.colors.secondary}" text-anchor="start">
          "${escapeHTML(quoteText)}"
        </text>`;
        // 引用后间距随字体大小调整
        yPos += lineHeight * (1.3 + (fontSizeMultiplier - 1) * 0.2);
        
      } else if (section.type === 'code') {
        // 处理代码块
        const content = typeof section.content === 'string' ? section.content : String(section.content);
        const codeText = content.length > 70 ? content.slice(0, 70) + '...' : content;
        
        // 代码背景 - 高度随字体大小调整
        const codeHeight = lineHeight * (1.2 + (fontSizeMultiplier - 1) * 0.1);
        svgContent += `<rect x="${xStart - 5}" y="${yPos - lineHeight * 0.7}" width="${maxWidth + 10}" height="${codeHeight}" 
          fill="${config.colors.background}" opacity="0.3" rx="6"/>`;
        
        svgContent += `<text x="${xStart + 5}" y="${yPos}" font-family="'Courier New', monospace" 
          font-size="${smallFontSize * 0.9}" fill="${config.colors.primary}" text-anchor="start">
          ${escapeHTML(codeText)}
        </text>`;
        // 代码块后间距随字体大小调整
        yPos += lineHeight * (1.3 + (fontSizeMultiplier - 1) * 0.2);
      }
      
      // 防止内容溢出画布
      if (yPos > dimensions.height * 0.85) {
        return;
      }
    });
    
    return svgContent;
  };

  // 渲染商务卡片专用SVG内容
  const renderBusinessSVGContent = (sections: any[], config: CardConfiguration, startY: number, dimensions: any, fontMult: number): string => {
    let yPos = startY;
    let svgContent = '';
    
    // 商务卡片专用的布局参数
    const baseFontSize = Math.min(dimensions.width, dimensions.height) * 0.018; // 稍小的基础字体
    const fontSize = baseFontSize * fontMult;
    const smallFontSize = baseFontSize * 0.875 * fontMult;
    const headerFontSize = baseFontSize * 1.2 * fontMult;
    
    // 商务卡片左侧有色块，内容从更右的位置开始
    const xStart = 60; // 固定从60px开始，避免遮挡左侧色块
    const maxWidth = dimensions.width - 120; // 左右各留60px边距
    
    // 行高优化，适合商务场景
    const baseLineHeight = dimensions.height * 0.035;
    const lineHeight = baseLineHeight * fontMult;
    
    sections.slice(0, 4).forEach((section, index) => {
      if (section.type === 'text') {
        const content = typeof section.content === 'string' ? section.content : String(section.content);
        const isEmphasis = section.style === 'emphasis' || section.level;
        const currentFontSize = isEmphasis ? headerFontSize : fontSize;
        const fontWeight = isEmphasis ? '600' : '400';
        
        // 商务风格的文本换行
        const words = content.split(' ');
        let currentLine = '';
        let lineCount = 0;
        const maxLines = 2; // 商务卡片每段最多2行
        
        for (const word of words) {
          const testLine = currentLine ? `${currentLine} ${word}` : word;
          const estimatedWidth = testLine.length * currentFontSize * 0.55;
          
          if (estimatedWidth > maxWidth) {
            if (currentLine) {
              svgContent += `<text x="${xStart}" y="${yPos}" font-family="'Helvetica', 'Arial', sans-serif" 
                font-size="${currentFontSize}" font-weight="${fontWeight}" fill="${config.colors.text}">
                ${escapeHTML(currentLine)}
              </text>`;
              yPos += lineHeight;
              lineCount++;
              if (lineCount >= maxLines) break;
            }
            currentLine = word;
          } else {
            currentLine = testLine;
          }
        }
        
        // 最后一行
        if (currentLine && lineCount < maxLines) {
          svgContent += `<text x="${xStart}" y="${yPos}" font-family="'Helvetica', 'Arial', sans-serif" 
            font-size="${currentFontSize}" font-weight="${fontWeight}" fill="${config.colors.text}">
            ${escapeHTML(currentLine)}
          </text>`;
          yPos += lineHeight;
        }
        
        yPos += lineHeight * 0.4; // 段落间距
        
      } else if (section.type === 'list' && Array.isArray(section.content)) {
        section.content.slice(0, 3).forEach((item: string) => {
          const listItem = item.length > 50 ? item.slice(0, 47) + '...' : item;
          svgContent += `<text x="${xStart + 15}" y="${yPos}" font-family="'Arial', sans-serif" 
            font-size="${smallFontSize}" fill="${config.colors.text}">
            • ${escapeHTML(listItem)}
          </text>`;
          yPos += lineHeight * 0.85;
        });
        yPos += lineHeight * 0.3;
      }
      
      // 防止内容超出边界
      if (yPos > dimensions.height - 100) return undefined;
    });
    
    return svgContent;
  };

  // 生成随机背景元素
  const generateRandomBackgroundElements = (dimensions: any, config: CardConfiguration): string => {
    const elements = [];
    
    // 随机选择背景元素类型
    const elementTypes = ['circles', 'triangles', 'lines', 'dots', 'waves'];
    const selectedType = elementTypes[Math.floor(Math.random() * elementTypes.length)];
    
    switch (selectedType) {
      case 'circles':
        // 生成随机圆形
        for (let i = 0; i < 3; i++) {
          const x = Math.random() * dimensions.width;
          const y = Math.random() * dimensions.height;
          const r = Math.random() * 50 + 20;
          const opacity = Math.random() * 0.1 + 0.05;
          elements.push(`<circle cx="${x}" cy="${y}" r="${r}" fill="${config.colors.primary}" opacity="${opacity}"/>`);
        }
        break;
        
      case 'triangles':
        // 生成随机三角形
        for (let i = 0; i < 2; i++) {
          const x = Math.random() * dimensions.width;
          const y = Math.random() * dimensions.height;
          const size = Math.random() * 40 + 15;
          const opacity = Math.random() * 0.08 + 0.03;
          const points = `${x},${y} ${x + size},${y + size * 0.866} ${x - size},${y + size * 0.866}`;
          elements.push(`<polygon points="${points}" fill="${config.colors.secondary}" opacity="${opacity}"/>`);
        }
        break;
        
      case 'lines':
        // 生成随机线条纹理
        for (let i = 0; i < 8; i++) {
          const x1 = Math.random() * dimensions.width;
          const y1 = Math.random() * dimensions.height;
          const x2 = x1 + (Math.random() - 0.5) * 100;
          const y2 = y1 + (Math.random() - 0.5) * 100;
          const opacity = Math.random() * 0.06 + 0.02;
          elements.push(`<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${config.colors.primary}" stroke-width="1" opacity="${opacity}"/>`);
        }
        break;
        
      case 'dots': {
        // 生成点阵纹理
        const dotSpacing = 40;
        for (let x = dotSpacing; x < dimensions.width; x += dotSpacing * 2) {
          for (let y = dotSpacing; y < dimensions.height; y += dotSpacing * 2) {
            if (Math.random() > 0.7) { // 只显示30%的点
              const opacity = Math.random() * 0.08 + 0.02;
              elements.push(`<circle cx="${x}" cy="${y}" r="2" fill="${config.colors.secondary}" opacity="${opacity}"/>`);
            }
          }
        }
        break;
      }
        
      case 'waves': {
        // 生成波浪纹理
        const waveY = dimensions.height * (0.3 + Math.random() * 0.4);
        const amplitude = 30;
        const frequency = dimensions.width / 200;
        let pathD = `M 0 ${waveY}`;
        for (let x = 0; x <= dimensions.width; x += 10) {
          const y = waveY + Math.sin(x * frequency) * amplitude;
          pathD += ` L ${x} ${y}`;
        }
        const opacity = Math.random() * 0.08 + 0.03;
        elements.push(`<path d="${pathD}" stroke="${config.colors.primary}" stroke-width="2" fill="none" opacity="${opacity}"/>`);
        break;
      }
    }
    
    return elements.join('\n        ');
  };

  // 生成模板特定的SVG内容
  const generateTemplateSpecificSVG = (
    templateId: string,
    dimensions: any,
    config: CardConfiguration,
    fontSizeMultiplier: number,
    title: string,
    subtitle: string,
    content: any,
    template: any
  ): string => {
    const escapeHTML = (text: string) => {
      return text.replace(/&/g, "&amp;")
                 .replace(/</g, "&lt;")
                 .replace(/>/g, "&gt;")
                 .replace(/"/g, "&quot;")
                 .replace(/'/g, "&#39;");
    };

    const lightenColor = (color: string, percent: number) => {
      // 检查是否是 HSL 格式
      if (color.startsWith('hsl(')) {
        const match = color.match(/hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/);
        if (match) {
          const [, h, s, l] = match.map(Number);
          // 调整亮度
          const newL = Math.min(100, Math.max(0, l + (percent * 100)));
          return `hsl(${h}, ${s}%, ${Math.round(newL)}%)`;
        }
      }
      
      // 处理 hex 格式
      const f = parseInt(color.slice(1), 16);
      const t = percent < 0 ? 0 : 255;
      const p = percent < 0 ? percent * -1 : percent;
      const R = f >> 16;
      const G = f >> 8 & 0x00FF;
      const B = f & 0x0000FF;
      return "#" + (0x1000000 + (Math.round((t - R) * p) + R) * 0x10000 + 
        (Math.round((t - G) * p) + G) * 0x100 + (Math.round((t - B) * p) + B))
        .toString(16).slice(1);
    };

    // 根据模板类型生成不同的SVG
    switch (templateId) {
      case 'knowledge-simple':
        return generateKnowledgeSimpleSVG(dimensions, config, fontSizeMultiplier, title, subtitle, content);
      
      case 'social-square':
        return generateSocialSquareSVG(dimensions, config, fontSizeMultiplier, title, subtitle, content);
      
      case 'social-story':
        return generateSocialStorySVG(dimensions, config, fontSizeMultiplier, title, subtitle, content);
      
      case 'business-info':
        return generateBusinessInfoSVG(dimensions, config, fontSizeMultiplier, title, subtitle, content);
      
      default:
        return generateDefaultSVG(dimensions, config, fontSizeMultiplier, title, subtitle, content, template);
    }

    // 简约知识卡模板
    function generateKnowledgeSimpleSVG(dims: any, cfg: any, fontMult: number, ttl: string, sub: string, cnt: any): string {
      return `<svg width="${dims.width}" height="${dims.height}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:${cfg.colors.background};stop-opacity:1" />
            <stop offset="100%" style="stop-color:${lightenColor(cfg.colors.background, 0.05)};stop-opacity:1" />
          </linearGradient>
        </defs>
        
        <!-- 简约背景 -->
        <rect width="100%" height="100%" fill="url(#bgGrad)" rx="12"/>
        
        <!-- 随机背景元素 -->
        ${generateRandomBackgroundElements(dims, cfg)}
        
        <!-- 左侧知识点图标区域 -->
        <rect x="30" y="60" width="6" height="${dims.height - 120}" fill="${cfg.colors.primary}" rx="3"/>
        
        ${ttl ? `<!-- 简约标题 -->
        <text x="60" y="${dims.height * 0.15}" font-family="'PingFang SC', 'Helvetica Neue', Arial, sans-serif" 
              font-size="${Math.min(dims.width, dims.height) * 0.045 * fontMult}" font-weight="600" fill="${cfg.colors.primary}">
          ${escapeHTML(ttl)}
        </text>` : ''}
        
        ${sub ? `<!-- 副标题 -->
        <text x="60" y="${dims.height * 0.25}" font-family="'PingFang SC', Arial, sans-serif" 
              font-size="${Math.min(dims.width, dims.height) * 0.025 * fontMult}" fill="${cfg.colors.secondary}">
          ${escapeHTML(sub)}
        </text>` : ''}
        
        <!-- 内容区域 -->
        ${renderSVGContent(cnt.sections, cfg, dims.height * 0.35, dims)}
        
        <!-- 底部简约标识 -->
        <text x="${dims.width - 30}" y="${dims.height - 20}" font-family="Arial" font-size="10" 
              fill="${cfg.colors.secondary}" text-anchor="end" opacity="0.6">
          文派 www.wenpai.xyz
        </text>
      </svg>`;
    }

    // 社交方图模板
    function generateSocialSquareSVG(dims: any, cfg: any, fontMult: number, ttl: string, sub: string, cnt: any): string {
      return `<svg width="${dims.width}" height="${dims.height}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <radialGradient id="socialBg" cx="50%" cy="50%" r="70%">
            <stop offset="0%" style="stop-color:${lightenColor(cfg.colors.background, 0.1)};stop-opacity:1" />
            <stop offset="100%" style="stop-color:${cfg.colors.background};stop-opacity:1" />
          </radialGradient>
        </defs>
        
        <!-- 社交媒体风格背景 -->
        <rect width="100%" height="100%" fill="url(#socialBg)" rx="20"/>
        
        <!-- 随机背景元素 -->
        ${generateRandomBackgroundElements(dims, cfg)}
        
        <!-- 顶部装饰圆形 -->
        <circle cx="100" cy="100" r="40" fill="${cfg.colors.primary}" opacity="0.1"/>
        <circle cx="${dims.width - 100}" cy="100" r="60" fill="${cfg.colors.secondary}" opacity="0.08"/>
        
        ${ttl ? `<!-- 居中大标题 -->
        <text x="50%" y="${dims.height * 0.3}" font-family="'Helvetica Neue', Arial, sans-serif" 
              font-size="${Math.min(dims.width, dims.height) * 0.05 * fontMult}" font-weight="700" fill="${cfg.colors.primary}" 
              text-anchor="middle">${escapeHTML(ttl)}</text>` : ''}
        
        ${sub ? `<!-- 副标题 -->
        <text x="50%" y="${dims.height * 0.4}" font-family="Arial, sans-serif" 
              font-size="${Math.min(dims.width, dims.height) * 0.03 * fontMult}" fill="${cfg.colors.secondary}" 
              text-anchor="middle">${escapeHTML(sub)}</text>` : ''}
        
        <!-- 内容区域 -->
        ${renderSVGContent(cnt.sections, cfg, dims.height * 0.48, dims)}
        
        <!-- 底部社交标识 -->
        <rect x="${dims.width * 0.1}" y="${dims.height - 60}" width="${dims.width * 0.8}" height="2" fill="${cfg.colors.primary}" opacity="0.3"/>
        <text x="50%" y="${dims.height - 20}" font-family="Arial" font-size="12" 
              fill="${cfg.colors.secondary}" text-anchor="middle" opacity="0.8">
          文派 www.wenpai.xyz
        </text>
      </svg>`;
    }

    // Stories竖屏模板
    function generateSocialStorySVG(dims: any, cfg: any, fontMult: number, ttl: string, sub: string, cnt: any): string {
      return `<svg width="${dims.width}" height="${dims.height}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="storyBg" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" style="stop-color:${lightenColor(cfg.colors.background, 0.2)};stop-opacity:1" />
            <stop offset="50%" style="stop-color:${cfg.colors.background};stop-opacity:1" />
            <stop offset="100%" style="stop-color:${lightenColor(cfg.colors.background, -0.1)};stop-opacity:1" />
          </linearGradient>
        </defs>
        
        <!-- Stories风格背景 -->
        <rect width="100%" height="100%" fill="url(#storyBg)" rx="25"/>
        
        <!-- 顶部状态栏风格装饰 -->
        <rect x="20" y="20" width="${dims.width - 40}" height="4" fill="${cfg.colors.primary}" rx="2" opacity="0.3"/>
        
        ${ttl ? `<!-- 顶部标题 -->
        <text x="50%" y="${dims.height * 0.12}" font-family="'Helvetica Neue', Arial, sans-serif" 
              font-size="${dims.width * 0.08 * fontMult}" font-weight="800" fill="${cfg.colors.primary}" 
              text-anchor="middle">${escapeHTML(ttl)}</text>` : ''}
        
        ${sub ? `<!-- 副标题 -->
        <text x="50%" y="${dims.height * 0.18}" font-family="Arial, sans-serif" 
              font-size="${dims.width * 0.05 * fontMult}" fill="${cfg.colors.secondary}" 
              text-anchor="middle">${escapeHTML(sub)}</text>` : ''}
        
        <!-- 中心内容区域 -->
        <rect x="${dims.width * 0.05}" y="${dims.height * 0.25}" width="${dims.width * 0.9}" height="${dims.height * 0.5}" 
              fill="white" rx="15" opacity="0.95" stroke="${cfg.colors.primary}" stroke-width="1" stroke-opacity="0.3"/>
        
        <!-- 内容 -->
        ${renderSVGContent(cnt.sections, cfg, dims.height * 0.3, dims)}
        
        <!-- 底部Stories标识 -->
        <text x="50%" y="${dims.height - 40}" font-family="Arial" font-size="14" 
              fill="${cfg.colors.secondary}" text-anchor="middle" opacity="0.9">
          文派 www.wenpai.xyz
        </text>
      </svg>`;
    }

    // 商务信息卡模板
    function generateBusinessInfoSVG(dims: any, cfg: any, fontMult: number, ttl: string, sub: string, cnt: any): string {
      return `<svg width="${dims.width}" height="${dims.height}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="bizBg" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" style="stop-color:${cfg.colors.background};stop-opacity:1" />
            <stop offset="100%" style="stop-color:${lightenColor(cfg.colors.background, 0.05)};stop-opacity:1" />
          </linearGradient>
        </defs>
        
        <!-- 商务风格背景 -->
        <rect width="100%" height="100%" fill="url(#bizBg)" rx="8"/>
        
        <!-- 随机背景元素 -->
        ${generateRandomBackgroundElements(dims, cfg)}
        
        <!-- 左侧专业色块 -->
        <rect x="0" y="0" width="8" height="100%" fill="${cfg.colors.primary}"/>
        
        <!-- 顶部专业横条 -->
        <rect x="0" y="0" width="100%" height="40" fill="${cfg.colors.primary}" opacity="0.1"/>
        
        ${ttl ? `<!-- 专业标题 -->
        <text x="60" y="70" font-family="'Helvetica', 'Arial', sans-serif" 
              font-size="${dims.width * 0.032 * fontMult}" font-weight="600" fill="${cfg.colors.primary}">
          ${escapeHTML(ttl)}
        </text>` : ''}
        
        ${sub ? `<!-- 副标题 -->
        <text x="60" y="110" font-family="Arial, sans-serif" 
              font-size="${dims.width * 0.022 * fontMult}" fill="${cfg.colors.secondary}">
          ${escapeHTML(sub)}
        </text>` : ''}
        
        <!-- 内容区域 -->
        ${renderBusinessSVGContent(cnt.sections, cfg, 160, dims, fontMult)}
        
        <!-- 底部专业标识 -->
        <rect x="60" y="${dims.height - 50}" width="${dims.width - 120}" height="1" fill="${cfg.colors.primary}" opacity="0.3"/>
        <text x="${dims.width - 30}" y="${dims.height - 20}" font-family="Arial" font-size="11" 
              fill="${cfg.colors.secondary}" text-anchor="end" opacity="0.7">
          文派 www.wenpai.xyz
        </text>
      </svg>`;
    }

    // 默认模板
    function generateDefaultSVG(dims: any, cfg: any, fontMult: number, ttl: string, sub: string, cnt: any, tmpl: any): string {
      return `<svg width="${dims.width}" height="${dims.height}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="defaultBg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:${cfg.colors.background};stop-opacity:1" />
            <stop offset="100%" style="stop-color:${lightenColor(cfg.colors.background, 0.1)};stop-opacity:1" />
          </linearGradient>
        </defs>
        
        <rect width="100%" height="100%" fill="url(#defaultBg)" rx="16"/>
        
        <!-- 随机背景元素 -->
        ${generateRandomBackgroundElements(dims, cfg)}
        
        ${ttl ? `<text x="50%" y="${dims.height * 0.2}" font-family="Arial, sans-serif" 
              font-size="${Math.min(dims.width, dims.height) * 0.04 * fontMult}" font-weight="bold" fill="${cfg.colors.primary}" 
              text-anchor="middle">${escapeHTML(ttl)}</text>` : ''}
        
        ${renderSVGContent(cnt.sections, cfg, dims.height * 0.3, dims)}
        
        <text x="50%" y="${dims.height - 20}" font-family="Arial" font-size="10" 
              fill="${cfg.colors.secondary}" text-anchor="middle" opacity="0.7">
          文派 www.wenpai.xyz
        </text>
      </svg>`;
    }
  };

  return (
    <div className="bg-background">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
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
                    variant="outline"
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
                    <Download className="w-4 h-4 mr-1" />
                    JPG
                  </PermissionLockedButton>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleExportCard('svg')}
                    disabled={!cardData?.imageData}
                  >
                    <Download className="w-4 h-4 mr-1" />
                    SVG
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 主要内容区域 - 对称美观布局 */}
        <div className="flex-1 flex flex-col lg:flex-row gap-0 bg-gradient-to-r from-slate-50/30 to-blue-50/30 min-h-screen" >
          {/* 左侧：编辑器和设置区域 */}
          <div className={`inline-style-converted ${showPreview ? 'lg:w-1/2' : 'w-full'}`}>
            {/* 标签页导航 */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
              {/* 优化的标签页导航 */}
              <TabsList className="unified-tabs-list grid w-full grid-cols-3">
                <TabsTrigger value="content" className="unified-tab-trigger">
                  <Edit3 className="w-4 h-4" />
                  内容编辑
                </TabsTrigger>
                <TabsTrigger value="template" className="unified-tab-trigger">
                  <Square className="w-4 h-4" />
                  模板选择
                </TabsTrigger>
                <TabsTrigger value="styles" className="unified-tab-trigger">
                  <Palette className="w-4 h-4" />
                  快速样式
                </TabsTrigger>
              </TabsList>

              {/* 模板选择 */}
              <TabsContent value="template" className="flex-1 p-6 overflow-y-auto min-h-0">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-sm font-medium mb-2">选择模板</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-96 overflow-y-auto">
                      {[...CARD_TEMPLATES, ...DEFAULT_TEMPLATES.filter(dt => !CARD_TEMPLATES.some(ct => ct.id === dt.id))].slice(0, 6).map((template) => (
                        <Card 
                          key={template.id}
                          className={`cursor-pointer transition-all hover:shadow-md ${
                            selectedTemplate === template.id ? 'ring-2 ring-primary' : ''
                          }`}
                          onClick={() => handleTemplateChange(template.id)}
                        >
                          <CardContent className="p-3">
                            <div
                              className="w-full rounded mb-2 border border-border bg-muted/30 relative overflow-hidden"
                              style={{ paddingTop: `${100 / ((template.dimensions?.width || 4) / (template.dimensions?.height || 3))}%` }}
                            >
                              <div className="absolute inset-0 flex flex-col">
                                <div className="h-3" style={{ backgroundColor: 'hsl(var(--primary) / 0.6)' }} />
                                <div className="flex-1 p-2">
                                  <div className="h-2 rounded w-3/4 mb-1" style={{ backgroundColor: 'hsl(var(--foreground) / 0.2)' }} />
                                  <div className="h-2 rounded w-1/2" style={{ backgroundColor: 'hsl(var(--foreground) / 0.1)' }} />
                                </div>
                              </div>
                            </div>
                            <div className="space-y-1">
                              <div className="flex items-center justify-between">
                                <h4 className="text-sm font-medium">{template.displayName}</h4>
                                <Badge variant="secondary" className="text-[10px] px-1.5 py-0.5">
                                  {template.dimensions?.aspectRatio}
                                </Badge>
                              </div>
                              <p className="text-xs text-muted-foreground">{template.description}</p>
                              <div className="text-[11px] text-muted-foreground">
                                {(template.dimensions?.width || 0)}×{(template.dimensions?.height || 0)}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* 内容编辑 */}
              <TabsContent value="content" className="flex-1 flex flex-col p-6 min-h-0 overflow-hidden">
                  {/* 编辑器头部信息 */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm font-medium">MD2Card 编辑器</span>
                      {isGenerating && (
                        <RefreshCw className="w-3 h-3 animate-spin text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>{wordCount} 字</span>
                      <span>约 {estimatedReadTime} 分钟阅读</span>
                    </div>
                  </div>

                  {/* 文本格式化工具栏 */}
                  <div className="mb-4 p-3 bg-gradient-to-r from-slate-50/80 to-blue-50/80 rounded-xl border border-slate-200/50 shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Type className="w-4 h-4 text-slate-600" />
                        <span className="text-sm font-medium text-slate-700">文本格式</span>
                      </div>
                      {/* 字体大小 */}
                      <div className="flex gap-1">
                        <button 
                          className={`px-2 py-1 text-xs rounded transition-all ${
                            cardConfig.typography.fontSize === 'small' 
                              ? 'bg-primary text-background' 
                              : 'bg-background border border-slate-200 text-slate-600 hover:bg-slate-50'
                          }`}
                          onClick={() => setCardConfig(prev => ({
                            ...prev,
                            typography: { ...prev.typography, fontSize: 'small' }
                          }))}
                        >
                          小
                        </button>
                        <button 
                          className={`px-2 py-1 text-xs rounded transition-all ${
                            cardConfig.typography.fontSize === 'medium' 
                              ? 'bg-primary text-background' 
                              : 'bg-background border border-slate-200 text-slate-600 hover:bg-slate-50'
                          }`}
                          onClick={() => setCardConfig(prev => ({
                            ...prev,
                            typography: { ...prev.typography, fontSize: 'medium' }
                          }))}
                        >
                          中
                        </button>
                        <button 
                          className={`px-2 py-1 text-xs rounded transition-all ${
                            cardConfig.typography.fontSize === 'large' 
                              ? 'bg-primary text-background' 
                              : 'bg-background border border-slate-200 text-slate-600 hover:bg-slate-50'
                          }`}
                          onClick={() => setCardConfig(prev => ({
                            ...prev,
                            typography: { ...prev.typography, fontSize: 'large' }
                          }))}
                        >
                          大
                        </button>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                      {/* 标题工具 */}
                      <div className="flex gap-1 p-1 bg-background rounded-lg border border-slate-200">
                        <button 
                          className="p-2 rounded hover:bg-slate-100 transition-colors" 
                          title="一级标题 (Ctrl+1)"
                          onClick={() => insertLineMarkdown('# ', '标题')}
                        >
                          <Heading1 className="w-4 h-4" />
                        </button>
                        <button
                          className="p-2 rounded hover:bg-slate-100 transition-colors"
                          title="二级标题 (Ctrl+2)"
                          onClick={() => insertLineMarkdown('## ', '副标题')}
                        >
                          <Heading2 className="w-4 h-4" />
                        </button>
                        <button 
                          className="p-2 rounded hover:bg-slate-100 transition-colors" 
                          title="三级标题 (Ctrl+3)"
                          onClick={() => insertLineMarkdown('### ', '小标题')}
                        >
                          <Heading3 className="w-4 h-4" />
                        </button>
                      </div>

                      {/* 文本样式工具 */}
                      <div className="flex gap-1 p-1 bg-background rounded-lg border border-slate-200">
                        <button 
                          className="p-2 rounded hover:bg-slate-100 transition-colors" 
                          title="加粗 (Ctrl+B)"
                          onClick={() => insertMarkdown('**', '**', '文本')}
                        >
                          <Bold className="w-4 h-4" />
                        </button>
                        <button 
                          className="p-2 rounded hover:bg-slate-100 transition-colors" 
                          title="斜体 (Ctrl+I)"
                          onClick={() => insertMarkdown('*', '*', '文本')}
                        >
                          <Italic className="w-4 h-4" />
                        </button>
                        <button 
                          className="p-2 rounded hover:bg-slate-100 transition-colors" 
                          title="代码 (Ctrl+`)"
                          onClick={() => insertMarkdown('`', '`', 'code')}
                        >
                          <Code className="w-4 h-4" />
                        </button>
                      </div>

                      {/* 列表工具 */}
                      <div className="flex gap-1 p-1 bg-background rounded-lg border border-slate-200">
                        <button
                          className="p-2 rounded hover:bg-slate-100 transition-colors"
                          title="无序列表"
                          onClick={() => insertLineMarkdown('- ', '列表项')}
                        >
                          <List className="w-4 h-4" />
                        </button>
                        <button
                          className="p-2 rounded hover:bg-slate-100 transition-colors"
                          title="有序列表"
                          onClick={() => insertLineMarkdown('1. ', '列表项')}
                        >
                          <ListOrdered className="w-4 h-4" />
                        </button>
                        <button
                          className="p-2 rounded hover:bg-slate-100 transition-colors"
                          title="引用"
                          onClick={() => insertLineMarkdown('> ', '引用内容')}
                        >
                          <Quote className="w-4 h-4" />
                        </button>
                      </div>

                      {/* 链接工具 */}
                      <div className="flex gap-1 p-1 bg-background rounded-lg border border-slate-200">
                        <button
                          className="p-2 rounded hover:bg-slate-100 transition-colors"
                          title="插入链接"
                          onClick={() => insertMarkdown('[', '](https://example.com)', '链接文本')}
                        >
                          <Link className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* 编辑器内容区域 */}

                {/* 编辑器内容 - 固定高度 */}
                <div className="flex-1 overflow-hidden bg-gradient-to-br from-white/90 to-slate-50/80 rounded-xl border-2 border-slate-200/50 shadow-sm">
                  <PermissionProtectedInput
                    requiredTier="pro"
                    featureName="MD2Card 编辑器"
                  >
                    <textarea
                      ref={textareaRef}
                      value={markdownContent}
                      onChange={(e) => handleContentChange(e.target.value)}
                      className="w-full h-full min-h-[400px] p-4 border-0 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-300/50 bg-transparent text-gray-800 font-mono text-sm leading-relaxed transition-all placeholder:text-gray-400 overflow-y-auto"
                      placeholder="✍️ 在这里输入Markdown内容，创建你的专属卡片..."
                    />
                  </PermissionProtectedInput>
                </div>
              </TabsContent>

              {/* 快速样式 */}
              <TabsContent value="styles" className="p-4 overflow-y-auto inline-style-converted" >
                <div className="space-y-4">
                  {/* 颜色设置 */}
                  <div className="rounded-xl p-4 border border-border shadow-sm bg-muted/30">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="p-1.5 rounded-md bg-primary/15">
                        <Palette className="w-4 h-4 text-primary" />
                      </div>
                      <h3 className="text-base font-semibold text-foreground">颜色配置</h3>
                    </div>
                    
                    {/* 一键配色 */}
                    <div className="mb-4">
                      <label className="text-xs font-medium text-muted-foreground mb-2 block">一键配色</label>
                      <div className="grid grid-cols-6 gap-2 mb-4">
                        {/* 蓝色商务 */}
                        <button
                          className="group relative w-10 h-10 rounded-md border border-border shadow-sm hover:shadow-md hover:scale-110 transition-all duration-200 u-gradient-blue"
                          title="蓝色商务"
                          onClick={() => setCardConfig(prev => ({
                            ...prev,
                            colors: {
                              primary: '#3B82F6',
                              secondary: '#64748B',
                              background: '#F8FAFC',
                              text: '#1F2937',
                              accent: '#2563EB'
                            }
                          }))}
                        />
                        
                        {/* 绿色清新 */}
                        <button
                          className="group relative w-10 h-10 rounded-md border border-border shadow-sm hover:shadow-md hover:scale-110 transition-all duration-200 u-gradient-green"
                          title="绿色清新"
                          onClick={() => setCardConfig(prev => ({
                            ...prev,
                            colors: {
                              primary: '#10B981',
                              secondary: '#059669',
                              background: '#F0FDF4',
                              text: '#1F2937',
                              accent: '#047857'
                            }
                          }))}
                        />
                        
                        {/* 紫色优雅 */}
                        <button
                          className="group relative w-10 h-10 rounded-md border border-border shadow-sm hover:shadow-md hover:scale-110 transition-all duration-200 u-gradient-purple"
                          title="紫色优雅"
                          onClick={() => setCardConfig(prev => ({
                            ...prev,
                            colors: {
                              primary: '#8B5CF6',
                              secondary: '#A855F7',
                              background: '#FAF5FF',
                              text: '#1F2937',
                              accent: '#7C3AED'
                            }
                          }))}
                        />
                        
                        {/* 橙色活力 */}
                        <button
                          className="group relative w-10 h-10 rounded-md border border-border shadow-sm hover:shadow-md hover:scale-110 transition-all duration-200 u-gradient-amber"
                          title="橙色活力"
                          onClick={() => setCardConfig(prev => ({
                            ...prev,
                            colors: {
                              primary: '#F59E0B',
                              secondary: '#EA580C',
                              background: '#FFFBEB',
                              text: '#1F2937',
                              accent: '#D97706'
                            }
                          }))}
                        />
                        
                        {/* 粉色温馨 */}
                        <button
                          className="group relative w-10 h-10 rounded-md border border-border shadow-sm hover:shadow-md hover:scale-110 transition-all duration-200 u-gradient-pink"
                          title="粉色温馨"
                          onClick={() => setCardConfig(prev => ({
                            ...prev,
                            colors: {
                              primary: '#EC4899',
                              secondary: '#BE185D',
                              background: '#FDF2F8',
                              text: '#1F2937',
                              accent: '#DB2777'
                            }
                          }))}
                        />
                        
                        {/* 暗色专业 */}
                        <button
                          className="group relative w-10 h-10 rounded-md border border-border shadow-sm hover:shadow-md hover:scale-110 transition-all duration-200 u-gradient-gray"
                          title="暗色专业"
                          onClick={() => setCardConfig(prev => ({
                            ...prev,
                            colors: {
                              primary: '#374151',
                              secondary: '#6B7280',
                              background: '#F9FAFB',
                              text: '#1F2937',
                              accent: '#4B5563'
                            }
                          }))}
                        />
                        
                        {/* 红色热情 */}
                        <button
                          className="group relative w-10 h-10 rounded-md border border-border shadow-sm hover:shadow-md hover:scale-110 transition-all duration-200 u-gradient-red"
                          title="红色热情"
                          onClick={() => setCardConfig(prev => ({
                            ...prev,
                            colors: {
                              primary: '#EF4444',
                              secondary: '#DC2626',
                              background: '#FEF2F2',
                              text: '#1F2937',
                              accent: '#B91C1C'
                            }
                          }))}
                        />
                        
                        {/* 青色清爽 */}
                        <button
                          className="group relative w-10 h-10 rounded-md border border-border shadow-sm hover:shadow-md hover:scale-110 transition-all duration-200 u-gradient-cyan"
                          title="青色清爽"
                          onClick={() => setCardConfig(prev => ({
                            ...prev,
                            colors: {
                              primary: '#06B6D4',
                              secondary: '#0891B2',
                              background: '#F0FDFF',
                              text: '#1F2937',
                              accent: '#0E7490'
                            }
                          }))}
                        />
                        
                        {/* 黄色阳光 */}
                        <button
                          className="group relative w-10 h-10 rounded-md border border-border shadow-sm hover:shadow-md hover:scale-110 transition-all duration-200 u-gradient-yellow"
                          title="黄色阳光"
                          onClick={() => setCardConfig(prev => ({
                            ...prev,
                            colors: {
                              primary: '#EAB308',
                              secondary: '#CA8A04',
                              background: '#FEFCE8',
                              text: '#1F2937',
                              accent: '#A16207'
                            }
                          }))}
                        />
                        
                        {/* 玫瑰金 */}
                        <button
                          className="group relative w-10 h-10 rounded-md border border-border shadow-sm hover:shadow-md hover:scale-110 transition-all duration-200 u-gradient-orange"
                          title="玫瑰金"
                          onClick={() => setCardConfig(prev => ({
                            ...prev,
                            colors: {
                              primary: '#F97316',
                              secondary: '#EA580C',
                              background: '#FFF7ED',
                              text: '#1F2937',
                              accent: '#C2410C'
                            }
                          }))}
                        />
                        
                        {/* 薄荷绿 */}
                        <button
                          className="group relative w-10 h-10 rounded-md border border-border shadow-sm hover:shadow-md hover:scale-110 transition-all duration-200 u-gradient-emerald"
                          title="薄荷绿"
                          onClick={() => setCardConfig(prev => ({
                            ...prev,
                            colors: {
                              primary: '#22C55E',
                              secondary: '#16A34A',
                              background: '#F0FDF4',
                              text: '#1F2937',
                              accent: '#15803D'
                            }
                          }))}
                        />
                        
                        {/* 靛青深邃 */}
                        <button
                          className="group relative w-10 h-10 rounded-md border border-border shadow-sm hover:shadow-md hover:scale-110 transition-all duration-200 u-gradient-indigo"
                          title="靛青深邃"
                          onClick={() => setCardConfig(prev => ({
                            ...prev,
                            colors: {
                              primary: '#4F46E5',
                              secondary: '#4338CA',
                              background: '#F8FAFC',
                              text: '#1F2937',
                              accent: '#3730A3'
                            }
                          }))}
                        />
                      </div>
                      
                      {/* 第二行配色方案 */}
                      <div className="grid grid-cols-6 gap-2 mb-4">
                        {/* 湖水蓝 */}
                        <button
                          className="group relative w-10 h-10 rounded-md border border-border shadow-sm hover:shadow-md hover:scale-110 transition-all duration-200 u-gradient-sky"
                          title="湖水蓝"
                          onClick={() => setCardConfig(prev => ({
                            ...prev,
                            colors: {
                              primary: '#0EA5E9',
                              secondary: '#0284C7',
                              background: '#F0F9FF',
                              text: '#1F2937',
                              accent: '#0369A1'
                            }
                          }))}
                        />
                        
                        {/* 森林绿 */}
                        <button
                          className="group relative w-10 h-10 rounded-md border border-border shadow-sm hover:shadow-md hover:scale-110 transition-all duration-200 u-gradient-teal"
                          title="森林绿"
                          onClick={() => setCardConfig(prev => ({
                            ...prev,
                            colors: {
                              primary: '#059669',
                              secondary: '#047857',
                              background: '#ECFDF5',
                              text: '#1F2937',
                              accent: '#065F46'
                            }
                          }))}
                        />
                        
                        {/* 紫罗兰 */}
                        <button
                          className="group relative w-10 h-10 rounded-md border border-border shadow-sm hover:shadow-md hover:scale-110 transition-all duration-200 u-gradient-violet"
                          title="紫罗兰"
        onClick={() => setCardConfig(prev => ({
                            ...prev,
                            colors: {
                              primary: '#7C3AED',
                              secondary: '#6D28D9',
                              background: '#F5F3FF',
                              text: '#1F2937',
                              accent: '#5B21B6'
                            }
                          }))}
                        />
                        
                        {/* 石墨黑 */}
                        <button
                          className="group relative w-10 h-10 rounded-md border border-border shadow-sm hover:shadow-md hover:scale-110 transition-all duration-200 u-gradient-slate"
                          title="石墨黑"
        onClick={() => setCardConfig(prev => ({
                            ...prev,
                            colors: {
                              primary: '#1F2937',
                              secondary: '#111827',
                              background: '#F9FAFB',
                              text: '#1F2937',
                              accent: '#374151'
                            }
                          }))}
                        />
                        
                        {/* 珊瑚橙 */}
                        <button
                          className="group relative w-10 h-10 rounded-md border border-border shadow-sm hover:shadow-md hover:scale-110 transition-all duration-200 u-gradient-rose"
                          title="珊瑚橙"
        onClick={() => setCardConfig(prev => ({
                            ...prev,
                            colors: {
                              primary: '#FB7185',
                              secondary: '#F43F5E',
                              background: '#FFF1F2',
                              text: '#1F2937',
                              accent: '#E11D48'
                            }
                          }))}
                        />
                        
                        {/* 随机配色 */}
                        <button
                          className="group relative w-10 h-10 rounded-md border-2 border-dashed border-border shadow-sm hover:shadow-md hover:scale-110 transition-all duration-200 bg-gradient-to-br from-red-400 via-yellow-400 via-green-400 via-blue-400 to-purple-400"
                          title="随机配色"
                          onClick={() => {
                            const generateRandomColor = () => {
                              const hue = Math.floor(Math.random() * 360);
                              const sat = Math.floor(Math.random() * 40) + 50;
                              const light = Math.floor(Math.random() * 30) + 40;
                              return `hsl(${hue}, ${sat}%, ${light}%)`;
                            };
                            
                            const randomScheme = {
                              primary: generateRandomColor(),
                              secondary: generateRandomColor(),
                              background: `hsl(${Math.floor(Math.random() * 360)}, ${Math.floor(Math.random() * 25) + 10}%, ${Math.floor(Math.random() * 10) + 90}%)`,
                              text: '#1F2937',
                              accent: generateRandomColor()
                            };
                            
                            setCardConfig(prev => ({
                              ...prev,
                              colors: randomScheme
                            }));
                          }}
                        >
                          <div className="absolute inset-0 flex items-center justify-center text-background text-xs font-bold">
                            🎲
                          </div>
                        </button>
                      </div>
                    </div>
                    
                    {/* 自定义配色 */}
                    <div>
                      <label className="text-xs font-medium text-gray-700 mb-2 block">自定义配色</label>
                      <div className="grid grid-cols-3 gap-3">
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-gray-700 block">主色调</label>
                        <input
                          type="color"
                          value={cardConfig.colors.primary}
                          onChange={(e) => handleConfigChange({
                            colors: { ...cardConfig.colors, primary: e.target.value }
                          })}
                          className="w-full h-8 rounded-md border border-border cursor-pointer hover:border-purple-300 transition-colors"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-gray-700 block">次要色调</label>
                        <input
                          type="color"
                          value={cardConfig.colors.secondary}
                          onChange={(e) => handleConfigChange({
                            colors: { ...cardConfig.colors, secondary: e.target.value }
                          })}
                          className="w-full h-8 rounded-md border border-border cursor-pointer hover:border-purple-300 transition-colors"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-gray-700 block">背景色</label>
                        <input
                          type="color"
                          value={cardConfig.colors.background}
                          onChange={(e) => handleConfigChange({
                            colors: { ...cardConfig.colors, background: e.target.value }
                          })}
                          className="w-full h-8 rounded-md border border-border cursor-pointer hover:border-purple-300 transition-colors"
                        />
                      </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* 背景设置 */}
                  <div className="bg-gradient-to-br from-orange-50/50 to-yellow-50/50 rounded-xl p-4 border border-orange-100/50 shadow-sm">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="p-1.5 bg-orange-100 rounded-md">
                        <Square className="w-4 h-4 text-orange-600" />
                      </div>
                      <h3 className="text-base font-semibold text-gray-800">背景样式</h3>
                    </div>
                    
                    <div className="space-y-3">
                      
                      <Button
                        onClick={() => {
                          // 触发重新生成卡片以获得新的随机背景
                          const currentContent = markdownContent;
                          setMarkdownContent(currentContent + ' '); // 触发更新
                          setTimeout(() => {
                            setMarkdownContent(currentContent); // 恢复原内容
                          }, 100);
                        }}
                        className="w-full h-12 text-base font-medium bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-background rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
                      >
                        🎲 重新生成背景样式
                      </Button>
                      
                      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mt-4">
                        {['圆形', '三角形', '线条', '点阵', '波浪'].map((style, index) => (
                          <div key={style} className="text-center p-2 bg-background/50 rounded-lg border border-orange-100">
                            <div className="text-lg mb-1">
                              {['○', '△', '—', '···', '～'][index]}
                            </div>
                            <div className="text-xs text-muted-foreground">{style}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

            </Tabs>
          </div>

          {/* 右侧：预览区域 */}
          {showPreview && (
            <div className="lg:w-1/2 w-full flex flex-col h-full bg-gradient-to-br from-indigo-50/50 to-purple-50/50 backdrop-blur-sm">
              {/* 预览头部信息 - 优雅的头部设计 */}
              <div className="p-4 bg-gradient-to-r from-white/90 to-slate-50/90 border-b border-slate-200/60 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-1 bg-indigo-100 rounded-md">
                      <Eye className="w-4 h-4 text-indigo-600" />
                    </div>
                    <span className="text-sm font-semibold text-gray-800">
                      {isMobilePreview ? '移动端预览' : '桌面端预览'}
                    </span>
                    <Badge variant="secondary" className="text-xs bg-indigo-100 text-indigo-700 border-indigo-200">
                      {(CARD_TEMPLATES.find(t => t.id === selectedTemplate) || 
                       DEFAULT_TEMPLATES.find(t => t.id === selectedTemplate))?.displayName}
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

                {/* 预览内容区域 - 美观的展示区域 */}
                <div className="flex-1 overflow-hidden min-h-0 m-4 bg-gradient-to-br from-white/90 via-blue-50/30 to-indigo-50/40 rounded-xl border-2 border-indigo-200/30 shadow-lg backdrop-blur-sm">
                  <div className="w-full h-full flex items-center justify-center p-6">
                    <PermissionProtectedInput
                      requiredTier="pro"
                      featureName="MD2Card 卡片预览"
                    >
                      {(() => {
                        // 获取当前模板的尺寸信息
                        const currentTemplate = CARD_TEMPLATES.find(t => t.id === selectedTemplate) || 
                                               DEFAULT_TEMPLATES.find(t => t.id === selectedTemplate);
                        const dimensions = currentTemplate?.dimensions || { width: 800, height: 600, aspectRatio: '4:3' };
                        const aspectRatio = dimensions.width / dimensions.height;
                        
                        // 根据比例智能调整显示尺寸
                        let maxWidth, maxHeight;
                        
                        if (isMobilePreview) {
                          maxWidth = '90%';
                          maxHeight = '85%';
                        } else if (aspectRatio > 1.6) {
                          // 宽屏模板 (如 business-info 1.91:1)
                          maxWidth = '95%';
                          maxHeight = '70%';
                        } else if (aspectRatio < 0.8) {
                          // 竖屏模板 (如 social-story 9:16) - 最大化垂直空间
                          maxWidth = '45%';
                          maxHeight = '98%';
                        } else if (aspectRatio >= 0.9 && aspectRatio <= 1.1) {
                          // 方形模板 (如 social-square 1:1) - 特殊优化
                          maxWidth = '65%';
                          maxHeight = '90%';
                        } else {
                          // 标准比例模板 (如 knowledge 4:3)
                          maxWidth = '75%';
                          maxHeight = '75%';
                        }
                        
                        // 调试信息
                        if (import.meta.env.DEV) {
                          console.log('🖼️ preview缩放calculating:', {
                            template: selectedTemplate,
                            dimensions: `${dimensions.width}×${dimensions.height}`,
                            aspectRatio: aspectRatio.toFixed(2),
                            maxWidth,
                            maxHeight,
                            isMobilePreview
                          });
                        }
                        
                        return (
                          <div className="relative w-full h-full flex items-center justify-center">
                            <div className={`inline-style-converted bg-background rounded-xl shadow-2xl border-2 border-border/50 ring-1 ring-gray-300/20 hover:shadow-3xl transition-all duration-300 ${
                              isGenerating ? 'animate-pulse shadow-pulse' : 'shadow-[0_10px_40px_-15px_rgba(0,0,0,0.3)]'
                            }`}>
                          {cardData?.imageData ? (
                            <div className="relative group cursor-pointer" onClick={() => setIsFullscreenOpen(true)}>
                              <img 
                                src={cardData.imageData} 
                                alt="Generated Card" 
                                className="w-full h-full object-contain rounded-xl transition-all duration-300 group-hover:scale-[1.02] inline-style-converted" 
                              />
                              {/* 悬停放大提示 */}
                              <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/10 transition-colors duration-300 rounded-xl flex items-center justify-center">
                                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-foreground/50 text-background px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-2">
                                  <Maximize className="w-4 h-4" />
                                  点击放大查看
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div 
                              className="w-full h-full flex items-center justify-center border-2 border-dashed border-blue-200 bg-gradient-to-br from-white to-blue-50/50 rounded-xl backdrop-blur-sm inline-style-converted" 
                            >
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
                          </div>
                        );
                      })()}
                    </PermissionProtectedInput>
                  </div>
                </div>
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

      {/* 全屏预览模态框 */}
      {isFullscreenOpen && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.95)',
            zIndex: 999999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 'var(--spacing-20) var(--spacing-10) var(--spacing-10) var(--spacing-10)'
          }}
          onClick={() => setIsFullscreenOpen(false)}
        >
          {/* 关闭按钮 */}
          <button
            style={{
              position: 'absolute',
              top: 'var(--spacing-4)',
              right: 'var(--spacing-4)',
              color: 'white',
              background: 'rgba(255, 255, 255, 0.2)',
              border: 'none',
              cursor: 'pointer',
              zIndex: 1000000,
              width: 'var(--spacing-10)',
              height: 'var(--spacing-10)',
              borderRadius: '50%',
              fontSize: 'var(--spacing-4-5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'background-color 0.2s'
            }}
            onMouseOver={(e) => {
              const target = e.target as HTMLElement;
              target.style.backgroundColor = 'rgba(255, 255, 255, 0.3)';
            }}
            onMouseOut={(e) => {
              const target = e.target as HTMLElement;
              target.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
            }}
            onClick={(e) => {
              e.stopPropagation();
              setIsFullscreenOpen(false);
            }}
          >
            ✕
          </button>

          {/* SVG图片 */}
          {cardData?.imageData && (
            <img 
              src={cardData.imageData} 
              alt="卡片全屏预览" 
              style={{
                maxWidth: 'calc(100vw - var(--spacing-20))',
                maxHeight: 'calc(100vh - 180px)',
                width: 'auto',
                height: 'auto',
                display: 'block',
                objectFit: 'contain',
                boxShadow: '0 25px 50px -var(--spacing-3) hsl(var(--foreground) / 0.5)'
              }}
              onClick={(e) => e.stopPropagation()}
            />
          )}

          {/* 提示 */}
          <div 
            style={{
              position: 'absolute',
              bottom: 'var(--spacing-4)',
              left: '50%',
              transform: 'translateX(-50%)',
              color: 'rgba(255, 255, 255, 0.8)',
              fontSize: 'var(--spacing-3-5)'
            }}
          >
            按 ESC 或点击空白区域关闭
          </div>
        </div>
      )}
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
      // 根据模板获取正确的尺寸
      const template = CARD_TEMPLATES.find(t => t.id === params.templateId) || 
                      DEFAULT_TEMPLATES.find(t => t.id === params.templateId);
      const width = template?.dimensions.width || 800;
      const height = template?.dimensions.height || 600;
      
      const svgContent = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
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
  return match ? match[1] : '';
}

async function exportCardAsImage(imageData: string, format: 'png' | 'jpg' | 'svg'): Promise<Blob> {
  try {
    // 环境检查
    if (typeof window === 'undefined') {
      throw new Error('导出功能需要在浏览器环境中运行');
    }
    
    // 解析SVG内容
    let svgContent: string;
    
    if (imageData.startsWith('data:image/svg+xml;base64,')) {
      // Base64编码的SVG，正确处理UTF-8字符
      const base64Data = imageData.replace('data:image/svg+xml;base64,', '');
      try {
        // 使用TextDecoder确保UTF-8正确解码
        const binaryString = window.atob(base64Data);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        svgContent = new TextDecoder('utf-8').decode(bytes);
      } catch (e) {
        // 后备方案
        svgContent = decodeURIComponent(escape(window.atob(base64Data)));
      }
    } else if (imageData.startsWith('data:image/svg+xml,')) {
      // URL编码的SVG
      svgContent = decodeURIComponent(imageData.replace('data:image/svg+xml,', ''));
    } else if (imageData.startsWith('<svg')) {
      // 纯SVG内容
      svgContent = imageData;
    } else {
      throw new Error('不支持的SVG格式');
    }

    if (format === 'svg') {
      // SVG格式直接返回
      const svgBlob = new Blob([svgContent], {
        type: 'image/svg+xml'
      });
      return svgBlob;
    }

    // 对于PNG，需要移除背景以确保透明
    if (format === 'png') {
      console.log('🎨 PNGexporting：removing背景以确保透明');
      const originalLength = svgContent.length;
      
      // 移除背景渐变，保持透明
      svgContent = svgContent.replace(
        /<rect[^>]*fill="url\(#bgGradient\)"[^>]*\/>/g, 
        ''
      );
      
      // 也移除可能的solid背景
      svgContent = svgContent.replace(
        /<rect[^>]*width="100%"[^>]*height="100%"[^>]*fill="[^"]*"[^>]*\/>/g, 
        ''
      );
      
      console.log(`✂️ 背景removingcompleted: ${originalLength} -> ${svgContent.length} 字符`);
    }
    
    // 对于PNG/JPG，使用Canvas转换以获得更高质量
    return new Promise((resolve, reject) => {
      // 确保在浏览器环境中运行
      if (typeof window === 'undefined' || typeof document === 'undefined') {
        reject(new Error('导出功能需要在浏览器环境中运行'));
        return;
      }
      
      const img = new window.Image();
      img.onload = () => {
        const canvas = window.document.createElement('canvas');
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
        
        // 只有JPG格式才设置白色背景，PNG保持透明
        if (format === 'jpg') {
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, img.width, img.height);
        }
        // PNG格式保持透明背景，不进行额外处理
        
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
      
      // 使用处理后的SVG内容创建data URL
      try {
        console.log('🔄 re编码SVGcontent...');
        
        // 使用更现代的方式处理UTF-8编码
        const encoder = new TextEncoder();
        const svgBytes = encoder.encode(svgContent);
        let binaryString = '';
        for (let i = 0; i < svgBytes.length; i++) {
          binaryString += String.fromCharCode(svgBytes[i]);
        }
        const svgDataUrl = `data:image/svg+xml;base64,${window.btoa(binaryString)}`;
        
        console.log(`✅ SVGre编码success，length: ${svgDataUrl.length}`);
        img.src = svgDataUrl;
      } catch (encodingError) {
        console.error('❌ SVG编码failed:', encodingError);
        // 使用更简单的编码方式作为后备
        try {
          const fallbackDataUrl = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgContent)}`;
          console.log('🔄 使用next备编码方式');
          img.src = fallbackDataUrl;
        } catch (fallbackError) {
          console.error('❌ next备编码也failed:', fallbackError);
          reject(new Error('SVG内容编码失败'));
        }
      }
    });
  } catch (error) {
    console.error('imageexportingfailed:', error);
    throw error;
  }
}
