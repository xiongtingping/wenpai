/**
 * Authing 功能测试页面
 * 用于测试 Authing 的各种认证功能
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Mail, Lock, User, Phone, Key } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { User as AuthUser } from '@/contexts/AuthContext';
import { AuthenticationClient } from "authing-js-sdk";
import { getAuthingConfig } from "@/config/authing";

/**
 * Authing 功能测试页面
 * 用于测试 Authing 的各种认证功能
 */
export default function AuthingTestPage() {
  const [isLoading, setIsLoading] = useState(false);
  const { user, isAuthenticated, logout, setUser } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  // 测试表单状态
  const [testForm, setTestForm] = useState({
    email: 'test@example.com',
    password: 'password123',
    phone: '13800138000'
  });

  // 初始化 Authing 客户端
  const authingConfig = getAuthingConfig();
  const authing = new AuthenticationClient({
    appId: authingConfig.appId,
    appHost: authingConfig.host,
    onError: (code, message) => {
      console.error('Authing error:', code, message);
      toast({
        title: "Authing 错误",
        description: message,
        variant: "destructive"
      });
    }
  });

  /**
   * 测试邮箱密码登录
   */
  const testEmailLogin = async () => {
    setIsLoading(true);
    try {
      const authingUser = await authing.loginByEmail(testForm.email, testForm.password);
      localStorage.setItem('authing_user', JSON.stringify(authingUser));
      
      // 转换为内部User类型
      const convertedUser: AuthUser = {
        id: String(authingUser.id || ''),
        username: String(authingUser.username || authingUser.nickname || ''),
        email: String(authingUser.email || ''),
        phone: String(authingUser.phone || ''),
        nickname: String(authingUser.nickname || authingUser.username || ''),
        avatar: String(authingUser.photo || ''),
        ...((authingUser as unknown) as Record<string, unknown>)
      };
      
      setUser(convertedUser);
      toast({
        title: "登录成功",
        description: `用户: ${convertedUser.nickname || convertedUser.username || convertedUser.email}`,
      });
    } catch (error: any) {
      toast({
        title: "登录失败",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * 测试手机号密码登录
   */
  const testPhoneLogin = async () => {
    setIsLoading(true);
    try {
      const authingUser = await authing.loginByPhonePassword(testForm.phone, testForm.password);
      localStorage.setItem('authing_user', JSON.stringify(authingUser));
      
      // 转换为内部User类型
      const convertedUser: AuthUser = {
        id: String(authingUser.id || ''),
        username: String(authingUser.username || authingUser.nickname || ''),
        email: String(authingUser.email || ''),
        phone: String(authingUser.phone || ''),
        nickname: String(authingUser.nickname || authingUser.username || ''),
        avatar: String(authingUser.photo || ''),
        ...((authingUser as unknown) as Record<string, unknown>)
      };
      
      setUser(convertedUser);
      toast({
        title: "登录成功",
        description: `用户: ${convertedUser.nickname || convertedUser.username || convertedUser.phone}`,
      });
    } catch (error: any) {
      toast({
        title: "登录失败",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * 测试邮箱注册
   */
  const testEmailRegister = async () => {
    setIsLoading(true);
    try {
      const authingUser = await authing.registerByEmail(
        testForm.email,
        testForm.password,
        {
          nickname: `测试用户_${Date.now()}`,
          phone: testForm.phone
        }
      );
      localStorage.setItem('authing_user', JSON.stringify(authingUser));
      
      // 转换为内部User类型
      const convertedUser: AuthUser = {
        id: String(authingUser.id || ''),
        username: String(authingUser.username || authingUser.nickname || ''),
        email: String(authingUser.email || ''),
        phone: String(authingUser.phone || ''),
        nickname: String(authingUser.nickname || authingUser.username || ''),
        avatar: String(authingUser.photo || ''),
        ...((authingUser as unknown) as Record<string, unknown>)
      };
      
      setUser(convertedUser);
      toast({
        title: "注册成功",
        description: `用户: ${convertedUser.nickname || convertedUser.username || convertedUser.email}`,
      });
    } catch (error: any) {
      toast({
        title: "注册失败",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * 测试发送短信验证码
   */
  const testSendSms = async () => {
    setIsLoading(true);
    try {
      await authing.sendSmsCode(testForm.phone);
      toast({
        title: "验证码已发送",
        description: "请查看手机短信",
      });
    } catch (error: any) {
      toast({
        title: "发送失败",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * 测试获取当前用户
   */
  const testGetCurrentUser = async () => {
    setIsLoading(true);
    try {
      const currentUser = await authing.getCurrentUser();
      if (currentUser) {
        toast({
          title: "获取用户成功",
          description: `当前用户: ${currentUser.nickname || currentUser.username || currentUser.email}`,
        });
      } else {
        toast({
          title: "未登录",
          description: "当前没有登录用户",
          variant: "destructive"
        });
      }
    } catch (error: any) {
      toast({
        title: "获取用户失败",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * 测试登出
   */
  const testLogout = async () => {
    setIsLoading(true);
    try {
      await logout();
      toast({
        title: "登出成功",
        description: "已清除用户信息",
      });
    } catch (error: any) {
      toast({
        title: "登出失败",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * 返回首页
   */
  const handleBack = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4">
      <div className="container mx-auto max-w-4xl">
        {/* 返回按钮 */}
        <Button
          variant="ghost"
          onClick={handleBack}
          className="mb-6 flex items-center gap-2 text-gray-600 hover:text-gray-800"
        >
          <ArrowLeft className="h-4 w-4" />
          返回首页
        </Button>

        {/* 标题 */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Authing 功能测试</h1>
          <p className="text-gray-600">测试 Authing 的各种认证功能</p>
        </div>

        {/* 当前状态 */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>当前状态</CardTitle>
            <CardDescription>认证状态和用户信息</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p><strong>认证状态:</strong> {isAuthenticated ? '已登录' : '未登录'}</p>
              {user && (
                <div>
                  <p><strong>用户信息:</strong></p>
                  <pre className="bg-gray-100 p-2 rounded text-sm overflow-auto">
                    {JSON.stringify(user, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* 测试表单 */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>测试数据</CardTitle>
            <CardDescription>用于测试的邮箱、密码和手机号</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="test-email">邮箱</Label>
                <Input
                  id="test-email"
                  type="email"
                  value={testForm.email}
                  onChange={(e) => setTestForm(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="test@example.com"
                />
              </div>
              <div>
                <Label htmlFor="test-password">密码</Label>
                <Input
                  id="test-password"
                  type="password"
                  value={testForm.password}
                  onChange={(e) => setTestForm(prev => ({ ...prev, password: e.target.value }))}
                  placeholder="password123"
                />
              </div>
              <div>
                <Label htmlFor="test-phone">手机号</Label>
                <Input
                  id="test-phone"
                  type="tel"
                  value={testForm.phone}
                  onChange={(e) => setTestForm(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="13800138000"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 测试功能 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* 登录测试 */}
          <Card>
            <CardHeader>
              <CardTitle>登录测试</CardTitle>
              <CardDescription>测试各种登录方式</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                onClick={testEmailLogin}
                disabled={isLoading}
                className="w-full"
                variant="outline"
              >
                邮箱密码登录
              </Button>
              <Button
                onClick={testPhoneLogin}
                disabled={isLoading}
                className="w-full"
                variant="outline"
              >
                手机号密码登录
              </Button>
            </CardContent>
          </Card>

          {/* 注册测试 */}
          <Card>
            <CardHeader>
              <CardTitle>注册测试</CardTitle>
              <CardDescription>测试用户注册功能</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                onClick={testEmailRegister}
                disabled={isLoading}
                className="w-full"
                variant="outline"
              >
                邮箱注册
              </Button>
              <Button
                onClick={testSendSms}
                disabled={isLoading}
                className="w-full"
                variant="outline"
              >
                发送短信验证码
              </Button>
            </CardContent>
          </Card>

          {/* 用户管理测试 */}
          <Card>
            <CardHeader>
              <CardTitle>用户管理</CardTitle>
              <CardDescription>测试用户信息管理</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                onClick={testGetCurrentUser}
                disabled={isLoading}
                className="w-full"
                variant="outline"
              >
                获取当前用户
              </Button>
              <Button
                onClick={testLogout}
                disabled={isLoading}
                className="w-full"
                variant="destructive"
              >
                登出
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* 配置信息 */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Authing 配置</CardTitle>
            <CardDescription>当前使用的 Authing 配置信息</CardDescription>
          </CardHeader>
          <CardContent>
            <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
              {JSON.stringify(authingConfig, null, 2)}
            </pre>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 