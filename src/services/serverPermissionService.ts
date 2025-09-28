/**
 * 服务器端权限验证服务
 * 🔒 安全修复：通过后端API验证权限，防止前端权限绕过
 * 
 * 功能：
 * 1. 调用服务器端权限验证API
 * 2. 缓存验证结果以提高性能
 * 3. 提供权限验证的备用机制
 * 4. 确保关键操作都经过服务器端验证
 */

import type { ExtendedPermissionType, PermissionCheckResult, IServerPermissionService } from '@/types/permissions';

/**
 * 服务器权限验证结果接口
 */
export interface ServerPermissionResult {
  permission: ExtendedPermissionType;
  hasPermission: boolean;
  userTier: string;
  requiredTier: string;
  description: string;
  reason?: string;
}

/**
 * 服务器权限验证响应接口
 */
export interface ServerPermissionResponse {
  userId: string;
  userTier: string;
  allPermissionsGranted: boolean;
  results: ServerPermissionResult[];
  verifiedAt: string;
}

/**
 * 权限验证缓存接口
 */
interface PermissionCache {
  [key: string]: {
    result: ServerPermissionResponse;
    timestamp: number;
    expiresAt: number;
  };
}

/**
 * 服务器权限验证服务类
 */
export class ServerPermissionService {
  private static cache: PermissionCache = {};
  private static readonly CACHE_DURATION = 5 * 60 * 1000; // 5分钟缓存
  private static readonly API_TIMEOUT = 10000; // 10秒超时

  /**
   * 验证单个权限
   */
  static async verifyPermission(
    permission: ExtendedPermissionType,
    forceRefresh: boolean = false
  ): Promise<ServerPermissionResult | null> {
    const results = await this.verifyPermissions([permission], forceRefresh);
    return results ? results.results[0] || null : null;
  }

  /**
   * 验证多个权限
   */
  static async verifyPermissions(
    permissions: ExtendedPermissionType[],
    forceRefresh: boolean = false
  ): Promise<ServerPermissionResponse | null> {
    try {
      // 生成缓存键
      const cacheKey = this.generateCacheKey(permissions);
      
      // 检查缓存（除非强制刷新）
      if (!forceRefresh) {
        const cached = this.getCachedResult(cacheKey);
        if (cached) {
          console.log('🔍 使用缓存的权限验证结果:', { permissions, userId: cached.userId });
          return cached;
        }
      }

      // 获取用户Token
      const token = await this.getUserToken();
      if (!token) {
        console.warn('⚠️ 无法获取用户Token，跳过服务器端权限验证');
        return null;
      }

      // 调用服务器端API
      const result = await this.callPermissionAPI(permissions, token);
      
      if (result) {
        // 缓存结果
        this.cacheResult(cacheKey, result);
        console.log('✅ 服务器端权限验证成功:', { 
          permissions, 
          userId: result.userId,
          allGranted: result.allPermissionsGranted 
        });
      }

      return result;

    } catch (error) {
      console.error('❌ 服务器端权限验证失败:', error);
      return null;
    }
  }

  /**
   * 验证关键操作权限（必须成功）
   */
  static async verifySecurePermissions(
    permissions: ExtendedPermissionType[]
  ): Promise<{ success: boolean; error?: string; results?: ServerPermissionResponse }> {
    try {
      const result = await this.verifyPermissions(permissions, true); // 强制刷新
      
      if (!result) {
        return {
          success: false,
          error: '无法连接到权限验证服务器'
        };
      }

      if (!result.allPermissionsGranted) {
        const deniedPermissions = result.results
          .filter(r => !r.hasPermission)
          .map(r => r.permission);
          
        return {
          success: false,
          error: `权限不足，缺少权限: ${deniedPermissions.join(', ')}`,
          results: result
        };
      }

      return {
        success: true,
        results: result
      };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '权限验证失败'
      };
    }
  }

  /**
   * 调用权限验证API
   */
  private static async callPermissionAPI(
    permissions: ExtendedPermissionType[],
    token: string
  ): Promise<ServerPermissionResponse | null> {
    const apiUrl = this.getAPIUrl();
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.API_TIMEOUT);

    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ permissions }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`权限验证API请求失败: ${response.status} - ${errorData.message || response.statusText}`);
      }

      const data = await response.json();
      return data;

    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error.name === 'AbortError') {
        throw new Error('权限验证请求超时');
      }
      
      throw error;
    }
  }

  /**
   * 获取用户Token
   */
  private static async getUserToken(): Promise<string | null> {
    try {
      // 尝试从localStorage获取
      const storedUser = localStorage.getItem('authing_user');
      if (storedUser) {
        const user = JSON.parse(storedUser);
        if (user.token || user.access_token) {
          return user.token || user.access_token;
        }
      }

      // 尝试从其他Token存储位置获取
      const authToken = localStorage.getItem('_authing_token');
      if (authToken) {
        const tokenData = JSON.parse(authToken);
        return tokenData.access_token || tokenData.token;
      }

      return null;
    } catch (error) {
      console.warn('⚠️ 获取用户Token失败:', error);
      return null;
    }
  }

  /**
   * 获取API URL
   */
  private static getAPIUrl(): string {
    const isDev = typeof window !== 'undefined' && window.location.hostname === 'localhost';
    const baseUrl = isDev ? 'http://localhost:8888' : '';
    return `${baseUrl}/.netlify/functions/verify-permissions`;
  }

  /**
   * 生成缓存键
   */
  private static generateCacheKey(permissions: ExtendedPermissionType[]): string {
    return permissions.sort().join('|');
  }

  /**
   * 获取缓存结果
   */
  private static getCachedResult(cacheKey: string): ServerPermissionResponse | null {
    const cached = this.cache[cacheKey];
    if (!cached) {
      return null;
    }

    // 检查是否过期
    if (Date.now() > cached.expiresAt) {
      delete this.cache[cacheKey];
      return null;
    }

    return cached.result;
  }

  /**
   * 缓存结果
   */
  private static cacheResult(cacheKey: string, result: ServerPermissionResponse): void {
    this.cache[cacheKey] = {
      result,
      timestamp: Date.now(),
      expiresAt: Date.now() + this.CACHE_DURATION
    };
  }

  /**
   * 清除缓存
   */
  static clearCache(): void {
    this.cache = {};
    console.log('🧹 权限验证缓存已清除');
  }

  /**
   * 清除过期缓存
   */
  static cleanExpiredCache(): void {
    const now = Date.now();
    let cleanedCount = 0;

    Object.keys(this.cache).forEach(key => {
      if (now > this.cache[key].expiresAt) {
        delete this.cache[key];
        cleanedCount++;
      }
    });

    if (cleanedCount > 0) {
      console.log(`🧹 清除了 ${cleanedCount} 个过期的权限验证缓存`);
    }
  }

  /**
   * 获取缓存统计信息
   */
  static getCacheStats(): { size: number; expired: number } {
    const now = Date.now();
    const entries = Object.values(this.cache);
    
    return {
      size: entries.length,
      expired: entries.filter(entry => now > entry.expiresAt).length
    };
  }
}

// 定期清理过期缓存
if (typeof window !== 'undefined') {
  setInterval(() => {
    ServerPermissionService.cleanExpiredCache();
  }, 60000); // 每分钟清理一次
}

export default ServerPermissionService;