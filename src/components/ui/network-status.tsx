import React, { useState, useEffect } from 'react';
import { Alert, AlertDescription } from './alert';
import { Button } from './button';
import { useNetworkOptimization } from '@/hooks/useNetworkOptimization';
import { WifiOff, RefreshCw, X } from 'lucide-react';

/**
 * 简化的网络状态监控组件
 * 只在网络断开时显示警告
 */
const NetworkStatus: React.FC = () => {
  const { isOnline } = useNetworkOptimization();
  const [showAlert, setShowAlert] = useState(false);

  useEffect(() => {
    // 只在网络断开时显示警告
    if (!isOnline) {
      setShowAlert(true);
    } else {
      setShowAlert(false);
    }
  }, [isOnline]);

  const handleDismiss = () => {
    setShowAlert(false);
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  if (!showAlert) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50 max-w-sm">
      <Alert className="border-l-4 bg-red-500 bg-white shadow-lg">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3">
            <div className="mt-0.5 bg-red-500 text-white p-1 rounded">
              <WifiOff className="h-4 w-4" />
            </div>
            <div className="flex-1">
              <AlertDescription className="font-medium text-gray-900">
                网络连接断开
              </AlertDescription>
              <p className="text-sm text-gray-600 mt-1">
                请检查您的网络连接。应用的部分功能可能无法正常使用。
              </p>
              <div className="mt-2 flex items-center space-x-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleRefresh}
                  className="h-7 px-2 text-xs"
                >
                  刷新页面
                </Button>
              </div>
            </div>
          </div>
          <Button
            size="sm"
            variant="ghost"
            onClick={handleDismiss}
            className="h-6 w-6 p-0 text-gray-400 hover:text-gray-600"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </Alert>
    </div>
  );
};

export default NetworkStatus;

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