/**
 * 🚀 高级提示词构建器
 *
 * 实现多维矩阵提示词系统、优先级机制和差异化策略
 */

import type { StyleType } from '@/config/contentSchemes';
import {
  PLATFORM_CHARACTERISTICS,
  EXPRESSION_STYLES,
  getPlatformPromptDescription,
  getStylePromptDescription,
  getDifferentiationPrompt,
  getBrandPrompt
} from '../config/advancedPromptSystem';
import {
  ALL_CONTENT_FORMS,
  selectRandomVariant,
  type ContentFormConfig
} from '../config/contentForms';

export interface PromptBuildingContext {
  // 必填
  originalContent: string;
  platform: string;

  // 可选维度
  formId?: string;
  style?: StyleType;
  charCount?: number;
  customPrompt?: string;
  useBrandLibrary?: boolean;
  brandProfile?: any;

  // 格式化选项
  useEmoji?: boolean;
  useMdFormat?: boolean;
  useAutoFormat?: boolean;

  // 多平台模式
  multiplePlatforms?: string[];
}

export class AdvancedPromptBuilder {
  private dimensions: string[] = [];

  /**
   * 构建完整的系统提示词
   */
  buildSystemPrompt(context: PromptBuildingContext): string {
    const parts: string[] = [];

    // 基础角色定义
    parts.push(this.buildRoleDefinition());

    // 多维矩阵说明
    parts.push(this.buildMatrixExplanation());

    // 优先级机制
    parts.push(this.buildPriorityMechanism());

    // 差异化要求
    parts.push(getDifferentiationPrompt());

    // 最终要求
    parts.push(this.buildFinalRequirements());

    return parts.filter(p => p).join('\n\n');
  }

  /**
   * 构建用户提示词（包含所有维度）
   */
  buildUserPrompt(context: PromptBuildingContext): string {
    this.dimensions = [];

    // 重置维度列表
    const dimensionParts: string[] = [];

    // 维度0: 品牌维度（最高优先级）
    if (context.useBrandLibrary && context.brandProfile) {
      const brandDimension = this.buildBrandDimension(context.brandProfile);
      dimensionParts.push(brandDimension);
      this.dimensions.push('品牌维度');
    }

    // 基本内容: 原始内容维度
    const contentDimension = this.buildContentDimension(context.originalContent);
    dimensionParts.push(contentDimension);
    this.dimensions.push('原始内容');

    // 维度1: 目标平台维度
    const platformDimension = this.buildPlatformDimension(context.platform);
    dimensionParts.push(platformDimension);
    this.dimensions.push('目标平台');

    // 维度2: 字符数控制维度
    if (context.charCount) {
      const charCountDimension = this.buildCharCountDimension(context.charCount, context.platform);
      dimensionParts.push(charCountDimension);
      this.dimensions.push('字符数控制');
    }

    // 维度3: 格式化要求维度
    const formatDimension = this.buildFormatDimension(context);
    if (formatDimension) {
      dimensionParts.push(formatDimension);
      this.dimensions.push('格式化要求');
    }

    // 维度4: 内容形式维度
    if (context.formId) {
      const formDimension = this.buildFormDimension(context.formId);
      dimensionParts.push(formDimension);
      this.dimensions.push('内容形式');
    }

    // 维度5: 表达风格维度
    if (context.style) {
      const styleDimension = this.buildStyleDimension(context.style);
      dimensionParts.push(styleDimension);
      this.dimensions.push('表达风格');
    }

    // 维度6: 用户自定义维度
    if (context.customPrompt) {
      const customDimension = this.buildCustomDimension(context.customPrompt);
      dimensionParts.push(customDimension);
      this.dimensions.push('用户自定义');
    }

    // 多平台模式
    if (context.multiplePlatforms && context.multiplePlatforms.length > 1) {
      return this.buildMultiplePlatformPrompt(context, dimensionParts);
    }

    // 构建最终提示词
    return this.assembleFinalPrompt(dimensionParts, context);
  }

  /**
   * 构建角色定义
   */
  private buildRoleDefinition(): string {
    return `你是一位专业的多维度内容创作专家，擅长根据不同平台特性和用户需求生成高质量、个性化的内容。`;
  }

  /**
   * 构建矩阵说明
   */
  private buildMatrixExplanation(): string {
    return `【多维矩阵提示词系统】
你将收到多个维度的要求，每个维度都是生成内容的重要参考：
- 品牌维度：品牌调性、语言规范（最高优先级）
- 原始内容：用户输入的基础内容
- 目标平台：平台特性和用户偏好
- 字符数控制：内容长度要求
- 格式化要求：排版和格式规范
- 内容形式：内容结构和类型
- 表达风格：语言风格和情感基调
- 用户自定义：特殊要求和偏好`;
  }

  /**
   * 构建优先级机制
   */
  private buildPriorityMechanism(): string {
    return `【优先级机制】⚠️
1. 品牌库 > 用户选择 > 平台默认
   - 如果有品牌库设置，所有内容必须严格遵循品牌调性
   - 用户明确选择的维度优先于平台默认设置
   - 未指定的维度使用平台默认特性

2. 维度越多，内容越个性化
   - 充分利用所有提供的维度信息
   - 确保每个维度在最终内容中都有体现
   - 维度之间要协调一致，不能冲突

3. 禁止静态模板
   - 每次生成都要动态调整
   - 不要使用固定的内容框架
   - 保持内容的独特性和新鲜感`;
  }

  /**
   * 构建最终要求
   */
  private buildFinalRequirements(): string {
    return `【最终输出要求】
1. 严格遵循所有维度要求，确保每个维度都在内容中体现
2. 内容必须具有强烈的差异化特色，避免模板化
3. 直接输出最终内容，不要包含任何说明、解释或元信息
4. 确保内容自然流畅，符合人类真实表达习惯
5. 如果有多个维度冲突，按优先级机制处理`;
  }

  /**
   * 构建品牌维度
   */
  private buildBrandDimension(brandProfile: any): string {
    return getBrandPrompt(brandProfile);
  }

  /**
   * 构建原始内容维度
   */
  private buildContentDimension(content: string): string {
    return `【原始内容维度】
用户提供的原始内容：
${content}

要求：基于此内容进行改写和优化，保留核心信息和要点。`;
  }

  /**
   * 构建平台维度
   */
  private buildPlatformDimension(platform: string): string {
    const description = getPlatformPromptDescription(platform);
    return `【目标平台维度】
${description}

要求：
1. 严格遵循该平台的语言风格和表达习惯
2. 体现平台用户的阅读偏好
3. 符合平台的内容审核标准
4. 充分利用平台特色功能（如标签、表情等）`;
  }

  /**
   * 构建字符数控制维度
   */
  private buildCharCountDimension(charCount: number, platform: string): string {
    const platformInfo = PLATFORM_CHARACTERISTICS[platform];
    const maxChars = platformInfo?.maxChars || 1000;

    return `【字符数控制维度】
目标字数：${charCount}字
平台限制：最多${maxChars}字

要求：
1. 生成的内容字数应接近${charCount}字（±10%范围内）
2. 不超过平台最大限制${maxChars}字
3. 如果内容较短，要增加具体细节和案例
4. 如果内容较长，要精简表达，保留核心信息
5. 确保内容完整性，不要为了凑字数而添加无意义内容`;
  }

  /**
   * 构建格式化维度
   */
  private buildFormatDimension(context: PromptBuildingContext): string {
    const requirements: string[] = [];

    if (context.useEmoji) {
      requirements.push('- 适当使用emoji表情符号，增强视觉效果和情感表达');
    }

    if (context.useMdFormat) {
      requirements.push('- 使用Markdown语法格式化，包括标题(#)、加粗(**文字**)、列表(-)、引用(>)等');
    }

    if (context.useAutoFormat) {
      requirements.push('- 优化段落结构、换行、缩进，确保排版美观易读');
    }

    if (requirements.length === 0) {
      return '';
    }

    return `【格式化要求维度】
${requirements.join('\n')}

要求：严格按照以上格式化要求输出内容`;
  }

  /**
   * 构建内容形式维度（完整实现）
   * 🎯 区分于表达风格(tone),专注于内容呈现形式(format)
   */
  private buildFormDimension(formId: string): string {
    const formConfig = ALL_CONTENT_FORMS[formId];

    if (!formConfig) {
      return `【内容形式维度】
内容形式：${formId}

要求：按照指定的内容形式组织结构和表达方式`;
    }

    // 随机选择变体以避免模板化
    const variant = formConfig.variants[0]; // 使用第一个变体作为基础
    const openingHook = selectRandomVariant(formConfig.variants, 'openingHooks');
    const contentModule = selectRandomVariant(formConfig.variants, 'contentModules');
    const closingAction = selectRandomVariant(formConfig.variants, 'closingActions');

    return `【内容形式维度】
内容形式：${formConfig.name}（${formConfig.category}类）
说明：${formConfig.description}

📋 结构要求：
${variant.structure}

🎣 开头钩子（随机选用）：
"${openingHook}"

📝 内容模块示例（随机选用）：
"${contentModule}"

🎯 结尾行动（随机选用）：
"${closingAction}"

✅ 关键特征：
${variant.keyFeatures.map(f => `- ${f}`).join('\n')}

⚠️ 必须遵循的要求：
${formConfig.requirements.map(r => `- ${r}`).join('\n')}

🚫 避免的模板化行为：
${formConfig.antiPatterns.map(ap => `- ${ap}`).join('\n')}

💡 参考示例（仅供参考，不要照搬）：
${formConfig.examples.map(ex => `- ${ex}`).join('\n')}

【重要提醒】⚠️
1. 结构模板仅供参考，必须根据实际内容灵活调整
2. 每次生成要随机选用不同的开头、内容模块和结尾
3. 禁止生成与示例过于相似的内容
4. 确保内容形式与表达风格协调一致`;
  }

  /**
   * 构建表达风格维度
   */
  private buildStyleDimension(style: StyleType): string {
    const description = getStylePromptDescription(style);
    return `【表达风格维度】
${description}

要求：
1. 严格遵循该风格的表达特点
2. 使用该风格的典型词汇和句式
3. 保持风格的一致性
4. 与平台特性协调融合`;
  }

  /**
   * 构建用户自定义维度
   */
  private buildCustomDimension(customPrompt: string): string {
    return `【用户自定义维度】
特殊要求：
${customPrompt}

要求：必须严格遵循用户的自定义要求`;
  }

  /**
   * 组装最终提示词
   */
  private assembleFinalPrompt(dimensionParts: string[], context: PromptBuildingContext): string {
    const parts: string[] = [];

    // 开头说明
    parts.push(`请根据用户输入的原始内容和以下"多维矩阵维度"要求生成高质量内容：\n`);

    // 所有维度
    parts.push(dimensionParts.join('\n\n'));

    // 维度总结
    parts.push(`\n【本次使用的维度】
共${this.dimensions.length}个维度：${this.dimensions.join('、')}`);

    // 生成要求
    parts.push(`\n【生成要求】
1. 严格按照所有维度的要求生成内容
2. 确保内容具有强烈的差异化特色
3. 避免模板化表达，每次生成都要有独特性
4. 所有维度必须在最终内容中得到体现
5. 直接输出最终内容，不要包含任何说明文字`);

    return parts.join('\n');
  }

  /**
   * 构建多平台提示词
   */
  private buildMultiplePlatformPrompt(context: PromptBuildingContext, baseDimensions: string[]): string {
    const platforms = context.multiplePlatforms || [];
    const parts: string[] = [];

    parts.push(`请将以下内容分别适配到${platforms.length}个平台：${platforms.join('、')}\n`);

    // 原始内容
    parts.push(`【原始内容】
${context.originalContent}\n`);

    // 各平台要求
    parts.push(`【各平台要求】`);
    platforms.forEach(platform => {
      const platformDesc = getPlatformPromptDescription(platform);
      parts.push(`\n### ${PLATFORM_CHARACTERISTICS[platform]?.name || platform}
${platformDesc}`);
    });

    // 输出格式
    parts.push(`\n【输出格式】
请为每个平台生成独立的内容，格式如下：

${platforms.map(platform => `### ${PLATFORM_CHARACTERISTICS[platform]?.name || platform}适配
内容：[适配后的内容]
`).join('\n')}

要求：
1. 每个平台的内容风格必须符合该平台特点
2. 内容要简洁明了，适合该平台用户群体
3. 充分利用各平台的特色功能
4. 确保内容差异化，不是简单复制`);

    return parts.join('\n');
  }

  /**
   * 获取使用的维度列表
   */
  getDimensions(): string[] {
    return this.dimensions;
  }
}

// 创建单例实例
export const advancedPromptBuilder = new AdvancedPromptBuilder();
export default advancedPromptBuilder;
