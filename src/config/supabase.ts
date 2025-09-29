import { createClient } from '@supabase/supabase-js'

// 🔧 TDZ FIX: 使用函数创建客户端，避免模块级别的初始化顺序问题
function getSupabaseConfiguration() {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL ||
                     process.env.VITE_SUPABASE_URL ||
                     (globalThis as any).__ENV__?.VITE_SUPABASE_URL

  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY ||
                         process.env.VITE_SUPABASE_ANON_KEY ||
                         (globalThis as any).__ENV__?.VITE_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Supabase configuration:', { supabaseUrl, supabaseAnonKey: supabaseAnonKey ? '[HIDDEN]' : 'MISSING' })
    throw new Error('Missing Supabase environment variables. Please check VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY')
  }

  return { supabaseUrl, supabaseAnonKey }
}

// 🔧 TDZ FIX: 延迟创建Supabase客户端，避免TDZ错误
let supabaseClientInstance: ReturnType<typeof createClient> | null = null

function getSupabaseClient() {
  if (!supabaseClientInstance) {
    const { supabaseUrl, supabaseAnonKey } = getSupabaseConfiguration()
    supabaseClientInstance = createClient(supabaseUrl, supabaseAnonKey, {
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
  }
  return supabaseClientInstance
}

// 🔧 TDZ FIX: 导出延迟创建的客户端实例
export const supabase = new Proxy({} as ReturnType<typeof createClient>, {
  get(target, prop) {
    const client = getSupabaseClient()
    return client[prop as keyof typeof client]
  }
})

// 数据库类型定义
// 注意：user_id 现在是 VARCHAR(100) 类型，兼容 Authing 用户 ID 格式
export interface UserProfile {
  id: string
  user_id: string // VARCHAR(100) - 兼容 Authing 用户 ID
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
  user_id: string // VARCHAR(100) - 兼容 Authing 用户 ID
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
  user_id: string // VARCHAR(100) - 兼容 Authing 用户 ID
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
  user_id: string // VARCHAR(100) - 兼容 Authing 用户 ID
  feature: string
  amount: number
  used_at: string
  created_at: string
}

export interface UserInviteRelation {
  id: string
  inviter_id: string // VARCHAR(100) - 兼容 Authing 用户 ID
  invitee_id: string // VARCHAR(100) - 兼容 Authing 用户 ID
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
  user_id: string // VARCHAR(100) - 兼容 Authing 用户 ID
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
  user_id: string // VARCHAR(100) - 兼容 Authing 用户 ID
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
  user_id: string // VARCHAR(100) - 兼容 Authing 用户 ID
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
  user_id: string // VARCHAR(100) - 兼容 Authing 用户 ID
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
  user_id: string // VARCHAR(100) - 兼容 Authing 用户 ID
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
  user_id: string // VARCHAR(100) - 兼容 Authing 用户 ID
  session_id?: string
  role: 'user' | 'assistant' | 'system'
  content: string
  model?: string
  tokens_used?: number
  metadata: Record<string, any>
  created_at: string
}

// 数据库操作辅助函数
export const getSupabaseConfig = () => {
  const { supabaseUrl, supabaseAnonKey } = getSupabaseConfiguration()
  return {
    url: supabaseUrl,
    anonKey: supabaseAnonKey
  }
}

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
