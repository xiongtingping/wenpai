/**
 * 支付计时器测试页面
 * 用于测试新用户限时优惠功能
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Clock, Gift, RefreshCw, Trash2, User, Calendar } from 'lucide-react';
import { useUnifiedAuthContext } from '@/contexts/UnifiedAuthContext';
import { 
  getPromoStatus, 
  resetPaymentCenterAccessTime, 
  PROMO_DURATION 
} from '@/utils/paymentTimer';

export default function PaymentTimerTestPage() {
  const { user: currentUser, isAuthenticated: currentIsAuthenticated } = useUnifiedAuthContext();
  const [promoStatus, setPromoStatus] = useState(getPromoStatus(currentUser?.id));
  const [currentTime, setCurrentTime] = useState(new Date());

  // 更新当前时间和优惠状态
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
      setPromoStatus(getPromoStatus(currentUser?.id));
    }, 1000);

    return () => clearInterval(interval);
  }, [currentUser?.id]);

  /**
   * 重置支付中心访问时间
   */
  const handleResetTimer = () => {
    resetPaymentCenterAccessTime(currentUser?.id);
    setPromoStatus(getPromoStatus(currentUser?.id));
  };

  /**
   * 模拟访问支付中心
   */
  const handleSimulateAccess = () => {
    // 清除现有的访问时间，然后重新获取（会创建新的访问时间）
    resetPaymentCenterAccessTime(currentUser?.id);
    setPromoStatus(getPromoStatus(currentUser?.id));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white p-8">
      <div className="container mx-auto max-w-4xl">
        {/* 页面标题 */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">支付计时器测试</h1>
          <p className="text-gray-600">测试新用户限时优惠功能</p>
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">登录状态</p>
                <p className="font-medium">
                  {currentIsAuthenticated ? (
                    <Badge variant="default">已登录</Badge>
                  ) : (
                    <Badge variant="secondary">未登录</Badge>
                  )}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">用户ID</p>
                <p className="font-mono text-sm">{currentUser?.id || '未登录'}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 优惠状态 */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gift className="h-5 w-5" />
              限时优惠状态
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* 优惠状态指示器 */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">优惠状态</span>
                {promoStatus.isActive ? (
                  <Badge className="bg-green-100 text-green-800 border-green-200">
                    <Clock className="h-3 w-3 mr-1" />
                    优惠进行中
                  </Badge>
                ) : (
                  <Badge variant="secondary">
                    优惠已结束
                  </Badge>
                )}
              </div>

              {/* 剩余时间 */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">剩余时间</span>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-blue-500" />
                  <span className="font-mono text-lg font-bold text-blue-600">
                    {promoStatus.formattedTime}
                  </span>
                </div>
              </div>

              {/* 访问时间 */}
              {promoStatus.accessTime && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">访问时间</span>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <span className="font-mono text-sm">
                      {promoStatus.accessTime.toLocaleString()}
                    </span>
                  </div>
                </div>
              )}

              {/* 当前时间 */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">当前时间</span>
                <span className="font-mono text-sm">
                  {currentTime.toLocaleString()}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 优惠信息 */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>优惠信息</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">优惠时长</span>
                <span className="font-medium">30分钟</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">计时方式</span>
                <span className="font-medium">从访问支付中心开始计时</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">存储方式</span>
                <span className="font-medium">localStorage</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">存储键名</span>
                <span className="font-mono text-xs">
                  payment_center_access_time_{currentUser?.id || 'anonymous'}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 操作按钮 */}
        <Card>
          <CardHeader>
            <CardTitle>测试操作</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              <Button
                onClick={handleSimulateAccess}
                className="flex items-center gap-2"
                disabled={!currentIsAuthenticated}
              >
                <RefreshCw className="h-4 w-4" />
                模拟访问支付中心
              </Button>
              
              <Button
                onClick={handleResetTimer}
                variant="outline"
                className="flex items-center gap-2"
                disabled={!currentIsAuthenticated}
              >
                <Trash2 className="h-4 w-4" />
                重置计时器
              </Button>
            </div>
            
            {!currentIsAuthenticated && (
              <p className="text-sm text-gray-500 mt-2">
                请先登录以进行测试
              </p>
            )}
          </CardContent>
        </Card>

        {/* 使用说明 */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>使用说明</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm text-gray-600">
              <p>1. <strong>模拟访问支付中心</strong>：清除现有计时并重新开始30分钟倒计时</p>
              <p>2. <strong>重置计时器</strong>：清除localStorage中的访问时间记录</p>
              <p>3. <strong>优惠状态</strong>：实时显示当前优惠是否有效</p>
              <p>4. <strong>剩余时间</strong>：显示距离优惠结束的剩余时间</p>
              <Separator className="my-4" />
              <p className="text-xs text-gray-500">
                注意：此功能仅用于测试。在实际使用中，用户第一次访问支付中心页面时会自动开始计时。
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 