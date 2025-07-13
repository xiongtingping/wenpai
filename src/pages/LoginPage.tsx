/**
 * 登录页面
 * 支持手机号+密码登录、验证码登录、记住密码、找回密码
 */

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Eye, EyeOff, Phone, Mail, Lock, User, Send } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';

/**
 * 登录页面组件
 * @returns React 组件
 */
export default function LoginPage() {
  const [activeTab, setActiveTab] = useState('password');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [rememberPassword, setRememberPassword] = useState(false);
  
  // 密码登录表单
  const [passwordForm, setPasswordForm] = useState({
    phone: '',
    email: '',
    password: '',
    loginType: 'phone' // 'phone' | 'email'
  });
  
  // 验证码登录表单
  const [codeForm, setCodeForm] = useState({
    phone: '',
    email: '',
    code: '',
    loginType: 'phone' // 'phone' | 'email'
  });

  // 从localStorage加载记住的登录信息
  React.useEffect(() => {
    const rememberedLogin = localStorage.getItem('remembered_login');
    if (rememberedLogin) {
      try {
        const loginData = JSON.parse(rememberedLogin);
        setPasswordForm(prev => ({
          ...prev,
          phone: loginData.phone || '',
          email: loginData.email || '',
          password: loginData.password || '',
          loginType: loginData.loginType || 'phone'
        }));
        setRememberPassword(true);
      } catch (error) {
        console.error('解析记住的登录信息失败:', error);
      }
    }
  }, []);

  /**
   * 保存记住的登录信息
   */
  const saveRememberedLogin = () => {
    if (rememberPassword) {
      const loginData = {
        phone: passwordForm.phone,
        email: passwordForm.email,
        password: passwordForm.password,
        loginType: passwordForm.loginType
      };
      localStorage.setItem('remembered_login', JSON.stringify(loginData));
    } else {
      localStorage.removeItem('remembered_login');
    }
  };

  /**
   * 清除记住的登录信息
   */
  const clearRememberedLogin = () => {
    localStorage.removeItem('remembered_login');
  };
  
  const { toast } = useToast();
  const { login } = useAuth();
  const navigate = useNavigate();

  /**
   * 处理密码登录表单变化
   */
  const handlePasswordFormChange = (field: string, value: string) => {
    setPasswordForm(prev => ({ ...prev, [field]: value }));
  };

  /**
   * 处理验证码登录表单变化
   */
  const handleCodeFormChange = (field: string, value: string) => {
    setCodeForm(prev => ({ ...prev, [field]: value }));
  };

  /**
   * 发送验证码
   */
  const sendCode = async () => {
    if (countdown > 0) return;
    
    if (codeForm.loginType === 'phone') {
      if (!codeForm.phone) {
        toast({
          title: "请输入手机号",
          variant: "destructive"
        });
        return;
      }
      
      if (!/^1[3-9]\d{9}$/.test(codeForm.phone)) {
        toast({
          title: "请输入正确的手机号",
          variant: "destructive"
        });
        return;
      }
    } else {
      if (!codeForm.email) {
        toast({
          title: "请输入邮箱",
          variant: "destructive"
        });
        return;
      }
      
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(codeForm.email)) {
        toast({
          title: "请输入正确的邮箱格式",
          variant: "destructive"
        });
        return;
      }
    }
    
    try {
      // 这里应该调用发送验证码的API
      const target = codeForm.loginType === 'phone' ? '手机' : '邮箱';
      toast({
        title: "验证码已发送",
        description: `验证码已发送到您的${target}`
      });
      
      // 开始倒计时
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
    } catch (error) {
      toast({
        title: "发送失败",
        description: "请稍后重试",
        variant: "destructive"
      });
    }
  };

  /**
   * 密码登录
   */
  const handlePasswordLogin = async () => {
    const { loginType, phone, email, password } = passwordForm;
    
    if (!password) {
      toast({
        title: "请输入密码",
        variant: "destructive"
      });
      return;
    }
    
    if (loginType === 'phone' && !phone) {
      toast({
        title: "请输入手机号",
        variant: "destructive"
      });
      return;
    }
    
    if (loginType === 'email' && !email) {
      toast({
        title: "请输入邮箱",
        variant: "destructive"
      });
      return;
    }
    
    if (loginType === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast({
        title: "请输入正确的邮箱格式",
        variant: "destructive"
      });
      return;
    }
    
    if (loginType === 'phone' && !/^1[3-9]\d{9}$/.test(phone)) {
      toast({
        title: "请输入正确的手机号",
        variant: "destructive"
      });
      return;
    }
    
    setIsLoading(true);
    try {
      // 模拟登录成功
      const userData = {
        id: 'temp-user-id',
        phone: loginType === 'phone' ? phone : '',
        email: loginType === 'email' ? email : '',
        username: loginType === 'phone' ? phone : email,
        nickname: loginType === 'phone' ? phone : email,
        plan: 'free',
        isProUser: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      await login(userData);
      
      // 处理记住密码
      if (rememberPassword) {
        saveRememberedLogin();
      } else {
        clearRememberedLogin();
      }
      
      toast({
        title: "登录成功",
        description: "欢迎回来！"
      });
      
      // 登录成功后直接跳转到首页
      navigate('/');
    } catch (error: any) {
      toast({
        title: "登录失败",
        description: error.message || "请检查登录信息",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * 验证码登录
   */
  const handleCodeLogin = async () => {
    if (codeForm.loginType === 'phone') {
      if (!codeForm.phone || !codeForm.code) {
        toast({
          title: "请填写完整信息",
          variant: "destructive"
        });
        return;
      }
    } else {
      if (!codeForm.email || !codeForm.code) {
        toast({
          title: "请填写完整信息",
          variant: "destructive"
        });
        return;
      }
    }
    
    setIsLoading(true);
    try {
      // 模拟登录成功
      const userData = {
        id: 'temp-user-id',
        phone: codeForm.loginType === 'phone' ? codeForm.phone : '',
        email: codeForm.loginType === 'email' ? codeForm.email : '',
        username: codeForm.loginType === 'phone' ? codeForm.phone : codeForm.email,
        nickname: codeForm.loginType === 'phone' ? codeForm.phone : codeForm.email,
        plan: 'free',
        isProUser: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      await login(userData);
      
      toast({
        title: "登录成功",
        description: "欢迎回来！"
      });
      
      // 登录成功后直接跳转到首页
      navigate('/');
    } catch (error: any) {
      const target = codeForm.loginType === 'phone' ? '手机号' : '邮箱';
      toast({
        title: "登录失败",
        description: error.message || `请检查${target}和验证码`,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* 返回按钮 */}
        <Button
          variant="ghost"
          onClick={() => navigate('/')}
          className="mb-6 flex items-center gap-2 text-gray-600 hover:text-gray-800"
        >
          <ArrowLeft className="h-4 w-4" />
          返回首页
        </Button>
        
        <Card className="shadow-xl">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">登录账号</CardTitle>
            <CardDescription>
              欢迎回到文派，继续您的创作之旅
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="password">密码登录</TabsTrigger>
                <TabsTrigger value="code">验证码登录</TabsTrigger>
              </TabsList>
              
              {/* 密码登录 */}
              <TabsContent value="password" className="space-y-4">
                {/* 登录方式选择 */}
                <div className="space-y-2">
                  <Label>登录方式</Label>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant={passwordForm.loginType === 'phone' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setPasswordForm(prev => ({ ...prev, loginType: 'phone' }))}
                      className="flex-1"
                    >
                      <Phone className="h-4 w-4 mr-1" />
                      手机号
                    </Button>
                    <Button
                      type="button"
                      variant={passwordForm.loginType === 'email' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setPasswordForm(prev => ({ ...prev, loginType: 'email' }))}
                      className="flex-1"
                    >
                      <Mail className="h-4 w-4 mr-1" />
                      邮箱
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="password-account">
                    {passwordForm.loginType === 'phone' ? '手机号' : '邮箱'}
                  </Label>
                  <div className="relative">
                    {passwordForm.loginType === 'phone' ? (
                      <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    ) : (
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    )}
                    <Input
                      id="password-account"
                      type={passwordForm.loginType === 'phone' ? 'tel' : 'email'}
                      placeholder={passwordForm.loginType === 'phone' ? '请输入手机号' : '请输入邮箱'}
                      value={passwordForm.loginType === 'phone' ? passwordForm.phone : passwordForm.email}
                      onChange={(e) => {
                        if (passwordForm.loginType === 'phone') {
                          handlePasswordFormChange('phone', e.target.value);
                        } else {
                          handlePasswordFormChange('email', e.target.value);
                        }
                      }}
                      className="pl-10"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="password-password">密码</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="password-password"
                      type={showPassword ? "text" : "password"}
                      placeholder="请输入密码"
                      value={passwordForm.password}
                      onChange={(e) => handlePasswordFormChange('password', e.target.value)}
                      className="pl-10 pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="remember-password"
                      checked={rememberPassword}
                      onCheckedChange={(checked) => setRememberPassword(checked as boolean)}
                    />
                    <Label htmlFor="remember-password" className="text-sm">
                      记住密码
                    </Label>
                  </div>
                  <Link to="/forgot-password" className="text-sm text-blue-600 hover:underline">
                    忘记密码？
                  </Link>
                </div>
                
                <Button
                  onClick={handlePasswordLogin}
                  disabled={isLoading}
                  className="w-full"
                >
                  {isLoading ? "登录中..." : "立即登录"}
                </Button>
              </TabsContent>
              
              {/* 验证码登录 */}
              <TabsContent value="code" className="space-y-4">
                {/* 登录方式选择 */}
                <div className="space-y-2">
                  <Label>登录方式</Label>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant={codeForm.loginType === 'phone' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setCodeForm(prev => ({ ...prev, loginType: 'phone' }))}
                      className="flex-1"
                    >
                      <Phone className="h-4 w-4 mr-1" />
                      手机号
                    </Button>
                    <Button
                      type="button"
                      variant={codeForm.loginType === 'email' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setCodeForm(prev => ({ ...prev, loginType: 'email' }))}
                      className="flex-1"
                    >
                      <Mail className="h-4 w-4 mr-1" />
                      邮箱
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="code-account">
                    {codeForm.loginType === 'phone' ? '手机号' : '邮箱'}
                  </Label>
                  <div className="relative">
                    {codeForm.loginType === 'phone' ? (
                      <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    ) : (
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    )}
                    <Input
                      id="code-account"
                      type={codeForm.loginType === 'phone' ? 'tel' : 'email'}
                      placeholder={codeForm.loginType === 'phone' ? '请输入手机号' : '请输入邮箱'}
                      value={codeForm.loginType === 'phone' ? codeForm.phone : codeForm.email}
                      onChange={(e) => {
                        if (codeForm.loginType === 'phone') {
                          handleCodeFormChange('phone', e.target.value);
                        } else {
                          handleCodeFormChange('email', e.target.value);
                        }
                      }}
                      className="pl-10"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="code-verification">验证码</Label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Input
                        id="code-verification"
                        placeholder="请输入验证码"
                        value={codeForm.code}
                        onChange={(e) => handleCodeFormChange('code', e.target.value)}
                      />
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={sendCode}
                      disabled={countdown > 0}
                      className="w-24"
                    >
                      {countdown > 0 ? `${countdown}s` : '发送验证码'}
                    </Button>
                  </div>
                </div>
                
                <Button
                  onClick={handleCodeLogin}
                  disabled={isLoading}
                  className="w-full"
                >
                  {isLoading ? "登录中..." : "立即登录"}
                </Button>
              </TabsContent>
            </Tabs>
            
            {/* 注册链接 */}
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                还没有账号？
                <Link to="/register" className="text-blue-600 hover:underline ml-1">
                  立即注册
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 