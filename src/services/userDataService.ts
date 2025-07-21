/**
 * 用户数据服务
 * 管理用户行为数据、页面访问记录、功能使用统计等
 */

import { useAuthStore } from '@/store/authStore';

/**
 * 页面访问记录
 */
export interface PageVisit {
  page: string;
  timestamp: string;
  duration?: number;
  metadata?: Record<string, unknown>;
}

/**
 * 功能使用记录
 */
export interface FeatureUsage {
  feature: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

/**
 * 内容创建记录
 */
export interface ContentCreated {
  type: string;
  title: string;
  timestamp: string;
  contentId: string;
  metadata?: Record<string, unknown>;
}

/**
 * 用户行为数据
 */
export interface UserActions {
  pageVisits: PageVisit[];
  featureUsage: FeatureUsage[];
  contentCreated: ContentCreated[];
}

/**
 * 用户数据记录
 */
export interface UserDataRecord {
  userId: string;
  isTempUser: boolean;
  realUserId?: string;
  userInfo: any;
  userActions: UserActions;
  createdAt: string;
  updatedAt: string;
}

/**
 * 用户数据服务类
 */
class UserDataService {
  private static instance: UserDataService;
  private storageKey = 'wenpai_user_data';
  private tempUserPrefix = 'temp_';

  private constructor() {}

  /**
   * 获取单例实例
   */
  static getInstance(): UserDataService {
    if (!UserDataService.instance) {
      UserDataService.instance = new UserDataService();
    }
    return UserDataService.instance;
  }

  /**
   * 获取本地存储的用户数据
   */
  private getLocalStorage(): Record<string, UserDataRecord> {
    try {
      const data = localStorage.getItem(this.storageKey);
      return data ? JSON.parse(data) : {};
    } catch (error) {
      console.error('读取本地存储失败:', error);
      return {};
    }
  }

  /**
   * 保存用户数据到本地存储
   */
  private saveToLocalStorage(data: Record<string, UserDataRecord>): void {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(data));
    } catch (error) {
      console.error('保存到本地存储失败:', error);
    }
  }

  /**
   * 获取或创建用户数据记录
   */
  private getOrCreateUserRecord(userId: string, isTempUser: boolean = false): UserDataRecord {
    const storage = this.getLocalStorage();
    const key = isTempUser ? `${this.tempUserPrefix}${userId}` : userId;
    
    if (!storage[key]) {
      storage[key] = {
        userId,
        isTempUser,
        userInfo: {},
        userActions: {
          pageVisits: [],
          featureUsage: [],
          contentCreated: []
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      this.saveToLocalStorage(storage);
    }
    
    return storage[key];
  }

  /**
   * 更新用户数据记录
   */
  private updateUserRecord(record: UserDataRecord): void {
    const storage = this.getLocalStorage();
    const key = record.isTempUser ? `${this.tempUserPrefix}${record.userId}` : record.userId;
    
    record.updatedAt = new Date().toISOString();
    storage[key] = record;
    this.saveToLocalStorage(storage);
  }

  /**
   * 记录页面访问
   */
  async recordPageVisit(userId: string, page: string, duration?: number, metadata?: Record<string, unknown>): Promise<void> {
    const isTempUser = userId.startsWith(this.tempUserPrefix);
    const actualUserId = isTempUser ? userId.replace(this.tempUserPrefix, '') : userId;
    
    const record = this.getOrCreateUserRecord(actualUserId, isTempUser);
    
    record.userActions.pageVisits.push({
      page,
      timestamp: new Date().toISOString(),
      duration,
      metadata
    });
    
    this.updateUserRecord(record);
  }

  /**
   * 记录功能使用
   */
  async recordFeatureUsage(userId: string, feature: string, metadata?: Record<string, unknown>): Promise<void> {
    const isTempUser = userId.startsWith(this.tempUserPrefix);
    const actualUserId = isTempUser ? userId.replace(this.tempUserPrefix, '') : userId;
    
    const record = this.getOrCreateUserRecord(actualUserId, isTempUser);
    
    record.userActions.featureUsage.push({
      feature,
      timestamp: new Date().toISOString(),
      metadata
    });
    
    this.updateUserRecord(record);
  }

  /**
   * 记录内容创建
   */
  async recordContentCreated(userId: string, type: string, title: string, contentId: string, metadata?: Record<string, unknown>): Promise<void> {
    const isTempUser = userId.startsWith(this.tempUserPrefix);
    const actualUserId = isTempUser ? userId.replace(this.tempUserPrefix, '') : userId;
    
    const record = this.getOrCreateUserRecord(actualUserId, isTempUser);
    
    record.userActions.contentCreated.push({
      type,
      title,
      timestamp: new Date().toISOString(),
      contentId,
      metadata
    });
    
    this.updateUserRecord(record);
  }

  /**
   * 获取正式用户数据
   */
  async getRealUserData(userId: string): Promise<UserDataRecord[]> {
    const storage = this.getLocalStorage();
    const records: UserDataRecord[] = [];
    
    // 获取正式用户数据
    if (storage[userId]) {
      records.push(storage[userId]);
    }
    
    // 获取关联的临时用户数据
    Object.values(storage).forEach(record => {
      if (record.realUserId === userId) {
        records.push(record);
      }
    });
    
    return records;
  }

  /**
   * 获取临时用户数据
   */
  async getTempUserData(userId: string): Promise<UserDataRecord[]> {
    const storage = this.getLocalStorage();
    const key = `${this.tempUserPrefix}${userId}`;
    
    return storage[key] ? [storage[key]] : [];
  }

  /**
   * 删除用户数据
   */
  async deleteUserData(userId: string): Promise<void> {
    const storage = this.getLocalStorage();
    const isTempUser = userId.startsWith(this.tempUserPrefix);
    const key = isTempUser ? userId : userId;
    
    if (storage[key]) {
      delete storage[key];
      this.saveToLocalStorage(storage);
    }
  }

  /**
   * 绑定临时用户到正式用户
   */
  async bindTempUserToRealUser(tempUserId: string, realUserId: string): Promise<void> {
    const storage = this.getLocalStorage();
    const tempKey = `${this.tempUserPrefix}${tempUserId}`;
    
    if (storage[tempKey]) {
      storage[tempKey].realUserId = realUserId;
      storage[tempKey].isTempUser = false;
      storage[tempKey].userId = realUserId;
      
      // 移动到正式用户键
      storage[realUserId] = storage[tempKey];
      delete storage[tempKey];
      
      this.saveToLocalStorage(storage);
    }
  }

  /**
   * 获取用户统计数据
   */
  async getUserStats(userId: string): Promise<{
    totalPageVisits: number;
    totalFeatureUsage: number;
    totalContentCreated: number;
    lastActivity: string | null;
  }> {
    const records = await this.getRealUserData(userId);
    
    let totalPageVisits = 0;
    let totalFeatureUsage = 0;
    let totalContentCreated = 0;
    let lastActivity: string | null = null;
    
    records.forEach(record => {
      totalPageVisits += record.userActions.pageVisits.length;
      totalFeatureUsage += record.userActions.featureUsage.length;
      totalContentCreated += record.userActions.contentCreated.length;
      
      // 找到最新的活动时间
      const allActivities = [
        ...record.userActions.pageVisits.map(v => v.timestamp),
        ...record.userActions.featureUsage.map(f => f.timestamp),
        ...record.userActions.contentCreated.map(c => c.timestamp)
      ];
      
      const latestActivity = allActivities.sort().pop();
      if (latestActivity && (!lastActivity || latestActivity > lastActivity)) {
        lastActivity = latestActivity;
      }
    });
    
    return {
      totalPageVisits,
      totalFeatureUsage,
      totalContentCreated,
      lastActivity
    };
  }

  /**
   * 清理过期数据（保留30天）
   */
  async cleanupExpiredData(): Promise<void> {
    const storage = this.getLocalStorage();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    let hasChanges = false;
    
    Object.keys(storage).forEach(key => {
      const record = storage[key];
      const lastActivity = new Date(record.updatedAt);
      
      if (lastActivity < thirtyDaysAgo) {
        delete storage[key];
        hasChanges = true;
      }
    });
    
    if (hasChanges) {
      this.saveToLocalStorage(storage);
    }
  }
}

export default UserDataService; 