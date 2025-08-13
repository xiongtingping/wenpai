/**
 * 统一存储服务
 * 支持localStorage、sessionStorage和Supabase云端存储
 * 实现数据同步、离线支持和用户隔离
 */

import { supabase } from '@/lib/supabase'
import { generateStorageKey } from '@/utils/userDataIsolation'

export interface StorageConfig {
  key: string
  storageType: 'local' | 'session' | 'supabase'
  syncToCloud?: boolean
  userIsolated?: boolean
  ttl?: number // 缓存过期时间（秒）
}

export interface StorageItem<T> {
  value: T
  timestamp: number
  ttl?: number
}

export class UnifiedStorageService {
  private user: any
  private cache: Map<string, any> = new Map()

  constructor(user?: any) {
    this.user = user
  }

  /**
   * 保存数据到指定存储
   */
  async setItem<T>(config: StorageConfig, value: T): Promise<void> {
    const { key, storageType, syncToCloud, userIsolated, ttl } = config
    
    try {
      // 包装数据
      const item: StorageItem<T> = {
        value,
        timestamp: Date.now(),
        ttl
      }

      // 生成存储键
      const storageKey = userIsolated && this.user?.id 
        ? generateStorageKey(key, this.user)
        : key

      // 本地存储
      if (storageType === 'local') {
        localStorage.setItem(storageKey, JSON.stringify(item))
      } else if (storageType === 'session') {
        sessionStorage.setItem(storageKey, JSON.stringify(item))
      }

      // 更新内存缓存
      this.cache.set(storageKey, item)

      // 云端同步
      if (syncToCloud && this.user?.id) {
        await this.syncToSupabase(key, value)
      }

      console.log(`✅ 数据已保存: ${storageKey}`, { storageType, syncToCloud })
    } catch (error) {
      console.error('❌ 存储失败:', error)
      throw new Error(`存储失败: ${error instanceof Error ? error.message : '未知错误'}`)
    }
  }

  /**
   * 从指定存储获取数据
   */
  async getItem<T>(config: StorageConfig): Promise<T | null> {
    const { key, storageType, syncToCloud, userIsolated } = config
    
    try {
      // 生成存储键
      const storageKey = userIsolated && this.user?.id 
        ? generateStorageKey(key, this.user)
        : key

      // 检查内存缓存
      const cached = this.cache.get(storageKey)
      if (cached && this.isValidCache(cached)) {
        return cached.value
      }

      // 优先从云端获取（如果配置了同步）
      if (syncToCloud && this.user?.id) {
        const cloudData = await this.getFromSupabase<T>(key)
        if (cloudData !== null) {
          // 更新本地缓存
          const item: StorageItem<T> = {
            value: cloudData,
            timestamp: Date.now()
          }
          this.cache.set(storageKey, item)
          return cloudData
        }
      }

      // 从本地存储获取
      let stored: string | null = null
      if (storageType === 'local') {
        stored = localStorage.getItem(storageKey)
      } else if (storageType === 'session') {
        stored = sessionStorage.getItem(storageKey)
      }

      if (stored) {
        const item: StorageItem<T> = JSON.parse(stored)
        
        // 检查是否过期
        if (this.isValidCache(item)) {
          this.cache.set(storageKey, item)
          return item.value
        } else {
          // 清除过期数据
          await this.removeItem(config)
          return null
        }
      }

      return null
    } catch (error) {
      console.error('❌ 获取数据失败:', error)
      return null
    }
  }

  /**
   * 删除数据
   */
  async removeItem(config: StorageConfig): Promise<void> {
    const { key, storageType, syncToCloud, userIsolated } = config
    
    try {
      const storageKey = userIsolated && this.user?.id 
        ? generateStorageKey(key, this.user)
        : key

      // 删除本地存储
      if (storageType === 'local') {
        localStorage.removeItem(storageKey)
      } else if (storageType === 'session') {
        sessionStorage.removeItem(storageKey)
      }

      // 删除内存缓存
      this.cache.delete(storageKey)

      // 删除云端数据
      if (syncToCloud && this.user?.id) {
        await this.removeFromSupabase(key)
      }

      console.log(`🗑️ 数据已删除: ${storageKey}`)
    } catch (error) {
      console.error('❌ 删除数据失败:', error)
      throw error
    }
  }

  /**
   * 清除所有用户数据
   */
  async clearUserData(): Promise<void> {
    if (!this.user?.id) return

    try {
      // 清除localStorage中的用户数据
      const keysToRemove: string[] = []
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key && key.includes(`_${this.user.id}`)) {
          keysToRemove.push(key)
        }
      }
      keysToRemove.forEach(key => localStorage.removeItem(key))

      // 清除sessionStorage中的用户数据
      const sessionKeysToRemove: string[] = []
      for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i)
        if (key && key.includes(`_${this.user.id}`)) {
          sessionKeysToRemove.push(key)
        }
      }
      sessionKeysToRemove.forEach(key => sessionStorage.removeItem(key))

      // 清除内存缓存
      this.cache.clear()

      // 清除云端数据
      await this.clearSupabaseData()

      console.log(`🧹 用户数据已清除: ${this.user.id}`)
    } catch (error) {
      console.error('❌ 清除用户数据失败:', error)
      throw error
    }
  }

  /**
   * 检查缓存是否有效
   */
  private isValidCache<T>(item: StorageItem<T>): boolean {
    if (!item.ttl) return true
    return (Date.now() - item.timestamp) < (item.ttl * 1000)
  }

  /**
   * 同步数据到Supabase
   */
  private async syncToSupabase<T>(key: string, value: T): Promise<void> {
    if (!this.user?.id) return

    const { error } = await supabase
      .from('user_preferences')
      .upsert({
        user_id: this.user.id,
        key,
        value: value as any,
        updated_at: new Date().toISOString()
      })

    if (error) {
      console.error('❌ 同步到Supabase失败:', error)
      throw error
    }

    console.log(`☁️ 数据已同步到云端: ${key}`)
  }

  /**
   * 从Supabase获取数据
   */
  private async getFromSupabase<T>(key: string): Promise<T | null> {
    if (!this.user?.id) return null

    const { data, error } = await supabase
      .from('user_preferences')
      .select('value')
      .eq('user_id', this.user.id)
      .eq('key', key)
      .single()

    if (error || !data) return null
    return data.value as T
  }

  /**
   * 从Supabase删除数据
   */
  private async removeFromSupabase(key: string): Promise<void> {
    if (!this.user?.id) return

    const { error } = await supabase
      .from('user_preferences')
      .delete()
      .eq('user_id', this.user.id)
      .eq('key', key)

    if (error) {
      console.error('❌ 从Supabase删除失败:', error)
      throw error
    }
  }

  /**
   * 清除Supabase中的所有用户数据
   */
  private async clearSupabaseData(): Promise<void> {
    if (!this.user?.id) return

    const { error } = await supabase
      .from('user_preferences')
      .delete()
      .eq('user_id', this.user.id)

    if (error) {
      console.error('❌ 清除Supabase数据失败:', error)
      throw error
    }
  }
}
