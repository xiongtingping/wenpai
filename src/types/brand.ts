/**
 * 品牌档案接口
 * @description 定义品牌调性和相关资料的数据结构
 */
export interface BrandProfile {
  id: string;
  name: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
  files: string[];
  
  // 1. 品牌核心价值
  coreValues?: string[];           // 品牌核心价值观（如创新、可靠、环保等）
  valueDescriptions?: string[];    // 价值观描述
  
  // 2. 品牌语调
  tone: string;                    // 主要语调（如正式、友好、幽默、专业等）
  toneVariations?: {               // 不同场景的语调变化
    formal?: string;               // 正式场合
    casual?: string;               // 轻松场合
    professional?: string;         // 专业场合
    friendly?: string;             // 友好场合
  };
  emotionalTendency?: string;      // 情感倾向（积极、中性、温暖等）
  languageStyle?: string;          // 语言风格（简洁、华丽、直接等）
  
  // 3. 品牌核心话题/内容方向
  coreTopics?: string[];           // 核心话题（如技术、生活、健康等）
  contentDirections?: string[];    // 内容方向（如教育、娱乐、资讯等）
  industryFocus?: string[];        // 行业关注点
  
  // 4. 品牌 Hashtags
  brandHashtags?: string[];        // 品牌专属标签
  campaignHashtags?: string[];     // 活动标签
  trendingHashtags?: string[];     // 热门标签偏好
  
  // 5. 品牌关键词
  keywords: string[];              // 品牌关键词
  keywordCategories?: {            // 关键词分类
    product?: string[];            // 产品相关
    service?: string[];            // 服务相关
    feature?: string[];            // 功能特性
    benefit?: string[];            // 用户利益
  };
  
  // 6. 品牌禁用词
  forbiddenWords: string[];        // 禁用词列表
  sensitiveTopics?: string[];      // 敏感话题
  tabooExpressions?: string[];     // 禁忌表达
  
  // 7. 品牌标识元素
  slogans: string[];               // 品牌 Slogan
  taglines?: string[];             // 品牌标语
  brandStory?: string;             // 品牌故事
  mission?: string;                // 品牌使命
  vision?: string;                 // 品牌愿景
  
  // 8. 目标受众
  targetAudience?: string;         // 目标受众描述
  audienceSegments?: string[];     // 受众细分
  audiencePreferences?: string[];  // 受众偏好
  
  // 9. 平台适配策略
  platformStrategies?: {           // 不同平台的策略
    xiaohongshu?: PlatformStrategy;
    weibo?: PlatformStrategy;
    wechat?: PlatformStrategy;
    douyin?: PlatformStrategy;
    zhihu?: PlatformStrategy;
  };
  
  // 10. 内容规范
  contentGuidelines?: string[];    // 内容创作规范
  languageGuidelines?: string[];   // 语言使用规范
  visualGuidelines?: string[];     // 视觉规范
  
  // AI 分析结果
  aiAnalysis?: {
    toneAnalysis: string;
    keyThemes: string[];
    brandPersonality: string;
    targetAudience: string;
    contentSuggestions: string[];
    valueAlignment: string[];      // 价值观对齐建议
    topicConsistency: string[];    // 话题一致性建议
  };
}

/**
 * 平台策略接口
 */
export interface PlatformStrategy {
  tone?: string;                   // 该平台的语调
  contentStyle?: string;           // 内容风格
  hashtagStrategy?: string[];      // 标签策略
  interactionStyle?: string;       // 互动风格
  specialRequirements?: string[];  // 特殊要求
}

/**
 * 品牌调性 prompt 配置接口
 */
export interface BrandPromptConfig {
  /** 是否使用品牌语调 */
  useBrandTone: boolean;
  /** 是否应用禁用词检查 */
  applyForbiddenWords: boolean;
  /** 是否融入品牌关键词 */
  includeKeywords: boolean;
  /** 是否遵循语言规范 */
  followLanguageGuidelines: boolean;
  /** 是否融入品牌价值 */
  includeBrandValues: boolean;
  /** 是否保持品牌形象一致 */
  maintainBrandConsistency: boolean;
  /** 是否使用品牌话题 */
  useCoreTopics: boolean;
  /** 是否应用品牌标签 */
  applyBrandHashtags: boolean;
  /** 是否适配平台特性 */
  adaptToPlatform: boolean;
  /** 自定义 prompt 模板 */
  customTemplate?: string;
}

/**
 * 品牌调性分析维度
 */
export interface BrandToneAnalysis {
  // 1. 品牌核心价值分析
  coreValues: {
    values: string[];
    descriptions: string[];
    strength: number;              // 价值观强度 (1-10)
  };
  
  // 2. 品牌语调分析
  tone: {
    primary: string;
    variations: Record<string, string>;
    emotionalTendency: string;
    languageStyle: string;
    consistency: number;           // 语调一致性 (1-10)
  };
  
  // 3. 核心话题分析
  topics: {
    coreTopics: string[];
    contentDirections: string[];
    industryFocus: string[];
    relevance: number;             // 话题相关性 (1-10)
  };
  
  // 4. 标签策略分析
  hashtags: {
    brandHashtags: string[];
    campaignHashtags: string[];
    trendingHashtags: string[];
    effectiveness: number;         // 标签效果 (1-10)
  };
  
  // 5. 关键词分析
  keywords: {
    primary: string[];
    categories: Record<string, string[]>;
    frequency: Record<string, number>; // 关键词频率
    impact: number;                // 关键词影响力 (1-10)
  };
  
  // 6. 风险控制分析
  riskControl: {
    forbiddenWords: string[];
    sensitiveTopics: string[];
    tabooExpressions: string[];
    riskLevel: number;             // 风险等级 (1-10)
  };
  
  // 7. 整体调性评分
  overallScore: {
    valueAlignment: number;        // 价值观对齐度 (1-10)
    toneConsistency: number;       // 语调一致性 (1-10)
    topicRelevance: number;        // 话题相关性 (1-10)
    brandRecognition: number;      // 品牌识别度 (1-10)
    riskControl: number;           // 风险控制 (1-10)
  };
}

/**
 * 品牌资料类型
 */
export type BrandAssetType = 'logo' | 'document' | 'image' | 'slogan' | 'value';

/**
 * 品牌资料接口
 */
export interface BrandAsset {
  id: string;
  name: string;
  type: BrandAssetType;
  content: string;
  uploadDate: Date;
  fileUrl?: string;
  size?: string;
  fileIcon?: JSX.Element;
  description?: string;
  category?: string;
  extractedKeywords?: string[];
  processingStatus?: 'pending' | 'processing' | 'completed' | 'failed';
}

/**
 * 品牌调性分析结果
 */
export interface BrandAnalysisResult {
  keywords: string[];              // 向后兼容
  brandKeywords?: string[];        // 品牌核心概念、价值主张、品牌定位相关的词汇
  productKeywords?: string[];      // 具体产品特征、功能、材质、技术相关的词汇
  targetAudience?: string[];       // 用户群体、市场定位、消费者特征相关的词汇
  brandStory?: string[];           // 历史、文化、情感、传承相关的词汇
  competitiveAdvantage?: string[]; // 差异化、优势、特色、领先相关的词汇
  tone: string;                    // 品牌语调风格
  suggestions: string[];           // 品牌建设建议
}

/**
 * 内容检查结果
 */
export interface ContentCheckResult {
  isValid: boolean;
  issues: string[];
  suggestions: string[];
} 