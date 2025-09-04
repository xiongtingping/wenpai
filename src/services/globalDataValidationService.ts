/**
 * 全局数据验证服务
 * 在应用启动时自动检查和修复localStorage数据问题
 */

import { logger } from '@/utils/logger';

export class GlobalDataValidationService {
  private static readonly VALIDATION_KEY = 'data_validation_last_run';
  private static readonly VALIDATION_INTERVAL = 24 * 60 * 60 * 1000; // 24小时

  /**
   * 初始化数据验证服务
   */
  static initialize(): void {
    try {
      // 检查是否需要运行验证
      if (this.shouldRunValidation()) {
        logger.info('开始全局数据验证和修复...');
        this.performValidation();
        this.updateValidationTimestamp();
      }

      // 监听storage事件，处理跨标签页的数据同步
      this.setupStorageListener();
    } catch (error) {
      logger.error('初始化数据验证服务失败:', error);
    }
  }

  /**
   * 检查是否需要运行验证
   */
  private static shouldRunValidation(): boolean {
    try {
      const lastRun = localStorage.getItem(this.VALIDATION_KEY);
      if (!lastRun) return true;

      const lastRunTime = parseInt(lastRun, 10);
      const now = Date.now();
      
      return (now - lastRunTime) > this.VALIDATION_INTERVAL;
    } catch (error) {
      logger.warn('检查验证时间失败:', error);
      return true;
    }
  }

  /**
   * 执行数据验证和修复
   */
  private static performValidation(): void {
    try {
      let issuesFound = 0;
      let issuesFixed = 0;

      // 1. 检查和修复用户数据格式问题
      const userDataIssues = this.validateUserData();
      issuesFound += userDataIssues.found;
      issuesFixed += userDataIssues.fixed;

      // 2. 检查和清理过期数据
      const expiredDataIssues = this.cleanupExpiredData();
      issuesFound += expiredDataIssues.found;
      issuesFixed += expiredDataIssues.fixed;

      // 3. 检查和修复损坏的JSON数据
      const corruptedDataIssues = this.fixCorruptedData();
      issuesFound += corruptedDataIssues.found;
      issuesFixed += corruptedDataIssues.fixed;

      // 4. 清理重复或冲突的数据
      const duplicateDataIssues = this.cleanupDuplicateData();
      issuesFound += duplicateDataIssues.found;
      issuesFixed += duplicateDataIssues.fixed;

      logger.info(`数据验证完成: 发现 ${issuesFound} 个问题，修复 ${issuesFixed} 个问题`);

      if (issuesFixed > 0) {
        // 触发全局数据更新事件
        window.dispatchEvent(new CustomEvent('globalDataValidated', {
          detail: { issuesFound, issuesFixed }
        }));
      }
    } catch (error) {
      logger.error('执行数据验证失败:', error);
    }
  }

  /**
   * 验证用户数据
   */
  private static validateUserData(): { found: number; fixed: number } {
    let found = 0;
    let fixed = 0;

    const userDataKeys = [
      '_authing_user',
      'authing_user',
      'auth-storage',
      'wenpai:guest:session_info'
    ];

    userDataKeys.forEach(key => {
      try {
        const data = localStorage.getItem(key);
        if (!data) return;

        const parsed = JSON.parse(data);
        
        // 检查是否为数组格式（错误格式）
        if (Array.isArray(parsed)) {
          found++;
          
          // 尝试从数组中提取有效的用户对象
          const validUser = parsed.find(item => 
            typeof item === 'object' && 
            item !== null && 
            (item.id || item.user_id || item.sub)
          );

          if (validUser) {
            localStorage.setItem(key, JSON.stringify(validUser));
            fixed++;
            logger.info(`修复用户数据格式: ${key}`);
          } else {
            localStorage.removeItem(key);
            fixed++;
            logger.info(`删除无效用户数据: ${key}`);
          }
        }
        
        // 检查用户对象是否缺少必要字段
        else if (typeof parsed === 'object' && parsed !== null) {
          if (key.includes('user') && !parsed.id && !parsed.user_id && !parsed.sub) {
            found++;
            localStorage.removeItem(key);
            fixed++;
            logger.info(`删除不完整的用户数据: ${key}`);
          }
        }
      } catch (error) {
        found++;
        localStorage.removeItem(key);
        fixed++;
        logger.info(`删除损坏的用户数据: ${key}`);
      }
    });

    return { found, fixed };
  }

  /**
   * 清理过期数据
   */
  private static cleanupExpiredData(): { found: number; fixed: number } {
    let found = 0;
    let fixed = 0;

    try {
      const allKeys = Object.keys(localStorage);
      const now = Date.now();
      const oneWeekAgo = now - (7 * 24 * 60 * 60 * 1000);

      allKeys.forEach(key => {
        // 清理过期的访问时间记录
        if (key.startsWith('payment_center_access_time_')) {
          try {
            const timestamp = parseInt(localStorage.getItem(key) || '0', 10);
            if (timestamp < oneWeekAgo) {
              found++;
              localStorage.removeItem(key);
              fixed++;
              logger.info(`清理过期访问时间: ${key}`);
            }
          } catch (error) {
            found++;
            localStorage.removeItem(key);
            fixed++;
          }
        }

        // 清理其他过期数据
        if (key.startsWith('AMP_unsent') || key.startsWith('temp_')) {
          found++;
          localStorage.removeItem(key);
          fixed++;
          logger.info(`清理临时数据: ${key}`);
        }
      });
    } catch (error) {
      logger.error('清理过期数据失败:', error);
    }

    return { found, fixed };
  }

  /**
   * 修复损坏的JSON数据
   */
  private static fixCorruptedData(): { found: number; fixed: number } {
    let found = 0;
    let fixed = 0;

    try {
      const allKeys = Object.keys(localStorage);

      allKeys.forEach(key => {
        try {
          const data = localStorage.getItem(key);
          if (!data) return;

          // 尝试解析JSON
          JSON.parse(data);
        } catch (error) {
          // JSON解析失败，删除损坏的数据
          found++;
          localStorage.removeItem(key);
          fixed++;
          logger.info(`删除损坏的JSON数据: ${key}`);
        }
      });
    } catch (error) {
      logger.error('修复损坏数据失败:', error);
    }

    return { found, fixed };
  }

  /**
   * 清理重复或冲突的数据
   */
  private static cleanupDuplicateData(): { found: number; fixed: number } {
    let found = 0;
    let fixed = 0;

    try {
      // 检查是否有多个用户数据键存在
      const userDataKeys = ['_authing_user', 'authing_user', 'auth-storage'];
      const existingUserKeys = userDataKeys.filter(key => localStorage.getItem(key));

      if (existingUserKeys.length > 1) {
        found++;
        
        // 保留最新的或最完整的用户数据
        let bestKey = existingUserKeys[0];
        let bestData = null;

        existingUserKeys.forEach(key => {
          try {
            const data = JSON.parse(localStorage.getItem(key) || '{}');
            if (!bestData || (data.id && !bestData.id) || 
                (data.updated_at && (!bestData.updated_at || data.updated_at > bestData.updated_at))) {
              bestKey = key;
              bestData = data;
            }
          } catch (error) {
            // 忽略解析错误的数据
          }
        });

        // 删除其他重复的用户数据
        existingUserKeys.forEach(key => {
          if (key !== bestKey) {
            localStorage.removeItem(key);
            fixed++;
            logger.info(`删除重复的用户数据: ${key}`);
          }
        });
      }
    } catch (error) {
      logger.error('清理重复数据失败:', error);
    }

    return { found, fixed };
  }

  /**
   * 设置storage监听器
   */
  private static setupStorageListener(): void {
    window.addEventListener('storage', (event) => {
      // 处理跨标签页的数据同步
      if (event.key && event.key.includes('user')) {
        logger.info('检测到用户数据变化，触发验证');
        setTimeout(() => {
          this.performValidation();
        }, 1000);
      }
    });
  }

  /**
   * 更新验证时间戳 - 🔧 FIX: 确保存储为字符串格式
   */
  private static updateValidationTimestamp(): void {
    try {
      // 确保存储为字符串格式，符合数据验证器的期望
      const timestamp = Date.now().toString();
      localStorage.setItem(this.VALIDATION_KEY, timestamp);
      logger.debug(`更新验证时间戳: ${timestamp}`);
    } catch (error) {
      logger.warn('更新验证时间戳失败:', error);
    }
  }

  /**
   * 手动触发验证
   */
  static forceValidation(): void {
    logger.info('手动触发数据验证...');
    this.performValidation();
    this.updateValidationTimestamp();
  }

  /**
   * 检查当前数据健康状态
   */
  static checkDataHealth(): { isHealthy: boolean; issues: string[] } {
    const issues: string[] = [];

    try {
      // 检查用户数据
      const userDataKeys = ['_authing_user', 'authing_user', 'auth-storage'];
      userDataKeys.forEach(key => {
        const data = localStorage.getItem(key);
        if (data) {
          try {
            const parsed = JSON.parse(data);
            if (Array.isArray(parsed)) {
              issues.push(`用户数据格式错误: ${key} 是数组格式`);
            }
          } catch (error) {
            issues.push(`用户数据损坏: ${key} JSON解析失败`);
          }
        }
      });

      // 检查是否有过多的临时数据
      const allKeys = Object.keys(localStorage);
      const tempKeys = allKeys.filter(key => 
        key.startsWith('AMP_') || 
        key.startsWith('temp_') || 
        key.startsWith('payment_center_access_time_')
      );

      if (tempKeys.length > 10) {
        issues.push(`临时数据过多: ${tempKeys.length} 个临时键`);
      }

    } catch (error) {
      issues.push(`数据健康检查失败: ${error.message}`);
    }

    return {
      isHealthy: issues.length === 0,
      issues
    };
  }
}

export default GlobalDataValidationService;
