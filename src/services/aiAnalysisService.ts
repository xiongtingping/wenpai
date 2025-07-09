import { BrandAnalysisResult, ContentCheckResult } from '@/types/brand';
// PDF 解析依赖
import * as pdfjsLib from 'pdfjs-dist';
// Word 文档解析
import mammoth from 'mammoth';
// Excel 解析
import * as XLSX from 'xlsx';
// 图片 OCR
import Tesseract from 'tesseract.js';

// 配置 PDF.js worker - 使用主线程处理，避免CORS问题
if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = '';
}

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
   * 获取支持的文件类型
   */
  public getSupportedFileTypes(): Array<{
    extension: string;
    mimeType: string;
    description: string;
  }> {
    return [
      { extension: '.txt', mimeType: 'text/plain', description: '纯文本文件' },
      { extension: '.md', mimeType: 'text/markdown', description: 'Markdown 文档' },
      { extension: '.csv', mimeType: 'text/csv', description: 'CSV 表格文件' },
      { extension: '.json', mimeType: 'application/json', description: 'JSON 数据文件' },
      { extension: '.pdf', mimeType: 'application/pdf', description: 'PDF 文档' },
      { extension: '.docx', mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', description: 'Word 文档' },
      { extension: '.doc', mimeType: 'application/msword', description: 'Word 文档（旧版）' },
      { extension: '.xlsx', mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', description: 'Excel 表格' },
      { extension: '.xls', mimeType: 'application/vnd.ms-excel', description: 'Excel 表格（旧版）' },
      { extension: '.pptx', mimeType: 'application/vnd.openxmlformats-officedocument.presentationml.presentation', description: 'PowerPoint 演示文稿' },
      { extension: '.ppt', mimeType: 'application/vnd.ms-powerpoint', description: 'PowerPoint 演示文稿（旧版）' },
      { extension: '.jpg', mimeType: 'image/jpeg', description: 'JPEG 图片' },
      { extension: '.jpeg', mimeType: 'image/jpeg', description: 'JPEG 图片' },
      { extension: '.png', mimeType: 'image/png', description: 'PNG 图片' },
      { extension: '.gif', mimeType: 'image/gif', description: 'GIF 图片' },
      { extension: '.bmp', mimeType: 'image/bmp', description: 'BMP 图片' },
      { extension: '.webp', mimeType: 'image/webp', description: 'WebP 图片' }
    ];
  }

  /**
   * 检查文件类型是否支持
   */
  public isFileTypeSupported(file: File): boolean {
    const supportedTypes = this.getSupportedFileTypes();
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    const isMimeTypeSupported = supportedTypes.some(type => 
      file.type === type.mimeType || file.type.includes(type.extension.slice(1))
    );
    const isExtensionSupported = supportedTypes.some(type => 
      fileExtension === type.extension
    );
    return isMimeTypeSupported || isExtensionSupported;
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
        if (this.isFileTypeSupported(file)) {
          const content = await this.readFileContent(file);
          contents.push(content);
        } else {
          console.warn(`不支持的文件类型: ${file.name} (${file.type})`);
        }
      }

      if (contents.length === 0) {
        throw new Error('没有可分析的文件内容');
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
      reader.onload = async (e) => {
        try {
          const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
          
          // 文本文件处理
          if (file.type.includes('text') || file.type.includes('markdown') || 
              fileExtension === '.txt' || fileExtension === '.md' || 
              fileExtension === '.csv' || fileExtension === '.json') {
            resolve(e.target?.result as string);
          } 
          // PDF 文件处理
          else if (file.type.includes('pdf') || fileExtension === '.pdf') {
            try {
              const typedArray = new Uint8Array(e.target?.result as ArrayBuffer);
              const pdf = await pdfjsLib.getDocument({ 
                data: typedArray,
                useWorkerFetch: false,
                isEvalSupported: false,
                useSystemFonts: true
              }).promise;
              let text = '';
              for (let i = 1; i <= pdf.numPages; i++) {
                const page = await pdf.getPage(i);
                const content = await page.getTextContent();
                text += content.items.map((item: any) => item.str).join(' ');
              }
              resolve(text);
            } catch (pdfError) {
              console.warn('PDF解析失败，返回文件名作为内容:', pdfError);
              resolve(`PDF文件: ${file.name} (内容解析失败，请检查文件格式)`);
            }
          } 
          // Word 文档处理
          else if (file.type.includes('word') || fileExtension === '.docx' || fileExtension === '.doc') {
            const arrayBuffer = e.target?.result as ArrayBuffer;
            const result = await mammoth.extractRawText({ arrayBuffer });
            resolve(result.value);
          } 
          // Excel 文件处理
          else if (file.type.includes('excel') || file.type.includes('spreadsheet') || 
                   fileExtension === '.xlsx' || fileExtension === '.xls') {
            const arrayBuffer = e.target?.result as ArrayBuffer;
            const workbook = XLSX.read(arrayBuffer, { type: 'array' });
            let text = '';
            
            // 遍历所有工作表
            workbook.SheetNames.forEach(sheetName => {
              const worksheet = workbook.Sheets[sheetName];
              const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
              
              // 将表格数据转换为文本
              jsonData.forEach((row: any) => {
                if (Array.isArray(row)) {
                  text += row.join('\t') + '\n';
                }
              });
            });
            resolve(text);
          } 
          // PowerPoint 文件处理
          else if (file.type.includes('powerpoint') || file.type.includes('presentation') || 
                   fileExtension === '.pptx' || fileExtension === '.ppt') {
            // 注意：PowerPoint 解析比较复杂，这里提供一个基础实现
            // 实际项目中可能需要更专业的库
            const arrayBuffer = e.target?.result as ArrayBuffer;
            // 这里可以集成 pptxjs 或其他 PowerPoint 解析库
            // 暂时返回一个提示信息
            resolve('PowerPoint 文件内容提取功能正在开发中...');
          } 
          // 图片文件处理（OCR）
          else if (file.type.includes('image') || 
                   fileExtension === '.jpg' || fileExtension === '.jpeg' || 
                   fileExtension === '.png' || fileExtension === '.gif' || 
                   fileExtension === '.bmp' || fileExtension === '.webp') {
            const arrayBuffer = e.target?.result as ArrayBuffer;
            const blob = new Blob([arrayBuffer], { type: file.type });
            
            // 使用 Tesseract.js 进行 OCR
            const result = await Tesseract.recognize(blob, 'chi_sim+eng', {
              logger: m => console.log(m)
            });
            resolve(result.data.text);
          } 
          else {
            reject(new Error(`暂不支持该文件类型: ${file.type} (${fileExtension})`));
          }
        } catch (err) {
          reject(new Error('文件解析失败: ' + (err as Error).message));
        }
      };
      
      reader.onerror = (e) => {
        reject(new Error('文件读取失败'));
      };

      // 根据文件类型选择读取方式
      const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
      
      if (file.type.includes('text') || file.type.includes('markdown') || 
          fileExtension === '.txt' || fileExtension === '.md' || 
          fileExtension === '.csv' || fileExtension === '.json') {
        reader.readAsText(file);
      } else {
        reader.readAsArrayBuffer(file);
      }
    });
  }
}

export default AIAnalysisService; 