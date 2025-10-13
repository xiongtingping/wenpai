/**
 * 邀请统计卡片组件
 * @description 显示用户的邀请统计和累计奖励
 */

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { InviteStatsService, type InviteStats } from '@/services/invite/InviteStatsService';
import { Users, Gift, TrendingUp, Clock, RefreshCw } from 'lucide-react';
import { logger } from '@/utils/logger';
import { getErrorMessage } from '@/features/content-adapter/constants/messages';

interface InviteStatsCardProps {
  userId: string;
  onInviteClick?: () => void;
  /** 自动刷新间隔（毫秒），默认5分钟，设为0禁用自动刷新 */
  autoRefreshInterval?: number;
}

export function InviteStatsCard({ userId, onInviteClick, autoRefreshInterval = 5 * 60 * 1000 }: InviteStatsCardProps) {
  const [stats, setStats] = useState<InviteStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadStats = useCallback(async (isManualRefresh = false) => {
    try {
      if (isManualRefresh) {
        setRefreshing(true);
        // 手动刷新时清除缓存
        await InviteStatsService.clearStatsCache(userId);
        logger.info('手动刷新邀请统计', { userId });
      } else {
        setLoading(true);
      }
      setError(null);
      const data = await InviteStatsService.getInviteStats(userId);
      setStats(data);
    } catch (err) {
      logger.error('加载邀请统计失败:', err);
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [userId]);

  // 初始加载
  useEffect(() => {
    loadStats();
  }, [loadStats]);

  // 定期自动刷新
  useEffect(() => {
    if (!autoRefreshInterval || autoRefreshInterval <= 0) {
      return;
    }

    const intervalId = setInterval(() => {
      logger.debug('自动刷新邀请统计', { userId, interval: autoRefreshInterval });
      loadStats();
    }, autoRefreshInterval);

    return () => clearInterval(intervalId);
  }, [loadStats, autoRefreshInterval, userId]);

  const handleManualRefresh = () => {
    loadStats(true);
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-48 mt-2" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !stats) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>邀请统计</CardTitle>
          <CardDescription className="text-red-500">{error || '暂无数据'}</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={loadStats} variant="outline" size="sm">
            重试
          </Button>
        </CardContent>
      </Card>
    );
  }

  const hasInvites = stats.successfulInvites > 0;
  const hasRewards = stats.totalUsageCountRewards > 0 || stats.totalTokenRewards > 0 || stats.totalMemberDaysRewards > 0;

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              我的邀请统计
            </CardTitle>
            <CardDescription className="mt-1">
              邀请好友，共享奖励
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={handleManualRefresh}
              size="sm"
              variant="outline"
              disabled={refreshing}
              className="border-purple-200 dark:border-purple-800"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            </Button>
            {onInviteClick && (
              <Button onClick={onInviteClick} size="sm" className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                <Gift className="h-4 w-4 mr-2" />
                立即邀请
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-6">
        {/* 邀请人数统计 */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="text-center p-4 bg-green-50 dark:bg-green-950 rounded-lg">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {stats.successfulInvites}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              成功邀请
            </div>
          </div>

          <div className="text-center p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {stats.pendingInvites}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              待处理
            </div>
          </div>

          <div className="text-center p-4 bg-purple-50 dark:bg-purple-950 rounded-lg">
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {stats.totalInvites}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              总邀请数
            </div>
          </div>
        </div>

        {/* 累计奖励 */}
        {hasRewards ? (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              <TrendingUp className="h-4 w-4" />
              累计获得奖励
            </div>

            {stats.totalUsageCountRewards > 0 && (
              <div className="flex items-center justify-between p-3 bg-orange-50 dark:bg-orange-950 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="text-2xl">🎯</div>
                  <div>
                    <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      AI使用次数
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      可用于AI内容生成
                    </div>
                  </div>
                </div>
                <div className="text-xl font-bold text-orange-600 dark:text-orange-400">
                  {stats.totalUsageCountRewards} 次
                </div>
              </div>
            )}

            {stats.totalTokenRewards > 0 && (
              <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="text-2xl">💎</div>
                  <div>
                    <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Token奖励
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      可用于高级功能
                    </div>
                  </div>
                </div>
                <div className="text-xl font-bold text-blue-600 dark:text-blue-400">
                  {stats.totalTokenRewards.toLocaleString()}
                </div>
              </div>
            )}

            {stats.totalMemberDaysRewards > 0 && (
              <div className="flex items-center justify-between p-3 bg-purple-50 dark:bg-purple-950 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="text-2xl">👑</div>
                  <div>
                    <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      会员天数
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      享受会员特权
                    </div>
                  </div>
                </div>
                <div className="text-xl font-bold text-purple-600 dark:text-purple-400">
                  {stats.totalMemberDaysRewards} 天
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8 px-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
            <Gift className="h-12 w-12 mx-auto text-gray-400 mb-3" />
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              {hasInvites 
                ? '奖励正在发放中，请稍候...' 
                : '还没有邀请好友？立即邀请获得丰厚奖励！'}
            </p>
            {onInviteClick && !hasInvites && (
              <Button onClick={onInviteClick} size="sm" variant="outline">
                开始邀请
              </Button>
            )}
          </div>
        )}

        {/* 更新时间 */}
        <div className="flex items-center justify-center gap-2 mt-4 text-xs text-gray-500 dark:text-gray-400">
          <Clock className="h-3 w-3" />
          更新于 {new Date(stats.updatedAt).toLocaleString('zh-CN')}
        </div>
      </CardContent>
    </Card>
  );
}

