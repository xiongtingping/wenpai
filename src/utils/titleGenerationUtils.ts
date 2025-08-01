/**
 * 🧠 标题生成工具函数集合
 * 
 * 按照 Augment Prompt 规范实现的标准化工具函数
 * 包含内容预处理、评分过滤、筛选过滤等模块
 */

import type { ContentVersion } from '@/ai/types';

/**
 * 📦 内容预处理模块（按规范）
 */
export const getSourceContent = (versions: ContentVersion[], content: string): string => {
  return versions.length > 0 
    ? versions.map(v => v.content).join('\n\n')
    : content;
};

/**
 * 📊 语义贴合度评分计算（按规范建议公式）
 */
export const calculateSemanticFit = (
  title: string, 
  entities: string[], 
  mainTopic: string, 
  coreWords: string[]
): number => {
  let semanticScore = 0.5; // 基础分

  // 基于核心实体匹配
  const entityMatches = entities.filter(entity => title.includes(entity));
  semanticScore += (entityMatches.length / Math.max(entities.length, 1)) * 0.3;

  // 基于主题词匹配
  if (title.includes(mainTopic)) {
    semanticScore += 0.2;
  }

  // 基于关键词重合度
  const titleWords = title.split('');
  const commonWords = titleWords.filter(word => coreWords.includes(word));
  semanticScore += (commonWords.length / Math.max(titleWords.length, 1)) * 0.2;

  return Math.min(0.95, semanticScore);
};

/**
 * 🎯 情绪吸引力评分（按规范关键词参考）
 */
export const calculateEmotionalScore = (title: string): number => {
  // 按规范的情绪关键词
  const emotionalKeywords = [
    '惊到', '太好用', '救命', '惊艳', '出乎意料', 
    '涨粉', '效率翻倍', '没想到', '真的', '超出预期', '相见恨晚'
  ];
  
  const questionWords = ['为什么', '如何', '真的吗', '怎么样'];
  const resultWords = ['后', '让我', '帮我', '效果', '提升', '翻倍'];

  let emotionalScore = 0.3; // 基础分

  // 情绪关键词匹配
  const emotionalMatches = emotionalKeywords.filter(word => title.includes(word));
  emotionalScore += (emotionalMatches.length > 0 ? 0.4 : 0);

  // 提问引导词匹配
  const questionMatches = questionWords.filter(word => title.includes(word));
  emotionalScore += (questionMatches.length > 0 ? 0.2 : 0);

  // 结果导向词匹配
  const resultMatches = resultWords.filter(word => title.includes(word));
  emotionalScore += (resultMatches.length > 0 ? 0.1 : 0);

  return Math.min(0.95, emotionalScore);
};

/**
 * 🔍 筛选过滤模块（按规范）
 */
export const isValidTitleForPlatform = (
  title: string, 
  platformId: string, 
  platformLimits: Record<string, number>
): boolean => {
  const titleLimit = platformLimits[platformId] || platformLimits.default;
  const minLength = Math.max(8, Math.floor(titleLimit * 0.7));

  return title.length >= minLength && 
         title.length <= titleLimit && 
         title.trim().length > 0 &&
         !title.includes('...') &&
         !title.includes('undefined');
};

/**
 * 📈 综合质量评分（按规范权重）
 */
export const calculateOverallScore = (
  semanticFit: number,
  emotionalScore: number,
  diversityScore: number,
  utilizationScore: number,
  weights = {
    semanticSimilarity: 0.5,    // 50% - 按规范提升
    emotionalAttraction: 0.3,   // 30%
    structuralDiversity: 0.15,  // 15%
    characterUtilization: 0.05  // 5%
  }
): number => {
  return semanticFit * weights.semanticSimilarity +
         emotionalScore * weights.emotionalAttraction +
         diversityScore * weights.structuralDiversity +
         utilizationScore * weights.characterUtilization;
};

/**
 * 🎨 标题风格识别
 */
export const identifyTitleStyle = (title: string): string => {
  if (title.includes('我用') && title.includes('后')) return '🎯 结果导向型';
  if (title.includes('为什么') || title.includes('如何')) return '🤔 提问引导型';
  if (title.includes('功能') || title.includes('解析') || title.includes('对比')) return '📘 专业理性型';
  if (title.includes('我的') || title.includes('心得') || title.includes('体验')) return '💡 经验总结型';
  if (title.includes('太好用') || title.includes('救命') || title.includes('惊艳')) return '📣 情绪钩子型';
  return '🎯 结果导向型'; // 默认
};

/**
 * 🧹 标题清理和标准化
 */
export const cleanAndNormalizeTitle = (title: string): string => {
  return title
    .trim()
    .replace(/\s+/g, '') // 移除多余空格
    .replace(/[！]{2,}/g, '！') // 标准化感叹号
    .replace(/[？]{2,}/g, '？') // 标准化问号
    .replace(/[。]{2,}/g, '。') // 标准化句号
    .replace(/undefined/g, '') // 移除undefined
    .replace(/null/g, '') // 移除null
    .trim();
};

/**
 * 📊 标题质量检查（按规范标准）
 */
export const checkTitleQuality = (
  title: string,
  semanticFit: number,
  platformId: string,
  platformLimits: Record<string, number>
): {
  isQualified: boolean;
  issues: string[];
  suggestions: string[];
} => {
  const issues: string[] = [];
  const suggestions: string[] = [];

  // 语义贴合度检查
  if (semanticFit < 0.75) {
    issues.push('语义贴合度不足75%');
    suggestions.push('增强与原文内容的关联性');
  }

  // 长度检查
  if (!isValidTitleForPlatform(title, platformId, platformLimits)) {
    issues.push('标题长度不符合平台要求');
    suggestions.push('调整标题长度以符合平台限制');
  }

  // 内容检查
  if (title.includes('undefined') || title.includes('null')) {
    issues.push('标题包含无效内容');
    suggestions.push('清理标题中的无效字符');
  }

  // 空泛检查
  const genericWords = ['AI真强', '神器推荐', '这个工具', '很好用'];
  if (genericWords.some(word => title.includes(word))) {
    issues.push('标题过于空泛');
    suggestions.push('使用具体的产品名称和明确价值主张');
  }

  return {
    isQualified: issues.length === 0,
    issues,
    suggestions
  };
};

/**
 * 🔄 标题去重和多样性检查
 */
export const ensureTitleDiversity = (titles: string[]): string[] => {
  const uniqueTitles: string[] = [];
  const seenPatterns = new Set<string>();

  for (const title of titles) {
    // 提取结构模式
    const pattern = title
      .replace(/[\u4e00-\u9fa5A-Za-z0-9]+/g, 'X') // 替换具体词汇为X
      .replace(/\d+/g, 'N'); // 替换数字为N

    if (!seenPatterns.has(pattern)) {
      seenPatterns.add(pattern);
      uniqueTitles.push(title);
    }
  }

  return uniqueTitles;
};

/**
 * 📝 生成标题摘要信息
 */
export const generateTitleSummary = (
  title: string,
  analysis: any,
  scores: any
): {
  reasoning: string;
  extractedContent: string;
  qualityIndicators: string[];
} => {
  const reasoning = `基于${analysis.entities[0] || analysis.mainTopic}的${analysis.tone}内容生成`;
  const extractedContent = analysis.coreMessage?.substring(0, 50) + 
    (analysis.coreMessage?.length > 50 ? '...' : '') || '内容摘要';
  
  const qualityIndicators: string[] = [];
  if (scores.semanticFit >= 0.8) qualityIndicators.push('高语义贴合');
  if (scores.emotionalScore >= 0.8) qualityIndicators.push('强情绪吸引');
  if (scores.diversityScore >= 0.8) qualityIndicators.push('结构多样');
  if (scores.utilizationScore >= 0.8) qualityIndicators.push('字符优化');

  return {
    reasoning,
    extractedContent,
    qualityIndicators
  };
};

console.log('🧠 标题生成工具函数模块已加载');
