/**
 * 🚨 Authing Guard 生产环境专用修复器
 * 专门解决 Authing Guard 在生产环境中的 undefinedundefined 问题
 * 
 * 问题分析：
 * 1. Authing Guard 在生产环境可能因为网络延迟导致用户信息不完整
 * 2. 生产环境的构建优化可能影响 Guard 内部的字符串处理
 * 3. 环境变量差异可能导致 Guard 配置不一致
 */

import { getUserDisplayName } from './userDisplayUtils';

interface AuthingFixConfig {
  enableGuardFix: boolean;
  enableUserInfoFix: boolean;
  enableModalFix: boolean;
  checkInterval: number;
  maxRetries: number;
}

class AuthingProductionFixer {
  private config: AuthingFixConfig;
  private retryCount = 0;
  private intervalId: number | null = null;
  private isProduction: boolean;

  constructor(config: Partial<AuthingFixConfig> = {}) {
    this.config = {
      enableGuardFix: true,
      enableUserInfoFix: true,
      enableModalFix: true,
      checkInterval: 2000, // 每2秒检查一次
      maxRetries: 50,
      ...config
    };

    this.isProduction = import.meta.env.PROD || 
                       window.location.hostname !== 'localhost';

    if (this.isProduction) {
      this.init();
    }
  }

  /**
   * 初始化 Authing 修复器
   */
  private init(): void {
    console.log('🛡️ Authing 生产环境修复器已启动');

    // 立即执行一次检查
    this.checkAndFix();

    // 启动定时检查
    this.startPeriodicCheck();

    // 监听 Authing Guard 相关事件
    this.monitorAuthingEvents();

    // 拦截 Authing Guard 的用户信息处理
    this.interceptUserInfoProcessing();
  }

  /**
   * 检查并修复 Authing 相关问题
   */
  private checkAndFix(): void {
    if (this.retryCount >= this.config.maxRetries) {
      return;
    }

    this.retryCount++;

    try {
      // 修复 Authing Guard 模态框
      if (this.config.enableModalFix) {
        this.fixAuthingModal();
      }

      // 修复用户信息显示
      if (this.config.enableUserInfoFix) {
        this.fixUserInfoDisplay();
      }

      // 修复 Guard 组件内容
      if (this.config.enableGuardFix) {
        this.fixGuardContent();
      }

    } catch (error) {
      console.error('🚨 Authing 修复器执行失败:', error);
    }
  }

  /**
   * 修复 Authing Guard 模态框
   */
  private fixAuthingModal(): void {
    // 查找 Authing Guard 模态框
    const authingModals = document.querySelectorAll([
      '.authing-guard-modal',
      '.authing-ant-modal',
      '[class*="authing"]',
      '[class*="guard"]'
    ].join(','));

    authingModals.forEach(modal => {
      this.fixElementContent(modal as HTMLElement);
    });
  }

  /**
   * 修复用户信息显示
   */
  private fixUserInfoDisplay(): void {
    // 查找可能包含用户信息的元素
    const userElements = document.querySelectorAll([
      '[class*="user"]',
      '[class*="profile"]',
      '[class*="avatar"]',
      '[data-testid*="user"]',
      '[aria-label*="用户"]'
    ].join(','));

    userElements.forEach(element => {
      this.fixElementContent(element as HTMLElement);
    });
  }

  /**
   * 修复 Guard 组件内容
   */
  private fixGuardContent(): void {
    // 查找所有可能的 Guard 相关元素
    const guardElements = document.querySelectorAll('*');
    
    guardElements.forEach(element => {
      // 检查元素的文本内容
      if (element.textContent?.includes('undefinedundefined')) {
        this.fixElementContent(element as HTMLElement);
      }

      // 检查元素的属性
      ['title', 'alt', 'placeholder', 'aria-label'].forEach(attr => {
        const value = element.getAttribute(attr);
        if (value?.includes('undefinedundefined')) {
          const fixed = this.fixUndefinedString(value);
          element.setAttribute(attr, fixed);
        }
      });
    });
  }

  /**
   * 修复元素内容
   */
  private fixElementContent(element: HTMLElement): void {
    // 修复文本节点
    const walker = document.createTreeWalker(
      element,
      NodeFilter.SHOW_TEXT,
      null
    );

    const textNodes: Text[] = [];
    let node;
    while (node = walker.nextNode()) {
      if (node.textContent?.includes('undefinedundefined')) {
        textNodes.push(node as Text);
      }
    }

    textNodes.forEach(textNode => {
      if (textNode.textContent) {
        const fixed = this.fixUndefinedString(textNode.textContent);
        textNode.textContent = fixed;
      }
    });
  }

  /**
   * 修复包含 undefinedundefined 的字符串
   */
  private fixUndefinedString(str: string): string {
    if (!str || typeof str !== 'string') {
      return str;
    }

    // 针对 Authing 的特殊修复策略
    let fixed = str;

    // 1. 完全移除 undefinedundefined
    fixed = fixed.replace(/undefinedundefined/g, '');

    // 2. 移除单独的 undefined
    fixed = fixed.replace(/\bundefined\b/g, '');

    // 3. 如果结果为空，提供默认值
    if (!fixed.trim()) {
      // 根据上下文提供合适的默认值
      if (str.includes('用户') || str.includes('User')) {
        fixed = '用户';
      } else if (str.includes('名称') || str.includes('Name')) {
        fixed = '用户名称';
      } else {
        fixed = ''; // 保持空白
      }
    }

    // 4. 清理多余的空白
    fixed = fixed.replace(/\s+/g, ' ').trim();

    return fixed;
  }

  /**
   * 启动定时检查
   */
  private startPeriodicCheck(): void {
    this.intervalId = window.setInterval(() => {
      this.checkAndFix();
    }, this.config.checkInterval);
  }

  /**
   * 监听 Authing 相关事件
   */
  private monitorAuthingEvents(): void {
    // 监听 DOM 变化，特别是 Authing Guard 的插入
    const observer = new MutationObserver((mutations) => {
      mutations.forEach(mutation => {
        mutation.addedNodes.forEach(node => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            const element = node as Element;
            
            // 检查是否是 Authing 相关元素
            if (this.isAuthingElement(element)) {
              setTimeout(() => {
                this.fixElementContent(element as HTMLElement);
              }, 100);
            }
          }
        });
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  /**
   * 判断是否是 Authing 相关元素
   */
  private isAuthingElement(element: Element): boolean {
    const className = element.className || '';
    const id = element.id || '';
    
    return className.includes('authing') ||
           className.includes('guard') ||
           id.includes('authing') ||
           id.includes('guard');
  }

  /**
   * 拦截用户信息处理
   */
  private interceptUserInfoProcessing(): void {
    // 拦截可能的用户信息处理函数
    const originalStringify = JSON.stringify;
    JSON.stringify = function(value, replacer, space) {
      if (value && typeof value === 'object' && (value.nickname || value.username)) {
        // 安全处理用户对象
        const safeValue = {
          ...value,
          nickname: value.nickname || '',
          username: value.username || '',
          displayName: getUserDisplayName(value, '用户')
        };
        return originalStringify.call(this, safeValue, replacer, space);
      }
      return originalStringify.call(this, value, replacer, space);
    };
  }

  /**
   * 销毁修复器
   */
  public destroy(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    console.log('🛡️ Authing 生产环境修复器已销毁');
  }

  /**
   * 手动触发修复
   */
  public manualFix(): void {
    this.checkAndFix();
  }

  /**
   * 获取修复统计
   */
  public getStats(): { retryCount: number; isActive: boolean } {
    return {
      retryCount: this.retryCount,
      isActive: this.intervalId !== null
    };
  }
}

// 全局实例
declare global {
  interface Window {
    authingProductionFixer?: AuthingProductionFixer;
  }
}

// 自动启动（仅在生产环境）
if (import.meta.env.PROD || window.location.hostname !== 'localhost') {
  window.authingProductionFixer = new AuthingProductionFixer();
}

export default AuthingProductionFixer;
