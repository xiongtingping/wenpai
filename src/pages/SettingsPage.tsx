/**
 * 设置页面
 * 用户个性化设置和系统配置
 */

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { useUnifiedAuth } from '@/contexts/UnifiedAuthContext';
import { usePermission } from '@/hooks/usePermission';
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
const SettingsPage: React.FC = () => {
  const { user, logout } = useUnifiedAuth();
  const adminPermission = usePermission('admin:access');
  const [notifications, setNotifications] = useState(true);
  const [autoSave, setAutoSave] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  // 处理登出
  const handleLogout = () => {
    logout();
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* 页面标题 */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Settings className="h-16 w-16 text-accent drop-shadow-sm" />
          </div>
          <h1 className="text-3xl font-bold text-primary mb-2">
            设置中心
          </h1>
          <p className="text-secondary">
            管理您的账户设置和偏好
          </p>
        </div>

        {/* 账户信息 */}
        <Card variant="soft" className="mb-6 rounded-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-primary">
              <User className="h-5 w-5 text-secondary" />
              账户信息
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-secondary">用户ID</span>
                <span className="text-sm font-mono text-primary">{user?.id}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-secondary">邮箱</span>
                <span className="text-sm text-primary">{user?.email}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-secondary">用户名</span>
                <span className="text-sm text-primary">{user?.username || '未设置'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-secondary">VIP状态</span>
                <Badge variant={user?.isVip ? "default" : "secondary"}>
                  {user?.isVip ? "VIP用户" : "普通用户"}
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
              通知设置
            </CardTitle>
            <CardDescription className="text-secondary">
              管理您的通知偏好
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground">推送通知</p>
                  <p className="text-sm text-muted-foreground">接收重要更新和提醒</p>
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
              应用设置
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              自定义应用行为
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground">自动保存</p>
                  <p className="text-sm text-muted-foreground">自动保存您的工作进度</p>
                </div>
                <Switch
                  checked={autoSave}
                  onCheckedChange={setAutoSave}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground">深色模式</p>
                  <p className="text-sm text-muted-foreground">使用深色主题</p>
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
              安全设置
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              管理您的账户安全
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Button variant="outline" className="w-full justify-start">
                <Key className="h-4 w-4 mr-2" />
                修改密码
              </Button>
              {adminPermission.pass && (
                <Button variant="outline" className="w-full justify-start">
                  <Shield className="h-4 w-4 mr-2" />
                  管理员面板
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* 操作按钮 */}
        <div className="flex gap-4">
          <Button className="flex-1">
            <Save className="h-4 w-4 mr-2" />
            保存设置
          </Button>
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-2" />
            退出登录
          </Button>
        </div>
      </div>
      </div>
    </div>
  );
};

export default SettingsPage; 