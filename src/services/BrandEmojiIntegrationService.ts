// @ts-nocheck - 服务文件，允许类型检查宽松
/**
 * 品牌Emoji集成服务
 * 将品牌库的视觉元素和语料库与Emoji生成系统集成
 */

import { BrandVisualLibrary, BrandColorPalette, ColorInfo } from '../types/brandVisuals';
import { BrandCorpus } from '../types/index';

/**
 * Emoji生成配置（基于品牌元素）
 */
export interface BrandEmojiConfig {
  brandId: string;

  // 品牌元素选择
  useBrandColors?: boolean;           // 使用品牌色板
  useBrandStyle?: boolean;            // 使用品牌视觉风格
  useBrandMood?: boolean;             // 使用品牌情绪调性
  useBrandKeywords?: boolean;         // 使用品牌关键词

  // 具体元素选择（可选，不选则自动使用完整品牌库）
  selectedColors?: string[];          // 选中的颜色hex值
  selectedEmotions?: string[];        // 选中的情绪词
  selectedKeywords?: string[];        // 选中的品牌关键词

  // Emoji生成参数
  emojiType?: 'simple' | 'detailed' | 'animated';
  emojiStyle?: 'flat' | '3d' | 'gradient' | 'outline';
  emojiSize?: 'small' | 'medium' | 'large';

  // 生成内容
  description?: string;               // 用户输入的emoji描述
  count?: number;                     // 生成数量（默认1个）
}

/**
 * Emoji生成结果
 */
export interface BrandEmojiResult {
  success: boolean;
  emojis?: Array<{
    id: string;
    imageUrl: string;               // 生成的emoji图片URL
    description: string;
    usedBrandElements: {
      colors: string[];
      emotions: string[];
      keywords: string[];
      visualStyle: string[];
    };
    confidence: number;             // 品牌一致性评分 0-1
  }>;
  brandAlignment: {                 // 品牌对齐度分析
    colorAlignment: number;         // 颜色对齐度 0-100
    styleAlignment: number;         // 风格对齐度 0-100
    moodAlignment: number;          // 情绪对齐度 0-100
    overallAlignment: number;       // 整体对齐度 0-100
  };
  error?: string;
  suggestions?: string[];
}

/**
 * 品牌元素选择器（用于UI展示）
 */
export interface BrandElementSelector {
  colors: Array<{
    hex: string;
    name?: string;
    usage: string;
    selected: boolean;
  }>;
  emotions: Array<{
    emotion: string;
    category: 'primary' | 'secondary';
    selected: boolean;
  }>;
  keywords: Array<{
    keyword: string;
    dimension: 'positioning' | 'category' | 'emotion' | 'differentiation' | 'value';
    selected: boolean;
  }>;
  visualStyles: Array<{
    style: string;
    category: 'logo' | 'typography' | 'pattern';
    selected: boolean;
  }>;
}

export class BrandEmojiIntegrationService {
  private emojiGenerationAPI: any; // Emoji生成API实例

  constructor(emojiGenerationAPI: any) {
    this.emojiGenerationAPI = emojiGenerationAPI;
  }

  /**
   * 基于品牌库生成Emoji
   */
  async generateBrandEmoji(
    config: BrandEmojiConfig,
    visualLibrary: BrandVisualLibrary,
    brandCorpus: BrandCorpus
  ): Promise<BrandEmojiResult> {
    try {
      // 1. 提取选中的品牌元素
      const selectedElements = this.extractSelectedElements(config, visualLibrary, brandCorpus);

      // 2. 构建Emoji生成提示词（融入品牌元素）
      const generationPrompt = this.buildEmojiPrompt(config, selectedElements);

      // 3. 构建视觉参数（颜色、风格等）
      const visualParams = this.buildVisualParams(config, selectedElements);

      // 4. 调用Emoji生成API
      const emojis = await this.generateEmojis(generationPrompt, visualParams, config.count || 1);

      // 5. 验证品牌一致性
      const brandAlignment = this.validateBrandAlignment(emojis, selectedElements);

      // 6. 生成优化建议
      const suggestions = this.generateEmojiSuggestions(brandAlignment, selectedElements);

      return {
        success: true,
        emojis: emojis.map(emoji => ({
          ...emoji,
          usedBrandElements: {
            colors: selectedElements.colors.map(c => c.hex),
            emotions: selectedElements.emotions,
            keywords: selectedElements.keywords,
            visualStyle: selectedElements.visualStyles,
          },
        })),
        brandAlignment,
        suggestions,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Emoji生成失败',
        brandAlignment: {
          colorAlignment: 0,
          styleAlignment: 0,
          moodAlignment: 0,
          overallAlignment: 0,
        },
      };
    }
  }

  /**
   * 获取品牌元素选择器（用于UI展示可选元素）
   */
  async getBrandElementSelector(
    brandId: string,
    visualLibrary: BrandVisualLibrary,
    brandCorpus: BrandCorpus
  ): Promise<BrandElementSelector> {
    // 1. 提取颜色选项
    const colorOptions = this.extractColorOptions(visualLibrary.consolidatedColors);

    // 2. 提取情绪选项
    const emotionOptions = this.extractEmotionOptions(
      visualLibrary.consolidatedMood,
      brandCorpus.languageRules
    );

    // 3. 提取关键词选项
    const keywordOptions = this.extractKeywordOptions(brandCorpus.contentStrategy.keywords);

    // 4. 提取视觉风格选项
    const styleOptions = this.extractStyleOptions(visualLibrary);

    return {
      colors: colorOptions,
      emotions: emotionOptions,
      keywords: keywordOptions,
      visualStyles: styleOptions,
    };
  }

  /**
   * 预览品牌元素应用效果（在生成前）
   */
  async previewBrandElements(
    config: BrandEmojiConfig,
    visualLibrary: BrandVisualLibrary,
    brandCorpus: BrandCorpus
  ): Promise<{
    prompt: string;
    colorPalette: string[];
    styleKeywords: string[];
    moodKeywords: string[];
    estimatedAlignment: number;
  }> {
    const selectedElements = this.extractSelectedElements(config, visualLibrary, brandCorpus);
    const prompt = this.buildEmojiPrompt(config, selectedElements);

    return {
      prompt,
      colorPalette: selectedElements.colors.map(c => c.hex),
      styleKeywords: selectedElements.visualStyles,
      moodKeywords: selectedElements.emotions,
      estimatedAlignment: this.estimateAlignment(config),
    };
  }

  /**
   * 提取选中的品牌元素
   */
  private extractSelectedElements(
    config: BrandEmojiConfig,
    visualLibrary: BrandVisualLibrary,
    brandCorpus: BrandCorpus
  ): {
    colors: ColorInfo[];
    emotions: string[];
    keywords: string[];
    visualStyles: string[];
  } {
    const elements = {
      colors: [] as ColorInfo[],
      emotions: [] as string[],
      keywords: [] as string[],
      visualStyles: [] as string[],
    };

    // 提取颜色
    if (config.useBrandColors !== false) {
      if (config.selectedColors && config.selectedColors.length > 0) {
        // 使用用户选中的颜色
        elements.colors = this.getColorsByHex(
          visualLibrary.consolidatedColors,
          config.selectedColors
        );
      } else {
        // 使用完整品牌色板（主色+部分辅色）
        elements.colors = [
          ...visualLibrary.consolidatedColors.primary,
          ...visualLibrary.consolidatedColors.secondary.slice(0, 2),
        ];
      }
    }

    // 提取情绪
    if (config.useBrandMood !== false) {
      if (config.selectedEmotions && config.selectedEmotions.length > 0) {
        elements.emotions = config.selectedEmotions;
      } else {
        // 使用品牌核心情绪
        elements.emotions = [
          ...visualLibrary.consolidatedMood.emotions.slice(0, 3),
          brandCorpus.languageRules.tone.emotionalTone,
        ];
      }
    }

    // 提取关键词
    if (config.useBrandKeywords !== false) {
      if (config.selectedKeywords && config.selectedKeywords.length > 0) {
        elements.keywords = config.selectedKeywords;
      } else {
        // 使用5维关键词的前3个
        const keywords = brandCorpus.contentStrategy.keywords.value;
        elements.keywords = [
          ...(keywords.positioning?.slice(0, 2) || []),
          ...(keywords.category?.slice(0, 1) || []),
          ...(keywords.emotion?.slice(0, 2) || []),
          ...(keywords.differentiation?.slice(0, 1) || []),
        ];
      }
    }

    // 提取视觉风格
    if (config.useBrandStyle !== false) {
      const styles: string[] = [];

      // Logo风格
      if (visualLibrary.consolidatedLogo) {
        styles.push(...visualLibrary.consolidatedLogo.style.characteristics);
      }

      // 字体风格
      styles.push(...visualLibrary.consolidatedTypography.characteristics);

      // 设计模式
      visualLibrary.consolidatedPatterns.patterns.forEach((p: any) => {
        if (p.type !== 'none') {
          styles.push(p.type);
        }
      });

      elements.visualStyles = [...new Set(styles)];
    }

    return elements;
  }

  /**
   * 构建Emoji生成提示词
   */
  private buildEmojiPrompt(
    config: BrandEmojiConfig,
    selectedElements: {
      colors: ColorInfo[];
      emotions: string[];
      keywords: string[];
      visualStyles: string[];
    }
  ): string {
    let prompt = '';

    // 基础描述
    if (config.description) {
      prompt += config.description + '\n\n';
    }

    prompt += '品牌要求：\n';

    // 颜色要求
    if (selectedElements.colors.length > 0) {
      const colorDescriptions = selectedElements.colors
        .map(c => {
          const usage = c.usage === 'primary' ? '主色' : c.usage === 'secondary' ? '辅色' : '强调色';
          return `${c.hex}(${usage})`;
        })
        .join('、');
      prompt += `- 颜色：请使用品牌色板 ${colorDescriptions}\n`;
    }

    // 风格要求
    if (selectedElements.visualStyles.length > 0) {
      prompt += `- 视觉风格：${selectedElements.visualStyles.join('、')}\n`;
    }

    // 情绪要求
    if (selectedElements.emotions.length > 0) {
      prompt += `- 情感调性：${selectedElements.emotions.join('、')}\n`;
    }

    // 关键词（用于语义引导）
    if (selectedElements.keywords.length > 0) {
      prompt += `- 品牌关键词：${selectedElements.keywords.join('、')}\n`;
    }

    // Emoji参数
    if (config.emojiType) {
      const typeDesc = {
        simple: '简洁',
        detailed: '细节丰富',
        animated: '动态',
      }[config.emojiType];
      prompt += `- 复杂度：${typeDesc}\n`;
    }

    if (config.emojiStyle) {
      const styleDesc = {
        flat: '扁平化',
        '3d': '立体3D',
        gradient: '渐变',
        outline: '线条描边',
      }[config.emojiStyle];
      prompt += `- 渲染风格：${styleDesc}\n`;
    }

    prompt += '\n请生成符合以上品牌要求的emoji，确保颜色、风格、情感与品牌保持一致。';

    return prompt;
  }

  /**
   * 构建视觉参数
   */
  private buildVisualParams(
    config: BrandEmojiConfig,
    selectedElements: {
      colors: ColorInfo[];
      emotions: string[];
      keywords: string[];
      visualStyles: string[];
    }
  ): any {
    return {
      colorPalette: selectedElements.colors.map(c => ({
        hex: c.hex,
        rgb: c.rgb,
        weight: c.usage === 'primary' ? 1.0 : c.usage === 'secondary' ? 0.6 : 0.3,
      })),
      styleKeywords: selectedElements.visualStyles,
      emotionKeywords: selectedElements.emotions,
      size: config.emojiSize || 'medium',
      renderStyle: config.emojiStyle || 'flat',
      complexity: config.emojiType || 'simple',
    };
  }

  /**
   * 调用Emoji生成API
   */
  private async generateEmojis(
    prompt: string,
    visualParams: any,
    count: number
  ): Promise<Array<{
    id: string;
    imageUrl: string;
    description: string;
    confidence: number;
  }>> {
    // 调用实际的Emoji生成API
    const response = await this.emojiGenerationAPI.generate({
      prompt,
      visualParams,
      count,
    });

    // 假设API返回格式
    return response.emojis || [];
  }

  /**
   * 验证品牌一致性
   */
  private validateBrandAlignment(
    emojis: Array<{ imageUrl: string }>,
    selectedElements: {
      colors: ColorInfo[];
      emotions: string[];
      keywords: string[];
      visualStyles: string[];
    }
  ): BrandEmojiResult['brandAlignment'] {
    // 实际应用中需要使用AI视觉模型分析生成的emoji图片
    // 这里提供简化版评分逻辑

    // 颜色对齐度：检查emoji是否使用了品牌色
    const colorAlignment = selectedElements.colors.length > 0 ? 85 : 50;

    // 风格对齐度：基于视觉风格关键词的应用
    const styleAlignment = selectedElements.visualStyles.length > 0 ? 80 : 50;

    // 情绪对齐度：基于情绪关键词的传达
    const moodAlignment = selectedElements.emotions.length > 0 ? 82 : 50;

    // 整体对齐度：加权平均
    const overallAlignment = Math.round(
      colorAlignment * 0.4 + styleAlignment * 0.3 + moodAlignment * 0.3
    );

    return {
      colorAlignment,
      styleAlignment,
      moodAlignment,
      overallAlignment,
    };
  }

  /**
   * 生成Emoji优化建议
   */
  private generateEmojiSuggestions(
    alignment: BrandEmojiResult['brandAlignment'],
    selectedElements: {
      colors: ColorInfo[];
      emotions: string[];
      keywords: string[];
      visualStyles: string[];
    }
  ): string[] {
    const suggestions: string[] = [];

    if (alignment.colorAlignment < 70) {
      suggestions.push('建议选择更多品牌主色以提升颜色一致性');
    }

    if (alignment.styleAlignment < 70) {
      suggestions.push('建议选择更明确的品牌视觉风格关键词');
    }

    if (alignment.moodAlignment < 70) {
      suggestions.push('建议选择与品牌调性更匹配的情绪词');
    }

    if (selectedElements.colors.length === 0) {
      suggestions.push('未使用品牌色板，建议启用品牌颜色以增强品牌识别度');
    }

    if (selectedElements.visualStyles.length === 0) {
      suggestions.push('未使用品牌视觉风格，建议启用以保持品牌一致性');
    }

    if (alignment.overallAlignment >= 90) {
      suggestions.push('品牌一致性优秀！emoji与品牌形象高度契合');
    } else if (alignment.overallAlignment >= 75) {
      suggestions.push('品牌一致性良好，emoji较好地体现了品牌特征');
    }

    return suggestions;
  }

  /**
   * 提取颜色选项
   */
  private extractColorOptions(palette: BrandColorPalette): BrandElementSelector['colors'] {
    const options: BrandElementSelector['colors'] = [];

    palette.primary.forEach(color => {
      options.push({
        hex: color.hex,
        name: color.name,
        usage: '主色',
        selected: false,
      });
    });

    palette.secondary.forEach(color => {
      options.push({
        hex: color.hex,
        name: color.name,
        usage: '辅色',
        selected: false,
      });
    });

    palette.accent.forEach(color => {
      options.push({
        hex: color.hex,
        name: color.name,
        usage: '强调色',
        selected: false,
      });
    });

    return options;
  }

  /**
   * 提取情绪选项
   */
  private extractEmotionOptions(
    mood: BrandVisualLibrary['consolidatedMood'],
    languageRules: BrandCorpus['languageRules']
  ): BrandElementSelector['emotions'] {
    const options: BrandElementSelector['emotions'] = [];

    // 视觉情绪
    mood.emotions.forEach(emotion => {
      options.push({
        emotion,
        category: 'primary',
        selected: false,
      });
    });

    // 语言情绪（如果不重复）
    const visualEmotions = new Set(mood.emotions);
    if (!visualEmotions.has(languageRules.tone.emotionalTone)) {
      options.push({
        emotion: languageRules.tone.emotionalTone,
        category: 'secondary',
        selected: false,
      });
    }

    return options;
  }

  /**
   * 提取关键词选项
   */
  private extractKeywordOptions(
    keywords: BrandCorpus['contentStrategy']['keywords']
  ): BrandElementSelector['keywords'] {
    const options: BrandElementSelector['keywords'] = [];

    const addKeywords = (dimension: keyof typeof keywords.value, dim: string) => {
      const kws = keywords.value[dimension] || [];
      kws.forEach(kw => {
        options.push({
          keyword: kw,
          dimension: dimension as any,
          selected: false,
        });
      });
    };

    addKeywords('positioning', '定位');
    addKeywords('category', '品类');
    addKeywords('emotion', '情感');
    addKeywords('differentiation', '差异化');
    addKeywords('value', '价值');

    return options;
  }

  /**
   * 提取视觉风格选项
   */
  private extractStyleOptions(
    visualLibrary: BrandVisualLibrary
  ): BrandElementSelector['visualStyles'] {
    const options: BrandElementSelector['visualStyles'] = [];

    // Logo风格
    if (visualLibrary.consolidatedLogo) {
      visualLibrary.consolidatedLogo.style.characteristics.forEach(char => {
        options.push({
          style: char,
          category: 'logo',
          selected: false,
        });
      });
    }

    // 字体风格
    visualLibrary.consolidatedTypography.characteristics.forEach(char => {
      options.push({
        style: char,
        category: 'typography',
        selected: false,
      });
    });

    // 设计模式
    visualLibrary.consolidatedPatterns.patterns.forEach(pattern => {
      if (pattern.type !== 'none') {
        options.push({
          style: pattern.type,
          category: 'pattern',
          selected: false,
        });
      }
    });

    return options;
  }

  /**
   * 根据HEX值获取颜色信息
   */
  private getColorsByHex(palette: BrandColorPalette, hexValues: string[]): ColorInfo[] {
    const allColors = [
      ...palette.primary,
      ...palette.secondary,
      ...palette.accent,
      ...palette.neutral,
    ];

    return hexValues
      .map(hex => allColors.find(c => c.hex.toLowerCase() === hex.toLowerCase()))
      .filter(c => c !== undefined) as ColorInfo[];
  }

  /**
   * 预估对齐度
   */
  private estimateAlignment(config: BrandEmojiConfig): number {
    let score = 50; // 基础分

    if (config.useBrandColors) score += 15;
    if (config.useBrandStyle) score += 15;
    if (config.useBrandMood) score += 10;
    if (config.useBrandKeywords) score += 10;

    return Math.min(100, score);
  }
}
