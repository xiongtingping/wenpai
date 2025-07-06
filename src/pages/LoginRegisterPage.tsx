import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Mail, Lock, Phone, User } from "lucide-react";
import { AuthenticationClient } from "authing-js-sdk";
import { getAuthingConfig } from "@/config/authing";

/**
 * 登录/注册二合一页面
 * 简洁明了的UI设计
 */
export default function LoginRegisterPage() {
  const [activeTab, setActiveTab] = useState("login");
  const [isLoading, setIsLoading] = useState(false);
  const { setUser } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  // 初始化 Authing 客户端
  const authingConfig = getAuthingConfig();
  const authing = new AuthenticationClient({
    appId: authingConfig.appId,
    appHost: authingConfig.host,
    onError: (code, message, data) => {
      console.error('Authing error:', code, message, data);
      toast({
        title: "认证错误",
        description: message,
        variant: "destructive"
      });
    }
  });

  // 登录表单状态
  const [loginForm, setLoginForm] = useState({
    email: '',
    password: ''
  });

  // 注册表单状态
  const [registerForm, setRegisterForm] = useState({
    nickname: '',
    email: '',
    password: '',
    confirmPassword: '',
    code: ''
  });

  // 验证码状态
  const [isSendingCode, setIsSendingCode] = useState(false);
  const [countdown, setCountdown] = useState(0);

  // 发送验证码
  const handleSendCode = async () => {
    if (!registerForm.email) {
      toast({
        title: "请输入邮箱",
        description: "请先输入邮箱地址",
        variant: "destructive"
      });
      return;
    }
    setIsSendingCode(true);
    try {
      await authing.sendEmailCode(registerForm.email);
      setCountdown(60);
      toast({
        title: "验证码已发送",
        description: "请查看您的邮箱",
      });
    } catch (error: any) {
      toast({
        title: "发送失败",
        description: error.message || "验证码发送失败，请重试",
        variant: "destructive"
      });
    } finally {
      setIsSendingCode(false);
    }
  };

  // 倒计时处理
  React.useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  // 登录处理
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginForm.email || !loginForm.password) {
      toast({ title: "请填写完整信息", variant: "destructive" });
      return;
    }
    setIsLoading(true);
    try {
      const user = await authing.loginByEmail(loginForm.email, loginForm.password);
      localStorage.setItem('authing_user', JSON.stringify(user));
      setUser(user);
      toast({ title: "登录成功", description: "欢迎回来！" });
      setTimeout(() => navigate('/'), 800);
    } catch (error: any) {
      toast({ title: "登录失败", description: error.message || '请检查邮箱和密码', variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  // 注册处理
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!registerForm.email || !registerForm.password || !registerForm.nickname || !registerForm.code) {
      toast({ title: "请填写完整信息", variant: "destructive" });
      return;
    }
    if (registerForm.password !== registerForm.confirmPassword) {
      toast({ title: "两次密码不一致", variant: "destructive" });
      return;
    }
    setIsLoading(true);
    try {
      const user = await authing.registerByEmailCode(
        registerForm.email, 
        registerForm.code, 
        registerForm.password, 
        { nickname: registerForm.nickname }
      );
      localStorage.setItem('authing_user', JSON.stringify(user));
      setUser(user);
      toast({ title: "注册成功", description: "欢迎加入文派！" });
      setTimeout(() => navigate('/'), 800);
    } catch (error: any) {
      toast({ title: "注册失败", description: error.message || '请检查输入信息', variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  // 返回首页
  const handleBack = () => navigate('/');

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <Button variant="ghost" onClick={handleBack} className="mb-6 flex items-center gap-2 text-gray-600 hover:text-gray-800">
          <ArrowLeft className="h-4 w-4" /> 返回首页
        </Button>
        
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">欢迎使用文派</h1>
          <p className="text-gray-600">登录或注册您的账户</p>
        </div>

        <Card className="shadow-lg">
          <CardContent className="p-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="login">登录</TabsTrigger>
                <TabsTrigger value="register">注册</TabsTrigger>
              </TabsList>

              {/* 登录表单 */}
              <TabsContent value="login" className="space-y-4">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email">邮箱</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input 
                        id="login-email" 
                        type="email" 
                        value={loginForm.email} 
                        onChange={e => setLoginForm(f => ({ ...f, email: e.target.value }))} 
                        placeholder="请输入邮箱" 
                        className="pl-10"
                        required 
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="login-password">密码</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input 
                        id="login-password" 
                        type="password" 
                        value={loginForm.password} 
                        onChange={e => setLoginForm(f => ({ ...f, password: e.target.value }))} 
                        placeholder="请输入密码" 
                        className="pl-10"
                        required 
                      />
                    </div>
                  </div>

                  <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={isLoading}>
                    {isLoading ? "登录中..." : "登录"}
                  </Button>
                </form>
              </TabsContent>

              {/* 注册表单 */}
              <TabsContent value="register" className="space-y-4">
                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="register-nickname">昵称</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input 
                        id="register-nickname" 
                        value={registerForm.nickname} 
                        onChange={e => setRegisterForm(f => ({ ...f, nickname: e.target.value }))} 
                        placeholder="请输入昵称" 
                        className="pl-10"
                        required 
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="register-email">邮箱</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input 
                        id="register-email" 
                        type="email" 
                        value={registerForm.email} 
                        onChange={e => setRegisterForm(f => ({ ...f, email: e.target.value }))} 
                        placeholder="请输入邮箱" 
                        className="pl-10"
                        required 
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="register-code">验证码</Label>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input 
                          id="register-code" 
                          value={registerForm.code} 
                          onChange={e => setRegisterForm(f => ({ ...f, code: e.target.value }))} 
                          placeholder="请输入验证码" 
                          className="pl-10"
                          required 
                        />
                      </div>
                      <Button 
                        type="button" 
                        variant="outline" 
                        disabled={isSendingCode || countdown > 0} 
                        onClick={handleSendCode}
                        className="w-24"
                      >
                        {isSendingCode ? "发送中..." : countdown > 0 ? `${countdown}s` : "发送"}
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="register-password">密码</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input 
                        id="register-password" 
                        type="password" 
                        value={registerForm.password} 
                        onChange={e => setRegisterForm(f => ({ ...f, password: e.target.value }))} 
                        placeholder="请设置密码" 
                        className="pl-10"
                        required 
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="register-confirm-password">确认密码</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input 
                        id="register-confirm-password" 
                        type="password" 
                        value={registerForm.confirmPassword} 
                        onChange={e => setRegisterForm(f => ({ ...f, confirmPassword: e.target.value }))} 
                        placeholder="请再次输入密码" 
                        className="pl-10"
                        required 
                      />
                    </div>
                  </div>

                  <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-700" disabled={isLoading}>
                    {isLoading ? "注册中..." : "注册"}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <div className="mt-6 text-center text-sm text-gray-500">
          <p>使用第三方账户快速登录/注册</p>
          <p className="mt-1">支持微信、QQ、微博等主流平台</p>
        </div>
      </div>
    </div>
  );
}