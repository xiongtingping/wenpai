/**
 * 流式标题生成服务
 * 支持实时生成和流式响应，提供更好的用户体验
 */

import { aiService } from './AIService';
import { qualityScoreService } from './QualityScoreService';
import { titleCache } from './CacheService';
import { performanceMonitor } from './PerformanceMonitor';
import { concurrencyManager } from './ConcurrencyManager';
import { TitleGenerationConfig, generateCacheKey } from '../config/titleGeneration.config';
import type {
  TitleGenerationInput,
  GeneratedTitle,
  TitleGenerationResult,
  PlatformId,
  TitleStyle
} from '../types/titleGeneration.types';
import { TitleGenerationError } from '../types/titleGeneration.types';

export interface StreamingProgress {
  stage: 'preparing' | 'generating' | 'scoring' | 'complete';
  progress: number;
  message: string;
  currentTitle?: Partial<GeneratedTitle>;
  completedTitles: GeneratedTitle[];
  totalExpected: number;
}

export interface StreamingOptions {
  onProgress?: (progress: StreamingProgress) => void;
  onTitleGenerated?: (title: GeneratedTitle) => void;
  onError?: (error: Error) => void;
  enableRealTimeScoring?: boolean;
  concurrency?: number;
}

export class StreamingTitleService {
  /**
   * 流式生成标题
   */
  async *generateTitlesStream(
    input: TitleGenerationInput,
    options: StreamingOptions = {}
  ): AsyncGenerator<StreamingProgress, TitleGenerationResult, unknown> {
    const startTime = performance.now();
    const {
      onProgress,
      onTitleGenerated,
      onError,
      enableRealTimeScoring = true,
      concurrency = 2
    } = options;

    const completedTitles: GeneratedTitle[] = [];
    const outputCount = input.outputCount || 5;
    let currentProgress = 0;

    try {
      // 阶段1: 准备
      const prepareProgress: StreamingProgress = {
        stage: 'preparing',
        progress: 10,
        message: '准备生成参数...',
        completedTitles: [],
        totalExpected: outputCount
      };
      yield prepareProgress;
      onProgress?.(prepareProgress);

      // 检查缓存
      const cacheKey = generateCacheKey(
        input.content,
        input.platform,
        input.stylePreference || ['informative'],
        outputCount
      );

      const cachedResult = titleCache.get<TitleGenerationResult>(cacheKey);
      if (cachedResult) {
        // 模拟流式返回缓存结果
        for (let i = 0; i < cachedResult.titles.length; i++) {
          const title = cachedResult.titles[i];
          completedTitles.push(title);
          
          const progress: StreamingProgress = {
            stage: 'complete',
            progress: ((i + 1) / cachedResult.titles.length) * 100,
            message: `从缓存加载标题 ${i + 1}/${cachedResult.titles.length}`,
            currentTitle: title,
            completedTitles: [...completedTitles],
            totalExpected: cachedResult.titles.length
          };
          
          yield progress;
          onProgress?.(progress);
          onTitleGenerated?.(title);
          
          // 添加小延迟以模拟流式效果
          await new Promise(resolve => setTimeout(resolve, 100));
        }

        return {
          ...cachedResult,
          cacheHit: true
        };
      }

      // 阶段2: 生成标题
      const generateProgress: StreamingProgress = {
        stage: 'generating',
        progress: 20,
        message: '开始AI生成...',
        completedTitles: [],
        totalExpected: outputCount
      };
      yield generateProgress;
      onProgress?.(generateProgress);

      // 创建多个提示词以支持并发生成
      const prompts = this.createMultiplePrompts(input, outputCount);
      
      // 使用流式AI调用
      let generatedCount = 0;
      const aiCallOptions = {
        temperature: 0.7,
        maxTokens: 400,
        timeout: 30000,
        concurrency,
        enableConcurrency: true
      };

      for await (const { index, result, error } of aiService.callStream(prompts, aiCallOptions)) {
        if (error) {
          console.warn(`AI调用失败 (${index}):`, error);
          onError?.(error);
          continue;
        }

        try {
          // 解析AI响应
          const parsedTitles = this.parseAIResponse(result.content, input.platform);
          
          for (const parsedTitle of parsedTitles) {
            if (completedTitles.length >= outputCount) break;

            generatedCount++;
            const baseProgress = 20 + (generatedCount / outputCount) * 40; // 20-60%

            // 实时评分
            let scoredTitle: GeneratedTitle;
            if (enableRealTimeScoring) {
              const scoringProgress: StreamingProgress = {
                stage: 'scoring',
                progress: baseProgress,
                message: `评分标题 ${generatedCount}...`,
                currentTitle: parsedTitle,
                completedTitles: [...completedTitles],
                totalExpected: outputCount
              };
              yield scoringProgress;
              onProgress?.(scoringProgress);

              const qualityScore = await qualityScoreService.calculateScore(
                parsedTitle.title || '',
                input.content,
                input.platform
              );

              scoredTitle = {
                ...parsedTitle,
                emotionalScore: qualityScore.emotionalAppeal,
                diversityScore: qualityScore.diversityScore,
                semanticCompleteness: qualityScore.semanticCompleteness,
                utilizationScore: qualityScore.utilizationScore,
                overallScore: qualityScore.overallScore
              } as GeneratedTitle;
            } else {
              // 使用默认评分
              scoredTitle = {
                ...parsedTitle,
                emotionalScore: 0.7,
                diversityScore: 0.7,
                semanticCompleteness: 0.8,
                utilizationScore: 0.7,
                overallScore: 0.7
              } as GeneratedTitle;
            }

            completedTitles.push(scoredTitle);

            const titleProgress: StreamingProgress = {
              stage: 'generating',
              progress: baseProgress + 10,
              message: `生成标题 ${completedTitles.length}/${outputCount}`,
              currentTitle: scoredTitle,
              completedTitles: [...completedTitles],
              totalExpected: outputCount
            };

            yield titleProgress;
            onProgress?.(titleProgress);
            onTitleGenerated?.(scoredTitle);
          }
        } catch (parseError) {
          console.warn('解析AI响应失败:', parseError);
          onError?.(parseError instanceof Error ? parseError : new Error(String(parseError)));
        }
      }

      // 阶段3: 完成处理
      const finalProgress: StreamingProgress = {
        stage: 'complete',
        progress: 100,
        message: `生成完成！共生成 ${completedTitles.length} 个标题`,
        completedTitles: [...completedTitles],
        totalExpected: outputCount
      };
      yield finalProgress;
      onProgress?.(finalProgress);

      // 排序和过滤
      const sortedTitles = completedTitles
        .filter(title => title.overallScore >= TitleGenerationConfig.qualityRules.minScore)
        .sort((a, b) => b.overallScore - a.overallScore);

      const result: TitleGenerationResult = {
        titles: sortedTitles,
        totalGenerated: sortedTitles.length,
        averageScore: this.calculateAverageScore(sortedTitles),
        bestTitle: sortedTitles[0] || null,
        generationTime: performance.now() - startTime,
        usedModel: 'streaming',
        cacheHit: false
      };

      // 缓存结果
      titleCache.set(cacheKey, result, {
        tags: [input.platform, 'streaming'],
        ttl: TitleGenerationConfig.cache.ttl
      });

      // 记录性能指标
      performanceMonitor.recordResponseTime(result.generationTime, 'streaming_title_generation', true);
      performanceMonitor.recordCacheHit(false, 'streaming_title_generation');

      return result;

    } catch (error) {
      const duration = performance.now() - startTime;
      performanceMonitor.recordResponseTime(duration, 'streaming_title_generation', false);
      
      if (error instanceof Error) {
        performanceMonitor.recordError(error, 'streaming_title_generation');
        onError?.(error);
      }

      throw error instanceof TitleGenerationError 
        ? error 
        : new TitleGenerationError(
            `流式标题生成失败: ${error instanceof Error ? error.message : String(error)}`,
            'STREAMING_GENERATION_FAILED',
            { input, error }
          );
    }
  }

  /**
   * 批量流式生成
   */
  async *generateBatchStream(
    inputs: TitleGenerationInput[],
    options: StreamingOptions & { batchConcurrency?: number } = {}
  ): AsyncGenerator<{ inputIndex: number; progress: StreamingProgress }, TitleGenerationResult[], unknown> {
    const { batchConcurrency = 2, ...streamOptions } = options;
    const results: TitleGenerationResult[] = new Array(inputs.length);
    let completedCount = 0;

    // 创建生成器数组
    const generators = inputs.map((input, index) => ({
      index,
      generator: this.generateTitlesStream(input, streamOptions)
    }));

    // 并发处理多个输入
    const activeGenerators = new Map<number, AsyncGenerator<StreamingProgress, TitleGenerationResult, unknown>>();
    let currentIndex = 0;

    // 启动初始并发任务
    for (let i = 0; i < Math.min(batchConcurrency, generators.length); i++) {
      const { index, generator } = generators[currentIndex++];
      activeGenerators.set(index, generator);
    }

    while (activeGenerators.size > 0 || currentIndex < generators.length) {
      // 处理活跃的生成器
      const promises = Array.from(activeGenerators.entries()).map(async ([index, generator]) => {
        try {
          const { value, done } = await generator.next();
          return { index, value, done, error: null };
        } catch (error) {
          return { index, value: null, done: true, error };
        }
      });

      const raceResult = await Promise.race(promises);
      const { index, value, done, error } = raceResult;

      if (error) {
        console.error(`批量生成失败 (输入 ${index}):`, error);
        activeGenerators.delete(index);
        completedCount++;
      } else if (done) {
        // 生成完成
        results[index] = value as TitleGenerationResult;
        activeGenerators.delete(index);
        completedCount++;

        // 启动下一个任务
        if (currentIndex < generators.length) {
          const { index: nextIndex, generator: nextGenerator } = generators[currentIndex++];
          activeGenerators.set(nextIndex, nextGenerator);
        }
      } else {
        // 产生进度更新
        yield {
          inputIndex: index,
          progress: value as StreamingProgress
        };
      }
    }

    return results.filter(result => result !== undefined);
  }

  /**
   * 创建多个提示词以支持并发
   */
  private createMultiplePrompts(input: TitleGenerationInput, totalCount: number): string[] {
    const platformConfig = TitleGenerationConfig.platforms[input.platform];
    const styles = input.stylePreference || ['informative'];
    
    // 将总数分配到多个请求中
    const requestCount = Math.min(Math.ceil(totalCount / 2), 3); // 最多3个并发请求
    const prompts: string[] = [];

    for (let i = 0; i < requestCount; i++) {
      const countPerRequest = Math.ceil((totalCount - i) / (requestCount - i));
      const prompt = aiService.buildTitleGenerationPrompt(
        input.content,
        platformConfig.name,
        styles,
        countPerRequest
      );
      prompts.push(prompt);
    }

    return prompts;
  }

  /**
   * 解析AI响应
   */
  private parseAIResponse(content: string, platform: PlatformId): Partial<GeneratedTitle>[] {
    try {
      const parsed = JSON.parse(content);
      const titles = parsed.titles || [];
      
      return titles.map((title: any, index: number) => ({
        id: `${platform}_${Date.now()}_${index}_${Math.random().toString(36).substr(2, 5)}`,
        title: title.title || '',
        length: (title.title || '').length,
        style: title.style || 'informative',
        confidence: title.semanticFit || 0.8,
        semanticFit: title.semanticFit || 0.8,
        platform: platform,
        isComplete: true,
        styleDescription: title.style || 'informative',
        generationReason: title.reasoning || 'AI生成',
        extractedContent: title.title?.substring(0, 50) || ''
      }));
    } catch (error) {
      console.error('解析AI响应失败:', error);
      throw new TitleGenerationError(
        'AI响应格式错误',
        'INVALID_AI_RESPONSE',
        { content, error }
      );
    }
  }

  /**
   * 计算平均评分
   */
  private calculateAverageScore(titles: GeneratedTitle[]): number {
    if (titles.length === 0) return 0;
    const total = titles.reduce((sum, title) => sum + title.overallScore, 0);
    return total / titles.length;
  }
}

// 创建单例实例
export const streamingTitleService = new StreamingTitleService();
export default streamingTitleService;
