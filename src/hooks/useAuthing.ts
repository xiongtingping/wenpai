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
        
        const config = getGuardConfig();
        
        // 使用与成功测试页面相同的配置
        const newGuard = new window.GuardFactory.Guard({
            appId: '6867fdc88034eb95ae86167d',
            host: 'https://qutkgzkfaezk-demo.authing.cn',
            redirectUri: window.location.origin + '/callback',
            mode: 'modal',
            // 官方推荐的事件回调配置
            onLogin: async (user) => {
                console.log('官方 onLogin 回调触发:', user);
                try {
                    // 立即更新登录状态
                    setIsLoggedIn(true);
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
                    // 立即关闭弹窗
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
                        localStorage.removeItem('login_redirect_to');
                        console.log('登录成功后跳转到指定页面:', redirectTo);
                        
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
                    console.error('处理登录成功回调失败:', error);
                }
            },
            onRegister: async (user) => {
                console.log('官方 onRegister 回调触发:', user);
                try {
                    // 立即更新登录状态
                    setIsLoggedIn(true);
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
                    // 立即关闭弹窗
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
                        localStorage.removeItem('login_redirect_to');
                        console.log('注册成功后跳转到指定页面:', redirectTo);
                        
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
                    console.error('处理注册成功回调失败:', error);
                }
            },
            onClose: () => {
                console.log('官方 onClose 回调触发');
                setIsModalOpen(false);
                restoreFocus();
                cleanupFocusConflicts();
            }
        });
        
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
   * 检查登录状态
   */
  const checkLoginStatus = useCallback(async (): Promise<boolean> => {
    if (!guard) return false;
    
    try {
      const status = await guard.checkLoginStatus();
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
      return false;
    }
  }, [guard]);

  /**
   * 获取当前用户
   */
  const getCurrentUser = useCallback(async (): Promise<User | null> => {
    if (!guard) return null;
    
    try {
      const userInfo = await guard.trackSession();
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
      return null;
    }
  }, [guard]);

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
   * 定期检查用户状态（减少频率）
   */
  useEffect(() => {
    if (!guard) return;

    // 减少检查频率，从500ms改为5秒
    const interval = setInterval(async () => {
      try {
        await checkLoginStatus();
      } catch (error) {
        console.warn('定期检查用户状态失败:', error);
        // 不中断检查，继续运行
      }
    }, 5000); // 改为5秒

    return () => clearInterval(interval);
  }, [guard, checkLoginStatus]);

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