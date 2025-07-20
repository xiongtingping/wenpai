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
import { checkFeaturePermission } from '@/utils/permissionChecker';
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
  const permissionResult = checkFeaturePermission(feature, userPlan);

  // 如果有权限，直接渲染子组件
  if (permissionResult.hasPermission) {
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
  const requiredPlan = permissionResult.requiredPlan;
  const planInfo = SUBSCRIPTION_PLANS.find(plan => plan.tier === requiredPlan);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center p-4">
      <Card className="max-w-md w-full text-center">
        <CardHeader>
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mb-4">
            <Crown className="h-8 w-8 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">功能访问受限</CardTitle>
          <CardDescription className="text-gray-600">
            此功能需要更高等级的权限
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-4 rounded-lg border border-purple-200">
            <h4 className="font-semibold text-purple-800 mb-2 flex items-center gap-2">
              <Lock className="h-4 w-4" />
              需要{requiredPlan === 'pro' ? '专业版' : '高级版'}权限
            </h4>
            <p className="text-sm text-purple-700">
              {permissionResult.message}
            </p>
          </div>

          {planInfo && (
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-4 rounded-lg border border-amber-200">
              <h4 className="font-semibold text-amber-800 mb-2 flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                {planInfo.name}特权
              </h4>
              <ul className="text-sm text-amber-700 space-y-1 text-left">
                {planInfo.features.slice(0, 4).map((feature, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <div className="w-1 h-1 bg-amber-500 rounded-full"></div>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="space-y-2">
            <Button 
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white border-0"
              onClick={() => {
                localStorage.setItem('selectedPlan', requiredPlan || 'pro');
                navigate('/payment');
                toast({
                  title: "正在为您跳转到支付页面",
                  description: "请完成支付以开通相应功能",
                });
              }}
            >
              立即升级
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
            
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => navigate('/')}
            >
              返回首页
            </Button>
          </div>

          {permissionResult.suggestions && permissionResult.suggestions.length > 0 && (
            <div className="text-xs text-gray-500 space-y-1">
              {permissionResult.suggestions.map((suggestion, index) => (
                <p key={index}>• {suggestion}</p>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default FeatureGuard; 