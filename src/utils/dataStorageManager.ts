/**
 * 🗄️ 数据存储管理器
 * 实现用户数据隔离和分层存储策略
 * 
 * 存储策略：
 * - Supabase 数据库：用户资料、业务数据（订单、笔记、文件、日志等）
 * - localStorage：UI偏好设置（主题、语言、布局偏好）
 * - sessionStorage：临时数据（表单缓存、草稿）
 */

// import i18n from '@/i18n'; // 改为动态导入避免TDZ
import { useAuth } from '@/hooks/useAuth';

export type StorageType = 'database' | 'localStorage' | 'sessionStorage';

export interface StorageConfig {
  type: StorageType;
  requireAuth?: boolean;
  sensitive?: boolean;
  prefix?: string;
  ttl?: number; // 生存时间（毫秒）
}

export interface StorageItem<T = any> {
  value: T;
  timestamp: number;
  ttl?: number;
  userId?: string;
}

/**
 * 数据分类配置
 */
export const DATA_STORAGE_CONFIG: Record<string, StorageConfig> = {
  // 数据库存储 - 业务数据
  'user_profile': { type: 'database', requireAuth: true, sensitive: true },
  'user_subscription': { type: 'database', requireAuth: true, sensitive: true },
  'user_orders': { type: 'database', requireAuth: true, sensitive: true },
  'user_notes': { type: 'database', requireAuth: true, sensitive: false },
  'user_files': { type: 'database', requireAuth: true, sensitive: false },
  'user_usage_logs': { type: 'database', requireAuth: true, sensitive: false },
  'user_library_items': { type: 'database', requireAuth: true, sensitive: false },
  'user_chat_history': { type: 'database', requireAuth: true, sensitive: false },
  'user_brand_corpus': { type: 'database', requireAuth: true, sensitive: false },
  
  // localStorage - UI偏好设置
  'ui_theme': { type: 'localStorage', requireAuth: false, prefix: 'app:ui' },
  'ui_language': { type: 'localStorage', requireAuth: false, prefix: 'app:ui' },
  'ui_layout': { type: 'localStorage', requireAuth: false, prefix: 'app:ui' },
  'ui_sidebar_collapsed': { type: 'localStorage', requireAuth: false, prefix: 'app:ui' },
  'ui_font_size': { type: 'localStorage', requireAuth: false, prefix: 'app:ui' },
  'ui_color_scheme': { type: 'localStorage', requireAuth: false, prefix: 'app:ui' },
  
  // sessionStorage - 临时数据
  'form_draft': { type: 'sessionStorage', requireAuth: false, prefix: 'app:temp', ttl: 3600000 },
  'search_cache': { type: 'sessionStorage', requireAuth: false, prefix: 'app:temp', ttl: 1800000 },
  'upload_progress': { type: 'sessionStorage', requireAuth: false, prefix: 'app:temp', ttl: 600000 },
  'wizard_state': { type: 'sessionStorage', requireAuth: false, prefix: 'app:temp', ttl: 3600000 },

  // 动态表单草稿（支持任意key）
  'form_draft_note_draft': { type: 'sessionStorage', requireAuth: false, prefix: 'app:temp', ttl: 3600000 }
};

/**
 * 数据存储管理器类
 */
export class DataStorageManager {
  private user: any;
  private isAuthenticated: boolean;

  constructor(user?: any, isAuthenticated = false) {
    this.user = user;
    this.isAuthenticated = isAuthenticated;
  }

  /**
   * 生成存储键
   */
  private generateStorageKey(dataType: string, config: StorageConfig): string {
    const prefix = config.prefix || 'app';
    
    if (config.requireAuth && this.user?.id) {
      return `${prefix}:${dataType}:${this.user.id}`;
    }
    
    if (config.requireAuth && !this.user?.id) {
      throw new Error(`数据类型 ${dataType} 需要用户登录`);
    }
    
    return `${prefix}:${dataType}`;
  }

  /**
   * 验证用户权限
   */
  private validateUserAccess(config: StorageConfig): void {
    if (config.requireAuth && !this.isAuthenticated) {
      throw new Error('u64cdu4f5cu5931u8d25');
    }
    
    if (config.sensitive && !this.user?.id) {
      throw new Error('敏感数据需要有效的用户ID');
    }
  }

  /**
   * 检查数据是否过期
   */
  private isExpired(item: StorageItem): boolean {
    if (!item.ttl) return false;
    return Date.now() - item.timestamp > item.ttl;
  }

  /**
   * 获取存储对象
   */
  private getStorage(type: StorageType): Storage | null {
    switch (type) {
      case 'localStorage':
        return typeof window !== 'undefined' ? window.localStorage : null;
      case 'sessionStorage':
        return typeof window !== 'undefined' ? window.sessionStorage : null;
      default:
        return null;
    }
  }

  /**
   * 保存数据到本地存储
   */
  private saveToLocalStorage(key: string, value: any, config: StorageConfig): void {
    const storage = this.getStorage(config.type as 'localStorage' | 'sessionStorage');
    if (!storage) return;

    const item: StorageItem = {
      value,
      timestamp: Date.now(),
      ttl: config.ttl,
      userId: this.user?.id
    };

    try {
      storage.setItem(key, JSON.stringify(item));
    } catch (error) {
      console.error(`保存到${config.type}失败:`, error);
      throw new Error(`存储空间不足或数据过大`);
    }
  }

  /**
   * 从本地存储加载数据
   */
  private loadFromLocalStorage<T>(key: string, config: StorageConfig): T | null {
    const storage = this.getStorage(config.type as 'localStorage' | 'sessionStorage');
    if (!storage) return null;

    try {
      const data = storage.getItem(key);
      if (!data) return null;

      const item: StorageItem<T> = JSON.parse(data);
      
      // 检查是否过期
      if (this.isExpired(item)) {
        storage.removeItem(key);
        return null;
      }

      // 检查用户权限（如果需要）
      if (config.requireAuth && item.userId !== this.user?.id) {
        return null;
      }

      return item.value;
    } catch (error) {
      console.error(`从${config.type}加载失败:`, error);
      return null;
    }
  }

  /**
   * 获取数据类型配置（支持动态配置）
   */
  private getDataTypeConfig(dataType: string): StorageConfig {
    // 直接匹配
    if (DATA_STORAGE_CONFIG[dataType]) {
      return DATA_STORAGE_CONFIG[dataType];
    }

    // 动态匹配表单草稿
    if (dataType.startsWith('form_draft_')) {
      return { type: 'sessionStorage', requireAuth: false, prefix: 'app:temp', ttl: 3600000 };
    }

    // 动态匹配UI偏好
    if (dataType.startsWith('ui_')) {
      return { type: 'localStorage', requireAuth: false, prefix: 'app:ui' };
    }

    // 动态匹配用户数据
    if (dataType.startsWith('user_')) {
      return { type: 'database', requireAuth: true, sensitive: false };
    }

    // 默认配置
    return { type: 'localStorage', requireAuth: false, prefix: 'app:misc' };
  }

  /**
   * 保存数据
   */
  async save<T>(dataType: string, value: T): Promise<void> {
    const config = this.getDataTypeConfig(dataType);

    this.validateUserAccess(config);

    if (config.type === 'database') {
      await this.saveToDatabase(dataType, value);
    } else {
      const key = this.generateStorageKey(dataType, config);
      this.saveToLocalStorage(key, value, config);
    }
  }

  /**
   * 加载数据
   */
  async load<T>(dataType: string): Promise<T | null> {
    const config = this.getDataTypeConfig(dataType);

    this.validateUserAccess(config);

    if (config.type === 'database') {
      return await this.loadFromDatabase<T>(dataType);
    } else {
      const key = this.generateStorageKey(dataType, config);
      return this.loadFromLocalStorage<T>(key, config);
    }
  }

  /**
   * 删除数据
   */
  async remove(dataType: string): Promise<void> {
    const config = this.getDataTypeConfig(dataType);

    this.validateUserAccess(config);

    if (config.type === 'database') {
      await this.removeFromDatabase(dataType);
    } else {
      const key = this.generateStorageKey(dataType, config);
      const storage = this.getStorage(config.type as 'localStorage' | 'sessionStorage');
      storage?.removeItem(key);
    }
  }

  /**
   * 保存到数据库（需要实现具体的数据库操作）
   */
  private async saveToDatabase<T>(dataType: string, value: T): Promise<void> {
    if (!this.user?.id) {
      throw new Error('数据库操作需要有效的用户ID');
    }

    // TODO: 实现具体的 Supabase 数据库操作
    // 这里应该调用相应的数据库服务
    console.log(`保存到数据库: ${dataType}`, { userId: this.user.id, value });
  }

  /**
   * 从数据库加载（需要实现具体的数据库操作）
   */
  private async loadFromDatabase<T>(dataType: string): Promise<T | null> {
    if (!this.user?.id) {
      throw new Error('数据库操作需要有效的用户ID');
    }

    // TODO: 实现具体的 Supabase 数据库操作
    // 这里应该调用相应的数据库服务
    console.log(`从数据库加载: ${dataType}`, { userId: this.user.id });
    return null;
  }

  /**
   * 从数据库删除（需要实现具体的数据库操作）
   */
  private async removeFromDatabase(dataType: string): Promise<void> {
    if (!this.user?.id) {
      throw new Error('数据库操作需要有效的用户ID');
    }

    // TODO: 实现具体的 Supabase 数据库操作
    // 这里应该调用相应的数据库服务
    console.log(`从数据库删除: ${dataType}`, { userId: this.user.id });
  }

  /**
   * 清理过期数据
   */
  cleanupExpiredData(): void {
    const storageTypes: ('localStorage' | 'sessionStorage')[] = ['localStorage', 'sessionStorage'];
    
    storageTypes.forEach(storageType => {
      const storage = this.getStorage(storageType);
      if (!storage) return;

      const keysToRemove: string[] = [];
      
      for (let i = 0; i < storage.length; i++) {
        const key = storage.key(i);
        if (!key || !key.startsWith('app:')) continue;

        try {
          const data = storage.getItem(key);
          if (!data) continue;

          const item: StorageItem = JSON.parse(data);
          if (this.isExpired(item)) {
            keysToRemove.push(key);
          }
        } catch (error) {
          // 数据格式错误，也删除
          keysToRemove.push(key);
        }
      }

      keysToRemove.forEach(key => storage.removeItem(key));
    });
  }

  /**
   * 用户登出时清理数据
   */
  clearUserData(): void {
    // 清理 sessionStorage 中的所有数据
    const sessionStorage = this.getStorage('sessionStorage');
    if (sessionStorage) {
      const keysToRemove: string[] = [];
      for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i);
        if (key && key.startsWith('app:')) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach(key => sessionStorage.removeItem(key));
    }

    // 清理 localStorage 中的用户相关数据（保留UI偏好）
    const localStorage = this.getStorage('localStorage');
    if (localStorage) {
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('app:') && !key.startsWith('app:ui:')) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach(key => localStorage.removeItem(key));
    }
  }
}

/**
 * React Hook: 数据存储管理
 */
export function useDataStorage() {
  const { user, isAuthenticated } = useAuth();
  
  const manager = new DataStorageManager(user, isAuthenticated);
  
  return {
    save: <T>(dataType: string, value: T) => manager.save(dataType, value),
    load: <T>(dataType: string) => manager.load<T>(dataType),
    remove: (dataType: string) => manager.remove(dataType),
    cleanupExpiredData: () => manager.cleanupExpiredData(),
    clearUserData: () => manager.clearUserData(),
    user,
    isAuthenticated
  };
}

export default DataStorageManager;
