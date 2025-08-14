/**
 * 🔧 SYSTEM REBUILD: 基于@authing/web的全新登录页面
 * 📌 系统性重构，解决undefined显示问题
 * 🎯 使用简洁可靠的登录界面，替代复杂的Guard弹窗
 *
 * 🔒 [AUTHING_WEB_LOGIN_PAGE_v2025.08.14]
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthingWeb } from '@/contexts/AuthingWebContext';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import AuthingWebLogin from '@/components/auth/AuthingWebLogin';

/**
 * 登录页面组件
 */
const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { loading, error } = useAuthingWeb();

  const handleGoBack = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md relative">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleGoBack}
          className="absolute -top-12 left-0 z-10"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          返回首页
        </Button>

        <AuthingWebLogin
          onClose={() => navigate('/')}
          redirectTo={new URLSearchParams(window.location.search).get('redirect') || '/'}
        />
      </div>
    </div>
  );
};

export default LoginPage; 