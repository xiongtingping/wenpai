/**
 * 性能监控服务
 * 监控标题生成系统的性能指标和用户体验
 */

// import i18n from '@/i18n'; // 改为动态导入避免TDZ
import { TitleGenerationConfig } from '../config/titleGeneration.config';

interface PerformanceMetric {
  name: string;
  value: number;
  timestamp: number;
  tags?: Record<string, string>;
}

interface PerformanceReport {
  period: {
    start: number;
    end: number;
    duration: number;
  };
  metrics: {
    averageResponseTime: number;
    p95ResponseTime: number;
    p99ResponseTime: number;
    successRate: number;
    errorRate: number;
    cacheHitRate: number;
    throughput: number;
  };
  recommendations: string[];
  alerts: Array<{
    level: 'info' | 'warning' | 'error';
    message: string;
    metric: string;
    value: number;
    threshold: number;
  }>;
}

export class PerformanceMonitor {
  private metrics: PerformanceMetric[] = [];
  private startTime: number = Date.now();
  private config = TitleGenerationConfig.performance;

  /**
   * 记录性能指标
   */
  recordMetric(name: string, value: number, tags?: Record<string, string>): void {
    if (!this.config.enableMetrics) return;

    const metric: PerformanceMetric = {
      name,
      value,
      timestamp: Date.now(),
      tags
    };

    this.metrics.push(metric);

    // 限制内存使用，只保留最近的指标
    if (this.metrics.length > 10000) {
      this.metrics = this.metrics.slice(-5000);
    }

    // 实时检查阈值
    this.checkThresholds(metric);
  }

  /**
   * 记录响应时间
   */
  recordResponseTime(duration: number, operation: string, success: boolean): void {
    this.recordMetric('response_time', duration, {
      operation,
      success: success.toString()
    });

    // 检查慢请求
    if (duration > this.config.slowRequestThreshold) {
      console.warn(`🐌 慢请求检测: ${operation} 耗时 ${duration.toFixed(2)}ms`);
      this.recordMetric('slow_request', 1, { operation });
    }
  }

  /**
   * 记录错误
   */
  recordError(error: Error, operation: string): void {
    this.recordMetric('error', 1, {
      operation,
      error_type: error.name,
      error_message: error.message.substring(0, 100)
    });

    console.error(`❌ 性能监控记录错误: ${operation}`, error);
  }

  /**
   * 记录缓存命中
   */
  recordCacheHit(hit: boolean, operation: string): void {
    this.recordMetric('cache_hit', hit ? 1 : 0, { operation });
  }

  /**
   * 生成性能报告
   */
  generateReport(periodMinutes: number = 60): PerformanceReport {
    const now = Date.now();
    const periodStart = now - (periodMinutes * 60 * 1000);
    
    const periodMetrics = this.metrics.filter(m => m.timestamp >= periodStart);
    
    // 计算响应时间指标
    const responseTimes = periodMetrics
      .filter(m => m.name === 'response_time')
      .map(m => m.value)
      .sort((a, b) => a - b);

    const averageResponseTime = responseTimes.length > 0 
      ? responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length 
      : 0;

    const p95ResponseTime = responseTimes.length > 0 
      ? responseTimes[Math.floor(responseTimes.length * 0.95)] || 0
      : 0;

    const p99ResponseTime = responseTimes.length > 0 
      ? responseTimes[Math.floor(responseTimes.length * 0.99)] || 0
      : 0;

    // 计算成功率
    const successMetrics = periodMetrics.filter(m => 
      m.name === 'response_time' && m.tags?.success === 'true'
    );
    const totalRequests = periodMetrics.filter(m => m.name === 'response_time').length;
    const successRate = totalRequests > 0 ? successMetrics.length / totalRequests : 1;
    const errorRate = 1 - successRate;

    // 计算缓存命中率
    const cacheMetrics = periodMetrics.filter(m => m.name === 'cache_hit');
    const cacheHits = cacheMetrics.filter(m => m.value === 1).length;
    const cacheHitRate = cacheMetrics.length > 0 ? cacheHits / cacheMetrics.length : 0;

    // 计算吞吐量 (请求/分钟)
    const throughput = totalRequests / periodMinutes;

    const report: PerformanceReport = {
      period: {
        start: periodStart,
        end: now,
        duration: periodMinutes * 60 * 1000
      },
      metrics: {
        averageResponseTime,
        p95ResponseTime,
        p99ResponseTime,
        successRate,
        errorRate,
        cacheHitRate,
        throughput
      },
      recommendations: this.generateRecommendations({
        averageResponseTime,
        p95ResponseTime,
        successRate,
        errorRate,
        cacheHitRate,
        throughput
      }),
      alerts: this.generateAlerts({
        averageResponseTime,
        p95ResponseTime,
        successRate,
        errorRate,
        cacheHitRate,
        throughput
      })
    };

    return report;
  }

  /**
   * 获取实时指标
   */
  getRealTimeMetrics(): {
    activeRequests: number;
    recentResponseTime: number;
    recentSuccessRate: number;
    memoryUsage: number;
  } {
    const now = Date.now();
    const recentPeriod = 5 * 60 * 1000; // 最近5分钟
    const recentMetrics = this.metrics.filter(m => now - m.timestamp < recentPeriod);

    const recentResponseTimes = recentMetrics
      .filter(m => m.name === 'response_time')
      .map(m => m.value);

    const recentResponseTime = recentResponseTimes.length > 0
      ? recentResponseTimes.reduce((sum, time) => sum + time, 0) / recentResponseTimes.length
      : 0;

    const recentSuccessMetrics = recentMetrics.filter(m => 
      m.name === 'response_time' && m.tags?.success === 'true'
    );
    const recentTotalRequests = recentMetrics.filter(m => m.name === 'response_time').length;
    const recentSuccessRate = recentTotalRequests > 0 
      ? recentSuccessMetrics.length / recentTotalRequests 
      : 1;

    return {
      activeRequests: 0, // 简化实现
      recentResponseTime,
      recentSuccessRate,
      memoryUsage: this.metrics.length * 100 // 粗略估算
    };
  }

  /**
   * 清理旧指标
   */
  cleanup(): void {
    const cutoff = Date.now() - (24 * 60 * 60 * 1000); // 保留24小时
    this.metrics = this.metrics.filter(m => m.timestamp > cutoff);
    console.log(`🧹 性能指标清理完成，保留 ${this.metrics.length} 条记录`);
  }

  /**
   * 检查阈值
   */
  private checkThresholds(metric: PerformanceMetric): void {
    const { name, value } = metric;

    switch (name) {
      case 'response_time':
        if (value > this.config.slowRequestThreshold) {
          console.warn(`⚠️ 响应时间超过阈值: ${value}ms > ${this.config.slowRequestThreshold}ms`);
        }
        break;
      case 'error':
        // 错误率检查在生成报告时进行
        break;
    }
  }

  /**
   * 生成优化建议
   */
  private generateRecommendations(metrics: any): string[] {
    const recommendations: string[] = [];

    if (metrics.averageResponseTime > 5000) {
      recommendations.push('平均响应时间较长，建议优化AI调用或增加缓存');
    }

    if (metrics.cacheHitRate < this.config.cacheHitRateThreshold) {
      recommendations.push('缓存命中率偏低，建议调整缓存策略或增加缓存时间');
    }

    if (metrics.errorRate > this.config.errorRateThreshold) {
      recommendations.push('错误率偏高，建议检查AI服务稳定性和错误处理逻辑');
    }

    if (metrics.throughput < 1) {
      recommendations.push('系统吞吐量较低，建议检查是否存在性能瓶颈');
    }

    if (recommendations.length === 0) {
      recommendations.push('系统性能表现良好，继续保持！');
    }

    return recommendations;
  }

  /**
   * 生成告警
   */
  private generateAlerts(metrics: any): PerformanceReport['alerts'] {
    const alerts: PerformanceReport['alerts'] = [];

    if (metrics.errorRate > this.config.errorRateThreshold) {
      alerts.push({
        level: 'error',
        message: 'u64cdu4f5cu5931u8d25',
        metric: 'error_rate',
        value: metrics.errorRate,
        threshold: this.config.errorRateThreshold
      });
    }

    if (metrics.p95ResponseTime > this.config.slowRequestThreshold) {
      alerts.push({
        level: 'warning',
        message: 'P95响应时间超过阈值',
        metric: 'p95_response_time',
        value: metrics.p95ResponseTime,
        threshold: this.config.slowRequestThreshold
      });
    }

    if (metrics.cacheHitRate < this.config.cacheHitRateThreshold) {
      alerts.push({
        level: 'warning',
        message: 'u64cdu4f5cu5931u8d25',
        metric: 'cache_hit_rate',
        value: metrics.cacheHitRate,
        threshold: this.config.cacheHitRateThreshold
      });
    }

    return alerts;
  }

  /**
   * 导出指标数据
   */
  exportMetrics(): string {
    return JSON.stringify({
      startTime: this.startTime,
      metricsCount: this.metrics.length,
      metrics: this.metrics.slice(-1000), // 导出最近1000条
      report: this.generateReport(60)
    }, null, 2);
  }

  /**
   * 重置监控
   */
  reset(): void {
    this.metrics = [];
    this.startTime = Date.now();
    console.log('🔄 性能监控已重置');
  }
}

// 创建全局性能监控实例
export const performanceMonitor = new PerformanceMonitor();

// 定期清理
if (typeof window !== 'undefined') {
  setInterval(() => {
    performanceMonitor.cleanup();
  }, 60 * 60 * 1000); // 每小时清理一次
}

export default PerformanceMonitor;
