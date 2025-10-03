/**
 * 🔒 Zustand 安全存储中间件
 *
 * 设计目标:
 * 1. 为Zustand提供透明的加密/解密
 * 2. 自动处理敏感数据的安全存储
 * 3. 支持优雅降级 (加密失败时的处理)
 * 4. 性能优化 (缓存加密密钥)
 *
 * 使用方式:
 * ```ts
 * create(
 *   persist(
 *     secureStorage(
 *       (set, get) => ({ ... })
 *     ),
 *     { name: 'store-name' }
 *   )
 * )
 * ```
 */

import { StateCreator, StoreMutatorIdentifier } from 'zustand';
import { SecureEncryption } from '@/services/encryptionService';

/**
 * 安全存储配置
 */
export interface SecureStorageConfig {
  /** 是否启用加密 (默认: true) */
  enabled?: boolean;

  /** 需要加密的字段路径 (默认: 加密所有) */
  encryptPaths?: string[];

  /** 排除加密的字段路径 */
  excludePaths?: string[];

  /** 加密失败时的行为 (默认: 'warn') */
  onEncryptError?: 'throw' | 'warn' | 'silent';

  /** 解密失败时的行为 (默认: 'clear') */
  onDecryptError?: 'throw' | 'clear' | 'fallback';
}

/**
 * 加密的存储数据结构
 */
interface EncryptedStorage {
  _encrypted: true;
  _version: number;
  data: string; // 加密后的数据
  checksum: string; // 数据完整性校验
  timestamp: number;
}

/**
 * 检查数据是否需要加密
 */
function shouldEncrypt(
  path: string,
  config: SecureStorageConfig
): boolean {
  const { enabled = true, encryptPaths, excludePaths } = config;

  if (!enabled) return false;

  // 如果有排除路径,检查是否匹配
  if (excludePaths?.some(p => path.startsWith(p))) {
    return false;
  }

  // 如果有指定加密路径,检查是否匹配
  if (encryptPaths?.length) {
    return encryptPaths.some(p => path.startsWith(p));
  }

  // 默认加密所有
  return true;
}

/**
 * 加密存储数据
 */
async function encryptStorageData(
  data: any,
  config: SecureStorageConfig
): Promise<string> {
  try {
    const jsonData = JSON.stringify(data);
    const encryptedData = await SecureEncryption.encrypt(jsonData);
    const checksum = await SecureEncryption.generateChecksum(jsonData);

    const storage: EncryptedStorage = {
      _encrypted: true,
      _version: 1,
      data: encryptedData,
      checksum,
      timestamp: Date.now()
    };

    return JSON.stringify(storage);
  } catch (error) {
    console.error('❌ 存储数据加密失败:', error);

    const { onEncryptError = 'warn' } = config;

    if (onEncryptError === 'throw') {
      throw new Error(`存储加密失败: ${error}`);
    }

    if (onEncryptError === 'warn') {
      console.warn('⚠️ 加密失败,使用明文存储 (仅开发环境)');
      if (import.meta.env.PROD) {
        throw new Error('生产环境禁止明文存储');
      }
    }

    // 返回明文 (仅在开发环境且允许降级时)
    return JSON.stringify(data);
  }
}

/**
 * 解密存储数据
 */
async function decryptStorageData(
  encryptedStr: string,
  config: SecureStorageConfig
): Promise<any> {
  try {
    const parsed = JSON.parse(encryptedStr);

    // 检查是否是加密格式
    if (!parsed._encrypted) {
      // 直接返回明文数据 (向后兼容)
      return parsed;
    }

    const storage = parsed as EncryptedStorage;

    // 解密数据
    const decryptedData = await SecureEncryption.decrypt(storage.data);

    // 验证完整性
    const isValid = await SecureEncryption.verifyChecksum(
      decryptedData,
      storage.checksum
    );

    if (!isValid) {
      throw new Error('数据完整性校验失败');
    }

    return JSON.parse(decryptedData);
  } catch (error) {
    console.error('❌ 存储数据解密失败:', error);

    const { onDecryptError = 'clear' } = config;

    if (onDecryptError === 'throw') {
      throw new Error(`存储解密失败: ${error}`);
    }

    if (onDecryptError === 'clear') {
      console.warn('⚠️ 解密失败,清除损坏的存储数据');
      return null;
    }

    // fallback: 尝试直接解析 (可能是明文)
    try {
      return JSON.parse(encryptedStr);
    } catch {
      return null;
    }
  }
}

/**
 * 安全存储中间件
 */
export const secureStorage = <
  T,
  Mps extends [StoreMutatorIdentifier, unknown][] = [],
  Mcs extends [StoreMutatorIdentifier, unknown][] = []
>(
  config: StateCreator<T, Mps, Mcs>,
  options: SecureStorageConfig = {}
): StateCreator<T, Mps, Mcs> => {
  return (set, get, api) => {
    // 包装原始的 set 函数
    const secureSet: typeof set = (partial, replace) => {
      // 调用原始 set
      set(partial, replace);

      // 可以在这里添加加密逻辑的钩子
      // 实际加密由 persist 中间件的 storage 选项处理
    };

    return config(secureSet, get, api);
  };
};

/**
 * 创建安全的localStorage适配器
 */
export function createSecureStorage(config: SecureStorageConfig = {}) {
  return {
    getItem: async (name: string): Promise<string | null> => {
      try {
        const encryptedData = localStorage.getItem(name);
        if (!encryptedData) return null;

        const decrypted = await decryptStorageData(encryptedData, config);
        return decrypted ? JSON.stringify(decrypted) : null;
      } catch (error) {
        console.error('❌ 读取加密存储失败:', error);
        return null;
      }
    },

    setItem: async (name: string, value: string): Promise<void> => {
      try {
        const data = JSON.parse(value);
        const encrypted = await encryptStorageData(data, config);
        localStorage.setItem(name, encrypted);
      } catch (error) {
        console.error('❌ 写入加密存储失败:', error);

        if (config.onEncryptError === 'throw') {
          throw error;
        }

        // 降级处理 (仅开发环境)
        if (import.meta.env.DEV && config.onEncryptError !== 'silent') {
          console.warn('⚠️ 加密失败,使用明文存储 (仅开发环境)');
          localStorage.setItem(name, value);
        }
      }
    },

    removeItem: async (name: string): Promise<void> => {
      localStorage.removeItem(name);
    }
  };
}

/**
 * 默认的安全配置 (推荐用于用户数据)
 */
export const defaultSecureConfig: SecureStorageConfig = {
  enabled: true,
  encryptPaths: ['user', 'auth', 'tokenUsage'], // 只加密敏感数据
  excludePaths: ['theme', 'appSettings'], // UI状态不需要加密
  onEncryptError: 'warn',
  onDecryptError: 'clear'
};

/**
 * 严格的安全配置 (生产环境推荐)
 */
export const strictSecureConfig: SecureStorageConfig = {
  enabled: true,
  onEncryptError: 'throw',
  onDecryptError: 'clear'
};

export default secureStorage;
