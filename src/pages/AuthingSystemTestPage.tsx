/**
 * Authing 登录系统测试页面
 * 全面测试 Authing 登录系统的各项功能
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { useUnifiedAuthContext } from '@/contexts/UnifiedAuthContext';
import { useAuthing } from '@/hooks/useAuthing';
import { getAuthingConfig } from '@/config/authing';
import { secureStorage, securityUtils } from '@/lib/security';
import { 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  User, 
  Shield, 
  Settings,
  RefreshCw,
  LogIn,
  LogOut,
  Eye,
  EyeOff
} from 'lucide-react';

/**
 * 测试结果接口
 */
interface TestResult {
  name: string;
  status: 'success' | 'error' | 'warning' | 'pending';
  message: string;
  details?: any;
}

/**
 * Authing 系统测试页面组件
 */
export default function AuthingSystemTestPage() {
  const { toast } = useToast();
  const { user, isAuthenticated, status, login, logout } = useUnifiedAuthContext();
  const { 
    user: authingUser, 
    isLoggedIn, 
    loading: authingLoading, 
    guard,
    checkLoginStatus,
    getCurrentUser,
    logout: authingLogout,
    showLogin,
    hideLogin
  } = useAuthing();
  
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isRunningTests, setIsRunningTests] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  /**
   * 运行配置检查测试
   */
  const runConfigTests = async (): Promise<TestResult[]> => {
    const results: TestResult[] = [];
    
    try {
      // 测试1: 检查Authing配置
      const config = getAuthingConfig();
      if (config.appId && config.host) {
        results.push({
          name: 'Authing配置检查',
          status: 'success',
          message: '配置完整',
          details: config
        });
      } else {
        results.push({
          name: 'Authing配置检查',
          status: 'error',
          message: '配置不完整',
          details: config
        });
      }

      // 测试2: 检查环境变量
      const envVars = {
        VITE_AUTHING_APP_ID: import.meta.env.VITE_AUTHING_APP_ID,
        VITE_AUTHING_HOST: import.meta.env.VITE_AUTHING_HOST,
        VITE_AUTHING_REDIRECT_URI: import.meta.env.VITE_AUTHING_REDIRECT_URI
      };
      
      const hasEnvVars = Object.values(envVars).some(v => v);
      results.push({
        name: '环境变量检查',
        status: hasEnvVars ? 'success' : 'warning',
        message: hasEnvVars ? '环境变量已配置' : '使用默认配置',
        details: envVars
      });

      // 测试3: 检查Guard实例
      if (guard) {
        results.push({
          name: 'Guard实例检查',
          status: 'success',
          message: 'Guard实例已创建',
          details: { guardType: guard.constructor.name }
        });
      } else {
        results.push({
          name: 'Guard实例检查',
          status: 'error',
          message: 'Guard实例未创建',
          details: null
        });
      }

    } catch (error) {
      results.push({
        name: '配置检查',
        status: 'error',
        message: '配置检查失败',
        details: error instanceof Error ? error.message : '未知错误'
      });
    }

    return results;
  };

  /**
   * 运行连接测试
   */
  const runConnectionTests = async (): Promise<TestResult[]> => {
    const results: TestResult[] = [];
    
    try {
      // 测试1: 检查Authing服务连接
      const config = getAuthingConfig();
      const response = await fetch(`${config.host}/api/v3/applications/${config.appId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        results.push({
          name: 'Authing服务连接',
          status: 'success',
          message: '连接正常',
          details: { status: response.status }
        });
      } else {
        results.push({
          name: 'Authing服务连接',
          status: 'error',
          message: `连接失败: ${response.status}`,
          details: { status: response.status }
        });
      }

    } catch (error) {
      results.push({
        name: 'Authing服务连接',
        status: 'error',
        message: '连接失败',
        details: error instanceof Error ? error.message : '未知错误'
      });
    }

    return results;
  };

  /**
   * 运行认证状态测试
   */
  const runAuthTests = async (): Promise<TestResult[]> => {
    const results: TestResult[] = [];
    
    try {
      // 测试1: 检查Authing登录状态
      if (guard) {
        const loginStatus = await checkLoginStatus();
        results.push({
          name: 'Authing登录状态',
          status: loginStatus ? 'success' : 'warning',
          message: loginStatus ? '用户已登录' : '用户未登录',
          details: { isLoggedIn: loginStatus }
        });
      }

      // 测试2: 检查本地认证状态
      results.push({
        name: '本地认证状态',
        status: isAuthenticated ? 'success' : 'warning',
        message: isAuthenticated ? '本地认证有效' : '本地未认证',
        details: { 
          isAuthenticated, 
          status,
          hasUser: !!user 
        }
      });

      // 测试3: 检查用户信息同步
      if (isAuthenticated && user && authingUser) {
        const isSynced = user.id === authingUser.id;
        results.push({
          name: '用户信息同步',
          status: isSynced ? 'success' : 'warning',
          message: isSynced ? '用户信息已同步' : '用户信息不同步',
          details: { 
            localUserId: user.id, 
            authingUserId: authingUser.id 
          }
        });
      } else if (isAuthenticated || isLoggedIn) {
        results.push({
          name: '用户信息同步',
          status: 'warning',
          message: '部分用户信息缺失',
          details: { 
            hasLocalUser: !!user, 
            hasAuthingUser: !!authingUser 
          }
        });
      }

    } catch (error) {
      results.push({
        name: '认证状态测试',
        status: 'error',
        message: '认证测试失败',
        details: error instanceof Error ? error.message : '未知错误'
      });
    }

    return results;
  };

  /**
   * 运行安全存储测试
   */
  const runSecurityTests = async (): Promise<TestResult[]> => {
    const results: TestResult[] = [];
    
    try {
      // 测试1: 检查安全存储功能
      const testData = { test: 'data', timestamp: Date.now() };
      secureStorage.setItem('test_key', testData);
      const retrievedData = secureStorage.getItem('test_key');
      secureStorage.removeItem('test_key');
      
      const isWorking = JSON.stringify(retrievedData) === JSON.stringify(testData);
      results.push({
        name: '安全存储功能',
        status: isWorking ? 'success' : 'error',
        message: isWorking ? '安全存储正常' : '安全存储异常',
        details: { testData, retrievedData }
      });

      // 测试2: 检查安全日志
      try {
        securityUtils.secureLog('测试安全日志', { test: true });
        results.push({
          name: '安全日志功能',
          status: 'success',
          message: '安全日志正常',
          details: { timestamp: new Date().toISOString() }
        });
      } catch (error) {
        results.push({
          name: '安全日志功能',
          status: 'error',
          message: '安全日志异常',
          details: error instanceof Error ? error.message : '未知错误'
        });
      }

    } catch (error) {
      results.push({
        name: '安全功能测试',
        status: 'error',
        message: '安全测试失败',
        details: error instanceof Error ? error.message : '未知错误'
      });
    }

    return results;
  };

  /**
   * 运行完整测试
   */
  const runAllTests = async () => {
    setIsRunningTests(true);
    setTestResults([]);
    
    try {
      const configResults = await runConfigTests();
      const connectionResults = await runConnectionTests();
      const authResults = await runAuthTests();
      const securityResults = await runSecurityTests();
      
      const allResults = [
        ...configResults,
        ...connectionResults,
        ...authResults,
        ...securityResults
      ];
      
      setTestResults(allResults);
      
      const successCount = allResults.filter(r => r.status === 'success').length;
      const errorCount = allResults.filter(r => r.status === 'error').length;
      
      toast({
        title: '测试完成',
        description: `成功: ${successCount}, 错误: ${errorCount}, 总计: ${allResults.length}`,
        variant: errorCount > 0 ? 'destructive' : 'default'
      });
      
    } catch (error) {
      toast({
        title: '测试失败',
        description: error instanceof Error ? error.message : '未知错误',
        variant: 'destructive'
      });
    } finally {
      setIsRunningTests(false);
    }
  };

  /**
   * 手动登录测试
   */
  const handleManualLogin = () => {
    if (guard) {
      showLogin();
      toast({
        title: '登录界面已打开',
        description: '请完成登录流程'
      });
    } else {
      toast({
        title: '登录失败',
        description: 'Guard实例未初始化',
        variant: 'destructive'
      });
    }
  };

  /**
   * 手动登出测试
   */
  const handleManualLogout = async () => {
    try {
      await authingLogout();
      logout();
      toast({
        title: '登出成功',
        description: '已清除所有认证信息'
      });
    } catch (error) {
      toast({
        title: '登出失败',
        description: error instanceof Error ? error.message : '未知错误',
        variant: 'destructive'
      });
    }
  };

  /**
   * 刷新用户信息
   */
  const handleRefreshUser = async () => {
    try {
      const userInfo = await getCurrentUser();
      if (userInfo) {
        login();
        toast({
          title: '用户信息已刷新',
          description: '用户信息已更新'
        });
      } else {
        toast({
          title: '刷新失败',
          description: '无法获取用户信息',
          variant: 'destructive'
        });
      }
    } catch (error) {
      toast({
        title: '刷新失败',
        description: error instanceof Error ? error.message : '未知错误',
        variant: 'destructive'
      });
    }
  };

  /**
   * 获取状态图标
   */
  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'warning':
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  /**
   * 获取状态颜色
   */
  const getStatusColor = (status: TestResult['status']) => {
    switch (status) {
      case 'success':
        return 'bg-green-100 text-green-800';
      case 'error':
        return 'bg-red-100 text-red-800';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Authing 登录系统测试
        </h1>
        <p className="text-gray-600">
          全面测试 Authing 登录系统的配置、连接、认证和安全功能
        </p>
      </div>

      {/* 当前状态概览 */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            当前状态概览
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm font-medium">Authing状态</span>
              <Badge variant={isLoggedIn ? 'default' : 'secondary'}>
                {isLoggedIn ? '已登录' : '未登录'}
              </Badge>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm font-medium">本地状态</span>
              <Badge variant={isAuthenticated ? 'default' : 'secondary'}>
                {isAuthenticated ? '已认证' : '未认证'}
              </Badge>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm font-medium">加载状态</span>
              <Badge variant={authingLoading ? 'secondary' : 'default'}>
                {authingLoading ? '加载中' : '就绪'}
              </Badge>
            </div>
          </div>
          
          {user && (
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">当前用户信息</h4>
              <div className="text-sm text-blue-800">
                <p>ID: {user.id}</p>
                <p>昵称: {user.nickname || '未设置'}</p>
                <p>邮箱: {user.email || '未设置'}</p>
                <p>手机: {user.phone || '未设置'}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 测试控制 */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            测试控制
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Button 
              onClick={runAllTests} 
              disabled={isRunningTests}
              className="flex items-center gap-2"
            >
              {isRunningTests ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4" />
              )}
              {isRunningTests ? '测试中...' : '运行完整测试'}
            </Button>
            
            <Button 
              onClick={handleManualLogin} 
              variant="outline"
              className="flex items-center gap-2"
            >
              <LogIn className="w-4 h-4" />
              手动登录测试
            </Button>
            
            <Button 
              onClick={handleManualLogout} 
              variant="outline"
              className="flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              手动登出测试
            </Button>
            
            <Button 
              onClick={handleRefreshUser} 
              variant="outline"
              className="flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              刷新用户信息
            </Button>
            
            <Button 
              onClick={() => setShowDetails(!showDetails)} 
              variant="ghost"
              className="flex items-center gap-2"
            >
              {showDetails ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              {showDetails ? '隐藏详情' : '显示详情'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 测试结果 */}
      {testResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              测试结果
            </CardTitle>
            <CardDescription>
              共 {testResults.length} 项测试，成功 {testResults.filter(r => r.status === 'success').length} 项
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {testResults.map((result, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(result.status)}
                      <span className="font-medium">{result.name}</span>
                    </div>
                    <Badge className={getStatusColor(result.status)}>
                      {result.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{result.message}</p>
                  {showDetails && result.details && (
                    <div className="mt-2 p-2 bg-gray-50 rounded text-xs">
                      <pre className="whitespace-pre-wrap">
                        {JSON.stringify(result.details, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* 配置信息 */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>当前配置信息</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium mb-2">Authing配置</h4>
              <div className="text-sm space-y-1">
                <p>App ID: {getAuthingConfig().appId}</p>
                <p>Host: {getAuthingConfig().host}</p>
                <p>Redirect URI: {getAuthingConfig().redirectUri}</p>
                <p>Mode: {getAuthingConfig().mode}</p>
              </div>
            </div>
            <div>
              <h4 className="font-medium mb-2">环境变量</h4>
              <div className="text-sm space-y-1">
                <p>VITE_AUTHING_APP_ID: {import.meta.env.VITE_AUTHING_APP_ID || '未设置'}</p>
                <p>VITE_AUTHING_HOST: {import.meta.env.VITE_AUTHING_HOST || '未设置'}</p>
                <p>VITE_AUTHING_REDIRECT_URI: {import.meta.env.VITE_AUTHING_REDIRECT_URI || '未设置'}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 