/**
 * 标题生成自定义 Hook
 * 管理标题生成的状态和业务逻辑
 */

// import i18n from '@/i18n'; // 改为动态导入避免TDZ
import { useState, useCallback, useRef, useEffect } from 'react';
import { titleGenerationService } from '../services/TitleGenerationService';
import { streamingTitleService } from '../services/StreamingTitleService';
import { TitleGenerationConfig } from '../config/titleGeneration.config';
import { logger } from '@/utils/logger';
import type {
  TitleGenerationState,
  TitleGenerationActions,
  TitleGenerationInput,
  GeneratedTitle,
  PlatformId,
  TitleStyle
} from '../types/titleGeneration.types';

// 安全 i18n 助手，缺省回退原文案
const tr = (key: string, fallback: string): string => {
  try {
    const gi = (globalThis as any)?.i18n;
    if (gi && typeof gi.t === 'function') return gi.t(key) as string;
  } catch {}
  return fallback;
};

export interface UseTitleGenerationOptions {
  initialPlatform?: PlatformId;
  initialStyles?: TitleStyle[];
  initialOutputCount?: number;
  autoGenerate?: boolean;
  onSuccess?: (titles: GeneratedTitle[]) => void;
  onError?: (error: Error) => void;
}

export interface UseTitleGenerationReturn extends TitleGenerationState, TitleGenerationActions {
  // 配置相关
  platform: PlatformId;
  setPlatform: (platform: PlatformId) => void;
  stylePreference: TitleStyle[];
  setStylePreference: (styles: TitleStyle[]) => void;
  outputCount: number;
  setOutputCount: (count: number) => void;

  // 标题操作
  selectTitle: (title: GeneratedTitle) => void;
  copyTitle: (title: string) => Promise<boolean>;
  selectedTitle: GeneratedTitle | null;

  // 高级功能
  regenerateAll: () => Promise<void>;
  exportTitles: () => string;
  importTitles: (data: string) => boolean;
}

export const useTitleGeneration = (
  content: string,
  options: UseTitleGenerationOptions = {}
): UseTitleGenerationReturn => {
  // 基础状态
  const [state, setState] = useState<TitleGenerationState>({
    titles: [],
    loading: false,
    error: null,
    progress: 0,
    currentStage: 'idle',
    stats: null
  });

  // 配置状态
  const [platform, setPlatform] = useState<PlatformId>(
    options.initialPlatform || 'default'
  );
  const [stylePreference, setStylePreference] = useState<TitleStyle[]>(
    options.initialStyles || ['informative']
  );
  const [outputCount, setOutputCount] = useState(
    options.initialOutputCount || TitleGenerationConfig.generation.defaultOutputCount
  );
  const [selectedTitle, setSelectedTitle] = useState<GeneratedTitle | null>(null);

  // 引用
  const abortControllerRef = useRef<AbortController | null>(null);
  const lastContentRef = useRef<string>('');
  const generationTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * 生成标题
   */
  const generateTitles = useCallback(async (input?: TitleGenerationInput) => {
    // 取消之前的请求
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    const generationInput: TitleGenerationInput = input || {
      content,
      platform,
      stylePreference,
      outputCount,
      ensureDiversity: true
    };

    setState(prev => ({
      ...prev,
      loading: true,
      error: null,
      progress: 0,
      currentStage: 'validating'
    }));

    // 进度轮询（并发模式）
    let progressInterval: NodeJS.Timeout | null = null;
    const clearProgressInterval = () => { if (progressInterval) { clearInterval(progressInterval); progressInterval = null; } };

    try {
      // 流式模式：直接消费生成器的实时进度
      if (generationInput.enableStreaming) {
        const generator = streamingTitleService.generateTitlesStream(generationInput, {
          concurrency: generationInput.concurrency || 2
        });

        let finalResult: any = null;
        while (true) {
          const { value, done } = await generator.next();
          if (done) { finalResult = value; break; }
          if (value) {
            setState(prev => ({
              ...prev,
              progress: Math.max(0, Math.min(100, value.progress)),
              currentStage: value.stage as any,
              titles: value.completedTitles
            }));
          }
        }

        const result = finalResult as any; // TitleGenerationResult
        setState(prev => ({
          ...prev,
          titles: result.titles,
          loading: false,
          progress: 100,
          currentStage: 'complete',
          stats: titleGenerationService.getStats()
        }));

        if (result.bestTitle) setSelectedTitle(result.bestTitle);
        lastContentRef.current = content;
        options.onSuccess?.(result.titles);
        logger.debug(`✅ 生成${result.titles.length}个标题，平均评分: ${result.averageScore.toFixed(2)}`);
        return;
      }

      // 并发模式：依据 ConcurrencyManager 实时统计估算进度
      if (generationInput.enableConcurrency) {
        const baseline = titleGenerationService.getConcurrencyStats();
        const baselineTotal = baseline.completedRequests + baseline.failedRequests;
        const expectedAiCalls = Math.min(generationInput.concurrency || 2, generationInput.outputCount || TitleGenerationConfig.generation.defaultOutputCount);
        const expectedScoring = generationInput.outputCount || TitleGenerationConfig.generation.defaultOutputCount;
        const expectedTotal = expectedAiCalls + expectedScoring;

        progressInterval = setInterval(() => {
          const s = titleGenerationService.getConcurrencyStats();
          const currentTotal = s.completedRequests + s.failedRequests;
          const done = Math.max(0, currentTotal - baselineTotal);
          const ratio = Math.max(0, Math.min(1, expectedTotal > 0 ? done / expectedTotal : 0));
          const stage: any = done < expectedAiCalls ? 'generating' : 'scoring';
          setState(prev => ({ ...prev, progress: Math.floor(10 + ratio * 85), currentStage: stage }));
        }, 300);
      }

      // 调用服务生成标题
      const result = await titleGenerationService.generateTitles(generationInput);

      clearProgressInterval();

      setState(prev => ({
        ...prev,
        titles: result.titles,
        loading: false,
        progress: 100,
        currentStage: 'complete',
        stats: titleGenerationService.getStats()
      }));

      if (result.bestTitle) setSelectedTitle(result.bestTitle);
      lastContentRef.current = content;
      options.onSuccess?.(result.titles);
      logger.debug(`✅ 生成${result.titles.length}个标题，平均评分: ${result.averageScore.toFixed(2)}`);

    } catch (error) {
      clearProgressInterval();

      const errorMessage = error instanceof Error ? error.message : tr('common.errors.operationFailed', '操作失败');
      setState(prev => ({ ...prev, loading: false, error: errorMessage, progress: 0, currentStage: 'idle' }));
      options.onError?.(error instanceof Error ? error : new Error(errorMessage));
      logger.error('❌ title生成failed:', error);
    }
  }, [content, platform, stylePreference, outputCount, options]);

  /**
   * 重新生成单个标题
   */
  const regenerateTitle = useCallback(async (titleId: string) => {
    const titleIndex = state.titles.findIndex(t => t.id === titleId);
    if (titleIndex === -1) return;

    try {
      // 生成单个标题
      const result = await titleGenerationService.generateTitles({
        content,
        platform,
        stylePreference,
        outputCount: 1,
        ensureDiversity: true
      });

      if (result.titles.length > 0) {
        const newTitle = { ...result.titles[0], id: titleId };

        setState(prev => ({
          ...prev,
          titles: prev.titles.map((title, index) =>
            index === titleIndex ? newTitle : title
          )
        }));

        logger.info(`🔄 re生成title: ${newTitle.title}`);
      }
    } catch (error) {
      logger.error('re生成titlefailed:', error);
    }
  }, [content, platform, stylePreference, state.titles]);

  /**
   * 清除标题
   */
  const clearTitles = useCallback(() => {
    setState(prev => ({
      ...prev,
      titles: [],
      error: null,
      progress: 0,
      currentStage: 'idle'
    }));
    setSelectedTitle(null);
  }, []);

  /**
   * 清除错误
   */
  const clearError = useCallback(() => {
    setState(prev => ({
      ...prev,
      error: null
    }));
  }, []);

  /**
   * 刷新统计信息
   */
  const refreshStats = useCallback(async () => {
    const stats = titleGenerationService.getStats();
    setState(prev => ({
      ...prev,
      stats
    }));
  }, []);

  /**
   * 选择标题
   */
  const selectTitle = useCallback((title: GeneratedTitle) => {
    setSelectedTitle(title);
  }, []);

  /**
   * 复制标题
   */
  const copyTitle = useCallback(async (title: string): Promise<boolean> => {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(title);
      } else {
        // 降级方案
        const textArea = document.createElement('textarea');
        textArea.value = title;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }
      logger.info('📋 titlealreadycopying到剪贴板');
      return true;
    } catch (error) {
      logger.error('copyingfailed:', error);
      return false;
    }
  }, []);

  /**
   * 重新生成所有标题
   */
  const regenerateAll = useCallback(async () => {
    await generateTitles();
  }, [generateTitles]);

  /**
   * 导出标题
   */
  const exportTitles = useCallback((): string => {
    const exportData = {
      titles: state.titles,
      platform,
      stylePreference,
      outputCount,
      exportTime: new Date().toISOString(),
      content: content.substring(0, 100) + '...' // 只导出内容摘要
    };
    return JSON.stringify(exportData, null, 2);
  }, [state.titles, platform, stylePreference, outputCount, content]);

  /**
   * 导入标题
   */
  const importTitles = useCallback((data: string): boolean => {
    try {
      const importData = JSON.parse(data);
      if (importData.titles && Array.isArray(importData.titles)) {
        setState(prev => ({
          ...prev,
          titles: importData.titles
        }));

        if (importData.platform) setPlatform(importData.platform);
        if (importData.stylePreference) setStylePreference(importData.stylePreference);
        if (importData.outputCount) setOutputCount(importData.outputCount);

        logger.info(`📥 importing${importData.titles.length}unitstitle`);
        return true;
      }
      return false;
    } catch (error) {
      logger.error('importingfailed:', error);
      return false;
    }
  }, []);

  // 自动生成效果
  useEffect(() => {
    if (options.autoGenerate && content && content.length >= 5 && content !== lastContentRef.current) {
      const timer = setTimeout(() => {
        generateTitles();
      }, 500); // 防抖

      return () => clearTimeout(timer);
    }
  }, [content, options.autoGenerate, generateTitles]);

  // 清理效果
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (generationTimeoutRef.current) {
        clearTimeout(generationTimeoutRef.current);
      }
    };
  }, []);

  return {
    // 状态
    ...state,

    // 配置
    platform,
    setPlatform,
    stylePreference,
    setStylePreference,
    outputCount,
    setOutputCount,

    // 操作
    generateTitles,
    regenerateTitle,
    clearTitles,
    clearError,
    refreshStats,

    // 标题操作
    selectTitle,
    copyTitle,
    selectedTitle,

    // 高级功能
    regenerateAll,
    exportTitles,
    importTitles
  };

};

export default useTitleGeneration;
