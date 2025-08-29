import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * 🔐 认证回调页面 - 官方Guard React18自动处理
 * GuardProvider已自动处理回调，此页面仅显示处理状态
 */
const CallbackPage: React.FC = () => {
  const navigate = useNavigate();
  const [processingStep, setProcessingStep] = useState('处理登录回调...');

  useEffect(() => {
    // Guard React18的GuardProvider会自动处理回调
    // 这里只需要等待并跳转
    console.log('🔄 Guard React18自动处理回调中...');
    
    setProcessingStep('登录成功，正在跳转...');
    
    setTimeout(() => {
      const redirectTo = localStorage.getItem('login_redirect_to') || '/';
      localStorage.removeItem('login_redirect_to');
      navigate(redirectTo, { replace: true });
    }, 1000);
    
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
        <h2 className="text-xl font-semibold">{processingStep}</h2>
        <p className="text-muted-foreground">
          {processingStep || '正在处理登录回调...'}
        </p>
      </div>
    </div>
  );
};

export default CallbackPage;
