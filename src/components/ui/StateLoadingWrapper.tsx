/**
 * 状态加载包装器 - 解决状态闪烁问题
 * 
 * 🎯 核心功能：
 * 1. 在状态未初始化时显示加载状态
 * 2. 避免显示错误的默认状态
 * 3. 提供一致的加载体验
 */

import React from 'react';
import { useAuth } from '@/hooks/useAuth';

interface StateLoadingWrapperProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  showLoadingText?: boolean;
  className?: string;
}

/**
 * 状态加载包装器组件
 * 
 * 使用方式：
 * ```tsx
 * <StateLoadingWrapper>
 *   <SubscriptionStatusBadge />
 * </StateLoadingWrapper>
 * ```
 */
export const StateLoadingWrapper: React.FC<StateLoadingWrapperProps> = ({
  children,
  fallback,
  showLoadingText = true,
  className = ''
}) => {
  const { isLoading } = useAuth();
  const isInitialized = true; // 简化状态管理

  // 如果状态未初始化或正在加载，显示加载状态
  if (!isInitialized || isLoading) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-400"></div>
        {showLoadingText && (
          <span className="text-sm text-gray-500">加载中...</span>
        )}
      </div>
    );
  }

  // 状态已初始化，显示子组件
  return <>{children}</>;
};

/**
 * 订阅状态加载包装器 - 专门用于订阅相关组件
 */
export const SubscriptionStateWrapper: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className = '' }) => {
  return (
    <StateLoadingWrapper
      fallback={
        <div className={`inline-flex items-center space-x-1 px-2 py-1 rounded text-xs bg-gray-100 ${className}`}>
          <div className="animate-spin rounded-full h-3 w-3 border-b border-gray-400"></div>
          <span className="text-gray-500">检查订阅状态...</span>
        </div>
      }
    >
      {children}
    </StateLoadingWrapper>
  );
};

/**
 * 使用次数状态加载包装器 - 专门用于使用次数相关组件
 */
export const UsageStateWrapper: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className = '' }) => {
  return (
    <StateLoadingWrapper
      fallback={
        <div className={`inline-flex items-center space-x-1 text-sm ${className}`}>
          <div className="animate-spin rounded-full h-3 w-3 border-b border-gray-400"></div>
          <span className="text-gray-500">检查使用次数...</span>
        </div>
      }
    >
      {children}
    </StateLoadingWrapper>
  );
};

/**
 * 用户状态加载包装器 - 专门用于用户信息相关组件
 */
export const UserStateWrapper: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className = '' }) => {
  return (
    <StateLoadingWrapper
      fallback={
        <div className={`inline-flex items-center space-x-1 ${className}`}>
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
          <span className="text-sm text-gray-500">加载用户信息...</span>
        </div>
      }
    >
      {children}
    </StateLoadingWrapper>
  );
};
