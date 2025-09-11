/**
 * 🔄 加载旋转器组件
 * 
 * 功能：
 * - 显示加载状态
 * - 支持不同尺寸
 * - 支持自定义文本
 * - 响应式设计
 */

import React from 'react';
import { cn } from '@/lib/utils';

export interface LoadingSpinnerProps {
  /** 尺寸大小 */
  size?: 'sm' | 'md' | 'lg' | 'xl';
  /** 加载文本 */
  text?: string;
  /** 是否显示文本 */
  showText?: boolean;
  /** 自定义类名 */
  className?: string;
  /** 是否居中显示 */
  centered?: boolean;
}

/**
 * 加载旋转器组件
 */
export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  text = '加载中...',
  showText = true,
  className,
  centered = true
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12'
  };

  const textSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
    xl: 'text-lg'
  };

  const containerClasses = cn(
    'flex flex-col items-center gap-2',
    centered && 'justify-center min-h-[200px]',
    className
  );

  return (
    <div className={containerClasses}>
      {/* 旋转器 */}
      <div
        className={cn(
          'animate-spin rounded-full border-2 border-border border-t-blue-600',
          sizeClasses[size]
        )}
        role="status"
        aria-label="加载中"
      />
      
      {/* 加载文本 */}
      {showText && (
        <span className={cn(
          'text-muted-foreground',
          textSizeClasses[size]
        )}>
          {text}
        </span>
      )}
    </div>
  );
};

/**
 * 全屏加载组件
 */
export const FullScreenLoader: React.FC<{
  text?: string;
}> = ({ text = '正在加载...' }) => {
  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
      <LoadingSpinner size="lg" text={text} />
    </div>
  );
};

/**
 * 内联加载组件
 */
export const InlineLoader: React.FC<{
  text?: string;
  size?: 'sm' | 'md';
}> = ({ text = '加载中', size = 'sm' }) => {
  return (
    <div className="flex items-center gap-2 py-2">
      <div
        className={cn(
          'animate-spin rounded-full border-2 border-border border-t-blue-600',
          size === 'sm' ? 'w-4 h-4' : 'w-5 h-5'
        )}
      />
      <span className="text-sm text-muted-foreground">{text}</span>
    </div>
  );
};

/**
 * 按钮加载状态组件
 */
export const ButtonLoader: React.FC = () => {
  return (
    <div className="w-4 h-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
  );
};

export default LoadingSpinner;
