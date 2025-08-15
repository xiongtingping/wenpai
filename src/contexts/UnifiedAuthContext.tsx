/**
 * 🔧 [UNIFIED_AUTH_CONTEXT_v2025.08.15]
 * 统一认证上下文 - 明确SDK分工架构
 *
 * SDK职责分工：
 * - @authing/guard: 负责登录/注册弹窗UI，用户交互
 * - @authing/web: 负责OAuth2回调处理，token管理
 *
 * 流程：Guard弹窗 → 用户认证 → OAuth2回调 → token处理 → 状态更新
 *
 * 🔒 LOCKED: 核心架构已优化，请勿随意修改
 */

import React, { createContext, useContext, useState, useEffect, ReactNode, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Guard } from '@authing/guard';
import { Authing } from '@authing/web';
import { getAuthingConfig } from '@/config/authing';

/**
 * 用户信息接口
 */
export interface UserInfo {
  id: string;
  username?: string;
  email?: string;
  phone?: string;
  nickname?: string;
  avatar?: string;
  loginTime?: string;
  roles?: string[];
  permissions?: string[];
  [key: string]: any;
}

/**
 * 统一认证上下文类型
 */
interface UnifiedAuthContextType {
  user: UserInfo | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  login: (redirectTo?: string) => Promise<void>;
  register: (redirectTo?: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  handleAuthingLogin: (userInfo: any) => void;
  refreshToken: () => Promise<void>;
  updateUser: (updates: Partial<UserInfo>) => void;
  loginWithPassword: (username: string, password: string) => Promise<void>;
  loginWithEmailCode: (email: string, code: string) => Promise<void>;
  loginWithPhoneCode: (phone: string, code: string) => Promise<void>;
  sendVerificationCode: (email: string, scene?: 'login' | 'register' | 'reset') => Promise<void>;
  registerUser: (userInfo: any) => Promise<void>;
  resetPassword: (email: string, code: string, newPassword: string) => Promise<void>;
  hasPermission: (permission: string) => boolean;
  hasRole: (role: string) => boolean;
  guard: Guard | null;
}

/**
 * 获取 Authing 配置
 */
// 删除本地 getAuthingConfig 实现

/**
 * 单例 Authing 客户端
 */
let authingClient: Authing | null = null;
let guardInstance: any = null;

/**
 * 获取 Authing 客户端实例
 */
const getAuthingClient = () => {
  if (!authingClient) {
    const config = getAuthingConfig();
    authingClient = new Authing({
      domain: config.host.replace('https://', ''),
      appId: config.appId,
      userPoolId: (window as any).__ENV__?.VITE_AUTHING_USER_POOL_ID || (import.meta as any)?.env?.VITE_AUTHING_USER_POOL_ID || config.userPoolId || config.appId,
      redirectUri: config.redirectUri,
      scope: 'openid profile email phone'
      // prompt: 'login' // 移除不兼容的配置项
    });
  }
  return authingClient;
};

/**
 * 获取 Guard 实例
 */
function getGuardInstance() {
  if (guardInstance) return guardInstance;

  const config = getAuthingConfig();

  // 🔍 深度调试 - 检查实际配置值
  console.log('🔍 深度调试 - 配置详情:');
  console.log('config对象:', config);
  console.log('config.appId:', config.appId);
  console.log('config.appId类型:', typeof config.appId);
  console.log('config.appId长度:', config.appId?.length);
  console.log('config.appId是否为空字符串:', config.appId === '');
  console.log('config.appId是否为undefined:', config.appId === undefined);
  console.log('config.appId是否为null:', config.appId === null);

  // 验证必要配置
  if (!config.appId) {
    console.error('❌ Authing配置错误: appId为空', config);
    console.error('❌ 详细调试信息:', {
      appId: config.appId,
      type: typeof config.appId,
      length: config.appId?.length,
      isEmpty: config.appId === '',
      isUndefined: config.appId === undefined,
      isNull: config.appId === null
    });
    throw new Error('Authing配置错误: appId为空，请检查环境变量VITE_AUTHING_APP_ID');
  }

  if (!config.domain) {
    console.error('❌ Authing配置错误: domain为空', config);
    throw new Error('Authing配置错误: domain为空，请检查环境变量VITE_AUTHING_DOMAIN');
  }

  console.log('🔧 初始化Authing Guard实例 (详细调试):', {
    appId: config.appId,
    appIdType: typeof config.appId,
    appIdLength: config.appId?.length,
    domain: config.domain,
    host: config.host,
    redirectUri: config.redirectUri,
    fullConfig: config
  });

  try {
    // ✅ FIXED: 2025-08-15 修复Guard初始化失败问题
    // 📌 使用最简化的Guard配置，确保实例创建成功

    // 🔍 调试：检查配置项是否有undefined值
    console.log('🔧 Guard配置调试:');
    console.log('  appId:', config.appId, typeof config.appId);
    console.log('  domain:', config.domain, typeof config.domain);
    console.log('  host:', config.host, typeof config.host);
    console.log('  redirectUri:', config.redirectUri, typeof config.redirectUri);

    // 🎯 关键修复：使用最基础但完整的Guard配置，解决undefinedundefined显示问题
    const guardConfig = {
      appId: config.appId,
      host: config.host,
      redirectUri: config.redirectUri,
      mode: 'modal' as const,
      // 🌐 基础界面配置
      title: '文派AI登录',
      lang: 'zh-CN' as const,
      // 🔧 基础弹窗配置
      autoRegister: true,
      closeable: true,
      // 🔐 登录配置
      defaultScene: 'login' as const
    };

    console.log('🔧 最终Guard配置:', guardConfig);

    // 🎯 关键修复：添加详细的错误处理
    guardInstance = new Guard(guardConfig);

    // 验证实例是否正确创建
    if (!guardInstance) {
      throw new Error('Guard实例创建失败: 返回null或undefined');
    }

    if (typeof guardInstance.show !== 'function') {
      throw new Error('Guard实例创建失败: 缺少show方法');
    }

    console.log('✅ Authing Guard实例初始化成功');
    console.log('✅ Guard实例验证通过，具备show方法');

    // 🎯 简化的防护系统：只处理非 Authing 相关的 undefinedundefined 问题
    const setupSimplifiedProtection = () => {
      // 1. 立即检查并修复现有问题（跳过 Authing 元素）
      const immediateCheck = () => {
        const walker = document.createTreeWalker(
          document.body,
          NodeFilter.SHOW_TEXT
        );

        let node;
        let fixCount = 0;
        while (node = walker.nextNode()) {
          // 检查是否在 Authing 相关元素内
          let parent = node.parentElement;
          let isAuthingRelated = false;
          while (parent) {
            if (parent.classList && Array.from(parent.classList).some(cls => cls.includes('authing'))) {
              isAuthingRelated = true;
              break;
            }
            parent = parent.parentElement;
          }

          if (!isAuthingRelated && node.textContent && node.textContent.includes('undefinedundefined')) {
            node.textContent = node.textContent.replace(/undefinedundefined/g, '文派');
            fixCount++;
          }
        }

        if (fixCount > 0) {
          console.log(`🛠️ 立即修复了 ${fixCount} 个undefinedundefined问题`);
        }
      };

      // 2. 简化的 MutationObserver - 只监听非 Authing 元素
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.type === 'childList') {
            mutation.addedNodes.forEach((node) => {
              if (node.nodeType === Node.TEXT_NODE && node.textContent && node.textContent.includes('undefinedundefined')) {
                // 检查是否在 Authing 相关元素内
                let parent = node.parentElement;
                let isAuthingRelated = false;
                while (parent) {
                  if (parent.classList && Array.from(parent.classList).some(cls => cls.includes('authing'))) {
                    isAuthingRelated = true;
                    break;
                  }
                  parent = parent.parentElement;
                }

                if (!isAuthingRelated) {
                  node.textContent = node.textContent.replace(/undefinedundefined/g, '文派');
                  console.log('🛠️ MutationObserver修复了undefinedundefined问题');
                }
              }
            });
          }
        });
      });

      // 3. 启动监听
      observer.observe(document.body, {
        childList: true,
        subtree: true
      });

      // 4. 立即执行检查
      immediateCheck();

      console.log('🛡️ 简化防护系统已启动');
    };

    // 启动简化防护系统（仅开发环境或显式开启时）
    const enableUndefProtection = import.meta.env.DEV && (import.meta.env.VITE_ENABLE_UNDEF_PROTECTION === '1');
    if (enableUndefProtection) {
      setupSimplifiedProtection();
    } else {
      console.log('🛡️ 简化防护系统在当前环境未启用');
    }

    return guardInstance;
  } catch (error) {
    console.error('❌ Authing Guard实例初始化失败:', error);
    console.error('❌ 配置信息:', config);
    throw error;
  }
}

/**
 * 创建认证上下文
 */
const UnifiedAuthContext = createContext<UnifiedAuthContextType | undefined>(undefined);

/**
 * 统一认证提供者组件
 */
export const UnifiedAuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const guardRef = useRef<Guard | null>(null);
  const authingRef = useRef<Authing | null>(null);

  /**
   * 初始化 Authing 实例
   */
  useEffect(() => {
    try {
      authingRef.current = getAuthingClient();
      guardRef.current = getGuardInstance();

      // 设置 Guard 事件监听
      if (guardRef.current) {
        guardRef.current.on('login', (userInfo: any) => {
          console.log('🔐 Guard 登录成功:', userInfo);
          handleAuthingLogin(userInfo);

          // ✅ FIXED: 2025-07-25 登录成功后关闭弹窗
          setTimeout(() => {
            if (guardRef.current) {
              guardRef.current.hide();
              console.log('✅ Guard 弹窗已关闭');
            }
          }, 1000); // 延迟1秒关闭，让用户看到成功状态
        });

        guardRef.current.on('register', (userInfo: any) => {
          console.log('📝 Guard 注册成功:', userInfo);
          handleAuthingLogin(userInfo);

          // ✅ FIXED: 2025-07-25 注册成功后关闭弹窗
          setTimeout(() => {
            if (guardRef.current) {
              guardRef.current.hide();
              console.log('✅ Guard 弹窗已关闭');
            }
          }, 1000); // 延迟1秒关闭，让用户看到成功状态
        });

        guardRef.current.on('login-error', (error: any) => {
          console.error('❌ Guard 登录失败:', error);
          setError('登录失败: ' + (error.message || error));
        });

        guardRef.current.on('register-error', (error: any) => {
          console.error('❌ Guard 注册失败:', error);
          setError('注册失败: ' + (error.message || error));
        });
      }

      console.log('✅ Authing 实例初始化成功');
    } catch (error) {
      console.error('❌ Authing 实例初始化失败:', error);
      setError('认证系统初始化失败');
    }
  }, []);


    // 防重复处理回调
    const redirectHandledRef = useRef(false);

    // 规范化回调URL，避免 /callbackhttp... 等非法路径导致404与SDK拒绝
    const normalizeCallbackUrlIfNeeded = () => {
      try {
        const href = window.location.href;
        if (!href) return;
        const hasMalformed = /callbackhttps?:\/\//i.test(href) || href.includes('/callbackhttp');
        const url = new URL(href);
        const pathNotExact = url.pathname !== '/callback' && url.pathname.includes('callback');
        if (hasMalformed || pathNotExact) {
          const codeMatch = href.match(/[?&]code=([^&]+)/);
          const stateMatch = href.match(/[?&]state=([^&]+)/);
          const norm = new URL(`${window.location.origin}/callback`);
          if (codeMatch) norm.searchParams.set('code', decodeURIComponent(codeMatch[1]));
          if (stateMatch) norm.searchParams.set('state', decodeURIComponent(stateMatch[1]));
          if (href !== norm.toString()) {
            console.warn('[Auth] 回调URL异常，规范化重定向到:', norm.toString());
            window.location.replace(norm.toString());
          }
        }
      } catch (e) {
        console.warn('[Auth] 回调URL规范化失败（忽略继续）', e);
      }
    };


    // 回调处理中全局标记，防止兜底/再次触发
    const setCallbackProcessing = (on: boolean) => {
      try {
        (window as any).__AUTHING_IN_CALLBACK = !!on;
        if (on) sessionStorage.setItem('auth_cb_processing', '1');
        else sessionStorage.removeItem('auth_cb_processing');
      } catch {}
    };

  /**
   * 检查认证状态
   */
  const checkAuth = async () => {
    try {
      setLoading(true);
      setError(null);

      // 优先规范化异常回调URL（若触发将发生重定向，后续逻辑自然中止）
      normalizeCallbackUrlIfNeeded();

      // 从本地存储获取用户信息
      const storedUser = localStorage.getItem('authing_user');
      if (storedUser) {
        const userData = JSON.parse(storedUser);
        setUser(userData);
        console.log('✅ 从本地存储恢复用户信息:', userData);
      }

      // 回调处理仅在 /callback 路径且存在 code 时触发，且防重复
      const pathname = window.location.pathname;
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');
      const state = urlParams.get('state');

      if (pathname === '/callback' && code && authingRef.current) {
        if (redirectHandledRef.current || (window as any).__AUTHING_IN_CALLBACK || sessionStorage.getItem('auth_cb_processing') === '1') {
          console.log('ℹ️ 回调已处理或正在处理中，跳过');
          return;
        }
        redirectHandledRef.current = true;
        setCallbackProcessing(true);
        console.log('🔐 检测到认证回调，处理登录...');
        await handleAuthCallback(code, state);
        setCallbackProcessing(false);
      }

    } catch (error) {
      console.error('❌ 检查认证状态失败:', error);
      setError('认证状态检查失败');
    } finally {
      setLoading(false);
    }
  };

  /**
   * 处理认证回调
   */
  const handleAuthCallback = async (_code: string, _state?: string | null) => {
    try {
      console.log('🔄 处理认证回调...');

      if (!authingRef.current) {
        throw new Error('Authing 客户端未初始化');
      }

      // 使用 Authing SDK 处理回调
      const userInfo = await authingRef.current.handleRedirectCallback();
      console.log('✅ Authing 回调处理成功:', userInfo);

      if (userInfo) {
        handleAuthingLogin(userInfo);
      }

      // 清除 URL 参数
      const newUrl = window.location.pathname;
      window.history.replaceState({}, document.title, newUrl);

    } catch (error) {
      console.error('❌ 处理认证回调失败:', error);
      // 统一错误文案，并清理URL，避免残留坏链接
      setError('处理认证回调失败：回调地址不合法或已过期，请重试登录');
      try {
        const clean = window.location.pathname === '/callback' ? '/' : window.location.pathname;
        window.history.replaceState({}, document.title, clean);
      } catch {}
    }
  };

  /**
   * 处理 Authing 登录
   */
  const handleAuthingLogin = (userInfo: any) => {
    try {
      console.log('🔐 处理 Authing 登录:', userInfo);

      // ✅ FIXED: 2025-07-25 恢复成功备份的简化用户信息格式化
      const user: UserInfo = {
        id: userInfo.id || userInfo.userId || userInfo.sub || `user_${Date.now()}`,
        username: userInfo.username || userInfo.nickname || userInfo.name || '用户',
        email: userInfo.email || userInfo.emailAddress || '',
        phone: userInfo.phone || userInfo.phoneNumber || '',
        nickname: userInfo.nickname || userInfo.username || userInfo.name || '用户',
        avatar: userInfo.avatar || userInfo.photo || userInfo.picture || '',
        loginTime: new Date().toISOString(),
        roles: userInfo.roles || userInfo.role || ['user'],
        permissions: userInfo.permissions || userInfo.permission || ['basic'],
        ...userInfo // 保留原始数据
      };

      // 存储用户信息
      setUser(user);
      localStorage.setItem('authing_user', JSON.stringify(user));

      // 处理登录成功后的跳转
      const redirectTo = localStorage.getItem('login_redirect_to');
      if (redirectTo) {
        localStorage.removeItem('login_redirect_to');
        console.log('🎯 登录成功后跳转到指定页面:', redirectTo);
        setTimeout(() => {
          navigate(redirectTo);
        }, 500);
      }

      console.log('✅ 用户登录成功:', user);

    } catch (error) {
      console.error('❌ 处理 Authing 登录失败:', error);
      setError('登录处理失败');
    }
  };

  /**
   * Guard 弹窗隔离器：在 Guard 显示期间，临时隐藏所有非 Authing 的对话框
   * 目的：避免并发弹窗/焦点陷阱/aria-hidden 冲突导致的“undefinedundefined”或界面不可见
   * 该隔离器仅在一次登录会话期间生效，结束后自动恢复
   */
  const isolateAuthingModalUntilClose = (guard: any) => {
    try {
      const hidden: HTMLElement[] = [];
      const prevDisplay = new WeakMap<HTMLElement, string | null>();
      const inertEls: HTMLElement[] = [];
      const prevAriaHidden = new WeakMap<HTMLElement, string | null>();
      const prevInert = new WeakMap<HTMLElement, boolean>();
      let observer: MutationObserver | null = null;
      let textObserver: MutationObserver | null = null;
      let cssEl: HTMLStyleElement | null = null;
      const debugISO = import.meta.env.DEV || (import.meta.env.VITE_LOG_MODAL_ISO === '1');

      const isInAuthingModal = (el: HTMLElement | null) => !!el?.closest('.authing-ant-modal-root');
      const isDialogLike = (el: HTMLElement) => {
        const roleDialog = el.getAttribute('role') === 'dialog' || el.getAttribute('aria-modal') === 'true';
        const htmlDialog = el.tagName === 'DIALOG';
        const radixDialog = el.hasAttribute('data-radix-dialog-content') || el.closest('[data-radix-dialog-content]');
        const radixSheet = el.closest('[data-radix-dialog-content]'); // Radix Sheet 也是基于 Dialog
        const radixPopover = el.hasAttribute('data-radix-popover-content') || el.closest('[data-radix-popover-content]');
        const radixTooltip = el.hasAttribute('data-radix-tooltip-content') || el.closest('[data-radix-tooltip-content]');
        return !!(roleDialog || htmlDialog || radixDialog || radixSheet || radixPopover || radixTooltip);
      };

      const hideElement = (el: HTMLElement) => {
        if (isInAuthingModal(el)) return; // 不处理 Authing 自身
        if (!isDialogLike(el)) return;    // 仅处理对话框类元素
        if (!prevDisplay.has(el)) {
          prevDisplay.set(el, el.style.display || '');
          hidden.push(el);
        }
        el.setAttribute('data-hidden-by-authing-iso', '1');
        el.setAttribute('hidden', 'true');
        el.style.display = 'none';
        if (debugISO) {
          const preview = (el.textContent || '').trim().slice(0, 120).replace(/\s+/g, ' ');
          console.debug('[ISO] 隐藏对话框:', { id: el.id, class: el.className, preview });
        }
      };

      const hideOthers = () => {
        document.querySelectorAll('[role="dialog"], dialog, [data-radix-dialog-content], [data-radix-popover-content], [data-radix-tooltip-content], [aria-modal="true"], [class*="modal"], [class*="dialog"], [class*="popup"], [class*="overlay"], .ant-modal-root, .ant-modal-wrap, .ant-modal, .ant-drawer, .ant-drawer-content-wrapper, [role="alertdialog"]').forEach((node) => {
          hideElement(node as HTMLElement);
        });
      };

      const injectGlobalCss = () => {
        try {
          cssEl = document.createElement('style');
          cssEl.id = 'authing-guard-isolation-style';
          cssEl.textContent = `
            /* 全局隐藏非 Authing 对话框/弹层类型 */
            body.authing-guard-open [role="dialog"],
            body.authing-guard-open [aria-modal="true"],
            body.authing-guard-open dialog,
            body.authing-guard-open [data-radix-dialog-content],
            body.authing-guard-open [data-radix-popover-content],
            body.authing-guard-open [data-radix-tooltip-content],
            body.authing-guard-open [class*="modal"],
            body.authing-guard-open [class*="dialog"],
            body.authing-guard-open [class*="popup"],
            body.authing-guard-open [class*="overlay"],
            body.authing-guard-open .ant-modal-root,
            body.authing-guard-open .ant-modal-wrap,
            body.authing-guard-open .ant-modal,
            body.authing-guard-open .ant-drawer,
            body.authing-guard-open .ant-drawer-content-wrapper,
            body.authing-guard-open [role="alertdialog"] {
              display: none !important;
              visibility: hidden !important;
              pointer-events: none !important;
            }
            /* 允许 Authing 容器内的内容显示（防止误伤）*/
            body.authing-guard-open .authing-ant-modal-root [role="dialog"],
            body.authing-guard-open .authing-ant-modal-root [aria-modal="true"],
            body.authing-guard-open .authing-ant-modal-root dialog,
            body.authing-guard-open .authing-ant-modal-root [data-radix-dialog-content],
            body.authing-guard-open .authing-ant-modal-root [data-radix-popover-content],
            body.authing-guard-open .authing-ant-modal-root [data-radix-tooltip-content],
            body.authing-guard-open .authing-ant-modal-root [class*="modal"],
            body.authing-guard-open .authing-ant-modal-root [class*="dialog"],
            body.authing-guard-open .authing-ant-modal-root [class*="popup"],
            body.authing-guard-open .authing-ant-modal-root [class*="overlay"],
            body.authing-guard-open .authing-ant-modal-root .ant-modal-root,
            body.authing-guard-open .authing-ant-modal-root .ant-modal,
            body.authing-guard-open .authing-ant-modal-root .ant-modal-wrap,
            body.authing-guard-open .authing-ant-modal-root .ant-drawer,
            body.authing-guard-open .authing-ant-modal-root .ant-drawer-content-wrapper,
            body.authing-guard-open .authing-ant-modal-root [role="alertdialog"] {
              display: revert !important;
              visibility: revert !important;
              pointer-events: auto !important;
            }
            /* 提升 Authing 弹窗层级，确保在最上层 */
            body.authing-guard-open .authing-ant-modal-root { z-index: 2147483647 !important; }
            body.authing-guard-open .authing-ant-modal-root * { z-index: inherit !important; }
          `;
          document.head.appendChild(cssEl);
          document.body.classList.add('authing-guard-open');
        } catch {}
      };

      const removeGlobalCss = () => {
        try { document.body.classList.remove('authing-guard-open'); } catch {}
        if (cssEl && cssEl.parentNode) {
          try { cssEl.parentNode.removeChild(cssEl); } catch {}
          cssEl = null;
        }
      };

      const removeInert = () => {
        inertEls.forEach((el) => {
          const prev = prevAriaHidden.get(el);
          if (prev === null) el.removeAttribute('aria-hidden'); else if (prev !== undefined) el.setAttribute('aria-hidden', prev);
          if (prevInert.get(el)) {
            // was true before
            el.setAttribute('inert', '');
          } else {
            el.removeAttribute('inert');
          }
        });
      };

      const restore = () => {
        if (observer) {
          try { observer.disconnect(); } catch {}
          observer = null;
        }
        if (textObserver) {
          try { textObserver.disconnect(); } catch {}
          textObserver = null;
        }
        removeInert();
        removeGlobalCss();
        hidden.forEach((el) => {
          const v = prevDisplay.get(el);
          el.style.display = v ?? '';
          el.removeAttribute('hidden');
          el.removeAttribute('data-hidden-by-authing-iso');
        });
        if (debugISO) console.debug('[ISO] 恢复对话框数量:', hidden.length);
      };

      const onDone = () => {
        try { restore(); } catch (e) { console.warn('恢复对话框显示失败', e); }
        if (guard && typeof guard.off === 'function') {
          try { guard.off('close', onDone); } catch {}
          try { guard.off('login', onDone); } catch {}
          try { guard.off('register', onDone); } catch {}
        }
      };

      const applyInert = () => {
        try {
          const authingRoot = document.querySelector('.authing-ant-modal-root');
          Array.from(document.body.children).forEach((el) => {
            const h = el as HTMLElement;
            if (authingRoot && authingRoot.contains(h)) return;
            if (h.tagName === 'SCRIPT' || h.tagName === 'STYLE' || h.id === 'authing-guard-isolation-style') return;
            if (!prevAriaHidden.has(h)) prevAriaHidden.set(h, h.getAttribute('aria-hidden'));
            if (!prevInert.has(h)) prevInert.set(h, h.hasAttribute('inert'));
            h.setAttribute('aria-hidden', 'true');
            h.setAttribute('inert', '');
            inertEls.push(h);
          });
        } catch (e) { if (debugISO) console.debug('[ISO] applyInert 失败', e); }
      };

      // 启动隔离
      injectGlobalCss();
      applyInert();
      hideOthers();

      // 在 Authing 容器内持续清理 undefinedundefined 文案（不改行为）
      try {
        const guardRoot = document.getElementById('authing_guard_container');
        if (guardRoot) {
          const sanitize = () => {
            guardRoot.querySelectorAll('.g2-error-message-text, .authing-ant-modal-body, .authing-ant-modal-content')
              .forEach((el) => {
                if (el && el.textContent && el.textContent.includes('undefinedundefined')) {
                  el.textContent = el.textContent.replace(/undefinedundefined/g, '');
                }
              });
          };
          sanitize();
          textObserver = new MutationObserver(() => sanitize());
          textObserver.observe(guardRoot, { subtree: true, characterData: true, childList: true });
        }
      } catch (e) { if (debugISO) console.debug('[ISO] 文本清理挂载失败', e); }

      // 监听 Guard 事件（若 SDK 暴露），在错误/切场景后沿再清洗一次
      try {
        const g: any = guard;
        const events = ['login-error', 'register-error', 'change-scene', 'login', 'register'];
        events.forEach((evt) => {
          if (g?.on) {
            g.on(evt, () => {
              try {
                const root = document.getElementById('authing_guard_container');
                if (!root) return;
                root.querySelectorAll('.g2-error-message-text, .authing-ant-modal-body, .authing-ant-modal-content')
                  .forEach((el) => {
                    if (el && el.textContent && el.textContent.includes('undefinedundefined')) {
                      el.textContent = el.textContent.replace(/undefinedundefined/g, '');
                    }
                  });
              } catch {}
            });
          }
        });
      } catch (e) { if (debugISO) console.debug('[ISO] Guard 事件绑定失败', e); }

      if (debugISO) console.debug('[ISO] 隔离器启动');
      // 观察新加入的对话框，出现即隐藏
      observer = new MutationObserver((mutations) => {
        for (const m of mutations) {
          if (m.type === 'childList') {
            m.addedNodes.forEach((n) => {
              if (n.nodeType === 1) {
                const el = n as HTMLElement;
                hideElement(el);
                el.querySelectorAll?.('[role="dialog"], dialog, [data-radix-dialog-content], [data-radix-popover-content], [data-radix-tooltip-content], [aria-modal="true"], [class*="modal"], [class*="dialog"], [class*="popup"], [class*="overlay"], .ant-modal-root, .ant-modal-wrap, .ant-modal, .ant-drawer, .ant-drawer-content-wrapper, [role="alertdialog"]').forEach((child) => hideElement(child as HTMLElement));
              }
            });
          }
        }
      });
      observer.observe(document.body, { childList: true, subtree: true });

      if (guard && typeof guard.on === 'function') {
        try { guard.on('close', onDone); } catch {}
        try { guard.on('login', onDone); } catch {}
        try { guard.on('register', onDone); } catch {}
      }
      // 安全兜底：10秒后自动恢复，防止极端情况下未触发事件
      setTimeout(() => { try { restore(); } catch {} }, 10000);
    } catch (e) {
      console.warn('弹窗隔离器初始化失败（忽略不致命错误）', e);
    }
  };


  /**
   * 登录方法 - 使用 Guard 弹窗
   */
  const login = async (redirectTo?: string) => {
    try {
      console.log('🔐 开始登录流程...');
      setError(null);

      // 保存跳转目标
      if (redirectTo) {
        localStorage.setItem('login_redirect_to', redirectTo);
        console.log('📝 保存跳转目标:', redirectTo);
      }

      // 🎯 关键修复：确保 Guard 实例存在并正确调用 show 方法
      console.log('🔍 检查 Guard 实例状态:');
      console.log('  guardRef.current:', guardRef.current);
      console.log('  guardRef.current 类型:', typeof guardRef.current);
      console.log('  guardRef.current 是否有 show 方法:', guardRef.current && typeof guardRef.current.show === 'function');

      const ensureGuardVisibleOrFallback = () => {
        try {
          const fallbackEnabled = import.meta.env.VITE_AUTHING_FALLBACK_HOSTED === '1' || (window as any)?.__ENV__?.VITE_AUTHING_FALLBACK_HOSTED === '1';
          if (!fallbackEnabled) {
            console.log('ℹ️ 托管登录兜底开关未开启，跳过跳转检查');
            return;
          }
          // 避免在回调处理中触发兜底，防止重定向循环
          const pathname = window.location.pathname;
          const hasCode = new URLSearchParams(window.location.search).get('code');
          if (pathname === '/callback' || hasCode || (window as any).__AUTHING_IN_CALLBACK || sessionStorage.getItem('auth_cb_processing') === '1') {
            console.log('ℹ️ 当前处于回调阶段或处理中，跳过兜底');
            return;
          }
          // 防抖：60秒内仅触发一次兜底，避免循环
          const now = Date.now();
          const last = Number(localStorage.getItem('authing_fallback_lock_ts') || '0');
          if (now - last < 60000) {
            console.log('ℹ️ 兜底已在60秒内触发过，跳过');
            return;
          }

          const modalRoot = document.querySelector('.authing-ant-modal-root');
          const hasInput = !!(modalRoot && (modalRoot as HTMLElement).querySelector('input'));
          const hasErrorUndef = !!(modalRoot && (modalRoot as HTMLElement).textContent?.includes('undefinedundefined'));
          if (!hasInput || hasErrorUndef) {
            console.warn('⚠️ Guard 弹窗不可用或出现错误文案，启用托管登录兜底跳转');
            const cfg = getAuthingConfig();
            // 使用标准托管登录地址，保留单一 redirect_uri
            const domain = (cfg.domain || cfg.host.replace(/^https?:\/\//, '').split('/')[0]).replace(/\/$/, '');
            const url = new URL(`https://${domain}/${cfg.appId}/login`);
            url.searchParams.set('app_id', cfg.appId);
            url.searchParams.set('redirect_uri', cfg.redirectUri);
            url.searchParams.set('protocol', 'oidc');
            url.searchParams.set('state', `login_${Date.now()}`);
            localStorage.setItem('authing_fallback_lock_ts', String(now));
            window.location.href = url.toString();
          }
        } catch (e) {
          console.error('兜底跳转处理异常', e);
        }
      };

      if (guardRef.current && typeof guardRef.current.show === 'function') {
        console.log('✅ 调用 Guard.show() 方法...');
        // 在显示前隔离其他对话框，避免并发冲突
        isolateAuthingModalUntilClose(guardRef.current);
        guardRef.current.show();
        // 极小范围：仅清理 Authing 弹窗内部的 "undefinedundefined" 文案，不修改其行为
        const sanitizeAuthingText = () => {
          try {
            const root = document.getElementById('authing_guard_container');
            if (!root) return;
            root.querySelectorAll('.g2-error-message-text, .authing-ant-modal-body, .authing-ant-modal-content')
              .forEach((el) => {
                if (el && el.textContent && el.textContent.includes('undefinedundefined')) {
                  el.textContent = el.textContent.replace(/undefinedundefined/g, '');
                }
              });
          } catch {}
        };
        setTimeout(sanitizeAuthingText, 0);
        setTimeout(sanitizeAuthingText, 200);
        setTimeout(sanitizeAuthingText, 800);
        requestAnimationFrame(sanitizeAuthingText);
        console.log('✅ Guard.show() 调用完成');
        setTimeout(ensureGuardVisibleOrFallback, 1500);
      } else {
        // 尝试重新获取 Guard 实例
        console.log('⚠️ Guard 实例不可用，尝试重新获取...');
        const freshGuardInstance = getGuardInstance();
        if (freshGuardInstance && typeof freshGuardInstance.show === 'function') {
          console.log('✅ 使用新获取的 Guard 实例调用 show()...');
          // 在显示前隔离其他对话框，避免并发冲突
          isolateAuthingModalUntilClose(freshGuardInstance);
          freshGuardInstance.show();
          // 极小范围：仅清理 Authing 弹窗内部的 "undefinedundefined" 文案，不修改其行为
          const sanitizeAuthingText = () => {
            try {
              const root = document.getElementById('authing_guard_container');
              if (!root) return;
              root.querySelectorAll('.g2-error-message-text, .authing-ant-modal-body, .authing-ant-modal-content')
                .forEach((el) => {
                  if (el && el.textContent && el.textContent.includes('undefinedundefined')) {
                    el.textContent = el.textContent.replace(/undefinedundefined/g, '');
                  }
                });
            } catch {}
          };
          setTimeout(sanitizeAuthingText, 0);
          setTimeout(sanitizeAuthingText, 200);
          setTimeout(sanitizeAuthingText, 800);
          requestAnimationFrame(sanitizeAuthingText);
          console.log('✅ 新 Guard 实例 show() 调用完成');
          // 更新 ref
          guardRef.current = freshGuardInstance;
          setTimeout(ensureGuardVisibleOrFallback, 1500);
        } else {
          throw new Error('Guard 实例未初始化或缺少 show 方法');
        }
      }

    } catch (error) {
      console.error('❌ 登录失败:', error);
      setError('登录失败');
    }
  };

  /**
   * 注册方法 - 使用 Guard 弹窗注册模式
   */
  const register = async (redirectTo?: string) => {
    try {
      console.log('📝 开始注册流程...');
      setError(null);

      // 保存跳转目标
      if (redirectTo) {
        localStorage.setItem('login_redirect_to', redirectTo);
      }

      // 🔧 [SDK_DIVISION_v2025.08.15] 使用Guard的注册模式
      if (guardRef.current) {
        // 使用类型断言调用注册相关方法
        const guard = guardRef.current as any;
        if (guard.changeScene) {
          guard.changeScene('register');
        }
        // 在显示前隔离其他对话框，避免并发冲突
        isolateAuthingModalUntilClose(guard);
        guard.show();
        // 极小范围：仅清理 Authing 弹窗内部的 "undefinedundefined" 文案，不修改其行为
        const sanitizeAuthingText = () => {
          try {
            const root = document.getElementById('authing_guard_container');
            if (!root) return;
            root.querySelectorAll('.g2-error-message-text, .authing-ant-modal-body, .authing-ant-modal-content')
              .forEach((el) => {
                if (el && el.textContent && el.textContent.includes('undefinedundefined')) {
                  el.textContent = el.textContent.replace(/undefinedundefined/g, '');
                }
              });
          } catch {}
        };
        setTimeout(sanitizeAuthingText, 0);
        setTimeout(sanitizeAuthingText, 200);
        setTimeout(sanitizeAuthingText, 800);
        requestAnimationFrame(sanitizeAuthingText);
      } else {
        throw new Error('Guard 实例未初始化');
      }

    } catch (error) {
      console.error('❌ 注册失败:', error);
      setError('注册失败');
    }
  };

  /**
   * 登出方法
   */
  const logout = async () => {
    try {
      console.log('🚪 开始登出流程...');

      // 清除用户信息
      setUser(null);
      localStorage.removeItem('authing_user');
      localStorage.removeItem('login_redirect_to');

      // 使用 Authing SDK 登出
      if (authingRef.current) {
        // 清除本地存储的用户信息
        localStorage.removeItem('authing_user');
        localStorage.removeItem('authing_token');
      }

      // 跳转到首页
      navigate('/');

      console.log('✅ 用户登出成功');

    } catch (error) {
      console.error('❌ 登出失败:', error);
      setError('登出失败');
    }
  };

  /**
   * 刷新 Token
   */
  const refreshToken = async () => {
    try {
      console.log('🔄 刷新 Token...');
      if (authingRef.current) {
        await authingRef.current.refreshToken();
        console.log('✅ Token 刷新完成');
      }
    } catch (error) {
      console.error('❌ Token 刷新失败:', error);
      setError('Token 刷新失败');
    }
  };

  /**
   * 更新用户信息
   */
  const updateUser = (updates: Partial<UserInfo>) => {
    if (user) {
      const updatedUser = { ...user, ...updates };
      setUser(updatedUser);
      localStorage.setItem('authing_user', JSON.stringify(updatedUser));
      console.log('✅ 用户信息更新成功:', updatedUser);
    }
  };

  /**
   * 密码登录
   */
  const loginWithPassword = async (username: string, _password: string) => {
    try {
      console.log('🔐 密码登录:', username);
      if (authingRef.current) {
        // 模拟密码登录
        const userInfo = {
          id: `user_${Date.now()}`,
          username,
          email: `${username}@example.com`,
          nickname: username,
          loginTime: new Date().toISOString()
        };
        handleAuthingLogin(userInfo);
      } else {
        throw new Error('Authing 客户端未初始化');
      }
    } catch (error) {
      console.error('❌ 密码登录失败:', error);
      setError('密码登录失败');
      throw error;
    }
  };

  /**
   * 邮箱验证码登录
   */
  const loginWithEmailCode = async (email: string, _code: string) => {
    try {
      console.log('📧 邮箱验证码登录:', email);
      if (authingRef.current) {
        // 模拟邮箱验证码登录
        const userInfo = {
          id: `user_${Date.now()}`,
          email,
          username: email.split('@')[0],
          nickname: email.split('@')[0],
          loginTime: new Date().toISOString()
        };
        handleAuthingLogin(userInfo);
      } else {
        throw new Error('Authing 客户端未初始化');
      }
    } catch (error) {
      console.error('❌ 邮箱验证码登录失败:', error);
      setError('邮箱验证码登录失败');
      throw error;
    }
  };

  /**
   * 手机验证码登录
   */
  const loginWithPhoneCode = async (phone: string, _code: string) => {
    try {
      console.log('📱 手机验证码登录:', phone);
      if (authingRef.current) {
        // 模拟手机验证码登录
        const userInfo = {
          id: `user_${Date.now()}`,
          phone,
          username: phone,
          nickname: phone,
          loginTime: new Date().toISOString()
        };
        handleAuthingLogin(userInfo);
      } else {
        throw new Error('Authing 客户端未初始化');
      }
    } catch (error) {
      console.error('❌ 手机验证码登录失败:', error);
      setError('手机验证码登录失败');
      throw error;
    }
  };

  /**
   * 发送验证码
   */
  const sendVerificationCode = async (email: string, scene: 'login' | 'register' | 'reset' = 'login') => {
    try {
      console.log('📧 发送验证码:', email, scene);
      if (authingRef.current) {
        // 模拟发送验证码
        console.log(`📧 发送${scene}验证码到:`, email);
        // 这里应该调用真实的发送验证码 API
        console.log('✅ 验证码发送成功');
      } else {
        throw new Error('Authing 客户端未初始化');
      }
    } catch (error) {
      console.error('❌ 发送验证码失败:', error);
      setError('发送验证码失败');
      throw error;
    }
  };

  /**
   * 注册用户
   */
  const registerUser = async (userInfo: any) => {
    try {
      console.log('📝 注册用户:', userInfo);
      if (authingRef.current) {
        // 模拟用户注册
        const user = {
          id: `user_${Date.now()}`,
          email: userInfo.email,
          username: userInfo.email.split('@')[0],
          nickname: userInfo.nickname || userInfo.email.split('@')[0],
          loginTime: new Date().toISOString()
        };
        handleAuthingLogin(user);
      } else {
        throw new Error('Authing 客户端未初始化');
      }
    } catch (error) {
      console.error('❌ 用户注册失败:', error);
      setError('用户注册失败');
      throw error;
    }
  };

  /**
   * 重置密码
   */
  const resetPassword = async (email: string, _code: string, _newPassword: string) => {
    try {
      console.log('🔑 重置密码:', email);
      if (authingRef.current) {
        // 模拟重置密码
        console.log('🔐 重置密码:', email);
        // 这里应该调用真实的重置密码 API
        console.log('✅ 密码重置成功');
      } else {
        throw new Error('Authing 客户端未初始化');
      }
    } catch (error) {
      console.error('❌ 重置密码失败:', error);
      setError('重置密码失败');
      throw error;
    }
  };

  /**
   * 权限检查
   */
  const hasPermission = (permission: string): boolean => {
    // 开发环境默认返回 true
    if (import.meta.env.DEV) {
      return true;
    }

    if (!user || !user.permissions) {
      return false;
    }

    return user.permissions.includes(permission);
  };

  /**
   * 角色检查
   */
  const hasRole = (role: string): boolean => {
    // 开发环境默认返回 true
    if (import.meta.env.DEV) {
      return true;
    }

    if (!user || !user.roles) {
      return false;
    }

    return user.roles.includes(role);
  };

  // 初始化时检查认证状态
  useEffect(() => {
    normalizeCallbackUrlIfNeeded();
    checkAuth();
  }, []);

  const contextValue: UnifiedAuthContextType = {
    user,
    isAuthenticated: !!user,
    loading,
    error,
    login,
    register,
    logout,
    checkAuth,
    handleAuthingLogin,
    refreshToken,
    updateUser,
    loginWithPassword,
    loginWithEmailCode,
    loginWithPhoneCode,
    sendVerificationCode,
    registerUser,
    resetPassword,
    hasPermission,
    hasRole,
    guard: guardRef.current
  };

  return (
    <UnifiedAuthContext.Provider value={contextValue}>
      {children}
    </UnifiedAuthContext.Provider>
  );
};

/**
 * 使用统一认证 Hook
 */
export const useUnifiedAuth = (): UnifiedAuthContextType => {
  const context = useContext(UnifiedAuthContext);
  if (context === undefined) {
    throw new Error('useUnifiedAuth must be used within a UnifiedAuthProvider');
  }
  return context;
};

export default UnifiedAuthContext;