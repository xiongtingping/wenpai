/**
 * 数据同步冲突解决器
 * @description 处理数据同步过程中的冲突，提供多种冲突解决策略
 */

import i18n from '@/i18n';
import { logger } from '@/utils/logger';

/**
 * 冲突类型
 */
export enum ConflictType {
  /** 本地新建，云端也有 */
  LOCAL_NEW_REMOTE_EXISTS = 'local_new_remote_exists',
  /** 本地修改，云端也修改 */
  BOTH_MODIFIED = 'both_modified',
  /** 本地删除，云端修改 */
  LOCAL_DELETED_REMOTE_MODIFIED = 'local_deleted_remote_modified',
  /** 本地修改，云端删除 */
  LOCAL_MODIFIED_REMOTE_DELETED = 'local_modified_remote_deleted',
  /** 版本不匹配 */
  VERSION_MISMATCH = 'version_mismatch'
}

/**
 * 冲突解决策略
 */
export enum ConflictResolutionStrategy {
  /** 本地优先 */
  LOCAL_WINS = 'local_wins',
  /** 远程优先 */
  REMOTE_WINS = 'remote_wins',
  /** 最新时间戳优先 */
  LATEST_TIMESTAMP_WINS = 'latest_timestamp_wins',
  /** 合并数据 */
  MERGE = 'merge',
  /** 手动解决 */
  MANUAL_RESOLUTION = 'manual_resolution',
  /** 创建副本 */
  CREATE_COPY = 'create_copy'
}

/**
 * 数据项接口
 */
export interface SyncDataItem {
  id: string;
  data: any;
  timestamp: number;
  version?: number;
  lastModified?: number;
  checksum?: string;
  source: 'local' | 'remote';
}

/**
 * 冲突信息
 */
export interface DataConflict {
  id: string;
  type: ConflictType;
  localItem: SyncDataItem;
  remoteItem: SyncDataItem;
  dataType: string;
  description: string;
}

/**
 * 冲突解决结果
 */
export interface ConflictResolutionResult {
  success: boolean;
  strategy: ConflictResolutionStrategy;
  resolvedItem?: SyncDataItem;
  needsManualReview?: boolean;
  error?: string;
  details?: string;
}

/**
 * 冲突解决器配置
 */
export interface ConflictResolverConfig {
  /** 默认解决策略 */
  defaultStrategy: ConflictResolutionStrategy;
  /** 数据类型特定策略 */
  typeSpecificStrategies: Record<string, ConflictResolutionStrategy>;
  /** 自动解决阈值（冲突数量） */
  autoResolveThreshold: number;
  /** 是否启用自动备份 */
  enableAutoBackup: boolean;
  /** 手动解决超时时间（毫秒） */
  manualResolveTimeout: number;
}

/**
 * 默认配置
 */
const DEFAULT_CONFIG: ConflictResolverConfig = {
  defaultStrategy: ConflictResolutionStrategy.LATEST_TIMESTAMP_WINS,
  typeSpecificStrategies: {
    'user_preferences': ConflictResolutionStrategy.MERGE,
    'brand_assets': ConflictResolutionStrategy.LATEST_TIMESTAMP_WINS,
    'usage_stats': ConflictResolutionStrategy.REMOTE_WINS,
    'bookmarks': ConflictResolutionStrategy.MERGE,
    'favorites': ConflictResolutionStrategy.MERGE
  },
  autoResolveThreshold: 10,
  enableAutoBackup: true,
  manualResolveTimeout: 300000 // 5分钟
};

/**
 * 数据同步冲突解决器
 */
export class DataSyncConflictResolver {
  private static instance: DataSyncConflictResolver;
  private config: ConflictResolverConfig;
  private pendingConflicts: Map<string, DataConflict> = new Map();
  private resolutionCallbacks: Map<string, (result: ConflictResolutionResult) => void> = new Map();

  private constructor(config: Partial<ConflictResolverConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  static getInstance(config?: Partial<ConflictResolverConfig>): DataSyncConflictResolver {
    if (!DataSyncConflictResolver.instance) {
      DataSyncConflictResolver.instance = new DataSyncConflictResolver(config);
    }
    return DataSyncConflictResolver.instance;
  }

  /**
   * 检测冲突
   */
  detectConflicts(localItems: SyncDataItem[], remoteItems: SyncDataItem[]): DataConflict[] {
    const conflicts: DataConflict[] = [];
    const remoteMap = new Map(remoteItems.map(item => [item.id, item]));
    const localMap = new Map(localItems.map(item => [item.id, item]));

    // 检查本地项目的冲突
    for (const localItem of localItems) {
      const remoteItem = remoteMap.get(localItem.id);
      
      if (remoteItem) {
        const conflictType = this.determineConflictType(localItem, remoteItem);
        if (conflictType) {
          conflicts.push({
            id: localItem.id,
            type: conflictType,
            localItem,
            remoteItem,
            dataType: this.inferDataType(localItem),
            description: this.generateConflictDescription(conflictType, localItem, remoteItem)
          });
        }
      }
    }

    // 检查远程独有项目（可能是本地删除的）
    for (const remoteItem of remoteItems) {
      if (!localMap.has(remoteItem.id)) {
        // 这种情况可能需要特殊处理，暂时跳过
        logger.debug('远程独有项目：', remoteItem.id);
      }
    }

    return conflicts;
  }

  /**
   * 解决冲突
   */
  async resolveConflicts(conflicts: DataConflict[]): Promise<Map<string, ConflictResolutionResult>> {
    const results = new Map<string, ConflictResolutionResult>();

    for (const conflict of conflicts) {
      try {
        const result = await this.resolveConflict(conflict);
        results.set(conflict.id, result);

        if (result.needsManualReview) {
          this.addPendingConflict(conflict);
        }
      } catch (error) {
        results.set(conflict.id, {
          success: false,
          strategy: ConflictResolutionStrategy.MANUAL_RESOLUTION,
          error: error instanceof Error ? error.message : i18n.t('common.errors.未知错误')
        });
      }
    }

    return results;
  }

  /**
   * 解决单个冲突
   */
  private async resolveConflict(conflict: DataConflict): Promise<ConflictResolutionResult> {
    const strategy = this.getResolutionStrategy(conflict);
    
    logger.info(`解决冲突 ${conflict.id}，策略：${strategy}`);

    switch (strategy) {
      case ConflictResolutionStrategy.LOCAL_WINS:
        return this.resolveWithLocalWins(conflict);
        
      case ConflictResolutionStrategy.REMOTE_WINS:
        return this.resolveWithRemoteWins(conflict);
        
      case ConflictResolutionStrategy.LATEST_TIMESTAMP_WINS:
        return this.resolveWithLatestTimestamp(conflict);
        
      case ConflictResolutionStrategy.MERGE:
        return await this.resolveWithMerge(conflict);
        
      case ConflictResolutionStrategy.CREATE_COPY:
        return this.resolveWithCopy(conflict);
        
      default:
        return {
          success: false,
          strategy,
          needsManualReview: true,
          details: '需要手动解决冲突'
        };
    }
  }

  /**
   * 本地优先解决策略
   */
  private resolveWithLocalWins(conflict: DataConflict): ConflictResolutionResult {
    return {
      success: true,
      strategy: ConflictResolutionStrategy.LOCAL_WINS,
      resolvedItem: conflict.localItem,
      details: '使用本地版本'
    };
  }

  /**
   * 远程优先解决策略
   */
  private resolveWithRemoteWins(conflict: DataConflict): ConflictResolutionResult {
    return {
      success: true,
      strategy: ConflictResolutionStrategy.REMOTE_WINS,
      resolvedItem: conflict.remoteItem,
      details: '使用远程版本'
    };
  }

  /**
   * 最新时间戳优先解决策略
   */
  private resolveWithLatestTimestamp(conflict: DataConflict): ConflictResolutionResult {
    const localTime = conflict.localItem.lastModified || conflict.localItem.timestamp;
    const remoteTime = conflict.remoteItem.lastModified || conflict.remoteItem.timestamp;
    
    const winner = localTime > remoteTime ? conflict.localItem : conflict.remoteItem;
    const strategyUsed = localTime > remoteTime 
      ? ConflictResolutionStrategy.LOCAL_WINS 
      : ConflictResolutionStrategy.REMOTE_WINS;

    return {
      success: true,
      strategy: ConflictResolutionStrategy.LATEST_TIMESTAMP_WINS,
      resolvedItem: winner,
      details: `使用时间戳较新的版本 (${strategyUsed === ConflictResolutionStrategy.LOCAL_WINS ? '本地' : '远程'})`
    };
  }

  /**
   * 合并解决策略
   */
  private async resolveWithMerge(conflict: DataConflict): Promise<ConflictResolutionResult> {
    try {
      const mergedData = this.mergeData(conflict.localItem.data, conflict.remoteItem.data);
      
      const resolvedItem: SyncDataItem = {
        ...conflict.localItem,
        data: mergedData,
        timestamp: Math.max(conflict.localItem.timestamp, conflict.remoteItem.timestamp),
        lastModified: Date.now()
      };

      return {
        success: true,
        strategy: ConflictResolutionStrategy.MERGE,
        resolvedItem,
        details: '成功合并本地和远程数据'
      };
    } catch (error) {
      return {
        success: false,
        strategy: ConflictResolutionStrategy.MERGE,
        needsManualReview: true,
        error: error instanceof Error ? error.message : i18n.t('common.errors.合并失败')
      };
    }
  }

  /**
   * 创建副本解决策略
   */
  private resolveWithCopy(conflict: DataConflict): ConflictResolutionResult {
    const copyItem: SyncDataItem = {
      ...conflict.localItem,
      id: `${conflict.localItem.id}_copy_${Date.now()}`,
      timestamp: Date.now()
    };

    return {
      success: true,
      strategy: ConflictResolutionStrategy.CREATE_COPY,
      resolvedItem: conflict.remoteItem, // 保留远程版本作为主版本
      details: '创建本地副本，保留远程版本'
    };
  }

  /**
   * 合并数据
   */
  private mergeData(localData: any, remoteData: any): any {
    if (typeof localData !== 'object' || typeof remoteData !== 'object') {
      // 非对象类型，无法合并，抛出错误
      throw new Error(i18n.t('common.errors.无法合并非对象类型的数据'));
    }

    if (Array.isArray(localData) && Array.isArray(remoteData)) {
      // 数组合并：去重
      const combined = [...localData, ...remoteData];
      return Array.from(new Set(combined.map(item => 
        typeof item === 'object' ? JSON.stringify(item) : item
      ))).map(item => 
        typeof item === 'string' && item.startsWith('{') ? JSON.parse(item) : item
      );
    }

    // 对象合并：深度合并，远程数据优先
    const merged = { ...localData };
    
    for (const [key, value] of Object.entries(remoteData)) {
      if (key in merged) {
        if (typeof value === 'object' && typeof merged[key] === 'object' && !Array.isArray(value)) {
          merged[key] = this.mergeData(merged[key], value);
        } else {
          merged[key] = value; // 远程优先
        }
      } else {
        merged[key] = value;
      }
    }

    return merged;
  }

  /**
   * 确定冲突类型
   */
  private determineConflictType(localItem: SyncDataItem, remoteItem: SyncDataItem): ConflictType | null {
    // 检查版本不匹配
    if (localItem.version && remoteItem.version && localItem.version !== remoteItem.version) {
      return ConflictType.VERSION_MISMATCH;
    }

    // 检查数据是否相同
    const localChecksum = localItem.checksum || this.calculateChecksum(localItem.data);
    const remoteChecksum = remoteItem.checksum || this.calculateChecksum(remoteItem.data);
    
    if (localChecksum === remoteChecksum) {
      return null; // 没有冲突
    }

    // 检查时间戳
    const localTime = localItem.lastModified || localItem.timestamp;
    const remoteTime = remoteItem.lastModified || remoteItem.timestamp;
    
    const timeDiff = Math.abs(localTime - remoteTime);
    
    // 如果时间差很小（1秒内），认为是并发修改
    if (timeDiff < 1000) {
      return ConflictType.BOTH_MODIFIED;
    }

    // 否则认为是双方都有修改
    return ConflictType.BOTH_MODIFIED;
  }

  /**
   * 计算数据校验和
   */
  private calculateChecksum(data: any): string {
    return btoa(JSON.stringify(data)).substring(0, 16);
  }

  /**
   * 获取冲突解决策略
   */
  private getResolutionStrategy(conflict: DataConflict): ConflictResolutionStrategy {
    return this.config.typeSpecificStrategies[conflict.dataType] || this.config.defaultStrategy;
  }

  /**
   * 推断数据类型
   */
  private inferDataType(item: SyncDataItem): string {
    // 根据数据结构推断类型
    if (item.data && typeof item.data === 'object') {
      if (item.data.type) return item.data.type;
      if (item.data.brand) return 'brand_assets';
      if (item.data.preferences) return 'user_preferences';
      if (item.data.bookmark) return 'bookmarks';
      if (item.data.favorite) return 'favorites';
    }
    return 'unknown';
  }

  /**
   * 生成冲突描述
   */
  private generateConflictDescription(type: ConflictType, localItem: SyncDataItem, remoteItem: SyncDataItem): string {
    const localTime = new Date(localItem.lastModified || localItem.timestamp).toLocaleString();
    const remoteTime = new Date(remoteItem.lastModified || remoteItem.timestamp).toLocaleString();
    
    switch (type) {
      case ConflictType.BOTH_MODIFIED:
        return `本地版本（${localTime}）和远程版本（${remoteTime}）都已修改`;
      case ConflictType.VERSION_MISMATCH:
        return `版本不匹配：本地v${localItem.version} vs 远程v${remoteItem.version}`;
      case ConflictType.LOCAL_NEW_REMOTE_EXISTS:
        return `本地新建项目与远程已存在项目冲突`;
      default:
        return `检测到数据冲突：${type}`;
    }
  }

  /**
   * 添加待处理冲突
   */
  private addPendingConflict(conflict: DataConflict): void {
    this.pendingConflicts.set(conflict.id, conflict);
    
    // 设置超时自动处理
    if (this.config.manualResolveTimeout > 0) {
      setTimeout(() => {
        if (this.pendingConflicts.has(conflict.id)) {
          logger.warn(`冲突 ${conflict.id} 超时，使用默认策略自动解决`);
          this.resolveConflict(conflict).then(result => {
            const callback = this.resolutionCallbacks.get(conflict.id);
            if (callback) {
              callback(result);
              this.resolutionCallbacks.delete(conflict.id);
            }
          });
          this.pendingConflicts.delete(conflict.id);
        }
      }, this.config.manualResolveTimeout);
    }
  }

  /**
   * 获取待处理冲突
   */
  getPendingConflicts(): DataConflict[] {
    return Array.from(this.pendingConflicts.values());
  }

  /**
   * 手动解决冲突
   */
  async manualResolveConflict(
    conflictId: string, 
    strategy: ConflictResolutionStrategy
  ): Promise<ConflictResolutionResult> {
    const conflict = this.pendingConflicts.get(conflictId);
    
    if (!conflict) {
      throw new Error(`冲突 ${conflictId} 不存在或已解决`);
    }

    // 临时修改策略
    const originalStrategy = this.config.typeSpecificStrategies[conflict.dataType];
    this.config.typeSpecificStrategies[conflict.dataType] = strategy;
    
    try {
      const result = await this.resolveConflict(conflict);
      this.pendingConflicts.delete(conflictId);
      
      const callback = this.resolutionCallbacks.get(conflictId);
      if (callback) {
        callback(result);
        this.resolutionCallbacks.delete(conflictId);
      }
      
      return result;
    } finally {
      // 恢复原始策略
      if (originalStrategy) {
        this.config.typeSpecificStrategies[conflict.dataType] = originalStrategy;
      }
    }
  }

  /**
   * 批量解决冲突
   */
  async batchResolveConflicts(
    conflictIds: string[], 
    strategy: ConflictResolutionStrategy
  ): Promise<Map<string, ConflictResolutionResult>> {
    const results = new Map<string, ConflictResolutionResult>();
    
    for (const conflictId of conflictIds) {
      try {
        const result = await this.manualResolveConflict(conflictId, strategy);
        results.set(conflictId, result);
      } catch (error) {
        results.set(conflictId, {
          success: false,
          strategy,
          error: error instanceof Error ? error.message : i18n.t('common.errors.未知错误')
        });
      }
    }
    
    return results;
  }
}

// 延迟初始化单例实例，避免TDZ错误
let _dataSyncConflictResolverInstance: DataSyncConflictResolver | null = null;

export const dataSyncConflictResolver = {
  // 使用代理模式延迟初始化
  get analyzeConflict() { return this._getInstance().analyzeConflict.bind(this._getInstance()); },
  get resolveConflict() { return this._getInstance().resolveConflict.bind(this._getInstance()); },
  get generateMergeStrategy() { return this._getInstance().generateMergeStrategy.bind(this._getInstance()); },
  get executeStrategy() { return this._getInstance().executeStrategy.bind(this._getInstance()); },
  get getConflictHistory() { return this._getInstance().getConflictHistory.bind(this._getInstance()); },
  get getConflictStats() { return this._getInstance().getConflictStats.bind(this._getInstance()); },
  get cleanup() { return this._getInstance().cleanup.bind(this._getInstance()); },
  
  _getInstance(): DataSyncConflictResolver {
    if (!_dataSyncConflictResolverInstance) {
      _dataSyncConflictResolverInstance = DataSyncConflictResolver.getInstance();
    }
    return _dataSyncConflictResolverInstance;
  }
};

export default DataSyncConflictResolver;