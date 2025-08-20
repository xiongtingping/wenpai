import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUnifiedAuth } from "@/auth/UnifiedAuthProvider";

/**
 * 忘记密码页面
 * 使用Authing SDK进行统一认证
 */
export default function ForgotPasswordPage() {
  const { login, isAuthenticated } = useUnifiedAuth();
  const navigate = useNavigate();

  // 页面加载自动弹出 Authing Guard
  useEffect(() => {
    login();
  }, [login]);

  // 登录成功后自动跳转首页
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  return (
    <div className="min-h-screen bg-gradient-primary particle-background flex items-center justify-center p-4">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-4 text-foreground">请使用 Authing 重置密码</h2>
        <p className="text-muted-foreground mb-6">正在为您打开密码重置窗口...</p>
        <button
          onClick={() => login()}
          className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
        >
          重新打开密码重置窗口
        </button>
      </div>
    </div>
  );
} 