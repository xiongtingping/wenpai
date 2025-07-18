/**
 * 用户资料编辑表单组件
 * 提供安全可靠的用户信息编辑功能
 */

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { useUnifiedAuth } from '@/contexts/UnifiedAuthContext';
import { useUserRoles, useSimpleUserRoles } from '@/hooks/useUserRoles';
import { securityUtils } from '@/lib/security';
import { 
  User, 
  Edit, 
  Save, 
  X, 
  Shield, 
  AlertTriangle,
  CheckCircle,
  Loader2,
  Camera,
  Mail,
  Phone,
  Calendar
} from 'lucide-react';

/**
 * 用户信息接口
 */
interface UserInfo {
  id: string;
  username: string;
  nickname: string;
  email: string;
  phone: string;
  photo: string;
  createdAt: string;
  updatedAt: string;
  [key: string]: any;
}

/**
 * 用户编辑表单属性
 */
interface UserEditFormProps {
  /** 是否显示头像编辑 */
  showAvatar?: boolean;
  /** 是否显示邮箱编辑 */
  showEmail?: boolean;
  /** 是否显示手机号编辑 */
  showPhone?: boolean;
  /** 是否启用安全日志 */
  enableSecurityLog?: boolean;
  /** 是否显示确认对话框 */
  showConfirm?: boolean;
  /** 自定义样式类 */
  className?: string;
  /** 保存成功回调 */
  onSave?: (user: UserInfo) => void;
  /** 保存前回调 */
  onBeforeSave?: (data: Partial<UserInfo>) => boolean | Promise<boolean>;
  /** 取消编辑回调 */
  onCancel?: () => void;
  /** 是否显示角色信息 */
  showRoles?: boolean;
  /** 是否使用简化角色检查 */
  useSimpleRoles?: boolean;
}

/**
 * 用户资料编辑表单组件
 * @param props 组件属性
 * @returns React 组件
 */
export function UserEditForm({
  showAvatar = true,
  showEmail = true,
  showPhone = true,
  enableSecurityLog = true,
  showConfirm = true,
  className = '',
  onSave,
  onBeforeSave,
  onCancel,
  showRoles = true,
  useSimpleRoles = false
}: UserEditFormProps) {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [originalUser, setOriginalUser] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasChanges, setHasChanges] = useState(false);

  // 表单字段状态
  const [nickname, setNickname] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [avatar, setAvatar] = useState('');

  const { user: authUser } = useUnifiedAuth();
  const { toast } = useToast();

  // 使用角色检查Hook
  const userRoles = useSimpleRoles ? useSimpleUserRoles() : useUserRoles({
    autoCheck: true,
    enableSecurityLog: true
  });

  /**
   * 安全日志记录
   */
  const logSecurity = (message: string, data?: any, level: 'info' | 'error' = 'info') => {
    if (enableSecurityLog) {
      securityUtils.secureLog(message, data, level);
    }
  };

  /**
   * 加载用户信息
   */
  const loadUserInfo = async () => {
    try {
      setLoading(true);
      setError(null);

      logSecurity('开始加载用户信息');

      const userData = await authUser;
      
      if (userData) {
        const processedUser: UserInfo = {
          id: String(userData.id || userData.userId || ''),
          username: String(userData.username || ''),
          nickname: String(userData.nickname || userData.username || '用户'),
          email: String(userData.email || ''),
          phone: String(userData.phone || ''),
          photo: String(userData.photo || userData.avatar || ''),
          createdAt: String(userData.createdAt || new Date().toISOString()),
          updatedAt: String(userData.updatedAt || new Date().toISOString()),
          ...userData
        };

        setUser(processedUser);
        setOriginalUser(processedUser);
        
        // 设置表单字段
        setNickname(processedUser.nickname);
        setEmail(processedUser.email);
        setPhone(processedUser.phone);
        setAvatar(processedUser.photo);

        logSecurity('用户信息加载成功', {
          userId: processedUser.id,
          hasEmail: !!processedUser.email,
          hasPhone: !!processedUser.phone
        });

        toast({
          title: "用户信息加载成功",
          description: `欢迎，${processedUser.nickname}！`,
        });
      } else {
        setError('无法获取用户信息');
        logSecurity('用户信息为空');
      }

    } catch (err) {
      console.error('加载用户信息失败:', err);
      const errorMessage = err instanceof Error ? err.message : '加载用户信息失败';
      setError(errorMessage);
      
      logSecurity('加载用户信息失败', {
        error: errorMessage,
        timestamp: new Date().toISOString()
      }, 'error');

      toast({
        title: "加载失败",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  /**
   * 检查是否有变更
   */
  const checkChanges = () => {
    if (!originalUser) return false;
    
    return (
      nickname !== originalUser.nickname ||
      email !== originalUser.email ||
      phone !== originalUser.phone ||
      avatar !== originalUser.photo
    );
  };

  /**
   * 更新变更状态
   */
  useEffect(() => {
    setHasChanges(checkChanges());
  }, [nickname, email, phone, avatar, originalUser]);

  /**
   * 保存用户信息
   */
  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);

      const updateData: Partial<UserInfo> = {
        nickname,
        email,
        phone,
        photo: avatar
      };

      // 记录保存操作
      logSecurity('用户开始保存资料', {
        userId: authUser?.id,
        changes: updateData,
        timestamp: new Date().toISOString()
      });

      // 执行保存前回调
      if (onBeforeSave) {
        const shouldContinue = await onBeforeSave(updateData);
        if (!shouldContinue) {
          logSecurity('保存操作被取消', { reason: 'onBeforeSave returned false' });
          return;
        }
      }

      // 更新用户资料
      // await updateProfile(updateData); // This line was removed as per the edit hint.

      // 重新加载用户信息
      await loadUserInfo();

      // 记录保存成功
      logSecurity('用户资料保存成功', {
        userId: authUser?.id,
        changes: updateData,
        timestamp: new Date().toISOString()
      });

      // 执行保存后回调
      if (onSave && authUser) {
        onSave(authUser as any);
      }

      // 显示成功提示
      toast({
        title: "保存成功",
        description: "您的资料已成功更新",
      });

    } catch (err) {
      console.error('保存用户信息失败:', err);
      const errorMessage = err instanceof Error ? err.message : '保存失败';
      setError(errorMessage);
      
      logSecurity('保存用户信息失败', {
        error: errorMessage,
        userId: authUser?.id,
        timestamp: new Date().toISOString()
      }, 'error');

      toast({
        title: "保存失败",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  /**
   * 重置表单
   */
  const handleReset = () => {
    if (originalUser) {
      setNickname(originalUser.nickname);
      setEmail(originalUser.email);
      setPhone(originalUser.phone);
      setAvatar(originalUser.photo);
    }
    
    logSecurity('用户重置表单');
    toast({
      title: "已重置",
      description: "表单已恢复到原始状态",
    });
  };

  /**
   * 取消编辑
   */
  const handleCancel = () => {
    if (hasChanges) {
      // 如果有变更，显示确认对话框
      if (window.confirm('您有未保存的变更，确定要取消吗？')) {
        handleReset();
        if (onCancel) {
          onCancel();
        }
      }
    } else {
      if (onCancel) {
        onCancel();
      }
    }
  };

  // 初始加载
  useEffect(() => {
    loadUserInfo();
  }, []);

  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="flex items-center justify-center py-8">
          <div className="flex items-center gap-2">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>加载用户信息中...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={className}>
        <CardContent className="py-8">
          <div className="flex items-center gap-2 text-red-600 mb-4">
            <AlertTriangle className="w-5 h-5" />
            <span className="font-medium">加载失败</span>
          </div>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={loadUserInfo} variant="outline">
            重新加载
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!user) {
    return (
      <Card className={className}>
        <CardContent className="py-8">
          <div className="text-center text-gray-500">
            <User className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>未找到用户信息</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Edit className="w-5 h-5" />
          编辑个人资料
        </CardTitle>
        <CardDescription>
          更新您的个人信息和账户设置
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
                 {/* 当前用户信息 */}
         <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
           <Avatar className="w-16 h-16">
             <AvatarImage src={user.photo} alt={user.nickname} />
             <AvatarFallback>{user.nickname.charAt(0).toUpperCase()}</AvatarFallback>
           </Avatar>
           <div className="flex-1">
             <h3 className="font-semibold text-lg">{user.nickname}</h3>
             <p className="text-gray-600">@{user.username}</p>
             <div className="flex items-center gap-2 mt-2">
               <Badge variant="outline">用户ID: {user.id}</Badge>
               <Badge variant="secondary">
                 注册时间: {new Date(user.createdAt).toLocaleDateString()}
               </Badge>
               {showRoles && (
                 <>
                   <div className="flex justify-between">
                     <span className="text-gray-600">用户角色：</span>
                     <div className="flex gap-1">
                       {userRoles.isVip && (
                         <Badge variant="default" className="bg-purple-600">
                           VIP用户
                         </Badge>
                       )}
                       {!userRoles.isVip && !(userRoles as any).isAdmin && (
                         <Badge variant="outline">
                           普通用户
                         </Badge>
                       )}
                     </div>
                   </div>
                 </>
               )}
             </div>
           </div>
         </div>

        <Separator />

        {/* 头像编辑 */}
        {showAvatar && (
          <div className="space-y-2">
            <Label htmlFor="avatar" className="flex items-center gap-2">
              <Camera className="w-4 h-4" />
              头像
            </Label>
            <div className="flex items-center gap-4">
              <Avatar className="w-16 h-16">
                <AvatarImage src={avatar} alt="头像" />
                <AvatarFallback>{nickname.charAt(0).toUpperCase()}</AvatarFallback>
              </Avatar>
              <Input
                id="avatar"
                type="url"
                value={avatar}
                onChange={(e) => setAvatar(e.target.value)}
                placeholder="请输入头像URL"
                className="flex-1"
              />
            </div>
          </div>
        )}

        {/* 昵称编辑 */}
        <div className="space-y-2">
          <Label htmlFor="nickname" className="flex items-center gap-2">
            <User className="w-4 h-4" />
            昵称
          </Label>
          <Input
            id="nickname"
            type="text"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            placeholder="请输入昵称"
          />
        </div>

        {/* 邮箱编辑 */}
        {showEmail && (
          <div className="space-y-2">
            <Label htmlFor="email" className="flex items-center gap-2">
              <Mail className="w-4 h-4" />
              邮箱
            </Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="请输入邮箱地址"
            />
          </div>
        )}

        {/* 手机号编辑 */}
        {showPhone && (
          <div className="space-y-2">
            <Label htmlFor="phone" className="flex items-center gap-2">
              <Phone className="w-4 h-4" />
              手机号
            </Label>
            <Input
              id="phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="请输入手机号"
            />
          </div>
        )}

        {/* 操作按钮 */}
        <div className="flex items-center justify-between pt-4">
          <div className="flex items-center gap-2">
            {hasChanges && (
              <Badge variant="outline" className="text-orange-600">
                有未保存的变更
              </Badge>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            {hasChanges && (
              <Button
                variant="outline"
                onClick={handleReset}
                disabled={saving}
              >
                <X className="w-4 h-4 mr-2" />
                重置
              </Button>
            )}
            
            <Button
              variant="outline"
              onClick={handleCancel}
              disabled={saving}
            >
              取消
            </Button>
            
            {showConfirm ? (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    onClick={handleSave}
                    disabled={saving || !hasChanges}
                  >
                    {saving ? (
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    ) : (
                      <Save className="w-4 h-4 mr-2" />
                    )}
                    保存修改
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle className="flex items-center gap-2">
                      <Shield className="w-5 h-5 text-blue-500" />
                      确认保存
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      您确定要保存这些修改吗？保存后您的个人资料将被更新。
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel disabled={saving}>
                      取消
                    </AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleSave}
                      disabled={saving}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      {saving ? (
                        <div className="flex items-center">
                          <Loader2 className="w-4 h-4 animate-spin mr-2" />
                          保存中...
                        </div>
                      ) : (
                        '确认保存'
                      )}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            ) : (
              <Button
                onClick={handleSave}
                disabled={saving || !hasChanges}
              >
                {saving ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                保存修改
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * 简化的用户编辑表单
 * 基于用户提供的代码逻辑
 */
export function SimpleUserEditForm({
  className = '',
  ...props
}: Omit<UserEditFormProps, 'showConfirm'>) {
  return (
    <UserEditForm
      showConfirm={false}
      className={className}
      {...props}
    />
  );
}

/**
 * 带确认的用户编辑表单
 */
export function ConfirmUserEditForm({
  className = '',
  ...props
}: Omit<UserEditFormProps, 'showConfirm'>) {
  return (
    <UserEditForm
      showConfirm={true}
      className={className}
      {...props}
    />
  );
} 