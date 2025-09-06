/**
 * 标题生成服务
 * 核心业务逻辑，协调各个服务组件
 */

import { aiService } from './AIService';
import { qualityScoreService } from './QualityScoreService';
import { titleCache } from './CacheService';
import { performanceMonitor } from './PerformanceMonitor';
import { streamingTitleService } from './StreamingTitleService';
import { concurrencyManager } from './ConcurrencyManager';
import { TitleGenerationConfig, generateCacheKey } from '../config/titleGeneration.config';
import { logger } from '@/utils/logger';
import type {
  ITitleGenerationService,
  TitleGenerationInput,
  TitleGenerationResult,
  GeneratedTitle,
  QualityScore,
  PlatformConfig,
  PlatformId,
  ServiceStats
} from '../types/titleGeneration.types';
import { TitleGenerationError } from '../types/titleGeneration.types';

export class TitleGenerationService implements ITitleGenerationService {
  private stats: ServiceStats = {
    totalRequests: 0,
    successfulRequests: 0,
    failedRequests: 0,
    averageResponseTime: 0,
    cacheHitRate: 0,
    mostUsedPlatform: 'default',
    mostUsedModel: 'deepseek-v3'
  };
  private platformUsage: Map<PlatformId, number> = new Map();
  private modelUsage: Map<string, number> = new Map();
  private responseTimes: number[] = [];

  /**
   * 生成标题 (支持并发和流式处理)
   */
  async generateTitles(input: TitleGenerationInput): Promise<TitleGenerationResult> {
    // 如果启用流式处理，使用流式服务
    if (input.enableStreaming) {
      return this.generateTitlesWithStreaming(input);
    }

    // 如果启用并发处理，使用并发优化
    if (input.enableConcurrency) {
      return this.generateTitlesWithConcurrency(input);
    }

    // 默认单线程处理
    return this.generateTitlesDefault(input);
  }

  /**
   * 流式生成标题
   */
  private async generateTitlesWithStreaming(input: TitleGenerationInput): Promise<TitleGenerationResult> {
    const generator = streamingTitleService.generateTitlesStream(input, {
      enableRealTimeScoring: true,
      concurrency: input.concurrency || 2
    });

    // 消费进度但不保留中间结果
    for await (const progress of generator) {
      console.log(`流式生成进度: ${progress.progress}% - ${progress.message}`);
    }

    // 生成器声明的返回类型为 TitleGenerationResult，直接 return 即可
    const final = await generator.return(undefined as unknown as TitleGenerationResult);
    return final.value as TitleGenerationResult;
  }

  /**
   * 并发生成标题
   */
  private async generateTitlesWithConcurrency(input: TitleGenerationInput): Promise<TitleGenerationResult> {
    const startTime = performance.now();
    this.stats.totalRequests++;

    try {
      // 1. 输入验证
      this.validateInput(input);

      // 2. 检查缓存
      const cacheKey = this.generateCacheKey(input);
      const cachedResult = titleCache.get<TitleGenerationResult>(cacheKey);
      if (cachedResult) {
        console.log('🎯 使用缓存结果');
        performanceMonitor.recordCacheHit(true, 'title_generation');
        performanceMonitor.recordResponseTime(performance.now() - startTime, 'title_generation', true);
        return {
          ...cachedResult,
          cacheHit: true
        };
      }

      // 3. 获取平台配置
      const platformConfig = this.getPlatformConfig(input.platform);

      // 4. 创建多个提示词进行并发生成
      const outputCount = input.outputCount || 5;
      const concurrency = input.concurrency || 2;
      const prompts = this.createConcurrentPrompts(input, platformConfig, outputCount, concurrency);

      logger.system('🚀 开始并发AI生成 (${concurrency}个并发请求)...');

      // 5. 并发调用AI
      const aiResponses = await aiService.callBatch(prompts, {
        temperature: 0.7,
        maxTokens: 400,
        timeout: 30000,
        priority: input.priority || 0,
        enableConcurrency: true
      });

      // 6. 合并和解析响应
      const allParsedTitles: Partial<GeneratedTitle>[] = [];
      for (const response of aiResponses) {
        const parsedTitles = this.parseAIResponse(response.content, input.platform);
        allParsedTitles.push(...parsedTitles);
      }

      // 7. 限制数量并去重
      const uniqueTitles = this.deduplicateTitles(allParsedTitles).slice(0, outputCount);

      // 8. 并发质量评分
      console.log('📊 开始并发质量评分...');
      const scoredTitles = await this.scoreTitlesConcurrently(uniqueTitles, input.content, input.platform);

      // 9. 排序和过滤
      const finalTitles = this.filterAndSortTitles(scoredTitles);

      // 10. 构建结果
      const result: TitleGenerationResult = {
        titles: finalTitles,
        totalGenerated: finalTitles.length,
        averageScore: this.calculateAverageScore(finalTitles),
        bestTitle: finalTitles[0] || null,
        generationTime: performance.now() - startTime,
        usedModel: 'concurrent',
        cacheHit: false
      };

      // 11. 缓存结果
      titleCache.set(cacheKey, result, {
        tags: [input.platform, 'concurrent'],
        ttl: TitleGenerationConfig.cache.ttl
      });

      // 12. 更新统计和性能监控
      this.updateStats(input.platform, 'concurrent', result.generationTime, true);
      performanceMonitor.recordResponseTime(result.generationTime, 'concurrent_title_generation', true);
      performanceMonitor.recordCacheHit(false, 'concurrent_title_generation');

      logger.debug('✅ 并发标题生成完成，耗时: ${result.generationTime.toFixed(2)}ms');
      return result;

    } catch (error) {
      const duration = performance.now() - startTime;
      this.updateStats(input.platform, 'unknown', duration, false);

      // 记录性能监控
      performanceMonitor.recordResponseTime(duration, 'concurrent_title_generation', false);
      if (error instanceof Error) {
        performanceMonitor.recordError(error, 'concurrent_title_generation');
      }

      console.error('❌ 并发标题生成失败:', error);
      throw error instanceof TitleGenerationError
        ? error
        : new TitleGenerationError(
            `并发标题生成失败: ${error instanceof Error ? error.message : String(error)}`,
            'CONCURRENT_GENERATION_FAILED',
            { input, error }
          );
    }
  }

  /**
   * 默认单线程生成标题
   */
  private async generateTitlesDefault(input: TitleGenerationInput): Promise<TitleGenerationResult> {
    const startTime = performance.now();
    this.stats.totalRequests++;

    try {
      // 1. 输入验证
      this.validateInput(input);

      // 2. 检查缓存
      const cacheKey = this.generateCacheKey(input);
      const cachedResult = titleCache.get<TitleGenerationResult>(cacheKey);
      if (cachedResult) {
        console.log('🎯 使用缓存结果');
        performanceMonitor.recordCacheHit(true, 'title_generation');
        performanceMonitor.recordResponseTime(performance.now() - startTime, 'title_generation', true);
        return {
          ...cachedResult,
          cacheHit: true
        };
      }

      // 3. 获取平台配置
      const platformConfig = this.getPlatformConfig(input.platform);

      // 4. 构建提示词
      const prompt = this.buildPrompt(input, platformConfig);

      // 5. 调用 AI 生成
      console.log('🤖 开始AI生成...');
      const aiResponse = await aiService.callWithFallback(prompt, {
        temperature: 0.7,
        maxTokens: 400,
        timeout: 30000
      });

      // 6. 解析响应
      const parsedTitles = this.parseAIResponse(aiResponse.content, input.platform);

      // 7. 质量评分
      console.log('📊 计算质量评分...');
      const scoredTitles = await this.scoreTitles(parsedTitles, input.content, input.platform);

      // 8. 排序和过滤
      const finalTitles = this.filterAndSortTitles(scoredTitles);

      // 9. 构建结果
      const result: TitleGenerationResult = {
        titles: finalTitles,
        totalGenerated: finalTitles.length,
        averageScore: this.calculateAverageScore(finalTitles),
        bestTitle: finalTitles[0] || null,
        generationTime: performance.now() - startTime,
        usedModel: aiResponse.model,
        cacheHit: false
      };

      // 10. 缓存结果
      titleCache.set(cacheKey, result, {
        tags: [input.platform, 'generation'],
        ttl: TitleGenerationConfig.cache.ttl
      });

      // 11. 更新统计和性能监控
      this.updateStats(input.platform, aiResponse.model, result.generationTime, true);
      performanceMonitor.recordResponseTime(result.generationTime, 'title_generation', true);
      performanceMonitor.recordCacheHit(false, 'title_generation');

      logger.debug('✅ 标题生成完成，耗时: ${result.generationTime.toFixed(2)}ms');
      return result;

    } catch (error) {
      const duration = performance.now() - startTime;
      this.updateStats(input.platform, 'unknown', duration, false);

      // 记录性能监控
      performanceMonitor.recordResponseTime(duration, 'title_generation', false);
      if (error instanceof Error) {
        performanceMonitor.recordError(error, 'title_generation');
      }

      console.error('❌ 标题生成失败:', error);
      throw error instanceof TitleGenerationError
        ? error
        : new TitleGenerationError(
            `标题生成失败: ${error instanceof Error ? error.message : String(error)}`,
            'GENERATION_FAILED',
            { input, error }
          );
    }
  }

  /**
   * 评估标题质量
   */
  async evaluateQuality(title: string, content: string, platform: PlatformId): Promise<QualityScore> {
    return await qualityScoreService.calculateScore(title, content, platform);
  }

  /**
   * 获取平台配置
   */
  getPlatformConfig(platform: PlatformId): PlatformConfig {
    return TitleGenerationConfig.platforms[platform] || TitleGenerationConfig.platforms.default;
  }

  /**
   * 清除缓存
   */
  clearCache(): void {
    titleCache.clear();
    console.log('🗑️ 缓存已清除');
  }

  /**
   * 获取统计信息
   */
  getStats(): ServiceStats {
    // 更新缓存命中率
    const cacheStats = titleCache.getStats();
    this.stats.cacheHitRate = cacheStats.hitRate;

    // 更新最常用平台
    let maxUsage = 0;
    let mostUsedPlatform: PlatformId = 'default';
    this.platformUsage.forEach((usage, platform) => {
      if (usage > maxUsage) {
        maxUsage = usage;
        mostUsedPlatform = platform;
      }
    });
    this.stats.mostUsedPlatform = mostUsedPlatform;

    // 更新最常用模型
    let maxModelUsage = 0;
    let mostUsedModel = 'deepseek-v3';
    this.modelUsage.forEach((usage, model) => {
      if (usage > maxModelUsage) {
        maxModelUsage = usage;
        mostUsedModel = model;
      }
    });
    this.stats.mostUsedModel = mostUsedModel;

    return { ...this.stats };
  }

  /**
   * 验证输入参数
   */
  private validateInput(input: TitleGenerationInput): void {
    if (!input.content || input.content.trim().length < 5) {
      throw new TitleGenerationError(
        '内容长度不能少于5个字符',
        'INVALID_CONTENT_LENGTH',
        { contentLength: input.content?.length || 0 }
      );
    }

    if (!input.platform) {
      throw new TitleGenerationError(
        '必须指定目标平台',
        'MISSING_PLATFORM',
        { input }
      );
    }

    const outputCount = input.outputCount || TitleGenerationConfig.generation.defaultOutputCount;
    if (outputCount < 1 || outputCount > TitleGenerationConfig.generation.maxOutputCount) {
      throw new TitleGenerationError(
        `输出数量必须在1-${TitleGenerationConfig.generation.maxOutputCount}之间`,
        'INVALID_OUTPUT_COUNT',
        { outputCount }
      );
    }
  }

  /**
   * 生成缓存键
   */
  private generateCacheKey(input: TitleGenerationInput): string {
    const styles = input.stylePreference || ['informative'];
    const count = input.outputCount || 5;
    return generateCacheKey(input.content, input.platform, styles, count);
  }

  /**
   * 构建提示词
   */
  private buildPrompt(input: TitleGenerationInput, platformConfig: PlatformConfig): string {
    const styles = input.stylePreference || ['informative'];
    const count = input.outputCount || 5;
    
    return aiService.buildTitleGenerationPrompt(
      input.content,
      platformConfig.name,
      styles,
      count
    );
  }

  /**
   * 解析 AI 响应
   */
  private parseAIResponse(content: string, platform: PlatformId): Partial<GeneratedTitle>[] {
    try {
      console.log('🔍 开始解析AI响应:', content.substring(0, 200) + '...');

      // 处理markdown格式的JSON响应
      let jsonContent = content.trim();

      // 移除markdown代码块标记
      if (jsonContent.startsWith('```json')) {
        jsonContent = jsonContent.replace(/^```json\s*/, '').replace(/\s*```$/, '');
      } else if (jsonContent.startsWith('```')) {
        jsonContent = jsonContent.replace(/^```\s*/, '').replace(/\s*```$/, '');
      }

      console.log('🔍 清理后的JSON内容:', jsonContent.substring(0, 200) + '...');

      // 尝试解析JSON
      const parsed = JSON.parse(jsonContent);
      console.log('🔍 解析后的对象:', parsed);

      // 尝试多种可能的数据结构
      let titles = [];
      if (parsed.titles && Array.isArray(parsed.titles)) {
        titles = parsed.titles;
      } else if (Array.isArray(parsed)) {
        titles = parsed;
      } else if (parsed.data && Array.isArray(parsed.data)) {
        titles = parsed.data;
      } else if (parsed.results && Array.isArray(parsed.results)) {
        titles = parsed.results;
      }

      console.log(`🔍 提取到的标题数组:`, titles);
      console.log(`🔍 标题数量: ${titles.length}`);

      if (titles.length === 0) {
        console.warn('⚠️ 没有找到标题数据，尝试从响应中提取文本');
        // 如果没有找到结构化数据，尝试从文本中提取标题
        const textTitles = this.extractTitlesFromText(content);
        if (textTitles.length > 0) {
          titles = textTitles;
        }
      }

      const result = titles.map((title: any, index: number) => {
        // 处理不同的标题格式
        let titleText = '';
        if (typeof title === 'string') {
          titleText = title;
        } else if (title.title) {
          titleText = title.title;
        } else if (title.text) {
          titleText = title.text;
        } else if (title.content) {
          titleText = title.content;
        }

        return {
          id: `${platform}_${Date.now()}_${index}`,
          title: titleText,
          length: titleText.length,
          style: title.style || 'informative',
          confidence: title.semanticFit || title.confidence || 0.8,
          semanticFit: title.semanticFit || title.confidence || 0.8,
          platform: platform,
          isComplete: true,
          styleDescription: title.style || 'informative',
          generationReason: title.reasoning || title.reason || 'AI生成',
          extractedContent: titleText.substring(0, 50)
        };
      });

      logger.debug('✅ 成功解析 ${result.length} 个标题');
      return result;

    } catch (error) {
      console.error('❌ 解析AI响应失败:', error);
      console.error('📄 原始内容:', content);
      throw new TitleGenerationError(
        'AI响应格式错误',
        'INVALID_AI_RESPONSE',
        { content, error }
      );
    }
  }

  /**
   * 从文本中提取标题（备用方案）
   */
  private extractTitlesFromText(content: string): string[] {
    const titles: string[] = [];

    // 尝试匹配常见的标题格式
    const patterns = [
      /^\d+\.\s*(.+)$/gm,  // 1. 标题
      /^-\s*(.+)$/gm,      // - 标题
      /^\*\s*(.+)$/gm,     // * 标题
      /^"(.+)"$/gm,        // "标题"
      /^【(.+)】$/gm        // 【标题】
    ];

    for (const pattern of patterns) {
      const matches = content.matchAll(pattern);
      for (const match of matches) {
        if (match[1] && match[1].trim().length > 0) {
          titles.push(match[1].trim());
        }
      }
      if (titles.length > 0) break;
    }

    console.log(`🔍 从文本提取到 ${titles.length} 个标题:`, titles);
    return titles;
  }

  /**
   * 为标题计算质量评分
   */
  private async scoreTitles(
    titles: Partial<GeneratedTitle>[], 
    content: string, 
    platform: PlatformId
  ): Promise<GeneratedTitle[]> {
    const scoredTitles: GeneratedTitle[] = [];

    for (const title of titles) {
      if (!title.title) continue;

      try {
        const qualityScore = await qualityScoreService.calculateScore(
          title.title, 
          content, 
          platform
        );

        scoredTitles.push({
          ...title,
          emotionalScore: qualityScore.emotionalAppeal,
          diversityScore: qualityScore.diversityScore,
          semanticCompleteness: qualityScore.semanticCompleteness,
          utilizationScore: qualityScore.utilizationScore,
          overallScore: qualityScore.overallScore
        } as GeneratedTitle);
      } catch (error) {
        console.warn('质量评分失败:', error);
        // 使用默认评分
        scoredTitles.push({
          ...title,
          emotionalScore: 0.7,
          diversityScore: 0.7,
          semanticCompleteness: 0.8,
          utilizationScore: 0.7,
          overallScore: 0.7
        } as GeneratedTitle);
      }
    }

    return scoredTitles;
  }

  /**
   * 过滤和排序标题
   */
  private filterAndSortTitles(titles: GeneratedTitle[]): GeneratedTitle[] {
    const minScore = TitleGenerationConfig.qualityRules.minScore;
    
    return titles
      .filter(title => title.overallScore >= minScore)
      .sort((a, b) => b.overallScore - a.overallScore);
  }

  /**
   * 计算平均评分
   */
  private calculateAverageScore(titles: GeneratedTitle[]): number {
    if (titles.length === 0) return 0;
    const total = titles.reduce((sum, title) => sum + title.overallScore, 0);
    return total / titles.length;
  }

  /**
   * 创建并发提示词
   */
  private createConcurrentPrompts(
    input: TitleGenerationInput,
    platformConfig: any,
    totalCount: number,
    concurrency: number
  ): string[] {
    const styles = input.stylePreference || ['informative'];
    const prompts: string[] = [];

    // 将总数分配到多个并发请求中
    const countPerRequest = Math.ceil(totalCount / concurrency);

    for (let i = 0; i < concurrency; i++) {
      const remainingCount = totalCount - (i * countPerRequest);
      const currentCount = Math.min(countPerRequest, remainingCount);

      if (currentCount > 0) {
        const prompt = aiService.buildTitleGenerationPrompt(
          input.content,
          platformConfig.name,
          styles,
          currentCount
        );
        prompts.push(prompt);
      }
    }

    return prompts;
  }

  /**
   * 并发质量评分
   */
  private async scoreTitlesConcurrently(
    titles: Partial<GeneratedTitle>[],
    content: string,
    platform: PlatformId
  ): Promise<GeneratedTitle[]> {
    const scoringTasks = titles.map(title =>
      () => this.scoreTitle(title, content, platform)
    );

    const scoredTitles = await concurrencyManager.submitBatch(scoringTasks, {
      priority: 1, // 评分任务优先级较高
      maxRetries: 1,
      timeout: 10000,
      tags: {
        operation: 'quality_scoring',
        platform: platform
      }
    });

    return scoredTitles.filter(title => title !== null) as GeneratedTitle[];
  }

  /**
   * 评分单个标题
   */
  private async scoreTitle(
    title: Partial<GeneratedTitle>,
    content: string,
    platform: PlatformId
  ): Promise<GeneratedTitle | null> {
    if (!title.title) return null;

    try {
      const qualityScore = await qualityScoreService.calculateScore(
        title.title,
        content,
        platform
      );

      return {
        ...title,
        emotionalScore: qualityScore.emotionalAppeal,
        diversityScore: qualityScore.diversityScore,
        semanticCompleteness: qualityScore.semanticCompleteness,
        utilizationScore: qualityScore.utilizationScore,
        overallScore: qualityScore.overallScore
      } as GeneratedTitle;
    } catch (error) {
      console.warn('质量评分失败:', error);
      // 使用默认评分
      return {
        ...title,
        emotionalScore: 0.7,
        diversityScore: 0.7,
        semanticCompleteness: 0.8,
        utilizationScore: 0.7,
        overallScore: 0.7
      } as GeneratedTitle;
    }
  }

  /**
   * 去重标题
   */
  private deduplicateTitles(titles: Partial<GeneratedTitle>[]): Partial<GeneratedTitle>[] {
    const seen = new Set<string>();
    return titles.filter(title => {
      if (!title.title) return false;
      const normalizedTitle = title.title.toLowerCase().trim();
      if (seen.has(normalizedTitle)) return false;
      seen.add(normalizedTitle);
      return true;
    });
  }

  /**
   * 获取并发管理器统计
   */
  getConcurrencyStats() {
    return concurrencyManager.getStats();
  }

  /**
   * 配置并发参数
   */
  configureConcurrency(config: {
    maxConcurrency?: number;
    maxQueueSize?: number;
    batchSize?: number;
    batchTimeout?: number;
  }): void {
    concurrencyManager.configure(config);
  }

  /**
   * 更新统计信息
   */
  private updateStats(
    platform: PlatformId,
    model: string,
    responseTime: number,
    success: boolean
  ): void {
    if (success) {
      this.stats.successfulRequests++;
    } else {
      this.stats.failedRequests++;
    }

    // 更新平台使用统计
    const currentPlatformUsage = this.platformUsage.get(platform) || 0;
    this.platformUsage.set(platform, currentPlatformUsage + 1);

    // 更新模型使用统计
    const currentModelUsage = this.modelUsage.get(model) || 0;
    this.modelUsage.set(model, currentModelUsage + 1);

    // 更新响应时间
    this.responseTimes.push(responseTime);
    if (this.responseTimes.length > 100) {
      this.responseTimes.shift(); // 保持最近100次的记录
    }

    const totalTime = this.responseTimes.reduce((sum, time) => sum + time, 0);
    this.stats.averageResponseTime = totalTime / this.responseTimes.length;
  }
}

// 创建单例实例
export const titleGenerationService = new TitleGenerationService();
export default titleGenerationService;
