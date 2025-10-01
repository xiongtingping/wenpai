/**
 * 
 * 专门处理用户数据的安全存储，解决数据隔离和Token安全问题
 */

import { secureStorage, SecurityUtils } from '@/lib/security';
import { userDataIsolationUtils } from '@/hooks/useUserDataIsolationInit';

/**
 * 存储键命名规范
 */
export const STORAGE_KEY_PATTERNS = {
  // 用户数据格式：wenpai:user:{userId}:{module}
  USER_DATA: (userId: string, module: string) => `wenpai:user:${userId}:${module}`,
  
  // 访客数据格式：wenpai:guest:{sessionId}:{module}  
  GUEST_DATA: (sessionId: string, module: string) => `wenpai:guest:${sessionId}:${module}`,
  
  // UI偏好格式：wenpai:ui:{setting}
  UI_PREFS: (setting: string) => `wenpai:ui:${setting}`,
  
  // 临时数据格式：wenpai:temp:{sessionId}:{module}
  TEMP_DATA: (sessionId: string, module: string) => `wenpai:temp:${sessionId}:${module}`,
  
  // 认证数据格式：wenpai:auth:{userId}
  AUTH_DATA: (userId: string) => `wenpai:auth:${userId}`
};

/**
 * 安全用户存储管理器
 */
export class SecureUserStorageManager {
  private static instance: SecureUserStorageManager;
  private currentUserId: string | null = null;
  private guestSessionId: string | null = null;

  private constructor() {
    // 生成访客会话ID
    this.guestSessionId = this.generateGuestSessionId();
  }

  static getInstance(): SecureUserStorageManager {
    if (!SecureUserStorageManager.instance) {
      SecureUserStorageManager.instance = new SecureUserStorageManager();
    }
    return SecureUserStorageManager.instance;
  }

  /**
   * 设置当前用户
   */
  setCurrentUser(userId: string | null): void {
    this.currentUserId = userId;
    
    if (userId) {
      console.log('👤 切换到user模式');
      // 清理可能的访客数据污染
      this.clearGuestData();
    } else {
      console.log('👤 切换到访客模式');
      // 生成新的访客会话ID
      this.guestSessionId = this.generateGuestSessionId();
    }
  }

  /**
   * 生成访客会话ID
   */
  private generateGuestSessionId(): string {
    return SecurityUtils.generateTempId();
  }

  /**
   * 安全存储用户数据
   */
  setUserData<T>(module: string, data: T, options: {
    encrypt?: boolean;
    sensitive?: boolean;
  } = {}): void {
    const { encrypt = true, sensitive = false } = options;
    
    if (!this.currentUserId) {
      // 访客模式
      const key = STORAGE_KEY_PATTERNS.GUEST_DATA(this.guestSessionId!, module);
      secureStorage.setItem(key, data, encrypt);
      console.log('💾 访客datasaved: ' + module);
    } else {
      // 用户模式
      const key = STORAGE_KEY_PATTERNS.USER_DATA(this.currentUserId, module);
      secureStorage.setItem(key, data, encrypt || sensitive);
      console.log('💾 userdatasaved: ' + this.currentUserId + ':' + module);
    }
  }

  /**
   * 安全获取用户数据
   */
  getUserData<T>(module: string, options: {
    decrypt?: boolean;
  } = {}): T | null {
    const { decrypt = true } = options;
    
    if (!this.currentUserId) {
      // 访客模式
      const key = STORAGE_KEY_PATTERNS.GUEST_DATA(this.guestSessionId!, module);
      return secureStorage.getItem<T>(key, decrypt);
    } else {
      // 用户模式
      const key = STORAGE_KEY_PATTERNS.USER_DATA(this.currentUserId, module);
      return secureStorage.getItem<T>(key, decrypt);
    }
  }

  /**
   * 安全存储认证信息
   */
  setAuthData(userId: string, authData: any): void {
    const key = STORAGE_KEY_PATTERNS.AUTH_DATA(userId);
    // 认证数据必须加密存储
    secureStorage.setItem(key, authData, true);
    console.log('🔐 authenticatingdatasaved');
  }

  /**
   * 安全获取认证信息
   */
  getAuthData(userId: string): any | null {
    const key = STORAGE_KEY_PATTERNS.AUTH_DATA(userId);
    return secureStorage.getItem(key, true);
  }

  /**
   * 删除用户数据
   */
  removeUserData(module: string): void {
    if (!this.currentUserId) {
      const key = STORAGE_KEY_PATTERNS.GUEST_DATA(this.guestSessionId!, module);
      secureStorage.removeItem(key);
    } else {
      const key = STORAGE_KEY_PATTERNS.USER_DATA(this.currentUserId, module);
      secureStorage.removeItem(key);
    }
  }

  /**
   * 清理当前用户的所有数据
   */
  clearCurrentUserData(): void {
    if (!this.currentUserId) {
      this.clearGuestData();
      return;
    }

    // 查找并删除所有用户相关的localStorage数据
    const allKeys = Object.keys(localStorage);
    const userKeys = allKeys.filter(key => 
      key.includes(`:user:${this.currentUserId}:`) ||
      key.includes(`_${this.currentUserId}`) ||
      key === STORAGE_KEY_PATTERNS.AUTH_DATA(this.currentUserId!)
    );

    userKeys.forEach(key => {
      localStorage.removeItem(key);
      console.log('🗑️ alreadycleaninguserdata: ' + key);
    });

    console.log('✅ user ' + this.currentUserId + ' 的所有数据已清理完成');
  }

  /**
   * 清理访客数据
   */
  private clearGuestData(): void {
    if (!this.guestSessionId) return;

    const allKeys = Object.keys(localStorage);
    const guestKeys = allKeys.filter(key => 
      key.includes(`:guest:${this.guestSessionId}:`) ||
      key.includes('_guest')
    );

    guestKeys.forEach(key => {
      localStorage.removeItem(key);
      console.log('🗑️ alreadycleaning访客data: ' + key);
    });

    console.log('✅ 访客dataalreadycleaningcompleted');
  }

  /**
   * 迁移旧格式数据到新的安全存储格式
   */
  migrateOldStorageFormat(): void {
    const allKeys = Object.keys(localStorage);
    
    // 查找旧格式的存储键
    const oldFormatKeys = allKeys.filter(key => 
      !key.startsWith('wenpai:') && (
        key.includes('brand_assets') ||
        key.includes('brand_dimensions') ||
        key.includes('authing_user') ||
        key.includes('_guest') ||
        key.endsWith('_' + this.currentUserId)
      )
    );

    oldFormatKeys.forEach(oldKey => {
      try {
        const data = localStorage.getItem(oldKey);
        if (!data) return;

        // 解析旧数据
        const parsedData = JSON.parse(data);
        
        // 确定新的存储位置
        let newModule = 'unknown';
        if (oldKey.includes('brand_assets')) newModule = 'brand_assets';
        else if (oldKey.includes('brand_dimensions')) newModule = 'brand_dimensions';
        else if (oldKey.includes('authing_user')) newModule = 'auth_user';

        // 存储到新格式
        this.setUserData(newModule, parsedData, { encrypt: true });
        
        // 删除旧数据
        localStorage.removeItem(oldKey);
        
        console.log('📦 data迁移completed: ' + oldKey + ' -> ' + newModule);
      } catch (error) {
        console.error('❌ 迁移datafailed: ' + oldKey, error);
      }
    });
  }

  /**
   * 验证数据隔离完整性
   */
  validateDataIsolation(): {
    isValid: boolean;
    violations: string[];
    recommendations: string[];
  } {
    const violations: string[] = [];
    const recommendations: string[] = [];
    const allKeys = Object.keys(localStorage);

    // 检查是否有跨用户数据访问风险
    const userDataKeys = allKeys.filter(key => key.includes(':user:'));
    const userIds = new Set<string>();
    
    userDataKeys.forEach(key => {
      const match = key.match(/:user:([^:]+):/);
      if (match) {
        userIds.add(match[1]);
      }
    });

    if (userIds.size > 1) {
      violations.push('发现多个用户的数据: ' + Array.from(userIds).join(', '));
      recommendations.push('定期清理非当前用户的历史数据');
    }

    // 检查是否有旧格式的存储键
    const oldFormatKeys = allKeys.filter(key => 
      !key.startsWith('wenpai:') && 
      (key.includes('_') || key.includes('brand') || key.includes('user'))
    );

    if (oldFormatKeys.length > 0) {
      violations.push('发现' + oldFormatKeys.length + '个旧格式存储键');
      recommendations.push('运行数据迁移以统一存储格式');
    }

    // 检查是否有明文存储的敏感数据
    allKeys.forEach(key => {
      if (key.includes('token') || key.includes('auth') || key.includes('password')) {
        try {
          const data = localStorage.getItem(key);
          if (data && !data.startsWith('U2FsdGVkX1')) { // 未加密
            violations.push('发现明文存储的敏感数据: ' + key);
            recommendations.push('对所有认证和敏感数据启用加密存储');
          }
        } catch (error) {
          // 忽略解析错误
        }
      }
    });

    return {
      isValid: violations.length === 0,
      violations,
      recommendations
    };
  }
}

// 导出单例实例
export const secureUserStorage = SecureUserStorageManager.getInstance();

// 导出用于React组件的Hook
export function useSecureUserStorage() {
  return secureUserStorage;
}