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
import { Eye, EyeOff, Mail, Lock, User, ArrowLeft, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

export const CustomLoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { login } = useAuth();
  
  // 登录表单状态
  const [loginForm, setLoginForm] = useState({
    email: '',
    password: '',
    showPassword: false,
    loading: false
  });

  // 注册表单状态
  const [registerForm, setRegisterForm] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    showPassword: false,
    showConfirmPassword: false,
    loading: false
  });

  const [error, setError] = useState('');

  // 处理登录
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoginForm(prev => ({ ...prev, loading: true }));

    try {
      // 简单验证
      if (!loginForm.email || !loginForm.password) {
        throw new Error('请填写完整的登录信息');
      }

      // 模拟登录API调用
      await new Promise(resolve => setTimeout(resolve, 1000));

      // 创建用户信息
      const userInfo = {
        id: 'user_' + Date.now(),
        email: loginForm.email,
        username: loginForm.email.split('@')[0],
        nickname: loginForm.email.split('@')[0],
        avatar: '',
        token: 'token_' + Math.random().toString(36),
        tier: 'free' // 默认免费版
      };

      // 存储到localStorage
      localStorage.setItem('user', JSON.stringify(userInfo));
      localStorage.setItem('token', userInfo.token);

      // 调用登录hook
      await login(userInfo.email, loginForm.password);

      toast({
        title: '登录成功',
        description: `欢迎回来，${userInfo.username}！`,
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
      if (!registerForm.username || !registerForm.email || !registerForm.password) {
        throw new Error('请填写完整的注册信息');
      }

      if (registerForm.password !== registerForm.confirmPassword) {
        throw new Error('两次输入的密码不一致');
      }

      if (registerForm.password.length < 6) {
        throw new Error('密码长度至少6位');
      }

      // 模拟注册API调用
      await new Promise(resolve => setTimeout(resolve, 1500));

      // 创建用户信息
      const userInfo = {
        id: 'user_' + Date.now(),
        email: registerForm.email,
        username: registerForm.username,
        nickname: registerForm.username,
        avatar: '',
        token: 'token_' + Math.random().toString(36),
        tier: 'free'
      };

      // 存储到localStorage
      localStorage.setItem('user', JSON.stringify(userInfo));
      localStorage.setItem('token', userInfo.token);

      toast({
        title: '注册成功',
        description: `欢迎加入文派，${userInfo.username}！`,
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
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/20 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* 返回首页按钮 */}
        <Button
          variant="ghost"
          onClick={() => navigate('/')}
          className="mb-6 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          返回首页
        </Button>

        <Card className="shadow-xl border-border/50">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">文派</CardTitle>
            <CardDescription>
              AI驱动的创意内容平台
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">登录</TabsTrigger>
                <TabsTrigger value="register">注册</TabsTrigger>
              </TabsList>

              {/* 错误提示 */}
              {error && (
                <Alert variant="destructive" className="mt-4">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* 登录表单 */}
              <TabsContent value="login" className="space-y-4">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email">邮箱</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="login-email"
                        type="email"
                        placeholder="请输入邮箱"
                        value={loginForm.email}
                        onChange={(e) => setLoginForm(prev => ({ ...prev, email: e.target.value }))}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

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

                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={loginForm.loading}
                  >
                    {loginForm.loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        登录中...
                      </>
                    ) : (
                      '登录'
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
              <TabsContent value="register" className="space-y-4">
                <form onSubmit={handleRegister} className="space-y-4">
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
                    className="w-full" 
                    disabled={registerForm.loading}
                  >
                    {registerForm.loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        注册中...
                      </>
                    ) : (
                      '注册'
                    )}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>

            <div className="mt-6 text-center text-xs text-muted-foreground">
              注册即表示您同意我们的{' '}
              <Link to="/terms" className="hover:text-primary">
                服务条款
              </Link>{' '}
              和{' '}
              <Link to="/privacy" className="hover:text-primary">
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
