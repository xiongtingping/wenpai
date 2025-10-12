/**
 * 权限系统降级策略
 * @description 当权限系统加载失败时的安全降级处理
 */

import type { SubscriptionTier } from '@/types/subscription';

/**
 * 权限加载状态
 */
export interface PermissionLoadState {
  isLoading: boolean;
  isError: boolean;
  errorMessage?: string;
  retryCount: number;
}

/**
 * 权限降级配置
 */
export interface PermissionFallbackConfig {
  // 最大重试次数
  maxRetries: number;
  // 重试延迟(毫秒)
  retryDelay: number;
  // 降级超时时间(毫秒)
  fallbackTimeout: number;
  // 默认降级等级
  defaultTier: SubscriptionTier;
  // 是否启用本地缓存
  enableCache: boolean;
  // 缓存有效期(毫秒)
  cacheExpiry: number;
}

/**
 * 默认降级配置
 */
export const DEFAULT_FALLBACK_CONFIG: PermissionFallbackConfig = {
  maxRetries: 3,
  retryDelay: 1000,
  fallbackTimeout: 5000,
  defaultTier: 'trial',
  enableCache: true,
  cacheExpiry: 5 * 60 * 1000, // 5分钟
};

/**
 * 权限缓存管理器
 */
class PermissionCacheManager {
  private static CACHE_KEY = 'wenpai_permission_cache';
  private static CACHE_TIMESTAMP_KEY = 'wenpai_permission_cache_timestamp';

  /**
   * 保存权限到缓存
   */
  static save(tier: SubscriptionTier, permissions: string[]): void {
    try {
      const cacheData = {
        tier,
        permissions,
        timestamp: Date.now(),
      };
      localStorage.setItem(this.CACHE_KEY, JSON.stringify(cacheData));
      localStorage.setItem(this.CACHE_TIMESTAMP_KEY, Date.now().toString());
    } catch (error) {
      console.warn('保存权限缓存失败:', error);
    }
  }

  /**
   * 从缓存读取权限
   */
  static load(maxAge: number = DEFAULT_FALLBACK_CONFIG.cacheExpiry): {
    tier: SubscriptionTier;
    permissions: string[];
  } | null {
    try {
      const cacheData = localStorage.getItem(this.CACHE_KEY);
      const timestamp = localStorage.getItem(this.CACHE_TIMESTAMP_KEY);

      if (!cacheData || !timestamp) {
        return null;
      }

      const age = Date.now() - parseInt(timestamp);
      if (age > maxAge) {
        console.log('权限缓存已过期');
        this.clear();
        return null;
      }

      return JSON.parse(cacheData);
    } catch (error) {
      console.warn('读取权限缓存失败:', error);
      return null;
    }
  }

  /**
   * 清除缓存
   */
  static clear(): void {
    try {
      localStorage.removeItem(this.CACHE_KEY);
      localStorage.removeItem(this.CACHE_TIMESTAMP_KEY);
    } catch (error) {
      console.warn('清除权限缓存失败:', error);
    }
  }

  /**
   * 检查缓存是否有效
   */
  static isValid(maxAge: number = DEFAULT_FALLBACK_CONFIG.cacheExpiry): boolean {
    try {
      const timestamp = localStorage.getItem(this.CACHE_TIMESTAMP_KEY);
      if (!timestamp) return false;

      const age = Date.now() - parseInt(timestamp);
      return age <= maxAge;
    } catch (error) {
      return false;
    }
  }
}

/**
 * 权限降级策略管理器
 */
export class PermissionFallbackManager {
  private config: PermissionFallbackConfig;
  private loadState: PermissionLoadState;

  constructor(config: Partial<PermissionFallbackConfig> = {}) {
    this.config = { ...DEFAULT_FALLBACK_CONFIG, ...config };
    this.loadState = {
      isLoading: false,
      isError: false,
      retryCount: 0,
    };
  }

  /**
   * 获取降级后的订阅等级
   * @description 按优先级尝试: 缓存 -> 本地存储 -> 默认值
   */
  getFallbackTier(): SubscriptionTier {
    // 1. 尝试从缓存读取
    if (this.config.enableCache) {
      const cached = PermissionCacheManager.load(this.config.cacheExpiry);
      if (cached) {
        console.log('✅ 从缓存恢复权限等级:', cached.tier);
        return cached.tier;
      }
    }

    // 2. 统一从权威工具获取（已内置多源优先级），并写入缓存
    try {
      const { getEffectiveUserTier } = require('@/utils/effectiveUserTier');
      const tier = getEffectiveUserTier();
      if (this.config.enableCache) {
        PermissionCacheManager.save(tier);
      }
      console.log('✅ 通过统一工具获取权限等级:', tier);
      return tier;
    } catch (error) {
      console.warn('通过统一工具获取权限失败，将使用默认降级等级:', error);
    }

    // 3. 使用默认降级等级
    console.log('⚠️ 使用默认降级等级:', this.config.defaultTier);
    return this.config.defaultTier;
  }

  /**
   * 获取降级后的权限列表
   * @description 根据订阅等级返回基础权限集
   */
  getFallbackPermissions(tier: SubscriptionTier): string[] {
    const basePermissions = {
      trial: [
        'read:basic_content',
        'create:basic_content',
        'tier:trial',
        'theme:basic',
        'api:access_basic',
      ],
      pro: [
        'read:basic_content',
        'create:basic_content',
        'edit:own_content',
        'delete:own_content',
        'tier:trial',
        'tier:pro',
        'theme:basic',
        'theme:advanced',
        'feature:creative_studio',
        'feature:advanced_models',
        'api:access_basic',
        'api:access_advanced',
      ],
      premium: [
        'read:basic_content',
        'create:basic_content',
        'edit:own_content',
        'delete:own_content',
        'tier:trial',
        'tier:pro',
        'tier:premium',
        'theme:basic',
        'theme:advanced',
        'theme:premium',
        'feature:creative_studio',
        'feature:brand_library',
        'feature:unlimited_usage',
        'feature:advanced_models',
        'brand:library',
        'api:access_basic',
        'api:access_advanced',
        'api:key_manage',
      ],
    };

    return basePermissions[tier] || basePermissions.trial;
  }

  /**
   * 更新加载状态
   */
  updateLoadState(state: Partial<PermissionLoadState>): void {
    this.loadState = { ...this.loadState, ...state };
  }

  /**
   * 获取当前加载状态
   */
  getLoadState(): PermissionLoadState {
    return { ...this.loadState };
  }

  /**
   * 检查是否应该重试
   */
  shouldRetry(): boolean {
    return this.loadState.retryCount < this.config.maxRetries;
  }

  /**
   * 增加重试计数
   */
  incrementRetry(): void {
    this.loadState.retryCount++;
  }

  /**
   * 重置状态
   */
  reset(): void {
    this.loadState = {
      isLoading: false,
      isError: false,
      retryCount: 0,
    };
  }

  /**
   * 保存权限到缓存
   */
  cachePermissions(tier: SubscriptionTier, permissions: string[]): void {
    if (this.config.enableCache) {
      PermissionCacheManager.save(tier, permissions);
    }
  }

  /**
   * 清除权限缓存
   */
  clearCache(): void {
    PermissionCacheManager.clear();
  }
}

/**
 * 全局降级管理器实例
 */
export const globalFallbackManager = new PermissionFallbackManager();

/**
 * 获取安全的订阅等级
 * @description 在权限加载失败时使用降级策略
 */
export function getSafeTier(): SubscriptionTier {
  return globalFallbackManager.getFallbackTier();
}

/**
 * 获取安全的权限列表
 * @description 在权限加载失败时使用降级策略
 */
export function getSafePermissions(tier?: SubscriptionTier): string[] {
  const targetTier = tier || getSafeTier();
  return globalFallbackManager.getFallbackPermissions(targetTier);
}

/**
 * 检查缓存是否有效
 */
export function isPermissionCacheValid(): boolean {
  return PermissionCacheManager.isValid();
}

/**
 * 清除权限缓存
 */
export function clearPermissionCache(): void {
  PermissionCacheManager.clear();
}
