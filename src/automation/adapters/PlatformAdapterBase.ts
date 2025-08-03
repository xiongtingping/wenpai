// 平台适配器基础类
// 自动生成 - 2025-08-03

export interface LoginStatus {
  isLoggedIn: boolean;
  username?: string;
  error?: string;
}

export interface PublishOptions {
  content: string;
  platform: string;
  tags?: string[];
  schedule?: Date;
}

export interface PublishResult {
  success: boolean;
  url?: string;
  error?: string;
  platformId: string;
}

export abstract class PlatformAdapterBase {
  protected platformId: string;
  
  constructor(platformId: string) {
    this.platformId = platformId;
  }
  
  // 抽象方法 - 子类必须实现
  abstract checkLoginStatus(): Promise<LoginStatus>;
  abstract publish(options: PublishOptions): Promise<PublishResult>;
  
  // 通用方法
  protected async copyToClipboard(content: string): Promise<void> {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(content);
      } else {
        // 降级方案
        const textArea = document.createElement('textarea');
        textArea.value = content;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }
    } catch (error) {
      console.error('复制到剪贴板失败:', error);
      throw error;
    }
  }
  
  protected showUserInstructions(instructions: string): void {
    // 显示用户指导信息
    console.log('用户指导:', instructions);
    
    // 可以扩展为显示模态框或通知
    if (typeof window !== 'undefined' && window.alert) {
      window.alert(instructions);
    }
  }
  
  protected async executePublish(content: string, options: PublishOptions): Promise<PublishResult> {
    // 基础发布逻辑
    try {
      await this.copyToClipboard(content);
      
      return {
        success: true,
        platformId: this.platformId,
        url: `https://${this.platformId}.com/post/new`
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '发布失败',
        platformId: this.platformId
      };
    }
  }
}

// 导出类型
export type { LoginStatus, PublishOptions, PublishResult };
