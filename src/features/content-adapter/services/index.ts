/**
 * 内容适配器服务入口
 * 提供服务实例创建和管理
 */

export { ContentAdapterService } from './contentAdapterService';
export type {
  GlobalSettings,
  PlatformSettings,
  ContentGenerationRequest,
  ContentGenerationResponse,
  VersionGenerationRequest,
  ComparisonGenerationRequest
} from './contentAdapterService';

// 重新导出工具函数，保持向后兼容
export {
  generateMatrixPrompt,
  getPlatformCharacteristics,
  getAlternativeContentForm,
  getAlternativeStyle,
  generatePlatformDimension,
  generateContentFormDimension,
  generateContentDimension,
  generateBrandDimension,
  generateStyleDimension,
  generateCustomDimension,
  generateDifferentiationDimension,
  generateMeaningfulTitle
} from '../utils/promptBuilders';

export {
  generateCharCountDimension,
  generateFormatDimension,
  createMatrixPromptGenerator,
  createFormatDimensionGenerator
} from '../utils/promptBuilders.stateful';
