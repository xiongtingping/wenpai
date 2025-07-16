/**
 * Creem API调试页面
 * 用于诊断和调试Creem API问题
 */

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Bug, Code, Play } from 'lucide-react';
import { Creem } from 'creem';

export default function CreemDebugPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [priceId, setPriceId] = useState('prod_3nJOuQeVStqkp6JaDcrKHf');
  const [customerEmail, setCustomerEmail] = useState('test@example.com');
  const [apiKey, setApiKey] = useState(import.meta.env.VITE_CREEM_API_KEY || '');
  const [debugInfo, setDebugInfo] = useState<string>('');

  const testMethod1 = async () => {
    setLoading(true);
    setResult(null);
    setError(null);
    setDebugInfo('');

    try {
      const creem = new Creem();
      
      setDebugInfo('方法1: 直接传递参数\n' + 
        JSON.stringify({
          priceId,
          customerEmail,
          xApiKey: apiKey ? '***' : 'undefined'
        }, null, 2));

      const checkout = await creem.createCheckout({
        productId: priceId,
        xApiKey: apiKey,
      });

      setResult({ method: '方法1', data: checkout });
    } catch (err: any) {
      setError(`方法1失败: ${err.message}`);
      setDebugInfo(prev => prev + '\n\n错误详情:\n' + err.stack);
    } finally {
      setLoading(false);
    }
  };

  const testMethod2 = async () => {
    setLoading(true);
    setResult(null);
    setError(null);
    setDebugInfo('');

    try {
      const creem = new Creem();
      
      setDebugInfo('方法2: 使用createCheckoutRequest包装\n' + 
        JSON.stringify({
          createCheckoutRequest: {
            priceId,
            customerEmail
          },
          xApiKey: apiKey ? '***' : 'undefined'
        }, null, 2));

      const checkout = await creem.createCheckout({
        createCheckoutRequest: {
          productId: priceId,
        },
        xApiKey: apiKey,
      });

      setResult({ method: '方法2', data: checkout });
    } catch (err: any) {
      setError(`方法2失败: ${err.message}`);
      setDebugInfo(prev => prev + '\n\n错误详情:\n' + err.stack);
    } finally {
      setLoading(false);
    }
  };

  const testMethod3 = async () => {
    setLoading(true);
    setResult(null);
    setError(null);
    setDebugInfo('');

    try {
      const creem = new Creem();
      
      setDebugInfo('方法3: 只传递必要参数\n' + 
        JSON.stringify({
          priceId,
          xApiKey: apiKey ? '***' : 'undefined'
        }, null, 2));

      const checkout = await creem.createCheckout({
        createCheckoutRequest: {
          productId: priceId,
        },
        xApiKey: apiKey,
      });

      setResult({ method: '方法3', data: checkout });
    } catch (err: any) {
      setError(`方法3失败: ${err.message}`);
      setDebugInfo(prev => prev + '\n\n错误详情:\n' + err.stack);
    } finally {
      setLoading(false);
    }
  };

  const testMethod4 = async () => {
    setLoading(true);
    setResult(null);
    setError(null);
    setDebugInfo('');

    try {
      const creem = new Creem();
      
      setDebugInfo('方法4: 使用productId而不是priceId\n' + 
        JSON.stringify({
          productId: priceId,
          customerEmail,
          xApiKey: apiKey ? '***' : 'undefined'
        }, null, 2));

      const checkout = await creem.createCheckout({
        createCheckoutRequest: {
          productId: priceId,
        },
        xApiKey: apiKey,
      });

      setResult({ method: '方法4', data: checkout });
    } catch (err: any) {
      setError(`方法4失败: ${err.message}`);
      setDebugInfo(prev => prev + '\n\n错误详情:\n' + err.stack);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bug className="h-5 w-5" />
            Creem API调试页面
            <Badge variant="secondary">深度调试</Badge>
          </CardTitle>
          <p className="text-muted-foreground">
            尝试不同的API调用方法来诊断问题
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* 输入参数 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="priceId">价格ID</Label>
              <Input
                id="priceId"
                value={priceId}
                onChange={(e) => setPriceId(e.target.value)}
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
            <div>
              <Label htmlFor="apiKey">API密钥</Label>
              <Input
                id="apiKey"
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="输入Creem API密钥"
                className="mt-1"
              />
            </div>
          </div>

          {/* 测试方法 */}
          <div>
            <h3 className="text-lg font-semibold mb-3">测试方法</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button 
                onClick={testMethod1}
                disabled={loading}
                variant="outline"
                className="h-20 flex flex-col items-center justify-center"
              >
                <Code className="h-5 w-5 mb-2" />
                方法1: 直接传递参数
              </Button>
              <Button 
                onClick={testMethod2}
                disabled={loading}
                variant="outline"
                className="h-20 flex flex-col items-center justify-center"
              >
                <Code className="h-5 w-5 mb-2" />
                方法2: createCheckoutRequest包装
              </Button>
              <Button 
                onClick={testMethod3}
                disabled={loading}
                variant="outline"
                className="h-20 flex flex-col items-center justify-center"
              >
                <Code className="h-5 w-5 mb-2" />
                方法3: 只传递必要参数
              </Button>
              <Button 
                onClick={testMethod4}
                disabled={loading}
                variant="outline"
                className="h-20 flex flex-col items-center justify-center"
              >
                <Code className="h-5 w-5 mb-2" />
                方法4: 使用productId
              </Button>
            </div>
          </div>

          {/* 结果显示 */}
          {error && (
            <Card className="border-red-200 bg-red-50">
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 mb-4">
                  <Bug className="h-5 w-5 text-red-600" />
                  <h3 className="font-medium text-red-900">测试失败</h3>
                </div>
                <p className="text-red-700 text-sm">{error}</p>
              </CardContent>
            </Card>
          )}

          {result && (
            <Card className="border-green-200 bg-green-50">
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 mb-4">
                  <Play className="h-5 w-5 text-green-600" />
                  <h3 className="font-medium text-green-900">测试成功 - {result.method}</h3>
                </div>
                <details className="mt-4">
                  <summary className="cursor-pointer text-green-700 font-medium">
                    查看响应数据
                  </summary>
                  <pre className="mt-2 p-3 bg-white rounded border text-xs overflow-auto">
                    {JSON.stringify(result.data, null, 2)}
                  </pre>
                </details>
              </CardContent>
            </Card>
          )}

          {/* 调试信息 */}
          {debugInfo && (
            <Card className="border-blue-200 bg-blue-50">
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 mb-4">
                  <Bug className="h-5 w-5 text-blue-600" />
                  <h3 className="font-medium text-blue-900">调试信息</h3>
                </div>
                <Textarea
                  value={debugInfo}
                  readOnly
                  className="font-mono text-xs"
                  rows={10}
                />
              </CardContent>
            </Card>
          )}

          {/* 环境信息 */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">环境信息</h4>
            <div className="space-y-2 text-sm text-gray-700">
              <p><span className="font-medium">Creem SDK版本:</span> 0.3.37</p>
              <p><span className="font-medium">环境:</span> {import.meta.env.MODE}</p>
              <p><span className="font-medium">API密钥配置:</span> {apiKey ? '已配置' : '未配置'}</p>
              <p><span className="font-medium">服务器URL:</span> https://api.creem.io</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 