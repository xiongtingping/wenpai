/**
 * 权限遮罩组件
 * 用于限制功能访问，显示升级提示
 */

import React, { useState } from 'react';
import { Lock, Crown, Zap, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { usePermission } from '@/hooks/usePermission';
import { useUnifiedAuth } from '@/contexts/UnifiedAuthContext';
import { PermissionUpgradeDialog } from './PermissionUpgradeDialog';
import { UpgradePromptCard } from './UpgradePromptCard';

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
  const [upgradeDialogOpen, setUpgradeDialogOpen] = useState(false);

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
    // 保存选中的计划到localStorage
    localStorage.setItem("selectedPlan", requiredTier);
    // 直接跳转到支付页面
    navigate('/payment');
  };

  return (
    <div className={`relative ${className}`}>
      {/* 原始内容 */}
      <div className="relative">
        {children}
      </div>

      {/* 权限遮罩 - 增强磨砂效果 */}
      <div
        className="absolute inset-0 z-50 flex items-center justify-center"
        style={{
          backgroundColor: `rgba(255, 255, 255, ${Math.min(opacity + 0.1, 0.95)})`,
          backdropFilter: 'blur(8px) saturate(150%)',
          WebkitBackdropFilter: 'blur(8px) saturate(150%)'
        }}
      >
        <UpgradePromptCard
          featureName={featureName}
          requiredTier={requiredTier}
          description={description}
          compact={true}
          onUpgradeClick={handleUpgrade}
        />
      </div>

      {/* 升级对话框 */}
      <PermissionUpgradeDialog
        open={upgradeDialogOpen}
        onOpenChange={setUpgradeDialogOpen}
        featureName={featureName}
        requiredTier={requiredTier}
        description={description}
      />
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
