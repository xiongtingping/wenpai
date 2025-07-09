/**
 * 平台API直发服务
 * 支持主流平台的内容直接发布功能
 * 需要用户配置相应的API密钥和授权信息
 */

/**
 * 平台API配置接口
 */
export interface PlatformApiConfig {
  /** 平台标识 */
  platformId: string;
  /** 平台名称 */
  platformName: string;
  /** API密钥 */
  apiKey?: string;
  /** 访问令牌 */
  accessToken?: string;
  /** 用户ID */
  userId?: string;
  /** 是否已授权 */
  isAuthorized: boolean;
  /** 授权URL */
  authUrl?: string;
  /** API基础URL */
  apiBaseUrl?: string;
}

/**
 * 发布内容接口
 */
export interface PublishContent {
  /** 内容文本 */
  text: string;
  /** 标题 */
  title?: string;
  /** 图片URL数组 */
  images?: string[];
  /** 视频URL */
  video?: string;
  /** 话题标签 */
  hashtags?: string[];
  /** 发布时间（定时发布） */
  scheduledTime?: string;
  /** 可见性设置 */
  visibility?: 'public' | 'private' | 'friends';
}

/**
 * 发布结果接口
 */
export interface PublishResult {
  /** 是否成功 */
  success: boolean;
  /** 发布ID */
  publishId?: string;
  /** 发布URL */
  publishUrl?: string;
  /** 错误信息 */
  error?: string;
  /** 平台响应 */
  response?: any;
}

/**
 * 支持的平台API配置
 */
export const SUPPORTED_PLATFORMS: Record<string, PlatformApiConfig> = {
  weibo: {
    platformId: 'weibo',
    platformName: '微博',
    authUrl: 'https://open.weibo.com/oauth2/authorize',
    apiBaseUrl: 'https://api.weibo.com/2',
    isAuthorized: false
  },
  zhihu: {
    platformId: 'zhihu',
    platformName: '知乎',
    authUrl: 'https://www.zhihu.com/oauth/authorize',
    apiBaseUrl: 'https://api.zhihu.com',
    isAuthorized: false
  },
  xiaohongshu: {
    platformId: 'xiaohongshu',
    platformName: '小红书',
    authUrl: 'https://oauth.xiaohongshu.com/oauth/authorize',
    apiBaseUrl: 'https://api.xiaohongshu.com',
    isAuthorized: false
  },
  bilibili: {
    platformId: 'bilibili',
    platformName: 'B站',
    authUrl: 'https://passport.bilibili.com/login',
    apiBaseUrl: 'https://api.bilibili.com',
    isAuthorized: false
  },
  douyin: {
    platformId: 'douyin',
    platformName: '抖音',
    authUrl: 'https://open.douyin.com/oauth/authorize',
    apiBaseUrl: 'https://open.douyin.com',
    isAuthorized: false
  },
  twitter: {
    platformId: 'twitter',
    platformName: 'Twitter',
    authUrl: 'https://twitter.com/i/oauth2/authorize',
    apiBaseUrl: 'https://api.twitter.com/2',
    isAuthorized: false
  },
  linkedin: {
    platformId: 'linkedin',
    platformName: 'LinkedIn',
    authUrl: 'https://www.linkedin.com/oauth/v2/authorization',
    apiBaseUrl: 'https://api.linkedin.com/v2',
    isAuthorized: false
  }
};

/**
 * 获取平台API配置
 * @param platformId 平台ID
 * @returns PlatformApiConfig 平台配置
 */
export function getPlatformApiConfig(platformId: string): PlatformApiConfig | null {
  return SUPPORTED_PLATFORMS[platformId] || null;
}

/**
 * 获取所有支持的平台
 * @returns PlatformApiConfig[] 支持的平台列表
 */
export function getSupportedPlatforms(): PlatformApiConfig[] {
  return Object.values(SUPPORTED_PLATFORMS);
}

/**
 * 保存平台API配置到本地存储
 * @param platformId 平台ID
 * @param config 配置信息
 */
export function savePlatformApiConfig(platformId: string, config: Partial<PlatformApiConfig>): void {
  const key = `platform_api_config_${platformId}`;
  localStorage.setItem(key, JSON.stringify(config));
}

/**
 * 从本地存储获取平台API配置
 * @param platformId 平台ID
 * @returns PlatformApiConfig | null 平台配置
 */
export function loadPlatformApiConfig(platformId: string): PlatformApiConfig | null {
  const key = `platform_api_config_${platformId}`;
  const stored = localStorage.getItem(key);
  if (!stored) return null;
  
  try {
    const config = JSON.parse(stored);
    return { ...SUPPORTED_PLATFORMS[platformId], ...config };
  } catch {
    return null;
  }
}

/**
 * 清除平台API配置
 * @param platformId 平台ID
 */
export function clearPlatformApiConfig(platformId: string): void {
  const key = `platform_api_config_${platformId}`;
  localStorage.removeItem(key);
}

/**
 * 微博API发布
 * @param content 发布内容
 * @param config 平台配置
 * @returns Promise<PublishResult> 发布结果
 */
async function publishToWeibo(content: PublishContent, config: PlatformApiConfig): Promise<PublishResult> {
  try {
    if (!config.accessToken) {
      return { success: false, error: '未授权，请先完成微博授权' };
    }

    const response = await fetch(`${config.apiBaseUrl}/statuses/update.json`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Bearer ${config.accessToken}`
      },
      body: new URLSearchParams({
        status: content.text,
        source: 'wenpai-app'
      })
    });

    const data = await response.json();
    
    if (data.id) {
      return {
        success: true,
        publishId: data.id,
        publishUrl: `https://weibo.com/${data.user?.id}/${data.id}`,
        response: data
      };
    } else {
      return { success: false, error: data.error || '发布失败' };
    }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : '网络错误' };
  }
}

/**
 * 知乎API发布
 * @param content 发布内容
 * @param config 平台配置
 * @returns Promise<PublishResult> 发布结果
 */
async function publishToZhihu(content: PublishContent, config: PlatformApiConfig): Promise<PublishResult> {
  try {
    if (!config.accessToken) {
      return { success: false, error: '未授权，请先完成知乎授权' };
    }

    // 知乎API需要先创建草稿，然后发布
    const draftResponse = await fetch(`${config.apiBaseUrl}/drafts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.accessToken}`
      },
      body: JSON.stringify({
        title: content.title || '新文章',
        content: content.text,
        topics: content.hashtags || []
      })
    });

    const draftData = await draftResponse.json();
    
    if (draftData.id) {
      // 发布草稿
      const publishResponse = await fetch(`${config.apiBaseUrl}/drafts/${draftData.id}/publish`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${config.accessToken}`
        }
      });

      const publishData = await publishResponse.json();
      
      if (publishData.url) {
        return {
          success: true,
          publishId: draftData.id,
          publishUrl: publishData.url,
          response: publishData
        };
      }
    }
    
    return { success: false, error: '发布失败' };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : '网络错误' };
  }
}

/**
 * Twitter API发布
 * @param content 发布内容
 * @param config 平台配置
 * @returns Promise<PublishResult> 发布结果
 */
async function publishToTwitter(content: PublishContent, config: PlatformApiConfig): Promise<PublishResult> {
  try {
    if (!config.accessToken) {
      return { success: false, error: '未授权，请先完成Twitter授权' };
    }

    const response = await fetch(`${config.apiBaseUrl}/tweets`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.accessToken}`
      },
      body: JSON.stringify({
        text: content.text
      })
    });

    const data = await response.json();
    
    if (data.data?.id) {
      return {
        success: true,
        publishId: data.data.id,
        publishUrl: `https://twitter.com/user/status/${data.data.id}`,
        response: data
      };
    } else {
      return { success: false, error: data.errors?.[0]?.message || '发布失败' };
    }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : '网络错误' };
  }
}

/**
 * 通用发布函数
 * @param platformId 平台ID
 * @param content 发布内容
 * @returns Promise<PublishResult> 发布结果
 */
export async function publishContent(platformId: string, content: PublishContent): Promise<PublishResult> {
  const config = loadPlatformApiConfig(platformId);
  if (!config) {
    return { success: false, error: '平台配置不存在' };
  }

  switch (platformId) {
    case 'weibo':
      return await publishToWeibo(content, config);
    case 'zhihu':
      return await publishToZhihu(content, config);
    case 'twitter':
      return await publishToTwitter(content, config);
    default:
      return { success: false, error: '暂不支持该平台的API直发' };
  }
}

/**
 * 批量发布内容
 * @param platforms 平台ID数组
 * @param content 发布内容
 * @returns Promise<PublishResult[]> 发布结果数组
 */
export async function batchPublishContent(platforms: string[], content: PublishContent): Promise<PublishResult[]> {
  const results: PublishResult[] = [];
  
  for (const platformId of platforms) {
    try {
      const result = await publishContent(platformId, content);
      results.push(result);
    } catch (error) {
      results.push({
        success: false,
        error: error instanceof Error ? error.message : '发布失败'
      });
    }
  }
  
  return results;
}

/**
 * 检查平台授权状态
 * @param platformId 平台ID
 * @returns boolean 是否已授权
 */
export function checkPlatformAuth(platformId: string): boolean {
  const config = loadPlatformApiConfig(platformId);
  return config?.isAuthorized || false;
}

/**
 * 获取平台授权URL
 * @param platformId 平台ID
 * @returns string | null 授权URL
 */
export function getPlatformAuthUrl(platformId: string): string | null {
  const config = getPlatformApiConfig(platformId);
  return config?.authUrl || null;
} 