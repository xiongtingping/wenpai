/**
 * 🔐 统一认证提供者
 * 整合所有认证功能的单一入口，替代原有的多层架构
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { AuthContextType, AuthUser, AuthState, LoginParams, RegisterParams } from './types';
import { getAuthProviderConfig } from './config';
import { authService } from './authService';
import { tokenManager } from './tokenManager';
import { permissionManager } from './permissionManager';
import { setAuthTokenGetter } from '@/api/request';
import { logger } from '@/utils/logger';
// 🔧 引入弹窗样式修复
import './authing-modal-fix.css';

/**
 * 生成PKCE code_verifier
 */
function generateCodeVerifier(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return btoa(String.fromCharCode(...array))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

/**
 * 生成PKCE code_challenge
 */
async function generateCodeChallenge(verifier: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(verifier);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return btoa(String.fromCharCode(...new Uint8Array(digest)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

// 创建认证上下文
const UnifiedAuthContext = createContext<AuthContextType | null>(null);

// 认证提供者组件
export const UnifiedAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // ===== 状态管理 =====
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    loading: true,
    error: null,
    initialized: false
  });

  // ===== 初始化 =====
  useEffect(() => {
    initializeAuth();
  }, []);

  /**
   * 初始化认证系统
   */
  const initializeAuth = async () => {
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }));
      
      const config = getAuthProviderConfig();
      
      // 初始化认证服务
      await authService.initialize(config.config);
      
      // 检查现有的认证状态
      await checkExistingAuth();
      
      // 设置API请求的token获取器
      setAuthTokenGetter(() => tokenManager.getAccessToken());
      
      setAuthState(prev => ({ 
        ...prev, 
        loading: false, 
        initialized: true 
      }));
      
      logger.info('✅ 统一认证系统初始化成功');
    } catch (error) {
      logger.error('❌ 认证系统初始化失败:', error);
      setAuthState(prev => ({ 
        ...prev, 
        loading: false, 
        error: error instanceof Error ? error.message : '初始化失败',
        initialized: true 
      }));
    }
  };

  /**
   * 检查现有认证状态
   */
  const checkExistingAuth = async () => {
    try {
      // 从存储中获取用户信息
      const storedUser = tokenManager.getUser();
      const storedToken = tokenManager.getAccessToken();
      
      if (storedUser && storedToken) {
        // 验证token有效性
        const isValid = tokenManager.isTokenValid(storedToken);
        
        if (isValid) {
          // 尝试获取最新用户信息
          const currentUser = await authService.getCurrentUser();
          
          if (currentUser) {
            setAuthState(prev => ({
              ...prev,
              user: currentUser,
              isAuthenticated: true
            }));
            logger.info('✅ 恢复用户登录状态', { userId: currentUser.id });
          } else {
            // 用户信息获取失败，清除本地数据
            await handleLogout();
          }
        } else {
          // token无效，尝试刷新
          await attemptTokenRefresh();
        }
      }
    } catch (error) {
      logger.warn('⚠️ 检查认证状态失败:', error);
      // 清除可能损坏的数据
      tokenManager.clearAll();
    }
  };

  /**
   * 尝试刷新token
   */
  const attemptTokenRefresh = async () => {
    try {
      if (tokenManager.getRefreshToken()) {
        const newTokenInfo = await authService.refreshToken();
        const user = await authService.getCurrentUser();
        
        if (user) {
          setAuthState(prev => ({
            ...prev,
            user,
            isAuthenticated: true
          }));
          logger.info('✅ Token刷新成功');
        }
      }
    } catch (error) {
      logger.warn('⚠️ Token刷新失败:', error);
      tokenManager.clearAll();
    }
  };

  // ===== 认证方法 =====

  /**
   * 用户登录 - 使用弹窗模式避免redirect_uri问题
   */
  const login = useCallback(async (redirectTo?: string) => {
    try {
      console.log('🔄 开始登录流程...');
      setAuthState(prev => ({ ...prev, loading: true, error: null }));

      const config = authService.getConfig();
      console.log('🔧 获取配置:', config);
      if (!config) {
        throw new Error('认证配置未初始化');
      }

      // 动态导入Guard组件
      console.log('📦 开始导入Guard组件...');
      const guardModule = await import('@authing/guard');
      console.log('📦 Guard模块导入成功:', guardModule);

      const { Guard } = guardModule;
      if (!Guard) {
        throw new Error('Guard类未找到');
      }

      // 创建Guard实例 - 使用最简配置
      console.log('🏗️ 开始创建Guard实例...');
      const guardConfig = {
        appId: config.appId,
        host: config.host,
        redirectUri: config.redirectUri,
        mode: 'modal' as const, // 关键：使用弹窗模式
        defaultScene: 'login' as const,
        lang: 'zh-CN' as const,
        // 添加必要的配置以避免oidcConfig错误
        isSSO: false,
        usePrefixCls: true,
        autoRegister: true,
        disableRegister: false,
        disableResetPwd: false,
        clickCloseable: true,
        escCloseable: true
      };
      console.log('🏗️ Guard配置:', guardConfig);

      // 创建Guard实例 - 添加错误处理
      let guard;
      try {
        guard = new Guard(guardConfig);
        console.log('✅ Guard实例创建成功:', guard);
      } catch (error) {
        console.error('❌ Guard实例创建失败:', error);
        // 如果创建失败，尝试使用更基础的配置
        const basicConfig = {
          appId: config.appId,
          host: config.host,
          mode: 'modal' as const,
          defaultScene: 'login' as const
        };
        console.log('🔄 尝试使用基础配置:', basicConfig);
        guard = new Guard(basicConfig);
        console.log('✅ 基础Guard实例创建成功:', guard);
      }

      // 监听登录成功事件
      guard.on('login', async (userInfo: any) => {
        try {
          logger.info('✅ Guard登录成功:', userInfo);

          // 标准化用户信息
          const user = authService.normalizeAuthUser(userInfo);

          // 更新认证状态
          setAuthState(prev => ({
            ...prev,
            user,
            isAuthenticated: true,
            loading: false,
            error: null
          }));

          // 关闭弹窗
          guard.hide();

          // 跳转到目标页面
          if (redirectTo) {
            window.location.href = redirectTo;
          }
        } catch (error) {
          logger.error('❌ 处理登录结果失败:', error);
          setAuthState(prev => ({
            ...prev,
            loading: false,
            error: '登录处理失败'
          }));
        }
      });

      // 监听登录失败事件
      guard.on('login-error', (error: any) => {
        logger.error('❌ Guard登录失败:', error);
        setAuthState(prev => ({
          ...prev,
          loading: false,
          error: error?.message || '登录失败'
        }));
      });

      // 监听弹窗关闭事件
      guard.on('close', () => {
        setAuthState(prev => ({ ...prev, loading: false }));
      });

      // 显示登录弹窗
      console.log('🎭 开始显示登录弹窗...');

      // 🔧 添加错误处理来捕获oidcConfig错误
      try {
        guard.show();
        console.log('🎭 登录弹窗显示命令已发送');
      } catch (error) {
        console.error('❌ 弹窗显示失败:', error);
        if (error instanceof Error && error.message && error.message.includes('oidcConfig')) {
          console.log('🔄 检测到oidcConfig错误，尝试重新初始化...');
          // 忽略oidcConfig错误，继续显示弹窗
          setTimeout(() => {
            try {
              guard.show();
              console.log('🎭 重试显示登录弹窗成功');
            } catch (retryError) {
              console.error('❌ 重试显示弹窗仍失败:', retryError);
            }
          }, 100);
        }
      }

      // 🚨 紧急修复：立即恢复页面布局
      setTimeout(() => {
        console.log('🚨 紧急恢复页面布局...');

        // 强制恢复页面主要元素的正常样式
        const restorePageLayout = () => {
          // 恢复html元素
          const html = document.documentElement;
          if (html) {
            html.style.position = '';
            html.style.transform = '';
            html.style.top = '';
            html.style.left = '';
            html.style.width = '';
            html.style.height = '';
            html.style.overflow = '';
            console.log('✅ 恢复了html元素样式');
          }

          // 恢复body元素
          const body = document.body;
          if (body) {
            body.style.position = '';
            body.style.transform = '';
            body.style.top = '';
            body.style.left = '';
            body.style.width = '';
            body.style.height = '';
            body.style.overflow = '';
            console.log('✅ 恢复了body元素样式');
          }

          // 恢复root元素
          const root = document.getElementById('root');
          if (root) {
            root.style.position = '';
            root.style.transform = '';
            root.style.top = '';
            root.style.left = '';
            root.style.width = '';
            root.style.height = '';
            root.style.overflow = '';
            console.log('✅ 恢复了root元素样式');
          }
        };

        // 立即恢复页面布局
        restorePageLayout();

        // 查找真正的Authing弹窗（排除页面主要元素）
        const findRealAuthingModal = () => {
          // 查找所有可能的弹窗元素
          const allElements = document.querySelectorAll('*');
          const candidates = [];

          for (const element of allElements) {
            // 严格排除页面主要元素
            if (element === document.documentElement ||
                element === document.body ||
                element.id === 'root' ||
                element.tagName === 'HTML' ||
                element.tagName === 'BODY') {
              continue;
            }

            // 检查是否是Authing相关元素
            const className = element.className || '';
            const id = element.id || '';

            // 确保className是字符串
            const classNameStr = typeof className === 'string' ? className : '';
            const idStr = typeof id === 'string' ? id : '';

            if (classNameStr.includes('authing') ||
                classNameStr.includes('guard') ||
                classNameStr.includes('modal') ||
                idStr.includes('authing')) {
              candidates.push(element as HTMLElement);
            }
          }

          return candidates;
        };

        const authingContainers = findRealAuthingModal();

        // 只修改真正的弹窗元素
        authingContainers.forEach((container, index) => {
          if (container) {
            // 再次确认不是页面主要元素
            if (container === document.documentElement ||
                container === document.body ||
                container.id === 'root') {
              console.log(`⚠️ 跳过页面主要元素: ${container.tagName}#${container.id}`);
              return;
            }

            console.log(`✅ 找到真正的登录弹窗容器 ${index + 1}:`, container);

            const element = container as HTMLElement;

            // 只为真正的弹窗设置样式
            element.style.position = 'fixed';
            element.style.top = '50%';
            element.style.left = '50%';
            element.style.transform = 'translate(-50%, -50%)';
            element.style.zIndex = '999999';
            element.style.backgroundColor = 'white';
            element.style.borderRadius = '8px';
            element.style.boxShadow = '0 4px 20px rgba(0,0,0,0.15)';
            element.style.maxWidth = '400px';
            element.style.maxHeight = '600px';
            element.style.width = 'auto';
            element.style.height = 'auto';
            element.style.display = 'block';
            element.style.visibility = 'visible';
            element.style.opacity = '1';

            console.log('🔧 已正确修复登录弹窗样式');
          }
        });

        // 如果没找到容器，使用MutationObserver等待弹窗出现
        if (authingContainers.length === 0) {
          console.log('⚠️ 未找到Authing容器，启动监听器等待弹窗出现...');

          // 内联样式应用函数
          const applyModalStyles = (el: HTMLElement) => {
            el.style.cssText = `
              position: fixed !important;
              top: 50% !important;
              left: 50% !important;
              transform: translate(-50%, -50%) !important;
              z-index: 999999 !important;
              background: white !important;
              border-radius: 8px !important;
              box-shadow: 0 4px 20px rgba(0,0,0,0.15) !important;
              padding: 20px !important;
              min-width: 400px !important;
              min-height: 300px !important;
              max-width: 500px !important;
              max-height: 700px !important;
              display: block !important;
              visibility: visible !important;
              opacity: 1 !important;
            `;
            console.log('✅ 已应用弹窗样式到元素:', el);
          };

          // 使用MutationObserver监听DOM变化
          const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
              mutation.addedNodes.forEach((node) => {
                if (node.nodeType === Node.ELEMENT_NODE) {
                  const element = node as HTMLElement;
                  // 检查是否是Authing弹窗（更精确的判断）
                  if (element.id && element.id.includes('authing')) {
                    console.log('🔍 检测到Authing弹窗:', element);
                    applyModalStyles(element);
                    observer.disconnect();
                  } else if (element.className &&
                           typeof element.className === 'string' &&
                           (element.className.includes('authing-guard') ||
                            element.className.includes('ant-modal'))) {
                    console.log('🔍 检测到弹窗元素:', element);
                    applyModalStyles(element);
                    observer.disconnect();
                  }
                }
              });
            });
          });

          observer.observe(document.body, {
            childList: true,
            subtree: true
          });

          // 3秒后停止监听
          setTimeout(() => {
            observer.disconnect();
            console.log('⏰ 弹窗监听器已停止');
          }, 3000);
        }
      }, 1000);

      // 再次尝试修复（延迟更长时间）
      setTimeout(() => {
        console.log('🔄 第二次尝试修复弹窗样式...');
        const containers = document.querySelectorAll('[class*="authing"], [id*="authing"], .ant-modal-root');
        containers.forEach(container => {
          if (container && (container as HTMLElement).offsetWidth > 0) {
            console.log('🔍 第二次找到弹窗容器:', container);
            // 直接应用样式
            const element = container as HTMLElement;
            element.style.cssText = `
              position: fixed !important;
              top: 50% !important;
              left: 50% !important;
              transform: translate(-50%, -50%) !important;
              z-index: 999999 !important;
              background: white !important;
              border-radius: 8px !important;
              box-shadow: 0 4px 20px rgba(0,0,0,0.15) !important;
              padding: 20px !important;
              min-width: 400px !important;
              min-height: 300px !important;
              max-width: 500px !important;
              max-height: 700px !important;
              display: block !important;
              visibility: visible !important;
              opacity: 1 !important;
            `;
            console.log('✅ 第二次修复完成:', element);
          }
        });
      }, 3000);

    } catch (error) {
      logger.error('❌ 初始化Guard失败:', error);
      setAuthState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : '登录初始化失败'
      }));
    }
  }, []);

  /**
   * 用户注册 - 使用弹窗模式避免redirect_uri问题
   */
  const register = useCallback(async (redirectTo?: string) => {
    try {
      console.log('🔄 开始注册流程...');
      setAuthState(prev => ({ ...prev, loading: true, error: null }));

      const config = authService.getConfig();
      console.log('🔧 获取配置:', config);
      if (!config) {
        throw new Error('认证配置未初始化');
      }

      // 动态导入Guard组件
      console.log('📦 开始导入Guard组件...');
      const guardModule = await import('@authing/guard');
      console.log('📦 Guard模块导入成功:', guardModule);

      const { Guard } = guardModule;
      if (!Guard) {
        throw new Error('Guard类未找到');
      }

      // 创建Guard实例 - 使用最简配置
      console.log('🏗️ 开始创建Guard实例...');
      const guardConfig = {
        appId: config.appId,
        host: config.host,
        redirectUri: config.redirectUri,
        mode: 'modal' as const, // 关键：使用弹窗模式
        defaultScene: 'register' as const, // 默认显示注册页面
        lang: 'zh-CN' as const
      };
      console.log('🏗️ Guard配置:', guardConfig);

      // 创建Guard实例 - 添加错误处理
      let guard;
      try {
        guard = new Guard(guardConfig);
        console.log('✅ Guard实例创建成功:', guard);
      } catch (error) {
        console.error('❌ Guard实例创建失败:', error);
        // 如果创建失败，尝试使用更基础的配置
        const basicConfig = {
          appId: config.appId,
          host: config.host,
          mode: 'modal' as const,
          defaultScene: 'register' as const
        };
        console.log('🔄 尝试使用基础配置:', basicConfig);
        guard = new Guard(basicConfig);
        console.log('✅ 基础Guard实例创建成功:', guard);
      }

      // 监听注册成功事件
      guard.on('register', async (userInfo: any) => {
        try {
          logger.info('✅ Guard注册成功:', userInfo);

          // 标准化用户信息
          const user = authService.normalizeAuthUser(userInfo);

          // 更新认证状态
          setAuthState(prev => ({
            ...prev,
            user,
            isAuthenticated: true,
            loading: false,
            error: null
          }));

          // 关闭弹窗
          guard.hide();

          // 跳转到目标页面
          if (redirectTo) {
            window.location.href = redirectTo;
          }
        } catch (error) {
          logger.error('❌ 处理注册结果失败:', error);
          setAuthState(prev => ({
            ...prev,
            loading: false,
            error: '注册处理失败'
          }));
        }
      });

      // 监听注册失败事件
      guard.on('register-error', (error: any) => {
        logger.error('❌ Guard注册失败:', error);
        setAuthState(prev => ({
          ...prev,
          loading: false,
          error: error?.message || '注册失败'
        }));
      });

      // 监听弹窗关闭事件
      guard.on('close', () => {
        setAuthState(prev => ({ ...prev, loading: false }));
      });

      // 显示注册弹窗
      console.log('🎭 开始显示注册弹窗...');

      // 🔧 添加错误处理来捕获oidcConfig错误
      try {
        guard.show();
        console.log('🎭 注册弹窗显示命令已发送');
      } catch (error) {
        console.error('❌ 注册弹窗显示失败:', error);
        if (error instanceof Error && error.message && error.message.includes('oidcConfig')) {
          console.log('🔄 检测到oidcConfig错误，尝试重新初始化...');
          // 忽略oidcConfig错误，继续显示弹窗
          setTimeout(() => {
            try {
              guard.show();
              console.log('🎭 重试显示注册弹窗成功');
            } catch (retryError) {
              console.error('❌ 重试显示注册弹窗仍失败:', retryError);
            }
          }, 100);
        }
      }

      // 🔧 修复注册弹窗样式和位置
      setTimeout(() => {
        console.log('🔍 检查并修复注册弹窗样式...');

        // 🚨 首先恢复页面布局
        const restorePageLayout = () => {
          const html = document.documentElement;
          const body = document.body;
          const root = document.getElementById('root');

          [html, body, root].forEach(element => {
            if (element) {
              element.style.position = '';
              element.style.transform = '';
              element.style.top = '';
              element.style.left = '';
              element.style.width = '';
              element.style.height = '';
              element.style.overflow = '';
            }
          });
          console.log('✅ 恢复了页面布局（注册）');
        };

        restorePageLayout();

        // 查找真正的Authing弹窗（排除页面主要元素）
        const findRealAuthingModal = () => {
          const allElements = document.querySelectorAll('*');
          const candidates = [];

          for (const element of allElements) {
            // 严格排除页面主要元素
            if (element === document.documentElement ||
                element === document.body ||
                element.id === 'root' ||
                element.tagName === 'HTML' ||
                element.tagName === 'BODY') {
              continue;
            }

            const className = element.className || '';
            const id = element.id || '';

            // 确保className是字符串
            const classNameStr = typeof className === 'string' ? className : '';
            const idStr = typeof id === 'string' ? id : '';

            if (classNameStr.includes('authing') ||
                classNameStr.includes('guard') ||
                classNameStr.includes('modal') ||
                idStr.includes('authing')) {
              candidates.push(element as HTMLElement);
            }
          }

          return candidates;
        };

        const authingContainers = findRealAuthingModal();

        // 只修改真正的弹窗元素
        authingContainers.forEach((container, index) => {
          if (container) {
            // 再次确认不是页面主要元素
            if (container === document.documentElement ||
                container === document.body ||
                container.id === 'root') {
              console.log(`⚠️ 跳过页面主要元素: ${container.tagName}#${container.id}`);
              return;
            }

            console.log(`✅ 找到真正的注册弹窗容器 ${index + 1}:`, container);

            const element = container as HTMLElement;

            // 只为真正的弹窗设置样式
            element.style.position = 'fixed';
            element.style.top = '50%';
            element.style.left = '50%';
            element.style.transform = 'translate(-50%, -50%)';
            element.style.zIndex = '999999';
            element.style.backgroundColor = 'white';
            element.style.borderRadius = '8px';
            element.style.boxShadow = '0 4px 20px rgba(0,0,0,0.15)';
            element.style.maxWidth = '400px';
            element.style.maxHeight = '600px';
            element.style.width = 'auto';
            element.style.height = 'auto';
            element.style.display = 'block';
            element.style.visibility = 'visible';
            element.style.opacity = '1';

            console.log('🔧 已正确修复注册弹窗样式');
          }
        });

        // 如果没找到容器，查找所有可能的弹窗元素
        if (authingContainers.length === 0) {
          console.log('⚠️ 未找到标准容器，搜索所有可能的注册弹窗元素...');
          const allElements = document.querySelectorAll('*');
          allElements.forEach(el => {
            const element = el as HTMLElement;
            if (element.textContent &&
                (element.textContent.includes('注册') ||
                 element.textContent.includes('验证码') ||
                 element.textContent.includes('密码') ||
                 element.textContent.includes('手机号') ||
                 element.textContent.includes('邮箱')) &&
                element.offsetWidth > 200 && element.offsetHeight > 200) {
              console.log('🔍 找到可能的注册弹窗元素:', element);
              element.style.cssText = `
                position: fixed !important;
                top: 50% !important;
                left: 50% !important;
                transform: translate(-50%, -50%) !important;
                z-index: 999999 !important;
                background: white !important;
                border-radius: 8px !important;
                box-shadow: 0 4px 20px rgba(0,0,0,0.15) !important;
                padding: 20px !important;
              `;
            }
          });
        } else {
          console.log('❌ 未找到注册弹窗元素');
        }
      }, 1000);

    } catch (error) {
      logger.error('❌ 初始化Guard失败:', error);
      setAuthState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : '注册初始化失败'
      }));
    }
  }, []);

  /**
   * 用户登出
   */
  const logout = useCallback(async () => {
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }));
      
      await authService.logout();
      await handleLogout();
      
      logger.info('✅ 用户登出成功');
    } catch (error) {
      logger.error('❌ 登出失败:', error);
      // 即使登出失败，也要清除本地状态
      await handleLogout();
    }
  }, []);

  /**
   * 处理登出后的状态清理
   */
  const handleLogout = async () => {
    setAuthState(prev => ({
      ...prev,
      user: null,
      isAuthenticated: false,
      loading: false,
      error: null
    }));
    
    // 清除API token获取器
    setAuthTokenGetter(() => null);
  };

  /**
   * 刷新token
   */
  const refreshToken = useCallback(async () => {
    try {
      await authService.refreshToken();
      logger.info('✅ Token手动刷新成功');
    } catch (error) {
      logger.error('❌ Token手动刷新失败:', error);
      await handleLogout();
      throw error;
    }
  }, []);

  /**
   * 更新用户信息
   */
  const updateUser = useCallback(async (updates: Partial<AuthUser>) => {
    try {
      const updatedUser = await authService.updateUser(updates);
      setAuthState(prev => ({
        ...prev,
        user: updatedUser
      }));
      logger.info('✅ 用户信息更新成功');
    } catch (error) {
      logger.error('❌ 用户信息更新失败:', error);
      throw error;
    }
  }, []);

  /**
   * 检查认证状态
   */
  const checkAuthStatus = useCallback(async (): Promise<boolean> => {
    try {
      const user = await authService.getCurrentUser();
      const isAuthenticated = !!user;
      
      setAuthState(prev => ({
        ...prev,
        user,
        isAuthenticated
      }));
      
      return isAuthenticated;
    } catch (error) {
      logger.error('❌ 检查认证状态失败:', error);
      return false;
    }
  }, []);

  // ===== 权限方法 =====

  /**
   * 检查权限
   */
  const hasPermission = useCallback((permission: string): boolean => {
    return permissionManager.hasPermission(authState.user, permission);
  }, [authState.user]);

  /**
   * 检查角色
   */
  const hasRole = useCallback((role: string): boolean => {
    return permissionManager.hasRole(authState.user, role);
  }, [authState.user]);

  /**
   * 检查功能访问权限
   */
  const hasFeature = useCallback((feature: string): boolean => {
    return permissionManager.canUseFeature(authState.user, feature);
  }, [authState.user]);

  /**
   * 检查是否可以使用功能
   */
  const canUseFeature = useCallback((feature: string): boolean => {
    return permissionManager.canUseFeature(authState.user, feature);
  }, [authState.user]);

  // ===== 向后兼容方法 =====
  const checkAuth = checkAuthStatus; // 别名
  const handleAuthingLogin = async (user: AuthUser) => {
    setAuthState(prev => ({
      ...prev,
      user,
      isAuthenticated: true,
      error: null
    }));
  };

  // 简化的登录方法（暂时使用默认登录）
  const loginWithPassword = async (email: string, password: string) => {
    await login();
  };
  const loginWithEmailCode = async (email: string, code: string) => {
    await login();
  };
  const loginWithPhoneCode = async (phone: string, code: string) => {
    await login();
  };
  const sendVerificationCode = async (target: string, type: 'email' | 'phone') => {
    logger.info('发送验证码功能暂未实现');
  };
  const registerUser = async (params: RegisterParams) => {
    await register(params.redirectTo);
  };
  const resetPassword = async (email: string) => {
    logger.info('重置密码功能暂未实现');
  };

  // ===== 订阅状态 =====
  const isPro = permissionManager.isPro(authState.user);
  const isPremium = permissionManager.isPremium(authState.user);

  // ===== 上下文值 =====
  const contextValue: AuthContextType = {
    // 状态
    ...authState,

    // 认证方法
    login,
    register,
    logout,
    refreshToken,
    updateUser,
    checkAuthStatus,

    // 向后兼容方法
    checkAuth,
    handleAuthingLogin,
    loginWithPassword,
    loginWithEmailCode,
    loginWithPhoneCode,
    sendVerificationCode,
    registerUser,
    resetPassword,
    guard: null, // 暂时为null

    // 权限方法
    hasPermission,
    hasRole,
    hasFeature,
    canUseFeature,

    // 订阅状态
    isPro,
    isPremium
  };

  return (
    <UnifiedAuthContext.Provider value={contextValue}>
      {children}
    </UnifiedAuthContext.Provider>
  );
};

// ===== Hook =====

/**
 * 使用统一认证的Hook
 */
export const useUnifiedAuth = (): AuthContextType => {
  const context = useContext(UnifiedAuthContext);
  if (!context) {
    throw new Error('useUnifiedAuth must be used within a UnifiedAuthProvider');
  }
  return context;
};

// 导出默认的hook（向后兼容）
export const useAuth = useUnifiedAuth;
