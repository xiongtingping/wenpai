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
import { User, Settings, LogOut, Save, Camera, Shield, ArrowLeft, Gift, Phone, Mail, Crown, Calendar } from 'lucide-react';
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
  const [editForm, setEditForm] = useState({
    nickname: user?.nickname || '',
    email: user?.email || '',
    phone: user?.phone || '',
    avatar: user?.avatar || '',
  });

  // 模拟用户类型和过期时间
  const [userType, setUserType] = useState<'free' | 'pro'>('free'); // 可以是 'free' 或 'pro'
  const proExpiryDate = '2024-12-31'; // 专业版到期时间

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
    // 自动保存头像
    handleSaveField('avatar', newAvatar);
  };

  /**
   * 处理昵称更改
   */
  const handleNicknameChange = (newNickname: string) => {
    setEditForm(prev => ({ ...prev, nickname: newNickname }));
    // 自动保存昵称
    handleSaveField('nickname', newNickname);
  };

  /**
   * 处理邮箱更改
   */
  const handleEmailChange = (newEmail: string) => {
    setEditForm(prev => ({ ...prev, email: newEmail }));
    // 自动保存邮箱
    handleSaveField('email', newEmail);
  };

  /**
   * 处理手机号更改
   */
  const handlePhoneChange = (newPhone: string) => {
    setEditForm(prev => ({ ...prev, phone: newPhone }));
    // 自动保存手机号
    handleSaveField('phone', newPhone);
  };

  /**
   * 保存单个字段
   */
  const handleSaveField = async (field: string, value: string) => {
    if (!user) return;

    try {
      // 更新用户信息
      const updatedUser = {
        ...user,
        [field]: value,
        updatedAt: new Date().toISOString(),
      };

      // 更新AuthContext中的用户信息
      setUser(updatedUser);

      // 更新localStorage中的用户信息
      localStorage.setItem('authing_user', JSON.stringify(updatedUser));

      toast({
        title: "保存成功",
        description: `${field === 'nickname' ? '昵称' : field === 'email' ? '邮箱' : field === 'phone' ? '手机号' : '头像'}已更新`,
      });
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
          <Button variant="outline" onClick={() => navigate('/')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            返回首页
          </Button>
        }
      />

      <div className="container mx-auto px-4 py-6 max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 左侧：个人信息 */}
          <div className="space-y-6">
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <User className="w-5 h-5" />
                  个人资料
                  {userType === 'pro' && (
                    <Badge className="bg-amber-500 hover:bg-amber-600">
                      <Crown className="w-3 h-3 mr-1" />
                      专业版
                    </Badge>
                  )}
                  {userType === 'free' && (
                    <Badge variant="outline">免费版</Badge>
                  )}
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
                    disabled={false}
                  />
                  
                  <div className="space-y-2">
                    <NicknameSelector
                      currentNickname={editForm.nickname}
                      onNicknameChange={handleNicknameChange}
                      disabled={false}
                    />
                    <p className="text-sm text-gray-500">ID: {user.id}</p>
                  </div>
                </div>

                <Separator />

                {/* 账户状态 */}
                <div className="space-y-3">
                  <h4 className="font-medium text-sm text-gray-700">账户状态</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">账户类型</span>
                      <div className="flex items-center gap-2">
                        {userType === 'pro' ? (
                          <Badge className="bg-amber-500 hover:bg-amber-600">
                            <Crown className="w-3 h-3 mr-1" />
                            专业版
                          </Badge>
                        ) : (
                          <Badge variant="outline">免费版</Badge>
                        )}
                      </div>
                    </div>
                    {userType === 'pro' && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">有效期至</span>
                        <span className="text-amber-600 font-medium">{proExpiryDate}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-gray-600">注册时间</span>
                      <span>{user.createdAt ? new Date(user.createdAt as string).toLocaleDateString('zh-CN') : '未知'}</span>
                    </div>
                  </div>
                </div>

                {userType === 'pro' && (
                  <>
                    <Separator />
                    <div className="space-y-2">
                      <Button
                        variant="outline"
                        onClick={() => navigate('/subscription')}
                        className="w-full justify-start"
                        size="sm"
                      >
                        <Settings className="w-4 h-4 mr-2" />
                        订阅管理
                      </Button>
                    </div>
                  </>
                )}

                <Separator />

                {/* 快捷操作 */}
                <div className="space-y-2">
                  <Button
                    variant="outline"
                    onClick={() => navigate('/invite')}
                    className="w-full justify-between"
                    size="sm"
                  >
                    <div className="flex items-center">
                      <User className="w-4 h-4 mr-2" />
                      邀请好友 & 使用统计
                    </div>
                    <Badge variant="secondary">{userInviteStats.totalRegistrations} 人</Badge>
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

          {/* 右侧：联系方式 */}
          <div className="space-y-6">
            {/* 联系方式验证 */}
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Shield className="w-5 h-5" />
                  联系方式
                </CardTitle>
                <CardDescription className="text-sm">
                  验证手机号和邮箱地址，提升账户安全性
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* 手机号验证 */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-gray-500" />
                      <Label className="font-medium">手机号码</Label>
                      {editForm.phone && (
                        <Badge variant="outline" className="text-xs bg-green-50 text-green-700">已验证</Badge>
                      )}
                    </div>
                    <Input
                      placeholder="请输入手机号"
                      value={editForm.phone}
                      onChange={(e) => handlePhoneChange(e.target.value)}
                    />
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
                    <Input
                      placeholder="请输入邮箱地址"
                      value={editForm.email}
                      onChange={(e) => handleEmailChange(e.target.value)}
                      type="email"
                    />
                  </div>
                </div>

                {/* 邮箱补充奖励提示 */}
                {!user.email && (
                  <div className="mt-4 bg-amber-50 border border-amber-200 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <Gift className="w-4 h-4 text-amber-600" />
                      <span className="font-medium text-sm text-amber-800">补充邮箱奖励</span>
                    </div>
                    <p className="text-xs text-amber-700">首次验证邮箱可获得10次使用奖励</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* 奖励说明 */}
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Gift className="w-5 h-5" />
                  奖励机制
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm text-gray-600">
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <span>每邀请1人注册</span>
                    <Badge className="bg-blue-100 text-blue-700">双方各获得20次</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-amber-50 rounded-lg">
                    <span>首次验证邮箱</span>
                    <Badge className="bg-amber-100 text-amber-700">额外获得10次</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <span>使用次数永久有效</span>
                    <Badge className="bg-green-100 text-green-700">不会过期</Badge>
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