/**
 * 新版权限守卫组件
 * 使用清晰的版本对比界面替换原有的权限遮罩弹窗
 */

import React, { useState, useMemo } from 'react';
import { useUnifiedAuth } from '@/auth/UnifiedAuthProvider';
import { PermissionUpgradeDialog } from './PermissionUpgradeDialog';
import { PermissionUpgradeCard } from './PermissionUpgradeCard';
import { Button } from '@/components/ui/button';
import { Lock, Crown } from 'lucide-react';
import { PermissionText, UpgradeText } from '@/components/ui/ThemeAwareText';

interface NewPermissionGuardProps {
  /** 子组件 */
  children: React.ReactNode;
  /** 所需权限等级 */
  requiredTier: 'pro' | 'premium';
  /** 功能名称 */
  featureName: string;
  /** 功能描述 */
  description?: string;
  /** 自定义样式类名 */
  className?: string;
  /** 显示模式：inline(内联显示) | dialog(对话框) | overlay(遮罩) */
  mode?: 'inline' | 'dialog' | 'overlay';
  /** 遮罩透明度 */
  overlayOpacity?: number;
  /** 回退组件 */
  fallback?: React.ReactNode;
}

export const NewPermissionGuard: React.FC<NewPermissionGuardProps> = ({
  children,
  requiredTier,
  featureName,
  description,
  className = '',
  mode = 'dialog',
  overlayOpacity = 0.3,
  fallback
}) => {
  const { user } = useUnifiedAuth();
  const [upgradeDialogOpen, setUpgradeDialogOpen] = useState(false);

  // 获取用户当前等级
  const getCurrentTier = (): 'trial' | 'pro' | 'premium' => {
    if (!user) return 'trial';
    // 这里应该根据实际的用户数据判断等级
    // 暂时返回 trial，实际应该从用户数据中获取
    return 'trial';
  };

  const currentTier = getCurrentTier();

  // 检查权限
  const hasPermission = useMemo(() => {
    const tierLevels = { trial: 0, pro: 1, premium: 2 };
    return tierLevels[currentTier] >= tierLevels[requiredTier];
  }, [currentTier, requiredTier]);

  // 如果有权限，直接渲染子组件
  if (hasPermission) {
    return <div className={className}>{children}</div>;
  }

  // 处理升级按钮点击
  const handleUpgradeClick = () => {
    if (mode === 'dialog') {
      setUpgradeDialogOpen(true);
    }
  };

  // 内联模式：直接显示升级卡片
  if (mode === 'inline') {
    return (
      <div className={className}>
        <PermissionUpgradeCard
          featureName={featureName}
          requiredTier={requiredTier}
          description={description}
        />
      </div>
    );
  }

  // 遮罩模式：在原内容上显示遮罩
  if (mode === 'overlay') {
    return (
      <div className={`relative ${className}`}>
        {/* 原始内容 */}
        <div
          className="relative pointer-events-none select-none"
          style={{
            opacity: 1 - overlayOpacity + 0.3,
            filter: 'blur(0.5px)'
          }}
        >
          {children}
        </div>

        {/* 权限遮罩 */}
        <div
          className="absolute inset-0 z-50 flex items-center justify-center p-4"
          style={{
            backgroundColor: `rgba(255, 255, 255, ${overlayOpacity})`,
            backdropFilter: 'blur(2px)'
          }}
        >
            <div className="text-center bg-card rounded-lg shadow-lg border p-6 max-w-sm">
              <Lock className="h-12 w-12 text-primary mx-auto mb-4" />
              <UpgradeText as="h3" type="title" size="lg" className="mb-2">解锁 {featureName}</UpgradeText>
              {description && (
                <PermissionText type="description" size="sm" className="mb-4">
                  {description}
                </PermissionText>
              )}
              
              <div className="space-y-3">
                <Button
                  onClick={handleUpgradeClick}
                  className="w-full"
                  size="lg"
                >
                  <Crown className="h-4 w-4 mr-2" />
                  升级解锁功能
                </Button>

                <PermissionText type="hint" size="xs">
                  立即升级，解锁更多高级功能
                </PermissionText>
              </div>
            </div>
          </div>
        )

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
  }

  // 对话框模式：显示简单的锁定状态和升级按钮
  return (
    <div className={className}>
      {fallback || (
        <div className="text-center py-8">
          <Lock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <UpgradeText as="h3" type="title" size="lg" className="mb-2">需要升级解锁</UpgradeText>
          <PermissionText type="description" size="sm" className="mb-4">
            {featureName} 需要 {requiredTier === 'pro' ? '专业版/高级版' : '高级版'} 权限
          </PermissionText>
          <Button onClick={handleUpgradeClick}>
            <Crown className="h-4 w-4 mr-2" />
            查看升级方案
          </Button>
        </div>
      )}

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
