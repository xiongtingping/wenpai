import { BrandAnalysisResult, ContentCheckResult } from '@/types/brand';

/**
 * AI 分析服务
 * @description 处理品牌资料的 AI 分析，使用 GPT-4 模型
 */
class AIAnalysisService {
  private static instance: AIAnalysisService;
  private apiEndpoint: string;
  private apiKey: string;

  private constructor() {
    this.apiEndpoint = import.meta.env.VITE_AI_API_ENDPOINT || '';
    this.apiKey = import.meta.env.VITE_AI_API_KEY || '';
  }

  /**
   * 获取服务实例（单例模式）
   */
  public static getInstance(): AIAnalysisService {
    if (!AIAnalysisService.instance) {
      AIAnalysisService.instance = new AIAnalysisService();
    }
    return AIAnalysisService.instance;
  }

  /**
   * 分析品牌资料
   * @param content 要分析的内容
   */
  public async analyzeBrandContent(content: string): Promise<BrandAnalysisResult> {
    const prompt = `
作为一名品牌策略专家，请分析以下品牌资料，提取关键信息：

${content}

请提供以下分析结果：
1. 品牌关键词（最多5个）
2. 品牌语气特征
3. 内容建议

请按照以下 JSON 格式返回：
{
  "keywords": ["关键词1", "关键词2", ...],
  "tone": "语气特征描述",
  "suggestions": ["建议1", "建议2", ...]
}
`;

    try {
      const response = await fetch(this.apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-4',
          messages: [
            {
              role: 'system',
              content: '你是一名专业的品牌策略分析专家，擅长提取品牌特征和调性。'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.7,
          max_tokens: 1000
        })
      });

      if (!response.ok) {
        throw new Error('AI 服务请求失败');
      }

      const data = await response.json();
      const result = JSON.parse(data.choices[0].message.content);

      return {
        keywords: result.keywords,
        tone: result.tone,
        suggestions: result.suggestions
      };
    } catch (error) {
      console.error('AI 分析失败:', error);
      throw new Error('品牌资料分析失败');
    }
  }

  /**
   * 分析多个文件内容
   * @param files 文件列表
   */
  public async analyzeFiles(files: File[]): Promise<BrandAnalysisResult> {
    try {
      const contents: string[] = [];

      // 读取所有文件内容
      for (const file of files) {
        if (file.type.includes('text') || file.type.includes('pdf') || 
            file.type.includes('doc') || file.type.includes('markdown')) {
          const content = await this.readFileContent(file);
          contents.push(content);
        }
      }

      // 合并所有内容进行分析
      const combinedContent = contents.join('\n\n');
      return await this.analyzeBrandContent(combinedContent);
    } catch (error) {
      console.error('文件分析失败:', error);
      throw new Error('文件分析失败');
    }
  }

  /**
   * 检查内容是否符合品牌调性
   * @param content 要检查的内容
   * @param brandProfile 品牌档案
   */
  public async checkContent(content: string, brandProfile: any): Promise<ContentCheckResult> {
    const prompt = `
作为品牌语气检查专家，请分析以下内容是否符合品牌调性要求：

内容：
${content}

品牌要求：
- 品牌名称：${brandProfile.name}
- 目标语气：${brandProfile.tone}
- 关键词：${brandProfile.keywords.join('、')}
- 禁用词：${brandProfile.forbiddenWords.join('、')}

请检查以下方面：
1. 是否使用了禁用词
2. 语气是否符合品牌调性
3. 是否合理使用了品牌关键词
4. 内容是否积极正面

请按照以下 JSON 格式返回：
{
  "isValid": true/false,
  "issues": ["问题1", "问题2", ...],
  "suggestions": ["建议1", "建议2", ...]
}
`;

    try {
      const response = await fetch(this.apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-4',
          messages: [
            {
              role: 'system',
              content: '你是一名专业的品牌语气检查专家，擅长评估内容是否符合品牌调性。'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.7,
          max_tokens: 1000
        })
      });

      if (!response.ok) {
        throw new Error('AI 服务请求失败');
      }

      const data = await response.json();
      return JSON.parse(data.choices[0].message.content);
    } catch (error) {
      console.error('内容检查失败:', error);
      throw new Error('内容检查失败');
    }
  }

  /**
   * 读取文件内容
   * @param file 文件对象
   */
  private async readFileContent(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        resolve(e.target?.result as string);
      };
      
      reader.onerror = (e) => {
        reject(new Error('文件读取失败'));
      };

      if (file.type.includes('text') || file.type.includes('markdown')) {
        reader.readAsText(file);
      } else {
        // TODO: 处理 PDF 和 Word 文件
        // 这里需要添加相应的文件处理库
        reject(new Error('暂不支持该文件类型'));
      }
    });
  }
}

export default AIAnalysisService; 