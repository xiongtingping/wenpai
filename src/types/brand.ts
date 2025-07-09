/**
 * 品牌档案接口
 * @description 定义品牌调性和相关资料的数据结构
 */
export interface BrandProfile {
  id: string;
  name: string;
  tone: string;
  slogans: string[];
  keywords: string[];
  forbiddenWords: string[];
  files: string[];
  description?: string;
  createdAt: Date;
  updatedAt: Date;
  
  // AI 分析结果
  aiAnalysis?: {
    toneAnalysis: string;
    keyThemes: string[];
    brandPersonality: string;
    targetAudience: string;
    contentSuggestions: string[];
  };
}

/**
 * 品牌资料类型
 */
export type BrandAssetType = 'logo' | 'document' | 'image' | 'slogan' | 'value';

/**
 * 品牌资料接口
 */
export interface BrandAsset {
  id: string;
  name: string;
  type: BrandAssetType;
  content: string;
  uploadDate: Date;
  fileUrl?: string;
  size?: string;
  fileIcon?: JSX.Element;
  description?: string;
  category?: string;
  extractedKeywords?: string[];
  processingStatus?: 'pending' | 'processing' | 'completed' | 'failed';
}

/**
 * 品牌调性分析结果
 */
export interface BrandAnalysisResult {
  keywords: string[];
  tone: string;
  suggestions: string[];
}

/**
 * 内容检查结果
 */
export interface ContentCheckResult {
  isValid: boolean;
  issues: string[];
  suggestions: string[];
} 