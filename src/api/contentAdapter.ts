/**
 * 内容适配器API
 * 用于生成不同平台适配的内容
 */

import { generatePlatformContent, type StyleType } from '@/config/contentSchemes';

/**
 * 内容适配请求参数
 */
export interface ContentAdaptationRequest {
  originalContent: string;
  platform: string;
  schemeId?: string;
  style?: StyleType;
}

/**
 * 内容适配响应
 */
export interface ContentAdaptationResponse {
  success: boolean;
  data?: {
    adaptedContent: string;
    platform: string;
    schemeId: string;
    style: StyleType;
    prompt: string;
  };
  error?: string;
}

/**
 * 生成平台适配内容
 * @param request 内容适配请求参数
 * @returns 适配后的内容
 */
export async function generateAdaptedContent(
  request: ContentAdaptationRequest
): Promise<ContentAdaptationResponse> {
  try {
    const { originalContent, platform, schemeId = 'global-adaptation', style = 'professional' } = request;

    if (!originalContent.trim()) {
      return {
        success: false,
        error: '原始内容不能为空'
      };
    }

    if (!platform) {
      return {
        success: false,
        error: '请选择目标平台'
      };
    }

    // 生成适配内容
    const prompt = generatePlatformContent(originalContent, platform, schemeId, style);

    return {
      success: true,
      data: {
        adaptedContent: prompt,
        platform,
        schemeId,
        style,
        prompt
      }
    };
  } catch (error) {
    console.error('生成适配内容失败:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : '生成适配内容失败'
    };
  }
}

/**
 * 重新生成平台适配内容
 * @param request 内容适配请求参数
 * @returns 重新适配后的内容
 */
export async function regenerateAdaptedContent(
  request: ContentAdaptationRequest
): Promise<ContentAdaptationResponse> {
  try {
    const { originalContent, platform, schemeId = 'global-adaptation', style = 'professional' } = request;

    if (!originalContent.trim()) {
      return {
        success: false,
        error: '原始内容不能为空'
      };
    }

    if (!platform) {
      return {
        success: false,
        error: '请选择目标平台'
      };
    }

    // 重新生成适配内容（可以添加一些随机性来获得不同的结果）
    const prompt = generatePlatformContent(originalContent, platform, schemeId, style);

    return {
      success: true,
      data: {
        adaptedContent: prompt,
        platform,
        schemeId,
        style,
        prompt
      }
    };
  } catch (error) {
    console.error('重新生成适配内容失败:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : '重新生成适配内容失败'
    };
  }
}

/**
 * 批量生成多平台适配内容
 * @param originalContent 原始内容
 * @param platforms 目标平台列表
 * @param schemeId 方案ID
 * @param style 风格类型
 * @returns 多平台适配内容
 */
export async function generateMultiPlatformContent(
  originalContent: string,
  platforms: string[],
  schemeId: string = 'global-adaptation',
  style: StyleType = 'professional'
): Promise<ContentAdaptationResponse[]> {
  try {
    if (!originalContent.trim()) {
      return platforms.map(() => ({
        success: false,
        error: '原始内容不能为空'
      }));
    }

    if (platforms.length === 0) {
      return [{
        success: false,
        error: '请选择至少一个目标平台'
      }];
    }

    // 并行生成多平台内容
    const promises = platforms.map(platform => 
      generateAdaptedContent({
        originalContent,
        platform,
        schemeId,
        style
      })
    );

    const results = await Promise.all(promises);
    return results;
  } catch (error) {
    console.error('批量生成多平台内容失败:', error);
    return platforms.map(() => ({
      success: false,
      error: error instanceof Error ? error.message : '批量生成多平台内容失败'
    }));
  }
}

/**
 * 获取平台列表
 */
export function getAvailablePlatforms() {
  return [
    { id: 'xiaohongshu', name: '小红书', icon: '📖' },
    { id: 'weibo', name: '微博', icon: '🐦' },
    { id: 'wechat', name: '微信', icon: '💬' },
    { id: 'douyin', name: '抖音', icon: '🎵' },
    { id: 'zhihu', name: '知乎', icon: '🤔' },
    { id: 'bilibili', name: 'B站', icon: '📺' }
  ];
}

/**
 * 获取风格列表
 */
export function getAvailableStyles() {
  return [
    { id: 'professional', name: '专业风格', description: '专业 + 客观 + 洞察', icon: '🎯' },
    { id: 'funny', name: '幽默风格', description: '幽默 + 自嘲 + 网络热词 + 惊叹 + 标题党', icon: '😄' },
    { id: 'real', name: '真实风格', description: '真实感 + 主观 + 分享型', icon: '💝' },
    { id: 'hook', name: '钩子风格', description: '钩子型 + 精准用户导向 + 高点击转化', icon: '🎣' }
  ];
}