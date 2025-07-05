/**
 * Authing 登录页面
 * 使用 Authing Guard UI 提供完整的登录体验
 */

import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import authingService from '@/services/authingService';
import { useAuthing } from '@/hooks/useAuthing';

/**
 * Authing 登录页面组件
 * 直接弹出 Authing Guard UI，提供完整的登录体验
 * @returns React 组件
 */
const AuthingLoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isLoggedIn, loading, getCurrentUser, checkLoginStatus, setUserInfo } = useAuthing();

  // 获取重定向路径
  const from = location.state?.from?.pathname || '/';

  // 未登录时弹出 Guard
  useEffect(() => {
    if (!isLoggedIn) {
      const guard = authingService.initGuard();
      guard.show();
      
      // 监听登录成功事件
      const handleLogin = async (userInfo: any) => {
        console.log('登录成功:', userInfo);
        guard.hide();
        
        // 直接使用登录事件返回的用户信息
        console.log('开始同步登录状态...');
        try {
          // 直接设置用户信息，避免重复调用 API
          console.log('使用登录事件返回的用户信息:', userInfo);
          setUserInfo(userInfo);
          console.log('登录状态同步完成，准备跳转...');
          // 使用 setTimeout 确保状态更新完成后再跳转
          setTimeout(() => {
            navigate(from, { replace: true });
          }, 100);
        } catch (error) {
          console.error('同步登录状态失败:', error);
        }
      };
      
      const handleRegister = async (userInfo: any) => {
        console.log('注册成功:', userInfo);
        guard.hide();
        
        console.log('开始同步注册状态...');
        try {
          console.log('使用注册事件返回的用户信息:', userInfo);
          setUserInfo(userInfo);
          console.log('注册状态同步完成，准备跳转...');
          setTimeout(() => {
            navigate(from, { replace: true });
          }, 100);
        } catch (error) {
          console.error('同步注册状态失败:', error);
        }
      };
      
      const handleLoginError = (error: any) => {
        console.error('登录失败:', error);
      };
      
      const handleClose = () => {
        console.log('Guard UI 已关闭');
      };
      
      guard.on('login', handleLogin);
      guard.on('register', handleRegister);
      guard.on('login-error', handleLoginError);
      guard.on('close', handleClose);
      
      return () => {
        guard.hide();
      };
    }
  }, [isLoggedIn, getCurrentUser, checkLoginStatus, from, navigate]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">加载中...</div>;
  }

  // 已登录时不渲染任何内容
  if (isLoggedIn) return null;

  /**
   * 手动触发显示 Guard UI
   */
  const handleShowLogin = () => {
    const guard = authingService.initGuard();
    guard.show();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-gray-900">
            欢迎使用文派AI
          </CardTitle>
          <CardDescription className="text-gray-600">
            请登录您的账户以继续使用
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* 登录说明 */}
          <div className="text-center space-y-4">
            <div className="animate-pulse">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
            </div>
            
            <p className="text-gray-600">
              Authing Guard UI 正在加载中...
            </p>
            
            <p className="text-sm text-gray-500">
              如果登录弹窗没有自动弹出，请点击下方按钮
            </p>
          </div>

          {/* 手动触发按钮 */}
          <div className="space-y-3">
            <Button 
              onClick={handleShowLogin} 
              className="w-full"
              size="lg"
            >
              打开登录界面
            </Button>
            
            <Button 
              onClick={() => navigate('/')} 
              variant="outline" 
              className="w-full"
            >
              返回首页
            </Button>
          </div>

          {/* 功能特性 */}
          <div className="space-y-2">
            <div className="text-sm font-medium text-gray-700">文派AI 功能特性：</div>
            <div className="flex flex-wrap gap-2">
              <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">智能内容适配</span>
              <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">多平台支持</span>
              <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded">实时预览</span>
              <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded">安全可靠</span>
            </div>
          </div>

          {/* 登录方式说明 */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-800 mb-2">支持的登录方式</h4>
            <div className="text-sm text-blue-700 space-y-1">
              <p>• 用户名/邮箱 + 密码登录</p>
              <p>• 手机号 + 验证码登录</p>
              <p>• 邮箱 + 验证码登录</p>
              <p>• 微信、GitHub 等社交登录</p>
              <p>• 新用户注册</p>
              <p>• 忘记密码找回</p>
            </div>
          </div>

          {/* 调试信息 */}
          {process.env.NODE_ENV === 'development' && (
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-gray-700 mb-2">调试信息</h4>
              <div className="text-xs text-gray-600 space-y-1">
                <p>当前时间: {new Date().toLocaleString()}</p>
                <p>页面路径: {window.location.pathname}</p>
                <p>重定向目标: {from}</p>
                <p>Authing 配置: {JSON.stringify(authingService.getConfig(), null, 2)}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AuthingLoginPage; 