/**
 * 多版本内容生成器
 * 用于生成版本A(标准版)和版本B(创意版)
 */

import { callAIWithTokenTracking, type AICallParamsWithTracking } from '@/services/aiWithTokenTracking';
import { AITaskType } from '@/api/aiService';
// import type { ContentVersion } from '../types'; // 模块不存在，暂时注释
type ContentVersion = any; // 临时类型定义

/**
 * 生成多个版本的内容
 * @param basePrompt 基础提示词
 * @param platformId 平台ID
 * @param model AI模型
 * @param globalSettings 全局设置
 * @param platformSettings 平台设置
 * @returns 版本数组
 */
export async function generateMultipleVersions(
  basePrompt: string,
  platformId: string,
  model: string,
  globalSettings: any,
  platformSettings: any
): Promise<ContentVersion[]> {
  const versions: ContentVersion[] = [];

  try {
    // 版本A: 标准版 (temperature=0.7, 更稳定、专业)
    console.log('🎯 开始生成版本A (标准版)...');
    const versionA = await generateSingleVersion({
      basePrompt,
      platformId,
      model,
      versionType: 'standard',
      versionId: 'version-a',
      versionLabel: '版本A',
      temperature: 0.7,
      systemPromptSuffix: `

## 版本要求: 标准版
- 语言风格: 专业、规范、易读
- 内容结构: 清晰、有条理
- 表达方式: 直接、准确
- 适用场景: 正式发布、品牌传播`,
      // ✅ 添加差异化参数确保版本A的唯一性
      regenerationSeed: 'multi-version-a',
      variationLevel: 'moderate',
      styleVariation: 'structure'
    });

    if (versionA) {
      versions.push(versionA);
    }

    // 🔧 延迟500ms后再生成版本B，避免API缓存
    await new Promise(resolve => setTimeout(resolve, 500));

    // 版本B: 创意版 (temperature=0.9, 更有创意、生动)
    console.log('🎨 开始生成版本B (创意版)...');
    const versionB = await generateSingleVersion({
      basePrompt,
      platformId,
      model,
      versionType: 'creative',
      versionId: 'version-b',
      versionLabel: '版本B',
      temperature: 0.9,
      systemPromptSuffix: `

## 版本要求: 创意版
- 语言风格: 生动、有趣、吸引人
- 内容结构: 灵活、富有变化
- 表达方式: 形象、感性、有感染力
- 适用场景: 社交传播、用户互动
- 创意元素: 可以使用比喻、排比、设问等修辞手法`,
      // ✅ 添加显著差异化参数确保版本B与版本A完全不同
      regenerationSeed: 'multi-version-b',
      variationLevel: 'significant',
      styleVariation: 'tone'
    });

    if (versionB) {
      versions.push(versionB);
    }

    console.log(`✅ 多版本生成完成: ${versions.length}个版本`);
    return versions;

  } catch (error) {
    console.error('❌ 多版本生成失败:', error);
    return versions; // 返回已生成的版本
  }
}

/**
 * 生成单个版本
 */
async function generateSingleVersion(params: {
  basePrompt: string;
  platformId: string;
  model: string;
  versionType: 'standard' | 'creative';
  versionId: string;
  versionLabel: string;
  temperature: number;
  systemPromptSuffix: string;
  // ✅ 添加差异化参数
  regenerationSeed?: string;
  variationLevel?: 'slight' | 'moderate' | 'significant';
  styleVariation?: 'tone' | 'structure' | 'vocabulary' | 'approach';
}): Promise<ContentVersion | null> {
  try {
    const {
      basePrompt,
      platformId,
      model,
      versionType,
      versionId,
      versionLabel,
      temperature,
      systemPromptSuffix,
      regenerationSeed,
      variationLevel,
      styleVariation
    } = params;

    // 构建系统提示词
    const systemPrompt = buildSystemPrompt(platformId, systemPromptSuffix);

    // 构建用户提示词 - 添加版本差异化指令
    const userPrompt = `${basePrompt}

---

**重要提示**: 这是${versionLabel}(${versionType === 'standard' ? '标准版' : '创意版'}),请严格按照以下要求生成:

${versionType === 'standard' ? `
✅ 标准版要求:
- 使用专业、规范的语言
- 保持内容结构清晰
- 表达直接、准确
- 避免过于花哨的修辞
- 适合正式场合发布
` : `
✅ 创意版要求:
- 使用生动、有趣的语言
- 可以使用比喻、排比、设问等修辞手法
- 增加情感色彩和感染力
- 让内容更有吸引力
- 适合社交传播和用户互动
`}

请直接输出内容,不要包含任何解释或说明。`;

    // 调用AI
    const aiParams: AICallParamsWithTracking = {
      prompt: userPrompt,
      model,
      systemPrompt,
      temperature,
      maxTokens: 2000,
      feature: 'AI内容适配器-多版本生成',
      taskType: AITaskType.CONTENT_ADAPTATION,
      // ✅ 传递差异化参数到AI调用
      regenerationSeed,
      variationLevel,
      styleVariation
    };

    console.log(`🤖 调用AI生成${versionLabel} (temperature=${temperature}, seed=${regenerationSeed})...`);
    const result = await callAIWithTokenTracking(aiParams);

    if (!result.success || !result.content) {
      console.error(`❌ ${versionLabel}生成失败:`, result.error);
      return null;
    }

    console.log(`✅ ${versionLabel}生成成功 (${result.content.length}字符)`);

    return {
      id: versionId,
      label: versionLabel,
      content: result.content.trim(),
      type: versionType,
      temperature,
      generatedAt: new Date().toISOString()
    };

  } catch (error) {
    console.error(`❌ 生成${params.versionLabel}时出错:`, error);
    return null;
  }
}

/**
 * 构建系统提示词
 */
function buildSystemPrompt(platformId: string, suffix: string): string {
  const platformNames: Record<string, string> = {
    'xiaohongshu': '小红书',
    'weibo': '微博',
    'wechat': '微信公众号',
    'douyin': '抖音',
    'zhihu': '知乎',
    'bilibili': 'B站',
    'toutiao': '今日头条',
    'kuaishou': '快手'
  };

  const platformName = platformNames[platformId] || platformId;

  return `你是一个专业的${platformName}内容创作专家。

## 核心职责
- 根据用户提供的原始内容和要求,生成适合${platformName}平台的优质内容
- 严格遵循平台特性和用户偏好
- 确保内容质量和传播效果

## 平台特性
${getPlatformCharacteristics(platformId)}

${suffix}

## 输出要求
- 直接输出最终内容,不要包含任何解释、说明或元信息
- 不要输出"以下是..."、"根据要求..."等引导语
- 内容应该可以直接复制粘贴使用`;
}

/**
 * 获取平台特性描述
 */
function getPlatformCharacteristics(platformId: string): string {
  const characteristics: Record<string, string> = {
    'xiaohongshu': `- 用户群体: 年轻女性为主,追求生活品质
- 内容风格: 真实、分享、种草
- 热门形式: 图文笔记、视频笔记
- 关键要素: 标题吸引、图片精美、内容实用`,

    'weibo': `- 用户群体: 广泛,关注热点和娱乐
- 内容风格: 简洁、时效、互动
- 热门形式: 短文+图片、话题讨论
- 关键要素: 话题标签、@互动、转发引导`,

    'wechat': `- 用户群体: 全年龄段,深度阅读
- 内容风格: 专业、深度、有价值
- 热门形式: 长文章、图文并茂
- 关键要素: 标题吸引、排版精美、内容深度`,

    'douyin': `- 用户群体: 年轻人为主,娱乐导向
- 内容风格: 短视频、快节奏
- 热门形式: 15-60秒短视频
- 关键要素: 前3秒吸引、音乐配合、话题挑战`,

    'zhihu': `- 用户群体: 知识型用户,追求深度
- 内容风格: 专业、理性、有见解
- 热门形式: 长回答、专栏文章
- 关键要素: 逻辑清晰、数据支撑、专业性`,

    'bilibili': `- 用户群体: 年轻人,二次元文化
- 内容风格: 有趣、有梗、互动
- 热门形式: 视频、动态、专栏
- 关键要素: 弹幕文化、UP主互动、社区氛围`
  };

  return characteristics[platformId] || '- 根据平台特性生成适合的内容';
}
