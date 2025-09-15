/**
 * 📊 性能监控系统
 * 根本性解决性能监控问题，提供全面的数据加载统计和性能分析
 * 
 * 核心功能：
 * - 实时性能监控和数据收集
 * - 数据加载时间统计和分析
 * - Web Vitals 核心性能指标监控
 * - 资源使用监控和内存分析
 * - 性能异常检测和告警
 * - 性能报告和趋势分析
 */

import { logger } from '@/utils/logger';

// 性能指标类型
export interface PerformanceMetrics {
  // 页面性能指标
  pageLoadTime: number;
  domContentLoadedTime: number;
  firstContentfulPaint: number;
  largestContentfulPaint: number;
  firstInputDelay: number;
  cumulativeLayoutShift: number;
  
  // 数据加载指标
  dataLoadingMetrics: DataLoadingMetrics;
  
  // 网络性能指标
  networkMetrics: NetworkMetrics;
  
  // 资源使用指标
  resourceMetrics: ResourceMetrics;
  
  // 用户交互指标
  interactionMetrics: InteractionMetrics;
  
  // 错误指标
  errorMetrics: ErrorMetrics;
}

// 数据加载指标
export interface DataLoadingMetrics {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  averageLoadTime: number;
  slowestLoadTime: number;
  fastestLoadTime: number;
  cacheHitRate: number;
  preloadEfficiency: number;
  syncLatency: number;
  compressionRatio: number;
  dataTransferSize: number;
  requestsByPriority: Record<string, number>;
  loadTimeDistribution: Array<{range: string, count: number}>;
}

// 网络性能指标
export interface NetworkMetrics {
  connectionType: string;
  effectiveType: string;
  downlink: number;
  rtt: number;
  saveData: boolean;
  onlineStatus: boolean;
  networkChanges: number;
}

// 资源使用指标
export interface ResourceMetrics {
  memoryUsage: {
    used: number;
    total: number;
    percentage: number;
  };
  cpuUsage: number;
  storageUsage: {
    localStorage: number;
    sessionStorage: number;
    indexedDB: number;
  };
  cacheUsage: {
    size: number;
    hitRate: number;
    evictionCount: number;
  };
}

// 用户交互指标
export interface InteractionMetrics {
  totalInteractions: number;
  responseTime: number;
  scrollDepth: number;
  clickEvents: number;
  formSubmissions: number;
  sessionDuration: number;
  bounceRate: number;
}

// 错误指标
export interface ErrorMetrics {
  jsErrors: number;
  networkErrors: number;
  renderErrors: number;
  criticalErrors: number;
  errorRate: number;
  recoveryRate: number;
}

// 性能事件
export interface PerformanceEvent {
  id: string;
  type: 'data_load' | 'page_load' | 'interaction' | 'error' | 'resource';
  name: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  success: boolean;
  metadata: Record<string, any>;
}

// 性能阈值配置
export interface PerformanceThresholds {
  pageLoadTime: { good: number; needs_improvement: number };
  dataLoadTime: { good: number; needs_improvement: number };
  firstContentfulPaint: { good: number; needs_improvement: number };
  largestContentfulPaint: { good: number; needs_improvement: number };
  firstInputDelay: { good: number; needs_improvement: number };
  cumulativeLayoutShift: { good: number; needs_improvement: number };
  memoryUsage: { good: number; needs_improvement: number };
  cacheHitRate: { good: number; needs_improvement: number };
}

/**
 * 性能监控器类
 */
export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  
  private metrics: PerformanceMetrics;
  private events: PerformanceEvent[] = [];
  private observers: Map<string, PerformanceObserver> = new Map();
  private startTime: number;
  private sessionId: string;
  private isMonitoring = false;
  
  private readonly thresholds: PerformanceThresholds = {
    pageLoadTime: { good: 1500, needs_improvement: 3000 },
    dataLoadTime: { good: 500, needs_improvement: 1000 },
    firstContentfulPaint: { good: 1800, needs_improvement: 3000 },
    largestContentfulPaint: { good: 2500, needs_improvement: 4000 },
    firstInputDelay: { good: 100, needs_improvement: 300 },
    cumulativeLayoutShift: { good: 0.1, needs_improvement: 0.25 },
    memoryUsage: { good: 50, needs_improvement: 80 },
    cacheHitRate: { good: 0.8, needs_improvement: 0.6 }
  };

  private constructor() {
    this.startTime = performance.now();
    this.sessionId = this.generateSessionId();
    this.metrics = this.initializeMetrics();
  }

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  /**
   * 开始性能监控
   */
  startMonitoring(): void {
    if (this.isMonitoring) return;
    
    this.isMonitoring = true;
    logger.info('📊 性能监控已启动');

    // 初始化Web Vitals监控
    this.initWebVitalsMonitoring();
    
    // 初始化资源监控
    this.initResourceMonitoring();
    
    // 初始化网络监控
    this.initNetworkMonitoring();
    
    // 初始化用户交互监控
    this.initInteractionMonitoring();
    
    // 启动定期收集
    this.startPeriodicCollection();
  }

  /**
   * 停止性能监控
   */
  stopMonitoring(): void {
    if (!this.isMonitoring) return;
    
    this.isMonitoring = false;
    
    // 断开所有观察者
    for (const [name, observer] of this.observers) {
      observer.disconnect();
      logger.debug(`🔌 已断开性能观察者: ${name}`);
    }
    this.observers.clear();
    
    logger.info('📊 性能监控已停止');
  }

  /**
   * 记录数据加载事件
   */
  recordDataLoadingEvent(
    name: string,
    startTime: number,
    endTime: number,
    success: boolean,
    metadata: Record<string, any> = {}
  ): void {
    const event: PerformanceEvent = {
      id: this.generateEventId(),
      type: 'data_load',
      name,
      startTime,
      endTime,
      duration: endTime - startTime,
      success,
      metadata: {
        ...metadata,
        timestamp: Date.now(),
        sessionId: this.sessionId
      }
    };

    this.events.push(event);
    this.updateDataLoadingMetrics(event);

    logger.debug(`📈 记录数据加载事件: ${name} (${event.duration?.toFixed(2)}ms)`);
  }

  /**
   * 记录页面加载事件
   */
  recordPageLoadEvent(name: string, loadTime: number): void {
    const event: PerformanceEvent = {
      id: this.generateEventId(),
      type: 'page_load',
      name,
      startTime: performance.now() - loadTime,
      endTime: performance.now(),
      duration: loadTime,
      success: true,
      metadata: {
        url: window.location.href,
        timestamp: Date.now(),
        sessionId: this.sessionId
      }
    };

    this.events.push(event);
    this.metrics.pageLoadTime = loadTime;

    logger.debug(`🌐 记录页面加载事件: ${name} (${loadTime.toFixed(2)}ms)`);
  }

  /**
   * 记录错误事件
   */
  recordErrorEvent(type: string, message: string, metadata: Record<string, any> = {}): void {
    const event: PerformanceEvent = {
      id: this.generateEventId(),
      type: 'error',
      name: `${type}_error`,
      startTime: performance.now(),
      success: false,
      metadata: {
        errorType: type,
        message,
        ...metadata,
        timestamp: Date.now(),
        sessionId: this.sessionId
      }
    };

    this.events.push(event);
    this.updateErrorMetrics(type);

    logger.debug(`🚨 记录错误事件: ${type} - ${message}`);
  }

  /**
   * 获取当前性能指标
   */
  getCurrentMetrics(): PerformanceMetrics {
    this.collectCurrentMetrics();
    return { ...this.metrics };
  }

  /**
   * 获取性能报告
   */
  getPerformanceReport(): {
    summary: PerformanceMetrics;
    events: PerformanceEvent[];
    analysis: PerformanceAnalysis;
    recommendations: string[];
  } {
    const analysis = this.analyzePerformance();
    const recommendations = this.generateRecommendations(analysis);

    return {
      summary: this.getCurrentMetrics(),
      events: [...this.events],
      analysis,
      recommendations
    };
  }

  /**
   * 初始化指标
   */
  private initializeMetrics(): PerformanceMetrics {
    return {
      pageLoadTime: 0,
      domContentLoadedTime: 0,
      firstContentfulPaint: 0,
      largestContentfulPaint: 0,
      firstInputDelay: 0,
      cumulativeLayoutShift: 0,
      dataLoadingMetrics: {
        totalRequests: 0,
        successfulRequests: 0,
        failedRequests: 0,
        averageLoadTime: 0,
        slowestLoadTime: 0,
        fastestLoadTime: Infinity,
        cacheHitRate: 0,
        preloadEfficiency: 0,
        syncLatency: 0,
        compressionRatio: 0,
        dataTransferSize: 0,
        requestsByPriority: {},
        loadTimeDistribution: []
      },
      networkMetrics: {
        connectionType: 'unknown',
        effectiveType: 'unknown',
        downlink: 0,
        rtt: 0,
        saveData: false,
        onlineStatus: navigator.onLine,
        networkChanges: 0
      },
      resourceMetrics: {
        memoryUsage: { used: 0, total: 0, percentage: 0 },
        cpuUsage: 0,
        storageUsage: { localStorage: 0, sessionStorage: 0, indexedDB: 0 },
        cacheUsage: { size: 0, hitRate: 0, evictionCount: 0 }
      },
      interactionMetrics: {
        totalInteractions: 0,
        responseTime: 0,
        scrollDepth: 0,
        clickEvents: 0,
        formSubmissions: 0,
        sessionDuration: 0,
        bounceRate: 0
      },
      errorMetrics: {
        jsErrors: 0,
        networkErrors: 0,
        renderErrors: 0,
        criticalErrors: 0,
        errorRate: 0,
        recoveryRate: 0
      }
    };
  }

  /**
   * 初始化Web Vitals监控
   */
  private initWebVitalsMonitoring(): void {
    // First Contentful Paint
    if ('PerformanceObserver' in window) {
      const fcpObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.name === 'first-contentful-paint') {
            this.metrics.firstContentfulPaint = entry.startTime;
            logger.debug(`🎨 FCP: ${entry.startTime.toFixed(2)}ms`);
          }
        }
      });
      
      try {
        fcpObserver.observe({ entryTypes: ['paint'] });
        this.observers.set('fcp', fcpObserver);
      } catch (error) {
        logger.warn('⚠️ FCP观察者初始化失败:', error);
      }
    }

    // Largest Contentful Paint
    if ('PerformanceObserver' in window) {
      const lcpObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          this.metrics.largestContentfulPaint = entry.startTime;
          logger.debug(`🖼️ LCP: ${entry.startTime.toFixed(2)}ms`);
        }
      });

      try {
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
        this.observers.set('lcp', lcpObserver);
      } catch (error) {
        logger.warn('⚠️ LCP观察者初始化失败:', error);
      }
    }

    // First Input Delay
    if ('PerformanceObserver' in window) {
      const fidObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          this.metrics.firstInputDelay = (entry as any).processingStart - entry.startTime;
          logger.debug(`⚡ FID: ${this.metrics.firstInputDelay.toFixed(2)}ms`);
        }
      });

      try {
        fidObserver.observe({ entryTypes: ['first-input'] });
        this.observers.set('fid', fidObserver);
      } catch (error) {
        logger.warn('⚠️ FID观察者初始化失败:', error);
      }
    }

    // Cumulative Layout Shift
    if ('PerformanceObserver' in window) {
      let clsValue = 0;
      const clsObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (!(entry as any).hadRecentInput) {
            clsValue += (entry as any).value;
          }
        }
        this.metrics.cumulativeLayoutShift = clsValue;
        logger.debug(`📐 CLS: ${clsValue.toFixed(4)}`);
      });

      try {
        clsObserver.observe({ entryTypes: ['layout-shift'] });
        this.observers.set('cls', clsObserver);
      } catch (error) {
        logger.warn('⚠️ CLS观察者初始化失败:', error);
      }
    }
  }

  /**
   * 初始化资源监控
   */
  private initResourceMonitoring(): void {
    // 内存监控
    if ('memory' in performance) {
      setInterval(() => {
        const memory = (performance as any).memory;
        this.metrics.resourceMetrics.memoryUsage = {
          used: memory.usedJSHeapSize,
          total: memory.totalJSHeapSize,
          percentage: (memory.usedJSHeapSize / memory.totalJSHeapSize) * 100
        };
      }, 5000);
    }

    // 存储使用监控
    setInterval(() => {
      this.metrics.resourceMetrics.storageUsage = {
        localStorage: this.getStorageSize('localStorage'),
        sessionStorage: this.getStorageSize('sessionStorage'),
        indexedDB: 0 // TODO: 实现IndexedDB大小计算
      };
    }, 10000);
  }

  /**
   * 初始化网络监控
   */
  private initNetworkMonitoring(): void {
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      
      const updateNetworkMetrics = () => {
        this.metrics.networkMetrics = {
          connectionType: connection.type || 'unknown',
          effectiveType: connection.effectiveType || 'unknown',
          downlink: connection.downlink || 0,
          rtt: connection.rtt || 0,
          saveData: connection.saveData || false,
          onlineStatus: navigator.onLine,
          networkChanges: this.metrics.networkMetrics.networkChanges
        };
      };

      // 初始更新
      updateNetworkMetrics();

      // 监听网络变化
      connection.addEventListener('change', () => {
        this.metrics.networkMetrics.networkChanges++;
        updateNetworkMetrics();
        logger.debug('🌐 网络状态已变更');
      });
    }

    // 在线状态监控
    window.addEventListener('online', () => {
      this.metrics.networkMetrics.onlineStatus = true;
      logger.debug('🟢 网络已连接');
    });

    window.addEventListener('offline', () => {
      this.metrics.networkMetrics.onlineStatus = false;
      logger.debug('🔴 网络已断开');
    });
  }

  /**
   * 初始化用户交互监控
   */
  private initInteractionMonitoring(): void {
    let scrollDepth = 0;
    const startTime = Date.now();

    // 点击事件监控
    document.addEventListener('click', () => {
      this.metrics.interactionMetrics.clickEvents++;
      this.metrics.interactionMetrics.totalInteractions++;
    });

    // 滚动深度监控
    document.addEventListener('scroll', () => {
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      
      const currentScrollDepth = Math.min(
        100,
        ((scrollTop + windowHeight) / documentHeight) * 100
      );
      
      scrollDepth = Math.max(scrollDepth, currentScrollDepth);
      this.metrics.interactionMetrics.scrollDepth = scrollDepth;
    });

    // 表单提交监控
    document.addEventListener('submit', () => {
      this.metrics.interactionMetrics.formSubmissions++;
      this.metrics.interactionMetrics.totalInteractions++;
    });

    // 会话持续时间更新
    setInterval(() => {
      this.metrics.interactionMetrics.sessionDuration = Date.now() - startTime;
    }, 1000);
  }

  /**
   * 启动定期收集
   */
  private startPeriodicCollection(): void {
    setInterval(() => {
      this.collectCurrentMetrics();
    }, 30000); // 每30秒收集一次
  }

  /**
   * 收集当前指标
   */
  private collectCurrentMetrics(): void {
    // 更新DOM Content Loaded时间
    if (document.readyState === 'complete' && this.metrics.domContentLoadedTime === 0) {
      const navigationTiming = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      if (navigationTiming) {
        this.metrics.domContentLoadedTime = navigationTiming.domContentLoadedEventEnd - navigationTiming.navigationStart;
      }
    }

    // 更新页面加载时间
    if (this.metrics.pageLoadTime === 0) {
      const navigationTiming = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      if (navigationTiming && navigationTiming.loadEventEnd > 0) {
        this.metrics.pageLoadTime = navigationTiming.loadEventEnd - navigationTiming.navigationStart;
      }
    }
  }

  /**
   * 更新数据加载指标
   */
  private updateDataLoadingMetrics(event: PerformanceEvent): void {
    const metrics = this.metrics.dataLoadingMetrics;
    
    metrics.totalRequests++;
    
    if (event.success) {
      metrics.successfulRequests++;
    } else {
      metrics.failedRequests++;
    }

    if (event.duration !== undefined) {
      // 更新平均加载时间
      const totalTime = metrics.averageLoadTime * (metrics.totalRequests - 1) + event.duration;
      metrics.averageLoadTime = totalTime / metrics.totalRequests;
      
      // 更新最快/最慢时间
      metrics.slowestLoadTime = Math.max(metrics.slowestLoadTime, event.duration);
      metrics.fastestLoadTime = Math.min(metrics.fastestLoadTime, event.duration);
      
      // 更新加载时间分布
      this.updateLoadTimeDistribution(event.duration);
    }

    // 更新按优先级的请求统计
    const priority = event.metadata.priority || 'medium';
    metrics.requestsByPriority[priority] = (metrics.requestsByPriority[priority] || 0) + 1;

    // 更新缓存命中率
    if (event.metadata.cached) {
      const hitCount = metrics.successfulRequests * metrics.cacheHitRate + 1;
      metrics.cacheHitRate = hitCount / metrics.successfulRequests;
    }
  }

  /**
   * 更新错误指标
   */
  private updateErrorMetrics(errorType: string): void {
    const metrics = this.metrics.errorMetrics;
    
    switch (errorType) {
      case 'js':
        metrics.jsErrors++;
        break;
      case 'network':
        metrics.networkErrors++;
        break;
      case 'render':
        metrics.renderErrors++;
        break;
    }

    // 更新总错误率
    const totalEvents = this.events.length;
    const totalErrors = metrics.jsErrors + metrics.networkErrors + metrics.renderErrors;
    metrics.errorRate = totalEvents > 0 ? totalErrors / totalEvents : 0;
  }

  /**
   * 更新加载时间分布
   */
  private updateLoadTimeDistribution(duration: number): void {
    const ranges = [
      { range: '0-100ms', min: 0, max: 100 },
      { range: '100-500ms', min: 100, max: 500 },
      { range: '500ms-1s', min: 500, max: 1000 },
      { range: '1-3s', min: 1000, max: 3000 },
      { range: '3s+', min: 3000, max: Infinity }
    ];

    const distribution = this.metrics.dataLoadingMetrics.loadTimeDistribution;
    
    for (const range of ranges) {
      if (duration >= range.min && duration < range.max) {
        const existing = distribution.find(d => d.range === range.range);
        if (existing) {
          existing.count++;
        } else {
          distribution.push({ range: range.range, count: 1 });
        }
        break;
      }
    }
  }

  /**
   * 分析性能
   */
  private analyzePerformance(): PerformanceAnalysis {
    const metrics = this.metrics;
    
    return {
      overallScore: this.calculateOverallScore(),
      pageLoadScore: this.evaluateMetric(metrics.pageLoadTime, this.thresholds.pageLoadTime),
      dataLoadScore: this.evaluateMetric(metrics.dataLoadingMetrics.averageLoadTime, this.thresholds.dataLoadTime),
      vitalsScore: {
        fcp: this.evaluateMetric(metrics.firstContentfulPaint, this.thresholds.firstContentfulPaint),
        lcp: this.evaluateMetric(metrics.largestContentfulPaint, this.thresholds.largestContentfulPaint),
        fid: this.evaluateMetric(metrics.firstInputDelay, this.thresholds.firstInputDelay),
        cls: this.evaluateMetric(metrics.cumulativeLayoutShift, this.thresholds.cumulativeLayoutShift)
      },
      resourceScore: this.evaluateMetric(
        metrics.resourceMetrics.memoryUsage.percentage, 
        this.thresholds.memoryUsage
      ),
      cacheScore: this.evaluateMetric(metrics.dataLoadingMetrics.cacheHitRate, this.thresholds.cacheHitRate),
      trends: this.analyzeTrends(),
      bottlenecks: this.identifyBottlenecks()
    };
  }

  /**
   * 生成性能建议
   */
  private generateRecommendations(analysis: PerformanceAnalysis): string[] {
    const recommendations: string[] = [];

    if (analysis.pageLoadScore === 'poor') {
      recommendations.push('优化页面加载时间：考虑代码分割和懒加载');
    }

    if (analysis.dataLoadScore === 'poor') {
      recommendations.push('优化数据加载：启用数据预加载和压缩');
    }

    if (analysis.vitalsScore.lcp === 'poor') {
      recommendations.push('优化LCP：优化图片和关键资源加载');
    }

    if (analysis.vitalsScore.fid === 'poor') {
      recommendations.push('优化FID：减少JavaScript执行时间');
    }

    if (analysis.vitalsScore.cls === 'poor') {
      recommendations.push('优化CLS：为动态内容预留空间');
    }

    if (analysis.resourceScore === 'poor') {
      recommendations.push('优化内存使用：检查内存泄漏并优化数据结构');
    }

    if (analysis.cacheScore === 'poor') {
      recommendations.push('优化缓存策略：提高缓存命中率');
    }

    if (recommendations.length === 0) {
      recommendations.push('性能表现良好！继续保持当前优化水平。');
    }

    return recommendations;
  }

  /**
   * 工具方法
   */
  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateEventId(): string {
    return `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private getStorageSize(storageType: 'localStorage' | 'sessionStorage'): number {
    try {
      const storage = window[storageType];
      let size = 0;
      for (const key in storage) {
        if (storage.hasOwnProperty(key)) {
          size += storage.getItem(key)?.length || 0;
        }
      }
      return size;
    } catch {
      return 0;
    }
  }

  private evaluateMetric(
    value: number, 
    threshold: { good: number; needs_improvement: number }
  ): 'good' | 'needs-improvement' | 'poor' {
    if (value <= threshold.good) return 'good';
    if (value <= threshold.needs_improvement) return 'needs-improvement';
    return 'poor';
  }

  private calculateOverallScore(): number {
    const scores = {
      pageLoad: this.metrics.pageLoadTime <= this.thresholds.pageLoadTime.good ? 100 : 50,
      dataLoad: this.metrics.dataLoadingMetrics.averageLoadTime <= this.thresholds.dataLoadTime.good ? 100 : 50,
      fcp: this.metrics.firstContentfulPaint <= this.thresholds.firstContentfulPaint.good ? 100 : 50,
      lcp: this.metrics.largestContentfulPaint <= this.thresholds.largestContentfulPaint.good ? 100 : 50,
      memory: this.metrics.resourceMetrics.memoryUsage.percentage <= this.thresholds.memoryUsage.good ? 100 : 50,
      cache: this.metrics.dataLoadingMetrics.cacheHitRate >= this.thresholds.cacheHitRate.good ? 100 : 50
    };

    return Object.values(scores).reduce((sum, score) => sum + score, 0) / Object.keys(scores).length;
  }

  private analyzeTrends(): Array<{metric: string, trend: 'improving' | 'stable' | 'degrading'}> {
    // 简化的趋势分析，实际应该基于历史数据
    return [
      { metric: 'pageLoadTime', trend: 'stable' },
      { metric: 'dataLoadTime', trend: 'improving' },
      { metric: 'errorRate', trend: 'stable' }
    ];
  }

  private identifyBottlenecks(): Array<{type: string, description: string, impact: 'high' | 'medium' | 'low'}> {
    const bottlenecks = [];

    if (this.metrics.dataLoadingMetrics.slowestLoadTime > 3000) {
      bottlenecks.push({
        type: 'slow_data_loading',
        description: `最慢数据加载耗时 ${this.metrics.dataLoadingMetrics.slowestLoadTime.toFixed(0)}ms`,
        impact: 'high' as const
      });
    }

    if (this.metrics.resourceMetrics.memoryUsage.percentage > 80) {
      bottlenecks.push({
        type: 'high_memory_usage',
        description: `内存使用率 ${this.metrics.resourceMetrics.memoryUsage.percentage.toFixed(1)}%`,
        impact: 'high' as const
      });
    }

    if (this.metrics.dataLoadingMetrics.cacheHitRate < 0.6) {
      bottlenecks.push({
        type: 'low_cache_hit_rate',
        description: `缓存命中率仅 ${(this.metrics.dataLoadingMetrics.cacheHitRate * 100).toFixed(1)}%`,
        impact: 'medium' as const
      });
    }

    return bottlenecks;
  }
}

// 性能分析结果接口
interface PerformanceAnalysis {
  overallScore: number;
  pageLoadScore: 'good' | 'needs-improvement' | 'poor';
  dataLoadScore: 'good' | 'needs-improvement' | 'poor';
  vitalsScore: {
    fcp: 'good' | 'needs-improvement' | 'poor';
    lcp: 'good' | 'needs-improvement' | 'poor';
    fid: 'good' | 'needs-improvement' | 'poor';
    cls: 'good' | 'needs-improvement' | 'poor';
  };
  resourceScore: 'good' | 'needs-improvement' | 'poor';
  cacheScore: 'good' | 'needs-improvement' | 'poor';
  trends: Array<{metric: string, trend: 'improving' | 'stable' | 'degrading'}>;
  bottlenecks: Array<{type: string, description: string, impact: 'high' | 'medium' | 'low'}>;
}

// 导出单例实例
export const performanceMonitor = PerformanceMonitor.getInstance();

// 自动启动监控（在生产环境中可能需要根据配置决定）
if (typeof window !== 'undefined') {
  performanceMonitor.startMonitoring();
}

export default PerformanceMonitor;