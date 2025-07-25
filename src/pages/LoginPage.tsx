/**
 * ✅ FIXED: 2025-01-05 创建登录页面组件
 * 📌 请勿再修改该逻辑，已封装稳定。如需改动请单独重构新模块。
 * 🔒 LOCKED: AI 禁止对此函数或文件做任何修改
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUnifiedAuth } from '@/contexts/UnifiedAuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, LogIn, UserPlus, ArrowLeft } from 'lucide-react';

/**
 * 登录页面组件
 */
const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, register, loading, error } = useUnifiedAuth();
  const [isRegistering, setIsRegistering] = useState(false);

  const handleLogin = async () => {
    try {
      await login();
    } catch (error) {
      console.error('登录失败:', error);
    }
  };

  const handleRegister = async () => {
    try {
      await register();
    } catch (error) {
      console.error('注册失败:', error);
    }
  };

  const handleGoBack = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center mb-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleGoBack}
              className="absolute left-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              返回
            </Button>
            <CardTitle className="text-2xl font-bold">
              {isRegistering ? '注册账户' : '登录账户'}
            </CardTitle>
          </div>
          <CardDescription>
            {isRegistering 
              ? '创建您的账户以开始使用所有功能'
              : '登录您的账户以继续使用'
            }
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <div className="space-y-4">
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-4">
                {isRegistering 
                  ? '选择注册方式'
                  : '选择登录方式'
                }
              </p>
            </div>
            
            <div className="space-y-3">
              <Button
                onClick={isRegistering ? handleRegister : handleLogin}
                className="w-full"
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <LogIn className="h-4 w-4 mr-2" />
                )}
                {isRegistering ? '注册账户' : '登录账户'}
              </Button>
              
              <Button
                variant="outline"
                onClick={() => setIsRegistering(!isRegistering)}
                className="w-full"
                disabled={loading}
              >
                <UserPlus className="h-4 w-4 mr-2" />
                {isRegistering ? '已有账户？去登录' : '没有账户？去注册'}
              </Button>
            </div>
            
            <div className="text-center">
              <p className="text-xs text-gray-500">
                使用 Authing 安全认证系统
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginPage; 