/**
 * 统一订阅状态管理 Hook
 * @description 基于 subscription-store 的单一数据源实现
 */
import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { shallow } from 'zustand/shallow';
import { useSubscriptionStore } from '@/stores/subscription-store';
import type { SubscriptionTier } from '@/types/subscription';
import { logger } from '@/utils/logger';

type SubscriptionSource = 'supabase' | 'user_profile' | 'fallback';

export interface UseSubscriptionTierOptions {
  enableAutoRefresh?: boolean;
  refreshInterval?: number;
  onTierChange?: (event: SubscriptionChangeEvent) => void;
  userProfile?: any;
}

export interface SubscriptionChangeEvent {
  userId: string;
  tier: SubscriptionTier;
  source: SubscriptionSource;
  timestamp: number;
}

export interface UseSubscriptionTierResult {
  tier: SubscriptionTier;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  isExpired: boolean;
  daysRemaining: number;
  source: SubscriptionSource;
  lastUpdated: Date | null;
}

export function useSubscriptionTier(
  userId: string | null | undefined,
  options: UseSubscriptionTierOptions = {}
): UseSubscriptionTierResult {
  const {
    enableAutoRefresh = false,
    refreshInterval = 5 * 60 * 1000,
    onTierChange,
    userProfile
  } = options;

  const { status, storeLoading, storeError, syncFromService } = useSubscriptionStore(
    (state) => ({
      status: state.status,
      storeLoading: state.loading,
      storeError: state.error,
      syncFromService: state.syncFromService
    }),
    shallow
  );

  const [manualLoading, setManualLoading] = useState(false);
  const autoRefreshTimer = useRef<NodeJS.Timeout | null>(null);

  const effectiveTier: SubscriptionTier = useMemo(() => {
    if (!userId) return 'trial';
    return status?.tier ?? 'trial';
  }, [status?.tier, userId]);

  const loading = useMemo(() => {
    if (!userId) return false;
    if (manualLoading) return true;
    if (storeLoading) return true;
    if (!status) return true;
    if (status.userId !== userId) return true;
    return false;
  }, [manualLoading, storeLoading, status, userId]);

  const error = useMemo(() => {
    if (!userId) return null;
    return storeError;
  }, [storeError, userId]);

  const triggerSync = useCallback(
    async (mode: 'standard' | 'refresh' | 'force', emitEvent: boolean) => {
      if (!userId) return;
      try {
        setManualLoading(true);
        const result = await syncFromService({
          userId,
          userProfile,
          mode,
          emitEvent
        });
        if (onTierChange) {
          onTierChange({
            userId,
            tier: result.tier,
            source: result.source,
            timestamp: Date.now()
          });
        }
      } catch (err) {
        logger.error('useSubscriptionTier sync failed', err);
      } finally {
        setManualLoading(false);
      }
    },
    [syncFromService, userId, userProfile, onTierChange]
  );

  useEffect(() => {
    if (!userId) {
      return;
    }
    const needsInitialFetch = !status || status.userId !== userId;
    if (needsInitialFetch && !storeLoading && !manualLoading) {
      void triggerSync('standard', false);
    }
  }, [manualLoading, status, storeLoading, triggerSync, userId]);

  useEffect(() => {
    if (!enableAutoRefresh || !userId) {
      return () => {
        if (autoRefreshTimer.current) {
          clearInterval(autoRefreshTimer.current);
        }
      };
    }

    autoRefreshTimer.current = setInterval(() => {
      void triggerSync('refresh', false);
    }, refreshInterval);

    return () => {
      if (autoRefreshTimer.current) {
        clearInterval(autoRefreshTimer.current);
        autoRefreshTimer.current = null;
      }
    };
  }, [enableAutoRefresh, refreshInterval, triggerSync, userId]);

  const refresh = useCallback(async () => {
    await triggerSync('refresh', false);
  }, [triggerSync]);

  const isExpired = status?.isExpired ?? false;
  const daysRemaining = status?.daysRemaining ?? 0;
  const source = status?.source ?? 'fallback';
  const lastUpdated = status?.lastUpdated ? new Date(status.lastUpdated) : null;

  return {
    tier: effectiveTier,
    loading,
    error,
    refresh,
    isExpired,
    daysRemaining,
    source,
    lastUpdated
  };
}

export function useSubscriptionTierValue(userId: string | null | undefined): SubscriptionTier {
  const { tier } = useSubscriptionTier(userId, {
    enableAutoRefresh: false
  });
  return tier;
}

export function cleanupSubscriptionSync(): void {
  // no-op: subscription-store 已处理跨 Tab 同步
  logger.debug('cleanupSubscriptionSync: no resources to release');
}
