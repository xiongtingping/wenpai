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
import { Separator } from '@/components/ui/separator';
import { User, Settings, LogOut, Edit, Save, X, Camera, Shield, ArrowLeft, Gift, Phone, Mail } from 'lucide-react';
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

      <div className="container mx-auto px-4 py-6 max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 左侧：个人信息 */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <User className="w-5 h-5" />
                  个人资料
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* 头像和昵称 */}
                <div className="text-center space-y-3">
                  <AvatarUpload
                    currentAvatar={editForm.avatar}
                    nickname={editForm.nickname || user?.nickname || '用户'}
                    size="lg"
                    onAvatarChange={handleAvatarChange}
                    disabled={!isEditing}
                  />
                  
                  {isEditing ? (
                    <div className="space-y-2">
                      <NicknameSelector
                        currentNickname={editForm.nickname}
                        onNicknameChange={handleNicknameChange}
                        disabled={false}
                      />
                    </div>
                  ) : (
                    <div>
                      <h3 className="font-semibold text-lg">{editForm.nickname || '未设置昵称'}</h3>
                      <p className="text-sm text-gray-500">ID: {user.id}</p>
                    </div>
                  )}
                </div>

                <Separator />

                {/* 基本信息 */}
                <div className="space-y-3">
                  <h4 className="font-medium text-sm text-gray-700">基本信息</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">注册时间</span>
                      <span>{user.createdAt ? new Date(user.createdAt as string).toLocaleDateString('zh-CN') : '未知'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">使用次数</span>
                      <Badge variant="outline">{usageRemaining} 次</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">邀请用户</span>
                      <Badge variant="outline">{userInviteStats.totalRegistrations} 人</Badge>
                    </div>
                  </div>
                </div>

                {/* 邮箱补充奖励提示 */}
                {!user.email && (
                  <>
                    <Separator />
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <Gift className="w-4 h-4 text-amber-600" />
                        <span className="font-medium text-sm text-amber-800">补充邮箱奖励</span>
                      </div>
                      <p className="text-xs text-amber-700">首次验证邮箱可获得10次使用奖励</p>
                    </div>
                  </>
                )}

                <Separator />

                {/* 快捷操作 */}
                <div className="space-y-2">
                  <Button
                    variant="outline"
                    onClick={() => navigate('/invite')}
                    className="w-full justify-start"
                    size="sm"
                  >
                    <User className="w-4 h-4 mr-2" />
                    邀请好友
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={handleLogout}
                    className="w-full justify-start"
                    size="sm"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    退出登录
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 右侧：联系方式和统计 */}
          <div className="lg:col-span-2 space-y-6">
            {/* 联系方式验证 */}
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Shield className="w-5 h-5" />
                  联系方式验证
                </CardTitle>
                <CardDescription className="text-sm">
                  验证手机号和邮箱地址，提升账户安全性
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* 手机号验证 */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-gray-500" />
                      <Label className="font-medium">手机号码</Label>
                      {editForm.phone && (
                        <Badge variant="outline" className="text-xs bg-green-50 text-green-700">已验证</Badge>
                      )}
                    </div>
                    {isEditing ? (
                      <Input
                        placeholder="请输入手机号"
                        value={editForm.phone}
                        onChange={(e) => handlePhoneChange(e.target.value)}
                      />
                    ) : (
                      <div className="p-3 bg-gray-50 rounded-md">
                        <span className="text-sm">{editForm.phone || '未设置'}</span>
                      </div>
                    )}
                  </div>

                  {/* 邮箱验证 */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-gray-500" />
                      <Label className="font-medium">邮箱地址</Label>
                      {editForm.email && (
                        <Badge variant="outline" className="text-xs bg-green-50 text-green-700">已验证</Badge>
                      )}
                      {!editForm.email && (
                        <Badge variant="outline" className="text-xs bg-amber-50 text-amber-700">+10次奖励</Badge>
                      )}
                    </div>
                    {isEditing ? (
                      <Input
                        placeholder="请输入邮箱地址"
                        value={editForm.email}
                        onChange={(e) => handleEmailChange(e.target.value)}
                        type="email"
                      />
                    ) : (
                      <div className="p-3 bg-gray-50 rounded-md">
                        <span className="text-sm">{editForm.email || '未设置'}</span>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 使用统计 */}
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Settings className="w-5 h-5" />
                  使用统计
                </CardTitle>
                <CardDescription className="text-sm">
                  您的账户使用情况和数据统计
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-100">
                    <div className="text-2xl font-bold text-blue-600">{usageRemaining}</div>
                    <div className="text-sm text-blue-700">剩余使用量</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg border border-green-100">
                    <div className="text-2xl font-bold text-green-600">{userInviteStats.totalRegistrations}</div>
                    <div className="text-sm text-green-700">成功邀请</div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg border border-purple-100">
                    <div className="text-2xl font-bold text-purple-600">{userInviteStats.totalRegistrations * 20}</div>
                    <div className="text-sm text-purple-700">邀请奖励</div>
                  </div>
                </div>

                <Separator className="my-4" />

                {/* 奖励说明 */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-sm mb-2">奖励机制</h4>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p>• 每邀请1人注册，双方各获得20次使用奖励</p>
                    <p>• 首次验证邮箱，额外获得10次使用奖励</p>
                    <p>• 使用次数永久有效，不会过期</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
} 