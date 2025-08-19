/**
 * 🔐 Authing 真实API服务
 * 连接真实的Authing服务器进行用户信息管理
 */

import { AuthenticationClient } from 'authing-js-sdk';
import { getAuthConfig } from '@/auth/config';

export interface AuthingUserProfile {
  nickname?: string;
  email?: string;
  phone?: string;
  photo?: string;
  avatar?: string;
}

export interface AuthingUpdateResult {
  success: boolean;
  user?: any;
  error?: string;
}

class AuthingService {
  private client: AuthenticationClient | null = null;
  private isInitialized = false;

  /**
   * 初始化Authing客户端
   */
  private async initializeClient(): Promise<void> {
    if (this.isInitialized && this.client) {
      return;
    }

    try {
      const config = getAuthConfig();
      
      // 创建AuthenticationClient实例
      this.client = new AuthenticationClient({
        appId: config.appId,
        appHost: config.host,
        onError: (code, message, data) => {
          console.error('🔴 Authing客户端错误:', { code, message, data });
        }
      });

      this.isInitialized = true;

    } catch (error) {
      console.error('❌ Authing客户端初始化失败:', error);
      throw new Error('Authing客户端初始化失败');
    }
  }

  /**
   * 设置访问令牌
   */
  private setAccessToken(): boolean {
    const token = localStorage.getItem('auth_token');
    if (!token || !this.client) {
      return false;
    }

    try {
      this.client.setAccessToken(token);
      return true;
    } catch (error) {
      console.error('❌ 设置访问令牌失败:', error);
      return false;
    }
  }

  /**
   * 获取当前用户信息
   */
  async getCurrentUser(): Promise<any> {
    await this.initializeClient();

    if (!this.client) {
      throw new Error('Authing客户端未初始化');
    }

    // 🔧 关键修复：设置访问令牌
    if (!this.setAccessToken()) {
      throw new Error('用户未登录或令牌无效');
    }

    try {
      const user = await this.client.getCurrentUser();
      return user;
    } catch (error) {
      console.error('❌ 获取当前用户信息失败:', error);
      throw error;
    }
  }

  /**
   * 更新用户资料到Authing服务器
   */
  async updateProfile(updates: AuthingUserProfile): Promise<AuthingUpdateResult> {
    await this.initializeClient();

    if (!this.client) {
      return {
        success: false,
        error: 'Authing客户端未初始化'
      };
    }

    // 🔧 关键修复：设置访问令牌
    if (!this.setAccessToken()) {
      return {
        success: false,
        error: '用户未登录或令牌无效'
      };
    }

    try {
      // 转换字段名：avatar -> photo (Authing使用photo字段)
      const authingUpdates = {
        ...updates,
        photo: updates.avatar || updates.photo
      };

      // 移除avatar字段，避免冲突
      delete authingUpdates.avatar;

      // 调用真实的Authing API
      const updatedUser = await this.client.updateProfile(authingUpdates);
      
      return {
        success: true,
        user: updatedUser
      };
      
    } catch (error) {
      console.error('❌ 更新用户资料失败:', error);
      
      return {
        success: false,
        error: error instanceof Error ? error.message : '更新失败'
      };
    }
  }

  /**
   * 刷新用户token（如果需要）
   */
  async refreshToken(): Promise<boolean> {
    await this.initializeClient();
    
    if (!this.client) {
      return false;
    }

    try {
      // 检查token是否有效
      const user = await this.client.getCurrentUser();
      return !!user;
    } catch (error) {
      console.error('❌ Token验证失败:', error);
      return false;
    }
  }

  /**
   * 检查Authing连接状态
   */
  async checkConnection(): Promise<boolean> {
    try {
      await this.initializeClient();
      return this.isInitialized && !!this.client;
    } catch (error) {
      console.error('❌ Authing连接检查失败:', error);
      return false;
    }
  }
}

// 导出单例实例
export const authingService = new AuthingService();
export default authingService;
