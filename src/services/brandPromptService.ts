import { BrandProfile, BrandPromptConfig } from '@/types/brand';

/**
 * 品牌调性 Prompt 构造函数服务
 * @description 根据品牌档案构建用于内容生成的 prompt
 */
class BrandPromptService {
  private static instance: BrandPromptService;

  private constructor() {}

  /**
   * 获取服务实例（单例模式）
   */
  public static getInstance(): BrandPromptService {
    if (!BrandPromptService.instance) {
      BrandPromptService.instance = new BrandPromptService();
    }
    return BrandPromptService.instance;
  }

  /**
   * 构建品牌核心价值信息
   * @param profile 品牌档案
   * @returns 品牌价值信息字符串
   */
  private buildCoreValues(profile: BrandProfile): string {
    const parts: string[] = [];
    
    if (profile.coreValues && profile.coreValues.length > 0) {
      parts.push(`品牌核心价值：${profile.coreValues.join("、")}`);
      
      if (profile.valueDescriptions && profile.valueDescriptions.length > 0) {
        parts.push(`价值观描述：${profile.valueDescriptions.join("；")}`);
      }
    }
    
    if (profile.mission) {
      parts.push(`品牌使命：${profile.mission}`);
    }
    
    if (profile.vision) {
      parts.push(`品牌愿景：${profile.vision}`);
    }
    
    return parts.join('\n');
  }

  /**
   * 构建品牌语调信息
   * @param profile 品牌档案
   * @returns 品牌语调信息字符串
   */
  private buildToneInfo(profile: BrandProfile): string {
    const parts: string[] = [];
    
    if (profile.tone) {
      parts.push(`主要语调：${profile.tone}`);
    }
    
    if (profile.toneVariations) {
      const variations = Object.entries(profile.toneVariations)
        .map(([key, value]) => `${key}：${value}`)
        .join("、");
      if (variations) {
        parts.push(`语调变化：${variations}`);
      }
    }
    
    if (profile.emotionalTendency) {
      parts.push(`情感倾向：${profile.emotionalTendency}`);
    }
    
    if (profile.languageStyle) {
      parts.push(`语言风格：${profile.languageStyle}`);
    }
    
    return parts.join('\n');
  }

  /**
   * 构建核心话题信息
   * @param profile 品牌档案
   * @returns 核心话题信息字符串
   */
  private buildCoreTopics(profile: BrandProfile): string {
    const parts: string[] = [];
    
    if (profile.coreTopics && profile.coreTopics.length > 0) {
      parts.push(`核心话题：${profile.coreTopics.join("、")}`);
    }
    
    if (profile.contentDirections && profile.contentDirections.length > 0) {
      parts.push(`内容方向：${profile.contentDirections.join("、")}`);
    }
    
    if (profile.industryFocus && profile.industryFocus.length > 0) {
      parts.push(`行业关注：${profile.industryFocus.join("、")}`);
    }
    
    return parts.join('\n');
  }

  /**
   * 构建品牌标签信息
   * @param profile 品牌档案
   * @returns 品牌标签信息字符串
   */
  private buildHashtags(profile: BrandProfile): string {
    const parts: string[] = [];
    
    if (profile.brandHashtags && profile.brandHashtags.length > 0) {
      parts.push(`品牌标签：${profile.brandHashtags.join(" ")}`);
    }
    
    if (profile.campaignHashtags && profile.campaignHashtags.length > 0) {
      parts.push(`活动标签：${profile.campaignHashtags.join(" ")}`);
    }
    
    if (profile.trendingHashtags && profile.trendingHashtags.length > 0) {
      parts.push(`热门标签偏好：${profile.trendingHashtags.join("、")}`);
    }
    
    return parts.join('\n');
  }

  /**
   * 构建关键词信息
   * @param profile 品牌档案
   * @returns 关键词信息字符串
   */
  private buildKeywords(profile: BrandProfile): string {
    const parts: string[] = [];
    
    if (profile.keywords && profile.keywords.length > 0) {
      parts.push(`品牌关键词：${profile.keywords.join("、")}`);
    }
    
    if (profile.keywordCategories) {
      const categories = Object.entries(profile.keywordCategories)
        .filter(([_, keywords]) => keywords && keywords.length > 0)
        .map(([category, keywords]) => `${category}：${keywords.join("、")}`)
        .join("；");
      if (categories) {
        parts.push(`关键词分类：${categories}`);
      }
    }
    
    return parts.join('\n');
  }

  /**
   * 构建风险控制信息
   * @param profile 品牌档案
   * @returns 风险控制信息字符串
   */
  private buildRiskControl(profile: BrandProfile): string {
    const parts: string[] = [];
    
    if (profile.forbiddenWords && profile.forbiddenWords.length > 0) {
      parts.push(`禁用词：${profile.forbiddenWords.join("、")}`);
    }
    
    if (profile.sensitiveTopics && profile.sensitiveTopics.length > 0) {
      parts.push(`敏感话题：${profile.sensitiveTopics.join("、")}`);
    }
    
    if (profile.tabooExpressions && profile.tabooExpressions.length > 0) {
      parts.push(`禁忌表达：${profile.tabooExpressions.join("、")}`);
    }
    
    return parts.join('\n');
  }

  /**
   * 构建品牌标识信息
   * @param profile 品牌档案
   * @returns 品牌标识信息字符串
   */
  private buildBrandIdentity(profile: BrandProfile): string {
    const parts: string[] = [];
    
    if (profile.slogans && profile.slogans.length > 0) {
      parts.push(`品牌 Slogan：${profile.slogans.join(" / ")}`);
    }
    
    if (profile.taglines && profile.taglines.length > 0) {
      parts.push(`品牌标语：${profile.taglines.join(" / ")}`);
    }
    
    if (profile.brandStory) {
      parts.push(`品牌故事：${profile.brandStory}`);
    }
    
    return parts.join('\n');
  }

  /**
   * 构建目标受众信息
   * @param profile 品牌档案
   * @returns 目标受众信息字符串
   */
  private buildTargetAudience(profile: BrandProfile): string {
    const parts: string[] = [];
    
    if (profile.targetAudience) {
      parts.push(`目标受众：${profile.targetAudience}`);
    }
    
    if (profile.audienceSegments && profile.audienceSegments.length > 0) {
      parts.push(`受众细分：${profile.audienceSegments.join("、")}`);
    }
    
    if (profile.audiencePreferences && profile.audiencePreferences.length > 0) {
      parts.push(`受众偏好：${profile.audiencePreferences.join("、")}`);
    }
    
    return parts.join('\n');
  }

  /**
   * 构建基础品牌信息 prompt
   * @param profile 品牌档案
   * @returns 基础品牌信息字符串
   */
  private buildBrandInfo(profile: BrandProfile): string {
    const parts: string[] = [];

    // 品牌基本信息
    parts.push(`品牌名称：${profile.name}`);
    
    if (profile.description) {
      parts.push(`品牌描述：${profile.description}`);
    }

    // 构建各个维度的信息
    const coreValues = this.buildCoreValues(profile);
    if (coreValues) parts.push(coreValues);

    const toneInfo = this.buildToneInfo(profile);
    if (toneInfo) parts.push(toneInfo);

    const coreTopics = this.buildCoreTopics(profile);
    if (coreTopics) parts.push(coreTopics);

    const hashtags = this.buildHashtags(profile);
    if (hashtags) parts.push(hashtags);

    const keywords = this.buildKeywords(profile);
    if (keywords) parts.push(keywords);

    const riskControl = this.buildRiskControl(profile);
    if (riskControl) parts.push(riskControl);

    const brandIdentity = this.buildBrandIdentity(profile);
    if (brandIdentity) parts.push(brandIdentity);

    const targetAudience = this.buildTargetAudience(profile);
    if (targetAudience) parts.push(targetAudience);

    return parts.join('\n\n');
  }

  /**
   * 构建内容生成要求 prompt
   * @param config 品牌 prompt 配置
   * @returns 内容生成要求字符串
   */
  private buildContentRequirements(config: BrandPromptConfig): string {
    const requirements: string[] = [];

    if (config.useBrandTone) {
      requirements.push('使用品牌语调生成内容');
    }

    if (config.applyForbiddenWords) {
      requirements.push('不要出现禁用词');
    }

    if (config.includeKeywords) {
      requirements.push('使用品牌关键词');
    }

    if (config.followLanguageGuidelines) {
      requirements.push('自动遵循品牌的语言规范');
    }

    if (config.includeBrandValues) {
      requirements.push('融入品牌价值观');
    }

    if (config.maintainBrandConsistency) {
      requirements.push('保持品牌形象始终如一');
    }

    if (config.useCoreTopics) {
      requirements.push('围绕品牌核心话题展开');
    }

    if (config.applyBrandHashtags) {
      requirements.push('使用品牌标签');
    }

    if (config.adaptToPlatform) {
      requirements.push('适配平台特性');
    }

    return requirements.join('，');
  }

  /**
   * 构建完整的品牌调性 prompt
   * @param profile 品牌档案
   * @param topic 内容主题
   * @param config 品牌 prompt 配置
   * @returns 完整的 prompt 字符串
   */
  public buildBrandPrompt(
    profile: BrandProfile, 
    topic: string, 
    config: BrandPromptConfig
  ): string {
    const brandInfo = this.buildBrandInfo(profile);
    const requirements = this.buildContentRequirements(config);

    // 使用自定义模板或默认模板
    const template = config.customTemplate || this.getDefaultTemplate();

    return template
      .replace('{{BRAND_INFO}}', brandInfo)
      .replace('{{TOPIC}}', topic)
      .replace('{{REQUIREMENTS}}', requirements);
  }

  /**
   * 获取默认的 prompt 模板
   * @returns 默认模板字符串
   */
  private getDefaultTemplate(): string {
    return `你是一名专业的新媒体内容创作者，请基于以下品牌信息为主题"{{TOPIC}}"生成一段文案：

{{BRAND_INFO}}

创作要求：
{{REQUIREMENTS}}

请确保：
1. 内容积极正面，符合品牌调性
2. 语言表达自然流畅，符合目标受众习惯
3. 适当融入品牌元素，但不要过于生硬
4. 内容具有吸引力和传播价值
5. 保持品牌形象的一致性
6. 体现品牌核心价值观
7. 围绕品牌核心话题展开讨论

请直接输出文案内容，不需要额外的说明。`;
  }

  /**
   * 构建平台特定的品牌 prompt
   * @param profile 品牌档案
   * @param topic 内容主题
   * @param platform 目标平台
   * @param config 品牌 prompt 配置
   * @returns 平台特定的 prompt
   */
  public buildPlatformBrandPrompt(
    profile: BrandProfile,
    topic: string,
    platform: string,
    config: BrandPromptConfig
  ): string {
    const basePrompt = this.buildBrandPrompt(profile, topic, config);
    
    // 根据平台添加特定要求
    const platformSpecific = this.getPlatformSpecificRequirements(platform);
    
    // 添加平台策略
    const platformStrategy = this.getPlatformStrategy(profile, platform);
    
    return `${basePrompt}

平台特定要求：
${platformSpecific}

${platformStrategy}`;
  }

  /**
   * 获取平台特定要求
   * @param platform 平台名称
   * @returns 平台特定要求字符串
   */
  private getPlatformSpecificRequirements(platform: string): string {
    const requirements: Record<string, string> = {
      xiaohongshu: '小红书风格：亲切真实，像朋友分享，多用emoji，结尾要有互动引导',
      weibo: '微博风格：简洁直接，有话题性，开头要有爆点，适合快速传播',
      wechat: '微信公众号风格：专业深度，结构清晰，有实用价值，适合深度阅读',
      douyin: '抖音风格：简短有力，有节奏感，要有画面感，适合配音',
      zhihu: '知乎风格：理性专业，逻辑清晰，有数据支撑，适合知识分享'
    };

    return requirements[platform] || '保持内容质量和品牌调性';
  }

  /**
   * 获取平台策略
   * @param profile 品牌档案
   * @param platform 平台名称
   * @returns 平台策略字符串
   */
  private getPlatformStrategy(profile: BrandProfile, platform: string): string {
    if (!profile.platformStrategies || !profile.platformStrategies[platform]) {
      return '';
    }

    const strategy = profile.platformStrategies[platform];
    const parts: string[] = [];

    if (strategy.tone) {
      parts.push(`该平台语调：${strategy.tone}`);
    }

    if (strategy.contentStyle) {
      parts.push(`内容风格：${strategy.contentStyle}`);
    }

    if (strategy.hashtagStrategy && strategy.hashtagStrategy.length > 0) {
      parts.push(`标签策略：${strategy.hashtagStrategy.join(" ")}`);
    }

    if (strategy.interactionStyle) {
      parts.push(`互动风格：${strategy.interactionStyle}`);
    }

    if (strategy.specialRequirements && strategy.specialRequirements.length > 0) {
      parts.push(`特殊要求：${strategy.specialRequirements.join("；")}`);
    }

    return parts.length > 0 ? `平台策略：\n${parts.join('\n')}` : '';
  }

  /**
   * 构建内容检查 prompt
   * @param profile 品牌档案
   * @param content 要检查的内容
   * @returns 内容检查 prompt
   */
  public buildContentCheckPrompt(profile: BrandProfile, content: string): string {
    const brandInfo = this.buildBrandInfo(profile);

    return `请检查以下内容是否符合品牌调性要求：

品牌信息：
${brandInfo}

待检查内容：
${content}

请从以下方面进行检查：
1. 是否使用了禁用词
2. 语气是否符合品牌调性
3. 是否合理使用了品牌关键词
4. 内容是否积极正面
5. 是否符合品牌价值观
6. 是否遵循语言规范
7. 是否围绕核心话题展开
8. 是否体现了品牌核心价值观
9. 是否使用了合适的品牌标签
10. 是否符合目标受众偏好

请按照以下 JSON 格式返回检查结果：
{
  "isValid": true/false,
  "issues": ["问题1", "问题2", ...],
  "suggestions": ["建议1", "建议2", ...]
}`;
  }

  /**
   * 构建品牌调性优化建议 prompt
   * @param profile 品牌档案
   * @param content 原始内容
   * @returns 优化建议 prompt
   */
  public buildOptimizationPrompt(profile: BrandProfile, content: string): string {
    const brandInfo = this.buildBrandInfo(profile);

    return `请基于以下品牌信息，对内容进行品牌调性优化：

品牌信息：
${brandInfo}

原始内容：
${content}

优化要求：
1. 用选取的品牌语调重新表达
2. 不要出现禁用词（包括：${profile.forbiddenWords.join('、')}）
3. 使用品牌关键词（包括：${profile.keywords.join('、')}）
4. 自动遵循品牌的语言规范
5. 融入品牌价值观
6. 保持品牌形象始终如一
7. 围绕品牌核心话题展开
8. 体现品牌核心价值观
9. 使用合适的品牌标签
10. 符合目标受众偏好

请直接输出优化后的内容，不需要额外的说明。`;
  }

  /**
   * 构建多版本生成 prompt
   * @param profile 品牌档案
   * @param topic 内容主题
   * @param versionCount 版本数量
   * @param config 品牌 prompt 配置
   * @returns 多版本生成 prompt
   */
  public buildMultiVersionPrompt(
    profile: BrandProfile,
    topic: string,
    versionCount: number,
    config: BrandPromptConfig
  ): string {
    const basePrompt = this.buildBrandPrompt(profile, topic, config);

    return `${basePrompt}

请生成 ${versionCount} 个不同风格的内容版本，每个版本都要：
1. 保持品牌调性一致
2. 使用不同的表达方式
3. 适应不同的受众偏好
4. 体现不同的内容角度
5. 围绕品牌核心话题
6. 体现品牌价值观

请按以下格式输出：
版本1：[内容]
版本2：[内容]
...
版本${versionCount}：[内容]`;
  }

  /**
   * 构建品牌调性分析 prompt
   * @param content 要分析的内容
   * @returns 品牌调性分析 prompt
   */
  public buildToneAnalysisPrompt(content: string): string {
    return `请对以下内容进行品牌调性分析，从以下7个维度进行评估：

内容：
${content}

分析维度：
1. 品牌核心价值体现度（1-10分）
2. 品牌语调一致性（1-10分）
3. 核心话题相关性（1-10分）
4. 品牌标签使用效果（1-10分）
5. 关键词使用影响力（1-10分）
6. 风险控制水平（1-10分）
7. 整体品牌识别度（1-10分）

请按照以下 JSON 格式返回分析结果：
{
  "coreValues": {
    "score": 8,
    "analysis": "分析说明",
    "suggestions": ["建议1", "建议2"]
  },
  "tone": {
    "score": 7,
    "analysis": "分析说明",
    "suggestions": ["建议1", "建议2"]
  },
  "topics": {
    "score": 9,
    "analysis": "分析说明",
    "suggestions": ["建议1", "建议2"]
  },
  "hashtags": {
    "score": 6,
    "analysis": "分析说明",
    "suggestions": ["建议1", "建议2"]
  },
  "keywords": {
    "score": 8,
    "analysis": "分析说明",
    "suggestions": ["建议1", "建议2"]
  },
  "riskControl": {
    "score": 9,
    "analysis": "分析说明",
    "suggestions": ["建议1", "建议2"]
  },
  "overall": {
    "score": 8,
    "analysis": "整体分析说明",
    "improvements": ["改进建议1", "改进建议2"]
  }
}`;
  }
}

export default BrandPromptService; 