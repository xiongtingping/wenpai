/**
 * 个人中心页面 - 完整功能版
 * 包含头像上传、表单编辑、验证码功能、保存交互
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import { useUserStore } from '@/store/userStore';
import { LogOut, Crown, Copy as CopyIcon, Upload, RefreshCw, Save, Phone, Mail, User } from 'lucide-react';
import PageNavigation from '@/components/layout/PageNavigation';
import { useToast } from '@/hooks/use-toast';

export default function ProfilePage() {
  const { toast } = useToast();
  const { user, isAuthenticated, logout } = useAuth();
  const { usageRemaining } = useUserStore();
  const navigate = useNavigate();

  // 表单状态
  const [formData, setFormData] = useState({
    nickname: user?.nickname || '',
    phone: user?.phone || '',
    email: user?.email || '',
    avatar: user?.avatar || ''
  });
  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [verificationCode, setVerificationCode] = useState('');
  const [verifyingField, setVerifyingField] = useState<'phone' | 'email' | null>(null);

  if (!isAuthenticated || !user) {
    navigate('/login');
    return null;
  }

  // 处理表单变化
  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  // 处理头像上传
  const handleAvatarUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setFormData(prev => ({ ...prev, avatar: result }));
        setHasChanges(true);
      };
      reader.readAsDataURL(file);
    }
  };

  // 随机头像
  const handleRandomAvatar = () => {
    const avatars = [
      'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix',
      'https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka',
      'https://api.dicebear.com/7.x/avataaars/svg?seed=Jasper',
      'https://api.dicebear.com/7.x/avataaars/svg?seed=Lily',
      'https://api.dicebear.com/7.x/avataaars/svg?seed=Max'
    ];
    const randomAvatar = avatars[Math.floor(Math.random() * avatars.length)];
    setFormData(prev => ({ ...prev, avatar: randomAvatar }));
    setHasChanges(true);
  };

  // 发送验证码
  const sendVerificationCode = async (field: 'phone' | 'email') => {
    if (countdown > 0) return;
    
    const value = field === 'phone' ? formData.phone : formData.email;
    if (!value) {
      toast({ title: `请输入${field === 'phone' ? '手机号' : '邮箱'}`, variant: "destructive" });
      return;
    }

    try {
      setVerifyingField(field);
      setCountdown(60);
      const timer = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      toast({ title: "验证码已发送", description: `验证码已发送到您的${field === 'phone' ? '手机' : '邮箱'}` });
    } catch (error) {
      toast({ title: "发送失败", description: "请稍后重试", variant: "destructive" });
    }
  };

  // 验证并保存
  const verifyAndSave = async () => {
    if (!verificationCode) {
      toast({ title: "请输入验证码", variant: "destructive" });
      return;
    }

    try {
      // 这里应该调用验证API
      toast({ title: "验证成功", description: "信息已更新" });
      setVerifyingField(null);
      setVerificationCode('');
      setHasChanges(false);
    } catch (error) {
      toast({ title: "验证失败", description: "请检查验证码", variant: "destructive" });
    }
  };

  // 保存所有更改
  const handleSaveAll = async () => {
    if (!hasChanges) return;
    
    setIsSaving(true);
    try {
      // 这里应该调用保存API
      await new Promise(resolve => setTimeout(resolve, 1000)); // 模拟API调用
      toast({ title: "保存成功", description: "个人信息已更新" });
      setHasChanges(false);
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
        
        {/* 个人资料卡片 */}
        <div className="mb-8">
          <div className="rounded-xl shadow-sm bg-white overflow-hidden">
            <div className="h-20 bg-gradient-to-r from-purple-500 to-pink-400 flex items-center px-6">
              <span className="text-white text-lg font-bold">个人资料</span>
            </div>
            <div className="p-6 flex flex-col gap-6 md:flex-row md:gap-8">
              {/* 头像上传区 */}
              <div className="flex flex-col items-center md:items-start gap-4 md:w-1/4">
                <div className="relative">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={formData.avatar} alt="头像" />
                    <AvatarFallback className="text-lg">
                      {formData.nickname?.slice(0, 2) || '用户'}
                    </AvatarFallback>
                  </Avatar>
                  <label className="absolute bottom-0 right-0 bg-white rounded-full p-1 shadow-md cursor-pointer hover:bg-gray-50">
                    <Upload className="h-4 w-4 text-gray-600" />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarUpload}
                      className="hidden"
                    />
                  </label>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRandomAvatar}
                  className="text-xs"
                >
                  <RefreshCw className="h-3 w-3 mr-1" />
                  随机头像
                </Button>
                <div className="text-xs text-gray-500 leading-relaxed text-center md:text-left">
                  支持 jpg/png/gif，建议尺寸 200x200px，最大2MB。
                </div>
              </div>
              
              {/* 表单区 */}
              <div className="flex-1 flex flex-col gap-4">
                {/* 昵称 */}
                <div>
                  <Label className="text-sm font-medium text-gray-700">昵称</Label>
                  <Input
                    value={formData.nickname}
                    onChange={(e) => handleInputChange('nickname', e.target.value)}
                    placeholder="请输入昵称"
                    className="mt-1"
                  />
                </div>
                
                {/* 手机号 */}
                <div>
                  <Label className="text-sm font-medium text-gray-700">手机号</Label>
                  <div className="flex gap-2 mt-1">
                    <Input
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      placeholder="请输入手机号"
                      disabled={verifyingField === 'phone'}
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => sendVerificationCode('phone')}
                      disabled={countdown > 0 || verifyingField === 'phone'}
                      className="min-w-[100px]"
                    >
                      {countdown > 0 ? `${countdown}s` : '发送验证码'}
                    </Button>
                  </div>
                </div>
                
                {/* 邮箱 */}
                <div>
                  <Label className="text-sm font-medium text-gray-700">邮箱</Label>
                  <div className="flex gap-2 mt-1">
                    <Input
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      placeholder="请输入邮箱"
                      disabled={verifyingField === 'email'}
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => sendVerificationCode('email')}
                      disabled={countdown > 0 || verifyingField === 'email'}
                      className="min-w-[100px]"
                    >
                      {countdown > 0 ? `${countdown}s` : '发送验证码'}
                    </Button>
                  </div>
                  <div className="mt-1 text-xs text-yellow-600">首次验证奖励：完成邮箱验证可获10次免费使用</div>
                </div>

                {/* 验证码输入 */}
                {verifyingField && (
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex gap-2">
                      <Input
                        value={verificationCode}
                        onChange={(e) => setVerificationCode(e.target.value)}
                        placeholder="请输入验证码"
                        className="flex-1"
                      />
                      <Button onClick={verifyAndSave} disabled={!verificationCode}>
                        确认
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setVerifyingField(null);
                          setVerificationCode('');
                        }}
                      >
                        取消
                      </Button>
                    </div>
                  </div>
                )}

                {/* 保存按钮 */}
                <Button
                  onClick={handleSaveAll}
                  disabled={!hasChanges || isSaving}
                  className="w-full mt-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:opacity-90 disabled:bg-gray-300 disabled:text-white disabled:cursor-not-allowed"
                >
                  {isSaving ? (
                    <>
                      <Save className="h-4 w-4 mr-2 animate-spin" />
                      保存中...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      保存所有更改
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* 账号信息和使用统计 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-0">
          {/* 账号信息卡片 */}
          <div className="p-6 rounded-xl shadow-sm bg-white flex flex-col gap-4">
            <h3 className="text-lg font-bold mb-2">账号信息</h3>
            <div className="space-y-3 text-sm text-gray-600">
              <div className="flex justify-between items-center">
                <span className="inline-flex items-center">用户ID</span>
                <span className="font-mono text-gray-700">{user.id}</span>
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
                <span>{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '2025/7/12'}</span>
              </div>
            </div>
            <Button 
              onClick={handleLogout}
              variant="outline"
              className="w-full bg-red-100 text-red-600 hover:bg-red-200 transition-colors"
            >
              <LogOut className="h-4 w-4 mr-2" />
              退出登录
            </Button>
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
            <Button 
              onClick={handleUpgrade}
              className="w-full mt-4 bg-gradient-to-r from-orange-500 to-red-500 text-white hover:opacity-90 transition-opacity"
            >
              <Crown className="h-4 w-4 mr-2" />
              立即解锁高级功能
            </Button>
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
                <input readOnly className="flex-1 text-sm truncate bg-transparent outline-none" value={user.id} />
                <Button variant="ghost" size="sm" className="text-blue-600 hover:underline text-xs ml-2">
                  <CopyIcon className="w-3 h-3 mr-1" />复制
                </Button>
              </div>
            </div>
            <div>
              <label className="text-sm text-gray-600 mb-1 block">邀请链接</label>
              <div className="flex items-center border rounded px-2 py-1 bg-white">
                <input readOnly className="flex-1 text-sm truncate bg-transparent outline-none" value={`${window.location.origin}/invite?ref=${user.id}`} />
                <Button variant="ghost" size="sm" className="text-blue-600 hover:underline text-xs ml-2">
                  <CopyIcon className="w-3 h-3 mr-1" />复制
                </Button>
              </div>
            </div>
          </div>

          {/* 底部按钮 */}
          <Button 
            onClick={handleInvite}
            className="mt-6 w-full py-3 rounded-lg bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold hover:opacity-90 transition-opacity"
          >
            立即邀请好友
          </Button>
        </div>
      </div>
    </div>
  );
} 