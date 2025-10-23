/**
 * 订阅升级对话框
 * 支持差价升级和按比例结算
 */

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  ArrowUp,
  Calculator,
  Clock,
  CreditCard,
  CheckCircle,
  AlertCircle,
  Loader2,
  QrCode
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { SubscriptionUpgradeService, type UpgradeCalculation } from '@/services/subscriptionUpgradeService';
import { BufPayService } from '@/services/bufpayService';
import { PaymentQRCode } from '@/components/payment/PaymentQRCode';
import { logger } from '@/utils/logger';
import type { SubscriptionTier, SubscriptionPeriod } from '@/types/subscription';
import type { PaymentResponse } from '@/types/payment';


interface SubscriptionUpgradeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  targetTier: SubscriptionTier;
  targetPeriod: SubscriptionPeriod;
  onUpgradeSuccess?: () => void;
}

export function SubscriptionUpgradeDialog({ open,
  onOpenChange,
  targetTier,
  targetPeriod,
  onUpgradeSuccess
 }: SubscriptionUpgradeDialogProps) {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [upgradeCalculation, setUpgradeCalculation] = useState<UpgradeCalculation | null>(null);
  const [loading, setLoading] = useState(false);
  const [calculating, setCalculating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentData, setPaymentData] = useState<PaymentResponse | null>(null);
  const [showQRCode, setShowQRCode] = useState(false);
  const [paymentOrderId, setPaymentOrderId] = useState<string>('');

  // 计算升级差价
  useEffect(() => {
    if (open && user?.id) {
      calculateUpgrade();
    }
  }, [open, user?.id, targetTier, targetPeriod]);

  const calculateUpgrade = async () => {
    if (!user?.id) return;

    setCalculating(true);
    setError(null);

    try {
      const calculation = await SubscriptionUpgradeService.calculateUpgrade(
        user.id,
        targetTier,
        targetPeriod
      );
      setUpgradeCalculation(calculation);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : t('components.errors.计算升级费用失败');
      setError(errorMessage);
      logger.error('计算升级费用失败:', error);
    } finally {
      setCalculating(false);
    }
  };

  const handleUpgrade = async () => {
    if (!upgradeCalculation || !user?.id) return;

    setLoading(true);
    setError(null);

    try {
      // 如果需要支付差价
      if (upgradeCalculation.calculation.upgradeAmount > 0) {
        logger.info('开始创建升级支付订单:', {
          userId: user.id,
          targetTier,
          targetPeriod,
          upgradeAmount: upgradeCalculation.calculation.upgradeAmount
        });

        // 创建支付订单
        const result = await BufPayService.createPayment({
          userId: user.id,
          userEmail: user.email || '',
          productName: `升级到${targetTier === 'pro' ? '专业版' : '高级版'}`,
          productType: targetTier === 'pro' ? 'professional' : 'premium',
          durationType: targetPeriod,
          amount: upgradeCalculation.calculation.upgradeAmount,
          payType: 'alipay'
        });

        logger.info('升级支付订单创建成功:', {
          orderId: result.orderId,
          paymentInfo: result.paymentInfo
        });

        // 直接使用服务返回的 PaymentResponse，并保存 orderId
        setPaymentData(result.paymentInfo);
        setPaymentOrderId(result.orderId);
        setShowQRCode(true);

      } else {
        // 无需支付，直接升级
        const result = await SubscriptionUpgradeService.executeUpgrade(
          user.id,
          upgradeCalculation
        );

        if (result.success) {
          onUpgradeSuccess?.();
          onOpenChange(false);
        } else {
          setError(result.message);
        }
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : t('components.errors.升级失败');
      setError(errorMessage);
      logger.error('升级失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTierName = (tier: SubscriptionTier) => {
    return tier === 'pro' ? '专业版' : '高级版';
  };

  const formatPeriodName = (period: SubscriptionPeriod) => {
    return period === 'yearly' ? '年付' : '月付';
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ArrowUp className="h-5 w-5 text-primary" />
            订阅升级
          </DialogTitle>
          <DialogDescription>
            升级您的订阅计划，享受更多功能和权限
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {calculating && (
            <div className="flex items-center justify-center py-8">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                正在计算升级费用...
              </div>
            </div>
          )}

          {error && (
            <div className="flex items-center gap-2 p-4 bg-destructive/10 text-destructive rounded-lg">
              <AlertCircle className="h-4 w-4" />
              {error}
            </div>
          )}

          {upgradeCalculation && !showQRCode && (
            <>
              {/* 升级概览 */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calculator className="h-4 w-4" />
                    升级概览
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">
                        {formatTierName(upgradeCalculation.currentSubscription.tier)}
                      </Badge>
                      <ArrowUp className="h-4 w-4 text-muted-foreground" />
                      <Badge variant="default">
                        {formatTierName(upgradeCalculation.targetSubscription.tier)}
                      </Badge>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-muted-foreground">
                        {formatPeriodName(upgradeCalculation.targetSubscription.period)}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    当前订阅剩余 {upgradeCalculation.currentSubscription.remainingDays} 天
                  </div>

                  <p className="text-sm">{upgradeCalculation.details.description}</p>
                </CardContent>
              </Card>

              {/* 费用明细 */}
              <Card>
                <CardHeader>
                  <CardTitle>费用明细</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {upgradeCalculation.details.breakdown.map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">{item.item}</div>
                        <div className="text-sm text-muted-foreground">{item.description}</div>
                      </div>
                      <div className={`font-medium ${
                        item.amount < 0 ? 'text-success' :
                        item.amount === 0 ? 'text-muted-foreground' : 'text-foreground'
                      }`}>
                        {item.amount < 0 ? '-' : ''}¥{Math.abs(item.amount)}
                      </div>
                    </div>
                  ))}

                  <Separator />

                  <div className="flex items-center justify-between text-lg font-semibold">
                    <span>需要支付</span>
                    <span className="text-primary">
                      ¥{upgradeCalculation.calculation.upgradeAmount}
                    </span>
                  </div>

                  {upgradeCalculation.calculation.savedAmount > 0 && (
                    <div className="flex items-center gap-2 text-sm text-success">
                      <CheckCircle className="h-4 w-4" />
                      为您节省 ¥{upgradeCalculation.calculation.savedAmount}
                      （{upgradeCalculation.calculation.discountPercentage}% 折扣）
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* 操作按钮 */}
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  className="flex-1"
                >
                  取消
                </Button>
                <Button
                  onClick={handleUpgrade}
                  disabled={loading}
                  className="flex-1"
                >
                  {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  {upgradeCalculation.calculation.upgradeAmount > 0 ? (
                    <>
                      <CreditCard className="h-4 w-4 mr-2" />
                      立即支付 ¥{upgradeCalculation.calculation.upgradeAmount}
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      免费升级
                    </>
                  )}
                </Button>
              </div>
            </>
          )}

          {/* 🔧 NEW: 显示支付二维码 */}
          {showQRCode && paymentData && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <QrCode className="h-5 w-5" />
                    扫码支付
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground mb-4">
                      请使用支付宝扫描下方二维码完成支付
                    </p>

                    {/* 支付二维码组件 */}
                    <PaymentQRCode
                      paymentInfo={paymentData}
                      orderId={paymentOrderId}
                      onPaymentSuccess={() => {
                        onUpgradeSuccess?.();
                        onOpenChange(false);
                      }}
                    />

                    <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                      <p className="text-sm text-blue-700 font-medium">
                        支付金额：¥{upgradeCalculation?.calculation.upgradeAmount}
                      </p>
                      <p className="text-xs text-blue-600 mt-1">
                        升级后到期时间保持不变：{new Date(upgradeCalculation?.currentSubscription.expiresAt || '').toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowQRCode(false);
                    setPaymentData(null);
                  }}
                  className="flex-1"
                >
                  返回
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => onOpenChange(false)}
                  className="flex-1"
                >
                  取消支付
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default SubscriptionUpgradeDialog;
