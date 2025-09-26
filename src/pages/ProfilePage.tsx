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
  Mail
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import PageNavigation from '@/components/layout/PageNavigation';
import { Header } from '@/components/landing/Header';
import TokenUsageSection from '@/components/profile/TokenUsageSection';
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

  const getCurrentFormAvatar = () => {
    if (profileForm.avatar) {
      return profileForm.avatar;
    }
    const safeName = profileForm.nickname || getUserDisplayName(user, 'User');
    return `data:image/svg+xml;base64,${btoa(`
      <svg width="200" height="200" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
        <rect width="200" height="200" rx="100" fill="#6366f1" />
        <text x="100" y="120" font-family="Arial" font-size="60" font-weight="bold" text-anchor="middle" fill="white">${safeName.substr(0, 2).toUpperCase()}</text>
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
        toast({ title: "无需保存", description: "个人资料没有变化" });
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
      toast({ title: "保存成功", description: "个人资料已成功更新" });
    } catch (error) {
      toast({ title: "保存失败", description: "请稍后重试", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSendPhoneCode = async () => {
    if (!profileForm.phone) {
      toast({
        title: "请先输入手机号",
        description: "请输入有效的手机号码",
        variant: "destructive",
      });
      return;
    }

    // 验证手机号格式
    const phoneRegex = /^1[3-9]\d{9}$/;
    if (!phoneRegex.test(profileForm.phone)) {
      toast({
        title: "手机号格式错误",
        description: "请输入正确的11位手机号码",
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
        title: "发送失败",
        description: "验证码发送失败，请稍后重试",
        variant: "destructive",
      });
    } finally {
      setIsVerifyingPhone(false);
    }
  };

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
    <div className="bg-background relative overflow-hidden pt-16 pb-4">
      <Header />
      
      <div className="relative z-10">
        <PageNavigation
          title={t('nav.profile')}
          description={t('profile.description')}
          showAdaptButton={false}
        />

        <div className="profile-page-container">
          {/* {t('profile.sections.personalInfo')} */}
          <div className="profile-main-section">
            <div className="profile-main-card">
              {/* {t('profile.sections.headerTitle')} */}
              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem'}}>
                <div>
                  <h1 style={{fontSize: '1.5rem', fontWeight: '600', color: '#1f2937', margin: 0}}>
                    {t('nav.profile')}
                  </h1>
                  <p style={{color: '#6b7280', margin: '0.5rem 0 0 0'}}>
                    {t('profile.manageInfo')}
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}
                >
                  <LogOut className="w-4 h-4" />
                  <span>{isLoggingOut ? t('auth.loggingOut') : t('auth.logout')}</span>
                </Button>
              </div>

              {/* {t('profile.sections.contentArea')} */}
              <div className="profile-content-grid">
                {/* {t('profile.sections.leftSection')} */}
                <div className="profile-left-section">
                  <Avatar key={avatarKey} className="profile-avatar">
                    <AvatarImage src={getCurrentFormAvatar()} alt={getUserAltText(user, t('profile.sections.avatar'))} />
                    <AvatarFallback style={{fontSize: '2rem', background: '#f3f4f6'}}>
                      {getCurrentAvatarFallback()}
                    </AvatarFallback>
                  </Avatar>

                  <h2 className="profile-username">
                    {profileForm.nickname || getUserDisplayName(user, t('profile.sections.user'))}
                  </h2>

                  <Badge style={{marginBottom: '1rem'}}>
                    <Crown className="w-3 h-3 mr-1" />
                    {getAccountType()}
                  </Badge>

                  <div style={{display: 'flex', gap: '0.5rem', flexWrap: 'wrap', justifyContent: 'center'}}>
                    <Button size="sm" onClick={handleUploadAvatar} style={{fontSize: '0.75rem'}}>
                      <Upload className="w-3 h-3 mr-1" />
                      上传头像
                    </Button>
                    <Button size="sm" variant="outline" onClick={handleRandomAvatar} style={{fontSize: '0.75rem'}}>
                      <Sparkles className="w-3 h-3 mr-1" />
                      随机头像
                    </Button>
                  </div>

                  <div style={{width: '100%', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginTop: '1rem'}}>
                    <div style={{textAlign: 'center', padding: '0.5rem', background: 'white', borderRadius: '6px', border: '1px solid #e5e7eb'}}>
                      <div style={{fontSize: '0.75rem', color: '#6b7280'}}>用户ID</div>
                      <div style={{fontSize: '0.875rem', fontWeight: '600', wordBreak: 'break-all'}}>{user?.id || 'unknown'}</div>
                    </div>
                    <div style={{textAlign: 'center', padding: '0.5rem', background: 'white', borderRadius: '6px', border: '1px solid #e5e7eb'}}>
                      <div style={{fontSize: '0.75rem', color: '#6b7280'}}>陪伴天数</div>
                      <div style={{fontSize: '0.875rem', fontWeight: '600'}}>{companionDays}天</div>
                    </div>
                  </div>
                </div>

                {/* 右侧：表单区域 */}
                <div className="profile-right-section">
                  <h3 style={{fontSize: '1.125rem', fontWeight: '600', marginBottom: '1rem', color: '#1f2937'}}>
                    {t('profile.editInfo')}
                  </h3>

                  <div className="profile-form-field">
                    <label className="profile-form-label">{t('profile.nickname')}</label>
                    <Input
                      value={profileForm.nickname}
                      onChange={(e) => handleFormChange('nickname', e.target.value)}
                      placeholder={t('profile.enterNickname')}
                      className="profile-form-input"
                    />
                  </div>

                  <div className="profile-form-field">
                    <label className="profile-form-label">{t('profile.phone')}</label>
                    <div style={{display: 'flex', gap: '0.5rem', alignItems: 'center'}}>
                      <Input
                        value={profileForm.phone}
                        onChange={(e) => handleFormChange('phone', e.target.value)}
                        placeholder={t('profile.enterPhone')}
                        className="profile-form-input"
                        style={{flex: 1}}
                      />
                      <Button
                        size="sm"
                        onClick={showVerificationInput.phone ? handleVerifyPhone : handleSendPhoneCode}
                        disabled={isVerifyingPhone || !profileForm.phone || verificationStatus.phone}
                        style={{
                          fontSize: '0.75rem', 
                          minWidth: '80px',
                          background: (isVerifyingPhone || verificationStatus.phone) 
                            ? '#f3f4f6'
                            : 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                          color: (isVerifyingPhone || verificationStatus.phone) ? '#6b7280' : 'white',
                          border: 'none',
                          borderRadius: '4px',
                          boxShadow: !(isVerifyingPhone || verificationStatus.phone) 
                            ? '0 1px 3px 0 rgba(59, 130, 246, 0.3)' 
                            : 'none'
                        }}
                      >
                        {isVerifyingPhone ? (
                          <RefreshCw className="w-3 h-3 animate-spin" />
                        ) : verificationStatus.phone ? (
                          <Check className="w-3 h-3" style={{color: '#16a34a'}} />
                        ) : showVerificationInput.phone ? (
                          '确认'
                        ) : (
                          '发送验证码'
                        )}
                      </Button>
                    </div>

                    {/* 验证码输入框 */}
                    {showVerificationInput.phone && !verificationStatus.phone && (
                      <div style={{marginTop: '0.5rem'}}>
                        <Input
                          value={verificationCodes.phone}
                          onChange={(e) => setVerificationCodes(prev => ({ ...prev, phone: e.target.value }))}
                          placeholder="请输入短信验证码"
                          style={{fontSize: '0.875rem'}}
                        />
                      </div>
                    )}
                  </div>

                  <div className="profile-form-field">
                    <label className="profile-form-label">{t('profile.email')}</label>
                    <div style={{display: 'flex', gap: '0.5rem', alignItems: 'center'}}>
                      <Input
                        value={profileForm.email}
                        onChange={(e) => handleFormChange('email', e.target.value)}
                        placeholder="请输入邮箱"
                        className="profile-form-input"
                        style={{flex: 1}}
                      />
                      <Button
                        size="sm"
                        onClick={showVerificationInput.email ? handleVerifyEmail : handleSendEmailCode}
                        disabled={isVerifyingEmail || !profileForm.email || verificationStatus.email}
                        style={{
                          fontSize: '0.75rem', 
                          minWidth: '80px',
                          background: (isVerifyingEmail || verificationStatus.email) 
                            ? '#f3f4f6'
                            : 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                          color: (isVerifyingEmail || verificationStatus.email) ? '#6b7280' : 'white',
                          border: 'none',
                          borderRadius: '4px',
                          boxShadow: !(isVerifyingEmail || verificationStatus.email) 
                            ? '0 1px 3px 0 rgba(59, 130, 246, 0.3)' 
                            : 'none'
                        }}
                      >
                        {isVerifyingEmail ? (
                          <RefreshCw className="w-3 h-3 animate-spin" />
                        ) : verificationStatus.email ? (
                          <Check className="w-3 h-3" style={{color: '#16a34a'}} />
                        ) : showVerificationInput.email ? (
                          '确认'
                        ) : (
                          '发送验证码'
                        )}
                      </Button>
                    </div>

                    {/* 验证码输入框 */}
                    {showVerificationInput.email && !verificationStatus.email && (
                      <div style={{marginTop: '0.5rem'}}>
                        <Input
                          value={verificationCodes.email}
                          onChange={(e) => setVerificationCodes(prev => ({ ...prev, email: e.target.value }))}
                          placeholder="请输入邮箱验证码"
                          style={{fontSize: '0.875rem'}}
                        />
                      </div>
                    )}
                  </div>

                  {hasUnsavedChanges && (
                    <div style={{background: '#eff6ff', border: '1px solid #3b82f6', borderRadius: '6px', padding: '0.75rem', marginBottom: '1rem'}}>
                      <p style={{margin: 0, fontSize: '0.875rem', color: '#1d4ed8'}}>
                        您有未保存的更改，请点击保存按钮
                      </p>
                    </div>
                  )}

                  <Button
                    onClick={handleSaveProfile}
                    disabled={!hasUnsavedChanges || isSaving}
                    style={{
                      width: '100%',
                      background: hasUnsavedChanges && !isSaving 
                        ? 'linear-gradient(135deg, #3b82f6, #1d4ed8)'
                        : '#f3f4f6',
                      color: hasUnsavedChanges && !isSaving ? 'white' : '#6b7280',
                      border: 'none',
                      borderRadius: '6px',
                      padding: '0.75rem 1.5rem',
                      fontSize: '1rem',
                      fontWeight: '600',
                      cursor: hasUnsavedChanges && !isSaving ? 'pointer' : 'not-allowed',
                      boxShadow: hasUnsavedChanges && !isSaving 
                        ? '0 2px 4px -1px rgba(59, 130, 246, 0.3)' 
                        : 'none',
                      transition: 'all 0.2s ease-in-out'
                    }}
                  >
                    {isSaving ? (
                      <>
                        <RefreshCw className="w-3 h-3 mr-2 animate-spin" />
                        保存中...
                      </>
                    ) : (
                      <>
                        <Save className="w-3 h-3 mr-2" />
                        保存更改
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* 第二行：使用统计和邀请奖励 */}
          <div className="profile-stats-section">
            {/* 左侧：使用统计 */}
            <TokenUsageSection
              userTier={userTier}
              showDetails={true}
              className="profile-usage-card"
            />

            {/* 右侧：邀请奖励和反馈奖励容器 */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '1.5rem',
              minHeight: '500px'
            }}>
              {/* 邀请奖励 */}
              <div className="profile-invite-card" style={{flex: 1}}>
                <div style={{marginBottom: '1.5rem'}}>
                  <div style={{display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem'}}>
                    <Gift className="w-6 h-6" style={{color: '#3b82f6'}} />
                    <h3 style={{fontSize: '1.125rem', fontWeight: '600', margin: 0}}>邀请奖励</h3>
                  </div>
                  <p style={{margin: 0, color: '#6b7280', fontSize: '0.875rem'}}>
                    每邀请1人注册，双方各得20次免费使用机会，可累加且永久有效！
                  </p>
                </div>

                <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem'}}>
                  <div style={{textAlign: 'center', padding: '1rem', background: '#f9fafb', borderRadius: '8px', border: '1px solid #e5e7eb'}}>
                    <div style={{fontSize: '1.5rem', fontWeight: '700', color: '#1f2937', marginBottom: '0.25rem'}}>0</div>
                    <div style={{fontSize: '0.75rem', color: '#6b7280'}}>成功邀请</div>
                  </div>
                  <div style={{textAlign: 'center', padding: '1rem', background: '#f9fafb', borderRadius: '8px', border: '1px solid #e5e7eb'}}>
                    <div style={{fontSize: '1.5rem', fontWeight: '700', color: '#1f2937', marginBottom: '0.25rem'}}>0</div>
                    <div style={{fontSize: '0.75rem', color: '#6b7280'}}>获得次数</div>
                  </div>
                </div>

                <div style={{marginBottom: '1.5rem'}}>
                  <label style={{display: 'block', fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.5rem', color: '#374151'}}>
                    邀请链接
                  </label>
                  <div style={{display: 'flex', gap: '0.5rem'}}>
                    <Input
                      value={`${window.location.origin}/register?inviter=${user?.id || 'unknown'}`}
                      readOnly
                      style={{flex: 1, fontSize: '0.75rem', fontFamily: 'monospace'}}
                    />
                    <Button size="sm" onClick={handleCopyInviteLink} style={{
                      background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      boxShadow: '0 1px 3px 0 rgba(59, 130, 246, 0.3)'
                    }}>
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <Button
                  onClick={handleCopyInviteLink}
                  style={{
                    width: '100%',
                    background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '0.75rem',
                    fontSize: '1rem',
                    fontWeight: '600',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    boxShadow: '0 2px 4px -1px rgba(59, 130, 246, 0.3)',
                    transition: 'all 0.2s ease-in-out'
                  }}
                >
                  <Users className="w-5 h-5" />
                  立即邀请好友
                </Button>
              </div>

              {/* 反馈奖励 */}
              <div className="profile-feedback-card" style={{flex: 1}}>
                <div style={{marginBottom: '1.5rem'}}>
                  <div style={{display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem'}}>
                    <HelpCircle className="w-6 h-6" style={{color: '#3b82f6'}} />
                    <h3 style={{fontSize: '1.125rem', fontWeight: '600', margin: 0}}>反馈奖励</h3>
                  </div>
                  <p style={{margin: 0, color: '#6b7280', fontSize: '0.875rem'}}>
                    发现重要bug或提出有价值建议，可获得额外使用次数奖励
                  </p>
                </div>
                
                <div style={{
                  display: 'grid', 
                  gridTemplateColumns: '1fr 1fr', 
                  gap: '1rem', 
                  marginBottom: '1.5rem'
                }}>
                  <div style={{padding: '1rem', background: '#f9fafb', borderRadius: '8px', border: '1px solid #e5e7eb'}}>
                    <h4 style={{fontSize: '0.875rem', fontWeight: '600', margin: '0 0 0.5rem 0', color: '#1f2937'}}>反馈规则</h4>
                    <p style={{margin: 0, fontSize: '0.75rem', color: '#6b7280', lineHeight: '1.4'}}>
                      bug报告或建议可获得奖励
                    </p>
                  </div>
                  
                  <div style={{padding: '1rem', background: '#f9fafb', borderRadius: '8px', border: '1px solid #e5e7eb'}}>
                    <h4 style={{fontSize: '0.875rem', fontWeight: '600', margin: '0 0 0.5rem 0', color: '#1f2937'}}>反馈邮箱</h4>
                    <div style={{display: 'flex', gap: '0.5rem', alignItems: 'center'}}>
                      <Input
                        value="hello@wenpai.xyz"
                        readOnly
                        style={{fontSize: '0.75rem', fontFamily: 'monospace', flex: 1}}
                      />
                      <Button size="sm" onClick={handleCopyFeedbackEmail} style={{
                        background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        boxShadow: '0 1px 3px 0 rgba(59, 130, 246, 0.3)',
                        flexShrink: 0
                      }}>
                        <Copy className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </div>

                <Button
                  onClick={handleCopyFeedbackEmail}
                  style={{
                    width: '100%',
                    background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '0.75rem',
                    fontSize: '1rem',
                    fontWeight: '600',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    boxShadow: '0 2px 4px -1px rgba(59, 130, 246, 0.3)',
                    transition: 'all 0.2s ease-in-out'
                  }}
                >
                  <Mail className="w-4 h-4" />
                  提交反馈
                </Button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}