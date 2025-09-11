/**
 * Markdown解析器和内容适配器
 * 将Markdown内容解析为适合卡片展示的结构化数据
 */

import { marked } from 'marked';

// 解析后的内容结构
export interface ParsedContent {
  title: string;
  subtitle?: string;
  sections: ContentSection[];
  metadata: ContentMetadata;
}

export interface ContentSection {
  type: 'text' | 'list' | 'quote' | 'code' | 'image';
  content: string | string[];
  level?: number; // 标题级别
  style?: 'emphasis' | 'strong' | 'normal';
}

export interface ContentMetadata {
  wordCount: number;
  estimatedReadTime: number;
  hasImages: boolean;
  hasList: boolean;
  hasCode: boolean;
  complexity: 'simple' | 'medium' | 'complex';
}

// 支持的Markdown元素配置
export interface MarkdownElementConfig {
  headers: {
    h1: 'title';
    h2: 'subtitle';
    h3: 'section';
  };
  text: {
    bold: 'emphasis';
    italic: 'secondary';
    code: 'highlight';
  };
  lists: {
    unordered: 'bullet-points';
    ordered: 'numbered-steps';
  };
  media: {
    images: 'visual-content';
    links: 'reference-links';
  };
}

/**
 * Markdown解析器类
 */
export class MarkdownParser {
  private config: MarkdownElementConfig;
  
  constructor(config?: Partial<MarkdownElementConfig>) {
    this.config = {
      headers: { h1: 'title', h2: 'subtitle', h3: 'section' },
      text: { bold: 'emphasis', italic: 'secondary', code: 'highlight' },
      lists: { unordered: 'bullet-points', ordered: 'numbered-steps' },
      media: { images: 'visual-content', links: 'reference-links' },
      ...config
    };
  }

  /**
   * 解析Markdown内容
   */
  parse(markdown: string): ParsedContent {
    const tokens = marked.lexer(markdown);
    const sections: ContentSection[] = [];
    let title = '';
    let subtitle = '';

    for (const token of tokens) {
      switch (token.type) {
        case 'heading':
          if (token.depth === 1 && !title) {
            title = token.text;
          } else if (token.depth === 2 && !subtitle) {
            subtitle = token.text;
          } else {
            sections.push({
              type: 'text',
              content: token.text,
              level: token.depth,
              style: 'emphasis'
            });
          }
          break;
          
        case 'paragraph':
          sections.push({
            type: 'text',
            content: this.parseInlineElements(token.text),
            style: 'normal'
          });
          break;
          
        case 'list': {
          const listItems = token.items.map((item: any) =>
            this.parseInlineElements(item.text)
          );
          sections.push({
            type: 'list',
            content: listItems
          });
          break;
        }
          
        case 'blockquote':
          sections.push({
            type: 'quote',
            content: this.parseInlineElements(token.text)
          });
          break;
          
        case 'code':
          sections.push({
            type: 'code',
            content: token.text
          });
          break;
          
        case 'image':
          sections.push({
            type: 'image',
            content: token.href
          });
          break;
      }
    }

    const metadata = this.generateMetadata(markdown, sections);

    return {
      title: title || '未命名卡片',
      subtitle,
      sections,
      metadata
    };
  }

  /**
   * 解析内联元素（粗体、斜体、链接等）
   */
  private parseInlineElements(text: string): string {
    // 处理粗体
    text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
    // 处理斜体
    text = text.replace(/\*(.*?)\*/g, '<em>$1</em>');
    
    // 处理内联代码
    text = text.replace(/`(.*?)`/g, '<code>$1</code>');
    
    // 处理链接
    text = text.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2">$1</a>');
    
    return text;
  }

  /**
   * 生成内容元数据
   */
  private generateMetadata(markdown: string, sections: ContentSection[]): ContentMetadata {
    const wordCount = this.countWords(markdown);
    const estimatedReadTime = Math.ceil(wordCount / 200);
    
    const hasImages = sections.some(section => section.type === 'image');
    const hasList = sections.some(section => section.type === 'list');
    const hasCode = sections.some(section => section.type === 'code');
    
    let complexity: 'simple' | 'medium' | 'complex' = 'simple';
    if (sections.length > 10 || wordCount > 500) {
      complexity = 'complex';
    } else if (sections.length > 5 || wordCount > 200) {
      complexity = 'medium';
    }

    return {
      wordCount,
      estimatedReadTime,
      hasImages,
      hasList,
      hasCode,
      complexity
    };
  }

  /**
   * 计算单词数
   */
  private countWords(text: string): number {
    return text
      .replace(/[#*\-\[\]()]/g, '')
      .split(/\s+/)
      .filter(word => word.length > 0).length;
  }
}

/**
 * 内容适配器
 * 根据卡片模板和尺寸智能适配内容
 */
export class ContentAdapter {
  /**
   * 智能截断内容以适应卡片尺寸
   */
  static adaptContent(
    parsedContent: ParsedContent,
    maxSections: number = 5,
    maxWordsPerSection: number = 50
  ): ParsedContent {
    const adaptedSections = parsedContent.sections
      .slice(0, maxSections)
      .map(section => {
        if (section.type === 'text' && typeof section.content === 'string') {
          const words = section.content.split(' ');
          if (words.length > maxWordsPerSection) {
            return {
              ...section,
              content: words.slice(0, maxWordsPerSection).join(' ') + '...'
            };
          }
        } else if (section.type === 'list' && Array.isArray(section.content)) {
          // 限制列表项数量
          return {
            ...section,
            content: section.content.slice(0, 3)
          };
        }
        return section;
      });

    return {
      ...parsedContent,
      sections: adaptedSections
    };
  }

  /**
   * 生成内容摘要
   */
  static generateSummary(parsedContent: ParsedContent, maxLength: number = 100): string {
    const textSections = parsedContent.sections
      .filter(section => section.type === 'text')
      .map(section => section.content)
      .join(' ');

    if (textSections.length <= maxLength) {
      return textSections;
    }

    const words = textSections.split(' ');
    let summary = '';
    for (const word of words) {
      if ((summary + ' ' + word).length > maxLength - 3) {
        break;
      }
      summary += (summary ? ' ' : '') + word;
    }

    return summary + '...';
  }

  /**
   * 检测内容是否适合指定模板
   */
  static validateContentForTemplate(
    parsedContent: ParsedContent,
    templateConstraints: {
      maxSections: number;
      maxWordsPerSection: number;
      allowImages: boolean;
      allowLists: boolean;
    }
  ): { isValid: boolean; warnings: string[] } {
    const warnings: string[] = [];
    let isValid = true;

    // 检查段落数量
    if (parsedContent.sections.length > templateConstraints.maxSections) {
      warnings.push(`内容段落过多，建议不超过${templateConstraints.maxSections}段`);
      isValid = false;
    }

    // 检查单段内容长度
    for (const section of parsedContent.sections) {
      if (section.type === 'text' && typeof section.content === 'string') {
        const wordCount = section.content.split(' ').length;
        if (wordCount > templateConstraints.maxWordsPerSection) {
          warnings.push(`某些段落内容过长，建议每段不超过${templateConstraints.maxWordsPerSection}字`);
          isValid = false;
          break;
        }
      }
    }

    // 检查图片支持
    if (parsedContent.metadata.hasImages && !templateConstraints.allowImages) {
      warnings.push('当前模板不支持图片，图片内容将被忽略');
      isValid = false;
    }

    // 检查列表支持
    if (parsedContent.metadata.hasList && !templateConstraints.allowLists) {
      warnings.push('当前模板不支持列表，列表内容将转换为普通段落');
    }

    return { isValid, warnings };
  }

  /**
   * 根据模板类型优化内容结构
   */
  static optimizeForTemplate(
    parsedContent: ParsedContent,
    templateType: 'knowledge' | 'social' | 'business' | 'education'
  ): ParsedContent {
    switch (templateType) {
      case 'knowledge':
        // 知识卡片：强调标题和要点
        return this.optimizeForKnowledge(parsedContent);
        
      case 'social':
        // 社交卡片：简洁明了，突出视觉效果
        return this.optimizeForSocial(parsedContent);
        
      case 'business':
        // 商务卡片：专业格式，清晰层次
        return this.optimizeForBusiness(parsedContent);
        
      case 'education':
        // 教育卡片：步骤清晰，易于理解
        return this.optimizeForEducation(parsedContent);
        
      default:
        return parsedContent;
    }
  }

  private static optimizeForKnowledge(content: ParsedContent): ParsedContent {
    // 提取关键点，保持列表格式
    const optimizedSections = content.sections.map(section => {
      if (section.type === 'list') {
        // 保持列表的前3个重要项目
        return {
          ...section,
          content: Array.isArray(section.content) 
            ? section.content.slice(0, 3)
            : section.content
        };
      }
      return section;
    });

    return { ...content, sections: optimizedSections };
  }

  private static optimizeForSocial(content: ParsedContent): ParsedContent {
    // 社交媒体优化：简化内容，突出关键信息
    const optimizedSections = content.sections
      .filter(section => section.type !== 'code') // 移除代码块
      .slice(0, 3) // 最多3个段落
      .map(section => {
        if (section.type === 'text' && typeof section.content === 'string') {
          const words = section.content.split(' ');
          if (words.length > 20) {
            return {
              ...section,
              content: words.slice(0, 20).join(' ') + '...'
            };
          }
        }
        return section;
      });

    return { ...content, sections: optimizedSections };
  }

  private static optimizeForBusiness(content: ParsedContent): ParsedContent {
    // 商务格式：保持专业性和完整性
    return content;
  }

  private static optimizeForEducation(content: ParsedContent): ParsedContent {
    // 教育优化：强调步骤和结构
    const optimizedSections = content.sections.map((section, index) => {
      if (section.type === 'list') {
        // 为列表项添加序号
        return {
          ...section,
          content: Array.isArray(section.content) 
            ? section.content.map((item, i) => `${i + 1}. ${item}`)
            : section.content
        };
      }
      return section;
    });

    return { ...content, sections: optimizedSections };
  }
}

// 导出默认解析器实例
export const defaultMarkdownParser = new MarkdownParser();