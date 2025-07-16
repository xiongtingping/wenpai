/**
 * 设置页面
 * 用户个性化设置和系统配置
 */

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ThemeSwitcher } from '@/components/ui/ThemeSwitcher';
import { useUnifiedAuthContext } from '@/contexts/UnifiedAuthContext';
import { usePermissions } from '@/hooks/usePermissions';
import { 
  Palette,
  Bell,
  Shield,
  Globe,
  User,
  Database,
  Settings as SettingsIcon
} from 'lucide-react';

/**
 * 检查是否为开发环境
 */
const isDevelopment = () => {
  return import.meta.env.DEV || process.env.NODE_ENV === 'development';
};

/**
 * 设置页面组件
 */
const SettingsPage: React.FC = () => {
  const { user } = useUnifiedAuthContext();
  const { hasRole } = usePermissions();

  // 开发环境下跳过权限检查
  const isPro = isDevelopment() || hasRole('premium') || hasRole('pro') || hasRole('admin');

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* 页面标题 */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">设置</h1>
        <p className="text-gray-600">个性化您的文派体验</p>
      </div>

      <div className="grid gap-6">
        {/* 外观设置 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="w-5 h-5" />
              外观设置
            </CardTitle>
            <CardDescription>
              自定义界面主题和显示效果
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">主题切换</h3>
                <p className="text-sm text-gray-500">选择您喜欢的界面主题</p>
              </div>
              <ThemeSwitcher />
            </div>
          </CardContent>
        </Card>

        {/* 通知设置 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5" />
              通知设置
            </CardTitle>
            <CardDescription>
              管理应用通知和提醒
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">邮件通知</h3>
                <p className="text-sm text-gray-500">接收重要更新和活动通知</p>
              </div>
              <div className="text-sm text-gray-500">已开启</div>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">推送通知</h3>
                <p className="text-sm text-gray-500">接收实时推送消息</p>
              </div>
              <div className="text-sm text-gray-500">已开启</div>
            </div>
          </CardContent>
        </Card>

        {/* 隐私设置 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              隐私设置
            </CardTitle>
            <CardDescription>
              管理您的隐私和数据安全
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">数据收集</h3>
                <p className="text-sm text-gray-500">允许收集使用数据以改善服务</p>
              </div>
              <div className="text-sm text-gray-500">已开启</div>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">第三方分享</h3>
                <p className="text-sm text-gray-500">与合作伙伴分享匿名数据</p>
              </div>
              <div className="text-sm text-gray-500">已关闭</div>
            </div>
          </CardContent>
        </Card>

        {/* 账户信息 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              账户信息
            </CardTitle>
            <CardDescription>
              查看和管理您的账户信息
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">用户名</h3>
                <p className="text-sm text-gray-500">{user?.username || '未设置'}</p>
              </div>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">邮箱</h3>
                <p className="text-sm text-gray-500">{user?.email || '未设置'}</p>
              </div>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">会员状态</h3>
                <p className="text-sm text-gray-500">
                  {isPro ? '专业版用户' : '免费版用户'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 数据管理 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="w-5 h-5" />
              数据管理
            </CardTitle>
            <CardDescription>
              管理您的数据和内容
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">导出数据</h3>
                <p className="text-sm text-gray-500">下载您的所有数据</p>
              </div>
              <div className="text-sm text-blue-600 cursor-pointer hover:underline">
                导出
              </div>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">删除账户</h3>
                <p className="text-sm text-gray-500">永久删除您的账户和数据</p>
              </div>
              <div className="text-sm text-red-600 cursor-pointer hover:underline">
                删除
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 关于 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="w-5 h-5" />
              关于文派
            </CardTitle>
            <CardDescription>
              版本信息和相关链接
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">版本</h3>
                <p className="text-sm text-gray-500">v1.0.0</p>
              </div>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">更新日志</h3>
                <p className="text-sm text-gray-500">查看最新更新内容</p>
              </div>
              <div className="text-sm text-blue-600 cursor-pointer hover:underline">
                查看
              </div>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">帮助中心</h3>
                <p className="text-sm text-gray-500">获取使用帮助</p>
              </div>
              <div className="text-sm text-blue-600 cursor-pointer hover:underline">
                访问
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SettingsPage; 