/**
 * 权限审计日志系统
 * @description 记录所有权限相关的操作和变更，提供完整的审计追踪
 *
 * 🔧 SSOT迁移说明:
 * - 此服务用于日志记录，user.subscription作为fallback
 * - 实际tier数据应由调用方从unifiedSubscriptionService获取后传入
 */

import type { SessionUserInfo } from '@/types/unifiedAuth';
import type { ExtendedPermissionType } from '@/types/permissions';

/**
 * 审计事件类型
 */
export type AuditEventType = 
  | 'PERMISSION_CHECK'
  | 'PERMISSION_GRANT'
  | 'PERMISSION_DENY'
  | 'ROLE_CHANGE'
  | 'TIER_UPGRADE'
  | 'TIER_DOWNGRADE'
  | 'LOGIN_SUCCESS'
  | 'LOGIN_FAILURE'
  | 'LOGOUT'
  | 'DATA_ACCESS'
  | 'ADMIN_ACTION'
  | 'SECURITY_VIOLATION'
  | 'POLICY_CHANGE'
  | 'CONFIGURATION_CHANGE';

/**
 * 审计事件严重程度
 */
export type AuditSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

/**
 * 审计日志条目
 */
export interface AuditLogEntry {
  id: string;
  timestamp: string;
  eventType: AuditEventType;
  severity: AuditSeverity;
  userId: string;
  userEmail?: string;
  userRole?: string;
  userTier?: string;
  permission?: ExtendedPermissionType;
  resource?: string;
  action?: string;
  result: 'SUCCESS' | 'FAILURE' | 'DENIED';
  reason?: string;
  clientInfo: {
    ip?: string;
    userAgent?: string;
    sessionId?: string;
  };
  context?: {
    targetUserId?: string;
    targetResource?: string;
    oldValue?: any;
    newValue?: any;
    additionalData?: Record<string, any>;
  };
  metadata: {
    source: 'CLIENT' | 'SERVER' | 'SYSTEM';
    component: string;
    version?: string;
  };
}

/**
 * 审计配置
 */
export interface AuditConfig {
  enabled: boolean;
  logLevel: AuditSeverity;
  retentionDays: number;
  enableRemoteLogging: boolean;
  remoteEndpoint?: string;
  enableLocalStorage: boolean;
  enableConsoleOutput: boolean;
  sensitiveDataMasking: boolean;
}

/**
 * 权限审计日志器
 */
export class PermissionAuditLogger {
  private static config: AuditConfig = {
    enabled: true,
    logLevel: 'LOW',
    retentionDays: 90,
    enableRemoteLogging: false,
    enableLocalStorage: true,
    enableConsoleOutput: true,
    sensitiveDataMasking: true
  };

  private static logBuffer: AuditLogEntry[] = [];
  private static maxBufferSize = 1000;

  /**
   * 配置审计日志器
   */
  static configure(config: Partial<AuditConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * 记录权限检查事件
   */
  static logPermissionCheck(
    user: SessionUserInfo | null,
    permission: ExtendedPermissionType,
    result: 'SUCCESS' | 'FAILURE' | 'DENIED',
    reason?: string,
    context?: any
  ): void {
    if (!this.config.enabled) return;

    const entry: AuditLogEntry = {
      id: this.generateId(),
      timestamp: new Date().toISOString(),
      eventType: result === 'DENIED' ? 'PERMISSION_DENY' : 'PERMISSION_CHECK',
      severity: result === 'DENIED' ? 'MEDIUM' : 'LOW',
      userId: user?.id || 'anonymous',
      userEmail: this.maskSensitiveData(user?.email),
      userRole: user?.roles?.[0] || 'guest',
      userTier: user?.subscription?.tier || user?.vipLevel || 'trial',
      permission,
      result,
      reason,
      clientInfo: this.getClientInfo(),
      context: {
        additionalData: context
      },
      metadata: {
        source: 'CLIENT',
        component: 'PermissionChecker',
        version: '1.0.0'
      }
    };

    this.writeLog(entry);
  }

  /**
   * 记录数据访问事件
   */
  static logDataAccess(
    user: SessionUserInfo | null,
    resource: string,
    action: string,
    result: 'SUCCESS' | 'FAILURE' | 'DENIED',
    targetUserId?: string,
    reason?: string
  ): void {
    if (!this.config.enabled) return;

    const entry: AuditLogEntry = {
      id: this.generateId(),
      timestamp: new Date().toISOString(),
      eventType: 'DATA_ACCESS',
      severity: result === 'DENIED' ? 'MEDIUM' : 'LOW',
      userId: user?.id || 'anonymous',
      userEmail: this.maskSensitiveData(user?.email),
      userRole: user?.roles?.[0] || 'guest',
      userTier: user?.subscription?.tier || user?.vipLevel || 'trial',
      resource,
      action,
      result,
      reason,
      clientInfo: this.getClientInfo(),
      context: {
        targetUserId
      },
      metadata: {
        source: 'CLIENT',
        component: 'DataAccessController',
        version: '1.0.0'
      }
    };

    this.writeLog(entry);
  }

  /**
   * 记录用户登录事件
   */
  static logUserLogin(
    user: SessionUserInfo | null,
    result: 'SUCCESS' | 'FAILURE',
    reason?: string
  ): void {
    if (!this.config.enabled) return;

    const entry: AuditLogEntry = {
      id: this.generateId(),
      timestamp: new Date().toISOString(),
      eventType: result === 'SUCCESS' ? 'LOGIN_SUCCESS' : 'LOGIN_FAILURE',
      severity: result === 'FAILURE' ? 'MEDIUM' : 'LOW',
      userId: user?.id || 'unknown',
      userEmail: this.maskSensitiveData(user?.email),
      userRole: user?.roles?.[0] || 'guest',
      userTier: user?.subscription?.tier || user?.vipLevel || 'trial',
      result,
      reason,
      clientInfo: this.getClientInfo(),
      metadata: {
        source: 'CLIENT',
        component: 'AuthenticationService',
        version: '1.0.0'
      }
    };

    this.writeLog(entry);
  }

  /**
   * 记录用户登出事件
   */
  static logUserLogout(user: SessionUserInfo): void {
    if (!this.config.enabled) return;

    const entry: AuditLogEntry = {
      id: this.generateId(),
      timestamp: new Date().toISOString(),
      eventType: 'LOGOUT',
      severity: 'LOW',
      userId: user.id,
      userEmail: this.maskSensitiveData(user.email),
      userRole: user.roles?.[0] || 'guest',
      // 🔧 SSOT: fallback逻辑，调用方应传入实际tier
      userTier: user.subscription?.tier || user.vipLevel || 'trial',
      result: 'SUCCESS',
      clientInfo: this.getClientInfo(),
      metadata: {
        source: 'CLIENT',
        component: 'AuthenticationService',
        version: '1.0.0'
      }
    };

    this.writeLog(entry);
  }

  /**
   * 记录角色变更事件
   */
  static logRoleChange(
    user: SessionUserInfo,
    oldRole: string,
    newRole: string,
    changedBy: SessionUserInfo
  ): void {
    if (!this.config.enabled) return;

    const entry: AuditLogEntry = {
      id: this.generateId(),
      timestamp: new Date().toISOString(),
      eventType: 'ROLE_CHANGE',
      severity: 'HIGH',
      userId: changedBy.id,
      userEmail: this.maskSensitiveData(changedBy.email),
      userRole: changedBy.roles?.[0] || 'guest',
      userTier: changedBy.subscription?.tier || changedBy.vipLevel || 'trial',
      result: 'SUCCESS',
      clientInfo: this.getClientInfo(),
      context: {
        targetUserId: user.id,
        oldValue: oldRole,
        newValue: newRole
      },
      metadata: {
        source: 'CLIENT',
        component: 'UserManagement',
        version: '1.0.0'
      }
    };

    this.writeLog(entry);
  }

  /**
   * 记录订阅等级变更事件
   */
  static logTierChange(
    user: SessionUserInfo,
    oldTier: string,
    newTier: string,
    changeType: 'UPGRADE' | 'DOWNGRADE'
  ): void {
    if (!this.config.enabled) return;

    const entry: AuditLogEntry = {
      id: this.generateId(),
      timestamp: new Date().toISOString(),
      eventType: changeType === 'UPGRADE' ? 'TIER_UPGRADE' : 'TIER_DOWNGRADE',
      severity: 'MEDIUM',
      userId: user.id,
      userEmail: this.maskSensitiveData(user.email),
      userRole: user.roles?.[0] || 'guest',
      userTier: newTier,
      result: 'SUCCESS',
      clientInfo: this.getClientInfo(),
      context: {
        oldValue: oldTier,
        newValue: newTier
      },
      metadata: {
        source: 'CLIENT',
        component: 'SubscriptionService',
        version: '1.0.0'
      }
    };

    this.writeLog(entry);
  }

  /**
   * 记录管理员操作事件
   */
  static logAdminAction(
    admin: SessionUserInfo,
    action: string,
    targetResource: string,
    result: 'SUCCESS' | 'FAILURE',
    details?: any
  ): void {
    if (!this.config.enabled) return;

    const entry: AuditLogEntry = {
      id: this.generateId(),
      timestamp: new Date().toISOString(),
      eventType: 'ADMIN_ACTION',
      severity: 'HIGH',
      userId: admin.id,
      userEmail: this.maskSensitiveData(admin.email),
      userRole: admin.roles?.[0] || 'guest',
      userTier: admin.subscription?.tier || admin.vipLevel || 'trial',
      action,
      result,
      clientInfo: this.getClientInfo(),
      context: {
        targetResource,
        additionalData: details
      },
      metadata: {
        source: 'CLIENT',
        component: 'AdminPanel',
        version: '1.0.0'
      }
    };

    this.writeLog(entry);
  }

  /**
   * 记录安全违规事件
   */
  static logSecurityViolation(
    user: SessionUserInfo | null,
    violationType: string,
    description: string,
    severity: AuditSeverity = 'HIGH',
    context?: any
  ): void {
    if (!this.config.enabled) return;

    const entry: AuditLogEntry = {
      id: this.generateId(),
      timestamp: new Date().toISOString(),
      eventType: 'SECURITY_VIOLATION',
      severity,
      userId: user?.id || 'unknown',
      userEmail: this.maskSensitiveData(user?.email),
      userRole: user?.roles?.[0] || 'guest',
      userTier: user?.subscription?.tier || user?.vipLevel || 'trial',
      action: violationType,
      result: 'DENIED',
      reason: description,
      clientInfo: this.getClientInfo(),
      context: {
        additionalData: context
      },
      metadata: {
        source: 'CLIENT',
        component: 'SecurityMonitor',
        version: '1.0.0'
      }
    };

    this.writeLog(entry);

    // 安全违规事件需要立即处理
    this.handleSecurityViolation(entry);
  }

  /**
   * 记录策略变更事件
   */
  static logPolicyChange(
    admin: SessionUserInfo,
    policyName: string,
    changeType: 'CREATE' | 'UPDATE' | 'DELETE',
    oldValue?: any,
    newValue?: any
  ): void {
    if (!this.config.enabled) return;

    const entry: AuditLogEntry = {
      id: this.generateId(),
      timestamp: new Date().toISOString(),
      eventType: 'POLICY_CHANGE',
      severity: 'HIGH',
      userId: admin.id,
      userEmail: this.maskSensitiveData(admin.email),
      userRole: admin.roles?.[0] || 'guest',
      userTier: admin.subscription?.tier || admin.vipLevel || 'trial',
      action: `POLICY_${changeType}`,
      result: 'SUCCESS',
      resource: policyName,
      clientInfo: this.getClientInfo(),
      context: {
        oldValue,
        newValue
      },
      metadata: {
        source: 'CLIENT',
        component: 'PolicyManager',
        version: '1.0.0'
      }
    };

    this.writeLog(entry);
  }

  /**
   * 写入日志
   */
  private static writeLog(entry: AuditLogEntry): void {
    // 检查日志级别
    if (!this.shouldLog(entry.severity)) {
      return;
    }

    // 添加到缓冲区
    this.logBuffer.push(entry);

    // 控制缓冲区大小
    if (this.logBuffer.length > this.maxBufferSize) {
      this.logBuffer.shift();
    }

    // 输出到控制台
    if (this.config.enableConsoleOutput) {
      this.outputToConsole(entry);
    }

    // 存储到本地
    if (this.config.enableLocalStorage) {
      this.storeLocally(entry);
    }

    // 发送到远程服务器
    if (this.config.enableRemoteLogging && this.config.remoteEndpoint) {
      this.sendToRemote(entry);
    }
  }

  /**
   * 检查是否应该记录日志
   */
  private static shouldLog(severity: AuditSeverity): boolean {
    const levels = { LOW: 0, MEDIUM: 1, HIGH: 2, CRITICAL: 3 };
    return levels[severity] >= levels[this.config.logLevel];
  }

  /**
   * 输出到控制台
   */
  private static outputToConsole(entry: AuditLogEntry): void {
    const logMethod = entry.severity === 'CRITICAL' || entry.severity === 'HIGH' ? 'error' :
                     entry.severity === 'MEDIUM' ? 'warn' : 'log';

    console[logMethod](`[AUDIT] ${entry.eventType}`, {
      timestamp: entry.timestamp,
      userId: entry.userId,
      result: entry.result,
      reason: entry.reason,
      severity: entry.severity
    });
  }

  /**
   * 存储到本地存储
   */
  private static storeLocally(entry: AuditLogEntry): void {
    try {
      const key = `audit_log_${entry.timestamp.split('T')[0]}`;
      const existing = localStorage.getItem(key);
      const logs = existing ? JSON.parse(existing) : [];
      
      logs.push(entry);
      
      // 限制每日日志数量
      if (logs.length > 500) {
        logs.shift();
      }
      
      localStorage.setItem(key, JSON.stringify(logs));
    } catch (error) {
      console.error('Failed to store audit log locally:', error);
    }
  }

  /**
   * 发送到远程服务器
   */
  private static async sendToRemote(entry: AuditLogEntry): Promise<void> {
    if (!this.config.remoteEndpoint) return;

    try {
      await fetch(this.config.remoteEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(entry)
      });
    } catch (error) {
      console.error('Failed to send audit log to remote server:', error);
    }
  }

  /**
   * 处理安全违规事件
   */
  private static handleSecurityViolation(entry: AuditLogEntry): void {
    // 立即输出严重安全事件
    console.error('🚨 SECURITY VIOLATION DETECTED:', entry);

    // 如果是关键级别，发送即时警报
    if (entry.severity === 'CRITICAL') {
      // TODO: 集成到实时警报系统
      this.sendImmediateAlert(entry);
    }
  }

  /**
   * 发送即时警报
   */
  private static sendImmediateAlert(entry: AuditLogEntry): void {
    // TODO: 实现即时警报功能（邮件、短信、Slack等）
    console.error('📢 IMMEDIATE ALERT REQUIRED:', entry);
  }

  /**
   * 获取客户端信息
   */
  private static getClientInfo(): AuditLogEntry['clientInfo'] {
    if (typeof window === 'undefined') {
      return { ip: 'server-side' };
    }

    return {
      userAgent: navigator.userAgent,
      sessionId: this.getSessionId()
    };
  }

  /**
   * 获取会话ID
   */
  private static getSessionId(): string {
    try {
      let sessionId = sessionStorage.getItem('audit_session_id');
      if (!sessionId) {
        sessionId = this.generateId();
        sessionStorage.setItem('audit_session_id', sessionId);
      }
      return sessionId;
    } catch {
      return 'unknown';
    }
  }

  /**
   * 生成唯一ID
   */
  private static generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * 掩码敏感数据
   */
  private static maskSensitiveData(data?: string): string | undefined {
    if (!data || !this.config.sensitiveDataMasking) {
      return data;
    }

    // 邮箱掩码
    if (data.includes('@')) {
      const [local, domain] = data.split('@');
      return `${local.slice(0, 2)}***@${domain}`;
    }

    // 其他敏感数据掩码
    if (data.length > 4) {
      return `${data.slice(0, 2)}***${data.slice(-2)}`;
    }

    return '***';
  }

  /**
   * 获取审计日志统计
   */
  static getAuditStats(): {
    totalLogs: number;
    byEventType: Record<AuditEventType, number>;
    bySeverity: Record<AuditSeverity, number>;
    recentViolations: number;
  } {
    const stats = {
      totalLogs: this.logBuffer.length,
      byEventType: {} as Record<AuditEventType, number>,
      bySeverity: {} as Record<AuditSeverity, number>,
      recentViolations: 0
    };

    const now = Date.now();
    const oneDayAgo = now - 24 * 60 * 60 * 1000;

    this.logBuffer.forEach(entry => {
      // 统计事件类型
      stats.byEventType[entry.eventType] = (stats.byEventType[entry.eventType] || 0) + 1;
      
      // 统计严重程度
      stats.bySeverity[entry.severity] = (stats.bySeverity[entry.severity] || 0) + 1;
      
      // 统计最近的安全违规
      if (entry.eventType === 'SECURITY_VIOLATION' && new Date(entry.timestamp).getTime() > oneDayAgo) {
        stats.recentViolations++;
      }
    });

    return stats;
  }

  /**
   * 清理过期日志
   */
  static cleanupOldLogs(): void {
    const retentionMs = this.config.retentionDays * 24 * 60 * 60 * 1000;
    const cutoffTime = Date.now() - retentionMs;

    this.logBuffer = this.logBuffer.filter(entry => 
      new Date(entry.timestamp).getTime() > cutoffTime
    );

    // 清理本地存储中的过期日志
    if (this.config.enableLocalStorage) {
      try {
        const keys = Object.keys(localStorage).filter(key => key.startsWith('audit_log_'));
        keys.forEach(key => {
          const dateStr = key.replace('audit_log_', '');
          const logDate = new Date(dateStr).getTime();
          if (logDate < cutoffTime) {
            localStorage.removeItem(key);
          }
        });
      } catch (error) {
        console.error('Failed to cleanup old logs:', error);
      }
    }
  }

  /**
   * 导出审计日志
   */
  static exportLogs(format: 'JSON' | 'CSV' = 'JSON'): string {
    if (format === 'CSV') {
      return this.convertToCSV(this.logBuffer);
    }
    return JSON.stringify(this.logBuffer, null, 2);
  }

  /**
   * 转换为CSV格式
   */
  private static convertToCSV(logs: AuditLogEntry[]): string {
    if (logs.length === 0) return '';

    const headers = [
      'timestamp', 'eventType', 'severity', 'userId', 'userEmail',
      'userRole', 'userTier', 'permission', 'resource', 'action',
      'result', 'reason', 'clientIP', 'userAgent'
    ];

    const csvRows = [headers.join(',')];

    logs.forEach(log => {
      const row = [
        log.timestamp,
        log.eventType,
        log.severity,
        log.userId,
        log.userEmail || '',
        log.userRole || '',
        log.userTier || '',
        log.permission || '',
        log.resource || '',
        log.action || '',
        log.result,
        log.reason || '',
        log.clientInfo.ip || '',
        log.clientInfo.userAgent || ''
      ].map(field => `"${String(field).replace(/"/g, '""')}"`);

      csvRows.push(row.join(','));
    });

    return csvRows.join('\n');
  }
}

// 定期清理过期日志
if (typeof window !== 'undefined') {
  setInterval(() => {
    PermissionAuditLogger.cleanupOldLogs();
  }, 24 * 60 * 60 * 1000); // 每天清理一次
}

export default PermissionAuditLogger;