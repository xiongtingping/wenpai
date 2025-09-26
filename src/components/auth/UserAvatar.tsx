/**
 * 用户头像组件
 * 使用统一认证系统显示用户信息和操作
 */

import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
// 已移除 Radix UI DropdownMenu 导入，使用原生实现
import { Badge } from '@/components/ui/badge';
import { LogIn, User, LogOut, Shield, Settings, Crown, Zap, Palette } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getUserDisplayName, getUserAvatarFallback, getUserAvatar } from '@/utils/userDisplayUtils';
// 简化权限管理 - 移除复杂的权限管理器
import { logger } from '@/utils/logger';
import { getUserTier } from '@/utils/subscriptionUtils';
import { useSubscriptionStatus } from '@/hooks/useSubscriptionStatus';

/**
 * 用户头像组件属性
 */
interface UserAvatarProps {
  /** 自定义样式类 */
  className?: string;
  /** 是否显示用户名 */
  showUsername?: boolean;
  /** 头像大小 */
  size?: 'sm' | 'md' | 'lg';
}

/**
 * 用户头像组件
 */
export const UserAvatar: React.FC<UserAvatarProps> = ({
  className = '',
  showUsername = true,
  size = 'md'
}) => {
  const { user, isAuthenticated, login, logout, updateUser } = useAuth();
  const navigate = useNavigate();
  const [unlockLoading, setUnlockLoading] = useState(false);
  const { t } = useTranslation();
  
  // 原生下拉菜单状态
  const [isNativeDropdownOpen, setIsNativeDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({});
  
  // 简化的智能定位逻辑
  const calculateDropdownPosition = () => {
    if (!triggerRef.current) return;

    const triggerRect = triggerRef.current.getBoundingClientRect();
    const dropdownWidth = 256; // w-64 = 16rem = 256px
    const viewportWidth = window.innerWidth;
    const margin = 16; // 安全边距

    console.log('🎯 定位计算:', {
      triggerLeft: triggerRect.left,
      triggerRight: triggerRect.right,
      triggerBottom: triggerRect.bottom,
      viewportWidth,
      dropdownWidth
    });

    // 计算最佳水平位置
    let left: number;
    let right: number | undefined;

    // 尝试右对齐（弹窗右边缘与触发器右边缘对齐）
    const rightAlignLeft = triggerRect.right - dropdownWidth;

    if (rightAlignLeft >= margin) {
      // 右对齐有足够空间
      left = rightAlignLeft;
      console.log('📍 右对齐定位, left:', left);
    } else {
      // 右对齐空间不足，尝试左对齐
      if (triggerRect.left + dropdownWidth <= viewportWidth - margin) {
        left = triggerRect.left;
        console.log('📍 左对齐定位, left:', left);
      } else {
        // 都不够，贴右边
        left = viewportWidth - dropdownWidth - margin;
        console.log('📍 贴右边定位, left:', left);
      }
    }

    const style: React.CSSProperties = {
      position: 'fixed',
      top: triggerRect.bottom + 8,
      left: left,
      zIndex: 999999,
      width: dropdownWidth,
      maxHeight: '85vh',
      overflowY: 'auto',
      backgroundColor: 'var(--background)',
      border: '1px solid var(--border)',
      borderRadius: '8px',
      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
    };

    setDropdownStyle(style);
  };

  // 🔧 FIX: 修复Portal下拉菜单的外部点击检测
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;
      
      // 检查点击是否在触发器内
      const isInTrigger = dropdownRef.current && dropdownRef.current.contains(target);
      
      // 🔧 FIX: 检查点击是否在Portal渲染的下拉菜单内
      const dropdownElement = document.querySelector('[data-dropdown-menu="native"]') as HTMLElement;
      const isInDropdown = dropdownElement && dropdownElement.contains(target);
      
      // 只有当点击既不在触发器内，也不在下拉菜单内时，才关闭菜单
      if (!isInTrigger && !isInDropdown) {
        console.log('🔥 检测到外部点击，关闭下拉菜单');
        setIsNativeDropdownOpen(false);
      } else {
        console.log('🔥 点击在菜单内部，保持菜单打开');
      }
    }

    if (isNativeDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
    return undefined;
  }, [isNativeDropdownOpen]);

  // 当弹窗打开时计算位置
  useEffect(() => {
    if (isNativeDropdownOpen) {
      // 延迟计算，确保DOM已渲染
      setTimeout(calculateDropdownPosition, 0);
      // 监听窗口大小变化
      window.addEventListener('resize', calculateDropdownPosition);
      return () => window.removeEventListener('resize', calculateDropdownPosition);
    }
  }, [isNativeDropdownOpen]);

  // 简单的主题切换功能
  const toggleTheme = () => {
    const currentTheme = document.documentElement.classList.contains('dark') ? 'dark' : 'light';
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    localStorage.setItem('wenpai-theme', newTheme);
  };

  // 头像大小配置
  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-12 w-12'
  };

  // ✅ FIXED: 使用安全的用户信息获取函数
  // 📌 修复问题：防止 "undefinedundefined" 字符串拼接
  // 

  // 处理跳转到个人资料
  const handleProfileClick = async () => {
    console.log('🎯 点击个人资料按钮，准备跳转到 /profile');
    
    // 🔧 FIX: 立即尝试导航，不等待状态更新
    try {
      console.log('🎯 立即尝试导航 (方案1)');
      navigate('/user-profile');
      console.log('🎯 React Router 立即导航成功');
      setIsNativeDropdownOpen(false);
      return;
    } catch (navError) {
      console.warn('🎯 立即导航失败，尝试延迟导航:', navError);
    }
    
    try {
      // 方案2：先关闭下拉菜单，再导航
      setIsNativeDropdownOpen(false);
      console.log('🎯 下拉菜单已关闭');
      
      // 延迟导航
      await new Promise(resolve => setTimeout(resolve, 150));
      
      console.log('🎯 开始延迟导航到 /profile');
      try {
        navigate('/user-profile');
        console.log('🎯 React Router 延迟导航成功');
      } catch (navError) {
        console.error('🎯 React Router导航失败，尝试window.location:', navError);
        window.location.href = '/profile';
        console.log('🎯 window.location 跳转已执行');
      }
    } catch (error) {
      console.error('🎯 所有导航方案都失败，尝试最终备用方案:', error);
      try {
        window.location.href = '/profile';
        console.log('🎯 最终备用方案跳转已执行');
      } catch (finalError) {
        console.error('🎯 所有导航方案都失败了:', finalError);
        alert('无法跳转到个人资料页面，请手动访问 /profile');
      }
    }
  };

  // 
  const handleUnlockMaxPermissions = async () => {
    logger.warn('🚫 权限解锁功能已被安全策略禁用');
    return;
  };

  // 获取用户等级和订阅状态
  const { primaryStatus } = useSubscriptionStatus();
  
  const getUserTierDisplay = () => {
    if (!user) return t('auth.user');
    
    // 使用订阅状态的标签和颜色
    return primaryStatus.statusLabel || t('auth.user');
  };
  
  const getTierBadgeClasses = () => {
    const userTier = getUserTier(user);
    
    if (userTier === 'trial') {
      return 'bg-muted text-gray-700 border-border';
    } else if (userTier === 'pro') {
      return 'bg-blue-100 text-blue-700 border-blue-200';
    } else if (userTier === 'premium') {
      return 'bg-purple-100 text-purple-700 border-purple-200';
    }
    
    return 'bg-muted text-gray-700 border-border';
  };
  
  const getTierIconColor = () => {
    const userTier = getUserTier(user);
    
    if (userTier === 'trial') {
      return 'text-muted-foreground';
    } else if (userTier === 'pro') {
      return 'text-primary';
    } else if (userTier === 'premium') {
      return 'text-purple-500';
    }
    
    return 'text-muted-foreground';
  };

  // 
  const shouldShowUnlockButton = false;

  // 未登录状态
  if (!isAuthenticated) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        {/* 已移除解锁权限按钮的 Radix UI 实现 */}
        
        <Button
          onClick={() => login()}
          variant="outline"
          size="sm"
          className="flex items-center gap-2"
        >
          <LogIn className="h-4 w-4" />
          $
        </Button>
      </div>
    );
  }

  // 已登录状态 - 使用原生下拉菜单实现
  return (
    <div className={`flex items-center gap-2 relative ${className}`} ref={dropdownRef}>
      {/* 原生实现的用户头像按钮 */}
      <button
        ref={triggerRef}
        className="relative h-auto p-2 hover:bg-accent/50 rounded-md cursor-pointer border-none bg-transparent outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
        onClick={() => {
          const newState = !isNativeDropdownOpen;
          setIsNativeDropdownOpen(newState);

          // 如果打开弹窗，立即计算位置
          if (newState) {
            setTimeout(calculateDropdownPosition, 0);
          }

          // 确保根元素可交互
          const root = document.getElementById('root');
          if (root && root.hasAttribute('aria-hidden')) {
            root.removeAttribute('aria-hidden');
          }
        }}
        type="button"
        aria-expanded={isNativeDropdownOpen}
        data-testid="native-user-avatar-trigger"
      >
        <Avatar className={sizeClasses[size]}>
          <AvatarImage
            src={getUserAvatar(user)}
            alt={getUserDisplayName(user, '用户头像')}
          />
          <AvatarFallback className="bg-accent text-primary">
            {getUserAvatarFallback(user)}
          </AvatarFallback>
        </Avatar>
      </button>

      {/* 原生下拉菜单 - 使用Portal渲染到body */}
      {isNativeDropdownOpen && createPortal(
        <div
          data-dropdown-menu="native"
          className="bg-background dark:bg-gray-800 border border-border dark:border-gray-700 rounded-md shadow-lg"
          style={dropdownStyle}
          onMouseDown={(e) => {
            // 🔧 FIX: 改用mouseDown，并且只阻止冒泡到document，不阻止内部事件
            console.log('🔥 下拉菜单容器mouseDown事件');
            // 不调用stopPropagation，让内部按钮事件正常执行
          }}
        >
          {/* 用户信息标题 */}
          <div className="px-4 py-3 border-b border-border">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">
                {getUserDisplayName(user, t('auth.user'))}
              </p>
              <p className="text-xs leading-none text-muted-foreground">
                {user?.email || ''}
              </p>
              <div className="flex items-center gap-2 mt-1">
                <Badge
                  className={`text-xs font-semibold ${getTierBadgeClasses()}`}
                >
                  <Crown className={`w-3 h-3 mr-1 ${getTierIconColor()}`} />
                  {getUserTierDisplay()}
                </Badge>
              </div>
            </div>
          </div>

          {/* 菜单项 */}
          <div className="py-1">
            <button
              className="flex items-center w-full px-4 py-2 text-sm hover:bg-accent text-left"
              onMouseDown={(e) => {
                // 🔧 FIX: 使用mouseDown而不是click，避免与外部点击监听器冲突
                console.log('🔥 个人资料按钮mouseDown事件');
                e.preventDefault();
                e.stopPropagation();
                
                // 立即执行导航，不等待异步操作
                console.log('🔥 立即执行个人资料导航');
                try {
                  // 方案1：立即导航
                  navigate('/user-profile');
                  console.log('🔥 导航成功执行');
                  setIsNativeDropdownOpen(false);
                } catch (error) {
                  console.error('🔥 导航失败，尝试备用方案:', error);
                  window.location.href = '/profile';
                }
              }}
            >
              <User className="mr-2 h-4 w-4" />
              <span>{t('auth.profile')}</span>
            </button>



            {/* 分隔线 */}
            <div className="my-1 border-t border-border"></div>

            <button
              className="flex items-center w-full px-4 py-2 text-sm hover:bg-accent text-left"
              onMouseDown={(e) => {
                // 🔧 FIX: 使用mouseDown事件，立即执行
                console.log('🚪 退出登录按钮mouseDown事件');
                e.preventDefault();
                e.stopPropagation();
                
                try {
                  console.log('🚪 立即执行logout函数');
                  logout();
                  console.log('🚪 logout函数执行完成');
                  setIsNativeDropdownOpen(false);
                } catch (error) {
                  console.error('🚪 logout函数执行失败:', error);
                  // 备用方案：强制清除并刷新页面
                  try {
                    localStorage.clear();
                    sessionStorage.clear();
                    window.location.href = '/';
                    console.log('🚪 备用方案：强制清除存储并跳转首页');
                  } catch (backupError) {
                    console.error('🚪 备用方案也失败了:', backupError);
                  }
                }
              }}
            >
              <LogOut className="mr-2 h-4 w-4" />
              <span>{t('auth.logout')}</span>
            </button>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default UserAvatar;
