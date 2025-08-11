/**
 * 通知红点组件
 * 显示在全网雷达右上角的通知提醒
 */

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bell, BellRing } from 'lucide-react';
import { getUnreadCount } from '@/services/notificationService';
import { NotificationPopover } from './NotificationPopover';

interface NotificationBadgeProps {
  /** 自定义样式类名 */
  className?: string;
  /** 是否显示数字 */
  showCount?: boolean;
}

/**
 * 通知红点组件
 */
export const NotificationBadge: React.FC<NotificationBadgeProps> = ({
  className = '',
  showCount = true
}) => {
  const [unreadCount, setUnreadCount] = useState(0);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  // 加载未读数量
  useEffect(() => {
    const updateUnreadCount = () => {
      setUnreadCount(getUnreadCount());
    };

    // 初始加载
    updateUnreadCount();

    // 定期刷新未读数量
    const interval = setInterval(updateUnreadCount, 5000); // 5秒刷新一次

    return () => clearInterval(interval);
  }, []);

  // 监听通知变化
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'notifications') {
        setUnreadCount(getUnreadCount());
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  return (
    <div className={`relative ${className}`}>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsPopoverOpen(!isPopoverOpen)}
        className="relative p-2 hover:bg-accent/50"
      >
        {unreadCount > 0 ? (
          <BellRing className="w-5 h-5 text-primary animate-pulse" />
        ) : (
          <Bell className="w-5 h-5 text-muted-foreground" />
        )}
        
        {/* 红点提醒 */}
        {unreadCount > 0 && (
          <div className="absolute -top-1 -right-1">
            {showCount && unreadCount < 100 ? (
              <Badge 
                variant="destructive" 
                className="h-5 min-w-[20px] text-xs font-medium px-1 flex items-center justify-center"
              >
                {unreadCount}
              </Badge>
            ) : (
              <div className="w-3 h-3 bg-destructive rounded-full border-2 border-background" />
            )}
          </div>
        )}
      </Button>

      {/* 通知弹窗 */}
      <NotificationPopover
        isOpen={isPopoverOpen}
        onClose={() => setIsPopoverOpen(false)}
        onUnreadCountChange={setUnreadCount}
      />
    </div>
  );
};

export default NotificationBadge;
