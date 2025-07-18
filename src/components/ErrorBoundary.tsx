import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw, Home, Bug } from 'lucide-react';

/**
 * 错误边界状态接口
 */
interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorId: string;
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
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: ''
    };
  }

  /**
   * 捕获子组件错误
   */
  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error,
      errorId: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };
  }

  /**
   * 错误信息记录
   */
  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('🚨 应用错误被捕获:', {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      errorId: this.state.errorId,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href
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
        }
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
      console.error('错误报告发送失败:', reportError);
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
      errorId: ''
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
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <CardTitle className="text-xl text-gray-900">
                应用遇到问题
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <p className="text-gray-600 mb-4">
                  抱歉，应用遇到了一个意外错误。我们已经记录了这个问题。
                </p>
                
                {this.state.error && (
                  <div className="bg-gray-100 p-3 rounded-lg text-left">
                    <p className="text-sm font-medium text-gray-900 mb-1">错误信息:</p>
                    <p className="text-xs text-gray-600 break-words">
                      {this.state.error.message}
                    </p>
                    {this.state.errorId && (
                      <p className="text-xs text-gray-500 mt-1">
                        错误ID: {this.state.errorId}
                      </p>
                    )}
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-2">
                <Button 
                  onClick={this.handleReset}
                  className="w-full"
                  variant="outline"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  重试
                </Button>
                
                <Button 
                  onClick={this.handleRefresh}
                  className="w-full"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  刷新页面
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
                  <summary className="cursor-pointer text-sm text-gray-600 hover:text-gray-900">
                    <Bug className="h-4 w-4 inline mr-1" />
                    开发模式：查看错误详情
                  </summary>
                  <pre className="mt-2 p-3 bg-gray-100 rounded text-xs overflow-auto max-h-40">
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