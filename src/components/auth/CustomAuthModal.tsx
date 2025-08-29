import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useUnifiedAuth } from '@/contexts/UnifiedAuthContext';
import { AuthenticationClient } from 'authing-js-sdk';

interface CustomAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: 'login' | 'register';
}

export const CustomAuthModal: React.FC<CustomAuthModalProps> = ({
  isOpen,
  onClose,
  defaultTab = 'login'
}) => {
  const { handleAuthingLogin } = useUnifiedAuth();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [error, setError] = useState<string | null>(null);
  const [loginMethod, setLoginMethod] = useState<'password' | 'code'>('password');
  const [registerMethod, setRegisterMethod] = useState<'email' | 'phone'>('email');

  // Authing 客户端配置
  const authClient = new AuthenticationClient({
    appId: '68a68a29d0c3341ae7a3df23',
    appHost: 'https://rzcswqs4sq0f.authing.cn',
  });

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const formData = new FormData(e.currentTarget);
      const identifier = formData.get('identifier') as string;

      console.log('🔐 开始自定义表单登录...');

      let result;
      if (loginMethod === 'password') {
        const password = formData.get('password') as string;
        if (identifier.includes('@')) {
          // 邮箱密码登录
          result = await authClient.loginByEmail(identifier, password);
        } else {
          // 用户名密码登录
          result = await authClient.loginByUsername(identifier, password);
        }
      } else {
        // 验证码登录
        const code = formData.get('code') as string;
        result = await authClient.loginByEmailCode(identifier, code);
      }

      if (result) {
        console.log('✅ 登录成功:', result);
        handleAuthingLogin(result);
        onClose();
      }
    } catch (error: any) {
      console.error('❌ 登录失败:', error);
      setError(error.message || '登录失败');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const formData = new FormData(e.currentTarget);
      const contact = formData.get('contact') as string;
      const password = formData.get('password') as string;

      console.log('📝 开始自定义表单注册...');

      let result;
      if (registerMethod === 'email') {
        result = await authClient.registerByEmail(contact, password);
      } else {
        // 手机号注册需要验证码，暂时只支持邮箱注册
        throw new Error('手机号注册需要验证码，请使用邮箱注册');
      }

      if (result) {
        console.log('✅ 注册成功:', result);
        handleAuthingLogin(result);
        onClose();
      }
    } catch (error: any) {
      console.error('❌ 注册失败:', error);
      setError(error.message || '注册失败');
    } finally {
      setLoading(false);
    }
  };

  const sendVerificationCode = async (email: string) => {
    try {
      setError(null);
      console.log('📧 发送邮箱验证码...');
      await authClient.sendEmail(email, 'VERIFY_CODE');
      console.log('✅ 验证码发送成功');
    } catch (error: any) {
      console.error('❌ 验证码发送失败:', error);
      setError(error.message || '验证码发送失败');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>文派 认证</DialogTitle>
        </DialogHeader>

        {error && (
          <div className="text-red-500 text-sm p-2 bg-red-50 rounded">
            {error}
          </div>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab as any} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">登录</TabsTrigger>
            <TabsTrigger value="register">注册</TabsTrigger>
          </TabsList>

          <TabsContent value="login" className="space-y-4">
            <div className="space-y-2">
              <Label>登录方式</Label>
              <Select value={loginMethod} onValueChange={setLoginMethod as any}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="password">密码登录</SelectItem>
                  <SelectItem value="code">验证码登录</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="identifier">
                  {loginMethod === 'code' ? '邮箱' : '邮箱或用户名'}
                </Label>
                <Input
                  id="identifier"
                  name="identifier"
                  type={loginMethod === 'code' ? 'email' : 'text'}
                  placeholder={loginMethod === 'code' ? '请输入邮箱' : '请输入邮箱或用户名'}
                  required
                />
              </div>

              {loginMethod === 'password' ? (
                <div className="space-y-2">
                  <Label htmlFor="password">密码</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="请输入密码"
                    autoComplete="current-password"
                    required
                  />
                </div>
              ) : (
                <div className="space-y-2">
                  <Label htmlFor="code">验证码</Label>
                  <div className="flex space-x-2">
                    <Input
                      id="code"
                      name="code"
                      type="text"
                      placeholder="请输入验证码"
                      required
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={async () => {
                        const email = (document.getElementById('identifier') as HTMLInputElement)?.value;
                        if (email) {
                          await sendVerificationCode(email);
                        }
                      }}
                    >
                      发送验证码
                    </Button>
                  </div>
                </div>
              )}

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? '登录中...' : '登录'}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="register" className="space-y-4">
            <div className="space-y-2">
              <Label>注册方式</Label>
              <Select value={registerMethod} onValueChange={setRegisterMethod as any}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="email">邮箱注册</SelectItem>
                  <SelectItem value="phone">手机号注册</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <form onSubmit={handleRegister} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="reg-contact">
                  {registerMethod === 'email' ? '邮箱' : '手机号'}
                </Label>
                <Input
                  id="reg-contact"
                  name="contact"
                  type={registerMethod === 'email' ? 'email' : 'tel'}
                  placeholder={registerMethod === 'email' ? '请输入邮箱' : '请输入手机号'}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="reg-password">密码</Label>
                <Input
                  id="reg-password"
                  name="password"
                  type="password"
                  placeholder="请输入密码"
                  autoComplete="new-password"
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? '注册中...' : '注册'}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};