/**
 * 个人中心页面
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
import { Edit3, Save, LogOut, Shield, User, Crown, Settings, Phone, Mail, Gift, ArrowLeft } from 'lucide-react';
import PageNavigation from '@/components/layout/PageNavigation';
import { UsageStatsCard } from '@/components/ui/usage-stats';
import { getSubscriptionPlan } from '@/config/subscriptionPlans';
import { UsageStats } from '@/types/subscription';

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
      setUser(updatedUser);
      localStorage.setItem('authing_user', JSON.stringify(updatedUser));
    }
  }, [editForm.nickname, editForm.avatar, user, setUser]);

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
      setUser(updatedUser);
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
      setUser(updatedUser);
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
    try { await logout(); navigate('/'); } catch (err) {
      toast({ title: "登出失败", description: "请重试", variant: "destructive" });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <PageNavigation title="个人中心" description="管理您的个人信息和账户设置" showAdaptButton={false} />
      <div className="container mx-auto px-6 pt-8 pb-8 max-w-6xl">
        <div className="mb-6">
          <Button variant="ghost" size="sm" onClick={() => navigate('/')} className="hover:bg-blue-100 text-blue-600 -ml-2">
            <ArrowLeft className="h-4 w-4 mr-2" /> 返回首页
          </Button>
        </div>
        
        {/* 个人资料与联系方式合并卡片 */}
        <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm mb-10">
          <CardHeader className="pb-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-t-lg">
            <CardTitle className="flex items-center gap-3 text-xl">
              <User className="w-6 h-6 p-1 bg-white/20 rounded-lg" /> 个人资料
              {userType === 'pro' && (
                <Badge className="bg-amber-500 hover:bg-amber-600 ml-auto"><Crown className="w-3 h-3 mr-1" />专业版</Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
              {/* 左侧：头像和昵称 */}
              <div className="space-y-4 flex flex-col items-center">
                <AvatarUpload currentAvatar={editForm.avatar} nickname={editForm.nickname || user?.nickname || '用户'} size="lg" onAvatarChange={handleAvatarChange} disabled={false} />
                <NicknameSelector currentNickname={editForm.nickname} onNicknameChange={handleNicknameChange} disabled={false} />
              </div>
              {/* 右侧：联系方式 */}
              <div className="flex flex-col gap-3">
                {/* 手机号 */}
                <div>
                  <Label className="font-semibold text-gray-800 flex items-center gap-2"><Phone className="w-4 h-4 text-blue-600" />手机号码</Label>
                  <div className="flex gap-2 mt-1">
                    <Input placeholder="请输入手机号" value={editForm.phone} onChange={e => handlePhoneChange(e.target.value)} disabled={isVerifying && verificationField === 'phone'} className="border-gray-300 focus:border-blue-500" />
                    {editForm.phone !== user?.phone && editForm.phone && (
                      <Button variant="outline" size="sm" onClick={() => sendVerificationCode('phone', editForm.phone)} disabled={countdown > 0} className="border-blue-300 text-blue-600 hover:bg-blue-50 min-w-[90px]">{countdown > 0 ? `${countdown}s` : '发送验证码'}</Button>
                    )}
                  </div>
                  {editForm.phone && <Badge className="bg-green-100 text-green-700 text-xs mt-1">已验证</Badge>}
                </div>
                {/* 邮箱 */}
                <div>
                  <Label className="font-semibold text-gray-800 flex items-center gap-2"><Mail className="w-4 h-4 text-purple-600" />邮箱地址</Label>
                  <div className="flex gap-2 mt-1">
                    <Input placeholder="请输入邮箱地址" value={editForm.email} onChange={e => handleEmailChange(e.target.value)} type="email" disabled={isVerifying && verificationField === 'email'} className="border-gray-300 focus:border-purple-500" />
                    {editForm.email !== user?.email && editForm.email && (
                      <Button variant="outline" size="sm" onClick={() => sendVerificationCode('email', editForm.email)} disabled={countdown > 0} className="border-purple-300 text-purple-600 hover:bg-purple-50 min-w-[90px]">{countdown > 0 ? `${countdown}s` : '发送验证码'}</Button>
                    )}
                  </div>
                  {(editForm.email || !user?.email) && (
                    <div className="flex gap-1 mt-1">
                      {editForm.email && <Badge className="bg-green-100 text-green-700 text-xs">已验证</Badge>}
                      {!user?.email && <Badge className="bg-amber-100 text-amber-700 text-xs">首次验证奖励</Badge>}
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
                  <Button onClick={verifyAndSave} disabled={!verificationCode} size="sm" className="bg-blue-600 hover:bg-blue-700">确认</Button>
                  <Button variant="outline" onClick={cancelVerification} size="sm" className="border-gray-300">取消</Button>
                </div>
              </div>
            )}
            {/* 保存按钮 */}
            <div className="mt-4 pt-4 border-t border-gray-200">
              <Button onClick={handleSaveAll} disabled={!hasChanges || isSaving} className="w-full bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700">
                {isSaving ? (<><Save className="w-4 h-4 mr-2 animate-spin" />保存中...</>) : (<><Save className="w-4 h-4 mr-2" />保存所有更改</>)}
              </Button>
              {hasChanges && (<p className="text-xs text-amber-600 mt-2 text-center">您有未保存的更改</p>)}
            </div>
          </CardContent>
        </Card>

        {/* 账号信息和使用统计 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* 账号信息卡片 */}
          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="pb-6 bg-gradient-to-r from-blue-100 to-purple-100 text-gray-800 rounded-t-lg">
              <CardTitle className="flex items-center gap-3 text-lg"><Shield className="w-5 h-5 p-1 bg-white/40 rounded-lg" />账号信息</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"><span className="text-gray-600">用户ID</span><span className="font-mono text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">{user.id}</span></div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"><span className="text-gray-600">账户类型</span><div className="flex items-center gap-2">{userType === 'trial' ? (<><Badge variant="outline" className="border-gray-300">体验版</Badge><Button size="sm" onClick={() => navigate('/payment')} className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white text-xs px-2 py-1 h-6"><Crown className="w-3 h-3 mr-1" />升级</Button></>) : userType === 'pro' ? (<Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white"><Crown className="w-3 h-3 mr-1" />专业版</Badge>) : (<Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white"><Crown className="w-3 h-3 mr-1" />高级版</Badge>)}</div></div>
              <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg"><span className="text-gray-600">可用次数</span><span className="text-green-600 font-semibold">{usageRemaining} 次</span></div>
              {currentPlan && (<div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg"><span className="text-gray-600">Token限制</span><span className="text-blue-600 font-semibold">{currentPlan.limits.tokenLimit.toLocaleString()} tokens</span></div>)}
              {userType === 'pro' && (<div className="flex justify-between items-center p-3 bg-amber-50 rounded-lg"><span className="text-gray-600">专业版有效期</span><span className="text-amber-600 font-medium">{proExpiryDate}</span></div>)}
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"><span className="text-gray-600">注册时间</span><span>{user.createdAt ? new Date(user.createdAt as string).toLocaleDateString('zh-CN') : '未知'}</span></div>
              {(userType === 'pro' || userType === 'premium') && (<Button variant="outline" onClick={() => navigate('/subscription')} className="w-full justify-start border-blue-200 text-blue-600 hover:bg-blue-50" size="sm"><Settings className="w-4 h-4 mr-2" />订阅管理</Button>)}
              <Separator className="bg-gray-200" />
              <Button variant="destructive" onClick={handleLogout} className="w-full justify-start" size="sm"><LogOut className="w-4 h-4 mr-2" />退出登录</Button>
            </CardContent>
          </Card>

          {/* 使用情况统计 */}
          {currentPlan && (
            <UsageStatsCard
              usageStats={usageStats}
              planName={currentPlan.name}
              adaptUsageLimit={currentPlan.limits.adaptUsageLimit}
              tokenLimit={currentPlan.limits.tokenLimit}
              userType={userType}
              onUpgrade={() => navigate('/payment')}
            />
          )}
        </div>

        {/* 奖励机制 */}
        <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="pb-4 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-t-lg">
            <CardTitle className="flex items-center justify-between text-xl">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-lg"><Gift className="w-6 h-6" /></div>
                奖励机制
              </div>
              <Button variant="outline" onClick={() => navigate('/invite')} size="sm" className="bg-white/20 border-white/30 text-white hover:bg-white/30">
                <User className="w-4 h-4 mr-2" />立即邀请
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h5 className="font-semibold text-gray-800 mb-3">奖励规则</h5>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg border border-blue-200">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-500 rounded-lg"><User className="w-4 h-4 text-white" /></div>
                      <span className="text-gray-700">每邀请1人注册</span>
                    </div>
                    <Badge className="bg-blue-500 text-white">双方各获得20次</Badge>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-lg border border-green-200">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-green-500 rounded-lg"><Gift className="w-4 h-4 text-white" /></div>
                      <span className="text-gray-700">使用次数永久有效</span>
                    </div>
                    <Badge className="bg-green-500 text-white">不会过期</Badge>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <h5 className="font-semibold text-gray-800 mb-3">邀请统计</h5>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-200 text-center">
                    <div className="text-2xl font-bold text-purple-600 mb-1">{userInviteStats.totalRegistrations}</div>
                    <div className="text-sm text-gray-600">成功邀请</div>
                  </div>
                  <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-lg border border-green-200 text-center">
                    <div className="text-2xl font-bold text-green-600 mb-1">{userInviteStats.totalRegistrations * 20}</div>
                    <div className="text-sm text-gray-600">获得次数</div>
                  </div>
                </div>
                <Button onClick={() => navigate('/invite')} className="w-full bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white">
                  <User className="w-4 h-4 mr-2" />邀请好友获得奖励
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 