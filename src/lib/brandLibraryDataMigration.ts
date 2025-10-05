/**
 * 品牌资料库数据迁移工具
 * 用于将现有的BrandLibraryPage迁移到统一数据持久化系统
 */

import { BrandAsset, BrandDimension } from '@/types/brand';
import { unifiedDataPersistenceManager } from '@/lib/unifiedDataPersistenceManager';
import { logger } from '@/utils/logger';

/**
 * 品牌资料库数据管理器
 * 提供统一的数据操作接口，简化BrandLibraryPage的数据管理
 */
export class BrandLibraryDataManager {
  private userId: string | null = null;

  constructor(userId?: string) {
    if (userId) {
      this.setUserId(userId);
    }
  }

  /**
   * 设置用户ID
   */
  setUserId(userId: string | null) {
    this.userId = userId;
    unifiedDataPersistenceManager.setUserId(userId);
  }

  /**
   * 保存品牌资产
   */
  async saveBrandAssets(assets: BrandAsset[]): Promise<boolean> {
    try {
      const result = await unifiedDataPersistenceManager.saveData('brand_assets', assets);
      if (result.success) {
        logger.info('✅ 品牌资产保存成功');
        return true;
      } else {
        logger.error('❌ 品牌资产保存失败:', result.error);
        return false;
      }
    } catch (error) {
      logger.error('❌ 品牌资产保存异常:', error);
      return false;
    }
  }

  /**
   * 加载品牌资产
   */
  async loadBrandAssets(): Promise<BrandAsset[]> {
    try {
      const result = await unifiedDataPersistenceManager.loadData<BrandAsset[]>('brand_assets');
      if (result.success && result.data) {
        logger.info('✅ 品牌资产加载成功');
        return result.data;
      } else {
        logger.warn('⚠️ 品牌资产加载失败或无数据:', result.error);
        return [] as BrandAsset[];
      }
    } catch (error) {
      logger.error('❌ 品牌资产加载异常:', error);
      return [];
    }
  }

  /**
   * 保存品牌维度
   */
  async saveBrandDimensions(dimensions: BrandDimension[]): Promise<boolean> {
    try {
      const result = await unifiedDataPersistenceManager.saveData('brand_dimensions', dimensions);
      if (result.success) {
        logger.info('✅ 品牌维度保存成功');
        return true;
      } else {
        logger.error('❌ 品牌维度保存失败:', result.error);
        return false;
      }
    } catch (error) {
      logger.error('❌ 品牌维度保存异常:', error);
      return false;
    }
  }

  /**
   * 加载品牌维度
   */
  async loadBrandDimensions(): Promise<BrandDimension[]> {
    try {
      const result = await unifiedDataPersistenceManager.loadData<BrandDimension[]>('brand_dimensions');
      if (result.success && result.data) {
        logger.info('✅ 品牌维度加载成功');
        return result.data;
      } else {
        logger.warn('⚠️ 品牌维度加载失败或无数据:', result.error);
        return [] as BrandDimension[];
      }
    } catch (error) {
      logger.error('❌ 品牌维度加载异常:', error);
      return [];
    }
  }

  /**
   * 更新品牌资产
   */
  async updateBrandAsset(assetId: string, updates: Partial<BrandAsset>, currentAssets: BrandAsset[]): Promise<boolean> {
    const updatedAssets = currentAssets.map(asset =>
      asset.id === assetId ? { ...asset, ...updates } : asset
    );
    return await this.saveBrandAssets(updatedAssets);
  }

  /**
   * 添加品牌资产
   */
  async addBrandAsset(newAsset: BrandAsset, currentAssets: BrandAsset[]): Promise<boolean> {
    const updatedAssets = [...currentAssets, newAsset];
    return await this.saveBrandAssets(updatedAssets);
  }

  /**
   * 删除品牌资产
   */
  async deleteBrandAsset(assetId: string, currentAssets: BrandAsset[]): Promise<boolean> {
    const updatedAssets = currentAssets.filter(asset => asset.id !== assetId);
    return await this.saveBrandAssets(updatedAssets);
  }

  /**
   * 更新品牌维度
   */
  async updateBrandDimension(dimensionId: string, updates: Partial<BrandDimension>, currentDimensions: BrandDimension[]): Promise<boolean> {
    const updatedDimensions = currentDimensions.map(dimension =>
      dimension.id === dimensionId ? { ...dimension, ...updates } : dimension
    );
    return await this.saveBrandDimensions(updatedDimensions);
  }

  /**
   * 添加维度项目
   */
  async addDimensionItem(dimensionId: string, newItem: any, currentDimensions: BrandDimension[]): Promise<boolean> {
    const updatedDimensions = currentDimensions.map(dimension =>
      dimension.id === dimensionId 
        ? { ...dimension, items: [...dimension.items, newItem] }
        : dimension
    );
    return await this.saveBrandDimensions(updatedDimensions);
  }

  /**
   * 删除维度项目
   */
  async deleteDimensionItem(dimensionId: string, itemId: string, currentDimensions: BrandDimension[]): Promise<boolean> {
    const updatedDimensions = currentDimensions.map(dimension =>
      dimension.id === dimensionId 
        ? { ...dimension, items: dimension.items.filter((item: any) => item.id !== itemId) }
        : dimension
    );
    return await this.saveBrandDimensions(updatedDimensions);
  }

  /**
   * 更新维度项目
   */
  async updateDimensionItem(dimensionId: string, itemId: string, updates: any, currentDimensions: BrandDimension[]): Promise<boolean> {
    const updatedDimensions = currentDimensions.map(dimension =>
      dimension.id === dimensionId 
        ? {
            ...dimension,
            items: dimension.items.map((item: any) =>
              item.id === itemId ? { ...item, ...updates, updatedAt: new Date() } : item
            )
          }
        : dimension
    );
    return await this.saveBrandDimensions(updatedDimensions);
  }

  /**
   * 添加关键词到维度
   */
  async addKeywordToDimension(dimensionId: string, keyword: string, currentDimensions: BrandDimension[]): Promise<boolean> {
    const updatedDimensions = currentDimensions.map(dimension =>
      dimension.id === dimensionId 
        ? { ...dimension, keywords: [...dimension.keywords, keyword] }
        : dimension
    );
    return await this.saveBrandDimensions(updatedDimensions);
  }

  /**
   * 从维度移除关键词
   */
  async removeKeywordFromDimension(dimensionId: string, keyword: string, currentDimensions: BrandDimension[]): Promise<boolean> {
    const updatedDimensions = currentDimensions.map(dimension =>
      dimension.id === dimensionId 
        ? { ...dimension, keywords: dimension.keywords.filter((k: string) => k !== keyword) }
        : dimension
    );
    return await this.saveBrandDimensions(updatedDimensions);
  }

  /**
   * 批量删除资产和相关维度数据
   */
  async batchDeleteAssetsAndDimensions(
    assetsToDelete: string[], 
    currentAssets: BrandAsset[], 
    currentDimensions: BrandDimension[]
  ): Promise<{ assetsSuccess: boolean; dimensionsSuccess: boolean }> {
    // 删除资产
    const updatedAssets = currentAssets.filter(asset => !assetsToDelete.includes(asset.id));
    const assetsSuccess = await this.saveBrandAssets(updatedAssets);

    // 删除相关的维度数据
    const updatedDimensions = currentDimensions.map(dimension => ({
      ...dimension,
      items: dimension.items.filter((item: any) =>
        !assetsToDelete.some(assetId => item.source?.includes(assetId))
      ),
      keywords: dimension.keywords.filter((keyword: string) =>
        !assetsToDelete.some(assetId => keyword.includes(assetId))
      )
    }));
    const dimensionsSuccess = await this.saveBrandDimensions(updatedDimensions);

    return { assetsSuccess, dimensionsSuccess };
  }

  /**
   * 清理孤立的维度数据
   */
  async cleanupOrphanedDimensionData(currentAssets: BrandAsset[], currentDimensions: BrandDimension[]): Promise<boolean> {
    const assetIds = new Set(currentAssets.map(asset => asset.id));
    
    const updatedDimensions = currentDimensions.map(dimension => ({
      ...dimension,
      items: dimension.items.filter((item: any) => {
        // 保留手动添加的项目和有效的资产关联项目
        return item.source === '手动添加' || 
               !item.source || 
               assetIds.has(item.source);
      }),
      keywords: dimension.keywords.filter((keyword: string) => {
        // 保留不包含资产ID的关键词
        return !currentAssets.some(asset => keyword.includes(asset.id));
      })
    }));

    return await this.saveBrandDimensions(updatedDimensions);
  }

  /**
   * 从旧系统迁移数据
   */
  async migrateFromLegacySystem(legacyAssets: BrandAsset[], legacyDimensions: BrandDimension[]): Promise<{
    assetsSuccess: boolean;
    dimensionsSuccess: boolean;
    migratedAssetsCount: number;
    migratedDimensionsCount: number;
  }> {
    let assetsSuccess = true;
    let dimensionsSuccess = true;
    let migratedAssetsCount = 0;
    let migratedDimensionsCount = 0;

    // 迁移资产数据
    if (legacyAssets && legacyAssets.length > 0) {
      assetsSuccess = await this.saveBrandAssets(legacyAssets);
      if (assetsSuccess) {
        migratedAssetsCount = legacyAssets.length;
      }
    }

    // 迁移维度数据
    if (legacyDimensions && legacyDimensions.length > 0) {
      dimensionsSuccess = await this.saveBrandDimensions(legacyDimensions);
      if (dimensionsSuccess) {
        migratedDimensionsCount = legacyDimensions.length;
      }
    }

    logger.info(`📦 数据迁移完成: 资产 ${migratedAssetsCount} 项, 维度 ${migratedDimensionsCount} 项`);

    return {
      assetsSuccess,
      dimensionsSuccess,
      migratedAssetsCount,
      migratedDimensionsCount
    };
  }
}

// 创建全局实例
export const brandLibraryDataManager = new BrandLibraryDataManager();
