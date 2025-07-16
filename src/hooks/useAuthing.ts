/**
 * Authing Hook
 * 提供 Authing 认证相关的功能，包含无障碍访问修复
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { getGuardConfig } from '@/config/authing';

// 声明全局 GuardFactory 类型
declare global {
  interface Window {
    GuardFactory: {
      Guard: new (config: any) => any;
    };
  }
}

/**
 * 用户信息接口
 */
interface User {
  id: string;
  username?: string;
  email?: string;
  phone?: string;
  nickname?: string;
  avatar?: string;
  [key: string]: unknown;
}

/**
 * Authing Hook 返回值接口
 */
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
 * Authing Hook
 * @returns Authing 相关功能
 */
export const useAuthing = (): UseAuthingReturn => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [guard, setGuard] = useState<any | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const lastFocusedElement = useRef<HTMLElement | null>(null);
  const focusCheckInterval = useRef<NodeJS.Timeout | null>(null);
  const modalOpenTime = useRef<number | null>(null);
  const loginStatusBeforeModal = useRef<boolean | null>(null);

  /**
   * 保存当前焦点元素
   */
  const saveFocus = useCallback(() => {
    lastFocusedElement.current = document.activeElement as HTMLElement;
    console.log('保存焦点元素:', lastFocusedElement.current?.tagName);
  }, []);

  /**
   * 恢复焦点
   */
  const restoreFocus = useCallback(() => {
    if (lastFocusedElement.current && typeof lastFocusedElement.current.focus === 'function') {
      try {
        lastFocusedElement.current.focus();
        console.log('恢复焦点到:', lastFocusedElement.current.tagName);
      } catch (error) {
        console.error('恢复焦点失败:', error);
      }
    }
  }, []);

  /**
   * 清理焦点冲突
   */
  const cleanupFocusConflicts = useCallback(() => {
    // 查找所有带有 aria-hidden="true" 但包含焦点元素的容器
    const hiddenContainers = document.querySelectorAll('[aria-hidden="true"]');
    hiddenContainers.forEach(container => {
      const focusedElement = container.querySelector(':focus');
      if (focusedElement) {
        console.log('发现焦点冲突，移除焦点:', focusedElement.tagName);
        (focusedElement as HTMLElement).blur();
      }
    });
  }, []);

  /**
   * 安全关闭弹窗
   */
  const safeCloseModal = useCallback(() => {
    if (!guard || !isModalOpen) {
      console.log('弹窗未打开或 Guard 未初始化');
      return;
    }

    try {
      // 先清理焦点冲突
      cleanupFocusConflicts();
      
      // 关闭弹窗
      guard.hide();
      setIsModalOpen(false);
      console.log('弹窗关闭命令已发送');
      
      // 延迟恢复焦点，确保弹窗完全关闭
      setTimeout(() => {
        restoreFocus();
        cleanupFocusConflicts();
      }, 100);
      
    } catch (error) {
      console.error('关闭弹窗失败:', error);
    }
  }, [guard, isModalOpen, cleanupFocusConflicts, restoreFocus]);

  /**
   * 初始化 Guard
   */
  useEffect(() => {
    const initGuard = async () => {
      try {
        // 等待 GuardFactory 加载
        let retries = 0;
        const maxRetries = 5; // 减少重试次数
        
        while (typeof window.GuardFactory === 'undefined' && retries < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, 300)); // 减少等待时间
          retries++;
        }
        
        if (typeof window.GuardFactory === 'undefined') {
          console.warn('GuardFactory 未加载，跳过Authing初始化');
          setLoading(false);
          return;
        }
        
        /**
         * 初始化 Authing Guard 组件，统一通过 getGuardConfig() 获取配置，避免硬编码。
         */
        const config = getGuardConfig();
        const newGuard = new window.GuardFactory.Guard(config);
        
        setGuard(newGuard);
        
        // 添加事件监听器作为备用方案
        try {
            // 监听登录成功事件（备用）
            newGuard.on('login', async (user) => {
                console.log('事件监听器 login 触发:', user);
                try {
                    // 获取用户信息
                    const userInfo = await newGuard.trackSession();
                    if (userInfo) {
                        const userInfoRecord = userInfo as unknown as Record<string, unknown>;
                        const userData: User = {
                            id: String(userInfoRecord.id || userInfoRecord.userId || ''),
                            username: String(userInfoRecord.username || userInfoRecord.nickname || ''),
                            email: String(userInfoRecord.email || ''),
                            phone: String(userInfoRecord.phone || ''),
                            nickname: String(userInfoRecord.nickname || userInfoRecord.username || ''),
                            avatar: String(userInfoRecord.photo || userInfoRecord.avatar || ''),
                            ...userInfo // 保留其他属性
                        };
                        setUser(userData);
                    }
                    // 更新登录状态
                    setIsLoggedIn(true);
                    // 安全关闭弹窗
                    setTimeout(() => {
                        cleanupFocusConflicts();
                        newGuard.hide();
                        setIsModalOpen(false);
                        setTimeout(() => {
                            restoreFocus();
                            cleanupFocusConflicts();
                        }, 100);
                    }, 300); // 减少延迟
                    
                    // 处理登录成功后的跳转
                    const redirectTo = localStorage.getItem('login_redirect_to');
                    if (redirectTo) {
                        localStorage.removeItem('login_redirect_to'); // 清除存储的跳转目标
                        console.log('事件监听器：登录成功后跳转到指定页面:', redirectTo);
                        // 立即跳转，不使用延迟
                        try {
                            const url = new URL(redirectTo, window.location.origin);
                            if (url.origin === window.location.origin) {
                                window.location.href = redirectTo;
                            } else {
                                console.warn('跳转目标不在同一域名下，已阻止跳转');
                            }
                        } catch (error) {
                            console.error('跳转URL格式错误:', error);
                        }
                    }
                } catch (error) {
                    console.error('处理事件监听器 login 失败:', error);
                }
            });

            // 监听登录失败事件
            newGuard.on('login-error', (error) => {
                console.log('事件监听器 login-error 触发:', error);
            });

            // 监听注册成功事件
            newGuard.on('register', async (user) => {
                console.log('事件监听器 register 触发:', user);
                try {
                    // 获取用户信息
                    const userInfo = await newGuard.trackSession();
                    if (userInfo) {
                        const userInfoRecord = userInfo as unknown as Record<string, unknown>;
                        const userData: User = {
                            id: String(userInfoRecord.id || userInfoRecord.userId || ''),
                            username: String(userInfoRecord.username || userInfoRecord.nickname || ''),
                            email: String(userInfoRecord.email || ''),
                            phone: String(userInfoRecord.phone || ''),
                            nickname: String(userInfoRecord.nickname || userInfoRecord.username || ''),
                            avatar: String(userInfoRecord.photo || userInfoRecord.avatar || ''),
                            ...userInfo // 保留其他属性
                        };
                        setUser(userData);
                    }
                    // 更新登录状态
                    setIsLoggedIn(true);
                    // 安全关闭弹窗
                    setTimeout(() => {
                        cleanupFocusConflicts();
                        newGuard.hide();
                        setIsModalOpen(false);
                        setTimeout(() => {
                            restoreFocus();
                            cleanupFocusConflicts();
                        }, 100);
                    }, 300); // 减少延迟
                    
                    // 处理注册成功后的跳转
                    const redirectTo = localStorage.getItem('login_redirect_to');
                    if (redirectTo) {
                        localStorage.removeItem('login_redirect_to'); // 清除存储的跳转目标
                        console.log('事件监听器：注册成功后跳转到指定页面:', redirectTo);
                        // 立即跳转，不使用延迟
                        try {
                            const url = new URL(redirectTo, window.location.origin);
                            if (url.origin === window.location.origin) {
                                window.location.href = redirectTo;
                            } else {
                                console.warn('跳转目标不在同一域名下，已阻止跳转');
                            }
                        } catch (error) {
                            console.error('跳转URL格式错误:', error);
                        }
                    }
                } catch (error) {
                    console.error('处理事件监听器 register 失败:', error);
                }
            });

            // 监听注册失败事件
            newGuard.on('register-error', (error) => {
                console.log('事件监听器 register-error 触发:', error);
            });

            console.log('事件监听器设置成功');
        } catch (error) {
            console.warn('设置事件监听器失败，将使用官方回调配置:', error);
        }
        
        // 检查初始登录状态（添加错误处理）
        try {
            const status = await newGuard.checkLoginStatus();
            const isLoggedInStatus = Boolean(status);
            setIsLoggedIn(isLoggedInStatus);
            
            // 如果已登录，获取用户信息
            if (isLoggedInStatus) {
              const userInfo = await newGuard.trackSession();
              if (userInfo) {
                const userInfoRecord = userInfo as unknown as Record<string, unknown>;
                const userData: User = {
                  id: String(userInfoRecord.id || userInfoRecord.userId || ''),
                  username: String(userInfoRecord.username || userInfoRecord.nickname || ''),
                  email: String(userInfoRecord.email || ''),
                  phone: String(userInfoRecord.phone || ''),
                  nickname: String(userInfoRecord.nickname || userInfoRecord.username || ''),
                  avatar: String(userInfoRecord.photo || userInfoRecord.avatar || ''),
                  ...userInfo // 保留其他属性
                };
                setUser(userData);
              }
            }
        } catch (error) {
            console.warn('检查初始登录状态失败，继续使用默认状态:', error);
            setIsLoggedIn(false);
        }
        
        setLoading(false);
      } catch (error) {
        console.error('初始化 Guard 失败:', error);
        setLoading(false);
        // 不抛出错误，让应用继续运行
      }
    };

    initGuard();
  }, [restoreFocus, cleanupFocusConflicts]);

  /**
   * 检查登录状态（添加防抖和错误处理）
   */
  const checkLoginStatus = useCallback(async (): Promise<boolean> => {
    if (!guard) return false;
    
    // 添加防抖机制
    if (loading) {
      console.log('跳过登录状态检查：正在加载中');
      return isLoggedIn;
    }
    
    try {
      setLoading(true);
      
      // 添加超时处理
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('检查登录状态超时')), 10000);
      });
      
      const statusPromise = guard.checkLoginStatus();
      const status = await Promise.race([statusPromise, timeoutPromise]);
      
      console.log('检查登录状态结果:', status);
      
      // 支持多种返回格式
      let isLoggedInStatus = false;
      if (typeof status === 'boolean') {
        isLoggedInStatus = status;
      } else if (status && typeof status === 'object') {
        // 如果是对象，检查 status 字段
        isLoggedInStatus = Boolean(status.status || status.isLoggedIn);
      }
      
      setIsLoggedIn(isLoggedInStatus);
      setLoading(false);
      return isLoggedInStatus;
    } catch (error) {
      console.error('检查登录状态失败:', error);
      // 不更新状态，保持当前状态
      setLoading(false);
      
      // 如果是网络错误，返回当前状态
      if (error instanceof Error && error.message.includes('网络')) {
        return isLoggedIn;
      }
      
      return false;
    }
  }, [guard, loading, isLoggedIn]);

  /**
   * 获取当前用户（添加错误处理和缓存）
   */
  const getCurrentUser = useCallback(async (): Promise<User | null> => {
    if (!guard) return null;
    
    // 如果已经有用户信息且正在加载，直接返回
    if (user && loading) {
      return user;
    }
    
    try {
      // 添加超时处理
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('获取用户信息超时')), 10000);
      });
      
      const userInfoPromise = guard.trackSession();
      const userInfo = await Promise.race([userInfoPromise, timeoutPromise]);
      
      if (userInfo) {
        // 转换 Authing SDK 的用户类型到我们的 User 类型
        const userInfoRecord = userInfo as unknown as Record<string, unknown>;
        const userData: User = {
          id: String(userInfoRecord.id || userInfoRecord.userId || ''),
          username: String(userInfoRecord.username || userInfoRecord.nickname || ''),
          email: String(userInfoRecord.email || ''),
          phone: String(userInfoRecord.phone || ''),
          nickname: String(userInfoRecord.nickname || userInfoRecord.username || ''),
          avatar: String(userInfoRecord.photo || userInfoRecord.avatar || ''),
          ...userInfo // 保留其他属性
        };
        
        setUser(userData);
        return userData;
      }
      return null;
    } catch (error) {
      console.error('获取用户信息失败:', error);
      
      // 如果是网络错误，返回缓存的用户信息
      if (error instanceof Error && error.message.includes('网络')) {
        return user;
      }
      
      return null;
    }
  }, [guard, user, loading]);

  /**
   * 登出
   */
  const logout = useCallback(async (): Promise<void> => {
    if (!guard) return;
    
    try {
      await guard.logout();
      setUser(null);
      setIsLoggedIn(false);
    } catch (error) {
      console.error('登出失败:', error);
    }
  }, [guard]);

  /**
   * 显示登录界面
   */
  const showLogin = useCallback((): void => {
    if (guard) {
      try {
        // 保存当前焦点
        saveFocus();
        
        // 记录弹窗打开时间
        modalOpenTime.current = Date.now();
        
        // 记录弹窗打开前的登录状态
        loginStatusBeforeModal.current = isLoggedIn;
        
        // 显示登录弹窗
        guard.show();
        setIsModalOpen(true);
        
        console.log('Authing登录弹窗已显示');
        
        // 启动备用检查机制，定期检查登录状态变化
        const checkInterval = setInterval(async () => {
          try {
            const currentStatus = await guard.checkLoginStatus();
            const isCurrentlyLoggedIn = Boolean(currentStatus);
            
            // 如果登录状态发生变化且弹窗仍然打开，则关闭弹窗
            if (isCurrentlyLoggedIn !== loginStatusBeforeModal.current && isModalOpen) {
              console.log('备用检查：检测到登录状态变化，关闭弹窗');
              guard.hide();
              setIsModalOpen(false);
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
        console.error('显示登录界面失败:', error);
      }
    } else {
      console.error('Guard未初始化，无法显示登录界面');
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

    // 进一步减少检查频率，改为30秒
    const interval = setInterval(async () => {
      try {
        // 添加防抖机制，避免重复请求
        if (loading) {
          console.log('跳过定期检查：正在加载中');
          return;
        }
        
        await checkLoginStatus();
      } catch (error) {
        console.warn('定期检查用户状态失败:', error);
        // 如果连续失败，增加检查间隔
        clearInterval(interval);
        setTimeout(() => {
          // 重新启动检查，但间隔更长
          const retryInterval = setInterval(async () => {
            try {
              await checkLoginStatus();
            } catch (retryError) {
              console.warn('重试检查用户状态失败:', retryError);
            }
          }, 60000); // 1分钟
          
          // 5分钟后停止重试
          setTimeout(() => {
            clearInterval(retryInterval);
          }, 300000);
        }, 10000); // 10秒后重试
      }
    }, 30000); // 改为30秒

    return () => clearInterval(interval);
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