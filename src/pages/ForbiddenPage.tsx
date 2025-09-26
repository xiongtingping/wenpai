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
import { useTranslation } from 'react-i18next';

/**
 * 403 禁止访问页面组件
 */
export default function ForbiddenPage() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { t } = useTranslation();

  const handleGoBack = () => {
    window.history.back();
  };

  const handleGoHome = () => {
    navigate('/');
  };

  const handleUpgrade = () => {
    navigate('/upgrade-plans');
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
              <Shield className="w-8 h-8 text-destructive" />
            </div>
            <CardTitle className="text-2xl text-destructive"></CardTitle>
            <CardDescription className="text-base">
              
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!isAuthenticated ? (
              <Alert>
                <Lock className="h-4 w-4" />
                <AlertDescription>
                  
                </AlertDescription>
              </Alert>
            ) : (
              <Alert>
                <Crown className="h-4 w-4" />
                <AlertDescription>
                  {t('errors.forbidden.needUpgrade')}
                </AlertDescription>
              </Alert>
            )}

            {/* 用户信息 */}
            {isAuthenticated && user && (
              <div className="bg-muted p-3 rounded-lg text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">:</span>
                  <span className="font-medium">{getUserDisplayName(user, t('errors.forbidden.unknown'))}</span>
                </div>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-muted-foreground">:</span>
                  <span className="font-medium">
                    {user.tier === 'free' ? t('errors.forbidden.freeUser') : 
                     user.tier === 'pro' ? t('errors.forbidden.proUser') : 
                     user.tier === 'premium' ? t('errors.forbidden.premiumUser') : t('errors.forbidden.unknown')}
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
                    
                  </Button>
                  <Button variant="outline" onClick={handleGoHome} className="w-full">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    
                  </Button>
                </>
              ) : (
                <>
                  <Button onClick={handleUpgrade} className="w-full">
                    <Crown className="w-4 h-4 mr-2" />
                    
                  </Button>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={handleGoBack} className="flex-1">
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      {t('errors.forbidden.goBack')}
                    </Button>
                    <Button variant="outline" onClick={handleGoHome} className="flex-1">
                      
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
              
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-sm text-muted-foreground space-y-2">
              <p></p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                {(t('errors.forbidden.help.suggestions', { returnObjects: true }) as any[]).map((suggestion: any, index: number) => (
                  <li key={index}>{suggestion}</li>
                ))}
              </ul>
            </div>
            
            <div className="flex gap-2">
              <Button variant="link" size="sm" onClick={() => window.location.reload()}>
                
              </Button>
              <Button variant="link" size="sm" asChild>
                <a href="mailto:hello@wenpai.xyz">{t('errors.forbidden.help.contactSupport')}</a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
