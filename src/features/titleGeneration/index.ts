/**
 * 标题生成系统统一导出
 * 提供所有组件、Hook、服务和类型的统一入口
 */

import TitleGenerationConfig from './config/titleGeneration.config';

// 主要组件
export { default as TitleGenerator } from './components/TitleGenerator';
export { default as TitleList } from './components/TitleList';
export { default as TitleSettings } from './components/TitleSettings';
export { default as TitleGenerationProgress } from './components/TitleGenerationProgress';
export { default as ConcurrencyControl } from './components/ConcurrencyControl';
// export { default as PerformanceMonitorComponent } from './components/PerformanceMonitor'; // 模块不存在，暂时注释

// Hook
export { default as useTitleGeneration } from './hooks/useTitleGeneration';
export type { UseTitleGenerationOptions, UseTitleGenerationReturn } from './hooks/useTitleGeneration';

// 服务
export { default as titleGenerationService } from './services/TitleGenerationService';
export { default as aiService } from './services/AIService';
export { default as qualityScoreService } from './services/QualityScoreService';
export { titleCache } from './services/CacheService';
export { concurrencyManager } from './services/ConcurrencyManager';
export { streamingTitleService } from './services/StreamingTitleService';
export { performanceMonitor } from './services/PerformanceMonitor';

// 配置
export { default as TitleGenerationConfig, TitleGenerationConfig as Config } from './config/titleGeneration.config';
export {
  QUALITY_WEIGHTS,
  PLATFORM_CONFIGS,
  AI_SERVICE_CONFIG,
  CACHE_CONFIG,
  getPlatformConfig,
  getStyleConfig,
  validatePlatformId,
  validateTitleStyle,
  generateCacheKey
} from './config/titleGeneration.config';

// 类型
export type {
  // 基础类型
  TitleStyle,
  PlatformId,
  
  // 输入输出类型
  TitleGenerationInput,
  TitleGenerationResult,
  GeneratedTitle,
  QualityScore,
  
  // 配置类型
  PlatformConfig,
  AIServiceConfig,
  CacheConfig,
  
  // 服务接口
  ITitleGenerationService,
  IAIService,
  IQualityScoreService,
  
  // AI 相关类型
  AICallOptions,
  AIResponse,
  
  // 统计类型
  ServiceStats,
  
  // Hook 类型
  TitleGenerationState,
  TitleGenerationActions,
  
  // 组件属性类型
  TitleGeneratorProps,
  TitleListProps,
  TitleSettingsProps
} from './types/titleGeneration.types';

// 错误类型
export { TitleGenerationError } from './types/titleGeneration.types';

// 便捷函数
export const createTitleGenerator = (options?: {
  platform?: string;
  styles?: string[];
  outputCount?: number;
}) => {
  return {
    platform: options?.platform || 'default',
    stylePreference: options?.styles || ['informative'],
    outputCount: options?.outputCount || 5
  };
};

// 预设配置
export const PRESET_CONFIGS = {
  // 小红书优化配置
  xiaohongshu: createTitleGenerator({
    platform: 'xiaohongshu',
    styles: ['engaging', 'emotional', 'creative'],
    outputCount: 8
  }),
  
  // 微博优化配置
  weibo: createTitleGenerator({
    platform: 'weibo',
    styles: ['informative', 'engaging'],
    outputCount: 6
  }),
  
  // 知乎优化配置
  zhihu: createTitleGenerator({
    platform: 'zhihu',
    styles: ['informative', 'professional', 'practical'],
    outputCount: 5
  }),
  
  // 抖音优化配置
  douyin: createTitleGenerator({
    platform: 'douyin',
    styles: ['engaging', 'emotional', 'creative'],
    outputCount: 10
  }),
  
  // 通用配置
  default: createTitleGenerator({
    platform: 'default',
    styles: ['informative', 'engaging'],
    outputCount: 5
  })
};

// 版本信息
export const VERSION = '2.0.0';
export const BUILD_DATE = '2025-08-03';

// 系统信息
export const SYSTEM_INFO = {
  version: VERSION,
  buildDate: BUILD_DATE,
  features: [
    '多平台支持',
    'AI智能生成',
    '质量评分系统',
    '缓存优化',
    '进度指示',
    '批量操作',
    '导入导出',
    '统计分析'
  ],
  supportedPlatforms: Object.keys(TitleGenerationConfig.platforms),
  supportedStyles: Object.keys(TitleGenerationConfig.styles)
} as const;
