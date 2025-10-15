/**
 * 统一的用户订阅等级/用户ID 获取工具
 * 🔧 2025-01 重构: 优先级调整为 unifiedSubscriptionService(单一真相源) → subscription-store(内存态) → localStorage 历史格式
 * 目的：全局一致，避免不同模块各自解析导致误判
 *
 * @deprecated 建议逐步迁移到 useSubscriptionTier hook，该hook提供更好的响应式和跨Tab同步
 */

import type { SubscriptionTier } from '@/types/subscription';
import { useSubscriptionStore } from '@/stores/subscription-store';
import { useUnifiedStore } from '@/stores/unified-state-store';

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
 * 🔧 2025-01 重构: 优先 unifiedSubscriptionService缓存，其次 subscription-store，最后 localStorage
 *
 * @deprecated 建议在React组件中使用 useSubscriptionTier hook，本函数仅用于非React上下文
 */
export function getEffectiveUserTier(): SubscriptionTier {
  // 0) 优先从 unifiedSubscriptionService 内存缓存获取（最快，最权威）
  // 🔧 注意: 跳过unifiedSubscriptionService的动态导入
  // 因为该函数是同步的，不能使用 await import()
  // 改为直接依赖 subscription-store 和 unified-state-store
  // try {
  //   const userId = getEffectiveUserId();
  //   if (userId) {
  //     // 需要异步导入，但此函数必须保持同步
  //   }
  // } catch {/* ignore */}

  // 1) subscription-store（内存，权威）
  try {
    // 动态引入避免 TDZ/循环依赖
    const subState = useSubscriptionStore.getState?.();
    const tier = subState?.status?.tier as SubscriptionTier | undefined;
    const isActive = subState?.status?.status === 'active';
    if (tier && (isActive || tier === 'pro' || tier === 'premium')) {
      return tier;
    }
  } catch {/* ignore */}

  // 2) unified-state-store（内存临时）- 🔧 保留作为过渡期兼容
  try {
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
    const id = useUnifiedStore.getState?.().user?.id;
    if (typeof id === 'string' && id) return id;
  } catch {/* ignore */}

  // 2) localStorage 解析
  const parsed = parseLocalStorage();
  if (parsed?.id) return parsed.id;

  return null;
}

