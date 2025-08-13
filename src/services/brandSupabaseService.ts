/**
 * 品牌库Supabase服务
 * 处理品牌资产的云端存储和同步
 */

import { supabase } from '@/lib/supabase'
import { BrandAsset, BrandProfile } from '@/types/brand'

export interface SupabaseBrandAsset {
  id: string
  user_id: string
  name: string
  type: 'logo' | 'color' | 'font' | 'image' | 'document' | 'other'
  content: any
  metadata: any
  created_at: string
  updated_at: string
}

export class BrandSupabaseService {
  private static instance: BrandSupabaseService
  
  private constructor() {}

  public static getInstance(): BrandSupabaseService {
    if (!BrandSupabaseService.instance) {
      BrandSupabaseService.instance = new BrandSupabaseService()
    }
    return BrandSupabaseService.instance
  }

  /**
   * 保存品牌资产到Supabase
   */
  async saveBrandAsset(userId: string, asset: BrandAsset): Promise<SupabaseBrandAsset> {
    const { data, error } = await supabase
      .from('brand_assets')
      .insert({
        user_id: userId,
        name: asset.name,
        type: this.mapAssetType(asset.type),
        content: asset,
        metadata: {
          originalType: asset.type,
          tags: asset.tags || [],
          description: asset.description || ''
        }
      })
      .select()
      .single()

    if (error) {
      console.error('❌ 保存品牌资产失败:', error)
      throw new Error(`保存品牌资产失败: ${error.message}`)
    }

    console.log('✅ 品牌资产已保存到云端:', data.id)
    return data
  }

  /**
   * 获取用户的所有品牌资产
   */
  async getUserBrandAssets(userId: string): Promise<SupabaseBrandAsset[]> {
    const { data, error } = await supabase
      .from('brand_assets')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('❌ 获取品牌资产失败:', error)
      throw new Error(`获取品牌资产失败: ${error.message}`)
    }

    return data || []
  }

  /**
   * 获取特定品牌资产
   */
  async getBrandAsset(userId: string, assetId: string): Promise<SupabaseBrandAsset | null> {
    const { data, error } = await supabase
      .from('brand_assets')
      .select('*')
      .eq('user_id', userId)
      .eq('id', assetId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return null // 未找到
      }
      console.error('❌ 获取品牌资产失败:', error)
      throw new Error(`获取品牌资产失败: ${error.message}`)
    }

    return data
  }

  /**
   * 更新品牌资产
   */
  async updateBrandAsset(
    userId: string, 
    assetId: string, 
    updates: Partial<BrandAsset>
  ): Promise<SupabaseBrandAsset> {
    const { data, error } = await supabase
      .from('brand_assets')
      .update({
        name: updates.name,
        content: updates,
        metadata: {
          originalType: updates.type,
          tags: updates.tags || [],
          description: updates.description || ''
        },
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId)
      .eq('id', assetId)
      .select()
      .single()

    if (error) {
      console.error('❌ 更新品牌资产失败:', error)
      throw new Error(`更新品牌资产失败: ${error.message}`)
    }

    console.log('✅ 品牌资产已更新:', data.id)
    return data
  }

  /**
   * 删除品牌资产
   */
  async deleteBrandAsset(userId: string, assetId: string): Promise<void> {
    const { error } = await supabase
      .from('brand_assets')
      .delete()
      .eq('user_id', userId)
      .eq('id', assetId)

    if (error) {
      console.error('❌ 删除品牌资产失败:', error)
      throw new Error(`删除品牌资产失败: ${error.message}`)
    }

    console.log('✅ 品牌资产已删除:', assetId)
  }

  /**
   * 批量保存品牌资产
   */
  async saveBrandAssetsBatch(userId: string, assets: BrandAsset[]): Promise<SupabaseBrandAsset[]> {
    const insertData = assets.map(asset => ({
      user_id: userId,
      name: asset.name,
      type: this.mapAssetType(asset.type),
      content: asset,
      metadata: {
        originalType: asset.type,
        tags: asset.tags || [],
        description: asset.description || ''
      }
    }))

    const { data, error } = await supabase
      .from('brand_assets')
      .insert(insertData)
      .select()

    if (error) {
      console.error('❌ 批量保存品牌资产失败:', error)
      throw new Error(`批量保存品牌资产失败: ${error.message}`)
    }

    console.log(`✅ 批量保存完成: ${data.length} 个品牌资产`)
    return data
  }

  /**
   * 搜索品牌资产
   */
  async searchBrandAssets(
    userId: string, 
    query: string, 
    type?: string
  ): Promise<SupabaseBrandAsset[]> {
    let queryBuilder = supabase
      .from('brand_assets')
      .select('*')
      .eq('user_id', userId)
      .ilike('name', `%${query}%`)

    if (type) {
      queryBuilder = queryBuilder.eq('type', type)
    }

    const { data, error } = await queryBuilder
      .order('created_at', { ascending: false })
      .limit(50)

    if (error) {
      console.error('❌ 搜索品牌资产失败:', error)
      throw new Error(`搜索品牌资产失败: ${error.message}`)
    }

    return data || []
  }

  /**
   * 获取品牌资产统计
   */
  async getBrandAssetStats(userId: string): Promise<{
    total: number
    byType: Record<string, number>
    recentCount: number
  }> {
    // 获取总数和按类型分组
    const { data: assets, error } = await supabase
      .from('brand_assets')
      .select('type, created_at')
      .eq('user_id', userId)

    if (error) {
      console.error('❌ 获取品牌资产统计失败:', error)
      throw new Error(`获取品牌资产统计失败: ${error.message}`)
    }

    const total = assets.length
    const byType: Record<string, number> = {}
    let recentCount = 0

    const oneWeekAgo = new Date()
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)

    assets.forEach(asset => {
      // 按类型统计
      byType[asset.type] = (byType[asset.type] || 0) + 1
      
      // 最近一周的数量
      if (new Date(asset.created_at) > oneWeekAgo) {
        recentCount++
      }
    })

    return { total, byType, recentCount }
  }

  /**
   * 映射资产类型到Supabase枚举
   */
  private mapAssetType(type: string): 'logo' | 'color' | 'font' | 'image' | 'document' | 'other' {
    const typeMap: Record<string, 'logo' | 'color' | 'font' | 'image' | 'document' | 'other'> = {
      'logo': 'logo',
      'color': 'color',
      'font': 'font',
      'image': 'image',
      'document': 'document'
    }
    
    return typeMap[type] || 'other'
  }

  /**
   * 同步本地数据到云端
   */
  async syncLocalToCloud(userId: string, localAssets: BrandAsset[]): Promise<void> {
    console.log(`🔄 开始同步本地品牌资产到云端: ${localAssets.length} 个`)
    
    try {
      // 获取云端现有资产
      const cloudAssets = await this.getUserBrandAssets(userId)
      const cloudAssetIds = new Set(cloudAssets.map(asset => asset.content.id))
      
      // 筛选出需要上传的本地资产
      const assetsToUpload = localAssets.filter(asset => !cloudAssetIds.has(asset.id))
      
      if (assetsToUpload.length > 0) {
        await this.saveBrandAssetsBatch(userId, assetsToUpload)
        console.log(`✅ 同步完成: ${assetsToUpload.length} 个新资产已上传`)
      } else {
        console.log('ℹ️ 所有本地资产已存在于云端，无需同步')
      }
    } catch (error) {
      console.error('❌ 同步失败:', error)
      throw error
    }
  }
}
