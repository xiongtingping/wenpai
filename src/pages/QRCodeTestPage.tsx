/**
 * 二维码测试页面
 * 用于测试支付二维码显示功能
 */

import React, { useState, useEffect } from 'react';

export default function QRCodeTestPage() {
  const [qrCodeDataURL, setQrCodeDataURL] = useState<string>('');
  const [price, setPrice] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [debugInfo, setDebugInfo] = useState<string>('页面已加载');

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

  const generateQRCode = async (priceId: string, testName: string) => {
    setLoading(true);
    setError(null);
    setDebugInfo(`开始测试 ${testName}...`);
    
    try {
      console.log(`开始测试 ${testName}:`, { priceId });
      
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
          priceId,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success) {
        setQrCodeDataURL(result.qrCodeDataURL);
        setPrice(result.price);
        setDebugInfo(`${testName} 二维码生成成功`);
        console.log(`${testName} 二维码生成成功:`, result);
      } else {
        throw new Error('二维码生成失败');
      }
    } catch (err: any) {
      console.error(`${testName} 二维码生成失败:`, err);
      setError(err?.message || "二维码生成失败");
      setQrCodeDataURL("");
      setPrice(null);
      setDebugInfo(`错误: ${err?.message || "二维码生成失败"}`);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await generateQRCode('prod_3nJOuQeVStqkp6JaDcrKHf', '专业版月付');
    setRefreshing(false);
  };

  // 页面加载时的调试信息
  useEffect(() => {
    setDebugInfo('页面已加载，等待用户操作');
    console.log('QRCodeTestPage 已加载');
  }, []);

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-center mb-2 text-primary">
          支付二维码测试
        </h1>
        <p className="text-center text-secondary">
          测试后端生成的支付二维码显示功能
        </p>
      </div>

      {/* 调试信息 */}
      <div className="border border-border rounded-lg p-4 mb-6 bg-accent">
        <h3 className="m-0 mb-2 text-lg font-bold text-primary">调试信息</h3>
        <p className="m-0 text-sm text-secondary">{debugInfo}</p>
      </div>

      {/* 测试按钮 */}
      <div className="border border-border rounded-lg p-4 mb-6">
        <h3 className="m-0 mb-4 text-lg font-bold text-primary">测试配置</h3>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-4">
          {testConfigs.map((config) => (
            <button
              key={config.priceId}
              onClick={() => generateQRCode(config.priceId, config.name)}
              disabled={loading}
              className={`p-4 border border-border rounded-md flex flex-col items-center gap-2 ${
                loading
                  ? 'bg-accent cursor-not-allowed'
                  : 'bg-background cursor-pointer hover:bg-accent'
              }`}
            >
              <span className="font-medium text-primary">{config.name}</span>
              <span className="text-xs text-secondary">{config.priceId}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 二维码显示 */}
      <div className="border border-border rounded-lg p-4 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="m-0 text-lg font-bold text-primary">支付二维码</h3>
          <button
            onClick={handleRefresh}
            disabled={refreshing || loading}
            className={`px-4 py-2 border border-border rounded bg-background text-sm ${
              (refreshing || loading)
                ? 'cursor-not-allowed opacity-60'
                : 'cursor-pointer hover:bg-accent'
            }`}
          >
            {refreshing ? '刷新中...' : '刷新'}
          </button>
        </div>
        
        <div style={{ textAlign: 'center' }}>
          {loading ? (
            <div style={{ padding: '32px' }}>
              <div style={{ 
                display: 'inline-block',
                width: '24px',
                height: '24px',
                border: '2px solid #e5e7eb',
                borderTop: '2px solid #3b82f6',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }}></div>
              <p style={{ margin: '8px 0 0 0' }}>正在生成二维码...</p>
            </div>
          ) : error ? (
            <div style={{ padding: '32px' }}>
              <div style={{ color: '#dc2626', marginBottom: '16px' }}>{error}</div>
              <button
                onClick={handleRefresh}
                style={{
                  padding: '8px 16px',
                  border: '1px solid #d1d5db',
                  borderRadius: '4px',
                  backgroundColor: '#ffffff',
                  cursor: 'pointer'
                }}
              >
                重试
              </button>
            </div>
          ) : qrCodeDataURL ? (
            <div>
              {price !== null && (
                <div style={{ marginBottom: '16px' }}>
                  <span style={{
                    display: 'inline-block',
                    padding: '8px 16px',
                    border: '1px solid #d1d5db',
                    borderRadius: '4px',
                    fontSize: '1.125rem',
                    fontWeight: '500'
                  }}>
                    ¥{price.toFixed(2)}
                  </span>
                </div>
              )}
              
              <div style={{ marginBottom: '16px' }}>
                <img 
                  src={qrCodeDataURL} 
                  alt="支付宝二维码" 
                  style={{
                    border: '2px solid #e5e7eb',
                    borderRadius: '8px',
                    width: '300px',
                    height: '300px'
                  }}
                />
              </div>
              
              <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                <p style={{ margin: '0 0 4px 0' }}>扫码后会跳转到Creem安全支付页，请放心支付</p>
              </div>
            </div>
          ) : (
            <div style={{ padding: '32px', color: '#6b7280' }}>
              请选择测试配置生成二维码
            </div>
          )}
        </div>
      </div>

      {/* 调试信息 */}
      {qrCodeDataURL && (
        <div style={{ 
          border: '1px solid #e5e7eb', 
          borderRadius: '8px', 
          padding: '16px'
        }}>
          <h3 style={{ margin: '0 0 16px 0', fontSize: '1.1rem', fontWeight: 'bold' }}>调试信息</h3>
          <div style={{ fontSize: '0.875rem' }}>
            <div style={{ marginBottom: '8px' }}>
              <strong>二维码数据长度:</strong> {qrCodeDataURL.length} 字符
            </div>
            <div style={{ marginBottom: '8px' }}>
              <strong>价格:</strong> {price !== null ? `¥${price.toFixed(2)}` : '未获取'}
            </div>
            <div>
              <strong>二维码类型:</strong> {qrCodeDataURL.startsWith('data:image/png') ? 'PNG' : '未知'}
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
} 