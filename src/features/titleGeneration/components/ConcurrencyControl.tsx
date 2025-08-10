/**
 * 并发控制组件
 * 提供并发参数配置和实时监控界面
 */

import React, { useState, useEffect, memo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Zap, 
  Settings, 
  Activity, 
  Clock, 
  TrendingUp,
  AlertCircle,
  CheckCircle,
  RefreshCw
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { concurrencyManager } from '../services/ConcurrencyManager';
import { titleGenerationService } from '../services/TitleGenerationService';

interface ConcurrencyControlProps {
  className?: string;
  onConfigChange?: (config: ConcurrencyConfig) => void;
}

interface ConcurrencyConfig {
  enableConcurrency: boolean;
  maxConcurrency: number;
  enableBatching: boolean;
  batchSize: number;
  enableStreaming: boolean;
  priority: number;
}

export const ConcurrencyControl = memo<ConcurrencyControlProps>(({
  className,
  onConfigChange
}) => {
  const [config, setConfig] = useState<ConcurrencyConfig>({
    enableConcurrency: false,
    maxConcurrency: 3,
    enableBatching: false,
    batchSize: 5,
    enableStreaming: false,
    priority: 0
  });

  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  // 刷新统计数据
  const refreshStats = async () => {
    setLoading(true);
    try {
      const concurrencyStats = concurrencyManager.getStats();
      const serviceStats = titleGenerationService.getConcurrencyStats();
      
      setStats({
        concurrency: concurrencyStats,
        service: serviceStats
      });
      setLastUpdate(new Date());
    } catch (error) {
      console.error('刷新并发统计失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 自动刷新
  useEffect(() => {
    refreshStats();
    const interval = setInterval(refreshStats, 3000);
    return () => clearInterval(interval);
  }, []);

  // 配置变更处理
  const handleConfigChange = (newConfig: Partial<ConcurrencyConfig>) => {
    const updatedConfig = { ...config, ...newConfig };
    setConfig(updatedConfig);
    onConfigChange?.(updatedConfig);

    // 更新并发管理器配置
    concurrencyManager.configure({
      maxConcurrency: updatedConfig.maxConcurrency,
      batchSize: updatedConfig.batchSize
    });

    // 更新服务配置
    titleGenerationService.configureConcurrency({
      maxConcurrency: updatedConfig.maxConcurrency,
      batchSize: updatedConfig.batchSize
    });
  };

  // 清空队列
  const clearQueue = () => {
    concurrencyManager.clearQueue();
    refreshStats();
  };

  const getStatusColor = (value: number, thresholds: { good: number; warning: number }) => {
    if (value <= thresholds.good) return 'text-foreground';
    if (value <= thresholds.warning) return 'text-foreground';
    return 'text-destructive';
  };

  const getStatusBadge = (value: number, thresholds: { good: number; warning: number }) => {
    if (value <= thresholds.good) return 'default';
    if (value <= thresholds.warning) return 'secondary';
    return 'destructive';
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* 配置面板 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            并发配置
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* 基础开关 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="enable-concurrency" className="text-sm font-medium">
                启用并发处理
              </Label>
              <Switch
                id="enable-concurrency"
                checked={config.enableConcurrency}
                onCheckedChange={(checked) => 
                  handleConfigChange({ enableConcurrency: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="enable-batching" className="text-sm font-medium">
                启用批处理
              </Label>
              <Switch
                id="enable-batching"
                checked={config.enableBatching}
                onCheckedChange={(checked) => 
                  handleConfigChange({ enableBatching: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="enable-streaming" className="text-sm font-medium">
                启用流式处理
              </Label>
              <Switch
                id="enable-streaming"
                checked={config.enableStreaming}
                onCheckedChange={(checked) => 
                  handleConfigChange({ enableStreaming: checked })
                }
              />
            </div>
          </div>

          {/* 并发参数 */}
          {config.enableConcurrency && (
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <Label className="text-sm font-medium">最大并发数</Label>
                  <Badge variant="outline">{config.maxConcurrency}</Badge>
                </div>
                <Slider
                  value={[config.maxConcurrency]}
                  onValueChange={(value) => 
                    handleConfigChange({ maxConcurrency: value[0] })
                  }
                  min={1}
                  max={8}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>1</span>
                  <span>8</span>
                </div>
              </div>

              {config.enableBatching && (
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <Label className="text-sm font-medium">批处理大小</Label>
                    <Badge variant="outline">{config.batchSize}</Badge>
                  </div>
                  <Slider
                    value={[config.batchSize]}
                    onValueChange={(value) => 
                      handleConfigChange({ batchSize: value[0] })
                    }
                    min={2}
                    max={20}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>2</span>
                    <span>20</span>
                  </div>
                </div>
              )}

              <div>
                <div className="flex justify-between items-center mb-2">
                  <Label className="text-sm font-medium">请求优先级</Label>
                  <Badge variant="outline">{config.priority}</Badge>
                </div>
                <Slider
                  value={[config.priority]}
                  onValueChange={(value) => 
                    handleConfigChange({ priority: value[0] })
                  }
                  min={-5}
                  max={5}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>低优先级</span>
                  <span>高优先级</span>
                </div>
              </div>
            </div>
          )}

          {/* 配置说明 */}
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <div className="text-xs space-y-1">
                <p><strong>并发处理:</strong> 同时发送多个AI请求，提高生成速度</p>
                <p><strong>批处理:</strong> 将多个请求合并处理，减少网络开销</p>
                <p><strong>流式处理:</strong> 实时返回生成结果，改善用户体验</p>
              </div>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* 实时监控 */}
      {stats && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5" />
                实时监控
              </CardTitle>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={refreshStats} disabled={loading}>
                  <RefreshCw className={cn("w-4 h-4 mr-1", loading && "animate-spin")} />
                  刷新
                </Button>
                <Button variant="outline" size="sm" onClick={clearQueue}>
                  清空队列
                </Button>
              </div>
            </div>
            <div className="text-xs text-muted-foreground">
              最后更新: {lastUpdate.toLocaleTimeString()}
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* 活跃请求 */}
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">
                  {stats.concurrency.activeRequests}
                </div>
                <div className="text-xs text-muted-foreground">活跃请求</div>
              </div>

              {/* 队列长度 */}
              <div className="text-center">
                <div className={cn(
                  "text-2xl font-bold",
                  getStatusColor(stats.concurrency.queuedRequests, { good: 5, warning: 20 })
                )}>
                  {stats.concurrency.queuedRequests}
                </div>
                <div className="text-xs text-muted-foreground">队列长度</div>
              </div>

              {/* 完成率 */}
              <div className="text-center">
                <div className="text-2xl font-bold text-foreground">
                  {stats.concurrency.completedRequests}
                </div>
                <div className="text-xs text-muted-foreground">已完成</div>
              </div>

              {/* 错误率 */}
              <div className="text-center">
                <div className={cn(
                  "text-2xl font-bold",
                  getStatusColor(stats.concurrency.errorRate * 100, { good: 5, warning: 15 })
                )}>
                  {(stats.concurrency.errorRate * 100).toFixed(1)}%
                </div>
                <div className="text-xs text-muted-foreground">错误率</div>
              </div>
            </div>

            {/* 性能指标 */}
            <div className="mt-6 space-y-3">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium">平均等待时间</span>
                  <Badge variant={getStatusBadge(stats.concurrency.averageWaitTime, { good: 1000, warning: 3000 })}>
                    {stats.concurrency.averageWaitTime.toFixed(0)}ms
                  </Badge>
                </div>
                <Progress 
                  value={Math.min((stats.concurrency.averageWaitTime / 5000) * 100, 100)} 
                  className="h-2"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium">平均执行时间</span>
                  <Badge variant={getStatusBadge(stats.concurrency.averageExecutionTime, { good: 3000, warning: 8000 })}>
                    {stats.concurrency.averageExecutionTime.toFixed(0)}ms
                  </Badge>
                </div>
                <Progress 
                  value={Math.min((stats.concurrency.averageExecutionTime / 10000) * 100, 100)} 
                  className="h-2"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium">吞吐量</span>
                  <Badge variant="outline">
                    {stats.concurrency.throughput.toFixed(1)} req/min
                  </Badge>
                </div>
                <Progress 
                  value={Math.min((stats.concurrency.throughput / 20) * 100, 100)} 
                  className="h-2"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 性能建议 */}
      {stats && stats.concurrency.errorRate > 0.1 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            错误率较高 ({(stats.concurrency.errorRate * 100).toFixed(1)}%)，建议降低并发数或检查网络连接。
          </AlertDescription>
        </Alert>
      )}

      {stats && stats.concurrency.queuedRequests > 20 && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            队列积压较多 ({stats.concurrency.queuedRequests} 个请求)，建议增加并发数或启用批处理。
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
});

ConcurrencyControl.displayName = 'ConcurrencyControl';

export default ConcurrencyControl;
