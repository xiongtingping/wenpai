/**
 * 权限遮罩组件
 * 用于限制功能访问，显示升级提示
 */

import React from 'react';
import { Lock, Crown, Zap, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { usePermission } from '@/hooks/usePermission';
import { useUnifiedAuth } from '@/contexts/UnifiedAuthContext';

interface PermissionOverlayProps {
  /** 是否显示遮罩 */
  show: boolean;
  /** 功能名称 */
  featureName: string;
  /** 所需权限 */
  requiredPermission: string;
  /** 所需等级 */
  requiredTier: 'pro' | 'premium';
  /** 功能描述 */
  description?: string;
  /** 子元素 */
  children: React.ReactNode;
  /** 自定义样式类名 */
  className?: string;
  /** 遮罩透明度 */
  opacity?: number;
}

export const PermissionOverlay: React.FC<PermissionOverlayProps> = ({
  show,
  featureName,
  requiredPermission,
  requiredTier,
  description,
  children,
  className = '',
  opacity = 0.8
}) => {
  const navigate = useNavigate();
  const { user } = useUnifiedAuth();
  const permission = usePermission(requiredPermission);

  // 如果有权限，直接显示内容
  if (permission.pass || !show) {
    return <>{children}</>;
  }

  const tierInfo = {
    pro: {
      name: '专业版',
      price: '¥29/月',
      icon: <Zap className="h-5 w-5" />,
      color: 'bg-blue-100 text-blue-800',
      features: ['创意魔方', '高级模型', '更多功能']
    },
    premium: {
      name: '高级版',
      price: '¥79/月',
      icon: <Crown className="h-5 w-5" />,
      color: 'bg-purple-100 text-purple-800',
      features: ['品牌库', '全部主题', '无限使用', '最新模型']
    }
  };

  const currentTier = tierInfo[requiredTier];

  const handleUpgrade = () => {
    navigate('/payment');
  };

  return (
    <div className={`relative ${className}`}>
      {/* 原始内容 */}
      <div className="relative">
        {children}
      </div>

      {/* 权限遮罩 */}
      <div 
        className="absolute inset-0 z-50 flex items-center justify-center"
        style={{ 
          backgroundColor: `rgba(255, 255, 255, ${opacity})`,
          backdropFilter: 'blur(2px)'
        }}
      >
        <div className="bg-white rounded-xl shadow-2xl border border-border p-6 max-w-md mx-4 text-center">
          {/* 图标和标题 */}
          <div className="flex items-center justify-center mb-4">
            <div className="p-3 rounded-full bg-primary/10 mr-3">
              <Lock className="h-6 w-6 text-primary" />
            </div>
            <div className="text-left">
              <h3 className="text-lg font-semibold text-foreground">
                解锁 {featureName}
              </h3>
              <Badge className={`text-xs px-2 py-1 ${currentTier.color}`}>
                需要 {currentTier.name}
              </Badge>
            </div>
          </div>

          {/* 功能描述 */}
          {description && (
            <p className="text-sm text-muted-foreground mb-4">
              {description}
            </p>
          )}

          {/* 升级后功能 */}
          <div className="mb-6">
            <h4 className="text-sm font-medium mb-3 flex items-center justify-center gap-2">
              {currentTier.icon}
              升级到 {currentTier.name}
            </h4>
            <div className="grid grid-cols-2 gap-2">
              {currentTier.features.map((feature, index) => (
                <div key={index} className="flex items-center gap-2 text-sm">
                  <Star className="h-3 w-3 text-primary" />
                  <span>{feature}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 价格和按钮 */}
          <div className="space-y-3">
            <div className="p-3 bg-primary/5 rounded-lg border border-primary/20">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">升级价格</span>
                <span className="text-lg font-bold text-primary">{currentTier.price}</span>
              </div>
            </div>
            
            <Button 
              onClick={handleUpgrade} 
              className="w-full flex items-center gap-2"
              size="lg"
            >
              <Crown className="h-4 w-4" />
              立即升级解锁
            </Button>
          </div>

          {/* 当前用户信息 */}
          <div className="mt-4 pt-4 border-t border-border">
            <p className="text-xs text-muted-foreground">
              当前：{user?.nickname || '体验版用户'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * 权限检查Hook，用于判断是否需要显示遮罩
 */
export const usePermissionOverlay = (requiredPermission: string) => {
  const permission = usePermission(requiredPermission);
  
  return {
    shouldShowOverlay: !permission.pass,
    hasPermission: permission.pass,
    permission
  };
};
