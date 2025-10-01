import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  User,
  LogOut,
  Upload,
  Sparkles,
  Save,
  Copy,
  Gift,
  Users,
  RefreshCw,
  Check,
  Hash,
  Clock,
  Crown,
  CreditCard,
  HelpCircle,
  Mail,
  AlertTriangle,
  Star
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import PageNavigation from '@/components/layout/PageNavigation';
import { Header } from '@/components/landing/Header';
import TokenUsageSection from '@/components/profile/TokenUsageSection';
import SubscriptionExpiryCard from '@/components/profile/SubscriptionExpiryCard';
import { getUserDisplayName, getUserAvatar, getUserAvatarFallback, getUserAltText } from '@/utils/userDisplayUtils';
import { avatarService } from '@/services/avatarService';
import { getUserTier } from '@/utils/subscriptionUtils';
import { useSubscriptionStatus } from '@/hooks/useSubscriptionStatus';

export default function ProfilePage() {
  const { user, isAuthenticated, logout, updateUser } = useAuth();
  const { toast } = useToast();
  const { t } = useTranslation();
  const { primaryStatus, hasActiveSubscription } = useSubscriptionStatus();
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [avatarKey, setAvatarKey] = useState(0);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
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

  const [profileForm, setProfileForm] = useState({
    nickname: getUserDisplayName(user, ''),
    phone: user?.phone || '',
    email: user?.email || '',
    avatar: getUserAvatar(user)
  });

  // 同步用户数据
  useEffect(() => {
    if (user) {
      setProfileForm({
        nickname: getUserDisplayName(user, ''),
        phone: user?.phone || '',
        email: user?.email || '',
        avatar: getUserAvatar(user)
      });
    }
  }, [user]);

  const userTier = (() => {
    if (hasActiveSubscription && primaryStatus?.status === 'active' && primaryStatus.tier) {
      return primaryStatus.tier;
    }
    return getUserTier(user);
  })();

  const getAccountType = () => {
    if (userTier === 'trial') return t('auth.trialUser');
    if (userTier === 'pro') return t('auth.proUser');
    return t('auth.premiumUser');
  };

  const registrationDate = user?.createdAt ?
    new Date(user.createdAt).toLocaleDateString('zh-CN') :
    new Date().toLocaleDateString('zh-CN');

  const calculateCompanionDays = (registrationDate: string): number => {
    try {
      const regDate = new Date(registrationDate);
      const today = new Date();
      const diffTime = Math.abs(today.getTime() - regDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays;
    } catch (error) {
      return 1;
    }
  };

  const companionDays = calculateCompanionDays(registrationDate);
  const isSavingDisabled = !hasUnsavedChanges || isSaving;

  const getCurrentFormAvatar = () => {
    if (profileForm.avatar) {
      return profileForm.avatar;
    }
    const safeName = profileForm.nickname || getUserDisplayName(user, 'User');
    return `data:image/svg+xml;base64,${btoa(`
      <svg width="200" height="200" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
        <rect width="200" height="200" rx="100" fill="hsl(var(--primary))" />
        <text x="100" y="120" font-family="Arial" font-size="60" font-weight="bold" text-anchor="middle" fill="hsl(var(--primary-foreground))">${safeName.substr(0, 2).toUpperCase()}</text>
      </svg>
    `)}`;
  };

  const getCurrentAvatarFallback = () => {
    const displayName = profileForm.nickname || getUserDisplayName(user, 'User');
    if (!displayName || displayName === 'User') return 'U';
    return displayName.charAt(0).toUpperCase();
  };

  const handleFormChange = (field: string, value: string) => {
    setProfileForm(prev => ({ ...prev, [field]: value }));
    setHasUnsavedChanges(true);
  };

  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      const updatedUserData: Record<string, any> = {};
      
      if (profileForm.nickname?.trim() && profileForm.nickname !== getUserDisplayName(user, '')) {
        updatedUserData.nickname = profileForm.nickname;
      }

      // 检查邮箱是否变化 - 只有非空且真正不同的值才更新
      const emailTrimmed = (profileForm.email || '').trim();
      const currentEmail = (user?.email || '').trim();
      if (emailTrimmed && emailTrimmed !== currentEmail) {
        updatedUserData.email = emailTrimmed;
      }
      
      // 检查手机号是否变化 - 只有非空且真正不同的值才更新
      const phoneTrimmed = (profileForm.phone || '').trim();
      const currentPhone = (user?.phone || '').trim();
      if (phoneTrimmed && phoneTrimmed !== currentPhone) {
        updatedUserData.phone = phoneTrimmed;
      }
      
    if (Object.keys(updatedUserData).length === 0) {
      setHasUnsavedChanges(false);
      toast({
        title: t('profile.messages.noChangesTitle'),
        description: t('profile.messages.noChangesDescription'),
      });
      return;
    }

      // 添加验证状态信息
      const updatedDataWithVerification = {
        ...updatedUserData,
        verifiedEmail: verificationStatus.email,
        verifiedPhone: verificationStatus.phone
      };

      await updateUser(updatedDataWithVerification);
      setHasUnsavedChanges(false);
      toast({
        title: t('profile.messages.saveSuccess'),
        description: t('profile.messages.profileUpdated'),
      });
    } catch (error) {
      toast({
        title: t('profile.messages.saveFailed'),
        description: t('common.errors.tryAgainLater'),
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSendPhoneCode = async () => {
    if (!profileForm.phone) {
      toast({
        title: t('profile.validation.phoneRequiredTitle'),
        description: t('profile.validation.phoneRequiredDescription'),
        variant: "destructive",
      });
      return;
    }

    // 验证手机号格式
    const phoneRegex = /^1[3-9]\d{9}$/;
    if (!phoneRegex.test(profileForm.phone)) {
      toast({
        title: t('profile.validation.phoneFormatErrorTitle'),
        description: t('profile.validation.phoneFormatErrorDescription'),
        variant: "destructive",
      });
      return;
    }

    setIsVerifyingPhone(true);
    try {
      const { verificationCodeService } = await import('@/services/verificationCodeService');
      const result = await verificationCodeService.sendSmsCode(profileForm.phone, 'UPDATE_PHONE');
      
      if (!result.success) {
        throw new Error(result.message);
      }

      setShowVerificationInput(prev => ({ ...prev, phone: true }));
      toast({
        title: "验证码已发送",
        description: `验证码已发送到 ${profileForm.phone}`,
      });
    } catch (error) {
      toast({
        title: t('profile.messages.codeSendFailedTitle'),
        description: t('profile.messages.codeSendFailedDescription'),
        variant: "destructive",
      });
    } finally {
      setIsVerifyingPhone(false);
    }
  };

  const handleVerifyPhone = async () => {
    if (!verificationCodes.phone) {
      toast({
        title: t('profile.messages.enterCodeTitle'),
        description: t('profile.messages.enterSmsCodeDescription'),
        variant: "destructive",
      });
      return;
    }

    setIsVerifyingPhone(true);
    try {
      const { verificationCodeService } = await import('@/services/verificationCodeService');
      const result = await verificationCodeService.verifyPhoneCode(profileForm.phone, verificationCodes.phone);
      
      if (!result.success) {
        throw new Error(result.message);
      }

      setVerificationStatus(prev => ({ ...prev, phone: true }));
      setShowVerificationInput(prev => ({ ...prev, phone: false }));
      setVerificationCodes(prev => ({ ...prev, phone: '' }));
      
      toast({
        title: "验证成功",
        description: "手机号验证成功",
      });
    } catch (error) {
      toast({
        title: "验证失败",
        description: "验证码错误或已过期",
        variant: "destructive",
      });
    } finally {
      setIsVerifyingPhone(false);
    }
  };

  const handleSendEmailCode = async () => {
    if (!profileForm.email) {
      toast({
        title: "请先输入邮箱",
        description: "请输入有效的邮箱地址",
        variant: "destructive",
      });
      return;
    }

    // 验证邮箱格式
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(profileForm.email)) {
      toast({
        title: "邮箱格式错误",
        description: "请输入正确的邮箱地址",
        variant: "destructive",
      });
      return;
    }

    setIsVerifyingEmail(true);
    try {
      const { verificationCodeService } = await import('@/services/verificationCodeService');
      const result = await verificationCodeService.sendEmailCode(profileForm.email, 'UPDATE_EMAIL');
      
      if (!result.success) {
        throw new Error(result.message);
      }

      setShowVerificationInput(prev => ({ ...prev, email: true }));
      toast({
        title: "验证码已发送",
        description: `验证码已发送到 ${profileForm.email}`,
      });
    } catch (error) {
      toast({
        title: "发送失败",
        description: "验证码发送失败，请稍后重试",
        variant: "destructive",
      });
    } finally {
      setIsVerifyingEmail(false);
    }
  };

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
      const { verificationCodeService } = await import('@/services/verificationCodeService');
      const result = await verificationCodeService.verifyEmailCode(profileForm.email, verificationCodes.email);
      
      if (!result.success) {
        throw new Error(result.message);
      }

      setVerificationStatus(prev => ({ ...prev, email: true }));
      setShowVerificationInput(prev => ({ ...prev, email: false }));
      setVerificationCodes(prev => ({ ...prev, email: '' }));
      
      toast({
        title: "验证成功",
        description: "邮箱验证成功",
      });
    } catch (error) {
      toast({
        title: "验证失败",
        description: "验证码错误或已过期",
        variant: "destructive",
      });
    } finally {
      setIsVerifyingEmail(false);
    }
  };

  const handleUploadAvatar = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/jpg,image/jpeg,image/png,image/webp';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      try {
        const result = await avatarService.uploadAvatar(file, user?.id || '');
        if (result.success && result.avatarUrl) {
          setProfileForm(prev => ({ ...prev, avatar: result.avatarUrl || prev.avatar }));
          await updateUser({ avatar: result.avatarUrl });
          setAvatarKey(prev => prev + 1);
          toast({ title: "头像上传成功", description: "您的头像已更新" });
        }
      } catch (error) {
        toast({ title: "上传失败", description: "头像上传失败，请重试", variant: "destructive" });
      }
    };
    input.click();
  };

  const handleRandomAvatar = async () => {
    try {
      const { getRandomEmojis, generateEmojiSVG } = await import('@/services/unifiedEmojiSystem');
      const pool = getRandomEmojis(1, 'animals');
      if (pool.length === 0) return;
      
      const selectedEmoji = pool[0];
      const avatarUrl = generateEmojiSVG(selectedEmoji);
      
      setProfileForm(prev => ({ ...prev, avatar: avatarUrl }));
      await updateUser({ avatar: avatarUrl });
      setAvatarKey(prev => prev + 1);
      
      toast({
        title: "头像已更新",
        description: `随机选择了可爱的${selectedEmoji.name} ${selectedEmoji.emoji}`
      });
    } catch (error) {
      toast({ title: "生成失败", description: "动物头像生成失败，请重试", variant: "destructive" });
    }
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      toast({ title: "登出成功", description: "您已成功登出" });
      window.location.href = '/';
    } catch (error) {
      toast({ title: "登出失败", description: "登出时发生错误，请重试", variant: "destructive" });
    } finally {
      setIsLoggingOut(false);
    }
  };

  const handleCopyInviteLink = () => {
    const inviteLink = `${window.location.origin}/register?inviter=${user?.id || 'unknown'}&t=${Date.now()}`;
    navigator.clipboard.writeText(inviteLink);
    toast({ title: "邀请链接已复制", description: "邀请链接已复制到剪贴板" });
  };

  const handleCopyFeedbackEmail = () => {
    const feedbackText = `hello@wenpai.xyz (个人ID: ${user?.id || 'unknown'})`;
    navigator.clipboard.writeText(feedbackText);
    toast({ title: "反馈邮箱已复制", description: "反馈邮箱已复制到剪贴板" });
  };

  // 如果用户未登录，显示登录提示
  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-background pt-16">
        <Header />
        <PageNavigation title={t('profile.navigation.title')} description={t('profile.navigation.description')} showAdaptButton={false} />
        <div className="container mx-auto px-4 py-6">
          <Card className="max-w-md mx-auto">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                {t('auth.pleaseLogin')}
              </CardTitle>
              <CardDescription>{t('profile.loginToManage')}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" onClick={() => window.location.href = '/'}>
                {t('nav.home')}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/10 to-background relative overflow-hidden pt-16 pb-8">
      {/* 背景装饰元素 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* 渐变圆形装饰 */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-primary/5 to-transparent rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-gradient-to-tr from-accent/5 to-transparent rounded-full blur-3xl transform -translate-x-1/2 translate-y-1/2" />
        {/* 几何图案 */}
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-primary/20 rounded-full animate-pulse" />
        <div className="absolute top-1/3 right-1/3 w-1 h-1 bg-accent/30 rounded-full animate-pulse delay-1000" />
        <div className="absolute bottom-1/4 right-1/4 w-1.5 h-1.5 bg-primary/15 rounded-full animate-pulse delay-2000" />
      </div>
      
      <Header />
      
      <div className="relative z-10">
        <PageNavigation
          title={t('nav.profile')}
          description={t('profile.description')}
          showAdaptButton={false}
        />

        <div className="container mx-auto px-4 py-8 max-w-7xl">
          {/* 主要内容区域 */}
          <div className="grid gap-8">
            {/* 个人信息主卡片 */}
            <Card className="overflow-hidden border-0 shadow-xl bg-gradient-to-br from-card/95 to-card/90 backdrop-blur-xl">
              <div className="relative">
                {/* 卡片内部装饰 */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/10 to-transparent rounded-full blur-2xl" />
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-accent/10 to-transparent rounded-full blur-2xl" />
                
                <CardHeader className="relative z-10 pb-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <h1 className="text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
                        {t('nav.profile')}
                      </h1>
                      <p className="text-muted-foreground">
                        {t('profile.manageInfo')}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleLogout}
                      disabled={isLoggingOut}
                      className="group hover:shadow-lg transition-all duration-300"
                    >
                      <LogOut className="w-4 h-4 mr-2 group-hover:animate-pulse" />
                      <span>{isLoggingOut ? t('auth.loggingOut') : t('auth.logout')}</span>
                    </Button>
                  </div>
                </CardHeader>

                <CardContent className="relative z-10">
                  <div className="grid lg:grid-cols-2 gap-8">
                    {/* 左侧：头像和基本信息 */}
                    <div className="flex flex-col items-center text-center space-y-6">
                      <div className="relative group">
                        <div className="absolute -inset-1 bg-gradient-to-r from-primary/50 to-accent/50 rounded-full blur opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        <Avatar key={avatarKey} className="relative w-32 h-32 border-4 border-background shadow-2xl">
                          <AvatarImage src={getCurrentFormAvatar()} alt={getUserAltText(user, t('profile.sections.avatar'))} />
                          <AvatarFallback className="text-3xl bg-gradient-to-br from-primary/20 to-accent/20 text-primary font-bold">
                            {getCurrentAvatarFallback()}
                          </AvatarFallback>
                        </Avatar>
                      </div>

                      <div className="space-y-3">
                        <h2 className="text-2xl font-bold text-foreground">
                          {profileForm.nickname || getUserDisplayName(user, t('profile.sections.user'))}
                        </h2>

                        <Badge variant="secondary" className="bg-gradient-to-r from-primary/10 to-accent/10 text-primary border-primary/20 px-4 py-2">
                          <Crown className="w-4 h-4 mr-2" />
                          {getAccountType()}
                        </Badge>
                      </div>

                      <div className="flex gap-3 flex-wrap justify-center">
                        <Button 
                          size="sm" 
                          onClick={handleUploadAvatar} 
                          className="group hover:shadow-lg transition-all duration-300"
                        >
                          <Upload className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
                          {t('profile.uploadAvatar')}
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={handleRandomAvatar} 
                          className="group hover:shadow-lg transition-all duration-300"
                        >
                          <Sparkles className="w-4 h-4 mr-2 group-hover:rotate-12 transition-transform" />
                          {t('profile.randomAvatar')}
                        </Button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
                        <div className="group relative overflow-hidden rounded-xl border bg-gradient-to-br from-muted/50 to-muted/30 p-4 text-center hover:shadow-lg transition-all duration-300">
                          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                          <Hash className="w-5 h-5 mx-auto mb-2 text-primary/60" />
                          <p className="text-xs text-muted-foreground mb-1">{t('profile.userId')}</p>
                          <p className="break-all text-sm font-semibold text-foreground">{user?.id || t('profile.unknown')}</p>
                        </div>
                        <div className="group relative overflow-hidden rounded-xl border bg-gradient-to-br from-muted/50 to-muted/30 p-4 text-center hover:shadow-lg transition-all duration-300">
                          <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                          <Clock className="w-5 h-5 mx-auto mb-2 text-accent/60" />
                          <p className="text-xs text-muted-foreground mb-1">{t('profile.companionDays')}</p>
                          <p className="text-sm font-semibold text-foreground">{t('profile.daysCount', { count: companionDays })}</p>
                        </div>
                      </div>
                    </div>

                    {/* 右侧：表单区域 */}
                    <div className="space-y-6">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="w-1 h-8 bg-gradient-to-b from-primary to-accent rounded-full" />
                        <h3 className="text-xl font-semibold text-foreground">
                          {t('profile.editInfo')}
                        </h3>
                      </div>

                      <div className="space-y-6">
                        <div className="group space-y-2">
                          <Label className="text-sm font-medium text-foreground flex items-center gap-2">
                            <User className="w-4 h-4 text-primary/60" />
                            {t('profile.nickname')}
                          </Label>
                          <Input
                            value={profileForm.nickname}
                            onChange={(e) => handleFormChange('nickname', e.target.value)}
                            placeholder={t('profile.enterNickname')}
                            className="transition-all duration-300 focus:shadow-lg focus:scale-[1.02] border-border/50 hover:border-border focus:border-primary/50"
                          />
                        </div>

                        <div className="group space-y-2">
                          <Label className="text-sm font-medium text-foreground flex items-center gap-2">
                            <Hash className="w-4 h-4 text-primary/60" />
                            {t('profile.phone')}
                          </Label>
                          <div className="flex gap-3">
                            <Input
                              value={profileForm.phone}
                              onChange={(e) => handleFormChange('phone', e.target.value)}
                              placeholder={t('profile.enterPhone')}
                              className="flex-1 transition-all duration-300 focus:shadow-lg focus:scale-[1.02] border-border/50 hover:border-border focus:border-primary/50"
                            />
                            <Button
                              size="sm"
                              onClick={showVerificationInput.phone ? handleVerifyPhone : handleSendPhoneCode}
                              disabled={isVerifyingPhone || !profileForm.phone || verificationStatus.phone}
                              variant={verificationStatus.phone ? "outline" : "default"}
                              className="min-w-[80px] text-xs group hover:shadow-lg transition-all duration-300"
                            >
                              {isVerifyingPhone ? (
                                <RefreshCw className="w-3 h-3 animate-spin" />
                              ) : verificationStatus.phone ? (
                                <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform" />
                              ) : showVerificationInput.phone ? (
                                t('common.confirm')
                              ) : (
                                t('profile.sendCode')
                              )}
                            </Button>
                          </div>

                          {/* 验证码输入框 */}
                          {showVerificationInput.phone && !verificationStatus.phone && (
                            <div className="mt-3 animate-in slide-in-from-top-2 duration-300">
                              <Input
                                value={verificationCodes.phone}
                                onChange={(e) => setVerificationCodes(prev => ({ ...prev, phone: e.target.value }))}
                                placeholder={t('profile.enterSmsCode')}
                                className="text-sm transition-all duration-300 focus:shadow-lg border-primary/30"
                              />
                            </div>
                          )}
                        </div>

                        <div className="group space-y-2">
                          <Label className="text-sm font-medium text-foreground flex items-center gap-2">
                            <Mail className="w-4 h-4 text-primary/60" />
                            {t('profile.email')}
                          </Label>
                          <div className="flex gap-3">
                            <Input
                              value={profileForm.email}
                              onChange={(e) => handleFormChange('email', e.target.value)}
                              placeholder={t('profile.enterEmail')}
                              className="flex-1 transition-all duration-300 focus:shadow-lg focus:scale-[1.02] border-border/50 hover:border-border focus:border-primary/50"
                            />
                            <Button
                              size="sm"
                              onClick={showVerificationInput.email ? handleVerifyEmail : handleSendEmailCode}
                              disabled={isVerifyingEmail || !profileForm.email || verificationStatus.email}
                              variant={verificationStatus.email ? "outline" : "default"}
                              className="min-w-[80px] text-xs group hover:shadow-lg transition-all duration-300"
                            >
                              {isVerifyingEmail ? (
                                <RefreshCw className="w-3 h-3 animate-spin" />
                              ) : verificationStatus.email ? (
                                <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform" />
                              ) : showVerificationInput.email ? (
                                t('common.confirm')
                              ) : (
                                t('profile.sendCode')
                              )}
                            </Button>
                          </div>

                          {/* 验证码输入框 */}
                          {showVerificationInput.email && !verificationStatus.email && (
                            <div className="mt-3 animate-in slide-in-from-top-2 duration-300">
                              <Input
                                value={verificationCodes.email}
                                onChange={(e) => setVerificationCodes(prev => ({ ...prev, email: e.target.value }))}
                                placeholder={t('profile.placeholders.enterEmailCode')}
                                className="text-sm transition-all duration-300 focus:shadow-lg border-primary/30"
                              />
                            </div>
                          )}
                        </div>

                        {hasUnsavedChanges && (
                          <div className="relative overflow-hidden rounded-xl border border-primary/30 bg-gradient-to-r from-primary/10 to-accent/10 p-4 animate-in slide-in-from-top-2 duration-300 group">
                            <div className="absolute inset-0 bg-gradient-to-r from-primary/15 to-accent/15 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                            <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-primary to-accent rounded-full animate-pulse" />
                            <div className="relative flex items-center gap-3">
                              <div className="relative">
                                <div className="absolute inset-0 bg-primary/30 rounded-full blur animate-pulse" />
                                <AlertTriangle className="relative w-5 h-5 text-primary animate-bounce" />
                              </div>
                              <p className="text-sm text-primary font-medium">
                                {t('profile.unsavedChanges')}
                              </p>
                            </div>
                          </div>
                        )}

                        <Button
                          onClick={handleSaveProfile}
                          disabled={isSavingDisabled}
                          className="w-full group relative overflow-hidden transition-all duration-300 hover:shadow-xl hover:scale-[1.02]"
                          variant={isSavingDisabled ? 'outline' : 'default'}
                        >
                          <div className="absolute inset-0 bg-gradient-to-r from-primary to-accent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                          <div className="relative flex items-center justify-center">
                            {isSaving ? (
                              <>
                                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                                保存中...
                              </>
                            ) : (
                              <>
                                <Save className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
                                保存更改
                              </>
                            )}
                          </div>
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </div>
            </Card>

            {/* 2x2网格布局：左上-订阅有效期，右上-邀请奖励，左下-使用统计，右下-反馈奖励 */}
            <div className="grid gap-8 xl:grid-cols-2">
              {/* 左上：订阅有效期统计 */}
              <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/20 to-accent/20 rounded-2xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative">
                  <SubscriptionExpiryCard />
                </div>
              </div>

              {/* 右上：邀请奖励卡片 */}
              <div className="relative">
                {/* 邀请奖励卡片 */}
                <Card className="relative overflow-hidden border-0 shadow-xl bg-gradient-to-br from-card/95 to-card/85 backdrop-blur-xl group hover:shadow-2xl transition-all duration-500">
                  {/* 卡片内部装饰 */}
                  <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-primary/15 to-transparent rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="absolute bottom-0 left-0 w-20 h-20 bg-gradient-to-tr from-accent/15 to-transparent rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  
                  <CardHeader className="relative z-10">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-primary/30 to-accent/30 rounded-lg blur opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        <div className="relative p-2 bg-gradient-to-br from-primary/10 to-accent/10 rounded-lg">
                          <Gift className="h-5 w-5 text-primary group-hover:scale-110 transition-transform duration-300" />
                        </div>
                      </div>
                      <div>
                        <CardTitle className="text-lg font-semibold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text">
                          {t('profile.inviteRewards')}
                        </CardTitle>
                        <CardDescription className="text-muted-foreground/80">
                          {t('profile.inviteRule')}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="relative z-10 space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="group/stat relative overflow-hidden rounded-xl border border-border/20 bg-gradient-to-br from-muted/20 to-muted/10 p-4 text-center hover:shadow-lg transition-all duration-300">
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover/stat:opacity-100 transition-opacity duration-300" />
                        <div className="relative">
                          <p className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">0</p>
                          <p className="text-xs text-muted-foreground mt-1">{t('profile.successfulInvites')}</p>
                        </div>
                      </div>
                      <div className="group/stat relative overflow-hidden rounded-xl border border-border/20 bg-gradient-to-br from-muted/20 to-muted/10 p-4 text-center hover:shadow-lg transition-all duration-300">
                        <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent opacity-0 group-hover/stat:opacity-100 transition-opacity duration-300" />
                        <div className="relative">
                          <p className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">0</p>
                          <p className="text-xs text-muted-foreground mt-1">{t('profile.rewardTimes')}</p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <Label className="text-sm font-medium text-foreground flex items-center gap-2">
                        <Copy className="w-4 h-4 text-primary/60" />
                        {t('profile.inviteLink')}
                      </Label>
                      <div className="flex gap-3">
                        <Input
                          value={`${window.location.origin}/register?inviter=${user?.id || 'unknown'}`}
                          readOnly
                          className="flex-1 font-mono text-xs transition-all duration-300 focus:shadow-lg border-border/50 hover:border-border"
                        />
                        <Button 
                          size="sm" 
                          onClick={handleCopyInviteLink}
                          className="group/btn hover:shadow-lg transition-all duration-300"
                        >
                          <Copy className="h-4 w-4 group-hover/btn:scale-110 transition-transform" />
                        </Button>
                      </div>
                    </div>

                    <Button 
                      onClick={handleCopyInviteLink} 
                      className="w-full gap-2 group/btn relative overflow-hidden transition-all duration-300 hover:shadow-xl hover:scale-[1.02]"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-primary to-accent opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300" />
                      <div className="relative flex items-center gap-2">
                        <Users className="h-5 w-5 group-hover/btn:scale-110 transition-transform" />
                        {t('profile.inviteFriends')}
                      </div>
                    </Button>
                  </CardContent>
                </Card>
              </div>

              {/* 左下：使用统计卡片 */}
              <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/20 to-accent/20 rounded-2xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative">
                  <TokenUsageSection
                    userTier={userTier}
                    showDetails={true}
                    className="profile-usage-card w-full border-0 shadow-xl bg-gradient-to-br from-card/95 to-card/85 backdrop-blur-xl"
                  />
                </div>
              </div>

              {/* 右下：反馈奖励卡片 */}
              <div className="relative">
                {/* 反馈奖励卡片 */}
                <Card className="relative overflow-hidden border-0 shadow-xl bg-gradient-to-br from-card/95 to-card/85 backdrop-blur-xl group hover:shadow-2xl transition-all duration-500">
                  {/* 卡片内部装饰 */}
                  <div className="absolute top-0 left-0 w-24 h-24 bg-gradient-to-br from-accent/15 to-transparent rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="absolute bottom-0 right-0 w-20 h-20 bg-gradient-to-tr from-primary/15 to-transparent rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  
                  <CardHeader className="relative z-10">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-accent/30 to-primary/30 rounded-lg blur opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        <div className="relative p-2 bg-gradient-to-br from-accent/10 to-primary/10 rounded-lg">
                          <HelpCircle className="h-5 w-5 text-accent group-hover:scale-110 transition-transform duration-300" />
                        </div>
                      </div>
                      <div>
                        <CardTitle className="text-lg font-semibold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text">
                          {t('profile.feedbackRewards')}
                        </CardTitle>
                        <CardDescription className="text-muted-foreground/80">
                          {t('profile.feedbackRule')}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="relative z-10 space-y-6">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="group/info relative overflow-hidden rounded-xl border border-border/20 bg-gradient-to-br from-muted/20 to-muted/10 p-4 hover:shadow-lg transition-all duration-300">
                        <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent opacity-0 group-hover/info:opacity-100 transition-opacity duration-300" />
                        <div className="relative">
                          <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                            <Star className="w-4 h-4 text-accent/60" />
                            {t('profile.feedbackRules')}
                          </h4>
                          <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                            {t('profile.feedbackRuleDetail')}
                          </p>
                        </div>
                      </div>
                      <div className="group/email relative overflow-hidden rounded-xl border border-border/20 bg-gradient-to-br from-muted/20 to-muted/10 p-4 hover:shadow-lg transition-all duration-300">
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover/email:opacity-100 transition-opacity duration-300" />
                        <div className="relative">
                          <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                            <Mail className="w-4 h-4 text-primary/60" />
                            {t('profile.feedbackEmail')}
                          </h4>
                          <div className="mt-2 flex gap-2">
                            <Input
                              value="hello@wenpai.xyz"
                              readOnly
                              className="flex-1 font-mono text-xs transition-all duration-300 focus:shadow-lg border-border/50 hover:border-border"
                            />
                            <Button 
                              size="sm" 
                              onClick={handleCopyFeedbackEmail}
                              className="group/btn hover:shadow-lg transition-all duration-300"
                            >
                              <Copy className="h-4 w-4 group-hover/btn:scale-110 transition-transform" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>

                    <Button 
                      onClick={handleCopyFeedbackEmail} 
                      className="w-full gap-2 group/btn relative overflow-hidden transition-all duration-300 hover:shadow-xl hover:scale-[1.02]"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-accent to-primary opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300" />
                      <div className="relative flex items-center gap-2">
                        <Mail className="h-4 w-4 group-hover/btn:scale-110 transition-transform" />
                        {t('profile.submitFeedback')}
                      </div>
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}