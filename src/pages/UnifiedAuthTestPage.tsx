/**
 * 统一认证入口测试页面
 * 展示各种登录/注册组件和功能
 */

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  LogIn, 
  UserPlus, 
  Shield,
  TestTube,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { useUnifiedAuth } from '@/hooks/useUnifiedAuth';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import UnifiedAuthEntry from '@/components/auth/UnifiedAuthEntry';
import { QuickAuthButton, LoginButton as ModalLoginButton, RegisterButton as ModalRegisterButton } from '@/components/auth/AuthModal';
import LoginButton from '@/components/auth/LoginButton';

/**
 * 统一认证测试页面
 */
export default function UnifiedAuthTestPage() {
  const [showAuthEntry, setShowAuthEntry] = useState(false);
  const { user, isAuthenticated, loading } = useUnifiedAuth();
  const { user: legacyUser, isAuthenticated: legacyIsAuthenticated } = useAuth();
  const { toast } = useToast();

  /**
   * 处理登录成功
   */
  const handleLoginSuccess = (user: any) => {
    toast({
      title: "登录成功",
      description: `欢迎回来，${user.nickname || user.username || user.email}！`
    });
  };

  /**
   * 处理注册成功
   */
  const handleRegisterSuccess = (user: any) => {
    toast({
      title: "注册成功",
      description: `欢迎加入文派，${user.nickname || user.username || user.email}！`
    });
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* 页面标题 */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center space-x-2">
            <TestTube className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold">统一认证入口测试</h1>
          </div>
          <p className="text-muted-foreground">
            测试统一认证系统的各种登录/注册组件和功能
          </p>
        </div>

        {/* 认证状态显示 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Shield className="w-5 h-5" />
              <span>认证状态</span>
            </CardTitle>
            <CardDescription>
              当前用户的认证状态信息
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* 统一认证状态 */}
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Badge variant={isAuthenticated ? "default" : "secondary"}>
                    {isAuthenticated ? "已登录" : "未登录"}
                  </Badge>
                  <span className="text-sm font-medium">统一认证系统</span>
                </div>
                {isAuthenticated && user ? (
                  <div className="text-sm space-y-1">
                    <p><strong>用户ID:</strong> {user.id}</p>
                    <p><strong>昵称:</strong> {user.nickname || '未设置'}</p>
                    <p><strong>邮箱:</strong> {user.email || '未设置'}</p>
                    <p><strong>手机:</strong> {user.phone || '未设置'}</p>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">未登录</p>
                )}
              </div>

              {/* 传统认证状态 */}
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Badge variant={legacyIsAuthenticated ? "default" : "secondary"}>
                    {legacyIsAuthenticated ? "已登录" : "未登录"}
                  </Badge>
                  <span className="text-sm font-medium">传统认证系统</span>
                </div>
                {legacyIsAuthenticated && legacyUser ? (
                  <div className="text-sm space-y-1">
                    <p><strong>用户ID:</strong> {legacyUser.id}</p>
                    <p><strong>昵称:</strong> {legacyUser.nickname || '未设置'}</p>
                    <p><strong>邮箱:</strong> {legacyUser.email || '未设置'}</p>
                    <p><strong>手机:</strong> {legacyUser.phone || '未设置'}</p>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">未登录</p>
                )}
              </div>
            </div>

            {loading && (
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                <span>正在检查认证状态...</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 统一认证入口组件测试 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span>统一认证入口组件</span>
            </CardTitle>
            <CardDescription>
              内嵌的统一认证入口组件，支持多种登录方式
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex justify-center">
              <UnifiedAuthEntry
                defaultTab="login"
                onSuccess={handleLoginSuccess}
                className="w-full max-w-md"
              />
            </div>
          </CardContent>
        </Card>

        {/* 弹窗认证按钮测试 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <LogIn className="w-5 h-5" />
              <span>弹窗认证按钮</span>
            </CardTitle>
            <CardDescription>
              点击按钮打开认证弹窗，支持登录和注册
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-4">
              <QuickAuthButton
                variant="default"
                onSuccess={handleLoginSuccess}
              >
                <LogIn className="w-4 h-4 mr-2" />
                快速登录/注册
              </QuickAuthButton>

              <ModalLoginButton
                variant="outline"
                onSuccess={handleLoginSuccess}
              >
                <LogIn className="w-4 h-4 mr-2" />
                仅登录
              </ModalLoginButton>

              <ModalRegisterButton
                variant="outline"
                onSuccess={handleRegisterSuccess}
              >
                <UserPlus className="w-4 h-4 mr-2" />
                仅注册
              </ModalRegisterButton>
            </div>

            <Separator />

            <div className="space-y-2">
              <h4 className="font-medium">按钮变体测试</h4>
              <div className="flex flex-wrap gap-2">
                <QuickAuthButton variant="default" size="sm">默认</QuickAuthButton>
                <QuickAuthButton variant="outline" size="sm">轮廓</QuickAuthButton>
                <QuickAuthButton variant="ghost" size="sm">幽灵</QuickAuthButton>
                <QuickAuthButton variant="link" size="sm">链接</QuickAuthButton>
                <QuickAuthButton variant="destructive" size="sm">危险</QuickAuthButton>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 传统登录按钮测试 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertCircle className="w-5 h-5 text-orange-600" />
              <span>传统登录按钮（兼容性）</span>
            </CardTitle>
            <CardDescription>
              传统的登录按钮组件，已更新为使用统一认证系统
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-4">
              <LoginButton
                variant="default"
                redirectTo="/"
              >
                传统登录按钮
              </LoginButton>
            </div>
          </CardContent>
        </Card>

        {/* 功能说明 */}
        <Card>
          <CardHeader>
            <CardTitle>功能说明</CardTitle>
            <CardDescription>
              统一认证系统的特性和优势
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <h4 className="font-medium text-green-600">✅ 已实现功能</h4>
                <ul className="space-y-2 text-sm">
                  <li>• 优先使用Authing SDK进行认证</li>
                  <li>• 支持多种登录方式（密码、验证码、社交登录）</li>
                  <li>• 统一的用户状态管理</li>
                  <li>• 弹窗和页面两种展示模式</li>
                  <li>• 完整的表单验证和错误处理</li>
                  <li>• 安全日志记录</li>
                  <li>• 响应式设计</li>
                </ul>
              </div>

              <div className="space-y-3">
                <h4 className="font-medium text-blue-600">🔧 技术特性</h4>
                <ul className="space-y-2 text-sm">
                  <li>• TypeScript 类型安全</li>
                  <li>• React Hooks 状态管理</li>
                  <li>• 组件化设计</li>
                  <li>• 可配置的样式和主题</li>
                  <li>• 无障碍访问支持</li>
                  <li>• 国际化准备</li>
                  <li>• 性能优化</li>
                </ul>
              </div>
            </div>

            <Separator />

            <div className="space-y-3">
              <h4 className="font-medium">🎯 使用建议</h4>
              <div className="text-sm space-y-2">
                <p><strong>推荐使用:</strong> 新的统一认证组件（UnifiedAuthEntry、AuthModal）</p>
                <p><strong>兼容性:</strong> 传统登录按钮已更新，可继续使用</p>
                <p><strong>配置:</strong> 确保Authing配置正确，优先使用Authing SDK</p>
                <p><strong>测试:</strong> 在生产环境部署前，充分测试各种登录场景</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 