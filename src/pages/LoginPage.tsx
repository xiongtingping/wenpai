/**
 * 🔒 [AUTHING_GUARD_LOGIN_PAGE_v2025.08.14]
 * 登录页面 - 统一使用@authing/guard架构
 * 
 * ✅ 架构统一化：
 * - 只使用@authing/guard SDK，移除@authing/web
 * - 统一认证流程，避免多套实现冲突
 * - 集中在UnifiedAuthContext中管理
 * 
 * 🚫 禁止事项：
 * - 禁止引入@authing/web相关代码
 * - 禁止创建多套认证实现
 * - 禁止绕过UnifiedAuthContext
 * 
 * 🔒 LOCKED: 架构已统一，禁止修改为其他认证方式
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useUnifiedAuth } from '@/contexts/UnifiedAuthContext';
import { Button } from '@/components/ui/button';
import { ArrowLeft, LogIn } from 'lucide-react';

/**
 * 登录页面组件 - 统一使用@authing/guard
 */
const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { loading, error, login } = useUnifiedAuth();

  const handleGoBack = () => {
    navigate('/');
  };

  const handleLogin = async () => {
    try {
      await login();
    } catch (err) {
      console.error('登录失败:', err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* 返回按钮 */}
        <Button
          variant="ghost"
          onClick={handleGoBack}
          className="mb-6 text-gray-600 hover:text-gray-800"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          返回首页
        </Button>

        {/* 登录卡片 */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">欢迎登录</h1>
            <p className="text-gray-600">使用 Authing Guard 安全登录</p>
          </div>

          {/* 全局错误显示 */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          {/* 登录按钮 */}
          <Button
            onClick={handleLogin}
            disabled={loading}
            className="w-full h-12 text-lg font-medium"
            size="lg"
          >
            {loading ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                正在登录...
              </div>
            ) : (
              <div className="flex items-center">
                <LogIn className="w-5 h-5 mr-2" />
                开始登录
              </div>
            )}
          </Button>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
              点击登录按钮将弹出 Authing Guard 安全登录窗口
            </p>
          </div>

          {/* 架构说明 */}
          <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="text-sm font-medium text-blue-900 mb-2">🔒 架构统一说明</h3>
            <ul className="text-xs text-blue-700 space-y-1">
              <li>• 统一使用 @authing/guard SDK</li>
              <li>• 移除 @authing/web 避免冲突</li>
              <li>• 集中在 UnifiedAuthContext 管理</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
