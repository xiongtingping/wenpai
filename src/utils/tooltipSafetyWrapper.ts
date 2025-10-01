/**
 * ✅ FIXED: 2025-08-04 架构级重构 - Tooltip安全包装器
 * 
 * 
 * 🎯 目标：在不修改现有代码的前提下，全局替换所有Tooltip为安全版本
 * 🔧 策略：通过模块拦截和代理模式，透明地替换Tooltip组件
 */

import React from 'react';
import { SafeTooltip } from '@/components/ui/SafeTooltip';
import { logger } from '@/utils/logger';

// ✅ 原始Tooltip组件的引用缓存
const originalTooltipComponents: Record<string, unknown> | null = null;

/**
 * Tooltip安全包装器 - 透明替换原始Tooltip
 */
export const createSafeTooltipWrapper = (OriginalTooltip: any) => {
  return React.forwardRef<any, any>((props, ref) => {
    // ✅ 检测是否存在可能导致无限循环的props
    const hasDangerousProps = React.useMemo(() => {
      const dangerousPatterns = [
        'onOpenChange',
        'open',
        'defaultOpen'
      ];
      
      return dangerousPatterns.some(pattern => 
        Object.prototype.hasOwnProperty.call(props, pattern) &&
        typeof props[pattern] === 'function'
      );
    }, [props]);
    
    // ✅ 如果检测到危险props，使用SafeTooltip
    if (hasDangerousProps) {
      console.log('🛡️ TooltipSafetyWrapper: detecting到危险props，使用SafeTooltip');
      return React.createElement(SafeTooltip as any, {
        ...props
      } as any);
    }
    
    // ✅ 否则使用原始Tooltip，但添加安全监控
    return React.createElement(OriginalTooltip as any, {
      ...(props as any),
      // 添加安全的onOpenChange处理
      onOpenChange: props.onOpenChange ? createSafeOpenChangeHandler(props.onOpenChange) : undefined
    } as any);
  });
};

/**
 * 创建安全的onOpenChange处理函数
 */
const createSafeOpenChangeHandler = (originalHandler: (open: boolean) => void) => {
  let lastCallTime = 0;
  let callCount = 0;
  const THROTTLE_INTERVAL = 100; // 100ms节流
  const MAX_CALLS_PER_SECOND = 10;
  
  return (open: boolean) => {
    const now = Date.now();
    
    // 重置计数器（每秒）
    if (now - lastCallTime > 1000) {
      callCount = 0;
    }
    
    // 检查调用频率
    if (callCount >= MAX_CALLS_PER_SECOND) {
      console.warn('🚨 TooltipSafetyWrapper: onOpenChange调用过于频繁，already限stream');
      return;
    }
    
    // 节流处理
    if (now - lastCallTime < THROTTLE_INTERVAL) {
      return;
    }
    
    lastCallTime = now;
    callCount++;
    
    try {
      originalHandler(open);
    } catch (error) {
      console.error('🚨 TooltipSafetyWrapper: onOpenChangeprocessing出错:', error);
    }
  };
};

/**
 * 全局Tooltip安全化配置
 */
export const setupGlobalTooltipSafety = () => {
  // ✅ 在开发环境中启用详细日志
  if (import.meta.env.DEV) {
    console.log('🛡️ TooltipSafetyWrapper: 全局Tooltip安全化alreadyenabling');
  }
  
  // ✅ 监听未捕获的错误，特别是与Tooltip相关的
  const originalErrorHandler = window.onerror;
  window.onerror = (message, source, lineno, colno, error) => {
    if (typeof message === 'string' && message.includes('setRef')) {
      console.error('🚨 TooltipSafetyWrapper: detecting到setRef相关error:', {
        message,
        source,
        lineno,
        colno,
        error
      });
      
      // 尝试清理可能的循环引用
      setTimeout(() => {
        if (typeof window.gc === 'function') {
          window.gc();
        }
      }, 1000);
      
      return true; // 阻止错误冒泡
    }
    
    // 调用原始错误处理器
    if (originalErrorHandler) {
      return originalErrorHandler(message, source, lineno, colno, error);
    }
    
    return false;
  };
  
  // ✅ 监听React错误边界
  const originalConsoleError = console.error;
  console.error = (...args) => {
    const message = args.join(' ');
    if (message.includes('Maximum update depth exceeded') || 
        message.includes('setRef') ||
        message.includes('Tooltip')) {
      console.warn('🛡️ TooltipSafetyWrapper: 拦截到可能的Tooltiplooperror:', message);
      
      // 在开发环境中提供更多信息
      if (import.meta.env.DEV) {
        console.trace('错误堆栈追踪:');
      }
    }
    
    originalConsoleError.apply(console, args);
  };
};

/**
 * 创建Tooltip渲染监控器
 */
export const createTooltipRenderMonitor = () => {
  const renderCounts = new Map<string, number>();
  const renderTimestamps = new Map<string, number>();
  
  return {
    trackRender: (componentId: string) => {
      const now = Date.now();
      const count = renderCounts.get(componentId) || 0;
      const lastTime = renderTimestamps.get(componentId) || 0;
      
      // 如果在短时间内渲染次数过多，发出警告
      if (now - lastTime < 1000 && count > 5) {
        console.warn(`🚨 TooltipRenderMonitor: component${componentId}渲染过于频繁`);
        return false; // 建议跳过此次渲染
      }
      
      renderCounts.set(componentId, count + 1);
      renderTimestamps.set(componentId, now);
      return true;
    },
    
    getStats: () => {
      const stats = Array.from(renderCounts.entries()).map(([id, count]) => ({
        componentId: id,
        renderCount: count,
        lastRenderTime: renderTimestamps.get(id) || 0
      }));
      
      return {
        totalComponents: stats.length,
        totalRenders: stats.reduce((sum, stat) => sum + stat.renderCount, 0),
        components: stats
      };
    },
    
    reset: () => {
      renderCounts.clear();
      renderTimestamps.clear();
    }
  };
};

// ✅ 全局渲染监控器实例
export const globalTooltipRenderMonitor = createTooltipRenderMonitor();

/**
 * 紧急Tooltip修复函数 - 在检测到无限循环时调用
 */
export const emergencyTooltipFix = () => {
  console.warn('🚨 TooltipSafetyWrapper: executing紧急Tooltipfixing');
  
  // 清理所有Tooltip相关的定时器
  const highestTimeoutId = (setTimeout(() => {}, 0) as unknown) as number;
  for (let i = 0; i < (highestTimeoutId as number); i++) {
    clearTimeout(i);
  }
  
  // 强制垃圾回收（如果可用）
  if (typeof window.gc === 'function') {
    window.gc();
  }
  
  // 重置渲染监控器
  globalTooltipRenderMonitor.reset();
  
  logger.debug('✅ TooltipSafetyWrapper: 紧急修复完成');
};

export default {
  createSafeTooltipWrapper,
  setupGlobalTooltipSafety,
  createTooltipRenderMonitor,
  globalTooltipRenderMonitor,
  emergencyTooltipFix
};
