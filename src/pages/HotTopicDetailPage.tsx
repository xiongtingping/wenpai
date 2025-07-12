/**
 * 热点话题详情页面
 * 显示话题的详细内容和相关信息
 */
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, ExternalLink, Share2, Bookmark, TrendingUp } from 'lucide-react';
import { DailyHotItem } from '@/api/hotTopicsService';
import { getPlatformDisplayName, getPlatformIconClass } from '@/api/hotTopicsService';

interface HotTopicDetailPageProps {}

/**
 * 热点话题详情页面组件
 */
const HotTopicDetailPage: React.FC<HotTopicDetailPageProps> = () => {
  const { id, platform } = useParams<{ id: string; platform: string }>();
  const navigate = useNavigate();
  const [topicData, setTopicData] = useState<DailyHotItem | null>(null);
  const [relatedTopics, setRelatedTopics] = useState<DailyHotItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id && platform) {
      loadTopicDetail();
    }
  }, [id, platform]);

  /**
   * 加载话题详情
   */
  const loadTopicDetail = async () => {
    try {
      setLoading(true);
      // 这里可以从本地存储或API获取话题详情
      // 暂时使用模拟数据
      const mockTopic: DailyHotItem = {
        title: decodeURIComponent(id || ''),
        hot: '1,215,710',
        url: `https://example.com/topic/${id}`,
        desc: '这是一个热点话题的详细描述，包含了话题的背景信息、相关讨论和重要观点。',
        platform: platform,
        index: 1
      };

      setTopicData(mockTopic);
      
      // 模拟相关话题
      const mockRelated: DailyHotItem[] = [
        {
          title: '相关话题1',
          hot: '500,000',
          url: 'https://example.com/related1',
          platform: platform,
          index: 2
        },
        {
          title: '相关话题2',
          hot: '300,000',
          url: 'https://example.com/related2',
          platform: platform,
          index: 3
        }
      ];
      
      setRelatedTopics(mockRelated);
    } catch (err) {
      setError('加载话题详情失败');
    } finally {
      setLoading(false);
    }
  };

  /**
   * 处理返回操作
   */
  const handleBack = () => {
    navigate(-1);
  };

  /**
   * 处理外部链接跳转
   */
  const handleExternalLink = () => {
    if (topicData?.url) {
      window.open(topicData.url, '_blank');
    }
  };

  /**
   * 处理分享功能
   */
  const handleShare = async () => {
    if (navigator.share && topicData) {
      try {
        await navigator.share({
          title: topicData.title,
          text: topicData.desc || topicData.title,
          url: topicData.url
        });
      } catch (err) {
        console.log('分享失败:', err);
      }
    } else {
      // 复制链接到剪贴板
      if (topicData?.url) {
        navigator.clipboard.writeText(topicData.url);
        // 这里可以显示一个toast提示
      }
    }
  };

  /**
   * 处理收藏功能
   */
  const handleBookmark = () => {
    // 实现收藏逻辑
    console.log('收藏话题:', topicData?.title);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">加载中...</div>
        </div>
      </div>
    );
  }

  if (error || !topicData) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-red-500">{error || '话题不存在'}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* 返回按钮 */}
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={handleBack}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          返回
        </Button>
      </div>

      {/* 话题详情卡片 */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <Badge variant="secondary" className={getPlatformIconClass(topicData.platform || '')}>
                  {getPlatformDisplayName(topicData.platform || '')}
                </Badge>
                <Badge variant="outline" className="flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  {topicData.hot}
                </Badge>
              </div>
              <CardTitle className="text-2xl font-bold">{topicData.title}</CardTitle>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleBookmark}
                className="flex items-center gap-1"
              >
                <Bookmark className="h-4 w-4" />
                收藏
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleShare}
                className="flex items-center gap-1"
              >
                <Share2 className="h-4 w-4" />
                分享
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {topicData.desc && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2">话题描述</h3>
              <p className="text-gray-700 leading-relaxed">{topicData.desc}</p>
            </div>
          )}
          
          <Separator className="my-6" />
          
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500">
              热度排名: #{topicData.index}
            </div>
            <Button
              onClick={handleExternalLink}
              className="flex items-center gap-2"
            >
              <ExternalLink className="h-4 w-4" />
              查看原文
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 相关话题 */}
      {relatedTopics.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">相关话题</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {relatedTopics.map((topic, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                  onClick={() => navigate(`/hot-topics/detail/${encodeURIComponent(topic.title)}/${topic.platform}`)}
                >
                  <div className="flex-1">
                    <h4 className="font-medium">{topic.title}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="secondary" className="text-xs">
                        {getPlatformDisplayName(topic.platform || '')}
                      </Badge>
                      <span className="text-sm text-gray-500">{topic.hot}</span>
                    </div>
                  </div>
                  <ArrowLeft className="h-4 w-4 rotate-180" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default HotTopicDetailPage; 