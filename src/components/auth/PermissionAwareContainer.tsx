/**
 * 权限感知容器组件
 * 为子组件提供权限上下文，自动处理按钮的权限状态
 */

import React, { createContext, useContext } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { getUserTier } from '@/utils/subscriptionUtils';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Lock, Crown, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export interface PermissionContextValue {
  userTier: 'trial' | 'pro' | 'premium';
  isAuthenticated: boolean;
  hasPermission: (requiredTier: 'trial' | 'pro' | 'premium') => boolean;
}

const PermissionContext = createContext<PermissionContextValue | null>(null);

export interface PermissionAwareContainerProps {
  children: React.ReactNode;
  className?: string;
  requiredTier?: 'trial' | 'pro' | 'premium';
  featureName?: string;
}

/**
 * 权限感知容器组件
 */
export const PermissionAwareContainer: React.FC<PermissionAwareContainerProps> = ({
  children,
  className = '',
  requiredTier = 'trial',
  featureName = '此功能'
}) => {
  const { user, isAuthenticated } = useAuth();
  const userTier = getUserTier(user);
  const navigate = useNavigate();

  const hasPermission = (tier: 'trial' | 'pro' | 'premium') => {
    if (!isAuthenticated) return false;
    
    const tierLevels = { trial: 0, pro: 1, premium: 2 };
    return tierLevels[userTier] >= tierLevels[tier];
  };

  const contextValue: PermissionContextValue = {
    userTier,
    isAuthenticated,
    hasPermission
  };

  // 如果有权限或不需要权限检查，正常显示内容
  if (hasPermission(requiredTier)) {
    return (
      <PermissionContext.Provider value={contextValue}>
        <div className={className}>
          {children}
        </div>
      </PermissionContext.Provider>
    );
  }

  // 没有权限时显示付费墙
  const getTierInfo = () => {
    const tierMap: Record<string, { name: string; icon: any; color: string }> = {
      pro: { name: '专业版', icon: Zap, color: 'from-blue-600 to-blue-700' },
      premium: { name: '高级版', icon: Crown, color: 'from-purple-600 to-purple-700' },
      trial: { name: '体验版', icon: Zap, color: 'from-gray-600 to-gray-700' }
    };
    return tierMap[requiredTier] || { name: '专业版', icon: Zap, color: 'from-blue-600 to-blue-700' };
  };

  const tierInfo = getTierInfo();
  const TierIcon = tierInfo.icon;

  return (
    <PermissionContext.Provider value={contextValue}>
      <div className={className}>
        <Card className="border-2 border-dashed border-muted-foreground/30">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="mb-6 p-4 bg-gradient-to-r from-muted to-muted/50 rounded-full">
              <TierIcon className="w-8 h-8 text-muted-foreground" />
            </div>
            <div className="text-center space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-2">{featureName}</h3>
                <p className="text-muted-foreground mb-4">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-bold text-background bg-gradient-to-r ${tierInfo.color} shadow-lg`}>
                    <TierIcon className="w-4 h-4 mr-1" />
                    需要{tierInfo.name}
                  </span>
                </p>
                <p className="text-sm text-muted-foreground max-w-md">
                  升级到{tierInfo.name}解锁更多专业创意工具，提升您的内容创作效率
                </p>
              </div>
              <Button 
                onClick={() => navigate('/upgrade-plans')}
                className={`bg-gradient-to-r ${tierInfo.color} hover:opacity-90 text-background shadow-lg`}
              >
                <TierIcon className="w-4 h-4 mr-2" />
                升级解锁
              </Button>
            </div>
          </CardContent>
        </Card>
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
