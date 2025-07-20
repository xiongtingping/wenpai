/**
 * ✅ Authing 测试页面
 * 
 * 用于在浏览器中测试 Authing 配置和认证流程
 * 提供完整的测试工具和诊断信息
 * 
 * 🔒 LOCKED: 已封装稳定，禁止修改核心逻辑
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  TestTube, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Loader2,
  RefreshCw,
  Settings,
  User,
  Shield,
  Globe,
  Stethoscope,
  FileText,
  Zap,
  LogIn,
  UserPlus,
  LogOut
} from 'lucide-react';
import { useUnifiedAuth } from '@/contexts/UnifiedAuthContext';
import { 
  testAuthingConfig, 
  testAuthingGuard, 
  testAuthingCallback, 
  runFullAuthingTest
} from '@/utils/authingTest';
import { getAuthingConfig, getGuardConfig } from '@/config/authing';

/**
 * Authing 测试页面组件
 */
export default function AuthingTestPage() {
  const { user, isAuthenticated, loading, login, register, logout } = useUnifiedAuth();
  const [testResults, setTestResults] = useState<any>(null);
  const [currentConfig, setCurrentConfig] = useState<any>(null);

  // 运行基础测试
  const runBasicTest = async () => {
    try {
      setTestResults({ loading: true, type: 'basic' });
      
      const results = await runFullAuthingTest();
      setTestResults({ ...results, type: 'basic' });
    } catch (error) {
      setTestResults({ 
        success: false, 
        error: error instanceof Error ? error.message : '未知错误',
        type: 'basic'
      });
    }
  };

  // 运行完整测试
  const runFullTest = async () => {
    try {
      setTestResults({ loading: true, type: 'full' });
      
      const results = await runFullAuthingTest();
      setTestResults({ ...results, type: 'full' });
    } catch (error) {
      setTestResults({ 
        success: false, 
        error: error instanceof Error ? error.message : '未知错误',
        type: 'full'
      });
    }
  };

  // 检查当前配置
  const checkCurrentConfig = () => {
    try {
      const authingConfig = getAuthingConfig();
      const guardConfig = getGuardConfig();
      setCurrentConfig({ authingConfig, guardConfig });
    } catch (error) {
      setCurrentConfig({ 
        error: error instanceof Error ? error.message : '配置检查失败'
      });
    }
  };

  // 测试登录功能
  const testLogin = async () => {
    try {
      setTestResults({ loading: true, type: 'login' });
      
      // 模拟登录测试
      const result = await login();
      setTestResults({ 
        success: true, 
        message: '登录测试完成',
        data: result,
        type: 'login'
      });
    } catch (error) {
      setTestResults({ 
        success: false, 
        error: error instanceof Error ? error.message : '登录测试失败',
        type: 'login'
      });
    }
  };

  // 测试注册功能
  const testRegister = async () => {
    try {
      setTestResults({ loading: true, type: 'register' });
      
      // 模拟注册测试
      const result = await register();
      setTestResults({ 
        success: true, 
        message: '注册测试完成',
        data: result,
        type: 'register'
      });
    } catch (error) {
      setTestResults({ 
        success: false, 
        error: error instanceof Error ? error.message : '注册测试失败',
        type: 'register'
      });
    }
  };

  // 测试登出功能
  const testLogout = async () => {
    try {
      setTestResults({ loading: true, type: 'logout' });
      
      await logout();
      setTestResults({ 
        success: true, 
        message: '登出测试完成',
        type: 'logout'
      });
    } catch (error) {
      setTestResults({ 
        success: false, 
        error: error instanceof Error ? error.message : '登出测试失败',
        type: 'logout'
      });
    }
  };

  // 测试认证状态
  const testAuthStatus = () => {
    setTestResults({ 
      success: true, 
      message: '认证状态检查完成',
      data: {
        isAuthenticated,
        loading,
        user: user ? { id: user.id, email: user.email } : null
      },
      type: 'status'
    });
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Authing 测试页面</h1>
        <p className="text-gray-600">测试 Authing 认证服务的各项功能</p>
      </div>

      {/* 测试按钮组 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Button 
          onClick={runBasicTest}
          disabled={testResults?.loading}
          className="bg-blue-500 hover:bg-blue-600"
        >
          {testResults?.loading && testResults.type === 'basic' ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <TestTube className="w-4 h-4 mr-2" />
          )}
          基础测试
        </Button>

        <Button 
          onClick={runFullTest}
          disabled={testResults?.loading}
          className="bg-green-500 hover:bg-green-600"
        >
          {testResults?.loading && testResults.type === 'full' ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Zap className="w-4 h-4 mr-2" />
          )}
          完整测试
        </Button>

        <Button 
          onClick={checkCurrentConfig}
          disabled={testResults?.loading}
          className="bg-purple-500 hover:bg-purple-600"
        >
          <Settings className="w-4 h-4 mr-2" />
          检查配置
        </Button>

        <Button 
          onClick={testAuthStatus}
          disabled={testResults?.loading}
          className="bg-orange-500 hover:bg-orange-600"
        >
          <User className="w-4 h-4 mr-2" />
          认证状态
        </Button>

        <Button 
          onClick={testLogin}
          disabled={testResults?.loading}
          className="bg-indigo-500 hover:bg-indigo-600"
        >
          {testResults?.loading && testResults.type === 'login' ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <LogIn className="w-4 h-4 mr-2" />
          )}
          登录测试
        </Button>

        <Button 
          onClick={testRegister}
          disabled={testResults?.loading}
          className="bg-teal-500 hover:bg-teal-600"
        >
          {testResults?.loading && testResults.type === 'register' ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <UserPlus className="w-4 h-4 mr-2" />
          )}
          注册测试
        </Button>

        <Button 
          onClick={testLogout}
          disabled={testResults?.loading}
          className="bg-red-500 hover:bg-red-600"
        >
          {testResults?.loading && testResults.type === 'logout' ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <LogOut className="w-4 h-4 mr-2" />
          )}
          登出测试
        </Button>

        <Button 
          variant="outline"
          onClick={() => setTestResults(null)}
          className="border-gray-300"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          清除结果
        </Button>
      </div>

      {/* 测试结果 */}
      {testResults && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {testResults.success ? (
                <CheckCircle className="w-5 h-5 text-green-500" />
              ) : testResults.error ? (
                <XCircle className="w-5 h-5 text-red-500" />
              ) : (
                <Loader2 className="w-5 h-5 animate-spin" />
              )}
              测试结果
            </CardTitle>
          </CardHeader>
          <CardContent>
            {testResults.loading ? (
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>正在执行测试...</span>
              </div>
            ) : testResults.error ? (
              <div className="space-y-2">
                <p className="text-red-600 font-medium">测试失败</p>
                <p className="text-sm text-gray-600">{testResults.error}</p>
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-green-600 font-medium">测试成功</p>
                {testResults.message && (
                  <p className="text-sm text-gray-600">{testResults.message}</p>
                )}
                {testResults.data && (
                  <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto">
                    {JSON.stringify(testResults.data, null, 2)}
                  </pre>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* 当前配置 */}
      {currentConfig && (
        <Card>
          <CardHeader>
            <CardTitle>当前配置</CardTitle>
          </CardHeader>
          <CardContent>
            {currentConfig.error ? (
              <p className="text-red-600">{currentConfig.error}</p>
            ) : (
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Authing 配置</h4>
                  <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto">
                    {JSON.stringify(currentConfig.authingConfig, null, 2)}
                  </pre>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Guard 配置</h4>
                  <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto">
                    {JSON.stringify(currentConfig.guardConfig, null, 2)}
                  </pre>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
} 