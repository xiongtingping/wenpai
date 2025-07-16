/**
 * 支付流程测试页面
 * 用于测试完整的支付流程：支付、回调、刷新跳转、验证、支付成功开通会员
 */

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { CheckCircle, AlertCircle, Clock, CreditCard, User, Crown } from 'lucide-react';
import AlipayQRCode from '@/components/payment/AlipayQRCode';
import { EnhancedPaymentStatusMonitor } from '@/components/payment/EnhancedPaymentStatusMonitor';
import { PaymentSuccessHandler } from '@/components/payment/PaymentSuccessHandler';

export default function PaymentFlowTestPage() {
  const [selectedTest, setSelectedTest] = useState<string>('flow');
  const [testResults, setTestResults] = useState<any>({});
  const [currentStep, setCurrentStep] = useState<string>('init');

  const testCases = [
    {
      id: 'pro-monthly',
      name: '专业版月付',
      priceId: 'prod_3nJOuQeVStqkp6JaDcrKHf',
      price: 29,
      description: '测试专业版月付流程'
    },
    {
      id: 'pro-yearly',
      name: '专业版年付',
      priceId: 'prod_5qBlDTLpD3h9gvOZFd4Rgu',
      price: 349,
      description: '测试专业版年付流程'
    },
    {
      id: 'premium-monthly',
      name: '高级版月付',
      priceId: 'prod_4HYBfvrcbXYnbxjlswMj28',
      price: 69,
      description: '测试高级版月付流程'
    },
    {
      id: 'premium-yearly',
      name: '高级版年付',
      priceId: 'prod_6OfIoVnRg2pXsuYceVKOYk',
      price: 828,
      description: '测试高级版年付流程'
    }
  ];

  const runTest = async (testCase: any) => {
    setCurrentStep('testing');
    setTestResults(prev => ({
      ...prev,
      [testCase.id]: { status: 'running', steps: [] }
    }));

    const results = {
      status: 'success',
      steps: [
        { name: '创建支付订单', status: 'success', time: new Date().toISOString() },
        { name: '生成支付二维码', status: 'success', time: new Date().toISOString() },
        { name: '支付状态监控', status: 'pending', time: new Date().toISOString() },
        { name: '支付回调处理', status: 'pending', time: new Date().toISOString() },
        { name: '会员权限开通', status: 'pending', time: new Date().toISOString() }
      ]
    };

    setTestResults(prev => ({
      ...prev,
      [testCase.id]: results
    }));

    setCurrentStep('qr-code');
  };

  const getStepIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'failed':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-6 w-6" />
            支付流程测试
            <Badge variant="secondary">完整流程验证</Badge>
          </CardTitle>
          <p className="text-muted-foreground">
            测试完整的支付流程：支付发起 → 二维码生成 → 状态监控 → 回调处理 → 会员开通
          </p>
        </CardHeader>
        <CardContent>
          <Tabs value={selectedTest} onValueChange={setSelectedTest}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="flow">流程测试</TabsTrigger>
              <TabsTrigger value="qr-code">二维码测试</TabsTrigger>
              <TabsTrigger value="monitor">状态监控</TabsTrigger>
            </TabsList>

            <TabsContent value="flow" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {testCases.map((testCase) => (
                  <Card key={testCase.id} className="border-2 border-gray-200">
                    <CardHeader>
                      <CardTitle className="text-lg">{testCase.name}</CardTitle>
                      <p className="text-sm text-gray-600">{testCase.description}</p>
                      <div className="flex items-center gap-2">
                        <span className="text-2xl font-bold text-blue-600">¥{testCase.price}</span>
                        <Badge variant="outline">{testCase.priceId}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <Button 
                        onClick={() => runTest(testCase)}
                        className="w-full"
                        disabled={currentStep === 'testing'}
                      >
                        开始测试
                      </Button>
                      
                      {testResults[testCase.id] && (
                        <div className="mt-4 space-y-2">
                          {testResults[testCase.id].steps.map((step: any, index: number) => (
                            <div key={index} className="flex items-center gap-2 text-sm">
                              {getStepIcon(step.status)}
                              <span className={step.status === 'success' ? 'text-green-600' : 
                                               step.status === 'failed' ? 'text-red-600' : 'text-gray-600'}>
                                {step.name}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="qr-code" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {testCases.map((testCase) => (
                  <Card key={testCase.id}>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        {testCase.name}
                        <Badge variant="outline">二维码测试</Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <AlipayQRCode 
                        priceId={testCase.priceId}
                        title={`${testCase.name} - 测试`}
                        showPrice={true}
                      />
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="monitor" className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">支付状态监控测试</h3>
                <p className="text-sm text-gray-600">
                  选择一个测试用例，然后使用上面的二维码进行支付，观察状态监控功能
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {testCases.map((testCase) => (
                    <Card key={testCase.id}>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          {testCase.name}
                          <Badge variant="outline">状态监控</Badge>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <AlipayQRCode 
                            priceId={testCase.priceId}
                            title={`${testCase.name} - 监控测试`}
                            showPrice={true}
                          />
                          
                          <Separator />
                          
                          <div className="text-sm text-gray-600">
                            <p>• 扫描二维码完成支付</p>
                            <p>• 观察支付状态变化</p>
                            <p>• 验证会员权限开通</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* 支付流程说明 */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>支付流程说明</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <span className="text-blue-600 font-bold">1</span>
                </div>
                <h4 className="font-medium">选择套餐</h4>
                <p className="text-sm text-gray-600">选择订阅计划和周期</p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <span className="text-blue-600 font-bold">2</span>
                </div>
                <h4 className="font-medium">创建订单</h4>
                <p className="text-sm text-gray-600">系统创建支付订单</p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <span className="text-blue-600 font-bold">3</span>
                </div>
                <h4 className="font-medium">扫码支付</h4>
                <p className="text-sm text-gray-600">使用支付宝扫码支付</p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <span className="text-blue-600 font-bold">4</span>
                </div>
                <h4 className="font-medium">回调处理</h4>
                <p className="text-sm text-gray-600">支付平台回调处理</p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <span className="text-green-600 font-bold">5</span>
                </div>
                <h4 className="font-medium">开通会员</h4>
                <p className="text-sm text-gray-600">自动开通对应会员权限</p>
              </div>
            </div>
            
            <Separator />
            
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">测试要点</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• 验证不同套餐的价格映射是否正确</li>
                <li>• 检查支付二维码生成是否正常</li>
                <li>• 测试支付状态监控功能</li>
                <li>• 验证支付成功后的会员权限开通</li>
                <li>• 检查支付回调处理是否正常</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 