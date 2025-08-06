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
          <Info className="w-4 h-4 text-gray-400 hover:text-gray-600 cursor-help" />
        </TooltipTrigger>
        <TooltipContent className="max-w-xs">
          <div className="space-y-2">
            <div className="font-medium">{title}</div>
            <ul className="text-sm space-y-1">
              {content.map((item, index) => (
                <li key={index} className="flex items-start gap-1">
                  <span className="text-blue-500 mt-1">•</span>
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
  className = ''
}: TokenUsageSectionProps) {
  const {
    tokenStats,
    usageCountStats,
    extendedStats,
    loading,
    error,
    refreshStats
  } = useUnifiedUsageStats();

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
    <div className={`space-y-6 ${className}`}>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Database className="w-5 h-5" />
                使用统计
              </CardTitle>
              <CardDescription>
                {planName} - 查看您的使用情况
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isRefreshing}
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {loading && !tokenStats ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="w-6 h-6 animate-spin" />
              <span className="ml-2">加载中...</span>
            </div>
          ) : (
            <>
              {/* Token使用进度 */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-blue-500" />
                    <span className="font-medium">Token使用量</span>
                    <InfoTooltip 
                      title="Token统计说明"
                      content={[
                        "统计范围：包含所有AI功能模块的输入+输出token",
                        "计算方式：中文字符按1.5个token，英文单词按1个token计算",
                        "重置周期：每月1日自动重置使用量"
                      ]}
                    />
                  </div>
                  <Badge 
                    variant={tokenStats && tokenStats.usagePercentage > 80 ? "destructive" : 
                            tokenStats && tokenStats.usagePercentage > 60 ? "secondary" : "default"}
                  >
                    {Math.round(tokenStats?.usagePercentage || 0)}%
                  </Badge>
                </div>
                <div className="space-y-2">
                  <Progress 
                    value={Math.min(tokenStats?.usagePercentage || 0, 100)} 
                    className="h-2"
                  />
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>已使用 {formatNumber(tokenStats?.monthlyUsed || 0)} tokens</span>
                    <span>剩余 {formatNumber(tokenStats?.monthlyRemaining || 0)} tokens</span>
                  </div>
                </div>

                {/* Token继承说明 */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <div className="flex items-start gap-2">
                    <Info className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div className="text-sm text-blue-700">
                      <span className="font-medium">重要说明：</span>
                      tokens在会员有效期内可以继承到下个月续用，不会清零浪费。
                    </div>
                  </div>
                </div>
              </div>

              {/* 使用次数进度 */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Target className="w-4 h-4 text-green-500" />
                    <span className="font-medium">使用次数</span>
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
                  <Badge 
                    variant={usageCountStats.usagePercentage > 80 ? "destructive" : 
                            usageCountStats.usagePercentage > 60 ? "secondary" : "default"}
                  >
                    {usageCountStats.availableUses === -1 ? '无限制' : 
                     `${usageCountStats.usedCount}/${usageCountStats.availableUses}`}
                  </Badge>
                </div>
                {usageCountStats.availableUses !== -1 && (
                  <div className="space-y-2">
                    <Progress 
                      value={Math.min(usageCountStats.usagePercentage, 100)} 
                      className="h-2"
                    />
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>已使用 {usageCountStats.usedCount} 次</span>
                      <span>剩余 {usageCountStats.remainingUses} 次</span>
                    </div>
                  </div>
                )}
              </div>

              {/* 统计数据网格 */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gradient-to-br from-purple-100 to-pink-100 p-4 rounded-lg text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Timer className="w-4 h-4 text-purple-600" />
                    <span className="text-sm text-purple-600">时间节省</span>
                  </div>
                  <div className="text-2xl font-bold text-purple-600">{extendedStats.timeSaved}</div>
                  <div className="text-sm text-purple-600">分钟</div>
                </div>
                <div className="bg-gradient-to-br from-green-100 to-emerald-100 p-4 rounded-lg text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <FileText className="w-4 h-4 text-green-600" />
                    <span className="text-sm text-green-600">内容生成</span>
                  </div>
                  <div className="text-2xl font-bold text-green-600">{extendedStats.contentGenerated}</div>
                  <div className="text-sm text-green-600">篇</div>
                </div>
              </div>

              {/* 升级按钮 */}
              {showUpgradeButton && (
                <Button 
                  className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white"
                  onClick={handleUpgrade}
                >
                  <Crown className="w-4 h-4 mr-2" />
                  解锁高级功能
                </Button>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default TokenUsageSection;
