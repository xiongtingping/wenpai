/**
 * 🔧 SYSTEM REBUILD: 基于@authing/web的简洁登录组件
 * 📌 替代复杂的Guard弹窗，使用简单可靠的登录界面
 * 🎯 解决undefined显示问题，提供清晰的用户体验
 * 
 * 🔒 [AUTHING_WEB_LOGIN_COMPONENT_v2025.08.14]
 */

import React, { useState } from 'react';
import { useAuthingWeb } from '@/contexts/AuthingWebContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Mail, Lock, Phone, User } from 'lucide-react';

interface AuthingWebLoginProps {
  onClose?: () => void;
  redirectTo?: string;
}

export const AuthingWebLogin: React.FC<AuthingWebLoginProps> = ({ onClose, redirectTo }) => {
  const { 
    login, 
    loginWithPassword, 
    loginWithEmailCode, 
    loginWithPhoneCode,
    sendVerificationCode,
    registerUser,
    loading, 
    error 
  } = useAuthingWeb();

  const [activeTab, setActiveTab] = useState('password');
  const [formData, setFormData] = useState({
    account: '',
    password: '',
    email: '',
    phone: '',
    code: '',
    nickname: '',
    confirmPassword: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [codeSent, setCodeSent] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.account || !formData.password) return;

    setIsSubmitting(true);
    try {
      await loginWithPassword(formData.account, formData.password);
      onClose?.();
    } catch (error) {
      console.error('密码登录失败:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEmailCodeLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email || !formData.code) return;

    setIsSubmitting(true);
    try {
      await loginWithEmailCode(formData.email, formData.code);
      onClose?.();
    } catch (error) {
      console.error('邮箱验证码登录失败:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePhoneCodeLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.phone || !formData.code) return;

    setIsSubmitting(true);
    try {
      await loginWithPhoneCode(formData.phone, formData.code);
      onClose?.();
    } catch (error) {
      console.error('手机验证码登录失败:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email || !formData.password || !formData.nickname) return;
    if (formData.password !== formData.confirmPassword) {
      alert('密码确认不匹配');
      return;
    }

    setIsSubmitting(true);
    try {
      await registerUser({
        email: formData.email,
        password: formData.password,
        nickname: formData.nickname,
        username: formData.nickname
      });
      onClose?.();
    } catch (error) {
      console.error('注册失败:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSendCode = async (type: 'email' | 'phone') => {
    const target = type === 'email' ? formData.email : formData.phone;
    if (!target) return;

    try {
      await sendVerificationCode(target, type);
      setCodeSent(true);
      setCountdown(60);
      
      const timer = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            setCodeSent(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (error) {
      console.error('发送验证码失败:', error);
    }
  };

  const handleRedirectLogin = async () => {
    try {
      // 保存跳转目标
      if (redirectTo) {
        localStorage.setItem('login_redirect_to', redirectTo);
      }
      await login();
    } catch (error) {
      console.error('重定向登录失败:', error);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold">文派登录</CardTitle>
        <CardDescription>
          选择您喜欢的登录方式
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        {error && (
          <Alert className="mb-4 border-red-200 bg-red-50">
            <AlertDescription className="text-red-700">
              {error}
            </AlertDescription>
          </Alert>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="password">密码</TabsTrigger>
            <TabsTrigger value="email">邮箱</TabsTrigger>
            <TabsTrigger value="phone">手机</TabsTrigger>
            <TabsTrigger value="register">注册</TabsTrigger>
          </TabsList>

          <TabsContent value="password" className="space-y-4">
            <form onSubmit={handlePasswordLogin} className="space-y-4">
              <div className="space-y-2">
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="邮箱或用户名"
                    value={formData.account}
                    onChange={(e) => handleInputChange('account', e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    type="password"
                    placeholder="密码"
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full" 
                disabled={isSubmitting || !formData.account || !formData.password}
              >
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                登录
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="email" className="space-y-4">
            <form onSubmit={handleEmailCodeLogin} className="space-y-4">
              <div className="space-y-2">
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    type="email"
                    placeholder="邮箱地址"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="flex space-x-2">
                <Input
                  type="text"
                  placeholder="验证码"
                  value={formData.code}
                  onChange={(e) => handleInputChange('code', e.target.value)}
                  required
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleSendCode('email')}
                  disabled={!formData.email || codeSent}
                  className="whitespace-nowrap"
                >
                  {codeSent ? `${countdown}s` : '发送验证码'}
                </Button>
              </div>

              <Button 
                type="submit" 
                className="w-full" 
                disabled={isSubmitting || !formData.email || !formData.code}
              >
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                登录
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="phone" className="space-y-4">
            <form onSubmit={handlePhoneCodeLogin} className="space-y-4">
              <div className="space-y-2">
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    type="tel"
                    placeholder="手机号码"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="flex space-x-2">
                <Input
                  type="text"
                  placeholder="验证码"
                  value={formData.code}
                  onChange={(e) => handleInputChange('code', e.target.value)}
                  required
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleSendCode('phone')}
                  disabled={!formData.phone || codeSent}
                  className="whitespace-nowrap"
                >
                  {codeSent ? `${countdown}s` : '发送验证码'}
                </Button>
              </div>

              <Button 
                type="submit" 
                className="w-full" 
                disabled={isSubmitting || !formData.phone || !formData.code}
              >
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                登录
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="register" className="space-y-4">
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="space-y-2">
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="昵称"
                    value={formData.nickname}
                    onChange={(e) => handleInputChange('nickname', e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    type="email"
                    placeholder="邮箱地址"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    type="password"
                    placeholder="密码"
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    type="password"
                    placeholder="确认密码"
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full" 
                disabled={isSubmitting || !formData.email || !formData.password || !formData.nickname}
              >
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                注册
              </Button>
            </form>
          </TabsContent>
        </Tabs>

        <div className="mt-6 pt-4 border-t">
          <Button 
            variant="outline" 
            className="w-full" 
            onClick={handleRedirectLogin}
            disabled={loading}
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            使用Authing官方登录页面
          </Button>
        </div>

        {onClose && (
          <div className="mt-4">
            <Button variant="ghost" className="w-full" onClick={onClose}>
              取消
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AuthingWebLogin;
