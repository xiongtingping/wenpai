/**
 * 增强邀请系统服务
 * @description 实现前后端邀请数据的实时同步、邀请效果统计和分析功能
 */

import i18n from '@/i18n';
import { request } from '@/api/request';
import { unifiedUsageService } from '@/services/unifiedUsageService';
import { createDataService, TABLE_NAMES } from '@/services/supabaseDataService';
import { logger } from '@/utils/logger';

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
  private readonly SYNC_INTERVAL = 2 * 60 * 1000; // 2分钟同步一次
  
  // Supabase表名常量 - 使用统一的TABLE_NAMES常量
  private readonly INVITE_RELATIONS_TABLE = TABLE_NAMES.USER_INVITE_RELATIONS;
  private readonly INVITE_STATS_TABLE = TABLE_NAMES.USER_INVITE_STATS;
  private readonly INVITE_EVENTS_TABLE = TABLE_NAMES.USER_INVITE_EVENTS;
  
  private syncTimer: NodeJS.Timeout | null = null;
  private pendingSyncData: Map<string, any> = new Map();

  /**
   * 邀请奖励配置
   */
  private readonly REWARD_CONFIG: InviteRewardConfig = {
    type: 'usage_count',
    amount: 20,
    description: '每邀请1人注册，双方各获20次AI内容适配使用机会',
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
      console.error('生成邀请链接失败:', error);
      
      // 🚨 API失败时必须抛出错误，不能使用本地生成
      throw new Error(`邀请链接生成API调用失败: ${error instanceof Error ? error.message : i18n.t('common.errors.未知错误')}`);
    }
  }

  /**
   * 跟踪邀请链接点击
   */
  async trackInviteLinkClick(inviterId: string, metadata?: Record<string, any>): Promise<void> {
    try {
      // 1. 立即记录到Supabase数据库
      await this.recordInviteEvent('link_click', { inviterId, metadata });
      
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
      console.error('跟踪邀请链接点击失败:', error);
      // 🚨 API失败时必须抛出错误，不能使用本地队列
      throw new Error(`邀请链接点击跟踪失败: ${error instanceof Error ? error.message : i18n.t('common.errors.未知错误')}`);
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
      
      // 更新Supabase数据库
      await this.saveInviteRelation(relation);
      
      return relation;
    } catch (error) {
      console.error('绑定邀请关系失败:', error);
      // 🚨 API失败时必须抛出错误，不能使用本地数据
      throw new Error(`绑定邀请关系失败: ${error instanceof Error ? error.message : i18n.t('common.errors.未知错误')}`);
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
        throw new Error(i18n.t('common.errors.邀请关系不存在或不匹配'));
      }
      
      if (relation.rewardProcessed) {
        console.warn('邀请奖励已发放过');
        return false;
      }
      
      // 2. 发放奖励
      const rewardSuccess = await this.issueReward(inviterId, inviteeId);
      if (!rewardSuccess) {
        throw new Error(i18n.t('common.errors.奖励发放失败'));
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
      // 🚨 奖励处理失败时必须抛出错误
      throw new Error(`处理邀请奖励失败: ${error instanceof Error ? error.message : i18n.t('common.errors.未知错误')}`);
    }
  }

  /**
   * 获取邀请统计
   */
  async getInviteStats(userId: string): Promise<InviteStats> {
    try {
      const response = await request.get(`${this.API_ENDPOINT}/stats/${userId}`);
      const stats: InviteStats = response.data;
      
      // 更新Supabase数据库
      await this.saveInviteStats(userId, stats);
      
      return stats;
    } catch (error) {
      console.error('获取邀请统计失败:', error);
      // 🚨 API失败时必须抛出错误，不能使用本地数据
      throw new Error(`获取邀请统计失败: ${error instanceof Error ? error.message : i18n.t('common.errors.未知错误')}`);
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
      console.error('获取邀请关系失败:', error);
      // 🚨 API失败时必须抛出错误，不能使用本地数据
      throw new Error(`获取邀请关系失败: ${error instanceof Error ? error.message : i18n.t('common.errors.未知错误')}`);
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
      console.error('获取邀请分析失败:', error);
      // 🚨 API失败时必须抛出错误，不能返回默认数据
      throw new Error(`获取邀请分析失败: ${error instanceof Error ? error.message : i18n.t('common.errors.未知错误')}`);
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
      // 🚨 必须调用真实的后端API增加使用次数
      await request.post('/api/usage/add', {
        userId,
        amount
      });
      console.log(`✅ 为用户 ${userId} 增加 ${amount} 次使用机会`);
      return true;
    } catch (error) {
      console.error('添加使用次数失败:', error);
      // 🚨 API失败时必须抛出错误，不能返回false掩盖问题
      throw new Error(`增加使用次数API调用失败: ${error instanceof Error ? error.message : i18n.t('common.errors.未知错误')}`);
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
      console.error('获取邀请关系失败:', error);
      // 🚨 API失败时必须抛出错误，不能使用本地关系数据
      throw new Error(`获取邀请关系API调用失败: ${error instanceof Error ? error.message : i18n.t('common.errors.未知错误')}`);
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
      console.error('更新邀请关系状态失败:', error);
      throw new Error(`更新邀请关系状态失败: ${error instanceof Error ? error.message : i18n.t('common.errors.未知错误')}`);
    }
  }

  /**
   * 记录邀请事件到Supabase数据库
   */
  private async recordInviteEvent(eventType: string, data: any): Promise<void> {
    try {
      const eventRecord = {
        type: eventType,
        data,
        timestamp: new Date().toISOString()
      };
      
      const dataService = createDataService(data.inviterId, this.INVITE_EVENTS_TABLE);
      await dataService.create(eventRecord);
      
      logger.debug('✅ 邀请事件记录成功:', { eventType, inviterId: data.inviterId });
    } catch (error) {
      console.error('记录邀请事件失败:', error);
      throw new Error(`邀请事件记录失败: ${error instanceof Error ? error.message : i18n.t('common.errors.未知错误')}`);
    }
  }

  /**
   * 保存邀请关系到Supabase数据库
   */
  private async saveInviteRelation(relation: InviteRelation): Promise<void> {
    try {
      const dataService = createDataService(relation.inviterId, this.INVITE_RELATIONS_TABLE);
      await dataService.create(relation);
      
      logger.debug('✅ 邀请关系保存成功:', { relationId: relation.id, inviterId: relation.inviterId });
    } catch (error) {
      console.error('保存邀请关系失败:', error);
      throw new Error(`保存邀请关系失败: ${error instanceof Error ? error.message : i18n.t('common.errors.未知错误')}`);
    }
  }

  /**
   * 保存邀请统计到Supabase数据库
   */
  private async saveInviteStats(userId: string, stats: InviteStats): Promise<void> {
    try {
      const dataService = createDataService(userId, this.INVITE_STATS_TABLE);
      await dataService.create(stats);
      
      logger.debug('✅ 邀请统计保存成功:', { userId });
    } catch (error) {
      console.error('保存邀请统计失败:', error);
      throw new Error(`保存邀请统计失败: ${error instanceof Error ? error.message : i18n.t('common.errors.未知错误')}`);
    }
  }

  /**
   * 已废弃：不再使用本地同步队列
   * 所有操作都直接调用Supabase数据库
   */
  private addToPendingSync(action: string, data: any): void {
    console.warn('addToPendingSync方法已废弃，不再使用本地同步队列');
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
