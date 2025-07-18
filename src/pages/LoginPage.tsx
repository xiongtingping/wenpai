/**
 * 登录页面 - 使用统一认证系统
 */

import { useUnifiedAuth } from '@/contexts/UnifiedAuthContext';
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { LogIn, AlertCircle } from 'lucide-react';

/**
 * 登录页面组件
 */
export default function LoginPage() {
  const { isAuthenticated, login, loading } = useUnifiedAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [showFallback, setShowFallback] = useState(false);
  const [isFallbackLoading, setIsFallbackLoading] = useState(false);

  // 获取重定向地址
  const redirectTo = searchParams.get('redirect') || '/';

  // 登录成功后自动跳转
  useEffect(() => {
    if (isAuthenticated) {
      navigate(redirectTo);
    }
  }, [isAuthenticated, navigate, redirectTo]);

  // 备用登录处理
  const handleFallbackLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsFallbackLoading(true);
    
    try {
      // 模拟登录过程
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // 创建模拟用户数据
      const mockUser = {
        id: `user_${Date.now()}`,
        username: 'demo_user',
        email: 'demo@example.com',
        nickname: '演示用户',
        avatar: ''
      };
      
      // 保存到 localStorage
      localStorage.setItem('authing_user', JSON.stringify(mockUser));
      
      // 跳转到目标页面
      navigate(redirectTo);
    } catch (error) {
      console.error('备用登录失败:', error);
    } finally {
      setIsFallbackLoading(false);
    }
  };

  // 如果正在加载，显示加载状态
  if (loading && !showFallback) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">正在加载登录界面...</p>
        </div>
      </div>
    );
  }

  // 备用登录界面
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2">
            <LogIn className="h-6 w-6" />
            登录文派
          </CardTitle>
          <CardDescription>
            由于认证服务暂时不可用，请使用演示模式登录
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              当前使用演示模式，登录后将获得完整的应用体验
            </AlertDescription>
          </Alert>
          
          <form onSubmit={handleFallbackLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">用户名</Label>
              <Input 
                id="username" 
                type="text" 
                placeholder="demo_user" 
                defaultValue="demo_user"
                disabled
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">密码</Label>
              <Input 
                id="password" 
                type="password" 
                placeholder="任意密码" 
                defaultValue="demo123"
                disabled
              />
            </div>
            
            <Button 
              type="submit" 
              className="w-full" 
              disabled={isFallbackLoading}
            >
              {isFallbackLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  登录中...
                </>
              ) : (
                '演示登录'
              )}
            </Button>
          </form>
          
          <div className="mt-4 text-center text-sm text-gray-500">
            <p>登录后将跳转到: {redirectTo}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 