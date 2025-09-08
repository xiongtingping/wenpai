/**
 * 内容适配器Hook统一导出
 * 提供完整的业务逻辑Hook集合
 */

// 核心引擎Hook
export {
  useContentAdapterEngine,
  type ContentAdapterEngineState,
  type UseContentAdapterEngineParams,
  type UseContentAdapterEngineReturn,
  type GenerationStep,
  type PlatformResult
} from './useContentAdapterEngine';

// 生成队列Hook
export {
  useGenerationQueue,
  type GenerationQueueState,
  type UseGenerationQueueParams,
  type UseGenerationQueueReturn,
  type QueueTask,
  type AutomationProgress
} from './useGenerationQueue';

// 设置管理Hook
export {
  useAdapterSettings,
  type AdapterSettingsState,
  type UseAdapterSettingsParams,
  type UseAdapterSettingsReturn,
  type SettingsMode,
  type SettingsModeState
} from './useAdapterSettings';

// 重新导出服务层类型，保持一致性
export type {
  GlobalSettings,
  PlatformSettings,
  ContentGenerationRequest,
  ContentGenerationResponse,
  VersionGenerationRequest,
  ComparisonGenerationRequest
} from '../services/contentAdapterService';

// 重新导出工具类型
export type { StyleType } from '@/config/contentSchemes';
