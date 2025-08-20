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
    // 🔧 修复：每次都重新初始化，确保使用最新的token
    // if (this.isInitialized && this.client) {
    //   return;
    // }

    try {
      const config = getAuthConfig();
      const token = localStorage.getItem('auth_token');

      // 🔧 调试：检查token的详细信息
      if (token) {
        try {
          // 尝试解码JWT token查看内容
          const payload = JSON.parse(atob(token.split('.')[1]));
          const now = Math.floor(Date.now() / 1000);
          const isExpired = payload.exp && payload.exp < now;
          console.log('🔍 Token详细信息:', {
            hasToken: true,
            tokenLength: token.length,
            tokenType: payload.token_use || 'unknown',
            isExpired,
            expiresAt: payload.exp ? new Date(payload.exp * 1000).toISOString() : 'unknown',
            currentTime: new Date().toISOString()
          });
        } catch (e) {
          console.log('🔍 Token信息:', { hasToken: true, tokenLength: token.length, parseError: e instanceof Error ? e.message : 'Unknown error' });
        }
      }

      // 🔧 修复：创建AuthenticationClient实例时传入token
      this.client = new AuthenticationClient({
        appId: config.appId,
        appHost: config.host,
        token: token || undefined, // 修复：null转换为undefined
        onError: (code, message, data) => {
          console.error('🔴 Authing客户端错误:', { code, message, data });
        }
      });

      this.isInitialized = true;
      console.log('✅ Authing客户端初始化成功', { hasToken: !!token });

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
      // 🔧 修复：使用正确的API方法 setToken 而不是 setAccessToken
      this.client.setToken(token);
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

    // 🔧 修复：token已在初始化时设置，无需再次设置
    const token = localStorage.getItem('auth_token');
    if (!token) {
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

    // 🔧 修复：尝试多种token获取方式
    const authToken = localStorage.getItem('auth_token');
    const idToken = localStorage.getItem('id_token');
    const accessToken = localStorage.getItem('access_token');

    console.log('🔍 可用的token类型:', {
      hasAuthToken: !!authToken,
      hasIdToken: !!idToken,
      hasAccessToken: !!accessToken
    });

    if (!authToken && !idToken && !accessToken) {
      return {
        success: false,
        error: '用户未登录或令牌无效'
      };
    }

    // 🔧 尝试使用不同的token类型
    const tokenToUse = idToken || accessToken || authToken;

    // 重新创建客户端实例，使用正确的token
    try {
      const config = getAuthConfig();
      const { AuthenticationClient } = await import('authing-js-sdk');

      this.client = new AuthenticationClient({
        appId: config.appId,
        appHost: config.host,
        token: tokenToUse || undefined,
        onError: (code, message, data) => {
          console.error('🔴 Authing客户端错误:', { code, message, data });
        }
      });

      console.log('🔧 使用token类型:', {
        tokenType: idToken ? 'id_token' : (accessToken ? 'access_token' : 'auth_token'),
        tokenLength: tokenToUse?.length
      });
    } catch (error) {
      console.error('❌ 重新初始化客户端失败:', error);
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
