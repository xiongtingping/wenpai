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
    password: ''
  });
  
  // 验证码登录表单
  const [codeForm, setCodeForm] = useState({
    phone: '',
    code: ''
  });
  
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
    
    try {
      // 这里应该调用发送验证码的API
      toast({
        title: "验证码已发送",
        description: "验证码已发送到您的手机"
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
    if (!passwordForm.phone || !passwordForm.password) {
      toast({
        title: "请填写完整信息",
        variant: "destructive"
      });
      return;
    }
    
    setIsLoading(true);
    try {
      await login(passwordForm.phone, passwordForm.password);
      
      toast({
        title: "登录成功",
        description: "欢迎回来！"
      });
      
      // 检查是否有选中的套餐，如果有则跳转到支付页面
      const selectedPlan = localStorage.getItem("selectedPlan");
      if (selectedPlan) {
        navigate('/payment');
      } else {
        navigate('/');
      }
    } catch (error: any) {
      toast({
        title: "登录失败",
        description: error.message || "请检查手机号和密码",
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
    if (!codeForm.phone || !codeForm.code) {
      toast({
        title: "请填写完整信息",
        variant: "destructive"
      });
      return;
    }
    
    setIsLoading(true);
    try {
      await login(codeForm.phone, codeForm.code);
      
      toast({
        title: "登录成功",
        description: "欢迎回来！"
      });
      
      // 检查是否有选中的套餐，如果有则跳转到支付页面
      const selectedPlan = localStorage.getItem("selectedPlan");
      if (selectedPlan) {
        navigate('/payment');
      } else {
        navigate('/');
      }
    } catch (error: any) {
      toast({
        title: "登录失败",
        description: error.message || "请检查手机号和验证码",
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
                <div className="space-y-2">
                  <Label htmlFor="password-phone">手机号</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="password-phone"
                      type="tel"
                      placeholder="请输入手机号"
                      value={passwordForm.phone}
                      onChange={(e) => handlePasswordFormChange('phone', e.target.value)}
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
                <div className="space-y-2">
                  <Label htmlFor="code-phone">手机号</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="code-phone"
                      type="tel"
                      placeholder="请输入手机号"
                      value={codeForm.phone}
                      onChange={(e) => handleCodeFormChange('phone', e.target.value)}
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