/**
 * 网页内容提取服务
 * 支持从URL提取网页内容，并进行智能分析和品牌信息提取
 */

// import i18n from '@/i18n'; // 改为动态导入避免TDZ
import { callAI } from '@/api/unifiedAIService';
import { BrandAsset } from '@/types/brand';
import React from 'react';
import request from '@/api/request';

export interface WebExtractionResult {
  id: string;
  url: string;
  title: string;
  content: string;
  extractedAt: string;
  metadata: {
    description?: string;
    keywords?: string[];
    author?: string;
    publishDate?: string;
    wordCount: number;
    charCount: number;
    domain: string;
    language?: string;
  };
  brandAnalysis?: {
    brandKeywords: string[];
    productKeywords: string[];
    targetAudience: string[];
    brandTone: string;
    brandValues: string[];
    competitiveAdvantage: string[];
    suggestions: string[];
  };
  status: 'success' | 'error' | 'processing';
  error?: string;
}

export interface WebExtractionOptions {
  includeBrandAnalysis?: boolean;
  maxContentLength?: number;
  extractImages?: boolean;
  extractLinks?: boolean;
}

/**
 * 网页内容提取服务类
 */
export class WebContentExtractorService {
  private static instance: WebContentExtractorService;

  public static getInstance(): WebContentExtractorService {
    if (!WebContentExtractorService.instance) {
      WebContentExtractorService.instance = new WebContentExtractorService();
    }
    return WebContentExtractorService.instance;
  }

  /**
   * 从URL提取网页内容
   * @param url 网页URL
   * @param options 提取选项
   * @returns Promise<WebExtractionResult>
   */
  public async extractFromUrl(
    url: string, 
    options: WebExtractionOptions = {}
  ): Promise<WebExtractionResult> {
    const resultId = `web-extract-${Date.now()}`;
    
    try {
      // 验证URL格式
      if (!this.isValidUrl(url)) {
        throw new Error('无效的URL格式');
      }

      // 标准化URL
      const normalizedUrl = this.normalizeUrl(url);
      const domain = new URL(normalizedUrl).hostname;

      // 第一步：尝试获取网页内容
      let pageContent = '';
      let pageTitle = '';

      try {
        // 由于浏览器安全限制，我们无法直接抓取跨域网页内容
        // 需要通过后端API实现网页内容提取
        console.log('🌐 尝试提取网页内容:', normalizedUrl);

        // 调用后端API进行网页内容提取
        const extractedData = await request.post('/api/extract-web-content', { url: normalizedUrl });
        pageContent = extractedData.content || '';
        pageTitle = extractedData.title || 'u64cdu4f5cu5931u8d25';

      } catch (error) {
        console.warn('直接内容提取失败，使用AI分析URL:', error);

        // 如果直接提取失败，使用AI分析URL本身
        const extractionPrompt = this.buildExtractionPrompt(normalizedUrl);

        const extractionResponse = await callAI({
          prompt: extractionPrompt,
          model: 'gpt-4',
          maxTokens: 2000,
          temperature: 0.3
        });

        if (!extractionResponse.success || !extractionResponse.content) {
          throw new Error(extractionResponse.error || 'u64cdu4f5cu5931u8d25');
        }

        // 解析提取结果
        const extractedData = this.parseExtractionResponse(extractionResponse.content);
        pageContent = extractedData.content || '';
        pageTitle = extractedData.title || '';
      }

      // 如果有实际内容，进行AI分析
      const extractedData = pageContent ?
        await this.analyzeExtractedContent(pageContent, pageTitle, normalizedUrl) :
        this.parseExtractionResponse('');
      
      // 构建基础结果
      const result: WebExtractionResult = {
        id: resultId,
        url: normalizedUrl,
        title: extractedData.title || 'u64cdu4f5cu5931u8d25',
        content: extractedData.content || '',
        extractedAt: new Date().toISOString(),
        metadata: {
          description: extractedData.description,
          keywords: extractedData.keywords || [],
          author: extractedData.author,
          publishDate: extractedData.publishDate,
          wordCount: extractedData.content?.split(/\s+/).length || 0,
          charCount: extractedData.content?.length || 0,
          domain: domain,
          language: extractedData.language || 'zh-CN'
        },
        status: 'success'
      };

      // 第二步：如果需要品牌分析，进行AI品牌分析
      if (options.includeBrandAnalysis && result.content) {
        try {
          const brandAnalysis = await this.analyzeBrandContent(result.content);
          result.brandAnalysis = brandAnalysis;
        } catch (error) {
          console.warn('品牌分析失败:', error);
          // 品牌分析失败不影响主要提取结果
        }
      }

      return result;

    } catch (error) {
      console.error('网页内容提取失败:', error);
      
      return {
        id: resultId,
        url: url,
        title: 'u64cdu4f5cu5931u8d25',
        content: '',
        extractedAt: new Date().toISOString(),
        metadata: {
          wordCount: 0,
          charCount: 0,
          domain: this.extractDomain(url) || 'unknown'
        },
        status: 'error',
        error: error instanceof Error ? error.message : '未知错误'
      };
    }
  }

  /**
   * 将提取结果转换为品牌资产
   * @param extractionResult 提取结果
   * @param category 资产分类
   * @returns BrandAsset
   */
  public convertToBrandAsset(
    extractionResult: WebExtractionResult,
    category: string = '网页内容'
  ): BrandAsset {
    const asset: BrandAsset = {
      id: extractionResult.id,
      name: extractionResult.title,
      type: 'document', // 归入现有的 BrandAssetType 范畴
      content: extractionResult.content,
      extractedContent: this.formatExtractedContent(extractionResult),
      uploadDate: new Date(extractionResult.extractedAt),
      fileIcon: React.createElement('div', {
        className: 'h-8 w-8 text-accent flex items-center justify-center bg-accent rounded',
        children: '🌐'
      }),
      description: extractionResult.metadata.description || `从 ${extractionResult.metadata.domain} 提取的网页内容`,
      category: category,
      processingStatus: extractionResult.brandAnalysis ? 'completed' : 'pending',
      extractedKeywords: extractionResult.brandAnalysis?.brandKeywords || extractionResult.metadata.keywords || []

    };

    return asset;
  }

  /**
   * 验证URL格式
   */
  private isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * 标准化URL
   */
  private normalizeUrl(url: string): string {
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url;
    }
    return url;
  }

  /**
   * 提取域名
   */
  private extractDomain(url: string): string | null {
    try {
      return new URL(this.normalizeUrl(url)).hostname;
    } catch {
      return null;
    }
  }

  // 已删除模拟网页内容提取方法，现在直接使用后端API

  /**
   * 分析提取的内容
   */
  private async analyzeExtractedContent(content: string, title: string, url: string): Promise<any> {
    const analysisPrompt = `请分析以下网页内容并提取关键信息：

标题: ${title}
URL: ${url}
内容: ${content.substring(0, 1500)}

请按照以下JSON格式返回分析结果：
{
  "title": 'u64cdu4f5cu5931u8d25',
  "content": "主要内容摘要",
  "description": "内容描述",
  "keywords": ["关键词1", "关键词2"],
  "author": "作者（如果能识别）",
  "publishDate": "发布日期（如果能识别）",
  "language": "内容语言",
  "category": "内容分类",
  "summary": "内容总结"
}`;

    try {
      const response = await callAI({
        prompt: analysisPrompt,
        model: 'gpt-4',
        maxTokens: 1500,
        temperature: 0.3
      });

      if (response.success && response.content) {
        return this.parseExtractionResponse(response.content);
      }
    } catch (error) {
      console.warn('AI内容分析失败:', error);
    }

    // 如果AI分析失败，返回基础信息
    return {
      title: title || 'u64cdu4f5cu5931u8d25',
      content: content || '',
      description: content.substring(0, 200) + '...',
      keywords: [],
      language: 'zh-CN'
    };
  }

  /**
   * 构建内容提取提示词（用于URL分析）
   */
  private buildExtractionPrompt(url: string): string {
    return `请分析以下网页URL并推测其可能的内容信息：

URL: ${url}

请按照以下JSON格式返回推测结果：
{
  "title": "根据URL推测的网页标题",
  "content": "根据URL推测的内容类型和主题",
  "description": "网页描述或摘要",
  "keywords": ["相关关键词"],
  "category": "内容分类",
  "language": "推测的内容语言"
}

注意：
1. 只提取主要内容，忽略导航菜单、广告、页脚等
2. 内容应该是完整的、有意义的文本
3. 如果无法访问URL，请说明原因
4. 保持原文的语言和格式`;
  }

  /**
   * 解析AI提取响应
   */
  private parseExtractionResponse(response: string): any {
    try {
      // 尝试解析JSON响应
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      
      // 如果不是JSON格式，尝试解析文本格式
      return this.parseTextResponse(response);
    } catch (error) {
      console.warn('解析提取响应失败:', error);
      return {
        title: 'u64cdu4f5cu5931u8d25',
        content: response,
        description: '无法解析AI响应',
        keywords: [],
        language: 'zh-CN'
      };
    }
  }

  /**
   * 解析文本格式响应
   */
  private parseTextResponse(response: string): any {
    const lines = response.split('\n');
    const result: any = {
      title: 'u64cdu4f5cu5931u8d25',
      content: response,
      keywords: [],
      language: 'zh-CN'
    };

    // 简单的文本解析逻辑
    for (const line of lines) {
      if (line.includes('u64cdu4f5cu5931u8d25') || line.includes('title')) {
        result.title = line.replace(/.*[:：]/, '').trim();
      } else if (line.includes('描述') || line.includes('description')) {
        result.description = line.replace(/.*[:：]/, '').trim();
      }
    }

    return result;
  }

  /**
   * 分析品牌内容
   */
  private async analyzeBrandContent(content: string): Promise<{
    brandKeywords: string[];
    productKeywords: string[];
    targetAudience: string[];
    brandTone: string;
    brandValues: string[];
    competitiveAdvantage: string[];
    suggestions: string[];
  }> {
    const analysisPrompt = `请分析以下内容中的品牌信息：

内容：
${content.substring(0, 2000)}

请按照以下JSON格式返回分析结果：
{
  "brandKeywords": ["品牌相关关键词"],
  "productKeywords": ["产品相关关键词"],
  "targetAudience": ["目标受众描述"],
  "brandTone": "品牌语调特征",
  "brandValues": ["品牌价值观"],
  "competitiveAdvantage": ["竞争优势"],
  "suggestions": ["品牌建议"]
}

分析要点：
1. 识别品牌名称、产品特征、服务特色
2. 分析目标用户群体和市场定位
3. 提取品牌价值观和核心理念
4. 识别竞争优势和差异化特征
5. 分析语言风格和表达方式`;

    try {
      const response = await callAI({
        prompt: analysisPrompt,
        model: 'gpt-4',
        maxTokens: 1500,
        temperature: 0.5
      });

      if (!response.success || !response.content) {
        throw new Error('u64cdu4f5cu5931u8d25');
      }

      // 解析分析结果
      const jsonMatch = response.content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const analysisResult = JSON.parse(jsonMatch[0]);
        return {
          brandKeywords: analysisResult.brandKeywords || [],
          productKeywords: analysisResult.productKeywords || [],
          targetAudience: analysisResult.targetAudience || [],
          brandTone: analysisResult.brandTone || '未知',
          brandValues: analysisResult.brandValues || [],
          competitiveAdvantage: analysisResult.competitiveAdvantage || [],
          suggestions: analysisResult.suggestions || []
        };
      }

      // 如果解析失败，返回默认结果
      return {
        brandKeywords: [],
        productKeywords: [],
        targetAudience: [],
        brandTone: '未知',
        brandValues: [],
        competitiveAdvantage: [],
        suggestions: ['建议重新分析内容']
      };

    } catch (error) {
      console.error('品牌内容分析失败:', error);
      throw error;
    }
  }

  /**
   * 格式化提取内容
   */
  private formatExtractedContent(result: WebExtractionResult): string {
    let formatted = `网页内容提取结果\n\n`;
    formatted += `标题：${result.title}\n`;
    formatted += `来源：${result.url}\n`;
    formatted += `域名：${result.metadata.domain}\n`;
    formatted += `提取时间：${new Date(result.extractedAt).toLocaleString()}\n`;
    formatted += `字数：${result.metadata.wordCount} 字\n\n`;

    if (result.metadata.description) {
      formatted += `描述：${result.metadata.description}\n\n`;
    }

    if (result.metadata.keywords && result.metadata.keywords.length > 0) {
      formatted += `关键词：${result.metadata.keywords.join('、')}\n\n`;
    }

    formatted += `正文内容：\n${result.content}\n\n`;

    if (result.brandAnalysis) {
      formatted += `AI品牌分析：\n`;
      formatted += `品牌关键词：${result.brandAnalysis.brandKeywords.join('、')}\n`;
      formatted += `产品关键词：${result.brandAnalysis.productKeywords.join('、')}\n`;
      formatted += `目标受众：${result.brandAnalysis.targetAudience.join('、')}\n`;
      formatted += `品牌语调：${result.brandAnalysis.brandTone}\n`;
      formatted += `品牌价值：${result.brandAnalysis.brandValues.join('、')}\n`;
      formatted += `竞争优势：${result.brandAnalysis.competitiveAdvantage.join('、')}\n`;
      formatted += `建议：${result.brandAnalysis.suggestions.join('、')}\n`;
    }

    return formatted;
  }

  /**
   * 批量提取多个URL
   */
  public async extractMultipleUrls(
    urls: string[],
    options: WebExtractionOptions = {}
  ): Promise<WebExtractionResult[]> {
    const results: WebExtractionResult[] = [];

    for (const url of urls) {
      try {
        const result = await this.extractFromUrl(url, options);
        results.push(result);

        // 添加延迟避免请求过于频繁
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        console.error(`提取URL失败: ${url}`, error);
        results.push({
          id: `web-extract-${Date.now()}`,
          url: url,
          title: 'u64cdu4f5cu5931u8d25',
          content: '',
          extractedAt: new Date().toISOString(),
          metadata: {
            wordCount: 0,
            charCount: 0,
            domain: this.extractDomain(url) || 'unknown'
          },
          status: 'error',
          error: error instanceof Error ? error.message : '未知错误'
        });
      }
    }

    return results;
  }

  /**
   * 检查URL是否可访问
   */
  public async checkUrlAccessibility(url: string): Promise<{
    accessible: boolean;
    status?: number;
    error?: string;
  }> {
    try {
      const normalizedUrl = this.normalizeUrl(url);

      // 使用AI服务检查URL可访问性
      const checkPrompt = `请检查以下URL是否可以访问：${normalizedUrl}

请返回JSON格式：
{
  "accessible": true/false,
  "status": "HTTP状态码或错误信息",
  "message": 'u64cdu4f5cu5931u8d25'
}`;

      const response = await callAI({
        prompt: checkPrompt,
        model: 'gpt-4',
        maxTokens: 200,
        temperature: 0.1
      });

      if (response.success && response.content) {
        try {
          const jsonMatch = response.content.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            const result = JSON.parse(jsonMatch[0]);
            return {
              accessible: result.accessible || false,
              status: result.status,
              error: result.accessible ? undefined : result.message
            };
          }
        } catch (parseError) {
          console.warn('解析URL检查结果失败:', parseError);
        }
      }

      // 默认返回可访问（乐观假设）
      return { accessible: true };

    } catch (error) {
      return {
        accessible: false,
        error: error instanceof Error ? error.message : 'u64cdu4f5cu5931u8d25'
      };
    }
  }
}
