/**
 * 内容适配器服务使用示例
 * 展示如何使用新的服务层替代原有的分散调用
 */

import { ContentAdapterService } from '../services/contentAdapterService';
import type { GlobalSettings, PlatformSettings } from '../services/contentAdapterService';

// 示例配置
const exampleGlobalSettings: GlobalSettings = {
  charCountPreset: 'standard',
  globalEmoji: true,
  globalMd: false,
  globalAutoFormat: true
};

const examplePlatformSettings: Record<string, PlatformSettings> = {
  'douyin': {
    charCount: 200,
    useEmoji: true,
    useMdFormat: false,
    useAutoFormat: true
  },
  'xiaohongshu': {
    charCount: 500,
    useEmoji: true,
    useMdFormat: false,
    useAutoFormat: true
  },
  'zhihu': {
    charCount: 2000,
    useEmoji: false,
    useMdFormat: true,
    useAutoFormat: true
  }
};

/**
 * 创建服务实例
 */
export function createContentAdapterService(
  globalSettings: GlobalSettings = exampleGlobalSettings,
  platformSettings: Record<string, PlatformSettings> = examplePlatformSettings
): ContentAdapterService {
  return new ContentAdapterService(globalSettings, platformSettings);
}

/**
 * 示例：基础内容生成
 */
export async function exampleBasicGeneration() {
  const service = createContentAdapterService();

  const result = await service.generateContent({
    originalContent: '今天分享一个很棒的产品使用心得',
    platform: 'xiaohongshu',
    formId: 'product-review',
    style: 'real',
    charCount: 500,
    model: 'deepseek-chat'
  });

  if (result.success) {
    console.log('生成成功:', result.content);
    console.log('Token使用:', result.tokenUsage);
  } else {
    console.error('生成失败:', result.error);
  }

  return result;
}

/**
 * 示例：版本内容生成
 */
export async function exampleVersionGeneration() {
  const service = createContentAdapterService();

  // 生成标准版本
  const standardResult = await service.generateVersionContent({
    originalContent: '分享一个高效的工作方法',
    platform: 'zhihu',
    formId: 'deep-analysis',
    style: 'professional',
    versionType: 'standard'
  });

  // 生成创意版本
  const creativeResult = await service.generateVersionContent({
    originalContent: '分享一个高效的工作方法',
    platform: 'zhihu',
    formId: 'deep-analysis',
    style: 'professional',
    versionType: 'creative'
  });

  return { standardResult, creativeResult };
}

/**
 * 示例：对比内容生成
 */
export async function exampleComparisonGeneration() {
  const service = createContentAdapterService();

  const result = await service.generateComparisonContent({
    originalContent: '推荐一个好用的APP',
    platform: 'douyin',
    formId: 'product-review',
    style: 'funny',
    alternativeFormId: 'comedy-reversal',
    alternativeStyle: 'hook'
  });

  return result;
}

/**
 * 示例：标题生成
 */
export async function exampleTitleGeneration() {
  const service = createContentAdapterService();

  const result = await service.generateTitle(
    '今天要分享的是一个改变我生活的小技巧，简单易学但效果惊人...'
  );

  if (result.success) {
    console.log('生成的标题:', result.content);
  }

  return result;
}

/**
 * 示例：品牌库集成
 */
export async function exampleBrandIntegration() {
  const service = createContentAdapterService();

  const brandProfile = {
    name: '科技前沿',
    tone: '专业友好',
    keywords: ['创新', '科技', '未来'],
    values: ['用户至上', '持续创新'],
    targetAudience: ['科技爱好者', '专业人士']
  };

  const result = await service.generateContent({
    originalContent: '介绍最新的AI技术发展',
    platform: 'wechat',
    formId: 'deep-analysis',
    style: 'professional',
    useBrandLibrary: true,
    brandProfile,
    charCount: 1500
  });

  return result;
}

/**
 * 示例：批量生成多平台内容
 */
export async function exampleMultiPlatformGeneration() {
  const service = createContentAdapterService();
  const platforms = ['douyin', 'xiaohongshu', 'weibo', 'zhihu'];
  
  const originalContent = '分享一个提高工作效率的方法';
  
  const results = await Promise.all(
    platforms.map(platform => 
      service.generateContent({
        originalContent,
        platform,
        style: 'real'
      })
    )
  );

  return platforms.reduce((acc, platform, index) => {
    acc[platform] = results[index];
    return acc;
  }, {} as Record<string, any>);
}

/**
 * 示例：错误处理和重试
 */
export async function exampleErrorHandling() {
  const service = createContentAdapterService();

  try {
    const result = await service.generateContent({
      originalContent: '测试内容',
      platform: 'douyin',
      model: 'invalid-model' // 故意使用无效模型
    });

    if (!result.success) {
      console.log('第一次尝试失败，进行重试...');
      
      // 重试，使用默认模型
      const retryResult = await service.generateContent({
        originalContent: '测试内容',
        platform: 'douyin'
      });

      return retryResult;
    }

    return result;
  } catch (error) {
    console.error('生成过程中发生错误:', error);
    return { success: false, error: '生成失败' };
  }
}

/**
 * 示例：动态更新设置
 */
export async function exampleDynamicSettings() {
  const service = createContentAdapterService();

  // 初始生成
  const result1 = await service.generateContent({
    originalContent: '测试内容',
    platform: 'douyin'
  });

  // 更新设置
  const newGlobalSettings: GlobalSettings = {
    charCountPreset: 'detailed',
    globalEmoji: false,
    globalMd: true,
    globalAutoFormat: false
  };

  service.updateSettings(newGlobalSettings, examplePlatformSettings);

  // 使用新设置生成
  const result2 = await service.generateContent({
    originalContent: '测试内容',
    platform: 'douyin'
  });

  return { result1, result2 };
}
