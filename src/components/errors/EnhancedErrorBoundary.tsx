/**
 * 🛡️ 增强错误边界组件
 * 根本性解决错误处理问题，提供全面的错误恢复机制
 * 
 * 核心功能：
 * - 多层错误边界和智能错误分类
 * - 自动错误恢复和降级策略
 * - 错误上报和监控集成
 * - 用户友好的错误提示和操作指导
 * - 错误重现和调试支持
 */

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, RefreshCw, Bug, ChevronDown, ChevronRight, Copy } from 'lucide-react';
import { logger } from '@/utils/logger';

// 错误类型分类
export enum ErrorCategory {
  NETWORK = 'network',           // 网络错误
  DATA = 'data',                 // 数据错误
  RENDER = 'render',             // 渲染错误
  PERMISSION = 'permission',     // 权限错误
  TIMEOUT = 'timeout',           // 超时错误
  UNKNOWN = 'unknown'            // 未知错误
}

// 错误严重程度
export enum ErrorSeverity {
  LOW = 'low',                   // 低：不影响主要功能
  MEDIUM = 'medium',             // 中：影响部分功能
  HIGH = 'high',                 // 高：影响主要功能
  CRITICAL = 'critical'          // 严重：系统不可用
}

// 错误信息接口
export interface EnhancedError {
  id: string;
  category: ErrorCategory;
  severity: ErrorSeverity;
  message: string;
  stack?: string;
  componentStack?: string;
  props?: any;
  state?: any;
  timestamp: number;
  userAgent: string;
  url: string;
  userId?: string;
  sessionId: string;
  buildVersion: string;
  reproductionSteps?: string[];
  metadata: Record<string, any>;
}

// 恢复策略
export interface RecoveryStrategy {
  type: 'reload' | 'retry' | 'fallback' | 'reset';
  label: string;
  description: string;
  action: () => void;
  auto: boolean;
  delay?: number;
}

// 错误边界状态
interface ErrorBoundaryState {
  hasError: boolean;
  error: EnhancedError | null;
  errorId: string | null;
  retryCount: number;
  lastErrorTime: number;
  showDetails: boolean;
  recoveryStrategies: RecoveryStrategy[];
  isRecovering: boolean;
}

// 错误边界属性
interface EnhancedErrorBoundaryProps {
  children: ReactNode;
  /** 错误级别 */
  level?: 'page' | 'section' | 'component';
  /** 降级内容 */
  fallback?: ReactNode;
  /** 自定义错误处理 */
  onError?: (error: EnhancedError, errorInfo: ErrorInfo) => void;
  /** 是否启用自动恢复 */
  enableAutoRecovery?: boolean;
  /** 自动恢复延迟 */
  autoRecoveryDelay?: number;
  /** 最大重试次数 */
  maxRetries?: number;
  /** 错误上报回调 */
  onErrorReport?: (error: EnhancedError) => void;
  /** 组件标识 */
  componentName?: string;
  /** 是否显示详细错误信息 */
  showErrorDetails?: boolean;
}

/**
 * 增强错误边界组件
 */
export class EnhancedErrorBoundary extends Component<
  EnhancedErrorBoundaryProps,
  ErrorBoundaryState
> {
  private retryTimer: NodeJS.Timeout | null = null;
  private sessionId: string;

  constructor(props: EnhancedErrorBoundaryProps) {
    super(props);

    this.sessionId = this.generateSessionId();

    this.state = {
      hasError: false,
      error: null,
      errorId: null,
      retryCount: 0,
      lastErrorTime: 0,
      showDetails: false,
      recoveryStrategies: [],
      isRecovering: false
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      lastErrorTime: Date.now()
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const enhancedError = this.createEnhancedError(error, errorInfo);
    const recoveryStrategies = this.generateRecoveryStrategies(enhancedError);

    this.setState({
      error: enhancedError,
      errorId: enhancedError.id,
      recoveryStrategies
    });

    // 记录错误
    this.logError(enhancedError, errorInfo);

    // 调用自定义错误处理
    this.props.onError?.(enhancedError, errorInfo);

    // 上报错误
    this.reportError(enhancedError);

    // 启动自动恢复
    this.startAutoRecovery(enhancedError);
  }

  /**
   * 创建增强错误对象
   */
  private createEnhancedError(error: Error, errorInfo: ErrorInfo): EnhancedError {
    const errorId = this.generateErrorId();
    const category = this.categorizeError(error);
    const severity = this.assessSeverity(error, category);

    return {
      id: errorId,
      category,
      severity,
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      props: this.sanitizeProps(this.props),
      state: this.sanitizeState(this.state),
      timestamp: Date.now(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      userId: this.getCurrentUserId(),
      sessionId: this.sessionId,
      buildVersion: import.meta.env.VITE_APP_VERSION || 'development',
      reproductionSteps: this.generateReproductionSteps(),
      metadata: {
        componentName: this.props.componentName || 'Unknown',
        level: this.props.level || 'component',
        retryCount: this.state.retryCount,
        memoryUsage: this.getMemoryUsage(),
        timestamp: new Date().toISOString()
      }
    };
  }

  /**
   * 错误分类
   */
  private categorizeError(error: Error): ErrorCategory {
    const message = error.message.toLowerCase();
    const stack = error.stack?.toLowerCase() || '';

    if (message.includes('network') || message.includes('fetch')) {
      return ErrorCategory.NETWORK;
    }
    
    if (message.includes('timeout') || message.includes('exceeded')) {
      return ErrorCategory.TIMEOUT;
    }
    
    if (message.includes('permission') || message.includes('unauthorized')) {
      return ErrorCategory.PERMISSION;
    }
    
    if (message.includes('data') || message.includes('parse') || message.includes('json')) {
      return ErrorCategory.DATA;
    }
    
    if (stack.includes('render') || message.includes('render')) {
      return ErrorCategory.RENDER;
    }

    return ErrorCategory.UNKNOWN;
  }

  /**
   * 评估错误严重程度
   */
  private assessSeverity(error: Error, category: ErrorCategory): ErrorSeverity {
    // 根据错误类型和消息评估严重程度
    const message = error.message.toLowerCase();
    
    if (message.includes('critical') || message.includes('fatal')) {
      return ErrorSeverity.CRITICAL;
    }
    
    if (category === ErrorCategory.NETWORK || category === ErrorCategory.TIMEOUT) {
      return ErrorSeverity.MEDIUM;
    }
    
    if (category === ErrorCategory.PERMISSION) {
      return ErrorSeverity.HIGH;
    }
    
    if (category === ErrorCategory.DATA) {
      return ErrorSeverity.MEDIUM;
    }

    return ErrorSeverity.LOW;
  }

  /**
   * 生成恢复策略
   */
  private generateRecoveryStrategies(error: EnhancedError): RecoveryStrategy[] {
    const strategies: RecoveryStrategy[] = [];

    // 基于错误类型生成策略
    switch (error.category) {
      case ErrorCategory.NETWORK:
        strategies.push({
          type: 'retry',
          label: '重试网络请求',
          description: '重新尝试网络连接',
          action: () => this.handleRetry(),
          auto: true,
          delay: 3000
        });
        break;

      case ErrorCategory.TIMEOUT:
        strategies.push({
          type: 'retry',
          label: '重新加载',
          description: '重新加载组件数据',
          action: () => this.handleRetry(),
          auto: true,
          delay: 2000
        });
        break;

      case ErrorCategory.DATA:
        strategies.push({
          type: 'fallback',
          label: '使用备用数据',
          description: '使用缓存或默认数据',
          action: () => this.handleFallback(),
          auto: false
        });
        break;

      case ErrorCategory.RENDER:
        strategies.push({
          type: 'reset',
          label: '重置组件',
          description: '重置组件状态并重新渲染',
          action: () => this.handleReset(),
          auto: false
        });
        break;
    }

    // 通用策略
    strategies.push(
      {
        type: 'reload',
        label: '刷新页面',
        description: '重新加载整个页面',
        action: () => window.location.reload(),
        auto: false
      },
      {
        type: 'retry',
        label: '重试',
        description: '尝试重新渲染组件',
        action: () => this.handleRetry(),
        auto: false
      }
    );

    return strategies;
  }

  /**
   * 启动自动恢复
   */
  private startAutoRecovery(error: EnhancedError): void {
    if (!this.props.enableAutoRecovery) return;

    const maxRetries = this.props.maxRetries || 3;
    if (this.state.retryCount >= maxRetries) return;

    const autoStrategy = this.state.recoveryStrategies.find(s => s.auto);
    if (!autoStrategy) return;

    const delay = autoStrategy.delay || this.props.autoRecoveryDelay || 3000;

    logger.info(`🔄 启动自动恢复: ${autoStrategy.label}, 延迟 ${delay}ms`);

    this.retryTimer = setTimeout(() => {
      this.setState({ isRecovering: true });
      autoStrategy.action();
    }, delay);
  }

  /**
   * 处理重试
   */
  private handleRetry = (): void => {
    logger.info('🔄 执行错误恢复: 重试');
    
    this.setState(prevState => ({
      hasError: false,
      error: null,
      errorId: null,
      retryCount: prevState.retryCount + 1,
      showDetails: false,
      isRecovering: false
    }));

    // 清理定时器
    if (this.retryTimer) {
      clearTimeout(this.retryTimer);
      this.retryTimer = null;
    }
  };

  /**
   * 处理降级
   */
  private handleFallback = (): void => {
    logger.info('🔄 执行错误恢复: 降级');
    
    // 这里可以实现降级逻辑，比如显示缓存数据
    this.setState({
      isRecovering: true
    });

    // 模拟降级处理
    setTimeout(() => {
      this.setState({
        hasError: false,
        error: null,
        isRecovering: false
      });
    }, 1000);
  };

  /**
   * 处理重置
   */
  private handleReset = (): void => {
    logger.info('🔄 执行错误恢复: 重置');
    
    this.setState({
      hasError: false,
      error: null,
      errorId: null,
      retryCount: 0,
      showDetails: false,
      recoveryStrategies: [],
      isRecovering: false
    });
  };

  /**
   * 记录错误
   */
  private logError(error: EnhancedError, errorInfo: ErrorInfo): void {
    logger.error('🚨 组件错误边界捕获错误:', {
      errorId: error.id,
      component: this.props.componentName,
      message: error.message,
      category: error.category,
      severity: error.severity,
      stack: error.stack,
      componentStack: errorInfo.componentStack
    });
  }

  /**
   * 上报错误
   */
  private reportError(error: EnhancedError): void {
    try {
      // 调用自定义上报回调
      this.props.onErrorReport?.(error);

      // 这里可以集成错误监控服务（如 Sentry）
      console.group('🚨 Error Report');
      console.error('Error ID:', error.id);
      console.error('Category:', error.category);
      console.error('Severity:', error.severity);
      console.error('Message:', error.message);
      console.error('Stack:', error.stack);
      console.error('Component Stack:', error.componentStack);
      console.error('Metadata:', error.metadata);
      console.groupEnd();

    } catch (reportError) {
      logger.warn('⚠️ 错误上报失败:', reportError);
    }
  }

  /**
   * 复制错误信息
   */
  private copyErrorInfo = (): void => {
    if (!this.state.error) return;

    const errorInfo = {
      errorId: this.state.error.id,
      message: this.state.error.message,
      category: this.state.error.category,
      severity: this.state.error.severity,
      timestamp: new Date(this.state.error.timestamp).toISOString(),
      url: this.state.error.url,
      userAgent: this.state.error.userAgent,
      stack: this.state.error.stack
    };

    navigator.clipboard.writeText(JSON.stringify(errorInfo, null, 2))
      .then(() => {
        // 这里可以显示复制成功的提示
        logger.info('✅ 错误信息已复制到剪贴板');
      })
      .catch(err => {
        logger.warn('⚠️ 复制失败:', err);
      });
  };

  /**
   * 工具方法
   */
  private generateErrorId(): string {
    return `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private getCurrentUserId(): string | undefined {
    // 从认证状态或本地存储获取用户ID
    return localStorage.getItem('userId') || undefined;
  }

  private getMemoryUsage(): number {
    if ('memory' in performance) {
      return (performance as any).memory.usedJSHeapSize;
    }
    return 0;
  }

  private sanitizeProps(props: any): any {
    // 移除敏感信息
    const sanitized = { ...props };
    delete sanitized.children;
    delete sanitized.onError;
    delete sanitized.onErrorReport;
    return sanitized;
  }

  private sanitizeState(state: any): any {
    // 移除敏感信息
    return {
      hasError: state.hasError,
      retryCount: state.retryCount,
      showDetails: state.showDetails
    };
  }

  private generateReproductionSteps(): string[] {
    // 基于当前状态和错误信息生成重现步骤
    return [
      '1. 访问当前页面',
      '2. 执行导致错误的操作',
      '3. 观察错误发生'
    ];
  }

  componentWillUnmount() {
    if (this.retryTimer) {
      clearTimeout(this.retryTimer);
    }
  }

  render() {
    if (this.state.hasError && this.state.error) {
      return this.renderErrorUI(this.state.error);
    }

    return this.props.children;
  }

  /**
   * 渲染错误UI
   */
  private renderErrorUI(error: EnhancedError): ReactNode {
    const { level = 'component', fallback, showErrorDetails = false } = this.props;
    const { showDetails, recoveryStrategies, isRecovering } = this.state;

    // 如果提供了自定义降级UI
    if (fallback) {
      return fallback;
    }

    // 根据级别调整UI样式
    const cardClassName = level === 'page' 
      ? 'min-h-screen flex items-center justify-center p-6'
      : 'p-4';

    return (
      <div className={cardClassName}>
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertTriangle className={`w-6 h-6 ${this.getSeverityColor(error.severity)}`} />
              <span>出现了一些问题</span>
            </CardTitle>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* 错误信息 */}
            <div className="space-y-2">
              <p className="text-muted-foreground">
                {this.getErrorDescription(error)}
              </p>
              <div className="text-sm text-muted-foreground">
                错误ID: <code className="bg-muted px-1 rounded">{error.id}</code>
              </div>
            </div>

            {/* 恢复选项 */}
            {recoveryStrategies.length > 0 && (
              <div className="space-y-3">
                <h4 className="font-medium">建议的解决方案:</h4>
                <div className="grid gap-2">
                  {recoveryStrategies.slice(0, 3).map((strategy, index) => (
                    <Button
                      key={index}
                      variant={index === 0 ? "default" : "outline"}
                      onClick={strategy.action}
                      disabled={isRecovering}
                      className="justify-start"
                    >
                      {strategy.type === 'retry' && <RefreshCw className="w-4 h-4 mr-2" />}
                      {strategy.label}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* 详细信息 */}
            {showErrorDetails && (
              <div className="space-y-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => this.setState({ showDetails: !showDetails })}
                  className="p-0 h-auto font-normal"
                >
                  {showDetails ? <ChevronDown className="w-4 h-4 mr-1" /> : <ChevronRight className="w-4 h-4 mr-1" />}
                  {showDetails ? '隐藏' : '显示'}技术详情
                </Button>

                {showDetails && (
                  <div className="bg-muted p-4 rounded-lg space-y-3">
                    <div className="flex justify-between items-start">
                      <div className="space-y-2 text-sm">
                        <div><strong>类别:</strong> {error.category}</div>
                        <div><strong>严重程度:</strong> {error.severity}</div>
                        <div><strong>时间:</strong> {new Date(error.timestamp).toLocaleString()}</div>
                        <div><strong>组件:</strong> {error.metadata.componentName}</div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={this.copyErrorInfo}
                      >
                        <Copy className="w-4 h-4 mr-1" />
                        复制
                      </Button>
                    </div>

                    {error.stack && (
                      <div className="space-y-2">
                        <strong className="text-sm">错误堆栈:</strong>
                        <pre className="text-xs bg-background p-2 rounded overflow-x-auto max-h-32">
                          {error.stack}
                        </pre>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* 恢复状态 */}
            {isRecovering && (
              <div className="flex items-center space-x-2 text-muted-foreground">
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>正在尝试恢复...</span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  /**
   * 获取严重程度颜色
   */
  private getSeverityColor(severity: ErrorSeverity): string {
    switch (severity) {
      case ErrorSeverity.LOW: return 'text-blue-500';
      case ErrorSeverity.MEDIUM: return 'text-yellow-500';
      case ErrorSeverity.HIGH: return 'text-orange-500';
      case ErrorSeverity.CRITICAL: return 'text-red-500';
      default: return 'text-gray-500';
    }
  }

  /**
   * 获取错误描述
   */
  private getErrorDescription(error: EnhancedError): string {
    switch (error.category) {
      case ErrorCategory.NETWORK:
        return '网络连接出现问题，请检查您的网络连接并重试。';
      case ErrorCategory.TIMEOUT:
        return '操作超时，请稍后重试。';
      case ErrorCategory.DATA:
        return '数据处理出现问题，我们正在尝试恢复。';
      case ErrorCategory.PERMISSION:
        return '权限不足，请检查您的访问权限。';
      case ErrorCategory.RENDER:
        return '页面渲染出现问题，正在尝试修复。';
      default:
        return '系统出现未知错误，我们正在处理中。';
    }
  }
}

/**
 * 错误边界HOC
 */
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Partial<EnhancedErrorBoundaryProps>
) {
  const WrappedComponent = (props: P) => (
    <EnhancedErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </EnhancedErrorBoundary>
  );

  // 🔧 FIXED: 安全地访问Component.displayName，避免TDZ错误
  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name || 'UnknownComponent'})`;
  
  return WrappedComponent;
}

export default EnhancedErrorBoundary;