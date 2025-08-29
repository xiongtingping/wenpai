import React from 'react';
import { DirectLoginForm } from '@/components/auth/DirectLoginForm';

const LoginPage: React.FC = () => {
  console.log('🔧 认证系统：使用简化登录表单，避免Guard DOM冲突');

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold mb-2">文派登录</h1>
          <p className="text-muted-foreground">请使用您的账户登录</p>
        </div>
        
        {/* 直接使用备用登录表单，避免Guard DOM冲突 */}
        <div className="flex justify-center">
          <DirectLoginForm 
            onLogin={(userInfo) => {
              console.log('✅ 登录成功:', userInfo);
            }}
            onError={(error) => {
              console.error('❌ 登录失败:', error);
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default LoginPage;