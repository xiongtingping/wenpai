/**
 * 个人资料页面
 * 显示和编辑用户个人信息
 */

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useUserStore } from '@/store/userStore';
import { User, Settings, LogOut, Edit, Save, X } from 'lucide-react';

/**
 * 个人资料页面组件
 * @returns React 组件
 */
export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    nickname: '',
    email: '',
  });
  const { toast } = useToast();
  const { user, isAuthenticated, logout } = useAuth();
  const { usageRemaining, userInviteStats } = useUserStore();

  // 初始化编辑表单
  React.useEffect(() => {
    if (user) {
      setEditForm({
        nickname: user.nickname || '',
        email: user.email || '',
      });
    }
  }, [user]);

  /**
   * 处理编辑表单变化
   */
  const handleEditChange = (field: string, value: string) => {
    setEditForm(prev => ({ ...prev, [field]: value }));
  };

  /**
   * 保存编辑
   */
  const handleSave = () => {
    // 这里应该调用 API 更新用户信息
    toast({
      title: "保存成功",
      description: "个人信息已更新",
    });
    setIsEditing(false);
  };

  /**
   * 取消编辑
   */
  const handleCancel = () => {
    if (user) {
      setEditForm({
        nickname: user.nickname || '',
        email: user.email || '',
      });
    }
    setIsEditing(false);
  };

  /**
   * 处理登出
   */
  const handleLogout = async () => {
    try {
      await logout();
      toast({
        title: "登出成功",
        description: "您已安全退出登录",
      });
    } catch (error) {
      toast({
        title: "登出失败",
        description: "请稍后重试",
        variant: "destructive",
      });
    }
  };

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">加载用户信息中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">个人资料</h1>
        <p className="text-gray-600">
          管理您的个人信息和账户设置
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* 基本信息 */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  基本信息
                </CardTitle>
                <CardDescription>
                  您的个人资料信息
                </CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(!isEditing)}
              >
                {isEditing ? <X className="w-4 h-4" /> : <Edit className="w-4 h-4" />}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {isEditing ? (
              <>
                <div className="space-y-2">
                  <Label htmlFor="nickname">昵称</Label>
                  <Input
                    id="nickname"
                    value={editForm.nickname}
                    onChange={(e) => handleEditChange('nickname', e.target.value)}
                    placeholder="请输入昵称"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">邮箱</Label>
                  <Input
                    id="email"
                    type="email"
                    value={editForm.email}
                    onChange={(e) => handleEditChange('email', e.target.value)}
                    placeholder="请输入邮箱"
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleSave} size="sm">
                    <Save className="w-4 h-4 mr-2" />
                    保存
                  </Button>
                  <Button variant="outline" onClick={handleCancel} size="sm">
                    取消
                  </Button>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                    {user.nickname?.charAt(0) || user.username?.charAt(0) || user.email?.charAt(0) || 'U'}
                  </div>
                  <div>
                    <h3 className="font-medium">{user.nickname || user.username || '未设置昵称'}</h3>
                    <p className="text-sm text-gray-500">{user.email || '未设置邮箱'}</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">用户ID</span>
                    <span className="text-sm font-mono">{user.id}</span>
                  </div>
                  {user.phone && (
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">手机号</span>
                      <span className="text-sm">{user.phone}</span>
                    </div>
                  )}
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* 使用统计 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              使用统计
            </CardTitle>
            <CardDescription>
              您的使用情况和统计数据
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{usageRemaining}</div>
                <div className="text-sm text-gray-600">剩余使用量</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{userInviteStats.totalRegistrations}</div>
                <div className="text-sm text-gray-600">邀请注册</div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">总点击次数</span>
                <Badge variant="secondary">{userInviteStats.totalClicks}</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">总奖励次数</span>
                <Badge variant="secondary">{userInviteStats.totalRewardsClaimed}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 账户操作 */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>账户操作</CardTitle>
            <CardDescription>
              管理您的账户设置
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Button
                variant="outline"
                onClick={() => window.location.href = '/invite'}
                className="w-full justify-start"
              >
                <User className="w-4 h-4 mr-2" />
                邀请好友
              </Button>
              <Button
                variant="outline"
                onClick={() => window.location.href = '/brand-library'}
                className="w-full justify-start"
              >
                <Settings className="w-4 h-4 mr-2" />
                品牌库管理
              </Button>
              <Button
                variant="outline"
                onClick={() => window.location.href = '/history'}
                className="w-full justify-start"
              >
                <Settings className="w-4 h-4 mr-2" />
                历史记录
              </Button>
              <Button
                variant="destructive"
                onClick={handleLogout}
                className="w-full justify-start"
              >
                <LogOut className="w-4 h-4 mr-2" />
                退出登录
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 