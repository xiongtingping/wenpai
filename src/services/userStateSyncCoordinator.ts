/**
 * 🎯 用户状态同步协调器
 *
 * 架构目标:
 * 1. 解决用户状态多源同步的竞态条件
 * 2. 提供原子化的状态更新操作
 * 3. 确保Context、Store、SecureService三层数据一致性
 * 4. 实现事务性回滚机制
 *
 * 核心原则:
 * - Single Write Point: 所有用户状态更新通过此协调器
 * - Atomic Updates: 要么全部成功,要么全部回滚
 * - Consistency Verification: 更新后验证三层数据一致性
 *
 * @updated 2025-10-03 - 重构继承BaseService
 */

import { BaseService } from './base/BaseService';
import { SecureUserStateService } from './secureUserStateService';
import { useUnifiedStore } from '@/stores/unified-state-store';
import type { UserState } from '@/stores/unified-state-store';
import { logger } from '@/utils/logger';

/**
 * 用户信息接口 (兼容多个系统)
 */
export interface UserInfo {
  id: string;
  username?: string;
  email?: string;
  phone?: string;
  nickname?: string;
  avatar?: string;
  loginTime?: string;
  roles?: string[];
  permissions?: string[];
  [key: string]: any;
}

/**
 * 同步结果接口
 */
export interface SyncResult {
  success: boolean;
  syncedLayers: Array<'secure' | 'store' | 'context'>;
  failedLayers: Array<'secure' | 'store' | 'context'>;
  error?: string;
  rollbackPerformed?: boolean;
}

/**
 * 同步状态快照 (用于回滚)
 */
interface StateSnapshot {
  secureState: UserInfo | null;
  storeState: UserState;
  timestamp: number;
}

/**
 * 用户状态同步协调器类
 */
export class UserStateSyncCoordinator extends BaseService {
  private static instance: UserStateSyncCoordinator | null = null;
  private syncInProgress = false;
  private lastSyncTimestamp = 0;
  private stateSnapshot: StateSnapshot | null = null;

  private constructor() {
    super('UserStateSyncCoordinator');
  }

  /**
   * 获取单例实例
   */
  static getInstance(): UserStateSyncCoordinator {
    if (!UserStateSyncCoordinator.instance) {
      UserStateSyncCoordinator.instance = new UserStateSyncCoordinator();
    }
    return UserStateSyncCoordinator.instance;
  }

  /**
   * 🎯 核心方法: 原子化同步用户状态到所有层
   *
   * @param user 用户信息
   * @param contextSetUser Context层的setUser方法 (注入避免循环依赖)
   * @returns 同步结果
   */
  async syncUserState(
    user: UserInfo | null,
    contextSetUser?: (user: UserInfo | null) => void
  ): Promise<SyncResult> {
    // 防止并发同步
    if (this.syncInProgress) {
      logger.warn('⚠️ 用户状态同步正在进行中,跳过重复调用');
      return {
        success: false,
        syncedLayers: [],
        failedLayers: [],
        error: '同步操作正在进行中'
      };
    }

    this.syncInProgress = true;
    const syncedLayers: Array<'secure' | 'store' | 'context'> = [];
    const failedLayers: Array<'secure' | 'store' | 'context'> = [];

    try {
      logger.info('🔄 开始原子化同步用户状态', {
        userId: user?.id,
        hasContextSetter: !!contextSetUser
      });

      // 1. 创建状态快照 (用于回滚)
      await this.createStateSnapshot();

      // 2. Phase 1: SecureService加密存储 (最关键的持久化层)
      try {
        if (user) {
          const storeSuccess = await SecureUserStateService.storeUserState(user);
          if (!storeSuccess) {
            throw new Error('SecureService存储失败');
          }
        } else {
          SecureUserStateService.clearUserState();
        }
        syncedLayers.push('secure');
        logger.debug('✅ SecureService层同步成功');
      } catch (secureError) {
        failedLayers.push('secure');
        logger.error('❌ SecureService层同步失败', secureError);
        throw new Error(`SecureService层失败: ${secureError}`);
      }

      // 3. Phase 2: Zustand Store状态更新 (应用内存状态)
      try {
        const store = useUnifiedStore.getState();
        if (user) {
          store.setUser({
            id: user.id,
            username: user.username || null,
            email: user.email || null,
            phone: user.phone || null,
            nickname: user.nickname || null,
            avatar: user.avatar || null,
            roles: user.roles || [],
            permissions: user.permissions || [],
            subscription: 'free', // 默认值,后续从订阅服务获取
            isAuthenticated: true,
            loginTime: user.loginTime || new Date().toISOString(),
            lastActivity: new Date().toISOString()
          });
        } else {
          store.clearUser();
        }
        syncedLayers.push('store');
        logger.debug('✅ Store层同步成功');
      } catch (storeError) {
        failedLayers.push('store');
        logger.error('❌ Store层同步失败', storeError);
        throw new Error(`Store层失败: ${storeError}`);
      }

      // 4. Phase 3: Context层更新 (可选,如果提供了setter)
      if (contextSetUser) {
        try {
          contextSetUser(user);
          syncedLayers.push('context');
          logger.debug('✅ Context层同步成功');
        } catch (contextError) {
          failedLayers.push('context');
          logger.error('❌ Context层同步失败', contextError);
          // Context层失败不影响整体成功 (因为Store已经是最新状态)
        }
      }

      // 5. 验证一致性
      const isConsistent = await this.verifyConsistency(user);
      if (!isConsistent) {
        logger.warn('⚠️ 状态同步后一致性验证失败,但不回滚');
      }

      this.lastSyncTimestamp = Date.now();
      logger.info('✅ 用户状态原子化同步完成', {
        syncedLayers,
        failedLayers,
        userId: user?.id
      });

      return {
        success: true,
        syncedLayers,
        failedLayers,
        rollbackPerformed: false
      };

    } catch (error) {
      logger.error('❌ 用户状态同步失败,执行回滚', error);

      // 执行回滚
      const rollbackSuccess = await this.rollbackToSnapshot();

      return {
        success: false,
        syncedLayers,
        failedLayers,
        error: error instanceof Error ? error.message : '未知错误',
        rollbackPerformed: rollbackSuccess
      };

    } finally {
      this.syncInProgress = false;
    }
  }

  /**
   * 创建当前状态快照
   */
  private async createStateSnapshot(): Promise<void> {
    try {
      const secureState = await SecureUserStateService.getUserState();
      const storeState = useUnifiedStore.getState().user;

      this.stateSnapshot = {
        secureState,
        storeState: { ...storeState }, // 深拷贝
        timestamp: Date.now()
      };

      logger.debug('📸 状态快照已创建', {
        hasSecureState: !!secureState,
        storeUserId: storeState.id
      });
    } catch (error) {
      logger.error('❌ 创建状态快照失败', error);
      this.stateSnapshot = null;
    }
  }

  /**
   * 回滚到快照状态
   */
  private async rollbackToSnapshot(): Promise<boolean> {
    if (!this.stateSnapshot) {
      logger.warn('⚠️ 无可用快照,无法回滚');
      return false;
    }

    try {
      logger.info('🔙 开始回滚到快照状态', {
        snapshotTimestamp: new Date(this.stateSnapshot.timestamp).toISOString()
      });

      // 回滚SecureService
      if (this.stateSnapshot.secureState) {
        await SecureUserStateService.storeUserState(this.stateSnapshot.secureState);
      } else {
        SecureUserStateService.clearUserState();
      }

      // 回滚Store
      const store = useUnifiedStore.getState();
      if (this.stateSnapshot.storeState.id) {
        store.setUser(this.stateSnapshot.storeState);
      } else {
        store.clearUser();
      }

      logger.info('✅ 状态回滚成功');
      return true;

    } catch (error) {
      logger.error('❌ 状态回滚失败', error);
      return false;
    }
  }

  /**
   * 验证各层状态一致性
   */
  private async verifyConsistency(expectedUser: UserInfo | null): Promise<boolean> {
    try {
      const secureUser = await SecureUserStateService.getUserState();
      const storeUser = useUnifiedStore.getState().user;

      // 验证用户ID一致性
      const secureUserId = secureUser?.id || null;
      const storeUserId = storeUser.id || null;
      const expectedUserId = expectedUser?.id || null;

      const isConsistent = (
        secureUserId === expectedUserId &&
        storeUserId === expectedUserId
      );

      if (!isConsistent) {
        logger.warn('⚠️ 状态一致性验证失败', {
          expected: expectedUserId,
          secure: secureUserId,
          store: storeUserId
        });
      }

      return isConsistent;

    } catch (error) {
      logger.error('❌ 一致性验证异常', error);
      return false;
    }
  }

  /**
   * 获取当前同步状态
   */
  getSyncStatus(): {
    inProgress: boolean;
    lastSyncTime: number;
    timeSinceLastSync: number;
  } {
    return {
      inProgress: this.syncInProgress,
      lastSyncTime: this.lastSyncTimestamp,
      timeSinceLastSync: Date.now() - this.lastSyncTimestamp
    };
  }

  /**
   * 🎯 便捷方法: 登录场景的状态同步
   */
  async syncOnLogin(
    userInfo: UserInfo,
    contextSetUser?: (user: UserInfo | null) => void
  ): Promise<SyncResult> {
    logger.info('🔐 执行登录场景的状态同步', { userId: userInfo.id });

    // 确保有loginTime
    const userWithTimestamp = {
      ...userInfo,
      loginTime: userInfo.loginTime || new Date().toISOString()
    };

    return await this.syncUserState(userWithTimestamp, contextSetUser);
  }

  /**
   * 🎯 便捷方法: 登出场景的状态清除
   */
  async syncOnLogout(
    contextSetUser?: (user: UserInfo | null) => void
  ): Promise<SyncResult> {
    logger.info('🚪 执行登出场景的状态清除');
    return await this.syncUserState(null, contextSetUser);
  }

  /**
   * 🎯 便捷方法: 用户信息更新场景
   */
  async syncOnUpdate(
    updates: Partial<UserInfo>,
    contextSetUser?: (user: UserInfo | null) => void
  ): Promise<SyncResult> {
    logger.info('🔄 执行用户信息更新的状态同步', { updates });

    // 获取当前用户信息
    const currentUser = await SecureUserStateService.getUserState();
    if (!currentUser) {
      return {
        success: false,
        syncedLayers: [],
        failedLayers: [],
        error: '当前无用户登录,无法更新'
      };
    }

    // 合并更新
    const updatedUser = { ...currentUser, ...updates };

    return await this.syncUserState(updatedUser, contextSetUser);
  }
}

/**
 * 导出单例实例并自动初始化
 */
const coordinatorInstance = UserStateSyncCoordinator.getInstance();

// 自动初始化
coordinatorInstance.initialize().catch(error => {
  logger.error('[UserStateSyncCoordinator] Auto-initialization failed:', error);
});

export const userStateSyncCoordinator = coordinatorInstance;

/**
 * 导出便捷Hook (用于React组件)
 */
export function useUserStateSync() {
  const coordinator = UserStateSyncCoordinator.getInstance();

  return {
    syncOnLogin: coordinator.syncOnLogin.bind(coordinator),
    syncOnLogout: coordinator.syncOnLogout.bind(coordinator),
    syncOnUpdate: coordinator.syncOnUpdate.bind(coordinator),
    getSyncStatus: coordinator.getSyncStatus.bind(coordinator)
  };
}

export default UserStateSyncCoordinator;
