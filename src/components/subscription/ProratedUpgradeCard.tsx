/**
 * 补差价升级卡片组件
 * @description 显示补差价升级计算结果和操作按钮
 */

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useSubscriptionStatus } from '@/hooks/useSubscriptionStatus';
import { useAuth } from '@/hooks/useAuth';
import { 
  TrendingUp, 
  Calculator, 
  Calendar,
  CreditCard,
  ArrowRight,
  CheckCircle,
  Info
} from 'lucide-react';
import { logger } from '@/utils/logger';

interface ProratedUpgradeCardProps {
  /** 目标订阅类型 */
  targetTier: 'professional' | 'premium';
  /** 目标订阅周期 */
  targetPeriod: 'monthly' | 'yearly';
  /** 点击升级回调 */
  onUpgrade: (calculation: any) => void;
  /** 自定义样式 */
  className?: string;
}

export function ProratedUpgradeCard({ targetTier,
  targetPeriod,
  onUpgrade,
  className = ''
 }: ProratedUpgradeCardProps) {
  const { primaryStatus, hasActiveSubscription } = useSubscriptionStatus();
  const { user } = useAuth();
  const [calculation, setCalculation] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * 计算补差价
   */
  const calculateUpgrade = async (userId: string) => {
    if (!userId) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/.netlify/functions/prorated-upgrade', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId,
          targetTier,
          targetPeriod
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(t('components.errors.计算升级费用失败'));
      }

      setCalculation(data.calculation);
      logger.info('补差价计算成功:', data.calculation);

    } catch (error) {
      logger.error('计算补差价失败:', error);
      setError(error instanceof Error ? error.message : t('components.errors.计算失败'));
    } finally {
      setLoading(false);
    }
  };

  // 当有订阅时自动计算
  useEffect(() => {
    if (hasActiveSubscription && primaryStatus.status === 'active' && user?.id) {
      logger.info('🔄 开始计算补差价升级:', { userId: user.id, targetTier, targetPeriod });
      calculateUpgrade(user.id);
    }
  }, [hasActiveSubscription, primaryStatus.status, user?.id, targetTier, targetPeriod]);

  // 没有订阅或计算失败
  if (!hasActiveSubscription || error) {
    return null;
  }

  // 正在计算
  if (loading) {
    return (
      <Card className={`border-dashed ${className}`}>
        <CardContent className="p-6 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p className="text-sm text-muted-foreground">正在计算升级费用...</p>
        </CardContent>
      </Card>
    );
  }

  // 不支持升级
  if (!calculation?.canUpgrade) {
    return null;
  }

  const tierNames = {
    professional: '专业版',
    premium: '高级版'
  };

  const periodNames = {
    monthly: '月付',
    yearly: '年付'
  };

  return (
    <Card className={`border-l-4 border-l-blue-500 bg-gradient-to-r from-blue-50 to-indigo-50 ${className}`}>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center space-x-2 text-lg">
          <TrendingUp className="w-5 h-5 text-primary" />
          <span>补差价升级方案</span>
          <Badge variant="secondary" className="bg-blue-100 text-blue-700">
            推荐
          </Badge>
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          按剩余订阅时间比例计算，仅需支付差价即可升级
        </p>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* 升级详情 */}
        <div className="bg-background rounded-lg p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">升级到</span>
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
              {tierNames[targetTier]} {periodNames[targetPeriod]}
            </Badge>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">剩余天数</span>
            <div className="flex items-center space-x-1">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium">{calculation.daysRemaining} 天</span>
            </div>
          </div>
          
          <Separator />
          
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">剩余价值</span>
              <span className="text-success">-¥{calculation.remainingValue}</span>
            </div>
            
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">升级差价</span>
              <span className="font-medium">¥{calculation.upgradeAmount}</span>
            </div>
          </div>
          
          <Separator />
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">补差价金额</span>
            <div className="text-right">
              <div className="text-2xl font-bold text-primary">
                ¥{calculation.upgradeAmount}
              </div>
              <div className="text-xs text-muted-foreground">
                原价 ¥{calculation.targetPrice}
              </div>
            </div>
          </div>
        </div>

        {/* 优势说明 */}
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-3 border border-green-200">
          <div className="flex items-start space-x-2">
            <CheckCircle className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
            <div className="text-sm text-green-700">
              <div className="font-medium mb-1">升级优势</div>
              <ul className="text-xs space-y-1 text-success">
                <li>• 到期时间保持不变</li>
                <li>• 立即享受高级功能</li>
                <li>• 仅支付实际差价</li>
                <li>• 剩余时间价值最大化</li>
              </ul>
            </div>
          </div>
        </div>

        {/* 计算说明 */}
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="flex items-start space-x-2">
            <Info className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
            <div className="text-xs text-muted-foreground">
              <div className="font-medium mb-1">计算公式</div>
              <div>补差价 = (高级版价格 - 专业版价格) × 剩余天数 ÷ 总天数</div>
            </div>
          </div>
        </div>

        {/* 升级按钮 */}
        <Button 
          onClick={() => onUpgrade(calculation)}
          className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-background font-medium py-3"
        >
          <div className="flex items-center justify-center space-x-2">
            <CreditCard className="w-4 h-4" />
            <span>立即升级</span>
            <span className="bg-background/20 px-2 py-1 rounded text-xs">
              ¥{calculation.upgradeAmount}
            </span>
            <ArrowRight className="w-4 h-4" />
          </div>
        </Button>
      </CardContent>
    </Card>
  );
}