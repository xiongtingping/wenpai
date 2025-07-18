/**
 * 个人中心页面
 * 显示用户信息、设置和账户管理功能
 */

import React, { useState } from 'react';
import { useUnifiedAuth } from '@/contexts/UnifiedAuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { 
  User,
  Settings,
  Shield,
  Activity,
  Crown,
  Calendar,
  Mail,
  Phone,
  MapPin,
  Edit,
  LogOut,
  Download,
  Upload,
  Trash2,
  Bell,
  Eye,
  EyeOff,
  Key,
  CreditCard,
  HelpCircle,
  Info,
  Save,
  Copy,
  Gift,
  Users,
  Clock,
  FileText,
  Sparkles,
  TrendingUp,
  Award,
  Zap
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import PageNavigation from '@/components/layout/PageNavigation';

/**
 * 个人中心页面组件
 * @returns React组件
 */
export default function ProfilePage() {
  const { user, isAuthenticated, logout } = useUnifiedAuth();
  const { toast } = useToast();
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // 个人资料表单状态
  const [profileForm, setProfileForm] = useState({
    nickname: user?.nickname || user?.username || '',
    phone: user?.phone || '',
    email: user?.email || '',
    avatar: user?.avatar || ''
  });

  // 模拟用户数据
  const userStats = {
    userId: 'temp_1752390537259_3180',
    accountType: '体验版',
    availableUses: 10,
    tokenLimit: 100000,
    usedTokens: 25000,
    usedCount: 3,
    registrationDate: '2025/7/12',
    timeSaved: 45, // 分钟
    contentGenerated: 3
  };

  // 如果用户未登录，显示登录提示
  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <PageNavigation
          title="个人中心"
          description="管理您的账户信息和设置"
          showAdaptButton={false}
        />
        <div className="container mx-auto px-4 py-8">
          <Card className="max-w-md mx-auto">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                请先登录
              </CardTitle>
              <CardDescription>
                登录后可以查看和管理您的个人中心
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" onClick={() => window.location.href = '/'}>
                返回首页
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  /**
   * 处理登出
   */
  const handleLogout = async () => {
    try {
      await logout();
      toast({
        title: "登出成功",
        description: "您已成功登出账户",
      });
    } catch (error) {
      toast({
        title: "登出失败",
        description: "请稍后重试",
        variant: "destructive",
      });
    }
  };

  /**
   * 获取用户头像
   */
  const getUserAvatar = () => {
    if (profileForm.avatar) {
      return profileForm.avatar;
    }
    return `https://api.dicebear.com/7.x/initials/svg?seed=${profileForm.nickname || user.username}`;
  };

  /**
   * 处理表单变化
   */
  const handleFormChange = (field: string, value: string) => {
    setProfileForm(prev => ({
      ...prev,
      [field]: value
    }));
    setHasUnsavedChanges(true);
  };

  /**
   * 保存个人资料
   */
  const handleSaveProfile = () => {
    // 这里应该调用API保存数据
    toast({
      title: "保存成功",
      description: "个人资料已更新",
    });
    setHasUnsavedChanges(false);
  };

  /**
   * 上传头像
   */
  const handleUploadAvatar = () => {
    // 这里应该实现文件上传逻辑
    toast({
      title: "功能开发中",
      description: "头像上传功能即将上线",
    });
  };

  /**
   * 生成随机头像
   */
  const handleRandomAvatar = () => {
    const randomSeed = Math.random().toString(36).substring(7);
    const newAvatar = `https://api.dicebear.com/7.x/initials/svg?seed=${randomSeed}`;
    setProfileForm(prev => ({
      ...prev,
      avatar: newAvatar
    }));
    setHasUnsavedChanges(true);
    toast({
      title: "头像已更新",
      description: "已生成新的随机头像",
    });
  };

  /**
   * 复制邀请链接
   */
  const handleCopyInviteLink = () => {
    const inviteLink = `${window.location.origin}?ref=${userStats.userId}`;
    navigator.clipboard.writeText(inviteLink);
    toast({
      title: "邀请链接已复制",
      description: "链接已复制到剪贴板",
    });
  };

  /**
   * 复制推荐码
   */
  const handleCopyReferralCode = () => {
    navigator.clipboard.writeText(userStats.userId);
    toast({
      title: "推荐码已复制",
      description: "推荐码已复制到剪贴板",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <PageNavigation
        title="个人中心"
        description="管理您的账户信息和设置"
        showAdaptButton={false}
      />

      {/* 未保存更改提示 */}
      {hasUnsavedChanges && (
        <div className="bg-amber-50 border-l-4 border-amber-400 p-4 mb-6">
          <div className="flex items-center">
            <Info className="h-5 w-5 text-amber-400 mr-3" />
            <p className="text-sm text-amber-700">
              您有未保存的更改，请点击保存按钮
            </p>
          </div>
        </div>
      )}

      <div className="container mx-auto px-4 py-8">
        {/* 顶部用户信息卡片 */}
        <div className="mb-8">
          <Card className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
            <CardContent className="p-8">
              <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                {/* 头像区域 */}
                <div className="text-center md:text-left">
                  <div className="relative inline-block">
                    <Avatar className="w-24 h-24 border-4 border-white/20">
                      <AvatarImage src={getUserAvatar()} alt={profileForm.nickname} />
                      <AvatarFallback className="text-2xl bg-white/20 text-white">
                        {profileForm.nickname?.charAt(0) || user.username?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="absolute -bottom-2 -right-2">
                      <Button 
                        size="sm" 
                        variant="secondary" 
                        className="w-8 h-8 rounded-full p-0"
                        onClick={handleRandomAvatar}
                      >
                        <Sparkles className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="mt-4 space-y-2">
                    <Button variant="outline" size="sm" onClick={handleUploadAvatar} className="bg-white/10 border-white/20 text-white hover:bg-white/20">
                      <Upload className="w-4 h-4 mr-2" />
                      上传头像
                    </Button>
                  </div>
                </div>

                {/* 用户信息 */}
                <div className="flex-1 text-center md:text-left">
                  <h1 className="text-3xl font-bold mb-2">
                    {profileForm.nickname || user.username || '用户'}
                  </h1>
                  <div className="flex flex-wrap gap-4 justify-center md:justify-start mb-4">
                    <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                      <Crown className="w-3 h-3 mr-1" />
                      {userStats.accountType}
                    </Badge>
                    <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                      <Activity className="w-3 h-3 mr-1" />
                      {userStats.usedCount}/{userStats.availableUses} 次使用
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <div className="text-white/70">用户ID</div>
                      <div className="font-mono">{userStats.userId}</div>
                    </div>
                    <div>
                      <div className="text-white/70">注册时间</div>
                      <div>{userStats.registrationDate}</div>
                    </div>
                    <div>
                      <div className="text-white/70">Token使用</div>
                      <div>{userStats.usedTokens.toLocaleString()}/{userStats.tokenLimit.toLocaleString()}</div>
                    </div>
                    <div>
                      <div className="text-white/70">已节省时间</div>
                      <div>{userStats.timeSaved}分钟</div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 主要内容区域 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 左侧：个人资料 */}
          <div className="lg:col-span-1">
            <Card className="h-full flex flex-col">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  个人资料
                </CardTitle>
                <CardDescription>
                  管理您的个人信息
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col">
                <div className="flex-1 space-y-4">
                  <div>
                    <Label htmlFor="nickname">昵称</Label>
                    <Input
                      id="nickname"
                      value={profileForm.nickname}
                      onChange={(e) => handleFormChange('nickname', e.target.value)}
                      placeholder="请输入昵称"
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="phone">手机号</Label>
                    <Input
                      id="phone"
                      value={profileForm.phone}
                      onChange={(e) => handleFormChange('phone', e.target.value)}
                      placeholder="请输入手机号"
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="email">邮箱</Label>
                    <Input
                      id="email"
                      type="email"
                      value={profileForm.email}
                      onChange={(e) => handleFormChange('email', e.target.value)}
                      placeholder="请输入邮箱"
                      className="mt-1"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      首次验证奖励: 完成邮箱验证可获10次免费使用
                    </p>
                  </div>
                </div>

                <Separator className="my-6" />

                <div className="space-y-3">
                  <Button 
                    onClick={handleSaveProfile}
                    className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                    disabled={!hasUnsavedChanges}
                  >
                    <Save className="w-4 h-4 mr-2" />
                    保存更改
                  </Button>

                  <Button variant="outline" className="w-full" onClick={handleLogout}>
                    <LogOut className="w-4 h-4 mr-2" />
                    退出登录
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 中间：使用统计 */}
          <div className="lg:col-span-1">
            <Card className="h-full flex flex-col">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  使用统计
                </CardTitle>
                <CardDescription>
                  查看您的使用情况
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col">
                <div className="flex-1 space-y-6">
                  {/* 使用进度 */}
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">使用次数</span>
                      <span className="text-sm text-gray-600">{userStats.usedCount}/{userStats.availableUses}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${(userStats.usedCount / userStats.availableUses) * 100}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Token使用量</span>
                      <span className="text-sm text-gray-600">{userStats.usedTokens.toLocaleString()}/{userStats.tokenLimit.toLocaleString()}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-blue-500 to-cyan-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${(userStats.usedTokens / userStats.tokenLimit) * 100}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* 统计卡片 */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gradient-to-br from-purple-100 to-pink-100 p-4 rounded-lg text-center">
                      <div className="text-2xl font-bold text-purple-600">{userStats.timeSaved}</div>
                      <div className="text-sm text-purple-600">分钟节省</div>
                    </div>
                    <div className="bg-gradient-to-br from-green-100 to-emerald-100 p-4 rounded-lg text-center">
                      <div className="text-2xl font-bold text-green-600">{userStats.contentGenerated}</div>
                      <div className="text-sm text-green-600">内容生成</div>
                    </div>
                  </div>
                </div>

                <Button className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white mt-6">
                  <Crown className="w-4 h-4 mr-2" />
                  解锁高级功能
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* 右侧：邀请奖励 */}
          <div className="lg:col-span-1">
            <Card className="h-full flex flex-col">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Gift className="w-5 h-5" />
                  邀请奖励
                </CardTitle>
                <CardDescription>
                  邀请好友获得免费次数
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col">
                <div className="flex-1 space-y-6">
                  {/* 奖励说明 */}
                  <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-4 rounded-lg border border-blue-200">
                    <div className="flex items-center gap-2 mb-2">
                      <Award className="w-5 h-5 text-blue-600" />
                      <span className="font-semibold text-blue-800">邀请奖励规则</span>
                    </div>
                    <p className="text-sm text-blue-700">
                      每邀请1人注册，双方各得20次免费使用机会，永久有效！
                    </p>
                  </div>

                  {/* 邀请统计 */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <div className="text-xl font-bold text-gray-800">0</div>
                      <div className="text-sm text-gray-600">成功邀请</div>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <div className="text-xl font-bold text-gray-800">0</div>
                      <div className="text-sm text-gray-600">获得次数</div>
                    </div>
                  </div>

                  {/* 邀请方式 */}
                  <div className="space-y-3">
                    <Label>邀请链接</Label>
                    <div className="flex gap-2">
                      <Input value={`${window.location.origin}?ref=${userStats.userId}`} readOnly className="text-xs" />
                      <Button variant="outline" size="sm" onClick={handleCopyInviteLink}>
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                <Button className="w-full bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white mt-6">
                  <Users className="w-4 h-4 mr-2" />
                  立即邀请好友
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
} 