/**
 * 支付计划演示页面
 * 展示不同版本的支付金额和Creem产品映射
 */

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { CreditCard, Crown, Star, Check, ArrowRight } from 'lucide-react';
import AlipayQRCode from '@/components/payment/AlipayQRCode';

export default function PaymentPlanDemoPage() {
  const [selectedPeriod, setSelectedPeriod] = useState<'monthly' | 'yearly'>('monthly');

  const subscriptionPlans = [
    {
      id: 'trial',
      name: '体验版',
      tier: 'trial',
      description: '免费体验基础功能',
      monthly: { price: 0, originalPrice: 0 },
      yearly: { price: 0, originalPrice: 0 },
      creemProductId: null,
      features: [
        'AI内容适配器（10次/月）',
        '全网雷达',
        '我的资料库',
        '基础模型'
      ]
    },
    {
      id: 'pro',
      name: '专业版',
      tier: 'pro',
      description: '适合个人创作者和中小企业',
      monthly: { price: 29, originalPrice: 39 },
      yearly: { price: 349, originalPrice: 468 },
      creemProductId: {
        monthly: 'prod_3nJOuQeVStqkp6JaDcrKHf',
        yearly: 'prod_5qBlDTLpD3h9gvOZFd4Rgu'
      },
      features: [
        'AI内容适配器（30次/月）',
        '创意魔方',
        '全网雷达',
        '我的资料库',
        '高级模型'
      ],
      recommended: true
    },
    {
      id: 'premium',
      name: '高级版',
      tier: 'premium',
      description: '适合专业团队和企业用户',
      monthly: { price: 69, originalPrice: 99 },
      yearly: { price: 828, originalPrice: 1188 },
      creemProductId: {
        monthly: 'prod_4HYBfvrcbXYnbxjlswMj28',
        yearly: 'prod_6OfIoVnRg2pXsuYceVKOYk'
      },
      features: [
        'AI内容适配器（不限次数）',
        '创意魔方',
        '全网雷达',
        '我的资料库',
        '高级及最新模型'
      ]
    }
  ];

  const getCurrentPrice = (plan: any) => {
    const pricing = selectedPeriod === 'monthly' ? plan.monthly : plan.yearly;
    return pricing.price;
  };

  const getOriginalPrice = (plan: any) => {
    const pricing = selectedPeriod === 'monthly' ? plan.monthly : plan.yearly;
    return pricing.originalPrice;
  };

  const getCreemProductId = (plan: any) => {
    if (!plan.creemProductId) return null;
    return plan.creemProductId[selectedPeriod];
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
              <span className="text-white text-sm font-bold">支</span>
            </div>
            支付计划演示
            <Badge variant="secondary">版本对比</Badge>
          </CardTitle>
          <p className="text-muted-foreground">
            展示不同版本的支付金额和对应的Creem产品映射
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* 周期选择 */}
          <div className="flex justify-center gap-4">
            <Button
              variant={selectedPeriod === 'monthly' ? 'default' : 'outline'}
              onClick={() => setSelectedPeriod('monthly')}
              className="min-w-[120px]"
            >
              按月订阅
            </Button>
            <Button
              variant={selectedPeriod === 'yearly' ? 'default' : 'outline'}
              onClick={() => setSelectedPeriod('yearly')}
              className="min-w-[120px]"
            >
              按年订阅
              <Badge variant="secondary" className="ml-2">更优惠</Badge>
            </Button>
          </div>

          {/* 计划对比 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {subscriptionPlans.map((plan) => {
              const currentPrice = getCurrentPrice(plan);
              const originalPrice = getOriginalPrice(plan);
              const creemProductId = getCreemProductId(plan);
              const savedAmount = originalPrice - currentPrice;

              return (
                <Card 
                  key={plan.id}
                  className={`relative ${plan.recommended ? "ring-2 ring-blue-200" : ""}`}
                >
                  {plan.recommended && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <Badge className="bg-blue-500 text-white">
                        <Star className="h-3 w-3 mr-1" />
                        推荐
                      </Badge>
                    </div>
                  )}
                  
                  <CardHeader className="text-center">
                    <CardTitle className="text-xl flex items-center justify-center gap-2">
                      {plan.tier === 'premium' && <Crown className="h-5 w-5 text-yellow-500" />}
                      {plan.name}
                    </CardTitle>
                    <p className="text-muted-foreground text-sm">{plan.description}</p>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    {/* 价格显示 */}
                    <div className="text-center">
                      {plan.tier === 'trial' ? (
                        <div className="text-3xl font-bold text-green-600">免费</div>
                      ) : (
                        <div className="space-y-2">
                          <div className="text-3xl font-bold text-blue-600">
                            ¥{currentPrice}
                          </div>
                          {savedAmount > 0 && (
                            <div className="text-sm text-green-600">
                              省¥{savedAmount}
                            </div>
                          )}
                          {originalPrice > currentPrice && (
                            <div className="text-sm text-gray-400 line-through">
                              ¥{originalPrice} 原价
                            </div>
                          )}
                          <div className="text-sm text-gray-500">
                            /{selectedPeriod === 'monthly' ? '月' : '年'}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* 功能列表 */}
                    <div className="space-y-2">
                      {plan.features.map((feature, index) => (
                        <div key={index} className="flex items-center gap-2 text-sm">
                          <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>

                    {/* Creem产品信息 */}
                    {creemProductId && (
                      <div className="bg-blue-50 p-3 rounded-lg">
                        <div className="flex items-center gap-2 text-blue-700 mb-2">
                          <CreditCard className="h-4 w-4" />
                          <span className="text-sm font-medium">Creem产品</span>
                        </div>
                        <p className="text-xs text-blue-600 break-all">
                          {creemProductId}
                        </p>
                      </div>
                    )}

                    {/* 支付二维码演示 */}
                    {creemProductId && (
                      <div className="border-t pt-4">
                        <h4 className="font-medium mb-3 text-center">支付二维码演示</h4>
                        <AlipayQRCode 
                          priceId={creemProductId}
                          title={`${plan.name} - 扫码支付`}
                          showPrice={true}
                        />
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* 产品映射说明 */}
          <Separator />
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">Creem产品映射说明</h4>
            <div className="space-y-2 text-sm text-blue-800">
              <div className="flex items-start gap-2">
                <span className="font-medium">专业版月付:</span>
                <span>prod_3nJOuQeVStqkp6JaDcrKHf (¥29)</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-medium">专业版年付:</span>
                <span>prod_5qBlDTLpD3h9gvOZFd4Rgu (¥349)</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-medium">高级版月付:</span>
                <span>prod_4HYBfvrcbXYnbxjlswMj28 (¥69)</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-medium">高级版年付:</span>
                <span>prod_6OfIoVnRg2pXsuYceVKOYk (¥828)</span>
              </div>
            </div>
          </div>

          {/* 支付流程说明 */}
          <div className="bg-green-50 p-4 rounded-lg">
            <h4 className="font-medium text-green-900 mb-2">支付流程</h4>
            <div className="space-y-2 text-sm text-green-800">
              <div className="flex items-start gap-2">
                <span className="font-medium">1.</span>
                <span>选择套餐和订阅周期</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-medium">2.</span>
                <span>系统自动映射到对应的Creem产品ID</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-medium">3.</span>
                <span>生成支付宝二维码，显示对应价格</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-medium">4.</span>
                <span>扫码后会跳转到Creem安全支付页</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-medium">5.</span>
                <span>支付成功后自动激活对应套餐</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 