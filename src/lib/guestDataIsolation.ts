/**
 * 👤 访客模式数据隔离管理器
 * 确保不同访客用户之间的数据完全隔离，防止数据污染
 */

import { SecurityUtils } from '@/lib/security';
import { UnifiedStorageKeyManager } from '@/lib/unifiedStorageManager';

export interface GuestSession {
  sessionId: string;
  createdAt: string;
  lastActivity: string;
  userAgent: string;
  fingerprint: string;
}

/**
 * 访客数据隔离管理器
 */
export class GuestDataIsolationManager {
  private static instance: GuestDataIsolationManager;
  private currentSessionId: string | null = null;
  private sessionData: GuestSession | null = null;

  private constructor() {
    this.initializeGuestSession();
  }

  static getInstance(): GuestDataIsolationManager {
    if (!GuestDataIsolationManager.instance) {
      GuestDataIsolationManager.instance = new GuestDataIsolationManager();
    }
    return GuestDataIsolationManager.instance;
  }

  /**
   * 初始化访客会话
   */
  private initializeGuestSession(): void {
    // 检查是否可以访问 localStorage
    if (!this.isStorageAvailable()) {
      console.warn('⚠️ localStorage 不可用，跳过访客会话初始化');
      return;
    }

    // 尝试恢复现有会话
    const existingSession = this.loadGuestSession();
    
    if (existingSession && this.isSessionValid(existingSession)) {
      this.currentSessionId = existingSession.sessionId;
      this.sessionData = existingSession;
      this.updateLastActivity();
      console.log(`👤 恢复访客会话: ${this.currentSessionId}`);
    } else {
      // 创建新会话
      this.createNewGuestSession();
    }
  }

  /**
   * 检查是否可以访问 localStorage
   */
  private isStorageAvailable(): boolean {
    try {
      const testKey = '__wenpai_storage_test__';
      localStorage.setItem(testKey, 'test');
      localStorage.removeItem(testKey);
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * 创建新的访客会话
   */
  private createNewGuestSession(): void {
    if (!this.isStorageAvailable()) {
      console.warn('⚠️ localStorage 不可用，使用内存会话');
      this.currentSessionId = this.generateUniqueSessionId();
      this.sessionData = {
        sessionId: this.currentSessionId,
        createdAt: new Date().toISOString(),
        lastActivity: new Date().toISOString(),
        userAgent: navigator.userAgent,
        fingerprint: this.generateBrowserFingerprint()
      };
      console.log(`👤 创建新访客会话(内存): ${this.currentSessionId}`);
      return;
    }

    this.currentSessionId = this.generateUniqueSessionId();
    this.sessionData = {
      sessionId: this.currentSessionId,
      createdAt: new Date().toISOString(),
      lastActivity: new Date().toISOString(),
      userAgent: navigator.userAgent,
      fingerprint: this.generateBrowserFingerprint()
    };

    this.saveGuestSession();
    console.log(`👤 创建新访客会话: ${this.currentSessionId}`);
  }

  /**
   * 生成唯一的会话ID
   */
  private generateUniqueSessionId(): string {
    const timestamp = Date.now();
    const random = SecurityUtils.generateRandomString(12);
    const fingerprint = this.generateBrowserFingerprint().substring(0, 8);
    return `guest_${timestamp}_${random}_${fingerprint}`;
  }

  /**
   * 生成浏览器指纹
   */
  private generateBrowserFingerprint(): string {
    const components = [
      navigator.userAgent,
      navigator.language,
      screen.width + 'x' + screen.height,
      new Date().getTimezoneOffset().toString(),
      navigator.hardwareConcurrency?.toString() || '0'
    ];
    
    // 简单哈希算法
    let hash = 0;
    const combined = components.join('|');
    for (let i = 0; i < combined.length; i++) {
      const char = combined.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // 转换为32位整数
    }
    
    return Math.abs(hash).toString(36);
  }

  /**
   * 保存访客会话信息
   */
  private saveGuestSession(): void {
    if (!this.sessionData || !this.isStorageAvailable()) return;
    
    try {
      const sessionKey = 'wenpai:guest:session_info';
      localStorage.setItem(sessionKey, JSON.stringify(this.sessionData));
    } catch (error) {
      console.warn('保存访客会话失败:', error);
    }
  }

  /**
   * 加载访客会话信息
   */
  private loadGuestSession(): GuestSession | null {
    if (!this.isStorageAvailable()) {
      return null;
    }

    try {
      const sessionKey = 'wenpai:guest:session_info';
      const data = localStorage.getItem(sessionKey);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('加载访客会话失败:', error);
      return null;
    }
  }

  /**
   * 检查会话是否有效（24小时内活跃）
   */
  private isSessionValid(session: GuestSession): boolean {
    const lastActivity = new Date(session.lastActivity);
    const now = new Date();
    const hoursDiff = (now.getTime() - lastActivity.getTime()) / (1000 * 60 * 60);
    
    // 会话有效期：24小时
    return hoursDiff < 24;
  }

  /**
   * 更新最后活动时间
   */
  private updateLastActivity(): void {
    if (this.sessionData && this.isStorageAvailable()) {
      this.sessionData.lastActivity = new Date().toISOString();
      this.saveGuestSession();
    }
  }

  /**
   * 获取当前访客会话ID
   */
  getCurrentSessionId(): string | null {
    this.updateLastActivity();
    return this.currentSessionId;
  }

  /**
   * 获取访客数据存储键
   */
  getGuestDataKey(module: string, subModule?: string): string {
    if (!this.currentSessionId) {
      throw new Error('访客会话未初始化');
    }
    
    return UnifiedStorageKeyManager.generateGuestDataKey(
      this.currentSessionId, 
      module, 
      subModule
    );
  }

  /**
   * 存储访客数据
   */
  setGuestData<T>(module: string, data: T, subModule?: string): void {
    if (!this.isStorageAvailable()) {
      console.warn('⚠️ localStorage 不可用，无法保存访客数据');
      return;
    }

    try {
      const key = this.getGuestDataKey(module, subModule);
      localStorage.setItem(key, JSON.stringify(data));
      this.updateLastActivity();
      console.log(`💾 访客数据已保存: ${module}${subModule ? ':' + subModule : ''}`);
    } catch (error) {
      console.warn('保存访客数据失败:', error);
    }
  }

  /**
   * 获取访客数据
   */
  getGuestData<T>(module: string, subModule?: string): T | null {
    if (!this.isStorageAvailable()) {
      return null;
    }

    try {
      const key = this.getGuestDataKey(module, subModule);
      const data = localStorage.getItem(key);
      this.updateLastActivity();
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('获取访客数据失败:', error);
      return null;
    }
  }

  /**
   * 删除访客数据
   */
  removeGuestData(module: string, subModule?: string): void {
    const key = this.getGuestDataKey(module, subModule);
    localStorage.removeItem(key);
    this.updateLastActivity();
  }

  /**
   * 清理当前访客会话的所有数据
   */
  clearCurrentGuestData(): number {
    if (!this.currentSessionId) return 0;
    
    return UnifiedStorageKeyManager.clearGuestData(this.currentSessionId);
  }

  /**
   * 清理所有过期的访客会话
   */
  cleanupExpiredGuestSessions(): number {
    const allKeys = Object.keys(localStorage);
    let cleanedCount = 0;
    
    // 查找所有访客会话信息
    const sessionInfoKeys = allKeys.filter(key => key.endsWith(':session_info'));
    
    sessionInfoKeys.forEach(key => {
      try {
        const data = localStorage.getItem(key);
        if (!data) return;
        
        const session: GuestSession = JSON.parse(data);
        if (!this.isSessionValid(session)) {
          // 会话过期，清理所有相关数据
          const sessionId = session.sessionId;
          const sessionDataKeys = allKeys.filter(k => k.includes(sessionId));
          
          sessionDataKeys.forEach(dataKey => {
            localStorage.removeItem(dataKey);
            cleanedCount++;
          });
          
          console.log(`🧹 清理过期访客会话: ${sessionId}`);
        }
      } catch (error) {
        console.error(`清理访客会话失败: ${key}`, error);
      }
    });

    if (cleanedCount > 0) {
      console.log(`✅ 清理了 ${cleanedCount} 个过期访客数据项`);
    }
    
    return cleanedCount;
  }

  /**
   * 将访客数据迁移到正式用户
   */
  migrateGuestDataToUser(userId: string): number {
    if (!this.currentSessionId) return 0;
    
    const allKeys = Object.keys(localStorage);
    const guestDataKeys = allKeys.filter(key => 
      key.includes(`:guest:${this.currentSessionId}:`)
    );
    
    let migratedCount = 0;
    
    guestDataKeys.forEach(guestKey => {
      try {
        const data = localStorage.getItem(guestKey);
        if (!data) return;
        
        // 解析访客键，生成对应的用户键
        const parsed = UnifiedStorageKeyManager.parseStorageKey(guestKey);
        if (parsed.type === 'guest' && parsed.module) {
          const userKey = UnifiedStorageKeyManager.generateUserDataKey(
            userId, 
            parsed.module, 
            parsed.subModule
          );
          
          // 迁移数据
          localStorage.setItem(userKey, data);
          localStorage.removeItem(guestKey);
          
          migratedCount++;
          console.log(`📦 访客数据迁移: ${parsed.module} -> 用户 ${userId}`);
        }
      } catch (error) {
        console.error(`访客数据迁移失败: ${guestKey}`, error);
      }
    });
    
    // 清理访客会话信息
    this.clearCurrentGuestData();
    
    console.log(`✅ 访客数据迁移完成，迁移了 ${migratedCount} 项数据`);
    return migratedCount;
  }

  /**
   * 获取访客会话统计信息
   */
  getGuestSessionStats(): {
    currentSessionId: string | null;
    sessionAge: number; // 小时
    dataItemsCount: number;
    storageUsage: number; // 字节
  } {
    const allKeys = Object.keys(localStorage);
    const guestDataKeys = this.currentSessionId 
      ? allKeys.filter(key => key.includes(this.currentSessionId))
      : [];
    
    let storageUsage = 0;
    guestDataKeys.forEach(key => {
      const data = localStorage.getItem(key);
      if (data) storageUsage += data.length;
    });
    
    const sessionAge = this.sessionData 
      ? (Date.now() - new Date(this.sessionData.createdAt).getTime()) / (1000 * 60 * 60)
      : 0;
    
    return {
      currentSessionId: this.currentSessionId,
      sessionAge,
      dataItemsCount: guestDataKeys.length,
      storageUsage
    };
  }
}

/**
 * React Hook: 访客数据隔离
 */
export function useGuestDataIsolation() {
  const manager = GuestDataIsolationManager.getInstance();
  
  return {
    getCurrentSessionId: () => manager.getCurrentSessionId(),
    setGuestData: <T>(module: string, data: T, subModule?: string) => 
      manager.setGuestData(module, data, subModule),
    getGuestData: <T>(module: string, subModule?: string) => 
      manager.getGuestData<T>(module, subModule),
    removeGuestData: (module: string, subModule?: string) => 
      manager.removeGuestData(module, subModule),
    clearCurrentGuestData: () => manager.clearCurrentGuestData(),
    cleanupExpiredGuestSessions: () => manager.cleanupExpiredGuestSessions(),
    migrateGuestDataToUser: (userId: string) => manager.migrateGuestDataToUser(userId),
    getGuestSessionStats: () => manager.getGuestSessionStats()
  };
}

export const guestDataIsolation = GuestDataIsolationManager.getInstance();