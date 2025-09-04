/**
 * AI内容适配器 - 类型定义系统
 * 统一管理所有相关类型，确保类型安全
 */

// ========================================================================================
// 基础类型
// ========================================================================================

export interface Platform {
  id: string;
  name: string;
  icon?: string;
  color?: string;
  enabled: boolean;
  settings?: PlatformSettings;
}

export interface PlatformSettings {
  characterLimit?: {
    min: number;
    max: number;
    preset?: 'auto' | 'short' | 'medium' | 'long' | 'custom';
    customValue?: number;
  };
  contentType?: string;
  tags?: string[];
  customPrompt?: string;
}

// ========================================================================================
// 内容相关类型
// ========================================================================================

export interface ContentForm {
  id: string;
  name: string;
  description: string;
  template?: string;
  enabled: boolean;
}

export interface ContentScheme {
  id: string;
  name: string;
  description: string;
  prompt?: string;
  enabled: boolean;
}

export interface GeneratedContent {
  platformId: string;
  platformName: string;
  content: string;
  title?: string;
  tags?: string[];
  versions?: ContentVersion[];
  metadata?: ContentMetadata;
}

export interface ContentVersion {
  id: string;
  content: string;
  title?: string;
  tags?: string[];
  createdAt: string;
  isSelected?: boolean;
}

export interface ContentMetadata {
  characterCount: number;
  wordCount: number;
  generatedAt: string;
  modelUsed: string;
  promptUsed?: string;
}

// ========================================================================================
// AI模型相关类型
// ========================================================================================

export interface AIModel {
  id: string;
  name: string;
  provider: string;
  description?: string;
  maxTokens?: number;
  costPer1k?: number;
  enabled: boolean;
  features?: string[];
}

export interface GenerationRequest {
  content: string;
  platforms: string[];
  contentForm?: string;
  contentScheme?: string;
  aiModel: string;
  customPrompt?: string;
  brandLibraryEnabled?: boolean;
  platformSettings?: Record<string, PlatformSettings>;
}

export interface GenerationResponse {
  success: boolean;
  results: GeneratedContent[];
  error?: string;
  usage?: {
    tokensUsed: number;
    cost: number;
    model: string;
  };
}

// ========================================================================================
// 转发相关类型
// ========================================================================================

export interface ForwardingOptions {
  mode: 'manual' | 'api' | 'automation';
  platforms: string[];
  batchMode?: boolean;
  confirmEach?: boolean;
  delayBetween?: number;
}

export interface ForwardingResult {
  platformId: string;
  platformName: string;
  success: boolean;
  url?: string;
  error?: string;
  method: 'manual' | 'api' | 'automation';
  timestamp: number;
  retryCount: number;
}

export interface BatchForwardingProgress {
  total: number;
  completed: number;
  current?: string;
  status: 'idle' | 'running' | 'paused' | 'completed' | 'error' | 'cancelled';
  results: ForwardingResult[];
  startTime?: number;
  endTime?: number;
}

// ========================================================================================
// API相关类型
// ========================================================================================

export interface PlatformApiConfig {
  platformId: string;
  platformName: string;
  apiKey?: string;
  accessToken?: string;
  userId?: string;
  isAuthorized: boolean;
  lastUpdated?: string;
}

export interface ApiPublishRequest {
  platformId: string;
  content: string;
  title?: string;
  tags?: string[];
  config: PlatformApiConfig;
}

export interface ApiPublishResponse {
  success: boolean;
  publishUrl?: string;
  postId?: string;
  error?: string;
}

// ========================================================================================
// 状态管理类型
// ========================================================================================

export interface AdaptPageState {
  // 输入状态
  inputContent: string;
  selectedPlatforms: string[];
  selectedContentForm: string;
  selectedContentScheme: string;
  selectedAIModel: string;
  customPrompt: string;
  brandLibraryEnabled: boolean;
  
  // 平台设置
  platformSettings: Record<string, PlatformSettings>;
  
  // 生成状态
  isGenerating: boolean;
  generationProgress: number;
  results: GeneratedContent[];
  
  // 转发状态
  forwardingOptions: ForwardingOptions;
  forwardingProgress: BatchForwardingProgress;
  isForwarding: boolean;
  
  // UI状态
  expandedPlatforms: Set<string>;
  showAdvancedSettings: boolean;
  activeTab: string;
  
  // 历史记录
  shareHistory: ShareHistoryItem[];
}

export interface ShareHistoryItem {
  id: string;
  platformId: string;
  platformName: string;
  content: string;
  title?: string;
  tags?: string[];
  time: string;
  success?: boolean;
  url?: string;
}

// ========================================================================================
// 事件类型
// ========================================================================================

export interface AdaptPageEvents {
  onContentChange: (content: string) => void;
  onPlatformToggle: (platformId: string, enabled: boolean) => void;
  onPlatformSettingsChange: (platformId: string, settings: PlatformSettings) => void;
  onContentFormChange: (formId: string) => void;
  onContentSchemeChange: (schemeId: string) => void;
  onAIModelChange: (modelId: string) => void;
  onCustomPromptChange: (prompt: string) => void;
  onBrandLibraryToggle: (enabled: boolean) => void;
  onGenerate: (request: GenerationRequest) => void;
  onRegenerate: (platformId: string) => void;
  onForward: (platformId: string, options?: ForwardingOptions) => void;
  onBatchForward: (platforms: string[], options?: ForwardingOptions) => void;
  onForwardingCancel: () => void;
}

// ========================================================================================
// 组件Props类型
// ========================================================================================

export interface BaseComponentProps {
  className?: string;
  children?: React.ReactNode;
}

export interface AdaptPageProviderProps extends BaseComponentProps {
  initialState?: Partial<AdaptPageState>;
}

// ========================================================================================
// 工具类型
// ========================================================================================

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

export type OptionalFields<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
