/**
 * Authing 完整功能测试页面
 * 
 * 用于测试Authing完整的注册/登录功能，包括：
 * - 用户注册
 * - 用户登录
 * - 用户信息获取
 * - 登录状态管理
 * - 登出功能
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { 
  LogIn, 
  UserPlus, 
  Shield, 
  CheckCircle, 
  AlertTriangle,
  ExternalLink,
  User,
  Mail,
  Phone,
  Calendar,
  LogOut,
  RefreshCw,
  Eye,
  EyeOff
} from 'lucide-react';
import { useUnifiedAuth } from '@/contexts/UnifiedAuthContext';
import AuthingGuardModal from '@/components/auth/AuthingGuardModal';

/**
 * Authing 完整功能测试页面
 */
const AuthingCompleteTestPage: React.FC = () => {
  const { 
    user, 
    isAuthenticated, 
    loading, 
    error,
    login,
    register,
    logout,
    checkAuth
  } = useUnifiedAuth();
  
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [showUserDetails, setShowUserDetails] = useState(false);
  const [testResults, setTestResults] = useState<{
    loginTest: boolean;
    registerTest: boolean;
    userInfoTest: boolean;
    logoutTest: boolean;
    sessionTest: boolean;
  }>({
    loginTest: false,
    registerTest: false,
    userInfoTest: false,
    logoutTest: false,
    sessionTest: false
  });

  // 自动检查认证状态
  useEffect(() => {
    if (isAuthenticated && user) {
      setTestResults(prev => ({
        ...prev,
        userInfoTest: true,
        sessionTest: true
      }));
    }
  }, [isAuthenticated, user]);

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
   * 测试直接登录（跳转方式）
   */
  const testDirectLogin = () => {
    console.log('🧪 测试直接登录（跳转方式）...');
    login();
  };

  /**
   * 测试直接注册（跳转方式）
   */
  const testDirectRegister = () => {
    console.log('🧪 测试直接注册（跳转方式）...');
    register();
  };

  /**
   * 测试登出功能
   */
  const testLogout = async () => {
    console.log('🧪 测试登出功能...');
    await logout();
    setTestResults(prev => ({ ...prev, logoutTest: true }));
  };

  /**
   * 测试会话检查
   */
  const testSessionCheck = () => {
    console.log('🧪 测试会话检查...');
    checkAuth();
  };

  /**
   * 处理登录成功
   */
  const handleLoginSuccess = (userInfo: any) => {
    console.log('✅ 登录成功:', userInfo);
    setShowLoginModal(false);
    setTestResults(prev => ({ ...prev, loginTest: true }));
  };

  /**
   * 处理注册成功
   */
  const handleRegisterSuccess = (userInfo: any) => {
    console.log('✅ 注册成功:', userInfo);
    setShowRegisterModal(false);
    setTestResults(prev => ({ ...prev, registerTest: true }));
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* 页面标题 */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Authing 完整功能测试
          </h1>
          <p className="text-gray-600">
            测试Authing完整的注册/登录功能，包括用户管理、会话管理等
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
              <div className="space-y-4">
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

                {/* 用户详细信息 */}
                {showUserDetails && user && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-medium mb-3 flex items-center gap-2">
                      <User className="h-4 w-4" />
                      用户详细信息
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">用户ID:</span>
                        <span className="font-mono text-xs">{user.id}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">用户名:</span>
                        <span>{user.username}</span>
                      </div>
                      {user.email && (
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4" />
                          <span className="font-medium">邮箱:</span>
                          <span>{user.email}</span>
                        </div>
                      )}
                      {user.phone && (
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4" />
                          <span className="font-medium">手机:</span>
                          <span>{user.phone}</span>
                        </div>
                      )}
                      {user.loginTime && (
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          <span className="font-medium">登录时间:</span>
                          <span>{new Date(user.loginTime).toLocaleString()}</span>
                        </div>
                      )}
                      {user.roles && user.roles.length > 0 && (
                        <div className="flex items-center gap-2">
                          <span className="font-medium">角色:</span>
                          <div className="flex gap-1">
                            {user.roles.map((role, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {role}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* 用户操作按钮 */}
                <div className="flex gap-2 justify-center">
                  <Button
                    onClick={() => setShowUserDetails(!showUserDetails)}
                    variant="outline"
                    size="sm"
                  >
                    {showUserDetails ? (
                      <>
                        <EyeOff className="h-4 w-4 mr-2" />
                        隐藏详情
                      </>
                    ) : (
                      <>
                        <Eye className="h-4 w-4 mr-2" />
                        显示详情
                      </>
                    )}
                  </Button>
                  <Button onClick={testLogout} variant="destructive" size="sm">
                    <LogOut className="h-4 w-4 mr-2" />
                    登出
                  </Button>
                </div>
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

        {/* 功能测试 */}
        <Card>
          <CardHeader>
            <CardTitle>功能测试</CardTitle>
            <CardDescription>
              测试Authing的各项功能
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* 弹窗模式测试 */}
            <div className="space-y-3">
              <h4 className="font-medium text-sm text-gray-700">弹窗模式测试</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Button onClick={testLogin} className="flex items-center gap-2">
                  <LogIn className="h-4 w-4" />
                  弹窗登录测试
                  <ExternalLink className="h-4 w-4" />
                </Button>
                <Button onClick={testRegister} variant="outline" className="flex items-center gap-2">
                  <UserPlus className="h-4 w-4" />
                  弹窗注册测试
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <Separator />

            {/* 跳转模式测试 */}
            <div className="space-y-3">
              <h4 className="font-medium text-sm text-gray-700">跳转模式测试</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Button onClick={testDirectLogin} variant="outline" className="flex items-center gap-2">
                  <LogIn className="h-4 w-4" />
                  跳转登录测试
                  <ExternalLink className="h-4 w-4" />
                </Button>
                <Button onClick={testDirectRegister} variant="outline" className="flex items-center gap-2">
                  <UserPlus className="h-4 w-4" />
                  跳转注册测试
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <Separator />

            {/* 会话管理测试 */}
            <div className="space-y-3">
              <h4 className="font-medium text-sm text-gray-700">会话管理测试</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Button onClick={testSessionCheck} variant="outline" className="flex items-center gap-2">
                  <RefreshCw className="h-4 w-4" />
                  检查会话状态
                </Button>
                {isAuthenticated && (
                  <Button onClick={testLogout} variant="destructive" className="flex items-center gap-2">
                    <LogOut className="h-4 w-4" />
                    测试登出
                  </Button>
                )}
              </div>
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
                <span>弹窗登录测试</span>
                <Badge variant={testResults.loginTest ? "default" : "secondary"}>
                  {testResults.loginTest ? "已测试" : "未测试"}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>弹窗注册测试</span>
                <Badge variant={testResults.registerTest ? "default" : "secondary"}>
                  {testResults.registerTest ? "已测试" : "未测试"}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>用户信息获取</span>
                <Badge variant={testResults.userInfoTest ? "default" : "secondary"}>
                  {testResults.userInfoTest ? "已测试" : "未测试"}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>登出功能测试</span>
                <Badge variant={testResults.logoutTest ? "default" : "secondary"}>
                  {testResults.logoutTest ? "已测试" : "未测试"}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>会话状态管理</span>
                <Badge variant={testResults.sessionTest ? "default" : "secondary"}>
                  {testResults.sessionTest ? "已测试" : "未测试"}
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
                <li><strong>弹窗模式</strong>：使用Authing Guard弹窗，无需跳转页面</li>
                <li><strong>跳转模式</strong>：直接跳转到Authing官方页面进行认证</li>
                <li><strong>用户信息</strong>：测试用户信息的获取和显示</li>
                <li><strong>会话管理</strong>：测试登录状态的持久化和检查</li>
                <li><strong>登出功能</strong>：测试用户登出和会话清理</li>
                <li>所有测试都会在控制台输出详细信息</li>
              </ul>
            </div>
          </AlertDescription>
        </Alert>

        {/* 错误信息 */}
        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>错误信息：</strong> {error}
            </AlertDescription>
          </Alert>
        )}
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

export default AuthingCompleteTestPage; 