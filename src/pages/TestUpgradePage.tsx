/**
 * 补差价升级测试页面
 * @description 用于测试临期提醒和补差价升级功能
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SubscriptionExpiryAlert } from '@/components/subscription/SubscriptionExpiryAlert';
import { SubscriptionStatusBadge } from '@/components/subscription/SubscriptionStatusBadge';
import { ProratedUpgradeCard } from '@/components/subscription/ProratedUpgradeCard';
import { useSubscriptionStatus } from '@/hooks/useSubscriptionStatus';
import { useNavigate } from 'react-router-dom';
import { 
  TestTube, 
  Crown, 
  Calendar,
  Calculator
} from 'lucide-react';

export default function TestUpgradePage() {
  const { primaryStatus, hasActiveSubscription, loading } = useSubscriptionStatus();
  const navigate = useNavigate();

  const handleUpgrade = (calculation: any) => {
    console.log('升级计算结果:', calculation);
    // 这里可以跳转到实际的支付页面
    navigate('/payment', {
      state: {
        action: 'upgrade',
        calculation
      }
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* 页面标题 */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <TestTube className="h-16 w-16 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            补差价升级功能测试
          </h1>
          <p className="text-gray-600">
            测试订阅临期提醒和补差价升级功能
          </p>
        </div>

        {/* 订阅状态展示 */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="w-5 h-5" />
              <span>当前订阅状态</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                <p className="text-gray-600">加载订阅状态...</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">订阅状态</span>
                  <SubscriptionStatusBadge />
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-blue-600">
                      {primaryStatus.statusLabel}
                    </div>
                    <div className="text-sm text-gray-600">状态</div>
                  </div>
                  
                  <div>
                    <div className="text-2xl font-bold text-green-600">
                      {primaryStatus.daysRemaining}
                    </div>
                    <div className="text-sm text-gray-600">剩余天数</div>
                  </div>
                  
                  <div>
                    <div className="text-2xl font-bold text-orange-600">
                      {primaryStatus.needsAlert ? '是' : '否'}
                    </div>
                    <div className="text-sm text-gray-600">需要提醒</div>
                  </div>
                  
                  <div>
                    <div className={`text-2xl font-bold ${
                      primaryStatus.alertLevel === 'danger' ? 'text-red-600' :
                      primaryStatus.alertLevel === 'warning' ? 'text-orange-600' :
                      'text-yellow-600'
                    }`}>
                      {primaryStatus.alertLevel}
                    </div>
                    <div className="text-sm text-gray-600">提醒级别</div>
                  </div>
                </div>

                {primaryStatus.alertMessage && (
                  <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-sm text-yellow-800">{primaryStatus.alertMessage}</p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* 临期提醒组件测试 */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center space-x-2">
            <Crown className="w-5 h-5 text-yellow-600" />
            <span>临期提醒组件</span>
          </h2>
          <SubscriptionExpiryAlert />
        </div>

        {/* 补差价升级测试 */}
        {hasActiveSubscription && (
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center space-x-2">
              <Calculator className="w-5 h-5 text-blue-600" />
              <span>补差价升级</span>
            </h2>
            
            <div className="grid gap-6 md:grid-cols-2">
              <ProratedUpgradeCard
                targetTier="premium"
                targetPeriod="monthly"
                onUpgrade={handleUpgrade}
              />
              
              <ProratedUpgradeCard
                targetTier="premium"
                targetPeriod="yearly"
                onUpgrade={handleUpgrade}
              />
            </div>
          </div>
        )}

        {/* 功能说明 */}
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-blue-700">功能说明</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-blue-600 space-y-2">
            <div>• <strong>临期提醒</strong>：7天/3天/1天/已过期的分级提醒</div>
            <div>• <strong>补差价升级</strong>：按剩余时间比例计算升级费用</div>
            <div>• <strong>状态同步</strong>：导航栏实时显示订阅状态</div>
            <div>• <strong>智能计算</strong>：支持同周期和跨周期升级</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}