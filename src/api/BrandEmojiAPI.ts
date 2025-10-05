/**
 * 品牌Emoji生成API接口
 * 提供完整的品牌元素选择和Emoji生成流程
 */

import { BrandEmojiIntegrationService, BrandEmojiConfig, BrandEmojiResult, BrandElementSelector } from '../services/BrandEmojiIntegrationService';
import { ImageBrandExtractionService } from '../services/ImageBrandExtractionService';
// import { BrandVisualLibrary } from '../types/brandVisuals';
// import { BrandCorpus } from '../types/index';

// 临时类型定义，直到正式类型文件创建
type BrandVisualLibrary = any;
type BrandCorpus = any;

export class BrandEmojiAPI {
  private emojiService: BrandEmojiIntegrationService;
  private imageService: ImageBrandExtractionService;

  constructor(
    emojiService: BrandEmojiIntegrationService,
    imageService: ImageBrandExtractionService
  ) {
    this.emojiService = emojiService;
    this.imageService = imageService;
  }

  /**
   * 1. 获取品牌元素选择器（第一步：展示可选元素）
   *
   * @param brandId - 品牌ID
   * @returns 可选的品牌元素列表
   */
  async getBrandElements(brandId: string): Promise<{
    success: boolean;
    selector?: BrandElementSelector;
    error?: string;
  }> {
    try {
      // 从数据库获取品牌视觉库和语料库
      const visualLibrary = await this.getVisualLibrary(brandId);
      const brandCorpus = await this.getBrandCorpus(brandId);

      if (!visualLibrary || !brandCorpus) {
        return {
          success: false,
          error: '未找到品牌数据，请先上传品牌资料',
        };
      }

      // 获取元素选择器
      const selector = await this.emojiService.getBrandElementSelector(
        brandId,
        visualLibrary,
        brandCorpus
      );

      return {
        success: true,
        selector,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '获取品牌元素失败',
      };
    }
  }

  /**
   * 2. 预览品牌元素应用效果（第二步：用户选择后预览）
   *
   * @param brandId - 品牌ID
   * @param config - Emoji生成配置
   * @returns 预览信息
   */
  async previewBrandElements(
    brandId: string,
    config: BrandEmojiConfig
  ): Promise<{
    success: boolean;
    preview?: {
      prompt: string;
      colorPalette: string[];
      styleKeywords: string[];
      moodKeywords: string[];
      estimatedAlignment: number;
    };
    error?: string;
  }> {
    try {
      const visualLibrary = await this.getVisualLibrary(brandId);
      const brandCorpus = await this.getBrandCorpus(brandId);

      if (!visualLibrary || !brandCorpus) {
        return {
          success: false,
          error: '未找到品牌数据',
        };
      }

      const preview = await this.emojiService.previewBrandElements(
        config,
        visualLibrary,
        brandCorpus
      );

      return {
        success: true,
        preview,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '预览失败',
      };
    }
  }

  /**
   * 3. 生成品牌Emoji（第三步：执行生成）
   *
   * @param brandId - 品牌ID
   * @param config - Emoji生成配置
   * @param userId - 用户ID（用于记录）
   * @returns 生成结果
   */
  async generateEmoji(
    brandId: string,
    config: BrandEmojiConfig,
    userId: string
  ): Promise<BrandEmojiResult & { recordId?: string }> {
    try {
      const visualLibrary = await this.getVisualLibrary(brandId);
      const brandCorpus = await this.getBrandCorpus(brandId);

      if (!visualLibrary || !brandCorpus) {
        return {
          success: false,
          error: '未找到品牌数据',
          brandAlignment: {
            colorAlignment: 0,
            styleAlignment: 0,
            moodAlignment: 0,
            overallAlignment: 0,
          },
        };
      }

      // 生成Emoji
      const result = await this.emojiService.generateBrandEmoji(
        config,
        visualLibrary,
        brandCorpus
      );

      // 保存生成记录到数据库
      if (result.success && result.emojis) {
        const recordId = await this.saveGenerationRecord(
          brandId,
          visualLibrary.id,
          config,
          result,
          userId
        );

        return {
          ...result,
          recordId,
        };
      }

      return result;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Emoji生成失败',
        brandAlignment: {
          colorAlignment: 0,
          styleAlignment: 0,
          moodAlignment: 0,
          overallAlignment: 0,
        },
      };
    }
  }

  /**
   * 4. 提交用户反馈（第四步：用户评价）
   *
   * @param recordId - 生成记录ID
   * @param feedback - 用户反馈
   */
  async submitFeedback(
    recordId: string,
    feedback: {
      rating: number;
      comment: string;
      selectedEmojiId?: string;
    }
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // 更新数据库中的反馈信息
      await this.updateGenerationRecord(recordId, { feedback });

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '提交反馈失败',
      };
    }
  }

  /**
   * 5. 记录Emoji使用情况
   *
   * @param recordId - 生成记录ID
   * @param emojiId - 使用的emoji ID
   * @param usage - 使用信息
   */
  async recordUsage(
    recordId: string,
    emojiId: string,
    usage: {
      platform?: string;
      contentId?: string;
    }
  ): Promise<{ success: boolean; error?: string }> {
    try {
      await this.updateGenerationRecord(recordId, {
        usage: {
          ...usage,
          usedAt: new Date(),
        },
      });

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '记录使用情况失败',
      };
    }
  }

  /**
   * 6. 获取历史生成记录
   *
   * @param brandId - 品牌ID
   * @param limit - 返回数量限制
   * @returns 历史记录列表
   */
  async getGenerationHistory(
    brandId: string,
    limit: number = 10
  ): Promise<{
    success: boolean;
    records?: Array<{
      id: string;
      config: BrandEmojiConfig;
      emojis: BrandEmojiResult['emojis'];
      brandAlignment: BrandEmojiResult['brandAlignment'];
      createdAt: Date;
      feedback?: any;
    }>;
    error?: string;
  }> {
    try {
      // 从数据库查询历史记录
      const records = await this.queryGenerationRecords(brandId, limit);

      return {
        success: true,
        records,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '获取历史记录失败',
      };
    }
  }

  /**
   * 7. 分析品牌Emoji使用趋势
   *
   * @param brandId - 品牌ID
   * @returns 使用趋势分析
   */
  async analyzeEmojiTrends(brandId: string): Promise<{
    success: boolean;
    trends?: {
      totalGenerated: number;
      totalUsed: number;
      averageAlignment: number;
      topColors: string[];
      topEmotions: string[];
      topStyles: string[];
      usageByPlatform: { platform: string; count: number }[];
      qualityTrend: { date: string; alignment: number }[];
    };
    error?: string;
  }> {
    try {
      const records = await this.queryGenerationRecords(brandId, 100);

      if (!records || records.length === 0) {
        return {
          success: false,
          error: '暂无生成记录',
        };
      }

      // 统计分析
      const totalGenerated = records.reduce((sum, r) => sum + (r.emojis?.length || 0), 0);
      const totalUsed = records.filter(r => r.feedback?.selectedEmojiId).length;

      const alignments = records.map(r => r.brandAlignment.overallAlignment);
      const averageAlignment = alignments.reduce((a, b) => a + b, 0) / alignments.length;

      // 提取高频元素
      const allColors: string[] = [];
      const allEmotions: string[] = [];
      const allStyles: string[] = [];

      records.forEach(record => {
        record.emojis?.forEach((emoji: any) => {
          allColors.push(...emoji.usedBrandElements.colors);
          allEmotions.push(...emoji.usedBrandElements.emotions);
          allStyles.push(...emoji.usedBrandElements.visualStyle);
        });
      });

      const topColors = this.getTopItems(allColors, 5);
      const topEmotions = this.getTopItems(allEmotions, 5);
      const topStyles = this.getTopItems(allStyles, 5);

      // 使用平台统计（需要额外的usage数据）
      const usageByPlatform: { platform: string; count: number }[] = [];

      // 质量趋势（按日期）
      const qualityTrend = records.map(r => ({
        date: r.createdAt.toISOString().split('T')[0],
        alignment: r.brandAlignment.overallAlignment,
      }));

      return {
        success: true,
        trends: {
          totalGenerated,
          totalUsed,
          averageAlignment,
          topColors,
          topEmotions,
          topStyles,
          usageByPlatform,
          qualityTrend,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '趋势分析失败',
      };
    }
  }

  // ========== 私有辅助方法 ==========

  /**
   * 从数据库获取视觉库
   */
  private async getVisualLibrary(brandId: string): Promise<BrandVisualLibrary | null> {
    // TODO: 实际实现中从数据库查询
    // 这里返回mock数据作为示例
    return null;
  }

  /**
   * 从数据库获取品牌语料库
   */
  private async getBrandCorpus(brandId: string): Promise<BrandCorpus | null> {
    // TODO: 实际实现中从数据库查询
    return null;
  }

  /**
   * 保存生成记录到数据库
   */
  private async saveGenerationRecord(
    brandId: string,
    visualLibraryId: string,
    config: BrandEmojiConfig,
    result: BrandEmojiResult,
    userId: string
  ): Promise<string> {
    // TODO: 实际实现中保存到数据库
    const recordId = `emoji_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // 保存到BrandEmojiGenerationRecord表
    // await database.save({
    //   id: recordId,
    //   brandId,
    //   visualLibraryId,
    //   config,
    //   generatedEmojis: result.emojis,
    //   brandAlignment: result.brandAlignment,
    //   createdAt: new Date(),
    //   createdBy: userId,
    // });

    return recordId;
  }

  /**
   * 更新生成记录
   */
  private async updateGenerationRecord(recordId: string, updates: any): Promise<void> {
    // TODO: 实际实现中更新数据库
    // await database.update(recordId, updates);
  }

  /**
   * 查询生成记录
   */
  private async queryGenerationRecords(brandId: string, limit: number): Promise<any[]> {
    // TODO: 实际实现中从数据库查询
    // return await database.query({
    //   brandId,
    //   limit,
    //   orderBy: 'createdAt DESC'
    // });
    return [];
  }

  /**
   * 获取高频项
   */
  private getTopItems(items: string[], top: number): string[] {
    const freq = new Map<string, number>();
    items.forEach(item => {
      freq.set(item, (freq.get(item) || 0) + 1);
    });

    return Array.from(freq.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, top)
      .map(([item]) => item);
  }
}

/**
 * 使用示例
 */
export const BrandEmojiAPIUsageExample = `
// 1. 初始化API
const emojiAPI = new BrandEmojiAPI(emojiService, imageService);

// 2. 获取品牌元素选择器
const { selector } = await emojiAPI.getBrandElements('brand-123');

// 展示给用户：
// - 颜色选项: selector.colors (带色块、名称、用途)
// - 情绪选项: selector.emotions (品牌情绪词)
// - 关键词选项: selector.keywords (5维度关键词)
// - 视觉风格选项: selector.visualStyles (Logo、字体、设计模式)

// 3. 用户选择后，预览效果
const { preview } = await emojiAPI.previewBrandElements('brand-123', {
  brandId: 'brand-123',
  useBrandColors: true,
  useBrandStyle: true,
  useBrandMood: true,
  selectedColors: ['#FF6B6B', '#4ECDC4'],
  selectedEmotions: ['专业', '创新'],
  description: '一个表示成功的emoji',
  emojiType: 'detailed',
  emojiStyle: 'gradient',
});

// 展示预览信息：
// - prompt: 生成提示词
// - colorPalette: 将使用的颜色
// - styleKeywords: 风格关键词
// - moodKeywords: 情绪关键词
// - estimatedAlignment: 预估品牌一致性评分

// 4. 确认后生成emoji
const result = await emojiAPI.generateEmoji('brand-123', {
  brandId: 'brand-123',
  useBrandColors: true,
  useBrandStyle: true,
  useBrandMood: true,
  useBrandKeywords: true,
  selectedColors: ['#FF6B6B', '#4ECDC4'],
  selectedEmotions: ['专业', '创新'],
  selectedKeywords: ['科技', '高效'],
  description: '一个表示成功的emoji',
  emojiType: 'detailed',
  emojiStyle: 'gradient',
  emojiSize: 'large',
  count: 3,
}, 'user-456');

// 展示生成结果：
// - result.emojis: 生成的emoji数组（图片URL、描述、使用的品牌元素）
// - result.brandAlignment: 品牌一致性评分
// - result.suggestions: 优化建议

// 5. 用户选择一个emoji后提交反馈
await emojiAPI.submitFeedback(result.recordId, {
  rating: 5,
  comment: '非常符合品牌形象！',
  selectedEmojiId: result.emojis[0].id,
});

// 6. 记录emoji使用
await emojiAPI.recordUsage(result.recordId, result.emojis[0].id, {
  platform: 'instagram',
  contentId: 'post-789',
});

// 7. 查看历史记录
const { records } = await emojiAPI.getGenerationHistory('brand-123', 10);

// 8. 分析使用趋势
const { trends } = await emojiAPI.analyzeEmojiTrends('brand-123');
// 展示：生成总数、使用率、平均品牌一致性、高频颜色/情绪/风格、质量趋势等
`;
