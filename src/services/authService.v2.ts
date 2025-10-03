/**
 * 🔐 认证服务 v2.0
 *
 * 职责:
 * - 连接真实Authing API
 * - 数据格式转换
 * - 错误处理
 *
 * 改进:
 * ✅ 使用统一类型系统
 * ✅ 移除本地Mock逻辑
 * ✅ 简化接口
 * ✅ 更好的错误处理
 */

import { AuthenticationClient, EmailScene } from 'authing-js-sdk';
import { getAuthingConfig } from '@/config/authing';
import {
  UserInfo,
  LoginResponse,
  RegisterResponse
} from '@/types/auth-types';

/**
 * 更新资料响应
 */
export interface UpdateProfileResponse {
  success: boolean;
  message: string;
  user?: UserInfo;
}

class AuthService {
  private authClient: AuthenticationClient | null = null;

  /**
   * 初始化Authing认证客户端
   */
  private async initAuthClient(): Promise<AuthenticationClient> {
    if (this.authClient) {
      return this.authClient;
    }

    try {
      const config = getAuthingConfig();

      this.authClient = new AuthenticationClient({
        appId: config.appId,
        appHost: config.host
      });

      console.log('✅ Authing客户端初始化成功');
      return this.authClient;
    } catch (error) {
      console.error('❌ Authing客户端初始化失败:', error);
      throw new Error('认证服务初始化失败');
    }
  }

  /**
   * 格式化Authing用户信息为标准UserInfo
   */
  private formatUserInfo(authingUser: any): UserInfo {
    const userId = authingUser.id || authingUser.userId || authingUser.sub;
    if (!userId) {
      throw new Error('Authing未返回有效用户ID');
    }

    return {
      id: userId,
      username: authingUser.username || authingUser.name || '',
      email: authingUser.email || authingUser.emailAddress || '',
      phone: authingUser.phone || authingUser.phoneNumber || '',
      nickname: authingUser.nickname || authingUser.name || authingUser.username || '',
      avatar: authingUser.avatar || authingUser.photo || authingUser.picture || '',
      loginTime: new Date().toISOString(),
      loginMethod: 'password',
      roles: Array.isArray(authingUser.roles) ? authingUser.roles : ['user'],
      permissions: Array.isArray(authingUser.permissions) ? authingUser.permissions : ['basic'],
      subscription: {
        tier: 'free',
        status: 'active',
        features: ['basic']
      }
    };
  }

  /**
   * 密码登录
   */
  async loginByPassword(username: string, password: string): Promise<LoginResponse> {
    try {
      if (!username || !password) {
        return {
          success: false,
          message: '用户名和密码不能为空'
        };
      }

      const client = await this.initAuthClient();

      // 判断登录方式
      const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(username);
      const isPhone = /^1[3-9]\d{9}$/.test(username);

      let result;
      if (isEmail) {
        result = await client.loginByEmail(username, password);
      } else if (isPhone) {
        result = await client.loginByPhonePassword(username, password);
      } else {
        result = await client.loginByUsername(username, password);
      }

      console.log('✅ 登录成功:', result);

      return {
        success: true,
        message: '登录成功',
        user: this.formatUserInfo(result),
        token: {
          accessToken: result.token || (result as any).access_token,
          refreshToken: (result as any).refresh_token,
          expiresAt: Date.now() + (24 * 60 * 60 * 1000), // 24小时
          source: 'authing',
          userId: this.formatUserInfo(result).id
        }
      };
    } catch (error: any) {
      console.error('❌ 登录失败:', error);

      let errorMessage = '登录失败';
      if (error?.message) {
        if (error.message.includes('password')) {
          errorMessage = '用户名或密码错误';
        } else if (error.message.includes('user')) {
          errorMessage = '用户不存在';
        } else if (error.message.includes('locked')) {
          errorMessage = '账户已被锁定';
        } else {
          errorMessage = error.message;
        }
      }

      return {
        success: false,
        message: errorMessage,
        error: {
          code: error.code || 'LOGIN_ERROR',
          type: 'authentication',
          details: error
        }
      };
    }
  }

  /**
   * 更新用户资料
   */
  async updateProfile(updates: Partial<UserInfo>): Promise<UpdateProfileResponse> {
    try {
      const client = await this.initAuthClient();

      // 构建Authing格式的更新数据
      const updateData: any = {};

      if (updates.nickname) updateData.nickname = updates.nickname;
      if (updates.avatar) updateData.photo = updates.avatar;
      if (updates.email) updateData.email = updates.email;
      if (updates.phone) updateData.phone = updates.phone;

      if (Object.keys(updateData).length === 0) {
        return {
          success: false,
          message: '没有需要更新的字段'
        };
      }

      const result = await client.updateProfile(updateData);

      console.log('✅ 用户资料更新成功:', result);

      return {
        success: true,
        message: '更新成功',
        user: this.formatUserInfo(result)
      };
    } catch (error: any) {
      console.error('❌ 用户资料更新失败:', error);

      let errorMessage = '更新失败';
      if (error?.message) {
        if (error.message.includes('email')) {
          errorMessage = '邮箱格式错误或已被使用';
        } else if (error.message.includes('phone')) {
          errorMessage = '手机号格式错误或已被使用';
        } else if (error.message.includes('unauthorized')) {
          errorMessage = '权限不足';
        } else {
          errorMessage = error.message;
        }
      }

      throw new Error(errorMessage);
    }
  }

  /**
   * 获取当前用户信息
   */
  async getCurrentUser(): Promise<UserInfo | null> {
    try {
      const client = await this.initAuthClient();

      const userInfo = await client.getCurrentUser();

      if (!userInfo) {
        return null;
      }

      console.log('✅ 获取用户信息成功:', userInfo);

      return this.formatUserInfo(userInfo);
    } catch (error: any) {
      console.error('❌ 获取用户信息失败:', error);

      if (error?.message?.includes('unauthorized')) {
        return null;
      }

      throw new Error(`获取用户信息失败: ${error.message}`);
    }
  }

  /**
   * 修改密码
   */
  async changePassword(oldPassword: string, newPassword: string): Promise<UpdateProfileResponse> {
    try {
      if (!oldPassword || !newPassword) {
        return {
          success: false,
          message: '旧密码和新密码不能为空'
        };
      }

      if (newPassword.length < 6) {
        return {
          success: false,
          message: '新密码长度至少6位'
        };
      }

      const client = await this.initAuthClient();

      await client.updatePassword(newPassword, oldPassword);

      console.log('✅ 密码修改成功');

      return {
        success: true,
        message: '密码修改成功'
      };
    } catch (error: any) {
      console.error('❌ 密码修改失败:', error);

      let errorMessage = '密码修改失败';
      if (error?.message) {
        if (error.message.includes('old password')) {
          errorMessage = '旧密码错误';
        } else if (error.message.includes('policy')) {
          errorMessage = '新密码不符合安全策略';
        } else {
          errorMessage = error.message;
        }
      }

      throw new Error(errorMessage);
    }
  }

  /**
   * 发送邮箱验证码
   */
  async sendEmailCode(email: string): Promise<void> {
    try {
      if (!email || !email.trim()) {
        throw new Error('邮箱地址不能为空');
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        throw new Error('邮箱格式不正确');
      }

      const client = await this.initAuthClient();

      await client.sendEmail(email, EmailScene.LOGIN_VERIFY_CODE);

      console.log('✅ 邮箱验证码发送成功');
    } catch (error: any) {
      console.error('❌ 邮箱验证码发送失败:', error);

      let errorMessage = '验证码发送失败';
      if (error?.message) {
        if (error.message.includes('email')) {
          errorMessage = '邮箱格式错误';
        } else if (error.message.includes('frequency')) {
          errorMessage = '发送频率过高，请稍后重试';
        } else if (error.message.includes('quota')) {
          errorMessage = '发送次数已达上限';
        } else {
          errorMessage = error.message;
        }
      }

      throw new Error(errorMessage);
    }
  }

  /**
   * 发送手机验证码
   */
  async sendPhoneCode(phone: string): Promise<void> {
    try {
      if (!phone || !phone.trim()) {
        throw new Error('手机号不能为空');
      }

      const phoneRegex = /^1[3-9]\d{9}$/;
      if (!phoneRegex.test(phone)) {
        throw new Error('手机号格式不正确');
      }

      const client = await this.initAuthClient();

      await client.sendSmsCode(phone);

      console.log('✅ 手机验证码发送成功');
    } catch (error: any) {
      console.error('❌ 手机验证码发送失败:', error);

      let errorMessage = '验证码发送失败';
      if (error?.message) {
        if (error.message.includes('phone')) {
          errorMessage = '手机号格式错误';
        } else if (error.message.includes('frequency')) {
          errorMessage = '发送频率过高，请稍后重试';
        } else if (error.message.includes('quota')) {
          errorMessage = '发送次数已达上限';
        } else {
          errorMessage = error.message;
        }
      }

      throw new Error(errorMessage);
    }
  }

  /**
   * 登出
   */
  async logout(): Promise<void> {
    try {
      const client = await this.initAuthClient();

      await client.logout();

      console.log('✅ 登出成功');
    } catch (error: any) {
      console.error('❌ 登出失败:', error);
      // 登出失败不影响本地清理
    }
  }
}

// 导出单例
export const authService = new AuthService();
export default authService;
