/**
 * 登录按钮测试页面
 * 用于测试各种登录按钮是否正常工作
 */

import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useUnifiedAuthContext } from '@/contexts/UnifiedAuthContext';
import { useAuthing } from '@/hooks/useAuthing';

export default function LoginButtonTestPage() {
  const { user, isAuthenticated, login } = useUnifiedAuthContext();
  const { showLogin, guard } = useAuthing();

  const handleTestUnifiedLogin = () => {
    console.log('测试统一认证登录按钮');
    login();
  };

  const handleTestDirectShowLogin = () => {
    console.log('测试直接调用showLogin');
    showLogin();
  };

  const handleTestGuardDirect = () => {
    console.log('测试直接调用guard.show()');
    if (guard) {
      guard.show();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="container mx-auto max-w-4xl">
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">
              登录按钮功能测试
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button 
                  onClick={handleTestUnifiedLogin}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  统一认证登录
                </Button>
                
                <Button 
                  onClick={handleTestDirectShowLogin}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  直接showLogin
                </Button>
                
                <Button 
                  onClick={handleTestGuardDirect}
                  className="bg-purple-600 hover:bg-purple-700 text-white"
                >
                  直接guard.show()
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>当前状态</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p><strong>认证状态:</strong> {isAuthenticated ? '已登录' : '未登录'}</p>
              <p><strong>用户信息:</strong> {user ? JSON.stringify(user, null, 2) : '无'}</p>
              <p><strong>Guard实例:</strong> {guard ? '已初始化' : '未初始化'}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>测试说明</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm text-gray-600">
              <p>• <strong>统一认证登录:</strong> 使用统一认证上下文的login()方法</p>
              <p>• <strong>直接showLogin:</strong> 直接调用useAuthing的showLogin()方法</p>
              <p>• <strong>直接guard.show():</strong> 直接调用guard实例的show()方法</p>
              <p>• 请点击不同的按钮测试登录弹窗是否正常显示</p>
              <p>• 观察控制台日志以了解执行过程</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 