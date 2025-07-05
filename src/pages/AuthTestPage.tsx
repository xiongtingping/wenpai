import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { getAuthingConfig } from '@/config/authing';

/**
 * Authing登录测试页面
 * 用于调试登录相关问题
 */
export default function AuthTestPage() {
  const { user, isAuthenticated, showLogin, login, guard, status } = useAuth();
  
  const handleDirectLogin = async () => {
    console.log('Direct login button clicked');
    console.log('Guard:', guard);
    console.log('Authing config:', getAuthingConfig());
    
    if (guard) {
      try {
        console.log('Attempting direct login...');
        await guard.startWithRedirect();
      } catch (error) {
        console.error('Direct login failed:', error);
        alert('登录失败: ' + error);
      }
    } else {
      console.error('Guard not available');
      alert('Guard未初始化');
    }
  };

  const handleShowLogin = () => {
    console.log('Show login button clicked');
    showLogin();
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Authing 登录测试</CardTitle>
          <CardDescription>
            用于调试Authing登录相关问题
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* 状态信息 */}
          <div className="space-y-2">
            <h3 className="font-semibold">当前状态:</h3>
            <div className="text-sm space-y-1">
              <p>认证状态: {status}</p>
              <p>是否已登录: {isAuthenticated ? '是' : '否'}</p>
              <p>Guard可用: {guard ? '是' : '否'}</p>
              {user && (
                <div>
                  <p>用户信息:</p>
                  <pre className="bg-gray-100 p-2 rounded text-xs overflow-auto">
                    {JSON.stringify(user, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </div>

          {/* 配置信息 */}
          <div className="space-y-2">
            <h3 className="font-semibold">Authing配置:</h3>
            <pre className="bg-gray-100 p-2 rounded text-xs overflow-auto">
              {JSON.stringify(getAuthingConfig(), null, 2)}
            </pre>
          </div>

          {/* 测试按钮 */}
          <div className="space-y-4">
            <h3 className="font-semibold">测试操作:</h3>
            <div className="flex flex-wrap gap-4">
              <Button 
                onClick={handleShowLogin}
                className="bg-blue-600 hover:bg-blue-700"
              >
                使用 showLogin() 登录
              </Button>
              
              <Button 
                onClick={handleDirectLogin}
                variant="outline"
              >
                直接调用 loginWithRedirect()
              </Button>
              
              <Button 
                onClick={() => {
                  console.log('Guard object:', guard);
                  console.log('Guard methods:', Object.getOwnPropertyNames(guard || {}));
                }}
                variant="outline"
              >
                打印Guard信息
              </Button>
            </div>
          </div>

          {/* 调试信息 */}
          <div className="space-y-2">
            <h3 className="font-semibold">调试信息:</h3>
            <p className="text-sm text-gray-600">
              请打开浏览器控制台查看详细的调试信息
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 