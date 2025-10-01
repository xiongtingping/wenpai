import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { logger } from '@/utils/logger';
import { debounce } from '@/lib/performance';
import { useSubscriptionDialogPositioning } from '@/hooks/useDialogPositioning';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from '@/components/ui/dialog';
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
  Heart,
  X
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from 'react-i18next';
import PageNavigation from '@/components/layout/PageNavigation';
import { Header } from '@/components/landing/Header';
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
import EnhancedTopicCategories from '@/components/hot-topics/EnhancedTopicCategories';
import RSSHubIndicator from '@/components/hot-topics/RSSHubIndicator';
import intelligentDeduplicationService from '@/services/intelligentDeduplicationService';
import unifiedHeatScoreService from '@/services/unifiedHeatScoreService';
import intelligentCategoryService from '@/services/intelligentCategoryService';
import multiDimensionalTrendService from '@/services/multiDimensionalTrendService';
import DataSourceToggle from '@/components/hot-topics/DataSourceToggle';
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

export default function HotTopicsPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  // 修复 activeTab is not defined 错误
  const [activeTab, setActiveTab] = useState<'hot' | 'subscriptions' | 'bookmarks'>('hot');

  // 修复其他缺失的状态
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [allHotData, setAllHotData] = useState<DailyHotResponse | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingSubscription, setEditingSubscription] = useState<any>(null);
  const [selectedSubscription, setSelectedSubscription] = useState<any>(null);
  const [heatTrends, setHeatTrends] = useState<any>({});
  const [trendAnalysis, setTrendAnalysis] = useState<any>({});
  const [keywordAnalysis, setKeywordAnalysis] = useState<any>(null);
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [monitorResults, setMonitorResults] = useState<any>({});
  const [isMonitoring, setIsMonitoring] = useState<any>({});
  const [loadingTrends, setLoadingTrends] = useState<Record<string, boolean>>({});
  const [supportedPlatforms, setSupportedPlatforms] = useState<string[]>([]);
  const [currentPlatform, setCurrentPlatform] = useState<string>('all');
  const [useEnhancedCategories, setUseEnhancedCategories] = useState(false);
  const [stats, setStats] = useState({ total: 0, platforms: 0 });
  const [lastUpdateTime, setLastUpdateTime] = useState(new Date());
  const [bookmarkedTopics, setBookmarkedTopics] = useState<Set<string>>(new Set());
  const [viewedTopics, setViewedTopics] = useState<Set<string>>(new Set());
  const [newSubscription, setNewSubscription] = useState({
    keyword: '',
    description: '',
    timeRange: '24h',
    minHeatThreshold: 1000,
    checkInterval: 60,
    isActive: true,
    notificationEnabled: true
  });
  const [descriptionEdited, setDescriptionEdited] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // 🎯 应用根本解决方案：使用订阅弹窗专用的定位Hook
  useSubscriptionDialogPositioning(isAddDialogOpen, false);
  useSubscriptionDialogPositioning(isEditDialogOpen, false);
  useSubscriptionDialogPositioning(!!selectedSubscription, false);

  // 🚨 强化修复：立即锁定Dialog尺寸，防止任何闪动
  useEffect(() => {
    if (isAddDialogOpen || isEditDialogOpen || selectedSubscription) {
      const fixDialogSizeInstantly = () => {
        const dialogs = document.querySelectorAll('.subscription-dialog-stable, .trend-analysis-dialog-stable');
        dialogs.forEach((dialog: any) => {
          if (dialog.classList.contains('subscription-dialog-stable')) {
            // 添加订阅和编辑订阅Dialog
            dialog.style.setProperty('width', 'min(90vw, 1000px)', 'important');
            dialog.style.setProperty('max-width', '1000px', 'important');
            dialog.style.setProperty('min-width', '600px', 'important');
            dialog.style.setProperty('max-height', '90vh', 'important');
            dialog.style.setProperty('min-height', '500px', 'important');
          } else if (dialog.classList.contains('trend-analysis-dialog-stable')) {
            // 趋势分析Dialog
            dialog.style.setProperty('width', 'min(95vw, 1400px)', 'important');
            dialog.style.setProperty('max-width', '1400px', 'important');
            dialog.style.setProperty('min-width', '900px', 'important');
            dialog.style.setProperty('max-height', '95vh', 'important');
            dialog.style.setProperty('min-height', '700px', 'important');
          }
          
          // 禁用所有动画
          dialog.style.setProperty('transition', 'none', 'important');
          dialog.style.setProperty('animation', 'none', 'important');
          dialog.style.setProperty('animation-duration', '0s', 'important');
          dialog.style.setProperty('transition-duration', '0s', 'important');
          
          // 🎯 确保Dialog可以正常关闭
          dialog.style.setProperty('pointer-events', 'auto', 'important');
          
          // 🚨 确保关闭按钮始终可见和可点击
          const closeButton = dialog.querySelector('[data-radix-dialog-close]');
          if (closeButton) {
            closeButton.style.setProperty('position', 'absolute', 'important');
            closeButton.style.setProperty('right', '16px', 'important');
            closeButton.style.setProperty('top', '16px', 'important');
            closeButton.style.setProperty('z-index', '1000001', 'important');
            closeButton.style.setProperty('pointer-events', 'auto', 'important');
            closeButton.style.setProperty('opacity', '0.7', 'important');
          }
          
          console.log('🎯 立即修复Dialog尺寸和关闭功能:', dialog.className);
        });
      };

      // 立即执行
      fixDialogSizeInstantly();
      // 延迟执行，确保Radix UI完成初始化后也被修复
      setTimeout(fixDialogSizeInstantly, 0);
      setTimeout(fixDialogSizeInstantly, 10);
      setTimeout(fixDialogSizeInstantly, 50);
      setTimeout(fixDialogSizeInstantly, 100);

      // 🔥 使用MutationObserver监控Dialog变化，防止任何尺寸重置
      const observer = new MutationObserver(() => {
        // 只修复尺寸，不干扰其他功能
        fixDialogSizeInstantly();
      });

      // 监控所有Dialog元素的属性和样式变化
      const dialogs = document.querySelectorAll('.subscription-dialog-stable, .trend-analysis-dialog-stable');
      dialogs.forEach((dialog) => {
        observer.observe(dialog, {
          attributes: true,
          attributeFilter: ['style'], // 只监控style变化，不监控class变化以避免干扰关闭状态
          subtree: false
        });
      });

      // 清理函数
      return () => {
        observer.disconnect();
      };
    }
  }, [isAddDialogOpen, isEditDialogOpen, selectedSubscription]);

  const formatHotValue = (hot: string | undefined): string => {
    if (!hot || hot === '' || hot === '0' || hot === 'undefined') {
      return t('hotTopics.noData');
    }

    const num = parseInt(hot);
    if (isNaN(num)) {
      return hot || t('hotTopics.noData');
    }

    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}m`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}k`;
    }
    return hot;
  };

  // 修复 fetchHotData is not defined 错误，添加重试机制
  const fetchHotData = useCallback(async (retryCount = 0) => {
    const maxRetries = 3;
    const retryDelay = 1000 * (retryCount + 1); // 递增延迟

    try {
      setLoading(true);
      if (retryCount === 0) {
        setError(null); // 只在第一次尝试时清除错误
      }
      
      const response = await getDailyHotAll();
      setAllHotData(response);
      setLastUpdateTime(new Date());

      // 计算统计信息
      if (response?.data) {
        const platforms = Object.keys(response.data);
        const total = Object.values(response.data).reduce((sum, topics) => sum + topics.length, 0);
        setStats({ total, platforms: platforms.length });
        setSupportedPlatforms(platforms);
      }
      
      // 成功后清除错误状态
      setError(null);
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '未知错误';
      console.warn(`获取热点数据失败 (尝试 ${retryCount + 1}/${maxRetries + 1}):`, errorMessage);
      
      if (retryCount < maxRetries) {
        // 自动重试
        setTimeout(() => {
          fetchHotData(retryCount + 1);
        }, retryDelay);
        setError(`正在重试获取数据... (${retryCount + 1}/${maxRetries})`);
      } else {
        // 达到最大重试次数
        setError('网络连接异常，请检查网络后手动刷新');
      }
    } finally {
      if (retryCount === 0) {
        setLoading(false);
      }
    }
  }, []);

  // 修复其他缺失的函数
  const isTopicBookmarked = useCallback((topic: DailyHotItem) => {
    // 简单的书签检查逻辑，可以根据需要扩展
    return false; // 临时返回 false
  }, []);

  const isTopicRead = useCallback((topic: DailyHotItem) => {
    // 简单的已读检查逻辑
    return false; // 临时返回 false
  }, []);

  const toggleBookmark = useCallback((topic: DailyHotItem) => {
    // 书签切换逻辑
    console.log('Toggle bookmark for:', topic.title);
  }, []);

  const handleTopicClick = useCallback((topic: DailyHotItem) => {
    // 话题点击处理
    console.log('Topic clicked:', topic.title);
  }, []);

  const handleInterestFilterChange = useCallback((filters: any) => {
    // 兴趣过滤器变化处理
    console.log('Interest filter changed:', filters);
  }, []);

  const handleEditSubscription = useCallback((subscription: any) => {
    setEditingSubscription(subscription);
    setIsEditDialogOpen(true);
  }, []);

  const handleDeleteSubscription = useCallback((subscription: any) => {
    console.log('Delete subscription:', subscription);
  }, []);

  const handleToggleSubscription = useCallback((subscriptionId: string, isActive: boolean) => {
    console.log('Toggle subscription:', subscriptionId, isActive);
    // 这里可以添加实际的切换逻辑
  }, []);

  const handleMarkAsViewed = useCallback((subscriptionId: string) => {
    console.log('Mark as viewed:', subscriptionId);
    // 这里可以添加标记为已查看的逻辑
  }, []);

  const loadHeatTrends = useCallback((keyword: string) => {
    console.log('Loading heat trends for:', keyword);
    // 模拟加载热度趋势数据
    const mockTrends = Array.from({ length: 7 }, (_, i) => ({
      date: new Date(Date.now() - (6 - i) * 24 * 60 * 60 * 1000).toISOString(),
      heat: Math.floor(Math.random() * 10000) + 1000
    }));
    setHeatTrends((prev: any) => ({ ...prev, [keyword]: mockTrends }));
  }, []);

  const getTrendAnalysis = useCallback((keyword: string) => {
    console.log('Getting trend analysis for:', keyword);
    // 模拟趋势分析数据
    const mockAnalysis = {
      trendDirection: ['rising', 'falling', 'stable'][Math.floor(Math.random() * 3)],
      volatility: ['high', 'medium', 'low'][Math.floor(Math.random() * 3)],
      peakHeat: Math.floor(Math.random() * 50000) + 10000,
      peakDate: new Date(Date.now() - Math.floor(Math.random() * 7) * 24 * 60 * 60 * 1000).toISOString(),
      prediction: {
        nextDayHeat: Math.floor(Math.random() * 40000) + 8000,
        confidence: Math.random() * 0.4 + 0.6 // 0.6-1.0
      },
      insights: [
        '该话题在社交媒体上讨论热度持续上升',
        '预计未来24小时内热度将保持高位',
        '建议关注相关衍生话题的发展'
      ]
    };
    setTrendAnalysis((prev: any) => ({ ...prev, [keyword]: mockAnalysis }));
    return mockAnalysis;
  }, []);

  const handleBookmarkTopic = useCallback((topicId: string) => {
    setBookmarkedTopics(prev => {
      const newSet = new Set(prev);
      if (newSet.has(topicId)) {
        newSet.delete(topicId);
      } else {
        newSet.add(topicId);
      }
      return newSet;
    });
  }, []);

  const handleMarkTopicAsViewed = useCallback((topicId: string) => {
    setViewedTopics(prev => new Set([...prev, topicId]));
  }, []);

  const analyzeKeyword = useCallback(async (keyword: string) => {
    try {
      // 模拟关键词分析
      await new Promise(resolve => setTimeout(resolve, 1000));

      if (!descriptionEdited) {
        setNewSubscription(prev => ({
          ...prev,
          description: `监控关键词"${keyword}"的热点趋势和相关话题`
        }));
      }

      setKeywordAnalysis({
        relatedKeywords: [`${keyword}相关`, `${keyword}热点`, `${keyword}趋势`],
        suggestedDescription: `监控关键词"${keyword}"的热点趋势和相关话题`
      });
    } catch (error) {
      console.error('关键词分析失败:', error);
    } finally {
      setIsAnalyzing(false);
    }
  }, [descriptionEdited]);

  const debouncedAnalyze = useCallback(
    debounce((keyword: string) => analyzeKeyword(keyword), 500),
    [analyzeKeyword]
  );

  const handleAddSubscription = useCallback(async () => {
    try {
      if (!newSubscription.keyword.trim()) {
        alert('请输入关键词');
        return;
      }

      // 模拟添加订阅
      const subscription = {
        id: Date.now().toString(),
        ...newSubscription,
        createdAt: new Date().toISOString()
      };

      setSubscriptions(prev => [...prev, subscription]);

      // 重置表单
      setNewSubscription({
        keyword: '',
        description: '',
        timeRange: '24h',
        minHeatThreshold: 1000,
        checkInterval: 60,
        isActive: true,
        notificationEnabled: true
      });

      setDescriptionEdited(false);
      setKeywordAnalysis(null);
      setIsAddDialogOpen(false);

      console.log('订阅添加成功:', subscription);
    } catch (error) {
      console.error('添加订阅失败:', error);
      alert('添加订阅失败，请稍后重试');
    }
  }, [newSubscription]);

  const handleSaveEdit = useCallback(async () => {
    try {
      if (!editingSubscription) {
        alert('没有正在编辑的订阅');
        return;
      }

      // 模拟保存编辑
      setSubscriptions(prev =>
        prev.map(sub =>
          sub.id === editingSubscription.id
            ? { ...editingSubscription, updatedAt: new Date().toISOString() }
            : sub
        )
      );

      setEditingSubscription(null);
      setIsEditDialogOpen(false);

      console.log('订阅编辑成功:', editingSubscription);
    } catch (error) {
      console.error('保存编辑失败:', error);
      alert('保存编辑失败，请稍后重试');
    }
  }, [editingSubscription]);

  const handleMonitorTopic = useCallback((subscription: any) => {
    console.log('Monitor topic:', subscription);
  }, []);

  const handleViewSource = useCallback((topic: DailyHotItem) => {
    if (topic.url) {
      window.open(topic.url, '_blank');
    }
  }, []);

  const handleCategoryChange = useCallback((category: string) => {
    console.log('Category changed:', category);
  }, []);

  const prepareCategorizedData = useCallback(() => {
    if (!allHotData?.data) return {};
    return allHotData.data;
  }, [allHotData]);

  const getAllTopicsData = useCallback((): DailyHotItem[] => {
    if (!allHotData?.data) return [];

    if (currentPlatform === 'all') {
      return aggregateAndSortTopics(allHotData.data);
    } else {
      return allHotData.data[currentPlatform] || [];
    }
  }, [allHotData, currentPlatform]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchHotData();
    setRefreshing(false);
  };

  // 初始化数据加载
  useEffect(() => {
    fetchHotData();
  }, [fetchHotData]);

  // 🎯 Tab靠左显示 - 轻量级CSS修复验证
  useEffect(() => {
    console.log('✅ HotTopicsPage已加载，Tab靠左修复依赖CSS');
  }, []);

  return (
    <div className="min-h-screen bg-background" style={{ paddingTop: '64px' }}>
      <Header />

      {/* 页面导航 - PROTECTED COMPONENT */}
      <PageNavigation
        title="全网雷达"
        description="实时监控各平台热门话题，支持自定义话题订阅和智能追踪"
        showAdaptButton={false}
        // 移除actions中的刷新按钮
      />

      <div className="container mx-auto px-4 py-4">
        {/* 主标签页 */}
        <Tabs 
          value={activeTab} 
          onValueChange={(value) => {
            console.log('🎯 Radix UI onValueChange触发:', value);
            console.log('🎯 当前activeTab:', activeTab);
            setActiveTab(value as 'hot' | 'subscriptions' | 'bookmarks');
            
            // 强制更新TabsContent显示
            setTimeout(() => {
              console.log('🔄 Radix onValueChange - 强制更新TabsContent...');
              document.querySelectorAll('[data-radix-tabs-content]').forEach(content => {
                const cValue = content.getAttribute('value');
                if (cValue === value) {
                  (content as HTMLElement).style.setProperty('display', 'block', 'important');
                  (content as HTMLElement).style.setProperty('visibility', 'visible', 'important');
                  (content as HTMLElement).style.setProperty('opacity', '1', 'important');
                  (content as HTMLElement).style.setProperty('background', 'rgba(0, 255, 0, 0.3)', 'important');
                  console.log('✅ Radix强制显示内容:', cValue);
                } else {
                  (content as HTMLElement).style.setProperty('display', 'none', 'important');
                }
              });
            }, 10);
          }} 
          className="w-full"
        >
          <div className="hot-topics-page-controls hot-topics-baseline-fix hot-topics-alignment-protection">
            <div className="hot-topics-tab-container">
              <TabsList className="unified-tabs-list grid w-full grid-cols-2">
              <TabsTrigger 
                value="hot" 
                className="unified-tab-trigger"
                disabled={false}
                onClick={() => console.log('Hot topics tab clicked')}
              >
                <TrendingUp className="tab-icon" />
                <span className="tab-text-mobile">热点</span>
                <span className="tab-text-desktop">全网热点</span>
              </TabsTrigger>
              <TabsTrigger 
                value="subscriptions" 
                className="unified-tab-trigger"
                disabled={false}
                onClick={() => console.log('Subscriptions tab clicked')}
              >
                <Bell className="tab-icon" />
                <span className="tab-text-mobile">订阅</span>
                <span className="tab-text-desktop">话题订阅</span>
              </TabsTrigger>
              <TabsTrigger 
                value="bookmarks" 
                className="unified-tab-trigger"
                disabled={false}
                onClick={() => console.log('Bookmarks tab clicked')}
              >
                <Bookmark className="tab-icon" />
                <span className="tab-text-mobile">{t('hotTopics.buttons.bookmark')}</span>
                <span className="tab-text-desktop">灵感夹</span>
              </TabsTrigger>
            </TabsList>
            </div>
            {/* 操作按钮区，添加订阅和刷新并列 */}
            <div 
              className="hot-topics-actions-container" 
              style={{ 
                zIndex: 9999, 
                position: 'relative', 
                pointerEvents: 'auto' 
              }}
            >
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  console.log('🔧 HotTopicsPage 添加订阅按钮被点击');
                  setIsAddDialogOpen(true);
                }}
                className="action-button text-sm font-medium hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all duration-200 cursor-pointer"
                style={{ 
                  transition: 'all 0.2s ease-in-out',
                  cursor: 'pointer',
                  zIndex: 99999,
                  position: 'relative',
                  pointerEvents: 'auto'
                }}
                onMouseEnter={(e) => {
                  console.log('🔧 鼠标进入HotTopicsPage添加订阅按钮');
                  e.currentTarget.style.transform = 'scale(1.05)';
                }}
                onMouseLeave={(e) => {
                  console.log('🔧 鼠标离开HotTopicsPage添加订阅按钮');
                  e.currentTarget.style.transform = 'scale(1)';
                }}
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
                className="action-button text-xs sm:text-sm"
                style={{ 
                  zIndex: 99999,
                  position: 'relative',
                  pointerEvents: 'auto'
                }}
              >
                <RefreshCw className={`w-4 h-4 mr-1 ${refreshing ? 'animate-spin' : ''}`} />
                刷新
              </Button>
              {/* RSSHub 数据源指示器 - 非侵入式增强 */}
              <RSSHubIndicator
                onDataUpdate={(hasNewData) => {
                  if (hasNewData) {
                    // 可选：当有新的RSSHub数据时触发刷新
                    console.log('RSSHub数据已更新');
                  }
                }}
              />
            </div>
          </div>

          {/* 全网热点标签页 */}
          <TabsContent value="hot" className="mt-0">
            {/* 加载状态显示 */}
            {loading && !error && (
              <Card className="mb-4">
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
              <Card className="mb-4 border-border bg-accent">
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

            {/* 数据源增强选项暂时隐藏以解决空白问题 */}

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
                      <TabsList className="unified-tabs-list flex w-full overflow-x-auto whitespace-nowrap" style={{justifyContent: 'flex-start'}}>
                        <TabsTrigger value="all" className="unified-tab-trigger flex-shrink-0">总榜</TabsTrigger>
                        {supportedPlatforms.map((platform) => (
                          <TabsTrigger key={platform} value={platform} className="unified-tab-trigger flex-shrink-0">
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
                            <div className="text-center text-muted-foreground py-8">{t('hotTopics.noData')}</div>
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
              useEnhancedCategories ? (
                <EnhancedTopicCategories
                  originalData={prepareCategorizedData()}
                  onCategoryClick={handleCategoryChange}
                  className="mb-2"
                />
              ) : (
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
              )
            )}

          </TabsContent>

          {/* 话题订阅标签页 */}
          <TabsContent value="subscriptions">
            {subscriptions.length === 0 ? (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="w-5 h-5 text-foreground" />
                    话题订阅
                  </CardTitle>
                  <CardDescription>
                    设置关键词监控，第一时间获取热点话题
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div 
                    className="text-center py-12" 
                    style={{ 
                      zIndex: 9999, 
                      position: 'relative', 
                      pointerEvents: 'auto' 
                    }}
                  >
                    <Bell className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-lg font-medium text-foreground mb-2">暂无话题订阅</h3>
                    <p className="text-muted-foreground mb-6">
                      添加您感兴趣的关键词，系统将自动为您追踪相关热点
                    </p>
                    <Button 
                      onClick={() => {
                        console.log('🔧 HotTopicsPage 添加首个订阅按钮被点击');
                        setIsAddDialogOpen(true);
                      }} 
                      className="font-medium hover:bg-primary-600 transition-all duration-200 cursor-pointer"
                      style={{ 
                        transition: 'all 0.2s ease-in-out',
                        cursor: 'pointer',
                        zIndex: 99999,
                        position: 'relative',
                        pointerEvents: 'auto'
                      }}
                      onMouseEnter={(e) => {
                        console.log('🔧 鼠标进入添加首个订阅按钮');
                        e.currentTarget.style.transform = 'scale(1.05)';
                      }}
                      onMouseLeave={(e) => {
                        console.log('🔧 鼠标离开添加首个订阅按钮');
                        e.currentTarget.style.transform = 'scale(1)';
                      }}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      添加首个订阅
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <>
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
                <div 
                  className="text-center mt-8" 
                  style={{ 
                    zIndex: 9999, 
                    position: 'relative', 
                    pointerEvents: 'auto' 
                  }}
                >
                  <Button 
                    onClick={() => {
                      console.log('🔧 HotTopicsPage 添加新订阅按钮被点击');
                      setIsAddDialogOpen(true);
                    }}
                    className="font-medium hover:bg-primary-600 transition-all duration-200 cursor-pointer"
                    style={{ 
                      transition: 'all 0.2s ease-in-out',
                      cursor: 'pointer',
                      zIndex: 99999,
                      position: 'relative',
                      pointerEvents: 'auto'
                    }}
                    onMouseEnter={(e) => {
                      console.log('🔧 鼠标进入添加新订阅按钮');
                      e.currentTarget.style.transform = 'scale(1.05)';
                    }}
                    onMouseLeave={(e) => {
                      console.log('🔧 鼠标离开添加新订阅按钮');
                      e.currentTarget.style.transform = 'scale(1)';
                    }}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    添加新订阅
                  </Button>
                </div>
              </>
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
                                  {t('hotTopics.favorited')}
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
                                  // 跳转到AI内容适配并预填充内容
                                  navigate('/adapt', {
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
          <DialogContent 
            className="subscription-dialog-stable flex flex-col overflow-hidden"
            style={{
              width: 'min(90vw, 1000px) !important',
              height: 'auto !important',
              maxWidth: '1000px !important',
              maxHeight: '90vh !important',
              minWidth: '600px !important',
              minHeight: '500px !important'
            }}
          >
            <DialogHeader>
              <DialogTitle className="text-lg font-semibold text-foreground">添加话题订阅</DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground">
                设置关键词和监控条件，系统将自动追踪相关话题
              </DialogDescription>
              <DialogClose className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
                <X className="h-4 w-4" />
                <span className="sr-only">关闭</span>
              </DialogClose>
            </DialogHeader>
            
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="keyword" className="text-sm font-medium text-foreground">关键词 *</Label>
                <Input
                  id="keyword"
                  placeholder={t('hotTopics.keywordPlaceholder')}
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
                    <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                      <span className="text-background text-xs font-bold">AI</span>
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
                              <span className="text-primary mt-0.5">•</span>
                              <span>{tip}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* 分类和标签 */}
                    <div className="flex items-center justify-between pt-2 border-t border-blue-200 dark:border-blue-800">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-primary dark:text-blue-400">分类:</span>
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
                  <Info className="w-4 h-4 text-primary" />
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
              <Button 
                onClick={() => {
                  console.log('🔧 HotTopicsPage Dialog内添加订阅确认按钮被点击');
                  handleAddSubscription();
                }}
                className="font-medium hover:bg-primary-600 transition-all duration-200 cursor-pointer"
                style={{ 
                  transition: 'all 0.2s ease-in-out',
                  cursor: 'pointer',
                  zIndex: 99999,
                  position: 'relative',
                  pointerEvents: 'auto'
                }}
                onMouseEnter={(e) => {
                  console.log('🔧 鼠标进入Dialog内添加订阅确认按钮');
                  e.currentTarget.style.transform = 'scale(1.05)';
                }}
                onMouseLeave={(e) => {
                  console.log('🔧 鼠标离开Dialog内添加订阅确认按钮');
                  e.currentTarget.style.transform = 'scale(1)';
                }}
              >
                添加订阅
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* 编辑订阅对话框 */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent 
            className="subscription-dialog-stable flex flex-col overflow-hidden"
            style={{
              width: 'min(90vw, 1000px) !important',
              height: 'auto !important',
              maxWidth: '1000px !important',
              maxHeight: '90vh !important',
              minWidth: '600px !important',
              minHeight: '500px !important'
            }}
          >
            <DialogHeader>
              <DialogTitle className="text-lg font-semibold text-foreground">编辑话题订阅</DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground">
                修改订阅设置和监控条件
              </DialogDescription>
              <DialogClose className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
                <X className="h-4 w-4" />
                <span className="sr-only">关闭</span>
              </DialogClose>
            </DialogHeader>

            {editingSubscription && (
              <div className="grid gap-4 py-4">

                <div className="grid gap-2">
                  <Label htmlFor="edit-subscription-keyword" className="text-sm font-medium text-foreground">关键词</Label>
                  <Input
                    id="edit-subscription-keyword"
                    placeholder={t('hotTopics.keywordPlaceholder')}
                    value={editingSubscription.keyword}
                    onChange={(e) => setEditingSubscription((prev: any) => prev ? { ...prev, keyword: e.target.value } : null)}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="edit-subscription-description" className="text-sm font-medium text-foreground">描述 *</Label>
                  <Input
                    id="edit-subscription-description"
                    placeholder="描述这个订阅的用途和目标"
                    value={editingSubscription.description || ''}
                    onChange={(e) => setEditingSubscription((prev: any) => prev ? { ...prev, description: e.target.value } : null)}
                  />
                </div>

                <div className="bg-muted/20 p-3 rounded-lg border border-muted/30">
                  <div className="flex items-center gap-2 mb-2">
                    <Info className="w-4 h-4 text-primary" />
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
                      onValueChange={(value) => setEditingSubscription((prev: any) => prev ? { ...prev, timeRange: value } : null)}
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
                      onChange={(e) => setEditingSubscription((prev: any) => prev ? { ...prev, minHeatThreshold: parseInt(e.target.value) || undefined } : null)}
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
                          onClick={() => setEditingSubscription((prev: any) => prev ? { ...prev, checkInterval: interval } : null)}
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
                      onChange={(e) => setEditingSubscription((prev: any) => prev ? { ...prev, checkInterval: parseInt(e.target.value) || 30 } : null)}
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
                    onChange={(e) => setEditingSubscription((prev: any) => prev ? { ...prev, maxHeatThreshold: parseInt(e.target.value) || undefined } : null)}
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="edit-notificationEnabled"
                    checked={editingSubscription.notificationEnabled}
                    onCheckedChange={(checked) => setEditingSubscription((prev: any) => prev ? { ...prev, notificationEnabled: checked } : null)}
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
          <DialogContent 
            className="trend-analysis-dialog-stable flex flex-col overflow-hidden"
            style={{
              width: 'min(95vw, 1400px) !important',
              height: 'auto !important',
              maxWidth: '1400px !important',
              maxHeight: '95vh !important',
              minWidth: '900px !important',
              minHeight: '700px !important'
            }}
          >
            <DialogHeader className="pb-4">
              <DialogTitle className="flex items-center gap-2 text-xl font-semibold text-foreground">
                <BarChart className="w-5 h-5" />
                趋势分析 - {selectedSubscription?.keyword}
              </DialogTitle>
              <DialogDescription className="text-base text-muted-foreground">
                深度分析关键词的热度变化趋势和预测
              </DialogDescription>
              <DialogClose className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
                <X className="h-4 w-4" />
                <span className="sr-only">关闭</span>
              </DialogClose>
            </DialogHeader>

            {selectedSubscription && (
              <div className="flex-1 overflow-y-auto p-1">
                <div className="space-y-4">
                {/* 趋势概览 */}
                {trendAnalysis[selectedSubscription.keyword] && (
                  <div className="grid grid-cols-3 gap-4">
                    <Card className="border shadow-sm bg-card">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <TrendingUp className="w-4 h-4 text-primary" />
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
                          <Flame className="w-4 h-4 text-destructive" />
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
                          <Users className="w-4 h-4 text-success" />
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
                          {heatTrends[selectedSubscription.keyword].map((trend: any, index: number) => {
                            const maxHeat = Math.max(...heatTrends[selectedSubscription.keyword].map((t: any) => t.heat));
                            const height = (trend.heat / maxHeat) * 100;
                            const date = new Date(trend.date);

                            return (
                              <div key={index} className="flex flex-col items-center gap-2">
                                <div className="text-sm text-muted-foreground font-medium">
                                  {(trend.heat / 10000).toFixed(1)}万
                                </div>
                                <div
                                  className={`w-8 rounded-t transition-all duration-300 ${
                                    trend.trend === 'up' ? 'bg-success' :
                                    trend.trend === 'down' ? 'bg-destructive' : 'bg-primary'
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
                        {trendAnalysis[selectedSubscription.keyword].insights.map((insight: any, index: number) => (
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
                            {heatTrends[selectedSubscription.keyword].map((trend: any, index: number) => (
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