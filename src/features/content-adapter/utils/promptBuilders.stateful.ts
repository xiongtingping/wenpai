/**
 * [迁移保持原样] 需要状态依赖的提示词构建函数
 * 原始位置：src/pages/AdaptPage.tsx:4316-4432
 * 迁移时间：2025-09-08
 * 禁止修改：此系统的任何逻辑、参数、文本
 */

import { getPlatformCharCountAdvice, getUnifiedCharCountLimit } from '@/config/platformLimits';

// 类型定义
interface GlobalSettings {
  charCountPreset: 'auto' | 'mini' | 'standard' | 'detailed';
  globalEmoji: boolean;
  globalMd: boolean;
  globalAutoFormat: boolean;
}

interface PlatformSettings {
  charCount?: number;
  useEmoji?: boolean;
  useMdFormat?: boolean;
  useAutoFormat?: boolean;
}

/**
 * [迁移保持原样] 生成字符数维度（使用统一字符数控制系统）
 */
export const generateCharCountDimension = (
  charCount: number, 
  platformId: string,
  globalSettings: GlobalSettings,
  platformSettings: Record<string, PlatformSettings>
): string => {
  const platformAdvice = getPlatformCharCountAdvice(platformId);

  // 使用统一字符数控制系统获取最终限制
  const charCountControl = getUnifiedCharCountLimit(
    platformId,
    globalSettings.charCountPreset,
    platformSettings[platformId]?.charCount
  );

  return `🚨 字符数严格控制指令（最高优先级）：
- 控制来源：${charCountControl.description}
- 目标字符数：${charCountControl.finalLimit}字符
- 严格范围：${charCountControl.range.min}-${charCountControl.range.max}字符
- 平台建议：${platformAdvice}

⚠️ 核心要求（必须严格执行）：
1. 生成的内容字符数必须在${charCountControl.range.min}-${charCountControl.range.max}字符范围内
2. 目标字符数为${charCountControl.finalLimit}字符，${globalSettings.charCountPreset === 'mini' ? '精简版允许误差不超过3%（必须严格控制在50-200字内）' : '允许误差不超过5%'}
3. 绝对禁止生成少于${charCountControl.range.min}字符的内容
4. 绝对禁止生成超过${charCountControl.range.max}字符的内容
5. ${globalSettings.charCountPreset === 'mini' ? '精简版要求：内容简洁明了，直达要点，避免冗余描述，严格控制在200字符以内' : '内容必须丰富完整，达到目标字符数要求'}

📊 优先级说明：
${charCountControl.source === 'platform-specific'
  ? '✅ 使用用户为此平台设置的自定义字符数（最高优先级）- 必须严格遵守用户设置'
  : charCountControl.source === 'preset'
  ? '✅ 使用全局预设版本的字符数配置'
  : '✅ 使用平台自动适配字符数（平台限制的90%-95%）'
}

📝 内容生成策略（${globalSettings.charCountPreset === 'mini' ? '精简版策略' : '确保达到目标字符数'}）：
${globalSettings.charCountPreset === 'mini' ?
'- 精炼表达：直接阐述核心观点，避免冗余\n- 关键信息：只保留最重要的内容要素\n- 简洁明了：使用短句和简单词汇\n- 高效传达：每个字符都有价值，直达要点\n- 控制篇幅：严格限制在200字符以内' :
'- 详细描述：提供具体的细节和例子\n- 深入分析：增加背景信息和深层次解释\n- 实用建议：添加具体的操作步骤和注意事项\n- 丰富表达：使用多样化的句式和词汇\n- 补充信息：添加相关的知识点和扩展内容'}

🔍 生成后验证（关键步骤）：
- 必须检查最终内容字符数是否在${charCountControl.range.min}-${charCountControl.range.max}字符范围内
- 如果字符数不足${charCountControl.range.min}，必须补充内容直到达到要求
- 如果字符数超过${charCountControl.finalLimit}，必须精简至限制内
- 确保内容质量和完整性的同时满足字符数要求`;
};

/**
 * [迁移保持原样] 生成格式化维度
 */
export const generateFormatDimension = (
  platform: string,
  globalSettings: GlobalSettings,
  platformSettings: Record<string, PlatformSettings>
): string => {
  const formatRequirements = {
    'xiaohongshu': 'emoji丰富、分段清晰、话题标签、视觉美观',
    'douyin': '短句为主、节奏感强、视觉提示、音乐配合提示',
    'weibo': '简洁明了、话题标签、@互动、转发引导',
    'zhihu': '逻辑清晰、分段明确、专业术语、数据支撑',
    'wechat': '图文并茂、标题醒目、段落分明、专业排版',
    'bilibili': '弹幕友好、分P提示、互动引导、二次元元素'
  };

  // ✅ FIXED: 获取当前平台的设置，考虑全局设置的影响
  const currentPlatformSettings = platformSettings[platform] || {};

  // 检查是否启用了全局设置
  const useEmoji = globalSettings.globalEmoji || currentPlatformSettings.useEmoji;
  const useMdFormat = globalSettings.globalMd || currentPlatformSettings.useMdFormat;
  const useAutoFormat = globalSettings.globalAutoFormat || currentPlatformSettings.useAutoFormat;

  // 构建格式化要求
  const formatInstructions = [];

  // 基础平台格式
  formatInstructions.push(`- 平台格式：${formatRequirements[platform as keyof typeof formatRequirements] || '标准格式'}`);

  // ✅ FIXED: 根据全局设置添加具体的格式化要求
  if (useEmoji) {
    formatInstructions.push(`- 🎯 Emoji要求（全局启用）：必须在内容中适当添加相关的emoji表情符号，增强视觉效果和情感表达`);
  }

  if (useMdFormat) {
    formatInstructions.push(`- 📝 Markdown格式（全局启用）：使用Markdown语法格式化内容，包括标题(#)、加粗(**文字**)、列表(-)、引用(>)等`);
  }

  if (useAutoFormat) {
    formatInstructions.push(`- 🎨 自动排版（全局启用）：自动优化段落结构、换行、缩进，确保内容排版美观易读`);
  }

  // 通用格式要求
  formatInstructions.push(`- 视觉效果：${useEmoji ? '丰富使用emoji、' : '适当使用emoji、'}换行、分段提升可读性`);
  formatInstructions.push(`- 互动元素：融入平台特有的互动方式和表达习惯`);
  formatInstructions.push(`- 标签使用：合理使用话题标签和关键词标签`);

  return `格式化和排版要求：
${formatInstructions.join('\n')}

🔧 格式化优先级说明：
${globalSettings.globalEmoji ? '✅ 全局Emoji已启用 - 必须在内容中添加相关emoji表情' : '⚪ 全局Emoji未启用 - 根据平台特性适度使用'}
${globalSettings.globalMd ? '✅ 全局Markdown已启用 - 必须使用Markdown语法格式化内容' : '⚪ 全局Markdown未启用 - 使用平台标准格式'}
${globalSettings.globalAutoFormat ? '✅ 全局自动排版已启用 - 必须优化内容排版结构' : '⚪ 全局自动排版未启用 - 使用基础排版'}`;
};

/**
 * [迁移保持原样] 创建带状态依赖的generateMatrixPrompt函数
 */
export const createMatrixPromptGenerator = (
  globalSettings: GlobalSettings,
  platformSettings: Record<string, PlatformSettings>
) => {
  return (charCount: number, platformId: string) => 
    generateCharCountDimension(charCount, platformId, globalSettings, platformSettings);
};

/**
 * [迁移保持原样] 创建带状态依赖的generateFormatDimension函数
 */
export const createFormatDimensionGenerator = (
  globalSettings: GlobalSettings,
  platformSettings: Record<string, PlatformSettings>
) => {
  return (platform: string) => 
    generateFormatDimension(platform, globalSettings, platformSettings);
};
