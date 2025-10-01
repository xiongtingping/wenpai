/**
 * 📊 localStorage容量管理器
 * 监控和管理localStorage使用量，防止存储溢出
 */

export interface StorageQuotaInfo {
  total: number;      // 总容量 (字节)
  used: number;       // 已使用 (字节) 
  available: number;  // 可用 (字节)
  percentage: number; // 使用百分比
  itemsCount: number; // 项目数量
}

export interface StorageItem {
  key: string;
  size: number;
  lastModified: string;
  type: 'user' | 'guest' | 'ui' | 'temp' | 'other';
  userId?: string;
  sessionId?: string;
}

/**
 * localStorage容量管理器
 */
export class StorageQuotaManager {
  private static instance: StorageQuotaManager;
  
  // localStorage理论最大容量 (大多数浏览器为5MB)
  private static readonly MAX_STORAGE_SIZE = 5 * 1024 * 1024; // 5MB
  
  // 警告阈值
  private static readonly WARNING_THRESHOLD = 0.8; // 80%
  private static readonly CRITICAL_THRESHOLD = 0.95; // 95%

  private constructor() {}

  static getInstance(): StorageQuotaManager {
    if (!StorageQuotaManager.instance) {
      StorageQuotaManager.instance = new StorageQuotaManager();
    }
    return StorageQuotaManager.instance;
  }

  /**
   * 获取当前存储配额信息
   */
  getQuotaInfo(): StorageQuotaInfo {
    const items = this.getAllStorageItems();
    const used = items.reduce((total, item) => total + item.size, 0);
    const total = StorageQuotaManager.MAX_STORAGE_SIZE;
    const available = total - used;
    const percentage = used / total;

    return {
      total,
      used,
      available,
      percentage,
      itemsCount: items.length
    };
  }

  /**
   * 获取所有localStorage项目的详细信息
   */
  getAllStorageItems(): StorageItem[] {
    const items: StorageItem[] = [];
    const allKeys = Object.keys(localStorage);

    allKeys.forEach(key => {
      const data = localStorage.getItem(key);
      if (!data) return;

      const item: StorageItem = {
        key,
        size: new Blob([data]).size,
        lastModified: this.getItemLastModified(key, data),
        type: this.categorizeStorageKey(key),
        ...this.parseStorageKeyInfo(key)
      };

      items.push(item);
    });

    return items.sort((a, b) => b.size - a.size); // 按大小降序排列
  }

  /**
   * 获取项目最后修改时间
   */
  private getItemLastModified(key: string, data: string): string {
    try {
      const parsed = JSON.parse(data);
      
      // 检查是否有时间戳字段
      if (parsed.timestamp) return new Date(parsed.timestamp).toISOString();
      if (parsed.updatedAt) return parsed.updatedAt;
      if (parsed.createdAt) return parsed.createdAt;
      if (parsed.lastActivity) return parsed.lastActivity;
      
      // 使用当前时间作为默认值
      return new Date().toISOString();
    } catch {
      return new Date().toISOString();
    }
  }

  /**
   * 分类存储键类型
   */
  private categorizeStorageKey(key: string): 'user' | 'guest' | 'ui' | 'temp' | 'other' {
    if (key.includes(':user:')) return 'user';
    if (key.includes(':guest:')) return 'guest';
    if (key.includes(':ui:')) return 'ui';
    if (key.includes(':temp:') || key.includes('temp_')) return 'temp';
    return 'other';
  }

  /**
   * 解析存储键信息
   */
  private parseStorageKeyInfo(key: string): { userId?: string; sessionId?: string } {
    const userMatch = key.match(/:user:([^:]+):/);
    if (userMatch) return { userId: userMatch[1] };

    const guestMatch = key.match(/:guest:([^:]+):/);
    if (guestMatch) return { sessionId: guestMatch[1] };

    return {};
  }

  /**
   * 检查是否需要清理
   */
  shouldCleanup(): {
    needsCleanup: boolean;
    level: 'normal' | 'warning' | 'critical';
    message: string;
  } {
    const quota = this.getQuotaInfo();
    
    if (quota.percentage >= StorageQuotaManager.CRITICAL_THRESHOLD) {
      return {
        needsCleanup: true,
        level: 'critical',
        message: `存储空间严重不足 (${Math.round(quota.percentage * 100)}%)，需要立即清理`
      };
    }
    
    if (quota.percentage >= StorageQuotaManager.WARNING_THRESHOLD) {
      return {
        needsCleanup: true,
        level: 'warning',
        message: `存储空间不足 (${Math.round(quota.percentage * 100)}%)，建议清理`
      };
    }
    
    return {
      needsCleanup: false,
      level: 'normal',
      message: `存储空间充足 (${Math.round(quota.percentage * 100)}%)`
    };
  }

  /**
   * 智能清理策略
   */
  performIntelligentCleanup(): {
    success: boolean;
    clearedItems: number;
    freedSpace: number;
    strategy: string[];
  } {
    const items = this.getAllStorageItems();
    let clearedItems = 0;
    let freedSpace = 0;
    const strategy: string[] = [];

    // 策略1: 清理临时数据 (最安全)
    const tempItems = items.filter(item => item.type === 'temp');
    if (tempItems.length > 0) {
      tempItems.forEach(item => {
        localStorage.removeItem(item.key);
        clearedItems++;
        freedSpace += item.size;
      });
      strategy.push(`清理 ${tempItems.length} 个临时数据项`);
    }

    // 策略2: 清理过期访客数据
    const expiredGuestItems = this.getExpiredGuestItems();
    expiredGuestItems.forEach(item => {
      localStorage.removeItem(item.key);
      clearedItems++;
      freedSpace += item.size;
    });
    if (expiredGuestItems.length > 0) {
      strategy.push(`清理 ${expiredGuestItems.length} 个过期访客数据`);
    }

    // 策略3: 清理最大的其他类型数据项 (如果仍然不够)
    const quota = this.getQuotaInfo();
    if (quota.percentage > StorageQuotaManager.WARNING_THRESHOLD) {
      const otherItems = items
        .filter(item => item.type === 'other')
        .slice(0, 5); // 只清理最大的5项
      
      otherItems.forEach(item => {
        localStorage.removeItem(item.key);
        clearedItems++;
        freedSpace += item.size;
      });
      
      if (otherItems.length > 0) {
        strategy.push(`清理 ${otherItems.length} 个大型数据项`);
      }
    }

    console.log(`🧹 智能cleaningcompleted: cleaning了 ${clearedItems} item，释放 ${freedSpace} 字节`);

    return {
      success: clearedItems > 0,
      clearedItems,
      freedSpace,
      strategy
    };
  }

  /**
   * 获取过期的访客数据项
   */
  private getExpiredGuestItems(): StorageItem[] {
    const items = this.getAllStorageItems();
    const now = new Date();
    
    return items.filter(item => {
      if (item.type !== 'guest') return false;
      
      const lastModified = new Date(item.lastModified);
      const hoursDiff = (now.getTime() - lastModified.getTime()) / (1000 * 60 * 60);
      
      // 访客数据超过24小时视为过期
      return hoursDiff > 24;
    });
  }

  /**
   * 获取存储使用报告
   */
  getStorageReport(): {
    quota: StorageQuotaInfo;
    breakdown: Record<string, { count: number; size: number }>;
    recommendations: string[];
  } {
    const quota = this.getQuotaInfo();
    const items = this.getAllStorageItems();
    
    // 按类型分组统计
    const breakdown: Record<string, { count: number; size: number }> = {
      user: { count: 0, size: 0 },
      guest: { count: 0, size: 0 },
      ui: { count: 0, size: 0 },
      temp: { count: 0, size: 0 },
      other: { count: 0, size: 0 }
    };

    items.forEach(item => {
      breakdown[item.type].count++;
      breakdown[item.type].size += item.size;
    });

    // 生成建议
    const recommendations: string[] = [];
    
    if (quota.percentage > StorageQuotaManager.CRITICAL_THRESHOLD) {
      recommendations.push('🔥 立即执行深度清理，存储空间严重不足');
    } else if (quota.percentage > StorageQuotaManager.WARNING_THRESHOLD) {
      recommendations.push('⚠️ 建议清理临时数据和过期访客数据');
    }

    if (breakdown.temp.count > 10) {
      recommendations.push('🧹 建议清理临时数据，项目过多');
    }

    if (breakdown.guest.size > 1024 * 1024) { // 1MB
      recommendations.push('👤 建议清理访客数据，占用空间过大');
    }

    if (breakdown.other.count > 20) {
      recommendations.push('🔍 建议检查其他类型数据，可能存在冗余');
    }

    return {
      quota,
      breakdown,
      recommendations
    };
  }

  /**
   * 监控存储使用量变化
   */
  startStorageMonitoring(onQuotaChange?: (info: StorageQuotaInfo) => void): () => void {
    let lastQuota = this.getQuotaInfo();
    
    const checkQuota = () => {
      const currentQuota = this.getQuotaInfo();
      
      // 检查是否有显著变化 (超过1%的变化)
      if (Math.abs(currentQuota.percentage - lastQuota.percentage) > 0.01) {
        console.log(`📊 storage使用量变化: ${Math.round(lastQuota.percentage * 100)}% -> ${Math.round(currentQuota.percentage * 100)}%`);
        
        // 检查是否需要自动清理
        const shouldCleanup = this.shouldCleanup();
        if (shouldCleanup.needsCleanup && shouldCleanup.level === 'critical') {
          console.warn('🔥 storageempty间不足，executing自动cleaning...');
          this.performIntelligentCleanup();
        }
        
        onQuotaChange?.(currentQuota);
        lastQuota = currentQuota;
      }
    };

    // 每30秒检查一次
    const intervalId = setInterval(checkQuota, 30000);
    
    // 返回停止监控的函数
    return () => {
      clearInterval(intervalId);
      console.log('📊 storagemonitoringalreadystopping');
    };
  }

  /**
   * 格式化字节大小
   */
  static formatBytes(bytes: number): string {
    if (bytes === 0) return '0 B';
    
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * 生成存储使用量报告
   */
  generateUsageReport(): string {
    const report = this.getStorageReport();
    const { quota, breakdown, recommendations } = report;

    let reportText = `# 📊 localStorage使用报告\n\n`;
    reportText += `**总体使用情况**:\n`;
    reportText += `- 已使用: ${StorageQuotaManager.formatBytes(quota.used)} / ${StorageQuotaManager.formatBytes(quota.total)} (${Math.round(quota.percentage * 100)}%)\n`;
    reportText += `- 剩余空间: ${StorageQuotaManager.formatBytes(quota.available)}\n`;
    reportText += `- 项目总数: ${quota.itemsCount}\n\n`;

    reportText += `**分类统计**:\n`;
    Object.entries(breakdown).forEach(([type, stats]) => {
      if (stats.count > 0) {
        reportText += `- ${type}: ${stats.count}项, ${StorageQuotaManager.formatBytes(stats.size)}\n`;
      }
    });

    if (recommendations.length > 0) {
      reportText += `\n**建议操作**:\n`;
      recommendations.forEach(rec => {
        reportText += `- ${rec}\n`;
      });
    }

    return reportText;
  }
}

/**
 * React Hook: localStorage容量管理
 */
export function useStorageQuotaManager() {
  const manager = StorageQuotaManager.getInstance();
  
  return {
    getQuotaInfo: () => manager.getQuotaInfo(),
    getAllStorageItems: () => manager.getAllStorageItems(),
    shouldCleanup: () => manager.shouldCleanup(),
    performIntelligentCleanup: () => manager.performIntelligentCleanup(),
    getStorageReport: () => manager.getStorageReport(),
    startStorageMonitoring: (onQuotaChange?: (info: StorageQuotaInfo) => void) => 
      manager.startStorageMonitoring(onQuotaChange),
    generateUsageReport: () => manager.generateUsageReport(),
    formatBytes: StorageQuotaManager.formatBytes
  };
}

export const storageQuotaManager = StorageQuotaManager.getInstance();