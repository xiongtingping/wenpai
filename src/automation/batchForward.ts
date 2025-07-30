import { chromium, Page, Browser, BrowserContext } from 'playwright';

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

export class BatchForwardAutomation {
  private browser: Browser | null = null;
  private context: BrowserContext | null = null;
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
   * 执行批量转发自动化
   */
  async executeBatchForward(): Promise<ForwardResult[]> {
    const results: ForwardResult[] = [];
    
    try {
      console.log('🚀 启动批量转发自动化...');
      await this.initBrowser();
      
      // 打开适配器页面
      const adaptPage = await this.openAdaptPage();
      
      // 等待页面加载完成
      await adaptPage.waitForLoadState('networkidle');
      
      // 检查是否有生成的内容
      const hasContent = await this.checkContentAvailable(adaptPage);
      if (!hasContent) {
        throw new Error('页面中没有可转发的内容，请先生成内容');
      }
      
      // 获取平台内容数据
      const platformData = await this.extractPlatformData(adaptPage);
      console.log(`📋 发现 ${platformData.length} 个平台的内容`);
      
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
    } finally {
      await this.cleanup();
    }
  }

  /**
   * 初始化浏览器
   */
  private async initBrowser(): Promise<void> {
    this.browser = await chromium.launch({
      headless: this.options.headless,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    this.context = await this.browser.newContext({
      viewport: { width: 1920, height: 1080 },
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    });
  }

  /**
   * 打开适配器页面
   */
  private async openAdaptPage(): Promise<Page> {
    if (!this.context) throw new Error('浏览器上下文未初始化');
    
    const page = await this.context.newPage();
    await page.goto(`${this.options.baseUrl}/adapt`, { 
      waitUntil: 'networkidle',
      timeout: this.options.timeout 
    });
    
    return page;
  }

  /**
   * 检查是否有可转发的内容
   */
  private async checkContentAvailable(page: Page): Promise<boolean> {
    try {
      // 检查是否有版本内容或生成的内容
      const hasVersions = await page.locator('[data-testid="version-content"]').count() > 0;
      const hasGeneratedContent = await page.locator('[data-testid="generated-content"]').count() > 0;
      
      return hasVersions || hasGeneratedContent;
    } catch (error) {
      console.warn('检查内容可用性时出错:', error);
      return false;
    }
  }

  /**
   * 提取平台内容数据
   */
  private async extractPlatformData(page: Page): Promise<Array<{
    platformId: string;
    content: string;
    platformName: string;
  }>> {
    const platformData: Array<{
      platformId: string;
      content: string;
      platformName: string;
    }> = [];

    try {
      // 查找所有平台卡片
      const platformCards = await page.locator('[data-testid="platform-card"]').all();
      
      for (const card of platformCards) {
        try {
          // 获取平台ID
          const platformId = await card.getAttribute('data-platform-id');
          if (!platformId) continue;
          
          // 获取平台名称
          const platformNameElement = await card.locator('[data-testid="platform-name"]').first();
          const platformName = await platformNameElement.textContent() || platformId;
          
          // 优先获取版本内容，如果没有则获取主内容
          let content = '';
          
          // 尝试获取版本A的内容
          const versionAContent = await card.locator('[data-testid="version-a-content"]').first();
          if (await versionAContent.count() > 0) {
            content = await versionAContent.textContent() || '';
          } else {
            // 获取主内容
            const mainContent = await card.locator('[data-testid="main-content"]').first();
            if (await mainContent.count() > 0) {
              content = await mainContent.textContent() || '';
            }
          }
          
          if (content.trim()) {
            platformData.push({
              platformId,
              content: content.trim(),
              platformName
            });
          }
        } catch (error) {
          console.warn(`提取平台 ${platformId} 数据时出错:`, error);
        }
      }
    } catch (error) {
      console.error('提取平台数据时出错:', error);
    }

    return platformData;
  }

  /**
   * 处理单个平台的转发
   */
  private async handleSinglePlatform(platformData: {
    platformId: string;
    content: string;
    platformName: string;
  }): Promise<ForwardResult> {
    let retryCount = 0;
    
    while (retryCount < this.options.retryCount!) {
      try {
        console.log(`📝 处理 ${platformData.platformName} (${platformData.platformId}), 重试次数: ${retryCount + 1}`);
        
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
        retryCount++;
        console.warn(`平台 ${platformData.platformId} 第 ${retryCount} 次尝试失败:`, error);
        
        if (retryCount >= this.options.retryCount!) {
          return {
            platform: platformData.platformId,
            success: false,
            error: error instanceof Error ? error.message : '未知错误'
          };
        }
        
        // 重试前等待
        await this.delay(2000 * retryCount);
      }
    }
    
    return {
      platform: platformData.platformId,
      success: false,
      error: '达到最大重试次数'
    };
  }

  /**
   * 复制内容到剪贴板
   */
  private async copyContentToClipboard(content: string): Promise<void> {
    if (!this.context) throw new Error('浏览器上下文未初始化');
    
    // 创建一个临时页面来执行复制操作
    const tempPage = await this.context.newPage();
    
    try {
      await tempPage.evaluate((text) => {
        return navigator.clipboard.writeText(text);
      }, content);
      
      console.log(`📋 内容已复制到剪贴板 (${content.length} 字符)`);
    } finally {
      await tempPage.close();
    }
  }

  /**
   * 导航到发布页面
   */
  private async navigateToPublishPage(url: string): Promise<boolean> {
    if (!this.context) throw new Error('浏览器上下文未初始化');
    
    try {
      const publishPage = await this.context.newPage();
      await publishPage.goto(url, { 
        waitUntil: 'domcontentloaded',
        timeout: this.options.timeout 
      });
      
      console.log(`🌐 已打开发布页面: ${url}`);
      
      // 页面保持打开状态，让用户手动操作
      // 在实际使用中，这里可以添加更多自动化操作
      
      return true;
    } catch (error) {
      console.error(`无法打开发布页面 ${url}:`, error);
      return false;
    }
  }

  /**
   * 获取平台发布URL
   */
  private getPlatformPublishUrl(platformId: string): string | null {
    const platformUrls: Record<string, string> = {
      weibo: 'https://weibo.com/newpost',
      xiaohongshu: 'https://creator.xiaohongshu.com/publish',
      zhihu: 'https://zhuanlan.zhihu.com/write',
      bilibili: 'https://member.bilibili.com/platform/upload/text',
      douyin: 'https://creator.douyin.com/creator-micro/content/upload',
      toutiao: 'https://mp.toutiao.com/profile_v4/graphic/publish',
      baijiahao: 'https://baijiahao.baidu.com/builder/rc/edit',
      kuaishou: 'https://cp.kuaishou.com/article/publish',
      wechat: 'https://mp.weixin.qq.com/',
      twitter: 'https://twitter.com/compose/tweet'
    };
    
    return platformUrls[platformId] || null;
  }

  /**
   * 延迟函数
   */
  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * 清理资源
   */
  private async cleanup(): Promise<void> {
    try {
      if (this.context) {
        await this.context.close();
        this.context = null;
      }
      
      if (this.browser) {
        await this.browser.close();
        this.browser = null;
      }
    } catch (error) {
      console.warn('清理资源时出错:', error);
    }
  }
}

/**
 * 便捷函数：执行批量转发
 */
export async function executeBatchForward(options: BatchForwardOptions): Promise<ForwardResult[]> {
  const automation = new BatchForwardAutomation(options);
  return await automation.executeBatchForward();
}
