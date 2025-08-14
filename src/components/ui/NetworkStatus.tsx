import React, { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle, Wifi, WifiOff } from 'lucide-react';
import { Alert, AlertDescription } from './alert';

/**
 * ✅ FIXED: 2024-07-21 Authing接口已切换为新认证地址 https://ai-wenpai.authing.cn/688237f7f9e118de849dc274
 * 📌 请勿改动，后续如需更换请单独审批
 */
/**
 * 网络状态监控组件
 * 实时监控网络连接状态和关键服务可用性
 */
export const NetworkStatus: React.FC = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [authingStatus, setAuthingStatus] = useState<'checking' | 'online' | 'offline'>('checking');
  const [lastCheck, setLastCheck] = useState<Date>(new Date());

  /**
   * 检查Authing服务可用性
   */
  const checkAuthingStatus = async () => {
    try {
      const response = await fetch('https://ai-wenpai.authing.cn/688237f7f9e118de849dc274/api/v2/applications/688237f7f9e118de849dc274/public-config', {
        method: 'GET',
        mode: 'no-cors', // 避免CORS问题
        cache: 'no-cache'
      });
      setAuthingStatus('online');
    } catch (error) {
      setAuthingStatus('offline');
    }
    setLastCheck(new Date());
  };

  useEffect(() => {
    // 监听网络状态变化
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // 初始检查
    checkAuthingStatus();

    // 定期检查Authing状态
    const interval = setInterval(checkAuthingStatus, 30000); // 每30秒检查一次

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
    };
  }, []);

  if (isOnline && authingStatus === 'online') {
    return null; // 网络正常时不显示
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm">
      <Alert variant={isOnline ? 'default' : 'destructive'}>
        <div className="flex items-center gap-2">
          {isOnline ? (
            <>
              <Wifi className="h-4 w-4" />
              <span className="font-medium">网络连接正常</span>
            </>
          ) : (
            <>
              <WifiOff className="h-4 w-4" />
              <span className="font-medium">网络连接断开</span>
            </>
          )}
        </div>
        <AlertDescription className="mt-2">
          {!isOnline && (
            <div className="space-y-1">
              <p>• 请检查网络连接</p>
              <p>• 某些功能可能不可用</p>
            </div>
          )}
          {isOnline && authingStatus === 'offline' && (
            <div className="space-y-1">
              <p>• Authing服务暂时不可用</p>
              <p>• 登录功能可能受影响</p>
              <p className="text-xs text-muted-foreground">
                最后检查: {lastCheck.toLocaleTimeString()}
              </p>
            </div>
          )}
          {authingStatus === 'checking' && (
            <p>正在检查服务状态...</p>
          )}
        </AlertDescription>
      </Alert>
    </div>
  );
};

/**
 * 网络状态指示器组件
 * 在页面顶部显示简洁的网络状态
 */
export const NetworkIndicator: React.FC = () => {
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

  if (isOnline) return null;

  return (
    <div className="bg-red-500 text-white px-3 py-1 text-sm text-center">
      <div className="flex items-center justify-center gap-2">
        <WifiOff className="h-3 w-3" />
        <span>网络连接断开</span>
      </div>
    </div>
  );
}; 