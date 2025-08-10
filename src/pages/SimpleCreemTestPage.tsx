/**
 * 简单Creem API测试页面
 * 用于快速验证API修复是否有效
 */

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import { createCreemCheckout } from '@/api/creemClientService';

export default function SimpleCreemTestPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [priceId, setPriceId] = useState('prod_3nJOuQeVStqkp6JaDcrKHf');
  const [customerEmail, setCustomerEmail] = useState('test@example.com');

  const testAPI = async () => {
    setLoading(true);
    setResult(null);
    setError(null);

    try {
      console.log('开始测试Creem API:', { priceId, customerEmail });
      
      const response = await createCreemCheckout(priceId, customerEmail);
      
      console.log('API调用成功:', response);
      setResult(response);
    } catch (err: any) {
      console.error('API调用失败:', err);
      setError(err.message || '未知错误');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            🧪 简单Creem API测试
            <Badge variant="secondary">快速验证</Badge>
          </CardTitle>
          <p className="text-muted-foreground">
            快速测试Creem API是否正常工作
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* 输入参数 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
          </div>

          {/* 测试按钮 */}
          <div className="flex justify-center">
            <Button 
              onClick={testAPI}
              disabled={loading}
              size="lg"
              className="min-w-[200px]"
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  测试中...
                </>
              ) : (
                '测试Creem API'
              )}
            </Button>
          </div>

          {/* 结果显示 */}
          {error && (
            <Card className="border-border bg-accent">
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 mb-4">
                  <XCircle className="h-5 w-5 text-destructive" />
                  <h3 className="font-medium text-destructive">测试失败</h3>
                </div>
                <p className="text-destructive text-sm">{error}</p>
              </CardContent>
            </Card>
          )}

          {result && (
            <Card className="border-border bg-accent">
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 mb-4">
                  <CheckCircle className="h-5 w-5 text-foreground" />
                  <h3 className="font-medium text-foreground">测试成功</h3>
                </div>
                <div className="space-y-2 text-sm">
                  <p><span className="font-medium">成功:</span> {result.success ? '是' : '否'}</p>
                  {result.url && (
                    <p><span className="font-medium">支付URL:</span> {result.url}</p>
                  )}
                  {result.checkout && (
                    <details className="mt-4">
                      <summary className="cursor-pointer text-foreground font-medium">
                        查看完整响应数据
                      </summary>
                      <pre className="mt-2 p-3 bg-card rounded border text-xs overflow-auto">
                        {JSON.stringify(result.checkout, null, 2)}
                      </pre>
                    </details>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* 使用说明 */}
          <div className="bg-accent p-4 rounded-lg">
            <h4 className="font-medium text-primary mb-2">使用说明</h4>
            <div className="space-y-2 text-sm text-primary">
              <p>• 输入有效的Creem价格ID（如：prod_3nJOuQeVStqkp6JaDcrKHf）</p>
              <p>• 输入客户邮箱（可选，但推荐填写）</p>
              <p>• 点击"测试Creem API"按钮</p>
              <p>• 查看测试结果和响应数据</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 