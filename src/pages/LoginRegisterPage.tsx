import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Lock, Mail, Phone, User, Shield, Loader2, ArrowLeft } from "lucide-react";
// import { sendVerificationCode, verifyCode, registerUser } from "@/api/authService";
import { useLocation } from "react-router-dom";
import { useUserStore } from "@/store/userStore";

export default function LoginRegisterPage() {
  // Login state
  const [loginData, setLoginData] = useState({
    username: "",
    password: "",
  });
  
  const [rememberPassword, setRememberPassword] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  
  // Register state
  const [formData, setFormData] = useState({
    phone: "",
    email: "",
    password: "",
    confirmPassword: "",
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
  // 移除 userStore 的 login 方法，使用新的认证上下文
  // const navigate = useNavigate();
  
  // Check if we should show registration form based on URL params
  const location = useLocation();
  const showRegistration = location.pathname === "/register";

  // Load saved credentials on component mount
  useEffect(() => {
    if (!showRegistration) {
      const savedCredentials = localStorage.getItem('savedCredentials');
      if (savedCredentials) {
        try {
          const { username, password } = JSON.parse(savedCredentials);
          setLoginData({ username, password });
          setRememberPassword(true);
        } catch (error) {
          console.error('Failed to load saved credentials:', error);
        }
      }
    }
  }, [showRegistration]);

  // Countdown timer for SMS code resend
  useEffect(() => {
    if (loading.countdown > 0) {
      const timer = setTimeout(() => {
        setLoading(prev => ({ ...prev, countdown: prev.countdown - 1 }));
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [loading.countdown]);

  const handleLoginChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setLoginData(prev => ({ ...prev, [name]: value }));
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Simple validation
    if (!loginData.username || !loginData.password) {
      toast({
        title: "信息不完整",
        description: "请填写用户名和密码",
        variant: "destructive"
      });
      return;
    }
    
    setLoginLoading(true);
    
    // Save credentials if remember password is checked
    if (rememberPassword) {
      localStorage.setItem('savedCredentials', JSON.stringify(loginData));
    } else {
      localStorage.removeItem('savedCredentials');
    }
    
    // Simulate login process
    setTimeout(() => {
      // 简化处理，直接跳转
      
      toast({
        title: "登录成功",
        description: "欢迎回到文派平台"
      });
      
      // Redirect to adapt page
      setTimeout(() => {
        window.location.href = "/adapt";
      }, 1000);
      
      setLoginLoading(false);
    }, 1500);
  };

  const handleWechatLogin = () => {
    toast({
      title: "微信登录",
      description: "正在跳转到微信授权页面...",
    });
    
    // In a real app, this would redirect to the WeChat OAuth page
    setTimeout(() => {
      toast({
        title: "微信登录演示",
        description: "实际应用中将跳转到微信授权"
      });
    }, 1500);
  };

  const handleRegisterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleVerificationCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setVerificationData(prev => ({ ...prev, verificationCode: e.target.value }));
  };

  const handleSendCode = async () => {
    // Check if phone number is valid
    if (!formData.phone || formData.phone.length < 11) {
      toast({
        title: "手机号无效",
        description: "请输入正确的手机号码",
        variant: "destructive"
      });
      return;
    }
    
    setLoading(prev => ({ ...prev, sendingCode: true }));
    
    try {
      // For demo purposes, simulate API call
      setTimeout(() => {
        toast({
          title: "验证码已发送",
          description: "请查看您的手机短信"
        });
        
        // Store verification ID and start countdown
        setVerificationData(prev => ({ 
          ...prev, 
          verificationId: "mock-verification-id-123456"
        }));
        
        setLoading(prev => ({ 
          ...prev, 
          sendingCode: false,
          countdown: 60 // 60 second countdown for resend
        }));
      }, 1000);
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
    
    // For demo purposes, simulate API call
    setTimeout(() => {
      // Accept any 6-digit code for demo
      if (verificationData.verificationCode.length === 6) {
        toast({
          title: "验证成功",
          description: "手机号验证成功"
        });
        
        setVerificationData(prev => ({ ...prev, verified: true }));
      } else {
        toast({
          title: "验证失败",
          description: "验证码错误",
          variant: "destructive"
        });
      }
      
      setLoading(prev => ({ ...prev, verifyingCode: false }));
    }, 1000);
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Simple validation
    if (!formData.phone || !formData.email || !formData.password || !formData.confirmPassword) {
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
    
    // For demo purposes, simulate API call
    setTimeout(() => {
      // 简化处理，直接跳转
      
      toast({
        title: "注册成功",
        description: "正在为您跳转到内容适配页面...",
      });
      
      // Redirect to adapt page instead of payment page
      setTimeout(() => {
        window.location.href = "/adapt";
      }, 1500);
      
      setLoading(prev => ({ ...prev, registering: false }));
    }, 1500);
  };

  return (
    <div className="container mx-auto py-16 px-4 relative">
      {/* Back to Home button */}
      <div className="absolute left-4 top-6 md:left-8 md:top-8">
        <Link to="/">
          <Button variant="ghost" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            返回主页
          </Button>
        </Link>
      </div>
      
      <div className="max-w-md mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold">欢迎使用文派</h1>
          <p className="mt-2 text-muted-foreground">一个账户解锁全平台内容适配</p>
        </div>

        {/* Show Login Form or Register Form based on route */}
        {!showRegistration ? (
          <>
            {/* Login Form */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>登录账户</CardTitle>
                <CardDescription>
                  输入您的账户信息登录
                </CardDescription>
              </CardHeader>
              <form onSubmit={handleLoginSubmit}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="username">手机号/邮箱</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="username"
                        name="username"
                        placeholder="请输入手机号/邮箱"
                        className="pl-10"
                        value={loginData.username}
                        onChange={handleLoginChange}
                        disabled={loginLoading}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password">密码</Label>
                      <a href="#" className="text-xs text-blue-600 hover:underline">
                        忘记密码?
                      </a>
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="password"
                        name="password"
                        type="password"
                        placeholder="请输入密码"
                        className="pl-10"
                        value={loginData.password}
                        onChange={handleLoginChange}
                        disabled={loginLoading}
                      />
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="rememberPassword"
                      checked={rememberPassword}
                      onCheckedChange={(checked) => {
                        setRememberPassword(checked as boolean);
                      }}
                    />
                    <Label htmlFor="rememberPassword" className="text-sm">记住密码</Label>
                  </div>
                </CardContent>
                <CardFooter className="flex-col space-y-4">
                  <Button 
                    type="submit" 
                    className="w-full bg-gradient-to-r from-blue-500 to-purple-600"
                    disabled={loginLoading}
                  >
                    {loginLoading ? (
                      <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> 登录中...</>
                    ) : (
                      "登录"
                    )}
                  </Button>
                  
                  <div className="relative w-full">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-card px-2 text-muted-foreground">
                        或使用以下方式登录
                      </span>
                    </div>
                  </div>
                  
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full bg-[#07C160] hover:bg-[#07C160]/90 text-white border-0"
                    onClick={handleWechatLogin}
                  >
                    <svg viewBox="0 0 24 24" className="h-5 w-5 mr-2" aria-hidden="true">
                      <path
                        fill="currentColor"
                        d="M8.691 2.188C3.891 2.188 0 5.476 0 9.53c0 2.212 1.17 4.203 3.002 5.55a.59.59 0 0 1 .213.665l-.39 1.48c-.019.07-.048.141-.048.213 0 .163.13.295.29.295a.328.328 0 0 0 .165-.054l1.9-1.106a.585.585 0 0 1 .449-.072c.78.203 1.57.305 2.38.305.153 0 .305-.003.458-.01-.357-1.088-.547-2.22-.546-3.365 0-3.809 3.592-6.894 8.017-6.894.147 0 .292.008.439.016-.88-2.287-3.56-4.364-7.628-4.364m-2.13 4.816c.635 0 1.152.525 1.152 1.17 0 .648-.517 1.173-1.153 1.173-.639 0-1.156-.525-1.156-1.173 0-.645.517-1.17 1.156-1.17m4.254 0c.639 0 1.156.525 1.156 1.17 0 .648-.517 1.173-1.156 1.173-.636 0-1.153-.525-1.153-1.173 0-.645.517-1.17 1.153-1.17M24 14.192c0-3.36-3.358-6.087-7.488-6.087-4.126 0-7.488 2.727-7.488 6.087 0 3.367 3.362 6.09 7.488 6.09.876 0 1.687-.145 2.418-.405a.64.64 0 0 1 .418.055l1.664.88c.05.03.104.05.158.05.166 0 .3-.14.3-.305 0-.065-.027-.141-.047-.206l-.375-1.4a.551.551 0 0 1 .214-.637A6.212 6.212 0 0 0 24 14.192m-9.93-1.3c-.508 0-.919-.419-.919-.934 0-.512.41-.934.92-.934.51 0 .923.422.923.934 0 .515-.413.934-.923.934m4.968 0c-.508 0-.919-.419-.919-.934 0-.512.41-.934.919-.934.51 0 .924.422.924.934 0 .515-.414.934-.924.934"
                      />
                    </svg>
                    微信登录
                  </Button>
                </CardFooter>
              </form>
            </Card>
            
            {/* Register Link - Now navigates to /register */}
            <div className="text-center mb-6">
              <p className="text-muted-foreground">
                还没有账号? 
                <Link to="/register">
                  <Button 
                    variant="link" 
                    className="p-0 h-auto ml-1 text-blue-600" 
                  >
                    立即注册
                  </Button>
                </Link>
              </p>
            </div>
          </>
        ) : (
          /* Registration Form */
          <Card>
            <CardHeader>
              <CardTitle>注册账户</CardTitle>
              <CardDescription>
                填写以下信息完成注册
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleRegisterSubmit}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">
                    手机号 <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative flex space-x-2">
                    <div className="relative flex-1">
                      <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="phone"
                        name="phone"
                        placeholder="请输入您的手机号"
                        className="pl-10"
                        value={formData.phone}
                        onChange={handleRegisterChange}
                        required
                        disabled={verificationData.verified || loading.sendingCode || loading.registering}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label htmlFor="verificationCode">
                      短信验证码 <span className="text-red-500">*</span>
                    </Label>
                    <Button 
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-8"
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
                        required
                        disabled={verificationData.verified || loading.registering}
                      />
                    </div>
                    <Button 
                      type="button"
                      variant="outline"
                      className="w-24"
                      disabled={loading.verifyingCode || !verificationData.verificationCode || verificationData.verified}
                      onClick={handleVerifyCode}
                    >
                      {loading.verifyingCode ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : verificationData.verified ? (
                        "已验证"
                      ) : (
                        "验证"
                      )}
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">
                    邮箱 <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="请输入您的邮箱"
                      className="pl-10"
                      value={formData.email}
                      onChange={handleRegisterChange}
                      required
                      disabled={loading.registering}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">
                    密码 <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      placeholder="请设置您的密码"
                      className="pl-10"
                      value={formData.password}
                      onChange={handleRegisterChange}
                      required
                      disabled={loading.registering}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">
                    确认密码 <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      placeholder="请再次输入密码"
                      className="pl-10"
                      value={formData.confirmPassword}
                      onChange={handleRegisterChange}
                      required
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
              <CardFooter className="flex-col space-y-4">
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

                <div className="relative w-full">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground">
                      或使用微信快速注册
                    </span>
                  </div>
                </div>
                
                <Button
                  type="button"
                  variant="outline"
                  className="w-full bg-[#07C160] hover:bg-[#07C160]/90 text-white border-0"
                  onClick={handleWechatLogin}
                >
                  <svg viewBox="0 0 24 24" className="h-5 w-5 mr-2" aria-hidden="true">
                    <path
                      fill="currentColor"
                      d="M8.691 2.188C3.891 2.188 0 5.476 0 9.53c0 2.212 1.17 4.203 3.002 5.55a.59.59 0 0 1 .213.665l-.39 1.48c-.019.07-.048.141-.048.213 0 .163.13.295.29.295a.328.328 0 0 0 .165-.054l1.9-1.106a.585.585 0 0 1 .449-.072c.78.203 1.57.305 2.38.305.153 0 .305-.003.458-.01-.357-1.088-.547-2.22-.546-3.365 0-3.809 3.592-6.894 8.017-6.894.147 0 .292.008.439.016-.88-2.287-3.56-4.364-7.628-4.364m-2.13 4.816c.635 0 1.152.525 1.152 1.17 0 .648-.517 1.173-1.153 1.173-.639 0-1.156-.525-1.156-1.173 0-.645.517-1.17 1.156-1.17m4.254 0c.639 0 1.156.525 1.156 1.17 0 .648-.517 1.173-1.156 1.173-.636 0-1.153-.525-1.153-1.173 0-.645.517-1.17 1.153-1.17M24 14.192c0-3.36-3.358-6.087-7.488-6.087-4.126 0-7.488 2.727-7.488 6.087 0 3.367 3.362 6.09 7.488 6.09.876 0 1.687-.145 2.418-.405a.64.64 0 0 1 .418.055l1.664.88c.05.03.104.05.158.05.166 0 .3-.14.3-.305 0-.065-.027-.141-.047-.206l-.375-1.4a.551.551 0 0 1 .214-.637A6.212 6.212 0 0 0 24 14.192m-9.93-1.3c-.508 0-.919-.419-.919-.934 0-.512.41-.934.92-.934.51 0 .923.422.923.934 0 .515-.413.934-.923.934m4.968 0c-.508 0-.919-.419-.919-.934 0-.512.41-.934.919-.934.51 0 .924.422.924.934 0 .515-.414.934-.924.934"
                    />
                  </svg>
                  微信注册并绑定
                </Button>

                <div className="text-center mt-4">
                  <p className="text-muted-foreground">
                    已有账户?
                    <Link to="/login-register" className="text-blue-600 hover:text-blue-700 hover:underline ml-1">
                        立即登录
                    </Link>
                  </p>
                </div>
              </CardFooter>
            </form>
          </Card>
        )}
      </div>
    </div>
  );
}