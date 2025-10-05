/**
 * 邀请验证服务 - 为邀请系统添加边界检查和验证
 */

import { supabase } from '@/config/supabase';
import { UserIdValidator } from '@/utils/userIdValidator';
import { logger } from '@/utils/logger';

export interface InviteValidationResult {
  valid: boolean;
  error?: string;
  errorCode?: string;
}

export interface InviteRelationData {
  inviter_id: string;
  invitee_id: string;
  invite_code?: string;
  status?: string;
  source?: string;
}

export class InviteValidationService {
  static async validateInviteRelation(
    inviterId: string,
    inviteeId: string
  ): Promise<InviteValidationResult> {
    const inviterValidation = UserIdValidator.validateDetailed(inviterId);
    if (!inviterValidation.valid) {
      return {
        valid: false,
        error: `邀请人ID无效: ${inviterValidation.error}`,
        errorCode: 'INVALID_INVITER_ID'
      };
    }

    const inviteeValidation = UserIdValidator.validateDetailed(inviteeId);
    if (!inviteeValidation.valid) {
      return {
        valid: false,
        error: `被邀请人ID无效: ${inviteeValidation.error}`,
        errorCode: 'INVALID_INVITEE_ID'
      };
    }

    if (UserIdValidator.isSame(inviterId, inviteeId)) {
      logger.warn('⚠️ 检测到自我邀请尝试', {
        inviterId: UserIdValidator.formatForLog(inviterId)
      });
      return {
        valid: false,
        error: '不能邀请自己',
        errorCode: 'SELF_INVITE'
      };
    }

    const existingRelation = await this.getExistingInviteRelation(inviteeId);
    if (existingRelation) {
      logger.warn('⚠️ 检测到重复邀请尝试', {
        inviterId: UserIdValidator.formatForLog(inviterId),
        inviteeId: UserIdValidator.formatForLog(inviteeId),
        existingInviterId: UserIdValidator.formatForLog(existingRelation.inviter_id)
      });
      return {
        valid: false,
        error: '该用户已被邀请',
        errorCode: 'ALREADY_INVITED'
      };
    }

    const reverseRelation = await this.getInviteRelationBetween(inviteeId, inviterId);
    if (reverseRelation) {
      logger.warn('⚠️ 检测到循环邀请尝试', {
        inviterId: UserIdValidator.formatForLog(inviterId),
        inviteeId: UserIdValidator.formatForLog(inviteeId)
      });
      return {
        valid: false,
        error: '不能邀请已经邀请过你的用户',
        errorCode: 'CIRCULAR_INVITE'
      };
    }

    return { valid: true };
  }

  private static async getExistingInviteRelation(
    inviteeId: string
  ): Promise<InviteRelationData | null> {
    try {
      const { data, error } = await supabase
        .from('user_invite_relations')
        .select('*')
        .eq('invitee_id', inviteeId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null;
        }
        logger.error('查询邀请关系失败:', error);
        return null;
      }

      return data;
    } catch (error) {
      logger.error('查询邀请关系异常:', error);
      return null;
    }
  }

  private static async getInviteRelationBetween(
    inviterId: string,
    inviteeId: string
  ): Promise<InviteRelationData | null> {
    try {
      const { data, error } = await supabase
        .from('user_invite_relations')
        .select('*')
        .eq('inviter_id', inviterId)
        .eq('invitee_id', inviteeId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null;
        }
        logger.error('查询邀请关系失败:', error);
        return null;
      }

      return data;
    } catch (error) {
      logger.error('查询邀请关系异常:', error);
      return null;
    }
  }

  static async createInviteRelation(
    inviterId: string,
    inviteeId: string,
    additionalData?: {
      invite_code?: string;
      source?: string;
    }
  ): Promise<{ success: boolean; data?: any; error?: string }> {
    const validation = await this.validateInviteRelation(inviterId, inviteeId);
    if (!validation.valid) {
      return {
        success: false,
        error: validation.error
      };
    }

    try {
      const { data, error } = await supabase
        .from('user_invite_relations')
        .insert({
          inviter_id: inviterId,
          invitee_id: inviteeId,
          invite_code: additionalData?.invite_code,
          source: additionalData?.source || 'link',
          status: 'completed',
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        logger.error('创建邀请关系失败:', error);
        return {
          success: false,
          error: '创建邀请关系失败'
        };
      }

      logger.info('✅ 邀请关系创建成功', {
        inviterId: UserIdValidator.formatForLog(inviterId),
        inviteeId: UserIdValidator.formatForLog(inviteeId)
      });

      return {
        success: true,
        data
      };
    } catch (error) {
      logger.error('创建邀请关系异常:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '未知错误'
      };
    }
  }

  static async getInviteStats(userId: string): Promise<{
    asInviter: number;
    asInvitee: number;
    total: number;
  }> {
    try {
      const { count: asInviter } = await supabase
        .from('user_invite_relations')
        .select('*', { count: 'exact', head: true })
        .eq('inviter_id', userId);

      const { count: asInvitee } = await supabase
        .from('user_invite_relations')
        .select('*', { count: 'exact', head: true })
        .eq('invitee_id', userId);

      return {
        asInviter: asInviter || 0,
        asInvitee: asInvitee || 0,
        total: (asInviter || 0) + (asInvitee || 0)
      };
    } catch (error) {
      logger.error('获取邀请统计失败:', error);
      return {
        asInviter: 0,
        asInvitee: 0,
        total: 0
      };
    }
  }
}
