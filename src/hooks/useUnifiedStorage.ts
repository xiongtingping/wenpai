/**
 * 统一存储React Hook
 * 提供简单易用的存储接口，支持本地存储和云端同步
 */

import { useCallback, useEffect, useState } from 'react'
import { useUnifiedAuth } from '@/contexts/UnifiedAuthContext'
import { UnifiedStorageService, StorageConfig } from '@/services/unifiedStorageService'

export interface UseUnifiedStorageOptions {
  syncToCloud?: boolean
  userIsolated?: boolean
  ttl?: number
}

export function useUnifiedStorage() {
  const { user, isAuthenticated } = useUnifiedAuth()
  const [storageService, setStorageService] = useState<UnifiedStorageService | null>(null)

  // 初始化存储服务
  useEffect(() => {
    const service = new UnifiedStorageService(user)
    setStorageService(service)
  }, [user?.id])

  /**
   * 保存到localStorage
   */
  const setLocalItem = useCallback(async <T>(
    key: string, 
    value: T, 
    options: UseUnifiedStorageOptions = {}
  ) => {
    if (!storageService) return

    const config: StorageConfig = {
      key,
      storageType: 'local',
      syncToCloud: options.syncToCloud && isAuthenticated,
      userIsolated: options.userIsolated ?? true,
      ttl: options.ttl
    }

    return storageService.setItem(config, value)
  }, [storageService, isAuthenticated])

  /**
   * 从localStorage获取
   */
  const getLocalItem = useCallback(async <T>(
    key: string, 
    options: UseUnifiedStorageOptions = {}
  ): Promise<T | null> => {
    if (!storageService) return null

    const config: StorageConfig = {
      key,
      storageType: 'local',
      syncToCloud: options.syncToCloud && isAuthenticated,
      userIsolated: options.userIsolated ?? true,
      ttl: options.ttl
    }

    return storageService.getItem<T>(config)
  }, [storageService, isAuthenticated])

  /**
   * 保存到sessionStorage
   */
  const setSessionItem = useCallback(async <T>(
    key: string, 
    value: T, 
    options: UseUnifiedStorageOptions = {}
  ) => {
    if (!storageService) return

    const config: StorageConfig = {
      key,
      storageType: 'session',
      syncToCloud: false, // sessionStorage不同步到云端
      userIsolated: options.userIsolated ?? true,
      ttl: options.ttl
    }

    return storageService.setItem(config, value)
  }, [storageService])

  /**
   * 从sessionStorage获取
   */
  const getSessionItem = useCallback(async <T>(
    key: string, 
    options: UseUnifiedStorageOptions = {}
  ): Promise<T | null> => {
    if (!storageService) return null

    const config: StorageConfig = {
      key,
      storageType: 'session',
      syncToCloud: false,
      userIsolated: options.userIsolated ?? true,
      ttl: options.ttl
    }

    return storageService.getItem<T>(config)
  }, [storageService])

  /**
   * 保存到云端（仅Supabase）
   */
  const setCloudItem = useCallback(async <T>(key: string, value: T) => {
    if (!storageService || !isAuthenticated) return

    const config: StorageConfig = {
      key,
      storageType: 'supabase',
      syncToCloud: true,
      userIsolated: true
    }

    return storageService.setItem(config, value)
  }, [storageService, isAuthenticated])

  /**
   * 从云端获取（仅Supabase）
   */
  const getCloudItem = useCallback(async <T>(key: string): Promise<T | null> => {
    if (!storageService || !isAuthenticated) return null

    const config: StorageConfig = {
      key,
      storageType: 'supabase',
      syncToCloud: true,
      userIsolated: true
    }

    return storageService.getItem<T>(config)
  }, [storageService, isAuthenticated])

  /**
   * 删除数据
   */
  const removeItem = useCallback(async (
    key: string, 
    storageType: 'local' | 'session' | 'cloud' = 'local',
    options: UseUnifiedStorageOptions = {}
  ) => {
    if (!storageService) return

    const config: StorageConfig = {
      key,
      storageType: storageType === 'cloud' ? 'supabase' : storageType,
      syncToCloud: storageType === 'cloud' || (options.syncToCloud && isAuthenticated),
      userIsolated: options.userIsolated ?? true
    }

    return storageService.removeItem(config)
  }, [storageService, isAuthenticated])

  /**
   * 清除所有用户数据
   */
  const clearUserData = useCallback(async () => {
    if (!storageService) return
    return storageService.clearUserData()
  }, [storageService])

  /**
   * 同步本地数据到云端
   */
  const syncToCloud = useCallback(async (keys: string[]) => {
    if (!storageService || !isAuthenticated) return

    for (const key of keys) {
      try {
        // 从本地获取数据
        const localData = await getLocalItem(key, { userIsolated: true })
        if (localData !== null) {
          // 同步到云端
          await setCloudItem(key, localData)
        }
      } catch (error) {
        console.error(`同步失败: ${key}`, error)
      }
    }
  }, [storageService, isAuthenticated, getLocalItem, setCloudItem])

  /**
   * 从云端同步数据到本地
   */
  const syncFromCloud = useCallback(async (keys: string[]) => {
    if (!storageService || !isAuthenticated) return

    for (const key of keys) {
      try {
        // 从云端获取数据
        const cloudData = await getCloudItem(key)
        if (cloudData !== null) {
          // 保存到本地
          await setLocalItem(key, cloudData, { userIsolated: true })
        }
      } catch (error) {
        console.error(`同步失败: ${key}`, error)
      }
    }
  }, [storageService, isAuthenticated, getCloudItem, setLocalItem])

  return {
    // 基础操作
    setLocalItem,
    getLocalItem,
    setSessionItem,
    getSessionItem,
    setCloudItem,
    getCloudItem,
    removeItem,
    clearUserData,
    
    // 同步操作
    syncToCloud,
    syncFromCloud,
    
    // 状态
    isReady: !!storageService,
    isAuthenticated,
    user
  }
}

/**
 * 预定义的存储配置
 */
export const STORAGE_CONFIGS = {
  // 用户偏好（本地+云端同步）
  USER_PREFERENCES: {
    syncToCloud: true,
    userIsolated: true
  },
  
  // UI状态（仅本地）
  UI_STATE: {
    syncToCloud: false,
    userIsolated: true
  },
  
  // 临时数据（会话级）
  TEMP_DATA: {
    syncToCloud: false,
    userIsolated: true,
    ttl: 3600 // 1小时
  },
  
  // 缓存数据（本地，有过期时间）
  CACHE_DATA: {
    syncToCloud: false,
    userIsolated: true,
    ttl: 1800 // 30分钟
  }
} as const
