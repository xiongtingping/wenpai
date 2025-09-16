/**
 * 安全用户状态管理服务
 * 🔒 安全修复：替换不安全的localStorage用户状态管理
 * 
 * 功能：
 * 1. 加密用户敏感信息存储
 * 2. 定期验证用户状态有效性
 * 3. 防止用户状态篡改
 * 4. 提供安全的状态同步机制
 */

import { SessionUserInfo } from './unifiedPermissionService';
// 🔒 安全修复：导入真正的加密服务
import { SecureEncryption } from './encryptionService';

/**
 * 加密后的用户状态接口
 */
interface EncryptedUserState {
  encryptedData: string;
  checksum: string;
  timestamp: number;
  expiresAt: number;
}

/**
 * 用户状态验证结果接口
 */
interface UserStateValidation {
  isValid: boolean;
  reason?: string;
  shouldRefresh: boolean;
}

/**
 * 安全用户状态管理服务类
 */
export class SecureUserStateService {
  private static readonly STORAGE_KEY = '_secure_user_state';
  private static readonly STATE_DURATION = 24 * 60 * 60 * 1000; // 24小时
  private static readonly VALIDATION_INTERVAL = 5 * 60 * 1000; // 5分钟验证一次
  private static validationTimer: NodeJS.Timeout | null = null;
  private static lastValidation = 0;

  /**
   * 🔒 安全修复：使用AES-256-GCM加密用户状态数据
   */
  private static async encrypt(data: string): Promise<string> {
    try {
      if (!data || typeof data !== 'string') {
        throw new Error('Invalid data for encryption');
      }

      // 使用真正的AES加密
      const encryptedData = await SecureEncryption.encrypt(data);
      console.log('🔐 用户状态数据加密成功');
      return encryptedData;

    } catch (error) {
      console.error('❌ 用户状态加密失败:', error);
      // 🔒 安全修复：加密失败时抛出错误，而不是返回原始数据
      throw new Error('用户状态加密失败');
    }
  }

  /**
   * 🔒 安全修复：使用AES-256-GCM解密用户状态数据
   */
  private static async decrypt(encryptedData: string): Promise<string> {
    try {
      if (!encryptedData || typeof encryptedData !== 'string') {
        throw new Error('Invalid encrypted data');
      }

      // 使用真正的AES解密
      const decryptedData = await SecureEncryption.decrypt(encryptedData);
      console.log('🔓 用户状态数据解密成功');
      return decryptedData;

    } catch (error) {
      console.error('❌ 用户状态解密失败:', error);
      // 🔒 安全修复：解密失败时抛出错误，提高安全性
      throw new Error('用户状态解密失败');
    }
  }

  /**
   * 🔒 安全修复：使用SHA-256生成数据完整性校验和
   */
  private static async generateChecksum(data: string): Promise<string> {
    try {
      return await SecureEncryption.generateChecksum(data);
    } catch (error) {
      console.error('❌ 校验和生成失败:', error);
      throw new Error('校验和生成失败');
    }
  }

  /**
   * 🔒 安全修复：验证SHA-256校验和
   */
  private static async verifyChecksum(data: string, expectedChecksum: string): Promise<boolean> {
    try {
      return await SecureEncryption.verifyChecksum(data, expectedChecksum);
    } catch (error) {
      console.error('❌ 校验和验证失败:', error);
      return false;
    }
  }

  /**
   * 🔒 安全修复：异步安全存储用户状态
   */
  static async storeUserState(user: SessionUserInfo): Promise<boolean> {
    try {
      if (!user || !user.id) {
        console.warn('⚠️ 无效的用户数据，跳过存储');
        return false;
      }

      const userData = JSON.stringify(user);
      
      // 🔒 使用真正的AES加密
      const encryptedData = await this.encrypt(userData);
      const checksum = await this.generateChecksum(userData);
      const timestamp = Date.now();
      const expiresAt = timestamp + this.STATE_DURATION;

      const secureState: EncryptedUserState = {
        encryptedData,
        checksum,
        timestamp,
        expiresAt
      };

      // 存储到localStorage（加密后的数据）
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(secureState));
      
      // 🔒 安全修复：移除明文备用存储，保持数据一致性
      // 仅保留加密存储，提高安全性
      
      console.log('🔒 用户状态已安全存储:', { 
        userId: user.id, 
        expiresAt: new Date(expiresAt).toISOString(),
        encrypted: true 
      });
      
      // 启动状态验证定时器
      this.startValidationTimer();
      
      return true;

    } catch (error) {
      console.error('❌ 安全存储用户状态失败:', error);
      
      // 🔒 降级处理：仅在开发环境下提供明文备用存储
      if (import.meta.env.DEV) {
        console.warn('⚠️ 开发环境：使用明文备用存储');
        try {
          localStorage.setItem('authing_user', JSON.stringify(user));
          return true;
        } catch (fallbackError) {
          console.error('❌ 备用存储也失败:', fallbackError);
        }
      }
      
      return false;
    }
  }

  /**
   * 🔒 安全修复：异步安全读取用户状态
   */
  static async getUserState(): Promise<SessionUserInfo | null> {
    try {
      const storedState = localStorage.getItem(this.STORAGE_KEY);
      if (!storedState) {
        // 尝试从备用存储获取（兼容性）
        return await this.getUserStateFromLegacy();
      }

      const secureState: EncryptedUserState = JSON.parse(storedState);

      // 验证状态有效性
      const validation = this.validateUserState(secureState);
      if (!validation.isValid) {
        console.warn('⚠️ 用户状态验证失败:', validation.reason);
        this.clearUserState();
        return null;
      }

      // 🔒 智能解密用户状态数据
      let decryptedData: string;
      try {
        decryptedData = await this.decrypt(secureState.encryptedData);
        if (!decryptedData) {
          throw new Error('解密结果为空');
        }
      } catch (decryptError) {
        console.error('❌ 用户状态解密失败:', decryptError);

        // 🔄 尝试从备用存储恢复
        console.log('🔄 尝试从备用存储恢复用户状态...');
        const legacyUser = await this.getUserStateFromLegacy();
        if (legacyUser) {
          // 重新加密存储
          await this.storeUserState(legacyUser);
          return legacyUser;
        }

        this.clearUserState();
        return null;
      }

      // 🔍 验证解密后的数据格式
      let userData: SessionUserInfo;
      try {
        userData = JSON.parse(decryptedData);

        // 基本数据结构验证
        if (!userData || typeof userData !== 'object' || !userData.id) {
          throw new Error('用户数据结构无效');
        }
      } catch (parseError) {
        console.error('❌ 用户状态JSON解析失败:', parseError);
        console.log('🔍 解密后的数据预览:', decryptedData.substring(0, 100) + '...');
        this.clearUserState();
        return null;
      }

      // 🔒 验证SHA-256校验和
      const checksumValid = await this.verifyChecksum(decryptedData, secureState.checksum);
      if (!checksumValid) {
        console.error('❌ 用户状态校验和验证失败，数据可能被篡改');
        this.clearUserState();
        return null;
      }

      console.log('✅ 安全读取用户状态成功:', {
        userId: userData.id,
        encrypted: true,
        checksumVerified: true
      });
      return userData;

    } catch (error) {
      console.error('❌ 安全读取用户状态失败:', error);
      this.clearUserState();
      return null;
    }
  }

  /**
   * 🔒 安全修复：从传统存储获取用户状态并迁移（兼容性）
   */
  private static async getUserStateFromLegacy(): Promise<SessionUserInfo | null> {
    try {
      const legacyUser = localStorage.getItem('authing_user');
      if (legacyUser) {
        const userData = JSON.parse(legacyUser);
        console.log('📦 从传统存储获取用户状态:', { userId: userData.id });
        
        // 🔒 异步迁移到安全存储
        try {
          const migrationSuccess = await this.storeUserState(userData);
          if (migrationSuccess) {
            // 迁移成功后清除明文存储
            localStorage.removeItem('authing_user');
            console.log('✅ 用户状态已迁移到安全存储');
          }
        } catch (migrationError) {
          console.warn('⚠️ 用户状态迁移失败:', migrationError);
        }
        
        return userData;
      }
      return null;
    } catch (error) {
      console.warn('⚠️ 传统用户状态读取失败:', error);
      return null;
    }
  }

  /**
   * 验证用户状态
   */
  private static validateUserState(secureState: EncryptedUserState): UserStateValidation {
    const now = Date.now();

    // 检查是否过期
    if (now > secureState.expiresAt) {
      return {
        isValid: false,
        reason: '用户状态已过期',
        shouldRefresh: true
      };
    }

    // 检查时间戳合理性
    if (secureState.timestamp > now || (now - secureState.timestamp) > this.STATE_DURATION * 2) {
      return {
        isValid: false,
        reason: '用户状态时间戳异常',
        shouldRefresh: true
      };
    }

    // 检查必要字段
    if (!secureState.encryptedData || !secureState.checksum) {
      return {
        isValid: false,
        reason: '用户状态数据不完整',
        shouldRefresh: true
      };
    }

    return {
      isValid: true,
      shouldRefresh: false
    };
  }

  /**
   * 更新用户状态
   */
  static async updateUserState(updates: Partial<SessionUserInfo>): Promise<boolean> {
    try {
      const currentUser = await this.getUserState();
      if (!currentUser) {
        console.warn('⚠️ 当前无用户状态，无法更新');
        return false;
      }

      const updatedUser = { ...currentUser, ...updates };
      return await this.storeUserState(updatedUser);

    } catch (error) {
      console.error('❌ 更新用户状态失败:', error);
      return false;
    }
  }

  /**
   * 清除用户状态
   */
  static clearUserState(): void {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
      localStorage.removeItem('authing_user');
      localStorage.removeItem('_authing_user');
      localStorage.removeItem('_authing_token');

      this.stopValidationTimer();

      console.log('🧹 用户状态已清除');

    } catch (error) {
      console.error('❌ 清除用户状态失败:', error);
    }
  }

  /**
   * 🔧 修复损坏的用户状态数据
   */
  static async repairCorruptedUserState(): Promise<boolean> {
    try {
      console.log('🔧 开始修复损坏的用户状态数据...');

      // 清除当前损坏的数据
      this.clearUserState();

      // 尝试从sessionStorage恢复Token
      const tokenData = sessionStorage.getItem('auth_token_encrypted');
      if (tokenData) {
        console.log('🔄 发现sessionStorage中的Token，尝试恢复用户状态...');
        // 这里可以添加从Token恢复用户信息的逻辑
        return true;
      }

      console.log('⚠️ 无法自动修复用户状态，需要重新登录');
      return false;

    } catch (error) {
      console.error('❌ 修复用户状态失败:', error);
      return false;
    }
  }

  /**
   * 检查用户状态是否存在
   */
  static hasUserState(): boolean {
    const secureState = localStorage.getItem(this.STORAGE_KEY);
    const legacyState = localStorage.getItem('authing_user');
    return !!(secureState || legacyState);
  }

  /**
   * 刷新用户状态（重新验证并延长有效期）
   */
  static async refreshUserState(): Promise<boolean> {
    try {
      const currentUser = await this.getUserState();
      if (!currentUser) {
        console.warn('⚠️ 无当前用户状态，无法刷新');
        return false;
      }

      // 这里应该调用服务器API验证用户状态
      // 暂时直接延长有效期
      console.log('🔄 刷新用户状态:', { userId: currentUser.id });
      return await this.storeUserState(currentUser);

    } catch (error) {
      console.error('❌ 刷新用户状态失败:', error);
      return false;
    }
  }

  /**
   * 启动状态验证定时器
   */
  private static startValidationTimer(): void {
    this.stopValidationTimer();
    
    this.validationTimer = setInterval(async () => {
      const now = Date.now();
      
      // 避免频繁验证
      if (now - this.lastValidation < this.VALIDATION_INTERVAL) {
        return;
      }
      
      this.lastValidation = now;
      
      try {
        const user = await this.getUserState();
        if (!user) {
          console.log('🕐 定时验证：用户状态已失效，停止验证');
          this.stopValidationTimer();
          return;
        }

        // 检查是否需要刷新
        const secureState = localStorage.getItem(this.STORAGE_KEY);
        if (secureState) {
          const state: EncryptedUserState = JSON.parse(secureState);
          const validation = this.validateUserState(state);
          
          if (validation.shouldRefresh) {
            console.log('🔄 定时验证：需要刷新用户状态');
            await this.refreshUserState();
          }
        }

      } catch (error) {
        console.error('❌ 定时状态验证失败:', error);
      }
    }, this.VALIDATION_INTERVAL);

    console.log('🕐 用户状态验证定时器已启动');
  }

  /**
   * 停止状态验证定时器
   */
  private static stopValidationTimer(): void {
    if (this.validationTimer) {
      clearInterval(this.validationTimer);
      this.validationTimer = null;
      console.log('🛑 用户状态验证定时器已停止');
    }
  }

  /**
   * 获取状态统计信息
   */
  static getStateStats(): { hasState: boolean; isExpired: boolean; timeLeft: number } {
    try {
      const secureState = localStorage.getItem(this.STORAGE_KEY);
      if (!secureState) {
        return { hasState: false, isExpired: true, timeLeft: 0 };
      }

      const state: EncryptedUserState = JSON.parse(secureState);
      const now = Date.now();
      const isExpired = now > state.expiresAt;
      const timeLeft = Math.max(0, state.expiresAt - now);

      return {
        hasState: true,
        isExpired,
        timeLeft
      };

    } catch (error) {
      return { hasState: false, isExpired: true, timeLeft: 0 };
    }
  }
}

// 页面卸载时清理定时器
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    SecureUserStateService['stopValidationTimer']();
  });
}

export default SecureUserStateService;