/**
 * 用户订阅等级Hook
 * 
 * 🔧 2025-01 重构: 优先使用全局订阅Store，fallback到user对象
 * 
 * 用途：
 * - 获取用户当前的订阅等级
 * - 自动处理loading状态
 * - 确保显示正确的订阅状态
 * 
 * 优先级：
 * 1. 全局订阅Store（最准确，实时更新）
 * 2. user对象（可能过时）
 * 3. 默认trial
 */

import { useAuth } from '@/hooks/useAuth';
import { useSubscriptionStore } from '@/stores/subscription-store';
import { getUserTier } from '@/utils/subscriptionUtils';
import type { SubscriptionTier } from '@/types/subscription';

export interface UseUserTierResult {
  /** 用户订阅等级 */
  tier: SubscriptionTier;
  
  /** 是否正在加载 */
  loading: boolean;
  
  /** 是否是初始加载 */
  initialLoading: boolean;
  
  /** 订阅是否过期 */
  isExpired: boolean;
  
  /** 是否有活跃订阅 */
  hasActiveSubscription: boolean;
  
  /** 等级显示名称 */
  displayName: string;
  
  /** 数据来源 */
  source: 'store' | 'user' | 'default';
}

/**
 * 获取用户订阅等级
 * 
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { tier, loading, displayName } = useUserTier();
 *   
 *   if (loading) {
 *     return <Skeleton />;
 *   }
 *   
 *   return <div>{displayName}</div>;
 * }
 * ```
 */
export function useUserTier(): UseUserTierResult {
  const { user } = useAuth();
  const store = useSubscriptionStore();
  
  // 优先使用Store中的订阅状态
  if (store.status && !store.initialLoading) {
    return {
      tier: store.status.tier,
      loading: store.loading,
      initialLoading: store.initialLoading,
      isExpired: store.status.isExpired,
      hasActiveSubscription: !store.status.isExpired,
      displayName: getTierDisplayName(store.status.tier),
      source: 'store'
    };
  }
  
  // 如果Store还在初始加载，返回loading状态
  if (store.initialLoading) {
    return {
      tier: 'trial',
      loading: true,
      initialLoading: true,
      isExpired: false,
      hasActiveSubscription: false,
      displayName: '加载中...',
      source: 'default'
    };
  }
  
  // Fallback到user对象
  const tierFromUser = getUserTier(user);
  
  return {
    tier: tierFromUser,
    loading: false,
    initialLoading: false,
    isExpired: false,
    hasActiveSubscription: tierFromUser !== 'trial',
    displayName: getTierDisplayName(tierFromUser),
    source: 'user'
  };
}

/**
 * 获取等级显示名称
 */
function getTierDisplayName(tier: SubscriptionTier): string {
  const displayNames: Record<SubscriptionTier, string> = {
    trial: '体验版',
    pro: '专业版',
    premium: '高级版'
  };
  
  return displayNames[tier] || '未知版本';
}

export default useUserTier;

