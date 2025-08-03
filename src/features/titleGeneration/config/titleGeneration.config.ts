/**
 * 标题生成系统统一配置
 * 集中管理所有配置项，避免重复定义
 */

import { V3_3_TITLE_SCORE_WEIGHTS } from '@/score/titleScoreWeights';
import { PLATFORM_LIMITS } from '@/ai/prompts/titleGeneration';
import type { 
  PlatformConfig, 
  AIServiceConfig, 
  CacheConfig, 
  PlatformId,
  TitleStyle 
} from '../types/titleGeneration.types';

// 评分权重配置 (使用统一的V3.3权重)
export const QUALITY_WEIGHTS = V3_3_TITLE_SCORE_WEIGHTS;

// 平台配置映射
export const PLATFORM_CONFIGS: Record<PlatformId, PlatformConfig> = {
  xiaohongshu: {
    id: 'xiaohongshu',
    name: '小红书',
    maxLength: 20,
    minLength: 5,
    recommendedLength: 15,
    stylePreferences: ['engaging', 'emotional', 'creative'],
    specialRules: ['避免过度营销词汇', '注重生活化表达', '适当使用emoji']
  },
  weibo: {
    id: 'weibo',
    name: '微博',
    maxLength: 2000,
    minLength: 10,
    recommendedLength: 50,
    stylePreferences: ['informative', 'engaging', 'emotional'],
    specialRules: ['支持话题标签', '适合热点讨论', '可以较长']
  },
  wechat: {
    id: 'wechat',
    name: '微信公众号',
    maxLength: 64,
    minLength: 8,
    recommendedLength: 30,
    stylePreferences: ['informative', 'professional', 'engaging'],
    specialRules: ['标题党适度', '突出价值主张', '吸引点击']
  },
  douyin: {
    id: 'douyin',
    name: '抖音',
    maxLength: 2200,
    minLength: 10,
    recommendedLength: 30,
    stylePreferences: ['engaging', 'emotional', 'creative'],
    specialRules: ['视觉化描述', '情感共鸣', '热门元素']
  },
  zhihu: {
    id: 'zhihu',
    name: '知乎',
    maxLength: 10000,
    minLength: 10,
    recommendedLength: 50,
    stylePreferences: ['informative', 'professional', 'practical'],
    specialRules: ['深度思考', '专业性强', '逻辑清晰']
  },
  bilibili: {
    id: 'bilibili',
    name: 'B站',
    maxLength: 80,
    minLength: 8,
    recommendedLength: 40,
    stylePreferences: ['engaging', 'creative', 'emotional'],
    specialRules: ['年轻化表达', '创意标题', '互动性强']
  },
  toutiao: {
    id: 'toutiao',
    name: '今日头条',
    maxLength: 30,
    minLength: 8,
    recommendedLength: 20,
    stylePreferences: ['informative', 'engaging'],
    specialRules: ['新闻性强', '时效性', '吸引眼球']
  },
  default: {
    id: 'default',
    name: '通用',
    maxLength: 100,
    minLength: 5,
    recommendedLength: 30,
    stylePreferences: ['informative', 'engaging'],
    specialRules: ['通用规则', '平衡各方面']
  }
};

// AI 服务配置
export const AI_SERVICE_CONFIG: AIServiceConfig = {
  primaryModel: 'deepseek-v3',
  fallbackModels: ['deepseek-chat', 'gpt-4o', 'gpt-4o-mini'],
  timeout: 30000, // 30秒
  retries: 1,
  temperature: 0.7,
  maxTokens: 400
};

// 缓存配置
export const CACHE_CONFIG: CacheConfig = {
  enabled: true,
  ttl: 30 * 60 * 1000, // 30分钟
  maxSize: 1000,
  keyPrefix: 'title_gen_'
};

// 质量检查规则
export const QUALITY_RULES = {
  minScore: 0.6,
  minLength: 5,
  maxGenericWords: 2,
  forbiddenPatterns: [
    /undefined/gi,
    /null/gi,
    /\[object Object\]/gi,
    /^[\s]*$/
  ],
  genericWords: [
    'AI真强', '神器推荐', '这个工具', '很好用',
    '必看', '收藏', '建议', '推荐'
  ]
};

// 风格配置
export const STYLE_CONFIGS: Record<TitleStyle, { name: string; description: string; weight: number }> = {
  informative: {
    name: '信息型',
    description: '客观传达信息，重点突出',
    weight: 1.0
  },
  engaging: {
    name: '吸引型',
    description: '引人入胜，激发兴趣',
    weight: 1.2
  },
  emotional: {
    name: '情感型',
    description: '情感共鸣，触动人心',
    weight: 1.1
  },
  practical: {
    name: '实用型',
    description: '实用价值，解决问题',
    weight: 1.0
  },
  creative: {
    name: '创意型',
    description: '新颖独特，富有创意',
    weight: 1.3
  },
  professional: {
    name: '专业型',
    description: '专业权威，深度分析',
    weight: 1.0
  }
};

// 生成配置
export const GENERATION_CONFIG = {
  defaultOutputCount: 5,
  maxOutputCount: 10,
  minOutputCount: 1,
  defaultEnsureDiversity: true,
  maxRetries: 3,
  progressStages: [
    { stage: 'validating', progress: 10, message: '验证输入内容...' },
    { stage: 'calling_ai', progress: 30, message: '调用AI生成标题...' },
    { stage: 'processing', progress: 60, message: '处理生成结果...' },
    { stage: 'scoring', progress: 80, message: '计算质量评分...' },
    { stage: 'complete', progress: 100, message: '生成完成！' }
  ]
};

// 性能监控配置
export const PERFORMANCE_CONFIG = {
  enableMetrics: true,
  metricsInterval: 60000, // 1分钟
  slowRequestThreshold: 10000, // 10秒
  errorRateThreshold: 0.1, // 10%
  cacheHitRateThreshold: 0.6 // 60%
};

// 导出统一配置对象
export const TitleGenerationConfig = {
  weights: QUALITY_WEIGHTS,
  platforms: PLATFORM_CONFIGS,
  aiService: AI_SERVICE_CONFIG,
  cache: CACHE_CONFIG,
  qualityRules: QUALITY_RULES,
  styles: STYLE_CONFIGS,
  generation: GENERATION_CONFIG,
  performance: PERFORMANCE_CONFIG
} as const;

// 辅助函数
export const getPlatformConfig = (platformId: PlatformId): PlatformConfig => {
  return PLATFORM_CONFIGS[platformId] || PLATFORM_CONFIGS.default;
};

export const getStyleConfig = (style: TitleStyle) => {
  return STYLE_CONFIGS[style];
};

export const validatePlatformId = (platformId: string): platformId is PlatformId => {
  return Object.keys(PLATFORM_CONFIGS).includes(platformId);
};

export const validateTitleStyle = (style: string): style is TitleStyle => {
  return Object.keys(STYLE_CONFIGS).includes(style);
};

// 生成缓存键
export const generateCacheKey = (
  content: string, 
  platform: PlatformId, 
  styles: TitleStyle[], 
  count: number
): string => {
  const contentHash = btoa(content.slice(0, 100)).slice(0, 16);
  const styleHash = styles.sort().join(',');
  return `${CACHE_CONFIG.keyPrefix}${contentHash}_${platform}_${styleHash}_${count}`;
};

export default TitleGenerationConfig;
