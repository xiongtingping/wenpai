/**
 * 统一 API 类型定义
 */

/**
 * AI 调用参数
 */
export interface AICallParams {
  /** 提示词 */
  prompt: string;
  /** 模型名称 */
  model?: string;
  /** 最大 token 数 */
  maxTokens?: number;
  /** 温度参数 */
  temperature?: number;
  /** 系统提示词 */
  systemPrompt?: string;
  /** 是否流式响应 */
  stream?: boolean;
  /** 用户ID */
  userId?: string;
  /** 额外参数 */
  extraParams?: Record<string, any>;
}

/**
 * AI 响应结果
 */
export interface AIResponse {
  /** 响应内容 */
  content: string;
  /** 使用的模型 */
  model: string;
  /** 使用情况 */
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
  /** 响应时间 */
  responseTime: number;
  /** 是否成功 */
  success: boolean;
  /** 错误信息 */
  error?: string;
}

/**
 * 代理响应
 */
export interface ProxyResponse {
  /** 是否成功 */
  success: boolean;
  /** 响应数据 */
  data?: any;
  /** 错误信息 */
  error?: string;
  /** 详细信息 */
  detail?: any;
}

/**
 * 推荐奖励请求
 */
export interface ReferralRewardRequest {
  /** 推荐人ID */
  referrerId: string;
  /** 被推荐人ID */
  referredId: string;
  /** 推荐类型 */
  type: 'signup' | 'purchase' | 'usage';
  /** 奖励金额 */
  amount: number;
  /** 额外数据 */
  metadata?: Record<string, any>;
}

/**
 * 推荐奖励响应
 */
export interface ReferralRewardResponse {
  /** 是否成功 */
  success: boolean;
  /** 奖励ID */
  rewardId?: string;
  /** 奖励金额 */
  amount?: number;
  /** 错误信息 */
  error?: string;
  /** 详细信息 */
  details?: any;
}

/**
 * 图像生成请求
 */
export interface ImageGenerationRequest {
  /** 提示词 */
  prompt: string;
  /** 图像尺寸 */
  size?: '256x256' | '512x512' | '1024x1024';
  /** 图像质量 */
  quality?: 'standard' | 'hd';
  /** 图像风格 */
  style?: 'vivid' | 'natural';
  /** 用户ID */
  userId?: string;
}

/**
 * 图像生成响应
 */
export interface ImageGenerationResponse {
  /** 是否成功 */
  success: boolean;
  /** 图像URL */
  url?: string;
  /** 图像数据 */
  data?: string;
  /** 错误信息 */
  error?: string;
  /** 消息 */
  message?: string;
}

/**
 * 热点话题数据
 */
export interface HotTopic {
  /** 话题ID */
  id: string;
  /** 标题 */
  title: string;
  /** 描述 */
  description: string;
  /** 热度 */
  hot: number;
  /** 标签 */
  tags: string[];
  /** 来源 */
  source: string;
  /** 发布时间 */
  publishTime: string;
  /** 链接 */
  url: string;
  /** 移动端链接 */
  mobil_url: string;
}

/**
 * 热点话题响应
 */
export interface HotTopicsResponse {
  /** 是否成功 */
  success: boolean;
  /** 数据 */
  data?: {
    data: HotTopic[];
    total: number;
    page: number;
    size: number;
  };
  /** 错误信息 */
  error?: string;
} 