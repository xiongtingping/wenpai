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
            按分类展示所有热点话题，一目了然查看全网热点
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {categories.filter(cat => cat.id !== 'all').map((category) => {
              const categoryTopics = getTopicsByCategory(category.id);
              if (categoryTopics.length === 0) return null;

              return (
                <div key={category.id} className="space-y-3">
                  {/* 分类标题 */}
                  <div className="flex items-center gap-2 pb-2 border-b">
                    <span className="text-xl">{category.icon}</span>
                    <h3 className="text-lg font-semibold">{category.label}</h3>
                    <Badge variant="secondary" className="ml-2">
                      {categoryTopics.length} 条
                    </Badge>
                  </div>

                  {/* 话题列表 */}
                  <div className="space-y-2">
                    {categoryTopics.slice(0, 10).map((topic, index) => (
                      <div
                        key={`${topic.platform}-${index}`}
                        className="flex items-start gap-3 p-3 rounded-lg border hover:shadow-md transition-all cursor-pointer bg-card"
                        onClick={() => onTopicClick(topic)}
                      >
                        {/* 排名 */}
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-xs font-bold text-primary">#{index + 1}</span>
                        </div>

                        {/* 内容 */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <h4 className="text-sm font-medium line-clamp-2 flex-1">
                              {topic.title}
                            </h4>
                            <Badge variant="outline" className="text-xs flex-shrink-0">
                              {topic.platform}
                            </Badge>
                          </div>

                          {topic.desc && (
                            <p className="text-xs text-muted-foreground line-clamp-1 mb-2">
                              {topic.desc}
                            </p>
                          )}

                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span>热度: {topic.hot || '暂无数据'}</span>
                            <span className="text-primary">{category.label}</span>
                          </div>
                        </div>
                      </div>
                    ))}

                    {categoryTopics.length > 10 && (
                      <div className="text-center py-2">
                        <span className="text-xs text-muted-foreground">
                          还有 {categoryTopics.length - 10} 条话题...
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