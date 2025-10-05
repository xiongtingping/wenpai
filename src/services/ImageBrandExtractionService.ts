// @ts-nocheck - 服务文件，允许类型检查宽松
/**
 * 图片品牌元素提取服务
 * 使用AI视觉模型分析图片，提取品牌视觉元素
 */

import {
  ImageExtractionConfig,
  ImageExtractionResult,
  BrandVisualElements,
  BrandVisualLibrary,
  ColorInfo,
  BrandColorPalette,
  LogoVisualFeatures,
  TypographyStyle,
  VisualDesignPattern,
  VisualMood,
  CompositionAnalysis,
} from '../types/brandVisuals';

export class ImageBrandExtractionService {
  private aiModel: any; // AI视觉模型实例

  constructor(aiModel: any) {
    this.aiModel = aiModel;
  }

  /**
   * 从图片提取品牌视觉元素
   */
  async extractFromImage(config: ImageExtractionConfig): Promise<ImageExtractionResult> {
    const startTime = Date.now();

    try {
      // 1. 读取和预处理图片
      const imageData = await this.loadImage(config.imagePath);

      // 2. 构建视觉分析提示词
      const prompt = this.buildVisionPrompt(config);

      // 3. 调用AI视觉模型进行分析
      const analysisResult = await this.analyzeWithAI(imageData, prompt, config);

      // 4. 解析和结构化结果
      const visualElements = await this.parseAnalysisResult(analysisResult, config);

      // 5. 质量验证和评分
      const validatedElements = this.validateAndScore(visualElements, config);

      // 6. 生成优化建议
      const suggestions = this.generateSuggestions(validatedElements, config);

      return {
        success: true,
        visualElements: validatedElements,
        suggestions,
        processingTime: Date.now() - startTime,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '图片分析失败',
        processingTime: Date.now() - startTime,
      };
    }
  }

  /**
   * 批量提取多张图片的视觉元素
   */
  async extractBatch(configs: ImageExtractionConfig[]): Promise<ImageExtractionResult[]> {
    const results = await Promise.all(
      configs.map(config => this.extractFromImage(config))
    );
    return results;
  }

  /**
   * 合并多张图片的视觉元素，构建统一的品牌视觉库
   */
  async consolidateVisualLibrary(
    brandId: string,
    extractionResults: Array<{ result: ImageExtractionResult; config: ImageExtractionConfig }>
  ): Promise<BrandVisualLibrary> {
    const validResults = extractionResults.filter(r => r.result.success && r.result.visualElements);

    if (validResults.length === 0) {
      throw new Error('没有有效的视觉元素可供合并');
    }

    // 1. 合并颜色：提取高频颜色，构建统一色板
    const consolidatedColors = this.consolidateColors(
      validResults.map(r => r.result.visualElements!.colors)
    );

    // 2. 合并Logo特征：以最完整的Logo分析为准
    const consolidatedLogo = this.consolidateLogo(
      validResults
        .map(r => r.result.visualElements!.logo)
        .filter(l => l !== undefined) as LogoVisualFeatures[]
    );

    // 3. 合并字体风格：提取共同特征
    const consolidatedTypography = this.consolidateTypography(
      validResults.map(r => r.result.visualElements!.typography)
    );

    // 4. 合并设计模式：识别重复模式
    const consolidatedPatterns = this.consolidatePatterns(
      validResults.map(r => r.result.visualElements!.designPatterns)
    );

    // 5. 合并视觉情绪：提取共同情绪和调性
    const consolidatedMood = this.consolidateMood(
      validResults.map(r => r.result.visualElements!.mood)
    );

    // 6. 计算质量指标
    const qualityMetrics = this.calculateConsolidatedQuality({
      consolidatedColors,
      consolidatedLogo,
      consolidatedTypography,
      consolidatedPatterns,
      consolidatedMood,
    });

    // 7. 构建品牌视觉库
    const visualLibrary: BrandVisualLibrary = {
      id: this.generateId(),
      brandId,
      consolidatedColors,
      consolidatedLogo,
      consolidatedTypography,
      consolidatedPatterns,
      consolidatedMood,
      sources: validResults.map((r, index) => ({
        imageId: this.generateId(),
        imagePath: r.config.imagePath,
        imageType: r.config.imageType || 'other',
        extractedAt: r.result.visualElements!.metadata.extractedAt,
        contributionWeight: 1 / validResults.length, // 简单平均，可优化为加权
      })),
      qualityMetrics,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      version: 1,
    };

    return visualLibrary;
  }

  /**
   * 增量更新视觉库（上传新图片时）
   */
  async updateVisualLibrary(
    existingLibrary: BrandVisualLibrary,
    newExtractionResult: ImageExtractionResult,
    config: ImageExtractionConfig
  ): Promise<BrandVisualLibrary> {
    if (!newExtractionResult.success || !newExtractionResult.visualElements) {
      throw new Error('无效的提取结果');
    }

    const newElements = newExtractionResult.visualElements;

    // 智能合并策略：新图片权重逐渐降低，保持核心元素稳定
    const totalSources = existingLibrary.sources.length + 1;
    const newWeight = 1 / totalSources;

    // 重新分配权重
    const updatedSources = [
      ...existingLibrary.sources.map(s => ({
        ...s,
        contributionWeight: s.contributionWeight * (1 - newWeight),
      })),
      {
        imageId: this.generateId(),
        imagePath: config.imagePath,
        imageType: config.imageType || 'other',
        extractedAt: newElements.metadata.extractedAt,
        contributionWeight: newWeight,
      },
    ];

    // 增量合并各个维度
    const updatedLibrary: BrandVisualLibrary = {
      ...existingLibrary,
      consolidatedColors: this.mergeColorsIncremental(
        existingLibrary.consolidatedColors,
        newElements.colors,
        newWeight
      ),
      consolidatedLogo: this.mergeLogoIncremental(
        existingLibrary.consolidatedLogo,
        newElements.logo,
        newWeight
      ),
      consolidatedTypography: this.mergeTypographyIncremental(
        existingLibrary.consolidatedTypography,
        newElements.typography,
        newWeight
      ),
      consolidatedPatterns: this.mergePatternsIncremental(
        existingLibrary.consolidatedPatterns,
        newElements.designPatterns,
        newWeight
      ),
      consolidatedMood: this.mergeMoodIncremental(
        existingLibrary.consolidatedMood,
        newElements.mood,
        newWeight
      ),
      sources: updatedSources,
      updatedAt: new Date().toISOString(),
      version: existingLibrary.version + 1,
    };

    // 重新计算质量指标
    updatedLibrary.qualityMetrics = this.calculateConsolidatedQuality({
      consolidatedColors: updatedLibrary.consolidatedColors,
      consolidatedLogo: updatedLibrary.consolidatedLogo,
      consolidatedTypography: updatedLibrary.consolidatedTypography,
      consolidatedPatterns: updatedLibrary.consolidatedPatterns,
      consolidatedMood: updatedLibrary.consolidatedMood,
    });

    return updatedLibrary;
  }

  /**
   * 构建视觉分析AI提示词
   */
  private buildVisionPrompt(config: ImageExtractionConfig): string {
    const depth = config.analysisDepth || 'standard';
    const imageType = config.imageType || 'other';

    let prompt = `你是一位专业的品牌视觉分析专家。请分析这张${this.getImageTypeDescription(imageType)}图片，提取以下品牌视觉元素：\n\n`;

    if (config.extractColors !== false) {
      prompt += `1. **颜色色板**：
- 识别主色、辅色、强调色、中性色
- 提取每个颜色的RGB/HEX值
- 分析颜色在图片中的占比和用途
- 评估颜色组合的和谐度和品牌适配性\n\n`;
    }

    if (config.extractLogo !== false && ['logo', 'banner', 'marketing'].includes(imageType)) {
      prompt += `2. **Logo视觉特征**（如果图片包含Logo）：
- 识别Logo中的形状元素（圆形、方形、三角形等）
- 分析Logo风格（极简、详细、几何、有机等）
- 描述Logo构图和布局方式
- 判断Logo是否包含文字、图标、符号\n\n`;
    }

    if (config.extractTypography !== false) {
      prompt += `3. **字体排版风格**：
- 识别字体粗细（细体、常规、粗体等）
- 判断字体风格（现代、优雅、科技感等）
- 分析文字大小写使用规律
- 评估可读性水平\n\n`;
    }

    if (config.extractPatterns !== false) {
      prompt += `4. **视觉设计模式**：
- 识别重复的图案或纹理（条纹、圆点、几何图形等）
- 分析对称性和平衡感
- 评估留白和空间使用\n\n`;
    }

    if (config.extractMood !== false) {
      prompt += `5. **视觉情绪和氛围**：
- 识别传达的情感（专业、活泼、高端、亲切等）
- 判断整体调性（严肃、轻松、优雅、大胆等）
- 推断品牌个性特征
- 分析目标受众印象\n\n`;
    }

    if (config.extractComposition !== false) {
      prompt += `6. **构图分析**：
- 识别构图布局方式（网格、居中、三分法等）
- 确定视觉焦点位置
- 分析视觉层次结构
- 评估留白使用程度\n\n`;
    }

    prompt += `分析深度：${depth === 'basic' ? '基础' : depth === 'detailed' ? '详细' : '标准'}\n\n`;
    prompt += `请以JSON格式返回结构化的分析结果，包含所有提取的视觉元素及其置信度评分。`;

    return prompt;
  }

  /**
   * 使用AI模型分析图片
   */
  private async analyzeWithAI(
    imageData: any,
    prompt: string,
    config: ImageExtractionConfig
  ): Promise<any> {
    // 调用AI视觉模型（如Claude 3 Vision, GPT-4 Vision等）
    const response = await this.aiModel.analyzeImage({
      image: imageData,
      prompt: prompt,
      responseFormat: 'json',
    });

    return response;
  }

  /**
   * 解析AI分析结果
   */
  private async parseAnalysisResult(
    analysisResult: any,
    config: ImageExtractionConfig
  ): Promise<BrandVisualElements> {
    // 从AI返回的JSON中提取并结构化数据
    const parsed = typeof analysisResult === 'string'
      ? JSON.parse(analysisResult)
      : analysisResult;

    // 这里需要根据实际AI模型的返回格式进行适配
    // 以下是示例结构

    const visualElements: BrandVisualElements = {
      colors: parsed.colors || this.getDefaultColorPalette(),
      logo: parsed.logo,
      typography: parsed.typography || this.getDefaultTypography(),
      designPatterns: parsed.designPatterns || this.getDefaultPatterns(),
      mood: parsed.mood || this.getDefaultMood(),
      composition: parsed.composition || this.getDefaultComposition(),
      metadata: {
        extractedFrom: config.imagePath,
        extractedAt: new Date().toISOString(),
        imageType: config.imageType || 'other',
        dimensions: parsed.dimensions || { width: 0, height: 0 },
        overallQuality: 0, // 后续计算
        confidence: parsed.confidence || 0.5,
      },
    };

    return visualElements;
  }

  /**
   * 合并颜色色板
   */
  private consolidateColors(colorPalettes: BrandColorPalette[]): BrandColorPalette {
    // 1. 收集所有颜色
    const allPrimary: ColorInfo[] = [];
    const allSecondary: ColorInfo[] = [];
    const allAccent: ColorInfo[] = [];
    const allNeutral: ColorInfo[] = [];

    colorPalettes.forEach(palette => {
      allPrimary.push(...palette.primary);
      allSecondary.push(...palette.secondary);
      allAccent.push(...palette.accent);
      allNeutral.push(...palette.neutral);
    });

    // 2. 颜色聚类：相似颜色合并，保留高频颜色
    const consolidatedPrimary = this.clusterAndMergeColors(allPrimary, 3); // 最多3个主色
    const consolidatedSecondary = this.clusterAndMergeColors(allSecondary, 5); // 最多5个辅色
    const consolidatedAccent = this.clusterAndMergeColors(allAccent, 3); // 最多3个强调色
    const consolidatedNeutral = this.clusterAndMergeColors(allNeutral, 4); // 最多4个中性色

    return {
      primary: consolidatedPrimary,
      secondary: consolidatedSecondary,
      accent: consolidatedAccent,
      neutral: consolidatedNeutral,
    };
  }

  /**
   * 颜色聚类和合并（简化版实现）
   */
  private clusterAndMergeColors(colors: ColorInfo[], maxColors: number): ColorInfo[] {
    if (colors.length === 0) return [];

    // 简单实现：按出现频率和置信度排序，取前N个
    // 实际应用中可使用K-means等聚类算法
    const colorMap = new Map<string, ColorInfo & { count: number }>();

    colors.forEach(color => {
      const key = color.hex.toLowerCase();
      if (colorMap.has(key)) {
        const existing = colorMap.get(key)!;
        existing.count++;
        existing.confidence = Math.max(existing.confidence, color.confidence);
      } else {
        colorMap.set(key, { ...color, count: 1 });
      }
    });

    const sortedColors = Array.from(colorMap.values())
      .sort((a, b) => b.count * b.confidence - a.count * a.confidence)
      .slice(0, maxColors)
      .map(({ count, ...color }) => color);

    return sortedColors;
  }

  /**
   * 合并Logo特征
   */
  private consolidateLogo(logos: LogoVisualFeatures[]): LogoVisualFeatures | undefined {
    if (logos.length === 0) return undefined;

    // 选择最完整的Logo分析结果（包含最多信息的）
    const bestLogo = logos.reduce((best, current) => {
      const bestScore = (best.shapes.length * 2) + best.style.characteristics.length + best.composition.elements.length;
      const currentScore = (current.shapes.length * 2) + current.style.characteristics.length + current.composition.elements.length;
      return currentScore > bestScore ? current : best;
    });

    return bestLogo;
  }

  /**
   * 合并字体风格
   */
  private consolidateTypography(typographies: TypographyStyle[]): TypographyStyle {
    // 提取共同的字体特征
    const allCharacteristics: string[] = [];
    const fontStyles: TypographyStyle['fontStyle'] = [];

    typographies.forEach(typo => {
      allCharacteristics.push(...typo.characteristics);
      fontStyles.push(...typo.fontStyle);
    });

    // 去重并按频率排序
    const characteristicFreq = this.getFrequency(allCharacteristics);
    const topCharacteristics = Array.from(characteristicFreq.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([char]) => char);

    return {
      fontFamily: typographies[0].fontFamily, // 取第一个作为参考
      fontStyle: fontStyles,
      characteristics: topCharacteristics,
      readability: this.getMostFrequent(typographies.map(t => t.readability)) as any,
    };
  }

  /**
   * 合并设计模式
   */
  private consolidatePatterns(patterns: VisualDesignPattern[]): VisualDesignPattern {
    const allPatterns: VisualDesignPattern['patterns'] = [];

    patterns.forEach(p => {
      allPatterns.push(...p.patterns);
    });

    // 提取高频模式
    const patternFreq = new Map<string, typeof allPatterns[0] & { count: number }>();

    allPatterns.forEach(pattern => {
      const key = pattern.type;
      if (patternFreq.has(key)) {
        patternFreq.get(key)!.count++;
      } else {
        patternFreq.set(key, { ...pattern, count: 1 });
      }
    });

    const consolidatedPatterns = Array.from(patternFreq.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 3)
      .map(({ count, ...pattern }) => pattern);

    return {
      patterns: consolidatedPatterns,
      symmetry: this.getMostFrequent(patterns.map(p => p.symmetry)) as any,
      balance: this.getMostFrequent(patterns.map(p => p.balance)) as any,
      spacing: this.getMostFrequent(patterns.map(p => p.spacing)) as any,
    };
  }

  /**
   * 合并视觉情绪
   */
  private consolidateMood(moods: VisualMood[]): VisualMood {
    const allEmotions: string[] = [];
    const allPersonality: string[] = [];

    moods.forEach(mood => {
      allEmotions.push(...mood.emotions);
      allPersonality.push(...mood.personality);
    });

    const emotionFreq = this.getFrequency(allEmotions);
    const personalityFreq = this.getFrequency(allPersonality);

    const topEmotions = Array.from(emotionFreq.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([emotion]) => emotion);

    const topPersonality = Array.from(personalityFreq.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([p]) => p);

    return {
      emotions: topEmotions,
      tone: this.getMostFrequent(moods.map(m => m.tone)) as any,
      personality: topPersonality,
      targetAudience: moods[0].targetAudience,
    };
  }

  /**
   * 增量合并颜色
   */
  private mergeColorsIncremental(
    existing: BrandColorPalette,
    newColors: BrandColorPalette,
    newWeight: number
  ): BrandColorPalette {
    // 简化实现：如果新颜色置信度高且不在现有色板中，则添加
    const mergedPrimary = this.mergeColorArray(existing.primary, newColors.primary, newWeight, 3);
    const mergedSecondary = this.mergeColorArray(existing.secondary, newColors.secondary, newWeight, 5);
    const mergedAccent = this.mergeColorArray(existing.accent, newColors.accent, newWeight, 3);
    const mergedNeutral = this.mergeColorArray(existing.neutral, newColors.neutral, newWeight, 4);

    return {
      primary: mergedPrimary,
      secondary: mergedSecondary,
      accent: mergedAccent,
      neutral: mergedNeutral,
    };
  }

  private mergeColorArray(
    existing: ColorInfo[],
    newColors: ColorInfo[],
    newWeight: number,
    maxCount: number
  ): ColorInfo[] {
    const merged = [...existing];

    newColors.forEach(newColor => {
      const existingIndex = merged.findIndex(c =>
        this.colorDistance(c.rgb, newColor.rgb) < 30 // 颜色相似度阈值
      );

      if (existingIndex >= 0) {
        // 更新现有颜色的置信度
        merged[existingIndex].confidence =
          merged[existingIndex].confidence * (1 - newWeight) + newColor.confidence * newWeight;
      } else if (merged.length < maxCount && newColor.confidence > 0.6) {
        // 添加新颜色（如果置信度足够高）
        merged.push(newColor);
      }
    });

    return merged.slice(0, maxCount);
  }

  /**
   * 计算颜色距离（欧氏距离）
   */
  private colorDistance(rgb1: { r: number; g: number; b: number }, rgb2: { r: number; g: number; b: number }): number {
    return Math.sqrt(
      Math.pow(rgb1.r - rgb2.r, 2) +
      Math.pow(rgb1.g - rgb2.g, 2) +
      Math.pow(rgb1.b - rgb2.b, 2)
    );
  }

  /**
   * 增量合并其他元素（简化实现）
   */
  private mergeLogoIncremental(
    existing: LogoVisualFeatures | undefined,
    newLogo: LogoVisualFeatures | undefined,
    newWeight: number
  ): LogoVisualFeatures | undefined {
    if (!existing) return newLogo;
    if (!newLogo) return existing;
    // 保留更完整的Logo分析
    return existing.shapes.length >= newLogo.shapes.length ? existing : newLogo;
  }

  private mergeTypographyIncremental(
    existing: TypographyStyle,
    newTypo: TypographyStyle,
    newWeight: number
  ): TypographyStyle {
    // 合并特征，保留高频项
    const mergedCharacteristics = [...new Set([...existing.characteristics, ...newTypo.characteristics])].slice(0, 5);
    return {
      ...existing,
      characteristics: mergedCharacteristics,
      fontStyle: [...existing.fontStyle, ...newTypo.fontStyle],
    };
  }

  private mergePatternsIncremental(
    existing: VisualDesignPattern,
    newPatterns: VisualDesignPattern,
    newWeight: number
  ): VisualDesignPattern {
    return {
      patterns: [...existing.patterns, ...newPatterns.patterns].slice(0, 5),
      symmetry: existing.symmetry, // 保持现有
      balance: existing.balance,
      spacing: existing.spacing,
    };
  }

  private mergeMoodIncremental(
    existing: VisualMood,
    newMood: VisualMood,
    newWeight: number
  ): VisualMood {
    const mergedEmotions = [...new Set([...existing.emotions, ...newMood.emotions])].slice(0, 5);
    const mergedPersonality = [...new Set([...existing.personality, ...newMood.personality])].slice(0, 5);

    return {
      emotions: mergedEmotions,
      tone: existing.tone, // 保持现有基调
      personality: mergedPersonality,
      targetAudience: existing.targetAudience,
    };
  }

  /**
   * 计算合并后的质量指标
   */
  private calculateConsolidatedQuality(consolidated: {
    consolidatedColors: BrandColorPalette;
    consolidatedLogo?: LogoVisualFeatures;
    consolidatedTypography: TypographyStyle;
    consolidatedPatterns: VisualDesignPattern;
    consolidatedMood: VisualMood;
  }): BrandVisualLibrary['qualityMetrics'] {
    // 颜色一致性：基于颜色数量和置信度
    const colorCount =
      consolidated.consolidatedColors.primary.length +
      consolidated.consolidatedColors.secondary.length +
      consolidated.consolidatedColors.accent.length;
    const colorConsistency = Math.min(100, (colorCount / 10) * 100);

    // 风格一致性：基于元素完整度
    const hasLogo = consolidated.consolidatedLogo ? 25 : 0;
    const hasTypo = consolidated.consolidatedTypography.characteristics.length > 0 ? 25 : 0;
    const hasPatterns = consolidated.consolidatedPatterns.patterns.length > 0 ? 25 : 0;
    const hasMood = consolidated.consolidatedMood.emotions.length > 0 ? 25 : 0;
    const styleConsistency = hasLogo + hasTypo + hasPatterns + hasMood;

    // 整体完整度
    const overallCompleteness = (colorConsistency + styleConsistency) / 2;

    // 整体置信度（简化计算）
    const confidence = Math.min(1, overallCompleteness / 100);

    return {
      colorConsistency,
      styleConsistency,
      overallCompleteness,
      confidence,
    };
  }

  /**
   * 验证和评分
   */
  private validateAndScore(
    elements: BrandVisualElements,
    config: ImageExtractionConfig
  ): BrandVisualElements {
    // 计算整体质量评分
    let qualityScore = 0;
    let totalWeight = 0;

    if (config.extractColors !== false) {
      const colorScore = this.scoreColorPalette(elements.colors);
      qualityScore += colorScore * 0.3;
      totalWeight += 0.3;
    }

    if (config.extractLogo !== false && elements.logo) {
      const logoScore = this.scoreLogoFeatures(elements.logo);
      qualityScore += logoScore * 0.25;
      totalWeight += 0.25;
    }

    if (config.extractTypography !== false) {
      const typoScore = this.scoreTypography(elements.typography);
      qualityScore += typoScore * 0.15;
      totalWeight += 0.15;
    }

    if (config.extractPatterns !== false) {
      const patternScore = this.scorePatterns(elements.designPatterns);
      qualityScore += patternScore * 0.15;
      totalWeight += 0.15;
    }

    if (config.extractMood !== false) {
      const moodScore = this.scoreMood(elements.mood);
      qualityScore += moodScore * 0.15;
      totalWeight += 0.15;
    }

    elements.metadata.overallQuality = totalWeight > 0 ? qualityScore / totalWeight : 0;

    return elements;
  }

  /**
   * 评分方法
   */
  private scoreColorPalette(palette: BrandColorPalette): number {
    const totalColors =
      palette.primary.length +
      palette.secondary.length +
      palette.accent.length +
      palette.neutral.length;

    const avgConfidence =
      [...palette.primary, ...palette.secondary, ...palette.accent, ...palette.neutral]
        .reduce((sum, c) => sum + c.confidence, 0) / totalColors;

    return Math.min(100, (totalColors / 10) * 50 + avgConfidence * 50);
  }

  private scoreLogoFeatures(logo: LogoVisualFeatures): number {
    const shapeScore = Math.min(100, logo.shapes.length * 20);
    const styleScore = logo.style.characteristics.length * 15;
    const compositionScore = logo.composition.elements.length * 15;
    return Math.min(100, shapeScore + styleScore + compositionScore);
  }

  private scoreTypography(typo: TypographyStyle): number {
    return typo.characteristics.length * 20;
  }

  private scorePatterns(patterns: VisualDesignPattern): number {
    return patterns.patterns.length * 25;
  }

  private scoreMood(mood: VisualMood): number {
    return (mood.emotions.length + mood.personality.length) * 10;
  }

  /**
   * 生成优化建议
   */
  private generateSuggestions(
    elements: BrandVisualElements,
    config: ImageExtractionConfig
  ): string[] {
    const suggestions: string[] = [];

    if (elements.colors.primary.length === 0) {
      suggestions.push('建议上传包含品牌主色的图片以完善色板');
    }

    if (!elements.logo && config.imageType === 'logo') {
      suggestions.push('未能识别Logo元素，建议上传更清晰的Logo图片');
    }

    if (elements.typography.characteristics.length < 3) {
      suggestions.push('字体特征识别不足，建议上传包含更多文字内容的图片');
    }

    if (elements.metadata.overallQuality < 60) {
      suggestions.push('整体提取质量偏低，建议上传更高质量或更具代表性的品牌图片');
    }

    return suggestions;
  }

  /**
   * 工具方法
   */
  private async loadImage(imagePath: string): Promise<any> {
    // 实际实现中需要读取图片文件
    // 返回适合AI模型的图片数据格式
    return { path: imagePath };
  }

  private getFrequency(items: string[]): Map<string, number> {
    const freq = new Map<string, number>();
    items.forEach(item => {
      freq.set(item, (freq.get(item) || 0) + 1);
    });
    return freq;
  }

  private getMostFrequent<T>(items: T[]): T {
    const freq = new Map<T, number>();
    items.forEach(item => {
      freq.set(item, (freq.get(item) || 0) + 1);
    });
    return Array.from(freq.entries()).sort((a, b) => b[1] - a[1])[0][0];
  }

  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private getImageTypeDescription(type: string): string {
    const descriptions: Record<string, string> = {
      logo: 'Logo',
      banner: '横幅广告',
      product: '产品',
      marketing: '营销物料',
      social: '社交媒体',
      other: '品牌',
    };
    return descriptions[type] || '品牌';
  }

  private getDefaultColorPalette(): BrandColorPalette {
    return {
      primary: [],
      secondary: [],
      accent: [],
      neutral: [],
    };
  }

  private getDefaultTypography(): TypographyStyle {
    return {
      fontFamily: [],
      fontStyle: [],
      characteristics: [],
      readability: 'medium',
    };
  }

  private getDefaultPatterns(): VisualDesignPattern {
    return {
      patterns: [],
      symmetry: 'symmetric',
      balance: 'balanced',
      spacing: 'moderate',
    };
  }

  private getDefaultMood(): VisualMood {
    return {
      emotions: [],
      tone: 'calm',
      personality: [],
    };
  }

  private getDefaultComposition(): CompositionAnalysis {
    return {
      layout: 'centered',
      focusPoint: { x: 0.5, y: 0.5 },
      visualHierarchy: [],
      whitespace: 'moderate',
    };
  }
}
