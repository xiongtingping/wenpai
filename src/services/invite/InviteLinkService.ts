/**
 * 邀请链接生成服务
 * @description 生成和管理邀请链接、邀请码
 */

import { getSupabaseClient } from '@/services/supabaseDataService';
import { logger } from '@/utils/logger';
import { UserIdValidator } from '@/utils/userIdValidator';
import { INVITE_LINK_CONFIG } from '@/config/inviteRewardConfig';

/**
 * 邀请链接接口
 */
export interface InviteLink {
  /** 邀请码 */
  code: string;
  /** 邀请链接 */
  link: string;
  /** 邀请人ID */
  inviterId: string;
  /** 创建时间 */
  createdAt: Date;
  /** 过期时间 */
  expiresAt?: Date | null;
  /** 使用次数 */
  usedCount: number;
  /** 最大使用次数 */
  maxUses: number;
}

/**
 * 邀请码验证结果接口
 */
export interface InviteCodeValidation {
  /** 是否有效 */
  valid: boolean;
  /** 邀请人ID */
  inviterId?: string;
  /** 错误信息 */
  error?: string;
  /** 错误代码 */
  errorCode?: 'INVALID_CODE' | 'EXPIRED' | 'MAX_USES_REACHED' | 'SELF_INVITE';
}

/**
 * 邀请链接生成服务类
 */
export class InviteLinkService {
  /**
   * 生成邀请链接
   */
  static async generateInviteLink(userId: string): Promise<InviteLink | null> {
    try {
      // 验证用户ID
      UserIdValidator.validate(userId, 'InviteLinkService.generateInviteLink');

      // 1. 生成唯一邀请码
      const inviteCode = await this.generateUniqueInviteCode();

      // 2. 计算过期时间
      const expiresAt = this.calculateExpiryDate();

      // 3. 保存到数据库
      const supabase = await getSupabaseClient();

      const { data, error } = await supabase
        .from('user_invite_codes')
        .insert({
          code: inviteCode,
          inviter_id: userId,
          expires_at: expiresAt?.toISOString() || null,
          max_uses: INVITE_LINK_CONFIG.maxUsesPerCode,
          used_count: 0,
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        logger.error('保存邀请码失败:', error);
        throw error;
      }

      // 4. 生成邀请链接
      const inviteLink: InviteLink = {
        code: inviteCode,
        link: this.buildInviteLink(inviteCode),
        inviterId: userId,
        createdAt: new Date(data.created_at),
        expiresAt: data.expires_at ? new Date(data.expires_at) : null,
        usedCount: data.used_count || 0,
        maxUses: data.max_uses || 0
      };

      logger.info('✅ 邀请链接生成成功', {
        userId: UserIdValidator.formatForLog(userId),
        code: inviteCode
      });

      return inviteLink;
    } catch (error) {
      logger.error('生成邀请链接异常:', error);
      return null;
    }
  }

  /**
   * 验证邀请码
   */
  static async validateInviteCode(
    inviteCode: string,
    inviteeId?: string
  ): Promise<InviteCodeValidation> {
    try {
      // 1. 查询邀请码
      const supabase = await getSupabaseClient();

      const { data: codeData, error } = await supabase
        .from('user_invite_codes')
        .select('*')
        .eq('code', inviteCode)
        .maybeSingle();

      if (error || !codeData) {
        return {
          valid: false,
          error: '邀请码不存在',
          errorCode: 'INVALID_CODE'
        };
      }

      // 2. 检查是否过期
      if (codeData.expires_at) {
        const expiryDate = new Date(codeData.expires_at);
        if (expiryDate < new Date()) {
          return {
            valid: false,
            error: '邀请码已过期',
            errorCode: 'EXPIRED'
          };
        }
      }

      // 3. 检查使用次数
      if (codeData.max_uses > 0 && codeData.used_count >= codeData.max_uses) {
        return {
          valid: false,
          error: '邀请码已达到最大使用次数',
          errorCode: 'MAX_USES_REACHED'
        };
      }

      // 4. 检查是否自我邀请
      if (inviteeId && codeData.inviter_id === inviteeId) {
        return {
          valid: false,
          error: '不能使用自己的邀请码',
          errorCode: 'SELF_INVITE'
        };
      }

      return {
        valid: true,
        inviterId: codeData.inviter_id
      };
    } catch (error) {
      logger.error('验证邀请码异常:', error);
      return {
        valid: false,
        error: error instanceof Error ? error.message : '未知错误',
        errorCode: 'INVALID_CODE'
      };
    }
  }

  /**
   * 使用邀请码（增加使用次数）
   */
  static async useInviteCode(inviteCode: string): Promise<boolean> {
    try {
      const supabase = await getSupabaseClient();

      // 增加使用次数
      const { error } = await supabase.rpc('increment_invite_code_usage', {
        p_code: inviteCode
      });

      if (error) {
        // 如果RPC函数不存在，使用普通更新
        const { data: codeData } = await supabase
          .from('user_invite_codes')
          .select('used_count')
          .eq('code', inviteCode)
          .single();

        if (codeData) {
          await supabase
            .from('user_invite_codes')
            .update({ used_count: (codeData.used_count || 0) + 1 })
            .eq('code', inviteCode);
        }
      }

      logger.info('✅ 邀请码使用次数已更新', { code: inviteCode });
      return true;
    } catch (error) {
      logger.error('更新邀请码使用次数失败:', error);
      return false;
    }
  }

  /**
   * 获取用户的邀请链接列表
   */
  static async getUserInviteLinks(userId: string): Promise<InviteLink[]> {
    try {
      UserIdValidator.validate(userId, 'InviteLinkService.getUserInviteLinks');

      const supabase = await getSupabaseClient();

      const { data, error } = await supabase
        .from('user_invite_codes')
        .select('*')
        .eq('inviter_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        logger.error('查询用户邀请链接失败:', error);
        throw error;
      }

      return (data || []).map(record => ({
        code: record.code,
        link: this.buildInviteLink(record.code),
        inviterId: record.inviter_id,
        createdAt: new Date(record.created_at),
        expiresAt: record.expires_at ? new Date(record.expires_at) : null,
        usedCount: record.used_count || 0,
        maxUses: record.max_uses || 0
      }));
    } catch (error) {
      logger.error('获取用户邀请链接异常:', error);
      return [];
    }
  }

  /**
   * 生成唯一邀请码
   */
  private static async generateUniqueInviteCode(): Promise<string> {
    const maxAttempts = 10;
    let attempts = 0;

    while (attempts < maxAttempts) {
      const code = this.generateRandomCode();
      
      // 检查是否已存在
      const exists = await this.checkCodeExists(code);
      
      if (!exists) {
        return code;
      }

      attempts++;
    }

    // 如果10次都失败，添加时间戳确保唯一性
    return this.generateRandomCode() + Date.now().toString(36).slice(-4);
  }

  /**
   * 生成随机邀请码
   */
  private static generateRandomCode(): string {
    const { codeLength, codeCharset } = INVITE_LINK_CONFIG;
    let code = '';

    for (let i = 0; i < codeLength; i++) {
      const randomIndex = Math.floor(Math.random() * codeCharset.length);
      code += codeCharset[randomIndex];
    }

    return code;
  }

  /**
   * 检查邀请码是否已存在
   */
  private static async checkCodeExists(code: string): Promise<boolean> {
    try {
      const supabase = await getSupabaseClient();

      const { data, error } = await supabase
        .from('user_invite_codes')
        .select('code')
        .eq('code', code)
        .maybeSingle();

      return !!data;
    } catch (error) {
      logger.warn('检查邀请码是否存在失败:', error);
      return false;
    }
  }

  /**
   * 计算过期时间
   */
  private static calculateExpiryDate(): Date | null {
    const { linkExpiryDays } = INVITE_LINK_CONFIG;

    if (linkExpiryDays === 0) {
      return null;  // 永久有效
    }

    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + linkExpiryDays);
    return expiryDate;
  }

  /**
   * 构建邀请链接
   */
  private static buildInviteLink(inviteCode: string): string {
    const { linkPrefix } = INVITE_LINK_CONFIG;
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
    return `${baseUrl}${linkPrefix}?code=${inviteCode}`;
  }
}

/**
 * 导出便捷函数
 */
export const generateInviteLink = InviteLinkService.generateInviteLink.bind(InviteLinkService);
export const validateInviteCode = InviteLinkService.validateInviteCode.bind(InviteLinkService);
export const useInviteCode = InviteLinkService.useInviteCode.bind(InviteLinkService);
export const getUserInviteLinks = InviteLinkService.getUserInviteLinks.bind(InviteLinkService);

