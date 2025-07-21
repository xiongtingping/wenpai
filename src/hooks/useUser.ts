/**
 * 用户 Hook
 * 提供用户相关的便捷方法
 */

import { useUnifiedAuth } from '@/contexts/UnifiedAuthContext';

/**
 * 用户 Hook
 * 提供用户相关的便捷方法
 */
export const useUser = () => {
  const { user, isAuthenticated, updateUser } = useUnifiedAuth();
  
  return {
    // 用户信息
    user,
    isAuthenticated,
    isLoggedIn: isAuthenticated, // 兼容旧接口
    
    // 用户属性
    id: user?.id,
    username: user?.username,
    email: user?.email,
    phone: user?.phone,
    nickname: user?.nickname,
    avatar: user?.avatar,
    plan: user?.plan,
    isProUser: user?.isProUser,
    isVip: user?.isVip,
    vipLevel: user?.vipLevel,
    permissions: user?.permissions || [],
    roles: user?.roles || [],
    
    // 用户方法
    updateUser,
    
    // 用户状态检查
    hasPermission: (permission: string) => {
      return user?.permissions?.includes(permission) || false;
    },
    
    hasRole: (role: string) => {
      return user?.roles?.includes(role) || false;
    },
    
    isVipUser: () => {
      return !!(user?.isVip || user?.vipLevel || user?.isProUser);
    },
    
    isProUserCheck: () => {
      return !!(user?.isProUser || user?.plan === 'pro');
    }
  };
};

export default useUser; 