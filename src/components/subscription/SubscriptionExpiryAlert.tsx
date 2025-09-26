/**
 * 订阅临期提醒组件
 * @description 在个人中心显示订阅到期提醒
 */

import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useSubscriptionStatus } from '@/hooks/useSubscriptionStatus';
import { useNavigate } from 'react-router-dom';
import { 
  AlertTriangle, 
  Calendar, 
  X, 
  Crown, 
  CreditCard,
  TrendingUp 
} from 'lucide-react';

interface SubscriptionExpiryAlertProps {
  /** 是否显示在侧边栏（紧凑模式） */
  compact?: boolean;
  /** 自定义样式类名 */
  className?: string;
}

export function SubscriptionExpiryAlert({
  compact = false,
  className = ''
}: SubscriptionExpiryAlertProps) {
  const { primaryStatus, refresh } = useSubscriptionStatus();
  const subscriptionStatus = primaryStatus;
  const hasActiveSubscription = primaryStatus?.status === 'active';
  const navigate = useNavigate();
  const [dismissed, setDismissed] = useState(false);

  // 使用真实的订阅状态判断
  if (!subscriptionStatus?.needsAlert || dismissed) {
    return null;
  }

  const getAlertVariant = () => {
    switch (primaryStatus.alertLevel) {
      case 'danger':
        return 'destructive';
      case 'warning':
        return 'default';
      case 'info':
        return 'default';
      default:
        return 'default';
    }
  };

  const getAlertIcon = () => {
    switch (primaryStatus.alertLevel) {
      case 'danger':
        return <AlertTriangle className="h-4 w-4" />;
      case 'warning':
        return <Calendar className="h-4 w-4" />;
      case 'info':
        return <TrendingUp className="h-4 w-4" />;
      default:
        return <AlertTriangle className="h-4 w-4" />;
    }
  };

  const handleRenew = () => {
    // 跳转到续费页面，保持当前产品类型
    navigate('/payment', { 
      state: { 
        action: 'renew',
        currentSubscription: primaryStatus
      }
    });
  };

  const handleUpgrade = () => {
    // 跳转到升级页面
    navigate('/payment', { 
      state: { 
        action: 'upgrade',
        currentSubscription: primaryStatus
      }
    });
  };

  if (compact) {
    // 紧凑模式：适用于侧边栏等小空间
    return (
      <Alert 
        variant={getAlertVariant()}
        className={`mb-4 ${className}`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {getAlertIcon()}
            <div className="text-sm">
              <div className="font-medium">订阅即将到期</div>
              <div className="text-xs opacity-80">
                {primaryStatus.daysRemaining > 0 
                  ? `剩余${primaryStatus.daysRemaining}天`
                  : '已过期'
                }
              </div>
            </div>
          </div>
          <Button 
            size="sm" 
            variant="outline"
            onClick={handleRenew}
            className="text-xs"
          >
            续费
          </Button>
        </div>
      </Alert>
    );
  }

  // 完整模式：适用于个人中心主要区域
  return (
    <Card className={`mb-6 border-l-4 ${
      primaryStatus.alertLevel === 'danger' ? 'border-l-red-500 bg-red-50' :
      primaryStatus.alertLevel === 'warning' ? 'border-l-orange-500 bg-orange-50' :
      'border-l-yellow-500 bg-yellow-50'
    } ${className}`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3">
            <div className={`p-2 rounded-full ${
              primaryStatus.alertLevel === 'danger' ? 'bg-red-100 text-destructive' :
              primaryStatus.alertLevel === 'warning' ? 'bg-orange-100 text-orange-600' :
              'bg-yellow-100 text-warning'
            }`}>
              {getAlertIcon()}
            </div>
            
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                <h3 className="font-semibold text-foreground">
                  订阅到期提醒
                </h3>
                <Badge 
                  variant="outline"
                  className={`${
                    primaryStatus.statusColor === 'red' ? 'border-destructive text-destructive' :
                    primaryStatus.statusColor === 'orange' ? 'border-orange-500 text-orange-600' :
                    'border-yellow-500 text-warning'
                  }`}
                >
                  {primaryStatus.statusLabel}
                </Badge>
              </div>
              
              <AlertDescription className="text-gray-700 mb-3">
                {primaryStatus.alertMessage}
              </AlertDescription>
              
              {primaryStatus.expiresAt && (
                <div className="text-sm text-muted-foreground mb-3">
                  <Calendar className="w-4 h-4 inline mr-1" />
                  到期时间：{new Date(primaryStatus.expiresAt).toLocaleDateString('zh-CN')}
                </div>
              )}
              
              <div className="flex space-x-3">
                <Button 
                  onClick={handleRenew}
                  className="flex items-center space-x-2"
                  variant={primaryStatus.alertLevel === 'danger' ? 'default' : 'outline'}
                >
                  <CreditCard className="w-4 h-4" />
                  <span>立即续费</span>
                </Button>
                
                <Button 
                  onClick={handleUpgrade}
                  variant="outline"
                  className="flex items-center space-x-2"
                >
                  <Crown className="w-4 h-4" />
                  <span>升级套餐</span>
                </Button>
              </div>
            </div>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setDismissed(true)}
            className="text-gray-400 hover:text-muted-foreground"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * 简化版提醒组件（用于小空间显示）
 */
export function SubscriptionExpiryBanner() {
  const { primaryStatus } = useSubscriptionStatus();
  const navigate = useNavigate();
  const [dismissed, setDismissed] = useState(false);

  if (!primaryStatus.needsAlert || dismissed) {
    return null;
  }

  return (
    <div className={`px-4 py-2 text-sm font-medium text-center ${
      primaryStatus.alertLevel === 'danger' ? 'bg-red-100 text-red-800 border-red-200' :
      primaryStatus.alertLevel === 'warning' ? 'bg-orange-100 text-orange-800 border-orange-200' :
      'bg-yellow-100 text-yellow-800 border-yellow-200'
    } border-b`}>
      <div className="flex items-center justify-center space-x-2">
        <span>{primaryStatus.alertMessage}</span>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => navigate('/payment-center')}
          className="text-xs underline"
        >
          立即处理
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => setDismissed(true)}
          className="text-xs"
        >
          <X className="w-3 h-3" />
        </Button>
      </div>
    </div>
  );
}