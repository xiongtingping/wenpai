/**
 * 限时优惠测试页面
 * 用于测试30分钟优惠倒计时功能
 */

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UnifiedPermissionGuard } from '@/components/auth/UnifiedPermissionGuard';
import { useUnifiedAuth } from '@/contexts/UnifiedAuthContext';

const DiscountTestPage: React.FC = () => {
  const { user, updateUser } = useUnifiedAuth();
  const [testMode, setTestMode] = useState<'new-user' | 'expired' | 'normal'>('normal');

  const simulateNewUser = () => {
    const now = new Date();
    updateUser({
      ...user,
      registrationDate: now.toISOString()
    });
    setTestMode('new-user');
  };

  const simulateExpiredUser = () => {
    const expiredTime = new Date();
    expiredTime.setMinutes(expiredTime.getMinutes() - 35); // 35分钟前注册
    updateUser({
      ...user,
      registrationDate: expiredTime.toISOString()
    });
    setTestMode('expired');
  };

  const resetUser = () => {
    updateUser({
      ...user,
      registrationDate: undefined
    });
    setTestMode('normal');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>限时优惠倒计时测试</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-4">
              <Button 
                onClick={simulateNewUser}
                variant={testMode === 'new-user' ? 'default' : 'outline'}
              >
                模拟新用户（30分钟内）
              </Button>
              <Button 
                onClick={simulateExpiredUser}
                variant={testMode === 'expired' ? 'default' : 'outline'}
              >
                模拟过期用户（超过30分钟）
              </Button>
              <Button 
                onClick={resetUser}
                variant={testMode === 'normal' ? 'default' : 'outline'}
              >
                重置用户状态
              </Button>
            </div>
            
            <div className="text-sm text-muted-foreground">
              当前用户注册时间: {user?.registrationDate || '未设置'}
            </div>
            
            <div className="text-sm text-muted-foreground">
              测试模式: {testMode}
            </div>
          </CardContent>
        </Card>

        {/* 权限守卫测试区域 */}
        <UnifiedPermissionGuard
          requiredPermission="auth:required"
          featureName="全网雷达"
          description="实时热点话题追踪和分析"
        >
          <Card>
            <CardContent className="p-8 text-center">
              <h2 className="text-2xl font-bold mb-4">全网雷达功能</h2>
              <p className="text-muted-foreground">
                这里是全网雷达的主要功能界面。需要登录即可访问。
              </p>
            </CardContent>
          </Card>
        </UnifiedPermissionGuard>

        <UnifiedPermissionGuard
          requiredPermission="feature:creative-studio"
          featureName="创意魔方"
          description="AI驱动的创意内容生成工具"
        >
          <Card>
            <CardContent className="p-8 text-center">
              <h2 className="text-2xl font-bold mb-4">创意魔方功能</h2>
              <p className="text-muted-foreground">
                这里是创意魔方的主要功能界面。只有专业版或高级版用户才能访问。
              </p>
            </CardContent>
          </Card>
        </UnifiedPermissionGuard>

        <UnifiedPermissionGuard
          requiredPermission="feature:brand-library"
          featureName="品牌库"
          description="企业级品牌资产管理系统"
        >
          <Card>
            <CardContent className="p-8 text-center">
              <h2 className="text-2xl font-bold mb-4">品牌库功能</h2>
              <p className="text-muted-foreground">
                这里是品牌库的主要功能界面。只有高级版用户才能访问。
              </p>
            </CardContent>
          </Card>
        </UnifiedPermissionGuard>


      </div>
    </div>
  );
};

export default DiscountTestPage;
