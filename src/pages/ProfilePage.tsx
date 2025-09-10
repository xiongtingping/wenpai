import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { logger } from '@/utils/logger';
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
  AlertCircle,
  Plus
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import PageNavigation from '@/components/layout/PageNavigation';
import { Header } from '@/components/landing/Header';
import TokenUsageSection from '@/components/profile/TokenUsageSection';
import { getUserDisplayName, getUserAvatar, getUserAvatarFallback, getUserAltText } from '@/utils/userDisplayUtils';
import { avatarService } from '@/services/avatarService';
// 认证系统已下线：移除 AuthService 依赖
import { isDevelopment } from '@/utils/env-validator';
import { getUserTier } from '@/utils/subscriptionUtils';
import { useSubscriptionStatus } from '@/hooks/useSubscriptionStatus';
// import '@/utils/debugUsageStats'; // 🔧 DEBUG: 导入调试工具 (已移除)

/**
 * 个人中心页面组件
 * @returns React组件
 */
export default function ProfilePage() {
  const { user, isAuthenticated, logout, updateUser } = useAuth();
  const { toast } = useToast();
  const { t } = useTranslation();
  const { primaryStatus, hasActiveSubscription } = useSubscriptionStatus();
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
  const [isLoggingOut, setIsLoggingOut] = useState(false); // 登出状态
  const [isUploading, setIsUploading] = useState(false); // 头像上传状态

  // ✅ FIXED: 个人资料表单状态 - 使用安全的用户信息获取函数
  const [profileForm, setProfileForm] = useState({
    nickname: getUserDisplayName(user, ''),
    phone: user?.phone || '',
    email: user?.email || '',
    avatar: getUserAvatar(user) // 使用导入的getUserAvatar函数
  });

  // 🔧 数据一致性检查和同步
  useEffect(() => {
    if (user) {
      console.log('🔄 同步用户数据到表单...');

      // 直接从用户状态同步到表单
      setProfileForm({
        nickname: getUserDisplayName(user, ''),
        phone: user?.phone || '',
        email: user?.email || '',
        avatar: getUserAvatar(user)
      });
    }
  }, [user]);

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
   * 使用真实的Authing用户数据 - 优先使用订阅状态数据
   */
  const userTier = (() => {
    // 🔧 FIX: 统一用户层级判断逻辑，确保与统计系统一致
    // 如果有活跃订阅，使用订阅状态数据中的tier字段
    if (hasActiveSubscription && primaryStatus?.status === 'active' && primaryStatus.tier) {
      console.log('🔍 [ProfilePage] userTier计算路径1:', {
        hasActiveSubscription,
        primaryStatus: primaryStatus?.status,
        tier: primaryStatus?.tier,
        result: primaryStatus.tier
      });
      return primaryStatus.tier;
    }
    // 否则使用用户对象的等级
    const fallbackTier = getUserTier(user);
    console.log('🔍 [ProfilePage] userTier计算路径2:', {
      hasActiveSubscription,
      primaryStatus: primaryStatus?.status,
      primaryTier: primaryStatus?.tier,
      fallbackTier,
      userObject: user
    });
    return fallbackTier;
  })();
  
  // 🔍 DEBUG: 记录最终计算结果
  console.log('🎯 [ProfilePage] 最终 userTier:', userTier);
  
  const getAccountType = () => {
    if (userTier === 'trial') return t('auth.trialUser');
    if (userTier === 'pro') return t('auth.proUser');
    return t('auth.premiumUser');
  };

  // 使用真实的用户注册时间
  const registrationDate = user?.createdAt ?
    new Date(user.createdAt).toLocaleDateString('zh-CN') :
    new Date().toLocaleDateString('zh-CN');

  // 计算陪伴天数
  const companionDays = calculateCompanionDays(registrationDate);

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
      <div className="min-h-screen bg-background pt-24">
        {/* 主导航栏 */}
        <Header />

        <PageNavigation
          title="个人中心"
          description="管理您的账户信息和设置"
          showAdaptButton={false}
        />
        <div className="container mx-auto px-4 py-6 pb-4">
          <Card className="max-w-md mx-auto">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                {t('auth.pleaseLogin')}
              </CardTitle>
              <CardDescription>
                {t('profile.loginToManage')}
              </CardDescription>
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
      // 🔧 只发送有值且真正发生变化的字段，避免重复提交触发敏感信息验证
      const updatedUserData: Record<string, any> = {};
      
      // 检查昵称是否变化
      if (profileForm.nickname?.trim() && profileForm.nickname !== getUserDisplayName(user, '')) {
        updatedUserData.nickname = profileForm.nickname;
      }
      
      // 检查邮箱是否变化 - 只有非空且真正不同的值才更新
      const emailTrimmed = (profileForm.email || '').trim();
      const currentEmail = (user?.email || '').trim();
      if (emailTrimmed && emailTrimmed !== currentEmail) {
        updatedUserData.email = emailTrimmed;
        console.log(`🔍 邮箱变化: "${currentEmail}" → "${emailTrimmed}"`);
      }
      
      // 检查手机号是否变化 - 只有非空且真正不同的值才更新
      const phoneTrimmed = (profileForm.phone || '').trim();
      const currentPhone = (user?.phone || '').trim();
      if (phoneTrimmed && phoneTrimmed !== currentPhone) {
        updatedUserData.phone = phoneTrimmed;
        console.log(`🔍 手机号变化: "${currentPhone}" → "${phoneTrimmed}"`);
      }
      
      // 检查头像是否变化
      if (profileForm.avatar?.trim() && profileForm.avatar !== getUserAvatar(user)) {
        updatedUserData.avatar = profileForm.avatar;
      }
      
      // 如果没有任何变化，直接返回
      if (Object.keys(updatedUserData).length === 0) {
        setHasUnsavedChanges(false);
        toast({
          title: "无需保存",
          description: "个人资料没有变化",
        });
        return;
      }

      // 🔧 使用统一认证系统更新用户资料
      // 添加验证状态信息
      const updatedDataWithVerification = {
        ...updatedUserData,
        verifiedEmail: verificationStatus.email,
        verifiedPhone: verificationStatus.phone
      };
      
      await updateUser(updatedDataWithVerification);

      // updateUser成功执行，表示更新成功
      setHasUnsavedChanges(false);

      toast({
        title: "保存成功",
        description: "个人资料已成功更新",
      });

      logger.info('✅ 个人资料保存成功', {
        userId: user?.id,
        updatedFields: Object.keys(updatedUserData)
      });
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
      // 🔧 使用真实的Authing API发送手机验证码
      console.log('📱 发送手机验证码到:', profileForm.phone);
      
      // 调用verificationCodeService发送手机验证码
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
      console.error('❌ 发送验证码失败:', error);
      toast({
        title: "发送失败",
        description: "验证码发送失败，请稍后重试",
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
      // 🔧 使用真实的Authing API验证手机验证码
      console.log('🔐 验证手机号码:', profileForm.phone, '验证码:', verificationCodes.phone);
      
      // 调用verificationCodeService验证手机验证码
      const { verificationCodeService } = await import('@/services/verificationCodeService');
      const result = await verificationCodeService.verifyPhoneCode(profileForm.phone, verificationCodes.phone);
      
      if (!result.success) {
        throw new Error(result.message);
      }

      setVerificationStatus(prev => ({ ...prev, phone: true }));
      setShowVerificationInput(prev => ({ ...prev, phone: false }));
      toast({
        title: "手机号验证成功",
        description: "您的手机号已验证",
      });
    } catch (error) {
      console.error('❌ 手机号验证失败:', error);
      toast({
        title: "验证失败",
        description: error instanceof Error ? error.message : "验证码错误，请重新输入",
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
      // 🔧 使用真实的Authing API发送邮箱验证码
      console.log('📧 发送邮箱验证码到:', profileForm.email);
      
      // 调用verificationCodeService发送邮箱验证码
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
      console.error('❌ 发送验证码失败:', error);
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
      // 🔧 使用真实的Authing API验证邮箱验证码
      console.log('🔐 验证邮箱:', profileForm.email, '验证码:', verificationCodes.email);
      
      // 调用verificationCodeService验证邮箱验证码
      const { verificationCodeService } = await import('@/services/verificationCodeService');
      const result = await verificationCodeService.verifyEmailCode(profileForm.email, verificationCodes.email);
      
      if (!result.success) {
        throw new Error(result.message);
      }

      setVerificationStatus(prev => ({ ...prev, email: true }));
      setShowVerificationInput(prev => ({ ...prev, email: false }));
      toast({
        title: "邮箱验证成功",
        description: "您的邮箱已验证",
      });
    } catch (error) {
      console.error('❌ 邮箱验证失败:', error);
      toast({
        title: "验证失败",
        description: error instanceof Error ? error.message : "验证码错误，请重新输入",
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

      // 🔧 增强的头像上传处理
      setIsUploading(true);

      try {
        console.log('📤 开始上传头像:', {
          fileName: file.name,
          fileSize: file.size,
          fileType: file.type,
          userId: user?.id
        });

        // 显示上传进度提示
        toast({
          title: "正在上传头像",
          description: "请稍候，正在处理您的头像...",
        });

        // 上传头像
        const result = await avatarService.uploadAvatar(file, user?.id || '');

        if (result.success && result.avatarUrl) {
          console.log('✅ 头像上传成功:', result.avatarUrl);

          // 更新表单状态
          setProfileForm(prev => ({
            ...prev,
            avatar: result.avatarUrl || prev.avatar
          }));

          // 立即更新全局用户状态并同步服务器
          await updateUser({ avatar: result.avatarUrl });

          // 强制刷新头像显示
          setAvatarKey(prev => prev + 1);

          // ✅ 头像已直接保存，无需标记为未保存状态

          toast({
            title: "头像上传成功",
            description: "您的头像已更新并同步",
          });
        } else {
          throw new Error(result.error || '上传失败');
        }
      } catch (error) {
        console.error('❌ 头像上传失败:', error);

        // 详细的错误处理
        let errorMessage = "头像上传失败，请稍后重试";
        if (error instanceof Error) {
          if (error.message.includes('网络')) {
            errorMessage = "网络连接失败，请检查网络后重试";
          } else if (error.message.includes('大小')) {
            errorMessage = "文件过大，请选择小于2MB的图片";
          } else if (error.message.includes('格式')) {
            errorMessage = "不支持的文件格式，请选择JPG、PNG或WebP格式";
          }
        }

        toast({
          title: "上传失败",
          description: errorMessage,
          variant: "destructive"
        });
      } finally {
        setIsUploading(false);
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
      await updateUser({ avatar: avatarUrl });
      setAvatarKey(prev => prev + 1);
      // ✅ 头像已直接保存，无需标记为未保存状态

      toast({
        title: "头像已更新",
        description: `随机选择了可爱的${selectedEmoji.name} ${selectedEmoji.emoji}`,
      });

      logger.debug('✅ 动物头像更新完成');

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
   * 处理登出
   */
  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      toast({
        title: "登出成功",
        description: "您已成功登出",
      });
      // 登出后跳转到首页
      window.location.href = '/';
    } catch (error) {
      console.error('登出失败:', error);
      toast({
        title: "登出失败",
        description: "登出时发生错误，请重试",
        variant: "destructive"
      });
    } finally {
      setIsLoggingOut(false);
    }
  };

  /**
   * 复制邀请链接
   */
  const handleCopyInviteLink = () => {
    // 使用认证系统的用户ID
    const safeUserId = user?.id || 'unknown';
    // 🛠️ FIXED: 使用标准的邀请链接格式
    const inviteLink = `${window.location.origin}/register?inviter=${safeUserId}&t=${Date.now()}`;
    navigator.clipboard.writeText(inviteLink);
    toast({
      title: "邀请链接已复制",
      description: "邀请链接已复制，直接去粘贴邀请好友吧！",
    });
  };

  /**
   * 复制推荐码
   */
  const handleCopyReferralCode = () => {
    // 使用认证系统的用户ID作为推荐码
    const safeUserId = user?.id || 'unknown';
    navigator.clipboard.writeText(safeUserId);
    toast({
      title: "推荐码已复制",
      description: "推荐码已复制到剪贴板",
    });
  };

  /**
   * 复制反馈邮箱（带个人ID）
   */
  const handleCopyFeedbackEmail = () => {
    const safeUserId = user?.id || 'unknown';
    const feedbackText = `hello@wenpai.xyz (个人ID: ${safeUserId})`;
    navigator.clipboard.writeText(feedbackText);
    toast({
      title: t('profile.feedbackEmailCopied'),
      description: t('profile.feedbackEmailCopiedDesc'),
    });
  };

  /**
   * 处理一键续费 - 直接创建相同层级的续费订单
   */
  const handleRenewSubscription = async () => {
    const currentTier = getUserTier(user);
    
    // 根据当前层级直接跳转到对应的续费订单创建
    if (currentTier === 'premium') {
      window.location.href = '/payment?plan=premium&period=monthly&action=renew';
    } else if (currentTier === 'pro') {
      window.location.href = '/payment?plan=pro&period=monthly&action=renew';
    } else {
      // 体验版用户跳转到升级页面
      window.location.href = '/payment';
    }
  };

  /**
   * 立即邀请好友
   */
  const handleInviteFriends = async () => {
    // 使用认证系统的用户ID
    const safeUserId = user?.id || 'unknown';
    // 🛠️ FIXED: 使用标准的邀请链接格式
    const inviteLink = `${window.location.origin}/register?inviter=${safeUserId}&t=${Date.now()}`;

    try {
      // 检查是否支持原生分享
      if (navigator.share) {
        await navigator.share({
          title: '文派 - AI驱动的新媒体内容多平台适配',
          text: '我在使用文派创作内容，邀请你一起体验！注册即可获得20次免费使用机会。',
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
          description: "邀请链接已复制，直接去粘贴邀请好友吧！",
        });
      }
    } catch (error) {
      console.error('邀请分享失败:', error);

      // 分享失败，尝试复制链接
      try {
        await navigator.clipboard.writeText(inviteLink);
        toast({
          title: "邀请链接已复制",
          description: "邀请链接已复制，直接去粘贴邀请好友吧！",
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
    <div className="bg-background relative overflow-hidden pt-24 pb-4">
      {/* 主导航栏 */}
      <Header />

      {/* 🎨 Modern Flat + Soft Neumorphism 背景装饰 - 统一轻量化 */}
      <div className="relative z-10">
        <PageNavigation
          title={t('nav.profile')}
          description={t('profile.description')}
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
                  <div className="w-12 h-12 bg-primary/10 backdrop-blur-sm rounded-lg flex items-center justify-center shadow-e0 border border-border">
                    <User className="w-6 h-6 drop-shadow-sm text-primary" />
                  </div>
                  <div>
                    <div className="text-xl font-bold text-foreground">{t('nav.profile')}</div>
                    <div className="text-sm font-normal text-muted-foreground">{t('profile.manageInfo')}</div>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  <span>{isLoggingOut ? t('auth.loggingOut') : t('auth.logout')}</span>
                </Button>
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
                              logger.debug('✅ 头像加载成功:', getCurrentFormAvatar());
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
                            className={`text-xs font-semibold ${
                              userTier === 'trial' 
                                ? 'bg-gray-100 text-gray-700 border-gray-200' :
                              userTier === 'pro' 
                                ? 'bg-blue-100 text-blue-700 border-blue-200' :
                                'bg-purple-100 text-purple-700 border-purple-200'
                            }`}
                          >
                            <Crown className={`w-3 h-3 mr-1 ${
                              userTier === 'trial' ? 'text-gray-500' :
                              userTier === 'pro' ? 'text-blue-500' :
                              'text-purple-500'
                            }`} />
                            {getAccountType()}
                          </Badge>
                        </div>

                        {/* 会员有效期和续费信息 */}
                        {hasActiveSubscription && primaryStatus?.expiresAt && (
                          <div className="flex flex-col items-center gap-2 mb-3">
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Clock className="w-3 h-3" />
                              <span>有效期至：{new Date(primaryStatus.expiresAt).toLocaleDateString('zh-CN')}</span>
                            </div>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={handleRenewSubscription}
                              className="h-7 text-xs px-3 border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                            >
                              <CreditCard className="w-3 h-3 mr-1" />
                              一键续费
                            </Button>
                          </div>
                        )}

                        {/* 上传头像按钮 */}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleUploadAvatar}
                          className="h-8 text-xs border-border bg-card hover:bg-accent text-foreground"
                        >
                          <Upload className="w-3 h-3 mr-1 text-muted-foreground" />
                          {t('profile.uploadAvatar')}
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* 用户统计信息卡片 */}
                  <div className="mt-4 grid grid-cols-1 gap-3">
                    <div className="rounded-lg p-3 border border-border shadow-e0 bg-card">
                      <div className="text-muted-foreground text-xs mb-1 flex items-center gap-2">
                        <div className="w-2 h-2 bg-muted-foreground/40 rounded-full"></div>
                        {t('settings.userId')}
                      </div>
                      <div className="font-mono text-sm font-semibold text-foreground break-all tabular-nums">{user?.id || 'unknown'}</div>
                    </div>
                    <div className="rounded-lg p-3 border border-border shadow-e0 bg-card">
                      <div className="text-muted-foreground text-xs mb-1 flex items-center gap-2">
                        <div className="w-2 h-2 bg-muted-foreground/40 rounded-full"></div>
                        {t('profile.companionDays')}
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-accent hover:bg-accent/80 transition-smooth">
                                <span className="text-xs">ℹ️</span>
                              </button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>{t('profile.registrationDate')}: {registrationDate}</p>
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
                      {t('profile.editInfo')}
                    </h3>

                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="nickname" className="text-xs font-semibold text-muted-foreground flex items-center gap-2">
                          <div className="w-2 h-2 bg-primary rounded-full"></div>
                          {t('profile.nickname')}
                        </Label>
                        <Input
                          id="nickname"
                          value={profileForm.nickname}
                          onChange={(e) => handleFormChange('nickname', e.target.value)}
                          placeholder={t('profile.enterNickname')}
                          className="h-9 border border-border rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/25 transition-smooth bg-card text-sm"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="phone" className="text-xs font-semibold text-muted-foreground flex items-center gap-2">
                          <div className="w-2 h-2 bg-primary rounded-full"></div>
                          {t('profile.phone')}
                          {verificationStatus.phone && (
                            <Check className="w-3 h-3 text-green-500" />
                          )}
                        </Label>
                        <div className="flex gap-2">
                          <Input
                            id="phone"
                            value={profileForm.phone}
                            onChange={(e) => handleFormChange('phone', e.target.value)}
                            placeholder={t('profile.enterPhone')}
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
                              t('common.confirm')
                            ) : (
                              t('profile.sendCode')
                            )}
                          </Button>
                        </div>

                        {/* 验证码输入框 */}
                        {showVerificationInput.phone && !verificationStatus.phone && (
                          <div className="mt-2">
                            <Input
                              value={verificationCodes.phone}
                              onChange={(e) => setVerificationCodes(prev => ({ ...prev, phone: e.target.value }))}
                              placeholder={t('profile.enterSmsCode')}
                              className="h-9 border border-border rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/25 transition-smooth bg-accent text-sm"
                              maxLength={6}
                            />
                          </div>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-xs font-semibold text-muted-foreground flex items-center gap-2">
                          <div className="w-2 h-2 bg-primary rounded-full"></div>
                          {t('profile.email')}
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
                            disabled={
                              isVerifyingEmail ||
                              verificationStatus.email ||
                              (!showVerificationInput.email && (!profileForm.email?.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profileForm.email.trim()))) ||
                              (showVerificationInput.email && !verificationCodes.email?.trim())
                            }
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

                        {verificationStatus.email && (
                          <div className="border border-green-200 bg-green-50 rounded-md p-2">
                            <p className="text-xs flex items-center gap-2 text-green-600">
                              <Check className="w-3 h-3 text-green-500" />
                              {t('profile.verifySuccess')}
                            </p>
                          </div>
                        )}
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

        {/* 第二行：使用统计和邀请奖励 - 左右对称布局 */}
        <div className="profile-grid-equal-height">
          {/* 左侧：使用统计 */}
          <div className="profile-grid-item">
            <TokenUsageSection
              userTier={userTier}
              showDetails={true}
              className="w-full h-full"
            />
          </div>

          {/* 右侧：邀请奖励 */}
          <div className="profile-grid-item">
            <Card variant="soft" className="w-full h-full flex flex-col rounded-xl overflow-hidden relative">
              <CardHeader className="bg-gradient-secondary text-foreground relative z-10 rounded-t-xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-primary/10 backdrop-blur-sm rounded-lg flex items-center justify-center shadow-e0 border border-border">
                      <Gift className="w-6 h-6 drop-shadow-sm text-primary" />
                    </div>
                    <div>
                      <div className="text-xl font-bold text-foreground">{t('profile.inviteRewards')}</div>
                      <div className="text-sm font-normal text-muted-foreground">{t('profile.inviteDescription')}</div>
                    </div>
                  </div>
                  <Button
                    variant="soft"
                    size="sm"
                    onClick={handleCopyInviteLink}
                    className="bg-card/20 backdrop-blur-sm border-border/30 text-primary-foreground hover:bg-card/30 hover:border-border/50 rounded-lg"
                  >
                    <Copy className="w-4 h-4 text-muted-foreground" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col p-6 relative z-10">
                {/* 邀请统计卡片 - 优化布局密度以平衡左侧 */}
                <div className="flex-1 space-y-4">
                  {/* 邀请奖励规则卡片 */}
                  <div className="rounded-xl p-5 border border-border shadow-e1 relative overflow-hidden bg-accent">
                    <div className="flex items-center gap-3 mb-3 relative z-10">
                      <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center shadow-e0">
                        <Award className="w-5 h-5 text-primary-foreground drop-shadow-sm" />
                      </div>
                      <h3 className="font-bold text-foreground text-lg">{t('profile.inviteRewardRules')}</h3>
                    </div>
                    <p className="text-muted-foreground font-medium text-sm relative z-10">
                      {t('profile.inviteRule')}
                    </p>
                  </div>

                  {/* 邀请统计和邀请链接合并卡片 - 提高空间利用率 */}
                  <div className="rounded-xl p-5 border border-border shadow-e1 relative overflow-hidden bg-accent">
                    {/* 邀请统计部分 */}
                    <div className="mb-5 relative z-10">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center shadow-e0">
                          <Users className="w-5 h-5 text-primary-foreground drop-shadow-sm" />
                        </div>
                        <h3 className="font-bold text-foreground text-lg">{t('profile.inviteStats')}</h3>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="text-center p-3 border border-border rounded-lg shadow-e0 bg-accent">
                          <div className="text-xl font-bold text-foreground mb-1 tabular-nums">0</div>
                          <div className="text-sm font-medium text-muted-foreground">{t('profile.successfulInvites')}</div>
                        </div>
                        <div className="text-center p-3 border border-border rounded-lg shadow-e0 bg-accent">
                          <div className="text-xl font-bold text-foreground mb-1 tabular-nums">0</div>
                          <div className="text-sm font-medium text-muted-foreground">{t('profile.rewardTimes')}</div>
                        </div>
                      </div>
                    </div>

                    {/* 邀请链接部分 */}
                    <div className="relative z-10">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center shadow-e0">
                          <Copy className="w-5 h-5 text-primary-foreground drop-shadow-sm" />
                        </div>
                        <h3 className="font-bold text-foreground text-lg">{t('profile.inviteLink')}</h3>
                      </div>

                      <div className="flex gap-3">
                        <Input
                          value={`${window.location.origin}/register?inviter=${user?.id || 'unknown'}`}
                          readOnly
                          className="text-sm h-11 border border-border rounded-lg bg-accent font-mono flex-1"
                        />
                        <Button
                          variant="soft"
                          size="sm"
                          onClick={handleCopyInviteLink}
                          className="h-11 px-4 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90"
                        >
                          <Copy className="w-4 h-4 text-muted-foreground" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 邀请按钮 - 与左侧升级按钮对齐 */}
                <div className="mt-4">
                  <Button
                    variant="default"
                    size="lg"
                    className="w-full h-12 text-base font-bold rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700 border-0 shadow-lg flex items-center justify-center gap-2"
                    onClick={handleInviteFriends}
                  >
                    <Users className="w-5 h-5 text-white" />
                    <span className="text-white">{t('profile.inviteFriends')}</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

        </div>

        {/* 第三行：反馈奖励 - 精致小巧布局 */}
        <div className="mt-4">
          <Card variant="soft" className="w-full rounded-lg overflow-hidden relative border border-border shadow-md">
            <CardHeader className="bg-gradient-secondary text-foreground relative z-10 rounded-t-lg border-b border-border py-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-orange-500/10 backdrop-blur-sm rounded-md flex items-center justify-center shadow-sm border border-orange-500/20">
                  <HelpCircle className="w-4 h-4 drop-shadow-sm text-orange-500" />
                </div>
                <div>
                  <div className="text-base font-bold text-foreground">{t('profile.feedbackRewards')}</div>
                  <div className="text-xs font-normal text-muted-foreground">{t('profile.feedbackDescription')}</div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-4 relative z-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                {/* 反馈规则说明 */}
                <div className="rounded-lg p-3 border border-border shadow-sm relative overflow-hidden bg-accent">
                  <div className="flex items-center gap-2 mb-2 relative z-10">
                    <div className="w-6 h-6 bg-orange-500 rounded-md flex items-center justify-center shadow-sm">
                      <Award className="w-3 h-3 text-white drop-shadow-sm" />
                    </div>
                    <h3 className="font-semibold text-foreground text-sm">{t('profile.feedbackRules')}</h3>
                  </div>
                  <p className="text-muted-foreground font-medium text-xs relative z-10 leading-relaxed">
                    {t('profile.feedbackRule')}
                  </p>
                </div>

                {/* 反馈邮箱卡片 */}
                <div className="rounded-lg p-3 border border-border shadow-sm relative overflow-hidden bg-accent">
                  <div className="flex items-center gap-2 mb-2 relative z-10">
                    <div className="w-6 h-6 bg-orange-500 rounded-md flex items-center justify-center shadow-sm">
                      <Mail className="w-3 h-3 text-white drop-shadow-sm" />
                    </div>
                    <h3 className="font-semibold text-foreground text-sm">{t('profile.feedbackEmail')}</h3>
                  </div>
                  <div className="flex gap-2">
                    <Input
                      value="hello@wenpai.xyz"
                      readOnly
                      className="text-xs h-8 border border-border rounded-md bg-accent font-mono flex-1"
                    />
                    <Button
                      variant="soft"
                      size="sm"
                      onClick={handleCopyFeedbackEmail}
                      className="h-8 px-2 rounded-md bg-orange-500 text-white hover:bg-orange-600"
                    >
                      <Copy className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* 反馈按钮 - 小巧精致设计 */}
              <Button
                variant="soft"
                size="sm"
                className="w-full h-9 text-sm font-semibold rounded-lg bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:from-orange-600 hover:to-orange-700 border-0 shadow-md"
                onClick={handleCopyFeedbackEmail}
              >
                <HelpCircle className="w-4 h-4 mr-2" />
                {t('profile.submitFeedback')}
              </Button>
            </CardContent>
          </Card>
        </div>
        </div>
      </div>
    </div>
  );
}