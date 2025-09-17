/**
 * 性能监控组件
 * 显示标题生成系统的实时性能指标
 */

import React, { useState, useEffect, memo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Activity, 
  Clock, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle,
  Database,
  Zap,
  RefreshCw,
  Download
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { performanceMonitor } from '../services/PerformanceMonitor';

interface PerformanceMonitorProps {
  className?: string;
  refreshInterval?: number;
  showAlerts?: boolean;
}

export const PerformanceMonitorComponent = memo<PerformanceMonitorProps>(({
  className,
  refreshInterval = 5000,
  showAlerts = true
}) => {
  const [metrics, setMetrics] = useState<any>(null);
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  // 刷新数据
  const refreshData = async () => {
    setLoading(true);
    try {
      const realTimeMetrics = performanceMonitor.getRealTimeMetrics();
      const performanceReport = performanceMonitor.generateReport(60);
      
      setMetrics(realTimeMetrics);
      setReport(performanceReport);
      setLastUpdate(new Date());
    } catch (error) {
      console.error('刷新性能数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 自动刷新
  useEffect(() => {
    refreshData();
    const interval = setInterval(refreshData, refreshInterval);
    return () => clearInterval(interval);
  }, [refreshInterval]);

  // 导出性能数据
  const exportData = () => {
    const data = performanceMonitor.exportMetrics();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `performance_metrics_${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // 重置监控
  const resetMonitor = () => {
    performanceMonitor.reset();
    refreshData();
  };

  const getStatusColor = (value: number, thresholds: { good: number; warning: number }) => {
    if (value >= thresholds.good) return 'text-foreground';
    if (value >= thresholds.warning) return 'text-foreground';
    return 'text-destructive';
  };

  const getStatusBadge = (value: number, thresholds: { good: number; warning: number }) => {
    if (value >= thresholds.good) return 'default';
    if (value >= thresholds.warning) return 'secondary';
    return 'destructive';
  };

  if (!metrics || !report) {
    return (
      <Card className={cn("", className)}>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <RefreshCw className="w-6 h-6 animate-spin mr-2" />
            <span>加载性能数据...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* 标题和控制 */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              性能监控
            </CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={refreshData} disabled={loading}>
                <RefreshCw className={cn("w-4 h-4 mr-1", loading && "animate-spin")} />
                刷新
              </Button>
              <Button variant="outline" size="sm" onClick={exportData}>
                <Download className="w-4 h-4 mr-1" />
                导出
              </Button>
              <Button variant="outline" size="sm" onClick={resetMonitor}>
                重置
              </Button>
            </div>
          </div>
          <div className="text-xs text-muted-foreground">
            最后更新: {lastUpdate.toLocaleTimeString()}
          </div>
        </CardHeader>
      </Card>

      {/* 实时指标 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Clock className="w-8 h-8 text-primary" />
              <div>
                <div className="text-2xl font-bold">
                  {metrics.recentResponseTime.toFixed(0)}ms
                </div>
                <div className="text-xs text-muted-foreground">平均响应时间</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-8 h-8 text-foreground" />
              <div>
                <div className="text-2xl font-bold">
                  {(metrics.recentSuccessRate * 100).toFixed(1)}%
                </div>
                <div className="text-xs text-muted-foreground">成功率</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Database className="w-8 h-8 text-primary" />
              <div>
                <div className="text-2xl font-bold">
                  {(report.metrics.cacheHitRate * 100).toFixed(1)}%
                </div>
                <div className="text-xs text-muted-foreground">缓存命中率</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Zap className="w-8 h-8 text-foreground" />
              <div>
                <div className="text-2xl font-bold">
                  {report.metrics.throughput.toFixed(1)}
                </div>
                <div className="text-xs text-muted-foreground">请求/分钟</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 详细指标 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            详细指标 (最近60分钟)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">平均响应时间</span>
                  <Badge variant={getStatusBadge(5000 - report.metrics.averageResponseTime, { good: 4000, warning: 2000 })}>
                    {report.metrics.averageResponseTime.toFixed(0)}ms
                  </Badge>
                </div>
                <Progress 
                  value={Math.min((report.metrics.averageResponseTime / 10000) * 100, 100)} 
                  className="h-2"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">P95响应时间</span>
                  <Badge variant={getStatusBadge(8000 - report.metrics.p95ResponseTime, { good: 6000, warning: 3000 })}>
                    {report.metrics.p95ResponseTime.toFixed(0)}ms
                  </Badge>
                </div>
                <Progress 
                  value={Math.min((report.metrics.p95ResponseTime / 15000) * 100, 100)} 
                  className="h-2"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">成功率</span>
                  <Badge variant={getStatusBadge(report.metrics.successRate, { good: 0.95, warning: 0.9 })}>
                    {(report.metrics.successRate * 100).toFixed(1)}%
                  </Badge>
                </div>
                <Progress 
                  value={report.metrics.successRate * 100} 
                  className="h-2"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">缓存命中率</span>
                  <Badge variant={getStatusBadge(report.metrics.cacheHitRate, { good: 0.7, warning: 0.5 })}>
                    {(report.metrics.cacheHitRate * 100).toFixed(1)}%
                  </Badge>
                </div>
                <Progress 
                  value={report.metrics.cacheHitRate * 100} 
                  className="h-2"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">错误率</span>
                  <Badge variant={report.metrics.errorRate > 0.1 ? 'destructive' : 'default'}>
                    {(report.metrics.errorRate * 100).toFixed(1)}%
                  </Badge>
                </div>
                <Progress 
                  value={report.metrics.errorRate * 100} 
                  className="h-2"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">吞吐量</span>
                  <Badge variant="outline">
                    {report.metrics.throughput.toFixed(1)} req/min
                  </Badge>
                </div>
                <Progress 
                  value={Math.min((report.metrics.throughput / 10) * 100, 100)} 
                  className="h-2"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 告警和建议 */}
      {showAlerts && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* 告警 */}
          {report.alerts.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <AlertTriangle className="w-5 h-5" />
                  告警 ({report.alerts.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {report.alerts.map((alert: any, index: number) => (
                    <Alert key={index} variant={alert.level === 'error' ? 'destructive' : 'default'}>
                      <AlertDescription>
                        <div className="flex justify-between items-start">
                          <span>{alert.message}</span>
                          <Badge variant="outline" className="text-xs">
                            {alert.value.toFixed(2)} / {alert.threshold.toFixed(2)}
                          </Badge>
                        </div>
                      </AlertDescription>
                    </Alert>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* 优化建议 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-primary">
                <CheckCircle className="w-5 h-5" />
                优化建议
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {report.recommendations.map((recommendation: string, index: number) => (
                  <div key={index} className="flex items-start gap-2 text-sm">
                    <span className="text-primary mt-1">•</span>
                    <span>{recommendation}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
});

PerformanceMonitorComponent.displayName = 'PerformanceMonitorComponent';

export default PerformanceMonitorComponent;
