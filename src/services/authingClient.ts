/**
 * Authing 客户端服务
 * 按照官方文档使用 @authing/web SDK v5
 * 参考: https://docs.authing.cn/v2/quickstarts/spa/react.html
 */

import Authing from '@authing/web';
import { getAuthingConfig } from '@/config/authing';

/**
 * Authing 客户端类
 * 使用官方推荐的 @authing/web SDK v5
 */
class AuthingClient {
  private static instance: AuthingClient;
  private static sdkInstance: Authing | null = null;
  private authing: Authing;
  private config = getAuthingConfig();
  private isInitializing = false;
  private isCheckingStatus = false;

  private constructor() {
    if (!AuthingClient.sdkInstance) {
      // 关键：类型断言，兼容 SDK 支持但类型未补全
      AuthingClient.sdkInstance = new Authing({
        domain: this.config.host,
        appId: this.config.appId,
        userPoolId: this.config.userPoolId,
        redirectUri: this.config.redirectUri,
        scope: this.config.scope,
        oidcOrigin: this.config.oidcOrigin
      } as any);
    }
    this.authing = AuthingClient.sdkInstance;
  }

  /**
   * 获取单例实例
   */
  static getInstance(): AuthingClient {
    if (!AuthingClient.instance) {
      AuthingClient.instance = new AuthingClient();
    }
    return AuthingClient.instance;
  }

  /**
   * 获取 Authing 实例
   */
  getAuthing(): Authing {
    return this.authing;
  }

  /**
   * 获取登录 URL - 使用重定向方式
   * @deprecated 禁止外部直接调用，必须用 SDK
   * 🔒 LOCKED: 禁止手动拼接 OIDC URL，必须用 SDK
   */
  getLoginUrl(redirectTo?: string): string {
    if (redirectTo) {
      sessionStorage.setItem('authing_redirect_to', redirectTo);
    }
    this.authing.loginWithRedirect();
    return window.location.href;
  }

  /**
   * 获取注册 URL - 使用重定向方式
   * @deprecated 禁止外部直接调用，必须用 SDK
   * 🔒 LOCKED: 禁止手动拼接 OIDC URL，必须用 SDK
   */
  getRegisterUrl(redirectTo?: string): string {
    if (redirectTo) {
      sessionStorage.setItem('authing_redirect_to', redirectTo);
    }
    this.authing.loginWithRedirect();
    return window.location.href;
  }

  /**
   * 处理授权码回调
   */
  async handleCallback(): Promise<any> {
    try {
      // 检查是否是重定向回调
      if (this.authing.isRedirectCallback()) {
        // 处理重定向回调
        const loginState = await this.authing.handleRedirectCallback();
        
        // 获取重定向地址
        const redirectTo = sessionStorage.getItem('authing_redirect_to');
        if (redirectTo) {
          sessionStorage.removeItem('authing_redirect_to');
        }
        
        return {
          user: loginState,
          token: loginState,
          state: redirectTo
        };
      }
      
      return null;
    } catch (error) {
      console.error('处理授权码回调失败:', error);
      throw error;
    }
  }

  /**
   * 刷新 token
   */
  async refreshToken(): Promise<any> {
    try {
      const tokenSet = await this.authing.refreshToken();
      return tokenSet;
    } catch (error) {
      console.error('刷新 token 失败:', error);
      throw error;
    }
  }

  /**
   * 登出
   */
  async logout(redirectUri?: string): Promise<void> {
    try {
      await this.authing.logoutWithRedirect({
        redirectUri: redirectUri || this.config.redirectUri,
      });
    } catch (error) {
      console.error('登出失败:', error);
      throw error;
    }
  }

  /**
   * 检查登录状态 - 添加防重复调用
   */
  async checkLoginStatus(): Promise<boolean> {
    if (this.isCheckingStatus) {
      console.log('⚠️ 登录状态检查正在进行中，跳过重复调用');
      return false;
    }

    try {
      this.isCheckingStatus = true;
      const loginState = await this.authing.getLoginState();
      return !!loginState;
    } catch (error) {
      console.error('检查登录状态失败:', error);
      return false;
    } finally {
      this.isCheckingStatus = false;
    }
  }

  /**
   * 获取当前用户 - 添加防重复调用
   */
  async getCurrentUser(): Promise<any> {
    if (this.isCheckingStatus) {
      console.log('⚠️ 用户信息获取正在进行中，跳过重复调用');
      return null;
    }

    try {
      this.isCheckingStatus = true;
      const loginState = await this.authing.getLoginState();
      return loginState || null;
    } catch (error) {
      console.error('获取当前用户失败:', error);
      throw error;
    } finally {
      this.isCheckingStatus = false;
    }
  }

  /**
   * 获取用户信息
   */
  async getUserInfo(): Promise<any> {
    try {
      return await this.authing.getUserInfo();
    } catch (error) {
      console.error('获取用户信息失败:', error);
      throw error;
    }
  }

  /**
   * 更新用户信息
   */
  async updateUserInfo(updates: any): Promise<any> {
    try {
      // 注意：@authing/web SDK 可能不直接支持更新用户信息
      // 这里需要根据实际情况调整
      console.warn('更新用户信息功能需要根据实际 API 调整');
      return null;
    } catch (error) {
      console.error('更新用户信息失败:', error);
      throw error;
    }
  }

  /**
   * 发送验证码
   */
  async sendVerificationCode(email: string, scene: 'login' | 'register' | 'reset' = 'login'): Promise<void> {
    try {
      // 注意：@authing/web SDK 可能不直接支持发送验证码
      // 这里需要根据实际情况调整
      console.warn('发送验证码功能需要根据实际 API 调整');
    } catch (error) {
      console.error('发送验证码失败:', error);
      throw error;
    }
  }

  /**
   * 邮箱验证码登录
   */
  async loginWithEmailCode(email: string, code: string): Promise<any> {
    try {
      // 注意：@authing/web SDK 主要支持重定向登录
      // 这里需要根据实际情况调整
      console.warn('邮箱验证码登录功能需要根据实际 API 调整');
      throw new Error('邮箱验证码登录暂不支持，请使用重定向登录');
    } catch (error) {
      console.error('邮箱验证码登录失败:', error);
      throw error;
    }
  }

  /**
   * 手机验证码登录
   */
  async loginWithPhoneCode(phone: string, code: string): Promise<any> {
    try {
      // 注意：@authing/web SDK 主要支持重定向登录
      // 这里需要根据实际情况调整
      console.warn('手机验证码登录功能需要根据实际 API 调整');
      throw new Error('手机验证码登录暂不支持，请使用重定向登录');
    } catch (error) {
      console.error('手机验证码登录失败:', error);
      throw error;
    }
  }

  /**
   * 密码登录
   */
  async loginWithPassword(username: string, password: string): Promise<any> {
    try {
      // 注意：@authing/web SDK 主要支持重定向登录
      // 这里需要根据实际情况调整
      console.warn('密码登录功能需要根据实际 API 调整');
      throw new Error('密码登录暂不支持，请使用重定向登录');
    } catch (error) {
      console.error('密码登录失败:', error);
      throw error;
    }
  }

  /**
   * 注册用户
   */
  async registerUser(userInfo: {
    email?: string;
    phone?: string;
    password?: string;
    username?: string;
  }): Promise<any> {
    try {
      // 注意：@authing/web SDK 主要支持重定向注册
      // 这里需要根据实际情况调整
      console.warn('注册用户功能需要根据实际 API 调整');
      throw new Error('注册用户暂不支持，请使用重定向注册');
    } catch (error) {
      console.error('注册用户失败:', error);
      throw error;
    }
  }

  /**
   * 重置密码
   */
  async resetPassword(email: string, code: string, newPassword: string): Promise<void> {
    try {
      // 注意：@authing/web SDK 可能不直接支持重置密码
      // 这里需要根据实际情况调整
      console.warn('重置密码功能需要根据实际 API 调整');
    } catch (error) {
      console.error('重置密码失败:', error);
      throw error;
    }
  }

  /**
   * 获取用户权限
   */
  async getUserPermissions(userId: string): Promise<string[]> {
    try {
      // 注意：@authing/web SDK 可能不直接支持获取权限
      // 这里需要根据实际情况调整
      console.warn('获取用户权限功能需要根据实际 API 调整');
      return [];
    } catch (error) {
      console.error('获取用户权限失败:', error);
      return [];
    }
  }

  /**
   * 获取用户角色
   */
  async getUserRoles(userId: string): Promise<string[]> {
    try {
      // 注意：@authing/web SDK 可能不直接支持获取角色
      // 这里需要根据实际情况调整
      console.warn('获取用户角色功能需要根据实际 API 调整');
      return [];
    } catch (error) {
      console.error('获取用户角色失败:', error);
      return [];
    }
  }

  /**
   * 检查用户是否有权限
   */
  async hasPermission(userId: string, permission: string): Promise<boolean> {
    try {
      const permissions = await this.getUserPermissions(userId);
      return permissions.includes(permission);
    } catch (error) {
      console.error('检查用户权限失败:', error);
      return false;
    }
  }

  /**
   * 检查用户是否有角色
   */
  async hasRole(userId: string, role: string): Promise<boolean> {
    try {
      const roles = await this.getUserRoles(userId);
      return roles.includes(role);
    } catch (error) {
      console.error('检查用户角色失败:', error);
      return false;
    }
  }
}

export default AuthingClient; 