/**
 * Authing 服务类
 * 使用 Authing Guard 提供用户认证功能
 */

import { Guard } from '@authing/guard-react';
import { getAuthingConfig } from '@/config/authing';
import { User } from '@/types/user';

/**
 * Authing 服务类
 * 封装 Authing Guard 的所有功能
 */
class AuthingService {
  private guard: Guard | null = null;
  private config: ReturnType<typeof getAuthingConfig>;
  private setUser: (user: User) => void;
  private setIsAuthenticated: (isAuthenticated: boolean) => void;

  constructor(setUser: (user: User) => void, setIsAuthenticated: (isAuthenticated: boolean) => void) {
    this.config = getAuthingConfig();
    this.setUser = setUser;
    this.setIsAuthenticated = setIsAuthenticated;
  }

  /**
   * 初始化 Authing Guard
   * @returns Guard 实例
   */
  initGuard(): Guard {
    if (!this.guard) {
      this.guard = new Guard({
        appId: this.config.appId,
        host: this.config.host,
        redirectUri: this.config.redirectUri,
        mode: 'modal', // 切换为 modal 模式，弹窗自动关闭
        defaultScene: 'login',
        lang: 'zh-CN',
      });
    }
    return this.guard;
  }

  /**
   * 获取 Guard 实例
   * @returns Guard 实例
   */
  getGuard(): Guard | null {
    return this.guard;
  }

  /**
   * 获取当前配置
   * @returns 当前配置
   */
  getConfig() {
    return this.config;
  }

  /**
   * 启动登录
   * @param el 容器元素
   * @returns Promise<User> 用户信息
   */
  async startLogin(el?: string | HTMLElement): Promise<Record<string, unknown>> {
    const guard = this.initGuard();
    return await guard.start(el);
  }

  /**
   * 启动注册
   * @param el 容器元素
   * @returns Promise<User> 用户信息
   */
  async startRegister(el?: string | HTMLElement): Promise<Record<string, unknown>> {
    const guard = this.initGuard();
    guard.startRegister();
    return await guard.start(el);
  }

  /**
   * 检查登录状态
   * @returns Promise<boolean> 是否已登录
   */
  async checkLoginStatus(): Promise<boolean> {
    try {
      const guard = this.initGuard();
      const status = await guard.checkLoginStatus();
      console.log('检查登录状态结果:', status);
      // 根据 Authing Guard 的返回格式判断
      // status 可能是 { status: true, message: '已登录', code: 200 } 或者直接是 boolean
      if (typeof status === 'boolean') {
        return status;
      }
      if (status && typeof status === 'object') {
        // 检查 status 字段是否为 true，或者 code 为 200
        const statusValue = status.status;
        if (typeof statusValue === 'boolean') {
          return statusValue;
        }
        if (typeof statusValue === 'string') {
          return statusValue === 'ok' || statusValue === 'success';
        }
        return status.code === 200;
      }
      return false;
    } catch (error) {
      console.error('检查登录状态失败:', error);
      return false;
    }
  }

  /**
   * 获取当前用户信息
   * @returns Promise<Record<string, unknown> | null> 用户信息
   */
  async getCurrentUser(): Promise<Record<string, unknown> | null> {
    try {
      const guard = this.initGuard();
      // 使用 trackSession 方法获取用户信息（这是正确的 API）
      const user = await guard.trackSession();
      console.log('获取当前用户信息:', user);
      return user;
    } catch (error) {
      console.error('获取当前用户失败:', error);
      return null;
    }
  }

  /**
   * 登出
   * @returns Promise<void>
   */
  async logout(): Promise<void> {
    try {
      const guard = this.initGuard();
      await guard.logout();
    } catch (error) {
      console.error('登出失败:', error);
      throw error;
    }
  }

  /**
   * 处理重定向回调
   * @returns Promise<void>
   */
  async handleRedirectCallback(): Promise<void> {
    try {
      const guard = this.initGuard();
      await guard.handleRedirectCallback();
    } catch (error) {
      console.error('处理重定向回调失败:', error);
      throw error;
    }
  }

  /**
   * 启动跳转模式登录
   * @returns Promise<void>
   */
  async startWithRedirect(): Promise<void> {
    try {
      const guard = this.initGuard();
      await guard.startWithRedirect();
    } catch (error) {
      console.error('启动跳转模式失败:', error);
      throw error;
    }
  }

  /**
   * 显示 Guard
   */
  show(): void {
    const guard = this.initGuard();
    guard.show();
  }

  /**
   * 隐藏 Guard
   */
  hide(): void {
    const guard = this.initGuard();
    guard.hide();
  }



  /**
   * 卸载 Guard
   */
  unmount(): void {
    if (this.guard) {
      this.guard.unmount();
      this.guard = null;
    }
  }
}

// 创建单例实例
const authingService = new AuthingService(() => {}, () => {});

export default authingService; 