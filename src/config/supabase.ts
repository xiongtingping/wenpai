import { createClient } from '@supabase/supabase-js'

// Supabase 配置
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || process.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY')
}

// 创建 Supabase 客户端
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
})

// 数据库类型定义
export interface UserProfile {
  id: string
  user_id: string
  nickname?: string
  avatar_url?: string
  phone?: string
  email?: string
  bio?: string
  preferences: Record<string, any>
  settings: Record<string, any>
  created_at: string
  updated_at: string
}

export interface UserSubscription {
  id: string
  user_id: string
  tier: 'trial' | 'pro' | 'premium'
  monthly_token_limit: number
  usage_count_limit: number
  start_date: string
  end_date?: string
  auto_renew: boolean
  payment_status: string
  created_at: string
  updated_at: string
}

export interface TokenUsageRecord {
  id: string
  user_id: string
  feature: string
  task_type?: string
  input_tokens: number
  output_tokens: number
  total_tokens: number
  model: string
  content_summary?: string
  success: boolean
  error_message?: string
  timestamp: string
  created_at: string
  updated_at: string
}

export interface UsageCountRecord {
  id: string
  user_id: string
  feature: string
  amount: number
  used_at: string
  created_at: string
}

export interface UserInviteRelation {
  id: string
  inviter_id: string
  invitee_id: string
  invite_code?: string
  status: 'pending' | 'completed' | 'rewarded'
  source: 'link' | 'code' | 'direct'
  metadata: Record<string, any>
  rewarded_at?: string
  created_at: string
  updated_at: string
}

export interface UserInviteStats {
  id: string
  user_id: string
  total_invites: number
  successful_invites: number
  link_clicks: number
  rewards_issued: number
  total_reward_count: number
  conversion_rate: number
  created_at: string
  updated_at: string
}

export interface UserFile {
  id: string
  user_id: string
  filename: string
  file_path: string
  file_size?: number
  mime_type?: string
  file_type: string
  metadata: Record<string, any>
  created_at: string
  updated_at: string
}

export interface UserNote {
  id: string
  user_id: string
  title?: string
  content?: string
  category?: string
  tags?: string[]
  is_private: boolean
  metadata: Record<string, any>
  created_at: string
  updated_at: string
}

export interface UserBrandCorpus {
  id: string
  user_id: string
  brand_name: string
  brand_description?: string
  tone_keywords?: string[]
  style_guide?: string
  content_samples?: string[]
  metadata: Record<string, any>
  created_at: string
  updated_at: string
}

export interface UserLibraryItem {
  id: string
  user_id: string
  title: string
  url?: string
  content?: string
  category?: string
  tags?: string[]
  status: 'active' | 'archived' | 'deleted'
  metadata: Record<string, any>
  created_at: string
  updated_at: string
}

export interface UserChatHistory {
  id: string
  user_id: string
  session_id?: string
  role: 'user' | 'assistant' | 'system'
  content: string
  model?: string
  tokens_used?: number
  metadata: Record<string, any>
  created_at: string
}

// 数据库操作辅助函数
export const getSupabaseConfig = () => ({
  url: supabaseUrl,
  anonKey: supabaseAnonKey
})

// 检查数据库连接
export const checkDatabaseConnection = async () => {
  try {
    const { data, error } = await supabase.from('user_profiles').select('count').limit(1)
    if (error) throw error
    return { success: true, message: 'Database connection successful' }
  } catch (error) {
    return { success: false, message: `Database connection failed: ${error}` }
  }
}

// 获取当前用户
export const getCurrentUser = async () => {
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error) throw error
  return user
}

// 用户认证状态监听
export const onAuthStateChange = (callback: (event: string, session: any) => void) => {
  return supabase.auth.onAuthStateChange(callback)
}

export default supabase
