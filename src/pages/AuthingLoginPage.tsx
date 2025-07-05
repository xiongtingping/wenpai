/**
 * Authing 登录页面
 * 使用 Authing Guard 组件进行登录
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Guard } from '@authing/guard-react';
import { getAuthingConfig } from '@/config/authing';

/**
 * 用户信息接口
 */
interface User {
  id: string;
  username?: string;
  email?: string;
  phone?: string;
  nickname?: string;
  avatar?: string;
  [key: string]: unknown;
}

/**
 * Authing 登录页面组件
 * @returns React 组件
 */
const AuthingLoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [guard, setGuard] = useState<Guard | null>(null);
  const [userInfo, setUserInfo] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  /**
   * 初始化 Guard
   */
  const initGuard = useCallback((): Guard => {
    if (!guard) {
      const config = getAuthingConfig();
      const newGuard = new Guard(config);
      setGuard(newGuard);
      return newGuard;
    }
    return guard;
  }, [guard]);

  /**
   * 处理登录成功
   */
  const handleLogin = useCallback((userInfo: Record<string, unknown>) => {
    // 转换 Authing SDK 的用户类型到我们的 User 类型
    const convertedUser: User = {
      id: String(userInfo.id || userInfo.userId || ''),
      username: String(userInfo.username || userInfo.nickname || ''),
      email: String(userInfo.email || ''),
      phone: String(userInfo.phone || ''),
      nickname: String(userInfo.nickname || userInfo.username || ''),
      avatar: String(userInfo.photo || userInfo.avatar || ''),
      ...userInfo // 保留其他属性
    };
    
    setUserInfo(convertedUser);
    console.log('登录成功:', convertedUser);
    
    // 重定向到目标页面或首页
    const from = location.state?.from?.pathname || '/';
    navigate(from, { replace: true });
  }, [navigate, location.state?.from?.pathname]);

  /**
   * 处理注册成功
   */
  const handleRegister = useCallback((userInfo: Record<string, unknown>) => {
    // 转换 Authing SDK 的用户类型到我们的 User 类型
    const convertedUser: User = {
      id: String(userInfo.id || userInfo.userId || ''),
      username: String(userInfo.username || userInfo.nickname || ''),
      email: String(userInfo.email || ''),
      phone: String(userInfo.phone || ''),
      nickname: String(userInfo.nickname || userInfo.username || ''),
      avatar: String(userInfo.photo || userInfo.avatar || ''),
      ...userInfo // 保留其他属性
    };
    
    setUserInfo(convertedUser);
    console.log('注册成功:', convertedUser);
    
    // 重定向到目标页面或首页
    const from = location.state?.from?.pathname || '/';
    navigate(from, { replace: true });
  }, [navigate, location.state?.from?.pathname]);

  /**
   * 初始化
   */
  useEffect(() => {
    const init = async () => {
      try {
        setLoading(true);
        const currentGuard = initGuard();
        
        // 设置事件监听器
        currentGuard.on('login', handleLogin);
        currentGuard.on('register', handleRegister);
        
        // 检查是否已经登录
        const loginStatus = await currentGuard.checkLoginStatus();
        if (loginStatus) {
          const user = await currentGuard.trackSession();
          if (user) {
            // 转换 Authing SDK 的用户类型到我们的 User 类型
            const convertedUser: User = {
              id: String((user as any).id || (user as any).userId || ''),
              username: String((user as any).username || (user as any).nickname || ''),
              email: String((user as any).email || ''),
              phone: String((user as any).phone || ''),
              nickname: String((user as any).nickname || (user as any).username || ''),
              avatar: String((user as any).photo || (user as any).avatar || ''),
              ...user // 保留其他属性
            };
            
            setUserInfo(convertedUser);
            
            // 如果已经登录，直接重定向
            const from = location.state?.from?.pathname || '/';
            navigate(from, { replace: true });
          }
        }
      } catch (error) {
        console.error('初始化失败:', error);
      } finally {
        setLoading(false);
      }
    };

    init();
  }, [initGuard, handleLogin, handleRegister, navigate, location.state?.from?.pathname]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">正在加载登录页面...</p>
        </div>
      </div>
    );
  }

  if (userInfo) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">登录成功</h2>
          <p className="text-gray-600">正在跳转...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            登录您的账户
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            使用 Authing 进行安全登录
          </p>
        </div>
        
        <div className="mt-8 space-y-6">
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-4">
              点击下方按钮开始登录
            </p>
            <button
              onClick={() => guard?.show()}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              开始登录
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthingLoginPage; 