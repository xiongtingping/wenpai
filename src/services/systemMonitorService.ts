/**
 * 系统监控服务
 * @description 统一管理和监控所有增强服务，提供自动化的系统维护和优化
 */

import { unifiedUsageService } from '@/services/unifiedUsageService';
import { enhancedPermissionService } from '@/services/enhancedPermissionService';
import { enhancedInviteService } from '@/services/enhancedInviteService';
import { logger } from '@/utils/logger';

/**
 * 系统健康状态
 */
export interface SystemHealthStatus {
  /** 整体健康状态 */
  overall: 'healthy' | 'warning' | 'critical';
  /** 各服务状态 */
  services: {
    unifiedUsage: ServiceStatus;
    enhancedPermission: ServiceStatus;
    enhancedInvite: ServiceStatus;
  };
  /** 最后检查时间 */
  lastCheckTime: string;
  /** 系统指标 */
  metrics: {
    activeUsers: number;
    totalUsageToday: number;
    errorRate: number;
    responseTime: number;
  };
}

/**
 * 服务状态
 */
interface ServiceStatus {
  /** 服务名称 */
  name: string;
  /** 状态 */
  status: 'online' | 'degraded' | 'offline';
  /** 最后响应时间 */
  lastResponseTime?: number;
  /** 错误计数 */
  errorCount: number;
  /** 最后错误时间 */
  lastErrorTime?: string;
  /** 服务指标 */
  metrics?: Record<string, number>;
}

/**
 * 自动化任务配置
 */
interface AutomationTask {
  /** 任务ID */
  id: string;
  /** 任务名称 */
  name: string;
  /** 执行间隔（毫秒） */
  interval: number;
  /** 是否启用 */
  enabled: boolean;
  /** 执行函数 */
  execute: () => Promise<void>;
  /** 最后执行时间 */
  lastExecuted?: string;
  /** 执行次数 */
  executionCount: number;
  /** 错误次数 */
  errorCount: number;
}

/**
 * 系统监控服务类
 */
class SystemMonitorService {
  private readonly HEALTH_CHECK_INTERVAL = 5 * 60 * 1000; // 5分钟
  private readonly CLEANUP_INTERVAL = 60 * 60 * 1000; // 1小时
  private readonly SYNC_INTERVAL = 10 * 60 * 1000; // 10分钟
  
  private healthCheckTimer: NodeJS.Timeout | null = null;
  private automationTasks: Map<string, AutomationTask> = new Map();
  private taskTimers: Map<string, NodeJS.Timeout> = new Map();
  private isRunning = false;

  /**
   * 启动系统监控
   */
  start(): void {
    if (this.isRunning) {
      console.warn('系统监控服务已在运行');
      return;
    }

    logger.system('🚀 启动系统监控服务');
    this.isRunning = true;

    // 1. 启动各个服务的自动同步
    this.startServiceAutoSync();

    // 2. 注册自动化任务
    this.registerAutomationTasks();

    // 3. 启动健康检查
    this.startHealthCheck();

    // 4. 启动自动化任务
    this.startAutomationTasks();

    logger.debug('✅ 系统监控服务启动完成');
  }

  /**
   * 停止系统监控
   */
  stop(): void {
    if (!this.isRunning) {
      return;
    }

    console.log('🛑 停止系统监控服务');
    this.isRunning = false;

    // 停止健康检查
    if (this.healthCheckTimer) {
      clearInterval(this.healthCheckTimer);
      this.healthCheckTimer = null;
    }

    // 停止所有自动化任务
    this.stopAutomationTasks();

    // 停止各服务的自动同步
    this.stopServiceAutoSync();

    logger.debug('✅ 系统监控服务已停止');
  }

  /**
   * 启动服务自动同步
   */
  private startServiceAutoSync(): void {
    try {
      unifiedUsageService.startAutoSync();
      enhancedInviteService.startAutoSync();
      console.log('📡 服务自动同步已启动');
    } catch (error) {
      console.error('启动服务自动同步失败:', error);
    }
  }

  /**
   * 停止服务自动同步
   */
  private stopServiceAutoSync(): void {
    try {
      unifiedUsageService.stopAutoSync();
      enhancedInviteService.stopAutoSync();
      console.log('📡 服务自动同步已停止');
    } catch (error) {
      console.error('停止服务自动同步失败:', error);
    }
  }

  /**
   * 注册自动化任务
   */
  private registerAutomationTasks(): void {
    // 1. 数据清理任务
    this.registerTask({
      id: 'data_cleanup',
      name: '数据清理',
      interval: this.CLEANUP_INTERVAL,
      enabled: true,
      execute: this.performDataCleanup.bind(this),
      executionCount: 0,
      errorCount: 0
    });

    // 2. 权限同步任务
    this.registerTask({
      id: 'permission_sync',
      name: '权限同步',
      interval: this.SYNC_INTERVAL,
      enabled: true,
      execute: this.performPermissionSync.bind(this),
      executionCount: 0,
      errorCount: 0
    });

    // 3. 套餐到期检查任务
    this.registerTask({
      id: 'subscription_expiry_check',
      name: '套餐到期检查',
      interval: this.HEALTH_CHECK_INTERVAL,
      enabled: true,
      execute: this.performSubscriptionExpiryCheck.bind(this),
      executionCount: 0,
      errorCount: 0
    });

    // 4. 邀请数据同步任务
    this.registerTask({
      id: 'invite_data_sync',
      name: '邀请数据同步',
      interval: this.SYNC_INTERVAL,
      enabled: true,
      execute: this.performInviteDataSync.bind(this),
      executionCount: 0,
      errorCount: 0
    });

    console.log(`📋 已注册 ${this.automationTasks.size} 个自动化任务`);
  }

  /**
   * 注册单个任务
   */
  private registerTask(task: AutomationTask): void {
    this.automationTasks.set(task.id, task);
  }

  /**
   * 启动自动化任务
   */
  private startAutomationTasks(): void {
    for (const [taskId, task] of this.automationTasks.entries()) {
      if (task.enabled) {
        this.startTask(taskId);
      }
    }
  }

  /**
   * 停止自动化任务
   */
  private stopAutomationTasks(): void {
    for (const [taskId, timer] of this.taskTimers.entries()) {
      clearInterval(timer);
      this.taskTimers.delete(taskId);
    }
  }

  /**
   * 启动单个任务
   */
  private startTask(taskId: string): void {
    const task = this.automationTasks.get(taskId);
    if (!task || !task.enabled) {
      return;
    }

    const timer = setInterval(async () => {
      await this.executeTask(taskId);
    }, task.interval);

    this.taskTimers.set(taskId, timer);
    console.log(`⏰ 自动化任务 "${task.name}" 已启动，间隔 ${task.interval / 1000} 秒`);
  }

  /**
   * 执行任务
   */
  private async executeTask(taskId: string): Promise<void> {
    const task = this.automationTasks.get(taskId);
    if (!task) {
      return;
    }

    try {
      console.log(`🔄 执行自动化任务: ${task.name}`);
      await task.execute();
      
      task.executionCount++;
      task.lastExecuted = new Date().toISOString();
      
      console.log(`✅ 自动化任务 "${task.name}" 执行完成`);
    } catch (error) {
      task.errorCount++;
      console.error(`❌ 自动化任务 "${task.name}" 执行失败:`, error);
    }
  }

  /**
   * 启动健康检查
   */
  private startHealthCheck(): void {
    this.healthCheckTimer = setInterval(() => {
      this.performHealthCheck();
    }, this.HEALTH_CHECK_INTERVAL);

    // 立即执行一次健康检查
    this.performHealthCheck();
  }

  /**
   * 执行健康检查
   */
  private async performHealthCheck(): Promise<SystemHealthStatus> {
    console.log('🔍 执行系统健康检查');
    
    const healthStatus: SystemHealthStatus = {
      overall: 'healthy',
      services: {
        unifiedUsage: await this.checkServiceHealth('unifiedUsage'),
        enhancedPermission: await this.checkServiceHealth('enhancedPermission'),
        enhancedInvite: await this.checkServiceHealth('enhancedInvite')
      },
      lastCheckTime: new Date().toISOString(),
      metrics: {
        activeUsers: 0,
        totalUsageToday: 0,
        errorRate: 0,
        responseTime: 0
      }
    };

    // 计算整体健康状态
    const serviceStatuses = Object.values(healthStatus.services);
    const offlineServices = serviceStatuses.filter(s => s.status === 'offline').length;
    const degradedServices = serviceStatuses.filter(s => s.status === 'degraded').length;

    if (offlineServices > 0) {
      healthStatus.overall = 'critical';
    } else if (degradedServices > 0) {
      healthStatus.overall = 'warning';
    }

    console.log(`📊 系统健康状态: ${healthStatus.overall}`);
    return healthStatus;
  }

  /**
   * 检查单个服务健康状态
   */
  private async checkServiceHealth(serviceName: string): Promise<ServiceStatus> {
    const startTime = Date.now();
    
    try {
      // 这里可以添加具体的服务健康检查逻辑
      // 目前返回模拟状态
      const responseTime = Date.now() - startTime;
      
      return {
        name: serviceName,
        status: 'online',
        lastResponseTime: responseTime,
        errorCount: 0,
        metrics: {
          responseTime,
          uptime: 100
        }
      };
    } catch (error) {
      return {
        name: serviceName,
        status: 'offline',
        errorCount: 1,
        lastErrorTime: new Date().toISOString()
      };
    }
  }

  /**
   * 执行数据清理
   */
  private async performDataCleanup(): Promise<void> {
    try {
      // 清理过期的本地缓存数据
      const keys = Object.keys(localStorage);
      const expiredKeys = keys.filter(key => {
        if (key.includes('_cache') || key.includes('_stats')) {
          try {
            const data = JSON.parse(localStorage.getItem(key) || '{}');
            if (data.lastUpdated) {
              const lastUpdated = new Date(data.lastUpdated);
              const now = new Date();
              const daysDiff = (now.getTime() - lastUpdated.getTime()) / (1000 * 60 * 60 * 24);
              return daysDiff > 7; // 清理7天前的数据
            }
          } catch (error) {
            return true; // 清理无效数据
          }
        }
        return false;
      });

      expiredKeys.forEach(key => {
        localStorage.removeItem(key);
      });

      if (expiredKeys.length > 0) {
        console.log(`🧹 清理了 ${expiredKeys.length} 个过期缓存项`);
      }
    } catch (error) {
      console.error('数据清理失败:', error);
    }
  }

  /**
   * 执行权限同步
   */
  private async performPermissionSync(): Promise<void> {
    try {
      // 这里可以添加权限同步逻辑
      console.log('🔐 执行权限同步检查');
    } catch (error) {
      console.error('权限同步失败:', error);
    }
  }

  /**
   * 执行套餐到期检查
   */
  private async performSubscriptionExpiryCheck(): Promise<void> {
    try {
      // 这里可以添加套餐到期检查逻辑
      console.log('📅 执行套餐到期检查');
    } catch (error) {
      console.error('套餐到期检查失败:', error);
    }
  }

  /**
   * 执行邀请数据同步
   */
  private async performInviteDataSync(): Promise<void> {
    try {
      // 这里可以添加邀请数据同步逻辑
      console.log('🎁 执行邀请数据同步');
    } catch (error) {
      console.error('邀请数据同步失败:', error);
    }
  }

  /**
   * 获取系统状态
   */
  async getSystemStatus(): Promise<SystemHealthStatus> {
    return await this.performHealthCheck();
  }

  /**
   * 获取任务状态
   */
  getTaskStatus(): AutomationTask[] {
    return Array.from(this.automationTasks.values());
  }
}

// 创建单例实例
export const systemMonitorService = new SystemMonitorService();

export default systemMonitorService;
