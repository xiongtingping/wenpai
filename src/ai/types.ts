/**
 * AI 系统类型定义
 */

/**
 * AI提供商接口
 */
export interface AIProviderInterface {
  generateText(prompt: string, options?: any): Promise<string>;
  generateImage(params: { prompt: string; model?: string; size?: string; n?: number; quality?: string }): Promise<{ success: boolean; images: string[]; model: string; error?: string }>;
  isAvailable(): boolean;
}

/**
 * Prompt 模板函数类型
 */
export type PromptTemplate = (input: any, options?: any) => string;

/**
 * 标题生成相关类型
 */
export interface TitleGenerationInput {
  content: string;
  versions?: ContentVersion[];
  platform?: string;
  stylePreference?: string[];
  outputCount?: number;
  ensureDiversity?: boolean;
}

export interface ContentVersion {
  id: string;
  content: string;
  style: 'standard' | 'creative';
  title: string;
  charCount: number;
}

export interface TitleAnalysis {
  coreObjects: string[];
  userBenefits: string[];
  useScenarios: string[];
  mainTheme: string;
}

export interface GeneratedTitleData {
  title: string;
  style: string;
  length: number;
  semanticFit: number;
  reasoning: string;
  // 新增评分维度属性 - 修复 TypeScript 编译错误
  structuralDiversity?: number;      // 结构多样性评分 (15%)
  characterUtilization?: number;    // 字符利用率评分 (5%)
  emotionalAppeal?: number;         // 情绪吸引力评分 (20%)
  semanticCompleteness?: number;    // 语义完整性评分 (10%)
}

export interface TitleGenerationResponse {
  contentAnalysis: TitleAnalysis;
  titles: GeneratedTitleData[];
}

export interface TitleQualityCheck {
  overallScore: number;
  dimensions: {
    semanticFit: number;
    emotionalAttraction: number;
    structuralIntegrity: number;
    characterUtilization: number;
  };
  issues: string[];
  suggestions: string[];
  isQualified: boolean;
  reasoning: string;
}

/**
 * 品牌相关类型
 */
export interface BrandProfile {
  brandName?: string;
  coreValues?: string[];
  targetAudience?: {
    primary?: string;
  };
  brandPersonality?: {
    tone?: string;
  };
  communicationGuidelines?: {
    doUse?: string[];
    dontUse?: string[];
  };
}

export interface BrandAnalysisInput {
  brandInfo: string;
  analysisType?: string;
}

export interface BrandContentCheckInput {
  content: string;
  brandProfile?: BrandProfile;
  checkType?: string;
}

export interface BrandToneInput {
  brandProfile?: BrandProfile;
  contentType: string;
  occasion: string;
}
