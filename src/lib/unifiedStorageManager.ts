/**
 * 🔗 统一存储管理器
 * 解决存储键命名不一致和数据隔离问题
 */

import { secureStorage, SecurityUtils } from '@/lib/security';

/**
 * 统一存储键命名规范
 */
export class UnifiedStorageKeyManager {
  private static readonly KEY_PREFIX = 'wenpai';
  private static readonly SEPARATOR = ':';

  /**
   * 生成用户数据存储键
   */
  static generateUserDataKey(userId: string, module: string, subModule?: string): string {
    const parts = [this.KEY_PREFIX, 'user', userId, module];
    if (subModule) parts.push(subModule);
    return parts.join(this.SEPARATOR);
  }

  /**
   * 生成访客数据存储键
   */
  static generateGuestDataKey(sessionId: string, module: string, subModule?: string): string {
    const parts = [this.KEY_PREFIX, 'guest', sessionId, module];
    if (subModule) parts.push(subModule);
    return parts.join(this.SEPARATOR);
  }

  /**
   * 生成UI偏好存储键
   */
  static generateUIPrefsKey(setting: string): string {
    return [this.KEY_PREFIX, 'ui', setting].join(this.SEPARATOR);
  }

  /**
   * 生成临时数据存储键
   */
  static generateTempDataKey(sessionId: string, module: string): string {
    return [this.KEY_PREFIX, 'temp', sessionId, module].join(this.SEPARATOR);
  }

  /**
   * 解析存储键
   */
  static parseStorageKey(key: string): {
    isWenpaiKey: boolean;
    type: 'user' | 'guest' | 'ui' | 'temp' | 'unknown';
    userId?: string;
    sessionId?: string;
    module?: string;
    subModule?: string;
  } {
    if (!key.startsWith(this.KEY_PREFIX + this.SEPARATOR)) {
      return { isWenpaiKey: false, type: 'unknown' };
    }

    const parts = key.split(this.SEPARATOR);
    if (parts.length < 3) {
      return { isWenpaiKey: true, type: 'unknown' };
    }

    const [prefix, type, identifier, module, subModule] = parts;

    switch (type) {
      case 'user':
        return {
          isWenpaiKey: true,
          type: 'user',
          userId: identifier,
          module,
          subModule
        };
      case 'guest':
        return {
          isWenpaiKey: true,
          type: 'guest',
          sessionId: identifier,
          module,
          subModule
        };
      case 'ui':
        return {
          isWenpaiKey: true,
          type: 'ui',
          module: identifier
        };
      case 'temp':
        return {
          isWenpaiKey: true,
          type: 'temp',
          sessionId: identifier,
          module
        };
      default:
        return { isWenpaiKey: true, type: 'unknown' };
    }
  }

  /**
   * 获取用户所有相关的存储键
   */
  static getUserStorageKeys(userId: string): string[] {
    const allKeys = Object.keys(localStorage);
    return allKeys.filter(key => {
      const parsed = this.parseStorageKey(key);
      return parsed.type === 'user' && parsed.userId === userId;
    });
  }

  /**
   * 获取访客所有相关的存储键
   */
  static getGuestStorageKeys(sessionId: string): string[] {
    const allKeys = Object.keys(localStorage);
    return allKeys.filter(key => {
      const parsed = this.parseStorageKey(key);
      return parsed.type === 'guest' && parsed.sessionId === sessionId;
    });
  }

  /**
   * 清理用户所有数据
   */
  static clearUserData(userId: string): number {
    const userKeys = this.getUserStorageKeys(userId);
    userKeys.forEach(key => localStorage.removeItem(key));
    console.log(`🗑️ 已清理用户 ${userId} 的 ${userKeys.length} 项数据`);
    return userKeys.length;
  }

  /**
   * 清理访客数据
   */
  static clearGuestData(sessionId: string): number {
    const guestKeys = this.getGuestStorageKeys(sessionId);
    guestKeys.forEach(key => localStorage.removeItem(key));
    console.log(`🗑️ 已清理访客 ${sessionId} 的 ${guestKeys.length} 项数据`);
    return guestKeys.length;
  }

  /**
   * 迁移旧格式存储键到新格式
   */
  static migrateOldStorageKeys(userId: string): number {
    const allKeys = Object.keys(localStorage);
    let migratedCount = 0;

    // 查找旧格式的键
    const oldFormatPatterns = [
      new RegExp(`brand_assets_${userId}`),
      new RegExp(`brand_dimensions_${userId}`),
      new RegExp(`brandAssets_${userId}`),
      new RegExp(`brandDimensions_${userId}`),
      /brand_assets_guest/,
      /brand_dimensions_guest/,
      /authing_user/,
      /user_profile/,
      /user_settings/
    ];

    allKeys.forEach(oldKey => {
      const isOldFormat = oldFormatPatterns.some(pattern => pattern.test(oldKey));
      
      if (isOldFormat) {
        try {
          const data = localStorage.getItem(oldKey);
          if (!data) return;

          // 确定新的模块名
          let module = 'unknown';
          if (oldKey.includes('brand_assets')) module = 'brand_assets';
          else if (oldKey.includes('brand_dimensions')) module = 'brand_dimensions';
          else if (oldKey.includes('authing_user')) module = 'auth_user';
          else if (oldKey.includes('user_profile')) module = 'profile';
          else if (oldKey.includes('user_settings')) module = 'settings';

          // 生成新键
          const newKey = oldKey.includes('guest') 
            ? this.generateGuestDataKey('migration_session', module)
            : this.generateUserDataKey(userId, module);

          // 迁移数据
          localStorage.setItem(newKey, data);
          localStorage.removeItem(oldKey);
          
          migratedCount++;
          console.log(`📦 迁移完成: ${oldKey} -> ${newKey}`);
        } catch (error) {
          console.error(`❌ 迁移失败: ${oldKey}`, error);
        }
      }
    });

    return migratedCount;
  }
}

/**
 * 增强的用户数据隔离管理器
 */
export class EnhancedUserDataIsolation {
  private userId: string | null = null;
  private guestSessionId: string = SecurityUtils.generateTempId();
  
  constructor(userId?: string | null) {
    this.userId = userId || null;
  }

  /**
   * 设置当前用户
   */
  setUser(userId: string | null): void {
    if (this.userId && userId && this.userId !== userId) {
      // 用户切换，清理旧用户数据
      this.clearCurrentUserData();
    }
    
    this.userId = userId;
    if (!userId) {
      // 生成新的访客会话ID
      this.guestSessionId = SecurityUtils.generateTempId();
    }
  }

  /**
   * 安全存储数据
   */
  setData<T>(module: string, data: T, options: {
    encrypt?: boolean;
    subModule?: string;
  } = {}): void {
    const { encrypt = false, subModule } = options;
    
    const key = this.userId 
      ? UnifiedStorageKeyManager.generateUserDataKey(this.userId, module, subModule)
      : UnifiedStorageKeyManager.generateGuestDataKey(this.guestSessionId, module, subModule);

    if (encrypt) {
      secureStorage.setItem(key, data, true);
    } else {
      localStorage.setItem(key, JSON.stringify(data));
    }
  }

  /**
   * 安全获取数据
   */
  getData<T>(module: string, options: {
    decrypt?: boolean;
    subModule?: string;
  } = {}): T | null {
    const { decrypt = false, subModule } = options;
    
    const key = this.userId 
      ? UnifiedStorageKeyManager.generateUserDataKey(this.userId, module, subModule)
      : UnifiedStorageKeyManager.generateGuestDataKey(this.guestSessionId, module, subModule);

    try {
      if (decrypt) {
        return secureStorage.getItem<T>(key, true);
      } else {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : null;
      }
    } catch (error) {
      console.error(`获取数据失败: ${key}`, error);
      return null;
    }
  }

  /**
   * 删除数据
   */
  removeData(module: string, subModule?: string): void {
    const key = this.userId 
      ? UnifiedStorageKeyManager.generateUserDataKey(this.userId, module, subModule)
      : UnifiedStorageKeyManager.generateGuestDataKey(this.guestSessionId, module, subModule);
    
    localStorage.removeItem(key);
  }

  /**
   * 清理当前用户所有数据
   */
  clearCurrentUserData(): void {
    if (this.userId) {
      UnifiedStorageKeyManager.clearUserData(this.userId);
    } else {
      UnifiedStorageKeyManager.clearGuestData(this.guestSessionId);
    }
  }

  /**
   * 迁移旧格式数据
   */
  migrateOldData(): number {
    if (!this.userId) return 0;
    return UnifiedStorageKeyManager.migrateOldStorageKeys(this.userId);
  }

  /**
   * 获取当前用户ID
   */
  getCurrentUserId(): string | null {
    return this.userId;
  }

  /**
   * 获取访客会话ID
   */
  getGuestSessionId(): string {
    return this.guestSessionId;
  }
}

/**
 * React Hook: 增强的用户数据隔离
 */
export function useEnhancedUserDataIsolation(userId?: string | null) {
  const manager = new EnhancedUserDataIsolation(userId);
  
  return {
    setData: <T>(module: string, data: T, options?: { encrypt?: boolean; subModule?: string }) => 
      manager.setData(module, data, options),
    getData: <T>(module: string, options?: { decrypt?: boolean; subModule?: string }) => 
      manager.getData<T>(module, options),
    removeData: (module: string, subModule?: string) => 
      manager.removeData(module, subModule),
    clearCurrentUserData: () => manager.clearCurrentUserData(),
    migrateOldData: () => manager.migrateOldData(),
    setUser: (userId: string | null) => manager.setUser(userId),
    getCurrentUserId: () => manager.getCurrentUserId(),
    getGuestSessionId: () => manager.getGuestSessionId()
  };
}

export default UnifiedStorageKeyManager;