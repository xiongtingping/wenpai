/**
 * 优化的使用统计显示组件
 *
 * 优化点：
 * 1. 初次加载显示skeleton而不是错误状态
 * 2. 数据更新时平滑过渡，不闪烁
 * 3. 使用stale-while-revalidate缓存策略
 * 4. 版本号控制防止旧数据覆盖新数据
 * 5. 防抖/节流控制频繁更新
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Zap, RefreshCw, Crown, AlertCircle, Loader2 } from 'lucide-react';
import { useOptimizedUsageStats } from '@/hooks/useOptimizedUsageStats';
import { UsageStatsCardSkeleton } from './UsageStatsSkeleton';
import type { SubscriptionTier } from '@/types/subscription';
import {
  formatRemainingUses,
  formatUsageDisplay,
  getUsageStatusColor,
  getProgressBarColor,
  formatTierName
} from '@/utils/usageDisplayUtils';

interface OptimizedUsageDisplayProps {
  /** 用户套餐 */
  userTier?: SubscriptionTier;
  /** 是否显示详细信息 */
  showDetails?: boolean;
  /** 是否显示刷新按钮 */
  showRefreshButton?: boolean;
  /** 自定义类名 */
  className?: string;
  /** 点击升级按钮的回调 */
  onUpgrade?: () => void;
}

/**
 * 优化的使用次数显示组件
 */
export function OptimizedUsageDisplay({
  userTier,
  showDetails = true,
  showRefreshButton = true,
  className = '',
  onUpgrade
}: OptimizedUsageDisplayProps) {
  const {
    tokenStats,
    usageCountStats,
    extendedStats,
    userTier: computedTier,
    isInitialLoading,
    isRefreshing,
    isStale,
    error,
    lastUpdated,
    subscriptionInitializing,
    refresh
  } = useOptimizedUsageStats(userTier);

  const effectiveTier = userTier || computedTier;

  // 1️⃣ 🔧 等待订阅状态初始化完成：显示骨架屏
  // 确保 subscriptionStore.initialized === true 才渲染真实内容
  if (subscriptionInitializing) {
    return <UsageStatsCardSkeleton showDetails={showDetails} className={className} />;
  }

  // 2️⃣ 首次加载：显示骨架屏
  if (isInitialLoading && !usageCountStats) {
    return <UsageStatsCardSkeleton showDetails={showDetails} className={className} />;
  }

  // 3️⃣ 加载错误：显示友好的错误提示（不是直接显示错误状态）
  if (error && !usageCountStats) {
    return (
      <Card className={`bg-card border-border ${className}`}>
        <CardContent className="flex flex-col items-center justify-center py-8 space-y-4">
          <AlertCircle className="h-12 w-12 text-muted-foreground" />
          <div className="text-center space-y-2">
            <p className="text-sm font-medium text-foreground">暂时无法加载使用统计</p>
            <p className="text-xs text-muted-foreground">
              {error.message || '请稍后重试'}
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={refresh}>
            <RefreshCw className="h-4 w-4 mr-2" />
            重试
          </Button>
        </CardContent>
      </Card>
    );
  }

  // 4️⃣ 正常显示：展示数据（即使是缓存数据）
  const usageStatusColor = getUsageStatusColor(
    usageCountStats.usagePercentage,
    effectiveTier
  );
  const progressColor = getProgressBarColor(
    usageCountStats.usagePercentage,
    effectiveTier
  );

  return (
    <Card className={`bg-card border-border transition-all duration-300 ${className} ${isStale ? 'opacity-90' : 'opacity-100'}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            <CardTitle className="text-base">使用统计</CardTitle>
            {isStale && (
              <Badge variant="outline" className="text-xs">
                缓存
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* 显示后台刷新状态 */}
            {isRefreshing && (
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            )}

            {/* 刷新按钮 */}
            {showRefreshButton && (
              <Button
                variant="ghost"
                size="sm"
                onClick={refresh}
                disabled={isRefreshing}
                className="h-8 w-8 p-0"
              >
                <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              </Button>
            )}

            {/* 套餐徽章 */}
            <Badge variant="secondary" className="text-xs">
              {formatTierName(effectiveTier)}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* 使用次数进度 */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">本月使用</span>
            <span className={`font-medium ${usageStatusColor}`}>
              {formatUsageDisplay(
                usageCountStats.usedCount,
                usageCountStats.availableUses,
                effectiveTier
              )}
            </span>
          </div>

          <Progress
            value={usageCountStats.usagePercentage}
            className="h-2"
            indicatorClassName={progressColor}
          />

          <div className="flex justify-between text-xs text-muted-foreground">
            <span>已用 {usageCountStats.usedCount} 次</span>
            <span>
              剩余 {formatRemainingUses(usageCountStats.remainingUses, effectiveTier)}
            </span>
          </div>
        </div>

        {/* Token统计 */}
        {tokenStats && showDetails && (
          <div className="pt-2 border-t border-border">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Token用量</span>
              <span className="font-medium text-foreground">
                {tokenStats.monthlyUsed.toLocaleString()} / {tokenStats.monthlyLimit.toLocaleString()}
              </span>
            </div>
            <Progress
              value={(tokenStats.monthlyUsed / tokenStats.monthlyLimit) * 100}
              className="h-1.5 mt-2"
              indicatorClassName="bg-primary"
            />
          </div>
        )}

        {/* 扩展统计 */}
        {showDetails && (
          <div className="grid grid-cols-2 gap-4 pt-2 border-t border-border">
            <div>
              <div className="text-xs text-muted-foreground">节省时间</div>
              <div className="text-sm font-medium text-foreground mt-1">
                {extendedStats.timeSaved} 分钟
              </div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">生成内容</div>
              <div className="text-sm font-medium text-foreground mt-1">
                {extendedStats.contentGenerated} 个
              </div>
            </div>
          </div>
        )}

        {/* 升级按钮 */}
        {effectiveTier === 'trial' && onUpgrade && (
          <Button
            variant="default"
            size="sm"
            className="w-full mt-2"
            onClick={onUpgrade}
          >
            <Crown className="h-4 w-4 mr-2" />
            升级套餐
          </Button>
        )}

        {/* 最后更新时间 */}
        {lastUpdated && showDetails && (
          <div className="text-xs text-muted-foreground text-center pt-2 border-t border-border">
            最后更新: {new Date(lastUpdated).toLocaleTimeString('zh-CN')}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/**
 * 内联使用次数显示（紧凑版）
 */
export function OptimizedUsageCountInline({
  userTier,
  className = ''
}: {
  userTier?: SubscriptionTier;
  className?: string;
}) {
  const {
    usageCountStats,
    userTier: computedTier,
    isInitialLoading,
    isRefreshing,
    subscriptionInitializing
  } = useOptimizedUsageStats(userTier);

  const effectiveTier = userTier || computedTier;

  // 🔧 等待订阅状态初始化完成
  if (subscriptionInitializing || isInitialLoading) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <div className="h-4 w-4 rounded bg-muted animate-pulse" />
        <div className="h-4 w-24 rounded bg-muted animate-pulse" />
      </div>
    );
  }

  const usageStatusColor = getUsageStatusColor(
    usageCountStats.usagePercentage,
    effectiveTier
  );

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {isRefreshing && <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />}
      <Zap className="h-4 w-4 text-primary" />
      <span className="text-sm text-muted-foreground">使用次数:</span>
      <Badge variant="secondary" className={`text-xs ${usageStatusColor}`}>
        {formatUsageDisplay(
          usageCountStats.usedCount,
          usageCountStats.availableUses,
          effectiveTier
        )}
      </Badge>
    </div>
  );
}

export default OptimizedUsageDisplay;
