/**
 * 自动化转发核心引擎
 * 支持多种技术栈的自动化转发实现
 */

import { PlatformLimit, getPlatformLimit } from '../config/platformLimits';

// 核心接口定义
export interface PlatformContent {
  platformId: string;
  platformName: string;
  content: string;
  charCount: number;
  versionType: 'A' | 'B';
}

export interface ForwardResult {
  platformId: string;
  platformName: string;
  success: boolean;
  error?: string;
  url?: string;
  method: 'api' | 'automation' | 'manual';
  timestamp: number;
  retryCount: number;
}

export interface AutomationOptions {
  selectedPlatforms?: string[];
  enablePreview?: boolean;
  enableConfirmation?: boolean;
  retryCount?: number;
  timeout?: number;
  method?: 'auto' | 'browser' | 'extension' | 'script' | 'rpa';
}

export interface AutomationProgress {
  total: number;
  completed: number;
  current: string;
  status: 'preparing' | 'running' | 'completed' | 'error' | 'cancelled';
  results: ForwardResult[];
}

// 自动化引擎类
export class AutomationEngine {
  private options: AutomationOptions;
  private progress: AutomationProgress;
  private abortController: AbortController;
  private progressCallback?: (progress: AutomationProgress) => void;

  constructor(options: AutomationOptions = {}) {
    this.options = {
      enablePreview: true,
      enableConfirmation: true,
      retryCount: 3,
      timeout: 30000,
      method: 'auto',
      ...options
    };

    this.progress = {
      total: 0,
      completed: 0,
      current: '',
      status: 'preparing',
      results: []
    };

    this.abortController = new AbortController();
  }

  /**
   * 设置进度回调函数
   */
  setProgressCallback(callback: (progress: AutomationProgress) => void) {
    this.progressCallback = callback;
  }

  /**
   * 更新进度状态
   */
  private updateProgress(updates: Partial<AutomationProgress>) {
    this.progress = { ...this.progress, ...updates };
    if (this.progressCallback) {
      this.progressCallback(this.progress);
    }
  }

  /**
   * 检测页面中的平台内容
   */
  async detectPlatformContent(): Promise<PlatformContent[]> {
    console.log('🔍 开始检测平台内容...');
    
    try {
      const platformData: PlatformContent[] = [];

      // 查找所有平台结果卡片
      const resultCards = document.querySelectorAll('[data-testid="platform-card"]');
      console.log(`📋 找到 ${resultCards.length} 个平台卡片`);

      resultCards.forEach((card, index) => {
        const platformId = card.getAttribute('data-platform-id') || `platform-${index}`;
        
        // 获取平台名称
        const platformNameElement = card.querySelector('[data-testid="platform-name"]');
        const platformName = platformNameElement?.textContent?.trim() || `平台${index + 1}`;

        // 查找版本内容（优先版本A，如果没有则查找版本B）
        let content = '';
        let versionType: 'A' | 'B' = 'A';
        
        const versionAElement = card.querySelector('[data-testid="version-a-content"]');
        const versionBElement = card.querySelector('[data-testid="version-b-content"]');

        if (versionAElement && versionAElement.textContent?.trim()) {
          content = versionAElement.textContent.trim();
          versionType = 'A';
        } else if (versionBElement && versionBElement.textContent?.trim()) {
          content = versionBElement.textContent.trim();
          versionType = 'B';
        }

        // 如果找不到版本内容，尝试查找其他可能的内容元素
        if (!content) {
          const fallbackElements = card.querySelectorAll(
            '.content-display, .generated-content, .platform-content, .result-content'
          );
          
          for (const element of fallbackElements) {
            const text = element.textContent?.trim();
            if (text && text.length > 20) {
              content = text;
              break;
            }
          }
        }

        if (content && content.length > 10) {
          platformData.push({
            platformId,
            platformName,
            content,
            charCount: content.length,
            versionType
          });
        }
      });

      // 如果没有找到标准的卡片，尝试查找版本内容
      if (platformData.length === 0) {
        console.log('🔍 未找到平台卡片，尝试查找版本内容...');
        
        const versionAElements = document.querySelectorAll('[data-testid="version-a-content"]');
        const versionBElements = document.querySelectorAll('[data-testid="version-b-content"]');

        versionAElements.forEach((element, index) => {
          const content = element.textContent?.trim() || '';
          if (content.length > 20) {
            platformData.push({
              platformId: `detected-platform-a-${index}`,
              platformName: `检测到的平台A${index + 1}`,
              content,
              charCount: content.length,
              versionType: 'A'
            });
          }
        });

        versionBElements.forEach((element, index) => {
          const content = element.textContent?.trim() || '';
          if (content.length > 20) {
            platformData.push({
              platformId: `detected-platform-b-${index}`,
              platformName: `检测到的平台B${index + 1}`,
              content,
              charCount: content.length,
              versionType: 'B'
            });
          }
        });
      }

      console.log(`✅ 成功检测到 ${platformData.length} 个平台的内容`);
      return platformData;

    } catch (error) {
      console.error('❌ 检测平台内容失败:', error);
      throw new Error(`内容检测失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  }

  /**
   * 验证内容是否符合平台要求
   */
  validateContent(content: string, platformId: string): { valid: boolean; message: string } {
    const platformLimit = getPlatformLimit(platformId);
    
    if (!platformLimit) {
      return { valid: true, message: '未知平台，跳过验证' };
    }

    if (content.length < platformLimit.minCharacters) {
      return {
        valid: false,
        message: `内容过短，${platformLimit.name}最少需要${platformLimit.minCharacters}字符`
      };
    }

    if (content.length > platformLimit.maxCharacters) {
      return {
        valid: false,
        message: `内容过长，${platformLimit.name}最多支持${platformLimit.maxCharacters}字符`
      };
    }

    return { valid: true, message: '内容符合平台要求' };
  }

  /**
   * 选择最佳的自动化方法
   */
  private selectAutomationMethod(): 'browser' | 'extension' | 'script' | 'manual' {
    if (this.options.method !== 'auto') {
      return this.options.method as any;
    }

    // 检测浏览器插件支持
    if (typeof chrome !== 'undefined' && chrome.runtime) {
      return 'extension';
    }

    // 检测客户端脚本支持
    if (typeof window !== 'undefined' && window.location.protocol === 'file:') {
      return 'script';
    }

    // 默认使用浏览器原生方法
    return 'browser';
  }

  /**
   * 执行自动化转发
   */
  async executeForward(platformContents: PlatformContent[]): Promise<ForwardResult[]> {
    console.log('🚀 开始执行自动化转发...');
    
    // 过滤选中的平台
    const selectedContents = this.options.selectedPlatforms 
      ? platformContents.filter(pc => this.options.selectedPlatforms!.includes(pc.platformId))
      : platformContents;

    this.updateProgress({
      total: selectedContents.length,
      completed: 0,
      status: 'running',
      results: []
    });

    const results: ForwardResult[] = [];
    const method = this.selectAutomationMethod();

    for (const platformContent of selectedContents) {
      if (this.abortController.signal.aborted) {
        break;
      }

      this.updateProgress({
        current: platformContent.platformName
      });

      try {
        const result = await this.forwardToPlatform(platformContent, method);
        results.push(result);
        
        this.updateProgress({
          completed: results.length,
          results: [...results]
        });

        // 添加延迟避免过于频繁的操作
        await new Promise(resolve => setTimeout(resolve, 1000));

      } catch (error) {
        const errorResult: ForwardResult = {
          platformId: platformContent.platformId,
          platformName: platformContent.platformName,
          success: false,
          error: error instanceof Error ? error.message : '未知错误',
          method,
          timestamp: Date.now(),
          retryCount: 0
        };
        
        results.push(errorResult);
        this.updateProgress({
          completed: results.length,
          results: [...results]
        });
      }
    }

    this.updateProgress({
      status: this.abortController.signal.aborted ? 'cancelled' : 'completed'
    });

    console.log('✅ 自动化转发完成');
    return results;
  }

  /**
   * 转发到单个平台
   */
  private async forwardToPlatform(
    platformContent: PlatformContent, 
    method: 'browser' | 'extension' | 'script' | 'manual'
  ): Promise<ForwardResult> {
    console.log(`📤 转发到 ${platformContent.platformName} (${method})`);

    // 验证内容
    const validation = this.validateContent(platformContent.content, platformContent.platformId);
    if (!validation.valid) {
      throw new Error(validation.message);
    }

    switch (method) {
      case 'browser':
        return await this.forwardViaBrowser(platformContent);
      case 'extension':
        return await this.forwardViaExtension(platformContent);
      case 'script':
        return await this.forwardViaScript(platformContent);
      case 'manual':
        return await this.forwardManually(platformContent);
      default:
        throw new Error(`不支持的转发方法: ${method}`);
    }
  }

  /**
   * 通过浏览器原生API转发
   */
  private async forwardViaBrowser(platformContent: PlatformContent): Promise<ForwardResult> {
    const platformUrls = {
      'xiaohongshu': 'https://creator.xiaohongshu.com/publish/publish',
      'weibo': 'https://weibo.com/compose',
      'wechat': 'https://mp.weixin.qq.com',
      'douyin': 'https://creator.douyin.com/creator-micro/content/upload',
      'zhihu': 'https://zhuanlan.zhihu.com/write',
      'bilibili': 'https://member.bilibili.com/platform/upload/text/edit'
    };

    const url = platformUrls[platformContent.platformId as keyof typeof platformUrls];
    
    if (!url) {
      throw new Error(`不支持的平台: ${platformContent.platformId}`);
    }

    try {
      // 复制内容到剪贴板
      await navigator.clipboard.writeText(platformContent.content);
      
      // 打开平台发布页面
      const newWindow = window.open(url, '_blank');
      
      if (!newWindow) {
        throw new Error('无法打开新窗口，请检查浏览器弹窗设置');
      }

      return {
        platformId: platformContent.platformId,
        platformName: platformContent.platformName,
        success: true,
        url,
        method: 'browser',
        timestamp: Date.now(),
        retryCount: 0
      };

    } catch (error) {
      throw new Error(`浏览器转发失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  }

  /**
   * 通过浏览器插件转发
   */
  private async forwardViaExtension(platformContent: PlatformContent): Promise<ForwardResult> {
    // 这里将实现浏览器插件的转发逻辑
    // 需要与浏览器插件进行通信
    throw new Error('浏览器插件转发功能正在开发中');
  }

  /**
   * 通过客户端脚本转发
   */
  private async forwardViaScript(platformContent: PlatformContent): Promise<ForwardResult> {
    // 这里将实现客户端脚本的转发逻辑
    // 可以使用Puppeteer、Playwright等
    throw new Error('客户端脚本转发功能正在开发中');
  }

  /**
   * 手动转发模式
   */
  private async forwardManually(platformContent: PlatformContent): Promise<ForwardResult> {
    try {
      // 复制内容到剪贴板
      await navigator.clipboard.writeText(platformContent.content);
      
      return {
        platformId: platformContent.platformId,
        platformName: platformContent.platformName,
        success: true,
        method: 'manual',
        timestamp: Date.now(),
        retryCount: 0
      };

    } catch (error) {
      throw new Error(`手动转发失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  }

  /**
   * 取消自动化操作
   */
  cancel() {
    console.log('🛑 取消自动化转发操作');
    this.abortController.abort();
    this.updateProgress({
      status: 'cancelled'
    });
  }

  /**
   * 重试失败的转发
   */
  async retryFailedForward(platformId: string, platformContents: PlatformContent[]): Promise<ForwardResult> {
    const platformContent = platformContents.find(pc => pc.platformId === platformId);
    
    if (!platformContent) {
      throw new Error(`未找到平台 ${platformId} 的内容`);
    }

    const method = this.selectAutomationMethod();
    return await this.forwardToPlatform(platformContent, method);
  }
}
