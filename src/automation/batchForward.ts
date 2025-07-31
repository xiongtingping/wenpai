/**
 * 批量转发自动化模块
 * 简化版本，不依赖Playwright，使用浏览器原生API
 */

interface ForwardResult {
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

        // 查找所有平台结果卡片
        const resultCards = document.querySelectorAll('[data-testid*="platform-result"], .platform-card, .result-card');

        resultCards.forEach((card, index) => {
          const platformId = card.getAttribute('data-platform-id') ||
                           card.getAttribute('data-platform') ||
                           `platform-${index}`;

          const platformNameElement = card.querySelector('.platform-name, [data-testid="platform-name"], .platform-title');
          const platformName = platformNameElement?.textContent?.trim() || `平台${index + 1}`;

          const contentElement = card.querySelector('.platform-content, .content-display, [data-testid="content-text"], .generated-content');
          const content = contentElement?.textContent?.trim() || '';

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
          console.log('尝试查找版本内容...');
          const versionElements = document.querySelectorAll('[data-testid*="version"], .version-content, .content-version');

          versionElements.forEach((element, index) => {
            const content = element.textContent?.trim() || '';
            if (content.length > 20) {
              platformData.push({
                platformId: `version-${index}`,
                platformName: `版本${index + 1}`,
                content
              });
            }
          });
        }

        console.log(`📋 提取到 ${platformData.length} 个平台的内容`);
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
 * 便捷函数：执行批量转发
 */
export async function executeBatchForward(options: BatchForwardOptions): Promise<ForwardResult[]> {
  const automation = new BatchForwardAutomation(options);
  return await automation.executeBatchForward();
}
