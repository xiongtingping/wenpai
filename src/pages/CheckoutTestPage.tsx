/**
 * 支付测试页面
 * 测试完整的Creem支付流程
 */

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import AlipayQRCode from '@/components/payment/AlipayQRCode';
import CheckoutButton from '@/components/payment/CheckoutButton';
import { useUnifiedAuth } from '@/contexts/UnifiedAuthContext';

export default function CheckoutTestPage() {
  const [selectedPriceId, setSelectedPriceId] = useState('prod_3nJOuQeVStqkp6JaDcrKHf');
  const [customerEmail, setCustomerEmail] = useState('');
  const [showQRCode, setShowQRCode] = useState(false);
  const { user } = useUnifiedAuth();

  const testProducts = [
    {
      id: 'pro-monthly',
      name: '专业版月付',
      priceId: 'prod_3nJOuQeVStqkp6JaDcrKHf',
      price: 29,
      description: '适合个人用户使用'
    },
    {
      id: 'pro-yearly',
      name: '专业版年付',
      priceId: 'prod_5qBlDTLpD3h9gvOZFd4Rgu',
      price: 288,
      description: '年付享受更多优惠，比月付省80元'
    },
    {
      id: 'premium-monthly',
      name: '高级版月付',
      priceId: 'prod_4HYBfvrcbXYnbxjlswMj28',
      price: 79,
      description: '高级版月付订阅'
    },
    {
      id: 'premium-yearly',
      name: '高级版年付',
      priceId: 'prod_6OfIoVnRg2pXsuYceVKOYk',
      price: 788,
      description: '年付享受更多优惠，比月付省202元'
    }
  ];

  const handleProductSelect = (priceId: string) => {
    setSelectedPriceId(priceId);
    setShowQRCode(false);
  };

  const handleGenerateQRCode = () => {
    setShowQRCode(true);
  };

  // 自动填充用户邮箱
  React.useEffect(() => {
    if (user?.email && !customerEmail) {
      setCustomerEmail(user.email);
    }
  }, [user, customerEmail]);

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            💳 完整支付流程测试
            <Badge variant="secondary">Creem支付</Badge>
          </CardTitle>
          <p className="text-muted-foreground">
            测试Creem支付的完整流程，包括二维码支付和跳转支付
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* 产品选择 */}
          <div>
            <h3 className="text-lg font-semibold mb-3">选择产品</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {testProducts.map((product) => (
                <Card 
                  key={product.priceId} 
                  className={`p-4 cursor-pointer transition-colors ${
                    selectedPriceId === product.priceId 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'hover:border-gray-300'
                  }`}
                  onClick={() => handleProductSelect(product.priceId)}
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
                      {selectedPriceId === product.priceId && (
                        <Badge variant="default" className="mt-1">已选择</Badge>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* 客户信息 */}
          <div>
            <Label htmlFor="customerEmail">客户邮箱</Label>
            <Input
              id="customerEmail"
              type="email"
              placeholder="customer@example.com"
              value={customerEmail}
              onChange={(e) => setCustomerEmail(e.target.value)}
              className="mt-2"
            />
            <p className="text-xs text-muted-foreground mt-1">
              用于支付通知和订单确认
            </p>
          </div>

          {/* 支付方式选择 */}
          <Tabs defaultValue="redirect" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="redirect">跳转支付</TabsTrigger>
              <TabsTrigger value="qrcode">二维码支付</TabsTrigger>
            </TabsList>
            
            <TabsContent value="redirect" className="space-y-4">
              <Card className="p-6">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">跳转到Creem支付页面</h4>
                    <p className="text-sm text-muted-foreground">
                      点击支付按钮后，将跳转到Creem的支付页面完成支付
                    </p>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h5 className="font-medium mb-2">当前配置</h5>
                    <div className="space-y-1 text-sm">
                      <p><span className="font-medium">价格ID:</span> {selectedPriceId}</p>
                      <p><span className="font-medium">客户邮箱:</span> {customerEmail || '未设置'}</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-4">
                    <CheckoutButton
                      priceId={selectedPriceId}
                      customerEmail={customerEmail || undefined}
                      className="flex-1"
                      size="lg"
                    >
                      跳转到支付页面
                    </CheckoutButton>
                  </div>
                </div>
              </Card>
            </TabsContent>
            
            <TabsContent value="qrcode" className="space-y-4">
              <Card className="p-6">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">扫码支付</h4>
                    <p className="text-sm text-muted-foreground">
                      生成支付宝二维码，使用手机扫码完成支付
                    </p>
                  </div>
                  
                  <div className="flex gap-4">
                    <Button 
                      onClick={handleGenerateQRCode}
                      className="flex-1"
                      size="lg"
                    >
                      生成支付二维码
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => setShowQRCode(false)}
                    >
                      隐藏二维码
                    </Button>
                  </div>
                  
                  {showQRCode && selectedPriceId && (
                    <div className="border-t pt-6">
                      <h5 className="font-medium mb-4">支付二维码</h5>
                      <div className="flex justify-center">
                        <AlipayQRCode 
                          priceId={selectedPriceId}
                          customerEmail={customerEmail || undefined}
                          title="使用支付宝扫码付款"
                          showPrice={true}
                          onRefresh={() => console.log('二维码已刷新')}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            </TabsContent>
          </Tabs>

          {/* 支付流程说明 */}
          <Separator />
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">支付流程说明</h4>
            <div className="space-y-2 text-sm text-blue-800">
              <div className="flex items-start gap-2">
                <span className="font-medium">1.</span>
                <span>选择产品和支付方式</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-medium">2.</span>
                <span>填写客户邮箱（用于支付通知）</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-medium">3.</span>
                <span>点击支付按钮或扫描二维码</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-medium">4.</span>
                <span>在Creem支付页面完成支付</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-medium">5.</span>
                <span>支付成功后自动返回并激活服务</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 