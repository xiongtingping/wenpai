/**
 * MD2Card服务
 * 处理Markdown到卡片的转换、渲染和导出
 */

import i18n from '@/i18n';
import { ParsedContent, MarkdownParser, ContentAdapter } from '@/components/creative/md2card/MarkdownParser';
import { CardTemplate, CardConfiguration } from '@/components/creative/MD2CardPage';
import { ExportOptions } from '@/components/creative/md2card/ExportControls';

// 服务响应接口
export interface MD2CardResponse {
  success: boolean;
  data?: any;
  error?: string;
  message?: string;
}

// 卡片生成请求参数
export interface GenerateCardRequest {
  markdown: string;
  templateId: string;
  configuration: CardConfiguration;
}

// 卡片生成响应
export interface GenerateCardResponse extends MD2CardResponse {
  data?: {
    parsedContent: ParsedContent;
    imageData: string;
    metadata: {
      processingTime: number;
      fileSize: number;
      dimensions: {
        width: number;
        height: number;
      };
    };
  };
}

// 导出请求参数
export interface ExportCardRequest {
  parsedContent: ParsedContent;
  template: CardTemplate;
  configuration: CardConfiguration;
  options: ExportOptions;
}

/**
 * MD2Card核心服务类
 */
export class MD2CardService {
  private parser: MarkdownParser;
  
  constructor() {
    this.parser = new MarkdownParser();
  }

  /**
   * 生成卡片
   */
  async generateCard(request: GenerateCardRequest): Promise<GenerateCardResponse> {
    const startTime = performance.now();
    
    try {
      // 1. 解析Markdown内容
      const parsedContent = this.parser.parse(request.markdown);
      
      // 2. 验证内容是否适合模板
      const template = this.getTemplateById(request.templateId);
      if (!template) {
        return {
          success: false,
          error: i18n.t('common.errors.模板不存在')
        };
      }

      const validation = ContentAdapter.validateContentForTemplate(
        parsedContent, 
        template.constraints
      );

      if (!validation.isValid) {
        console.warn('内容验证警告:', validation.warnings);
      }

      // 3. 优化内容以适应模板
      const optimizedContent = ContentAdapter.optimizeForTemplate(
        parsedContent,
        template.category
      );

      // 4. 渲染卡片
      const imageData = await this.renderCard(optimizedContent, template, request.configuration);
      
      const processingTime = performance.now() - startTime;
      
      return {
        success: true,
        data: {
          parsedContent: optimizedContent,
          imageData,
          metadata: {
            processingTime,
            fileSize: this.estimateImageSize(imageData),
            dimensions: {
              width: template.dimensions.width,
              height: template.dimensions.height
            }
          }
        }
      };
    } catch (error) {
      console.error('卡片生成失败:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : i18n.t('common.errors.未知错误')
      };
    }
  }

  /**
   * 导出卡片
   */
  async exportCard(request: ExportCardRequest): Promise<Blob> {
    const { parsedContent, template, configuration, options } = request;
    
    try {
      // 根据导出格式选择渲染方法
      switch (options.format.id) {
        case 'png':
        case 'jpg':
        case 'jpeg':
          return await this.exportAsRasterImage(
            parsedContent, 
            template, 
            configuration, 
            options
          );
        case 'svg':
          return await this.exportAsSVG(
            parsedContent, 
            template, 
            configuration, 
            options
          );
        case 'pdf':
          return await this.exportAsPDF(
            parsedContent, 
            template, 
            configuration, 
            options
          );
        default:
          throw new Error(`不支持的导出格式: ${options.format.id}`);
      }
    } catch (error) {
      console.error('导出失败:', error);
      throw error;
    }
  }

  /**
   * 渲染卡片到Canvas并返回DataURL
   */
  private async renderCard(
    content: ParsedContent,
    template: CardTemplate,
    config: CardConfiguration
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      try {
        // 创建离屏Canvas
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
          reject(new Error('无法创建Canvas上下文'));
          return;
        }

        // 设置画布尺寸
        canvas.width = template.dimensions.width;
        canvas.height = template.dimensions.height;

        // 渲染卡片内容
        this.renderCardContent(ctx, content, template, config)
          .then(() => {
            const dataURL = canvas.toDataURL('image/png');
            resolve(dataURL);
          })
          .catch(reject);
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * 渲染卡片内容到Canvas上下文
   */
  private async renderCardContent(
    ctx: CanvasRenderingContext2D,
    content: ParsedContent,
    template: CardTemplate,
    config: CardConfiguration
  ): Promise<void> {
    const { width, height } = template.dimensions;
    const padding = config.layout.padding;
    const spacing = config.layout.spacing;

    // 清空画布并设置背景
    ctx.fillStyle = config.colors.background;
    ctx.fillRect(0, 0, width, height);

    let yPosition = padding;

    // 设置字体基础样式
    const baseFontSize = this.getFontSize(config.typography.fontSize);
    ctx.textAlign = config.layout.alignment as CanvasTextAlign;
    ctx.textBaseline = 'top';

    // 渲染标题
    if (content.title) {
      ctx.font = `bold ${baseFontSize * 1.8}px ${config.typography.primaryFont}, Arial, sans-serif`;
      ctx.fillStyle = config.colors.primary;
      yPosition += this.renderText(
        ctx, 
        content.title, 
        this.getTextX(config.layout.alignment, width, padding), 
        yPosition, 
        width - 2 * padding,
        baseFontSize * 1.8 * 1.2
      );
      yPosition += spacing * 2;
    }

    // 渲染副标题
    if (content.subtitle) {
      ctx.font = `${baseFontSize * 1.3}px ${config.typography.primaryFont}, Arial, sans-serif`;
      ctx.fillStyle = config.colors.secondary;
      yPosition += this.renderText(
        ctx, 
        content.subtitle, 
        this.getTextX(config.layout.alignment, width, padding), 
        yPosition, 
        width - 2 * padding,
        baseFontSize * 1.3 * 1.2
      );
      yPosition += spacing * 1.5;
    }

    // 渲染内容段落
    ctx.font = `${baseFontSize}px ${config.typography.primaryFont}, Arial, sans-serif`;
    ctx.fillStyle = config.colors.text;

    for (const section of content.sections) {
      if (yPosition > height - padding) break;

      switch (section.type) {
        case 'text':
          if (typeof section.content === 'string') {
            // 处理强调样式
            if (section.style === 'emphasis') {
              ctx.font = `bold ${baseFontSize}px ${config.typography.primaryFont}, Arial, sans-serif`;
              ctx.fillStyle = config.colors.primary;
            } else {
              ctx.font = `${baseFontSize}px ${config.typography.primaryFont}, Arial, sans-serif`;
              ctx.fillStyle = config.colors.text;
            }
            
            yPosition += this.renderText(
              ctx, 
              section.content, 
              this.getTextX(config.layout.alignment, width, padding), 
              yPosition, 
              width - 2 * padding,
              baseFontSize * 1.4
            );
          }
          break;
          
        case 'list':
          if (Array.isArray(section.content)) {
            for (const item of section.content) {
              if (yPosition > height - padding) break;
              
              const bulletX = this.getTextX(config.layout.alignment, width, padding);
              const textX = bulletX + (config.layout.alignment === 'center' ? 0 : 20);
              
              // 渲染项目符号
              if (config.layout.alignment !== 'center') {
                ctx.fillText('•', bulletX, yPosition);
              }
              
              // 渲染列表项文本
              yPosition += this.renderText(
                ctx, 
                config.layout.alignment === 'center' ? `• ${item}` : item, 
                textX, 
                yPosition, 
                width - 2 * padding - (config.layout.alignment === 'center' ? 0 : 20),
                baseFontSize * 1.4
              );
            }
          }
          break;
          
        case 'quote':
          if (typeof section.content === 'string') {
            ctx.fillStyle = config.colors.secondary;
            ctx.font = `italic ${baseFontSize}px ${config.typography.primaryFont}, Arial, sans-serif`;
            yPosition += this.renderText(
              ctx, 
              `"${section.content}"`, 
              this.getTextX(config.layout.alignment, width, padding) + 20, 
              yPosition, 
              width - 2 * padding - 40,
              baseFontSize * 1.4
            );
            ctx.fillStyle = config.colors.text;
            ctx.font = `${baseFontSize}px ${config.typography.primaryFont}, Arial, sans-serif`;
          }
          break;
          
        case 'code':
          if (typeof section.content === 'string') {
            // 代码块背景
            const codeHeight = baseFontSize * 1.4 + 20;
            ctx.fillStyle = '#f5f5f5';
            ctx.fillRect(padding, yPosition - 10, width - 2 * padding, codeHeight);
            
            // 代码文本
            ctx.fillStyle = config.colors.accent;
            ctx.font = `${baseFontSize * 0.9}px 'Courier New', monospace`;
            yPosition += this.renderText(
              ctx, 
              section.content, 
              padding + 10, 
              yPosition, 
              width - 2 * padding - 20,
              baseFontSize * 1.2
            );
            ctx.fillStyle = config.colors.text;
            ctx.font = `${baseFontSize}px ${config.typography.primaryFont}, Arial, sans-serif`;
          }
          break;
      }
      yPosition += spacing;
    }

    // 渲染品牌元素
    if (config.branding.enableBrandLogo) {
      await this.renderBrandElements(ctx, template, config);
    }
  }

  /**
   * 渲染文本（支持自动换行）
   */
  private renderText(
    ctx: CanvasRenderingContext2D,
    text: string,
    x: number,
    y: number,
    maxWidth: number,
    lineHeight: number
  ): number {
    const words = text.split(' ');
    let line = '';
    let lineCount = 0;

    for (let i = 0; i < words.length; i++) {
      const testLine = line + words[i] + ' ';
      const metrics = ctx.measureText(testLine);
      
      if (metrics.width > maxWidth && i > 0) {
        ctx.fillText(line, x, y + lineCount * lineHeight);
        line = words[i] + ' ';
        lineCount++;
      } else {
        line = testLine;
      }
    }
    
    ctx.fillText(line, x, y + lineCount * lineHeight);
    return (lineCount + 1) * lineHeight;
  }

  /**
   * 获取文本X坐标（根据对齐方式）
   */
  private getTextX(alignment: 'left' | 'center' | 'right', width: number, padding: number): number {
    switch (alignment) {
      case 'center':
        return width / 2;
      case 'right':
        return width - padding;
      case 'left':
      default:
        return padding;
    }
  }

  /**
   * 渲染品牌元素
   */
  private async renderBrandElements(
    ctx: CanvasRenderingContext2D,
    template: CardTemplate,
    config: CardConfiguration
  ): Promise<void> {
    if (config.branding.watermark) {
      // 设置水印样式
      ctx.globalAlpha = 0.3;
      ctx.fillStyle = config.colors.accent;
      ctx.font = 'var(--spacing-3) Arial';
      
      const text = config.branding.watermark;
      const metrics = ctx.measureText(text);
      
      // 根据位置配置放置水印
      let x = 10, y = template.dimensions.height - 10;
      switch (config.branding.logoPosition) {
        case 'top-left':
          x = 10;
          y = 20;
          break;
        case 'top-right':
          x = template.dimensions.width - metrics.width - 10;
          y = 20;
          break;
        case 'bottom-right':
          x = template.dimensions.width - metrics.width - 10;
          y = template.dimensions.height - 10;
          break;
        case 'bottom-left':
        default:
          x = 10;
          y = template.dimensions.height - 10;
          break;
      }
      
      ctx.fillText(text, x, y);
      ctx.globalAlpha = 1;
    }
  }

  /**
   * 导出为栅格图像（PNG/JPG）
   */
  private async exportAsRasterImage(
    content: ParsedContent,
    template: CardTemplate,
    config: CardConfiguration,
    options: ExportOptions
  ): Promise<Blob> {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      throw new Error('无法创建Canvas上下文');
    }

    // 设置高分辨率画布
    const scale = options.quality.scale;
    canvas.width = template.dimensions.width * scale;
    canvas.height = template.dimensions.height * scale;
    
    // 缩放上下文
    ctx.scale(scale, scale);

    // 如果是JPG格式，设置背景色
    if (options.format.id === 'jpg' || options.format.id === 'jpeg') {
      ctx.fillStyle = options.backgroundColor || '#FFFFFF';
      ctx.fillRect(0, 0, template.dimensions.width, template.dimensions.height);
    }

    // 渲染内容
    await this.renderCardContent(ctx, content, template, config);

    // 转换为Blob
    return new Promise((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error(i18n.t('common.errors.无法生成图片')));
          }
        },
        options.format.mimeType,
        options.format.id === 'jpg' ? options.quality.jpegQuality : undefined
      );
    });
  }

  /**
   * 导出为SVG
   */
  private async exportAsSVG(
    content: ParsedContent,
    template: CardTemplate,
    config: CardConfiguration,
    options: ExportOptions
  ): Promise<Blob> {
    const { width, height } = template.dimensions;
    
    let svg = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">`;
    
    // 背景
    svg += `<rect width="${width}" height="${height}" fill="${config.colors.background}"/>`;
    
    // 渲染文本内容
    let yPosition = config.layout.padding;
    const baseFontSize = this.getFontSize(config.typography.fontSize);
    
    // 标题
    if (content.title) {
      svg += `<text x="${this.getTextX(config.layout.alignment, width, config.layout.padding)}" y="${yPosition + baseFontSize * 1.8}" font-family="${config.typography.primaryFont}, Arial, sans-serif" font-size="${baseFontSize * 1.8}" font-weight="bold" fill="${config.colors.primary}" text-anchor="${this.getSVGTextAnchor(config.layout.alignment)}">${this.escapeXML(content.title)}</text>`;
      yPosition += baseFontSize * 1.8 * 1.2 + config.layout.spacing * 2;
    }
    
    // 副标题
    if (content.subtitle) {
      svg += `<text x="${this.getTextX(config.layout.alignment, width, config.layout.padding)}" y="${yPosition + baseFontSize * 1.3}" font-family="${config.typography.primaryFont}, Arial, sans-serif" font-size="${baseFontSize * 1.3}" fill="${config.colors.secondary}" text-anchor="${this.getSVGTextAnchor(config.layout.alignment)}">${this.escapeXML(content.subtitle)}</text>`;
      yPosition += baseFontSize * 1.3 * 1.2 + config.layout.spacing * 1.5;
    }

    // 内容段落
    for (const section of content.sections) {
      if (yPosition > height - config.layout.padding) break;
      
      if (section.type === 'text' && typeof section.content === 'string') {
        svg += `<text x="${this.getTextX(config.layout.alignment, width, config.layout.padding)}" y="${yPosition + baseFontSize}" font-family="${config.typography.primaryFont}, Arial, sans-serif" font-size="${baseFontSize}" fill="${config.colors.text}" text-anchor="${this.getSVGTextAnchor(config.layout.alignment)}">${this.escapeXML(section.content)}</text>`;
        yPosition += baseFontSize * 1.4 + config.layout.spacing;
      }
    }
    
    svg += '</svg>';
    
    return new Blob([svg], { type: 'image/svg+xml' });
  }

  /**
   * 导出为PDF
   */
  private async exportAsPDF(
    content: ParsedContent,
    template: CardTemplate,
    config: CardConfiguration,
    options: ExportOptions
  ): Promise<Blob> {
    // 这里需要使用PDF生成库，如jsPDF
    // 暂时返回空的PDF内容
    const pdfContent = '%PDF-1.4\n1 0 obj\n<<\n/Type /Catalog\n/Pages 2 0 R\n>>\nendobj\n2 0 obj\n<<\n/Type /Pages\n/Kids [3 0 R]\n/Count 1\n>>\nendobj\n3 0 obj\n<<\n/Type /Page\n/Parent 2 0 R\n/MediaBox [0 0 612 792]\n>>\nendobj\nxref\n0 4\n0000000000 65535 f \n0000000009 00000 n \n0000000058 00000 n \n0000000115 00000 n \ntrailer\n<<\n/Size 4\n/Root 1 0 R\n>>\nstartxref\n174\n%%EOF';
    
    return new Blob([pdfContent], { type: 'application/pdf' });
  }

  /**
   * 获取字体大小
   */
  private getFontSize(size: 'small' | 'medium' | 'large'): number {
    switch (size) {
      case 'small': return 14;
      case 'large': return 20;
      case 'medium':
      default: return 16;
    }
  }

  /**
   * 获取SVG文本锚点
   */
  private getSVGTextAnchor(alignment: 'left' | 'center' | 'right'): string {
    switch (alignment) {
      case 'center': return 'middle';
      case 'right': return 'end';
      case 'left':
      default: return 'start';
    }
  }

  /**
   * XML转义
   */
  private escapeXML(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  /**
   * 估算图片大小
   */
  private estimateImageSize(dataURL: string): number {
    // 简单的Base64长度估算
    const base64Length = dataURL.split(',')[1]?.length || 0;
    return Math.round(base64Length * 0.75); // Base64编码大约比原始数据大33%
  }

  /**
   * 根据ID获取模板
   */
  private getTemplateById(templateId: string): CardTemplate | null {
    // 这里应该从模板注册表中获取
    // 暂时返回null，实际使用时需要实现
    return null;
  }
}

// 导出服务实例
export const md2cardService = new MD2CardService();

// 便捷函数
export async function generateCard(request: GenerateCardRequest): Promise<GenerateCardResponse> {
  return md2cardService.generateCard(request);
}

export async function exportCard(request: ExportCardRequest): Promise<Blob> {
  return md2cardService.exportCard(request);
}