/**
 * 个人中心页面
 * 显示用户信息、设置和账户管理功能
 */

import React, { useState, useEffect } from 'react';
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
  Zap,
  RefreshCw,
  Check,
  AlertCircle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import PageNavigation from '@/components/layout/PageNavigation';
import TokenUsageSection from '@/components/profile/TokenUsageSection';
import { getUserDisplayName, getUserAvatar, getUserAvatarFallback, getUserAltText } from '@/utils/userDisplayUtils';
import { avatarService } from '@/services/avatarService';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import AuthService from '@/services/authService';
import { isDevelopment } from '@/utils/env-validator';

/**
 * 个人中心页面组件
 * @returns React组件
 */
export default function ProfilePage() {
  const { user, isAuthenticated, logout, updateUser } = useUnifiedAuth();
  const { toast } = useToast();
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isVerifyingPhone, setIsVerifyingPhone] = useState(false);
  const [isVerifyingEmail, setIsVerifyingEmail] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState({
    phone: false,
    email: false
  });
  const [verificationCodes, setVerificationCodes] = useState({
    phone: '',
    email: ''
  });
  const [showVerificationInput, setShowVerificationInput] = useState({
    phone: false,
    email: false
  });
  const [avatarKey, setAvatarKey] = useState(0); // 用于强制刷新头像

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

  /**
   * 根据账户类型生成对应的统计数据
   */
  const generateUserStatsByAccountType = (accountType: string) => {
    const baseStats = {
      userId: 'temp_1752390537259_3180',
      accountType,
      usedCount: 3,
      registrationDate: '2025/7/12',
      timeSaved: 45,
      contentGenerated: 3
    };

    switch (accountType) {
      case '体验版':
        return {
          ...baseStats,
          availableUses: 10,
          tokenLimit: 100000,
          usedTokens: 25000
        };
      case '专业版':
        return {
          ...baseStats,
          availableUses: 100,
          tokenLimit: 500000,
          usedTokens: 125000
        };
      case '高级版':
        return {
          ...baseStats,
          availableUses: -1, // 无限制
          tokenLimit: -1,    // 无限制
          usedTokens: 250000
        };
      default:
        return {
          ...baseStats,
          availableUses: 10,
          tokenLimit: 100000,
          usedTokens: 25000
        };
    }
  };

  // 模拟用户数据 - 可以修改accountType来测试不同版本
  const userStats = generateUserStatsByAccountType('体验版'); // 可改为：'专业版' 或 '高级版'

  // 计算陪伴天数
  const companionDays = calculateCompanionDays(userStats.registrationDate);



  /**
   * 生成本地SVG头像（用于默认头像）
   */
  const generateLocalSVGAvatar = (seed: string, bgColor: string = '6366f1') => {
    const initials = seed.substr(0, 2).toUpperCase();

    const svg = `
      <svg width="200" height="200" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="bg-${seed}" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#${bgColor};stop-opacity:1" />
            <stop offset="100%" style="stop-color:#${bgColor}dd;stop-opacity:1" />
          </linearGradient>
        </defs>
        <rect width="200" height="200" rx="100" fill="url(#bg-${seed})" />
        <text x="100" y="120" font-family="Arial, sans-serif" font-size="60" font-weight="bold" text-anchor="middle" fill="hsl(var(--background))">${initials}</text>
      </svg>
    `;

    return `data:image/svg+xml;base64,${btoa(svg)}`;
  };

  /**
   * 获取当前表单头像
   */
  const getCurrentFormAvatar = () => {
    // 如果有自定义头像，直接返回
    if (profileForm.avatar) {
      console.log('🖼️ 使用自定义头像:', profileForm.avatar);
      return profileForm.avatar;
    }

    // 使用本地SVG生成默认头像
    const safeName = profileForm.nickname || getUserDisplayName(user, 'User');
    const defaultAvatar = generateLocalSVGAvatar(safeName, '6366f1');

    console.log('🔤 使用本地SVG默认头像:', {
      'profileForm.nickname': profileForm.nickname,
      'getUserDisplayName(user)': getUserDisplayName(user, 'User'),
      'safeName': safeName,
      'user': user,
      'defaultAvatar': defaultAvatar.substr(0, 50) + '...'
    });
    return defaultAvatar;
  };

  /**
   * 获取当前显示的头像fallback文字
   */
  const getCurrentAvatarFallback = () => {
    // 优先使用表单中的昵称
    const displayName = profileForm.nickname || getUserDisplayName(user, 'User');

    // 如果显示名称为空或者是默认值，返回U
    if (!displayName || displayName === 'User' || displayName === '用户') {
      return 'U';
    }

    const firstChar = displayName.charAt(0);

    // 如果是中文字符，根据常见中文名字映射到英文字母
    if (/[\u4e00-\u9fa5]/.test(firstChar)) {
      // 常见中文姓氏映射
      const chineseToEnglish: { [key: string]: string } = {
        '张': 'Z', '王': 'W', '李': 'L', '赵': 'Z', '陈': 'C', '刘': 'L', '杨': 'Y', '黄': 'H',
        '周': 'Z', '吴': 'W', '徐': 'X', '孙': 'S', '马': 'M', '朱': 'Z', '胡': 'H', '林': 'L',
        '郭': 'G', '何': 'H', '高': 'G', '罗': 'L', '郑': 'Z', '梁': 'L', '谢': 'X', '宋': 'S'
      };

      return chineseToEnglish[firstChar] || 'U';
    }

    // 英文字符直接返回大写
    return firstChar.toUpperCase();
  };

  // 调试信息 - 必须在所有条件渲染之前
  useEffect(() => {
    console.log('🔍 ProfilePage状态调试:', {
      'profileForm.avatar': profileForm.avatar,
      'getCurrentFormAvatar()': getCurrentFormAvatar(),
      'getCurrentAvatarFallback()': getCurrentAvatarFallback(),
      'avatarKey': avatarKey,
      'user': user,
      'profileForm': profileForm
    });
  }, [profileForm.avatar, avatarKey, user, profileForm]);

  // 如果用户未登录，显示登录提示
  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-background">
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
  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      // 正式环境：调用后端（Authing）更新资料
      if (!isDevelopment()) {
        const authService = AuthService.getInstance();
        const accessToken = (user as any)?.accessToken || '';
        const remote = await authService.updateUserInfo(accessToken, {
          nickname: profileForm.nickname,
          email: profileForm.email,
          phone: profileForm.phone,
          photo: profileForm.avatar
        });
        // 以服务端为准更新前端
        updateUser({
          nickname: remote.nickname || profileForm.nickname,
          email: remote.email || profileForm.email,
          phone: remote.phone || profileForm.phone,
          avatar: remote.avatar || remote.photo || profileForm.avatar
        });
      } else {
        // 开发环境：直接更新前端上下文与本地存储
        updateUser({
          nickname: profileForm.nickname,
          email: profileForm.email,
          phone: profileForm.phone,
          avatar: profileForm.avatar
        });
      }

      toast({
        title: "保存成功",
        description: "个人资料已更新",
      });
      setHasUnsavedChanges(false);
    } catch (error) {
      toast({
        title: "保存失败",
        description: "请稍后重试",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  /**
   * 发送手机验证码
   */
  const handleSendPhoneCode = async () => {
    if (!profileForm.phone) {
      toast({
        title: "请先输入手机号",
        description: "请输入有效的手机号码",
        variant: "destructive",
      });
      return;
    }

    setIsVerifyingPhone(true);
    try {
      // 这里应该调用API发送验证码
      // await sendPhoneVerificationCode(profileForm.phone);

      setShowVerificationInput(prev => ({ ...prev, phone: true }));
      toast({
        title: "验证码已发送",
        description: "请查收短信验证码并在下方输入",
      });
    } catch (error) {
      toast({
        title: "发送失败",
        description: "发送验证码失败，请稍后重试",
        variant: "destructive",
      });
    } finally {
      setIsVerifyingPhone(false);
    }
  };

  /**
   * 验证手机号码
   */
  const handleVerifyPhone = async () => {
    if (!verificationCodes.phone) {
      toast({
        title: "请输入验证码",
        description: "请输入收到的短信验证码",
        variant: "destructive",
      });
      return;
    }

    setIsVerifyingPhone(true);
    try {
      // 这里应该调用API验证验证码
      // await verifyPhoneCode(profileForm.phone, verificationCodes.phone);

      setVerificationStatus(prev => ({ ...prev, phone: true }));
      setShowVerificationInput(prev => ({ ...prev, phone: false }));
      toast({
        title: "手机号验证成功",
        description: "您的手机号已验证",
      });
    } catch (error) {
      toast({
        title: "验证失败",
        description: "验证码错误，请重新输入",
        variant: "destructive",
      });
    } finally {
      setIsVerifyingPhone(false);
    }
  };

  /**
   * 发送邮箱验证码
   */
  const handleSendEmailCode = async () => {
    if (!profileForm.email) {
      toast({
        title: "请先输入邮箱",
        description: "请输入有效的邮箱地址",
        variant: "destructive",
      });
      return;
    }

    setIsVerifyingEmail(true);
    try {
      // 这里应该调用API发送验证邮件
      // await sendEmailVerification(profileForm.email);

      setShowVerificationInput(prev => ({ ...prev, email: true }));
      toast({
        title: "验证码已发送",
        description: "请查收邮箱中的验证码并在下方输入",
      });
    } catch (error) {
      toast({
        title: "发送失败",
        description: "发送验证码失败，请稍后重试",
        variant: "destructive",
      });
    } finally {
      setIsVerifyingEmail(false);
    }
  };

  /**
   * 验证邮箱
   */
  const handleVerifyEmail = async () => {
    if (!verificationCodes.email) {
      toast({
        title: "请输入验证码",
        description: "请输入收到的邮箱验证码",
        variant: "destructive",
      });
      return;
    }

    setIsVerifyingEmail(true);
    try {
      // 这里应该调用API验证验证码
      // await verifyEmailCode(profileForm.email, verificationCodes.email);

      setVerificationStatus(prev => ({ ...prev, email: true }));
      setShowVerificationInput(prev => ({ ...prev, email: false }));
      toast({
        title: "邮箱验证成功",
        description: "您的邮箱已验证，获得10次免费使用机会！",
      });
    } catch (error) {
      toast({
        title: "验证失败",
        description: "验证码错误，请重新输入",
        variant: "destructive",
      });
    } finally {
      setIsVerifyingEmail(false);
    }
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
   * 生成随机动物头像 - 使用统一emoji系统
   */
  const handleRandomAvatar = async () => {
    console.log('🎨 开始生成随机动物头像...');

    try {
      // 动态导入统一emoji系统
      const { getRandomEmojis, getAllEmojis, generateEmojiSVG } = await import('@/services/unifiedEmojiSystem');

      // 优先从“动物类”选择，若不足则退回“全量”
      let pool = getRandomEmojis(1, 'animals');
      if (pool.length === 0) {
        const all = getAllEmojis();
        if (all.length === 0) throw new Error('没有可用的emoji');
        pool = [all[Math.floor(Math.random() * all.length)]];
      }

      const selectedEmoji = pool[0];

      console.log('🎨 选择的动物:', {
        id: selectedEmoji.id,
        name: selectedEmoji.name,
        emoji: selectedEmoji.emoji,
        color: selectedEmoji.color
      });

      // 生成动物头像SVG
      const avatarUrl = generateEmojiSVG(selectedEmoji);

      console.log('🎯 生成的动物头像:', {
        animal: selectedEmoji.name,
        avatarUrl: avatarUrl.substr(0, 50) + '...'
      });

      // 直接更新头像（本地表单 + 全局用户上下文），确保顶部头像同步
      setProfileForm(prev => ({
        ...prev,
        avatar: avatarUrl
      }));
      updateUser({ avatar: avatarUrl });
      setHasUnsavedChanges(true);
      setAvatarKey(prev => prev + 1);

      toast({
        title: "头像已更新",
        description: `随机选择了可爱的${selectedEmoji.name} ${selectedEmoji.emoji}`,
      });

      console.log('✅ 动物头像更新完成');

    } catch (error) {
      console.error('❌ 随机动物头像生成失败:', error);
      toast({
        title: "生成失败",
        description: "动物头像生成失败，请重试",
        variant: "destructive",
      });
    }
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
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* 🎨 Modern Flat + Soft Neumorphism 背景装饰 - 统一轻量化 */}
      <div className="relative z-10">
        <PageNavigation
          title="个人中心"
          description="管理您的账户信息和设置"
          showAdaptButton={false}
        />



      {/* 使用更宽的容器，减少两侧空白 */}
      <div className="max-w-7xl mx-auto px-4 py-8">

        {/* 🎨 个人资料区域 - Modern Flat + Soft Neumorphism */}
        <div className="mb-6">
          <Card variant="soft" className="rounded-xl overflow-hidden relative">
            <CardHeader className="border-b border-border relative z-10 rounded-t-xl bg-card">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-card/20 backdrop-blur-sm rounded-lg flex items-center justify-center shadow-e0">
                    <User className="w-6 h-6 drop-shadow-sm text-foreground" />
                  </div>
                  <div>
                    <div className="text-xl font-bold text-foreground">个人资料</div>
                    <div className="text-sm font-normal text-muted-foreground">管理您的个人信息</div>
                  </div>
                </div>
              </div>
            </CardHeader>

            {/* 精简的内容区域 - 使用两列布局 */}
            <CardContent className="p-6 relative z-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* 左侧：头像和基本信息 */}
                <div className="lg:col-span-1">
                  <div className="rounded-xl p-5 border border-border bg-card shadow-e0">
                    <div className="text-center space-y-3">
                      {/* 头像区域 */}
                      <div className="relative inline-block">
                        <Avatar key={avatarKey} className="w-20 h-20 border-2 border-border shadow-e1">
                          <AvatarImage
                            src={getCurrentFormAvatar()}
                            alt={getUserAltText(user, '头像')}
                            onError={() => {
                              console.log('❌ 头像加载失败:', getCurrentFormAvatar());
                              toast({
                                title: "头像加载失败",
                                description: "头像服务暂时不可用",
                                variant: "destructive",
                              });
                            }}
                            onLoad={() => {
                              console.log('✅ 头像加载成功:', getCurrentFormAvatar());
                            }}
                          />
                          <AvatarFallback className="text-lg bg-accent text-foreground">
                            {getCurrentAvatarFallback()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="absolute -bottom-1 -right-1">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  size="sm"
                                  variant="gradient"
                                  className="w-8 h-8 rounded-full p-0 border-2 border-border"
                                  onClick={() => {
                                    console.log('🎯 点击随机头像按钮');
                                    console.log('🎯 当前头像URL:', getCurrentFormAvatar());
                                    handleRandomAvatar();
                                  }}
                                >
                                  <Sparkles className="w-4 h-4 text-primary-foreground drop-shadow-sm" />
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
                      <div>
                        <h2 className="text-lg font-bold text-foreground mb-2">
                          {profileForm.nickname || getUserDisplayName(user, '用户')}
                        </h2>
                        <div className="flex flex-wrap gap-1 justify-center mb-3">
                          <Badge
                            variant={
                              userStats.accountType === '体验版' ? 'secondary' :
                              userStats.accountType === '专业版' ? 'default' :
                              'premium'
                            }
                            className="text-xs"
                          >
                            <Crown className="w-3 h-3 mr-1" />
                            {userStats.accountType}
                          </Badge>
                        </div>

                        {/* 上传头像按钮 */}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleUploadAvatar}
                          className="h-8 text-xs border-border bg-card hover:bg-accent text-foreground"
                        >
                          <Upload className="w-3 h-3 mr-1 text-muted-foreground" />
                          上传头像
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* 用户统计信息卡片 */}
                  <div className="mt-4 grid grid-cols-1 gap-3">
                    <div className="rounded-lg p-3 border border-border shadow-e0 bg-card">
                      <div className="text-muted-foreground text-xs mb-1 flex items-center gap-2">
                        <div className="w-2 h-2 bg-muted-foreground/40 rounded-full"></div>
                        用户ID
                      </div>
                      <div className="font-mono text-sm font-semibold text-foreground break-all tabular-nums">{userStats.userId}</div>
                    </div>
                    <div className="rounded-lg p-3 border border-border shadow-e0 bg-card">
                      <div className="text-muted-foreground text-xs mb-1 flex items-center gap-2">
                        <div className="w-2 h-2 bg-muted-foreground/40 rounded-full"></div>
                        已陪伴
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-accent hover:bg-accent/80 transition-smooth">
                                <span className="text-xs">ℹ️</span>
                              </button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>注册时间：{userStats.registrationDate}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                      <div className="text-base font-semibold text-foreground tabular-nums">{companionDays}天</div>
                    </div>
                  </div>
                </div>
                {/* 右侧：表单区域 */}
                <div className="md:col-span-1">
                  <div className="rounded-xl p-5 border border-border h-full shadow-e0 bg-card">
                    <h3 className="text-base font-bold text-foreground mb-4">
                      编辑信息
                    </h3>

                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="nickname" className="text-xs font-semibold text-muted-foreground flex items-center gap-2">
                          <div className="w-2 h-2 bg-primary rounded-full"></div>
                          昵称
                        </Label>
                        <Input
                          id="nickname"
                          value={profileForm.nickname}
                          onChange={(e) => handleFormChange('nickname', e.target.value)}
                          placeholder="请输入昵称"
                          className="h-9 border border-border rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/25 transition-smooth bg-card text-sm"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="phone" className="text-xs font-semibold text-muted-foreground flex items-center gap-2">
                          <div className="w-2 h-2 bg-primary rounded-full"></div>
                          手机号
                          {verificationStatus.phone && (
                            <Check className="w-3 h-3 text-green-500" />
                          )}
                        </Label>
                        <div className="flex gap-2">
                          <Input
                            id="phone"
                            value={profileForm.phone}
                            onChange={(e) => handleFormChange('phone', e.target.value)}
                            placeholder="请输入手机号"
                            className="h-9 border border-border rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/25 transition-smooth bg-card text-sm flex-1"
                            disabled={verificationStatus.phone}
                          />
                          <Button
                            variant="soft"
                            size="sm"
                            onClick={showVerificationInput.phone ? handleVerifyPhone : handleSendPhoneCode}
                            disabled={isVerifyingPhone || !profileForm.phone || verificationStatus.phone}
                            className="h-9 px-3 text-primary hover:text-foreground text-xs"
                          >
                            {isVerifyingPhone ? (
                              <RefreshCw className="w-3 h-3 animate-spin text-foreground" />
                            ) : verificationStatus.phone ? (
                              <Check className="w-3 h-3 text-green-500" />
                            ) : showVerificationInput.phone ? (
                              '确认'
                            ) : (
                              '发送验证码'
                            )}
                          </Button>
                        </div>

                        {/* 验证码输入框 */}
                        {showVerificationInput.phone && !verificationStatus.phone && (
                          <div className="mt-2">
                            <Input
                              value={verificationCodes.phone}
                              onChange={(e) => setVerificationCodes(prev => ({ ...prev, phone: e.target.value }))}
                              placeholder="请输入短信验证码"
                              className="h-9 border border-border rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/25 transition-smooth bg-accent text-sm"
                              maxLength={6}
                            />
                          </div>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-xs font-semibold text-muted-foreground flex items-center gap-2">
                          <div className="w-2 h-2 bg-primary rounded-full"></div>
                          邮箱
                          {verificationStatus.email && (
                            <Check className="w-3 h-3 text-green-500" />
                          )}
                        </Label>
                        <div className="flex gap-2">
                          <Input
                            id="email"
                            type="email"
                            value={profileForm.email}
                            onChange={(e) => handleFormChange('email', e.target.value)}
                            placeholder="请输入邮箱"
                            className="h-9 border border-border rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/25 transition-smooth bg-card text-sm flex-1"
                            disabled={verificationStatus.email}
                          />
                          <Button
                            variant="soft"
                            size="sm"
                            onClick={showVerificationInput.email ? handleVerifyEmail : handleSendEmailCode}
                            disabled={isVerifyingEmail || !profileForm.email || verificationStatus.email}
                            className="h-9 px-3 text-primary hover:text-foreground text-xs"
                          >
                            {isVerifyingEmail ? (
                              <RefreshCw className="w-3 h-3 animate-spin text-foreground" />
                            ) : verificationStatus.email ? (
                              <Check className="w-3 h-3 text-green-500" />
                            ) : showVerificationInput.email ? (
                              '确认'
                            ) : (
                              '发送验证码'
                            )}
                          </Button>
                        </div>

                        {/* 验证码输入框 */}
                        {showVerificationInput.email && !verificationStatus.email && (
                          <div className="mt-2">
                            <Input
                              value={verificationCodes.email}
                              onChange={(e) => setVerificationCodes(prev => ({ ...prev, email: e.target.value }))}
                              placeholder="请输入邮箱验证码"
                              className="h-9 border border-border rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/25 transition-smooth bg-accent text-sm"
                              maxLength={6}
                            />
                          </div>
                        )}

                        <div className={`border rounded-md p-2 ${
                          verificationStatus.email ? 'border-border' : 'border-border'
                        }`}>
                          <p className={`text-xs flex items-center gap-2 ${
                            verificationStatus.email ? 'text-foreground' : 'text-muted-foreground'
                          }`}>
                            {verificationStatus.email ? (
                              <>
                                <Check className="w-3 h-3 text-green-500" />
                                验证成功！已获得10次免费使用机会
                              </>
                            ) : (
                              <>
                                <Gift className="w-3 h-3 text-primary" />
                                首次验证奖励: 完成邮箱验证可获10次免费使用
                              </>
                            )}
                          </p>
                        </div>
                      </div>

                      {/* 未保存更改提示 - 移动到保存按钮上方 */}
                      {hasUnsavedChanges && (
                        <div className="bg-accent border border-border rounded-lg p-3 mb-3">
                          <div className="flex items-center">
                            <Info className="h-4 w-4 text-foreground mr-2 flex-shrink-0" />
                            <p className="text-sm text-foreground font-medium">
                              您有未保存的更改，请点击下方保存按钮
                            </p>
                          </div>
                        </div>
                      )}

                      {/* 保存按钮移动到编辑信息区域底部 */}
                      <div className="pt-3 border-t border-border">
                        <Button
                          onClick={handleSaveProfile}
                          variant={hasUnsavedChanges ? "default" : "secondary"}
                          className={`w-full h-10 font-semibold text-sm ${hasUnsavedChanges ? 'animate-pulse bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'}`}
                          disabled={!hasUnsavedChanges || isSaving}
                        >
                          {isSaving ? (
                            <>
                              <RefreshCw className="w-3 h-3 mr-2 animate-spin text-current" />
                              保存中...
                            </>
                          ) : (
                            <>
                              <Save className="w-3 h-3 mr-2 text-current" />
                              保存更改
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>



              </div>
            </CardContent>
          </Card>
        </div>

        {/* 第二行：使用统计和邀请奖励 - 确保按钮水平对齐 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 lg:items-stretch">
          {/* 左侧：使用统计 */}
          <div className="lg:col-span-1 flex">
            <TokenUsageSection
              userTier={userStats.accountType === '体验版' ? 'trial' :
                       userStats.accountType === '专业版' ? 'pro' : 'premium'}
              showDetails={true}
              className="w-full"
              externalUserStats={{
                availableUses: userStats.availableUses,
                usedCount: userStats.usedCount,
                tokenLimit: userStats.tokenLimit,
                usedTokens: userStats.usedTokens
              }}
            />
          </div>

          {/* 右侧：邀请奖励 */}
          <div className="lg:col-span-1 flex">
            <Card variant="soft" className="w-full h-full flex flex-col rounded-xl overflow-hidden relative">
              <CardHeader className="bg-gradient-secondary text-foreground relative z-10 rounded-t-xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-card/20 backdrop-blur-sm rounded-lg flex items-center justify-center shadow-e0">
                      <Gift className="w-6 h-6 drop-shadow-sm text-foreground" />
                    </div>
                    <div>
                      <div className="text-xl font-bold text-foreground">邀请奖励</div>
                      <div className="text-sm font-normal text-muted-foreground">邀请好友获得免费次数</div>
                    </div>
                  </div>
                  <Button
                    variant="soft"
                    size="sm"
                    onClick={handleCopyInviteLink}
                    className="bg-card/20 backdrop-blur-sm border-border/30 text-primary-foreground hover:bg-card/30 hover:border-border/50 rounded-lg"
                  >
                    <Copy className="w-4 h-4 text-foreground" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col p-6 relative z-10">
                {/* 邀请统计卡片 - 优化布局密度以平衡左侧 */}
                <div className="flex-1 space-y-4">
                  {/* 邀请奖励规则卡片 - 减少高度 */}
                  <div className="rounded-xl p-5 border border-border shadow-e1 relative overflow-hidden bg-accent">
                    <div className="flex items-center gap-3 mb-3 relative z-10">
                      <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center shadow-e0">
                        <Award className="w-5 h-5 text-primary-foreground drop-shadow-sm" />
                      </div>
                      <h3 className="font-bold text-foreground text-lg">邀请奖励规则</h3>
                    </div>
                    <p className="text-muted-foreground font-medium text-sm relative z-10">
                      每邀请1人注册，双方各得20次免费使用机会，永久有效！
                    </p>
                  </div>

                  {/* 邀请统计和邀请链接合并卡片 - 提高空间利用率 */}
                  <div className="rounded-xl p-5 border border-border shadow-e1 relative overflow-hidden bg-accent">
                    {/* 邀请统计部分 */}
                    <div className="mb-5 relative z-10">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center shadow-e0">
                          <Users className="w-5 h-5 text-primary-foreground drop-shadow-sm" />
                        </div>
                        <h3 className="font-bold text-foreground text-lg">邀请统计</h3>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="text-center p-3 border border-border rounded-lg shadow-e0 bg-accent">
                          <div className="text-xl font-bold text-foreground mb-1 tabular-nums">0</div>
                          <div className="text-sm font-medium text-muted-foreground">成功邀请</div>
                        </div>
                        <div className="text-center p-3 border border-border rounded-lg shadow-e0 bg-accent">
                          <div className="text-xl font-bold text-foreground mb-1 tabular-nums">0</div>
                          <div className="text-sm font-medium text-muted-foreground">获得次数</div>
                        </div>
                      </div>
                    </div>

                    {/* 邀请链接部分 */}
                    <div className="relative z-10">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center shadow-e0">
                          <Copy className="w-5 h-5 text-primary-foreground drop-shadow-sm" />
                        </div>
                        <h3 className="font-bold text-foreground text-lg">邀请链接</h3>
                      </div>

                      <div className="flex gap-3">
                        <Input
                          value={`${window.location.origin}?ref=${userStats.userId || user?.id || 'unknown'}`}
                          readOnly
                          className="text-sm h-11 border border-border rounded-lg bg-accent font-mono flex-1"
                        />
                        <Button
                          variant="soft"
                          size="sm"
                          onClick={handleCopyInviteLink}
                          className="h-11 px-4 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90"
                        >
                          <Copy className="w-4 h-4 text-foreground" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 邀请按钮 - 与内容对齐 */}
                <div className="mt-5">
                  <Button
                    className="w-full h-14 text-white font-bold text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 btn-invite-gradient"
                    onClick={handleInviteFriends}
                  >
                    <Users className="w-6 h-6 mr-3 text-white" />
                    立即邀请好友
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

        </div>
      </div>
      </div>
    </div>
  );
}