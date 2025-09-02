/**
 * RSSHub 集成组件
 * 将 RSSHub API 数据集成到全网雷达功能中
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  TrendingUp,
  RefreshCw,
  Settings,
  ExternalLink,
  Clock,
  Flame,
  BarChart3,
  Globe,
  Loader2,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import hotTopicsApi, { HotTopicsResponse, HotTopicsFilter } from '@/api/hotTopicsApi';
import rsshubService, { HotTopicItem, PlatformConfig } from '@/services/rsshubService';

interface RSSHubIntegrationProps {
  onDataUpdate?: (data: HotTopicItem[]) => void;
  className?: string;
}

export default function RSSHubIntegration({ onDataUpdate, className }: RSSHubIntegrationProps) {
  const { toast } = useToast();
  
  // 状态管理
  const [hotTopics, setHotTopics] = useState<HotTopicItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [platforms, setPlatforms] = useState<PlatformConfig[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [lastUpdated, setLastUpdated] = useState<string>('');
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [refreshInterval, setRefreshInterval] = useState<NodeJS.Timeout | null>(null);

  // 初始化
  useEffect(() => {
    initializeData();
    return () => {
      if (refreshInterval) {
        clearInterval(refreshInterval);
      }
    };
  }, []);

  // 自动刷新控制
  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(() => {
        refreshData();
      }, 5 * 60 * 1000); // 5分钟刷新一次
      setRefreshInterval(interval);
    } else {
      if (refreshInterval) {
        clearInterval(refreshInterval);
        setRefreshInterval(null);
      }
    }
  }, [autoRefresh]);

  /**
   * 初始化数据
   */
  const initializeData = async () => {
    setLoading(true);
    try {
      // 获取支持的平台
      const supportedPlatforms = rsshubService.getSupportedPlatforms();
      setPlatforms(supportedPlatforms);

      // 获取热点数据
      await refreshData();
    } catch (error) {
      console.error('初始化失败:', error);
      setError('初始化失败');
    } finally {
      setLoading(false);
    }
  };

  /**
   * 刷新数据
   */
  const refreshData = useCallback(async () => {
    try {
      setError(null);
      const filter: HotTopicsFilter = {
        category: selectedCategory === 'all' ? undefined : selectedCategory,
        limit: 100
      };

      const response = await hotTopicsApi.getHotTopics(filter);
      
      if (response.success) {
        setHotTopics(response.data);
        setLastUpdated(response.lastUpdated);
        onDataUpdate?.(response.data);
        
        toast({
          title: "数据更新成功",
          description: `获取到 ${response.data.length} 条热点话题`,
        });
      } else {
        throw new Error(response.error || '获取数据失败');
      }
    } catch (error) {
      console.error('刷新数据失败:', error);
      setError(error instanceof Error ? error.message : '刷新失败');
      toast({
        title: "数据更新失败",
        description: error instanceof Error ? error.message : '请稍后重试',
        variant: "destructive"
      });
    }
  }, [selectedCategory, onDataUpdate, toast]);

  /**
   * 切换平台状态
   */
  const togglePlatform = (namespace: string, enabled: boolean) => {
    hotTopicsApi.updatePlatformConfig(namespace, enabled);
    setPlatforms(prev => 
      prev.map(p => 
        p.namespace === namespace ? { ...p, enabled } : p
      )
    );
    
    // 刷新数据
    setTimeout(() => refreshData(), 500);
  };

  /**
   * 获取分类统计
   */
  const getCategoryStats = () => {
    const categoryCount = new Map<string, number>();
    hotTopics.forEach(topic => {
      const count = categoryCount.get(topic.category) || 0;
      categoryCount.set(topic.category, count + 1);
    });
    return Array.from(categoryCount.entries()).map(([category, count]) => ({
      category,
      count,
      percentage: Math.round((count / hotTopics.length) * 100)
    }));
  };

  /**
   * 格式化时间
   */
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    
    if (minutes < 1) return '刚刚';
    if (minutes < 60) return `${minutes}分钟前`;
    if (minutes < 1440) return `${Math.floor(minutes / 60)}小时前`;
    return `${Math.floor(minutes / 1440)}天前`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">加载中...</span>
      </div>
    );
  }

  return (
    <div className={className}>
      <Tabs defaultValue="topics" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="topics">热点话题</TabsTrigger>
          <TabsTrigger value="platforms">平台管理</TabsTrigger>
          <TabsTrigger value="analytics">数据分析</TabsTrigger>
        </TabsList>

        {/* 热点话题标签页 */}
        <TabsContent value="topics" className="space-y-4">
          {/* 控制面板 */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">RSSHub 热点数据</CardTitle>
                  <CardDescription>
                    {lastUpdated && `最后更新: ${formatTime(lastUpdated)}`}
                  </CardDescription>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={autoRefresh}
                      onCheckedChange={setAutoRefresh}
                    />
                    <span className="text-sm">自动刷新</span>
                  </div>
                  <Button
                    onClick={refreshData}
                    disabled={loading}
                    size="sm"
                  >
                    <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                  </Button>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* 错误提示 */}
          {error && (
            <Card className="border-red-200 bg-red-50">
              <CardContent className="pt-6">
                <div className="flex items-center space-x-2 text-red-600">
                  <AlertCircle className="h-4 w-4" />
                  <span>{error}</span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* 分类过滤 */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={selectedCategory === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory('all')}
                >
                  全部 ({hotTopics.length})
                </Button>
                {getCategoryStats().map(({ category, count }) => (
                  <Button
                    key={category}
                    variant={selectedCategory === category ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedCategory(category)}
                  >
                    {category} ({count})
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* 热点列表 */}
          <div className="grid gap-4">
            {hotTopics.map((topic, index) => (
              <Card key={topic.id} className="hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <Badge variant="secondary">#{index + 1}</Badge>
                        <Badge variant="outline">{topic.source}</Badge>
                        <Badge variant="outline">{topic.category}</Badge>
                        {topic.hotScore && topic.hotScore > 80 && (
                          <Badge variant="destructive">
                            <Flame className="h-3 w-3 mr-1" />
                            热门
                          </Badge>
                        )}
                      </div>
                      <h3 className="font-semibold text-lg mb-2 line-clamp-2">
                        {topic.title}
                      </h3>
                      {topic.description && (
                        <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
                          {topic.description}
                        </p>
                      )}
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <div className="flex items-center space-x-1">
                          <Clock className="h-3 w-3" />
                          <span>{formatTime(topic.pubDate)}</span>
                        </div>
                        {topic.hotScore && (
                          <div className="flex items-center space-x-1">
                            <TrendingUp className="h-3 w-3" />
                            <span>热度: {topic.hotScore}</span>
                          </div>
                        )}
                      </div>
                      {topic.tags && topic.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {topic.tags.map(tag => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => window.open(topic.link, '_blank')}
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* 平台管理标签页 */}
        <TabsContent value="platforms" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>数据源管理</CardTitle>
              <CardDescription>
                管理各个平台的数据获取状态
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {platforms.map(platform => (
                  <div key={platform.namespace} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">{platform.name}</h4>
                      <p className="text-sm text-muted-foreground">{platform.category}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={platform.enabled ? 'default' : 'secondary'}>
                        {platform.enabled ? '已启用' : '已禁用'}
                      </Badge>
                      <Switch
                        checked={platform.enabled}
                        onCheckedChange={(enabled) => togglePlatform(platform.namespace, enabled)}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 数据分析标签页 */}
        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {getCategoryStats().map(({ category, count, percentage }) => (
              <Card key={category}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">{category}</p>
                      <p className="text-2xl font-bold">{count}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">{percentage}%</p>
                      <BarChart3 className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
