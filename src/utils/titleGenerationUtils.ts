/**
 * 🧠 标题生成工具函数集合
 *
 * 按照 Augment Prompt 规范实现的标准化工具函数
 * 包含内容预处理、评分过滤、筛选过滤等模块
 */

// import i18n from '@/i18n'; // 改为动态导入避免TDZ
import type { ContentVersion } from '@/ai/types';
import { safeTrimTitle } from './safeTrimTitle';
import { getPlatformConfig } from '@/features/titleGeneration/config/titleGeneration.config';

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
 * ✅ V3.2 情绪吸引力评分
 * 🎯 识别是否包含"冲突感、对比感、转变、情绪词"等吸引点
 * @param title 标题
 * @returns 情绪吸引力评分 (0-1)
 */
export const calculateEmotionalAppeal = (title: string): number => {
  let score = 0.3; // 基础分

  // 冲突感关键词 - 强化惊讶和意外
  const conflictWords = ['没想到', '出乎意料', '竟然', '居然', '意外', '没想到', '没想到'];
  const conflictMatches = conflictWords.filter(word => title.includes(word));
  score += (conflictMatches.length > 0 ? 0.25 : 0);

  // 对比感关键词 - 强化前后对比
  const contrastWords = ['之前', '现在', '从', '到', '比', '更', '最', '原来', '现在'];
  const contrastMatches = contrastWords.filter(word => title.includes(word));
  score += (contrastMatches.length > 0 ? 0.2 : 0);

  // 转变关键词 - 强化效果转变
  const transformationWords = ['改变', '提升', '改善', '优化', '翻倍', '节省', '提升', '改善'];
  const transformationMatches = transformationWords.filter(word => title.includes(word));
  score += (transformationMatches.length > 0 ? 0.2 : 0);

  // 情绪词 - 强化情感表达
  const emotionalWords = [
    '太棒了', '真的', '超预期', '相见恨晚',
    '效率', '效果', '值得', '推荐', '安利', '太爽了', '太惊艳了'
  ];
  const emotionalMatches = emotionalWords.filter(word => title.includes(word));
  score += (emotionalMatches.length > 0 ? 0.25 : 0);

  return Math.min(0.95, score);
};

/**
 * 🔍 筛选过滤模块（按规范）
 */
export const isValidTitleForPlatform = (
  title: string,
  platformId: string,
  platformLimits: Record<string, number>
): boolean => {
  const cfg = getPlatformConfig(platformId as any);
  const titleLimit = cfg.maxLength;
  const minLength = cfg.minLength;

  return title.length >= minLength &&
         title.length <= titleLimit &&
         title.trim().length > 0 &&
         !title.includes('...') &&
         !title.includes('undefined');
};

/**
 * 📈 综合质量评分（按规范权重）
 */
/**
 * ✅ FIXED: 2025-08-02 统一权重配置计算 - V3.3增强版
 * 🎯 使用统一的V3.3权重配置，确保评分一致性，强化语义相关性
 *
 */
export const calculateOverallScore = (
  semanticFit: number,
  emotionalAppeal: number,
  diversityScore: number,
  semanticCompleteness: number,
  characterUtilization: number,
  weights = {
    semanticRelevance: 0.50,        // 50% - 主旨拟合度
    emotionalAppeal: 0.20,          // 20% - 情绪吸引力
    structuralDiversity: 0.15,      // 15% - 表达结构多样性
    semanticCompleteness: 0.10,     // 10% - 语义完整性
    characterUtilization: 0.05      // 5% - 字符利用率
  }
): number => {
  return semanticFit * weights.semanticRelevance +
         emotionalAppeal * weights.emotionalAppeal +
         diversityScore * weights.structuralDiversity +
         semanticCompleteness * weights.semanticCompleteness +
         characterUtilization * weights.characterUtilization;
};

/**
 * ✅ V3.2 语义完整性评分
 * 🎯 检查句末是否闭合，语法是否通顺，避免"..."断尾或缺动词
 * @param title 标题
 * @returns 语义完整性评分 (0-1)
 */
export const calculateSemanticCompleteness = (title: string): number => {
  let score = 0.5; // 基础分

  // 检查句末闭合性 - V3.2 强化规则
  const goodEndings = ['了', '！', '？', '。', '吧', '呢', '啊', '哦'];
  const badEndings = [
    '、', '是', '我', '和', '让', '要', '在', '对', '为', '把', '给', '向',
    '从', '到', '由', '被', '得', '着', '过', '了', '吗', '呢', '啊', '哦', '吧',
    '这', '那', '它', '他', '她', '们', '个', '种', '些', '点', '下', '上', '里',
    '外', '前', '左', '右', '中', '间', '边', '面', '方', '向', '位', '处'
  ];

  const lastChar = title[title.length - 1];
  if (goodEndings.includes(lastChar)) {
    score += 0.35; // 句末自然闭合 - 提高权重
  } else if (badEndings.includes(lastChar)) {
    score -= 0.3; // 句末不完整 - 加重惩罚
  }

  // 检查主谓宾结构完整性 - V3.2 强化检查
  const hasSubject = /[我你他她它我们你们他们]/.test(title);
  const hasVerb = /[用做写看学试体验感受发现获得提升改善优化].*[了过]/.test(title) || /[是能会可以].*[的]/.test(title);
  const hasObject = /[工具软件功能方法技巧经验心得效果结果].*[的]/;

  if (hasSubject && hasVerb) {
    score += 0.25; // 有主谓结构 - 提高权重
  }
  if (hasObject) {
    score += 0.15; // 有宾语结构 - 提高权重
  }

  // 检查语法通顺性 - V3.2 扩展模式
  const grammarPatterns = [
    /我用.*后.*/,      // "我用X后Y" 模式
    /为什么.*/,        // "为什么X" 模式
    /如何.*/,          // "如何X" 模式
    /.*让我.*/,        // "X让我Y" 模式
    /.*帮我.*/,        // "X帮我Y" 模式
    /.*真的.*/,        // "X真的Y" 模式
    /.*太.*了/,        // "X太Y了" 模式
    /.*太.*了/,        // "X太Y了" 模式
    /.*太.*了/,        // "X太Y了" 模式
  ];

  const hasGoodGrammar = grammarPatterns.some(pattern => pattern.test(title));
  if (hasGoodGrammar) {
    score += 0.15; // 语法通顺 - 提高权重
  }

  // 避免断尾和省略号 - V3.2 强化检查
  if (title.includes('...') || title.includes('…')) {
    score -= 0.3; // 有省略号表示不完整 - 加重惩罚
  }

  // 检查禁止的残词 - V3.2 新增
  const prohibitedWords = ['文', '工', '图', '说', '表'];
  const hasProhibitedWord = prohibitedWords.some(word => title.endsWith(word));
  if (hasProhibitedWord) {
    score -= 0.4; // 有禁止的残词 - 严重惩罚
  }

  // 检查是否有未完成的句子 - V3.2 扩展检查
  const incompletePatterns = [
    /^[的了用后时]/,   // 以助词开头
    /[，,]$/,          // 以逗号结尾
    /[：:]$/,          // 以冒号结尾
    /[和与及]$/,       // 以连词结尾
    /[的]$/,           // 以"的"结尾
    /[了]$/,           // 以"了"结尾
    /[是]$/,           // 以"是"结尾
    /[我]$/,           // 以"我"结尾
  ];

  const hasIncompletePattern = incompletePatterns.some(pattern => pattern.test(title));
  if (hasIncompletePattern) {
    score -= 0.4; // 句子不完整 - 加重惩罚
  }

  return Math.max(0, Math.min(1, score)); // 确保在 0-1 范围内
};

/**
 * 🎨 标题风格识别
 */
export const identifyTitleStyle = (title: string): string => {
  if (/[?？]$/.test(title) || /^(为什么|如何|怎么)/.test(title)) return '🤔 提问引导型';
  if (/[!！]/.test(title) || /太.*了/.test(title)) return '📣 情绪钩子型';
  return '🎯 结果导向型';
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
 * 🚫 检测模板化行为（避免偏离主旨）
 */
export const detectTemplatePatterns = (title: string): {
  isTemplatePattern: boolean;
  detectedPatterns: string[];
  severity: 'low' | 'medium' | 'high';
} => {
  // 严禁的模板化句型
  const prohibitedPatterns = [
    '写文案神器',
    'AI太好用了，救命',
    '朋友推荐了我这个工具',
    '现在我省了3小时',
    '这个工具拯救了我',
    '效率神器推荐',
    '必须安利给大家',
    'AI神器',
    '救命神器',
    '太好用了',
    '强烈推荐',
    '必须收藏'
  ];

  const detectedPatterns = prohibitedPatterns.filter(pattern => title.includes(pattern));
  const patternCount = detectedPatterns.length;

  return {
    isTemplatePattern: patternCount >= 2, // 超过2处视为偏离主旨
    detectedPatterns,
    severity: patternCount >= 3 ? 'high' : patternCount >= 2 ? 'medium' : 'low'
  };
};

/**
 * ✅ 检查维度覆盖（至少2个维度）
 */
export const checkDimensionCoverage = (
  title: string,
  coreObjects: string[],
  useScenarios: string[],
  userPainPoints: string[]
): {
  coveredDimensions: string[];
  coverageScore: number;
  isQualified: boolean;
} => {
  const coveredDimensions: string[] = [];

  // 检查核心对象覆盖
  if (coreObjects.some(obj => title.includes(obj))) {
    coveredDimensions.push('核心对象');
  }

  // 检查使用场景覆盖
  if (useScenarios.some(scenario => title.includes(scenario))) {
    coveredDimensions.push('使用场景');
  }

  // 检查用户痛点覆盖
  if (userPainPoints.some(pain => title.includes(pain))) {
    coveredDimensions.push('用户痛点');
  }

  const coverageScore = coveredDimensions.length / 3;
  const isQualified = coveredDimensions.length >= 2; // 至少覆盖2个维度

  return {
    coveredDimensions,
    coverageScore,
    isQualified
  };
};

/**
 * 📊 标题质量检查（强化避免偏离主旨）
 */
export const checkTitleQuality = (
  title: string,
  semanticFit: number,
  platformId: string,
  platformLimits: Record<string, number>,
  contentAnalysis?: {
    coreObjects: string[];
    useScenarios: string[];
    userPainPoints: string[];
  }
): {
  isQualified: boolean;
  issues: string[];
  suggestions: string[];
  templateCheck?: any;
  dimensionCheck?: any;
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

  // 🚫 模板化行为检测
  const templateCheck = detectTemplatePatterns(title);
  if (templateCheck.isTemplatePattern) {
    issues.push(`检测到${templateCheck.detectedPatterns.length}个模板化句型`);
    suggestions.push('避免使用通用模板，结合具体产品和场景');
  }

  // ✅ 维度覆盖检查
  let dimensionCheck;
  if (contentAnalysis) {
    dimensionCheck = checkDimensionCoverage(
      title,
      contentAnalysis.coreObjects,
      contentAnalysis.useScenarios,
      contentAnalysis.userPainPoints
    );

    if (!dimensionCheck.isQualified) {
      issues.push('未覆盖足够维度（需至少2个：核心对象、使用场景、用户痛点）');
      suggestions.push('增加具体产品名称、使用场景或痛点描述');
    }
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
    suggestions,
    templateCheck,
    dimensionCheck
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
  const extractedContent = (analysis.coreMessage?.substring(0, 50) + (analysis.coreMessage?.length > 50 ? '...' : '')) || '摘要不可用';

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

/**
 * ✅ FIXED: 2025-08-02 删除重复实现，统一使用独立的safeTrimTitle.ts
 *
 * 📌 如需修改safeTrimTitle逻辑，请编辑 src/utils/safeTrimTitle.ts
 */
// 删除重复的safeTrimTitle函数实现

/**
 * ✅ V3.3 标题评分系统配置 - 增强版
 * 🎯 与 src/score/titleScoreWeights.ts 中的 TITLE_SCORING_V3_3_CONFIG 保持同步
 */
export const TITLE_SCORING_V3_3_CONFIG = {
  outputCount: 5,
  ensureDiversity: true,
  scoringWeights: {
    semanticRelevance: 0.50,        // 50% - 主旨拟合度
    emotionalAppeal: 0.20,          // 20% - 情绪吸引力
    structuralDiversity: 0.15,      // 15% - 表达结构多样性
    semanticCompleteness: 0.10,     // 10% - 语义完整性
    characterUtilization: 0.05      // 5% - 字符利用率
  }
} as const;

/**
 * 平台字符限制配置
 */


/**
 * 获取平台字符限制
 * @param platformId 平台ID
 * @returns 字符限制
 */
export function getPlatformLimit(platformId: string): number {
  const cfg = getPlatformConfig(platformId as any);
  return cfg.maxLength;
}


