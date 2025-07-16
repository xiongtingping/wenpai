import React from 'react';
import { useUnifiedAuthContext } from '@/contexts/UnifiedAuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

/**
 * Authing SDK统一登录测试页面
 * 验证所有登录入口都使用Authing SDK模式
 */
export default function AuthingSDKTestPage() {
  const {
    user,
    isAuthenticated,
    loading,
    error,
    status,
    login,
    logout
  } = useUnifiedAuthContext();

  const handleTestLogin = () => {
    console.log('测试Authing SDK登录');
    login();
  };

  const handleTestLogout = async () => {
    console.log('测试Authing SDK登出');
    await logout();
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">
              🔐 Authing SDK 统一登录测试
            </CardTitle>
            <p className="text-center text-muted-foreground">
              验证所有登录入口都使用Authing SDK模式，不再使用自定义表单
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            
            {/* 当前状态 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold mb-2">
                    {isAuthenticated ? '✅' : '❌'}
                  </div>
                  <div className="text-sm font-medium">认证状态</div>
                  <div className="text-xs text-muted-foreground">
                    {isAuthenticated ? '已登录' : '未登录'}
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold mb-2">
                    {loading ? '⏳' : '✅'}
                  </div>
                  <div className="text-sm font-medium">加载状态</div>
                  <div className="text-xs text-muted-foreground">
                    {loading ? '加载中' : '已完成'}
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold mb-2">
                    {status === 'authenticated' ? '✅' : status === 'loading' ? '⏳' : '❌'}
                  </div>
                  <div className="text-sm font-medium">状态详情</div>
                  <div className="text-xs text-muted-foreground">
                    {status}
                  </div>
                </CardContent>
              </Card>
            </div>

            <Separator />

            {/* 用户信息 */}
            {isAuthenticated && user && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">👤 用户信息</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">用户ID:</label>
                      <p className="text-sm text-muted-foreground">{user.id}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium">昵称:</label>
                      <p className="text-sm text-muted-foreground">{user.nickname || '未设置'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium">邮箱:</label>
                      <p className="text-sm text-muted-foreground">{user.email || '未设置'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium">手机:</label>
                      <p className="text-sm text-muted-foreground">{user.phone || '未设置'}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* 错误信息 */}
            {error && (
              <Card className="border-red-200 bg-red-50">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Badge variant="destructive">错误</Badge>
                    <span className="text-sm text-red-700">{error}</span>
                  </div>
                </CardContent>
              </Card>
            )}

            <Separator />

            {/* 测试按钮 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button
                onClick={handleTestLogin}
                disabled={loading || isAuthenticated}
                className="h-12 text-base"
              >
                {loading ? '⏳ 加载中...' : '🔐 测试Authing登录'}
              </Button>
              
              <Button
                onClick={handleTestLogout}
                disabled={loading || !isAuthenticated}
                variant="outline"
                className="h-12 text-base"
              >
                🚪 测试Authing登出
              </Button>
            </div>

            {/* 说明 */}
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-4">
                <h3 className="font-semibold text-blue-900 mb-2">✅ 统一认证架构说明</h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• 所有登录入口都使用Authing SDK，不再使用自定义表单</li>
                  <li>• 登录弹窗会自动关闭，无需手动处理</li>
                  <li>• 支持邮箱、手机号、社交账号等多种登录方式</li>
                  <li>• 统一的用户状态管理和权限控制</li>
                  <li>• 保留了所有功能，包括个人中心等</li>
                </ul>
              </CardContent>
            </Card>

            {/* 测试链接 */}
            <div className="text-center space-y-2">
              <p className="text-sm text-muted-foreground">测试其他登录入口:</p>
              <div className="flex flex-wrap justify-center gap-2">
                <Button variant="outline" size="sm" onClick={() => window.open('/login', '_blank')}>
                  /login
                </Button>
                <Button variant="outline" size="sm" onClick={() => window.open('/login-register', '_blank')}>
                  /login-register
                </Button>
                <Button variant="outline" size="sm" onClick={() => window.open('/register', '_blank')}>
                  /register
                </Button>
                <Button variant="outline" size="sm" onClick={() => window.open('/forgot-password', '_blank')}>
                  /forgot-password
                </Button>
              </div>
            </div>

          </CardContent>
        </Card>
      </div>
    </div>
  );
} 