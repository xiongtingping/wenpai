/**
 * Authing Guard 弹窗测试页面
 * 
 * 用于测试Authing Guard弹窗登录/注册功能
 */

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  LogIn, 
  UserPlus, 
  Shield, 
  CheckCircle, 
  AlertTriangle,
  ExternalLink
} from 'lucide-react';
import { useUnifiedAuth } from '@/contexts/UnifiedAuthContext';
import AuthingGuardModal from '@/components/auth/AuthingGuardModal';

/**
 * Authing Guard 弹窗测试页面
 */
const AuthingGuardTestPage: React.FC = () => {
  const { user, isAuthenticated, loading } = useUnifiedAuth();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [testResults, setTestResults] = useState<{
    loginTest: boolean;
    registerTest: boolean;
    callbackTest: boolean;
  }>({
    loginTest: false,
    registerTest: false,
    callbackTest: false
  });

  /**
   * 测试登录功能
   */
  const testLogin = () => {
    console.log('🧪 测试登录功能...');
    setShowLoginModal(true);
    setTestResults(prev => ({ ...prev, loginTest: true }));
  };

  /**
   * 测试注册功能
   */
  const testRegister = () => {
    console.log('🧪 测试注册功能...');
    setShowRegisterModal(true);
    setTestResults(prev => ({ ...prev, registerTest: true }));
  };

  /**
   * 测试回调功能
   */
  const testCallback = () => {
    console.log('🧪 测试回调功能...');
    // 模拟回调URL
    const callbackUrl = new URL('/callback', window.location.origin);
    callbackUrl.searchParams.set('code', 'test_code_' + Date.now());
    callbackUrl.searchParams.set('state', 'test_state');
    
    window.open(callbackUrl.toString(), '_blank');
    setTestResults(prev => ({ ...prev, callbackTest: true }));
  };

  /**
   * 处理登录成功
   */
  const handleLoginSuccess = (userInfo: any) => {
    console.log('✅ 登录成功:', userInfo);
    setShowLoginModal(false);
  };

  /**
   * 处理注册成功
   */
  const handleRegisterSuccess = (userInfo: any) => {
    console.log('✅ 注册成功:', userInfo);
    setShowRegisterModal(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* 页面标题 */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Authing Guard 弹窗测试
          </h1>
          <p className="text-gray-600">
            测试Authing Guard弹窗登录/注册功能
          </p>
        </div>

        {/* 认证状态 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              认证状态
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                <p className="text-gray-600">检查认证状态中...</p>
              </div>
            ) : isAuthenticated ? (
              <div className="text-center space-y-2">
                <CheckCircle className="h-12 w-12 text-green-600 mx-auto" />
                <h3 className="text-lg font-semibold">已登录</h3>
                <p className="text-sm text-gray-600">
                  欢迎回来，{user?.nickname || user?.username || '用户'}
                </p>
                <Badge variant="secondary" className="mx-auto">
                  {user?.email || user?.phone || '已认证用户'}
                </Badge>
              </div>
            ) : (
              <div className="text-center space-y-2">
                <AlertTriangle className="h-12 w-12 text-yellow-600 mx-auto" />
                <h3 className="text-lg font-semibold">未登录</h3>
                <p className="text-sm text-gray-600">请先登录以测试功能</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 测试功能 */}
        <Card>
          <CardHeader>
            <CardTitle>功能测试</CardTitle>
            <CardDescription>
              测试Authing Guard弹窗的各项功能
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* 登录测试 */}
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h4 className="font-medium">登录弹窗测试</h4>
                <p className="text-sm text-gray-600">测试Authing Guard登录弹窗功能</p>
              </div>
              <Button onClick={testLogin} className="flex items-center gap-2">
                <LogIn className="h-4 w-4" />
                测试登录
                <ExternalLink className="h-4 w-4" />
              </Button>
            </div>

            {/* 注册测试 */}
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h4 className="font-medium">注册弹窗测试</h4>
                <p className="text-sm text-gray-600">测试Authing Guard注册弹窗功能</p>
              </div>
              <Button onClick={testRegister} variant="outline" className="flex items-center gap-2">
                <UserPlus className="h-4 w-4" />
                测试注册
                <ExternalLink className="h-4 w-4" />
              </Button>
            </div>

            {/* 回调测试 */}
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h4 className="font-medium">回调处理测试</h4>
                <p className="text-sm text-gray-600">测试Authing回调处理功能</p>
              </div>
              <Button onClick={testCallback} variant="outline" className="flex items-center gap-2">
                <ExternalLink className="h-4 w-4" />
                测试回调
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* 测试结果 */}
        <Card>
          <CardHeader>
            <CardTitle>测试结果</CardTitle>
            <CardDescription>
              各项功能的测试状态
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span>登录弹窗测试</span>
                <Badge variant={testResults.loginTest ? "default" : "secondary"}>
                  {testResults.loginTest ? "已测试" : "未测试"}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>注册弹窗测试</span>
                <Badge variant={testResults.registerTest ? "default" : "secondary"}>
                  {testResults.registerTest ? "已测试" : "未测试"}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>回调处理测试</span>
                <Badge variant={testResults.callbackTest ? "default" : "secondary"}>
                  {testResults.callbackTest ? "已测试" : "未测试"}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 说明信息 */}
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-2">
              <p><strong>测试说明：</strong></p>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>登录测试：点击后会打开Authing Guard登录弹窗</li>
                <li>注册测试：点击后会打开Authing Guard注册弹窗</li>
                <li>回调测试：点击后会模拟Authing回调URL</li>
                <li>所有测试都会在控制台输出详细信息</li>
              </ul>
            </div>
          </AlertDescription>
        </Alert>
      </div>

      {/* 登录弹窗 */}
      <AuthingGuardModal
        open={showLoginModal}
        onOpenChange={setShowLoginModal}
        defaultScene="login"
        onSuccess={handleLoginSuccess}
      />

      {/* 注册弹窗 */}
      <AuthingGuardModal
        open={showRegisterModal}
        onOpenChange={setShowRegisterModal}
        defaultScene="register"
        onSuccess={handleRegisterSuccess}
      />
    </div>
  );
};

export default AuthingGuardTestPage; 