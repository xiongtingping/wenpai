/**
 * 订阅瀑布流卡片组件
 * 用于瀑布流布局中显示单个订阅及其监控结果
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import {
  Target,
  ExternalLink,
  Edit,
  Trash2,
  BarChart,
  Eye,
  CheckCircle,
  Clock,
  TrendingUp,
  X
} from 'lucide-react';
import { TopicSubscription, TopicMonitorResult } from '@/api/topicSubscriptionService';

interface SubscriptionMasonryCardProps {
  /** 订阅信息 */
  subscription: TopicSubscription;
  /** 监控结果 */
  monitorResults: TopicMonitorResult[];
  /** 序号 */
  index: number;
  /** 是否正在监控 */
  isMonitoring: boolean;
  /** 编辑回调 */
  onEdit: (subscription: TopicSubscription) => void;
  /** 删除回调 */
  onDelete: (id: string) => void;
  /** 监控回调 */
  onMonitor: (subscription: TopicSubscription) => void;
  /** 趋势分析回调 */
  onTrends: (subscription: TopicSubscription) => void;
  /** 切换状态回调 */
  onToggle: (id: string, isActive: boolean) => void;
  /** 删除监控结果回调 */
  onDeleteResult?: (subscriptionId: string, resultId: string) => void;
  /** 标记为已查看回调 */
  onMarkAsViewed?: (subscriptionId: string) => void;
}

/**
 * 格式化时间显示
 */
const formatTimeAgo = (dateString: string): string => {
  if (!dateString) return '未知时间';

  try {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();

    if (isNaN(diff)) return '未知时间';

    if (diff < 60000) return '刚刚';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}小时前`;
    if (diff < 604800000) return `${Math.floor(diff / 86400000)}天前`;
    return date.toLocaleDateString('zh-CN');
  } catch (error) {
    return '未知时间';
  }
};

/**
 * 订阅瀑布流卡片组件
 */
export const SubscriptionMasonryCard: React.FC<SubscriptionMasonryCardProps> = ({
  subscription,
  monitorResults,
  index,
  isMonitoring,
  onEdit,
  onDelete,
  onMonitor,
  onTrends,
  onToggle,
  onDeleteResult,
  onMarkAsViewed
}) => {
  // 对监控结果按时间倒序排列，然后限制显示数量
  const maxResults = 5;
  const sortedResults = [...monitorResults].sort((a, b) => {
    // 首先按时间排序（最新的在前）
    const timeA = new Date(a.timestamp || a.createdAt || Date.now()).getTime();
    const timeB = new Date(b.timestamp || b.createdAt || Date.now()).getTime();

    if (timeB !== timeA) {
      return timeB - timeA; // 时间倒序
    }

    // 时间相同时按热度排序
    return (parseInt(b.hot as string) || 0) - (parseInt(a.hot as string) || 0);
  });

  const displayResults = sortedResults.slice(0, maxResults);
  const hiddenCount = Math.max(0, sortedResults.length - maxResults);

  // 处理卡片点击，清除红点
  const handleCardClick = () => {
    if (subscription.hasNewResults && onMarkAsViewed) {
      onMarkAsViewed(subscription.id);
    }
  };

  return (
    <Card
      className="break-inside-avoid mb-6 overflow-hidden border-l-4 border-l-primary/60 shadow-sm hover:shadow-md transition-all duration-200 subscription-card masonry-item cursor-pointer"
      onClick={handleCardClick}
    >
      {/* 订阅头部信息 */}
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="relative w-10 h-10 bg-gradient-to-br from-primary/20 to-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
              <Target className="w-5 h-5 text-primary" />
              {/* 红点提示 */}
              {subscription.hasNewResults && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full flex items-center justify-center">
                  {subscription.newResultsCount && subscription.newResultsCount > 0 && subscription.newResultsCount < 10 && (
                    <span className="text-white text-xs font-bold leading-none">
                      {subscription.newResultsCount}
                    </span>
                  )}
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <CardTitle className="text-lg font-semibold text-foreground flex items-center gap-2 mb-1">
                <span className="truncate">{subscription.keyword}</span>
                <Badge variant="outline" className="text-xs flex-shrink-0">
                  #{index + 1}
                </Badge>
                {/* 新结果标识 */}
                {subscription.hasNewResults && (
                  <Badge variant="destructive" className="text-xs flex-shrink-0 animate-pulse">
                    NEW
                  </Badge>
                )}
              </CardTitle>
              {subscription.description && (
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {subscription.description}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* 状态和操作按钮 */}
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/50">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Switch
                checked={subscription.isActive}
                onCheckedChange={(checked) => onToggle(subscription.id, checked)}
                className="h-5 w-9"
              />
              <span className="text-sm font-medium">
                {subscription.isActive ? '运行中' : '已暂停'}
              </span>
            </div>
            {monitorResults.length > 0 && (
              <Badge variant="secondary" className="text-xs">
                {monitorResults.length} 条结果
              </Badge>
            )}
          </div>
          
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onMonitor(subscription)}
              disabled={isMonitoring}
              className="h-8 px-2"
              title="立即检查"
            >
              <Eye className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onTrends(subscription)}
              className="h-8 px-2"
              title="查看趋势"
            >
              <BarChart className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(subscription)}
              className="h-8 px-2"
              title="编辑订阅"
            >
              <Edit className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(subscription.id)}
              className="h-8 px-2 text-destructive hover:text-destructive"
              title="删除订阅"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      {/* 监控结果 */}
      {displayResults.length > 0 && (
        <CardContent className="pt-0">
          <div className="border-t border-border/30 pt-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                最新发现
              </h4>
              <Badge variant="secondary" className="text-xs">
                {new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
              </Badge>
            </div>
            
            <div className="space-y-3">
              {displayResults.map((result, resultIndex) => (
                <div
                  key={`${result.subscriptionId}-${resultIndex}`}
                  className="group p-3 bg-gradient-to-r from-primary/5 to-transparent rounded-lg border border-primary/10 hover:border-primary/20 transition-all duration-200 monitor-result-item cursor-pointer"
                  onClick={() => window.open(result.url, '_blank')}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <h5 className="text-sm font-medium text-foreground line-clamp-2 mb-2 group-hover:text-primary transition-colors">
                        {result.title}
                      </h5>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground mb-2">
                        <div className="flex items-center gap-1">
                          <TrendingUp className="w-3 h-3" />
                          <span>热度: {result.hot || result.heat || 'N/A'}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>{formatTimeAgo(result.timestamp || result.createdAt || result.publishedAt || new Date().toISOString())}</span>
                        </div>
                      </div>
                      {/* 内容预览 */}
                      {result.content && result.content !== result.title && (
                        <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                          {result.content}
                        </p>
                      )}
                    </div>

                    <div className="flex items-start gap-1 flex-shrink-0">
                      <Badge variant="outline" className="text-xs">
                        {result.platform}
                      </Badge>
                      <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 hover:bg-primary/10"
                          onClick={(e) => {
                            e.stopPropagation();
                            window.open(result.url, '_blank');
                          }}
                          title="查看原文"
                        >
                          <ExternalLink className="w-3 h-3" />
                        </Button>
                        {onDeleteResult && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 hover:bg-destructive/10 text-destructive"
                            onClick={(e) => {
                              e.stopPropagation();
                              onDeleteResult(subscription.id, result.id);
                            }}
                            title="删除此结果"
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              {hiddenCount > 0 && (
                <div className="text-center py-2">
                  <p className="text-xs text-muted-foreground">
                    还有 {hiddenCount} 个结果未显示
                  </p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      )}

      {/* 无结果状态 */}
      {displayResults.length === 0 && (
        <CardContent className="pt-0">
          <div className="text-center py-6 border-t border-border/30">
            <div className="w-12 h-12 bg-muted/20 rounded-full flex items-center justify-center mx-auto mb-2">
              <Target className="w-6 h-6 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground">
              暂无监控结果
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              点击检查按钮开始监控
            </p>
          </div>
        </CardContent>
      )}
    </Card>
  );
};

export default SubscriptionMasonryCard;
