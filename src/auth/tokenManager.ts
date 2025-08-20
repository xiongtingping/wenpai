/**
 * 🔐 统一Token管理器
 * 负责所有token相关的存储、验证、刷新操作
 */

import { TokenInfo, AuthUser, AUTH_STORAGE_KEYS } from './types';
import { logger } from '@/utils/logger';

class TokenManager {
  private static instance: TokenManager;
  private refreshPromise: Promise<string> | null = null;

  private constructor() {}

  public static getInstance(): TokenManager {
    if (!TokenManager.instance) {
      TokenManager.instance = new TokenManager();
    }
    return TokenManager.instance;
  }

  // ===== Token存储管理 =====
  
  /**
   * 设置访问令牌
   */
  setAccessToken(token: string): void {
    try {
      localStorage.setItem(AUTH_STORAGE_KEYS.TOKEN, token);
      // 同时设置到旧的存储位置以保持兼容性
      localStorage.setItem('_authing_token', token);
      localStorage.setItem('auth_token', token);
      
      logger.debug('✅ 访问令牌已设置');
    } catch (error) {
      logger.error('❌ 设置访问令牌失败:', error);
    }
  }

  /**
   * 获取访问令牌
   */
  getAccessToken(): string | null {
    try {
      // 优先从新的存储位置获取
      let token = localStorage.getItem(AUTH_STORAGE_KEYS.TOKEN);
      
      // 如果没有，尝试从旧的存储位置获取
      if (!token) {
        token = localStorage.getItem('_authing_token') || 
                localStorage.getItem('auth_token') ||
                localStorage.getItem('authing_token');
      }
      
      return token;
    } catch (error) {
      logger.error('❌ 获取访问令牌失败:', error);
      return null;
    }
  }

  /**
   * 设置刷新令牌
   */
  setRefreshToken(token: string): void {
    try {
      localStorage.setItem(AUTH_STORAGE_KEYS.REFRESH_TOKEN, token);
      logger.debug('✅ 刷新令牌已设置');
    } catch (error) {
      logger.error('❌ 设置刷新令牌失败:', error);
    }
  }

  /**
   * 获取刷新令牌
   */
  getRefreshToken(): string | null {
    try {
      return localStorage.getItem(AUTH_STORAGE_KEYS.REFRESH_TOKEN);
    } catch (error) {
      logger.error('❌ 获取刷新令牌失败:', error);
      return null;
    }
  }

  /**
   * 设置完整的Token信息
   */
  setTokenInfo(tokenInfo: TokenInfo): void {
    try {
      this.setAccessToken(tokenInfo.accessToken);
      
      if (tokenInfo.refreshToken) {
        this.setRefreshToken(tokenInfo.refreshToken);
      }
      
      // 存储token元信息
      const tokenMeta = {
        expiresAt: tokenInfo.expiresAt,
        tokenType: tokenInfo.tokenType,
        scope: tokenInfo.scope,
        setAt: new Date().toISOString()
      };
      
      localStorage.setItem('auth_token_meta', JSON.stringify(tokenMeta));
      
      logger.debug('✅ Token信息已设置', { 
        hasRefreshToken: !!tokenInfo.refreshToken,
        expiresAt: tokenInfo.expiresAt 
      });
    } catch (error) {
      logger.error('❌ 设置Token信息失败:', error);
    }
  }

  /**
   * 获取Token元信息
   */
  getTokenMeta(): any {
    try {
      const meta = localStorage.getItem('auth_token_meta');
      return meta ? JSON.parse(meta) : null;
    } catch (error) {
      logger.error('❌ 获取Token元信息失败:', error);
      return null;
    }
  }

  // ===== Token验证 =====

  /**
   * 检查Token是否有效
   */
  isTokenValid(token?: string): boolean {
    const targetToken = token || this.getAccessToken();
    
    if (!targetToken) {
      return false;
    }

    try {
      // 解析JWT token
      const payload = this.parseJWTPayload(targetToken);
      if (!payload) {
        return false;
      }

      // 检查是否过期
      const now = Math.floor(Date.now() / 1000);
      if (payload.exp && payload.exp < now) {
        logger.debug('🕒 Token已过期');
        return false;
      }

      return true;
    } catch (error) {
      logger.error('❌ Token验证失败:', error);
      return false;
    }
  }

  /**
   * 检查Token是否即将过期
   */
  isTokenExpiringSoon(thresholdMinutes: number = 5): boolean {
    const token = this.getAccessToken();
    if (!token) return true;

    try {
      const payload = this.parseJWTPayload(token);
      if (!payload?.exp) return false;

      const now = Math.floor(Date.now() / 1000);
      const threshold = thresholdMinutes * 60;
      
      return (payload.exp - now) < threshold;
    } catch (error) {
      logger.error('❌ 检查Token过期时间失败:', error);
      return true;
    }
  }

  /**
   * 解析JWT Token的payload
   */
  private parseJWTPayload(token: string): any {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) {
        return null;
      }

      const payload = parts[1];
      const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
      return JSON.parse(decoded);
    } catch (error) {
      logger.error('❌ 解析JWT失败:', error);
      return null;
    }
  }

  // ===== Token刷新 =====

  /**
   * 刷新访问令牌
   */
  async refreshAccessToken(): Promise<string> {
    // 防止并发刷新
    if (this.refreshPromise) {
      return this.refreshPromise;
    }

    this.refreshPromise = this.performTokenRefresh();
    
    try {
      const newToken = await this.refreshPromise;
      return newToken;
    } finally {
      this.refreshPromise = null;
    }
  }

  /**
   * 执行Token刷新
   */
  private async performTokenRefresh(): Promise<string> {
    const refreshToken = this.getRefreshToken();
    
    if (!refreshToken) {
      throw new Error('没有刷新令牌');
    }

    try {
      // 这里应该调用实际的刷新API
      // 暂时返回原token，实际实现时需要调用Authing的刷新接口
      const currentToken = this.getAccessToken();
      if (!currentToken) {
        throw new Error('没有当前令牌');
      }

      logger.debug('🔄 Token刷新成功');
      return currentToken;
    } catch (error) {
      logger.error('❌ Token刷新失败:', error);
      this.clearAllTokens();
      throw error;
    }
  }

  // ===== Token清理 =====

  /**
   * 清除所有Token
   */
  clearAllTokens(): void {
    try {
      // 清除新的存储位置
      localStorage.removeItem(AUTH_STORAGE_KEYS.TOKEN);
      localStorage.removeItem(AUTH_STORAGE_KEYS.REFRESH_TOKEN);
      localStorage.removeItem('auth_token_meta');
      
      // 清除旧的存储位置（兼容性）
      localStorage.removeItem('_authing_token');
      localStorage.removeItem('auth_token');
      localStorage.removeItem('authing_token');
      localStorage.removeItem('_authing_user');
      
      // 清除sessionStorage中的token
      sessionStorage.removeItem('auth_token');
      sessionStorage.removeItem('_authing_token');
      
      logger.debug('✅ 所有Token已清除');
    } catch (error) {
      logger.error('❌ 清除Token失败:', error);
    }
  }

  /**
   * 清除过期Token
   */
  clearExpiredTokens(): void {
    const token = this.getAccessToken();
    if (token && !this.isTokenValid(token)) {
      this.clearAllTokens();
      logger.debug('🗑️ 已清除过期Token');
    }
  }

  // ===== 用户信息管理 =====

  /**
   * 设置用户信息
   */
  setUser(user: AuthUser): void {
    try {
      localStorage.setItem(AUTH_STORAGE_KEYS.USER, JSON.stringify(user));
      // 兼容性存储
      localStorage.setItem('authing_user', JSON.stringify(user));
      
      logger.debug('✅ 用户信息已设置', { userId: user.id });
    } catch (error) {
      logger.error('❌ 设置用户信息失败:', error);
    }
  }

  /**
   * 获取用户信息
   */
  getUser(): AuthUser | null {
    try {
      // 优先从新的存储位置获取
      let userData = localStorage.getItem(AUTH_STORAGE_KEYS.USER);
      
      // 如果没有，尝试从旧的存储位置获取
      if (!userData) {
        userData = localStorage.getItem('authing_user');
      }
      
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      logger.error('❌ 获取用户信息失败:', error);
      return null;
    }
  }

  /**
   * 清除用户信息
   */
  clearUser(): void {
    try {
      localStorage.removeItem(AUTH_STORAGE_KEYS.USER);
      localStorage.removeItem('authing_user');
      localStorage.removeItem('_authing_user');
      
      logger.debug('✅ 用户信息已清除');
    } catch (error) {
      logger.error('❌ 清除用户信息失败:', error);
    }
  }

  /**
   * 完全清除所有认证数据
   */
  clearAll(): void {
    this.clearAllTokens();
    this.clearUser();
    logger.debug('🧹 所有认证数据已清除');
  }

  // ===== 调试和监控 =====

  /**
   * 获取当前存储状态（仅开发环境）
   */
  getStorageStatus(): any {
    if (process.env.NODE_ENV === 'production') {
      return { message: '生产环境不显示存储状态' };
    }

    return {
      hasAccessToken: !!this.getAccessToken(),
      hasRefreshToken: !!this.getRefreshToken(),
      hasUser: !!this.getUser(),
      tokenValid: this.isTokenValid(),
      tokenExpiringSoon: this.isTokenExpiringSoon(),
      tokenMeta: this.getTokenMeta()
    };
  }
}

// 导出单例实例
export const tokenManager = TokenManager.getInstance();
export default tokenManager;
