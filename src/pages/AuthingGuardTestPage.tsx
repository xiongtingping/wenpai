import React from 'react';
import { useUnifiedAuth } from '@/contexts/UnifiedAuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

/**
 * Authing Guard 测试页面
 * 用于测试登录弹窗功能
 */
export default function AuthingGuardTestPage() {
  const { user, isAuthenticated, loading, error, login, logout } = useUnifiedAuth();

  const handleTestLogin = async () => {
    try {
      console.log('🧪 测试登录按钮被点击');
      await login();
    } catch (error) {
      console.error('🧪 测试登录失败:', error);
    }
  };

  const handleTestLogout = async () => {
    try {
      console.log('🧪 测试登出按钮被点击');
      await logout();
    } catch (error) {
      console.error('🧪 测试登出失败:', error);
    }
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Authing Guard 登录测试</CardTitle>
            <CardDescription>
              测试 Authing Guard 弹窗登录功能是否正常工作
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* 认证状态显示 */}
            <div className="p-4 border rounded-lg">
              <h3 className="font-semibold mb-2">认证状态</h3>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="font-medium">登录状态:</span>{' '}
                  <span className={isAuthenticated ? 'text-green-600' : 'text-red-600'}>
                    {isAuthenticated ? '已登录' : '未登录'}
                  </span>
                </div>
                <div>
                  <span className="font-medium">加载状态:</span>{' '}
                  <span className={loading ? 'text-yellow-600' : 'text-gray-600'}>
                    {loading ? '加载中...' : '空闲'}
                  </span>
                </div>
                {error && (
                  <div>
                    <span className="font-medium">错误信息:</span>{' '}
                    <span className="text-red-600">{error}</span>
                  </div>
                )}
              </div>
            </div>

            {/* 用户信息显示 */}
            {user && (
              <div className="p-4 border rounded-lg">
                <h3 className="font-semibold mb-2">用户信息</h3>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="font-medium">用户ID:</span> {user.id}
                  </div>
                  <div>
                    <span className="font-medium">昵称:</span> {user.nickname || '未设置'}
                  </div>
                  <div>
                    <span className="font-medium">用户名:</span> {user.username || '未设置'}
                  </div>
                  <div>
                    <span className="font-medium">邮箱:</span> {user.email || '未设置'}
                  </div>
                  <div>
                    <span className="font-medium">手机:</span> {user.phone || '未设置'}
                  </div>
                </div>
              </div>
            )}

            {/* 操作按钮 */}
            <div className="flex gap-4">
              {!isAuthenticated ? (
                <Button 
                  onClick={handleTestLogin}
                  disabled={loading}
                  className="flex-1"
                >
                  {loading ? '登录中...' : '测试登录'}
                </Button>
              ) : (
                <Button 
                  onClick={handleTestLogout}
                  variant="outline"
                  disabled={loading}
                  className="flex-1"
                >
                  {loading ? '登出中...' : '测试登出'}
                </Button>
              )}
            </div>

            {/* 调试信息 */}
            <div className="p-4 border rounded-lg bg-muted">
              <h3 className="font-semibold mb-2">调试信息</h3>
              <div className="text-xs space-y-1">
                <div>请打开浏览器控制台查看详细日志</div>
                <div>点击"测试登录"按钮应该弹出 Authing Guard 登录窗口</div>
                <div>如果弹窗没有出现，请检查控制台错误信息</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
