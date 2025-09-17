/**
 * Settings Page
 * User personalization settings and system configuration
 */

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { useAuth } from '@/hooks/useAuth';
import { usePermission } from '@/hooks/usePermission';
import { SubscriptionExpiryAlert } from '@/components/subscription/SubscriptionExpiryAlert';
import { 
  Settings, 
  User, 
  Shield, 
  Bell, 
  Palette,
  Key,
  LogOut,
  Save
} from 'lucide-react';

/**
 * 设置页面组件
 */
const SettingsPage: React.FC = () => { const { user, logout  } = useAuth();
  const adminPermission = usePermission('admin:access');
  const [notifications, setNotifications] = useState(true);
  const [autoSave, setAutoSave] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  // 处理登出
  const handleLogout = () => {
    logout();
  };

  return (
    <div className="min-h-screen particle-background">
      <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* 页面标题 */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Settings className="h-16 w-16 text-primary drop-shadow-sm" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            
          </h1>
          <p className="text-muted-foreground">
            
          </p>
        </div>

        {/* 订阅到期提醒 */}
        <SubscriptionExpiryAlert />

        {/* 账户信息 */}
        <Card variant="enhanced" className="mb-6 rounded-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <User className="h-5 w-5 text-primary" />
              
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">{t('settings.userId')}</span>
                <span className="text-sm font-mono text-foreground">{user?.id}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground"></span>
                <span className="text-sm text-foreground">{user?.email}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground"></span>
                <span className="text-sm text-foreground">{user?.username || t('settings.notSet')}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground"></span>
                <Badge variant={user?.isVip ? "default" : "secondary"}>
                  {user?.isVip ? t('settings.vipUser') : t('settings.regularUser')}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 通知设置 */}
        <Card variant="soft" className="mb-6 rounded-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-primary">
              <Bell className="h-5 w-5 text-secondary" />
              
            </CardTitle>
            <CardDescription className="text-secondary">
              
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground"></p>
                  <p className="text-sm text-muted-foreground">{t('settings.pushNotificationDescription')}</p>
                </div>
                <Switch
                  checked={notifications}
                  onCheckedChange={setNotifications}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 应用设置 */}
        <Card variant="soft" className="mb-6 rounded-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <Palette className="h-5 w-5 text-muted-foreground" />
              
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground"></p>
                  <p className="text-sm text-muted-foreground">{t('settings.autoSaveDescription')}</p>
                </div>
                <Switch
                  checked={autoSave}
                  onCheckedChange={setAutoSave}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground"></p>
                  <p className="text-sm text-muted-foreground"></p>
                </div>
                <Switch
                  checked={darkMode}
                  onCheckedChange={setDarkMode}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 安全设置 */}
        <Card variant="soft" className="mb-6 rounded-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <Shield className="h-5 w-5 text-muted-foreground" />
              
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              {t('settings.manageAccountSecurity')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Button variant="outline" className="w-full justify-start">
                <Key className="h-4 w-4 mr-2" />
                
              </Button>
              {adminPermission.pass && (
                <Button variant="outline" className="w-full justify-start">
                  <Shield className="h-4 w-4 mr-2" />
                  
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* 操作按钮 */}
        <div className="flex gap-4">
          <Button className="flex-1">
            <Save className="h-4 w-4 mr-2" />
            
          </Button>
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-2" />
            {t('auth.logout')}
          </Button>
        </div>
      </div>
      </div>
    </div>
  );
};

export default SettingsPage;
