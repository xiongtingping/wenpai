/**
 * ✅ FIXED: 2024-07-21 已统一登录方式为 Authing SDK，移除自定义表单登录
 * 📌 请勿再添加本地表单登录逻辑，所有登录注册均走 Authing
 * 🔒 LOCKED: AI 禁止对此登录逻辑做任何本地表单扩展
 */

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useUnifiedAuth } from "@/contexts/UnifiedAuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { AlertCircle, Mail, Phone, Lock, User, ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

/**
 * 登录页面组件
 */
export default function LoginPage() {
  const navigate = useNavigate();
  const { 
    login, 
    loginWithPassword, 
    loginWithEmailCode, 
    loginWithPhoneCode,
    sendVerificationCode,
    loading, 
    error 
  } = useUnifiedAuth();
  const { toast } = useToast();

  // 登录方式状态
  const [loginMethod, setLoginMethod] = useState<'password' | 'email' | 'phone'>('password');
  
  // 密码登录状态
  const [passwordForm, setPasswordForm] = useState({
    username: '',
    password: ''
  });

  // 邮箱验证码登录状态
  const [emailForm, setEmailForm] = useState({
    email: '',
    code: ''
  });
  const [emailCodeSent, setEmailCodeSent] = useState(false);
  const [emailCodeCountdown, setEmailCodeCountdown] = useState(0);

  // 手机验证码登录状态
  const [phoneForm, setPhoneForm] = useState({
    phone: '',
    code: ''
  });
  const [phoneCodeSent, setPhoneCodeSent] = useState(false);
  const [phoneCodeCountdown, setPhoneCodeCountdown] = useState(0);

  /**
   * 处理密码登录
   */
  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordForm.username || !passwordForm.password) {
      toast({
        title: "输入错误",
        description: "请输入用户名和密码",
        variant: "destructive"
      });
      return;
    }

    try {
      await loginWithPassword(passwordForm.username, passwordForm.password);
      toast({
        title: "登录成功",
        description: "欢迎回来！",
      });
      navigate('/');
    } catch (error) {
      // 错误已在 AuthContext 中处理
    }
  };

  /**
   * 处理邮箱验证码登录
   */
  const handleEmailCodeLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailForm.email || !emailForm.code) {
      toast({
        title: "输入错误",
        description: "请输入邮箱和验证码",
        variant: "destructive"
      });
      return;
    }

    try {
      await loginWithEmailCode(emailForm.email, emailForm.code);
      toast({
        title: "登录成功",
        description: "欢迎回来！",
      });
      navigate('/');
    } catch (error) {
      // 错误已在 AuthContext 中处理
    }
  };

  /**
   * 处理手机验证码登录
   */
  const handlePhoneCodeLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneForm.phone || !phoneForm.code) {
      toast({
        title: "输入错误",
        description: "请输入手机号和验证码",
        variant: "destructive"
      });
      return;
    }

    try {
      await loginWithPhoneCode(phoneForm.phone, phoneForm.code);
      toast({
        title: "登录成功",
        description: "欢迎回来！",
      });
      navigate('/');
    } catch (error) {
      // 错误已在 AuthContext 中处理
    }
  };

  /**
   * 发送邮箱验证码
   */
  const sendEmailCode = async () => {
    if (!emailForm.email) {
      toast({
        title: "输入错误",
        description: "请输入邮箱地址",
        variant: "destructive"
      });
      return;
    }

    try {
      await sendVerificationCode(emailForm.email, 'login');
      setEmailCodeSent(true);
      setEmailCodeCountdown(60);
      
      const timer = setInterval(() => {
        setEmailCodeCountdown(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      toast({
        title: "验证码已发送",
        description: "请查看邮箱并输入验证码",
      });
    } catch (error) {
      toast({
        title: "发送失败",
        description: "验证码发送失败，请重试",
        variant: "destructive"
      });
    }
  };

  /**
   * 发送手机验证码
   */
  const sendPhoneCode = async () => {
    if (!phoneForm.phone) {
      toast({
        title: "输入错误",
        description: "请输入手机号",
        variant: "destructive"
      });
      return;
    }

    try {
      // 这里需要调用手机验证码发送接口
      // await sendPhoneVerificationCode(phoneForm.phone, 'login');
      setPhoneCodeSent(true);
      setPhoneCodeCountdown(60);
      
      const timer = setInterval(() => {
        setPhoneCodeCountdown(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      toast({
        title: "验证码已发送",
        description: "请查看短信并输入验证码",
      });
    } catch (error) {
      toast({
        title: "发送失败",
        description: "验证码发送失败，请重试",
        variant: "destructive"
      });
    }
  };

  /**
   * 使用 Authing 统一登录
   */
  const handleAuthingLogin = async () => {
    try {
      await login();
    } catch (error) {
      toast({
        title: "登录失败",
        description: "登录过程中出现错误",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* 返回按钮 */}
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            返回
          </Button>
        </div>

        {/* 登录卡片 */}
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">登录文派</CardTitle>
            <CardDescription>
              统一认证系统：请使用 Authing 统一登录
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* 统一登录按钮 */}
            <div className="space-y-4">
              <Button 
                onClick={handleAuthingLogin} 
                className="w-full" 
                variant="outline"
                disabled={loading}
              >
                使用 Authing 统一登录
              </Button>
              <div className="text-center text-sm text-gray-600">
                还没有账号？{' '}
                <Link to="/register" className="text-blue-600 hover:text-blue-500">
                  立即注册
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 