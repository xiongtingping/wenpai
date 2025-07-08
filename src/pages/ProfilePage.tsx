/**
 * 个人中心页面
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { User, Settings, LogOut, Save, Camera, Shield, ArrowLeft, Gift, Phone, Mail, Crown, Calendar } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useUserStore } from '@/store/userStore';
import { AvatarUpload } from '@/components/ui/avatar-upload';
import { NicknameSelector } from '@/components/ui/nickname-selector';
import { ContactVerification } from '@/components/ui/contact-verification';
import PageNavigation from '@/components/layout/PageNavigation';

/**
 * 个人中心页面组件
 * @returns React 组件
 */
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
  
  // 验证码相关状态
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationField, setVerificationField] = useState<'phone' | 'email' | null>(null);
  const [verificationCode, setVerificationCode] = useState('');
  const [countdown, setCountdown] = useState(0);
  const [pendingValue, setPendingValue] = useState('');

  // 模拟用户类型和过期时间
  const [userType, setUserType] = useState<'free' | 'pro'>('free'); // 可以是 'free' 或 'pro'
  const proExpiryDate = '2024-12-31'; // 专业版到期时间

  // 如果用户未登录，跳转到登录页
  if (!isAuthenticated || !user) {
    navigate('/login');
    return null;
  }

  // 同步用户数据到编辑表单
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

  // 确保头像和昵称更改后立即同步到用户数据
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

  /**
   * 处理头像更改
   */
  const handleAvatarChange = (newAvatar: string) => {
    setEditForm(prev => ({ ...prev, avatar: newAvatar }));
    setHasChanges(true);
    // 头像特殊处理：立即保存
    handleSaveField('avatar', newAvatar);
  };

  /**
   * 处理昵称更改
   */
  const handleNicknameChange = (newNickname: string) => {
    setEditForm(prev => ({ ...prev, nickname: newNickname }));
    setHasChanges(true);
  };

  /**
   * 处理邮箱更改
   */
  const handleEmailChange = (newEmail: string) => {
    setEditForm(prev => ({ ...prev, email: newEmail }));
    setHasChanges(true);
  };

  /**
   * 处理手机号更改
   */
  const handlePhoneChange = (newPhone: string) => {
    setEditForm(prev => ({ ...prev, phone: newPhone }));
    setHasChanges(true);
  };

  /**
   * 发送验证码
   */
  const sendVerificationCode = async (field: 'phone' | 'email', value: string) => {
    if (countdown > 0) return;
    
    if (!value) {
      toast({
        title: field === 'phone' ? "请输入手机号" : "请输入邮箱",
        variant: "destructive"
      });
      return;
    }
    
    if (field === 'phone' && !/^1[3-9]\d{9}$/.test(value)) {
      toast({
        title: "请输入正确的手机号",
        variant: "destructive"
      });
      return;
    }
    
    if (field === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      toast({
        title: "请输入正确的邮箱地址",
        variant: "destructive"
      });
      return;
    }
    
    try {
      // 这里应该调用发送验证码的API
      setVerificationField(field);
      setPendingValue(value);
      setIsVerifying(true);
      
      toast({
        title: "验证码已发送",
        description: `验证码已发送到您的${field === 'phone' ? '手机' : '邮箱'}`
      });
      
      // 开始倒计时
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
    } catch (error) {
      toast({
        title: "发送失败",
        description: "请稍后重试",
        variant: "destructive"
      });
    }
  };

  /**
   * 验证验证码并保存
   */
  const verifyAndSave = async () => {
    if (!verificationCode) {
      toast({
        title: "请输入验证码",
        variant: "destructive"
      });
      return;
    }
    
    try {
      // 这里应该调用验证验证码的API
      // 模拟验证成功
      if (verificationField && pendingValue) {
        await handleSaveField(verificationField, pendingValue);
        
        // 如果是首次验证邮箱，给予奖励
        if (verificationField === 'email' && !user?.email) {
          toast({
            title: "验证成功",
            description: "邮箱验证成功，获得10次使用奖励！",
          });
        }
        
        // 重置验证状态
        setIsVerifying(false);
        setVerificationField(null);
        setVerificationCode('');
        setPendingValue('');
        setHasChanges(false);
      }
    } catch (error) {
      toast({
        title: "验证失败",
        description: "请检查验证码是否正确",
        variant: "destructive"
      });
    }
  };

  /**
   * 取消验证
   */
  const cancelVerification = () => {
    setIsVerifying(false);
    setVerificationField(null);
    setVerificationCode('');
    setPendingValue('');
    
    // 恢复原来的值
    if (verificationField === 'phone') {
      setEditForm(prev => ({ ...prev, phone: user?.phone || '' }));
    } else if (verificationField === 'email') {
      setEditForm(prev => ({ ...prev, email: user?.email || '' }));
    }
  };

  /**
   * 保存单个字段
   */
  const handleSaveField = async (field: string, value: string) => {
    if (!user) return;

    try {
      // 更新用户信息
      const updatedUser = {
        ...user,
        [field]: value,
        updatedAt: new Date().toISOString(),
      };

      // 更新AuthContext中的用户信息
      setUser(updatedUser);

      // 更新localStorage中的用户信息
      localStorage.setItem('authing_user', JSON.stringify(updatedUser));

      toast({
        title: "保存成功",
        description: `${field === 'nickname' ? '昵称' : field === 'email' ? '邮箱' : field === 'phone' ? '手机号' : '头像'}已更新`,
      });
    } catch (error) {
      console.error('保存用户信息失败:', error);
      toast({
        title: "保存失败",
        description: "请重试",
        variant: "destructive"
      });
    }
  };

  /**
   * 保存所有更改
   */
  const handleSaveAll = async () => {
    if (!user || !hasChanges) return;

    setIsSaving(true);
    try {
      // 更新用户信息
      const updatedUser = {
        ...user,
        nickname: editForm.nickname,
        email: editForm.email,
        phone: editForm.phone,
        updatedAt: new Date().toISOString(),
      };

      // 更新AuthContext中的用户信息
      setUser(updatedUser);

      // 更新localStorage中的用户信息
      localStorage.setItem('authing_user', JSON.stringify(updatedUser));

      setHasChanges(false);
      toast({
        title: "保存成功",
        description: "个人信息已更新",
      });
    } catch (error) {
      console.error('保存用户信息失败:', error);
      toast({
        title: "保存失败",
        description: "请重试",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  /**
   * 处理登出
   */
  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (err) {
      console.error('登出失败:', err);
      toast({
        title: "登出失败",
        description: "请重试",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 页面导航 */}
      <PageNavigation
        title="个人中心"
        description="管理您的个人信息和账户设置"
        showAdaptButton={false}
      />

      <div className="container mx-auto px-4 py-6 max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 左侧：个人信息 */}
          <div className="space-y-6">
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <User className="w-5 h-5" />
                  个人资料
                  {userType === 'pro' && (
                    <Badge className="bg-amber-500 hover:bg-amber-600">
                      <Crown className="w-3 h-3 mr-1" />
                      专业版
                    </Badge>
                  )}
                  {userType === 'free' && (
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">免费版</Badge>
                      <Button
                        size="sm"
                        onClick={() => navigate('/payment')}
                        className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white"
                      >
                        <Crown className="w-3 h-3 mr-1" />
                        升级专业版
                      </Button>
                    </div>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* 头像和昵称 */}
                <div className="text-center space-y-3">
                  <AvatarUpload
                    currentAvatar={editForm.avatar}
                    nickname={editForm.nickname || user?.nickname || '用户'}
                    size="lg"
                    onAvatarChange={handleAvatarChange}
                    disabled={false}
                  />
                  
                  <div className="space-y-2">
                    <NicknameSelector
                      currentNickname={editForm.nickname}
                      onNicknameChange={handleNicknameChange}
                      disabled={false}
                    />
                  </div>
                </div>

                <Separator />

                {/* 账号信息 */}
                <div className="space-y-3">
                  <h4 className="font-medium text-sm text-gray-700">账号信息</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">用户ID</span>
                      <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">{user.id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">账户类型</span>
                      <div className="flex items-center gap-2">
                        {userType === 'pro' ? (
                          <Badge className="bg-amber-500 hover:bg-amber-600">
                            <Crown className="w-3 h-3 mr-1" />
                            专业版
                          </Badge>
                        ) : (
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">免费版</Badge>
                            <Button
                              size="sm"
                              onClick={() => navigate('/payment')}
                              className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white text-xs px-2 py-1 h-6"
                            >
                              <Crown className="w-3 h-3 mr-1" />
                              升级专业版
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">当前可用次数</span>
                      <span className="text-green-600 font-medium">{usageRemaining} 次</span>
                    </div>
                    {userType === 'pro' && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">专业版有效期至</span>
                        <span className="text-amber-600 font-medium">{proExpiryDate}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-gray-600">注册时间</span>
                      <span>{user.createdAt ? new Date(user.createdAt as string).toLocaleDateString('zh-CN') : '未知'}</span>
                    </div>
                  </div>
                </div>

                {userType === 'pro' && (
                  <>
                    <Separator />
                    <div className="space-y-2">
                      <Button
                        variant="outline"
                        onClick={() => navigate('/subscription')}
                        className="w-full justify-start"
                        size="sm"
                      >
                        <Settings className="w-4 h-4 mr-2" />
                        订阅管理
                      </Button>
                    </div>
                  </>
                )}

                <Separator />

                {/* 快捷操作 */}
                <div className="space-y-2">
                  <Button
                    variant="destructive"
                    onClick={handleLogout}
                    className="w-full justify-start"
                    size="sm"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    退出登录
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 右侧：联系方式 */}
          <div className="space-y-6">
            {/* 联系方式验证 */}
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Shield className="w-5 h-5" />
                  联系方式
                </CardTitle>
                <CardDescription className="text-sm">
                  验证手机号和邮箱地址，提升账户安全性
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* 手机号验证 */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-gray-500" />
                      <Label className="font-medium">手机号码</Label>
                      {editForm.phone && (
                        <Badge variant="outline" className="text-xs bg-green-50 text-green-700">已验证</Badge>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Input
                        placeholder="请输入手机号"
                        value={editForm.phone}
                        onChange={(e) => handlePhoneChange(e.target.value)}
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
                          {countdown > 0 ? `${countdown}s` : '验证'}
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* 邮箱验证 */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-gray-500" />
                      <Label className="font-medium">邮箱地址</Label>
                      {editForm.email && (
                        <Badge variant="outline" className="text-xs bg-green-50 text-green-700">已验证</Badge>
                      )}
                      {!user?.email && (
                        <Badge variant="outline" className="text-xs bg-amber-50 text-amber-700">首次验证获得10次奖励</Badge>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Input
                        placeholder="请输入邮箱地址"
                        value={editForm.email}
                        onChange={(e) => handleEmailChange(e.target.value)}
                        type="email"
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
                          {countdown > 0 ? `${countdown}s` : '验证'}
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* 验证码输入 */}
                  {isVerifying && (
                    <div className="space-y-3 p-4 bg-blue-50 rounded-lg border">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-blue-800">
                          请输入发送到{verificationField === 'phone' ? '手机' : '邮箱'}的验证码
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <Input
                          placeholder="请输入验证码"
                          value={verificationCode}
                          onChange={(e) => setVerificationCode(e.target.value)}
                          className="flex-1"
                        />
                        <Button
                          onClick={verifyAndSave}
                          disabled={!verificationCode}
                          size="sm"
                        >
                          确认
                        </Button>
                        <Button
                          variant="outline"
                          onClick={cancelVerification}
                          size="sm"
                        >
                          取消
                        </Button>
                      </div>
                    </div>
                  )}
                </div>

                {/* 保存按钮 */}
                <div className="mt-6 pt-4 border-t">
                  <Button 
                    onClick={handleSaveAll}
                    disabled={!hasChanges || isSaving}
                    className="w-full"
                  >
                    {isSaving ? (
                      <>
                        <Save className="w-4 h-4 mr-2 animate-spin" />
                        保存中...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        保存更改
                      </>
                    )}
                  </Button>
                  {hasChanges && (
                    <p className="text-xs text-amber-600 mt-2 text-center">
                      您有未保存的更改
                    </p>
                  )}
                </div>


              </CardContent>
            </Card>

            {/* 奖励说明 */}
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center justify-between text-lg">
                  <div className="flex items-center gap-2">
                    <Gift className="w-5 h-5" />
                    奖励机制
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => navigate('/invite')}
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    <User className="w-4 h-4" />
                    立即邀请
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm text-gray-600">
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <span>每邀请1人注册</span>
                    <Badge className="bg-blue-100 text-blue-700">双方各获得20次</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <span>使用次数永久有效</span>
                    <Badge className="bg-green-100 text-green-700">不会过期</Badge>
                  </div>
                </div>

                {/* 邀请统计数据 */}
                <div className="mt-4 pt-4 border-t">
                  <h5 className="font-medium text-sm text-gray-700 mb-3">邀请统计</h5>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="bg-gray-50 p-3 rounded-lg text-center">
                      <div className="text-lg font-semibold text-gray-900">{userInviteStats.totalRegistrations}</div>
                      <div className="text-gray-600">成功邀请</div>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg text-center">
                      <div className="text-lg font-semibold text-green-600">{userInviteStats.totalRegistrations * 20}</div>
                      <div className="text-gray-600">获得次数</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
} 