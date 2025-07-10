/**
 * 全网雷达页面
 * 显示各平台热门话题和趋势，支持自定义话题订阅和实时监控
 * 数据源：DailyHotApi - https://github.com/imsyy/DailyHotApi
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { 
  TrendingUp, 
  Clock, 
  Users, 
  Hash, 
  Flame, 
  Search,
  Filter,
  Download,
  RefreshCw,
  Eye,
  Share2,
  Bookmark,
  Calendar,
  MapPin,
  Globe,
  Smartphone,
  Monitor,
  Video,
  Zap,
  Target,
  BarChart3,
  TrendingDown,
  Minus,
  ExternalLink,
  Plus,
  Settings,
  Bell,
  BellOff,
  Trash2,
  Edit,
  Activity,
  TrendingUp as TrendingUpIcon,
  AlertCircle,
  CheckCircle,
  Loader2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import PageNavigation from '@/components/layout/PageNavigation';
import { 
  getDailyHotAll,
  getDailyHotByPlatform,
  getSupportedPlatforms,
  getPlatformDisplayName,
  getPlatformIconClass,
  type DailyHotItem,
  type DailyHotResponse
} from '@/api/hotTopicsService';
import {
  getTopicSubscriptions,
  addTopicSubscription,
  updateTopicSubscription,
  deleteTopicSubscription,
  monitorTopic,
  getTopicHeatTrend,
  getAvailableSearchSources,
  checkAllSubscriptions,
  type TopicSubscription,
  type TopicMonitorResult,
  type TopicHeatTrend,
  type SearchSource
} from '@/api/topicSubscriptionService';

/**
 * 全网雷达页面组件
 * @returns React 组件
 */
export default function HotTopicsPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // 状态管理
  const [allHotData, setAllHotData] = useState<DailyHotResponse | null>(null);
  const [currentPlatform, setCurrentPlatform] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState<string | null>(null);
  
  // 话题订阅状态
  const [activeTab, setActiveTab] = useState<'hot' | 'subscriptions'>('hot');
  const [subscriptions, setSubscriptions] = useState<TopicSubscription[]>([]);
  const [monitorResults, setMonitorResults] = useState<Record<string, TopicMonitorResult[]>>({});
  const [selectedSubscription, setSelectedSubscription] = useState<TopicSubscription | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isMonitoring, setIsMonitoring] = useState(false);
  
  // 新增订阅表单
  const [newSubscription, setNewSubscription] = useState({
    keyword: '',
    name: '',
    description: '',
    platforms: [] as string[],
    sources: [] as string[],
    isActive: true,
    notificationEnabled: true,
    checkInterval: 30,
    minHeatThreshold: 1000
  });
  
  // 搜索源配置
  const [searchSources] = useState<SearchSource[]>(getAvailableSearchSources());
  
  // 支持的平台列表
  const supportedPlatforms = getSupportedPlatforms();

  /**
   * 获取全网热点数据
   */
  const fetchHotData = async () => {
    try {
      setLoading(true);
      setError(null); // 清除之前的错误
      const data = await getDailyHotAll();
      setAllHotData(data);
    } catch (error) {
      console.error('获取全网热点数据失败:', error);
      const errorMessage = error instanceof Error ? error.message : '网络连接异常';
      setError(errorMessage);
      toast({
        title: "获取数据失败",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  /**
   * 刷新数据
   */
  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchHotData();
    setRefreshing(false);
    if (!error) {
      toast({
        title: "数据已刷新",
        description: "全网热点数据已更新",
      });
    }
  };

  /**
   * 搜索话题
   */
  const handleSearch = () => {
    // 搜索功能将在后续实现
    toast({
      title: "搜索功能",
      description: "搜索功能开发中",
    });
  };

  /**
   * 获取平台图标
   */
  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'weibo':
        return <Globe className="w-4 h-4" />;
      case 'zhihu':
        return <Monitor className="w-4 h-4" />;
      case 'douyin':
        return <Video className="w-4 h-4" />;
      case 'bilibili':
        return <Users className="w-4 h-4" />;
      case 'baidu':
        return <Globe className="w-4 h-4" />;
      case '36kr':
        return <Zap className="w-4 h-4" />;
      case 'ithome':
        return <Monitor className="w-4 h-4" />;
      case 'sspai':
        return <Bookmark className="w-4 h-4" />;
      case 'juejin':
        return <Target className="w-4 h-4" />;
      case 'csdn':
        return <Monitor className="w-4 h-4" />;
      case 'github':
        return <Globe className="w-4 h-4" />;
      case 'v2ex':
        return <Users className="w-4 h-4" />;
      case 'ngabbs':
        return <Users className="w-4 h-4" />;
      case 'hellogithub':
        return <Globe className="w-4 h-4" />;
      case 'weatheralarm':
        return <Calendar className="w-4 h-4" />;
      case 'earthquake':
        return <MapPin className="w-4 h-4" />;
      case 'history':
        return <Bookmark className="w-4 h-4" />;
      default:
        return <Globe className="w-4 h-4" />;
    }
  };

  /**
   * 获取当前平台数据
   */
  const getCurrentPlatformData = (): DailyHotItem[] => {
    if (!allHotData || !allHotData.data) return [];
    
    if (currentPlatform === 'all') {
      // 聚合所有平台数据，取前50条
      const allItems: DailyHotItem[] = [];
      Object.entries(allHotData.data).forEach(([platform, items]) => {
        items.forEach(item => {
          allItems.push({
            ...item,
            platform // 添加平台标识
          });
        });
      });
      return allItems.slice(0, 50);
    }
    
    return allHotData.data[currentPlatform] || [];
  };

  /**
   * 获取统计信息
   */
  const getStats = () => {
    if (!allHotData || !allHotData.data) return null;
    
    const platforms = Object.keys(allHotData.data);
    const totalTopics = platforms.reduce((sum, platform) => 
      sum + (allHotData.data[platform]?.length || 0), 0
    );
    
    return {
      totalPlatforms: platforms.length,
      totalTopics,
      averageTopicsPerPlatform: Math.round(totalTopics / platforms.length)
    };
  };

  /**
   * 加载话题订阅
   */
  const loadSubscriptions = () => {
    const subs = getTopicSubscriptions();
    setSubscriptions(subs);
  };

  /**
   * 添加话题订阅
   */
  const handleAddSubscription = () => {
    if (!newSubscription.keyword.trim() || !newSubscription.name.trim()) {
      toast({
        title: "请填写完整信息",
        description: "关键词和名称不能为空",
        variant: "destructive"
      });
      return;
    }

    if (newSubscription.sources.length === 0) {
      toast({
        title: "请选择搜索源",
        description: "至少选择一个搜索源",
        variant: "destructive"
      });
      return;
    }

    const subscription = addTopicSubscription(newSubscription);
    setSubscriptions(prev => [...prev, subscription]);
    setIsAddDialogOpen(false);
    
    // 重置表单
    setNewSubscription({
      keyword: '',
      name: '',
      description: '',
      platforms: [],
      sources: [],
      isActive: true,
      notificationEnabled: true,
      checkInterval: 30,
      minHeatThreshold: 1000
    });

    toast({
      title: "订阅添加成功",
      description: `已开始监控话题"${subscription.name}"`,
    });
  };

  /**
   * 删除话题订阅
   */
  const handleDeleteSubscription = (id: string) => {
    if (deleteTopicSubscription(id)) {
      setSubscriptions(prev => prev.filter(s => s.id !== id));
      setMonitorResults(prev => {
        const newResults = { ...prev };
        delete newResults[id];
        return newResults;
      });
      toast({
        title: "订阅已删除",
        description: "话题监控已停止",
      });
    }
  };

  /**
   * 切换订阅状态
   */
  const handleToggleSubscription = (id: string, isActive: boolean) => {
    const updated = updateTopicSubscription(id, { isActive });
    if (updated) {
      setSubscriptions(prev => prev.map(s => s.id === id ? updated : s));
      toast({
        title: isActive ? "监控已启动" : "监控已暂停",
        description: `话题"${updated.name}"${isActive ? '开始' : '暂停'}监控`,
      });
    }
  };

  /**
   * 监控话题
   */
  const handleMonitorTopic = async (subscription: TopicSubscription) => {
    setIsMonitoring(true);
    try {
      const results = await monitorTopic(subscription);
      setMonitorResults(prev => ({
        ...prev,
        [subscription.id]: results
      }));
      toast({
        title: "监控完成",
        description: `发现 ${results.length} 条相关内容`,
      });
    } catch (error) {
      toast({
        title: "监控失败",
        description: "请稍后重试",
        variant: "destructive"
      });
    } finally {
      setIsMonitoring(false);
    }
  };

  /**
   * 检查所有订阅
   */
  const handleCheckAllSubscriptions = async () => {
    setIsMonitoring(true);
    try {
      const results = await checkAllSubscriptions();
      setMonitorResults(prev => ({ ...prev, ...results }));
      
      const totalResults = Object.values(results).flat().length;
      toast({
        title: "批量检查完成",
        description: `共发现 ${totalResults} 条相关内容`,
      });
    } catch (error) {
      toast({
        title: "检查失败",
        description: "请稍后重试",
        variant: "destructive"
      });
    } finally {
      setIsMonitoring(false);
    }
  };

  /**
   * 初始化数据
   */
  useEffect(() => {
    fetchHotData();
    loadSubscriptions();
  }, []);

  const currentData = getCurrentPlatformData();
  const stats = getStats();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 页面导航 */}
      <PageNavigation
        title="全网雷达"
        description="实时监控各平台热门话题，支持自定义话题订阅和智能追踪"
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={refreshing}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              刷新
            </Button>
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              已上线
            </Badge>
          </div>
        }
      />

      <div className="container mx-auto px-4 py-8">
        {/* 主标签页 */}
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'hot' | 'subscriptions')} className="w-full">
          <div className="flex items-center justify-between mb-6">
            <TabsList className="grid w-full grid-cols-2 max-w-md">
              <TabsTrigger value="hot" className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                全网热点
              </TabsTrigger>
              <TabsTrigger value="subscriptions" className="flex items-center gap-2">
                <Bell className="w-4 h-4" />
                话题订阅
              </TabsTrigger>
            </TabsList>
            
            {/* 操作按钮 */}
            <div className="flex items-center gap-2">
              {activeTab === 'subscriptions' && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCheckAllSubscriptions}
                    disabled={isMonitoring}
                  >
                    <RefreshCw className={`h-4 w-4 mr-2 ${isMonitoring ? 'animate-spin' : ''}`} />
                    检查所有
                  </Button>
                  <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                    <DialogTrigger asChild>
                      <Button size="sm">
                        <Plus className="h-4 w-4 mr-2" />
                        添加订阅
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                      <DialogHeader>
                        <DialogTitle>添加话题订阅</DialogTitle>
                        <DialogDescription>
                          设置关键词和监控配置，实时追踪相关话题
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="keyword">关键词</Label>
                          <Input
                            id="keyword"
                            value={newSubscription.keyword}
                            onChange={(e) => setNewSubscription(prev => ({ ...prev, keyword: e.target.value }))}
                            placeholder="输入要监控的关键词"
                          />
                        </div>
                        <div>
                          <Label htmlFor="name">订阅名称</Label>
                          <Input
                            id="name"
                            value={newSubscription.name}
                            onChange={(e) => setNewSubscription(prev => ({ ...prev, name: e.target.value }))}
                            placeholder="给这个订阅起个名字"
                          />
                        </div>
                        <div>
                          <Label htmlFor="description">描述</Label>
                          <Input
                            id="description"
                            value={newSubscription.description}
                            onChange={(e) => setNewSubscription(prev => ({ ...prev, description: e.target.value }))}
                            placeholder="可选：添加描述"
                          />
                        </div>
                        <div>
                          <Label>搜索源</Label>
                          <div className="grid grid-cols-2 gap-2 mt-2">
                            {searchSources.map((source) => (
                              <div key={source.id} className="flex items-center space-x-2">
                                <input
                                  type="checkbox"
                                  id={source.id}
                                  checked={newSubscription.sources.includes(source.id)}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setNewSubscription(prev => ({
                                        ...prev,
                                        sources: [...prev.sources, source.id]
                                      }));
                                    } else {
                                      setNewSubscription(prev => ({
                                        ...prev,
                                        sources: prev.sources.filter(s => s !== source.id)
                                      }));
                                    }
                                  }}
                                />
                                <Label htmlFor={source.id} className="text-sm">{source.name}</Label>
                              </div>
                            ))}
                          </div>
                        </div>
                        <div>
                          <Label htmlFor="interval">检查间隔（分钟）</Label>
                          <Select
                            value={newSubscription.checkInterval.toString()}
                            onValueChange={(value) => setNewSubscription(prev => ({ ...prev, checkInterval: parseInt(value) }))}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="5">5分钟</SelectItem>
                              <SelectItem value="15">15分钟</SelectItem>
                              <SelectItem value="30">30分钟</SelectItem>
                              <SelectItem value="60">1小时</SelectItem>
                              <SelectItem value="120">2小时</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Switch
                            id="notification"
                            checked={newSubscription.notificationEnabled}
                            onCheckedChange={(checked) => setNewSubscription(prev => ({ ...prev, notificationEnabled: checked }))}
                          />
                          <Label htmlFor="notification">启用通知</Label>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                          取消
                        </Button>
                        <Button onClick={handleAddSubscription}>
                          添加订阅
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </>
              )}
            </div>
          </div>

          {/* 全网热点标签页 */}
          <TabsContent value="hot">
            {/* 错误状态显示 */}
            {error && (
          <Card className="mb-6 border-red-200 bg-red-50">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                    <TrendingDown className="w-4 h-4 text-red-600" />
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-medium text-red-800">获取热点数据失败</h3>
                  <p className="text-sm text-red-700 mt-1">{error}</p>
                  <p className="text-xs text-red-600 mt-2">
                    可能原因：网络连接异常、API服务暂时不可用、或防火墙限制
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRefresh}
                  disabled={refreshing}
                  className="border-red-300 text-red-700 hover:bg-red-100"
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                  重试
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 统计概览 */}
        {stats && !error && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">支持平台</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalPlatforms}</p>
                  </div>
                  <Globe className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">总话题数</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalTopics}</p>
                  </div>
                  <Hash className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">平均话题数</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.averageTopicsPerPlatform}</p>
                  </div>
                  <BarChart3 className="h-8 w-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* 平台选择 */}
        {!error && (
          <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="w-5 h-5" />
              选择平台
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              <Button
                variant={currentPlatform === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setCurrentPlatform('all')}
              >
                <Globe className="w-4 h-4 mr-2" />
                全部平台
              </Button>
              {supportedPlatforms.map((platform) => (
                <Button
                  key={platform}
                  variant={currentPlatform === platform ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setCurrentPlatform(platform)}
                >
                  <div className={`w-3 h-3 rounded-full mr-2 ${getPlatformIconClass(platform)}`} />
                  {getPlatformDisplayName(platform)}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
        )}

        {/* 话题列表 */}
        {!error && (
          <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                {currentPlatform === 'all' ? '全网热点' : getPlatformDisplayName(currentPlatform)}
                <Badge variant="outline">{currentData.length}</Badge>
              </CardTitle>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const dataStr = JSON.stringify(currentData, null, 2);
                    navigator.clipboard.writeText(dataStr);
                    toast({
                      title: "数据已复制",
                      description: "话题数据已复制到剪贴板",
                    });
                  }}
                >
                  <Download className="w-4 h-4 mr-2" />
                  导出数据
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <RefreshCw className="w-8 h-8 animate-spin text-blue-500" />
                <span className="ml-2 text-gray-600">加载中...</span>
              </div>
            ) : currentData.length === 0 ? (
              <div className="text-center py-12">
                <Hash className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600">暂无热门话题</p>
              </div>
            ) : (
              <div className="space-y-4">
                {currentData.map((item, index) => (
                  <Card
                    key={`${currentPlatform}-${index}`}
                    className="cursor-pointer hover:shadow-md transition-shadow"
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="flex-shrink-0 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                              {index + 1}
                            </div>
                            <h3 className="font-medium text-gray-900 line-clamp-2">
                              {item.title}
                            </h3>
                            {item.hot && (
                              <Badge variant="outline" className="text-xs">
                                {item.hot}
                              </Badge>
                            )}
                          </div>
                          
                          {item.desc && (
                            <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                              {item.desc}
                            </p>
                          )}
                          
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            {currentPlatform === 'all' && item.platform && (
                              <div className="flex items-center gap-1">
                                <div className={`w-3 h-3 rounded-full ${getPlatformIconClass(item.platform)}`} />
                                <span>{getPlatformDisplayName(item.platform)}</span>
                              </div>
                            )}
                            {item.index && (
                              <div className="flex items-center gap-1">
                                <Hash className="w-3 h-3" />
                                <span>第{item.index}名</span>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex gap-2">
                          {item.url && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                              onClick={(e) => {
                                e.stopPropagation();
                                window.open(item.url, '_blank');
                              }}
                            >
                              <ExternalLink className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
        )}
      </div>
    </div>
  );
} 