import { useState, useEffect } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from '@/config/supabase'
import { DatabaseInitializer } from '@/utils/databaseInitializer'
import {
  UserProfileService,
  UserSubscriptionService,
  TokenUsageService,
  UsageCountService,
  InviteService
} from '@/services/supabaseService'
import type { UserProfile, UserSubscription } from '@/config/supabase'

// Supabase 认证和数据管理 Hook
export function useSupabase() {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [subscription, setSubscription] = useState<UserSubscription | null>(null)

  // 初始化认证状态
  useEffect(() => {
    // 获取当前会话
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // 监听认证状态变化
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session)
        setUser(session?.user ?? null)
        setLoading(false)

        // 用户登录时初始化数据
        if (event === 'SIGNED_IN' && session?.user) {
          await initializeUserData(session.user.id)
        }

        // 用户登出时清理数据
        if (event === 'SIGNED_OUT') {
          setProfile(null)
          setSubscription(null)
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  // 加载用户数据
  useEffect(() => {
    if (user) {
      loadUserData(user.id)
    }
  }, [user])

  // 初始化用户数据
  const initializeUserData = async (userId: string) => {
    try {
      // 创建用户默认数据
      await DatabaseInitializer.createUserDefaults(userId)
      
      // 加载用户数据
      await loadUserData(userId)
    } catch (error) {
      console.error('Error initializing user data:', error)
    }
  }

  // 加载用户数据
  const loadUserData = async (userId: string) => {
    try {
      // 并行加载用户资料和订阅信息
      const [userProfile, userSubscription] = await Promise.all([
        UserProfileService.getProfile(userId),
        UserSubscriptionService.getSubscription(userId)
      ])

      setProfile(userProfile)
      setSubscription(userSubscription)
    } catch (error) {
      console.error('Error loading user data:', error)
    }
  }

  // 登录
  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    
    if (error) throw error
    return data
  }

  // 注册
  const signUp = async (email: string, password: string, metadata?: Record<string, any>) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata
      }
    })
    
    if (error) throw error
    return data
  }

  // 登出
  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  }

  // 重置密码
  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email)
    if (error) throw error
  }

  // 更新用户资料
  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user) throw new Error('No user logged in')
    
    const updatedProfile = await UserProfileService.updateProfile(user.id, updates)
    if (updatedProfile) {
      setProfile(updatedProfile)
    }
    return updatedProfile
  }

  // 更新订阅信息
  const updateSubscription = async (updates: Partial<UserSubscription>) => {
    if (!user) throw new Error('No user logged in')
    
    const updatedSubscription = await UserSubscriptionService.updateSubscription(user.id, updates)
    if (updatedSubscription) {
      setSubscription(updatedSubscription)
    }
    return updatedSubscription
  }

  // 记录 Token 使用
  const recordTokenUsage = async (usage: {
    feature: string
    taskType?: string
    inputTokens: number
    outputTokens: number
    totalTokens: number
    model: string
    contentSummary?: string
    success?: boolean
    errorMessage?: string
  }) => {
    if (!user) throw new Error('No user logged in')
    
    return await TokenUsageService.recordUsage({
      id: `${user.id}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      user_id: user.id,
      ...usage,
      success: usage.success ?? true
    })
  }

  // 记录使用次数
  const recordUsageCount = async (feature: string, amount: number = 1) => {
    if (!user) throw new Error('No user logged in')
    
    return await UsageCountService.recordUsage({
      user_id: user.id,
      feature,
      amount
    })
  }

  // 检查 Token 限额
  const checkTokenLimit = async (estimatedTokens: number = 0) => {
    if (!user) return { allowed: false, monthly_limit: 0, monthly_used: 0, monthly_remaining: 0, usage_percentage: 0 }
    
    return await TokenUsageService.checkTokenLimit(user.id, estimatedTokens)
  }

  // 获取月度使用统计
  const getMonthlyUsage = async (month?: Date) => {
    if (!user) return { total_tokens: 0, input_tokens: 0, output_tokens: 0, request_count: 0, feature_count: 0 }
    
    return await TokenUsageService.getUserMonthlyUsage(user.id, month)
  }

  // 获取使用次数统计
  const getUsageCount = async () => {
    if (!user) return { total_used: 0, monthly_used: 0, daily_used: 0 }
    
    return await UsageCountService.getUserUsageCount(user.id)
  }

  // 获取邀请统计
  const getInviteStats = async () => {
    if (!user) return null
    
    return await InviteService.getInviteStats(user.id)
  }

  // 获取使用历史
  const getUsageHistory = async (limit: number = 100) => {
    if (!user) return []
    
    return await TokenUsageService.getUsageHistory(user.id, limit)
  }

  return {
    // 认证状态
    user,
    session,
    loading,
    profile,
    subscription,
    
    // 认证方法
    signIn,
    signUp,
    signOut,
    resetPassword,
    
    // 数据管理
    updateProfile,
    updateSubscription,
    loadUserData,
    
    // 使用统计
    recordTokenUsage,
    recordUsageCount,
    checkTokenLimit,
    getMonthlyUsage,
    getUsageCount,
    getUsageHistory,
    getInviteStats,
    
    // 工具方法
    isAuthenticated: !!user,
    isLoading: loading,
    userId: user?.id || null,
    userEmail: user?.email || null
  }
}

// 数据库管理 Hook
export function useDatabase() {
  const [initialized, setInitialized] = useState<boolean | null>(null)
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalTokenUsage: 0,
    totalInvites: 0,
    totalFiles: 0,
    totalNotes: 0
  })

  // 检查数据库状态
  const checkDatabaseStatus = async () => {
    try {
      const { exists } = await DatabaseInitializer.checkAllTablesExist()
      setInitialized(exists)
      return exists
    } catch (error) {
      console.error('Error checking database status:', error)
      setInitialized(false)
      return false
    }
  }

  // 初始化数据库
  const initializeDatabase = async () => {
    try {
      const result = await DatabaseInitializer.initializeDatabase()
      if (result.success) {
        setInitialized(true)
      }
      return result
    } catch (error) {
      console.error('Error initializing database:', error)
      return { success: false, message: String(error) }
    }
  }

  // 获取数据库统计
  const getDatabaseStats = async () => {
    try {
      const newStats = await DatabaseInitializer.getDatabaseStats()
      setStats(newStats)
      return newStats
    } catch (error) {
      console.error('Error fetching database stats:', error)
      return stats
    }
  }

  // 清理过期数据
  const cleanupOldData = async () => {
    return await DatabaseInitializer.cleanupOldData()
  }

  // 验证数据库完整性
  const validateDatabase = async () => {
    return await DatabaseInitializer.validateDatabaseIntegrity()
  }

  // 初始化时检查数据库状态
  useEffect(() => {
    checkDatabaseStatus()
    getDatabaseStats()
  }, [])

  return {
    initialized,
    stats,
    checkDatabaseStatus,
    initializeDatabase,
    getDatabaseStats,
    cleanupOldData,
    validateDatabase
  }
}
