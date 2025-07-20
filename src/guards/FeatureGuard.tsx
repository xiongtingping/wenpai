/**
 * 功能访问守卫组件
 * 用于检查用户是否有权限使用特定功能
 * 
 * 使用方式：
 * <FeatureGuard feature="creative-studio">
 *   <CreativeStudioPage />
 * </FeatureGuard>
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Crown, Lock, Sparkles, ArrowRight } from 'lucide-react';
import { useUnifiedAuth } from '@/contexts/UnifiedAuthContext';
import { useToast } from '@/hooks/use-toast';
import { SUBSCRIPTION_PLANS } from '@/config/subscriptionPlans';
import { FeatureGuardProps } from './types';

/**
 * 功能访问守卫组件
 */
const FeatureGuard: React.FC<FeatureGuardProps> = ({
  feature,
  children,
  fallback,
  showPermissionHint = true
}) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useUnifiedAuth();
  
  const userPlan = user?.subscription?.tier || user?.plan || 'trial';
  // 移除 import { checkFeaturePermission } from '@/utils/permissionChecker';
  // 注释或移除所有 checkFeaturePermission 相关逻辑

  // 如果有权限，直接渲染子组件
  if (true) { // 暂时允许所有访问，权限逻辑待重新实现
    return <>{children}</>;
  }

  // 如果提供了自定义降级组件，使用它
  if (fallback) {
    return <>{fallback}</>;
  }

  // 如果不需要显示权限提示，返回null
  if (!showPermissionHint) {
    return null;
  }

  // 获取需要的计划信息
  const requiredPlan = 'pro'; // 默认需要专业版
  const planInfo = SUBSCRIPTION_PLANS.find(plan => plan.tier === requiredPlan);

  return (
    <div className="flex items-center justify-center min-h-[200px]">
      <Card className="w-full max-w-md">
        <CardContent className="p-6">
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-full mx-auto">
              <Lock className="h-6 w-6 text-purple-600" />
            </div>
            
            <div>
              <h4 className="font-semibold text-purple-800 mb-2 flex items-center gap-2">
                <Lock className="h-4 w-4" />
                需要{requiredPlan === 'pro' ? '专业版' : '高级版'}权限
              </h4>
              <p className="text-sm text-purple-700">
                您当前的计划是 {userPlan}，需要升级到 {requiredPlan === 'pro' ? '专业版' : '高级版'} 才能使用此功能。
              </p>
            </div>

            <div className="space-y-2">
              <Button 
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white border-0"
                onClick={() => {
                  localStorage.setItem('selectedPlan', requiredPlan || 'pro');
                  navigate('/payment');
                  toast({
                    title: "跳转到支付页面",
                    description: "请选择适合的计划进行升级",
                  });
                }}
              >
                立即升级
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => navigate('/pricing')}
              >
                查看价格
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FeatureGuard; 