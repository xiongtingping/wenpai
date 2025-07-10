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
  Loader2,
  Play,
  Pause,
  BarChart,
  PieChart
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import PageNavigation from '@/components/layout/PageNavigation';
import TopicHeatChart from '@/components/hot-topics/TopicHeatChart';
import NotificationCenter from '@/components/hot-topics/NotificationCenter';
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
  toggleSubscription,
  getSubscriptionStats,
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
  const [activeTab, setActiveTab] = useState<'hot' | 'subscriptions' | 'notifications'>('hot');
  const [subscriptions, setSubscriptions] = useState<TopicSubscription[]>([]);
  const [monitorResults, setMonitorResults] = useState<Record<string, TopicMonitorResult[]>>({});
  const [selectedSubscription, setSelectedSubscription] = useState<TopicSubscription | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [subscriptionStats, setSubscriptionStats] = useState(getSubscriptionStats());
  
  // 热度趋势状态
  const [heatTrends, setHeatTrends] = useState<Record<string, TopicHeatTrend[]>>({});
  const [loadingTrends, setLoadingTrends] = useState<Record<string, boolean>>({});
  
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
    minHeatThreshold: 1000,
    maxHeatThreshold: 50000
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
      default:
        return <Hash className="w-4 h-4" />;
    }
  };

  /**
   * 获取当前平台数据
   */
  const getCurrentPlatformData = (): DailyHotItem[] => {
    if (!allHotData) return [];
    
    if (currentPlatform === 'all') {
      // 聚合所有平台数据
      const allItems: DailyHotItem[] = [];
      Object.values(allHotData.data).forEach(items => {
        allItems.push(...items);
      });
      return allItems.slice(0, 50); // 限制数量
    }
    
    return allHotData.data[currentPlatform] || [];
  };

  /**
   * 获取统计信息
   */
  const getStats = () => {
    if (!allHotData) return { total: 0, platforms: 0 };
    
    const total = Object.values(allHotData.data).reduce((sum, items) => sum + items.length, 0);
    const platforms = Object.keys(allHotData.data).length;
    
    return { total, platforms };
  };

  /**
   * 加载订阅列表
   */
  const loadSubscriptions = () => {
    const subs = getTopicSubscriptions();
    setSubscriptions(subs);
    setSubscriptionStats(getSubscriptionStats());
  };

  /**
   * 添加订阅
   */
  const handleAddSubscription = () => {
    if (!newSubscription.keyword.trim() || !newSubscription.name.trim()) {
      toast({
        title: "请填写必填项",
        description: "关键词和订阅名称不能为空",
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

    try {
      addTopicSubscription(newSubscription);
      setIsAddDialogOpen(false);
      setNewSubscription({
        keyword: '',
        name: '',
        description: '',
        platforms: [],
        sources: [],
        isActive: true,
        notificationEnabled: true,
        checkInterval: 30,
        minHeatThreshold: 1000,
        maxHeatThreshold: 50000
      });
      loadSubscriptions();
      
      toast({
        title: "订阅创建成功",
        description: `话题"${newSubscription.keyword}"已添加到监控列表`,
      });
    } catch (error) {
      toast({
        title: "创建失败",
        description: "请重试",
        variant: "destructive"
      });
    }
  };

  /**
   * 删除订阅
   */
  const handleDeleteSubscription = (id: string) => {
    const subscription = subscriptions.find(s => s.id === id);
    if (!subscription) return;

    if (confirm(`确定要删除话题订阅"${subscription.name}"吗？`)) {
      deleteTopicSubscription(id);
      loadSubscriptions();
      
      toast({
        title: "删除成功",
        description: `话题订阅"${subscription.name}"已删除`,
      });
    }
  };

  /**
   * 切换订阅状态
   */
  const handleToggleSubscription = (id: string, isActive: boolean) => {
    toggleSubscription(id, isActive);
    loadSubscriptions();
  };

  /**
   * 监控单个话题
   */
  const handleMonitorTopic = async (subscription: TopicSubscription) => {
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
        description: "请重试",
        variant: "destructive"
      });
    }
  };

  /**
   * 检查所有订阅
   */
  const handleCheckAllSubscriptions = async () => {
    setIsMonitoring(true);
    try {
      const results = await checkAllSubscriptions();
      setMonitorResults(results);
      
      const totalResults = Object.values(results).flat().length;
      toast({
        title: "检查完成",
        description: `共发现 ${totalResults} 条相关内容`,
      });
    } catch (error) {
      toast({
        title: "检查失败",
        description: "请重试",
        variant: "destructive"
      });
    } finally {
      setIsMonitoring(false);
    }
  };

  /**
   * 加载热度趋势
   */
  const loadHeatTrends = async (keyword: string) => {
    if (heatTrends[keyword]) return;
    
    setLoadingTrends(prev => ({ ...prev, [keyword]: true }));
    try {
      const trends = await getTopicHeatTrend(keyword, 7);
      setHeatTrends(prev => ({ ...prev, [keyword]: trends }));
    } catch (error) {
      console.error('加载热度趋势失败:', error);
    } finally {
      setLoadingTrends(prev => ({ ...prev, [keyword]: false }));
    }
  };

  // 初始化
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
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'hot' | 'subscriptions' | 'notifications')} className="w-full">
          <div className="flex items-center justify-between mb-6">
            <TabsList className="grid w-full grid-cols-3 max-w-md">
              <TabsTrigger value="hot" className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                全网热点
              </TabsTrigger>
              <TabsTrigger value="subscriptions" className="flex items-center gap-2">
                <Bell className="w-4 h-4" />
                话题订阅
              </TabsTrigger>
              <TabsTrigger value="notifications" className="flex items-center gap-2">
                <Bell className="w-4 h-4" />
                通知中心
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
                          <Label htmlFor="keyword">关键词 *</Label>
                          <Input
                            id="keyword"
                            value={newSubscription.keyword}
                            onChange={(e) => setNewSubscription(prev => ({ ...prev, keyword: e.target.value }))}
                            placeholder="输入要监控的关键词"
                          />
                        </div>
                        <div>
                          <Label htmlFor="name">订阅名称 *</Label>
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
                          <Label>搜索源 *</Label>
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
                        <div>
                          <Label htmlFor="maxHeat">热度警报阈值</Label>
                          <Input
                            id="maxHeat"
                            type="number"
                            value={newSubscription.maxHeatThreshold}
                            onChange={(e) => setNewSubscription(prev => ({ ...prev, maxHeatThreshold: parseInt(e.target.value) || 0 }))}
                            placeholder="超过此热度时发送警报"
                          />
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

            {/* 平台选择 */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="text-lg">选择平台</CardTitle>
                <CardDescription>
                  查看不同平台的热门话题
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant={currentPlatform === 'all' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setCurrentPlatform('all')}
                  >
                    全部平台
                  </Button>
                  {supportedPlatforms.map((platform) => (
                    <Button
                      key={platform}
                      variant={currentPlatform === platform ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setCurrentPlatform(platform)}
                    >
                      {getPlatformIcon(platform)}
                      {getPlatformDisplayName(platform)}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* 统计信息 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">总话题数</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                    </div>
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <Hash className="w-4 h-4 text-blue-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">平台数量</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.platforms}</p>
                    </div>
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <Globe className="w-4 h-4 text-green-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">更新时间</p>
                      <p className="text-sm font-bold text-gray-900">
                        {new Date().toLocaleTimeString('zh-CN')}
                      </p>
                    </div>
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                      <Clock className="w-4 h-4 text-purple-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* 话题列表 */}
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-2 text-gray-600">加载中...</span>
              </div>
            ) : (
              <div className="grid gap-4">
                {currentData.map((item, index) => (
                  <Card key={index} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-sm font-medium text-gray-500">#{index + 1}</span>
                            <Badge variant="outline" className="text-xs">
                              {item.platform}
                            </Badge>
                            {item.hot && (
                              <Badge variant="destructive" className="text-xs">
                                <Flame className="w-3 h-3 mr-1" />
                                热
                              </Badge>
                            )}
                          </div>
                          <h3 className="font-medium text-gray-900 mb-2">{item.title}</h3>
                          <p className="text-sm text-gray-600 mb-3">{item.desc}</p>
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <span>热度: {item.hot}</span>
                            <span>平台: {item.platform || '未知'}</span>
                            <span>序号: {item.index || 'N/A'}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 ml-4">
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <Share2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* 话题订阅标签页 */}
          <TabsContent value="subscriptions">
            {/* 订阅统计 */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <Card>
                <CardContent className="p-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-gray-900">{subscriptionStats.total}</p>
                    <p className="text-sm text-gray-600">总订阅数</p>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">{subscriptionStats.active}</p>
                    <p className="text-sm text-gray-600">活跃订阅</p>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-600">{subscriptionStats.notificationEnabled}</p>
                    <p className="text-sm text-gray-600">通知开启</p>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-purple-600">
                      {Object.values(monitorResults).flat().length}
                    </p>
                    <p className="text-sm text-gray-600">监控结果</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* 订阅列表 */}
            {subscriptions.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <BellOff className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">暂无话题订阅</h3>
                  <p className="text-gray-600 mb-4">
                    创建话题订阅，实时监控感兴趣的内容
                  </p>
                  <Button onClick={() => setIsAddDialogOpen(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    添加第一个订阅
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {subscriptions.map((subscription) => (
                  <Card key={subscription.id} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <Target className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <h3 className="font-medium text-gray-900">{subscription.name}</h3>
                            <p className="text-sm text-gray-600">关键词: {subscription.keyword}</p>
                            {subscription.description && (
                              <p className="text-sm text-gray-500 mt-1">{subscription.description}</p>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={subscription.isActive}
                            onCheckedChange={(checked) => handleToggleSubscription(subscription.id, checked)}
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleMonitorTopic(subscription)}
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            检查
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedSubscription(subscription);
                              loadHeatTrends(subscription.keyword);
                            }}
                          >
                            <BarChart className="w-4 h-4 mr-2" />
                            趋势
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteSubscription(subscription.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">状态:</span>
                          <Badge 
                            variant={subscription.isActive ? "default" : "secondary"}
                            className="ml-2"
                          >
                            {subscription.isActive ? (
                              <>
                                <Play className="w-3 h-3 mr-1" />
                                监控中
                              </>
                            ) : (
                              <>
                                <Pause className="w-3 h-3 mr-1" />
                                已暂停
                              </>
                            )}
                          </Badge>
                        </div>
                        
                        <div>
                          <span className="text-gray-500">检查间隔:</span>
                          <span className="ml-2 font-medium">{subscription.checkInterval}分钟</span>
                        </div>
                        
                        <div>
                          <span className="text-gray-500">搜索源:</span>
                          <span className="ml-2 font-medium">{subscription.sources.length}个</span>
                        </div>
                        
                        <div>
                          <span className="text-gray-500">通知:</span>
                          <Badge 
                            variant={subscription.notificationEnabled ? "default" : "secondary"}
                            className="ml-2"
                          >
                            {subscription.notificationEnabled ? "开启" : "关闭"}
                          </Badge>
                        </div>
                      </div>
                      
                      {/* 监控结果 */}
                      {monitorResults[subscription.id] && (
                        <div className="mt-4 pt-4 border-t">
                          <h4 className="font-medium text-gray-900 mb-2">
                            最新监控结果 ({monitorResults[subscription.id].length} 条)
                          </h4>
                          <div className="space-y-2">
                            {monitorResults[subscription.id].slice(0, 3).map((result) => (
                              <div key={result.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                                <div className="flex-1">
                                  <p className="text-sm font-medium">{result.title}</p>
                                  <p className="text-xs text-gray-600">{result.platform} • 热度: {result.heat}</p>
                                </div>
                                <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                  <ExternalLink className="w-3 h-3" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
            
            {/* 热度趋势图表 */}
            {selectedSubscription && heatTrends[selectedSubscription.keyword] && (
              <div className="mt-6">
                <TopicHeatChart
                  keyword={selectedSubscription.keyword}
                  trends={heatTrends[selectedSubscription.keyword]}
                  loading={loadingTrends[selectedSubscription.keyword]}
                  onRefresh={() => loadHeatTrends(selectedSubscription.keyword)}
                />
              </div>
            )}
          </TabsContent>

          {/* 通知中心标签页 */}
          <TabsContent value="notifications">
            <NotificationCenter />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
} 