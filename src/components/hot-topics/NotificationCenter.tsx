/**
 * 通知中心组件
 * 显示和管理话题订阅的通知
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Bell, 
  BellOff, 
  Settings, 
  Trash2, 
  Check, 
  X,
  AlertCircle,
  Info,
  CheckCircle,
  Clock,
  ExternalLink
} from 'lucide-react';
import { 
  getNotifications, 
  markNotificationAsRead, 
  markAllNotificationsAsRead,
  deleteNotification,
  clearAllNotifications,
  getUnreadCount,
  getNotificationConfig,
  saveNotificationConfig,
  type Notification,
  type NotificationConfig,
  type NotificationLevel
} from '@/services/notificationService';

/**
 * 通知中心组件
 */
export const NotificationCenter: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [config, setConfig] = useState<NotificationConfig>(getNotificationConfig());
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [filter, setFilter] = useState<'all' | 'unread' | 'topic_update' | 'heat_alert'>('all');

  // 加载通知
  useEffect(() => {
    loadNotifications();
  }, []);

  // 定期刷新未读数量
  useEffect(() => {
    const interval = setInterval(() => {
      loadNotifications();
    }, 30000); // 30秒刷新一次

    return () => clearInterval(interval);
  }, []);

  const loadNotifications = () => {
    setNotifications(getNotifications());
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

  const handleConfigChange = (updates: Partial<NotificationConfig>) => {
    const newConfig = { ...config, ...updates };
    setConfig(newConfig);
    saveNotificationConfig(newConfig);
  };

  // 过滤通知
  const filteredNotifications = notifications.filter(notification => {
    switch (filter) {
      case 'unread':
        return !notification.readAt;
      case 'topic_update':
        return notification.type === 'topic_update';
      case 'heat_alert':
        return notification.type === 'heat_alert';
      default:
        return true;
    }
  });

  // 获取通知图标
  const getNotificationIcon = (type: string, level: NotificationLevel) => {
    switch (level) {
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-600" />;
      case 'warning':
        return <AlertCircle className="w-4 h-4 text-yellow-600" />;
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      default:
        return <Info className="w-4 h-4 text-blue-600" />;
    }
  };

  // 获取通知颜色
  const getNotificationColor = (level: NotificationLevel) => {
    switch (level) {
      case 'error':
        return 'border-red-200 bg-red-50';
      case 'warning':
        return 'border-yellow-200 bg-yellow-50';
      case 'success':
        return 'border-green-200 bg-green-50';
      default:
        return 'border-blue-200 bg-blue-50';
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

  const unreadCount = getUnreadCount();

  return (
    <div className="space-y-4">
      {/* 通知中心头部 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bell className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-semibold">通知中心</h3>
          {unreadCount > 0 && (
            <Badge variant="destructive" className="ml-2">
              {unreadCount}
            </Badge>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          <Select value={filter} onValueChange={(value: any) => setFilter(value)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部</SelectItem>
              <SelectItem value="unread">未读</SelectItem>
              <SelectItem value="topic_update">话题更新</SelectItem>
              <SelectItem value="heat_alert">热度警报</SelectItem>
            </SelectContent>
          </Select>
          
          <Dialog open={isConfigOpen} onOpenChange={setIsConfigOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Settings className="w-4 h-4" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>通知设置</DialogTitle>
                <DialogDescription>
                  配置通知的显示方式和时间
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>启用通知</Label>
                  <Switch
                    checked={config.enabled}
                    onCheckedChange={(checked) => handleConfigChange({ enabled: checked })}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label>桌面通知</Label>
                  <Switch
                    checked={config.desktop}
                    onCheckedChange={(checked) => handleConfigChange({ desktop: checked })}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label>声音提醒</Label>
                  <Switch
                    checked={config.sound}
                    onCheckedChange={(checked) => handleConfigChange({ sound: checked })}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label>静音时间</Label>
                  <Switch
                    checked={config.quietHours.enabled}
                    onCheckedChange={(checked) => 
                      handleConfigChange({ 
                        quietHours: { ...config.quietHours, enabled: checked } 
                      })
                    }
                  />
                </div>
                
                {config.quietHours.enabled && (
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label className="text-sm">开始时间</Label>
                      <Input
                        type="time"
                        value={config.quietHours.start}
                        onChange={(e) => 
                          handleConfigChange({ 
                            quietHours: { ...config.quietHours, start: e.target.value } 
                          })
                        }
                      />
                    </div>
                    <div>
                      <Label className="text-sm">结束时间</Label>
                      <Input
                        type="time"
                        value={config.quietHours.end}
                        onChange={(e) => 
                          handleConfigChange({ 
                            quietHours: { ...config.quietHours, end: e.target.value } 
                          })
                        }
                      />
                    </div>
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
          
          {unreadCount > 0 && (
            <Button variant="outline" size="sm" onClick={handleMarkAllAsRead}>
              <Check className="w-4 h-4" />
              全部已读
            </Button>
          )}
          
          {notifications.length > 0 && (
            <Button variant="outline" size="sm" onClick={handleClearAll}>
              <Trash2 className="w-4 h-4" />
              清空
            </Button>
          )}
        </div>
      </div>

      {/* 通知列表 */}
      {filteredNotifications.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <BellOff className="w-12 h-12 mx-auto mb-2 text-gray-300" />
            <p className="text-gray-500">暂无通知</p>
            <p className="text-sm text-gray-400">当有话题更新或热度变化时会收到通知</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {filteredNotifications.map((notification) => (
            <Card 
              key={notification.id} 
              className={`transition-all duration-200 hover:shadow-md ${
                notification.readAt ? 'opacity-75' : ''
              } ${getNotificationColor(notification.level)}`}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="flex-shrink-0 mt-1">
                      {getNotificationIcon(notification.type, notification.level)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-sm">{notification.title}</h4>
                        {!notification.readAt && (
                          <Badge variant="secondary" className="text-xs">
                            新
                          </Badge>
                        )}
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-2">
                        {notification.message}
                      </p>
                      
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatTime(notification.createdAt)}
                        </span>
                        
                        {notification.actionUrl && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-auto p-0 text-xs"
                            onClick={() => window.open(notification.actionUrl, '_blank')}
                          >
                            <ExternalLink className="w-3 h-3 mr-1" />
                            查看详情
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-1 ml-2">
                    {!notification.readAt && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleMarkAsRead(notification.id)}
                        className="h-8 w-8 p-0"
                      >
                        <Check className="w-4 h-4" />
                      </Button>
                    )}
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteNotification(notification.id)}
                      className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default NotificationCenter; 