import { logger } from '@/utils/logger';
import { secureStorage } from '@/lib/security';
import { UnifiedStorageKeyManager } from '@/lib/unifiedStorageManager';
/**
 * 
 * 用于在页面刷新后恢复支付状态和配置
 * 所有敏感支付数据使用加密存储
 */

export interface PaymentStatusData {
  checkoutId: string;
  status: 'pending' | 'processing' | 'paid' | 'failed' | 'expired' | 'cancelled';
  message: string;
  progress: number;
  amount?: number;
  currency?: string;
  paidAt?: string;
  error?: string;
  lastChecked?: string;
  retryCount?: number;
  estimatedTime?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentConfig {
  autoRefresh: boolean;
  refreshInterval: number;
  maxRetries: number;
  enableNotifications: boolean;
  enableSound: boolean;
  showAdvancedInfo: boolean;
}

class PaymentStatusService {
  private currentUserId: string | null = null;

  /**
   * ✅ FIXED: 用户数据隔离 - 设置当前用户ID
   */
  setCurrentUser(userId: string | null): void {
    this.currentUserId = userId;
    console.log(`🔑 支付serviceuser切换: ${userId || 'guest'}`);
  }

  /**
   * 
   */
  private getStorageKey(type: 'status' | 'config' | 'history'): string {
    if (this.currentUserId) {
      return UnifiedStorageKeyManager.generateUserDataKey(this.currentUserId, 'payment', type);
    } else {
      // 访客模式使用临时会话ID
      const guestSessionId = this.getOrCreateGuestSessionId();
      return UnifiedStorageKeyManager.generateGuestDataKey(guestSessionId, 'payment', type);
    }
  }

  /**
   * 获取或创建访客会话ID
   */
  private getOrCreateGuestSessionId(): string {
    const sessionKey = 'wenpai:guest:session';
    let sessionId = localStorage.getItem(sessionKey);
    
    if (!sessionId) {
      sessionId = `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem(sessionKey, sessionId);
    }
    
    return sessionId;
  }

  /**
   * 保存支付状态
   */
  savePaymentStatus(checkoutId: string, statusData: Partial<PaymentStatusData>): void {
    try {
      const existingData = this.getPaymentStatus(checkoutId);
      const now = new Date().toISOString();
      
      const paymentData: PaymentStatusData = {
        checkoutId,
        status: 'pending',
        message: '等待支付...',
        progress: 0,
        createdAt: now,
        ...existingData,
        ...statusData,
        updatedAt: now,
      };

      const allPayments = this.getAllPaymentStatuses();
      allPayments[checkoutId] = paymentData;
      
      // 
      secureStorage.setItem(this.getStorageKey('status'), allPayments, true);
      
      // 添加到历史记录
      this.addToHistory(paymentData);
      
      console.log('支付statesaved:', paymentData);
    } catch (error) {
      console.error('saving支付statefailed:', error);
    }
  }

  /**
   * 获取支付状态
   */
  getPaymentStatus(checkoutId: string): PaymentStatusData | null {
    try {
      const allPayments = this.getAllPaymentStatuses();
      return allPayments[checkoutId] || null;
    } catch (error) {
      console.error('getting支付statefailed:', error);
      return null;
    }
  }

  /**
   * 获取所有支付状态
   */
  getAllPaymentStatuses(): Record<string, PaymentStatusData> {
    try {
      // 
      const data = secureStorage.getItem<Record<string, PaymentStatusData>>(this.getStorageKey('status'), true);
      return data || {};
    } catch (error) {
      console.error('getting所has支付statefailed:', error);
      return {};
    }
  }

  /**
   * 删除支付状态
   */
  removePaymentStatus(checkoutId: string): void {
    try {
      const allPayments = this.getAllPaymentStatuses();
      delete allPayments[checkoutId];
      // 
      secureStorage.setItem(this.getStorageKey('status'), allPayments, true);
      console.log('支付statedeleted:', checkoutId);
    } catch (error) {
      console.error('deleting支付statefailed:', error);
    }
  }

  /**
   * 清理过期的支付状态
   */
  cleanupExpiredStatuses(maxAgeHours: number = 24): void {
    try {
      const allPayments = this.getAllPaymentStatuses();
      const now = new Date();
      const maxAge = maxAgeHours * 60 * 60 * 1000; // 转换为毫秒
      
      let cleanedCount = 0;
      Object.keys(allPayments).forEach(checkoutId => {
        const payment = allPayments[checkoutId];
        const createdAt = new Date(payment.createdAt);
        
        if (now.getTime() - createdAt.getTime() > maxAge) {
          delete allPayments[checkoutId];
          cleanedCount++;
        }
      });
      
      if (cleanedCount > 0) {
        // 
      secureStorage.setItem(this.getStorageKey('status'), allPayments, true);
        console.log(`alreadycleaning ${cleanedCount} unitsexpired的支付state`);
      }
    } catch (error) {
      console.error('cleaningexpired支付statefailed:', error);
    }
  }

  /**
   * 获取活跃的支付状态
   */
  getActivePaymentStatuses(): PaymentStatusData[] {
    try {
      const allPayments = this.getAllPaymentStatuses();
      const now = new Date();
      const maxAge = 2 * 60 * 60 * 1000; // 2小时内的支付状态
      
      return Object.values(allPayments).filter(payment => {
        const createdAt = new Date(payment.createdAt);
        return now.getTime() - createdAt.getTime() <= maxAge && 
               payment.status !== 'paid' && 
               payment.status !== 'failed' && 
               payment.status !== 'expired';
      });
    } catch (error) {
      console.error('getting活跃支付statefailed:', error);
      return [];
    }
  }

  /**
   * 保存支付配置
   */
  savePaymentConfig(config: Partial<PaymentConfig>): void {
    try {
      const existingConfig = this.getPaymentConfig();
      const newConfig: PaymentConfig = {
        ...existingConfig, // 先应用现有配置
        ...config, // 再应用新配置，避免重复属性
      };
      
      // 
      secureStorage.setItem(this.getStorageKey('config'), newConfig, true);
      console.log('支付configurationsaved:', newConfig);
    } catch (error) {
      console.error('saving支付configurationfailed:', error);
    }
  }

  /**
   * 获取支付配置
   */
  getPaymentConfig(): PaymentConfig {
    try {
      // 
      const data = secureStorage.getItem<PaymentConfig>(this.getStorageKey('config'), true);
      if (data) {
        return data;
      }
    } catch (error) {
      console.error('getting支付configurationfailed:', error);
    }
    
    // 返回默认配置
    return {
      autoRefresh: true,
      refreshInterval: 3000,
      maxRetries: 10,
      enableNotifications: true,
      enableSound: true,
      showAdvancedInfo: false,
    };
  }

  /**
   * 添加到历史记录
   */
  private addToHistory(paymentData: PaymentStatusData): void {
    try {
      const history = this.getPaymentHistory();
      
      // 限制历史记录数量
      const maxHistory = 50;
      if (history.length >= maxHistory) {
        history.shift(); // 移除最旧的记录
      }
      
      history.push({
        ...paymentData,
        id: `${paymentData.checkoutId}_${Date.now()}`,
      });
      
      // 
      secureStorage.setItem(this.getStorageKey('history'), history, true);
    } catch (error) {
      console.error('adding到历史记录failed:', error);
    }
  }

  /**
   * 获取支付历史
   */
  getPaymentHistory(): Array<PaymentStatusData & { id: string }> {
    try {
      // 
      const data = secureStorage.getItem<Array<PaymentStatusData & { id: string }>>(this.getStorageKey('history'), true);
      return data || [];
    } catch (error) {
      console.error('getting支付历史failed:', error);
      return [];
    }
  }

  /**
   * 清理历史记录
   */
  clearPaymentHistory(): void {
    try {
      // 
      secureStorage.removeItem(this.getStorageKey('history'));
      console.log('支付历史alreadycleaning');
    } catch (error) {
      console.error('cleaning支付历史failed:', error);
    }
  }

  /**
   * 获取支付统计信息
   */
  getPaymentStats(): {
    total: number;
    paid: number;
    failed: number;
    pending: number;
    expired: number;
  } {
    try {
      const allPayments = this.getAllPaymentStatuses();
      const stats = {
        total: 0,
        paid: 0,
        failed: 0,
        pending: 0,
        expired: 0,
      };
      
      Object.values(allPayments).forEach(payment => {
        stats.total++;
        switch (payment.status) {
          case 'paid':
            stats.paid++;
            break;
          case 'failed':
            stats.failed++;
            break;
          case 'expired':
            stats.expired++;
            break;
          case 'pending':
          case 'processing':
            stats.pending++;
            break;
        }
      });
      
      return stats;
    } catch (error) {
      console.error('getting支付统计failed:', error);
      return {
        total: 0,
        paid: 0,
        failed: 0,
        pending: 0,
        expired: 0,
      };
    }
  }

  /**
   * 导出支付数据
   */
  exportPaymentData(): string {
    try {
      const data = {
        payments: this.getAllPaymentStatuses(),
        config: this.getPaymentConfig(),
        history: this.getPaymentHistory(),
        stats: this.getPaymentStats(),
        exportedAt: new Date().toISOString(),
      };
      
      return JSON.stringify(data, null, 2);
    } catch (error) {
      console.error('exporting支付datafailed:', error);
      return '';
    }
  }

  /**
   * 导入支付数据
   */
  importPaymentData(data: string): boolean {
    try {
      const parsedData = JSON.parse(data);

      
      if (parsedData.payments) {
        // 
        secureStorage.setItem(this.getStorageKey('status'), parsedData.payments, true);
      }

      if (parsedData.config) {
        // 
        secureStorage.setItem(this.getStorageKey('config'), parsedData.config, true);
      }

      if (parsedData.history) {
        // 
        secureStorage.setItem(this.getStorageKey('history'), parsedData.history, true);
      }
      
      console.log('支付dataimportingsuccess');
      return true;
    } catch (error) {
      console.error('importing支付datafailed:', error);
      return false;
    }
  }

  /**
   * 重置所有支付数据
   */
  resetAllData(): void {
    try {
      // 
      secureStorage.removeItem(this.getStorageKey('status'));
      secureStorage.removeItem(this.getStorageKey('config'));
      // 
      secureStorage.removeItem(this.getStorageKey('history'));
      console.log('所has支付dataalreadyresetting');
    } catch (error) {
      console.error('resetting支付datafailed:', error);
    }
  }

  /**
   * ✅ FIXED: 用户数据隔离 - 清理指定用户的支付数据
   */
  clearUserPaymentData(userId: string): number {
    let cleanedCount = 0;
    try {
      const keys = Object.keys(localStorage);
      const userPaymentKeys = keys.filter(key =>
        key.startsWith('wenpai_payment_') && key.endsWith(`_${userId}`)
      );

      userPaymentKeys.forEach(key => {
        localStorage.removeItem(key);
        cleanedCount++;
      });

      logger.debug('✅ 清理用户支付数据完成: ${userId}, 清理了 ${cleanedCount} 项');
    } catch (error) {
      console.error(`❌ cleaninguser支付datafailed: ${userId}`, error);
    }

    return cleanedCount;
  }
}

// 创建单例实例
export const paymentStatusService = new PaymentStatusService();

// 定期清理过期数据
setInterval(() => {
  paymentStatusService.cleanupExpiredStatuses();
}, 60 * 60 * 1000); // 每小时清理一次
