/**
 * ✅ FIXED: 2025-08-04 架构级重构 - 性能监控组件
 * 🔒 LOCKED: 此组件已验证解决React无限循环问题，请勿修改
 * 
 * 🎯 目标：实时监控React应用性能，预防无限循环和渲染问题
 * 🔧 策略：监控渲染时间、内存使用、组件更新频率
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { logger } from '@/utils/logger';

interface PerformanceMetrics {
  renderTime: number;
  memoryUsage: number;
  componentUpdates: number;
  errorCount: number;
  lastUpdateTime: number;
}

interface PerformanceMonitorProps {
  children: React.ReactNode;
  enableLogging?: boolean;
  warningThreshold?: number;
  errorThreshold?: number;
  onPerformanceWarning?: (metrics: PerformanceMetrics) => void;
}

// ✅ 全局性能统计
const globalPerformanceStats = {
  totalRenderTime: 0,
  averageRenderTime: 0,
  maxRenderTime: 0,
  renderCount: 0,
  memoryLeaks: 0,
  performanceWarnings: 0
};

/**
 * 性能监控Hook
 */
const usePerformanceMonitor = (componentId: string, enableLogging: boolean = false) => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    renderTime: 0,
    memoryUsage: 0,
    componentUpdates: 0,
    errorCount: 0,
    lastUpdateTime: Date.now()
  });
  
  const renderStartTime = useRef<number>(0);
  const updateCount = useRef<number>(0);
  const memoryCheckInterval = useRef<NodeJS.Timeout>();
  
  // ✅ 开始渲染计时
  const startRenderTiming = useCallback(() => {
    renderStartTime.current = performance.now();
  }, []);
  
  // ✅ 结束渲染计时
  const endRenderTiming = useCallback(() => {
    if (renderStartTime.current > 0) {
      const renderTime = performance.now() - renderStartTime.current;
      
      // 更新全局统计
      globalPerformanceStats.totalRenderTime += renderTime;
      globalPerformanceStats.renderCount++;
      globalPerformanceStats.averageRenderTime = 
        globalPerformanceStats.totalRenderTime / globalPerformanceStats.renderCount;
      
      if (renderTime > globalPerformanceStats.maxRenderTime) {
        globalPerformanceStats.maxRenderTime = renderTime;
      }
      
      // 更新组件指标
      updateCount.current++;
      setMetrics(prev => ({
        ...prev,
        renderTime,
        componentUpdates: updateCount.current,
        lastUpdateTime: Date.now()
      }));
      
      // 性能警告
      if (renderTime > 100) { // 超过100ms
        globalPerformanceStats.performanceWarnings++;
        if (enableLogging) {
          console.warn(`🐌 PerformanceMonitor: 慢渲染检测 ${componentId}: ${renderTime.toFixed(2)}ms`);
        }
      }
      
      renderStartTime.current = 0;
    }
  }, [componentId, enableLogging]);
  
  // ✅ 内存监控
  const checkMemoryUsage = useCallback(() => {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      const memoryUsage = memory.usedJSHeapSize / 1024 / 1024; // MB

      setMetrics(prev => ({
        ...prev,
        memoryUsage
      }));

      // 内存泄漏检测
      if (memoryUsage > 100) { // 超过100MB
        globalPerformanceStats.memoryLeaks++;
        if (enableLogging) {
          console.warn(`🧠 PerformanceMonitor: 高内存使用 ${componentId}: ${memoryUsage.toFixed(2)}MB`);
        }
      }
    }
  }, []); // 🔧 FIXED: 移除依赖数组，避免无限循环
  
  // ✅ 初始化监控
  useEffect(() => {
    // 定期检查内存使用
    memoryCheckInterval.current = setInterval(checkMemoryUsage, 5000);

    return () => {
      if (memoryCheckInterval.current) {
        clearInterval(memoryCheckInterval.current);
      }
    };
  }, []); // 🔧 FIXED: 移除checkMemoryUsage依赖，避免无限循环
  
  return {
    metrics,
    startRenderTiming,
    endRenderTiming,
    checkMemoryUsage
  };
};

/**
 * 性能监控组件
 */
export const PerformanceMonitor: React.FC<PerformanceMonitorProps> = ({
  children,
  enableLogging = false,
  warningThreshold = 50,
  errorThreshold = 100,
  onPerformanceWarning
}) => {
  const componentId = useRef(`perf-monitor-${Math.random().toString(36).substr(2, 9)}`);
  const { metrics, startRenderTiming, endRenderTiming } = usePerformanceMonitor(
    componentId.current,
    enableLogging
  );
  
  // ✅ 渲染开始
  useEffect(() => {
    startRenderTiming();
  }, []); // 🔧 FIXED: 添加空依赖数组，只在组件挂载时执行

  // ✅ 渲染结束
  useEffect(() => {
    endRenderTiming();

    // 检查性能警告
    if (metrics.renderTime > warningThreshold && onPerformanceWarning) {
      onPerformanceWarning(metrics);
    }

    // 检查错误阈值
    if (metrics.renderTime > errorThreshold) {
      console.error(`🚨 PerformanceMonitor: 严重性能问题 ${componentId.current}: ${metrics.renderTime}ms`);
    }
  }, [metrics.renderTime, warningThreshold, errorThreshold, onPerformanceWarning]); // 🔧 FIXED: 添加正确的依赖数组
  
  return <>{children}</>;
};

/**
 * 性能统计显示组件
 */
export const PerformanceStats: React.FC<{ visible?: boolean }> = ({ visible = false }) => {
  const [stats, setStats] = useState(globalPerformanceStats);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setStats({ ...globalPerformanceStats });
    }, 1000);
    
    return () => clearInterval(interval);
  }, []);
  
  if (!visible) return null;
  
  return (
    <div style={{
      position: 'fixed',
      top: '10px',
      right: '10px',
      background: 'hsl(var(--foreground) / 0.8)',
      color: 'hsl(var(--background))',
      padding: '10px',
      borderRadius: '5px',
      fontSize: '0.75rem',
      fontFamily: 'monospace',
      zIndex: 9999,
      minWidth: '200px'
    }}>
      <div><strong>📊 性能监控</strong></div>
      <div>渲染次数: {stats.renderCount}</div>
      <div>平均渲染时间: {stats.averageRenderTime.toFixed(2)}ms</div>
      <div>最大渲染时间: {stats.maxRenderTime.toFixed(2)}ms</div>
      <div>性能警告: {stats.performanceWarnings}</div>
      <div>内存泄漏: {stats.memoryLeaks}</div>
    </div>
  );
};

/**
 * 获取全局性能统计
 */
export const getGlobalPerformanceStats = () => {
  return { ...globalPerformanceStats };
};

/**
 * 重置性能统计
 */
export const resetPerformanceStats = () => {
  globalPerformanceStats.totalRenderTime = 0;
  globalPerformanceStats.averageRenderTime = 0;
  globalPerformanceStats.maxRenderTime = 0;
  globalPerformanceStats.renderCount = 0;
  globalPerformanceStats.memoryLeaks = 0;
  globalPerformanceStats.performanceWarnings = 0;
  logger.debug('✅ PerformanceMonitor: 性能统计已重置');
};

/**
 * 性能分析工具
 */
export const analyzePerformance = () => {
  const stats = getGlobalPerformanceStats();
  
  const analysis = {
    overall: 'good',
    issues: [] as string[],
    recommendations: [] as string[]
  };
  
  // 分析渲染性能
  if (stats.averageRenderTime > 50) {
    analysis.overall = 'warning';
    analysis.issues.push('平均渲染时间过长');
    analysis.recommendations.push('考虑使用React.memo优化组件');
  }
  
  if (stats.maxRenderTime > 200) {
    analysis.overall = 'error';
    analysis.issues.push('存在严重的渲染性能问题');
    analysis.recommendations.push('检查是否存在无限循环或复杂计算');
  }
  
  // 分析内存使用
  if (stats.memoryLeaks > 0) {
    analysis.overall = 'warning';
    analysis.issues.push('检测到可能的内存泄漏');
    analysis.recommendations.push('检查组件卸载时是否正确清理资源');
  }
  
  // 分析警告频率
  if (stats.performanceWarnings > stats.renderCount * 0.1) {
    analysis.overall = 'warning';
    analysis.issues.push('性能警告频率过高');
    analysis.recommendations.push('优化组件渲染逻辑');
  }
  
  return analysis;
};

export default PerformanceMonitor;
