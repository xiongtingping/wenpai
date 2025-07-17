import { useState, useEffect, useCallback } from 'react';

/**
 * 简化的网络连接Hook
 * 只提供基本的网络状态监控
 */
export const useNetworkOptimization = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return {
    isOnline,
    authingStatus: 'online' as const, // 简化状态
    retryCount: 0,
    lastCheck: new Date(),
    isChecking: false,
    manualRetry: () => {}, // 空函数
    checkAuthingStatus: async () => {} // 空函数
  };
};

export type NetworkStatus = {
  isOnline: boolean;
  authingStatus: 'checking' | 'online' | 'offline';
  retryCount: number;
  lastCheck: Date;
  isChecking: boolean;
  manualRetry: () => void;
  checkAuthingStatus: () => Promise<void>;
}; 