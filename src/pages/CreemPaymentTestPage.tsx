/**
 * Creem支付功能测试页面
 * 用于测试Creem SDK的支付功能是否正常工作
 */

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Creem } from 'creem';

export default function CreemPaymentTestPage() {
  const [testResults, setTestResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // 测试产品ID和API Key
  const testConfigs = [
    {
      name: '专业版月付',
      productId: 'prod_3nJOuQeVStqkp6JaDcrKHf',
      apiKey: 'creem_EGDvCS72OYrsU8ho7aJ1C'
    },
    {
      name: '专业版年付',
      productId: 'prod_5qBlDTLpD3h9gvOZFd4Rgu',
      apiKey: 'creem_EGDvCS72OYrsU8ho7aJ1C'
    },
    {
      name: '高级版月付',
      productId: 'prod_4HYBfvrcbXYnbxjlswMj28',
      apiKey: 'creem_EGDvCS72OYrsU8ho7aJ1C'
    },
    {
      name: '高级版年付',
      productId: 'prod_6OfIoVnRg2pXsuYceVKOYk',
      apiKey: 'creem_EGDvCS72OYrsU8ho7aJ1C'
    }
  ];

  const testCreemCheckout = async (config: typeof testConfigs[0]) => {
    setLoading(true);
    const result = {
      name: config.name,
      timestamp: new Date().toISOString(),
      success: false,
      data: null,
      error: null
    };

    try {
      console.log(`开始测试 ${config.name}:`, config);
      
      const creem = new Creem();
      
      // 使用 createCheckoutRequest 包装参数
      const checkout = await creem.createCheckout({
        productId: config.productId,
        createCheckoutRequest: {
          productId: config.productId,
          xApiKey: config.apiKey,
        }
      });
      
      console.log(`${config.name} 测试成功:`, checkout);
      
      result.success = true;
      result.data = checkout;
      
      // 检查支付宝二维码
      const alipayQr = checkout.alipayQrCodeUrl || 
                      checkout.alipay_qr_code_url || 
                      (checkout.qrCodes && checkout.qrCodes.alipay);
      
      if (alipayQr) {
        result.data.qrCodeUrl = alipayQr;
      }
      
    } catch (error: any) {
      console.error(`${config.name} 测试失败:`, error);
      result.success = false;
      result.error = error.message || '未知错误';
    }

    setTestResults(prev => [result, ...prev]);
    setLoading(false);
  };

  const testAllConfigs = async () => {
    setLoading(true);
    setTestResults([]);
    
    for (const config of testConfigs) {
      await testCreemCheckout(config);
      // 添加延迟避免请求过于频繁
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    setLoading(false);
  };

  const clearResults = () => {
    setTestResults([]);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="container mx-auto max-w-6xl">
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">
              Creem支付功能测试
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button 
                  onClick={testAllConfigs}
                  disabled={loading}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {loading ? '测试中...' : '测试所有配置'}
                </Button>
                
                <Button 
                  onClick={clearResults}
                  variant="outline"
                  disabled={loading}
                >
                  清空结果
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {testConfigs.map((config, index) => (
                  <Button 
                    key={index}
                    onClick={() => testCreemCheckout(config)}
                    disabled={loading}
                    variant="outline"
                    className="justify-start"
                  >
                    测试 {config.name}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 测试结果 */}
        {testResults.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>测试结果</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {testResults.map((result, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium">{result.name}</h3>
                      <Badge variant={result.success ? "default" : "destructive"}>
                        {result.success ? '成功' : '失败'}
                      </Badge>
                    </div>
                    
                    <div className="text-sm text-gray-600 mb-2">
                      时间: {new Date(result.timestamp).toLocaleString()}
                    </div>
                    
                    {result.success && result.data && (
                      <div className="space-y-2">
                        <div className="text-sm">
                          <strong>订单ID:</strong> {result.data.id || 'N/A'}
                        </div>
                        <div className="text-sm">
                          <strong>金额:</strong> {result.data.amount || 'N/A'}
                        </div>
                        {result.data.qrCodeUrl && (
                          <div className="text-sm">
                            <strong>支付宝二维码:</strong> 
                            <div className="mt-2">
                              <img 
                                src={result.data.qrCodeUrl} 
                                alt="支付宝二维码" 
                                className="w-32 h-32 border"
                              />
                            </div>
                          </div>
                        )}
                        <details className="text-xs">
                          <summary className="cursor-pointer">完整响应数据</summary>
                          <pre className="mt-2 p-2 bg-gray-100 rounded overflow-auto">
                            {JSON.stringify(result.data, null, 2)}
                          </pre>
                        </details>
                      </div>
                    )}
                    
                    {!result.success && result.error && (
                      <div className="text-sm text-red-600">
                        <strong>错误信息:</strong> {result.error}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
} 