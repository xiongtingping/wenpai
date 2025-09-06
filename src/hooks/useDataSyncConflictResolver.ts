/**
 * 数据同步冲突处理 Hook
 * @description 为组件提供数据同步冲突处理的能力
 */

import { useState, useEffect, useCallback } from 'react';
import { 
  dataSyncConflictResolver, 
  type DataConflict, 
  type ConflictResolutionResult,
  type ConflictResolutionStrategy,
  type SyncDataItem 
} from '@/services/dataSyncConflictResolver';
import { useToast } from '@/hooks/use-toast';
import { logger } from '@/utils/logger';

export interface UseDataSyncConflictResolverOptions {
  /** 是否自动检测冲突 */
  autoDetect?: boolean;
  /** 检测间隔（毫秒） */
  detectInterval?: number;
  /** 是否显示解决结果通知 */
  showNotifications?: boolean;
}

export interface DataSyncConflictState {
  /** 是否正在检测冲突 */
  isDetecting: boolean;
  /** 是否正在解决冲突 */
  isResolving: boolean;
  /** 待处理冲突列表 */
  pendingConflicts: DataConflict[];
  /** 已解决冲突数量 */
  resolvedCount: number;
  /** 检测错误 */
  detectionError: string | null;
  /** 解决错误 */
  resolutionError: string | null;
}

/**
 * 数据同步冲突处理 Hook
 */
export function useDataSyncConflictResolver(options: UseDataSyncConflictResolverOptions = {}) {
  const {
    autoDetect = false,
    detectInterval = 30000, // 30秒
    showNotifications = true
  } = options;

  const { toast } = useToast();

  const [state, setState] = useState<DataSyncConflictState>({
    isDetecting: false,
    isResolving: false,
    pendingConflicts: [],
    resolvedCount: 0,
    detectionError: null,
    resolutionError: null
  });

  /**
   * 更新状态
   */
  const updateState = useCallback((updates: Partial<DataSyncConflictState>) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  /**
   * 检测冲突
   */
  const detectConflicts = useCallback(async (
    localItems: SyncDataItem[], 
    remoteItems: SyncDataItem[]
  ): Promise<DataConflict[]> => {
    updateState({ isDetecting: true, detectionError: null });

    try {
      const conflicts = dataSyncConflictResolver.detectConflicts(localItems, remoteItems);
      
      updateState({ 
        pendingConflicts: conflicts,
        isDetecting: false
      });

      if (conflicts.length > 0 && showNotifications) {
        toast({
          title: "检测到数据冲突",
          description: `发现 ${conflicts.length} 个数据冲突需要处理`,
          variant: "destructive"
        });
      }

      logger.info(`检测到 ${conflicts.length} 个数据冲突`);
      return conflicts;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '检测冲突失败';
      updateState({ 
        detectionError: errorMessage,
        isDetecting: false
      });
      
      if (showNotifications) {
        toast({
          title: "冲突检测失败",
          description: errorMessage,
          variant: "destructive"
        });
      }

      logger.error('冲突检测失败:', error);
      return [];
    }
  }, [updateState, showNotifications, toast]);

  /**
   * 解决所有冲突
   */
  const resolveAllConflicts = useCallback(async (): Promise<boolean> => {
    if (state.pendingConflicts.length === 0) {
      return true;
    }

    updateState({ isResolving: true, resolutionError: null });

    try {
      const results = await dataSyncConflictResolver.resolveConflicts(state.pendingConflicts);
      
      const successCount = Array.from(results.values()).filter(r => r.success).length;
      const failureCount = results.size - successCount;

      // 更新待处理冲突列表
      const remainingConflicts = dataSyncConflictResolver.getPendingConflicts();
      
      updateState({
        pendingConflicts: remainingConflicts,
        resolvedCount: state.resolvedCount + successCount,
        isResolving: false
      });

      if (showNotifications) {
        if (failureCount === 0) {
          toast({
            title: "冲突解决成功",
            description: `成功解决 ${successCount} 个冲突`,
            variant: "default"
          });
        } else {
          toast({
            title: "部分冲突解决成功",
            description: `成功解决 ${successCount} 个冲突，${failureCount} 个需要手动处理`,
            variant: "default"
          });
        }
      }

      logger.info(`冲突解决完成: ${successCount} 成功, ${failureCount} 失败`);
      return failureCount === 0;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '解决冲突失败';
      updateState({ 
        resolutionError: errorMessage,
        isResolving: false
      });
      
      if (showNotifications) {
        toast({
          title: "冲突解决失败",
          description: errorMessage,
          variant: "destructive"
        });
      }

      logger.error('解决冲突失败:', error);
      return false;
    }
  }, [state.pendingConflicts, state.resolvedCount, updateState, showNotifications, toast]);

  /**
   * 手动解决特定冲突
   */
  const resolveConflict = useCallback(async (
    conflictId: string,
    strategy: ConflictResolutionStrategy
  ): Promise<ConflictResolutionResult> => {
    updateState({ isResolving: true, resolutionError: null });

    try {
      const result = await dataSyncConflictResolver.manualResolveConflict(conflictId, strategy);
      
      // 更新待处理冲突列表
      const remainingConflicts = dataSyncConflictResolver.getPendingConflicts();
      
      updateState({
        pendingConflicts: remainingConflicts,
        resolvedCount: result.success ? state.resolvedCount + 1 : state.resolvedCount,
        isResolving: false
      });

      if (showNotifications && result.success) {
        toast({
          title: "冲突已解决",
          description: `使用策略: ${strategy}`,
          variant: "default"
        });
      }

      return result;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '解决冲突失败';
      updateState({ 
        resolutionError: errorMessage,
        isResolving: false
      });
      
      if (showNotifications) {
        toast({
          title: "解决冲突失败",
          description: errorMessage,
          variant: "destructive"
        });
      }

      throw error;
    }
  }, [state.resolvedCount, updateState, showNotifications, toast]);

  /**
   * 批量解决冲突
   */
  const batchResolveConflicts = useCallback(async (
    conflictIds: string[],
    strategy: ConflictResolutionStrategy
  ): Promise<Map<string, ConflictResolutionResult>> => {
    updateState({ isResolving: true, resolutionError: null });

    try {
      const results = await dataSyncConflictResolver.batchResolveConflicts(conflictIds, strategy);
      
      const successCount = Array.from(results.values()).filter(r => r.success).length;
      
      // 更新待处理冲突列表
      const remainingConflicts = dataSyncConflictResolver.getPendingConflicts();
      
      updateState({
        pendingConflicts: remainingConflicts,
        resolvedCount: state.resolvedCount + successCount,
        isResolving: false
      });

      if (showNotifications) {
        toast({
          title: "批量解决完成",
          description: `成功解决 ${successCount}/${conflictIds.length} 个冲突`,
          variant: "default"
        });
      }

      return results;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '批量解决失败';
      updateState({ 
        resolutionError: errorMessage,
        isResolving: false
      });
      
      if (showNotifications) {
        toast({
          title: "批量解决失败",
          description: errorMessage,
          variant: "destructive"
        });
      }

      throw error;
    }
  }, [state.resolvedCount, updateState, showNotifications, toast]);

  /**
   * 清除错误
   */
  const clearErrors = useCallback(() => {
    updateState({ 
      detectionError: null, 
      resolutionError: null 
    });
  }, [updateState]);

  /**
   * 获取冲突统计
   */
  const getConflictStats = useCallback(() => {
    return {
      total: state.pendingConflicts.length,
      resolved: state.resolvedCount,
      needsManualReview: state.pendingConflicts.filter(c => 
        dataSyncConflictResolver.getResolutionStrategy?.(c) === 'manual_resolution'
      ).length
    };
  }, [state.pendingConflicts, state.resolvedCount]);

  // 自动检测冲突
  useEffect(() => {
    if (autoDetect && detectInterval > 0) {
      const intervalId = setInterval(() => {
        // 这里需要外部提供数据源，暂时跳过自动检测
        logger.debug('自动冲突检测需要外部数据源');
      }, detectInterval);

      return () => clearInterval(intervalId);
    }
  }, [autoDetect, detectInterval]);

  // 初始化时获取待处理冲突
  useEffect(() => {
    const existingConflicts = dataSyncConflictResolver.getPendingConflicts();
    if (existingConflicts.length > 0) {
      updateState({ pendingConflicts: existingConflicts });
    }
  }, [updateState]);

  return {
    // 状态
    ...state,
    
    // 统计
    conflictStats: getConflictStats(),
    
    // 方法
    detectConflicts,
    resolveAllConflicts,
    resolveConflict,
    batchResolveConflicts,
    clearErrors,
    
    // 便捷方法
    hasConflicts: state.pendingConflicts.length > 0,
    isActive: state.isDetecting || state.isResolving,
    hasErrors: !!(state.detectionError || state.resolutionError)
  };
}

export default useDataSyncConflictResolver;