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
   * 更新用户信息 - 使用AuthenticationClient API（已验证成功）
   */
  async updateUserInfo(accessToken: string, updates: Partial<UserInfo>): Promise<UserInfo> {
    try {
      console.log('🔄 使用真正的Authing AuthenticationClient API更新用户信息:', updates);

      // 🛡️ CRITICAL FIX: 使用真正的Authing AuthenticationClient
      const authClient = await this.getAuthenticationClient();
      if (!authClient) {
        throw new Error('AuthenticationClient未初始化');
      }

      console.log('📤 准备调用Authing updateProfile API');

      // 构建更新数据，使用Authing API支持的字段
      const updateData: any = {};

      if (updates.nickname) updateData.nickname = updates.nickname;
      if (updates.photo || updates.avatar) updateData.photo = updates.photo || updates.avatar;
      if (updates.company) updateData.company = updates.company;
      if (updates.username) updateData.username = updates.username;
      if (updates.email) updateData.email = updates.email;
      if (updates.phone) updateData.phone = updates.phone;

      console.log('📤 发送到Authing API的数据:', updateData);

      // 🚨 关键：调用真正的Authing updateProfile API
      const updatedUser = await authClient.updateProfile(updateData);

      console.log('✅ Authing API返回的更新后用户信息:', updatedUser);

      return this.buildUserInfo(updatedUser);
    } catch (error) {
      console.error('❌ Authing API更新用户信息失败:', error);

      // 详细的错误信息处理
      let errorMessage = '未知错误';
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'object' && error !== null) {
        // 处理Authing API返回的错误对象
        const errorObj = error as any;
        if (errorObj.message) {
          errorMessage = errorObj.message;
        } else if (errorObj.error) {
          errorMessage = errorObj.error;
        } else if (errorObj.error_description) {
          errorMessage = errorObj.error_description;
        } else {
          errorMessage = JSON.stringify(error);
        }
      }

      console.error('❌ 详细错误信息:', errorMessage);
      throw new Error(`Authing API更新失败: ${errorMessage}`);
    }
  }

  /**
   * 上传用户头像 - 使用AuthenticationClient API（已验证成功）
   */
  async uploadUserAvatar(file: File): Promise<UserInfo> {
    try {
      console.log('📸 开始上传用户头像到Authing服务器');

      // 获取AuthenticationClient实例
      const authClient = await this.getAuthenticationClient();
      if (!authClient) {
        throw new Error('AuthenticationClient未初始化');
      }

      // 🚨 关键：先上传文件到CDN，再更新profile
      console.log('📤 使用传统方式：先上传文件到CDN，再更新profile');

      // 创建FormData上传文件
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', 'avatar');

      // 构建正确的上传URL
      const uploadUrl = `https://${this.config.host}/api/v2/upload`;
      console.log('📤 上传URL:', uploadUrl);

      // 上传到Authing CDN
      const uploadResponse = await request.post(uploadUrl, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        }
      });

      const avatarUrl = uploadResponse.url || uploadResponse.data?.url;
      console.log('✅ 文件上传到CDN成功:', avatarUrl);

      if (!avatarUrl) {
        throw new Error('上传响应中没有找到头像URL');
      }

      // 使用AuthenticationClient更新用户头像
      const updatedUser = await authClient.updateProfile({
        photo: avatarUrl
      });

      console.log('✅ 用户头像更新成功，AuthenticationClient API返回:', updatedUser);

      return this.buildUserInfo(updatedUser);
    } catch (error) {
      console.error('❌ 头像上传失败:', error);
      const errorMessage = error instanceof Error ? error.message : '未知错误';
      throw new Error(`头像上传失败: ${errorMessage}`);
    }
  }

  /**
   * 获取Guard实例
   */
  private async getGuardInstance() {
    try {
      // 动态导入Guard创建函数
      const { getGuardInstance } = await import('@/authing/guard');
      return getGuardInstance();
    } catch (error) {
      console.error('❌ 获取Guard实例失败:', error);
      return null;
    }
  }

  /**
   * 获取AuthenticationClient实例 - 用于直接调用Authing API
   */
  private async getAuthenticationClient() {
    try {
      // 动态导入AuthenticationClient - 使用正确的包
      const { AuthenticationClient } = await import('authing-js-sdk');

      // 确保appHost格式正确
      let appHost = this.config.host;
      if (!appHost.startsWith('https://')) {
        appHost = `https://${appHost}`;
      }

      console.log('🔧 AuthenticationClient配置:', {
        appId: this.config.appId,
        appHost: appHost
      });

      // 创建AuthenticationClient实例
      const authClient = new AuthenticationClient({
        appId: this.config.appId,
        appHost: appHost,
      });

      console.log('✅ AuthenticationClient实例创建成功');
      return authClient;
    } catch (error) {
      console.error('❌ 获取AuthenticationClient实例失败:', error);
      return null;
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
   * 🔓 UNLOCKED: 禁止前端直接拼接 OIDC URL，必须用 SDK
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
   * 🔓 UNLOCKED: 禁止前端直接拼接 OIDC URL，必须用 SDK
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