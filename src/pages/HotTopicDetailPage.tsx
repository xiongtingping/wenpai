/**
 * 热点话题详情页面
 * 显示话题的详细内容、相关讨论和重要观点
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { 
  ArrowLeft, 
  Share2, 
  Bookmark, 
  BookmarkPlus,
  Eye, 
  TrendingUp, 
  Clock, 
  Hash,
  MessageCircle,
  ThumbsUp,
  ExternalLink,
  Copy,
  Check,
  Flame,
  Zap
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import PageNavigation from '@/components/layout/PageNavigation';
import { DailyHotItem } from '@/api/hotTopicsService';

/**
 * 热点话题详情页面组件
 * @returns React 组件
 */
export default function HotTopicDetailPage() {
  const { platform, title } = useParams<{ platform: string; title: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [topic, setTopic] = useState<DailyHotItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (platform && title) {
      // 从localStorage获取话题数据
      const storedTopics = localStorage.getItem('hotTopicsData');
      if (storedTopics) {
        try {
          const allTopics = JSON.parse(storedTopics);
          const platformTopics = allTopics[platform] || [];
          const foundTopic = platformTopics.find((t: DailyHotItem) => 
            decodeURIComponent(t.title) === decodeURIComponent(title)
          );
          
          if (foundTopic) {
            setTopic(foundTopic);
          } else {
            // 如果没有找到，创建一个模拟的话题数据
            setTopic({
              title: decodeURIComponent(title),
              hot: '100000',
              url: '#',
              platform: platform,
              desc: decodeURIComponent(title),
              content: `关于"${decodeURIComponent(title)}"的话题在${platform}平台引发了广泛讨论。这个话题涉及多个方面的内容，包括背景信息、相关讨论和重要观点。`,
              relatedTopics: [`${decodeURIComponent(title)}相关讨论`, '热门话题', '实时讨论'],
              rank: 1
            });
          }
        } catch (error) {
          console.error('解析话题数据失败:', error);
        }
      }
      setLoading(false);
    }
  }, [platform, title]);

  const handleBack = () => {
    navigate('/hot-topics');
  };

  const handleShare = async () => {
    if (navigator.share && topic) {
      try {
        await navigator.share({
          title: topic.title,
          text: topic.content || topic.title,
          url: window.location.href
        });
      } catch (error) {
        console.log('分享失败:', error);
      }
    } else {
      // 复制链接到剪贴板
      await handleCopyLink();
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      toast({
        title: "链接已复制",
        description: "话题链接已复制到剪贴板",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({
        title: "复制失败",
        description: "无法复制链接到剪贴板",
        variant: "destructive"
      });
    }
  };

  const handleBookmark = () => {
    if (topic) {
      const bookmarks = JSON.parse(localStorage.getItem('bookmarkedTopics') || '[]');
      const isAlreadyBookmarked = bookmarks.some((b: DailyHotItem) => 
        b.title === topic.title && b.platform === topic.platform
      );

      if (isAlreadyBookmarked) {
        const newBookmarks = bookmarks.filter((b: DailyHotItem) => 
          !(b.title === topic.title && b.platform === topic.platform)
        );
        localStorage.setItem('bookmarkedTopics', JSON.stringify(newBookmarks));
        setIsBookmarked(false);
        toast({
          title: "已取消收藏",
          description: "话题已从收藏中移除",
        });
      } else {
        bookmarks.push(topic);
        localStorage.setItem('bookmarkedTopics', JSON.stringify(bookmarks));
        setIsBookmarked(true);
        toast({
          title: "已收藏",
          description: "话题已添加到收藏",
        });
      }
    }
  };

  const formatHotValue = (hot: string) => {
    const num = parseInt(hot);
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return hot;
  };

  const getPlatformDisplayName = (platform: string) => {
    const platformNames: Record<string, string> = {
      'weibo': '微博',
      'zhihu': '知乎',
      'douyin': '抖音',
      'bilibili': 'B站',
      'baidu': '百度',
      '36kr': '36氪',
      'ithome': 'IT之家',
      'sspai': '少数派',
      'juejin': '掘金',
      'csdn': 'CSDN',
      'github': 'GitHub',
      'v2ex': 'V2EX',
      'ngabbs': 'NGA',
      'hellogithub': 'HelloGitHub'
    };
    return platformNames[platform] || platform;
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600">加载中...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!topic) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">话题未找到</h1>
          <Button onClick={handleBack}>返回热点话题</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <PageNavigation />
      
      <div className="container mx-auto px-4 py-8">
        {/* 返回按钮 */}
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={handleBack}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            返回热点话题
          </Button>
        </div>

        {/* 主要内容 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 左侧：话题详情 */}
          <div className="lg:col-span-2">
            <Card className="mb-6">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline">
                        {getPlatformDisplayName(topic.platform || '')}
                      </Badge>
                      {topic.rank && (
                        <Badge className="bg-blue-500 text-white">
                          #{topic.rank}
                        </Badge>
                      )}
                    </div>
                    <CardTitle className="text-2xl font-bold text-gray-800 mb-2">
                      {topic.title}
                    </CardTitle>
                    <CardDescription className="text-gray-600">
                      {topic.desc}
                    </CardDescription>
                  </div>
                  
                  {/* 操作按钮 */}
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleShare}
                      className="flex items-center gap-1"
                    >
                      <Share2 className="w-4 h-4" />
                      分享
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleCopyLink}
                      className="flex items-center gap-1"
                    >
                      {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      {copied ? '已复制' : '复制链接'}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleBookmark}
                      className="flex items-center gap-1"
                    >
                      {isBookmarked ? <Bookmark className="w-4 h-4" /> : <BookmarkPlus className="w-4 h-4" />}
                      {isBookmarked ? '已收藏' : '收藏'}
                    </Button>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                {/* 热度信息 */}
                <div className="flex items-center gap-4 mb-6 p-4 bg-gradient-to-r from-orange-50 to-red-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Flame className="w-5 h-5 text-orange-500" />
                    <span className="font-semibold text-orange-600">
                      热度值
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-yellow-500" />
                    <span className="text-lg font-bold text-gray-800">
                      {formatHotValue(topic.hot)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Eye className="w-4 h-4 text-blue-500" />
                    <span className="text-sm text-gray-600">
                      实时热度
                    </span>
                  </div>
                </div>

                {/* 详细内容 */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <MessageCircle className="w-5 h-5 text-blue-500" />
                    话题详情
                  </h3>
                  <div className="prose prose-gray max-w-none">
                    <p className="text-gray-700 leading-relaxed">
                      {topic.content || `关于"${topic.title}"的话题在${getPlatformDisplayName(topic.platform || '')}平台引发了广泛讨论。这个话题涉及多个方面的内容，包括背景信息、相关讨论和重要观点。`}
                    </p>
                  </div>
                </div>

                <Separator className="my-6" />

                {/* 相关话题 */}
                {topic.relatedTopics && topic.relatedTopics.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                      <Hash className="w-5 h-5 text-green-500" />
                      相关话题
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {topic.relatedTopics.map((relatedTopic, index) => (
                        <Badge
                          key={index}
                          variant="secondary"
                          className="cursor-pointer hover:bg-gray-200 transition-colors"
                        >
                          {relatedTopic}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* 右侧：统计信息 */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">话题统计</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">平台</span>
                  <Badge variant="outline">
                    {getPlatformDisplayName(topic.platform || '')}
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">排名</span>
                  <span className="font-semibold">#{topic.rank || 'N/A'}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">热度值</span>
                  <span className="font-semibold text-orange-600">
                    {formatHotValue(topic.hot)}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">更新时间</span>
                  <span className="text-sm text-gray-500">
                    {new Date().toLocaleString('zh-CN')}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* 快速操作 */}
            <Card className="mt-4">
              <CardHeader>
                <CardTitle className="text-lg">快速操作</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={handleShare}
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  分享话题
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={handleBookmark}
                >
                  {isBookmarked ? (
                    <>
                      <Bookmark className="w-4 h-4 mr-2" />
                      取消收藏
                    </>
                  ) : (
                    <>
                      <BookmarkPlus className="w-4 h-4 mr-2" />
                      收藏话题
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={handleCopyLink}
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      已复制链接
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 mr-2" />
                      复制链接
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
} 