/**
 * ✅ FIXED: 2025-08-04 架构级重构 - 安全的Tooltip组件包装器
 * 
 * 
 * 🐛 原问题：Radix UI Tooltip的setRef函数在Array.map中被无限调用
 * 🔧 修复方案：创建安全的ref处理机制，添加防抖和循环检测
 */

import React, { useRef, useCallback, useMemo, useEffect, useState } from 'react';
import { logger } from '@/utils/logger';
// ✅ FIXED: 2025-08-04 完全移除对原始Tooltip组件的依赖，使用纯CSS实现
// 不再导入会导致setRef无限循环的Radix UI Tooltip组件

// ✅ ref调用计数器，用于检测无限循环
const refCallCounts = new Map<string, number>();
const refCallTimestamps = new Map<string, number>();
const MAX_REF_CALLS = 10; // 最大ref调用次数
const RESET_INTERVAL = 1000; // 1秒后重置计数

/**
 * 安全的ref处理函数 - 防止无限循环
 */
// ✅ 转换为自定义Hook，符合 Hooks 规则
const useSafeRef = (componentId: string) => {
  return useCallback((node: HTMLElement | null) => {
    const now = Date.now();
    const lastTimestamp = refCallTimestamps.get(componentId) || 0;

    // 如果距离上次调用超过重置间隔，重置计数
    if (now - lastTimestamp > RESET_INTERVAL) {
      refCallCounts.set(componentId, 0);
    }

    const currentCount = refCallCounts.get(componentId) || 0;

    // 检测无限循环
    if (currentCount >= MAX_REF_CALLS) {
      console.warn(`🚨 SafeTooltip: detecting到refnone限loop，componentID: ${componentId}`);
      return; // 阻止进一步的ref调用
    }

    // 更新计数和时间戳
    refCallCounts.set(componentId, currentCount + 1);
    refCallTimestamps.set(componentId, now);

    // 正常处理ref
    if (node) {
      // 这里可以添加必要的DOM操作
      logger.debug('✅ SafeTooltip: ref设置成功，组件ID: ${componentId}');
    }
  }, [componentId]);
};

export interface SafeTooltipProps {
  children: React.ReactNode;
  content: React.ReactNode;
  side?: 'top' | 'right' | 'bottom' | 'left';
  align?: 'start' | 'center' | 'end';
  delayDuration?: number;
  skipDelayDuration?: number;
  disabled?: boolean;
  className?: string;
}

/**
 * 安全的Tooltip组件 - 防止setRef无限循环
 */
export const SafeTooltip: React.FC<SafeTooltipProps> = React.memo(({
  children,
  content,
  side = 'bottom',
  align = 'center',
  delayDuration = 400,
  skipDelayDuration = 150,
  disabled = false,
  className
}) => {
  // ✅ 生成唯一的组件ID
  const componentId = useMemo(() => {
    return `safe-tooltip-${Math.random().toString(36).substr(2, 9)}`;
  }, []);
  
  // ✅ 创建安全的ref处理函数
  const safeRef = useSafeRef(componentId);
  
  // ✅ 防抖状态管理
  const [isOpen, setIsOpen] = React.useState(false);
  const openTimeoutRef = useRef<NodeJS.Timeout>();
  const closeTimeoutRef = useRef<NodeJS.Timeout>();
  
  // ✅ 安全的开启/关闭处理
  const handleOpenChange = useCallback((open: boolean) => {
    // 清除之前的定时器
    if (openTimeoutRef.current) {
      clearTimeout(openTimeoutRef.current);
    }
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
    }
    
    if (open) {
      openTimeoutRef.current = setTimeout(() => {
        setIsOpen(true);
      }, delayDuration);
    } else {
      closeTimeoutRef.current = setTimeout(() => {
        setIsOpen(false);
      }, 100);
    }
  }, [delayDuration]);
  
  // ✅ 清理定时器
  useEffect(() => {
    return () => {
      if (openTimeoutRef.current) {
        clearTimeout(openTimeoutRef.current);
      }
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current);
      }
    };
  }, []);
  
  // 如果禁用，直接返回子组件
  if (disabled) {
    return <>{children}</>;
  }
  
  return (
    <div
      className={`relative inline-block ${className || ''}`}
      onMouseEnter={() => handleOpenChange(true)}
      onMouseLeave={() => handleOpenChange(false)}
      onFocus={() => handleOpenChange(true)}
      onBlur={() => handleOpenChange(false)}
      ref={safeRef}
    >
      {children}
      {isOpen && content && (
        <div
          className={`
            absolute z-50 px-2 py-1 text-xs text-primary-foreground bg-foreground rounded shadow-lg
            whitespace-nowrap pointer-events-none animation-fade-in
            ${side === 'top' ? 'bottom-full mb-1' : ''}
            ${side === 'bottom' ? 'top-full mt-1' : ''}
            ${side === 'left' ? 'right-full mr-1' : ''}
            ${side === 'right' ? 'left-full ml-1' : ''}
            ${align === 'center' ? 'left-1/2 transform -translate-x-1/2' : ''}
            ${align === 'start' ? 'left-0' : ''}
            ${align === 'end' ? 'right-0' : ''}
          `}
        >
          {content}
        </div>
      )}
    </div>
  );
});

// ✅ 设置displayName以便调试
SafeTooltip.displayName = 'SafeTooltip';

/**
 * 清理ref调用计数器的工具函数
 */
export const clearRefCallCounts = () => {
  refCallCounts.clear();
  refCallTimestamps.clear();
  console.log('🧹 SafeTooltip: ref调用计数器alreadycleaning');
};

/**
 * 获取ref调用统计信息
 */
export const getRefCallStats = () => {
  const stats = Array.from(refCallCounts.entries()).map(([id, count]) => ({
    componentId: id,
    callCount: count,
    lastTimestamp: refCallTimestamps.get(id) || 0
  }));
  
  return {
    totalComponents: stats.length,
    totalCalls: stats.reduce((sum, stat) => sum + stat.callCount, 0),
    components: stats
  };
};

export default SafeTooltip;
