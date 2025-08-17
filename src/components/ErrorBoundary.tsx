import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw, Home, Bug } from 'lucide-react';
import { logger } from '@/utils/logger';

/**
 * 错误边界状态接口
 */
interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorId: string;
  isInitializationError: boolean;
}

/**
 * 错误边界属性接口
 */
interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

/**
 * 全局错误边界组件
 * 用于捕获和处理应用中的JavaScript错误
 * 特别处理React Router和认证上下文初始化冲突
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: '',
      isInitializationError: false
    };
  }

  /**
   * 捕获子组件错误
   */
  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    // 检查是否为初始化错误
    const isInitializationError = ErrorBoundary.isInitializationError(error);
    
    return {
      hasError: true,
      error,
      errorId: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      isInitializationError
    };
  }

  /**
   * 判断是否为初始化错误
   */
  private static isInitializationError(error: Error): boolean {
    const errorMessage = error.message.toLowerCase();
    const errorStack = error.stack?.toLowerCase() || '';

    // 检查常见的初始化错误模式
    const initializationPatterns = [
      'useunifiedauth must be used within a unifiedauthprovider',
      'useauth must be used within an authprovider',
      'usecontext must be used within a provider',
      'router context',
      'navigation context',
      'cannot read properties of undefined',
      'cannot read property',
      'undefined is not an object',
      'null is not an object',
      'yield*',
      'suspended while responding to synchronous input',
      'chunk load error',
      'loading chunk',
      'network error',
      'failed to fetch'
    ];

    return initializationPatterns.some(pattern =>
      errorMessage.includes(pattern) || errorStack.includes(pattern)
    );
  }

  /**
   * 错误信息记录
   */
  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // 使用logger系统记录错误，生产环境仍然会记录错误信息
    logger.error('🚨 应用错误被捕获:', {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      errorId: this.state.errorId,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      isInitializationError: this.state.isInitializationError,
      // 增加更多诊断信息
      errorName: error.name,
      errorCause: (error as any).cause,
      reactVersion: React.version
    });

    this.setState({
      errorInfo
    });

    // 可以在这里发送错误报告到服务器
    this.reportError(error, errorInfo);
  }

  /**
   * 报告错误到服务器
   */
  private reportError(error: Error, errorInfo: ErrorInfo) {
    try {
      // 构建错误报告
      const errorReport = {
        errorId: this.state.errorId,
        message: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href,
        buildInfo: {
          version: import.meta.env.VITE_APP_VERSION || 'unknown',
          environment: import.meta.env.MODE,
          buildTime: import.meta.env.VITE_BUILD_TIME || 'unknown'
        },
        isInitializationError: this.state.isInitializationError
      };

      // 发送错误报告（可选）
      if (import.meta.env.PROD) {
        // 在生产环境中发送错误报告
        fetch('/.netlify/functions/error-report', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(errorReport)
        }).catch(() => {
          // 静默处理发送失败
        });
      }
    } catch (reportError) {
      logger.error('错误报告发送失败:', reportError);
    }
  }

  /**
   * 重置错误状态
   */
  private handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: '',
      isInitializationError: false
    });
  };

  /**
   * 刷新页面
   */
  private handleRefresh = () => {
    window.location.reload();
  };

  /**
   * 返回首页
   */
  private handleGoHome = () => {
    window.location.href = '/';
  };

  /**
   * 渲染错误界面
   */
  render() {
    if (this.state.hasError) {
      // 如果有自定义fallback，使用它
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // 默认错误界面
      return (
        <div className="min-h-screen bg-accent flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 bg-destructive/10 rounded-full flex items-center justify-center mb-4">
                <AlertTriangle className="h-6 w-6 text-destructive" />
              </div>
              <CardTitle className="text-xl text-foreground">
                {this.state.isInitializationError ? '应用初始化失败' : '应用遇到问题'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <p className="text-muted-foreground mb-4">
                  {this.state.isInitializationError 
                    ? '应用初始化过程中遇到问题，这通常是由于配置或依赖问题导致的。'
                    : '抱歉，应用遇到了一个意外错误。我们已经记录了这个问题。'
                  }
                </p>
                
                {this.state.error && (
                  <div className="bg-accent p-3 rounded-lg text-left">
                    <p className="text-sm font-medium text-foreground mb-1">错误信息:</p>
                    <p className="text-xs text-muted-foreground break-words">
                      {this.state.error.message}
                    </p>
                    {this.state.errorId && (
                      <p className="text-xs text-muted-foreground mt-1">
                        错误ID: {this.state.errorId}
                      </p>
                    )}
                    {this.state.isInitializationError && (
                      <p className="text-xs text-primary mt-1">
                        💡 建议：尝试刷新页面或清除浏览器缓存
                      </p>
                    )}
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-2">
                <Button 
                  onClick={this.handleRefresh}
                  className="w-full"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  刷新页面
                </Button>
                
                <Button 
                  onClick={this.handleReset}
                  className="w-full"
                  variant="outline"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  重试
                </Button>
                
                <Button 
                  onClick={this.handleGoHome}
                  variant="ghost"
                  className="w-full"
                >
                  <Home className="h-4 w-4 mr-2" />
                  返回首页
                </Button>
              </div>

              {import.meta.env.DEV && this.state.errorInfo && (
                <details className="mt-4">
                  <summary className="cursor-pointer text-sm text-muted-foreground hover:text-foreground">
                    <Bug className="h-4 w-4 inline mr-1" />
                    开发模式：查看错误详情
                  </summary>
                  <pre className="mt-2 p-3 bg-accent rounded text-xs overflow-auto max-h-40">
                    {this.state.errorInfo.componentStack}
                  </pre>
                </details>
              )}
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * 函数式错误边界Hook
 */
export function useErrorBoundary() {
  const [error, setError] = React.useState<Error | null>(null);

  React.useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      console.error('🚨 全局错误被捕获:', event.error);
      setError(event.error);
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.error('🚨 未处理的Promise拒绝:', event.reason);
      setError(new Error(`Promise rejected: ${event.reason}`));
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  return error;
} 