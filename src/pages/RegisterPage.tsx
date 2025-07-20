/**
 * ✅ 注册页面 - 使用 Authing 官方认证系统
 * 
 * 本页面通过 useUnifiedAuth 调用 Authing 官方认证链路
 * 不包含任何本地模拟或备用注册逻辑
 * 
 * 🔒 LOCKED: 已封装稳定，禁止修改核心逻辑
 */

import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUnifiedAuth } from '@/contexts/UnifiedAuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { UserPlus, AlertCircle, Loader2 } from 'lucide-react';

/**
 * 注册页面组件
 */
export default function RegisterPage() {
  const { register, isAuthenticated, loading, error } = useUnifiedAuth();
  const navigate = useNavigate();

  // 注册成功后自动跳转首页
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  // 处理注册
  const handleRegister = () => {
    register();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
              <p className="text-gray-600">正在检查注册状态...</p>
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
            <UserPlus className="h-6 w-6" />
            注册文派
          </CardTitle>
          <CardDescription>
            使用 Authing 官方认证系统进行安全注册
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
          
          {/* 注册按钮 */}
          <Button 
            onClick={handleRegister}
            className="w-full"
            size="lg"
          >
            <UserPlus className="mr-2 h-4 w-4" />
            使用 Authing 注册
          </Button>
          
          {/* 说明信息 */}
          <div className="text-center text-sm text-gray-500">
            <p>点击按钮将打开 Authing 官方注册窗口</p>
            <p className="mt-1">注册成功后将自动跳转到首页</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}