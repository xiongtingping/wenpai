import React from 'react';
import { useUnifiedAuth } from '@/contexts/UnifiedAuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

/**
 * 登录测试页面
 * 用于验证登录功能和跳转逻辑
 */
export default function LoginTestPage() {
  const { user, isAuthenticated, loading, error, login, logout } = useUnifiedAuth();

  const handleTestLogin = () => {
    console.log('🧪 测试登录功能');
    // 设置跳转目标为首页
    localStorage.setItem('login_redirect_to', '/');
    login();
  };

  const handleTestLoginWithRedirect = (path: string) => {
    console.log('🧪 测试登录并跳转到:', path);
    localStorage.setItem('login_redirect_to', path);
    login();
  };

  const handleTestLogout = async () => {
    console.log('🧪 测试登出功能');
    await logout();
  };

  const handleClearRedirect = () => {
    localStorage.removeItem('login_redirect_to');
    console.log('🧹 已清除跳转目标');
  };

  const handleCheckRedirect = () => {
    const redirectTo = localStorage.getItem('login_redirect_to');
    console.log('🔍 当前跳转目标:', redirectTo);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            🧪 登录功能测试页面
            <Badge variant={isAuthenticated ? "default" : "secondary"}>
              {isAuthenticated ? "已登录" : "未登录"}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* 用户状态显示 */}
          <div className="space-y-2">
            <h3 className="font-semibold">用户状态</h3>
            <div className="text-sm space-y-1">
              <p>认证状态: {isAuthenticated ? "✅ 已认证" : "❌ 未认证"}</p>
              <p>加载状态: {loading ? "⏳ 加载中" : "✅ 完成"}</p>
              {error && <p className="text-red-600">错误: {error}</p>}
              {user && (
                <div className="mt-2 p-2 bg-gray-50 rounded">
                  <p><strong>用户ID:</strong> {user.id}</p>
                  <p><strong>用户名:</strong> {user.username || "未设置"}</p>
                  <p><strong>邮箱:</strong> {user.email || "未设置"}</p>
                  <p><strong>昵称:</strong> {user.nickname || "未设置"}</p>
                </div>
              )}
            </div>
          </div>

          {/* 测试按钮 */}
          <div className="space-y-4">
            <h3 className="font-semibold">测试功能</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button 
                onClick={handleTestLogin}
                disabled={loading}
                className="w-full"
              >
                {loading ? "⏳ 登录中..." : "🔐 测试登录"}
              </Button>
              
              <Button 
                onClick={handleTestLogout}
                disabled={!isAuthenticated || loading}
                variant="outline"
                className="w-full"
              >
                🚪 测试登出
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              <Button 
                onClick={() => handleTestLoginWithRedirect('/adapt')}
                disabled={loading}
                variant="secondary"
                size="sm"
                className="w-full"
              >
                登录后跳转 /adapt
              </Button>
              
              <Button 
                onClick={() => handleTestLoginWithRedirect('/features')}
                disabled={loading}
                variant="secondary"
                size="sm"
                className="w-full"
              >
                登录后跳转 /features
              </Button>
              
              <Button 
                onClick={() => handleTestLoginWithRedirect('/pricing')}
                disabled={loading}
                variant="secondary"
                size="sm"
                className="w-full"
              >
                登录后跳转 /pricing
              </Button>
            </div>
          </div>

          {/* 调试工具 */}
          <div className="space-y-4">
            <h3 className="font-semibold">调试工具</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <Button 
                onClick={handleCheckRedirect}
                variant="outline"
                size="sm"
                className="w-full"
              >
                🔍 检查跳转目标
              </Button>
              
              <Button 
                onClick={handleClearRedirect}
                variant="outline"
                size="sm"
                className="w-full"
              >
                🧹 清除跳转目标
              </Button>
            </div>
          </div>

          {/* 说明 */}
          <div className="text-sm text-gray-600 space-y-2">
            <h3 className="font-semibold">使用说明</h3>
            <ul className="list-disc list-inside space-y-1">
              <li>点击"测试登录"按钮会弹出Authing登录弹窗</li>
              <li>登录成功后会自动跳转到设置的页面</li>
              <li>使用"检查跳转目标"可以查看当前设置的跳转路径</li>
              <li>使用"清除跳转目标"可以清除已设置的跳转路径</li>
              <li>登录成功后会自动跳转到首页或指定的页面</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 