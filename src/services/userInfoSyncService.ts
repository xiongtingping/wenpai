/**
 * 🔧 用户信息同步服务
 * 🎯 目标：确保不同登录方式的用户信息在各个存储位置保持一致
 * 📌 核心功能：
 * 1. 多存储位置同步
 * 2. 数据一致性检查
 * 3. 冲突解决策略
 * 4. 自动修复机制
 */

// import i18n from '@/i18n'; // 改为动态导入避免TDZ
import { logger } from '@/utils/logger';
import { StandardUserInfo, normalizeUserInfo } from './userInfoNormalizer';

/**
 * 存储位置枚举
 */
export enum StorageLocation {
  LOCAL_STORAGE = 'localStorage',
  SESSION_STORAGE = 'sessionStorage',
  GLOBAL_STATE = 'globalState',
  MEMORY_CACHE = 'memoryCache'
}

/**
 * 同步状态
 */
export interface SyncStatus {
  /** 是否同步成功 */
  success: boolean;
  /** 同步时间 */
  timestamp: string;
  /** 同步的存储位置 */
  locations: StorageLocation[];
  /** 错误信息 */
  errors?: string[];
  /** 冲突信息 */
  conflicts?: ConflictInfo[];
}

/**
 * 冲突信息
 */
export interface ConflictInfo {
  /** 冲突字段 */
  field: string;
  /** 不同来源的值 */
  values: { [location: string]: any };
  /** 解决策略 */
  resolution: 'latest' | 'manual' | 'merge';
  /** 最终采用的值 */
  resolvedValue: any;
}

/**
 * 用户信息存储项
 */
interface UserInfoStorageItem {
  userInfo: StandardUserInfo;
  timestamp: string;
  location: StorageLocation;
}

/**
 * 用户信息同步服务类
 */
export class UserInfoSyncService {
  private memoryCache: Map<string, StandardUserInfo> = new Map();
  private globalStateUpdater?: (userInfo: StandardUserInfo) => void;

  /**
   * 设置全局状态更新器
   */
  setGlobalStateUpdater(updater: (userInfo: StandardUserInfo) => void): void {
    this.globalStateUpdater = updater;
  }

  /**
   * 同步用户信息到所有存储位置
   * @param userInfo 标准化的用户信息
   * @returns 同步状态
   */
  async syncUserInfo(userInfo: StandardUserInfo): Promise<SyncStatus> {
    logger.debug('🔄 开始同步用户信息到所有存储位置:', userInfo.id);

    const syncStatus: SyncStatus = {
      success: true,
      timestamp: new Date().toISOString(),
      locations: [],
      errors: [],
      conflicts: []
    };

    try {
      // 1. 同步到 localStorage
      await this.syncToLocalStorage(userInfo, syncStatus);

      // 2. 同步到 sessionStorage
      await this.syncToSessionStorage(userInfo, syncStatus);

      // 3. 同步到内存缓存
      await this.syncToMemoryCache(userInfo, syncStatus);

      // 4. 同步到全局状态
      await this.syncToGlobalState(userInfo, syncStatus);

      logger.debug('✅ 用户信息同步完成:', syncStatus);

    } catch (error) {
      logger.error('❌ 用户信息同步失败:', error);
      syncStatus.success = false;
      syncStatus.errors?.push(error instanceof Error ? error.message : '未知错误');
    }

    return syncStatus;
  }

  /**
   * 检查数据一致性
   * @param userId 用户ID
   * @returns 一致性检查结果
   */
  async checkConsistency(userId: string): Promise<{
    isConsistent: boolean;
    conflicts: ConflictInfo[];
    recommendations: string[];
  }> {
    logger.debug('🔍 检查用户信息一致性:', userId);

    const userInfoSources: UserInfoStorageItem[] = [];

    // 从各个存储位置获取用户信息
    try {
      // localStorage
      const localStorageData = this.getFromLocalStorage(userId);
      if (localStorageData) {
        userInfoSources.push({
          userInfo: localStorageData,
          timestamp: localStorageData.lastUpdated,
          location: StorageLocation.LOCAL_STORAGE
        });
      }

      // sessionStorage
      const sessionStorageData = this.getFromSessionStorage(userId);
      if (sessionStorageData) {
        userInfoSources.push({
          userInfo: sessionStorageData,
          timestamp: sessionStorageData.lastUpdated,
          location: StorageLocation.SESSION_STORAGE
        });
      }

      // memoryCache
      const memoryCacheData = this.memoryCache.get(userId);
      if (memoryCacheData) {
        userInfoSources.push({
          userInfo: memoryCacheData,
          timestamp: memoryCacheData.lastUpdated,
          location: StorageLocation.MEMORY_CACHE
        });
      }

    } catch (error) {
      logger.error('❌ 获取用户信息时出错:', error);
    }

    // 分析冲突
    const conflicts = this.analyzeConflicts(userInfoSources);
    const isConsistent = conflicts.length === 0;

    // 生成建议
    const recommendations = this.generateRecommendations(conflicts);

    logger.debug('🔍 一致性检查完成:', { isConsistent, conflicts: conflicts.length });

    return {
      isConsistent,
      conflicts,
      recommendations
    };
  }

  /**
   * 自动修复数据不一致
   * @param userId 用户ID
   * @returns 修复结果
   */
  async autoRepair(userId: string): Promise<{
    success: boolean;
    repairedFields: string[];
    errors: string[];
  }> {
    logger.debug('🔧 开始自动修复用户信息不一致:', userId);

    const consistencyCheck = await this.checkConsistency(userId);
    
    if (consistencyCheck.isConsistent) {
      logger.debug('✅ 用户信息已一致，无需修复');
      return {
        success: true,
        repairedFields: [],
        errors: []
      };
    }

    const repairedFields: string[] = [];
    const errors: string[] = [];

    try {
      // 解决冲突并生成修复后的用户信息
      const repairedUserInfo = this.resolveConflicts(consistencyCheck.conflicts);
      
      if (repairedUserInfo) {
        // 同步修复后的信息到所有位置
        const syncResult = await this.syncUserInfo(repairedUserInfo);
        
        if (syncResult.success) {
          repairedFields.push(...consistencyCheck.conflicts.map(c => c.field));
          logger.debug('✅ 用户信息自动修复完成');
        } else {
          errors.push(...(syncResult.errors || []));
        }
      }

    } catch (error) {
      logger.error('❌ 自动修复失败:', error);
      errors.push(error instanceof Error ? error.message : 'u64cdu4f5cu5931u8d25');
    }

    return {
      success: errors.length === 0,
      repairedFields,
      errors
    };
  }

  /**
   * 同步到 localStorage
   */
  private async syncToLocalStorage(userInfo: StandardUserInfo, syncStatus: SyncStatus): Promise<void> {
    try {
      const storageKey = 'authing_user';
      localStorage.setItem(storageKey, JSON.stringify(userInfo));
      syncStatus.locations.push(StorageLocation.LOCAL_STORAGE);
      logger.debug('✅ 同步到 localStorage 成功');
    } catch (error) {
      logger.error('❌ 同步到 localStorage 失败:', error);
      syncStatus.errors?.push(`localStorage: ${error}`);
    }
  }

  /**
   * 同步到 sessionStorage
   */
  private async syncToSessionStorage(userInfo: StandardUserInfo, syncStatus: SyncStatus): Promise<void> {
    try {
      const storageKey = 'user_session_backup';
      sessionStorage.setItem(storageKey, JSON.stringify(userInfo));
      syncStatus.locations.push(StorageLocation.SESSION_STORAGE);
      logger.debug('✅ 同步到 sessionStorage 成功');
    } catch (error) {
      logger.error('❌ 同步到 sessionStorage 失败:', error);
      syncStatus.errors?.push(`sessionStorage: ${error}`);
    }
  }

  /**
   * 同步到内存缓存
   */
  private async syncToMemoryCache(userInfo: StandardUserInfo, syncStatus: SyncStatus): Promise<void> {
    try {
      this.memoryCache.set(userInfo.id, userInfo);
      syncStatus.locations.push(StorageLocation.MEMORY_CACHE);
      logger.debug('✅ 同步到内存缓存成功');
    } catch (error) {
      logger.error('❌ 同步到内存缓存失败:', error);
      syncStatus.errors?.push(`memoryCache: ${error}`);
    }
  }

  /**
   * 同步到全局状态
   */
  private async syncToGlobalState(userInfo: StandardUserInfo, syncStatus: SyncStatus): Promise<void> {
    try {
      if (this.globalStateUpdater) {
        this.globalStateUpdater(userInfo);
        syncStatus.locations.push(StorageLocation.GLOBAL_STATE);
        logger.debug('✅ 同步到全局状态成功');
      } else {
        logger.warn('⚠️ 全局状态更新器未设置');
      }
    } catch (error) {
      logger.error('❌ 同步到全局状态失败:', error);
      syncStatus.errors?.push(`globalState: ${error}`);
    }
  }

  /**
   * 从 localStorage 获取用户信息
   */
  private getFromLocalStorage(userId: string): StandardUserInfo | null {
    try {
      const data = localStorage.getItem('authing_user');
      if (data) {
        const parsed = JSON.parse(data);
        if (parsed.id === userId) {
          return parsed;
        }
      }
    } catch (error) {
      logger.error('❌ 从 localStorage 获取用户信息失败:', error);
    }
    return null;
  }

  /**
   * 从 sessionStorage 获取用户信息
   */
  private getFromSessionStorage(userId: string): StandardUserInfo | null {
    try {
      const data = sessionStorage.getItem('user_session_backup');
      if (data) {
        const parsed = JSON.parse(data);
        if (parsed.id === userId) {
          return parsed;
        }
      }
    } catch (error) {
      logger.error('❌ 从 sessionStorage 获取用户信息失败:', error);
    }
    return null;
  }

  /**
   * 分析冲突
   */
  private analyzeConflicts(sources: UserInfoStorageItem[]): ConflictInfo[] {
    if (sources.length <= 1) return [];

    const conflicts: ConflictInfo[] = [];
    const fields = ['username', 'nickname', 'email', 'phone', 'avatar'];

    for (const field of fields) {
      const values: { [location: string]: any } = {};
      const uniqueValues = new Set();

      for (const source of sources) {
        const value = (source.userInfo as any)[field];
        values[source.location] = value;
        if (value !== null && value !== undefined) {
          uniqueValues.add(value);
        }
      }

      // 如果有多个不同的非空值，则存在冲突
      if (uniqueValues.size > 1) {
        conflicts.push({
          field,
          values,
          resolution: 'latest',
          resolvedValue: this.resolveFieldConflict(field, sources)
        });
      }
    }

    return conflicts;
  }

  /**
   * 解决字段冲突
   */
  private resolveFieldConflict(field: string, sources: UserInfoStorageItem[]): any {
    // 使用最新时间戳的值
    const sortedSources = sources.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    for (const source of sortedSources) {
      const value = (source.userInfo as any)[field];
      if (value !== null && value !== undefined) {
        return value;
      }
    }

    return null;
  }

  /**
   * 解决所有冲突
   */
  private resolveConflicts(conflicts: ConflictInfo[]): StandardUserInfo | null {
    if (conflicts.length === 0) return null;

    // 获取基础用户信息（使用第一个冲突中的任意一个源）
    const firstConflict = conflicts[0];
    const baseUserInfo = Object.values(firstConflict.values)[0] as StandardUserInfo;

    if (!baseUserInfo) return null;

    // 应用冲突解决结果
    const resolvedUserInfo = { ...baseUserInfo };
    for (const conflict of conflicts) {
      (resolvedUserInfo as any)[conflict.field] = conflict.resolvedValue;
    }

    resolvedUserInfo.lastUpdated = new Date().toISOString();
    return resolvedUserInfo;
  }

  /**
   * 生成修复建议
   */
  private generateRecommendations(conflicts: ConflictInfo[]): string[] {
    const recommendations: string[] = [];

    if (conflicts.length === 0) {
      recommendations.push('用户信息在所有存储位置保持一致');
    } else {
      recommendations.push(`发现 ${conflicts.length} 个字段存在不一致`);
      recommendations.push('建议执行自动修复以统一数据');
      
      for (const conflict of conflicts) {
        recommendations.push(`${conflict.field} 字段存在冲突，将使用最新值`);
      }
    }

    return recommendations;
  }
}

// 导出默认实例
export const userInfoSyncService = new UserInfoSyncService();
