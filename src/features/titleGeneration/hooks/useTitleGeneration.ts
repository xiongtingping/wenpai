/**
 * 标题生成自定义 Hook
 * 管理标题生成的状态和业务逻辑
 */

// import i18n from '@/i18n'; // 改为动态导入避免TDZ
import { useState, useCallback, useRef, useEffect } from 'react';
import { titleGenerationService } from '../services/TitleGenerationService';
import { TitleGenerationConfig } from '../config/titleGeneration.config';
import { logger } from '@/utils/logger';
import type {
  TitleGenerationState,
  TitleGenerationActions,
  TitleGenerationInput,
  GeneratedTitle,
  PlatformId,
  TitleStyle,
  ServiceStats
} from '../types/titleGeneration.types';

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

    try {
      // 模拟进度更新
      const progressStages = TitleGenerationConfig.generation.progressStages;
      let currentStageIndex = 0;

      const updateProgress = () => {
        if (currentStageIndex < progressStages.length) {
          const stage = progressStages[currentStageIndex];
          setState(prev => ({
            ...prev,
            progress: stage.progress,
            currentStage: stage.stage as any
          }));
          currentStageIndex++;
          
          if (currentStageIndex < progressStages.length) {
            generationTimeoutRef.current = setTimeout(updateProgress, 1000);
          }
        }
      };

      updateProgress();

      // 调用服务生成标题
      const result = await titleGenerationService.generateTitles(generationInput);

      // 清除进度定时器
      if (generationTimeoutRef.current) {
        clearTimeout(generationTimeoutRef.current);
      }

      setState(prev => ({
        ...prev,
        titles: result.titles,
        loading: false,
        progress: 100,
        currentStage: 'complete',
        stats: titleGenerationService.getStats()
      }));

      // 自动选择最佳标题
      if (result.bestTitle) {
        setSelectedTitle(result.bestTitle);
      }

      // 更新内容引用
      lastContentRef.current = content;

      // 成功回调
      if (options.onSuccess) {
        options.onSuccess(result.titles);
      }

      logger.debug('✅ 生成${result.titles.length}个标题，平均评分: ${result.averageScore.toFixed(2)}');

    } catch (error) {
      // 清除进度定时器
      if (generationTimeoutRef.current) {
        clearTimeout(generationTimeoutRef.current);
      }

      const errorMessage = error instanceof Error ? error.message : 'u64cdu4f5cu5931u8d25';
      
      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage,
        progress: 0,
        currentStage: 'idle'
      }));

      // 错误回调
      if (options.onError) {
        options.onError(error instanceof Error ? error : new Error(errorMessage));
      }

      console.error('❌ 标题生成失败:', error);
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

        console.log(`🔄 重新生成标题: ${newTitle.title}`);
      }
    } catch (error) {
      console.error('重新生成标题失败:', error);
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
      console.log('📋 标题已复制到剪贴板');
      return true;
    } catch (error) {
      console.error('复制失败:', error);
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
        
        console.log(`📥 导入${importData.titles.length}个标题`);
        return true;
      }
      return false;
    } catch (error) {
      console.error('导入失败:', error);
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
