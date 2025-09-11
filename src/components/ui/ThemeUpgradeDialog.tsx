/**
 * 主题升级引导对话框
 * 当用户尝试使用无权限的主题时显示
 */

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Crown, Lock, Palette, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ThemeUpgradeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  themeName: string;
  requiredTier: 'pro' | 'premium';
  currentTier?: 'trial' | 'pro' | 'premium';
}

export const ThemeUpgradeDialog: React.FC<ThemeUpgradeDialogProps> = ({
  open,
  onOpenChange,
  themeName,
  requiredTier,
  currentTier = 'trial'
}) => {
  const navigate = useNavigate();

  const tierInfo = {
    trial: { name: '体验版', color: 'bg-muted text-gray-800' },
    pro: { name: '专业版', color: 'bg-blue-100 text-blue-800' },
    premium: { name: '高级版', color: 'bg-purple-100 text-purple-800' }
  };

  const handleUpgrade = () => {
    onOpenChange(false);
    navigate('/payment');
  };

  const getUpgradeMessage = () => {
    if (requiredTier === 'pro') {
      return {
        title: `解锁 ${themeName} 主题`,
        description: '升级到专业版即可使用深色主题，提升夜间使用体验',
        features: ['深色主题', '护眼模式', '专业功能'],
        price: '¥29/月'
      };
    } else {
      return {
        title: `解锁 ${themeName} 主题`,
        description: '升级到高级版即可使用全部主题，包括蓝色、米色、绿色等多种风格',
        features: ['全部主题', '个性化定制', '高级功能'],
        price: '¥79/月'
      };
    }
  };

  const upgradeInfo = getUpgradeMessage();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 rounded-full bg-primary/10">
              <Lock className="h-5 w-5 text-primary" />
            </div>
            <DialogTitle className="text-lg">{upgradeInfo.title}</DialogTitle>
          </div>
          <DialogDescription className="text-left">
            {upgradeInfo.description}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* 当前状态 */}
          <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
            <span className="text-sm text-muted-foreground">当前版本</span>
            <Badge className={tierInfo[currentTier].color}>
              {tierInfo[currentTier].name}
            </Badge>
          </div>

          {/* 升级后功能 */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium flex items-center gap-2">
              <Palette className="h-4 w-4" />
              升级后可享受
            </h4>
            <div className="grid grid-cols-1 gap-2">
              {upgradeInfo.features.map((feature, index) => (
                <div key={index} className="flex items-center gap-2 text-sm">
                  <Star className="h-3 w-3 text-primary" />
                  <span>{feature}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 价格信息 */}
          <div className="p-3 bg-primary/5 rounded-lg border border-primary/20">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">升级价格</span>
              <span className="text-lg font-bold text-primary">{upgradeInfo.price}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              立即升级，解锁更多主题和功能
            </p>
          </div>
        </div>

        <DialogFooter className="flex gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            稍后再说
          </Button>
          <Button onClick={handleUpgrade} className="flex items-center gap-2">
            <Crown className="h-4 w-4" />
            立即升级
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
