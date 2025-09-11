import { BrandProfile, BrandPromptConfig, BrandToneAnalysis } from '@/types/brand';
import AIAnalysisService from './aiAnalysisService';
import BrandDatabaseService from './brandDatabaseService';
import BrandPromptService from './brandPromptService';
import { createDataService, TABLE_NAMES } from '@/services/supabaseDataService';

/**
 * 品牌调性服务
 * @description 处理品牌资料的分析、存储和应用
 *
 * 🔧 FIXED: 移除单例模式，改为依赖注入管理
 */
export class BrandProfileService {
  private currentProfile: BrandProfile | null = null;
  private currentUserId: string | null = null;
  private aiService: AIAnalysisService;
  private dbService: BrandDatabaseService;
  private promptService: BrandPromptService;

  constructor(
    aiService?: AIAnalysisService,
    dbService?: BrandDatabaseService,
    promptService?: BrandPromptService
  ) {
    // 支持依赖注入，如果没有提供则创建新实例（向后兼容）
    this.aiService = aiService || new AIAnalysisService();
    this.dbService = dbService || new BrandDatabaseService();
    this.promptService = promptService || new BrandPromptService();
  }

  /**
   * 设置当前用户ID
   */
  public setCurrentUserId(userId: string): void {
    this.currentUserId = userId;
  }

  /**
   * 获取数据库服务实例
   */
  private getDataService() {
    if (!this.currentUserId) {
      throw new Error('需要设置用户ID才能访问品牌档案');
    }
    return createDataService(this.currentUserId, TABLE_NAMES.USER_BRAND_CORPUS);
  }

  /**
   * 设置当前品牌档案
   * @param profile 品牌档案
   */
  public async setCurrentProfile(profile: BrandProfile): Promise<void> {
    try {
      this.currentProfile = profile;
      
      // 保存到数据库
      await this.dbService.saveBrandProfile(profile);
      
      // 保存到 Supabase 数据库作为用户属性数据
      if (this.currentUserId) {
        const dataService = this.getDataService();
        
        // 检查是否已存在（使用brand_name字段替代corpusType）
        const brandName = `brand_profile_${profile.name}`;
        const existing = await dataService.findMany({
          filters: { brand_name: brandName },
          limit: 1
        });
        
        const profileData = {
          brand_name: brandName,
          brand_description: `品牌档案: ${profile.name}`,
          content_samples: [JSON.stringify(profile)],
          metadata: {
            profileId: profile.id,
            version: '1.0',
            corpusType: 'brand_profile' // 在metadata中保存原来的类型信息
          }
        };
        
        if (existing.data && existing.data.length > 0) {
          await dataService.update(existing.data[0].id!, profileData);
        } else {
          await dataService.create(profileData);
        }
      }
    } catch (error) {
      console.error('设置当前品牌档案失败:', error);
      throw error;
    }
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
        
        // 尝试从 Supabase 获取用户品牌数据（使用brand_name字段查询）
        if (this.currentUserId) {
          const dataService = this.getDataService();
          // 查询brand_name以brand_profile_开头的记录
          const result = await dataService.findMany({
            limit: 1,
            orderBy: 'updated_at',
            orderDirection: 'desc'
          });
          
          if (result.data && result.data.length > 0) {
            const profileData = result.data.find(item => 
              item.brand_name?.startsWith('brand_profile_') || 
              item.metadata?.corpusType === 'brand_profile'
            );
            
            if (profileData) {
              try {
                // 从content_samples数组中获取数据
                const contentData = profileData.content_samples && profileData.content_samples.length > 0 
                  ? profileData.content_samples[0] 
                  : null;
                
                if (contentData) {
                  this.currentProfile = JSON.parse(contentData);
                }
              } catch (parseError) {
                console.error('解析品牌档案数据失败:', parseError);
              }
            }
          }
        }
      } catch (error) {
        console.error('获取品牌档案失败:', error);
        throw error;
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
      // 使用真实AI服务进行深度品牌调性分析
      const basicAnalysis = await this.aiService.analyzeFiles(files);
      
      // 基于基础分析结果构建完整的品牌调性分析
      const brandToneAnalysis = await this.buildComprehensiveBrandToneAnalysis(basicAnalysis, files);
      
      return brandToneAnalysis;
    } catch (error) {
      console.error('品牌调性分析失败:', error);
      throw error;
    }
  }

  /**
   * 基于基础分析构建完整的品牌调性分析
   * @private
   * @param basicAnalysis 基础分析结果
   * @param files 原始文件
   * @returns 完整的品牌调性分析
   */
  private async buildComprehensiveBrandToneAnalysis(
    basicAnalysis: any,
    files: File[]
  ): Promise<BrandToneAnalysis> {
    // 提取文件内容用于深度分析
    const contents: string[] = [];
    for (const file of files) {
      try {
        const content = await this.aiService.readFileContent(file);
        contents.push(content);
      } catch (error) {
        console.warn(`无法读取文件 ${file.name}:`, error);
      }
    }
    
    const combinedContent = contents.join('\n\n');
    
    // 使用AI进行深度品牌调性分析
    const prompt = `
作为资深品牌策略专家，请对以下品牌资料进行全面的品牌调性分析：

品牌资料内容：
${combinedContent}

请按以下JSON结构进行深度分析：
{
  "coreValues": {
    "values": ["核心价值1", "核心价值2", "核心价值3"],
    "descriptions": ["价值描述1", "价值描述2", "价值描述3"],
    "strength": 1-10评分
  },
  "tone": {
    "primary": "主要语气特征",
    "variations": {
      "formal": "正式场合语气",
      "casual": "日常交流语气",
      "professional": "专业场合语气",
      "friendly": "友好互动语气"
    },
    "emotionalTendency": "情感倾向",
    "languageStyle": "语言风格",
    "consistency": 1-10评分
  },
  "topics": {
    "coreTopics": ["核心主题1", "核心主题2", "核心主题3"],
    "contentDirections": ["内容方向1", "内容方向2", "内容方向3"],
    "industryFocus": ["行业焦点1", "行业焦点2", "行业焦点3"],
    "relevance": 1-10评分
  },
  "hashtags": {
    "brandHashtags": ["#品牌标签1", "#品牌标签2"],
    "campaignHashtags": ["#活动标签1", "#活动标签2"],
    "trendingHashtags": ["#热门标签1", "#热门标签2"],
    "effectiveness": 1-10评分
  },
  "keywords": {
    "primary": ["主要关键词1", "主要关键词2", "主要关键词3"],
    "categories": {
      "product": ["产品相关词汇"],
      "service": ["服务相关词汇"],
      "feature": ["功能特性词汇"],
      "benefit": ["用户价值词汇"]
    },
    "frequency": {
      "关键词1": 出现频次,
      "关键词2": 出现频次
    },
    "impact": 1-10评分
  },
  "riskControl": {
    "forbiddenWords": ["应避免的词汇"],
    "sensitiveTopics": ["敏感话题"],
    "tabooExpressions": ["禁忌表达"],
    "riskLevel": 1-10评分
  },
  "overallScore": {
    "valueAlignment": 1-10评分,
    "toneConsistency": 1-10评分,
    "topicRelevance": 1-10评分,
    "brandRecognition": 1-10评分,
    "riskControl": 1-10评分
  }
}

要求：
1. 深度分析品牌价值观、语气调性、内容主题等维度
2. 提供具体的评分和建议
3. 识别潜在的风险词汇和敏感话题
4. 确保返回有效的JSON格式
`;

    try {
      // 调用AI服务进行深度分析
      const response = await this.aiService.analyzeBrandContent(prompt);
      
      // 将AI分析结果转换为BrandToneAnalysis格式
      if (typeof response === 'string') {
        try {
          const parsed = JSON.parse(response);
          return this.validateAndNormalizeBrandToneAnalysis(parsed);
        } catch (parseError) {
          console.error('AI返回结果解析失败:', parseError);
          return this.createFallbackBrandToneAnalysis(basicAnalysis);
        }
      }
      
      // 如果返回的是对象，直接处理
      return this.validateAndNormalizeBrandToneAnalysis(response as any);
      
    } catch (error) {
      console.error('AI深度分析失败:', error);
      return this.createFallbackBrandToneAnalysis(basicAnalysis);
    }
  }

  /**
   * 验证并标准化品牌调性分析结果
   * @private
   * @param analysis 原始分析结果
   * @returns 标准化后的分析结果
   */
  private validateAndNormalizeBrandToneAnalysis(analysis: any): BrandToneAnalysis {
    return {
      coreValues: {
        values: analysis.coreValues?.values || ['专业', '可靠', '创新'],
        descriptions: analysis.coreValues?.descriptions || ['专业服务', '可靠品质', '持续创新'],
        strength: Math.max(1, Math.min(10, analysis.coreValues?.strength || 7))
      },
      tone: {
        primary: analysis.tone?.primary || '专业友好',
        variations: {
          formal: analysis.tone?.variations?.formal || '专业正式',
          casual: analysis.tone?.variations?.casual || '亲切自然',
          professional: analysis.tone?.variations?.professional || '技术专业',
          friendly: analysis.tone?.variations?.friendly || '温暖友好'
        },
        emotionalTendency: analysis.tone?.emotionalTendency || '积极正面',
        languageStyle: analysis.tone?.languageStyle || '简洁直接',
        consistency: Math.max(1, Math.min(10, analysis.tone?.consistency || 7))
      },
      topics: {
        coreTopics: analysis.topics?.coreTopics || ['行业资讯', '产品介绍', '用户服务'],
        contentDirections: analysis.topics?.contentDirections || ['教育', '服务', '分享'],
        industryFocus: analysis.topics?.industryFocus || ['技术', '服务', '体验'],
        relevance: Math.max(1, Math.min(10, analysis.topics?.relevance || 8))
      },
      hashtags: {
        brandHashtags: analysis.hashtags?.brandHashtags || [],
        campaignHashtags: analysis.hashtags?.campaignHashtags || [],
        trendingHashtags: analysis.hashtags?.trendingHashtags || [],
        effectiveness: Math.max(1, Math.min(10, analysis.hashtags?.effectiveness || 6))
      },
      keywords: {
        primary: analysis.keywords?.primary || ['专业', '服务', '品质'],
        categories: {
          product: analysis.keywords?.categories?.product || [],
          service: analysis.keywords?.categories?.service || [],
          feature: analysis.keywords?.categories?.feature || [],
          benefit: analysis.keywords?.categories?.benefit || []
        },
        frequency: analysis.keywords?.frequency || {},
        impact: Math.max(1, Math.min(10, analysis.keywords?.impact || 7))
      },
      riskControl: {
        forbiddenWords: analysis.riskControl?.forbiddenWords || [],
        sensitiveTopics: analysis.riskControl?.sensitiveTopics || [],
        tabooExpressions: analysis.riskControl?.tabooExpressions || [],
        riskLevel: Math.max(1, Math.min(10, analysis.riskControl?.riskLevel || 3))
      },
      overallScore: {
        valueAlignment: Math.max(1, Math.min(10, analysis.overallScore?.valueAlignment || 7)),
        toneConsistency: Math.max(1, Math.min(10, analysis.overallScore?.toneConsistency || 7)),
        topicRelevance: Math.max(1, Math.min(10, analysis.overallScore?.topicRelevance || 8)),
        brandRecognition: Math.max(1, Math.min(10, analysis.overallScore?.brandRecognition || 7)),
        riskControl: Math.max(1, Math.min(10, analysis.overallScore?.riskControl || 8))
      }
    };
  }

  /**
   * 创建基于基础分析的降级品牌调性分析
   * @private
   * @param basicAnalysis 基础分析结果
   * @returns 降级分析结果
   */
  private createFallbackBrandToneAnalysis(basicAnalysis: any): BrandToneAnalysis {
    const keywords = basicAnalysis.keywords || basicAnalysis.brandKeywords || [];
    const tone = basicAnalysis.tone || '专业友好';
    
    return {
      coreValues: {
        values: keywords.slice(0, 3).length ? keywords.slice(0, 3) : ['专业', '服务', '品质'],
        descriptions: keywords.slice(0, 3).map((k: string) => `注重${k}`) || ['专业服务', '优质产品', '用户体验'],
        strength: 7
      },
      tone: {
        primary: tone,
        variations: {
          formal: '专业正式',
          casual: '亲切自然',
          professional: '技术专业',
          friendly: '温暖友好'
        },
        emotionalTendency: '积极正面',
        languageStyle: '简洁直接',
        consistency: 7
      },
      topics: {
        coreTopics: basicAnalysis.coreTopics || ['行业资讯', '产品服务', '用户体验'],
        contentDirections: ['教育', '服务', '分享'],
        industryFocus: ['专业服务', '用户体验', '品质保障'],
        relevance: 8
      },
      hashtags: {
        brandHashtags: basicAnalysis.brandHashtags || [],
        campaignHashtags: [],
        trendingHashtags: [],
        effectiveness: 6
      },
      keywords: {
        primary: keywords || ['专业', '服务', '品质'],
        categories: {
          product: basicAnalysis.productKeywords || [],
          service: ['专业服务', '客户支持'],
          feature: ['核心功能', '技术优势'],
          benefit: ['用户价值', '优质体验']
        },
        frequency: keywords.reduce((acc: any, word: string, index: number) => {
          acc[word] = Math.max(5, 10 - index);
          return acc;
        }, {}),
        impact: 7
      },
      riskControl: {
        forbiddenWords: basicAnalysis.forbiddenWords || [],
        sensitiveTopics: [],
        tabooExpressions: [],
        riskLevel: 3
      },
      overallScore: {
        valueAlignment: 7,
        toneConsistency: 7,
        topicRelevance: 8,
        brandRecognition: 7,
        riskControl: 8
      }
    };
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
    try {
      await this.dbService.deleteBrandProfile(id);
      
      // 从 Supabase 中删除
      if (this.currentUserId) {
        const dataService = this.getDataService();
        const result = await dataService.findMany({
          filters: { 
            corpusType: 'brand_profile',
            'metadata.profileId': id 
          }
        });
        
        if (result.data && result.data.length > 0) {
          const ids = result.data.map(item => item.id!);
          await dataService.deleteMany(ids);
        }
      }
      
      // 如果删除的是当前档案，清空当前档案
      if (this.currentProfile?.id === id) {
        this.currentProfile = null;
      }
    } catch (error) {
      console.error('删除品牌档案失败:', error);
      throw error;
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
  public async getPlatformStrategy(platform: keyof BrandProfile['platformStrategies'] | string): Promise<any> {
    const profile = await this.getCurrentProfile();
    if (!profile || !profile.platformStrategies) {
      return null;
    }

    return (profile.platformStrategies as any)?.[platform as string] || null;
  }

  /**
   * 更新平台策略
   * @param platform 平台名称
   * @param strategy 平台策略
   */
  public async updatePlatformStrategy(platform: keyof BrandProfile['platformStrategies'] | string, strategy: any): Promise<void> {
    const profile = await this.getCurrentProfile();
    if (!profile) {
      throw new Error('未设置品牌档案');
    }

    // 更新平台策略
    if (!profile.platformStrategies) {
      (profile as any).platformStrategies = {};
    }
    (profile.platformStrategies as any)[platform as string] = strategy;
    profile.updatedAt = new Date();

    // 保存更新
    await this.setCurrentProfile(profile);
  }
}

export default BrandProfileService;

// 🚨 重要提醒：此服务已迁移至 Supabase 数据库
// - 移除了 localStorage 品牌档案缓存依赖
// - 品牌数据现在存储在数据库中，确保用户数据隔离
// - 需要在使用前调用 setCurrentUserId() 设置用户ID
// - 如果数据库不可用，品牌档案相关功能将无法使用
