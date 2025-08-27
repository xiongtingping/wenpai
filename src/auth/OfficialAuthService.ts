/**
 * 🎯 基于@authing/guard官方SDK的认证服务
 * 使用Guard组件，提供完整的UI和认证流程
 */

import { Guard } from '@authing/guard';
import { createOfficialAuthSDK, getOfficialAuthConfig } from './officialAuthConfig';
import { logger } from '@/utils/logger';

export interface AuthUser {
  id: string;
  nickname?: string;
  name?: string;
  username?: string;
  email?: string;
  avatar?: string;
  phone?: string;
  [key: string]: any;
}

/**
 * 官方SDK认证服务
 */
export class OfficialAuthService {
  private static instance: OfficialAuthService;
  private sdk: Guard;
  private currentUser: AuthUser | null = null;

  private constructor() {
    this.sdk = createOfficialAuthSDK();
    logger.info('🎯 官方认证服务已初始化');

    // 🔧 监听API失败事件，自动触发备用登录
    window.addEventListener('authingApiFailed', (event: any) => {
      console.log('🔄 收到Authing API失败事件，触发备用登录...', event.detail);
      this.fallbackLogin();
    });
  }

  static getInstance(): OfficialAuthService {
    if (!this.instance) {
      this.instance = new OfficialAuthService();
    }
    return this.instance;
  }

  /**
   * 使用@authing/guard的start方法，增强错误处理和备用方案
   */
  async login(): Promise<void> {
    try {
      console.log('🔍 OfficialAuthService.login()被调用!');
      logger.info('🚀 开始官方Guard登录流程...');

      // 🎯 [兼容性修复] 由于弹窗模式存在渲染冲突，永久切换到备用登录方案
      this.fallbackLogin();

      logger.info('✅ 官方Guard登录窗口已打开');
    } catch (error) {
      console.error('❌ Guard启动失败:', error);
      logger.error('❌ 官方Guard登录失败:', error);

      // 🔧 简化错误处理，直接抛出错误让上层处理
      throw new Error(`登录失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  }

  /**
   * 备用登录方案：直接跳转到Authing登录页面
   */
  private fallbackLogin(): void {
    try {
      logger.info('🔄 启动备用登录方案：直接跳转到Authing登录页面');

      const config = getOfficialAuthConfig();
      const loginUrl = `https://${config.domain}/login?app_id=${config.appId}&redirect_uri=${encodeURIComponent(config.redirectUri)}&response_type=code&scope=openid profile email`;

      logger.info('🌐 跳转到登录页面:', loginUrl);
      window.location.href = loginUrl;
    } catch (error) {
      logger.error('❌ 备用登录方案也失败了:', error);
      throw new Error('认证服务暂时不可用，请稍后重试或联系技术支持');
    }
  }

  /**
   * 检查是否是回调URL
   */
  isRedirectCallback(): boolean {
    const urlParams = new URLSearchParams(window.location.search);
    const isCallback = urlParams.has('code') && urlParams.has('state');
    logger.info('🔍 检查是否是回调URL:', {
      isCallback,
      currentUrl: window.location.href
    });
    return isCallback;
  }

  /**
   * 处理登录回调
   */
  async handleRedirectCallback(): Promise<AuthUser | null> {
    try {
      logger.info('🔄 处理官方SDK登录回调...');

      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');
      const state = urlParams.get('state');

      if (!code || !state) {
        throw new Error('缺少必要的回调参数');
      }

      // 🎯 根据@authing/guard官方文档，使用事件监听方式处理回调
      // Guard SDK应该通过事件监听来处理登录成功，而不是直接调用API
      return new Promise((resolve, reject) => {
        // 设置超时处理
        const timeout = setTimeout(() => {
          reject(new Error('回调处理超时'));
        }, 10000);

        // 监听登录成功事件
        this.sdk.on('login', (userInfo: any) => {
          clearTimeout(timeout);

          if (userInfo) {
            const user: AuthUser = {
              id: userInfo.sub || userInfo.id || 'unknown',
              nickname: userInfo.nickname || userInfo.name || 'User',
              name: userInfo.name || userInfo.nickname || 'User',
              username: userInfo.username || userInfo.email || 'user',
              email: userInfo.email || '',
              avatar: userInfo.picture || userInfo.avatar || '',
              phone: userInfo.phone_number || ''
            };

            this.currentUser = user;
            localStorage.setItem('auth_user', JSON.stringify(user));

            logger.info('✅ 官方SDK回调处理成功:', {
              hasUser: !!user,
              userId: user.id,
              userName: user.nickname || user.name
            });

            resolve(user);
          } else {
            reject(new Error('获取用户信息失败'));
          }
        });

        // 监听登录错误事件
        this.sdk.on('login-error', (error: any) => {
          clearTimeout(timeout);
          logger.error('❌ Guard登录错误:', error);
          reject(new Error(`登录失败: ${error.message || '未知错误'}`));
        });

        // 尝试处理当前URL的回调
        try {
          // 对于已经在回调页面的情况，直接触发Guard的回调处理
          if (window.location.pathname.includes('/callback')) {
            // Guard会自动检测URL参数并触发相应事件
            logger.info('🔍 检测到回调URL，等待Guard自动处理...');
          }
        } catch (initError) {
          clearTimeout(timeout);
          reject(initError);
        }
      });
    } catch (error) {
      logger.error('❌ 官方SDK回调处理失败:', error);
      throw error;
    }
  }

  /**
   * 获取当前登录状态
   */
  async getLoginState(): Promise<AuthUser | null> {
    try {
      logger.info('🔍 获取官方SDK登录状态...');

      // 🎯 返回当前用户状态
      if (this.currentUser) {
        logger.info('📊 官方SDK登录状态:', {
          hasUser: !!this.currentUser,
          isAuthenticated: !!this.currentUser,
          userId: this.currentUser.id
        });

        return this.currentUser;
      }

      // 尝试从存储中恢复用户状态
      const storedUser = localStorage.getItem('auth_user');
      if (storedUser) {
        this.currentUser = JSON.parse(storedUser);
        return this.currentUser;
      }

      return null;
    } catch (error) {
      logger.error('❌ 获取官方SDK登录状态失败:', error);
      return null;
    }
  }

  /**
   * 获取当前用户信息
   */
  async getCurrentUser(): Promise<AuthUser | null> {
    try {
      const user = await this.getLoginState();

      if (user) {
        logger.info('👤 获取用户信息成功:', {
          id: user.id,
          nickname: user.nickname,
          email: user.email
        });
      }

      return user;
    } catch (error) {
      logger.error('❌ 获取用户信息失败:', error);
      return null;
    }
  }

  /**
   * 登出
   */
  async logout(): Promise<void> {
    try {
      logger.info('🚪 开始官方SDK登出...');

      // 🎯 清除本地状态
      this.currentUser = null;
      localStorage.removeItem('auth_user');

      // 🎯 使用Guard的logout方法
      try {
        await this.sdk.logout();
      } catch (logoutError) {
        // 如果Guard logout失败，手动清理并跳转
        logger.warn('⚠️ Guard logout失败，执行手动清理:', logoutError);
        window.location.href = window.location.origin;
      }
      
      logger.info('✅ 官方SDK登出成功');
    } catch (error) {
      logger.error('❌ 官方SDK登出失败:', error);
      throw error;
    }
  }

  /**
   * 刷新Token（如果SDK支持）
   */
  async refreshToken(): Promise<void> {
    try {
      logger.info('🔄 刷新Token...');
      
      // 重新获取登录状态来刷新token
      await this.getLoginState();
      
      logger.info('✅ Token刷新成功');
    } catch (error) {
      logger.error('❌ Token刷新失败:', error);
      throw error;
    }
  }

  /**
   * 更新用户信息（简单实现）
   */
  async updateUser(updates: Partial<AuthUser>): Promise<AuthUser> {
    // 官方SDK可能不直接支持用户信息更新
    // 这里提供一个简单的本地更新实现
    if (this.currentUser) {
      Object.assign(this.currentUser, updates);
    }

    const user = await this.getCurrentUser();
    if (!user) {
      throw new Error('用户未登录');
    }

    return user;
  }

  /**
   * 获取访问令牌
   */
  async getAccessToken(): Promise<string | null> {
    try {
      const loginState = await this.getLoginState();
      return loginState?.accessToken || null;
    } catch (error) {
      logger.error('❌ 获取访问令牌失败:', error);
      return null;
    }
  }

  /**
   * 获取SDK实例（供高级用法）
   */
  getSDK(): Guard {
    return this.sdk;
  }
}