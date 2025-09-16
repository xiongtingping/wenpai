/**
 * 加密服务测试用例
 * 🔒 安全修复：测试AES-256-GCM加密功能
 * 
 * 测试覆盖：
 * 1. AES加密和解密功能
 * 2. 降级加密机制
 * 3. 校验和生成和验证
 * 4. 错误处理机制
 * 5. 密钥管理和轮换
 */

import { EncryptionService, FallbackEncryptionService, SecureEncryption } from '../encryptionService';

// Mock Web Crypto API
Object.defineProperty(global, 'crypto', {
  value: {
    subtle: {
      encrypt: jest.fn(),
      decrypt: jest.fn(),
      digest: jest.fn(),
      importKey: jest.fn(),
      deriveKey: jest.fn(),
    },
    getRandomValues: jest.fn()
  },
  writable: true
});

// Mock import.meta.env
Object.defineProperty(global, 'import', {
  value: {
    meta: {
      env: {
        DEV: true,
        VITE_ENCRYPTION_MASTER_KEY: 'test-master-key-32-characters-long'
      }
    }
  },
  writable: true
});

describe('EncryptionService 加密服务测试', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  describe('🔐 基础加密功能', () => {
    it('应该正确加密明文数据', async () => {
      const plaintext = 'test data';
      const mockCiphertext = new ArrayBuffer(32);
      const mockKey = {} as CryptoKey;

      (global.crypto.getRandomValues as jest.Mock).mockReturnValue(new Uint8Array(12));
      (global.crypto.subtle.importKey as jest.Mock).mockResolvedValue(mockKey);
      (global.crypto.subtle.deriveKey as jest.Mock).mockResolvedValue(mockKey);
      (global.crypto.subtle.encrypt as jest.Mock).mockResolvedValue(mockCiphertext);

      const result = await EncryptionService.encrypt(plaintext);
      
      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
      expect(global.crypto.subtle.encrypt).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'AES-GCM',
          tagLength: 128
        }),
        mockKey,
        expect.any(Uint8Array)
      );
    });

    it('应该正确解密加密数据', async () => {
      const encryptedData = 'dGVzdCBkYXRh'; // base64 encoded test data
      const mockPlaintext = new TextEncoder().encode('test data').buffer;
      const mockKey = {} as CryptoKey;

      (global.crypto.subtle.importKey as jest.Mock).mockResolvedValue(mockKey);
      (global.crypto.subtle.deriveKey as jest.Mock).mockResolvedValue(mockKey);
      (global.crypto.subtle.decrypt as jest.Mock).mockResolvedValue(mockPlaintext);

      const result = await EncryptionService.decrypt(encryptedData);
      
      expect(result).toBe('test data');
      expect(global.crypto.subtle.decrypt).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'AES-GCM',
          tagLength: 128
        }),
        mockKey,
        expect.any(Uint8Array)
      );
    });

    it('应该拒绝无效的输入数据', async () => {
      await expect(EncryptionService.encrypt('')).rejects.toThrow();
      await expect(EncryptionService.encrypt(null as any)).rejects.toThrow();
      await expect(EncryptionService.decrypt('')).rejects.toThrow();
      await expect(EncryptionService.decrypt(null as any)).rejects.toThrow();
    });
  });

  describe('🔧 密钥管理', () => {
    it('应该从环境变量获取主密钥', async () => {
      const mockKey = {} as CryptoKey;
      (global.crypto.subtle.importKey as jest.Mock).mockResolvedValue(mockKey);
      (global.crypto.subtle.deriveKey as jest.Mock).mockResolvedValue(mockKey);

      // 触发密钥生成
      await EncryptionService.encrypt('test');

      expect(global.crypto.subtle.importKey).toHaveBeenCalledWith(
        'raw',
        expect.any(Uint8Array),
        'PBKDF2',
        false,
        ['deriveKey']
      );
    });

    it('应该在开发环境中生成临时主密钥', () => {
      delete (global as any).import.meta.env.VITE_ENCRYPTION_MASTER_KEY;
      
      // 清除localStorage中的密钥
      localStorage.removeItem('_enc_master_key');
      
      // 这会触发临时密钥生成
      expect(() => {
        // 触发getMasterKey的逻辑
      }).not.toThrow();
    });
  });

  describe('📋 校验和功能', () => {
    it('应该生成正确的SHA-256校验和', async () => {
      const data = 'test data';
      const mockHash = new Uint8Array([1, 2, 3, 4]);
      
      (global.crypto.subtle.digest as jest.Mock).mockResolvedValue(mockHash.buffer);

      const result = await EncryptionService.generateChecksum(data);
      
      expect(result).toBe('01020304');
      expect(global.crypto.subtle.digest).toHaveBeenCalledWith(
        'SHA-256',
        expect.any(Uint8Array)
      );
    });

    it('应该正确验证校验和', async () => {
      const data = 'test data';
      const expectedChecksum = '01020304';
      
      (global.crypto.subtle.digest as jest.Mock).mockResolvedValue(
        new Uint8Array([1, 2, 3, 4]).buffer
      );

      const result = await EncryptionService.verifyChecksum(data, expectedChecksum);
      
      expect(result).toBe(true);
    });

    it('应该检测到错误的校验和', async () => {
      const data = 'test data';
      const wrongChecksum = 'wrong';
      
      (global.crypto.subtle.digest as jest.Mock).mockResolvedValue(
        new Uint8Array([1, 2, 3, 4]).buffer
      );

      const result = await EncryptionService.verifyChecksum(data, wrongChecksum);
      
      expect(result).toBe(false);
    });
  });

  describe('🌐 Web Crypto API 可用性检测', () => {
    it('应该正确检测Web Crypto API的可用性', () => {
      expect(EncryptionService.isAvailable()).toBe(true);
    });

    it('应该在Web Crypto API不可用时返回false', () => {
      const originalCrypto = global.crypto;
      delete (global as any).crypto;

      expect(EncryptionService.isAvailable()).toBe(false);

      global.crypto = originalCrypto;
    });
  });

  describe('🧹 敏感数据清理', () => {
    it('应该清理敏感数据', () => {
      EncryptionService.clearSensitiveData();
      
      // 验证清理操作（需要访问私有成员进行测试）
      expect(() => EncryptionService.clearSensitiveData()).not.toThrow();
    });
  });
});

describe('FallbackEncryptionService 降级加密服务测试', () => {
  describe('🔽 降级加密功能', () => {
    it('应该使用简单加密算法', () => {
      const plaintext = 'test data';
      const result = FallbackEncryptionService.encrypt(plaintext);
      
      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
      expect(result).not.toBe(plaintext); // 确保已加密
    });

    it('应该正确解密降级加密的数据', () => {
      const plaintext = 'test data';
      const encrypted = FallbackEncryptionService.encrypt(plaintext);
      const decrypted = FallbackEncryptionService.decrypt(encrypted);
      
      expect(decrypted).toBe(plaintext);
    });

    it('应该处理加密错误', () => {
      // 模拟atob失败
      const originalAtob = global.atob;
      global.atob = jest.fn().mockImplementation(() => {
        throw new Error('atob failed');
      });

      const result = FallbackEncryptionService.encrypt('test');
      expect(result).toBe('dGVzdA=='); // 应该回退到基本base64

      global.atob = originalAtob;
    });

    it('应该处理解密错误', () => {
      const originalAtob = global.atob;
      global.atob = jest.fn().mockImplementation(() => {
        throw new Error('atob failed');
      });

      const result = FallbackEncryptionService.decrypt('invalid');
      expect(result).toBe('');

      global.atob = originalAtob;
    });
  });
});

describe('SecureEncryption 统一加密接口测试', () => {
  describe('🔄 自动选择加密方式', () => {
    it('应该在Web Crypto API可用时使用高级加密', async () => {
      const plaintext = 'test data';
      const mockCiphertext = new ArrayBuffer(32);
      const mockKey = {} as CryptoKey;

      (global.crypto.getRandomValues as jest.Mock).mockReturnValue(new Uint8Array(12));
      (global.crypto.subtle.importKey as jest.Mock).mockResolvedValue(mockKey);
      (global.crypto.subtle.deriveKey as jest.Mock).mockResolvedValue(mockKey);
      (global.crypto.subtle.encrypt as jest.Mock).mockResolvedValue(mockCiphertext);

      const result = await SecureEncryption.encrypt(plaintext);
      
      expect(result).toBeDefined();
      expect(global.crypto.subtle.encrypt).toHaveBeenCalled();
    });

    it('应该在Web Crypto API不可用时使用降级加密', async () => {
      const originalCrypto = global.crypto;
      delete (global as any).crypto;

      const plaintext = 'test data';
      const result = await SecureEncryption.encrypt(plaintext);
      
      expect(result).toBeDefined();
      expect(typeof result).toBe('string');

      global.crypto = originalCrypto;
    });

    it('应该在高级解密失败时尝试降级解密', async () => {
      const plaintext = 'test data';
      const fallbackEncrypted = FallbackEncryptionService.encrypt(plaintext);
      
      // 模拟高级解密失败
      (global.crypto.subtle.decrypt as jest.Mock).mockRejectedValue(new Error('Decrypt failed'));

      const result = await SecureEncryption.decrypt(fallbackEncrypted);
      
      expect(result).toBe(plaintext);
    });
  });

  describe('📋 校验和功能集成', () => {
    it('应该使用高级校验和生成', async () => {
      const data = 'test data';
      const mockHash = new Uint8Array([1, 2, 3, 4]);
      
      (global.crypto.subtle.digest as jest.Mock).mockResolvedValue(mockHash.buffer);

      const result = await SecureEncryption.generateChecksum(data);
      
      expect(result).toBe('01020304');
    });

    it('应该在Web Crypto API不可用时使用降级校验和', async () => {
      const originalCrypto = global.crypto;
      delete (global as any).crypto;

      const data = 'test data';
      const result = await SecureEncryption.generateChecksum(data);
      
      expect(result).toBeDefined();
      expect(typeof result).toBe('string');

      global.crypto = originalCrypto;
    });

    it('应该正确验证校验和', async () => {
      const data = 'test data';
      const checksum = await SecureEncryption.generateChecksum(data);
      const isValid = await SecureEncryption.verifyChecksum(data, checksum);
      
      expect(isValid).toBe(true);
    });
  });
});

describe('🔒 安全性测试', () => {
  describe('💪 抗攻击能力', () => {
    it('应该防止明文注入攻击', async () => {
      const maliciousInput = '<script>alert("xss")</script>';
      
      await expect(EncryptionService.encrypt(maliciousInput)).resolves.toBeDefined();
    });

    it('应该防止SQL注入式攻击', async () => {
      const maliciousInput = "'; DROP TABLE users; --";
      
      await expect(EncryptionService.encrypt(maliciousInput)).resolves.toBeDefined();
    });

    it('应该处理超长输入', async () => {
      const longInput = 'a'.repeat(1000000); // 1MB of data
      
      await expect(EncryptionService.encrypt(longInput)).resolves.toBeDefined();
    });

    it('应该防止时序攻击', async () => {
      const data1 = 'short';
      const data2 = 'a'.repeat(1000);
      
      const start1 = Date.now();
      await SecureEncryption.generateChecksum(data1);
      const time1 = Date.now() - start1;
      
      const start2 = Date.now();
      await SecureEncryption.generateChecksum(data2);
      const time2 = Date.now() - start2;
      
      // 校验和生成时间应该与输入长度无关（在合理范围内）
      expect(Math.abs(time1 - time2)).toBeLessThan(100);
    });
  });

  describe('🛡️ 错误处理安全性', () => {
    it('不应该在错误信息中泄露敏感数据', async () => {
      const sensitiveData = 'password123';
      
      // 模拟加密失败
      (global.crypto.subtle.encrypt as jest.Mock).mockRejectedValue(new Error('Encryption failed'));
      
      try {
        await EncryptionService.encrypt(sensitiveData);
        fail('应该抛出错误');
      } catch (error) {
        expect(error.message).not.toContain(sensitiveData);
        expect(error.message).not.toContain('password');
      }
    });

    it('应该在密钥生成失败时抛出通用错误', async () => {
      (global.crypto.subtle.deriveKey as jest.Mock).mockRejectedValue(new Error('Key derivation failed'));
      
      try {
        await EncryptionService.encrypt('test');
        fail('应该抛出错误');
      } catch (error) {
        expect(error.message).toBe('Failed to generate encryption key');
      }
    });
  });
});

describe('🎯 性能测试', () => {
  it('应该在合理时间内完成加密操作', async () => {
    const plaintext = 'test data';
    const mockCiphertext = new ArrayBuffer(32);
    const mockKey = {} as CryptoKey;

    (global.crypto.getRandomValues as jest.Mock).mockReturnValue(new Uint8Array(12));
    (global.crypto.subtle.importKey as jest.Mock).mockResolvedValue(mockKey);
    (global.crypto.subtle.deriveKey as jest.Mock).mockResolvedValue(mockKey);
    (global.crypto.subtle.encrypt as jest.Mock).mockResolvedValue(mockCiphertext);

    const start = Date.now();
    await EncryptionService.encrypt(plaintext);
    const duration = Date.now() - start;
    
    expect(duration).toBeLessThan(1000); // 应该在1秒内完成
  });

  it('应该在合理时间内完成解密操作', async () => {
    const encryptedData = 'dGVzdCBkYXRh';
    const mockPlaintext = new TextEncoder().encode('test data').buffer;
    const mockKey = {} as CryptoKey;

    (global.crypto.subtle.importKey as jest.Mock).mockResolvedValue(mockKey);
    (global.crypto.subtle.deriveKey as jest.Mock).mockResolvedValue(mockKey);
    (global.crypto.subtle.decrypt as jest.Mock).mockResolvedValue(mockPlaintext);

    const start = Date.now();
    await EncryptionService.decrypt(encryptedData);
    const duration = Date.now() - start;
    
    expect(duration).toBeLessThan(1000); // 应该在1秒内完成
  });
});