/**
 * 统一认证服务
 * 提供完整的认证功能，包括登录、注册、token管理、用户信息管理等
 */

import { request } from '@/api/request';
import { getAuthingConfig } from '@/config/authing';
import { UserInfo } from '@/types/auth';

/**
 * 认证服务类
 */
class AuthService {
  private static instance: AuthService;
  private config = getAuthingConfig();

  private constructor() {}

  /**
   * 获取单例实例
   */
  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  /**
   * 交换授权码获取 token
   */
  async exchangeCodeForToken(code: string, redirectUri?: string): Promise<any> {
    try {
      const tokenData = await request.post(`https://${this.config.host}/oidc/token`, 
        new URLSearchParams({
          grant_type: 'authorization_code',
          client_id: this.config.appId,
          code: code,
          redirect_uri: redirectUri || this.config.redirectUri,
        }), {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );

      return tokenData;
    } catch (error) {
      console.error('Token 交换失败:', error);
      throw new Error('Token 交换失败');
    }
  }

  /**
   * 使用 token 获取用户信息
   */
  async getUserInfo(accessToken: string): Promise<any> {
    try {
      const userData = await request.get(`https://${this.config.host}/oidc/me`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      return userData;
    } catch (error) {
      console.error('获取用户信息失败:', error);
      throw new Error('获取用户信息失败');
    }
    }

  /**
   * 刷新 token
   */
  async refreshToken(refreshToken: string): Promise<any> {
    try {
      const tokenData = await request.post(`https://${this.config.host}/oidc/token`, 
        new URLSearchParams({
          grant_type: 'refresh_token',
          client_id: this.config.appId,
          refresh_token: refreshToken,
        }), {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );

      return tokenData;
    } catch (error) {
      console.error('刷新 token 失败:', error);
      throw new Error('刷新 token 失败');
    }
  }

  /**
   * 登出
   */
  async logout(accessToken?: string): Promise<void> {
    try {
      if (accessToken) {
        await request.post(`https://${this.config.host}/oidc/logout`, {
          token: accessToken,
        });
      }
    } catch (error) {
      console.error('登出失败:', error);
      // 登出失败不影响本地清理
    }
  }

  /**
   * 构建统一的用户信息格式
   */
  buildUserInfo(userData: any, tokenData?: any): UserInfo {
    return {
      id: userData.sub || userData.id || `user_${Date.now()}`,
      username: userData.preferred_username || userData.username || userData.name || '用户',
      nickname: userData.nickname || userData.name || userData.preferred_username || '用户',
      email: userData.email || '',
      phone: userData.phone_number || userData.phone || '',
      avatar: userData.picture || userData.avatar || '',
      loginTime: new Date().toISOString(),
      roles: userData.roles || ['user'],
      permissions: userData.permissions || ['basic'],
      accessToken: tokenData?.access_token,
      refreshToken: tokenData?.refresh_token,
      // 保留原始数据
      ...userData
    };
  }

  /**
   * 验证 token 有效性
   */
  async validateToken(accessToken: string): Promise<boolean> {
    try {
      await this.getUserInfo(accessToken);
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * 获取用户权限
   */
  async getUserPermissions(accessToken: string): Promise<string[]> {
    try {
      const userData = await this.getUserInfo(accessToken);
      return userData.permissions || [];
    } catch (error) {
      console.error('获取用户权限失败:', error);
      return [];
    }
  }

  /**
   * 获取用户角色
   */
  async getUserRoles(accessToken: string): Promise<string[]> {
    try {
      const userData = await this.getUserInfo(accessToken);
      return userData.roles || [];
    } catch (error) {
      console.error('获取用户角色失败:', error);
      return [];
    }
  }

  /**
   * 更新用户信息
   */
  async updateUserInfo(accessToken: string, updates: Partial<UserInfo>): Promise<UserInfo> {
    try {
      const response = await request.put(`https://${this.config.host}/api/v3/update-user`, updates, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      return this.buildUserInfo(response);
    } catch (error) {
      console.error('更新用户信息失败:', error);
      throw new Error('更新用户信息失败');
    }
  }

  /**
   * 检查用户是否具有特定权限
   */
  async hasPermission(accessToken: string, permission: string): Promise<boolean> {
    try {
      const permissions = await this.getUserPermissions(accessToken);
      return permissions.includes(permission) || permissions.includes('*');
    } catch (error) {
      return false;
    }
  }

  /**
   * 检查用户是否具有特定角色
   */
  async hasRole(accessToken: string, role: string): Promise<boolean> {
    try {
      const roles = await this.getUserRoles(accessToken);
      return roles.includes(role);
    } catch (error) {
      return false;
    }
  }

  /**
   * 获取登录 URL
   * @deprecated 前端禁止直接调用，必须用 SDK
   * 🔒 LOCKED: 禁止前端直接拼接 OIDC URL，必须用 SDK
   */
  getLoginUrl(redirectTo?: string): string {
    const params = new URLSearchParams({
      client_id: this.config.appId,
      response_type: this.config.responseType,
      scope: this.config.scope,
      redirect_uri: this.config.redirectUri,
    });

    if (redirectTo) {
      params.append('state', redirectTo);
    }

    return `https://${this.config.host}/oidc/auth?${params.toString()}`;
  }

  /**
   * 获取注册 URL
   * @deprecated 前端禁止直接调用，必须用 SDK
   * 🔒 LOCKED: 禁止前端直接拼接 OIDC URL，必须用 SDK
   */
  getRegisterUrl(redirectTo?: string): string {
    const params = new URLSearchParams({
      client_id: this.config.appId,
      response_type: this.config.responseType,
      scope: this.config.scope,
      redirect_uri: this.config.redirectUri,
      screen_hint: 'signup',
    });

    if (redirectTo) {
      params.append('state', redirectTo);
    }

    return `https://${this.config.host}/oidc/auth?${params.toString()}`;
  }
}

export default AuthService; 