/**
 * 导航栏订阅状态标识组件
 * @description 在导航栏显示用户订阅状态，包含悬停提醒
 */

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from '@/components/ui/popover';
import { useSubscriptionStatus } from '@/hooks/useSubscriptionStatus';
import { useNavigate } from 'react-router-dom';
import { SubscriptionStateWrapper } from '@/components/ui/StateLoadingWrapper';
import { 
  Crown, 
  Calendar, 
  AlertTriangle,
  TrendingUp,
  CreditCard,
  Zap
} from 'lucide-react';

interface SubscriptionStatusBadgeProps {
  /** 是否显示详细信息 */
  showDetails?: boolean;
  /** 自定义样式类名 */
  className?: string;
}

export function SubscriptionStatusBadge({ showDetails = true,
  className = ''
 }: SubscriptionStatusBadgeProps) {
  return (
    <SubscriptionStateWrapper className={className}>
      <SubscriptionStatusBadgeContent
        showDetails={showDetails}
        className={className}
      />
    </SubscriptionStateWrapper>
  );
}

// 内部组件，只在状态加载完成后渲染
function SubscriptionStatusBadgeContent({
  showDetails = true,
  className = ''
}: SubscriptionStatusBadgeProps) {
  const { primaryStatus, refresh } = useSubscriptionStatus();
  const subscriptionStatus = primaryStatus;
  const hasActiveSubscription = primaryStatus?.status === 'active';
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const getBadgeVariant = () => {
    switch (subscriptionStatus?.statusColor) {
      case 'green':
        return 'default';
      case 'yellow':
        return 'secondary';
      case 'orange':
        return 'destructive';
      case 'red':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const getBadgeIcon = () => {
    switch (subscriptionStatus?.status) {
      case 'active':
        return <Crown className="w-3 h-3" />;
      case 'expiring_soon':
        return <AlertTriangle className="w-3 h-3" />;
      case 'expired':
        return <AlertTriangle className="w-3 h-3" />;
      default:
        return <Zap className="w-3 h-3" />;
    }
  };

  const handleRenew = () => {
    navigate('/payment', { 
      state: { 
        action: 'renew',
        currentSubscription: primaryStatus
      }
    });
    setIsOpen(false);
  };

  const handleUpgrade = () => {
    navigate('/payment', { 
      state: { 
        action: 'upgrade',
        currentSubscription: primaryStatus
      }
    });
    setIsOpen(false);
  };

  if (!showDetails || !hasActiveSubscription) {
    // 简单模式：只显示状态徽章
    return (
      <Badge 
        variant={getBadgeVariant()} 
        className={`flex items-center space-x-1 cursor-pointer transition-all hover:scale-105 ${className}`}
        onClick={() => navigate('/payment-center')}
      >
        {getBadgeIcon()}
        <span className="text-xs">{subscriptionStatus?.statusLabel || t('components.labels.未订阅')}</span>
      </Badge>
    );
  }

  // 详细模式：带悬停卡片
  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Badge 
          variant={getBadgeVariant()} 
          className={`flex items-center space-x-1 cursor-pointer transition-all hover:scale-105 ${
            primaryStatus.needsAlert ? 'animate-pulse' : ''
          } ${className}`}
        >
          {getBadgeIcon()}
          <span className="text-xs">{primaryStatus.statusLabel}</span>
        </Badge>
      </PopoverTrigger>
      
      <PopoverContent className="w-80" align="end">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center space-x-2 text-base">
              <Crown className="w-4 h-4" />
              <span>订阅状态</span>
            </CardTitle>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {/* 状态信息 */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">当前状态</span>
              <Badge variant={getBadgeVariant()}>
                {primaryStatus.statusLabel}
              </Badge>
            </div>
            
            {primaryStatus.expiresAt && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">到期时间</span>
                <div className="flex items-center space-x-1 text-sm">
                  <Calendar className="w-3 h-3" />
                  <span>{new Date(primaryStatus.expiresAt).toLocaleDateString('zh-CN')}</span>
                </div>
              </div>
            )}
            
            {primaryStatus.daysRemaining > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">剩余天数</span>
                <span className={`text-sm font-medium ${
                  primaryStatus.daysRemaining <= 3 ? 'text-destructive' :
                  primaryStatus.daysRemaining <= 7 ? 'text-orange-600' :
                  'text-success'
                }`}>
                  {primaryStatus.daysRemaining} 天
                </span>
              </div>
            )}
            
            {/* 提醒消息 */}
            {primaryStatus.needsAlert && (
              <div className={`p-3 rounded-lg text-sm ${
                primaryStatus.alertLevel === 'danger' ? 'bg-red-50 text-red-700 border border-red-200' :
                primaryStatus.alertLevel === 'warning' ? 'bg-orange-50 text-orange-700 border border-orange-200' :
                'bg-yellow-50 text-yellow-700 border border-yellow-200'
              }`}>
                <div className="flex items-start space-x-2">
                  <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>{primaryStatus.alertMessage}</span>
                </div>
              </div>
            )}
            
            {/* 操作按钮 */}
            <div className="flex space-x-2 pt-2">
              <Button 
                size="sm" 
                onClick={handleRenew}
                className="flex-1 flex items-center space-x-1"
              >
                <CreditCard className="w-3 h-3" />
                <span>续费</span>
              </Button>
              
              <Button 
                size="sm" 
                variant="outline" 
                onClick={handleUpgrade}
                className="flex-1 flex items-center space-x-1"
              >
                <TrendingUp className="w-3 h-3" />
                <span>升级</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </PopoverContent>
    </Popover>
  );
}