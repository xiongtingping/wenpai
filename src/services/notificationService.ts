/**
 * 通知服务
 * 支持话题订阅的实时通知功能
 */

/**
 * 通知类型
 */
export type NotificationType = 'topic_update' | 'heat_alert' | 'system' | 'subscription';

/**
 * 通知级别
 */
export type NotificationLevel = 'info' | 'warning' | 'error' | 'success';

/**
 * 通知接口
 */
export interface Notification {
  id: string;
  type: NotificationType;
  level: NotificationLevel;
  title: string;
  message: string;
  data?: any;
  createdAt: string;
  readAt?: string;
  actionUrl?: string;
}

/**
 * 通知配置
 */
export interface NotificationConfig {
  enabled: boolean;
  sound: boolean;
  desktop: boolean;
  email: boolean;
  push: boolean;
  quietHours: {
    enabled: boolean;
    start: string; // HH:mm
    end: string; // HH:mm
  };
}

/**
 * 默认通知配置
 */
const DEFAULT_CONFIG: NotificationConfig = {
  enabled: true,
  sound: true,
  desktop: true,
  email: false,
  push: false,
  quietHours: {
    enabled: false,
    start: '22:00',
    end: '08:00'
  }
};

/**
 * 获取通知配置
 */
export function getNotificationConfig(): NotificationConfig {
  try {
    const stored = localStorage.getItem('notification-config');
    return stored ? { ...DEFAULT_CONFIG, ...JSON.parse(stored) } : DEFAULT_CONFIG;
  } catch (error) {
    console.error('gettingnotificationconfigurationfailed:', error);
    return DEFAULT_CONFIG;
  }
}

/**
 * 保存通知配置
 */
export function saveNotificationConfig(config: NotificationConfig): void {
  try {
    localStorage.setItem('notification-config', JSON.stringify(config));
  } catch (error) {
    console.error('savingnotificationconfigurationfailed:', error);
  }
}

/**
 * 获取通知列表
 */
export function getNotifications(): Notification[] {
  try {
    const stored = localStorage.getItem('notifications');
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('gettingnotificationlistfailed:', error);
    return [];
  }
}

/**
 * 保存通知列表
 */
export function saveNotifications(notifications: Notification[]): void {
  try {
    localStorage.setItem('notifications', JSON.stringify(notifications));
  } catch (error) {
    console.error('savingnotificationlistfailed:', error);
  }
}

/**
 * 添加通知
 */
export function addNotification(notification: Omit<Notification, 'id' | 'createdAt'>): Notification {
  const notifications = getNotifications();
  const newNotification: Notification = {
    ...notification,
    id: generateId(),
    createdAt: new Date().toISOString()
  };
  
  notifications.unshift(newNotification); // 新通知放在前面
  
  // 限制通知数量，保留最近100条
  if (notifications.length > 100) {
    notifications.splice(100);
  }
  
  saveNotifications(notifications);
  
  // 发送实时通知
  sendRealTimeNotification(newNotification);
  
  return newNotification;
}

/**
 * 标记通知为已读
 */
export function markNotificationAsRead(id: string): void {
  const notifications = getNotifications();
  const index = notifications.findIndex(n => n.id === id);
  
  if (index !== -1) {
    notifications[index].readAt = new Date().toISOString();
    saveNotifications(notifications);
  }
}

/**
 * 标记所有通知为已读
 */
export function markAllNotificationsAsRead(): void {
  const notifications = getNotifications();
  const now = new Date().toISOString();
  
  notifications.forEach(notification => {
    if (!notification.readAt) {
      notification.readAt = now;
    }
  });
  
  saveNotifications(notifications);
}

/**
 * 删除通知
 */
export function deleteNotification(id: string): void {
  const notifications = getNotifications();
  const filtered = notifications.filter(n => n.id !== id);
  saveNotifications(filtered);
}

/**
 * 清空所有通知
 */
export function clearAllNotifications(): void {
  saveNotifications([]);
}

/**
 * 获取未读通知数量
 */
export function getUnreadCount(): number {
  const notifications = getNotifications();
  return notifications.filter(n => !n.readAt).length;
}

/**
 * 发送实时通知
 */
function sendRealTimeNotification(notification: Notification): void {
  const config = getNotificationConfig();
  
  if (!config.enabled) return;
  
  // 检查静音时间
  if (config.quietHours.enabled && isInQuietHours()) {
    return;
  }
  
  // 桌面通知
  if (config.desktop && 'Notification' in window) {
    if (Notification.permission === 'granted') {
      new Notification(notification.title, {
        body: notification.message,
        icon: '/favicon.ico',
        tag: notification.id,
        requireInteraction: notification.level === 'error'
      });
    } else if (Notification.permission === 'default') {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          new Notification(notification.title, {
            body: notification.message,
            icon: '/favicon.ico'
          });
        }
      });
    }
  }
  
  // 声音通知
  if (config.sound) {
    playNotificationSound();
  }
  
  // 浏览器标签页标题闪烁
  if (document.hidden) {
    flashTabTitle(notification.title);
  }
}

/**
 * 检查是否在静音时间
 */
function isInQuietHours(): boolean {
  const config = getNotificationConfig();
  if (!config.quietHours.enabled) return false;
  
  const now = new Date();
  const currentTime = now.getHours() * 60 + now.getMinutes();
  
  const [startHour, startMinute] = config.quietHours.start.split(':').map(Number);
  const [endHour, endMinute] = config.quietHours.end.split(':').map(Number);
  
  const startTime = startHour * 60 + startMinute;
  const endTime = endHour * 60 + endMinute;
  
  if (startTime <= endTime) {
    return currentTime >= startTime && currentTime <= endTime;
  } else {
    // 跨夜的情况
    return currentTime >= startTime || currentTime <= endTime;
  }
}

/**
 * 播放通知声音
 */
function playNotificationSound(): void {
  try {
    const audio = new Audio('/notification.mp3');
    audio.volume = 0.5;
    audio.play().catch(error => {
      console.log('播放notification声音failed:', error);
    });
  } catch (error) {
    console.log('creatingaudioobjectfailed:', error);
  }
}

/**
 * 标签页标题闪烁
 */
function flashTabTitle(message: string): void {
  const originalTitle = document.title;
  let flashCount = 0;
  const maxFlashes = 5;
  
  const flash = () => {
    if (flashCount >= maxFlashes) {
      document.title = originalTitle;
      return;
    }
    
    document.title = flashCount % 2 === 0 ? `🔔 ${message}` : originalTitle;
    flashCount++;
    
    setTimeout(flash, 1000);
  };
  
  flash();
}

/**
 * 生成唯一ID
 */
function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

/**
 * 话题更新通知
 */
export function notifyTopicUpdate(
  keyword: string, 
  results: any[], 
  subscriptionName: string
): void {
  const count = results.length;
  const level: NotificationLevel = count > 0 ? 'success' : 'info';
  
  addNotification({
    type: 'topic_update',
    level,
    title: `话题更新: ${keyword}`,
    message: count > 0 
      ? `发现 ${count} 条关于"${keyword}"的新内容`
      : `"${keyword}"暂无新内容`,
    data: {
      keyword,
      subscriptionName,
      resultCount: count
    },
    actionUrl: `/hot-topics?tab=subscriptions&keyword=${encodeURIComponent(keyword)}`
  });
}

/**
 * 热度警报通知
 */
export function notifyHeatAlert(
  keyword: string, 
  heat: number, 
  threshold: number
): void {
  addNotification({
    type: 'heat_alert',
    level: 'warning',
    title: `热度警报: ${keyword}`,
    message: `"${keyword}"热度达到 ${heat.toLocaleString()}，超过阈值 ${threshold.toLocaleString()}`,
    data: {
      keyword,
      heat,
      threshold
    },
    actionUrl: `/hot-topics?tab=subscriptions&keyword=${encodeURIComponent(keyword)}`
  });
}

/**
 * 系统通知
 */
export function notifySystem(
  title: string, 
  message: string, 
  level: NotificationLevel = 'info'
): void {
  addNotification({
    type: 'system',
    level,
    title,
    message
  });
}

/**
 * 订阅状态通知
 */
export function notifySubscriptionStatus(
  action: 'created' | 'updated' | 'deleted' | 'enabled' | 'disabled',
  subscriptionName: string
): void {
  const messages = {
    created: '创建成功',
    updated: '更新成功',
    deleted: '删除成功',
    enabled: '已启用',
    disabled: '已禁用'
  };
  
  addNotification({
    type: 'subscription',
    level: 'success',
    title: `订阅${messages[action]}`,
    message: `话题订阅"${subscriptionName}"${messages[action]}`,
    data: {
      action,
      subscriptionName
    }
  });
}
