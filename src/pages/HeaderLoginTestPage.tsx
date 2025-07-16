/**
 * Header登录按钮测试页面
 * 用于测试Header组件中的登录和注册按钮是否正常工作
 */

import React from 'react';
import { Header } from '@/components/landing/Header';
import { useUnifiedAuthContext } from '@/contexts/UnifiedAuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function HeaderLoginTestPage() {
  const { user, isAuthenticated, login } = useUnifiedAuthContext();

  const handleTestLogin = () => {
    console.log('测试登录按钮点击');
    login();
  };

  const handleTestLoginWithRedirect = () => {
    console.log('测试登录按钮点击（带跳转）');
    login('/profile');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="text-center">Header登录按钮测试</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            
            {/* 当前状态 */}
            <div className="p-4 bg-blue-50 rounded-lg">
              <h3 className="font-semibold text-blue-800 mb-2">当前状态</h3>
              <div className="text-sm text-blue-700 space-y-1">
                <p>认证状态: {isAuthenticated ? '已登录' : '未登录'}</p>
                {user && (
                  <p>用户信息: {user.nickname || user.username || user.email || '未知用户'}</p>
                )}
              </div>
            </div>

            {/* 测试按钮 */}
            <div className="space-y-4">
              <h3 className="font-semibold">测试按钮</h3>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  onClick={handleTestLogin}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  测试登录（无跳转）
                </Button>
                
                <Button 
                  onClick={handleTestLoginWithRedirect}
                  className="bg-green-600 hover:bg-green-700"
                >
                  测试登录（跳转到个人中心）
                </Button>
              </div>
            </div>

            {/* 说明 */}
            <div className="p-4 bg-yellow-50 rounded-lg">
              <h3 className="font-semibold text-yellow-800 mb-2">测试说明</h3>
              <div className="text-sm text-yellow-700 space-y-2">
                <p>1. 点击上方测试按钮应该显示 Authing Guard 登录弹窗</p>
                <p>2. 登录成功后弹窗应该自动关闭</p>
                <p>3. 如果带跳转参数，登录成功后应该跳转到指定页面</p>
                <p>4. 右上角的登录/注册按钮应该与测试按钮行为一致</p>
              </div>
            </div>

            {/* 调试信息 */}
            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold text-gray-800 mb-2">调试信息</h3>
              <div className="text-sm text-gray-600">
                <p>请打开浏览器控制台查看详细日志</p>
                <p>检查是否有 Authing Guard 相关的错误信息</p>
              </div>
            </div>

          </CardContent>
        </Card>
      </div>
    </div>
  );
} 