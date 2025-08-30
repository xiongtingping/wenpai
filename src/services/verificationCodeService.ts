/**
 * 验证码服务模块
 * 基于Authing Web SDK实现邮箱和手机验证码发送
 */

import { AuthenticationClient } from 'authing-js-sdk';
import { getAuthingConfig } from '@/config/authing';

export interface VerificationCodeOptions {
  email?: string;
  phone?: string;
  scene?: 'RESET_PASSWORD' | 'VERIFY_CODE' | 'UPDATE_EMAIL' | 'UPDATE_PHONE' | 'BIND_EMAIL' | 'BIND_PHONE' | 'DELETE_ACCOUNT' | 'REGISTER' | 'LOGIN';
  channel?: 'SMS' | 'EMAIL';
}

export interface VerificationCodeResponse {
  success: boolean;
  message: string;
  data?: any;
}

class VerificationCodeService {
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
      
      // 使用正确的初始化参数
      this.authClient = new AuthenticationClient({
        appId: config.appId,
        appHost: config.host,
        // 根据文档，appHost应该是完整的URL
        tokenEndPointAuthMethod: 'client_secret_post',
        introspectionEndPointAuthMethod: 'client_secret_post',
        revocationEndPointAuthMethod: 'client_secret_post'
      });

      console.log('✅ Authing AuthenticationClient初始化成功');
      return this.authClient;
    } catch (error) {
      console.error('❌ Authing AuthenticationClient初始化失败:', error);
      throw new Error('认证客户端初始化失败');
    }
  }

  /**
   * 发送手机验证码
   */
  async sendSmsCode(phone: string, scene: string = 'LOGIN'): Promise<VerificationCodeResponse> {
    try {
      // 验证手机号格式
      if (!/^1[3-9]\d{9}$/.test(phone)) {
        return {
          success: false,
          message: '请输入有效的手机号码'
        };
      }

      const client = await this.initAuthClient();
      
      // 调用Authing SDK发送短信验证码
      const result = await client.sendSmsCode(phone);

      console.log('✅ 手机验证码发送成功:', { phone, scene });
      
      return {
        success: true,
        message: '验证码已发送到您的手机',
        data: result
      };

    } catch (error: any) {
      console.error('❌ 发送手机验证码失败:', error);
      
      let errorMessage = '发送验证码失败';
      
      // 根据错误类型返回具体错误信息
      if (error?.message) {
        if (error.message.includes('rate limit')) {
          errorMessage = '发送频率过快，请稍后再试';
        } else if (error.message.includes('phone')) {
          errorMessage = '手机号格式错误';
        } else if (error.message.includes('invalid')) {
          errorMessage = '无效的请求参数';
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
   * 发送邮箱验证码
   */
  async sendEmailCode(email: string, scene: string = 'LOGIN'): Promise<VerificationCodeResponse> {
    try {
      // 验证邮箱格式
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return {
          success: false,
          message: '请输入有效的邮箱地址'
        };
      }

      const client = await this.initAuthClient();
      
      // 调用Authing SDK发送邮件验证码
      // 🔧 FIX: 2025-08-30 修复API调用方式，简化参数
      const result = await client.sendEmail(email);

      console.log('✅ 邮箱验证码发送成功:', { email, scene });
      
      return {
        success: true,
        message: '验证码已发送到您的邮箱',
        data: result
      };

    } catch (error: any) {
      console.error('❌ 发送邮箱验证码失败:', error);
      
      let errorMessage = '发送验证码失败';
      
      // 根据错误类型返回具体错误信息
      if (error?.message) {
        if (error.message.includes('rate limit')) {
          errorMessage = '发送频率过快，请稍后再试';
        } else if (error.message.includes('email')) {
          errorMessage = '邮箱格式错误';
        } else if (error.message.includes('invalid')) {
          errorMessage = '无效的请求参数';
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
   * 验证手机验证码并登录
   */
  async loginByPhoneCode(phone: string, code: string): Promise<VerificationCodeResponse> {
    try {
      if (!/^1[3-9]\d{9}$/.test(phone)) {
        return {
          success: false,
          message: '请输入有效的手机号码'
        };
      }

      if (!code || code.length < 4) {
        return {
          success: false,
          message: '请输入有效的验证码'
        };
      }

      const client = await this.initAuthClient();
      
      const result = await client.loginByPhoneCode(phone, code);

      // 🔍 验证Authing API返回结果 - 简化验证条件，避免误判
      if (!result) {
        throw new Error('API返回空结果');
      }

      console.log('✅ 手机验证码登录成功:', result);
      
      return {
        success: true,
        message: '登录成功',
        data: result
      };

    } catch (error: any) {
      console.error('❌ 手机验证码登录失败:', error);
      
      let errorMessage = '登录失败';
      if (error?.message) {
        if (error.message.includes('code') || error.message.includes('验证码')) {
          errorMessage = '验证码错误或已过期';
        } else if (error.message.includes('phone')) {
          errorMessage = '手机号不存在或未注册';
        } else if (error.message.includes('授权码') || error.message.includes('authorization')) {
          errorMessage = '验证码无效，请重新获取';
        } else if (error.message.includes('400')) {
          errorMessage = '请检查手机号格式或重新获取验证码';
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
   * 验证邮箱验证码并登录
   */
  async loginByEmailCode(email: string, code: string): Promise<VerificationCodeResponse> {
    try {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return {
          success: false,
          message: '请输入有效的邮箱地址'
        };
      }

      if (!code || code.length < 4) {
        return {
          success: false,
          message: '请输入有效的验证码'
        };
      }

      const client = await this.initAuthClient();
      
      const result = await client.loginByEmailCode(email, code);

      // 🔍 验证Authing API返回结果 - 简化验证条件，避免误判
      if (!result) {
        throw new Error('API返回空结果');
      }

      console.log('✅ 邮箱验证码登录成功:', result);
      
      return {
        success: true,
        message: '登录成功',
        data: result
      };

    } catch (error: any) {
      console.error('❌ 邮箱验证码登录失败:', error);
      
      let errorMessage = '登录失败';
      if (error?.message) {
        if (error.message.includes('code') || error.message.includes('验证码')) {
          errorMessage = '验证码错误或已过期';
        } else if (error.message.includes('email')) {
          errorMessage = '邮箱不存在或未注册';
        } else if (error.message.includes('授权码') || error.message.includes('authorization')) {
          errorMessage = '验证码无效，请重新获取';
        } else if (error.message.includes('400')) {
          errorMessage = '请检查邮箱格式或重新获取验证码';
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
   * 使用验证码注册新用户
   */
  async registerByPhoneCode(phone: string, code: string, password: string): Promise<VerificationCodeResponse> {
    try {
      if (!/^1[3-9]\d{9}$/.test(phone)) {
        return {
          success: false,
          message: '请输入有效的手机号码'
        };
      }

      if (!code || code.length < 4) {
        return {
          success: false,
          message: '请输入有效的验证码'
        };
      }

      if (!password || password.length < 6) {
        return {
          success: false,
          message: '密码长度至少6位'
        };
      }

      const client = await this.initAuthClient();
      
      const result = await client.registerByPhoneCode(phone, code, password);

      console.log('✅ 手机验证码注册成功:', result);
      
      return {
        success: true,
        message: '注册成功',
        data: result
      };

    } catch (error: any) {
      console.error('❌ 手机验证码注册失败:', error);
      
      let errorMessage = '注册失败';
      if (error?.message) {
        if (error.message.includes('code')) {
          errorMessage = '验证码错误或已过期';
        } else if (error.message.includes('phone')) {
          errorMessage = '手机号已被注册';
        } else if (error.message.includes('password')) {
          errorMessage = '密码格式不符合要求';
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
   * 使用验证码注册新用户（邮箱）
   */
  async registerByEmailCode(email: string, code: string, password: string): Promise<VerificationCodeResponse> {
    try {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return {
          success: false,
          message: '请输入有效的邮箱地址'
        };
      }

      if (!code || code.length < 4) {
        return {
          success: false,
          message: '请输入有效的验证码'
        };
      }

      if (!password || password.length < 6) {
        return {
          success: false,
          message: '密码长度至少6位'
        };
      }

      const client = await this.initAuthClient();
      
      const result = await client.registerByEmailCode(email, code, {
        password: password
      });

      console.log('✅ 邮箱验证码注册成功:', result);
      
      return {
        success: true,
        message: '注册成功',
        data: result
      };

    } catch (error: any) {
      console.error('❌ 邮箱验证码注册失败:', error);
      
      let errorMessage = '注册失败';
      if (error?.message) {
        if (error.message.includes('code')) {
          errorMessage = '验证码错误或已过期';
        } else if (error.message.includes('email')) {
          errorMessage = '邮箱已被注册';
        } else if (error.message.includes('password')) {
          errorMessage = '密码格式不符合要求';
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
   * 验证邮箱验证码（用于更新邮箱）
   */
  async verifyEmailCode(email: string, code: string): Promise<VerificationCodeResponse> {
    try {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return {
          success: false,
          message: '请输入有效的邮箱地址'
        };
      }

      if (!code || code.length < 4) {
        return {
          success: false,
          message: '请输入有效的验证码'
        };
      }

      const client = await this.initAuthClient();
      
      // 调用Authing SDK验证邮箱验证码
      const result = await client.verifyEmailCode(email, code);

      console.log('✅ 邮箱验证码验证成功:', { email });
      
      return {
        success: true,
        message: '邮箱验证成功',
        data: result
      };

    } catch (error: any) {
      console.error('❌ 验证邮箱验证码失败:', error);
      
      let errorMessage = '验证失败';
      if (error?.message) {
        if (error.message.includes('code')) {
          errorMessage = '验证码错误或已过期';
        } else if (error.message.includes('email')) {
          errorMessage = '邮箱地址错误';
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
   * 验证手机验证码（用于更新手机号）
   */
  async verifyPhoneCode(phone: string, code: string): Promise<VerificationCodeResponse> {
    try {
      if (!/^1[3-9]\d{9}$/.test(phone)) {
        return {
          success: false,
          message: '请输入有效的手机号码'
        };
      }

      if (!code || code.length < 4) {
        return {
          success: false,
          message: '请输入有效的验证码'
        };
      }

      const client = await this.initAuthClient();
      
      // 调用Authing SDK验证手机验证码
      const result = await client.verifySmsCode(phone, code);

      console.log('✅ 手机验证码验证成功:', { phone });
      
      return {
        success: true,
        message: '手机号验证成功',
        data: result
      };

    } catch (error: any) {
      console.error('❌ 验证手机验证码失败:', error);
      
      let errorMessage = '验证失败';
      if (error?.message) {
        if (error.message.includes('code')) {
          errorMessage = '验证码错误或已过期';
        } else if (error.message.includes('phone')) {
          errorMessage = '手机号格式错误';
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
}

// 导出单例实例
export const verificationCodeService = new VerificationCodeService();
export default verificationCodeService;