/**
 * 登录按钮测试页面
 * 展示LoginButton组件的不同样式和功能
 */

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  LogIn, 
  ArrowLeft,
  Settings,
  Eye,
  User,
  Shield
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import LoginButton, { QuickLoginButton, RegisterButton } from '@/components/auth/LoginButton';

/**
 * 登录按钮测试页面组件
 * @returns React 组件
 */
export default function LoginButtonTestPage() {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  /**
   * 返回上一页
   */
  const handleBack = () => {
    navigate(-1);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* 页面头部 */}
      <div className="mb-8">
        <Button 
          variant="ghost" 
          onClick={handleBack}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          返回
        </Button>
        
        <h1 className="text-3xl font-bold text-gray-900 mb-2">登录按钮测试</h1>
        <p className="text-gray-600">
          测试LoginButton组件的不同样式和功能
        </p>
        
        {/* 当前用户状态 */}
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-blue-600" />
            <span className="font-medium">当前状态:</span>
            <Badge variant={isAuthenticated ? "default" : "secondary"}>
              {isAuthenticated ? '已登录' : '未登录'}
            </Badge>
            {isAuthenticated && user && (
              <span className="text-sm text-gray-600">
                ({user.nickname || user.username})
              </span>
            )}
          </div>
        </div>
      </div>

      {/* 组件说明 */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LogIn className="w-5 h-5" />
            组件说明
          </CardTitle>
          <CardDescription>
            LoginButton组件支持多种样式和配置选项，自动处理登录状态
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">智能状态</h4>
              <p className="text-sm text-blue-700">
                根据登录状态自动显示不同内容，已登录时显示用户信息
              </p>
            </div>
            
            <div className="p-4 bg-green-50 rounded-lg">
              <h4 className="font-medium text-green-900 mb-2">安全功能</h4>
              <p className="text-sm text-green-700">
                集成安全日志记录、错误处理和加载状态管理
              </p>
            </div>
            
            <div className="p-4 bg-purple-50 rounded-lg">
              <h4 className="font-medium text-purple-900 mb-2">多种样式</h4>
              <p className="text-sm text-purple-700">
                支持多种按钮变体、大小和自定义样式
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 主要登录按钮 */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <User className="w-5 h-5 text-blue-600" />
          主要登录按钮
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* 默认样式 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">默认样式</CardTitle>
              <CardDescription>标准登录按钮</CardDescription>
            </CardHeader>
            <CardContent>
              <LoginButton />
            </CardContent>
          </Card>

          {/* 轮廓样式 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">轮廓样式</CardTitle>
              <CardDescription>outline 变体</CardDescription>
            </CardHeader>
            <CardContent>
              <LoginButton variant="outline" />
            </CardContent>
          </Card>

          {/* 幽灵样式 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">幽灵样式</CardTitle>
              <CardDescription>ghost 变体</CardDescription>
            </CardHeader>
            <CardContent>
              <LoginButton variant="ghost" />
            </CardContent>
          </Card>

          {/* 链接样式 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">链接样式</CardTitle>
              <CardDescription>link 变体</CardDescription>
            </CardHeader>
            <CardContent>
              <LoginButton variant="link" />
            </CardContent>
          </Card>

          {/* 大尺寸 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">大尺寸</CardTitle>
              <CardDescription>lg 尺寸</CardDescription>
            </CardHeader>
            <CardContent>
              <LoginButton size="lg" />
            </CardContent>
          </Card>

          {/* 小尺寸 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">小尺寸</CardTitle>
              <CardDescription>sm 尺寸</CardDescription>
            </CardHeader>
            <CardContent>
              <LoginButton size="sm" />
            </CardContent>
          </Card>
        </div>
      </div>

      <Separator className="my-8" />

      {/* 快速登录按钮 */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Eye className="w-5 h-5 text-green-600" />
          快速登录按钮
        </h2>
        
        <Card>
          <CardHeader>
            <CardTitle>QuickLoginButton</CardTitle>
            <CardDescription>
              简化版本的登录按钮，已登录时自动隐藏
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <QuickLoginButton />
              <span className="text-sm text-gray-500">
                ← 点击测试快速登录功能
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Separator className="my-8" />

      {/* 注册按钮 */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Settings className="w-5 h-5 text-purple-600" />
          注册按钮
        </h2>
        
        <Card>
          <CardHeader>
            <CardTitle>RegisterButton</CardTitle>
            <CardDescription>
              专门用于注册的按钮，已登录时自动隐藏
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <RegisterButton />
              <span className="text-sm text-gray-500">
                ← 点击测试注册功能
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Separator className="my-8" />

      {/* 自定义配置 */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">自定义配置</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 自定义文本 */}
          <Card>
            <CardHeader>
              <CardTitle>自定义文本</CardTitle>
              <CardDescription>使用 children 属性自定义按钮文本</CardDescription>
            </CardHeader>
            <CardContent>
              <LoginButton variant="outline">
                立即开始使用
              </LoginButton>
            </CardContent>
          </Card>

          {/* 自定义跳转 */}
          <Card>
            <CardHeader>
              <CardTitle>自定义跳转</CardTitle>
              <CardDescription>登录后跳转到指定页面</CardDescription>
            </CardHeader>
            <CardContent>
              <LoginButton 
                variant="outline" 
                redirectTo="/user-profile"
              >
                登录后查看用户信息
              </LoginButton>
            </CardContent>
          </Card>

          {/* 隐藏用户状态 */}
          <Card>
            <CardHeader>
              <CardTitle>隐藏用户状态</CardTitle>
              <CardDescription>showUserStatus=false</CardDescription>
            </CardHeader>
            <CardContent>
              <LoginButton 
                variant="outline" 
                showUserStatus={false}
              />
            </CardContent>
          </Card>

          {/* 隐藏加载状态 */}
          <Card>
            <CardHeader>
              <CardTitle>隐藏加载状态</CardTitle>
              <CardDescription>showLoading=false</CardDescription>
            </CardHeader>
            <CardContent>
              <LoginButton 
                variant="outline" 
                showLoading={false}
              />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* 功能特性说明 */}
      <Card>
        <CardHeader>
          <CardTitle>功能特性</CardTitle>
          <CardDescription>
            LoginButton组件的主要功能和特性
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-3">核心功能</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• 自动检测登录状态</li>
                <li>• 支持多种按钮样式</li>
                <li>• 可配置跳转路径</li>
                <li>• 加载状态管理</li>
                <li>• 错误处理和提示</li>
                <li>• 用户状态显示</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium mb-3">安全特性</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• 安全日志记录</li>
                <li>• 错误日志追踪</li>
                <li>• 用户行为监控</li>
                <li>• 安全的跳转机制</li>
                <li>• 防重复点击</li>
                <li>• 状态验证</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 