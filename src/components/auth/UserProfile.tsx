/**
 * 用户信息展示组件
 * 显示当前登录用户的详细信息
 */

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  Shield, 
  LogOut, 
  Settings,
  Edit,
  Crown,
  Sparkles
} from 'lucide-react';
import { useUnifiedAuthContext } from '@/contexts/UnifiedAuthContext';
import { useAuthing } from '@/hooks/useAuthing';
import { secureStorage, dataMasking, securityUtils } from '@/lib/security';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

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
  plan?: string;
  isProUser?: boolean;
}

/**
 * 用户信息展示组件属性
 */
interface UserProfileProps {
  className?: string;
  showActions?: boolean;
  compact?: boolean;
}

/**
 * 用户信息展示组件
 * @param props 组件属性
 * @returns React 组件
 */
export default function UserProfile({ 
  className = '', 
  showActions = true, 
  compact = false 
}: UserProfileProps) {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const { isAuthenticated, logout } = useUnifiedAuthContext();
  const { checkLoginStatus, getCurrentUser, showLogin } = useAuthing();
  const { toast } = useToast();
  const navigate = useNavigate();

  /**
   * 加载用户信息
   */
  const loadUserInfo = async () => {
    try {
      setLoading(true);
      setError(null);

      // 检查登录状态
      const isLoggedIn = await checkLoginStatus();
      
      if (!isLoggedIn) {
        setError('用户未登录');
        setLoading(false);
        return;
      }

      // 获取用户信息
      const userData = await getCurrentUser();
      
      if (userData) {
        // 使用安全工具处理用户数据
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
        
        // 安全日志记录
        securityUtils.secureLog('用户信息加载成功', { 
          userId: processedUser.id,
          hasEmail: !!processedUser.email,
          hasPhone: !!processedUser.phone 
        });
      } else {
        setError('无法获取用户信息');
      }
    } catch (err) {
      console.error('加载用户信息失败:', err);
      setError('加载用户信息失败');
      
      // 安全日志记录错误
      securityUtils.secureLog('用户信息加载失败', { 
        error: err instanceof Error ? err.message : '未知错误' 
      }, 'error');
    } finally {
      setLoading(false);
    }
  };

  /**
   * 处理登出
   */
  const handleLogout = async () => {
    try {
      await logout();
      toast({
        title: "登出成功",
        description: "您已安全退出登录",
      });
      navigate('/');
    } catch (error) {
      console.error('登出失败:', error);
      toast({
        title: "登出失败",
        description: "请稍后重试",
        variant: "destructive"
      });
    }
  };

  /**
   * 编辑用户信息
   */
  const handleEditProfile = () => {
    navigate('/profile');
  };

  /**
   * 升级账户
   */
  const handleUpgrade = () => {
    navigate('/payment');
  };

  /**
   * 组件挂载时加载用户信息
   */
  useEffect(() => {
    if (isAuthenticated) {
      loadUserInfo();
    } else {
      setLoading(false);
      setError('用户未登录');
    }
  }, [isAuthenticated]);

  // 加载状态
  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="flex items-center space-x-4">
            <div className="animate-pulse bg-gray-200 rounded-full w-16 h-16"></div>
            <div className="space-y-2 flex-1">
              <div className="animate-pulse bg-gray-200 h-4 rounded w-3/4"></div>
              <div className="animate-pulse bg-gray-200 h-3 rounded w-1/2"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // 错误状态
  if (error || !user) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="text-center text-gray-500">
            <User className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p className="text-sm">{error || '用户信息不可用'}</p>
            {showActions && (
              <Button 
                variant="outline" 
                size="sm" 
                className="mt-4"
                onClick={() => showLogin()}
              >
                去登录
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  // 紧凑模式
  if (compact) {
    return (
      <Card className={className}>
        <CardContent className="p-4">
          <div className="flex items-center space-x-3">
            <Avatar className="w-10 h-10">
              <AvatarImage src={user.photo} alt={user.nickname} />
              <AvatarFallback>
                {user.nickname.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user.nickname}</p>
              <p className="text-xs text-gray-500 truncate">
                {user.email || user.phone || '未设置联系方式'}
              </p>
            </div>
            {showActions && (
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut className="w-4 h-4" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  // 完整模式
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="w-5 h-5" />
          用户信息
        </CardTitle>
        <CardDescription>
          您的账户信息和设置
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* 用户基本信息 */}
        <div className="flex items-start space-x-4">
          <Avatar className="w-20 h-20">
            <AvatarImage src={user.photo} alt={user.nickname} />
            <AvatarFallback className="text-lg">
              {user.nickname.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-semibold">{user.nickname}</h3>
              <Badge variant={user.isProUser ? "default" : "secondary"}>
                {user.isProUser ? (
                  <>
                    <Crown className="w-3 h-3 mr-1" />
                    专业版
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3 h-3 mr-1" />
                    体验版
                  </>
                )}
              </Badge>
            </div>
            
            <p className="text-sm text-gray-600">@{user.username}</p>
            
            {user.email && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Mail className="w-4 h-4" />
                <span>{dataMasking.maskValue(user.email, 'email')}</span>
              </div>
            )}
            
            {user.phone && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Phone className="w-4 h-4" />
                <span>{dataMasking.maskValue(user.phone, 'phone')}</span>
              </div>
            )}
          </div>
        </div>

        <Separator />

        {/* 账户信息 */}
        <div className="space-y-3">
          <h4 className="font-medium flex items-center gap-2">
            <Shield className="w-4 h-4" />
            账户信息
          </h4>
          
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500">用户ID:</span>
              <p className="font-mono text-xs bg-gray-100 p-1 rounded mt-1">
                {dataMasking.maskValue(user.id, 'id')}
              </p>
            </div>
            
            <div>
              <span className="text-gray-500">注册时间:</span>
              <p className="mt-1">
                {new Date(user.createdAt).toLocaleDateString()}
              </p>
            </div>
            
            <div>
              <span className="text-gray-500">最后更新:</span>
              <p className="mt-1">
                {new Date(user.updatedAt).toLocaleDateString()}
              </p>
            </div>
            
            <div>
              <span className="text-gray-500">账户类型:</span>
              <p className="mt-1">
                {user.plan === 'premium' ? '高级版' : 
                 user.plan === 'pro' ? '专业版' : '体验版'}
              </p>
            </div>
          </div>
        </div>

        {/* 操作按钮 */}
        {showActions && (
          <>
            <Separator />
            <div className="flex flex-wrap gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleEditProfile}
                className="flex items-center gap-1"
              >
                <Edit className="w-4 h-4" />
                编辑资料
              </Button>
              
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => navigate('/settings')}
                className="flex items-center gap-1"
              >
                <Settings className="w-4 h-4" />
                设置
              </Button>
              
              {!user.isProUser && (
                <Button 
                  variant="default" 
                  size="sm"
                  onClick={handleUpgrade}
                  className="flex items-center gap-1"
                >
                  <Crown className="w-4 h-4" />
                  升级账户
                </Button>
              )}
              
              <Button 
                variant="destructive" 
                size="sm"
                onClick={handleLogout}
                className="flex items-center gap-1 ml-auto"
              >
                <LogOut className="w-4 h-4" />
                退出登录
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
} 