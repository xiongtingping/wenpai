/**
 * 个人中心页面 - UI/UX优化版
 * 主内容区域max-w-[900px]，表单grid布局，保存按钮加载态，验证提示增强，统计卡片美化，统一渐变色，三段式奖励机制
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { AvatarUpload } from '@/components/ui/avatar-upload';
import { NicknameSelector } from '@/components/ui/nickname-selector';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useUserStore } from '@/store/userStore';
import { Edit3, Save, LogOut, Shield, User, Crown, Settings, Phone, Mail, Gift, ArrowLeft, Copy, CheckCircle, AlertTriangle, Clock, Zap, Target, Users, Star, Copy as CopyIcon, ExternalLink } from 'lucide-react';
import PageNavigation from '@/components/layout/PageNavigation';
import { UsageStatsCard } from '@/components/ui/usage-stats';
import { getSubscriptionPlan } from '@/config/subscriptionPlans';
import { UsageStats } from '@/types/subscription';

export default function ProfilePage() {
  const { toast } = useToast();
  const { user, isAuthenticated, logout } = useAuth();
  const { usageRemaining, userInviteStats } = useUserStore();
  const navigate = useNavigate();

  // 编辑状态管理
  const [editForm, setEditForm] = useState({
    nickname: user?.nickname || '',
    email: user?.email || '',
    phone: user?.phone || '',
    avatar: user?.avatar || '',
  });
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationField, setVerificationField] = useState<'phone' | 'email' | null>(null);
  const [verificationCode, setVerificationCode] = useState('');
  const [countdown, setCountdown] = useState(0);
  const [pendingValue, setPendingValue] = useState('');
  const [userType] = useState<'trial' | 'pro' | 'premium'>('trial');
  const proExpiryDate = '2024-12-31';
  const [usageStats] = useState<UsageStats>({
    adaptUsageUsed: 3,
    adaptUsageRemaining: 7,
    tokensUsed: 25000,
    tokensRemaining: 75000,
    usagePercentage: 25
  });
  const currentPlan = getSubscriptionPlan(userType);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

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

  React.useEffect(() => {
    if (user && (editForm.nickname !== user.nickname || editForm.avatar !== user.avatar)) {
      const updatedUser = {
        ...user,
        nickname: editForm.nickname,
        avatar: editForm.avatar,
        updatedAt: new Date().toISOString(),
      };
      localStorage.setItem('authing_user', JSON.stringify(updatedUser));
    }
  }, [editForm.nickname, editForm.avatar, user]);

  if (!isAuthenticated || !user) {
    navigate('/login');
    return null;
  }

  // 处理表单变更
  const handleAvatarChange = (newAvatar: string) => {
    setEditForm(prev => ({ ...prev, avatar: newAvatar }));
    setHasChanges(true);
  };
  const handleNicknameChange = (newNickname: string) => {
    setEditForm(prev => ({ ...prev, nickname: newNickname }));
    setHasChanges(true);
  };
  const handleEmailChange = (newEmail: string) => {
    setEditForm(prev => ({ ...prev, email: newEmail }));
    setHasChanges(true);
  };
  const handlePhoneChange = (newPhone: string) => {
    setEditForm(prev => ({ ...prev, phone: newPhone }));
    setHasChanges(true);
  };

  // 复制功能
  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      toast({ title: "复制成功", description: `${field}已复制到剪贴板` });
      setTimeout(() => setCopiedField(null), 2000);
    } catch (error) {
      toast({ title: "复制失败", description: "请手动复制", variant: "destructive" });
    }
  };

  // 验证码相关
  const sendVerificationCode = async (field: 'phone' | 'email', value: string) => {
    if (countdown > 0) return;
    if (!value) {
      toast({ title: field === 'phone' ? "请输入手机号" : "请输入邮箱", variant: "destructive" });
      return;
    }
    if (field === 'phone' && !/^1[3-9]\d{9}$/.test(value)) {
      toast({ title: "请输入正确的手机号", variant: "destructive" });
      return;
    }
    if (field === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      toast({ title: "请输入正确的邮箱地址", variant: "destructive" });
      return;
    }
    try {
      setVerificationField(field);
      setPendingValue(value);
      setIsVerifying(true);
      toast({ title: "验证码已发送", description: `验证码已发送到您的${field === 'phone' ? '手机' : '邮箱'}` });
      setCountdown(60);
      const timer = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) { clearInterval(timer); return 0; }
          return prev - 1;
        });
      }, 1000);
    } catch (error) {
      toast({ title: "发送失败", description: "请稍后重试", variant: "destructive" });
    }
  };
  const verifyAndSave = async () => {
    if (!verificationCode) {
      toast({ title: "请输入验证码", variant: "destructive" });
      return;
    }
    try {
      if (verificationField && pendingValue) {
        await handleSaveField(verificationField, pendingValue);
        if (verificationField === 'email' && !user?.email) {
          toast({ title: "邮箱验证成功", description: "恭喜您获得10次免费使用次数！" });
        }
        setIsVerifying(false);
        setVerificationField(null);
        setVerificationCode('');
        setPendingValue('');
      }
    } catch (error) {
      toast({ title: "验证失败", description: "请检查验证码是否正确", variant: "destructive" });
    }
  };
  const cancelVerification = () => {
    setIsVerifying(false);
    setVerificationField(null);
    setVerificationCode('');
    setPendingValue('');
  };
  const handleSaveField = async (field: string, value: string) => {
    try {
      const updatedUser = { ...user, [field]: value, updatedAt: new Date().toISOString() };
      localStorage.setItem('authing_user', JSON.stringify(updatedUser));
      setHasChanges(false);
      toast({ title: "保存成功", description: "个人信息已更新" });
    } catch (error) {
      toast({ title: "保存失败", description: "请重试", variant: "destructive" });
    }
  };
  const handleSaveAll = async () => {
    if (!hasChanges) return;
    setIsSaving(true);
    try {
      const updatedUser = { ...user, ...editForm, updatedAt: new Date().toISOString() };
      localStorage.setItem('authing_user', JSON.stringify(updatedUser));
      setHasChanges(false);
      toast({ title: "保存成功", description: "个人信息已更新" });
    } catch (error) {
      toast({ title: "保存失败", description: "请重试", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };
  const handleLogout = async () => {
    try { 
      await logout(); 
      navigate('/'); 
    } catch (err) {
      toast({ title: "登出失败", description: "请重试", variant: "destructive" });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <PageNavigation title="个人中心" description="管理您的个人信息和账户设置" showAdaptButton={false} />
      <div className="max-w-[900px] mx-auto px-4 sm:px-6 pt-8 pb-8 space-y-6">
        <div className="mb-6">
          <Button variant="ghost" size="sm" onClick={() => navigate('/')} className="hover:bg-blue-100 text-blue-600 -ml-2">
            <ArrowLeft className="h-4 w-4 mr-2" /> 返回首页
          </Button>
        </div>
        
        {/* 个人资料与联系方式合并卡片 */}
        <Card className="shadow-lg border-0 bg-gradient-to-br from-white via-blue-50 to-purple-50/60 backdrop-blur-sm">
          <CardHeader className="pb-4 bg-gradient-to-r from-[#7b61ff] to-[#fc8bdc] text-white rounded-t-xl">
            <CardTitle className="flex items-center gap-3 text-xl sm:text-2xl font-extrabold tracking-tight drop-shadow">
              <User className="w-5 h-5 sm:w-6 sm:h-6 p-1 bg-white/20 rounded-lg" /> 个人资料
              {userType === 'pro' && (
                <Badge className="bg-amber-500 hover:bg-amber-600 ml-auto text-xs sm:text-sm">
                  <Crown className="w-3 h-3 mr-1" />专业版
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="px-8 pt-8 pb-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
              {/* 左侧：头像修改区 */}
              <div className="flex flex-col items-center md:col-span-1">
                <AvatarUpload currentAvatar={editForm.avatar} nickname={editForm.nickname || user?.nickname || '用户'} size="lg" onAvatarChange={handleAvatarChange} disabled={false} />
              </div>
              {/* 右侧：表单区 */}
              <div className="flex flex-col gap-6 md:col-span-2">
                {/* 昵称 */}
                <div>
                  <Label className="font-semibold text-gray-800 flex items-center gap-2"><User className="w-4 h-4 text-blue-600" />昵称</Label>
                  <div className="flex gap-2 mt-1">
                    <Input placeholder="请输入昵称" value={editForm.nickname} onChange={e => handleNicknameChange(e.target.value)} className="border-gray-300 focus:border-blue-500 text-lg text-gray-900" />
                  </div>
                </div>
                {/* 手机号 */}
                <div>
                  <Label className="font-semibold text-gray-800 flex items-center gap-2"><Phone className="w-4 h-4 text-blue-600" />手机号码</Label>
                  <div className="flex gap-2 mt-1">
                    <Input placeholder="请输入手机号" value={editForm.phone} onChange={e => handlePhoneChange(e.target.value)} disabled={isVerifying && verificationField === 'phone'} className="border-gray-300 focus:border-blue-500 text-lg text-gray-900" />
                    {editForm.phone !== user?.phone && editForm.phone && (
                      <Button variant="outline" size="sm" onClick={() => sendVerificationCode('phone', editForm.phone)} disabled={countdown > 0} className="border-blue-300 text-blue-600 hover:bg-blue-50 min-w-[90px]">{countdown > 0 ? `${countdown}s` : '发送验证码'}</Button>
                    )}
                  </div>
                  {editForm.phone && <Badge className="bg-green-500 text-white text-[11px] px-2 py-0.5 rounded-full mt-1">已验证</Badge>}
                </div>
                {/* 邮箱 */}
                <div>
                  <Label className="font-semibold text-gray-800 flex items-center gap-2"><Mail className="w-4 h-4 text-purple-600" />邮箱地址</Label>
                  <div className="flex gap-2 mt-1">
                    <Input placeholder="请输入邮箱地址" value={editForm.email} onChange={e => handleEmailChange(e.target.value)} type="email" disabled={isVerifying && verificationField === 'email'} className="border-gray-300 focus:border-purple-500 text-lg text-gray-900" />
                    {editForm.email !== user?.email && editForm.email && (
                      <Button variant="outline" size="sm" onClick={() => sendVerificationCode('email', editForm.email)} disabled={countdown > 0} className="border-purple-300 text-purple-600 hover:bg-purple-50 min-w-[90px]">{countdown > 0 ? `${countdown}s` : '发送验证码'}</Button>
                    )}
                  </div>
                  {(editForm.email || !user?.email) && (
                    <div className="flex gap-1 mt-1">
                      {editForm.email && <Badge className="bg-green-500 text-white text-[11px] px-2 py-0.5 rounded-full">已验证</Badge>}
                      {!user?.email && (
                        <div className="flex items-center gap-1 bg-yellow-50 text-yellow-600 px-2 py-1 rounded-md text-xs">
                          <AlertTriangle className="w-3 h-3" />
                          首次验证奖励
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
            {/* 验证码输入 */}
            {isVerifying && (
              <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-sm font-semibold text-blue-800">请输入发送到{verificationField === 'phone' ? '手机' : '邮箱'}的验证码</span>
                </div>
                <div className="flex gap-2">
                  <Input placeholder="请输入验证码" value={verificationCode} onChange={e => setVerificationCode(e.target.value)} className="flex-1 border-blue-300 focus:border-blue-500" />
                  <Button onClick={verifyAndSave} disabled={!verificationCode} size="sm" className="bg-gradient-to-r from-[#7b61ff] to-[#fc8bdc] hover:from-[#6b51ef] hover:to-[#ec7bcc]">确认</Button>
                  <Button variant="outline" onClick={cancelVerification} size="sm" className="border-gray-300">取消</Button>
                </div>
              </div>
            )}
            {/* 保存按钮 */}
            <div className="mt-4 pt-4 border-t border-gray-200">
              <Button onClick={handleSaveAll} disabled={!hasChanges || isSaving} className="w-full bg-gradient-to-r from-[#7b61ff] to-[#fc8bdc] hover:from-[#6b51ef] hover:to-[#ec7bcc] text-white font-bold text-lg py-3">
                {isSaving ? (
                  <>
                    <Save className="w-4 h-4 mr-2 animate-spin" />保存中...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />保存所有更改
                  </>
                )}
              </Button>
              {hasChanges && (
                <p className="text-xs text-amber-600 mt-2 text-center">您有未保存的更改</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* 账号信息和使用统计 - 左右两卡片 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 左侧：账号信息卡片 */}
          <Card className="shadow-md border rounded-2xl bg-white/80 backdrop-blur-sm">
            <CardHeader className="pb-4 bg-gradient-to-r from-blue-100 to-purple-100 text-gray-800 rounded-t-2xl">
              <CardTitle className="flex items-center gap-3 text-lg">
                <Shield className="w-5 h-5 p-1 bg-white/40 rounded-lg" />账号信息
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              {/* 用户ID */}
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-600">用户ID</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">{user.id}</span>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => copyToClipboard(user.id, '用户ID')}
                    className="h-6 w-6 p-0 hover:bg-blue-100"
                  >
                    {copiedField === '用户ID' ? <CheckCircle className="w-3 h-3 text-green-600" /> : <Copy className="w-3 h-3 text-gray-500" />}
                  </Button>
                </div>
              </div>
              
              {/* 账户类型 */}
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-600">账户类型</span>
                <div className="flex items-center gap-2">
                  {userType === 'trial' ? (
                    <>
                      <Badge variant="outline" className="border-gray-300">体验版</Badge>
                      <Button 
                        size="sm" 
                        onClick={() => navigate('/payment')} 
                        className="bg-gradient-to-r from-[#7b61ff] to-[#fc8bdc] hover:from-[#6b51ef] hover:to-[#ec7bcc] text-white text-xs px-2 py-1 h-6"
                      >
                        <Crown className="w-3 h-3 mr-1" />升级
                      </Button>
                    </>
                  ) : userType === 'pro' ? (
                    <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white">
                      <Crown className="w-3 h-3 mr-1" />专业版
                    </Badge>
                  ) : (
                    <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                      <Crown className="w-3 h-3 mr-1" />高级版
                    </Badge>
                  )}
                </div>
              </div>
              
              {/* 可用次数 */}
              <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                <span className="text-gray-600">可用次数</span>
                <Badge className="bg-green-500 text-white font-semibold">
                  <Zap className="w-3 h-3 mr-1" />{usageRemaining} 次
                </Badge>
              </div>
              
              {/* Token限制 */}
              {currentPlan && (
                <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                  <span className="text-gray-600">Token限制</span>
                  <Badge className="bg-blue-500 text-white font-semibold">
                    <Target className="w-3 h-3 mr-1" />{currentPlan.limits.tokenLimit.toLocaleString()} tokens
                  </Badge>
                </div>
              )}
              
              {/* 专业版有效期 */}
              {userType === 'pro' && (
                <div className="flex justify-between items-center p-3 bg-amber-50 rounded-lg">
                  <span className="text-gray-600">专业版有效期</span>
                  <span className="text-amber-600 font-medium flex items-center gap-1">
                    <Clock className="w-3 h-3" />{proExpiryDate}
                  </span>
                </div>
              )}
              
              {/* 注册时间 */}
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-600">注册时间</span>
                <span>{user.createdAt ? new Date(user.createdAt as string).toLocaleDateString('zh-CN') : '未知'}</span>
              </div>
              
              {/* 订阅管理 */}
              {(userType === 'pro' || userType === 'premium') && (
                <Button 
                  variant="outline" 
                  onClick={() => navigate('/subscription')} 
                  className="w-full justify-start border-blue-200 text-blue-600 hover:bg-blue-50" 
                  size="sm"
                >
                  <Settings className="w-4 h-4 mr-2" />订阅管理
                </Button>
              )}
              
              <Separator className="bg-gray-100" />
              
              {/* 退出登录 */}
              <Button 
                variant="outline" 
                onClick={() => setShowLogoutConfirm(true)} 
                className="w-full justify-start border-red-200 text-red-600 hover:bg-red-50" 
                size="sm"
              >
                <LogOut className="w-4 h-4 mr-2" />退出登录
              </Button>
            </CardContent>
          </Card>

          {/* 右侧：使用情况统计 */}
          {currentPlan && (
            <Card className="shadow-md border rounded-2xl bg-white/80 backdrop-blur-sm">
              <CardHeader className="pb-4 bg-gradient-to-r from-green-100 to-blue-100 text-gray-800 rounded-t-2xl">
                <CardTitle className="flex items-center gap-3 text-lg">
                  <Target className="w-5 h-5 p-1 bg-white/40 rounded-lg" />使用统计
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                {/* 使用次数进度 */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">使用次数</span>
                    <span className="text-sm text-gray-500">{usageStats.adaptUsageUsed}/{currentPlan.limits.adaptUsageLimit}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-[#7b61ff] to-[#fc8bdc] h-2 rounded-full transition-all duration-300" 
                      style={{ width: `${(usageStats.adaptUsageUsed / currentPlan.limits.adaptUsageLimit) * 100}%` }}
                    ></div>
                  </div>
                </div>
                
                {/* Token使用量进度 */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Token使用量</span>
                    <span className="text-sm text-gray-500">{usageStats.tokensUsed.toLocaleString()}/{currentPlan.limits.tokenLimit.toLocaleString()}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300" 
                      style={{ width: `${(usageStats.tokensUsed / currentPlan.limits.tokenLimit) * 100}%` }}
                    ></div>
                  </div>
                </div>
                
                {/* 统计卡片 */}
                <div className="grid grid-cols-2 gap-4 mt-6">
                  <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-200 text-center">
                    <div className="text-2xl font-bold text-purple-600 mb-1 flex items-center justify-center gap-1">
                      <Clock className="w-5 h-5" />
                      {Math.floor(usageStats.adaptUsageUsed * 15)}分钟
                    </div>
                    <div className="text-sm text-gray-600">已节省时间</div>
                  </div>
                  <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-lg border border-green-200 text-center">
                    <div className="text-2xl font-bold text-green-600 mb-1 flex items-center justify-center gap-1">
                      <Zap className="w-5 h-5" />
                      {usageStats.adaptUsageUsed}份
                    </div>
                    <div className="text-sm text-gray-600">已生成份数</div>
                  </div>
                </div>
                
                {/* 升级按钮 */}
                {userType === 'trial' && (
                  <Button 
                    onClick={() => navigate('/payment')} 
                    className="w-full bg-gradient-to-r from-[#7b61ff] to-[#fc8bdc] hover:from-[#6b51ef] hover:to-[#ec7bcc] text-white"
                  >
                    <Crown className="w-4 h-4 mr-2" />升级专业版
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* 奖励机制 - 三段结构 */}
        <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="pb-4 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-t-lg">
            <CardTitle className="flex items-center justify-between text-xl">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-lg"><Gift className="w-6 h-6" /></div>
                邀请好友，轻松得奖励
              </div>
            </CardTitle>
            <CardDescription className="text-white/90">每邀请 1 人注册，双方各得 20 次机会</CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            {/* 第一段：规则说明 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg border border-blue-200">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-500 rounded-lg"><Users className="w-4 h-4 text-white" /></div>
                  <span className="text-gray-700">双方各得 20 次</span>
                </div>
                <Badge className="bg-blue-500 text-white">20次</Badge>
              </div>
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-lg border border-green-200">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-500 rounded-lg"><Star className="w-4 h-4 text-white" /></div>
                  <span className="text-gray-700">不会过期，永久有效</span>
                </div>
                <Badge className="bg-green-500 text-white">永久</Badge>
              </div>
            </div>
            
            {/* 第二段：邀请统计 */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-200 text-center">
                <div className="text-2xl font-bold text-purple-600 mb-1 flex items-center justify-center gap-1">
                  <Users className="w-5 h-5" />
                  {userInviteStats.totalRegistrations}
                </div>
                <div className="text-sm text-gray-600">成功邀请</div>
              </div>
              <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-lg border border-green-200 text-center">
                <div className="text-2xl font-bold text-green-600 mb-1 flex items-center justify-center gap-1">
                  <Zap className="w-5 h-5" />
                  {userInviteStats.totalRegistrations * 20}
                </div>
                <div className="text-sm text-gray-600">获得次数</div>
              </div>
            </div>
            
            {/* 第三段：邀请方式 */}
            <div className="space-y-4">
              <h5 className="font-semibold text-gray-800">邀请方式</h5>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">推荐码</span>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => copyToClipboard(user.id, '推荐码')}
                      className="h-6 w-6 p-0"
                    >
                      {copiedField === '推荐码' ? <CheckCircle className="w-3 h-3 text-green-600" /> : <CopyIcon className="w-3 h-3 text-gray-500" />}
                    </Button>
                  </div>
                  <div className="font-mono text-sm bg-white px-3 py-2 rounded border">{user.id}</div>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">邀请链接</span>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => copyToClipboard(`${window.location.origin}/invite?code=${user.id}`, '邀请链接')}
                      className="h-6 w-6 p-0"
                    >
                      {copiedField === '邀请链接' ? <CheckCircle className="w-3 h-3 text-green-600" /> : <CopyIcon className="w-3 h-3 text-gray-500" />}
                    </Button>
                  </div>
                  <div className="text-sm bg-white px-3 py-2 rounded border truncate">{`${window.location.origin}/invite?code=${user.id}`}</div>
                </div>
              </div>
            </div>
            
            {/* 主CTA按钮 */}
            <Button 
              onClick={() => navigate('/invite')} 
              className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold py-3"
            >
              <Users className="w-4 h-4 mr-2" />立即邀请好友
            </Button>
          </CardContent>
        </Card>
      </div>
      
      {/* 退出确认弹窗 */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm mx-4">
            <h3 className="text-lg font-semibold mb-4">确认退出</h3>
            <p className="text-gray-600 mb-6">您确定要退出登录吗？</p>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setShowLogoutConfirm(false)} className="flex-1">取消</Button>
              <Button variant="destructive" onClick={handleLogout} className="flex-1">确认退出</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 