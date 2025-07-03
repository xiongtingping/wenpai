import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Lock, Mail, Phone, User, Shield, Loader2 } from "lucide-react";
import { sendVerificationCode, verifyCode, registerUser } from "@/api/authService";

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    password: "",
    confirmPassword: ""
  });
  
  const [verificationData, setVerificationData] = useState({
    verificationId: "",
    verificationCode: "",
    verified: false
  });
  
  const [loading, setLoading] = useState({
    sendingCode: false,
    verifyingCode: false,
    registering: false,
    countdown: 0
  });
  
  const { toast } = useToast();

  // Countdown timer for SMS code resend
  useEffect(() => {
    if (loading.countdown > 0) {
      const timer = setTimeout(() => {
        setLoading(prev => ({ ...prev, countdown: prev.countdown - 1 }));
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [loading.countdown]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleVerificationCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setVerificationData(prev => ({ ...prev, verificationCode: e.target.value }));
  };

  const handleSendCode = async () => {
    // Check if phone number is valid
    if (!formData.phone || formData.phone.length < 10) {
      toast({
        title: "手机号无效",
        description: "请输入正确的手机号码",
        variant: "destructive"
      });
      return;
    }
    
    setLoading(prev => ({ ...prev, sendingCode: true }));
    
    try {
      const result = await sendVerificationCode(formData.phone);
      
      if (result.success) {
        toast({
          title: "验证码已发送",
          description: "请查看您的手机短信"
        });
        
        // Store verification ID and start countdown
        setVerificationData(prev => ({ 
          ...prev, 
          verificationId: result.verificationId || "" 
        }));
        
        setLoading(prev => ({ 
          ...prev, 
          sendingCode: false,
          countdown: 60 // 60 second countdown for resend
        }));
      } else {
        toast({
          title: "发送失败",
          description: result.message,
          variant: "destructive"
        });
        setLoading(prev => ({ ...prev, sendingCode: false }));
      }
    } catch {
      toast({
        title: "发送失败",
        description: "短信验证码发送失败，请稍后重试",
        variant: "destructive"
      });
      setLoading(prev => ({ ...prev, sendingCode: false }));
    }
  };

  const handleVerifyCode = async () => {
    // Check if verification code is valid
    if (!verificationData.verificationCode || verificationData.verificationCode.length !== 6) {
      toast({
        title: "验证码无效",
        description: "请输入6位数字验证码",
        variant: "destructive"
      });
      return;
    }
    
    setLoading(prev => ({ ...prev, verifyingCode: true }));
    
    try {
      const result = await verifyCode(
        verificationData.verificationId, 
        verificationData.verificationCode
      );
      
      if (result.success) {
        toast({
          title: "验证成功",
          description: "手机号验证成功"
        });
        
        setVerificationData(prev => ({ ...prev, verified: true }));
        setLoading(prev => ({ ...prev, verifyingCode: false }));
      } else {
        toast({
          title: "验证失败",
          description: result.message,
          variant: "destructive"
        });
        setLoading(prev => ({ ...prev, verifyingCode: false }));
      }
    } catch {
      toast({
        title: "验证失败",
        description: "验证码验证失败，请稍后重试",
        variant: "destructive"
      });
      setLoading(prev => ({ ...prev, verifyingCode: false }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Simple validation
    if (!formData.name || !formData.phone || !formData.email || !formData.password || !formData.confirmPassword) {
      toast({
        title: "信息不完整",
        description: "请填写所有必填字段",
        variant: "destructive"
      });
      return;
    }
    
    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "密码不匹配",
        description: "请确保两次输入的密码一致",
        variant: "destructive"
      });
      return;
    }
    
    // Verify phone if not already verified
    if (!verificationData.verified) {
      toast({
        title: "手机未验证",
        description: "请先验证您的手机号",
        variant: "destructive"
      });
      return;
    }
    
    // Start registration process
    setLoading(prev => ({ ...prev, registering: true }));
    
    try {
      const result = await registerUser({
        name: formData.name,
        phone: formData.phone,
        email: formData.email,
        password: formData.password,
        verificationId: verificationData.verificationId
      });
      
      if (result.success) {
        toast({
          title: "注册成功",
          description: "正在为您跳转到支付页面...",
        });
        
        // Store user data in localStorage or state management system
        if (result.token && result.user) {
          localStorage.setItem('authToken', result.token);
          localStorage.setItem('user', JSON.stringify(result.user));
        }
        
        // Redirect to payment page
        setTimeout(() => {
          window.location.href = "/payment";
        }, 1500);
      } else {
        toast({
          title: "注册失败",
          description: result.message,
          variant: "destructive"
        });
        setLoading(prev => ({ ...prev, registering: false }));
      }
    } catch {
      toast({
        title: "注册失败",
        description: "注册过程中发生错误，请稍后重试",
        variant: "destructive"
      });
      setLoading(prev => ({ ...prev, registering: false }));
    }
  };

  return (
    <div className="container mx-auto py-16 px-4">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold">创建您的文派账户</h1>
          <p className="mt-2 text-muted-foreground">一个账户解锁全平台内容适配</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>注册账户</CardTitle>
            <CardDescription>
              填写以下信息完成注册
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">姓名</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="name"
                    name="name"
                    placeholder="请输入您的姓名"
                    className="pl-10"
                    value={formData.name}
                    onChange={handleChange}
                    disabled={loading.registering}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">手机号</Label>
                <div className="relative flex space-x-2">
                  <div className="relative flex-1">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="phone"
                      name="phone"
                      placeholder="请输入您的手机号"
                      className="pl-10"
                      value={formData.phone}
                      onChange={handleChange}
                      disabled={verificationData.verified || loading.sendingCode || loading.registering}
                    />
                  </div>
                  <Button 
                    type="button"
                    variant="outline"
                    className="w-32"
                    disabled={loading.countdown > 0 || verificationData.verified || loading.registering}
                    onClick={handleSendCode}
                  >
                    {loading.sendingCode ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : loading.countdown > 0 ? (
                      `${loading.countdown}秒后重发`
                    ) : verificationData.verified ? (
                      "已验证"
                    ) : (
                      "获取验证码"
                    )}
                  </Button>
                </div>
              </div>

              {(verificationData.verificationId && !verificationData.verified) && (
                <div className="space-y-2">
                  <Label htmlFor="verificationCode">短信验证码</Label>
                  <div className="relative flex space-x-2">
                    <div className="relative flex-1">
                      <Shield className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="verificationCode"
                        name="verificationCode"
                        placeholder="请输入6位验证码"
                        className="pl-10"
                        value={verificationData.verificationCode}
                        onChange={handleVerificationCodeChange}
                        maxLength={6}
                      />
                    </div>
                    <Button 
                      type="button"
                      variant="outline"
                      className="w-24"
                      disabled={loading.verifyingCode || !verificationData.verificationCode}
                      onClick={handleVerifyCode}
                    >
                      {loading.verifyingCode ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        "验证"
                      )}
                    </Button>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">邮箱</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="请输入您的邮箱"
                    className="pl-10"
                    value={formData.email}
                    onChange={handleChange}
                    disabled={loading.registering}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">密码</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="请设置您的密码"
                    className="pl-10"
                    value={formData.password}
                    onChange={handleChange}
                    disabled={loading.registering}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">确认密码</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    placeholder="请再次输入密码"
                    className="pl-10"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    disabled={loading.registering}
                  />
                </div>
              </div>
              
              {verificationData.verified && (
                <div className="rounded-md bg-green-50 p-4 border border-green-200">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <Shield className="h-5 w-5 text-green-400" aria-hidden="true" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-green-800">
                        手机号验证成功
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600"
                disabled={loading.registering || !verificationData.verified}
              >
                {loading.registering ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> 注册中...</>
                ) : (
                  "注册并继续"
                )}
              </Button>
            </CardFooter>
          </form>
        </Card>
        
        <div className="mt-6 text-center text-sm">
          <p className="text-muted-foreground">
            已有账户？
            <a href="/login" className="text-blue-500 hover:underline ml-1">
              登录
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}