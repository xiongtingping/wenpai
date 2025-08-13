/**
 * Supabase 客户端配置
 * 用于数据库操作和认证管理
 */

import { createClient } from '@supabase/supabase-js'

// 环境变量配置
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key'

// 创建Supabase客户端
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // 自动刷新token
    autoRefreshToken: true,
    // 持久化会话
    persistSession: true,
    // 检测会话变化
    detectSessionInUrl: true
  },
  // 全局配置
  global: {
    headers: {
      'X-Client-Info': 'wenpai-app'
    }
  }
})

// 数据库类型定义
export interface Database {
  public: {
    Tables: {
      user_profiles: {
        Row: {
          id: string  // 🔧 FIXED: 支持字符串类型用户ID
          nickname: string | null
          avatar_url: string | null
          tier: string
          permissions: any
          settings: any
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string  // 🔧 FIXED: 支持字符串类型用户ID
          nickname?: string | null
          avatar_url?: string | null
          tier?: string
          permissions?: any
          settings?: any
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string  // 🔧 FIXED: 支持字符串类型用户ID
          nickname?: string | null
          avatar_url?: string | null
          tier?: string
          permissions?: any
          settings?: any
          updated_at?: string
        }
      }
      brand_assets: {
        Row: {
          id: string
          user_id: string  // 🔧 FIXED: 支持字符串类型用户ID
          name: string
          type: string
          content: any
          metadata: any
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string  // 🔧 FIXED: 支持字符串类型用户ID
          name: string
          type: string
          content: any
          metadata?: any
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string  // 🔧 FIXED: 支持字符串类型用户ID
          name?: string
          type?: string
          content?: any
          metadata?: any
          updated_at?: string
        }
      }
      usage_stats: {
        Row: {
          id: string
          user_id: string  // 🔧 FIXED: 支持字符串类型用户ID
          feature: string
          tokens_used: number
          usage_count: number
          date: string
          metadata: any
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string  // 🔧 FIXED: 支持字符串类型用户ID
          feature: string
          tokens_used?: number
          usage_count?: number
          date?: string
          metadata?: any
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string  // 🔧 FIXED: 支持字符串类型用户ID
          feature?: string
          tokens_used?: number
          usage_count?: number
          date?: string
          metadata?: any
        }
      }
      user_preferences: {
        Row: {
          id: string
          user_id: string  // 🔧 FIXED: 支持字符串类型用户ID
          key: string
          value: any
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string  // 🔧 FIXED: 支持字符串类型用户ID
          key: string
          value: any
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string  // 🔧 FIXED: 支持字符串类型用户ID
          key?: string
          value?: any
          updated_at?: string
        }
      }
    }
  }
}

// 类型化的Supabase客户端
export type SupabaseClient = typeof supabase

// 导出默认客户端
export default supabase
