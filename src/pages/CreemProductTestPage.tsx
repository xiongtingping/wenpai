/**
 * Creem产品ID测试页面
 * 验证产品ID和API调用的正确性
 */

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Creem } from 'creem';

export default function CreemProductTestPage() {
  const [testResults, setTestResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [customProductId, setCustomProductId] = useState('prod_3nJOuQeVStqkp6JaDcrKHf');
  const [customApiKey, setCustomApiKey] = useState(import.meta.env.VITE_CREEM_API_KEY || '');

  // 预定义的产品ID测试
  const predefinedProducts = [
    {
      name: '专业版月付',
      productId: 'prod_3nJOuQeVStqkp6JaDcrKHf',
      description: '专业版月付订阅'
    },
    {
      name: '专业版年付',
      productId: 'prod_5qBlDTLpD3h9gvOZFd4Rgu',
      description: '专业版年付订阅'
    },
    {
      name: '高级版月付',
      productId: 'prod_4HYBfvrcbXYnbxjlswMj28',
      description: '高级版月付订阅'
    },
    {
      name: '高级版年付',
      productId: 'prod_6OfIoVnRg2pXsuYceVKOYk',
      description: '高级版年付订阅'
    }
  ];

  const testProduct = async (productId: string, apiKey: string, testName: string) => {
    setLoading(true);
    const result = {
      name: testName,
      productId,
      apiKey: apiKey.substring(0, 10) + '...',
      timestamp: new Date().toISOString(),
      success: false,
      data: null,
      error: null
    };

    try {
      console.log(`开始测试 ${testName}:`, { productId, apiKey: apiKey.substring(0, 10) + '...' });
      
      const creem = new Creem();
      
      // 测试不同的API调用方式
      let checkout;
      
      try {
        // 方式1: 直接传递参数
        checkout = await creem.createCheckout({
          productId: productId,
          apiKey: apiKey,
        });
        console.log(`${testName} 方式1成功:`, checkout);
      } catch (error1: any) {
        console.log(`${testName} 方式1失败:`, error1.message);
        
        try {
          // 方式2: 使用xApiKey
          checkout = await creem.createCheckout({
            productId: productId,
            xApiKey: apiKey,
          });
          console.log(`${testName} 方式2成功:`, checkout);
        } catch (error2: any) {
          console.log(`${testName} 方式2失败:`, error2.message);
          
          try {
            // 方式3: 使用构造函数配置
            const creemWithConfig = new Creem({ apiKey });
            checkout = await creemWithConfig.createCheckout({
              productId: productId,
            });
            console.log(`${testName} 方式3成功:`, checkout);
          } catch (error3: any) {
            console.log(`${testName} 方式3失败:`, error3.message);
            throw error3; // 所有方式都失败
          }
        }
      }
      
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
      console.error(`${testName} 所有方式都失败:`, error);
      result.success = false;
      result.error = error.message || '未知错误';
    }

    setTestResults(prev => [result, ...prev]);
    setLoading(false);
  };

  const testAllPredefined = async () => {
    setLoading(true);
    setTestResults([]);
    
    for (const product of predefinedProducts) {
      await testProduct(product.productId, customApiKey, product.name);
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    setLoading(false);
  };

  const testCustomProduct = async () => {
    if (!customProductId.trim() || !customApiKey.trim()) {
      alert('请输入产品ID和API Key');
      return;
    }
    await testProduct(customProductId.trim(), customApiKey.trim(), '自定义产品');
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
              Creem产品ID和API测试
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* 自定义测试 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="productId">产品ID</Label>
                  <Input
                    id="productId"
                    value={customProductId}
                    onChange={(e) => setCustomProductId(e.target.value)}
                    placeholder="输入产品ID"
                  />
                </div>
                <div>
                  <Label htmlFor="apiKey">API Key</Label>
                  <Input
                    id="apiKey"
                    value={customApiKey}
                    onChange={(e) => setCustomApiKey(e.target.value)}
                    placeholder="输入API Key"
                    type="password"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button 
                  onClick={testCustomProduct}
                  disabled={loading}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {loading ? '测试中...' : '测试自定义产品'}
                </Button>
                
                <Button 
                  onClick={testAllPredefined}
                  disabled={loading}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  {loading ? '测试中...' : '测试所有预定义产品'}
                </Button>
                
                <Button 
                  onClick={clearResults}
                  variant="outline"
                  disabled={loading}
                >
                  清空结果
                </Button>
              </div>
              
              {/* 预定义产品列表 */}
              <div>
                <h3 className="text-lg font-medium mb-3">预定义产品列表</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {predefinedProducts.map((product, index) => (
                    <div key={index} className="border rounded-lg p-3 bg-white">
                      <div className="font-medium">{product.name}</div>
                      <div className="text-sm text-gray-600">{product.description}</div>
                      <div className="text-xs text-gray-500 font-mono mt-1">{product.productId}</div>
                      <Button 
                        onClick={() => testProduct(product.productId, customApiKey, product.name)}
                        disabled={loading}
                        variant="outline"
                        size="sm"
                        className="mt-2"
                      >
                        单独测试
                      </Button>
                    </div>
                  ))}
                </div>
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
                  <div key={index} className="border rounded-lg p-4 bg-white">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium">{result.name}</h3>
                      <Badge variant={result.success ? "default" : "destructive"}>
                        {result.success ? '成功' : '失败'}
                      </Badge>
                    </div>
                    
                    <div className="text-sm text-gray-600 mb-2">
                      <div>产品ID: <span className="font-mono">{result.productId}</span></div>
                      <div>API Key: <span className="font-mono">{result.apiKey}</span></div>
                      <div>时间: {new Date(result.timestamp).toLocaleString()}</div>
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
                        <strong>错误:</strong> {result.error}
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