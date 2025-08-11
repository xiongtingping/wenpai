/**
 * 订阅瀑布流容器组件
 * 使用瀑布流布局展示所有订阅卡片
 */

import React from 'react';
import Masonry from 'react-masonry-css';
import { SubscriptionMasonryCard } from './SubscriptionMasonryCard';
import { TopicSubscription, TopicMonitorResult } from '@/api/topicSubscriptionService';

interface SubscriptionMasonryProps {
  /** 订阅列表 */
  subscriptions: TopicSubscription[];
  /** 监控结果映射 */
  monitorResults: Record<string, TopicMonitorResult[]>;
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
  /** 标记为已查看回调 */
  onMarkAsViewed?: (subscriptionId: string) => void;
}

/**
 * 瀑布流断点配置
 * 根据屏幕宽度确定列数
 */
const breakpointColumnsObj = {
  default: 3,  // 默认3列
  1280: 3,     // xl: 3列
  1024: 2,     // lg: 2列
  768: 2,      // md: 2列
  640: 1,      // sm: 1列
  480: 1       // xs: 1列
};

/**
 * 订阅瀑布流容器组件
 */
export const SubscriptionMasonry: React.FC<SubscriptionMasonryProps> = ({
  subscriptions,
  monitorResults,
  isMonitoring,
  onEdit,
  onDelete,
  onMonitor,
  onTrends,
  onToggle,
  onMarkAsViewed
}) => {
  // 如果没有订阅，显示空状态
  if (subscriptions.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-muted/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-foreground mb-2">暂无话题订阅</h3>
        <p className="text-muted-foreground mb-4">
          创建您的第一个话题订阅，开始监控感兴趣的内容
        </p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <Masonry
        breakpointCols={breakpointColumnsObj}
        className="masonry-grid"
        columnClassName="masonry-grid-column"
      >
        {subscriptions.map((subscription, index) => (
          <SubscriptionMasonryCard
            key={subscription.id}
            subscription={subscription}
            monitorResults={monitorResults[subscription.id] || []}
            index={index}
            isMonitoring={isMonitoring}
            onEdit={onEdit}
            onDelete={onDelete}
            onMonitor={onMonitor}
            onTrends={onTrends}
            onToggle={onToggle}
            onMarkAsViewed={onMarkAsViewed}
          />
        ))}
      </Masonry>
    </div>
  );
};

export default SubscriptionMasonry;
