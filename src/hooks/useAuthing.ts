/**
 * Authing Hook
 * 提供 Authing 认证相关的功能，包含无障碍访问修复
 * 增加登录状态检查的超时重试与指数退避机制，优化开发体验
 * @module useAuthing
 */

import { useState, useEffect, useCallback, useRef, startTransition } from 'react';

// 扩展 Window 接口以包含 Authing Guard
declare global {
  interface Window {
    GuardFactory: {
      Guard: new (config: any) => any;
    };
  }
}

interface User {
  id: string;
  username?: string;
  email?: string;
  phone?: string;
  nickname?: string;
  avatar?: string;
  [key: string]: unknown;
}

interface UseAuthingReturn {
  user: User | null;
  isLoggedIn: boolean;
  loading: boolean;
  guard: any | null;
  checkLoginStatus: () => Promise<boolean>;
  getCurrentUser: () => Promise<User | null>;
  logout: () => Promise<void>;
  showLogin: () => void;
  hideLogin: () => void;
}

/**
 * 从localStorage安全获取用户信息，遇到非JSON自动清理并返回null
 * @returns {User|null}
 */
function getSafeUserFromStorage() {
  const raw = localStorage.getItem('authing_user');
  if (!raw) return null;
  try {
    // 简单判断是否为JSON
    if (raw[0] !== '{' && raw[0] !== '[') throw new Error('Not JSON');
    return JSON.parse(raw);
  } catch (e) {
    console.warn('localStorage中authing_user不是JSON，已自动清理:', e);
    localStorage.removeItem('authing_user');
    return null;
  }
}

/**
 * Authing Hook
 * @returns {UseAuthingReturn} Authing相关状态和方法
 */
export const useAuthing = (): UseAuthingReturn => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [guard, setGuard] = useState<any | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // 焦点管理
  const focusedElement = useRef<HTMLElement | null>(null);
  const modalOpenTime = useRef<number>(0);
  const loginStatusBeforeModal = useRef<boolean>(false);

  /**
   * 保存当前焦点元素
   */
  const saveFocus = useCallback(() => {
    focusedElement.current = document.activeElement as HTMLElement;
    console.log('保存焦点元素:', focusedElement.current?.tagName);
  }, []);

  /**
   * 恢复焦点
   */
  const restoreFocus = useCallback(() => {
    if (focusedElement.current) {
      focusedElement.current.focus();
      console.log('恢复焦点到:', focusedElement.current.tagName);
    }
  }, []);

  /**
   * 清理焦点冲突
   */
  const cleanupFocusConflicts = useCallback(() => {
    // 移除可能干扰焦点的元素
    const conflictingElements = document.querySelectorAll('[tabindex="-1"]');
    conflictingElements.forEach(el => {
      if (el !== focusedElement.current) {
        (el as HTMLElement).blur();
      }
    });
  }, []);

  /**
   * 安全关闭弹窗
   */
  const safeCloseModal = useCallback(() => {
    if (guard && isModalOpen) {
      try {
      guard.hide();
      setIsModalOpen(false);
      
      // 延迟恢复焦点，确保弹窗完全关闭
      setTimeout(() => {
        restoreFocus();
        cleanupFocusConflicts();
        }, 300);
    } catch (error) {
      console.error('关闭弹窗失败:', error);
    }
    }
  }, [guard, isModalOpen, restoreFocus, cleanupFocusConflicts]);

  /**
   * 初始化 Authing Guard
   */
  useEffect(() => {
    const initGuard = () => {
      try {
        setLoading(true);
        
        // 检查 Authing Guard 是否可用
        if (!window.GuardFactory?.Guard) {
          console.error('Authing Guard 未加载');
          setLoading(false);
          return;
        }
        
        // 使用 startTransition 包装异步操作，避免 React Suspense 错误
        startTransition(() => {
          // 使用setTimeout延迟初始化，避免在React渲染过程中出现错误
          setTimeout(async () => {
            try {
              // 创建 Guard 实例
              let newGuard;
              try {
                newGuard = new window.GuardFactory.Guard({
                  appId: import.meta.env.VITE_AUTHING_APP_ID,
                  host: import.meta.env.VITE_AUTHING_HOST,
                  mode: 'modal',
                  defaultLoginMethod: 'phone-code',
                  autoRegister: true,
                  skipComplateFileds: true,
                  closeable: true,
                  title: '登录文派',
                  logo: '/favicon.ico',
                  contentCss: `
                    .authing-guard-container {
                      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                    }
                    .authing-guard-container button {
                      border-radius: 8px !important;
                    }
                    .authing-guard-container input {
                      border-radius: 6px !important;
                    }
                  `,
                });
              } catch (guardError) {
                console.error('创建Guard实例失败:', guardError);
                setLoading(false);
                return;
              }

              setGuard(newGuard);
              console.log('✅ Authing Guard 初始化成功');

              // 设置事件监听器（即使失败也不应该阻止初始化）
              try {
                setupEventListeners(newGuard);
              } catch (eventError) {
                console.warn('设置事件监听器失败，但继续初始化:', eventError);
              }
              
              // 检查初始登录状态
              try {
                await checkInitialLoginStatus(newGuard);
              } catch (statusError) {
                console.warn('检查初始登录状态失败:', statusError);
              }
              
            } catch (error) {
              console.error('延迟初始化 Authing Guard 失败:', error);
            } finally {
              setLoading(false);
            }
          }, 100); // 延迟100ms初始化
        });
        
      } catch (error) {
        console.error('初始化 Authing Guard 失败:', error);
        setLoading(false);
      }
    };

    initGuard();
  }, []);

  /**
   * 设置事件监听器，只注册官方支持的事件类型
   * @param {any} newGuard
   */
  const setupEventListeners = useCallback((newGuard: any) => {
    if (!newGuard || typeof newGuard.on !== 'function') return;

    /**
     * 官方文档支持的事件类型
     * - login: 登录成功
     * - register: 注册成功
     * - login-error: 登录失败
     * - register-error: 注册失败
     */
    const supportedEvents = ['login', 'register', 'login-error', 'register-error'];

    supportedEvents.forEach(event => {
      try {
        newGuard.on(event, async (user: any) => {
          try {
            if (user && typeof user === 'object' && user.id) {
              const userData: User = {
                id: user.id || '',
                username: user.username || '',
                email: user.email || '',
                phone: user.phone || '',
                nickname: user.nickname || '',
                avatar: user.avatar || '',
              };
              startTransition(() => {
                setUser(userData);
                setIsLoggedIn(true);
                setIsModalOpen(false);
              });
              localStorage.setItem('authing_user', JSON.stringify(userData));
              /**
               * 登录成功后自动跳转到之前保存的页面
               * @see UnifiedAuthContext login 方法
               */
              const redirectTo = localStorage.getItem('login_redirect_to');
              if (redirectTo) {
                localStorage.removeItem('login_redirect_to');
                window.location.href = redirectTo;
              }
            } else {
              console.warn(`${event}事件参数异常:`, user);
            }
          } catch (err) {
            console.error(`处理${event}事件失败:`, err);
          }
        });
      } catch (err) {
        console.warn(`注册${event}事件监听器失败:`, err);
      }
    });
    // 其它事件（如logout、change）不再注册监听器，彻底消除push报错
  }, []);

  /**
   * 检查初始登录状态
   */
  const checkInitialLoginStatus = useCallback(async (newGuard: any) => {
    try {
      const user = getSafeUserFromStorage();
      if (user) {
        startTransition(() => {
          setUser(user);
          setIsLoggedIn(true);
        });
        return;
      }
      
      // 如果localStorage中没有，尝试从guard检查（但可能失败）
      try {
        const isLoggedIn = await newGuard.checkLoginStatus();
        if (isLoggedIn && user) { // user is null if not in localStorage
          try {
            const userData = JSON.parse(JSON.stringify(user)); // Deep copy to avoid modifying original
            startTransition(() => {
              setUser(userData);
              setIsLoggedIn(true);
            });
            // securityUtils.secureLog('从localStorage恢复用户状态成功', { userId: userData.id }); // Removed securityUtils
          } catch (parseError) {
            console.error('解析存储的用户信息失败:', parseError);
          }
        }
      } catch (guardError) {
        console.warn('从guard检查初始登录状态失败:', guardError);
      }
    } catch (error) {
      console.error('检查初始登录状态失败:', error);
    }
  }, []);

  /**
   * 检查登录状态
   */
  const checkLoginStatus = useCallback(async (): Promise<boolean> => {
    if (!guard) return false;
    
    try {
      // 优先检查localStorage中的用户信息
      const storedUser = localStorage.getItem('authing_user');
      if (storedUser) {
        try {
          const userData = JSON.parse(storedUser);
          if (userData && userData.id) {
            console.log('检查登录状态结果: 从localStorage获取到用户信息');
            return true;
          }
        } catch (parseError) {
          console.error('解析存储的用户信息失败:', parseError);
        }
      }
      
      // 如果localStorage中没有，尝试从guard检查（但可能失败）
      try {
        const isLoggedIn = await guard.checkLoginStatus();
        console.log('检查登录状态结果:', { isLoggedIn });
        return isLoggedIn;
      } catch (guardError) {
        console.warn('从guard检查登录状态失败，使用localStorage:', guardError);
        // 如果guard方法失败，回退到localStorage检查
        return Boolean(storedUser);
      }
    } catch (error) {
      console.error('检查登录状态失败:', error);
      throw error;
    }
  }, [guard]);

  /**
   * 获取当前用户信息，优先从localStorage安全获取
   * @returns {Promise<User|null>}
   */
  const getCurrentUser = useCallback(async (): Promise<User | null> => {
    const user = getSafeUserFromStorage();
    if (user) return user;
    
    // 如果localStorage中没有，尝试从guard获取（但可能失败）
    try {
      const userInfo = await guard.getCurrentUser();
      if (userInfo) {
        const userData: User = {
          id: userInfo.id || '',
          username: userInfo.username || '',
          email: userInfo.email || '',
          phone: userInfo.phone || '',
          nickname: userInfo.nickname || '',
          avatar: userInfo.avatar || '',
        };
        return userData;
      }
    } catch (guardError) {
      console.warn('从guard获取用户信息失败，使用localStorage:', guardError);
      }
      
      return null;
  }, [guard]);

  /**
   * 登出
   */
  const logout = useCallback(async (): Promise<void> => {
    if (!guard) return;
    
    try {
      // 尝试调用guard的logout方法（但可能失败）
    try {
      await guard.logout();
      } catch (guardError) {
        console.warn('从guard登出失败，继续清理本地状态:', guardError);
      }
      
      // 无论guard.logout是否成功，都清理本地状态
      startTransition(() => {
      setUser(null);
      setIsLoggedIn(false);
        setIsModalOpen(false);
      });
      localStorage.removeItem('authing_user');
      
      // securityUtils.secureLog('用户登出成功'); // Removed securityUtils
    } catch (error) {
      console.error('登出失败:', error);
    }
  }, [guard]);

  /**
   * 显示登录界面
   */
  const showLogin = useCallback((): void => {
    console.log('🔍 开始显示Authing登录弹窗...');
    console.log('🔍 当前Guard状态:', { guard: !!guard, isLoggedIn, authingLoading: loading });
    
    if (!guard) {
      console.error('❌ Guard未初始化，无法显示登录弹窗');
      return;
    }

    try {
      // 保存当前焦点
      saveFocus();
      
      // 记录弹窗打开时间
      modalOpenTime.current = Date.now();
      
      // 记录弹窗打开前的登录状态
      loginStatusBeforeModal.current = isLoggedIn;
      
      console.log('🔍 调用Guard.show()方法...');
      // 显示登录弹窗
      guard.show();
      startTransition(() => {
      setIsModalOpen(true);
      });
      
      console.log('✅ Authing登录弹窗已显示');
      
      // 添加调试样式，确保弹窗可见
      setTimeout(() => {
        const authingModal = document.querySelector('.authing-guard-container');
        if (authingModal) {
          console.log('✅ 找到Authing弹窗元素:', authingModal);
          // 确保弹窗在最顶层
          (authingModal as HTMLElement).style.zIndex = '9999';
          (authingModal as HTMLElement).style.position = 'fixed';
          (authingModal as HTMLElement).style.top = '50%';
          (authingModal as HTMLElement).style.left = '50%';
          (authingModal as HTMLElement).style.transform = 'translate(-50%, -50%)';
          (authingModal as HTMLElement).style.backgroundColor = 'white';
          (authingModal as HTMLElement).style.padding = '20px';
          (authingModal as HTMLElement).style.borderRadius = '8px';
          (authingModal as HTMLElement).style.boxShadow = '0 4px 20px rgba(0,0,0,0.3)';
          console.log('✅ Authing弹窗样式已优化');
        } else {
          console.warn('⚠️ 未找到Authing弹窗元素，可能弹窗未正确渲染');
        }
      }, 100);
      
      // 启动备用检查机制，定期检查登录状态变化
      const checkInterval = setInterval(async () => {
        try {
          // 优先检查localStorage中的用户信息
          const storedUser = localStorage.getItem('authing_user');
          let isCurrentlyLoggedIn = false;
          
          if (storedUser) {
            try {
              const userData = JSON.parse(storedUser);
              isCurrentlyLoggedIn = Boolean(userData && userData.id);
            } catch (parseError) {
              console.error('解析存储的用户信息失败:', parseError);
            }
          }
          
          // 如果localStorage中没有，尝试从guard检查（但可能失败）
          if (!isCurrentlyLoggedIn) {
        try {
          const currentStatus = await guard.checkLoginStatus();
              isCurrentlyLoggedIn = Boolean(currentStatus);
            } catch (guardError) {
              console.warn('备用检查：从guard检查登录状态失败:', guardError);
            }
          }
          
          // 如果登录状态发生变化且弹窗仍然打开，则关闭弹窗
          if (isCurrentlyLoggedIn !== loginStatusBeforeModal.current && isModalOpen) {
            console.log('备用检查：检测到登录状态变化，关闭弹窗');
            try {
            guard.hide();
            } catch (hideError) {
              console.warn('关闭弹窗失败:', hideError);
            }
            startTransition(() => {
            setIsModalOpen(false);
            });
            clearInterval(checkInterval);
            
            // 恢复焦点
            setTimeout(() => {
              restoreFocus();
              cleanupFocusConflicts();
            }, 300);
          }
        } catch (error) {
          console.error('备用检查机制出错:', error);
        }
      }, 500); // 每500毫秒检查一次，提高响应速度
      
      // 15秒后停止检查
      setTimeout(() => {
        clearInterval(checkInterval);
      }, 15000);
      
    } catch (error) {
      console.error('❌ 显示登录界面失败:', error);
    }
  }, [guard, saveFocus, restoreFocus, cleanupFocusConflicts, isLoggedIn, isModalOpen]);

  /**
   * 隐藏登录界面
   */
  const hideLogin = useCallback((): void => {
    if (guard) {
      safeCloseModal();
    }
  }, [guard, safeCloseModal]);

  /**
   * 定期检查用户状态（优化频率和错误处理）
   */
  useEffect(() => {
    if (!guard) return;

    // 只在开发环境或用户未登录时进行定期检查
    const shouldCheckPeriodically = import.meta.env.DEV || !isLoggedIn;
    
    if (!shouldCheckPeriodically) {
      return;
    }

    let retryCount = 0;
    let interval = 8000; // 默认8秒
    let timer: NodeJS.Timeout;

    const checkStatusWithRetry = async () => {
      try {
        // 添加防抖机制，避免重复请求
        if (loading) {
          console.log('跳过定期检查：正在加载中');
          return;
        }
        
        await checkLoginStatus();
        retryCount = 0; // 成功后重置
        interval = 8000;
      } catch (error) {
        retryCount++;
        interval = Math.min(8000 * Math.pow(2, retryCount), 60000); // 指数退避，最大60秒
        if (retryCount >= 3) {
          console.warn('检查登录状态连续失败:', error);
        } else {
          console.debug('检查登录状态失败:', error);
        }
      } finally {
        timer = setTimeout(checkStatusWithRetry, interval);
      }
    };

    timer = setTimeout(checkStatusWithRetry, interval);

    return () => {
      clearTimeout(timer);
    };
  }, [guard, checkLoginStatus, loading, isLoggedIn]);

  return {
    user,
    isLoggedIn,
    loading,
    guard,
    checkLoginStatus,
    getCurrentUser,
    logout,
    showLogin,
    hideLogin,
  };
}; 