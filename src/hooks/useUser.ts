/**
 * 用户 Hook
 * 提供用户相关的便捷方法
 */

import { useAuth } from '@/hooks/useAuth';

/**
 * 用户 Hook
 * 提供用户相关的便捷方法
 */
export const useUser = () => {
  const { user, isAuthenticated, updateUser } = useAuth();
  
  return {
    // 用户信息
    user,
    isAuthenticated,
    isLoggedIn: isAuthenticated, // 兼容旧接口
    
    // 用户属性
    id: user?.id || '',
    username: user?.username || '',
    email: user?.email || '',
    phone: user?.phone || '',
    nickname: user?.nickname || '',
    avatar: user?.avatar || '',
    plan: user?.plan || '',
    isProUser: user?.isProUser || false,
    isVip: user?.isVip || false,
    vipLevel: user?.vipLevel || '',
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
      // 安全的VIP用户检查，避免undefined拼接
      return Boolean(
        user?.isVip === true ||
        (user?.vipLevel && user.vipLevel > 0) ||
        user?.isProUser === true
      );
    },

    isProUserCheck: () => {
      // 安全的Pro用户检查，避免undefined拼接
      return Boolean(
        user?.isProUser === true ||
        user?.plan === 'pro'
      );
    }
  };
};

export default useUser;
