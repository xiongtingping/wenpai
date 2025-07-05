import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function AuthTestPage() {
  const { 
    user, 
    isAuthenticated, 
    isLoading, 
    status, 
    showLogin, 
    logout, 
    guard,
    isInitialized 
  } = useAuth();

  const handleShowLogin = async () => {
    console.log('AuthTestPage: showLogin called');
    try {
      await showLogin();
    } catch (error) {
      console.error('AuthTestPage: showLogin failed:', error);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle>认证状态测试</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <strong>认证状态:</strong> {status}
            </div>
            <div>
              <strong>是否已认证:</strong> {isAuthenticated ? '是' : '否'}
            </div>
            <div>
              <strong>是否加载中:</strong> {isLoading ? '是' : '否'}
            </div>
            <div>
              <strong>Guard已初始化:</strong> {isInitialized ? '是' : '否'}
            </div>
            <div>
              <strong>Guard实例:</strong> {guard ? '存在' : '不存在'}
            </div>
          </div>

          {user && (
            <div className="border rounded p-4">
              <h3 className="font-semibold mb-2">用户信息:</h3>
              <pre className="text-xs bg-gray-100 p-2 rounded">
                {JSON.stringify(user, null, 2)}
              </pre>
            </div>
          )}

          <div className="flex space-x-4">
            <Button onClick={handleShowLogin} disabled={!isInitialized}>
              显示登录窗口
            </Button>
            {isAuthenticated && (
              <Button onClick={logout} variant="outline">
                退出登录
              </Button>
            )}
          </div>

          <div className="text-xs text-gray-500">
            <p>调试信息:</p>
            <p>- 如果点击"显示登录窗口"没有反应，请检查浏览器控制台的错误信息</p>
            <p>- 确保 Authing 配置正确，网络连接正常</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 