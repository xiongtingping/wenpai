/**
 * 🔧 [DIRECT_USER_DATA_ISOLATION_v2025.08.15]
 * 直接用户数据隔离初始化Hook - 使用DirectAuthContext
 * 
 * 这是原useUserDataIsolationInit的直接版本，使用DirectAuth而不是UnifiedAuth
 */

import { useEffect } from 'react';
import { useAuth } from '@/hooks/useDirectAuth';
import { paymentStatusService } from '@/services/paymentStatusService';
import { hashtagGenerator } from '@/utils/hashtagGenerator';

/**
 * 用户数据隔离初始化配置
 */
export interface DirectUserDataIsolationInitConfig {
  enableLogging?: boolean;
  autoCleanupOnLogout?: boolean;
  services?: {
    payment?: boolean;
    hashtag?: boolean;
    // 可以扩展更多服务
  };
}

/**
 * 直接用户数据隔离初始化Hook
 */
export function useDirectUserDataIsolationInit(config: DirectUserDataIsolationInitConfig = {}) {
  const { user } = useAuth();
  
  const {
    enableLogging = true,
    autoCleanupOnLogout = false,
    services = {
      payment: true,
      hashtag: true
    }
  } = config;

  // 监听用户状态变化，自动设置各服务的当前用户
  useEffect(() => {
    const userId = user?.id || null;
    
    if (enableLogging) {
      console.log(`🔄 直接用户数据隔离初始化: ${userId || 'guest'}`);
    }

    // 设置支付服务的当前用户
    if (services.payment) {
      paymentStatusService.setCurrentUser(userId);
    }

    // 如果用户登出且启用自动清理
    if (!userId && autoCleanupOnLogout) {
      // 这里可以添加清理逻辑，但要谨慎使用
      if (enableLogging) {
        console.log('🧹 用户登出，考虑清理访客数据');
      }
    }

  }, [user?.id, enableLogging, autoCleanupOnLogout, services.payment]);

  /**
   * 清理用户数据
   */
  const cleanupUserData = (targetUserId?: string) => {
    const userId = targetUserId || user?.id;
    if (!userId) {
      console.warn('无法清理数据：未指定用户ID');
      return;
    }

    const keysToRemove: string[] = [];
    
    // 遍历localStorage，找到该用户的数据
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.includes(`_${userId}`)) {
        keysToRemove.push(key);
      }
    }

    // 删除找到的键
    keysToRemove.forEach(key => {
      localStorage.removeItem(key);
      if (enableLogging) {
        console.log(`🗑️ 已清理用户数据: ${key}`);
      }
    });

    if (enableLogging) {
      console.log(`✅ 用户数据清理完成，共清理 ${keysToRemove.length} 项`);
    }
  };

  /**
   * 获取用户数据统计
   */
  const getUserDataStats = () => {
    const stats = {
      totalKeys: localStorage.length,
      userKeys: {} as Record<string, number>,
      moduleStats: {} as Record<string, number>
    };

    // 分析localStorage中的数据
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key) continue;

      // 提取用户ID
      const userIdMatch = key.match(/_([^_]+)$/);
      if (userIdMatch) {
        const userId = userIdMatch[1];
        stats.userKeys[userId] = (stats.userKeys[userId] || 0) + 1;
      }

      // 提取模块名
      const moduleMatch = key.match(/^([^_]+)/);
      if (moduleMatch) {
        const module = moduleMatch[1];
        stats.moduleStats[module] = (stats.moduleStats[module] || 0) + 1;
      }
    }

    return stats;
  };

  /**
   * 迁移到用户隔离存储
   */
  const migrateToUserIsolation = (oldKey: string, newModulePrefix: string) => {
    const userId = user?.id;
    if (!userId) {
      console.warn('无法迁移：用户未登录');
      return false;
    }

    const oldData = localStorage.getItem(oldKey);
    if (!oldData) {
      if (enableLogging) {
        console.log(`迁移跳过：旧键 ${oldKey} 不存在`);
      }
      return false;
    }

    const newKey = `${newModulePrefix}_${userId}`;
    localStorage.setItem(newKey, oldData);
    localStorage.removeItem(oldKey);

    if (enableLogging) {
      console.log(`✅ 数据迁移完成: ${oldKey} -> ${newKey}`);
    }

    return true;
  };

  return {
    currentUser: user,
    currentUserId: user?.id || null,
    isLoggedIn: !!user?.id,
    isGuest: !user?.id,
    cleanupUserData,
    getUserDataStats,
    migrateToUserIsolation
  };
}

/**
 * 全局直接用户数据隔离初始化组件
 * 在App根组件中使用，确保整个应用的用户数据隔离正常工作
 */
export function DirectUserDataIsolationProvider({
  children,
  config = {}
}: {
  children: React.ReactNode;
  config?: DirectUserDataIsolationInitConfig;
}) {
  useDirectUserDataIsolationInit(config);
  return children;
}

/**
 * 直接用户数据隔离状态检查工具
 */
export const directUserDataIsolationUtils = {
  /**
   * 检查是否有孤儿数据（没有对应用户的数据）
   */
  checkOrphanData(): string[] {
    const orphanKeys: string[] = [];
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key) continue;
      
      // 检查是否是用户隔离的键格式
      if (key.includes('_') && !key.endsWith('_guest')) {
        const parts = key.split('_');
        if (parts.length >= 2) {
          const userId = parts[parts.length - 1];
          // 这里可以添加更复杂的孤儿数据检测逻辑
          // 暂时只标记非guest的数据
          if (userId !== 'guest' && userId.length > 10) {
            orphanKeys.push(key);
          }
        }
      }
    }
    
    return orphanKeys;
  },

  /**
   * 清理孤儿数据
   */
  cleanupOrphanData(): number {
    const orphanKeys = this.checkOrphanData();
    orphanKeys.forEach(key => localStorage.removeItem(key));
    console.log(`🧹 清理了 ${orphanKeys.length} 个孤儿数据项`);
    return orphanKeys.length;
  },

  /**
   * 获取存储使用情况报告
   */
  getStorageReport(): {
    totalSize: number;
    keyCount: number;
    userBreakdown: Record<string, { keys: number; estimatedSize: number }>;
  } {
    let totalSize = 0;
    const userBreakdown: Record<string, { keys: number; estimatedSize: number }> = {};

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key) continue;

      const value = localStorage.getItem(key) || '';
      const size = key.length + value.length;
      totalSize += size;

      // 提取用户ID
      const userIdMatch = key.match(/_([^_]+)$/);
      const userId = userIdMatch ? userIdMatch[1] : 'unknown';

      if (!userBreakdown[userId]) {
        userBreakdown[userId] = { keys: 0, estimatedSize: 0 };
      }

      userBreakdown[userId].keys++;
      userBreakdown[userId].estimatedSize += size;
    }

    return {
      totalSize,
      keyCount: localStorage.length,
      userBreakdown
    };
  }
};

export default {
  useDirectUserDataIsolationInit,
  DirectUserDataIsolationProvider,
  directUserDataIsolationUtils
};
