import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Alert, AlertDescription } from '../ui/alert';
import { X, Mail, Lock, User, Phone } from 'lucide-react';

interface SimpleLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (userData: any) => void;
  redirectTo?: string;
}

/**
 * 简单登录模态框
 * 不依赖Authing Guard，提供基本的登录功能
 */
const SimpleLoginModal: React.FC<SimpleLoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  redirectTo
}) => {
  const [loginMethod, setLoginMethod] = useState<'phone' | 'email'>('phone');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showCodeInput, setShowCodeInput] = useState(false);

  if (!isOpen) return null;

  const handleSendCode = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      // 模拟发送验证码
      await new Promise(resolve => setTimeout(resolve, 1000));
      setShowCodeInput(true);
      console.log('✅ 验证码已发送');
    } catch (error) {
      setError('发送验证码失败，请重试');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      // 模拟登录过程
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // 创建模拟用户数据
      const userData = {
        id: 'demo-user-' + Date.now(),
        username: loginMethod === 'phone' ? phone : email,
        email: loginMethod === 'email' ? email : '',
        phone: loginMethod === 'phone' ? phone : '',
        nickname: '演示用户',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=demo'
      };
      
      console.log('✅ 登录成功:', userData);
      
      // 保存用户数据到localStorage
      localStorage.setItem('authing_user', JSON.stringify(userData));
      
      // 调用成功回调
      onLoginSuccess(userData);
      
      // 关闭弹窗
      onClose();
      
      // 如果有跳转目标，延迟跳转
      if (redirectTo) {
        setTimeout(() => {
          console.log('🚀 跳转到:', redirectTo);
          window.location.href = redirectTo;
        }, 500);
      }
      
    } catch (error) {
      setError('登录失败，请重试');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      // 模拟注册过程
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // 创建模拟用户数据
      const userData = {
        id: 'demo-user-' + Date.now(),
        username: loginMethod === 'phone' ? phone : email,
        email: loginMethod === 'email' ? email : '',
        phone: loginMethod === 'phone' ? phone : '',
        nickname: '新用户',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=new'
      };
      
      console.log('✅ 注册成功:', userData);
      
      // 保存用户数据到localStorage
      localStorage.setItem('authing_user', JSON.stringify(userData));
      
      // 调用成功回调
      onLoginSuccess(userData);
      
      // 关闭弹窗
      onClose();
      
      // 如果有跳转目标，延迟跳转
      if (redirectTo) {
        setTimeout(() => {
          console.log('🚀 跳转到:', redirectTo);
          window.location.href = redirectTo;
        }, 500);
      }
      
    } catch (error) {
      setError('注册失败，请重试');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-md mx-4">
        <CardHeader className="relative">
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-2 top-2"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
          <CardTitle className="text-center">登录文派</CardTitle>
          <CardDescription className="text-center">
            使用您的账号登录以继续使用
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* 登录方式切换 */}
          <div className="flex space-x-2">
            <Button
              variant={loginMethod === 'phone' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setLoginMethod('phone')}
              className="flex-1"
            >
              <Phone className="h-4 w-4 mr-2" />
              手机号
            </Button>
            <Button
              variant={loginMethod === 'email' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setLoginMethod('email')}
              className="flex-1"
            >
              <Mail className="h-4 w-4 mr-2" />
              邮箱
            </Button>
          </div>

          {/* 错误提示 */}
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* 手机号登录 */}
          {loginMethod === 'phone' && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="phone">手机号</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="请输入手机号"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
              
              {!showCodeInput ? (
                <Button
                  onClick={handleSendCode}
                  disabled={!phone || isLoading}
                  className="w-full"
                >
                  {isLoading ? '发送中...' : '发送验证码'}
                </Button>
              ) : (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="code">验证码</Label>
                    <Input
                      id="code"
                      type="text"
                      placeholder="请输入验证码"
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Button
                      onClick={handleLogin}
                      disabled={!code || isLoading}
                      className="w-full"
                    >
                      {isLoading ? '登录中...' : '登录'}
                    </Button>
                    <Button
                      onClick={handleRegister}
                      disabled={!code || isLoading}
                      variant="outline"
                      className="w-full"
                    >
                      {isLoading ? '注册中...' : '注册新账号'}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 邮箱登录 */}
          {loginMethod === 'email' && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="email">邮箱</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="请输入邮箱"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              
              <div>
                <Label htmlFor="password">密码</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="请输入密码"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Button
                  onClick={handleLogin}
                  disabled={!email || !password || isLoading}
                  className="w-full"
                >
                  {isLoading ? '登录中...' : '登录'}
                </Button>
                <Button
                  onClick={handleRegister}
                  disabled={!email || !password || isLoading}
                  variant="outline"
                  className="w-full"
                >
                  {isLoading ? '注册中...' : '注册新账号'}
                </Button>
              </div>
            </div>
          )}

          {/* 演示模式提示 */}
          <div className="text-center text-sm text-gray-500">
            <p>当前为演示模式，登录后将创建临时账号</p>
            {redirectTo && (
              <p className="mt-1">登录成功后将跳转到: {redirectTo}</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SimpleLoginModal; 