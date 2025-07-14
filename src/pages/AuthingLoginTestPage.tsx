/**
 * Authing登录测试页面
 * 用于测试Authing登录系统的各项功能
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/contexts/AuthContext';
import { useAuthing } from '@/hooks/useAuthing';
import { getAuthingConfig } from '@/config/authing';
import { useToast } from '@/hooks/use-toast';
import { 
  User, 
  Shield, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  RefreshCw,
  LogIn,
  LogOut,
  Settings,
  Eye,
  EyeOff
} from 'lucide-react';

/**
 * Authing登录测试页面组件
 * @returns React 组件
 */
export default function AuthingLoginTestPage() {
  const { user, isAuthenticated, status, login, logout } = useAuth();
  const { user: authingUser, isLoggedIn, loading, guard, showLogin, hideLogin } = useAuthing();
  const { toast } = useToast();
  const [config, setConfig] = useState<any>(null);
  const [testResults, setTestResults] = useState<any[]>([]);

  /**
   * 加载Authing配置
   */
  useEffect(() => {
    try {
      const authingConfig = getAuthingConfig();
      setConfig(authingConfig);
    } catch (error) {
      console.error('加载Authing配置失败:', error);
    }
  }, []);

  /**
   * 添加测试结果
   */
  const addTestResult = (test: string, status: 'success' | 'error' | 'warning', message: string) => {
    setTestResults(prev => [...prev, {
      id: Date.now(),
      test,
      status,
      message,
      timestamp: new Date().toLocaleTimeString()
    }]);
  };

  /**
   * 测试Authing配置
   */
  const testAuthingConfig = () => {
    addTestResult('Authing配置', 'success', '配置加载成功');
    
    if (config) {
      addTestResult('App ID', 'success', config.appId);
      addTestResult('Host', 'success', config.host);
      addTestResult('Redirect URI', 'success', config.redirectUri);
      addTestResult('Mode', 'success', config.mode);
    } else {
      addTestResult('配置加载', 'error', '配置加载失败');
    }
  };

  /**
   * 测试网络连接
   */
  const testNetworkConnection = async () => {
    try {
      const response = await fetch('https://qutkgzkfaezk-demo.authing.cn');
      if (response.ok) {
        addTestResult('网络连接', 'success', 'Authing服务可访问');
      } else {
        addTestResult('网络连接', 'error', `服务响应异常: ${response.status}`);
      }
    } catch (error) {
      addTestResult('网络连接', 'error', `连接失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  };

  /**
   * 测试Guard组件
   */
  const testGuardComponent = () => {
    if (guard) {
      addTestResult('Guard组件', 'success', 'Guard组件已初始化');
    } else {
      addTestResult('Guard组件', 'error', 'Guard组件未初始化');
    }
  };

  /**
   * 测试登录状态
   */
  const testLoginStatus = () => {
    if (isLoggedIn) {
      addTestResult('登录状态', 'success', '用户已登录');
    } else {
      addTestResult('登录状态', 'warning', '用户未登录');
    }
  };

  /**
   * 测试用户信息
   */
  const testUserInfo = () => {
    if (user) {
      addTestResult('用户信息', 'success', `用户ID: ${user.id}`);
      addTestResult('用户名', 'success', user.nickname || user.username || '未设置');
      addTestResult('邮箱', 'success', user.email || '未设置');
    } else {
      addTestResult('用户信息', 'warning', '无用户信息');
    }
  };

  /**
   * 运行所有测试
   */
  const runAllTests = () => {
    setTestResults([]);
    testAuthingConfig();
    testNetworkConnection();
    testGuardComponent();
    testLoginStatus();
    testUserInfo();
    
    toast({
      title: "测试完成",
      description: "请查看测试结果"
    });
  };

  /**
   * 显示登录界面
   */
  const handleShowLogin = () => {
    showLogin();
    addTestResult('显示登录', 'success', '登录界面已显示');
  };

  /**
   * 隐藏登录界面
   */
  const handleHideLogin = () => {
    hideLogin();
    addTestResult('隐藏登录', 'success', '登录界面已隐藏');
  };

  /**
   * 处理登出
   */
  const handleLogout = () => {
    logout();
    addTestResult('用户登出', 'success', '用户已登出');
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Authing登录系统测试</h1>
        <p className="text-gray-600">测试Authing登录系统的各项功能和配置</p>
      </div>

      {/* 状态概览 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              认证状态
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant={isAuthenticated ? "default" : "secondary"}>
                {isAuthenticated ? "已登录" : "未登录"}
              </Badge>
              {loading && <RefreshCw className="w-4 h-4 animate-spin" />}
            </div>
            <p className="text-sm text-gray-600">
              状态: {status}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Authing状态
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant={isLoggedIn ? "default" : "secondary"}>
                {isLoggedIn ? "已连接" : "未连接"}
              </Badge>
            </div>
            <p className="text-sm text-gray-600">
              Guard: {guard ? "已初始化" : "未初始化"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              配置状态
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant={config ? "default" : "destructive"}>
                {config ? "已配置" : "未配置"}
              </Badge>
            </div>
            <p className="text-sm text-gray-600">
              App ID: {config?.appId ? "已设置" : "未设置"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 操作按钮 */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>操作面板</CardTitle>
          <CardDescription>测试Authing登录系统的各项功能</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <Button onClick={runAllTests} className="flex items-center gap-2">
              <RefreshCw className="w-4 h-4" />
              运行所有测试
            </Button>
            
            <Button 
              onClick={handleShowLogin} 
              variant="outline"
              className="flex items-center gap-2"
            >
              <LogIn className="w-4 h-4" />
              显示登录界面
            </Button>
            
            <Button 
              onClick={handleHideLogin} 
              variant="outline"
              className="flex items-center gap-2"
            >
              <EyeOff className="w-4 h-4" />
              隐藏登录界面
            </Button>
            
            {isAuthenticated && (
              <Button 
                onClick={handleLogout} 
                variant="destructive"
                className="flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                登出
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 用户信息 */}
      {user && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>当前用户信息</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-600">用户ID</p>
                <p className="text-sm">{user.id}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">用户名</p>
                <p className="text-sm">{user.nickname || user.username || '未设置'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">邮箱</p>
                <p className="text-sm">{user.email || '未设置'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">手机号</p>
                <p className="text-sm">{user.phone || '未设置'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 配置信息 */}
      {config && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Authing配置信息</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-600">App ID</p>
                <p className="text-sm font-mono">{config.appId}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Host</p>
                <p className="text-sm font-mono">{config.host}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Redirect URI</p>
                <p className="text-sm font-mono">{config.redirectUri}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Mode</p>
                <p className="text-sm">{config.mode}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 测试结果 */}
      <Card>
        <CardHeader>
          <CardTitle>测试结果</CardTitle>
          <CardDescription>显示各项功能的测试结果</CardDescription>
        </CardHeader>
        <CardContent>
          {testResults.length === 0 ? (
            <p className="text-gray-500 text-center py-8">暂无测试结果，请点击"运行所有测试"开始测试</p>
          ) : (
            <div className="space-y-3">
              {testResults.map((result) => (
                <div key={result.id} className="flex items-center gap-3 p-3 border rounded-lg">
                  {result.status === 'success' && <CheckCircle className="w-5 h-5 text-green-500" />}
                  {result.status === 'error' && <XCircle className="w-5 h-5 text-red-500" />}
                  {result.status === 'warning' && <AlertCircle className="w-5 h-5 text-yellow-500" />}
                  
                  <div className="flex-1">
                    <p className="font-medium">{result.test}</p>
                    <p className="text-sm text-gray-600">{result.message}</p>
                  </div>
                  
                  <span className="text-xs text-gray-400">{result.timestamp}</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 