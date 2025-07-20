/**
 * 预览权限守卫组件
 * 允许低版本用户预览功能界面，但添加透明遮罩层和升级提示
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Crown, Lock, Sparkles, ArrowRight, Eye, X } from 'lucide-react';
import { useUnifiedAuth } from '@/contexts/UnifiedAuthContext';
import { useToast } from '@/hooks/use-toast';
// import { checkFeaturePermission } from '@/utils/permissionChecker';
import { SUBSCRIPTION_PLANS } from '@/config/subscriptionPlans';

interface PreviewGuardProps {
  /** 功能ID */
  featureId: string;
  /** 功能名称 */
  featureName: string;
  /** 功能描述 */
  featureDescription: string;
  /** 子组件 */
  children: React.ReactNode;
  /** 是否显示升级提示 */
  showUpgradePrompt?: boolean;
  /** 自定义升级按钮文本 */
  upgradeButtonText?: string;
  /** 是否允许关闭预览模式 */
  allowClose?: boolean;
}

/**
 * 预览权限守卫组件
 */
export const PreviewGuard: React.FC<PreviewGuardProps> = ({
  featureId,
  featureName,
  featureDescription,
  children,
  showUpgradePrompt = true,
  upgradeButtonText = "立即升级",
  allowClose = false
}) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, isAuthenticated } = useUnifiedAuth();
  
  const userPlan = user?.subscription?.tier || user?.plan || 'trial';
  // const permissionResult = checkFeaturePermission(featureId, userPlan);
  const [showPreview, setShowPreview] = useState(true);

  // 如果有权限，直接渲染子组件
  // if (permissionResult.hasPermission) {
  //   return <>{children}</>;
  // }

  // 获取需要的计划信息
  // const requiredPlan = permissionResult.requiredPlan;
  // const planInfo = SUBSCRIPTION_PLANS.find(plan => plan.tier === requiredPlan);

  return (
    <div className="relative">
      {/* 主要内容 */}
      <div className={showPreview ? 'pointer-events-none select-none' : ''}>
        {children}
      </div>

      {/* 透明遮罩层 */}
      {showPreview && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-[1px] z-50 flex items-center justify-center p-4">
          {/* 升级提示卡片 */}
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/20 max-w-md w-full max-h-[90vh] overflow-y-auto relative">
            {/* 关闭按钮 */}
            {allowClose && (
              <button
                onClick={() => setShowPreview(false)}
                className="absolute top-4 right-4 p-1 rounded-full hover:bg-gray-100 transition-colors z-10"
              >
                <X className="w-4 h-4 text-gray-500" />
              </button>
            )}
            
            {/* 卡片内容 */}
            <div className="p-6">

            {/* 图标 */}
            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-4">
              <Eye className="h-8 w-8 text-white" />
            </div>

            {/* 标题 */}
            <h3 className="text-xl font-bold text-gray-900 text-center mb-2">
              {featureName}
            </h3>
            <p className="text-gray-600 text-center mb-6">
              {featureDescription}
            </p>

            {/* 权限提示 */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg border border-blue-200 mb-4">
              <div className="flex items-center gap-2 mb-2">
                <Lock className="h-4 w-4 text-blue-600" />
                <span className="font-semibold text-blue-800">
                  需要{userPlan === 'pro' ? '专业版' : '高级版'}权限
                </span>
              </div>
              <p className="text-sm text-blue-700">
                您当前使用的是 {userPlan} 版本，需要升级到 {userPlan === 'pro' ? '专业版' : '高级版'} 才能使用此功能。
              </p>
            </div>

            {/* 计划特权 */}
            {/* {planInfo && (
              <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-4 rounded-lg border border-amber-200 mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="h-4 w-4 text-amber-600" />
                  <span className="font-semibold text-amber-800">
                    {planInfo.name}特权
                  </span>
                </div>
                <ul className="text-sm text-amber-700 space-y-1">
                  {planInfo.features.slice(0, 3).map((feature, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <div className="w-1 h-1 bg-amber-500 rounded-full"></div>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            )} */}

            {/* 操作按钮 */}
            <div className="space-y-3">
              <Button 
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white border-0"
                onClick={() => {
                  localStorage.setItem('selectedPlan', userPlan === 'pro' ? 'pro' : 'pro');
                  navigate('/payment');
                  toast({
                    title: "正在为您跳转到支付页面",
                    description: "请完成支付以开通相应功能",
                  });
                }}
              >
                {upgradeButtonText}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
              
              {allowClose && (
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => setShowPreview(false)}
                >
                  继续预览
                </Button>
              )}
            </div>

            {/* 提示信息 */}
            <div className="text-xs text-gray-500 text-center mt-4">
              <p>💡 您可以预览功能界面，升级后即可正常使用</p>
            </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PreviewGuard; 