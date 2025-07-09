import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { UsageStats } from "@/types/subscription";
import { Activity, Zap, Database, Clock, Crown, TrendingUp, Calendar, Clock as ClockIcon } from "lucide-react";

interface UsageStatsProps {
  usageStats: UsageStats;
  planName: string;
  adaptUsageLimit: number;
  tokenLimit: number;
  userType: 'trial' | 'pro' | 'premium';
  onUpgrade?: () => void;
}

/**
 * 使用情况统计组件
 * @description 显示用户的使用情况和剩余配额
 */
export function UsageStatsCard({ usageStats, planName, adaptUsageLimit, tokenLimit, userType, onUpgrade }: UsageStatsProps) {
  const adaptUsagePercentage = adaptUsageLimit > 0 ? (usageStats.adaptUsageUsed / adaptUsageLimit) * 100 : 0;
  const tokenUsagePercentage = (usageStats.tokensUsed / tokenLimit) * 100;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          使用情况统计
        </CardTitle>
        <CardDescription>
          {planName} - 本月使用情况
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* AI内容适配器使用情况 */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-blue-500" />
              <span className="font-medium">AI内容适配器</span>
            </div>
            <Badge variant={adaptUsagePercentage > 80 ? "destructive" : adaptUsagePercentage > 60 ? "secondary" : "default"}>
              {usageStats.adaptUsageUsed}/{adaptUsageLimit > 0 ? adaptUsageLimit : '∞'}
            </Badge>
          </div>
          <div className="space-y-2">
            <Progress 
              value={Math.min(adaptUsagePercentage, 100)} 
              className="h-2"
            />
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>已使用 {usageStats.adaptUsageUsed} 次</span>
              <span>剩余 {usageStats.adaptUsageRemaining} 次</span>
            </div>
          </div>
        </div>

        {/* Token使用情况 */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Database className="h-4 w-4 text-green-500" />
              <span className="font-medium">Token使用量</span>
            </div>
            <Badge variant={tokenUsagePercentage > 80 ? "destructive" : tokenUsagePercentage > 60 ? "secondary" : "default"}>
              {Math.round(tokenUsagePercentage)}%
            </Badge>
          </div>
          <div className="space-y-2">
            <Progress 
              value={Math.min(tokenUsagePercentage, 100)} 
              className="h-2"
            />
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>已使用 {usageStats.tokensUsed.toLocaleString()} tokens</span>
              <span>剩余 {usageStats.tokensRemaining.toLocaleString()} tokens</span>
            </div>
          </div>
        </div>

        {/* 余额继承机制提示 */}
        {(userType === 'pro' || userType === 'premium') && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-2 text-green-800">
              <Crown className="h-4 w-4" />
              <span className="text-sm font-medium">余额继承机制</span>
            </div>
            <p className="text-sm text-green-700 mt-1">
              Token余额不清零，可累积使用
            </p>
          </div>
        )}

        {/* 使用建议 */}
        {adaptUsagePercentage > 80 || tokenUsagePercentage > 80 ? (
          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center gap-2 text-yellow-800">
              <Clock className="h-4 w-4" />
              <span className="text-sm font-medium">使用量较高</span>
            </div>
            <p className="text-sm text-yellow-700 mt-1">
              {adaptUsagePercentage > 80 && tokenUsagePercentage > 80 
                ? "您的使用量即将达到上限，建议升级到更高级的套餐"
                : adaptUsagePercentage > 80
                ? "AI内容适配器使用次数即将用完，建议升级套餐"
                : "Token使用量即将达到上限，建议升级套餐"
              }
            </p>
            {onUpgrade && (
              <Button 
                size="sm" 
                onClick={onUpgrade}
                className="mt-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
              >
                <Crown className="h-3 w-3 mr-1" />
                立即升级
              </Button>
            )}
          </div>
        ) : null}

        {/* 本月统计 */}
        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <div className="flex items-center justify-center gap-1 text-blue-600 mb-1">
              <ClockIcon className="h-4 w-4" />
              <span className="text-sm font-medium">本月已节省</span>
            </div>
            <div className="text-lg font-bold text-blue-800">
              {Math.round(usageStats.adaptUsageUsed * 0.5)} 小时
            </div>
            <div className="text-xs text-blue-600">人工时</div>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <div className="flex items-center justify-center gap-1 text-green-600 mb-1">
              <TrendingUp className="h-4 w-4" />
              <span className="text-sm font-medium">已生成</span>
            </div>
            <div className="text-lg font-bold text-green-800">
              {usageStats.adaptUsageUsed} 份
            </div>
            <div className="text-xs text-green-600">内容</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 