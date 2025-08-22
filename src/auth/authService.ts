/**
 * 🔐 统一认证服务
 * 整合所有认证相关的API调用和业务逻辑
 */

import { AuthenticationClient } from 'authing-js-sdk';
import { 
  AuthConfig, 
  AuthUser, 
  LoginParams, 
  RegisterParams, 
  TokenInfo,
  AuthService as IAuthService 
} from './types';
import { tokenManager } from './tokenManager';
import { logger } from '@/utils/logger';
import { normalizeUserInfo } from '@/services/userInfoNormalizer';

class AuthService implements IAuthService {
  private static instance: AuthService;
  private client: AuthenticationClient | null = null;
  private config: AuthConfig | null = null;
  private initialized = false;

  private constructor() {}

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  // ===== 初始化 =====

  /**
   * 初始化认证服务
   */
  async initialize(config: AuthConfig): Promise<void> {
    try {
      this.config = config;
      
      // 🔧 添加初始化日志
      logger.info('🔄 开始初始化认证服务...', {
        appId: config.appId?.substring(0, 8) + '...',
        host: config.host
      });
      
      // 创建Authing客户端（带超时保护）
      const clientConfig = {
        appId: config.appId,
        appHost: config.host,
        redirectUri: config.redirectUri
      };
      
      // 使用Promise.race添加超时保护
      const createClientPromise = new Promise((resolve, reject) => {
        try {
          const client = new AuthenticationClient(clientConfig);
          resolve(client);
        } catch (error) {
          reject(error);
        }
      });
      
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Authing客户端创建超时')), 5000);
      });
      
      this.client = await Promise.race([createClientPromise, timeoutPromise]) as AuthenticationClient;

      this.initialized = true;
      
      // 清理过期token（但不要阻塞初始化）
      try {
        tokenManager.clearExpiredTokens();
      } catch (error) {
        logger.warn('⚠️ 清理过期token失败:', error);
      }
      
      logger.info('✅ 认证服务初始化成功', { 
        appId: config.appId?.substring(0, 8) + '...',
        host: config.host 
      });
    } catch (error) {
      logger.error('❌ 认证服务初始化失败:', error);
      
      // 🔧 即使初始化失败，也设置为已初始化，提供降级服务
      this.initialized = true;
      this.config = config; // 保存配置以便后续使用
      
      // 不抛出错误，而是记录错误并继续
      logger.warn('🛠️ 认证服务将以降级模式运行');
    }
  }

  /**
   * 检查是否已初始化
   */
  private ensureInitialized(): void {
    if (!this.initialized || !this.client || !this.config) {
      throw new Error('认证服务未初始化');
    }
  }

  // ===== 登录相关 =====

  /**
   * 用户登录
   */
  async login(params: LoginParams): Promise<AuthUser> {
    this.ensureInitialized();
    
    try {
      logger.debug('🔐 开始登录流程', { 
        hasEmail: !!params.email,
        hasPhone: !!params.phone,
        hasUsername: !!params.username 
      });

      let result: any;

      // 根据参数类型选择登录方式
      if (params.email && params.password) {
        result = await this.client!.loginByEmail(params.email, params.password);
      } else if (params.phone && params.password) {
        result = await this.client!.loginByPhonePassword(params.phone, params.password);
      } else if (params.username && params.password) {
        result = await this.client!.loginByUsername(params.username, params.password);
      } else if (params.email && params.code) {
        result = await this.client!.loginByEmail(params.email, params.code);
      } else if (params.phone && params.code) {
        result = await this.client!.loginByPhoneCode(params.phone, params.code);
      } else {
        throw new Error('无效的登录参数');
      }

      // 标准化用户信息
      const user = this.normalizeAuthUser(result);
      
      // 存储用户信息和token
      this.storeAuthData(user, result.token);
      
      logger.info('✅ 用户登录成功', { userId: user.id });
      return user;
    } catch (error) {
      logger.error('❌ 用户登录失败:', error);
      throw error;
    }
  }

  /**
   * 使用授权码登录（OAuth2流程）
   */
  async loginWithCode(code: string, state?: string): Promise<AuthUser> {
    this.ensureInitialized();
    
    try {
      logger.debug('🔐 使用授权码登录', { hasCode: !!code, hasState: !!state });

      // 使用授权码获取token
      const tokenResult = await this.client!.getAccessTokenByCode(code);
      
      // 使用token获取用户信息
      const userResult = await this.client!.getUserInfoByAccessToken(tokenResult.access_token);
      
      // 标准化用户信息
      const user = this.normalizeAuthUser(userResult);
      user.token = tokenResult.access_token;
      
      // 存储认证数据
      this.storeAuthData(user, tokenResult.access_token, tokenResult.refresh_token);
      
      logger.info('✅ 授权码登录成功', { userId: user.id });
      return user;
    } catch (error) {
      logger.error('❌ 授权码登录失败:', error);
      throw error;
    }
  }

  // ===== 注册相关 =====

  /**
   * 用户注册
   */
  async register(params: RegisterParams): Promise<AuthUser> {
    this.ensureInitialized();
    
    try {
      logger.debug('📝 开始注册流程', { 
        hasEmail: !!params.email,
        hasPhone: !!params.phone,
        hasUsername: !!params.username 
      });

      let result: any;

      // 根据参数类型选择注册方式
      if (params.email && params.password) {
        result = await this.client!.registerByEmail(params.email, params.password);
      } else if (params.phone && params.code) {
        result = await this.client!.registerByPhoneCode(params.phone, params.code);
      } else if (params.username && params.password) {
        result = await this.client!.registerByUsername(params.username, params.password);
      } else {
        throw new Error('无效的注册参数');
      }

      // 标准化用户信息
      const user = this.normalizeAuthUser(result);
      
      // 存储用户信息和token
      this.storeAuthData(user, result.token);
      
      logger.info('✅ 用户注册成功', { userId: user.id });
      return user;
    } catch (error) {
      logger.error('❌ 用户注册失败:', error);
      throw error;
    }
  }

  // ===== 登出相关 =====

  /**
   * 用户登出
   */
  async logout(): Promise<void> {
    try {
      logger.debug('👋 开始登出流程');

      // 如果有客户端，尝试调用服务端登出
      if (this.client) {
        try {
          await this.client.logout();
        } catch (error) {
          logger.warn('⚠️ 服务端登出失败，继续本地清理:', error);
        }
      }

      // 清除本地存储的认证数据
      tokenManager.clearAll();
      
      logger.info('✅ 用户登出成功');
    } catch (error) {
      logger.error('❌ 用户登出失败:', error);
      // 即使登出失败，也要清除本地数据
      tokenManager.clearAll();
      throw error;
    }
  }

  // ===== Token管理 =====

  /**
   * 刷新访问令牌
   */
  async refreshToken(): Promise<TokenInfo> {
    this.ensureInitialized();

    try {
      const currentToken = tokenManager.getAccessToken();
      if (!currentToken) {
        throw new Error('没有当前令牌');
      }

      logger.debug('🔄 开始刷新Token');

      // Authing SDK的refreshToken方法不需要参数，返回结构为{token, iat, exp}
      const result = await this.client!.refreshToken();

      const tokenInfo: TokenInfo = {
        accessToken: result.token || '', // 确保不为undefined
        refreshToken: tokenManager.getRefreshToken() || '', // 保持原有的refresh token
        expiresAt: result.exp ? new Date(result.exp * 1000).toISOString() : new Date(Date.now() + 3600 * 1000).toISOString(),
        tokenType: 'Bearer',
        scope: ''
      };

      // 更新存储的token信息
      tokenManager.setTokenInfo(tokenInfo);

      logger.info('✅ Token刷新成功');
      return tokenInfo;
    } catch (error) {
      logger.error('❌ Token刷新失败:', error);
      // 刷新失败，清除所有token
      tokenManager.clearAllTokens();
      throw error;
    }
  }

  /**
   * 检查Token有效性
   */
  async checkTokenValidity(token: string): Promise<boolean> {
    this.ensureInitialized();
    
    try {
      const result = await this.client!.checkLoginStatus(token);
      return result.status === true;
    } catch (error) {
      logger.debug('Token验证失败:', error);
      return false;
    }
  }

  // ===== 用户信息管理 =====

  /**
   * 获取当前用户信息
   */
  async getCurrentUser(): Promise<AuthUser | null> {
    this.ensureInitialized();
    
    try {
      const token = tokenManager.getAccessToken();
      if (!token) {
        return null;
      }

      // 检查token有效性
      const isValid = await this.checkTokenValidity(token);
      if (!isValid) {
        tokenManager.clearAllTokens();
        return null;
      }

      // 获取用户信息
      const result = await this.client!.getCurrentUser();
      if (!result) {
        return null;
      }

      const user = this.normalizeAuthUser(result);
      user.token = token;

      // 更新存储的用户信息
      tokenManager.setUser(user);
      
      return user;
    } catch (error) {
      logger.error('❌ 获取当前用户失败:', error);
      return null;
    }
  }

  /**
   * 更新用户信息
   */
  async updateUser(updates: Partial<AuthUser>): Promise<AuthUser> {
    this.ensureInitialized();
    
    try {
      logger.debug('📝 开始更新用户信息', Object.keys(updates));

      const result = await this.client!.updateProfile(updates);
      const user = this.normalizeAuthUser(result);
      
      // 更新存储的用户信息
      tokenManager.setUser(user);
      
      logger.info('✅ 用户信息更新成功', { userId: user.id });
      return user;
    } catch (error) {
      logger.error('❌ 用户信息更新失败:', error);
      throw error;
    }
  }

  // ===== 辅助方法 =====

  /**
   * 标准化用户信息
   */
  public normalizeAuthUser(rawUser: any): AuthUser {
    const normalized = normalizeUserInfo(rawUser);

    return {
      ...normalized,
      // 修复null vs undefined类型冲突
      username: normalized.username || undefined,
      email: normalized.email || undefined,
      phone: normalized.phone || undefined,
      nickname: normalized.nickname || undefined,
      avatar: normalized.avatar || undefined,
      // 认证相关字段
      token: rawUser.token,
      refreshToken: rawUser.refresh_token,
      tokenExpiresAt: rawUser.token_expires_at,
      isEmailVerified: rawUser.emailVerified || false,
      isPhoneVerified: rawUser.phoneVerified || false,
      subscription: {
        tier: 'trial', // 默认体验版
        plan: 'free', // 向后兼容
        isActive: true,
        features: []
      },
      preferences: {
        theme: 'auto',
        language: 'zh-CN',
        notifications: true
      },
      stats: {
        totalUsage: 0,
        monthlyUsage: 0,
        remainingQuota: 10 // 默认配额
      }
    };
  }

  /**
   * 存储认证数据
   */
  private storeAuthData(user: AuthUser, accessToken: string, refreshToken?: string): void {
    // 存储用户信息
    tokenManager.setUser(user);
    
    // 存储token信息
    const tokenInfo: TokenInfo = {
      accessToken,
      refreshToken,
      expiresAt: user.tokenExpiresAt || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      tokenType: 'Bearer'
    };
    
    tokenManager.setTokenInfo(tokenInfo);
  }

  /**
   * 获取客户端实例（用于特殊情况）
   */
  getClient(): AuthenticationClient | null {
    return this.client;
  }

  /**
   * 获取配置信息
   */
  getConfig(): AuthConfig | null {
    return this.config;
  }
}

// 导出单例实例
export const authService = AuthService.getInstance();
export default authService;
