/**
 * 🚀 数据服务演示组件
 * 展示如何使用新的数据持久化服务系统
 */

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  useDataServices, 
  useDataOperations, 
  useCacheManager, 
  usePerformanceMonitor 
} from '@/hooks/useDataServices';

interface DemoData {
  id: string;
  name: string;
  value: number;
  timestamp: number;
}

export function DataServicesDemo() {
  const dataServices = useDataServices();
  const dataOps = useDataOperations();
  const cache = useCacheManager<DemoData>();
  const performance = usePerformanceMonitor();

  const [demoData, setDemoData] = useState<DemoData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [stats, setStats] = useState<any>(null);

  // 生成演示数据
  const generateDemoData = (): DemoData => ({
    id: `demo_${Date.now()}`,
    name: `Demo Item ${Math.random().toString(36).substr(2, 9)}`,
    value: Math.floor(Math.random() * 1000),
    timestamp: Date.now()
  });

  // 智能保存演示
  const handleSmartSave = async () => {
    if (!dataOps.isReady) return;
    
    setIsLoading(true);
    const data = generateDemoData();
    
    const success = await dataOps.saveDataSmart(
      `demo_item_${data.id}`,
      data,
      {
        level: 'hybrid',
        syncPriority: 'medium',
        cacheTtl: 300000
      }
    );

    if (success) {
      setDemoData(data);
    }
    
    setIsLoading(false);
  };

  // 智能加载演示
  const handleSmartLoad = async () => {
    if (!dataOps.isReady || !demoData) return;
    
    setIsLoading(true);
    
    const loaded = await dataOps.loadDataSmart<DemoData>(`demo_item_${demoData.id}`);
    
    if (loaded) {
      setDemoData(loaded);
    }
    
    setIsLoading(false);
  };

  // 清除缓存演示
  const handleClearCache = () => {
    if (cache.isReady) {
      cache.clear();
      console.log('🗑️ 缓存已清空');
    }
  };

  // 获取性能统计
  const refreshStats = () => {
    if (!performance.isReady) return;
    
    const metrics = performance.getCurrentMetrics();
    const report = performance.getReport();
    const cacheStats = cache.getStats();

    setStats({
      performance: metrics,
      report,
      cache: cacheStats,
      health: dataServices.health
    });
  };

  // 定期更新统计
  useEffect(() => {
    const interval = setInterval(refreshStats, 5000);
    refreshStats();
    
    return () => clearInterval(interval);
  }, [dataServices.isReady]);

  if (!dataServices.isReady) {
    return (
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>🚀 数据服务演示</CardTitle>
          <CardDescription>数据服务正在初始化中...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2">
            <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
            <span>等待服务就绪</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* 主控制面板 */}
      <Card>
        <CardHeader>
          <CardTitle>🚀 数据服务演示</CardTitle>
          <CardDescription>
            演示新的数据持久化系统：缓存、同步、存储和性能监控
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-4 mb-6">
            <Button 
              onClick={handleSmartSave}
              disabled={isLoading}
              className="bg-blue-500 hover:bg-blue-600"
            >
              {isLoading ? '保存中...' : '智能保存数据'}
            </Button>
            
            <Button 
              onClick={handleSmartLoad}
              disabled={isLoading || !demoData}
              variant="outline"
            >
              {isLoading ? '加载中...' : '智能加载数据'}
            </Button>
            
            <Button 
              onClick={handleClearCache}
              variant="destructive"
            >
              清除缓存
            </Button>
            
            <Button 
              onClick={refreshStats}
              variant="secondary"
            >
              刷新统计
            </Button>
          </div>

          {/* 当前数据显示 */}
          {demoData && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold mb-2">当前演示数据:</h4>
              <pre className="text-sm">{JSON.stringify(demoData, null, 2)}</pre>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 服务状态面板 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">性能监控</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant={dataServices.health.services.performance ? "default" : "destructive"}>
              {dataServices.health.services.performance ? "✅ 运行中" : "❌ 离线"}
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">缓存管理</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant={dataServices.health.services.cache ? "default" : "destructive"}>
              {dataServices.health.services.cache ? "✅ 运行中" : "❌ 离线"}
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">数据同步</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant={dataServices.health.services.sync ? "default" : "destructive"}>
              {dataServices.health.services.sync ? "✅ 运行中" : "❌ 离线"}
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">存储策略</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant={dataServices.health.services.storage ? "default" : "destructive"}>
              {dataServices.health.services.storage ? "✅ 运行中" : "❌ 离线"}
            </Badge>
          </CardContent>
        </Card>
      </div>

      {/* 详细统计信息 */}
      {stats && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 性能统计 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">📊 性能统计</CardTitle>
            </CardHeader>
            <CardContent>
              {stats.performance && (
                <div className="space-y-2">
                  <div>总事件数: {stats.performance.totalEvents}</div>
                  <div>成功率: {stats.performance.successRate?.toFixed(1)}%</div>
                  <div>平均响应时间: {stats.performance.averageResponseTime?.toFixed(2)}ms</div>
                  {stats.performance.webVitals && (
                    <div className="text-sm text-gray-600 mt-3">
                      <div>FCP: {stats.performance.webVitals.fcp?.toFixed(2)}ms</div>
                      <div>LCP: {stats.performance.webVitals.lcp?.toFixed(2)}ms</div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* 缓存统计 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">💾 缓存统计</CardTitle>
            </CardHeader>
            <CardContent>
              {stats.cache && (
                <div className="space-y-2">
                  <div>缓存项数: {stats.cache.size}</div>
                  <div>内存使用: {(stats.cache.memoryUsage / 1024 / 1024).toFixed(2)}MB</div>
                  <div>命中率: {stats.cache.hitRate?.toFixed(1)}%</div>
                  <div>总访问数: {stats.cache.totalAccesses}</div>
                  <div>命中数: {stats.cache.hits}</div>
                  <div>失效数: {stats.cache.evictions}</div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* 系统健康状态 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">🏥 系统健康状态</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="font-medium">系统初始化: </span>
              <Badge variant={dataServices.health.isInitialized ? "default" : "destructive"}>
                {dataServices.health.isInitialized ? "完成" : "进行中"}
              </Badge>
            </div>
            <div>
              <span className="font-medium">数据服务就绪: </span>
              <Badge variant={dataServices.isReady ? "default" : "destructive"}>
                {dataServices.isReady ? "就绪" : "等待中"}
              </Badge>
            </div>
          </div>
          
          {stats?.health?.metrics && (
            <div className="mt-4 p-3 bg-gray-50 rounded">
              <h5 className="font-medium mb-2">实时指标:</h5>
              <pre className="text-xs overflow-x-auto">
                {JSON.stringify(stats.health.metrics, null, 2)}
              </pre>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}