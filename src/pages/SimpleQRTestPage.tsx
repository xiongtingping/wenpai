/**
 * 简单二维码测试页面
 */

import React, { useState } from 'react';

export default function SimpleQRTestPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleTestCheckout = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // 使用环境变量或动态获取 base URL
      const baseUrl = import.meta.env.PROD 
        ? '/.netlify/functions/checkout' 
        : 'http://localhost:8888/.netlify/functions/checkout';
      
      const response = await fetch(baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: 100,
          currency: 'CNY',
          description: '测试支付'
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setResult(data);
      console.log('测试成功:', data);
    } catch (err: any) {
      console.error('测试失败:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-2">简单二维码测试</h1>
          <p className="text-muted-foreground">测试后端接口是否正常工作</p>
        </div>

        <div className="text-center">
          <button
            onClick={handleTestCheckout}
            disabled={loading}
            className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary disabled:opacity-50"
          >
            {loading ? '测试中...' : '测试二维码接口'}
          </button>
        </div>

        {error && (
          <div className="bg-destructive/10 border border-destructive text-destructive px-4 py-3 rounded">
            <strong>错误:</strong> {error}
          </div>
        )}

        {result && (
          <div className="space-y-4">
            <div className="bg-accent border border-border text-foreground px-4 py-3 rounded">
              <strong>成功!</strong> 接口调用成功
            </div>
            
            <div className="bg-accent p-4 rounded">
              <h3 className="font-bold mb-2">返回数据:</h3>
              <pre className="text-sm overflow-auto">
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>

            {result.qrCodeDataURL && (
              <div className="text-center">
                <h3 className="font-bold mb-4">生成的二维码:</h3>
                <img 
                  src={result.qrCodeDataURL} 
                  alt="支付二维码" 
                  className="border-2 border-border rounded-lg mx-auto"
                  style={{ width: 300, height: 300 }}
                />
                <p className="mt-2 text-sm text-muted-foreground">
                  二维码数据长度: {result.qrCodeDataURL.length} 字符
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
} 