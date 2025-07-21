/**
 * 统一 API 导出文件
 * 所有 API 相关功能统一从这里导出
 */

// 核心请求模块
export { request } from './request';

// AI 相关 API
export { callAI, callAIBatch } from './ai';

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

// 图像生成 API
export { 
  generateImage
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