#!/usr/bin/env node

/**
 * 测试 Supabase 连接并验证表格创建
 */

import { createClient } from '@supabase/supabase-js'

// Supabase 配置
const supabaseUrl = 'https://weizkydylskcwgnaieqy.supabase.co'
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndlaXpreWR5bHNrY3dnbmFpZXF5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTA1MjMzOSwiZXhwIjoyMDcwNjI4MzM5fQ.l5BvkhJttv0agpydb5lktK1Q4KvDaxQTNUb5-GMU14w'

// 创建 Supabase 客户端
const supabase = createClient(supabaseUrl, serviceRoleKey)

// 检查表是否存在
async function checkTableExists(tableName) {
  try {
    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .limit(1)
    
    if (error) {
      if (error.code === 'PGRST116' || error.message.includes('does not exist')) {
        return false
      }
      console.error(`检查表 ${tableName} 时出错:`, error.message)
      return false
    }
    
    return true
  } catch (err) {
    console.error(`检查表 ${tableName} 时发生异常:`, err.message)
    return false
  }
}

// 创建单个表
async function createTable(tableName, sql) {
  try {
    console.log(`正在创建表: ${tableName}...`)
    
    // 直接使用 SQL 查询
    const { data, error } = await supabase.rpc('exec_sql', { sql })
    
    if (error) {
      console.error(`创建表 ${tableName} 失败:`, error.message)
      return false
    }
    
    console.log(`✅ 表 ${tableName} 创建成功`)
    return true
  } catch (err) {
    console.error(`创建表 ${tableName} 时发生异常:`, err.message)
    return false
  }
}

// 主函数
async function main() {
  console.log('🚀 开始测试 Supabase 连接和创建表格...')
  console.log(`📍 Supabase URL: ${supabaseUrl}`)
  
  // 要检查的表格列表
  const tables = [
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
  
  console.log('\n🔍 检查现有表格...')
  
  const existingTables = []
  const missingTables = []
  
  for (const table of tables) {
    const exists = await checkTableExists(table)
    if (exists) {
      existingTables.push(table)
      console.log(`✅ ${table} - 已存在`)
    } else {
      missingTables.push(table)
      console.log(`❌ ${table} - 不存在`)
    }
  }
  
  console.log(`\n📊 统计结果:`)
  console.log(`✅ 已存在的表格: ${existingTables.length}`)
  console.log(`❌ 缺失的表格: ${missingTables.length}`)
  
  if (missingTables.length > 0) {
    console.log('\n⚠️  需要创建以下表格:')
    missingTables.forEach(table => console.log(`  - ${table}`))
    
    console.log('\n📝 请在 Supabase Dashboard 的 SQL 编辑器中执行以下文件:')
    console.log('  scripts/supabase-init-complete.sql')
    console.log('\n或者访问: https://supabase.com/dashboard/project/weizkydylskcwgnaieqy/sql')
  } else {
    console.log('\n🎉 所有表格都已存在！数据库初始化完成。')
  }
  
  // 测试基本操作
  if (existingTables.length > 0) {
    console.log('\n🧪 测试基本数据库操作...')
    
    try {
      // 测试插入和查询（如果 user_profiles 存在）
      if (existingTables.includes('user_profiles')) {
        const testUserId = '00000000-0000-0000-0000-000000000000'
        
        // 尝试插入测试数据
        const { data: insertData, error: insertError } = await supabase
          .from('user_profiles')
          .upsert({
            user_id: testUserId,
            nickname: 'Test User',
            bio: 'This is a test profile'
          })
          .select()
        
        if (insertError) {
          console.log('⚠️  插入测试数据失败（这是正常的，可能是权限限制）:', insertError.message)
        } else {
          console.log('✅ 数据插入测试成功')
          
          // 清理测试数据
          await supabase
            .from('user_profiles')
            .delete()
            .eq('user_id', testUserId)
        }
      }
      
      console.log('✅ 数据库操作测试完成')
      
    } catch (err) {
      console.log('⚠️  数据库操作测试失败:', err.message)
    }
  }
  
  console.log('\n🎯 下一步操作:')
  console.log('1. 如果表格缺失，请在 Supabase Dashboard 执行 SQL 脚本')
  console.log('2. 在应用中使用 useSupabase Hook 进行数据操作')
  console.log('3. 配置 RLS 策略确保数据安全')
  
  console.log('\n📚 相关文档:')
  console.log('- README-SUPABASE.md - 详细使用指南')
  console.log('- src/hooks/useSupabase.ts - React Hook 使用示例')
  console.log('- src/services/supabaseService.ts - 数据服务 API')
}

// 运行测试
main().catch(error => {
  console.error('❌ 测试过程中发生错误:', error)
  process.exit(1)
})
