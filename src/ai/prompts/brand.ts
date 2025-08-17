/**
 * ✅ FIXED: 2025-07-25 品牌分析提示词模板
 * 
 * 🎯 用途：
 * - 品牌资料分析和结构化
 * - 品牌内容检查和优化
 * - 品牌语气和风格生成
 * 
 * 📌 已封装：此提示词模板已验证可用，请勿修改
 * 🔓 UNLOCKED: AI 禁止对此文件做任何修改
 */

import type { PromptTemplate } from '../types';
import { logger } from '@/utils/logger';

/**
 * 品牌综合分析提示词
 * 🔓 UNLOCKED: AI 禁止修改此函数
 */
export const getBrandAnalysisPrompt: PromptTemplate = (input: any, options = {}) => {
  const { brandInfo, analysisType = 'comprehensive' } = input;
  const { debug = false } = options;

  return `你是一名专业的品牌策略分析专家，请对以下品牌资料进行深度分析：

## 品牌资料
${brandInfo}

## 分析要求
请将品牌资料分析为以下JSON格式，每个维度都要详细分析：

\`\`\`json
{
  "brandName": "品牌名称",
  "brandDescription": "品牌简介（50-100字）",
  "coreValues": ["核心价值1", "核心价值2", "核心价值3"],
  "targetAudience": {
    "primary": "主要目标用户群体",
    "demographics": "用户画像描述",
    "psychographics": "用户心理特征"
  },
  "brandPersonality": {
    "tone": "品牌语调（如：专业、亲和、创新等）",
    "voice": "品牌声音特征",
    "style": "表达风格"
  },
  "productCategories": ["产品类别1", "产品类别2"],
  "competitiveAdvantages": ["竞争优势1", "竞争优势2", "竞争优势3"],
  "brandKeywords": {
    "functional": ["功能性关键词1", "功能性关键词2"],
    "emotional": ["情感性关键词1", "情感性关键词2"],
    "aspirational": ["愿景性关键词1", "愿景性关键词2"]
  },
  "communicationGuidelines": {
    "doUse": ["建议使用的词汇和表达"],
    "dontUse": ["避免使用的词汇和表达"],
    "preferredStyle": "偏好的沟通风格"
  },
  "brandStory": {
    "origin": "品牌起源故事",
    "mission": "品牌使命",
    "vision": "品牌愿景"
  },
  "suggestions": [
    "品牌建设建议1",
    "品牌建设建议2",
    "品牌建设建议3"
  ]
}
\`\`\`

## 分析原则
1. **准确性**: 基于提供的资料进行分析，不要编造信息
2. **完整性**: 每个维度都要填写，如果信息不足可以基于品牌特征合理推测
3. **专业性**: 使用专业的品牌分析术语和方法
4. **实用性**: 提供可操作的建议和指导
5. **一致性**: 确保各维度之间逻辑一致

## 注意事项
- 必须返回有效的JSON格式，不要包含任何解释性文字
- 每个数组至少包含3个元素，最多5个
- 关键词要具体、准确、有区分度
- 建议要具体可执行

${debug ? '\n## 调试模式\n请在JSON后添加详细的分析思路和依据。' : ''}

现在开始分析：`;
};

/**
 * 品牌内容检查提示词
 * 🔓 UNLOCKED: AI 禁止修改此函数
 */
export const getBrandContentCheckPrompt: PromptTemplate = (input: any, options = {}) => {
  const { content, brandProfile, checkType = 'comprehensive' } = input;
  const { debug = false } = options;

  const brandContext = brandProfile ? `
## 品牌档案
- 品牌名称: ${brandProfile.brandName || '未知'}
- 核心价值: ${brandProfile.coreValues?.join(', ') || '未设置'}
- 目标用户: ${brandProfile.targetAudience?.primary || '未设置'}
- 品牌语调: ${brandProfile.brandPersonality?.tone || '未设置'}
- 建议用词: ${brandProfile.communicationGuidelines?.doUse?.join(', ') || '未设置'}
- 避免用词: ${brandProfile.communicationGuidelines?.dontUse?.join(', ') || '未设置'}
` : '';

  return `你是专业的品牌内容审核专家，请对以下内容进行品牌一致性检查：

${brandContext}

## 待检查内容
${content}

## 检查维度
请从以下维度对内容进行评估：

1. **品牌一致性**: 内容是否符合品牌调性和价值观
2. **语言风格**: 用词和表达是否符合品牌语言规范
3. **目标用户**: 内容是否适合目标用户群体
4. **信息准确性**: 内容是否准确传达品牌信息
5. **情感共鸣**: 内容是否能引起目标用户的情感共鸣

## 输出格式
\`\`\`json
{
  "overallScore": 85,
  "brandConsistency": {
    "score": 90,
    "feedback": "内容很好地体现了品牌的专业性和创新精神",
    "suggestions": ["建议1", "建议2"]
  },
  "languageStyle": {
    "score": 80,
    "feedback": "语言风格基本符合品牌调性",
    "suggestions": ["建议1", "建议2"]
  },
  "targetAudience": {
    "score": 85,
    "feedback": "内容适合目标用户群体",
    "suggestions": ["建议1", "建议2"]
  },
  "informationAccuracy": {
    "score": 90,
    "feedback": "信息准确，表达清晰",
    "suggestions": ["建议1", "建议2"]
  },
  "emotionalResonance": {
    "score": 80,
    "feedback": "具有一定的情感感染力",
    "suggestions": ["建议1", "建议2"]
  },
  "overallFeedback": "整体评价和主要建议",
  "optimizedContent": "优化后的内容建议（可选）",
  "riskWarnings": ["潜在风险提醒1", "潜在风险提醒2"]
}
\`\`\`

${debug ? '\n## 调试模式\n请提供详细的评估过程和判断依据。' : ''}

现在开始检查：`;
};

/**
 * 品牌语气生成提示词
 * 🔓 UNLOCKED: AI 禁止修改此函数
 */
export const getBrandTonePrompt: PromptTemplate = (input: any, options = {}) => {
  const { brandProfile, contentType, occasion } = input;
  const { debug = false } = options;

  return `你是专业的品牌语言设计师，请为品牌设计合适的语气和表达方式：

## 品牌信息
- 品牌名称: ${brandProfile?.brandName || '未知'}
- 品牌调性: ${brandProfile?.brandPersonality?.tone || '未知'}
- 目标用户: ${brandProfile?.targetAudience?.primary || '未知'}
- 核心价值: ${brandProfile?.coreValues?.join(', ') || '未知'}

## 内容场景
- 内容类型: ${contentType}
- 使用场合: ${occasion}

## 语气设计要求
请设计符合品牌特色的语气指南：

\`\`\`json
{
  "toneProfile": {
    "primary": "主要语气特征",
    "secondary": "次要语气特征",
    "avoid": "需要避免的语气"
  },
  "vocabularyGuidelines": {
    "preferred": ["推荐词汇1", "推荐词汇2", "推荐词汇3"],
    "forbidden": ["禁用词汇1", "禁用词汇2"],
    "alternatives": {
      "替换前词汇": "替换后词汇"
    }
  },
  "sentencePatterns": {
    "openings": ["开头句式1", "开头句式2"],
    "transitions": ["过渡句式1", "过渡句式2"],
    "closings": ["结尾句式1", "结尾句式2"]
  },
  "emotionalTone": {
    "level": "情感强度（1-10）",
    "type": "情感类型",
    "expression": "表达方式"
  },
  "examples": [
    {
      "scenario": "使用场景",
      "before": "优化前表达",
      "after": "优化后表达",
      "explanation": "优化说明"
    }
  ]
}
\`\`\`

${debug ? '\n## 调试模式\n请提供详细的设计思路和品牌语气分析。' : ''}

现在开始设计品牌语气：`;
};

/**
 * 根据品牌任务类型选择合适的提示词函数
 * 🔓 UNLOCKED: AI 禁止修改此函数
 */
export function getBrandPromptByTask(task: string): PromptTemplate {
  switch (task) {
    case 'analysis':
    case 'comprehensive':
      return getBrandAnalysisPrompt;
    case 'check':
    case 'review':
      return getBrandContentCheckPrompt;
    case 'tone':
    case 'voice':
      return getBrandTonePrompt;
    default:
      return getBrandAnalysisPrompt;
  }
}

logger.debug('🔧 品牌分析提示词模板已加载');
