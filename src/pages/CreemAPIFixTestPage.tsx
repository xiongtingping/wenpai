/**
 * Creem API修复测试页面
 * 验证priceId参数修复是否有效
 */

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { createCreemCheckout, getAlipayQRCode, generateAlipayQRCode } from '@/api/creemClientService';

export default function CreemAPIFixTestPage() {
  const [testResults, setTestResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [customPriceId, setCustomPriceId] = useState('prod_3nJOuQeVStqkp6JaDcrKHf');
  const [customerEmail, setCustomerEmail] = useState('test@example.com');

  const testConfigs = [
    {
      name: '专业版月付',
      priceId: 'prod_3nJOuQeVStqkp6JaDcrKHf',
      expectedPrice: 29.00
    },
    {
      name: '专业版年付',
      priceId: 'prod_5qBlDTLpD3h9gvOZFd4Rgu',
      expectedPrice: 299.00
    },
    {
      name: '高级版月付',
      priceId: 'prod_4HYBfvrcbXYnbxjlswMj28',
      expectedPrice: 59.00
    },
    {
      name: '高级版年付',
      priceId: 'prod_6OfIoVnRg2pXsuYceVKOYk',
      expectedPrice: 599.00
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

  const testCreateCheckout = async (priceId: string, testName: string) => {
    try {
      console.log(`测试 createCreemCheckout ${testName}:`, { priceId, customerEmail });
      
      const result = await createCreemCheckout(priceId, customerEmail);
      
      if (result.success) {
        console.log(`${testName} createCreemCheckout 成功:`, result);
        addTestResult(`${testName} - createCreemCheckout`, true, result);
      } else {
        console.log(`${testName} createCreemCheckout 失败:`, result);
        addTestResult(`${testName} - createCreemCheckout`, false, result, 'API调用失败');
      }
    } catch (error: any) {
      console.log(`${testName} createCreemCheckout 错误:`, error.message);
      addTestResult(`${testName} - createCreemCheckout`, false, null, error.message);
    }
  };

  const testGetAlipayQRCode = async (priceId: string, testName: string) => {
    try {
      console.log(`测试 getAlipayQRCode ${testName}:`, { priceId, customerEmail });
      
      const result = await getAlipayQRCode(priceId, customerEmail);
      
      if (result.success) {
        console.log(`${testName} getAlipayQRCode 成功:`, result);
        addTestResult(`${testName} - getAlipayQRCode`, true, result);
      } else {
        console.log(`${testName} getAlipayQRCode 失败:`, result);
        addTestResult(`${testName} - getAlipayQRCode`, false, result, 'API调用失败');
      }
    } catch (error: any) {
      console.log(`${testName} getAlipayQRCode 错误:`, error.message);
      addTestResult(`${testName} - getAlipayQRCode`, false, null, error.message);
    }
  };

  const testGenerateAlipayQRCode = async (priceId: string, testName: string) => {
    try {
      console.log(`测试 generateAlipayQRCode ${testName}:`, { priceId, customerEmail });
      
      const result = await generateAlipayQRCode(priceId, customerEmail);
      
      if (result.success) {
        console.log(`${testName} generateAlipayQRCode 成功:`, result);
        addTestResult(`${testName} - generateAlipayQRCode`, true, result);
      } else {
        console.log(`${testName} generateAlipayQRCode 失败:`, result);
        addTestResult(`${testName} - generateAlipayQRCode`, false, result, 'API调用失败');
      }
    } catch (error: any) {
      console.log(`${testName} generateAlipayQRCode 错误:`, error.message);
      addTestResult(`${testName} - generateAlipayQRCode`, false, null, error.message);
    }
  };

  const runAllTests = async () => {
    setLoading(true);
    setTestResults([]);
    
    for (const config of testConfigs) {
      // 测试 createCreemCheckout
      await testCreateCheckout(config.priceId, config.name);
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // 测试 getAlipayQRCode
      await testGetAlipayQRCode(config.priceId, config.name);
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // 测试 generateAlipayQRCode
      await testGenerateAlipayQRCode(config.priceId, config.name);
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    setLoading(false);
  };

  const testCustomPriceId = async () => {
    if (!customPriceId.trim()) {
      addTestResult('自定义价格ID测试', false, null, '请输入有效的价格ID');
      return;
    }

    setLoading(true);
    
    try {
      console.log('测试自定义价格ID:', { customPriceId, customerEmail });
      
      const result = await createCreemCheckout(customPriceId, customerEmail);
      
      if (result.success) {
        console.log('自定义价格ID测试成功:', result);
        addTestResult('自定义价格ID测试', true, result);
      } else {
        console.log('自定义价格ID测试失败:', result);
        addTestResult('自定义价格ID测试', false, result, 'API调用失败');
      }
    } catch (error: any) {
      console.log('自定义价格ID测试错误:', error.message);
      addTestResult('自定义价格ID测试', false, null, error.message);
    } finally {
      setLoading(false);
    }
  };

  const clearResults = () => {
    setTestResults([]);
  };

  const getSuccessCount = () => {
    return testResults.filter(result => result.success).length;
  };

  const getTotalCount = () => {
    return testResults.length;
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            🔧 Creem API修复测试
            <Badge variant="secondary">priceId参数修复</Badge>
          </CardTitle>
          <p className="text-muted-foreground">
            验证Creem API的priceId参数修复是否有效，测试所有相关函数
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* 测试统计 */}
          {testResults.length > 0 && (
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span className="text-green-600 font-medium">成功: {getSuccessCount()}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <XCircle className="h-5 w-5 text-red-600" />
                    <span className="text-red-600 font-medium">失败: {getTotalCount() - getSuccessCount()}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-blue-600" />
                    <span className="text-blue-600 font-medium">总计: {getTotalCount()}</span>
                  </div>
                </div>
                <div className="text-sm text-gray-600">
                  成功率: {getTotalCount() > 0 ? Math.round((getSuccessCount() / getTotalCount()) * 100) : 0}%
                </div>
              </div>
            </div>
          )}

          {/* 控制按钮 */}
          <div className="flex gap-4">
            <Button 
              onClick={runAllTests} 
              disabled={loading}
              className="flex-1"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  测试中...
                </>
              ) : (
                '运行所有测试'
              )}
            </Button>
            <Button 
              onClick={clearResults} 
              variant="outline"
            >
              清除结果
            </Button>
          </div>

          {/* 自定义测试 */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-3">自定义价格ID测试</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="customPriceId">价格ID</Label>
                <Input
                  id="customPriceId"
                  value={customPriceId}
                  onChange={(e) => setCustomPriceId(e.target.value)}
                  placeholder="输入Creem价格ID"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="customerEmail">客户邮箱</Label>
                <Input
                  id="customerEmail"
                  type="email"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  placeholder="customer@example.com"
                  className="mt-1"
                />
              </div>
            </div>
            <Button 
              onClick={testCustomPriceId}
              disabled={loading}
              className="mt-3"
            >
              测试自定义价格ID
            </Button>
          </div>

          {/* 测试配置 */}
          <div>
            <h3 className="text-lg font-semibold mb-3">测试配置</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {testConfigs.map((config) => (
                <Card key={config.priceId} className="p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-medium">{config.name}</h4>
                      <p className="text-sm text-muted-foreground">{config.priceId}</p>
                      <p className="text-xs text-gray-500">预期价格: ¥{config.expectedPrice}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">将测试3个函数</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* 测试结果 */}
          <div>
            <h3 className="text-lg font-semibold mb-3">测试结果</h3>
            {testResults.length === 0 ? (
              <p className="text-muted-foreground">暂无测试结果</p>
            ) : (
              <div className="space-y-3">
                {testResults.map((result, index) => (
                  <Card key={index} className={`p-4 ${result.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-medium">{result.name}</h4>
                          <Badge variant={result.success ? "default" : "destructive"}>
                            {result.success ? '成功' : '失败'}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {new Date(result.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                        {result.error && (
                          <p className="text-red-600 text-sm">{result.error}</p>
                        )}
                        {result.success && result.data && (
                          <div className="text-sm">
                            <p className="text-green-600">API调用成功</p>
                            <details className="mt-2">
                              <summary className="cursor-pointer text-muted-foreground">查看响应数据</summary>
                              <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-auto">
                                {JSON.stringify(result.data, null, 2)}
                              </pre>
                            </details>
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 