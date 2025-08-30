/**
 * 自定义登录/注册页面
 * 提供原生的登录注册表单，不依赖第三方服务
 */

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Eye, EyeOff, Mail, Lock, User, ArrowLeft, Loader2, Phone, MessageSquare } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { ThemeAwareLogo } from '@/components/ui/ThemeAwareLogo';

export const CustomLoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { login } = useAuth();
  
  // 登录表单状态
  const [loginForm, setLoginForm] = useState({
    contact: '', // 邮箱或手机号
    password: '',
    code: '', // 验证码
    showPassword: false,
    loading: false
  });

  // 登录方式状态
  const [loginMethod, setLoginMethod] = useState<'password' | 'code'>('password');
  const [contactType, setContactType] = useState<'email' | 'phone'>('email');

  // 注册表单状态
  const [registerForm, setRegisterForm] = useState({
    username: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    showPassword: false,
    showConfirmPassword: false,
    loading: false
  });

  const [registerContactType, setRegisterContactType] = useState<'email' | 'phone'>('email');

  const [error, setError] = useState('');

  // 处理登录
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoginForm(prev => ({ ...prev, loading: true }));

    try {
      // 简单验证
      if (!loginForm.contact || (loginMethod === 'password' && !loginForm.password)) {
        throw new Error('请填写完整的登录信息');
      }
      
      if (loginMethod === 'code' && !loginForm.code) {
        throw new Error('请输入验证码');
      }

      // ✅ FIXED: 2025-08-30 遵循 api_prohibit_local_mock_error 规则
      // 必须调用真实的Authing API进行登录
      await login(loginForm.contact, loginForm.password);

      toast({
        title: '登录成功',
        description: '欢迎回来！',
      });

      // 跳转到首页
      navigate('/');

    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : '登录失败';
      setError(errorMsg);
      toast({
        title: '登录失败',
        description: errorMsg,
        variant: 'destructive'
      });
    } finally {
      setLoginForm(prev => ({ ...prev, loading: false }));
    }
  };

  // 处理注册
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setRegisterForm(prev => ({ ...prev, loading: true }));

    try {
      // 验证表单
      const contact = registerContactType === 'email' ? registerForm.email : registerForm.phone;
      if (!registerForm.username || !contact || !registerForm.password) {
        throw new Error('请填写完整的注册信息');
      }

      if (registerForm.password !== registerForm.confirmPassword) {
        throw new Error('两次输入的密码不一致');
      }

      if (registerForm.password.length < 6) {
        throw new Error('密码长度至少6位');
      }

      // 验证邮箱或手机号格式
      if (registerContactType === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(registerForm.email)) {
        throw new Error('请输入有效的邮箱地址');
      }

      if (registerContactType === 'phone' && !/^1[3-9]\d{9}$/.test(registerForm.phone)) {
        throw new Error('请输入有效的手机号');
      }

      // ✅ FIXED: 2025-08-30 遵循 api_prohibit_local_mock_error 规则
      // 必须调用真实的Authing API进行注册
      throw new Error('注册功能需要集成真实的Authing API，暂时禁用模拟注册');

      toast({
        title: '注册成功',
        description: '欢迎加入文派！',
      });

      // 跳转到首页
      navigate('/');

    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : '注册失败';
      setError(errorMsg);
      toast({
        title: '注册失败',
        description: errorMsg,
        variant: 'destructive'
      });
    } finally {
      setRegisterForm(prev => ({ ...prev, loading: false }));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 flex items-center justify-center p-4 relative overflow-hidden">
      {/* 背景装饰 */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
      <div className="absolute top-0 left-0 w-72 h-72 bg-primary/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-0 w-72 h-72 bg-secondary/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>

      <div className="w-full max-w-md sm:max-w-lg relative z-10">
        {/* 返回首页按钮 */}
        <Button
          variant="ghost"
          onClick={() => navigate('/')}
          className="mb-8 text-muted-foreground hover:text-foreground backdrop-blur-sm"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          返回首页
        </Button>

        <Card className="shadow-2xl border-border/30 backdrop-blur-md bg-card/95">
          <CardHeader className="text-center pb-6 pt-6 sm:pb-8 sm:pt-8">
            {/* Logo */}
            <div className="flex justify-center mb-6">
              <div className="group">
                <ThemeAwareLogo
                  size="xl"
                  showHoverEffect={true}
                  showBackground={true}
                />
              </div>
            </div>
            <CardTitle className="text-4xl font-bold bg-gradient-to-r from-primary via-primary/80 to-secondary bg-clip-text text-transparent mb-3">
              欢迎来到文派
            </CardTitle>
            <CardDescription className="text-lg text-muted-foreground">
              AI驱动的创意内容平台
            </CardDescription>
          </CardHeader>
          <CardContent className="px-6 pb-6 sm:px-8 sm:pb-8">
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-4 sm:mb-6 h-12">
                <TabsTrigger value="login" className="py-3 text-base font-medium">登录</TabsTrigger>
                <TabsTrigger value="register" className="py-3 text-base font-medium">注册</TabsTrigger>
              </TabsList>

              {/* 错误提示 */}
              {error && (
                <Alert variant="destructive" className="mb-6">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* 登录表单 */}
              <TabsContent value="login" className="space-y-4 sm:space-y-6">
                <form onSubmit={handleLogin} className="space-y-4 sm:space-y-5">
                  {/* 联系方式类型选择 */}
                  <div className="flex gap-2 p-1 bg-muted rounded-lg">
                    <Button
                      type="button"
                      variant={contactType === 'email' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setContactType('email')}
                      className="flex-1"
                    >
                      <Mail className="w-4 h-4 mr-1" />
                      邮箱
                    </Button>
                    <Button
                      type="button"
                      variant={contactType === 'phone' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setContactType('phone')}
                      className="flex-1"
                    >
                      <Phone className="w-4 h-4 mr-1" />
                      手机号
                    </Button>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="login-contact">
                      {contactType === 'email' ? '邮箱' : '手机号'}
                    </Label>
                    <div className="relative">
                      {contactType === 'email' ? (
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      ) : (
                        <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      )}
                      <Input
                        id="login-contact"
                        type={contactType === 'email' ? 'email' : 'tel'}
                        placeholder={contactType === 'email' ? '请输入邮箱' : '请输入手机号'}
                        value={loginForm.contact}
                        onChange={(e) => setLoginForm(prev => ({ ...prev, contact: e.target.value }))}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  {/* 登录方式选择 */}
                  <div className="flex gap-2 p-1 bg-muted rounded-lg">
                    <Button
                      type="button"
                      variant={loginMethod === 'password' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setLoginMethod('password')}
                      className="flex-1"
                    >
                      <Lock className="w-4 h-4 mr-1" />
                      密码登录
                    </Button>
                    <Button
                      type="button"
                      variant={loginMethod === 'code' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setLoginMethod('code')}
                      className="flex-1"
                    >
                      <MessageSquare className="w-4 h-4 mr-1" />
                      验证码登录
                    </Button>
                  </div>

                  {/* 密码或验证码输入 */}
                  {loginMethod === 'password' ? (
                    <div className="space-y-2">
                      <Label htmlFor="login-password">密码</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="login-password"
                          type={loginForm.showPassword ? 'text' : 'password'}
                          placeholder="请输入密码"
                          value={loginForm.password}
                          onChange={(e) => setLoginForm(prev => ({ ...prev, password: e.target.value }))}
                          className="pl-10 pr-10"
                          required
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setLoginForm(prev => ({ ...prev, showPassword: !prev.showPassword }))}
                        >
                          {loginForm.showPassword ? (
                            <EyeOff className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <Eye className="h-4 w-4 text-muted-foreground" />
                          )}
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Label htmlFor="login-code">验证码</Label>
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <MessageSquare className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="login-code"
                            type="text"
                            placeholder="请输入验证码"
                            value={loginForm.code}
                            onChange={(e) => setLoginForm(prev => ({ ...prev, code: e.target.value }))}
                            className="pl-10"
                            required
                          />
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          className="px-4 whitespace-nowrap"
                          onClick={() => {
                            // ✅ FIXED: 2025-08-30 遵循 api_prohibit_local_mock_error 规则
                            toast({
                              title: '功能暂不可用',
                              description: '验证码登录需要集成真实SMS API',
                              variant: 'destructive'
                            });
                          }}
                        >
                          获取验证码
                        </Button>
                      </div>
                    </div>
                  )}

                  <Button 
                    type="submit" 
                    className="w-full py-3 text-base font-medium mt-8" 
                    disabled={loginForm.loading}
                  >
                    {loginForm.loading ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        登录中...
                      </>
                    ) : (
                      '立即登录'
                    )}
                  </Button>
                </form>

                <div className="text-center text-sm text-muted-foreground">
                  <Link to="/forgot-password" className="hover:text-primary">
                    忘记密码？
                  </Link>
                </div>
              </TabsContent>

              {/* 注册表单 */}
              <TabsContent value="register" className="space-y-4 sm:space-y-6">
                <form onSubmit={handleRegister} className="space-y-4 sm:space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="register-username">用户名</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="register-username"
                        type="text"
                        placeholder="请输入用户名"
                        value={registerForm.username}
                        onChange={(e) => setRegisterForm(prev => ({ ...prev, username: e.target.value }))}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  {/* 注册联系方式类型选择 */}
                  <div className="flex gap-2 p-1 bg-muted rounded-lg">
                    <Button
                      type="button"
                      variant={registerContactType === 'email' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setRegisterContactType('email')}
                      className="flex-1"
                    >
                      <Mail className="w-4 h-4 mr-1" />
                      邮箱注册
                    </Button>
                    <Button
                      type="button"
                      variant={registerContactType === 'phone' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setRegisterContactType('phone')}
                      className="flex-1"
                    >
                      <Phone className="w-4 h-4 mr-1" />
                      手机号注册
                    </Button>
                  </div>

                  {/* 联系方式输入 */}
                  {registerContactType === 'email' ? (
                    <div className="space-y-2">
                      <Label htmlFor="register-email">邮箱</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="register-email"
                          type="email"
                          placeholder="请输入邮箱"
                          value={registerForm.email}
                          onChange={(e) => setRegisterForm(prev => ({ ...prev, email: e.target.value }))}
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Label htmlFor="register-phone">手机号</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="register-phone"
                          type="tel"
                          placeholder="请输入手机号"
                          value={registerForm.phone}
                          onChange={(e) => setRegisterForm(prev => ({ ...prev, phone: e.target.value }))}
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="register-password">密码</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="register-password"
                        type={registerForm.showPassword ? 'text' : 'password'}
                        placeholder="请输入密码（至少6位）"
                        value={registerForm.password}
                        onChange={(e) => setRegisterForm(prev => ({ ...prev, password: e.target.value }))}
                        className="pl-10 pr-10"
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setRegisterForm(prev => ({ ...prev, showPassword: !prev.showPassword }))}
                      >
                        {registerForm.showPassword ? (
                          <EyeOff className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <Eye className="h-4 w-4 text-muted-foreground" />
                        )}
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="register-confirm-password">确认密码</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="register-confirm-password"
                        type={registerForm.showConfirmPassword ? 'text' : 'password'}
                        placeholder="请再次输入密码"
                        value={registerForm.confirmPassword}
                        onChange={(e) => setRegisterForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                        className="pl-10 pr-10"
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setRegisterForm(prev => ({ ...prev, showConfirmPassword: !prev.showConfirmPassword }))}
                      >
                        {registerForm.showConfirmPassword ? (
                          <EyeOff className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <Eye className="h-4 w-4 text-muted-foreground" />
                        )}
                      </Button>
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full py-3 text-base font-medium mt-8" 
                    disabled={registerForm.loading}
                  >
                    {registerForm.loading ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        注册中...
                      </>
                    ) : (
                      '立即注册'
                    )}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>

            <div className="mt-6 sm:mt-8 text-center text-xs sm:text-sm text-muted-foreground">
              注册即表示您同意我们的{' '}
              <Link to="/terms" className="hover:text-primary underline">
                服务条款
              </Link>{' '}
              和{' '}
              <Link to="/privacy" className="hover:text-primary underline">
                隐私政策
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CustomLoginPage;
