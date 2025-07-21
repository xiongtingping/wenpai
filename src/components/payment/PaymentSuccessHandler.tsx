/**
 * 支付成功处理组件
 * 处理支付成功后的业务逻辑，如自动升级会员
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useUnifiedAuth } from '@/contexts/UnifiedAuthContext';
import { CheckCircle, Crown, Star, ArrowRight, User } from 'lucide-react';
import { paymentService } from '@/services/paymentService';

interface PaymentSuccessHandlerProps {
  paymentData: any;
  onComplete?: () => void;
}

export const PaymentSuccessHandler: React.FC<PaymentSuccessHandlerProps> = ({
  paymentData,
  onComplete,
}) => {
  const [isProcessing, setIsProcessing] = useState(true);
  const [upgradeResult, setUpgradeResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const { user } = useUnifiedAuth();

  // 处理支付成功后的业务逻辑
  useEffect(() => {
    const handlePaymentSuccess = async () => {
      try {
        setIsProcessing(true);
        setError(null);

        // 使用支付服务处理支付成功
        const result = await paymentService.simulatePaymentSuccess(paymentData);
        
        if (result.success) {
          setUpgradeResult(result);
          
          // 更新本地用户状态
          if (user) {
            const updatedUser = {
              ...user,
              subscription: result.subscription,
              roles: Array.isArray(user.roles) ? [...user.roles, 'vip', result.subscription.planTier] : ['vip', result.subscription.planTier],
            };
            // 用户信息更新逻辑已移至认证上下文
          }

          // 显示成功提示
          toast({
            title: "会员升级成功！",
            description: `您已成功升级为${result.subscription.planTier}会员`,
            duration: 5000,
          });
        } else {
          throw new Error(result.error || '升级失败');
        }

      } catch (error: any) {
        console.error('处理支付成功失败:', error);
        setError(error.message || '处理支付成功时发生错误');
        
        toast({
          title: "处理失败",
          description: "支付成功但会员升级失败，请联系客服",
          variant: "destructive",
        });
      } finally {
        setIsProcessing(false);
      }
    };

    handlePaymentSuccess();
  }, [paymentData, user, toast]);

  // 获取套餐图标
  const getPlanIcon = (tier: string) => {
    switch (tier) {
      case 'premium':
        return <Crown className="h-6 w-6 text-yellow-500" />;
      case 'pro':
        return <Star className="h-6 w-6 text-blue-500" />;
      default:
        return <User className="h-6 w-6 text-gray-500" />;
    }
  };

  if (isProcessing) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="flex flex-col items-center justify-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600">正在处理支付成功...</p>
          <p className="text-sm text-gray-500 mt-2">请稍候，正在为您升级会员</p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="text-red-600">处理失败</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-red-600">{error}</p>
          <Button 
            variant="outline" 
            className="w-full" 
            onClick={() => window.location.href = '/support'}
          >
            联系客服
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!upgradeResult) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="text-center py-8">
          <p className="text-gray-600">处理结果异常</p>
        </CardContent>
      </Card>
    );
  }

  const subscription = upgradeResult.subscription;

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="flex justify-center mb-4">
          <CheckCircle className="h-16 w-16 text-green-500" />
        </div>
        <CardTitle className="text-2xl text-green-600">支付成功！</CardTitle>
        <p className="text-gray-600">您的会员已自动升级</p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* 套餐信息 */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg">
          <div className="flex items-center gap-3 mb-2">
            {getPlanIcon(subscription.planTier)}
            <h3 className="text-lg font-semibold">
              {subscription.planTier === 'premium' ? '高级版' : '专业版'}
            </h3>
          </div>
          <Badge variant="secondary" className="mb-2">
            {subscription.planPeriod === 'yearly' ? '年付' : '月付'}
          </Badge>
          <p className="text-sm text-gray-600">
            享受所有高级功能，无限制使用
          </p>
        </div>

        {/* 套餐功能 */}
        <div className="space-y-2">
          <h4 className="font-medium text-gray-900">套餐功能</h4>
          <div className="space-y-1">
            {subscription.features.map((feature: string, index: number) => (
              <div key={index} className="flex items-center gap-2 text-sm text-gray-600">
                <CheckCircle className="h-4 w-4 text-green-500" />
                {feature}
              </div>
            ))}
          </div>
        </div>

        {/* 支付详情 */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">支付金额</span>
            <span className="font-medium">¥{(paymentData.amount / 100).toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">订单号</span>
            <span className="font-mono text-xs">{paymentData.id}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">支付时间</span>
            <span>{new Date().toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">有效期至</span>
            <span>{new Date(subscription.endDate).toLocaleDateString()}</span>
          </div>
        </div>

        {/* 操作按钮 */}
        <div className="space-y-3">
          <Button 
            className="w-full" 
            onClick={() => window.location.href = '/profile'}
          >
            <User className="h-4 w-4 mr-2" />
            前往个人中心
          </Button>
          
          <Button 
            variant="outline" 
            className="w-full" 
            onClick={() => window.location.href = '/dashboard'}
          >
            <ArrowRight className="h-4 w-4 mr-2" />
            开始使用
          </Button>
        </div>

        {/* 完成回调 */}
        {onComplete && (
          <Button 
            variant="ghost" 
            className="w-full" 
            onClick={onComplete}
          >
            完成
          </Button>
        )}
      </CardContent>
    </Card>
  );
}; 