import { BrandAnalysisResult, ContentCheckResult } from '@/types/brand';
import { callOpenAIProxy } from '@/api/localApiProxy';
import FileFormatSupportService from '@/services/fileFormatSupportService';
// PDF 解析依赖
import * as pdfjsLib from 'pdfjs-dist';
// Word 文档解析
import mammoth from 'mammoth';
// Excel 解析
import * as XLSX from 'xlsx';
// 图片 OCR
import Tesseract from 'tesseract.js';
import { logger } from '@/utils/logger';

// 配置 PDF.js worker - 使用本地托管的worker文件
if (typeof window !== 'undefined') {
  try {
    // 使用本地托管的worker文件，避免CORS问题和版本不匹配
    pdfjsLib.GlobalWorkerOptions.workerSrc = '/assets/pdf.worker.min.js';
  } catch (error) {
    console.warn('PDF.js worker配置失败:', error);
  }
}

  /**
   * AI 分析服务
   * @description 处理品牌资料的 AI 分析，使用 GPT-4o 模型
   */
  class AIAnalysisService {
    private static instance: AIAnalysisService;

    private constructor() {
      // 使用API代理，不需要直接配置API密钥
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
   * 获取支持的文件类型（使用统一的文件格式支持服务）
   */
  public getSupportedFileTypes(): Array<{
    extension: string;
    mimeType: string;
    description: string;
  }> {
    const formatSupportService = FileFormatSupportService.getInstance();
    return formatSupportService.getSupportedFileTypes();
  }

  /**
   * 检查文件类型是否支持（使用统一的文件格式支持服务）
   */
  public isFileTypeSupported(file: File): boolean {
    const formatSupportService = FileFormatSupportService.getInstance();
    return formatSupportService.isFileTypeSupported(file);
  }

  /**
   * 分析品牌资料
   * @param content 要分析的内容
   */
  public async analyzeBrandContent(content: string): Promise<BrandAnalysisResult> {
    // 检查内容是否为空或过短
    if (!content || content.trim().length < 10) {
      console.warn('品牌资料内容过短，使用默认分析结果');
      return {
        keywords: ['品牌建设', '市场定位', '用户价值'],
        tone: '专业、可靠、创新',
        suggestions: ['请提供更多品牌资料以获得更准确的分析', '建议包含品牌介绍、产品描述、市场定位等信息']
      };
    }

    const prompt = `
作为一名品牌策略专家，请分析以下品牌资料，提取关键信息并按照不同维度进行分类：

品牌资料内容：
${content}

请严格按照以下JSON格式返回分析结果，不要包含任何其他文字说明：

{
  "brandKeywords": ["品牌核心概念1", "品牌核心概念2", "品牌核心概念3"],
  "productKeywords": ["产品特征1", "产品特征2", "产品特征3"],
  "targetAudience": ["目标受众1", "目标受众2", "目标受众3"],
  "brandStory": ["品牌故事元素1", "品牌故事元素2", "品牌故事元素3"],
  "competitiveAdvantage": ["竞争优势1", "竞争优势2", "竞争优势3"],
  "tone": "语气特征描述",
  "suggestions": ["建议1", "建议2", "建议3"]
}

要求：
1. brandKeywords：品牌核心概念、价值主张、品牌定位相关的词汇
2. productKeywords：具体产品特征、功能、材质、技术相关的词汇
3. targetAudience：用户群体、市场定位、消费者特征相关的词汇
4. brandStory：历史、文化、情感、传承相关的词汇
5. competitiveAdvantage：差异化、优势、特色、领先相关的词汇
6. tone：描述品牌的语调风格，如"专业、可靠、创新"或"年轻、活力、时尚"
7. suggestions：提供3条具体的品牌建设建议

注意：
- 每个维度至少提供3个关键词，最多5个
- 不同维度之间避免重复
- 必须返回有效的JSON格式，不要包含任何解释性文字
- 如果某个维度信息不足，可以基于品牌特征进行合理推测
`;

    try {
      const response = await callOpenAIProxy([
        {
          role: 'system',
          content: '你是一名专业的品牌策略分析专家。你的任务是将品牌资料分析为JSON格式。重要：1) 只返回JSON格式，不要包含任何其他文字；2) 确保JSON格式完全正确；3) 如果内容不足，基于常见品牌特征进行合理推测。'
        },
        {
          role: 'user',
          content: prompt
        }
      ], 'gpt-4o', 0.1, 2000);

      if (!response.success || !response.data) {
        console.error('API响应失败:', response);
        throw new Error('AI分析服务请求失败');
      }

      // 检查响应数据结构 - 兼容不同的API响应格式
      let choices = response.data.choices;
      if (!choices && response.data.data && response.data.data.choices) {
        choices = response.data.data.choices;
      }
      
      if (!Array.isArray(choices) || !choices[0] || !choices[0].message) {
        console.error('API响应数据结构异常，完整响应:', response);
        throw new Error('AI分析服务返回数据格式异常，请稍后重试');
      }

      const content = choices[0].message.content;
      if (!content) {
        throw new Error('API返回空内容');
      }

      let result;
      try {
        // 清理可能的Markdown代码块格式
        let cleanContent = content.trim();
        if (cleanContent.startsWith('```json')) {
          cleanContent = cleanContent.replace(/^```json\s*/, '').replace(/\s*```$/, '');
        } else if (cleanContent.startsWith('```')) {
          cleanContent = cleanContent.replace(/^```\s*/, '').replace(/\s*```$/, '');
        }
        
        // 尝试直接解析JSON
        result = JSON.parse(cleanContent);
      } catch (parseError) {
        console.error('JSON解析失败，原始内容:', content);
        
        // 如果解析失败，检查是否是错误提示
        if (content.includes('请提供') || content.includes('内容不足') || content.length < 50) {
          console.warn('AI返回了错误提示，使用默认分析结果');
          result = {
            keywords: ['品牌建设', '市场定位', '用户价值', '产品创新', '用户体验'],
            tone: '专业、可靠、创新',
            suggestions: ['请提供更多品牌资料以获得更准确的分析', '建议包含品牌介绍、产品描述、市场定位等信息', '可以上传品牌手册、产品介绍等文档']
          };
        } else {
          // 尝试从文本中提取关键信息
          console.warn('尝试从非JSON响应中提取信息');
          const keywords = content.match(/关键词[：:]\s*([^，。\n]+)/g)?.map((k: string) => k.replace(/关键词[：:]\s*/, '')) ||
                          ['品牌建设', '市场定位', '用户价值'];
          const tone = content.match(/语气[：:]\s*([^，。\n]+)/)?.pop() || '专业、可靠、创新';
          const suggestions = content.match(/建议[：:]\s*([^，。\n]+)/g)?.map((s: string) => s.replace(/建议[：:]\s*/, '')) ||
                             ['加强品牌故事传播', '突出产品差异化优势', '建立用户情感连接'];
          
          result = {
            keywords: keywords.slice(0, 5),
            tone: tone,
            suggestions: suggestions.slice(0, 3)
          };
        }
      }

      // 兼容新旧格式
      const keywords = result.keywords || result.brandKeywords || [];
      const brandKeywords = result.brandKeywords || keywords;
      const productKeywords = result.productKeywords || [];
      const targetAudience = result.targetAudience || [];
      const brandStory = result.brandStory || [];
      const competitiveAdvantage = result.competitiveAdvantage || [];

      return {
        keywords: keywords, // 保持向后兼容
        brandKeywords: brandKeywords,
        productKeywords: productKeywords,
        targetAudience: targetAudience,
        brandStory: brandStory,
        competitiveAdvantage: competitiveAdvantage,
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
      const response = await callOpenAIProxy([
        {
          role: 'system',
          content: '你是一名专业的品牌语气检查专家，擅长评估内容是否符合品牌调性。请严格按照JSON格式返回分析结果。'
        },
        {
          role: 'user',
          content: prompt
        }
      ], 'gpt-4o', 0.3, 2000);

      if (!response.success || !response.data) {
        console.error('API响应失败:', response);
        throw new Error('AI分析服务请求失败');
      }

      // 检查响应数据结构 - 兼容不同的API响应格式
      let choices = response.data.choices;
      if (!choices && response.data.data && response.data.data.choices) {
        choices = response.data.data.choices;
      }
      
      if (!Array.isArray(choices) || !choices[0] || !choices[0].message) {
        console.error('API响应数据结构异常，完整响应:', response);
        throw new Error('AI分析服务返回数据格式异常，请稍后重试');
      }

      const content = choices[0].message.content;
      if (!content) {
        throw new Error('API返回空内容');
      }

      try {
        // 清理可能的Markdown代码块格式
        let cleanContent = content.trim();
        if (cleanContent.startsWith('```json')) {
          cleanContent = cleanContent.replace(/^```json\s*/, '').replace(/\s*```$/, '');
        } else if (cleanContent.startsWith('```')) {
          cleanContent = cleanContent.replace(/^```\s*/, '').replace(/\s*```$/, '');
        }
        
        return JSON.parse(cleanContent);
      } catch (parseError) {
        console.error('JSON解析失败:', content);
        // 返回默认结果
        return {
          isValid: true,
          issues: [],
          suggestions: ['建议检查内容是否符合品牌调性']
        };
      }
    } catch (error) {
      console.error('内容检查失败:', error);
      throw new Error('内容检查失败');
    }
  }

  /**
   * 读取文件内容
   * @param file 文件对象
   */
  public async readFileContent(file: File): Promise<string> {
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
              
              // 使用更稳定的PDF解析配置
              const pdf = await pdfjsLib.getDocument({ 
                data: typedArray,
                useWorkerFetch: false,
                isEvalSupported: false,
                useSystemFonts: true
              }).promise;
              
              let text = '';
              const numPages = pdf.numPages; // 解析所有页面，不设限制

              console.log(`📄 开始解析PDF文档，共 ${numPages} 页`);

              // 对于大文件，添加内存管理提示
              if (numPages > 50) {
                console.warn(`⚠️ 大型PDF文档 (${numPages}页)，解析可能需要较长时间`);
              }

              for (let i = 1; i <= numPages; i++) {
                try {
                  // 显示解析进度
                  if (numPages > 5 && i % 5 === 0) {
                    console.log(`📖 PDF解析进度: ${i}/${numPages} 页 (${Math.round((i/numPages)*100)}%)`);
                  }

                  const page = await pdf.getPage(i);
                  const content = await page.getTextContent();
                  const pageText = content.items.map((item: any) => item.str).join(' ');
                  text += pageText + '\n';
                } catch (pageError) {
                  console.warn(`PDF第${i}页解析失败:`, pageError);
                  continue;
                }
              }
              
              if (text.trim().length === 0) {
                throw new Error('PDF内容为空');
              }

              logger.debug('✅ PDF解析完成: ${numPages}页，提取文本 ${text.length} 字符');
              resolve(text);
            } catch (pdfError) {
              console.warn('PDF解析失败，尝试备用方案:', pdfError);
              
              // 备用方案：返回文件信息
              const fileSize = file.size;
              const fileInfo = `PDF文件: ${file.name}\n文件大小: ${(fileSize / 1024).toFixed(2)} KB\n\n由于PDF解析技术限制，无法提取文本内容。\n建议：\n1. 将PDF转换为Word文档后上传\n2. 复制PDF内容到文本文件后上传\n3. 手动输入品牌资料内容`;
              
              resolve(fileInfo);
            }
          } 
          // Word 文档处理
          else if (file.type.includes('word') ||
                   file.type.includes('document') ||
                   file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
                   file.type === 'application/msword' ||
                   fileExtension === '.docx' ||
                   fileExtension === '.doc') {
            try {
              const arrayBuffer = e.target?.result as ArrayBuffer;
              console.log(`📄 开始解析Word文档: ${file.name} (${(file.size / 1024).toFixed(2)} KB)`);

              // 使用mammoth解析Word文档
              const result = await (mammoth as any).extractRawText({
                arrayBuffer,
                // 添加更多选项以提高解析成功率
                convertImage: (mammoth as any).images?.ignoreAll,
                includeDefaultStyleMap: true
              });

              const extractedText = result.value.trim();

              if (!extractedText) {
                console.warn('Word文档解析结果为空');
                resolve(`Word文档: ${file.name}\n文件大小: ${(file.size / 1024).toFixed(2)} KB\n\n文档内容为空或无法提取文本。\n建议：\n1. 检查文档是否包含文字内容\n2. 尝试另存为较新的.docx格式\n3. 复制文档内容到文本文件后上传`);
              } else {
                logger.debug('✅ Word文档解析完成: 提取文本 ${extractedText.length} 字符');

                // 如果有解析警告，记录但不影响结果
                if (result.messages && result.messages.length > 0) {
                  console.warn('Word文档解析警告:', result.messages);
                }

                resolve(extractedText);
              }
            } catch (wordError) {
              console.error('Word文档解析失败:', wordError);

              // 提供详细的错误信息和建议
              const errorMessage = `Word文档解析失败: ${file.name}\n错误信息: ${(wordError as any)?.message || '未知错误'}\n\n建议解决方案：\n1. 检查文档是否损坏\n2. 尝试用Word重新保存文档\n3. 另存为.docx格式（推荐）\n4. 复制文档内容到文本文件\n5. 转换为PDF格式后上传`;

              resolve(errorMessage);
            }
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
            try {
              const arrayBuffer = e.target?.result as ArrayBuffer;

              if (fileExtension === '.pptx') {
                // PPTX 文件处理（基于 ZIP 结构）
                try {
                  const JSZip = (await import('jszip')).default;

                  const zip = await JSZip.loadAsync(arrayBuffer);
                  let extractedText = '';

                  // 遍历所有幻灯片文件
                  const slideFiles = Object.keys(zip.files).filter(filename =>
                    filename.startsWith('ppt/slides/slide') && filename.endsWith('.xml')
                  );

                  for (const slideFile of slideFiles) {
                    try {
                      const slideContent = await zip.files[slideFile].async('text');
                      // 使用正则表达式提取文本内容
                      const textMatches = slideContent.match(/<a:t[^>]*>([^<]*)<\/a:t>/g);
                      if (textMatches) {
                        textMatches.forEach(match => {
                          const text = match.replace(/<[^>]*>/g, '').trim();
                          if (text) {
                            extractedText += text + '\n';
                          }
                        });
                      }
                    } catch (slideError) {
                      console.warn(`幻灯片 ${slideFile} 解析失败:`, slideError);
                    }
                  }

                  if (extractedText.trim()) {
                    resolve(extractedText);
                  } else {
                    resolve(`PowerPoint 文件: ${file.name}\n文件大小: ${(file.size / 1024).toFixed(2)} KB\n\n未能提取到文本内容。可能原因：\n1. 幻灯片主要包含图片或图表\n2. 文本内容较少\n3. 文件格式复杂\n\n建议：\n1. 将PPT内容复制到Word文档后上传\n2. 导出为PDF格式后上传\n3. 手动输入主要内容`);
                  }
                } catch (zipError) {
                  console.warn('PPTX ZIP解析失败:', zipError);
                  resolve(`PowerPoint 文件: ${file.name}\n解析失败，建议转换为其他格式后上传。`);
                }
              } else {
                // PPT 文件处理（二进制格式，较复杂）
                resolve(`PowerPoint 文件: ${file.name}\n文件大小: ${(file.size / 1024).toFixed(2)} KB\n\n.ppt 格式解析较复杂，建议：\n1. 另存为 .pptx 格式后重新上传\n2. 将内容复制到Word文档后上传\n3. 导出为PDF格式后上传\n4. 手动输入主要内容`);
              }
            } catch (pptError) {
              console.warn('PowerPoint解析失败:', pptError);
              resolve(`PowerPoint 文件解析失败: ${file.name}\n建议转换为Word或PDF格式后上传。`);
            }
          }
          // 图片文件处理（OCR）
          else if (file.type.includes('image') || 
                   fileExtension === '.jpg' || fileExtension === '.jpeg' || 
                   fileExtension === '.png' || fileExtension === '.gif' || 
                   fileExtension === '.bmp' || fileExtension === '.webp') {
            /**
             * 使用 Tesseract.js 进行图片OCR识别，支持中英文。
             * @returns 图片中的文本内容，若识别失败则返回友好提示。
             */
            try {
              const arrayBuffer = e.target?.result as ArrayBuffer;
              const blob = new Blob([arrayBuffer], { type: file.type });
              const result = await Tesseract.recognize(blob, 'chi_sim+eng', {
                logger: m => console.log(m)
              });
              const text = result.data.text.trim();
              if (!text) {
                resolve('图片未识别到有效文字，请上传包含清晰文字的图片。');
              } else {
                resolve(text);
              }
            } catch (ocrError) {
              console.warn('图片OCR识别失败:', ocrError);
              resolve('图片内容识别失败，请确保图片为清晰的文字图片。');
            }
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