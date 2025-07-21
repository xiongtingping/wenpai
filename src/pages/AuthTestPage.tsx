/**
 * Authing 测试页面
 * 用于测试 Authing SDK 的基本功能
 */

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useUnifiedAuth } from '@/contexts/UnifiedAuthContext';
import AuthingClient from '@/services/authingClient';
import { useNavigate } from 'react-router-dom';
import { getAuthingConfig } from '@/config/authing';

/**
 * ✅ FIXED: 2024-07-21 Authing测试已切换为新App ID和认证地址
 * App ID: 687e0aafee2b84f86685b644
 * Host: ai-wenpai.authing.cn/687e0aafee2b84f86685b644
 * 📌 请勿改动，后续如需更换请单独审批
 */
const AuthTestPage: React.FC = () => {
  const { user, isAuthenticated, loading, error, login, logout, checkAuth } = useUnifiedAuth();
  const [authingStatus, setAuthingStatus] = useState<string>('未初始化');
  const [testResults, setTestResults] = useState<any>({});
  const navigate = useNavigate(); // 正确获取 navigate

  const authingClient = AuthingClient.getInstance();

  /**
   * 测试 Authing 连接
   */
  const testAuthingConnection = async () => {
    try {
      setAuthingStatus('测试中...');
      
      // 测试基本连接
      const authing = authingClient.getAuthing();
      console.log('✅ Authing 实例创建成功:', authing);
      
      setTestResults(prev => ({
        ...prev,
        connection: '✅ 连接成功'
      }));
      
      setAuthingStatus('连接正常');
    } catch (error) {
      console.error('❌ Authing 连接失败:', error);
      setAuthingStatus('连接失败');
      setTestResults(prev => ({
        ...prev,
        connection: `❌ 连接失败: ${error}`
      }));
    }
  };

  /**
   * 测试简单登录
   */
  const testSimpleLogin = async () => {
    try {
      setTestResults(prev => ({
        ...prev,
        login: '🔄 跳转中...'
      }));
      // 用配置函数获取 redirectUri，避免 TS 报错
      const { redirectUri } = getAuthingConfig();
      const loginUrl = `https://ai-wenpai.authing.cn/687e0aafee2b84f86685b644/oidc/auth?` + 
        `client_id=687e0aafee2b84f86685b644&` +
        `redirect_uri=${encodeURIComponent(redirectUri)}&` +
        `response_type=code&` +
        `scope=openid profile email phone&` +
        `state=${Date.now()}&` +
        `nonce=${Date.now()}`;
      console.log('🔗 登录 URL:', loginUrl);
      window.location.href = loginUrl;
    } catch (error) {
      console.error('❌ 登录失败:', error);
      setTestResults(prev => ({
        ...prev,
        login: `❌ 登录失败: ${error}`
      }));
    }
  };

  /**
   * 测试 SDK 登录
   */
  const testSDKLogin = async () => {
    try {
      setTestResults(prev => ({
        ...prev,
        sdkLogin: '🔄 启动中...'
      }));
      
      // 使用 SDK 登录
      await login();
      
      setTestResults(prev => ({
        ...prev,
        sdkLogin: '✅ SDK 登录启动成功'
      }));
    } catch (error) {
      console.error('❌ SDK 登录失败:', error);
      setTestResults(prev => ({
        ...prev,
        sdkLogin: `❌ SDK 登录失败: ${error}`
      }));
    }
  };

  /**
   * 检查登录状态
   */
  const testLoginStatus = async () => {
    try {
      setTestResults(prev => ({
        ...prev,
        status: '🔄 检查中...'
      }));
      
      const status = await authingClient.checkLoginStatus();
      console.log('📊 登录状态:', status);
      
      setTestResults(prev => ({
        ...prev,
        status: status ? '✅ 已登录' : '❌ 未登录'
      }));
    } catch (error) {
      console.error('❌ 检查登录状态失败:', error);
      setTestResults(prev => ({
        ...prev,
        status: `❌ 检查失败: ${error}`
      }));
    }
  };

  /**
   * 获取用户信息
   */
  const testGetUserInfo = async () => {
    try {
      setTestResults(prev => ({
        ...prev,
        userInfo: '🔄 获取中...'
      }));
      
      const userInfo = await authingClient.getCurrentUser();
      console.log('👤 用户信息:', userInfo);
      
      setTestResults(prev => ({
        ...prev,
        userInfo: userInfo ? '✅ 获取成功' : '❌ 无用户信息'
      }));
    } catch (error) {
      console.error('❌ 获取用户信息失败:', error);
      setTestResults(prev => ({
        ...prev,
        userInfo: `❌ 获取失败: ${error}`
      }));
    }
  };

  /**
   * 测试登出
   */
  const testLogout = async () => {
    try {
      setTestResults(prev => ({
        ...prev,
        logout: '🔄 登出中...'
      }));
      
      await logout();
      
      setTestResults(prev => ({
        ...prev,
        logout: '✅ 登出成功'
      }));
    } catch (error) {
      console.error('❌ 登出失败:', error);
      setTestResults(prev => ({
        ...prev,
        logout: `❌ 登出失败: ${error}`
      }));
    }
  };

  /**
   * 运行所有测试
   */
  const runAllTests = async () => {
    setTestResults({});
    
    // 添加延迟避免重复调用
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    await testAuthingConnection();
    
    // 添加延迟避免重复调用
    await new Promise(resolve => setTimeout(resolve, 500));
    
    await testLoginStatus();
    
    // 添加延迟避免重复调用
    await new Promise(resolve => setTimeout(resolve, 500));
    
    await testGetUserInfo();
  };

  /**
   * 测试备用登录方案
   */
  const testBackupLogin = async () => {
    try {
      setTestResults(prev => ({
        ...prev,
        backupLogin: '🔄 启动备用登录...'
      }));
      
      // 使用最简单的登录 URL，不依赖 SDK
      const loginUrl = `https://ai-wenpai.authing.cn/oidc/auth?` +
        `client_id=687e0aafee2b84f86685b644&` +
        `redirect_uri=${encodeURIComponent('http://localhost:5174/callback')}&` +
        `response_type=code&` +
        `scope=openid&` +
        `state=${Date.now()}`;
      
      console.log('🔗 备用登录 URL:', loginUrl);
      
      // 在新窗口打开登录页面
      window.open(loginUrl, '_blank', 'width=500,height=600');
      
      setTestResults(prev => ({
        ...prev,
        backupLogin: '✅ 备用登录已启动'
      }));
    } catch (error) {
      console.error('❌ 备用登录失败:', error);
      setTestResults(prev => ({
        ...prev,
        backupLogin: `❌ 备用登录失败: ${error}`
      }));
    }
  };

  /**
   * 自动化注册/登录链路测试
   */
  const runFullAuthFlowTest = async (authingClient, login, logout, checkAuth, setTestResults, navigate) => {
    setTestResults(prev => ({ ...prev, fullFlow: '🔄 测试中...' }));
    try {
      // 1. 登出，确保无会话
      await logout();
      // 2. 发起登录
      await login('/auth-test?autotest=1');
      // 3. 登录后回调页面会自动跳转回来
      // 4. 检查用户信息
      setTimeout(async () => {
        await checkAuth();
        const user = await authingClient.getCurrentUser();
        if (user && user.id) {
          setTestResults(prev => ({ ...prev, fullFlow: `✅ 注册/登录链路通过，用户ID: ${user.id}` }));
          // 5. 跳转权限页面测试
          navigate('/permission-test');
        } else {
          setTestResults(prev => ({ ...prev, fullFlow: '❌ 登录后未获取到用户信息' }));
        }
      }, 3000);
    } catch (error) {
      setTestResults(prev => ({ ...prev, fullFlow: `❌ 测试失败: ${error}` }));
    }
  };

  useEffect(() => {
    runAllTests();
  }, []);

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Authing SDK 测试页面</h1>
        <p className="text-muted-foreground">
          测试 Authing SDK 的各项功能，确保认证系统正常工作
        </p>
      </div>

      {/* 状态概览 */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>系统状态</CardTitle>
          <CardDescription>当前认证系统的运行状态</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-sm text-muted-foreground">Authing 状态</div>
              <Badge variant={authingStatus.includes('正常') ? 'default' : 'destructive'}>
                {authingStatus}
              </Badge>
            </div>
            <div className="text-center">
              <div className="text-sm text-muted-foreground">登录状态</div>
              <Badge variant={isAuthenticated ? 'default' : 'secondary'}>
                {isAuthenticated ? '已登录' : '未登录'}
              </Badge>
            </div>
            <div className="text-center">
              <div className="text-sm text-muted-foreground">加载状态</div>
              <Badge variant={loading ? 'default' : 'secondary'}>
                {loading ? '加载中' : '就绪'}
              </Badge>
            </div>
            <div className="text-center">
              <div className="text-sm text-muted-foreground">错误状态</div>
              <Badge variant={error ? 'destructive' : 'secondary'}>
                {error ? '有错误' : '正常'}
              </Badge>
            </div>
          </div>
          
          {error && (
            <div className="mt-4 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
              <div className="text-sm font-medium text-destructive">错误信息:</div>
              <div className="text-sm text-destructive/80">{error}</div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 用户信息 */}
      {user && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>当前用户信息</CardTitle>
            <CardDescription>已登录用户的详细信息</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div><strong>ID:</strong> {user.id}</div>
              <div><strong>用户名:</strong> {user.username}</div>
              <div><strong>昵称:</strong> {user.nickname}</div>
              <div><strong>邮箱:</strong> {user.email}</div>
              <div><strong>手机:</strong> {user.phone}</div>
              <div><strong>登录时间:</strong> {new Date(user.loginTime).toLocaleString()}</div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 测试功能 */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>功能测试</CardTitle>
          <CardDescription>测试 Authing SDK 的各项功能</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button onClick={testAuthingConnection} variant="outline">
              测试连接
            </Button>
            <Button onClick={testLoginStatus} variant="outline">
              检查登录状态
            </Button>
            <Button onClick={testGetUserInfo} variant="outline">
              获取用户信息
            </Button>
            <Button onClick={runAllTests} variant="outline">
              运行所有测试
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 登录测试 */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>登录测试</CardTitle>
          <CardDescription>测试不同的登录方式</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button onClick={testSimpleLogin} className="w-full">
              简单登录 (直接跳转)
            </Button>
            <Button onClick={testSDKLogin} className="w-full">
              SDK 登录
            </Button>
            <Button onClick={testBackupLogin} className="w-full" variant="outline">
              备用登录 (新窗口)
            </Button>
          </div>
          <div className="mt-4 text-sm text-muted-foreground">
            <p>💡 <strong>简单登录</strong>: 直接跳转到 Authing 登录页面</p>
            <p>💡 <strong>SDK 登录</strong>: 使用 @authing/web SDK 登录</p>
          </div>
        </CardContent>
      </Card>

      {/* 登出测试 */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>登出测试</CardTitle>
          <CardDescription>测试登出功能</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={testLogout} variant="destructive" className="w-full">
            登出
          </Button>
        </CardContent>
      </Card>

      {/* 自动化注册/登录链路测试 */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>自动化注册/登录链路测试</CardTitle>
          <CardDescription>一键验证注册、登录、回调、用户信息、权限页面跳转等全流程</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={() => runFullAuthFlowTest(authingClient, login, logout, checkAuth, setTestResults, navigate)}>
            一键测试注册/登录链路
          </Button>
          <div className="mt-4 text-sm">
            {testResults.fullFlow}
          </div>
        </CardContent>
      </Card>

      {/* 测试结果 */}
      <Card>
        <CardHeader>
          <CardTitle>测试结果</CardTitle>
          <CardDescription>各项测试的执行结果</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {Object.entries(testResults).map(([key, value]) => {
              const valueStr = typeof value === 'string' ? value : JSON.stringify(value);
              return (
                <div key={key} className="flex justify-between items-center p-2 bg-muted/50 rounded">
                  <span className="font-medium">{key}:</span>
                  <span className={valueStr.includes('✅') ? 'text-green-600' : valueStr.includes('❌') ? 'text-red-600' : 'text-blue-600'}>
                    {valueStr}
                  </span>
                </div>
              );
            })}
            {Object.keys(testResults).length === 0 && (
              <div className="text-center text-muted-foreground py-4">
                暂无测试结果
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AuthTestPage; 