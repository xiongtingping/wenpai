/**
 * 新版权限守卫组件
 * 使用清晰的版本对比界面替换原有的权限遮罩弹窗
 */

import React, { useState, useMemo } from 'react';
import { useUnifiedAuth } from '@/contexts/UnifiedAuthContext';
import { PermissionUpgradeDialog } from './PermissionUpgradeDialog';
import { PermissionUpgradeCard } from './PermissionUpgradeCard';
import { Button } from '@/components/ui/button';
import { Lock, Crown } from 'lucide-react';

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
  /** 是否允许预览 */
  allowPreview?: boolean;
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
  allowPreview = false,
  overlayOpacity = 0.3,
  fallback
}) => {
  const { user } = useUnifiedAuth();
  const [upgradeDialogOpen, setUpgradeDialogOpen] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);

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
          className={`relative ${allowPreview && previewMode ? '' : 'pointer-events-none select-none'}`}
          style={{ 
            opacity: allowPreview && previewMode ? 1 : 1 - overlayOpacity + 0.3,
            filter: allowPreview && previewMode ? 'none' : 'blur(0.5px)'
          }}
        >
          {children}
        </div>

        {/* 权限遮罩 */}
        {(!allowPreview || !previewMode) && (
          <div 
            className="absolute inset-0 z-50 flex items-center justify-center p-4"
            style={{ 
              backgroundColor: `rgba(255, 255, 255, ${overlayOpacity})`,
              backdropFilter: 'blur(2px)'
            }}
          >
            <div className="text-center bg-card rounded-lg shadow-lg border p-6 max-w-sm">
              <Lock className="h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">解锁 {featureName}</h3>
              {description && (
                <p className="text-sm text-muted-foreground mb-4">
                  {description}
                </p>
              )}
              
              <div className="space-y-3">
                <Button 
                  onClick={handleUpgradeClick}
                  className="w-full"
                  size="lg"
                >
                  <Crown className="h-4 w-4 mr-2" />
                  查看升级方案
                </Button>
                
                {allowPreview && (
                  <Button 
                    variant="outline"
                    onClick={() => setPreviewMode(true)}
                    className="w-full"
                    size="sm"
                  >
                    预览功能界面
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* 预览模式提示 */}
        {allowPreview && previewMode && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/80 backdrop-blur-sm opacity-0 hover:opacity-100 transition-opacity duration-200">
            <div className="text-center p-6 bg-card rounded-lg shadow-lg border max-w-sm">
              <Lock className="h-8 w-8 text-primary mx-auto mb-3" />
              <h3 className="font-semibold mb-2">预览模式</h3>
              <p className="text-sm text-muted-foreground mb-4">
                您正在预览 {featureName} 功能界面
              </p>
              <Button size="sm" className="w-full" onClick={handleUpgradeClick}>
                <Crown className="h-4 w-4 mr-2" />
                升级解锁完整功能
              </Button>
            </div>
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
  }

  // 对话框模式：显示简单的锁定状态和升级按钮
  return (
    <div className={className}>
      {fallback || (
        <div className="text-center py-8">
          <Lock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">需要升级解锁</h3>
          <p className="text-muted-foreground mb-4">
            {featureName} 需要 {requiredTier === 'pro' ? '专业版' : '高级版'} 权限
          </p>
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
