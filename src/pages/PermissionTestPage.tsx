/**
 * 权限测试页面
 * 用于测试和展示所有功能的权限状态
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useUnifiedAuth } from '@/contexts/UnifiedAuthContext';
import { 
  checkFeaturePermission, 
  getAvailableFeatures, 
  getUnavailableFeatures,
  FEATURE_PERMISSIONS 
} from '@/utils/permissionChecker';
import { getConfigStatus } from '@/utils/configValidator';
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Settings, 
  User, 
  Shield,
  Zap,
  Star,
  Lock,
  Unlock
} from 'lucide-react';

export default function PermissionTestPage() {
  const { user } = useUnifiedAuth();
  const [configStatus, setConfigStatus] = useState<any>(null);
  const [availableFeatures, setAvailableFeatures] = useState<any[]>([]);
  const [unavailableFeatures, setUnavailableFeatures] = useState<any[]>([]);

  useEffect(() => {
    // 获取配置状态
    const status = getConfigStatus();
    setConfigStatus(status);

    // 获取功能权限状态
    const userPlan = user?.plan || 'trial';
    const available = getAvailableFeatures(userPlan);
    const unavailable = getUnavailableFeatures(userPlan);
    
    setAvailableFeatures(available);
    setUnavailableFeatures(unavailable);
  }, [user]);

  const getPlanIcon = (plan: string) => {
    switch (plan) {
      case 'premium':
        return <Star className="h-4 w-4 text-yellow-500" />;
      case 'pro':
        return <Zap className="h-4 w-4 text-blue-500" />;
      default:
        return <User className="h-4 w-4 text-gray-500" />;
    }
  };

  const getPlanName = (plan: string) => {
    switch (plan) {
      case 'premium':
        return '高级版';
      case 'pro':
        return '专业版';
      default:
        return '试用版';
    }
  };

  const getConfigStatusIcon = (status: boolean) => {
    return status ? (
      <CheckCircle className="h-4 w-4 text-green-500" />
    ) : (
      <XCircle className="h-4 w-4 text-red-500" />
    );
  };

  const testFeaturePermission = (featureId: string) => {
    const userPlan = user?.plan || 'trial';
    const result = checkFeaturePermission(featureId, userPlan);
    
    console.group(`🔐 测试功能权限: ${featureId}`);
    console.log('功能名称:', FEATURE_PERMISSIONS[featureId]?.name);
    console.log('用户计划:', userPlan);
    console.log('权限结果:', result);
    console.groupEnd();
    
    alert(`功能: ${FEATURE_PERMISSIONS[featureId]?.name}\n权限: ${result.hasPermission ? '有权限' : '无权限'}\n原因: ${result.message || '无'}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">权限测试页面</h1>
          <p className="text-gray-600">测试和展示所有功能的权限状态</p>
        </div>

        {/* 用户信息 */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              用户信息
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">用户ID:</span>
                <span className="text-sm text-gray-600">{user?.id || '未登录'}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">用户名:</span>
                <span className="text-sm text-gray-600">{user?.username || '未登录'}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">当前计划:</span>
                <div className="flex items-center gap-1">
                  {getPlanIcon(user?.plan || 'trial')}
                  <Badge variant={user?.plan === 'premium' ? 'default' : user?.plan === 'pro' ? 'secondary' : 'outline'}>
                    {getPlanName(user?.plan || 'trial')}
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 系统配置状态 */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              系统配置状态
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm font-medium">OpenAI API</span>
                {getConfigStatusIcon(configStatus?.openai)}
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm font-medium">Authing认证</span>
                {getConfigStatusIcon(configStatus?.authing)}
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm font-medium">Creem支付</span>
                {getConfigStatusIcon(configStatus?.creem)}
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm font-medium">DeepSeek API</span>
                {getConfigStatusIcon(configStatus?.deepseek)}
              </div>
            </div>
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-2 text-sm text-blue-800">
                <AlertTriangle className="h-4 w-4" />
                <span>整体配置状态: {configStatus?.overall ? '正常' : '异常'}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 可用功能 */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Unlock className="h-5 w-5 text-green-500" />
              可用功能 ({availableFeatures.length})
            </CardTitle>
            <CardDescription>
              您当前计划可以使用的功能
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {availableFeatures.map((feature) => (
                <div key={feature.id} className="p-4 border border-green-200 bg-green-50 rounded-lg">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-medium text-green-900">{feature.name}</h3>
                    <Badge variant="outline" className="text-green-700 border-green-300">
                      {getPlanName(feature.requiredPlan)}
                    </Badge>
                  </div>
                  <p className="text-sm text-green-700 mb-3">{feature.description}</p>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => testFeaturePermission(feature.id)}
                    className="text-green-700 border-green-300 hover:bg-green-100"
                  >
                    测试权限
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 不可用功能 */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5 text-red-500" />
              不可用功能 ({unavailableFeatures.length})
            </CardTitle>
            <CardDescription>
              需要升级计划或配置才能使用的功能
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {unavailableFeatures.map((feature) => (
                <div key={feature.id} className="p-4 border border-red-200 bg-red-50 rounded-lg">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-medium text-red-900">{feature.name}</h3>
                    <Badge variant="outline" className="text-red-700 border-red-300">
                      {getPlanName(feature.requiredPlan)}
                    </Badge>
                  </div>
                  <p className="text-sm text-red-700 mb-2">{feature.description}</p>
                  <p className="text-xs text-red-600 mb-3">原因: {feature.reason}</p>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => testFeaturePermission(feature.id)}
                    className="text-red-700 border-red-300 hover:bg-red-100"
                  >
                    测试权限
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 全局权限检查 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              全局权限检查
            </CardTitle>
            <CardDescription>
              在浏览器控制台中运行权限检查命令
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium mb-2">可用命令:</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <code className="bg-gray-200 px-2 py-1 rounded">__checkPermission__('content-adaptation')</code>
                    <span className="text-gray-600">检查特定功能权限</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <code className="bg-gray-200 px-2 py-1 rounded">__checkAllPermissions__()</code>
                    <span className="text-gray-600">检查所有功能权限</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <code className="bg-gray-200 px-2 py-1 rounded">__validateConfig__()</code>
                    <span className="text-gray-600">验证系统配置</span>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button 
                  onClick={() => {
                    if (typeof window !== 'undefined' && (window as any).__checkAllPermissions__) {
                      (window as any).__checkAllPermissions__();
                    }
                  }}
                >
                  运行全局检查
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => {
                    if (typeof window !== 'undefined' && (window as any).__validateConfig__) {
                      (window as any).__validateConfig__();
                    }
                  }}
                >
                  验证配置
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 