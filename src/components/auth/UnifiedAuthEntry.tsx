/**
 * 统一登录/注册入口组件
 * 优先使用Authing SDK，提供多种登录方式
 */

import React, { useState, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  LogIn, 
  UserPlus, 
  Loader2,
  Mail,
  Phone,
  Lock,
  User,
  Shield,
  CheckCircle,
  Eye,
  EyeOff,
  MessageSquare
} from 'lucide-react';
import { useUnifiedAuth } from '@/hooks/useUnifiedAuth';
import { useAuthing } from '@/hooks/useAuthing';
import { useToast } from '@/hooks/use-toast';
import { securityUtils } from '@/lib/security';
import { cn } from '@/lib/utils';

/**
 * 统一认证入口组件属性
 */
interface UnifiedAuthEntryProps {
  /** 默认激活的标签页 */
  defaultTab?: 'login' | 'register';
  /** 是否显示为弹窗模式 */
  modal?: boolean;
  /** 自定义样式类 */
  className?: string;
  /** 登录/注册成功后的回调 */
  onSuccess?: (user: any) => void;
  /** 关闭回调 */
  onClose?: () => void;
}

/**
 * 登录表单数据
 */
interface LoginFormData {
  email: string;
  password: string;
  rememberMe: boolean;
}

/**
 * 注册表单数据
 */
interface RegisterFormData {
  nickname: string;
  email: string;
  password: string;
  confirmPassword: string;
  code: string;
  agreeTerms: boolean;
}

/**
 * 统一登录/注册入口组件
 */
export default function UnifiedAuthEntry({
  defaultTab = 'login',
  modal = false,
  className = '',
  onSuccess,
  onClose
}: UnifiedAuthEntryProps) {
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [isLoading, setIsLoading] = useState(false);
  const [isSendingCode, setIsSendingCode] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Hooks
  const { user, isAuthenticated, login, register, loading: authLoading } = useUnifiedAuth();
  const { showLogin, guard } = useAuthing();
  const { toast } = useToast();

  // 表单状态
  const [loginForm, setLoginForm] = useState<LoginFormData>({
    email: '',
    password: '',
    rememberMe: false
  });

  const [registerForm, setRegisterForm] = useState<RegisterFormData>({
    nickname: '',
    email: '',
    password: '',
    confirmPassword: '',
    code: '',
    agreeTerms: false
  });

  /**
   * 发送验证码
   */
  const sendVerificationCode = useCallback(async (email: string) => {
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast({
        title: "邮箱格式错误",
        description: "请输入有效的邮箱地址",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsSendingCode(true);
      
      // 这里应该调用Authing的发送验证码API
      // 暂时模拟发送过程
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setCountdown(60);
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
        title: "验证码已发送",
        description: "请检查您的邮箱"
      });

      securityUtils.secureLog('验证码发送成功', { email });
    } catch (error) {
      toast({
        title: "发送失败",
        description: "请稍后重试",
        variant: "destructive"
      });
      securityUtils.secureLog('验证码发送失败', { email, error: error instanceof Error ? error.message : '未知错误' }, 'error');
    } finally {
      setIsSendingCode(false);
    }
  }, [toast]);

  /**
   * 处理密码登录
   */
  const handlePasswordLogin = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!loginForm.email || !loginForm.password) {
      toast({
        title: "请填写完整信息",
        description: "邮箱和密码不能为空",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsLoading(true);
      
      await login('password', {
        email: loginForm.email,
        password: loginForm.password
      });

      toast({
        title: "登录成功",
        description: "欢迎回来！"
      });

      onSuccess?.(user);
      onClose?.();
    } catch (error) {
      console.error('密码登录失败:', error);
    } finally {
      setIsLoading(false);
    }
  }, [loginForm, login, user, onSuccess, onClose, toast]);

  /**
   * 处理注册
   */
  const handleRegister = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!registerForm.nickname || !registerForm.email || !registerForm.password || !registerForm.code) {
      toast({
        title: "请填写完整信息",
        description: "所有字段都是必填的",
        variant: "destructive"
      });
      return;
    }

    if (registerForm.password !== registerForm.confirmPassword) {
      toast({
        title: "密码不一致",
        description: "两次输入的密码不匹配",
        variant: "destructive"
      });
      return;
    }

    if (!registerForm.agreeTerms) {
      toast({
        title: "请同意条款",
        description: "请阅读并同意用户协议和隐私政策",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsLoading(true);
      
      await register('email', {
        email: registerForm.email,
        code: registerForm.code,
        nickname: registerForm.nickname
      });

      toast({
        title: "注册成功",
        description: "欢迎加入文派！"
      });

      onSuccess?.(user);
      onClose?.();
    } catch (error) {
      console.error('注册失败:', error);
    } finally {
      setIsLoading(false);
    }
  }, [registerForm, register, user, onSuccess, onClose, toast]);

  /**
   * 使用Authing Guard登录
   */
  const handleAuthingLogin = useCallback(() => {
    try {
      securityUtils.secureLog('用户选择Authing登录');
      showLogin();
    } catch (error) {
      console.error('Authing登录失败:', error);
      toast({
        title: "登录失败",
        description: "请稍后重试",
        variant: "destructive"
      });
    }
  }, [showLogin, toast]);

  // 如果用户已登录，显示用户信息
  if (isAuthenticated && user) {
    return (
      <Card className={cn("w-full max-w-md", className)}>
        <CardHeader className="text-center">
          <div className="flex items-center justify-center mb-4">
            <CheckCircle className="w-8 h-8 text-green-600 mr-2" />
            <Badge variant="outline" className="text-green-600">
              已登录
            </Badge>
          </div>
          <CardTitle className="text-xl">欢迎回来！</CardTitle>
          <CardDescription>
            {user.nickname || user.username || user.email}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground">
            <Shield className="w-4 h-4" />
            <span>账户安全</span>
          </div>
          <Button 
            variant="outline" 
            className="w-full"
            onClick={onClose}
          >
            继续使用
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("w-full max-w-md", className)}>
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold">
          {modal ? '登录 / 注册' : '欢迎使用文派'}
        </CardTitle>
        <CardDescription>
          选择您喜欢的登录方式
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Authing登录按钮 */}
        <div className="space-y-4">
          <Button 
            onClick={handleAuthingLogin}
            className="w-full h-12 text-base"
            disabled={authLoading}
          >
            {authLoading ? (
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            ) : (
              <Shield className="w-5 h-5 mr-2" />
            )}
            使用Authing安全登录
          </Button>
          
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <Separator className="w-full" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                或使用其他方式
              </span>
            </div>
          </div>
        </div>

        {/* 传统登录/注册表单 */}
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'login' | 'register')}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">登录</TabsTrigger>
            <TabsTrigger value="register">注册</TabsTrigger>
          </TabsList>

          {/* 登录表单 */}
          <TabsContent value="login" className="space-y-4">
            <form onSubmit={handlePasswordLogin} className="space-y-4">
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
                    type={showPassword ? "text" : "password"}
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

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="remember-me"
                    checked={loginForm.rememberMe}
                    onChange={(e) => setLoginForm(prev => ({ ...prev, rememberMe: e.target.checked }))}
                    className="rounded"
                  />
                  <Label htmlFor="remember-me" className="text-sm">
                    记住我
                  </Label>
                </div>
                <Button type="button" variant="link" className="text-sm">
                  忘记密码？
                </Button>
              </div>

              <Button 
                type="submit" 
                className="w-full" 
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <LogIn className="w-4 h-4 mr-2" />
                )}
                登录
              </Button>
            </form>
          </TabsContent>

          {/* 注册表单 */}
          <TabsContent value="register" className="space-y-4">
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="register-nickname">昵称</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="register-nickname"
                    type="text"
                    placeholder="请输入昵称"
                    value={registerForm.nickname}
                    onChange={(e) => setRegisterForm(prev => ({ ...prev, nickname: e.target.value }))}
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
                <Label htmlFor="register-code">验证码</Label>
                <div className="flex space-x-2">
                  <div className="relative flex-1">
                    <MessageSquare className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="register-code"
                      type="text"
                      placeholder="请输入验证码"
                      value={registerForm.code}
                      onChange={(e) => setRegisterForm(prev => ({ ...prev, code: e.target.value }))}
                      className="pl-10"
                      required
                    />
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => sendVerificationCode(registerForm.email)}
                    disabled={isSendingCode || countdown > 0}
                    className="whitespace-nowrap"
                  >
                    {isSendingCode ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : countdown > 0 ? (
                      `${countdown}s`
                    ) : (
                      "发送验证码"
                    )}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="register-password">密码</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="register-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="请输入密码"
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

              <div className="space-y-2">
                <Label htmlFor="register-confirm-password">确认密码</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="register-confirm-password"
                    type={showConfirmPassword ? "text" : "password"}
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
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="agree-terms"
                  checked={registerForm.agreeTerms}
                  onChange={(e) => setRegisterForm(prev => ({ ...prev, agreeTerms: e.target.checked }))}
                  className="rounded"
                  required
                />
                <Label htmlFor="agree-terms" className="text-sm">
                  我已阅读并同意
                  <Button type="button" variant="link" className="text-sm p-0 h-auto">
                    用户协议
                  </Button>
                  和
                  <Button type="button" variant="link" className="text-sm p-0 h-auto">
                    隐私政策
                  </Button>
                </Label>
              </div>

              <Button 
                type="submit" 
                className="w-full" 
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <UserPlus className="w-4 h-4 mr-2" />
                )}
                注册
              </Button>
            </form>
          </TabsContent>
        </Tabs>

        {/* 关闭按钮（弹窗模式） */}
        {modal && onClose && (
          <Button 
            variant="ghost" 
            onClick={onClose}
            className="w-full"
          >
            取消
          </Button>
        )}
      </CardContent>
    </Card>
  );
} 