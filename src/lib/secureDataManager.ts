/**
 * 🛡️ 安全数据管理器
 * 整合所有数据安全修复，提供统一的安全数据管理接口
 */

import { secureStorage } from '@/lib/security';
import { UnifiedStorageKeyManager } from '@/lib/unifiedStorageManager';
import { userSwitchDataCleaner } from '@/lib/userSwitchDataCleaner';
import { guestDataIsolation } from '@/lib/guestDataIsolation';
import { storageQuotaManager } from '@/lib/storageQuotaManager';
import { safeLocalStorage, dataTypeValidator } from '@/lib/dataTypeValidator';

export interface SecurityConfig {
  enableEncryption: boolean;
  enableDataValidation: boolean;
  enableQuotaMonitoring: boolean;
  autoCleanupEnabled: boolean;
  maxStorageUsage: number; // 百分比
}

/**
 * 安全数据管理器主类
 */
export class SecureDataManager {
  private static instance: SecureDataManager;
  private currentUserId: string | null = null;
  private config: SecurityConfig;
  private quotaMonitoringStop?: () => void;

  private constructor(config: Partial<SecurityConfig> = {}) {
    this.config = {
      enableEncryption: true,
      enableDataValidation: true,
      enableQuotaMonitoring: true,
      autoCleanupEnabled: true,
      maxStorageUsage: 80, // 80%
      ...config
    };
    
    this.initializeSecurityFeatures();
  }

  static getInstance(config?: Partial<SecurityConfig>): SecureDataManager {
    if (!SecureDataManager.instance) {
      SecureDataManager.instance = new SecureDataManager(config);
    }
    return SecureDataManager.instance;
  }

  /**
   * 初始化安全功能
   */
  private initializeSecurityFeatures(): void {
    console.log('🛡️ 初始化安全数据管理器...');
    
    // 启动存储配额监控
    if (this.config.enableQuotaMonitoring) {
      this.startQuotaMonitoring();
    }

    // 清理过期数据
    if (this.config.autoCleanupEnabled) {
      this.performInitialCleanup();
    }

    // 验证现有数据
    if (this.config.enableDataValidation) {
      this.validateExistingData();
    }
  }

  /**
   * 设置当前用户
   */
  setCurrentUser(userId: string | null, oldUserId?: string): void {
    if (this.currentUserId === userId) return;

    console.log(`🔄 用户切换: ${oldUserId || this.currentUserId} -> ${userId || 'guest'}`);

    // 执行用户切换清理
    if (oldUserId || this.currentUserId) {
      userSwitchDataCleaner.performLogoutCleanup(oldUserId || this.currentUserId!);
    }

    if (userId) {
      // 正式用户登录
      userSwitchDataCleaner.performLoginCleanup(userId, this.currentUserId || undefined);
      
      // 迁移访客数据（如果有）
      const migratedCount = guestDataIsolation.migrateGuestDataToUser(userId);
      if (migratedCount > 0) {
        console.log(`📦 访客数据迁移完成: ${migratedCount} 项`);
      }
    }

    this.currentUserId = userId;
  }

  /**
   * 安全存储数据
   */
  setData<T>(module: string, data: T, options: {
    subModule?: string;
    encrypt?: boolean;
    schemaName?: string;
    sensitive?: boolean;
  } = {}): boolean {
    const { subModule, encrypt, schemaName, sensitive = false } = options;
    
    try {
      // 数据验证
      if (this.config.enableDataValidation) {
        const validation = dataTypeValidator.validateAndSanitizeStorageData(
          `${module}${subModule ? ':' + subModule : ''}`, 
          data, 
          schemaName
        );
        
        if (!validation.isValid) {
          console.error(`数据验证失败 [${module}]:`, validation.errors);
          return false;
        }
        
        data = (validation.sanitizedData !== undefined ? validation.sanitizedData : data) as T;
      }

      // 存储配额检查
      if (this.config.enableQuotaMonitoring) {
        const shouldCleanup = storageQuotaManager.shouldCleanup();
        if (shouldCleanup.level === 'critical') {
          console.warn('🔥 存储空间不足，执行自动清理...');
          storageQuotaManager.performIntelligentCleanup();
        }
      }

      // 选择存储方式
      const useEncryption = encrypt || sensitive || this.config.enableEncryption;
      
      if (this.currentUserId) {
        // 用户模式
        const key = UnifiedStorageKeyManager.generateUserDataKey(this.currentUserId, module, subModule);
        
        if (useEncryption) {
          secureStorage.setItem(key, data, true);
        } else {
          safeLocalStorage.setItem(key, data, schemaName);
        }
      } else {
        // 访客模式
        guestDataIsolation.setGuestData(module, data, subModule);
      }

      return true;
    } catch (error) {
      console.error(`安全存储失败 [${module}]:`, error);
      return false;
    }
  }

  /**
   * 安全获取数据
   */
  getData<T>(module: string, options: {
    subModule?: string;
    decrypt?: boolean;
    schemaName?: string;
  } = {}): T | null {
    const { subModule, decrypt = false, schemaName } = options;
    
    try {
      let data: T | null = null;

      if (this.currentUserId) {
        // 用户模式
        const key = UnifiedStorageKeyManager.generateUserDataKey(this.currentUserId, module, subModule);
        
        if (decrypt || this.config.enableEncryption) {
          data = secureStorage.getItem<T>(key, true);
        } else {
          data = safeLocalStorage.getItem<T>(key, schemaName);
        }
      } else {
        // 访客模式
        data = guestDataIsolation.getGuestData<T>(module, subModule);
      }

      return data;
    } catch (error) {
      console.error(`安全获取数据失败 [${module}]:`, error);
      return null;
    }
  }

  /**
   * 删除数据
   */
  removeData(module: string, subModule?: string): void {
    if (this.currentUserId) {
      const key = UnifiedStorageKeyManager.generateUserDataKey(this.currentUserId, module, subModule);
      localStorage.removeItem(key);
    } else {
      guestDataIsolation.removeGuestData(module, subModule);
    }
  }

  /**
   * 启动配额监控
   */
  private startQuotaMonitoring(): void {
    this.quotaMonitoringStop = storageQuotaManager.startStorageMonitoring((quotaInfo) => {
      if (quotaInfo.percentage > this.config.maxStorageUsage / 100) {
        console.warn(`⚠️ 存储使用量超标: ${Math.round(quotaInfo.percentage * 100)}%`);
        
        if (this.config.autoCleanupEnabled) {
          storageQuotaManager.performIntelligentCleanup();
        }
      }
    });
  }

  /**
   * 执行初始清理
   */
  private performInitialCleanup(): void {
    // 清理过期访客会话
    guestDataIsolation.cleanupExpiredGuestSessions();
    
    // 验证和清理无效数据
    safeLocalStorage.cleanupInvalidData();
    
    console.log('🧹 初始数据清理完成');
  }

  /**
   * 验证现有数据
   */
  private validateExistingData(): void {
    const result = dataTypeValidator.validateAllStorageData();
    
    if (result.invalidItems.length > 0) {
      console.warn(`发现 ${result.invalidItems.length} 个无效数据项`);
    }
    
    if (result.sanitizedItems.length > 0) {
      console.log(`清理了 ${result.sanitizedItems.length} 个数据项`);
    }
  }

  /**
   * 获取安全状态报告
   */
  getSecurityReport(): {
    userIsolation: boolean;
    dataValidation: boolean;
    encryption: boolean;
    quotaStatus: string;
    recommendations: string[];
  } {
    const quotaInfo = storageQuotaManager.getQuotaInfo();
    const quotaCheck = storageQuotaManager.shouldCleanup();
    
    const recommendations: string[] = [];
    
    if (quotaCheck.needsCleanup) {
      recommendations.push(quotaCheck.message);
    }
    
    if (!this.config.enableEncryption) {
      recommendations.push('建议启用数据加密');
    }
    
    if (!this.config.enableDataValidation) {
      recommendations.push('建议启用数据验证');
    }

    return {
      userIsolation: !!this.currentUserId,
      dataValidation: this.config.enableDataValidation,
      encryption: this.config.enableEncryption,
      quotaStatus: `${Math.round(quotaInfo.percentage * 100)}% (${storageQuotaManager.formatBytes(quotaInfo.used)})`,
      recommendations
    };
  }

  /**
   * 执行完整的安全检查
   */
  performSecurityAudit(): {
    passed: boolean;
    issues: string[];
    fixes: string[];
    score: number;
  } {
    const issues: string[] = [];
    const fixes: string[] = [];
    let score = 100;

    // 检查用户数据隔离
    if (!this.currentUserId) {
      const guestStats = guestDataIsolation.getGuestSessionStats();
      if (guestStats.dataItemsCount > 50) {
        issues.push('访客数据过多，可能影响性能');
        fixes.push('清理访客数据或引导用户注册');
        score -= 10;
      }
    }

    // 检查存储配额
    const quotaCheck = storageQuotaManager.shouldCleanup();
    if (quotaCheck.level === 'critical') {
      issues.push('存储空间严重不足');
      fixes.push('立即执行数据清理');
      score -= 30;
    } else if (quotaCheck.level === 'warning') {
      issues.push('存储空间不足');
      fixes.push('建议清理临时数据');
      score -= 15;
    }

    // 检查数据验证
    const validationResult = dataTypeValidator.validateAllStorageData();
    if (validationResult.invalidItems.length > 0) {
      issues.push(`发现 ${validationResult.invalidItems.length} 个无效数据项`);
      fixes.push('清理无效数据');
      score -= validationResult.invalidItems.length * 2;
    }

    // 检查加密状态
    if (!this.config.enableEncryption) {
      issues.push('数据加密未启用');
      fixes.push('启用数据加密保护');
      score -= 20;
    }

    return {
      passed: issues.length === 0,
      issues,
      fixes,
      score: Math.max(0, score)
    };
  }

  /**
   * 销毁管理器
   */
  destroy(): void {
    if (this.quotaMonitoringStop) {
      this.quotaMonitoringStop();
    }
  }
}

/**
 * React Hook: 安全数据管理
 */
export function useSecureDataManager(config?: Partial<SecurityConfig>) {
  const manager = SecureDataManager.getInstance(config);
  
  return {
    setCurrentUser: (userId: string | null, oldUserId?: string) => 
      manager.setCurrentUser(userId, oldUserId),
    setData: <T>(module: string, data: T, options?: {
      subModule?: string;
      encrypt?: boolean;
      schemaName?: string;
      sensitive?: boolean;
    }) => manager.setData(module, data, options),
    getData: <T>(module: string, options?: {
      subModule?: string;
      decrypt?: boolean;
      schemaName?: string;
    }) => manager.getData<T>(module, options),
    removeData: (module: string, subModule?: string) => 
      manager.removeData(module, subModule),
    getSecurityReport: () => manager.getSecurityReport(),
    performSecurityAudit: () => manager.performSecurityAudit(),
    destroy: () => manager.destroy()
  };
}

export const secureDataManager = SecureDataManager.getInstance();