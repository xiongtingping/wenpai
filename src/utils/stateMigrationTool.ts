/**
 * 🔄 状态迁移工具
 * 将现有的分散状态管理迁移到统一状态管理系统
 * 遵循 CLAUDE.md 架构治理规范
 */

import { useUnifiedStore } from '@/stores/unified-state-store';

// ============================================================================
// 🎯 迁移接口定义
// ============================================================================

interface MigrationResult {
  success: boolean;
  migratedKeys: string[];
  errors: string[];
  timestamp: string;
}

interface LegacyTokenUsageData {
  currentStats?: any;
  usageHistory?: any[];
  featureStats?: Record<string, any>;
}

interface LegacyUsageData {
  records?: any[];
  dailyUsage?: Record<string, number>;
  monthlyUsage?: Record<string, number>;
  totalUsage?: number;
}

interface LegacyAuthData {
  user?: any;
  isAuthenticated?: boolean;
  tokens?: any;
}

interface LegacyThemeData {
  theme?: string;
  primaryColor?: string;
  fontSize?: string;
}

interface LegacyFavoritesData {
  favorites?: any[];
  tags?: string[];
}

interface LegacyContentSyncData {
  lastSync?: string;
  pendingItems?: any[];
}

// ============================================================================
// 🎯 状态迁移工具类
// ============================================================================

export class StateMigrationTool {
  private static instance: StateMigrationTool;
  private migrationLog: string[] = [];

  private constructor() {}

  public static getInstance(): StateMigrationTool {
    if (!StateMigrationTool.instance) {
      StateMigrationTool.instance = new StateMigrationTool();
    }
    return StateMigrationTool.instance;
  }

  /**
   * 🚀 执行完整状态迁移
   */
  public async migrateAllStates(): Promise<MigrationResult> {
    const result: MigrationResult = {
      success: true,
      migratedKeys: [],
      errors: [],
      timestamp: new Date().toISOString(),
    };

    this.log('🚀 开始状态迁移到统一管理系统...');

    try {
      // 迁移 Token 使用状态
      await this.migrateTokenUsageState(result);

      // 迁移用户认证状态
      await this.migrateAuthState(result);

      // 迁移主题状态
      await this.migrateThemeState(result);

      // 迁移收藏夹状态
      await this.migrateFavoritesState(result);

      // 迁移内容同步状态
      await this.migrateContentSyncState(result);

      // 迁移使用统计状态
      await this.migrateUsageState(result);

      this.log(`✅ 状态迁移完成，成功迁移 ${result.migratedKeys.length} 个状态模块`);

    } catch (error) {
      result.success = false;
      const errorMsg = error instanceof Error ? error.message : '未知错误';
      result.errors.push(`迁移过程失败: ${errorMsg}`);
      this.log(`❌ 状态迁移失败: ${errorMsg}`);
    }

    return result;
  }

  /**
   * 迁移 Token 使用状态
   */
  private async migrateTokenUsageState(result: MigrationResult): Promise<void> {
    try {
      // 从 localStorage 读取旧的 token 使用数据
      const oldTokenData = this.getFromStorage<LegacyTokenUsageData>('wenpai-token-usage-store');

      if (oldTokenData) {
        const store = useUnifiedStore.getState();

        // 迁移当前统计
        if (oldTokenData.currentStats) {
          store.updateTokenStats(oldTokenData.currentStats);
          this.log('📊 迁移 Token 统计数据');
        }

        // 迁移使用历史
        if (oldTokenData.usageHistory && Array.isArray(oldTokenData.usageHistory)) {
          oldTokenData.usageHistory.forEach(record => {
            if (this.isValidTokenRecord(record)) {
              store.addTokenUsage(record);
            }
          });
          this.log(`📝 迁移 ${oldTokenData.usageHistory.length} 条 Token 使用历史`);
        }

        // 迁移功能统计
        if (oldTokenData.featureStats) {
          store.updateFeatureStats(oldTokenData.featureStats);
          this.log('📈 迁移功能统计数据');
        }

        result.migratedKeys.push('tokenUsage');
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : '未知错误';
      result.errors.push(`Token使用状态迁移失败: ${errorMsg}`);
      this.log(`❌ Token使用状态迁移失败: ${errorMsg}`);
    }
  }

  /**
   * 迁移用户认证状态
   */
  private async migrateAuthState(result: MigrationResult): Promise<void> {
    try {
      // 从多个可能的存储位置读取认证数据
      const authSources = [
        'wenpai-auth-store',
        'auth-storage',
        'unified-auth-storage'
      ];

      for (const source of authSources) {
        const oldAuthData = this.getFromStorage<LegacyAuthData>(source);

        if (oldAuthData && oldAuthData.user) {
          const store = useUnifiedStore.getState();

          // 标准化用户信息
          const normalizedUser = {
            id: oldAuthData.user.id || oldAuthData.user.userId || null,
            username: oldAuthData.user.username || oldAuthData.user.name || null,
            email: oldAuthData.user.email || null,
            phone: oldAuthData.user.phone || null,
            nickname: oldAuthData.user.nickname || oldAuthData.user.displayName || null,
            avatar: oldAuthData.user.avatar || oldAuthData.user.picture || null,
            roles: oldAuthData.user.roles || [],
            permissions: oldAuthData.user.permissions || [],
            subscription: oldAuthData.user.subscription || 'free',
            isAuthenticated: !!oldAuthData.isAuthenticated,
            loginTime: oldAuthData.user.loginTime || null,
            lastActivity: null, // 不迁移活动时间
          };

          store.setUser(normalizedUser);
          this.log(`👤 迁移用户认证状态: ${normalizedUser.username || normalizedUser.id}`);
          result.migratedKeys.push('auth');
          break; // 找到有效数据后停止
        }
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : '未知错误';
      result.errors.push(`认证状态迁移失败: ${errorMsg}`);
      this.log(`❌ 认证状态迁移失败: ${errorMsg}`);
    }
  }

  /**
   * 迁移主题状态
   */
  private async migrateThemeState(result: MigrationResult): Promise<void> {
    try {
      const oldThemeData = this.getFromStorage<LegacyThemeData>('theme-storage');

      if (oldThemeData) {
        const store = useUnifiedStore.getState();

        // 迁移主题模式
        if (oldThemeData.theme) {
          const mode = this.normalizeThemeMode(oldThemeData.theme);
          store.setThemeMode(mode);
        }

        // 迁移主色调
        if (oldThemeData.primaryColor) {
          store.setPrimaryColor(oldThemeData.primaryColor);
        }

        // 迁移字体大小
        if (oldThemeData.fontSize) {
          const fontSize = this.normalizeFontSize(oldThemeData.fontSize);
          store.setFontSize(fontSize);
        }

        this.log('🎨 迁移主题设置');
        result.migratedKeys.push('theme');
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : '未知错误';
      result.errors.push(`主题状态迁移失败: ${errorMsg}`);
      this.log(`❌ 主题状态迁移失败: ${errorMsg}`);
    }
  }

  /**
   * 迁移收藏夹状态
   */
  private async migrateFavoritesState(result: MigrationResult): Promise<void> {
    try {
      const oldFavoritesData = this.getFromStorage<LegacyFavoritesData>('favorites-storage');

      if (oldFavoritesData) {
        const store = useUnifiedStore.getState();

        // 迁移收藏项目
        if (oldFavoritesData.favorites && Array.isArray(oldFavoritesData.favorites)) {
          oldFavoritesData.favorites.forEach(item => {
            if (this.isValidFavoriteItem(item)) {
              const normalizedItem = {
                id: item.id || `fav_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                type: item.type || 'content',
                title: item.title || '未命名',
                content: item.content || '',
                tags: item.tags || [],
                createdAt: item.createdAt || new Date().toISOString(),
                updatedAt: item.updatedAt || new Date().toISOString(),
              };
              store.addFavorite(normalizedItem);
            }
          });
          this.log(`❤️ 迁移 ${oldFavoritesData.favorites.length} 个收藏项目`);
        }

        // 迁移标签
        if (oldFavoritesData.tags && Array.isArray(oldFavoritesData.tags)) {
          oldFavoritesData.tags.forEach(tag => {
            if (typeof tag === 'string' && tag.trim()) {
              store.addTag(tag.trim());
            }
          });
          this.log(`🏷️ 迁移 ${oldFavoritesData.tags.length} 个标签`);
        }

        result.migratedKeys.push('favorites');
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : '未知错误';
      result.errors.push(`收藏夹状态迁移失败: ${errorMsg}`);
      this.log(`❌ 收藏夹状态迁移失败: ${errorMsg}`);
    }
  }

  /**
   * 迁移内容同步状态
   */
  private async migrateContentSyncState(result: MigrationResult): Promise<void> {
    try {
      const oldSyncData = this.getFromStorage<LegacyContentSyncData>('content-sync-storage');

      if (oldSyncData) {
        const store = useUnifiedStore.getState();

        // 记录上次同步时间
        if (oldSyncData.lastSync) {
          // 通过更新状态来设置上次同步时间
          store.completeSync();
        }

        // 统计待同步项目
        if (oldSyncData.pendingItems && Array.isArray(oldSyncData.pendingItems)) {
          const pendingCount = oldSyncData.pendingItems.length;
          for (let i = 0; i < pendingCount; i++) {
            store.addPendingChange();
          }
          this.log(`🔄 迁移 ${pendingCount} 个待同步项目`);
        }

        result.migratedKeys.push('contentSync');
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : '未知错误';
      result.errors.push(`内容同步状态迁移失败: ${errorMsg}`);
      this.log(`❌ 内容同步状态迁移失败: ${errorMsg}`);
    }
  }

  /**
   * 迁移使用统计状态
   */
  private async migrateUsageState(result: MigrationResult): Promise<void> {
    try {
      const oldUsageData = this.getFromStorage<LegacyUsageData>('usage-storage');

      if (oldUsageData && oldUsageData.records) {
        const store = useUnifiedStore.getState();

        // 将旧的使用记录转换为 Token 使用记录
        let migratedCount = 0;
        oldUsageData.records.forEach(record => {
          if (this.isValidUsageRecord(record)) {
            const tokenRecord = {
              id: record.id || `usage_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
              userId: record.userId || 'unknown',
              feature: record.feature || 'unknown',
              totalTokens: this.estimateTokensFromUsage(record),
              inputTokens: 0,
              outputTokens: 0,
              timestamp: new Date(record.timestamp || Date.now()).toISOString(),
              metadata: record.metadata || {},
            };
            store.addTokenUsage(tokenRecord);
            migratedCount++;
          }
        });

        this.log(`📊 迁移 ${migratedCount} 条使用统计记录为 Token 记录`);
        result.migratedKeys.push('usage');
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : '未知错误';
      result.errors.push(`使用统计状态迁移失败: ${errorMsg}`);
      this.log(`❌ 使用统计状态迁移失败: ${errorMsg}`);
    }
  }

  // ============================================================================
  // 🎯 辅助方法
  // ============================================================================

  /**
   * 从 localStorage 获取数据
   */
  private getFromStorage<T>(key: string): T | null {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      this.log(`⚠️ 读取存储数据失败: ${key}`);
      return null;
    }
  }

  /**
   * 清理旧的存储数据
   */
  public cleanupOldStorageData(): void {
    const oldKeys = [
      'wenpai-token-usage-store',
      'usage-storage',
      'wenpai-auth-store',
      'auth-storage',
      'unified-auth-storage',
      'theme-storage',
      'favorites-storage',
      'content-sync-storage',
    ];

    let cleanedCount = 0;
    oldKeys.forEach(key => {
      if (localStorage.getItem(key)) {
        localStorage.removeItem(key);
        cleanedCount++;
        this.log(`🧹 清理旧存储: ${key}`);
      }
    });

    this.log(`✅ 清理完成，移除 ${cleanedCount} 个旧存储项`);
  }

  /**
   * 验证 Token 记录有效性
   */
  private isValidTokenRecord(record: any): boolean {
    return record && 
           typeof record === 'object' &&
           record.userId &&
           record.feature &&
           typeof record.totalTokens === 'number';
  }

  /**
   * 验证收藏项目有效性
   */
  private isValidFavoriteItem(item: any): boolean {
    return item &&
           typeof item === 'object' &&
           item.title &&
           item.content;
  }

  /**
   * 验证使用记录有效性
   */
  private isValidUsageRecord(record: any): boolean {
    return record &&
           typeof record === 'object' &&
           record.feature &&
           record.timestamp;
  }

  /**
   * 标准化主题模式
   */
  private normalizeThemeMode(theme: string): 'light' | 'dark' | 'system' {
    const lower = theme.toLowerCase();
    if (lower.includes('dark')) return 'dark';
    if (lower.includes('light')) return 'light';
    return 'system';
  }

  /**
   * 标准化字体大小
   */
  private normalizeFontSize(size: string): 'small' | 'medium' | 'large' {
    const lower = size.toLowerCase();
    if (lower.includes('small') || lower === 'sm') return 'small';
    if (lower.includes('large') || lower === 'lg') return 'large';
    return 'medium';
  }

  /**
   * 从使用记录估算 Token 数量
   */
  private estimateTokensFromUsage(record: any): number {
    // 简单的估算逻辑，根据功能类型估算
    const baseTokens = 100;
    const featureMultiplier: Record<string, number> = {
      'text-generation': 3,
      'content-adaptation': 2,
      'translation': 1.5,
      'summary': 1,
    };

    const multiplier = featureMultiplier[record.feature] || 1;
    return Math.round(baseTokens * multiplier);
  }

  /**
   * 记录迁移日志
   */
  private log(message: string): void {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] ${message}`;
    this.migrationLog.push(logMessage);
    console.log(logMessage);
  }

  /**
   * 获取迁移日志
   */
  public getMigrationLog(): string[] {
    return [...this.migrationLog];
  }

  /**
   * 清理迁移日志
   */
  public clearMigrationLog(): void {
    this.migrationLog = [];
  }
}

// ============================================================================
// 🎯 便捷函数
// ============================================================================

/**
 * 执行状态迁移
 */
export async function migrateToUnifiedState(): Promise<MigrationResult> {
  const migrationTool = StateMigrationTool.getInstance();
  return await migrationTool.migrateAllStates();
}

/**
 * 清理旧状态数据
 */
export function cleanupLegacyStateData(): void {
  const migrationTool = StateMigrationTool.getInstance();
  migrationTool.cleanupOldStorageData();
}

/**
 * 获取迁移日志
 */
export function getMigrationLog(): string[] {
  const migrationTool = StateMigrationTool.getInstance();
  return migrationTool.getMigrationLog();
}

export default StateMigrationTool;