import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogOverlay, DialogPortal } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Lock, Crown, ArrowRight, Sparkles, Check, X } from 'lucide-react';

interface PremiumFeatureDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onUpgrade: () => void;
  featureName: string;
  featureDescription: string;
}

// 定价方案数据
const pricingPlans = [
  {
    id: 'trial',
    name: '体验版',
    tier: 'trial',
    price: 0,
    originalPrice: 0,
    period: '免费',
    description: '适合轻度使用',
    features: [
      '5次/月 AI内容适配',
      '基础AI模型',
      '社区支持'
    ],
    buttonText: '当前版本',
    buttonVariant: 'outline' as const,
    recommended: false,
    current: true
  },
  {
    id: 'pro',
    name: '专业版',
    tier: 'pro',
    price: 29,
    originalPrice: 29,
    period: '/月',
    description: '适合个人创作者',
    features: [
      '30次/月 AI内容适配',
      '创意魔方功能',
      '高级AI模型',
      '邮件客服支持'
    ],
    buttonText: '升级专业版',
    buttonVariant: 'default' as const,
    recommended: true,
    current: false
  },
  {
    id: 'premium',
    name: '高级版',
    tier: 'premium',
    price: 79,
    originalPrice: 79,
    period: '/月',
    description: '适合团队和企业',
    features: [
      '不限量 AI内容适配',
      '创意魔方功能',
      '全网雷达功能',
      '品牌库功能',
      '最新AI模型',
      '专属客服支持'
    ],
    buttonText: '升级高级版',
    buttonVariant: 'default' as const,
    recommended: false,
    current: false
  }
];

/**
 * 高级功能权限提醒组件
 * @description 当用户尝试使用高级功能时显示定价对比表格
 */
export function PremiumFeatureDialog({
  isOpen,
  onClose,
  onUpgrade,
  featureName,
  featureDescription
}: PremiumFeatureDialogProps) {
  // 🔧 FIX: 强制使用portal渲染到body，避免父容器影响
  React.useEffect(() => {
    if (isOpen) {
      console.log('🔍 弹窗显示状态:', {
        isOpen,
        featureName,
        bodyOverflow: document.body.style.overflow,
        documentElement: document.documentElement.scrollTop
      });
    }
  }, [isOpen, featureName]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl max-h-[85vh] overflow-y-auto !fixed !top-[50%] !left-[50%] !transform !-translate-x-1/2 !-translate-y-1/2 !z-[9999999]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-foreground text-center">
            <Crown className="h-5 w-5" />
            解锁 {featureName} - 选择适合您的方案
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* 功能说明 */}
          <div className="text-center p-4 bg-accent rounded-lg">
            <p className="text-muted-foreground">{featureDescription}</p>
          </div>

          {/* 定价对比表格 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {pricingPlans.map((plan, index) => (
              <div
                key={plan.name}
                className={`relative p-6 rounded-lg border ${
                  plan.recommended
                    ? 'border-primary bg-primary/5 shadow-lg'
                    : 'border-border bg-card'
                }`}
              >
                {plan.recommended && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-primary text-primary-foreground">
                      推荐
                    </Badge>
                  </div>
                )}

                <div className="text-center mb-4">
                  <h3 className="text-lg font-semibold">{plan.name}</h3>
                  <div className="mt-2">
                    <span className="text-2xl font-bold">{plan.price}</span>
                    <span className="text-muted-foreground">{plan.period}</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{plan.description}</p>
                </div>

                <div className="space-y-3 mb-6">
                  {plan.features.map((feature, featureIndex) => (
                    <div key={featureIndex} className="flex items-center justify-between">
                      <span className="text-sm">{typeof feature === 'string' ? feature : String(feature)}</span>
                      <div className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-green-500" />
                      </div>
                    </div>
                  ))}
                </div>

                <Button
                  variant={plan.buttonVariant}
                  className="w-full"
                  onClick={() => {
                    if (plan.name !== '体验版') {
                      onUpgrade();
                    }
                  }}
                  disabled={plan.name === '体验版'}
                >
                  {plan.buttonText}
                </Button>
              </div>
            ))}
          </div>

          {/* 优惠提示 */}
          <div className="p-4 rounded-lg border border-border bg-accent text-center">
            <div className="flex items-center justify-center gap-2 text-foreground">
              <Sparkles className="h-4 w-4" />
              <span className="text-sm font-medium">限时优惠：年付可享受8折优惠，省80-202元</span>
            </div>
          </div>
        </div>

        <DialogFooter className="flex gap-2">
          <Button variant="outline" onClick={onClose}>
            稍后再说
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}