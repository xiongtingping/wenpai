import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { 
  RefreshCw, 
  Copy, 
  Edit, 
  Check, 
  X,
  Sparkles 
} from "lucide-react";

interface ContentVersion {
  id: string;
  content: string;
  style: 'standard' | 'creative';
  title: string;
  charCount: number;
}

interface TitleGeneratorProps {
  content: string;
  versions?: ContentVersion[]; // 新增：版本A和版本B的内容
  platformId: string;
  platformName: string;
  onTitleChange?: (title: string) => void;
}

interface GeneratedTitle {
  id: string;
  title: string;
  length: number;
  style: string;
  relevanceScore?: number; // 新增：相关度评分 (0-1)
  sourceInfo?: string; // 新增：来源信息
}

// 平台标题字符限制
const PLATFORM_TITLE_LIMITS: Record<string, number> = {
  'xiaohongshu': 20,
  'weibo': 30,
  'zhihu': 50,
  'douyin': 25,
  'wechat': 64,
  'bilibili': 80,
  'twitter': 280,
  'video': 30,
  'baijia': 50,
  'kuaishou': 25,
  'wangyi': 40,
  'toutiao': 30
};

export const TitleGenerator: React.FC<TitleGeneratorProps> = ({
  content,
  versions = [],
  platformId,
  platformName,
  onTitleChange
}) => {
  const { toast } = useToast();
  const [titles, setTitles] = useState<GeneratedTitle[]>([]);
  const [selectedTitle, setSelectedTitle] = useState<string>('');
  const [isEditing, setIsEditing] = useState(false);
  const [editingTitle, setEditingTitle] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [hasInitialized, setHasInitialized] = useState(false); // 新增：跟踪是否已初始化

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

  // 智能标题生成逻辑 - 从生成内容中提取标题 (增强版本)
  const generateMockTitle = (content: string, platform: string, style: string): string => {
    console.log('🎯 开始标题生成流程:', {
      contentLength: content.length,
      platform,
      style,
      preview: content.substring(0, 50) + '...'
    });

    try {
      // 输入验证
      if (!content || content.trim().length < 5) {
        console.warn('⚠️ 内容过短，使用默认标题');
        return getDefaultTitleByStyle(style, platform);
      }

      // 1. 从内容中提取核心信息
      const coreInfo = extractCoreInformation(content);
      console.log('📊 信息提取完成:', {
        numbers: coreInfo.numbers.length,
        keyPoints: coreInfo.keyPoints.length,
        products: coreInfo.products.length,
        contentType: coreInfo.contentType,
        hasValidInfo: coreInfo.hasNumbers || coreInfo.hasProducts || coreInfo.keyPoints.length > 0
      });

      // 2. 根据平台特色生成标题
      const rawTitle = generatePlatformSpecificTitle(coreInfo, platform, style);
      console.log('🏷️ 原始标题生成:', rawTitle);

      // 3. 根据平台限制调整长度
      const finalTitle = adjustTitleForPlatform(rawTitle, titleLimit);
      console.log('✅ 最终标题:', { title: finalTitle, length: finalTitle.length, limit: titleLimit });

      return finalTitle;

    } catch (error) {
      console.error('❌ 标题生成失败:', error);
      return getDefaultTitleByStyle(style, platform);
    }
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

  // 从内容中提取核心信息 - 增强关联性版本
  const extractCoreInformation = (content: string) => {
    // 温和清理内容，保留更多有用信息
    const cleanContent = content
      .replace(/[#@\*\[\]]/g, '')  // 只移除特殊符号
      .replace(/\s+/g, ' ')        // 规范化空格
      .trim();

    console.log('🔍 开始信息提取，内容长度:', cleanContent.length);
    console.log('📝 内容预览:', cleanContent.substring(0, 100) + '...');

    // 提取关键数据 - 严格验证内容关联性
    const numbers = extractNumbers(cleanContent);
    const keyPoints = extractKeyPoints(cleanContent);
    const opinions = extractOpinions(cleanContent);
    const products = extractProducts(cleanContent);
    const actions = extractActions(cleanContent);
    const benefits = extractBenefits(cleanContent);
    const topics = extractTopics(cleanContent);
    const emotions = extractVerifiedEmotions(cleanContent);    // 修改：验证情感词
    const keywords = extractKeywords(cleanContent);
    const contentType = analyzeContentTypeAccurate(cleanContent);  // 修改：更准确的类型分析
    const mainTheme = extractMainTheme(cleanContent);          // 新增：主题提取
    const actualSentiments = extractActualSentiments(cleanContent); // 新增：实际情感分析

    // 内容质量和关联性评估
    const contentQuality = assessContentQuality(cleanContent, {
      numbers, keyPoints, opinions, products, actions, benefits, topics, emotions
    });

    const coreInfo = {
      // 原有字段
      numbers,
      keyPoints,
      opinions,
      products,
      actions,
      benefits,
      topics,
      emotions,
      keywords,
      contentLength: cleanContent.length,
      firstSentence: cleanContent.split(/[。！？]/)[0] || '',
      lastSentence: cleanContent.split(/[。！？]/).filter(s => s.trim()).pop() || '',

      // 新增：增强的内容分析
      contentType,
      mainTheme,
      actualSentiments,
      contentQuality,

      // 内容特征标记
      hasNumbers: numbers.length > 0,
      hasProducts: products.length > 0,
      hasOpinions: opinions.length > 0,
      hasStrongEmotions: emotions.filter(e => e.intensity > 0.7).length > 0,
      isPersonalExperience: detectPersonalExperience(cleanContent),
      isTutorial: detectTutorialContent(cleanContent),
      isReview: detectReviewContent(cleanContent),

      // 原始内容引用（用于验证）
      originalContent: cleanContent
    };

    console.log('📊 提取结果:', {
      numbers: numbers.length,
      keyPoints: keyPoints.length,
      products: products.length,
      contentType: coreInfo.contentType,
      mainTheme: coreInfo.mainTheme,
      quality: coreInfo.contentQuality.score
    });

    return coreInfo;
  };

  // 提取数字信息 - 增强版本
  const extractNumbers = (content: string): string[] => {
    const numberPatterns = [
      /(\d+)([%％])/g,                    // 百分比
      /(\d+)(元|块|万|千|亿)/g,           // 价格
      /(\d+)(天|小时|分钟|秒|周|月|年)/g,  // 时间
      /(\d+)(个|种|款|项|次|倍|人|家)/g,   // 数量
      /(\d+)(分|星|级)/g,                 // 评分
      /(\d+)(步|招|点|条)/g,              // 步骤
      /第(\d+)/g,                         // 序号
      /(\d+\.?\d*)(米|厘米|公里|斤|公斤)/g // 单位
    ];

    const numbers: string[] = [];
    numberPatterns.forEach(pattern => {
      const matches = content.match(pattern);
      if (matches) {
        numbers.push(...matches);
      }
    });

    // 去重并限制数量
    return [...new Set(numbers)].slice(0, 4);
  };

  // 提取关键观点 - 增强版本
  const extractKeyPoints = (content: string): string[] => {
    const pointPatterns = [
      // 重要性表达
      /(最重要的是|重点是|关键在于|核心是|主要是)(.{1,25})/g,
      // 特殊性表达
      /(特别是|尤其是|特别注意|需要注意)(.{1,20})/g,
      // 建议性表达
      /(建议|推荐|最好|应该|必须)(.{1,20})/g,
      // 问题解决
      /(解决|改善|提升|优化)(.{1,20})/g,
      // 经验总结
      /(经验|心得|技巧|方法|秘诀)(.{1,20})/g
    ];

    const points: string[] = [];
    pointPatterns.forEach(pattern => {
      const matches = [...content.matchAll(pattern)];
      matches.forEach(match => {
        if (match[2]) {
          const point = match[2].replace(/[，。！？；：]/g, '').trim();
          if (point.length >= 2) {
            points.push(point);
          }
        }
      });
    });

    // 如果没有匹配到，尝试提取句子中的名词短语
    if (points.length === 0) {
      const sentences = content.split(/[。！？]/);
      sentences.forEach(sentence => {
        if (sentence.length > 10 && sentence.length < 30) {
          // 提取可能的关键短语
          const phrases = sentence.match(/[一-龯]{2,8}/g);
          if (phrases) {
            points.push(...phrases.slice(0, 2));
          }
        }
      });
    }

    return [...new Set(points)].slice(0, 3);
  };

  // 提取观点和评价
  const extractOpinions = (content: string): string[] => {
    const opinionPatterns = [
      /(非常|很|特别|超级)(好|棒|赞|不错|推荐|值得)/g,
      /(不|没有|不太)(好|行|推荐|建议)/g,
      /(建议|推荐|值得|适合)(.{1,15})/g,
      /(避免|不要|注意)(.{1,15})/g
    ];

    const opinions: string[] = [];
    opinionPatterns.forEach(pattern => {
      const matches = content.match(pattern);
      if (matches) {
        opinions.push(...matches);
      }
    });

    return [...new Set(opinions)].slice(0, 2);
  };

  // 提取产品/品牌信息
  const extractProducts = (content: string): string[] => {
    const productPatterns = [
      /([A-Za-z0-9]{2,})(手机|电脑|相机|耳机|音响)/g,
      /(iPhone|华为|小米|OPPO|vivo|三星)/g,
      /([一-龯]{2,6})(品牌|产品|系列)/g,
      /([一-龯]{2,8})(APP|软件|工具|平台)/g
    ];

    const products: string[] = [];
    productPatterns.forEach(pattern => {
      const matches = content.match(pattern);
      if (matches) {
        products.push(...matches);
      }
    });

    return [...new Set(products)].slice(0, 2);
  };

  // 提取行动词汇
  const extractActions = (content: string): string[] => {
    const actionPatterns = [
      /(购买|选择|使用|体验|尝试|测试)(.{1,10})/g,
      /(学会|掌握|了解|知道)(.{1,10})/g,
      /(提升|改善|优化|增强)(.{1,10})/g,
      /(避免|防止|注意)(.{1,10})/g
    ];

    const actions: string[] = [];
    actionPatterns.forEach(pattern => {
      const matches = [...content.matchAll(pattern)];
      matches.forEach(match => {
        if (match[0]) {
          actions.push(match[0].replace(/[，。！？]/g, '').trim());
        }
      });
    });

    return [...new Set(actions)].slice(0, 2);
  };

  // 提取收益/好处
  const extractBenefits = (content: string): string[] => {
    const benefitPatterns = [
      /(节省|省下|减少)(.{1,10})/g,
      /(提高|增加|提升)(.{1,10})/g,
      /(获得|得到|收获)(.{1,10})/g,
      /(解决|改善|优化)(.{1,10})/g
    ];

    const benefits: string[] = [];
    benefitPatterns.forEach(pattern => {
      const matches = [...content.matchAll(pattern)];
      matches.forEach(match => {
        if (match[0]) {
          benefits.push(match[0].replace(/[，。！？]/g, '').trim());
        }
      });
    });

    return [...new Set(benefits)].slice(0, 2);
  };

  // 新增：主题提取
  const extractTopics = (content: string): string[] => {
    const topicPatterns = [
      /关于(.{2,15})/g,
      /(.{2,10})(教程|攻略|指南|方法|技巧)/g,
      /(.{2,10})(测评|评测|体验|使用)/g,
      /(.{2,10})(分享|推荐|安利)/g,
      /(.{2,10})(问题|困扰|疑问)/g
    ];

    const topics: string[] = [];
    topicPatterns.forEach(pattern => {
      const matches = [...content.matchAll(pattern)];
      matches.forEach(match => {
        if (match[1]) {
          topics.push(match[1].trim());
        }
      });
    });

    return [...new Set(topics)].slice(0, 3);
  };

  // 新增：验证情感词提取 - 确保情感词真实存在于内容中
  const extractVerifiedEmotions = (content: string): Array<{word: string, intensity: number, context: string}> => {
    const emotionPatterns = [
      // 强烈情感 (intensity: 0.8-1.0)
      { words: ['震惊', '惊艳', '爱了', '绝了', '太棒了', '完美', '神奇'], intensity: 0.9 },
      { words: ['感动', '治愈', '温暖', '开心', '兴奋'], intensity: 0.8 },

      // 中等情感 (intensity: 0.5-0.7)
      { words: ['满意', '不错', '还行', '可以', '挺好'], intensity: 0.6 },
      { words: ['担心', '焦虑', '失望', '后悔'], intensity: 0.7 },

      // 轻微情感 (intensity: 0.3-0.5)
      { words: ['超级', '非常', '特别', '真的', '确实'], intensity: 0.4 },
      { words: ['居然', '竟然', '没想到', '意外'], intensity: 0.5 }
    ];

    const emotions: Array<{word: string, intensity: number, context: string}> = [];

    emotionPatterns.forEach(pattern => {
      pattern.words.forEach(word => {
        const regex = new RegExp(`(.{0,10}${word}.{0,10})`, 'g');
        const matches = content.match(regex);
        if (matches) {
          matches.forEach(match => {
            emotions.push({
              word,
              intensity: pattern.intensity,
              context: match.trim()
            });
          });
        }
      });
    });

    // 去重并按强度排序
    const uniqueEmotions = emotions
      .filter((emotion, index, self) =>
        index === self.findIndex(e => e.word === emotion.word)
      )
      .sort((a, b) => b.intensity - a.intensity)
      .slice(0, 3);

    console.log('😊 验证情感词:', uniqueEmotions);
    return uniqueEmotions;
  };

  // 新增：内容质量评估
  const assessContentQuality = (content: string, extractedInfo: any): {score: number, issues: string[]} => {
    const issues: string[] = [];
    let score = 1.0;

    // 检查内容长度
    if (content.length < 50) {
      issues.push('内容过短');
      score -= 0.3;
    }

    // 检查信息提取质量
    const totalExtracted = extractedInfo.numbers.length + extractedInfo.keyPoints.length +
                          extractedInfo.products.length + extractedInfo.topics.length;

    if (totalExtracted === 0) {
      issues.push('缺乏关键信息');
      score -= 0.4;
    }

    // 检查内容结构
    const sentences = content.split(/[。！？]/).filter(s => s.trim().length > 5);
    if (sentences.length < 2) {
      issues.push('内容结构简单');
      score -= 0.2;
    }

    return {
      score: Math.max(0, score),
      issues
    };
  };

  // 新增：检测个人经验内容
  const detectPersonalExperience = (content: string): boolean => {
    const personalIndicators = ['我', '我的', '自己', '亲身', '个人', '经历', '体验', '感受'];
    return personalIndicators.some(indicator => content.includes(indicator));
  };

  // 新增：检测教程内容
  const detectTutorialContent = (content: string): boolean => {
    const tutorialIndicators = ['步骤', '方法', '如何', '教程', '操作', '设置', '第一', '第二', '首先', '然后'];
    const count = tutorialIndicators.reduce((acc, indicator) => {
      return acc + (content.includes(indicator) ? 1 : 0);
    }, 0);
    return count >= 2; // 至少包含2个教程指示词
  };

  // 新增：检测评测内容
  const detectReviewContent = (content: string): boolean => {
    const reviewIndicators = ['测评', '评测', '体验', '使用', '效果', '优缺点', '对比', '实测'];
    const count = reviewIndicators.reduce((acc, indicator) => {
      return acc + (content.includes(indicator) ? 1 : 0);
    }, 0);
    return count >= 2; // 至少包含2个评测指示词
  };

  // 新增：关键词提取
  const extractKeywords = (content: string): string[] => {
    // 简单的中文关键词提取
    const words = content.match(/[一-龯]{2,6}/g) || [];
    const wordCount: Record<string, number> = {};

    words.forEach(word => {
      if (word.length >= 2 && word.length <= 6) {
        wordCount[word] = (wordCount[word] || 0) + 1;
      }
    });

    // 按频率排序，取前5个
    const sortedWords = Object.entries(wordCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([word]) => word);

    return sortedWords;
  };

  // 新增：更准确的内容类型分析
  const analyzeContentTypeAccurate = (content: string): string => {
    const typeIndicators = {
      tutorial: [
        '教程', '步骤', '方法', '如何', '怎么', '教你', '学会', '掌握',
        '第一步', '第二步', '首先', '然后', '最后', '操作', '设置'
      ],
      review: [
        '测评', '体验', '使用', '试用', '评测', '对比', '优缺点',
        '效果', '感受', '实测', '真实', '亲测'
      ],
      sharing: [
        '分享', '经验', '心得', '感悟', '收获', '总结', '回顾',
        '记录', '日记', '故事', '经历'
      ],
      recommendation: [
        '推荐', '安利', '种草', '必买', '值得', '好用', '不错',
        '建议', '选择', '购买'
      ],
      'problem-solving': [
        '问题', '解决', '困扰', '疑问', '答案', '方案', '办法',
        '处理', '应对', '克服'
      ],
      news: [
        '消息', '新闻', '发布', '宣布', '通知', '公告', '更新',
        '最新', '刚刚', '今天'
      ]
    };

    const scores: Record<string, number> = {};

    Object.entries(typeIndicators).forEach(([type, indicators]) => {
      scores[type] = indicators.reduce((score, indicator) => {
        const regex = new RegExp(indicator, 'gi');
        const matches = content.match(regex);
        return score + (matches ? matches.length : 0);
      }, 0);
    });

    // 找到得分最高的类型
    const maxScore = Math.max(...Object.values(scores));
    const detectedType = Object.entries(scores).find(([, score]) => score === maxScore)?.[0];

    console.log('🔍 内容类型分析:', scores, '→', detectedType);
    return maxScore > 0 ? detectedType || 'general' : 'general';
  };

  // 新增：主题提取
  const extractMainTheme = (content: string): string => {
    // 提取最频繁出现的主题词
    const sentences = content.split(/[。！？]/);
    const themeWords: Record<string, number> = {};

    sentences.forEach(sentence => {
      const words = sentence.match(/[一-龯]{2,8}/g) || [];
      words.forEach(word => {
        if (word.length >= 2 && word.length <= 8) {
          themeWords[word] = (themeWords[word] || 0) + 1;
        }
      });
    });

    // 排除常见停用词
    const stopWords = ['这个', '那个', '可以', '就是', '但是', '因为', '所以', '如果', '虽然', '然后'];
    Object.keys(themeWords).forEach(word => {
      if (stopWords.includes(word)) {
        delete themeWords[word];
      }
    });

    const sortedThemes = Object.entries(themeWords)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 1);

    return sortedThemes.length > 0 ? sortedThemes[0][0] : '';
  };

  // 新增：实际情感分析
  const extractActualSentiments = (content: string): {positive: number, negative: number, neutral: number} => {
    const positiveWords = ['好', '棒', '赞', '爱', '喜欢', '满意', '开心', '兴奋', '完美', '优秀'];
    const negativeWords = ['差', '坏', '烂', '讨厌', '失望', '糟糕', '问题', '困难', '麻烦', '后悔'];

    let positive = 0, negative = 0;

    positiveWords.forEach(word => {
      const matches = content.match(new RegExp(word, 'g'));
      positive += matches ? matches.length : 0;
    });

    negativeWords.forEach(word => {
      const matches = content.match(new RegExp(word, 'g'));
      negative += matches ? matches.length : 0;
    });

    const total = positive + negative;
    const neutral = total === 0 ? 1 : 0;

    return {
      positive: total > 0 ? positive / total : 0,
      negative: total > 0 ? negative / total : 0,
      neutral
    };
  };

  // 根据平台特色和风格生成标题 - 关联性验证版本
  const generatePlatformSpecificTitle = (coreInfo: any, platform: string, style: string): string => {
    console.log('🎨 生成标题 - 平台:', platform, '风格:', style);
    console.log('📊 内容信息:', {
      contentType: coreInfo.contentType,
      mainTheme: coreInfo.mainTheme,
      quality: coreInfo.contentQuality.score,
      hasValidEmotions: coreInfo.emotions.length > 0
    });

    // 根据风格选择不同的生成策略
    let title = '';
    switch (style) {
      case 'engaging':
        title = generateEngagingStyleTitleVerified(coreInfo, platform);
        break;
      case 'informative':
        title = generateInformativeStyleTitleVerified(coreInfo, platform);
        break;
      case 'emotional':
        title = generateEmotionalStyleTitleVerified(coreInfo, platform);
        break;
      default:
        title = generateInformativeStyleTitleVerified(coreInfo, platform);
    }

    // 标题与内容关联性验证
    const relevanceScore = validateTitleRelevance(title, coreInfo);
    console.log('🔍 标题关联性评分:', relevanceScore);

    // 如果关联性太低，使用基于内容的回退
    if (relevanceScore < 0.6 || title.length < 5 || isGenericTitle(title)) {
      console.log('⚠️ 标题关联性不足，启用内容驱动回退');
      title = generateContentDrivenTitle(coreInfo, platform, style);
    }

    console.log('✅ 最终标题:', title);
    return title;
  };

  // 新增：标题与内容关联性验证
  const validateTitleRelevance = (title: string, coreInfo: any): number => {
    let score = 0;
    let maxScore = 0;

    // 检查主题词匹配
    if (coreInfo.mainTheme && title.includes(coreInfo.mainTheme)) {
      score += 0.3;
    }
    maxScore += 0.3;

    // 检查关键词匹配
    const titleKeywords = coreInfo.keywords.filter((keyword: string) => title.includes(keyword));
    if (titleKeywords.length > 0) {
      score += 0.2 * Math.min(titleKeywords.length / 2, 1);
    }
    maxScore += 0.2;

    // 检查内容类型匹配
    const typeKeywords = {
      tutorial: ['教程', '方法', '步骤', '如何', '学会'],
      review: ['测评', '体验', '评测', '使用', '效果'],
      sharing: ['分享', '经验', '心得', '故事'],
      recommendation: ['推荐', '安利', '种草', '值得']
    };

    const expectedKeywords = typeKeywords[coreInfo.contentType as keyof typeof typeKeywords] || [];
    const hasTypeMatch = expectedKeywords.some(keyword => title.includes(keyword));
    if (hasTypeMatch) {
      score += 0.2;
    }
    maxScore += 0.2;

    // 检查情感词匹配（只使用内容中实际存在的情感词）
    const titleEmotions = coreInfo.emotions.filter((emotion: any) => title.includes(emotion.word));
    if (titleEmotions.length > 0) {
      score += 0.15;
    }
    maxScore += 0.15;

    // 检查产品/主体匹配
    const titleProducts = coreInfo.products.filter((product: string) => title.includes(product));
    if (titleProducts.length > 0) {
      score += 0.15;
    }
    maxScore += 0.15;

    return maxScore > 0 ? score / maxScore : 0;
  };

  // 新增：基于内容驱动的标题生成
  const generateContentDrivenTitle = (coreInfo: any, platform: string, style: string): string => {
    const { contentType, mainTheme, emotions, products, keyPoints, actualSentiments } = coreInfo;

    console.log('🎯 内容驱动标题生成:', { contentType, mainTheme, emotionCount: emotions.length });

    // 基于内容类型的核心模板
    const coreTemplates = {
      tutorial: {
        engaging: mainTheme ? `${mainTheme}教程！学会就是赚到` : '实用教程！必须收藏',
        informative: mainTheme ? `${mainTheme}详细教程｜步骤解析` : '详细教程｜完整指南',
        emotional: mainTheme ? `学会${mainTheme}的那一刻` : '学会的那一刻｜收获满满'
      },
      review: {
        engaging: products.length > 0 ? `${products[0]}真实体验！` : mainTheme ? `${mainTheme}真实体验！` : '真实体验分享！',
        informative: products.length > 0 ? `${products[0]}详细评测｜真实反馈` : '详细评测｜客观分析',
        emotional: products.length > 0 ? `${products[0]}使用感受分享` : '真实使用感受分享'
      },
      sharing: {
        engaging: mainTheme ? `${mainTheme}经验分享！` : '实用经验分享！',
        informative: mainTheme ? `${mainTheme}经验总结｜干货整理` : '经验总结｜实用干货',
        emotional: mainTheme ? `关于${mainTheme}的思考` : '真实经验与感悟'
      },
      recommendation: {
        engaging: products.length > 0 ? `${products[0]}强烈推荐！` : mainTheme ? `${mainTheme}值得推荐！` : '值得推荐的好物！',
        informative: products.length > 0 ? `${products[0]}推荐理由分析` : '推荐清单｜选择指南',
        emotional: products.length > 0 ? `${products[0]}改变了我的生活` : '这些推荐改变了我'
      }
    };

    // 获取基础模板
    const baseTemplate = coreTemplates[contentType as keyof typeof coreTemplates]?.[style] ||
                        coreTemplates.sharing[style];

    // 根据平台调整风格
    let finalTitle = baseTemplate;

    if (platform === 'xiaohongshu') {
      if (style === 'engaging' && emotions.length > 0) {
        finalTitle = emotions[0].word + '！' + (mainTheme || '必须分享');
      }
    } else if (platform === 'zhihu') {
      if (style === 'engaging') {
        finalTitle = mainTheme ? `如何看待${mainTheme}？` : '如何看待这个问题？';
      }
    } else if (platform === 'douyin') {
      if (style === 'engaging') {
        finalTitle = mainTheme ? `${mainTheme}绝了！` : '这个方法绝了！';
      }
    }

    return finalTitle;
  };

  // 判断是否为通用标题
  const isGenericTitle = (title: string): boolean => {
    const genericPhrases = [
      '实用内容', '内容分享', '经验分享', '真实经验', '这个方法', '这个话题'
    ];
    return genericPhrases.some(phrase => title.includes(phrase));
  };

  // 增强回退标题生成
  const generateEnhancedFallbackTitle = (coreInfo: any, platform: string, style: string): string => {
    const { contentLength, firstSentence, keywords, contentType } = coreInfo;

    // 基于内容长度的回退策略
    if (contentLength > 500) {
      const lengthBasedTitles = {
        'engaging': ['深度好文！必须分享', '长文预警！但值得一看', '干货满满！建议收藏'],
        'informative': ['详细解析｜完整指南', '深度分析｜专业解读', '全面总结｜知识点整理'],
        'emotional': ['用心写的文字｜真诚分享', '这些话想对你说｜深度思考', '走心分享｜值得细读']
      };
      const titles = lengthBasedTitles[style] || lengthBasedTitles['informative'];
      return titles[Math.floor(Math.random() * titles.length)];
    }

    // 基于关键词的回退策略
    if (keywords.length > 0) {
      const keywordBasedTitles = {
        'engaging': [`${keywords[0]}绝了！必须安利`, `${keywords[0]}太香了！速来`, `${keywords[0]}火了！全网都在学`],
        'informative': [`${keywords[0]}详细解析`, `${keywords[0]}完整指南`, `${keywords[0]}专业解读`],
        'emotional': [`${keywords[0]}的真实感受`, `${keywords[0]}让我想起`, `关于${keywords[0]}的思考`]
      };
      const titles = keywordBasedTitles[style] || keywordBasedTitles['informative'];
      return titles[Math.floor(Math.random() * titles.length)];
    }

    // 基于内容类型的回退策略
    const typeBasedTitles = {
      'tutorial': {
        'engaging': '神仙教程！学会就是赚到',
        'informative': '详细教程｜步骤分解',
        'emotional': '学会的那一刻｜我哭了'
      },
      'review': {
        'engaging': '真实测评！不踩雷指南',
        'informative': '深度评测｜优缺点分析',
        'emotional': '用心体验｜真实感受分享'
      },
      'sharing': {
        'engaging': '神仙分享！必须安利',
        'informative': '经验总结｜干货满满',
        'emotional': '走心分享｜真诚推荐'
      }
    };

    if (typeBasedTitles[contentType]) {
      return typeBasedTitles[contentType][style] || typeBasedTitles[contentType]['informative'];
    }

    // 最终通用回退
    const finalFallback = {
      'engaging': '绝了！这个必须分享',
      'informative': '实用内容｜建议收藏',
      'emotional': '真心话｜想对你说'
    };

    return finalFallback[style] || finalFallback['informative'];
  };

  // 吸引眼球风格标题 - 验证版本
  const generateEngagingStyleTitleVerified = (coreInfo: any, platform: string): string => {
    const { numbers, products, benefits, opinions, keyPoints } = coreInfo;

    // 根据平台调整吸引眼球的策略
    switch (platform) {
      case 'xiaohongshu':
        return generateXiaohongshuEngagingVerified(coreInfo);
      case 'weibo':
        return generateWeiboEngagingVerified(coreInfo);
      case 'zhihu':
        return generateZhihuEngagingVerified(coreInfo);
      case 'douyin':
        return generateDouyinEngagingVerified(coreInfo);
      default:
        return generateGeneralEngagingVerified(coreInfo);
    }
  };

  // 信息丰富风格标题 - 验证版本
  const generateInformativeStyleTitleVerified = (coreInfo: any, platform: string): string => {
    switch (platform) {
      case 'xiaohongshu':
        return generateXiaohongshuInformativeVerified(coreInfo);
      case 'weibo':
        return generateWeiboInformativeVerified(coreInfo);
      case 'zhihu':
        return generateZhihuInformativeVerified(coreInfo);
      case 'douyin':
        return generateDouyinInformativeVerified(coreInfo);
      default:
        return generateGeneralInformativeVerified(coreInfo);
    }
  };

  // 情感共鸣风格标题 - 验证版本
  const generateEmotionalStyleTitleVerified = (coreInfo: any, platform: string): string => {
    switch (platform) {
      case 'xiaohongshu':
        return generateXiaohongshuEmotionalVerified(coreInfo);
      case 'weibo':
        return generateWeiboEmotionalVerified(coreInfo);
      case 'zhihu':
        return generateZhihuEmotionalVerified(coreInfo);
      case 'douyin':
        return generateDouyinEmotionalVerified(coreInfo);
      default:
        return generateGeneralEmotionalVerified(coreInfo);
    }
  };

  // 小红书 - 吸引眼球风格 (验证版本)
  const generateXiaohongshuEngagingVerified = (coreInfo: any): string => {
    const { numbers, products, emotions, topics, contentType, mainTheme, originalContent } = coreInfo;

    const engagingTemplates = [];

    // 只使用内容中实际存在的数字
    if (numbers.length > 0) {
      engagingTemplates.push(
        `${numbers[0]}！姐妹们都惊呆了`,
        `${numbers[0]}真相大公开！`
      );
    }

    // 只使用内容中实际提到的产品，且验证积极描述
    if (products.length > 0) {
      const productInContent = products.find(product =>
        originalContent.includes(product) &&
        (originalContent.includes(product + '好') || originalContent.includes(product + '不错') ||
         originalContent.includes('推荐' + product) || originalContent.includes(product + '值得'))
      );

      if (productInContent) {
        engagingTemplates.push(
          `${productInContent}绝了！全网都在抢`,
          `${productInContent}｜闭眼入不踩雷`
        );
      }
    }

    // 只使用内容中实际存在的强烈情感词
    const strongEmotions = emotions.filter((emotion: any) => emotion.intensity > 0.7);
    if (strongEmotions.length > 0) {
      engagingTemplates.push(
        `${strongEmotions[0].word}！必须分享给你们`,
        `${strongEmotions[0].word}瞬间！心动不如行动`
      );
    }

    // 使用主题词而非随意的话题
    if (mainTheme && originalContent.includes(mainTheme)) {
      engagingTemplates.push(
        `${mainTheme}火了！全网都在学`,
        `${mainTheme}｜99%的人不知道`
      );
    }

    // 根据实际内容类型的模板
    if (contentType === 'review' && coreInfo.isReview) {
      engagingTemplates.push('真实测评！不踩雷指南');
    } else if (contentType === 'tutorial' && coreInfo.isTutorial) {
      engagingTemplates.push('神仙教程！学会就是赚到');
    } else if (contentType === 'sharing' && coreInfo.isPersonalExperience) {
      engagingTemplates.push('真实分享！必须安利');
    }

    // 如果没有足够的验证信息，使用基于主题的通用模板
    if (engagingTemplates.length === 0) {
      if (mainTheme) {
        engagingTemplates.push(
          `${mainTheme}分享！必须收藏`,
          `关于${mainTheme}的发现`
        );
      } else {
        engagingTemplates.push(
          '实用分享！建议收藏',
          '这个发现太实用了！'
        );
      }
    }

    return engagingTemplates[Math.floor(Math.random() * engagingTemplates.length)];
  };

  // 通用验证版本函数 - 为其他平台提供快速实现
  const generateVerifiedTitle = (coreInfo: any, platform: string, style: string): string => {
    const { mainTheme, contentType, emotions, products, originalContent } = coreInfo;

    // 平台特色词汇
    const platformStyles = {
      weibo: {
        engaging: ['火了', '热搜', '爆了', '网友'],
        informative: ['深度', '分析', '解读', '专业'],
        emotional: ['感动', '真实', '心声', '共鸣']
      },
      zhihu: {
        engaging: ['如何看待', '值得思考', '怎么看'],
        informative: ['详细解析', '系统分析', '深度思考'],
        emotional: ['真实经历', '个人感受', '深度思考']
      },
      douyin: {
        engaging: ['绝了', '火遍全网', '99%不知道'],
        informative: ['详细教程', '手把手', '完整攻略'],
        emotional: ['看哭了', '太真实', '说出心声']
      }
    };

    const styleWords = platformStyles[platform as keyof typeof platformStyles]?.[style] || [];

    // 基于内容生成标题
    if (mainTheme && originalContent.includes(mainTheme)) {
      if (style === 'engaging' && styleWords.length > 0) {
        return `${mainTheme}${styleWords[0]}！`;
      } else if (style === 'informative') {
        return `${mainTheme}${styleWords[0] || '详细解析'}`;
      } else if (style === 'emotional') {
        return `关于${mainTheme}的${styleWords[0] || '真实感受'}`;
      }
    }

    // 回退到内容类型模板
    const typeTemplates = {
      tutorial: {
        engaging: '实用教程！必须收藏',
        informative: '详细教程｜完整指南',
        emotional: '学习过程的真实感受'
      },
      review: {
        engaging: '真实体验！值得一看',
        informative: '详细评测｜客观分析',
        emotional: '使用后的真实感受'
      },
      sharing: {
        engaging: '实用分享！建议收藏',
        informative: '经验总结｜干货整理',
        emotional: '真实经验与感悟'
      }
    };

    return typeTemplates[contentType as keyof typeof typeTemplates]?.[style] ||
           typeTemplates.sharing[style];
  };

  // 其他平台的验证版本函数（使用通用函数）
  const generateWeiboEngagingVerified = (coreInfo: any): string =>
    generateVerifiedTitle(coreInfo, 'weibo', 'engaging');

  const generateZhihuEngagingVerified = (coreInfo: any): string =>
    generateVerifiedTitle(coreInfo, 'zhihu', 'engaging');

  const generateDouyinEngagingVerified = (coreInfo: any): string =>
    generateVerifiedTitle(coreInfo, 'douyin', 'engaging');

  const generateGeneralEngagingVerified = (coreInfo: any): string =>
    generateVerifiedTitle(coreInfo, 'general', 'engaging');

  // 信息丰富风格的验证版本
  const generateXiaohongshuInformativeVerified = (coreInfo: any): string =>
    generateVerifiedTitle(coreInfo, 'xiaohongshu', 'informative');

  const generateWeiboInformativeVerified = (coreInfo: any): string =>
    generateVerifiedTitle(coreInfo, 'weibo', 'informative');

  const generateZhihuInformativeVerified = (coreInfo: any): string =>
    generateVerifiedTitle(coreInfo, 'zhihu', 'informative');

  const generateDouyinInformativeVerified = (coreInfo: any): string =>
    generateVerifiedTitle(coreInfo, 'douyin', 'informative');

  const generateGeneralInformativeVerified = (coreInfo: any): string =>
    generateVerifiedTitle(coreInfo, 'general', 'informative');

  // 情感共鸣风格的验证版本
  const generateXiaohongshuEmotionalVerified = (coreInfo: any): string =>
    generateVerifiedTitle(coreInfo, 'xiaohongshu', 'emotional');

  const generateWeiboEmotionalVerified = (coreInfo: any): string =>
    generateVerifiedTitle(coreInfo, 'weibo', 'emotional');

  const generateZhihuEmotionalVerified = (coreInfo: any): string =>
    generateVerifiedTitle(coreInfo, 'zhihu', 'emotional');

  const generateDouyinEmotionalVerified = (coreInfo: any): string =>
    generateVerifiedTitle(coreInfo, 'douyin', 'emotional');

  const generateGeneralEmotionalVerified = (coreInfo: any): string =>
    generateVerifiedTitle(coreInfo, 'general', 'emotional');

  // 小红书 - 信息丰富风格 (重构版本)
  const generateXiaohongshuInformative = (coreInfo: any): string => {
    const { numbers, products, benefits, keyPoints, topics, contentType, keywords } = coreInfo;

    const informativeTemplates = [];

    // 数据分析型
    if (numbers.length > 0 && products.length > 0) {
      informativeTemplates.push(
        `${products[0]}深度测评｜${numbers[0]}真实数据`,
        `${products[0]}完整分析｜${numbers[0]}详细对比`,
        `${numbers[0]}数据揭秘｜${products[0]}全解析`
      );
    }

    // 攻略指南型
    if (keyPoints.length > 0) {
      informativeTemplates.push(
        `${keyPoints[0]}完整攻略｜保姆级教程`,
        `${keyPoints[0]}详细指南｜新手必看`,
        `${keyPoints[0]}全面解析｜干货满满`
      );
    }

    // 专业评测型
    if (products.length > 0) {
      informativeTemplates.push(
        `${products[0]}专业测评｜优缺点详解`,
        `${products[0]}深度体验｜真实反馈`,
        `${products[0]}全方位解析｜购买指南`
      );
    }

    // 方法教程型
    if (benefits.length > 0) {
      informativeTemplates.push(
        `${benefits[0]}详细教程｜步骤拆解`,
        `${benefits[0]}方法总结｜经验分享`,
        `${benefits[0]}完整流程｜实操指南`
      );
    }

    // 话题深度型
    if (topics.length > 0) {
      informativeTemplates.push(
        `${topics[0]}深度解读｜专业分析`,
        `${topics[0]}全面科普｜知识点整理`,
        `${topics[0]}详细说明｜一文看懂`
      );
    }

    // 根据内容类型的专业模板
    const typeTemplates = {
      'tutorial': ['保姆级教程｜零基础入门', '详细步骤｜手把手教学', '完整流程｜新手友好'],
      'review': ['深度测评｜真实体验分享', '全面评测｜优缺点分析', '使用报告｜详细反馈'],
      'recommendation': ['精选推荐｜品质保证', '专业推荐｜值得入手', '良心推荐｜不踩雷'],
      'sharing': ['经验分享｜干货满满', '心得总结｜实用技巧', '知识分享｜建议收藏']
    };

    if (typeTemplates[contentType]) {
      informativeTemplates.push(...typeTemplates[contentType]);
    }

    // 通用信息丰富模板
    const fallbackTemplates = [
      '实用干货分享｜建议收藏',
      '详细解析｜全面指南',
      '深度分析｜专业解读',
      '完整攻略｜新手必看',
      '知识科普｜一文看懂'
    ];

    const allTemplates = informativeTemplates.length > 0 ? informativeTemplates : fallbackTemplates;
    return allTemplates[Math.floor(Math.random() * allTemplates.length)];
  };

  // 小红书 - 情感共鸣风格 (重构版本)
  const generateXiaohongshuEmotional = (coreInfo: any): string => {
    const { products, benefits, opinions, emotions, topics, contentType, firstSentence } = coreInfo;

    const emotionalTemplates = [];

    // 产品情感型
    if (products.length > 0) {
      emotionalTemplates.push(
        `${products[0]}治愈了我的焦虑`,
        `${products[0]}让我重新爱上生活`,
        `${products[0]}陪我度过了最难的时光`,
        `用了${products[0]}后，我变了`
      );
    }

    // 收获感悟型
    if (benefits.length > 0) {
      emotionalTemplates.push(
        `${benefits[0]}让我重新认识自己`,
        `${benefits[0]}的过程中我成长了`,
        `${benefits[0]}给了我新的人生感悟`,
        `${benefits[0]}让我找到了内心的平静`
      );
    }

    // 真实感受型
    if (emotions.length > 0) {
      emotionalTemplates.push(
        `${emotions[0]}到想哭｜真实感受分享`,
        `${emotions[0]}瞬间｜那些温暖的回忆`,
        `${emotions[0]}的时刻｜我想对你说`,
        `${emotions[0]}了！这就是生活的意义`
      );
    }

    // 话题感悟型
    if (topics.length > 0) {
      emotionalTemplates.push(
        `${topics[0]}让我想起了那些年`,
        `${topics[0]}的心路历程｜真心话`,
        `${topics[0]}教会了我什么是勇敢`,
        `关于${topics[0]}，我想说的话`
      );
    }

    // 观点共鸣型
    if (opinions.length > 0) {
      emotionalTemplates.push(
        `${opinions[0]}｜说出了我的心声`,
        `${opinions[0]}｜深深触动了我`,
        `${opinions[0]}｜这就是我想要的`,
        `${opinions[0]}｜终于有人懂我`
      );
    }

    // 根据内容类型的情感模板
    const typeEmotionalTemplates = {
      'sharing': ['那些年的酸甜苦辣｜真实分享', '走过的路｜想对你说', '成长路上｜感谢遇见'],
      'review': ['用心体验｜真实感受分享', '那些感动的瞬间｜值得回味', '真心话｜我的使用感受'],
      'tutorial': ['学会的那一刻｜我哭了', '从小白到熟练｜我的成长', '这个过程｜让我收获满满'],
      'problem-solving': ['走出困境｜我想分享的', '那些难熬的日子｜终于过去了', '解决问题｜我的心路历程']
    };

    if (typeEmotionalTemplates[contentType]) {
      emotionalTemplates.push(...typeEmotionalTemplates[contentType]);
    }

    // 通用情感共鸣模板
    const fallbackTemplates = [
      '那些年踩过的坑｜真实感受',
      '想对你说的心里话｜真诚分享',
      '这些年的成长｜感谢遇见',
      '生活教会我的事｜深度思考',
      '那些温暖的瞬间｜值得珍藏',
      '从迷茫到清晰｜我的故事',
      '这就是我想要的生活｜真心话'
    ];

    const allTemplates = emotionalTemplates.length > 0 ? emotionalTemplates : fallbackTemplates;
    return allTemplates[Math.floor(Math.random() * allTemplates.length)];
  };

  // 微博 - 吸引眼球风格 (重构版本)
  const generateWeiboEngaging = (coreInfo: any): string => {
    const { keyPoints, opinions, products, numbers, emotions, topics, contentType } = coreInfo;

    const engagingTemplates = [];

    // 震惊爆料型
    if (keyPoints.length > 0) {
      engagingTemplates.push(
        `震惊！${keyPoints[0]}竟然是这样`,
        `爆料！${keyPoints[0]}背后的真相`,
        `惊呆了！${keyPoints[0]}居然...`
      );
    }

    // 热点话题型
    if (products.length > 0) {
      engagingTemplates.push(
        `${products[0]}火了！网友：太真实了`,
        `${products[0]}上热搜！评论区沦陷`,
        `${products[0]}刷屏了！你怎么看？`
      );
    }

    // 数据冲击型
    if (numbers.length > 0) {
      engagingTemplates.push(
        `${numbers[0]}！这个数据让人意外`,
        `${numbers[0]}曝光！网友炸锅了`,
        `${numbers[0]}真相大白！太震撼了`
      );
    }

    // 争议话题型
    if (opinions.length > 0) {
      engagingTemplates.push(
        `${opinions[0]}？评论区炸了`,
        `${opinions[0]}引发热议！你站哪边？`,
        `${opinions[0]}惹争议！网友吵翻了`
      );
    }

    // 情感爆点型
    if (emotions.length > 0) {
      engagingTemplates.push(
        `${emotions[0]}！全网都在转发`,
        `${emotions[0]}瞬间！看哭了无数人`,
        `${emotions[0]}到爆！这就是现实`
      );
    }

    // 通用热搜模板
    const fallbackTemplates = [
      '这个话题上热搜了！你怎么看？',
      '突发！网友都在讨论这件事',
      '爆了！评论区已经沦陷',
      '热议！这事你怎么看？',
      '刷屏了！全网都在转发'
    ];

    const allTemplates = engagingTemplates.length > 0 ? engagingTemplates : fallbackTemplates;
    return allTemplates[Math.floor(Math.random() * allTemplates.length)];
  };

  // 微博 - 信息丰富风格
  const generateWeiboInformative = (coreInfo: any): string => {
    const { keyPoints, products, numbers, benefits } = coreInfo;

    const templates = [
      keyPoints.length > 0 ? `关于${keyPoints[0]}的详细分析` : null,
      products.length > 0 ? `${products[0]}深度解读｜专业角度` : null,
      numbers.length > 0 ? `${numbers[0]}数据报告｜权威发布` : null,
      benefits.length > 0 ? `${benefits[0]}完整指南｜建议收藏` : null,
      '深度分析｜专业解读'
    ].filter(Boolean);

    return templates[Math.floor(Math.random() * templates.length)] || templates[templates.length - 1];
  };

  // 微博 - 情感共鸣风格
  const generateWeiboEmotional = (coreInfo: any): string => {
    const { keyPoints, products, opinions, firstSentence } = coreInfo;

    const templates = [
      keyPoints.length > 0 ? `${keyPoints[0]}让我想起了那些年` : null,
      products.length > 0 ? `${products[0]}承载了太多回忆` : null,
      opinions.length > 0 ? `${opinions[0]}说出了我的心声` : null,
      firstSentence ? `${firstSentence.substring(0, 15)}触动了我` : null,
      '有些话，不吐不快'
    ].filter(Boolean);

    return templates[Math.floor(Math.random() * templates.length)] || templates[templates.length - 1];
  };

  // 知乎 - 吸引眼球风格 (重构版本)
  const generateZhihuEngaging = (coreInfo: any): string => {
    const { keyPoints, products, benefits, numbers, topics, contentType } = coreInfo;

    const engagingTemplates = [];

    // 疑问引导型
    if (keyPoints.length > 0) {
      engagingTemplates.push(
        `${keyPoints[0]}到底有多重要？`,
        `如何看待${keyPoints[0]}这个现象？`,
        `${keyPoints[0]}是智商税吗？`
      );
    }

    // 产品质疑型
    if (products.length > 0) {
      engagingTemplates.push(
        `为什么${products[0]}让人如此着迷？`,
        `${products[0]}真的值得买吗？`,
        `${products[0]}是过度营销还是真有用？`
      );
    }

    // 效果质疑型
    if (benefits.length > 0) {
      engagingTemplates.push(
        `${benefits[0]}真的有用吗？`,
        `${benefits[0]}是心理安慰还是真有效？`,
        `${benefits[0]}的科学依据是什么？`
      );
    }

    // 数据分析型
    if (numbers.length > 0) {
      engagingTemplates.push(
        `${numbers[0]}背后的真相是什么？`,
        `如何理性看待${numbers[0]}这个数据？`,
        `${numbers[0]}说明了什么问题？`
      );
    }

    // 话题讨论型
    if (topics.length > 0) {
      engagingTemplates.push(
        `如何看待${topics[0]}这个话题？`,
        `${topics[0]}值得深思的几个问题`,
        `关于${topics[0]}，你怎么看？`
      );
    }

    // 通用知乎风格模板
    const fallbackTemplates = [
      '这个问题困扰了我很久',
      '如何理性看待这个现象？',
      '这背后的逻辑是什么？',
      '有哪些值得思考的点？',
      '这个观点你认同吗？'
    ];

    const allTemplates = engagingTemplates.length > 0 ? engagingTemplates : fallbackTemplates;
    return allTemplates[Math.floor(Math.random() * allTemplates.length)];
  };

  // 知乎 - 信息丰富风格
  const generateZhihuInformative = (coreInfo: any): string => {
    const { keyPoints, products, actions, benefits } = coreInfo;

    const templates = [
      keyPoints.length > 0 ? `如何系统性地理解${keyPoints[0]}？` : null,
      products.length > 0 && actions.length > 0 ? `${products[0]}${actions[0]}的完整指南` : null,
      benefits.length > 0 ? `${benefits[0]}的科学方法论` : null,
      products.length > 0 ? `${products[0]}深度分析报告` : null,
      '从专业角度如何看待这个问题？'
    ].filter(Boolean);

    return templates[Math.floor(Math.random() * templates.length)] || templates[templates.length - 1];
  };

  // 知乎 - 情感共鸣风格
  const generateZhihuEmotional = (coreInfo: any): string => {
    const { keyPoints, products, benefits, firstSentence } = coreInfo;

    const templates = [
      keyPoints.length > 0 ? `${keyPoints[0]}改变了我的人生观` : null,
      products.length > 0 ? `${products[0]}让我重新思考生活` : null,
      benefits.length > 0 ? `${benefits[0]}的过程中我学到了什么？` : null,
      firstSentence ? `${firstSentence.substring(0, 15)}给我的启发` : null,
      '分享一个改变我认知的经历'
    ].filter(Boolean);

    return templates[Math.floor(Math.random() * templates.length)] || templates[templates.length - 1];
  };

  // 抖音 - 吸引眼球风格 (重构版本)
  const generateDouyinEngaging = (coreInfo: any): string => {
    const { numbers, products, benefits, opinions, emotions, topics } = coreInfo;

    const engagingTemplates = [];

    // 数字震撼型
    if (numbers.length > 0) {
      engagingTemplates.push(
        `${numbers[0]}！老板看了都沉默`,
        `${numbers[0]}曝光！网友炸锅了`,
        `${numbers[0]}真相！99%人不知道`
      );
    }

    // 产品爆款型
    if (products.length > 0) {
      engagingTemplates.push(
        `${products[0]}绝了！全网都在学`,
        `${products[0]}火了！必须安排`,
        `${products[0]}太香了！速来围观`
      );
    }

    // 秘密揭露型
    if (benefits.length > 0) {
      engagingTemplates.push(
        `${benefits[0]}！99%的人不知道`,
        `${benefits[0]}秘密！终于被发现`,
        `${benefits[0]}绝招！学会就赚到`
      );
    }

    // 网友热议型
    if (opinions.length > 0) {
      engagingTemplates.push(
        `${opinions[0]}？网友：太真实了`,
        `${opinions[0]}！评论区沦陷了`,
        `${opinions[0]}引爆全网！你怎么看`
      );
    }

    // 情感爆点型
    if (emotions.length > 0) {
      engagingTemplates.push(
        `${emotions[0]}！看哭了无数人`,
        `${emotions[0]}瞬间！全网都在转`,
        `${emotions[0]}到爆！这就是现实`
      );
    }

    // 通用抖音爆款模板
    const fallbackTemplates = [
      '这个方法火遍全网！',
      '绝了！全网都在学这招',
      '太香了！必须马上安排',
      '爆了！99%的人不知道',
      '神了！老板看了都沉默',
      '火了！评论区已沦陷'
    ];

    const allTemplates = engagingTemplates.length > 0 ? engagingTemplates : fallbackTemplates;
    return allTemplates[Math.floor(Math.random() * allTemplates.length)];
  };

  // 抖音 - 信息丰富风格
  const generateDouyinInformative = (coreInfo: any): string => {
    const { numbers, products, keyPoints, benefits } = coreInfo;

    const templates = [
      numbers.length > 0 ? `${numbers[0]}详细教程｜建议收藏` : null,
      products.length > 0 ? `${products[0]}完整攻略｜新手必看` : null,
      keyPoints.length > 0 ? `${keyPoints[0]}全解析｜干货满满` : null,
      benefits.length > 0 ? `${benefits[0]}步骤详解｜照着做就行` : null,
      '超详细教程｜手把手教学'
    ].filter(Boolean);

    return templates[Math.floor(Math.random() * templates.length)] || templates[templates.length - 1];
  };

  // 抖音 - 情感共鸣风格
  const generateDouyinEmotional = (coreInfo: any): string => {
    const { products, benefits, opinions, firstSentence } = coreInfo;

    const templates = [
      products.length > 0 ? `${products[0]}让我泪目了` : null,
      benefits.length > 0 ? `${benefits[0]}治愈了我的焦虑` : null,
      opinions.length > 0 ? `${opinions[0]}说出了我的心声` : null,
      firstSentence ? `${firstSentence.substring(0, 15)}的感动瞬间` : null,
      '看完这个我哭了'
    ].filter(Boolean);

    return templates[Math.floor(Math.random() * templates.length)] || templates[templates.length - 1];
  };

  // 通用 - 吸引眼球风格
  const generateGeneralEngaging = (coreInfo: any): string => {
    const { keyPoints, products, benefits, numbers } = coreInfo;

    const templates = [
      keyPoints.length > 0 ? `${keyPoints[0]}！你一定要知道` : null,
      products.length > 0 ? `${products[0]}太好用了！` : null,
      benefits.length > 0 ? `${benefits[0]}！效果惊人` : null,
      numbers.length > 0 ? `${numbers[0]}！数据说话` : null,
      '这个方法太实用了！'
    ].filter(Boolean);

    return templates[Math.floor(Math.random() * templates.length)] || templates[templates.length - 1];
  };

  // 通用 - 信息丰富风格
  const generateGeneralInformative = (coreInfo: any): string => {
    const { keyPoints, products, benefits, firstSentence } = coreInfo;

    const templates = [
      keyPoints.length > 0 ? `${keyPoints[0]}详细指南` : null,
      products.length > 0 ? `${products[0]}完整评测` : null,
      benefits.length > 0 ? `${benefits[0]}方法总结` : null,
      firstSentence && firstSentence.length > 5 ? `${firstSentence.replace(/[，。！？；：]/g, '').substring(0, 20)}分析` : null,
      '实用内容详解'
    ].filter(Boolean);

    return templates[Math.floor(Math.random() * templates.length)] || templates[templates.length - 1];
  };

  // 通用 - 情感共鸣风格
  const generateGeneralEmotional = (coreInfo: any): string => {
    const { keyPoints, products, benefits, firstSentence } = coreInfo;

    const templates = [
      keyPoints.length > 0 ? `${keyPoints[0]}的真实感受` : null,
      products.length > 0 ? `${products[0]}使用心得` : null,
      benefits.length > 0 ? `${benefits[0]}的收获与思考` : null,
      firstSentence && firstSentence.length > 5 ? `${firstSentence.substring(0, 15)}的感悟` : null,
      '真实经验分享'
    ].filter(Boolean);

    return templates[Math.floor(Math.random() * templates.length)] || templates[templates.length - 1];
  };







  // 根据平台调整标题长度
  const adjustTitleForPlatform = (title: string, limit: number): string => {
    if (title.length <= limit) return title;

    // 智能截断，保持语义完整
    const sentences = title.split(/[：，。！？]/);
    if (sentences.length > 1 && sentences[0].length <= limit) {
      return sentences[0];
    }

    // 如果第一句话太长，截断并添加省略号
    return title.substring(0, limit - 3) + '...';
  };

  const handleTitleSelect = (title: string) => {
    setSelectedTitle(title);
    onTitleChange?.(title);
  };

  const handleEditStart = () => {
    setEditingTitle(selectedTitle);
    setIsEditing(true);
  };

  const handleEditSave = () => {
    if (editingTitle.trim()) {
      setSelectedTitle(editingTitle.trim());
      onTitleChange?.(editingTitle.trim());
      setIsEditing(false);
      toast({
        title: "标题已更新",
        description: "自定义标题已保存",
      });
    }
  };

  const handleEditCancel = () => {
    setEditingTitle(selectedTitle);
    setIsEditing(false);
  };

  const copyTitle = async () => {
    if (selectedTitle) {
      try {
        await navigator.clipboard.writeText(selectedTitle);
        toast({
          title: "复制成功",
          description: "标题已复制到剪贴板",
        });
      } catch (error) {
        toast({
          title: "复制失败",
          description: "无法复制到剪贴板",
          variant: "destructive"
        });
      }
    }
  };

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
    <Card className="mb-4">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
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
          <Button
            size="sm"
            variant="outline"
            onClick={generateTitles}
            disabled={isGenerating || !content}
          >
            <RefreshCw className={`h-4 w-4 mr-1 ${isGenerating ? 'animate-spin' : ''}`} />
            {isGenerating ? '生成中...' : '重新生成'}
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* 当前选中的标题 */}
        {selectedTitle && (
          <div className="border rounded-lg p-3 bg-blue-50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-blue-800">当前标题</span>
              <div className="flex gap-1">
                <Button size="sm" variant="ghost" onClick={handleEditStart}>
                  <Edit className="h-3 w-3" />
                </Button>
                <Button size="sm" variant="ghost" onClick={copyTitle}>
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
            </div>
            
            {isEditing ? (
              <div className="space-y-2">
                <Textarea
                  value={editingTitle}
                  onChange={(e) => setEditingTitle(e.target.value)}
                  className="min-h-[60px]"
                  maxLength={titleLimit}
                />
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">
                    {editingTitle.length}/{titleLimit} 字符
                  </span>
                  <div className="flex gap-1">
                    <Button size="sm" variant="outline" onClick={handleEditCancel}>
                      <X className="h-3 w-3" />
                    </Button>
                    <Button size="sm" onClick={handleEditSave}>
                      <Check className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div>
                <p className="text-sm">{selectedTitle}</p>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-xs text-gray-500">
                    {selectedTitle.length}/{titleLimit} 字符
                  </span>
                  <Badge 
                    variant={selectedTitle.length > titleLimit ? "destructive" : "secondary"}
                    className="text-xs"
                  >
                    {selectedTitle.length > titleLimit ? '超出限制' : '符合要求'}
                  </Badge>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 标题选项 */}
        {titles.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium">选择标题风格：</h4>
            <div className="grid gap-2">
              {titles.map((title) => (
                <div
                  key={title.id}
                  className={`border rounded p-2 cursor-pointer transition-colors ${
                    selectedTitle === title.title
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => handleTitleSelect(title.title)}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm">{title.title}</span>
                    <div className="flex items-center gap-1">
                      <Badge variant="outline" className="text-xs">
                        {title.style}
                      </Badge>
                      {title.relevanceScore !== undefined && (
                        <Badge
                          variant={title.relevanceScore >= 0.7 ? "default" : title.relevanceScore >= 0.5 ? "secondary" : "outline"}
                          className="text-xs"
                        >
                          匹配度 {Math.round(title.relevanceScore * 100)}%
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-xs text-gray-500">
                      {title.length}/{titleLimit} 字符
                      {title.sourceInfo && ` • ${title.sourceInfo}`}
                    </span>
                    <Badge
                      variant={title.length > titleLimit ? "destructive" : "secondary"}
                      className="text-xs"
                    >
                      {title.length > titleLimit ? '超出限制' : '符合要求'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 生成状态 */}
        {isGenerating && (
          <div className="text-center py-4">
            <div className="inline-flex items-center gap-2 text-sm text-gray-600">
              <RefreshCw className="h-4 w-4 animate-spin" />
              正在为{platformName}生成专属标题...
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
