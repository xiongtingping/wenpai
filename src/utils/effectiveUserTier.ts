/**
 * 统一的用户订阅等级/用户ID 获取工具
 * 优先级：subscription-store(内存态) → unified-state-store(内存态) → localStorage 历史格式
 * 目的：全局一致，避免不同模块各自解析导致误判
 */

import type { SubscriptionTier } from '@/types/subscription';

interface ParsedUser {
  id: string | null;
  tier: SubscriptionTier | null;
}

const STORAGE_KEYS = [
  'wenpai-unified-store', // v4 单一数据源（持久层裁剪后仅留基础身份）
  'unified-user-state',   // 兼容旧的统一用户状态
  'wenpai_auth_state',    // 旧版认证状态
  '_authing_user'         // Authing 原始数据
] as const;

function isTier(v: unknown): v is SubscriptionTier {
  return v === 'trial' || v === 'pro' || v === 'premium';
}

function extractTierFromUser(user: unknown): SubscriptionTier | null {
  if (!user || typeof user !== 'object') return null;
  const u = user as Record<string, unknown>;

  let tier: unknown = undefined;
  const sub = u.subscription as unknown;
  if (typeof sub === 'string') {
    tier = sub;
  } else if (sub && typeof sub === 'object') {
    const subObj = sub as Record<string, unknown>;
    if ('tier' in subObj) tier = subObj.tier;
    else if ('plan' in subObj) tier = subObj.plan;
  }
  if (!tier) {
    if ('tier' in u) tier = u.tier;
    else if ('plan' in u) tier = u.plan;
  }

  return isTier(tier) ? tier : null;
}

function extractIdFromUser(user: unknown): string | null {
  if (!user || typeof user !== 'object') return null;
  const u = user as Record<string, unknown>;
  if (typeof u.id === 'string' && (u.id as string)) return u.id as string;
  const nestedUser = u.user as unknown;
  if (nestedUser && typeof nestedUser === 'object') {
    const nu = nestedUser as Record<string, unknown>;
    if (typeof nu.id === 'string' && nu.id) return nu.id as string;
  }
  return null;
}

function parseLocalStorage(): ParsedUser | null {
  try {
    for (const key of STORAGE_KEYS) {
      const raw = typeof localStorage !== 'undefined' ? localStorage.getItem(key) : null;
      if (!raw) continue;
      try {
        const parsed = JSON.parse(raw);
        // 兼容多种结构
        const userLike = parsed?.state?.user ?? parsed?.user ?? parsed ?? null;
        const id = extractIdFromUser(userLike);
        const tier = extractTierFromUser(userLike);
        if (id || tier) {
          return { id: id ?? null, tier: tier ?? null };
        }
      } catch {
        // 下一个 key
      }
    }
  } catch {
    // ignore
  }
  return null;
}

/**
 * 获取权威用户订阅等级（无参版本，全局可用）
 * 优先 subscription-store，其次 unified-state-store，最后 localStorage
 */
export function getEffectiveUserTier(): SubscriptionTier {
  // 1) subscription-store（内存，权威）
  try {
    // 动态引入避免 TDZ/循环依赖
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { useSubscriptionStore } = require('@/stores/subscription-store');
    const subState = useSubscriptionStore.getState?.();
    const tier = subState?.status?.tier as SubscriptionTier | undefined;
    const isActive = subState?.status?.status === 'active';
    if (tier && (isActive || tier === 'pro' || tier === 'premium')) {
      return tier;
    }
  } catch {/* ignore */}

  // 2) unified-state-store（内存临时）
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { useUnifiedStore } = require('@/stores/unified-state-store');
    const memTier = useUnifiedStore.getState?.().user?.subscription as SubscriptionTier | undefined;
    if (memTier && memTier !== 'trial') {
      return memTier;
    }
  } catch {/* ignore */}

  // 3) localStorage 历史格式回退
  const parsed = parseLocalStorage();
  if (parsed?.tier && isTier(parsed.tier)) {
    return parsed.tier;
  }

  return 'trial';
}

/**
 * 获取有效的用户ID（优先使用运行时内存，其次 localStorage 兼容格式）
 */
export function getEffectiveUserId(): string | null {
  // 1) unified-state-store（内存）
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { useUnifiedStore } = require('@/stores/unified-state-store');
    const id = useUnifiedStore.getState?.().user?.id;
    if (typeof id === 'string' && id) return id;
  } catch {/* ignore */}

  // 2) localStorage 解析
  const parsed = parseLocalStorage();
  if (parsed?.id) return parsed.id;

  return null;
}

