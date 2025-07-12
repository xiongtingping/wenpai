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
  PieChart,
  Star,
  Shield,
  Heart
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import PageNavigation from '@/components/layout/PageNavigation';
import TopicHeatChart from '@/components/hot-topics/TopicHeatChart';
import NotificationCenter from '@/components/hot-topics/NotificationCenter';
import TopThreePodium from '@/components/hot-topics/TopThreePodium';
import { 
  getDailyHotAll,
  getDailyHotByPlatform,
  getSupportedPlatforms,
  getPlatformDisplayName,
  getPlatformIconClass,
  type DailyHotItem,
  type DailyHotResponse
} from '@/api/hotTopicsService';
import InterestFilter, { InterestFilters } from '@/components/hot-topics/InterestFilter';
import TopicCategories from '@/components/hot-topics/TopicCategories';
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

  // 兴趣过滤器状态
  const [interestFilters, setInterestFilters] = useState<InterestFilters>({
    blockedKeywords: [],
    blockedPlatforms: [],
    preferredKeywords: [],
    preferredPlatforms: [],
    showBlocked: false
  });

  // 分类状态
  const [currentCategory, setCurrentCategory] = useState('all');
  const [filteredTopics, setFilteredTopics] = useState<DailyHotItem[]>([]);

  /**
   * 智能过滤和排序话题
   * 根据屏蔽词和偏好关键词进行动态过滤与优先推送
   */
  const applySmartFiltering = (topics: DailyHotItem[]): DailyHotItem[] => {
    // 1. 屏蔽词过滤
    const filteredByBlocked = topics.filter(topic => {
      const title = topic.title.toLowerCase();
      const desc = (topic.desc || '').toLowerCase();
      const content = (topic.content || '').toLowerCase();
      const platform = topic.platform || '';

      // 检查是否被屏蔽
      const isBlockedByKeyword = interestFilters.blockedKeywords.some(keyword => 
        title.includes(keyword.toLowerCase()) || 
        desc.includes(keyword.toLowerCase()) ||
        content.includes(keyword.toLowerCase())
      );
      
      const isBlockedByPlatform = interestFilters.blockedPlatforms.includes(platform);

      return !isBlockedByKeyword && !isBlockedByPlatform;
    });

    // 2. 偏好关键词标记和排序
    const topicsWithPriority = filteredByBlocked.map(topic => {
      const title = topic.title.toLowerCase();
      const desc = (topic.desc || '').toLowerCase();
      const content = (topic.content || '').toLowerCase();
      const platform = topic.platform || '';

      // 计算偏好分数
      let preferenceScore = 0;
      let matchedKeywords: string[] = [];

      // 偏好关键词加分
      interestFilters.preferredKeywords.forEach(keyword => {
        const keywordLower = keyword.toLowerCase();
        if (title.includes(keywordLower) || desc.includes(keywordLower) || content.includes(keywordLower)) {
          preferenceScore += 10;
          matchedKeywords.push(keyword);
        }
      });

      // 偏好平台加分
      if (interestFilters.preferredPlatforms.includes(platform)) {
        preferenceScore += 5;
      }

      return {
        ...topic,
        preferenceScore,
        matchedKeywords,
        isHighPriority: preferenceScore > 0
      };
    });

    // 3. 按优先级分组和排序
    const highPriority = topicsWithPriority
      .filter(topic => topic.isHighPriority)
      .sort((a, b) => {
        // 按偏好关键词数量降序排序
        if (b.preferenceScore !== a.preferenceScore) {
          return b.preferenceScore - a.preferenceScore;
        }
        // 如果分数相同，按热度值降序排序
        const hotA = parseInt(a.hot) || 0;
        const hotB = parseInt(b.hot) || 0;
        return hotB - hotA;
      });

    const normalPriority = topicsWithPriority
      .filter(topic => !topic.isHighPriority)
      .sort((a, b) => {
        // 按热度值降序排序
        const hotA = parseInt(a.hot) || 0;
        const hotB = parseInt(b.hot) || 0;
        return hotB - hotA;
      });

    // 4. 合并结果：先推送高优先组，再推普通优先组
    return [...highPriority, ...normalPriority];
  };

  /**
   * 应用兴趣过滤器
   */
  const applyInterestFilters = (topics: DailyHotItem[]): DailyHotItem[] => {
    return topics.filter(topic => {
      const title = topic.title.toLowerCase();
      const desc = (topic.desc || '').toLowerCase();
      const platform = topic.platform || '';

      // 检查是否被屏蔽
      const isBlockedByKeyword = interestFilters.blockedKeywords.some(keyword => 
        title.includes(keyword.toLowerCase()) || desc.includes(keyword.toLowerCase())
      );
      
      const isBlockedByPlatform = interestFilters.blockedPlatforms.includes(platform);

      if (isBlockedByKeyword || isBlockedByPlatform) {
        return false;
      }

      return true;
    });
  };

  /**
   * 应用偏好排序
   */
  const applyPreferenceSorting = (topics: DailyHotItem[]): DailyHotItem[] => {
    return topics.sort((a, b) => {
      const titleA = a.title.toLowerCase();
      const descA = (a.desc || '').toLowerCase();
      const platformA = a.platform || '';
      
      const titleB = b.title.toLowerCase();
      const descB = (b.desc || '').toLowerCase();
      const platformB = b.platform || '';

      // 计算偏好分数
      let scoreA = 0;
      let scoreB = 0;

      // 偏好关键词加分
      interestFilters.preferredKeywords.forEach(keyword => {
        if (titleA.includes(keyword.toLowerCase()) || descA.includes(keyword.toLowerCase())) {
          scoreA += 10;
        }
        if (titleB.includes(keyword.toLowerCase()) || descB.includes(keyword.toLowerCase())) {
          scoreB += 10;
        }
      });

      // 偏好平台加分
      if (interestFilters.preferredPlatforms.includes(platformA)) {
        scoreA += 5;
      }
      if (interestFilters.preferredPlatforms.includes(platformB)) {
        scoreB += 5;
      }

      // 按偏好分数降序排序
      if (scoreA !== scoreB) {
        return scoreB - scoreA;
      }

      // 如果偏好分数相同，按热度值降序排序
      const hotA = parseInt(a.hot) || 0;
      const hotB = parseInt(b.hot) || 0;
      return hotB - hotA;
    });
  };

  /**
   * 处理话题点击
   */
  const handleTopicClick = (topic: DailyHotItem) => {
    // 保存话题数据到localStorage，供详情页使用
    const storedTopics = localStorage.getItem('hotTopicsData');
    if (storedTopics) {
      try {
        const allTopics = JSON.parse(storedTopics);
        if (!allTopics[topic.platform || '']) {
          allTopics[topic.platform || ''] = [];
        }
        allTopics[topic.platform || ''].push(topic);
        localStorage.setItem('hotTopicsData', JSON.stringify(allTopics));
      } catch (error) {
        console.error('保存话题数据失败:', error);
      }
    }
    
    navigate(`/hot-topics/detail/${encodeURIComponent(topic.platform || '')}/${encodeURIComponent(topic.title)}`);
  };

  /**
   * 处理分类变化
   */
  const handleCategoryChange = (category: string) => {
    setCurrentCategory(category);
  };

  /**
   * 处理兴趣过滤器变化
   */
  const handleInterestFilterChange = (filters: InterestFilters) => {
    setInterestFilters(filters);
    // 保存到localStorage
    localStorage.setItem('interestFilters', JSON.stringify(filters));
  };

  /**
   * 获取热点数据
   */
  const fetchHotData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await getDailyHotAll();
      setAllHotData(data);
      
      // 保存数据到localStorage
      localStorage.setItem('hotTopicsData', JSON.stringify(data.data));
      
      // 加载保存的兴趣过滤器
      const savedFilters = localStorage.getItem('interestFilters');
      if (savedFilters) {
        try {
          const filters = JSON.parse(savedFilters);
          setInterestFilters(filters);
        } catch (error) {
          console.error('加载兴趣过滤器失败:', error);
        }
      }
      
    } catch (err) {
      setError(err instanceof Error ? err.message : '获取数据失败');
    } finally {
      setLoading(false);
    }
  };

  /**
   * 处理刷新
   */
  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchHotData();
    setRefreshing(false);
  };

  /**
   * 处理搜索
   */
  const handleSearch = () => {
    // 实现搜索功能
    console.log('搜索:', searchQuery);
  };

  /**
   * 获取平台图标
   */
  const getPlatformIcon = (platform: string) => {
    const iconClass = getPlatformIconClass(platform);
    return <span className={`${iconClass} mr-2`}></span>;
  };

  /**
   * 获取当前平台数据
   */
  const getCurrentPlatformData = (): DailyHotItem[] => {
    if (!allHotData || !allHotData.data) {
      return [];
    }

    let allTopics: DailyHotItem[] = [];
    
    if (currentPlatform === 'all') {
      // 合并所有平台数据
      Object.values(allHotData.data).forEach(platformTopics => {
        allTopics = allTopics.concat(platformTopics);
      });
    } else {
      // 获取指定平台数据
      allTopics = allHotData.data[currentPlatform] || [];
    }

    // 应用智能过滤和排序
    return applySmartFiltering(allTopics);
  };

  /**
   * 获取统计数据
   */
  const getStats = () => {
    if (!allHotData || !allHotData.data) {
      return { total: 0, platforms: 0 };
    }

    const total = Object.values(allHotData.data).reduce((sum, topics) => sum + topics.length, 0);
    const platforms = Object.keys(allHotData.data).length;

    return { total, platforms };
  };

  /**
   * 加载订阅
   */
  const loadSubscriptions = () => {
    const subs = getTopicSubscriptions();
    setSubscriptions(subs);
    setSubscriptionStats(getSubscriptionStats());
  };

  /**
   * 处理添加订阅
   */
  const handleAddSubscription = () => {
    if (!newSubscription.keyword.trim()) {
      toast({
        title: "请输入关键词",
        description: "订阅关键词不能为空",
        variant: "destructive"
      });
      return;
    }

    try {
      addTopicSubscription({
        ...newSubscription,
        lastChecked: null,
        lastNotification: null
      });

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
        minHeatThreshold: 1000,
        maxHeatThreshold: 50000
      });

      setIsAddDialogOpen(false);
      loadSubscriptions();

      toast({
        title: "订阅添加成功",
        description: `已添加关键词"${newSubscription.keyword}"的订阅`,
      });
    } catch (error) {
      toast({
        title: "添加失败",
        description: "添加订阅时发生错误",
        variant: "destructive"
      });
    }
  };

  /**
   * 处理删除订阅
   */
  const handleDeleteSubscription = (id: string) => {
    try {
      deleteTopicSubscription(id);
      loadSubscriptions();
      toast({
        title: "删除成功",
        description: "订阅已删除",
      });
    } catch (error) {
      toast({
        title: "删除失败",
        description: "删除订阅时发生错误",
        variant: "destructive"
      });
    }
  };

  /**
   * 处理切换订阅状态
   */
  const handleToggleSubscription = (id: string, isActive: boolean) => {
    try {
      toggleSubscription(id, isActive);
      loadSubscriptions();
      toast({
        title: isActive ? "订阅已启用" : "订阅已禁用",
        description: isActive ? "订阅监控已开始" : "订阅监控已暂停",
      });
    } catch (error) {
      toast({
        title: "操作失败",
        description: "切换订阅状态时发生错误",
        variant: "destructive"
      });
    }
  };

  /**
   * 处理监控话题
   */
  const handleMonitorTopic = async (subscription: TopicSubscription) => {
    setIsMonitoring(true);
    try {
      const results = await monitorTopic(subscription);
      setMonitorResults(prev => ({
        ...prev,
        [subscription.id]: results
      }));
      
      if (results.length > 0) {
        toast({
          title: "监控完成",
          description: `发现 ${results.length} 个相关话题`,
        });
      } else {
        toast({
          title: "监控完成",
          description: "未发现相关话题",
        });
      }
    } catch (error) {
      toast({
        title: "监控失败",
        description: "监控话题时发生错误",
        variant: "destructive"
      });
    } finally {
      setIsMonitoring(false);
    }
  };

  /**
   * 处理检查所有订阅
   */
  const handleCheckAllSubscriptions = async () => {
    setIsMonitoring(true);
    try {
      const results = await checkAllSubscriptions();
      setMonitorResults(results);
      
      const totalResults = Object.values(results).flat().length;
      toast({
        title: "批量检查完成",
        description: `共发现 ${totalResults} 个相关话题`,
      });
    } catch (error) {
      toast({
        title: "批量检查失败",
        description: "检查订阅时发生错误",
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

  // 获取前三名话题用于领奖台展示
  const topThreeTopics = currentData.slice(0, 3);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 页面导航 */}
      <PageNavigation
        title="全网雷达"
        description="实时监控各平台热门话题，支持自定义话题订阅和智能追踪"
        showAdaptButton={false}
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
          </div>
        }
      />

      <div className="container mx-auto px-4 py-8">
        {/* 统计信息 - 移到顶部 */}
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

        {/* 主标签页 */}
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'hot' | 'subscriptions' | 'notifications')} className="w-full">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <TabsList className="grid w-full grid-cols-3 max-w-md">
              <TabsTrigger value="hot" className="flex items-center gap-2 text-xs sm:text-sm">
                <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">全网热点</span>
                <span className="sm:hidden">热点</span>
              </TabsTrigger>
              <TabsTrigger value="subscriptions" className="flex items-center gap-2 text-xs sm:text-sm">
                <Bell className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">话题订阅</span>
                <span className="sm:hidden">订阅</span>
              </TabsTrigger>
              <TabsTrigger value="notifications" className="flex items-center gap-2 text-xs sm:text-sm">
                <Bell className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">通知中心</span>
                <span className="sm:hidden">通知</span>
              </TabsTrigger>
            </TabsList>
            
            {/* 操作按钮 */}
            <div className="flex items-center gap-2 flex-wrap">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsAddDialogOpen(true)}
                className="text-xs sm:text-sm"
              >
                <Plus className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">添加订阅</span>
                <span className="sm:hidden">添加</span>
              </Button>
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
                      <RefreshCw className={`h-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                      重试
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* 前三热度领奖台 */}
            {!loading && topThreeTopics.length > 0 && (
              <div className="mb-6">
                <TopThreePodium
                  topThree={topThreeTopics}
                  onTopicClick={handleTopicClick}
                  onShare={(topic) => {
                    // 实现分享功能
                    console.log('分享话题:', topic.title);
                  }}
                  onBookmark={(topic) => {
                    // 实现收藏功能
                    console.log('收藏话题:', topic.title);
                  }}
                />
              </div>
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

            {/* 智能过滤说明 */}
            <Card className="mb-6 border-blue-200 bg-blue-50">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <Star className="w-4 h-4 text-blue-600" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-medium text-blue-800 mb-1">智能过滤系统</h3>
                    <p className="text-sm text-blue-700">
                      系统会根据您的屏蔽词和偏好关键词自动过滤和排序话题。
                      <span className="font-medium">[⭐]</span> 标记表示高优先级话题。
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 兴趣调节 */}
            <InterestFilter onFilterChange={handleInterestFilterChange} />

            {/* 话题分类 */}
            {currentPlatform === 'all' && !loading && currentData.length > 0 && (
              <TopicCategories
                topics={currentData}
                onCategoryChange={handleCategoryChange}
                onTopicClick={handleTopicClick}
              />
            )}

            {/* 话题列表 */}
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-2 text-gray-600">加载中...</span>
              </div>
            ) : (
              <div className="grid gap-4">
                {currentData.map((item, index) => {
                  // 检查是否为高优先级话题
                  const isHighPriority = item.preferenceScore > 0;
                  
                  return (
                    <Card 
                      key={index} 
                      className={`hover:shadow-md transition-shadow cursor-pointer ${
                        isHighPriority ? 'border-blue-300 bg-blue-50' : ''
                      }`}
                      onClick={() => handleTopicClick(item)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              {isHighPriority && (
                                <Badge className="bg-blue-500 text-white text-xs">
                                  <Star className="w-3 h-3 mr-1" />
                                  高优先级
                                </Badge>
                              )}
                              <span className="text-sm font-medium text-gray-500">#{index + 1}</span>
                              <Badge variant="outline" className="text-xs">
                                {getPlatformDisplayName(item.platform || '')}
                              </Badge>
                              {item.hot && (
                                <Badge variant="destructive" className="text-xs">
                                  <Flame className="w-3 h-3 mr-1" />
                                  热
                                </Badge>
                              )}
                            </div>
                            <h3 className={`font-medium text-gray-900 mb-2 ${
                              isHighPriority ? 'flex items-center gap-2' : ''
                            }`}>
                              {isHighPriority && <span className="text-blue-600">[⭐]</span>}
                              {item.title}
                            </h3>
                            {item.desc && (
                              <p className="text-sm text-gray-600 mb-3">{item.desc}</p>
                            )}
                            {item.content && (
                              <p className="text-sm text-gray-500 mb-3 line-clamp-2">{item.content}</p>
                            )}
                            <div className="flex items-center gap-4 text-xs text-gray-500">
                              <span>热度: {item.hot}</span>
                              <span>平台: {getPlatformDisplayName(item.platform || '')}</span>
                              {item.rank && <span>排名: #{item.rank}</span>}
                              {isHighPriority && item.matchedKeywords && item.matchedKeywords.length > 0 && (
                                <span className="text-blue-600">
                                  匹配: {item.matchedKeywords.join(', ')}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-1 ml-4">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-8 w-8 p-0"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleTopicClick(item);
                              }}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-8 w-8 p-0"
                              onClick={(e) => {
                                e.stopPropagation();
                                if (item.url) {
                                  window.open(item.url, '_blank');
                                }
                              }}
                            >
                              <ExternalLink className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
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
                            disabled={isMonitoring}
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            {isMonitoring ? '检查中...' : '检查'}
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
                            {subscription.isActive ? "活跃" : "暂停"}
                          </Badge>
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
                        <div>
                          <span className="text-gray-500">检查间隔:</span>
                          <span className="ml-2">{subscription.checkInterval}分钟</span>
                        </div>
                        <div>
                          <span className="text-gray-500">热度阈值:</span>
                          <span className="ml-2">{subscription.minHeatThreshold}-{subscription.maxHeatThreshold}</span>
                        </div>
                      </div>

                      {/* 监控结果 */}
                      {monitorResults[subscription.id] && monitorResults[subscription.id].length > 0 && (
                        <div className="mt-4">
                          <h4 className="text-sm font-medium text-gray-700 mb-2">监控结果</h4>
                          <div className="space-y-2">
                            {monitorResults[subscription.id].slice(0, 3).map((result, index) => (
                              <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                                <span className="text-sm">{result.title}</span>
                                <Badge variant="outline" className="text-xs">
                                  {result.platform}
                                </Badge>
                              </div>
                            ))}
                            {monitorResults[subscription.id].length > 3 && (
                              <p className="text-xs text-gray-500">
                                还有 {monitorResults[subscription.id].length - 3} 个结果...
                              </p>
                            )}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* 通知中心标签页 */}
          <TabsContent value="notifications">
            <NotificationCenter />
          </TabsContent>
        </Tabs>

        {/* 添加订阅对话框 */}
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>添加话题订阅</DialogTitle>
              <DialogDescription>
                设置关键词和监控条件，系统将自动追踪相关话题
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="keyword">关键词 *</Label>
                <Input
                  id="keyword"
                  placeholder="输入要监控的关键词"
                  value={newSubscription.keyword}
                  onChange={(e) => setNewSubscription(prev => ({ ...prev, keyword: e.target.value }))}
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="name">订阅名称</Label>
                <Input
                  id="name"
                  placeholder="为订阅起个名字"
                  value={newSubscription.name}
                  onChange={(e) => setNewSubscription(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="description">描述</Label>
                <Input
                  id="description"
                  placeholder="订阅的详细描述"
                  value={newSubscription.description}
                  onChange={(e) => setNewSubscription(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>
              
              <div className="grid gap-2">
                <Label>监控平台</Label>
                <div className="flex flex-wrap gap-2">
                  {supportedPlatforms.map((platform) => (
                    <Button
                      key={platform}
                      variant={newSubscription.platforms.includes(platform) ? "default" : "outline"}
                      size="sm"
                      onClick={() => {
                        const platforms = newSubscription.platforms.includes(platform)
                          ? newSubscription.platforms.filter(p => p !== platform)
                          : [...newSubscription.platforms, platform];
                        setNewSubscription(prev => ({ ...prev, platforms }));
                      }}
                    >
                      {getPlatformIcon(platform)}
                      {getPlatformDisplayName(platform)}
                    </Button>
                  ))}
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="checkInterval">检查间隔 (分钟)</Label>
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
                
                <div className="grid gap-2">
                  <Label htmlFor="minHeatThreshold">最低热度</Label>
                  <Input
                    id="minHeatThreshold"
                    type="number"
                    value={newSubscription.minHeatThreshold}
                    onChange={(e) => setNewSubscription(prev => ({ ...prev, minHeatThreshold: parseInt(e.target.value) || 0 }))}
                  />
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="isActive"
                  checked={newSubscription.isActive}
                  onCheckedChange={(checked) => setNewSubscription(prev => ({ ...prev, isActive: checked }))}
                />
                <Label htmlFor="isActive">立即启用</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="notificationEnabled"
                  checked={newSubscription.notificationEnabled}
                  onCheckedChange={(checked) => setNewSubscription(prev => ({ ...prev, notificationEnabled: checked }))}
                />
                <Label htmlFor="notificationEnabled">启用通知</Label>
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
      </div>
    </div>
  );
} 