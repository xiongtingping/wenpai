/**
 * 权限感知容器组件
 * 为子组件提供权限上下文，自动处理按钮的权限状态
 */

import React, { createContext, useContext } from 'react';
import { useUnifiedAuth } from '@/contexts/UnifiedAuthContext';
import { getUserTier } from '@/utils/subscriptionUtils';

export interface PermissionContextValue {
  userTier: 'trial' | 'pro' | 'premium';
  isAuthenticated: boolean;
  hasPermission: (requiredTier: 'trial' | 'pro' | 'premium') => boolean;
}

const PermissionContext = createContext<PermissionContextValue | null>(null);

export interface PermissionAwareContainerProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * 权限感知容器组件
 */
export const PermissionAwareContainer: React.FC<PermissionAwareContainerProps> = ({
  children,
  className = ''
}) => {
  const { user, isAuthenticated } = useUnifiedAuth();
  const userTier = getUserTier(user);

  const hasPermission = (requiredTier: 'trial' | 'pro' | 'premium') => {
    if (!isAuthenticated) return false;
    
    const tierLevels = { trial: 0, pro: 1, premium: 2 };
    return tierLevels[userTier] >= tierLevels[requiredTier];
  };

  const contextValue: PermissionContextValue = {
    userTier,
    isAuthenticated,
    hasPermission
  };

  return (
    <PermissionContext.Provider value={contextValue}>
      <div className={className}>
        {children}
      </div>
    </PermissionContext.Provider>
  );
};

/**
 * 使用权限上下文的Hook
 */
export const usePermissionContext = (): PermissionContextValue => {
  const context = useContext(PermissionContext);
  if (!context) {
    throw new Error('usePermissionContext must be used within a PermissionAwareContainer');
  }
  return context;
};

export default PermissionAwareContainer;
