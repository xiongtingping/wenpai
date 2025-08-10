/**
 * Token使用量统计组件
 * @description 在个人资料页面显示详细的Token使用统计信息，集成使用次数统计和扩展功能
 */

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { 
  Zap, 
  Crown,
  RefreshCw,
  Info,
  Timer,
  FileText,
  Target,
  Database
} from 'lucide-react';
import { useUnifiedUsageStats } from '@/hooks/useUnifiedUsageStats';
import type { SubscriptionTier } from '@/types/subscription';

/**
 * Token使用量统计组件属性
 */
interface TokenUsageSectionProps {
  /** 用户套餐类型 */
  userTier?: SubscriptionTier;
  /** 是否显示详细信息 */
  showDetails?: boolean;
  /** 自定义类名 */
  className?: string;
  /** 是否显示升级按钮 */
  showUpgradeButton?: boolean;
  /** 外部用户统计数据 */
  externalUserStats?: {
    availableUses: number;
    usedCount: number;
    tokenLimit: number;
    usedTokens: number;
  };
}

/**
 * 格式化数字显示
 */
function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toLocaleString();
}

/**
 * 信息提示组件
 */
function InfoTooltip({ title, content }: { title: string; content: string[] }) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-muted hover:bg-accent transition-colors cursor-help">
            <span className="text-xs font-bold text-muted-foreground">ℹ️</span>
          </button>
        </TooltipTrigger>
        <TooltipContent className="max-w-xs">
          <div className="space-y-2">
            <div className="font-medium">{title}</div>
            <ul className="text-sm space-y-1">
              {content.map((item, index) => (
                <li key={index} className="flex items-start gap-1">
                  <span className="text-primary mt-1">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

/**
 * Token使用量统计组件
 */
export function TokenUsageSection({
  userTier = 'trial',
  showDetails = true,
  showUpgradeButton = true,
  className = '',
  externalUserStats
}: TokenUsageSectionProps) {
  const {
    tokenStats,
    usageCountStats,
    extendedStats,
    loading,
    error,
    refreshStats
  } = useUnifiedUsageStats();

  // 如果有外部数据，使用外部数据覆盖
  const finalUsageCountStats = externalUserStats ? {
    usedCount: externalUserStats.usedCount,
    availableUses: externalUserStats.availableUses,
    remainingUses: externalUserStats.availableUses === -1 ? -1 : externalUserStats.availableUses - externalUserStats.usedCount,
    usagePercentage: externalUserStats.availableUses === -1 ? 0 : (externalUserStats.usedCount / externalUserStats.availableUses) * 100
  } : usageCountStats;

  const finalTokenStats = externalUserStats ? {
    monthlyUsed: externalUserStats.usedTokens,
    monthlyLimit: externalUserStats.tokenLimit,
    monthlyRemaining: externalUserStats.tokenLimit === -1 ? -1 : externalUserStats.tokenLimit - externalUserStats.usedTokens,
    usagePercentage: externalUserStats.tokenLimit === -1 ? 0 : (externalUserStats.usedTokens / externalUserStats.tokenLimit) * 100
  } : tokenStats;

  const [isRefreshing, setIsRefreshing] = useState(false);

  // 获取套餐名称
  const getPlanName = (tier: SubscriptionTier) => {
    switch (tier) {
      case 'trial': return '体验版';
      case 'pro': return '专业版';
      case 'premium': return '高级版';
      default: return '体验版';
    }
  };

  const planName = getPlanName(userTier);

  // 手动刷新数据
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshStats();
    } finally {
      setIsRefreshing(false);
    }
  };

  // 处理升级操作
  const handleUpgrade = () => {
    window.location.href = '/payment';
  };

  return (
    <div className={`${className}`}>
      <Card variant="soft" className="h-full flex flex-col rounded-xl overflow-hidden relative">
        <CardHeader className="bg-gradient-secondary text-foreground relative z-10 rounded-t-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-primary/10 backdrop-blur-sm rounded-lg flex items-center justify-center shadow-e0 border border-border">
                <Database className="w-6 h-6 drop-shadow-sm text-primary" />
              </div>
              <div>
                <div className="text-xl font-bold text-foreground">使用统计</div>
                <div className="text-muted-foreground text-sm font-normal">{planName} - 查看您的使用情况</div>
              </div>
            </div>
            <Button
              variant="soft"
              size="sm"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="bg-card/20 backdrop-blur-sm border-border/30 text-primary-foreground hover:bg-card/30 hover:border-border/50 rounded-lg"
            >
              <RefreshCw className={`w-4 h-4 text-muted-foreground ${isRefreshing ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="flex-1 flex flex-col p-6 relative z-10">
          {loading && !finalTokenStats ? (
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="w-8 h-8 animate-spin text-primary" />
              <span className="ml-3 text-lg font-medium text-foreground">加载中...</span>
            </div>
          ) : (
            <>
              {/* 改为垂直布局：Token使用量和使用次数上下排列 */}
              <div className="flex-1 space-y-4">
                {/* Token使用量统计卡片 */}
                <div className="bg-accent rounded-xl p-5 border border-border shadow-e1 relative overflow-hidden">
                  <div className="flex items-center justify-between mb-4 relative z-10">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center shadow-e0">
                        <Zap className="w-5 h-5 text-primary-foreground drop-shadow-sm" />
                      </div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-foreground text-lg">Token使用量</h3>
                        <InfoTooltip
                          title="Token统计说明"
                          content={[
                            "统计范围：包含所有AI功能模块的输入+输出token",
                            "计算方式：中文字符按1.5个token，英文单词按1个token计算",
                            "重置周期：每月1日自动重置使用量"
                          ]}
                        />
                      </div>
                    </div>
                    <Badge
                      variant={finalTokenStats && finalTokenStats.monthlyLimit === -1 ? "default" :
                              finalTokenStats && finalTokenStats.usagePercentage > 80 ? "destructive" :
                              finalTokenStats && finalTokenStats.usagePercentage > 60 ? "secondary" : "default"}
                      className="text-sm font-bold btn-gradient-primary text-primary-foreground border-0 shadow-lg rounded-xl px-3 py-1"
                    >
                      {finalTokenStats?.monthlyLimit === -1 ? '无限制' : `${Math.round(finalTokenStats?.usagePercentage || 0)}%`}
                    </Badge>
                  </div>

                  <div className="space-y-4 relative z-10">
                    {finalTokenStats?.monthlyLimit === -1 ? (
                      <div className="text-center py-3 bg-accent rounded-xl">
                        <div className="text-2xl font-bold btn-gradient-primary bg-clip-text text-transparent mb-1">∞</div>
                        <div className="text-sm font-medium text-muted-foreground">无限制Token</div>
                      </div>
                    ) : (
                      <>
                        <Progress
                          value={Math.min(finalTokenStats?.usagePercentage || 0, 100)}
                          className="h-3 bg-muted rounded-full shadow-inner"
                        />
                        <div className="flex justify-between text-sm font-medium text-muted-foreground">
                          <span>已使用 {formatNumber(finalTokenStats?.monthlyUsed || 0)} tokens</span>
                          <span>剩余 {formatNumber(finalTokenStats?.monthlyRemaining || 0)} tokens</span>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Token继承说明 */}
                  <div className="mt-3 bg-accent border border-border rounded-lg p-3 relative z-10 shadow-e0">
                    <div className="flex items-start gap-3">
                      <div className="w-5 h-5 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-xs font-bold mt-0.5 flex-shrink-0">
                        ℹ️
                      </div>
                      <div className="text-sm text-foreground">
                        <span className="font-bold">重要说明：</span>
                        tokens在会员有效期内可以继承到下个月续用，不会清零浪费。
                      </div>
                    </div>
                  </div>
                </div>

                {/* 使用次数统计卡片 */}
<div className="bg-accent rounded-xl p-5 border border-border shadow-e1 relative overflow-hidden">
                  <div className="flex items-center justify-between mb-4 relative z-10">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center shadow-e0">
                        <Target className="w-5 h-5 text-primary-foreground drop-shadow-sm" />
                      </div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-foreground text-lg">使用次数</h3>
                        <InfoTooltip
                          title="使用次数说明"
                          content={[
                            "统计规则：主要计算AI内容适配器的调用次数",
                            "计量单位：每次调用AI内容适配器计为1次使用",
                            "重置周期：每月1日自动重置使用次数",
                            "与Token的区别：使用次数按功能计量，Token按文字量计量"
                          ]}
                        />
                      </div>
                    </div>
                    <Badge
                      variant={finalUsageCountStats && finalUsageCountStats.usagePercentage > 80 ? "destructive" :
                              finalUsageCountStats && finalUsageCountStats.usagePercentage > 60 ? "secondary" : "default"}
                      className="text-sm font-bold btn-gradient-primary text-primary-foreground border-0 shadow-lg rounded-xl px-3 py-1"
                    >
                      {userTier === 'premium' || (finalUsageCountStats && finalUsageCountStats.availableUses === -1) ? '无限制' :
                       `${finalUsageCountStats?.usedCount || 0}/${finalUsageCountStats?.availableUses || 0}`}
                    </Badge>
                  </div>

                  <div className="space-y-4 relative z-10">
                    {userTier !== 'premium' && finalUsageCountStats && finalUsageCountStats.availableUses !== -1 ? (
                      <>
                        <Progress
                          value={Math.min(finalUsageCountStats?.usagePercentage || 0, 100)}
                          className="h-3 bg-muted rounded-full shadow-inner"
                        />
                        <div className="flex justify-between text-sm font-medium text-muted-foreground">
                          <span>已使用 {finalUsageCountStats?.usedCount || 0} 次</span>
                          <span>剩余 {finalUsageCountStats?.remainingUses || 0} 次</span>
                        </div>
                      </>
                    ) : (
                      <div className="text-center py-3 bg-accent rounded-xl">
                        <div className="text-2xl font-bold btn-gradient-accent bg-clip-text text-transparent mb-1">∞</div>
                        <div className="text-sm font-medium text-muted-foreground">无限制使用</div>
                      </div>
                    )}
                  </div>
                </div>
              </div>


            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default TokenUsageSection;
