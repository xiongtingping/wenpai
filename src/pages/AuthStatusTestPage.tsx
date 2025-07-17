/**
 * 认证状态测试页面
 * 用于测试和调试认证系统的各种状态
 */

import React, { useState, useEffect } from 'react';
import { useUnifiedAuth } from '@/contexts/UnifiedAuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  User, 
  Shield, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  RefreshCw,
  LogIn,
  LogOut,
  Settings
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

/**
 * 认证状态测试页面
 */
export default function AuthStatusTestPage() {
  const [refreshKey, setRefreshKey] = useState(0);
  const { toast } = useToast();
  
  const {
    user,
    isAuthenticated,
    loading,
    error,
    login,
    logout,
    checkAuth
  } = useUnifiedAuth();

  const [testResults, setTestResults] = useState<{
    [key: string]: { status: 'success' | 'error' | 'warning' | 'info'; message: string; }
  }>({});

  /**
   * 添加测试结果
   */
  const addTestResult = (key: string, status: 'success' | 'error' | 'warning' | 'info', message: string) => {
    setTestResults(prev => ({
      ...prev,
      [key]: { status, message }
    }));
  };

  /**
   * 运行认证状态测试
   */
  const runAuthTests = () => {
    setTestResults({});
    
    // 测试1: 认证状态
    addTestResult(
      'auth_status',
      isAuthenticated ? 'success' : 'warning',
      isAuthenticated ? '用户已登录' : '用户未登录'
    );

    // 测试2: 用户信息
    if (user) {
      addTestResult(
        'user_info',
        'success',
        `用户ID: ${user.id}, 用户名: ${user.username || 'N/A'}`
      );
    } else {
      addTestResult(
        'user_info',
        'warning',
        '用户信息为空'
      );
    }

    // 测试3: 加载状态
    addTestResult(
      'loading_state',
      loading ? 'info' : 'success',
      loading ? '正在加载中' : '加载完成'
    );

    // 测试4: 错误状态
    if (error) {
      addTestResult(
        'error_state',
        'error',
        `错误信息: ${error}`
      );
    } else {
      addTestResult(
        'error_state',
        'success',
        '无错误信息'
      );
    }

    // 测试5: 本地存储
    const localUser = localStorage.getItem('authing_user');
    const localToken = localStorage.getItem('authing_token');
    
    if (localUser && localToken) {
      addTestResult(
        'local_storage',
        'success',
        '本地存储包含用户信息和Token'
      );
    } else {
      addTestResult(
        'local_storage',
        'warning',
        '本地存储缺少用户信息或Token'
      );
    }

    toast({
      title: "测试完成",
      description: `共执行了 ${Object.keys(testResults).length} 项测试`,
    });
  };

  /**
   * 刷新认证状态
   */
  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
    checkAuth();
    toast({
      title: "状态已刷新",
      description: "认证状态已重新检查",
    });
  };

  /**
   * 测试登录功能
   */
  const handleTestLogin = () => {
    login();
    addTestResult(
      'login_test',
      'info',
      '正在跳转到登录页面...'
    );
  };

  /**
   * 测试登出功能
   */
  const handleTestLogout = async () => {
    try {
      await logout();
      addTestResult(
        'logout_test',
        'success',
        '登出成功'
      );
    } catch (error) {
      addTestResult(
        'logout_test',
        'error',
        `登出失败: ${error instanceof Error ? error.message : '未知错误'}`
      );
    }
  };

  // 自动运行测试
  useEffect(() => {
    runAuthTests();
  }, [refreshKey, isAuthenticated, user, loading, error]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error': return <XCircle className="h-4 w-4 text-red-500" />;
      case 'warning': return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case 'info': return <AlertCircle className="h-4 w-4 text-blue-500" />;
      default: return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'bg-green-50 border-green-200';
      case 'error': return 'bg-red-50 border-red-200';
      case 'warning': return 'bg-yellow-50 border-yellow-200';
      case 'info': return 'bg-blue-50 border-blue-200';
      default: return 'bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">认证状态测试</h1>
          <p className="text-gray-600 mt-2">测试和调试认证系统的各种状态</p>
        </div>
        <div className="flex space-x-2">
          <Button onClick={handleRefresh} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            刷新状态
          </Button>
          <Button onClick={runAuthTests}>
            <Settings className="h-4 w-4 mr-2" />
            运行测试
          </Button>
        </div>
      </div>

      {/* 当前状态概览 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            当前认证状态
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm font-medium">登录状态</span>
              <Badge variant={isAuthenticated ? "default" : "secondary"}>
                {isAuthenticated ? "已登录" : "未登录"}
              </Badge>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm font-medium">加载状态</span>
              {loading && <Badge variant="outline">加载中</Badge>}
            </div>
            
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm font-medium">用户信息</span>
              {user ? (
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <span className="text-sm">{user.nickname || user.username || 'N/A'}</span>
                </div>
              ) : (
                <span className="text-sm text-gray-500">无</span>
              )}
            </div>
            
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm font-medium">错误状态</span>
              {error ? (
                <Badge variant="destructive">有错误</Badge>
              ) : (
                <Badge variant="outline">正常</Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 用户详细信息 */}
      {user && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              用户详细信息
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <strong>用户ID:</strong> {user.id}
              </div>
              <div>
                <strong>用户名:</strong> {user.username || 'N/A'}
              </div>
              <div>
                <strong>昵称:</strong> {user.nickname || 'N/A'}
              </div>
              <div>
                <strong>邮箱:</strong> {user.email || 'N/A'}
              </div>
              <div>
                <strong>手机:</strong> {user.phone || 'N/A'}
              </div>
              <div>
                <strong>登录时间:</strong> {user.loginTime || 'N/A'}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 测试结果 */}
      <Card>
        <CardHeader>
          <CardTitle>测试结果</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Object.entries(testResults).map(([key, result]) => (
              <div
                key={key}
                className={`p-3 rounded-lg border ${getStatusColor(result.status)}`}
              >
                <div className="flex items-center gap-2">
                  {getStatusIcon(result.status)}
                  <span className="font-medium capitalize">{key.replace('_', ' ')}</span>
                </div>
                <p className="text-sm mt-1">{result.message}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 操作按钮 */}
      <Card>
        <CardHeader>
          <CardTitle>操作测试</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button onClick={handleTestLogin} disabled={isAuthenticated}>
              <LogIn className="h-4 w-4 mr-2" />
              测试登录
            </Button>
            <Button onClick={handleTestLogout} disabled={!isAuthenticated} variant="outline">
              <LogOut className="h-4 w-4 mr-2" />
              测试登出
            </Button>
            <Button onClick={handleRefresh} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              刷新状态
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 