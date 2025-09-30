import { logModuleInit, logModuleLock, logger } from '@/utils/logger';

// {t('promptSystem.module.lockConstant')}
const PROMPT_SYSTEM_LOCK_SIGNATURE = 'prompt-system-v1.0.0';
const PROMPT_SYSTEM_CREATION_TIME = '2025-09-06T12:00:00Z';

export enum PromptType {
  // {t('promptSystem.module.titleGeneration')}
  TITLE_GENERATION_SYSTEM = 'title-generation-system',
  TITLE_GENERATION_USER = 'title-generation-user',
  TITLE_QUALITY_CHECK = 'title-quality-check',

  // {t('promptSystem.module.brandCorpus')}
  BRAND_CORPUS_EXTRACTION = 'brand-corpus-extraction',
  BRAND_CORPUS_CONFLICT_RESOLUTION = 'brand-corpus-conflict-resolution',
  TITLE_SCORING = 'title-scoring',
  
  // {t('promptSystem.module.contentAdaptation')}
  CONTENT_ADAPTATION_SYSTEM = 'content-adaptation-system',
  CONTENT_FORM_GENERATION = 'content-form-generation',
  PLATFORM_ADAPTATION = 'platform-adaptation',
  PLATFORM_STYLE_ADAPTATION = 'platform-style-adaptation',
  CONTENT_FORM_PROCESSING = 'content-form-processing',
  EXPRESSION_STYLE_MANAGEMENT = 'expression-style-management',
  
  // {t('promptSystem.module.creativeGeneration')}
  CREATIVE_GENERATION_SYSTEM = 'creative-generation-system',
  CREATIVE_CUBE_PROMPT = 'creative-cube-prompt',
  
  // {t('promptSystem.module.brandAnalysis')}
  BRAND_ANALYSIS_SYSTEM = 'brand-analysis-system',
  BRAND_TONE_ANALYSIS = 'brand-tone-analysis',
  BRAND_KEYWORD_EXTRACTION = 'brand-keyword-extraction',
  
  // {t('promptSystem.module.documentProcessing')}
  PDF_CHAT_SYSTEM = 'pdf-chat-system',
  DOCUMENT_ANALYSIS = 'document-analysis',
  
  // {t('promptSystem.module.otherFunctions')}
  EMOJI_GENERATION = 'emoji-generation',
  CONTENT_SUMMARY = 'content-summary'
}

/**
 * {t('promptSystem.interfaces.promptParams')}
 */
export interface PromptParams {
  [key: string]: any;
}

/**
 * {t('promptSystem.interfaces.platformFeatures')}
 */
export interface PlatformCharacteristics {
  tone: string;
  features: string[];
  contentStyle: string;
  interactionStyle: string;
  maxLength: number;
  optimalLength: [number, number];
}

/**
 * {t('promptSystem.interfaces.contentForm')}
 */
export interface ContentFormConfig {
  id: string;
  name: string;
  description: string;
  category: 'image-text' | 'video' | 'interview' | 'insight';
  outputType: string;
  characteristics: string[];
  structure: string[];
}

/**
 * {t('promptSystem.interfaces.expressionStyle')}
 */
export interface ExpressionStyleConfig {
  id: string;
  name: string;
  description: string;
  characteristics: string[];
  toneKeywords: string[];
}

/**
 * {t('promptSystem.interfaces.promptTemplate')}
 */
export interface PromptTemplate {
  type: PromptType;
  systemPrompt?: string;
  userPrompt: string;
  parameters: string[];
  description: string;
  version: string;
  lastUpdated: string;
}

/**
 * 🎯 {t('promptSystem.core.unifiedManager')}
 */
class PromptSystemManager {
  private templates: Map<PromptType, PromptTemplate> = new Map();
  private platformCharacteristics: Map<string, PlatformCharacteristics> = new Map();
  private contentForms: Map<string, ContentFormConfig> = new Map();
  private expressionStyles: Map<string, ExpressionStyleConfig> = new Map();
  private initialized = false;

  constructor() {
    this.initializePlatformData();
    this.initializeContentForms();
    this.initializeExpressionStyles();
    this.initializePrompts();
  }

  /**
   * {t('promptSystem.core.initializePlatformData')}
   */
  private initializePlatformData(): void {
    // 小红书
    this.platformCharacteristics.set('xiaohongshu', {
      tone: '真实分享、种草推荐',
      features: ['个人体验感', '图片配文', '标签丰富', '实用性强'],
      contentStyle: '生活化、实用性、美学化表达',
      interactionStyle: '鼓励收藏、分享，使用emoji和话题标签',
      maxLength: 1000,
      optimalLength: [50, 200]
    });

    // 抖音
    this.platformCharacteristics.set('douyin', {
      tone: '轻松有趣、节奏感强',
      features: ['短视频脚本格式', '音乐节拍配合', '视觉冲击力', '15-60秒时长'],
      contentStyle: '快节奏、高密度信息、强视觉效果',
      interactionStyle: '引导点赞、评论、转发，使用热门话题和挑战',
      maxLength: 100,
      optimalLength: [20, 50]
    });

    // 微信公众号
    this.platformCharacteristics.set('wechat', {
      tone: '权威专业、深度解读',
      features: ['图文并茂', '深度内容', '专业表达', '价值输出'],
      contentStyle: '权威性、深度性、实用性',
      interactionStyle: '引导关注、分享转发，建立专业形象',
      maxLength: 5000,
      optimalLength: [800, 2000]
    });

    // 微博
    this.platformCharacteristics.set('weibo', {
      tone: '简洁有力、热点敏感',
      features: ['140字精炼', '话题标签', '@用户互动', '转发评论'],
      contentStyle: '新闻性、时效性、观点鲜明',
      interactionStyle: '引发讨论、转发传播，关注热点话题',
      maxLength: 2000,
      optimalLength: [50, 140]
    });

    // 知乎
    this.platformCharacteristics.set('zhihu', {
      tone: '专业深度、逻辑清晰',
      features: ['长文深度', '专业术语', '数据支撑', '逻辑论证'],
      contentStyle: '知识性、专业性、思辨性强',
      interactionStyle: '引发思考、专业讨论，提供价值观点',
      maxLength: 10000,
      optimalLength: [1000, 3000]
    });

    // B站
    this.platformCharacteristics.set('bilibili', {
      tone: '年轻活力、创意十足',
      features: ['视频脚本', '弹幕互动', '二次元文化', '创意表达'],
      contentStyle: '娱乐性、创意性、互动性强',
      interactionStyle: '引导三连、弹幕互动，融入B站文化',
      maxLength: 500,
      optimalLength: [100, 300]
    });
  }

  /**
   * {t('promptSystem.core.initializeContentForms')}
   */
  private initializeContentForms(): void {
    // 图文种草
    this.contentForms.set('image-text-planting', {
      id: 'image-text-planting',
      name: '图文种草',
      description: '第一人称视角，讲述真实使用体验，语言自然亲切，融合 emoji 表达与评论互动引导',
      category: 'image-text',
      outputType: '纯文案，用户自配图',
      characteristics: [
        '第一人称真实体验',
        '自然亲切的语言',
        '融合emoji表达',
        '评论互动引导',
        '种草推荐语气'
      ],
      structure: [
        '开头：吸引注意的钩子',
        '体验：详细使用感受',
        '亮点：产品核心优势',
        '总结：推荐理由和建议'
      ]
    });

    // 视频脚本
    this.contentForms.set('video-script', {
      id: 'video-script',
      name: '视频脚本',
      description: '包含画面描述、文案、音效等完整视频制作要素',
      category: 'video',
      outputType: '结构化脚本',
      characteristics: [
        '画面描述详细',
        '文案简洁有力',
        '节奏感强',
        '视觉冲击力'
      ],
      structure: [
        '开场：抓住注意力',
        '主体：核心内容展示',
        '转折：制造悬念或对比',
        '结尾：行动召唤'
      ]
    });

    // 专业解读
    this.contentForms.set('professional-analysis', {
      id: 'professional-analysis',
      name: '专业解读',
      description: '深度分析某个话题或现象，提供专业见解和价值观点',
      category: 'insight',
      outputType: '长文分析',
      characteristics: [
        '逻辑清晰',
        '数据支撑',
        '专业术语',
        '深度思考'
      ],
      structure: [
        '背景：问题或现象描述',
        '分析：多角度深入解读',
        '观点：专业见解和判断',
        '总结：结论和启示'
      ]
    });
  }

  /**
   * {t('promptSystem.core.initializeExpressionStyles')}
   */
  private initializeExpressionStyles(): void {
    // 专业风格
    this.expressionStyles.set('professional', {
      id: 'professional',
      name: '专业权威',
      description: '使用专业术语，逻辑清晰，权威可信',
      characteristics: [
        '专业术语使用',
        '逻辑结构清晰',
        '权威性表达',
        '客观理性'
      ],
      toneKeywords: ['专业', '权威', '深度', '分析', '解读', '洞察']
    });

    // 轻松风格
    this.expressionStyles.set('casual', {
      id: 'casual',
      name: '轻松自然',
      description: '语言亲切自然，贴近生活，易于理解',
      characteristics: [
        '语言亲切',
        '贴近生活',
        '易于理解',
        '自然表达'
      ],
      toneKeywords: ['轻松', '自然', '亲切', '生活化', '真实', '分享']
    });

    // 幽默风格
    this.expressionStyles.set('funny', {
      id: 'funny',
      name: '幽默风趣',
      description: '使用幽默元素，增加趣味性和传播性',
      characteristics: [
        '幽默元素',
        '趣味性强',
        '传播性好',
        '娱乐性'
      ],
      toneKeywords: ['幽默', '风趣', '有趣', '搞笑', '娱乐', '轻松']
    });

    // 情感风格
    this.expressionStyles.set('emotional', {
      id: 'emotional',
      name: '情感化',
      description: '注重情感表达，引起共鸣和情感连接',
      characteristics: [
        '情感丰富',
        '引起共鸣',
        '感染力强',
        '人文关怀'
      ],
      toneKeywords: ['感动', '温暖', '共鸣', '真诚', '感人', '情感']
    });
  }

  /**
   * {t('promptSystem.core.initializePromptTemplates')}
   */
  private initializePrompts(): void {
    if (this.initialized) return;

    // 标题生成系统提示词（保持原有逻辑）
    this.registerPrompt(PromptType.TITLE_GENERATION_SYSTEM, {
      type: PromptType.TITLE_GENERATION_SYSTEM,
      systemPrompt: this.getTitleGenerationSystemPrompt(),
      userPrompt: '',
      parameters: [],
      description: '标题生成AI系统提示词，包含完整的生成规范和评分机制',
      version: '3.0.0',
      lastUpdated: '2025-01-05'
    });

    // 标题生成用户提示词
    this.registerPrompt(PromptType.TITLE_GENERATION_USER, {
      type: PromptType.TITLE_GENERATION_USER,
      userPrompt: this.getTitleGenerationUserPrompt(),
      parameters: ['content', 'platform', 'stylePreference', 'outputCount', 'versions'],
      description: '标题生成用户提示词模板，支持平台定制和风格偏好',
      version: '3.0.0',
      lastUpdated: '2025-01-05'
    });

    // 标题质量检查提示词
    this.registerPrompt(PromptType.TITLE_QUALITY_CHECK, {
      type: PromptType.TITLE_QUALITY_CHECK,
      systemPrompt: this.getTitleQualityCheckSystemPrompt(),
      userPrompt: this.getTitleQualityCheckUserPrompt(),
      parameters: ['title', 'originalContent', 'platform', 'otherTitles'],
      description: 'V3版本标题质量检查提示词，5维度评分分析',
      version: '3.0.0',
      lastUpdated: '2025-01-05'
    });

    // 品牌语料库提取提示词
    this.registerPrompt(PromptType.BRAND_CORPUS_EXTRACTION, {
      type: PromptType.BRAND_CORPUS_EXTRACTION,
      systemPrompt: this.getBrandCorpusExtractionSystemPrompt(),
      userPrompt: this.getBrandCorpusExtractionUserPrompt(),
      parameters: ['brandContent', 'docId', 'fileName'],
      description: '品牌语料库AI提取提示词，支持9个维度的结构化提取',
      version: '1.0.0',
      lastUpdated: '2025-01-05'
    });

    // 品牌语料库冲突解决提示词
    this.registerPrompt(PromptType.BRAND_CORPUS_CONFLICT_RESOLUTION, {
      type: PromptType.BRAND_CORPUS_CONFLICT_RESOLUTION,
      systemPrompt: this.getBrandCorpusConflictSystemPrompt(),
      userPrompt: this.getBrandCorpusConflictUserPrompt(),
      parameters: ['conflictingFields', 'sources', 'brandName'],
      description: '品牌语料库冲突解决提示词，智能合并多来源信息',
      version: '1.0.0',
      lastUpdated: '2025-01-05'
    });

    // 九宫格创意魔方提示词（保持原有逻辑）
    this.registerPrompt(PromptType.CREATIVE_GENERATION_SYSTEM, {
      type: PromptType.CREATIVE_GENERATION_SYSTEM,
      systemPrompt: this.getCreativeGenerationSystemPrompt(),
      userPrompt: this.getCreativeGenerationUserPrompt(),
      parameters: ['targetAudience', 'useCase', 'painPoint', 'contentType', 'additionalContext'],
      description: '九宫格创意魔方系统提示词，专业的社交媒体文案创作',
      version: '2.0.0',
      lastUpdated: '2025-01-05'
    });

    // 内容适配系统提示词（保持原有逻辑）
    this.registerPrompt(PromptType.CONTENT_ADAPTATION_SYSTEM, {
      type: PromptType.CONTENT_ADAPTATION_SYSTEM,
      systemPrompt: this.getContentAdaptationSystemPrompt(),
      userPrompt: this.getContentAdaptationUserPrompt(),
      parameters: ['originalContent', 'platform', 'formId', 'style', 'charCount'],
      description: '内容适配系统提示词，支持多平台内容形式适配',
      version: '2.0.0',
      lastUpdated: '2025-01-05'
    });

    // 品牌分析系统提示词（保持原有逻辑）
    this.registerPrompt(PromptType.BRAND_ANALYSIS_SYSTEM, {
      type: PromptType.BRAND_ANALYSIS_SYSTEM,
      systemPrompt: this.getBrandAnalysisSystemPrompt(),
      userPrompt: this.getBrandAnalysisUserPrompt(),
      parameters: ['brandContent', 'analysisType', 'targetAudience'],
      description: '品牌分析系统提示词，专业的品牌调性和关键词分析',
      version: '1.0.0',
      lastUpdated: '2025-01-05'
    });

    // PDF对话系统提示词（保持原有逻辑）
    this.registerPrompt(PromptType.PDF_CHAT_SYSTEM, {
      type: PromptType.PDF_CHAT_SYSTEM,
      systemPrompt: this.getPDFChatSystemPrompt(),
      userPrompt: this.getPDFChatUserPrompt(),
      parameters: ['documentContent', 'question'],
      description: 'PDF文档对话系统提示词，专业的文档分析和问答',
      version: '1.0.0',
      lastUpdated: '2025-01-05'
    });

    // Emoji生成提示词
    this.registerPrompt(PromptType.EMOJI_GENERATION, {
      type: PromptType.EMOJI_GENERATION,
      systemPrompt: this.getEmojiGenerationSystemPrompt(),
      userPrompt: this.getEmojiGenerationUserPrompt(),
      parameters: ['character', 'brand', 'emotion'],
      description: 'Emoji生成描述提示词，创作生动的表情符号描述',
      version: '1.0.0',
      lastUpdated: '2025-01-05'
    });

    // 平台风格适配提示词
    this.registerPrompt(PromptType.PLATFORM_STYLE_ADAPTATION, {
      type: PromptType.PLATFORM_STYLE_ADAPTATION,
      systemPrompt: this.getPlatformStyleAdaptationSystemPrompt(),
      userPrompt: this.getPlatformStyleAdaptationUserPrompt(),
      parameters: ['originalContent', 'platform', 'style', 'charCount'],
      description: '平台风格适配提示词，根据平台特征进行内容适配',
      version: '2.0.0',
      lastUpdated: '2025-01-05'
    });

    // 内容形式处理提示词
    this.registerPrompt(PromptType.CONTENT_FORM_PROCESSING, {
      type: PromptType.CONTENT_FORM_PROCESSING,
      systemPrompt: this.getContentFormProcessingSystemPrompt(),
      userPrompt: this.getContentFormProcessingUserPrompt(),
      parameters: ['originalContent', 'formId', 'platform', 'style'],
      description: '内容形式处理提示词，转换内容为指定形式',
      version: '2.0.0',
      lastUpdated: '2025-01-05'
    });

    // 表达风格管理提示词
    this.registerPrompt(PromptType.EXPRESSION_STYLE_MANAGEMENT, {
      type: PromptType.EXPRESSION_STYLE_MANAGEMENT,
      systemPrompt: this.getExpressionStyleManagementSystemPrompt(),
      userPrompt: this.getExpressionStyleManagementUserPrompt(),
      parameters: ['originalContent', 'styleId', 'platform'],
      description: '表达风格管理提示词，控制内容的表达风格',
      version: '2.0.0',
      lastUpdated: '2025-01-05'
    });

    // 🔧 FIXED: 添加缺失的提示词类型注册 [PROMPT_SYSTEM_INTEGRITY_FIXED_v1.0.0]
    // 

    // 标题评分提示词
    this.registerPrompt(PromptType.TITLE_SCORING, {
      type: PromptType.TITLE_SCORING,
      systemPrompt: '你是专业的标题评分专家，负责对标题进行多维度评分。',
      userPrompt: '请对以下标题进行评分：{{title}}，原文内容：{{content}}，平台：{{platform}}',
      parameters: ['title', 'content', 'platform'],
      description: '标题评分提示词，对标题质量进行量化评估',
      version: '1.0.0',
      lastUpdated: '2025-01-14'
    });

    // 内容形式生成提示词
    this.registerPrompt(PromptType.CONTENT_FORM_GENERATION, {
      type: PromptType.CONTENT_FORM_GENERATION,
      systemPrompt: '你是内容形式生成专家，擅长将内容转换为不同的表达形式。',
      userPrompt: '请将以下内容转换为{{formType}}形式：{{content}}，目标平台：{{platform}}',
      parameters: ['content', 'formType', 'platform'],
      description: '内容形式生成提示词，转换内容为指定形式',
      version: '1.0.0',
      lastUpdated: '2025-01-14'
    });

    // 平台适配提示词
    this.registerPrompt(PromptType.PLATFORM_ADAPTATION, {
      type: PromptType.PLATFORM_ADAPTATION,
      systemPrompt: '你是平台适配专家，了解各个社交媒体平台的特点和用户偏好。',
      userPrompt: '请将以下内容适配到{{platform}}平台：{{content}}，保持核心信息不变',
      parameters: ['content', 'platform'],
      description: '平台适配提示词，根据平台特征调整内容',
      version: '1.0.0',
      lastUpdated: '2025-01-14'
    });

    // 创意魔方提示词
    this.registerPrompt(PromptType.CREATIVE_CUBE_PROMPT, {
      type: PromptType.CREATIVE_CUBE_PROMPT,
      systemPrompt: '你是创意魔方专家，擅长生成九宫格创意内容。',
      userPrompt: '请为{{topic}}生成九宫格创意内容，目标受众：{{audience}}，使用场景：{{useCase}}',
      parameters: ['topic', 'audience', 'useCase'],
      description: '创意魔方提示词，生成九宫格创意内容',
      version: '1.0.0',
      lastUpdated: '2025-01-14'
    });

    // 品牌调性分析提示词
    this.registerPrompt(PromptType.BRAND_TONE_ANALYSIS, {
      type: PromptType.BRAND_TONE_ANALYSIS,
      systemPrompt: '你是品牌调性分析专家，能够准确识别和分析品牌的语言风格和调性。',
      userPrompt: '请分析以下品牌内容的调性特征：{{brandContent}}，品牌名称：{{brandName}}',
      parameters: ['brandContent', 'brandName'],
      description: '品牌调性分析提示词，识别品牌语言风格',
      version: '1.0.0',
      lastUpdated: '2025-01-14'
    });

    // 品牌关键词提取提示词
    this.registerPrompt(PromptType.BRAND_KEYWORD_EXTRACTION, {
      type: PromptType.BRAND_KEYWORD_EXTRACTION,
      systemPrompt: '你是品牌关键词提取专家，能够从品牌内容中提取核心关键词。',
      userPrompt: '请从以下品牌内容中提取关键词：{{brandContent}}，提取类型：{{extractionType}}',
      parameters: ['brandContent', 'extractionType'],
      description: '品牌关键词提取提示词，提取品牌核心关键词',
      version: '1.0.0',
      lastUpdated: '2025-01-14'
    });

    // 文档分析提示词
    this.registerPrompt(PromptType.DOCUMENT_ANALYSIS, {
      type: PromptType.DOCUMENT_ANALYSIS,
      systemPrompt: '你是文档分析专家，能够深入分析文档内容并提供专业见解。',
      userPrompt: '请分析以下文档内容：{{documentContent}}，分析维度：{{analysisType}}',
      parameters: ['documentContent', 'analysisType'],
      description: '文档分析提示词，深度分析文档内容',
      version: '1.0.0',
      lastUpdated: '2025-01-14'
    });

    // 内容摘要提示词
    this.registerPrompt(PromptType.CONTENT_SUMMARY, {
      type: PromptType.CONTENT_SUMMARY,
      systemPrompt: '你是内容摘要专家，能够准确提取内容要点并生成简洁摘要。',
      userPrompt: '请为以下内容生成摘要：{{content}}，摘要长度：{{length}}字',
      parameters: ['content', 'length'],
      description: '内容摘要提示词，生成内容核心摘要',
      version: '1.0.0',
      lastUpdated: '2025-01-14'
    });

    this.initialized = true;
    logModuleInit('提示词系统', '1.0.0');
  }

  /**
   * 注册提示词模板
   */
  private registerPrompt(type: PromptType, template: PromptTemplate): void {
    this.templates.set(type, template);
  }

  /**
   * 获取提示词模板（增强版，支持平台和风格数据注入）
   */
  public getPrompt(type: PromptType, params: PromptParams = {}): {
    systemPrompt?: string;
    userPrompt: string;
  } {
    const template = this.templates.get(type);
    if (!template) {
      throw new Error(`提示词模板不存在: ${type}`);
    }

    // 验证必需参数
    const missingParams = template.parameters.filter(param => !(param in params));
    if (missingParams.length > 0) {
      console.warn(`缺少提示词参数: ${missingParams.join(', ')}`);
    }

    // 🎯 增强参数处理：自动注入平台和风格数据
    const enhancedParams = this.enhanceParameters(params);

    // 替换参数占位符
    const userPrompt = this.replaceParameters(template.userPrompt, enhancedParams);
    const systemPrompt = template.systemPrompt
      ? this.replaceParameters(template.systemPrompt, enhancedParams)
      : undefined;

    return {
      systemPrompt,
      userPrompt
    };
  }

  /**
   * 增强参数处理：自动注入多维矩阵数据
   */
  private enhanceParameters(params: PromptParams): PromptParams {
    const enhanced = { ...params };

    // 🎯 品牌维度数据注入（最高优先级）
    if (params.brandContent) {
      // 这里可以集成品牌库分析结果
      enhanced.brandTone = this.extractBrandTone(params.brandContent);
      enhanced.brandKeywords = this.extractBrandKeywords(params.brandContent);
      enhanced.brandStyle = this.extractBrandStyle(params.brandContent);
      enhanced.brandValues = this.extractBrandValues(params.brandContent);
    }

    // 🏢 平台维度数据注入
    if (params.platform) {
      const platformData = this.platformCharacteristics.get(params.platform);
      if (platformData) {
        enhanced.platformTone = platformData.tone;
        enhanced.platformContentStyle = platformData.contentStyle;
        enhanced.platformInteractionStyle = platformData.interactionStyle;
        enhanced.platformFeatures = platformData.features.join('、');
        enhanced.platformMaxLength = platformData.maxLength;
        enhanced.platformOptimalLength = `${platformData.optimalLength[0]}-${platformData.optimalLength[1]}`;
      }
    }

    // 📝 内容形式维度数据注入
    if (params.formId) {
      const formData = this.contentForms.get(params.formId);
      if (formData) {
        enhanced.formName = formData.name;
        enhanced.formDescription = formData.description;
        enhanced.formOutputType = formData.outputType;
        enhanced.formCharacteristics = formData.characteristics.join('、');
        enhanced.formStructure = formData.structure;
      }
    }

    // 🎭 表达风格维度数据注入
    if (params.style || params.styleId) {
      const styleId = params.styleId || params.style;
      const styleData = this.expressionStyles.get(styleId);
      if (styleData) {
        enhanced.styleName = styleData.name;
        enhanced.styleDescription = styleData.description;
        enhanced.styleCharacteristics = styleData.characteristics.join('、');
        enhanced.styleToneKeywords = styleData.toneKeywords.join('、');
      }
    }

    // 📊 内容类型维度数据注入
    if (params.contentType) {
      enhanced.contentType = params.contentType;
    }

    // 📏 字符数控制维度数据注入
    if (params.originalLength) {
      enhanced.originalLength = params.originalLength;
    }

    return enhanced;
  }

  /**
   * 从品牌内容中提取品牌调性（简化版，实际可集成品牌分析AI）
   */
  private extractBrandTone(brandContent: string): string {
    // 这里可以集成更复杂的品牌分析逻辑
    if (brandContent.includes('专业') || brandContent.includes('权威')) {
      return '专业权威';
    } else if (brandContent.includes('年轻') || brandContent.includes('活力')) {
      return '年轻活力';
    } else if (brandContent.includes('温暖') || brandContent.includes('亲切')) {
      return '温暖亲切';
    }
    return '平衡中性';
  }

  /**
   * 从品牌内容中提取关键词
   */
  private extractBrandKeywords(brandContent: string): string {
    // 简化版关键词提取，实际可使用更复杂的NLP算法
    const keywords = brandContent.match(/[\u4e00-\u9fa5]{2,4}/g) || [];
    return keywords.slice(0, 5).join('、');
  }

  /**
   * 从品牌内容中提取品牌风格
   */
  private extractBrandStyle(brandContent: string): string {
    if (brandContent.includes('简约') || brandContent.includes('极简')) {
      return '简约风格';
    } else if (brandContent.includes('时尚') || brandContent.includes('潮流')) {
      return '时尚风格';
    } else if (brandContent.includes('传统') || brandContent.includes('经典')) {
      return '经典风格';
    }
    return '现代风格';
  }

  /**
   * 从品牌内容中提取品牌价值观
   */
  private extractBrandValues(brandContent: string): string {
    const values = [];
    if (brandContent.includes('创新')) values.push('创新');
    if (brandContent.includes('品质')) values.push('品质');
    if (brandContent.includes('服务')) values.push('服务');
    if (brandContent.includes('责任')) values.push('责任');
    return values.length > 0 ? values.join('、') : '用户至上';
  }

  /**
   * 获取平台特征数据
   */
  public getPlatformCharacteristics(platform: string): PlatformCharacteristics | undefined {
    return this.platformCharacteristics.get(platform);
  }

  /**
   * 获取内容形式配置
   */
  public getContentForm(formId: string): ContentFormConfig | undefined {
    return this.contentForms.get(formId);
  }

  /**
   * 获取表达风格配置
   */
  public getExpressionStyle(styleId: string): ExpressionStyleConfig | undefined {
    return this.expressionStyles.get(styleId);
  }

  /**
   * 获取所有平台列表
   */
  public getAllPlatforms(): string[] {
    return Array.from(this.platformCharacteristics.keys());
  }

  /**
   * 获取所有内容形式列表
   */
  public getAllContentForms(): ContentFormConfig[] {
    return Array.from(this.contentForms.values());
  }

  /**
   * 获取所有表达风格列表
   */
  public getAllExpressionStyles(): ExpressionStyleConfig[] {
    return Array.from(this.expressionStyles.values());
  }

  /**
   * 替换参数占位符
   */
  private replaceParameters(template: string, params: PromptParams): string {
    let result = template;
    
    // 替换 {{parameter}} 格式的占位符
    Object.entries(params).forEach(([key, value]) => {
      const placeholder = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
      result = result.replace(placeholder, String(value || ''));
    });

    return result;
  }

  /**
   * 获取所有提示词模板信息
   */
  public getAllPrompts(): PromptTemplate[] {
    return Array.from(this.templates.values());
  }

  /**
   * 获取提示词统计信息
   */
  public getStats(): {
    totalPrompts: number;
    promptsByCategory: Record<string, number>;
    lastUpdated: string;
  } {
    const prompts = this.getAllPrompts();
    const categories: Record<string, number> = {};
    
    prompts.forEach(prompt => {
      const category = prompt.type.split('-')[0];
      categories[category] = (categories[category] || 0) + 1;
    });

    return {
      totalPrompts: prompts.length,
      promptsByCategory: categories,
      lastUpdated: new Date().toISOString()
    };
  }

  // ==================== 原有提示词逻辑（保持不变） ====================

  /**
   * 标题生成系统提示词（保持原有逻辑）
   */
  private getTitleGenerationSystemPrompt(): string {
    return `你是一个擅长生成"高吸引力内容标题"的AI助手，请根据用户提供的正文内容生成符合平台要求、表达自然完整、结构多样、主旨贴合、具备点击吸引力的标题。

## 🚨 强化内容主旨对齐（拟合）约束

### ✅ 必须执行以下语义约束：
1. 标题必须基于用户提供的正文内容（版本A/B）生成，不允许脱离文本主旨；
2. 标题语义应覆盖正文内容的：
   - 核心对象（如：文派工具、AI内容平台适配等）
   - 用户收益（如：多平台适配、省时间、省力、提升效率）
   - 使用场景（如：小红书、公众号、抖音内容创作）
   - 关键动作（如：一键生成、智能适配、批量处理）
   - 量化效果（如：节省80%时间、支持10+平台）

### 🚫 严禁以下行为：
1. **虚构数据**：不得添加正文中未提及的具体数字、百分比、时间等
2. **泛化表达**：避免"AI神器"、"效率工具"等模糊概念
3. **偏离主旨**：标题内容必须与正文核心信息高度一致
4. **模板套用**：禁止使用"盘点X个"、"X大技巧"等模板化结构

## 🎯 五种标题风格定义

### 1. 结果导向型 (result-oriented)
- **结构**: [具体结果] + [实现方式/工具]
- **示例**: "10分钟完成5个平台内容适配，这个AI工具太强了"
- **特点**: 突出具体成果和效率提升

### 2. 问题引导型 (question-guided)  
- **结构**: [痛点问题] + [解决方案提示]
- **示例**: "还在为多平台发布内容发愁？试试这个一键适配神器"
- **特点**: 先提出用户痛点，再暗示解决方案

### 3. 专业理性型 (professional-rational)
- **结构**: [专业术语] + [功能描述] + [应用场景]
- **示例**: "AI驱动的内容适配引擎：支持小红书、抖音等10+平台"
- **特点**: 使用专业词汇，突出技术特性

### 4. 经验总结型 (experience-summary)
- **结构**: [使用体验] + [具体效果] + [推荐理由]
- **示例**: "用了3个月的内容适配工具，终于找到最好用的了"
- **特点**: 以个人体验为切入点，增强可信度

### 5. 情感钩子型 (emotional-hook)
- **结构**: [情感词汇] + [核心价值] + [行动召唤]
- **示例**: "太惊艳了！这个AI让我的内容创作效率翻了3倍"
- **特点**: 使用强烈情感词汇，营造惊喜感

## 🛠 标题质量要求
- **长度 ≥ 8 字**，建议 ≥ 平台上限 × 70%
- **不能语义残缺**（如"AI的好处"、"AI的魅力"）
- **不得使用模板化结构**（如"盘点X个"、"X大技巧"、"建议收藏"）
- **不得使用滥情词语**（如"干货满满"、"效率拉满"）或无意义标点（如"！！！"、"｜"）

## ✂️ 表达完整性与长度控制（防截断）
每个标题必须为**表达完整的一句话**，不可为残句、半句、未结束短语；
禁止以"："、"，"、"…"、"和"等非句末成分结尾；
标题长度**必须严格控制在对应平台的全角字符限制内**（如小红书 ≤20字）；
不要为了塞关键词而导致语义逻辑断裂。

## ⚖️ V3版本标题排序机制（5维度质量评估权重）
| 评分维度             | 权重  | 说明 |
|----------------------|-------|------|
| 主旨拟合度            | 50%   | 标题是否与正文主旨高度匹配，关键词、语义场景对齐 |
| 情绪吸引力评分        | 20%   | 是否具有"冲突感、对比感、转变、情绪词"等吸引点 |
| 表达结构多样性        | 15%   | 与其他标题结构差异度是否足够，是否避免模版化 |
| 语义完整性评分        | 10%   | 句末是否闭合，语法是否通顺，避免"..."断尾或缺动词 |
| 字符利用率            | 5%    | 是否有效利用平台限定字数（非强制填满） |

请严格按照以上规范生成标题，确保每个标题都与原文内容高度相关，具备强吸引力，且表达自然完整。`;
  }

  /**
   * 标题生成用户提示词模板
   */
  private getTitleGenerationUserPrompt(): string {
    return `请基于以下正文内容生成{{outputCount}}个高吸引力标题（V3规范）：

【正文内容】
{{content}}

{{#if versions}}
【版本对比内容】
{{yellowh versions}}
版本{{@index}}: {{this.content}}
{{/each}}
{{/if}}

【生成要求】
- 目标平台：{{platform}}
- 输出数量：{{outputCount}}个
- 风格偏好：{{stylePreference}}
- 确保标题多样性和高质量

【输出格式】
请严格按照以下V3版本JSON格式返回结果：

\`\`\`json
{
  "version": "V3.0",
  "titles": [
    {
      "title": "标题内容",
      "style": "result-oriented",
      "length": 15,
      "scores": {
        "主旨拟合度": 0.85,
        "情绪吸引力": 0.78,
        "表达结构多样性": 0.90,
        "语义完整性": 0.95,
        "字符利用率": 0.70
      },
      "totalScore": 0.82,
      "reasoning": "V3评分分析：主旨高度匹配原文核心内容，情绪词汇运用恰当，结构独特避免模板化，语义完整无断句，字符利用合理"
    }
  ],
  "evaluation": {
    "averageScores": {
      "主旨拟合度": 0.83,
      "情绪吸引力": 0.76,
      "表达结构多样性": 0.88,
      "语义完整性": 0.92,
      "字符利用率": 0.72
    },
    "bestTitle": "最佳标题内容",
    "diversityIndex": 0.85
  }
}
\`\`\`

## ⚠️ V3版本重要约束（5维度强化要求）

### 📊 主旨拟合度要求（50%权重）
1. **语义贴合度必须≥75%**：每个标题都必须与正文内容高度相关
2. **禁止虚构内容**：不得添加正文中未提及的具体数据或效果
3. **避免空泛表达**：必须包含具体的对象名称或明确的价值主张
4. **场景信息明确**：必须包含具体的使用场景或平台信息

### 🎯 情绪吸引力要求（20%权重）
1. **冲突感营造**：使用对比、反差、意外等元素
2. **情绪词运用**：适度使用情感强烈的词汇
3. **转变暗示**：暗示使用前后的变化或效果
4. **好奇心激发**：制造悬念或引发疑问

### 🔄 表达结构多样性要求（15%权重）
1. **避免模板套用**：不得直接套用模板而忽略内容上下文
2. **句式变化**：确保不同标题使用不同的句式结构
3. **风格差异**：在5种标题风格间合理分布
4. **长度变化**：标题长度要有适当的变化

### ✅ 语义完整性要求（10%权重）
1. **确保表达完整**：标题语法正确，逻辑清晰，无截断或残句
2. **主谓搭配完整**：如"我用X后Y"必须明确Y是什么（效率、涨粉、时间等）
3. **量化信息具体**：如"提升200%"必须说明提升的是什么
4. **句末闭合**：避免"..."断尾或语义不完整

### 📏 字符利用率要求（5%权重）
1. **有效利用字数**：充分利用平台限定字数，但非强制填满
2. **信息密度优化**：在有限字符内传达更多有价值信息
3. **避免冗余**：删除不必要的修饰词和填充词

现在开始分析内容并生成标题：`;
  }

  /**
   * 标题质量检查系统提示词（V3版本）
   */
  private getTitleQualityCheckSystemPrompt(): string {
    return `你是一个专业的标题质量评估专家，使用V3版本的5维度评分体系对标题进行精准评估。

## 📊 V3版本评分维度与权重

| 评分维度             | 权重  | 说明 |
|----------------------|-------|------|
| 主旨拟合度            | 50%   | 标题是否与正文主旨高度匹配，关键词、语义场景对齐 |
| 情绪吸引力评分        | 20%   | 是否具有"冲突感、对比感、转变、情绪词"等吸引点 |
| 表达结构多样性        | 15%   | 与其他标题结构差异度是否足够，是否避免模版化 |
| 语义完整性评分        | 10%   | 句末是否闭合，语法是否通顺，避免"..."断尾或缺动词 |
| 字符利用率            | 5%    | 是否有效利用平台限定字数（非强制填满） |

你需要对每个维度进行0-1分的精确评分，并提供详细的分析理由。`;
  }

  /**
   * 标题质量检查用户提示词（V3版本）
   */
  private getTitleQualityCheckUserPrompt(): string {
    return `请对以下标题进行V3版本5维度质量评估：

【待评估标题】
{{title}}

【原始内容】
{{originalContent}}

【目标平台】
{{platform}}

{{#if otherTitles}}
【对比标题】（用于评估结构多样性）
{{otherTitles}}
{{/if}}

【评估要求】
请严格按照V3版本5维度评分体系进行评估：

1. **主旨拟合度（50%权重）**：
   - 标题是否准确反映原文核心内容
   - 关键词和语义场景是否对齐
   - 是否存在虚构或夸大的信息

2. **情绪吸引力（20%权重）**：
   - 是否具有冲突感、对比感、转变等吸引元素
   - 情绪词汇的使用是否恰当
   - 是否能激发用户的点击欲望

3. **表达结构多样性（15%权重）**：
   - 与其他标题的结构差异度
   - 是否避免了模板化表达
   - 句式和风格的独特性

4. **语义完整性（10%权重）**：
   - 语法是否正确通顺
   - 句末是否完整闭合
   - 是否存在断句或语义不完整

5. **字符利用率（5%权重）**：
   - 是否有效利用了平台字数限制
   - 信息密度是否合理
   - 是否存在冗余表达

【输出格式】
请严格按照以下JSON格式返回评估结果：

\`\`\`json
{
  "version": "V3.0",
  "title": "{{title}}",
  "platform": "{{platform}}",
  "scores": {
    "主旨拟合度": 0.85,
    "情绪吸引力": 0.78,
    "表达结构多样性": 0.90,
    "语义完整性": 0.95,
    "字符利用率": 0.70
  },
  "weightedScore": 0.82,
  "analysis": {
    "主旨拟合度": "详细分析标题与原文的匹配程度...",
    "情绪吸引力": "详细分析标题的吸引力元素...",
    "表达结构多样性": "详细分析标题的结构独特性...",
    "语义完整性": "详细分析标题的语法完整性...",
    "字符利用率": "详细分析标题的字符使用效率..."
  },
  "suggestions": [
    "具体的改进建议1",
    "具体的改进建议2"
  ],
  "grade": "A",
  "summary": "综合评估总结"
}
\`\`\`

现在开始评估标题质量：`;
  }

  /**
   * 品牌语料库提取系统提示词
   */
  private getBrandCorpusExtractionSystemPrompt(): string {
    return `你是一位专业的品牌策略顾问，专门从品牌资料中提取结构化信息以构建系统化品牌语料库。

## 🎯 核心任务
从品牌资料中精准提取9个维度的信息，构建完整的品牌语料库数据结构。

## 📊 品牌语料库9个维度

### 1️⃣ 基础信息维度
- **品牌名称**：正式名称、英文名称、简称别名
- **品牌描述**：品牌定位、主营产品、服务对象、文化风格

### 2️⃣ 语调风格维度
- **品牌语调**：整体语气风格（亲切、年轻、权威、理性、温暖等）
- **品牌个性**：人格化特征（专家型、伙伴型、引领者、创新者等）

### 3️⃣ 品牌身份维度
- **品牌Slogan**：品牌口号、主张、广告语
- **品牌价值观**：核心信念与行为准则
- **品牌愿景使命**：目标愿景和存在意义
- **品牌故事**：创立过程、成长轨迹、重要转折

### 4️⃣ 内容策略维度
- **广告语集**：所有推广语、宣传口号
- **产品描述词库**：产品介绍关键词短语
- **品牌核心话题**：常提及的核心话题词
- **品牌Hashtags**：社交媒体标签
- **品牌关键词**：5-15个核心关键词，按5个维度分类
  - 定位关键词：品牌在市场中的独特定位
  - 品类关键词：产品/服务类别相关词汇
  - 情感关键词：品牌想要传达的情感和感受
  - 差异化关键词：与竞争对手区别的独特词汇
  - 价值关键词：品牌核心价值和利益点
- **品牌禁用词**：明确禁用的词汇

## ⚖️ 提取原则
1. **精准提取**：严格按照原文内容，不虚构信息
2. **来源标记**：每个提取结果都要标明来源段落
3. **置信度评估**：对每个提取结果给出0-1的置信度评分
4. **结构化输出**：严格按照JSON格式返回结果
5. **完整覆盖**：尽可能覆盖所有9个维度`;
  }

  /**
   * 品牌语料库提取用户提示词
   */
  private getBrandCorpusExtractionUserPrompt(): string {
    return `请从以下品牌资料中提取语料库信息：

【文档信息】
- 文档ID：{{docId}}
- 文件名：{{fileName}}

【品牌资料内容】
{{brandContent}}

【提取要求】
请严格按照品牌语料库9个维度进行结构化提取，并在每项后标明【提取来源段落/句子内容】以便溯源。若资料中未明确提及，请输出：暂无，或尝试进行合理补充建议。

【各维度提取特别要求】

**1. 品牌语调 (brandTone)**：
- 分析文案的语言风格、表达方式、情感色彩
- 避免：亲切、专业等通用词，要具体化（如：温暖亲和、严谨专业、活力年轻）
- 必须提供支撑例句，体现语调特征

**2. 品牌个性 (brandPersonality)**：
- 分析品牌的人格化特征，如何与用户互动
- 避免：专家型、伙伴型等模糊词汇
- 要具体化：如"睿智导师型"、"贴心朋友型"、"创新先锋型"

**3. 品牌价值观 (values)**：
- 提取具体的行为准则和信念，不是空洞口号
- 避免：诚信、品质等通用词汇
- 要具体化：如"匠心传承古法工艺"、"坚持纯天然原料"

**4. 品牌故事 (brandStory)**：
- 按时间线提取：创立背景→发展历程→重要转折→现状成就
- 突出独特性：创始人理念、关键事件、文化传承
- 避免流水账，突出品牌特色故事

**5. 核心话题 (coreTopics)**：
- 按重要性分层：核心话题（3-5个）、次要话题（5-8个）
- 避免：文化、品质等宽泛词汇
- 要具体化：如"东方哲学智慧"、"古法酿造工艺"

**6. 关键词提取**：
按以下5个维度分类提取，每个维度2-4个词：
- **定位关键词**：品牌在市场中的独特定位（如：高端、专业、创新、传统等）
- **品类关键词**：产品/服务类别词汇（如：白酒、科技、教育、金融等）
- **情感关键词**：品牌传达的情感（如：信任、温暖、激情、优雅等）
- **差异化关键词**：与竞争对手区别的独特词汇（如：工艺、理念、文化等）
- **价值关键词**：品牌核心价值点（如：品质、服务、体验、创新等）

**通用要求**：
- 避免过于宽泛的词汇（如：好、优秀、文化、品质）
- 突出品牌独特性，避免通用词汇
- 每个提取结果都要有明确的来源依据
- 注重差异化，体现品牌特色

【输出格式】
请严格按照以下JSON格式返回提取结果：

\`\`\`json
{
  "docId": "{{docId}}",
  "extractionTimestamp": "2025-01-05T15:30:00Z",
  "extractedFields": {
    "brandName": {
      "value": "品牌名称",
      "excerpt": "提取来源段落",
      "confidence": 0.9
    },
    "englishName": {
      "value": "Brand Name",
      "excerpt": "提取来源段落",
      "confidence": 0.8
    },
    "aliases": {
      "value": ["简称1", "简称2"],
      "excerpt": "提取来源段落",
      "confidence": 0.7
    },
    "brandDescription": {
      "value": "品牌描述内容",
      "excerpt": "提取来源段落",
      "confidence": 0.8
    },
    "brandTone": {
      "value": ["具体语调词1", "具体语调词2", "具体语调词3"],
      "examples": ["支撑例句1", "支撑例句2"],
      "analysis": "语调分析说明",
      "excerpt": "提取来源段落",
      "confidence": 0.7
    },
    "brandPersonality": {
      "value": ["具体人格特征1", "具体人格特征2"],
      "description": "人格化描述",
      "interaction_style": "与用户互动方式",
      "excerpt": "提取来源段落",
      "confidence": 0.8
    },
    "slogans": {
      "value": ["品牌口号1", "品牌口号2"],
      "excerpt": "提取来源段落",
      "confidence": 0.9
    },
    "values": {
      "value": ["具体价值观1", "具体价值观2", "具体价值观3"],
      "descriptions": ["价值观详细描述1", "价值观详细描述2"],
      "behavioral_guidelines": ["行为准则1", "行为准则2"],
      "excerpt": "提取来源段落",
      "confidence": 0.8
    },
    "missionVision": {
      "mission": "具体使命描述",
      "vision": "具体愿景描述",
      "goals": ["具体目标1", "具体目标2"],
      "excerpt": "提取来源段落",
      "confidence": 0.7
    },
    "brandStory": {
      "value": "品牌故事完整内容",
      "timeline": {
        "founding": "创立背景",
        "development": "发展历程",
        "milestones": ["重要里程碑1", "重要里程碑2"],
        "current": "现状成就"
      },
      "key_figures": ["关键人物1", "关键人物2"],
      "unique_elements": ["独特元素1", "独特元素2"],
      "excerpt": "提取来源段落",
      "confidence": 0.8
    },
    "adSlogans": {
      "value": ["广告语1", "广告语2"],
      "excerpt": "提取来源段落",
      "confidence": 0.8
    },
    "productDescriptors": {
      "value": ["高品质", "创新设计", "用户友好"],
      "excerpt": "提取来源段落",
      "confidence": 0.7
    },
    "coreTopics": {
      "primary": ["核心话题1", "核心话题2", "核心话题3"],
      "secondary": ["次要话题1", "次要话题2", "次要话题3"],
      "frequency": [8, 6, 4, 3, 2, 2],
      "context": ["话题使用场景1", "话题使用场景2"],
      "excerpt": "提取来源段落",
      "confidence": 0.8
    },
    "hashtags": {
      "value": ["#具体标签1", "#具体标签2", "#具体标签3"],
      "categories": {
        "brand": ["#品牌相关标签"],
        "product": ["#产品相关标签"],
        "lifestyle": ["#生活方式标签"],
        "values": ["#价值观标签"]
      },
      "usage_scenarios": ["使用场景1", "使用场景2"],
      "excerpt": "提取来源段落",
      "confidence": 0.7
    },
    "keywords": {
      "value": {
        "positioning": ["定位关键词1", "定位关键词2"],
        "category": ["品类关键词1", "品类关键词2"],
        "emotion": ["情感关键词1", "情感关键词2"],
        "differentiation": ["差异化关键词1", "差异化关键词2"],
        "value": ["价值关键词1", "价值关键词2"]
      },
      "excerpt": "提取来源段落",
      "confidence": 0.8
    },
    "forbiddenWords": {
      "value": ["禁用词1", "禁用词2"],
      "excerpt": "提取来源段落",
      "confidence": 0.9
    }
  },
  "aiSuggestions": {
    "brandTone": ["建议补充的语调词"],
    "keywords": ["建议补充的关键词"],
    "coreTopics": ["建议补充的话题"]
  },
  "extractionSummary": {
    "totalFields": 16,
    "extractedFields": 12,
    "averageConfidence": 0.82,
    "missingFields": ["字段名1", "字段名2"]
  }
}
\`\`\`

请确保返回有效的JSON格式，每个字段都包含value、excerpt和confidence三个属性。开始提取：`;
  }

  /**
   * 品牌语料库冲突解决系统提示词
   */
  private getBrandCorpusConflictSystemPrompt(): string {
    return `你是一位专业的品牌语料库管理专家，专门处理多来源信息的冲突和合并。

## 🎯 核心任务
当多个品牌资料文档对同一字段提供不同信息时，智能分析并提供最佳的合并方案。

## ⚖️ 冲突解决原则

### 1️⃣ 优先级机制
1. **官方权威性**：官方文档 > 第三方介绍 > 用户生成内容
2. **时间新近性**：最新信息 > 历史信息
3. **置信度权重**：高置信度 > 低置信度
4. **信息完整性**：详细信息 > 简略信息

### 2️⃣ 合并策略
- **互补合并**：不同来源提供不同维度的信息
- **优选合并**：选择最权威、最新、最完整的版本
- **融合合并**：将多个来源的信息智能融合
- **保留冲突**：无法确定时保留多个版本供用户选择

### 3️⃣ 质量控制
- 确保合并后信息的一致性和逻辑性
- 保持品牌调性的统一性
- 避免信息冗余和矛盾
- 提供清晰的来源追溯

你需要分析冲突原因，提供合并建议，并给出最终的统一版本。`;
  }

  /**
   * 品牌语料库冲突解决用户提示词
   */
  private getBrandCorpusConflictUserPrompt(): string {
    return `请帮助解决以下品牌语料库字段的冲突：

【品牌名称】
{{brandName}}

【冲突字段】
{{yellowh conflictingFields}}
### 字段：{{fieldName}}

**来源1：{{source1.docId}}** (置信度: {{source1.confidence}})
- 内容：{{source1.value}}
- 来源：{{source1.excerpt}}

**来源2：{{source2.docId}}** (置信度: {{source2.confidence}})
- 内容：{{source2.value}}
- 来源：{{source2.excerpt}}

{{#if source3}}
**来源3：{{source3.docId}}** (置信度: {{source3.confidence}})
- 内容：{{source3.value}}
- 来源：{{source3.excerpt}}
{{/if}}

---
{{/each}}

【解决要求】
1. 分析每个冲突字段的差异原因
2. 根据优先级机制选择最佳版本或提供合并方案
3. 确保最终结果的一致性和品牌调性统一
4. 提供清晰的决策理由

【输出格式】
请严格按照以下JSON格式返回冲突解决方案：

\`\`\`json
{
  "brandName": "{{brandName}}",
  "conflictResolution": {
    "字段名1": {
      "conflictAnalysis": "冲突原因分析",
      "resolutionStrategy": "优选合并|互补合并|融合合并|保留冲突",
      "finalValue": "最终统一的值",
      "finalExcerpt": "合并后的来源说明",
      "finalConfidence": 0.9,
      "reasoning": "选择这个方案的详细理由",
      "alternativeOptions": [
        {
          "option": "备选方案1",
          "reasoning": "备选理由"
        }
      ]
    }
  },
  "overallAssessment": {
    "totalConflicts": 3,
    "resolvedConflicts": 2,
    "remainingConflicts": 1,
    "brandConsistencyScore": 0.85,
    "recommendations": [
      "建议1：需要获取更多官方资料确认",
      "建议2：建议统一品牌表述规范"
    ]
  }
}
\`\`\`

开始分析和解决冲突：`;
  }

  /**
   * 九宫格创意魔方系统提示词（保持原有逻辑）
   */
  private getCreativeGenerationSystemPrompt(): string {
    return `You are an expert social media copywriter and brand storyteller.

Your job is to generate emotionally resonant and platform-ready marketing content based on user-selected dimensions, using natural human language and realistic storytelling.

---

🧭 Writing Rules:

1. You MUST fully integrate all provided dimensions into a **cohesive, vivid, and emotionally realistic** storyline — **no keywords or labels**.

2. Only use dimensions that are explicitly provided. Do not invent or assume any missing information.

3. 🖼 For graphic content (图文):
   - Start with a strong emotional hook.
   - Present a realistic pain point within the selected scenario.
   - Transition naturally into a solution or product tied to the industry.
   - Close with relatable interaction prompts (e.g. "你也有这种烦恼吗？快来评论！").

4. 🎥 For video content:
   - Output a structured script with: Scene description, camera movement, dialogue/subtitle, visual cues, BGM suggestion, emotional tone.
   - Use real-life pacing and emotion fit for TikTok/Xiaohongshu.

5. 💬 Language must:
   - Match the tone and voice of the selected audience.
   - Avoid marketing clichés like "提升用户体验" or "打造差异化".
   - Use conversational, emoji-rich, platform-native expressions.

---

🚫 Never:
- Invent or assume dimensions not provided.
- Output generic frameworks, bullet points, or headings.
- Repeat input words mechanically without meaningful transformation.
- Generate placeholder content.

🎯 Goal:
Your output must feel like it was written by a real KOC or content strategist — creative, emotionally engaging, and 100% based on the provided input.`;
  }

  /**
   * 九宫格创意魔方用户提示词
   */
  private getCreativeGenerationUserPrompt(): string {
    return `请基于以下信息生成创意{{contentType}}：

目标客群：{{targetAudience}}
使用场景：{{useCase}}
用户痛点：{{painPoint}}
{{#if additionalContext}}
补充信息：{{additionalContext}}
{{/if}}

要求：
1. 内容要贴合目标用户的需求和痛点
2. 场景化表达，具有代入感
3. 提供具体可行的解决方案
4. {{#if contentType === 'video'}}包含画面描述和文案{{else}}文案简洁有力，易于传播{{/if}}
5. 长度适中，适合社交媒体传播

请直接输出创意内容：`;
  }

  /**
   * 内容适配系统提示词（多维矩阵提示词系统）
   */
  private getContentAdaptationSystemPrompt(): string {
    return `你是一位专业的多维度内容创作专家，使用多维矩阵提示词系统进行内容适配。

## 🎯 多维矩阵提示词系统核心机制

你需要根据以下多维矩阵要求生成高质量内容，每个维度都必须在最终内容中得到体现：

### 📊 多维矩阵维度（按优先级排序）
1. **【品牌维度 - 最高优先级】** - 品牌库内容和品牌调性
2. **【原始内容维度】** - 用户输入的核心内容
3. **【目标平台维度】** - 平台特性和用户习惯
4. **【内容形式维度】** - 内容类型和结构要求
5. **【表达风格维度】** - 语言风格和表达方式
6. **【用户自定义维度】** - 用户特殊要求
7. **【字符数控制维度】** - 长度限制和优化
8. **【格式化要求维度】** - 输出格式规范
9. **【差异化维度】** - 防模板化和独特性

### ⚖️ 优先级机制
1. **品牌库 > 用户选择 > 平台默认**
2. **维度越多，内容越个性化且具辨识度**
3. **禁止静态模板，必须动态适应输入维度**
4. **所有维度必须在最终内容中得到体现**

### 🚫 质量控制要求
- 严格按照所有维度要求生成内容
- 确保内容具有强烈的差异化特色
- 避免模板化表达，每次生成都要有独特性
- 直接输出最终内容，不要包含任何说明文字`;
  }

  /**
   * 内容适配用户提示词（多维矩阵提示词系统）
   */
  private getContentAdaptationUserPrompt(): string {
    return `请根据以下多维矩阵要求生成高质量的{{platform}}平台内容：

## 📊 多维矩阵维度要求

### 【品牌维度 - 最高优先级】
{{#if brandContent}}
- 品牌调性：{{brandTone}}
- 品牌关键词：{{brandKeywords}}
- 品牌风格：{{brandStyle}}
- 品牌价值观：{{brandValues}}
{{else}}
- 无品牌库内容，使用平台默认调性
{{/if}}

### 【原始内容维度】
- 核心内容：{{originalContent}}
- 内容长度：{{originalLength}}字符
- 内容类型：{{contentType}}

### 【目标平台维度】
- 平台：{{platform}}
- 语调风格：{{platformTone}}
- 内容风格：{{platformContentStyle}}
- 互动方式：{{platformInteractionStyle}}
- 平台特征：{{platformFeatures}}
- 最佳长度：{{platformOptimalLength}}字符

### 【内容形式维度】
{{#if formId}}
- 内容形式：{{formName}}
- 形式描述：{{formDescription}}
- 输出类型：{{formOutputType}}
- 内容特征：{{formCharacteristics}}
- 结构要求：{{yellowh formStructure}}{{@index}}. {{this}} {{/each}}
{{else}}
- 使用平台默认内容形式
{{/if}}

### 【表达风格维度】
{{#if styleName}}
- 风格名称：{{styleName}}
- 风格描述：{{styleDescription}}
- 风格特征：{{styleCharacteristics}}
- 关键词汇：{{styleToneKeywords}}
{{else}}
- 风格：{{style}}
{{/if}}

### 【用户自定义维度】
{{#if customRequirements}}
- 自定义要求：{{customRequirements}}
{{else}}
- 无特殊自定义要求
{{/if}}

### 【字符数控制维度】
{{#if charCount}}
- 严格限制：{{charCount}}字符以内，不得超出
- 优化策略：在限制内最大化信息密度
{{else}}
- 建议长度：{{platformOptimalLength}}字符范围内
{{/if}}

### 【格式化要求维度】
- 输出格式：纯文本内容，无说明文字
- 内容结构：符合{{platform}}平台发布格式
- 特殊要求：{{#if formId}}按{{formName}}结构组织{{else}}平台标准格式{{/if}}

### 【差异化维度】
- 独特性要求：避免模板化表达
- 个性化程度：高度个性化，具有辨识度
- 创新要素：融入创新表达和独特视角

## ⚖️ 优先级执行机制
1. **品牌维度优先**：如有品牌库内容，必须优先体现品牌调性
2. **维度完整性**：所有提供的维度都必须在最终内容中体现
3. **动态适应**：根据输入维度数量动态调整内容个性化程度
4. **质量保证**：确保内容具有强烈差异化特色和平台适配性

## 🎯 最终生成要求
严格按照以上多维矩阵要求生成内容，确保：
- 所有维度在最终内容中得到体现
- 内容具有强烈的差异化特色
- 避免模板化表达，每次生成都有独特性
- 完全符合{{platform}}平台特性和用户习惯

请直接输出最终适配内容：`;
  }

  /**
   * 品牌分析系统提示词（保持原有逻辑）
   */
  private getBrandAnalysisSystemPrompt(): string {
    return `你是一个专业的品牌分析师，擅长分析品牌内容的调性、关键词、目标受众等特征。

你需要从品牌内容中提取出：
1. 品牌调性和风格特征
2. 核心关键词和价值主张
3. 目标受众画像
4. 内容策略建议

请确保分析结果准确、专业、可操作。`;
  }

  /**
   * 品牌分析用户提示词
   */
  private getBrandAnalysisUserPrompt(): string {
    return `请分析以下品牌内容：

【品牌内容】
{{brandContent}}

【分析类型】
{{analysisType}}

{{#if targetAudience}}
【目标受众】
{{targetAudience}}
{{/if}}

请从以下维度进行分析：
1. 品牌调性分析
2. 核心关键词提取
3. 目标受众特征
4. 内容风格特点
5. 营销策略建议

请以JSON格式返回分析结果。`;
  }

  /**
   * PDF对话系统提示词（保持原有逻辑）
   */
  private getPDFChatSystemPrompt(): string {
    return `你是一个专业的PDF文档分析助手，能够准确理解文档内容并回答相关问题。

你需要：
1. 仔细阅读和理解PDF文档内容
2. 准确回答用户关于文档的问题
3. 提供详细、有用的信息
4. 如果问题超出文档范围，请明确说明

请确保回答准确、专业、有帮助。`;
  }

  /**
   * PDF对话用户提示词
   */
  private getPDFChatUserPrompt(): string {
    return `请分析以下PDF内容并回答问题：

【PDF内容】
{{documentContent}}

【问题】
{{question}}

请基于PDF内容提供准确、详细的回答。如果问题超出文档范围，请明确说明。`;
  }

  /**
   * Emoji生成系统提示词（保持原有逻辑）
   */
  private getEmojiGenerationSystemPrompt(): string {
    return `你是一个专业的表情符号设计师，擅长创作有趣、生动的表情符号描述。

你需要：
1. 根据角色、品牌风格和情感要求创作描述
2. 描述要生动具体，包含表情、动作、色彩等细节
3. 符合品牌风格和角色特征
4. 准确表达指定的情感
5. 适合制作成表情符号

请确保描述创意、生动、可执行。`;
  }

  /**
   * Emoji生成用户提示词
   */
  private getEmojiGenerationUserPrompt(): string {
    return `请为以下要求生成表情符号的详细描述：

角色：{{character}}
品牌风格：{{brand}}
情感表达：{{emotion}}

要求：
1. 描述要生动具体，包含表情、动作、色彩等细节
2. 符合品牌风格和角色特征
3. 准确表达指定的情感
4. 适合制作成表情符号

请直接输出表情符号的描述：`;
  }

  /**
   * 平台风格适配系统提示词（封装原有逻辑）
   */
  private getPlatformStyleAdaptationSystemPrompt(): string {
    return `你是一位专业的多平台内容创作专家，深度理解不同平台的用户习惯、内容风格和互动方式。

你的核心能力：
1. 精准识别平台特征和用户偏好
2. 根据平台调性调整内容风格
3. 融入平台特有的互动元素
4. 确保内容具有强烈的平台差异化特色

你需要确保适配后的内容：
- 完全符合目标平台的用户习惯
- 具有明显的平台识别度
- 保持原始内容的核心价值
- 达到最佳的传播效果`;
  }

  /**
   * 平台风格适配用户提示词
   */
  private getPlatformStyleAdaptationUserPrompt(): string {
    return `请将以下内容适配到{{platform}}平台：

【原始内容】
{{originalContent}}

【平台特征要求】
- 平台：{{platform}}
- 语调风格：{{platformTone}}
- 内容风格：{{platformContentStyle}}
- 互动方式：{{platformInteractionStyle}}
- 平台特征：{{platformFeatures}}

【表达风格】
{{styleDescription}}

{{#if charCount}}
【字符数控制】
严格控制在{{charCount}}字符以内，不得超出此限制
{{/if}}

【生成要求】
1. 必须体现{{platform}}平台的独特风格和用户习惯
2. 内容要有明显的平台差异化特色
3. {{#if charCount}}字符数必须控制在{{charCount}}字符以内{{/if}}
4. 融入{{platform}}平台的互动元素和表达习惯
5. 确保内容质量高、吸引力强、符合平台调性

请直接输出最终内容，不要包含任何说明文字。`;
  }

  /**
   * 内容形式处理系统提示词
   */
  private getContentFormProcessingSystemPrompt(): string {
    return `你是一位专业的内容形式转换专家，擅长将内容转换为不同的表现形式。

你的核心能力：
1. 理解不同内容形式的特点和要求
2. 保持内容核心价值的同时调整结构
3. 根据形式特征优化表达方式
4. 确保转换后的内容符合形式规范

支持的内容形式包括：
- 图文种草：第一人称体验分享
- 视频脚本：结构化脚本格式
- 专业解读：深度分析文章
- 访谈对话：问答互动形式
- 观点洞察：思辨性内容`;
  }

  /**
   * 内容形式处理用户提示词
   */
  private getContentFormProcessingUserPrompt(): string {
    return `请将以下内容转换为{{formName}}形式：

【原始内容】
{{originalContent}}

【目标形式】
- 形式名称：{{formName}}
- 形式描述：{{formDescription}}
- 输出类型：{{formOutputType}}
- 内容特征：{{formCharacteristics}}

【内容结构要求】
{{yellowh formStructure}}
{{@index}}. {{this}}
{{/each}}

【平台适配】
目标平台：{{platform}}
表达风格：{{style}}

【生成要求】
1. 严格按照{{formName}}的形式结构生成
2. 保持原始内容的核心信息
3. 符合{{platform}}平台的表达习惯
4. 体现{{formName}}的独特特征
5. 确保内容质量和吸引力

请直接输出转换后的内容：`;
  }

  /**
   * 表达风格管理系统提示词
   */
  private getExpressionStyleManagementSystemPrompt(): string {
    return `你是一位专业的表达风格控制专家，能够精准调整内容的语言风格和表达方式。

你的核心能力：
1. 识别和应用不同的表达风格
2. 保持内容核心信息的同时调整语调
3. 根据风格特征选择合适的词汇和句式
4. 确保风格转换的自然和一致性

支持的表达风格：
- 专业权威：使用专业术语，逻辑清晰
- 轻松自然：语言亲切，贴近生活
- 幽默风趣：增加趣味性和传播性
- 情感化：注重情感表达，引起共鸣`;
  }

  /**
   * 表达风格管理用户提示词
   */
  private getExpressionStyleManagementUserPrompt(): string {
    return `请将以下内容调整为{{styleName}}风格：

【原始内容】
{{originalContent}}

【目标风格】
- 风格名称：{{styleName}}
- 风格描述：{{styleDescription}}
- 风格特征：{{styleCharacteristics}}
- 关键词汇：{{styleToneKeywords}}

【平台要求】
目标平台：{{platform}}

【调整要求】
1. 严格按照{{styleName}}风格调整语言表达
2. 保持原始内容的核心信息和逻辑
3. 使用符合风格特征的词汇和句式
4. 确保风格转换的自然和一致性
5. 适配{{platform}}平台的表达习惯

请直接输出调整后的内容：`;
  }
}

// ==================== 全局实例和导出 ====================

/**
 * 全局提示词系统实例
 */
export const promptSystem = new PromptSystemManager();

/**
 * 🎯 统一提示词获取函数 - 主要调用接口
 *
 * @param type 提示词类型
 * @param params 提示词参数
 * @returns 格式化后的提示词
 *
 * @example
 * ```typescript
 * // 获取标题生成提示词
 * const { systemPrompt, userPrompt } = getPrompt(PromptType.TITLE_GENERATION_SYSTEM, {
 *   content: "文章内容",
 *   platform: "xiaohongshu",
 *   outputCount: 5
 * });
 *
 * // 获取九宫格创意提示词
 * const { systemPrompt, userPrompt } = getPrompt(PromptType.CREATIVE_GENERATION_SYSTEM, {
 *   targetAudience: "年轻女性",
 *   useCase: "护肤品推广",
 *   painPoint: "皮肤干燥",
 *   contentType: "text"
 * });
 * ```
 */
export function getPrompt(type: PromptType, params: PromptParams = {}): {
  systemPrompt?: string;
  userPrompt: string;
} {
  return promptSystem.getPrompt(type, params);
}

/**
 * 🔍 获取所有提示词模板信息
 */
export function getAllPromptTemplates(): PromptTemplate[] {
  return promptSystem.getAllPrompts();
}

/**
 * 📊 获取提示词系统统计信息
 */
export function getPromptSystemStats(): {
  totalPrompts: number;
  promptsByCategory: Record<string, number>;
  lastUpdated: string;
} {
  return promptSystem.getStats();
}

// ==================== 

/**
 * 
 */
export const PROMPT_SYSTEM_MODULE_LOCK = {
  signature: PROMPT_SYSTEM_LOCK_SIGNATURE,
  version: '1.0.0',
  createdAt: PROMPT_SYSTEM_CREATION_TIME,
  lockedAt: Date.now(),
  promptTypes: Object.values(PromptType),
  totalPrompts: Object.keys(PromptType).length
};

/**
 * 🛡️ 提示词系统完整性验证
 */
export function verifyPromptSystemIntegrity(): boolean {
  try {
    // 验证所有提示词类型都有对应的模板
    const allPrompts = promptSystem.getAllPrompts();
    const registeredTypes = allPrompts.map(p => p.type);

    const missingTypes = Object.values(PromptType).filter(type =>
      !registeredTypes.includes(type)
    );

    if (missingTypes.length > 0) {
      console.error('🚨 提示词系统完整性验证失败: 缺少提示词类型', missingTypes);
      return false;
    }

    logger.debug('✅ 提示词系统完整性验证通过');
    return true;
  } catch (error) {
    console.error('🚨 提示词系统完整性验证异常:', error);
    return false;
  }
}

// 
logModuleLock('提示词系统模块', PROMPT_SYSTEM_MODULE_LOCK.signature);

// ==================== 九宫格创意魔方提示词系统 ====================

/**
 * 九宫格创意魔方维度定义
 */
export interface CreativeCubeDimension {
  id: string;
  name: string;
  description: string;
  isRequired: boolean;
  isRecommended?: boolean;
}

/**
 * 九宫格创意魔方选择项
 */
export interface CreativeCubeSelection {
  target_audience?: string;
  use_case?: string;
  pain_point?: string;
  industry?: string;
  core_value?: string;
  tone_style?: string;
  content_format?: string;
  emotional_need?: string;
  platform_or_trend?: string;
}

/**
 * 九宫格创意魔方配置
 */
export interface CreativeCubeConfig {
  selectedItems: CreativeCubeSelection;
  pinnedDimensions: string[];
  selectedDimensionIds: string[];
}

/**
 * 获取九宫格创意魔方的维度定义
 */
export function getCreativeCubeDimensions(): CreativeCubeDimension[] {
  return [
    // 必选维度 (4个)
    {
      id: 'target_audience',
      name: '目标客群',
      description: '选择目标用户群体（必选）',
      isRequired: true
    },
    {
      id: 'use_case',
      name: '使用场景',
      description: '定义具体使用情境（必选）',
      isRequired: true
    },
    {
      id: 'pain_point',
      name: '用户痛点',
      description: '识别核心问题（必选）',
      isRequired: true
    },
    {
      id: 'industry',
      name: '行业',
      description: '所属行业领域（必选）',
      isRequired: true
    },
    // 推荐维度 (3个)
    {
      id: 'core_value',
      name: '核心价值',
      description: '产品/服务核心价值',
      isRequired: false,
      isRecommended: true
    },
    {
      id: 'tone_style',
      name: '表达风格',
      description: '内容表达调性',
      isRequired: false,
      isRecommended: true
    },
    {
      id: 'content_format',
      name: '内容形式',
      description: '输出内容格式',
      isRequired: false,
      isRecommended: true
    },
    // 可选维度 (2个)
    {
      id: 'emotional_need',
      name: '情感诉求',
      description: '用户情感需求',
      isRequired: false,
      isRecommended: false
    },
    {
      id: 'platform_or_trend',
      name: '平台/趋势',
      description: '平台特性或热点趋势',
      isRequired: false,
      isRecommended: false
    }
  ];
}

/**
 * 获取必选维度ID列表
 */
export function getRequiredDimensionIds(): string[] {
  return getCreativeCubeDimensions()
    .filter(dim => dim.isRequired)
    .map(dim => dim.id);
}

/**
 * 获取推荐维度ID列表
 */
export function getRecommendedDimensionIds(): string[] {
  return getCreativeCubeDimensions()
    .filter(dim => dim.isRecommended)
    .map(dim => dim.id);
}

/**
 * 获取可选维度ID列表
 */
export function getOptionalDimensionIds(): string[] {
  return getCreativeCubeDimensions()
    .filter(dim => !dim.isRequired && !dim.isRecommended)
    .map(dim => dim.id);
}

/**
 * 智能选择维度组合
 * @param totalCount 总维度数量 (4-9)
 * @param pinnedDimensions 固定的维度ID列表
 * @returns 选择的维度ID列表
 */
export function selectDimensionCombination(
  totalCount: number,
  pinnedDimensions: string[] = []
): string[] {
  const requiredDims = getRequiredDimensionIds();
  const recommendedDims = getRecommendedDimensionIds();
  const optionalDims = getOptionalDimensionIds();

  // 确保总数在有效范围内
  const validTotalCount = Math.max(4, Math.min(9, totalCount));

  // 开始构建选择列表
  const selectedDims = new Set<string>();

  // 1. 添加所有必选维度
  requiredDims.forEach(dim => selectedDims.add(dim));

  // 2. 添加固定的维度
  pinnedDimensions.forEach(dim => selectedDims.add(dim));

  // 3. 如果还需要更多维度，从推荐和可选中随机选择
  const remainingCount = validTotalCount - selectedDims.size;
  if (remainingCount > 0) {
    // 合并推荐和可选维度，优先推荐维度
    const availableDims = [
      ...recommendedDims.filter(dim => !selectedDims.has(dim)),
      ...optionalDims.filter(dim => !selectedDims.has(dim))
    ];

    // 随机打乱并选择需要的数量
    const shuffled = availableDims.sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, remainingCount);
    selected.forEach(dim => selectedDims.add(dim));
  }

  return Array.from(selectedDims);
}

/**
 * 构建九宫格创意魔方的AI提示词 - 重构版
 */
export function buildCreativeCubePrompt(config: CreativeCubeConfig): string {
  const { selectedItems, pinnedDimensions, selectedDimensionIds } = config;
  const dimensions = getCreativeCubeDimensions();

  // 分析选择的维度
  const requiredDimensions = getRequiredDimensionIds();
  const selectedRequired = selectedDimensionIds.filter(id => requiredDimensions.includes(id));
  const selectedOptional = selectedDimensionIds.filter(id => !requiredDimensions.includes(id));

  // 构建核心维度信息（必选维度）
  const coreContext = buildCoreContext(selectedItems, selectedRequired, dimensions);

  // 构建增强维度信息（可选维度）
  const enhancementContext = buildEnhancementContext(selectedItems, selectedOptional, dimensions);

  // 构建固定维度约束
  const pinnedConstraints = buildPinnedConstraints(pinnedDimensions, dimensions);

  // 确定内容类型和风格
  const contentType = selectedItems.content_format || '图文';
  const toneStyle = selectedItems.tone_style || '专业可信';
  const platform = selectedItems.platform_or_trend || '小红书';

  // 构建系统提示词
  const systemPrompt = buildCreativeCubeSystemPrompt(contentType, toneStyle, platform);

  // 构建用户提示词
  const userPrompt = `${systemPrompt}

## 🎯 核心创意维度（必须严格遵循）
${coreContext}

${enhancementContext ? `## ✨ 增强创意维度（用于丰富内容）
${enhancementContext}` : ''}

${pinnedConstraints ? `## ⚠️ 固定维度约束
${pinnedConstraints}` : ''}

## 📋 生成要求
1. **维度关联性**：生成的内容必须与所有选择的维度强相关，每个维度都要在内容中得到体现
2. **避免模板化**：禁止使用"提升效率""提供安全感"等通用模板话术
3. **真实感强**：内容要贴近真实生活场景，有具体的情境描述
4. **个性化表达**：根据目标受众的特点调整语言风格和表达方式
5. **互动性强**：结尾要有明确的互动引导，鼓励用户参与讨论

## 🚫 禁止输出
- 不要包含任何格式化标记（如**标题**、【正文】等）
- 不要包含emoji节奏说明（如✨emoji节奏：...）
- 不要包含配图建议（如（配图建议：...））
- 不要包含字数统计（如（全文X字，...））
- 不要包含策略说明或创作思路

## 📝 输出要求
请直接输出一段完整的、可直接使用的创意内容，确保内容自然流畅、逻辑清晰、与所选维度高度匹配。`;

  return userPrompt;
}

/**
 * 构建核心维度上下文
 */
function buildCoreContext(selectedItems: CreativeCubeSelection, requiredIds: string[], dimensions: CreativeCubeDimension[]): string {
  const contexts: string[] = [];

  requiredIds.forEach(dimId => {
    const dimension = dimensions.find(d => d.id === dimId);
    const value = selectedItems[dimId as keyof CreativeCubeSelection];
    if (dimension && value) {
      contexts.push(`- **${dimension.name}**：${value} ${getDimensionDescription(dimId, value)}`);
    }
  });

  return contexts.join('\n');
}

/**
 * 构建增强维度上下文
 */
function buildEnhancementContext(selectedItems: CreativeCubeSelection, optionalIds: string[], dimensions: CreativeCubeDimension[]): string {
  const contexts: string[] = [];

  optionalIds.forEach(dimId => {
    const dimension = dimensions.find(d => d.id === dimId);
    const value = selectedItems[dimId as keyof CreativeCubeSelection];
    if (dimension && value) {
      contexts.push(`- **${dimension.name}**：${value} ${getDimensionDescription(dimId, value)}`);
    }
  });

  return contexts.length > 0 ? contexts.join('\n') : '';
}

/**
 * 构建固定维度约束
 */
function buildPinnedConstraints(pinnedDimensions: string[], dimensions: CreativeCubeDimension[]): string {
  if (pinnedDimensions.length === 0) return '';

  const constraints = pinnedDimensions.map(dimId => {
    const dimension = dimensions.find(d => d.id === dimId);
    return dimension ? `- ${dimension.name}：此维度已固定，必须严格遵循，不得偏离` : '';
  }).filter(Boolean);

  return constraints.join('\n');
}

/**
 * 获取维度描述信息
 */
function getDimensionDescription(dimensionId: string, value: string): string {
  const descriptions: Record<string, Record<string, string>> = {
    'target_audience': {
      '宝妈': '（关注育儿、家庭、实用性）',
      'Z世代': '（追求个性、潮流、社交认同）',
      '职场人': '（注重效率、专业、时间管理）',
      '银发族': '（重视健康、安全、简单易用）'
    },
    'use_case': {
      '通勤': '（时间碎片化、移动场景、效率需求）',
      '健身': '（运动场景、健康意识、坚持动力）',
      '居家生活': '（舒适环境、家庭氛围、生活品质）'
    },
    'pain_point': {
      '时间不够用': '（效率焦虑、时间管理困难）',
      '选择困难症': '（信息过载、决策困难）',
      '预算有限': '（性价比考量、经济压力）'
    },
    'tone_style': {
      '轻松幽默': '（轻松愉快、有趣互动、降低门槛）',
      '专业可信': '（权威可靠、数据支撑、专业建议）',
      '情感共鸣': '（情感连接、感同身受、温暖治愈）'
    }
  };

  return descriptions[dimensionId]?.[value] || '';
}

/**
 * 构建创意魔方系统提示词
 */
function buildCreativeCubeSystemPrompt(contentType: string, toneStyle: string, platform: string): string {
  return `你是一个专业的创意内容生成专家，擅长根据多维度信息生成高质量的${platform}平台${contentType}内容。

## 🎨 创作原则
1. **维度驱动**：严格根据用户选择的维度信息创作，确保每个维度都在内容中得到体现
2. **风格一致**：保持${toneStyle}的表达风格，符合目标受众的阅读习惯
3. **平台适配**：内容要符合${platform}平台的特点和用户行为习惯
4. **真实可信**：避免空洞的营销话术，要有具体的场景和细节
5. **互动导向**：内容要能引发用户的共鸣和互动欲望`;
}

// 🔧 FIXED: 移除模块级别的自动执行代码，避免TDZ错误
// 这个自动执行代码是"提示词系统logger TDZ"错误的根源
// verifyPromptSystemIntegrity函数内部使用了logger.debug，导致TDZ错误

/**
 * 手动初始化提示词系统完整性验证
 * 🚨 重要：此函数不再自动执行，需要在适当时机手动调用
 */
export function initializePromptSystemVerification(): void {
  if (typeof window !== 'undefined') {
    // 浏览器环境下延迟验证
    setTimeout(() => {
      verifyPromptSystemIntegrity();
    }, 1000);
  } else {
    // Node.js环境下立即验证
    verifyPromptSystemIntegrity();
  }
}
