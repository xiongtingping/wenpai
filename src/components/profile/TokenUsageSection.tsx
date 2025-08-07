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
          <button className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-gray-200 hover:bg-gray-300 transition-colors cursor-help">
            <span className="text-xs font-bold text-gray-600">ℹ️</span>
          </button>
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
      <Card className="bg-white/80 backdrop-blur-sm shadow-xl border-0 rounded-2xl overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <Database className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xl font-bold">使用统计</div>
                <div className="text-emerald-100 text-sm font-normal">{planName} - 查看您的使用情况</div>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="bg-white/20 border-white/30 text-white hover:bg-white/30 hover:border-white/50"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-8">
          {loading && !tokenStats ? (
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="w-8 h-8 animate-spin text-emerald-500" />
              <span className="ml-3 text-lg font-medium text-gray-600">加载中...</span>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Token使用量统计卡片 */}
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6 border-2 border-blue-200 shadow-inner">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                      <Zap className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-blue-800 text-lg">Token使用量</h3>
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
                    variant={tokenStats && tokenStats.usagePercentage > 80 ? "destructive" :
                            tokenStats && tokenStats.usagePercentage > 60 ? "secondary" : "default"}
                    className="text-sm font-bold"
                  >
                    {Math.round(tokenStats?.usagePercentage || 0)}%
                  </Badge>
                </div>

                <div className="space-y-4">
                  <Progress
                    value={Math.min(tokenStats?.usagePercentage || 0, 100)}
                    className="h-3 bg-blue-200"
                  />
                  <div className="flex justify-between text-sm font-medium text-blue-700">
                    <span>已使用 {formatNumber(tokenStats?.monthlyUsed || 0)} tokens</span>
                    <span>剩余 {formatNumber(tokenStats?.monthlyRemaining || 0)} tokens</span>
                  </div>
                </div>

                {/* Token继承说明 */}
                <div className="mt-4 bg-blue-100 border-2 border-blue-300 rounded-xl p-4">
                  <div className="flex items-start gap-2">
                    <button className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-blue-500 text-white text-xs font-bold mt-0.5 flex-shrink-0">
                      ℹ️
                    </button>
                    <div className="text-sm text-blue-800">
                      <span className="font-bold">重要说明：</span>
                      tokens在会员有效期内可以继承到下个月续用，不会清零浪费。
                    </div>
                  </div>
                </div>
              </div>

              {/* 使用次数统计卡片 */}
              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-6 border-2 border-green-200 shadow-inner">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                      <Target className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-green-800 text-lg">使用次数</h3>
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
                    variant={usageCountStats && usageCountStats.usagePercentage > 80 ? "destructive" :
                            usageCountStats && usageCountStats.usagePercentage > 60 ? "secondary" : "default"}
                    className="text-sm font-bold"
                  >
                    {userTier === 'premium' || (usageCountStats && usageCountStats.availableUses === -1) ? '无限制' :
                     `${usageCountStats?.usedCount || 0}/${usageCountStats?.availableUses || 0}`}
                  </Badge>
                </div>

                <div className="space-y-4">
                  {userTier !== 'premium' && usageCountStats && usageCountStats.availableUses !== -1 ? (
                    <>
                      <Progress
                        value={Math.min(usageCountStats?.usagePercentage || 0, 100)}
                        className="h-3 bg-green-200"
                      />
                      <div className="flex justify-between text-sm font-medium text-green-700">
                        <span>已使用 {usageCountStats?.usedCount || 0} 次</span>
                        <span>剩余 {usageCountStats?.remainingUses || 0} 次</span>
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-4">
                      <div className="text-2xl font-bold text-green-600 mb-2">∞</div>
                      <div className="text-sm font-medium text-green-700">无限制使用</div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* 升级按钮 */}
            {showUpgradeButton && (
              <div className="mt-8 pt-6 border-t border-gray-200">
                <Button
                  className="w-full h-14 text-white font-bold text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 btn-upgrade-gradient"
                  onClick={handleUpgrade}
                >
                  <Crown className="w-5 h-5 mr-3" />
                  解锁高级功能
                </Button>
              </div>
            )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default TokenUsageSection;
