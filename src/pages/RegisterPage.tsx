/**
 * 注册页面
 * 支持手机号注册和邮箱注册
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
import { useUserStore } from '@/store/userStore';
import { getOrCreateTempUserId } from '@/lib/utils';

/**
 * 注册页面组件
 * @returns React 组件
 */
export default function RegisterPage() {
  const [activeTab, setActiveTab] = useState('phone');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [agreeTerms, setAgreeTerms] = useState(false);
  
  // 手机号注册表单
  const [phoneForm, setPhoneForm] = useState({
    phone: '',
    code: '',
    password: '',
    confirmPassword: '',
    nickname: ''
  });
  
  // 邮箱注册表单
  const [emailForm, setEmailForm] = useState({
    email: '',
    code: '',
    password: '',
    confirmPassword: '',
    nickname: ''
  });
  
  const { toast } = useToast();
  const { login } = useAuth();
  const { processReferralReward } = useUserStore();
  const navigate = useNavigate();

  /**
   * 处理手机号表单变化
   */
  const handlePhoneFormChange = (field: string, value: string) => {
    setPhoneForm(prev => ({ ...prev, [field]: value }));
  };

  /**
   * 处理邮箱表单变化
   */
  const handleEmailFormChange = (field: string, value: string) => {
    setEmailForm(prev => ({ ...prev, [field]: value }));
  };

  /**
   * 发送验证码
   */
  const sendCode = async (type: 'phone' | 'email') => {
    if (countdown > 0) return;
    
    const value = type === 'phone' ? phoneForm.phone : emailForm.email;
    
    if (!value) {
      toast({
        title: "请输入" + (type === 'phone' ? '手机号' : '邮箱'),
        variant: "destructive"
      });
      return;
    }
    
    if (type === 'phone' && !/^1[3-9]\d{9}$/.test(value)) {
      toast({
        title: "请输入正确的手机号",
        variant: "destructive"
      });
      return;
    }
    
    if (type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      toast({
        title: "请输入正确的邮箱地址",
        variant: "destructive"
      });
      return;
    }
    
    try {
      // 这里应该调用发送验证码的API
      toast({
        title: "验证码已发送",
        description: `验证码已发送到您的${type === 'phone' ? '手机' : '邮箱'}`
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
   * 手机号注册
   */
  const handlePhoneRegister = async () => {
    if (!phoneForm.phone || !phoneForm.code || !phoneForm.password || !phoneForm.confirmPassword) {
      toast({
        title: "请填写完整信息",
        variant: "destructive"
      });
      return;
    }
    
    if (phoneForm.password !== phoneForm.confirmPassword) {
      toast({
        title: "两次密码不一致",
        variant: "destructive"
      });
      return;
    }
    
    if (!agreeTerms) {
      toast({
        title: "请同意用户协议",
        variant: "destructive"
      });
      return;
    }
    
    setIsLoading(true);
    try {
      // 获取推荐人ID和临时用户ID
      const referrerId = localStorage.getItem('referrer-id');
      const tempUserId = getOrCreateTempUserId();
      
      // 设置注册时间和优惠开始时间
      const now = Date.now();
      localStorage.setItem('promo_start', now.toString());
      localStorage.setItem('registration_time', now.toString());
      
      // 发送注册请求
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: phoneForm.nickname,
          password: phoneForm.password,
          phone: phoneForm.phone,
          verificationCode: phoneForm.code,
          tempUserId: tempUserId,
          referrerId: referrerId, // 添加推荐人ID
        }),
      });
      
      if (!response.ok) {
        throw new Error(`注册失败: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (result.success) {
        // 注册成功后，使用返回的用户数据登录
        await login({
          id: result.user.id || tempUserId,
          phone: phoneForm.phone,
          username: phoneForm.nickname,
          nickname: phoneForm.nickname,
          plan: 'free',
          isProUser: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          referrerId: referrerId
        });
        
        // 处理推荐奖励
        processReferralReward();
        
        toast({
          title: "注册成功",
          description: "欢迎加入文派！"
        });
        
        // 注册成功后跳转到首页
        navigate('/');
      } else {
        throw new Error(result.message || '注册失败');
      }
    } catch (error: any) {
      toast({
        title: "注册失败",
        description: error.message || "请稍后重试",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * 邮箱注册
   */
  const handleEmailRegister = async () => {
    if (!emailForm.email || !emailForm.code || !emailForm.password || !emailForm.confirmPassword) {
      toast({
        title: "请填写完整信息",
        variant: "destructive"
      });
      return;
    }
    
    if (emailForm.password !== emailForm.confirmPassword) {
      toast({
        title: "两次密码不一致",
        variant: "destructive"
      });
      return;
    }
    
    if (!agreeTerms) {
      toast({
        title: "请同意用户协议",
        variant: "destructive"
      });
      return;
    }
    
    setIsLoading(true);
    try {
      // 获取推荐人ID和临时用户ID
      const referrerId = localStorage.getItem('referrer-id');
      const tempUserId = getOrCreateTempUserId();
      
      // 设置注册时间和优惠开始时间
      const now = Date.now();
      localStorage.setItem('promo_start', now.toString());
      localStorage.setItem('registration_time', now.toString());
      
      // 发送注册请求
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: emailForm.nickname,
          password: emailForm.password,
          email: emailForm.email,
          verificationCode: emailForm.code,
          tempUserId: tempUserId,
          referrerId: referrerId, // 添加推荐人ID
        }),
      });
      
      if (!response.ok) {
        throw new Error(`注册失败: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (result.success) {
        // 注册成功后，使用返回的用户数据登录
        await login({
          id: result.user.id || tempUserId,
          email: emailForm.email,
          username: emailForm.nickname,
          nickname: emailForm.nickname,
          plan: 'free',
          isProUser: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          referrerId: referrerId
        });
        
        // 处理推荐奖励
        processReferralReward();
        
        toast({
          title: "注册成功",
          description: "欢迎加入文派！"
        });
        
        // 注册成功后跳转到首页
        navigate('/');
      } else {
        throw new Error(result.message || '注册失败');
      }
    } catch (error: any) {
      toast({
        title: "注册失败",
        description: error.message || "请稍后重试",
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
            <CardTitle className="text-2xl font-bold">注册账号</CardTitle>
            <CardDescription>
              加入文派，开启智能内容创作之旅
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="phone">手机号注册</TabsTrigger>
                <TabsTrigger value="email">邮箱注册</TabsTrigger>
              </TabsList>
              
              {/* 手机号注册 */}
              <TabsContent value="phone" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="phone" className="flex items-center">
                    手机号 <span className="text-red-500 ml-1">*</span>
                  </Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="请输入手机号"
                      value={phoneForm.phone}
                      onChange={(e) => handlePhoneFormChange('phone', e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="phone-code">验证码</Label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Input
                        id="phone-code"
                        placeholder="请输入验证码"
                        value={phoneForm.code}
                        onChange={(e) => handlePhoneFormChange('code', e.target.value)}
                      />
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => sendCode('phone')}
                      disabled={countdown > 0}
                      className="w-24"
                    >
                      {countdown > 0 ? `${countdown}s` : '发送验证码'}
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="phone-nickname">昵称</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="phone-nickname"
                      placeholder="请输入昵称（可选）"
                      value={phoneForm.nickname}
                      onChange={(e) => handlePhoneFormChange('nickname', e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="phone-password">密码</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="phone-password"
                      type={showPassword ? "text" : "password"}
                      placeholder="请输入密码"
                      value={phoneForm.password}
                      onChange={(e) => handlePhoneFormChange('password', e.target.value)}
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
                
                <div className="space-y-2">
                  <Label htmlFor="phone-confirm-password">确认密码</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="phone-confirm-password"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="请再次输入密码"
                      value={phoneForm.confirmPassword}
                      onChange={(e) => handlePhoneFormChange('confirmPassword', e.target.value)}
                      className="pl-10 pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="phone-terms"
                    checked={agreeTerms}
                    onCheckedChange={(checked) => setAgreeTerms(checked as boolean)}
                  />
                  <Label htmlFor="phone-terms" className="text-sm">
                    我已阅读并同意
                    <Link to="/terms" className="text-blue-600 hover:underline ml-1">
                      《用户协议》
                    </Link>
                    和
                    <Link to="/privacy" className="text-blue-600 hover:underline ml-1">
                      《隐私政策》
                    </Link>
                  </Label>
                </div>
                
                <Button
                  onClick={handlePhoneRegister}
                  disabled={isLoading}
                  className="w-full"
                >
                  {isLoading ? "注册中..." : "立即注册"}
                </Button>
              </TabsContent>
              
              {/* 邮箱注册 */}
              <TabsContent value="email" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">邮箱</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="请输入邮箱"
                      value={emailForm.email}
                      onChange={(e) => handleEmailFormChange('email', e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email-code">验证码</Label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Input
                        id="email-code"
                        placeholder="请输入验证码"
                        value={emailForm.code}
                        onChange={(e) => handleEmailFormChange('code', e.target.value)}
                      />
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => sendCode('email')}
                      disabled={countdown > 0}
                      className="w-24"
                    >
                      {countdown > 0 ? `${countdown}s` : '发送验证码'}
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email-nickname">昵称</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="email-nickname"
                      placeholder="请输入昵称（可选）"
                      value={emailForm.nickname}
                      onChange={(e) => handleEmailFormChange('nickname', e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email-password">密码</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="email-password"
                      type={showPassword ? "text" : "password"}
                      placeholder="请输入密码"
                      value={emailForm.password}
                      onChange={(e) => handleEmailFormChange('password', e.target.value)}
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
                
                <div className="space-y-2">
                  <Label htmlFor="email-confirm-password">确认密码</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="email-confirm-password"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="请再次输入密码"
                      value={emailForm.confirmPassword}
                      onChange={(e) => handleEmailFormChange('confirmPassword', e.target.value)}
                      className="pl-10 pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="email-terms"
                    checked={agreeTerms}
                    onCheckedChange={(checked) => setAgreeTerms(checked as boolean)}
                  />
                  <Label htmlFor="email-terms" className="text-sm">
                    我已阅读并同意
                    <Link to="/terms" className="text-blue-600 hover:underline ml-1">
                      《用户协议》
                    </Link>
                    和
                    <Link to="/privacy" className="text-blue-600 hover:underline ml-1">
                      《隐私政策》
                    </Link>
                  </Label>
                </div>
                
                <Button
                  onClick={handleEmailRegister}
                  disabled={isLoading}
                  className="w-full"
                >
                  {isLoading ? "注册中..." : "立即注册"}
                </Button>
              </TabsContent>
            </Tabs>
            
            {/* 登录链接 */}
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                已有账号？
                <Link to="/login" className="text-blue-600 hover:underline ml-1">
                  立即登录
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}