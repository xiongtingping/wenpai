// 性能监控服务 - 统一的性能数据收集和分析
interface PerformanceMetric {
  id: string;
  type: 'page_load' | 'api_request' | 'component_render' | 'data_load' | 'user_interaction';
  name: string;
  duration: number;
  timestamp: number;
  success: boolean;
  error?: string;
  metadata?: Record<string, any>;
}

interface APIMetric extends PerformanceMetric {
  type: 'api_request';
  url: string;
  method: string;
  status: number;
  responseSize?: number;
}

interface PageMetric extends PerformanceMetric {
  type: 'page_load';
  route: string;
  firstContentfulPaint?: number;
  largestContentfulPaint?: number;
  cumulativeLayoutShift?: number;
  firstInputDelay?: number;
}

interface ComponentMetric extends PerformanceMetric {
  type: 'component_render';
  componentName: string;
  renderCount: number;
  propsSize?: number;
}

interface DataLoadMetric extends PerformanceMetric {
  type: 'data_load';
  dataType: string;
  dataSize?: number;
  cacheHit?: boolean;
}

class PerformanceMonitoringService {
  private metrics: PerformanceMetric[] = [];
  private observers: PerformanceObserver[] = [];
  private startTimes: Map<string, number> = new Map();
  private isEnabled: boolean = true;
  
  // 启用/禁用监控（生产环境默认启用）
  public setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
    if (!enabled) {
      this.cleanup();
    } else {
      this.initializeObservers();
    }
  }

  // 初始化性能观察器
  private initializeObservers(): void {
    try {
      // Web Vitals 监控
      if ('PerformanceObserver' in window) {
        const navigationObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            this.recordNavigationTiming(entry as PerformanceNavigationTiming);
          }
        });
        navigationObserver.observe({ entryTypes: ['navigation'] });
        this.observers.push(navigationObserver);

        // 资源加载监控
        const resourceObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            this.recordResourceTiming(entry as PerformanceResourceTiming);
          }
        });
        resourceObserver.observe({ entryTypes: ['resource'] });
        this.observers.push(resourceObserver);

        // Paint 监控（FCP, LCP等）
        const paintObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            this.recordPaintTiming(entry);
          }
        });
        paintObserver.observe({ entryTypes: ['paint', 'largest-contentful-paint'] });
        this.observers.push(paintObserver);

        // 布局偏移监控（CLS）
        const layoutShiftObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            this.recordLayoutShift(entry);
          }
        });
        layoutShiftObserver.observe({ entryTypes: ['layout-shift'] });
        this.observers.push(layoutShiftObserver);
      }
    } catch (error) {
      console.warn('性能观察器初始化失败:', error);
    }
  }

  // 记录API请求性能
  public startAPIRequest(id: string, url: string, method: string): void {
    if (!this.isEnabled) return;
    this.startTimes.set(id, performance.now());
  }

  public endAPIRequest(
    id: string, 
    url: string, 
    method: string, 
    status: number, 
    success: boolean, 
    error?: string,
    responseSize?: number
  ): void {
    if (!this.isEnabled) return;
    
    const startTime = this.startTimes.get(id);
    if (!startTime) return;

    const duration = performance.now() - startTime;
    this.startTimes.delete(id);

    const metric: APIMetric = {
      id,
      type: 'api_request',
      name: `${method} ${url}`,
      url,
      method,
      status,
      duration,
      timestamp: Date.now(),
      success,
      error,
      responseSize,
      metadata: {
        userAgent: navigator.userAgent,
        connection: (navigator as any).connection?.effectiveType
      }
    };

    this.addMetric(metric);
  }

  // 记录数据加载性能
  public recordDataLoad(
    name: string, 
    dataType: string, 
    duration: number, 
    success: boolean,
    dataSize?: number,
    cacheHit?: boolean,
    error?: string
  ): void {
    if (!this.isEnabled) return;

    const metric: DataLoadMetric = {
      id: `data_load_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: 'data_load',
      name,
      dataType,
      duration,
      timestamp: Date.now(),
      success,
      error,
      dataSize,
      cacheHit,
      metadata: {
        memoryUsage: (performance as any).memory ? {
          usedJSHeapSize: (performance as any).memory.usedJSHeapSize,
          totalJSHeapSize: (performance as any).memory.totalJSHeapSize
        } : undefined
      }
    };

    this.addMetric(metric);
  }

  // 记录组件渲染性能
  public startComponentRender(componentName: string): string {
    if (!this.isEnabled) return '';
    
    const id = `component_${componentName}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    this.startTimes.set(id, performance.now());
    return id;
  }

  public endComponentRender(
    id: string, 
    componentName: string, 
    renderCount: number = 1,
    propsSize?: number,
    success: boolean = true,
    error?: string
  ): void {
    if (!this.isEnabled || !id) return;
    
    const startTime = this.startTimes.get(id);
    if (!startTime) return;

    const duration = performance.now() - startTime;
    this.startTimes.delete(id);

    const metric: ComponentMetric = {
      id,
      type: 'component_render',
      name: `Render ${componentName}`,
      componentName,
      renderCount,
      propsSize,
      duration,
      timestamp: Date.now(),
      success,
      error
    };

    this.addMetric(metric);
  }

  // 记录页面导航时间
  private recordNavigationTiming(entry: PerformanceNavigationTiming): void {
    const metric: PageMetric = {
      id: `page_load_${Date.now()}`,
      type: 'page_load',
      name: `Page Load: ${window.location.pathname}`,
      route: window.location.pathname,
      duration: entry.loadEventEnd - entry.navigationStart,
      timestamp: Date.now(),
      success: true,
      firstContentfulPaint: entry.loadEventEnd - entry.navigationStart,
      metadata: {
        navigationType: entry.type,
        domContentLoaded: entry.domContentLoadedEventEnd - entry.navigationStart,
        domInteractive: entry.domInteractive - entry.navigationStart,
        domComplete: entry.domComplete - entry.navigationStart
      }
    };

    this.addMetric(metric);
  }

  // 记录资源加载时间
  private recordResourceTiming(entry: PerformanceResourceTiming): void {
    // 只记录重要资源
    const importantResources = /\.(js|css|woff2?|png|jpg|jpeg|svg|webp)$/i;
    if (!importantResources.test(entry.name)) return;

    const metric: PerformanceMetric = {
      id: `resource_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: 'data_load',
      name: `Resource: ${entry.name.split('/').pop()}`,
      duration: entry.responseEnd - entry.requestStart,
      timestamp: Date.now(),
      success: entry.responseStatus < 400,
      metadata: {
        resourceType: entry.initiatorType,
        transferSize: entry.transferSize,
        encodedBodySize: entry.encodedBodySize,
        decodedBodySize: entry.decodedBodySize,
        responseStatus: entry.responseStatus
      }
    };

    this.addMetric(metric);
  }

  // 记录绘制时间
  private recordPaintTiming(entry: PerformanceEntry): void {
    const metric: PerformanceMetric = {
      id: `paint_${entry.name}_${Date.now()}`,
      type: 'page_load',
      name: `Paint: ${entry.name}`,
      duration: entry.startTime,
      timestamp: Date.now(),
      success: true,
      metadata: {
        paintType: entry.name
      }
    };

    this.addMetric(metric);
  }

  // 记录布局偏移
  private recordLayoutShift(entry: any): void {
    if (entry.hadRecentInput) return; // 忽略用户输入引起的偏移

    const metric: PerformanceMetric = {
      id: `cls_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: 'user_interaction',
      name: 'Cumulative Layout Shift',
      duration: entry.value,
      timestamp: Date.now(),
      success: entry.value < 0.1, // CLS < 0.1 被认为是好的
      metadata: {
        clsValue: entry.value,
        sources: entry.sources?.map((s: any) => ({
          node: s.node?.tagName,
          currentRect: s.currentRect,
          previousRect: s.previousRect
        }))
      }
    };

    this.addMetric(metric);
  }

  // 添加指标到队列
  private addMetric(metric: PerformanceMetric): void {
    this.metrics.push(metric);
    
    // 控制内存使用，只保留最近1000条记录
    if (this.metrics.length > 1000) {
      this.metrics = this.metrics.slice(-1000);
    }

    // 如果是关键性能问题，立即上报
    if (this.isCriticalPerformanceIssue(metric)) {
      this.reportCriticalIssue(metric);
    }
  }

  // 判断是否为关键性能问题
  private isCriticalPerformanceIssue(metric: PerformanceMetric): boolean {
    switch (metric.type) {
      case 'api_request':
        return metric.duration > 10000 || !metric.success; // API超过10秒或失败
      case 'page_load':
        return metric.duration > 5000; // 页面加载超过5秒
      case 'component_render':
        return metric.duration > 100; // 组件渲染超过100ms
      case 'data_load':
        return metric.duration > 3000 || !metric.success; // 数据加载超过3秒或失败
      default:
        return false;
    }
  }

  // 上报关键性能问题
  private reportCriticalIssue(metric: PerformanceMetric): void {
    console.warn('🚨 关键性能问题:', {
      type: metric.type,
      name: metric.name,
      duration: `${Math.round(metric.duration)}ms`,
      success: metric.success,
      error: metric.error,
      timestamp: new Date(metric.timestamp).toISOString()
    });

    // 这里可以集成外部监控服务（如Sentry、DataDog等）
    // window.sentry?.captureException(new Error(`Performance Issue: ${metric.name}`), {
    //   extra: metric
    // });
  }

  // 获取性能统计
  public getPerformanceStats() {
    const now = Date.now();
    const oneHourAgo = now - 60 * 60 * 1000;
    const recentMetrics = this.metrics.filter(m => m.timestamp > oneHourAgo);

    const stats = {
      total: recentMetrics.length,
      byType: {} as Record<string, number>,
      avgDuration: {} as Record<string, number>,
      successRate: {} as Record<string, number>,
      slowRequests: recentMetrics.filter(m => 
        (m.type === 'api_request' && m.duration > 5000) ||
        (m.type === 'page_load' && m.duration > 3000) ||
        (m.type === 'component_render' && m.duration > 50)
      ).length,
      errorCount: recentMetrics.filter(m => !m.success).length,
      criticalIssues: recentMetrics.filter(m => this.isCriticalPerformanceIssue(m)).length
    };

    // 按类型统计
    recentMetrics.forEach(metric => {
      const type = metric.type;
      stats.byType[type] = (stats.byType[type] || 0) + 1;
      
      if (!stats.avgDuration[type]) {
        stats.avgDuration[type] = 0;
        stats.successRate[type] = 0;
      }
    });

    // 计算平均持续时间和成功率
    Object.keys(stats.byType).forEach(type => {
      const typeMetrics = recentMetrics.filter(m => m.type === type);
      stats.avgDuration[type] = typeMetrics.reduce((sum, m) => sum + m.duration, 0) / typeMetrics.length;
      stats.successRate[type] = typeMetrics.filter(m => m.success).length / typeMetrics.length * 100;
    });

    return stats;
  }

  // 获取详细指标
  public getDetailedMetrics(type?: string, limit: number = 100): PerformanceMetric[] {
    let filtered = this.metrics;
    
    if (type) {
      filtered = filtered.filter(m => m.type === type);
    }
    
    return filtered
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, limit);
  }

  // 清理资源
  public cleanup(): void {
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
    this.startTimes.clear();
  }

  // 导出性能数据（用于分析和调试）
  public exportMetrics(): string {
    const exportData = {
      timestamp: Date.now(),
      userAgent: navigator.userAgent,
      metrics: this.metrics.slice(-500), // 最近500条记录
      stats: this.getPerformanceStats()
    };

    return JSON.stringify(exportData, null, 2);
  }
}

// 单例实例
export const performanceMonitoringService = new PerformanceMonitoringService();

// 导出类型
export type {
  PerformanceMetric,
  APIMetric,
  PageMetric,
  ComponentMetric,
  DataLoadMetric
};