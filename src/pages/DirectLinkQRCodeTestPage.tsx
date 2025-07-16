/**
 * 直接链接二维码测试页面
 * 测试将Creem支付链接转换为二维码的功能
 */

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import DirectLinkQRCode from '@/components/payment/DirectLinkQRCode';

export default function DirectLinkQRCodeTestPage() {
  const [selectedProduct, setSelectedProduct] = useState(0);

  const creemProducts = [
    {
      name: '专业版月付',
      productId: 'prod_3nJOuQeVStqkp6JaDcrKHf',
      url: 'https://www.creem.io/payment/prod_3nJOuQeVStqkp6JaDcrKHf',
      price: '¥29.00',
      description: '适合个人用户使用'
    },
    {
      name: '专业版年付',
      productId: 'prod_5qBlDTLpD3h9gvOZFd4Rgu',
      url: 'https://www.creem.io/payment/prod_5qBlDTLpD3h9gvOZFd4Rgu',
      price: '¥299.00',
      description: '年付享受更多优惠'
    },
    {
      name: '高级版月付',
      productId: 'prod_4HYBfvrcbXYnbxjlswMj28',
      url: 'https://www.creem.io/payment/prod_4HYBfvrcbXYnbxjlswMj28',
      price: '¥59.00',
      description: '适合团队使用'
    },
    {
      name: '高级版年付',
      productId: 'prod_6OfIoVnRg2pXsuYceVKOYk',
      url: 'https://www.creem.io/payment/prod_6OfIoVnRg2pXsuYceVKOYk',
      price: '¥599.00',
      description: '年付享受更多优惠'
    }
  ];

  const selectedProductData = creemProducts[selectedProduct];

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            🔗 Creem支付链接转二维码
            <Badge variant="secondary">直接链接</Badge>
          </CardTitle>
          <p className="text-muted-foreground">
            将Creem支付链接直接转换为二维码，无需API调用
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* 产品选择 */}
          <div>
            <h3 className="text-lg font-semibold mb-3">选择产品</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {creemProducts.map((product, index) => (
                <Card 
                  key={product.productId} 
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
                      <p className="text-xs text-muted-foreground">{product.productId}</p>
                      {selectedProduct === index && (
                        <Badge variant="default" className="mt-1">已选择</Badge>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* 支付方式选择 */}
          <Tabs defaultValue="simple" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="simple">简单模式</TabsTrigger>
              <TabsTrigger value="advanced">高级模式</TabsTrigger>
            </TabsList>
            
            <TabsContent value="simple" className="space-y-4">
              <Card className="p-6">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">简单二维码生成</h4>
                    <p className="text-sm text-muted-foreground">
                      直接显示选中产品的支付二维码，无需额外配置
                    </p>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h5 className="font-medium mb-2">当前产品</h5>
                    <div className="space-y-1 text-sm">
                      <p><span className="font-medium">产品名称:</span> {selectedProductData.name}</p>
                      <p><span className="font-medium">产品ID:</span> {selectedProductData.productId}</p>
                      <p><span className="font-medium">价格:</span> {selectedProductData.price}</p>
                      <p><span className="font-medium">支付链接:</span> {selectedProductData.url}</p>
                    </div>
                  </div>
                  
                  <div className="flex justify-center">
                    <DirectLinkQRCode
                      defaultUrl={selectedProductData.url}
                      title={`${selectedProductData.name} - 支付二维码`}
                      showControls={false}
                    />
                  </div>
                </div>
              </Card>
            </TabsContent>
            
            <TabsContent value="advanced" className="space-y-4">
              <Card className="p-6">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">高级二维码生成</h4>
                    <p className="text-sm text-muted-foreground">
                      可以自定义支付链接，支持手动输入和编辑
                    </p>
                  </div>
                  
                  <div className="flex justify-center">
                    <DirectLinkQRCode
                      defaultUrl={selectedProductData.url}
                      title="自定义支付链接二维码"
                      showControls={true}
                    />
                  </div>
                </div>
              </Card>
            </TabsContent>
          </Tabs>

          {/* 使用说明 */}
          <Separator />
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">使用说明</h4>
            <div className="space-y-2 text-sm text-blue-800">
              <div className="flex items-start gap-2">
                <span className="font-medium">1.</span>
                <span>选择要生成二维码的产品</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-medium">2.</span>
                <span>选择生成模式：简单模式或高级模式</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-medium">3.</span>
                <span>扫描生成的二维码或点击打开链接</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-medium">4.</span>
                <span>扫码后会跳转到Creem安全支付页，请放心支付</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-medium">5.</span>
                <span>支付成功后自动返回并激活服务</span>
              </div>
            </div>
          </div>

          {/* 技术说明 */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">技术说明</h4>
            <div className="space-y-2 text-sm text-gray-700">
              <p><span className="font-medium">优势:</span> 无需API调用，直接使用Creem官方支付链接</p>
              <p><span className="font-medium">兼容性:</span> 支持所有Creem支付链接格式</p>
              <p><span className="font-medium">安全性:</span> 使用官方链接，确保支付安全</p>
              <p><span className="font-medium">便捷性:</span> 支持复制链接、复制二维码、直接打开等功能</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 