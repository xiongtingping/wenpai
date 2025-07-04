import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAuthingAppId, getGuardConfig } from '@/config/authing';
import { useAuth, type User } from '@/hooks/useAuth';

/**
 * Authing Guard 登录页面组件
 * 使用 Authing 提供的 Guard 组件进行用户认证
 */
const AuthingLoginPage = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const { login } = useAuth();
  const guardRef = useRef<HTMLDivElement>(null);

  // 从配置文件获取 Authing 配置
  const appId = getAuthingAppId();
  const config = getGuardConfig();

  useEffect(() => {
    /**
     * 初始化 Authing Guard
     */
    const initGuard = async () => {
      try {
        // 动态导入 Authing Guard
        const { Guard } = await import('@authing/guard-react');
        
        if (guardRef.current) {
          // 创建 Guard 实例
          const guard = new Guard({
            appId,
            ...config,
            onLogin: (user: unknown) => {
              console.log('登录成功:', user);
              login(user as User);
              navigate('/');
            },
            onLoginError: (error: unknown) => {
              console.error('登录失败:', error);
            },
          });

          // 渲染到指定容器
          guard.render(guardRef.current);
        }
      } catch (error) {
        console.error('初始化 Authing Guard 失败:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initGuard();
  }, [appId, config, login, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">正在加载登录组件...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-xl p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">欢迎使用文派AI</h1>
          <p className="text-gray-600">请登录您的账户以继续使用</p>
        </div>
        
        {/* Authing Guard 容器 */}
        <div ref={guardRef} id="authing-guard"></div>
        
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            还没有账户？{' '}
            <button 
              onClick={() => navigate('/register')}
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              立即注册
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthingLoginPage; 