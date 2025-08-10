/**
 * 话题分类组件
 * 支持按类别快速查看话题
 */
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  const [activeCategory, setActiveCategory] = useState('all');

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
    { id: 'lifestyle', label: '生活', icon: '🏠' }
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
   * 处理分类切换
   */
  const handleCategoryChange = (category: string) => {
    setActiveCategory(category);
    onCategoryChange(category);
  };

  /**
   * 获取分类统计
   */
  const getCategoryCount = (category: string): number => {
    return getTopicsByCategory(category).length;
  };

  return (
    <div className="mb-6">
      <Tabs value={activeCategory} onValueChange={handleCategoryChange}>
        <TabsList className="grid w-full grid-cols-5 lg:grid-cols-10">
          {categories.map((category) => (
            <TabsTrigger
              key={category.id}
              value={category.id}
              className="flex items-center gap-1 text-xs"
            >
              <span>{category.icon}</span>
              <span className="hidden sm:inline">{category.label}</span>
              <Badge variant="secondary" className="ml-1 text-xs">
                {getCategoryCount(category.id)}
              </Badge>
            </TabsTrigger>
          ))}
        </TabsList>

        {categories.map((category) => (
          <TabsContent key={category.id} value={category.id}>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {getTopicsByCategory(category.id).map((topic, index) => (
                <Card
                  key={`${topic.platform}-${index}`}
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => onTopicClick(topic)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <Badge variant="outline" className="text-xs">
                        {topic.platform}
                      </Badge>
                      <span className="text-xs text-muted-foreground">#{index + 1}</span>
                    </div>
                    <h3 className="font-medium text-sm line-clamp-2 mb-2">
                      {topic.title}
                    </h3>
                    {topic.desc && (
                      <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                        {topic.desc}
                      </p>
                    )}
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">
                        热度: {topic.hot}
                      </span>
                      <Badge variant="secondary" className="text-xs">
                        {category.label}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            {getTopicsByCategory(category.id).length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                该分类下暂无话题
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default TopicCategories; 