/**
 * 全网热门话题页面
 * 显示各平台热门话题和趋势
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
  ExternalLink
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

/**
 * 全网热门话题页面组件
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
  
  // 支持的平台列表
  const supportedPlatforms = getSupportedPlatforms();

  /**
   * 获取全网热点数据
   */
  const fetchHotData = async () => {
    try {
      setLoading(true);
      const data = await getDailyHotAll();
      setAllHotData(data);
    } catch (error) {
      console.error('获取全网热点数据失败:', error);
      toast({
        title: "获取数据失败",
        description: "请稍后重试",
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
    toast({
      title: "数据已刷新",
      description: "全网热点数据已更新",
    });
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
   * 初始化数据
   */
  useEffect(() => {
    fetchHotData();
  }, []);

  const currentData = getCurrentPlatformData();
  const stats = getStats();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 页面导航 */}
      <PageNavigation
        title="全网热点话题"
        description="实时监控各平台热门话题，为内容创作提供灵感"
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
        {/* 统计概览 */}
        {stats && (
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

        {/* 话题列表 */}
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
      </div>
    </div>
  );
} 