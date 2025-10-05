/**
 * 🔍 认证监控服务
 * 监控认证失败率、性能指标和用户行为
 * 
 * 功能特性：
 * - 认证成功/失败率统计
 * - 性能指标监控
 * - 用户行为分析
 * - 异常告警机制
 * - 实时监控面板数据
 */

import { AuthErrorType, ErrorSeverity } from '@/utils/authErrorHandler';
// import { getDataServices } from '@/services/serviceInitializer'; // 模块导出不存在，暂时注释
const getDataServices = () => null as any; // 临时占位

export interface AuthMetrics {
  // 基础指标
  totalAttempts: number;
  successfulAttempts: number;
  failedAttempts: number;
  successRate: number;
  
  // 性能指标
  averageResponseTime: number;
  p95ResponseTime: number;
  p99ResponseTime: number;
  
  // 错误统计
  errorsByType: Record<AuthErrorType, number>;
  errorsBySeverity: Record<ErrorSeverity, number>;
  
  // 时间窗口
  timeWindow: string;
  startTime: number;
  endTime: number;
}

export interface AuthEvent {
  type: 'attempt' | 'success' | 'failure' | 'performance';
  method: 'password' | 'sms' | 'email' | 'token';
  timestamp: number;
  duration?: number;
  errorType?: AuthErrorType;
  errorCode?: string;
  userId?: string;
  userAgent?: string;
  ipAddress?: string;
  metadata?: Record<string, any>;
}

export interface PerformanceAlert {
  type: 'high_failure_rate' | 'slow_response' | 'error_spike' | 'service_down';
  severity: 'warning' | 'critical';
  message: string;
  value: number;
  threshold: number;
  timestamp: number;
  recommendations: string[];
}

/**
 * 认证监控服务类
 */
export class AuthMonitoringService {
  private static instance: AuthMonitoringService;
  private events: AuthEvent[] = [];
  private alerts: PerformanceAlert[] = [];
  private readonly MAX_EVENTS = 10000;
  private readonly ALERT_THRESHOLDS = {
    failureRate: 0.1, // 10%
    responseTime: 5000, // 5秒
    errorSpike: 50 // 50个错误/分钟
  };
  
  private monitoringInterval: NodeJS.Timeout | null = null;

  private constructor() {
    this.startMonitoring();
  }

  public static getInstance(): AuthMonitoringService {
    if (!AuthMonitoringService.instance) {
      AuthMonitoringService.instance = new AuthMonitoringService();
    }
    return AuthMonitoringService.instance;
  }

  /**
   * 启动监控
   */
  private startMonitoring(): void {
    // 每分钟检查一次指标
    this.monitoringInterval = setInterval(() => {
      this.checkMetrics();
    }, 60000);

    console.log('📊 authenticatingmonitoringservicealreadystarting');
  }

  /**
   * 停止监控
   */
  stopMonitoring(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
    console.log('📊 authenticatingmonitoringservicealreadystopping');
  }

  /**
   * 记录认证尝试
   */
  recordAuthAttempt(method: 'password' | 'sms' | 'email' | 'token', metadata?: Record<string, any>): string {
    const eventId = this.generateEventId();
    const event: AuthEvent = {
      type: 'attempt',
      method,
      timestamp: Date.now(),
      userAgent: navigator?.userAgent,
      metadata: {
        eventId,
        ...metadata
      }
    };

    this.addEvent(event);
    
    // 集成到性能监控系统
    this.recordPerformanceEvent('auth_attempt', event.timestamp);
    
    console.log('📝 记录authenticating尝试:', { method, eventId });
    return eventId;
  }

  /**
   * 记录认证成功
   */
  recordAuthSuccess(eventId: string, duration: number, userId?: string, metadata?: Record<string, any>): void {
    const event: AuthEvent = {
      type: 'success',
      method: this.getMethodByEventId(eventId) || 'password',
      timestamp: Date.now(),
      duration,
      userId,
      metadata: {
        eventId,
        ...metadata
      }
    };

    this.addEvent(event);
    
    // 集成到性能监控系统
    this.recordPerformanceEvent('auth_success', event.timestamp - duration, event.timestamp);
    
    console.log('✅ 记录authenticatingsuccess:', { eventId, duration, userId });
  }

  /**
   * 记录认证失败
   */
  recordAuthFailure(
    eventId: string,
    errorType: AuthErrorType,
    errorCode: string,
    duration: number,
    metadata?: Record<string, any>
  ): void {
    const event: AuthEvent = {
      type: 'failure',
      method: this.getMethodByEventId(eventId) || 'password',
      timestamp: Date.now(),
      duration,
      errorType,
      errorCode,
      metadata: {
        eventId,
        ...metadata
      }
    };

    this.addEvent(event);
    
    // 集成到性能监控系统
    this.recordPerformanceEvent('auth_failure', event.timestamp - duration, event.timestamp, false, {
      errorType,
      errorCode
    });
    
    console.log('❌ 记录authenticatingfailed:', { eventId, errorType, errorCode, duration });
  }

  /**
   * 记录性能指标
   */
  recordPerformanceMetric(operation: string, startTime: number, endTime: number, success: boolean): void {
    const event: AuthEvent = {
      type: 'performance',
      method: 'password', // 默认值
      timestamp: endTime,
      duration: endTime - startTime,
      metadata: {
        operation,
        success
      }
    };

    this.addEvent(event);
    
    // 集成到性能监控系统
    this.recordPerformanceEvent(operation, startTime, endTime, success);
  }

  /**
   * 获取认证指标
   */
  getAuthMetrics(timeWindowMs: number = 24 * 60 * 60 * 1000): AuthMetrics {
    const now = Date.now();
    const startTime = now - timeWindowMs;
    
    const relevantEvents = this.events.filter(event => 
      event.timestamp >= startTime && event.timestamp <= now
    );

    const attempts = relevantEvents.filter(e => e.type === 'attempt').length;
    const successes = relevantEvents.filter(e => e.type === 'success').length;
    const failures = relevantEvents.filter(e => e.type === 'failure').length;
    
    const responseTimes = relevantEvents
      .filter(e => e.duration && e.duration > 0)
      .map(e => e.duration!)
      .sort((a, b) => a - b);

    const errorsByType = relevantEvents
      .filter(e => e.type === 'failure' && e.errorType)
      .reduce((acc, event) => {
        acc[event.errorType!] = (acc[event.errorType!] || 0) + 1;
        return acc;
      }, {} as Record<AuthErrorType, number>);

    // 根据错误类型推断严重级别
    const errorsBySeverity = Object.entries(errorsByType).reduce((acc, [errorType, count]) => {
      const severity = this.getErrorSeverity(errorType as AuthErrorType);
      acc[severity] = (acc[severity] || 0) + count;
      return acc;
    }, {} as Record<ErrorSeverity, number>);

    return {
      totalAttempts: attempts,
      successfulAttempts: successes,
      failedAttempts: failures,
      successRate: attempts > 0 ? successes / attempts : 0,
      
      averageResponseTime: responseTimes.length > 0 
        ? responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length 
        : 0,
      p95ResponseTime: responseTimes.length > 0 
        ? responseTimes[Math.floor(responseTimes.length * 0.95)] 
        : 0,
      p99ResponseTime: responseTimes.length > 0 
        ? responseTimes[Math.floor(responseTimes.length * 0.99)] 
        : 0,
      
      errorsByType,
      errorsBySeverity,
      
      timeWindow: `${timeWindowMs / 1000}s`,
      startTime,
      endTime: now
    };
  }

  /**
   * 获取实时指标（最近5分钟）
   */
  getRealTimeMetrics(): AuthMetrics {
    return this.getAuthMetrics(5 * 60 * 1000); // 5分钟
  }

  /**
   * 获取性能告警
   */
  getActiveAlerts(): PerformanceAlert[] {
    const now = Date.now();
    const oneHourAgo = now - (60 * 60 * 1000);
    
    return this.alerts.filter(alert => alert.timestamp > oneHourAgo);
  }

  /**
   * 检查指标并生成告警
   */
  private checkMetrics(): void {
    const metrics = this.getRealTimeMetrics();
    const now = Date.now();

    // 检查失败率告警
    if (metrics.totalAttempts > 10 && metrics.successRate < (1 - this.ALERT_THRESHOLDS.failureRate)) {
      this.addAlert({
        type: 'high_failure_rate',
        severity: 'critical',
        message: `认证失败率过高: ${(100 * (1 - metrics.successRate)).toFixed(1)}%`,
        value: 1 - metrics.successRate,
        threshold: this.ALERT_THRESHOLDS.failureRate,
        timestamp: now,
        recommendations: [
          '检查认证服务状态',
          '查看错误日志',
          '验证网络连接',
          '检查Authing服务状态'
        ]
      });
    }

    // 检查响应时间告警
    if (metrics.p95ResponseTime > this.ALERT_THRESHOLDS.responseTime) {
      this.addAlert({
        type: 'slow_response',
        severity: 'warning',
        message: `认证响应时间过慢: P95=${metrics.p95ResponseTime}ms`,
        value: metrics.p95ResponseTime,
        threshold: this.ALERT_THRESHOLDS.responseTime,
        timestamp: now,
        recommendations: [
          '检查网络延迟',
          '优化认证流程',
          '检查服务器性能',
          '考虑使用CDN'
        ]
      });
    }

    // 检查错误激增告警
    const recentFailures = this.events.filter(e => 
      e.type === 'failure' && 
      e.timestamp > (now - 60000) // 最近1分钟
    ).length;

    if (recentFailures > this.ALERT_THRESHOLDS.errorSpike) {
      this.addAlert({
        type: 'error_spike',
        severity: 'critical',
        message: `认证错误激增: ${recentFailures}个错误/分钟`,
        value: recentFailures,
        threshold: this.ALERT_THRESHOLDS.errorSpike,
        timestamp: now,
        recommendations: [
          '立即检查系统状态',
          '查看错误详情',
          '检查依赖服务',
          '准备降级方案'
        ]
      });
    }
  }

  /**
   * 添加事件
   */
  private addEvent(event: AuthEvent): void {
    this.events.push(event);
    
    // 限制事件数量
    if (this.events.length > this.MAX_EVENTS) {
      this.events = this.events.slice(-this.MAX_EVENTS);
    }
  }

  /**
   * 添加告警
   */
  private addAlert(alert: PerformanceAlert): void {
    // 避免重复告警（同类型1分钟内只触发一次）
    const oneMinuteAgo = Date.now() - 60000;
    const existingAlert = this.alerts.find(a => 
      a.type === alert.type && 
      a.timestamp > oneMinuteAgo
    );

    if (existingAlert) {
      return;
    }

    this.alerts.push(alert);
    
    // 限制告警数量
    if (this.alerts.length > 1000) {
      this.alerts = this.alerts.slice(-1000);
    }

    console.warn('🚨 性能告警:', alert);
    
    // 发送到外部监控系统
    this.sendAlertToExternalSystem(alert);
  }

  /**
   * 生成事件ID
   */
  private generateEventId(): string {
    return `auth_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * 根据事件ID获取认证方法
   */
  private getMethodByEventId(eventId: string): 'password' | 'sms' | 'email' | 'token' | undefined {
    const event = this.events.find(e => e.metadata?.eventId === eventId);
    return event?.method;
  }

  /**
   * 获取错误严重级别
   */
  private getErrorSeverity(errorType: AuthErrorType): ErrorSeverity {
    const severityMap: Record<AuthErrorType, ErrorSeverity> = {
      [AuthErrorType.NETWORK_ERROR]: ErrorSeverity.HIGH,
      [AuthErrorType.TIMEOUT_ERROR]: ErrorSeverity.HIGH,
      [AuthErrorType.CONNECTION_ERROR]: ErrorSeverity.HIGH,
      [AuthErrorType.VALIDATION_ERROR]: ErrorSeverity.MEDIUM,
      [AuthErrorType.INVALID_CREDENTIALS]: ErrorSeverity.MEDIUM,
      [AuthErrorType.INVALID_CODE]: ErrorSeverity.MEDIUM,
      [AuthErrorType.AUTH_FAILED]: ErrorSeverity.MEDIUM,
      [AuthErrorType.TOKEN_EXPIRED]: ErrorSeverity.MEDIUM,
      [AuthErrorType.TOKEN_INVALID]: ErrorSeverity.MEDIUM,
      [AuthErrorType.PERMISSION_DENIED]: ErrorSeverity.MEDIUM,
      [AuthErrorType.ACCOUNT_NOT_EXISTS]: ErrorSeverity.MEDIUM,
      [AuthErrorType.ACCOUNT_LOCKED]: ErrorSeverity.HIGH,
      [AuthErrorType.ACCOUNT_DISABLED]: ErrorSeverity.HIGH,
      [AuthErrorType.CODE_EXPIRED]: ErrorSeverity.MEDIUM,
      [AuthErrorType.CODE_INVALID]: ErrorSeverity.MEDIUM,
      [AuthErrorType.CODE_SEND_FAILED]: ErrorSeverity.HIGH,
      [AuthErrorType.CODE_RATE_LIMITED]: ErrorSeverity.MEDIUM,
      [AuthErrorType.CONFIG_ERROR]: ErrorSeverity.CRITICAL,
      [AuthErrorType.SERVICE_UNAVAILABLE]: ErrorSeverity.CRITICAL,
      [AuthErrorType.UNKNOWN_ERROR]: ErrorSeverity.MEDIUM
    };

    return severityMap[errorType] || ErrorSeverity.MEDIUM;
  }

  /**
   * 集成到性能监控系统
   */
  private recordPerformanceEvent(
    name: string, 
    startTime: number, 
    endTime?: number, 
    success: boolean = true,
    metadata?: Record<string, any>
  ): void {
    try {
      const services = getDataServices();
      if (services.performance) {
        services.performance.recordDataLoadingEvent(
          name,
          startTime,
          endTime || Date.now(),
          success,
          metadata || {}
        );
      }
    } catch (error) {
      console.warn('⚠️ 性能event记录failed:', error);
    }
  }

  /**
   * 发送告警到外部系统
   */
  private sendAlertToExternalSystem(alert: PerformanceAlert): void {
    // 这里可以集成到外部监控系统
    console.log('📡 sending告警到outer部系统:', alert);
    
    // 示例：发送到监控API
    // fetch('/api/monitoring/alerts', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(alert)
    // }).catch(console.error);
  }

  /**
   * 导出监控数据
   */
  exportMonitoringData(timeWindowMs: number = 24 * 60 * 60 * 1000): {
    metrics: AuthMetrics;
    events: AuthEvent[];
    alerts: PerformanceAlert[];
  } {
    const now = Date.now();
    const startTime = now - timeWindowMs;

    return {
      metrics: this.getAuthMetrics(timeWindowMs),
      events: this.events.filter(e => e.timestamp >= startTime),
      alerts: this.alerts.filter(a => a.timestamp >= startTime)
    };
  }

  /**
   * 清理历史数据
   */
  cleanup(keepDays: number = 7): void {
    const cutoffTime = Date.now() - (keepDays * 24 * 60 * 60 * 1000);
    
    this.events = this.events.filter(e => e.timestamp > cutoffTime);
    this.alerts = this.alerts.filter(a => a.timestamp > cutoffTime);
    
    console.log('🗑️ monitoringdatacleaningcompleted，保留', keepDays, '天数据');
  }
}

// 导出单例实例
export const authMonitoringService = AuthMonitoringService.getInstance();

/**
 * 便捷的监控函数
 */
export const AuthMonitoring = {
  /**
   * 开始监控认证尝试
   */
  startAuthAttempt(method: 'password' | 'sms' | 'email' | 'token', metadata?: Record<string, any>): string {
    return authMonitoringService.recordAuthAttempt(method, metadata);
  },

  /**
   * 记录认证成功
   */
  recordSuccess(eventId: string, startTime: number, userId?: string): void {
    const duration = Date.now() - startTime;
    authMonitoringService.recordAuthSuccess(eventId, duration, userId);
  },

  /**
   * 记录认证失败
   */
  recordFailure(eventId: string, startTime: number, errorType: AuthErrorType, errorCode: string): void {
    const duration = Date.now() - startTime;
    authMonitoringService.recordAuthFailure(eventId, errorType, errorCode, duration);
  },

  /**
   * 获取实时指标
   */
  getRealTimeMetrics(): AuthMetrics {
    return authMonitoringService.getRealTimeMetrics();
  },

  /**
   * 获取活跃告警
   */
  getActiveAlerts(): PerformanceAlert[] {
    return authMonitoringService.getActiveAlerts();
  }
};