/**
 * 平台字符数限制配置
 * 基于2024年最新数据，定期更新以确保准确性
 * 
 * 数据来源验证：
 * - 微博：2000字符（2016年从140字符增加）
 * - 小红书：1000字符（经验证）
 * - 抖音：2200字符（视频描述，2024年更新）
 * - 微信公众号：20000字符（文章内容）
 * - 知乎：无明确限制，设为10000字符
 * - Twitter/X：280字符
 * - B站：5000字符（视频描述）
 * - 视频号：1000字符（短视频描述）
 */

export interface PlatformLimit {
  /** 平台ID */
  id: string;
  /** 平台名称 */
  name: string;
  /** 最大字符数限制 */
  maxCharacters: number;
  /** 最小字符数限制 */
  minCharacters: number;
  /** 推荐字符数范围 */
  recommendedRange: {
    min: number;
    max: number;
  };
  /** 平台描述 */
  description: string;
  /** 最后更新时间 */
  lastUpdated: string;
  /** 数据来源 */
  source: string;
}

/**
 * 平台字符数限制配置表
 * 按照实际平台限制和最佳实践设置
 */
export const PLATFORM_LIMITS: Record<string, PlatformLimit> = {
  zhihu: {
    id: 'zhihu',
    name: '知乎',
    maxCharacters: 10000,
    minCharacters: 50,
    recommendedRange: { min: 300, max: 8000 },
    description: '知乎回答和文章，支持长篇内容',
    lastUpdated: '2024-01-31',
    source: '平台观察，无明确官方限制'
  },
  
  douyin: {
    id: 'douyin',
    name: '抖音',
    maxCharacters: 2200,
    minCharacters: 10,
    recommendedRange: { min: 50, max: 1800 },
    description: '抖音视频描述，2024年扩展至2200字符',
    lastUpdated: '2024-01-31',
    source: 'TikTok官方文档，抖音同步更新'
  },
  
  xiaohongshu: {
    id: 'xiaohongshu',
    name: '小红书',
    maxCharacters: 1000,
    minCharacters: 10,
    recommendedRange: { min: 50, max: 800 },
    description: '小红书笔记内容，1000字符限制',
    lastUpdated: '2024-01-31',
    source: '多个第三方资源确认'
  },
  
  wechat: {
    id: 'wechat',
    name: '微信公众号',
    maxCharacters: 20000,
    minCharacters: 100,
    recommendedRange: { min: 800, max: 15000 },
    description: '微信公众号文章，支持长篇内容',
    lastUpdated: '2024-01-31',
    source: '微信官方文档'
  },
  
  weibo: {
    id: 'weibo',
    name: '微博',
    maxCharacters: 2000,
    minCharacters: 10,
    recommendedRange: { min: 50, max: 1600 },
    description: '微博发文，2016年从140字符扩展至2000字符',
    lastUpdated: '2024-01-31',
    source: '维基百科和官方确认'
  },
  
  twitter: {
    id: 'twitter',
    name: 'Twitter/X',
    maxCharacters: 280,
    minCharacters: 10,
    recommendedRange: { min: 50, max: 250 },
    description: 'Twitter推文，280字符限制',
    lastUpdated: '2024-01-31',
    source: 'Twitter官方文档'
  },
  
  video: {
    id: 'video',
    name: '视频号',
    maxCharacters: 1000,
    minCharacters: 10,
    recommendedRange: { min: 50, max: 800 },
    description: '微信视频号描述',
    lastUpdated: '2024-01-31',
    source: '微信官方文档'
  },
  
  bilibili: {
    id: 'bilibili',
    name: 'B站',
    maxCharacters: 5000,
    minCharacters: 20,
    recommendedRange: { min: 100, max: 4000 },
    description: 'B站视频描述和动态',
    lastUpdated: '2024-01-31',
    source: 'B站官方文档'
  }
};

/**
 * 获取平台字符数限制
 */
export function getPlatformLimit(platformId: string): PlatformLimit | null {
  return PLATFORM_LIMITS[platformId] || null;
}

/**
 * 获取平台最大字符数
 */
export function getCharCountMax(platformId: string): number {
  const limit = getPlatformLimit(platformId);
  return limit ? limit.maxCharacters : 2000; // 默认值
}

/**
 * 获取平台最小字符数
 */
export function getCharCountMin(platformId: string): number {
  const limit = getPlatformLimit(platformId);
  return limit ? limit.minCharacters : 50; // 默认值
}

/**
 * 获取平台推荐字符数范围
 */
export function getRecommendedRange(platformId: string): { min: number; max: number } {
  const limit = getPlatformLimit(platformId);
  return limit ? limit.recommendedRange : { min: 50, max: 2000 };
}

/**
 * 验证字符数是否在平台限制内
 */
export function validateCharCount(platformId: string, charCount: number): {
  isValid: boolean;
  isInRecommendedRange: boolean;
  message: string;
} {
  const limit = getPlatformLimit(platformId);
  
  if (!limit) {
    return {
      isValid: true,
      isInRecommendedRange: true,
      message: '未知平台，使用默认限制'
    };
  }
  
  const isValid = charCount >= limit.minCharacters && charCount <= limit.maxCharacters;
  const isInRecommendedRange = charCount >= limit.recommendedRange.min && charCount <= limit.recommendedRange.max;
  
  let message = '';
  if (!isValid) {
    if (charCount < limit.minCharacters) {
      message = `内容过短，${limit.name}最少需要${limit.minCharacters}字符`;
    } else {
      message = `内容过长，${limit.name}最多支持${limit.maxCharacters}字符`;
    }
  } else if (!isInRecommendedRange) {
    message = `建议字符数范围：${limit.recommendedRange.min}-${limit.recommendedRange.max}字符`;
  } else {
    message = '字符数符合要求';
  }
  
  return { isValid, isInRecommendedRange, message };
}

/**
 * 获取所有支持的平台列表
 */
export function getAllPlatforms(): PlatformLimit[] {
  return Object.values(PLATFORM_LIMITS);
}

/**
 * 🎯 统一字符数控制系统 - 严格按照优先级规范执行
 *
 * 优先级顺序：
 * 1. 平台特定设置（用户自定义，但不超过平台限制）
 * 2. 预设版本设置（精简/标准/详细）
 * 3. 全局自动适配设置（平台限制的90%-95%）
 */
export function getUnifiedCharCountLimit(
  platformId: string,
  globalPreset: 'auto' | 'mini' | 'standard' | 'detailed',
  platformSpecificSetting?: number
): {
  finalLimit: number;
  source: 'platform-specific' | 'preset' | 'auto-adapt';
  range: { min: number; max: number };
  description: string;
} {
  const platformLimit = getPlatformLimit(platformId);
  const platformMaxLimit = platformLimit ? platformLimit.maxCharacters : 2000;

  // 🥇 优先级1: 平台特定设置（最高优先级）
  if (platformSpecificSetting && platformSpecificSetting > 0) {
    let adjustedLimit = platformSpecificSetting;

    // 校验：用户设置不能超过平台限制
    if (platformSpecificSetting > platformMaxLimit) {
      adjustedLimit = Math.floor(platformMaxLimit * 0.95); // 自动调整为平台限制的95%
      console.warn(`用户设置${platformSpecificSetting}字符超出${platformLimit?.name || platformId}平台限制${platformMaxLimit}字符，已自动调整为${adjustedLimit}字符`);
    }

    return {
      finalLimit: adjustedLimit,
      source: 'platform-specific',
      range: {
        min: Math.floor(adjustedLimit * 0.95), // 用户设置的95%作为最小值
        max: adjustedLimit // 用户设置作为最大值
      },
      description: `用户为${platformLimit?.name || platformId}设置的自定义字符数限制`
    };
  }

  // 🥈 优先级2: 预设版本设置
  if (globalPreset !== 'auto') {
    const presetConfig = getCharCountByPreset(platformId, globalPreset);
    return {
      finalLimit: presetConfig.target,
      source: 'preset',
      range: { min: presetConfig.min, max: presetConfig.max },
      description: `${getPresetDescription(globalPreset)}预设的字符数限制`
    };
  }

  // 🥉 优先级3: 全局自动适配设置（平台限制的90%-95%）
  const autoAdaptMin = Math.floor(platformMaxLimit * 0.9);
  const autoAdaptMax = Math.floor(platformMaxLimit * 0.95);
  const autoAdaptTarget = Math.floor(platformMaxLimit * 0.92); // 默认92%

  return {
    finalLimit: autoAdaptTarget,
    source: 'auto-adapt',
    range: { min: autoAdaptMin, max: autoAdaptMax },
    description: `${platformLimit?.name || platformId}平台自动适配（平台限制的90%-95%）`
  };
}

/**
 * 获取预设版本的描述
 */
function getPresetDescription(preset: 'mini' | 'standard' | 'detailed'): string {
  const descriptions = {
    mini: '精简版',
    standard: '标准版',
    detailed: '详细版'
  };
  return descriptions[preset];
}

/**
 * 计算目标字符数（基于平台限制的百分比）
 */
export function calculateTargetCharCount(
  platformId: string, 
  percentage: number = 0.9
): number {
  const limit = getPlatformLimit(platformId);
  if (!limit) return Math.floor(2000 * percentage);
  
  return Math.floor(limit.maxCharacters * percentage);
}

/**
 * 根据预设模式计算字符数目标
 */
export function getCharCountByPreset(
  platformId: string,
  preset: 'mini' | 'standard' | 'detailed' | 'auto'
): { min: number; max: number; target: number } {
  const limit = getPlatformLimit(platformId);
  const maxChars = limit ? limit.maxCharacters : 2000;
  
  switch (preset) {
    case 'mini':
      return {
        min: 50,
        max: Math.min(200, Math.floor(maxChars * 0.9)),
        target: Math.min(150, Math.floor(maxChars * 0.75))
      };
      
    case 'standard':
      return {
        min: 200,
        max: Math.min(800, Math.floor(maxChars * 0.9)),
        target: Math.min(600, Math.floor(maxChars * 0.8))
      };
      
    case 'detailed':
      // 详细版确保至少800字，目标为平台限制的85-90%
      const detailedMin = 800;
      const detailedTarget = Math.floor(maxChars * 0.87);
      return {
        min: detailedMin,
        max: Math.max(detailedTarget, detailedMin),
        target: Math.max(detailedTarget, detailedMin)
      };
      
    case 'auto':
    default:
      return {
        min: Math.floor(maxChars * 0.7),
        max: Math.floor(maxChars * 0.95),
        target: Math.floor(maxChars * 0.85)
      };
  }
}

/**
 * 获取平台特定的字符数控制建议
 */
export function getPlatformCharCountAdvice(platformId: string): string {
  const limit = getPlatformLimit(platformId);
  if (!limit) return '建议控制在合理范围内';
  
  const advice: Record<string, string> = {
    zhihu: '知乎用户喜欢深度内容，建议300字以上，详细版可达8000字',
    douyin: '抖音重视视觉内容，文案简洁有力，50-200字最佳',
    xiaohongshu: '小红书注重生活分享，建议100-500字，配合精美图片',
    wechat: '公众号支持长文，建议800字以上，详细版可达15000字',
    weibo: '微博适合热点讨论，建议50-300字，简洁有力',
    twitter: 'Twitter限制较严，需要精炼表达，建议100-250字符',
    video: '视频号重视视频内容，文案辅助，50-200字最佳',
    bilibili: 'B站用户喜欢详细介绍，建议200-1000字'
  };
  
  return advice[platformId] || '根据平台特性调整内容长度';
}
