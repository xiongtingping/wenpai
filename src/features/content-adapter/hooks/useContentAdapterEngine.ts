/**
 * 内容适配器核心引擎Hook
 * 封装内容生成、重试、对比等核心业务逻辑
 */

import i18n from '@/i18n';
import { useState, useCallback, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import { ContentAdapterService } from '../services/contentAdapterService';
import type {
  GlobalSettings,
  PlatformSettings,
  ContentGenerationRequest,
  ContentGenerationResponse,
  ContentVersion
} from '../services/contentAdapterService';
import { type StyleType } from '@/config/contentSchemes';
import { getAlternativeContentForm, getAlternativeStyle } from '../utils/promptBuilders';

// 生成步骤状态
export interface GenerationStep {
  name: string;
  status: 'waiting' | 'loading' | 'completed' | 'error';
  message: string;
}

// 平台结果
export interface PlatformResult {
  platformId: string;
  content: string;
  steps: GenerationStep[];
  source: 'ai' | 'manual';
  versions?: ContentVersion[]; // 使用统一的ContentVersion接口
  error?: string;
  charCount?: number;
  targetCharCount?: number;
  canRetry?: boolean;
  tags?: string[];
}

// Hook状态
export interface ContentAdapterEngineState {
  // 基础状态
  generating: boolean;
  results: PlatformResult[];
  
  // 重试状态
  retryingPlatforms: Set<string>;
  autoRetryingPlatforms: Set<string>;
  
  // 版本生成状态
  regeneratingVersions: Set<string>;
  
  // 对比内容状态
  generatingComparison: Set<string>;
  comparisonContent: Record<string, string>;
  showComparison: Record<string, boolean>;
  
  // 标题生成状态
  titleStates: Record<string, {
    hasTitle: boolean;
    isGenerating: boolean;
  }>;

  // 标签提取状态
  extractedTagsMap: Record<string, string[]>; // platformId-versionId -> tags[]
}

// Hook参数
export interface UseContentAdapterEngineParams {
  globalSettings: GlobalSettings;
  platformSettings: Record<string, PlatformSettings>;
  selectedModel: string;
  useBrandLibrary: boolean;
  brandProfile?: any;
  onGenerationComplete?: (results: PlatformResult[]) => void;
}

// Hook返回值
export interface UseContentAdapterEngineReturn extends ContentAdapterEngineState {
  // 核心方法
  generateContent: (request: ContentGenerationRequest, selectedPlatforms: string[]) => Promise<void>;
  retryPlatform: (platformId: string, request: ContentGenerationRequest) => Promise<void>;
  regenerateVersion: (platformId: string, versionId: string, request: ContentGenerationRequest) => Promise<void>;
  generateComparison: (platformId: string, request: ContentGenerationRequest) => Promise<void>;
  generateTitle: (content: string, platformId: string) => Promise<void>;
  
  // 状态管理
  updatePlatformContent: (platformId: string, content: string) => void;
  clearResults: () => void;
  resetState: () => void;
  
  // 工具方法
  updateStep: (platformId: string, stepIndex: number, status: GenerationStep['status'], message?: string) => void;
}

/**
 * 内容适配器引擎Hook
 */
export function useContentAdapterEngine(params: UseContentAdapterEngineParams): UseContentAdapterEngineReturn {
  const { toast } = useToast();
  const serviceRef = useRef<ContentAdapterService>();
  
  // 初始化或更新服务
  if (!serviceRef.current) {
    serviceRef.current = new ContentAdapterService(params.globalSettings, params.platformSettings);
  } else {
    serviceRef.current.updateSettings(params.globalSettings, params.platformSettings);
  }

  // 状态定义
  const [generating, setGenerating] = useState(false);
  const [results, setResults] = useState<PlatformResult[]>([]);
  const [retryingPlatforms, setRetryingPlatforms] = useState<Set<string>>(new Set());
  const [autoRetryingPlatforms, setAutoRetryingPlatforms] = useState<Set<string>>(new Set());
  const [regeneratingVersions, setRegeneratingVersions] = useState<Set<string>>(new Set());
  const [generatingComparison, setGeneratingComparison] = useState<Set<string>>(new Set());
  const [comparisonContent, setComparisonContent] = useState<Record<string, string>>({});
  const [showComparison, setShowComparison] = useState<Record<string, boolean>>({});
  const [titleStates, setTitleStates] = useState<Record<string, {
    hasTitle: boolean;
    isGenerating: boolean;
  }>>({});

  // 标签提取状态
  const [extractedTagsMap, setExtractedTagsMap] = useState<Record<string, string[]>>({});

  // 更新步骤状态
  const updateStep = useCallback((
    platformId: string, 
    stepIndex: number, 
    status: GenerationStep['status'], 
    message?: string
  ) => {
    setResults(prev => prev.map(result => {
      if (result.platformId === platformId) {
        const newSteps = [...result.steps];
        if (newSteps[stepIndex]) {
          newSteps[stepIndex] = {
            ...newSteps[stepIndex],
            status,
            message: message || newSteps[stepIndex].message
          };
        }
        return { ...result, steps: newSteps };
      }
      return result;
    }));
  }, []);

  // 生成内容
  const generateContent = useCallback(async (
    request: ContentGenerationRequest,
    selectedPlatforms: string[]
  ) => {
    if (!serviceRef.current) return;

    setGenerating(true);
    
    // 初始化结果状态
    const initialResults: PlatformResult[] = selectedPlatforms.map(platformId => ({
      platformId,
      content: '',
      steps: [
        { name: 'prepare', status: 'waiting', message: '准备生成...' },
        { name: 'prompt', status: 'waiting', message: '构建提示词...' },
        { name: 'ai', status: 'waiting', message: '调用AI服务...' },
        { name: 'process', status: 'waiting', message: '处理结果...' }
      ],
      source: 'ai' as const
    }));
    setResults(initialResults);

    try {
      // 并发生成所有平台内容
      const promises = selectedPlatforms.map(async (platformId) => {
        try {
          // 步骤1: 准备生成
          updateStep(platformId, 0, 'completed');
          
          // 步骤2: 构建提示词
          updateStep(platformId, 1, 'loading', '🔧 构建多维矩阵提示词...');
          
          const platformRequest = {
            ...request,
            platform: platformId,
            model: params.selectedModel,
            useBrandLibrary: params.useBrandLibrary,
            brandProfile: params.brandProfile
          };
          
          updateStep(platformId, 1, 'completed');
          
          // 步骤3: 调用AI服务生成多版本内容
          updateStep(platformId, 2, 'loading', '🤖 调用AI服务生成多版本内容...');

          const result = await serviceRef.current!.generateMultipleVersions(platformRequest);

          if (result.success && result.versions && result.versions.length > 0) {
            updateStep(platformId, 2, 'completed');

            // 步骤4: 处理结果
            updateStep(platformId, 3, 'loading', '📝 处理生成结果...');

            // 使用第一个版本作为默认内容，保存所有版本
            const defaultContent = result.versions[0].content;

            // 更新标签映射
            result.versions.forEach(version => {
              const versionKey = `${platformId}-${version.id}`;
              if (version.tags && version.tags.length > 0) {
                setExtractedTagsMap(prev => ({
                  ...prev,
                  [versionKey]: version.tags!
                }));
              }
            });

            // 更新结果内容，包含多版本
            setResults(prev => prev.map(r =>
              r.platformId === platformId
                ? {
                    ...r,
                    content: defaultContent,
                    versions: result.versions,
                    error: undefined
                  }
                : r
            ));

            updateStep(platformId, 3, 'completed', `✅ 生成完成 (${result.versions.length}个版本)`);

          } else {
            throw new Error(result.error || i18n.t('common.errors.生成失败'));
          }
          
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : i18n.t('common.errors.生成失败');
          
          // 更新错误状态
          setResults(prev => prev.map(r => 
            r.platformId === platformId 
              ? { ...r, error: errorMessage }
              : r
          ));
          
          // 更新步骤为错误状态
          for (let i = 0; i < 4; i++) {
            updateStep(platformId, i, 'error', `❌ ${errorMessage}`);
          }
          
          console.error(`${platformId} 生成失败:`, error);
        }
      });

      await Promise.all(promises);
      
      toast({
        title: i18n.t('common.labels.内容生成完成'),
        description: `已为 ${selectedPlatforms.length} 个平台生成内容`,
      });

      // 调用完成回调保存历史记录
      if (params.onGenerationComplete) {
        params.onGenerationComplete(results.filter(r => r.content));
      }

    } catch (error) {
      console.error('批量生成失败:', error);
      toast({
        title: i18n.t('common.errors.生成失败'),
        description: "请检查网络连接后重试",
        variant: "destructive"
      });
    } finally {
      setGenerating(false);
    }
  }, [params.selectedModel, params.useBrandLibrary, params.brandProfile, updateStep, toast]);

  // 重试平台
  const retryPlatform = useCallback(async (
    platformId: string,
    request: ContentGenerationRequest
  ) => {
    if (!serviceRef.current) return;

    setRetryingPlatforms(prev => new Set(prev).add(platformId));

    try {
      const platformRequest = {
        ...request,
        platform: platformId,
        model: params.selectedModel,
        useBrandLibrary: params.useBrandLibrary,
        brandProfile: params.brandProfile
      };

      const result = await serviceRef.current.generateContent(platformRequest);

      if (result.success && result.content) {
        setResults(prev => prev.map(r => 
          r.platformId === platformId 
            ? { ...r, content: result.content!, error: undefined }
            : r
        ));

        toast({
          title: i18n.t('common.labels.重试成功'),
          description: `${platformId} 内容已重新生成`,
        });
      } else {
        throw new Error(result.error || i18n.t('common.errors.重试失败'));
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : i18n.t('common.errors.重试失败');
      
      setResults(prev => prev.map(r => 
        r.platformId === platformId 
          ? { ...r, error: errorMessage }
          : r
      ));

      toast({
        title: i18n.t('common.errors.重试失败'),
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setRetryingPlatforms(prev => {
        const newSet = new Set(prev);
        newSet.delete(platformId);
        return newSet;
      });
    }
  }, [params.selectedModel, params.useBrandLibrary, params.brandProfile, toast]);

  // 重新生成版本
  const regenerateVersion = useCallback(async (
    platformId: string,
    versionId: string,
    request: ContentGenerationRequest
  ) => {
    if (!serviceRef.current) return;

    const versionKey = `${platformId}-${versionId}`;
    setRegeneratingVersions(prev => new Set(prev).add(versionKey));

    try {
      const platformRequest = {
        ...request,
        platform: platformId,
        model: params.selectedModel,
        useBrandLibrary: params.useBrandLibrary,
        brandProfile: params.brandProfile
      };

      const result = await serviceRef.current.regenerateContent(platformRequest);

      if (result.success && result.content) {
        // 更新版本内容
        setResults(prev => prev.map(r => {
          if (r.platformId === platformId) {
            const newVersions = r.versions || [];
            const versionIndex = newVersions.findIndex(v => v.id === versionId);
            
            if (versionIndex >= 0) {
              newVersions[versionIndex] = {
                ...newVersions[versionIndex],
                content: result.content!,
                // timestamp: Date.now() // 移除不存在的属性
              };
            }
            
            return { ...r, versions: newVersions };
          }
          return r;
        }));

        toast({
          title: i18n.t('common.labels.版本重新生成成功'),
          description: `${platformId} ${versionId} 已更新`,
        });
      } else {
        throw new Error(result.error || i18n.t('common.errors.版本重新生成失败'));
      }

    } catch (error) {
      toast({
        title: i18n.t('common.errors.版本重新生成失败'),
        description: error instanceof Error ? error.message : i18n.t('common.errors.重新生成失败'),
        variant: "destructive"
      });
    } finally {
      setRegeneratingVersions(prev => {
        const newSet = new Set(prev);
        newSet.delete(versionKey);
        return newSet;
      });
    }
  }, [params.selectedModel, params.useBrandLibrary, params.brandProfile, toast]);

  // 生成对比内容
  const generateComparison = useCallback(async (
    platformId: string,
    request: ContentGenerationRequest
  ) => {
    if (!serviceRef.current) return;

    setGeneratingComparison(prev => new Set(prev).add(platformId));

    try {
      // 使用不同的内容策略生成对比版本
      const alternativeFormId = getAlternativeContentForm(platformId, request.formId);
      const alternativeStyle = getAlternativeStyle(request.style || 'professional');

      const comparisonRequest = {
        ...request,
        platform: platformId,
        formId: alternativeFormId,
        style: alternativeStyle,
        model: params.selectedModel,
        useBrandLibrary: params.useBrandLibrary,
        brandProfile: params.brandProfile
      };

      const result = await serviceRef.current.generateComparisonContent(comparisonRequest);

      if (result.success && result.content) {
        setComparisonContent(prev => ({
          ...prev,
          [platformId]: result.content!
        }));

        setShowComparison(prev => ({
          ...prev,
          [platformId]: true
        }));

        toast({
          title: i18n.t('common.labels.对比内容生成成功'),
          description: `已为${platformId}生成替代版本`,
        });
      } else {
        throw new Error(result.error || i18n.t('common.errors.对比内容生成失败'));
      }

    } catch (error) {
      toast({
        title: i18n.t('common.errors.对比内容生成失败'),
        description: error instanceof Error ? error.message : i18n.t('common.errors.生成失败'),
        variant: "destructive"
      });
    } finally {
      setGeneratingComparison(prev => {
        const newSet = new Set(prev);
        newSet.delete(platformId);
        return newSet;
      });
    }
  }, [params.selectedModel, params.useBrandLibrary, params.brandProfile, toast]);

  // 生成标题
  const generateTitle = useCallback(async (content: string, platformId: string) => {
    if (!serviceRef.current) return;

    setTitleStates(prev => ({
      ...prev,
      [platformId]: { hasTitle: false, isGenerating: true }
    }));

    try {
      const result = await serviceRef.current.generateTitle(content, params.selectedModel);

      if (result.success && result.content) {
        setTitleStates(prev => ({
          ...prev,
          [platformId]: { hasTitle: true, isGenerating: false }
        }));

        toast({
          title: "AI标题已生成",
          description: result.content,
        });
      } else {
        throw new Error(result.error || i18n.t('common.errors.标题生成失败'));
      }

    } catch (error) {
      setTitleStates(prev => ({
        ...prev,
        [platformId]: { hasTitle: false, isGenerating: false }
      }));

      toast({
        title: i18n.t('common.errors.标题生成失败'),
        description: "请稍后重试",
        variant: "destructive"
      });
    }
  }, [params.selectedModel, toast]);

  // 更新平台内容
  const updatePlatformContent = useCallback((platformId: string, content: string) => {
    setResults(prev => prev.map(r => 
      r.platformId === platformId 
        ? { ...r, content, source: 'manual' as const }
        : r
    ));
  }, []);

  // 清空结果
  const clearResults = useCallback(() => {
    setResults([]);
    setComparisonContent({});
    setShowComparison({});
    setTitleStates({});
  }, []);

  // 重置状态
  const resetState = useCallback(() => {
    setGenerating(false);
    setResults([]);
    setRetryingPlatforms(new Set());
    setAutoRetryingPlatforms(new Set());
    setRegeneratingVersions(new Set());
    setGeneratingComparison(new Set());
    setComparisonContent({});
    setShowComparison({});
    setTitleStates({});
  }, []);

  return {
    // 状态
    generating,
    results,
    retryingPlatforms,
    autoRetryingPlatforms,
    regeneratingVersions,
    generatingComparison,
    comparisonContent,
    showComparison,
    titleStates,
    extractedTagsMap,

    // 方法
    generateContent,
    retryPlatform,
    regenerateVersion,
    generateComparison,
    generateTitle,
    updatePlatformContent,
    clearResults,
    resetState,
    updateStep
  };
}
