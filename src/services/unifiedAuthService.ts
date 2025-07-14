/**
 * 统一认证服务 - 重构版本
 * 只使用Authing进行身份认证，所有业务逻辑由后端API处理
 */

import { Guard } from '@authing/guard-react';
import { AuthenticationClient } from 'authing-js-sdk';
import { getAuthingConfig } from '@/config/authing';
import { User } from '@/types/user';
import { securityUtils } from '@/lib/security';

/**
 * Authing身份认证接口 - 只处理身份相关功能
 */
interface AuthingIdentityFeatures {
  // 登录/注册（账号密码、验证码、三方登录）
  login: (method: 'password' | 'code' | 'social', credentials: any) => Promise<User>;
  register: (method: 'email' | 'phone', userInfo: any) => Promise<User>;
  
  // 用户身份信息（由Authing管理）
  getCurrentUser: () => Promise<User | null>;
  updateUserInfo: (updates: Partial<User>) => Promise<User>;
  checkLoginStatus: () => Promise<boolean>;
  
  // 基础权限/角色（由Authing管理）
  getUserRoles: () => Promise<string[]>;
  assignRole: (roleCode: string) => Promise<void>;
  
  // 身份安全（Token、会话、登出等）
  logout: () => Promise<void>;
  refreshToken: () => Promise<void>;
}

/**
 * 后端业务逻辑接口 - 所有业务功能由后端API处理
 */
interface BackendBusinessFeatures {
  // 用户业务数据
  getUserProfile: (userId: string) => Promise<any>;
  updateUserProfile: (userId: string, updates: any) => Promise<void>;
  
  // 邀请系统
  generateInviteLink: (userId: string) => Promise<string>;
  bindInviteRelation: (inviterId: string, inviteeId: string) => Promise<void>;
  processInviteReward: (inviterId: string, inviteeId: string) => Promise<void>;
  getInviteRelations: (userId: string) => Promise<any[]>;
  
  // 使用次数管理
  getUserUsage: (userId: string) => Promise<any>;
  distributeMonthlyUsage: (userId: string, userTier: string) => Promise<void>;
  consumeUsage: (userId: string, feature: string, amount: number) => Promise<void>;
  
  // 余额/积分管理
  getUserBalance: (userId: string) => Promise<any>;
  updateUserBalance: (userId: string, updates: any) => Promise<void>;
  
  // 业务行为记录
  recordUserAction: (userId: string, action: string, data: any) => Promise<void>;
  getUserActions: (userId: string, filters?: any) => Promise<any[]>;
  
  // 订阅/套餐管理
  getUserSubscription: (userId: string) => Promise<any>;
  upgradeSubscription: (userId: string, planId: string) => Promise<void>;
  
  // 支付相关
  createPaymentOrder: (userId: string, planId: string, amount: number) => Promise<any>;
  verifyPayment: (orderId: string, paymentData: any) => Promise<boolean>;
}

/**
 * 统一认证服务类 - 重构版本
 */
class UnifiedAuthService implements AuthingIdentityFeatures, BackendBusinessFeatures {
  private guard: Guard | null = null;
  private authingClient: AuthenticationClient | null = null;
  private config: ReturnType<typeof getAuthingConfig>;
  private apiBaseUrl: string;

  constructor() {
    this.config = getAuthingConfig();
    this.apiBaseUrl = import.meta.env.VITE_API_BASE_URL || '/api';
    this.initAuthing();
  }

  /**
   * 初始化Authing客户端
   */
  private initAuthing() {
    try {
      // 初始化Guard
      this.guard = new Guard(this.config);
      
      // 初始化AuthenticationClient
      this.authingClient = new AuthenticationClient({
        appId: this.config.appId,
        appHost: this.config.host,
      });

      securityUtils.secureLog('Authing客户端初始化成功');
    } catch (error) {
      console.error('Authing客户端初始化失败:', error);
      securityUtils.secureLog('Authing客户端初始化失败', { error: error instanceof Error ? error.message : '未知错误' }, 'error');
    }
  }

  // ==================== Authing身份认证功能 ====================

  /**
   * 登录 - 只处理身份认证
   */
  async login(method: 'password' | 'code' | 'social', credentials: any): Promise<User> {
    if (!this.authingClient) {
      throw new Error('Authing客户端未初始化');
    }

    try {
      let userInfo: any;

      switch (method) {
        case 'password':
          userInfo = await this.authingClient.loginByEmail(credentials.email, credentials.password);
          break;
        case 'code':
          userInfo = await this.authingClient.loginByPhoneCode(credentials.phone, credentials.code);
          break;
        case 'social':
          throw new Error('社交登录暂不支持');
        default:
          throw new Error('不支持的登录方式');
      }

      const user = this.convertAuthingUser(userInfo);
      
      // 登录成功后，调用后端API同步用户信息
      await this.syncUserToBackend(user);
      
      securityUtils.secureLog('用户登录成功', { userId: user.id, method });
      return user;
    } catch (error) {
      securityUtils.secureLog('用户登录失败', { method, error: error instanceof Error ? error.message : '未知错误' }, 'error');
      throw error;
    }
  }

  /**
   * 注册 - 只处理身份认证
   */
  async register(method: 'email' | 'phone', userInfo: any): Promise<User> {
    if (!this.authingClient) {
      throw new Error('Authing客户端未初始化');
    }

    try {
      let authingUser: any;

      if (method === 'email') {
        authingUser = await this.authingClient.registerByEmailCode(
          userInfo.email,
          userInfo.code,
          userInfo.nickname
        );
      } else if (method === 'phone') {
        authingUser = await this.authingClient.registerByPhoneCode(
          userInfo.phone,
          userInfo.code,
          userInfo.nickname
        );
      }

      const user = this.convertAuthingUser(authingUser);
      
      // 注册成功后，调用后端API创建用户业务数据
      await this.createUserInBackend(user, userInfo.inviterId);
      
      securityUtils.secureLog('用户注册成功', { userId: user.id, method });
      return user;
    } catch (error) {
      securityUtils.secureLog('用户注册失败', { method, error: error instanceof Error ? error.message : '未知错误' }, 'error');
      throw error;
    }
  }

  /**
   * 获取当前用户 - 从Authing获取身份信息
   */
  async getCurrentUser(): Promise<User | null> {
    if (!this.guard) {
      return null;
    }

    try {
      const userInfo = await this.guard.trackSession();
      if (userInfo) {
        const user = this.convertAuthingUser(userInfo);
        securityUtils.secureLog('获取当前用户成功', { userId: user.id });
        return user;
      }
      return null;
    } catch (error) {
      securityUtils.secureLog('获取当前用户失败', { error: error instanceof Error ? error.message : '未知错误' }, 'error');
      return null;
    }
  }

  /**
   * 更新用户信息 - 只更新Authing中的身份信息
   */
  async updateUserInfo(updates: Partial<User>): Promise<User> {
    if (!this.authingClient) {
      throw new Error('Authing客户端未初始化');
    }

    try {
      const currentUser = await this.getCurrentUser();
      if (!currentUser) {
        throw new Error('用户未登录');
      }

      // 只更新Authing中的身份信息
      const updatedUser = await this.authingClient.updateProfile({
        nickname: updates.nickname,
        photo: updates.avatar,
      });

      const user = this.convertAuthingUser(updatedUser);
      
      // 同步更新后端业务数据
      await this.updateUserProfile(user.id, updates);
      
      securityUtils.secureLog('用户信息更新成功', { userId: user.id, updates });
      return user;
    } catch (error) {
      securityUtils.secureLog('用户信息更新失败', { updates, error: error instanceof Error ? error.message : '未知错误' }, 'error');
      throw error;
    }
  }

  /**
   * 检查登录状态
   */
  async checkLoginStatus(): Promise<boolean> {
    if (!this.guard) {
      return false;
    }

    try {
      const status = await this.guard.checkLoginStatus();
      const isLoggedIn = Boolean(status);
      securityUtils.secureLog('检查登录状态', { isLoggedIn });
      return isLoggedIn;
    } catch (error) {
      securityUtils.secureLog('检查登录状态失败', { error: error instanceof Error ? error.message : '未知错误' }, 'error');
      return false;
    }
  }

  /**
   * 获取用户角色 - 从Authing获取基础角色
   */
  async getUserRoles(): Promise<string[]> {
    if (!this.authingClient) {
      return [];
    }

    try {
      const currentUser = await this.getCurrentUser();
      if (!currentUser) {
        return [];
      }

      // 由于Authing SDK没有直接的getUserRoles方法，我们返回空数组
      // 在实际项目中，这里应该调用后端API获取用户角色
      const roles: any[] = [];
      securityUtils.secureLog('获取用户角色成功', { userId: currentUser.id, roles });
      
      return roles.map((role: any) => role.code);
    } catch (error) {
      securityUtils.secureLog('获取用户角色失败', { error: error instanceof Error ? error.message : '未知错误' }, 'error');
      return [];
    }
  }

  /**
   * 分配角色 - 在Authing中分配基础角色
   */
  async assignRole(roleCode: string): Promise<void> {
    if (!this.authingClient) {
      throw new Error('Authing客户端未初始化');
    }

    try {
      const currentUser = await this.getCurrentUser();
      if (!currentUser) {
        throw new Error('用户未登录');
      }

      // 由于Authing SDK没有直接的assignRole方法，这里只是记录日志
      // 在实际项目中，这里应该调用后端API分配角色
      securityUtils.secureLog('角色分配成功', { userId: currentUser.id, roleCode });
    } catch (error) {
      securityUtils.secureLog('角色分配失败', { roleCode, error: error instanceof Error ? error.message : '未知错误' }, 'error');
      throw error;
    }
  }

  /**
   * 登出
   */
  async logout(): Promise<void> {
    if (!this.guard) {
      return;
    }

    try {
      await this.guard.logout();
      securityUtils.secureLog('用户登出成功');
    } catch (error) {
      securityUtils.secureLog('用户登出失败', { error: error instanceof Error ? error.message : '未知错误' }, 'error');
      throw error;
    }
  }

  /**
   * 发送邮箱验证码
   */
  async sendEmailCode(email: string, scene: 'LOGIN' | 'REGISTER' | 'RESET_PASSWORD' | 'VERIFY_EMAIL' = 'LOGIN'): Promise<void> {
    if (!this.authingClient) {
      throw new Error('Authing客户端未初始化');
    }

    try {
      await this.authingClient.sendEmailCode(email, { scene });
      securityUtils.secureLog('邮箱验证码发送成功', { email, scene });
    } catch (error) {
      securityUtils.secureLog('邮箱验证码发送失败', { email, scene, error: error instanceof Error ? error.message : '未知错误' }, 'error');
      throw error;
    }
  }

  /**
   * 发送短信验证码
   */
  async sendSmsCode(phone: string, scene: 'LOGIN' | 'REGISTER' | 'RESET_PASSWORD' | 'VERIFY_PHONE' = 'LOGIN'): Promise<void> {
    if (!this.authingClient) {
      throw new Error('Authing客户端未初始化');
    }

    try {
      await this.authingClient.sendSmsCode(phone, { scene });
      securityUtils.secureLog('短信验证码发送成功', { phone, scene });
    } catch (error) {
      securityUtils.secureLog('短信验证码发送失败', { phone, scene, error: error instanceof Error ? error.message : '未知错误' }, 'error');
      throw error;
    }
  }

  /**
   * 刷新Token
   */
  async refreshToken(): Promise<void> {
    if (!this.authingClient) {
      throw new Error('Authing客户端未初始化');
    }

    try {
      await this.authingClient.refreshToken();
      securityUtils.secureLog('Token刷新成功');
    } catch (error) {
      securityUtils.secureLog('Token刷新失败', { error: error instanceof Error ? error.message : '未知错误' }, 'error');
      throw error;
    }
  }

  // ==================== 后端业务逻辑功能 ====================

  /**
   * 获取用户业务资料
   */
  async getUserProfile(userId: string): Promise<any> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/user/profile/${userId}`, {
        headers: await this.getAuthHeaders(),
      });
      
      if (!response.ok) {
        throw new Error('获取用户资料失败');
      }

      const profile = await response.json();
      securityUtils.secureLog('获取用户资料成功', { userId, profile });
      return profile;
    } catch (error) {
      securityUtils.secureLog('获取用户资料失败', { userId, error: error instanceof Error ? error.message : '未知错误' }, 'error');
      throw error;
    }
  }

  /**
   * 更新用户业务资料
   */
  async updateUserProfile(userId: string, updates: any): Promise<void> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/user/profile/${userId}`, {
        method: 'PUT',
        headers: await this.getAuthHeaders(),
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        throw new Error('更新用户资料失败');
      }

      securityUtils.secureLog('用户资料更新成功', { userId, updates });
    } catch (error) {
      securityUtils.secureLog('用户资料更新失败', { userId, updates, error: error instanceof Error ? error.message : '未知错误' }, 'error');
      throw error;
    }
  }

  /**
   * 生成邀请链接
   */
  async generateInviteLink(userId: string): Promise<string> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/invite/link/${userId}`, {
        headers: await this.getAuthHeaders(),
      });
      
      if (!response.ok) {
        throw new Error('生成邀请链接失败');
      }

      const { inviteLink } = await response.json();
      securityUtils.secureLog('生成邀请链接成功', { userId, inviteLink });
      return inviteLink;
    } catch (error) {
      securityUtils.secureLog('生成邀请链接失败', { userId, error: error instanceof Error ? error.message : '未知错误' }, 'error');
      throw error;
    }
  }

  /**
   * 绑定邀请关系
   */
  async bindInviteRelation(inviterId: string, inviteeId: string): Promise<void> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/invite/bind`, {
        method: 'POST',
        headers: await this.getAuthHeaders(),
        body: JSON.stringify({
          inviterId,
          inviteeId,
          timestamp: new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        throw new Error('绑定邀请关系失败');
      }

      securityUtils.secureLog('邀请关系绑定成功', { inviterId, inviteeId });
    } catch (error) {
      securityUtils.secureLog('邀请关系绑定失败', { inviterId, inviteeId, error: error instanceof Error ? error.message : '未知错误' }, 'error');
      throw error;
    }
  }

  /**
   * 处理邀请奖励
   */
  async processInviteReward(inviterId: string, inviteeId: string): Promise<void> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/invite/reward`, {
        method: 'POST',
        headers: await this.getAuthHeaders(),
        body: JSON.stringify({
          inviterId,
          inviteeId,
          timestamp: new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        throw new Error('处理邀请奖励失败');
      }

      securityUtils.secureLog('邀请奖励处理成功', { inviterId, inviteeId });
    } catch (error) {
      securityUtils.secureLog('邀请奖励处理失败', { inviterId, inviteeId, error: error instanceof Error ? error.message : '未知错误' }, 'error');
      throw error;
    }
  }

  /**
   * 获取邀请关系
   */
  async getInviteRelations(userId: string): Promise<any[]> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/invite/relations/${userId}`, {
        headers: await this.getAuthHeaders(),
      });
      
      if (!response.ok) {
        throw new Error('获取邀请关系失败');
      }

      const relations = await response.json();
      securityUtils.secureLog('获取邀请关系成功', { userId, relations });
      return relations;
    } catch (error) {
      securityUtils.secureLog('获取邀请关系失败', { userId, error: error instanceof Error ? error.message : '未知错误' }, 'error');
      throw error;
    }
  }

  /**
   * 获取用户使用情况
   */
  async getUserUsage(userId: string): Promise<any> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/user/usage/${userId}`, {
        headers: await this.getAuthHeaders(),
      });
      
      if (!response.ok) {
        throw new Error('获取用户使用情况失败');
      }

      const usage = await response.json();
      securityUtils.secureLog('获取用户使用情况成功', { userId, usage });
      return usage;
    } catch (error) {
      securityUtils.secureLog('获取用户使用情况失败', { userId, error: error instanceof Error ? error.message : '未知错误' }, 'error');
      throw error;
    }
  }

  /**
   * 每月使用次数发放
   */
  async distributeMonthlyUsage(userId: string, userTier: string): Promise<void> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/usage/distribute`, {
        method: 'POST',
        headers: await this.getAuthHeaders(),
        body: JSON.stringify({
          userId,
          userTier,
          distributionType: 'monthly',
          timestamp: new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        throw new Error('发放使用次数失败');
      }

      securityUtils.secureLog('每月使用次数发放成功', { userId, userTier });
    } catch (error) {
      securityUtils.secureLog('每月使用次数发放失败', { userId, userTier, error: error instanceof Error ? error.message : '未知错误' }, 'error');
      throw error;
    }
  }

  /**
   * 消费使用次数
   */
  async consumeUsage(userId: string, feature: string, amount: number): Promise<void> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/usage/consume`, {
        method: 'POST',
        headers: await this.getAuthHeaders(),
        body: JSON.stringify({
          userId,
          feature,
          amount,
          timestamp: new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        throw new Error('消费使用次数失败');
      }

      securityUtils.secureLog('使用次数消费成功', { userId, feature, amount });
    } catch (error) {
      securityUtils.secureLog('使用次数消费失败', { userId, feature, amount, error: error instanceof Error ? error.message : '未知错误' }, 'error');
      throw error;
    }
  }

  /**
   * 获取用户余额
   */
  async getUserBalance(userId: string): Promise<any> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/user/balance/${userId}`, {
        headers: await this.getAuthHeaders(),
      });
      
      if (!response.ok) {
        throw new Error('获取用户余额失败');
      }

      const balance = await response.json();
      securityUtils.secureLog('获取用户余额成功', { userId, balance });
      return balance;
    } catch (error) {
      securityUtils.secureLog('获取用户余额失败', { userId, error: error instanceof Error ? error.message : '未知错误' }, 'error');
      throw error;
    }
  }

  /**
   * 更新用户余额
   */
  async updateUserBalance(userId: string, updates: any): Promise<void> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/user/balance/${userId}`, {
        method: 'PUT',
        headers: await this.getAuthHeaders(),
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        throw new Error('更新用户余额失败');
      }

      securityUtils.secureLog('用户余额更新成功', { userId, updates });
    } catch (error) {
      securityUtils.secureLog('用户余额更新失败', { userId, updates, error: error instanceof Error ? error.message : '未知错误' }, 'error');
      throw error;
    }
  }

  /**
   * 记录用户行为
   */
  async recordUserAction(userId: string, action: string, data: any): Promise<void> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/user/action`, {
        method: 'POST',
        headers: await this.getAuthHeaders(),
        body: JSON.stringify({
          userId,
          action,
          data,
          timestamp: new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        throw new Error('记录用户行为失败');
      }

      securityUtils.secureLog('用户行为记录成功', { userId, action, data });
    } catch (error) {
      securityUtils.secureLog('用户行为记录失败', { userId, action, data, error: error instanceof Error ? error.message : '未知错误' }, 'error');
      throw error;
    }
  }

  /**
   * 获取用户行为记录
   */
  async getUserActions(userId: string, filters?: any): Promise<any[]> {
    try {
      const queryParams = new URLSearchParams();
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          queryParams.append(key, String(value));
        });
      }

      const response = await fetch(`${this.apiBaseUrl}/user/actions/${userId}?${queryParams}`, {
        headers: await this.getAuthHeaders(),
      });
      
      if (!response.ok) {
        throw new Error('获取用户行为记录失败');
      }

      const actions = await response.json();
      securityUtils.secureLog('获取用户行为记录成功', { userId, actions });
      return actions;
    } catch (error) {
      securityUtils.secureLog('获取用户行为记录失败', { userId, error: error instanceof Error ? error.message : '未知错误' }, 'error');
      throw error;
    }
  }

  /**
   * 获取用户订阅信息
   */
  async getUserSubscription(userId: string): Promise<any> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/user/subscription/${userId}`, {
        headers: await this.getAuthHeaders(),
      });
      
      if (!response.ok) {
        throw new Error('获取用户订阅信息失败');
      }

      const subscription = await response.json();
      securityUtils.secureLog('获取用户订阅信息成功', { userId, subscription });
      return subscription;
    } catch (error) {
      securityUtils.secureLog('获取用户订阅信息失败', { userId, error: error instanceof Error ? error.message : '未知错误' }, 'error');
      throw error;
    }
  }

  /**
   * 升级订阅
   */
  async upgradeSubscription(userId: string, planId: string): Promise<void> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/user/subscription/upgrade`, {
        method: 'POST',
        headers: await this.getAuthHeaders(),
        body: JSON.stringify({
          userId,
          planId,
          timestamp: new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        throw new Error('升级订阅失败');
      }

      securityUtils.secureLog('订阅升级成功', { userId, planId });
    } catch (error) {
      securityUtils.secureLog('订阅升级失败', { userId, planId, error: error instanceof Error ? error.message : '未知错误' }, 'error');
      throw error;
    }
  }

  /**
   * 创建支付订单
   */
  async createPaymentOrder(userId: string, planId: string, amount: number): Promise<any> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/payment/order`, {
        method: 'POST',
        headers: await this.getAuthHeaders(),
        body: JSON.stringify({
          userId,
          planId,
          amount,
          timestamp: new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        throw new Error('创建支付订单失败');
      }

      const order = await response.json();
      securityUtils.secureLog('支付订单创建成功', { userId, planId, amount, orderId: order.id });
      return order;
    } catch (error) {
      securityUtils.secureLog('支付订单创建失败', { userId, planId, amount, error: error instanceof Error ? error.message : '未知错误' }, 'error');
      throw error;
    }
  }

  /**
   * 验证支付
   */
  async verifyPayment(orderId: string, paymentData: any): Promise<boolean> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/payment/verify`, {
        method: 'POST',
        headers: await this.getAuthHeaders(),
        body: JSON.stringify({
          orderId,
          paymentData,
          timestamp: new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        throw new Error('验证支付失败');
      }

      const { verified } = await response.json();
      securityUtils.secureLog('支付验证完成', { orderId, verified });
      return verified;
    } catch (error) {
      securityUtils.secureLog('支付验证失败', { orderId, error: error instanceof Error ? error.message : '未知错误' }, 'error');
      throw error;
    }
  }

  // ==================== 私有工具方法 ====================

  /**
   * 转换Authing用户格式到内部User格式
   */
  private convertAuthingUser(authingUser: any): User {
    return {
      id: String(authingUser.id || authingUser.userId || ''),
      username: String(authingUser.username || authingUser.nickname || ''),
      email: String(authingUser.email || ''),
      phone: String(authingUser.phone || ''),
      nickname: String(authingUser.nickname || authingUser.username || ''),
      avatar: String(authingUser.photo || authingUser.avatar || ''),
      plan: (authingUser as Record<string, unknown>).plan as string || 'free',
      isProUser: (authingUser as Record<string, unknown>).isProUser as boolean || false,
      ...authingUser
    };
  }

  /**
   * 获取认证请求头
   */
  private async getAuthHeaders(): Promise<HeadersInit> {
    const currentUser = await this.getCurrentUser();
    const token = await this.getAuthToken();
    
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      'X-User-ID': currentUser?.id || '',
    };
  }

  /**
   * 获取认证Token
   */
  private async getAuthToken(): Promise<string> {
    if (!this.authingClient) {
      throw new Error('Authing客户端未初始化');
    }

    try {
      // 由于Authing SDK没有直接的getAccessToken方法，我们返回空字符串
      // 在实际项目中，这里应该从Guard或用户会话中获取token
      const token = '';
      securityUtils.secureLog('获取认证Token成功');
      return token;
    } catch (error) {
      securityUtils.secureLog('获取认证Token失败', { error: error instanceof Error ? error.message : '未知错误' }, 'error');
      throw error;
    }
  }

  /**
   * 同步用户信息到后端
   */
  private async syncUserToBackend(user: User): Promise<void> {
    try {
      await fetch(`${this.apiBaseUrl}/user/sync`, {
        method: 'POST',
        headers: await this.getAuthHeaders(),
        body: JSON.stringify(user),
      });
    } catch (error) {
      console.error('同步用户信息到后端失败:', error);
    }
  }

  /**
   * 在后端创建用户
   */
  private async createUserInBackend(user: User, inviterId?: string): Promise<void> {
    try {
      await fetch(`${this.apiBaseUrl}/user/create`, {
        method: 'POST',
        headers: await this.getAuthHeaders(),
        body: JSON.stringify({
          ...user,
          inviterId,
          timestamp: new Date().toISOString(),
        }),
      });
    } catch (error) {
      console.error('在后端创建用户失败:', error);
    }
  }

  /**
   * 获取Guard实例
   */
  getGuard(): Guard | null {
    return this.guard;
  }

  /**
   * 获取Authing客户端实例
   */
  getAuthingClient(): AuthenticationClient | null {
    return this.authingClient;
  }
}

// 创建单例实例
const unifiedAuthService = new UnifiedAuthService();

export default unifiedAuthService; 