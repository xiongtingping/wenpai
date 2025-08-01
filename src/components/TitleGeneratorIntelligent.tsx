import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Sparkles, RefreshCw, Copy, ThumbsUp, ThumbsDown } from "lucide-react";
import { callAI } from '@/api/ai';
import {
  getTitleGenerationSystemPrompt,
  getTitleGenerationPrompt,
  PLATFORM_LIMITS,
  TITLE_STYLES
} from '@/ai/prompts/titleGeneration';
import type { TitleGenerationResponse, TitleQualityCheck } from '@/ai/types';
import { detectTemplatePatterns, checkDimensionCoverage, checkTitleQuality } from '@/utils/titleGenerationUtils';

// 使用统一的平台限制配置（从AI prompt系统导入）
const PLATFORM_TITLE_LIMITS = PLATFORM_LIMITS;

// 标题质量评估权重配置
const QUALITY_WEIGHTS = {
  semanticSimilarity: 0.4,    // 内容主旨相似度 40%
  emotionalAttraction: 0.3,   // 情绪吸引力评分 30%
  structuralDiversity: 0.2,   // 表达结构多样性 20%
  characterUtilization: 0.1   // 字符利用率 10%
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
  stylePreference?: TitleStyle[]; // 用户偏好的风格类型
  outputCount?: number; // 输出标题数量
  ensureDiversity?: boolean; // 确保多样性
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
  emotionalScore: number; // 情绪吸引力评分
  diversityScore: number; // 结构多样性评分
  utilizationScore: number; // 字符利用率评分
  overallScore: number; // 综合评分
  generationReason: string; // 生成理由
  extractedContent: string; // 提取的内容片段
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
  // 新增强化字段
  coreObjects: string[]; // 核心对象（具体工具名）
  userBenefits: string[]; // 用户收益（具体效果）
  useScenarios: string[]; // 使用场景（具体平台/场景）
  keyActions: string[]; // 关键动作（具体操作）
  quantifiedEffects: string[]; // 量化效果（具体数据）
  userPainPoints: string[]; // 用户痛点（具体问题）
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
  onTitleChange,
  stylePreference = [],
  outputCount = 5,
  ensureDiversity = true
}) => {
  const [titles, setTitles] = useState<GeneratedTitle[]>([]);
  const [selectedTitle, setSelectedTitle] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [titleFeedback, setTitleFeedback] = useState<Record<string, 'like' | 'dislike'>>({});
  const { toast } = useToast();

  // 🔄 标准化内容来源获取函数（符合规范）
  const getSourceContent = (): string => {
    return versions.length > 0
      ? versions.map(v => v.content).join('\n\n')
      : content;
  };

  // 🔄 平台切换触发机制（按规范优化）
  useEffect(() => {
    console.log(`🔄 平台切换触发: ${platformId} (${platformName})`);

    const currentContent = getSourceContent();

    // 检查是否需要重新生成标题（按规范逻辑）
    const needsRegeneration = titles.length === 0 ||
      titles.some(title => title.platform !== platformId) ||
      currentContent.trim().length < 10;

    if (needsRegeneration && currentContent.trim().length >= 10) {
      console.log(`🎯 平台${platformId}需要重新生成标题`);
      // 防抖延迟300ms（按规范建议）
      const timer = setTimeout(() => {
        generateTitles();
      }, 300);
      return () => clearTimeout(timer);
    } else if (titles.length > 0) {
      // 更新现有标题的平台信息
      setTitles(prevTitles =>
        prevTitles.map(title => ({
          ...title,
          platform: platformId,
          utilizationScore: title.length / titleLimit
        }))
      );
    }
  }, [platformId, platformName]);

  // 📝 内容变化首轮触发（按规范优化）
  useEffect(() => {
    const currentContent = getSourceContent();

    if (currentContent.trim().length >= 10 && titles.length === 0) {
      console.log(`📝 内容变化首轮触发，为平台${platformId}生成标题`);
      // 防抖延迟500ms（按规范建议）
      const timer = setTimeout(() => {
        generateTitles();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [content, versions, platformId]);

  const titleLimit = PLATFORM_TITLE_LIMITS[platformId] || 25;
  const minTitleLength = Math.max(8, Math.floor(titleLimit * 0.7)); // 最短不少于8字，建议≥平台限制的70%

  // 平台切换时更新字符限制
  useEffect(() => {
    console.log(`📏 平台${platformId}字符限制: ${titleLimit}字`);

    // 如果已有标题，重新计算字符利用率
    if (titles.length > 0) {
      setTitles(prevTitles =>
        prevTitles.map(title => {
          const newUtilizationScore = title.length / titleLimit;
          const newOverallScore =
            title.semanticFit * QUALITY_WEIGHTS.semanticSimilarity +
            title.emotionalScore * QUALITY_WEIGHTS.emotionalAttraction +
            title.diversityScore * QUALITY_WEIGHTS.structuralDiversity +
            newUtilizationScore * QUALITY_WEIGHTS.characterUtilization;

          return {
            ...title,
            platform: platformId,
            utilizationScore: newUtilizationScore,
            overallScore: newOverallScore
          };
        })
      );
    }
  }, [titleLimit, platformId]); // 监听字符限制变化

  // 标题风格配置 - V2优化版（符合新Prompt规范）
  const titleStyles: Record<TitleStyle, TitleStyleConfig> = {
    'result-oriented': {
      name: '🎯 结果导向型',
      description: '强调效果和结果，具备钩子效应',
      minLength: 10,
      patterns: ['我用{tool}后{result}，真的惊到我了', '{tool}让我{result}', '用{tool}{result}，效果超预期']
    },
    'question-guided': {
      name: '🤔 提问引导型',
      description: '通过问题引发思考，激发点击欲望',
      minLength: 8,
      patterns: ['为什么大家都在用{tool}', '{tool}真的{effect}吗', '如何用{tool}{action}']
    },
    'professional': {
      name: '📘 专业理性型',
      description: '客观专业的表达，信息密度高',
      minLength: 10,
      patterns: ['{tool}功能深度解析', '{topic}优劣对比', '{field}实用指南']
    },
    'experience-based': {
      name: '💡 经验总结型',
      description: '个人体验和总结，实用性强',
      minLength: 9,
      patterns: ['我的{tool}{number}大技巧', '{tool}实测心得', '用{tool}的{number}个感受']
    },
    'emotional-trigger': {
      name: '📣 情绪钩子型',
      description: '激发情感共鸣，强吸引力',
      minLength: 8,
      patterns: ['太好用了！{tool}简直救命', '{tool}让我惊艳了', '没想到{tool}这么强']
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

    // 🔧 新增强化分析（修复语义不完整问题）
    const coreObjects = extractCoreObjects(cleanText);
    const userBenefits = extractUserBenefits(cleanText);
    const useScenarios = extractUseScenarios(cleanText);
    const keyActions = extractKeyActions(cleanText);
    const quantifiedEffects = extractQuantifiedEffects(cleanText);
    const userPainPoints = extractUserPainPoints(cleanText);

    const analysis = {
      mainTopic,
      keyPoints,
      valueProposition,
      tone,
      entities,
      actionWords,
      semanticSimilarity,
      contentLength: cleanText.length,
      coreMessage,
      // 新增强化字段
      coreObjects,
      userBenefits,
      useScenarios,
      keyActions,
      quantifiedEffects,
      userPainPoints
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

  // 🔧 新增强化分析函数（修复语义不完整问题）

  // 提取核心对象（具体工具名、产品名）
  const extractCoreObjects = (text: string): string[] => {
    const objects: string[] = [];

    // 匹配具体工具名
    const toolPatterns = [
      /([^\s]{2,8}(?:AI|GPT|工具|助手|平台|系统|软件|应用))/g,
      /(文派|ChatGPT|Claude|Midjourney|Figma|Notion|飞书|钉钉)/g,
      /([^\s]{2,6}(?:生成器|适配器|编辑器|创作器))/g
    ];

    toolPatterns.forEach(pattern => {
      const matches = text.match(pattern) || [];
      objects.push(...matches);
    });

    return [...new Set(objects)].filter(obj => obj.length >= 2 && obj.length <= 10);
  };

  // 提取用户收益（具体效果、价值）
  const extractUserBenefits = (text: string): string[] => {
    const benefits: string[] = [];

    // 匹配效果描述
    const benefitPatterns = [
      /(?:节省|提升|增加|减少|优化)([^\s]{2,8})/g,
      /([^\s]{2,8})(?:翻倍|倍增|提升|增长)/g,
      /(\d+%?)(?:的?(?:时间|效率|质量|速度))/g,
      /(一键|自动|智能|快速)([^\s]{2,6})/g
    ];

    benefitPatterns.forEach(pattern => {
      const matches = text.match(pattern) || [];
      benefits.push(...matches);
    });

    return [...new Set(benefits)].filter(benefit => benefit.length >= 2);
  };

  // 提取使用场景（具体平台、场景）
  const extractUseScenarios = (text: string): string[] => {
    const scenarios: string[] = [];

    // 匹配平台和场景
    const scenarioPatterns = [
      /(小红书|微博|抖音|B站|公众号|知乎|朋友圈)/g,
      /([^\s]{2,6}(?:发文|创作|写作|营销|推广))/g,
      /(职场|工作|学习|生活|商务)([^\s]{2,6})/g
    ];

    scenarioPatterns.forEach(pattern => {
      const matches = text.match(pattern) || [];
      scenarios.push(...matches);
    });

    return [...new Set(scenarios)].filter(scenario => scenario.length >= 2);
  };

  // 提取关键动作（具体操作）
  const extractKeyActions = (text: string): string[] => {
    const actions: string[] = [];

    // 匹配动作词
    const actionPatterns = [
      /(一键|自动|智能|批量)([^\s]{2,6})/g,
      /([^\s]{2,6}(?:生成|创建|制作|编辑|修改|优化))/g,
      /(适配|转换|改写|调整|定制)([^\s]{2,6})?/g
    ];

    actionPatterns.forEach(pattern => {
      const matches = text.match(pattern) || [];
      actions.push(...matches);
    });

    return [...new Set(actions)].filter(action => action.length >= 2);
  };

  // 提取量化效果（具体数据）
  const extractQuantifiedEffects = (text: string): string[] => {
    const effects: string[] = [];

    // 匹配数字和效果
    const effectPatterns = [
      /(\d+(?:\.\d+)?[%倍]?)(?:的?(?:时间|效率|质量|速度|提升|增长))/g,
      /(?:节省|提升|增加)(\d+(?:\.\d+)?[%倍]?)/g,
      /(\d+(?:分钟|小时|天|秒))(?:内|完成)/g
    ];

    effectPatterns.forEach(pattern => {
      const matches = text.match(pattern) || [];
      effects.push(...matches);
    });

    return [...new Set(effects)].filter(effect => effect.length >= 1);
  };

  // 提取用户痛点（具体问题）
  const extractUserPainPoints = (text: string): string[] => {
    const painPoints: string[] = [];

    // 匹配痛点描述
    const painPatterns = [
      /([^\s]{2,6}(?:太累|很累|麻烦|困难|复杂))/g,
      /([^\s]{2,6}(?:不一致|不统一|不匹配))/g,
      /(效率低|速度慢|耗时长|浪费时间)/g,
      /(重复|繁琐|机械|无聊)([^\s]{2,6})/g,
      /([^\s]{2,6}(?:问题|痛点|难点|瓶颈))/g,
      /(缺少|缺乏|没有)([^\s]{2,6})/g
    ];

    painPatterns.forEach(pattern => {
      const matches = text.match(pattern) || [];
      painPoints.push(...matches);
    });

    return [...new Set(painPoints)].filter(pain => pain.length >= 2);
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

    // 🚫 模板化行为检测
    const templateCheck = detectTemplatePatterns(title);
    if (templateCheck.isTemplatePattern) {
      console.warn(`⚠️ 检测到模板化行为:`, templateCheck.detectedPatterns);
      // 如果检测到模板化，重新生成
      return generateNaturalTitle(analysis, style); // 递归重新生成
    }

    // ✅ 维度覆盖检查
    const dimensionCheck = checkDimensionCoverage(
      title,
      analysis.coreObjects,
      analysis.useScenarios,
      analysis.userPainPoints
    );

    if (!dimensionCheck.isQualified) {
      console.warn(`⚠️ 维度覆盖不足:`, dimensionCheck);
      // 如果维度覆盖不足，重新生成
      return generateNaturalTitle(analysis, style); // 递归重新生成
    }

    // 计算综合评分
    const scores = calculateTitleScores(title, analysis);

    // 生成理由和提取内容
    const generationReason = `基于${primaryElement}的${tone}内容，采用${styleDescription}风格生成，覆盖维度：${dimensionCheck.coveredDimensions.join('、')}`;
    const extractedContent = coreMessage.substring(0, 50) + (coreMessage.length > 50 ? '...' : '');

    const generatedTitle: GeneratedTitle = {
      id: `${style}-${Date.now()}`,
      title,
      length: title.length,
      style,
      confidence: semanticSimilarity,
      semanticFit: scores.semanticFit,
      platform: platformId,
      isComplete: isCompleteTitle(title),
      styleDescription,
      emotionalScore: scores.emotionalScore,
      diversityScore: scores.diversityScore,
      utilizationScore: scores.utilizationScore,
      overallScore: scores.overallScore,
      generationReason,
      extractedContent
    };

    console.log(`✅ 生成${styleDescription}标题:`, generatedTitle);
    return generatedTitle;
  };

  // 🎯 结果导向型标题生成 - 强化避免偏离主旨
  const generateResultOrientedTitle = (primary: string, secondary: string, analysis: ContentAnalysis): string => {
    const { valueProposition, userBenefits, quantifiedEffects, useScenarios, coreObjects, userPainPoints } = analysis;

    // 优先使用具体的核心对象
    const mainObject = coreObjects.length > 0 ? coreObjects[0] : primary;

    // 优先使用具体的用户收益
    const specificBenefit = userBenefits.length > 0 ? userBenefits[0] : valueProposition;

    // 优先使用量化效果
    const quantifiedEffect = quantifiedEffects.length > 0 ? quantifiedEffects[0] : '';

    // 优先使用具体场景
    const scenario = useScenarios.length > 0 ? useScenarios[0] : '';

    // 优先使用用户痛点
    const painPoint = userPainPoints.length > 0 ? userPainPoints[0] : '';

    // 🔧 强制覆盖至少2个维度（核心对象+场景+痛点）
    if (mainObject && scenario && specificBenefit) {
      return `${mainObject}解决${scenario}${specificBenefit}问题`;
    }

    if (mainObject && painPoint && quantifiedEffect) {
      return `${mainObject}解决${painPoint}，${quantifiedEffect}`;
    }

    if (scenario && quantifiedEffect && specificBenefit) {
      return `用${mainObject}做${scenario}，${specificBenefit}${quantifiedEffect}`;
    }

    if (mainObject && specificBenefit && quantifiedEffect) {
      return `${mainObject}帮我${specificBenefit}${quantifiedEffect}`;
    }

    // 确保至少包含核心对象+一个具体维度
    if (scenario && specificBenefit) {
      return `用${mainObject}做${scenario}，${specificBenefit}`;
    }

    // 兜底模板（确保语义完整且具体）
    const fallbackPatterns = [
      `${mainObject}提升了我的${scenario || '工作'}效率`,
      `用${mainObject}后${scenario || '工作'}变轻松了`,
      `${mainObject}帮我解决了${painPoint || '效率'}问题`
    ];

    return fallbackPatterns[Math.floor(Math.random() * fallbackPatterns.length)];
  };

  // 🤔 提问引导型标题生成 - 修复语义完整性
  const generateQuestionGuidedTitle = (primary: string, secondary: string, analysis: ContentAnalysis): string => {
    const { coreObjects, useScenarios, userBenefits } = analysis;

    const mainObject = coreObjects.length > 0 ? coreObjects[0] : primary;
    const scenario = useScenarios.length > 0 ? useScenarios[0] : '';
    const benefit = userBenefits.length > 0 ? userBenefits[0] : '';

    // 🔧 结合具体场景和收益的提问
    if (scenario && benefit) {
      return `为什么用${mainObject}做${scenario}能${benefit}`;
    }

    if (scenario) {
      return `如何用${mainObject}优化${scenario}`;
    }

    if (benefit) {
      return `${mainObject}真的能${benefit}吗`;
    }

    // 兜底模板
    const fallbackPatterns = [
      `为什么大家都在用${mainObject}`,
      `${mainObject}真的好用吗`,
      `如何用${mainObject}提升效率`,
      `${mainObject}值得入手吗`
    ];

    return fallbackPatterns[Math.floor(Math.random() * fallbackPatterns.length)];
  };

  // 📘 专业理性型标题生成 - 修复语义完整性
  const generateProfessionalTitle = (primary: string, secondary: string, analysis: ContentAnalysis): string => {
    const { coreObjects, useScenarios, keyActions } = analysis;

    const mainObject = coreObjects.length > 0 ? coreObjects[0] : primary;
    const scenario = useScenarios.length > 0 ? useScenarios[0] : '';
    const action = keyActions.length > 0 ? keyActions[0] : '';

    // 🔧 结合具体场景和功能的专业表达
    if (scenario && action) {
      return `${mainObject}${scenario}${action}功能解析`;
    }

    if (scenario) {
      return `${mainObject}在${scenario}中的应用指南`;
    }

    if (action) {
      return `${mainObject}${action}功能详解`;
    }

    // 兜底模板
    const fallbackPatterns = [
      `${mainObject}功能深度解析`,
      `${mainObject}使用指南详解`,
      `${mainObject}实用技巧汇总`,
      `${mainObject}完整使用教程`
    ];

    return fallbackPatterns[Math.floor(Math.random() * fallbackPatterns.length)];
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

  // 📣 情绪钩子型标题生成 - V2优化版
  const generateEmotionalTriggerTitle = (primary: string, secondary: string, analysis: ContentAnalysis): string => {
    const patterns = [
      `太好用了！${primary}简直救命`,
      `${primary}让我惊艳了，必须安利`,
      `没想到${primary}这么强大`,
      `${primary}真的太棒了，爱了`,
      `${primary}超出我的预期太多`,
      `${primary}让我相见恨晚啊`,
      `${primary}真是神器，推荐给大家`
    ];

    return patterns[Math.floor(Math.random() * patterns.length)];
  };

  // 确保标题质量（符合Prompt文档要求 + 修复语义完整性）
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

    // 🔧 4. 语义完整性检查（新增）
    finalTitle = ensureSemanticCompleteness(finalTitle);

    return finalTitle;
  };

  // 🔧 确保语义完整性（修复主谓搭配问题）
  const ensureSemanticCompleteness = (title: string): string => {
    let fixedTitle = title;

    // 检查"我用X后Y"模式的完整性
    if (title.includes('我用') && title.includes('后')) {
      const afterMatch = title.match(/我用([^后]+)后(.+)/);
      if (afterMatch) {
        const tool = afterMatch[1];
        const effect = afterMatch[2];

        // 如果效果部分不完整（如只有数字或符号）
        if (/^[\d%🚀！\s]*$/.test(effect)) {
          fixedTitle = `我用${tool}后效率提升了`;
        }
      }
    }

    // 检查量化表达的完整性
    if (/\d+%?[🚀！]*$/.test(title)) {
      if (!title.includes('效率') && !title.includes('时间') && !title.includes('质量')) {
        fixedTitle = title.replace(/(\d+%?)[🚀！]*$/, '$1效率');
      }
    }

    // 移除无意义的符号
    fixedTitle = fixedTitle.replace(/[🚀]{2,}/g, '').replace(/[！]{3,}/g, '！');

    return fixedTitle;
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

  // 计算标题综合评分 - V2优化版（按权重配置）
  const calculateTitleScores = (title: string, analysis: ContentAnalysis, existingTitles: GeneratedTitle[] = []) => {
    const { entities, mainTopic, coreMessage } = analysis;

    // 1. 内容主旨相似度 (40%)
    let semanticScore = 0.5;
    entities.forEach(entity => {
      if (title.includes(entity)) semanticScore += 0.2;
    });
    if (title.includes(mainTopic)) semanticScore += 0.15;
    const titleWords = title.split('');
    const coreWords = coreMessage.split('');
    const commonWords = titleWords.filter(word => coreWords.includes(word));
    semanticScore += (commonWords.length / Math.max(titleWords.length, 1)) * 0.15;
    semanticScore = Math.min(0.95, semanticScore);

    // 2. 情绪吸引力评分 (30%) - 按规范优化关键词
    const emotionalKeywords = ['惊到', '太好用', '救命', '惊艳', '出乎意料', '涨粉', '效率翻倍', '没想到', '真的', '超出预期', '相见恨晚'];
    const questionWords = ['为什么', '如何', '真的吗', '怎么样'];
    const resultWords = ['后', '让我', '帮我', '效果', '提升', '翻倍'];

    let emotionalScore = 0.3;
    if (emotionalKeywords.some(word => title.includes(word))) emotionalScore += 0.4;
    if (questionWords.some(word => title.includes(word))) emotionalScore += 0.2;
    if (resultWords.some(word => title.includes(word))) emotionalScore += 0.1;
    emotionalScore = Math.min(0.95, emotionalScore);

    // 3. 表达结构多样性 (20%)
    let diversityScore = 0.8;
    existingTitles.forEach(existing => {
      const similarity = calculateStructuralSimilarity(title, existing.title);
      if (similarity > 0.7) diversityScore -= 0.2;
    });
    diversityScore = Math.max(0.1, diversityScore);

    // 4. 字符利用率 (10%)
    const utilizationScore = Math.min(0.95, title.length / titleLimit);

    // 综合评分
    const overallScore =
      semanticScore * QUALITY_WEIGHTS.semanticSimilarity +
      emotionalScore * QUALITY_WEIGHTS.emotionalAttraction +
      diversityScore * QUALITY_WEIGHTS.structuralDiversity +
      utilizationScore * QUALITY_WEIGHTS.characterUtilization;

    return {
      semanticFit: semanticScore,
      emotionalScore,
      diversityScore,
      utilizationScore,
      overallScore
    };
  };

  // 计算结构相似度
  const calculateStructuralSimilarity = (title1: string, title2: string): number => {
    const patterns1 = extractStructuralPatterns(title1);
    const patterns2 = extractStructuralPatterns(title2);

    let matchCount = 0;
    patterns1.forEach(pattern => {
      if (patterns2.includes(pattern)) matchCount++;
    });

    return matchCount / Math.max(patterns1.length, patterns2.length, 1);
  };

  // 提取结构模式
  const extractStructuralPatterns = (title: string): string[] => {
    const patterns: string[] = [];

    if (title.includes('我用') && title.includes('后')) patterns.push('我用X后Y');
    if (title.includes('为什么')) patterns.push('为什么X');
    if (title.includes('如何')) patterns.push('如何X');
    if (title.includes('太好用了')) patterns.push('太好用了X');
    if (title.includes('让我')) patterns.push('X让我Y');
    if (title.includes('真的')) patterns.push('X真的Y');

    return patterns;
  };

  // 🤖 AI模式：标题生成主函数（按规范优化）
  const generateTitles = async () => {
    setIsGenerating(true);

    try {
      console.log('🚀 开始标题生成流程（AI优先+本地回退模式）');

      // Step 1: 标准化内容来源获取（按规范）
      const sourceContent = getSourceContent();

      if (!sourceContent || sourceContent.trim().length < 10) {
        toast({
          title: "内容不足",
          description: "请提供更多内容以生成标题（最少10字符）",
          variant: "destructive"
        });
        return;
      }

      console.log(`📝 内容来源: ${sourceContent.length}字符，平台: ${platformId}`);

      // Step 2: AI模式优先尝试
      await attemptAIGeneration(sourceContent);

    } catch (error) {
      console.error('标题生成流程失败:', error);
      toast({
        title: "生成失败",
        description: "标题生成失败，请稍后重试",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  // 🤖 AI模式：尝试AI生成（按规范Step 1-4）
  const attemptAIGeneration = async (sourceContent: string) => {
    try {

      // Step 1: 构建Prompt（按规范）
      console.log('🧠 Step 1: 构建AI Prompt');
      const systemPrompt = getTitleGenerationSystemPrompt();
      const userPrompt = getTitleGenerationPrompt({
        content: sourceContent,
        versions,
        platform: platformId,
        stylePreference,
        outputCount,
        ensureDiversity
      });

      // Step 2: 调用AI（按规范）
      console.log(`🤖 Step 2: 调用GPT-4 API (平台: ${platformId})`);
      const aiResponse = await callAI({
        prompt: userPrompt,
        systemPrompt: systemPrompt,
        model: 'gpt-4',
        temperature: 0.7,
        maxTokens: 2000
      });

      if (!aiResponse.success || !aiResponse.content) {
        throw new Error(aiResponse.error || 'AI调用失败');
      }

      // Step 3: 解析AI响应格式（按规范推荐结构）
      console.log('📊 Step 3: 解析AI响应JSON格式');
      let aiResult: TitleGenerationResponse;
      try {
        const jsonMatch = aiResponse.content.match(/```json\s*([\s\S]*?)\s*```/);
        const jsonContent = jsonMatch ? jsonMatch[1] : aiResponse.content;
        aiResult = JSON.parse(jsonContent);

        // 验证响应结构
        if (!aiResult.contentAnalysis || !aiResult.titles || !Array.isArray(aiResult.titles)) {
          throw new Error('AI响应结构不完整');
        }
      } catch (parseError) {
        console.error('AI响应解析失败:', parseError);
        throw new Error('AI响应格式错误，请重试');
      }

      // Step 4: 标题过滤逻辑（按规范）
      console.log('🔍 Step 4: 应用质量过滤逻辑');
      const newTitles: GeneratedTitle[] = aiResult.titles.map((titleData, index) => ({
        id: `ai-${Date.now()}-${index}`,
        title: titleData.title,
        length: titleData.length,
        style: titleData.style.includes('🎯') ? 'result-oriented' :
               titleData.style.includes('🤔') ? 'question-guided' :
               titleData.style.includes('📘') ? 'professional' :
               titleData.style.includes('💡') ? 'experience-based' :
               titleData.style.includes('📣') ? 'emotional-trigger' : 'result-oriented',
        confidence: titleData.semanticFit,
        semanticFit: titleData.semanticFit,
        platform: platformId,
        isComplete: titleData.title.length >= 8 && !titleData.title.includes('...'),
        styleDescription: titleData.style,
        emotionalScore: titleData.semanticFit > 0.8 ? 0.9 : 0.7,
        diversityScore: 0.8,
        utilizationScore: titleData.length / titleLimit,
        overallScore: titleData.semanticFit,
        generationReason: titleData.reasoning,
        extractedContent: aiResult.contentAnalysis.mainTheme
      }));

      // 按规范过滤：semanticFit >= 0.75 && isValidLength
      const qualifiedTitles = newTitles.filter(title =>
        title.semanticFit >= 0.75 && isTitleValidForPlatform(title)
      );

      if (qualifiedTitles.length === 0) {
        throw new Error('AI生成的标题质量不达标，切换到本地模式');
      }

      console.log(`✅ AI模式成功: 平台${platformId}生成${qualifiedTitles.length}个标题`);
      console.log('📊 内容分析结果:', aiResult.contentAnalysis);

      // 设置最终结果
      setTitles(qualifiedTitles);
      if (qualifiedTitles.length > 0) {
        setSelectedTitle(qualifiedTitles[0].title);
        onTitleChange?.(qualifiedTitles[0].title);
      }

      toast({
        title: `${platformName} AI标题生成完成`,
        description: `生成了${qualifiedTitles.length}个高质量标题（语义贴合度≥75%）`,
      });

    } catch (error) {
      console.error('AI模式失败:', error);
      console.log('🔄 切换到本地回退模式...');
      await attemptLocalGeneration(sourceContent);
    }
  };

  // 🧠 本地模式：回退标题生成逻辑（按规范优化）
  const attemptLocalGeneration = async (sourceContent: string) => {
    try {
      console.log('🧠 本地模式启动：内容分析+模板生成策略');

      // Step 1: 内容语义分析（按规范）
      console.log('📊 Step 1: 本地内容语义分析');
      const analysis = analyzeContent(sourceContent);
      console.log('分析结果:', {
        mainTopic: analysis.mainTopic,
        entities: analysis.entities,
        valueProposition: analysis.valueProposition,
        tone: analysis.tone
      });

      // Step 2: 五种风格生成逻辑（按规范）
      console.log('🎨 Step 2: 五种标准风格生成');
      const allStyles: TitleStyle[] = ['result-oriented', 'question-guided', 'professional', 'experience-based', 'emotional-trigger'];
      const newTitles: GeneratedTitle[] = [];

      for (const style of allStyles.slice(0, outputCount)) {
        const generatedTitle = generateNaturalTitle(analysis, style);

        // Step 3: 本地质量评分（按规范）
        const updatedScores = calculateTitleScores(generatedTitle.title, analysis, newTitles);
        generatedTitle.diversityScore = updatedScores.diversityScore;
        generatedTitle.overallScore = updatedScores.overallScore;

        // 按规范过滤：semanticFit >= 0.7（本地模式稍低于AI的0.75）
        if (generatedTitle.semanticFit >= 0.7 &&
            generatedTitle.isComplete &&
            isTitleValidForPlatform(generatedTitle)) {
          newTitles.push(generatedTitle);
        }
      }

      // 按综合评分排序
      newTitles.sort((a, b) => b.overallScore - a.overallScore);

      if (newTitles.length === 0) {
        throw new Error('本地模式也无法生成合格标题');
      }

      console.log(`✅ 本地模式成功: 生成${newTitles.length}个标题`);

      setTitles(newTitles);
      if (newTitles.length > 0) {
        setSelectedTitle(newTitles[0].title);
        onTitleChange?.(newTitles[0].title);
      }

      toast({
        title: `${platformName} 本地模式完成`,
        description: `生成了${newTitles.length}个标题（本地算法回退）`,
      });

    } catch (error) {
      console.error('本地模式也失败:', error);
      toast({
        title: "生成失败",
        description: "AI和本地模式都失败，请检查内容后重试",
        variant: "destructive"
      });
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

  // Handle title feedback
  const handleTitleFeedback = (titleId: string, feedback: 'like' | 'dislike') => {
    setTitleFeedback(prev => ({
      ...prev,
      [titleId]: feedback
    }));

    console.log(`📊 标题反馈收集:`, {
      titleId,
      feedback,
      title: titles.find(t => t.id === titleId)?.title,
      platform: platformId
    });

    toast({
      title: feedback === 'like' ? "感谢反馈" : "已记录反馈",
      description: feedback === 'like' ? "我们会继续优化标题质量" : "我们会改进这类标题的生成",
    });
  };

  // 清理平台切换时的状态
  const resetTitleGeneratorState = () => {
    console.log(`🧹 重置标题生成器状态 (平台: ${platformId})`);
    setTitles([]);
    setSelectedTitle('');
    setTitleFeedback({});
    setIsGenerating(false);
  };

  // 检查标题是否适用于当前平台
  const isTitleValidForPlatform = (title: GeneratedTitle): boolean => {
    return title.platform === platformId &&
           title.length <= titleLimit &&
           title.length >= minTitleLength;
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
            {isGenerating ? `为${platformName}分析中...` : `为${platformName}生成标题`}
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
                        综合评分: {Math.round(title.overallScore * 100)}%
                      </span>
                      <Badge variant="outline" className="text-xs">
                        {title.styleDescription}
                      </Badge>
                      <span className="text-xs text-gray-400" title={`语义贴合:${Math.round(title.semanticFit * 100)}% | 情绪吸引:${Math.round(title.emotionalScore * 100)}% | 结构多样:${Math.round(title.diversityScore * 100)}% | 字符利用:${Math.round(title.utilizationScore * 100)}%`}>
                        详细评分
                      </span>
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

                    {/* 生成理由和内容片段（鼠标悬停显示） */}
                    <div className="text-xs text-gray-400 mt-1" title={`生成理由: ${title.generationReason}\n提取内容: ${title.extractedContent}`}>
                      基于: {title.extractedContent}
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    {/* 反馈按钮 */}
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleTitleFeedback(title.id, 'like');
                      }}
                      className={`h-7 w-7 p-0 ${titleFeedback[title.id] === 'like' ? 'text-green-600 bg-green-50' : ''}`}
                      title="👍 这个标题很好"
                    >
                      <ThumbsUp className="h-3 w-3" />
                    </Button>

                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleTitleFeedback(title.id, 'dislike');
                      }}
                      className={`h-7 w-7 p-0 ${titleFeedback[title.id] === 'dislike' ? 'text-red-600 bg-red-50' : ''}`}
                      title="👎 这个标题需要改进"
                    >
                      <ThumbsDown className="h-3 w-3" />
                    </Button>

                    {/* 复制按钮 */}
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
