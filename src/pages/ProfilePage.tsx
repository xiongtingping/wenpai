/**
 * 个人中心页面 - 完整功能版
 * 包含头像上传、表单编辑、验证码功能、保存按钮等
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AvatarUpload } from '@/components/ui/avatar-upload';
import { useAuth } from '@/contexts/AuthContext';
import { useUserStore } from '@/store/userStore';
import { LogOut, Crown, Copy as CopyIcon, Save, Info } from 'lucide-react';
import PageNavigation from '@/components/layout/PageNavigation';
import { useToast } from '@/hooks/use-toast';

export default function ProfilePage() {
  const { toast } = useToast();
  const { user, isAuthenticated, logout } = useAuth();
  const { usageRemaining } = useUserStore();
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

  if (!isAuthenticated || !user) {
    navigate('/login');
    return null;
  }

  useEffect(() => {
    if (user) {
      setEditForm({
        nickname: user.nickname || '',
        email: user.email || '',
        phone: user.phone || '',
        avatar: user.avatar || '',
      });
    }
  }, [user]);

  useEffect(() => {
    if (user && (editForm.nickname !== user.nickname || editForm.avatar !== user.avatar)) {
      setHasChanges(true);
    } else {
      setHasChanges(false);
    }
  }, [editForm, user]);

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

  const handleUpgrade = () => {
    navigate('/payment');
  };

  const handleInvite = () => {
    navigate('/invite');
  };

  // 检查表单是否有效
  const isFormValid = () => {
    return editForm.nickname.trim().length > 0 && hasChanges;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <PageNavigation title="个人中心" description="管理您的账户信息和使用统计" showAdaptButton={false} />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-8 pb-8">
        <div className="mb-6">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate('/')} 
            className="hover:bg-gray-100 text-gray-600 -ml-2"
          >
            返回首页
          </Button>
        </div>
        
        <div className="mb-8">
          <div className="rounded-xl shadow-sm bg-white overflow-hidden">
            {/* 顶部紫色渐变栏，降低高度 */}
            <div className="h-20 bg-gradient-to-r from-purple-500 to-pink-400 flex items-center px-6">
              <span className="text-white text-lg font-bold">个人资料</span>
            </div>
            <div className="p-6 flex flex-col gap-6 md:flex-row md:gap-8">
              {/* 上传头像区 */}
              <div className="flex flex-col items-center md:items-start gap-2 md:w-1/4">
                <AvatarUpload 
                  currentAvatar={editForm.avatar}
                  nickname={editForm.nickname || user?.nickname || '用户'}
                  size="lg"
                  onAvatarChange={handleAvatarChange}
                  disabled={false}
                />
                <p className="text-sm text-gray-500 text-center md:text-left">
                  点击上传头像，支持 JPG、PNG 格式
                </p>
              </div>
              {/* 表单区 */}
              <div className="flex-1 flex flex-col space-y-4">
                {/* 昵称输入框 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">昵称</label>
                  <input 
                    className="w-full border rounded px-3 py-2 text-sm" 
                    placeholder="请输入昵称" 
                    value={editForm.nickname}
                    onChange={e => handleNicknameChange(e.target.value)}
                  />
                </div>
                {/* 手机号输入框 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">手机号</label>
                  <div className="flex gap-2">
                    <input 
                      className="flex-1 border rounded px-3 py-2 text-sm" 
                      placeholder="请输入手机号" 
                      value={editForm.phone}
                      onChange={e => handlePhoneChange(e.target.value)}
                      disabled={isVerifying && verificationField === 'phone'}
                    />
                    {editForm.phone !== user?.phone && editForm.phone && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => sendVerificationCode('phone', editForm.phone)}
                        disabled={countdown > 0}
                        className="whitespace-nowrap"
                      >
                        {countdown > 0 ? `${countdown}s` : '发送验证码'}
                      </Button>
                    )}
                  </div>
                  {editForm.phone && <Badge className="bg-green-500 text-white text-[11px] px-2 py-0.5 rounded-full mt-1">已验证</Badge>}
                </div>
                {/* 邮箱输入框及首次验证奖励提示 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">邮箱</label>
                  <div className="flex gap-2">
                    <input 
                      className="flex-1 border rounded px-3 py-2 text-sm" 
                      placeholder="请输入邮箱" 
                      value={editForm.email}
                      onChange={e => handleEmailChange(e.target.value)}
                      disabled={isVerifying && verificationField === 'email'}
                    />
                    {editForm.email !== user?.email && editForm.email && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => sendVerificationCode('email', editForm.email)}
                        disabled={countdown > 0}
                        className="whitespace-nowrap"
                      >
                        {countdown > 0 ? `${countdown}s` : '发送验证码'}
                      </Button>
                    )}
                  </div>
                  {!user?.email && (
                    <Alert className="mt-2 border-amber-200 bg-amber-50">
                      <Info className="h-4 w-4 text-amber-600" />
                      <AlertDescription className="text-amber-800">
                        首次验证奖励：完成邮箱验证可获10次免费使用
                      </AlertDescription>
                    </Alert>
                  )}
                </div>

                {/* 验证码输入 */}
                {isVerifying && (
                  <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-sm font-semibold text-blue-800">请输入发送到{verificationField === 'phone' ? '手机' : '邮箱'}的验证码</span>
                    </div>
                    <div className="flex gap-2">
                      <Input 
                        placeholder="请输入验证码" 
                        value={verificationCode} 
                        onChange={e => setVerificationCode(e.target.value)} 
                        className="flex-1 border-blue-300 focus:border-blue-500" 
                      />
                      <Button onClick={verifyAndSave} disabled={!verificationCode} size="sm" className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">确认</Button>
                      <Button variant="outline" onClick={cancelVerification} size="sm" className="border-gray-300">取消</Button>
                    </div>
                  </div>
                )}

                {/* 保存按钮 */}
                <Button 
                  onClick={handleSaveAll}
                  disabled={!isFormValid() || isSaving}
                  className={`w-full mt-2 py-2 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center ${
                    isFormValid() 
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-md hover:shadow-lg transform hover:scale-[1.02]' 
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  {isSaving ? (
                    <>
                      <Save className="w-4 h-4 mr-2 animate-spin" />
                      保存中...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      保存所有更改
                    </>
                  )}
                </Button>
                {hasChanges && (
                  <p className="text-xs text-amber-600 mt-2 text-center">您有未保存的更改</p>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-0">
          {/* 账号信息卡片 */}
          <div className="p-6 rounded-xl shadow-sm bg-white flex flex-col gap-4">
            <h3 className="text-lg font-bold mb-2">账号信息</h3>
            <div className="space-y-3 text-sm text-gray-600">
              <div className="flex justify-between items-center">
                <span className="inline-flex items-center">用户ID</span>
                <span className="font-mono text-gray-700">temp-user-id</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="inline-flex items-center">账户类型</span>
                <span className="inline-flex items-center bg-gray-100 text-blue-600 px-2 py-0.5 rounded font-semibold">体验版</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="inline-flex items-center">可用次数</span>
                <span className="font-bold text-lg text-green-600">{usageRemaining} 次</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="inline-flex items-center">Token限制</span>
                <span className="bg-gray-100 text-blue-600 px-2 py-0.5 rounded font-semibold">100,000 tokens</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="inline-flex items-center">注册时间</span>
                <span>2025/7/12</span>
              </div>
            </div>
            <button 
              onClick={handleLogout}
              className="w-full bg-red-100 text-red-600 py-2 rounded-lg font-semibold mt-2 hover:bg-red-200 transition-colors"
            >
              退出登录
            </button>
          </div>

          {/* 使用统计卡片 */}
          <div className="p-6 rounded-xl shadow-sm bg-white flex flex-col gap-4">
            <h3 className="text-lg font-bold mb-2">使用统计</h3>
            <div className="space-y-3 text-sm text-gray-600">
              <div className="flex justify-between items-center">
                <span className="inline-flex items-center">使用次数</span>
                <span className="font-bold text-lg text-blue-700">3/10</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="inline-flex items-center">Token使用量</span>
                <span className="font-bold text-lg text-purple-700">25,000 / 100,000</span>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
              <div className="bg-purple-100 text-purple-800 rounded-lg flex flex-col items-center justify-center py-6">
                <div className="text-2xl font-bold mb-1">45分钟</div>
                <div className="text-xs">已节省时间</div>
              </div>
              <div className="bg-green-100 text-green-800 rounded-lg flex flex-col items-center justify-center py-6">
                <div className="text-2xl font-bold mb-1">3份</div>
                <div className="text-xs">已生成内容</div>
              </div>
            </div>
            <button 
              onClick={handleUpgrade}
              className="w-full mt-4 py-2 rounded-lg bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold shadow-md hover:opacity-90 active:opacity-80 transition-opacity inline-flex items-center justify-center"
            >
              立即解锁高级功能
            </button>
          </div>
        </div>

        {/* 邀请好友模块 */}
        <div className="mt-10">
          {/* 顶部Banner */}
          <div className="rounded-xl bg-gradient-to-r from-orange-400 to-red-500 p-6 text-white shadow-md flex items-center space-x-4">
            <div className="flex-shrink-0 text-3xl">🎁</div>
            <div>
              <div className="text-xl font-bold">邀请好友，轻松得奖励</div>
              <div className="text-sm opacity-80">每邀请 1 人注册，双方各得 20 次机会</div>
            </div>
          </div>

          {/* 中部三项数据 */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
            <div className="bg-blue-100 text-blue-700 rounded-lg p-4 text-center">
              <div className="text-xs">双方各得</div>
              <div className="text-2xl font-bold">20 次</div>
            </div>
            <div className="bg-green-100 text-green-700 rounded-lg p-4 text-center">
              <div className="text-xs">有效期</div>
              <div className="text-2xl font-bold">永久</div>
            </div>
            <div className="bg-purple-100 text-purple-700 rounded-lg p-4 text-center">
              <div className="text-xs">成功邀请</div>
              <div className="text-2xl font-bold">0</div>
            </div>
          </div>

          {/* 邀请方式区 */}
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-600 mb-1 block">推荐码</label>
              <div className="flex items-center border rounded px-2 py-1 bg-white">
                <input readOnly className="flex-1 text-sm truncate bg-transparent outline-none" value="temp-user-id" />
                <button className="flex items-center text-blue-600 hover:underline text-xs ml-2">
                  <CopyIcon className="w-4 h-4 mr-1" />复制
                </button>
              </div>
            </div>
            <div>
              <label className="text-sm text-gray-600 mb-1 block">邀请链接</label>
              <div className="flex items-center border rounded px-2 py-1 bg-white">
                <input readOnly className="flex-1 text-sm truncate bg-transparent outline-none" value="https://xxx.netlify.app?ref=xxx" />
                <button className="flex items-center text-blue-600 hover:underline text-xs ml-2">
                  <CopyIcon className="w-4 h-4 mr-1" />复制
                </button>
              </div>
            </div>
          </div>

          {/* 底部按钮 */}
          <button 
            onClick={handleInvite}
            className="mt-6 w-full py-3 rounded-lg bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold shadow-md hover:opacity-90 active:opacity-80 transition-opacity"
          >
            立即邀请好友
          </button>
        </div>
      </div>
    </div>
  );
} 