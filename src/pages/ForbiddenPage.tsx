/**
 * 🚫 403 禁止访问页面
 * 
 * 功能：
 * - 显示权限不足提示
 * - 提供升级引导
 * - 返回导航
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, ArrowLeft, Crown, Lock, AlertTriangle } from 'lucide-react';
import { getUserDisplayName } from '@/utils/userDisplayUtils';
import { useAuth } from '@/hooks/useAuth';

/**
 * 403 禁止访问页面组件
 */
export default function ForbiddenPage() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const handleGoBack = () => {
    window.history.back();
  };

  const handleGoHome = () => {
    navigate('/');
  };

  const handleUpgrade = () => {
    navigate('/upgrade');
  };

  const handleLogin = () => {
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-6">
        {/* 主要错误卡片 */}
        <Card className="text-center">
          <CardHeader>
            <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <Shield className="w-8 h-8 text-red-600" />
            </div>
            <CardTitle className="text-2xl text-red-600">403 - 禁止访问</CardTitle>
            <CardDescription className="text-base">
              您没有权限访问此页面
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!isAuthenticated ? (
              <Alert>
                <Lock className="h-4 w-4" />
                <AlertDescription>
                  此页面需要登录后才能访问，请先登录您的账户。
                </AlertDescription>
              </Alert>
            ) : (
              <Alert>
                <Crown className="h-4 w-4" />
                <AlertDescription>
                  此功能需要更高级别的会员权限，请升级您的账户以解锁更多功能。
                </AlertDescription>
              </Alert>
            )}

            {/* 用户信息 */}
            {isAuthenticated && user && (
              <div className="bg-muted p-3 rounded-lg text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">当前用户:</span>
                  <span className="font-medium">{getUserDisplayName(user, '未知用户')}</span>
                </div>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-muted-foreground">会员等级:</span>
                  <span className="font-medium">
                    {user.tier === 'free' ? '免费用户' : 
                     user.tier === 'pro' ? 'Pro会员' : 
                     user.tier === 'premium' ? 'Premium会员' : '未知'}
                  </span>
                </div>
              </div>
            )}

            {/* 操作按钮 */}
            <div className="space-y-2">
              {!isAuthenticated ? (
                <>
                  <Button onClick={handleLogin} className="w-full">
                    <Lock className="w-4 h-4 mr-2" />
                    立即登录
                  </Button>
                  <Button variant="outline" onClick={handleGoHome} className="w-full">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    返回首页
                  </Button>
                </>
              ) : (
                <>
                  <Button onClick={handleUpgrade} className="w-full">
                    <Crown className="w-4 h-4 mr-2" />
                    升级会员
                  </Button>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={handleGoBack} className="flex-1">
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      返回
                    </Button>
                    <Button variant="outline" onClick={handleGoHome} className="flex-1">
                      首页
                    </Button>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* 帮助信息 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              需要帮助？
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-sm text-muted-foreground space-y-2">
              <p>如果您认为这是一个错误，请尝试以下操作：</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>检查您的网络连接</li>
                <li>刷新页面重试</li>
                <li>清除浏览器缓存</li>
                <li>联系客服获取帮助</li>
              </ul>
            </div>
            
            <div className="flex gap-2">
              <Button variant="link" size="sm" onClick={() => window.location.reload()}>
                刷新页面
              </Button>
              <Button variant="link" size="sm" asChild>
                <a href="mailto:support@example.com">联系客服</a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
