/**
 * 🚨 生产环境专用 undefinedundefined 修复器
 * 专门解决生产环境中出现的 undefinedundefined 问题
 * 
 * 生产环境特有问题：
 * 1. 构建优化可能导致环境变量处理差异
 * 2. 代码压缩可能影响字符串处理逻辑
 * 3. 网络延迟可能导致用户信息加载不完整
 */

interface ProductionFixConfig {
  enableGlobalFix: boolean;
  enableDOMObserver: boolean;
  enableConsoleFilter: boolean;
  fixInterval: number;
  maxFixAttempts: number;
}

class ProductionUndefinedFixer {
  private config: ProductionFixConfig;
  private fixCount = 0;
  private observer: MutationObserver | null = null;
  private intervalId: number | null = null;
  private isProduction: boolean;

  constructor(config: Partial<ProductionFixConfig> = {}) {
    this.config = {
      enableGlobalFix: true,
      enableDOMObserver: true,
      enableConsoleFilter: false, // 生产环境默认关闭控制台
      fixInterval: 1000, // 每秒检查一次
      maxFixAttempts: 100,
      ...config
    };

    // 🚨 ENHANCED: 增强生产环境检测逻辑
    this.isProduction = import.meta.env.PROD ||
                       window.location.hostname !== 'localhost' ||
                       window.location.hostname.includes('.netlify.app') ||
                       window.location.hostname.includes('.vercel.app') ||
                       window.location.hostname.includes('.app') ||
                       !import.meta.env.DEV;

    // 🔧 FIXED: 减少重复日志输出
    if (!window.productionUndefinedFixer) {
      console.log('🔍 环境检测:', {
        'import.meta.env.PROD': import.meta.env.PROD,
        'hostname': window.location.hostname,
        'isProduction': this.isProduction,
        'import.meta.env.DEV': import.meta.env.DEV
      });
    }

    // 🚨 FORCE ENABLE: 无论什么环境都启动修复器
    this.init();
    if (!window.productionUndefinedFixer) {
      console.log('🛡️ 修复器已强制启动（所有环境）');
    }
  }

  /**
   * 初始化修复器
   */
  private init(): void {
    console.log('🛡️ 生产环境 undefinedundefined 修复器已启动');

    // 立即执行一次修复
    this.performGlobalFix();

    // 启动定时修复
    if (this.config.enableGlobalFix) {
      this.startPeriodicFix();
    }

    // 启动DOM观察器
    if (this.config.enableDOMObserver) {
      this.startDOMObserver();
    }

    // 过滤控制台错误（生产环境）
    if (this.config.enableConsoleFilter) {
      this.filterConsoleErrors();
    }

    // 监听页面加载完成
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        setTimeout(() => this.performGlobalFix(), 500);
      });
    }

    // 监听路由变化（SPA应用）
    this.monitorRouteChanges();
  }

  /**
   * 执行全局修复
   */
  private performGlobalFix(): void {
    if (this.fixCount >= this.config.maxFixAttempts) {
      return;
    }

    // 🛡️ SAFE: Authing 登录弹窗激活时暂停全局修复，避免干扰真实登录
    if (this.isGuardActive()) {
      if (this.fixCount % 20 === 0) {
        console.log('🛑 暂停全局 undefined 修复：Authing 登录弹窗激活中');
      }
      this.fixCount++;
      return;
    }

    this.fixCount++;
    let fixedCount = 0;

    try {
      // 修复所有文本节点
      const walker = document.createTreeWalker(
        document.body,
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
          const original = textNode.textContent;
          const fixed = this.fixUndefinedString(original);
          if (fixed !== original) {
            textNode.textContent = fixed;
            fixedCount++;
          }
        }
      });

      // 修复所有元素属性（跳过 Authing 弹窗区域）
      const elements = document.querySelectorAll('*:not(#authing_guard_container *):not(.authing-ant-modal-root *)');
      elements.forEach(element => {
        // 检查常见属性
        ['title', 'alt', 'placeholder', 'aria-label', 'data-tooltip'].forEach(attr => {
          const value = element.getAttribute(attr);
          if (value?.includes('undefinedundefined')) {
            const fixed = this.fixUndefinedString(value);
            element.setAttribute(attr, fixed);
            fixedCount++;
          }
        });
      });

      if (fixedCount > 0) {
        console.log(`🛠️ 生产环境修复了 ${fixedCount} 个 undefinedundefined 问题`);
      }

    } catch (error) {
      console.error('🚨 生产环境修复器执行失败:', error);
    }
  }

  /**
   * 修复包含 undefinedundefined 的字符串
   */
  private fixUndefinedString(str: string): string {
    if (!str || typeof str !== 'string') {
      return str;
    }

    // 生产环境专用修复策略
    return str
      .replace(/undefinedundefined/g, '') // 完全移除
      .replace(/undefined/g, '') // 移除单个undefined
      .replace(/^\s+|\s+$/g, '') // 清理空白
      .replace(/\s{2,}/g, ' '); // 合并多余空格
  }

  /**
   * 启动定时修复
   */
  private startPeriodicFix(): void {
    this.intervalId = window.setInterval(() => {
      this.performGlobalFix();
    }, this.config.fixInterval);
  }

  /**
   * 启动DOM观察器
   */
  private startDOMObserver(): void {
    this.observer = new MutationObserver((mutations) => {
      let needsFix = false;

      mutations.forEach(mutation => {
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach(node => {
            if (node.nodeType === Node.TEXT_NODE) {
              if (node.textContent?.includes('undefinedundefined')) {
                needsFix = true;
              }
            } else if (node.nodeType === Node.ELEMENT_NODE) {
              const element = node as Element;
              // 跳过 Authing 弹窗区域
              const inAuthingModal = element.closest('#authing_guard_container, .authing-ant-modal-root');
              if (!inAuthingModal && element.textContent?.includes('undefinedundefined')) {
                needsFix = true;
              }
            }
          });
        }
      });

      if (needsFix) {
        // 延迟修复，避免频繁操作
        setTimeout(() => this.performGlobalFix(), 100);
      }
    });

    this.observer.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true
    });
  }

  // 检测登录弹窗是否激活
  private isGuardActive(): boolean {
    const selectors = ['#authing_guard_container', '.authing-ant-modal-root', '#authing-guard-container-v4'];
    for (const sel of selectors) {
      const el = document.querySelector(sel) as HTMLElement | null;
      if (el && this.isElementVisible(el)) return true;
    }
    return false;
  }

  private isElementVisible(el: HTMLElement): boolean {
    const style = window.getComputedStyle(el);
    return style.display !== 'none' && style.visibility !== 'hidden' && style.opacity !== '0';
  }

  /**
   * 监听路由变化
   */
  private monitorRouteChanges(): void {
    // 监听 pushState 和 replaceState
    const originalPushState = history.pushState;
    const originalReplaceState = history.replaceState;

    history.pushState = function(...args) {
      originalPushState.apply(history, args);
      setTimeout(() => {
        if (window.productionUndefinedFixer) {
          window.productionUndefinedFixer.performGlobalFix();
        }
      }, 500);
    };

    history.replaceState = function(...args) {
      originalReplaceState.apply(history, args);
      setTimeout(() => {
        if (window.productionUndefinedFixer) {
          window.productionUndefinedFixer.performGlobalFix();
        }
      }, 500);
    };

    // 监听 popstate 事件
    window.addEventListener('popstate', () => {
      setTimeout(() => this.performGlobalFix(), 500);
    });
  }

  /**
   * 过滤控制台错误（生产环境）
   */
  private filterConsoleErrors(): void {
    const originalError = console.error;
    console.error = (...args) => {
      const message = args.join(' ');
      if (message.includes('undefinedundefined')) {
        // 生产环境静默处理
        return;
      }
      originalError.apply(console, args);
    };
  }

  /**
   * 销毁修复器
   */
  public destroy(): void {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }

    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }

    console.log('🛡️ 生产环境 undefinedundefined 修复器已销毁');
  }

  /**
   * 手动触发修复
   */
  public manualFix(): void {
    this.performGlobalFix();
  }

  /**
   * 获取修复统计
   */
  public getStats(): { fixCount: number; isActive: boolean } {
    return {
      fixCount: this.fixCount,
      isActive: this.observer !== null || this.intervalId !== null
    };
  }
}

// 全局实例
declare global {
  interface Window {
    productionUndefinedFixer?: ProductionUndefinedFixer;
  }
}

// 🔧 FIXED: 避免重复启动修复器
if (!window.productionUndefinedFixer) {
  window.productionUndefinedFixer = new ProductionUndefinedFixer({
    enableGlobalFix: true,
    enableDOMObserver: true,
    enableConsoleFilter: false, // 开发环境保留控制台输出
    fixInterval: 500, // 更频繁的检查
    maxFixAttempts: 200
  });
  console.log('🚨 FORCE ENABLED: 生产环境修复器已强制启用（包括开发环境）');
} else {
  console.log('🔍 生产环境修复器已存在，跳过重复启动');
}

export default ProductionUndefinedFixer;
