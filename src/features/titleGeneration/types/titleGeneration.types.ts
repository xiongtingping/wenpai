/**
 * 标题生成系统类型定义
 * 统一管理所有相关的类型和接口
 */

// 基础类型
export type TitleStyle = 'informative' | 'engaging' | 'emotional' | 'practical' | 'creative' | 'professional';
export type PlatformId = 'xiaohongshu' | 'weibo' | 'wechat' | 'douyin' | 'zhihu' | 'bilibili' | 'toutiao' | 'default';

// 标题生成输入参数
export interface TitleGenerationInput {
  content: string;
  platform: PlatformId;
  stylePreference?: TitleStyle[];
  outputCount?: number;
  ensureDiversity?: boolean;
  version?: 'A' | 'B';
  // 并发选项
  enableConcurrency?: boolean;
  concurrency?: number;
  enableBatching?: boolean;
  enableStreaming?: boolean;
  priority?: number;
}

// 生成的标题数据
export interface GeneratedTitle {
  id: string;
  title: string;
  length: number;
  style: TitleStyle;
  confidence: number;
  semanticFit: number;
  platform: string;
  isComplete: boolean;
  styleDescription: string;
  emotionalScore: number;
  diversityScore: number;
  semanticCompleteness: number;
  utilizationScore: number;
  overallScore: number;
  generationReason: string;
  extractedContent: string;
}

// 质量评分结果
export interface QualityScore {
  semanticFit: number;
  emotionalAppeal: number;
  diversityScore: number;
  semanticCompleteness: number;
  utilizationScore: number;
  overallScore: number;
  qualityIssues: string[];
  suggestions: string[];
}

// 平台配置
export interface PlatformConfig {
  id: PlatformId;
  name: string;
  maxLength: number;
  minLength: number;
  recommendedLength: number;
  stylePreferences: TitleStyle[];
  specialRules?: string[];
}

// AI 服务配置
export interface AIServiceConfig {
  primaryModel: string;
  fallbackModels: string[];
  timeout: number;
  retries: number;
  temperature: number;
  maxTokens: number;
}

// 标题生成结果
export interface TitleGenerationResult {
  titles: GeneratedTitle[];
  totalGenerated: number;
  averageScore: number;
  bestTitle: GeneratedTitle | null;
  generationTime: number;
  usedModel: string;
  cacheHit: boolean;
}

// 缓存配置
export interface CacheConfig {
  enabled: boolean;
  ttl: number; // 缓存时间（毫秒）
  maxSize: number;
  keyPrefix: string;
}

// 错误类型
export class TitleGenerationError extends Error {
  constructor(
    message: string,
    public code: string,
    public context?: any
  ) {
    super(message);
    this.name = 'TitleGenerationError';
  }
}

// 服务接口
export interface ITitleGenerationService {
  generateTitles(input: TitleGenerationInput): Promise<TitleGenerationResult>;
  evaluateQuality(title: string, content: string, platform: PlatformId): Promise<QualityScore>;
  getPlatformConfig(platform: PlatformId): PlatformConfig;
  clearCache(): void;
  getStats(): ServiceStats;
}

export interface IAIService {
  callWithFallback(prompt: string, options: AICallOptions): Promise<AIResponse>;
  isAvailable(model: string): Promise<boolean>;
  getAvailableModels(): string[];
}

export interface IQualityScoreService {
  calculateScore(title: string, content: string, platform: PlatformId): Promise<QualityScore>;
  validateTitle(title: string, platform: PlatformId): { isValid: boolean; issues: string[] };
}

// AI 调用选项
export interface AICallOptions {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  timeout?: number;
  priority?: number; // 请求优先级
  enableConcurrency?: boolean; // 是否启用并发
  concurrency?: number; // 并发数量
  enableBatching?: boolean; // 是否启用批处理
  enableStreaming?: boolean; // 是否启用流式处理
}

// AI 响应
export interface AIResponse {
  content: string;
  model: string;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  finishReason: string;
}

// 服务统计
export interface ServiceStats {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  averageResponseTime: number;
  cacheHitRate: number;
  mostUsedPlatform: PlatformId;
  mostUsedModel: string;
}

// Hook 状态
export interface TitleGenerationState {
  titles: GeneratedTitle[];
  loading: boolean;
  error: string | null;
  progress: number;
  currentStage: 'idle' | 'validating' | 'calling_ai' | 'processing' | 'scoring' | 'complete';
  stats: ServiceStats | null;
}

// Hook 操作
export interface TitleGenerationActions {
  generateTitles: (input: TitleGenerationInput) => Promise<void>;
  regenerateTitle: (titleId: string) => Promise<void>;
  clearTitles: () => void;
  clearError: () => void;
  refreshStats: () => Promise<void>;
}

// 组件属性
export interface TitleGeneratorProps {
  content: string;
  platform: PlatformId;
  onTitleChange?: (title: string) => void;
  stylePreference?: TitleStyle[];
  outputCount?: number;
  ensureDiversity?: boolean;
  className?: string;
}

export interface TitleListProps {
  titles: GeneratedTitle[];
  onTitleSelect?: (title: GeneratedTitle) => void;
  onTitleCopy?: (title: string) => void;
  showScores?: boolean;
  className?: string;
}

export interface TitleSettingsProps {
  platform: PlatformId;
  onPlatformChange: (platform: PlatformId) => void;
  stylePreference: TitleStyle[];
  onStyleChange: (styles: TitleStyle[]) => void;
  outputCount: number;
  onOutputCountChange: (count: number) => void;
  className?: string;
}
