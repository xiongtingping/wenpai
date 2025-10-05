/**
 * 🧪 存储迁移测试
 * 
 * 测试存储迁移功能的正确性和健壮性
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { migrateAuthStoreToUnified, cleanupLegacyAuthStore } from '../storageMigration';
import { AuthStatus } from '@/stores/unified-state-store';

describe('存储迁移测试', () => {
  // 保存原始localStorage
  let originalLocalStorage: Storage;

  beforeEach(() => {
    // 备份原始localStorage
    originalLocalStorage = global.localStorage;
    
    // 创建模拟localStorage
    const mockStorage: { [key: string]: string } = {};
    global.localStorage = {
      getItem: (key: string) => mockStorage[key] || null,
      setItem: (key: string, value: string) => { mockStorage[key] = value; },
      removeItem: (key: string) => { delete mockStorage[key]; },
      clear: () => { Object.keys(mockStorage).forEach(key => delete mockStorage[key]); },
      key: (index: number) => Object.keys(mockStorage)[index] || null,
      length: Object.keys(mockStorage).length
    } as Storage;
  });

  afterEach(() => {
    // 恢复原始localStorage
    global.localStorage = originalLocalStorage;
  });

  describe('基本迁移功能', () => {
    it('应该成功迁移完整的用户数据', async () => {
      // 准备旧版数据
      const legacyData = {
        state: {
          user: {
            id: 'test-user-123',
            username: 'testuser',
            email: 'test@example.com',
            subscription: { tier: 'pro' }
          },
          isAuthenticated: true,
          authStatus: 'authenticated',
          loading: false,
          error: null,
          sessionWarning: false,
          sessionRemainingTime: 3600,
          sessionExpiresAt: Date.now() + 3600000,
          lastUpdated: new Date().toISOString(),
          version: '1.0.0'
        },
        version: 1
      };

      localStorage.setItem('wenpai-auth-store-v2', JSON.stringify(legacyData));

      // 执行迁移
      const result = await migrateAuthStoreToUnified();

      // 验证结果
      expect(result.success).toBe(true);
      expect(result.message).toContain('迁移成功');

      // 验证unified-store数据
      const unifiedData = JSON.parse(localStorage.getItem('wenpai-unified-store') || '{}');
      expect(unifiedData.state.user.id).toBe('test-user-123');
      expect(unifiedData.state.user.authStatus).toBe(AuthStatus.AUTHENTICATED);
      expect(unifiedData.state.session.sessionRemainingTime).toBe(3600);
    });

    it('应该正确转换AuthStatus枚举', async () => {
      const testCases = [
        { input: 'authenticated', expected: AuthStatus.AUTHENTICATED },
        { input: 'authenticating', expected: AuthStatus.AUTHENTICATING },
        { input: 'error', expected: AuthStatus.ERROR },
        { input: 'unauthenticated', expected: AuthStatus.UNAUTHENTICATED },
        { input: undefined, expected: AuthStatus.UNAUTHENTICATED }
      ];

      for (const testCase of testCases) {
        localStorage.clear();
        
        const legacyData = {
          state: {
            user: { id: 'test' },
            isAuthenticated: testCase.input === 'authenticated',
            authStatus: testCase.input
          },
          version: 1
        };

        localStorage.setItem('wenpai-auth-store-v2', JSON.stringify(legacyData));

        await migrateAuthStoreToUnified();

        const unifiedData = JSON.parse(localStorage.getItem('wenpai-unified-store') || '{}');
        expect(unifiedData.state.user.authStatus).toBe(testCase.expected);
      }
    });

    it('应该正确迁移会话状态', async () => {
      const legacyData = {
        state: {
          user: { id: 'test' },
          isAuthenticated: true,
          sessionWarning: true,
          sessionRemainingTime: 1800,
          sessionExpiresAt: 1234567890
        },
        version: 1
      };

      localStorage.setItem('wenpai-auth-store-v2', JSON.stringify(legacyData));

      await migrateAuthStoreToUnified();

      const unifiedData = JSON.parse(localStorage.getItem('wenpai-unified-store') || '{}');
      expect(unifiedData.state.session.sessionWarning).toBe(true);
      expect(unifiedData.state.session.sessionRemainingTime).toBe(1800);
      expect(unifiedData.state.session.sessionExpiresAt).toBe(1234567890);
    });
  });

  describe('边界情况处理', () => {
    it('当没有旧版数据时应该跳过迁移', async () => {
      const result = await migrateAuthStoreToUnified();

      expect(result.success).toBe(true);
      expect(result.message).toContain('无需迁移');
    });

    it('当unified-store已有数据时应该跳过迁移', async () => {
      // 设置旧版数据
      localStorage.setItem('wenpai-auth-store-v2', JSON.stringify({
        state: { user: { id: 'old-user' }, isAuthenticated: true },
        version: 1
      }));

      // 设置unified-store已有数据
      localStorage.setItem('wenpai-unified-store', JSON.stringify({
        state: { user: { id: 'existing-user' } },
        version: 2
      }));

      const result = await migrateAuthStoreToUnified();

      expect(result.success).toBe(true);
      expect(result.message).toContain('无需迁移');

      // 验证unified-store数据未被覆盖
      const unifiedData = JSON.parse(localStorage.getItem('wenpai-unified-store') || '{}');
      expect(unifiedData.state.user.id).toBe('existing-user');
    });

    it('应该处理空用户数据', async () => {
      const legacyData = {
        state: {
          user: null,
          isAuthenticated: false
        },
        version: 1
      };

      localStorage.setItem('wenpai-auth-store-v2', JSON.stringify(legacyData));

      const result = await migrateAuthStoreToUnified();

      expect(result.success).toBe(true);

      const unifiedData = JSON.parse(localStorage.getItem('wenpai-unified-store') || '{}');
      expect(unifiedData.state.user).toBeNull();
    });
  });

  describe('备份和回滚', () => {
    it('应该自动备份旧数据', async () => {
      const legacyData = {
        state: {
          user: { id: 'test-user' },
          isAuthenticated: true
        },
        version: 1
      };

      localStorage.setItem('wenpai-auth-store-v2', JSON.stringify(legacyData));

      await migrateAuthStoreToUnified();

      // 检查是否创建了备份
      const allKeys = Object.keys(localStorage);
      const backupKeys = allKeys.filter(key => key.startsWith('wenpai-auth-store-v2-backup-'));
      
      expect(backupKeys.length).toBeGreaterThan(0);

      // 验证备份数据
      const backupData = JSON.parse(localStorage.getItem(backupKeys[0]) || '{}');
      expect(backupData.state.user.id).toBe('test-user');
    });
  });

  describe('数据验证', () => {
    it('应该验证用户ID一致性', async () => {
      const legacyData = {
        state: {
          user: { id: 'test-user-123' },
          isAuthenticated: true
        },
        version: 1
      };

      localStorage.setItem('wenpai-auth-store-v2', JSON.stringify(legacyData));

      const result = await migrateAuthStoreToUnified();

      expect(result.success).toBe(true);

      const unifiedData = JSON.parse(localStorage.getItem('wenpai-unified-store') || '{}');
      expect(unifiedData.state.user.id).toBe('test-user-123');
    });

    it('应该验证会话状态一致性', async () => {
      const legacyData = {
        state: {
          user: { id: 'test' },
          isAuthenticated: true,
          sessionWarning: true,
          sessionRemainingTime: 1800
        },
        version: 1
      };

      localStorage.setItem('wenpai-auth-store-v2', JSON.stringify(legacyData));

      const result = await migrateAuthStoreToUnified();

      expect(result.success).toBe(true);

      const unifiedData = JSON.parse(localStorage.getItem('wenpai-unified-store') || '{}');
      expect(unifiedData.state.session.sessionWarning).toBe(true);
      expect(unifiedData.state.session.sessionRemainingTime).toBe(1800);
    });
  });

  describe('清理功能', () => {
    it('应该能够清理旧版数据', () => {
      localStorage.setItem('wenpai-auth-store-v2', JSON.stringify({ test: 'data' }));

      cleanupLegacyAuthStore();

      expect(localStorage.getItem('wenpai-auth-store-v2')).toBeNull();
    });
  });
});

