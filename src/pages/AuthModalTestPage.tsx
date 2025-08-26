/**
 * 🧪 弹窗模式测试页面
 * 用于测试@authing/guard弹窗模式是否正常工作
 */

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { LogIn, UserPlus, User, AlertCircle, CheckCircle } from 'lucide-react';

const AuthModalTestPage: React.FC = () => {
  const { login, register, logout, user, isAuthenticated, loading, error } = useAuth();
  const [testResults, setTestResults] = useState<string[]>([]);

  const addTestResult = (result: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${result}`]);
  };

  const handleLogin = async () => {
    try {
      addTestResult('🔄 开始登录测试...');
      await login('/');
      addTestResult('✅ 登录方法调用成功');
    } catch (error) {
      addTestResult(`❌ 登录失败: ${error}`);
    }
  };

  const handleRegister = async () => {
    try {
      addTestResult('🔄 开始注册测试...');
      await register('/');
      addTestResult('✅ 注册方法调用成功');
    } catch (error) {
      addTestResult(`❌ 注册失败: ${error}`);
    }
  };

  const handleLogout = async () => {
    try {
      addTestResult('🔄 开始登出测试...');
      await logout();
      addTestResult('✅ 登出成功');
    } catch (error) {
      addTestResult(`❌ 登出失败: ${error}`);
    }
  };

  const clearResults = () => {
    setTestResults([]);
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">🧪 弹窗模式测试</h1>
        <p className="text-muted-foreground">
          测试 @authing/guard 弹窗模式是否正常工作，验证是否解决了 redirect_uri_mismatch 问题
        </p>
      </div>

      {/* 当前状态 */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            当前认证状态
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">认证状态</p>
              <Badge variant={isAuthenticated ? "default" : "secondary"}>
                {isAuthenticated ? "已登录" : "未登录"}
              </Badge>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">加载状态</p>
              <Badge variant={loading ? "outline" : "secondary"}>
                {loading ? "加载中..." : "空闲"}
              </Badge>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">用户信息</p>
              <p className="text-sm">{user?.nickname || user?.username || '无'}</p>
            </div>
          </div>
          
          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <div className="flex items-center gap-2 text-red-700">
                <AlertCircle className="h-4 w-4" />
                <span className="font-medium">错误信息</span>
              </div>
              <p className="text-red-600 text-sm mt-1">{error}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 测试按钮 */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>弹窗测试</CardTitle>
          <CardDescription>
            点击下面的按钮测试弹窗模式的登录和注册功能
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <Button 
              onClick={handleLogin} 
              disabled={loading}
              className="flex items-center gap-2"
            >
              <LogIn className="h-4 w-4" />
              测试登录弹窗
            </Button>
            
            <Button 
              onClick={handleRegister} 
              disabled={loading}
              variant="outline"
              className="flex items-center gap-2"
            >
              <UserPlus className="h-4 w-4" />
              测试注册弹窗
            </Button>
            
            {isAuthenticated && (
              <Button 
                onClick={handleLogout} 
                disabled={loading}
                variant="destructive"
                className="flex items-center gap-2"
              >
                <LogIn className="h-4 w-4 rotate-180" />
                测试登出
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 测试结果 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              测试结果
            </CardTitle>
            <Button onClick={clearResults} variant="outline" size="sm">
              清空结果
            </Button>
          </div>
          <CardDescription>
            实时显示测试过程和结果
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-gray-50 rounded-md p-4 max-h-96 overflow-y-auto">
            {testResults.length === 0 ? (
              <p className="text-muted-foreground text-sm">暂无测试结果</p>
            ) : (
              <div className="space-y-1">
                {testResults.map((result, index) => (
                  <div key={index} className="text-sm font-mono">
                    {result}
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 技术说明 */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>🔧 技术说明</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <p><strong>弹窗模式优势:</strong></p>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li>不需要页面跳转，避免 redirect_uri_mismatch 问题</li>
              <li>用户体验更好，无需离开当前页面</li>
              <li>在同一域名下完成认证，安全性更高</li>
              <li>配置更简单，不需要复杂的回调URL配置</li>
            </ul>
            
            <p className="mt-4"><strong>测试要点:</strong></p>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li>点击按钮后应该弹出 Authing 认证窗口</li>
              <li>认证成功后弹窗自动关闭</li>
              <li>用户信息正确更新到应用状态中</li>
              <li>不应该出现任何 redirect_uri 相关错误</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AuthModalTestPage;
