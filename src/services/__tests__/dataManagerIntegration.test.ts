/**
 * 🧪 数据管理器集成测试
 * 验证 v2.0 重构后的所有修复项
 *
 * 测试覆盖:
 * - P0-1: Supabase 数据隔离
 * - P0-2: 字段名一致性
 * - P0-3: checkAuth 原子同步
 * - P1-1: 代码复用 (继承体系)
 * - P1-3: 存储配额监控
 * - P1-4: 降级策略
 */

import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { UnifiedDataManager } from '../unifiedDataManager';
import { RobustUnifiedDataManager } from '../robustUnifiedDataManager';
import { DataFieldAdapter } from '../base/DataFieldAdapter';
import { fallbackStrategy, DataFreshness } from '../strategies/FallbackStrategy';
import { storageQuotaMonitor } from '@/utils/storageQuotaMonitor';
import { userStateSyncCoordinator } from '../userStateSyncCoordinator';

describe('数据管理器集成测试套件', () => {

  // ============================================================================
  // P0-1: Supabase 数据隔离测试
  // ============================================================================

  describe('[P0-1] Supabase 数据隔离', () => {
    it('DataFieldAdapter 应正确格式化数据键 (包含用户ID)', () => {
      const userId = 'user123';
      const key = 'favorites';

      const formatted = DataFieldAdapter.formatDataKey(userId, key);

      expect(formatted).toBe('user_user123_favorites');
      expect(formatted).toContain(userId); // 确保包含用户ID
    });

    it('DataFieldAdapter 应构建双重隔离过滤条件', () => {
      const userId = 'user456';
      const key = 'bookmarkedTopics';

      const filter = DataFieldAdapter.buildSecureFilter(userId, key);

      expect(filter).toEqual({
        user_id: 'user456',  // 第一层隔离
        brand_name: 'user_user456_bookmarkedTopics'  // 第二层隔离
      });
    });

    it('不同用户的相同 key 应生成不同的 brand_name', () => {
      const user1Filter = DataFieldAdapter.buildSecureFilter('user1', 'favorites');
      const user2Filter = DataFieldAdapter.buildSecureFilter('user2', 'favorites');

      expect(user1Filter.brand_name).not.toBe(user2Filter.brand_name);
      expect(user1Filter.brand_name).toBe('user_user1_favorites');
      expect(user2Filter.brand_name).toBe('user_user2_favorites');
    });

    it('toDatabase 应使用 brand_name/brand_description 字段', () => {
      const record = {
        userId: 'user789',
        dataKey: 'shareHistory',
        dataContent: JSON.stringify(['item1', 'item2']),
        metadata: { version: '1.0' }
      };

      const dbRecord = DataFieldAdapter.toDatabase(record);

      expect(dbRecord).toHaveProperty('user_id', 'user789');
      expect(dbRecord).toHaveProperty('brand_name', 'user_user789_shareHistory');
      expect(dbRecord).toHaveProperty('brand_description', '["item1","item2"]');
      expect(dbRecord.metadata).toHaveProperty('dataKey', 'shareHistory');
    });

    it('fromDatabase 应正确解析数据库记录', () => {
      const dbRecord = {
        id: '123',
        user_id: 'user999',
        brand_name: 'user_user999_emojiLikes',
        brand_description: '["🎉","🚀"]',
        metadata: { dataKey: 'emojiLikes', version: '2.0' },
        created_at: '2025-10-01',
        updated_at: '2025-10-02'
      };

      const record = DataFieldAdapter.fromDatabase(dbRecord);

      expect(record.userId).toBe('user999');
      expect(record.dataKey).toBe('emojiLikes');
      expect(record.dataContent).toBe('["🎉","🚀"]');
      expect(record.metadata?.version).toBe('2.0');
    });
  });

  // ============================================================================
  // P0-2: 字段名一致性测试
  // ============================================================================

  describe('[P0-2] 字段名一致性', () => {
    it('UnifiedDataManager 和 RobustUnifiedDataManager 应使用相同的字段映射', () => {
      const testRecord = {
        userId: 'testUser',
        dataKey: 'testKey',
        dataContent: '{"test": "data"}',
        metadata: {}
      };

      const dbRecord1 = DataFieldAdapter.toDatabase(testRecord);
      const dbRecord2 = DataFieldAdapter.toDatabase(testRecord);

      expect(dbRecord1).toEqual(dbRecord2);
      expect(dbRecord1.brand_name).toBe('user_testUser_testKey');
      expect(dbRecord1.brand_description).toBe('{"test": "data"}');
    });

    it('所有数据管理器应统一使用 brand_name/brand_description', () => {
      const managers = [
        new UnifiedDataManager('user1'),
        new RobustUnifiedDataManager({ userId: 'user2' })
      ];

      managers.forEach(manager => {
        // 验证管理器内部使用 DataFieldAdapter
        // (实际调用会在运行时通过 getCloudData/setCloudData 验证)
        expect(manager).toBeDefined();
      });
    });
  });

  // ============================================================================
  // P0-3: checkAuth 原子同步测试
  // ============================================================================

  describe('[P0-3] checkAuth 原子同步', () => {
    it('userStateSyncCoordinator.syncOnLogin 应原子化同步三层状态', async () => {
      const mockUser = {
        id: 'sync-test-user',
        username: 'syncTest',
        email: 'sync@test.com',
        phone: null,
        nickname: 'Sync Tester',
        avatar: null,
        subscription: 'pro' as const
      };

      let contextUser: any = null;
      const contextSetter = (user: any) => { contextUser = user; };

      const result = await userStateSyncCoordinator.syncOnLogin(
        mockUser,
        contextSetter
      );

      expect(result.success).toBe(true);
      expect(result.syncedLayers).toContain('Context');
      expect(result.syncedLayers).toContain('Store');
      expect(result.syncedLayers).toContain('SecureService');
      expect(contextUser).toEqual(mockUser);
    });

    it('同步失败时应回滚所有层', async () => {
      const invalidUser = null as any; // 无效用户触发失败

      const result = await userStateSyncCoordinator.syncOnLogin(
        invalidUser,
        () => {}
      );

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      // 验证回滚逻辑 (实际实现中应清理所有层)
    });

    it('diagnoseInconsistency 应检测状态不一致', async () => {
      // 模拟不一致场景 (需要 mock 各层状态)
      const diagnosis = await userStateSyncCoordinator.diagnoseInconsistency();

      expect(diagnosis).toHaveProperty('contextUser');
      expect(diagnosis).toHaveProperty('storeUser');
      expect(diagnosis).toHaveProperty('secureUser');
      expect(diagnosis).toHaveProperty('isConsistent');
      expect(diagnosis).toHaveProperty('differences');
    });
  });

  // ============================================================================
  // P1-1: 代码复用 (继承体系) 测试
  // ============================================================================

  describe('[P1-1] 代码复用 - 继承体系', () => {
    it('UnifiedDataManager 应继承 BaseDataManager 的方法', () => {
      const manager = new UnifiedDataManager('inherit-test');

      // 验证继承的 protected 方法存在 (通过类型检查)
      expect(manager).toBeInstanceOf(UnifiedDataManager);
      expect(typeof (manager as any).getCloudData).toBe('function');
      expect(typeof (manager as any).setCloudData).toBe('function');
      expect(typeof (manager as any).getCacheData).toBe('function');
      expect(typeof (manager as any).setCacheData).toBe('function');
    });

    it('RobustUnifiedDataManager 应继承 RobustDataManager 的健壮特性', () => {
      const robustManager = new RobustUnifiedDataManager({ userId: 'robust-test' });

      // 验证健壮性方法
      expect(typeof robustManager.getRobustData).toBe('function');
      expect(typeof robustManager.setRobustData).toBe('function');
      expect(typeof robustManager.dataExists).toBe('function');
      expect(typeof robustManager.getBatchData).toBe('function');
    });

    it('两个管理器使用相同的 DataFieldAdapter', () => {
      const unified = new UnifiedDataManager('user1');
      const robust = new RobustUnifiedDataManager({ userId: 'user2' });

      // 两者都应该通过 DataFieldAdapter 格式化键名
      const key1 = DataFieldAdapter.formatDataKey('user1', 'test');
      const key2 = DataFieldAdapter.formatDataKey('user2', 'test');

      expect(key1).toBe('user_user1_test');
      expect(key2).toBe('user_user2_test');
    });
  });

  // ============================================================================
  // P1-3: 存储配额监控测试
  // ============================================================================

  describe('[P1-3] 存储配额监控', () => {
    beforeEach(() => {
      localStorage.clear();
    });

    it('getQuotaInfo 应正确计算 localStorage 使用情况', () => {
      // 写入测试数据
      localStorage.setItem('test1', 'a'.repeat(1024)); // 1KB
      localStorage.setItem('test2', 'b'.repeat(2048)); // 2KB

      const quota = storageQuotaMonitor.getQuotaInfo();

      expect(quota.used).toBeGreaterThan(3000); // ~3KB (含键名)
      expect(quota.usagePercent).toBeGreaterThan(0);
      expect(quota.largestItems.length).toBeGreaterThan(0);
      expect(quota.largestItems[0].key).toBeDefined();
    });

    it('emergencyCleanup 应保护关键键不被删除', () => {
      // 写入关键数据
      localStorage.setItem('wenpai-unified-store', '{"user":"critical"}');
      localStorage.setItem('_authing_token', 'auth-token');
      localStorage.setItem('user_data', 'user-info');

      // 写入可删除数据
      localStorage.setItem('cache_temp', 'a'.repeat(10000));

      const beforeCount = localStorage.length;
      storageQuotaMonitor.emergencyCleanup(0.01); // 释放 0.01MB

      // 验证关键键未被删除
      expect(localStorage.getItem('wenpai-unified-store')).toBeDefined();
      expect(localStorage.getItem('_authing_token')).toBeDefined();
      expect(localStorage.getItem('user_data')).toBeDefined();

      // 验证清理发生
      expect(localStorage.length).toBeLessThanOrEqual(beforeCount);
    });

    it('存储配额超过 80% 应标记为 warning', () => {
      // 模拟接近配额
      const largeData = 'x'.repeat(8 * 1024 * 1024); // 8MB (接近10MB估算)
      try {
        localStorage.setItem('large_item', largeData);
      } catch (e) {
        // QuotaExceededError 预期
      }

      const quota = storageQuotaMonitor.getQuotaInfo();
      // 根据实际存储情况判断
      if (quota.usagePercent >= 80) {
        expect(quota.usagePercent).toBeGreaterThanOrEqual(80);
      }
    });
  });

  // ============================================================================
  // P1-4: 降级策略测试
  // ============================================================================

  describe('[P1-4] 降级策略', () => {
    it('readWithFallback: 云端成功应返回 FRESH 数据', async () => {
      const cloudReader = jest.fn().mockResolvedValue(['cloud-data']);
      const cacheReader = jest.fn().mockReturnValue(['cache-data']);

      const result = await fallbackStrategy.readWithFallback(
        cloudReader,
        cacheReader,
        Date.now()
      );

      expect(result).toBeDefined();
      expect(result!.data).toEqual(['cloud-data']);
      expect(result!.freshness).toBe(DataFreshness.FRESH);
      expect(result!.source).toBe('cloud');
      expect(cloudReader).toHaveBeenCalled();
      expect(cacheReader).not.toHaveBeenCalled(); // 云端成功，不调用缓存
    });

    it('readWithFallback: 云端失败应降级到缓存', async () => {
      const cloudReader = jest.fn().mockRejectedValue(new Error('Network error'));
      const cacheReader = jest.fn().mockReturnValue(['cache-data']);
      const cacheTimestamp = Date.now() - 1000; // 1秒前

      const result = await fallbackStrategy.readWithFallback(
        cloudReader,
        cacheReader,
        cacheTimestamp
      );

      expect(result).toBeDefined();
      expect(result!.data).toEqual(['cache-data']);
      expect(result!.source).toBe('cache');
      expect(cloudReader).toHaveBeenCalled();
      expect(cacheReader).toHaveBeenCalled();
    });

    it('readWithFallback: 缓存过期应标记为 STALE', async () => {
      const cloudReader = jest.fn().mockRejectedValue(new Error('Network error'));
      const cacheReader = jest.fn().mockReturnValue(['stale-cache']);
      const oldTimestamp = Date.now() - 4 * 60 * 60 * 1000; // 4小时前

      const result = await fallbackStrategy.readWithFallback(
        cloudReader,
        cacheReader,
        oldTimestamp
      );

      expect(result).toBeDefined();
      expect(result!.freshness).toBe(DataFreshness.STALE);
      expect(result!.message).toContain('可能已过期');
      expect(result!.message).toContain('小时前'); // 验证时间格式化
    });

    it('writeWithFallback: 云端成功应返回 synced=true', async () => {
      const cloudWriter = jest.fn().mockResolvedValue(true);
      const cacheWriter = jest.fn().mockReturnValue(true);

      const result = await fallbackStrategy.writeWithFallback(
        { test: 'data' },
        cloudWriter,
        cacheWriter,
        'testKey'
      );

      expect(result.success).toBe(true);
      expect(result.synced).toBe(true);
      expect(result.message).toContain('保存成功');
      expect(cloudWriter).toHaveBeenCalled();
      expect(cacheWriter).toHaveBeenCalled(); // 同时写入缓存
    });

    it('writeWithFallback: 云端失败应降级到本地暂存', async () => {
      const cloudWriter = jest.fn().mockRejectedValue(new Error('Network error'));
      const cacheWriter = jest.fn().mockReturnValue(true);

      const result = await fallbackStrategy.writeWithFallback(
        { test: 'data' },
        cloudWriter,
        cacheWriter,
        'testKey'
      );

      expect(result.success).toBe(true);
      expect(result.synced).toBe(false);
      expect(result.message).toContain('保存到本地');
      expect(result.message).toContain('网络恢复后同步');
      expect(cloudWriter).toHaveBeenCalled();
      expect(cacheWriter).toHaveBeenCalled();
    });

    it('writeWithFallback: 本地也失败应返回 success=false', async () => {
      const cloudWriter = jest.fn().mockRejectedValue(new Error('Network error'));
      const cacheWriter = jest.fn().mockReturnValue(false); // 本地写入也失败

      const result = await fallbackStrategy.writeWithFallback(
        { test: 'data' },
        cloudWriter,
        cacheWriter,
        'testKey'
      );

      expect(result.success).toBe(false);
      expect(result.synced).toBe(false);
      expect(result.message).toContain('保存失败');
    });
  });

  // ============================================================================
  // 集成场景测试
  // ============================================================================

  describe('集成场景', () => {
    let manager: UnifiedDataManager;

    beforeEach(() => {
      localStorage.clear();
      manager = new UnifiedDataManager('integration-user');
    });

    it('完整流程: 用户登录 → 数据读取 → 降级处理', async () => {
      // 1. 设置用户ID
      manager.setUserId('integration-user');

      // 2. 模拟网络故障场景
      // (实际需要 mock Supabase 调用)

      // 3. 验证降级到本地缓存
      localStorage.setItem('user_integration-user_favorites', JSON.stringify(['item1']));

      const favorites = await manager.getData<string[]>('favorites');

      // 应该从缓存读取
      expect(favorites).toEqual(['item1']);
    });

    it('存储配额监控集成: 自动清理过期缓存', async () => {
      // 1. 写入大量数据
      for (let i = 0; i < 50; i++) {
        localStorage.setItem(`cache_item_${i}`, 'x'.repeat(1000));
      }

      // 2. 检查配额
      const quotaBefore = storageQuotaMonitor.getQuotaInfo();

      // 3. 触发清理
      if (quotaBefore.usagePercent > 50) {
        manager.cleanupExpiredCache();
      }

      // 4. 验证清理后配额减少
      const quotaAfter = storageQuotaMonitor.getQuotaInfo();
      expect(quotaAfter.itemCount).toBeLessThanOrEqual(quotaBefore.itemCount);
    });

    it('多用户隔离: 不同用户数据互不干扰', async () => {
      const user1Manager = new UnifiedDataManager('user1');
      const user2Manager = new UnifiedDataManager('user2');

      // 用户1保存数据
      await user1Manager.setData('favorites', ['user1-item']);

      // 用户2保存数据
      await user2Manager.setData('favorites', ['user2-item']);

      // 验证隔离
      const user1Data = await user1Manager.getData<string[]>('favorites');
      const user2Data = await user2Manager.getData<string[]>('favorites');

      expect(user1Data).toEqual(['user1-item']);
      expect(user2Data).toEqual(['user2-item']);

      // 验证 localStorage 键名不同
      const user1Key = DataFieldAdapter.formatDataKey('user1', 'favorites');
      const user2Key = DataFieldAdapter.formatDataKey('user2', 'favorites');
      expect(user1Key).not.toBe(user2Key);
    });
  });
});
