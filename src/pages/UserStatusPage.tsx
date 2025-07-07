/**
 * 用户状态测试页面
 * 用于调试用户认证状态
 */

import React, { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function UserStatusPage() {
  const { 
    user, 
    error, 
    isLoading, 
    isAuthenticated, 
    checkAuth
  } = useAuth();

  useEffect(() => {
    console.log('UserStatusPage mounted');
    console.log('Current error:', error);
    console.log('Is authenticated:', isAuthenticated);
    console.log('User:', user);
  }, [error, isAuthenticated, user]);

  const handleRefreshAuth = async () => {
    console.log('Manual refresh auth called');
    await checkAuth();
  };

  const handleGetCurrentUser = async () => {
    try {
      console.log('Calling checkAuth...');
      await checkAuth();
      console.log('checkAuth completed');
    } catch (error) {
      console.error('checkAuth error:', error);
      alert(`checkAuth error: ${error}`);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => window.location.href = '/adapt'}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800"
          >
            <ArrowLeft className="h-4 w-4" />
            返回内容适配器
          </Button>
          <div>
            <h1 className="text-3xl font-bold mb-2">用户状态调试</h1>
            <p className="text-muted-foreground">
              用于调试用户认证状态
            </p>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>用户状态调试</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <strong>错误信息:</strong> {error || '无'}
            </div>
            <div>
              <strong>是否已认证:</strong> {isAuthenticated ? '是' : '否'}
            </div>
            <div>
              <strong>是否加载中:</strong> {isLoading ? '是' : '否'}
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
              测试 checkAuth
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