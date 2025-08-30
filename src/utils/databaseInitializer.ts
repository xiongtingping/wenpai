import { supabase } from '@/config/supabase'

// 数据库初始化工具类
export class DatabaseInitializer {
  private static async executeSQLFile(sqlContent: string): Promise<{ success: boolean; error?: string }> {
    try {
      // 将SQL内容按语句分割
      const statements = sqlContent
        .split(';')
        .map(stmt => stmt.trim())
        .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'))

      for (const statement of statements) {
        if (statement.trim()) {
          const { error } = await supabase.rpc('exec_sql', { sql: statement })
          if (error) {
            console.error('SQL execution error:', error)
            return { success: false, error: error.message }
          }
        }
      }

      return { success: true }
    } catch (error) {
      console.error('Database initialization error:', error)
      return { success: false, error: String(error) }
    }
  }

  // 检查表是否存在
  static async checkTableExists(tableName: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('information_schema.tables')
        .select('table_name')
        .eq('table_schema', 'public')
        .eq('table_name', tableName)
        .single()

      return !error && !!data
    } catch {
      return false
    }
  }

  // 检查所有必需的表是否存在
  static async checkAllTablesExist(): Promise<{ exists: boolean; missingTables: string[] }> {
    const requiredTables = [
      'user_profiles',
      'user_subscriptions',
      'token_usage_records',
      'usage_count_records',
      'user_invite_relations',
      'user_invite_stats',
      'user_invite_events',
      'user_files',
      'user_notes',
      'user_brand_corpus',
      'user_library_items',
      'user_chat_history'
    ]

    const missingTables: string[] = []

    for (const table of requiredTables) {
      const exists = await this.checkTableExists(table)
      if (!exists) {
        missingTables.push(table)
      }
    }

    return {
      exists: missingTables.length === 0,
      missingTables
    }
  }

  // 初始化数据库（创建所有表、索引、触发器等）
  static async initializeDatabase(): Promise<{ success: boolean; message: string }> {
    try {
      console.log('Starting database initialization...')

      // 检查是否已经初始化
      const { exists, missingTables } = await this.checkAllTablesExist()
      
      if (exists) {
        return { success: true, message: 'Database already initialized' }
      }

      console.log('Missing tables:', missingTables)

      // 这里需要手动执行SQL脚本，因为Supabase客户端不支持直接执行复杂SQL
      // 建议通过Supabase Dashboard的SQL编辑器执行初始化脚本
      
      return {
        success: false,
        message: 'Please execute the SQL scripts manually in Supabase Dashboard. Missing tables: ' + missingTables.join(', ')
      }

    } catch (error) {
      console.error('Database initialization failed:', error)
      return {
        success: false,
        message: `Database initialization failed: ${error}`
      }
    }
  }

  // 创建用户默认数据
  static async createUserDefaults(userId: string): Promise<{ success: boolean; message: string }> {
    try {
      // 创建用户配置文件
      const { error: profileError } = await supabase
        .from('user_profiles')
        .insert({
          user_id: userId,
          preferences: {},
          settings: {}
        })
        .select()
        .single()

      if (profileError && profileError.code !== '23505') { // 忽略重复键错误
        console.error('Error creating user profile:', profileError)
      }

      // 创建用户订阅
      const { error: subscriptionError } = await supabase
        .from('user_subscriptions')
        .insert({
          user_id: userId,
          tier: 'trial',
          monthly_token_limit: 100000,
          usage_count_limit: 10
        })
        .select()
        .single()

      if (subscriptionError && subscriptionError.code !== '23505') {
        console.error('Error creating user subscription:', subscriptionError)
      }

      // 创建邀请统计
      const { error: inviteStatsError } = await supabase
        .from('user_invite_stats')
        .insert({
          user_id: userId
        })
        .select()
        .single()

      if (inviteStatsError && inviteStatsError.code !== '23505') {
        console.error('Error creating invite stats:', inviteStatsError)
      }

      return { success: true, message: 'User defaults created successfully' }

    } catch (error) {
      console.error('Error creating user defaults:', error)
      return { success: false, message: `Failed to create user defaults: ${error}` }
    }
  }

  // 清理过期数据
  static async cleanupOldData(): Promise<{ success: boolean; message: string }> {
    try {
      const { error } = await supabase.rpc('cleanup_old_records')
      
      if (error) {
        console.error('Cleanup error:', error)
        return { success: false, message: `Cleanup failed: ${error.message}` }
      }

      return { success: true, message: 'Old data cleaned up successfully' }

    } catch (error) {
      console.error('Cleanup error:', error)
      return { success: false, message: `Cleanup failed: ${error}` }
    }
  }

  // 获取数据库统计信息
  static async getDatabaseStats(): Promise<{
    totalUsers: number
    totalTokenUsage: number
    totalInvites: number
    totalFiles: number
    totalNotes: number
  }> {
    try {
      const [
        { count: totalUsers },
        { count: totalTokenUsage },
        { count: totalInvites },
        { count: totalFiles },
        { count: totalNotes }
      ] = await Promise.all([
        supabase.from('user_profiles').select('*', { count: 'exact', head: true }),
        supabase.from('token_usage_records').select('*', { count: 'exact', head: true }),
        supabase.from('user_invite_relations').select('*', { count: 'exact', head: true }),
        supabase.from('user_files').select('*', { count: 'exact', head: true }),
        supabase.from('user_notes').select('*', { count: 'exact', head: true })
      ])

      return {
        totalUsers: totalUsers || 0,
        totalTokenUsage: totalTokenUsage || 0,
        totalInvites: totalInvites || 0,
        totalFiles: totalFiles || 0,
        totalNotes: totalNotes || 0
      }

    } catch (error) {
      console.error('Error fetching database stats:', error)
      return {
        totalUsers: 0,
        totalTokenUsage: 0,
        totalInvites: 0,
        totalFiles: 0,
        totalNotes: 0
      }
    }
  }

  // 验证数据库完整性
  static async validateDatabaseIntegrity(): Promise<{ valid: boolean; issues: string[] }> {
    const issues: string[] = []

    try {
      // 检查表结构
      const { exists, missingTables } = await this.checkAllTablesExist()
      if (!exists) {
        issues.push(`Missing tables: ${missingTables.join(', ')}`)
      }

      // 检查RLS策略
      const { data: policies, error: policiesError } = await supabase
        .from('pg_policies')
        .select('tablename, policyname')
        .in('tablename', [
          'user_profiles',
          'user_subscriptions',
          'token_usage_records',
          'usage_count_records'
        ])

      if (policiesError) {
        issues.push(`Cannot check RLS policies: ${policiesError.message}`)
      } else if (!policies || policies.length === 0) {
        issues.push('RLS policies may not be properly configured')
      }

      // 检查索引
      const { data: indexes, error: indexError } = await supabase
        .from('pg_indexes')
        .select('indexname')
        .like('indexname', 'idx_%')

      if (indexError) {
        issues.push(`Cannot check indexes: ${indexError.message}`)
      } else if (!indexes || indexes.length < 10) {
        issues.push('Some indexes may be missing')
      }

      return {
        valid: issues.length === 0,
        issues
      }

    } catch (error) {
      issues.push(`Validation error: ${error}`)
      return { valid: false, issues }
    }
  }
}
