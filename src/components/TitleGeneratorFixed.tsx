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

  // 生成吸引眼球风格标题
  const generateEngagingTitle = (content: string, platform: string): string => {
    // 提取数字、产品、情感词
    const numbers = extractNumbersFromContent(content);
    const products = extractProductsFromContent(content);
    const emotions = extractEmotionsFromContent(content);
    const achievements = extractAchievementsFromContent(content);

    console.log('🎯 吸引眼球风格分析:', { numbers, products, emotions, achievements });

    // 构建标题模板
    if (numbers.length > 0 && products.length > 0) {
      return `${numbers[0]}的${products[0]}！${emotions[0] || '绝了'}`;
    }
    if (achievements.length > 0) {
      return `${achievements[0]}！${emotions[0] || '太棒了'}`;
    }
    if (products.length > 0) {
      return `${products[0]}${emotions[0] || '真的好用'}！必须安利`;
    }
    if (numbers.length > 0) {
      return `${numbers[0]}！${emotions[0] || '震惊了'}`;
    }

    // 回退到内容关键词
    const keywords = extractKeywordsFromContent(content);
    if (keywords.length > 0) {
      return `${keywords[0]}！${emotions[0] || '绝了'}`;
    }

    return getDefaultTitleByStyle('engaging', platform);
  };

  // 生成信息丰富风格标题
  const generateInformativeTitle = (content: string, platform: string): string => {
    // 提取关键点、方法、教程要素
    const methods = extractMethodsFromContent(content);
    const keyPoints = extractKeyPointsFromContent(content);
    const tutorials = extractTutorialElementsFromContent(content);
    const topics = extractTopicsFromContent(content);

    console.log('📚 信息丰富风格分析:', { methods, keyPoints, tutorials, topics });

    // 构建标题模板
    if (methods.length > 0) {
      return `${methods[0]}方法详解｜实用指南`;
    }
    if (tutorials.length > 0) {
      return `${tutorials[0]}教程｜完整攻略`;
    }
    if (keyPoints.length > 0) {
      return `${keyPoints[0]}｜干货分享`;
    }
    if (topics.length > 0) {
      return `${topics[0]}深度解析｜专业指南`;
    }

    // 回退到内容关键词
    const keywords = extractKeywordsFromContent(content);
    if (keywords.length > 0) {
      return `${keywords[0]}详细解析｜实用攻略`;
    }

    return getDefaultTitleByStyle('informative', platform);
  };

  // 生成情感共鸣风格标题
  const generateEmotionalTitle = (content: string, platform: string): string => {
    // 提取个人体验、感受、情感表达
    const experiences = extractPersonalExperiencesFromContent(content);
    const feelings = extractFeelingsFromContent(content);
    const emotions = extractEmotionsFromContent(content);
    const stories = extractStoriesFromContent(content);

    console.log('💝 情感共鸣风格分析:', { experiences, feelings, emotions, stories });

    // 构建标题模板
    if (experiences.length > 0 && feelings.length > 0) {
      return `${experiences[0]}，${feelings[0]}`;
    }
    if (stories.length > 0) {
      return `${stories[0]}｜真实分享`;
    }
    if (feelings.length > 0) {
      return `${feelings[0]}｜真心话`;
    }
    if (emotions.length > 0 && experiences.length > 0) {
      return `${experiences[0]}让我${emotions[0]}`;
    }

    // 回退到内容关键词
    const keywords = extractKeywordsFromContent(content);
    if (keywords.length > 0) {
      return `关于${keywords[0]}，想说的真心话`;
    }

    return getDefaultTitleByStyle('emotional', platform);
  };

  // === 内容提取函数组 ===

  // 提取数字信息
  const extractNumbersFromContent = (content: string): string[] => {
    const patterns = [
      /(\d+[%％])/g,                    // 百分比
      /(\d+[元块万千亿])/g,             // 价格
      /(\d+[天小时分钟周月年])/g,       // 时间
      /(\d+[个种款项次倍人家])/g,       // 数量
      /(\d+[分星级])/g,                 // 评分
      /(\d+[步招点条])/g,               // 步骤
    ];

    const numbers: string[] = [];
    patterns.forEach(pattern => {
      const matches = content.match(pattern) || [];
      numbers.push(...matches);
    });

    return [...new Set(numbers)].slice(0, 3);
  };

  // 提取产品信息
  const extractProductsFromContent = (content: string): string[] => {
    const patterns = [
      /([A-Za-z0-9\u4e00-\u9fa5]{2,8}[产品软件工具APP应用平台系统])/g,
      /([A-Za-z0-9\u4e00-\u9fa5]{2,8}[品牌牌子])/g,
      /([A-Za-z0-9\u4e00-\u9fa5]{2,8}[手机电脑相机])/g,
    ];

    const products: string[] = [];
    patterns.forEach(pattern => {
      const matches = content.match(pattern) || [];
      products.push(...matches.map(m => m.replace(/[产品软件工具APP应用平台系统品牌牌子手机电脑相机]$/, '')));
    });

    return [...new Set(products)].filter(p => p.length >= 2).slice(0, 3);
  };

  // 提取情感词
  const extractEmotionsFromContent = (content: string): string[] => {
    const emotionWords = [
      '震惊', '惊艳', '爱了', '绝了', '太棒', '完美', '神奇', '厉害',
      '感动', '治愈', '温暖', '开心', '兴奋', '满意', '不错', '赞',
      '超级', '非常', '特别', '真的', '确实', '居然', '竟然', '简直'
    ];

    return emotionWords.filter(word => content.includes(word)).slice(0, 2);
  };

  // 提取成就信息
  const extractAchievementsFromContent = (content: string): string[] => {
    const patterns = [
      /(成功[^，。！？]{1,10})/g,
      /(实现[^，。！？]{1,10})/g,
      /(达到[^，。！？]{1,10})/g,
      /(获得[^，。！？]{1,10})/g,
      /(提升[^，。！？]{1,10})/g,
    ];

    const achievements: string[] = [];
    patterns.forEach(pattern => {
      const matches = content.match(pattern) || [];
      achievements.push(...matches);
    });

    return [...new Set(achievements)].slice(0, 2);
  };

  // 提取关键词
  const extractKeywordsFromContent = (content: string): string[] => {
    // 提取2-4字的高频词汇
    const words = content.match(/[\u4e00-\u9fa5]{2,4}/g) || [];
    const wordCount: { [key: string]: number } = {};

    words.forEach(word => {
      if (word.length >= 2 && word.length <= 4) {
        wordCount[word] = (wordCount[word] || 0) + 1;
      }
    });

    return Object.entries(wordCount)
      .filter(([word, count]) => count >= 2)
      .sort((a, b) => b[1] - a[1])
      .map(([word]) => word)
      .slice(0, 3);
  };

  // 提取方法信息
  const extractMethodsFromContent = (content: string): string[] => {
    const patterns = [
      /([^，。！？]{2,8}[方法技巧秘诀窍门])/g,
      /([^，。！？]{2,8}[策略方案思路])/g,
      /(如何[^，。！？]{2,10})/g,
      /(怎么[^，。！？]{2,10})/g,
    ];

    const methods: string[] = [];
    patterns.forEach(pattern => {
      const matches = content.match(pattern) || [];
      methods.push(...matches.map(m => m.replace(/[方法技巧秘诀窍门策略方案思路]$/, '')));
    });

    return [...new Set(methods)].filter(m => m.length >= 2).slice(0, 2);
  };

  // 提取关键点
  const extractKeyPointsFromContent = (content: string): string[] => {
    const patterns = [
      /(重点是[^，。！？]{2,10})/g,
      /(关键在于[^，。！？]{2,10})/g,
      /(最重要的是[^，。！？]{2,10})/g,
      /(核心是[^，。！？]{2,10})/g,
    ];

    const keyPoints: string[] = [];
    patterns.forEach(pattern => {
      const matches = content.match(pattern) || [];
      keyPoints.push(...matches.map(m => m.replace(/^(重点是|关键在于|最重要的是|核心是)/, '')));
    });

    return [...new Set(keyPoints)].filter(p => p.length >= 2).slice(0, 2);
  };

  // 提取教程要素
  const extractTutorialElementsFromContent = (content: string): string[] => {
    const patterns = [
      /([^，。！？]{2,8}[教程攻略指南])/g,
      /([^，。！？]{2,8}[步骤流程过程])/g,
      /(第[一二三四五六七八九十\d]+[步阶段])/g,
    ];

    const tutorials: string[] = [];
    patterns.forEach(pattern => {
      const matches = content.match(pattern) || [];
      tutorials.push(...matches.map(m => m.replace(/[教程攻略指南步骤流程过程]$/, '')));
    });

    return [...new Set(tutorials)].filter(t => t.length >= 2).slice(0, 2);
  };

  // 提取主题
  const extractTopicsFromContent = (content: string): string[] => {
    const patterns = [
      /([^，。！？]{2,8}[话题主题问题])/g,
      /([^，。！？]{2,8}[领域行业方面])/g,
      /(关于[^，。！？]{2,10})/g,
    ];

    const topics: string[] = [];
    patterns.forEach(pattern => {
      const matches = content.match(pattern) || [];
      topics.push(...matches.map(m => m.replace(/[话题主题问题领域行业方面]$/, '').replace(/^关于/, '')));
    });

    return [...new Set(topics)].filter(t => t.length >= 2).slice(0, 2);
  };

  // 提取个人体验
  const extractPersonalExperiencesFromContent = (content: string): string[] => {
    const patterns = [
      /(我[^，。！？]{2,10})/g,
      /(自己[^，。！？]{2,10})/g,
      /(亲身[^，。！？]{2,10})/g,
      /(体验[^，。！？]{2,10})/g,
    ];

    const experiences: string[] = [];
    patterns.forEach(pattern => {
      const matches = content.match(pattern) || [];
      experiences.push(...matches);
    });

    return [...new Set(experiences)].slice(0, 2);
  };

  // 提取感受
  const extractFeelingsFromContent = (content: string): string[] => {
    const patterns = [
      /(感觉[^，。！？]{2,10})/g,
      /(觉得[^，。！？]{2,10})/g,
      /(感受[^，。！？]{2,10})/g,
      /(心情[^，。！？]{2,10})/g,
    ];

    const feelings: string[] = [];
    patterns.forEach(pattern => {
      const matches = content.match(pattern) || [];
      feelings.push(...matches);
    });

    return [...new Set(feelings)].slice(0, 2);
  };

  // 提取故事
  const extractStoriesFromContent = (content: string): string[] => {
    const patterns = [
      /(那天[^，。！？]{2,10})/g,
      /(有一次[^，。！？]{2,10})/g,
      /(记得[^，。！？]{2,10})/g,
      /(经历[^，。！？]{2,10})/g,
    ];

    const stories: string[] = [];
    patterns.forEach(pattern => {
      const matches = content.match(pattern) || [];
      stories.push(...matches);
    });

    return [...new Set(stories)].slice(0, 2);
  };

  // 调整标题长度
  const adjustTitleLength = (title: string, limit: number): string => {
    if (title.length <= limit) {
      return title;
    }

    // 智能截断，保留完整词汇
    let truncated = title.substring(0, limit - 1);
    const lastPunctuation = Math.max(
      truncated.lastIndexOf('｜'),
      truncated.lastIndexOf('！'),
      truncated.lastIndexOf('？'),
      truncated.lastIndexOf('。')
    );

    if (lastPunctuation > limit * 0.6) {
      return truncated.substring(0, lastPunctuation + 1);
    }

    return truncated + '…';
  };

  // 获取默认标题（按风格）
  const getDefaultTitleByStyle = (style: string, platform: string): string => {
    const defaultTitles = {
      'engaging': {
        'xiaohongshu': '神仙好物！必须安利',
        'weibo': '这个话题火了！',
        'zhihu': '这个问题值得思考',
        'douyin': '绝了！全网都在学',
        'default': '这个方法太实用了！'
      },
      'informative': {
        'xiaohongshu': '实用干货｜建议收藏',
        'weibo': '深度分析｜专业解读',
        'zhihu': '详细解析｜完整指南',
        'douyin': '超详细教程｜手把手',
        'default': '实用内容详解'
      },
      'emotional': {
        'xiaohongshu': '真心话｜想对你说',
        'weibo': '有些话不吐不快',
        'zhihu': '分享一个真实经历',
        'douyin': '看完这个我哭了',
        'default': '真实经验分享'
      }
    };

    return defaultTitles[style]?.[platform] || defaultTitles[style]?.['default'] || '内容分享';
  };

  // 手动选择标题
  const handleTitleSelect = (title: string) => {
    setSelectedTitle(title);
    onTitleChange?.(title);
    console.log('👆 用户选择标题:', title);
  };

  // 复制标题到剪贴板
  const handleCopyTitle = async (title: string) => {
    try {
      await navigator.clipboard.writeText(title);
      toast({
        title: "复制成功",
        description: "标题已复制到剪贴板",
      });
    } catch (error) {
      toast({
        title: "复制失败",
        description: "请手动复制标题",
        variant: "destructive"
      });
    }
  };

  // 开始编辑标题
  const handleStartEdit = () => {
    setEditingTitle(selectedTitle);
    setIsEditing(true);
  };

  // 保存编辑的标题
  const handleSaveEdit = () => {
    if (editingTitle.trim()) {
      setSelectedTitle(editingTitle.trim());
      onTitleChange?.(editingTitle.trim());
      setIsEditing(false);
      toast({
        title: "标题已更新",
        description: "自定义标题保存成功",
      });
    }
  };

  // 取消编辑
  const handleCancelEdit = () => {
    setEditingTitle('');
    setIsEditing(false);
  };

  // === React Hooks ===

  // 初始生成标题 - 基于版本内容或原始内容
  useEffect(() => {
    const sourceContent = getContentForTitleGeneration();

    if (sourceContent && sourceContent.trim().length >= 10 && !hasInitialized) {
      console.log('🎯 初始化标题生成:', {
        hasVersions: versions.length > 0,
        sourceLength: sourceContent.length,
        versionsInfo: versions.map(v => ({ id: v.id, style: v.style, length: v.content.length }))
      });
      generateTitles();
      setHasInitialized(true);
    }
  }, [content, versions, hasInitialized]); // 依赖content、versions和初始化状态

  // 当版本内容更新时，重新生成标题
  useEffect(() => {
    if (hasInitialized && versions.length > 0) {
      const sourceContent = getContentForTitleGeneration();
      if (sourceContent && sourceContent.trim().length >= 10) {
        console.log('🔄 版本内容更新，重新生成标题');
        generateTitles();
      }
    }
  }, [versions]); // 只依赖versions变化

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-yellow-500" />
          智能标题生成
          <Badge variant="outline" className="text-xs">
            {platformName} (限{titleLimit}字)
          </Badge>
          {versions.length > 0 && (
            <Badge variant="secondary" className="text-xs bg-green-100 text-green-700">
              基于版本A/B内容
            </Badge>
          )}
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* 生成按钮 */}
        <div className="flex items-center gap-2">
          <Button
            onClick={generateTitles}
            disabled={isGenerating}
            size="sm"
            className="flex items-center gap-2"
          >
            {isGenerating ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4" />
            )}
            {isGenerating ? '生成中...' : '重新生成'}
          </Button>

          {selectedTitle && (
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleCopyTitle(selectedTitle)}
                className="flex items-center gap-1"
              >
                <Copy className="h-3 w-3" />
                复制
              </Button>

              <Button
                size="sm"
                variant="outline"
                onClick={handleStartEdit}
                className="flex items-center gap-1"
              >
                <Edit2 className="h-3 w-3" />
                编辑
              </Button>
            </div>
          )}
        </div>

        {/* 加载状态 */}
        {isGenerating && (
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2 text-blue-500" />
              <p className="text-sm text-gray-600">正在基于内容生成标题...</p>
            </div>
          </div>
        )}

        {/* 当前选中的标题 */}
        {selectedTitle && !isGenerating && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-blue-700">当前标题</span>
              <Badge variant="outline" className="text-xs">
                {selectedTitle.length}/{titleLimit} 字符
              </Badge>
            </div>

            {isEditing ? (
              <div className="space-y-2">
                <Textarea
                  value={editingTitle}
                  onChange={(e) => setEditingTitle(e.target.value)}
                  placeholder="编辑标题..."
                  className="min-h-[60px] resize-none"
                  maxLength={titleLimit}
                />
                <div className="flex items-center gap-2">
                  <Button size="sm" onClick={handleSaveEdit} className="flex items-center gap-1">
                    <Check className="h-3 w-3" />
                    保存
                  </Button>
                  <Button size="sm" variant="outline" onClick={handleCancelEdit} className="flex items-center gap-1">
                    <X className="h-3 w-3" />
                    取消
                  </Button>
                </div>
              </div>
            ) : (
              <p className="text-blue-900 font-medium">{selectedTitle}</p>
            )}
          </div>
        )}

        {/* 标题选项列表 */}
        {!isGenerating && titles.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-700">标题选项</h4>
            <div className="space-y-2">
              {titles.map((title) => (
                <div
                  key={title.id}
                  className={`border rounded-lg p-3 cursor-pointer transition-colors ${
                    selectedTitle === title.title
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                  onClick={() => handleTitleSelect(title.title)}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm">{title.title}</span>
                    <Badge variant="outline" className="text-xs">
                      {title.style}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-xs text-gray-500">
                      {title.length}/{titleLimit} 字符
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 空状态 */}
        {!isGenerating && titles.length === 0 && content && (
          <div className="text-center py-4 text-gray-500">
            <p className="text-sm">暂无生成的标题</p>
            <Button size="sm" variant="outline" onClick={generateTitles} className="mt-2">
              开始生成标题
            </Button>
          </div>
        )}

        {/* 内容参考区域 */}
        {titles.length > 0 && versions.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-medium text-gray-600">📝 标题生成依据</span>
              <Badge variant="outline" className="text-xs">
                基于版本A/B内容
              </Badge>
            </div>
            <div className="space-y-2">
              {versions.map((version, index) => (
                <div key={version.id} className="bg-gray-50 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-medium text-gray-700">
                      {version.title} ({version.style === 'standard' ? '标准风格' : '创意风格'})
                    </span>
                    <span className="text-xs text-gray-500">
                      {version.content.length} 字符
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 line-clamp-2">
                    {version.content.substring(0, 120)}
                    {version.content.length > 120 ? '...' : ''}
                  </p>
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-2">
              💡 标题基于上述实际生成内容的关键词、主题和情感进行智能生成，确保标题与内容高度匹配
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TitleGenerator;
