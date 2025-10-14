/**
 * Stale-While-Revalidate Hook
 * 实现缓存优先策略，先展示缓存数据，后台更新
 *
 * 核心原则：
 * 1. 立即返回缓存数据（如果存在）
 * 2. 后台异步刷新数据
 * 3. 刷新完成后平滑更新UI
 * 4. 使用版本号防止旧数据覆盖新数据
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { logger } from '@/utils/logger';

interface SWROptions<T> {
  /** 缓存key */
  key: string;
  /** 数据获取函数 */
  fetcher: () => Promise<T>;
  /** 重新验证间隔（毫秒），默认30秒 */
  revalidateInterval?: number;
  /** 是否在挂载时自动获取 */
  revalidateOnMount?: boolean;
  /** 是否在窗口聚焦时重新验证 */
  revalidateOnFocus?: boolean;
  /** 初始数据 */
  initialData?: T;
  /** 数据比较函数，用于判断是否需要更新UI */
  compare?: (oldData: T | null, newData: T) => boolean;
}

interface SWRResult<T> {
  /** 当前数据（可能是缓存数据） */
  data: T | null;
  /** 错误信息 */
  error: Error | null;
  /** 是否正在加载（仅首次加载为true） */
  isLoading: boolean;
  /** 是否正在后台验证 */
  isValidating: boolean;
  /** 是否来自缓存 */
  isStale: boolean;
  /** 手动触发重新验证 */
  mutate: (newData?: T) => Promise<void>;
  /** 强制刷新 */
  refresh: () => Promise<void>;
}

// 内存缓存存储
const memoryCache = new Map<string, { data: any; timestamp: number; version: number }>();

// 版本号管理器
class VersionManager {
  private versions = new Map<string, number>();

  get(key: string): number {
    return this.versions.get(key) || 0;
  }

  increment(key: string): number {
    const current = this.get(key);
    const next = current + 1;
    this.versions.set(key, next);
    return next;
  }

  isLatest(key: string, version: number): boolean {
    return version >= this.get(key);
  }
}

const versionManager = new VersionManager();

/**
 * Stale-While-Revalidate Hook
 */
export function useStaleWhileRevalidate<T>({
  key,
  fetcher,
  revalidateInterval = 30000,
  revalidateOnMount = true,
  revalidateOnFocus = true,
  initialData,
  compare
}: SWROptions<T>): SWRResult<T> {
  const [data, setData] = useState<T | null>(initialData || null);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(!initialData && !memoryCache.has(key));
  const [isValidating, setIsValidating] = useState<boolean>(false);
  const [isStale, setIsStale] = useState<boolean>(false);

  const isMountedRef = useRef(true);
  const timerRef = useRef<NodeJS.Timeout>();
  const lastFetchTimeRef = useRef<number>(0);

  /**
   * 从缓存加载数据
   */
  const loadFromCache = useCallback(() => {
    const cached = memoryCache.get(key);
    if (cached) {
      logger.debug(`[SWR] 从缓存加载数据: ${key}`, { timestamp: cached.timestamp });
      setData(cached.data);
      setIsStale(true);
      setIsLoading(false);
      return true;
    }
    return false;
  }, [key]);

  /**
   * 执行数据获取和验证
   */
  const revalidate = useCallback(async (silent = false) => {
    // 获取当前版本号
    const currentVersion = versionManager.increment(key);

    if (!silent) {
      setIsValidating(true);
    }

    try {
      logger.debug(`[SWR] 开始验证: ${key} (v${currentVersion})`);
      const startTime = Date.now();

      const newData = await fetcher();
      const fetchDuration = Date.now() - startTime;

      lastFetchTimeRef.current = Date.now();

      // 检查版本号，防止旧数据覆盖新数据
      if (!versionManager.isLatest(key, currentVersion)) {
        logger.warn(`[SWR] 丢弃旧版本数据: ${key} (v${currentVersion})`);
        return;
      }

      // 检查组件是否已卸载
      if (!isMountedRef.current) {
        logger.debug(`[SWR] 组件已卸载，跳过更新: ${key}`);
        return;
      }

      // 判断数据是否需要更新
      const shouldUpdate = compare ? compare(data, newData) : true;

      if (shouldUpdate) {
        // 更新内存缓存
        memoryCache.set(key, {
          data: newData,
          timestamp: Date.now(),
          version: currentVersion
        });

        // 更新状态
        setData(newData);
        setIsStale(false);
        setError(null);

        logger.info(`[SWR] 数据更新成功: ${key}`, {
          duration: fetchDuration,
          version: currentVersion,
          hasData: !!newData
        });
      } else {
        logger.debug(`[SWR] 数据未变化，跳过更新: ${key}`);
      }

    } catch (err) {
      logger.error(`[SWR] 验证失败: ${key}`, { error: err });

      if (isMountedRef.current) {
        setError(err instanceof Error ? err : new Error(String(err)));
      }
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
        setIsValidating(false);
      }
    }
  }, [key, fetcher, data, compare]);

  /**
   * 手动更新数据
   */
  const mutate = useCallback(async (newData?: T) => {
    if (newData !== undefined) {
      const currentVersion = versionManager.increment(key);

      // 乐观更新
      memoryCache.set(key, {
        data: newData,
        timestamp: Date.now(),
        version: currentVersion
      });
      setData(newData);
      setIsStale(false);

      logger.info(`[SWR] 手动更新数据: ${key}`, { version: currentVersion });
    } else {
      // 重新验证
      await revalidate();
    }
  }, [key, revalidate]);

  /**
   * 强制刷新
   */
  const refresh = useCallback(async () => {
    // 清除缓存
    memoryCache.delete(key);
    setIsStale(false);

    // 重新加载
    await revalidate();
  }, [key, revalidate]);

  /**
   * 初始化加载
   */
  useEffect(() => {
    isMountedRef.current = true;

    // 1. 先尝试从缓存加载
    const hasCache = loadFromCache();

    // 2. 如果需要在挂载时验证，则触发后台验证
    if (revalidateOnMount) {
      // 如果有缓存，静默验证；否则显示加载状态
      revalidate(!hasCache);
    }

    return () => {
      isMountedRef.current = false;
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [key, loadFromCache, revalidate, revalidateOnMount]);

  /**
   * 定时重新验证
   */
  useEffect(() => {
    if (!revalidateInterval || revalidateInterval <= 0) return;

    timerRef.current = setInterval(() => {
      if (isMountedRef.current) {
        logger.debug(`[SWR] 定时验证触发: ${key}`);
        revalidate(true); // 静默验证
      }
    }, revalidateInterval);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [key, revalidateInterval, revalidate]);

  /**
   * 窗口聚焦时重新验证
   */
  useEffect(() => {
    if (!revalidateOnFocus) return;

    const handleFocus = () => {
      const timeSinceLastFetch = Date.now() - lastFetchTimeRef.current;

      // 如果距离上次获取超过5秒，则重新验证
      if (timeSinceLastFetch > 5000) {
        logger.debug(`[SWR] 窗口聚焦触发验证: ${key}`);
        revalidate(true); // 静默验证
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [key, revalidateOnFocus, revalidate]);

  return {
    data,
    error,
    isLoading,
    isValidating,
    isStale,
    mutate,
    refresh
  };
}

/**
 * 清除指定key的缓存
 */
export function clearSWRCache(key: string) {
  memoryCache.delete(key);
  logger.debug(`[SWR] 清除缓存: ${key}`);
}

/**
 * 清除所有缓存
 */
export function clearAllSWRCache() {
  memoryCache.clear();
  logger.debug('[SWR] 清除所有缓存');
}

export default useStaleWhileRevalidate;
