/**
 * Creem SDK 全面测试页面
 * 测试 Creem SDK 的所有主要功能
 */

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Creem } from 'creem';

export default function CreemSDKTestPage() {
  const [testResults, setTestResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [customProductId, setCustomProductId] = useState('prod_3nJOuQeVStqkp6JaDcrKHf');
  const [customApiKey, setCustomApiKey] = useState(import.meta.env.VITE_CREEM_API_KEY || '');

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

  const addTestResult = (testName: string, success: boolean, data: any, error?: string) => {
    const result = {
      name: testName,
      timestamp: new Date().toISOString(),
      success,
      data,
      error: error || null
    };
    setTestResults(prev => [result, ...prev]);
  };

  // 测试产品信息获取
  const testRetrieveProduct = async (config: typeof testConfigs[0]) => {
    setLoading(true);
    try {
      console.log(`开始测试获取产品信息: ${config.name}`);
      
      const creem = new Creem();
      const product = await creem.retrieveProduct({
        productId: config.productId,
        xApiKey: config.apiKey,
      });
      
      console.log(`产品信息获取成功:`, product);
      addTestResult(`获取产品信息 - ${config.name}`, true, product);
      
    } catch (error: any) {
      console.error(`产品信息获取失败:`, error);
      addTestResult(`获取产品信息 - ${config.name}`, false, null, error.message || '未知错误');
    }
    setLoading(false);
  };

  // 测试创建结账会话
  const testCreateCheckout = async (config: typeof testConfigs[0]) => {
    setLoading(true);
    try {
      console.log(`开始测试创建结账会话: ${config.name}`);
      
      const creem = new Creem();
      const checkout = await creem.createCheckout({
        productId: config.productId,
        xApiKey: config.apiKey,
      });
      
      console.log(`结账会话创建成功:`, checkout);
      
      // 检查支付宝二维码
      const alipayQr = checkout.alipayQrCodeUrl || 
                      checkout.alipay_qr_code_url || 
                      (checkout.qrCodes && checkout.qrCodes.alipay);
      
      if (alipayQr) {
        (checkout as any).qrCodeUrl = alipayQr;
      }
      
      addTestResult(`创建结账会话 - ${config.name}`, true, checkout);
      
    } catch (error: any) {
      console.error(`结账会话创建失败:`, error);
      addTestResult(`创建结账会话 - ${config.name}`, false, null, error.message || '未知错误');
    }
    setLoading(false);
  };

  // 测试获取结账会话
  const testRetrieveCheckout = async (checkoutId: string, config: typeof testConfigs[0]) => {
    setLoading(true);
    try {
      console.log(`开始测试获取结账会话: ${checkoutId}`);
      
      const creem = new Creem();
      const checkout = await creem.retrieveCheckout({
        checkoutId: checkoutId,
        xApiKey: config.apiKey,
      });
      
      console.log(`结账会话获取成功:`, checkout);
      addTestResult(`获取结账会话 - ${checkoutId}`, true, checkout);
      
    } catch (error: any) {
      console.error(`结账会话获取失败:`, error);
      addTestResult(`获取结账会话 - ${checkoutId}`, false, null, error.message || '未知错误');
    }
    setLoading(false);
  };

  // 测试搜索产品
  const testSearchProducts = async (config: typeof testConfigs[0]) => {
    setLoading(true);
    try {
      console.log(`开始测试搜索产品`);
      
      const creem = new Creem();
      const products = await creem.searchProducts({
        xApiKey: config.apiKey,
      });
      
      console.log(`产品搜索成功:`, products);
      addTestResult(`搜索产品`, true, products);
      
    } catch (error: any) {
      console.error(`产品搜索失败:`, error);
      addTestResult(`搜索产品`, false, null, error.message || '未知错误');
    }
    setLoading(false);
  };

  // 测试搜索交易记录
  const testSearchTransactions = async (config: typeof testConfigs[0]) => {
    setLoading(true);
    try {
      console.log(`开始测试搜索交易记录`);
      
      const creem = new Creem();
      const transactions = await creem.searchTransactions({
        xApiKey: config.apiKey,
      });
      
      console.log(`交易记录搜索成功:`, transactions);
      addTestResult(`搜索交易记录`, true, transactions);
      
    } catch (error: any) {
      console.error(`交易记录搜索失败:`, error);
      addTestResult(`搜索交易记录`, false, null, error.message || '未知错误');
    }
    setLoading(false);
  };

  // 测试自定义产品
  const testCustomProduct = async () => {
    if (!customProductId || !customApiKey) {
      addTestResult('自定义产品测试', false, null, '请填写产品ID和API Key');
      return;
    }

    setLoading(true);
    try {
      console.log(`开始测试自定义产品: ${customProductId}`);
      
      const creem = new Creem();
      
      // 先获取产品信息
      const product = await creem.retrieveProduct({
        productId: customProductId,
        xApiKey: customApiKey,
      });
      
      console.log(`自定义产品信息获取成功:`, product);
      addTestResult(`自定义产品信息 - ${customProductId}`, true, product);
      
      // 再创建结账会话
      const checkout = await creem.createCheckout({
        productId: customProductId,
        xApiKey: customApiKey,
      });
      
      console.log(`自定义产品结账会话创建成功:`, checkout);
      addTestResult(`自定义产品结账 - ${customProductId}`, true, checkout);
      
    } catch (error: any) {
      console.error(`自定义产品测试失败:`, error);
      addTestResult(`自定义产品测试 - ${customProductId}`, false, null, error.message || '未知错误');
    }
    setLoading(false);
  };

  // 测试所有功能
  const testAllFunctions = async () => {
    setLoading(true);
    setTestResults([]);
    
    const config = testConfigs[0]; // 使用第一个配置进行测试
    
    // 测试产品信息获取
    await testRetrieveProduct(config);
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // 测试创建结账会话
    await testCreateCheckout(config);
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // 测试搜索产品
    await testSearchProducts(config);
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // 测试搜索交易记录
    await testSearchTransactions(config);
    
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
              Creem SDK 全面测试
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* 自定义产品测试 */}
              <div className="border rounded-lg p-4">
                <h3 className="text-lg font-medium mb-4">自定义产品测试</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
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
                    />
                  </div>
                </div>
                <Button 
                  onClick={testCustomProduct}
                  disabled={loading}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  测试自定义产品
                </Button>
              </div>

              {/* 批量测试 */}
              <div className="border rounded-lg p-4">
                <h3 className="text-lg font-medium mb-4">批量功能测试</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button 
                    onClick={testAllFunctions}
                    disabled={loading}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    {loading ? '测试中...' : '测试所有功能'}
                  </Button>
                  
                  <Button 
                    onClick={clearResults}
                    variant="outline"
                    disabled={loading}
                  >
                    清空结果
                  </Button>
                </div>
              </div>

              {/* 单个功能测试 */}
              <div className="border rounded-lg p-4">
                <h3 className="text-lg font-medium mb-4">单个功能测试</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {testConfigs.map((config, index) => (
                    <div key={index} className="space-y-2">
                      <h4 className="font-medium">{config.name}</h4>
                      <div className="flex space-x-2">
                        <Button 
                          onClick={() => testRetrieveProduct(config)}
                          disabled={loading}
                          variant="outline"
                          size="sm"
                        >
                          获取产品信息
                        </Button>
                        <Button 
                          onClick={() => testCreateCheckout(config)}
                          disabled={loading}
                          variant="outline"
                          size="sm"
                        >
                          创建结账会话
                        </Button>
                      </div>
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
              <CardTitle>测试结果 ({testResults.length})</CardTitle>
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
                        {result.data.id && (
                          <div className="text-sm">
                            <strong>ID:</strong> {result.data.id}
                          </div>
                        )}
                        {result.data.amount && (
                          <div className="text-sm">
                            <strong>金额:</strong> {result.data.amount}
                          </div>
                        )}
                        {result.data.name && (
                          <div className="text-sm">
                            <strong>名称:</strong> {result.data.name}
                          </div>
                        )}
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
                          <pre className="mt-2 p-2 bg-gray-100 rounded overflow-auto max-h-40">
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