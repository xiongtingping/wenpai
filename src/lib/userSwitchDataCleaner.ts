/**
 * 🧹 用户切换数据清理器
 * 确保用户登录/登出时完整清理相关数据，防止数据污染
 */

import { secureStorage, SecurityUtils } from '@/lib/security';
import { UnifiedStorageKeyManager } from '@/lib/unifiedStorageManager';

export interface CleanupResult {
  success: boolean;
  clearedKeys: string[];
  errorKeys: string[];
  totalCleared: number;
}

/**
 * 用户切换数据清理器类
 */
export class UserSwitchDataCleaner {
  private static instance: UserSwitchDataCleaner;

  private constructor() {}

  static getInstance(): UserSwitchDataCleaner {
    if (!UserSwitchDataCleaner.instance) {
      UserSwitchDataCleaner.instance = new UserSwitchDataCleaner();
    }
    return UserSwitchDataCleaner.instance;
  }

  /**
   * 用户登出时完整清理
   */
  async performLogoutCleanup(userId: string): Promise<CleanupResult> {
    console.log(`🧹 开始用户登出清理: ${userId}`);
    
    const clearedKeys: string[] = [];
    const errorKeys: string[] = [];
    
    try {
      // 1. 清理用户特定的localStorage数据
      const userStorageKeys = this.getUserStorageKeys(userId);
      for (const key of userStorageKeys) {
        try {
          localStorage.removeItem(key);
          clearedKeys.push(key);
        } catch (error) {
          errorKeys.push(key);
          console.error(`清理用户存储失败: ${key}`, error);
        }
      }

      // 2. 清理sessionStorage中的所有数据
      try {
        const sessionKeys = this.getSessionStorageKeys();
        for (const key of sessionKeys) {
          sessionStorage.removeItem(key);
          clearedKeys.push(`[session]${key}`);
        }
      } catch (error) {
        console.error('清理sessionStorage失败:', error);
      }

      // 3. 清理内存中的状态（需要各服务配合）
      this.notifyServicesUserLogout(userId);

      // 4. 清理浏览器缓存中的认证信息
      this.clearAuthenticationCache();

      console.log(`✅ 用户 ${userId} 登出清理完成，清理了 ${clearedKeys.length} 项数据`);
      
      return {
        success: errorKeys.length === 0,
        clearedKeys,
        errorKeys,
        totalCleared: clearedKeys.length
      };
    } catch (error) {
      console.error('用户登出清理失败:', error);
      return {
        success: false,
        clearedKeys,
        errorKeys,
        totalCleared: clearedKeys.length
      };
    }
  }

  /**
   * 用户登录时清理冲突数据
   */
  async performLoginCleanup(newUserId: string, oldUserId?: string): Promise<CleanupResult> {
    console.log(`🔄 开始用户登录清理: ${oldUserId} -> ${newUserId}`);
    
    const clearedKeys: string[] = [];
    const errorKeys: string[] = [];

    try {
      // 1. 如果是用户切换，清理旧用户数据
      if (oldUserId && oldUserId !== newUserId) {
        const oldUserResult = await this.performLogoutCleanup(oldUserId);
        clearedKeys.push(...oldUserResult.clearedKeys);
        errorKeys.push(...oldUserResult.errorKeys);
      }

      // 2. 清理访客数据（如果存在）
      const guestKeys = this.getGuestStorageKeys();
      for (const key of guestKeys) {
        try {
          localStorage.removeItem(key);
          clearedKeys.push(key);
        } catch (error) {
          errorKeys.push(key);
        }
      }

      // 3. 迁移旧格式数据到新用户
      const migratedCount = this.migrateOldUserData(newUserId);
      console.log(`📦 为新用户 ${newUserId} 迁移了 ${migratedCount} 项旧数据`);

      console.log(`✅ 用户 ${newUserId} 登录清理完成`);

      return {
        success: errorKeys.length === 0,
        clearedKeys,
        errorKeys,
        totalCleared: clearedKeys.length
      };
    } catch (error) {
      console.error('用户登录清理失败:', error);
      return {
        success: false,
        clearedKeys,
        errorKeys,
        totalCleared: clearedKeys.length
      };
    }
  }

  /**
   * 获取用户相关的所有localStorage键
   */
  private getUserStorageKeys(userId: string): string[] {
    const allKeys = Object.keys(localStorage);
    
    return allKeys.filter(key => {
      // 新格式：wenpai:user:userId:module
      if (key.includes(`:user:${userId}:`)) return true;
      
      // 旧格式：module_userId 或 module_type_userId
      if (key.endsWith(`_${userId}`)) return true;
      
      // 认证相关
      if (key.includes('authing') && key.includes(userId)) return true;
      
      return false;
    });
  }

  /**
   * 获取访客相关的所有localStorage键
   */
  private getGuestStorageKeys(): string[] {
    const allKeys = Object.keys(localStorage);
    
    return allKeys.filter(key => {
      // 新格式：wenpai:guest:sessionId:module
      if (key.includes(':guest:')) return true;
      
      // 旧格式：module_guest
      if (key.includes('_guest')) return true;
      
      return false;
    });
  }

  /**
   * 获取sessionStorage的所有键
   */
  private getSessionStorageKeys(): string[] {
    const keys: string[] = [];
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      if (key) keys.push(key);
    }
    return keys;
  }

  /**
   * 通知各服务用户登出
   */
  private notifyServicesUserLogout(userId: string): void {
    // 通知各服务清理内存状态
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('user-logout', { 
        detail: { userId } 
      }));
    }
  }

  /**
   * 清理认证缓存
   */
  private clearAuthenticationCache(): void {
    // 清理可能的认证缓存
    const authKeys = [
      'authing_user',
      'authing_token', 
      'auth_session',
      'user_session',
      'login_state'
    ];

    authKeys.forEach(key => {
      localStorage.removeItem(key);
      sessionStorage.removeItem(key);
    });
  }

  /**
   * 迁移旧格式用户数据
   */
  private migrateOldUserData(userId: string): number {
    return UnifiedStorageKeyManager.migrateOldStorageKeys(userId);
  }

  /**
   * 执行深度清理（清理所有可能的残留数据）
   */
  async performDeepCleanup(): Promise<CleanupResult> {
    console.log('🧹 开始深度清理所有用户数据...');
    
    const clearedKeys: string[] = [];
    const errorKeys: string[] = [];

    try {
      // 1. 清理所有localStorage数据（除了UI偏好）
      const allKeys = Object.keys(localStorage);
      for (const key of allKeys) {
        // 保留UI偏好设置
        if (key.startsWith('wenpai:ui:')) continue;
        
        try {
          localStorage.removeItem(key);
          clearedKeys.push(key);
        } catch (error) {
          errorKeys.push(key);
        }
      }

      // 2. 清理所有sessionStorage
      sessionStorage.clear();
      clearedKeys.push('[sessionStorage] 全部清理');

      console.log(`✅ 深度清理完成，清理了 ${clearedKeys.length} 项数据`);

      return {
        success: errorKeys.length === 0,
        clearedKeys,
        errorKeys,
        totalCleared: clearedKeys.length
      };
    } catch (error) {
      console.error('深度清理失败:', error);
      return {
        success: false,
        clearedKeys,
        errorKeys,
        totalCleared: clearedKeys.length
      };
    }
  }

  /**
   * 验证清理效果
   */
  validateCleanupResult(userId: string): {
    isClean: boolean;
    remainingKeys: string[];
    issues: string[];
  } {
    const allKeys = Object.keys(localStorage);
    const remainingUserKeys = allKeys.filter(key => {
      return key.includes(userId) || 
             key.includes('user') || 
             key.includes('payment') ||
             key.includes('brand') ||
             key.includes('auth');
    });

    const issues: string[] = [];
    
    if (remainingUserKeys.length > 0) {
      issues.push(`仍有 ${remainingUserKeys.length} 个用户相关的localStorage键`);
    }

    const sessionKeys = this.getSessionStorageKeys();
    if (sessionKeys.length > 0) {
      issues.push(`仍有 ${sessionKeys.length} 个sessionStorage键`);
    }

    return {
      isClean: issues.length === 0,
      remainingKeys: remainingUserKeys,
      issues
    };
  }
}

/**
 * React Hook: 用户切换数据清理
 */
export function useUserSwitchDataCleaner() {
  const cleaner = UserSwitchDataCleaner.getInstance();
  
  return {
    performLogoutCleanup: (userId: string) => cleaner.performLogoutCleanup(userId),
    performLoginCleanup: (newUserId: string, oldUserId?: string) => 
      cleaner.performLoginCleanup(newUserId, oldUserId),
    performDeepCleanup: () => cleaner.performDeepCleanup(),
    validateCleanupResult: (userId: string) => cleaner.validateCleanupResult(userId)
  };
}

export const userSwitchDataCleaner = UserSwitchDataCleaner.getInstance();