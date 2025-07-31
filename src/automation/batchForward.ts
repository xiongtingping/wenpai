/**
 * 批量转发自动化模块
 * 增强版本，集成多种自动化技术栈
 */

import { AutomationEngine, PlatformContent, ForwardResult, AutomationOptions, AutomationProgress } from './AutomationEngine';

// 保持向后兼容的接口
interface LegacyForwardResult {
  platform: string;
  success: boolean;
  error?: string;
  url?: string;
  content?: string;
}

interface BatchForwardOptions {
  baseUrl: string;
  platforms: string[];
  headless?: boolean;
  timeout?: number;
  retryCount?: number;
  // 新增选项
  enablePreview?: boolean;
  enableConfirmation?: boolean;
  method?: 'auto' | 'browser' | 'extension' | 'script' | 'rpa';
  onProgress?: (progress: AutomationProgress) => void;
}

/**
 * 平台发布URL映射
 */
const PLATFORM_URLS = {
  'xiaohongshu': 'https://creator.xiaohongshu.com/publish/publish',
  'weibo': 'https://weibo.com/compose',
  'wechat': 'https://mp.weixin.qq.com',
  'douyin': 'https://creator.douyin.com/creator-micro/content/upload',
  'zhihu': 'https://zhuanlan.zhihu.com/write',
  'bilibili': 'https://member.bilibili.com/platform/upload/text/edit'
};

export class BatchForwardAutomation {
  private options: BatchForwardOptions;

  constructor(options: BatchForwardOptions) {
    this.options = {
      headless: true,
      timeout: 30000,
      retryCount: 3,
      ...options
    };
  }

  /**
   * 执行批量转发自动化（简化版本）
   */
  async executeBatchForward(): Promise<ForwardResult[]> {
    const results: ForwardResult[] = [];

    try {
      console.log('🚀 启动批量转发自动化（简化版本）...');

      // 获取当前页面的内容数据
      const platformData = await this.extractCurrentPageData();
      console.log(`📋 发现 ${platformData.length} 个平台的内容`);

      if (platformData.length === 0) {
        throw new Error('未找到可转发的内容，请先生成内容');
      }

      // 逐个处理选中的平台
      for (const platformId of this.options.platforms) {
        const platformContent = platformData.find(p => p.platformId === platformId);
        if (!platformContent) {
          results.push({
            platform: platformId,
            success: false,
            error: '未找到该平台的内容'
          });
          continue;
        }

        console.log(`🔄 处理平台: ${platformId}`);
        const result = await this.handleSinglePlatform(platformContent);
        results.push(result);

        // 短暂延迟避免过快操作
        await this.delay(1000);
      }

      console.log('✅ 批量转发自动化完成');
      return results;

    } catch (error) {
      console.error('❌ 批量转发自动化失败:', error);
      throw error;
    }
  }

  /**
   * 提取当前页面的平台数据（不依赖Playwright）
   */
  private async extractCurrentPageData(): Promise<Array<{
    platformId: string;
    platformName: string;
    content: string;
  }>> {
    return new Promise((resolve) => {
      try {
        const platformData: Array<{
          platformId: string;
          platformName: string;
          content: string;
        }> = [];

        // 查找所有平台结果卡片（基于实际DOM结构）
        const resultCards = document.querySelectorAll('[data-testid="platform-card"]');

        resultCards.forEach((card, index) => {
          const platformId = card.getAttribute('data-platform-id') || `platform-${index}`;

          const platformNameElement = card.querySelector('[data-testid="platform-name"]');
          const platformName = platformNameElement?.textContent?.trim() || `平台${index + 1}`;

          // 查找版本内容（优先版本A，如果没有则查找版本B）
          let content = '';
          const versionAElement = card.querySelector('[data-testid="version-a-content"]');
          const versionBElement = card.querySelector('[data-testid="version-b-content"]');

          if (versionAElement && versionAElement.textContent?.trim()) {
            content = versionAElement.textContent.trim();
          } else if (versionBElement && versionBElement.textContent?.trim()) {
            content = versionBElement.textContent.trim();
          }

          // 如果找不到版本内容，尝试查找其他可能的内容元素
          if (!content) {
            const fallbackElements = card.querySelectorAll('.content-display, .generated-content, .platform-content');
            for (const element of fallbackElements) {
              const text = element.textContent?.trim();
              if (text && text.length > 20) {
                content = text;
                break;
              }
            }
          }

          if (content && content.length > 20) { // 确保有有效内容
            platformData.push({
              platformId,
              platformName,
              content
            });
          }
        });

        // 如果没有找到标准的卡片，尝试查找版本内容
        if (platformData.length === 0) {
          console.log('🔍 未找到平台卡片，尝试查找版本内容...');

          // 查找所有版本内容元素
          const versionAElements = document.querySelectorAll('[data-testid="version-a-content"]');
          const versionBElements = document.querySelectorAll('[data-testid="version-b-content"]');

          versionAElements.forEach((element, index) => {
            const content = element.textContent?.trim() || '';
            if (content.length > 20) {
              platformData.push({
                platformId: `version-a-${index}`,
                platformName: `版本A-${index + 1}`,
                content
              });
            }
          });

          versionBElements.forEach((element, index) => {
            const content = element.textContent?.trim() || '';
            if (content.length > 20) {
              platformData.push({
                platformId: `version-b-${index}`,
                platformName: `版本B-${index + 1}`,
                content
              });
            }
          });
        }

        // 调试信息
        console.log(`📋 提取到 ${platformData.length} 个平台的内容`);
        if (platformData.length === 0) {
          console.warn('⚠️ 未找到任何可用内容，请确保页面已生成内容');
          console.log('🔍 页面调试信息：');
          console.log('- 平台卡片数量：', document.querySelectorAll('[data-testid="platform-card"]').length);
          console.log('- 版本A内容数量：', document.querySelectorAll('[data-testid="version-a-content"]').length);
          console.log('- 版本B内容数量：', document.querySelectorAll('[data-testid="version-b-content"]').length);
        }

        resolve(platformData);
      } catch (error) {
        console.error('提取平台数据失败:', error);
        resolve([]);
      }
    });
  }

  /**
   * 处理单个平台的转发
   */
  private async handleSinglePlatform(platformData: {
    platformId: string;
    platformName: string;
    content: string;
  }): Promise<ForwardResult> {
    try {
      console.log(`📝 处理 ${platformData.platformName} (${platformData.platformId})`);

      // 复制内容到剪贴板
      await this.copyContentToClipboard(platformData.content);

      // 获取平台发布URL
      const publishUrl = this.getPlatformPublishUrl(platformData.platformId);
      if (!publishUrl) {
        return {
          platform: platformData.platformId,
          success: false,
          error: '未找到该平台的发布URL'
        };
      }

      // 打开平台发布页面
      const success = await this.navigateToPublishPage(publishUrl);

      if (success) {
        return {
          platform: platformData.platformId,
          success: true,
          url: publishUrl,
          content: platformData.content
        };
      } else {
        throw new Error('无法打开发布页面');
      }

    } catch (error) {
      console.error(`平台 ${platformData.platformId} 处理失败:`, error);
      return {
        platform: platformData.platformId,
        success: false,
        error: error instanceof Error ? error.message : '未知错误'
      };
    }
  }

  /**
   * 复制内容到剪贴板
   */
  private async copyContentToClipboard(content: string): Promise<void> {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(content);
        console.log('✅ 内容已复制到剪贴板');
      } else {
        // 降级方案：使用传统的复制方法
        const textArea = document.createElement('textarea');
        textArea.value = content;
        textArea.style.position = 'fixed';
        textArea.style.opacity = '0';
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        console.log('✅ 内容已复制到剪贴板（降级方案）');
      }
    } catch (error) {
      console.error('❌ 复制到剪贴板失败:', error);
      throw new Error('复制内容失败');
    }
  }

  /**
   * 获取平台发布URL
   */
  private getPlatformPublishUrl(platformId: string): string | null {
    return PLATFORM_URLS[platformId as keyof typeof PLATFORM_URLS] || null;
  }

  /**
   * 导航到发布页面
   */
  private async navigateToPublishPage(url: string): Promise<boolean> {
    try {
      // 在新标签页中打开发布页面
      const newWindow = window.open(url, '_blank');
      if (newWindow) {
        console.log(`✅ 已打开发布页面: ${url}`);
        return true;
      } else {
        console.error('❌ 无法打开新窗口，可能被浏览器阻止');
        return false;
      }
    } catch (error) {
      console.error('❌ 打开发布页面失败:', error);
      return false;
    }
  }

  /**
   * 延迟函数
   */
  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

/**
 * 执行批量转发自动化（主要入口函数）
 * 增强版本，支持多种自动化方式
 */
export async function executeBatchForward(options: BatchForwardOptions): Promise<LegacyForwardResult[]> {
  console.log('🚀 启动增强版批量转发自动化...');
  console.log('配置选项:', options);

  try {
    // 创建自动化引擎
    const automationOptions: AutomationOptions = {
      selectedPlatforms: options.platforms,
      enablePreview: options.enablePreview ?? true,
      enableConfirmation: options.enableConfirmation ?? true,
      retryCount: options.retryCount ?? 3,
      timeout: options.timeout ?? 30000,
      method: options.method ?? 'auto'
    };

    const engine = new AutomationEngine(automationOptions);

    // 设置进度回调
    if (options.onProgress) {
      engine.setProgressCallback(options.onProgress);
    }

    // 检测平台内容
    const platformContents = await engine.detectPlatformContent();

    if (platformContents.length === 0) {
      throw new Error('未找到任何可转发的内容，请确保页面已生成内容');
    }

    console.log(`📋 检测到 ${platformContents.length} 个平台的内容`);

    // 执行自动化转发
    const results = await engine.executeForward(platformContents);

    // 转换为向后兼容的格式
    return results.map(result => ({
      platform: result.platformName,
      success: result.success,
      error: result.error,
      url: result.url,
      content: platformContents.find(pc => pc.platformId === result.platformId)?.content
    }));

  } catch (error) {
    console.error('❌ 批量转发失败:', error);
    throw error;
  }
}
