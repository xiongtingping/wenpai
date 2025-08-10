/**
 * ✅ FIXED: 2025-01-05 创建认证测试页面组件
 * 📌 请勿再修改该逻辑，已封装稳定。如需改动请单独重构新模块。
 * 🔓 UNLOCKED: 临时解锁以修复undefined拼接问题
 */

import React, { useState } from 'react';
import { useUnifiedAuth } from '@/contexts/UnifiedAuthContext';
import { getUserDisplayName } from '@/utils/userDisplayUtils';
import { Button } from '@/components/ui/button';

// 用户信息获取函数
const getUserId = (user: any, fallback: string = '未知'): string => {
  return user?.id || user?.userId || user?.sub || fallback;
};

const getUserUsername = (user: any, fallback: string = '未设置'): string => {
  return user?.username || user?.name || fallback;
};

const getUserEmail = (user: any, fallback: string = '未设置'): string => {
  return user?.email || user?.emailAddress || fallback;
};
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  LogIn, 
  LogOut, 
  User, 
  Shield, 
  CheckCircle, 
  XCircle, 
  Loader2,
  RefreshCw,
  Settings,
  Key
} from 'lucide-react';

/**
 * 认证测试页面组件
 */
const AuthTestPage: React.FC = () => {
  const { 
    user, 
    isAuthenticated, 
    loading, 
    error,
    login, 
    logout, 
    register,
    refreshToken,
    hasPermission,
    hasRole,
    guard
  } = useUnifiedAuth();

  const [testResults, setTestResults] = useState<{
    [key: string]: { success: boolean; message: string; timestamp: string }
  }>({});

  const runTest = (testName: string, testFn: () => Promise<boolean>, message: string) => {
    setTestResults(prev => ({
      ...prev,
      [testName]: { 
        success: false, 
        message: '测试中...', 
        timestamp: new Date().toLocaleTimeString() 
      }
    }));

    testFn().then(success => {
      setTestResults(prev => ({
        ...prev,
        [testName]: { 
          success, 
          message: success ? message : `测试失败: ${message}`, 
          timestamp: new Date().toLocaleTimeString() 
        }
      }));
    });
  };

  const testLogin = async () => {
    try {
      await login();
      return true;
    } catch (error) {
      console.error('登录测试失败:', error);
      return false;
    }
  };

  const testLogout = async () => {
    try {
      await logout();
      return true;
    } catch (error) {
      console.error('登出测试失败:', error);
      return false;
    }
  };

  const testRegister = async () => {
    try {
      await register();
      return true;
    } catch (error) {
      console.error('注册测试失败:', error);
      return false;
    }
  };

  const testRefreshToken = async () => {
    try {
      await refreshToken();
      return true;
    } catch (error) {
      console.error('刷新令牌测试失败:', error);
      return false;
    }
  };

  const testPermissions = async () => {
    try {
      const hasAuthPermission = hasPermission('auth:required');
      const hasFeaturePermission = hasPermission('feature:creative-studio');
      return hasAuthPermission || hasFeaturePermission;
    } catch (error) {
      console.error('权限测试失败:', error);
      return false;
    }
  };

  const testRoles = async () => {
    try {
      const hasUserRole = hasRole('user');
      const hasAdminRole = hasRole('admin');
      return hasUserRole || hasAdminRole;
    } catch (error) {
      console.error('角色测试失败:', error);
      return false;
    }
  };

  const runAllTests = () => {
    runTest('登录功能', testLogin, '登录功能正常');
    runTest('注册功能', testRegister, '注册功能正常');
    runTest('登出功能', testLogout, '登出功能正常');
    runTest('刷新令牌', testRefreshToken, '刷新令牌功能正常');
    runTest('权限检查', testPermissions, '权限检查功能正常');
    runTest('角色检查', testRoles, '角色检查功能正常');
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* 页面标题 */}
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-2">Authing 认证系统测试</h1>
          <p className="text-muted-foreground">测试 Authing 认证系统的各项功能</p>
        </div>

        {/* 当前状态 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              当前认证状态
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center justify-between p-3 bg-accent rounded-lg">
                <span className="font-medium">认证状态:</span>
                <Badge variant={isAuthenticated ? "default" : "secondary"}>
                  {isAuthenticated ? (
                    <CheckCircle className="h-4 w-4 mr-1" />
                  ) : (
                    <XCircle className="h-4 w-4 mr-1" />
                  )}
                  {isAuthenticated ? '已认证' : '未认证'}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-accent rounded-lg">
                <span className="font-medium">加载状态:</span>
                <Badge variant={loading ? "default" : "secondary"}>
                  {loading ? (
                    <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                  ) : (
                    <CheckCircle className="h-4 w-4 mr-1" />
                  )}
                  {loading ? '加载中' : '就绪'}
                </Badge>
              </div>
            </div>

            {error && (
              <div className="p-3 bg-accent border border-border rounded-lg">
                <p className="text-destructive text-sm">错误: {error}</p>
              </div>
            )}

            {user && (
              <div className="p-4 bg-accent border border-border rounded-lg">
                <h4 className="font-medium mb-2 flex items-center gap-2 text-foreground">
                  <User className="h-4 w-4" />
                  用户信息
                </h4>
                <div className="text-sm space-y-1 text-foreground">
                  <p><strong>ID:</strong> {getUserId(user, '未知')}</p>
                  <p><strong>用户名:</strong> {getUserUsername(user, '未设置')}</p>
                  <p><strong>邮箱:</strong> {getUserEmail(user, '未设置')}</p>
                  <p><strong>昵称:</strong> {getUserDisplayName(user, '未设置')}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 功能测试 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              功能测试
            </CardTitle>
            <CardDescription>
              测试 Authing 认证系统的各项功能
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <Button 
                onClick={() => runTest('登录功能', testLogin, '登录功能正常')}
                disabled={loading}
                variant="outline"
              >
                <LogIn className="h-4 w-4 mr-2" />
                测试登录
              </Button>
              
              <Button 
                onClick={() => runTest('注册功能', testRegister, '注册功能正常')}
                disabled={loading}
                variant="outline"
              >
                <User className="h-4 w-4 mr-2" />
                测试注册
              </Button>
              
              <Button 
                onClick={() => runTest('登出功能', testLogout, '登出功能正常')}
                disabled={loading}
                variant="outline"
              >
                <LogOut className="h-4 w-4 mr-2" />
                测试登出
              </Button>
              
              <Button 
                onClick={() => runTest('刷新令牌', testRefreshToken, '刷新令牌功能正常')}
                disabled={loading}
                variant="outline"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                测试刷新令牌
              </Button>
              
              <Button 
                onClick={() => runTest('权限检查', testPermissions, '权限检查功能正常')}
                disabled={loading}
                variant="outline"
              >
                <Shield className="h-4 w-4 mr-2" />
                测试权限
              </Button>
              
              <Button 
                onClick={() => runTest('角色检查', testRoles, '角色检查功能正常')}
                disabled={loading}
                variant="outline"
              >
                <Key className="h-4 w-4 mr-2" />
                测试角色
              </Button>
              
              <Button 
                onClick={runAllTests}
                disabled={loading}
                className="bg-primary hover:bg-primary"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                运行所有测试
              </Button>
            </div>

            <Separator />

            {/* 测试结果 */}
            {Object.keys(testResults).length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium">测试结果:</h4>
                <div className="space-y-2">
                  {Object.entries(testResults).map(([testName, result]) => (
                    <div 
                      key={testName}
                      className={`p-3 rounded-lg border ${
                        result.success
                          ? 'bg-accent border-border'
                          : 'bg-accent border-border'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {result.success ? (
                            <CheckCircle className="h-4 w-4 text-primary" />
                          ) : (
                            <XCircle className="h-4 w-4 text-destructive" />
                          )}
                          <span className="font-medium">{testName}</span>
                        </div>
                        <span className="text-xs text-muted-foreground">{result.timestamp}</span>
                      </div>
                      <p className={`text-sm mt-1 ${
                        result.success ? 'text-foreground' : 'text-destructive'
                      }`}>
                        {result.message}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Guard 实例信息 */}
        {guard && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5" />
                Authing Guard 实例
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="p-3 bg-accent rounded-lg border border-border">
                <p className="text-sm text-muted-foreground">
                  Guard 实例已初始化，可以正常使用弹窗登录功能
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
      </div>
    </div>
  );
};

export default AuthTestPage; 