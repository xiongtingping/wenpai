import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useUnifiedAuth } from '@/contexts/UnifiedAuthContext';
import { usePermission } from '@/hooks/usePermission';
import { 
  Crown, 
  Star, 
  CheckCircle, 
  XCircle, 
  ArrowRight,
  Zap,
  Shield,
  Gift
} from 'lucide-react';

/**
 * VIP页面组件
 */
const VIPPage: React.FC = () => {
  const { user, isAuthenticated } = useUnifiedAuth();
  const vipPermission = usePermission('vip:required');
  const [loading, setLoading] = useState(false);

  // VIP特权列表
  const vipFeatures = [
    {
      icon: <Zap className="h-5 w-5" />,
      title: 'AI创意魔方',
      description: '无限使用AI创意生成功能',
      available: true
    },
    {
      icon: <Shield className="h-5 w-5" />,
      title: '品牌库',
      description: '访问专业品牌素材库',
      available: true
    },
    {
      icon: <Gift className="h-5 w-5" />,
      title: '内容提取器',
      description: '智能内容提取和分析',
      available: true
    },
    {
      icon: <Star className="h-5 w-5" />,
      title: '优先客服',
      description: '专属客服支持',
      available: true
    }
  ];

  // 处理升级VIP
  const handleUpgrade = () => {
    setLoading(true);
    // 跳转到支付页面
    window.location.href = '/payment';
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* 页面标题 */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Crown className="h-16 w-16 text-yellow-500" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            VIP会员中心
          </h1>
          <p className="text-gray-600">
            解锁所有高级功能，提升创作效率
          </p>
        </div>

        {/* VIP状态卡片 */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Crown className="h-5 w-5" />
              会员状态
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">当前状态</p>
                <Badge variant={vipPermission.pass ? "default" : "secondary"} className="mt-1">
                  {vipPermission.pass ? "VIP会员" : "普通用户"}
                </Badge>
              </div>
              {!vipPermission.pass && (
                <Button onClick={handleUpgrade} disabled={loading}>
                  {loading ? "处理中..." : "升级VIP"}
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* VIP特权列表 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {vipFeatures.map((feature, index) => (
            <Card key={index}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  {feature.icon}
                  {feature.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-3">{feature.description}</p>
                <div className="flex items-center gap-2">
                  {feature.available ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-500" />
                  )}
                  <span className="text-sm">
                    {feature.available ? "可用" : "不可用"}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* 用户信息 */}
        {user && (
          <Card>
            <CardHeader>
              <CardTitle>用户信息</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">用户ID</span>
                  <span className="text-sm font-mono">{user.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">邮箱</span>
                  <span className="text-sm">{user.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">用户名</span>
                  <span className="text-sm">{user.username || '未设置'}</span>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">VIP状态</span>
                  <Badge variant={user.isVip ? "default" : "secondary"}>
                    {user.isVip ? "VIP用户" : "普通用户"}
                  </Badge>
                </div>
                {user.permissions && (
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">权限</span>
                    <span className="text-sm">{user.permissions.join(', ') || '无'}</span>
                  </div>
                )}
                {user.roles && (
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">角色</span>
                    <span className="text-sm">{user.roles.join(', ') || '无'}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default VIPPage; 