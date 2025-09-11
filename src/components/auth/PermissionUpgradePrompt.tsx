/**
 * 权限升级提示组件
 * 主题适配的升级提示，确保在所有主题下都有良好的可读性
 */

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Crown, Zap, Lock, ArrowRight, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getSubscriptionPlan } from '@/config/subscriptionPlans';

export interface PermissionUpgradePromptProps {
  requiredTier: 'trial' | 'pro' | 'premium';
  featureName: string;
  description?: string;
  className?: string;
  compact?: boolean;
}

/**
 * 权限升级提示组件
 */
export const PermissionUpgradePrompt: React.FC<PermissionUpgradePromptProps> = ({
  requiredTier,
  featureName,
  description,
  className = '',
  compact = false
}) => {
  const navigate = useNavigate();
  const plan = getSubscriptionPlan(requiredTier);

  const handleUpgrade = () => {
    navigate('/vip');
  };

  const getIcon = () => {
    switch (requiredTier) {
      case 'premium':
        return <Crown className="h-5 w-5 text-purple-500 dark:text-purple-400" />;
      case 'pro':
        return <Zap className="h-5 w-5 text-primary dark:text-blue-400" />;
      default:
        return <Lock className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const getBadgeVariant = () => {
    switch (requiredTier) {
      case 'premium':
        return 'premium' as const;
      case 'pro':
        return 'default' as const;
      default:
        return 'secondary' as const;
    }
  };

  if (compact) {
    return (
      <div className={`permission-upgrade-prompt flex items-center gap-3 p-4 rounded-lg border ${className}`}>
        {getIcon()}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground">
            {featureName}需要{plan.name}
          </p>
          {description && (
            <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
              {description}
            </p>
          )}
        </div>
        <Badge variant={getBadgeVariant()} className="shrink-0">
          {plan.name}
        </Badge>
        <Button size="sm" onClick={handleUpgrade} className="shrink-0">
          升级
          <ArrowRight className="h-3 w-3 ml-1" />
        </Button>
      </div>
    );
  }

  return (
    <Card className={`permission-upgrade-prompt border-dashed border-2 ${className}`}>
      <CardHeader className="text-center pb-4">
        <div className="flex items-center justify-center gap-2 mb-2">
          {getIcon()}
          <Badge variant={getBadgeVariant()}>
            {plan.name}
          </Badge>
        </div>
        <CardTitle className="text-lg text-foreground">
          {featureName}需要升级
        </CardTitle>
        <CardDescription className="text-muted-foreground">
          {description || `此功能需要${plan.name}，升级后即可使用`}
        </CardDescription>
      </CardHeader>
      <CardContent className="text-center">
        <div className="space-y-4">
          <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 text-warning dark:text-yellow-400" />
              <span>更多功能</span>
            </div>
            <div className="flex items-center gap-1">
              <Zap className="h-4 w-4 text-primary dark:text-blue-400" />
              <span>更快速度</span>
            </div>
            <div className="flex items-center gap-1">
              <Crown className="h-4 w-4 text-purple-500 dark:text-purple-400" />
              <span>专属服务</span>
            </div>
          </div>
          <Button onClick={handleUpgrade} className="w-full">
            立即升级到{plan.name}
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

/**
 * 内联权限提示组件
 */
export const InlinePermissionPrompt: React.FC<PermissionUpgradePromptProps> = ({
  requiredTier,
  featureName,
  className = ''
}) => {
  const navigate = useNavigate();
  const plan = getSubscriptionPlan(requiredTier);

  const handleUpgrade = () => {
    navigate('/vip');
  };

  const getIcon = () => {
    switch (requiredTier) {
      case 'premium':
        return <Crown className="h-4 w-4 text-purple-500 dark:text-purple-400" />;
      case 'pro':
        return <Zap className="h-4 w-4 text-primary dark:text-blue-400" />;
      default:
        return <Lock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  return (
    <div className={`permission-upgrade-prompt inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm ${className}`}>
      {getIcon()}
      <span className="text-muted-foreground">
        需要{plan.name}
      </span>
      <Button
        size="sm"
        variant="ghost"
        onClick={handleUpgrade}
        className="h-6 px-2 text-xs hover:bg-primary/10 hover:text-primary"
      >
        升级
      </Button>
    </div>
  );
};

export default PermissionUpgradePrompt;
