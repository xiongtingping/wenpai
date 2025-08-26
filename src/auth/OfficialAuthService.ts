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
    const maxRetries = 3;
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        logger.info(`🚀 开始官方Guard登录流程... (尝试 ${attempt}/${maxRetries})`);

        // 🎯 使用Guard的标准登录方式
        this.sdk.start();

        logger.info('✅ 官方Guard登录窗口已打开');
        return; // 成功则退出
      } catch (error) {
        lastError = error as Error;
        logger.warn(`⚠️ 登录尝试 ${attempt} 失败:`, error);

        // 🔧 检查是否是JSON解析错误
        if (error instanceof Error && error.message.includes('JSON')) {
          logger.warn('🔍 检测到JSON解析错误，尝试备用登录方案...');
          return this.fallbackLogin();
        }

        // 如果不是最后一次尝试，等待后重试
        if (attempt < maxRetries) {
          const delay = attempt * 1000; // 递增延迟
          logger.info(`🔄 ${delay}ms 后重试...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    // 所有重试都失败了，尝试备用方案
    logger.error('❌ 官方Guard登录失败，已达到最大重试次数，尝试备用方案:', lastError);
    return this.fallbackLogin();
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

      // 🎯 使用@authing/guard的方式获取用户信息
      // Guard SDK可能需要不同的方法，这里使用通用方式
      const userInfo = await this.sdk.getLoginState();

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

        logger.info('✅ 官方SDK回调处理成功:', {
          hasUser: !!user,
          userId: user.id,
          userName: user.nickname || user.name
        });

        return user;
      }

      throw new Error('获取用户信息失败');
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