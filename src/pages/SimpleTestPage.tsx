import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useUnifiedAuth } from "@/contexts/UnifiedAuthContext";
import { getUserDisplayName } from '@/utils/userDisplayUtils';

/**
 * 简单测试页面
 * 用于验证基本功能是否正常
 */
const SimpleTestPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, login, user } = useUnifiedAuth();

  const testDirectNavigation = () => {
    console.log('测试直接导航');
    navigate('/');
  };

  const testAuthNavigation = () => {
    console.log('测试认证导航');
    if (isAuthenticated) {
      navigate('/adapt');
    } else {
      login('/adapt');
    }
  };

  const testLogin = () => {
    console.log('测试登录功能');
    login();
  };

  return (
    <div className="min-h-screen bg-gradient-primary particle-background p-8">
      <div className="max-w-md mx-auto bg-card/90 backdrop-blur-sm rounded-xl shadow-e1 p-6">
        <h1 className="text-2xl font-bold mb-6">🧪 简单功能测试</h1>
        
        <div className="space-y-4">
          <div className="p-4 bg-accent rounded">
            <h3 className="font-semibold">当前状态</h3>
            <p>认证状态: {isAuthenticated ? '✅ 已登录' : '❌ 未登录'}</p>
            {user && <p>用户: {getUserDisplayName(user, '未知用户')}</p>}
          </div>

          <button
            onClick={testDirectNavigation}
            className="w-full bg-accent0 text-white py-2 px-4 rounded hover:bg-accent"
          >
            测试直接导航 (返回首页)
          </button>

          <button
            onClick={testAuthNavigation}
            className="w-full bg-primary text-white py-2 px-4 rounded hover:bg-primary"
          >
            测试认证导航 (适配页面)
          </button>

          <button
            onClick={testLogin}
            className="w-full bg-accent0 text-white py-2 px-4 rounded hover:bg-primary"
          >
            测试登录弹窗
          </button>

          <button
            onClick={() => {
              console.log('=== 调试信息 ===');
              console.log('认证状态:', isAuthenticated);
              console.log('用户信息:', user);
              console.log('当前URL:', window.location.href);
              alert('调试信息已输出到控制台');
            }}
            className="w-full bg-accent0 text-white py-2 px-4 rounded hover:bg-gray-600"
          >
            输出调试信息
          </button>
        </div>

        <div className="mt-6 p-4 bg-accent rounded">
          <h3 className="font-semibold text-foreground">使用说明</h3>
          <p className="text-sm text-muted-foreground mt-2">
            1. 点击按钮测试各种功能<br/>
            2. 查看控制台输出<br/>
            3. 如果按钮没有反应，请检查控制台错误
          </p>
        </div>
      </div>
    </div>
  );
};

export default SimpleTestPage; 