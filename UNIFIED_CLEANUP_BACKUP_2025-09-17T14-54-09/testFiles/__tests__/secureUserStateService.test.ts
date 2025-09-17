/**
 * 安全用户状态管理服务测试用例
 * 🔒 安全修复：测试安全用户状态存储和管理功能
 * 
 * 测试覆盖：
 * 1. 用户状态的安全存储和读取
 * 2. 数据加密和校验和验证
 * 3. 状态过期和验证机制
 * 4. 定时器和监控功能
 * 5. 迁移和兼容性功能
 */

import { SecureUserStateService } from '../secureUserStateService';
import { SessionUserInfo } from '../unifiedPermissionService';
import { SecureEncryption } from '../encryptionService';

// Mock SecureEncryption
jest.mock('../encryptionService', () => ({
  SecureEncryption: {
    encrypt: jest.fn(),
    decrypt: jest.fn(),
    generateChecksum: jest.fn(),
    verifyChecksum: jest.fn(),
  }
}));

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    })
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

// Mock console methods
const consoleSpy = {
  log: jest.spyOn(console, 'log').mockImplementation(),
  error: jest.spyOn(console, 'error').mockImplementation(),
  warn: jest.spyOn(console, 'warn').mockImplementation(),
};

describe('SecureUserStateService 安全用户状态管理测试', () => {
  const mockUser: SessionUserInfo = {
    id: 'test-user-123',
    username: 'testuser',
    email: 'test@example.com',
    phone: '13800138000',
    nickname: '测试用户',
    avatar: 'https://example.com/avatar.jpg',
    loginTime: '2024-01-01T00:00:00.000Z',
    roles: ['user'],
    permissions: ['basic'],
    subscription_tier: 'pro',
    is_vip: false
  };

  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.clear();
    consoleSpy.log.mockClear();
    consoleSpy.error.mockClear();
    consoleSpy.warn.mockClear();
    
    // 重置定时器
    jest.clearAllTimers();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('🔐 用户状态存储功能', () => {
    it('应该成功存储用户状态', async () => {
      const mockEncryptedData = 'encrypted-user-data';
      const mockChecksum = 'test-checksum';

      (SecureEncryption.encrypt as jest.Mock).mockResolvedValue(mockEncryptedData);
      (SecureEncryption.generateChecksum as jest.Mock).mockResolvedValue(mockChecksum);

      const result = await SecureUserStateService.storeUserState(mockUser);

      expect(result).toBe(true);
      expect(SecureEncryption.encrypt).toHaveBeenCalledWith(JSON.stringify(mockUser));
      expect(SecureEncryption.generateChecksum).toHaveBeenCalledWith(JSON.stringify(mockUser));
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        '_secure_user_state',
        expect.stringContaining(mockEncryptedData)
      );
    });

    it('应该拒绝无效的用户数据', async () => {
      const invalidUser = null as any;
      
      const result = await SecureUserStateService.storeUserState(invalidUser);
      
      expect(result).toBe(false);
      expect(consoleSpy.warn).toHaveBeenCalledWith('⚠️ 无效的用户数据，跳过存储');
    });

    it('应该在加密失败时使用开发环境备用存储', async () => {
      (SecureEncryption.encrypt as jest.Mock).mockRejectedValue(new Error('Encryption failed'));
      
      // Mock 开发环境
      const originalEnv = process.env.NODE_ENV;
      Object.defineProperty(import.meta, 'env', {
        value: { DEV: true },
        writable: true
      });

      const result = await SecureUserStateService.storeUserState(mockUser);

      expect(result).toBe(true);
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'authing_user',
        JSON.stringify(mockUser)
      );

      // 恢复环境
      process.env.NODE_ENV = originalEnv;
    });

    it('应该在生产环境加密失败时返回false', async () => {
      (SecureEncryption.encrypt as jest.Mock).mockRejectedValue(new Error('Encryption failed'));
      
      // Mock 生产环境
      Object.defineProperty(import.meta, 'env', {
        value: { DEV: false },
        writable: true
      });

      const result = await SecureUserStateService.storeUserState(mockUser);

      expect(result).toBe(false);
      expect(consoleSpy.error).toHaveBeenCalledWith('❌ 安全存储用户状态失败:', expect.any(Error));
    });
  });

  describe('🔓 用户状态读取功能', () => {
    it('应该成功读取已存储的用户状态', async () => {
      const mockEncryptedData = 'encrypted-user-data';
      const mockChecksum = 'test-checksum';
      const mockStoredState = {
        encryptedData: mockEncryptedData,
        checksum: mockChecksum,
        timestamp: Date.now(),
        expiresAt: Date.now() + 24 * 60 * 60 * 1000
      };

      localStorageMock.setItem('_secure_user_state', JSON.stringify(mockStoredState));
      (SecureEncryption.decrypt as jest.Mock).mockResolvedValue(JSON.stringify(mockUser));
      (SecureEncryption.verifyChecksum as jest.Mock).mockResolvedValue(true);

      const result = await SecureUserStateService.getUserState();

      expect(result).toEqual(mockUser);
      expect(SecureEncryption.decrypt).toHaveBeenCalledWith(mockEncryptedData);
      expect(SecureEncryption.verifyChecksum).toHaveBeenCalledWith(
        JSON.stringify(mockUser),
        mockChecksum
      );
    });

    it('应该在状态过期时返回null', async () => {
      const expiredState = {
        encryptedData: 'encrypted-data',
        checksum: 'checksum',
        timestamp: Date.now() - 25 * 60 * 60 * 1000, // 25小时前
        expiresAt: Date.now() - 1000 // 1秒前过期
      };

      localStorageMock.setItem('_secure_user_state', JSON.stringify(expiredState));

      const result = await SecureUserStateService.getUserState();

      expect(result).toBeNull();
      expect(consoleSpy.warn).toHaveBeenCalledWith(
        '⚠️ 用户状态验证失败:',
        '用户状态已过期'
      );
    });

    it('应该在校验和验证失败时返回null', async () => {
      const mockEncryptedData = 'encrypted-user-data';
      const mockChecksum = 'wrong-checksum';
      const mockStoredState = {
        encryptedData: mockEncryptedData,
        checksum: mockChecksum,
        timestamp: Date.now(),
        expiresAt: Date.now() + 24 * 60 * 60 * 1000
      };

      localStorageMock.setItem('_secure_user_state', JSON.stringify(mockStoredState));
      (SecureEncryption.decrypt as jest.Mock).mockResolvedValue(JSON.stringify(mockUser));
      (SecureEncryption.verifyChecksum as jest.Mock).mockResolvedValue(false);

      const result = await SecureUserStateService.getUserState();

      expect(result).toBeNull();
      expect(consoleSpy.error).toHaveBeenCalledWith(
        '❌ 用户状态校验和验证失败，数据可能被篡改'
      );
    });

    it('应该在解密失败时返回null', async () => {
      const mockStoredState = {
        encryptedData: 'invalid-encrypted-data',
        checksum: 'checksum',
        timestamp: Date.now(),
        expiresAt: Date.now() + 24 * 60 * 60 * 1000
      };

      localStorageMock.setItem('_secure_user_state', JSON.stringify(mockStoredState));
      (SecureEncryption.decrypt as jest.Mock).mockRejectedValue(new Error('Decryption failed'));

      const result = await SecureUserStateService.getUserState();

      expect(result).toBeNull();
      expect(consoleSpy.error).toHaveBeenCalledWith(
        '❌ 安全读取用户状态失败:',
        expect.any(Error)
      );
    });
  });

  describe('🔄 传统存储迁移功能', () => {
    it('应该从传统存储迁移用户状态', async () => {
      // 设置传统存储
      localStorageMock.setItem('authing_user', JSON.stringify(mockUser));
      
      // Mock 成功的存储操作
      (SecureEncryption.encrypt as jest.Mock).mockResolvedValue('encrypted-data');
      (SecureEncryption.generateChecksum as jest.Mock).mockResolvedValue('checksum');

      const result = await SecureUserStateService.getUserState();

      expect(result).toEqual(mockUser);
      expect(consoleSpy.log).toHaveBeenCalledWith(
        '📦 从传统存储获取用户状态:',
        { userId: mockUser.id }
      );
      expect(consoleSpy.log).toHaveBeenCalledWith('✅ 用户状态已迁移到安全存储');
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('authing_user');
    });

    it('应该在迁移失败时仍返回用户数据', async () => {
      localStorageMock.setItem('authing_user', JSON.stringify(mockUser));
      
      // Mock 迁移失败
      (SecureEncryption.encrypt as jest.Mock).mockRejectedValue(new Error('Migration failed'));

      const result = await SecureUserStateService.getUserState();

      expect(result).toEqual(mockUser);
      expect(consoleSpy.warn).toHaveBeenCalledWith(
        '⚠️ 用户状态迁移失败:',
        expect.any(Error)
      );
      // 应该不删除传统存储
      expect(localStorageMock.removeItem).not.toHaveBeenCalledWith('authing_user');
    });
  });

  describe('✏️ 用户状态更新功能', () => {
    it('应该成功更新用户状态', async () => {
      // 首先设置现有状态
      const mockEncryptedData = 'encrypted-user-data';
      const mockChecksum = 'test-checksum';
      const mockStoredState = {
        encryptedData: mockEncryptedData,
        checksum: mockChecksum,
        timestamp: Date.now(),
        expiresAt: Date.now() + 24 * 60 * 60 * 1000
      };

      localStorageMock.setItem('_secure_user_state', JSON.stringify(mockStoredState));
      (SecureEncryption.decrypt as jest.Mock).mockResolvedValue(JSON.stringify(mockUser));
      (SecureEncryption.verifyChecksum as jest.Mock).mockResolvedValue(true);

      // Mock 更新操作
      const updates = { nickname: '新昵称' };
      const updatedUser = { ...mockUser, ...updates };
      (SecureEncryption.encrypt as jest.Mock).mockResolvedValue('new-encrypted-data');
      (SecureEncryption.generateChecksum as jest.Mock).mockResolvedValue('new-checksum');

      const result = await SecureUserStateService.updateUserState(updates);

      expect(result).toBe(true);
      expect(SecureEncryption.encrypt).toHaveBeenCalledWith(JSON.stringify(updatedUser));
    });

    it('应该在无当前状态时返回false', async () => {
      const result = await SecureUserStateService.updateUserState({ nickname: '新昵称' });

      expect(result).toBe(false);
      expect(consoleSpy.warn).toHaveBeenCalledWith('⚠️ 当前无用户状态，无法更新');
    });
  });

  describe('🧹 状态清除功能', () => {
    it('应该清除所有相关存储', () => {
      // 设置一些状态
      localStorageMock.setItem('_secure_user_state', 'test');
      localStorageMock.setItem('authing_user', 'test');
      localStorageMock.setItem('_authing_user', 'test');
      localStorageMock.setItem('_authing_token', 'test');

      SecureUserStateService.clearUserState();

      expect(localStorageMock.removeItem).toHaveBeenCalledWith('_secure_user_state');
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('authing_user');
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('_authing_user');
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('_authing_token');
      expect(consoleSpy.log).toHaveBeenCalledWith('🧹 用户状态已清除');
    });

    it('应该在清除失败时记录错误', () => {
      // Mock localStorage 抛出错误
      localStorageMock.removeItem.mockImplementationOnce(() => {
        throw new Error('Storage error');
      });

      SecureUserStateService.clearUserState();

      expect(consoleSpy.error).toHaveBeenCalledWith(
        '❌ 清除用户状态失败:',
        expect.any(Error)
      );
    });
  });

  describe('🔍 状态检查功能', () => {
    it('应该正确检测用户状态是否存在', () => {
      // 测试安全存储存在
      localStorageMock.setItem('_secure_user_state', 'test');
      expect(SecureUserStateService.hasUserState()).toBe(true);

      localStorageMock.clear();

      // 测试传统存储存在
      localStorageMock.setItem('authing_user', 'test');
      expect(SecureUserStateService.hasUserState()).toBe(true);

      localStorageMock.clear();

      // 测试都不存在
      expect(SecureUserStateService.hasUserState()).toBe(false);
    });
  });

  describe('🔄 状态刷新功能', () => {
    it('应该成功刷新用户状态', async () => {
      // 首先设置现有状态
      const mockEncryptedData = 'encrypted-user-data';
      const mockChecksum = 'test-checksum';
      const mockStoredState = {
        encryptedData: mockEncryptedData,
        checksum: mockChecksum,
        timestamp: Date.now(),
        expiresAt: Date.now() + 24 * 60 * 60 * 1000
      };

      localStorageMock.setItem('_secure_user_state', JSON.stringify(mockStoredState));
      (SecureEncryption.decrypt as jest.Mock).mockResolvedValue(JSON.stringify(mockUser));
      (SecureEncryption.verifyChecksum as jest.Mock).mockResolvedValue(true);

      // Mock 刷新操作
      (SecureEncryption.encrypt as jest.Mock).mockResolvedValue('refreshed-encrypted-data');
      (SecureEncryption.generateChecksum as jest.Mock).mockResolvedValue('refreshed-checksum');

      const result = await SecureUserStateService.refreshUserState();

      expect(result).toBe(true);
      expect(consoleSpy.log).toHaveBeenCalledWith(
        '🔄 刷新用户状态:',
        { userId: mockUser.id }
      );
    });

    it('应该在无当前状态时返回false', async () => {
      const result = await SecureUserStateService.refreshUserState();

      expect(result).toBe(false);
      expect(consoleSpy.warn).toHaveBeenCalledWith('⚠️ 无当前用户状态，无法刷新');
    });
  });

  describe('📊 状态统计功能', () => {
    it('应该返回正确的状态统计信息', () => {
      const mockState = {
        encryptedData: 'test',
        checksum: 'test',
        timestamp: Date.now(),
        expiresAt: Date.now() + 1000 // 1秒后过期
      };

      localStorageMock.setItem('_secure_user_state', JSON.stringify(mockState));

      const stats = SecureUserStateService.getStateStats();

      expect(stats.hasState).toBe(true);
      expect(stats.isExpired).toBe(false);
      expect(stats.timeLeft).toBeGreaterThan(0);
      expect(stats.timeLeft).toBeLessThanOrEqual(1000);
    });

    it('应该正确识别过期状态', () => {
      const expiredState = {
        encryptedData: 'test',
        checksum: 'test',
        timestamp: Date.now() - 1000,
        expiresAt: Date.now() - 500 // 500ms前过期
      };

      localStorageMock.setItem('_secure_user_state', JSON.stringify(expiredState));

      const stats = SecureUserStateService.getStateStats();

      expect(stats.hasState).toBe(true);
      expect(stats.isExpired).toBe(true);
      expect(stats.timeLeft).toBe(0);
    });

    it('应该在无状态时返回默认值', () => {
      const stats = SecureUserStateService.getStateStats();

      expect(stats.hasState).toBe(false);
      expect(stats.isExpired).toBe(true);
      expect(stats.timeLeft).toBe(0);
    });
  });

  describe('⏰ 定时验证功能', () => {
    it('应该启动状态验证定时器', async () => {
      // Mock成功的存储操作
      (SecureEncryption.encrypt as jest.Mock).mockResolvedValue('encrypted-data');
      (SecureEncryption.generateChecksum as jest.Mock).mockResolvedValue('checksum');

      await SecureUserStateService.storeUserState(mockUser);

      expect(consoleSpy.log).toHaveBeenCalledWith('🕐 用户状态验证定时器已启动');

      // 快进时间，触发定时验证
      jest.advanceTimersByTime(6 * 60 * 1000); // 6分钟

      // 验证定时器被调用
      expect(setTimeout).toHaveBeenCalled();
    });

    it('应该在用户状态失效时停止定时器', async () => {
      // 首先启动定时器
      (SecureEncryption.encrypt as jest.Mock).mockResolvedValue('encrypted-data');
      (SecureEncryption.generateChecksum as jest.Mock).mockResolvedValue('checksum');
      await SecureUserStateService.storeUserState(mockUser);

      // 清除状态
      SecureUserStateService.clearUserState();

      expect(consoleSpy.log).toHaveBeenCalledWith('🛑 用户状态验证定时器已停止');
    });
  });

  describe('🚨 错误处理', () => {
    it('应该优雅处理JSON解析错误', async () => {
      localStorageMock.setItem('_secure_user_state', 'invalid-json');

      const result = await SecureUserStateService.getUserState();

      expect(result).toBeNull();
      expect(consoleSpy.error).toHaveBeenCalled();
    });

    it('应该处理加密服务不可用的情况', async () => {
      (SecureEncryption.encrypt as jest.Mock).mockImplementation(() => {
        throw new Error('Encryption service unavailable');
      });

      const result = await SecureUserStateService.storeUserState(mockUser);

      expect(result).toBe(false);
      expect(consoleSpy.error).toHaveBeenCalledWith(
        '❌ 安全存储用户状态失败:',
        expect.any(Error)
      );
    });
  });

  describe('🔒 安全性测试', () => {
    it('应该防止状态数据篡改', async () => {
      const tamperedState = {
        encryptedData: 'tampered-data',
        checksum: 'original-checksum',
        timestamp: Date.now(),
        expiresAt: Date.now() + 24 * 60 * 60 * 1000
      };

      localStorageMock.setItem('_secure_user_state', JSON.stringify(tamperedState));
      (SecureEncryption.decrypt as jest.Mock).mockResolvedValue(JSON.stringify({
        ...mockUser,
        roles: ['admin'] // 篡改的数据
      }));
      (SecureEncryption.verifyChecksum as jest.Mock).mockResolvedValue(false); // 校验和不匹配

      const result = await SecureUserStateService.getUserState();

      expect(result).toBeNull();
      expect(consoleSpy.error).toHaveBeenCalledWith(
        '❌ 用户状态校验和验证失败，数据可能被篡改'
      );
    });

    it('应该验证状态时间戳的合理性', async () => {
      const futureState = {
        encryptedData: 'encrypted-data',
        checksum: 'checksum',
        timestamp: Date.now() + 10000, // 未来时间
        expiresAt: Date.now() + 24 * 60 * 60 * 1000
      };

      localStorageMock.setItem('_secure_user_state', JSON.stringify(futureState));

      const result = await SecureUserStateService.getUserState();

      expect(result).toBeNull();
      expect(consoleSpy.warn).toHaveBeenCalledWith(
        '⚠️ 用户状态验证失败:',
        '用户状态时间戳异常'
      );
    });
  });
});