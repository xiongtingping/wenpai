/**
 * 数据迁移服务
 * 负责将现有的localStorage数据迁移到Supabase
 */

import { supabase } from '@/lib/supabase'
import { BrandSupabaseService } from './brandSupabaseService'
import { generateStorageKey } from '@/utils/userDataIsolation'

export interface MigrationResult {
  success: boolean
  migratedCount: number
  errors: string[]
  skippedCount: number
}

export interface MigrationProgress {
  stage: string
  current: number
  total: number
  message: string
}

export class DataMigrationService {
  private static instance: DataMigrationService
  private brandService = BrandSupabaseService.getInstance()
  
  private constructor() {}

  public static getInstance(): DataMigrationService {
    if (!DataMigrationService.instance) {
      DataMigrationService.instance = new DataMigrationService()
    }
    return DataMigrationService.instance
  }

  /**
   * 执行完整的用户数据迁移
   */
  async migrateUserData(
    userId: string, 
    onProgress?: (progress: MigrationProgress) => void
  ): Promise<MigrationResult> {
    console.log(`🚀 开始迁移用户数据: ${userId}`)
    
    const result: MigrationResult = {
      success: true,
      migratedCount: 0,
      errors: [],
      skippedCount: 0
    }

    try {
      // 第一阶段：迁移品牌资产
      onProgress?.({
        stage: '品牌资产迁移',
        current: 0,
        total: 4,
        message: '正在迁移品牌资产...'
      })
      
      const brandResult = await this.migrateBrandAssets(userId)
      result.migratedCount += brandResult.migratedCount
      result.errors.push(...brandResult.errors)
      result.skippedCount += brandResult.skippedCount

      // 第二阶段：迁移用户偏好
      onProgress?.({
        stage: '用户偏好迁移',
        current: 1,
        total: 4,
        message: '正在迁移用户偏好设置...'
      })
      
      const preferencesResult = await this.migrateUserPreferences(userId)
      result.migratedCount += preferencesResult.migratedCount
      result.errors.push(...preferencesResult.errors)

      // 第三阶段：迁移使用统计
      onProgress?.({
        stage: '使用统计迁移',
        current: 2,
        total: 4,
        message: '正在迁移使用统计数据...'
      })
      
      const statsResult = await this.migrateUsageStats(userId)
      result.migratedCount += statsResult.migratedCount
      result.errors.push(...statsResult.errors)

      // 第四阶段：清理本地数据
      onProgress?.({
        stage: '数据清理',
        current: 3,
        total: 4,
        message: '正在清理已迁移的本地数据...'
      })
      
      await this.cleanupMigratedData(userId)

      onProgress?.({
        stage: '完成',
        current: 4,
        total: 4,
        message: `迁移完成！共迁移 ${result.migratedCount} 项数据`
      })

      if (result.errors.length > 0) {
        result.success = false
        console.warn(`⚠️ 迁移完成但有错误: ${result.errors.length} 个`)
      } else {
        console.log(`✅ 用户数据迁移成功: ${userId}`)
      }

    } catch (error) {
      result.success = false
      result.errors.push(`迁移过程中发生错误: ${error instanceof Error ? error.message : '未知错误'}`)
      console.error('❌ 数据迁移失败:', error)
    }

    return result
  }

  /**
   * 迁移品牌资产
   */
  private async migrateBrandAssets(userId: string): Promise<MigrationResult> {
    const result: MigrationResult = {
      success: true,
      migratedCount: 0,
      errors: [],
      skippedCount: 0
    }

    try {
      // 从localStorage获取品牌资产
      const brandAssetsKey = generateStorageKey('brand_assets', { id: userId })
      const localData = localStorage.getItem(brandAssetsKey)
      
      if (!localData) {
        console.log('ℹ️ 未找到本地品牌资产数据')
        return result
      }

      const brandAssets = JSON.parse(localData)
      if (!Array.isArray(brandAssets) || brandAssets.length === 0) {
        console.log('ℹ️ 本地品牌资产数据为空')
        return result
      }

      console.log(`📦 发现 ${brandAssets.length} 个本地品牌资产`)

      // 检查云端是否已有数据
      const existingAssets = await this.brandService.getUserBrandAssets(userId)
      if (existingAssets.length > 0) {
        console.log(`ℹ️ 云端已有 ${existingAssets.length} 个品牌资产，跳过迁移`)
        result.skippedCount = brandAssets.length
        return result
      }

      // 批量上传到Supabase
      await this.brandService.saveBrandAssetsBatch(userId, brandAssets)
      result.migratedCount = brandAssets.length

      console.log(`✅ 品牌资产迁移完成: ${brandAssets.length} 个`)

    } catch (error) {
      result.success = false
      result.errors.push(`品牌资产迁移失败: ${error instanceof Error ? error.message : '未知错误'}`)
      console.error('❌ 品牌资产迁移失败:', error)
    }

    return result
  }

  /**
   * 迁移用户偏好设置
   */
  private async migrateUserPreferences(userId: string): Promise<MigrationResult> {
    const result: MigrationResult = {
      success: true,
      migratedCount: 0,
      errors: [],
      skippedCount: 0
    }

    const preferencesKeys = [
      'wenpai_theme',
      'adapt_platform_settings',
      'ui_preferences',
      'notification_settings'
    ]

    for (const baseKey of preferencesKeys) {
      try {
        const storageKey = generateStorageKey(baseKey, { id: userId })
        const localData = localStorage.getItem(storageKey)
        
        if (localData) {
          const value = JSON.parse(localData)
          
          // 保存到Supabase
          const { error } = await supabase
            .from('user_preferences')
            .upsert({
              user_id: userId,
              key: baseKey,
              value: value,
              updated_at: new Date().toISOString()
            })

          if (error) {
            result.errors.push(`偏好设置 ${baseKey} 迁移失败: ${error.message}`)
          } else {
            result.migratedCount++
            console.log(`✅ 偏好设置已迁移: ${baseKey}`)
          }
        }
      } catch (error) {
        result.errors.push(`偏好设置 ${baseKey} 处理失败: ${error instanceof Error ? error.message : '未知错误'}`)
      }
    }

    return result
  }

  /**
   * 迁移使用统计数据
   */
  private async migrateUsageStats(userId: string): Promise<MigrationResult> {
    const result: MigrationResult = {
      success: true,
      migratedCount: 0,
      errors: [],
      skippedCount: 0
    }

    try {
      // 这里可以添加使用统计数据的迁移逻辑
      // 目前使用统计主要通过API实时记录，可能不需要迁移历史数据
      console.log('ℹ️ 使用统计数据通过API实时记录，无需迁移历史数据')
    } catch (error) {
      result.success = false
      result.errors.push(`使用统计迁移失败: ${error instanceof Error ? error.message : '未知错误'}`)
    }

    return result
  }

  /**
   * 清理已迁移的本地数据
   */
  private async cleanupMigratedData(userId: string): Promise<void> {
    const keysToCleanup = [
      'brand_assets',
      'wenpai_theme',
      'adapt_platform_settings',
      'ui_preferences',
      'notification_settings'
    ]

    for (const baseKey of keysToCleanup) {
      try {
        const storageKey = generateStorageKey(baseKey, { id: userId })
        
        // 创建备份
        const data = localStorage.getItem(storageKey)
        if (data) {
          const backupKey = `${storageKey}_backup_${Date.now()}`
          localStorage.setItem(backupKey, data)
          
          // 删除原数据
          localStorage.removeItem(storageKey)
          console.log(`🧹 已清理并备份: ${storageKey}`)
        }
      } catch (error) {
        console.warn(`⚠️ 清理数据失败: ${baseKey}`, error)
      }
    }
  }

  /**
   * 检查是否需要迁移
   */
  async needsMigration(userId: string): Promise<boolean> {
    try {
      // 检查是否有本地数据
      const brandAssetsKey = generateStorageKey('brand_assets', { id: userId })
      const hasLocalBrandAssets = !!localStorage.getItem(brandAssetsKey)
      
      // 检查云端是否已有数据
      const cloudAssets = await this.brandService.getUserBrandAssets(userId)
      const hasCloudData = cloudAssets.length > 0

      // 如果有本地数据但没有云端数据，则需要迁移
      return hasLocalBrandAssets && !hasCloudData
    } catch (error) {
      console.error('❌ 检查迁移需求失败:', error)
      return false
    }
  }

  /**
   * 恢复备份数据
   */
  async restoreBackup(userId: string, backupTimestamp: number): Promise<void> {
    const keysToRestore = [
      'brand_assets',
      'wenpai_theme',
      'adapt_platform_settings',
      'ui_preferences',
      'notification_settings'
    ]

    for (const baseKey of keysToRestore) {
      try {
        const storageKey = generateStorageKey(baseKey, { id: userId })
        const backupKey = `${storageKey}_backup_${backupTimestamp}`
        
        const backupData = localStorage.getItem(backupKey)
        if (backupData) {
          localStorage.setItem(storageKey, backupData)
          localStorage.removeItem(backupKey)
          console.log(`🔄 已恢复备份: ${storageKey}`)
        }
      } catch (error) {
        console.error(`❌ 恢复备份失败: ${baseKey}`, error)
      }
    }
  }
}
