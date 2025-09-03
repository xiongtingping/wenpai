/**
 * ✅ 用户数据隔离工具
 * 🎯 用途：统一管理用户数据存储，确保不同用户的数据完全隔离
 * 📌 核心功能：
 * 1. 统一的存储键生成策略
 * 2. 用户数据的安全隔离
 * 3. 访客模式支持
 * 4. 自动用户切换响应
 */

import { useAuth } from '@/hooks/useAuth';
import { getUserDisplayName } from '@/utils/userDisplayUtils';
import { logger } from '@/utils/logger';

/**
 * 用户数据隔离接口
 */
export interface UserDataIsolationConfig {
  modulePrefix: string;  // 模块前缀，如 'library_items', 'chat_history'
  fallbackToGuest?: boolean;  // 是否在未登录时使用访客模式
  enableLogging?: boolean;    // 是否启用调试日志
}

/**
 * 存储操作结果
 */
export interface StorageResult<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  storageKey?: string;
}

/**
 * 用户数据隔离管理器
 */
export class UserDataIsolationManager {
  private config: UserDataIsolationConfig;
  private user: any;

  constructor(config: UserDataIsolationConfig, user?: any) {
    this.config = {
      fallbackToGuest: true,
      enableLogging: true,
      ...config
    };
    this.user = user;
  }

  /**
   * 生成用户专属的存储键
   */
  getStorageKey(): string {
    const { modulePrefix, fallbackToGuest } = this.config;
    
    if (this.user?.id) {
      const storageKey = `${modulePrefix}_${this.user.id}`;
      this.log(`🔑 使用用户存储键: ${storageKey}`);
      return storageKey;
    }
    
    if (fallbackToGuest) {
      const storageKey = `${modulePrefix}_guest`;
      this.log(`🔑 使用访客存储键: ${storageKey}`);
      return storageKey;
    }
    
    throw new Error(`用户未登录且未启用访客模式: ${modulePrefix}`);
  }

  /**
   * 保存用户数据
   */
  saveData<T>(data: T): StorageResult<T> {
    try {
      const storageKey = this.getStorageKey();
      const serializedData = JSON.stringify(data);
      
      localStorage.setItem(storageKey, serializedData);
      
      this.log(`💾 数据已保存: ${storageKey}`, data);
      
      return {
        success: true,
        data,
        storageKey
      };
    } catch (error) {
      const errorMessage = `保存数据失败: ${error}`;
      console.error(`❌ ${errorMessage}`);
      
      return {
        success: false,
        error: errorMessage
      };
    }
  }

  /**
   * 加载用户数据
   */
  loadData<T>(): StorageResult<T> {
    try {
      const storageKey = this.getStorageKey();
      const serializedData = localStorage.getItem(storageKey);
      
      if (!serializedData) {
        // 降低日志级别，避免循环日志
        if (this.config.enableLogging) {
          console.debug(`📂 没有找到数据: ${storageKey}`);
        }
        return {
          success: true,
          data: undefined,
          storageKey
        };
      }
      
      const data = JSON.parse(serializedData);
      this.log(`📂 数据已加载: ${storageKey}`, data);
      
      return {
        success: true,
        data,
        storageKey
      };
    } catch (error) {
      const errorMessage = `加载数据失败: ${error}`;
      console.error(`❌ ${errorMessage}`);
      
      return {
        success: false,
        error: errorMessage
      };
    }
  }

  /**
   * 删除用户数据
   */
  removeData(): StorageResult {
    try {
      const storageKey = this.getStorageKey();
      localStorage.removeItem(storageKey);
      
      this.log(`🗑️ 数据已删除: ${storageKey}`);
      
      return {
        success: true,
        storageKey
      };
    } catch (error) {
      const errorMessage = `删除数据失败: ${error}`;
      console.error(`❌ ${errorMessage}`);
      
      return {
        success: false,
        error: errorMessage
      };
    }
  }

  /**
   * 检查数据是否存在
   */
  hasData(): boolean {
    try {
      const storageKey = this.getStorageKey();
      const data = localStorage.getItem(storageKey);
      return data !== null;
    } catch (error) {
      console.error(`❌ 检查数据存在性失败: ${error}`);
      return false;
    }
  }

  /**
   * 获取数据大小（字符数）
   */
  getDataSize(): number {
    try {
      const storageKey = this.getStorageKey();
      const data = localStorage.getItem(storageKey);
      return data ? data.length : 0;
    } catch (error) {
      console.error(`❌ 获取数据大小失败: ${error}`);
      return 0;
    }
  }

  /**
   * 更新用户引用
   */
  updateUser(user: any): void {
    this.user = user;
  }

  /**
   * 调试日志
   */
  private log(message: string, data?: any): void {
    if (this.config.enableLogging) {
      if (data) {
        console.log(message, data);
      } else {
        console.log(message);
      }
    }
  }
}

/**
 * React Hook: 用户数据隔离
 */
export function useUserDataIsolation(config: UserDataIsolationConfig) {
  const { user } = useAuth();
  
  const manager = new UserDataIsolationManager(config, user);
  
  return {
    getStorageKey: () => manager.getStorageKey(),
    saveData: <T>(data: T) => manager.saveData(data),
    loadData: <T>() => manager.loadData<T>(),
    removeData: () => manager.removeData(),
    hasData: () => manager.hasData(),
    getDataSize: () => manager.getDataSize(),
    user,
    isLoggedIn: !!user?.id,
    isGuest: !user?.id
  };
}

/**
 * 工具函数：生成存储键
 */
export function generateStorageKey(modulePrefix: string, user?: any): string {
  if (user?.id) {
    return `${modulePrefix}_${user.id}`;
  }
  return `${modulePrefix}_guest`;
}

/**
 * 工具函数：批量迁移数据
 */
export function migrateUserData(oldKey: string, newKey: string): boolean {
  try {
    const data = localStorage.getItem(oldKey);
    if (data) {
      localStorage.setItem(newKey, data);
      localStorage.removeItem(oldKey);
      logger.debug('✅ 数据迁移成功: ${oldKey} -> ${newKey}');
      return true;
    }
    return false;
  } catch (error) {
    console.error(`❌ 数据迁移失败: ${oldKey} -> ${newKey}`, error);
    return false;
  }
}

/**
 * 工具函数：清理用户数据
 */
export function cleanupUserData(userId: string): number {
  let cleanedCount = 0;
  
  try {
    const keys = Object.keys(localStorage);
    const userKeys = keys.filter(key => key.includes(`_${userId}`));
    
    userKeys.forEach(key => {
      localStorage.removeItem(key);
      cleanedCount++;
    });
    
    logger.debug('✅ 清理用户数据完成: ${userId}, 清理了 ${cleanedCount} 项');
  } catch (error) {
    console.error(`❌ 清理用户数据失败: ${userId}`, error);
  }
  
  return cleanedCount;
}

/**
 * 工具函数：获取所有用户的数据统计
 */
export function getUserDataStats(): Record<string, number> {
  const stats: Record<string, number> = {};
  
  try {
    const keys = Object.keys(localStorage);
    
    keys.forEach(key => {
      const parts = key.split('_');
      if (parts.length >= 2) {
        const userId = parts[parts.length - 1];
        stats[userId] = (stats[userId] || 0) + 1;
      }
    });
    
    console.log('📊 用户数据统计:', stats);
  } catch (error) {
    console.error('❌ 获取用户数据统计失败:', error);
  }
  
  return stats;
}
