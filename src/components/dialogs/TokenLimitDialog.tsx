/**
 * Token限额提醒对话框
 * @description 当用户Token使用量接近或超过限额时显示的提醒对话框
 */

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  AlertTriangle, 
  Crown, 
  Zap, 
  TrendingUp,
  Clock,
  Gift
} from 'lucide-react';
import type { TokenUsageStats } from '@/services/tokenUsageService';
import type { SubscriptionTier } from '@/types/subscription';

/**
 * Token限额对话框属性
 */
interface TokenLimitDialogProps {
  /** 是否显示对话框 */
  open: boolean;
  /** 关闭对话框回调 */
  onClose: () => void;
  /** Token使用统计 */
  stats: TokenUsageStats;
  /** 限制类型 */
  limitType: 'warning' | 'exceeded' | 'approaching';
  /** 升级回调 */
  onUpgrade?: () => void;
  /** 继续使用回调（仅在warning时可用） */
  onContinue?: () => void;
}

/**
 * 获取限制类型的配置
 */
function getLimitConfig(limitType: TokenLimitDialogProps['limitType']) {
  switch (limitType) {
    case 'exceeded':
      return {
        title: 'Token额度已用完',
        description: '您已达到当前套餐的Token上限，无法继续使用AI功能',
        icon: AlertTriangle,
        iconColor: 'text-red-500',
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200',
        showContinue: false
      };
    case 'approaching':
      return {
        title: 'Token额度即将用完',
        description: '您的Token使用量已超过90%，建议升级套餐',
        icon: AlertTriangle,
        iconColor: 'text-orange-500',
        bgColor: 'bg-orange-50',
        borderColor: 'border-orange-200',
        showContinue: true
      };
    case 'warning':
    default:
      return {
        title: 'Token使用量较高',
        description: '您的Token使用量已超过80%，建议关注剩余额度',
        icon: TrendingUp,
        iconColor: 'text-yellow-500',
        bgColor: 'bg-yellow-50',
        borderColor: 'border-yellow-200',
        showContinue: true
      };
  }
}

/**
 * 获取套餐升级建议
 */
function getUpgradeRecommendation(currentTier: SubscriptionTier) {
  switch (currentTier) {
    case 'trial':
      return {
        targetTier: '专业版',
        benefits: ['20万Token/月', '高级AI模型', '创意魔方功能'],
        price: '¥29/月'
      };
    case 'pro':
      return {
        targetTier: '高级版',
        benefits: ['50万Token/月', '不限次数使用', '品牌库功能'],
        price: '¥79/月'
      };
    default:
      return {
        targetTier: '高级版',
        benefits: ['50万Token/月', '不限次数使用', '品牌库功能'],
        price: '¥79/月'
      };
  }
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
 * Token限额提醒对话框组件
 */
export function TokenLimitDialog({
  open,
  onClose,
  stats,
  limitType,
  onUpgrade,
  onContinue
}: TokenLimitDialogProps) {
  const config = getLimitConfig(limitType);
  const upgrade = getUpgradeRecommendation(stats.userTier);
  const IconComponent = config.icon;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className={`mx-auto w-12 h-12 rounded-full ${config.bgColor} ${config.borderColor} border-2 flex items-center justify-center mb-4`}>
            <IconComponent className={`w-6 h-6 ${config.iconColor}`} />
          </div>
          <DialogTitle className="text-center">
            {config.title}
          </DialogTitle>
          <DialogDescription className="text-center">
            {config.description}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Token使用情况 */}
          <div className={`p-4 rounded-lg ${config.bgColor} ${config.borderColor} border`}>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-blue-500" />
                  <span className="font-medium">Token使用情况</span>
                </div>
                <Badge variant={stats.usagePercentage > 90 ? "destructive" : "secondary"}>
                  {Math.round(stats.usagePercentage)}%
                </Badge>
              </div>
              <Progress 
                value={Math.min(stats.usagePercentage, 100)} 
                className="h-2"
              />
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>已使用 {formatNumber(stats.monthlyUsed)}</span>
                <span>限额 {formatNumber(stats.monthlyLimit)}</span>
              </div>
            </div>
          </div>

          {/* 升级建议 */}
          <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Crown className="w-4 h-4 text-purple-600" />
                <span className="font-medium text-purple-800">升级到{upgrade.targetTier}</span>
                <Badge variant="outline" className="text-purple-600 border-purple-300">
                  {upgrade.price}
                </Badge>
              </div>
              <ul className="space-y-1 text-sm text-purple-700">
                {upgrade.benefits.map((benefit, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <Gift className="w-3 h-3" />
                    {benefit}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* 使用建议 */}
          <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-start gap-2">
              <Clock className="w-4 h-4 text-blue-500 mt-0.5" />
              <div className="text-sm text-blue-700">
                <div className="font-medium mb-1">使用建议</div>
                <ul className="space-y-1 text-xs">
                  <li>• 优化提示词长度，减少不必要的描述</li>
                  <li>• 选择合适的AI模型，避免过度使用高级模型</li>
                  <li>• 批量处理相似任务，提高效率</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          {config.showContinue && onContinue && (
            <Button variant="outline" onClick={onContinue} className="w-full sm:w-auto">
              继续使用
            </Button>
          )}
          {onUpgrade && (
            <Button 
              onClick={onUpgrade}
              className="w-full sm:w-auto bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
            >
              <Crown className="w-4 h-4 mr-2" />
              立即升级
            </Button>
          )}
          <Button variant="ghost" onClick={onClose} className="w-full sm:w-auto">
            稍后处理
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default TokenLimitDialog;
