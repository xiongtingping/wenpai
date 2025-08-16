/**
 * 全网雷达页面 - LOCKED/PROTECTED
 * 显示各平台热门话题和趋势，支持自定义话题订阅和实时监控
 * 数据源：DailyHotApi - https://github.com/imsyy/DailyHotApi
 *
 * ⚠️ CRITICAL SYSTEM COMPONENT - DO NOT MODIFY ⚠️
 * 此组件已被标记为受保护状态，禁止修改核心功能
 * 如需修改请创建副本或联系系统管理员
 * LOCKED DATE: 2025-01-10
 * PROTECTION LEVEL: HIGH
 */

import React, { useState, useEffect, useCallback } from 'react';
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
  Info,
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
import NotificationBadge from '@/components/hot-topics/NotificationBadge';
import TopThreePodium from '@/components/hot-topics/TopThreePodium';
import SubscriptionMasonry from '@/components/hot-topics/SubscriptionMasonry';
import { analyzeKeyword, debounceAnalyzeKeyword } from '@/services/keywordAnalysisService';
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
  getTrendAnalysis,
  getAvailableSearchSources,
  checkAllSubscriptions,
  toggleSubscription,
  getSubscriptionStats,
  markSubscriptionAsViewed,
  type TopicSubscription,
  type TopicMonitorResult,
  type TopicHeatTrend,
  type SearchSource
} from '@/api/topicSubscriptionService';

// ============================================================================
// 趋势分析类型定义 - PROTECTED SECTION
// ============================================================================
interface TrendAnalysis {
  trendDirection: 'rising' | 'falling' | 'stable';
  volatility: 'high' | 'medium' | 'low';
  peakHeat: number;
  peakDate: string;
  prediction: {
    nextDayHeat: number;
    confidence: number;
  };
  insights: string[];
}

/**
 * 全网雷达页面组件 - PROTECTED COMPONENT
 * ⚠️ 此组件已被锁定保护，禁止修改核心逻辑
 * @returns React 组件
 */
export default function HotTopicsPage() {
  // ========================================================================
  // PROTECTED HOOKS AND STATE - DO NOT MODIFY
  // ========================================================================

  // 话题订阅自动监控定时器
  const [monitoringTimer, setMonitoringTimer] = useState<NodeJS.Timeout | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  // 状态管理 - LOCKED
  const [allHotData, setAllHotData] = useState<DailyHotResponse | null>(null);
  const [currentPlatform, setCurrentPlatform] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [lastUpdateTime, setLastUpdateTime] = useState<Date>(new Date());
  const [readTopics, setReadTopics] = useState<Set<string>>(new Set());

  // 收藏状态持久化 - PROTECTED LOGIC
  const loadBookmarkedTopics = (): Set<string> => {
    try {
      const stored = localStorage.getItem('bookmarked-topics');
      return stored ? new Set(JSON.parse(stored)) : new Set();
    } catch (error) {
      console.error('加载收藏话题失败:', error);
      return new Set();
    }
  };

  const saveBookmarkedTopics = (topics: Set<string>): void => {
    try {
      localStorage.setItem('bookmarked-topics', JSON.stringify(Array.from(topics)));
    } catch (error) {
      console.error('保存收藏话题失败:', error);
    }
  };

  const [bookmarkedTopics, setBookmarkedTopics] = useState<Set<string>>(loadBookmarkedTopics());

  // 话题订阅状态 - LOCKED
  const [activeTab, setActiveTab] = useState<'hot' | 'subscriptions' | 'bookmarks'>('hot');
  const [subscriptions, setSubscriptions] = useState<TopicSubscription[]>([]);
  const [monitorResults, setMonitorResults] = useState<Record<string, TopicMonitorResult[]>>({});
  const [selectedSubscription, setSelectedSubscription] = useState<TopicSubscription | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingSubscription, setEditingSubscription] = useState<TopicSubscription | null>(null);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [subscriptionStats, setSubscriptionStats] = useState(getSubscriptionStats());

  // 热度趋势状态 - PROTECTED
  const [heatTrends, setHeatTrends] = useState<Record<string, TopicHeatTrend[]>>({});
  const [loadingTrends, setLoadingTrends] = useState<Record<string, boolean>>({});
  const [trendAnalysis, setTrendAnalysis] = useState<Record<string, TrendAnalysis>>({});

  // 新增订阅表单 - LOCKED
  const [newSubscription, setNewSubscription] = useState({
    keyword: '',
    description: '',
    timeRange: '24h',
    minHeatThreshold: 1000,
    isActive: true,
    notificationEnabled: true,
    checkInterval: 30,
    maxHeatThreshold: 50000
  });

  // 关键词分析状态
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [descriptionEdited, setDescriptionEdited] = useState(false);
  const [keywordAnalysis, setKeywordAnalysis] = useState<any>(null);

  // 创建防抖的关键词分析函数
  const debouncedAnalyze = useCallback(
    debounceAnalyzeKeyword(async (analysis) => {
      setKeywordAnalysis(analysis);
      if (!descriptionEdited) {
        setNewSubscription(prev => ({
          ...prev,
          description: analysis.description,
          timeRange: analysis.suggestedTimeRange,
          minHeatThreshold: analysis.suggestedHeatThreshold
        }));
      }
      setIsAnalyzing(false);
    }, 1000),
    [descriptionEdited]
  );

  // 搜索源配置 - PROTECTED
  const [searchSources] = useState<SearchSource[]>(getAvailableSearchSources());

  // 支持的平台列表（只显示有数据的平台） - LOCKED LOGIC
  const supportedPlatforms = getSupportedPlatforms().filter(platform => {
    const list = (allHotData?.data?.[platform] as any[] | undefined);
    return Array.isArray(list) && list.length > 0;
  });

  // 所有支持的平台列表（用于订阅选择） - PROTECTED
  const allSupportedPlatforms = getSupportedPlatforms();

  // 兴趣过滤器状态 - LOCKED
  const [interestFilters, setInterestFilters] = useState<InterestFilters>({
    blockedKeywords: [],
    blockedPlatforms: [],
    preferredKeywords: [],
    preferredPlatforms: [],
    showBlocked: false,
    categoryPreferences: {}
  });

  // 分类状态 - PROTECTED
  const [currentCategory, setCurrentCategory] = useState('all');
  const [filteredTopics, setFilteredTopics] = useState<DailyHotItem[]>([]);

  // ========================================================================
  // PROTECTED UTILITY FUNCTIONS - DO NOT MODIFY
  // ========================================================================

  /**
   * 格式化热度值，统一单位为m - LOCKED FUNCTION
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
   * 处理话题点击 - 标记为已读并跳转
   */
  const handleTopicClick = (topic: DailyHotItem) => {
    // 标记为已读
    const topicId = `${topic.platform}-${topic.title}`;
    markAsRead(topicId);

    // 跳转到原文
    if (topic.url) {
      window.open(topic.url, '_blank');
    } else if (topic.mobil_url) {
      window.open(topic.mobil_url, '_blank');
    }
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

  // ========================================================================
  // CORE DATA LOADING FUNCTIONS - CRITICAL - DO NOT MODIFY
  // ========================================================================

  /**
   * 获取热点数据 - PROTECTED FUNCTION
   * ⚠️ 核心数据加载逻辑，禁止修改
   */
  const fetchHotData = async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await getDailyHotAll();
      setAllHotData(data);
      setLastUpdateTime(new Date());

      // 保存数据到localStorage - LOCKED LOGIC
      localStorage.setItem('hotTopicsData', JSON.stringify(data.data));

      // 加载保存的兴趣过滤器 - PROTECTED LOGIC
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
   * 处理刷新 - PROTECTED FUNCTION
   * ⚠️ 数据刷新逻辑，禁止修改
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
      // 保存到本地存储
      saveBookmarkedTopics(newSet);
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

  // ========================================================================
  // SUBSCRIPTION MANAGEMENT FUNCTIONS - PROTECTED - DO NOT MODIFY
  // ========================================================================

  /**
   * 加载订阅 - PROTECTED FUNCTION
   * ⚠️ 订阅数据加载逻辑，禁止修改
   */
  const loadSubscriptions = () => {
    const subs = getTopicSubscriptions();
    setSubscriptions(subs);
    setSubscriptionStats(getSubscriptionStats());
  };

  /**
   * 处理添加订阅
   */
  const handleAddSubscription = async () => {
    if (!newSubscription.keyword.trim()) {
      toast({
        title: "请输入关键词",
        description: "订阅关键词不能为空",
        variant: "destructive"
      });
      return;
    }

    if (!newSubscription.description.trim()) {
      toast({
        title: "请输入描述",
        description: "订阅描述不能为空",
        variant: "destructive"
      });
      return;
    }

    // 如果启用了通知，检查浏览器通知权限
    if (newSubscription.notificationEnabled && 'Notification' in window) {
      if (Notification.permission === 'default') {
        const permission = await Notification.requestPermission();
        if (permission !== 'granted') {
          toast({
            title: "通知权限被拒绝",
            description: "您可以稍后在浏览器设置中启用通知权限",
            variant: "destructive"
          });
          // 继续创建订阅，但禁用通知
          newSubscription.notificationEnabled = false;
        }
      } else if (Notification.permission === 'denied') {
        toast({
          title: "通知权限被拒绝",
          description: "请在浏览器设置中启用通知权限后重新尝试",
          variant: "destructive"
        });
        // 继续创建订阅，但禁用通知
        newSubscription.notificationEnabled = false;
      }
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
        description: '',
        timeRange: '24h',
        minHeatThreshold: 1000,
        isActive: true,
        notificationEnabled: true,
        checkInterval: 30,
        maxHeatThreshold: 50000
      });
      setDescriptionEdited(false);

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
   * 处理编辑订阅
   */
  const handleEditSubscription = (subscription: TopicSubscription) => {
    setEditingSubscription({ ...subscription });
    setIsEditDialogOpen(true);
  };

  /**
   * 处理保存编辑
   */
  const handleSaveEdit = async () => {
    if (!editingSubscription) return;

    try {
      const updated = updateTopicSubscription(editingSubscription.id, {
        keyword: editingSubscription.keyword,
        description: editingSubscription.description,
        timeRange: editingSubscription.timeRange,
        minHeatThreshold: editingSubscription.minHeatThreshold,
        checkInterval: editingSubscription.checkInterval,
        notificationEnabled: editingSubscription.notificationEnabled,
        maxHeatThreshold: editingSubscription.maxHeatThreshold
      });

      if (updated) {
        await loadSubscriptions();
        setIsEditDialogOpen(false);
        setEditingSubscription(null);
        toast({
          title: "保存成功",
          description: "话题订阅已更新",
        });
      }
    } catch (error) {
      toast({
        title: "保存失败",
        description: "保存订阅时发生错误",
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
   * 处理标记订阅为已查看（清除红点）
   */
  const handleMarkAsViewed = (subscriptionId: string) => {
    try {
      markSubscriptionAsViewed(subscriptionId);
      loadSubscriptions(); // 重新加载订阅列表以更新红点状态
      console.log(`✅ 订阅 ${subscriptionId} 已标记为已查看，红点已清除`);
    } catch (error) {
      console.error('标记已查看失败:', error);
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
   * 启动话题订阅自动监控
   */
  const startSubscriptionMonitoring = () => {
    // 如果已有定时器，先清除
    if (monitoringTimer) {
      clearInterval(monitoringTimer);
    }

    // 设置定时器，每5分钟检查一次订阅
    const timer = setInterval(async () => {
      try {
        const activeSubscriptions = subscriptions.filter(s => s.isActive && s.notificationEnabled);
        if (activeSubscriptions.length > 0) {
          console.log('🔍 自动检查话题订阅...');
          const results = await checkAllSubscriptions();

          // 静默更新结果
          setMonitorResults(results);

          const totalResults = Object.values(results).flat().length;
          if (totalResults > 0) {
            console.log(`✅ 自动监控发现 ${totalResults} 个相关话题`);

            // 发送通知
            const { notifyTopicUpdate } = await import('@/services/notificationService');

            // 为每个有结果的订阅发送通知
            Object.entries(results).forEach(([subscriptionId, topicResults]) => {
              if (topicResults.length > 0) {
                const subscription = subscriptions.find(s => s.id === subscriptionId);
                if (subscription) {
                  notifyTopicUpdate(
                    subscription.keyword,
                    [`发现 ${topicResults.length} 个相关话题`],
                    topicResults[0].url // 第一个话题的链接
                  );
                }
              }
            });
          }
        }
      } catch (error) {
        console.error('自动监控失败:', error);
      }
    }, 5 * 60 * 1000); // 5分钟

    setMonitoringTimer(timer);
    console.log('🚀 话题订阅自动监控已启动（每5分钟检查一次）');
  };

  /**
   * 停止话题订阅自动监控
   */
  const stopSubscriptionMonitoring = () => {
    if (monitoringTimer) {
      clearInterval(monitoringTimer);
      setMonitoringTimer(null);
      console.log('🛑 话题订阅自动监控已停止');
    }
  };

  /**
   * 加载热度趋势和分析
   */
  const loadHeatTrends = async (keyword: string) => {
    if (heatTrends[keyword] && trendAnalysis[keyword]) return;

    setLoadingTrends(prev => ({ ...prev, [keyword]: true }));
    try {
      // 并行加载趋势数据和分析结果
      const [trends, analysis] = await Promise.all([
        getTopicHeatTrend(keyword, 7),
        getTrendAnalysis(keyword, 7)
      ]);

      setHeatTrends(prev => ({ ...prev, [keyword]: trends }));
      setTrendAnalysis(prev => ({ ...prev, [keyword]: analysis }));
    } catch (error) {
      console.error('加载热度趋势失败:', error);
      toast({
        title: "加载失败",
        description: "无法获取趋势数据，请稍后重试",
        variant: "destructive"
      });
    } finally {
      setLoadingTrends(prev => ({ ...prev, [keyword]: false }));
    }
  };

  // 兴趣设置保存和重置函数
  const handleSaveInterestSettings = () => {
    toast({
      title: "设置已保存",
      description: "您的兴趣偏好设置已成功保存",
    });
  };

  const handleResetInterestSettings = () => {
    // 重置兴趣过滤器到默认状态
    setInterestFilters({
      blockedKeywords: [],
      blockedPlatforms: [],
      preferredKeywords: [],
      preferredPlatforms: [],
      showBlocked: false,
      categoryPreferences: {}
    });

    // 清除本地存储的兴趣设置
    localStorage.removeItem('interest-filters');

    toast({
      title: "设置已重置",
      description: "所有兴趣偏好设置已恢复默认",
    });
  };

  // ========================================================================
  // COMPONENT INITIALIZATION - CRITICAL - DO NOT MODIFY
  // ========================================================================

  // 初始化 - PROTECTED LOGIC
  useEffect(() => {
    fetchHotData();
    loadSubscriptions();

    // 启动话题订阅自动监控
    startSubscriptionMonitoring();

    // 测试通知系统（仅在开发环境）
    if (process.env.NODE_ENV === 'development') {
      setTimeout(() => {
        // 导入通知服务并发送测试通知
        import('@/services/notificationService').then(({ notifySystem }) => {
          notifySystem(
            '系统启动完成',
            '话题订阅自动监控已启动，每5分钟检查一次订阅更新',
            'success'
          );
        });
      }, 2000); // 2秒后发送测试通知
    }

    // 清理函数
    return () => {
      stopSubscriptionMonitoring();
    };
  }, []);

  // ========================================================================
  // COMPONENT RENDER LOGIC - PROTECTED - DO NOT MODIFY
  // ========================================================================

  const currentData = getCurrentPlatformData();
  const stats = getStats();

  // 获取前三名话题用于领奖台展示 - LOCKED LOGIC
  const topThreeTopics = currentData.slice(0, 3);

  return (
    <div className="min-h-screen bg-background">
      {/* 页面导航 - PROTECTED COMPONENT */}
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
                className="text-sm font-medium"
              >
                <Plus className="w-4 h-4 mr-2" />
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
                        <CardTitle className="flex items-center gap-2 text-lg font-semibold text-foreground">
                          <Flame className="w-5 h-5 text-foreground" />
                          今日最热门话题
                        </CardTitle>
                        <CardDescription className="text-sm text-muted-foreground">
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
                              <div className="flex items-center justify-between mb-2">
                                <Badge variant="destructive" className="text-xs px-1 py-0 h-4">
                                  #{index + 1}
                                </Badge>
                                <span className="text-xs text-muted-foreground">
                                  {getPlatformDisplayName(topic.platform || '')}
                                </span>
                              </div>
                              <h4 className="text-sm font-medium text-foreground line-clamp-2 mb-2 flex-1">
                                {topic.title}
                              </h4>
                              <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                                <div className="flex items-center gap-1">
                                  {isTopicBookmarked(topic) && (
                                    <Bookmark className="w-3 h-3 text-foreground" />
                                  )}
                                  {isTopicRead(topic) && (
                                    <Eye className="w-3 h-3 text-muted-foreground" />
                                  )}
                                </div>
                              </div>
                              <div className="mt-auto">
                                <div className="flex items-center justify-between">
                                  <span className="text-xs text-muted-foreground">
                                    热度: {formatHotValue(topic.hot)}
                                  </span>
                                  <div className="flex items-center gap-1">
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      className="h-6 w-6 p-0"
                                      onClick={() => handleViewSource(topic)}
                                    >
                                      <Eye className="w-3 h-3" />
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      className={`h-6 w-6 p-0 ${isTopicBookmarked(topic) ? 'text-primary' : ''}`}
                                      onClick={() => toggleBookmark(topic)}
                                    >
                                      <Bookmark className="w-3 h-3" />
                                    </Button>
                                  </div>
                                </div>
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
                                  <div className="flex items-center justify-between mb-2">
                                    <Badge variant="destructive" className="text-xs px-1 py-0 h-4">
                                      #{index + 1}
                                    </Badge>
                                    <span className="text-xs text-muted-foreground">
                                      {getPlatformDisplayName(topic.platform || '')}
                                    </span>
                                  </div>
                                  <h4 className="text-sm font-medium text-foreground line-clamp-2 mb-2 flex-1">
                                    {topic.title}
                                  </h4>
                                  <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                                    <div className="flex items-center gap-1">
                                      {isTopicBookmarked(topic) && (
                                        <Bookmark className="w-3 h-3 text-foreground" />
                                      )}
                                      {isTopicRead(topic) && (
                                        <Eye className="w-3 h-3 text-muted-foreground" />
                                      )}
                                    </div>
                                  </div>
                                  <div className="mt-auto">
                                    <div className="flex items-center justify-between">
                                      <span className="text-xs text-muted-foreground">
                                        热度: {formatHotValue(topic.hot)}
                                      </span>
                                      <div className="flex items-center gap-1">
                                        <Button
                                          size="sm"
                                          variant="ghost"
                                          className="h-6 w-6 p-0"
                                          onClick={() => handleViewSource(topic)}
                                        >
                                          <Eye className="w-3 h-3" />
                                        </Button>
                                        <Button
                                          size="sm"
                                          variant="ghost"
                                          className={`h-6 w-6 p-0 ${isTopicBookmarked(topic) ? 'text-primary' : ''}`}
                                          onClick={() => toggleBookmark(topic)}
                                        >
                                          <Bookmark className="w-3 h-3" />
                                        </Button>
                                      </div>
                                    </div>
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

            {/* 话题分类 */}
            {currentPlatform === 'all' && !loading && getAllTopicsData().length > 0 && (
              <TopicCategories
                topics={getAllTopicsData()}
                onCategoryChange={handleCategoryChange}
                onTopicClick={handleTopicClick}
                onToggleBookmark={toggleBookmark}
                isTopicBookmarked={isTopicBookmarked}
                interestFilterComponent={
                  <InterestFilter onFilterChange={handleInterestFilterChange} />
                }
              />
            )}


          </TabsContent>

          {/* 话题订阅标签页 */}
          <TabsContent value="subscriptions">


            {/* 订阅瀑布流 */}
            <SubscriptionMasonry
              subscriptions={subscriptions}
              monitorResults={monitorResults}
              isMonitoring={isMonitoring}
              onEdit={handleEditSubscription}
              onDelete={handleDeleteSubscription}
              onMonitor={handleMonitorTopic}
              onTrends={(subscription) => {
                setSelectedSubscription(subscription);
                loadHeatTrends(subscription.keyword);
              }}
              onToggle={handleToggleSubscription}
              onMarkAsViewed={handleMarkAsViewed}
            />

            {/* 添加订阅按钮 - 当有订阅时显示 */}
            {subscriptions.length > 0 && (
              <div className="text-center mt-8">
                <Button onClick={() => setIsAddDialogOpen(true)} className="font-medium">
                  <Plus className="w-4 h-4 mr-2" />
                  添加新订阅
                </Button>
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
                                  handleViewSource(topic!);
                                }}
                                title="查看原文"
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleBookmark(topic!);
                                }}
                                title="删除收藏"
                              >
                                <Trash2 className="w-4 h-4" />
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
              <DialogTitle className="text-lg font-semibold text-foreground">添加话题订阅</DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground">
                设置关键词和监控条件，系统将自动追踪相关话题
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="keyword" className="text-sm font-medium text-foreground">关键词 *</Label>
                <Input
                  id="keyword"
                  placeholder="输入要监控的关键词"
                  value={newSubscription.keyword}
                  onChange={(e) => {
                    const keyword = e.target.value;
                    setNewSubscription(prev => ({ ...prev, keyword }));

                    // 触发关键词分析
                    if (keyword.trim() && !descriptionEdited) {
                      setIsAnalyzing(true);
                      debouncedAnalyze(keyword);
                    }
                  }}
                />
              </div>

              <div className="grid gap-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="description" className="text-sm font-medium text-foreground">描述 *</Label>
                  {isAnalyzing && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Loader2 className="w-3 h-3 animate-spin" />
                      智能分析中...
                    </div>
                  )}
                </div>
                <Input
                  id="description"
                  placeholder="系统将根据关键词自动生成描述，您也可以手动修改"
                  value={newSubscription.description}
                  onChange={(e) => {
                    setNewSubscription(prev => ({ ...prev, description: e.target.value }));
                    setDescriptionEdited(true);
                  }}
                />
                <p className="text-xs text-muted-foreground">
                  💡 系统会根据关键词自动生成描述，您可以随时修改
                </p>
              </div>

              {/* 关键词分析结果 */}
              {keywordAnalysis && (
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">AI</span>
                    </div>
                    <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-100">智能关键词分析</h4>
                  </div>

                  <div className="space-y-3">
                    {/* 详细剖析 */}
                    {keywordAnalysis.analysis && (
                      <div>
                        <h5 className="text-xs font-medium text-blue-800 dark:text-blue-200 mb-1">📊 深度剖析</h5>
                        <p className="text-xs text-blue-700 dark:text-blue-300 leading-relaxed">
                          {keywordAnalysis.analysis}
                        </p>
                      </div>
                    )}

                    {/* 相关关键词 */}
                    {keywordAnalysis.relatedKeywords && keywordAnalysis.relatedKeywords.length > 0 && (
                      <div>
                        <h5 className="text-xs font-medium text-blue-800 dark:text-blue-200 mb-2">🔗 相关关键词</h5>
                        <div className="flex flex-wrap gap-1">
                          {keywordAnalysis.relatedKeywords.map((related: string, index: number) => (
                            <Badge
                              key={index}
                              variant="secondary"
                              className="text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 cursor-pointer hover:bg-blue-200 dark:hover:bg-blue-800"
                              onClick={() => {
                                setNewSubscription(prev => ({ ...prev, keyword: related }));
                                setDescriptionEdited(false);
                                setIsAnalyzing(true);
                                debouncedAnalyze(related);
                              }}
                            >
                              {related}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* 监控建议 */}
                    {keywordAnalysis.monitoringTips && keywordAnalysis.monitoringTips.length > 0 && (
                      <div>
                        <h5 className="text-xs font-medium text-blue-800 dark:text-blue-200 mb-2">💡 监控建议</h5>
                        <ul className="space-y-1">
                          {keywordAnalysis.monitoringTips.map((tip: string, index: number) => (
                            <li key={index} className="text-xs text-blue-700 dark:text-blue-300 flex items-start gap-1">
                              <span className="text-blue-500 mt-0.5">•</span>
                              <span>{tip}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* 分类和标签 */}
                    <div className="flex items-center justify-between pt-2 border-t border-blue-200 dark:border-blue-800">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-blue-600 dark:text-blue-400">分类:</span>
                        <Badge variant="outline" className="text-xs border-blue-300 text-blue-700 dark:border-blue-700 dark:text-blue-300">
                          {keywordAnalysis.category}
                        </Badge>
                      </div>
                      {keywordAnalysis.tags && keywordAnalysis.tags.length > 0 && (
                        <div className="flex items-center gap-1">
                          {keywordAnalysis.tags.map((tag: string, index: number) => (
                            <Badge key={index} variant="outline" className="text-xs border-blue-300 text-blue-700 dark:border-blue-700 dark:text-blue-300">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              <div className="bg-muted/20 p-3 rounded-lg border border-muted/30">
                <div className="flex items-center gap-2 mb-2">
                  <Info className="w-4 h-4 text-blue-500" />
                  <span className="text-sm font-medium text-foreground">搜索范围</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  系统将自动搜索全网所有可用平台（微博、知乎、抖音、B站等），并在结果中标注信息来源
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="timeRange" className="text-sm font-medium text-foreground">时间范围</Label>
                  <Select
                    value={newSubscription.timeRange}
                    onValueChange={(value) => setNewSubscription(prev => ({ ...prev, timeRange: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1h">1小时</SelectItem>
                      <SelectItem value="6h">6小时</SelectItem>
                      <SelectItem value="24h">24小时</SelectItem>
                      <SelectItem value="7d">7天</SelectItem>
                      <SelectItem value="30d">30天</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="minHeatThreshold" className="text-sm font-medium text-foreground">最低热度</Label>
                  <Input
                    id="minHeatThreshold"
                    type="number"
                    placeholder="1000"
                    value={newSubscription.minHeatThreshold}
                    onChange={(e) => setNewSubscription(prev => ({ ...prev, minHeatThreshold: parseInt(e.target.value) || 0 }))}
                  />
                </div>
              </div>
              

              
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="checkInterval" className="text-sm font-medium text-foreground">检查间隔 (分钟)</Label>
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
                

              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="isActive"
                  checked={newSubscription.isActive}
                  onCheckedChange={(checked) => setNewSubscription(prev => ({ ...prev, isActive: checked }))}
                />
                <Label htmlFor="isActive" className="text-sm font-medium text-foreground">立即启用</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="notificationEnabled"
                  checked={newSubscription.notificationEnabled}
                  onCheckedChange={(checked) => setNewSubscription(prev => ({ ...prev, notificationEnabled: checked }))}
                />
                <Label htmlFor="notificationEnabled" className="text-sm font-medium text-foreground">启用通知</Label>
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)} className="font-medium">
                取消
              </Button>
              <Button onClick={handleAddSubscription} className="font-medium">
                添加订阅
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* 编辑订阅对话框 */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle className="text-lg font-semibold text-foreground">编辑话题订阅</DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground">
                修改订阅设置和监控条件
              </DialogDescription>
            </DialogHeader>

            {editingSubscription && (
              <div className="grid gap-4 py-4">


                <div className="grid gap-2">
                  <Label htmlFor="edit-subscription-keyword" className="text-sm font-medium text-foreground">关键词</Label>
                  <Input
                    id="edit-subscription-keyword"
                    placeholder="输入要监控的关键词"
                    value={editingSubscription.keyword}
                    onChange={(e) => setEditingSubscription(prev => prev ? { ...prev, keyword: e.target.value } : null)}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="edit-subscription-description" className="text-sm font-medium text-foreground">描述 *</Label>
                  <Input
                    id="edit-subscription-description"
                    placeholder="描述这个订阅的用途和目标"
                    value={editingSubscription.description || ''}
                    onChange={(e) => setEditingSubscription(prev => prev ? { ...prev, description: e.target.value } : null)}
                  />
                </div>

                <div className="bg-muted/20 p-3 rounded-lg border border-muted/30">
                  <div className="flex items-center gap-2 mb-2">
                    <Info className="w-4 h-4 text-blue-500" />
                    <span className="text-sm font-medium text-foreground">搜索范围</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    系统将自动搜索全网所有可用平台，并在结果中标注信息来源
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="edit-timeRange" className="text-sm font-medium text-foreground">时间范围</Label>
                    <Select
                      value={editingSubscription.timeRange || '24h'}
                      onValueChange={(value) => setEditingSubscription(prev => prev ? { ...prev, timeRange: value } : null)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1h">1小时</SelectItem>
                        <SelectItem value="6h">6小时</SelectItem>
                        <SelectItem value="24h">24小时</SelectItem>
                        <SelectItem value="7d">7天</SelectItem>
                        <SelectItem value="30d">30天</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="edit-minHeatThreshold" className="text-sm font-medium text-foreground">最低热度</Label>
                    <Input
                      id="edit-minHeatThreshold"
                      type="number"
                      placeholder="1000"
                      value={editingSubscription.minHeatThreshold || ''}
                      onChange={(e) => setEditingSubscription(prev => prev ? { ...prev, minHeatThreshold: parseInt(e.target.value) || undefined } : null)}
                    />
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="edit-checkInterval" className="text-sm font-medium text-foreground">检查间隔（分钟）</Label>
                  <div className="flex gap-2">
                    <div className="flex gap-1">
                      {[15, 30, 60, 120, 240].map((interval) => (
                        <Button
                          key={interval}
                          variant={editingSubscription.checkInterval === interval ? "default" : "outline"}
                          size="sm"
                          onClick={() => setEditingSubscription(prev => prev ? { ...prev, checkInterval: interval } : null)}
                          className="text-xs"
                        >
                          {interval >= 60 ? `${interval / 60}h` : `${interval}m`}
                        </Button>
                      ))}
                    </div>
                    <Input
                      id="edit-checkInterval"
                      type="number"
                      placeholder="自定义"
                      value={editingSubscription.checkInterval}
                      onChange={(e) => setEditingSubscription(prev => prev ? { ...prev, checkInterval: parseInt(e.target.value) || 30 } : null)}
                      className="w-20"
                    />
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="edit-maxHeatThreshold" className="text-sm font-medium text-foreground">热度警报</Label>
                  <Input
                    id="edit-maxHeatThreshold"
                    type="number"
                    placeholder="50000"
                    value={editingSubscription.maxHeatThreshold || ''}
                    onChange={(e) => setEditingSubscription(prev => prev ? { ...prev, maxHeatThreshold: parseInt(e.target.value) || undefined } : null)}
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="edit-notificationEnabled"
                    checked={editingSubscription.notificationEnabled}
                    onCheckedChange={(checked) => setEditingSubscription(prev => prev ? { ...prev, notificationEnabled: checked } : null)}
                  />
                  <Label htmlFor="edit-notificationEnabled" className="text-sm font-medium text-foreground">启用通知</Label>
                </div>
              </div>
            )}

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)} className="font-medium">
                取消
              </Button>
              <Button onClick={handleSaveEdit} className="font-medium">
                保存修改
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* 趋势分析对话框 */}
        <Dialog open={!!selectedSubscription} onOpenChange={() => setSelectedSubscription(null)}>
          <DialogContent className="max-w-5xl max-h-[85vh] overflow-y-auto">
            <DialogHeader className="pb-4">
              <DialogTitle className="flex items-center gap-2 text-xl font-semibold text-foreground">
                <BarChart className="w-5 h-5" />
                趋势分析 - {selectedSubscription?.keyword}
              </DialogTitle>
              <DialogDescription className="text-base text-muted-foreground">
                深度分析关键词的热度变化趋势和预测
              </DialogDescription>
            </DialogHeader>

            {selectedSubscription && (
              <div className="space-y-4">
                {/* 趋势概览 */}
                {trendAnalysis[selectedSubscription.keyword] && (
                  <div className="grid grid-cols-3 gap-4">
                    <Card className="border shadow-sm bg-card">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <TrendingUp className="w-4 h-4 text-blue-500" />
                          <span className="text-sm font-medium text-muted-foreground">趋势方向</span>
                        </div>
                        <div className="text-xl font-bold text-foreground">
                          {trendAnalysis[selectedSubscription.keyword].trendDirection === 'rising' ? '📈 上升' :
                           trendAnalysis[selectedSubscription.keyword].trendDirection === 'falling' ? '📉 下降' : '📊 稳定'}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          波动性: {trendAnalysis[selectedSubscription.keyword].volatility === 'high' ? '高' :
                                  trendAnalysis[selectedSubscription.keyword].volatility === 'medium' ? '中' : '低'}
                        </p>
                      </CardContent>
                    </Card>

                    <Card className="border shadow-sm bg-card">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Flame className="w-4 h-4 text-red-500" />
                          <span className="text-sm font-medium text-muted-foreground">峰值热度</span>
                        </div>
                        <div className="text-xl font-bold text-foreground">
                          {(trendAnalysis[selectedSubscription.keyword].peakHeat / 10000).toFixed(1)}万
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {new Date(trendAnalysis[selectedSubscription.keyword].peakDate).toLocaleDateString()}
                        </p>
                      </CardContent>
                    </Card>

                    <Card className="border shadow-sm bg-card">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Users className="w-4 h-4 text-green-500" />
                          <span className="text-sm font-medium text-muted-foreground">预测热度</span>
                        </div>
                        <div className="text-xl font-bold text-foreground">
                          {(trendAnalysis[selectedSubscription.keyword].prediction.nextDayHeat / 10000).toFixed(1)}万
                        </div>
                        <p className="text-sm text-muted-foreground">
                          置信度: {(trendAnalysis[selectedSubscription.keyword].prediction.confidence * 100).toFixed(0)}%
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {/* 趋势图表 */}
                {heatTrends[selectedSubscription.keyword] && (
                  <Card className="border shadow-sm">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg font-semibold text-foreground">7天热度趋势</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="h-56 w-full">
                        {/* 简化的趋势图表 */}
                        <div className="flex items-end justify-between h-full border-b border-l pl-8 pb-4">
                          {heatTrends[selectedSubscription.keyword].map((trend, index) => {
                            const maxHeat = Math.max(...heatTrends[selectedSubscription.keyword].map(t => t.heat));
                            const height = (trend.heat / maxHeat) * 100;
                            const date = new Date(trend.date);

                            return (
                              <div key={index} className="flex flex-col items-center gap-2">
                                <div className="text-sm text-muted-foreground font-medium">
                                  {(trend.heat / 10000).toFixed(1)}万
                                </div>
                                <div
                                  className={`w-8 rounded-t transition-all duration-300 ${
                                    trend.trend === 'up' ? 'bg-green-500' :
                                    trend.trend === 'down' ? 'bg-red-500' : 'bg-blue-500'
                                  }`}
                                  style={{ height: `${height}%` }}
                                  title={`${trend.date}: ${trend.heat}热度, ${trend.mentions}提及`}
                                />
                                <div className="text-sm text-muted-foreground">
                                  {date.getMonth() + 1}/{date.getDate()}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* 智能洞察 */}
                {trendAnalysis[selectedSubscription.keyword] && (
                  <Card className="border shadow-sm">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg font-semibold text-foreground">智能洞察</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="space-y-3">
                        {trendAnalysis[selectedSubscription.keyword].insights.map((insight, index) => (
                          <div key={index} className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
                            <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                            <p className="text-base leading-relaxed text-foreground">{insight}</p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* 详细数据表格 */}
                {heatTrends[selectedSubscription.keyword] && (
                  <Card className="border shadow-sm">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg font-semibold text-foreground">详细数据</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b border-muted">
                              <th className="text-left py-3 px-3 font-semibold text-foreground">日期</th>
                              <th className="text-left py-3 px-3 font-semibold text-foreground">热度</th>
                              <th className="text-left py-3 px-3 font-semibold text-foreground">提及</th>
                              <th className="text-left py-3 px-3 font-semibold text-foreground">趋势</th>
                              <th className="text-left py-3 px-3 font-semibold text-foreground">峰值时间</th>
                              <th className="text-left py-3 px-3 font-semibold text-foreground">情感</th>
                            </tr>
                          </thead>
                          <tbody>
                            {heatTrends[selectedSubscription.keyword].map((trend, index) => (
                              <tr key={index} className="border-b border-muted/50 hover:bg-muted/30">
                                <td className="py-3 px-3 text-foreground">{trend.date}</td>
                                <td className="py-3 px-3 font-medium text-foreground">{(trend.heat / 10000).toFixed(1)}万</td>
                                <td className="py-3 px-3 text-foreground">{trend.mentions}</td>
                                <td className="py-3 px-3">
                                  <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-sm font-medium ${
                                    trend.trend === 'up' ? 'bg-green-100 text-green-700' :
                                    trend.trend === 'down' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
                                  }`}>
                                    {trend.trend === 'up' ? '↗️' : trend.trend === 'down' ? '↘️' : '→'}
                                    {trend.changePercent > 0 ? '+' : ''}{trend.changePercent.toFixed(1)}%
                                  </span>
                                </td>
                                <td className="py-3 px-3 text-foreground">{trend.peakHour}</td>
                                <td className="py-3 px-3">
                                  <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-sm font-medium ${
                                    trend.sentiment === 'positive' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' :
                                    trend.sentiment === 'negative' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300' : 'bg-muted text-muted-foreground'
                                  }`}>
                                    {trend.sentiment === 'positive' ? '😊' : trend.sentiment === 'negative' ? '😟' : '😐'}
                                    {trend.sentiment === 'positive' ? '正面' : trend.sentiment === 'negative' ? '负面' : '中性'}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {loadingTrends[selectedSubscription.keyword] && (
                  <div className="flex items-center justify-center py-8">
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                      <span className="text-base text-muted-foreground">正在分析趋势数据...</span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

// ============================================================================
// END OF PROTECTED COMPONENT
// ============================================================================
//
// ⚠️ PROTECTION SUMMARY ⚠️
// Component: HotTopicsPage (全网雷达页面)
// Protection Level: HIGH
// Lock Date: 2025-01-10
//
// PROTECTED SECTIONS:
// - Core state management and hooks
// - Data loading functions (fetchHotData, loadSubscriptions)
// - Subscription management logic
// - Component initialization (useEffect)
// - Main render logic and UI structure
//
// MODIFICATION POLICY:
// - DO NOT modify core functionality
// - DO NOT remove existing features
// - DO NOT change data flow logic
// - For new features, create separate components
// - For bug fixes, create patches with approval
//
// CONTACT: System Administrator for modification requests
// ============================================================================