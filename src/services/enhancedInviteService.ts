/**
 * 增强邀请系统服务
 * @description 实现前后端邀请数据的实时同步、邀请效果统计和分析功能
 */

import { request } from '@/api/request';
import { unifiedUsageService } from '@/services/unifiedUsageService';

/**
 * 邀请关系接口
 */
export interface InviteRelation {
  /** 邀请关系ID */
  id: string;
  /** 邀请人ID */
  inviterId: string;
  /** 被邀请人ID */
  inviteeId: string;
  /** 创建时间 */
  createdAt: string;
  /** 邀请状态 */
  status: 'pending' | 'registered' | 'activated' | 'rewarded';
  /** 奖励是否已发放 */
  rewardProcessed: boolean;
  /** 奖励发放时间 */
  rewardedAt?: string;
  /** 邀请来源 */
  source: 'link' | 'code' | 'direct';
  /** 额外信息 */
  metadata?: Record<string, any>;
}

/**
 * 邀请统计接口
 */
export interface InviteStats {
  /** 用户ID */
  userId: string;
  /** 邀请链接点击数 */
  linkClicks: number;
  /** 成功注册数 */
  successfulRegistrations: number;
  /** 已激活用户数 */
  activatedUsers: number;
  /** 已发放奖励数 */
  rewardsIssued: number;
  /** 总奖励次数 */
  totalRewardCount: number;
  /** 转化率 */
  conversionRate: number;
  /** 最后更新时间 */
  lastUpdated: string;
}

/**
 * 邀请奖励配置
 */
export interface InviteRewardConfig {
  /** 奖励类型 */
  type: 'usage_count' | 'tokens' | 'premium_days';
  /** 奖励数量 */
  amount: number;
  /** 奖励描述 */
  description: string;
  /** 是否双方都获得 */
  bothParties: boolean;
}

/**
 * 邀请效果分析
 */
export interface InviteAnalytics {
  /** 时间段 */
  period: 'daily' | 'weekly' | 'monthly';
  /** 邀请趋势数据 */
  trends: {
    date: string;
    invites: number;
    registrations: number;
    activations: number;
    rewards: number;
  }[];
  /** 转化漏斗 */
  conversionFunnel: {
    linkClicks: number;
    registrations: number;
    activations: number;
    rewards: number;
  };
  /** 热门邀请人排行 */
  topInviters: {
    userId: string;
    userName: string;
    inviteCount: number;
    rewardCount: number;
  }[];
}

/**
 * 增强邀请系统服务类
 */
class EnhancedInviteService {
  private readonly API_ENDPOINT = '/api/enhanced-invite';
  private readonly STORAGE_KEY = 'enhanced_invite_cache';
  private readonly SYNC_INTERVAL = 2 * 60 * 1000; // 2分钟同步一次
  
  private syncTimer: NodeJS.Timeout | null = null;
  private pendingSyncData: Map<string, any> = new Map();

  /**
   * 邀请奖励配置
   */
  private readonly REWARD_CONFIG: InviteRewardConfig = {
    type: 'usage_count',
    amount: 20,
    description: '每邀请1人注册，双方各获20次AI内容适配器使用机会',
    bothParties: true
  };

  /**
   * 生成邀请链接
   */
  async generateInviteLink(userId: string): Promise<string> {
    try {
      const response = await request.get(`${this.API_ENDPOINT}/link/${userId}`);
      return response.data.inviteLink;
    } catch (error) {
      console.warn('生成邀请链接失败，使用本地生成:', error);
      
      // 本地生成邀请链接
      const baseUrl = window.location.origin;
      return `${baseUrl}/register?inviter=${userId}&t=${Date.now()}`;
    }
  }

  /**
   * 跟踪邀请链接点击
   */
  async trackInviteLinkClick(inviterId: string, metadata?: Record<string, any>): Promise<void> {
    try {
      // 1. 立即记录到本地
      this.recordLocalEvent('link_click', { inviterId, metadata });
      
      // 2. 异步同步到后端
      await request.post(`${this.API_ENDPOINT}/track-click`, {
        inviterId,
        timestamp: new Date().toISOString(),
        metadata: {
          userAgent: navigator.userAgent,
          referrer: document.referrer,
          ...metadata
        }
      });
    } catch (error) {
      console.warn('跟踪邀请链接点击失败:', error);
      // 添加到待同步队列
      this.addToPendingSync('track_click', { inviterId, metadata });
    }
  }

  /**
   * 绑定邀请关系
   */
  async bindInviteRelation(inviterId: string, inviteeId: string): Promise<InviteRelation> {
    try {
      const response = await request.post(`${this.API_ENDPOINT}/bind`, {
        inviterId,
        inviteeId,
        source: 'link',
        createdAt: new Date().toISOString()
      });
      
      const relation: InviteRelation = response.data;
      
      // 更新本地缓存
      this.updateLocalInviteCache(relation);
      
      return relation;
    } catch (error) {
      console.error('绑定邀请关系失败:', error);
      
      // 创建本地邀请关系记录
      const relation: InviteRelation = {
        id: `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        inviterId,
        inviteeId,
        createdAt: new Date().toISOString(),
        status: 'registered',
        rewardProcessed: false,
        source: 'link'
      };
      
      this.updateLocalInviteCache(relation);
      this.addToPendingSync('bind_relation', relation);
      
      return relation;
    }
  }

  /**
   * 处理邀请奖励
   */
  async processInviteReward(inviterId: string, inviteeId: string): Promise<boolean> {
    try {
      // 1. 验证邀请关系
      const relation = await this.getInviteRelation(inviteeId);
      if (!relation || relation.inviterId !== inviterId) {
        throw new Error('邀请关系不存在或不匹配');
      }
      
      if (relation.rewardProcessed) {
        console.warn('邀请奖励已发放过');
        return false;
      }
      
      // 2. 发放奖励
      const rewardSuccess = await this.issueReward(inviterId, inviteeId);
      if (!rewardSuccess) {
        throw new Error('奖励发放失败');
      }
      
      // 3. 更新邀请关系状态
      await this.updateInviteRelationStatus(relation.id, 'rewarded', {
        rewardProcessed: true,
        rewardedAt: new Date().toISOString()
      });
      
      // 4. 同步到后端
      await request.post(`${this.API_ENDPOINT}/reward`, {
        inviterId,
        inviteeId,
        rewardConfig: this.REWARD_CONFIG,
        processedAt: new Date().toISOString()
      });
      
      return true;
    } catch (error) {
      console.error('处理邀请奖励失败:', error);
      
      // 添加到待同步队列
      this.addToPendingSync('process_reward', { inviterId, inviteeId });
      
      return false;
    }
  }

  /**
   * 获取邀请统计
   */
  async getInviteStats(userId: string): Promise<InviteStats> {
    try {
      const response = await request.get(`${this.API_ENDPOINT}/stats/${userId}`);
      const stats: InviteStats = response.data;
      
      // 更新本地缓存
      this.updateLocalStatsCache(userId, stats);
      
      return stats;
    } catch (error) {
      console.warn('获取邀请统计失败，使用本地缓存:', error);
      
      // 返回本地缓存或默认数据
      return this.getLocalInviteStats(userId);
    }
  }

  /**
   * 获取邀请关系列表
   */
  async getInviteRelations(userId: string): Promise<InviteRelation[]> {
    try {
      const response = await request.get(`${this.API_ENDPOINT}/relations/${userId}`);
      return response.data;
    } catch (error) {
      console.warn('获取邀请关系失败，使用本地缓存:', error);
      return this.getLocalInviteRelations(userId);
    }
  }

  /**
   * 获取邀请效果分析
   */
  async getInviteAnalytics(userId: string, period: 'daily' | 'weekly' | 'monthly' = 'monthly'): Promise<InviteAnalytics> {
    try {
      const response = await request.get(`${this.API_ENDPOINT}/analytics/${userId}?period=${period}`);
      return response.data;
    } catch (error) {
      console.warn('获取邀请分析失败，返回默认数据:', error);
      return this.getDefaultAnalytics(period);
    }
  }

  /**
   * 发放奖励
   */
  private async issueReward(inviterId: string, inviteeId: string): Promise<boolean> {
    try {
      if (this.REWARD_CONFIG.type === 'usage_count') {
        // 使用统一使用量服务发放使用次数
        const inviterSuccess = await this.addUsageCount(inviterId, this.REWARD_CONFIG.amount);
        const inviteeSuccess = this.REWARD_CONFIG.bothParties ? 
          await this.addUsageCount(inviteeId, this.REWARD_CONFIG.amount) : true;
        
        return inviterSuccess && inviteeSuccess;
      }
      
      return true;
    } catch (error) {
      console.error('发放奖励失败:', error);
      return false;
    }
  }

  /**
   * 添加使用次数
   */
  private async addUsageCount(userId: string, amount: number): Promise<boolean> {
    try {
      // 这里应该调用后端API增加使用次数
      // 目前使用模拟实现
      console.log(`为用户 ${userId} 增加 ${amount} 次使用机会`);
      return true;
    } catch (error) {
      console.error('添加使用次数失败:', error);
      return false;
    }
  }

  /**
   * 获取邀请关系
   */
  private async getInviteRelation(inviteeId: string): Promise<InviteRelation | null> {
    try {
      const response = await request.get(`${this.API_ENDPOINT}/relation/${inviteeId}`);
      return response.data;
    } catch (error) {
      console.warn('获取邀请关系失败:', error);
      return this.getLocalInviteRelation(inviteeId);
    }
  }

  /**
   * 更新邀请关系状态
   */
  private async updateInviteRelationStatus(
    relationId: string, 
    status: InviteRelation['status'], 
    updates: Partial<InviteRelation>
  ): Promise<void> {
    try {
      await request.put(`${this.API_ENDPOINT}/relation/${relationId}`, {
        status,
        ...updates,
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      console.warn('更新邀请关系状态失败:', error);
      this.addToPendingSync('update_relation', { relationId, status, updates });
    }
  }

  /**
   * 记录本地事件
   */
  private recordLocalEvent(eventType: string, data: any): void {
    try {
      const events = this.getLocalEvents();
      events.push({
        type: eventType,
        data,
        timestamp: new Date().toISOString()
      });
      
      // 只保留最近1000个事件
      if (events.length > 1000) {
        events.splice(0, events.length - 1000);
      }
      
      localStorage.setItem(`${this.STORAGE_KEY}_events`, JSON.stringify(events));
    } catch (error) {
      console.error('记录本地事件失败:', error);
    }
  }

  /**
   * 获取本地事件
   */
  private getLocalEvents(): any[] {
    try {
      const data = localStorage.getItem(`${this.STORAGE_KEY}_events`);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('获取本地事件失败:', error);
      return [];
    }
  }

  /**
   * 更新本地邀请缓存
   */
  private updateLocalInviteCache(relation: InviteRelation): void {
    try {
      const cache = this.getLocalInviteCache();
      cache[relation.id] = relation;
      localStorage.setItem(`${this.STORAGE_KEY}_relations`, JSON.stringify(cache));
    } catch (error) {
      console.error('更新本地邀请缓存失败:', error);
    }
  }

  /**
   * 获取本地邀请缓存
   */
  private getLocalInviteCache(): Record<string, InviteRelation> {
    try {
      const data = localStorage.getItem(`${this.STORAGE_KEY}_relations`);
      return data ? JSON.parse(data) : {};
    } catch (error) {
      console.error('获取本地邀请缓存失败:', error);
      return {};
    }
  }

  /**
   * 更新本地统计缓存
   */
  private updateLocalStatsCache(userId: string, stats: InviteStats): void {
    try {
      const cache = this.getLocalStatsCache();
      cache[userId] = stats;
      localStorage.setItem(`${this.STORAGE_KEY}_stats`, JSON.stringify(cache));
    } catch (error) {
      console.error('更新本地统计缓存失败:', error);
    }
  }

  /**
   * 获取本地统计缓存
   */
  private getLocalStatsCache(): Record<string, InviteStats> {
    try {
      const data = localStorage.getItem(`${this.STORAGE_KEY}_stats`);
      return data ? JSON.parse(data) : {};
    } catch (error) {
      console.error('获取本地统计缓存失败:', error);
      return {};
    }
  }

  /**
   * 获取本地邀请统计
   */
  private getLocalInviteStats(userId: string): InviteStats {
    const cache = this.getLocalStatsCache();
    return cache[userId] || {
      userId,
      linkClicks: 0,
      successfulRegistrations: 0,
      activatedUsers: 0,
      rewardsIssued: 0,
      totalRewardCount: 0,
      conversionRate: 0,
      lastUpdated: new Date().toISOString()
    };
  }

  /**
   * 获取本地邀请关系
   */
  private getLocalInviteRelations(userId: string): InviteRelation[] {
    const cache = this.getLocalInviteCache();
    return Object.values(cache).filter(
      relation => relation.inviterId === userId || relation.inviteeId === userId
    );
  }

  /**
   * 获取本地邀请关系（单个）
   */
  private getLocalInviteRelation(inviteeId: string): InviteRelation | null {
    const cache = this.getLocalInviteCache();
    return Object.values(cache).find(relation => relation.inviteeId === inviteeId) || null;
  }

  /**
   * 获取默认分析数据
   */
  private getDefaultAnalytics(period: 'daily' | 'weekly' | 'monthly'): InviteAnalytics {
    return {
      period,
      trends: [],
      conversionFunnel: {
        linkClicks: 0,
        registrations: 0,
        activations: 0,
        rewards: 0
      },
      topInviters: []
    };
  }

  /**
   * 添加到待同步队列
   */
  private addToPendingSync(action: string, data: any): void {
    const key = `${action}_${Date.now()}`;
    this.pendingSyncData.set(key, { action, data, timestamp: new Date().toISOString() });
  }

  /**
   * 启动自动同步
   */
  startAutoSync(): void {
    if (this.syncTimer) {
      clearInterval(this.syncTimer);
    }
    
    this.syncTimer = setInterval(() => {
      this.syncPendingData();
    }, this.SYNC_INTERVAL);
  }

  /**
   * 停止自动同步
   */
  stopAutoSync(): void {
    if (this.syncTimer) {
      clearInterval(this.syncTimer);
      this.syncTimer = null;
    }
  }

  /**
   * 同步待处理数据
   */
  private async syncPendingData(): Promise<void> {
    if (this.pendingSyncData.size === 0) {
      return;
    }
    
    const dataToSync = Array.from(this.pendingSyncData.entries());
    
    for (const [key, { action, data }] of dataToSync) {
      try {
        await request.post(`${this.API_ENDPOINT}/sync`, { action, data });
        this.pendingSyncData.delete(key);
      } catch (error) {
        console.warn(`同步数据失败 (${action}):`, error);
        // 保留在队列中，下次继续尝试
      }
    }
  }
}

// 创建单例实例
export const enhancedInviteService = new EnhancedInviteService();

export default enhancedInviteService;
