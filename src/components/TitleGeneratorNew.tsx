import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Sparkles, RefreshCw, Copy, Edit2, Check, X } from "lucide-react";

// 平台标题长度限制
const PLATFORM_TITLE_LIMITS: { [key: string]: number } = {
  'xiaohongshu': 20,
  'weibo': 30,
  'zhihu': 50,
  'douyin': 25,
  'default': 30
};

interface ContentVersion {
  id: string;
  content: string;
  style: 'standard' | 'creative';
  title: string;
  charCount: number;
}

interface TitleGeneratorProps {
  content: string;
  versions?: ContentVersion[];
  platformId: string;
  platformName: string;
  onTitleChange?: (title: string) => void;
}

interface GeneratedTitle {
  id: string;
  title: string;
  length: number;
  style: string;
  relevanceScore?: number;
  sourceInfo?: string;
}

export const TitleGenerator: React.FC<TitleGeneratorProps> = ({
  content,
  versions = [],
  platformId,
  platformName,
  onTitleChange
}) => {
  const [titles, setTitles] = useState<GeneratedTitle[]>([]);
  const [selectedTitle, setSelectedTitle] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [hasInitialized, setHasInitialized] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingTitle, setEditingTitle] = useState('');
  const { toast } = useToast();

  const titleLimit = PLATFORM_TITLE_LIMITS[platformId] || 50;

  // 计算标题与内容的相关度
  const calculateTitleRelevance = (title: string, content: string): number => {
    if (!title || !content) return 0;

    let score = 0;
    let maxScore = 0;

    // 1. 关键词匹配 (权重: 0.4)
    const titleWords = title.match(/[\u4e00-\u9fa5a-zA-Z0-9]+/g) || [];
    const contentWords = content.match(/[\u4e00-\u9fa5a-zA-Z0-9]+/g) || [];
    
    if (titleWords.length > 0 && contentWords.length > 0) {
      const matchingWords = titleWords.filter(word => 
        word.length >= 2 && contentWords.some(cWord => cWord.includes(word) || word.includes(cWord))
      );
      score += (matchingWords.length / titleWords.length) * 0.4;
    }
    maxScore += 0.4;

    // 2. 主题一致性 (权重: 0.3)
    const titleThemes = extractThemeWords(title);
    const contentThemes = extractThemeWords(content);
    
    if (titleThemes.length > 0 && contentThemes.length > 0) {
      const themeMatches = titleThemes.filter(theme => 
        contentThemes.some(cTheme => cTheme.includes(theme) || theme.includes(cTheme))
      );
      score += (themeMatches.length / titleThemes.length) * 0.3;
    }
    maxScore += 0.3;

    // 3. 情感词匹配 (权重: 0.2)
    const titleEmotions = extractEmotionWords(title);
    const contentEmotions = extractEmotionWords(content);
    
    if (titleEmotions.length > 0) {
      const emotionMatches = titleEmotions.filter(emotion => 
        contentEmotions.includes(emotion)
      );
      score += (emotionMatches.length / titleEmotions.length) * 0.2;
    }
    maxScore += 0.2;

    // 4. 数字信息匹配 (权重: 0.1)
    const titleNumbers = title.match(/\d+/g) || [];
    const contentNumbers = content.match(/\d+/g) || [];
    
    if (titleNumbers.length > 0) {
      const numberMatches = titleNumbers.filter(num => contentNumbers.includes(num));
      score += (numberMatches.length / titleNumbers.length) * 0.1;
    }
    maxScore += 0.1;

    return maxScore > 0 ? Math.min(score / maxScore, 1) : 0;
  };

  // 提取主题词
  const extractThemeWords = (text: string): string[] => {
    const themePatterns = [
      /[\u4e00-\u9fa5]{2,6}(方法|技巧|攻略|指南|教程)/g,
      /[\u4e00-\u9fa5]{2,6}(测评|评测|体验|使用)/g,
      /[\u4e00-\u9fa5]{2,6}(分享|推荐|安利)/g,
      /[\u4e00-\u9fa5]{2,6}(问题|困扰|疑问)/g
    ];
    
    const themes: string[] = [];
    themePatterns.forEach(pattern => {
      const matches = text.match(pattern) || [];
      themes.push(...matches);
    });
    
    return [...new Set(themes)];
  };

  // 提取情感词
  const extractEmotionWords = (text: string): string[] => {
    const emotionWords = [
      '震惊', '惊艳', '爱了', '绝了', '太棒', '完美', '神奇',
      '感动', '治愈', '温暖', '开心', '兴奋', '满意', '不错',
      '超级', '非常', '特别', '真的', '确实', '居然', '竟然'
    ];
    
    return emotionWords.filter(word => text.includes(word));
  };

  // 获取用于标题生成的内容源
  const getContentForTitleGeneration = (): string => {
    // 优先使用版本A和版本B的内容
    if (versions && versions.length > 0) {
      // 合并版本A和版本B的内容，用于更全面的标题生成
      const combinedContent = versions.map(v => v.content).join('\n\n');
      console.log('🎯 使用版本内容生成标题:', {
        versionsCount: versions.length,
        combinedLength: combinedContent.length,
        preview: combinedContent.substring(0, 100) + '...'
      });
      return combinedContent;
    }
    
    // 回退到原始内容
    console.log('⚠️ 回退到原始内容生成标题:', {
      contentLength: content.length,
      preview: content.substring(0, 100) + '...'
    });
    return content;
  };

  // 生成标题的函数
  const generateTitles = async () => {
    const sourceContent = getContentForTitleGeneration();
    
    if (!sourceContent || sourceContent.trim().length < 10) {
      toast({
        title: "内容太短",
        description: "请提供更多内容以生成标题",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    
    try {
      // 模拟AI生成标题
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const mockTitles: GeneratedTitle[] = [
        {
          id: '1',
          title: generateMockTitle(sourceContent, platformId, 'engaging'),
          length: 0,
          style: '吸引眼球',
          sourceInfo: versions.length > 0 ? '基于版本A/B内容' : '基于原始内容'
        },
        {
          id: '2', 
          title: generateMockTitle(sourceContent, platformId, 'informative'),
          length: 0,
          style: '信息丰富',
          sourceInfo: versions.length > 0 ? '基于版本A/B内容' : '基于原始内容'
        },
        {
          id: '3',
          title: generateMockTitle(sourceContent, platformId, 'emotional'),
          length: 0,
          style: '情感共鸣',
          sourceInfo: versions.length > 0 ? '基于版本A/B内容' : '基于原始内容'
        }
      ].map(title => {
        const relevanceScore = calculateTitleRelevance(title.title, sourceContent);
        return {
          ...title,
          length: title.title.length,
          relevanceScore
        };
      });

      setTitles(mockTitles);
      if (mockTitles.length > 0) {
        setSelectedTitle(mockTitles[0].title);
        onTitleChange?.(mockTitles[0].title);
      }

      toast({
        title: "标题生成成功",
        description: `基于实际生成内容为${platformName}生成了${mockTitles.length}个标题选项`,
      });
    } catch (error) {
      toast({
        title: "生成失败",
        description: "标题生成失败，请重试",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  // 智能标题生成逻辑 - 基于版本A/B内容生成准确标题
  const generateMockTitle = (content: string, platform: string, style: string): string => {
    console.log('🎯 开始标题生成流程:', {
      contentLength: content.length,
      platform,
      style,
      preview: content.substring(0, 100) + '...'
    });

    try {
      // 输入验证
      if (!content || content.trim().length < 10) {
        console.warn('⚠️ 内容过短，使用默认标题');
        return getDefaultTitleByStyle(style, platform);
      }

      // 清理内容，移除配图建议和话题标签
      const cleanContent = cleanContentForTitleGeneration(content);
      console.log('🧹 内容清理完成:', {
        原始长度: content.length,
        清理后长度: cleanContent.length,
        清理后预览: cleanContent.substring(0, 80) + '...'
      });

      // 根据风格生成标题
      let title = '';
      switch (style) {
        case 'engaging':
          title = generateEngagingTitle(cleanContent, platform);
          break;
        case 'informative':
          title = generateInformativeTitle(cleanContent, platform);
          break;
        case 'emotional':
          title = generateEmotionalTitle(cleanContent, platform);
          break;
        default:
          title = generateEngagingTitle(cleanContent, platform);
      }

      // 调整标题长度以符合平台限制
      const finalTitle = adjustTitleLength(title, titleLimit);
      console.log('✅ 最终标题生成:', { 
        风格: style, 
        标题: finalTitle, 
        长度: finalTitle.length, 
        限制: titleLimit 
      });

      return finalTitle;

    } catch (error) {
      console.error('❌ 标题生成失败:', error);
      return getDefaultTitleByStyle(style, platform);
    }
  };

  // 清理内容用于标题生成
  const cleanContentForTitleGeneration = (content: string): string => {
    return content
      // 移除配图建议
      .replace(/【配图建议】[\s\S]*?(?=\n\n|\n$|$)/g, '')
      .replace(/配图建议：[\s\S]*?(?=\n\n|\n$|$)/g, '')
      .replace(/\[配图[\s\S]*?\]/g, '')
      // 移除话题标签
      .replace(/#[^#\s]+#/g, '')
      .replace(/@[^\s@]+/g, '')
      // 移除多余的换行和空格
      .replace(/\n{3,}/g, '\n\n')
      .replace(/\s+/g, ' ')
      .trim();
  };

  return <div>TitleGenerator Component - To be continued...</div>;
};

export default TitleGenerator;
