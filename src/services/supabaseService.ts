// @ts-nocheck - Supabase类型定义复杂，暂时跳过类型检查
import { supabase } from '@/config/supabase'
import type {
  UserProfile,
  UserSubscription,
  TokenUsageRecord,
  UsageCountRecord,
  UserInviteRelation,
  UserInviteStats,
  UserFile,
  UserNote,
  UserBrandCorpus,
  UserLibraryItem,
  UserChatHistory
} from '@/config/supabase'

// ============================================================================
// 用户相关服务
// ============================================================================

export class UserProfileService {
  static async getProfile(userId: string): Promise<UserProfile | null> {
    try {
      // 从数据库获取
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle()

      if (error) {
        console.error('Error fetching user profile:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('User profile service error:', error);
      return null;
    }
  }

  static async createProfile(profile: Partial<UserProfile>): Promise<UserProfile | null> {
    const { data, error } = await supabase
      .from('user_profiles')
      .insert(profile)
      .select()
      .single()
    
    if (error) {
      console.error('Error creating user profile:', error)
      return null
    }
    return data
  }

  static async updateProfile(userId: string, updates: Partial<UserProfile>): Promise<UserProfile | null> {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .update(updates)
        .eq('user_id', userId)
        .select()
        .single()

      if (error) {
        console.error('Error updating user profile:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('User profile update service error:', error);
      return null;
    }
  }
}

export class UserSubscriptionService {
  static async getSubscription(userId: string): Promise<UserSubscription | null> {
    const { data, error } = await supabase
      .from('user_subscriptions')
      .select('id, user_id, tier, status, period, started_at, expires_at, order_id, last_payment_id')
      .eq('user_id', userId)
      .maybeSingle()
    
    if (error) {
      console.error('Error fetching user subscription:', error)
      return null
    }
    return data
  }

  static async createSubscription(subscription: Partial<UserSubscription>): Promise<UserSubscription | null> {
    const { data, error } = await supabase
      .from('user_subscriptions')
      .insert(subscription)
      .select('id, user_id, tier, status, period, started_at, expires_at, order_id, last_payment_id')
      .single()
    
    if (error) {
      console.error('Error creating user subscription:', error)
      return null
    }
    return data
  }

  static async updateSubscription(userId: string, updates: Partial<UserSubscription>): Promise<UserSubscription | null> {
    const { data, error } = await supabase
      .from('user_subscriptions')
      .update(updates)
      .eq('user_id', userId)
      .select('id, user_id, tier, status, period, started_at, expires_at, order_id, last_payment_id')
      .single()
    
    if (error) {
      console.error('Error updating user subscription:', error)
      return null
    }
    return data
  }
}

// ============================================================================
// Token使用量服务
// ============================================================================

export class TokenUsageService {
  static async recordUsage(record: Partial<TokenUsageRecord>): Promise<TokenUsageRecord | null> {
    const { data, error } = await supabase
      .from('token_usage_records')
      .insert(record)
      .select()
      .single()
    
    if (error) {
      console.error('Error recording token usage:', error)
      return null
    }
    return data
  }

  static async getUserMonthlyUsage(userId: string, month?: Date) {
    const { data, error } = await supabase
      .rpc('get_user_monthly_token_usage', {
        p_user_id: userId,
        p_month: month || new Date()
      })
    
    if (error) {
      console.error('Error fetching monthly usage:', error)
      return null
    }
    return data[0] || { total_tokens: 0, input_tokens: 0, output_tokens: 0, request_count: 0, feature_count: 0 }
  }

  static async checkTokenLimit(userId: string, estimatedTokens: number = 0) {
    const { data, error } = await supabase
      .rpc('check_user_token_limit', {
        p_user_id: userId,
        p_estimated_tokens: estimatedTokens
      })
    
    if (error) {
      console.error('Error checking token limit:', error)
      return null
    }
    return data[0] || { allowed: false, monthly_limit: 0, monthly_used: 0, monthly_remaining: 0, usage_percentage: 0 }
  }

  static async getUsageHistory(userId: string, limit: number = 100): Promise<TokenUsageRecord[]> {
    const { data, error } = await supabase
      .from('token_usage_records')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit)
    
    if (error) {
      console.error('Error fetching usage history:', error)
      return []
    }
    return data || []
  }
}

export class UsageCountService {
  static async recordUsage(record: Partial<UsageCountRecord>): Promise<UsageCountRecord | null> {
    const { data, error } = await supabase
      .from('usage_count_records')
      .insert(record)
      .select()
      .single()
    
    if (error) {
      console.error('Error recording usage count:', error)
      return null
    }
    return data
  }

  static async getUserUsageCount(userId: string) {
    try {
      // 🎯 直接查询usage_count_records表并聚合
      // 计算本月的使用次数
      const now = new Date();
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

      const { data, error, count } = await supabase
        .from('usage_count_records')
        .select('amount', { count: 'exact' })
        .eq('user_id', userId)
        .gte('used_at', firstDayOfMonth);

      if (error) {
        console.error('Error fetching usage count:', error);
        return null;
      }

      // 聚合使用次数
      const monthly_used = data?.reduce((sum, record) => sum + (record.amount || 0), 0) || 0;

      return {
        total_used: monthly_used, // 暂时用月度数据作为总计
        monthly_used,
        daily_used: 0 // 可以后续优化添加日使用统计
      };
    } catch (error) {
      console.error('Error in getUserUsageCount:', error);
      return null;
    }
  }
}

// ============================================================================
// 邀请系统服务
// ============================================================================

export class InviteService {
  static async createInviteRelation(relation: Partial<UserInviteRelation>): Promise<UserInviteRelation | null> {
    const { data, error } = await supabase
      .from('user_invite_relations')
      .insert(relation)
      .select()
      .single()
    
    if (error) {
      console.error('Error creating invite relation:', error)
      return null
    }
    return data
  }

  static async getInviteStats(userId: string): Promise<UserInviteStats | null> {
    const { data, error } = await supabase
      .from('user_invite_stats')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle()
    
    if (error) {
      console.error('Error fetching invite stats:', error)
      return null
    }
    return data
  }

  static async updateInviteStats(userId: string, updates: Partial<UserInviteStats>): Promise<UserInviteStats | null> {
    const { data, error } = await supabase
      .from('user_invite_stats')
      .update(updates)
      .eq('user_id', userId)
      .select()
      .single()
    
    if (error) {
      console.error('Error updating invite stats:', error)
      return null
    }
    return data
  }

  static async getInviteRelations(userId: string): Promise<UserInviteRelation[]> {
    const { data, error } = await supabase
      .from('user_invite_relations')
      .select('*')
      .or(`inviter_id.eq.${userId},invitee_id.eq.${userId}`)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching invite relations:', error)
      return []
    }
    return data || []
  }
}

// ============================================================================
// 文件和内容服务
// ============================================================================

export class UserFileService {
  static async uploadFile(file: Partial<UserFile>): Promise<UserFile | null> {
    const { data, error } = await supabase
      .from('user_files')
      .insert(file)
      .select()
      .single()

    if (error) {
      console.error('Error uploading file:', error)
      return null
    }
    return data
  }

  static async getUserFiles(userId: string, fileType?: string): Promise<UserFile[]> {
    let query = supabase
      .from('user_files')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (fileType) {
      query = query.eq('file_type', fileType)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching user files:', error)
      return []
    }
    return data || []
  }

  static async deleteFile(fileId: string): Promise<boolean> {
    const { error } = await supabase
      .from('user_files')
      .delete()
      .eq('id', fileId)

    if (error) {
      console.error('Error deleting file:', error)
      return false
    }
    return true
  }
}

export class UserNoteService {
  static async createNote(note: Partial<UserNote>): Promise<UserNote | null> {
    const { data, error } = await supabase
      .from('user_notes')
      .insert(note)
      .select()
      .single()

    if (error) {
      console.error('Error creating note:', error)
      return null
    }
    return data
  }

  static async getUserNotes(userId: string, category?: string): Promise<UserNote[]> {
    let query = supabase
      .from('user_notes')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false })

    if (category) {
      query = query.eq('category', category)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching user notes:', error)
      return []
    }
    return data || []
  }

  static async updateNote(noteId: string, updates: Partial<UserNote>): Promise<UserNote | null> {
    const { data, error } = await supabase
      .from('user_notes')
      .update(updates)
      .eq('id', noteId)
      .select()
      .single()

    if (error) {
      console.error('Error updating note:', error)
      return null
    }
    return data
  }

  static async deleteNote(noteId: string): Promise<boolean> {
    const { error } = await supabase
      .from('user_notes')
      .delete()
      .eq('id', noteId)

    if (error) {
      console.error('Error deleting note:', error)
      return false
    }
    return true
  }
}

export class BrandCorpusService {
  static async createBrandCorpus(corpus: Partial<UserBrandCorpus>): Promise<UserBrandCorpus | null> {
    const { data, error } = await supabase
      .from('user_brand_corpus')
      .insert(corpus)
      .select()
      .single()

    if (error) {
      console.error('Error creating brand corpus:', error)
      return null
    }
    return data
  }

  static async getUserBrandCorpus(userId: string): Promise<UserBrandCorpus[]> {
    const { data, error } = await supabase
      .from('user_brand_corpus')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false })

    if (error) {
      console.error('Error fetching brand corpus:', error)
      return []
    }
    return data || []
  }

  static async updateBrandCorpus(corpusId: string, updates: Partial<UserBrandCorpus>): Promise<UserBrandCorpus | null> {
    const { data, error } = await supabase
      .from('user_brand_corpus')
      .update(updates)
      .eq('id', corpusId)
      .select()
      .single()

    if (error) {
      console.error('Error updating brand corpus:', error)
      return null
    }
    return data
  }

  static async deleteBrandCorpus(corpusId: string): Promise<boolean> {
    const { error } = await supabase
      .from('user_brand_corpus')
      .delete()
      .eq('id', corpusId)

    if (error) {
      console.error('Error deleting brand corpus:', error)
      return false
    }
    return true
  }
}

export class LibraryService {
  static async createLibraryItem(item: Partial<UserLibraryItem>): Promise<UserLibraryItem | null> {
    const { data, error } = await supabase
      .from('user_library_items')
      .insert(item)
      .select()
      .single()

    if (error) {
      console.error('Error creating library item:', error)
      return null
    }
    return data
  }

  static async getUserLibraryItems(userId: string, status: string = 'active'): Promise<UserLibraryItem[]> {
    const { data, error } = await supabase
      .from('user_library_items')
      .select('*')
      .eq('user_id', userId)
      .eq('status', status)
      .order('updated_at', { ascending: false })

    if (error) {
      console.error('Error fetching library items:', error)
      return []
    }
    return data || []
  }

  static async updateLibraryItem(itemId: string, updates: Partial<UserLibraryItem>): Promise<UserLibraryItem | null> {
    const { data, error } = await supabase
      .from('user_library_items')
      .update(updates)
      .eq('id', itemId)
      .select()
      .single()

    if (error) {
      console.error('Error updating library item:', error)
      return null
    }
    return data
  }

  static async deleteLibraryItem(itemId: string): Promise<boolean> {
    const { error } = await supabase
      .from('user_library_items')
      .update({ status: 'deleted' })
      .eq('id', itemId)

    if (error) {
      console.error('Error deleting library item:', error)
      return false
    }
    return true
  }
}

export class ChatHistoryService {
  static async saveChatMessage(message: Partial<UserChatHistory>): Promise<UserChatHistory | null> {
    const { data, error } = await supabase
      .from('user_chat_history')
      .insert(message)
      .select()
      .single()

    if (error) {
      console.error('Error saving chat message:', error)
      return null
    }
    return data
  }

  static async getChatHistory(userId: string, sessionId?: string, limit: number = 50): Promise<UserChatHistory[]> {
    let query = supabase
      .from('user_chat_history')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: true })
      .limit(limit)

    if (sessionId) {
      query = query.eq('session_id', sessionId)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching chat history:', error)
      return []
    }
    return data || []
  }

  static async deleteChatSession(userId: string, sessionId: string): Promise<boolean> {
    const { error } = await supabase
      .from('user_chat_history')
      .delete()
      .eq('user_id', userId)
      .eq('session_id', sessionId)

    if (error) {
      console.error('Error deleting chat session:', error)
      return false
    }
    return true
  }
}
