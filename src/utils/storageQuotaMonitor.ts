/**
 * 📊 localStorage配额监控器
 *
 * 功能:
 * - 实时监控localStorage使用量
 * - 配额预警机制
 * - 自动清理策略
 */

export interface StorageQuotaInfo {
  used: number;          // 已使用字节数
  total: number;         // 总配额(估算)
  usagePercent: number;  // 使用百分比
  remaining: number;     // 剩余空间
  itemCount: number;     // 项目数量
  largestItems: Array<{ key: string; size: number }>;
}

export class StorageQuotaMonitor {
  // 配额阈值 (5MB)
  private readonly QUOTA_WARNING_THRESHOLD = 5 * 1024 * 1024;
  // 估算的localStorage总配额 (10MB,浏览器实际可能更大)
  private readonly ESTIMATED_QUOTA = 10 * 1024 * 1024;

  /**
   * 获取localStorage使用情况
   */
  getQuotaInfo(): StorageQuotaInfo {
    let totalSize = 0;
    const items: Array<{ key: string; size: number }> = [];

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        const value = localStorage.getItem(key) || '';
        const size = new Blob([key, value]).size;
        totalSize += size;
        items.push({ key, size });
      }
    }

    // 按大小排序
    items.sort((a, b) => b.size - a.size);

    return {
      used: totalSize,
      total: this.ESTIMATED_QUOTA,
      usagePercent: (totalSize / this.ESTIMATED_QUOTA) * 100,
      remaining: this.ESTIMATED_QUOTA - totalSize,
      itemCount: localStorage.length,
      largestItems: items.slice(0, 10) // 前10个最大项
    };
  }

  /**
   * 检查配额并警告
   */
  checkAndWarn(): void {
    const info = this.getQuotaInfo();

    if (info.used > this.QUOTA_WARNING_THRESHOLD) {
      console.warn('⚠️ localStorage配额警告:', {
        used: `${(info.used / 1024 / 1024).toFixed(2)}MB`,
        usagePercent: `${info.usagePercent.toFixed(1)}%`,
        largestItems: info.largestItems
      });
    }
  }

  /**
   * 自动清理最大项 (紧急措施)
   */
  emergencyCleanup(targetSizeMB: number = 2): number {
    const info = this.getQuotaInfo();
    const targetBytes = targetSizeMB * 1024 * 1024;
    let freedBytes = 0;

    console.warn('🚨 执行紧急清理，目标释放:', `${targetSizeMB}MB`);

    for (const item of info.largestItems) {
      if (freedBytes >= targetBytes) break;

      // 跳过关键数据
      if (this.isProtectedKey(item.key)) continue;

      localStorage.removeItem(item.key);
      freedBytes += item.size;
      console.log(`🗑️ 已删除: ${item.key} (${(item.size / 1024).toFixed(2)}KB)`);
    }

    console.log(`✅ 紧急清理完成，释放: ${(freedBytes / 1024 / 1024).toFixed(2)}MB`);
    return freedBytes;
  }

  /**
   * 判断是否为受保护的键 (不可删除)
   */
  private isProtectedKey(key: string): boolean {
    const protectedPatterns = [
      'wenpai-unified-store',  // Zustand persist
      '_authing_',             // 认证Token
      'user_',                 // 用户数据
      'subscription'           // 订阅信息
    ];

    return protectedPatterns.some(pattern => key.includes(pattern));
  }

  /**
   * 格式化大小显示
   */
  formatSize(bytes: number): string {
    if (bytes < 1024) return `${bytes}B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)}KB`;
    return `${(bytes / 1024 / 1024).toFixed(2)}MB`;
  }
}

// 导出单例
export const storageQuotaMonitor = new StorageQuotaMonitor();

// 定期检查 (每5分钟)
setInterval(() => {
  storageQuotaMonitor.checkAndWarn();
}, 5 * 60 * 1000);
