/**
 * 全局错误处理组件
 * 提供统一的错误显示和处理机制
 */

import React, { useState, useEffect } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { X, RefreshCw, AlertTriangle, Wifi, Shield, Clock } from 'lucide-react';
import { logger } from '@/utils/logger';

/**
 * 错误类型
 */
export interface ErrorInfo {
  id: string;
  message: string;
  suggestion?: string;
  type: 'network' | 'auth' | 'permission' | 'timeout' | 'server' | 'cors' | 'unknown';
  timestamp: number;
  url?: string;
  status?: number;
  code?: string;
}

/**
 * 全局错误状态
 */
interface GlobalErrorState {
  errors: ErrorInfo[];
  isVisible: boolean;
}

// 全局错误状态
const globalErrorState: GlobalErrorState = {
  errors: [],
  isVisible: false
};

// 错误监听器
const errorListeners: Array<(state: GlobalErrorState) => void> = [];

/**
 * 添加错误监听器
 */
export function addErrorListener(listener: (state: GlobalErrorState) => void) {
  errorListeners.push(listener);
  return () => {
    const index = errorListeners.indexOf(listener);
    if (index > -1) {
      errorListeners.splice(index, 1);
    }
  };
}

/**
 * 通知所有监听器
 */
function notifyListeners() {
  errorListeners.forEach(listener => listener(globalErrorState));
}

/**
 * 添加全局错误
 */
export function addGlobalError(error: Omit<ErrorInfo, 'id' | 'timestamp'>) {
  const errorInfo: ErrorInfo = {
    ...error,
    id: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    timestamp: Date.now()
  };
  
  globalErrorState.errors.push(errorInfo);
  globalErrorState.isVisible = true;
  
  // 自动清理旧错误（保留最近10个）
  if (globalErrorState.errors.length > 10) {
    globalErrorState.errors = globalErrorState.errors.slice(-10);
  }
  
  notifyListeners();
  
  // 自动隐藏某些类型的错误
  if (error.type === 'network' || error.type === 'timeout') {
    setTimeout(() => {
      removeGlobalError(errorInfo.id);
    }, 10000); // 10秒后自动移除
  }
}

/**
 * 移除全局错误
 */
export function removeGlobalError(errorId: string) {
  globalErrorState.errors = globalErrorState.errors.filter(e => e.id !== errorId);
  
  if (globalErrorState.errors.length === 0) {
    globalErrorState.isVisible = false;
  }
  
  notifyListeners();
}

/**
 * 清除所有错误
 */
export function clearAllErrors() {
  globalErrorState.errors = [];
  globalErrorState.isVisible = false;
  notifyListeners();
}

/**
 * 从API错误创建错误信息
 */
export function createErrorFromAPIError(error: any, url?: string): Omit<ErrorInfo, 'id' | 'timestamp'> {
  let type: ErrorInfo['type'] = 'unknown';
  const message = error.message || '未知错误';
  const suggestion = error.suggestion || '';
  
  // 根据错误特征判断类型
  if (error.code === 'ERR_NETWORK' || error.code === 'ECONNABORTED') {
    type = 'network';
  } else if (error.status === 401) {
    type = 'auth';
  } else if (error.status === 403) {
    type = 'permission';
  } else if (error.code === 'ECONNABORTED' || message.includes('timeout')) {
    type = 'timeout';
  } else if (error.status >= 500) {
    type = 'server';
  } else if (message.includes('CORS') || message.includes('cross-origin')) {
    type = 'cors';
  }
  
  return {
    message,
    suggestion,
    type,
    url,
    status: error.status,
    code: error.code
  };
}

/**
 * 获取错误图标
 */
function getErrorIcon(type: ErrorInfo['type']) {
  switch (type) {
    case 'network':
      return <Wifi className="h-4 w-4" />;
    case 'auth':
    case 'permission':
      return <Shield className="h-4 w-4" />;
    case 'timeout':
      return <Clock className="h-4 w-4" />;
    case 'server':
    case 'cors':
    case 'unknown':
    default:
      return <AlertTriangle className="h-4 w-4" />;
  }
}

/**
 * 获取错误颜色
 */
function getErrorVariant(type: ErrorInfo['type']): 'default' | 'destructive' {
  switch (type) {
    case 'network':
    case 'timeout':
      return 'default';
    case 'auth':
    case 'permission':
    case 'server':
    case 'cors':
    case 'unknown':
    default:
      return 'destructive';
  }
}

/**
 * 全局错误处理组件
 */
export const GlobalErrorHandler: React.FC = () => {
  const [state, setState] = useState<GlobalErrorState>(globalErrorState);

  useEffect(() => {
    const unsubscribe = addErrorListener(setState);
    return unsubscribe;
  }, []);

  if (!state.isVisible || state.errors.length === 0) {
    return null;
  }

  const latestError = state.errors[state.errors.length - 1];

  return (
    <div className="fixed top-4 right-4 z-50 max-w-md">
      <Alert variant={getErrorVariant(latestError.type)} className="relative">
        <div className="flex items-start gap-2">
          {getErrorIcon(latestError.type)}
          <div className="flex-1">
            <AlertTitle className="text-sm font-medium">
              {latestError.message}
            </AlertTitle>
            {latestError.suggestion && (
              <AlertDescription className="text-xs mt-1">
                {latestError.suggestion}
              </AlertDescription>
            )}
            {state.errors.length > 1 && (
              <AlertDescription className="text-xs mt-1 opacity-75">
                还有 {state.errors.length - 1} 个错误
              </AlertDescription>
            )}
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => window.location.reload()}
              className="h-6 w-6 p-0"
              title="刷新页面"
            >
              <RefreshCw className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => removeGlobalError(latestError.id)}
              className="h-6 w-6 p-0"
              title="关闭"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </Alert>
    </div>
  );
};

/**
 * 设置全局错误处理
 */
export function setupGlobalErrorHandler() {
  // 捕获未处理的Promise拒绝
  window.addEventListener('unhandledrejection', (event) => {
    console.error('未处理的Promise拒绝:', event.reason);
    
    const errorInfo = createErrorFromAPIError(event.reason);
    addGlobalError({
      ...errorInfo,
      message: errorInfo.message || '发生了未知错误'
    });
  });

  // 捕获全局JavaScript错误
  window.addEventListener('error', (event) => {
    console.error('全局JavaScript错误:', event.error);
    
    addGlobalError({
      message: event.message || '页面发生错误',
      suggestion: '请刷新页面重试',
      type: 'unknown',
      url: event.filename
    });
  });

  logger.debug('✅ 全局错误处理已设置');
}

export default GlobalErrorHandler;
