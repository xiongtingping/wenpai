/**
 * 增强版全网雷达组件
 * 集成 RSSHub 和 DailyHot 数据源
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  RefreshCw,
  Search,
  Filter,
  ExternalLink,
  Clock,
  Flame,
  Eye,
  Share2,
  Bookmark,
  BarChart3,
  Settings,
  Globe,
  Loader2,
  AlertCircle,
  CheckCircle,
  Zap,
  Target
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import dataFusionService, { FusedHotTopic, DataFusionConfig } from '@/services/dataFusionService';

interface EnhancedHotTopicsProps {
  className?: string;
}

export default function EnhancedHotTopics({ className  }: EnhancedHotTopicsProps) {
  const { t } = useTranslation();
  const { toast } = useToast();

  // 状态管理
  const [hotTopics, setHotTopics] = useState<FusedHotTopic[]>([]);
  const [filteredTopics, setFilteredTopics] = useState<FusedHotTopic[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedSource, setSelectedSource] = useState<string>('all');
  const [config, setConfig] = useState<DataFusionConfig | null>(null);
  const [stats, setStats] = useState<any>(null);
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

  // 自动刷新
  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(() => {
        refreshData();
      }, 3 * 60 * 1000); // 3分钟自动刷新
      setRefreshInterval(interval);
    } else {
      if (refreshInterval) {
        clearInterval(refreshInterval);
        setRefreshInterval(null);
      }
    }
  }, [autoRefresh, refreshData]);

  // 过滤数据
  useEffect(() => {
    filterTopics();
  }, [hotTopics, searchQuery, selectedCategory, selectedSource]);

  /**
   * 初始化数据
   */
  const initializeData = async () => {
    setLoading(true);
    try {
      // 获取配置
      const currentConfig = dataFusionService.getConfig();
      setConfig(currentConfig);

      // 获取数据
      await refreshData();
    } catch (error) {
      console.error('initializationfailed:', error);
      setError(t('components.errors.初始化失败'));
    } finally {
      setLoading(false);
    }
  };

  /**
   * 刷新数据（实时获取，无缓存）
   */
  const refreshData = useCallback(async () => {
    try {
      setError(null);
      setLoading(true);

      console.log('🔥 实时获取最新热点数据（无缓存）...');

      // 并发获取数据和统计
      const [topics, statistics] = await Promise.all([
        dataFusionService.getFusedHotTopics(),
        dataFusionService.getDataSourceStats()
      ]);

      setHotTopics(topics);
      setStats(statistics);

      toast({
        title: t('components.labels.数据更新成功'),
        description: `实时获取到 ${topics.length} 条热点数据`,
      });
    } catch (error) {
      console.error('refreshingdatafailed:', error);
      setError(error instanceof Error ? error.message : t('components.errors.刷新失败'));
      toast({
        title: t('components.labels.数据更新失败'),
        description: "请检查网络连接后重试",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [toast, t]);

  /**
   * 过滤话题
   */
  const filterTopics = () => {
    let filtered = [...hotTopics];

    // 搜索过滤
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(topic =>
        topic.title.toLowerCase().includes(query) ||
        (topic.description && topic.description.toLowerCase().includes(query)) ||
        topic.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }

    // 分类过滤
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(topic => topic.category === selectedCategory);
    }

    // 数据源过滤
    if (selectedSource !== 'all') {
      filtered = filtered.filter(topic => topic.dataSource === selectedSource);
    }

    setFilteredTopics(filtered);
  };

  /**
   * 更新配置
   */
  const updateConfig = (newConfig: Partial<DataFusionConfig>) => {
    if (config) {
      const updatedConfig = { ...config, ...newConfig };
      dataFusionService.updateConfig(updatedConfig);
      setConfig(updatedConfig);
      
      // 重新获取数据
      setTimeout(() => refreshData(), 500);
    }
  };

  /**
   * 获取分类列表
   */
  const getCategories = () => {
    const categories = [...new Set(hotTopics.map(topic => topic.category))];
    return categories.sort();
  };

  /**
   * 获取趋势图标
   */
  const getTrendIcon = (direction: string) => {
    switch (direction) {
      case 'up': return <TrendingUp className="h-4 w-4 text-success" />;
      case 'down': return <TrendingDown className="h-4 w-4 text-destructive" />;
      default: return <Minus className="h-4 w-4 text-muted-foreground" />;
    }
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

  if (loading && hotTopics.length === 0) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">加载融合数据中...</span>
      </div>
    );
  }

  return (
    <div className={className}>
      <Tabs defaultValue="topics" className="w-full">
        <TabsList className="unified-tabs-list grid w-full grid-cols-4">
          <TabsTrigger value="topics" className="unified-tab-trigger">融合热点</TabsTrigger>
          <TabsTrigger value="analytics" className="unified-tab-trigger">数据分析</TabsTrigger>
          <TabsTrigger value="sources" className="unified-tab-trigger">数据源</TabsTrigger>
          <TabsTrigger value="settings" className="unified-tab-trigger">配置</TabsTrigger>
        </TabsList>

        {/* 融合热点标签页 */}
        <TabsContent value="topics" className="space-y-4">
          {/* 控制面板 */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg flex items-center space-x-2">
                    <Zap className="h-5 w-5 text-warning" />
                    <span>增强版全网雷达</span>
                  </CardTitle>
                  <CardDescription>
                    融合 RSSHub 和 DailyHot 数据源，提供更全面的热点追踪
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

          {/* 统计卡片 */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">RSSHub 数据</p>
                      <p className="text-2xl font-bold">{stats.rsshub.count}</p>
                    </div>
                    <Globe className="h-8 w-8 text-primary" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">DailyHot 数据</p>
                      <p className="text-2xl font-bold">{stats.dailyhot.count}</p>
                    </div>
                    <Target className="h-8 w-8 text-success" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">融合总数</p>
                      <p className="text-2xl font-bold">{hotTopics.length}</p>
                    </div>
                    <BarChart3 className="h-8 w-8 text-purple-500" />
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* 过滤器 */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="搜索热点话题..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-full md:w-48">
                    <SelectValue placeholder="选择分类" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">全部分类</SelectItem>
                    {getCategories().map(category => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={selectedSource} onValueChange={setSelectedSource}>
                  <SelectTrigger className="w-full md:w-48">
                    <SelectValue placeholder={t('components.labels.占位符')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">全部来源</SelectItem>
                    <SelectItem value="rsshub">RSSHub</SelectItem>
                    <SelectItem value="dailyhot">DailyHot</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* 错误提示 */}
          {error && (
            <Card className="border-red-200 bg-red-50">
              <CardContent className="pt-6">
                <div className="flex items-center space-x-2 text-destructive">
                  <AlertCircle className="h-4 w-4" />
                  <span>{error}</span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* 热点列表 */}
          <div className="grid gap-4">
            {filteredTopics.map((topic, index) => (
              <Card key={topic.id}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <Badge variant="secondary">#{index + 1}</Badge>
                        <Badge variant={topic.dataSource === 'rsshub' ? 'default' : 'outline'}>
                          {topic.dataSource === 'rsshub' ? 'RSS' : 'Hot'}
                        </Badge>
                        <Badge variant="outline">{topic.source}</Badge>
                        <Badge variant="outline">{topic.category}</Badge>
                        {topic.hotScore > 80 && (
                          <Badge variant="destructive">
                            <Flame className="h-3 w-3 mr-1" />
                            热门
                          </Badge>
                        )}
                        {getTrendIcon(topic.trend.direction)}
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
                          <span>{formatTime(topic.publishTime)}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <TrendingUp className="h-3 w-3" />
                          <span>热度: {topic.hotScore}</span>
                        </div>
                        {topic.metrics.views && (
                          <div className="flex items-center space-x-1">
                            <Eye className="h-3 w-3" />
                            <span>{topic.metrics.views.toLocaleString()}</span>
                          </div>
                        )}
                      </div>
                      {topic.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {topic.tags.map(tag => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col space-y-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => window.open(topic.url, '_blank')}
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Bookmark className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Share2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredTopics.length === 0 && !loading && (
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-muted-foreground">没有找到匹配的热点话题</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* 其他标签页内容... */}
        <TabsContent value="analytics">
          <Card>
            <CardHeader>
              <CardTitle>数据分析</CardTitle>
            </CardHeader>
            <CardContent>
              <p>数据分析功能开发中...</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sources">
          <Card>
            <CardHeader>
              <CardTitle>数据源管理</CardTitle>
            </CardHeader>
            <CardContent>
              <p>数据源管理功能开发中...</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>融合配置</CardTitle>
            </CardHeader>
            <CardContent>
              <p>配置管理功能开发中...</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
