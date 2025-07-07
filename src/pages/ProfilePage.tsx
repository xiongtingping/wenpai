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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useUserStore } from '@/store/userStore';
import { User, Settings, LogOut, Edit, Save, X, Camera, Shield, ArrowLeft, Gift } from 'lucide-react';
import { AvatarUpload } from '@/components/ui/avatar-upload';
import { NicknameSelector } from '@/components/ui/nickname-selector';
import { ContactVerification } from '@/components/ui/contact-verification';
import { useNavigate } from 'react-router-dom';

/**
 * 个人资料页面组件
 * @returns React 组件
 */
export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    nickname: '',
    email: '',
    phone: '',
    avatar: '',
  });
  const { toast } = useToast();
  const { user, isAuthenticated, logout } = useAuth();
  const { usageRemaining, userInviteStats } = useUserStore();
  const navigate = useNavigate();

  // 初始化编辑表单
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
   * 处理编辑表单变化
   */
  const handleEditChange = (field: string, value: string) => {
    setEditForm(prev => ({ ...prev, [field]: value }));
  };

  /**
   * 处理头像变化
   */
  const handleAvatarChange = (avatarUrl: string) => {
    setEditForm(prev => ({ ...prev, avatar: avatarUrl }));
  };

  /**
   * 处理昵称变化
   */
  const handleNicknameChange = (nickname: string) => {
    setEditForm(prev => ({ ...prev, nickname }));
  };

  /**
   * 处理手机号变化
   */
  const handlePhoneChange = (phone: string) => {
    setEditForm(prev => ({ ...prev, phone }));
  };

  /**
   * 处理邮箱变化
   */
  const handleEmailChange = (email: string) => {
    setEditForm(prev => ({ ...prev, email }));
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
        phone: user.phone || '',
        avatar: user.avatar || '',
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
      // 登出成功，页面会自动重定向
    } catch (err) {
      console.error('登出失败:', err);
      toast({
        title: "登出失败",
        description: "请重试",
        variant: "destructive"
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
        <div className="flex items-center gap-4 mb-4">
          <Button
            variant="ghost"
            onClick={() => window.location.href = '/adapt'}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800"
          >
            <ArrowLeft className="h-4 w-4" />
            返回内容适配器
          </Button>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">个人中心</h1>
        <p className="text-gray-600">
          管理您的个人信息和账户设置
        </p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="profile">基本信息</TabsTrigger>
          <TabsTrigger value="avatar">头像设置</TabsTrigger>
          <TabsTrigger value="nickname">昵称设置</TabsTrigger>
          <TabsTrigger value="contact">联系方式</TabsTrigger>
        </TabsList>

        {/* 基本信息 */}
        <TabsContent value="profile" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  基本信息
                </CardTitle>
                <CardDescription>
                  您的个人资料信息
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
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
                    <span className="text-sm text-gray-600">总奖励次数</span>
                    <Badge variant="secondary">{userInviteStats.totalRegistrations * 20}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

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
                  onClick={() => window.location.href = '/invite'}
                  className="justify-start"
                >
                  <User className="w-4 h-4 mr-2" />
                  邀请好友
                </Button>
                <Button
                  variant="outline"
                  onClick={() => window.location.href = '/brand-library'}
                  className="justify-start"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  品牌库管理
                </Button>
                <Button
                  variant="outline"
                  onClick={() => window.location.href = '/history'}
                  className="justify-start"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  历史记录
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
        </TabsContent>

        {/* 头像设置 */}
        <TabsContent value="avatar" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Camera className="w-5 h-5" />
                头像设置
              </CardTitle>
              <CardDescription>
                上传自定义头像或生成随机头像
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AvatarUpload
                currentAvatar={editForm.avatar}
                nickname={editForm.nickname || user?.nickname || '用户'}
                size="lg"
                onAvatarChange={handleAvatarChange}
                disabled={false}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* 昵称设置 */}
        <TabsContent value="nickname" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                昵称设置
              </CardTitle>
              <CardDescription>
                自定义昵称或选择推荐的昵称
              </CardDescription>
            </CardHeader>
            <CardContent>
              <NicknameSelector
                currentNickname={editForm.nickname}
                onNicknameChange={handleNicknameChange}
                disabled={false}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* 联系方式 */}
        <TabsContent value="contact" className="space-y-6">
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
                disabled={false}
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
        </TabsContent>
      </Tabs>
    </div>
  );
} 