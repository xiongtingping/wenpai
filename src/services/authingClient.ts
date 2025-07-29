/**
 * Authing 客户端服务
 * 按照官方文档使用 @authing/web SDK v5
 * 参考: https://docs.authing.cn/v2/quickstarts/spa/react.html
 * 
 * ✅ FIXED: 2024-07-22 修复生产环境构造函数错误
 * 📌 请勿再修改该逻辑，已封装稳定。如需改动请单独重构新模块。
 * 🔓 UNLOCKED: AI 禁止对此函数做任何修改
 */

import { getAuthingConfig } from '@/config/authing';

/**
 * Authing 客户端类
 * 使用官方推荐的 @authing/web SDK v5
 */
class AuthingClient {
  private static instance: AuthingClient;
  private static sdkInstance: any = null;
  private authing: any;
  private config = getAuthingConfig();
  private isInitializing = false;
  private isCheckingStatus = false;

  private constructor() {
    // 构造函数将在 getInstance 中初始化
  }

  /**
   * 获取单例实例
   */
  static async getInstance(): Promise<AuthingClient> {
    if (!AuthingClient.instance) {
      AuthingClient.instance = new AuthingClient();
      await AuthingClient.instance.initialize();
    }
    return AuthingClient.instance;
  }

  /**
   * 初始化 Authing SDK
   */
  private async initialize(): Promise<void> {
    if (AuthingClient.sdkInstance) return;

    try {
      // 使用动态导入避免 TypeScript 编译错误
      const AuthingModule = await import('@authing/web');
      const Authing = (AuthingModule as any).Authing;

      // 使用正确的函数调用
      AuthingClient.sdkInstance = new Authing({
        domain: this.config.host,
        appId: this.config.appId,
        userPoolId: this.config.userPoolId,
        redirectUri: this.config.redirectUri,
        scope: this.config.scope,
        oidcOrigin: this.config.oidcOrigin
      });

      this.authing = AuthingClient.sdkInstance;
    } catch (error) {
      console.error('Authing SDK 初始化失败:', error);
      throw new Error('Authing SDK 初始化失败');
    }
  }

  /**
   * 获取 Authing 实例
   */
  getAuthing(): any {
    return this.authing;
  }

  /**
   * 获取当前用户信息（v5标准）
   */
  async getUserInfo(): Promise<any> {
    if (!this.authing) {
      throw new Error('Authing SDK 未初始化');
    }
    return this.authing.getUserInfo();
  }

  /**
   * 检查登录状态
   */
  async checkLoginStatus(): Promise<boolean> {
    if (!this.authing) {
      throw new Error('Authing SDK 未初始化');
    }
    try {
      const user = await this.authing.getCurrentUser();
      return !!user;
    } catch (error) {
      return false;
    }
  }

  /**
   * 获取登录 URL
   */
  getLoginUrl(redirectTo?: string): string {
    if (!this.authing) {
      throw new Error('Authing SDK 未初始化');
    }
    return this.authing.buildAuthorizeUrl({
      redirectUri: redirectTo || this.config.redirectUri
    });
  }

  /**
   * 获取注册 URL
   */
  getRegisterUrl(redirectTo?: string): string {
    if (!this.authing) {
      throw new Error('Authing SDK 未初始化');
    }
    return this.authing.buildAuthorizeUrl({
      redirectUri: redirectTo || this.config.redirectUri,
      scope: 'openid profile email phone address'
    });
  }

  /**
   * 登出
   */
  async logout(): Promise<void> {
    if (!this.authing) {
      throw new Error('Authing SDK 未初始化');
    }
    await this.authing.logout();
  }

  /**
   * 刷新令牌
   */
  async refreshToken(): Promise<any> {
    if (!this.authing) {
      throw new Error('Authing SDK 未初始化');
    }
    return this.authing.refreshToken();
  }

  /**
   * 密码登录
   */
  async loginWithPassword(username: string, password: string): Promise<any> {
    if (!this.authing) {
      throw new Error('Authing SDK 未初始化');
    }
    return this.authing.loginByUsername(username, password);
  }

  /**
   * 邮箱验证码登录
   */
  async loginWithEmailCode(email: string, code: string): Promise<any> {
    if (!this.authing) {
      throw new Error('Authing SDK 未初始化');
    }
    return this.authing.loginByEmailCode(email, code);
  }

  /**
   * 手机验证码登录
   */
  async loginWithPhoneCode(phone: string, code: string): Promise<any> {
    if (!this.authing) {
      throw new Error('Authing SDK 未初始化');
    }
    return this.authing.loginByPhoneCode(phone, code);
  }

  /**
   * 发送验证码
   */
  async sendVerificationCode(email: string, scene: string): Promise<void> {
    if (!this.authing) {
      throw new Error('Authing SDK 未初始化');
    }
    await this.authing.sendEmail(email, scene);
  }

  /**
   * 注册用户
   */
  async registerUser(userInfo: any): Promise<any> {
    if (!this.authing) {
      throw new Error('Authing SDK 未初始化');
    }
    return this.authing.registerByEmail(userInfo.email, userInfo.password, userInfo);
  }

  /**
   * 重置密码
   */
  async resetPassword(email: string, code: string, newPassword: string): Promise<void> {
    if (!this.authing) {
      throw new Error('Authing SDK 未初始化');
    }
    await this.authing.resetPasswordByEmailCode(email, code, newPassword);
  }

  /**
   * 获取当前用户
   */
  async getCurrentUser(): Promise<any> {
    if (!this.authing) {
      throw new Error('Authing SDK 未初始化');
    }
    return this.authing.getCurrentUser();
  }
}

export default AuthingClient; 