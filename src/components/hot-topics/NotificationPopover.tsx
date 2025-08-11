/**
 * 通知弹窗组件
 * 右侧弹出的通知中心弹窗
 */

import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  X, 
  Minus, 
  Bell, 
  BellOff, 
  Trash2, 
  Check, 
  Star,
  StarOff,
  Clock,
  ExternalLink,
  Settings,
  AlertCircle,
  Info,
  CheckCircle
} from 'lucide-react';
import { 
  getNotifications, 
  markNotificationAsRead, 
  markAllNotificationsAsRead,
  deleteNotification,
  clearAllNotifications,
  getUnreadCount,
  type Notification,
  type NotificationLevel
} from '@/services/notificationService';

interface NotificationPopoverProps {
  /** 是否打开 */
  isOpen: boolean;
  /** 关闭回调 */
  onClose: () => void;
  /** 未读数量变化回调 */
  onUnreadCountChange: (count: number) => void;
}

/**
 * 通知弹窗组件
 */
export const NotificationPopover: React.FC<NotificationPopoverProps> = ({
  isOpen,
  onClose,
  onUnreadCountChange
}) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isMinimized, setIsMinimized] = useState(false);
  const [favoriteNotifications, setFavoriteNotifications] = useState<Set<string>>(new Set());
  const popoverRef = useRef<HTMLDivElement>(null);

  // 加载通知
  useEffect(() => {
    if (isOpen) {
      loadNotifications();
    }
  }, [isOpen]);

  // 点击外部关闭
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  const loadNotifications = () => {
    const allNotifications = getNotifications();
    setNotifications(allNotifications);
    onUnreadCountChange(getUnreadCount());
  };

  const handleMarkAsRead = (id: string) => {
    markNotificationAsRead(id);
    loadNotifications();
  };

  const handleMarkAllAsRead = () => {
    markAllNotificationsAsRead();
    loadNotifications();
  };

  const handleDeleteNotification = (id: string) => {
    deleteNotification(id);
    loadNotifications();
  };

  const handleClearAll = () => {
    clearAllNotifications();
    loadNotifications();
  };

  const handleToggleFavorite = (id: string) => {
    const newFavorites = new Set(favoriteNotifications);
    if (newFavorites.has(id)) {
      newFavorites.delete(id);
    } else {
      newFavorites.add(id);
    }
    setFavoriteNotifications(newFavorites);
  };

  // 获取通知图标
  const getNotificationIcon = (level: NotificationLevel) => {
    switch (level) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'warning':
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Info className="w-4 h-4 text-blue-500" />;
    }
  };

  // 格式化时间
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    if (diff < 60000) return '刚刚';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}小时前`;
    return date.toLocaleDateString('zh-CN');
  };

  if (!isOpen) return null;

  const unreadNotifications = notifications.filter(n => !n.readAt);

  return (
    <div 
      ref={popoverRef}
      className={`fixed right-4 top-20 z-50 transition-all duration-300 ${
        isMinimized ? 'w-80 h-12' : 'w-96 h-[600px]'
      }`}
    >
      <Card className="h-full shadow-lg border-border bg-background">
        {/* 头部 */}
        <CardHeader className="pb-3 border-b border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-primary" />
              <CardTitle className="text-lg">通知中心</CardTitle>
              {unreadNotifications.length > 0 && (
                <Badge variant="destructive" className="ml-2">
                  {unreadNotifications.length}
                </Badge>
              )}
            </div>
            
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMinimized(!isMinimized)}
                className="h-8 w-8 p-0"
              >
                <Minus className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="h-8 w-8 p-0"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>

        {/* 内容区域 */}
        {!isMinimized && (
          <CardContent className="p-0 flex flex-col h-full">
            {/* 操作按钮 */}
            <div className="p-4 border-b border-border">
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleMarkAllAsRead}
                  disabled={unreadNotifications.length === 0}
                  className="text-xs"
                >
                  <Check className="w-3 h-3 mr-1" />
                  全部已读
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleClearAll}
                  disabled={notifications.length === 0}
                  className="text-xs"
                >
                  <Trash2 className="w-3 h-3 mr-1" />
                  清空
                </Button>
              </div>
            </div>

            {/* 通知列表 */}
            <ScrollArea className="flex-1">
              {notifications.length === 0 ? (
                <div className="text-center py-8">
                  <BellOff className="w-12 h-12 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-muted-foreground">暂无通知</p>
                  <p className="text-sm text-muted-foreground">当有话题更新时会收到通知</p>
                </div>
              ) : (
                <div className="p-2 space-y-2">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-3 rounded-lg border transition-all duration-200 hover:shadow-sm ${
                        notification.readAt 
                          ? 'bg-muted/20 border-muted/30' 
                          : 'bg-background border-primary/20 shadow-sm'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 mt-1">
                          {getNotificationIcon(notification.level)}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium text-sm truncate">{notification.title}</h4>
                            {!notification.readAt && (
                              <Badge variant="secondary" className="text-xs">
                                新
                              </Badge>
                            )}
                          </div>
                          
                          <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                            {notification.message}
                          </p>
                          
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {formatTime(notification.createdAt)}
                            </span>
                            
                            <div className="flex items-center gap-1">
                              {notification.actionUrl && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 w-6 p-0"
                                  onClick={() => window.open(notification.actionUrl, '_blank')}
                                >
                                  <ExternalLink className="w-3 h-3" />
                                </Button>
                              )}
                              
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0"
                                onClick={() => handleToggleFavorite(notification.id)}
                              >
                                {favoriteNotifications.has(notification.id) ? (
                                  <Star className="w-3 h-3 text-yellow-500" />
                                ) : (
                                  <StarOff className="w-3 h-3" />
                                )}
                              </Button>
                              
                              {!notification.readAt && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 w-6 p-0"
                                  onClick={() => handleMarkAsRead(notification.id)}
                                >
                                  <Check className="w-3 h-3" />
                                </Button>
                              )}
                              
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                                onClick={() => handleDeleteNotification(notification.id)}
                              >
                                <X className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        )}
      </Card>
    </div>
  );
};

export default NotificationPopover;
