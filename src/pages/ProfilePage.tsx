/**
 * 个人中心页面
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { User, Settings, LogOut, Edit, Save, X, Camera, Shield, ArrowLeft, Gift } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useUserStore } from '@/store/userStore';
import { AvatarUpload } from '@/components/ui/avatar-upload';
import { NicknameSelector } from '@/components/ui/nickname-selector';
import { ContactVerification } from '@/components/ui/contact-verification';
import PageNavigation from '@/components/layout/PageNavigation';

/**
 * 个人中心页面组件
 * @returns React 组件
 */
export default function ProfilePage() {
  const { toast } = useToast();
  const { user, isAuthenticated, logout, setUser } = useAuth();
  const { usageRemaining, userInviteStats } = useUserStore();
  const navigate = useNavigate();

  // 编辑状态管理
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    nickname: user?.nickname || '',
    email: user?.email || '',
    phone: user?.phone || '',
    avatar: user?.avatar || '',
  });

  // 如果用户未登录，跳转到登录页
  if (!isAuthenticated || !user) {
    navigate('/login');
    return null;
  }

  // 同步用户数据到编辑表单
  React.useEffect(() => {
    if (user) {
      setEditForm({
        nickname: user.nickname || '',
        email: user.email || '',
        phone: user.phone || '',
        avatar: user.avatar || '',
      });
    }
  }, [user]);

  /**
   * 处理头像更改
   */
  const handleAvatarChange = (newAvatar: string) => {
    setEditForm(prev => ({ ...prev, avatar: newAvatar }));
  };

  /**
   * 处理昵称更改
   */
  const handleNicknameChange = (newNickname: string) => {
    setEditForm(prev => ({ ...prev, nickname: newNickname }));
  };

  /**
   * 处理邮箱更改
   */
  const handleEmailChange = (newEmail: string) => {
    setEditForm(prev => ({ ...prev, email: newEmail }));
  };

  /**
   * 处理手机号更改
   */
  const handlePhoneChange = (newPhone: string) => {
    setEditForm(prev => ({ ...prev, phone: newPhone }));
  };

  /**
   * 取消编辑
   */
  const handleCancel = () => {
    setEditForm({
      nickname: user?.nickname || '',
      email: user?.email || '',
      phone: user?.phone || '',
      avatar: user?.avatar || '',
    });
    setIsEditing(false);
  };

  /**
   * 保存所有编辑
   */
  const handleSaveAll = async () => {
    if (!user) return;

    try {
      // 更新用户信息
      const updatedUser = {
        ...user,
        nickname: editForm.nickname || user.nickname,
        email: editForm.email || user.email,
        phone: editForm.phone || user.phone,
        avatar: editForm.avatar || user.avatar,
        updatedAt: new Date().toISOString(),
      };

      // 更新AuthContext中的用户信息
      setUser(updatedUser);

      // 更新localStorage中的用户信息
      localStorage.setItem('authing_user', JSON.stringify(updatedUser));

      toast({
        title: "保存成功",
        description: "个人信息已更新",
      });
      setIsEditing(false);

      // 返回首页以查看更新后的用户信息
      setTimeout(() => {
        navigate('/');
      }, 1000);
    } catch (error) {
      console.error('保存用户信息失败:', error);
      toast({
        title: "保存失败",
        description: "请重试",
        variant: "destructive"
      });
    }
  };

  /**
   * 处理登出
   */
  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (err) {
      console.error('登出失败:', err);
      toast({
        title: "登出失败",
        description: "请重试",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 页面导航 */}
      <PageNavigation
        title="个人中心"
        description="管理您的个人信息和账户设置"
        actions={
          <div className="flex gap-2">
            {isEditing ? (
              <>
                <Button variant="outline" onClick={handleCancel}>
                  <X className="h-4 w-4 mr-2" />
                  取消
                </Button>
                <Button onClick={handleSaveAll}>
                  <Save className="h-4 w-4 mr-2" />
                  保存所有修改
                </Button>
              </>
            ) : (
              <Button onClick={() => setIsEditing(true)}>
                <Edit className="h-4 w-4 mr-2" />
                编辑信息
              </Button>
            )}
          </div>
        }
      />

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="space-y-6">
          {/* 个人信息卡片 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                个人信息
              </CardTitle>
              <CardDescription>
                您的基本资料和头像设置
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* 头像设置 */}
              <div className="space-y-4">
                <Label className="text-sm font-medium">头像</Label>
                <div className="flex flex-col items-start">
                  <AvatarUpload
                    currentAvatar={editForm.avatar}
                    nickname={editForm.nickname || user?.nickname || '用户'}
                    size="lg"
                    onAvatarChange={handleAvatarChange}
                    disabled={!isEditing}
                  />
                  {isEditing && (
                    <p className="text-xs text-gray-500 mt-2">
                      上传自定义头像或点击"随机头像"生成个性化头像
                    </p>
                  )}
                </div>
              </div>

              {/* 昵称设置 */}
              <div className="space-y-4">
                <Label className="text-sm font-medium">昵称</Label>
                {isEditing ? (
                  <NicknameSelector
                    currentNickname={editForm.nickname}
                    onNicknameChange={handleNicknameChange}
                    disabled={false}
                  />
                ) : (
                  <div className="p-3 bg-gray-50 rounded-md">
                    <span className="text-sm">{editForm.nickname || '未设置昵称'}</span>
                  </div>
                )}
              </div>

              {/* 基本信息 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">用户ID</Label>
                  <div className="p-3 bg-gray-50 rounded-md">
                    <span className="text-sm font-mono">{user.id}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">注册时间</Label>
                  <div className="p-3 bg-gray-50 rounded-md">
                    <span className="text-sm">
                      {user.createdAt ? new Date(user.createdAt as string).toLocaleDateString('zh-CN') : '未知'}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 联系方式验证 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                联系方式验证
              </CardTitle>
              <CardDescription>
                验证您的手机号和邮箱地址，补充邮箱可获得10次使用次数奖励
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ContactVerification
                currentPhone={editForm.phone}
                currentEmail={editForm.email}
                onPhoneChange={handlePhoneChange}
                onEmailChange={handleEmailChange}
                disabled={!isEditing}
              />
            </CardContent>
          </Card>

          {/* 邮箱补充奖励提示 */}
          {!user.email && (
            <Card className="border-amber-200 bg-amber-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-amber-800">
                  <Gift className="w-5 h-5" />
                  补充邮箱奖励
                </CardTitle>
                <CardDescription className="text-amber-700">
                  首次补充邮箱地址，可获得10次免费使用次数
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-sm text-amber-700">
                    <p>• 验证邮箱地址的真实性</p>
                    <p>• 获得10次免费内容生成次数</p>
                    <p>• 提升账户安全性</p>
                  </div>
                  <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-300">
                    +10次
                  </Badge>
                </div>
              </CardContent>
            </Card>
          )}

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
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{usageRemaining}</div>
                  <div className="text-sm text-gray-600">剩余使用量</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{userInviteStats.totalRegistrations}</div>
                  <div className="text-sm text-gray-600">邀请注册</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">{userInviteStats.totalRegistrations * 20}</div>
                  <div className="text-sm text-gray-600">总奖励次数</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 账户操作 */}
          <Card>
            <CardHeader>
              <CardTitle>账户操作</CardTitle>
              <CardDescription>
                管理您的账户设置
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button
                  variant="outline"
                  onClick={() => navigate('/invite')}
                  className="justify-start"
                >
                  <User className="w-4 h-4 mr-2" />
                  邀请好友
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleLogout}
                  className="justify-start"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  退出登录
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 