import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useUnifiedAuth } from '@/contexts/UnifiedAuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

/**
 * 按钮测试页面
 * 用于验证按钮点击和跳转功能
 */
const ButtonTestPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, login, user } = useUnifiedAuth();

  const handleDirectNavigation = (path: string) => {
    console.log('直接导航到:', path);
    navigate(path);
  };

  const handleAuthNavigation = (path: string) => {
    console.log('认证导航到:', path);
    console.log('当前认证状态:', isAuthenticated);
    
    if (isAuthenticated) {
      console.log('用户已登录，直接跳转');
      navigate(path);
    } else {
      console.log('用户未登录，显示登录弹窗');
      login(path);
    }
  };

  const handleLoginTest = () => {
    console.log('测试登录功能');
    login('/button-test');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-2xl">🔧 按钮功能测试页面</CardTitle>
              <CardDescription>
                测试各种按钮点击和页面跳转功能
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h3 className="font-semibold text-blue-800 mb-2">当前状态</h3>
                  <p className="text-sm text-blue-600">
                    认证状态: {isAuthenticated ? '✅ 已登录' : '❌ 未登录'}
                  </p>
                  {user && (
                    <p className="text-sm text-blue-600">
                      用户: {user.nickname || user.username || user.email || user.id}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 直接导航测试 */}
            <Card>
              <CardHeader>
                <CardTitle>🚀 直接导航测试</CardTitle>
                <CardDescription>
                  无需认证的页面跳转
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  onClick={() => handleDirectNavigation('/')}
                  className="w-full"
                  variant="outline"
                >
                  返回首页
                </Button>
                <Button 
                  onClick={() => handleDirectNavigation('/api-config-test')}
                  className="w-full"
                  variant="outline"
                >
                  配置测试页面
                </Button>
                <Button 
                  onClick={() => handleDirectNavigation('/auth-test')}
                  className="w-full"
                  variant="outline"
                >
                  认证测试页面
                </Button>
              </CardContent>
            </Card>

            {/* 认证导航测试 */}
            <Card>
              <CardHeader>
                <CardTitle>🔐 认证导航测试</CardTitle>
                <CardDescription>
                  需要认证的页面跳转
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  onClick={() => handleAuthNavigation('/adapt')}
                  className="w-full"
                  variant="default"
                >
                  内容适配页面
                </Button>
                <Button 
                  onClick={() => handleAuthNavigation('/brand-library')}
                  className="w-full"
                  variant="default"
                >
                  品牌库页面
                </Button>
                <Button 
                  onClick={() => handleAuthNavigation('/profile')}
                  className="w-full"
                  variant="default"
                >
                  个人中心
                </Button>
              </CardContent>
            </Card>

            {/* 登录测试 */}
            <Card>
              <CardHeader>
                <CardTitle>🔑 登录功能测试</CardTitle>
                <CardDescription>
                  测试Authing登录弹窗
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  onClick={handleLoginTest}
                  className="w-full"
                  variant="secondary"
                >
                  测试登录弹窗
                </Button>
                <Button 
                  onClick={() => login('/adapt')}
                  className="w-full"
                  variant="secondary"
                >
                  登录后跳转适配页面
                </Button>
              </CardContent>
            </Card>

            {/* 调试信息 */}
            <Card>
              <CardHeader>
                <CardTitle>🐛 调试信息</CardTitle>
                <CardDescription>
                  查看控制台日志
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  onClick={() => {
                    console.log('=== 调试信息 ===');
                    console.log('认证状态:', isAuthenticated);
                    console.log('用户信息:', user);
                    console.log('当前URL:', window.location.href);
                    console.log('环境变量:', {
                      AUTHING_APP_ID: import.meta.env.VITE_AUTHING_APP_ID,
                      AUTHING_HOST: import.meta.env.VITE_AUTHING_HOST,
                    });
                  }}
                  className="w-full"
                  variant="outline"
                >
                  输出调试信息
                </Button>
                <Button 
                  onClick={() => {
                    localStorage.clear();
                    window.location.reload();
                  }}
                  className="w-full"
                  variant="destructive"
                >
                  清除缓存并刷新
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* 使用说明 */}
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>📋 使用说明</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm text-gray-600">
                <p>1. <strong>直接导航测试</strong>: 测试无需认证的页面跳转功能</p>
                <p>2. <strong>认证导航测试</strong>: 测试需要认证的页面跳转，未登录时会弹出登录窗口</p>
                <p>3. <strong>登录功能测试</strong>: 专门测试Authing登录弹窗功能</p>
                <p>4. <strong>调试信息</strong>: 查看当前状态和配置信息</p>
                <p className="mt-4 text-blue-600">
                  💡 如果按钮没有反应，请打开浏览器开发者工具查看控制台错误信息
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ButtonTestPage; 