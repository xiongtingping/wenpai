// 平台适配器基础类
// 自动生成 - 2025-08-03

export interface LoginStatus {
  isLoggedIn: boolean;
  username?: string;
  error?: string;
  needsVerification?: boolean; // 添加验证需求属性
  loginUrl?: string; // 添加登录URL属性
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
  needsManualAction?: boolean; // 添加手动操作需求属性
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

    // 🔧 修复：确保不会显示 undefinedundefined
    if (typeof window !== 'undefined' && window.alert) {
      // 清理 HTML 标签并确保内容安全
      const cleanInstructions = instructions
        ?.replace(/<[^>]*>/g, '') // 移除 HTML 标签
        ?.replace(/undefinedundefined/g, '') // 移除 undefinedundefined
        ?.replace(/undefined/g, '') // 移除单独的 undefined
        ?.trim() || '操作指引';

      // 只有在有有效内容时才显示
      if (cleanInstructions && cleanInstructions !== '操作指引') {
        window.alert(cleanInstructions);
      }
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
        error: error instanceof Error ? error.message : i18n.t('common.errors.发布失败'),
        platformId: this.platformId
      };
    }
  }
}

// 导出类型 - 移除重复导出，避免冲突
// export type { LoginStatus, PublishOptions, PublishResult };
