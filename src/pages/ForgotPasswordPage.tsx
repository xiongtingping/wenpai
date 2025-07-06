/**
 * 找回密码页面
 * 支持手机号和邮箱找回密码
 */

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Phone, Mail, Lock, Send } from 'lucide-react';

/**
 * 找回密码页面组件
 * @returns React 组件
 */
export default function ForgotPasswordPage() {
  const [activeTab, setActiveTab] = useState('phone');
  const [isLoading, setIsLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [step, setStep] = useState<'input' | 'verify' | 'reset'>('input');
  
  // 手机号找回表单
  const [phoneForm, setPhoneForm] = useState({
    phone: '',
    code: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  // 邮箱找回表单
  const [emailForm, setEmailForm] = useState({
    email: '',
    code: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  const { toast } = useToast();
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
        title: "请输入正确的邮箱",
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
      
      // 进入验证步骤
      setStep('verify');
    } catch (error) {
      toast({
        title: "发送失败",
        description: "请稍后重试",
        variant: "destructive"
      });
    }
  };

  /**
   * 验证验证码
   */
  const verifyCode = async (type: 'phone' | 'email') => {
    const form = type === 'phone' ? phoneForm : emailForm;
    
    if (!form.code) {
      toast({
        title: "请输入验证码",
        variant: "destructive"
      });
      return;
    }
    
    try {
      // 这里应该调用验证验证码的API
      toast({
        title: "验证成功",
        description: "验证码验证成功，请设置新密码"
      });
      
      // 进入重置密码步骤
      setStep('reset');
    } catch (error) {
      toast({
        title: "验证失败",
        description: "请检查验证码是否正确",
        variant: "destructive"
      });
    }
  };

  /**
   * 重置密码
   */
  const resetPassword = async (type: 'phone' | 'email') => {
    const form = type === 'phone' ? phoneForm : emailForm;
    
    if (!form.newPassword || !form.confirmPassword) {
      toast({
        title: "请填写完整信息",
        variant: "destructive"
      });
      return;
    }
    
    if (form.newPassword !== form.confirmPassword) {
      toast({
        title: "两次密码不一致",
        variant: "destructive"
      });
      return;
    }
    
    if (form.newPassword.length < 6) {
      toast({
        title: "密码长度不足",
        description: "密码至少需要6位字符",
        variant: "destructive"
      });
      return;
    }
    
    setIsLoading(true);
    try {
      // 这里应该调用重置密码的API
      toast({
        title: "密码重置成功",
        description: "请使用新密码登录"
      });
      
      // 重置表单状态
      setPhoneForm({ phone: '', code: '', newPassword: '', confirmPassword: '' });
      setEmailForm({ email: '', code: '', newPassword: '', confirmPassword: '' });
      setStep('input');
      
      // 跳转到登录页面
      setTimeout(() => {
        navigate('/login');
      }, 1500);
    } catch (error: any) {
      toast({
        title: "重置失败",
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
          onClick={() => navigate('/login')}
          className="mb-6 flex items-center gap-2 text-gray-600 hover:text-gray-800"
        >
          <ArrowLeft className="h-4 w-4" />
          返回登录
        </Button>
        
        <Card className="shadow-xl">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">找回密码</CardTitle>
            <CardDescription>
              通过手机号或邮箱验证身份，重新设置密码
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="phone">手机号找回</TabsTrigger>
                <TabsTrigger value="email">邮箱找回</TabsTrigger>
              </TabsList>
              
              {/* 手机号找回 */}
              <TabsContent value="phone" className="space-y-4">
                {step === 'input' && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="phone">手机号</Label>
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
                    
                    <Button
                      onClick={() => sendCode('phone')}
                      disabled={countdown > 0}
                      className="w-full"
                    >
                      {countdown > 0 ? `${countdown}秒后重发` : '发送验证码'}
                    </Button>
                  </div>
                )}
                
                {step === 'verify' && (
                  <div className="space-y-4">
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
                          {countdown > 0 ? `${countdown}s` : '重发'}
                        </Button>
                      </div>
                    </div>
                    
                    <Button
                      onClick={() => verifyCode('phone')}
                      className="w-full"
                    >
                      验证验证码
                    </Button>
                  </div>
                )}
                
                {step === 'reset' && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="phone-new-password">新密码</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="phone-new-password"
                          type="password"
                          placeholder="请输入新密码"
                          value={phoneForm.newPassword}
                          onChange={(e) => handlePhoneFormChange('newPassword', e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="phone-confirm-password">确认新密码</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="phone-confirm-password"
                          type="password"
                          placeholder="请再次输入新密码"
                          value={phoneForm.confirmPassword}
                          onChange={(e) => handlePhoneFormChange('confirmPassword', e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>
                    
                    <Button
                      onClick={() => resetPassword('phone')}
                      disabled={isLoading}
                      className="w-full"
                    >
                      {isLoading ? "重置中..." : "重置密码"}
                    </Button>
                  </div>
                )}
              </TabsContent>
              
              {/* 邮箱找回 */}
              <TabsContent value="email" className="space-y-4">
                {step === 'input' && (
                  <div className="space-y-4">
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
                    
                    <Button
                      onClick={() => sendCode('email')}
                      disabled={countdown > 0}
                      className="w-full"
                    >
                      {countdown > 0 ? `${countdown}秒后重发` : '发送验证码'}
                    </Button>
                  </div>
                )}
                
                {step === 'verify' && (
                  <div className="space-y-4">
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
                          {countdown > 0 ? `${countdown}s` : '重发'}
                        </Button>
                      </div>
                    </div>
                    
                    <Button
                      onClick={() => verifyCode('email')}
                      className="w-full"
                    >
                      验证验证码
                    </Button>
                  </div>
                )}
                
                {step === 'reset' && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email-new-password">新密码</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="email-new-password"
                          type="password"
                          placeholder="请输入新密码"
                          value={emailForm.newPassword}
                          onChange={(e) => handleEmailFormChange('newPassword', e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="email-confirm-password">确认新密码</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="email-confirm-password"
                          type="password"
                          placeholder="请再次输入新密码"
                          value={emailForm.confirmPassword}
                          onChange={(e) => handleEmailFormChange('confirmPassword', e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>
                    
                    <Button
                      onClick={() => resetPassword('email')}
                      disabled={isLoading}
                      className="w-full"
                    >
                      {isLoading ? "重置中..." : "重置密码"}
                    </Button>
                  </div>
                )}
              </TabsContent>
            </Tabs>
            
            {/* 返回登录链接 */}
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                想起密码了？
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