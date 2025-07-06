/**
 * 用户状态测试页面
 * 用于调试用户认证状态
 */

import React, { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function UserStatusPage() {
  const { 
    user, 
    status, 
    isLoading, 
    isAuthenticated, 
    isInitialized,
    checkAuth,
    authing 
  } = useAuth();

  useEffect(() => {
    console.log('UserStatusPage mounted');
    console.log('Current status:', status);
    console.log('Is authenticated:', isAuthenticated);
    console.log('User:', user);
  }, [status, isAuthenticated, user]);

  const handleRefreshAuth = async () => {
    console.log('Manual refresh auth called');
    await checkAuth();
  };

  const handleGetCurrentUser = async () => {
    if (!authing) {
      console.log('No authing client available');
      return;
    }
    
    try {
      console.log('Calling getCurrentUser...');
      const currentUser = await authing.getCurrentUser();
      console.log('getCurrentUser result:', currentUser);
      alert(`getCurrentUser result: ${JSON.stringify(currentUser, null, 2)}`);
    } catch (error) {
      console.error('getCurrentUser error:', error);
      alert(`getCurrentUser error: ${error}`);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle>用户状态调试</CardTitle>
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
              <strong>Authing已初始化:</strong> {isInitialized ? '是' : '否'}
            </div>
            <div>
              <strong>Authing实例:</strong> {authing ? '存在' : '不存在'}
            </div>
          </div>

          {user && (
            <div className="border rounded p-4">
              <h3 className="font-semibold mb-2">用户信息:</h3>
              <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto">
                {JSON.stringify(user, null, 2)}
              </pre>
            </div>
          )}

          <div className="flex space-x-4">
            <Button onClick={handleRefreshAuth}>
              刷新认证状态
            </Button>
            <Button onClick={handleGetCurrentUser} variant="outline">
              测试 getCurrentUser
            </Button>
            <Button 
              onClick={() => {
                localStorage.removeItem('authing_user');
                localStorage.removeItem('authing_code');
                localStorage.removeItem('authing_state');
                window.location.reload();
              }} 
              variant="destructive"
            >
              清除存储并刷新
            </Button>
          </div>

          <div className="text-xs text-gray-500">
            <p>调试信息:</p>
            <p>- 查看浏览器控制台的详细日志</p>
            <p>- 点击"测试 getCurrentUser"查看原始用户数据</p>
            <p>- 如果用户信息为空，可能需要重新登录</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 