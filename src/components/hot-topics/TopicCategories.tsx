/**
 * 话题分类组件
 * 支持按类别快速查看话题
 */
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DailyHotItem } from '@/api/hotTopicsService';
import { ExternalLink, Bookmark, MoreVertical, ArrowUp, Eye, EyeOff, Pin, Trash2, GripVertical } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

interface TopicCategoriesProps {
  topics: DailyHotItem[];
  onCategoryChange: (category: string) => void;
  onTopicClick: (topic: DailyHotItem) => void;
}

/**
 * 话题分类组件
 */
const TopicCategories: React.FC<TopicCategoriesProps> = ({
  topics,
  onCategoryChange,
  onTopicClick
}) => {
  // 平台显示名称映射
  const getPlatformDisplayName = (platform: string): string => {
    const platformNames: Record<string, string> = {
      'weibo': '微博',
      'zhihu': '知乎',
      'bilibili': 'B站',
      'douyin': '抖音',
      'toutiao': '头条',
      'baidu': '百度',
      '36kr': '36氪',
      'ithome': 'IT之家'
    };
    return platformNames[platform] || platform;
  };

  // 状态管理
  const [bookmarkedTopics, setBookmarkedTopics] = useState<Set<string>>(new Set());
  const [hiddenCategories, setHiddenCategories] = useState<Set<string>>(new Set());
  const [pinnedCategories, setPinnedCategories] = useState<Set<string>>(new Set());

  // 处理收藏
  const handleBookmark = (topic: DailyHotItem) => {
    const topicId = `${topic.platform}-${topic.title}`;
    const newBookmarked = new Set(bookmarkedTopics);
    if (newBookmarked.has(topicId)) {
      newBookmarked.delete(topicId);
    } else {
      newBookmarked.add(topicId);
    }
    setBookmarkedTopics(newBookmarked);
  };

  // 处理分类操作
  const handleCategoryAction = (categoryId: string, action: string) => {
    switch (action) {
      case 'hide':
        setHiddenCategories(prev => new Set([...prev, categoryId]));
        break;
      case 'pin':
        setPinnedCategories(prev => new Set([...prev, categoryId]));
        break;
      case 'unpin':
        setPinnedCategories(prev => {
          const newSet = new Set(prev);
          newSet.delete(categoryId);
          return newSet;
        });
        break;
      case 'delete':
        // 这里可以添加删除逻辑
        console.log('删除分类:', categoryId);
        break;
    }
  };

  // 返回顶部
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 话题分类定义
  const categories = [
    { id: 'all', label: '全部', icon: '🔥' },
    { id: 'entertainment', label: '娱乐', icon: '🎬' },
    { id: 'technology', label: '科技', icon: '💻' },
    { id: 'sports', label: '体育', icon: '⚽' },
    { id: 'politics', label: '政治', icon: '🏛️' },
    { id: 'economy', label: '财经', icon: '💰' },
    { id: 'society', label: '社会', icon: '👥' },
    { id: 'education', label: '教育', icon: '📚' },
    { id: 'health', label: '健康', icon: '🏥' },
    { id: 'lifestyle', label: '生活', icon: '🏠' },
    { id: 'other', label: '其他', icon: '📝' }
  ];

  /**
   * 根据关键词判断话题分类
   */
  const getTopicCategory = (topic: DailyHotItem): string => {
    const title = topic.title.toLowerCase();
    const desc = (topic.desc || '').toLowerCase();

    // 娱乐类关键词
    const entertainmentKeywords = ['明星', '演员', '歌手', '电影', '电视剧', '综艺', '娱乐', '明星', '艺人', '导演', '编剧'];
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
    const societyKeywords = ['社会', '事件', '新闻', '调查', '报道', '事件', '事故', '案件', '纠纷'];
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
   * 获取分类下的话题
   */
  const getTopicsByCategory = (category: string): DailyHotItem[] => {
    if (category === 'all') {
      return topics;
    }
    return topics.filter(topic => getTopicCategory(topic) === category);
  };

  /**
   * 获取分类统计
   */
  const getCategoryCount = (category: string): number => {
    return getTopicsByCategory(category).length;
  };

  return (
    <div className="mb-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="text-lg">📊</span>
            分类热点信息流
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            按分类多列展示所有热点话题，一目了然查看全网热点
          </p>
        </CardHeader>
        <CardContent>
          {/* 多列网格布局 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {categories
              .filter(cat => cat.id !== 'all' && !hiddenCategories.has(cat.id))
              .sort((a, b) => {
                // 置顶分类排在前面
                const aIsPinned = pinnedCategories.has(a.id);
                const bIsPinned = pinnedCategories.has(b.id);
                if (aIsPinned && !bIsPinned) return -1;
                if (!aIsPinned && bIsPinned) return 1;
                return 0;
              })
              .map((category) => {
                const categoryTopics = getTopicsByCategory(category.id);
                if (categoryTopics.length === 0) return null;
                const isPinned = pinnedCategories.has(category.id);

                return (
                  <Card key={category.id} className={`h-fit ${isPinned ? 'ring-2 ring-primary' : ''}`}>
                    <CardHeader className="pb-3">
                      {/* 分类标题和操作 */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <GripVertical className="w-4 h-4 text-muted-foreground cursor-move" />
                          <span className="text-lg">{category.icon}</span>
                          <h3 className="text-base font-semibold">{category.label}</h3>
                          {isPinned && <Pin className="w-3 h-3 text-primary" />}
                        </div>
                        <div className="flex items-center gap-1">
                          <Badge variant="secondary" className="text-xs">
                            {categoryTopics.length}
                          </Badge>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                <MoreVertical className="w-3 h-3" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleCategoryAction(category.id, isPinned ? 'unpin' : 'pin')}>
                                <Pin className="w-3 h-3 mr-2" />
                                {isPinned ? '取消置顶' : '置顶'}
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleCategoryAction(category.id, 'hide')}>
                                <EyeOff className="w-3 h-3 mr-2" />
                                屏蔽
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleCategoryAction(category.id, 'delete')} className="text-destructive">
                                <Trash2 className="w-3 h-3 mr-2" />
                                删除
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className="pt-0">
                      {/* 话题列表 */}
                      <div className="space-y-2">
                        {categoryTopics.slice(0, 6).map((topic, index) => {
                          const topicId = `${topic.platform}-${topic.title}`;
                          const isBookmarked = bookmarkedTopics.has(topicId);

                          return (
                            <div
                              key={`${topic.platform}-${index}`}
                              className="p-2 rounded-lg border hover:shadow-md transition-all bg-card"
                            >
                              {/* 排名和平台 */}
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-xs font-bold text-primary">#{index + 1}</span>
                                <Badge variant="outline" className="text-xs px-1 py-0 h-4">
                                  {getPlatformDisplayName(topic.platform || '')}
                                </Badge>
                              </div>

                              {/* 标题 */}
                              <h4 className="text-sm font-medium line-clamp-2 mb-2 cursor-pointer hover:text-primary"
                                  onClick={() => onTopicClick(topic)}>
                                {topic.title}
                              </h4>

                              {/* 热度和操作按钮 */}
                              <div className="flex items-center justify-between">
                                <span className="text-xs text-muted-foreground">
                                  热度: {topic.hot || '暂无数据'}
                                </span>
                                <div className="flex items-center gap-1">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 w-6 p-0"
                                    onClick={() => onTopicClick(topic)}
                                  >
                                    <ExternalLink className="w-3 h-3" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className={`h-6 w-6 p-0 ${isBookmarked ? 'text-primary' : ''}`}
                                    onClick={() => handleBookmark(topic)}
                                  >
                                    <Bookmark className="w-3 h-3" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          );
                        })}

                        {categoryTopics.length > 6 && (
                          <div className="text-center py-1">
                            <span className="text-xs text-muted-foreground">
                              +{categoryTopics.length - 6} 更多
                            </span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
          </div>

          {/* 返回顶部按钮 */}
          <div className="fixed bottom-6 right-6 z-50">
            <Button
              onClick={scrollToTop}
              className="rounded-full w-12 h-12 shadow-lg"
              size="sm"
            >
              <ArrowUp className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TopicCategories; 