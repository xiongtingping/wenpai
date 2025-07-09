/**
 * 营销日历组件
 * 基于农历信息提供营销建议
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, ChevronLeft, ChevronRight, Star, TrendingUp, Gift, Heart, Zap } from 'lucide-react';

/**
 * 营销建议接口
 */
interface MarketingSuggestion {
  type: 'festival' | 'seasonal' | 'general';
  title: string;
  description: string;
  tags: string[];
  priority: 'high' | 'medium' | 'low';
}

/**
 * 营销日历组件
 * @returns React 组件
 */
export default function MarketingCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [suggestions, setSuggestions] = useState<MarketingSuggestion[]>([]);

  /**
   * 生成营销建议
   */
  useEffect(() => {
    generateSuggestions();
  }, [currentDate]);

  /**
   * 生成营销建议
   */
  const generateSuggestions = () => {
    const newSuggestions: MarketingSuggestion[] = [];
    
    // 获取日期信息
    const solarMonth = currentDate.getMonth() + 1;
    const solarDay = currentDate.getDate();
    const weekDay = currentDate.getDay();
    
    // 传统节日
    const festivals = getFestivals(solarMonth, solarDay);
    festivals.forEach(festival => {
      newSuggestions.push({
        type: 'festival',
        title: festival.name,
        description: festival.description,
        tags: festival.tags,
        priority: 'high'
      });
    });

    // 季节性营销
    const seasonalSuggestions = getSeasonalSuggestions(solarMonth);
    newSuggestions.push(...seasonalSuggestions);

    // 通用营销建议
    const generalSuggestions = getGeneralSuggestions(weekDay, solarDay);
    newSuggestions.push(...generalSuggestions);

    setSuggestions(newSuggestions);
  };

  /**
   * 获取传统节日信息
   */
  const getFestivals = (solarMonth: number, solarDay: number) => {
    const festivals = [];

    // 西方节日
    if (solarMonth === 12 && solarDay === 25) {
      festivals.push({
        name: '圣诞节',
        description: '圣诞节，适合推出节日主题营销活动',
        tags: ['圣诞', '礼物', '节日', '温暖']
      });
    }

    if (solarMonth === 2 && solarDay === 14) {
      festivals.push({
        name: '情人节',
        description: '情人节，适合推出爱情主题营销活动',
        tags: ['情人节', '爱情', '浪漫', '礼物']
      });
    }

    if (solarMonth === 1 && solarDay === 1) {
      festivals.push({
        name: '元旦',
        description: '新年第一天，适合推出新年主题营销活动',
        tags: ['新年', '元旦', '祝福', '新开始']
      });
    }

    if (solarMonth === 5 && solarDay === 1) {
      festivals.push({
        name: '劳动节',
        description: '劳动节，适合推出劳动者主题营销活动',
        tags: ['劳动节', '劳动者', '致敬', '感恩']
      });
    }

    if (solarMonth === 10 && solarDay === 1) {
      festivals.push({
        name: '国庆节',
        description: '国庆节，适合推出爱国主题营销活动',
        tags: ['国庆', '爱国', '庆祝', '自豪']
      });
    }

    return festivals;
  };

  /**
   * 获取季节性营销建议
   */
  const getSeasonalSuggestions = (month: number) => {
    const suggestions: MarketingSuggestion[] = [];

    if (month >= 3 && month <= 5) {
      suggestions.push({
        type: 'seasonal',
        title: '春季营销',
        description: '春季是万物复苏的季节，适合推出新品、户外活动等主题',
        tags: ['春季', '新品', '户外', '生机'],
        priority: 'medium'
      });
    } else if (month >= 6 && month <= 8) {
      suggestions.push({
        type: 'seasonal',
        title: '夏季营销',
        description: '夏季炎热，适合推出清凉、防晒、度假等主题',
        tags: ['夏季', '清凉', '防晒', '度假'],
        priority: 'medium'
      });
    } else if (month >= 9 && month <= 11) {
      suggestions.push({
        type: 'seasonal',
        title: '秋季营销',
        description: '秋季收获季节，适合推出丰收、感恩、温暖等主题',
        tags: ['秋季', '丰收', '感恩', '温暖'],
        priority: 'medium'
      });
    } else {
      suggestions.push({
        type: 'seasonal',
        title: '冬季营销',
        description: '冬季寒冷，适合推出保暖、温馨、团圆等主题',
        tags: ['冬季', '保暖', '温馨', '团圆'],
        priority: 'medium'
      });
    }

    return suggestions;
  };

  /**
   * 获取通用营销建议
   */
  const getGeneralSuggestions = (weekDay: number, day: number) => {
    const suggestions: MarketingSuggestion[] = [];

    // 周末营销
    if (weekDay === 0 || weekDay === 6) {
      suggestions.push({
        type: 'general',
        title: '周末营销',
        description: '周末是用户活跃高峰期，适合推出休闲娱乐主题内容',
        tags: ['周末', '休闲', '娱乐', '放松'],
        priority: 'medium'
      });
    }

    // 月初营销
    if (day <= 3) {
      suggestions.push({
        type: 'general',
        title: '月初营销',
        description: '月初用户消费意愿较强，适合推出新品或优惠活动',
        tags: ['月初', '新品', '优惠', '消费'],
        priority: 'medium'
      });
    }

    // 月中营销
    if (day >= 10 && day <= 20) {
      suggestions.push({
        type: 'general',
        title: '月中营销',
        description: '月中是内容创作的好时机，适合推出深度内容',
        tags: ['月中', '深度', '内容', '创作'],
        priority: 'low'
      });
    }

    return suggestions;
  };

  /**
   * 切换日期
   */
  const changeDate = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (direction === 'prev') {
      newDate.setDate(newDate.getDate() - 1);
    } else {
      newDate.setDate(newDate.getDate() + 1);
    }
    setCurrentDate(newDate);
  };

  /**
   * 获取优先级图标
   */
  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high':
        return <Star className="w-4 h-4 text-red-500" />;
      case 'medium':
        return <TrendingUp className="w-4 h-4 text-yellow-500" />;
      case 'low':
        return <Zap className="w-4 h-4 text-blue-500" />;
      default:
        return <Star className="w-4 h-4 text-gray-500" />;
    }
  };

  /**
   * 获取类型图标
   */
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'festival':
        return <Gift className="w-4 h-4 text-red-500" />;
      case 'seasonal':
        return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'general':
        return <Heart className="w-4 h-4 text-blue-500" />;
      default:
        return <Calendar className="w-4 h-4 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* 日期导航 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            营销日历
          </CardTitle>
          <CardDescription>
            基于日期信息提供营销建议，帮助您选择最佳营销时机
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => changeDate('prev')}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            
            <div className="text-center">
              <div className="text-lg font-semibold">
                {currentDate.toLocaleDateString('zh-CN', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </div>
              <div className="text-sm text-gray-500">
                {currentDate.toLocaleDateString('zh-CN', { 
                  weekday: 'long' 
                })}
              </div>
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => changeDate('next')}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>

          {/* 日期信息 */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-sm text-gray-600">月份</div>
              <div className="font-semibold">{currentDate.getMonth() + 1}月</div>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="text-sm text-gray-600">日期</div>
              <div className="font-semibold">{currentDate.getDate()}日</div>
            </div>
            <div className="text-center p-3 bg-purple-50 rounded-lg">
              <div className="text-sm text-gray-600">星期</div>
              <div className="font-semibold">{currentDate.toLocaleDateString('zh-CN', { weekday: 'short' })}</div>
            </div>
            <div className="text-center p-3 bg-orange-50 rounded-lg">
              <div className="text-sm text-gray-600">季度</div>
              <div className="font-semibold">Q{Math.ceil((currentDate.getMonth() + 1) / 3)}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 营销建议 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            营销建议
          </CardTitle>
          <CardDescription>
            基于当前日期的营销机会和建议
          </CardDescription>
        </CardHeader>
        <CardContent>
          {suggestions.length > 0 ? (
            <div className="space-y-4">
              {suggestions.map((suggestion, index) => (
                <div
                  key={index}
                  className="p-4 border rounded-lg hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {getTypeIcon(suggestion.type)}
                      <h4 className="font-semibold">{suggestion.title}</h4>
                      {getPriorityIcon(suggestion.priority)}
                    </div>
                    <Badge 
                      variant={suggestion.priority === 'high' ? 'destructive' : 
                              suggestion.priority === 'medium' ? 'default' : 'secondary'}
                    >
                      {suggestion.priority === 'high' ? '高优先级' : 
                       suggestion.priority === 'medium' ? '中优先级' : '低优先级'}
                    </Badge>
                  </div>
                  <p className="text-gray-600 mb-3">{suggestion.description}</p>
                  <div className="flex flex-wrap gap-1">
                    {suggestion.tags.map((tag, tagIndex) => (
                      <Badge key={tagIndex} variant="outline" className="text-xs">
                        #{tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>当前日期暂无特殊营销建议</p>
              <p className="text-sm">可以尝试选择其他日期查看</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 快速跳转 */}
      <Card>
        <CardHeader>
          <CardTitle>快速跳转</CardTitle>
          <CardDescription>跳转到重要节日和营销节点</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {[
              { name: '元旦', date: '2024-01-01' },
              { name: '情人节', date: '2024-02-14' },
              { name: '劳动节', date: '2024-05-01' },
              { name: '国庆节', date: '2024-10-01' },
              { name: '圣诞节', date: '2024-12-25' },
              { name: '今天', date: new Date().toISOString().split('T')[0] }
            ].map((item, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                onClick={() => setCurrentDate(new Date(item.date))}
                className="text-xs"
              >
                {item.name}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 