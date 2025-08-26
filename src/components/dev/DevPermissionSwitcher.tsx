/**
 * 开发环境权限切换工具
 * 仅在开发环境下显示，用于测试不同权限级别的功能
 */

import React, { useState } from 'react';
import { Settings, User, Crown, Shield, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/hooks/useAuth';

// 开发环境用户模拟数据
const DEV_USER_PROFILES = {
  trial: {
    id: 'dev-trial-user',
    username: 'trial_user',
    nickname: '体验版用户',
    email: 'trial@dev.com',
    isVip: false,
    vipLevel: null,
    permissions: [],
    avatar: '👤'
  },
  pro: {
    id: 'dev-pro-user', 
    username: 'pro_user',
    nickname: '专业版用户',
    email: 'pro@dev.com',
    isVip: true,
    vipLevel: 'pro',
    permissions: ['theme:advanced', 'content:advanced'],
    avatar: '💼'
  },
  premium: {
    id: 'dev-premium-user',
    username: 'premium_user', 
    nickname: '高级版用户',
    email: 'premium@dev.com',
    isVip: true,
    vipLevel: 'premium',
    permissions: ['theme:advanced', 'theme:premium', 'content:advanced', 'content:premium', 'brand:full'],
    avatar: '👑'
  },
  admin: {
    id: 'dev-admin-user',
    username: 'admin_user',
    nickname: '管理员',
    email: 'admin@dev.com',
    isVip: true,
    vipLevel: 'premium',
    permissions: ['*'], // 所有权限
    avatar: '🛡️'
  }
};

interface DevPermissionSwitcherProps {
  className?: string;
}

export const DevPermissionSwitcher: React.FC<DevPermissionSwitcherProps> = ({ className }) => {
  const { user } = useAuth();
  const [currentProfile, setCurrentProfile] = useState<keyof typeof DEV_USER_PROFILES>('trial');

  // 🔒 SECURITY: 完全禁用权限切换器 - 防止生产环境权限绕过
  return null;

  const handleProfileSwitch = (profileKey: keyof typeof DEV_USER_PROFILES) => {
    const profile = DEV_USER_PROFILES[profileKey];
    setCurrentProfile(profileKey);
    
    // 更新用户状态
    // setUser functionality removed - use proper auth context methods
    
    console.log('🔄 开发环境权限切换:', {
      profile: profileKey,
      user: profile,
      permissions: profile.permissions
    });
  };

  const getProfileIcon = (profileKey: keyof typeof DEV_USER_PROFILES) => {
    switch (profileKey) {
      case 'trial': return <User className="h-4 w-4" />;
      case 'pro': return <Zap className="h-4 w-4" />;
      case 'premium': return <Crown className="h-4 w-4" />;
      case 'admin': return <Shield className="h-4 w-4" />;
      default: return <User className="h-4 w-4" />;
    }
  };

  const getProfileBadge = (profileKey: keyof typeof DEV_USER_PROFILES) => {
    switch (profileKey) {
      case 'trial': return { text: '体验版', color: 'bg-gray-100 text-gray-800' };
      case 'pro': return { text: '专业版', color: 'bg-blue-100 text-blue-800' };
      case 'premium': return { text: '高级版', color: 'bg-purple-100 text-purple-800' };
      case 'admin': return { text: '管理员', color: 'bg-red-100 text-red-800' };
      default: return { text: '未知', color: 'bg-gray-100 text-gray-800' };
    }
  };

  const currentUser = DEV_USER_PROFILES[currentProfile];
  const currentBadge = getProfileBadge(currentProfile);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={`h-8 gap-2 border-dashed border-orange-300 bg-orange-50 hover:bg-orange-100 text-orange-700 ${className}`}
          title="开发环境权限切换"
        >
          <Settings className="h-3 w-3" />
          <span className="hidden sm:inline">DEV</span>
          <Badge className={`text-xs px-1.5 py-0.5 ${currentBadge.color}`}>
            {currentBadge.text}
          </Badge>
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel className="flex items-center gap-2">
          <Settings className="h-4 w-4" />
          开发环境权限切换
        </DropdownMenuLabel>
        
        <div className="px-3 py-2 text-xs text-muted-foreground">
          当前: {currentUser.nickname} ({currentUser.avatar})
        </div>
        
        <DropdownMenuSeparator />
        
        {Object.entries(DEV_USER_PROFILES).map(([key, profile]) => {
          const profileKey = key as keyof typeof DEV_USER_PROFILES;
          const badge = getProfileBadge(profileKey);
          const isActive = currentProfile === profileKey;
          
          return (
            <DropdownMenuItem
              key={key}
              onClick={() => handleProfileSwitch(profileKey)}
              className={`flex items-center gap-3 px-3 py-2 ${isActive ? 'bg-accent' : ''}`}
            >
              <div className="flex items-center gap-2 flex-1">
                {getProfileIcon(profileKey)}
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{profile.nickname}</span>
                    <Badge className={`text-xs px-1.5 py-0.5 ${badge.color}`}>
                      {badge.text}
                    </Badge>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {profile.permissions.length > 0 
                      ? `权限: ${profile.permissions.join(', ')}`
                      : '无特殊权限'
                    }
                  </span>
                </div>
              </div>
              
              {isActive && (
                <span className="text-xs text-primary">✓</span>
              )}
            </DropdownMenuItem>
          );
        })}
        
        <DropdownMenuSeparator />
        
        <div className="px-3 py-2 text-xs text-muted-foreground">
          💡 切换用户后可测试不同权限功能
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
