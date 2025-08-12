/**
 * 权限升级对话框组件
 * 替换原有的权限遮罩弹窗，采用清晰的版本对比界面
 */

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { PermissionUpgradeCard } from './PermissionUpgradeCard';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PermissionUpgradeDialogProps {
  /** 是否显示对话框 */
  open: boolean;
  /** 对话框状态变化回调 */
  onOpenChange: (open: boolean) => void;
  /** 功能名称 */
  featureName: string;
  /** 所需权限等级 */
  requiredTier: 'pro' | 'premium';
  /** 功能描述 */
  description?: string;
  /** 是否显示关闭按钮 */
  showCloseButton?: boolean;
}

export const PermissionUpgradeDialog: React.FC<PermissionUpgradeDialogProps> = ({
  open,
  onOpenChange,
  featureName,
  requiredTier,
  description,
  showCloseButton = true
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto p-0">
        {/* 自定义头部 - 增强磨砂效果 */}
        <div
          className="sticky top-0 bg-background/98 border-b p-6 flex items-center justify-between"
          style={{
            backdropFilter: 'blur(12px) saturate(180%)',
            WebkitBackdropFilter: 'blur(12px) saturate(180%)'
          }}
        >
          <div>
            <DialogTitle className="text-xl font-semibold">
              功能升级
            </DialogTitle>
            <DialogDescription className="mt-1">
              选择适合您的订阅计划，解锁更多专业功能
            </DialogDescription>
          </div>
          
          {showCloseButton && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
              <span className="sr-only">关闭</span>
            </Button>
          )}
        </div>

        {/* 内容区域 */}
        <div className="p-6">
          <PermissionUpgradeCard
            featureName={featureName}
            requiredTier={requiredTier}
            description={description}
            showComparison={true}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};
