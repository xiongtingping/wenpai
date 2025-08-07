/**
 * 个人中心页面
 * 显示用户信息、设置和账户管理功能
 */

import React, { useState } from 'react';
import { useUnifiedAuth } from "@/contexts/UnifiedAuthContext";
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
import TokenUsageSection from '@/components/profile/TokenUsageSection';
import { getUserDisplayName, getUserAvatar, getUserAvatarFallback, getUserAltText } from '@/utils/userDisplayUtils';
import { avatarService } from '@/services/avatarService';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

/**
 * 个人中心页面组件
 * @returns React组件
 */
export default function ProfilePage() {
  const { user, isAuthenticated, logout } = useUnifiedAuth();
  const { toast } = useToast();
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // ✅ FIXED: 个人资料表单状态 - 使用安全的用户信息获取函数
  const [profileForm, setProfileForm] = useState({
    nickname: getUserDisplayName(user, ''),
    phone: user?.phone || '',
    email: user?.email || '',
    avatar: getUserAvatar(user) // 使用导入的getUserAvatar函数
  });

  /**
   * 计算陪伴天数
   */
  const calculateCompanionDays = (registrationDate: string): number => {
    try {
      const regDate = new Date(registrationDate);
      const today = new Date();
      const diffTime = Math.abs(today.getTime() - regDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays;
    } catch (error) {
      console.warn('计算陪伴天数失败:', error);
      return 1; // 默认返回1天
    }
  };

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

  // 计算陪伴天数
  const companionDays = calculateCompanionDays(userStats.registrationDate);

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
   * 获取当前表单头像
   */
  const getCurrentFormAvatar = () => {
    if (profileForm.avatar) {
      return profileForm.avatar;
    }
    // 使用安全的显示名称生成头像种子
    const safeName = profileForm.nickname || getUserDisplayName(user, 'User');
    return `https://api.dicebear.com/7.x/initials/svg?seed=${safeName}`;
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
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/jpg,image/jpeg,image/png,image/webp';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      // 验证文件
      const validation = avatarService.validateImageFile(file);
      if (!validation.valid) {
        toast({
          title: "文件验证失败",
          description: validation.error,
          variant: "destructive"
        });
        return;
      }

      try {
        // 上传头像
        const result = await avatarService.uploadAvatar(file, user?.id || '');
        if (result.success && result.avatarUrl) {
          setProfileForm(prev => ({
            ...prev,
            avatar: result.avatarUrl
          }));
          setHasUnsavedChanges(true);

          toast({
            title: "头像上传成功",
            description: "您的头像已更新",
          });
        } else {
          throw new Error(result.error || '上传失败');
        }
      } catch (error) {
        console.error('头像上传失败:', error);
        toast({
          title: "上传失败",
          description: "头像上传失败，请稍后重试",
          variant: "destructive"
        });
      }
    };
    input.click();
  };

  /**
   * 生成随机头像
   */
  const handleRandomAvatar = () => {
    const safeName = getUserDisplayName(user, 'User');
    // 使用时间戳和随机数确保每次生成不同的头像
    const randomSeed = `${safeName}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newAvatar = avatarService.generateRandomAvatar(randomSeed);
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
    const safeUserId = userStats.userId || user?.id || 'unknown';
    const inviteLink = `${window.location.origin}?ref=${safeUserId}`;
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

  /**
   * 立即邀请好友
   */
  const handleInviteFriends = async () => {
    const safeUserId = userStats.userId || user?.id || 'unknown';
    const inviteLink = `${window.location.origin}?ref=${safeUserId}`;

    try {
      // 检查是否支持原生分享
      if (navigator.share) {
        await navigator.share({
          title: '文派AI - 智能内容创作平台',
          text: '我在使用文派AI创作内容，邀请你一起体验！注册即可获得20次免费使用机会。',
          url: inviteLink
        });

        toast({
          title: "分享成功",
          description: "邀请链接已分享",
        });
      } else {
        // 不支持原生分享，复制链接
        await navigator.clipboard.writeText(inviteLink);
        toast({
          title: "邀请链接已复制",
          description: "链接已复制到剪贴板，快去分享给好友吧！",
        });
      }
    } catch (error) {
      console.error('邀请分享失败:', error);

      // 分享失败，尝试复制链接
      try {
        await navigator.clipboard.writeText(inviteLink);
        toast({
          title: "邀请链接已复制",
          description: "链接已复制到剪贴板，快去分享给好友吧！",
        });
      } catch (copyError) {
        toast({
          title: "分享失败",
          description: "请手动复制邀请链接分享给好友",
          variant: "destructive"
        });
      }
    }
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


        {/* 第一行：个人资料（全宽） */}
        <div className="mb-8">
          <div>
            <Card className="h-full flex flex-col bg-white/80 backdrop-blur-sm shadow-xl border-0 rounded-2xl overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                <CardTitle className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xl font-bold">个人资料</div>
                    <div className="text-blue-100 text-sm font-normal">管理您的个人信息</div>
                  </div>
                </CardTitle>
              </CardHeader>

              {/* 融合的用户信息区域 */}
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 pb-6">
                <div className="flex flex-col items-center gap-4">
                  {/* 头像区域 */}
                  <div className="relative">
                    <Avatar className="w-20 h-20 border-4 border-white/30">
                      <AvatarImage
                        src={getCurrentFormAvatar()}
                        alt={getUserAltText(user, '头像')}
                      />
                      <AvatarFallback className="text-lg bg-white/20 text-white">
                        {getUserAvatarFallback(user)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="absolute -bottom-1 -right-1">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              size="sm"
                              variant="secondary"
                              className="w-8 h-8 rounded-full p-0 bg-white/90 hover:bg-white shadow-lg border-2 border-white/50"
                              onClick={handleRandomAvatar}
                            >
                              <Sparkles className="w-3 h-3 text-purple-600" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>生成随机头像</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </div>

                  {/* 用户基本信息 */}
                  <div className="text-center">
                    <h2 className="text-lg font-bold mb-2">
                      {getUserDisplayName(user, '用户')}
                    </h2>
                    <div className="flex flex-wrap gap-2 justify-center mb-3">
                      <Badge variant="secondary" className="bg-white/20 text-white border-white/30 text-xs">
                        <Crown className="w-3 h-3 mr-1" />
                        {userStats.accountType}
                      </Badge>
                      <Badge variant="secondary" className="bg-white/20 text-white border-white/30 text-xs">
                        <Activity className="w-3 h-3 mr-1" />
                        {userStats.usedCount}/{userStats.availableUses} 次
                      </Badge>
                    </div>

                    {/* 用户统计信息 */}
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="bg-white/10 backdrop-blur-sm rounded-lg p-2 border border-white/20">
                        <div className="text-white/70 mb-1">用户ID</div>
                        <div className="font-mono text-sm font-semibold">{userStats.userId}</div>
                      </div>
                      <div className="bg-white/10 backdrop-blur-sm rounded-lg p-2 border border-white/20">
                        <div className="text-white/70 flex items-center gap-1 mb-1">
                          已陪伴
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <button className="inline-flex items-center justify-center w-3 h-3 rounded-full bg-white/20 hover:bg-white/30 transition-colors">
                                  <span className="text-xs">ℹ️</span>
                                </button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>注册时间：{userStats.registrationDate}</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                        <div className="text-sm font-semibold">{companionDays}天</div>
                      </div>
                    </div>

                    {/* 上传头像按钮 */}
                    <div className="mt-3">
                      <Button variant="outline" size="sm" onClick={handleUploadAvatar} className="bg-white/10 border-white/20 text-white hover:bg-white/20 text-xs">
                        <Upload className="w-3 h-3 mr-1" />
                        上传头像
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
              <CardContent className="flex-1 flex flex-col p-6">
                <div className="flex-1 space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="nickname" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      昵称
                    </Label>
                    <Input
                      id="nickname"
                      value={profileForm.nickname}
                      onChange={(e) => handleFormChange('nickname', e.target.value)}
                      placeholder="请输入昵称"
                      className="h-12 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-0 transition-colors bg-gray-50/50"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      手机号
                    </Label>
                    <Input
                      id="phone"
                      value={profileForm.phone}
                      onChange={(e) => handleFormChange('phone', e.target.value)}
                      placeholder="请输入手机号"
                      className="h-12 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-0 transition-colors bg-gray-50/50"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                      <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                      邮箱
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={profileForm.email}
                      onChange={(e) => handleFormChange('email', e.target.value)}
                      placeholder="请输入邮箱"
                      className="h-12 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-0 transition-colors bg-gray-50/50"
                    />
                    <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-3">
                      <p className="text-xs text-purple-700 flex items-center gap-2">
                        <Gift className="w-3 h-3" />
                        首次验证奖励: 完成邮箱验证可获10次免费使用
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-gray-200">
                  <div className="space-y-4">
                    <Button
                      onClick={handleSaveProfile}
                      className="w-full h-12 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
                      disabled={!hasUnsavedChanges}
                    >
                      <Save className="w-5 h-5 mr-2" />
                      保存更改
                    </Button>

                    <Button
                      variant="outline"
                      className="w-full h-12 border-2 border-gray-300 hover:border-red-400 hover:bg-red-50 text-gray-700 hover:text-red-600 font-semibold rounded-xl transition-all duration-200"
                      onClick={handleLogout}
                    >
                      <LogOut className="w-5 h-5 mr-2" />
                      退出登录
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* 第二行：两列布局 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 左侧：使用统计 */}
          <div className="lg:col-span-1">
            <TokenUsageSection
              userTier={userStats.accountType === '体验版' ? 'trial' :
                       userStats.accountType === '专业版' ? 'pro' : 'premium'}
              showDetails={true}
            />
          </div>

          {/* 右侧：邀请奖励 */}
          <div className="lg:col-span-1">
            <Card className="h-full flex flex-col bg-white/80 backdrop-blur-sm shadow-xl border-0 rounded-2xl overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-pink-500 to-red-500 text-white">
                <CardTitle className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                    <Gift className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xl font-bold">邀请奖励</div>
                    <div className="text-pink-100 text-sm font-normal">邀请好友获得免费次数</div>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col p-8">
                <div className="flex-1 space-y-6">
                  {/* 奖励说明 */}
                  <div className="bg-gradient-to-br from-orange-50 to-red-50 p-6 rounded-2xl border-2 border-orange-200 shadow-inner">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                        <Award className="w-4 h-4 text-white" />
                      </div>
                      <span className="font-bold text-orange-800 text-lg">邀请奖励规则</span>
                    </div>
                    <p className="text-orange-700 font-medium">
                      每邀请1人注册，双方各得20次免费使用机会，永久有效！
                    </p>
                  </div>

                  {/* 邀请统计 */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl border-2 border-blue-200 shadow-inner">
                      <div className="text-3xl font-bold text-blue-600 mb-1">0</div>
                      <div className="text-sm font-semibold text-blue-700">成功邀请</div>
                    </div>
                    <div className="text-center p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-2xl border-2 border-green-200 shadow-inner">
                      <div className="text-3xl font-bold text-green-600 mb-1">0</div>
                      <div className="text-sm font-semibold text-green-700">获得次数</div>
                    </div>
                  </div>

                  {/* 邀请方式 */}
                  <div className="space-y-3">
                    <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                      <div className="w-2 h-2 bg-pink-500 rounded-full"></div>
                      邀请链接
                    </Label>
                    <div className="flex gap-3">
                      <Input
                        value={`${window.location.origin}?ref=${userStats.userId || user?.id || 'unknown'}`}
                        readOnly
                        className="text-xs h-12 border-2 border-gray-200 rounded-xl bg-gray-50/50 font-mono"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleCopyInviteLink}
                        className="h-12 px-4 border-2 border-pink-300 hover:border-pink-500 hover:bg-pink-50 text-pink-600 rounded-xl transition-all duration-200"
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-gray-200">
                  <Button
                    className="w-full h-14 text-white font-bold text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 btn-invite-gradient"
                    onClick={handleInviteFriends}
                  >
                    <Users className="w-5 h-5 mr-3" />
                    立即邀请好友
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

        </div>
      </div>
    </div>
  );
} 