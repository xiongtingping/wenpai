/**
 * Creem API测试页面
 * 用于测试Netlify函数API端点
 */

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getAlipayQRCode } from '@/api/creemClientService';

export default function CreemAPITestPage() {
  const [testResults, setTestResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const testConfigs = [
    {
      name: '专业版月付',
      priceId: 'prod_3nJOuQeVStqkp6JaDcrKHf',
    },
    {
      name: '专业版年付',
      priceId: 'prod_5qBlDTLpD3h9gvOZFd4Rgu',
    },
    {
      name: '高级版月付',
      priceId: 'prod_4HYBfvrcbXYnbxjlswMj28',
    },
    {
      name: '高级版年付',
      priceId: 'prod_6OfIoVnRg2pXsuYceVKOYk',
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

  const testAPIEndpoint = async (priceId: string, testName: string) => {
    try {
      console.log(`开始测试 ${testName}:`, { priceId });
      
      const result = await getAlipayQRCode(priceId);
      
      if (result.success) {
        console.log(`${testName} 成功:`, result);
        addTestResult(testName, true, result);
      } else {
        console.log(`${testName} 失败:`, result);
        addTestResult(testName, false, result, 'API调用失败');
      }
    } catch (error: any) {
      console.log(`${testName} 错误:`, error.message);
      addTestResult(testName, false, null, error.message);
    }
  };

  const runAllTests = async () => {
    setLoading(true);
    setTestResults([]);
    
    for (const config of testConfigs) {
      await testAPIEndpoint(config.priceId, config.name);
      // 添加延迟避免请求过于频繁
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    setLoading(false);
  };

  const clearResults = () => {
    setTestResults([]);
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            🧪 Creem API测试页面
            <Badge variant="secondary">Netlify函数</Badge>
          </CardTitle>
          <p className="text-muted-foreground">
            测试Creem支付API端点是否正常工作
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* 控制按钮 */}
          <div className="flex gap-4">
            <Button 
              onClick={runAllTests} 
              disabled={loading}
              className="flex-1"
            >
              {loading ? '测试中...' : '运行所有测试'}
            </Button>
            <Button 
              onClick={clearResults} 
              variant="outline"
            >
              清除结果
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
                    </div>
                    <Button
                      size="sm"
                      onClick={() => testAPIEndpoint(config.priceId, config.name)}
                      disabled={loading}
                    >
                      测试
                    </Button>
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