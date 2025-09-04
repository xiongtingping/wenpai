/**
 * 支付数据清理服务
 * 解决支付成功后localStorage数据验证失败的问题
 */

import { logger } from '@/utils/logger';

export class PaymentDataCleanupService {
  /**
   * 清理支付相关的localStorage数据
   */
  static cleanupPaymentData(userId?: string): void {
    try {
      const keysToClean = [
        // 认证相关的旧数据
        '_authing_user',
        'authing_user',
        'auth-storage',
        
        // 访客会话信息
        'wenpai:guest:session_info',
        
        // 支付中心访问时间
        ...(userId ? [`payment_center_access_time_${userId}`] : []),
        
        // 其他可能导致验证失败的键
        'globalSettings',
        'auth_retry_guard',
        'auth_code_guard'
      ];

      let cleanedCount = 0;
      
      keysToClean.forEach(key => {
        try {
          if (localStorage.getItem(key)) {
            localStorage.removeItem(key);
            cleanedCount++;
            logger.info(`清理localStorage键: ${key}`);
          }
        } catch (error) {
          logger.warn(`清理localStorage键失败: ${key}`, error);
        }
      });

      // 清理所有以特定前缀开头的键
      const prefixesToClean = [
        'AMP_unsent',
        'payment_center_access_time_',
        'wenpai:guest:',
        '_authing_',
        'authing_'
      ];

      const allKeys = Object.keys(localStorage);
      allKeys.forEach(key => {
        const shouldClean = prefixesToClean.some(prefix => key.startsWith(prefix));
        if (shouldClean) {
          try {
            localStorage.removeItem(key);
            cleanedCount++;
            logger.info(`清理前缀匹配的localStorage键: ${key}`);
          } catch (error) {
            logger.warn(`清理前缀匹配的localStorage键失败: ${key}`, error);
          }
        }
      });

      if (cleanedCount > 0) {
        logger.info(`支付数据清理完成，共清理 ${cleanedCount} 个键`);
        
        // 触发storage事件，通知其他组件数据已更新
        window.dispatchEvent(new Event('storage'));
      }
    } catch (error) {
      logger.error('支付数据清理失败:', error);
    }
  }

  /**
   * 清理无效的用户数据格式
   */
  static cleanupInvalidUserData(): void {
    try {
      const userDataKeys = [
        '_authing_user',
        'authing_user',
        'auth-storage'
      ];

      userDataKeys.forEach(key => {
        try {
          const data = localStorage.getItem(key);
          if (data) {
            // 尝试解析数据
            const parsed = JSON.parse(data);
            
            // 检查数据格式是否有效
            if (this.isInvalidUserData(parsed)) {
              localStorage.removeItem(key);
              logger.info(`清理无效用户数据: ${key}`);
            }
          }
        } catch (error) {
          // 如果解析失败，直接删除
          localStorage.removeItem(key);
          logger.info(`清理损坏的用户数据: ${key}`);
        }
      });
    } catch (error) {
      logger.error('清理无效用户数据失败:', error);
    }
  }

  /**
   * 检查用户数据是否无效
   */
  private static isInvalidUserData(data: any): boolean {
    // 检查是否为数组（通常用户数据应该是对象）
    if (Array.isArray(data)) {
      return true;
    }

    // 检查是否缺少必要字段
    if (typeof data === 'object' && data !== null) {
      // 如果是用户对象但缺少基本字段
      if (!data.id && !data.user_id && !data.sub) {
        return true;
      }
    }

    return false;
  }

  /**
   * 修复localStorage数据格式
   */
  static fixStorageDataFormat(): void {
    try {
      const allKeys = Object.keys(localStorage);
      let fixedCount = 0;

      allKeys.forEach(key => {
        try {
          const data = localStorage.getItem(key);
          if (!data) return;

          // 尝试解析数据
          const parsed = JSON.parse(data);

          // 修复特定格式问题
          let fixed = false;
          let fixedData = parsed;

          // 修复用户数据格式
          if (key.includes('user') && Array.isArray(parsed)) {
            // 如果用户数据被错误地存储为数组，尝试提取第一个有效对象
            const validUser = parsed.find(item => 
              typeof item === 'object' && 
              item !== null && 
              (item.id || item.user_id || item.sub)
            );
            
            if (validUser) {
              fixedData = validUser;
              fixed = true;
            } else {
              // 如果没有有效数据，删除该键
              localStorage.removeItem(key);
              logger.info(`删除无效的用户数据数组: ${key}`);
              return;
            }
          }

          // 修复会话信息格式
          if (key.includes('session_info') && typeof parsed !== 'object') {
            localStorage.removeItem(key);
            logger.info(`删除无效的会话信息: ${key}`);
            return;
          }

          // 如果数据被修复，重新存储
          if (fixed) {
            localStorage.setItem(key, JSON.stringify(fixedData));
            fixedCount++;
            logger.info(`修复localStorage数据格式: ${key}`);
          }
        } catch (error) {
          // 如果处理失败，删除该键
          localStorage.removeItem(key);
          logger.info(`删除损坏的数据: ${key}`);
        }
      });

      if (fixedCount > 0) {
        logger.info(`数据格式修复完成，共修复 ${fixedCount} 个键`);
      }
    } catch (error) {
      logger.error('修复localStorage数据格式失败:', error);
    }
  }

  /**
   * 执行完整的支付后数据清理
   */
  static performCompleteCleanup(userId?: string): void {
    logger.info('开始执行支付后数据清理...');

    // 1. 清理支付相关数据
    this.cleanupPaymentData(userId);

    // 2. 清理无效用户数据
    this.cleanupInvalidUserData();

    // 3. 修复数据格式
    this.fixStorageDataFormat();

    // 4. 强制清理所有验证失败的数据
    this.forceCleanupValidationFailures();

    // 5. 优化事件分发，消除上下文隔离问题
    // 使用环境检查和优化的事件分发
    const dispatchCleanupEvents = () => {
      if (typeof window !== 'undefined') {
        try {
          window.dispatchEvent(new Event('storage'));
          window.dispatchEvent(new CustomEvent('userDataUpdated'));
          window.dispatchEvent(new CustomEvent('paymentDataCleaned', {
            detail: { userId, timestamp: Date.now() }
          }));
        } catch (error) {
          logger.warn('事件分发失败:', error);
        }
      }
    };
    
    // 使用requestAnimationFrame替代setTimeout
    if (typeof requestAnimationFrame !== 'undefined') {
      requestAnimationFrame(dispatchCleanupEvents);
    } else {
      dispatchCleanupEvents();
    }

    logger.info('支付后数据清理完成');
  }

  /**
   * 强制清理所有验证失败的数据
   */
  static forceCleanupValidationFailures(): void {
    try {
      const problematicKeys = [
        '_authing_user',
        'authing_user',
        'auth-storage',
        'wenpai:guest:session_info'
      ];

      let cleanedCount = 0;

      problematicKeys.forEach(key => {
        try {
          const data = localStorage.getItem(key);
          if (data) {
            const parsed = JSON.parse(data);

            // 如果是数组格式，直接删除
            if (Array.isArray(parsed)) {
              localStorage.removeItem(key);
              cleanedCount++;
              logger.info(`强制清理数组格式数据: ${key}`);
            }
            // 如果是无效对象，也删除
            else if (typeof parsed === 'object' && parsed !== null) {
              if (key.includes('user') && !parsed.id && !parsed.user_id && !parsed.sub) {
                localStorage.removeItem(key);
                cleanedCount++;
                logger.info(`强制清理无效用户数据: ${key}`);
              }
            }
          }
        } catch (error) {
          // JSON解析失败，直接删除
          localStorage.removeItem(key);
          cleanedCount++;
          logger.info(`强制清理损坏数据: ${key}`);
        }
      });

      // 清理所有以payment_center_access_time_开头的键
      const allKeys = Object.keys(localStorage);
      allKeys.forEach(key => {
        if (key.startsWith('payment_center_access_time_')) {
          try {
            const data = localStorage.getItem(key);
            if (data) {
              const parsed = JSON.parse(data);
              if (Array.isArray(parsed)) {
                localStorage.removeItem(key);
                cleanedCount++;
                logger.info(`强制清理支付访问时间数组: ${key}`);
              }
            }
          } catch (error) {
            localStorage.removeItem(key);
            cleanedCount++;
            logger.info(`强制清理损坏的支付访问时间: ${key}`);
          }
        }
      });

      if (cleanedCount > 0) {
        logger.info(`强制清理完成，共清理 ${cleanedCount} 个验证失败的数据`);
      }
    } catch (error) {
      logger.error('强制清理验证失败数据时出错:', error);
    }
  }

  /**
   * 检查是否需要清理数据
   */
  static shouldCleanupData(): boolean {
    try {
      const problematicKeys = [
        '_authing_user',
        'authing_user',
        'wenpai:guest:session_info',
        'auth-storage'
      ];

      return problematicKeys.some(key => {
        try {
          const data = localStorage.getItem(key);
          if (!data) return false;

          const parsed = JSON.parse(data);
          
          // 检查是否为数组格式（通常表示数据格式有问题）
          if (Array.isArray(parsed)) {
            return true;
          }

          // 检查是否为无效对象
          if (typeof parsed === 'object' && parsed !== null) {
            if (key.includes('user') && !parsed.id && !parsed.user_id && !parsed.sub) {
              return true;
            }
          }

          return false;
        } catch (error) {
          // 解析失败也表示需要清理
          return true;
        }
      });
    } catch (error) {
      logger.error('检查数据清理需求失败:', error);
      return false;
    }
  }
}

export default PaymentDataCleanupService;
