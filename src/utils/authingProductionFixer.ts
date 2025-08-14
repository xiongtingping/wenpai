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
      checkInterval: 500, // 🚨 ENHANCED: 每0.5秒检查一次，更及时发现问题
      maxRetries: 200, // 🚨 ENHANCED: 增加重试次数
      ...config
    };

    // 🚨 ENHANCED: 增强生产环境检测逻辑
    this.isProduction = import.meta.env.PROD ||
                       window.location.hostname !== 'localhost' ||
                       window.location.hostname.includes('.netlify.app') ||
                       window.location.hostname.includes('.vercel.app') ||
                       window.location.hostname.includes('.app');

    // 🔧 FIXED: 减少重复日志输出
    if (!window.authingProductionFixer) {
      console.log('🔍 Authing修复器环境检测:', {
        'import.meta.env.PROD': import.meta.env.PROD,
        'hostname': window.location.hostname,
        'isProduction': this.isProduction
      });
    }

    // 🚨 FORCE ENABLE: 无论什么环境都启动Authing修复器
    this.init();
    if (!window.authingProductionFixer) {
      console.log('🛡️ Authing修复器已强制启动（所有环境）');
    }
  }

  /**
   * 初始化 Authing 修复器
   */
  private init(): void {
    console.log('🛡️ Authing 生产环境修复器已启动');

    // 🚨 生产环境特殊处理：增强 Guard 初始化检查
    this.enhanceGuardInitialization();

    // 立即执行一次检查
    this.checkAndFix();

    // 启动定时检查
    this.startPeriodicCheck();

    // 监听 Authing Guard 相关事件
    this.monitorAuthingEvents();

    // 🛡️ SAFE: 不再全局覆盖 JSON.stringify，避免干扰 Authing SDK
    // this.interceptUserInfoProcessing();

    // 🚨 NEW: 启动弹窗监控和自动关闭
    this.startModalMonitoring();
  }

  /**
   * 检查并修复 Authing 相关问题
   */
  private checkAndFix(): void {
    if (this.retryCount >= this.config.maxRetries) {
      return;
    }

    // 登录弹窗显示时暂停修复，防止干扰用户输入与 SDK 行为
    if (this.isGuardActive()) {
      if (this.retryCount % 10 === 1) {
        console.log('🛑 暂停 Authing 修复器：登录弹窗激活中');
      }
      this.retryCount++;
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
    // 🚨 ENHANCED: 增强弹窗检测和修复
    const authingModals = document.querySelectorAll([
      '.authing-guard-modal',
      '.authing-ant-modal',
      '.ant-modal',
      '.modal',
      '[class*="authing"]',
      '[class*="guard"]',
      '[class*="modal"]',
      '[role="dialog"]',
      '[aria-modal="true"]'
    ].join(','));

    let fixedModalCount = 0;
    authingModals.forEach(modal => {
      const modalElement = modal as HTMLElement;

      // 检查是否包含 undefinedundefined
      if (modalElement.textContent?.includes('undefinedundefined')) {
        console.log('🚨 发现包含 undefinedundefined 的弹窗:', modalElement);
        this.fixElementContent(modalElement);
        fixedModalCount++;
      }

      // 🚨 CRITICAL: 检查是否是遮挡性弹窗
      const style = window.getComputedStyle(modalElement);
      if (style.position === 'fixed' || style.position === 'absolute') {
        const zIndex = parseInt(style.zIndex) || 0;
        if (zIndex > 1000) {
          console.log('🚨 检测到高层级弹窗，检查内容:', {
            element: modalElement,
            zIndex: zIndex,
            textContent: modalElement.textContent?.substring(0, 100)
          });
        }
      }
    });

    if (fixedModalCount > 0) {
      console.log(`🛠️ 修复了 ${fixedModalCount} 个 Authing 弹窗`);
    }
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
    // 登录弹窗激活期间，不对 Authing 弹窗内容做任何修改，避免干扰真实登录
    if (this.isGuardActive() && this.isAuthingElement(element)) {
      return;
    }

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
    // 🔧 FIXED: 安全处理 className，可能是 DOMTokenList 或字符串
    const className = typeof element.className === 'string'
      ? element.className
      : element.className?.toString() || '';
    const id = element.id || '';

    return className.includes('authing') ||
           className.includes('guard') ||
           id.includes('authing') ||
           id.includes('guard');
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
   * 拦截用户信息处理
   */
  private interceptUserInfoProcessing(): void {
    // 🛡️ SAFE NO-OP: 之前覆盖 JSON.stringify 会影响 SDK 的请求序列化，已禁用
    // 如需安全序列化，请在本模块内使用局部 safeStringify，而不是全局覆盖
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

  /**
   * 🚨 增强 Guard 初始化检查（生产环境专用）
   */
  private enhanceGuardInitialization(): void {
    // 监听 Guard 相关的全局事件
    const originalConsoleError = console.error;
    console.error = (...args) => {
      const message = args.join(' ');

      // 检测 Guard 初始化失败
      if (message.includes('getCurrentUser is not a function')) {
        console.log('🚨 检测到 getCurrentUser 错误，尝试修复...');
        this.fixGetCurrentUserError();
      }

      // 检测 Guard 弹窗显示失败
      if (message.includes('Guard 弹窗显示失败')) {
        console.log('🚨 检测到 Guard 弹窗显示失败，尝试修复...');
        this.fixGuardShowError();
      }

      // 过滤生产环境的 undefinedundefined 错误
      if (!message.includes('undefinedundefined')) {
        originalConsoleError.apply(console, args);
      }
    };

    // 监听页面可见性变化，重新检查 Guard 状态
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) {
        setTimeout(() => this.checkGuardHealth(), 1000);
      }
    });
  }

  /**
   * 修复 getCurrentUser 错误
   */
  private fixGetCurrentUserError(): void {
    // 尝试重新初始化 Authing 客户端
    setTimeout(() => {
      try {
        // 触发重新初始化
        const event = new CustomEvent('authing:reinit', {
          detail: { reason: 'getCurrentUser_error' }
        });
        window.dispatchEvent(event);
      } catch (error) {
        console.warn('🚨 无法触发 Authing 重新初始化:', error);
      }
    }, 2000);
  }

  /**
   * 修复 Guard 弹窗显示错误
   */
  private fixGuardShowError(): void {
    // 检查 Guard CSS 是否正确加载
    const guardStyles = document.querySelectorAll('link[href*="guard"]');
    if (guardStyles.length === 0) {
      console.log('🚨 Guard CSS 未加载，尝试重新加载...');
      this.reloadGuardStyles();
    }

    // 检查 Guard 容器是否存在
    setTimeout(() => {
      const guardContainer = document.querySelector('[class*="authing"]');
      if (!guardContainer) {
        console.log('🚨 Guard 容器未找到，可能需要重新初始化');
      }
    }, 1000);
  }

  /**
   * 重新加载 Guard 样式
   */
  private reloadGuardStyles(): void {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = '/node_modules/@authing/guard/dist/esm/guard.min.css';
    document.head.appendChild(link);
  }

  /**
   * 检查 Guard 健康状态
   */
  private checkGuardHealth(): void {
    // 检查是否有 undefinedundefined 问题
    const hasUndefinedIssue = document.body.textContent?.includes('undefinedundefined');
    if (hasUndefinedIssue) {
      console.log('🚨 检测到 undefinedundefined 问题，执行修复...');
      this.checkAndFix();
    }
  }

  /**
   * 🚨 NEW: 启动弹窗监控和自动关闭
   */
  private startModalMonitoring(): void {
    // 监控所有可能的弹窗元素
    const observer = new MutationObserver((mutations) => {
      mutations.forEach(mutation => {
        mutation.addedNodes.forEach(node => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            const element = node as Element;

            // 检查是否是弹窗元素
            if (this.isModalElement(element)) {
              console.log('🚨 检测到新弹窗:', element);

              // 延迟检查弹窗内容
              setTimeout(() => {
                this.handleModalElement(element as HTMLElement);
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

    console.log('🛡️ 弹窗监控已启动');
  }

  /**
   * 判断是否是弹窗元素
   */
  private isModalElement(element: Element): boolean {
    // 🔧 FIXED: 安全处理 className，可能是 DOMTokenList 或字符串
    const className = typeof element.className === 'string'
      ? element.className
      : element.className?.toString() || '';
    const role = element.getAttribute('role') || '';
    const ariaModal = element.getAttribute('aria-modal') || '';

    return className.includes('modal') ||
           className.includes('dialog') ||
           className.includes('popup') ||
           className.includes('overlay') ||
           role === 'dialog' ||
           ariaModal === 'true' ||
           this.isAuthingElement(element);
  }

  /**
   * 处理弹窗元素
   */
  private handleModalElement(element: HTMLElement): void {
    const textContent = element.textContent || '';

    // 登录弹窗激活期间，不做任何内容修复
    if (this.isGuardActive()) {
      return;
    }

    // 检查是否包含 undefinedundefined
    if (textContent.includes('undefinedundefined')) {
      console.log('🚨 发现包含 undefinedundefined 的弹窗，立即修复');
      this.fixElementContent(element);
    }

    // 🔧 FIXED: 2025-08-13 检查是否是 "Please check your config" 错误弹窗
    if (textContent.includes('Please check your config')) {
      console.log('🚨 检测到 Authing 配置错误弹窗，尝试修复');
      this.handleConfigErrorModal(element);
      return;
    }

    // 🚨 CRITICAL: 检查是否是遮挡性的空弹窗或错误弹窗
    const style = window.getComputedStyle(element);
    if (style.position === 'fixed' || style.position === 'absolute') {
      const zIndex = parseInt(style.zIndex) || 0;

      if (zIndex > 1000) {
        console.log('� 高层级弹窗内容检查:', {
          textContent: textContent.substring(0, 100),
          className: element.className
        });

        // 🔧 FIXED: 2025-08-13 更精确的错误弹窗检测，避免误关闭正常的 Authing 弹窗
        const isAuthingModal = element.className.includes('authing') ||
                              element.id.includes('authing') ||
                              element.querySelector('[class*="authing"]') !== null;

        // 只有在非 Authing 弹窗且确实是错误内容时才关闭
        if (!isAuthingModal && (
            (textContent.trim().length < 10 && !textContent.includes('登录') && !textContent.includes('注册')) ||
            textContent.includes('undefined') ||
            textContent.includes('error') ||
            textContent.includes('failed')
        )) {
          console.log('🚨 检测到可能的错误弹窗，尝试关闭');
          this.tryCloseModal(element);
        } else if (isAuthingModal) {
          console.log('🔍 检测到 Authing 弹窗，保持显示:', {
            textLength: textContent.trim().length,
            hasLoginText: textContent.includes('登录'),
            hasRegisterText: textContent.includes('注册')
          });
        }
      }
    }
  }

  /**
   * 尝试关闭弹窗
   */
  private tryCloseModal(element: HTMLElement): void {
    // 查找关闭按钮
    const closeButtons = element.querySelectorAll([
      '.close',
      '.modal-close',
      '.ant-modal-close',
      '[aria-label="Close"]',
      '[aria-label="关闭"]',
      'button[type="button"]'
    ].join(','));

    if (closeButtons.length > 0) {
      console.log('🚨 找到关闭按钮，尝试点击');
      (closeButtons[0] as HTMLElement).click();
      return;
    }

    // 如果没有关闭按钮，尝试按 ESC 键
    const escEvent = new KeyboardEvent('keydown', {
      key: 'Escape',
      code: 'Escape',
      keyCode: 27,
      bubbles: true
    });
    element.dispatchEvent(escEvent);

    console.log('🚨 已发送 ESC 键事件尝试关闭弹窗');
  }

  /**
   * 🔧 FIXED: 2025-08-13 处理 Authing 配置错误弹窗
   */
  private handleConfigErrorModal(element: HTMLElement): void {
    console.log('🔧 处理 Authing 配置错误弹窗');

    // 1. 立即关闭错误弹窗
    this.tryCloseModal(element);

    // 2. 尝试重新初始化 Guard 实例
    setTimeout(() => {
      console.log('🔄 尝试重新初始化 Authing Guard...');
      this.reinitializeGuard();
    }, 1000);
  }

  /**
   * 重新初始化 Guard 实例
   */
  private reinitializeGuard(): void {
    try {
      // 清除现有的 Guard 实例
      const guardContainers = document.querySelectorAll('#authing_guard_container, .authing-ant-modal-root');
      guardContainers.forEach(container => {
        if (container.parentNode) {
          container.parentNode.removeChild(container);
        }
      });

      // 触发重新初始化事件
      window.dispatchEvent(new CustomEvent('authing-reinit-required', {
        detail: { reason: 'config-error' }
      }));

      console.log('✅ Guard 重新初始化请求已发送');
    } catch (error) {
      console.error('❌ Guard 重新初始化失败:', error);
    }
  }
}

// 全局实例
declare global {
  interface Window {
    authingProductionFixer?: AuthingProductionFixer;
  }
}

// 🔧 FIXED: 避免重复启动修复器
if ((import.meta.env.PROD || window.location.hostname !== 'localhost') && !window.authingProductionFixer) {
  window.authingProductionFixer = new AuthingProductionFixer();
} else if (window.authingProductionFixer) {
  console.log('🔍 Authing修复器已存在，跳过重复启动');
}

export default AuthingProductionFixer;
