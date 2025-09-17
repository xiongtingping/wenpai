/**
 * MD2Card性能监控组件
 * 监控渲染性能、缓存命中率、用户体验指标等
 */

import React, { useEffect, useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { 
  Activity, 
  Clock, 
  Zap, 
  TrendingUp, 
  Database,
  RefreshCw,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import { md2cardCache } from './CacheManager';

// 性能指标接口
interface PerformanceMetrics {
  renderTime: number[];
  parseTime: number[];
  cacheHitRate: number;
  memoryUsage: number;
  totalOperations: number;
  errorRate: number;
  userSatisfaction: number;
}

// 实时性能数据
interface RealtimeMetrics {
  timestamp: number;
  renderTime: number;
  parseTime: number;
  cacheHit: boolean;
  operation: string;
}

/**
 * 性能监控器类
 */
class PerformanceMonitor {
  private metrics: PerformanceMetrics;
  private realtimeData: RealtimeMetrics[];
  private observers: ((metrics: PerformanceMetrics) => void)[] = [];
  private maxDataPoints = 100;

  constructor() {
    this.metrics = {
      renderTime: [],
      parseTime: [],
      cacheHitRate: 0,
      memoryUsage: 0,
      totalOperations: 0,
      errorRate: 0,
      userSatisfaction: 0
    };
    this.realtimeData = [];
    
    // 启动性能监控
    this.startMonitoring();
  }

  /**
   * 记录渲染性能
   */
  recordRender(startTime: number, endTime: number, cacheHit: boolean = false): void {
    const renderTime = endTime - startTime;
    
    this.metrics.renderTime.push(renderTime);
    this.metrics.totalOperations++;
    
    // 保持数据点数量限制
    if (this.metrics.renderTime.length > this.maxDataPoints) {
      this.metrics.renderTime.shift();
    }
    
    // 记录实时数据
    this.realtimeData.push({
      timestamp: Date.now(),
      renderTime,
      parseTime: 0,
      cacheHit,
      operation: 'render'
    });
    
    this.updateCacheHitRate();
    this.notifyObservers();
  }

  /**
   * 记录解析性能
   */
  recordParse(startTime: number, endTime: number, cacheHit: boolean = false): void {
    const parseTime = endTime - startTime;
    
    this.metrics.parseTime.push(parseTime);
    this.metrics.totalOperations++;
    
    if (this.metrics.parseTime.length > this.maxDataPoints) {
      this.metrics.parseTime.shift();
    }
    
    this.realtimeData.push({
      timestamp: Date.now(),
      renderTime: 0,
      parseTime,
      cacheHit,
      operation: 'parse'
    });
    
    this.updateCacheHitRate();
    this.notifyObservers();
  }

  /**
   * 记录错误
   */
  recordError(operation: string, error: Error): void {
    console.warn(`MD2Card ${operation} error:`, error);
    this.metrics.errorRate = this.calculateErrorRate();
    this.notifyObservers();
  }

  /**
   * 更新内存使用情况
   */
  updateMemoryUsage(): void {
    const cacheStats = md2cardCache.getAllStats();
    this.metrics.memoryUsage = cacheStats.totalMemoryUsage;
    this.notifyObservers();
  }

  /**
   * 获取当前指标
   */
  getMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }

  /**
   * 获取实时数据
   */
  getRealtimeData(): RealtimeMetrics[] {
    return [...this.realtimeData];
  }

  /**
   * 订阅指标更新
   */
  subscribe(callback: (metrics: PerformanceMetrics) => void): () => void {
    this.observers.push(callback);
    
    return () => {
      const index = this.observers.indexOf(callback);
      if (index > -1) {
        this.observers.splice(index, 1);
      }
    };
  }

  /**
   * 清空数据
   */
  reset(): void {
    this.metrics = {
      renderTime: [],
      parseTime: [],
      cacheHitRate: 0,
      memoryUsage: 0,
      totalOperations: 0,
      errorRate: 0,
      userSatisfaction: 0
    };
    this.realtimeData = [];
    this.notifyObservers();
  }

  /**
   * 启动性能监控
   */
  private startMonitoring(): void {
    // 定期更新内存使用情况
    setInterval(() => {
      this.updateMemoryUsage();
    }, 5000);

    // 清理旧数据
    setInterval(() => {
      this.cleanupOldData();
    }, 60000);
  }

  /**
   * 更新缓存命中率
   */
  private updateCacheHitRate(): void {
    const recentData = this.realtimeData.slice(-20); // 最近20次操作
    if (recentData.length === 0) return;
    
    const cacheHits = recentData.filter(item => item.cacheHit).length;
    this.metrics.cacheHitRate = (cacheHits / recentData.length) * 100;
  }

  /**
   * 计算错误率
   */
  private calculateErrorRate(): number {
    // 简化的错误率计算
    return Math.min(this.metrics.errorRate + 1, 10);
  }

  /**
   * 通知观察者
   */
  private notifyObservers(): void {
    this.observers.forEach(callback => callback(this.metrics));
  }

  /**
   * 清理旧数据
   */
  private cleanupOldData(): void {
    const cutoff = Date.now() - 10 * 60 * 1000; // 10分钟前
    this.realtimeData = this.realtimeData.filter(item => item.timestamp > cutoff);
  }
}

// 全局性能监控器实例
export const performanceMonitor = new PerformanceMonitor();

/**
 * 性能监控Dashboard组件
 */
interface PerformanceMonitorProps {
  className?: string;
}

export const PerformanceMonitorDashboard: React.FC<PerformanceMonitorProps> = ({ 
  className = '' 
}) => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>(performanceMonitor.getMetrics());
  const [realtimeData, setRealtimeData] = useState<RealtimeMetrics[]>([]);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const unsubscribe = performanceMonitor.subscribe(setMetrics);
    
    const updateRealtime = () => {
      setRealtimeData(performanceMonitor.getRealtimeData());
    };
    
    const interval = setInterval(updateRealtime, 1000);
    updateRealtime();
    
    return () => {
      unsubscribe();
      clearInterval(interval);
    };
  }, []);

  // 处理性能数据用于图表
  const renderTimeData = metrics.renderTime.map((time, index) => ({
    index: index + 1,
    time,
    acceptable: time < 1000 ? time : 1000
  }));

  const parseTimeData = metrics.parseTime.map((time, index) => ({
    index: index + 1,
    time,
    acceptable: time < 500 ? time : 500
  }));

  const cacheStats = md2cardCache.getAllStats();
  const cacheData = [
    { name: '模板缓存', value: cacheStats.template.size, color: '#8884d8' },
    { name: '预览缓存', value: cacheStats.preview.size, color: '#82ca9d' },
    { name: '内容缓存', value: cacheStats.parsedContent.size, color: '#ffc658' },
    { name: '设置缓存', value: cacheStats.settings.size, color: '#ff7300' }
  ];

  if (!isVisible) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsVisible(true)}
        className={`fixed bottom-4 right-4 z-50 ${className}`}
      >
        <Activity className="w-4 h-4 mr-2" />
        性能监控
      </Button>
    );
  }

  return (
    <div className={`fixed inset-4 z-50 bg-background border border-border rounded-lg shadow-lg overflow-auto ${className}`}>
      <div className="sticky top-0 bg-background border-b border-border p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5" />
          <h2 className="text-lg font-semibold">MD2Card 性能监控</h2>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => performanceMonitor.reset()}
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            重置
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsVisible(false)}
          >
            关闭
          </Button>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* 关键指标卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Clock className="w-4 h-4" />
                平均渲染时间
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {metrics.renderTime.length > 0 
                  ? Math.round(metrics.renderTime.reduce((a, b) => a + b, 0) / metrics.renderTime.length)
                  : 0}ms
              </div>
              <div className="text-xs text-muted-foreground">
                {metrics.renderTime.length > 0 && (
                  <Badge variant={metrics.renderTime[metrics.renderTime.length - 1] < 1000 ? 'default' : 'destructive'}>
                    {metrics.renderTime[metrics.renderTime.length - 1] < 1000 ? '良好' : '需优化'}
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Database className="w-4 h-4" />
                缓存命中率
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.cacheHitRate.toFixed(1)}%</div>
              <Progress value={metrics.cacheHitRate} className="mt-2" />
              <div className="text-xs text-muted-foreground mt-1">
                <Badge variant={metrics.cacheHitRate > 70 ? 'default' : 'secondary'}>
                  {metrics.cacheHitRate > 70 ? '优秀' : '一般'}
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Zap className="w-4 h-4" />
                内存使用
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {(metrics.memoryUsage / 1024 / 1024).toFixed(1)}MB
              </div>
              <div className="text-xs text-muted-foreground">
                <Badge variant={metrics.memoryUsage < 10 * 1024 * 1024 ? 'default' : 'destructive'}>
                  {metrics.memoryUsage < 10 * 1024 * 1024 ? '正常' : '偏高'}
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                总操作数
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.totalOperations}</div>
              <div className="text-xs text-muted-foreground">
                {metrics.errorRate > 0 ? (
                  <Badge variant="destructive" className="flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" />
                    {metrics.errorRate} 错误
                  </Badge>
                ) : (
                  <Badge variant="default" className="flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" />
                    运行正常
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 性能图表 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 渲染时间趋势 */}
          <Card>
            <CardHeader>
              <CardTitle>渲染时间趋势</CardTitle>
              <CardDescription>最近的渲染性能表现</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={renderTimeData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="index" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`${value}ms`, '渲染时间']} />
                  <Line 
                    type="monotone" 
                    dataKey="time" 
                    stroke="#8884d8" 
                    strokeWidth={2}
                    dot={{ r: 4 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="acceptable" 
                    stroke="#82ca9d" 
                    strokeDasharray="5 5"
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* 缓存分布 */}
          <Card>
            <CardHeader>
              <CardTitle>缓存使用分布</CardTitle>
              <CardDescription>各类缓存的使用情况</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={cacheData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {cacheData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* 缓存详细统计 */}
        <Card>
          <CardHeader>
            <CardTitle>缓存详细统计</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {Object.entries(cacheStats).filter(([key]) => key !== 'totalMemoryUsage').map(([key, stats]) => (
                <div key={key} className="space-y-2">
                  <h4 className="font-medium capitalize">{key}</h4>
                  <div className="text-sm space-y-1">
                    <div>大小: {(stats as any).size}/{(stats as any).maxSize}</div>
                    <div>访问: {(stats as any).totalAccess || 0}</div>
                    <div>命中率: {((stats as any).avgAccessCount || 0).toFixed(1)}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

/**
 * React Hook：性能监控
 */
export function usePerformanceMonitor() {
  const startTimeRef = useRef<number>(0);

  const startTimer = () => {
    startTimeRef.current = performance.now();
  };

  const endTimer = (operation: 'render' | 'parse', cacheHit: boolean = false) => {
    const endTime = performance.now();
    
    if (operation === 'render') {
      performanceMonitor.recordRender(startTimeRef.current, endTime, cacheHit);
    } else {
      performanceMonitor.recordParse(startTimeRef.current, endTime, cacheHit);
    }
  };

  const recordError = (operation: string, error: Error) => {
    performanceMonitor.recordError(operation, error);
  };

  return {
    startTimer,
    endTimer,
    recordError,
    getMetrics: () => performanceMonitor.getMetrics()
  };
}

export default PerformanceMonitorDashboard;