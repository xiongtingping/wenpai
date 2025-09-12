/**
 * 🕐 会话管理器
 * 
 * 功能特性：
 * - 会话超时自动检测
 * - 用户活动监测
 * - 自动登出机制
 * - 会话延期功能
 * - 多标签页同步
 * - 会话状态持久化
 * - 安全策略配置
 */

export interface SessionConfig {
  // 会话超时时间（毫秒）
  timeout: number;
  // 警告提前时间（毫秒）
  warningTime: number;
  // 活动检测间隔（毫秒）
  activityCheckInterval: number;
  // 自动延期阈值（毫秒）
  autoExtendThreshold: number;
  // 监听的活动事件类型
  activityEvents: string[];
  // 启用多标签页同步
  enableTabSync: boolean;
  // 存储键前缀
  storagePrefix: string;
}

export interface SessionState {
  isActive: boolean;
  lastActivity: number;
  sessionStart: number;
  expiresAt: number;
  warningShown: boolean;
  userId?: string;
  tabId: string;
}

export interface SessionEventCallbacks {
  onSessionWarning?: (remainingTime: number) => void;
  onSessionExpired?: () => void;
  onSessionExtended?: (newExpiryTime: number) => void;
  onActivityDetected?: (activityType: string) => void;
  onMultiTabConflict?: (conflictingTabId: string) => void;
}

const DEFAULT_CONFIG: SessionConfig = {
  timeout: 30 * 60 * 1000, // 30分钟
  warningTime: 5 * 60 * 1000, // 5分钟警告
  activityCheckInterval: 30 * 1000, // 30秒检查一次
  autoExtendThreshold: 10 * 60 * 1000, // 10分钟内有活动自动延期
  activityEvents: [
    'mousedown', 'mousemove', 'keypress', 'scroll', 
    'touchstart', 'click', 'focus', 'blur'
  ],
  enableTabSync: true,
  storagePrefix: 'wenpai_session_',
};

export class SessionManager {
  private config: SessionConfig;
  private state: SessionState;
  private callbacks: SessionEventCallbacks = {};
  private timers: Map<string, NodeJS.Timeout> = new Map();
  private eventListeners: Array<() => void> = [];
  private isDestroyed = false;
  private tabId: string;

  constructor(config?: Partial<SessionConfig>) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.tabId = this.generateTabId();
    
    this.state = {
      isActive: false,
      lastActivity: Date.now(),
      sessionStart: Date.now(),
      expiresAt: Date.now() + this.config.timeout,
      warningShown: false,
      tabId: this.tabId,
    };

    this.initializeSession();
  }

  /**
   * 生成唯一的标签页ID
   */
  private generateTabId(): string {
    return `tab_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * 初始化会话管理
   */
  private initializeSession(): void {
    // 加载持久化的会话状态
    this.loadSessionState();
    
    // 设置活动监听器
    this.setupActivityListeners();
    
    // 启动会话检查定时器
    this.startSessionCheck();
    
    // 启用多标签页同步
    if (this.config.enableTabSync) {
      this.setupTabSync();
    }
    
    console.log('🕐 会话管理器已初始化');
    console.log('📊 会话状态:', {
      timeout: this.config.timeout / 1000 / 60 + '分钟',
      expiresAt: new Date(this.state.expiresAt).toISOString(),
      tabId: this.tabId
    });
  }

  /**
   * 设置会话事件回调
   */
  public setCallbacks(callbacks: SessionEventCallbacks): void {
    this.callbacks = { ...this.callbacks, ...callbacks };
  }

  /**
   * 启动会话
   */
  public startSession(userId?: string): void {
    if (this.isDestroyed) return;

    const now = Date.now();
    this.state = {
      isActive: true,
      lastActivity: now,
      sessionStart: now,
      expiresAt: now + this.config.timeout,
      warningShown: false,
      userId,
      tabId: this.tabId,
    };

    this.saveSessionState();
    console.log('🟢 会话已启动:', { userId, expiresAt: new Date(this.state.expiresAt).toISOString() });
  }

  /**
   * 结束会话
   */
  public endSession(): void {
    this.state.isActive = false;
    this.clearAllTimers();
    this.removeActivityListeners();
    this.clearSessionStorage();
    
    console.log('🔴 会话已结束');
  }

  /**
   * 手动延长会话
   */
  public extendSession(additionalTime?: number): void {
    if (this.isDestroyed || !this.state.isActive) return;

    const extension = additionalTime || this.config.timeout;
    const now = Date.now();
    
    this.state.lastActivity = now;
    this.state.expiresAt = now + extension;
    this.state.warningShown = false;
    
    this.saveSessionState();
    this.callbacks.onSessionExtended?.(this.state.expiresAt);
    
    console.log('⏰ 会话已延长至:', new Date(this.state.expiresAt).toISOString());
  }

  /**
   * 检查会话是否过期
   */
  public isSessionExpired(): boolean {
    return Date.now() >= this.state.expiresAt;
  }

  /**
   * 获取剩余时间（毫秒）
   */
  public getRemainingTime(): number {
    return Math.max(0, this.state.expiresAt - Date.now());
  }

  /**
   * 获取会话统计信息
   */
  public getSessionStats(): {
    isActive: boolean;
    remainingTime: number;
    remainingMinutes: number;
    sessionDuration: number;
    lastActivity: string;
    userId?: string;
  } {
    const remainingTime = this.getRemainingTime();
    
    return {
      isActive: this.state.isActive,
      remainingTime,
      remainingMinutes: Math.floor(remainingTime / 1000 / 60),
      sessionDuration: Date.now() - this.state.sessionStart,
      lastActivity: new Date(this.state.lastActivity).toISOString(),
      userId: this.state.userId,
    };
  }

  /**
   * 设置活动监听器
   */
  private setupActivityListeners(): void {
    const handleActivity = (eventType: string) => {
      if (this.isDestroyed || !this.state.isActive) return;

      const now = Date.now();
      this.state.lastActivity = now;
      
      // 如果距离过期时间还有足够时间，自动延期
      if (this.state.expiresAt - now < this.config.autoExtendThreshold) {
        this.extendSession();
      }
      
      this.callbacks.onActivityDetected?.(eventType);
    };

    // 为每个事件类型添加监听器
    this.config.activityEvents.forEach(eventType => {
      const listener = () => handleActivity(eventType);
      
      // 使用被动监听器提高性能
      const options = eventType.includes('scroll') || eventType.includes('touch') 
        ? { passive: true } : false;
      
      document.addEventListener(eventType, listener, options);
      
      // 保存清理函数
      this.eventListeners.push(() => {
        document.removeEventListener(eventType, listener, options as any);
      });
    });

    console.log('👂 活动监听器已设置:', this.config.activityEvents);
  }

  /**
   * 移除活动监听器
   */
  private removeActivityListeners(): void {
    this.eventListeners.forEach(cleanup => cleanup());
    this.eventListeners = [];
    console.log('🧹 活动监听器已清理');
  }

  /**
   * 启动会话检查定时器
   */
  private startSessionCheck(): void {
    const checkTimer = setInterval(() => {
      if (this.isDestroyed || !this.state.isActive) return;

      const now = Date.now();
      const remainingTime = this.state.expiresAt - now;

      // 会话已过期
      if (remainingTime <= 0) {
        console.warn('⏰ 会话已过期');
        this.handleSessionExpired();
        return;
      }

      // 显示过期警告
      if (remainingTime <= this.config.warningTime && !this.state.warningShown) {
        this.state.warningShown = true;
        this.callbacks.onSessionWarning?.(remainingTime);
        console.warn(`⚠️ 会话将在 ${Math.floor(remainingTime / 1000 / 60)} 分钟后过期`);
      }

    }, this.config.activityCheckInterval);

    this.timers.set('sessionCheck', checkTimer);
  }

  /**
   * 处理会话过期
   */
  private handleSessionExpired(): void {
    console.log('💥 会话过期处理');
    this.state.isActive = false;
    this.callbacks.onSessionExpired?.();
    this.endSession();
  }

  /**
   * 设置多标签页同步
   */
  private setupTabSync(): void {
    const storageKey = `${this.config.storagePrefix}sync`;

    // 监听其他标签页的会话状态变化
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === storageKey && event.newValue) {
        try {
          const syncData = JSON.parse(event.newValue);
          
          // 检查是否有多个活跃标签页
          if (syncData.tabId !== this.tabId && syncData.timestamp > this.state.lastActivity) {
            this.callbacks.onMultiTabConflict?.(syncData.tabId);
          }
          
          // 同步会话状态
          if (syncData.type === 'extend' && this.state.isActive) {
            this.state.expiresAt = Math.max(this.state.expiresAt, syncData.expiresAt);
            this.state.warningShown = false;
          } else if (syncData.type === 'end') {
            this.endSession();
          }
          
        } catch (error) {
          console.error('标签页同步解析失败:', error);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    this.eventListeners.push(() => {
      window.removeEventListener('storage', handleStorageChange);
    });

    // 定期广播当前状态
    const syncTimer = setInterval(() => {
      if (!this.isDestroyed && this.state.isActive) {
        localStorage.setItem(storageKey, JSON.stringify({
          type: 'heartbeat',
          tabId: this.tabId,
          timestamp: Date.now(),
          expiresAt: this.state.expiresAt,
        }));
      }
    }, 10000); // 每10秒同步一次

    this.timers.set('tabSync', syncTimer);
  }

  /**
   * 保存会话状态到存储
   */
  private saveSessionState(): void {
    try {
      const storageKey = `${this.config.storagePrefix}state`;
      localStorage.setItem(storageKey, JSON.stringify(this.state));
    } catch (error) {
      console.error('会话状态保存失败:', error);
    }
  }

  /**
   * 从存储加载会话状态
   */
  private loadSessionState(): void {
    try {
      const storageKey = `${this.config.storagePrefix}state`;
      const savedState = localStorage.getItem(storageKey);
      
      if (savedState) {
        const parsedState = JSON.parse(savedState);
        
        // 检查会话是否仍然有效
        if (parsedState.expiresAt > Date.now() && parsedState.isActive) {
          this.state = { ...parsedState, tabId: this.tabId }; // 使用新的tabId
          console.log('📥 已恢复会话状态');
        } else {
          console.log('🗑️ 会话状态已过期，使用新状态');
          this.clearSessionStorage();
        }
      }
    } catch (error) {
      console.error('会话状态加载失败:', error);
    }
  }

  /**
   * 清理会话存储
   */
  private clearSessionStorage(): void {
    const keys = [`${this.config.storagePrefix}state`, `${this.config.storagePrefix}sync`];
    keys.forEach(key => {
      localStorage.removeItem(key);
    });
  }

  /**
   * 清理所有定时器
   */
  private clearAllTimers(): void {
    this.timers.forEach((timer, key) => {
      clearInterval(timer);
      console.log(`🧹 已清理定时器: ${key}`);
    });
    this.timers.clear();
  }

  /**
   * 销毁会话管理器
   */
  public destroy(): void {
    this.isDestroyed = true;
    this.clearAllTimers();
    this.removeActivityListeners();
    
    // 广播会话结束
    if (this.config.enableTabSync) {
      const storageKey = `${this.config.storagePrefix}sync`;
      localStorage.setItem(storageKey, JSON.stringify({
        type: 'end',
        tabId: this.tabId,
        timestamp: Date.now(),
      }));
    }
    
    console.log('🧹 会话管理器已销毁');
  }
}

// 全局会话管理器实例
let globalSessionManager: SessionManager | null = null;

/**
 * 获取全局会话管理器
 */
export function getSessionManager(): SessionManager {
  if (!globalSessionManager) {
    globalSessionManager = new SessionManager();
  }
  return globalSessionManager;
}

/**
 * 会话管理便捷函数
 */
export const SessionService = {
  start: (userId?: string) => getSessionManager().startSession(userId),
  end: () => getSessionManager().endSession(),
  extend: (additionalTime?: number) => getSessionManager().extendSession(additionalTime),
  isExpired: () => getSessionManager().isSessionExpired(),
  getRemainingTime: () => getSessionManager().getRemainingTime(),
  getStats: () => getSessionManager().getSessionStats(),
  setCallbacks: (callbacks: SessionEventCallbacks) => getSessionManager().setCallbacks(callbacks),
  destroy: () => {
    if (globalSessionManager) {
      globalSessionManager.destroy();
      globalSessionManager = null;
    }
  },
};