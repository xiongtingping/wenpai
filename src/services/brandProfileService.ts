import { BrandProfile } from '@/types/brand';
import AIAnalysisService from './aiAnalysisService';
import BrandDatabaseService from './brandDatabaseService';

/**
 * 品牌调性服务
 * @description 处理品牌资料的分析、存储和应用
 */
class BrandProfileService {
  private static instance: BrandProfileService;
  private currentProfile: BrandProfile | null = null;
  private aiService: AIAnalysisService;
  private dbService: BrandDatabaseService;

  private constructor() {
    this.aiService = AIAnalysisService.getInstance();
    this.dbService = BrandDatabaseService.getInstance();
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
   * 根据品牌档案生成 prompt
   * @param topic 内容主题
   * @returns 构造的 prompt
   */
  public async generatePrompt(topic: string): Promise<string> {
    const profile = await this.getCurrentProfile();
    if (!profile) {
      throw new Error('未设置品牌档案');
    }

    return `
你是一名专业新媒体创作者助手，请基于以下品牌信息为主题"${topic}"生成一段文案：

品牌名称：${profile.name}
品牌语气：${profile.tone}
品牌关键词：${profile.keywords.join("、")}
品牌 Slogan：${profile.slogans.join(" / ")}
禁用词：${profile.forbiddenWords.join("、")}

要求：
1. 语气要保持一致，体现品牌调性
2. 内容要贴合品牌价值观
3. 不要出现禁用词
4. 适当融入品牌关键词
5. 确保内容积极正面
`;
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
}

export default BrandProfileService; 