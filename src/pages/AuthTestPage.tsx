import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { User, LogOut, Shield, CheckCircle, XCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

/**
 * Authing 认证测试页面
 * 用于测试和展示认证功能
 */
const AuthTestPage = () => {
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const navigate = useNavigate();

  /**
   * 处理登出
   */
  const handleLogout = () => {
    logout();
    navigate('/');
  };

  /**
   * 跳转到登录页面
   */
  const handleLogin = () => {
    navigate('/authing-login');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">正在加载认证状态...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Authing 认证测试</h1>
          <p className="text-lg text-gray-600">测试和验证 Authing 身份认证功能</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* 认证状态卡片 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                认证状态
              </CardTitle>
              <CardDescription>当前用户的认证状态</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3 mb-4">
                {isAuthenticated ? (
                  <>
                    <CheckCircle className="w-6 h-6 text-green-500" />
                    <Badge variant="default" className="bg-green-100 text-green-800">
                      已认证
                    </Badge>
                  </>
                ) : (
                  <>
                    <XCircle className="w-6 h-6 text-red-500" />
                    <Badge variant="destructive">未认证</Badge>
                  </>
                )}
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">登录状态:</span>
                  <span className="text-sm font-medium">
                    {isAuthenticated ? '已登录' : '未登录'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">加载状态:</span>
                  <span className="text-sm font-medium">
                    {isLoading ? '加载中' : '已完成'}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 用户信息卡片 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                用户信息
              </CardTitle>
              <CardDescription>当前登录用户的详细信息</CardDescription>
            </CardHeader>
            <CardContent>
              {isAuthenticated && user ? (
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">用户ID:</span>
                    <span className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">
                      {user.id}
                    </span>
                  </div>
                  {user.username && (
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">用户名:</span>
                      <span className="text-sm font-medium">{user.username}</span>
                    </div>
                  )}
                  {user.email && (
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">邮箱:</span>
                      <span className="text-sm font-medium">{user.email}</span>
                    </div>
                  )}
                  {user.nickname && (
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">昵称:</span>
                      <span className="text-sm font-medium">{user.nickname}</span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-4">
                  <User className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500">未登录用户</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* 功能测试卡片 */}
          <Card>
            <CardHeader>
              <CardTitle>功能测试</CardTitle>
              <CardDescription>测试认证相关功能</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {!isAuthenticated ? (
                  <Button onClick={handleLogin} className="w-full">
                    <User className="w-4 h-4 mr-2" />
                    登录测试
                  </Button>
                ) : (
                  <Button onClick={handleLogout} variant="destructive" className="w-full">
                    <LogOut className="w-4 h-4 mr-2" />
                    登出测试
                  </Button>
                )}
                
                <Button 
                  onClick={() => navigate('/adapt')} 
                  variant="outline" 
                  className="w-full"
                >
                  测试受保护路由
                </Button>
                
                <Button 
                  onClick={() => navigate('/profile')} 
                  variant="outline" 
                  className="w-full"
                >
                  访问个人资料
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* 本地存储信息卡片 */}
          <Card>
            <CardHeader>
              <CardTitle>本地存储</CardTitle>
              <CardDescription>检查本地存储中的用户信息</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">存储状态:</span>
                  <span className="text-sm font-medium">
                    {localStorage.getItem('authing_user') ? '有数据' : '无数据'}
                  </span>
                </div>
                
                <Button 
                  onClick={() => {
                    localStorage.removeItem('authing_user');
                    window.location.reload();
                  }}
                  variant="outline" 
                  size="sm"
                  className="w-full"
                >
                  清除本地存储
                </Button>
                
                <Button 
                  onClick={() => {
                    const userData = localStorage.getItem('authing_user');
                    if (userData) {
                      console.log('本地存储的用户数据:', JSON.parse(userData));
                      alert('用户数据已输出到控制台');
                    } else {
                      alert('本地存储中没有用户数据');
                    }
                  }}
                  variant="outline" 
                  size="sm"
                  className="w-full"
                >
                  查看存储数据
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 说明信息 */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>使用说明</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm max-w-none">
              <ol className="list-decimal list-inside space-y-2">
                <li>确保已在 <code>src/config/authing.ts</code> 中配置正确的 Authing 信息</li>
                <li>点击"登录测试"按钮进行登录</li>
                <li>登录成功后可以查看用户信息和测试其他功能</li>
                <li>使用"测试受保护路由"验证路由保护功能</li>
                <li>可以通过"清除本地存储"来模拟登出状态</li>
              </ol>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AuthTestPage; 