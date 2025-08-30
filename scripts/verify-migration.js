#!/usr/bin/env node

/**
 * 验证数据库迁移结果
 * 检查所有 user_id 列是否已正确更改为 VARCHAR(100)
 */

import { createClient } from '@supabase/supabase-js'

// Supabase 配置
const supabaseUrl = 'https://weizkydylskcwgnaieqy.supabase.co'
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndlaXpreWR5bHNrY3dnbmFpZXF5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTA1MjMzOSwiZXhwIjoyMDcwNjI4MzM5fQ.l5BvkhJttv0agpydb5lktK1Q4KvDaxQTNUb5-GMU14w'

// 创建 Supabase 客户端
const supabase = createClient(supabaseUrl, serviceRoleKey)

// 需要检查的表和列
const tablesToCheck = [
  { table: 'user_profiles', column: 'user_id' },
  { table: 'user_subscriptions', column: 'user_id' },
  { table: 'token_usage_records', column: 'user_id' },
  { table: 'usage_count_records', column: 'user_id' },
  { table: 'user_invite_relations', column: 'inviter_id' },
  { table: 'user_invite_relations', column: 'invitee_id' },
  { table: 'user_invite_stats', column: 'user_id' },
  { table: 'user_files', column: 'user_id' },
  { table: 'user_notes', column: 'user_id' },
  { table: 'user_brand_corpus', column: 'user_id' },
  { table: 'user_library_items', column: 'user_id' },
  { table: 'user_chat_history', column: 'user_id' }
]

// 检查列类型
async function checkColumnType(tableName, columnName) {
  try {
    const { data, error } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type, character_maximum_length')
      .eq('table_name', tableName)
      .eq('column_name', columnName)
    
    if (error) {
      return { success: false, error: error.message }
    }
    
    if (!data || data.length === 0) {
      return { success: false, error: 'Column not found' }
    }
    
    const column = data[0]
    return {
      success: true,
      dataType: column.data_type,
      maxLength: column.character_maximum_length,
      isCorrect: column.data_type === 'character varying' && column.character_maximum_length === 100
    }
  } catch (err) {
    return { success: false, error: err.message }
  }
}

// 测试插入 Authing 格式的用户 ID
async function testAuthingUserId() {
  const testUserId = 'authing_test_user_12345'
  
  try {
    // 尝试插入测试数据
    const { data, error } = await supabase
      .from('user_profiles')
      .insert({
        user_id: testUserId,
        nickname: 'Test User',
        bio: 'Migration test user'
      })
      .select()
    
    if (error) {
      return { success: false, error: error.message }
    }
    
    // 清理测试数据
    await supabase
      .from('user_profiles')
      .delete()
      .eq('user_id', testUserId)
    
    return { success: true, message: 'Authing user ID format test passed' }
  } catch (err) {
    return { success: false, error: err.message }
  }
}

// 主函数
async function main() {
  console.log('🔍 验证数据库迁移结果...\n')

  let allPassed = true
  
  // 检查所有表的列类型
  console.log('📋 检查列类型:')
  for (const { table, column } of tablesToCheck) {
    const result = await checkColumnType(table, column)
    
    if (result.success) {
      if (result.isCorrect) {
        console.log(`  ✅ ${table}.${column}: ${result.dataType}(${result.maxLength})`)
      } else {
        console.log(`  ❌ ${table}.${column}: ${result.dataType}(${result.maxLength}) - 应该是 character varying(100)`)
        allPassed = false
      }
    } else {
      console.log(`  ❌ ${table}.${column}: 检查失败 - ${result.error}`)
      allPassed = false
    }
  }
  
  console.log('')
  
  // 测试 Authing 用户 ID 格式
  console.log('🧪 测试 Authing 用户 ID 格式:')
  const authingTest = await testAuthingUserId()
  
  if (authingTest.success) {
    console.log(`  ✅ ${authingTest.message}`)
  } else {
    console.log(`  ❌ Authing 用户 ID 测试失败: ${authingTest.error}`)
    allPassed = false
  }
  
  console.log('')
  
  // 总结
  if (allPassed) {
    console.log('🎉 数据库迁移验证通过！')
    console.log('')
    console.log('✅ 所有 user_id 列已正确更改为 VARCHAR(100)')
    console.log('✅ Authing 用户 ID 格式兼容性测试通过')
    console.log('✅ 数据库已准备好处理 Authing 用户认证')
    console.log('')
    console.log('🎯 下一步:')
    console.log('1. 在生产环境中配置 Netlify 环境变量')
    console.log('2. 测试用户注册和登录功能')
    console.log('3. 验证数据库操作正常工作')
  } else {
    console.log('⚠️  数据库迁移验证失败！')
    console.log('')
    console.log('请检查上述错误并重新执行迁移脚本。')
    console.log('迁移脚本位置: database_migration_fix_authing_userid.sql')
    console.log('执行地址: https://supabase.com/dashboard/project/weizkydylskcwgnaieqy/sql')
  }
}

// 运行验证
main().catch(error => {
  console.error('❌ 验证过程中发生错误:', error)
  process.exit(1)
})
