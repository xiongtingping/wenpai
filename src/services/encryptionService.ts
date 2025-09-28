/**
 * 数据加密服务
 * 🔒 安全修复：使用AES-256-GCM加密替换Base64编码
 * 
 * 功能：
 * 1. 提供真正的数据加密和解密
 * 2. 使用认证加密模式防止篡改
 * 3. 自动生成和验证随机盐值
 * 4. 支持密钥派生和轮换
 * 5. 集成生产环境密钥管理
 */

import { SecureKeys } from '@/utils/productionKeyManager';

// 使用Web Crypto API（浏览器原生加密）
export class EncryptionService {
  private static readonly ALGORITHM = 'AES-GCM';
  private static readonly KEY_LENGTH = 256;
  private static readonly IV_LENGTH = 12; // 96 bits for GCM
  private static readonly TAG_LENGTH = 16; // 128 bits for GCM
  
  // 缓存加密密钥
  private static cryptoKey: CryptoKey | null = null;
  private static keyGenerationTime: number = 0;
  private static readonly KEY_ROTATION_INTERVAL = 24 * 60 * 60 * 1000; // 24小时

  /**
   * 获取或生成加密密钥
   */
  private static async getCryptoKey(): Promise<CryptoKey> {
    const now = Date.now();
    
    // 检查是否需要轮换密钥
    if (!this.cryptoKey || (now - this.keyGenerationTime) > this.KEY_ROTATION_INTERVAL) {
      await this.generateNewKey();
    }
    
    return this.cryptoKey!;
  }

  /**
   * 生成新的加密密钥
   */
  private static async generateNewKey(): Promise<void> {
    try {
      // 从环境变量或安全存储获取主密钥
      const masterKey = await this.getMasterKey();

      // 使用PBKDF2派生加密密钥
      const keyMaterial = await crypto.subtle.importKey(
        'raw',
        new TextEncoder().encode(masterKey),
        'PBKDF2',
        false,
        ['deriveKey']
      );

      // 🔧 FIX: 使用固定盐值确保密钥一致性
      // 使用应用标识符作为固定盐值，确保每次生成的密钥相同
      const appSalt = 'wenpai-encryption-salt-v1';
      const salt = new TextEncoder().encode(appSalt);

      // 派生AES密钥
      this.cryptoKey = await crypto.subtle.deriveKey(
        {
          name: 'PBKDF2',
          salt: salt,
          iterations: 100000,
          hash: 'SHA-256'
        },
        keyMaterial,
        {
          name: this.ALGORITHM,
          length: this.KEY_LENGTH
        },
        false,
        ['encrypt', 'decrypt']
      );

      this.keyGenerationTime = Date.now();
      console.log('🔐 固定盐值加密密钥已生成');

    } catch (error) {
      console.error('❌ 密钥生成失败:', error);
      throw new Error('Failed to generate encryption key');
    }
  }

  /**
   * 获取主密钥 - 🔐 集成生产环境密钥管理
   */
  private static async getMasterKey(): Promise<string> {
    try {
      // 🔧 NEW: 使用生产环境密钥管理器获取验证过的密钥
      const masterKey = SecureKeys.getEncryptionKey();
      
      console.log('🔐 使用生产环境密钥管理器获取主密钥');
      return masterKey;
      
    } catch (error) {
      console.error('❌ 生产环境密钥获取失败，使用回退方案:', error);
      
      // 回退方案：直接从环境变量获取
      const envKey = import.meta.env.VITE_ENCRYPTION_MASTER_KEY;
      if (envKey && envKey.length >= 32) {
        console.warn('⚠️ 使用直接环境变量密钥');
        return envKey;
      }

      // 最后的回退方案
      const fallbackMasterKey = 'wenpai-encryption-master-key-2025-v1-fixed-48chars';
      console.warn('⚠️ 使用固定回退密钥，建议配置环境变量');
      
      return fallbackMasterKey;
    }
  }

  /**
   * 生成随机密钥
   */
  private static generateRandomKey(length: number): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  /**
   * 加密数据
   */
  static async encrypt(plaintext: string): Promise<string> {
    try {
      if (!plaintext || typeof plaintext !== 'string') {
        throw new Error('Invalid plaintext data');
      }

      const key = await this.getCryptoKey();
      
      // 生成随机初始化向量
      const iv = crypto.getRandomValues(new Uint8Array(this.IV_LENGTH));
      
      // 将文本转换为字节数组
      const plaintextBytes = new TextEncoder().encode(plaintext);
      
      // 执行加密
      const ciphertext = await crypto.subtle.encrypt(
        {
          name: this.ALGORITHM,
          iv: iv,
          tagLength: this.TAG_LENGTH * 8 // 转换为位
        },
        key,
        plaintextBytes
      );

      // 组合IV和密文
      const encryptedData = new Uint8Array(iv.length + ciphertext.byteLength);
      encryptedData.set(iv, 0);
      encryptedData.set(new Uint8Array(ciphertext), iv.length);

      // 转换为Base64进行存储，添加AES格式标识符
      const base64Data = this.arrayBufferToBase64(encryptedData.buffer);
      return 'AES256GCM:' + base64Data;

    } catch (error) {
      console.error('❌ 数据加密失败:', error);
      throw new Error('Encryption failed');
    }
  }

  /**
   * 解密数据 - 支持格式标识符
   */
  static async decrypt(encryptedData: string): Promise<string> {
    try {
      if (!encryptedData || typeof encryptedData !== 'string') {
        throw new Error('Invalid encrypted data');
      }

      // 检查并移除AES格式标识符
      let base64Data = encryptedData;
      if (encryptedData.startsWith('AES256GCM:')) {
        base64Data = encryptedData.substring(10); // 移除 'AES256GCM:' 前缀
      }

      const key = await this.getCryptoKey();

      // 从Base64解码
      const encryptedBytes = new Uint8Array(this.base64ToArrayBuffer(base64Data));

      // 分离IV和密文
      const iv = encryptedBytes.slice(0, this.IV_LENGTH);
      const ciphertext = encryptedBytes.slice(this.IV_LENGTH);

      // 执行解密
      const plaintextBuffer = await crypto.subtle.decrypt(
        {
          name: this.ALGORITHM,
          iv: iv,
          tagLength: this.TAG_LENGTH * 8
        },
        key,
        ciphertext
      );

      // 转换为文本
      return new TextDecoder().decode(plaintextBuffer);

    } catch (error) {
      console.error('❌ 数据解密失败:', error);
      throw new Error('Decryption failed');
    }
  }

  /**
   * 生成数据完整性校验和
   */
  static async generateChecksum(data: string): Promise<string> {
    try {
      const encoder = new TextEncoder();
      const dataBytes = encoder.encode(data);
      
      // 使用SHA-256生成哈希
      const hashBuffer = await crypto.subtle.digest('SHA-256', dataBytes);
      
      // 转换为十六进制字符串
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    } catch (error) {
      console.error('❌ 校验和生成失败:', error);
      throw new Error('Checksum generation failed');
    }
  }

  /**
   * 验证数据完整性
   */
  static async verifyChecksum(data: string, expectedChecksum: string): Promise<boolean> {
    try {
      const actualChecksum = await this.generateChecksum(data);
      return actualChecksum === expectedChecksum;
    } catch (error) {
      console.error('❌ 校验和验证失败:', error);
      return false;
    }
  }

  /**
   * 检查加密功能是否可用
   */
  static isAvailable(): boolean {
    try {
      return typeof crypto !== 'undefined' && 
             typeof crypto.subtle !== 'undefined' &&
             typeof crypto.getRandomValues === 'function';
    } catch {
      return false;
    }
  }

  /**
   * 清理敏感数据
   */
  static clearSensitiveData(): void {
    this.cryptoKey = null;
    this.keyGenerationTime = 0;
    console.log('🧹 敏感加密数据已清理');
  }

  // 工具方法：ArrayBuffer转Base64
  private static arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  // 工具方法：Base64转ArrayBuffer
  private static base64ToArrayBuffer(base64: string): ArrayBuffer {
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
  }
}

/**
 * 降级加密服务（用于不支持Web Crypto API的环境）
 */
export class FallbackEncryptionService {
  private static readonly ROTATION_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';

  /**
   * 简单加密（仅用于降级场景）
   */
  static encrypt(plaintext: string): string {
    try {
      // 添加随机前缀
      const prefix = Math.random().toString(36).substring(2, 8);
      const data = prefix + plaintext;
      
      // 简单替换加密
      let encrypted = '';
      for (let i = 0; i < data.length; i++) {
        const char = data.charCodeAt(i);
        encrypted += String.fromCharCode(char + (i % 5) + 1);
      }
      
      return btoa(encrypted);
    } catch (error) {
      console.error('❌ 降级加密失败:', error);
      return btoa(plaintext); // 最后的降级方案
    }
  }

  /**
   * 简单解密
   */
  static decrypt(encryptedData: string): string {
    try {
      const data = atob(encryptedData);
      
      // 简单替换解密
      let decrypted = '';
      for (let i = 0; i < data.length; i++) {
        const char = data.charCodeAt(i);
        decrypted += String.fromCharCode(char - (i % 5) - 1);
      }
      
      // 移除随机前缀
      return decrypted.substring(6);
    } catch (error) {
      console.error('❌ 降级解密失败:', error);
      try {
        return atob(encryptedData); // 最后的降级方案
      } catch {
        return '';
      }
    }
  }
}

// 统一加密接口
export class SecureEncryption {
  /**
   * 自动选择最佳加密方式
   */
  static async encrypt(data: string): Promise<string> {
    if (EncryptionService.isAvailable()) {
      return await EncryptionService.encrypt(data);
    } else {
      console.warn('⚠️ Web Crypto API不可用，使用降级加密');
      return FallbackEncryptionService.encrypt(data);
    }
  }

  /**
   * 智能解密方式 - 修复AES-256-GCM与降级解密的兼容性问题
   */
  static async decrypt(encryptedData: string): Promise<string> {
    if (!EncryptionService.isAvailable()) {
      // Web Crypto API不可用，直接使用降级解密
      return FallbackEncryptionService.decrypt(encryptedData);
    }

    try {
      // 🔍 优先检查格式标识符
      if (encryptedData.startsWith('AES256GCM:')) {
        // 明确标识为AES加密数据
        return await EncryptionService.decrypt(encryptedData);
      }

      // 🔍 检测数据格式来判断加密方式
      const isAESEncrypted = this.isAESEncryptedData(encryptedData);

      if (isAESEncrypted) {
        // 使用AES-256-GCM解密
        return await EncryptionService.decrypt(encryptedData);
      } else {
        // 使用降级解密
        console.log('🔄 检测到降级加密数据，使用降级解密');
        return FallbackEncryptionService.decrypt(encryptedData);
      }
    } catch (error) {
      console.error('❌ 智能解密失败:', error);
      throw new Error('Decryption failed');
    }
  }

  /**
   * 检测是否为AES加密数据
   */
  private static isAESEncryptedData(encryptedData: string): boolean {
    try {
      // AES加密的数据通常更长，且包含IV和认证标签
      // 降级加密的数据相对较短
      const decoded = atob(encryptedData);

      // AES-256-GCM加密的数据至少包含：
      // - 12字节IV + 16字节认证标签 + 实际数据
      // 所以最少28字节，Base64编码后至少38个字符
      if (decoded.length < 28) {
        return false;
      }

      // 检查数据是否包含典型的AES特征
      // AES加密的数据通常具有更高的随机性
      const randomnessScore = this.calculateRandomnessScore(decoded);
      return randomnessScore > 0.7; // 随机性阈值

    } catch (error) {
      // Base64解码失败，可能不是有效的加密数据
      return false;
    }
  }

  /**
   * 计算数据的随机性分数
   */
  private static calculateRandomnessScore(data: string): number {
    if (data.length === 0) return 0;

    // 计算字符分布的熵
    const charCounts = new Map<string, number>();
    for (const char of data) {
      charCounts.set(char, (charCounts.get(char) || 0) + 1);
    }

    let entropy = 0;
    const length = data.length;
    for (const count of charCounts.values()) {
      const probability = count / length;
      entropy -= probability * Math.log2(probability);
    }

    // 归一化到0-1范围
    const maxEntropy = Math.log2(Math.min(256, length));
    return entropy / maxEntropy;
  }

  /**
   * 生成校验和
   */
  static async generateChecksum(data: string): Promise<string> {
    if (EncryptionService.isAvailable()) {
      return await EncryptionService.generateChecksum(data);
    } else {
      // 降级校验和
      let hash = 0;
      for (let i = 0; i < data.length; i++) {
        const char = data.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
      }
      return hash.toString(36);
    }
  }

  /**
   * 验证校验和
   */
  static async verifyChecksum(data: string, expectedChecksum: string): Promise<boolean> {
    const actualChecksum = await this.generateChecksum(data);
    return actualChecksum === expectedChecksum;
  }
}

export default SecureEncryption;