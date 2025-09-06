import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Crown, ArrowRight } from 'lucide-react';

interface UsageReminderDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onUpgrade: () => void;
  remainingCount: number;
  userType: 'trial' | 'pro' | 'premium';
}

/**
 * 使用次数提醒弹窗组件
 * @description 当用户使用次数不足时显示提醒弹窗
 */
export function UsageReminderDialog({
  isOpen,
  onClose,
  onUpgrade,
  remainingCount,
  userType
}: UsageReminderDialogProps) {
  const getDialogContent = () => {
    if (userType === 'trial') {
      return {
        title: '使用次数即将用完',
        description: `仅剩 ${remainingCount} 次调用机会，立即升级享受更多功能！`,
        upgradeText: '立即升级',
        upgradeDescription: '升级后享受更多使用次数和高级功能'
      };
    } else if (userType === 'pro') {
      return {
        title: '使用次数即将用完',
        description: `仅剩 ${remainingCount} 次调用机会，升级后不限次！`,
        upgradeText: '升级高级版',
        upgradeDescription: '升级到高级版享受不限量使用'
      };
    }
    return {
      title: '使用次数即将用完',
      description: `仅剩 ${remainingCount} 次调用机会`,
      upgradeText: '立即升级',
      upgradeDescription: '升级后享受更多使用次数'
    };
  };

  const content = getDialogContent();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-foreground">
            <AlertTriangle className="h-5 w-5" />
            {content.title}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-destructive mb-2">
              仅剩 {remainingCount} 次
            </div>
            <p className="text-muted-foreground">{content.description}</p>
          </div>

          {userType === 'trial' && (
            <div className="p-4 rounded-lg border border-border bg-accent">
              <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                <Crown className="h-4 w-4" />
                升级专业版特权
              </h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• 30次/月AI内容适配</li>
                <li>• 创意魔方功能</li>
                <li>• 高级AI模型</li>
                <li>• 余额继承机制</li>
              </ul>
            </div>
          )}

          {userType === 'pro' && (
            <div className="p-4 rounded-lg border border-border bg-accent">
              <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                <Crown className="h-4 w-4" />
                升级高级版特权
              </h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• 不限量AI内容适配</li>
                <li>• 全网雷达功能</li>
                <li>• 品牌库功能</li>
                <li>• 最新AI模型</li>
              </ul>
            </div>
          )}
        </div>

        <DialogFooter className="flex gap-2">
          <Button variant="outline" onClick={onClose}>
            稍后再说
          </Button>
          <Button
            onClick={onUpgrade}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            {content.upgradeText}
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
