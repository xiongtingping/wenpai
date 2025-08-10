import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useUnifiedAuth } from '@/contexts/UnifiedAuthContext';

/**
 * 路由测试页面
 * 用于测试所有路由是否正常工作
 */
const RouteTestPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user, login } = useUnifiedAuth();

  // 公开路由
  const publicRoutes = [
    { path: '/', name: '首页' },
    { path: '/about', name: '关于我们' },
    { path: '/login', name: '登录页面' },
    { path: '/terms', name: '服务条款' },
    { path: '/privacy', name: '隐私政策' },
    { path: '/emoji-generator', name: 'Emoji生成器' },
  ];

  // 需要认证的路由
  const authRoutes = [
    { path: '/adapt', name: 'AI内容适配器' },
    { path: '/new-adapt', name: 'AI内容适配器(新版)' },
    { path: '/creative-studio', name: '创意魔方' },
    { path: '/hot-topics', name: '全网雷达' },
    { path: '/library', name: '我的资料库' },
    { path: '/brand-library', name: '品牌语料库' },
    { path: '/profile', name: '个人资料' },
    { path: '/settings', name: '设置' },
    { path: '/history', name: '历史记录' },
  ];

  // 支付相关路由
  const paymentRoutes = [
    { path: '/payment', name: '支付页面' },
    { path: '/payment-test', name: '支付测试' },
    { path: '/payment-status', name: '支付状态' },
  ];

  const handleRouteTest = (path: string, requiresAuth: boolean = false) => {
    console.log(`🔍 测试路由: ${path}`);
    console.log(`认证状态: ${isAuthenticated}`);
    console.log(`需要认证: ${requiresAuth}`);

    try {
      if (requiresAuth && !isAuthenticated) {
        console.log('需要认证但用户未登录，调用登录');
        if (typeof login === 'function') {
          login(path);
        } else {
          console.error('❌ login函数不可用');
          navigate('/login');
        }
      } else {
        console.log(`✅ 跳转到: ${path}`);
        navigate(path);
      }
    } catch (error) {
      console.error(`❌ 路由测试失败: ${path}`, error);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4">路由测试页面</h1>
          <div className="bg-accent border border-border rounded-lg p-4">
            <h2 className="font-semibold text-blue-800 mb-2">当前状态</h2>
            <p className="text-primary">
              认证状态: {isAuthenticated ? '✅ 已登录' : '❌ 未登录'}
            </p>
            {user && (
              <p className="text-primary">
                用户: {user.nickname || user.username || user.email}
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* 公开路由 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-foreground">公开路由</CardTitle>
              <CardDescription>无需认证即可访问</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {publicRoutes.map((route) => (
                <Button
                  key={route.path}
                  variant="outline"
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => handleRouteTest(route.path, false)}
                >
                  {route.name}
                </Button>
              ))}
            </CardContent>
          </Card>

          {/* 需要认证的路由 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-primary">认证路由</CardTitle>
              <CardDescription>需要登录后访问</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {authRoutes.map((route) => (
                <Button
                  key={route.path}
                  variant="outline"
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => handleRouteTest(route.path, true)}
                >
                  {route.name}
                </Button>
              ))}
            </CardContent>
          </Card>

          {/* 支付相关路由 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-primary">支付路由</CardTitle>
              <CardDescription>支付相关页面</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {paymentRoutes.map((route) => (
                <Button
                  key={route.path}
                  variant="outline"
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => handleRouteTest(route.path, false)}
                >
                  {route.name}
                </Button>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* 功能测试 */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-foreground">功能测试</CardTitle>
            <CardDescription>测试认证和导航功能</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {!isAuthenticated && (
                <Button
                  onClick={() => {
                    console.log('🔐 测试登录功能');
                    if (typeof login === 'function') {
                      login();
                    } else {
                      console.error('❌ login函数不可用');
                      navigate('/login');
                    }
                  }}
                  className="bg-primary hover:bg-blue-700"
                >
                  测试登录
                </Button>
              )}
              
              <Button
                variant="outline"
                onClick={() => {
                  console.log('🏠 返回首页');
                  navigate('/');
                }}
              >
                返回首页
              </Button>
              
              <Button
                variant="outline"
                onClick={() => {
                  console.log('🔄 刷新页面');
                  window.location.reload();
                }}
              >
                刷新页面
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RouteTestPage;
