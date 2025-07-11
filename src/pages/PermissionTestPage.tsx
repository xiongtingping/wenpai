import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { usePermissions } from '@/hooks/usePermissions';
import AuthGuard from '@/components/auth/AuthGuard';
import PermissionGuard from '@/components/auth/PermissionGuard';

/**
 * 检查是否为开发环境
 */
const isDevelopment = () => {
  return import.meta.env.DEV || process.env.NODE_ENV === 'development';
};

/**
 * 权限测试页面组件
 * @returns React 组件
 */
const PermissionTestPage: React.FC = () => {
  const { user, isAuthenticated, error } = useAuth();
  const { roles, permissions, hasPermission, hasRole, checkPermissions } = usePermissions();
  const [testResults, setTestResults] = useState<string[]>([]);

  /**
   * 添加测试结果
   */
  const addTestResult = (result: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${result}`]);
  };

  /**
   * 测试基本认证
   */
  const testBasicAuth = () => {
    addTestResult(`错误信息: ${error || '无'} | 已认证: ${isAuthenticated}`);
    if (user) {
      addTestResult(`用户信息: ${user.username || user.email || user.id}`);
    }
  };

  /**
   * 测试权限守卫
   */
  const testPermissionGuard = () => {
    addTestResult('测试权限守卫 - 需要 content:read 权限');
  };

  /**
   * 测试角色守卫
   */
  const testRoleGuard = () => {
    addTestResult('测试角色守卫 - 需要 admin 角色');
  };

  /**
   * 测试复杂权限
   */
  const testComplexPermission = () => {
    addTestResult('测试复杂权限 - 需要 content:create 权限');
  };

  /**
   * 测试权限检查
   */
  const testPermissionCheck = () => {
    const result = checkPermissions(
      [{ resource: 'content', action: 'read' }],
      ['admin']
    );
    addTestResult(`权限检查结果: ${JSON.stringify(result)}`);
  };

  /**
   * 清除测试结果
   */
  const clearResults = () => {
    setTestResults([]);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">权限测试页面</h1>
        
        {/* 开发环境标识 */}
        {isDevelopment() && (
          <Card className="mb-6 border-amber-200 bg-amber-50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="premium">DEV</Badge>
                <span className="font-semibold text-amber-800">开发模式</span>
              </div>
              <p className="text-amber-700 text-sm">
                当前处于开发环境，所有权限检查都会返回通过，方便测试所有功能。
                生产环境将使用真实的权限验证。
              </p>
            </CardContent>
          </Card>
        )}

        <p className="text-gray-600">
          此页面用于测试权限系统的各项功能，包括认证、权限检查、角色验证等。
        </p>
      </div>

      {/* 当前状态 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>认证状态</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p><strong>已认证:</strong> {isAuthenticated ? '✅ 是' : '❌ 否'}</p>
              <p><strong>用户:</strong> {user ? (user.username || user.email || user.id) : '无'}</p>
              <p><strong>错误:</strong> {error || '无'}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>权限信息</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p><strong>角色数量:</strong> {roles.length}</p>
              <p><strong>权限数量:</strong> {permissions.length}</p>
              <p><strong>环境:</strong> {isDevelopment() ? '开发环境' : '生产环境'}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 测试按钮 */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>测试功能</CardTitle>
          <CardDescription>
            点击按钮测试各项权限功能
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button onClick={testBasicAuth} variant="outline">
              测试基本认证
            </Button>
            <Button onClick={testPermissionGuard} variant="outline">
              测试权限守卫
            </Button>
            <Button onClick={testRoleGuard} variant="outline">
              测试角色守卫
            </Button>
            <Button onClick={testComplexPermission} variant="outline">
              测试复杂权限
            </Button>
            <Button onClick={testPermissionCheck} variant="outline">
              测试权限检查
            </Button>
            <Button onClick={clearResults} variant="destructive">
              清除结果
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* 基本认证守卫 */}
        <Card>
          <CardHeader>
            <CardTitle>基本认证守卫</CardTitle>
            <CardDescription>
              测试需要登录才能访问的内容
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AuthGuard>
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-green-800 font-medium">✅ 认证成功</p>
                <p className="text-green-600 text-sm mt-1">
                  您已通过认证，可以访问此内容
                </p>
              </div>
            </AuthGuard>
          </CardContent>
        </Card>

        {/* 权限守卫 */}
        <Card>
          <CardHeader>
            <CardTitle>权限守卫</CardTitle>
            <CardDescription>
              测试需要特定权限才能访问的内容
            </CardDescription>
          </CardHeader>
          <CardContent>
            <PermissionGuard
              requiredPermissions={['content:read']}
              noPermissionComponent={
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-800 font-medium">❌ 权限不足</p>
                  <p className="text-red-600 text-sm mt-1">
                    您没有 content:read 权限
                  </p>
                </div>
              }
            >
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-green-800 font-medium">✅ 权限验证通过</p>
                <p className="text-green-600 text-sm mt-1">
                  您有 content:read 权限，可以访问此内容
                </p>
              </div>
            </PermissionGuard>
          </CardContent>
        </Card>

        {/* 角色守卫 */}
        <Card>
          <CardHeader>
            <CardTitle>角色守卫</CardTitle>
            <CardDescription>
              测试需要特定角色才能访问的内容
            </CardDescription>
          </CardHeader>
          <CardContent>
            <PermissionGuard
              requiredRoles={['admin']}
              noPermissionComponent={
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-800 font-medium">❌ 角色不足</p>
                  <p className="text-red-600 text-sm mt-1">
                    您没有 admin 角色
                  </p>
                </div>
              }
            >
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-green-800 font-medium">✅ 角色验证通过</p>
                <p className="text-green-600 text-sm mt-1">
                  您有 admin 角色，可以访问此内容
                </p>
              </div>
            </PermissionGuard>
          </CardContent>
        </Card>

        {/* 复杂权限守卫 */}
        <Card>
          <CardHeader>
            <CardTitle>复杂权限守卫</CardTitle>
            <CardDescription>
              测试需要多个权限才能访问的内容
            </CardDescription>
          </CardHeader>
          <CardContent>
            <PermissionGuard
              requiredPermissions={['content:create']}
              noPermissionComponent={
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-800 font-medium">❌ 权限不足</p>
                  <p className="text-red-600 text-sm mt-1">
                    您没有 content:create 权限
                  </p>
                </div>
              }
            >
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-green-800 font-medium">✅ 权限验证通过</p>
                <p className="text-green-600 text-sm mt-1">
                  您有 content:create 权限，可以访问此内容
                </p>
              </div>
            </PermissionGuard>
          </CardContent>
        </Card>
      </div>

      {/* 测试结果 */}
      <Card>
        <CardHeader>
          <CardTitle>测试结果</CardTitle>
          <CardDescription>
            测试操作的详细结果
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="max-h-64 overflow-y-auto space-y-1">
            {testResults.length === 0 ? (
              <p className="text-gray-500">暂无测试结果</p>
            ) : (
              testResults.map((result, index) => (
                <div key={index} className="text-sm font-mono bg-gray-100 p-2 rounded">
                  {result}
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PermissionTestPage; 