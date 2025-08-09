/**
 * 支付宝二维码演示页面
 * 展示优化后的支付宝二维码组件
 */

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import AlipayQRCode from '@/components/payment/AlipayQRCode';

export default function AlipayQRCodeDemoPage() {
  const [selectedProduct, setSelectedProduct] = useState(0);

  const testProducts = [
    {
      name: '专业版月付',
      priceId: 'price_3nJOuQeVStqkp6JaDcrKHf',
      price: '¥29.00',
      description: '适合个人用户使用'
    },
    {
      name: '专业版年付',
      priceId: 'price_5qBlDTLpD3h9gvOZFd4Rgu',
      price: '¥299.00',
      description: '年付享受更多优惠'
    },
    {
      name: '高级版月付',
      priceId: 'price_4HYBfvrcbXYnbxjlswMj28',
      price: '¥59.00',
      description: '适合团队使用'
    },
    {
      name: '高级版年付',
      priceId: 'price_6OfIoVnRg2pXsuYceVKOYk',
      price: '¥599.00',
      description: '年付享受更多优惠'
    }
  ];

  const selectedProductData = testProducts[selectedProduct];

  return (
    <div className="min-h-screen bg-gradient-primary particle-background">
      <div className="container mx-auto py-8 px-4 max-w-6xl">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
              <span className="text-white text-sm font-bold">支</span>
            </div>
            支付宝二维码演示
            <Badge variant="secondary">优化版</Badge>
          </CardTitle>
          <p className="text-muted-foreground">
            展示优化后的支付宝二维码组件，包含支付宝品牌元素和安全提示
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* 产品选择 */}
          <div>
            <h3 className="text-lg font-semibold mb-3">选择产品</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {testProducts.map((product, index) => (
                <Card 
                  key={product.priceId} 
                  className={`p-4 cursor-pointer transition-colors ${
                    selectedProduct === index 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedProduct(index)}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h4 className="font-medium">{product.name}</h4>
                      <p className="text-sm text-muted-foreground mb-2">{product.description}</p>
                      <Badge variant="outline" className="text-lg px-3 py-1">
                        {product.price}
                      </Badge>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">{product.priceId}</p>
                      {selectedProduct === index && (
                        <Badge variant="default" className="mt-1">已选择</Badge>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* 演示模式选择 */}
          <Tabs defaultValue="default" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="default">默认模式</TabsTrigger>
              <TabsTrigger value="custom">自定义标题</TabsTrigger>
              <TabsTrigger value="no-price">隐藏价格</TabsTrigger>
            </TabsList>
            
            <TabsContent value="default" className="space-y-4">
              <Card className="p-6">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">默认模式</h4>
                    <p className="text-sm text-muted-foreground">
                      使用默认的"使用支付宝扫码付款"标题，显示价格
                    </p>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h5 className="font-medium mb-2">当前配置</h5>
                    <div className="space-y-1 text-sm">
                      <p><span className="font-medium">产品名称:</span> {selectedProductData.name}</p>
                      <p><span className="font-medium">价格ID:</span> {selectedProductData.priceId}</p>
                      <p><span className="font-medium">价格:</span> {selectedProductData.price}</p>
                      <p><span className="font-medium">标题:</span> 使用支付宝扫码付款</p>
                      <p><span className="font-medium">显示价格:</span> 是</p>
                    </div>
                  </div>
                  
                  <div className="flex justify-center">
                    <AlipayQRCode 
                      priceId={selectedProductData.priceId}
                      title="使用支付宝扫码付款"
                      showPrice={true}
                      onRefresh={() => console.log('二维码已刷新')}
                    />
                  </div>
                </div>
              </Card>
            </TabsContent>
            
            <TabsContent value="custom" className="space-y-4">
              <Card className="p-6">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">自定义标题</h4>
                    <p className="text-sm text-muted-foreground">
                      使用自定义标题，展示不同的文案效果
                    </p>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h5 className="font-medium mb-2">当前配置</h5>
                    <div className="space-y-1 text-sm">
                      <p><span className="font-medium">产品名称:</span> {selectedProductData.name}</p>
                      <p><span className="font-medium">价格ID:</span> {selectedProductData.priceId}</p>
                      <p><span className="font-medium">价格:</span> {selectedProductData.price}</p>
                      <p><span className="font-medium">标题:</span> {selectedProductData.name} - 扫码支付</p>
                      <p><span className="font-medium">显示价格:</span> 是</p>
                    </div>
                  </div>
                  
                  <div className="flex justify-center">
                    <AlipayQRCode 
                      priceId={selectedProductData.priceId}
                      title={`${selectedProductData.name} - 扫码支付`}
                      showPrice={true}
                      onRefresh={() => console.log('二维码已刷新')}
                    />
                  </div>
                </div>
              </Card>
            </TabsContent>
            
            <TabsContent value="no-price" className="space-y-4">
              <Card className="p-6">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">隐藏价格模式</h4>
                    <p className="text-sm text-muted-foreground">
                      隐藏价格显示，只显示二维码和操作提示
                    </p>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h5 className="font-medium mb-2">当前配置</h5>
                    <div className="space-y-1 text-sm">
                      <p><span className="font-medium">产品名称:</span> {selectedProductData.name}</p>
                      <p><span className="font-medium">价格ID:</span> {selectedProductData.priceId}</p>
                      <p><span className="font-medium">价格:</span> {selectedProductData.price}</p>
                      <p><span className="font-medium">标题:</span> 扫码支付</p>
                      <p><span className="font-medium">显示价格:</span> 否</p>
                    </div>
                  </div>
                  
                  <div className="flex justify-center">
                    <AlipayQRCode 
                      priceId={selectedProductData.priceId}
                      title="扫码支付"
                      showPrice={false}
                      onRefresh={() => console.log('二维码已刷新')}
                    />
                  </div>
                </div>
              </Card>
            </TabsContent>
          </Tabs>

          {/* 优化特性说明 */}
          <Separator />
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">优化特性</h4>
            <div className="space-y-2 text-sm text-blue-800">
              <div className="flex items-start gap-2">
                <span className="font-medium">🎨</span>
                <span>支付宝品牌元素：蓝色主题、支付宝logo、品牌色彩</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-medium">💰</span>
                <span>价格显示：二维码上覆盖显示支付价格</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-medium">🛡️</span>
                <span>安全提示：显示"扫码后会跳转到Creem安全支付页，请放心支付"</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-medium">📱</span>
                <span>操作提示：简洁的"使用手机支付宝扫码"提示</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-medium">✨</span>
                <span>视觉优化：渐变背景、阴影效果、圆角设计</span>
              </div>
            </div>
          </div>

          {/* 文案优化说明 */}
          <div className="bg-green-50 p-4 rounded-lg">
            <h4 className="font-medium text-green-900 mb-2">文案优化</h4>
            <div className="space-y-2 text-sm text-green-800">
              <div className="flex items-start gap-2">
                <span className="font-medium">✅</span>
                <span>标题改为："使用支付宝扫码付款"</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-medium">✅</span>
                <span>去除重复文案："请使用支付宝扫码完成支付"</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-medium">✅</span>
                <span>统一安全提示："扫码后会跳转到Creem安全支付页，请放心支付"</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-medium">✅</span>
                <span>简化操作提示："使用手机支付宝扫码"</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      </div>
    </div>
  );
}