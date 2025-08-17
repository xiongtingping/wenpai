/**
 * ✅ 用户数据隔离初始化Hook
 * 🎯 用途：在用户登录/登出时自动初始化各个服务的用户数据隔离
 * 📌 核心功能：
 * 1. 监听用户状态变化
 * 2. 自动设置各服务的当前用户
 * 3. 提供用户数据清理功能
 * 4. 统一管理用户数据隔离
 */

import { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { paymentStatusService } from '@/services/paymentStatusService';
import { hashtagGenerator } from '@/utils/hashtagGenerator';
import { logger } from '@/utils/logger';

/**
 * 用户数据隔离初始化配置
 */
export interface UserDataIsolationInitConfig {
  enableLogging?: boolean;
  autoCleanupOnLogout?: boolean;
  services?: {
    payment?: boolean;
    hashtag?: boolean;
    // 可以扩展更多服务
  };
}

/**
 * 用户数据隔离初始化Hook
 */
export function useUserDataIsolationInit(config: UserDataIsolationInitConfig = {}) {
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
      console.log(`🔄 用户数据隔离初始化: ${userId || 'guest'}`);
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

  }, [user?.id, enableLogging, autoCleanupOnLogout, services]);

  /**
   * 手动清理指定用户的所有数据
   */
  const cleanupUserData = (targetUserId: string) => {
    let totalCleaned = 0;

    if (services.payment) {
      totalCleaned += paymentStatusService.clearUserPaymentData(targetUserId);
    }

    if (services.hashtag) {
      totalCleaned += hashtagGenerator.clearUserTagData(targetUserId);
    }

    if (enableLogging) {
      logger.debug('✅ 用户数据清理完成: ${targetUserId}, 总计清理 ${totalCleaned} 项');
    }

    return totalCleaned;
  };

  /**
   * 获取当前用户数据统计
   */
  const getUserDataStats = () => {
    const stats: Record<string, number> = {};
    
    try {
      const keys = Object.keys(localStorage);
      
      keys.forEach(key => {
        // 解析存储键格式：module_type_userId
        const parts = key.split('_');
        if (parts.length >= 3) {
          const userId = parts[parts.length - 1];
          stats[userId] = (stats[userId] || 0) + 1;
        }
      });
      
      if (enableLogging) {
        console.log('📊 用户数据统计:', stats);
      }
    } catch (error) {
      console.error('❌ 获取用户数据统计失败:', error);
    }
    
    return stats;
  };

  /**
   * 迁移数据到新的用户隔离格式
   */
  const migrateToUserIsolation = (oldKeys: string[], modulePrefix: string) => {
    let migratedCount = 0;
    const currentUserId = user?.id || 'guest';

    try {
      oldKeys.forEach(oldKey => {
        const data = localStorage.getItem(oldKey);
        if (data) {
          const newKey = `${modulePrefix}_${currentUserId}`;
          localStorage.setItem(newKey, data);
          localStorage.removeItem(oldKey);
          migratedCount++;
          
          if (enableLogging) {
            console.log(`📦 数据迁移: ${oldKey} -> ${newKey}`);
          }
        }
      });

      if (enableLogging) {
        logger.debug('✅ 数据迁移完成: ${migratedCount} 项');
      }
    } catch (error) {
      console.error('❌ 数据迁移失败:', error);
    }

    return migratedCount;
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
 * 全局用户数据隔离初始化组件
 * 在App根组件中使用，确保整个应用的用户数据隔离正常工作
 */
export function UserDataIsolationProvider({
  children,
  config = {}
}: {
  children: React.ReactNode;
  config?: UserDataIsolationInitConfig;
}) {
  useUserDataIsolationInit(config);
  return children;
}

/**
 * 用户数据隔离状态检查工具
 */
export const userDataIsolationUtils = {
  /**
   * 检查是否有孤儿数据（没有对应用户的数据）
   */
  checkOrphanData(): string[] {
    const orphanKeys: string[] = [];
    
    try {
      const keys = Object.keys(localStorage);
      const userDataKeys = keys.filter(key => 
        key.includes('_') && 
        (key.startsWith('wenpai_') || 
         key.startsWith('library_') || 
         key.startsWith('adapt_') ||
         key.startsWith('share_') ||
         key.startsWith('user_tag_'))
      );

      userDataKeys.forEach(key => {
        const parts = key.split('_');
        if (parts.length >= 2) {
          const userId = parts[parts.length - 1];
          // 检查是否是有效的用户ID格式
          if (userId === 'guest' || userId.length > 5) {
            // 这是正常的用户数据
          } else {
            orphanKeys.push(key);
          }
        }
      });

      if (orphanKeys.length > 0) {
        console.warn('⚠️ 发现孤儿数据:', orphanKeys);
      }
    } catch (error) {
      console.error('❌ 检查孤儿数据失败:', error);
    }

    return orphanKeys;
  },

  /**
   * 清理孤儿数据
   */
  cleanupOrphanData(): number {
    const orphanKeys = this.checkOrphanData();
    
    orphanKeys.forEach(key => {
      localStorage.removeItem(key);
    });

    if (orphanKeys.length > 0) {
      logger.debug('✅ 清理孤儿数据完成: ${orphanKeys.length} 项');
    }

    return orphanKeys.length;
  },

  /**
   * 验证用户数据隔离完整性
   */
  validateDataIsolation(): boolean {
    try {
      const keys = Object.keys(localStorage);
      const userDataKeys = keys.filter(key => 
        key.includes('_') && 
        (key.startsWith('wenpai_') || 
         key.startsWith('library_') || 
         key.startsWith('adapt_') ||
         key.startsWith('share_') ||
         key.startsWith('user_tag_'))
      );

      let isValid = true;
      const issues: string[] = [];

      userDataKeys.forEach(key => {
        const parts = key.split('_');
        if (parts.length < 2) {
          issues.push(`无效的存储键格式: ${key}`);
          isValid = false;
        }
      });

      if (!isValid) {
        console.error('❌ 用户数据隔离验证失败:', issues);
      } else {
        logger.debug('✅ 用户数据隔离验证通过');
      }

      return isValid;
    } catch (error) {
      console.error('❌ 验证用户数据隔离失败:', error);
      return false;
    }
  }
};
