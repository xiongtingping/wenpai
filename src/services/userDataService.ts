/**
 * 用户数据服务
 * 管理用户行为数据、页面访问记录、功能使用统计等
 * 🔒 已迁移至 Supabase 数据库，移除 localStorage 依赖
 */

import { createDataService, TABLE_NAMES } from '@/services/supabaseDataService';
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
   * 获取数据库服务实例
   */
  private getDataService(userId: string) {
    if (!userId || userId === 'undefined') {
      throw new Error('用户ID不能为空');
    }
    return createDataService(userId, TABLE_NAMES.USER_USAGE_LOGS);
  }

  /**
   * 获取或创建用户数据记录
   */
  private async getOrCreateUserRecord(userId: string, isTempUser: boolean = false): Promise<UserDataRecord> {
    if (!userId || userId === 'undefined') {
      throw new Error('用户ID不能为空');
    }

    const dataService = this.getDataService(userId);
    
    try {
      // 尝试查找现有记录
      const existing = await dataService.findMany<UserDataRecord>({
        filters: { isTempUser },
        limit: 1
      });
      
      if (existing.data && existing.data.length > 0) {
        return existing.data[0];
      }
      
      // 创建新记录
      const newRecord = await dataService.create<UserDataRecord>({
        isTempUser,
        userInfo: {},
        userActions: {
          pageVisits: [],
          featureUsage: [],
          contentCreated: []
        }
      });
      
      return newRecord;
    } catch (error) {
      console.error('获取或创建用户记录失败:', error);
      throw new Error(`数据库操作失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  }

  /**
   * 记录页面访问
   */
  async recordPageVisit(userId: string, page: string, duration?: number, metadata?: Record<string, unknown>): Promise<void> {
    try {
      const isTempUser = userId.startsWith(this.tempUserPrefix);
      const actualUserId = isTempUser ? userId.replace(this.tempUserPrefix, '') : userId;
      
      const record = await this.getOrCreateUserRecord(actualUserId, isTempUser);
      
      record.userActions.pageVisits.push({
        page,
        timestamp: new Date().toISOString(),
        duration,
        metadata
      });
      
      const dataService = this.getDataService(actualUserId);
      await dataService.update(record.id!, { userActions: record.userActions });
    } catch (error) {
      console.error('记录页面访问失败:', error);
      throw error;
    }
  }

  /**
   * 记录功能使用
   */
  async recordFeatureUsage(userId: string, feature: string, metadata?: Record<string, unknown>): Promise<void> {
    try {
      const isTempUser = userId.startsWith(this.tempUserPrefix);
      const actualUserId = isTempUser ? userId.replace(this.tempUserPrefix, '') : userId;
      
      const record = await this.getOrCreateUserRecord(actualUserId, isTempUser);
      
      record.userActions.featureUsage.push({
        feature,
        timestamp: new Date().toISOString(),
        metadata
      });
      
      const dataService = this.getDataService(actualUserId);
      await dataService.update(record.id!, { userActions: record.userActions });
    } catch (error) {
      console.error('记录功能使用失败:', error);
      throw error;
    }
  }

  /**
   * 记录内容创建
   */
  async recordContentCreated(userId: string, type: string, title: string, contentId: string, metadata?: Record<string, unknown>): Promise<void> {
    try {
      const isTempUser = userId.startsWith(this.tempUserPrefix);
      const actualUserId = isTempUser ? userId.replace(this.tempUserPrefix, '') : userId;
      
      const record = await this.getOrCreateUserRecord(actualUserId, isTempUser);
      
      record.userActions.contentCreated.push({
        type,
        title,
        timestamp: new Date().toISOString(),
        contentId,
        metadata
      });
      
      const dataService = this.getDataService(actualUserId);
      await dataService.update(record.id!, { userActions: record.userActions });
    } catch (error) {
      console.error('记录内容创建失败:', error);
      throw error;
    }
  }

  /**
   * 获取正式用户数据
   */
  async getRealUserData(userId: string): Promise<UserDataRecord[]> {
    try {
      const dataService = this.getDataService(userId);
      
      // 获取正式用户数据和关联的临时用户数据
      const result = await dataService.findMany<UserDataRecord>({
        filters: { 
          // 获取正式用户数据或realUserId匹配的临时用户数据
          $or: [
            { isTempUser: false },
            { realUserId: userId }
          ]
        }
      });
      
      return result.data || [];
    } catch (error) {
      console.error('获取正式用户数据失败:', error);
      throw error;
    }
  }

  /**
   * 获取临时用户数据
   */
  async getTempUserData(userId: string): Promise<UserDataRecord[]> {
    try {
      const dataService = this.getDataService(userId);
      
      const result = await dataService.findMany<UserDataRecord>({
        filters: { isTempUser: true }
      });
      
      return result.data || [];
    } catch (error) {
      console.error('获取临时用户数据失败:', error);
      throw error;
    }
  }

  /**
   * 删除用户数据
   */
  async deleteUserData(userId: string): Promise<void> {
    try {
      const isTempUser = userId.startsWith(this.tempUserPrefix);
      const actualUserId = isTempUser ? userId.replace(this.tempUserPrefix, '') : userId;
      
      const dataService = this.getDataService(actualUserId);
      
      // 删除用户所有数据
      await dataService.clearAllUserData();
    } catch (error) {
      console.error('删除用户数据失败:', error);
      throw error;
    }
  }

  /**
   * 绑定临时用户到正式用户
   */
  async bindTempUserToRealUser(tempUserId: string, realUserId: string): Promise<void> {
    try {
      const tempDataService = this.getDataService(tempUserId);
      const realDataService = this.getDataService(realUserId);
      
      // 查找临时用户数据
      const tempData = await tempDataService.findMany<UserDataRecord>({
        filters: { isTempUser: true }
      });
      
      if (tempData.data && tempData.data.length > 0) {
        for (const record of tempData.data) {
          // 更新为正式用户数据
          await realDataService.create({
            ...record,
            userId: realUserId,
            realUserId: realUserId,
            isTempUser: false
          });
          
          // 删除临时数据
          await tempDataService.delete(record.id!);
        }
      }
    } catch (error) {
      console.error('绑定临时用户到正式用户失败:', error);
      throw error;
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
    try {
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
    } catch (error) {
      console.error('获取用户统计数据失败:', error);
      throw error;
    }
  }

  /**
   * 清理过期数据（保留30天）
   */
  async cleanupExpiredData(): Promise<void> {
    // 注意：由于我们现在使用数据库，过期数据清理应该由数据库定期任务处理
    // 这里保留接口但不执行本地清理
    console.log('数据库中的过期数据清理应由后端定期任务处理');
  }
}

export default UserDataService;

// 🚨 重要提醒：此服务已完全迁移至 Supabase 数据库
// - 移除了所有 localStorage 依赖
// - 所有操作都会抛出数据库错误，不再有本地降级方案
// - 确保用户数据隔离和安全访问
// - 如果数据库不可用，相关功能将无法使用 