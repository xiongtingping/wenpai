/**
 * 🎯 基于@authing/browser官方SDK的认证服务
 * 参考官方实现模式，彻底解决redirect问题
 */

import { Authing } from '@authing/browser';
import type { LoginState } from '@authing/browser/dist/types/global';
import { createOfficialAuthSDK } from './officialAuthConfig';
import { logger } from '../lib/logger';

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
  private sdk: Authing;
  private loginState: LoginState | null = null;

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
   * 使用官方的loginWithRedirect方法
   */
  async login(): Promise<void> {
    try {
      logger.info('🚀 开始官方SDK登录流程...');
      
      // 🎯 使用官方推荐的登录方式
      await this.sdk.loginWithRedirect();
      
      logger.info('✅ 官方SDK登录跳转成功');
    } catch (error) {
      logger.error('❌ 官方SDK登录失败:', error);
      throw error;
    }
  }

  /**
   * 检查是否是回调URL
   */
  isRedirectCallback(): boolean {
    const isCallback = this.sdk.isRedirectCallback();
    logger.info('🔍 检查是否是回调URL:', {
      isCallback,
      currentUrl: window.location.href
    });
    return isCallback;
  }

  /**
   * 处理登录回调
   */
  async handleRedirectCallback(): Promise<LoginState | null> {
    try {
      logger.info('🔄 处理官方SDK登录回调...');
      
      // 🎯 使用官方的回调处理方法
      const loginState = await this.sdk.handleRedirectCallback();
      
      this.loginState = loginState;
      
      logger.info('✅ 官方SDK回调处理成功:', {
        hasUser: !!loginState?.user,
        userId: loginState?.user?.sub || loginState?.user?.id,
        userName: loginState?.user?.nickname || loginState?.user?.name
      });
      
      return loginState;
    } catch (error) {
      logger.error('❌ 官方SDK回调处理失败:', error);
      throw error;
    }
  }

  /**
   * 获取当前登录状态
   */
  async getLoginState(): Promise<LoginState | null> {
    try {
      logger.info('🔍 获取官方SDK登录状态...');
      
      // 🎯 使用官方的状态获取方法
      const loginState = await this.sdk.getLoginState();
      
      this.loginState = loginState;
      
      logger.info('📊 官方SDK登录状态:', {
        hasUser: !!loginState?.user,
        isAuthenticated: !!loginState?.user,
        userId: loginState?.user?.sub || loginState?.user?.id
      });
      
      return loginState;
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
      const loginState = await this.getLoginState();
      
      if (!loginState?.user) {
        return null;
      }

      // 转换为统一的用户格式
      const user: AuthUser = {
        id: loginState.user.sub || loginState.user.id || 'unknown',
        nickname: loginState.user.nickname,
        name: loginState.user.name,
        username: loginState.user.username,
        email: loginState.user.email,
        avatar: loginState.user.picture || loginState.user.avatar,
        phone: loginState.user.phone,
        ...loginState.user // 保留其他字段
      };

      logger.info('👤 获取用户信息成功:', {
        id: user.id,
        nickname: user.nickname,
        email: user.email
      });

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
      
      // 🎯 使用官方的登出方法
      await this.sdk.logoutWithRedirect();
      
      this.loginState = null;
      
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
    if (this.loginState?.user) {
      Object.assign(this.loginState.user, updates);
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
  getSDK(): Authing {
    return this.sdk;
  }
}