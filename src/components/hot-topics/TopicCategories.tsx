/**
 * 话题分类组件
 * 支持按类别快速查看话题
 */
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DailyHotItem } from '@/api/hotTopicsService';
import { ExternalLink, Bookmark, MoreVertical, ArrowUp, Eye, EyeOff, Pin, Trash2, GripVertical, ChevronDown, ChevronUp } from 'lucide-react';
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

  // 格式化热度值，统一为m单位
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
    return `${num}`;
  };

  // 状态管理
  const [bookmarkedTopics, setBookmarkedTopics] = useState<Set<string>>(new Set());
  const [hiddenCategories, setHiddenCategories] = useState<Set<string>>(new Set());
  const [pinnedCategories, setPinnedCategories] = useState<Set<string>>(new Set());
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

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

  // 处理展开/收起
  const toggleExpanded = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  // 返回顶部
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 话题分类定义（带主题色）
  const categories = [
    { id: 'all', label: '全部', icon: '🔥' },
    { id: 'entertainment', label: '娱乐', icon: '🎬', theme: 'from-pink-500/20 to-rose-500/20 border-pink-200' },
    { id: 'technology', label: '科技', icon: '💻', theme: 'from-blue-500/20 to-cyan-500/20 border-blue-200' },
    { id: 'sports', label: '体育', icon: '⚽', theme: 'from-green-500/20 to-emerald-500/20 border-green-200' },
    { id: 'politics', label: '政治', icon: '🏛️', theme: 'from-purple-500/20 to-violet-500/20 border-purple-200' },
    { id: 'economy', label: '财经', icon: '💰', theme: 'from-yellow-500/20 to-orange-500/20 border-yellow-200' },
    { id: 'society', label: '社会', icon: '👥', theme: 'from-indigo-500/20 to-blue-500/20 border-indigo-200' },
    { id: 'education', label: '教育', icon: '📚', theme: 'from-teal-500/20 to-cyan-500/20 border-teal-200' },
    { id: 'health', label: '健康', icon: '🏥', theme: 'from-red-500/20 to-pink-500/20 border-red-200' },
    { id: 'lifestyle', label: '生活', icon: '🏠', theme: 'from-amber-500/20 to-yellow-500/20 border-amber-200' },
    { id: 'other', label: '其他', icon: '📝', theme: 'from-gray-500/20 to-slate-500/20 border-gray-200' }
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
        <CardContent className="px-2">
          {/* 固定2行5列网格布局 */}
          <div className="grid grid-cols-5 gap-1">
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
                const isExpanded = expandedCategories.has(category.id);
                const displayTopics = isExpanded ? categoryTopics : categoryTopics.slice(0, 5);

                return (
                  <Card
                    key={category.id}
                    className={`h-80 bg-gradient-to-br ${category.theme} shadow-md hover:shadow-lg transition-all duration-300 ${isPinned ? 'ring-2 ring-primary' : ''}`}
                  >
                    <CardHeader className="pb-1 px-1.5 pt-1.5">
                      {/* 分类标题和操作 */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          <GripVertical className="w-3 h-3 text-muted-foreground cursor-move" />
                          <span className="text-base">{category.icon}</span>
                          <h3 className="text-sm font-semibold">{category.label}</h3>
                          {isPinned && <Pin className="w-2 h-2 text-primary" />}
                        </div>
                        <div className="flex items-center gap-1">
                          <Badge variant="secondary" className="text-xs px-1 py-0 h-4">
                            {categoryTopics.length}
                          </Badge>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-5 w-5 p-0">
                                <MoreVertical className="w-2 h-2" />
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

                    <CardContent className="pt-0 px-1.5 pb-1.5 flex-1 overflow-hidden">
                      {/* 话题列表 */}
                      <div className="space-y-1">
                        {displayTopics.map((topic, index) => {
                          const topicId = `${topic.platform}-${topic.title}`;
                          const isBookmarked = bookmarkedTopics.has(topicId);

                          return (
                            <div
                              key={`${topic.platform}-${index}`}
                              className="p-1 rounded border hover:shadow-sm transition-all bg-white/50"
                            >
                              {/* 排名和标题 */}
                              <div className="flex items-start gap-1 mb-1">
                                <span className="text-xs font-bold text-primary flex-shrink-0 mt-0.5">#{index + 1}</span>
                                <h4 className="text-xs font-medium line-clamp-2 flex-1 cursor-pointer hover:text-primary leading-relaxed"
                                    onClick={() => onTopicClick(topic)}>
                                  {topic.title}
                                </h4>
                              </div>

                              {/* 底部信息：来源 + 热度 + 操作按钮 */}
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <Badge variant="outline" className="text-xs px-1 py-0 h-4">
                                    {getPlatformDisplayName(topic.platform || '')}
                                  </Badge>
                                  <span className="text-xs text-muted-foreground">
                                    {formatHotValue(topic.hot)}
                                  </span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-5 w-5 p-0 hover:bg-primary/20"
                                    onClick={() => onTopicClick(topic)}
                                  >
                                    <Eye className="w-3 h-3" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className={`h-5 w-5 p-0 hover:bg-primary/20 ${isBookmarked ? 'text-primary' : ''}`}
                                    onClick={() => handleBookmark(topic)}
                                  >
                                    <Bookmark className="w-3 h-3" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          );
                        })}

                        {/* 展开/收起按钮 */}
                        {categoryTopics.length > 5 && (
                          <div className="text-center pt-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 text-xs text-muted-foreground hover:text-primary"
                              onClick={() => toggleExpanded(category.id)}
                            >
                              {isExpanded ? (
                                <>
                                  <ChevronUp className="w-3 h-3 mr-1" />
                                  收起
                                </>
                              ) : (
                                <>
                                  <ChevronDown className="w-3 h-3 mr-1" />
                                  展开查看全部 ({categoryTopics.length - 5} 更多)
                                </>
                              )}
                            </Button>
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