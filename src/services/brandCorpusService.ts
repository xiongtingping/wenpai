/**
 * 品牌语料库服务 - 专门处理品牌语料库的AI提取和管理
 * 
 * 实现推荐流程：
 * 1. 用户上传资料 → AI预处理：清洗+语言识别
 * 2. 信息提取：按语料库维度拆解
 * 3. AI初步填入语料库各字段
 * 4. 关键词建议引擎生成补充项
 * 5. 用户手动编辑确认
 * 6. 内容写入品牌语料库 + 可回溯版本
 */

import { callAI, AITaskType } from '@/api/aiService';
import { getPrompt, PromptType } from '@/prompts/PromptSystem';

/**
 * 品牌语料库数据结构
 */
export interface BrandCorpus {
  id: string;
  brandName: string;
  lastUpdated: Date;
  sources: BrandCorpusSource[];
  
  // 1️⃣ 基础信息
  basicInfo: {
    brandName: {
      value: string;
      sources: SourceReference[];
    };
    brandDescription: {
      value: string;
      sources: SourceReference[];
    };
    englishName?: {
      value: string;
      sources: SourceReference[];
    };
    aliases?: {
      value: string[];
      sources: SourceReference[];
    };
  };
  
  // 2️⃣ 语调风格
  toneStyle: {
    brandTone: {
      value: string[];
      sources: SourceReference[];
      aiSuggestions?: string[];
    };
    brandPersonality: {
      value: string[];
      sources: SourceReference[];
      aiSuggestions?: string[];
    };
  };
  
  // 3️⃣ 品牌身份
  brandIdentity: {
    slogans: {
      value: string[];
      sources: SourceReference[];
      aiSuggestions?: string[];
    };
    values: {
      value: string[];
      sources: SourceReference[];
      aiSuggestions?: string[];
    };
    missionVision: {
      value: string;
      sources: SourceReference[];
    };
    brandStory: {
      value: string;
      sources: SourceReference[];
    };
  };
  
  // 4️⃣ 内容策略
  contentStrategy: {
    adSlogans: {
      value: string[];
      sources: SourceReference[];
      aiSuggestions?: string[];
    };
    productDescriptors: {
      value: string[];
      sources: SourceReference[];
      aiSuggestions?: string[];
    };
    coreTopics: {
      value: string[];
      sources: SourceReference[];
      aiSuggestions?: string[];
    };
    hashtags: {
      value: string[];
      sources: SourceReference[];
      aiSuggestions?: string[];
    };
    keywords: {
      value: string[];
      sources: SourceReference[];
      aiSuggestions?: string[];
    };
    forbiddenWords: {
      value: string[];
      sources: SourceReference[];
    };
  };
}

/**
 * 语料库来源文档
 */
export interface BrandCorpusSource {
  docId: string;
  fileName: string;
  uploadTime: Date;
  content: string;
  processStatus: 'pending' | 'processing' | 'completed' | 'failed';
  extractionResult?: BrandCorpusExtraction;
}

/**
 * 来源引用（重构版 - 支持状态管理）
 */
export interface SourceReference {
  id: string; // 唯一标识
  docId: string;
  fileName: string;
  excerpt: string;
  confidence: number; // 0-1，提取置信度
  value: any; // 提取的具体值
  extractedAt: string;
  status: 'extracted' | 'confirmed' | 'pinned' | 'deleted' | 'blocked';
  source: {
    type: 'ai_extraction' | 'manual_input' | 'imported';
    docId: string;
    fileName: string;
    excerpt: string;
    confidence: number;
  };
}

/**
 * 语料库提取结果（重构版 - 支持独立处理）
 */
export interface BrandCorpusExtraction {
  docId: string;
  fileName: string;
  processedAt: Date;
  languageInfo: {
    primary: string;
    confidence: number;
    mixed: boolean;
  };
  extractedFields: {
    [fieldName: string]: {
      value: any;
      excerpt: string;
      confidence: number;
      docId: string;
      fileName: string;
      extractedAt: string;
      status: 'extracted' | 'confirmed' | 'pinned' | 'deleted' | 'blocked';
      source: {
        type: 'ai_extraction' | 'manual_input' | 'imported';
        docId: string;
        fileName: string;
        excerpt: string;
        confidence: number;
      };
    };
  };
  aiSuggestions: {
    [fieldName: string]: string[];
  };
  status: 'pending_user_confirmation' | 'confirmed' | 'merged';
}

/**
 * 品牌语料库服务类
 */
export class BrandCorpusService {
  private static instance: BrandCorpusService;
  
  public static getInstance(): BrandCorpusService {
    if (!BrandCorpusService.instance) {
      BrandCorpusService.instance = new BrandCorpusService();
    }
    return BrandCorpusService.instance;
  }

  /**
   * 🎯 核心方法：处理单个文档的语料库提取（按推荐流程重构）
   *
   * 流程：A[用户上传资料] → B[AI预处理：清洗+语言识别] → C[信息提取：按语料库维度拆解]
   *      → D[AI初步填入语料库各字段] → E[关键词建议引擎生成补充项] → F[用户手动编辑确认]
   *      → G[内容写入品牌语料库 + 可回溯版本]
   */
  public async processDocument(
    docId: string,
    fileName: string,
    content: string
  ): Promise<BrandCorpusExtraction> {
    console.log(`🔍 开始处理文档: ${fileName} (${docId})`);

    try {
      // A → B: AI预处理：清洗+语言识别
      console.log(`📝 步骤B: AI预处理 - ${fileName}`);
      const cleanedContent = this.preprocessContent(content);
      const languageInfo = this.detectLanguage(cleanedContent);

      // B → C: 信息提取：按语料库维度拆解
      console.log(`🔍 步骤C: 信息提取 - ${fileName}`);
      const extractionResult = await this.extractBrandCorpusFields(docId, cleanedContent, languageInfo);

      // C → D: AI初步填入语料库各字段
      console.log(`📊 步骤D: 初步填入字段 - ${fileName}`);
      const structuredFields = this.structureExtractedFields(extractionResult, docId, fileName);

      // D → E: 关键词建议引擎生成补充项
      console.log(`💡 步骤E: 生成建议补充 - ${fileName}`);
      const aiSuggestions = await this.generateAISuggestions(structuredFields);

      // 准备返回结果，等待F[用户手动编辑确认] → G[写入语料库]
      return {
        docId,
        fileName,
        processedAt: new Date(),
        extractedFields: structuredFields,
        aiSuggestions,
        languageInfo,
        status: 'pending_user_confirmation' // 等待用户确认
      };

    } catch (error) {
      console.error(`❌ 文档处理失败 ${fileName}:`, error);
      throw error;
    }
  }

  /**
   * 🧹 内容预处理：清洗+语言识别
   */
  private preprocessContent(content: string): string {
    // 清理HTML标签
    let cleaned = content.replace(/<[^>]*>/g, '');

    // 清理多余空白
    cleaned = cleaned.replace(/\s+/g, ' ').trim();

    // 清理特殊字符
    cleaned = cleaned.replace(/[^\u4e00-\u9fa5\u0041-\u005a\u0061-\u007a0-9\s\.,;:!?()""'']/g, '');

    return cleaned;
  }

  /**
   * 🌐 语言识别
   */
  private detectLanguage(content: string): { primary: string; confidence: number; mixed: boolean } {
    const chineseChars = (content.match(/[\u4e00-\u9fa5]/g) || []).length;
    const englishChars = (content.match(/[a-zA-Z]/g) || []).length;
    const totalChars = chineseChars + englishChars;

    if (totalChars === 0) {
      return { primary: 'unknown', confidence: 0, mixed: false };
    }

    const chineseRatio = chineseChars / totalChars;
    const englishRatio = englishChars / totalChars;

    if (chineseRatio > 0.6) {
      return { primary: 'zh-CN', confidence: chineseRatio, mixed: englishRatio > 0.2 };
    } else if (englishRatio > 0.6) {
      return { primary: 'en', confidence: englishRatio, mixed: chineseRatio > 0.2 };
    } else {
      return { primary: 'mixed', confidence: Math.max(chineseRatio, englishRatio), mixed: true };
    }
  }

  /**
   * 📊 结构化提取字段
   */
  private structureExtractedFields(
    extractionResult: { [fieldName: string]: { value: any; excerpt: string; confidence: number } },
    docId: string,
    fileName: string
  ): { [fieldName: string]: { value: any; excerpt: string; confidence: number; docId: string; fileName: string; status: string } } {
    const structured: { [fieldName: string]: any } = {};

    Object.keys(extractionResult).forEach(fieldName => {
      const field = extractionResult[fieldName];
      structured[fieldName] = {
        ...field,
        docId,
        fileName,
        extractedAt: new Date().toISOString(),
        status: 'extracted', // extracted | confirmed | pinned | deleted | blocked
        source: {
          type: 'ai_extraction',
          docId,
          fileName,
          excerpt: field.excerpt,
          confidence: field.confidence
        }
      };
    });

    return structured;
  }

  /**
   * 📊 按语料库维度提取信息（使用明确提取规则）
   */
  private async extractBrandCorpusFields(
    docId: string,
    content: string,
    languageInfo: { primary: string; confidence: number; mixed: boolean }
  ): Promise<{ [fieldName: string]: { value: any; excerpt: string; confidence: number } }> {

    // 🎯 使用统一提示词系统的品牌语料库提取，注入语言信息
    const promptData = getPrompt(PromptType.BRAND_CORPUS_EXTRACTION, {
      brandContent: content,
      docId: docId,
      fileName: `document-${docId}`,
      language: languageInfo.primary,
      isMultilingual: languageInfo.mixed
    });

    const result = await callAI({
      prompt: promptData.userPrompt,
      taskType: AITaskType.BRAND_ANALYSIS,
      systemPrompt: promptData.systemPrompt,
      context: {
        docId,
        extractionType: 'brand-corpus',
        language: languageInfo.primary,
        version: '2.0.0'
      }
    });

    // 解析AI返回的结构化数据
    return this.parseExtractionResult(result.content, docId);
  }

  /**
   * 📋 字段特定提取规则映射
   */
  private getFieldExtractionRules(): { [fieldName: string]: string } {
    return {
      'brandName': '请从资料中提取品牌的正式名称、商标名称',
      'englishName': '请提取品牌的英文名称、英文商标',
      'aliases': '请提取品牌的简称、别名、昵称',
      'brandDescription': '请提取品牌的定位描述、业务介绍、核心价值主张',
      'brandTone': '请分析文案中的语气风格，如亲切/权威/年轻/理性/温暖/专业',
      'brandPersonality': '请分析品牌展现的人格特征，如专家型/伙伴型/引领者/创新者',
      'slogans': '请从资料中提取品牌主张、座右铭、标语、口号',
      'values': '请提取品牌价值观、核心理念、行为准则',
      'missionVision': '请提取品牌使命、愿景、目标',
      'brandStory': '识别包含品牌创立、成长、转变的叙述段落',
      'adSlogans': '请提取广告语、推广语、营销口号',
      'productDescriptors': '请提取产品描述中的关键词、特色词汇',
      'coreTopics': '请提取品牌经常提及的核心话题、关注领域',
      'hashtags': '请提取或生成适合的社交媒体标签',
      'keywords': '请提取5-15个品牌核心关键词',
      'forbiddenWords': '请提取明确提及的禁用词汇、避免使用的表达'
    };
  }



  /**
   * 🔍 解析AI提取结果
   */
  private parseExtractionResult(
    aiResponse: string, 
    docId: string
  ): { [fieldName: string]: { value: any; excerpt: string; confidence: number } } {
    try {
      // 尝试解析JSON
      const parsed = JSON.parse(aiResponse);
      
      // 为每个字段添加docId信息
      Object.keys(parsed).forEach(key => {
        if (parsed[key] && typeof parsed[key] === 'object') {
          parsed[key].docId = docId;
        }
      });
      
      return parsed;
    } catch (error) {
      console.error('AI提取结果解析失败:', error);
      
      // 返回默认结构
      return {
        brandName: {
          value: '未识别',
          excerpt: '解析失败',
          confidence: 0.1
        }
      };
    }
  }

  /**
   * 💡 生成AI建议
   */
  private async generateAISuggestions(
    extractedFields: { [fieldName: string]: { value: any; excerpt: string; confidence: number } }
  ): Promise<{ [fieldName: string]: string[] }> {
    
    const suggestions: { [fieldName: string]: string[] } = {};
    
    // 为每个字段生成AI建议
    const fieldSuggestions = {
      brandTone: ['温暖', '专业', '创新', '可靠', '年轻'],
      brandPersonality: ['专家型', '伙伴型', '引领者', '创新者', '守护者'],
      keywords: ['品质', '创新', '服务', '专业', '可靠'],
      coreTopics: ['产品创新', '用户体验', '品质生活', '技术领先', '服务优质'],
      hashtags: ['#品牌力量', '#创新驱动', '#品质生活', '#用户至上', '#专业服务']
    };
    
    Object.keys(fieldSuggestions).forEach(field => {
      if (extractedFields[field] && extractedFields[field].confidence < 0.8) {
        suggestions[field] = fieldSuggestions[field as keyof typeof fieldSuggestions];
      }
    });
    
    return suggestions;
  }

  /**
   * 🔄 批量处理多个文档
   */
  public async processBatchDocuments(
    documents: Array<{ docId: string; fileName: string; content: string }>
  ): Promise<BrandCorpusExtraction[]> {
    console.log(`📦 开始批量处理 ${documents.length} 个文档`);
    
    const results: BrandCorpusExtraction[] = [];
    
    for (let i = 0; i < documents.length; i++) {
      const doc = documents[i];
      try {
        console.log(`📄 处理文档 ${i + 1}/${documents.length}: ${doc.fileName}`);
        const result = await this.processDocument(doc.docId, doc.fileName, doc.content);
        results.push(result);
        
        // 添加延迟避免API频率限制
        if (i < documents.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      } catch (error) {
        console.error(`❌ 文档 ${doc.fileName} 处理失败:`, error);
        // 继续处理其他文档
      }
    }
    
    console.log(`✅ 批量处理完成，成功处理 ${results.length}/${documents.length} 个文档`);
    return results;
  }

  /**
   * 🔀 增量合并提取结果到语料库（重构版 - 不覆盖，只追加）
   */
  public mergeExtractionResults(
    existingCorpus: BrandCorpus | null,
    extractions: BrandCorpusExtraction[]
  ): BrandCorpus {
    // 如果没有现有语料库，创建新的
    if (!existingCorpus) {
      existingCorpus = this.createEmptyCorpus();
    }

    // 增量合并每个提取结果（不覆盖现有内容）
    extractions.forEach(extraction => {
      this.appendExtractionToCorpus(existingCorpus!, extraction);
    });

    existingCorpus.lastUpdated = new Date();
    return existingCorpus;
  }

  /**
   * 📌 字段状态管理方法
   */
  public updateFieldStatus(
    corpus: BrandCorpus,
    fieldPath: string, // 如 'basicInfo.brandName'
    itemId: string,
    newStatus: 'extracted' | 'confirmed' | 'pinned' | 'deleted' | 'blocked'
  ): BrandCorpus {
    const updatedCorpus = { ...corpus };

    // 根据fieldPath找到对应的字段并更新状态
    const pathParts = fieldPath.split('.');
    let currentLevel: any = updatedCorpus;

    // 导航到目标字段
    for (let i = 0; i < pathParts.length - 1; i++) {
      currentLevel = currentLevel[pathParts[i]];
    }

    const finalField = pathParts[pathParts.length - 1];
    if (currentLevel[finalField] && currentLevel[finalField].sources) {
      // 更新特定来源的状态
      currentLevel[finalField].sources = currentLevel[finalField].sources.map((source: any) =>
        source.id === itemId ? { ...source, status: newStatus } : source
      );
    }

    return updatedCorpus;
  }

  /**
   * 🗂️ 获取字段的所有信息项（瀑布流展示用）
   */
  public getFieldItems(
    corpus: BrandCorpus,
    fieldPath: string
  ): Array<{
    id: string;
    value: any;
    excerpt: string;
    confidence: number;
    docId: string;
    fileName: string;
    status: 'extracted' | 'confirmed' | 'pinned' | 'deleted' | 'blocked';
    extractedAt: string;
  }> {
    const pathParts = fieldPath.split('.');
    let currentLevel: any = corpus;

    // 导航到目标字段
    for (const part of pathParts) {
      currentLevel = currentLevel?.[part];
    }

    if (!currentLevel?.sources) {
      return [];
    }

    return currentLevel.sources
      .filter((source: any) => source.status !== 'deleted')
      .sort((a: any, b: any) => {
        // 排序：pinned > confirmed > extracted > blocked
        const statusOrder = { pinned: 0, confirmed: 1, extracted: 2, blocked: 3 };
        return statusOrder[a.status as keyof typeof statusOrder] - statusOrder[b.status as keyof typeof statusOrder];
      });
  }

  /**
   * 🆕 创建空的语料库
   */
  private createEmptyCorpus(): BrandCorpus {
    return {
      id: `corpus-${Date.now()}`,
      brandName: '新品牌',
      lastUpdated: new Date(),
      sources: [],
      basicInfo: {
        brandName: { value: '', sources: [] },
        brandDescription: { value: '', sources: [] }
      },
      toneStyle: {
        brandTone: { value: [], sources: [] },
        brandPersonality: { value: [], sources: [] }
      },
      brandIdentity: {
        slogans: { value: [], sources: [] },
        values: { value: [], sources: [] },
        missionVision: { value: '', sources: [] },
        brandStory: { value: '', sources: [] }
      },
      contentStrategy: {
        adSlogans: { value: [], sources: [] },
        productDescriptors: { value: [], sources: [] },
        coreTopics: { value: [], sources: [] },
        hashtags: { value: [], sources: [] },
        keywords: { value: [], sources: [] },
        forbiddenWords: { value: [], sources: [] }
      }
    };
  }

  /**
   * 📝 将单个提取结果追加到语料库（不覆盖现有内容）
   */
  private appendExtractionToCorpus(corpus: BrandCorpus, extraction: BrandCorpusExtraction): void {
    Object.keys(extraction.extractedFields).forEach(fieldName => {
      const extractedField = extraction.extractedFields[fieldName];

      // 创建来源引用（包含完整信息）
      const sourceRef = {
        id: `${extraction.docId}-${fieldName}-${Date.now()}`,
        docId: extraction.docId,
        fileName: extraction.fileName,
        excerpt: extractedField.excerpt,
        confidence: extractedField.confidence,
        value: extractedField.value,
        extractedAt: extractedField.extractedAt,
        status: extractedField.status,
        source: extractedField.source
      };

      // 根据字段名追加到语料库结构
      this.appendFieldToCorpus(corpus, fieldName, sourceRef);
    });
  }

  /**
   * 📋 将字段信息追加到语料库结构
   */
  private appendFieldToCorpus(
    corpus: BrandCorpus,
    fieldName: string,
    sourceRef: any
  ): void {
    // 根据字段名映射到对应的语料库字段
    switch (fieldName) {
      case 'brandName':
        if (!corpus.basicInfo.brandName.sources) corpus.basicInfo.brandName.sources = [];
        corpus.basicInfo.brandName.sources.push(sourceRef);
        break;
      case 'englishName':
        if (!corpus.basicInfo.englishName) corpus.basicInfo.englishName = { value: '', sources: [] };
        corpus.basicInfo.englishName.sources.push(sourceRef);
        break;
      case 'aliases':
        if (!corpus.basicInfo.aliases) corpus.basicInfo.aliases = { value: [], sources: [] };
        corpus.basicInfo.aliases.sources.push(sourceRef);
        break;
      case 'brandDescription':
        if (!corpus.basicInfo.brandDescription.sources) corpus.basicInfo.brandDescription.sources = [];
        corpus.basicInfo.brandDescription.sources.push(sourceRef);
        break;
      case 'brandTone':
        if (!corpus.toneStyle.brandTone.sources) corpus.toneStyle.brandTone.sources = [];
        corpus.toneStyle.brandTone.sources.push(sourceRef);
        break;
      case 'brandPersonality':
        if (!corpus.toneStyle.brandPersonality.sources) corpus.toneStyle.brandPersonality.sources = [];
        corpus.toneStyle.brandPersonality.sources.push(sourceRef);
        break;
      case 'slogans':
        if (!corpus.brandIdentity.slogans.sources) corpus.brandIdentity.slogans.sources = [];
        corpus.brandIdentity.slogans.sources.push(sourceRef);
        break;
      case 'values':
        if (!corpus.brandIdentity.values.sources) corpus.brandIdentity.values.sources = [];
        corpus.brandIdentity.values.sources.push(sourceRef);
        break;
      case 'missionVision':
        if (!corpus.brandIdentity.missionVision.sources) corpus.brandIdentity.missionVision.sources = [];
        corpus.brandIdentity.missionVision.sources.push(sourceRef);
        break;
      case 'brandStory':
        if (!corpus.brandIdentity.brandStory.sources) corpus.brandIdentity.brandStory.sources = [];
        corpus.brandIdentity.brandStory.sources.push(sourceRef);
        break;
      case 'adSlogans':
        if (!corpus.contentStrategy.adSlogans.sources) corpus.contentStrategy.adSlogans.sources = [];
        corpus.contentStrategy.adSlogans.sources.push(sourceRef);
        break;
      case 'productDescriptors':
        if (!corpus.contentStrategy.productDescriptors.sources) corpus.contentStrategy.productDescriptors.sources = [];
        corpus.contentStrategy.productDescriptors.sources.push(sourceRef);
        break;
      case 'coreTopics':
        if (!corpus.contentStrategy.coreTopics.sources) corpus.contentStrategy.coreTopics.sources = [];
        corpus.contentStrategy.coreTopics.sources.push(sourceRef);
        break;
      case 'hashtags':
        if (!corpus.contentStrategy.hashtags.sources) corpus.contentStrategy.hashtags.sources = [];
        corpus.contentStrategy.hashtags.sources.push(sourceRef);
        break;
      case 'keywords':
        if (!corpus.contentStrategy.keywords.sources) corpus.contentStrategy.keywords.sources = [];
        corpus.contentStrategy.keywords.sources.push(sourceRef);
        break;
      case 'forbiddenWords':
        if (!corpus.contentStrategy.forbiddenWords.sources) corpus.contentStrategy.forbiddenWords.sources = [];
        corpus.contentStrategy.forbiddenWords.sources.push(sourceRef);
        break;
    }
  }

  /**
   * 🔄 智能冲突解决方法
   */
  public async resolveCorpusConflicts(
    brandName: string,
    conflictingFields: Array<{
      fieldName: string;
      sources: Array<{
        docId: string;
        value: any;
        excerpt: string;
        confidence: number;
      }>;
    }>
  ): Promise<{ [fieldName: string]: any }> {

    // 🎯 使用统一提示词系统的冲突解决
    const promptData = getPrompt(PromptType.BRAND_CORPUS_CONFLICT_RESOLUTION, {
      brandName,
      conflictingFields: conflictingFields.map(field => ({
        fieldName: field.fieldName,
        source1: field.sources[0],
        source2: field.sources[1],
        source3: field.sources[2] || null
      }))
    });

    const result = await callAI({
      prompt: promptData.userPrompt,
      taskType: AITaskType.BRAND_ANALYSIS,
      systemPrompt: promptData.systemPrompt,
      context: {
        brandName,
        conflictCount: conflictingFields.length,
        resolutionType: 'corpus-conflict',
        version: '1.0.0'
      }
    });

    try {
      const resolution = JSON.parse(result.content);
      return resolution.conflictResolution || {};
    } catch (error) {
      console.error('冲突解决结果解析失败:', error);
      return {};
    }
  }

  /**
   * 🗺️ 将字段映射到语料库结构
   */
  private mapFieldToCorpus(
    corpus: BrandCorpus, 
    fieldName: string, 
    value: any, 
    sourceRef: SourceReference
  ): void {
    // 根据字段名映射到对应的语料库字段
    switch (fieldName) {
      case 'brandName':
        if (value && sourceRef.confidence > 0.7) {
          corpus.basicInfo.brandName.value = value;
          corpus.basicInfo.brandName.sources = [sourceRef];
        }
        break;
      case 'brandDescription':
        if (value && sourceRef.confidence > 0.6) {
          corpus.basicInfo.brandDescription.value = value;
          corpus.basicInfo.brandDescription.sources = [sourceRef];
        }
        break;
      case 'brandTone':
        if (Array.isArray(value) && value.length > 0) {
          corpus.toneStyle.brandTone.value = [...new Set([...corpus.toneStyle.brandTone.value, ...value])];
          corpus.toneStyle.brandTone.sources.push(sourceRef);
        }
        break;
      case 'keywords':
        if (Array.isArray(value) && value.length > 0) {
          corpus.contentStrategy.keywords.value = [...new Set([...corpus.contentStrategy.keywords.value, ...value])];
          corpus.contentStrategy.keywords.sources.push(sourceRef);
        }
        break;
      // 添加更多字段映射...
    }
  }
}

export default BrandCorpusService;
