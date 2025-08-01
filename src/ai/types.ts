/**
 * AI 系统类型定义
 */

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
