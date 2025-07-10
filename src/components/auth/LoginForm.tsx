import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { Eye, EyeOff, Mail, Phone } from 'lucide-react';

interface LoginFormProps {
  onSuccess?: () => void;
}

export function LoginForm({ onSuccess }: LoginFormProps) {
  const { toast } = useToast();
  const { login } = useAuth();
  
  // 表单状态
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  // 邮箱登录表单
  const [emailForm, setEmailForm] = useState({
    email: '',
    password: ''
  });
  
  // 手机号登录表单
  const [phoneForm, setPhoneForm] = useState({
    phone: '',
    verificationCode: ''
  });
  
  // 验证码相关
  const [isCodeSent, setIsCodeSent] = useState(false);
  const [countdown, setCountdown] = useState(0);

  // 邮箱格式验证
  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // 手机号格式验证
  const isValidPhone = (phone: string) => {
    const phoneRegex = /^1[3-9]\d{9}$/;
    return phoneRegex.test(phone);
  };

  // 发送验证码
  const sendVerificationCode = async () => {
    if (!isValidPhone(phoneForm.phone)) {
      toast({
        title: '手机号格式错误',
        description: '请输入正确的手机号码',
        variant: 'destructive'
      });
      return;
    }

    try {
      setIsLoading(true);
      
      // 模拟发送验证码
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setIsCodeSent(true);
      setCountdown(60);
      
      // 倒计时
      const timer = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
      toast({
        title: '验证码已发送',
        description: '请查看手机短信并输入验证码'
      });
    } catch (error) {
      toast({
        title: '发送失败',
        description: '验证码发送失败，请重试',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // 邮箱登录
  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isValidEmail(emailForm.email)) {
      toast({
        title: '邮箱格式错误',
        description: '请输入正确的邮箱地址',
        variant: 'destructive'
      });
      return;
    }
    
    if (!emailForm.password) {
      toast({
        title: '密码不能为空',
        description: '请输入密码',
        variant: 'destructive'
      });
      return;
    }

    try {
      setIsLoading(true);
      
      // 模拟登录成功，创建用户对象
      const userData = {
        id: 'temp-user-id',
        email: emailForm.email,
        username: emailForm.email.split('@')[0],
        nickname: emailForm.email.split('@')[0],
        plan: 'free',
        isProUser: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      // 登录
      await login(userData);
      
      toast({
        title: '登录成功',
        description: '欢迎回来！'
      });
      
      onSuccess?.();
    } catch (error) {
      toast({
        title: '登录失败',
        description: '邮箱或密码错误',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // 手机号登录
  const handlePhoneLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isValidPhone(phoneForm.phone)) {
      toast({
        title: '手机号格式错误',
        description: '请输入正确的手机号码',
        variant: 'destructive'
      });
      return;
    }
    
    if (!phoneForm.verificationCode) {
      toast({
        title: '验证码不能为空',
        description: '请输入验证码',
        variant: 'destructive'
      });
      return;
    }

    try {
      setIsLoading(true);
      
      // 模拟登录成功，创建用户对象
      const userData = {
        id: 'temp-user-id',
        phone: phoneForm.phone,
        username: phoneForm.phone,
        nickname: phoneForm.phone,
        plan: 'free',
        isProUser: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      // 登录
      await login(userData);
      
      toast({
        title: '登录成功',
        description: '欢迎回来！'
      });
      
      onSuccess?.();
    } catch (error) {
      toast({
        title: '登录失败',
        description: '验证码错误',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-center">登录文派</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="phone" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="phone" className="flex items-center gap-2">
              <Phone className="w-4 h-4" />
              手机号
            </TabsTrigger>
            <TabsTrigger value="email" className="flex items-center gap-2">
              <Mail className="w-4 h-4" />
              邮箱
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="phone">
            <form onSubmit={handlePhoneLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="phone">手机号</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="请输入手机号"
                  value={phoneForm.phone}
                  onChange={(e) => setPhoneForm(prev => ({
                    ...prev,
                    phone: e.target.value
                  }))}
                  disabled={isLoading}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="code">验证码</Label>
                <div className="flex gap-2">
                  <Input
                    id="code"
                    type="text"
                    placeholder="请输入验证码"
                    value={phoneForm.verificationCode}
                    onChange={(e) => setPhoneForm(prev => ({
                      ...prev,
                      verificationCode: e.target.value
                    }))}
                    disabled={isLoading}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={sendVerificationCode}
                    disabled={isLoading || countdown > 0 || !phoneForm.phone}
                    className="whitespace-nowrap"
                  >
                    {countdown > 0 ? `${countdown}s` : '发送验证码'}
                  </Button>
                </div>
              </div>
              
              <Button 
                type="submit" 
                className="w-full" 
                disabled={isLoading || !phoneForm.phone || !phoneForm.verificationCode}
              >
                {isLoading ? '登录中...' : '登录'}
              </Button>
            </form>
          </TabsContent>
          
          <TabsContent value="email">
            <form onSubmit={handleEmailLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">邮箱</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="请输入邮箱"
                  value={emailForm.email}
                  onChange={(e) => setEmailForm(prev => ({
                    ...prev,
                    email: e.target.value
                  }))}
                  disabled={isLoading}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">密码</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="请输入密码"
                    value={emailForm.password}
                    onChange={(e) => setEmailForm(prev => ({
                      ...prev,
                      password: e.target.value
                    }))}
                    disabled={isLoading}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
              
              <Button 
                type="submit" 
                className="w-full" 
                disabled={isLoading || !emailForm.email || !emailForm.password}
              >
                {isLoading ? '登录中...' : '登录'}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
} 