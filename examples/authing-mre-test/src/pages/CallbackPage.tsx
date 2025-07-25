import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuthing } from '../contexts/AuthingContext';

const CallbackPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { checkAuth } = useAuthing();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState<string>('正在处理认证回调...');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        console.log('🔄 CallbackPage: 开始处理认证回调...');
        
        const code = searchParams.get('code');
        const state = searchParams.get('state');
        const error = searchParams.get('error');
        const errorDescription = searchParams.get('error_description');
        
        console.log('📋 CallbackPage: URL 参数:', { code, state, error, errorDescription });
        
        if (error) {
          console.error('❌ CallbackPage: 认证错误:', error, errorDescription);
          setStatus('error');
          setMessage('认证失败');
          setError(errorDescription || error);
          return;
        }
        
        if (!code) {
          console.error('❌ CallbackPage: 缺少授权码');
          setStatus('error');
          setMessage('缺少授权码');
          setError('未收到有效的授权码');
          return;
        }
        
        console.log('🔐 CallbackPage: 重新检查认证状态...');
        await checkAuth();
        
        setTimeout(() => {
          console.log('✅ CallbackPage: 认证处理完成');
          setStatus('success');
          setMessage('认证成功！正在跳转...');
          
          setTimeout(() => {
            navigate('/');
          }, 1000);
        }, 1000);
        
      } catch (error) {
        console.error('❌ CallbackPage: 处理回调失败:', error);
        setStatus('error');
        setMessage('处理认证回调失败');
        setError(error instanceof Error ? error.message : '未知错误');
      }
    };

    handleCallback();
  }, [searchParams, navigate, checkAuth]);

  const handleRetry = () => {
    setStatus('loading');
    setMessage('正在重新处理认证回调...');
    setError(null);
    window.location.reload();
  };

  const handleGoHome = () => {
    navigate('/');
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      padding: '20px' 
    }}>
      <div style={{
        background: 'white',
        borderRadius: '8px',
        padding: '30px',
        maxWidth: '400px',
        width: '100%',
        textAlign: 'center',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
      }}>
        <div style={{ marginBottom: '20px' }}>
          {status === 'loading' && (
            <div style={{ fontSize: '48px', color: '#1890ff' }}>⏳</div>
          )}
          {status === 'success' && (
            <div style={{ fontSize: '48px', color: '#52c41a' }}>✅</div>
          )}
          {status === 'error' && (
            <div style={{ fontSize: '48px', color: '#ff4d4f' }}>❌</div>
          )}
        </div>
        
        <h2 style={{ margin: '0 0 10px 0', color: '#333' }}>
          {status === 'loading' && '认证处理中'}
          {status === 'success' && '认证成功'}
          {status === 'error' && '认证失败'}
        </h2>
        
        <p style={{ color: '#666', marginBottom: '20px' }}>{message}</p>
        
        {status === 'loading' && (
          <div style={{ textAlign: 'center' }}>
            <div style={{ 
              width: '100%', 
              height: '4px', 
              background: '#f0f0f0', 
              borderRadius: '2px',
              overflow: 'hidden'
            }}>
              <div style={{
                width: '30%',
                height: '100%',
                background: '#1890ff',
                animation: 'loading 1.5s infinite'
              }}></div>
            </div>
          </div>
        )}
        
        {status === 'success' && (
          <div style={{ 
            background: '#f6ffed', 
            border: '1px solid #b7eb8f', 
            borderRadius: '4px', 
            padding: '10px',
            marginBottom: '20px'
          }}>
            <p style={{ color: '#52c41a', margin: 0 }}>您已成功登录，正在跳转到首页...</p>
          </div>
        )}
        
        {status === 'error' && (
          <div style={{ marginBottom: '20px' }}>
            <div style={{ 
              background: '#fff2f0', 
              border: '1px solid #ffccc7', 
              borderRadius: '4px', 
              padding: '10px',
              marginBottom: '15px'
            }}>
              <p style={{ color: '#ff4d4f', margin: '0 0 5px 0', fontWeight: 'bold' }}>认证失败</p>
              {error && (
                <p style={{ color: '#ff7875', margin: 0, fontSize: '14px' }}>{error}</p>
              )}
            </div>
            
            <div style={{ display: 'flex', gap: '10px' }}>
              <button 
                onClick={handleRetry}
                style={{
                  flex: 1,
                  padding: '10px',
                  border: '1px solid #d9d9d9',
                  borderRadius: '4px',
                  background: 'white',
                  cursor: 'pointer'
                }}
              >
                🔄 重试
              </button>
              <button 
                onClick={handleGoHome}
                style={{
                  flex: 1,
                  padding: '10px',
                  border: 'none',
                  borderRadius: '4px',
                  background: '#1890ff',
                  color: 'white',
                  cursor: 'pointer'
                }}
              >
                🏠 返回首页
              </button>
            </div>
          </div>
        )}
        
        {/* DEV 环境调试信息兼容处理 */}
        {typeof (import.meta as any).env !== 'undefined' && (import.meta as any).env.DEV && (
          <div style={{ 
            marginTop: '20px', 
            padding: '10px', 
            background: '#f5f5f5', 
            borderRadius: '4px',
            fontSize: '12px',
            fontFamily: 'monospace',
            textAlign: 'left'
          }}>
            <strong>调试信息:</strong><br />
            Code: {searchParams.get('code') || '无'}<br />
            State: {searchParams.get('state') || '无'}<br />
            Error: {searchParams.get('error') || '无'}<br />
            Error Description: {searchParams.get('error_description') || '无'}
          </div>
        )}
      </div>
      
      <style>{`
        @keyframes loading {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(400%); }
        }
      `}</style>
    </div>
  );
};

export default CallbackPage; 