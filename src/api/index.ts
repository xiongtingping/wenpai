/**
 * 统一 API 导出文件
 * 所有 API 相关功能统一从这里导出
 */

// 核心请求模块
export { request } from './request';

// AI 相关 API - 统一环境感知服务
export {
  callAI,
  generateImage,
  checkAIStatus,
  getEnvironmentInfo
} from './unifiedAIService';

// 原始AI接口（仅开发环境直接使用）
export {
  callAI as callDirectAI,
  callAIBatch,
  generateImage as generateDirectImage
} from './ai';

// 认证相关 API
export { 
  getAuthingConfig, 
  getGuardConfig
} from '../config/authing';

// 支付相关 API
export { 
  createCreemCheckout,
  getAPIEndpoint
} from './creemClientService';

// 热点话题 API
export { 
  fetchHotTopics,
  fetchTopicDetail 
} from './hotTopicsService';

// 推荐系统 API
export { 
  sendReferralReward,
  mockReferralReward
} from './referralService';

// 图像生成 API - 代理服务（仅生产环境使用）
export {
  generateImage as generateProxyImage
} from './imageGenerationService';

// 类型导出
export type {
  AICallParams,
  AIResponse,
  ProxyResponse,
  ReferralRewardRequest,
  ReferralRewardResponse,
  ImageGenerationRequest,
  ImageGenerationResponse
} from './types'; 