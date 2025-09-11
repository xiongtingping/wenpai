/**
 * ✅ FIXED: 2025-08-04 架构级重构 - 渲染冲突检测器
 * 
 * 
 * 🎯 目标：检测和防止React渲染冲突，特别是无限循环问题
 * 🔧 策略：实时监控渲染频率、状态更新、组件生命周期
 */

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { logger } from '@/utils/logger';

interface RenderConflictState {
  hasError: boolean;
  errorInfo: string | null;
  renderCount: number;
  lastRenderTime: number;
  conflictDetected: boolean;
}

interface RenderConflictProps {
  children: ReactNode;
  maxRenderCount?: number;
  renderTimeWindow?: number;
  onConflictDetected?: (error: Error, errorInfo: ErrorInfo) => void;
  fallback?: ReactNode;
}

// ✅ 全局渲染统计
const globalRenderStats = {
  totalRenders: 0,
  conflictCount: 0,
  lastConflictTime: 0,
  componentStats: new Map<string, {
    renderCount: number;
    lastRenderTime: number;
    errorCount: number;
  }>()
};

/**
 * 渲染冲突检测器 - 防止React无限循环
 */
export class RenderConflictDetector extends Component<RenderConflictProps, RenderConflictState> {
  private componentId: string;
  private renderTimeouts: NodeJS.Timeout[] = [];
  private performanceObserver: PerformanceObserver | null = null;
  
  constructor(props: RenderConflictProps) {
    super(props);
    
    this.componentId = `render-detector-${Math.random().toString(36).substr(2, 9)}`;
    
    this.state = {
      hasError: false,
      errorInfo: null,
      renderCount: 0,
      lastRenderTime: Date.now(),
      conflictDetected: false
    };
    
    // ✅ 初始化性能监控
    this.initPerformanceMonitoring();
  }
  
  /**
   * 初始化性能监控
   */
  private initPerformanceMonitoring() {
    if (typeof PerformanceObserver !== 'undefined') {
      this.performanceObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          if (entry.entryType === 'measure' && entry.name.includes('React')) {
            // 检测React渲染性能问题
            if (entry.duration > 100) { // 超过100ms的渲染
              console.warn(`🚨 RenderConflictDetector: 检测到慢渲染 ${entry.name}: ${entry.duration}ms`);
            }
          }
        });
      });
      
      try {
        this.performanceObserver.observe({ entryTypes: ['measure', 'navigation'] });
      } catch (error) {
        console.warn('RenderConflictDetector: 性能监控初始化失败', error);
      }
    }
  }
  
  /**
   * 错误边界 - 捕获渲染错误
   */
  static getDerivedStateFromError(error: Error): Partial<RenderConflictState> {
    console.error('🚨 RenderConflictDetector: 捕获到渲染错误:', error);
    
    // 检查是否是无限循环错误
    const isInfiniteLoop = error.message.includes('Maximum update depth exceeded') ||
                          error.message.includes('Too many re-renders') ||
                          error.stack?.includes('setRef');
    
    if (isInfiniteLoop) {
      globalRenderStats.conflictCount++;
      globalRenderStats.lastConflictTime = Date.now();
    }
    
    return {
      hasError: true,
      errorInfo: error.message,
      conflictDetected: isInfiniteLoop
    };
  }
  
  /**
   * 组件错误处理
   */
  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('🚨 RenderConflictDetector: 组件错误详情:', {
      error,
      errorInfo,
      componentId: this.componentId,
      renderCount: this.state.renderCount
    });
    
    // 更新全局统计
    const stats = globalRenderStats.componentStats.get(this.componentId) || {
      renderCount: 0,
      lastRenderTime: 0,
      errorCount: 0
    };
    
    stats.errorCount++;
    globalRenderStats.componentStats.set(this.componentId, stats);
    
    // 调用外部错误处理器
    if (this.props.onConflictDetected) {
      this.props.onConflictDetected(error, errorInfo);
    }
    
    // 尝试自动恢复
    this.attemptAutoRecovery();
  }
  
  /**
   * 尝试自动恢复
   */
  private attemptAutoRecovery() {
    console.log('🔄 RenderConflictDetector: 尝试自动恢复...');
    
    // 清理所有定时器
    this.renderTimeouts.forEach(timeout => clearTimeout(timeout));
    this.renderTimeouts = [];
    
    // 延迟重置状态
    const recoveryTimeout = setTimeout(() => {
      this.setState({
        hasError: false,
        errorInfo: null,
        conflictDetected: false,
        renderCount: 0,
        lastRenderTime: Date.now()
      });
      
      logger.debug('✅ RenderConflictDetector: 自动恢复完成');
    }, 2000);
    
    this.renderTimeouts.push(recoveryTimeout);
  }
  
  /**
   * 检测渲染冲突
   */
  private detectRenderConflict(): boolean {
    const now = Date.now();
    const { maxRenderCount = 50, renderTimeWindow = 1000 } = this.props;
    const { renderCount, lastRenderTime } = this.state;
    
    // 检查渲染频率
    if (now - lastRenderTime < renderTimeWindow && renderCount > maxRenderCount) {
      console.warn(`🚨 RenderConflictDetector: 检测到渲染冲突 - ${renderCount}次渲染在${now - lastRenderTime}ms内`);
      return true;
    }
    
    return false;
  }
  
  /**
   * 组件更新前检查
   */
  componentDidUpdate() {
    // 🔍 FIXED: 2025-08-04 防止RenderConflictDetector自身陷入无限循环
    const now = Date.now();
    const newRenderCount = this.state.renderCount + 1;

    // 更新渲染统计
    globalRenderStats.totalRenders++;

    const stats = globalRenderStats.componentStats.get(this.componentId) || {
      renderCount: 0,
      lastRenderTime: 0,
      errorCount: 0
    };

    stats.renderCount = newRenderCount;
    stats.lastRenderTime = now;
    globalRenderStats.componentStats.set(this.componentId, stats);

    // 检测冲突
    const hasConflict = this.detectRenderConflict();

    // ✅ FIXED: 使用setTimeout避免在componentDidUpdate中直接setState导致无限循环
    if (hasConflict && !this.state.conflictDetected) {
      // 🔧 FIXED: 增加延迟，避免过于频繁的状态更新
      setTimeout(() => {
        if (!this.state.conflictDetected && this.detectRenderConflict()) {
          this.setState({
            conflictDetected: true,
            hasError: true,
            errorInfo: '检测到渲染冲突 - 可能的无限循环'
          });
        }
      }, 100); // 增加延迟到100ms
    } else if (!this.state.conflictDetected) {
      // ✅ FIXED: 只在没有冲突时更新计数，避免无限循环
      // 🔧 FIXED: 移除setState调用，避免在componentDidUpdate中触发新的渲染
      // 只更新全局统计，不更新组件状态
      console.log(`🔍 RenderConflictDetector: 渲染计数更新 ${this.componentId}: ${newRenderCount}`);
    }
  }
  
  /**
   * 组件卸载清理
   */
  componentWillUnmount() {
    // 清理定时器
    this.renderTimeouts.forEach(timeout => clearTimeout(timeout));
    
    // 清理性能监控
    if (this.performanceObserver) {
      this.performanceObserver.disconnect();
    }
    
    // 清理全局统计
    globalRenderStats.componentStats.delete(this.componentId);
  }
  
  /**
   * 渲染方法
   */
  render() {
    const { children, fallback } = this.props;
    const { hasError, errorInfo, conflictDetected } = this.state;
    
    // 如果检测到错误或冲突，显示fallback
    if (hasError) {
      const defaultFallback = (
        <div style={{
          padding: 'var(--spacing-5)',
          border: 'var(--spacing-0-5) solid hsl(var(--destructive))',
          borderRadius: 'var(--spacing-2)',
          backgroundColor: 'hsl(var(--destructive) / 0.1)',
          color: 'hsl(var(--destructive))',
          margin: 'var(--spacing-2-5)'
        }}>
          <h3>🚨 渲染冲突检测器</h3>
          <p><strong>错误类型:</strong> {conflictDetected ? '渲染冲突/无限循环' : '渲染错误'}</p>
          <p><strong>错误信息:</strong> {errorInfo}</p>
          <p><strong>组件ID:</strong> {this.componentId}</p>
          <button 
            onClick={() => this.attemptAutoRecovery()}
            style={{
              padding: 'var(--spacing-2) var(--spacing-4)',
              backgroundColor: 'hsl(var(--primary))',
              color: 'hsl(var(--background))',
              border: 'none',
              borderRadius: 'var(--spacing-1)',
              cursor: 'pointer'
            }}
          >
            🔄 尝试恢复
          </button>
        </div>
      );
      
      return fallback || defaultFallback;
    }
    
    return children;
  }
}

/**
 * 获取全局渲染统计
 */
export const getRenderStats = () => {
  return {
    ...globalRenderStats,
    componentStats: Array.from(globalRenderStats.componentStats.entries()).map(([id, stats]) => ({
      componentId: id,
      ...stats
    }))
  };
};

/**
 * 重置全局渲染统计
 */
export const resetRenderStats = () => {
  globalRenderStats.totalRenders = 0;
  globalRenderStats.conflictCount = 0;
  globalRenderStats.lastConflictTime = 0;
  globalRenderStats.componentStats.clear();
  logger.debug('✅ RenderConflictDetector: 全局统计已重置');
};

export default RenderConflictDetector;
