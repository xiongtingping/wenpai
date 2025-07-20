/**
 * ✅ 登录页面 - 使用 Authing 官方认证系统
 * 
 * 本页面通过 useUnifiedAuth 调用 Authing 官方认证链路
 * 不包含任何本地模拟或备用登录逻辑
 * 
 * 🔒 LOCKED: 已封装稳定，禁止修改核心逻辑
 */

import { useUnifiedAuth } from '@/contexts/UnifiedAuthContext';
import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { LogIn, AlertCircle, Loader2 } from 'lucide-react';

/**
 * 登录页面组件
 */
export default function LoginPage() {
  const { isAuthenticated, login, loading, error } = useUnifiedAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // 获取重定向地址
  const redirectTo = searchParams.get('redirect') || '/';

  // 登录成功后自动跳转
  useEffect(() => {
    if (isAuthenticated) {
      navigate(redirectTo);
    }
  }, [isAuthenticated, navigate, redirectTo]);

  // 处理登录
  const handleLogin = () => {
    login(redirectTo);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
              <p className="text-gray-600">正在检查登录状态...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2">
            <LogIn className="h-6 w-6" />
            登录文派
          </CardTitle>
          <CardDescription>
            使用 Authing 官方认证系统进行安全登录
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* 错误提示 */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          {/* 登录按钮 */}
          <Button 
            onClick={handleLogin}
            className="w-full"
            size="lg"
          >
            <LogIn className="mr-2 h-4 w-4" />
            使用 Authing 登录
          </Button>
          
          {/* 说明信息 */}
          <div className="text-center text-sm text-gray-500">
            <p>点击按钮将打开 Authing 官方登录窗口</p>
            {redirectTo !== '/' && (
              <p className="mt-1">登录成功后将跳转到: {redirectTo}</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 