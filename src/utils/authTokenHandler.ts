/**
 * 🔐 Authing Token刷新处理器
 * 
 * 专门处理Authing认证系统的Token刷新逻辑
 * - 集成Authing SDK的Token刷新API
 * - 处理刷新失败和重新登录场景
 * - 维护用户会话状态
 */

import { TokenInfo, TokenRefreshResult, RefreshHandler } from './tokenManager';
import { AuthenticationClient } from 'authing-js-sdk';
import { getAuthingConfig } from '@/config/authing';

export interface AuthingTokenInfo extends TokenInfo {
  source: 'authing';
  userId: string;
  userInfo?: {
    id: string;
    username?: string;
    email?: string;
    phone?: string;
    nickname?: string;
    avatar?: string;
  };
}

export class AuthingTokenHandler {
  private authClient: AuthenticationClient | null = null;
  private isInitialized = false;

  constructor() {
    this.initializeAuthClient();
  }

  /**
   * 初始化Authing客户端
   */
  private async initializeAuthClient(): Promise<void> {
    try {
      const config = getAuthingConfig();
      
      this.authClient = new AuthenticationClient({
        appId: config.appId,
        appHost: config.host,
        timeout: 30000,
      });

      this.isInitialized = true;
      console.log('🔐 Authing token handler initialized');
    } catch (error) {
      console.error('Failed to initialize Authing client:', error);
    }
  }

  /**
   * 创建Authing Token刷新处理器
   */
  public createRefreshHandler(): RefreshHandler {
    return async (oldToken: TokenInfo): Promise<TokenRefreshResult> => {
      if (!this.isInitialized || !this.authClient) {
        await this.initializeAuthClient();
        if (!this.authClient) {
          return {
            success: false,
            error: 'Authing client not initialized',
            shouldLogout: false,
          };
        }
      }

      try {
        console.log('🔄 Refreshing Authing token...');

        // 使用刷新Token获取新的访问Token
        const response = await this.authClient.refreshToken();

        if (response && (response as any).access_token) {
          const responseData = response as any;
          const newTokenInfo: TokenInfo = {
            accessToken: responseData.access_token,
            refreshToken: responseData.refresh_token || oldToken.refreshToken,
            idToken: responseData.id_token,
            tokenType: 'Bearer',
            expiresAt: Date.now() + (responseData.expires_in || 7200) * 1000, // 默认2小时
            issuedAt: Date.now(),
            scope: responseData.scope ? responseData.scope.split(' ') : oldToken.scope,
            userId: oldToken.userId,
            source: 'authing',
            metadata: {
              ...oldToken.metadata,
              refreshedAt: Date.now(),
              refreshCount: (oldToken.metadata?.refreshCount || 0) + 1,
            },
          };

          console.log('✅ Authing token refreshed successfully');
          return {
            success: true,
            newToken: newTokenInfo,
          };
        } else {
          console.warn('⚠️ Authing token refresh returned no token');
          return {
            success: false,
            error: 'No token in refresh response',
            shouldLogout: false,
          };
        }

      } catch (error: any) {
        console.error('❌ Authing token refresh failed:', error);

        // 分析错误类型
        const errorMessage = error?.message || 'Unknown error';
        const errorCode = error?.code;

        // 判断是否需要重新登录
        const shouldLogout = this.shouldLogoutOnError(errorCode, errorMessage);

        return {
          success: false,
          error: `Authing refresh failed: ${errorMessage}`,
          shouldLogout,
        };
      }
    };
  }

  /**
   * 判断错误是否需要重新登录
   */
  private shouldLogoutOnError(code?: string | number, message?: string): boolean {
    const logoutErrorCodes = [
      'invalid_grant', // 刷新Token无效
      'invalid_token', // Token无效
      'token_expired', // Token已过期
      2020, // Authing: 刷新Token过期
      2206, // Authing: 用户不存在
    ];

    const logoutMessages = [
      'refresh token expired',
      'invalid refresh token',
      'user not found',
      'refresh_token已过期',
      'invalid_refresh_token',
    ];

    // 检查错误代码
    if (code && logoutErrorCodes.includes(code)) {
      return true;
    }

    // 检查错误消息
    if (message) {
      const lowerMessage = message.toLowerCase();
      return logoutMessages.some(msg => lowerMessage.includes(msg));
    }

    return false;
  }

  /**
   * 从Authing登录响应创建TokenInfo
   */
  public createTokenFromLoginResponse(loginResponse: any): AuthingTokenInfo {
    const expiresIn = loginResponse.expires_in || 7200; // 默认2小时
    
    return {
      accessToken: loginResponse.access_token,
      refreshToken: loginResponse.refresh_token,
      idToken: loginResponse.id_token,
      tokenType: 'Bearer',
      expiresAt: Date.now() + expiresIn * 1000,
      issuedAt: Date.now(),
      scope: loginResponse.scope ? loginResponse.scope.split(' ') : ['openid', 'profile'],
      userId: loginResponse.sub || loginResponse.user?.id,
      source: 'authing',
      userInfo: {
        id: loginResponse.sub || loginResponse.user?.id,
        username: loginResponse.user?.username,
        email: loginResponse.user?.email,
        phone: loginResponse.user?.phone,
        nickname: loginResponse.user?.nickname || loginResponse.user?.name,
        avatar: loginResponse.user?.avatar || loginResponse.user?.picture,
      },
      metadata: {
        loginTime: Date.now(),
        loginMethod: 'password', // 可以根据实际登录方式设置
        refreshCount: 0,
        tokenVersion: '1.0',
      },
    };
  }

  /**
   * 验证Token有效性
   */
  public async validateToken(token: TokenInfo): Promise<boolean> {
    if (!this.authClient) {
      await this.initializeAuthClient();
      if (!this.authClient) return false;
    }

    try {
      // 调用Authing API验证Token
      const userInfo = await this.authClient.getCurrentUser();
      return !!userInfo;
    } catch (error) {
      console.warn('Token validation failed:', error);
      return false;
    }
  }

  /**
   * 获取用户信息
   */
  public async getUserInfo(token: TokenInfo): Promise<any> {
    if (!this.authClient) {
      await this.initializeAuthClient();
      if (!this.authClient) return null;
    }

    try {
      return await this.authClient.getCurrentUser();
    } catch (error) {
      console.error('Failed to get user info:', error);
      return null;
    }
  }

  /**
   * 登出处理
   */
  public async logout(token: TokenInfo): Promise<void> {
    if (!this.authClient) return;

    try {
      // 调用Authing登出API
      await this.authClient.logout();
      console.log('📤 Logged out from Authing');
    } catch (error) {
      console.warn('Authing logout failed:', error);
    }
  }

  /**
   * 销毁处理器
   */
  public destroy(): void {
    this.authClient = null;
    this.isInitialized = false;
  }
}

// 全局实例
let globalAuthingHandler: AuthingTokenHandler | null = null;

/**
 * 获取Authing Token处理器
 */
export function getAuthingTokenHandler(): AuthingTokenHandler {
  if (!globalAuthingHandler) {
    globalAuthingHandler = new AuthingTokenHandler();
  }
  return globalAuthingHandler;
}

/**
 * Authing Token便捷函数
 */
export const AuthingTokenService = {
  createRefreshHandler: () => getAuthingTokenHandler().createRefreshHandler(),
  createTokenFromLogin: (response: any) => getAuthingTokenHandler().createTokenFromLoginResponse(response),
  validateToken: (token: TokenInfo) => getAuthingTokenHandler().validateToken(token),
  getUserInfo: (token: TokenInfo) => getAuthingTokenHandler().getUserInfo(token),
  logout: (token: TokenInfo) => getAuthingTokenHandler().logout(token),
};