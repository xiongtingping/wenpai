import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Lock, Crown, ArrowRight, Sparkles } from 'lucide-react';

interface PremiumFeatureDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onUpgrade: () => void;
  featureName: string;
  featureDescription: string;
}

/**
 * 高级功能权限提醒组件
 * @description 当用户尝试使用高级功能时显示权限提醒
 */
export function PremiumFeatureDialog({
  isOpen,
  onClose,
  onUpgrade,
  featureName,
  featureDescription
}: PremiumFeatureDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-purple-600">
            <Lock className="h-5 w-5" />
            高级功能权限
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="text-center">
            <div className="text-xl font-bold text-gray-800 mb-2">
              {featureName}
            </div>
            <p className="text-gray-600">{featureDescription}</p>
          </div>

          <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-4 rounded-lg border border-purple-200">
            <h4 className="font-semibold text-purple-800 mb-2 flex items-center gap-2">
              <Crown className="h-4 w-4" />
              升级高级版解锁特权
            </h4>
            <ul className="text-sm text-purple-700 space-y-1">
              <li>• 不限量AI内容适配</li>
              <li>• 创意魔方功能</li>
              <li>• 全网雷达功能</li>
              
              <li>• 品牌库功能</li>
              <li>• 最新AI模型</li>
              <li>• 余额继承机制</li>
            </ul>
          </div>

          <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-3 rounded-lg border border-amber-200">
            <div className="flex items-center gap-2 text-amber-800">
              <Sparkles className="h-4 w-4" />
              <span className="text-sm font-medium">限时优惠：年付省300元</span>
            </div>
          </div>
        </div>

        <DialogFooter className="flex gap-2">
          <Button variant="outline" onClick={onClose}>
            稍后再说
          </Button>
          <Button 
            onClick={onUpgrade}
            className="bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700"
          >
            立即升级解锁
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 