import { BrandProfile, BrandPromptConfig, BrandToneAnalysis } from '@/types/brand';
import AIAnalysisService from './aiAnalysisService';
import BrandDatabaseService from './brandDatabaseService';
import BrandPromptService from './brandPromptService';

/**
 * 品牌调性服务
 * @description 处理品牌资料的分析、存储和应用
 */
class BrandProfileService {
  private static instance: BrandProfileService;
  private currentProfile: BrandProfile | null = null;
  private aiService: AIAnalysisService;
  private dbService: BrandDatabaseService;
  private promptService: BrandPromptService;

  private constructor() {
    this.aiService = AIAnalysisService.getInstance();
    this.dbService = BrandDatabaseService.getInstance();
    this.promptService = BrandPromptService.getInstance();
  }

  /**
   * 获取服务实例（单例模式）
   */
  public static getInstance(): BrandProfileService {
    if (!BrandProfileService.instance) {
      BrandProfileService.instance = new BrandProfileService();
    }
    return BrandProfileService.instance;
  }

  /**
   * 设置当前品牌档案
   * @param profile 品牌档案
   */
  public async setCurrentProfile(profile: BrandProfile): Promise<void> {
    this.currentProfile = profile;
    
    // 保存到数据库
    await this.dbService.saveBrandProfile(profile);
    
    // 同时保存到本地存储作为缓存
    localStorage.setItem('brandProfile', JSON.stringify(profile));
  }

  /**
   * 获取当前品牌档案
   */
  public async getCurrentProfile(): Promise<BrandProfile | null> {
    if (!this.currentProfile) {
      try {
        // 优先从数据库获取最新档案
        const latestProfile = await this.dbService.getLatestBrandProfile();
        if (latestProfile) {
          this.currentProfile = latestProfile;
          return latestProfile;
        }
        
        // 如果数据库没有，尝试从本地存储获取
        const stored = localStorage.getItem('brandProfile');
        if (stored) {
          this.currentProfile = JSON.parse(stored);
        }
      } catch (error) {
        console.error('获取品牌档案失败:', error);
        // 降级到本地存储
        const stored = localStorage.getItem('brandProfile');
        if (stored) {
          this.currentProfile = JSON.parse(stored);
        }
      }
    }
    return this.currentProfile;
  }

  /**
   * 根据品牌档案生成 prompt（兼容旧版本）
   * @param topic 内容主题
   * @returns 构造的 prompt
   */
  public async generatePrompt(topic: string): Promise<string> {
    const profile = await this.getCurrentProfile();
    if (!profile) {
      throw new Error('未设置品牌档案');
    }

    // 使用默认配置
    const config: BrandPromptConfig = {
      useBrandTone: true,
      applyForbiddenWords: true,
      includeKeywords: true,
      followLanguageGuidelines: true,
      includeBrandValues: true,
      maintainBrandConsistency: true,
      useCoreTopics: true,
      applyBrandHashtags: true,
      adaptToPlatform: true
    };

    return this.promptService.buildBrandPrompt(profile, topic, config);
  }

  /**
   * 根据品牌档案和配置生成 prompt
   * @param topic 内容主题
   * @param config 品牌 prompt 配置
   * @returns 构造的 prompt
   */
  public async generatePromptWithConfig(
    topic: string, 
    config: BrandPromptConfig
  ): Promise<string> {
    const profile = await this.getCurrentProfile();
    if (!profile) {
      throw new Error('未设置品牌档案');
    }

    return this.promptService.buildBrandPrompt(profile, topic, config);
  }

  /**
   * 生成平台特定的品牌 prompt
   * @param topic 内容主题
   * @param platform 目标平台
   * @param config 品牌 prompt 配置
   * @returns 平台特定的 prompt
   */
  public async generatePlatformPrompt(
    topic: string,
    platform: string,
    config: BrandPromptConfig
  ): Promise<string> {
    const profile = await this.getCurrentProfile();
    if (!profile) {
      throw new Error('未设置品牌档案');
    }

    return this.promptService.buildPlatformBrandPrompt(profile, topic, platform, config);
  }

  /**
   * 生成内容检查 prompt
   * @param content 要检查的内容
   * @returns 内容检查 prompt
   */
  public async generateContentCheckPrompt(content: string): Promise<string> {
    const profile = await this.getCurrentProfile();
    if (!profile) {
      throw new Error('未设置品牌档案');
    }

    return this.promptService.buildContentCheckPrompt(profile, content);
  }

  /**
   * 生成品牌调性优化 prompt
   * @param content 原始内容
   * @returns 优化 prompt
   */
  public async generateOptimizationPrompt(content: string): Promise<string> {
    const profile = await this.getCurrentProfile();
    if (!profile) {
      throw new Error('未设置品牌档案');
    }

    return this.promptService.buildOptimizationPrompt(profile, content);
  }

  /**
   * 生成多版本内容 prompt
   * @param topic 内容主题
   * @param versionCount 版本数量
   * @param config 品牌 prompt 配置
   * @returns 多版本生成 prompt
   */
  public async generateMultiVersionPrompt(
    topic: string,
    versionCount: number,
    config: BrandPromptConfig
  ): Promise<string> {
    const profile = await this.getCurrentProfile();
    if (!profile) {
      throw new Error('未设置品牌档案');
    }

    return this.promptService.buildMultiVersionPrompt(profile, topic, versionCount, config);
  }

  /**
   * 生成品牌调性分析 prompt
   * @param content 要分析的内容
   * @returns 品牌调性分析 prompt
   */
  public async generateToneAnalysisPrompt(content: string): Promise<string> {
    return this.promptService.buildToneAnalysisPrompt(content);
  }

  /**
   * 分析上传的品牌资料
   * @param files 上传的文件列表
   * @returns 分析结果
   */
  public async analyzeFiles(files: File[]): Promise<{
    keywords: string[];
    tone: string;
    suggestions: string[];
  }> {
    try {
      // 使用 AI 服务分析文件
      const result = await this.aiService.analyzeFiles(files);
      return result;
    } catch (error) {
      console.error('品牌资料分析失败:', error);
      throw error;
    }
  }

  /**
   * 深度分析品牌资料，提取完整的品牌调性维度
   * @param files 上传的文件列表
   * @returns 完整的品牌调性分析结果
   */
  public async analyzeBrandTone(files: File[]): Promise<BrandToneAnalysis> {
    try {
      // 这里可以调用更高级的 AI 分析服务
      // 暂时返回模拟数据
      const mockAnalysis: BrandToneAnalysis = {
        coreValues: {
          values: ['创新', '可靠', '环保'],
          descriptions: ['持续创新技术', '产品可靠稳定', '环保可持续发展'],
          strength: 8
        },
        tone: {
          primary: '专业友好',
          variations: {
            formal: '专业正式',
            casual: '亲切轻松',
            professional: '技术专业',
            friendly: '温暖友好'
          },
          emotionalTendency: '积极温暖',
          languageStyle: '简洁直接',
          consistency: 7
        },
        topics: {
          coreTopics: ['技术创新', '产品体验', '行业趋势'],
          contentDirections: ['教育', '资讯', '分享'],
          industryFocus: ['科技', '用户体验', '可持续发展'],
          relevance: 9
        },
        hashtags: {
          brandHashtags: ['#品牌名', '#产品系列'],
          campaignHashtags: ['#活动名', '#主题标签'],
          trendingHashtags: ['#热门话题', '#行业标签'],
          effectiveness: 6
        },
        keywords: {
          primary: ['创新', '可靠', '环保', '技术', '体验'],
          categories: {
            product: ['产品名', '功能特性'],
            service: ['服务内容', '解决方案'],
            feature: ['核心功能', '技术优势'],
            benefit: ['用户价值', '使用体验']
          },
          frequency: {
            '创新': 15,
            '可靠': 12,
            '环保': 8
          },
          impact: 8
        },
        riskControl: {
          forbiddenWords: ['禁用词1', '禁用词2'],
          sensitiveTopics: ['敏感话题1', '敏感话题2'],
          tabooExpressions: ['禁忌表达1', '禁忌表达2'],
          riskLevel: 3
        },
        overallScore: {
          valueAlignment: 8,
          toneConsistency: 7,
          topicRelevance: 9,
          brandRecognition: 8,
          riskControl: 9
        }
      };

      return mockAnalysis;
    } catch (error) {
      console.error('品牌调性分析失败:', error);
      throw error;
    }
  }

  /**
   * 检查内容是否符合品牌调性
   * @param content 要检查的内容
   * @returns 检查结果
   */
  public async checkContent(content: string): Promise<{
    isValid: boolean;
    issues: string[];
    suggestions: string[];
  }> {
    const profile = await this.getCurrentProfile();
    if (!profile) {
      throw new Error('未设置品牌档案');
    }

    try {
      // 使用 AI 服务检查内容
      const result = await this.aiService.checkContent(content, profile);
      return result;
    } catch (error) {
      console.error('内容检查失败:', error);
      throw error;
    }
  }

  /**
   * 获取所有品牌档案
   */
  public async getAllProfiles(): Promise<BrandProfile[]> {
    return await this.dbService.getAllBrandProfiles();
  }

  /**
   * 搜索品牌档案
   * @param query 搜索关键词
   */
  public async searchProfiles(query: string): Promise<BrandProfile[]> {
    return await this.dbService.searchBrandProfiles(query);
  }

  /**
   * 删除品牌档案
   * @param id 档案ID
   */
  public async deleteProfile(id: string): Promise<void> {
    await this.dbService.deleteBrandProfile(id);
    
    // 如果删除的是当前档案，清空当前档案
    if (this.currentProfile?.id === id) {
      this.currentProfile = null;
      localStorage.removeItem('brandProfile');
    }
  }

  /**
   * 检查是否有可用的品牌档案
   */
  public async hasBrandProfile(): Promise<boolean> {
    const profile = await this.getCurrentProfile();
    return profile !== null;
  }

  /**
   * 获取品牌档案摘要信息
   */
  public async getBrandSummary(): Promise<{
    name: string;
    tone: string;
    keywords: string[];
    coreValues: string[];
    coreTopics: string[];
    hasValues: boolean;
    hasGuidelines: boolean;
    hasPlatformStrategies: boolean;
  } | null> {
    const profile = await this.getCurrentProfile();
    if (!profile) {
      return null;
    }

    return {
      name: profile.name,
      tone: profile.tone,
      keywords: profile.keywords || [],
      coreValues: profile.coreValues || [],
      coreTopics: profile.coreTopics || [],
      hasValues: !!(profile.coreValues && profile.coreValues.length > 0),
      hasGuidelines: !!(profile.languageGuidelines && profile.languageGuidelines.length > 0),
      hasPlatformStrategies: !!(profile.platformStrategies && Object.keys(profile.platformStrategies).length > 0)
    };
  }

  /**
   * 获取品牌调性维度概览
   */
  public async getBrandToneOverview(): Promise<{
    coreValues: string[];
    tone: string;
    coreTopics: string[];
    hashtags: string[];
    keywords: string[];
    forbiddenWords: string[];
  } | null> {
    const profile = await this.getCurrentProfile();
    if (!profile) {
      return null;
    }

    return {
      coreValues: profile.coreValues || [],
      tone: profile.tone,
      coreTopics: profile.coreTopics || [],
      hashtags: profile.brandHashtags || [],
      keywords: profile.keywords || [],
      forbiddenWords: profile.forbiddenWords || []
    };
  }

  /**
   * 获取平台策略
   * @param platform 平台名称
   */
  public async getPlatformStrategy(platform: string): Promise<any> {
    const profile = await this.getCurrentProfile();
    if (!profile || !profile.platformStrategies) {
      return null;
    }

    return profile.platformStrategies[platform] || null;
  }

  /**
   * 更新平台策略
   * @param platform 平台名称
   * @param strategy 平台策略
   */
  public async updatePlatformStrategy(platform: string, strategy: any): Promise<void> {
    const profile = await this.getCurrentProfile();
    if (!profile) {
      throw new Error('未设置品牌档案');
    }

    // 更新平台策略
    if (!profile.platformStrategies) {
      profile.platformStrategies = {};
    }
    profile.platformStrategies[platform] = strategy;
    profile.updatedAt = new Date();

    // 保存更新
    await this.setCurrentProfile(profile);
  }
}

export default BrandProfileService; 