/**
 * 话题分类组件
 * 支持按类别快速查看话题
 */
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DailyHotItem } from '@/api/hotTopicsService';

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
            {categories.filter(cat => cat.id !== 'all').map((category) => {
              const categoryTopics = getTopicsByCategory(category.id);
              if (categoryTopics.length === 0) return null;

              return (
                <div key={category.id} className="space-y-3">
                  {/* 分类标题 */}
                  <div className="flex items-center gap-2 pb-2 border-b">
                    <span className="text-lg">{category.icon}</span>
                    <h3 className="text-base font-semibold">{category.label}</h3>
                    <Badge variant="secondary" className="ml-auto text-xs">
                      {categoryTopics.length}
                    </Badge>
                  </div>

                  {/* 话题列表 */}
                  <div className="space-y-2">
                    {categoryTopics.slice(0, 8).map((topic, index) => (
                      <div
                        key={`${topic.platform}-${index}`}
                        className="p-2 rounded-lg border hover:shadow-md transition-all cursor-pointer bg-card"
                        onClick={() => onTopicClick(topic)}
                      >
                        {/* 排名和平台 */}
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-bold text-primary">#{index + 1}</span>
                          <Badge variant="outline" className="text-xs px-1 py-0 h-4">
                            {topic.platform}
                          </Badge>
                        </div>

                        {/* 标题 */}
                        <h4 className="text-sm font-medium line-clamp-2 mb-1">
                          {topic.title}
                        </h4>

                        {/* 热度 */}
                        <div className="text-xs text-muted-foreground">
                          热度: {topic.hot || '暂无数据'}
                        </div>
                      </div>
                    ))}

                    {categoryTopics.length > 8 && (
                      <div className="text-center py-1">
                        <span className="text-xs text-muted-foreground">
                          +{categoryTopics.length - 8} 更多
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TopicCategories; 