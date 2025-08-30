/**
 * 认证服务 - 连接真实Authing API
 * 严格遵循api_prohibit_local_mock_error规则
 */

import { AuthenticationClient } from 'authing-js-sdk';
import { getAuthingConfig } from '@/config/authing';

export interface AuthUser {
  id: string;
  username?: string;
  email?: string;
  phone?: string;
  nickname?: string;
  avatar?: string;
  loginTime?: string;
  roles?: string[];
  permissions?: string[];
}

export interface LoginResponse {
  success: boolean;
  message: string;
  user?: AuthUser;
  token?: string;
}

export interface UpdateProfileResponse {
  success: boolean;
  message: string;
  user?: AuthUser;
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

      console.log('✅ Authing AuthenticationClient初始化成功');
      return this.authClient;
    } catch (error) {
      console.error('❌ Authing AuthenticationClient初始化失败:', error);
      throw new Error('认证客户端初始化失败');
    }
  }

  /**
   * 密码登录 - 连接真实Authing API
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
      
      // 判断是邮箱还是手机号
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

      console.log('✅ 密码登录成功:', result);
      
      return {
        success: true,
        message: '登录成功',
        user: this.formatUserInfo(result),
        token: result.token || result.access_token
      };

    } catch (error: any) {
      console.error('❌ 密码登录失败:', error);
      
      let errorMessage = '登录失败';
      if (error?.message) {
        if (error.message.includes('password')) {
          errorMessage = '密码错误';
        } else if (error.message.includes('user')) {
          errorMessage = '用户不存在';
        } else if (error.message.includes('locked')) {
          errorMessage = '账号已被锁定';
        } else {
          errorMessage = error.message;
        }
      }

      return {
        success: false,
        message: errorMessage
      };
    }
  }

  /**
   * 更新用户资料 - 连接真实Authing API
   */
  async updateProfile(updates: {
    nickname?: string;
    avatar?: string;
    email?: string;
    phone?: string;
  }): Promise<UpdateProfileResponse> {
    try {
      const client = await this.initAuthClient();
      
      // 构建更新数据
      const updateData: any = {};
      
      if (updates.nickname) updateData.nickname = updates.nickname;
      if (updates.avatar) updateData.photo = updates.avatar;
      if (updates.email) updateData.email = updates.email;
      if (updates.phone) updateData.phone = updates.phone;

      if (Object.keys(updateData).length === 0) {
        return {
          success: false,
          message: '没有需要更新的数据'
        };
      }

      // 调用真实Authing API更新用户信息
      const result = await client.updateProfile(updateData);
      
      console.log('✅ 用户资料更新成功:', result);
      
      return {
        success: true,
        message: '个人资料更新成功',
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

      // 🚨 关键：真实API失败时不能降级到本地，必须抛出错误
      throw new Error(errorMessage);
    }
  }

  /**
   * 获取当前用户信息 - 连接真实Authing API
   */
  async getCurrentUser(): Promise<AuthUser | null> {
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
      
      // 🚨 关键：API失败时不能返回模拟数据，必须返回null或抛出错误
      if (error?.message?.includes('unauthorized')) {
        return null; // 用户未登录
      }
      
      throw new Error(`获取用户信息失败: ${error.message}`);
    }
  }

  /**
   * 格式化用户信息 - 确保数据一致性
   */
  private formatUserInfo(userInfo: any): AuthUser {
    // 🚨 关键：用户ID必须来自Authing服务器，不能为空
    const userId = userInfo.id || userInfo.userId || userInfo.sub;
    if (!userId) {
      throw new Error('Authing API未返回有效用户ID');
    }

    return {
      id: userId,
      username: userInfo.username || userInfo.name || '',
      email: userInfo.email || userInfo.emailAddress || '',
      phone: userInfo.phone || userInfo.phoneNumber || '',
      nickname: userInfo.nickname || userInfo.name || userInfo.username || '',
      avatar: userInfo.avatar || userInfo.photo || userInfo.picture || '',
      loginTime: new Date().toISOString(),
      roles: Array.isArray(userInfo.roles) ? userInfo.roles : ['user'],
      permissions: Array.isArray(userInfo.permissions) ? userInfo.permissions : ['basic']
    };
  }

  /**
   * 修改密码 - 连接真实Authing API
   */
  async changePassword(oldPassword: string, newPassword: string): Promise<UpdateProfileResponse> {
    try {
      if (!oldPassword || !newPassword) {
        return {
          success: false,
          message: '原密码和新密码不能为空'
        };
      }

      if (newPassword.length < 6) {
        return {
          success: false,
          message: '新密码长度至少6位'
        };
      }

      const client = await this.initAuthClient();
      
      const result = await client.updatePassword(newPassword, oldPassword);
      
      console.log('✅ 密码修改成功:', result);
      
      return {
        success: true,
        message: '密码修改成功'
      };

    } catch (error: any) {
      console.error('❌ 密码修改失败:', error);
      
      let errorMessage = '密码修改失败';
      if (error?.message) {
        if (error.message.includes('old password')) {
          errorMessage = '原密码错误';
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
   * 注销登录 - 连接真实Authing API
   */
  async logout(): Promise<void> {
    try {
      const client = await this.initAuthClient();
      
      // 调用真实API注销
      await client.logout();
      
      console.log('✅ 注销成功');
      
    } catch (error: any) {
      console.error('❌ 注销失败:', error);
      // 注销失败也不影响本地清理
    }
  }
}

// 导出单例实例
export const authService = new AuthService();
export default authService;