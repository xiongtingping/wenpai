/**
 * Creem API简单测试页面
 * 用于测试不同的Creem API调用方式
 */

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Creem } from 'creem';

export default function CreemSimpleTestPage() {
  const [testResults, setTestResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const testMethods = [
    {
      name: '方法1: 直接传递参数',
      method: async () => {
        const creem = new Creem();
        return await creem.createCheckout({
          productId: 'prod_3nJOuQeVStqkp6JaDcrKHf',
          xApiKey: 'creem_EGDvCS72OYrsU8ho7aJ1C',
        });
      }
    },
    {
      name: '方法2: 使用apiKey参数',
      method: async () => {
        const creem = new Creem();
        return await creem.createCheckout({
          productId: 'prod_3nJOuQeVStqkp6JaDcrKHf',
          apiKey: 'creem_EGDvCS72OYrsU8ho7aJ1C',
        });
      }
    },
    {
      name: '方法3: 使用嵌套结构',
      method: async () => {
        const creem = new Creem();
        return await creem.createCheckout({
          productId: 'prod_3nJOuQeVStqkp6JaDcrKHf',
          createCheckoutRequest: {
            productId: 'prod_3nJOuQeVStqkp6JaDcrKHf',
            xApiKey: 'creem_EGDvCS72OYrsU8ho7aJ1C',
          }
        });
      }
    },
    {
      name: '方法4: 使用headers参数',
      method: async () => {
        const creem = new Creem();
        return await creem.createCheckout({
          productId: 'prod_3nJOuQeVStqkp6JaDcrKHf',
          headers: {
            'x-api-key': 'creem_EGDvCS72OYrsU8ho7aJ1C'
          }
        });
      }
    },
    {
      name: '方法5: 使用config参数',
      method: async () => {
        const creem = new Creem({
          apiKey: 'creem_EGDvCS72OYrsU8ho7aJ1C'
        });
        return await creem.createCheckout({
          productId: 'prod_3nJOuQeVStqkp6JaDcrKHf',
        });
      }
    }
  ];

  const runTest = async (testMethod: typeof testMethods[0]) => {
    setLoading(true);
    const result = {
      name: testMethod.name,
      timestamp: new Date().toISOString(),
      success: false,
      data: null,
      error: null
    };

    try {
      console.log(`开始测试 ${testMethod.name}`);
      const data = await testMethod.method();
      console.log(`${testMethod.name} 成功:`, data);
      
      result.success = true;
      result.data = data;
      
    } catch (error: any) {
      console.error(`${testMethod.name} 失败:`, error);
      result.success = false;
      result.error = error.message || '未知错误';
    }

    setTestResults(prev => [result, ...prev]);
    setLoading(false);
  };

  const testAll = async () => {
    setLoading(true);
    setTestResults([]);
    
    for (const testMethod of testMethods) {
      await runTest(testMethod);
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    setLoading(false);
  };

  const clearResults = () => {
    setTestResults([]);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="container mx-auto max-w-4xl">
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">
              Creem API调用方式测试
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button 
                  onClick={testAll}
                  disabled={loading}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {loading ? '测试中...' : '测试所有方法'}
                </Button>
                
                <Button 
                  onClick={clearResults}
                  variant="outline"
                  disabled={loading}
                >
                  清空结果
                </Button>
              </div>
              
              <div className="grid grid-cols-1 gap-2">
                {testMethods.map((testMethod, index) => (
                  <Button 
                    key={index}
                    onClick={() => runTest(testMethod)}
                    disabled={loading}
                    variant="outline"
                    className="justify-start"
                  >
                    测试 {testMethod.name}
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