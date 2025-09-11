/**
 * 🔒 安全存储服务 - 解决本地存储安全问题
 * 
 * 解决问题：
 * 1. 敏感数据加密存储
 * 2. 防止数据泄露
 * 3. 统一存储接口
 * 4. 自动过期管理
 */

interface StorageItem {
  value: any;
  timestamp: number;
  ttl?: number; // 生存时间（毫秒）
  encrypted?: boolean;
}

interface SecureStorageOptions {
  encrypt?: boolean;
  ttl?: number;
  namespace?: string;
}

class SecureStorageService {
  private namespace: string;
  private encryptionKey: string;

  constructor(namespace = 'wenpai_secure') {
    this.namespace = namespace;
    this.encryptionKey = this.generateEncryptionKey();
  }

  /**
   * 生成加密密钥
   */
  private generateEncryptionKey(): string {
    // 基于用户环境生成密钥
    const userAgent = navigator.userAgent;
    const timestamp = Date.now().toString();
    const random = Math.random().toString(36);
    
    return btoa(`${userAgent}_${timestamp}_${random}`).slice(0, 32);
  }

  /**
   * 简单加密（基于Base64和XOR）
   */
  private encrypt(data: string): string {
    try {
      const key = this.encryptionKey;
      let encrypted = '';
      
      for (let i = 0; i < data.length; i++) {
        const keyChar = key.charCodeAt(i % key.length);
        const dataChar = data.charCodeAt(i);
        encrypted += String.fromCharCode(dataChar ^ keyChar);
      }
      
      return btoa(encrypted);
    } catch (error) {
      console.error('❌ 加密失败:', error);
      return btoa(data); // 降级为Base64
    }
  }

  /**
   * 简单解密
   */
  private decrypt(encryptedData: string): string {
    try {
      const key = this.encryptionKey;
      const data = atob(encryptedData);
      let decrypted = '';
      
      for (let i = 0; i < data.length; i++) {
        const keyChar = key.charCodeAt(i % key.length);
        const dataChar = data.charCodeAt(i);
        decrypted += String.fromCharCode(dataChar ^ keyChar);
      }
      
      return decrypted;
    } catch (error) {
      console.error('❌ 解密失败:', error);
      return atob(encryptedData); // 降级为Base64解码
    }
  }

  /**
   * 生成存储键名
   */
  private getKey(key: string): string {
    return `${this.namespace}_${key}`;
  }

  /**
   * 设置存储项
   */
  setItem(key: string, value: any, options: SecureStorageOptions = {}): void {
    try {
      const {
        encrypt = false,
        ttl,
        namespace = this.namespace
      } = options;

      const storageItem: StorageItem = {
        value: encrypt ? this.encrypt(JSON.stringify(value)) : value,
        timestamp: Date.now(),
        ttl,
        encrypted: encrypt
      };

      const storageKey = namespace ? `${namespace}_${key}` : this.getKey(key);
      localStorage.setItem(storageKey, JSON.stringify(storageItem));

      console.log(`🔒 安全存储: ${key} ${encrypt ? '(已加密)' : '(未加密)'}`);
    } catch (error) {
      console.error(`❌ 存储失败: ${key}`, error);
      throw new Error(`存储失败: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * 获取存储项
   */
  getItem<T = any>(key: string, namespace?: string): T | null {
    try {
      const storageKey = namespace ? `${namespace}_${key}` : this.getKey(key);
      const stored = localStorage.getItem(storageKey);
      
      if (!stored) {
        return null;
      }

      const storageItem: StorageItem = JSON.parse(stored);
      
      // 检查是否过期
      if (storageItem.ttl) {
        const isExpired = Date.now() - storageItem.timestamp > storageItem.ttl;
        if (isExpired) {
          this.removeItem(key, namespace);
          console.log(`⏰ 存储项已过期: ${key}`);
          return null;
        }
      }

      // 解密数据
      if (storageItem.encrypted) {
        const decryptedValue = this.decrypt(storageItem.value);
        return JSON.parse(decryptedValue);
      }

      return storageItem.value;
    } catch (error) {
      console.error(`❌ 读取失败: ${key}`, error);
      return null;
    }
  }

  /**
   * 移除存储项
   */
  removeItem(key: string, namespace?: string): void {
    try {
      const storageKey = namespace ? `${namespace}_${key}` : this.getKey(key);
      localStorage.removeItem(storageKey);
      console.log(`🗑️ 移除存储: ${key}`);
    } catch (error) {
      console.error(`❌ 移除失败: ${key}`, error);
    }
  }

  /**
   * 清理过期项
   */
  cleanupExpired(): number {
    let cleanedCount = 0;
    
    try {
      const keys = Object.keys(localStorage);
      const namespaceKeys = keys.filter(key => key.startsWith(this.namespace));
      
      for (const key of namespaceKeys) {
        try {
          const stored = localStorage.getItem(key);
          if (stored) {
            const storageItem: StorageItem = JSON.parse(stored);
            
            if (storageItem.ttl) {
              const isExpired = Date.now() - storageItem.timestamp > storageItem.ttl;
              if (isExpired) {
                localStorage.removeItem(key);
                cleanedCount++;
              }
            }
          }
        } catch (error) {
          // 如果解析失败，可能是损坏的数据，直接删除
          localStorage.removeItem(key);
          cleanedCount++;
        }
      }
      
      if (cleanedCount > 0) {
        console.log(`🧹 清理过期存储: ${cleanedCount} 项`);
      }
    } catch (error) {
      console.error('❌ 清理过期存储失败:', error);
    }
    
    return cleanedCount;
  }

  /**
   * 获取存储统计
   */
  getStats(): {
    totalItems: number;
    encryptedItems: number;
    expiredItems: number;
    totalSize: number;
  } {
    let totalItems = 0;
    let encryptedItems = 0;
    let expiredItems = 0;
    let totalSize = 0;

    try {
      const keys = Object.keys(localStorage);
      const namespaceKeys = keys.filter(key => key.startsWith(this.namespace));
      
      for (const key of namespaceKeys) {
        try {
          const stored = localStorage.getItem(key);
          if (stored) {
            totalItems++;
            totalSize += stored.length;
            
            const storageItem: StorageItem = JSON.parse(stored);
            
            if (storageItem.encrypted) {
              encryptedItems++;
            }
            
            if (storageItem.ttl) {
              const isExpired = Date.now() - storageItem.timestamp > storageItem.ttl;
              if (isExpired) {
                expiredItems++;
              }
            }
          }
        } catch (error) {
          // 忽略解析错误
        }
      }
    } catch (error) {
      console.error('❌ 获取存储统计失败:', error);
    }

    return {
      totalItems,
      encryptedItems,
      expiredItems,
      totalSize
    };
  }

  /**
   * 清空所有存储
   */
  clear(): void {
    try {
      const keys = Object.keys(localStorage);
      const namespaceKeys = keys.filter(key => key.startsWith(this.namespace));
      
      for (const key of namespaceKeys) {
        localStorage.removeItem(key);
      }
      
      console.log(`🗑️ 清空安全存储: ${namespaceKeys.length} 项`);
    } catch (error) {
      console.error('❌ 清空存储失败:', error);
    }
  }
}

// 创建默认实例
export const secureStorage = new SecureStorageService();

// 导出类供自定义使用
export { SecureStorageService };

// 便捷函数
export const setSecureItem = (key: string, value: any, options?: SecureStorageOptions) =>
  secureStorage.setItem(key, value, options);

export const getSecureItem = <T = any>(key: string, namespace?: string): T | null =>
  secureStorage.getItem<T>(key, namespace);

export const removeSecureItem = (key: string, namespace?: string) =>
  secureStorage.removeItem(key, namespace);

export const cleanupExpiredItems = () =>
  secureStorage.cleanupExpired();

export const getStorageStats = () =>
  secureStorage.getStats();
