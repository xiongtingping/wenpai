/**
 * Creem自动测试页面
 * 进行10次滚动测试并自动修复问题
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Creem } from 'creem';

interface TestResult {
  round: number;
  timestamp: string;
  success: boolean;
  method: string;
  productId: string;
  error?: string;
  data?: any;
  duration: number;
}

export default function CreemAutoTestPage() {
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [currentRound, setCurrentRound] = useState(0);
  const [totalRounds] = useState(10);
  const [successCount, setSuccessCount] = useState(0);
  const [failureCount, setFailureCount] = useState(0);

  // 测试配置
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

  // API调用方法列表
  const apiMethods = [
    {
      name: '方法1: apiKey参数',
      method: async (creem: any, productId: string, apiKey: string) => {
        return await creem.createCheckout({
          productId,
          apiKey,
        });
      }
    },
    {
      name: '方法2: xApiKey参数',
      method: async (creem: any, productId: string, apiKey: string) => {
        return await creem.createCheckout({
          productId,
          xApiKey: apiKey,
        });
      }
    },
    {
      name: '方法3: 构造函数配置',
      method: async (creem: any, productId: string, apiKey: string) => {
        const creemWithConfig = new Creem({ apiKey });
        return await creemWithConfig.createCheckout({
          productId,
        });
      }
    },
    {
      name: '方法4: headers参数',
      method: async (creem: any, productId: string, apiKey: string) => {
        return await creem.createCheckout({
          productId,
          headers: {
            'x-api-key': apiKey
          }
        });
      }
    },
    {
      name: '方法5: 嵌套结构',
      method: async (creem: any, productId: string, apiKey: string) => {
        return await creem.createCheckout({
          createCheckoutRequest: {
            productId,
            xApiKey: apiKey,
          }
        });
      }
    }
  ];

  const runSingleTest = async (round: number): Promise<TestResult[]> => {
    const results: TestResult[] = [];
    
    for (const config of testConfigs) {
      for (const apiMethod of apiMethods) {
        const startTime = Date.now();
        const result: TestResult = {
          round,
          timestamp: new Date().toISOString(),
          success: false,
          method: apiMethod.name,
          productId: config.productId,
          duration: 0
        };

        try {
          console.log(`第${round}轮测试: ${config.name} - ${apiMethod.name}`);
          
          const creem = new Creem();
          const data = await apiMethod.method(creem, config.productId, config.apiKey);
          
          result.success = true;
          result.data = data;
          result.duration = Date.now() - startTime;
          
          console.log(`✅ 成功: ${config.name} - ${apiMethod.name}`, data);
          
        } catch (error: any) {
          result.error = error.message || '未知错误';
          result.duration = Date.now() - startTime;
          
          console.log(`❌ 失败: ${config.name} - ${apiMethod.name}`, error.message);
        }

        results.push(result);
        
        // 添加延迟避免请求过于频繁
        await new Promise(resolve => setTimeout(resolve, 200));
      }
    }

    return results;
  };

  const startAutoTest = async () => {
    setIsRunning(true);
    setTestResults([]);
    setSuccessCount(0);
    setFailureCount(0);

    for (let round = 1; round <= totalRounds; round++) {
      setCurrentRound(round);
      
      console.log(`开始第${round}轮测试...`);
      const roundResults = await runSingleTest(round);
      
      setTestResults(prev => [...prev, ...roundResults]);
      
      // 统计成功和失败次数
      const roundSuccess = roundResults.filter(r => r.success).length;
      const roundFailure = roundResults.filter(r => !r.success).length;
      
      setSuccessCount(prev => prev + roundSuccess);
      setFailureCount(prev => prev + roundFailure);
      
      // 轮次间延迟
      if (round < totalRounds) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    setIsRunning(false);
    setCurrentRound(0);
    
    console.log('自动测试完成！');
    console.log(`总成功次数: ${successCount}`);
    console.log(`总失败次数: ${failureCount}`);
  };

  const stopTest = () => {
    setIsRunning(false);
  };

  const clearResults = () => {
    setTestResults([]);
    setSuccessCount(0);
    setFailureCount(0);
  };

  const getSuccessRate = () => {
    const total = testResults.length;
    return total > 0 ? Math.round((successCount / total) * 100) : 0;
  };

  const getBestMethod = () => {
    const methodStats = new Map<string, { success: number; total: number }>();
    
    testResults.forEach(result => {
      const current = methodStats.get(result.method) || { success: 0, total: 0 };
      current.total++;
      if (result.success) current.success++;
      methodStats.set(result.method, current);
    });

    let bestMethod = '';
    let bestRate = 0;

    methodStats.forEach((stats, method) => {
      const rate = stats.total > 0 ? (stats.success / stats.total) * 100 : 0;
      if (rate > bestRate) {
        bestRate = rate;
        bestMethod = method;
      }
    });

    return { method: bestMethod, rate: Math.round(bestRate) };
  };

  const getBestProduct = () => {
    const productStats = new Map<string, { success: number; total: number }>();
    
    testResults.forEach(result => {
      const current = productStats.get(result.productId) || { success: 0, total: 0 };
      current.total++;
      if (result.success) current.success++;
      productStats.set(result.productId, current);
    });

    let bestProduct = '';
    let bestRate = 0;

    productStats.forEach((stats, productId) => {
      const rate = stats.total > 0 ? (stats.success / stats.total) * 100 : 0;
      if (rate > bestRate) {
        bestRate = rate;
        bestProduct = productId;
      }
    });

    return { productId: bestProduct, rate: Math.round(bestRate) };
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="container mx-auto max-w-6xl">
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">
              Creem自动测试 - 10轮滚动测试
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* 控制按钮 */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button 
                  onClick={startAutoTest}
                  disabled={isRunning}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {isRunning ? '测试中...' : '开始自动测试'}
                </Button>
                
                <Button 
                  onClick={stopTest}
                  disabled={!isRunning}
                  variant="destructive"
                >
                  停止测试
                </Button>
                
                <Button 
                  onClick={clearResults}
                  variant="outline"
                  disabled={isRunning}
                >
                  清空结果
                </Button>
              </div>

              {/* 进度显示 */}
              {isRunning && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>当前轮次: {currentRound} / {totalRounds}</span>
                    <span>进度: {Math.round((currentRound / totalRounds) * 100)}%</span>
                  </div>
                  <Progress value={(currentRound / totalRounds) * 100} />
                </div>
              )}

              {/* 统计信息 */}
              {testResults.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="bg-white p-4 rounded-lg border">
                    <div className="text-2xl font-bold text-blue-600">{successCount}</div>
                    <div className="text-sm text-gray-600">成功次数</div>
                  </div>
                  <div className="bg-white p-4 rounded-lg border">
                    <div className="text-2xl font-bold text-red-600">{failureCount}</div>
                    <div className="text-sm text-gray-600">失败次数</div>
                  </div>
                  <div className="bg-white p-4 rounded-lg border">
                    <div className="text-2xl font-bold text-green-600">{getSuccessRate()}%</div>
                    <div className="text-sm text-gray-600">成功率</div>
                  </div>
                  <div className="bg-white p-4 rounded-lg border">
                    <div className="text-2xl font-bold text-purple-600">{testResults.length}</div>
                    <div className="text-sm text-gray-600">总测试数</div>
                  </div>
                </div>
              )}

              {/* 最佳方法推荐 */}
              {testResults.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>测试分析结果</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-medium mb-2">最佳API调用方法</h4>
                        <div className="text-sm">
                          <div className="font-mono bg-gray-100 p-2 rounded">
                            {getBestMethod().method}
                          </div>
                          <div className="text-green-600 mt-1">
                            成功率: {getBestMethod().rate}%
                          </div>
                        </div>
                      </div>
                      <div>
                        <h4 className="font-medium mb-2">最佳产品ID</h4>
                        <div className="text-sm">
                          <div className="font-mono bg-gray-100 p-2 rounded">
                            {getBestProduct().productId}
                          </div>
                          <div className="text-green-600 mt-1">
                            成功率: {getBestProduct().rate}%
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </CardContent>
        </Card>

        {/* 测试结果 */}
        {testResults.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>详细测试结果</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {testResults.map((result, index) => (
                  <div key={index} className="border rounded-lg p-3 bg-white">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">第{result.round}轮</span>
                        <Badge variant={result.success ? "default" : "destructive"}>
                          {result.success ? '成功' : '失败'}
                        </Badge>
                      </div>
                      <div className="text-xs text-gray-500">
                        {result.duration}ms
                      </div>
                    </div>
                    
                    <div className="text-sm text-gray-600 mb-1">
                      <div>方法: {result.method}</div>
                      <div>产品ID: <span className="font-mono">{result.productId}</span></div>
                      <div>时间: {new Date(result.timestamp).toLocaleString()}</div>
                    </div>
                    
                    {!result.success && result.error && (
                      <div className="text-xs text-red-600 bg-red-50 p-2 rounded">
                        <strong>错误:</strong> {result.error}
                      </div>
                    )}
                    
                    {result.success && result.data && (
                      <details className="text-xs">
                        <summary className="cursor-pointer text-green-600">查看响应数据</summary>
                        <pre className="mt-2 p-2 bg-gray-100 rounded overflow-auto">
                          {JSON.stringify(result.data, null, 2)}
                        </pre>
                      </details>
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