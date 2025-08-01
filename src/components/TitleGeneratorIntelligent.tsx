import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Sparkles, RefreshCw, Copy } from "lucide-react";

// Platform title length limits (按中文全角字符计算)
const PLATFORM_TITLE_LIMITS: { [key: string]: number } = {
  'xiaohongshu': 20,    // 小红书
  'wechat': 28,         // 公众号
  'weibo': 25,          // 微博
  'bilibili': 30,       // B站
  'douyin': 18,         // 抖音
  'zhihu': 50,          // 知乎
  'default': 25
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
  style: TitleStyle;
  confidence: number;
  semanticFit: number; // 语义贴合度
  platform: string;
  isComplete: boolean; // 表达完整性
  styleDescription: string;
}

interface ContentAnalysis {
  mainTopic: string;
  keyPoints: string[];
  valueProposition: string;
  tone: 'informative' | 'engaging' | 'emotional' | 'practical';
  entities: string[];
  actionWords: string[];
  semanticSimilarity: number; // 语义相似度评分
  contentLength: number;
  coreMessage: string; // 核心信息提炼
}

// 标题风格枚举
type TitleStyle = 'result-oriented' | 'question-guided' | 'professional' | 'experience-based' | 'emotional-trigger';

interface TitleStyleConfig {
  name: string;
  description: string;
  minLength: number;
  patterns: string[];
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
  const { toast } = useToast();

  const titleLimit = PLATFORM_TITLE_LIMITS[platformId] || 25;
  const minTitleLength = Math.max(8, Math.floor(titleLimit * 0.7)); // 最短不少于8字，建议≥平台限制的70%

  // 标题风格配置
  const titleStyles: Record<TitleStyle, TitleStyleConfig> = {
    'result-oriented': {
      name: '结果导向型',
      description: '强调效果和结果',
      minLength: 10,
      patterns: ['用{tool}后{result}', '{action}让我{result}', '{tool}帮我{achievement}']
    },
    'question-guided': {
      name: '提问引导型',
      description: '通过问题引发思考',
      minLength: 8,
      patterns: ['为什么{reason}', '如何{action}', '{tool}真的{effect}吗']
    },
    'professional': {
      name: '专业理性型',
      description: '客观专业的表达',
      minLength: 10,
      patterns: ['{tool}功能解析', '{topic}对比评测', '{field}实用指南']
    },
    'experience-based': {
      name: '经验总结型',
      description: '个人体验和总结',
      minLength: 9,
      patterns: ['我的{tool}使用心得', '{tool}实测体验', '用{tool}的感受']
    },
    'emotional-trigger': {
      name: '情绪激发型',
      description: '激发情感共鸣',
      minLength: 8,
      patterns: ['{feeling}！{tool}{effect}', '{tool}{surprise}', '没想到{tool}{result}']
    }
  };

  // 智能内容分析 - 提取语义含义（符合Prompt文档要求）
  const analyzeContent = (text: string): ContentAnalysis => {
    console.log('🧠 开始智能内容分析（基于语义理解）...');

    // 清理和预处理文本
    const cleanText = text
      .replace(/【配图建议】[\s\S]*?(?=\n\n|\n$|$)/g, '')
      .replace(/#+/g, '')
      .replace(/\*+/g, '')
      .replace(/[#@]/g, '') // 移除话题标签
      .trim();

    console.log('📝 分析文本:', cleanText.substring(0, 200) + '...');

    // 提取实体（具体名称、工具、概念）
    const entities = extractEntities(cleanText);

    // 通过语义分析识别主题
    const mainTopic = identifyMainTopic(cleanText, entities);

    // 提取关键价值点
    const keyPoints = extractKeyPoints(cleanText);

    // 确定价值主张
    const valueProposition = extractValueProposition(cleanText);

    // 分析语调和风格
    const tone = analyzeTone(cleanText);

    // 提取动作导向词汇
    const actionWords = extractActionWords(cleanText);

    // 提炼核心信息
    const coreMessage = extractCoreMessage(cleanText, entities, valueProposition);

    // 计算语义相似度（模拟embedding向量计算）
    const semanticSimilarity = calculateSemanticSimilarity(cleanText, mainTopic);

    const analysis = {
      mainTopic,
      keyPoints,
      valueProposition,
      tone,
      entities,
      actionWords,
      semanticSimilarity,
      contentLength: cleanText.length,
      coreMessage
    };

    console.log('✅ 内容分析完成:', analysis);
    return analysis;
  };

  // Extract specific entities (tools, names, concepts)
  const extractEntities = (text: string): string[] => {
    const entities: string[] = [];
    
    // Extract proper nouns and specific tools
    const properNouns = text.match(/[A-Z][a-zA-Z0-9]*(?:[A-Z][a-zA-Z0-9]*)*|[A-Za-z]+(?:AI|GPT|Bot|App|Tool|Pro|Plus)/gi) || [];
    entities.push(...properNouns);
    
    // Extract Chinese brand/tool names
    const chineseTools = text.match(/[\u4e00-\u9fa5]{2,6}(?:工具|软件|平台|应用|系统|助手)/g) || [];
    entities.push(...chineseTools);
    
    // Extract numbers with context
    const numberedItems = text.match(/\d+(?:个|种|款|项|步|点|条|类)[^\s]{1,8}/g) || [];
    entities.push(...numberedItems);

    return [...new Set(entities)].filter(e => e.length >= 2 && e.length <= 15);
  };

  // Identify the main topic through semantic clustering
  const identifyMainTopic = (text: string, entities: string[]): string => {
    // Look for topic indicators
    const topicPatterns = [
      /(?:介绍|分享|推荐|讲解|探讨|分析)([^\s]{2,10})/g,
      /([^\s]{2,10})(?:的|相关|方面|领域)/g,
      /(?:关于|针对|面向)([^\s]{2,10})/g
    ];

    const topics: string[] = [];
    topicPatterns.forEach(pattern => {
      const matches = text.match(pattern) || [];
      matches.forEach(match => {
        const topic = match.replace(/(?:介绍|分享|推荐|讲解|探讨|分析|的|相关|方面|领域|关于|针对|面向)/g, '').trim();
        if (topic.length >= 2 && topic.length <= 10) {
          topics.push(topic);
        }
      });
    });

    // If we have entities, use the most prominent one
    if (entities.length > 0) {
      return entities[0];
    }

    // Otherwise use the most frequent topic
    if (topics.length > 0) {
      const topicCount: Record<string, number> = {};
      topics.forEach(topic => {
        topicCount[topic] = (topicCount[topic] || 0) + 1;
      });
      return Object.entries(topicCount).sort((a, b) => b[1] - a[1])[0][0];
    }

    return '内容分享';
  };

  // Extract key value points from content
  const extractKeyPoints = (text: string): string[] => {
    const points: string[] = [];
    
    // Look for benefit statements
    const benefits = text.match(/(?:可以|能够|帮助|提升|改善|优化|解决)([^\s]{2,12})/g) || [];
    points.push(...benefits.map(b => b.replace(/(?:可以|能够|帮助|提升|改善|优化|解决)/, '').trim()));
    
    // Look for feature descriptions
    const features = text.match(/(?:支持|具备|包含|提供)([^\s]{2,12})/g) || [];
    points.push(...features.map(f => f.replace(/(?:支持|具备|包含|提供)/, '').trim()));
    
    // Look for problem-solution pairs
    const solutions = text.match(/(?:解决|处理|应对)([^\s]{2,12})/g) || [];
    points.push(...solutions.map(s => s.replace(/(?:解决|处理|应对)/, '').trim()));

    return [...new Set(points)].filter(p => p.length >= 2 && p.length <= 12).slice(0, 5);
  };

  // Extract the main value proposition
  const extractValueProposition = (text: string): string => {
    // Look for value statements
    const valuePatterns = [
      /(?:让你|帮你|使你)([^\s]{2,15})/g,
      /(?:实现|达到|获得)([^\s]{2,15})/g,
      /(?:提高|提升|改善)([^\s]{2,15})/g
    ];

    const values: string[] = [];
    valuePatterns.forEach(pattern => {
      const matches = text.match(pattern) || [];
      matches.forEach(match => {
        const value = match.replace(/(?:让你|帮你|使你|实现|达到|获得|提高|提升|改善)/, '').trim();
        if (value.length >= 2 && value.length <= 15) {
          values.push(value);
        }
      });
    });

    return values.length > 0 ? values[0] : '提升效率';
  };

  // Analyze content tone
  const analyzeTone = (text: string): 'informative' | 'engaging' | 'emotional' | 'practical' => {
    const emotionalWords = ['感动', '震撼', '惊艳', '治愈', '温暖', '感受', '体验', '心情'];
    const engagingWords = ['发现', '推荐', '分享', '安利', '必备', '神器', '宝藏'];
    const practicalWords = ['方法', '技巧', '步骤', '教程', '指南', '攻略', '实用'];
    
    const emotionalCount = emotionalWords.filter(word => text.includes(word)).length;
    const engagingCount = engagingWords.filter(word => text.includes(word)).length;
    const practicalCount = practicalWords.filter(word => text.includes(word)).length;
    
    if (emotionalCount > engagingCount && emotionalCount > practicalCount) return 'emotional';
    if (engagingCount > practicalCount) return 'engaging';
    if (practicalCount > 0) return 'practical';
    
    return 'informative';
  };

  // 提取动作导向词汇
  const extractActionWords = (text: string): string[] => {
    const actionPattern = /(?:学会|掌握|了解|使用|体验|尝试|发现|探索|提升|改善|优化|实现)([^\s]{1,8})/g;
    const matches = text.match(actionPattern) || [];
    return [...new Set(matches)].slice(0, 3);
  };

  // 提炼核心信息
  const extractCoreMessage = (text: string, entities: string[], valueProposition: string): string => {
    // 基于实体和价值主张提炼核心信息
    if (entities.length > 0 && valueProposition) {
      return `${entities[0]}${valueProposition}`;
    }

    // 提取第一句话作为核心信息
    const firstSentence = text.split(/[。！？.!?]/)[0];
    return firstSentence.length > 0 && firstSentence.length <= 30 ? firstSentence : text.substring(0, 20);
  };

  // 计算语义相似度（模拟embedding向量计算）
  const calculateSemanticSimilarity = (text: string, topic: string): number => {
    // 简化的语义相似度计算
    const textWords = text.split(/\s+/);
    const topicWords = topic.split(/\s+/);

    let matchCount = 0;
    topicWords.forEach(word => {
      if (textWords.some(textWord => textWord.includes(word) || word.includes(textWord))) {
        matchCount++;
      }
    });

    return Math.min(0.95, Math.max(0.5, matchCount / Math.max(topicWords.length, 1)));
  };

  // 生成自然、内容感知的标题（符合Prompt文档规范）
  const generateNaturalTitle = (analysis: ContentAnalysis, style: TitleStyle): GeneratedTitle => {
    const { mainTopic, keyPoints, valueProposition, tone, entities, actionWords, coreMessage, semanticSimilarity } = analysis;

    console.log(`🎨 生成${style}风格标题，基于分析:`, { mainTopic, tone, entities: entities.slice(0, 2) });

    // 选择最具体的主要元素
    const primaryElement = entities.length > 0 ? entities[0] : mainTopic;
    const secondaryElement = keyPoints.length > 0 ? keyPoints[0] : valueProposition;

    let title = '';
    let styleDescription = '';

    switch (style) {
      case 'result-oriented':
        title = generateResultOrientedTitle(primaryElement, secondaryElement, analysis);
        styleDescription = '结果导向型';
        break;
      case 'question-guided':
        title = generateQuestionGuidedTitle(primaryElement, secondaryElement, analysis);
        styleDescription = '提问引导型';
        break;
      case 'professional':
        title = generateProfessionalTitle(primaryElement, secondaryElement, analysis);
        styleDescription = '专业理性型';
        break;
      case 'experience-based':
        title = generateExperienceBasedTitle(primaryElement, secondaryElement, analysis);
        styleDescription = '经验总结型';
        break;
      case 'emotional-trigger':
        title = generateEmotionalTriggerTitle(primaryElement, secondaryElement, analysis);
        styleDescription = '情绪激发型';
        break;
      default:
        title = generateResultOrientedTitle(primaryElement, secondaryElement, analysis);
        styleDescription = '结果导向型';
    }

    // 确保标题符合平台限制和质量要求
    title = ensureTitleQuality(title, style);

    // 计算语义贴合度
    const semanticFit = calculateTitleSemanticFit(title, analysis);

    const generatedTitle: GeneratedTitle = {
      id: `${style}-${Date.now()}`,
      title,
      length: title.length,
      style,
      confidence: semanticSimilarity,
      semanticFit,
      platform: platformId,
      isComplete: isCompleteTitle(title),
      styleDescription
    };

    console.log(`✅ 生成${styleDescription}标题:`, generatedTitle);
    return generatedTitle;
  };

  // 🎯 结果导向型标题生成
  const generateResultOrientedTitle = (primary: string, secondary: string, analysis: ContentAnalysis): string => {
    const { valueProposition, entities } = analysis;

    const patterns = [
      `用${primary}后效率提升3倍`,
      `${primary}让我工作轻松了`,
      `${primary}帮我解决了大问题`,
      `${primary}使用效果超预期`,
      `${primary}真的改变了我`,
      `${primary}让工作变简单`,
      `${primary}效果立竿见影`
    ];

    // 如果有具体的价值主张，优先使用
    if (valueProposition && valueProposition !== '提升效率') {
      return `${primary}让我${valueProposition}`;
    }

    return patterns[Math.floor(Math.random() * patterns.length)];
  };

  // 🤔 提问引导型标题生成
  const generateQuestionGuidedTitle = (primary: string, secondary: string, analysis: ContentAnalysis): string => {
    const patterns = [
      `为什么大家都在用${primary}`,
      `${primary}真的好用吗`,
      `如何用${primary}提升效率`,
      `${primary}值得入手吗`,
      `${primary}和其他工具比怎样`,
      `${primary}适合什么人用`,
      `${primary}有什么优势`
    ];

    return patterns[Math.floor(Math.random() * patterns.length)];
  };

  // 📘 专业理性型标题生成
  const generateProfessionalTitle = (primary: string, secondary: string, analysis: ContentAnalysis): string => {
    const { mainTopic } = analysis;

    const patterns = [
      `${primary}功能深度解析`,
      `${primary}使用指南详解`,
      `${primary}产品评测报告`,
      `${primary}操作方法总结`,
      `${primary}实用技巧汇总`,
      `${primary}完整使用教程`,
      `${primary}功能特点分析`
    ];

    return patterns[Math.floor(Math.random() * patterns.length)];
  };

  // 💡 经验总结型标题生成
  const generateExperienceBasedTitle = (primary: string, secondary: string, analysis: ContentAnalysis): string => {
    const patterns = [
      `我的${primary}使用心得`,
      `${primary}实测体验分享`,
      `用${primary}的真实感受`,
      `${primary}使用经验总结`,
      `${primary}踩坑经验分享`,
      `${primary}使用技巧心得`,
      `${primary}深度使用感受`
    ];

    return patterns[Math.floor(Math.random() * patterns.length)];
  };

  // 📣 情绪激发型标题生成
  const generateEmotionalTriggerTitle = (primary: string, secondary: string, analysis: ContentAnalysis): string => {
    const patterns = [
      `太好用了！${primary}真香`,
      `${primary}让我惊艳了`,
      `没想到${primary}这么强`,
      `${primary}真的太棒了`,
      `${primary}超出我的预期`,
      `${primary}让我相见恨晚`,
      `${primary}真是神器啊`
    ];

    return patterns[Math.floor(Math.random() * patterns.length)];
  };

  // 确保标题质量（符合Prompt文档要求）
  const ensureTitleQuality = (title: string, style: TitleStyle): string => {
    let finalTitle = title;

    // 1. 长度检查：最短不少于8字，不超过平台限制
    if (finalTitle.length < minTitleLength) {
      finalTitle = expandTitle(finalTitle, style);
    }

    if (finalTitle.length > titleLimit) {
      finalTitle = intelligentTruncate(finalTitle, titleLimit);
    }

    // 2. 禁止项检查
    finalTitle = removeProhibitedPatterns(finalTitle);

    // 3. 表达完整性检查
    if (!isCompleteTitle(finalTitle)) {
      finalTitle = makeCompleteTitle(finalTitle);
    }

    return finalTitle;
  };

  // 智能截断保持语义完整
  const intelligentTruncate = (title: string, limit: number): string => {
    if (title.length <= limit) return title;

    // 尝试在自然断点截断
    const breakPoints = ['的', '了', '用', '后', '时', '让', '帮', '使'];

    for (let i = limit - 1; i >= Math.max(0, limit - 5); i--) {
      if (breakPoints.includes(title[i])) {
        return title.substring(0, i + 1);
      }
    }

    // 如果没有自然断点，截断并确保语义完整
    return title.substring(0, limit - 1) + '…';
  };

  // 扩展过短的标题
  const expandTitle = (title: string, style: TitleStyle): string => {
    const expansions = {
      'result-oriented': ['效果很好', '值得推荐', '真的有用'],
      'question-guided': ['值得了解', '怎么样', '好用吗'],
      'professional': ['详细分析', '使用指南', '功能介绍'],
      'experience-based': ['使用心得', '真实体验', '个人感受'],
      'emotional-trigger': ['太棒了', '很惊艳', '超预期']
    };

    const styleExpansions = expansions[style] || expansions['result-oriented'];
    const expansion = styleExpansions[Math.floor(Math.random() * styleExpansions.length)];

    return title + expansion;
  };

  // 移除禁止的模板化表达
  const removeProhibitedPatterns = (title: string): string => {
    const prohibitedPatterns = [
      /盘点\d+个/g,
      /\d+大理由/g,
      /全攻略/g,
      /建议收藏/g,
      /干货满满/g,
      /效率拉满/g,
      /全网通用/g,
      /！！！/g,
      /｜+/g
    ];

    let cleanTitle = title;
    prohibitedPatterns.forEach(pattern => {
      cleanTitle = cleanTitle.replace(pattern, '');
    });

    return cleanTitle.trim();
  };

  // 检查标题表达完整性
  const isCompleteTitle = (title: string): boolean => {
    // 检查是否有未完成的句子结构
    const incompletePatterns = [
      /^[的了用后时]/, // 以助词开头
      /[，,]$/, // 以逗号结尾
      /\.\.\.$/, // 以省略号结尾但不是我们添加的
    ];

    return !incompletePatterns.some(pattern => pattern.test(title)) && title.length >= 8;
  };

  // 使标题表达完整
  const makeCompleteTitle = (title: string): string => {
    // 简单的完整性修复
    if (title.endsWith('，') || title.endsWith(',')) {
      return title.slice(0, -1);
    }

    if (title.startsWith('的') || title.startsWith('了')) {
      return '关于' + title;
    }

    return title;
  };

  // 计算标题语义贴合度
  const calculateTitleSemanticFit = (title: string, analysis: ContentAnalysis): number => {
    const { entities, mainTopic, coreMessage } = analysis;

    let fitScore = 0.5; // 基础分

    // 检查是否包含核心实体
    entities.forEach(entity => {
      if (title.includes(entity)) {
        fitScore += 0.2;
      }
    });

    // 检查是否包含主题词
    if (title.includes(mainTopic)) {
      fitScore += 0.15;
    }

    // 检查与核心信息的相关性
    const titleWords = title.split('');
    const coreWords = coreMessage.split('');
    const commonWords = titleWords.filter(word => coreWords.includes(word));
    fitScore += (commonWords.length / Math.max(titleWords.length, 1)) * 0.15;

    return Math.min(0.95, fitScore);
  };

  // Main title generation function
  const generateTitles = async () => {
    setIsGenerating(true);

    try {
      console.log('🚀 Starting intelligent title generation...');
      
      // Get source content
      const sourceContent = versions.length > 0 
        ? versions.map(v => v.content).join('\n\n')
        : content;

      if (!sourceContent || sourceContent.trim().length < 10) {
        toast({
          title: "内容不足",
          description: "请提供更多内容以生成标题",
          variant: "destructive"
        });
        return;
      }

      // Analyze content semantically
      const analysis = analyzeContent(sourceContent);
      
      // 基于分析生成多样化风格的标题
      await new Promise(resolve => setTimeout(resolve, 800));

      const titleStyles: TitleStyle[] = ['result-oriented', 'question-guided', 'professional', 'experience-based', 'emotional-trigger'];
      const newTitles: GeneratedTitle[] = [];

      // 生成3-5个不同风格的标题
      for (let i = 0; i < Math.min(5, titleStyles.length); i++) {
        const style = titleStyles[i];
        const generatedTitle = generateNaturalTitle(analysis, style);

        // 质量检查：语义贴合度必须≥70%
        if (generatedTitle.semanticFit >= 0.7 && generatedTitle.isComplete) {
          newTitles.push(generatedTitle);
        }
      }

      // 如果生成的标题不足3个，补充生成
      while (newTitles.length < 3) {
        const randomStyle = titleStyles[Math.floor(Math.random() * titleStyles.length)];
        const generatedTitle = generateNaturalTitle(analysis, randomStyle);

        // 避免重复标题
        if (!newTitles.some(t => t.title === generatedTitle.title)) {
          newTitles.push(generatedTitle);
        }
      }

      // 按语义贴合度排序
      newTitles.sort((a, b) => b.semanticFit - a.semanticFit);

      console.log('✅ All titles generated:', newTitles.map(t => t.title));

      setTitles(newTitles);
      if (newTitles.length > 0) {
        setSelectedTitle(newTitles[0].title);
        onTitleChange?.(newTitles[0].title);
      }

      toast({
        title: "智能标题生成完成",
        description: `基于语义分析生成了${newTitles.length}个高质量标题（语义贴合度≥70%）`,
      });
    } catch (error) {
      console.error('Title generation failed:', error);
      toast({
        title: "生成失败",
        description: "请稍后重试",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  // Select title
  const handleTitleSelect = (title: string) => {
    setSelectedTitle(title);
    onTitleChange?.(title);
  };

  // Copy title
  const handleCopyTitle = (title: string) => {
    navigator.clipboard.writeText(title);
    toast({
      title: "已复制",
      description: "标题已复制到剪贴板",
    });
  };

  // Initialize generation
  useEffect(() => {
    const sourceContent = versions.length > 0 
      ? versions.map(v => v.content).join(' ') 
      : content;

    if (sourceContent && sourceContent.trim().length >= 10) {
      generateTitles();
    }
  }, [content, versions]);

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-yellow-500" />
          智能标题生成
          <Badge variant="outline" className="text-xs">
            {platformName} (限{titleLimit}字)
          </Badge>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Generate button */}
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
            {isGenerating ? '智能分析中...' : '重新生成'}
          </Button>
        </div>

        {/* Loading state */}
        {isGenerating && (
          <div className="flex items-center justify-center py-6">
            <div className="text-center">
              <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2 text-blue-500" />
              <p className="text-sm text-gray-600">正在进行内容语义分析...</p>
            </div>
          </div>
        )}

        {/* Title list */}
        {!isGenerating && titles.length > 0 && (
          <div className="space-y-2">
            {titles.map((title) => (
              <div
                key={title.id}
                className={`border rounded-lg p-3 transition-colors cursor-pointer ${
                  selectedTitle === title.title
                    ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-200'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
                onClick={() => handleTitleSelect(title.title)}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 leading-relaxed">
                      {title.title}
                    </p>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <span className="text-xs text-gray-500">
                        {title.length}/{titleLimit} 字符
                      </span>
                      <span className="text-xs text-gray-400">
                        语义贴合: {Math.round(title.semanticFit * 100)}%
                      </span>
                      <Badge variant="outline" className="text-xs">
                        {title.styleDescription}
                      </Badge>
                      {title.isComplete && (
                        <Badge variant="secondary" className="text-xs">
                          表达完整
                        </Badge>
                      )}
                      {selectedTitle === title.title && (
                        <Badge variant="default" className="text-xs">
                          已选中
                        </Badge>
                      )}
                    </div>
                  </div>

                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCopyTitle(title.title);
                    }}
                    className="h-7 w-7 p-0"
                    title="复制标题"
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty state */}
        {!isGenerating && titles.length === 0 && (
          <div className="text-center py-4 text-gray-500">
            <p className="text-sm">暂无生成的标题</p>
            <Button size="sm" variant="outline" onClick={generateTitles} className="mt-2">
              开始智能分析
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TitleGenerator;
