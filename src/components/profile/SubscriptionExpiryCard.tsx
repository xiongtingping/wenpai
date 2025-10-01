/**
 * 订阅有效期统计卡片组件
 * @description 显示订阅的开始、结束时间和剩余天数,支持00:00到期格式
 */

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  Calendar,
  Clock,
  TrendingUp,
  Crown,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Sparkles
} from 'lucide-react';
import { useSubscriptionStatus } from '@/hooks/useSubscriptionStatus';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

/**
 * 格式化日期时间
 * @param date 日期对象或字符串
 * @param includeTime 是否包含时间,默认true显示 00:00
 */
function formatDateTime(date: Date | string | null | undefined, includeTime: boolean = true): string {
  if (!date) return '未设置';

  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;

    if (isNaN(dateObj.getTime())) {
      return '日期无效';
    }

    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const day = String(dateObj.getDate()).padStart(2, '0');

    if (includeTime) {
      // 固定显示 00:00 表示当天结束
      return `${year}-${month}-${day} 00:00`;
    }

    return `${year}-${month}-${day}`;
  } catch (error) {
    console.error('日期格式化失败:', error);
    return '日期错误';
  }
}

/**
 * 计算订阅进度百分比
 */
function calculateProgress(startDate: Date | string | null, endDate: Date | string | null): number {
  if (!startDate || !endDate) return 0;

  try {
    const start = typeof startDate === 'string' ? new Date(startDate) : startDate;
    const end = typeof endDate === 'string' ? new Date(endDate) : endDate;
    const now = new Date();

    const totalDuration = end.getTime() - start.getTime();
    const elapsed = now.getTime() - start.getTime();

    if (totalDuration <= 0) return 0;
    if (elapsed <= 0) return 0;
    if (elapsed >= totalDuration) return 100;

    return Math.round((elapsed / totalDuration) * 100);
  } catch (error) {
    console.error('进度计算失败:', error);
    return 0;
  }
}

/**
 * 获取状态图标
 */
function getStatusIcon(status: string, needsAlert: boolean) {
  if (status === 'active' && !needsAlert) {
    return <CheckCircle2 className="w-5 h-5 text-success" />;
  }
  if (status === 'active' && needsAlert) {
    return <AlertTriangle className="w-5 h-5 text-warning" />;
  }
  if (status === 'expired') {
    return <XCircle className="w-5 h-5 text-destructive" />;
  }
  return <Clock className="w-5 h-5 text-muted-foreground" />;
}

/**
 * 获取剩余天数描述(包含具体日期)
 */
function getDaysRemainingText(daysRemaining: number, status: string, expiresAt: Date | string | null): string {
  // 格式化到期日期
  const dateStr = expiresAt ? formatDateTime(expiresAt, true) : '';

  if (status === 'expired') {
    return dateStr ? `已于 ${dateStr} 过期` : '已过期';
  }
  if (status === 'inactive') {
    return '未激活';
  }
  if (daysRemaining === 0) {
    return dateStr ? `今日到期 (${dateStr})` : '今日到期';
  }
  if (daysRemaining === 1) {
    return dateStr ? `明日到期 (${dateStr})` : '明日到期';
  }
  if (daysRemaining < 0) {
    return dateStr ? `已于 ${dateStr} 过期 (${Math.abs(daysRemaining)} 天前)` : `过期 ${Math.abs(daysRemaining)} 天`;
  }
  return dateStr ? `剩余 ${daysRemaining} 天 (${dateStr} 到期)` : `剩余 ${daysRemaining} 天`;
}

/**
 * 订阅有效期卡片组件
 */
export function SubscriptionExpiryCard() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { primaryStatus, hasActiveSubscription, refresh, loading } = useSubscriptionStatus();
  const [refreshing, setRefreshing] = useState(false);

  // 实时更新倒计时
  const [currentTime, setCurrentTime] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // 每分钟更新一次

    return () => clearInterval(timer);
  }, []);

  // 处理刷新
  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refresh();
    } finally {
      setRefreshing(false);
    }
  };

  // 计算订阅数据
  const subscriptionData = React.useMemo(() => {
    const { status, tier, expiresAt, daysRemaining, needsAlert, statusLabel, statusColor } = primaryStatus;

    // 估算开始时间(如果没有明确的开始时间)
    let startDate: Date | null = null;
    if (expiresAt) {
      const endDate = typeof expiresAt === 'string' ? new Date(expiresAt) : expiresAt;
      // 假设订阅为30天周期
      startDate = new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    const progress = calculateProgress(startDate, expiresAt);
    const daysText = getDaysRemainingText(daysRemaining, status, expiresAt);

    // 订阅等级信息
    const tierInfo = {
      trial: { label: '体验版', color: 'text-gray-600', bgColor: 'bg-gray-100' },
      pro: { label: '专业版', color: 'text-blue-600', bgColor: 'bg-blue-100' },
      premium: { label: '高级版', color: 'text-purple-600', bgColor: 'bg-purple-100' }
    };

    const currentTier = tierInfo[tier as keyof typeof tierInfo] || tierInfo.trial;

    return {
      status,
      tier,
      tierLabel: currentTier.label,
      tierColor: currentTier.color,
      tierBgColor: currentTier.bgColor,
      startDate,
      expiresAt,
      daysRemaining,
      daysText,
      needsAlert,
      statusLabel,
      statusColor,
      progress,
      isActive: status === 'active',
      isExpired: status === 'expired',
      isInactive: status === 'inactive',
    };
  }, [primaryStatus, currentTime]);

  return (
    <Card className="overflow-hidden border-0 shadow-xl bg-gradient-to-br from-card/95 to-card/90 backdrop-blur-xl">
      <div className="relative">
        {/* 卡片装饰 */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/10 to-transparent rounded-full blur-2xl" />

        <CardHeader className="relative z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gradient-to-br from-primary/10 to-accent/10">
                <Calendar className="w-5 h-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg font-semibold">订阅有效期</CardTitle>
                <CardDescription>查看您的订阅状态和有效期信息</CardDescription>
              </div>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleRefresh}
              disabled={refreshing || loading}
              className="group"
            >
              <RefreshCw className={cn(
                "w-4 h-4",
                (refreshing || loading) && "animate-spin"
              )} />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="relative z-10 space-y-6">
          {/* 订阅状态概览 */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-br from-muted/50 to-muted/30 border">
            <div className="flex items-center gap-3">
              {getStatusIcon(subscriptionData.status, subscriptionData.needsAlert)}
              <div>
                <p className="text-sm font-medium text-foreground">
                  {subscriptionData.statusLabel}
                </p>
                <p className="text-xs text-muted-foreground">
                  {subscriptionData.daysText}
                </p>
              </div>
            </div>

            <Badge className={cn(
              "px-3 py-1",
              subscriptionData.tierBgColor,
              subscriptionData.tierColor
            )}>
              <Crown className="w-3 h-3 mr-1" />
              {subscriptionData.tierLabel}
            </Badge>
          </div>

          {/* 订阅时间信息 */}
          {(subscriptionData.isActive || subscriptionData.isExpired) && (
            <div className="space-y-4">
              {/* 开始时间 */}
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">订阅开始</span>
                </div>
                <span className="text-sm font-medium">
                  {formatDateTime(subscriptionData.startDate, false)}
                </span>
              </div>

              {/* 结束时间 */}
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">订阅到期</span>
                </div>
                <span className={cn(
                  "text-sm font-medium",
                  subscriptionData.needsAlert && "text-warning",
                  subscriptionData.isExpired && "text-destructive"
                )}>
                  {formatDateTime(subscriptionData.expiresAt, true)}
                </span>
              </div>

              {/* 进度条 */}
              {subscriptionData.isActive && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>订阅进度</span>
                    <span>{subscriptionData.progress}%</span>
                  </div>
                  <Progress value={subscriptionData.progress} className="h-2" />
                </div>
              )}
            </div>
          )}

          {/* 无订阅提示 */}
          {subscriptionData.isInactive && (
            <div className="p-6 rounded-xl bg-gradient-to-br from-primary/5 to-accent/5 border border-primary/20 text-center space-y-3">
              <Sparkles className="w-8 h-8 mx-auto text-primary/60" />
              <p className="text-sm text-muted-foreground">
                您当前使用的是体验版
              </p>
              <Button
                variant="default"
                size="sm"
                onClick={() => navigate('/payment-center')}
                className="group"
              >
                <Crown className="w-4 h-4 mr-2 group-hover:rotate-12 transition-transform" />
                升级订阅
              </Button>
            </div>
          )}

          {/* 即将到期提示 */}
          {subscriptionData.isActive && subscriptionData.needsAlert && subscriptionData.daysRemaining <= 7 && (
            <div className="p-4 rounded-xl bg-warning/10 border border-warning/20">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
                <div className="flex-1 space-y-2">
                  <p className="text-sm font-medium text-foreground">
                    订阅即将到期
                  </p>
                  <p className="text-xs text-muted-foreground">
                    您的{subscriptionData.tierLabel}订阅将在 {formatDateTime(subscriptionData.expiresAt, true)} 到期,
                    为避免服务中断,请及时续费。
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate('/payment-center')}
                    className="mt-2"
                  >
                    立即续费
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* 已过期提示 */}
          {subscriptionData.isExpired && (
            <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20">
              <div className="flex items-start gap-3">
                <XCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                <div className="flex-1 space-y-2">
                  <p className="text-sm font-medium text-foreground">
                    订阅已过期
                  </p>
                  <p className="text-xs text-muted-foreground">
                    您的订阅已于 {formatDateTime(subscriptionData.expiresAt, true)} 过期,
                    部分高级功能已停用。
                  </p>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => navigate('/payment-center')}
                    className="mt-2"
                  >
                    重新订阅
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </div>
    </Card>
  );
}

export default SubscriptionExpiryCard;
