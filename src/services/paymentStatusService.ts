/**
 * 支付状态持久化服务
 * 用于在页面刷新后恢复支付状态和配置
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
  private readonly STORAGE_KEY = 'wenpai_payment_status';
  private readonly CONFIG_KEY = 'wenpai_payment_config';
  private readonly HISTORY_KEY = 'wenpai_payment_history';

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
      
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(allPayments));
      
      // 添加到历史记录
      this.addToHistory(paymentData);
      
      console.log('支付状态已保存:', paymentData);
    } catch (error) {
      console.error('保存支付状态失败:', error);
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
      console.error('获取支付状态失败:', error);
      return null;
    }
  }

  /**
   * 获取所有支付状态
   */
  getAllPaymentStatuses(): Record<string, PaymentStatusData> {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      return data ? JSON.parse(data) : {};
    } catch (error) {
      console.error('获取所有支付状态失败:', error);
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
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(allPayments));
      console.log('支付状态已删除:', checkoutId);
    } catch (error) {
      console.error('删除支付状态失败:', error);
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
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(allPayments));
        console.log(`已清理 ${cleanedCount} 个过期的支付状态`);
      }
    } catch (error) {
      console.error('清理过期支付状态失败:', error);
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
      console.error('获取活跃支付状态失败:', error);
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
        autoRefresh: true,
        refreshInterval: 3000,
        maxRetries: 10,
        enableNotifications: true,
        enableSound: true,
        showAdvancedInfo: false,
        ...existingConfig,
        ...config,
      };
      
      localStorage.setItem(this.CONFIG_KEY, JSON.stringify(newConfig));
      console.log('支付配置已保存:', newConfig);
    } catch (error) {
      console.error('保存支付配置失败:', error);
    }
  }

  /**
   * 获取支付配置
   */
  getPaymentConfig(): PaymentConfig {
    try {
      const data = localStorage.getItem(this.CONFIG_KEY);
      if (data) {
        return JSON.parse(data);
      }
    } catch (error) {
      console.error('获取支付配置失败:', error);
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
      
      localStorage.setItem(this.HISTORY_KEY, JSON.stringify(history));
    } catch (error) {
      console.error('添加到历史记录失败:', error);
    }
  }

  /**
   * 获取支付历史
   */
  getPaymentHistory(): Array<PaymentStatusData & { id: string }> {
    try {
      const data = localStorage.getItem(this.HISTORY_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('获取支付历史失败:', error);
      return [];
    }
  }

  /**
   * 清理历史记录
   */
  clearPaymentHistory(): void {
    try {
      localStorage.removeItem(this.HISTORY_KEY);
      console.log('支付历史已清理');
    } catch (error) {
      console.error('清理支付历史失败:', error);
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
      console.error('获取支付统计失败:', error);
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
      console.error('导出支付数据失败:', error);
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
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(parsedData.payments));
      }
      
      if (parsedData.config) {
        localStorage.setItem(this.CONFIG_KEY, JSON.stringify(parsedData.config));
      }
      
      if (parsedData.history) {
        localStorage.setItem(this.HISTORY_KEY, JSON.stringify(parsedData.history));
      }
      
      console.log('支付数据导入成功');
      return true;
    } catch (error) {
      console.error('导入支付数据失败:', error);
      return false;
    }
  }

  /**
   * 重置所有支付数据
   */
  resetAllData(): void {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
      localStorage.removeItem(this.CONFIG_KEY);
      localStorage.removeItem(this.HISTORY_KEY);
      console.log('所有支付数据已重置');
    } catch (error) {
      console.error('重置支付数据失败:', error);
    }
  }
}

// 创建单例实例
export const paymentStatusService = new PaymentStatusService();

// 定期清理过期数据
setInterval(() => {
  paymentStatusService.cleanupExpiredStatuses();
}, 60 * 60 * 1000); // 每小时清理一次 