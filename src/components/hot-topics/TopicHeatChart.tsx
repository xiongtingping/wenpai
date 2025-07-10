/**
 * 话题热度趋势图表组件
 * 显示话题热度变化趋势
 */

import React, { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  Calendar,
  BarChart3,
  Activity
} from 'lucide-react';
import { TopicHeatTrend } from '@/api/topicSubscriptionService';

/**
 * 热度趋势图表组件属性
 */
interface TopicHeatChartProps {
  /** 话题关键词 */
  keyword: string;
  /** 热度趋势数据 */
  trends: TopicHeatTrend[];
  /** 时间范围 */
  timeRange?: '7d' | '30d' | '90d';
  /** 是否加载中 */
  loading?: boolean;
  /** 刷新回调 */
  onRefresh?: () => void;
}

/**
 * 热度趋势图表组件
 */
export const TopicHeatChart: React.FC<TopicHeatChartProps> = ({
  keyword,
  trends,
  timeRange = '7d',
  loading = false,
  onRefresh
}) => {
  // 计算趋势统计
  const stats = useMemo(() => {
    if (trends.length === 0) return null;
    
    const sortedTrends = [...trends].sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    
    const firstHeat = sortedTrends[0].heat;
    const lastHeat = sortedTrends[sortedTrends.length - 1].heat;
    const maxHeat = Math.max(...sortedTrends.map(t => t.heat));
    const minHeat = Math.min(...sortedTrends.map(t => t.heat));
    const avgHeat = Math.round(
      sortedTrends.reduce((sum, t) => sum + t.heat, 0) / sortedTrends.length
    );
    
    const change = lastHeat - firstHeat;
    const changePercent = firstHeat > 0 ? (change / firstHeat) * 100 : 0;
    
    return {
      current: lastHeat,
      change,
      changePercent,
      max: maxHeat,
      min: minHeat,
      average: avgHeat,
      trend: change > 0 ? 'up' : change < 0 ? 'down' : 'stable'
    };
  }, [trends]);

  // 生成图表数据
  const chartData = useMemo(() => {
    return trends.map(trend => ({
      date: new Date(trend.date).toLocaleDateString('zh-CN', { 
        month: 'short', 
        day: 'numeric' 
      }),
      heat: trend.heat,
      mentions: trend.mentions,
      platforms: trend.platforms.length
    }));
  }, [trends]);

  // 获取趋势图标
  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="w-4 h-4 text-green-600" />;
      case 'down':
        return <TrendingDown className="w-4 h-4 text-red-600" />;
      default:
        return <Minus className="w-4 h-4 text-gray-600" />;
    }
  };

  // 获取趋势颜色
  const getTrendColor = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return 'text-green-600';
      case 'down':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  // 生成简单图表
  const renderSimpleChart = () => {
    if (chartData.length === 0) return null;
    
    const maxHeat = Math.max(...chartData.map(d => d.heat));
    const minHeat = Math.min(...chartData.map(d => d.heat));
    const range = maxHeat - minHeat;
    
    return (
      <div className="flex items-end justify-between h-32 mt-4 space-x-1">
        {chartData.map((data, index) => {
          const height = range > 0 ? ((data.heat - minHeat) / range) * 100 : 50;
          const isLatest = index === chartData.length - 1;
          
          return (
            <div key={index} className="flex flex-col items-center flex-1">
              <div 
                className={`w-full rounded-t transition-all duration-300 ${
                  isLatest 
                    ? 'bg-blue-500' 
                    : 'bg-gray-300 hover:bg-gray-400'
                }`}
                style={{ height: `${Math.max(height, 10)}%` }}
                title={`${data.date}: ${data.heat.toLocaleString()}`}
              />
              <span className="text-xs text-gray-500 mt-1 transform rotate-45 origin-left">
                {data.date}
              </span>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-blue-600" />
              热度趋势
            </CardTitle>
            <CardDescription>
              话题"{keyword}"的热度变化趋势
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Select value={timeRange} onValueChange={(value) => console.log(value)}>
              <SelectTrigger className="w-24">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">7天</SelectItem>
                <SelectItem value="30d">30天</SelectItem>
                <SelectItem value="90d">90天</SelectItem>
              </SelectContent>
            </Select>
            {onRefresh && (
              <Button
                variant="outline"
                size="sm"
                onClick={onRefresh}
                disabled={loading}
              >
                <BarChart3 className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : stats ? (
          <div className="space-y-4">
            {/* 统计概览 */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">
                  {stats.current.toLocaleString()}
                </div>
                <div className="text-sm text-gray-500">当前热度</div>
              </div>
              
              <div className="text-center">
                <div className={`text-lg font-semibold flex items-center justify-center gap-1 ${
                  getTrendColor(stats.trend as 'up' | 'down' | 'stable')
                }`}>
                  {getTrendIcon(stats.trend as 'up' | 'down' | 'stable')}
                  {stats.changePercent > 0 ? '+' : ''}{stats.changePercent.toFixed(1)}%
                </div>
                <div className="text-sm text-gray-500">变化趋势</div>
              </div>
              
              <div className="text-center">
                <div className="text-lg font-semibold text-gray-900">
                  {stats.average.toLocaleString()}
                </div>
                <div className="text-sm text-gray-500">平均热度</div>
              </div>
              
              <div className="text-center">
                <div className="text-lg font-semibold text-gray-900">
                  {stats.max.toLocaleString()}
                </div>
                <div className="text-sm text-gray-500">最高热度</div>
              </div>
            </div>

            {/* 趋势图表 */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-medium text-gray-700">热度变化</h4>
                <Badge variant="outline" className="text-xs">
                  {trends.length} 个数据点
                </Badge>
              </div>
              {renderSimpleChart()}
            </div>

            {/* 平台分布 */}
            {trends.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">平台分布</h4>
                <div className="flex flex-wrap gap-2">
                  {Array.from(new Set(trends.flatMap(t => t.platforms))).map(platform => (
                    <Badge key={platform} variant="secondary" className="text-xs">
                      {platform}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <Calendar className="w-12 h-12 mx-auto mb-2 text-gray-300" />
            <p>暂无热度趋势数据</p>
            <p className="text-sm">开始监控话题后即可查看热度变化</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TopicHeatChart; 