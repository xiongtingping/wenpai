/**
 * Creem最终测试页面
 * 使用智能优化器进行测试
 */

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { creemOptimizer } from '@/utils/creemOptimizer';

export default function CreemFinalTestPage() {
  const [testResults, setTestResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

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

  const testWithOptimizer = async (config: typeof testConfigs[0]) => {
    setLoading(true);
    const result = {
      name: config.name,
      timestamp: new Date().toISOString(),
      success: false,
      data: null,
      error: null,
      stats: null
    };

    try {
      console.log(`开始测试 ${config.name} 使用智能优化器`);
      
      const data = await creemOptimizer.smartCreateCheckout(
        config.productId,
        config.apiKey
      );
      
      console.log(`${config.name} 测试成功:`, data);
      
      result.success = true;
      result.data = data;
      result.stats = creemOptimizer.getStats();
      
      // 检查支付宝二维码
      const alipayQr = data.alipayQrCodeUrl || 
                      data.alipay_qr_code_url || 
                      (data.qrCodes && data.qrCodes.alipay);
      
      if (alipayQr) {
        result.data.qrCodeUrl = alipayQr;
      }
      
    } catch (error: any) {
      console.error(`${config.name} 测试失败:`, error);
      result.success = false;
      result.error = error.message || '未知错误';
      result.stats = creemOptimizer.getStats();
    }

    setTestResults(prev => [result, ...prev]);
    setLoading(false);
  };

  const testAllConfigs = async () => {
    setLoading(true);
    setTestResults([]);
    
    // 重置优化器
    creemOptimizer.reset();
    
    for (const config of testConfigs) {
      await testWithOptimizer(config);
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    setLoading(false);
  };

  const clearResults = () => {
    setTestResults([]);
    creemOptimizer.reset();
  };

  const getOptimizerStats = () => {
    return creemOptimizer.getStats();
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="container mx-auto max-w-6xl">
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">
              Creem智能优化器测试
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
                    onClick={() => testWithOptimizer(config)}
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

        {/* 优化器统计 */}
        {testResults.length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>智能优化器统计</CardTitle>
            </CardHeader>
            <CardContent>
              {(() => {
                const stats = getOptimizerStats();
                return (
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-white p-4 rounded-lg border">
                      <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
                      <div className="text-sm text-gray-600">总测试数</div>
                    </div>
                    <div className="bg-white p-4 rounded-lg border">
                      <div className="text-2xl font-bold text-green-600">{stats.success}</div>
                      <div className="text-sm text-gray-600">成功次数</div>
                    </div>
                    <div className="bg-white p-4 rounded-lg border">
                      <div className="text-2xl font-bold text-red-600">{stats.failure}</div>
                      <div className="text-sm text-gray-600">失败次数</div>
                    </div>
                    <div className="bg-white p-4 rounded-lg border">
                      <div className="text-2xl font-bold text-purple-600">{stats.successRate}%</div>
                      <div className="text-sm text-gray-600">成功率</div>
                    </div>
                  </div>
                );
              })()}
              
              <div className="mt-4">
                <h4 className="font-medium mb-2">最佳方法: {getOptimizerStats().bestMethod}</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {getOptimizerStats().configs.map((config, index) => (
                    <div key={index} className="border rounded-lg p-3 bg-white">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{config.method}</span>
                        <Badge variant={config.recommended ? "default" : "secondary"}>
                          {config.recommended ? '推荐' : '备选'}
                        </Badge>
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
                        成功率: {config.successRate}% | 平均耗时: {config.avgDuration}ms
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

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