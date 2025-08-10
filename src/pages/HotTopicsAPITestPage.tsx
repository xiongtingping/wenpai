/**
 * 全网雷达API测试页面
 * 用于测试新的API封装功能
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  getDailyHotAll,
  getDailyHotByPlatform,
  getSupportedPlatforms,
  getPlatformDisplayName,
  clearCache,
  getCacheStats,

  type DailyHotResponse,
  type DailyHotItem
} from '@/api/hotTopicsService';
import { 
  RefreshCw, 
  Database, 
  Clock, 
  TrendingUp, 
  Activity,
  Zap,
  CheckCircle,
  AlertCircle,
  Info
} from 'lucide-react';

export default function HotTopicsAPITestPage() {
  const [allData, setAllData] = useState<DailyHotResponse | null>(null);
  const [_platformData, setPlatformData] = useState<Record<string, DailyHotItem[]>>({});
  const [loading, setLoading] = useState(false);
  const [cacheStats, setCacheStats] = useState<any>(null);
  const [testResults, setTestResults] = useState<any[]>([]);
  const [selectedPlatform, setSelectedPlatform] = useState('weibo');

  const supportedPlatforms = getSupportedPlatforms();

  // 更新缓存统计
  const updateCacheStats = () => {
    const stats = getCacheStats();
    setCacheStats(stats);
  };

  // 测试获取全平台数据
  const testGetAllData = async () => {
    setLoading(true);
    const startTime = Date.now();
    
    try {
      const data = await getDailyHotAll();
      const endTime = Date.now();
      
      setAllData(data);
      setTestResults(prev => [...prev, {
        test: '获取全平台数据',
        status: 'success',
        time: endTime - startTime,
        details: `成功获取${data.totalCount}条数据，涵盖${Object.keys(data.data).length}个平台`,
        timestamp: new Date().toLocaleTimeString()
      }]);
      
      updateCacheStats();
    } catch (error) {
      setTestResults(prev => [...prev, {
        test: '获取全平台数据',
        status: 'error',
        time: Date.now() - startTime,
        details: error instanceof Error ? error.message : '未知错误',
        timestamp: new Date().toLocaleTimeString()
      }]);
    } finally {
      setLoading(false);
    }
  };

  // 测试获取单平台数据
  const testGetPlatformData = async (platform: string) => {
    setLoading(true);
    const startTime = Date.now();
    
    try {
      const data = await getDailyHotByPlatform(platform);
      const endTime = Date.now();
      
      setPlatformData(prev => ({ ...prev, [platform]: data }));
      setTestResults(prev => [...prev, {
        test: `获取${getPlatformDisplayName(platform)}数据`,
        status: 'success',
        time: endTime - startTime,
        details: `成功获取${data.length}条热点数据`,
        timestamp: new Date().toLocaleTimeString()
      }]);
      
      updateCacheStats();
    } catch (error) {
      setTestResults(prev => [...prev, {
        test: `获取${getPlatformDisplayName(platform)}数据`,
        status: 'error',
        time: Date.now() - startTime,
        details: error instanceof Error ? error.message : '未知错误',
        timestamp: new Date().toLocaleTimeString()
      }]);
    } finally {
      setLoading(false);
    }
  };

  // 测试缓存功能
  const testCache = async () => {
    setLoading(true);
    
    // 第一次请求（应该从API获取）
    const startTime1 = Date.now();
    await getDailyHotByPlatform('weibo');
    const time1 = Date.now() - startTime1;
    
    // 第二次请求（应该从缓存获取）
    const startTime2 = Date.now();
    await getDailyHotByPlatform('weibo');
    const time2 = Date.now() - startTime2;
    
    setTestResults(prev => [...prev, {
      test: '缓存性能测试',
      status: time2 < time1 / 2 ? 'success' : 'warning',
      time: time2,
      details: `首次请求: ${time1}ms, 缓存请求: ${time2}ms, 提升: ${Math.round((1 - time2/time1) * 100)}%`,
      timestamp: new Date().toLocaleTimeString()
    }]);
    
    updateCacheStats();
    setLoading(false);
  };

  // 清除缓存测试
  const testClearCache = () => {
    clearCache();
    updateCacheStats();
    setTestResults(prev => [...prev, {
      test: '清除缓存',
      status: 'success',
      time: 0,
      details: '缓存已清除',
      timestamp: new Date().toLocaleTimeString()
    }]);
  };

  // 批量测试所有平台
  const testAllPlatforms = async () => {
    setLoading(true);
    const startTime = Date.now();
    
    const results = await Promise.allSettled(
      supportedPlatforms.map(platform => getDailyHotByPlatform(platform))
    );
    
    const successCount = results.filter(r => r.status === 'fulfilled').length;
    const endTime = Date.now();
    
    setTestResults(prev => [...prev, {
      test: '批量平台测试',
      status: successCount === supportedPlatforms.length ? 'success' : 'warning',
      time: endTime - startTime,
      details: `${successCount}/${supportedPlatforms.length} 平台成功`,
      timestamp: new Date().toLocaleTimeString()
    }]);
    
    updateCacheStats();
    setLoading(false);
  };

  // 获取状态图标
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-foreground" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-destructive" />;
      case 'warning':
        return <Info className="w-4 h-4 text-foreground" />;
      default:
        return <Activity className="w-4 h-4 text-muted-foreground" />;
    }
  };

  // 初始化
  useEffect(() => {
    updateCacheStats();
  }, []);

  return (
    <div className="min-h-screen bg-accent p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* 页面标题 */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-foreground mb-2">全网雷达API测试</h1>
          <p className="text-muted-foreground">测试新的API封装功能、缓存机制和性能表现</p>
        </div>

        {/* 控制面板 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5" />
              API测试控制面板
            </CardTitle>
            <CardDescription>
              点击按钮测试不同的API功能
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button 
                onClick={testGetAllData} 
                disabled={loading}
                className="flex items-center gap-2"
              >
                <TrendingUp className="w-4 h-4" />
                全平台数据
              </Button>
              
              <Button 
                onClick={() => testGetPlatformData(selectedPlatform)} 
                disabled={loading}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Activity className="w-4 h-4" />
                单平台数据
              </Button>
              
              <Button 
                onClick={testCache} 
                disabled={loading}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Database className="w-4 h-4" />
                缓存测试
              </Button>
              
              <Button 
                onClick={testAllPlatforms} 
                disabled={loading}
                variant="outline"
                className="flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                批量测试
              </Button>
            </div>
            
            <div className="mt-4 flex items-center gap-4">
              <select 
                value={selectedPlatform} 
                onChange={(e) => setSelectedPlatform(e.target.value)}
                className="px-3 py-2 border rounded-md"
              >
                {supportedPlatforms.map(platform => (
                  <option key={platform} value={platform}>
                    {getPlatformDisplayName(platform)}
                  </option>
                ))}
              </select>
              
              <Button 
                onClick={testClearCache} 
                variant="destructive" 
                size="sm"
              >
                清除缓存
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* 缓存统计 */}
        {cacheStats && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="w-5 h-5" />
                缓存统计
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">缓存条目数</p>
                  <p className="text-2xl font-bold">{cacheStats.size}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">最大容量</p>
                  <p className="text-2xl font-bold">{cacheStats.maxSize}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 测试结果 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              测试结果
            </CardTitle>
            <CardDescription>
              最近的API测试结果和性能数据
            </CardDescription>
          </CardHeader>
          <CardContent>
            {testResults.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">暂无测试结果，点击上方按钮开始测试</p>
            ) : (
              <div className="space-y-3">
                {testResults.slice(-10).reverse().map((result, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-accent rounded-lg">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(result.status)}
                      <div>
                        <p className="font-medium">{result.test}</p>
                        <p className="text-sm text-muted-foreground">{result.details}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant={result.status === 'success' ? 'default' : 'destructive'}>
                        {result.time}ms
                      </Badge>
                      <p className="text-xs text-muted-foreground mt-1">{result.timestamp}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* 数据预览 */}
        {allData && (
          <Card>
            <CardHeader>
              <CardTitle>全平台数据预览</CardTitle>
              <CardDescription>
                总计 {allData.totalCount} 条数据，来自 {Object.keys(allData.data).length} 个平台
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(allData.data).map(([platform, items]) => (
                  <div key={platform} className="p-4 border rounded-lg">
                    <h3 className="font-medium mb-2">{getPlatformDisplayName(platform)}</h3>
                    <p className="text-sm text-muted-foreground mb-3">{items.length} 条热点</p>
                    <div className="space-y-2">
                      {items.slice(0, 3).map((item, index) => (
                        <div key={index} className="text-sm">
                          <p className="font-medium line-clamp-1">{item.title}</p>
                          <p className="text-muted-foreground">热度: {item.hot}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
