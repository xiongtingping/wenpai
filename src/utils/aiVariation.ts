/**
 * AI内容差异化工具模块
 * 
 * 🎯 目标：
 * - 提供统一的差异化逻辑，避免代码重复
 * - 确保重新生成的内容与之前的内容有明显差异
 * - 支持多种差异化策略和风格变化
 * 
 * 📌 遵循CLAUDE.md规则：
 * - 单一真相源（SSOT）
 * - 避免代码重复
 * - 易于维护和扩展
 */

/**
 * 差异化级别
 */
export type VariationLevel = 'slight' | 'moderate' | 'significant';

/**
 * 风格变化类型
 */
export type StyleVariation = 'tone' | 'structure' | 'vocabulary' | 'approach';

/**
 * 差异化选项
 */
export interface VariationOptions {
  /** 重新生成种子，用于标识不同版本 */
  regenerationSeed?: string;
  /** 差异化级别 */
  variationLevel?: VariationLevel;
  /** 风格变化类型 */
  styleVariation?: StyleVariation;
  /** 基础温度参数 */
  baseTemperature?: number;
}

/**
 * 差异化结果
 */
export interface VariationResult {
  /** 增强后的提示词 */
  prompt: string;
  /** 增强后的系统提示词 */
  systemPrompt?: string;
  /** 调整后的温度参数 */
  temperature: number;
}

/**
 * 应用差异化逻辑
 * 
 * @param originalPrompt 原始提示词
 * @param originalSystemPrompt 原始系统提示词
 * @param options 差异化选项
 * @returns 差异化结果
 * 
 * @example
 * ```typescript
 * const result = applyVariationLogic(
 *   '请生成一篇文章',
 *   '你是专业作家',
 *   {
 *     regenerationSeed: 'version-a',
 *     variationLevel: 'moderate',
 *     styleVariation: 'structure',
 *     baseTemperature: 0.7
 *   }
 * );
 * ```
 */
export function applyVariationLogic(
  originalPrompt: string,
  originalSystemPrompt?: string,
  options: VariationOptions = {}
): VariationResult {
  const {
    regenerationSeed,
    variationLevel = 'moderate',
    styleVariation = 'tone',
    baseTemperature = 0.7
  } = options;

  // 根据变化程度调整温度
  const temperatureAdjustments: Record<VariationLevel, number> = {
    slight: 0.1,
    moderate: 0.2,
    significant: 0.3
  };

  const adjustedTemperature = Math.min(1.0, baseTemperature + temperatureAdjustments[variationLevel]);

  // 生成差异化指令
  const variationInstructions = generateVariationInstructions(variationLevel, styleVariation);

  // 添加随机种子以确保差异
  const seedInstruction = regenerationSeed
    ? `\n\n【差异化要求】这是${regenerationSeed}版本，请确保与其他版本有明显差异。`
    : `\n\n【差异化要求】请生成与常规版本不同的内容变体。`;

  // 构建增强的提示词
  const enhancedPrompt = `${originalPrompt}${seedInstruction}\n\n${variationInstructions}`;

  // 构建增强的系统提示词
  const systemVariationPrompt = getSystemVariationPrompt(styleVariation);
  const enhancedSystemPrompt = originalSystemPrompt
    ? `${originalSystemPrompt}\n\n${systemVariationPrompt}`
    : systemVariationPrompt;

  return {
    prompt: enhancedPrompt,
    systemPrompt: enhancedSystemPrompt,
    temperature: adjustedTemperature
  };
}

/**
 * 生成差异化指令
 * 
 * @param level 差异化级别
 * @param style 风格变化类型
 * @returns 差异化指令文本
 */
function generateVariationInstructions(
  level: VariationLevel,
  style: StyleVariation
): string {
  const levelInstructions: Record<VariationLevel, string> = {
    slight: '请在保持核心内容的基础上，做出轻微的表达调整。',
    moderate: '请在保持主要观点的同时，采用不同的表达方式和结构。',
    significant: '请从不同角度重新构思内容，确保有明显的差异化。'
  };

  const styleInstructions: Record<StyleVariation, string> = {
    tone: '调整语气和情感色彩，使用不同的修辞手法。',
    structure: '改变内容结构和段落组织方式。',
    vocabulary: '使用不同的词汇和表达方式。',
    approach: '从不同的切入点和视角来呈现内容。'
  };

  return `${levelInstructions[level]}\n重点关注：${styleInstructions[style]}`;
}

/**
 * 获取系统级差异化提示
 * 
 * @param style 风格变化类型
 * @returns 系统级提示文本
 */
function getSystemVariationPrompt(style: StyleVariation): string {
  const prompts: Record<StyleVariation, string> = {
    tone: '请注意调整内容的语气和情感表达，使其与之前的版本有明显区别。',
    structure: '请重新组织内容结构，采用不同的叙述顺序和段落安排。',
    vocabulary: '请使用不同的词汇和表达方式，避免与之前版本的用词重复。',
    approach: '请从不同的角度和切入点来呈现内容，提供新的视角。'
  };

  return prompts[style];
}

/**
 * 检查是否需要应用差异化
 * 
 * @param options 差异化选项
 * @returns 是否需要应用差异化
 */
export function shouldApplyVariation(options: VariationOptions): boolean {
  return !!(options.regenerationSeed || options.variationLevel || options.styleVariation);
}

/**
 * 获取差异化配置的描述
 * 
 * @param options 差异化选项
 * @returns 配置描述
 */
export function getVariationDescription(options: VariationOptions): string {
  if (!shouldApplyVariation(options)) {
    return '无差异化';
  }

  const parts: string[] = [];
  
  if (options.regenerationSeed) {
    parts.push(`种子:${options.regenerationSeed}`);
  }
  
  if (options.variationLevel) {
    const levelNames: Record<VariationLevel, string> = {
      slight: '轻微差异',
      moderate: '中等差异',
      significant: '显著差异'
    };
    parts.push(levelNames[options.variationLevel]);
  }
  
  if (options.styleVariation) {
    const styleNames: Record<StyleVariation, string> = {
      tone: '语气变化',
      structure: '结构变化',
      vocabulary: '词汇变化',
      approach: '视角变化'
    };
    parts.push(styleNames[options.styleVariation]);
  }

  return parts.join(' + ');
}

