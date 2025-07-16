/**
 * 支付状态检测测试页面
 * 用于测试支付状态监控功能
 */

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { usePaymentStatus } from '@/hooks/usePaymentStatus';
import { EnhancedPaymentStatusMonitor } from '@/components/payment/EnhancedPaymentStatusMonitor';
import { PaymentStatusRecovery } from '@/components/payment/PaymentStatusRecovery';
import { paymentStatusService } from '@/services/paymentStatusService';
import { 
  Play, 
  Pause, 
  RefreshCw, 
  Trash2, 
  Settings, 
  TestTube,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

export default function PaymentStatusTestPage() {
  const [testCheckoutId, setTestCheckoutId] = useState('');
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [showAdvancedInfo, setShowAdvancedInfo] = useState(false);
  const [enableNotifications, setEnableNotifications] = useState(true);
  const [enableSound, setEnableSound] = useState(true);
  const { toast } = useToast();

  // 使用支付状态Hook
  const {
    paymentStatus,
    isRefreshing,
    isPaused,
    retryCount,
    startMonitoring,
    stopMonitoring,
    pauseMonitoring,
    resumeMonitoring,
    refreshStatus,
    clearStatus,
  } = usePaymentStatus({
    checkoutId: isMonitoring ? testCheckoutId : undefined,
    autoRefresh: isMonitoring,
    refreshInterval: 3000,
    maxRetries: 10,
    enableNotifications,
    enableSound,
    onStatusChange: (status) => {
      console.log('支付状态变化:', status);
    },
    onPaymentSuccess: (paymentData) => {
      console.log('支付成功:', paymentData);
      toast({
        title: "测试支付成功",
        description: "模拟支付成功回调",
      });
    },
    onPaymentFailed: (error) => {
      console.log('支付失败:', error);
      toast({
        title: "测试支付失败",
        description: error,
        variant: "destructive",
      });
    },
    onPaymentExpired: () => {
      console.log('支付过期');
      toast({
        title: "测试支付过期",
        description: "模拟支付过期回调",
        variant: "destructive",
      });
    },
  });

  // 开始监控
  const handleStartMonitoring = () => {
    if (!testCheckoutId.trim()) {
      toast({
        title: "请输入Checkout ID",
        description: "请输入有效的支付ID",
        variant: "destructive",
      });
      return;
    }

    setIsMonitoring(true);
    startMonitoring(testCheckoutId);
    toast({
      title: "开始监控",
      description: `正在监控支付状态: ${testCheckoutId}`,
    });
  };

  // 停止监控
  const handleStopMonitoring = () => {
    setIsMonitoring(false);
    stopMonitoring();
    toast({
      title: "停止监控",
      description: "已停止监控支付状态",
    });
  };

  // 创建测试数据
  const createTestData = () => {
    const testCheckoutId = `test_${Date.now()}`;
    setTestCheckoutId(testCheckoutId);
    
    // 保存测试支付状态
    paymentStatusService.savePaymentStatus(testCheckoutId, {
      status: 'pending',
      message: '测试支付等待中',
      progress: 0,
      amount: 9900, // 99元
      currency: 'CNY',
      createdAt: new Date().toISOString(),
    });

    toast({
      title: "测试数据已创建",
      description: `测试Checkout ID: ${testCheckoutId}`,
    });
  };

  // 清理测试数据
  const clearTestData = () => {
    if (testCheckoutId) {
      paymentStatusService.removePaymentStatus(testCheckoutId);
    }
    setTestCheckoutId('');
    setIsMonitoring(false);
    clearStatus();
    
    toast({
      title: "测试数据已清理",
      description: "所有测试数据已删除",
    });
  };

  // 获取状态图标
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'processing':
        return <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />;
      case 'pending':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case 'failed':
      case 'expired':
      case 'cancelled':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  // 获取状态颜色
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
      case 'expired':
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="container mx-auto max-w-6xl">
        {/* 页面标题 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <TestTube className="h-8 w-8 text-blue-600" />
            支付状态检测测试
          </h1>
          <p className="text-gray-600 mt-2">测试支付状态监控功能的各项特性</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 左侧：测试控制面板 */}
          <div className="space-y-6">
            {/* 测试配置 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  测试配置
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="checkoutId">Checkout ID</Label>
                  <Input
                    id="checkoutId"
                    placeholder="输入要测试的支付ID"
                    value={testCheckoutId}
                    onChange={(e) => setTestCheckoutId(e.target.value)}
                  />
                </div>

                <div className="flex gap-4">
                  <Button onClick={createTestData} variant="outline">
                    创建测试数据
                  </Button>
                  <Button onClick={clearTestData} variant="outline">
                    <Trash2 className="h-4 w-4 mr-2" />
                    清理数据
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* 监控控制 */}
            <Card>
              <CardHeader>
                <CardTitle>监控控制</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  {!isMonitoring ? (
                    <Button onClick={handleStartMonitoring} className="flex-1">
                      <Play className="h-4 w-4 mr-2" />
                      开始监控
                    </Button>
                  ) : (
                    <Button onClick={handleStopMonitoring} variant="destructive" className="flex-1">
                      <Pause className="h-4 w-4 mr-2" />
                      停止监控
                    </Button>
                  )}
                  
                  <Button 
                    onClick={isPaused ? resumeMonitoring : pauseMonitoring}
                    variant="outline"
                    disabled={!isMonitoring}
                  >
                    {isPaused ? '恢复' : '暂停'}
                  </Button>
                  
                  <Button 
                    onClick={refreshStatus}
                    variant="outline"
                    disabled={!isMonitoring || isRefreshing}
                  >
                    <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                  </Button>
                </div>

                <div className="text-sm text-gray-600">
                  重试次数: {retryCount}
                </div>
              </CardContent>
            </Card>

            {/* 功能开关 */}
            <Card>
              <CardHeader>
                <CardTitle>功能开关</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="notifications">浏览器通知</Label>
                  <Switch
                    id="notifications"
                    checked={enableNotifications}
                    onCheckedChange={setEnableNotifications}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="sound">提示音</Label>
                  <Switch
                    id="sound"
                    checked={enableSound}
                    onCheckedChange={setEnableSound}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="advanced">高级信息</Label>
                  <Switch
                    id="advanced"
                    checked={showAdvancedInfo}
                    onCheckedChange={setShowAdvancedInfo}
                  />
                </div>
              </CardContent>
            </Card>

            {/* 当前状态 */}
            <Card>
              <CardHeader>
                <CardTitle>当前状态</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2">
                  {getStatusIcon(paymentStatus.status)}
                  <Badge className={getStatusColor(paymentStatus.status)}>
                    {paymentStatus.message}
                  </Badge>
                </div>
                
                <div className="text-sm text-gray-600">
                  <div>状态: {paymentStatus.status}</div>
                  <div>进度: {paymentStatus.progress}%</div>
                  {paymentStatus.amount && (
                    <div>金额: ¥{(paymentStatus.amount / 100).toFixed(2)}</div>
                  )}
                  {paymentStatus.lastChecked && (
                    <div>最后检查: {new Date(paymentStatus.lastChecked).toLocaleTimeString()}</div>
                  )}
                  {paymentStatus.error && (
                    <div className="text-red-600">错误: {paymentStatus.error}</div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 右侧：监控组件 */}
          <div className="space-y-6">
            {/* 支付状态恢复测试 */}
            <Card>
              <CardHeader>
                <CardTitle>支付状态恢复测试</CardTitle>
              </CardHeader>
              <CardContent>
                <PaymentStatusRecovery
                  onRecoveryComplete={() => {
                    toast({
                      title: "恢复完成",
                      description: "支付状态已恢复",
                    });
                  }}
                  onNoActivePayments={() => {
                    toast({
                      title: "无活跃支付",
                      description: "没有发现需要恢复的支付状态",
                    });
                  }}
                />
              </CardContent>
            </Card>

            {/* 增强版支付状态监控 */}
            {isMonitoring && testCheckoutId && (
              <Card>
                <CardHeader>
                  <CardTitle>实时监控</CardTitle>
                </CardHeader>
                <CardContent>
                  <EnhancedPaymentStatusMonitor
                    checkoutId={testCheckoutId}
                    apiKey={import.meta.env.VITE_CREEM_API_KEY || ''}
                    onPaymentSuccess={(paymentData) => {
                      console.log('组件支付成功:', paymentData);
                    }}
                    onPaymentFailed={(error) => {
                      console.log('组件支付失败:', error);
                    }}
                    onPaymentExpired={() => {
                      console.log('组件支付过期');
                    }}
                    autoRefresh={true}
                    refreshInterval={3000}
                    maxRetries={10}
                    enableNotifications={enableNotifications}
                    enableSound={enableSound}
                    showAdvancedInfo={showAdvancedInfo}
                  />
                </CardContent>
              </Card>
            )}

            {/* 使用说明 */}
            <Card>
              <CardHeader>
                <CardTitle>使用说明</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-gray-600">
                <div>1. 输入一个有效的Checkout ID或点击"创建测试数据"</div>
                <div>2. 点击"开始监控"开始实时监控支付状态</div>
                <div>3. 可以暂停/恢复监控，或手动刷新状态</div>
                <div>4. 开启浏览器通知和提示音获得更好的体验</div>
                <div>5. 支付状态会自动保存到本地存储</div>
                <div>6. 页面刷新后可以恢复之前的支付状态</div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
} 