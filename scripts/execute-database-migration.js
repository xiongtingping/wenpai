#!/usr/bin/env node

/**
 * 执行数据库迁移脚本
 * 修复 Authing 用户 ID 格式问题
 */

import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Supabase 配置
const supabaseUrl = 'https://weizkydylskcwgnaieqy.supabase.co'
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndlaXpreWR5bHNrY3dnbmFpZXF5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTA1MjMzOSwiZXhwIjoyMDcwNjI4MzM5fQ.l5BvkhJttv0agpydb5lktK1Q4KvDaxQTNUb5-GMU14w'

// 创建 Supabase 客户端
const supabase = createClient(supabaseUrl, serviceRoleKey)

// 读取迁移脚本
function readMigrationScript() {
  const scriptPath = path.join(__dirname, '..', 'database_migration_fix_authing_userid.sql')
  if (!fs.existsSync(scriptPath)) {
    throw new Error(`迁移脚本不存在: ${scriptPath}`)
  }
  return fs.readFileSync(scriptPath, 'utf8')
}

// 执行单个 SQL 语句
async function executeSQLStatement(sql, description) {
  try {
    console.log(`  执行: ${description}`)
    
    // 使用 Supabase 的 rpc 功能执行 SQL
    const { data, error } = await supabase.rpc('exec_sql', { sql })
    
    if (error) {
      console.error(`    ❌ 失败: ${error.message}`)
      return false
    }
    
    console.log(`    ✅ 成功`)
    return true
  } catch (err) {
    console.error(`    ❌ 异常: ${err.message}`)
    return false
  }
}

// 检查表结构
async function checkTableStructure(tableName) {
  try {
    const { data, error } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type, character_maximum_length')
      .eq('table_name', tableName)
      .eq('column_name', 'user_id')
    
    if (error) {
      console.error(`检查表 ${tableName} 结构失败:`, error.message)
      return null
    }
    
    return data[0] || null
  } catch (err) {
    console.error(`检查表 ${tableName} 结构异常:`, err.message)
    return null
  }
}

// 备份数据（检查是否有数据需要备份）
async function checkDataExists() {
  const tables = [
    'user_profiles',
    'user_subscriptions', 
    'token_usage_records',
    'usage_count_records',
    'user_invite_relations',
    'user_invite_stats',
    'user_files',
    'user_notes',
    'user_brand_corpus',
    'user_library_items',
    'user_chat_history'
  ]
  
  console.log('🔍 检查现有数据...')
  
  for (const table of tables) {
    try {
      const { count, error } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true })
      
      if (error) {
        console.log(`  ⚠️  无法检查表 ${table}: ${error.message}`)
      } else {
        console.log(`  📊 ${table}: ${count || 0} 条记录`)
      }
    } catch (err) {
      console.log(`  ⚠️  检查表 ${table} 异常: ${err.message}`)
    }
  }
}

// 确认迁移操作
async function confirmMigration() {
  const readline = await import('readline')
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  })

  return new Promise((resolve) => {
    console.log('⚠️  警告：此操作将修改数据库结构！')
    console.log('📋 迁移内容：')
    console.log('  - 将所有 user_id 列从 UUID 改为 VARCHAR(100)')
    console.log('  - 移除对 auth.users 的外键约束')
    console.log('  - 重新创建必要的索引')
    console.log('')
    console.log('🎯 目的：修复 Authing 用户 ID 格式兼容性问题')
    console.log('')
    
    rl.question('确定要执行迁移吗？请输入 "MIGRATE" 确认: ', (answer) => {
      rl.close()
      resolve(answer === 'MIGRATE')
    })
  })
}

// 主函数
async function main() {
  console.log('🔄 数据库迁移工具 - 修复 Authing 用户 ID 格式')
  console.log(`📍 目标数据库: ${supabaseUrl}`)
  
  try {
    // 检查现有数据
    await checkDataExists()
    
    // 确认操作
    const confirmed = await confirmMigration()
    if (!confirmed) {
      console.log('❌ 迁移已取消')
      return
    }

    console.log('\n🚀 开始执行数据库迁移...')

    // 读取迁移脚本
    const migrationSQL = readMigrationScript()
    
    // 解析 SQL 语句
    const statements = migrationSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--') && !stmt.startsWith('\\d'))

    console.log(`📝 共 ${statements.length} 条 SQL 语句需要执行\n`)

    let successCount = 0
    let errorCount = 0

    // 逐条执行 SQL 语句
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i]
      if (statement) {
        const description = `语句 ${i + 1}/${statements.length}`
        const success = await executeSQLStatement(statement, description)
        
        if (success) {
          successCount++
        } else {
          errorCount++
        }
        
        // 短暂延迟，避免过快执行
        await new Promise(resolve => setTimeout(resolve, 100))
      }
    }

    console.log(`\n📊 迁移执行结果:`)
    console.log(`  ✅ 成功: ${successCount}`)
    console.log(`  ❌ 失败: ${errorCount}`)

    if (errorCount === 0) {
      console.log('\n🎉 数据库迁移完成！')
      
      // 验证迁移结果
      console.log('\n🔍 验证迁移结果...')
      const testTables = ['user_profiles', 'token_usage_records', 'user_subscriptions']
      
      for (const table of testTables) {
        const structure = await checkTableStructure(table)
        if (structure) {
          console.log(`  ✅ ${table}.user_id: ${structure.data_type}(${structure.character_maximum_length || 'N/A'})`)
        } else {
          console.log(`  ⚠️  无法验证 ${table} 结构`)
        }
      }
      
      console.log('\n🎯 下一步:')
      console.log('1. 更新应用代码中的类型定义')
      console.log('2. 测试 Authing 用户 ID 兼容性')
      console.log('3. 验证所有功能正常工作')
      
    } else {
      console.log('\n⚠️  迁移过程中出现错误，请检查失败的语句')
    }

  } catch (error) {
    console.error('\n❌ 迁移过程中发生错误:', error.message)
  }
}

// 运行迁移
main().catch(error => {
  console.error('❌ 未处理的错误:', error)
  process.exit(1)
})
