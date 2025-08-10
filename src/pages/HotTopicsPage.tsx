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
  aggregateAndSortTopics,
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
  const [lastUpdateTime, setLastUpdateTime] = useState<Date>(new Date());
  const [readTopics, setReadTopics] = useState<Set<string>>(new Set());
  const [bookmarkedTopics, setBookmarkedTopics] = useState<Set<string>>(new Set());
  
  // 话题订阅状态
  const [activeTab, setActiveTab] = useState<'hot' | 'subscriptions' | 'bookmarks'>('hot');
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
  
  // 支持的平台列表（只显示有数据的平台）
  const supportedPlatforms = getSupportedPlatforms().filter(platform => {
    return allHotData?.data?.[platform]?.length > 0;
  });

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
   * 格式化热度值，统一单位为m
   */
  const formatHotValue = (hot: string | undefined): string => {
    if (!hot || hot === '' || hot === '0' || hot === 'undefined') {
      return '暂无数据';
    }

    const num = parseInt(hot);
    if (isNaN(num)) {
      return hot || '暂无数据';
    }

    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}m`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}k`;
    }
    return hot;
  };

  /**
   * 根据关键词判断话题分类
   */
  const getTopicCategory = (topic: DailyHotItem): string => {
    const title = topic.title.toLowerCase();
    const desc = (topic.desc || '').toLowerCase();

    // 娱乐类关键词
    const entertainmentKeywords = ['明星', '演员', '歌手', '电影', '电视剧', '综艺', '娱乐', '艺人', '导演', '编剧'];
    if (entertainmentKeywords.some(keyword => title.includes(keyword) || desc.includes(keyword))) {
      return 'entertainment';
    }

    // 科技类关键词
    const technologyKeywords = ['科技', '技术', '互联网', 'AI', '人工智能', '手机', '电脑', '软件', '编程', '算法', '芯片'];
    if (technologyKeywords.some(keyword => title.includes(keyword) || desc.includes(keyword))) {
      return 'technology';
    }

    // 体育类关键词
    const sportsKeywords = ['足球', '篮球', '体育', '比赛', '运动员', '教练', '球队', '联赛', '冠军', '奥运会'];
    if (sportsKeywords.some(keyword => title.includes(keyword) || desc.includes(keyword))) {
      return 'sports';
    }

    // 政治类关键词
    const politicsKeywords = ['政府', '政策', '政治', '官员', '选举', '法律', '法规', '国家', '领导人', '会议'];
    if (politicsKeywords.some(keyword => title.includes(keyword) || desc.includes(keyword))) {
      return 'politics';
    }

    // 财经类关键词
    const economyKeywords = ['经济', '金融', '股票', '基金', '投资', '理财', '银行', '保险', '房地产', '股市'];
    if (economyKeywords.some(keyword => title.includes(keyword) || desc.includes(keyword))) {
      return 'economy';
    }

    // 社会类关键词
    const societyKeywords = ['社会', '事件', '新闻', '调查', '报道', '事故', '案件', '纠纷'];
    if (societyKeywords.some(keyword => title.includes(keyword) || desc.includes(keyword))) {
      return 'society';
    }

    // 教育类关键词
    const educationKeywords = ['教育', '学校', '学生', '老师', '考试', '学习', '培训', '课程', '大学', '高考'];
    if (educationKeywords.some(keyword => title.includes(keyword) || desc.includes(keyword))) {
      return 'education';
    }

    // 健康类关键词
    const healthKeywords = ['健康', '医疗', '医院', '医生', '疾病', '治疗', '药物', '疫苗', '疫情', '保健'];
    if (healthKeywords.some(keyword => title.includes(keyword) || desc.includes(keyword))) {
      return 'health';
    }

    // 生活类关键词
    const lifestyleKeywords = ['生活', '美食', '旅游', '购物', '时尚', '美容', '家居', '装修', '宠物', '园艺'];
    if (lifestyleKeywords.some(keyword => title.includes(keyword) || desc.includes(keyword))) {
      return 'lifestyle';
    }

    return 'other';
  };

  /**
   * 智能过滤和排序话题
   * 根据屏蔽词、偏好关键词和分类偏好进行动态过滤与优先推送
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

    // 2. 偏好关键词、分类偏好标记和排序
    const topicsWithPriority = filteredByBlocked.map(topic => {
      const title = topic.title.toLowerCase();
      const desc = (topic.desc || '').toLowerCase();
      const content = (topic.content || '').toLowerCase();
      const platform = topic.platform || '';
      const category = getTopicCategory(topic);

      // 计算偏好分数
      let preferenceScore = 0;
      const matchedKeywords: string[] = [];

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

      // 分类偏好加分/减分
      const categoryPreference = interestFilters.categoryPreferences?.[category] || 0;
      preferenceScore += categoryPreference / 10; // 将-100到100的范围转换为-10到10

      return {
        ...topic,
        preferenceScore,
        matchedKeywords,
        category,
        categoryPreference,
        isHighPriority: preferenceScore > 0
      };
    });

    // 3. 按综合偏好分数排序
    const sortedTopics = topicsWithPriority.sort((a, b) => {
      // 首先按偏好分数降序排序
      if (Math.abs(b.preferenceScore - a.preferenceScore) > 0.1) {
        return b.preferenceScore - a.preferenceScore;
      }

      // 如果偏好分数相近，按热度值降序排序
      const hotA = parseInt(a.hot) || 0;
      const hotB = parseInt(b.hot) || 0;
      return hotB - hotA;
    });

    // 4. 过滤掉用户明确不想看的内容（分类偏好 < -50）
    const finalTopics = sortedTopics.filter(topic => {
      const categoryPreference = topic.categoryPreference || 0;
      return categoryPreference > -50; // 只过滤掉非常不想看的内容
    });

    return finalTopics;
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
   * 处理话题点击 - 现在只标记为已读，不跳转
   */
  const handleTopicClick = (topic: DailyHotItem) => {
    // 标记为已读
    const topicId = `${topic.platform}-${topic.title}`;
    markAsRead(topicId);
  };

  /**
   * 处理查看源网页
   */
  const handleViewSource = (topic: DailyHotItem) => {
    if (topic.url) {
      window.open(topic.url, '_blank');
    } else if (topic.mobil_url) {
      window.open(topic.mobil_url, '_blank');
    } else {
      toast({
        title: "无法打开链接",
        description: "该话题暂无源链接",
        variant: "destructive"
      });
    }
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
      setLastUpdateTime(new Date());
      
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
      // 获取所有平台的前10个话题
      Object.values(allHotData.data).forEach(platformTopics => {
        allTopics = allTopics.concat(platformTopics.slice(0, 10));
      });
    } else {
      // 获取指定平台的前10个话题
      allTopics = (allHotData.data[currentPlatform] || []).slice(0, 10);
    }

    // 应用智能过滤和排序
    return applySmartFiltering(allTopics);
  };

  /**
   * 获取所有话题数据（用于分类统计）
   */
  const getAllTopicsData = (): DailyHotItem[] => {
    if (!allHotData || !allHotData.data) {
      return [];
    }

    let allTopics: DailyHotItem[] = [];

    // 获取所有平台的所有话题
    Object.values(allHotData.data).forEach(platformTopics => {
      allTopics = allTopics.concat(platformTopics);
    });

    return allTopics;
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
   * 标记话题为已读
   */
  const markAsRead = (topicId: string) => {
    setReadTopics(prev => new Set([...prev, topicId]));
  };

  /**
   * 切换话题收藏状态
   */
  const toggleBookmark = (topic: DailyHotItem) => {
    const topicId = `${topic.platform}-${topic.title}`;
    setBookmarkedTopics(prev => {
      const newSet = new Set(prev);
      if (newSet.has(topicId)) {
        newSet.delete(topicId);
        toast({
          title: "已取消收藏",
          description: "话题已从灵感夹移除",
        });
      } else {
        newSet.add(topicId);
        toast({
          title: "已收藏",
          description: "话题已添加到灵感夹",
        });
      }
      return newSet;
    });
  };

  /**
   * 检查话题是否已读
   */
  const isTopicRead = (topic: DailyHotItem): boolean => {
    const topicId = `${topic.platform}-${topic.title}`;
    return readTopics.has(topicId);
  };

  /**
   * 检查话题是否已收藏
   */
  const isTopicBookmarked = (topic: DailyHotItem): boolean => {
    const topicId = `${topic.platform}-${topic.title}`;
    return bookmarkedTopics.has(topicId);
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
    <div className="min-h-screen bg-background">
      {/* 页面导航 */}
      <PageNavigation
        title="全网雷达"
        description="实时监控各平台热门话题，支持自定义话题订阅和智能追踪"
        showAdaptButton={false}
        // 移除actions中的刷新按钮
      />

      <div className="container mx-auto px-4 py-8">
        {/* 主标签页 */}
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'hot' | 'subscriptions' | 'bookmarks')} className="w-full">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <TabsList className="unified-tabs-list grid w-full grid-cols-3 max-w-md">
              <TabsTrigger value="hot" className="unified-tab-trigger">
                <TrendingUp className="tab-icon" />
                <span className="tab-text-mobile">热点</span>
                <span className="tab-text-desktop">全网热点</span>
              </TabsTrigger>
              <TabsTrigger value="subscriptions" className="unified-tab-trigger">
                <Bell className="tab-icon" />
                <span className="tab-text-mobile">订阅</span>
                <span className="tab-text-desktop">话题订阅</span>
              </TabsTrigger>
              <TabsTrigger value="bookmarks" className="unified-tab-trigger">
                <Bookmark className="tab-icon" />
                <span className="tab-text-mobile">收藏</span>
                <span className="tab-text-desktop">灵感夹</span>
              </TabsTrigger>
            </TabsList>
            {/* 操作按钮区，添加订阅和刷新并列 */}
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
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={refreshing}
                className="text-xs sm:text-sm"
              >
                <RefreshCw className={`w-4 h-4 mr-1 ${refreshing ? 'animate-spin' : ''}`} />
                刷新
              </Button>
            </div>
          </div>

          {/* 全网热点标签页 */}
          <TabsContent value="hot">
            {/* 加载状态显示 */}
            {loading && !error && (
              <Card className="mb-6">
                <CardContent className="p-12">
                  <div className="flex flex-col items-center justify-center text-center">
                    <div className="flex items-center gap-3 mb-4">
                      <Loader2 className="w-6 h-6 text-primary animate-spin" />
                      <div>
                        <h3 className="text-lg font-medium text-foreground">全网热点搜索中...</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          正在从各大平台获取最新热点话题，请稍候
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Globe className="w-4 h-4" />
                      <span>微博</span>
                      <span>•</span>
                      <span>知乎</span>
                      <span>•</span>
                      <span>B站</span>
                      <span>•</span>
                      <span>抖音</span>
                      <span>•</span>
                      <span>百度</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* 错误状态显示 */}
            {error && (
              <Card className="mb-6 border-border bg-accent">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center border border-border">
                        <TrendingDown className="w-4 h-4 text-destructive" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-sm font-medium text-destructive">获取热点数据失败</h3>
                      <p className="text-sm text-destructive mt-1">{error}</p>
                      <p className="text-xs text-muted-foreground mt-2">
                        可能原因：网络连接异常、API服务暂时不可用、或防火墙限制
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleRefresh}
                      disabled={refreshing}
                      className="border-border text-foreground hover:bg-accent"
                    >
                      <RefreshCw className={`h-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                      重试
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* 今日最热门话题 */}
            {!loading && allHotData && allHotData.data && (
              <div className="mb-6">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <Flame className="w-5 h-5 text-foreground" />
                          今日最热门话题
                        </CardTitle>
                        <CardDescription>
                          各平台热门话题排行榜 · 总计 {stats.total} 条热点，来自 {stats.platforms} 个平台 · 总榜展示 {aggregateAndSortTopics(allHotData.data).length} 条
                        </CardDescription>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        最后更新: {lastUpdateTime.toLocaleString('zh-CN')}（每15分钟自动更新）
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Tabs defaultValue="all" className="w-full">
                      {/* Tab栏横向滚动优化 */}
                      <TabsList className="flex w-full overflow-x-auto scrollbar-thin scrollbar-thumb-hsl(var(--muted-foreground))-200 scrollbar-track-transparent">
                        <TabsTrigger value="all" className="min-w-[72px]">总榜</TabsTrigger>
                        {supportedPlatforms.map((platform) => (
                          <TabsTrigger key={platform} value={platform} className="min-w-[72px]">
                            {getPlatformDisplayName(platform)}
                          </TabsTrigger>
                        ))}
                      </TabsList>
                      
                      <TabsContent value="all" className="mt-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                          {aggregateAndSortTopics(allHotData.data).slice(0, 10).map((topic, index) => (
                            <div
                              key={index}
                              className={`p-2 rounded-lg border transition-all hover:shadow-md h-36 flex flex-col ${
                                isTopicRead(topic) ? 'bg-accent opacity-75' : 'bg-card'
                              } ${isTopicBookmarked(topic) ? 'border-border bg-accent' : 'border-border'}`}
                            >
                              <div className="flex items-center gap-1 mb-1">
                                <Badge variant="destructive" className="text-xs px-1 py-0 h-4">
                                  #{index + 1}
                                </Badge>
                                <Badge variant="outline" className="text-xs px-1 py-0 h-4">
                                  {getPlatformDisplayName(topic.platform || '')}
                                </Badge>
                              </div>
                              <h4 className="text-sm font-medium text-foreground line-clamp-2 mb-1 flex-1">
                                {topic.title}
                              </h4>
                              <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                                <span>{formatHotValue(topic.hot)}</span>
                                <div className="flex items-center gap-1">
                                  {isTopicBookmarked(topic) && (
                                    <Bookmark className="w-3 h-3 text-foreground" />
                                  )}
                                  {isTopicRead(topic) && (
                                    <Eye className="w-3 h-3 text-muted-foreground" />
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center gap-1 mt-auto">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="flex-1 text-xs h-6 px-2"
                                  onClick={() => handleViewSource(topic)}
                                >
                                  <Eye className="w-3 h-3 mr-1" />
                                  查看
                                </Button>
                                <Button
                                  size="sm"
                                  variant={isTopicBookmarked(topic) ? "default" : "outline"}
                                  className={`text-xs h-6 px-2 ${isTopicBookmarked(topic) ? 'bg-primary hover:bg-primary/90 text-primary-foreground' : ''}`}
                                  onClick={() => toggleBookmark(topic)}
                                >
                                  <Bookmark className="w-3 h-3" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </TabsContent>
                      {supportedPlatforms.map((platform) => (
                        <TabsContent key={platform} value={platform} className="mt-4">
                          {(allHotData.data[platform] || []).length === 0 ? (
                            <div className="text-center text-muted-foreground py-8">暂无数据</div>
                          ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                              {(allHotData.data[platform] || []).slice(0, 10).map((topic, index) => (
                                <div
                                  key={index}
                                  className={`p-2 rounded-lg border transition-all hover:shadow-md h-36 flex flex-col ${
                                    isTopicRead(topic) ? 'bg-accent opacity-75' : 'bg-card'
                                  } ${isTopicBookmarked(topic) ? 'border-border bg-accent' : 'border-border'}`}
                                >
                                  <div className="flex items-center gap-1 mb-1">
                                    <Badge variant="destructive" className="text-xs px-1 py-0 h-4">
                                      #{index + 1}
                                    </Badge>
                                    <Badge variant="outline" className="text-xs px-1 py-0 h-4">
                                      {getPlatformDisplayName(platform)}
                                    </Badge>
                                  </div>
                                  <h4 className="text-sm font-medium text-foreground line-clamp-2 mb-1 flex-1">
                                    {topic.title}
                                  </h4>
                                  <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                                    <span>{formatHotValue(topic.hot)}</span>
                                    <div className="flex items-center gap-1">
                                      {isTopicBookmarked(topic) && (
                                        <Bookmark className="w-3 h-3 text-foreground" />
                                      )}
                                      {isTopicRead(topic) && (
                                        <Eye className="w-3 h-3 text-muted-foreground" />
                                      )}
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-1 mt-auto">
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="flex-1 text-xs h-6 px-2"
                                      onClick={() => handleViewSource(topic)}
                                    >
                                      <Eye className="w-3 h-3 mr-1" />
                                      查看
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant={isTopicBookmarked(topic) ? "default" : "outline"}
                                      className={`text-xs h-6 px-2 ${isTopicBookmarked(topic) ? 'bg-primary hover:bg-primary/90' : ''}`}
                                      onClick={() => toggleBookmark(topic)}
                                    >
                                      <Bookmark className="w-3 h-3" />
                                    </Button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </TabsContent>
                      ))}
                    </Tabs>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* 兴趣调节 */}
            <InterestFilter onFilterChange={handleInterestFilterChange} />

            {/* 话题分类 */}
            {currentPlatform === 'all' && !loading && getAllTopicsData().length > 0 && (
              <TopicCategories
                topics={getAllTopicsData()}
                onCategoryChange={handleCategoryChange}
                onTopicClick={handleTopicClick}
              />
            )}


          </TabsContent>

          {/* 话题订阅标签页 */}
          <TabsContent value="subscriptions">
            {/* 订阅统计 */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
              <Card>
                <CardContent className="p-3">
                  <div className="text-center">
                    <p className="text-xl font-bold text-foreground">{subscriptionStats.total}</p>
                    <p className="text-xs text-muted-foreground">总订阅数</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-3">
                  <div className="text-center">
                    <p className="text-xl font-bold text-foreground">{subscriptionStats.active}</p>
                    <p className="text-xs text-muted-foreground">活跃订阅</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-3">
                  <div className="text-center">
                    <p className="text-xl font-bold text-foreground">{subscriptionStats.notificationEnabled}</p>
                    <p className="text-xs text-muted-foreground">通知开启</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-3">
                  <div className="text-center">
                    <p className="text-xl font-bold text-foreground">
                      {Object.values(monitorResults).flat().length}
                    </p>
                    <p className="text-xs text-muted-foreground">监控结果</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* 订阅列表 */}
            {subscriptions.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <BellOff className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-medium text-foreground mb-2">暂无话题订阅</h3>
                  <p className="text-muted-foreground mb-4">
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
                          <div className="w-10 h-10 bg-accent rounded-full flex items-center justify-center border border-border">
                            <Target className="w-5 h-5 text-foreground" />
                          </div>
                          <div>
                            <h3 className="font-medium text-foreground">{subscription.name}</h3>
                            <p className="text-sm text-muted-foreground">关键词: {subscription.keyword}</p>
                            {subscription.description && (
                              <p className="text-sm text-muted-foreground mt-1">{subscription.description}</p>
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
                            className="text-destructive hover:opacity-90"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">状态:</span>
                          <Badge
                            variant={subscription.isActive ? "default" : "secondary"}
                            className="ml-2"
                          >
                            {subscription.isActive ? "活跃" : "暂停"}
                          </Badge>
                        </div>
                        <div>
                          <span className="text-muted-foreground">通知:</span>
                          <Badge
                            variant={subscription.notificationEnabled ? "default" : "secondary"}
                            className="ml-2"
                          >
                            {subscription.notificationEnabled ? "开启" : "关闭"}
                          </Badge>
                        </div>
                        <div>
                          <span className="text-muted-foreground">检查间隔:</span>
                          <span className="ml-2">{subscription.checkInterval}分钟</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">热度阈值:</span>
                          <span className="ml-2">{subscription.minHeatThreshold}-{subscription.maxHeatThreshold}</span>
                        </div>
                      </div>
                      
                      {/* 监控结果 */}
                      {monitorResults[subscription.id] && monitorResults[subscription.id].length > 0 && (
                        <div className="mt-4">
                          <h4 className="text-sm font-medium text-foreground mb-2">监控结果</h4>
                          <div className="space-y-2">
                            {monitorResults[subscription.id].slice(0, 3).map((result, index) => (
                              <div key={index} className="flex items-center justify-between p-2 bg-accent rounded border border-border">
                                <span className="text-sm text-foreground">{result.title}</span>
                                <Badge variant="outline" className="text-xs">
                                  {result.platform}
                                </Badge>
                              </div>
                            ))}
                            {monitorResults[subscription.id].length > 3 && (
                              <p className="text-xs text-muted-foreground">
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

          {/* 灵感夹标签页 */}
          <TabsContent value="bookmarks">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bookmark className="w-5 h-5 text-foreground" />
                  灵感夹
                </CardTitle>
                <CardDescription>
                  您收藏的感兴趣话题
                </CardDescription>
              </CardHeader>
              <CardContent>
                {bookmarkedTopics.size === 0 ? (
                  <div className="text-center py-12">
                    <Bookmark className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-lg font-medium text-foreground mb-2">暂无收藏话题</h3>
                    <p className="text-muted-foreground">
                      点击话题右侧的书签图标来收藏感兴趣的内容
                    </p>
              </div>
                ) : (
                  <div className="space-y-3">
                    {Array.from(bookmarkedTopics).map((topicId, index) => {
                      // 从所有数据中查找收藏的话题
                      let topic: DailyHotItem | null = null;
                      if (allHotData && allHotData.data) {
                        for (const [platform, topics] of Object.entries(allHotData.data)) {
                          const found = topics.find(t => `${t.platform}-${t.title}` === topicId);
                          if (found) {
                            topic = found;
                            break;
                          }
                        }
                      }
                      
                      if (!topic) return null;
                      
                      return (
                        <div
                          key={topicId}
                          className="p-4 rounded-lg border border-border bg-accent cursor-pointer transition-all hover:shadow-md"
                          onClick={() => handleTopicClick(topic!)}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <Badge className="bg-primary text-primary-foreground text-xs">
                                  <Bookmark className="w-3 h-3 mr-1" />
                                  已收藏
                                </Badge>
                                <Badge variant="outline" className="text-xs">
                                  {getPlatformDisplayName(topic.platform || '')}
                                </Badge>
                                {topic.hot && (
                                  <Badge variant="destructive" className="text-xs">
                                    <Flame className="w-3 h-3 mr-1" />
                                    热
                                  </Badge>
                                )}
                              </div>
                              <h3 className="font-medium text-foreground mb-2">
                                {topic.title}
                              </h3>
                              {topic.desc && (
                                <p className="text-sm text-muted-foreground mb-2">{topic.desc}</p>
                              )}
                              {topic.content && (
                                <p className="text-sm text-muted-foreground mb-2 line-clamp-2">{topic.content}</p>
                              )}
                              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                <span>热度: {formatHotValue(topic.hot)}</span>
                                <span>平台: {getPlatformDisplayName(topic.platform || '')}</span>
                                {topic.rank && <span>排名: #{topic.rank}</span>}
                              </div>
                            </div>
                            <div className="flex items-center gap-1 ml-4">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  // 跳转到AI内容适配器并预填充内容
                                  navigate('/new-adapt', {
                                    state: {
                                      prefilledContent: `热门话题：${topic!.title || '未知话题'}\n\n平台：${getPlatformDisplayName(topic!.platform || '')}\n热度：${formatHotValue(topic!.hot || '0')}\n\n话题描述：${topic!.desc || '暂无描述'}`,
                                      source: 'radar',
                                      sourceTitle: topic!.title || '未知话题'
                                    }
                                  });
                                }}
                                title="快速创作"
                              >
                                <Zap className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleBookmark(topic!);
                                }}
                              >
                                <Bookmark className="w-4 h-4 text-foreground fill-current" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleViewSource(topic!);
                                }}
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
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