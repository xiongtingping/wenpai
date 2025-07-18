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
    return await (guard as any).start(el);
  }

  /**
   * 启动注册
   * @param el 容器元素
   * @returns Promise<User> 用户信息
   */
  async startRegister(el?: string | HTMLElement): Promise<Record<string, unknown>> {
    const guard = this.initGuard();
    (guard as any).startRegister();
    return await (guard as any).start(el);
  }

  /**
   * 检查登录状态
   */
  async checkLoginStatus(): Promise<boolean> {
    try {
      const guard = this.initGuard();
      const userInfo = await guard.trackSession();
      return !!userInfo;
    } catch (error) {
      console.error('检查登录状态失败:', error);
      return false;
    }
  }

  /**
   * 获取当前用户信息
   */
  async getCurrentUser(): Promise<User | null> {
    try {
      if (!this.guard) {
        console.warn('Guard not initialized');
        return null;
      }

      const userInfo = await this.guard.trackSession();
      if (!userInfo) {
        return null;
      }

      // 转换 Authing SDK 的用户类型到我们的 User 类型
      const user: User = {
        id: String((userInfo as any).id || (userInfo as any).userId || ''),
        username: String((userInfo as any).username || (userInfo as any).nickname || ''),
        email: String((userInfo as any).email || ''),
        phone: String((userInfo as any).phone || ''),
        nickname: String((userInfo as any).nickname || (userInfo as any).username || ''),
        avatar: String((userInfo as any).photo || (userInfo as any).avatar || ''),
        ...((userInfo as unknown) as Record<string, unknown>) // 保留其他属性
      };

      return user;
    } catch (error) {
      console.error('获取用户信息失败:', error);
      return null;
    }
  }

  /**
   * 登录
   */
  async login(): Promise<User | null> {
    try {
      const guard = this.initGuard();
      const userInfo = await guard.trackSession();
      
      if (userInfo) {
        // 转换 Authing SDK 的用户类型到我们的 User 类型
        const user: User = {
          id: String((userInfo as any).id || (userInfo as any).userId || ''),
          username: String((userInfo as any).username || (userInfo as any).nickname || ''),
          email: String((userInfo as any).email || ''),
          phone: String((userInfo as any).phone || ''),
          nickname: String((userInfo as any).nickname || (userInfo as any).username || ''),
          avatar: String((userInfo as any).photo || (userInfo as any).avatar || ''),
          ...((userInfo as unknown) as Record<string, unknown>) // 保留其他属性
        };
        
        return user;
      }
      
      return null;
    } catch (error) {
      console.error('登录失败:', error);
      return null;
    }
  }

  /**
   * 登出
   */
  async logout(): Promise<void> {
    try {
      const guard = this.initGuard();
      await guard.logout();
      console.log('登出成功');
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
   * 获取用户权限
   */
  async getUserPermissions(): Promise<string[]> {
    try {
      // 开发环境下返回默认权限
      if (process.env.NODE_ENV === 'development') {
        return ['read', 'write', 'admin'];
      }

      const guard = this.initGuard();
      const userInfo = await guard.trackSession();
      
      if (!userInfo) {
        return [];
      }
      
      // 从用户信息中提取权限
      const permissions = (userInfo as any).permissions || [];
      return Array.isArray(permissions) ? permissions : [];
    } catch (error) {
      // 静默处理错误，不污染控制台
      return [];
    }
  }

  /**
   * 获取用户角色
   */
  async getUserRoles(): Promise<any[]> {
    try {
      // 开发环境下返回默认角色
      if (process.env.NODE_ENV === 'development') {
        return [
          { id: 'dev-user', name: '开发用户', code: 'user' },
          { id: 'dev-vip', name: '开发VIP', code: 'vip' }
        ];
      }

      const guard = this.initGuard();
      const userInfo = await guard.trackSession();
      
      if (!userInfo) {
        return [];
      }
      
      // 从用户信息中提取角色
      const roles = (userInfo as any).roles || [];
      return Array.isArray(roles) ? roles : [];
    } catch (error) {
      // 静默处理错误，不污染控制台
      return [];
    }
  }

  /**
   * 检查用户是否有指定权限
   */
  async hasPermission(permission: string): Promise<boolean> {
    try {
      const permissions = await this.getUserPermissions();
      return permissions.includes(permission);
    } catch (error) {
      console.error('检查用户权限失败:', error);
      return false;
    }
  }

  /**
   * 检查用户是否有指定角色
   */
  async hasRole(role: string): Promise<boolean> {
    try {
      const roles = await this.getUserRoles();
      return roles.includes(role);
    } catch (error) {
      console.error('检查用户角色失败:', error);
      return false;
    }
  }

  /**
   * 获取用户元数据
   */
  async getUserMetadata(): Promise<Record<string, unknown>> {
    try {
      const guard = this.initGuard();
      const userInfo = await guard.trackSession();
      
      if (!userInfo) {
        return {};
      }
      
      // 从用户信息中提取元数据
      const metadata = (userInfo as any).metadata || {};
      return typeof metadata === 'object' ? metadata : {};
    } catch (error) {
      console.error('获取用户元数据失败:', error);
      return {};
    }
  }

  /**
   * 更新用户信息
   */
  async updateUserInfo(updates: Partial<User>): Promise<User | null> {
    try {
      const guard = this.initGuard();
      const userInfo = await guard.trackSession();
      
      if (!userInfo) {
        throw new Error('用户未登录');
      }
      
      // 调用 Authing 的更新用户信息 API
      const updatedUser = await (guard as any).updateUserInfo(updates as any);
      
      if (updatedUser) {
        // 转换 Authing SDK 的用户类型到我们的 User 类型
        const user: User = {
          id: String(updatedUser.id || updatedUser.userId || ''),
          username: String(updatedUser.username || updatedUser.nickname || ''),
          email: String(updatedUser.email || ''),
          phone: String(updatedUser.phone || ''),
          nickname: String(updatedUser.nickname || updatedUser.username || ''),
          avatar: String(updatedUser.photo || updatedUser.avatar || ''),
          ...((updatedUser as unknown) as Record<string, unknown>) // 保留其他属性
        };
        
        return user;
      }
      
      return null;
    } catch (error) {
      console.error('更新用户信息失败:', error);
      throw error;
    }
  }

  /**
   * 修改密码
   */
  async changePassword(oldPassword: string, newPassword: string): Promise<void> {
    try {
      const guard = this.initGuard();
      await (guard as any).changePassword(oldPassword, newPassword);
      console.log('密码修改成功');
    } catch (error) {
      console.error('密码修改失败:', error);
      throw error;
    }
  }

  /**
   * 重置密码
   */
  async resetPassword(email: string): Promise<void> {
    try {
      const guard = this.initGuard();
      await (guard as any).resetPassword(email);
      console.log('密码重置邮件已发送');
    } catch (error) {
      console.error('密码重置失败:', error);
      throw error;
    }
  }

  /**
   * 绑定手机号
   */
  async bindPhone(phone: string, code: string): Promise<void> {
    try {
      const guard = this.initGuard();
      await (guard as any).bindPhone(phone, code);
      console.log('手机号绑定成功');
    } catch (error) {
      console.error('手机号绑定失败:', error);
      throw error;
    }
  }

  /**
   * 解绑手机号
   */
  async unbindPhone(): Promise<void> {
    try {
      const guard = this.initGuard();
      await (guard as any).unbindPhone();
      console.log('手机号解绑成功');
    } catch (error) {
      console.error('手机号解绑失败:', error);
      throw error;
    }
  }

  /**
   * 绑定邮箱
   */
  async bindEmail(email: string, code: string): Promise<void> {
    try {
      const guard = this.initGuard();
      await (guard as any).bindEmail(email, code);
      console.log('邮箱绑定成功');
    } catch (error) {
      console.error('邮箱绑定失败:', error);
      throw error;
    }
  }

  /**
   * 解绑邮箱
   */
  async unbindEmail(): Promise<void> {
    try {
      const guard = this.initGuard();
      await (guard as any).unbindEmail();
      console.log('邮箱解绑成功');
    } catch (error) {
      console.error('邮箱解绑失败:', error);
      throw error;
    }
  }

  /**
   * 获取用户列表（管理员功能）
   */
  async getUserList(params: {
    page?: number;
    limit?: number;
    search?: string;
  } = {}): Promise<{ users: User[]; total: number }> {
    try {
      const guard = this.initGuard();
      const result = await (guard as any).getUserList(params as any);
      
      if (result && result.list) {
        const users: User[] = result.list.map((userInfo: any) => ({
          id: String(userInfo.id || userInfo.userId || ''),
          username: String(userInfo.username || userInfo.nickname || ''),
          email: String(userInfo.email || ''),
          phone: String(userInfo.phone || ''),
          nickname: String(userInfo.nickname || userInfo.username || ''),
          avatar: String(userInfo.photo || userInfo.avatar || ''),
          ...((userInfo as unknown) as Record<string, unknown>) // 保留其他属性
        }));
        
        return {
          users,
          total: result.total || 0
        };
      }
      
      return { users: [], total: 0 };
    } catch (error) {
      console.error('获取用户列表失败:', error);
      throw error;
    }
  }

  /**
   * 删除用户（管理员功能）
   */
  async deleteUser(userId: string): Promise<void> {
    try {
      const guard = this.initGuard();
      await (guard as any).deleteUser(userId);
      console.log('用户删除成功');
    } catch (error) {
      console.error('删除用户失败:', error);
      throw error;
    }
  }

  /**
   * 获取用户统计信息（管理员功能）
   */
  async getUserStats(): Promise<{
    totalUsers: number;
    activeUsers: number;
    newUsers: number;
  }> {
    try {
      const guard = this.initGuard();
      const stats = await (guard as any).getUserStats();
      
      return {
        totalUsers: stats?.totalUsers || 0,
        activeUsers: stats?.activeUsers || 0,
        newUsers: stats?.newUsers || 0
      };
    } catch (error) {
      console.error('获取用户统计信息失败:', error);
      return {
        totalUsers: 0,
        activeUsers: 0,
        newUsers: 0
      };
    }
  }

  /**
   * 获取用户活动日志（管理员功能）
   */
  async getUserActivityLogs(params: {
    userId?: string;
    page?: number;
    limit?: number;
    startDate?: string;
    endDate?: string;
  } = {}): Promise<{
    logs: Array<{
      id: string;
      userId: string;
      action: string;
      timestamp: string;
      details: Record<string, unknown>;
    }>;
    total: number;
  }> {
    try {
      const guard = this.initGuard();
      const result = await (guard as any).getUserActivityLogs(params as any);
      
      if (result && result.list) {
        const logs = result.list.map((log: any) => ({
          id: String(log.id || ''),
          userId: String(log.userId || ''),
          action: String(log.action || ''),
          timestamp: String(log.timestamp || ''),
          details: log.details || {}
        }));
        
        return {
          logs,
          total: result.total || 0
        };
      }
      
      return { logs: [], total: 0 };
    } catch (error) {
      console.error('获取用户活动日志失败:', error);
      throw error;
    }
  }

  /**
   * 获取审计日志（管理员功能）
   */
  async getAuditLogs(params: {
    page?: number;
    limit?: number;
    startDate?: string;
    endDate?: string;
    action?: string;
    userId?: string;
  } = {}): Promise<{
    logs: Array<{
      id: string;
      userId: string;
      action: string;
      resource: string;
      timestamp: string;
      ip: string;
      userAgent: string;
      details: Record<string, unknown>;
    }>;
    total: number;
  }> {
    try {
      const guard = this.initGuard();
      const result = await (guard as any).getAuditLogs(params as any);
      
      if (result && result.list) {
        const logs = result.list.map((log: any) => ({
          id: String(log.id || ''),
          userId: String(log.userId || ''),
          action: String(log.action || ''),
          resource: String(log.resource || ''),
          timestamp: String(log.timestamp || ''),
          ip: String(log.ip || ''),
          userAgent: String(log.userAgent || ''),
          details: log.details || {}
        }));
        
        return {
          logs,
          total: result.total || 0
        };
      }
      
      return { logs: [], total: 0 };
    } catch (error) {
      console.error('获取审计日志失败:', error);
      throw error;
    }
  }

  /**
   * 获取系统配置（管理员功能）
   */
  async getSystemConfig(): Promise<Record<string, unknown>> {
    try {
      const guard = this.initGuard();
      const config = await (guard as any).getSystemConfig();
      return config || {};
    } catch (error) {
      console.error('获取系统配置失败:', error);
      return {};
    }
  }

  /**
   * 更新系统配置（管理员功能）
   */
  async updateSystemConfig(config: Record<string, unknown>): Promise<void> {
    try {
      const guard = this.initGuard();
      await (guard as any).updateSystemConfig(config);
      console.log('系统配置更新成功');
    } catch (error) {
      console.error('更新系统配置失败:', error);
      throw error;
    }
  }

  /**
   * 获取API密钥列表（管理员功能）
   */
  async getApiKeys(): Promise<Array<{
    id: string;
    name: string;
    key: string;
    createdAt: string;
    lastUsed: string;
    status: 'active' | 'inactive';
  }>> {
    try {
      const guard = this.initGuard();
      const keys = await (guard as any).getApiKeys();
      
      if (Array.isArray(keys)) {
        return keys.map((key: any) => ({
          id: String(key.id || ''),
          name: String(key.name || ''),
          key: String(key.key || ''),
          createdAt: String(key.createdAt || ''),
          lastUsed: String(key.lastUsed || ''),
          status: key.status === 'active' ? 'active' : 'inactive'
        }));
      }
      
      return [];
    } catch (error) {
      console.error('获取API密钥列表失败:', error);
      return [];
    }
  }

  /**
   * 创建API密钥（管理员功能）
   */
  async createApiKey(name: string): Promise<{
    id: string;
    name: string;
    key: string;
    createdAt: string;
  }> {
    try {
      const guard = this.initGuard();
      const key = await (guard as any).createApiKey({ name });
      
      return {
        id: String(key.id || ''),
        name: String(key.name || ''),
        key: String(key.key || ''),
        createdAt: String(key.createdAt || '')
      };
    } catch (error) {
      console.error('创建API密钥失败:', error);
      throw error;
    }
  }

  /**
   * 删除API密钥（管理员功能）
   */
  async deleteApiKey(keyId: string): Promise<void> {
    try {
      const guard = this.initGuard();
      await (guard as any).deleteApiKey(keyId);
      console.log('API密钥删除成功');
    } catch (error) {
      console.error('删除API密钥失败:', error);
      throw error;
    }
  }

  /**
   * 获取系统健康状态（管理员功能）
   */
  async getSystemHealth(): Promise<{
    status: 'healthy' | 'warning' | 'error';
    services: Array<{
      name: string;
      status: 'up' | 'down';
      responseTime: number;
      lastCheck: string;
    }>;
    metrics: {
      cpuUsage: number;
      memoryUsage: number;
      diskUsage: number;
      activeConnections: number;
    };
  }> {
    try {
      const guard = this.initGuard();
      const health = await (guard as any).getSystemHealth();
      
      return {
        status: health?.status || 'error',
        services: health?.services || [],
        metrics: health?.metrics || {
          cpuUsage: 0,
          memoryUsage: 0,
          diskUsage: 0,
          activeConnections: 0
        }
      };
    } catch (error) {
      console.error('获取系统健康状态失败:', error);
      return {
        status: 'error',
        services: [],
        metrics: {
          cpuUsage: 0,
          memoryUsage: 0,
          diskUsage: 0,
          activeConnections: 0
        }
      };
    }
  }

  /**
   * 获取系统通知（管理员功能）
   */
  async getSystemNotifications(): Promise<Array<{
    id: string;
    type: 'info' | 'warning' | 'error' | 'success';
    title: string;
    message: string;
    timestamp: string;
    read: boolean;
  }>> {
    try {
      const guard = this.initGuard();
      const notifications = await (guard as any).getSystemNotifications();
      
      if (Array.isArray(notifications)) {
        return notifications.map((notification: any) => ({
          id: String(notification.id || ''),
          type: notification.type || 'info',
          title: String(notification.title || ''),
          message: String(notification.message || ''),
          timestamp: String(notification.timestamp || ''),
          read: Boolean(notification.read)
        }));
      }
      
      return [];
    } catch (error) {
      console.error('获取系统通知失败:', error);
      return [];
    }
  }

  /**
   * 标记通知为已读（管理员功能）
   */
  async markNotificationAsRead(notificationId: string): Promise<void> {
    try {
      const guard = this.initGuard();
      await (guard as any).markNotificationAsRead(notificationId);
      console.log('通知已标记为已读');
    } catch (error) {
      console.error('标记通知为已读失败:', error);
      throw error;
    }
  }

  /**
   * 获取用户会话列表（管理员功能）
   */
  async getUserSessions(userId?: string): Promise<Array<{
    id: string;
    userId: string;
    ip: string;
    userAgent: string;
    createdAt: string;
    lastActivity: string;
    status: 'active' | 'expired';
  }>> {
    try {
      const guard = this.initGuard();
      const sessions = await (guard as any).getUserSessions(userId);
      
      if (Array.isArray(sessions)) {
        return sessions.map((session: any) => ({
          id: String(session.id || ''),
          userId: String(session.userId || ''),
          ip: String(session.ip || ''),
          userAgent: String(session.userAgent || ''),
          createdAt: String(session.createdAt || ''),
          lastActivity: String(session.lastActivity || ''),
          status: session.status === 'active' ? 'active' : 'expired'
        }));
      }
      
      return [];
    } catch (error) {
      console.error('获取用户会话列表失败:', error);
      return [];
    }
  }

  /**
   * 强制用户下线（管理员功能）
   */
  async forceUserLogout(userId: string, sessionId?: string): Promise<void> {
    try {
      const guard = this.initGuard();
      await (guard as any).forceUserLogout(userId, sessionId);
      console.log('用户已被强制下线');
    } catch (error) {
      console.error('强制用户下线失败:', error);
      throw error;
    }
  }

  /**
   * 获取用户登录历史（管理员功能）
   */
  async getUserLoginHistory(userId: string, params: {
    page?: number;
    limit?: number;
    startDate?: string;
    endDate?: string;
  } = {}): Promise<{
    history: Array<{
      id: string;
      userId: string;
      ip: string;
      userAgent: string;
      location: string;
      timestamp: string;
      status: 'success' | 'failed';
      reason?: string;
    }>;
    total: number;
  }> {
    try {
      const guard = this.initGuard();
      const result = await (guard as any).getUserLoginHistory(userId, params as any);
      
      if (result && result.list) {
        const history = result.list.map((entry: any) => ({
          id: String(entry.id || ''),
          userId: String(entry.userId || ''),
          ip: String(entry.ip || ''),
          userAgent: String(entry.userAgent || ''),
          location: String(entry.location || ''),
          timestamp: String(entry.timestamp || ''),
          status: entry.status === 'success' ? 'success' : 'failed',
          reason: entry.reason ? String(entry.reason) : undefined
        }));
        
        return {
          history,
          total: result.total || 0
        };
      }
      
      return { history: [], total: 0 };
    } catch (error) {
      console.error('获取用户登录历史失败:', error);
      throw error;
    }
  }

  /**
   * 获取用户设备列表（管理员功能）
   */
  async getUserDevices(userId: string): Promise<Array<{
    id: string;
    userId: string;
    deviceId: string;
    deviceName: string;
    deviceType: string;
    os: string;
    browser: string;
    ip: string;
    lastUsed: string;
    status: 'active' | 'inactive';
  }>> {
    try {
      const guard = this.initGuard();
      const devices = await (guard as any).getUserDevices(userId);
      
      if (Array.isArray(devices)) {
        return devices.map((device: any) => ({
          id: String(device.id || ''),
          userId: String(device.userId || ''),
          deviceId: String(device.deviceId || ''),
          deviceName: String(device.deviceName || ''),
          deviceType: String(device.deviceType || ''),
          os: String(device.os || ''),
          browser: String(device.browser || ''),
          ip: String(device.ip || ''),
          lastUsed: String(device.lastUsed || ''),
          status: device.status === 'active' ? 'active' : 'inactive'
        }));
      }
      
      return [];
    } catch (error) {
      console.error('获取用户设备列表失败:', error);
      return [];
    }
  }

  /**
   * 撤销用户设备访问权限（管理员功能）
   */
  async revokeUserDevice(userId: string, deviceId: string): Promise<void> {
    try {
      const guard = this.initGuard();
      await (guard as any).revokeUserDevice(userId, deviceId);
      console.log('用户设备访问权限已撤销');
    } catch (error) {
      console.error('撤销用户设备访问权限失败:', error);
      throw error;
    }
  }

  /**
   * 获取用户安全设置（管理员功能）
   */
  async getUserSecuritySettings(userId: string): Promise<{
    mfaEnabled: boolean;
    mfaType: 'sms' | 'email' | 'totp' | 'none';
    passwordPolicy: {
      minLength: number;
      requireUppercase: boolean;
      requireLowercase: boolean;
      requireNumbers: boolean;
      requireSpecialChars: boolean;
    };
    loginAttempts: {
      maxAttempts: number;
      lockoutDuration: number;
      currentAttempts: number;
    };
    sessionTimeout: number;
  }> {
    try {
      const guard = this.initGuard();
      const settings = await (guard as any).getUserSecuritySettings(userId);
      
      return {
        mfaEnabled: settings?.mfaEnabled || false,
        mfaType: settings?.mfaType || 'none',
        passwordPolicy: settings?.passwordPolicy || {
          minLength: 8,
          requireUppercase: true,
          requireLowercase: true,
          requireNumbers: true,
          requireSpecialChars: false
        },
        loginAttempts: settings?.loginAttempts || {
          maxAttempts: 5,
          lockoutDuration: 30,
          currentAttempts: 0
        },
        sessionTimeout: settings?.sessionTimeout || 3600
      };
    } catch (error) {
      console.error('获取用户安全设置失败:', error);
      throw error;
    }
  }

  /**
   * 更新用户安全设置（管理员功能）
   */
  async updateUserSecuritySettings(
    userId: string,
    settings: {
      mfaEnabled?: boolean;
      mfaType?: 'sms' | 'email' | 'totp' | 'none';
      passwordPolicy?: {
        minLength?: number;
        requireUppercase?: boolean;
        requireLowercase?: boolean;
        requireNumbers?: boolean;
        requireSpecialChars?: boolean;
      };
      loginAttempts?: {
        maxAttempts?: number;
        lockoutDuration?: number;
      };
      sessionTimeout?: number;
    }
  ): Promise<void> {
    try {
      const guard = this.initGuard();
      await (guard as any).updateUserSecuritySettings(userId, settings as any);
      console.log('用户安全设置更新成功');
    } catch (error) {
      console.error('更新用户安全设置失败:', error);
      throw error;
    }
  }

  /**
   * 获取用户风险评分（管理员功能）
   */
  async getUserRiskScore(userId: string): Promise<{
    score: number;
    level: 'low' | 'medium' | 'high' | 'critical';
    factors: Array<{
      type: string;
      description: string;
      weight: number;
    }>;
    lastUpdated: string;
  }> {
    try {
      const guard = this.initGuard();
      const riskData = await (guard as any).getUserRiskScore(userId);
      
      return {
        score: riskData?.score || 0,
        level: riskData?.level || 'low',
        factors: riskData?.factors || [],
        lastUpdated: riskData?.lastUpdated || new Date().toISOString()
      };
    } catch (error) {
      console.error('获取用户风险评分失败:', error);
      return {
        score: 0,
        level: 'low',
        factors: [],
        lastUpdated: new Date().toISOString()
      };
    }
  }

  /**
   * 获取用户行为分析（管理员功能）
   */
  async getUserBehaviorAnalysis(userId: string, params: {
    startDate?: string;
    endDate?: string;
    type?: 'login' | 'logout' | 'action' | 'all';
  } = {}): Promise<{
    summary: {
      totalLogins: number;
      totalActions: number;
      averageSessionDuration: number;
      mostActiveTime: string;
      mostUsedDevice: string;
    };
    timeline: Array<{
      timestamp: string;
      action: string;
      details: Record<string, unknown>;
    }>;
    patterns: Array<{
      type: string;
      frequency: number;
      description: string;
    }>;
  }> {
    try {
      const guard = this.initGuard();
      const analysis = await (guard as any).getUserBehaviorAnalysis(userId, params as any);
      
      return {
        summary: analysis?.summary || {
          totalLogins: 0,
          totalActions: 0,
          averageSessionDuration: 0,
          mostActiveTime: '',
          mostUsedDevice: ''
        },
        timeline: analysis?.timeline || [],
        patterns: analysis?.patterns || []
      };
    } catch (error) {
      console.error('获取用户行为分析失败:', error);
      return {
        summary: {
          totalLogins: 0,
          totalActions: 0,
          averageSessionDuration: 0,
          mostActiveTime: '',
          mostUsedDevice: ''
        },
        timeline: [],
        patterns: []
      };
    }
  }

  /**
   * 获取用户地理位置分析（管理员功能）
   */
  async getUserLocationAnalysis(userId: string, params: {
    startDate?: string;
    endDate?: string;
  } = {}): Promise<{
    locations: Array<{
      country: string;
      region: string;
      city: string;
      ip: string;
      count: number;
      lastVisit: string;
    }>;
    suspiciousLocations: Array<{
      location: string;
      reason: string;
      riskLevel: 'low' | 'medium' | 'high';
    }>;
    travelPatterns: Array<{
      from: string;
      to: string;
      frequency: number;
      lastTravel: string;
    }>;
  }> {
    try {
      const guard = this.initGuard();
      const analysis = await (guard as any).getUserLocationAnalysis(userId, params as any);
      
      return {
        locations: analysis?.locations || [],
        suspiciousLocations: analysis?.suspiciousLocations || [],
        travelPatterns: analysis?.travelPatterns || []
      };
    } catch (error) {
      console.error('获取用户地理位置分析失败:', error);
      return {
        locations: [],
        suspiciousLocations: [],
        travelPatterns: []
      };
    }
  }

  /**
   * 获取用户设备分析（管理员功能）
   */
  async getUserDeviceAnalysis(userId: string, params: {
    startDate?: string;
    endDate?: string;
  } = {}): Promise<{
    devices: Array<{
      deviceId: string;
      deviceName: string;
      deviceType: string;
      os: string;
      browser: string;
      usageCount: number;
      lastUsed: string;
      trustLevel: 'trusted' | 'suspicious' | 'blocked';
    }>;
    devicePatterns: Array<{
      pattern: string;
      frequency: number;
      description: string;
    }>;
    securityIssues: Array<{
      type: string;
      severity: 'low' | 'medium' | 'high' | 'critical';
      description: string;
      affectedDevices: string[];
    }>;
  }> {
    try {
      const guard = this.initGuard();
      const analysis = await (guard as any).getUserDeviceAnalysis(userId, params as any);
      
      return {
        devices: analysis?.devices || [],
        devicePatterns: analysis?.devicePatterns || [],
        securityIssues: analysis?.securityIssues || []
      };
    } catch (error) {
      console.error('获取用户设备分析失败:', error);
      return {
        devices: [],
        devicePatterns: [],
        securityIssues: []
      };
    }
  }

  /**
   * 获取用户时间分析（管理员功能）
   */
  async getUserTimeAnalysis(userId: string, params: {
    startDate?: string;
    endDate?: string;
  } = {}): Promise<{
    hourlyActivity: Array<{
      hour: number;
      activityCount: number;
      loginCount: number;
    }>;
    dailyActivity: Array<{
      date: string;
      activityCount: number;
      loginCount: number;
      sessionDuration: number;
    }>;
    weeklyPatterns: Array<{
      dayOfWeek: number;
      averageActivity: number;
      peakHour: number;
    }>;
    anomalies: Array<{
      timestamp: string;
      type: string;
      description: string;
      severity: 'low' | 'medium' | 'high';
    }>;
  }> {
    try {
      const guard = this.initGuard();
      const analysis = await (guard as any).getUserTimeAnalysis(userId, params as any);
      
      return {
        hourlyActivity: analysis?.hourlyActivity || [],
        dailyActivity: analysis?.dailyActivity || [],
        weeklyPatterns: analysis?.weeklyPatterns || [],
        anomalies: analysis?.anomalies || []
      };
    } catch (error) {
      console.error('获取用户时间分析失败:', error);
      return {
        hourlyActivity: [],
        dailyActivity: [],
        weeklyPatterns: [],
        anomalies: []
      };
    }
  }

  /**
   * 获取用户网络分析（管理员功能）
   */
  async getUserNetworkAnalysis(userId: string, params: {
    startDate?: string;
    endDate?: string;
  } = {}): Promise<{
    networks: Array<{
      networkId: string;
      networkName: string;
      networkType: string;
      ipRange: string;
      usageCount: number;
      lastUsed: string;
      trustLevel: 'trusted' | 'suspicious' | 'blocked';
    }>;
    networkPatterns: Array<{
      pattern: string;
      frequency: number;
      description: string;
    }>;
    securityIssues: Array<{
      type: string;
      severity: 'low' | 'medium' | 'high' | 'critical';
      description: string;
      affectedNetworks: string[];
    }>;
  }> {
    try {
      const guard = this.initGuard();
      const analysis = await (guard as any).getUserNetworkAnalysis(userId, params as any);
      
      return {
        networks: analysis?.networks || [],
        networkPatterns: analysis?.networkPatterns || [],
        securityIssues: analysis?.securityIssues || []
      };
    } catch (error) {
      console.error('获取用户网络分析失败:', error);
      return {
        networks: [],
        networkPatterns: [],
        securityIssues: []
      };
    }
  }

  /**
   * 获取用户应用分析（管理员功能）
   */
  async getUserAppAnalysis(userId: string, params: {
    startDate?: string;
    endDate?: string;
  } = {}): Promise<{
    apps: Array<{
      appId: string;
      appName: string;
      appType: string;
      usageCount: number;
      lastUsed: string;
      permissions: string[];
      trustLevel: 'trusted' | 'suspicious' | 'blocked';
    }>;
    appPatterns: Array<{
      pattern: string;
      frequency: number;
      description: string;
    }>;
    securityIssues: Array<{
      type: string;
      severity: 'low' | 'medium' | 'high' | 'critical';
      description: string;
      affectedApps: string[];
    }>;
  }> {
    try {
      const guard = this.initGuard();
      const analysis = await (guard as any).getUserAppAnalysis(userId, params as any);
      
      return {
        apps: analysis?.apps || [],
        appPatterns: analysis?.appPatterns || [],
        securityIssues: analysis?.securityIssues || []
      };
    } catch (error) {
      console.error('获取用户应用分析失败:', error);
      return {
        apps: [],
        appPatterns: [],
        securityIssues: []
      };
    }
  }

  /**
   * 获取用户文件分析（管理员功能）
   */
  async getUserFileAnalysis(userId: string, params: {
    startDate?: string;
    endDate?: string;
  } = {}): Promise<{
    files: Array<{
      fileId: string;
      fileName: string;
      fileType: string;
      fileSize: number;
      accessCount: number;
      lastAccessed: string;
      permissions: string[];
      securityLevel: 'public' | 'private' | 'confidential' | 'restricted';
    }>;
    filePatterns: Array<{
      pattern: string;
      frequency: number;
      description: string;
    }>;
    securityIssues: Array<{
      type: string;
      severity: 'low' | 'medium' | 'high' | 'critical';
      description: string;
      affectedFiles: string[];
    }>;
  }> {
    try {
      const guard = this.initGuard();
      const analysis = await (guard as any).getUserFileAnalysis(userId, params as any);
      
      return {
        files: analysis?.files || [],
        filePatterns: analysis?.filePatterns || [],
        securityIssues: analysis?.securityIssues || []
      };
    } catch (error) {
      console.error('获取用户文件分析失败:', error);
      return {
        files: [],
        filePatterns: [],
        securityIssues: []
      };
    }
  }

  /**
   * 获取用户数据库分析（管理员功能）
   */
  async getUserDatabaseAnalysis(userId: string, params: {
    startDate?: string;
    endDate?: string;
  } = {}): Promise<{
    databases: Array<{
      databaseId: string;
      databaseName: string;
      databaseType: string;
      accessCount: number;
      lastAccessed: string;
      permissions: string[];
      securityLevel: 'public' | 'private' | 'confidential' | 'restricted';
    }>;
    databasePatterns: Array<{
      pattern: string;
      frequency: number;
      description: string;
    }>;
    securityIssues: Array<{
      type: string;
      severity: 'low' | 'medium' | 'high' | 'critical';
      description: string;
      affectedDatabases: string[];
    }>;
  }> {
    try {
      const guard = this.initGuard();
      const analysis = await (guard as any).getUserDatabaseAnalysis(userId, params as any);
      
      return {
        databases: analysis?.databases || [],
        databasePatterns: analysis?.databasePatterns || [],
        securityIssues: analysis?.securityIssues || []
      };
    } catch (error) {
      console.error('获取用户数据库分析失败:', error);
      return {
        databases: [],
        databasePatterns: [],
        securityIssues: []
      };
    }
  }

  /**
   * 获取用户API分析（管理员功能）
   */
  async getUserApiAnalysis(userId: string, params: {
    startDate?: string;
    endDate?: string;
  } = {}): Promise<{
    apis: Array<{
      apiId: string;
      apiName: string;
      apiEndpoint: string;
      callCount: number;
      lastCalled: string;
      permissions: string[];
      rateLimit: {
        limit: number;
        remaining: number;
        resetTime: string;
      };
    }>;
    apiPatterns: Array<{
      pattern: string;
      frequency: number;
      description: string;
    }>;
    securityIssues: Array<{
      type: string;
      severity: 'low' | 'medium' | 'high' | 'critical';
      description: string;
      affectedApis: string[];
    }>;
  }> {
    try {
      const guard = this.initGuard();
      const analysis = await (guard as any).getUserApiAnalysis(userId, params as any);
      
      return {
        apis: analysis?.apis || [],
        apiPatterns: analysis?.apiPatterns || [],
        securityIssues: analysis?.securityIssues || []
      };
    } catch (error) {
      console.error('获取用户API分析失败:', error);
      return {
        apis: [],
        apiPatterns: [],
        securityIssues: []
      };
    }
  }

  /**
   * 获取用户服务分析（管理员功能）
   */
  async getUserServiceAnalysis(userId: string, params: {
    startDate?: string;
    endDate?: string;
  } = {}): Promise<{
    services: Array<{
      serviceId: string;
      serviceName: string;
      serviceType: string;
      usageCount: number;
      lastUsed: string;
      permissions: string[];
      status: 'active' | 'inactive' | 'suspended';
    }>;
    servicePatterns: Array<{
      pattern: string;
      frequency: number;
      description: string;
    }>;
    securityIssues: Array<{
      type: string;
      severity: 'low' | 'medium' | 'high' | 'critical';
      description: string;
      affectedServices: string[];
    }>;
  }> {
    try {
      const guard = this.initGuard();
      const analysis = await (guard as any).getUserServiceAnalysis(userId, params as any);
      
      return {
        services: analysis?.services || [],
        servicePatterns: analysis?.servicePatterns || [],
        securityIssues: analysis?.securityIssues || []
      };
    } catch (error) {
      console.error('获取用户服务分析失败:', error);
      return {
        services: [],
        servicePatterns: [],
        securityIssues: []
      };
    }
  }

  /**
   * 获取用户资源分析（管理员功能）
   */
  async getUserResourceAnalysis(userId: string, params: {
    startDate?: string;
    endDate?: string;
  } = {}): Promise<{
    resources: Array<{
      resourceId: string;
      resourceName: string;
      resourceType: string;
      usageCount: number;
      lastUsed: string;
      permissions: string[];
      quota: {
        limit: number;
        used: number;
        remaining: number;
      };
    }>;
    resourcePatterns: Array<{
      pattern: string;
      frequency: number;
      description: string;
    }>;
    securityIssues: Array<{
      type: string;
      severity: 'low' | 'medium' | 'high' | 'critical';
      description: string;
      affectedResources: string[];
    }>;
  }> {
    try {
      const guard = this.initGuard();
      const analysis = await (guard as any).getUserResourceAnalysis(userId, params as any);
      
      return {
        resources: analysis?.resources || [],
        resourcePatterns: analysis?.resourcePatterns || [],
        securityIssues: analysis?.securityIssues || []
      };
    } catch (error) {
      console.error('获取用户资源分析失败:', error);
      return {
        resources: [],
        resourcePatterns: [],
        securityIssues: []
      };
    }
  }

  /**
   * 获取用户权限分析（管理员功能）
   */
  async getUserPermissionAnalysis(userId: string, params: {
    startDate?: string;
    endDate?: string;
  } = {}): Promise<{
    permissions: Array<{
      permissionId: string;
      permissionName: string;
      permissionType: string;
      grantedAt: string;
      grantedBy: string;
      status: 'active' | 'inactive' | 'expired';
      scope: string;
    }>;
    permissionPatterns: Array<{
      pattern: string;
      frequency: number;
      description: string;
    }>;
    securityIssues: Array<{
      type: string;
      severity: 'low' | 'medium' | 'high' | 'critical';
      description: string;
      affectedPermissions: string[];
    }>;
  }> {
    try {
      const guard = this.initGuard();
      const analysis = await (guard as any).getUserPermissionAnalysis(userId, params as any);
      
      return {
        permissions: analysis?.permissions || [],
        permissionPatterns: analysis?.permissionPatterns || [],
        securityIssues: analysis?.securityIssues || []
      };
    } catch (error) {
      console.error('获取用户权限分析失败:', error);
      return {
        permissions: [],
        permissionPatterns: [],
        securityIssues: []
      };
    }
  }

  /**
   * 获取用户角色分析（管理员功能）
   */
  async getUserRoleAnalysis(userId: string, params: {
    startDate?: string;
    endDate?: string;
  } = {}): Promise<{
    roles: Array<{
      roleId: string;
      roleName: string;
      roleType: string;
      assignedAt: string;
      assignedBy: string;
      status: 'active' | 'inactive' | 'expired';
      scope: string;
    }>;
    rolePatterns: Array<{
      pattern: string;
      frequency: number;
      description: string;
    }>;
    securityIssues: Array<{
      type: string;
      severity: 'low' | 'medium' | 'high' | 'critical';
      description: string;
      affectedRoles: string[];
    }>;
  }> {
    try {
      const guard = this.initGuard();
      const analysis = await (guard as any).getUserRoleAnalysis(userId, params as any);
      
      return {
        roles: analysis?.roles || [],
        rolePatterns: analysis?.rolePatterns || [],
        securityIssues: analysis?.securityIssues || []
      };
    } catch (error) {
      console.error('获取用户角色分析失败:', error);
      return {
        roles: [],
        rolePatterns: [],
        securityIssues: []
      };
    }
  }

  /**
   * 获取用户组分析（管理员功能）
   */
  async getUserGroupAnalysis(userId: string, params: {
    startDate?: string;
    endDate?: string;
  } = {}): Promise<{
    groups: Array<{
      groupId: string;
      groupName: string;
      groupType: string;
      joinedAt: string;
      status: 'active' | 'inactive' | 'pending';
      role: string;
    }>;
    groupPatterns: Array<{
      pattern: string;
      frequency: number;
      description: string;
    }>;
    securityIssues: Array<{
      type: string;
      severity: 'low' | 'medium' | 'high' | 'critical';
      description: string;
      affectedGroups: string[];
    }>;
  }> {
    try {
      const guard = this.initGuard();
      const analysis = await (guard as any).getUserGroupAnalysis(userId, params as any);
      
      return {
        groups: analysis?.groups || [],
        groupPatterns: analysis?.groupPatterns || [],
        securityIssues: analysis?.securityIssues || []
      };
    } catch (error) {
      console.error('获取用户组分析失败:', error);
      return {
        groups: [],
        groupPatterns: [],
        securityIssues: []
      };
    }
  }

  /**
   * 获取用户组织分析（管理员功能）
   */
  async getUserOrganizationAnalysis(userId: string, params: {
    startDate?: string;
    endDate?: string;
  } = {}): Promise<{
    organizations: Array<{
      orgId: string;
      orgName: string;
      orgType: string;
      joinedAt: string;
      status: 'active' | 'inactive' | 'pending';
      role: string;
      department: string;
    }>;
    orgPatterns: Array<{
      pattern: string;
      frequency: number;
      description: string;
    }>;
    securityIssues: Array<{
      type: string;
      severity: 'low' | 'medium' | 'high' | 'critical';
      description: string;
      affectedOrganizations: string[];
    }>;
  }> {
    try {
      const guard = this.initGuard();
      const analysis = await (guard as any).getUserOrganizationAnalysis(userId, params as any);
      
      return {
        organizations: analysis?.organizations || [],
        orgPatterns: analysis?.orgPatterns || [],
        securityIssues: analysis?.securityIssues || []
      };
    } catch (error) {
      console.error('获取用户组织分析失败:', error);
      return {
        organizations: [],
        orgPatterns: [],
        securityIssues: []
      };
    }
  }

  /**
   * 获取用户项目分析（管理员功能）
   */
  async getUserProjectAnalysis(userId: string, params: {
    startDate?: string;
    endDate?: string;
  } = {}): Promise<{
    projects: Array<{
      projectId: string;
      projectName: string;
      projectType: string;
      joinedAt: string;
      status: 'active' | 'inactive' | 'completed';
      role: string;
      contribution: number;
    }>;
    projectPatterns: Array<{
      pattern: string;
      frequency: number;
      description: string;
    }>;
    securityIssues: Array<{
      type: string;
      severity: 'low' | 'medium' | 'high' | 'critical';
      description: string;
      affectedProjects: string[];
    }>;
  }> {
    try {
      const guard = this.initGuard();
      const analysis = await (guard as any).getUserProjectAnalysis(userId, params as any);
      
      return {
        projects: analysis?.projects || [],
        projectPatterns: analysis?.projectPatterns || [],
        securityIssues: analysis?.securityIssues || []
      };
    } catch (error) {
      console.error('获取用户项目分析失败:', error);
      return {
        projects: [],
        projectPatterns: [],
        securityIssues: []
      };
    }
  }

  /**
   * 获取用户任务分析（管理员功能）
   */
  async getUserTaskAnalysis(userId: string, params: {
    startDate?: string;
    endDate?: string;
  } = {}): Promise<{
    tasks: Array<{
      taskId: string;
      taskName: string;
      taskType: string;
      assignedAt: string;
      status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
      priority: 'low' | 'medium' | 'high' | 'urgent';
      dueDate: string;
    }>;
    taskPatterns: Array<{
      pattern: string;
      frequency: number;
      description: string;
    }>;
    performanceMetrics: {
      totalTasks: number;
      completedTasks: number;
      overdueTasks: number;
      averageCompletionTime: number;
      successRate: number;
    };
  }> {
    try {
      const guard = this.initGuard();
      const analysis = await (guard as any).getUserTaskAnalysis(userId, params as any);
      
      return {
        tasks: analysis?.tasks || [],
        taskPatterns: analysis?.taskPatterns || [],
        performanceMetrics: analysis?.performanceMetrics || {
          totalTasks: 0,
          completedTasks: 0,
          overdueTasks: 0,
          averageCompletionTime: 0,
          successRate: 0
        }
      };
    } catch (error) {
      console.error('获取用户任务分析失败:', error);
      return {
        tasks: [],
        taskPatterns: [],
        performanceMetrics: {
          totalTasks: 0,
          completedTasks: 0,
          overdueTasks: 0,
          averageCompletionTime: 0,
          successRate: 0
        }
      };
    }
  }

  /**
   * 获取用户工作流分析（管理员功能）
   */
  async getUserWorkflowAnalysis(userId: string, params: {
    startDate?: string;
    endDate?: string;
  } = {}): Promise<{
    workflows: Array<{
      workflowId: string;
      workflowName: string;
      workflowType: string;
      initiatedAt: string;
      status: 'running' | 'completed' | 'failed' | 'cancelled';
      steps: Array<{
        stepId: string;
        stepName: string;
        status: 'pending' | 'running' | 'completed' | 'failed';
        startTime: string;
        endTime?: string;
      }>;
    }>;
    workflowPatterns: Array<{
      pattern: string;
      frequency: number;
      description: string;
    }>;
    performanceMetrics: {
      totalWorkflows: number;
      completedWorkflows: number;
      failedWorkflows: number;
      averageExecutionTime: number;
      successRate: number;
    };
  }> {
    try {
      const guard = this.initGuard();
      const analysis = await (guard as any).getUserWorkflowAnalysis(userId, params as any);
      
      return {
        workflows: analysis?.workflows || [],
        workflowPatterns: analysis?.workflowPatterns || [],
        performanceMetrics: analysis?.performanceMetrics || {
          totalWorkflows: 0,
          completedWorkflows: 0,
          failedWorkflows: 0,
          averageExecutionTime: 0,
          successRate: 0
        }
      };
    } catch (error) {
      console.error('获取用户工作流分析失败:', error);
      return {
        workflows: [],
        workflowPatterns: [],
        performanceMetrics: {
          totalWorkflows: 0,
          completedWorkflows: 0,
          failedWorkflows: 0,
          averageExecutionTime: 0,
          successRate: 0
        }
      };
    }
  }

  /**
   * 获取用户报告分析（管理员功能）
   */
  async getUserReportAnalysis(userId: string, params: {
    startDate?: string;
    endDate?: string;
  } = {}): Promise<{
    reports: Array<{
      reportId: string;
      reportName: string;
      reportType: string;
      generatedAt: string;
      status: 'generating' | 'completed' | 'failed';
      format: 'pdf' | 'excel' | 'csv' | 'json';
      size: number;
    }>;
    reportPatterns: Array<{
      pattern: string;
      frequency: number;
      description: string;
    }>;
    performanceMetrics: {
      totalReports: number;
      completedReports: number;
      failedReports: number;
      averageGenerationTime: number;
      successRate: number;
    };
  }> {
    try {
      const guard = this.initGuard();
      const analysis = await (guard as any).getUserReportAnalysis(userId, params as any);
      
      return {
        reports: analysis?.reports || [],
        reportPatterns: analysis?.reportPatterns || [],
        performanceMetrics: analysis?.performanceMetrics || {
          totalReports: 0,
          completedReports: 0,
          failedReports: 0,
          averageGenerationTime: 0,
          successRate: 0
        }
      };
    } catch (error) {
      console.error('获取用户报告分析失败:', error);
      return {
        reports: [],
        reportPatterns: [],
        performanceMetrics: {
          totalReports: 0,
          completedReports: 0,
          failedReports: 0,
          averageGenerationTime: 0,
          successRate: 0
        }
      };
    }
  }

  /**
   * 获取用户仪表板分析（管理员功能）
   */
  async getUserDashboardAnalysis(userId: string, params: {
    startDate?: string;
    endDate?: string;
  } = {}): Promise<{
    dashboards: Array<{
      dashboardId: string;
      dashboardName: string;
      dashboardType: string;
      createdAt: string;
      lastAccessed: string;
      accessCount: number;
      widgets: Array<{
        widgetId: string;
        widgetName: string;
        widgetType: string;
        status: 'active' | 'inactive';
      }>;
    }>;
    dashboardPatterns: Array<{
      pattern: string;
      frequency: number;
      description: string;
    }>;
    usageMetrics: {
      totalDashboards: number;
      activeDashboards: number;
      totalAccesses: number;
      averageSessionDuration: number;
      mostUsedWidgets: string[];
    };
  }> {
    try {
      const guard = this.initGuard();
      const analysis = await (guard as any).getUserDashboardAnalysis(userId, params as any);
      
      return {
        dashboards: analysis?.dashboards || [],
        dashboardPatterns: analysis?.dashboardPatterns || [],
        usageMetrics: analysis?.usageMetrics || {
          totalDashboards: 0,
          activeDashboards: 0,
          totalAccesses: 0,
          averageSessionDuration: 0,
          mostUsedWidgets: []
        }
      };
    } catch (error) {
      console.error('获取用户仪表板分析失败:', error);
      return {
        dashboards: [],
        dashboardPatterns: [],
        usageMetrics: {
          totalDashboards: 0,
          activeDashboards: 0,
          totalAccesses: 0,
          averageSessionDuration: 0,
          mostUsedWidgets: []
        }
      };
    }
  }

  /**
   * 获取用户通知分析（管理员功能）
   */
  async getUserNotificationAnalysis(userId: string, params: {
    startDate?: string;
    endDate?: string;
  } = {}): Promise<{
    notifications: Array<{
      notificationId: string;
      notificationType: string;
      title: string;
      message: string;
      sentAt: string;
      readAt?: string;
      status: 'sent' | 'delivered' | 'read' | 'failed';
      channel: 'email' | 'sms' | 'push' | 'in_app';
    }>;
    notificationPatterns: Array<{
      pattern: string;
      frequency: number;
      description: string;
    }>;
    engagementMetrics: {
      totalNotifications: number;
      readNotifications: number;
      unreadNotifications: number;
      readRate: number;
      averageReadTime: number;
      preferredChannels: string[];
    };
  }> {
    try {
      const guard = this.initGuard();
      const analysis = await (guard as any).getUserNotificationAnalysis(userId, params as any);
      
      return {
        notifications: analysis?.notifications || [],
        notificationPatterns: analysis?.notificationPatterns || [],
        engagementMetrics: analysis?.engagementMetrics || {
          totalNotifications: 0,
          readNotifications: 0,
          unreadNotifications: 0,
          readRate: 0,
          averageReadTime: 0,
          preferredChannels: []
        }
      };
    } catch (error) {
      console.error('获取用户通知分析失败:', error);
      return {
        notifications: [],
        notificationPatterns: [],
        engagementMetrics: {
          totalNotifications: 0,
          readNotifications: 0,
          unreadNotifications: 0,
          readRate: 0,
          averageReadTime: 0,
          preferredChannels: []
        }
      };
    }
  }

  /**
   * 获取用户设置分析（管理员功能）
   */
  async getUserSettingsAnalysis(userId: string, params: {
    startDate?: string;
    endDate?: string;
  } = {}): Promise<{
    settings: Array<{
      settingId: string;
      settingName: string;
      settingType: string;
      currentValue: unknown;
      defaultValue: unknown;
      lastModified: string;
      modifiedBy: string;
    }>;
    settingPatterns: Array<{
      pattern: string;
      frequency: number;
      description: string;
    }>;
    customizationMetrics: {
      totalSettings: number;
      customizedSettings: number;
      defaultSettings: number;
      customizationRate: number;
      mostCustomizedSettings: string[];
    };
  }> {
    try {
      const guard = this.initGuard();
      const analysis = await (guard as any).getUserSettingsAnalysis(userId, params as any);
      
      return {
        settings: analysis?.settings || [],
        settingPatterns: analysis?.settingPatterns || [],
        customizationMetrics: analysis?.customizationMetrics || {
          totalSettings: 0,
          customizedSettings: 0,
          defaultSettings: 0,
          customizationRate: 0,
          mostCustomizedSettings: []
        }
      };
    } catch (error) {
      console.error('获取用户设置分析失败:', error);
      return {
        settings: [],
        settingPatterns: [],
        customizationMetrics: {
          totalSettings: 0,
          customizedSettings: 0,
          defaultSettings: 0,
          customizationRate: 0,
          mostCustomizedSettings: []
        }
      };
    }
  }

  /**
   * 获取用户偏好分析（管理员功能）
   */
  async getUserPreferenceAnalysis(userId: string, params: {
    startDate?: string;
    endDate?: string;
  } = {}): Promise<{
    preferences: Array<{
      preferenceId: string;
      preferenceName: string;
      preferenceType: string;
      currentValue: unknown;
      lastModified: string;
      source: 'user' | 'system' | 'inherited';
    }>;
    preferencePatterns: Array<{
      pattern: string;
      frequency: number;
      description: string;
    }>;
    preferenceMetrics: {
      totalPreferences: number;
      userPreferences: number;
      systemPreferences: number;
      inheritedPreferences: number;
      mostChangedPreferences: string[];
    };
  }> {
    try {
      const guard = this.initGuard();
      const analysis = await (guard as any).getUserPreferenceAnalysis(userId, params as any);
      
      return {
        preferences: analysis?.preferences || [],
        preferencePatterns: analysis?.preferencePatterns || [],
        preferenceMetrics: analysis?.preferenceMetrics || {
          totalPreferences: 0,
          userPreferences: 0,
          systemPreferences: 0,
          inheritedPreferences: 0,
          mostChangedPreferences: []
        }
      };
    } catch (error) {
      console.error('获取用户偏好分析失败:', error);
      return {
        preferences: [],
        preferencePatterns: [],
        preferenceMetrics: {
          totalPreferences: 0,
          userPreferences: 0,
          systemPreferences: 0,
          inheritedPreferences: 0,
          mostChangedPreferences: []
        }
      };
    }
  }

  /**
   * 获取用户主题分析（管理员功能）
   */
  async getUserThemeAnalysis(userId: string, params: {
    startDate?: string;
    endDate?: string;
  } = {}): Promise<{
    themes: Array<{
      themeId: string;
      themeName: string;
      themeType: string;
      appliedAt: string;
      status: 'active' | 'inactive';
      customization: Record<string, unknown>;
    }>;
    themePatterns: Array<{
      pattern: string;
      frequency: number;
      description: string;
    }>;
    themeMetrics: {
      totalThemes: number;
      activeThemes: number;
      customThemes: number;
      defaultThemes: number;
      mostUsedThemes: string[];
    };
  }> {
    try {
      const guard = this.initGuard();
      const analysis = await (guard as any).getUserThemeAnalysis(userId, params as any);
      
      return {
        themes: analysis?.themes || [],
        themePatterns: analysis?.themePatterns || [],
        themeMetrics: analysis?.themeMetrics || {
          totalThemes: 0,
          activeThemes: 0,
          customThemes: 0,
          defaultThemes: 0,
          mostUsedThemes: []
        }
      };
    } catch (error) {
      console.error('获取用户主题分析失败:', error);
      return {
        themes: [],
        themePatterns: [],
        themeMetrics: {
          totalThemes: 0,
          activeThemes: 0,
          customThemes: 0,
          defaultThemes: 0,
          mostUsedThemes: []
        }
      };
    }
  }

  /**
   * 获取用户语言分析（管理员功能）
   */
  async getUserLanguageAnalysis(userId: string, params: {
    startDate?: string;
    endDate?: string;
  } = {}): Promise<{
    languages: Array<{
      languageId: string;
      languageName: string;
      languageCode: string;
      appliedAt: string;
      status: 'active' | 'inactive';
      proficiency: 'beginner' | 'intermediate' | 'advanced' | 'native';
    }>;
    languagePatterns: Array<{
      pattern: string;
      frequency: number;
      description: string;
    }>;
    languageMetrics: {
      totalLanguages: number;
      activeLanguages: number;
      primaryLanguage: string;
      secondaryLanguages: string[];
      languageSwitches: number;
    };
  }> {
    try {
      const guard = this.initGuard();
      const analysis = await (guard as any).getUserLanguageAnalysis(userId, params as any);
      
      return {
        languages: analysis?.languages || [],
        languagePatterns: analysis?.languagePatterns || [],
        languageMetrics: analysis?.languageMetrics || {
          totalLanguages: 0,
          activeLanguages: 0,
          primaryLanguage: '',
          secondaryLanguages: [],
          languageSwitches: 0
        }
      };
    } catch (error) {
      console.error('获取用户语言分析失败:', error);
      return {
        languages: [],
        languagePatterns: [],
        languageMetrics: {
          totalLanguages: 0,
          activeLanguages: 0,
          primaryLanguage: '',
          secondaryLanguages: [],
          languageSwitches: 0
        }
      };
    }
  }

  /**
   * 获取用户时区分析（管理员功能）
   */
  async getUserTimezoneAnalysis(userId: string, params: {
    startDate?: string;
    endDate?: string;
  } = {}): Promise<{
    timezones: Array<{
      timezoneId: string;
      timezoneName: string;
      timezoneOffset: string;
      appliedAt: string;
      status: 'active' | 'inactive';
      location: string;
    }>;
    timezonePatterns: Array<{
      pattern: string;
      frequency: number;
      description: string;
    }>;
    timezoneMetrics: {
      totalTimezones: number;
      activeTimezones: number;
      primaryTimezone: string;
      timezoneChanges: number;
      mostUsedTimezones: string[];
    };
  }> {
    try {
      const guard = this.initGuard();
      const analysis = await (guard as any).getUserTimezoneAnalysis(userId, params as any);
      
      return {
        timezones: analysis?.timezones || [],
        timezonePatterns: analysis?.timezonePatterns || [],
        timezoneMetrics: analysis?.timezoneMetrics || {
          totalTimezones: 0,
          activeTimezones: 0,
          primaryTimezone: '',
          timezoneChanges: 0,
          mostUsedTimezones: []
        }
      };
    } catch (error) {
      console.error('获取用户时区分析失败:', error);
      return {
        timezones: [],
        timezonePatterns: [],
        timezoneMetrics: {
          totalTimezones: 0,
          activeTimezones: 0,
          primaryTimezone: '',
          timezoneChanges: 0,
          mostUsedTimezones: []
        }
      };
    }
  }

  /**
   * 获取用户货币分析（管理员功能）
   */
  async getUserCurrencyAnalysis(userId: string, params: {
    startDate?: string;
    endDate?: string;
  } = {}): Promise<{
    currencies: Array<{
      currencyId: string;
      currencyName: string;
      currencyCode: string;
      currencySymbol: string;
      appliedAt: string;
      status: 'active' | 'inactive';
      exchangeRate: number;
    }>;
    currencyPatterns: Array<{
      pattern: string;
      frequency: number;
      description: string;
    }>;
    currencyMetrics: {
      totalCurrencies: number;
      activeCurrencies: number;
      primaryCurrency: string;
      currencyChanges: number;
      mostUsedCurrencies: string[];
    };
  }> {
    try {
      const guard = this.initGuard();
      const analysis = await (guard as any).getUserCurrencyAnalysis(userId, params as any);
      
      return {
        currencies: analysis?.currencies || [],
        currencyPatterns: analysis?.currencyPatterns || [],
        currencyMetrics: analysis?.currencyMetrics || {
          totalCurrencies: 0,
          activeCurrencies: 0,
          primaryCurrency: '',
          currencyChanges: 0,
          mostUsedCurrencies: []
        }
      };
    } catch (error) {
      console.error('获取用户货币分析失败:', error);
      return {
        currencies: [],
        currencyPatterns: [],
        currencyMetrics: {
          totalCurrencies: 0,
          activeCurrencies: 0,
          primaryCurrency: '',
          currencyChanges: 0,
          mostUsedCurrencies: []
        }
      };
    }
  }

  /**
   * 获取用户单位分析（管理员功能）
   */
  async getUserUnitAnalysis(userId: string, params: {
    startDate?: string;
    endDate?: string;
  } = {}): Promise<{
    units: Array<{
      unitId: string;
      unitName: string;
      unitType: string;
      unitSystem: string;
      appliedAt: string;
      status: 'active' | 'inactive';
      conversionFactor: number;
    }>;
    unitPatterns: Array<{
      pattern: string;
      frequency: number;
      description: string;
    }>;
    unitMetrics: {
      totalUnits: number;
      activeUnits: number;
      primaryUnitSystem: string;
      unitChanges: number;
      mostUsedUnits: string[];
    };
  }> {
    try {
      const guard = this.initGuard();
      const analysis = await (guard as any).getUserUnitAnalysis(userId, params as any);
      
      return {
        units: analysis?.units || [],
        unitPatterns: analysis?.unitPatterns || [],
        unitMetrics: analysis?.unitMetrics || {
          totalUnits: 0,
          activeUnits: 0,
          primaryUnitSystem: '',
          unitChanges: 0,
          mostUsedUnits: []
        }
      };
    } catch (error) {
      console.error('获取用户单位分析失败:', error);
      return {
        units: [],
        unitPatterns: [],
        unitMetrics: {
          totalUnits: 0,
          activeUnits: 0,
          primaryUnitSystem: '',
          unitChanges: 0,
          mostUsedUnits: []
        }
      };
    }
  }

  /**
   * 获取用户格式分析（管理员功能）
   */
  async getUserFormatAnalysis(userId: string, params: {
    startDate?: string;
    endDate?: string;
  } = {}): Promise<{
    formats: Array<{
      formatId: string;
      formatName: string;
      formatType: string;
      formatPattern: string;
      appliedAt: string;
      status: 'active' | 'inactive';
      examples: string[];
    }>;
    formatPatterns: Array<{
      pattern: string;
      frequency: number;
      description: string;
    }>;
    formatMetrics: {
      totalFormats: number;
      activeFormats: number;
      customFormats: number;
      defaultFormats: number;
      mostUsedFormats: string[];
    };
  }> {
    try {
      const guard = this.initGuard();
      const analysis = await (guard as any).getUserFormatAnalysis(userId, params as any);
      
      return {
        formats: analysis?.formats || [],
        formatPatterns: analysis?.formatPatterns || [],
        formatMetrics: analysis?.formatMetrics || {
          totalFormats: 0,
          activeFormats: 0,
          customFormats: 0,
          defaultFormats: 0,
          mostUsedFormats: []
        }
      };
    } catch (error) {
      console.error('获取用户格式分析失败:', error);
      return {
        formats: [],
        formatPatterns: [],
        formatMetrics: {
          totalFormats: 0,
          activeFormats: 0,
          customFormats: 0,
          defaultFormats: 0,
          mostUsedFormats: []
        }
      };
    }
  }

  /**
   * 获取用户布局分析（管理员功能）
   */
  async getUserLayoutAnalysis(userId: string, params: {
    startDate?: string;
    endDate?: string;
  } = {}): Promise<{
    layouts: Array<{
      layoutId: string;
      layoutName: string;
      layoutType: string;
      appliedAt: string;
      status: 'active' | 'inactive';
      configuration: Record<string, unknown>;
    }>;
    layoutPatterns: Array<{
      pattern: string;
      frequency: number;
      description: string;
    }>;
    layoutMetrics: {
      totalLayouts: number;
      activeLayouts: number;
      customLayouts: number;
      defaultLayouts: number;
      mostUsedLayouts: string[];
    };
  }> {
    try {
      const guard = this.initGuard();
      const analysis = await (guard as any).getUserLayoutAnalysis(userId, params as any);
      
      return {
        layouts: analysis?.layouts || [],
        layoutPatterns: analysis?.layoutPatterns || [],
        layoutMetrics: analysis?.layoutMetrics || {
          totalLayouts: 0,
          activeLayouts: 0,
          customLayouts: 0,
          defaultLayouts: 0,
          mostUsedLayouts: []
        }
      };
    } catch (error) {
      console.error('获取用户布局分析失败:', error);
      return {
        layouts: [],
        layoutPatterns: [],
        layoutMetrics: {
          totalLayouts: 0,
          activeLayouts: 0,
          customLayouts: 0,
          defaultLayouts: 0,
          mostUsedLayouts: []
        }
      };
    }
  }

  /**
   * 获取用户导航分析（管理员功能）
   */
  async getUserNavigationAnalysis(userId: string, params: {
    startDate?: string;
    endDate?: string;
  } = {}): Promise<{
    navigations: Array<{
      navigationId: string;
      navigationName: string;
      navigationType: string;
      appliedAt: string;
      status: 'active' | 'inactive';
      structure: Array<{
        itemId: string;
        itemName: string;
        itemType: string;
        order: number;
        visible: boolean;
      }>;
    }>;
    navigationPatterns: Array<{
      pattern: string;
      frequency: number;
      description: string;
    }>;
    navigationMetrics: {
      totalNavigations: number;
      activeNavigations: number;
      customNavigations: number;
      defaultNavigations: number;
      mostUsedNavigations: string[];
    };
  }> {
    try {
      const guard = this.initGuard();
      const analysis = await (guard as any).getUserNavigationAnalysis(userId, params as any);
      
      return {
        navigations: analysis?.navigations || [],
        navigationPatterns: analysis?.navigationPatterns || [],
        navigationMetrics: analysis?.navigationMetrics || {
          totalNavigations: 0,
          activeNavigations: 0,
          customNavigations: 0,
          defaultNavigations: 0,
          mostUsedNavigations: []
        }
      };
    } catch (error) {
      console.error('获取用户导航分析失败:', error);
      return {
        navigations: [],
        navigationPatterns: [],
        navigationMetrics: {
          totalNavigations: 0,
          activeNavigations: 0,
          customNavigations: 0,
          defaultNavigations: 0,
          mostUsedNavigations: []
        }
      };
    }
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

  /**
   * 获取用户菜单分析（管理员功能）
   */
  async getUserMenuAnalysis(userId: string, params: {
    startDate?: string;
    endDate?: string;
  } = {}): Promise<{
    menus: Array<{
      menuId: string;
      menuName: string;
      menuType: string;
      appliedAt: string;
      status: 'active' | 'inactive';
      items: Array<{
        itemId: string;
        itemName: string;
        itemType: string;
        order: number;
        visible: boolean;
        permissions: string[];
      }>;
    }>;
    menuPatterns: Array<{
      pattern: string;
      frequency: number;
      description: string;
    }>;
    menuMetrics: {
      totalMenus: number;
      activeMenus: number;
      customMenus: number;
      defaultMenus: number;
      mostUsedMenus: string[];
    };
  }> {
    try {
      const guard = this.initGuard();
      const analysis = await (guard as any).getUserMenuAnalysis(userId, params as any);
      
      return {
        menus: analysis?.menus || [],
        menuPatterns: analysis?.menuPatterns || [],
        menuMetrics: analysis?.menuMetrics || {
          totalMenus: 0,
          activeMenus: 0,
          customMenus: 0,
          defaultMenus: 0,
          mostUsedMenus: []
        }
      };
    } catch (error) {
      console.error('获取用户菜单分析失败:', error);
      return {
        menus: [],
        menuPatterns: [],
        menuMetrics: {
          totalMenus: 0,
          activeMenus: 0,
          customMenus: 0,
          defaultMenus: 0,
          mostUsedMenus: []
        }
      };
    }
  }
}

// 创建单例实例
const authingService = new AuthingService(() => {}, () => {});

export default authingService; 